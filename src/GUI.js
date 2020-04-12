/** Manages all GUI elements from the HTML */
class GUI {
    static status = document.getElementById("status");
    static latLon = document.getElementById('map-link');
    // static ghost = document.getElementById('ghost');
    static mobile = document.getElementById('mobile');
    // static rotation = document.getElementById('rotation');
    // static Xrotation = document.getElementById('xRot');
    // static Yrotation = document.getElementById('yRot');
    // static Zrotation = document.getElementById('zRot');
    static enableCommFirebase = document.getElementById('commFirebase');
    static downloadData = document.getElementById('downloadData');
    static distance = document.getElementById('distance');
    static header = document.getElementById('header');
    static error = document.getElementById('error');
    static bannerBottom = document.getElementById('bannerBottom');

    static showError(msg) {
        GUI.error.textContent = msg;
    }
}