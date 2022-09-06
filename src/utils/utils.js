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
            return json.features[0];

        } else {
            // Leafet geoJSON
            console.log("NON COMPLIANT geoJSON format");
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

    /**
     * Gives time format hh:mm:ss to numbers
     * @param {float} seconds 
     * @returns a string
     */
    static timeFormater(seconds) {
        let hours = Math.trunc(seconds / 3600);
        let minutes = Math.trunc((seconds % 3600) / 60);
        let secs = (seconds % 3600) % 60;
        if (hours > 0) {
            return hours + ":" + minutes + ":" + secs.toFixed(0);
        } else {
            return minutes + ":" + secs.toFixed(0);
        }
    }

    /**
     * Gives distance format km to numbers
     * @param {float} meters 
     * @returns a string
     */
    static distanceFormater(meters) {
        let kilometers = Math.trunc(meters / 1000);
        let remaining = meters % 1000;
        if (kilometers > 0) {
            return kilometers + "k " + remaining.toFixed(0) + "m";
        } else {
            return remaining.toFixed(0) + "m";
        }
    }

    /**
     * Gives speed in m/s format km/h to numbers
     * @param {float} velocity
     * @returns a string
     */
    static speedFormater(velocity) {
        return velocity * 3.6
    }

    /**
     * Returns a number whose value is limited to the given range.
     *
     * Example: limit the output of this computation to between 0 and 255
     * (x * 255).clamp(0, 255)
     * 
     * see: https://stackoverflow.com/questions/11409895/whats-the-most-elegant-way-to-cap-a-number-to-a-segment
     *
     * @param {Number} min The lower boundary of the output range
     * @param {Number} max The upper boundary of the output range
     * @returns A number in the range [min, max]
     * @type Number
     */
    static clamp(num, min, max) {
        return Math.min(Math.max(num, min), max)
    }

}

Utils.mouseX = 0;
Utils.mouseY = 0;