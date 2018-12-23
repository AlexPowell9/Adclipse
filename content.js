/*
 * This file runs on every tab that fufills the "matches" line in the manifest.json. 
 * 
 * https://stackoverflow.com/questions/12971869/background-vs-content-scripts
 */




/*
 * This is for testing purposes, we take a random number to put on the badge and the ads blocked field.
 */
var adsBlocked = randomIntFromInterval(0, 300);
console.log(adsBlocked);

function randomIntFromInterval(min, max) // min and max included
{
    return Math.floor(Math.random() * (max - min + 1) + min);
}


/*
 * This is what makes the tabs have unique badge numbers. 
 * https://stackoverflow.com/questions/32168449/how-can-i-get-different-badge-value-for-every-tab-on-chrome
 */
chrome.runtime.sendMessage({badgeText: ""+adsBlocked});