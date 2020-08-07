module.exports = function(buf, cid) {
    let outputBuffer = this.getChannelData(cid);
    for (let i = 0; i < buf.length; i++) {
        outputBuffer[i] = buf[i];
    }
}