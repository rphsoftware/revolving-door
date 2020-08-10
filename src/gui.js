let h = 0;

let state = {
    position: 0,
    samples: 1e6,
    loaded: 5e5,
    volume: 1,
    paused: false,

    ready: false,
    buffering: false,
    sampleRate: 4.8e4,
    looping: false
};

let api = {};

let volumeCtx = null;
let barCtx = null;
let guiElement = null;
let lastY = -30;

function hEvent(a) {
    if (a.type !== "click") { try { a.preventDefault(); } catch(e) {} }
    if (a.type === "touchmove" || a.type === "touchstart") {
        if (a.targetTouches.length > 0) {
            let box = a.targetTouches[0].target.getBoundingClientRect();
            let pos = (a.targetTouches[0].clientY + a.targetTouches[0].radiusY) - box.top;
            console.log(pos, a.targetTouches[0].clientY, a.targetTouches[0].radiusY, box.top);
            if (pos < 5) pos = 0;
            if (pos > 80) pos = 84;

            let volume = 1 - (pos / 84);
            state.volume = volume;
            api.setVolume(volume);
            module.exports.guiUpdate();
            localStorage.setItem("volumeoverride", volume);
        }
    }
    if (a.type === "click" || a.type === "mousemove") {
        if (a.type === "mousemove") {
            if (a.buttons !== 1) return;
        }
        let box = a.target.getBoundingClientRect();
        let pos = (a.clientY) - box.top;
        if (pos < 5) pos = 0;
        if (pos > 80) pos = 84;

        let volume = 1 - (pos / 84);
        state.volume = volume;
        api.setVolume(volume);
        module.exports.guiUpdate();
        localStorage.setItem("volumeoverride", volume);
    }
}

function hsEvent(a) {
    if (a.type !== "click") { try { a.preventDefault(); } catch(e) {} }
    if (a.type === "touchmove" || a.type === "touchstart") {
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
                api.seek(posi);
            }

            module.exports.guiUpdate();
        }
    }
    if (a.type === "click" || a.type === "mousemove") {
        if (a.type === "mousemove") {
            if (a.buttons !== 1) return;
        }
        let box = a.target.getBoundingClientRect();
        let pos = (a.clientX) - box.left;

        if (pos < 5) pos = 0;
        if (pos > 254) pos = 254;

        pos = Math.round(pos);
        if (pos === lastY) return;
        lastY = pos;

        let posi = state.samples * (pos / 254);
        if (posi < state.loaded) {
            api.seek(posi);
        }

        module.exports.guiUpdate();
    }
}

module.exports.alert = function(text) {
    let box = document.createElement("div");
    box.innerHTML = `<div style="text-align: center; display: flex; align-items: center; justify-content: center; font-family: sans-serif; background-color: #666; color: white; position: fixed; bottom: ${h + 20}px; left: 20px; height: 75px; width: 300px">
${text}
</div>`;
    h += 100;

    setTimeout(function() {
        box.remove();
        h -= 100;
    }, 1e4);

    document.body.appendChild(box);
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
    <canvas id="pl-volume" width="16" height="84"></canvas>
    <div id="pl-timing">
        <span id="pl-time-start">0:00</span>
        <span id="pl-time-end"  >0:00</span>
    </div>
    <canvas id="pl-seek" width="254" height="16"></canvas>
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

    document.querySelector("#pl-volume").addEventListener("click", hEvent);
    document.querySelector("#pl-volume").addEventListener("mousemove", hEvent);
    document.querySelector("#pl-volume").addEventListener("touchstart",hEvent);
    document.querySelector("#pl-volume").addEventListener("touchend", hEvent);
    document.querySelector("#pl-volume").addEventListener("touchmove", hEvent);

    document.querySelector("#pl-seek").addEventListener("click", hsEvent);
    document.querySelector("#pl-seek").addEventListener("mousemove", hsEvent);
    document.querySelector("#pl-seek").addEventListener("touchstart",hsEvent);
    document.querySelector("#pl-seek").addEventListener("touchend", hsEvent);
    document.querySelector("#pl-seek").addEventListener("touchmove", hsEvent);

    document.querySelector("#pl-pause-play").addEventListener("click", function() {
        api.pause();
        module.exports.guiUpdate();
    });

    document.querySelector("#pl-loop-box").addEventListener("input", function() {
        state.looping = document.querySelector("#pl-loop-box").checked;
        api.setLoop(state.looping);
    })
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

module.exports.guiUpdate = function() {
    if (guiElement) {
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
        if (vol !== lastVolume) {
            volumeCtx.fillStyle = "#444";
            volumeCtx.fillRect(0, 0, 16, 84);

            volumeCtx.fillStyle = "hsl(200, 85%, 55%)";
            volumeCtx.fillRect(0, vol, 16, 84);

            lastVolume = vol;
        }

        let pos = Math.ceil(((state.position / state.samples) * 254));
        let loaded = Math.ceil(((state.loaded / state.samples) * 254));
        if ((pos !== lastPosition) || (loaded !== lastLoaded)) {
            console.log("Updated bar...", pos, loaded);
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