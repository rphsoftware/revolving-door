// This script shouldn't do anything without explicit user interaction (Triggering playback)
const browserCapabilities = require('./browserCapabilities');
window["initializePlayer"] = async function(url) {
    // Check browser capabilities
    console.time("capability");
    console.log(await browserCapabilities());
    console.timeEnd("capability");

    let z = new Uint8Array(2**28);
    z.fill(255);

    let zz = new Uint8Array(2**28);

    console.time("Copy");
    zz.set(z, 0);
    console.timeEnd("Copy");
}