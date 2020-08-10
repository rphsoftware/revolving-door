let h = 0;

let state = {
    position: 0,
    samples: 1e6,
    loaded: 5e5,
    volume: 1,
    paused: false,

    ready: false,
    buffering: false
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
    <div id="pl-pause-play"></div>
    <canvas id="pl-volume" width="16" height="84"></canvas>
    <div id="pl-timing"></div>
    <canvas id="pl-seek" width="254" height="16"></canvas>
    <div id="pl-loop"></div>
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
};

module.exports.guiUpdate = function() {
    if (guiElement) {
        let showLoading = (state.buffering || !state.ready);
        if (showLoading)
            guiElement.querySelector("#gui-loading-bar").style.visibility = "visible";
        else
            guiElement.querySelector("#gui-loading-bar").style.visibility = "hidden";

        guiElement.querySelector(".guistate[data-guistate=\"preload\"]").style.display = state.ready ? "none" : "block";
        guiElement.querySelector(".guistate[data-guistate=\"ready\"]").style.display = !state.ready ? "none" : "grid";

        volumeCtx.fillStyle = "#444";
        volumeCtx.fillRect(0, 0, 16, 84);

        volumeCtx.fillStyle = "hsl(200, 85%, 55%)";
        volumeCtx.fillRect(0, (84 - (84 * state.volume)), 16, 84);

        barCtx.fillStyle = "#222";
        barCtx.fillRect(0, 0, 254, 16);

        barCtx.fillStyle = "#666";
        barCtx.fillRect(0, 0, Math.min(254, Math.ceil(((state.loaded / state.samples) * 254))), 16);

        barCtx.fillStyle = "hsl(200, 85%, 55%)";
        barCtx.fillRect(0, 0, Math.min(254, Math.ceil(((state.position / state.samples) * 254))), 16);
    }
}