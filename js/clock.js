//like clockwork... teehee
//declare frequently referenced html elements
const clock = {
    container: document.getElementById("clock"),
    current: document.getElementById("current-time"),
    recorded: document.getElementById("recorded-time"),
    howLongSince: document.getElementById("how-long-since")
}

var currentTime = new Date();
var recordedTime = new Date();
//const recordedTime;

//declaring our functions!
function updateClock() {
    currentTime = new Date();
    clock.current.innerHTML = currentTime.toLocaleString();
    clock.recorded.innerHTML = recordedTime.toLocaleString();
}

function setRecordedClock(datetime) {
    recordedTime = new Date(datetime);
    updateClock();
}

//things we want to run right away
updateClock();