

# Adclipse
Adclipse is a perceptual ad-blocker developed as a client-side Chromium extension that uses an Image Classifier to highlight or remove online advertisements and promoted/sponsored content on web pages. Adclipse was developed by a team of three undergraduate students for a 2018/2019 Capstone project.

## Background
Online advertisements have become increasingly obtrusive over the last decade, which has lead the to the development and popularization of ad-blockers [\[1\]](https://www.researchgate.net/publication/224453778_Blocking_online_advertising_-_A_state_of_the_art). Modern ad-blockers allow users to prevent advertisements from being displayed through the use of filter lists, which are enormous lists comprised of domains, advertising specific HTML strings, and regular expressions. Unfortunately, these lists require considerable effort to curate [\[2\]](https://arxiv.org/pdf/1810.09160.pdf). A perceptual adblocker does not rely on lists, but rather takes a perceptual approach and uses various computer vision techniques to “see” the advertising content like a human would to identify and block advertisements [\[3\]](https://arxiv.org/abs/1705.08568). Adclipse showcases two perceptual approaches: Optical Character Recognition (OCR) and Image Classification 

## Getting Started
1. Clone the repository and then open Chrome.
2. Open the Extension Management page by navigating to chrome://extensions.
3.  The Extension Management page can also be opened by clicking on the Chrome menu, hovering over More Tools then selecting Extensions.
4. Enable Developer Mode by clicking the toggle switch next to Developer mode.
5. Click the LOAD UNPACKED button and select the extension directory.
6. Congratulations! You can now navigate to any web page and let Adclipse work.

**Note**: It is advisable to read the general use section to learn how to change visual settings so that ads are highlighted in a discernible way.

For more detailed information about loading unsigned extensions please see the [Chrome Developer Guide](https://developer.chrome.com/extensions).

## General Use
To see it in action simply navigate to a website, wait for the site to settle, and then start scrolling. Adclipse should begin highlighting/removing any advertisements/promoted/sponsored content. Once content has been blocked the extension icon will update it's badge with the number of ads blocked on the page. This extension was primarily developed on the [reddit](https://www.reddit.com/) front page, so it may be good to start there. 

![Extension Icon](https://i.imgur.com/zPF97gO.png)
*Pictured above is the location of the extension icon along with the badge that indicated three ads were blocked on this page.* 

Clicking on the extension icon reveals the popup UI. This shows the version number and how many ads have been blocked on the page as well as allowing a user to get to the settings page by clicking the gear icon. If a user wishes to whitelist the page they are on, all they have to do is click the big eclipse in the top half of the popup, and then click the refresh button that appears, as pictured below in the middle. After the the refresh the user will notice that the icon has changed color to a white, to show that the page has been whitelisted, and that Adclipse is not running on this site, as pictured below on the right.
| ![enter image description here](https://i.imgur.com/znfzmzW.png) | ![enter image description here](https://i.imgur.com/ZBNbBp8.png) | ![enter image description here](https://i.imgur.com/BNvhz2Q.png) |
|--|--|--|
| *The popup UI on a site where Adclipse is working.* | *The popup UI after clicking the eclipse to whitelist a site.* | *The popup UI after refreshing the page.* |

### Settings
Clicking on the gear icon will take the user to the settings page, where they can configure their visual and detection preferences, as well as add entries to the whitelist. 

#### Visual
The visual settings can be found under the tab titled "Visual" and contain all of the highlighting/remove options. These settings determine how ads are displayed after they are identified. Use the check boxes on the top left corner of each option to enable/disable them, then configure the settings within each option to get the mock advertisement to have the desired appearance. Changes are continuously saved, so as soon as a user enacts the change they can navigate to a web page and their visual settings will appear on identified ads.

![Visual Settings](https://i.imgur.com/Ykww8rf.png)
*Visual settings pictured above, with sample configuration.*

#### Detection
The detection options can be found under the tab titled "Detection". The options are either OCR, or ML5. It is advisable to read about both of these down below in the How It Works section. Changes made to the detection setting are saved immediately. 

#### Image Recognition
The "Image Recognition" tab houses development and testing tools for working with ML5. Please see the How It Works section for background on this. This tab is divided into three sections: Model, Validate, and Train. 

##### Model
The model section shows the selected mode, the status of the model, and the labels of the current mode. There are two modes, the Adclipse model and a clean model. The Adclipse model refers to the current model that is loaded from the extensions that the team trained, and clean refers to a blank model. The model selected here will be the model used for the rest of the sections. The status of the model just indicated that things were loaded correctly. The labels of the current mode are just the image labels that exist within the current model. 

##### Validate
This allows a user to check what an image would be classified as along with the time it took to make the classification. All images are resized to 224x224 before being fed to the classifier as this is what MobileNet expects. The thumbnail is representative of what this looks like. 

**Note**: The first time an image is validated it takes much longer than all subsequent images. We are unsure why this happens.

![Validate image example](https://i.imgur.com/XrUbmGF.gif)
*Above is a walkthrough for validating two images on the Adclipse model.*

##### Train
This is a particularly useful function because it allows a developer to train either the existing model or a fresh model and then save it. Unfortunately this was really only ever designed for use by the development team it was never streamlined for general use.

To train the model all a user has to do is upload a few pictures, add a label to them, and click train. Once the status label indicates training has finished the user is free to test it using the Validate section. If Adclipse Model is selected in the Model section then the users training data will be added to the Adclipse model, to augment it. If Clean Model is selected then it will be on an empty model, and it may be necessary to add at least two classes in training to get Validation working. To discard changes simply toggle the Model between Adclipse and Clean. 

![Training ML5](https://i.imgur.com/bQye2Pe.gif)
*Pictured above is the process for creating the Adclipse Model the same way the development team did.*

To commit the model changes a user would have to save the model, and then move the model files (both .json and .bin) into the correct folder, which is `model/` and replace the two files that already exist. The code expects the model to be called "model", so do not change the names of the files unless you have changed the code to support this.

If the user has added custom labels that they expect to be highlighted they will need to edit Line 98 in `content/ml5.js`. The line should look like below, with the addition of a check for the desired label.

    if (result === 'GoogleAds' || result === 'Promoted' || result === 'RedditAds') {
	    adContainers.push(containers[index]);
    } 

#### Whitelist
The whitelist can be viewed and modified under the tab titled "Whitelist". Items are automatically added to the whitelist whenever a user follows the steps outlined under the General Use heading. A user can manually add and remove items by editing the whitelist and then saving their changes by pressing "Apply Changes". Please not that the "Apply Changes" button will become colored and clickable only if at least on of the changed lines are valid. 

## How It Works

### Infrastructure

Since Adclipse is a Chromium extension, it must adhere to standard Chromium architecture. This includes a set of scripts that get injected in every web page, a singleton background script which has access to more of the Chrome API, options scripts along with the options page, and a popup script and accompanying HTML to control the popup UI. A manifest JSON file controls the settings for the extension, for example required permissions, which scripts get injected into which webpages, and other information like version number, author, etc. To better understand the extension infasturucture consider reading through the [Chrome Developer Guide](https://developer.chrome.com/extensions/getstarted).

### Process

Adclipse's core process consists of four steps to identifying ads. The first step is container selection, which refers to picking out DOM elements that are likely to be ads. The next step is to get individual screenshots of all the DOM elements selected in the previous step, discarding those that are not currently visible on the page. The screenshots are then put through the classification method to determine if they are an advertisement or regular content. Once the screenshots return labeled, the DOM elements identified as ads are either removed or highlighted depending on the user’s settings. This process repeats every time the user scrolls down the page.

#### Initialization
Before running the core process, the extension must handle a few administrative details. Adclipse injects `content.js`, `content/ml5.js`, `content/ocr.js` and their dependencies into every web page to run as soon as the web page has finished loading. The first function of `content.js` is to pull the user's preferences from [Chrome Local Storage](https://developer.chrome.com/apps/storage) to check if the site is on the user's whitelist and then to apply the user's highlighting preferences. If the site is on the whitelist then execution halts and no further action is taken, otherwise the script proceeds as normal. The second function of `content.js` is to check which detection method is selected. There is no setup needed if OCR is the detection mode selected, but if ML5 is selected, then the `ml5Initialize` function is called from `content/ml5.js`. 

Adclipse uses a tensorflow wrapper called [ml5.js](https://ml5js.org) for image classification. It uses the MobileNet features to
 The `ml5Initialize` function initializes our image classifier by first retrieving the [MobileNet](https://github.com/tensorflow/models/tree/master/research/slim/nets/mobilenet) features, and then loading our custom trained model. MobileNet was trained on an enormous dataset, so Adclipse uses the features developed from that and applies them to a new set of images (ads). This is commonly referred to as [transfer learning](https://ml5js.org/docs/FeatureExtractor). In simpler terms, MobileNet taught the image classifier how to see and the Adclipse model taught it what to look for. 
 
 Lastly, the content script is responsible for setting up a listener to run the core process every time the user scrolls. More specifically, the core process runs everytime the user stops scrolling for 150ms. OnScroll alone is far to frequent to be feasible. Trial and error revealed that waiting to briefly stop scrolling was an incredible performance boost yet still felt extremely natural for a user. 
 
#### Container Selection
This component is responsible for figuring out what elements on a page are likely to be visible and contain content. It would be very computationally expensive (and redundant) to process every single element, so Adclipse tries to grab relevant elements only. At this time container selection grabs all elements with the Google Ads tag, as well as the children of the container with the most children. The reasoning behind this is that most websites that feature infinite scrolling content (eg. Reddit) will work with this. 

#### Screenshots 
This component is implemented in both `content/ocr.js` and `content/ml5.js`.  These two make calls to `background.js` to take screenshots of the visible area of the screen using the [Chrome API](https://developer.chrome.com/extensions/tabs#method-captureVisibleTab). The method Chromium offers to take the screenshot is only exposed to the background context, and not a content script, hence the message passing. Ideally Chromium will eventually expose their more [robust tools](https://developers.google.com/web/updates/2017/08/devtools-release-notes#node-screenshots) to extensions, but for the time being the team has to use custom code to extract individual elements form the full screenshot.

In order to get the image of an element from the larger screenshot it is necessary to know the size and position of the element. It is trivial to find the width and height of an element. The top left point is calculated for all elements found in Container Selection by iterating up the DOM and calculating the offsets, as outlined in the [element capture project](https://github.com/tlrobinson/element-capture). 

The elements that are found to be outside of the visible window and those that are less than 7/8ths visible are discarded. The rest are cropped out of the screenshot and passed on to the next component. During testing it was discovered that cut-off images were far more likely to be misclassified. To combat this discarding partially cut-off images was introduced, originally with 1/2 as a threshold. Further testing revealed 1/2 and even 3/4 was insufficient, so 7/8ths was chosen. The decision to not simply require the entire container to be visible was made to enhance the user experience.

The team initially implemented [html2canvas](https://html2canvas.hertzen.com/documentation) because it was tidier approach problematically, but found that it was both expensive (time) and it was unable to handle iframes, which means it offered limited utility. The second point is what prompted the team to explore other options.

![Example of Screenshots Component](https://i.imgur.com/St8Krif.png)
*Above is a visualization of the identified elements being cropped out of the full page screenshot.*

#### Ad Detection
The cropped elements are processed by either OCR, which looks for keywords, or an Image Classifier which returns the elements that have been identified as Advertisements or Promoted/Sponsored content. A user can toggle between the two methods in the options page.

##### OCR
OCR was implemented using [Tesseract.js](http://tesseract.projectnaptha.com/) and looks for keywords like "Advertisement" and "Promoted" and their common variants. It is the less performant of the two modes, and only really works when a user is zoomed in on the web page (usually ~200%). 

##### Image Classifier (ML5)
The recommended Ad detection mode for Adclipse is the [ml5.js Image Classifier](https://ml5js.org/docs/ImageClassifier.html). Adclipse uses this image classifier with the robust MobileNet feature set to train and predict content. This is not as good as training an image classifier from scratch but it is fast. A user can continue to augment and test the model with the developer tools in the options page, under the Image Recognition tab.

#### Ad Highlighting/Removal
After the Ad Detection component has returned the elements it identified as advertisements, this component will apply the custom styles defined by the user in options. This is what highlights or removes the ads from the page. 

There are a few different highlight modes, some of which are simple CSS rules applied directly to the element in question like a border, remove, or greyscale, but others are slightly more complex. Both color and label are overlays on the element, which mean that they have to be added as children to the element and then sized the same as and positioned absolutely above the element. This also means that the element has to be changed to a relative position. During testing this has not had any overtly adverse effects but it is something to be aware of as it could break some kind of styling somewhere.

## Performance

### Execution Time

### Accuracy

## Limitations
This extension has many limitations and disadvantages associated with it. These limitations have been organized below as they correspond to different components of Adclipse. 

### General
Even when it is working flawlessly, Adclipse is less pleasant to use than a traditional adblocker because it has to wait for the ads to load and for them to be made visible before it can get rid of them. This problem will never be fixed unless Adclipse makes use of something like a [virtual browser](https://github.com/GoogleChrome/puppeteer) to pre-screen the web page and remove identified advertisements. 

### Container Selection
Container selection is a hard problem for a number of reasons, the biggest two being that there is such an unpredictability to what a website's source code structure will be and that publishers can employ several techniques to confound perceptual ad-blockers [\[4\]](https://arxiv.org/pdf/1811.03194.pdf). While our current container selection method may work on reddit and other sites, there are countless others where it does not work. The biggest problem with any kind of container selection is that it is not perceptual, and is therefore subject to all kinds of obfuscation by the publisher, which leaves Adclipse exposed in the same way as traditional ad-blockers. 

### Screenshots
The screenshot method actually works quite well, and is reasonably performant. It is, however, at the mercy of container selection. When container selection works and passes good elements then there is no problem, but container selection could be passing elements that are z-indexed below others, hidden, or contained in others etc. When this is the case the screenshot method breaks down because it is cropping elements that are obscured by others, and is therefore passing images to detection that may not be coherent, or useful. This is not necessarily a problem with the screenshot method, but rather a limitation of container selection.

### Detection
Detection is further down the pipeline, so the effects of poor container selection are seen here too. If the container selection returned obscured elements, then the screenshots may be returning incoherent images that are to be processed. This may result in hidden content being labeled as an advertisement, which could make certain sites unusable. From the publisher's perspective, this method would likely be a much more effective anti-adblocker campagn that the usual "Please disable your adblocker" messages. 

#### OCR
The current OCR implementation does not seem to be quick or accurate at standard resolution, so that is a glaring issue. Another issue specific to OCR is localization. Adclipse could need to support multiple language's words for advertisement, sponsored, and promoted. Also, some countries likely do not have strict advertising laws that require ads to be clearly labeled. 

#### Image Classifier
The primary issue with the image classifier is that it only classifies images as one of the classes it trained on, which means that all non-advertisement classes need to be defined and trained. Getting a training set for a robust "Other" class that works on the majority of web pages may prove difficult. The classifier does not return weights either, which means we cannot use a threshold or anything to try to assist Adclipse in improving accuracy. 

Perhaps an approach akin to [YOLOv3](https://pjreddie.com/darknet/yolo/), where the image classifier tries to find instances of the class within an image and automatically discards the rest may be the future of Adclipse. It would likely require us to train the model offline, but ml5.js does [support yolo](https://ml5js.org/docs/YOLO) (limited), so it's conceivable the team could implement this in the future as a replacement for container selection and the image classifier. If it works the pipeline could just be screenshot of full page followed by yolo and then finally highlighting/removing.  

### Ad Highlighting/Removal
Adclipse does not currently implement anything to combat anti-adblocker behavior on websites. If the ads are being removed by Adclipse it may trigger some kind of anti-adblocker response from the website and render the site unusable. To combat this Adclipse would need to implement techniques like those suggested by Storey et Al. [\[2\]](https://arxiv.org/abs/1705.08568) The most thorough of those being the Shadow DOM model where a second copy of the DOM is used to deceive publishers into thinking no changes have been made. 

## Future Plans
While this was a fun project and a good learning experience this project will not be actively improved or maintained. If this changes the readme will change.  
