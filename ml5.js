/*
 * ml5 module
 * Called from content.js. Processes potentional ad containers
 * Returns: containers that are ads
 */

let ML5 = {};
var adsFound = 0;

ML5.process = async function (containers) {
    var adContainers = [];
    var allCanvases = [];
    var canvasPromises = convertToCanvases(containers);

    // wait for html2canvas to convert containers to canvases
    await Promise.all(canvasPromises).then(canvases => {
        allCanvases = canvases;
        console.log("converted all containers");
    });


    // wait for tesseract to analyze the canvases/containers
    await Promise.all(processImages(allCanvases)).then(results => {
        results.forEach(function (result, index) {
            console.log('Tesseract Result:', tesseractResult(result));
            if (result.text.includes("PROMOTED") ||
                result.text.includes("PRDMDVED") ||
                result.text.includes("FROMOTED") ||
                result.text.includes("ADVERTISEMENT") ||
                result.text.includes("Anvzmsmm")
            ) {
                adContainers.push(containers[index]);
            }
        });
    });



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
 * OCR Images
 * Takes in canvases, converts them to image data, puts image data through Tesseract
 * Returns: Tesseract promises
 */

function processImages(canvases) {
    let promises = [];
    canvases.forEach(canvas => {
        let ctx = canvas.getContext('2d');
        var expanded = ctx.getImageData(0, 0, canvas.width, canvas.height);
        console.log(expanded);
        chrome.runtime.sendMessage({
            classifyImage: expanded
        }, function (response) {
            console.log("Response Recieved: " + response.response);
        });

        promises.push(Tesseract.recognize(expanded));
    });
    return promises;
}