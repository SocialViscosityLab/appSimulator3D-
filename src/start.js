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
 */

/*** GLOBAL VARIABLES */

// The ghost, cyclists and cyclists's device
let ghost, cyclist, device;

let route;
let speed;

let dataCoords = [];

let ghostCoords;

// whether or not this app is ran on a mobile phone
let isMobile;

// the update interval
let updateInterval;

//The instance of the communication
let comm;
let commEnabled = false;

// Map Center 
var coords = [40.7359, -73.9911]; // Manhattan
//var coords = [40.1076407, -88.2119009]; // Urbana Home

// Instantiation of world
var world = VIZI.world('world', {
    skybox: false,
    postProcessing: false
}).setView(coords);

// Add controls
//VIZI.Controls.orbit().addTo(world);

/**CartoDB basemap
 * https://carto.com/help/building-maps/basemap-list/
 **/

VIZI.imageTileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
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
// VIZI.topoJSONTileLayer('https://tile.nextzen.org/tilezen/vector/v1/all/{z}/{x}/{y}.topojson?api_key=1owVePe8Tg-s69xWGlLzCA', {
//     interactive: false,
//     style: function(feature) {
//         let height;

//         if (feature.properties.height) {
//             height = feature.properties.height;
//         } else {
//             // This assigns height to geometries with unknown height
//             height = 10;
//         }

//         return {
//             height: height,
//             transparent: true,
//             opacity: 0.4,
//         };
//     },
//     filter: function(feature) {
//         // Don't show points
//         return feature.geometry.type !== 'Point';
//     },
//     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://whosonfirst.mapzen.com#License">Who\'s On First</a>.'
// }).addTo(world);

/** 
 * Broadway Route
 **/
Utils.setP5(new p5());


/**
 * This is the p5's preload function. I am using it to load files.
 */
function preload() {

    /******* LOAD ROUTE *******/
    // This loads the route and creates a layer that hosts it. 
    route = Utils.p5.loadJSON('routes/broadway2.json', function(val) { //urbanaExtendidoNEW.json
        Utils.invertLatLonOrder(val);
        VIZI.geoJSONLayer(route, {
            output: true,
            interactive: false,
            style: function(feature) {
                var colour = (feature.properties.color) ? '#' + feature.properties.color : '#ffffff';
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
        let gGeometry = new THREE.CylinderGeometry(10, 3, 22, 32);
        let gMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        ghost = new Fantasma(world._engine._scene, gGeometry, gMaterial);
        ghostCoords = [routeCoords[0][1], routeCoords[0][0]];
        //ghost.AddRoute(getRoute(routeCoords));
        ghost.setPosition(world.latLonToPoint(ghostCoords));

        // **** CYCLIST ****
        let tmpGeom = new THREE.CylinderGeometry(10, 3, 22, 32);
        let tmpMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        cyclist = new Cyclist("firstCyclist", world._engine._scene, tmpGeom, tmpMat);

        let pos = world.latLonToPoint([40.74289976363825, -73.98868362419309]);
        cyclist.setPosition(pos);

        // //*** Arrowhead field ***/
        arrowField = new ArrowheadField(cyclist, 3, 30);
        arrowField.scale(0.5);
        // // arrowField.init(world._engine._scene);
        let targetPosition = new THREE.Vector3();
        ghost.mesh.getWorldPosition(targetPosition);
        arrowField.setTarget(targetPosition);
        // arrowField.setPivot(cyclist);

        /** 
         * CAMERA TARGET
         */
        let camTarget = new THREE.Object3D();
        pos = world.latLonToPoint([40.74289976363825, -73.97868362419309]);
        camTarget.position.set(pos.x, 50, pos.y)

        /**
         *** CAMERA ***
         IMPORTANT See notes about camera in intro description
         */
        world.getCamera().position.x = cyclist.mesh.position.x;
        world.getCamera().position.z = cyclist.mesh.position.z;
        world.getCamera().position.y = 20;

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

    // **** DEVICE ****
    device = new DevicePos();
    device.setup();
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

    GUI.enableCommFirebase.onclick = function() {
        console.log("Firebase Communication activated")
        if (!commEnabled) {
            comm = new Communication(generateID());
            console.log("Firebase Communication activated")
            commEnabled = true;
        }
    }
}

/**** AUXILIARY FUNCTIONS *****/
function setupInterval(millis) {
    updateInterval = setInterval(function() {

        // Update ghost, cyclist and arrowfield if needed
        if (ghost && cyclist) {

            /** ghostCoords is a global variable updated in Communication. At each interval
             * loop the ghost is repositioned to its latest value*/
            ghost.setPosition(world.latLonToPoint(ghostCoords));

            // This vector is the substraction of the Ghost's position vector minus the cyclist's position vector
            let targetPosition = new THREE.Vector3();
            targetPosition.subVectors(ghost.mesh.position, cyclist.mesh.position);
            arrowField.setTarget(targetPosition);

            if (isMobile) {
                GCamera.lookingFrom(cyclist.mesh.position.x, cyclist.mesh.position.z, 200);
            }
        }

        // if (device.pos != undefined) {
        //     // update cyclists
        //     cyclist.updatePosition(sMap.lonLatToXY(device.pos));

        //     //manage registers of datapoints (for json and database)
        //     let stamp = Utils.getEllapsedTime();
        //     let coord = { "lat": device.pos.lat, "lon": device.pos.lon }
        //         // store record
        //     dataCoords.push({
        //         "stamp": stamp,
        //         "coord": coord,
        //         "gcoord": sMap.XYToLonLat(ghost.pos)
        //     });
        //     //TODO: add acc and speed(?)
        //     let tempDPID = dataCoords.length - 1
        //     let tempDP = {
        //         'acceleration': 0,
        //         'latitude': coord.lat,
        //         'longitude': coord.lon,
        //         'speed': 0,
        //         'suggestion': 0,
        //         'time': stamp
        //     }
        //     comm.addNewDataPointInSession(tempDPID, tempDP)

        // }

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

// mouseEvent handler function
// Awesome! https://plainjs.com/javascript/events/getting-the-current-mouse-position-16/
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
    }
}

// attach handler to the click event of the document
if (document.attachEvent) document.attachEvent('mousemove', mouseHandler);
else document.addEventListener('mousemove', mouseHandler);