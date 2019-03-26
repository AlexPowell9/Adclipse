

# Adclipse
Online advertisements have become increasingly obtrusive over the last decade, which has lead the to the development and popularization of ad blockers. Modern ad blockers allow users to prevent advertisements from being displayed through the use of filter lists, which are enormous lists comprised of domains, advertising specific html strings, and regular expressions. Unfortunately, these lists require considerable effort to curate and advertisers have begun deploying “anti-adblock” measures which can hinder or cripple list based ad-blocking efforts. Instead of employing lists, Adclipse takes a perceptual approach and use various computer vision techniques to “see” the advertising content like a human would to identify and block advertisements.

## Getting Started

1. Clone the repository and then open Chrome.
2. Open the Extension Management page by navigating to chrome://extensions.
3.  The Extension Management page can also be opened by clicking on the Chrome menu, hovering over More Tools then selecting Extensions.
4. Enable Developer Mode by clicking the toggle switch next to Developer mode.
5. Click the LOAD UNPACKED button and select the extension directory.
6. Click on the Adclipse extension icon, and click the gear icon. Under the visual section it is advisable to configure the ad highlighting settings to make ads as visible as possible, or invisible via the hidden option.
7. Congratulations! You can now navigate to any web page and let Adclipse work.

Read more about developing Chrome Extensions [here](https://developer.chrome.com/extensions/getstarted).

## How Does It Work?
Adclipse has four major components to it, which will be described briefly below.
### Container Selection
This component is responsible for figuring out what elements on a page are likely to be visible and contain content. It would be very computationally expensive (and redundant) to process every single element, so Adclipse tries to grab relevant elements only. Right now container selection grabs all elements with the Google Ads tag, as well as the children of the container with the most children. The reasoning behind this is that most websites that feature infinite scrolling content (eg. Reddit) will work with this. 

### Screenshots
Next Adclipse takes a screenshot of the visible area of the screen and then from that screenshot, this component extracts images of the visible elements found in *Container Selection*. The top left point is calculated for all elements found in *Container Selection*, and then those that are outside of the visible window, or are less than 7/8ths visible are filtered out. The rest are cropped out of the screenshot and passed on to the next component. 

### Ad Detection
The remaining elements are processed by either OCR, which looks for keywords, or and Image Classifier which returns the elements which have been identified as Advertisements or Promoted/Sponsored content. A user can toggle between the two methods in the options page.
#### OCR
OCR was implemented using [Tesseract.js](http://tesseract.projectnaptha.com/) and looks for keywords like "Advertisement" and "Promoted". It is the less performant of the two modes, and only really works when a user is zoomed in on the web page (usually ~200%). 
#### Image Classifier (ML5)
The recommended Ad detection mode for Adclipse is the [ml5.js Image Classifier](https://ml5js.org/docs/ImageClassifier.html). Adclipse uses this image classifier with the robust MobileNet feature set to train and predict content. This is not as good as training an image classifier from scratch but it is fast. A user can continue to augment and test the model with the developer tools in the options page, under the Image Recognition tab.

### Ad Highlighting/Removal
After the *Ad Detection* component has returned the elements it identified as advertisements, this component will apply the custom styles defined by the user in options. This is what highlights or removes the ads from the page.


## Useful Links
[Chrome Developer Guide](https://developer.chrome.com/extensions/devguide)
[The Future of Ad Blocking: An Analytical Framework and New Techniques](http://randomwalker.info/publications/ad-blocking-framework-techniques.pdf)
[Ad-versarial: Perceptual Ad-Blocking meets Adversarial Machine Learning](https://arxiv.org/pdf/1811.03194.pdf)
