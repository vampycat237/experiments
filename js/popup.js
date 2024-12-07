//windows error noise
const popup = {
    container: document.getElementById("popup"),
    text: document.getElementById("popup-text"),
    title: document.getElementById("popup-title"),

    //for inputs only
    inputContainer: document.getElementById("popup-input-container"),
    input: document.getElementById("popup-input"),
    inputSend: document.getElementById("popup-send"),

    //for fancyinfo only
    pageback: document.getElementById("popup-pageback"),
    pagenext: document.getElementById("popup-pagenext"),

    //for select only
    selectContainer: document.getElementById("popup-select-container"),
    select: document.getElementById("popup-select"),
    selectSend: document.getElementById("popup-select-send")
}

/** 
 * Reference to the currently active PopUp object, if any.
 * Used by the generic closePopUp() function to run the objects .close() method.
 */
var currentPopUp = null;

//each page adds their own bit to "pages" :D
const info = {
    tagline: 'welcome to the lab :)', //default tagline
    infoPage: 2, //start on the first page-specific info page
    pages: [
        ['navigation', 'the buttons at the top right work like this:<br>[i] will give you information<br>[_] will send you back to the directory<br> [x] will send you to my site'],
        ['notice', 'the experiments in the lab may or may not be finished or functional<br>if you experience errors please report them to me tho!<br>making an issue on the repository is the best way to ensure i see & remember it']
    ]
}

//generic popup functions
function closePopUp() {
    // Handle special PopUps
    if (currentPopUp != null) {
        currentPopUp.close();
        currentPopUp = null;
    }
    popup.container.style.display = "none";
    resetPopUp();
}

function openPopUp(msg, title = "alert") {
    popup.text.innerHTML = msg;
    popup.title.innerHTML = title;
    popup.container.style.display = "unset";
    resetPopUp(); //hides the specific popup elements
}

function resetPopUp() {
    //only used by inputPopUp
    if (popup.input !== null) {
        popup.input.style.display = "none";
        popup.inputSend.style.display = "none";
    }
    //only used by fancyInfoPopUp
    popup.pageback.style.display = "none";
    popup.pagenext.style.display = "none";
    //only used by select
    if (popup.selectContainer !== null) {
        popup.selectContainer.style.display = "none";
    }
}

//specific popup stuff!
function errorPopUp(msg) {
    openPopUp(msg, "error :(");
}

function infoPopUp(msg) {
    openPopUp(msg, "info");
}

function fancyInfoPopUp() {
    openPopUp(info.pages[info.infoPage][1], "info: " + info.pages[info.infoPage][0]); //rip tagline you will be missed
    popup.pageback.style.display = "unset";
    popup.pagenext.style.display = "unset";
}

function inputPopUp(prompt) {
    openPopUp(prompt, "input");
    popup.input.style.display = "unset";
    popup.inputSend.style.display = "unset";
}

//opens a "select" popup.
//options: an array used to build the options in the select dropdown
//sendAction: a function. executed on completion, passing in the select value.
function selectPopUp(prompt, options, sendAction) {
    openPopUp(prompt, "select an option");

    optionsBlock = "";

    for (o of options) {
        optionsBlock += `<option value="${o}">${o}</option>`;
    }
    popup.select.innerHTML = optionsBlock;
    popup.selectSend.onclick = function () { closePopUp(); sendAction(popup.select.value); };
    //console.log(sendAction);

    popup.selectContainer.style.display = "unset";
}

function infoTurnPage(y) {
    if (info.infoPage + y >= info.pages.length) {
        //turn page too high, loop to 0
        info.infoPage = 0;
    }
    else if (info.infoPage + y < 0) {
        //turn page too low, loop to max
        info.infoPage = info.pages.length - 1;
    }
    else {
        info.infoPage += y;
    }
    fancyInfoPopUp();
}
