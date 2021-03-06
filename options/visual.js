/*
* SUMMARY: This file keeps all of the option javascript for the visual tab. 
*/


/*
 * Get Visual Options from storage and apply them.
 */
var visualStorageCopy = [];
chrome.storage.local.get("visual", function (returnedStorage) {
    if (returnedStorage['visual'] !== undefined) {
        visualStorageCopy = JSON.parse(returnedStorage['visual']);
    } else {
        //Does not exist, so we create it with defaults
        visualStorageCopy = getDefaults();
        updateVisualStorage();
    }
    adclipseLabel = visualStorageCopy.label.text;
    initializeCheckboxes();
    initializeOptions();
});


/*
 * Wrapper that updates Visual Options in storage with current copy.
 */
function updateVisualStorage() {
    chrome.storage.local.set({
        "visual": JSON.stringify(visualStorageCopy)
    }, function () {
        //Callback
        console.log("Visual Settings Updated!");
    });
}


/*
 * Return array of default option values, for when there are no options present in storage.
 */
function getDefaults() {
    var storage = {};
    //Grayscale
    storage.grayscale = {
        "active": true,
        "factor": 0.5
    };
    //Color
    storage.color = {
        "active": false,
        "color": "#000000",
        "opacity": 0.5
    };
    //Remove
    storage.remove = {
        "active": false
    };
    //Border
    storage.border = {
        "active": false,
        "color": "#ff0000",
        "style": "solid",
        "thickness": 10
    };
    //Label
    storage.label = {
        "active": false,
        "text": "Adclipse Identified Ad",
        "fontSize": 10,
        "textAlign": "center",
        "opacity": 0.5,
        "textTop": 40,
        "color": "#000000"
    };
    return storage;
}


/*
 * Make an unordered list.
 *
 * https://stackoverflow.com/questions/11128700/create-a-ul-and-fill-it-based-on-a-passed-array
 */
function makeUL(array) {
    // Create the list element:
    var list = document.createElement('ul');
    for (var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        // Set its contents:
        item.appendChild(document.createTextNode(array[i]));

        // Add it to the list:
        list.appendChild(item);
    }
    // Finally, return the constructed list:
    return list;
}


/*
 * Function to initialize listeners for checkbox changes.
 *
 * Pattern from : https://stackoverflow.com/questions/14544104/checkbox-check-event-listener
 */
var adclipseLabel = "Adclipse";

function initializeCheckboxes() {

    //The fake ad that is used to illustrate the blocking
    var element = document.getElementById("exampleAd");

    /*
     * Grayscale
     */
    //This checkbox variable gets reused for all checkboxes to avoid extra variable creation
    var checkbox = document.querySelector("input[name=grayscale]");
    //Handle check states for grayscale
    function grayscaleChecked(checked) {
        if (checked) {
            element.classList.add("adclipseGrayscale");
        } else {
            element.classList.remove("adclipseGrayscale");
        }
    }
    //Initialize Grayscale
    if (visualStorageCopy.grayscale.active) {
        checkbox.checked = true;
        grayscaleChecked(true);
    }
    //Add listener grayscale
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            // Checkbox is checked..
            grayscaleChecked(true);
        } else {
            // Checkbox is not checked..
            grayscaleChecked(false)
        }
        visualStorageCopy.grayscale.active = this.checked;
        updateVisualStorage();
    });

    /*
     * Color
     */
    checkbox = document.querySelector("input[name=color]");
    //Handle check states for color
    function colorChecked(checked) {
        /*
         * To make Label and color work properly I took overlay inspiration from below: 
         * https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_image_overlay_fade
         */
        if (checked) {
            var newDiv = document.createElement("div");
            newDiv.classList.add("adclipseColor");
            element.appendChild(newDiv);
            element.classList.add("adclipseRelative");
        } else {
            var divs = element.getElementsByClassName("adclipseColor");
            //No idea why foreach wont work here but I tried like 6 times.
            for (var i = 0; i < divs.length; i++) {
                divs[0].remove();
            }
        }
    }
    //Initialize Color
    if (visualStorageCopy.color.active) {
        checkbox.checked = true;
        colorChecked(true);
    }
    //Add listener color
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            // Checkbox is checked..
            colorChecked(true);
        } else {
            // Checkbox is not checked..
            colorChecked(false);
        }
        visualStorageCopy.color.active = this.checked;
        updateVisualStorage();
    });

    /*
     * Remove
     */
    checkbox = document.querySelector("input[name=remove]");
    //Handle check states for remove
    function removeChecked(checked) {
        if (checked) {
            element.classList.add("adclipseRemove");
        } else {
            element.classList.remove("adclipseRemove");
        }
    }
    //Initialize Remove
    if (visualStorageCopy.remove.active) {
        checkbox.checked = true;
        removeChecked(true);
    }
    //Add listener remove
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            // Checkbox is checked..
            removeChecked(true);
        } else {
            // Checkbox is not checked..
            removeChecked(false);
        }
        visualStorageCopy.remove.active = this.checked;
        updateVisualStorage();
    });

    /*
     * Border
     */
    checkbox = document.querySelector("input[name=border]");
    //Handle check states for border
    function borderChecked(checked) {
        if (checked) {
            element.classList.add("adclipseBorder");
        } else {
            element.classList.remove("adclipseBorder");
        }
    }
    //Initialize Border
    if (visualStorageCopy.border.active) {
        checkbox.checked = true;
        borderChecked(true);
    }
    //Add listener border
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            // Checkbox is checked..
            borderChecked(true);
        } else {
            // Checkbox is not checked..
            borderChecked(false);
        }
        visualStorageCopy.border.active = this.checked;
        updateVisualStorage();
    });


    /*
     * Label
     */
    checkbox = document.querySelector("input[name=label]");
    //Handle check states for label
    function labelChecked(checked) {
        if (checked) {
            var newDiv = document.createElement("div");
            var textDiv = document.createElement("div");
            textDiv.textContent = adclipseLabel;
            textDiv.classList.add("adclipseLabelText");
            newDiv.classList.add("adclipseLabel");
            newDiv.appendChild(textDiv);
            element.appendChild(newDiv);
            element.classList.add("adclipseRelative");
        } else {
            var divs = element.getElementsByClassName("adclipseLabel");
            //No idea why foreach wont work here but I tried like 6 times.
            for (var i = 0; i < divs.length; i++) {
                divs[0].remove();
            }
        }
    }
    //Initialize Label
    if (visualStorageCopy.label.active) {
        checkbox.checked = true;
        labelChecked(true);
    }
    //Add listener label
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            // Checkbox is checked..
            labelChecked(true);
        } else {
            // Checkbox is not checked..
            labelChecked(false);
        }
        visualStorageCopy.label.active = this.checked;
        updateVisualStorage();
    });

}


