/**
 * The Fantasma class has visual purpose only. It represents a ghost in the app, usually as a position on a map. 
 * 
 * If you want to access the position of a ghost it us usually better to get it from the database (see communication.js). 
 * 
 * If you need to get the ghost's position on the map you need to use getPositionOnMap() of the Marker superclass.
 * 
 */

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