/*
 *
 * SUMMARY: This file keeps all of the option javascript for the train tab. 
 *
 */

/*
 * Get all the elements we'll need for later.
 */
const tStatus = document.getElementById('tStatus');
const tFileUploader = document.getElementById('tFileUploader');
const tResult = document.getElementById('tResult');
const trainButton = document.getElementById('trainButton');
const tUploadedImage = document.getElementById('tUploadedImage');
const tFileResults = document.getElementById('tFileResults');
const tPictureLabel = document.getElementById('tPictureLabel');
const saveButton = document.getElementById('saveButton');

/*
 * ml5.js global definitions. These are initialized in tInitialize().
 */
let tFeatures;
let tClassifier;


//We need to do this to get the updated model.
document.getElementById("tab5").addEventListener("click", function () {
    tInitialize();
});


/*
 * Function to configure feature extractor, classifier, and load ml5 model. We set status and timing before and after to indicate completion.
 * 
 * How to time a JS function: https://stackoverflow.com/questions/313893/how-to-measure-time-taken-by-a-function-to-execute
 * How to load models using ml5 >=0.1.3: https://codepen.io/kotobuki/pen/yRzGZL?editors=0011
 */
function tInitialize() {
    tUpdateStatus("Loading Feature Extractor...");
    tFeatures = ml5.featureExtractor('MobileNet', () => {
        /*
         * This is a weird thing that may or may not have been fixed in new version. With more than 2 classes it was refusing to pick up more classes.
         * https://github.com/ml5js/ml5-library/issues/164
         */
        //features.numClasses=3;
        tUpdateStatus("Loading Classifier...");
        tClassifier = tFeatures.classification();
        tLoadModel();
    });
}
//Load Model
function tLoadModel() {
    tUpdateStatus("Loading Model...");
    var t0 = performance.now();
    tClassifier.load("./external/ml5/model/model.json", () => {
        var t1 = performance.now();
        tUpdateStatus("Model Loaded in " + (t1 - t0).toFixed(2) + " ms.");
    });
}


/*
 * Handles updating the status variable, this is abstracted so that we can change the status variable painlessly.
 */
function tUpdateStatus(updateString) {
    tStatus.innerHTML = updateString;
}

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
            //tClassifier.addImage(div.childNodes[0], 'Other');
        });
        //Read the image
        picReader.readAsDataURL(file);
    }
};


function tLoadLabels() {

}

/*
 * Load images into classfier.
 */
async function loadTrainingImages(picLabel) {
    for (var i = 0; i < tFileResults.childNodes.length; i++) {
        await tClassifier.addImage(tFileResults.childNodes[i].childNodes[0], picLabel);
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
    tClassifier.train(function (lossValue) {
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
    tClassifier.save(() => {
        console.log("Saved!")
    });
});

