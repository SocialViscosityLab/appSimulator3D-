/** This class mamages all the sounds in the app */
class SoundManager {
    constructor() {
        // for legacy browsers
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.mediaNodes = new Map(); // collection of sound DOM elements. Aready contain the sounds src assigned 
        this.tracks =[];
        this.gainNode = this.context.createGain();
        this.userEnabledSound = false;
    }

    /**
     * Add a track to the collection of media nodes.
     * @param {String} name Key to be used in key:value collection
     * @param {AudioDOMElement} audioElement The DOM element with the <audio>
     * @param {Boolean} loop True if the element should be played ina loop 
     * @param {Boolean} gain True if the sound volume wants to be controlled with this.gainNode 
     */
    addMediaNode(name, audioElement, loop, gain) {
        // activate the loop in the given audioElement
        if (loop) audioElement.loop = loop;
        //
        let track = this.context.createMediaElementSource(audioElement);
        // for volume 
        if (gain) {
            // connect the volume (gain) node in between the track and the output
            track.connect(this.gainNode).connect(this.context.destination);
        } else {
            // connect the track directly to the output
            track.connect(this.context.destination);
        }
        //
        this.tracks.push(track);
        // add media node to the collection of media nodes
        this.mediaNodes.set(name, audioElement);
    }


    enableAudioContext() {
        // check if context is in suspended state (autoplay policy). 
        // Autoplay article: https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
        console.log(this.getState() + '_soundmanager **** IN')
        if (this.getState() === 'suspended') {
            console.log('resuming context')
            this.context.resume().then(rslt => {
                GUI.volume_up.hidden = false;
                console.log(this.getState() + '_soundmanager **** OUT')
            });
        } else if (this.getState() === 'running') {
            this.context.suspend().then(rslt => {
                GUI.volume_up.hidden = true;
                console.log(this.getState() + '_soundmanager **** OUT')
            });
        }

    }

    /**
     * Reproduce a track
     * @param {String} name key of the audio element in the map of mediaNodes
     */
    async play(name) {
        try {
            await this.mediaNodes.get(name).play();
        } catch (error) {
            console.error(error)
        }
    }

    /**
     * Pause a track
     * @param {String} name key of the audio element in the map of mediaNodes
     */
    pause(name) {
        this.mediaNodes.get(name).pause();
    }

    /**
     * Changes the volume (gain) of any track connected to this.gainNode according to the parameters. 
     * It assumes that far away objects are quieter than closer ones. The volume increases as target objects get
     * closer to this object. The increment is a mapping linear function offered by P5.js  
     * @param {Number} proximity How close is the current cyclist to the ghost
     * @param {Number} proxThreshold Minimum distance at which the volume stops increasing any more.  
     */
    volume(proximity, proxThreshold) {
        if (proximity > proxThreshold) proximity = proxThreshold;
        if (proximity < 15) proximity = 15;
        let intensity = Utils.p5.map(proximity, 15, proxThreshold, 1, 0.01) // 1 meter, far away meters, up to 2 intensity, 0.5 intensity
        this.gainNode.gain.value = intensity;
    }

    getState() {
        return this.context.state;
    }

    isContextRunning() {
        return this.context.state === 'running';
    }

    test(more) {
        more === undefined ? more = '' : more = more;
        console.log(this.getState() + '_soundmanager **** ' + more)
    }

}