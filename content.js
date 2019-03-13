/*
 * SUMMARY: This file runs on every tab that fufills the "matches" line in the manifest.json. 
 * 
 * https://stackoverflow.com/questions/12971869/background-vs-content-scripts
 */

"use strict";

var currentTab = location.href;
// console.log(currentTab);
var whitelisted = false;
//This is the label we use if the label option is applied. We update this to be the same as storage.
var adclipseLabel = "Adclipse";
var adsBlocked = 0;

/*
 * Get Visual Options from storage and apply them.
 */
var visualStorageCopy = [];
chrome.storage.local.get("visual", function (returnedStorage) {
    if (returnedStorage['visual'] !== undefined) {
        visualStorageCopy = JSON.parse(returnedStorage['visual']);
    } else {
        //Does not exist, so we create it with defaults
        visualStorageCopy = getDefaults();
        chrome.storage.local.set({
            "visual": JSON.stringify(visualStorageCopy)
        }, function () {
            //Callback
            console.log("Visual Settings Updated!");
        });
    }
    adclipseLabel = visualStorageCopy.label.text;
    applyVisualOptions();
});

/**
 * list of the nodes in the dom with additional information to sort them into ad likelyhood
 */
let nodeList = [];

/**
 * content Areas
 */
let contentAreas = [
    {//sidebar
        containers: [],
        tolerance: (node) => {
            return false;
        },
        metric: (node) => {
            return node.srcChanges;
        }
    },
    {//main content
        containers: [null, null, null],
        tolerance: (node) => {
            if(node.metric[1]>this.containers[0].metric[1]*0.7){
                return true
            }
            return false;
        },
        metric: (node) => {
            if(!node)return 0;
            if(!node.target)return 0;
            if(node.target.tagName === "BODY" || node.target.tagName === "HEAD")return 0;
            try{
                let container = node.target;
                let element = container;
                let dimensions = {};
                dimensions.top = -window.scrollY;
                dimensions.left = -window.scrollX;
                try{
                    while (element !== document.body) {
                        dimensions.top += element.offsetTop;
                        dimensions.left += element.offsetLeft;
                        element = element.offsetParent;
                    }
                }
                catch(err) {
                    return 0;
                }
                if(dimensions.top > window.height || dimensions.left > window.width){
                    return 0;
                }
                dimensions.width = container.offsetWidth;
                dimensions.height = container.offsetHeight;
                dimensions.right = (dimensions.left+dimensions.width);
                dimensions.bottom = (dimensions.top+dimensions.height);
                if(dimensions.right > window.width){
                    dimensions.right=window.width;
                }
                if(dimensions.bottom > window.height){
                    dimensions.bottom = window.height;
                }
                
                let windowSize = {};
                windowSize.width = window.innerWidth;
                windowSize.height = window.innerHeight
                dimensions.top /= windowSize.height;
                dimensions.left /= windowSize.width;
                dimensions.bottom /= windowSize.height;
                dimensions.right /= windowSize.width;
                let xFactor = densityFunction(dimensions.left, dimensions.right);
                let yFactor = densityFunction(dimensions.top, dimensions.bottom);
                let areaFactor = xFactor * yFactor;
                //return (area? 0: node.totalAdded / area);
                return areaFactor*node.totalAdded||0;
            }
            catch(err){
                return 0;
            }
        }
    }
]

let densityFunction = (x1, x2) => {
    let xFactor2 = -(4/3)*(x2,3) + (2*(Math.pow(x2,2)));
    let xFactor1 = -(4/3)*(x1,3) + (2*(Math.pow(x1,2)));
    return xFactor2 - xFactor1;
}


/*
 * Get Detection Options from storage and apply them.
 */
var detectionStorageCopy = [];
chrome.storage.local.get("detection", function (returnedStorage) {
    if (returnedStorage['detection'] !== undefined) {
        detectionStorageCopy = JSON.parse(returnedStorage['detection']);
    } else {
        //Does not exist, so we create it with defaults
        detectionStorageCopy = getDetectionDefaults();
        chrome.storage.local.set({
            "detection": JSON.stringify(detectionStorageCopy)
        }, function () {
            //Callback
            console.log("Detection Settings Updated!");
        });
    }
});

/*
 * Return array of default option values, for when there are no options present in storage.
 */
function getDetectionDefaults() {
    var storage = {};
    //Grayscale
    storage.ml5 = {
        "active": true
    };
    return storage;
}

/*
 * Check if domain is whitelisted, change display accordingly.
 *
 * TODO: Perform this action whenever user disables, not just on reload. Listen for message from popup.
 */
