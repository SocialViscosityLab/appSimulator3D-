/**
 * Notes about Vizicities
 * 
 * - Vizicities is built on top of three.js.
 * 
 * - The root of the structure is a World class with one THREE.scene and a render (THREE.WebGLRenderer) engine.
 * 
 * - You can add a geometry to each layer in the 'geometry' attribute inside of a parameter passed to the Layer constructor's
 * function.
 * 
 * - Each 3D geometry in the world object has its own layer (I am using PointLayer class). There might be multiple
 * THREE.geometries in the same layer, but they are all treated as a unified geometry. The material assigned is the 
 * same for al the THREE.geometries in the layer.
 * 
 * - For animating geometries, it is necesary to access the _object3D inside the layer. It has properties such as position
 * in realtion to the world view origin setted when the world is instantiated.
 * 
 * My approach will be to create one PointLayer for each cyclist, including the ghost. Each PointSesion instance will be 
 * equivalent to a Session. All the layers will be grouped in a custom made VIZIjourney object. In doing so, the structure
 * of Journey>Session is preserved.
 * 
 * - Layers must have a name attribute to retrive them in a structured manner.
 * 
 * - The CAMERA is an object controlled by a static class in Controls. There might be multiple
 * controls in the world. The main one is in the first position of the array world._controls.
 * In that array you can access the controls controlling the camera at 'world._controls[0]._controls'.
 * The actual camera is hidden under the 'world._controls[0]._controls.object' attribute. The
 * target and position of the camera are defined by 'world._controls[0]._controls.target'
 * 
 * The library VIZICITIES has CSSSTYLES for 2D and 3D. It comes with a style position set to 'absolute'. I changed it to 'static'.
 * 
 * Overriding ORBIT CONTROLS. The way orbit controls work is by controlling the world's main camera. This is made in line 6207. 
 * The orbit controls triggers events on mouse released or mouse dragged (not sure about touchscreen or giroscope events). Since I am
 * not creating an instance of Controls, those events are not triggered directly. So I created a util class named GCamera
 * with static functions that trigger events needed to retrieve the 3D maps.   
 * 
 *  * Buildings from Mapzen
 * NOTE: VIZI originally used Mapzen.com (https://en.wikipedia.org/wiki/Mapzen) as a provider of Vector 
 * Tiles and 3D buildings but it was replaced by Nextzen.org.
 * See URL:  https://www.nextzen.org/
 * Get API key for Nextzen at https://developers.nextzen.org/. Must have a Github account to access.
 * On Github: https://github.com/nextzen/developers and https://github.com/nextzen
 * NextZen support https://www.mapzen.com/blog/long-term-support-mapzen-maps/ 
 * 
 * 
 * VIDEO RESOURCES
 * http://blog.cjgammon.com/threejs-geometry
 * 
 */

/*** GLOBAL VARIABLES */

// An instance of p5
Utils.setP5(new p5());

// The ghost, cyclists and cyclists's device
let ghost, cyclist, device;

// The session coordinates
let dataCoords = [];

/**
 * ghostCoords and journeyData must be global because they updated in communication. 
 */
let ghostCoords;
let journeyData;

// whether or not this app is ran on a mobile phone
let isMobile;
// whether or not this app is ran on an Apple mobile device
let iOS;


// the update interval
let updateInterval;

//The instance of the communication
let comm;
let commEnabled = false;
let ghost_loaded = false;

//Sound manager
let soundManager;


// Map Center 
//var coords = [40.7359, -73.9911]; // Manhattan
//var coords = [40.1076407, -88.2119009]; // Urbana Home
var coords = [40.10839, -88.22704]; // uiuc quad
//var coords = [41.8879756, -87.6270752]; // Chicago river
//var coords = [-33.4580124, -70.6641774]; // Santiago de Chile
//var coords = [4.6389637, -74.094946] // Bogota
//var coords = [3.426171, -76.578768] //MP
//var coords = [36.1212532, -97.0702415]; //OSU

