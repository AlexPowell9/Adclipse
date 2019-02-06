/*
 * OCR module
 * Called from content.js. Processes potentional ad containers
 * Returns: containers that are ads
 */

let OCR = {};
var adsFound = 0;

OCR.process = async function(containers) {

    /////////////////////////////////////////////////////////////////////////
    // THE OLDER METHOD
    /////////////////////////////////////////////////////////////////////////

    // containers.forEach(container => {
    //     if(container !== null && container !== undefined && container !== "") {
    //         options = {
    //             logging: false,
    //             ignoreElements: function(element) {
    //                 return element.tagName.toLowerCase() == 'iframe' || element.tagName.toLowerCase() == 'img';
    //                 // return element.tagName.toLowerCase() == 'iframe';
    //             }
    //         };
    //         try {
    //             html2canvas(container, options).then((canvas) => {
    //                 let ctx = canvas.getContext('2d');
    //                 var expanded = ctx.getImageData(0,0, canvas.width, canvas.height);

    //                 Tesseract.recognize(expanded).then(function(result) {
    //                     console.log("TESSERACT RECOGNIZED:", result);
    //                     if(result.text.includes("PROMOTED") 
    //                         || result.text.includes("PRDMDVED")
    //                         || result.text.includes("FROMOTED")
    //                         || result.text.includes("ADVERTISEMENT")
    //                         || result.text.includes("Anvzmsmm")
    //                         ) {
    //                         // container.classList.add("adclipse-ad");
    //                         foundAd(container);
    //                     }
    //                 });
    //             });               

    //         } catch(e) {
    //             console.log('something went wrong');
    //         }
    //     }
    // });

    /////////////////////////////////////////////////////////////////////////
    // THE DEBATABLY CLEANER METHOD
    /////////////////////////////////////////////////////////////////////////

    var adContainers = [];
    var allCanvases = [];
    var canvasPromises = convertToCanvases(containers);

    // wait for html2canvas to convert containers to canvases
    await Promise.all(canvasPromises).then(canvases => {
        allCanvases = canvases;
    });

    // wait for tesseract to analyze the canvases/containers
    await Promise.all(ocrimages(allCanvases)).then(results => {
        results.forEach(function(result, index) {
            console.log('Tesseract Result:', tesseractResult(result));
            if(result.text.includes("PROMOTED") 
                || result.text.includes("PRDMDVED")
                || result.text.includes("FROMOTED")
                || result.text.includes("ADVERTISEMENT")
                || result.text.includes("Anvzmsmm")
                ) {
                adContainers.push(containers[index]);
            }
        });
    });

    // return the containers that OCR thinks have ads
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
        ignoreElements: function(element) {
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

function ocrimages(canvases) {
    let promises = [];
    canvases.forEach(canvas => {
        let ctx = canvas.getContext('2d');
        var expanded = ctx.getImageData(0,0, canvas.width, canvas.height);
        promises.push(Tesseract.recognize(expanded));
    });
    return promises;
}


/*
 * Tesseract Result
 * Makes tesseract results pretty for printing
 * Returns: nicely formatted tesseract result
 */

 function tesseractResult(result) {
     let r = {
         text: result.text,
         confidence: result.confidence
     };
     return r;
 }

