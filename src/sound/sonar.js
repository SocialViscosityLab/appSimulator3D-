/**
 * After trying Steve Reich's approach I went back to simple beeps
 */
class Sonar {

    constructor(tempo) {
        // for legacy browsers
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();

        // initialize beet
        this.beet = new Beet({
            context: this.context,
            tempo: tempo // in bmp
        });

        this.soundEnabled = false;

        // Volume pattern A
        this.gainNodeA = this.context.createGain();

        // Volume pattern B
        this.gainNodeB = this.context.createGain();

        // Volume pattern C
        this.gainNodeC = this.context.createGain();

        // Pattern shift
        // this.currentNoteShift = 1;

        // create a euclidean pattern
        this.patternA = this.beet.pattern(this.getRhythm('down'));

        // create a beet layer - pass it the pattern and a callback
        this.layerA = this.beet.layer(this.patternA, this.kick.bind(this));

        // create a euclidean pattern 
        this.patternB = this.beet.pattern(this.getRhythm('kick'));

        // create a beet layer - pass it the pattern and a callback
        this.layerB = this.beet.layer(this.patternB, this.snare.bind(this));

        // // create a euclidean pattern 
        this.patternC = this.beet.pattern(this.getRhythm('hold'));

        // // create a beet layer - pass it the pattern and a callback
        this.layerC = this.beet.layer(this.patternC, this.key.bind(this));

        // add the layers
        // this.beet.add(this.layerAClap);
        this.beet.add(this.layerA); // snore
        this.beet.add(this.layerB); // kick
        this.beet.add(this.layerC); // key

        this.exec('mute', 0);
    }

    /**
     * 
     * @param {Integer} condition -1: slow down, 1:speed up or 0: hold.
     * @param {*} distance 
     */
    exec(condition, distance) {
        //Prevents the beet library to activate the AudioContext.
        if (this.context.state !== 'suspended') {
            // Playing layers based on condition
            switch (condition) {
                case -1: // ghost behind, slow down 
                    //   console.log("ghost behind, slow down");
                    // if (!this.beet.layers[0].metro._is_running) this.beet.layers[0].pause(); // snore
                    this.beet.layers[0].pause(); // snore
                    this.beet.layers[1].pause(); // kick
                    this.beet.layers[2].pause(); // key
                    break;

                case 0: // 
                    //   console.log("sweet spot, hold on");
                    this.beet.layers[0].pause(); // snore
                    this.beet.layers[1].pause(); // kick
                    // if (!this.beet.layers[2].metro._is_running) this.beet.layers[2].start(); // key
                    this.beet.layers[2].pause();
                    break;

                case 1: // ghost ahead, speed up
                    //   console.log("ghost ahead, speed up");
                    this.beet.layers[0].pause(); // snore
                    if (!this.beet.layers[1].metro._is_running) this.beet.layers[1].start(); // kick
                    this.beet.layers[2].pause(); // key
                    break;
                case 'mute':
                    this.beet.layers[0].pause(); // snore
                    this.beet.layers[1].pause(); // kick
                    this.beet.layers[2].pause(); // key
                    break;
            }

            // adjusting sound gain
            // this changes the sound volume (gain) feedback beyond the greenWave zone 
            if (distance < crowdProximity) {
                this.setVolumePatternA(Math.abs(distance), crowdProximity);
            }

            this.setTempoByProximity(distance, 100, 270)
        }

    }

    enableAudioContext() {
        // check if context is in suspended state (autoplay policy). 
        // Autoplay article: https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
        console.log(this.context.state + "_sonar **** IN")
        if (this.context.state === 'suspended') {//&& onRoute
            this.soundEnabled = true;
            this.context.resume().then(rslt => {
                // this.beet.start();
                // this.exec(1, 0);
                // GUI.volume_up.hidden = false;
                // console.log("Sound enabled - Sonar");
                console.log(this.context.state + "_sonar **** OUT")
            });
        } else if (this.context.state === 'running') {
            this.soundEnabled = false;
            this.context.suspend().then(rslt => {
                // this.beet.stop();
                // GUI.volume_up.hidden = true;
                // console.log("Sound disabled - Sonar")
                console.log(this.context.state + "_sonar **** OUT")
            });
        }
    }


    /**
     *  see: https://dev.opera.com/articles/drum-sounds-webaudio/
     * @param {} time 
     * @param {*} step 
     */
    kick(time, step) {
        //noise

        this.noise = this.context.createBufferSource();
        this.noise.buffer = this.noiseBuffer();
        var noiseFilter = this.context.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;
        this.noise.connect(noiseFilter);

        this.noiseEnvelope = this.context.createGain();
        noiseFilter.connect(this.noiseEnvelope);
        this.noiseEnvelope.connect(this.context.destination);

        var osc = this.context.createOscillator();
        osc.type = 'triangle';
        osc.connect(this.gainNodeA).connect(this.context.destination);

        this.noiseEnvelope.gain.setValueAtTime(1, time);
        this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        this.noise.start(time)

        osc.frequency.setValueAtTime(500, time);
        this.gainNodeA.gain.setValueAtTime(1, time);
        this.gainNodeA.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc.start(time);
        osc.stop(time + 0.2);
    }

