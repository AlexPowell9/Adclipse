/*
 *
 * SUMMARY: This file keeps all of the option javascript for the image recognition tab. 
 *
 */

/*
 * Get all the elements we'll need for later.
 */
//Model
const modelStatus = document.getElementById('modelStatus');
const modelLabels = document.getElementById('modelLabels');
const modelToggle = document.getElementById('modelToggle');
let modelToggleValue = false;
let modelLoading = true;
//Validation 
const vFileUploader = document.getElementById('vFileUploader');
const uploadedImage = document.getElementById('uploadedImage');
const predictButton = document.getElementById('predictButton');
const vResult = document.getElementById('vResult');
//Training
const tFileUploader = document.getElementById('tFileUploader');
const tFileResults = document.getElementById('tFileResults');
const tPictureLabel = document.getElementById('tPictureLabel');
const saveButton = document.getElementById('saveButton');
const trainButton = document.getElementById('trainButton');
const tResult = document.getElementById('tResult');

/*
 * ml5.js global definitions. These are initialized in vInitialize().
 */
let features;
let classifier;
//let regressor


/*
 *
 * Model Functions
 *
 */

//Call initialize
modelInitialize();


/*
 * Function to configure feature extractor, classifier, and load ml5 model. We set status and timing before and after to indicate completion.
 * 
 * How to time a JS function: https://stackoverflow.com/questions/313893/how-to-measure-time-taken-by-a-function-to-execute
 * How to load models using ml5 >=0.1.3: https://codepen.io/kotobuki/pen/yRzGZL?editors=0011
 */
function modelInitialize() {
    modelUpdateStatus("Loading Feature Extractor...");
    features = ml5.featureExtractor('MobileNet', () => {
        /*
         * This is a weird thing that may or may not have been fixed in new version. With more than 2 classes it was refusing to pick up more classes.
         * https://github.com/ml5js/ml5-library/issues/164
         */
        features.numClasses = 20;

        //Default to loading custom model.
        loadModel();
    });
}
//Load Model
function loadModel() {
    modelUpdateStatus("Loading Classifier...");
    classifier = features.classification();
    //regressor = features.regression();
    modelUpdateStatus("Loading Model...");
    var t0 = performance.now();
    //regressor.load("./external/ml5/model/model.json", () => {
    classifier.load("./external/ml5/model/model.json", () => {
        var t1 = performance.now();
        modelUpdateStatus("Model Loaded in " + (t1 - t0).toFixed(2) + " ms.");
    });
    //usage:
    readTextFile("./external/ml5/model.json", function (text) {
        var data = JSON.parse(text);
        /*
         * Removes any unwanted nodes from previous calls.
         * https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
         */
        while (modelLabels.firstChild) {
            modelLabels.removeChild(modelLabels.firstChild);
        }
        //Gets labels and puts them in DOM.
        data.ml5Specs.mapStringToIndex.forEach(value => {
            var li = document.createElement("li");
            li.innerHTML = value;
            modelLabels.insertBefore(li, null);
        });
    });
    modelLoading = false;
}
//New Model
function newModel() {
    modelLoading = true;
    while (modelLabels.firstChild) {
        modelLabels.removeChild(modelLabels.firstChild);
    }
    modelUpdateStatus("Loading Feature Extractor...");
    features = ml5.featureExtractor('MobileNet', () => {
        features.numClasses = 20;
        modelUpdateStatus("Loading Classifier...");
        classifier = features.classification();
        //regressor = features.regression();
        modelUpdateStatus("Clean Model Loaded!");
        modelLoading = false;
    });
}

/*
 * Handles updating the status variable, this is abstracted so that we can change the status variable painlessly.
 */
function modelUpdateStatus(updateString) {
    modelStatus.innerHTML = updateString;
}

/*
 * Toggle controller
 * https://codepen.io/alexroper/pen/doRLyK
 */
function toggleModelToggle() {
    if (modelLoading) {
        return;
    }
    if (modelToggleValue) {
        modelToggle.classList.remove("active");
        loadModel();
    } else {
        modelToggle.classList.add("active");
        newModel();
    }
    modelToggleValue = !modelToggleValue;
}

//Listen for toggle
modelToggle.addEventListener("click", function (event) {
    event.preventDefault();
    toggleModelToggle();
});


/*
 *
 * Validation Functions
 *
 */


/* 
 * Reads the first file in file uploader. 
 */
vFileUploader.oninput = function () {
    if (vFileUploader.files && vFileUploader.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            uploadedImage.src = e.target.result;
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
    if (!uploadedImage.src) {
        vResult.innerHTML = "Error: No Image Uploaded!";
        return;
    }
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


/*
 *
 * Training Functions
 *
 */


/* 
 * Reads the all the files in file uploader. 
 *
 * http://jsfiddle.net/n98rqhaL/
 */
tFileUploader.oninput = function () {
    var files = event.target.files; //FileList object
    var output = tFileResults;
    //Reset results area
    output.innerHTML = "";
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        //Only pics
        if (!file.type.match('image'))
            continue;
        var picReader = new FileReader();
        picReader.addEventListener("load", function (event) {
            //Populate the results div with the picture thumbnails
            var picFile = event.target;
            var div = document.createElement("div");
            div.innerHTML = "<img crossOrigin width='224' height='224' class='thumbnail' src='" + picFile.result + "'/>";
            output.insertBefore(div, null);
            //classifier.addImage(div.childNodes[0], 'Other');
        });
        //Read the image
        picReader.readAsDataURL(file);
    }
};

/*
 * Load images into classfier.
 */
async function loadTrainingImages(picLabel) {
    updateLabelList(picLabel);
    for (var i = 0; i < tFileResults.childNodes.length; i++) {
        await classifier.addImage(tFileResults.childNodes[i].childNodes[0], picLabel);
    }
}

/*
 * Update list of labels.
 */
function updateLabelList(label) {
    let exists = false;
    for (var i = 0; i < modelLabels.childNodes.length; i++) {
        if (label == modelLabels.childNodes[i].innerHTML) {
            exists = true;
            break;
        }
    }
    if (!exists) {
        var li = document.createElement("li");
        li.innerHTML = label;
        modelLabels.insertBefore(li, null);
    }
}


/*
 * Train button event.
 */
trainButton.addEventListener("click", function () {
    trainModel();
});

/*
 * Train Model.
 */
async function trainModel() {
    /*
     * check for at least 3 images
     * https://github.com/ml5js/ml5-library/issues/185
     */
    if (tFileResults.childNodes.length < 3) {
        tResult.innerHTML = "Error: Please select at least 3 images!";
        return;
    }
    //Load images
    tResult.innerHTML = "Loading Images...";
    await loadTrainingImages(tPictureLabel.value);
    //Train
    classifier.train(function (lossValue) {
        console.log(lossValue);
        if (lossValue != null) {
            tResult.innerHTML = 'Training: Loss is ' + lossValue;
        } else {
            tResult.innerHTML = "Training Complete!";
        }

    });
}

/*
 * Save button event.
 */
saveButton.addEventListener("click", function () {
    classifier.save(() => {
        console.log("Saved!")
    });
});


/*
 * Reads text file. Used for getting labels from model.json
 * https://stackoverflow.com/a/34579496
 */
function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}