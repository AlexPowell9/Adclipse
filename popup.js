/*
 * This script only runs when a user clicks on the icon. 
 */


/*
 * Put the version into the popup.
 */
var manifestData = chrome.runtime.getManifest();
document.getElementById('version').innerHTML = manifestData.version;

//Update the popup to show how many ads were blocked.
function updateAdsBlocked(ads) {
  document.getElementById('metricsArea').innerHTML = ads;
}


/*
 * This gets the current tab, then sends its content.js a message asking for the ad count.
 * I suspect this gets complicated with certain sites with multiple stacked frames. Might need some improvement.
 *
 * https://developer.chrome.com/extensions/messaging
 */
chrome.tabs.query({
  active: true,
  currentWindow: true
}, function (tabs) {
  console.log(tabs);
  chrome.tabs.sendMessage(tabs[0].id, {
    type: "getAdCount"
  }, function (response) {
    console.log(response);
    updateAdsBlocked(response.adCount);
  });
});


/*
 * Handle turning adclipse on and off on a given site. 
 *
 * TODO: add a method of just turning it off for a given tab.
 * 
 * On click it should add to whitelist and present refresh button. 
 */
var disabled = false;
document.getElementById("logo").addEventListener("click", function () {
  disabled = !disabled;
  showRefreshButton(disabled);
  if (disabled) {
    document.getElementById("logo").style.backgroundImage = "url('images/Toggle_Off.svg')";
  } else {
    document.getElementById("logo").style.backgroundImage = "url('images/Toggle_On.svg')";
  }
});


/*
 * Refresh page. Close popup. 
 *
 * https://stackoverflow.com/questions/8342756/chrome-extension-api-for-refreshing-the-page
 */
document.getElementById("refresh").addEventListener("click", function () {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (arrayOfTabs) {
    chrome.tabs.reload(arrayOfTabs[0].id);
  });
  window.close();
});


/*
 * Enable refresh button, disable metrics area.
 */
function showRefreshButton(visible) {
  if (visible) {
    document.getElementById("refresh").style.display = "block";
    document.getElementById("metricsArea").style.display = "none";
  } else {
    document.getElementById("refresh").style.display = "none";
    document.getElementById("metricsArea").style.display = "block";
  }

}


/*
 * Add to whitelist. 
 *
 * TODO: Using local storage, evaluate that decsion against using sync storage. 
 *
 * https://developer.chrome.com/extensions/storage
 */