var storageCopy = [];
chrome.storage.local.get("whitelist", function (returnedStorage) {
    if (returnedStorage['whitelist'] !== undefined) {
        storageCopy = returnedStorage['whitelist'];
    }
    var d = extractHostname(currentTab);
    // console.log(d);
    containers = selectAllByChildren(document.body, 1, true);
    containers.forEach((container) => {
        nodeList.push({
            target: container.node,
            avg: (container.childNodes?node.container.length:0),
            iterations:0,
            totalAdded: (container.childNodes?node.container.length:0),
            totalRemoved: 0,
            srcChanges: 0,
        });
        nodeList[nodeList.length-1].metrics = [];
        reCalcMetrics(nodeList[nodeList.length-1]);
    });
    let options = {attribute: true, childList: true, subtree: true, attributeFilter: ["src"]};
    let observer = new MutationObserver((mutations) => {
        var t0 = performance.now();
        nodeList.forEach((node) => {
            mutations.forEach((mutation) => {
                if(mutation.target===node.target){
                    node.iterations++;
                    let delta = mutation.addedNodes.length - mutation.removedNodes.length;
                    node.avg = delta/node.iterations + node.avg*(node.iterations-1)/node.iterations;
                    node.totalAdded += mutation.addedNodes.length;
                    node.totalRemoved += mutation.removedNodes.length;
                    
                    mutation.addedNodes.forEach((node) => {
                        nodeList.push({
                            target: node,
                            avg: (node.childNodes?node.childNodes.length:0),
                            totalAdded: (node.childNodes?node.childNodes.length:0),
                            totalRemoved: 0,
                            iterations: 0
                        });
                        reCalcMetrics(nodeList[nodeList.length-1]);
                    });
                    if(mutation.type === "attributes"){
                        node.srcChanges++;
                    }
                    mutation.removedNodes.forEach((removed) => {
                        nodeList.forEach((node, index) => {
                            if(removed===node)nodeList.splice(index, 1);
                        })
                    });
                    reCalcMetrics(node);
                }
            })
        });
        var t1 = performance.now();
        console.log("Selected Containers in: " + (t1 - t0).toFixed(2) + " ms.")
    })
    observer.observe(document.body, options);
    // Check if whitelisted
    if (storageCopy.indexOf(d) != -1) {
        // whitelisted
        whitelisted = true;
        adsBlocked = 0;
        setBadge();
        setIcon();
    } else {
        /*
         * TODO: pull from options to check which one is enabled.
         */
        // console.log("Called OCR");
        console.log(contentAreas[1].metric(document.body));
        if (detectionStorageCopy.ml5.active) {
            evaluateContainers('ml5');
        } else {
            evaluateContainers('ocr');
        }
        //Run on scroll
        window.addEventListener("scroll", runOnScroll);

        function KeyPress(e) {
            var evtobj = window.event ? event : e
            if (evtobj.keyCode == 82 && evtobj.altKey) {
                console.log("Alt + R");
                if (detectionStorageCopy.ml5.active) {
                    evaluateContainers('ml5');
                } else {
                    evaluateContainers('ocr');
                }
            }
        }
        document.onkeydown = KeyPress;


    }

});

let reCalcMetrics = (node) => {
    if(!node.metrics)node.metrics = [];
    contentAreas.forEach((area, index) => {
        node.metrics[index] = area.metric(node);
        let added = false
        for(let i = 0; i < area.containers.length; i++ ){
            if(node.metrics[index] > area.containers[i].metrics[index]){
                area.containers.splice(i, 0, node);
                added = true;
                if(i === 0){
                    for(let j = 1; j < area.containers.length; j++){
                        if(!area.tolerance(area.containers[j]))area.containers = area.containers.slice(0, j-1);
                    }
                }
                break;
            }
        }
        if((!added && area.tolerance(node))||area.containers.length === 0)area.containers.push(node);
    });

}

var lastPosition = 0;
var timer = null;

var runOnScroll = function (evt) {
    var scrollTop = window.pageYOffset;
    if (timer !== null) {
        clearTimeout(timer);
    }
    timer = setTimeout(function () {
        // if ((scrollTop - lastPosition) >= window.innerHeight / 2 && scrollTop > lastPosition) {
        //     evaluateContainers('ml5');
        //     lastPosition = scrollTop;
        // }
        if (detectionStorageCopy.ml5.active) {
            evaluateContainers('ml5');
        } else {
            evaluateContainers('ocr');
        }
    }, 150);
};

function nodeMetric(node) {
    return node.avg * 8 + node.lastCount * 2;
}

var adsBlocked;

/*
 * We set the badge here using the adsBlocked number
 */
function updateBadge() {
    setBadge();
    setIcon();
    console.log("Ads on this page:", adsBlocked);
}

/*
 * Evaluate Containers
 * Gives containers to the selected detection module to decide if they are ads
 * Puts the returned ad containers through the hightlighting function
 */

