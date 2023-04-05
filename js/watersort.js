//wanna see how fast i can make a water color sort clone? too bad you're gonna
//HTML object holder
const watersort = {
    container: document.getElementById("watersort"),
    controls: document.getElementById("controls")
}

//Static variables
//Matches the number representing the water type (as the index) to the css variable to determine its color. Unused right now but can be used for customization later!
const waterTypeKey = [];
const waterPresets = {
    default:    ['#00f', '#0ff', '#0f0', '#ff0', '#f00', '#f0f'],
    monochrome: ['#fff', '#ddd', '#bbb', '#999', '#777', '#555']
    }
//Holds the WaterTubes in play.
var waterTubes = [];
//Tracks what tube is selected.
var selectedTube = -1;
//Holds the save key for the level when it first loads.
var levelStartSave;

//CLASS DEFINITIONS
//Water Tube class.
class WaterTube {
    //Contents should be an array with 4 values, like [1, 1, 1, 1]. The first value is the bottom, and the last is the top.
    constructor(contents, ID = null) {
        //Array contents: Assign immediately!
        if (typeof contents == "object") {
            this.contents = contents;
        }
        //"Encrypted"/ stored contents: Parse!
        else {
            //console.log(typeof contents);
            this.contents = [contents[0], contents[1], contents[2], contents[3]];
        }

        if (ID != null) {
            this.ID = ID;
        }
        else {
            //Decide ID to be length of waterTubes
            this.ID = waterTubes.length;
        }
        //TODO: fetch water parts and assign them their numbers
        //TODO: randomize contents?
        //TODO: saving/loading contents, maybe based on seeds
    }

    //Returns a number between 0 and 4 representing how full this tube is. 0 is empty, 4 is full.
    howFull() {
        var fullness = 0;
        for (let v of this.contents) {
            if (v > 0) {
                fullness++;
            }
        }
        return fullness;
    }

    //Returns the water type of the highest water level in this tube.
    getTopWaterType() {
        return this.contents[this.howFull() - 1];
    }

    //Determines whether a water type can be added to this tube. The tube must have at least 1 open slot, and it must be of a matching type to the highest exposed water level.
    canAdd(waterType) {
        //plaintext: if this is not full AND the water matches the top water here, OR if this tube is empty.
        return ((this.howFull() < 4) && (waterType == this.getTopWaterType()) || this.howFull() < 1);
    }

    //Attempts to add a new level of water in the tube. Returns true if successful, false if it fails.
    addTopWater(waterType) {
        if (this.canAdd(waterType)) {
            //This gets the highest EMPTY level of the tube! It can't be higher than 4 because of the canAdd check.
            this.contents[this.howFull()] = waterType;
            return true;
        }
        else {
            return false;
        }
    }

    //Tries to pour this tube's top water into another tube. Returns true if successful, false if it fails.
    //otherTube should be a WaterTube object!
    pourTo(otherTube, level = 0) {
        if (level > 4) {
            return false;
        }
        if (this.howFull() > 0 && otherTube.addTopWater(this.getTopWaterType())) {
            const typePoured = this.getTopWaterType();
            //we poured to the other tube! get rid of the level from THIS tube now
            this.contents[this.howFull() - 1] = 0;

            //console.log("poured type "+typePoured+"!");
            //IF our next level is the same as the former, try to pour again (recursively ig?)! This will allow pouring matching water much more efficiently. No need to do anything with the return though
            if (typePoured == this.getTopWaterType()) this.pourTo(otherTube, level+1);

            return true;
        }
        else {
            //we didn't pour, so don't do anything but return false.
            var msg = "couldn't pour! reason: ";
            if (otherTube.howFull() > 4) {
                msg += "recieving tube is too full";
            }
            else if (otherTube.getTopWaterType() != this.getTopWaterType()) {
                msg += "water types don't match";
            }
            else if (this.howFull() <= 0) {
                msg += "pouring tube is empty";
            }
            else {
                msg += "uncaught :(";
            }
            if (level < 1) console.log(msg);

            return false;
        }
    }

    //Checks if this tube is 100% full *and* all the same type of water!
    checkForCompletion() {
        const isFull = (this.howFull() >= 4);
        const allMatching = (this.contents.every((val, i, arr) => val == arr[0])); //Pulled this from stack overflow, I don't understand a bit of it haha. source: https://stackoverflow.com/questions/14832603/check-if-all-values-of-array-are-equal

        const isComplete = (isFull && allMatching);

        /*var msg = "cringe fail!! reason: ";
        if (!allMatching) msg += "contents dont match. ";
        else if (!isFull) msg += "tube not full. ";
        else if (!isComplete) msg += "a secret third thing. ";

        if (!isComplete) {
            msg += "sent from tube " + this.ID;
            console.log(msg);
        }*/

        //console.log((this.contents.every((val, i, arr) => val == arr[0])));
        return isComplete;
    }

    //Crunches the object into just its contents. Represented as #### (decimal)
    toString() {
        var str = "";
        str += this.contents[0];
        str += this.contents[1];
        str += this.contents[2];
        str += this.contents[3];

        return str;
        //return parseInt(first).toString(16) + parseInt(second).toString(16);

        //return this.toNum().toString(16);
    }

    //Crunches the object into just its contents. Represented as ####
    toNum() {
        return parseInt(this.toString());
    }

}

//STATIC METHODS
//Fetches water colors from CSS. Returns them as an array
function getWaterColors() {
    const computedStyles = getComputedStyle(document.querySelector(':root'));

    //Number of colors is known ahead of time, so we can do a for loop on that
    for (let i = 0; i <= 6; i++) {
        waterTypeKey.push(computedStyles.getPropertyValue('--water_' + i));
    }

    console.log(waterTypeKey);
}

