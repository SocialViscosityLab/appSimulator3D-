/**
 * This class is a wrapper of THREE geometry, materials and mesh. 
 */
class Marker {
    constructor(_scene, _geometry, _material) {
        // The object containing all the marker properties and components
        this.marker = new THREE.Object3D();
        _scene.add(this.marker);

        // The marker mesh
        this.geometry = _geometry;
        this.material = _material;
        this.mesh;

        // elevation
        this.elevation = 0;
    }

    init(name) {
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.castShadow = true;
        this.marker.add(this.mesh);
        if (name) {
            this.marker.name = name;
        }
    }

    setPosition(pos) {
        // console.log("Marker new pos: ");
        // console.log(pos);
        // IMPORTANT notice that Y is switched with Z
        if (!pos.z) {
            this.mesh.position.set(pos.x, this.elevation, pos.y);
        } else {
            this.mesh.position.set(pos.x, pos.z + this.elevation, pos.y);
        }
    }

    getPositionOnMap() {
        return world.pointToLatLon([this.mesh.position.x, this.mesh.position.z]);
    }
}