(function () {
    'use strict';

    var browserCapabilities = async function() {
        let capabilities = {
            sampleRate: false,
            streaming: false
        };

        // Evaluate webaudio
        try {
            let ctx = new (window.AudioContext||window.webkitAudioContext)({
                sampleRate: 8000
            });

            capabilities.sampleRate = (ctx.sampleRate === 8000);
            ctx.close().then(() => console.log("Closed capability detection audio context."));
        } catch(e) {
            console.log("WebAudio sample rate capability detection failed. Assuming fallback.");
        }

        // Evaluate streaming
        try {
            let b = new Uint8Array(2**16);

            let blob = new Blob([b], {type:"application/octet-stream"});
            let u = URL.createObjectURL(blob);
            let resp = await fetch(u);
            let body = await resp.body;
            const reader = body.getReader();

            while (true) {
                let d = await reader.read();
                if (d.done) {
                    break;
                }
            }
            capabilities.streaming = true;
        } catch(e) {
            console.log("Streaming capability detection failed. Assuming fallback.");
        }
        
        // Check for Chrome 89
        // https://stackoverflow.com/a/4900484
        // https://github.com/rphsoftware/revolving-door/issues/10
        // To Rph: Remove this chunk of code if you manage to implement a proper fix before the heat death of the universe.
        var raw = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
        var chromeVersion = (raw ? parseInt(raw[2], 10) : false);
        
        if(chromeVersion !== false && chromeVersion >= 89) {
            //Disable native resampling
            capabilities.sampleRate = false;
            
            console.log('Chrome 89 or newer detected, using audio code workarounds.');
        }

        return capabilities;
    };

    var webAudioUnlock = function(ac) {
        return new Promise(async function(resolve) {
            let alreadyremoved = false;
            let unlockWrapper = document.createElement("div");
            unlockWrapper.style = `background: #888a; z-index: 88888; position: fixed; top: 0; bottom: 0; left: 0; right: 0; display: flex; align-items: center; justify-content: center;`;
            let unlockPrompt = document.createElement("div");
            unlockPrompt.style = `display: flex; align-items: center; justify-content: center; flex-direction: column`;
            unlockPrompt.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" version="1.0"  width="200" height="200" viewBox="0 0 75 75">
<path d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
style="stroke:#fff;stroke-width:5;stroke-linejoin:round;fill:#fff;"
/>
<path d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6" style="fill:none;stroke:#fff;stroke-width:5;stroke-linecap:round"/>
</svg><h1 style="font-family: sans-serif; color: white; margin: 0;">Tap or click anywhere to enable audio.</h1>`;

            unlockWrapper.appendChild(unlockPrompt);

            setTimeout(function() {
                if (!alreadyremoved)
                    document.body.appendChild(unlockWrapper);
            }, 200);


            ac.onstatechange = function() {
                if (ac.state == "running") {
                    resolve();
                    unlockWrapper.remove();
                    alreadyremoved = true;
                }
            };

            try {
                ac.resume();
            } catch(e) {
                console.error(e);
            }

            unlockWrapper.addEventListener("touchend", async function() {
                await ac.resume();
                if (ac.state === "running") {
                    resolve();
                    unlockWrapper.remove();
                    alreadyremoved = true;
                }
            });

            unlockWrapper.addEventListener("click", async function() {
                await ac.resume();
                if (ac.state === "running") {
                    resolve();
                    unlockWrapper.remove();
                    alreadyremoved = true;
                }
            });

            if (ac.state === "running") {
                resolve();
                unlockWrapper.remove();
                alreadyremoved = true;
            }
        });
    };

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    var brstm$1 = createCommonjsModule(function (module, exports) {
    var q=(r,t,s)=>{if(!t.has(r))throw TypeError("Cannot "+s)};var e=(r,t,s)=>(q(r,t,"read from private field"),s?s.call(r):t.get(r)),S=(r,t,s)=>{if(t.has(r))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(r):t.set(r,s);},B=(r,t,s,h)=>(q(r,t,"write to private field"),t.set(r,s),s);var C=(r,t,s)=>(q(r,t,"access private method"),s);Object.defineProperties(exports,{__esModule:{value:true},[Symbol.toStringTag]:{value:"Module"}});function Q(r,t,s){const h=[];for(let i=t;i<t+s;i++)h.push(r[i]);return h}const R={LITTLE:0,BIG:1};function at(r){const t=Q(r,4,2);return t[0]===255&&t[1]===254?R.LITTLE:R.BIG}function nt(r,t,s,h=R.BIG){const i=Q(r,t,s);return h===R.LITTLE&&i.reverse(),String.fromCharCode(...i)}function a(r,t,s,h=R.BIG){const i=Q(r,t,s);return h===R.LITTLE&&i.reverse(),i.reduce((l,n)=>l*256+n,0)}function J(r,t,s){return r<=t?t:r>=s?s:r}function b(r){return r>=32768?r-65536:r}var T,w,g,z,A,L,E,P,M,x,F,Y,G,Z,N,$,O,tt,H,K;class it{constructor(t){S(this,F);S(this,G);S(this,N);S(this,O);S(this,H);S(this,T,void 0);S(this,w,void 0);S(this,g,void 0);S(this,z,void 0);S(this,A,void 0);S(this,L,void 0);S(this,E,void 0);S(this,P,void 0);S(this,M,void 0);S(this,x,void 0);if(B(this,E,null),B(this,P,null),B(this,M,null),B(this,x,[]),this.rawData=new Uint8Array(t),nt(this.rawData,0,4)!=="RSTM")throw new Error("Not a valid BRSTM file");this.endianness=at(this.rawData),B(this,T,a(this.rawData,16,4,this.endianness)),B(this,w,e(this,T)+a(this.rawData,e(this,T)+12,4,this.endianness)+8),B(this,g,e(this,T)+a(this.rawData,e(this,T)+20,4,this.endianness)+8),B(this,z,e(this,T)+a(this.rawData,e(this,T)+28,4,this.endianness)+8),B(this,A,a(this.rawData,24,4,this.endianness)),B(this,L,a(this.rawData,32,4,this.endianness)),this.metadata=C(this,G,Z).call(this);}getAllSamples(){if(e(this,E))return e(this,E);const{numberChannels:t,totalSamples:s,totalBlocks:h,samplesPerBlock:i}=this.metadata,l=[];for(let n=0;n<t;n++)l.push(new Int16Array(s));for(let n=0;n<h;n++){const d=C(this,H,K).call(this,n);for(let p=0;p<t;p++)l[p].set(d[p],n*i);}return B(this,E,l),l}getBuffer(t,s){return this.getSamples(t,s)}getSamples(t,s){const{numberChannels:h,totalBlocks:i,totalSamples:l,samplesPerBlock:n}=this.metadata,d=Math.max(0,t),p=Math.min(l,t+s),o=Math.max(0,Math.floor(d/n)),f=Math.min(i-1,Math.floor(p/n)),D=[];for(let m=o;m<=f;m++)D.push(C(this,H,K).call(this,m));const u=[];for(let m=0;m<h;m++)u.push(new Int16Array(p-d));for(let m=o;m<=f;m++){const I=m-o;if(m===o&&m===f)for(let c=0;c<h;c++)u[c].set(D[I][c].slice(d-o*n,d-o*n+s),0);else if(m===o)for(let c=0;c<h;c++){const k=D[I][c].slice(d-o*n);u[c].set(k,0);}else if(m===f)for(let c=0;c<h;c++){const k=D[I][c].slice(0,p-D[I][c].length-o*n);k.length+(m*n-d)>u[c].length?u[c].set(k.slice(0,s-(m*n-d)),m*n-d):u[c].set(k,m*n-d);}else for(let c=0;c<h;c++)u[c].set(D[I][c],m*n-d);}return u}}T=new WeakMap,w=new WeakMap,g=new WeakMap,z=new WeakMap,A=new WeakMap,L=new WeakMap,E=new WeakMap,P=new WeakMap,M=new WeakMap,x=new WeakMap,F=new WeakSet,Y=function(){if(e(this,M))return e(this,M);const{numberChannels:t}=this.metadata,s=[];for(let h=0;h<t;h++){const i=e(this,T)+a(this.rawData,e(this,z)+8+h*8,4,this.endianness)+8+8,l=[];for(let n=0;n<16;n++){const d=a(this.rawData,i+2*n,2,this.endianness);l.push(b(d));}s.push({adpcmCoefficients:l,gain:a(this.rawData,i+40,2,this.endianness),initialPredictorScale:a(this.rawData,i+42,2,this.endianness),historySample1:a(this.rawData,i+44,2,this.endianness),historySample2:a(this.rawData,i+46,2,this.endianness),loopPredictorScale:a(this.rawData,i+48,2,this.endianness),loopHistorySample1:a(this.rawData,i+50,2,this.endianness),loopHistorySample2:a(this.rawData,i+52,2,this.endianness)});}return B(this,M,s),s},G=new WeakSet,Z=function(){const t=a(this.rawData,e(this,w)+2,1,this.endianness),s=a(this.rawData,e(this,g),1,this.endianness),h=a(this.rawData,e(this,g)+1,1,this.endianness),i=[];for(let n=0;n<s;n++){const d=e(this,T)+8+a(this.rawData,e(this,g)+4+n*8+4,4,this.endianness),p=a(this.rawData,e(this,g)+4+n*8+1,1,this.endianness);let o=0;p===0?o=a(this.rawData,d,1,this.endianness):p===1&&(o=a(this.rawData,d+8,1,this.endianness)),i.push({numberChannels:o,type:p});}const l={fileSize:a(this.rawData,8,4,this.endianness),endianness:this.endianness,codec:a(this.rawData,e(this,w),1,this.endianness),loopFlag:a(this.rawData,e(this,w)+1,1,this.endianness),numberChannels:t,sampleRate:a(this.rawData,e(this,w)+4,2,this.endianness),loopStartSample:a(this.rawData,e(this,w)+8,4,this.endianness),totalSamples:a(this.rawData,e(this,w)+12,4,this.endianness),totalBlocks:a(this.rawData,e(this,w)+20,4,this.endianness),blockSize:a(this.rawData,e(this,w)+24,4,this.endianness),samplesPerBlock:a(this.rawData,e(this,w)+28,4,this.endianness),finalBlockSize:a(this.rawData,e(this,w)+32,4,this.endianness),finalBlockSizeWithPadding:a(this.rawData,e(this,w)+40,4,this.endianness),totalSamplesInFinalBlock:a(this.rawData,e(this,w)+36,4,this.endianness),adpcTableSamplesPerEntry:a(this.rawData,e(this,w)+44,4,this.endianness),adpcTableBytesPerEntry:a(this.rawData,e(this,w)+48,4,this.endianness),numberTracks:s,trackDescriptionType:h,trackDescriptions:i};return l.loopStartSample>=l.totalSamples&&(l.loopFlag=0,l.loopStartSample=0,console.warn("The loop start sample in this file is invalid.")),l},N=new WeakSet,$=function(t){const{blockSize:s,totalBlocks:h,numberChannels:i,finalBlockSize:l,finalBlockSizeWithPadding:n}=this.metadata,d=[];for(let o=0;o<i;o++)d.push(new Uint8Array(t===h-1?l:s));let p=t;for(let o=0;o<i;o++){const f=o!==0&&p+1===h?p*i*s+o*n:(p*i+o)*s,D=p+1===h?f+l:f+s,u=this.rawData.slice(e(this,L)+32+f,e(this,L)+32+D);d[o].set(u);}return d},O=new WeakSet,tt=function(){if(e(this,P))return e(this,P);const{totalBlocks:t,numberChannels:s}=this.metadata,h=a(this.rawData,e(this,A)+4,4,this.endianness),i=this.rawData.slice(e(this,A)+8,e(this,A)+8+h);let l=0,n=0,d=0;for(let f=0;f<s;f++)n=b(a(i,l,2,this.endianness)),l+=2,d=b(a(i,l,2,this.endianness)),l+=2;const p=[];for(let f=0;f<t;f++){p.push([]);for(let D=0;D<s;D++)f>0&&(n=b(a(i,l,2,this.endianness)),l+=2,d=b(a(i,l,2,this.endianness)),l+=2),p[f].push({yn1:n,yn2:d});}let o=[];for(let f=0;f<s;f++)o.push(p.map(D=>D[f]));return B(this,P,o),o},H=new WeakSet,K=function(t){if(e(this,x)[t])return e(this,x)[t];const{numberChannels:s,totalBlocks:h,totalSamplesInFinalBlock:i,samplesPerBlock:l,codec:n}=this.metadata,d=C(this,F,Y).call(this),p=C(this,N,$).call(this,t),o=C(this,O,tt).call(this),f=[],D=t===h-1?i:l;for(let u=0;u<s;u++)f.push(new Int16Array(D));for(let u=0;u<s;u++){const{adpcmCoefficients:m}=d[u],I=p[u],c=[];if(n===2){const k=I[0],{yn1:U,yn2:st}=o[u][t];let W=k,v=U,V=st,_=0;for(let j=0;j<D;){let y=0;j%14===0&&(W=I[_++]),(j++&1)===0?y=I[_]>>4:y=I[_++]&15,y>=8&&(y-=16);const et=1<<(W&15),X=W>>4<<1;y=1024+(et*y<<11)+m[J(X,0,15)]*v+m[J(X+1,0,15)]*V>>11,V=v,v=J(y,-32768,32767),c.push(v);}t<h-1&&(o[u][t+1].yn1=c[D-1],o[u][t+1].yn2=c[D-2]);}else if(n===1)for(let k=0;k<D;k++){const U=b(a(I,k*2,2,this.endianness));c.push(U);}else if(n===0)for(let k=0;k<D;k++)c.push(b(I[k])*256);else throw new Error("Invalid codec");f[u].set(c);}return e(this,x)[t]=f,f};exports.Brstm=it;
    });

    var STREAMING_MIN_RESPONSE$1 = 2**19;

    var configProvider = {
    	STREAMING_MIN_RESPONSE: STREAMING_MIN_RESPONSE$1
    };

    var copyToChannelPolyfill = function(buf, cid) {
        let outputBuffer = this.getChannelData(cid);
        for (let i = 0; i < buf.length; i++) {
            outputBuffer[i] = buf[i];
        }
    };

    let currentlyGesturing = false;
    let activeArea = "";
    let activeAreaElem = null;

    let operationListeners = new Map();
    let finishedListeners = new Map();

    function sanitize(x, y) {
        let bcr = activeAreaElem.getBoundingClientRect();

        let xx = x - bcr.x;
        let yy = y - bcr.y;

        if (xx < 0) xx = 0;
        if (yy < 0) yy = 0;
        if (xx > bcr.width) xx = bcr.width;
        if (yy > bcr.height) yy = bcr.height;

        return [xx, yy];
    }

    function fireOp(e, x, y) {
        if (operationListeners.has(e)) {
            for (let i = 0; i < operationListeners.get(e).length; i++) {
                operationListeners.get(e)[i](x, y);
            }
        }
    }

    function fireFin(e, x, y) {
        if (finishedListeners.has(e)) {
            for (let i = 0; i < finishedListeners.get(e).length; i++) {
                finishedListeners.get(e)[i](x, y);
            }
        }
    }


    var registerOpEvent = function(element, cb) {
        if (operationListeners.has(element)) {
            let z = operationListeners.get(element);
            z.push(cb);
            operationListeners.set(element, z);
        } else {
            operationListeners.set(element, [cb]);
        }
    };

    var registerFinEvent = function(element, cb) {
        if (finishedListeners.has(element)) {
            let z = finishedListeners.get(element);
            z.push(cb);
            finishedListeners.set(element, z);
        } else {
            finishedListeners.set(element, [cb]);
        }
    };


    var runGestureEngine = function() {
        document.addEventListener("mousedown", function(e) {
            if (e.target.dataset.gestureHitzone) {
                currentlyGesturing = true;
                activeArea = e.target.dataset.gestureHitzone;
                activeAreaElem = e.target;

                let [x, y] = sanitize(e.clientX, e.clientY);
                fireOp(activeArea, x, y);
            }
        });

        document.addEventListener("mousemove", function(e) {
            if (currentlyGesturing) {
                let [x, y] = sanitize(e.clientX, e.clientY);
                fireOp(activeArea, x, y);
            }
        });

        document.addEventListener("mouseup", function(e) {
            if (currentlyGesturing) {
                let [x, y] = sanitize(e.clientX, e.clientY);
                fireFin(activeArea, x, y);

                currentlyGesturing = false;
                activeAreaElem = null;
                activeArea = "";
            }
        });
    };

    var gestureEngine = {
    	registerOpEvent: registerOpEvent,
    	registerFinEvent: registerFinEvent,
    	runGestureEngine: runGestureEngine
    };

    var gui = createCommonjsModule(function (module) {
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
        loopCounter: 1,
        streamingDied: false
    };

    let overrides = {
        volume: null,
        position: null
    };

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
    <h3>Reload the page and try again.</h3>
    <h3>If the issue continues, contact us.</h3>
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
        <input type="number" id="pl-loop-counter-box" value="1" min="0" style="width: 35px; height: 16px; background-color: #000000; color: #FFFFFF; border: none;" title="Loop Counter">
        <input type="checkbox" id="pl-loop-box" style="width: 16px; height: 16px; margin-right: 0;">
        <span class="pl-loop-text">Endless loop</span>
        <a class="pl-loop-text" target="_blank" href="https://smashcustommusic.net/feedback/">Send feedback</a>
        <a class="pl-loop-text" target="_blank" href="https://github.com/rphsoftware/revolving-door">v2 by Rph</a>
    </div>
</div>`;

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

        document.querySelector("#pl-loop-counter-box").addEventListener("input", function() {
            state.loopCounter = document.querySelector("#pl-loop-counter-box").value;
            api.setLoopCounter(state.loopCounter);
        });

        guiElement.addEventListener("drag", function(e) { e.preventDefault(); });

        gestureEngine.runGestureEngine();

        gestureEngine.registerOpEvent("seek", seekOp);
        gestureEngine.registerFinEvent("seek", seekFin);
        gestureEngine.registerOpEvent("volume", volOp);
        gestureEngine.registerFinEvent("volume", volFin);
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
    };
    });

    //JavaScript Audio Resampler
    //Copyright (C) 2011-2015 Grant Galitz
    //Released to Public Domain
    function Resampler(fromSampleRate, toSampleRate, channels, inputBuffer) {
        //Input Sample Rate:
        this.fromSampleRate = +fromSampleRate;
        //Output Sample Rate:
        this.toSampleRate = +toSampleRate;
        //Number of channels:
        this.channels = channels | 0;
        //Type checking the input buffer:
        if (typeof inputBuffer != "object") {
            throw(new Error("inputBuffer is not an object."));
        }
        if (!(inputBuffer instanceof Array) && !(inputBuffer instanceof Float32Array) && !(inputBuffer instanceof Float64Array)) {
            throw(new Error("inputBuffer is not an array or a float32 or a float64 array."));
        }
        this.inputBuffer = inputBuffer;
        //Initialize the resampler:
        this.initialize();
    }
    Resampler.prototype.initialize = function () {
        //Perform some checks:
        if (this.fromSampleRate > 0 && this.toSampleRate > 0 && this.channels > 0) {
            if (this.fromSampleRate == this.toSampleRate) {
                //Setup a resampler bypass:
                this.resampler = this.bypassResampler;		//Resampler just returns what was passed through.
                this.ratioWeight = 1;
                this.outputBuffer = this.inputBuffer;
            }
            else {
                this.ratioWeight = this.fromSampleRate / this.toSampleRate;
                if (this.fromSampleRate < this.toSampleRate) {
                    /*
                        Use generic linear interpolation if upsampling,
                        as linear interpolation produces a gradient that we want
                        and works fine with two input sample points per output in this case.
                    */
                    this.compileLinearInterpolationFunction();
                    this.lastWeight = 1;
                }
                else {
                    /*
                        Custom resampler I wrote that doesn't skip samples
                        like standard linear interpolation in high downsampling.
                        This is more accurate than linear interpolation on downsampling.
                    */
                    this.compileMultiTapFunction();
                    this.tailExists = false;
                    this.lastWeight = 0;
                }
                this.initializeBuffers();
            }
        }
        else {
            throw(new Error("Invalid settings specified for the resampler."));
        }
    };
    Resampler.prototype.compileLinearInterpolationFunction = function () {
        var toCompile = "var outputOffset = 0;\
    if (bufferLength > 0) {\
        var buffer = this.inputBuffer;\
        var weight = this.lastWeight;\
        var firstWeight = 0;\
        var secondWeight = 0;\
        var sourceOffset = 0;\
        var outputOffset = 0;\
        var outputBuffer = this.outputBuffer;\
        for (; weight < 1; weight += " + this.ratioWeight + ") {\
            secondWeight = weight % 1;\
            firstWeight = 1 - secondWeight;";
        for (var channel = 0; channel < this.channels; ++channel) {
            toCompile += "outputBuffer[outputOffset++] = (this.lastOutput[" + channel + "] * firstWeight) + (buffer[" + channel + "] * secondWeight);";
        }
        toCompile += "}\
        weight -= 1;\
        for (bufferLength -= " + this.channels + ", sourceOffset = Math.floor(weight) * " + this.channels + "; sourceOffset < bufferLength;) {\
            secondWeight = weight % 1;\
            firstWeight = 1 - secondWeight;";
        for (var channel = 0; channel < this.channels; ++channel) {
            toCompile += "outputBuffer[outputOffset++] = (buffer[sourceOffset" + ((channel > 0) ? (" + " + channel) : "") + "] * firstWeight) + (buffer[sourceOffset + " + (this.channels + channel) + "] * secondWeight);";
        }
        toCompile += "weight += " + this.ratioWeight + ";\
            sourceOffset = Math.floor(weight) * " + this.channels + ";\
        }";
        for (var channel = 0; channel < this.channels; ++channel) {
            toCompile += "this.lastOutput[" + channel + "] = buffer[sourceOffset++];";
        }
        toCompile += "this.lastWeight = weight % 1;\
    }\
    return outputOffset;";
        this.resampler = Function("bufferLength", toCompile);
    };
    Resampler.prototype.compileMultiTapFunction = function () {
        var toCompile = "var outputOffset = 0;\
    if (bufferLength > 0) {\
        var buffer = this.inputBuffer;\
        var weight = 0;";
        for (var channel = 0; channel < this.channels; ++channel) {
            toCompile += "var output" + channel + " = 0;";
        }
        toCompile += "var actualPosition = 0;\
        var amountToNext = 0;\
        var alreadyProcessedTail = !this.tailExists;\
        this.tailExists = false;\
        var outputBuffer = this.outputBuffer;\
        var currentPosition = 0;\
        do {\
            if (alreadyProcessedTail) {\
                weight = " + this.ratioWeight + ";";
        for (channel = 0; channel < this.channels; ++channel) {
            toCompile += "output" + channel + " = 0;";
        }
        toCompile += "}\
            else {\
                weight = this.lastWeight;";
        for (channel = 0; channel < this.channels; ++channel) {
            toCompile += "output" + channel + " = this.lastOutput[" + channel + "];";
        }
        toCompile += "alreadyProcessedTail = true;\
            }\
            while (weight > 0 && actualPosition < bufferLength) {\
                amountToNext = 1 + actualPosition - currentPosition;\
                if (weight >= amountToNext) {";
        for (channel = 0; channel < this.channels; ++channel) {
            toCompile += "output" + channel + " += buffer[actualPosition++] * amountToNext;";
        }
        toCompile += "currentPosition = actualPosition;\
                    weight -= amountToNext;\
                }\
                else {";
        for (channel = 0; channel < this.channels; ++channel) {
            toCompile += "output" + channel + " += buffer[actualPosition" + ((channel > 0) ? (" + " + channel) : "") + "] * weight;";
        }
        toCompile += "currentPosition += weight;\
                    weight = 0;\
                    break;\
                }\
            }\
            if (weight <= 0) {";
        for (channel = 0; channel < this.channels; ++channel) {
            toCompile += "outputBuffer[outputOffset++] = output" + channel + " / " + this.ratioWeight + ";";
        }
        toCompile += "}\
            else {\
                this.lastWeight = weight;";
        for (channel = 0; channel < this.channels; ++channel) {
            toCompile += "this.lastOutput[" + channel + "] = output" + channel + ";";
        }
        toCompile += "this.tailExists = true;\
                break;\
            }\
        } while (actualPosition < bufferLength);\
    }\
    return outputOffset;";
        this.resampler = Function("bufferLength", toCompile);
    };
    Resampler.prototype.bypassResampler = function (upTo) {
        return upTo;
    };
    Resampler.prototype.initializeBuffers = function () {
        //Initialize the internal buffer:
        var outputBufferSize = (Math.ceil(this.inputBuffer.length * this.toSampleRate / this.fromSampleRate / this.channels * 1.000000476837158203125) * this.channels) + this.channels;
        try {
            this.outputBuffer = new Float32Array(outputBufferSize);
            this.lastOutput = new Float32Array(this.channels);
        }
        catch (error) {
            this.outputBuffer = [];
            this.lastOutput = [];
        }
    };

    // This script shouldn't do anything without explicit user interaction (Triggering playback)




    const { STREAMING_MIN_RESPONSE } = configProvider;
    const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout));

    function partitionedGetSamples(brstm, start, size) {
        let samples = [];
        let got = 0;
        for (let i = 0; i < brstm.metadata.numberChannels; i++) {
            samples.push(new Int16Array(size));
        }

        while (got < size) {
            let buf = brstm.getSamples(start + got, Math.min(brstm.metadata.samplesPerBlock, (size - got)));
            for (let i = 0; i < buf.length; i++) {
                samples[i].set(buf[i], got);
            }
            got += Math.min(brstm.metadata.samplesPerBlock, (size - got));
        }

        return samples;
    }

    // Player state variables
    let hasInitialized = false;    // If we measured browser capabilities yet
    let capabilities = null;       // Capabilities of our browser
    let audioContext = null;       // WebAudio Audio context
    let scriptNode = null;         // WebAudio script node
    let gainNode = null;           // WebAudio gain node
    let fullyLoaded = true;        // Set to false if file is still streaming
    let loadState = 0;             // How many bytes we loaded
    let playbackCurrentSample = 0; // Current sample of playback (in the LibBRSTM)
    let brstm = null;              // Instance of LibBRSTM
    let brstmBuffer = null;        // Memory view shared with LibBRSTM
    let paused = false;
    let endlessLoop = false;
    let loopCounter = 1;
    let streamCancel = false;
    let playAudioRunning = false;

    let samplesReady = 0;          // How many samples the streamer loaded
    let volume = (localStorage.getItem("volumeoverride") || 1);
    function guiupd() { gui.updateState({position: playbackCurrentSample, paused, volume, loaded: samplesReady, looping: endlessLoop}); }
    function getResampledSample(sourceSr, targetSr, sample) {
        return Math.ceil((sample / sourceSr) * targetSr);
    }

    async function loadSongLegacy(url) { // Old song loading logic
        let resp = await fetch(url);
        let body = await resp.arrayBuffer(); // Fetch whole song

        brstm = new brstm$1.Brstm(body); // Initialize libBRSTM into global state

        fullyLoaded = true;
        loadState = Number.MAX_SAFE_INTEGER; // This is legacy loading logic, we can just assume we downloaded everything
        samplesReady = Number.MAX_SAFE_INTEGER;
    }

    function awaitMessage(content) {
        return new Promise(function(resolve) {
            function handler(c) {
                if (c.data === content && c.isTrusted) {
                    window.removeEventListener("message", handler);
                    resolve();
                }
            }

            window.addEventListener("message", handler);
        });
    }

    function loadSongStreaming(url) { // New, fancy song loading logic
        return new Promise(async (resolve, reject) => {
            let resp;
            let reader;
            try {
                resp = await fetch(url);
                reader = (await resp.body).getReader(); // Initialize reader
            } catch(e) { return reject(e); }
            brstmBuffer = new ArrayBuffer(parseInt(resp.headers.get("content-length")));
            let bufferView = new Uint8Array(brstmBuffer); // Create shared memory view
            let writeOffset = 0; // How much we read
            let resolved = false; // Did we resolve the promise already
            let brstmHeaderSize = 0;
            samplesReady = 0;
            fullyLoaded = false; // We are now streaming
            streamCancel = false;
            while(true) {
                let d;
                try {
                    d = await reader.read(); // Read next chunk
                } catch(e) {
                    if (resolved) {
                        gui.updateState({streamingDied: true, buffering: false, ready:true});
                        await audioContext.close();
                        audioContext = null;
                    } else {
                        reject(e);
                    }
                    return;
                }
                if (streamCancel) {
                    await reader.cancel();
                    window.postMessage("continueload");
                    return;
                }
                if (!d.done) { // This means we will receive more
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
                    }

                    if (!resolved && brstmHeaderSize != 0 && writeOffset > brstmHeaderSize) {
                        // Initialize BRSTM instance and allow player to continue loading
                        try {
                            brstm = new brstm$1.Brstm(brstmBuffer);
                            resolve();
                            resolved = true;
                        } catch(e) {
                            reject(e);
                            return;
                        }

                    }
                    if (resolved) {
                        samplesReady = Math.floor(
                            ((loadState - brstmHeaderSize) / brstm.metadata.numberChannels) / brstm.metadata.blockSize
                        ) * brstm.metadata.samplesPerBlock;
                    }
                } else {
                    if (!resolved) {
                        // For some reason we haven't resolved yet despite the file finishing
                        try {
                            brstm = new brstm$1.Brstm(brstmBuffer);
                            resolve();
                            resolved = true;
                        } catch(e) {
                            reject(e);
                            return;
                        }
                    }
                    fullyLoaded = true;
                    samplesReady = Number.MAX_SAFE_INTEGER; // Just in case
                    console.log("File finished streaming");
                    break;
                }
            }
        });
    }

    const internalApi = {
        setVolume: function(l) {
            volume=l;
            guiupd();
            if (gainNode)
                gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        },
        seek: function(p) {
            playbackCurrentSample = Math.floor(p);
            guiupd();
        },
        pause: function() {
            paused = !paused;
            audioContext[paused ? "suspend" : "resume"]();
            guiupd();
        },
        setLoop: function(a) {
            endlessLoop = a;
            guiupd();
        },
        setLoopCounter: function(a) {
            loopCounter = a;
            guiupd();
        }
    };

    async function startPlaying(url) { // Entry point to the
        if (!hasInitialized) { // We haven't probed the browser for its capabilities yet
            capabilities = await browserCapabilities();
            hasInitialized = true;
            gui.runGUI(internalApi);
            setInterval(function() { gui.updateState({loaded:samplesReady}); gui.guiUpdate(); }, 100);
        } // Now we have!

        if (playAudioRunning) return;
        playAudioRunning = true;
        if (!fullyLoaded) {

            console.log("Cancelling last stream...");
            streamCancel = true;
            await awaitMessage("continueload");
            console.log("Done.");
        }
        if (audioContext) { // We have a previous audio context, we need to murderize it
            await audioContext.close();
            audioContext = null;
        }

        playbackCurrentSample = 0; // Set the state for playback
        paused = false;            // Unpause it

        gui.updateState({ // Populate GUI with initial, yet unknown data
            ready: false,
            position: 0,
            samples: 1e6,
            loaded: 0,
            volume: volume,
            paused: false,
            buffering: false,
            sampleRate: 44100,
            loopCounter: loopCounter,
            streamingDied: false
        });
        try {
            await (capabilities.streaming ? loadSongStreaming : loadSongLegacy)(url); // Begin loading based on capabilities
        } catch(e) {
            gui.updateState({streamingDied:true, ready:true, buffering: false});
            console.error(e);
            playAudioRunning = false;
            return;
        }
            // The promise returned by the loading method is either resolved after the download is done (legacy)
            // Or after we download enough to begin loading (modern)

        audioContext = new (window.AudioContext || window.webkitAudioContext) // Because Safari is retarded
            (capabilities.sampleRate ? {sampleRate: brstm.metadata.sampleRate} : {
            }); // Do we support sampling?
        // If not, we just let the browser pick

        endlessLoop = (brstm.metadata.loopFlag === 1); // Set the loop settings respective to the loop flag in brstm file
        if (brstm.metadata.loopFlag === 1) {
            loopCounter = document.querySelector("#pl-loop-counter-box").value;
        } else {
            loopCounter = 0;
            document.querySelector("#pl-loop-counter-box").value = 0;
        }

        await webAudioUnlock(audioContext); // Request unlocking of the audio context

        if (capabilities.streaming) {
            await sleep(1000); // In streaming sometimes the start is slightly crunchy, this should fix it.
        }

        // Create the script node
        scriptNode = audioContext.createScriptProcessor(0, 0, 2);

        // Process bufferSize
        let bufferSize = scriptNode.bufferSize;
        
        // If we have to resample, the buffer that we get from the BRSTM will be different size.
        bufferSize = capabilities.sampleRate ? bufferSize : getResampledSample(
            audioContext.sampleRate,
            brstm.metadata.sampleRate,
            bufferSize
        );
        let loadBufferSize = bufferSize;
        
        // If we resample, we need to also fetch some extra samples to prevent audio glitches
        if (!capabilities.sampleRate) {
            loadBufferSize += 20;
        }

        gui.updateState({ready: true, samples: brstm.metadata.totalSamples});
        gui.updateState({sampleRate: brstm.metadata.sampleRate});
        playAudioRunning = false;
        // Set the audio loop callback (called by the browser every time the internal buffer expires)
        scriptNode.onaudioprocess = function(audioProcessingEvent) {
            guiupd();
            // Get a handle for the audio buffer
            let outputBuffer = audioProcessingEvent.outputBuffer;
            if (!outputBuffer.copyToChannel) // On safari (Because it's retarded), we have to polyfill this
                outputBuffer.copyToChannel = copyToChannelPolyfill;

            // Not enough samples override
            if ((playbackCurrentSample + bufferSize + 1024) > samplesReady) {
                // override, return early.
                gui.updateState({buffering: true});
                console.log("Buffering....");
                outputBuffer.copyToChannel(new Float32Array(scriptNode.bufferSize).fill(0), 0);
                outputBuffer.copyToChannel(new Float32Array(scriptNode.bufferSize).fill(0), 1);
                return;
            }
            gui.updateState({buffering: false});
            if (paused) { // If we are paused, we just bail out and return with just zeros
                outputBuffer.copyToChannel(new Float32Array(scriptNode.bufferSize).fill(0), 0);
                outputBuffer.copyToChannel(new Float32Array(scriptNode.bufferSize).fill(0), 1);
                return;
            }

            let samples; // Declare the variable for samples
                         // This will be filled using the below code for handling looping
            if ((playbackCurrentSample + loadBufferSize) < brstm.metadata.totalSamples) { // Standard codepath if no loop
                // Populate samples with enough that we can just play it (or resample + play it) without glitches
                samples = partitionedGetSamples(
                    brstm,
                    playbackCurrentSample,
                    loadBufferSize
                );

                // We use bufferSize not loadBufferSize because the last 20 samples if we have resampling are inaudible
                playbackCurrentSample += bufferSize;
            } else {
                // We are reaching EOF
                // Check if we have looping enabled
                if (endlessLoop || loopCounter > 0) {
                    // First, get all the samples to the end of the file
                    samples = partitionedGetSamples(
                        brstm,
                        playbackCurrentSample,
                        (brstm.metadata.totalSamples - playbackCurrentSample)
                    );
                    
                    let endSamplesLength = samples[0].length;

                    console.log((brstm.metadata.totalSamples - playbackCurrentSample), (loadBufferSize - endSamplesLength));

                    // Get enough samples to fully populate the buffer AFTER loop start point
                    let postLoopSamples = partitionedGetSamples(
                        brstm,
                        brstm.metadata.loopStartSample,
                        (loadBufferSize - endSamplesLength)
                    );

                    // For every channel, join the first and second buffers created above
                    for (let i = 0; i < samples.length; i++) {
                        let buf = new Int16Array(loadBufferSize).fill(0);
                        buf.set(samples[i]);
                        buf.set(postLoopSamples[i], samples[i].length);
                        samples[i] = buf;
                    }

                    // Set to loopStartPoint + length of second buffer (recalculated to not set extra resampling samples)
                    playbackCurrentSample = brstm.metadata.loopStartSample + bufferSize - endSamplesLength;
                    // reduce loop counter by one
                    if (!endlessLoop) {
                        loopCounter--;
                    }
                } else {
                    // No looping
                    // Get enough samples until EOF
                    samples = partitionedGetSamples(
                        brstm,
                        playbackCurrentSample,
                        (brstm.metadata.totalSamples - playbackCurrentSample - 1)
                    );

                    // Fill remaining space in the buffer with 0
                    for (let i = 0; i < samples.length; i++) {
                        let buf = new Int16Array(loadBufferSize).fill(0);
                        buf.set(samples[i]);
                        samples[i] = buf;
                    }
                    // Reset loop counter to input value
                    loopCounter = document.querySelector("#pl-loop-counter-box").value;

                    // Tell the player that on the next iteration we are at the start and paused
                    playbackCurrentSample = 0;
                    paused = true;
                    setTimeout(function() { audioContext.suspend(); }, 200);
                }
            }

            // In files with too many channels, we just play the first 2 channels
            if (samples.length > 2) {
                samples = [samples[0], samples[1]];
            }

            // In mono files, we duplicate the channel because stereo is mandatory
            if (samples.length === 1) {
                samples = [samples[0], samples[0]];
            }

            // Populate outputs for both channels
            for (let i = 0; i < samples.length; i++) {
                // WebAudio requires Float32 (-1 to 1), we have Int16 (-32768 to 32767)
                let chan = new Float32Array(loadBufferSize);

                // Convert to Float32
                for (let sid = 0; sid < loadBufferSize; sid++) {
                    chan[sid] = samples[i][sid] / 32768;
                }

                // If we require resampling
                if (!capabilities.sampleRate) {
                    // Initialize the resampler with the original data we got from BRSTM
                    let zresampler = new Resampler(brstm.metadata.sampleRate, audioContext.sampleRate, 1, chan);

                    // Resample all the samples we loaded
                    zresampler.resampler(loadBufferSize);

                    // Copy the output to the channel
                    chan = zresampler.outputBuffer;

                    // Cut off excess samples
                    if (chan.length > scriptNode.bufferSize) {
                        chan = chan.slice(0, scriptNode.bufferSize);
                    }
                }

                // At last, write all samples to the output buffer
                outputBuffer.copyToChannel(chan, i);
            }
        };

        // Gain node controls volume
        gainNode = audioContext.createGain();

        // Script node needs to pass through gain so it can be controlled
        scriptNode.connect(gainNode);

        // Gain node outputs to the actual speakers
        gainNode.connect(audioContext.destination);

        // Set gain node volume to `volumeoverride` for remembering the volume
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    }

    window.player = {
        play: startPlaying
    };

})();
