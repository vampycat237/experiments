class InfoPage {
    /** @type String */
    html;

    /**
     * Creates a new InfoPage.
     * @param {string} title A short description of what this page is about.
     * @param {string} content A multi-line blurb. Extremely basic Markdown-like formatting accepted.
     */
    constructor(title, content) {
        this.title = title;
        this.parse(content);
    }

    /**
     * Interprets the given string literal as HTML.
     * @param {string} content 
     */
    parse(content) {
        // Splits content into an array based on double paragraph breaks - this is where we should be using p elements.
        const paragraphs = content.trim().split('\n\n');
        const htmlArr = [];
        let tmpLines;
        for (p of paragraphs) {
            // Open paragraph tag
            htmlArr.push("<p>");

            // Break down lines of paragraphs
            tmpLines = p.split('\n')

            // Loop through these
            for (line of tmpLines) {
                htmlArr.push(line);
                htmlArr.push("<br>");
            }

            // Close paragraph tag
            htmlArr.push("</p>");
        }

        // Finished reading in content
        this.html = htmlArr.join('\n');
    }

    /**
     * Returns a HTML string representation of this object.
     */
    toHTML() {
        return this.html;
    }
}

class InfoPopUp {
    static #defaultPages = [
        ['navigation', 
            `
            the buttons at the top right work like this:
            
            [i] will give you information
            [_] will send you back to the directory
            [x] will send you to my site
            `
        ],
        ['notice', 
            `
            the experiments in the lab may or may not be finished or functional
            if you experience errors please report them to me tho!
            making an issue on the repository is the best way to ensure i see & remember it
            `
        ]
    ]

    /** 
     * Holds the various pages of information accessible through the popup.
     * @type {InfoPage[]} 
     */
    pages = [];

    constructor() {
        for (pair of InfoPopUp.#defaultPages) {
            this.pages.push(new InfoPage(pair[0],pair[1]));
        }
        
        /**
         * The page currently open in the info 'booklet.'
         * Defaults to the first non-generic info page.
         */
        this.currentPage = InfoPopUp.#defaultPages.length;
    }

    /**
     * Add a new page to the info 'notebook.'
     * @param {string} title A short description of what this page is about.
     * @param {string} content A multi-line blurb. Extremely basic Markdown-like formatting accepted.
     */
    addPage(title, content) {
        this.pages.push(new InfoPage(title, content))
    }

    /**
     * 
     * @returns Title of the currently open page.
     */
    getCurrentPageTitle() {
        return this.pages[this.currentPage].title;
    }

    /**
     * 
     * @returns HTML content of the currently open page.
     */
    getCurrentPageContent() {
        return this.pages[this.currentPage].toHTML();
    }

    /**
     * Turns the page by a given amount, in either direction.
     * @param {number} y Positive or negative integer, usually +1 or -1.
     */
    turnPage(y) {
        if (this.currentPage + y >= this.pages.length) {
            //turn page too high, loop to 0
            this.currentPage = 0;
        }
        else if (this.currentPage + y < 0) {
            //turn page too low, loop to max
            this.currentPage = this.pages.length - 1;
        }
        else {
            this.currentPage += y;
        }
        fancyInfoPopUp();
    }

    open() {
        // Set currentPopUp
        currentPopUp = InfoPopUp;
        // show page buttons
        $("#popup-pageback").show(); $("#popup-pagenext").show();

        // Open with current data
        openPopUp(this.getCurrentPageContent(), "info: " + this.getCurrentPageTitle());
    }
    static close() {
        // hide page buttons
        $("#popup-pageback").hide(); $("#popup-pagenext").hide();
        closePopUp();
    }
}

const iPopUp = new InfoPopUp;