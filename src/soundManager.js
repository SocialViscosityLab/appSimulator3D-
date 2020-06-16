/** This class mamages all the sounds in the app */
class SoundManager {
    constructor() {
        // for legacy browsers
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.mediaNodes = new Map(); // collection of sound DOM elements. Aready contain the sounds src assigned 
        this.track;
        this.gainNode = this.audioContext.createGain();
    }

    addMediaNode(name, audioElement, loop, gain) {
        if (loop) audioElement.loop = loop;
        this.track = this.audioContext.createMediaElementSource(audioElement);
        if (gain) {
            this.track.connect(this.gainNode).connect(this.audioContext.destination);
        } else {
            this.track.connect(this.audioContext.destination);
        }

        this.mediaNodes.set(name, audioElement);
    }

    enableAudioContext() {
        // check if context is in suspended state (autoplay policy). 
        // Autoplay article: https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
            console.log("Sound enabled")
        }
    }

    play(name) {
        if (this.audioContext.state === 'suspended') {
            alert("Sound not enabled yet in this window");
        }
        this.mediaNodes.get(name).play();
    }

    pause(name) {
        if (this.audioContext.state === 'suspended') {
            alert("Sound not enabled yet in this window");
        }
        this.mediaNodes.get(name).pause();
    }

    volume(proximity, proxThreshold) {
        if (proximity > proxThreshold) proximity = proxThreshold;
        if (proximity < 15) proximity = 15;
        let intensity = Utils.p5.map(proximity, 15, proxThreshold, 2, 0.01) // 1 meter, far away meters, 2 intensity, 0.5 intensity
        this.gainNode.gain.value = intensity;
    }

}