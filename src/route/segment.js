/**
* Utility class used to make distance operations on a route
@param {Position} start The beginig of the segment
@param {Position} end The end of the segment
*/
class Segment {
    constructor(startPosition, endPosition) {
        this.start = startPosition;
        this.end = endPosition;
        this.length = GeometryUtils.getGeodesicDistance(this.start, this.end).toPrecision(4);
        this.bearing = GeometryUtils.getBearing(this.start, this.end); // in radians (bteween -pi and pi)
    }

    /**
    * Gets the point at a fraction of the distance between two points
    @param {Number} fraction A number between 0 and 1
    @return {Position} The position between the start and end of this segment
    */
    getIntermediatePoint(fraction) {
        if (0 <= fraction && fraction <= 1) {
            return GeometryUtils.getIntermediatePoint(this.start, this.end, fraction);
        }
    }


    /**
    * Gets the point based on a distance from the start point of a segment
    @param {Number} distance Distance in meters
    @return {Position} The position between the start and end of this segment
    */
    getIntermediatePointFromDistance(distance) {
        // estimate the fraction
        let fraction = distance / this.length;

        if (fraction <= 1) {
            return this.getIntermediatePoint(fraction);

        } else {

            console.log("The distance given " + distance + " is larger than this segment " + this.length + ". Undefined returned");

            return undefined;
        }
    }

    /**
    Returns the distance from the segment start to the position. It assumes that the vehicle is subscribed to to route
    @param {Position} position The position between the start and end of this segment
    @return {Number} distance Distance in meters
    */
    getDistanceOnSegment(position) {
        return GeometryUtils.getGeodesicDistance(this.start, position);
    }

    /**
    * Determines if the bearing of a vector defined by two positions is aligned with the bearing of the current segment.
      It is useful to know if the cyclist rides aligned to the segment direction
    * @param {Position} startPos
    * @param {Position} endPos
    * @param {Number} range In radians. Half the range of elignment evaluation. Could be omited. It should not be greater than PI/2.
    * By default it is PI/2, meaning that the range of evaluation if the segment bearing +/- 90 degrees.
    */
    isBearingAligned(startPos, endPos, range) {
        let range2 = Math.PI / 2;
        // replace with new range
        if (range != undefined && range < Math.PI / 2) {
            range2 = range;
        }
        // get bearing of two points
        let tmpBearing = GeometryUtils.getBearing(startPos, endPos);
        // get angle between bearings
        let angleBetweenBearings = GeometryUtils.relativeBearing(this.bearing, tmpBearing);
        //console.log(angleBetweenBearings + " "+ range2);
        if (Math.abs(angleBetweenBearings) <= range2) {
            return true;
        } else {
            return false;
        }
    }
}