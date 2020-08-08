// This script shouldn't do anything without explicit user interaction (Triggering playback)
const browserCapabilities = require('./browserCapabilities');
const unlock = require('./webAudioUnlock');
const libbrstm = require('./libbrstm');
const { STREAMING_MIN_RESPONSE } = require('./configProvider');
const copyToChannelPolyfill = require('./copyToChannelPolyfill');
const gui = require('./gui');
import resampler from './resampler';
const powersOf2 = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768];
let hasInitialized = false;
let capabilities = null;
let audioContext = null;
let scriptNode = null;
let gainNode = null;
let fullyLoaded = true;
let loadState = 0;
let playbackCurrentSample = 0;
let brstm = null;
let brstmBuffer = null;
let paused = false;
let enableLoop = false;

function getResampledSample(sourceSr, targetSr, sample) {
    return Math.ceil((sample / sourceSr) * targetSr);
}

async function loadSongLegacy(url) {
    let resp = await fetch(url);
    let body = await resp.arrayBuffer();

    brstm = new libbrstm.Brstm(body);

    console.log(brstm._getMetadata());

    fullyLoaded = true;
    loadState = Number.MAX_SAFE_INTEGER;
}

function loadSongStreaming(url) {
    return new Promise(async (resolve, reject) => {
        let resp = await fetch(url);
        let reader = (await resp.body).getReader();
        brstmBuffer = new ArrayBuffer(parseInt(resp.headers.get("content-length")));
        let bufferView = new Uint8Array(brstmBuffer);
        let writeOffset = 0;
        let resolved = false;
        let brstmHeaderSize = 0;
        fullyLoaded = false;
        while(true) {
            let d = await reader.read();
            if (!d.done) {
                bufferView.set(d.value, writeOffset);
                writeOffset += d.value.length;
                loadState = writeOffset;
                
                // Read the file's header size from the file before passing the file to the BRSTM reader.
                if (brstmHeaderSize == 0 && writeOffset > 0x80) {
                    // Byte order. 0 = LE, 1 = BE.
                    let endian = 0;
                    // Read byte order mark. 0x04
                    let bom = (bufferView[0x04]*256 + bufferView[0x05]);
                    if (bom == 0xFEFF) {
                        endian = 1;
                    }
                    
                    // Read the audio offset. 0x70
                    if(endian == 1) {
                        brstmHeaderSize = (bufferView[0x70]*16777216 + bufferView[0x71]*65536 + bufferView[0x72]*256 + bufferView[0x73]);
                    } else {
                        brstmHeaderSize = (bufferView[0x70] + bufferView[0x71]*256 + bufferView[0x72]*65536 + bufferView[0x73]*16777216);
                    }
                    // If the offset in the file turned out to be 0 for some reason or seems to small,
                    // then fall back to the default minimum size, though the file is very likely to be invalid in this case.
                    if(brstmHeaderSize < 0x90) {
                        brstmHeaderSize = STREAMING_MIN_RESPONSE;
                    }
                    // Require 64 more bytes just to be safe.
                    brstmHeaderSize += 64;
                    
                    console.log('WO ' + writeOffset + '. LE ' + endian + '. File header size is ' + brstmHeaderSize + ' bytes'); //DEBUG
                }

                if (!resolved && brstmHeaderSize != 0 && writeOffset > brstmHeaderSize) {
                    console.log('Creating brstm object with ' + writeOffset + ' bytes of data'); //DEBUG
                    brstm = new libbrstm.Brstm(brstmBuffer);
                    resolve();
                    resolved = true;
                }
            } else {
                if (!resolved) {
                    console.log('Creating brstm object with all data'); //DEBUG
                    brstm = new libbrstm.Brstm(brstmBuffer);
                    resolve();
                    resolved = true;
                }
                fullyLoaded = true;
                console.log("Frog");
                break;
            }
        }
    });
}

