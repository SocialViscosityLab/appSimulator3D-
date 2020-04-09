class Communication {
    constructor(user_id) {
        this.user_id = user_id;
        this.journeyId = 0;
        this.sessionId = 0;
        this.identified = false;
        this.getLastJourneyId();

    }

    /**
     * Consult the journey's id on the database and generate the next 
     * one in the sequence
     */
    getLastJourneyId() {
        console.log("Getting Journey Id");
        let jId = 0;
        var journeys = db.collection('journeys').get().then(snapshot => {
            snapshot.forEach(doc => {
                let id = parseInt(doc.id);
                if (id !== null) {
                    if (id > jId) {
                        jId = id;
                    }
                }
            });
            this.journeyId = this.formatID(jId);
            console.log("The journey ID is: " + this.journeyId);
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
            console.log("The session ID is: " + this.sessionId);
            this.addThisSession()
                //return Promise.all(sessions_promises)

        })
        return journeys;
    }

    /**
     * Listen to a specific journey and returns any session that 
     * presents a change in it
     * @param {String} journeyId 
     */
    listenToGhost(journeyId) {
        var sessions = db.collection("journeys").doc(journeyId).collection("sessions").doc("00000").onSnapshot(
            function(doc) {
                let ghostCurrentPosition = doc.data().current_ghost_position;
                ghostCoords = { lat: ghostCurrentPosition.latitude, lon: ghostCurrentPosition.longitude }
                    // console.log("Ghost coords lat/lon: " + ghostCoords.lat + "," + ghostCoords.lon);
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
        //console.log("metaData added");
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



    /**
     * Returns the json object from a specific session 
     * on a specific journey
     * @param {String} id_journey 
     * @param {String} id_session 
     * @returns {Promise,JSON} Session_json
     */
    getSession(id_journey, id_session) {
        let session_json
        let doc_ref = db.collection('journeys').doc(id_journey).collection('sessions').doc(id_session);

        return doc_ref.get().then(doc => {
            let session_data = doc.data()
            let user_id = session_data.id_user
            let start_time = session_data.start_time
            let dp_array = session_data.data_points

            session_json = {
                'user_id': user_id,
                'start_time': start_time,
                'data_points': dp_array
            }
            return session_json
        });
    }


    /**
     * Returns the json object from the ghost's session 
     * on a specific journey
     * @param {String} id_journey 
     * @returns {Promise,JSON} Session_json
     */
    getGhostSession(id_journey) {
        let session_json
        let data_points_array = {}
        let doc_ref = db.collection('journeys').doc(id_journey).collection('sessions').doc('00000');

        return doc_ref.get().then(doc => {
                let session_data = doc.data()
                let user_id = session_data.id_user
                let start_time = session_data.start_time
                let dp_array = session_data.data_points

                session_json = {
                    'user_id': user_id,
                    'start_time': start_time,
                    'data_points': dp_array
                }
                return doc_ref.collection('data_points').get()
            })
            .then(snapshot => {
                snapshot.forEach(dp => {
                    data_points_array[dp.id] = {
                        'acceleration': dp.data().acceleration,
                        'latitude': dp.data().latitude,
                        'longitude': dp.data().longitude,
                        'speed': dp.data().speed,
                        'suggestion': dp.data().suggestion,
                        'time': dp.data().time
                    }
                })
                session_json.data_points = data_points_array
                return session_json
            });
    }


    /**
     * Looks for all the information of a specific journey
     * and return an object with all its information
     * @returns {Promise,Object} journey
     */
    getJourney(journeyId) {
        let journey
        let routeRef
        let sessions = []
        let journeyRef = db.collection('journeys').doc(journeyId)

        return journeyRef.get().then(doc => {
                return doc.data().reference_route.collection('position_points').get()
            })
            .then(snapshot => {
                let position_points = []
                snapshot.forEach(doc => {
                    let coord = doc.data()
                    position_points.push({ lat: coord.latitude, lon: coord.longitude })
                });
                journey = { ref_route: position_points, sessions: [] }
                return journeyRef.collection('sessions').get()
            })
            .then(snapshot => {
                let sessions_promises = []
                snapshot.forEach(doc => {
                    let temp_sID = doc.id
                    if (temp_sID != '00000') {
                        sessions_promises.push(
                            this.getSession(journeyId, temp_sID)
                        )
                    } else {
                        sessions_promises.push(
                            this.getGhostSession(journeyId)
                        )
                    }
                });
                return Promise.all(sessions_promises)
            })
            .then(sessions_docs => {
                journey.sessions = sessions_docs
                return journey
            });
    }








    /**
     * Looks for the last session on the data base and returns it in form of a json
     * @returns {Promise,JSON} Session_json
     */
    getLastSession() {
        let jId = 0;
        let journeyId = '00000'
        let sessionId = '00000'

        return db.collection('journeys').get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    let id = parseInt(doc.id);
                    if (id !== null) {
                        if (id > jId) {
                            jId = id;
                        }
                    }
                });
                journeyId = this.formatID(jId)
                    //console.log('Last journey found: '+journeyId)
                return db.collection('journeys').doc(journeyId).collection('sessions').get();
            })
            .then(snapshot => {
                let sId = 0;
                snapshot.forEach(doc => {
                    let id_s = parseInt(doc.id);
                    if (id_s !== null) {
                        if (id_s > sId) {
                            sId = id_s;
                        }
                    }
                });
                sessionId = this.formatID(sId)
                    //console.log('Last session found: '+sessionId)
                let doc_ref = db.collection('journeys').doc(journeyId).collection('sessions').doc(sessionId);
                return doc_ref.get()
            })
            .then(doc => {
                let session_json
                let session_data = doc.data()
                    //console.log(session_data)
                let user_id = session_data.id_user
                let start_time = session_data.start_time
                let dp_array = session_data.data_points

                session_json = {
                    'user_id': user_id,
                    'start_time': start_time,
                    'data_points': dp_array
                }
                return session_json
            });
    }
}