/**
 *** DEVICE ***
 */
device = new DevicePos();
device.setup();

/**
 *** Instantiation of world ***
 */
var world = VIZI.world('world', {
    skybox: false,
    postProcessing: false
}).setView(coords);

// Add controls
//VIZI.Controls.orbit().addTo(world);

// Initialize Map base Layer and GeoJSON layer with 3D buldings
Layers.init()

/**
 * This is the p5's preload function. I am using it to load files.
 */
function preload() {
    /***** GHOST ****/
    ghost = new Fantasma(world._engine._scene);
    ghost.init();

    /***** CYCLIST ****/
    cyclist = new Cyclist("firstCyclist", world._engine._scene);
    cyclist.init();
    cyclist.setPosition(world.latLonToPoint(coords));

    /***** CAMERA ****/
    //IMPORTANT See notes about camera in intro description
    GCamera.setXPos(cyclist.mesh.position.x);
    GCamera.setZPos(cyclist.mesh.position.z);

    /***** GUI ****/
    //IMPORTANT RequestMotionPermision is in deviceOrientation.js class
    GUI.enableOrientation.onclick = requestMotionPermission;

    // *** COMMUNICATION TO FIREBASE ****
    GUI.enableCommFirebase.onclick = connectToFirebase;

    // *** ENABLE LOCATION ***
    //GUI.enableLocation.onclick = enableLocation;

    // *** ENABLE SOUND ***
    /**IMPORTANT After days of experimentation I discovered that the alert() function that displays a message on screen interrupts
     * all running audioContexts, but when the alert windo is closed, the audioContexts remain closed. The moral is: do not use alert(), 
     * instead use other message windows like Boostrap cards.
     */
    GUI.enableSound.onclick = function() {
        soundManager.enableAudioContext();
        // activate all sounds
        soundManager.play('ding');
        soundManager.play('riding');
        // pause loop=ing sounds
        soundManager.pause('riding');
    }

    // Setup slider for manual correction of map rotation
    GUI.setupMapRotationSlider();


    /***** INIT ****/
    init();
    initSound();
}


function init() {

    // *** UTILS ****
    Utils.startTime = Date.now();

    // detect kind of device this code is being displayed
    // isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    isMobile = isMobileTablet();
    iOS = is_iOS();

    if (isMobile || iOS) {
        GUI.mobile.textContent = "smartphone";
        // This is the camera height above the ground
        GCamera.zoomLevel = 40;
        GCamera.setYPos(GCamera.zoomLevel);
        GUI.cameraButton.style.visibility = 'visible';
        // Change to user selected camera
        GUI.cameraButton.onclick = GCamera.switchMobileCamera;
    } else {
        GUI.mobile.textContent = "computer";
        // This is the camera height above the ground
        GCamera.zoomLevel = 100;
        GCamera.setYPos(GCamera.zoomLevel);
    }


    // This interval controls the update pace of the entire APP
    // **** UPDATE INTERVAL ****
    setupInterval(1000);
}

function enableLocation() {
    device.setup();
    console.log("here");
}


function initSound() {
    soundManager = new SoundManager();
    soundManager.addMediaNode("ding", document.getElementById("ding"), false);
    soundManager.addMediaNode("riding", document.getElementById("horses"), true, true);

}

// from https://medium.com/simplejs/detect-the-users-device-type-with-a-simple-javascript-check-4fc656b735e1
/**
 * Is the device mobile?
 */
function isMobileTablet() {
    var check = false;
    (function(a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)))
            check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
}

// from https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
/**
 * Is the device iOS?
 */
