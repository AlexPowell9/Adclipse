/*
 * SUMMARY: This is the where the functionality for the options page belongs. 
 *
 * https://developer.chrome.com/extensions/options
 */



/*
 * Get Whitelist and display.
 *
 */
var storageCopy = [];
chrome.storage.local.get("whitelist", function (returnedStorage) {
    if (returnedStorage['whitelist'] !== undefined) {
        storageCopy = returnedStorage['whitelist'];
    }
    console.log(storageCopy);
    document.getElementById("whitelist").appendChild(makeUL(storageCopy));
});

/*
 * Make an unordered list.
 *
 * https://stackoverflow.com/questions/11128700/create-a-ul-and-fill-it-based-on-a-passed-array
 */
function makeUL(array) {
    // Create the list element:
    var list = document.createElement('ul');
    for (var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        // Set its contents:
        item.appendChild(document.createTextNode(array[i]));

        // Add it to the list:
        list.appendChild(item);
    }
    // Finally, return the constructed list:
    return list;
}


/*
 * Listeners for checkbox changes.
 *
 * Pattern from : https://stackoverflow.com/questions/14544104/checkbox-check-event-listener
 */
var checkbox = document.querySelector("input[name=grayscale]");

//Grayscale
checkbox.addEventListener('change', function () {
    var element = document.getElementById("exampleAd");
    if (this.checked) {
        // Checkbox is checked..
        element.classList.add("grayscale");
    } else {
        // Checkbox is not checked..
        element.classList.remove("grayscale");
    }
});

//Color
checkbox = document.querySelector("input[name=color]");
checkbox.addEventListener('change', function () {
    var element = document.getElementById("exampleAd");
    if (this.checked) {
        // Checkbox is checked..
        element.classList.add("color");
    } else {
        // Checkbox is not checked..
        element.classList.remove("color");
    }
});

//Border
checkbox = document.querySelector("input[name=border]");
checkbox.addEventListener('change', function () {
    var element = document.getElementById("exampleAd");
    if (this.checked) {
        // Checkbox is checked..
        element.classList.add("border");
    } else {
        // Checkbox is not checked..
        element.classList.remove("border");
    }
});

//Label
checkbox = document.querySelector("input[name=label]");
checkbox.addEventListener('change', function () {
    var element = document.getElementById("exampleAd");
    if (this.checked) {
        // Checkbox is checked..
        element.classList.add("label");
    } else {
        // Checkbox is not checked..
        element.classList.remove("label");
    }
});


/*
 * To make Label and color work properly see how they overlay stuff here: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_image_overlay_fade
 */