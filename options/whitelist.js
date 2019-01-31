/*
* This file keeps all of the option javascript for the whitelist tab. 
*/



/*
 * Declare CodeMirror area which replaces whitelist text area in DOM. This makes editing whitelist a nice experience.
 * 
 * https://codemirror.net/
 */
var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("whitelist"), {
    lineNumbers: true,
    gutter: true,
    lineWrapping: true,
});

//We need to do this because the whitelist is originally hidden.
document.getElementById("tab3").addEventListener("click", function () {
    myCodeMirror.refresh();
});

//Cancel Event for whitelist tab.
document.getElementById("whitelistCancel").addEventListener("click", function () {
    disableButtons(true);
    myCodeMirror.setValue(formatWhitelistForCodeMirror());
});

//Apply Changes Event for whitelist tab. 
document.getElementById("whitelistApply").addEventListener("click", function () {
    disableButtons(true);
    var newWhitelistArray = [];
    /*
     * Split by newline character
     * https://stackoverflow.com/questions/17101972/how-to-make-an-array-from-a-string-by-newline-in-javascript
     */
    myCodeMirror.getValue().split("\n").forEach(value => {
        /*
         * Removes whitespace on both ends of string.
         */
        value = value.trim();
        if (value.length <= 0) {
            return;
        }
        //Commit
        newWhitelistArray.push(value);
    });
    //Update Whitelist
    whitelistStorageCopy = newWhitelistArray;
    updateWhitelistStorage();
});

/*
 * Register an on change event to enable buttons.
 *
 * https://stackoverflow.com/a/6812298
 */
myCodeMirror.on("change", function (cm, change) {
    var newWhitelistArray = [];
    var valid = true;
    /*
     * Split by newline character
     * https://stackoverflow.com/questions/17101972/how-to-make-an-array-from-a-string-by-newline-in-javascript
     */
    myCodeMirror.getValue().split("\n").forEach(value => {
        /*
         * Removes whitespace on both ends of string.
         */
        value = value.trim();
        if (value.length <= 0) {
            return;
        }
        /*
         * Check if string has space in it, if so, return invalid.
         * https://stackoverflow.com/questions/8046318/checking-space-between-text-in-javascript
         */
        if (value.match(' ')) {
            valid = false;
        }
        newWhitelistArray.push(value);
    });
    
    //Disable buttons if is not valid, or is the same as current array list.
    if (!valid) {
        console.log(valid);
        disableButtons(true);
    } else {
        if (!arraysEqual(whitelistStorageCopy, newWhitelistArray)) {
            disableButtons(false);
        } else {
            disableButtons(true);
        }
    }
});

//Manage enabling and disabling of whitelist buttons
function disableButtons(disabled) {
    document.getElementById("whitelistCancel").disabled = disabled;
    document.getElementById("whitelistApply").disabled = disabled;
}

/*
 * Check if two arrays are equal.
 *
 * https://stackoverflow.com/questions/4025893/how-to-check-identical-array-in-most-efficient-way
 */
function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;
    for (var i = arr1.length; i--;) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
}

function isWhitelistValid() {
    var newWhitelistArray = [];
    var valid = true;
    /*
     * Split by newline character
     * https://stackoverflow.com/questions/17101972/how-to-make-an-array-from-a-string-by-newline-in-javascript
     */
    myCodeMirror.getValue().split("\n").forEach(value => {
        /*
         * Removes whitespace on both ends of string.
         */
        value = value.trim();
        if (value.length <= 0) {
            return;
        }
        /*
         * Check if string has space in it, if so, return invalid.
         * https://stackoverflow.com/questions/8046318/checking-space-between-text-in-javascript
         */
        if (value.match(' ')) {
            valid = false;
        }
    });
    return valid;
}


/*
 * Get Whitelist and display in CodeMirror window.
 */
var whitelistStorageCopy = [];
chrome.storage.local.get("whitelist", function (returnedStorage) {
    if (returnedStorage['whitelist'] !== undefined) {
        whitelistStorageCopy = returnedStorage['whitelist'];
    }
    myCodeMirror.setValue(formatWhitelistForCodeMirror());
});


/*
 * Takes whitelist storage array and turns it into a list that looks good in the CodeMirror window.
 */
function formatWhitelistForCodeMirror() {
    //Seperate array items with a newline instead of a comma
    var formattedString = whitelistStorageCopy.toString().split(",").join("\n");
    //Add trailing newline to make things nice
    formattedString += "\n";
    return formattedString;
}

/*
 * Wrapper that updates Whitelist in storage with current copy.
 */
function updateWhitelistStorage() {
    //Update with new
    chrome.storage.local.set({
        "whitelist": whitelistStorageCopy
    }, function () {
        //Callback
        console.log("Whitelist Updated!");
        //Update list to reflect whitelist. Formatting may have changed something.
        myCodeMirror.setValue(formatWhitelistForCodeMirror());
    });
}


/*
 * Check if url string is valid.
 *
 * https://www.w3resource.com/javascript-exercises/javascript-regexp-exercise-9.php
 */
function isValidURL(str) {
    regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    if (regexp.test(str)) {
        return true;
    } else {
        return false;
    }
}