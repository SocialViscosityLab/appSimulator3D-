class Communication {
    constructor(user_id) {
        this.user_id = user_id;
        this.journeyId = 0;
        this.reference_route;
        this.sessionId = 0;
        this.identified = false;
        //this.getLastJourneyId();

    }

    /**
     * Consult the journey's id on the database and generate the next 
     * one in the sequence
     */
    getLastJourneyId() {
            // console.log("Getting Journey Id");
            let jId = 0;
            let ref_route = ''
            var journeys = db.collection('journeys').get().then(snapshot => {
                snapshot.forEach(doc => {
                    let id = parseInt(doc.id);
                    if (id !== null) {
                        if (id > jId) {
                            jId = id;
                            this.reference_route = doc.data().reference_route.id;
                        }
                    }
                });
                this.journeyId = this.formatID(jId);
                // console.log("The journey ID is:");
                // console.log(this.journeyId);
                // console.log("Reference route")
                // console.log(this.reference_route)

                this.listenToGhost(this.journeyId);
                return db.collection('journeys').doc(this.journeyId).collection('sessions').get()
            }).then(snapshot => {
                let sId = 0;
                snapshot.forEach(doc => {
                    let temp_sID = parseInt(doc.id);
                    if (temp_sID != null) {
                        if (temp_sID > sId) {
                            sId = temp_sID;
                        }
                    }
                });
                this.sessionId = this.formatID(sId + 1);
                this.addThisSession()
            })
            return journeys;
        }
        /**
         * Takes the id of a route and gets the corner
         * point of it from the data base
         * @param {SimpleMap} sMap  
         */
    getRoute() {
        let position_points = []
        let route = db.collection("routes").doc(this.reference_route).collection("position_points").get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    //position_points.push(sMap.lonLatToXY({ lat: doc.data().latitude, lon: doc.data().longitude}, "asPVector"))
                    position_points.push([doc.data().latitude, doc.data().longitude])
                });

                return {
                    "type": "FeatureCollection",
                    "features": [{
                        "type": "Feature",
                        "properties": { "name": this.reference_route },
                        "geometry": {
                            "type": "LineString",
                            "coordinates": position_points
                        }
                    }]
                }
            });
        return route;
    }

    /**
     * Listen to a specific journey and returns any session that 
     * presents a change in it
     * @param {String} journeyId 
     */
    listenToGhost(journeyId) {
        var sessions = db.collection("journeys").doc(journeyId).collection("sessions").doc("00000")
            .onSnapshot(function(doc) {
                let ghostCurrentPosition = doc.data().current_ghost_position;
                ghostCoords = { lat: ghostCurrentPosition.latitude, lon: ghostCurrentPosition.longitude }
                return ghostCurrentPosition;
            })
        return sessions;
    }

    /**
     * Creates a reference of the session in the database
     */
    addThisSession() {
        let time = new Date();
        let startTime = time.getFullYear() + "/" + time.getMonth() + "/" + time.getDate() + " - " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
        let metaData = {
            id_user: this.user_id,
            start_time: startTime
        };
        db.collection('journeys').doc(this.journeyId).collection('sessions').doc(this.sessionId).set(metaData);
        // console.log("metaData added");
        this.identified = true;
    }

    /**
     * Adds a new datapoint document with a specific id in a sepecific session from a specific journey
     * @param {Integer} dpId 
     * @param {JSON} dataPointDoc 
     */
    addNewDataPointInSession(dpId, dataPointDoc) {
            if (this.identified) {
                let dataPointId = this.formatID(dpId);
                db.collection('journeys').doc(this.journeyId).collection('sessions').doc(this.sessionId).update({ current_position: dataPointDoc });
                db.collection('journeys').doc(this.journeyId).collection('sessions').doc(this.sessionId).collection("data_points").doc(dataPointId).set(dataPointDoc);
            }
        }
        /**
         * Format a number with the id format used on the database
         * @param {Integer} id 
         */
    formatID(id) {
        let zeros = "00000";
        return (zeros + id).slice(-zeros.length)
    }
}