class Communication {
    constructor(user_id) {
        this.user_id = user_id;
        this.journeyId = 0;
        this.reference_route;
        this.sessionId = 0;
        this.identified = false;
        //this.getLastJourneyId();

        this.journeys = db.collection('journeys');
        this.routes = db.collection('routes');
    }

    /** NEW
     * Get the latest Journey on Firebase
     * @return {Promise} A promise. It can be unpacked once resolved checking the collection of docs
     */
    async getLastJourney() {
        const journey = await this.journeys.orderBy("id", "desc").limit(1).get();
        return journey;
    }

    /** NEW
     * Get the name of the journey ID
     * @param {String} journeyID 
     * @return {String} The name of the route
     */
    async getReferenceRouteName(journeyID) {
        const journey = await this.journeys.where("id", "==", journeyID).get();
        let routeName = journey.docs[0].data().reference_route.id;
        return routeName;
    }

    /** NEW
     * @param {*} journeyID 
     * @return {Promise} A promise. It can be unpacked once resolved checking the collection of docs
     */
    async getLastSessionInJourney(journeyID) {
        const sessions = await this.journeys.doc(journeyID).collection('sessions').orderBy("index", "desc").limit(1).get();
        return sessions;
    }

    /** NEW
     * Creates a reference of the session in the database
     */
    addSession(journeyId, sessionId) {
        let time = new Date();
        let startTime = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " - " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
        let metaData = {
            id_user: this.user_id,
            index: sessionId,
            isSimulated: false,
            start_time: startTime
        };
        this.journeys.doc(journeyId).collection('sessions').doc(sessionId).set(metaData);
        console.log("Session " + sessionId + " started at: " + metaData.start_time);
    }

    /** NEW 
     * Iniitializes a session on the database inside the latest journey
     */
    async initSession() {
        // get latest journey
        let tmp = await this.getLastJourney();
        const journeyId = tmp.docs[0].id;
        console.log("journeyId: " + journeyId);

        //get reference route
        const refRouteName = await this.getReferenceRouteName(journeyId);
        console.log("Route name: " + refRouteName);

        // get latest session in journey
        tmp = await this.getLastSessionInJourney(journeyId);
        let sessionId = tmp.docs[0].id;
        console.log("Last session in journey: " + sessionId);

        // Increment session ID by 1
        sessionId = this.formatID(Number(sessionId) + 1);
        console.log("Current session id: " + sessionId);

        // Add new session
        this.addSession(journeyId, sessionId);
        return { journeyId: journeyId, sessionId: sessionId, refRouteName: refRouteName }
    }

    /** NEW
     * Initializes the route retrieved from the database
     * @param {String} refRouteName The route name 
     */
    async initRoute(refRouteName) {
        let routePoints = await this.getRoutePoints(refRouteName);

        // Initialize a route
        route = new Route(refRouteName);

        await route.initiateRouteFromGeoJSON(routePoints.features[0]);

        routePoints = Utils.reformatJSON(routePoints);

        // Switch Lat Lon order
        routePoints = Utils.invertLatLonOrder(routePoints);

        // Initialize layer with route
        Layers.initRoute(routePoints);
    }

    /** ?
     * Consult the journey's id on the database and generate the next 
     * one in the sequence
     * @deprecated
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
                        if (doc.data().reference_route) {
                            // get reference route ID
                            this.reference_route = doc.data().reference_route.id;
                        }
                    }
                }
            });

            // get journey ID
            this.journeyId = this.formatID(jId);
            console.log("The journey ID is:");
            console.log(this.journeyId);
            console.log("Reference route");
            console.log(this.reference_route);

            // Listen to ghost
            this.listenToGhost(this.journeyId);

            // get session in journey
            return db.collection('journeys').doc(this.journeyId).collection('sessions').get()
        }).then(snapshot => {
            let sId = 0;

            // for each document in session
            snapshot.forEach(doc => {
                let temp_sID = parseInt(doc.id);

                // get the latest doc id
                if (temp_sID != null) {
                    if (temp_sID > sId) {
                        sId = temp_sID;
                    }
                }
            });

            // store sessionID in instance of Comm 
            this.sessionId = this.formatID(sId + 1);

            // Create a reference to the new sessionID retrieved
            this.addThisSession()
        })
        return journeys;
    }


    /** ?
     * Takes the id of a route and gets the corner
     * point of it from the data base
     * @deprecated
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

    /** NEW
     * Gets the route points from the database
     * @param {String} routeName
     * @return {Object} The collection of points in JSON format
     */
    async getRoutePoints(routeName) {
        const route = await this.routes.doc(routeName).collection("position_points").get()
        const position_points = [];
        for (const doc of route.docs) {
            position_points.push([doc.data().latitude, doc.data().longitude]);
        }
        return {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "properties": { "name": routeName },
                "geometry": {
                    "type": "LineString",
                    "coordinates": position_points
                }
            }]
        }
    }

    /** REVISED
     * Listen to a specific journey and returns any session that 
     * presents a change in it
     * @param {String} journeyId 
     * @return {Promise}
     */
    async listenToGhost(journeyId) {
        var sessions = await this.journeys.doc(journeyId).collection("sessions").doc("00000").collection("data_points").orderBy("time", "desc").limit(1)
            .onSnapshot(function(snapshot) {
                snapshot.docChanges().forEach(function(change) {
                    if (change.type === "added") {
                        const ghostCurrentPosition = change.doc.data();
                        // global variable
                        ghostCoords = { lat: ghostCurrentPosition.latitude, lon: ghostCurrentPosition.longitude }
                    }
                })
            });
        return sessions;
    }

    /** ?
     * Creates a reference of the session in the database
     * @deprecated
     */
    addThisSession() {
        let time = new Date();

        let startTime = time.getFullYear() + "/" + (time.getMonth() + 1) + "/" + time.getDate() + " - " + time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
        let metaData = {
            id_user: this.user_id,
            start_time: startTime
        };
        db.collection('journeys').doc(this.journeyId).collection('sessions').doc(this.sessionId).set(metaData);
        // console.log("metaData added");
        console.log("Session " + this.sessionId + " started at: " + metaData.start_time);
        this.identified = true;
    }

    /** REVISED
     * Adds a new datapoint document with a specific id in a sepecific session from a specific journey
     * @param {String} journeyId
     * @param {String}  sessionId
     * @param {Integer} dpId 
     * @param {JSON} dataPointDoc 
     */
    addNewDataPointInSession(journeyId, sessionId, dpId, dataPointDoc) {
        let dataPointId = this.formatID(dpId);
        //db.collection('journeys').doc(journeyId).collection('sessions').doc(sessionId).update({ current_position: dataPointDoc });
        this.journeys.doc(journeyId).collection('sessions').doc(sessionId).collection("data_points").doc(dataPointId).set(dataPointDoc);
    }

    /** REVISED
     * Format a number with the id format used on the database
     * @param {Integer} id 
     */
    formatID(id) {
        let zeros = "00000";
        return (zeros + id).slice(-zeros.length);
    }
}