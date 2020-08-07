let h = 0;

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