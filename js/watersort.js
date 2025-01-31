//wanna see how fast i can make a water color sort clone? too bad you're gonna
//HTML object holder
/*const watersort = {
    container: document.getElementById("watersort"),
    controls: document.getElementById("controls")
}*/

//Static variables
//Matches the number representing the water type (as the index) to the css variable to determine its color. Unused right now but can be used for customization later!
const waterTypeKey = [];
const waterPresets = {
    default:    ['#3e6ddb', '#3bf6ff', '#25e125', '#ffff57', '#f58a19', '#ffabe2'],
    eyestrain:    ['#00f', '#0ff', '#0f0', '#ff0', '#f00', '#f0f'],
    // this one is species so it can have contrast
    monochrome: [
        '#fff', 
        'repeating-linear-gradient(135deg, #fff, #fff var(--line_width), #999 var(--line_width), #999 var(--line_width_2x))', 
        'repeating-linear-gradient(135deg, #999, #999 var(--line_width), #555 var(--line_width), #555 var(--line_width_2x))', 
        'repeating-linear-gradient(180deg, #bbb, #bbb var(--line_width), transparent var(--line_width), transparent var(--line_width_2x)), repeating-linear-gradient(90deg, #bbb, #bbb var(--line_width), #999 var(--line_width), #999 var(--line_width_2x))', 
        'repeating-linear-gradient(180deg, transparent, transparent var(--line_width), #555 var(--line_width), #555 var(--line_width_2x)), repeating-linear-gradient(90deg, #777, #777 var(--line_width), #555 var(--line_width), #555 var(--line_width_2x))', 
        '#555'
    ],
    warm:    ['#a939b3', '#55aab3', '#a8c229', '#ffcd57', '#f5850f', '#db3e3e']
    }
/** 
 * Holds the WaterTubes in play. 
 * @type WaterTube[]
 */
var waterTubes = [];
//Tracks what tube is selected.
var selectedTube = -1;
//Holds the save key for the level when it first loads.
var levelStartSave;

//CLASS DEFINITIONS
//Water Tube class.
class WaterTube {
    /** 'Size' of the tube. Represents how many non-empty water slots this WaterTube holds. */
    #size = 0;
    /** Maximum amount of water any WaterTube can hold. */
    static #maxSize = 4;

    /**
     * Contents should be an array with 4 values, like [1, 1, 1, 1].
     * The first value is the bottom, and the last is the top.
     * 
     * @param contents {String|String[]}
     * @param ID {Number|null}
     */
    constructor(contents, ID = null) {
        //Array contents: Assign immediately!
        if (typeof contents == "object" && contents.length <= WaterTube.#maxSize) {
            /** @type String[] */
            this.contents = contents;
        }
        //"Encrypted"/ stored contents: Parse!
        else {
            //console.log(typeof contents);
            this.contents = [contents[0], contents[1], contents[2], contents[3]];
        }

        if (ID != null) {
            /** @type Number */
            this.ID = ID;
        }
        else {
            //Assume we are the next tube in waterTubes, therefore our ID should be its length (its last index + 1)
            this.ID = waterTubes.length;
        }

        this.updateSize();

        //TODO: fetch water parts and assign them their numbers
        //TODO: randomize contents?
        //TODO: saving/loading contents, maybe based on seeds
    }

    /** Returns true if the tube is full. */
    isFull() {
        return this.#size >= WaterTube.#maxSize;
    }

    /** Returns true if the tube is empty. */
    isEmpty() {
        return this.#size <= 0;
    }

    /** Calculates and returns the size of this tube. Returns how many non-empty water slots this tube has. */
    updateSize() {
        // Uses the private size variable
        this.#size = 0;
        for (let v of this.contents) {
            if (v > 0) {
                this.#size++;
            }
        }
        return this.#size;
    }

