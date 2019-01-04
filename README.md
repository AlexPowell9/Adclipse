
# Adclipse

Developer Guide: https://developer.chrome.com/extensions/devguide

## Getting Started

1. Clone the repository and then open Chrome.
2. Open the Extension Management page by navigating to chrome://extensions.
3.  The Extension Management page can also be opened by clicking on the Chrome menu, hovering over More Tools then selecting Extensions.
4. Enable Developer Mode by clicking the toggle switch next to Developer mode.
5. Click the LOAD UNPACKED button and select the extension directory.
6. Congratulations! You can now test changes to code by clicking on the refresh button on the adclipse card. 

Read the same information with pictures [here](https://developer.chrome.com/extensions/getstarted).

## Where Are We At?
All the code is commented but probably not very good. 

### Features
- **GUI**: It has icons and badges. You can click it to open the popup and you can do stuff.
- **Container Selection**: At the moment, we have super-duper basic container selection. All is does is select all containers with the attribute "data-google-query-id"
- **Ad Detection**: We have a function for it that takes in selected containers and, at the moment, just returns true unless the container is 1px in width.
- **Highlighting**: Containers that return true from the ad detection function are highlighted with a 10px red border and greyscaled.
- **Badge**: It displays the number of ads "detected" on the currently displayed tab. It is currently capped in triple digits until I get around to adding support for infinitely large numbers. Badges only support like 3-4 digits so we'd have to make `10,001` turn into `>10k` kind of thing. 
- **Whitelist**: Whenever you toggle adclipse it will add the domain to a whitelist that is kept in local storage. 
- **Refresh**: To go along with toggling adclipse there is a working refresh button that appears so you can force it to reload and not run the content script.
- **Options Page**: If you click the gear icon it will take you to an options page that only displays all of the domains in your whitelist. If your whitelist is empty, it will be empty. This is where we can hide a bunch of nitty gritty settings for us.
- **Dynamic Version Display**: Kind of weak, but the GUI does pull the version from the manifest so we never have to worry about updating it and can pretend to be professional developers.
- **Metrics**: The GUI will show you how many ads are blocked, same random number as on the badge. 

## What Do All These Files Do?
Obviously I suggest reading the Google developer guide but here it is roughly.

- **Manifest.json**: This is where you define all the goodness for the application like name, description, and version. Important definitions here are the `browser_action,` which specifies that when a user clicks the icon we should open the popup, `content_scripts`, which specify the url requirements that have to be met before injecting the content.js, and `background`, that specifies background.js as our overseer. We also define our options page, and permissions here.
- **Background.js**: This is the script that runs for as long as our extension is enabled and chrome is running. There is one instance of this script no matter how many tabs you open. You can view the console output by clicking the`inspect background page` link on your chrome extension page, and then opening dev tools > console. This script is in charge of dealing with setting badge text and icons right now.
- **Content.js**: This gets injected to almost every webpage you visit as the manifest.json says. Haven't quite worked out blank pages yet, they seem weird. The scripts first checks if the domain is whitelisted, if so it does very little. If not, it will generate a random number and pretend it's stopping ads. This is where we will have to do most of our work. We can also define multiple content scripts to break things up. To see console output just open the dev console on any webpage.
- **Popup.js/Popup.html**: This is the GUI bit you see when you click the icon. Every time you toggle the big on/off button it will take care of adding/removing the domain from the whitelist. It prompts you to refresh the page to disable to content script and not block fake ads. To see console output you have to inspect the popup element and select console. This script's lifetime is only when you have it open, making it truly only good for GUI work. It has to query other scripts for real info. You can click on the gear to open options.
- **Options.js/Options.html**: This is where all the detailed options will go. Right now it just fetches and displays the whitelist. 


## To Do
Basically the whole project. 
