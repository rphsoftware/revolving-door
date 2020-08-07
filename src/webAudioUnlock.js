module.exports = function(ac) {
    return new Promise(async function(resolve) {
        try {
            await ac.resume();
        } catch(e) {}
        let unlockWrapper = document.createElement("div");
        unlockWrapper.style = `background: #888a; z-index: 88888; position: fixed; top: 0; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: center;`
        let unlockPrompt = document.createElement("div");
        unlockPrompt.style = `display: flex; align-items: center; justify-content: center; flex-direction: column`;
        unlockPrompt.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" version="1.0"  width="200" height="200" viewBox="0 0 75 75">
<path d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
style="stroke:#fff;stroke-width:5;stroke-linejoin:round;fill:#fff;"
/>
<path d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6" style="fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round"/>
</svg><h1 style="font-family: sans-serif; color: white; margin: 0;">Tap or click anywhere to enable audio.</h1>`;

        unlockWrapper.appendChild(unlockPrompt);

        document.body.appendChild(unlockWrapper);

        unlockWrapper.addEventListener("touchend", async function() {
            await ac.resume();
            if (ac.state === "running") {
                resolve();
                unlockWrapper.remove();
            }
        });

        unlockWrapper.addEventListener("click", async function() {
            await ac.resume();
            if (ac.state === "running") {
                resolve();
                unlockWrapper.remove();
            }
        });

        if (ac.state === "running") {
            resolve();
            unlockWrapper.remove();
        }
    });
}