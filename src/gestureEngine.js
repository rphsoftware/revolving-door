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


module.exports.registerOpEvent = function(element, cb) {
    if (operationListeners.has(element)) {
        let z = operationListeners.get(element);
        z.push(cb);
        operationListeners.set(element, z);
    } else {
        operationListeners.set(element, [cb]);
    }
}

module.exports.registerFinEvent = function(element, cb) {
    if (finishedListeners.has(element)) {
        let z = finishedListeners.get(element);
        z.push(cb);
        finishedListeners.set(element, z);
    } else {
        finishedListeners.set(element, [cb]);
    }
}


module.exports.runGestureEngine = function() {
    document.addEventListener("mousedown", function(e) {
        if (e.target.dataset.gestureHitzone) {
            currentlyGesturing = true;
            activeArea = e.target.dataset.gestureHitzone;
            activeAreaElem = e.target;

            let [x, y] = sanitize(e.pageX, e.pageY);
            fireOp(activeArea, x, y);
        }
    });

    document.addEventListener("mousemove", function(e) {
        if (currentlyGesturing) {
            let [x, y] = sanitize(e.pageX, e.pageY);
            fireOp(activeArea, x, y);
        }
    });

    document.addEventListener("mouseup", function(e) {
        if (currentlyGesturing) {
            let [x, y] = sanitize(e.pageX, e.pageY);
            fireFin(activeArea, x, y);

            currentlyGesturing = false;
            activeAreaElem = null;
            activeArea = "";
        }
    });
}