function is_iOS() {
    return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.platform)
        // iPad on iOS 13 detection
        ||
        (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

/**** AUXILIARY FUNCTIONS *****/
function setupInterval(millis) {

    updateInterval = setInterval(function() {

        // Update ghost, cyclist and arrowfield if needed
        if (ghostCoords) {

            /** ghostCoords is a global variable updated in Communication. At each interval
             * iteration the ghost is repositioned to its latest value */
            ghost.setPosition(world.latLonToPoint(ghostCoords));

            // Set the cyclists position to the device position 
            if (device.pos.lat != undefined && device.pos.lon != undefined) {
                cyclist.setPosition(world.latLonToPoint(device.pos));
            }

            /** Set the arrow field direction. This vector is the substraction of the Ghost's
             * position vector minus the cyclist's position vector */
            let targetPosition = new THREE.Vector3();
            targetPosition.subVectors(ghost.mesh.position, cyclist.mesh.position);
            cyclist.arrowField.setTarget(targetPosition);

            // Distance to ghost. This changes the header color in DOM
            // let distanceToGhost = cyclist.mesh.position.distanceToSquared(ghost.mesh.position);
            let distanceToGhost = device.getDistanceTo(ghostCoords);
            GUI.distance.textContent = "~" + distanceToGhost.toFixed(1) + " m";
            //GUI.error.textContent = distanceToGhost.toFixed(1);

            // The max distance between cyclist and ghost be in the range of the 'green wave.' Units undefined.
            // TODO Improve this so the proximity is only accounted when the cyclist is 'behind' the ghost 
            let greenWaveProximity = 15; // in meters
            let crowdProximity = 50; // in meters

            // Change color only if the device is connected
            if (device.status == 'GPS OK') {
                if (distanceToGhost < greenWaveProximity) {
                    GUI.header.style.backgroundColor = '#00AFFC';
                    GUI.accelerationLabel.style.backgroundColor = '#00AFFC';
                    GUI.accelerationLabel.textContent = "Flocking!!!";
                    soundManager.play('ding');
                } else {
                    GUI.header.style.backgroundColor = '#3FBF3F'; // lime color
                    GUI.accelerationLabel.style.backgroundColor = '#3FBF3F';
                    GUI.accelerationLabel.textContent = "Speed up";
                    soundManager.pause('ding');
                }
                // this is for sound feedback beyound the greenWave zone 
                if (distanceToGhost < crowdProximity) {
                    soundManager.volume(distanceToGhost, crowdProximity);
                    soundManager.play('riding');
                } else {
                    soundManager.pause('riding');
                }
            } else {
                GUI.accelerationLabel.textContent = "...";
            }

            // Move the camera to the latest cyclist's position

            GCamera.setXPos(cyclist.mesh.position.x);
            GCamera.setZPos(cyclist.mesh.position.z);
            // if (isMobile) {
            //     // If the device is a mobile phone move the camera pivot. 
            //     GCamera.lookingFrom(cyclist.mesh.position.x, cyclist.mesh.position.z, 50);
            //     GCamera.emitEvent();
            // }
        }

        /** Save datapoint to Firebase */
        if (device.pos.lat != undefined && device.pos.lon != undefined) {
            //manage registers of datapoints (for json and database)
            let stamp = Utils.getEllapsedTime();
            let coord = { "lat": device.pos.lat, "lon": device.pos.lon };
            // store record
            dataCoords.push({
                "stamp": stamp,
                "coord": coord,
                "gcoord": world.pointToLatLon([ghost.mesh.position.x, ghost.mesh.position.z])
            });
            //*******TODO: add acc
            let tempDPID = dataCoords.length - 1
            let tempDP = {
                'acceleration': 'NA',
                'latitude': coord.lat,
                'longitude': coord.lon,
                'speed': device.getSpeed(), // GPS Speed
                'heading': device.getHeading(), // GPS Heading
                'suggestion': 'NA',
                'time': stamp
            };
            // If comm in enabled save datapoint
            if (comm && commEnabled) {
                comm.addNewDataPointInSession(journeyData.journeyId, journeyData.sessionId, tempDPID, tempDP);
            }
        }

        // update device status on GUI
        GUI.setStatus(device.status);
        if (device.pos.lat) {
            // GUI.latLon.textContent = "Time: " + Utils.getEllapsedTimeSeconds() + ', Lat: ' + device.pos.lat.toFixed(5) + '°, Lon: ' + device.pos.lon.toFixed(5) + '°';
            GUI.latLon.textContent = Utils.getEllapsedTimeSeconds() + " s";
            GUI.clock.textContent = "update"
        } else {
            GUI.latLon.textContent = Utils.getEllapsedTimeSeconds() + ' ...';
        }
        GUI.latLon.href = ('https://www.openstreetmap.org/#map=18/' + device.pos.lat + "/" + device.pos.lon);
    }, millis);
}

// function saveSession() {
//     let now = new Date();
//     now = now.getDay() + "-" + now.getHours() + "-" + now.getMinutes() + "-" + now.getSeconds();
//     Utils.p5.saveJSON(dataCoords, now + ".json");
//     clearInterval(updateInterval);
//     console.log('JSON saved');
//     alert("session ended");
// }

function generateID() {
    return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
}

/** This is used by the GUI to link this function to a button */
async function connectToFirebase() {

    // Enable communication with Firebase
    if (!commEnabled) {
        if (!comm) {
            console.log('started');
            //Creates communication, get the id of the journey the reference route
            comm = new Communication(generateID());
            // Initialize a new session in the latest journey and get journey data
            journeyData = await comm.initSession();
            // Initialize route
            await comm.initRoute(journeyData.refRouteName);
            // activate ghost coordinate listener
            comm.listenToGhost(journeyData.journeyId);
        }
        // Initialize arrow field
        cyclist.initializeArrowField();
        commEnabled = true;
        // alert("Firebase Communication ENABLED");
    } else {
        commEnabled = false;
        //alert("Firebase Communication DISABLED");
    }
    GUI.switchStatus(GUI.enableCommFirebase, commEnabled, { t: "Recording position", f: "Recording disabled" }, { t: "btn btn-success btn-lg btn-block", f: "btn btn-warning btn-lg btn-block" })
    GUI.location_on.hidden = !commEnabled;
}

/********* EVENTS *********/

//mouseEvent handler function
//Awesome! https://plainjs.com/javascript/events/getting-the-current-mouse-position-16/
function mouseHandler(e) {
    e = e || window.event;

    Utils.mouseX = e.pageX;
    Utils.mouseY = e.pageY;

    // IE 8
    if (Utils.mouseX === undefined) {
        Utils.mouseX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        Utils.mouseY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    if (cyclist) {
        //let radius = 20;
        GCamera.orbitateAroundCyclist(cyclist, GCamera.zoomLevel);
        GCamera.emitEvent();
    }
}

// attach handler to the click event of the document
if (document.attachEvent) document.attachEvent('mousemove', mouseHandler);
else document.addEventListener('mousemove', mouseHandler);



function wheelHandler(e) {
    e = e || window.event;
    // Set zoom level
    GCamera.zoomLevel += e.deltaY;
    // Restrict scale
    GCamera.zoomLevel = Math.min(Math.max(0, GCamera.zoomLevel), GCamera.maxZoom);
    // set camera height
    GCamera.setYPos(GCamera.zoomLevel);
    // set camera target
    GCamera.orbitateAroundCyclist(cyclist, GCamera.zoomLevel);
}

// attach handler to the click event of the document
if (document.attachEvent) document.attachEvent('wheel', wheelHandler);
else document.addEventListener('wheel', wheelHandler);



function motionEvent() {
    // let targetPosition = new THREE.Vector3();
    // targetPosition.subVectors(ghost.mesh.position, cyclist.mesh.position);
    // cyclist.arrowField.setTarget(targetPosition);
    // camera
    if (isMobile || iOS) {
        // If the device is a mobile phone move the camera pivot. 
        GCamera.lookingFrom(cyclist.mesh.position.x, cyclist.mesh.position.z, 50);
        // // // emit event to retrieve 3D objects in the GeoJSON layer.
        // // // This function might consume to many resources. Testing if it is not necessary 
        GCamera.emitEvent();
    }
}
// Attach motion event
window.addEventListener('devicemotion', motionEvent);