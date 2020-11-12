class Cyclist extends Marker {
    constructor(_id, _scene, _geometry, _material) {
        super(_scene);
        this.id = _id;
        if (_geometry) {
            this.geometry = _geometry;
        } else {
            this.geometry = new THREE.CylinderGeometry(10, 3, 8, 32);
        }

        if (_material) {
            this.material = _material;
        } else {
            this.material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        }

        this.arrowField;
    }

    initializeArrowField() {
        // //*** Arrowhead field ***/
        if (this.arrowField == undefined) {
            this.arrowField = new ArrowheadField(this, 3, 30);
            this.arrowField.scale(0.5);
            let targetPosition = new THREE.Vector3();
            ghost.mesh.getWorldPosition(targetPosition);
            this.arrowField.setTarget(targetPosition);
        }
    }
}