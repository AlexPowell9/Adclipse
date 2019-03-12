/*
 * SUMMARY: This file keeps all of the option javascript for the detection tab. 
 */

const methodToggle = document.getElementById('methodToggle');
let methodToggleValue = false;

/*
 * Get Detection Options from storage and apply them.
 */
var detectionStorageCopy = [];
chrome.storage.local.get("detection", function (returnedStorage) {
    if (returnedStorage['detection'] !== undefined) {
        detectionStorageCopy = JSON.parse(returnedStorage['detection']);
    } else {
        //Does not exist, so we create it with defaults
        detectionStorageCopy = getDetectionDefaults();
        updateDetectionStorage();
    }
    initializeDetectionOptions();
});


/*
 * Wrapper that updates Detection Options in storage with current copy.
 */
function updateDetectionStorage() {
    chrome.storage.local.set({
        "detection": JSON.stringify(detectionStorageCopy)
    }, function () {
        //Callback
        console.log("Detection Settings Updated!");
    });
}


/*
 * Return array of default option values, for when there are no options present in storage.
 */
function getDetectionDefaults() {
    var storage = {};
    //Grayscale
    storage.ml5 = {
        "active": true
    };
    return storage;
}

function initializeDetectionOptions() {
    console.log(detectionStorageCopy);
    if (!detectionStorageCopy.ml5.active) {
        methodToggle.classList.add("active");
        methodToggleValue = true;
    }
}

/*
 * Toggle controller
 * https://codepen.io/alexroper/pen/doRLyK
 */
function toggleMethodToggle() {
    if (methodToggleValue) {
        methodToggle.classList.remove("active");
        detectionStorageCopy.ml5.active = true;
        updateDetectionStorage();
    } else {
        methodToggle.classList.add("active");
        detectionStorageCopy.ml5.active = false;
        updateDetectionStorage();
    }
    methodToggleValue = !methodToggleValue;
}

//Listen for toggle
methodToggle.addEventListener("click", function (event) {
    event.preventDefault();
    toggleMethodToggle();
});