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