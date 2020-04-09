class RoutePath {
    constructor(_scene, _coords) {
        let points = [];
        this.getPoints(points, _coords);
        this.geometry = new THREE.BufferGeometry(); //.setFromPoints(points);
        // console.log(points)

        // // itemSize = 3 because there are 3 values (components) per vertex
        this.geometry.addAttribute('position', new THREE.Float32Attribute(points, 3));




        //this.geometry.setFromPoints(points);
        this.material = new THREE.LineBasicMaterial({
            color: 0xff0000
        });
        this.line = new THREE.Line(this.geometry, this.material);
        _scene.add(this.line);
    }

    getPoints(_points, _coords) {
        _coords.forEach(pair => {
            // Set lat Lon order
            let point = world.latLonToPoint([pair[1], pair[0]]);
            //point = new THREE.Vector3(point.x, 0, point.y);
            point = [point.x, 0, point.y];
            _points.push(point);
        });
    }
}