/** Manages all GUI elements from the HTML */
class GUI {
    static showError(msg) {
        GUI.error.textContent = msg;
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
GUI.downloadData = document.getElementById('downloadData');
GUI.distance = document.getElementById('distance');
GUI.header = document.getElementById('header');
GUI.error = document.getElementById('error');
GUI.accelerationLabel = document.getElementById('accelerationLabel');
GUI.cameraButton = document.getElementById('cameraButton');