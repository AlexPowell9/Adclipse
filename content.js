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
        // evaluateContainers('ocr');
        evaluateContainers('ml5');
        //Run ML5 on scroll
        window.addEventListener("scroll", runOnScroll);

        function KeyPress(e) {
            var evtobj = window.event ? event : e
            if (evtobj.keyCode == 82 && evtobj.altKey) {
                console.log("Alt + R");
                evaluateContainers('ml5');
            }
        }
        document.onkeydown = KeyPress;


    }

});

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
        evaluateContainers('ml5');
    }, 150);
};

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
    let containers = selectContainers();
    if (method === 'ocr') {
        let ads = await OCR.process(containers);
        highlightAds(ads);
        adsBlocked = ads.length;
        updateBadge();
    } else if (method === 'ml5') {
        let ads = await ML5.process(containers);
        highlightAds(ads);
        adsBlocked = ads.length;
        updateBadge();
    }
}

function highlightAds(containers) {
    containers.forEach(container => {
        container.classList.add("adclipseIdentified");
        if (visualStorageCopy.grayscale.active) {
            if (!container.classList["adclipseGrayscale"]) {
                container.classList.add("adclipseGrayscale");
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
    return document.querySelectorAll("[data-google-query-id]");

    // reddit posts
    // return document.querySelectorAll("._1poyrkZ7g36PawDueRza-J > article");

    // reddit sidebar ads
    // return document.querySelectorAll(".ii4q9d-0");

    // posts and sidebar 
    // return document.querySelectorAll("._1poyrkZ7g36PawDueRza-J, .ii4q9d-0");
    //return document.querySelectorAll(".ii4q9d-0, .rpBJOHq2PR60pnwJlUyP0 > div");
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