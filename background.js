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


// take screenshot
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.chromeAction === 'screenshot') {
    createScreenshot(function(dataURL) {
      let img = createImage(dataURL, request.x, request.y, request.w, request.h);
      sendResponse({image: img});
    });
    return true;
  }
});

// calling the captureVisibleTab method takes a screenhot
function createScreenshot(callback) {
  // you can have two image formats (jpeg and png)
  // for jpeg use { format: "jpeg", quality: 100 } (you can adjust the jpeg image quality from 0-100) 
  // for png use { format: "png" }
  console.log('taking screenshot');
  chrome.tabs.captureVisibleTab(null, { format: "png" }, callback);
}

// creates a canvas element
function createCanvas(canvasWidth, canvasHeight) {
  var canvas = document.createElement("canvas");

  // size of canvas in pixels
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  return canvas;
}

// here we create a new image
function createImage(dataURL, x, y, w, h) {
  // create a canvas
  var canvas = createCanvas(300, 300);
  // get the context of your canvas
  var context = canvas.getContext('2d');
  // create a new image object
  var croppedImage = new Image();

  croppedImage.onload = function() {
      // this is where you manipulate the screenshot (cropping)
      // parameter 1: source image (screenshot)
      // parameter 2: source image x coordinate
      // parameter 3: source image y coordinate
      // parameter 4: source image width
      // parameter 5: source image height
      // parameter 6: destination x coordinate
      // parameter 7: destination y coordinate
      // parameter 8: destination width
      // parameter 9: destination height
      context.drawImage(croppedImage, 0, 0, 300, 300, 0, 0, 300, 300);

      // canvas.toDataURL() contains your cropped image
      console.log(canvas.toDataURL());
  };
  croppedImage.src = dataURL; // screenshot (full image)
  return canvas.toDataURL();
  // return dataURL;
}