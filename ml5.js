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

ML5.init = async () => {
    if(!classifier)await ml5Initialize();
    return ;
}

ML5.processSingle = async function(container) {
    return await convertToCanvas(container).then((canvas) => {
        return processImages(canvas);
    }).then(result => {
        if (result === 'Advertisement' || result === 'Promoted') return result;
        else return null;
    });
}

ML5.process = async function (containers) {
    var t0 = performance.now();
    await ml5Initialize();
    //print("Done loading ML5");
    var adContainers = [];
    var allCanvases = [];
    var canvasPromises = convertToCanvas(containers);

    // wait for html2canvas to convert containers to canvases
    var tC0 = performance.now();
    await Promise.all(canvasPromises).then(canvases => {
        allCanvases = canvases;
        console.log("converted all containers");
        var tC1 = performance.now();
        console.log("HTML2Canvas finished in " + (tC1 - tC0).toFixed(2) + " ms.");
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
 * Takes in containers and uses html2canvas to convert them to canvases
 * Returns: html2canvas promises
 */
function convertToCanvases(containers) {
    let promises = [];
    let options = {
        logging: false,
        ignoreElements: function (element) {
            // return element.tagName.toLowerCase() == 'iframe' || element.tagName.toLowerCase() == 'img';
            return element.tagName.toLowerCase() == 'iframe';
        }
    };
    containers.forEach(container => {
        promises.push(html2canvas(container, options))
    });
    return promises;
}

/*
 * Convert To Canvas
 * Takes in containers and uses html2canvas to convert them to canvases
 * Returns: html2canvas promises
 */
function convertToCanvas(container) {
    let options = {
        logging: false,
        ignoreElements: function (element) {
            // return element.tagName.toLowerCase() == 'iframe' || element.tagName.toLowerCase() == 'img';
            return element.tagName.toLowerCase() == 'iframe';
        }
    };
    return html2canvas(container, options);
}

/*
 * ML5 Images
 * Takes in canvases, converts them to image data, puts image data through Ml5
 * Returns: promises from the ml5 classifier
 */
function processImages(canvases) {
    let promises = [];

    canvases.forEach(function (canvas, index) {
        var img = new Image();
        img.crossOrigin = "anonymous";
        img.width = 224;
        img.height = 224;
        img.src = canvas.toDataURL();
        console.log(img.src);
        promises.push(classifier.classify(img));
    });
    return promises;
}