//windows error noise
const popup = {
    container: document.getElementById("popup"),
    text: document.getElementById("popup-text"),
    title: document.getElementById("popup-title")
}

function closePopUp() {
    popup.container.style.display = "none";
}

function openPopUp(msg, title = "alert") {
    popup.text.innerHTML = msg;
    popup.title.innerHTML = title;
    popup.container.style.display = "block";
}

function errorPopUp(msg) {
    openPopUp(msg, "error :(")
}

function infoPopUp(msg) {
    openPopUp(msg, "info")
}