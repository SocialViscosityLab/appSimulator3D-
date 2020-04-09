/** Manages all GUI elements from the HTML */
class GUI {
    static status = document.getElementById("status");
    static latLon = document.getElementById('map-link');
    static ghost = document.getElementById('ghost');
    static mobile = document.getElementById('mobile');
    static rotation = document.getElementById('rotation');
    static slow = document.getElementById('slow');
    static medium = document.getElementById('medium');
    static fast = document.getElementById('fast');
    static Xrotation = document.getElementById('xRot');
    static Yrotation = document.getElementById('yRot');
    static Zrotation = document.getElementById('zRot');
    static targetOnGhost = false;
    static targetOnCyclist = false;
    static enableCommFirebase = document.getElementById('commFirebase');
}