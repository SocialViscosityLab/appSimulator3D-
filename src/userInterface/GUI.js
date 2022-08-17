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

    /* Set the width of the side navigation to 250px */
    static openNav() {
        document.getElementById("mySidenav").style.width = "450px";
    }

    /* Set the width of the side navigation to 0 */
    static closeNav() {
        document.getElementById("mySidenav").style.width = "0";
    }

    static setStatus(deviceStatus) {
        switch (deviceStatus) {
            case 'GPS OK':
                GUI.status.textContent = "gps_fixed";
                break;
            case 'GPS not enabled':
                GUI.status.textContent = "gps_off";
                break;
            default:
                GUI.status.textContent = "gps_not_fixed";
        }

    }

    static setupMapRotationSlider() {
        GUI.manualRotationValue.innerHTML = GUI.manualRotationCorrection.value;
        GUI.manualRotationCorrection.oninput = function() {
            GUI.manualRotationValue.innerHTML = this.value;
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
GUI.routeName = document.getElementById("routeName");
GUI.accelerationLabel = document.getElementById('accelerationLabel');
GUI.cameraButton = document.getElementById('cameraButton');
GUI.enableSound = document.getElementById('enableSound');
GUI.enableLocation = document.getElementById('enableLocation');
GUI.manualRotationCorrection = document.getElementById('manualRotationCorrection');
GUI.manualRotationValue = document.getElementById('manualRotationValue')

GUI.location_on = document.getElementById('location_on');
GUI.threeD_rotation = document.getElementById('3d_rotation');
GUI.volume_up = document.getElementById("volume_up");
GUI.clock = document.getElementById("clock");

// Gauge
// retrieving GUI elements
GUI.gauge = document.getElementById('gauge');
GUI.gaugeBox = document.getElementsByClassName('gaugeBox');
GUI.vehicleBox = document.getElementById('vehicleGaugeBox')
GUI.vehicleLabel = document.getElementById('vehicleGaugeLabel');
GUI.ghostBox = document.getElementById('ghostGaugeBox')
GUI.ghstLabel = document.getElementById('ghostGaugeLabel');