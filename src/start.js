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

/**This ghostCoords must be global becaus eit is updated in communication. 
 * TODO, make it observer pattern*/
let ghostCoords;

// whether or not this app is ran on a mobile phone
let isMobile;

// the update interval
let updateInterval;

//The instance of the communication
let comm;
let commEnabled = false;

// Map Center 
//var coords = [40.7359, -73.9911]; // Manhattan
var coords = [40.1076407, -88.2119009]; // Urbana Home

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

Layers.init()


/**
 * This is the p5's preload function. I am using it to load files.
 */
function preload() {

    /** 
     *** LOAD ROUTE ***
     */
    // This loads the route and creates a layer that hosts it. 
    Utils.p5.loadJSON('routes/urbanaExtendidoNEW.json', function(val) {

        // Switch Lat Lon order. This is a BUG and needs to be fixed in route maker
        Utils.invertLatLonOrder(val);

        // Initialize layer with route
        Layers.initRoute(val);

        // Get array of lonLat coordinates
        let routeCoords = val.features[0].geometry.coordinates;

        /***** GHOST ****/
        ghost = new Fantasma(world._engine._scene);
        ghost.init();

        // Set the global ghost position at the begining of the route. This must be done
        // once the route is retrieved from firebase
        ghostCoords = [routeCoords[0][1], routeCoords[0][0]];

        /***** CYCLIST ****/
        cyclist = new Cyclist("firstCyclist", world._engine._scene);
        cyclist.init();
        cyclist.setPosition(world.latLonToPoint(coords));
        cyclist.initializeArrowField();

        /***** CAMERA ****/
        //IMPORTANT See notes about camera in intro description
        GCamera.setXPos(cyclist.mesh.position.x);
        GCamera.setZPos(cyclist.mesh.position.z);

        // This is the camera height above the ground
        if (isMobile) {
            GCamera.zoomLevel = 100;
            GCamera.setYPos(GCamera.zoomLevel);
        } else {
            GCamera.zoomLevel = 30;
            GCamera.setYPos(GCamera.zoomLevel);
        }

        /**
         *** GUI ***
         */
        if (GUI.targetOnGhost) {
            world._controls[0]._controls.target = ghost.mesh.position;
        } else if (GUI.targetOnCyclist) {
            world._controls[0]._controls.target = cyclist.mesh.position;
        }

        // *** COMMUNICATION TO FIREBASE ****
        GUI.enableCommFirebase.onclick = connectToFirebase;

        /**
         *** INIT ***
         */
        init();
    })
}


function init() {
    // *** UTILS ****
    Utils.startTime = Date.now();

    // detect kind of device this code is being displayed
    isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
        GUI.mobile.textContent = "running on mobile"
    } else {
        GUI.mobile.textContent = "running on computer"

    }
    // **** UPDATE INTERVAL ****
    // This interval controls the update pace of the entire APP except p5's draw() function
    setupInterval(500);
}

/**** AUXILIARY FUNCTIONS *****/
function setupInterval(millis) {

    updateInterval = setInterval(function() {

        // Update ghost, cyclist and arrowfield if needed
        if (ghostCoords) {

            /** ghostCoords is a global variable updated in Communication. At each interval
             * loop the ghost is repositioned to its latest value */
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
            let distanceToGhost = cyclist.mesh.position.distanceToSquared(ghost.mesh.position);
            if (distanceToGhost < 1000) {
                GUI.header.style.backgroundColor = '#0000ff'
            } else {
                GUI.header.style.backgroundColor = '#00ff00'
            }

            // Move the camera to the latest cyclist position
            if (!isMobile) {
                GCamera.setXPos(cyclist.mesh.position.x);
                GCamera.setZPos(cyclist.mesh.position.z);
            } else {
                // If the device is a mobile phone move the camera pivot. 
                GCamera.lookingFrom(cyclist.mesh.position.x, cyclist.mesh.position.z, 50);
                // emit event to retrieve 3D objects in the GeoJSON layer.
                // This might consume to many resources. 
                GCamera.emitEvent();
            }
        }

        /** Save datapoint to Firebase */
        if (device.pos != undefined) {
            //manage registers of datapoints (for json and database)
            let stamp = Utils.getEllapsedTime();
            let coord = { "lat": device.pos.lat, "lon": device.pos.lon };
            // store record
            dataCoords.push({
                "stamp": stamp,
                "coord": coord,
                "gcoord": world.pointToLatLon([ghost.mesh.position.x, ghost.mesh.position.z])
            });
            //TODO: add acc and speed(?)
            let tempDPID = dataCoords.length - 1
            let tempDP = {
                'acceleration': 0,
                'latitude': coord.lat,
                'longitude': coord.lon,
                'speed': 0,
                'suggestion': 0,
                'time': stamp
            };
            // If comm in enabled save datapoint
            if (comm) {
                comm.addNewDataPointInSession(tempDPID, tempDP)
            }
        }

        // update device status on GUI
        GUI.status.textContent = device.status;
        GUI.latLon.textContent = "Time: " + Utils.getEllapsedTime() + ', Latitude: ' + device.pos.lat + '°, Longitude: ' + device.pos.lon + '°';
        GUI.latLon.href = ('https://www.openstreetmap.org/#map=18/' + device.pos.lat + "/" + device.pos.lon);
    }, millis);
}

function saveSession() {
    let now = new Date();
    now = now.getDay() + "-" + now.getHours() + "-" + now.getMinutes() + "-" + now.getSeconds();
    Utils.p5.saveJSON(dataCoords, now + ".json");
    clearInterval(updateInterval);
    console.log('JSON saved');
    alert("session ended");
}

function generateID() {
    return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
}

/** This is used by the GUI to lint this function to a button */
function connectToFirebase() {
    if (!commEnabled) {
        comm = new Communication(generateID());
        commEnabled = true;
        alert("Firebase Communication ACTIVATED");
    }
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

        let maxHorizonHeight = 50
        let radius = 20;
        GCamera.orbitateAroundCyclist(cyclist, radius, maxHorizonHeight);
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
    world.getCamera().position.y = GCamera.zoomLevel;
}

// attach handler to the click event of the document
if (document.attachEvent) document.attachEvent('wheel', wheelHandler);
else document.addEventListener('wheel', wheelHandler);