/*
 * SUMMARY: This is the where the functionality for the options page belongs. 
 *
 * https://developer.chrome.com/extensions/options
 */



/*
 * Get Whitelist and display.
 *
 */
var storageCopy = [];
chrome.storage.local.get("whitelist", function (returnedStorage) {
    if (returnedStorage['whitelist'] !== undefined) {
        storageCopy = returnedStorage['whitelist'];
    }
    console.log(storageCopy);
    document.getElementById("whitelist").appendChild(makeUL(storageCopy));
});

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
 * Listeners for checkbox changes.
 *
 * Pattern from : https://stackoverflow.com/questions/14544104/checkbox-check-event-listener
 */
var checkbox = document.querySelector("input[name=grayscale]");
var grayscaleEnabled = false;
//Grayscale
checkbox.addEventListener('change', function () {
    var element = document.getElementById("exampleAd");
    if (this.checked) {
        // Checkbox is checked..
        element.classList.add("adclipseGrayscale");

    } else {
        // Checkbox is not checked..
        element.classList.remove("adclipseGrayscale");
    }
});

/*
 * To make Label and color work properly I took overlay inspiration from below: 
 * https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_image_overlay_fade
 */

//Color
checkbox = document.querySelector("input[name=color]");
checkbox.addEventListener('change', function () {
    var element = document.getElementById("exampleAd");
    if (this.checked) {
        // Checkbox is checked..
        var newDiv = document.createElement("div");
        newDiv.classList.add("adclipseColor");
        element.appendChild(newDiv);
        element.classList.add("adclipseRelative");
    } else {
        // Checkbox is not checked..
        var divs = element.getElementsByClassName("adclipseColor");
        //No idea why foreach wont work here but I tried like 6 times.
        for (var i = 0; i < divs.length; i++) {
            divs[0].remove();
        }
    }
});

//Border
checkbox = document.querySelector("input[name=border]");
checkbox.addEventListener('change', function () {
    var element = document.getElementById("exampleAd");
    if (this.checked) {
        // Checkbox is checked..
        element.classList.add("adclipseBorder");
    } else {
        // Checkbox is not checked..
        element.classList.remove("adclipseBorder");
    }
});
var adclipseLabel="Adclipse";

//Label
checkbox = document.querySelector("input[name=label]");
checkbox.addEventListener('change', function () {
    var element = document.getElementById("exampleAd");
    if (this.checked) {
        // Checkbox is checked..
        var newDiv = document.createElement("div");
        newDiv.textContent = adclipseLabel;
        newDiv.classList.add("adclipseLabel");
        element.appendChild(newDiv);
        element.classList.add("adclipseRelative");
    } else {
        // Checkbox is not checked..
        var divs = element.getElementsByClassName("adclipseLabel");
        //No idea why foreach wont work here but I tried like 6 times.
        for (var i = 0; i < divs.length; i++) {
            divs[0].remove();
        }
    }
});

const body = document.querySelector('body');

/*
 * Event listeners for various options under checkboxes.
 */

//Greyscale Slider
var slider1 = document.getElementById("grayscaleSlider");
slider1.oninput = function () {
    body.style.setProperty('--grayscaleFactor', this.value / 100);
}

//Color Slider
var slider2 = document.getElementById("colorOpacity");
slider2.oninput = function () {
    body.style.setProperty('--colorOpacity', this.value / 100);
}

//Color ColorPicker
var colorPicker1 = document.getElementById("colorColor");
colorPicker1.oninput = function () {
    body.style.setProperty('--colorColor', this.value);
}

//Border Slider
var slider3 = document.getElementById("borderThickness");
slider3.oninput = function () {
    body.style.setProperty('--borderThickness', this.value + "px");
}

//Border Style DropDown
var dropdown1 = document.getElementById("borderStyle");
dropdown1.oninput = function () {
    body.style.setProperty('--borderStyle', this.value);
}

//Border ColorPicker
var colorPicker2 = document.getElementById("borderColor");
colorPicker2.oninput = function () {
    body.style.setProperty('--borderColor', this.value);
}

//Label Font Slider
var slider4 = document.getElementById("labelSize");
slider4.oninput = function () {
    body.style.setProperty('--labelSize', this.value + "px");
}

//Label Opacity Slider
var slider5 = document.getElementById("labelOpacity");
slider5.oninput = function () {
    body.style.setProperty('--labelOpacity', this.value/100);
}

//Label Padding Slider
var slider6 = document.getElementById("labelPadding");
slider6.oninput = function () {
    body.style.setProperty('--labelPaddingTop', this.value+"%");
}

//Label Text Align DropDown
var dropdown2 = document.getElementById("labelTextAlign");
dropdown2.oninput = function () {
    body.style.setProperty('--labelTextAlign', this.value);
}

//Label ColorPicker
var colorPicker3 = document.getElementById("labelColor");
colorPicker3.oninput = function () {
    body.style.setProperty('--labelColor', this.value);
}

//Label Text
var text1 = document.getElementById("labelText");
text1.oninput = function () {
    adclipseLabel= this.value;
    var element = document.getElementById("exampleAd");
    var divs = element.getElementsByClassName("adclipseLabel");
        //No idea why foreach wont work here but I tried like 6 times.
        for (var i = 0; i < divs.length; i++) {
            divs[0].textContent = adclipseLabel;
        }
}