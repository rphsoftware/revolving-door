const ge = require('./gestureEngine');

let state = {
    position: 0,
    samples: 1e6,
    loaded: 5e5,
    volume: 1,
    paused: false,

    ready: false,
    buffering: false,
    sampleRate: 4.8e4,
    looping: false,
    streamingDied: false
};

let overrides = {
    volume: null,
    position: null
}

let api = {};

let volumeCtx = null;
let barCtx = null;
let guiElement = null;
let lastY = -30;

function hEvent(a) {
    try { a.preventDefault(); } catch(e) {}
    if (a.targetTouches.length > 0) {
        let box = a.targetTouches[0].target.getBoundingClientRect();
        let pos = (a.targetTouches[0].clientY + a.targetTouches[0].radiusY) - box.top;
        if (pos < 5) pos = 0;
        if (pos > 80) pos = 84;

        let volume = 1 - (pos / 84);
        overrides.volume = volume;
        if (a.type === "touchend") {
            state.volume = overrides.volume;
            api.setVolume(overrides.volume);
            overrides.volume = null;
            localStorage.setItem("volumeoverride", volume);
        }
        module.exports.guiUpdate();
    } else {
        if (a.type === "touchend") {
            state.volume = overrides.volume;
            api.setVolume(overrides.volume);
            overrides.volume = null;
        }
    }
}

function hsEvent(a) {
    try { a.preventDefault(); } catch(e) {}
    if (a.targetTouches.length > 0) {
        let box = a.targetTouches[0].target.getBoundingClientRect();
        let pos = (a.targetTouches[0].clientX + a.targetTouches[0].radiusX) - box.left;

        if (pos < 5) pos = 0;
        if (pos > 254) pos = 254;

        pos = Math.round(pos);
        if (pos === lastY) return;
        lastY = pos;

        let posi = state.samples * (pos / 254);
        if (posi < state.loaded) {
            overrides.position = posi;
        }

        if (a.type === "touchend") {
            api.seek(overrides.position);
            overrides.position = null;
        }

        module.exports.guiUpdate();
    } else {
        if (a.type === "touchend") {
            api.seek(overrides.position);
            overrides.position = null;
        }
    }
}

function seekOp(x, y) {
    let pos = Math.round(x);
    let posi = state.samples * (pos / 254);
    if (posi < state.loaded) {
        overrides.position = posi;
    }
    module.exports.guiUpdate();
}

function seekFin(x, y) {
    let pos = Math.round(x);
    let posi = state.samples * (pos / 254);
    if (posi < state.loaded) {
        overrides.position = posi;
    }
    api.seek(posi);
    overrides.position = null;
    module.exports.guiUpdate();
}

function volOp(x, y) {
    y = Math.round(y);
    overrides.volume = 1 - (y / 84);
    module.exports.guiUpdate();
}

function volFin(x, y) {
    y = Math.round(y);
    let volume = 1 - (y / 84);
    overrides.volume = null;
    localStorage.setItem("volumeoverride", volume);
    api.setVolume(volume);
    module.exports.guiUpdate();
}

module.exports.updateState = function(newState) {
    Object.assign(state, newState);
};

module.exports.runGUI = function(a) {
    api = a;
    // Creating GUI
    guiElement = document.createElement("div");
    guiElement.classList.add("guiholder");
    guiElement.innerHTML = `
<div class="error" style="display: none">
    <h3>Playback failed!</h3>
    <h3>Check your internet and play again.</h3>
    <h3>If this issue continues, contact us.</h3>
</div>
<div id="gui-loading-bar">
    <div id="gui-inner-loading-bar"></div>
</div>
<div class="guistate" data-guistate="preload">
    <h3>Loading song...</h3>
</div>
<div class="guistate" data-guistate="ready">
    <div id="pl-pause-play">
        <svg width="48" height="48" viewBox="0 0 48 48" id="pl-play">
            <path d="M 10, 10 l 0, 28 l 28, -14" fill="white"></path>
        </svg>
        <svg width="48" height="48" viewBox="0 0 48 48" id="pl-pause" style="display: none;">
            <path d="M 10, 10 l 0, 28 l 10, 0 l 0, -28 M 28, 10 l 0, 28 l 10, 0 l 0, -28" fill="white"></path>
        </svg>
    </div>
    <canvas id="pl-volume" width="16" height="84" data-gesture-hitzone="volume"></canvas>
    <div id="pl-timing">
        <span id="pl-time-start">0:00</span>
        <span id="pl-time-end"  >0:00</span>
    </div>
    <canvas id="pl-seek" width="254" height="16" data-gesture-hitzone="seek"></canvas>
    <div id="pl-loop">
        <input type="checkbox" id="pl-loop-box" style="width: 16px; height: 16px; margin: 0;">
        <span class="pl-loop-text">Enable loop</span>
        <a class="pl-loop-text" target="_blank" href="https://smashcustommusic.net/feedback/">Send feedback</a>
        <a class="pl-loop-text" target="_blank" href="https://github.com/rphsoftware/revolving-door">v2 by Rph</a>
    </div>
</div>`

    document.body.appendChild(guiElement);

    volumeCtx = document.querySelector("#pl-volume").getContext("2d");
    barCtx = document.querySelector("#pl-seek").getContext("2d");

    document.querySelector("#pl-volume").addEventListener("touchstart",hEvent);
    document.querySelector("#pl-volume").addEventListener("touchmove", hEvent);
    document.querySelector("#pl-volume").addEventListener("touchend", hEvent);

    document.querySelector("#pl-seek").addEventListener("touchstart",hsEvent);
    document.querySelector("#pl-seek").addEventListener("touchmove", hsEvent);
    document.querySelector("#pl-seek").addEventListener("touchend", hsEvent);

    document.querySelector("#pl-pause-play").addEventListener("click", function() {
        api.pause();
        module.exports.guiUpdate();
    });

    document.querySelector("#pl-loop-box").addEventListener("input", function() {
        state.looping = document.querySelector("#pl-loop-box").checked;
        api.setLoop(state.looping);
    });

    guiElement.addEventListener("drag", function(e) { e.preventDefault(); });

    ge.runGestureEngine();

    ge.registerOpEvent("seek", seekOp);
    ge.registerFinEvent("seek", seekFin);
    ge.registerOpEvent("volume", volOp);
    ge.registerFinEvent("volume", volFin);
};

