/**
 * Utilities availables as static functions of this class.
 */
class KinematicUtils {

    /**
     * Calculates the acceleration given two velocities and the duration of velocity change. Time units must be the same for every parameter. 
     * @param {*} velocityA 
     * @param {*} velocityB 
     * @param {*} deltaTime 
     * @returns 
     */
    static calcAcceleration(velocityA, velocityB, deltaTime) {
        let acc = (velocityA - velocityB) / deltaTime;
        return acc;
    }


    /**
     * This function is made to calculate the time needed to catch up the ghost. It works in two situations: 
     * i) The ghost is behind the vehicle: In that case the vehicle needs to excert a negative acceleration to
     * reduce its velocity. 
     * 
     * ii) The ghost is ahead the vehiche: In that case the vehicle needs to excert a positive acceleration to
     * increase its velocity.
     * 
     * In either case, if the vehicle does not have enough acceleration to reach the ghost's position, it would be 
     * impossible to achieve the goal, thust the result is an error represented as a NaN ( Not a Number).
     * 
     * The solution to this problem is based on two quadratic equations aX^2 + bX + c = 0. One for the ghost and 
     * one for the vehicle. One should be equal to the other at the moment both particles meet. Inspiration from: 
     * https://www.youtube.com/watch?v=ccS2y6_GLpU
     * 
     * @param {*} particle An instance of the class DevicePos
     * @returns an object with two results. time: the ellapsed time to meet the ghost, deltaPos: the distance to the ghost.
     */

    static catchUpTimeToGhost(particle) {

        if (route) {
            let p = {
                    vel: particle.getSpeed(),
                    acc: lpf.next(particle.getAcceleration()), // acceleration is filtered to smooth the signal with a low pass filter.
                    pos: route.getTraveledDistanceToPosition(new Position(particle.getPos().pos.lat, particle.getPos().pos.lon))
                }
                // console.log(p);

            /**These data come from a global variable in start.js */
            let g = {
                    vel: ghostData.speed,
                    acc: ghostData.acceleration,
                    pos: route.getTraveledDistanceToPosition(new Position(ghostData.latitude, ghostData.longitude))
                }
                // console.log(g);

            let deltaVelocity = g.vel - p.vel;
            //console.log(" delta vel: " + deltaVelocity);

            let deltaHalfAcc = (g.acc / 2) - (p.acc / 2);
            //console.log(" delta acc: " + deltaHalfAcc);

            let deltaPos = g.pos - p.pos;
            //console.log("delta pos: " + deltaPos);

            let preSqrt = Math.pow(deltaVelocity, 2) - (4 * (deltaHalfAcc) * deltaPos);

            //console.log('pre sqrt: ' + preSqrt);

            let timeA = (-deltaVelocity + Math.sqrt(preSqrt)) / (2 * deltaHalfAcc);
            let timeB = (-deltaVelocity - Math.sqrt(preSqrt)) / (2 * deltaHalfAcc);

            let rtn = { timeA: timeA, timeB: timeB, deltaPos: deltaPos };

            //console.log(rtn);

            return rtn;
        } else {
            window.alert("No route yet. Connect to database");
            return undefined
        }
    }
}