async function startPlaying(url) {
    if (!hasInitialized) {
        capabilities = await browserCapabilities();
        hasInitialized = true;
    }

    if (fullyLoaded) {
        await (capabilities.streaming? loadSongStreaming : loadSongLegacy)(url);
    } else {
        return gui.alert("A song is still loading.");
    }

    if (audioContext) {
        await audioContext.close();
    }

    playbackCurrentSample = 0;
    paused = false;
    enableLoop = (brstm.metadata.loopFlag === 1)

    audioContext = new (window.AudioContext || window.webkitAudioContext)(capabilities.sampleRate ? {
        sampleRate: brstm.metadata.sampleRate
    } : {});

    await unlock(audioContext);
    console.log(audioContext);

    // Create all the stuff
    scriptNode = audioContext.createScriptProcessor(0, 0, 2);
    if (scriptNode.bufferSize > brstm.metadata.samplesPerBlock) {
        let highest = 256;
        for (let i = 0; i < powersOf2.length; i++) {
            if (powersOf2[i] < brstm.metadata.samplesPerBlock) {
                highest = powersOf2[i];
            } else {
                break;
            }
        }

        scriptNode = audioContext.createScriptProcessor(highest, 0, 2);
    }

    let bufferSize = scriptNode.bufferSize;
    bufferSize = capabilities.sampleRate ? bufferSize : getResampledSample(
        audioContext.sampleRate,
        brstm.metadata.sampleRate,
        bufferSize
    );
    let loadBufferSize = bufferSize;
    if (!capabilities.sampleRate) {
        loadBufferSize += 20;
    }
    scriptNode.onaudioprocess = function(audioProcessingEvent) {
        let outputBuffer = audioProcessingEvent.outputBuffer;
        if (!outputBuffer.copyToChannel)
            outputBuffer.copyToChannel = copyToChannelPolyfill;

        if (paused) {
            outputBuffer.copyToChannel(new Float32Array(scriptNode.bufferSize).fill(0), 0);
            outputBuffer.copyToChannel(new Float32Array(scriptNode.bufferSize).fill(0), 1);
            return;
        }
        let samples;
        if ((playbackCurrentSample + loadBufferSize) < brstm.metadata.totalSamples) {
            samples = brstm.getSamples(
                playbackCurrentSample,
                loadBufferSize
            );

            playbackCurrentSample += bufferSize;
        } else {
            if (enableLoop) {
                samples = brstm.getSamples(
                    playbackCurrentSample,
                    (brstm.metadata.totalSamples - playbackCurrentSample)
                );

                let postLoopSamples = brstm.getSamples(
                    brstm.metadata.loopStartSample,
                    (bufferSize - samples[0].length)
                );
                for (let i = 0; i < samples.length; i++) {
                    let buf = new Int16Array(bufferSize).fill(0);
                    buf.set(samples[i]);
                    buf.set(postLoopSamples[i], samples[i].length);
                    samples[i] = buf;
                }
                playbackCurrentSample = brstm.metadata.loopStartSample + postLoopSamples[0].length;
            } else {
                samples = brstm.getSamples(
                    playbackCurrentSample,
                    (brstm.metadata.totalSamples - playbackCurrentSample - 1)
                );

                for (let i = 0; i < samples.length; i++) {
                    let buf = new Int16Array(bufferSize).fill(0);
                    buf.set(samples[i]);
                    samples[i] = buf;
                }

                playbackCurrentSample = 0;
                paused = true;
            }
        }


        if (samples.length > 2) {
            samples = [samples[0], samples[1]];
        }
        if (samples.length === 1) {
            samples = [samples[0], samples[0]];
        }

        for (let i = 0; i < samples.length; i++) {
            let chan = new Float32Array(loadBufferSize);
            for (let sid = 0; sid < loadBufferSize; sid++) {
                chan[sid] = samples[i][sid] / 32768;
            }

            if (!capabilities.sampleRate) {
                let zresampler = new resampler(brstm.metadata.sampleRate, audioContext.sampleRate, 1, chan);
                zresampler.resampler(loadBufferSize);
                chan = zresampler.outputBuffer;
                if (chan.length > scriptNode.bufferSize) {
                    chan = chan.slice(0, scriptNode.bufferSize);
                }
            }

            outputBuffer.copyToChannel(chan, i);
        }
    }

    gainNode = audioContext.createGain();
    scriptNode.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.setValueAtTime((localStorage.getItem("volumeoverride") || 1), audioContext.currentTime);
}

window.player = {
    play: startPlaying,
    api: {
        pause: function() { paused = !paused; }
    }
}
