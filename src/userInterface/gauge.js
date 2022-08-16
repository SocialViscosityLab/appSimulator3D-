/**
 * This class represents kinematic values in the graphic user interface.  
 */
class Gauge {
    constructor() {
        // The length of the display area 
        this.dispLength = window.innerWidth;
        // Midpoint display area length
        this.halfLength = this.dispLength / 2

        // Parameters for vehicle representation
        this.vehMinLength = 2; // pixels
        this.vehMaxLength = this.dispLength / 4;
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
    computeVehicleWidth(spd) {
        if (spd <= 0) spd = 1;
        return Math.abs(spd) * this.vehMaxLength / this.maxSpeed;
    }

    // /**
    //  * setup when app is initiated
    //  * @param {*} vSpeed // vehicle speed in m/s
    //  * @param {*} gSpeed // ghost speed in m/s
    //  */
    // setUpSizes(vSpeed, gSpeed) {
    //     // limits the speed to mapping boundaries
    //     let vSpd = Utils.clamp(vSpeed, this.minSpeed, this.maxSpeed)

    //     // set values to GUI elements
    //     this.cyclistSpeedLength = this.computeVehicleWidth(vSpd);
    //     GUI.vehicle.style.width = this.cyclistSpeedLength + 'px';

    //     this.ghostSpeedLength = this.computeVehicleWidth(gSpeed);
    //     GUI.ghst.style.width = this.ghostSpeedLength + 'px';
    // }

    // /**
    //  * 
    //  * @param {*} dist 
    //  * @returns 
    //  */
    // displayGap(dist) {
    //     // get gap
    //     let pxGap = this.computeGap(dist);
    //     // accomodate gap symmetrically
    //     GUI.gapUX.style.width = pxGap + 'px';
    //     GUI.gapUX.style.marginLeft = this.halfLength - pxGap / 2 + 'px';

    //     if (dist >= 0) {
    //         // vehicle
    //         GUI.vehicle.style.marginLeft = this.halfLength - this.cyclistSpeedLength - pxGap / 2 + 'px';
    //         // ghst
    //         GUI.ghst.style.marginLeft = this.halfLength + pxGap / 2 + 'px';

    //     } else {
    //         // vehicle
    //         GUI.vehicle.style.marginLeft = this.halfLength + pxGap / 2 + 'px';
    //         // ghst
    //         GUI.ghst.style.marginLeft = this.halfLength - this.ghostSpeedLength - pxGap / 2 + 'px';
    //     }

    //     return pxGap + 'px';
    // }

    /**
     * setup when app is initiated
     * @param {*} vSpeed // vehicle speed in m/s
     * @param {*} gSpeed // ghost speed in m/s
     */
    setUpSizes(vSpeed, gSpeed) {
        // limits the speed to mapping boundaries
        let vSpd = Utils.clamp(vSpeed, this.minSpeed, this.maxSpeed)

        // set values to GUI elements
        this.cyclistSpeedLength = this.computeVehicleWidth(vSpd);
        GUI.vehicle.style.height = this.cyclistSpeedLength + 'px';

        this.ghostSpeedLength = this.computeVehicleWidth(gSpeed);
        GUI.ghst.style.height = this.ghostSpeedLength + 'px';
    }

    /**
     * 
     * @param {*} dist 
     * @returns 
     */
    displayGap(dist) {
        // get gap
        let pxGap = this.computeGap(dist);
        // accomodate gap symmetrically
        GUI.gapUX.style.height = pxGap + 'px';
        GUI.gapUX.style.marginTop = this.halfLength - pxGap / 2 + 'px';

        if (dist >= 0) {
            // vehicle
            GUI.vehicle.style.marginTop = this.halfLength - this.cyclistSpeedLength - pxGap / 2 + 'px';
            // ghst
            GUI.ghst.style.marginTop = this.halfLength + pxGap / 2 + 'px';

        } else {
            // vehicle
            GUI.vehicle.style.marginTop = this.halfLength + pxGap / 2 + 'px';
            // ghst
            GUI.ghst.style.marginTop = this.halfLength - this.ghostSpeedLength - pxGap / 2 + 'px';
        }

        return pxGap + 'px';
    }
}