    /** Returns the water type of the highest water level in this tube.*/
    getTopWaterType() {
        return this.contents[this.#size - 1];
    }

    /** 
     * Returns whether the given water type can be added to this tube.
     * 
     * The tube must have at least 1 open slot, and the given water type
     * must match that of the highest exposed water level.
     */
    canAdd(waterType) {
        // we check if empty first because it's faster to calculate
        // TODO: Should we stop from trying to add empty water, or does it not matter?
        return (
            // if this tube is empty, OR...
            this.isEmpty() || 
            (
                // this tube is NOT FULL, AND...
                (!this.isFull()) && 
                // the top water type matches the one we want to add.
                (waterType == this.getTopWaterType())
            ));
    }

    //Attempts to add a new level of water in the tube. Returns true if successful, false if it fails.
    addTopWater(waterType) {
        if (this.canAdd(waterType)) {
            //This gets the highest EMPTY level of the tube! It can't be higher than 4 because of the canAdd check.
            this.contents[this.#size] = waterType;
            // Update the size after successfully adding.
            this.updateSize();
            return true;
        }
        else {
            return false;
        }
    }

    /**Tries to pour this tube's top water into another tube.
     * 
     * Returns true if successful, false if it fails.
     * @param otherTube {WaterTube} The tube we want to pour our top contents into.
     * @param level {number} Used when calling recursively to pour the same watertype.
     * */
    pourTo(otherTube, level = 0) {
        // Base case for recursion: We've looped through all of our contents, no need to check anymore.
        if (level > WaterTube.#maxSize) {
            // Technically, this loop fails, so we return false.
            return false;
        }
        
        if (
            // this tube is NOT empty, AND...
            !this.isEmpty() && 
            // we successfully add our water to the other tube
            otherTube.addTopWater(this.getTopWaterType())
        ) {
            // At this point, this.topWater === otherTube.topWater
            // Save the kind of water we just poured
            const typePoured = this.getTopWaterType();
            // Get rid of our copy of topWater
            this.contents[this.#size - 1] = 0;
            this.updateSize();

            // Check if we should try to pour more water recursively. (If our new top water still matches the other tube, try to pour.)
            // We don't need the return value from the recursive call.
            if (typePoured == this.getTopWaterType()) this.pourTo(otherTube, level+1);

            // We successfully poured at least 1 level of water.
            return true;
        }
        else {
            // We didn't pour any water, so we'll return false later.

            // Logs for debugging purposes
            const shouldLog = (level < 1);
            var msg = "couldn't pour! reason: ";
            if (otherTube.isFull()) {
                msg += "recieving tube is too full";
            }
            else if (otherTube.getTopWaterType() != this.getTopWaterType()) {
                msg += "water types don't match";
            }
            else if (this.isEmpty()) {
                msg += "pouring tube is empty";
            }
            else {
                msg += "uncaught :(";
                shouldLog = true;
            }
            if (shouldLog) console.log(msg);

            // No water was poured.
            return false;
        }
    }

    //Checks if this tube is 100% full *and* all the same type of water!
    checkForCompletion() {
        this.updateSize();

        // Cut out some work by failing early if isFull is false.
        if (!this.isFull()) {
            if (this.isEmpty()) {
                console.log(this.ID + " incomplete: is empty");
            }
            else console.log(this.ID + " incomplete: not full");
            return false;
        }

        // Old allMatching code
        //const allMatching = (this.contents.every((val, i, arr) => val == arr[0])); //Pulled this from stack overflow, I don't understand a bit of it haha. source: https://stackoverflow.com/questions/14832603/check-if-all-values-of-array-are-equal


        // check if all water in tube matches...
        // Declare a variable which assumes the water matches. (We know the tube isn't empty, so we don't have to worry about false positives.)
        var allMatching = true;
        // Save the top water type.
        const waterType = this.getTopWaterType();
        // Loop thru tube.
        for (let water of this.contents) {
            // If any level of water doesn't match what's on top, then obviously our tube is not all matching.
            if (water != waterType) {
                console.log(this.ID + " incomplete: not matching itself");
                allMatching = false;
                break;
            }
        }
        // If all levels of water matched what was on top, then they all match each other, so we are all matching.
        // This might be faster than the previous code, IDK, but at least I understand it.

        
        // Since we already know isFull must be true, we just return allMatching.
        return allMatching;
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
        if (this.isEmpty()) return 0;
        return parseInt(this.toString());
    }

    toHTML() {
        const str = [];
        str.push(`<div class="watertube" id="${this.ID}" onclick="select(${this.ID})">`);
        str.push(`   <div class="water water${this.contents[3]}"></div>`);
        str.push(`   <div class="water water${this.contents[2]}"></div>`);
        str.push(`   <div class="water water${this.contents[1]}"></div>`);
        str.push(`   <div class="water water${this.contents[0]}"></div>`);
        str.push(`</div>`);

        return str.join("\n");
    }
}

//STATIC FUNCTIONS
/** Fetches water colors from CSS. Returns them as an array */
function getWaterColors() {
    const computedStyles = getComputedStyle(document.querySelector(':root'));

    //Number of colors is known ahead of time, so we can do a for loop on that
    for (let i = 0; i <= 6; i++) {
        waterTypeKey.push(computedStyles.getPropertyValue('--water_' + i));
    }

    console.log(waterTypeKey);
}

/**
 * Sets water colors in CSS based on given colors array.
 * 
 * Do not include water_0 - array should be length 5
 */
function setWaterColors(presetName) {
    const root = document.querySelector(':root');
    for (let i = 1; i <= 6; i++) {
        root.style.setProperty('--water_'+i, waterPresets[presetName][i-1]);
    }
    
}

/** Generates a random level. */
function generateLevel() {
    console.log("the man behind the water"); //silly :3 (improved silliness thanks to my friend finalfloof)
    
    //Clear the previous tubes
    // TODO: Do we need to deliberately dispose of those tubes?
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
        // Only save non-empty tubes
        if (!tube.isEmpty()) {
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

    // Empty tubes aren't included in save keys, so make sure to add them.
    addEmptyTube(2)
}

/** Adds one or more empty tubes to the playspace.
 * @param tubesCount {number} How many empty tubes to add.
*/
function addEmptyTube(tubesCount = 1) {
    for (let i = 0; i < tubesCount; i++) {
        waterTubes.push(new WaterTube([0, 0, 0, 0]));
    }
    render();
}

/** Updates the HTML to reflect the game!*/
function render() {
    /* TEMPLATE
    <div class="watertube">
        <div class="water top"></div>
        <div class="water topmid"></div>
        <div class="water botmid"></div>
        <div class="water bottom"></div>
    </div>
    */
    var display = [];
    // TODO: Target individual tubes for updates, instead of instantializing the whole playspace...

    //console.log(waterTubes);
    for (tube of waterTubes) {
        //console.log(tube);
        //console.log(tube.toHTML());
        display.push(tube.toHTML());
    }

    $("#watersort")[0].innerHTML = display.join("\n");

    checkForWin();
}

/** Changes the "selected" tube to the given one! */
function select(i) {
    const selector = '#'+i;
    
    // selecting same tube
    if (i == selectedTube) {
        //same tube as before? deselect and set selected to invalid
        $(selector)[0].classList.remove("selected");

        selectedTube = -1;
    }
    // previously had nothing selected
    else if (selectedTube == -1) {
        //tube was previously invalid? select the new tube
        $(selector)[0].classList.add("selected");

        selectedTube = i;
    }
    // previously had empty tube selected
    else if (waterTubes[selectedTube].isEmpty()) {
        //was selecting an empty tube before, so probably wants to switch to selecting this new tube instead since can't pour.
        //document.getElementById(selectedTube).classList.remove("selected");

        for (elmnt of document.getElementsByClassName("selected")) {
            elmnt.classList.remove("selected");
        }

        $(selector)[0].classList.add("selected");

        //Select new tube
        selectedTube = i;
    }
    // otherwise, it's gotta be two different tubes.
    else {
        // Try to pour from the formerly selected tube to the newly selected tube.
        waterTubes[selectedTube].pourTo(waterTubes[i]);

        for (elmnt of $(".selected")) {
            elmnt.classList.remove("selected");
        }
        //document.getElementById(selectedTube).classList.remove("selected");

        // TODO: At this moment, we have gamecode updated, and IDs of both changed tubes.
        // This would be the perfect time to update the INDIVIDUAL tubes in HTML instead of a whole render function.

        // Deselect tubes
        selectedTube = -1;
        // Render changes
        // If call to render is removed, consider calling checkForWin in this function.
        render();
    }
}

/** 
 * Checks for win conditions!
 * 
 * Win condition: Every tube is either (100% full of the same color) or (empty).
 */
function checkForWin() {
    var allComplete = true;
    for (tube of waterTubes) {
        // We're looking for FAIL conditions here.
        // All tubes should be either COMPLETE or EMPTY. If neither applies, we fail.
        if (!(tube.checkForCompletion() || tube.isEmpty())) {
            //This tube NOT all matched!
            console.log("win checker failed at "+tube.ID);
            allComplete = false;
            break;
        }
    }
    if (allComplete) {
        victoryPopUp();
    }
}

/** Shows the victory popup screen. */
function victoryPopUp() {
    // This is in its own script.
    vPopUp.open();
}

/** Runs on page load. */
function main() {
    getWaterColors();
    generateLevel();
    //const testTube = new WaterTube([1,1,1,1]);
    //console.log(testTube.updateSize());
}