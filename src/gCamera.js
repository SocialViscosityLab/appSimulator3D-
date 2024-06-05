class GCamera {

    /** Sets the x position on the map */
    static setXPos(xPos) {
        world.getCamera().position.x = xPos;
    }

    /** Sets the y position on the map */
    static setZPos(zPos) {
        world.getCamera().position.z = zPos;
    }

    /** Sets the height above the map */
    static setYPos(yPos) {
        world.getCamera().position.y = yPos;
    }

    // *** events triggered to retrieve 3D objects on geoJSON tiles
    static emitEvent(latlon, point) {
        // retrieve 3D
        world.emit('preResetView');
        world._moveStart();
        // Use glocal origin coordinates if no new coordinates are passed
        let _latlon = latlon ? latlon : { lat: coords[0], lon: coords[1] }
        let _point = point ? point : { x: 0, y: 0 };
        world._move(_latlon, _point);
        world._moveEnd();
        world.emit('postResetView');
    }


    /******** MOUSE CONTROLED CAMERA *********/
    static orbitateAroundCyclist(_marker, radius) {
        // Angle on XZ plane
        let angle = Utils.p5.map(Utils.mouseX, 0, window.innerWidth, 0, Math.PI * 2);
        // Calculate height
        let pY = Utils.p5.map(Utils.mouseY, 0, window.innerHeight, 0, GCamera.zoomLevel);
        // Calculate target to angle direction 
        let pX = _marker.mesh.position.x + (Math.cos(angle) * pY);
        let pZ = _marker.mesh.position.z + (Math.sin(angle) * pY);

        // Set camera height
        world.getCamera().lookAt(new THREE.Vector3(pX, pY, pZ));
    }


    /******** GYROSCOPE CONTROLED CAMERA *********/
    static lookingFrom(centerX, centerZ, frustrumDepth) {

        let oPosY;
        // determines the angle rotating over X axis. This determines when the horizon is visible when the phone is tilted forward or backward
        if (Utils.p5.rotationX < 0) {
            oPosY = 0;
        } else if (Utils.p5.rotationX >= 0 && Utils.p5.rotationX <= 90) {
            oPosY = Utils.p5.map(Utils.p5.rotationX, 0, 90, 0, 100);
        } else if (Utils.p5.rotationX > 90) {
            oPosY = 70;
        }

        // This adapts the zoom level at each iteration of the main interval
        if (GCamera.cameraMode == "Adaptive height") {
            let maxDistance = 50000;
            let distanceToGhost = cyclist.mesh.position.distanceToSquared(ghost.mesh.position);
            if (distanceToGhost > maxDistance) {
                distanceToGhost = maxDistance;
            }
            let newZoomLevel = Utils.p5.map(distanceToGhost, 0, maxDistance, 150, GCamera.maxZoom);
            GCamera.zoomLevel = newZoomLevel;
        }

        GCamera.setYPos(GCamera.zoomLevel);

        // **** NOTES *****
        // The position of 0 degrees is not consistent across browsers. 
        // Android: WEST(270), iOS: EAST(90), Opera:NORTH(0), FirefoxMobile: NORTH(0), Chrome Android: WEST(270)
        // Source:  https://mobiforge.com/design-development/html5-mobile-web-device-orientation-events
        // Potential solution: https://github.com/ajfisher/deviceapi-normaliser

        // October 2020
        // OSX devices have a different orientation that android devices, thus the angle is determined for each operational system. 
        // Android and desktop devices, including Apple computers, work with the same angle 

        let angleCorrection;

        if (iOS) {
            angleCorrection = 180 + parseFloat(GUI.manualRotationCorrection.value);
        } else {
            angleCorrection = 270 + parseFloat(GUI.manualRotationCorrection.value);
        }

        // the angle read from the gyroscope
        let angle = Utils.p5.radians(angleCorrection - Utils.p5.rotationZ);

        // To move the camera behind the cyclist this creates a pivot 100 units behind in the oposite direction of the rotation
        let pivotX = centerX + Math.cos(angle + Math.PI) * 100;
        let pivotZ = centerZ + Math.sin(angle + Math.PI) * 100;

        // set the camera at the pivot
        GCamera.setXPos(pivotX);
        GCamera.setZPos(pivotZ);
        //GUI.error.textContent = Utils.p5.rotationZ;


        // these coords define the camera target
        let oPosX = centerX + Math.cos(angle) * frustrumDepth;
        let oPosZ = centerZ + Math.sin(angle) * frustrumDepth;

        world.getCamera().lookAt(new THREE.Vector3(oPosX, oPosY, oPosZ));
    }


    static switchMobileCamera() {
        switch (GCamera.cameraMode) {
            case "Top view":
                GCamera.cameraMode = "First-person";
                GCamera.zoomLevel = 40;
                break;
            case "First-person":
                GCamera.cameraMode = "Adaptive height";
                break;
            case "Adaptive height":
                GCamera.cameraMode = "Top view";
                GCamera.zoomLevel = 1000;
                break;
        }
        GUI.cameraButton.textContent = GCamera.cameraMode;
    }
}

GCamera.cameraMode = "First-person";
// Current zoom level
GCamera.zoomLevel = 1;
// Max zoom level. How high the camera can be above the ground
GCamera.maxZoom = 2800;