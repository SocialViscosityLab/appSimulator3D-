/**
 * This class represents kinematic values in the graphic user interface.  
 */
class Gauge {
    constructor() {
        // The length of the display area 
        this.dispLength = window.innerWidth;

        // Midpoint display area length
        // this.halfLength = this.dispLength / 2

        // Parameters for vehicle representation
        this.vehMinLength = 2; // pixels
        this.vehMaxLength = 100; // %
        this.minSpeed = 0;
        this.maxSpeed = 13.89; // in m/s, equivalent to 50 km/h. Cyclist's velocity cap at this value
        this.cyclistSpeedLength = 1; // current visual length
        this.ghostSpeedLength = 1; // current visual length

        // Parameters for inter-vehicle gap representation
        this.gapMinLength = 2; // pixels
        this.gapMaxLength = this.dispLength / 2;
        this.minGap = 0;
        this.maxGap = 500; // in m. Distance to the ghst caps at this value
    }

    /**
     * Estimates the number of pixels in the gap for a given distance 
     */
    computeGap(dist) {
        let gap = Math.abs(dist);
        let rtn = Math.log(gap) / Math.log(this.maxGap); // Using logarithmics provide a natural way to scale speed or proximity representations
        return rtn * this.gapMaxLength;
    }

    /**
     * Estimates the number of pixels in the vehicle for a given distance 
     */
    computeLength(spd) {
        if (spd <= 0) spd = 0;
        return (Math.abs(spd) / this.maxSpeed) * this.vehMaxLength;
    }

    /**
     * setup when app is initiated
     * @param {*} vSpeed // vehicle speed in m/s
     * @param {*} gSpeed // ghost speed in m/s
     */
    setUpSizes(vSpeed, gSpeed) {
        // limits the speed to mapping boundaries
        let vSpd = Utils.clamp(vSpeed, this.minSpeed, this.maxSpeed)

        // set values to GUI elements
        this.cyclistSpeedLength = this.computeLength(vSpd);
        GUI.vehicleBox.style.height = this.cyclistSpeedLength + '%';

        this.ghostSpeedLength = this.computeLength(gSpeed);
        GUI.ghostBox.style.height = this.ghostSpeedLength + '%';
    }
}