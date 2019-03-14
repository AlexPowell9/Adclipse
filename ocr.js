/*
 * OCR module
 * Called from content.js. Processes potentional ad containers
 * Returns: containers that are ads
 */

let OCR = {};
var adsFound = 0;

//This is the variable where the screenshot is stored.
var dataUrl = null;

OCR.process = async function(containers) {
    var t0 = performance.now();

    //Get Screenshot of current tab from background
    var tS0 = performance.now();
    await GetTabScreenshot().then((response) => {
        dataUrl = response.response; //Screenshot in DataUrl form
        var tS1 = performance.now();
        console.log("Got Tab Screenshot in " + (tS1 - tS0).toFixed(2) + " ms.");
    });

    var adContainers = [];
    var allCanvases = [];
    var canvasPromises = convertToCanvases(containers);

    // // wait for html2canvas to convert containers to canvases
    // await Promise.all(canvasPromises).then(canvases => {
    //     allCanvases = canvases;
    // });

    // wait for screen cropping to convert containers to canvases
    var tC0 = performance.now();
    await Promise.all(canvasPromises).then(canvases => {
        //console.log(canvases);
        allCanvases = canvases;
        //console.log("converted all containers");
        var tC1 = performance.now();
        console.log("Screenshot Processing finished in " + (tC1 - tC0).toFixed(2) + " ms.");
    });

    // wait for tesseract to analyze the canvases/containers
    var tM0 = performance.now();
    await Promise.all(ocrimages(allCanvases)).then(results => {
        results.forEach(function(result, index) {
            if(result){
                console.log('Tesseract Result:' + index, tesseractResult(result));
                if(result.text.includes("PROMOTED") 
                    || result.text.includes("PRDMDVED")
                    || result.text.includes("FROMOTED")
                    || result.text.includes("PROMUTED")
                    || result.text.includes("ADVERTISEMENT")
                    || result.text.includes("Anvzmsmm")
                    || result.text.includes("Anvzmsmw")
                    ) {
                    adContainers.push(containers[index]);
                }
            }
        });
        var tM1 = performance.now();
        console.log("OCR finished in " + (tM1 - tM0).toFixed(2) + " ms.");
    });

    var t1 = performance.now();
    console.log("Adclipse finished in " + (t1 - t0).toFixed(2) + " ms.");

    // return the containers that OCR thinks have ads
    return adContainers;

}


/*
 * Convert To Canvas
 * Takes in containers and uses html2canvas to convert them to canvases
 * Returns: html2canvas promises
 */

function convertToCanvases(containers) {
    // let promises = [];
    // let options = {
    //     logging: false,
    //     ignoreElements: function(element) {
    //         return element.tagName.toLowerCase() == 'iframe' || element.tagName.toLowerCase() == 'img';
    //         // return element.tagName.toLowerCase() == 'iframe';
    //     }
    // };
    // containers.forEach(container => {
    //     promises.push(html2canvas(container, options))
    // });
    // return promises;
    let promises = [];
    containers.forEach(container => {
        //Ignore already identified ads and stuff that doesnt exist
        if (!container || !container.classList){
            promises.push(null);
            return;
        }else if(container.classList.contains("adclipseIdentified")){
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
        } else if (window.innerHeight - dimensions.top < dimensions.height / 1.5) {
            promises.push(null);
            return;
        }
        promises.push(prepareImage(dimensions));
    });
    return promises;
}


/*
 * OCR Images
 * Takes in canvases, converts them to image data, puts image data through Tesseract
 * Returns: Tesseract promises
 */

function ocrimages(canvases) {
    // let promises = [];
    // canvases.forEach(canvas => {
    //     let ctx = canvas.getContext('2d');
    //     var expanded = ctx.getImageData(0,0, canvas.width, canvas.height);
    //     promises.push(Tesseract.recognize(expanded));
    // });
    // return promises;
    let promises = [];

    canvases.forEach(canvas => {
        // console.log(canvas);
        if(canvas) promises.push(Tesseract.recognize(canvas));
        else promises.push(null);
    });
    return promises;
}


/*
 * Tesseract Result
 * Makes tesseract results pretty for printing
 * Returns: nicely formatted tesseract result
 */

 function tesseractResult(result) {
     if(!result) return "its null";
     let r = {
         text: result.text,
         confidence: result.confidence
     };
     return r;
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
        }
        image.src = dataUrl;
        //console.log(canvas.toDataURL("image/png"));
    });
}