/*
 * OCR module
 */

 let OCR = {};
 var adsFound = 0;

 OCR.process = function(containers) {
     containers.forEach(container => {
        if(container !== null && container !== undefined && container !== "") {
            options = {
                logging: false,
                ignoreElements: function(element) {
                    return element.tagName.toLowerCase() == 'iframe' || element.tagName.toLowerCase() == 'img';
                    // return element.tagName.toLowerCase() == 'iframe';
                }
            };
            try {
                html2canvas(container, options).then((canvas) => {
                    let ctx = canvas.getContext('2d');
                    var expanded = ctx.getImageData(0,0, canvas.width, canvas.height);
                    
                    Tesseract.recognize(expanded).then(function(result) {
                        console.log("TESSERACT RECOGNIZED:", result);
                        if(result.text.includes("PROMOTED") 
                            || result.text.includes("PRDMDVED")
                            || result.text.includes("FROMOTED")
                            || result.text.includes("ADVERTISEMENT")
                            || result.text.includes("Anvzmsmm")
                            ) {
                            container.classList.add("adclipse-ad");
                            foundAd();
                        }
                    });
                });
            } catch(e) {
                console.log('something went wrong');
            }
        }
     });
 }

 function foundAd() {
     adsFound++;
     console.log('adsfound', adsFound);
     if (adsFound > 0) {
        chrome.runtime.sendMessage({
            badgeText: "" + adsFound
        });
    } else {
        chrome.runtime.sendMessage({
            badgeText: ""
        });
    }
 }

