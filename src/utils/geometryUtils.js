/**
Abstract utility class with Geometry methods
*/
class GeometryUtils {
    constructor() {}

    /**
    Forecasts all the vehicle's datapoints on route from a start to an end point. Each position is estimated based on the given
    speed and sample rate. Since the speed is constant, the acceleration value of each datapoint is 0. The lastTimeStamp parameter
    serves to set the initial datapoints counter. Such counter marks each datapoint with a sequenced value of time in
    the same units as sampleRate.
    @param {Position} startCoords start position on route
    @param {Position} endCoords final position on route
    @param {number} speed constant speed travelling on route
    @param {number} sampleRate rate of data sampling in seconds
    @param {number} lastTimeStamp timeStamp at the begining of the forecasted travel
    */
    static calculateStepsBetweenPositions(startCoords, endCoords, speed, sampleRate, lastTimeStamp) {
        let rtn = [];

        // 0 add the corner point
        let tempDataPoint = new DataPoint(0, startCoords, speed, lastTimeStamp);
        rtn.push(tempDataPoint);

        // 1 calculate the distance between the startCoords and endCoords. The distance is calculated in meters.
        let distAtoB = Utils.getGeodesicDistance(startCoords, endCoords);

        // 2 estimate the duration to get from startCoords to endCoords at the given speed
        let duration = distAtoB / speed;

        // 3 generate as many positions as numbers of samples using as ellapsedTime the agregation of time units
        let count = 1;

        while (duration > sampleRate) {

            let tempPos = this.calculateCurrentPosition(startCoords, endCoords, speed, sampleRate * count);

            let timeStamp = sampleRate * count;

            if (lastTimeStamp != undefined) {

                timeStamp = timeStamp + lastTimeStamp;
            }

            tempDataPoint = new DataPoint(0, tempPos, speed, timeStamp);

            // 4 store the positions in a collection
            rtn.push(tempDataPoint);

            duration -= sampleRate;

            count++;
        }

        return rtn;
    }

    /**
    Calculates the position bewteen two points at a given ellapsed time
    @param {Position} startCoords start position on route
    @param {Position} endCoords final position on route
    @param {number} speed constant speed travelling on route
    @param {number} ellapsedTime rate of data sampling in seconds
    @return {Position} the estimated position bewteen two points at a given ellapsed time
    */
    static calculateCurrentPosition(startCoords, endCoords, speed, ellapsedTime) {

        let distance = Utils.getGeodesicDistance(startCoords, endCoords); //

        let fraction = this.getTrajectoryFraction(ellapsedTime, speed, distance);

        return this.getIntermediatePoint(startCoords, endCoords, fraction);
    }

    /**
    Gets the point between two coordinates at a given fraction of the straight trajectory
    @param {Position} startCoords
    @param {Position} endCoords
    @param {number} fraction A value between 0 and 1
    @return {Position} A point between the two source points
    */
    static getIntermediatePoint(startCoords, endCoords, fraction) {

        let lat1 = startCoords.getLatRad();
        let lon1 = startCoords.getLonRad();
        let lat2 = endCoords.getLatRad();
        let lon2 = endCoords.getLonRad();

        let R = 6371e3; // metres

        let d = Utils.getGeodesicDistance(startCoords, endCoords) / R;

        let a = Math.sin((1 - fraction) * d) / Math.sin(d);

        let b = Math.sin(fraction * d) / Math.sin(d);

        let myX = a * Math.cos(lat1) * Math.cos(lon1) + b * Math.cos(lat2) * Math.cos(lon2);

        let myY = a * Math.cos(lat1) * Math.sin(lon1) + b * Math.cos(lat2) * Math.sin(lon2);

        let myZ = a * Math.sin(lat1) + b * Math.sin(lat2);

        let coords = new Position(Math.atan2(myZ, Math.sqrt(Math.pow(myX, 2) + Math.pow(myY, 2))), Math.atan2(myY, myX));

        coords.convertRadToCoords();

        return coords;
    }

    /**
    Gets the percentage of traveled distance for a given time and speed
    @param {number} ellapsedTime
    @param {number} speed
    @param {number} totalDistance
    @return {number} a value greater than 0. If it is greater than 1 it means that the traveled distance
    is gerater that the distance to be traveled
    */
    static getTrajectoryFraction(ellapsedTime, speed, totalDistance) {

        return (speed * ellapsedTime) / totalDistance;

    }