let lastShowLoading = null;
let lastReady = null;
let lastVolume = -1;
let lastPosition = -1;
let lastPaused = null;
let lastLength = -1;
let lastPositionS = -1;
let lastLooping = null;
let lastLoaded = -1;
let lastStreamState = null;

module.exports.guiUpdate = function() {
    if (guiElement) {
        if (lastStreamState !== state.streamingDied) {
            guiElement.querySelector(".error").style.display = state.streamingDied ? "flex":"none";
            lastStreamState = state.streamingDied;
        }
        let showLoading = (state.buffering || !state.ready);
        if (lastShowLoading !== showLoading) {
            guiElement.querySelector("#gui-loading-bar").dataset.exists = showLoading;

            lastShowLoading = showLoading;
        }

        if (lastReady !== state.ready) {
            guiElement.querySelector(".guistate[data-guistate=\"preload\"]").style.display = state.ready ? "none" : "block";
            guiElement.querySelector(".guistate[data-guistate=\"ready\"]").style.display = !state.ready ? "none" : "grid";
            lastReady = state.ready;
        }

        if (!state.ready) return;

        let vol = Math.round(84 - (84 * state.volume));
        if (overrides.volume !== null) {
            vol = Math.round(84 - (84 * overrides.volume));
        }
        if (vol !== lastVolume) {
            volumeCtx.fillStyle = "#444";
            volumeCtx.fillRect(0, 0, 16, 84);

            volumeCtx.fillStyle = "hsl(200, 85%, 55%)";
            volumeCtx.fillRect(0, vol, 16, 84);

            lastVolume = vol;
        }

        let pos = Math.ceil(((state.position / state.samples) * 254));
        if (overrides.position !== null) {
            pos = Math.ceil(((overrides.position / state.samples) * 254));
        }
        let loaded = Math.ceil(((state.loaded / state.samples) * 254));
        if ((pos !== lastPosition) || (loaded !== lastLoaded)) {
            barCtx.fillStyle = "#222";
            barCtx.fillRect(0, 0, 254, 16);

            barCtx.fillStyle = "#666";
            barCtx.fillRect(0, 0, Math.min(254, loaded), 16);

            barCtx.fillStyle = "hsl(200, 85%, 55%)";
            barCtx.fillRect(0, 0, Math.min(254, pos), 16);

            lastPosition = pos;
            lastLoaded = loaded;
        }

        if (lastPaused !== state.paused) {
            guiElement.querySelector("#pl-pause").style.display = state.paused ? "none" : "block";
            guiElement.querySelector("#pl-play").style.display = !state.paused ? "none" : "block";
            lastPaused = state.paused;
        }

        // Seconds in song
        let secondsInSong =    Math.floor(state.samples / state.sampleRate);
        let playbackSeconds = Math.floor(state.position / state.sampleRate);
        if (overrides.position !== null) {
            playbackSeconds = Math.floor(overrides.position / state.sampleRate);
        }

        if (secondsInSong !== lastLength) {
            guiElement.querySelector("#pl-time-end").innerText = `${Math.floor(secondsInSong / 60)}:${(secondsInSong % 60).toString().padStart(2, "0")}`;
            lastLength = secondsInSong;
        }

        if (playbackSeconds !== lastPositionS) {
            guiElement.querySelector("#pl-time-start").innerText = `${Math.floor(playbackSeconds / 60)}:${(playbackSeconds % 60).toString().padStart(2, "0")}`;
            lastPositionS = playbackSeconds;
        }

        if (lastLooping !== state.looping) {
            guiElement.querySelector("#pl-loop-box").checked = state.looping;
            lastLooping = state.looping;
        }
    }
}