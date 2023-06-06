/**
 * Inspired in Steve Reich Clapping hands pattern
 * For reference see: http://zya.github.io/beet.js/
 * uses the beet lid. See libs/beet.min.js in index.html
 */
class EuclideanRhythm {

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

        // Volume patttern A
        this.gainNodeA = this.context.createGain();

        // Volume patttern B
        this.gainNodeB = this.context.createGain();

        // Pattern shift
        this.currentNoteShift = 1;

        // create a euclidean pattern
        this.patternA = this.beet.pattern(this.getNoteShift(1));

        // create a beet layer - pass it the pattern and a callback
        this.layerA = this.beet.layer(this.patternA, this.callbackA.bind(this));

        // create a euclidean pattern 
        this.patternB = this.beet.pattern(this.getNoteShift(this.currentNoteShift));

        // create a beet layer - pass it the pattern and a callback
        this.layerB = this.beet.layer(this.patternB, this.callbackB.bind(this));

        // create a euclidean pattern 
        this.patternC = this.beet.pattern(5, 9);

        // create a beet layer - pass it the pattern and a callback
        this.layerC = this.beet.layer(this.patternC, this.callbackC.bind(this));

        // add the layers
        // this.beet.add(this.layerAClap);
        this.beet.add(this.layerA);
        this.beet.add(this.layerB);
        this.beet.add(this.layerC);
    }

    /**
     * 
     * @param {Integer} condition -1: slow down, 1:speed up or 0: hold.
     * @param {*} distance 
     */
    exec(condition, distance) {
        // Playing layers based on condition
        switch (condition) {
            case -1: // ghost behind, slow down
                this.beet.layers[0].pause();
                this.beet.layers[1].pause();
                if (!clappingHands.beet.layers[2].metro._is_running) this.beet.layers[2].start();
                break;

            case 1: // ghost ahead, speed up
                if (!clappingHands.beet.layers[0].metro._is_running) this.beet.layers[0].start();
                if (!clappingHands.beet.layers[1].metro._is_running) this.beet.layers[1].start();
                this.beet.layers[2].stop();
                break;

            case 0: // sweet spot
                if (!clappingHands.beet.layers[0].metro._is_running) this.beet.layers[0].start();
                if (!clappingHands.beet.layers[1].metro._is_running) this.beet.layers[1].start();
                this.beet.layers[2].stop();
                break;
        }

        // adjusting sound gain
        // this changes the sound volume (gain) feedback beyond the greenWave zone 
        if (distance < crowdProximity) {
            this.setVolumePatternA(Math.abs(distance), crowdProximity);
        } else {
            this.beet.layers[0].stop();
            this.beet.layers[1].stop();
        }
    }

    enableAudioContext() {
        // check if context is in suspended state (autoplay policy). 
        // Autoplay article: https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
        if (this.context.state === 'suspended') {
            this.soundEnabled = true;
            this.context.resume().then(rslt => {
                this.beet.start();
                GUI.volume_up.hidden = false;
                console.log("Sound enabled")
            });
        } else if (this.context.state === 'running') {
            this.soundEnabled = false;
            this.context.suspend().then(rslt => {
                this.beet.stop();
                GUI.volume_up.hidden = true;
                console.log("Sound disabled")
            });
        }
        GUI.switchStatus(GUI.enableSound, this.soundEnabled, { t: "Sound enabled", f: "Sound disabled" }, { t: "btn btn-success btn-lg btn-block", f: "btn btn-warning btn-lg btn-block" })
    }

    /**
     * Reproduces the pattern of player A using an Oscillator
     * @param {} time 
     * @param {*} step 
     */
    callbackA(time, step) {

        var osc = this.context.createOscillator();
        osc.connect(this.gainNodeA).connect(this.context.destination);
        let note = this.beet.utils.ntof('C3');

        if (note) {
            osc.frequency.setValueAtTime(note, time);
            this.beet.utils.envelope(this.gainNodeA.gain, time, {
                start: 0,
                peak: 0.75,
                attack: 0.1,
                decay: 0.01,
                sustain: .6,
                release: 0.05
            });
            osc.start(time);
            osc.stop(time + 0.18);
        }

    }

    /**
     * Reproduces the pattern of player B using an Oscillator
     * @param {} time 
     * @param {*} step 
     */
    callbackB(time, step) {
        var osc = this.context.createOscillator();
        osc.connect(this.gainNodeB).connect(this.context.destination);
        let note = this.beet.utils.ntof('C3');

        if (note) {
            osc.frequency.setValueAtTime(note, time)
            this.beet.utils.envelope(this.gainNodeB.gain, time, {
                start: 0,
                peak: 0.75,
                attack: 0.1,
                decay: 0.01,
                sustain: .6,
                release: 0.05
            });

            osc.start(time);
            osc.stop(time + 0.18);
        }
    }

    /**
     * Reproduces the pattern of player B using an Oscillator
     * @param {} time 
     * @param {*} step 
     */
    callbackC(time, step) {
        var osc = this.context.createOscillator();
        osc.connect(this.context.destination);
        let note = this.beet.utils.ntof('C3');

        if (note) {
            osc.frequency.setValueAtTime(note, time)
            this.beet.utils.envelope(this.gainNodeB.gain, time, {
                start: 0,
                peak: 1.0,
                attack: 0.1,
                decay: 0.01,
                sustain: .7,
                release: 0.05
            });

            osc.start(time);
            osc.stop(time + 0.18);
        }
    }

    /**
     * Shifts pattern B one note up
     */
    noteUP() {
        this.currentNoteShift++;
        if (this.currentNoteShift > 12) {
            this.currentNoteShift = 1
        }
        this.patternB.update(this.getNoteShift(this.currentNoteShift))
    }

    /**
     * Shifts pattern B one note down
     */
    noteDOWN() {
        this.currentNoteShift--;
        if (this.currentNoteShift < 1) {
            this.currentNoteShift = 12
        }
        this.patternB.update(this.getNoteShift(this.currentNoteShift))
    }

    /**
     * This could be replaced with beet.shift(offset). See https://github.com/zya/beet.js
     * @param {*} shift 
     * @returns the pattern in binary sequence.
     */
    getNoteShift(shift) {
        switch (shift) {
            case 1:
                return 'a111011010110';
            case 2:
                return '11011010110a1';
            case 3:
                return '1011010110a11';
            case 4:
                return '011010110a111';
            case 5:
                return '11010110a1110';
            case 6:
                return '1010110a11101';
            case 7:
                return '010110a111011';
            case 8:
                return '10110a1110110';
            case 9:
                return '0110a11101101';
            case 10:
                return '110a111011010';
            case 11:
                return '10a1110110101';
            case 12:
                return '0a11101101011';
        }

    }

    setTempo(tempo) {
        this.beet.tempo = tempo;
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
        console.log(intensity);
        // this.gainNodeA.gain.value = intensity;
    }
}