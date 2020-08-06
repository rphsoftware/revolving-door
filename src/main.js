// This script shouldn't do anything without explicit user interaction (Triggering playback)
const browserCapabilities = require('./browserCapabilities');
window["initializePlayer"] = async function(url) {
    // Check browser capabilities
    console.time("capability");
    console.log(await browserCapabilities());
    console.timeEnd("capability");
}