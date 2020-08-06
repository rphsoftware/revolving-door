// This script shouldn't do anything without explicit user interaction (Triggering playback)
require("regenerator-runtime/runtime");
const browserCapabilities = require('./browserCapabilities');
const unlock = require('./webAudioUnlock');
let hasInitialized = false;
let capabilities = null;
let audioContext = null;
let scriptNode = null;
let gainNode = null;

async function startPlaying(url) {
    if (!hasInitialized) {
        capabilities = await browserCapabilities();
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        unlock(audioContext);
    }
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