class Arrowhead {

    constructor() {
        this.elevation = 20;
        this.length = 20;
        this.geometry = this.customGeometry();
        this.material = new THREE.MeshPhongMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.7
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.currentScale = 1;
    }


    init(host) {
        host.add(this.mesh);
    }

    scale(val) {
        this.currentScale = val;
        this.mesh.scale.set(val, val, val);
    }

    setPosition(_x, _y, _z) {
        this.mesh.position.set(_x, this.elevation, _y);
    }

    /**
     * Points the arrow towards the target 
     * @param {Marker} vector3D  The THREE.Vector3 to look at.
     */
    lookAt(vector3D) {
        this.mesh.lookAt(vector3D);
    }

    /**
     * Extends the length of the arrowhead. 
     * @param val is a length amplification factor 
     * 
     */
    updateLength(val) {
        this.mesh.scale.set(this.currentScale, this.currentScale * val, this.currentScale);
    }

    /**
     * Draws an arrow shape
     */
    customGeometry() {
        let geom = new THREE.Geometry();
        let thickness = 2;
        geom.vertices.push(
            new THREE.Vector3(0, 0, 0), //0
            new THREE.Vector3(7, 0, -3), //1
            new THREE.Vector3(0, 0, 40), //2
            new THREE.Vector3(-7, 0, -3), //3


            new THREE.Vector3(0, thickness, 0), //4
            new THREE.Vector3(7, thickness, -3), //5
            new THREE.Vector3(0, thickness, 40), //6
            new THREE.Vector3(-7, thickness, -3), //7
        );
        // faces
        geom.faces.push(
            // TAIL RIGHT
            new THREE.Face3(0, 4, 5),
            new THREE.Face3(0, 5, 1),
            // TAIL LEFT
            new THREE.Face3(0, 3, 7),
            new THREE.Face3(0, 7, 4),
            // RIGHT
            new THREE.Face3(3, 2, 7),
            new THREE.Face3(2, 6, 7),
            // LEFT
            new THREE.Face3(2, 1, 6),
            new THREE.Face3(1, 5, 6),
            // TOP
            new THREE.Face3(6, 5, 4),
            new THREE.Face3(6, 4, 7),
            // BOTTOM
            new THREE.Face3(0, 1, 2),
            new THREE.Face3(0, 2, 3),
        );

        geom.computeFaceNormals();

        return geom;
    }
}