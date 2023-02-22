//windows error noise
const popup = {
    container: document.getElementById("popup"),
    text: document.getElementById("popup-text"),
    title: document.getElementById("popup-title"),
    input: document.getElementById("popup-input"),
    inputSend: document.getElementById("popup-send")
}

function closePopUp() {
    popup.container.style.display = "none";
    popup.input.style.display = "none";
    popup.inputSend.style.display = "none";
}

function openPopUp(msg, title = "alert") {
    popup.text.innerHTML = msg;
    popup.title.innerHTML = title;
    popup.container.style.display = "block";
}

function errorPopUp(msg) {
    openPopUp(msg, "error :(");
}

function infoPopUp(msg) {
    openPopUp(msg, "info");
}

function inputPopUp(prompt) {
    popup.input.style.display = "inline";
    popup.inputSend.style.display = "inline";
    openPopUp(prompt, "input");
}