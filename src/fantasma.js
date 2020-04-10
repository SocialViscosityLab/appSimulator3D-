class Fantasma extends Marker {
    constructor(_scene, _geometry, _material) {
        super(_scene);
        if (_geometry) {
            this.geometry = _geometry;
        } else {
            this.geometry = new THREE.CylinderGeometry(10, 3, 10, 32);
        }

        if (_material) {
            this.material = _material;
        } else {
            this.material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        }
        this.route = [];
    }

    AddRoute(route) {
        this.route = route;
    }
}