    /**
     * Reproduces the pattern of player B using an Oscillator. see: https://dev.opera.com/articles/drum-sounds-webaudio/
     * @param {} time 
     * @param {*} step 
     */
    snare(time, step) {
        //noise

        this.noise = this.context.createBufferSource();
        this.noise.buffer = this.noiseBuffer();
        var noiseFilter = this.context.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000; //1000
        this.noise.connect(noiseFilter);

        this.noiseEnvelope = this.context.createGain();
        noiseFilter.connect(this.noiseEnvelope);
        this.noiseEnvelope.connect(this.context.destination);

        var osc = this.context.createOscillator();
        osc.type = 'triangle';
        osc.connect(this.gainNodeB).connect(this.context.destination);

        this.noiseEnvelope.gain.setValueAtTime(1, time);
        this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        this.noise.start(time)

        osc.frequency.setValueAtTime(100, time);
        this.gainNodeB.gain.setValueAtTime(1, time);
        this.gainNodeB.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc.start(time);
        osc.stop(time + 0.2);
    }

    /**
     * see: https://dev.opera.com/articles/drum-sounds-webaudio/
     * @returns 
     */
    noiseBuffer = function () {
        var bufferSize = this.context.sampleRate;
        var buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        var output = buffer.getChannelData(0);

        for (var i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        return buffer;
    };


    /**
     * Reproduces the pattern of player B using an Oscillator
     * @param {} time 
     * @param {*} step 
     */
    key(time, step) {

        this.noise = this.context.createBufferSource();
        this.noise.buffer = this.noiseBuffer();
        var noiseFilter = this.context.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000; //1000
        this.noise.connect(noiseFilter);

        this.noiseEnvelope = this.context.createGain();
        noiseFilter.connect(this.noiseEnvelope);
        this.noiseEnvelope.connect(this.context.destination);

        var osc = this.context.createOscillator();
        osc.type = 'triangle';
        osc.connect(this.gainNodeC).connect(this.context.destination);


        // var osc = this.context.createOscillator();
        // osc.connect(this.gainNodeC).connect(this.context.destination);
        let note = this.beet.utils.ntof('G3');

        this.noiseEnvelope.gain.setValueAtTime(1, time);
        this.noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        this.noise.start(time)

        osc.frequency.setValueAtTime(note, time)
        this.gainNodeC.gain.setValueAtTime(0.3, time);
        this.gainNodeC.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

        osc.start(time);
        osc.stop(time + 0.4);
    }


    /**
     * This could be replaced with beet.shift(offset). See https://github.com/zya/beet.js
     * @param {*} shift 
     * @returns the pattern in binary sequence.
     */
    getRhythm(shift) {
        switch (shift) {
            case 'down':
                return '00100100100100';
            case 'kick':
                return '10000001000000';
            case 'key':
                return '00001000000100';
            case 'hold':
                return '10000010010000';
        }
    }

    setTempo(tempo) {
        this.beet.tempo = tempo;
    }

    getTempo() {
        return this.beet.tempo;
    }


    setVolumePatternB(gain) {
        this.gainNodeB.gain.value = gain;
    }

    /**
     * Changes the volume (gain) of any track connected to this.gainNode according to the parameters. 
     * It assumes that far away objects are quieter than closer ones. The volume increases as target objects get
     * closer to this object. The increment is a mapping linear function offered by P5.js  
     * @param {Number} proximity How close is the current cyclist to the ghost
     * @param {Number} proxThreshold Minimum distance at which the volume stops increasing any more.  
     */
    setVolumePatternA(proximity, proxThreshold) {
        if (proximity > proxThreshold) proximity = proxThreshold;
        if (proximity < 15) proximity = 15;
        let intensity = Utils.p5.map(proximity, 15, proxThreshold, 1, 0.01) // 1 meter, far away meters, up to 2 intensity, 0.5 intensity
        //console.log(intensity);
        this.gainNodeA.gain.value = intensity;
    }

    /**
     * Changes the tempo of all tracks according to the parameters. 
     * It assumes that when the gost is ahead the cyclist need to speed up thus the tempo is higher, and viceversa. 
     * The tempo decreases as target objects get closer to this cyclists. The regular tempo recomended is 130 (initialized in constructor) but can be overrided with a parameter.
     * The adjustment is a mapping linear function offered by P5.js  
     * @param {Number} proximity How close is the current cyclist to the ghost
     * @param {Number} proxThreshold Minimum distance at which the volume stops increasing any more.
     * @param {Number} maxTempo The maximum tempo suitable for the current Rhythm  
     */
    setTempoByProximity(proximity, proxThreshold, maxTempo) {

        let clampedDistance = Utils.clamp(proximity, -proxThreshold, proxThreshold);

        let distanceFactor = 1 / Utils.p5.map(clampedDistance, -proxThreshold, proxThreshold, 1, 3) // last parameter: the larger the faster the tempo.

        let nuTempo = maxTempo * distanceFactor

        //  console.log(nuTempo);
        this.setTempo(nuTempo)
    }
}