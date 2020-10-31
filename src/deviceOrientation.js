/**https://www.sitepoint.com/using-device-orientation-html5/ and 
https://www.w3.org/2008/geolocation/wiki/images/e/e0/Device_Orientation_%27alpha%27_Calibration-_Implementation_Status_and_Challenges.pdf
*/
var initialOffset = null;

function requestOrientationPermission() {
    if (isMobile || iOS) {
        DeviceOrientationEvent.requestPermission()
            .then(response => {
                GUI.error.textContent = response;
                if (response == 'granted') {
                    GUI.switchStatus(GUI.enableOrientation, true, { t: "Compass enabled", f: "Compass disabled" }, { t: "btn btn-success btn-lg btn-block", f: "btn btn-warning btn-lg btn-block" })
                    GUI.threeD_rotation.hidden = false;
                    window.addEventListener('deviceorientation', getCompass(evt))
                }
            })
            .catch(console.error);
    } else {
        alert("Only needed on mobile devices")
    }
}

function getCompass(evt) {
    if (initialOffset === null && evt.absolute !== true && +evt.webkitCompassAccuracy > 0 && +evt.webkitCompassAccuracy < 50) {
        initialOffset = evt.webkitCompassHeading || 0;
    } else if (initialOffset === null) {
        initialOffset = evt.alpha;
    }
    var alpha = evt.alpha - initialOffset;
    if (alpha < 0) {
        alpha += 360;
    }
    // Now use use alpha
}

// Original function before IOS implementation October 2020
// window.addEventListener('deviceorientation', function(evt) {
//     console.log("device orientation")
//     if (initialOffset === null && evt.absolute !== true && +evt.webkitCompassAccuracy > 0 && +evt.webkitCompassAccuracy < 50) {
//         initialOffset = evt.webkitCompassHeading || 0;
//     } else if (initialOffset === null) {
//         initialOffset = evt.alpha;
//     }
//     var alpha = evt.alpha - initialOffset;
//     if (alpha < 0) {
//         alpha += 360;
//     }
//     // Now use use alpha
// }, false)