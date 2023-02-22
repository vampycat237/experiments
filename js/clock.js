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
    clock.howLongSince.innerHTML = timeSinceRecorded();
}

function timeSinceRecorded() {
    var timeSince = 0;
    var timeUnit = " seconds";
    //Modifier will either be "since" (target is in the past) or "until" (target is in the future)
    var modifier = " since";
    var milliSecSince = currentTime.valueOf() - recordedTime.valueOf();
    //get a clean second value
    var secondsSince = Math.round(milliSecSince / 1000);

    //resolve negatives with the modifier
    if (secondsSince < 0) {
        secondsSince = secondsSince * -1;
        modifier = " until";
    }

    //if seconds is large enough, use larger units like minutes, hours, or days
    if (secondsSince < 60) {
        timeSince = secondsSince;
    }
    else if (secondsSince >= (60 * 60 * 24)) {
        timeSince = Math.floor(secondsSince / (60 * 60 * 24));
        timeUnit = " hours";
    }
    else if (secondsSince >= (60 * 60)) {
        timeSince = Math.floor(secondsSince / (60 * 60));
        timeUnit = " hours";
    }
    else if (secondsSince >= 60) {
        timeSince = Math.floor(secondsSince / 60);
        timeUnit = " minutes";
    }

    return timeSince + timeUnit + modifier;
}

function setRecordedClock(datetime) {
    recordedTime = new Date(datetime);
    console.log(datetime);
    updateClock();
}

//things we want to run right away
updateClock();