/*
 * Event listeners for various options under checkboxes.
 */
const body = document.querySelector('body');

function initializeOptions() {
    /*
     * Greyscale Factor Slider
     */
    //Get current value from options and set css variable, slider
    body.style.setProperty('--grayscaleFactor', visualStorageCopy.grayscale.factor / 100);
    var grayscaleFactorSlider = document.getElementById("grayscaleSlider");
    grayscaleFactorSlider.value = visualStorageCopy.grayscale.factor;
    //Listener
    grayscaleFactorSlider.oninput = function () {
        //Set CSS Variable for visible changes
        body.style.setProperty('--grayscaleFactor', this.value / 100);
        //Set and Store changes
        visualStorageCopy.grayscale.factor = this.value;
        updateVisualStorage();
    }

    /*
     * Color Opacity Slider
     */
    //Get current value from options and set css variable, slider
    body.style.setProperty('--colorOpacity', visualStorageCopy.color.opacity / 100);
    var colorOpacitySlider = document.getElementById("colorOpacity");
    colorOpacitySlider.value = visualStorageCopy.color.opacity;
    //Listener
    colorOpacitySlider.oninput = function () {
        //Set CSS Variable for visible changes
        body.style.setProperty('--colorOpacity', this.value / 100);
        //Set and Store changes
        visualStorageCopy.color.opacity = this.value;
        updateVisualStorage();
    }

    /*
     * Color Color Picker
     */
    //Get current value from options and set css variable, colorpicker
    body.style.setProperty('--colorColor', visualStorageCopy.color.color);
    var colorColorPicker = document.getElementById("colorColor");
    colorColorPicker.value = visualStorageCopy.color.color;
    //Listener
    colorColorPicker.oninput = function () {
        //Set CSS Variable for visible changes
        body.style.setProperty('--colorColor', this.value);
        //Set and Store changes
        visualStorageCopy.color.color = this.value;
        updateVisualStorage();
    }

    /*
     * Border Thickness Slider
     */
    //Get current value from options and set css variable, slider
    body.style.setProperty('--borderThickness', visualStorageCopy.border.thickness + "px");
    var borderThicknessSlider = document.getElementById("borderThickness");
    borderThicknessSlider.value = visualStorageCopy.border.thickness;
    //Listener
    borderThicknessSlider.oninput = function () {
        //Set CSS Variable for visible changes
        body.style.setProperty('--borderThickness', this.value + "px");
        //Set and Store changes
        visualStorageCopy.border.thickness = this.value;
        updateVisualStorage();
    }

    /*
     * Border Style Dropdown
     */
    //Get current value from options and set css variable, dropdown
    body.style.setProperty('--borderStyle', visualStorageCopy.border.style);
    var borderStyleDropdown = document.getElementById("borderStyle");
    borderStyleDropdown.value = visualStorageCopy.border.style;
    //Listener
    borderStyleDropdown.oninput = function () {
        //Set CSS Variable for visible changes
        body.style.setProperty('--borderStyle', this.value);
        //Set and Store changes
        visualStorageCopy.border.style = this.value;
        updateVisualStorage();
    }

    /*
     * Border Color Colorpicker
     */
    //Get current value from options and set css variable, picker
    body.style.setProperty('--borderColor', visualStorageCopy.border.color);
    var borderColorPicker = document.getElementById("borderColor");
    borderColorPicker.value = visualStorageCopy.border.color;
    //Listener
    borderColorPicker.oninput = function () {
        //Set CSS Variable for visible changes
        body.style.setProperty('--borderColor', this.value);
        //Set and Store changes
        visualStorageCopy.border.color = this.value;
        updateVisualStorage();
    }

    /*
     * Label Font Size Slider
     */
    //Get current value from options and set css variable, slider
    body.style.setProperty('--labelFontSize', visualStorageCopy.label.fontSize + "px");
    var labelFontSizeSlider = document.getElementById("labelFontSize");
    labelFontSizeSlider.value = visualStorageCopy.label.fontSize;
    //Listener
    labelFontSizeSlider.oninput = function () {
        //Set CSS Variable for visible changes
        body.style.setProperty('--labelFontSize', this.value + "px");
        //Set and Store changes
        visualStorageCopy.label.fontSize = this.value;
        updateVisualStorage();
    }

    /*
     * Label Opacity Slider
     */
    //Get current value from options and set css variable, slider
    body.style.setProperty('--labelOpacity', visualStorageCopy.label.opacity / 100);
    var labelOpacitySlider = document.getElementById("labelOpacity");
    labelOpacitySlider.value = visualStorageCopy.label.opacity;
    //Listener
    labelOpacitySlider.oninput = function () {
        //Set CSS Variable for visible changes
        body.style.setProperty('--labelOpacity', this.value / 100);
        //Set and Store changes
        visualStorageCopy.label.opacity = this.value;
        updateVisualStorage();
    }

    /*
     * Label Text Top Slider
     */
    //Get current value from options and set css variable, slider
    body.style.setProperty('--labelTextTop', visualStorageCopy.label.textTop + "%");
    var labelPaddingSlider = document.getElementById("labelTextTop");
    labelPaddingSlider.value = visualStorageCopy.label.textTop;
    //Listener
    labelPaddingSlider.oninput = function () {
        //Set CSS Variable for visible changes
        body.style.setProperty('--labelTextTop', this.value + "%");
        //Set and Store changes
        visualStorageCopy.label.textTop = this.value;
        updateVisualStorage();
    }

    /*
     * Label Text Align Dropdown
     */
    //Get current value from options and set css variable, dropdown
    body.style.setProperty('--labelTextAlign', visualStorageCopy.label.textAlign);
    var labelTextAlignDropdown = document.getElementById("labelTextAlign");
    labelTextAlignDropdown.value = visualStorageCopy.label.textAlign;
    //Listener
    labelTextAlignDropdown.oninput = function () {
        //Set CSS Variable for visible changes
        body.style.setProperty('--labelTextAlign', this.value);
        //Set and Store changes
        visualStorageCopy.label.textAlign = this.value;
        updateVisualStorage();
    }

    /*
     * Label Color ColorPicker
     */
    //Get current value from options and set css variable, picker
    body.style.setProperty('--labelColor', visualStorageCopy.label.color);
    var labelColorPicker = document.getElementById("labelColor");
    labelColorPicker.value = visualStorageCopy.label.color;
    //Listener
    labelColorPicker.oninput = function () {
        //Set CSS Variable for visible changes
        body.style.setProperty('--labelColor', this.value);
        //Set and Store changes
        visualStorageCopy.label.color = this.value;
        updateVisualStorage();
    }

    /*
     * Label Text
     */
    var labelText = document.getElementById("labelText");
    labelText.value = visualStorageCopy.label.text;
    //Listener
    labelText.oninput = function () {
        adclipseLabel = this.value;
        var element = document.getElementById("exampleAd");
        var divs = element.getElementsByClassName("adclipseLabel");
        //Update labels on all ads. No idea why foreach wont work here but I tried like 6 times.
        for (var i = 0; i < divs.length; i++) {
            divs[0].innerHTML ='<div class="adclipseLabelText">' + adclipseLabel + '</div>';
        }
        //Set and Store changes
        visualStorageCopy.label.text = this.value;
        updateVisualStorage();
    }
}