//Sets water colors in CSS based on given colors array. Do not include water_0 - array should be length 5
function setWaterColors(presetName) {
    const root = document.querySelector(':root');
    for (let i = 1; i <= 6; i++) {
        root.style.setProperty('--water_'+i, waterPresets[presetName][i-1]);
    }
    
}

//TODO
//Generates a random level.
function generateLevel() {
    console.log("the man behind the slaughter"); //silly :3
    //Clears the previous tubes
    waterTubes = [];
    //Array that represents how many of the various colors we have "left". Starts at 4 for each.
    const waterColors = [4, 4, 4, 4, 4, 4];

    for (i in waterColors) {
        const tubeContents = [0, 0, 0, 0];
        for (let j = 0; j < 4; j++) {
            let type = (Math.floor((Math.random()) * 100)) % 6;

            //check to see if this color is used up already
            if (waterColors[type] <= 0) {
                //that color is gone. Keep looking sequentially til we find one that isn't
                //let msg = (type+1) + " was used up [" + waterColors[type] + " left]!";
                let flag = false;
                let start = i;
                let offset = 0;
                while (flag == false) {
                    if (start + offset >= waterColors.length) {
                        //index is too high, we need to loop around!
                        start = 0;
                        offset = 0;
                    }
                    if (waterColors[start + offset] > 0) {
                        //found one!
                        flag = true;
                        type = start + offset;
                        //msg += " replacing with " + type;
                        break;
                    }

                    //console.log(waterColors[start + offset]);
                    offset++;
                }
                //console.log(msg);
            }
            
            tubeContents[j] = type + 1; //+1 accounts for 0 being reserved for empty tubes
            waterColors[type] += -1;
        }

        waterTubes.push(new WaterTube(tubeContents));
    }

    console.log(waterColors);
    //Save the key for this level
    levelStartSave = saveLevel();

    //Adds empty tubes -- since addEmptyTube calls render(), we don't need to!
    addEmptyTube(2);
}

//TODO
//Converts the gamestate into a string to be loaded again later. Discards empty tubes, as these are created uniformly at save loading.
function saveLevel() {
    const saveArray = [];
    for (tube of waterTubes) {
        if (tube.howFull() > 0) {
            //Tube is not empty! We save it.
            saveArray.push(tube.toString());
        }
    }

    //we have all our strings, now we stitch them together and return it!
    return saveArray.join(';');
}

//TODO
//Loads a level from a save key. Overwrites the current level
function loadLevel(key) {
    //Clear the tubes
    waterTubes = [];

    const saveArray = key.split(';');
    for (tube of saveArray) {
        waterTubes.push(new WaterTube(tube));
    }

    addEmptyTube(2)
}

//Adds empty tubes.
function addEmptyTube(tubesCount = 1) {
    for (let i = 0; i < tubesCount; i++) {
        waterTubes.push(new WaterTube([0, 0, 0, 0]));
    }
    render();
}

//Update the HTML to reflect the game!
function render() {
    /* TEMPLATE
    <div class="watertube">
        <div class="water top"></div>
        <div class="water topmid"></div>
        <div class="water botmid"></div>
        <div class="water bottom"></div>
    </div>
    */
    var display = '';

    for (tube of waterTubes) {
        display += '<div class="watertube" id="'+ tube.ID +'" onclick="select('+ tube.ID +')">';

        display += '<div class="water water' + tube.contents[3] + '"></div>';
        display += '<div class="water water' + tube.contents[2] + '"></div>';
        display += '<div class="water water' + tube.contents[1] + '"></div>';
        display += '<div class="water water' + tube.contents[0] + '"></div>';

        display += '</div>';
    }

    watersort.container.innerHTML = display;

    checkForWin();
}

//Changes the "selected" tube to the given one!
function select(i) {
    //console.log("selection going from " + selectedTube + " to " + i);
    if (i == selectedTube) {
        //same tube as before? deselect and set selected to invalid
        document.getElementById(i).classList.remove("selected");

        selectedTube = -1;
    }
    else if (selectedTube == -1) {
        //tube was previously invalid? select the new tube
        document.getElementById(i).classList.add("selected");

        selectedTube = i;
    }
    else if (waterTubes[selectedTube].howFull() <= 0) {
        //was selecting an empty tube before, so probably wants to switch to selecting this new tube instead since can't pour.
        //document.getElementById(selectedTube).classList.remove("selected");

        for (elmnt of document.getElementsByClassName("selected")) {
            elmnt.classList.remove("selected");
        }

        document.getElementById(i).classList.add("selected");

        //deselect tubes
        selectedTube = -1;
    }
    else {
        //two different tubes! try pour
        waterTubes[selectedTube].pourTo(waterTubes[i]);

        for (elmnt of document.getElementsByClassName("selected")) {
            elmnt.classList.remove("selected");
        }
        //document.getElementById(selectedTube).classList.remove("selected");

        //deselect tubes
        selectedTube = -1;
        render();
    }
}

//Checks for win conditions! Win condition: Every tube is either (100% full of the same color) or (empty).
function checkForWin() {
    var allComplete = true;
    for (tube of waterTubes) {
        if (!(tube.checkForCompletion()) && tube.howFull() > 0) {
            //This tube NOT all matched!
            //console.log(`tube: ${tube.ID}. complete: ${tube.checkForCompletion()}. not empty: ${tube.howFull() > 0}`);
            allComplete = false;
            break;
        }
    }
    if (allComplete) {
        openPopUp("you completed the level!");
    }
}

function main() {
    getWaterColors();
    generateLevel();
    //const testTube = new WaterTube([1,1,1,1]);
    //console.log(testTube.howFull());
}