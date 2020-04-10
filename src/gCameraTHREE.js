class GCamera {


    /******** MOUSE CONTROLED CAMERA *********/
    static orbitateAroundCyclist(_cyclist, radius, maxHorizonHeight) {
        // Angle on XZ plane
        let angle = Utils.p5.map(Utils.mouseX, 0, window.innerWidth, 0, Math.PI * 2);
        let pX = _cyclist.mesh.position.x + (Math.cos(angle) * radius);
        let pZ = _cyclist.mesh.position.z + (Math.sin(angle) * radius);
        let pY = Utils.p5.map(Utils.mouseY, 0, window.innerHeight, 0, maxHorizonHeight);
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

        // let oPosX = Math.cos(Utils.p5.radians(-Utils.p5.rotationZ) + (Math.PI / 2)) * frustrumDepth;
        // let oPosY = Math.sin(Utils.p5.radians(-Utils.p5.rotationZ) + (Math.PI / 2)) * frustrumDepth;
        let angle = Utils.p5.radians(Utils.p5.rotationZ - 270);
        let oPosX = centerX + Math.cos(-angle) * frustrumDepth;
        let oPosZ = centerZ + Math.sin(-angle) * frustrumDepth;

        GUI.Xrotation.textContent = "rotationX";
        GUI.Yrotation.textContent = "input angle " + Utils.p5.rotationX;
        GUI.Zrotation.textContent = "output angle " + oPosY;

        world.getCamera().lookAt(new THREE.Vector3(oPosX, oPosY, oPosZ));
    }
}