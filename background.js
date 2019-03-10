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
  //Deal with 
  if (message.dimensions !== null && message.dimensions !== undefined) {
    //console.log("Called Capture!", message.dimensions);
    capture(sender.tab.id, message.dimensions).then((data) => {
      //Respond with data url of canvas
      sendResponse({
        response: data
      });
    }).catch((err) => {
      console.log("Error: ", err);
    });

    //Need to return true to keep message channel open while promises resolve
    return true;
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


var canvas = null;

function capture(tabId, dimensions) {
  console.log("Capture got called", dimensions);
  return new Promise((resolve, reject) => {
    chrome.tabs.get(tabId, (tab) => {
      // chrome.tabs.captureVisibleTab(tab.windowId, function (img) {
      //   resolve(img);
      // });
      chrome.tabs.captureVisibleTab(tab.windowId, {
        format: "png"
      }, (dataUrl) => {
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
          // return canvas.toDataURL("image/png");
          var croppedDataUrl = canvas.toDataURL("image/png");
          resolve(croppedDataUrl);
          // //This is for viewing the trimmed areas in new tabs
          // chrome.tabs.create({
          //   url: croppedDataUrl,
          //   windowId: tab.windowId
          // });
        }
        image.src = dataUrl;
        console.log(canvas.toDataURL("image/png"));
      });
    });
  });
}