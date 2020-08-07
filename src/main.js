// This script shouldn't do anything without explicit user interaction (Triggering playback)
require("regenerator-runtime/runtime");
const browserCapabilities = require('./browserCapabilities');
const unlock = require('./webAudioUnlock');
const libbrstm = require('brstm');
let hasInitialized = false;
let capabilities = null;
let audioContext = null;
let scriptNode = null;
let gainNode = null;
let fullyLoaded = null;
let loadState = 0;
let playbackCurrentSample = 0;
let brstm = null;
let brstmBuffer = null;

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
        fullyLoaded = false;
        while(true) {
            let d = await reader.read();
            if (!d.done) {
                bufferView.set(d.value, writeOffset);
                writeOffset += d.value.length;
                loadState = writeOffset;

                if (!resolved && writeOffset > 2**19) {
                    brstm = new libbrstm.Brstm(brstmBuffer);
                    resolve();
                }
            } else {
                if (!resolved) {
                    brstm = new libbrstm.Brstm(brstmBuffer);
                    resolve();
                }
                fullyLoaded = true;
                break;
            }
        }
    });
}

async function startPlaying(url) {
    if (!hasInitialized) {
        capabilities = await browserCapabilities();
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        await unlock(audioContext);
    }

    await loadSongStreaming(url);

    setInterval(function() {
        console.log(loadState);
    }, 100);
}

window["initializePlayer"] = async function(url) {
    // Check browser capabilities
    console.time("capability");
    console.log(await browserCapabilities());
    console.timeEnd("capability");


}

window.player = {
    play: startPlaying
}