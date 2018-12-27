/*
 * SUMMARY: This script only runs when a user clicks on the icon. 
 */


/*
 * Put the version into the popup.
 */
var manifestData = chrome.runtime.getManifest();
document.getElementById('version').innerHTML = manifestData.version;

/*
 * Update the popup to show how many ads were blocked.
 */
function updateAdsBlocked(ads) {
  document.getElementById('metricsArea').innerHTML = ads;
}

/*
 * This gets the current tab, then sends its content.js a message asking for the ad count.
 * I suspect this gets complicated with certain sites with multiple stacked frames. Might need some improvement.
 *
 * https://developer.chrome.com/extensions/messaging
 */
var currentTab;
chrome.tabs.query({
  active: true,
  currentWindow: true
}, function (tabs) {
  console.log(tabs);
  currentTab = tabs[0];
  chrome.tabs.sendMessage(currentTab.id, {
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
 */
var disabled = false;
var changed = false;
document.getElementById("logo").addEventListener("click", function () {
  disabled = !disabled;
  //different variable because got into trouble with whitelist functionality.
  changed = !changed;
  showRefreshButton(changed);
  if (disabled) {
    document.getElementById("logo").style.backgroundImage = "url('images/Toggle_Off.svg')";
    //Add domain to whitelist
    updateWhitelist(extractRootDomain(currentTab.url), true);
  } else {
    document.getElementById("logo").style.backgroundImage = "url('images/Toggle_On.svg')";
    //Remove domain from whitelist
    updateWhitelist(extractRootDomain(currentTab.url), false);
  }
});


/*
 * Refresh page. Close popup. 
 *
 * https://stackoverflow.com/questions/8342756/chrome-extension-api-for-refreshing-the-page
 */
document.getElementById("refresh").addEventListener("click", function () {
  //Reload the tab.
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (arrayOfTabs) {
    chrome.tabs.reload(arrayOfTabs[0].id);
  });
  window.close();
});


/*
 * Open Options page. 
 *
 * https://developer.chrome.com/extensions/options
 */
document.querySelector('#options').addEventListener("click", function () {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
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
 * Check if domain is whitelisted, change display accordingly.
 */
var storageCopy = [];
chrome.storage.local.get("whitelist", function (returnedStorage) {
  console.log(returnedStorage);
  if (returnedStorage['whitelist'] !== undefined) {
    storageCopy = returnedStorage['whitelist'];
  }
  var d = extractRootDomain(currentTab.url);
  //Whitelisted.
  if (storageCopy.indexOf(d) != -1) {
    disabled = true;
    document.getElementById("logo").style.backgroundImage = "url('images/Toggle_Off.svg')";
  }
});


/*
 * Whitelist manager. add=true when you want to add an item, and add=false when you want to remove an item.
 *
 * TODO: Currently using local storage, evaluate that decsion against using sync storage. 
 * TODO: Send content.js a message letting it know something has changed.  
 *
 * https://developer.chrome.com/extensions/storage
 */
function updateWhitelist(domain, add) {
  //Add or remove
  if (add) {
    //Check if entry already exists
    if (storageCopy.indexOf(domain) === -1) {
      storageCopy.push(domain);
    }
  } else {
    //Verify entry exists
    if (storageCopy.indexOf(domain) != -1) {
      storageCopy.splice(storageCopy.indexOf('domain'), 1);
    }
  }
  //Update with new
  chrome.storage.local.set({
    "whitelist": storageCopy
  }, function () {
    //Callback
    console.log("done")
  });
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