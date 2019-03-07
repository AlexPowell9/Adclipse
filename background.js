/*
 * SUMMARY: This file is a single long running script that sits above all pages. There is
 * only one instance at a time and it exists for the lifetime of the extension. 
 * 
 * https://stackoverflow.com/questions/12971869/background-vs-content-scripts
 */


/*
 * Set background color to match ublock and noscript color. Idk how they got their badge looking so nice and uniform.
 */
chrome.browserAction.setBadgeBackgroundColor({
  color: '#525252'
});

/*
 * This is what makes the tabs have unique badge numbers. 
 * https://stackoverflow.com/questions/32168449/how-can-i-get-different-badge-value-for-every-tab-on-chrome
 */
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  //deal with badge messages
  if (message.badgeText) {
    chrome.tabs.get(sender.tab.id, function (tab) {
      if (chrome.runtime.lastError) {
        return; // the prerendered tab has been nuked, happens in omnibox search
      }
      if (tab.index >= 0) { // tab is visible
        chrome.browserAction.setBadgeText({
          tabId: tab.id,
          text: message.badgeText
        });
      } else { // prerendered tab, invisible yet, happens quite rarely
        var tabId = sender.tab.id,
          text = message.badgeText;
        chrome.webNavigation.onCommitted.addListener(function update(details) {
          if (details.tabId == tabId) {
            chrome.browserAction.setBadgeText({
              tabId: tabId,
              text: text
            });
            chrome.webNavigation.onCommitted.removeListener(update);
          }
        });
      }
    });
  }
  //Deal with icon messages
  if (message.iconDisabled !== null) {
    if (message.iconDisabled) {
      chrome.browserAction.setIcon({
        path: {
          16: "images/AdclipseIcon16_alt4_off.png",
          32: "images/AdclipseIcon32_alt4_off.png",
          48: "images/AdclipseIcon48_alt4_off.png",
          128: "images/AdclipseIcon128_alt4_off.png"
        },
        tabId: sender.tab.id
      });
    } else {
      chrome.browserAction.setIcon({
        path: {
          16: "images/AdclipseIcon16_alt4.png",
          32: "images/AdclipseIcon32_alt4.png",
          48: "images/AdclipseIcon48_alt4.png",
          128: "images/AdclipseIcon128_alt4.png"
        },
        tabId: sender.tab.id
      });
    }
  }
  //Deal with icon messages
  if (message.classifyImage !== null) {
    sendResponse({
      response: "huh?"
    });
  }
});


/*
 * Here we set the badge icon to display as either active on inactive based on whether the site is whitelisted or not.
 *
 * https://developer.chrome.com/extensions/browserAction#method-setIcon
 */
function setIcon(iconDisabled) {
  if (iconDisabled) {
    chrome.browserAction.setIcon({
      16: "images/AdclipseIcon16_alt4_off.png",
      32: "images/AdclipseIcon32_alt4_off.png",
      48: "images/AdclipseIcon48_alt4_off.png",
      128: "images/AdclipseIcon128_alt4_off.png"
    }, function () {
      console.log("done");
    });
  } else {
    chrome.browserAction.setIcon({
      16: "images/AdclipseIcon16_alt4.png",
      32: "images/AdclipseIcon32_alt4.png",
      48: "images/AdclipseIcon48_alt4.png",
      128: "images/AdclipseIcon128_alt4.png"
    }, function () {
      console.log("done");
    });
  }
}
