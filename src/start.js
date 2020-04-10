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
 * Overriding ORBIT CONTROLS. The way orbict controls work is by controlling the main camera. This is made in line 6207. 
 * I added a console.log marking my hack. What I am doing is to redirect the main Control Orbit to a second camera, that is
 * never added to the scene. This is far from ideal, but it partially works. The reason why I am doing this is because
 * the mouse events are retrieving 3D geometries that at this point I do not know how to retrieve with my mouse functions.   
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

let route;
let speed;

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

// **** DEVICE ****
device = new DevicePos();
device.setup();

// Instantiation of world
var world = VIZI.world('world', {
    skybox: false,
    postProcessing: false
}).setView(coords);

// Add controls
VIZI.Controls.orbit().addTo(world);


/**CartoDB basemap
 * https://carto.com/help/building-maps/basemap-list/
 **/

VIZI.imageTileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL'
}).addTo(world);


/**
 * Buildings from Mapzen
 * NOTE: VIZI originally used Mapzen.com (https://en.wikipedia.org/wiki/Mapzen) as a provider of Vector 
 * Tiles and 3D buildings but it was replaced by Nextzen.org.
 * See URL:  https://www.nextzen.org/
 * Get API key for Nextzen at https://developers.nextzen.org/. Must have a Github account to access.
 * On Github: https://github.com/nextzen/developers and https://github.com/nextzen
 * NextZen support https://www.mapzen.com/blog/long-term-support-mapzen-maps/
 */
VIZI.topoJSONTileLayer('https://tile.nextzen.org/tilezen/vector/v1/all/{z}/{x}/{y}.topojson?api_key=1owVePe8Tg-s69xWGlLzCA', {
    interactive: false,
    style: function(feature) {
        let height;

        if (feature.properties.height) {
            height = feature.properties.height;
        } else {
            // This assigns height to geometries with unknown height
            height = 0;
        }

        return {
            height: height,
            transparent: true,
            opacity: 0.4,
        };
    },
    filter: function(feature) {
        // Don't show points
        return feature.geometry.type !== 'Point';
    },
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
}).addTo(world);


/**
 * This is the p5's preload function. I am using it to load files.
 */
function preload() {

    /******* LOAD ROUTE *******/
    // This loads the route and creates a layer that hosts it. 
    route = Utils.p5.loadJSON('routes/urbanaExtendidoNEW.json', function(val) {
        Utils.invertLatLonOrder(val);
        VIZI.geoJSONLayer(route, {
            output: true,
            interactive: false,
            style: function(feature) {
                var colour = (feature.properties.color) ? '#' + feature.properties.color : '#ff0000';
                return {
                    lineColor: colour,
                    lineWidth: 5,
                    lineRenderOrder: 2
                };
            },
            attribution: '&copy; Social Viscosity Lab'
        }).addTo(world);
        let routeCoords = route.features[0].geometry.coordinates;

        // **** GHOST ****
        ghost = new Fantasma(world._engine._scene);
        ghost.init();

        // switch route points order for debugging
        ghostCoords = [routeCoords[5][1], routeCoords[5][0]];
        ghost.setPosition(world.latLonToPoint(ghostCoords));

        // **** CYCLIST ****
        cyclist = new Cyclist("firstCyclist", world._engine._scene);
        cyclist.init();
        cyclist.setPosition(world.latLonToPoint(coords));
        cyclist.initializeArrowField();

        /**
         *** CAMERA ***
         IMPORTANT See notes about camera in intro description
         */
        world.getCamera().position.x = cyclist.mesh.position.x;
        world.getCamera().position.z = cyclist.mesh.position.z;

        if (isMobile) {
            world.getCamera().position.y = 100;
        } else {
            world.getCamera().position.y = 30;
        }

        GUI
        if (GUI.targetOnGhost) {
            world._controls[0]._controls.target = ghost.mesh.position;
        } else if (GUI.targetOnCyclist) {
            world._controls[0]._controls.target = cyclist.mesh.position;
        }

        // INIT
        init();
    })
}


function init() {
    // *** COMMUNICATION TO FIREBASE ****
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
    setupInterval(100);
}

/**** AUXILIARY FUNCTIONS *****/
function setupInterval(millis) {
    updateInterval = setInterval(function() {

        // Update ghost, cyclist and arrowfield if needed
        if (ghostCoords) {
            /** ghostCoords is a global variable updated in Communication. At each interval
             * loop the ghost is repositioned to its latest value*/
            ghost.setPosition(world.latLonToPoint(ghostCoords));

            if (device.pos) {
                cyclist.setPosition(world.latLonToPoint(device.pos));
            }

            world.getCamera().position.x = cyclist.mesh.position.x;
            world.getCamera().position.z = cyclist.mesh.position.z;
            //world.getCamera().position.y = 100;

            // This vector is the substraction of the Ghost's position vector minus the cyclist's position vector
            let targetPosition = new THREE.Vector3();
            targetPosition.subVectors(ghost.mesh.position, cyclist.mesh.position);
            cyclist.arrowField.setTarget(targetPosition);

            if (isMobile) {
                GCamera.lookingFrom(cyclist.mesh.position.x, cyclist.mesh.position.z, 50);
            }
        }

        if (device.pos != undefined) {

            //manage registers of datapoints (for json and database)
            let stamp = Utils.getEllapsedTime();
            let coord = { "lat": device.pos.lat, "lon": device.pos.lon }
                // store record
            dataCoords.push({
                "stamp": stamp,
                "coord": coord,
                "gcoord": world.pointToLatLon([ghost.mesh.position.x, ghost.mesh.position.z]) //// sMap.XYToLonLat(ghost.pos)
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
            }
            if (comm) {
                comm.addNewDataPointInSession(tempDPID, tempDP)
            } else {
                // console.log("Communication with Firebase not enabled yet");
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

function getRoute(object) {
    let tmp = [];
    for (let index = 0; index < object.length; index++) {
        const element = object[index];
        //console.log(element)
        let tmp2 = world.latLonToPoint(element);
        //console.log(tmp2)
        tmp.push(tmp2);
    }
    return tmp;
}

function generateID() {
    return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
}

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
        // world.emit('preResetView');

        // world._moveStart();
        let maxHorizonHeight = 50
        let radius = 20;
        GCamera.orbitateAroundCyclist(cyclist, radius, maxHorizonHeight);
        //world._move(latlon, point);
        // world._moveEnd();
        // world.emit('postResetView');
    }
}

// attach handler to the click event of the document
if (document.attachEvent) document.attachEvent('mousemove', mouseHandler);
else document.addEventListener('mousemove', mouseHandler);

/** MOUSE CLICK. PRIMITIVE WAY OF CATCHING MOUSE CLICK */
function handler(e) {
    e = e || window.event;

    if (e.pageY < 100) {

        if (!commEnabled) {
            //comm = new Communication(generateID());
            console.log("Firebase Communication DEACTIVATED . SEE MOUSE EVENTS")
            commEnabled = true;
            alert("Firebase Communication DEACTIVATED . SEE MOUSE EVENTS in start.js")
        }
    }
}


// attach handler to the click event of the document
if (document.attachEvent) document.attachEvent('onclick', handler);
else document.addEventListener('click', handler);