    // /*
    // Private function to be used by dist2()
    // src: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    // */
    // static sqr(x) {
    //   return x * x
    // }

    /*
    Private function to be used by distToSegmentSquared()
    src: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    */
    static dist2(v, w) {
        return Math.sqrt(v.lon - w.lon) + Math.sqrt(v.lat - w.lat);
    }

    /**
    Private function to be used by euclideanDistToSegment()
    src: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment*/
    static distToSegmentSquared(p, v, w) {

        var l2 = this.dist2(v, w);

        if (l2 == 0) return this.dist2(p, v);

        var t = ((p.lon - v.lon) * (w.lon - v.lon) + (p.lat - v.lat) * (w.lat - v.lat)) / l2;

        t = Math.max(0, Math.min(1, t));

        return this.dist2(p, { lon: v.lon + t * (w.lon - v.lon), lat: v.lat + t * (w.lat - v.lat) });
    }

    /**
    Calculates the euclidean distance of a position to a segment
    src: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    @param {Position} p The position
    @param {Position} v Segment origin
    @param {Position} w Segment end
    @return {number} The closest distance
    */
    static euclideanDistToSegment(p, v, w) {
        return Math.sqrt(this.distToSegmentSquared(p, v, w));
    }

    /**
     * Calculates distance of a position to a segment using vector projection on a plane.
     * WARNING: it is only valid for short distances beacuse it asumes a planar 2D surface instead of a spheric surface
     * Source: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
     * @param {Position} p The position
     * @param {Position} v Segment origin
     * @param {Position} w Segment end
     * @return {number} The closest distance in meters
     */
    static distToSegment(p, v, w) {
        // let's call our point p0 and the points that define the line as p1 and p2.
        let x = p.lon;
        let y = p.lat;
        let startX = v.lon;
        let startY = v.lat;
        let endX = w.lon;
        let endY = w.lat;
        // Then you get the vectors A = p0 - p1 and B = p2 - p1.
        let A = x - startX;
        let B = y - startY;
        let C = endX - startX;
        let D = endY - startY;
        let dot = A * C + B * D;
        let len_sq = C * C + D * D;
        // Param is the scalar value that when multiplied to B gives you the point on the line closest to p0.
        let param = -1;
        //in case of 0 length line
        if (len_sq != 0)
            param = dot / len_sq;
        // XX and YY is then the closest point on the line segment
        let xx, yy;
        // If param <= 0, the closest point is p1.
        if (param < 0) {
            xx = startX;
            yy = startY;
            //If param >= 1, the closest point is p1.
        } else if (param > 1) {
            xx = endX;
            yy = endY;
            //If it's between 0 and 1, it's somewhere between p1 and p2 so we interpolate.
        } else {
            xx = startX + param * C;
            yy = startY + param * D;
        }
        // dx/dy is the vector from p0 to that point,
        let dx = x - xx;
        let dy = y - yy;
        //and finally we return the length that vector
        return Utils.getGeodesicDistance(p, new Position(yy, xx));
    }

    /**
     * Calculates bearing between two points. Source: https://www.movable-type.co.uk/scripts/latlong.html
     * Computations made in polar coordinates
     * @param {Position} startPoint
     * @param {Position} endPoint
     * @return {Number} the bearing in radians
     */
    static getBearing(startPoint, endPoint) {
        let start = startPoint.getLatLonRad();
        let end = endPoint.getLatLonRad();
        // new lat
        let y = Math.sin(end.lon - start.lon) * Math.cos(end.lat);
        // new lon
        let x = Math.cos(start.lat) * Math.sin(end.lat) -
            Math.sin(start.lat) * Math.cos(end.lat) * Math.cos(end.lon - start.lon);
        //
        let brng = Math.atan2(y, x);
        return brng;
    }

    /**
     * Gets the angle between two bearings
     * https://rosettacode.org/wiki/Angle_difference_between_two_bearings
     */
    static relativeBearing(b1Rad, b2Rad) {
        let b1y = Math.cos(b1Rad);
        let b1x = Math.sin(b1Rad);
        let b2y = Math.cos(b2Rad);
        let b2x = Math.sin(b2Rad);
        let crossp = b1y * b2x - b2y * b1x;
        let dotp = b1x * b2x + b1y * b2y;
        if (crossp > 0.)
            return Math.acos(dotp);
        return -Math.acos(dotp);
    }

}