/**
 * Utilities availables as static functions of this class.
 */
class Utils {
    // static p5;

    // static startTime;

    static setP5(_p5) {
        Utils.p5 = _p5
    }

    static getHeading(x, y, pX, pY) {
        return Utils.p5.atan2(pY - y, pX - x);
    }


    static getX(angle, radius) {
        return Utils.p5.cos(angle) * radius;
    }


    static getY(angle, radius) {
        return Utils.p5.sin(angle) * radius;
    }

    static polarToCartesian(angle, radius) {
        let xComp = this.getX(angle, radius);
        let yComp = this.getY(angle, radius);
        return (new THREE.Vector3(xComp, yComp, 0))
    }

    static getEllapsedTime() {
        return (Date.now() - Utils.startTime) / 1000;
    }

    static reformatJSON(json) {

        // Strict geoJSON. see https://tools.ietf.org/html/rfc7946

        if (json.features) {
            // console.log(json.features[0]);

            return json.features[0];

        } else {
            // Leafet geoJSON
            console.log("NON STRICT geoJSON format");
            return json;
        }
    }

    // This function inverts the order of Lat Lon pairs to Lon Lat or vice-versa. 
    static invertLatLonOrder(route) {

        // array of arrays
        let coords = route.geometry.coordinates;
        let rtn = [];
        coords.forEach(pair => {
            let tmp = [pair[1], pair[0]];
            rtn.push(tmp);
        });
        route.geometry.coordinates = rtn;

        return route;

    }
}
Utils.mouseX = 0;
Utils.mouseY = 0;