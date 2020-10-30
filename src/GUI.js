/** Manages all GUI elements from the HTML */
class GUI {
    static showError(msg) {
        GUI.error.textContent = msg;
    }

    /**
     * Change appearance of html element
     * @param {GUI} element the GUI element
     * @param {boolean} booleanValue 
     * @param {Object} wording Object with 't' and 'f' keys to change the GUI element's textContent
     */
    static switchStatus(element, booleanValue, wording, style) {
        if (booleanValue == true) {
            if (wording) element.textContent = wording.t;
            if (style) {
                element.className = style.t;
            } else {
                element.style.color = "red";
            }
        } else {
            if (wording) element.textContent = wording.f;
            if (style) {
                element.className = style.f;
            } else {
                element.style.color = "black";
            }
        }
    }
}

GUI.status = document.getElementById("status");
GUI.latLon = document.getElementById('map-link');
// GUI.ghost = document.getElementById('ghost');
GUI.mobile = document.getElementById('mobile');
// GUI.rotation = document.getElementById('rotation');
// GUI.Xrotation = document.getElementById('xRot');
// GUI.Yrotation = document.getElementById('yRot');
// GUI.Zrotation = document.getElementById('zRot');
GUI.enableCommFirebase = document.getElementById('commFirebase');
GUI.enableOrientation = document.getElementById('enableOrientation');
//GUI.downloadData = document.getElementById('downloadData');
GUI.distance = document.getElementById('distance');
GUI.header = document.getElementById('header');
GUI.error = document.getElementById('error');
GUI.accelerationLabel = document.getElementById('accelerationLabel');
GUI.cameraButton = document.getElementById('cameraButton');