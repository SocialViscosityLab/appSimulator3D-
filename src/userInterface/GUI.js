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
            GUI.sidenav.style.left = "0px";
    }

    /* Set the width of the side navigation to 0 */
    static closeNav() {
        if (window.getComputedStyle(GUI.sidenav).left  ==  "0px") {
            GUI.sidenav.style.left = "-480px";
        }
    }

    static setStatus(deviceStatus) {
        switch (deviceStatus) {
            case 'GPS OK':
                GUI.status.textContent = "gps_fixed";
                GUI.statusBanner.style.backgroundColor = "#EAE40A";
                break;
            case 'GPS not enabled':
                GUI.status.textContent = "gps_off";
                break;
            default:
                GUI.status.textContent = "gps_not_fixed";
        }

    }

    static setBluetoothStatus(status) {
        switch (status) {
            case 'connected':
                GUI.bluetooth.textContent = "bluetooth_connected";
                break;
            case 'disconnected':
                GUI.bluetooth.textContent = "bluetooth_disabled";
                break;
            case 'searching':
                GUI.bluetooth.textContent = "bluetooth_searching";
                break;
        }
    }

    static setupMapRotationSlider() {
        GUI.manualRotationValue.innerHTML = GUI.manualRotationCorrection.value;
        GUI.manualRotationCorrection.oninput = function () {
            GUI.manualRotationValue.innerHTML = this.value;
        }
    }

    static setupCameraTiltSlider() {
        GUI.gCameraTiltValue.innerHTML = GUI.gCameraTilt.value;
        GUI.gCameraTilt.oninput = function () {
            GUI.gCameraTiltValue.innerHTML = this.value;
        }
    }

    /**
     * Changes the colors of GUI elements base don acceleration
     * @param {string} key either 'hold', 'up', or 'down'
     */
    static setColors(key) {
        switch (key) {
            case 'hold':
                GUI.header.style.backgroundColor = '#00AFFC'; // blue color
                GUI.accelerationLabel.style.backgroundColor = '#00AFFC';
                GUI.accelerationLabel.style.color = '#00673e';

                for (const box of GUI.gaugeBox) {
                    box.style.backgroundColor = '#1d5567'
                }
                GUI.vehicleLabel.style.color = '#d2dfe3'
                GUI.ghstLabel.style.color = '#d2dfe3'

                GUI.accelerationLabel.textContent = "Flocking!!!";

                break;

            case 'up':
                GUI.header.style.backgroundColor = '#3FBF3F'; // lime color
                GUI.accelerationLabel.style.backgroundColor = '#3FBF3F';
                GUI.accelerationLabel.style.color = '#00673e';

                for (const box of GUI.gaugeBox) {
                    box.style.backgroundColor = '#00673e'
                }

                GUI.vehicleLabel.style.color = '#73ce6b'
                GUI.ghstLabel.style.color = '#73ce6b'


                break;

            case 'down':
                GUI.header.style.backgroundColor = '#f90060'; // magenta color
                GUI.accelerationLabel.style.backgroundColor = '#fd99bf';
                GUI.accelerationLabel.style.color = '#b3003f';

                for (const box of GUI.gaugeBox) {
                    box.style.backgroundColor = '#f90060'
                }
                GUI.vehicleLabel.style.color = '#feccdf'
                GUI.ghstLabel.style.color = '#feccdf'

                break;

            default:
                break;
        }
    }

}

GUI.sidenav = document.getElementById("mySidenav");

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
GUI.statusBanner = document.getElementById('banner');
GUI.bannerTitle = document.getElementById('title');
//GUI.downloadData = document.getElementById('downloadData');
GUI.distance = document.getElementById('distance');
GUI.header = document.getElementById('header');
GUI.error = document.getElementById('error');
GUI.routeName = document.getElementById("routeName");
GUI.cyclistID = document.getElementById("cyclistID");
GUI.accelerationLabel = document.getElementById('accelerationLabel');
GUI.cameraButton = document.getElementById('cameraButton');
GUI.enableSound = document.getElementById('enableSound');
//GUI.enableLocation = document.getElementById('enableLocation');
GUI.manualRotationCorrection = document.getElementById('manualRotationCorrection');
GUI.manualRotationValue = document.getElementById('manualRotationValue')
GUI.gCameraTilt = document.getElementById('gCameraTiltCorrection');
GUI.gCameraTiltValue = document.getElementById('gCameraTiltValue');
GUI.connectPeripheral = document.getElementById('connectPeripheral');
GUI.ledSwitchBtn = document.getElementById('ledSwitch');

GUI.location_on = document.getElementById('location_on');
GUI.threeD_rotation = document.getElementById('3d_rotation');
GUI.bluetooth = document.getElementById("bluetooth");
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