/*
 * ml5 module
 * Called from content.js. Processes potentional ad containers
 * Returns: containers that are ads
 */

let ML5 = {};
var adsFound = 0;
var features;
var classifier;

function ml5Initialize() {
    return new Promise(function(resolve, reject) {
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

//Load Model
// function ml5LoadModel() {
//     console.log("Loading Model...");
//     var t0 = performance.now();
//     //https://developer.chrome.com/extensions/content_scripts
//     classifier.load(chrome.runtime.getURL("external/ml5/model.json"), () => {
//         var t1 = performance.now();
//         console.log("Model Loaded in " + (t1 - t0).toFixed(2) + " ms.");
//     });
// }

ML5.process = async function (containers) {
    await ml5Initialize();
    print("Done loading ML5");
    var adContainers = [];
    var allCanvases = [];
    var canvasPromises = convertToCanvases(containers);

    // wait for html2canvas to convert containers to canvases
    await Promise.all(canvasPromises).then(canvases => {
        allCanvases = canvases;
        console.log("converted all containers");
    });


    // wait for ml5 to analyze the canvases/containers
    await Promise.all(processImages(allCanvases, containers)).then(results => {
        print('Results of all', results);
        // results.forEach(function (result, index) {
        //     console.log('Tesseract Result:', tesseractResult(result));
        //     if (result.text.includes("PROMOTED") ||
        //         result.text.includes("PRDMDVED") ||
        //         result.text.includes("FROMOTED") ||
        //         result.text.includes("ADVERTISEMENT") ||
        //         result.text.includes("Anvzmsmm")
        //     ) {
        //         adContainers.push(containers[index]);
        //     }
        // });
    });

    // return processImages(allCanvases, containers);


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
            return element.tagName.toLowerCase() == 'iframe' || element.tagName.toLowerCase() == 'img';
            // return element.tagName.toLowerCase() == 'iframe';
        }
    };
    containers.forEach(container => {
        promises.push(html2canvas(container, options))
    });
    return promises;
}


/*
 * ML5 Images
 * Takes in canvases, converts them to image data, puts image data through Ml5
 * Returns: 
 */

function processImages(canvases, containers) {
    let promises = [];

    canvases.forEach(function(canvas, index) {
        let img = new Image();
        img.src = canvas.toDataURL();
        img.crossOrigin = "anonymous";
        img.width = 224;
        img.height = 224;
        promises.push(
            classifier.classify(img, function (err, results) {
                if (err) {
                    console.log("ML5 Classify Error" + err);
                } else {
                    console.log("ML5 Result:", results, img);
                    if (results === "Advertisement") {
                        console.log('adcontainer', containers[index]);
                        containers[index].classList.add('adclipseGrayscale');
                    }
                }
            })
        );

        // promises.push(new Promise(function(resolve, reject) {
        //     let img = new Image();
        //     img.src = canvas.toDataURL();
        //     img.crossOrigin = "anonymous";
        //     img.width = 224;
        //     img.height = 224;
        //     classifier.classify(img, function (err, results) {
        //         if (err) {
        //             console.log("ML5 Classify Error" + err);
        //             resolve(err);
        //         } else {
        //             console.log("ML5 Result: " + results, canvas);
        //             if (results === "Advertisement") {
        //                 promises.push(containers[index]);
        //             }
        //             resolve(results);
        //         }
        //     });
        // }));
    });
    return promises;
}