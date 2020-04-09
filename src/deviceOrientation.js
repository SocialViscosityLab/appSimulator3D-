/**https://www.sitepoint.com/using-device-orientation-html5/ and 
https://www.w3.org/2008/geolocation/wiki/images/e/e0/Device_Orientation_%27alpha%27_Calibration-_Implementation_Status_and_Challenges.pdf
*/
var initialOffset = null;

window.addEventListener('deviceorientation', function(evt) {
    //console.log("device orientation")
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
}, false)