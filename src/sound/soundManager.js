/** This class mamages all the sounds in the app */
class SoundManager {
    constructor() {
        // for legacy browsers
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.mediaNodes = new Map(); // collection of sound DOM elements. Aready contain the sounds src assigned 
        this.tracks = [];
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

        if (this.getState() === 'suspended') {
            this.context.resume().then(rslt => {

                this.play('ding');
                this.play('riding');
                sonar.exec(1, 50);
            });
        } else if (this.getState() === 'running') {
            this.context.suspend();
        }

        // activate this only after the first time the user enables the sound
        GUI.volume_up.hidden = this.isContextRunning();

        GUI.switchStatus(GUI.enableSound, this.isContextRunning(), { t: "Play sound", f: "Mute" }, { t: "btn btn-success btn-lg btn-block", f: "btn btn-warning btn-lg btn-block" })
        this.userEnabledSound = true;
    }

    /**
    * Reproduce a track
    * @param {String} name key of the audio element in the map of mediaNodes
    */
    async play(name) {
        await this.mediaNodes.get(name).play().catch((error) => { console.error("Audio play failed due to ", error); GUI.showError("Audio play failed blue "); });
    }

    /**
     * Pause a track
     * @param {String} name key of the audio element in the map of mediaNodes
     */
    pause(name) {
        this.mediaNodes.get(name).pause();
    }

    /**
    * Clear the sound buffer of an HTMLMediaElement
    * @param name The audio element to clear
    */
    clearSoundBuffer(name) {
        this.mediaNodes.get(name).pause();
        this.mediaNodes.get(name).currentTime = 0;
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