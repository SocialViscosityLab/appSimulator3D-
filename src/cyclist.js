class Cyclist extends Marker {
    constructor(_id, _scene, _geometry, _material) {
        super(_scene, _geometry, _material);
        this.id = _id;
        this.vField;
    }
}