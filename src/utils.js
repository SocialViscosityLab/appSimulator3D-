/**
 * Utilities availables as static functions of this class.
 */
class Utils {
    static p5;

    static startTime;

    static mouseX = 0;
    static mouseY = 0;

    static setP5(_p5) {
        Utils.p5 = _p5
    }

    static getHeading = function(x, y, pX, pY) {
        return Utils.p5.atan2(pY - y, pX - x);
    }


    static getX = function(angle, radius) {
        return Utils.p5.cos(angle) * radius;
    }


    static getY = function(angle, radius) {
        return Utils.p5.sin(angle) * radius;
    }

    static polarToCartesian = function(angle, radius) {
        let xComp = this.getX(angle, radius);
        let yComp = this.getY(angle, radius);
        return (new THREE.Vector3(xComp, yComp, 0))
    }

    static getEllapsedTime() {
        return Date.now() - Utils.startTime;
    }

    // This function inverts the order of Lat Lon pairs to Lon Lat or vice-versa. 
    static invertLatLonOrder(route) {
        // array of arrays
        let coords = route.features[0].geometry.coordinates;
        let rtn = [];
        coords.forEach(pair => {
            let tmp = [pair[1], pair[0]];
            rtn.push(tmp);
        });
        route.features[0].geometry.coordinates = rtn;
        return route;
    }
}