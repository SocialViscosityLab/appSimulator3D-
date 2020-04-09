class Fantasma extends Marker {
    constructor(_scene, _geometry, _material) {
        super(_scene, _geometry, _material);
        this.route = [];
    }

    AddRoute(route) {
        this.route = route;
    }

    showRoute() {
        console.log("DEFINE THIS METHOD showRoute()")
    }
}