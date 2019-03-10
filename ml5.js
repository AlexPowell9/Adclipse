/*
 * ml5 module
 * Called from content.js. Processes potentional ad containers
 * Returns: containers that are ads
 */

let ML5 = {};
var adsFound = 0;
var features;
var classifier;

/*
 * Function to configure feature extractor, classifier, and load ml5 model. We set status and timing before and after to indicate completion.
 *
 * How to time a JS function: https://stackoverflow.com/questions/313893/how-to-measure-time-taken-by-a-function-to-execute
 * How to load models using ml5 >=0.1.3: https://codepen.io/kotobuki/pen/yRzGZL?editors=0011
 */
function ml5Initialize() {
    return new Promise(function (resolve, reject) {
        console.log("Loading Feature Extractor...");
        features = ml5.featureExtractor('MobileNet', () => {
            /*
             * This is a weird thing that may or may not have been fixed in new version. With more than 2 classes it was refusing to pick up more classes.
             * https://github.com/ml5js/ml5-library/issues/164
             */
            features.numClasses = 3;
            console.log("Loading Classifier...");
            classifier = features.classification();
            console.log("Loading Model...");
            var t0 = performance.now();
            //https://developer.chrome.com/extensions/content_scripts
            classifier.load(chrome.runtime.getURL("external/ml5/model.json"), () => {
                var t1 = performance.now();
                console.log("Model Loaded in " + (t1 - t0).toFixed(2) + " ms.");
                resolve("Done init ML5");
            });
        });
    });
}

//This is the variable where the screenshot is stored.
var dataUrl = null;
/*
 * This is the processing function that gets called from the content.js. 
 * Put anything that needs to run in here.
 */
ML5.process = async function (containers) {
    var t0 = performance.now();
    if (!classifier) {
        await ml5Initialize();
    }

    //Get Screenshot of current tab from background
    var tS0 = performance.now();
    await GetTabScreenshot().then((response) => {
        dataUrl = response.response; //Screenshot in DataUrl form
        var tS1 = performance.now();
        console.log("Got Tab Screenshot in " + (tS1 - tS0).toFixed(2) + " ms.");
    });

    //print("Done loading ML5");
    var adContainers = [];
    var allCanvases = [];
    var canvasPromises = convertToCanvases(containers);


    // wait for html2canvas to convert containers to canvases
    var tC0 = performance.now();
    await Promise.all(canvasPromises).then(canvases => {
        //console.log(canvases);
        allCanvases = canvases;
        //console.log("converted all containers");
        var tC1 = performance.now();
        console.log("Screenshot Processing finished in " + (tC1 - tC0).toFixed(2) + " ms.");
    });


    // wait for ml5 to analyze the canvases/containers
    var tM0 = performance.now();
    await Promise.all(processImages(allCanvases)).then(results => {
        results.forEach(function (result, index) {
            console.log('ML5 Result ' + index + ':', result);
            if (result === 'Advertisement' || result === 'Promoted') adContainers.push(containers[index]);
        });
        var tM1 = performance.now();
        console.log("ML5 finished in " + (tM1 - tM0).toFixed(2) + " ms.");
    });

    // not sure why Promise.all doesn't work for ml5, but this does what we want
    // processImages(allCanvases).forEach(function(val, index) {
    //     val.then(result => {
    //         console.log('Container ' + index + ' done: ', result);
    //         if(result === 'Advertisement') adContainers.push(containers[index]);
    //     });
    // });
    // OK JS is the worst. Promise.all wasn't working then it just decided that it would work all of sudden after
    // I implement its replacement. Excellent

    var t1 = performance.now();
    console.log("Adclipse finished in " + (t1 - t0).toFixed(2) + " ms.");

    // return the containers that ml5 thinks have ads
    return adContainers;

}


/*
 * Convert To Canvas
 * Takes in containers and figures out the dimensions, based on https://github.com/tlrobinson/element-capture 
 * 
 * SORTING HAT HACK WARNING! I dont bother sending elements that are outside of the screen area, so I pass a null instead. I do it this way because I didnt want to redo our whole architecture. 
 * 
 * Returns: promises
 */
function convertToCanvases(containers) {
    let promises = [];
    containers.forEach(container => {
        //Ignore already identified ads
        if (container.classList.contains("adclipseIdentified")) {
            promises.push(null);
            return;
        }
        //Define dimensions for position on page
        let dimensions = {};
        dimensions.top = -window.scrollY;
        dimensions.left = -window.scrollX;
        let element = container;
        //Get the top left coordinates by iterating through many parents.
        try {
            while (element !== document.body) {
                dimensions.top += element.offsetTop;
                dimensions.left += element.offsetLeft;
                element = element.offsetParent;
            }
        } catch (err) {
            //Sorting hat hack. See description for more details.
            promises.push(null);
            return;
        }
        dimensions.width = container.offsetWidth;
        dimensions.height = container.offsetHeight;
        // console.log(dimensions);
        // console.log("Width", window.innerWidth);
        // console.log("Height", window.innerHeight);
        if (dimensions.top > window.innerHeight || dimensions.top < 0) {
            //Sorting hat hack. See description for more details.
            promises.push(null);
            return;
        } else if (dimensions.left > window.innerWidth || dimensions.left < 0) {
            //Sorting hat hack. See description for more details.
            promises.push(null);
            return;
        }
        promises.push(prepareImage(dimensions));
    });
    return promises;
}


/*
 * ML5 Images
 * Takes in canvases, converts them to image data, puts image data through Ml5
 * Returns: promises from the ml5 classifier
 */
function processImages(canvases) {
    let promises = [];
    //console.log("Process");
    canvases.forEach(function (canvas, index) {
        //This is to support the crappy null hack I did.
        if (canvas == null) {
            promises.push(null);
            return;
        }
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.width = 224;
        img.height = 224;
        //This is for debugging the images we are putting through ml5.
        img.onload = () => {
            console.log("Called?");
            var w = window.open("");
            w.document.write(img.outerHTML);
        }
        img.src = canvas;
        promises.push(classifier.classify(img));
    });
    return promises;
}

/*
 * This function handles passing the containers to to the backend for screenshot processing and handles response.
 */
function GetTabScreenshot() {
    return new Promise(function (resolve, reject) {
        chrome.extension.sendMessage({
            getTabScreenshot: true
        }, function (response) {
            // console.log("Got Response!");
            // console.log(response);
            resolve(response);
        });
    });
}


var canvas = null;
/*
 * This function crops the screenshot to fit the dimensions of the element. Based on https://github.com/tlrobinson/element-capture
 */
function prepareImage(dimensions) {
    return new Promise(function (resolve, reject) {
        if (!canvas) {
            canvas = document.createElement("canvas");
            document.body.appendChild(canvas);
        }
        const image = new Image();
        image.onload = function () {
            //Trim the screenshot to specified dimensions
            canvas.width = dimensions.width;
            canvas.height = dimensions.height;
            var context = canvas.getContext("2d");
            context.drawImage(image,
                dimensions.left, dimensions.top,
                dimensions.width, dimensions.height,
                0, 0,
                dimensions.width, dimensions.height
            );
            var croppedDataUrl = canvas.toDataURL("image/png");
            resolve(croppedDataUrl);
            // //This is for viewing the trimmed areas in new tabs
            // chrome.tabs.create({
            //   url: croppedDataUrl,
            //   windowId: tab.windowId
            // });
        }
        image.src = dataUrl;
        //console.log(canvas.toDataURL("image/png"));
    });
}