async function evaluateContainers(method) {
    //await ML5.init();
    let iteration = 0;
    //add mutation observer here
    
    //
    let containers = selectContainers();
    highlightAds(containers);
    // if (method === 'ocr') {
    //     let ads = await OCR.process(containers);
    //     highlightAds(ads);
    //     adsBlocked += ads.length;
    //     updateBadge();
    // } else if (method === 'ml5') {
    //     let ads = await ML5.process(containers);
    //     highlightAds(ads);
    //     console.log("Ads length: ", ads.length);
    //     adsBlocked += ads.length;
    //     updateBadge();
    // }
}

function highlightAds(containers) {
    containers.forEach(container => {
        container.classList.add("adclipseIdentified");
        if (visualStorageCopy.grayscale.active) {
            if (!container.classList["adclipseGrayscale"]) {
                container.classList.add("adclipseGrayscale");
            }
        }
        if (visualStorageCopy.remove.active) {
            if (!container.classList["adclipseRemove"]) {
                container.classList.add("adclipseRemove");
            }
        }
        if (visualStorageCopy.color.active) {
            //This is ugly. We first remove all the color containers, and then add new ones.
            var divs = container.getElementsByClassName("adclipseColor");
            //No idea why foreach wont work here but I tried like 6 times.
            for (var i = 0; i < divs.length; i++) {
                divs[0].remove();
            }
            //Add new ones. This is needed because it has to be a child for the css rules to work.
            var newDiv = document.createElement("div");
            newDiv.classList.add("adclipseColor");
            container.appendChild(newDiv);
            if (!container.classList["adclipseRelative"]) {
                container.classList.add("adclipseRelative");
            }
        }
        if (visualStorageCopy.border.active) {
            if (!container.classList["adclipseBorder"]) {
                container.classList.add("adclipseBorder");
            }
        }
        if (visualStorageCopy.label.active) {
            //This is ugly. We first remove all the color containers, and then add new ones.
            var divs = container.getElementsByClassName("adclipseLabel");
            //No idea why foreach wont work here but I tried like 6 times.
            for (var i = 0; i < divs.length; i++) {
                divs[0].remove();
            }
            //Add two new divs, one for the container, and one for the text.
            var newDiv = document.createElement("div");
            var textDiv = document.createElement("div");
            textDiv.textContent = adclipseLabel;
            textDiv.classList.add("adclipseLabelText");
            newDiv.classList.add("adclipseLabel");
            newDiv.appendChild(textDiv);
            container.appendChild(newDiv);
            container.classList.add("adclipseRelative");
            if (!container.classList["adclipseRelative"]) {
                container.classList.add("adclipseRelative");
            }
        }
    });
}

/*
 * Select Candidate Containers
 * Chooses which containers are potentially ads
 * TODO: make this way better
 */
function selectContainers() {
    //return document.querySelectorAll("[data-google-query-id]");

    // reddit posts
    // return document.querySelectorAll("._1poyrkZ7g36PawDueRza-J > article");

    // reddit sidebar ads
    // return document.querySelectorAll(".ii4q9d-0");

    // posts and sidebar 
    // return document.querySelectorAll("._1poyrkZ7g36PawDueRza-J, .ii4q9d-0");

    // return document.querySelectorAll(".ii4q9d-0, .rpBJOHq2PR60pnwJlUyP0 > div");
    // //get main content
    // let mainCont = document.getElementsByClassName("rpBJOHq2PR60pnwJlUyP0 s1rcgrht-0 eEVuIz");
    // console.log(mainCont);
    // Array.from(mainCont).forEach((el) => {
    //     console.log(countChildren(el, 1));
    // })
    // containers = selectAllByChildren(document, 1, true);
    // let co = Array.from(document.getElementsByTagName("*"));
    // let c = [];
    // containers.forEach((container) => {
    //     c.push(container.node);
    // })
    // let cont = selectByChildren(document.body);
    // console.log(containers);
    // console.log(c[0]);

    let c = [];
    contentAreas.forEach((area) => {
        console.log(area);
        console.log(area.containers);
        area.containers.forEach((container) => {
            if(container && container.target && container.target.childNodes)c = c.concat(Array.from(container.target.childNodes));
        })
        
    })
    console.log(c);
    return c;
}

let containers = [];

//returns a node list of elements
let getContainers = () => {
    return document.getElementsByTagName("*");
}
//gets the height of the node
let getHeight = (node) => {
    return node.clientHeight||0;
}

let getWidth = (node) => {
    return node.clientWidth||0;
}

let selectContainerByRatio = (minRatio, maxRatio) => {
    let selected = [];
    
}

let selectRecursive = (node, minRatio, maxRatio, selected) => {
    node.childNodes.forEach((node) => {
        if(node.height !== 0 && node.width !== 0){
            nRatio = getWidth(node)/getHeight(node);
            if(nRatio <= maxRatio && nRatio >= minRatio)selected.push(node);
        }
        selectRecursive(node, minRatio, maxRatio, selected);
    });
}

