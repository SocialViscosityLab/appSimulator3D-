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
        return (Date.now() - Utils.startTime);
    }

    static getEllapsedTimeSeconds() {
        let tmp = (Date.now() - Utils.startTime) / 1000;
        return Math.trunc(tmp);
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

    /** Gets the geodesic distance between two points
     * @param {Position} startCoords
     * @param {Position} endCoords
     * @return {number} The distance between the two points in meters
     * */

    static getDistance(startCoords, endCoords) {
        //Distance code taken from: https://www.movable-type.co.uk/scripts/latlong.html

        let lat1 = startCoords.lat;
        let lon1 = startCoords.lon;
        let lat2 = endCoords.lat;
        let lon2 = endCoords.lon;

        const R = 6371e3; // meters

        //Converting latitud and longitude to radians
        //let fi1 = Math.sin((lat1 * Math.PI) / 180);
        //let fi2 = Math.sin((lat2 * Math.PI) / 180);

        let fi1 = (lat1 * Math.PI) / 180;
        let fi2 = (lat2 * Math.PI) / 180;

        let deltaFi = Math.sin((lat2 - lat1) * Math.PI / 180);
        let deltaLambda = Math.sin((lon2 - lon1) * Math.PI / 180);

        let a = Math.sin(deltaFi / 2) * Math.sin(deltaFi / 2) + Math.cos(fi1) * Math.cos(fi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        let d = R * c;

        return Number.parseFloat(d);
    }
}
Utils.mouseX = 0;
Utils.mouseY = 0;