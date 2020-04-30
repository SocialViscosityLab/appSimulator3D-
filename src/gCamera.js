class GCamera {

    /** Sets the x position on the map */
    static setXPos(xPos) {
        world.getCamera().position.x = xPos;
    }

    /** Sets the z position on the map */
    static setZPos(zPos) {
        world.getCamera().position.z = zPos;
    }

    /** Sets the height above the map */
    static setYPos(yPos) {
        world.getCamera().position.y = yPos;
    }

    static cameraMode = "First-person";

    // Current zoom level
    static zoomLevel = 1;

    // Max zoom level. How high the camera can be above the ground
    static maxZoom = 2800;

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
        // determines the angle rotating over X axis
        if (Utils.p5.rotationX < 0) {
            oPosY = 0;
        } else
        if (Utils.p5.rotationX >= 0 && Utils.p5.rotationX <= 90) {
            oPosY = Utils.p5.map(Utils.p5.rotationX, 0, 90, -10, 100)
        } else if (Utils.p5.rotationX >= 100) {
            oPosY = 70;
        }

        // This is adapts the zoom level at each iteration of the main interval
        if (GUI.cameraButton.textContent == "Adaptive height") {
            let maxDistance = 50000;
            let distanceToGhost = cyclist.mesh.position.distanceToSquared(ghost.mesh.position);
            if (distanceToGhost > maxDistance) {
                distanceToGhost = maxDistance;
            }
            let newZoomLevel = Utils.p5.map(distanceToGhost, 0, maxDistance, 1, GCamera.maxZoom);
            GCamera.zoomLevel = newZoomLevel;
        }

        GCamera.setYPos(GCamera.zoomLevel);

        // let oPosX = Math.cos(Utils.p5.radians(-Utils.p5.rotationZ) + (Math.PI / 2)) * frustrumDepth;
        // let oPosY = Math.sin(Utils.p5.radians(-Utils.p5.rotationZ) + (Math.PI / 2)) * frustrumDepth;
        let angle = Utils.p5.radians(Utils.p5.rotationZ - 270);
        let oPosX = centerX + Math.cos(-angle) * frustrumDepth;
        let oPosZ = centerZ + Math.sin(-angle) * frustrumDepth;

        world.getCamera().lookAt(new THREE.Vector3(oPosX, oPosY, oPosZ));
    }



    static switchMobileCamera() {
        switch (GCamera.cameraMode) {
            case "Top view":
                GCamera.cameraMode = "First-person";
                GCamera.zoomLevel = 100;
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