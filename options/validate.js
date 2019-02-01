/*
 *
 * SUMMARY: This file keeps all of the option javascript for the validate tab. 
 *
 */

/*
 * Get all the elements we'll need for later.
 */
const status = document.getElementById('vStatus');
const fileUploader = document.getElementById('fileUploader');
const uploadedImage = document.getElementById('uploadedImage');
const predictButton = document.getElementById('predictButton');
const result = document.getElementById('vResult');

/*
 * ml5.js global definitions. These are initialized in initialize().
 */
let features;
let classifier;




//We need to do this to get the updated model.
document.getElementById("tab4").addEventListener("click", function () {
    initialize();
});


/*
 * Function to configure feature extractor, classifier, and load ml5 model. We set status and timing before and after to indicate completion.
 * 
 * How to time a JS function: https://stackoverflow.com/questions/313893/how-to-measure-time-taken-by-a-function-to-execute
 * How to load models using ml5 >=0.1.3: https://codepen.io/kotobuki/pen/yRzGZL?editors=0011
 */

function initialize() {
    updateStatus("Loading Feature Extractor...");
    features = ml5.featureExtractor('MobileNet', () => {
        /*
         * This is a weird thing that may or may not have been fixed in new version. With more than 2 classes it was refusing to pick up more classes.
         * https://github.com/ml5js/ml5-library/issues/164
         */
        //features.numClasses=3;
        updateStatus("Loading Classifier...");
        classifier = features.classification();
        loadModel();
    });
}
//Load Model
function loadModel() {
    updateStatus("Loading Model...");
    var t0 = performance.now();
    classifier.load("./external/ml5/model.json", () => {
        var t1 = performance.now();
        updateStatus("Model Loaded in " + (t1 - t0).toFixed(2) + " ms.");
    });
}

/*
 * Function that displays that feature extractor is ready.
 */
function featureExtractorReady() {
    updateStatus("Feature Extractor Ready.");
}

/*
 * Handles updating the status variable, this is abstracted so that we can change the status variable painlessly.
 */
function updateStatus(updateString) {
    status.innerHTML = updateString;
}

/* 
 * Reads the first file in file uploader. 
 */
fileUploader.oninput = function () {
    if (fileUploader.files && fileUploader.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            uploadedImage.src = e.target.result;
        }
        reader.readAsDataURL(fileUploader.files[0]);
    }
};

/*
 * Predict button event.
 */
predictButton.addEventListener("click", function () {
    predictImages();
});

function predictButtonDisabled(disabled) {
    predictButton.disabled = disabled;
}

/*
 * Predict image(s).
 */
function predictImages() {
    var t0 = performance.now();
    classifier.classify(uploadedImage, function (err, results) {
        if (err) {
            result.innerHTML = err;
        } else {
            var t1 = performance.now();
            result.innerHTML = results + " in " + (t1-t0).toFixed(2) + " ms.";
        }
    });
}