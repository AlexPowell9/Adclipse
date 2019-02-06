/*
 * SUMMARY: This file runs on every tab that fufills the "matches" line in the manifest.json. 
 * 
 * https://stackoverflow.com/questions/12971869/background-vs-content-scripts
 */

"use strict";

var currentTab = location.href;
// console.log(currentTab);
var whitelisted = false;

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
    var d = extractRootDomain(currentTab);
    // console.log(d);

    // Check if whitelisted
    if (storageCopy.indexOf(d) != -1) {
        // whitelisted
        whitelisted = true;
    }
    else {
        // not whitelisted
        highlightAds('ocr');
    }

});


/*
 * We set the badge here using the adsBlocked number, which is currently random.
 */
var adsBlocked;

function getAdsBlocked() {
    if (whitelisted) {
        adsBlocked = 0;
    } else {
        adsBlocked = randomIntFromInterval(0, 300);
    }
    setBadge();
    setIcon();
}

/*
 * Highlight Potential Ads
 * Gives containers to the selected detection module
 */

function highlightAds(method) {
    let containers = selectContainers();
    if(method === 'ocr') {
        OCR.process(containers);
    }
}

/*
 * Select Candidate Containers
 * Chooses which containers are potentially ads
 * TODO: make this way better
 */
function selectContainers() {
    // return document.querySelectorAll("[data-google-query-id]");

    // reddit posts
    // return document.querySelectorAll("._1poyrkZ7g36PawDueRza-J > article");

    // reddit sidebar ads
    // return document.querySelectorAll(".ii4q9d-0");

    // posts and sidebar 
    // return document.querySelectorAll("._1poyrkZ7g36PawDueRza-J, .ii4q9d-0");
    return document.querySelectorAll(".ii4q9d-0, .rpBJOHq2PR60pnwJlUyP0 > div");
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