/**
 * Selects the node with the most children
*/
let selectByChildren = (node) => {
    let returnNode = node
    let children = countChildren(node, 1);
    node.childNodes.forEach((node) => {
        let curr= selectByChildren(node);
        if(countChildren(curr, 1) > children){
            returnNode = curr;
            children = countChildren(curr, 1);
        }
    });
    return returnNode;
}

let getCandidateContainers =(method) => {
       
}

let selectAllByChildren = (node, depth, sorted) => {
    if(!depth)depth = 1;
    let selected = [];
    node.childNodes.forEach((node, index) => {
        selected = selected.concat(selectAllByChildren(node, depth, true));
        selected.push({
            node: node,
            count: countChildren(node, depth)
        });
    });
    if(sorted){
        selected.sort((a,b) => {
            return b.count-a.count;     
        });
    }
    return selected;
}

let countChildren = (node, depth) => {
    return node.childElementCount || 0;
    return countChildrenRec(node, 0, depth);
}

let countChildrenRec = (node, depth, maxDepth) => {
    if(depth >= maxDepth)return 1;
    let count = 0;
    node.childNodes.forEach((node, index) => {
        count += countChildrenRec(node, depth+1, maxDepth);
    });
    return count;
}
let selectMaxChilren = (node, list) => {
    let children = node.childNodes.length;
    node.childNodes.forEach((node) => {
        if(node.childNodes.length > children) ;   
    });
}



/*
 * This is what makes the tabs have unique badge numbers. 
 * https://stackoverflow.com/questions/32168449/how-can-i-get-different-badge-value-for-every-tab-on-chrome
 */
function setBadge() {
    if (adsBlocked > 0) {
        chrome.runtime.sendMessage({
            badgeText: "" + adsBlocked
        });
    } else {
        chrome.runtime.sendMessage({
            badgeText: ""
        });
    }
}


/*
 * This is what controls the icon being enabled/disabled.
 */
function setIcon() {
    // console.log("called set icon!");
    chrome.runtime.sendMessage({
        iconDisabled: whitelisted
    });
}

/*
 * This listens for the adCount request from the popup.js, and then responds with the adsblocked.
 *
 * https://developer.chrome.com/extensions/messaging
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        // console.log(sender.tab ?
        //     "from a content script:" + sender.tab.url :
        //     "from the extension");

        if (request.type == "getAdCount")
            sendResponse({
                adCount: "" + adsBlocked
            });
    });


/*
 * Apply visual options from storage.
 */
function applyVisualOptions() {
    const body = document.querySelector('body');
    /* 
     * GrayScale Options
     */
    body.style.setProperty('--grayscaleFactor', visualStorageCopy.grayscale.factor / 100);
    /* 
     * Color Options
     */
    body.style.setProperty('--colorOpacity', visualStorageCopy.color.opacity / 100);
    body.style.setProperty('--colorColor', visualStorageCopy.color.color);
    /* 
     * Border Options
     */
    body.style.setProperty('--borderThickness', visualStorageCopy.border.thickness + "px");
    body.style.setProperty('--borderStyle', visualStorageCopy.border.style);
    body.style.setProperty('--borderColor', visualStorageCopy.border.color);
    /*
     * Label Options
     */
    body.style.setProperty('--labelFontSize', visualStorageCopy.label.fontSize + "px");
    body.style.setProperty('--labelOpacity', visualStorageCopy.label.opacity / 100);
    body.style.setProperty('--labelTextTop', visualStorageCopy.label.textTop + "%");
    body.style.setProperty('--labelTextAlign', visualStorageCopy.label.textAlign);
    body.style.setProperty('--labelColor', visualStorageCopy.label.color);
    //Label text is done dynamically
}


/*
 * Return array of default option values, for when there are no options present in storage.
 */
function getDefaults() {
    var storage = {};
    //Grayscale
    storage.grayscale = {
        "active": true,
        "factor": 0.5
    };
    //Color
    storage.color = {
        "active": false,
        "color": "#000000",
        "opacity": 0.5
    };
    //Remove
    storage.remove = {
        "active": false
    };
    //Border
    storage.border = {
        "active": false,
        "color": "#ff0000",
        "style": "solid",
        "thickness": 10
    };
    //Label
    storage.label = {
        "active": false,
        "text": "Adclipse Identified Ad",
        "fontSize": 10,
        "textAlign": "center",
        "opacity": 0.5,
        "paddingTop": 100,
        "color": "#000000"
    };
    return storage;
}


/*
 * Extract hostname and/or root domain from url.
 *
 * https://stackoverflow.com/questions/8498592/extract-hostname-name-from-string
 */
function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }
    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];
    return hostname;
}

function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;
    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}
