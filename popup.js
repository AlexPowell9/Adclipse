/*
 * This script only runs when a user clicks on the icon. 
 */


/*
 * Put the version into the popup.
 */
var manifestData = chrome.runtime.getManifest();
document.getElementById('version').innerHTML = manifestData.version;




function updateAdsBlocked(ads) {
  document.getElementById('metricsArea').innerHTML = ads;
}
