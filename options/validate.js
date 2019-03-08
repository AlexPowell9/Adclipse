/*
 *
 * SUMMARY: This file keeps all of the option javascript for the validate tab. 
 *
 */

/*
 * Get all the elements we'll need for later.
 */
const vStatus = document.getElementById('vStatus');
const vFileUploader = document.getElementById('vFileUploader');
const uploadedImage = document.getElementById('uploadedImage');
const predictButton = document.getElementById('predictButton');
const vResult = document.getElementById('vResult');

/*
 * ml5.js global definitions. These are initialized in vInitialize().
 */
let features;
let classifier;
//let regressor




//We need to do this to get the updated model.
document.getElementById("tab4").addEventListener("click", function () {
    vInitialize();
});


/*
 * Function to configure feature extractor, classifier, and load ml5 model. We set status and timing before and after to indicate completion.
 * 
 * How to time a JS function: https://stackoverflow.com/questions/313893/how-to-measure-time-taken-by-a-function-to-execute
 * How to load models using ml5 >=0.1.3: https://codepen.io/kotobuki/pen/yRzGZL?editors=0011
 */
function vInitialize() {
    vUpdateStatus("Loading Feature Extractor...");
    features = ml5.featureExtractor('MobileNet', () => {
        /*
         * This is a weird thing that may or may not have been fixed in new version. With more than 2 classes it was refusing to pick up more classes.
         * https://github.com/ml5js/ml5-library/issues/164
         */
        //features.numClasses=3;
        vUpdateStatus("Loading Classifier...");
        classifier = features.classification();
        //regressor = features.regression();
        vLoadModel();
    });
}
//Load Model
function vLoadModel() {
    vUpdateStatus("Loading Model...");
    var t0 = performance.now();
    classifier.load("./external/ml5/model.json", () => {
        var t1 = performance.now();
        vUpdateStatus("Model Loaded in " + (t1 - t0).toFixed(2) + " ms.");
    });
}

/*
 * Function that displays that feature extractor is ready.
 */
function vFeatureExtractorReady() {
    vUpdateStatus("Feature Extractor Ready.");
}

/*
 * Handles updating the status variable, this is abstracted so that we can change the status variable painlessly.
 */
function vUpdateStatus(updateString) {
    vStatus.innerHTML = updateString;
}

/* 
 * Reads the first file in file uploader. 
 */
vFileUploader.oninput = function () {
    if (vFileUploader.files && vFileUploader.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            uploadedImage.src = e.target.result;
            console.log(uploadedImage);
        }
        reader.readAsDataURL(vFileUploader.files[0]);
    }
};

/*
 * Predict button event.
 */
predictButton.addEventListener("click", function () {
    vPredictImages();
});

function vPredictButtonDisabled(disabled) {
    predictButton.disabled = disabled;
}

/*
 * Predict image(s).
 */
function vPredictImages() {
    if(!uploadedImage.src){
        vResult.innerHTML = "Error: No Image Uploaded!";
        return;
    }
    console.log(uploadedImage);
    var t0 = performance.now();
    //regressor.predict(uploadedImage, function (err, results) {
    classifier.classify(uploadedImage, function (err, results) {
        if (err) {
            vResult.innerHTML = err;
        } else {
            console.log(results);
            var t1 = performance.now();
            vResult.innerHTML = results + " in " + (t1 - t0).toFixed(2) + " ms.";
        }
    });
}