class VictoryPopUp {
    windowTitles = [
        "awesome!",
        "congratz!",
        "super!",
        "swag!",
        "yippee!",
        ":D",
        "winner!"
    ];
    msgs = [
        "you completed the level!",
        "truly, you are the organizer.",
        "you water sorter, you.",
        "i knew you could do it.",
        "everybody look out, we got a water sorter in here!",
        "swagtastic!"
    ];
    msgChallenges = [
        "and you didn't use any ${BUTTON}s!",
        "without having to ${BUTTON} at all!",
        "${BUTTON} button? never heard of it."
    ];

    /** limit by windowTitles.length */
    #titleIndex = [0, this.windowTitles.length];
    /** limit by msgs.length */
    #msgIndex = [0, this.msgs.length];
    /** limit by msgChallenges.length */
    #msgChallengeIndex = [0, this.msgChallenges.length];
    /** limit by 3 */
    #randomIndex = [0, 3];

    /** Gets a usable index from a paired one. */
    get(index) {
        return index[0]%index[1];
    }

    getMsg() {
        var msg = this.msgs[this.get(this.#msgIndex)];
        this.#msgIndex[0]++;
        return msg;
    }
    
    getTitle() {
        var title = this.windowTitles[this.get(this.#titleIndex)];
        this.#titleIndex[0]++;
        return title;
    }

    open() {
        // Set currentPopUp
        currentPopUp = VictoryPopUp;
        // Show buttons
        $('#popup-victory-button').show();

        // Open with current data
        openPopUp(this.getMsg(), this.getTitle());
        // Fetching those values increments them afterwards, so we don't have to worry about that.

        // 25% chance to randomly increment something a second time
        if (Math.random() <= 0.25) {
            switch (this.get(this.#randomIndex)) {
                case 0:
                    this.#titleIndex[0]++;
                    break;
                case 1:
                    this.#msgIndex[0]++;
                    break;
                case 2:
                    this.#msgChallengeIndex[0]++;
                    break;
            }

            // then, increment iRandom (looping around if too large)
            this.#randomIndex[0]++;
        }
    }

    static close() {
        // Hide button
        $('#popup-victory-button').hide();
    }
}

const vPopUp = new VictoryPopUp;