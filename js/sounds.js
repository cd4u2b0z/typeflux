/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Sound System
   Satisfying audio feedback for every keystroke
   ═══════════════════════════════════════════════════════════ */

const SoundSystem = {
    audioContext: null,
    masterGain: null,
    volume: 0.3,
    enabled: true,

    // Initialize and resume audio context (handles both creation and browser autoplay policy)
    ensureContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                this.masterGain = this.audioContext.createGain();
                this.masterGain.connect(this.audioContext.destination);
                this.setVolume(this.volume);
            } catch (e) {
                console.warn('Web Audio API not supported');
                this.enabled = false;
                return false;
            }
        }

        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        return true;
    },

    // Set master volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
    },

    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    },

    // Play a tone
    playTone(frequency, duration = 0.05, type = 'sine', volume = 0.5) {
        if (!this.enabled) return;
        if (!this.ensureContext()) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Attack and release envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.005);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    },

    /* Pink-noise burst — the percussive shoulder of a real key strike.
       Filtered, fast-decay envelope. This is the body of every key. */
    noiseBurst(duration = 0.025, peak = 0.18, lowpass = 2400, highpass = 600) {
        if (!this.enabled) return;
        if (!this.ensureContext()) return;
        const ctx = this.audioContext;
        const sr = ctx.sampleRate;
        const len = Math.max(1, Math.floor(sr * duration));
        const buffer = ctx.createBuffer(1, len, sr);
        const data = buffer.getChannelData(0);
        // pink-ish noise via running average — cheap but warm
        let prev = 0;
        for (let i = 0; i < len; i++) {
            const white = Math.random() * 2 - 1;
            prev = 0.85 * prev + 0.15 * white;
            data[i] = prev;
        }
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';  lp.frequency.value = lowpass;
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = highpass;
        const g  = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(peak, ctx.currentTime + 0.003);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(this.masterGain);
        src.start();
        src.stop(ctx.currentTime + duration);
    },

    /* Keystroke — pink-noise body + tonal "click" pip stacked on top.
       Slight per-key randomization so a stream of keys sounds alive. */
    keystroke() {
        if (!this.enabled) return;
        this.ensureContext();
        // Body: filtered noise burst — the "thock"
        this.noiseBurst(0.022, 0.14, 2200 + Math.random() * 600, 700);
        // Pip: short tonal click on top — the "key" of the keystroke
        const f = 1400 + Math.random() * 700;
        this.playTone(f, 0.012, 'triangle', 0.08);
    },

    /* Space — fatter, lower thock; the slab key */
    space() {
        if (!this.enabled) return;
        this.ensureContext();
        this.noiseBurst(0.045, 0.22, 900, 120);
        this.playTone(180 + Math.random() * 30, 0.05, 'sine', 0.16);
    },

    /* Carriage bell — line-end / word-pop, soft brass ding.
       Decoupled high partial creates the "ting" overtone. */
    bell() {
        if (!this.enabled) return;
        this.ensureContext();
        this.playTone(1760, 0.35, 'sine', 0.10);
        this.playTone(2640, 0.28, 'sine', 0.05);
        this.playTone(880,  0.45, 'sine', 0.06);
    },

    // Backspace - reverse sound
    backspace() {
        if (!this.enabled) return;
        this.ensureContext();

        this.playTone(600, 0.02, 'sawtooth', 0.1);
        setTimeout(() => {
            this.playTone(400, 0.03, 'sine', 0.1);
        }, 10);
    },

    // Error sound - subtle warning
    error() {
        if (!this.enabled) return;
        this.ensureContext();

        this.playTone(200, 0.08, 'sine', 0.2);
        setTimeout(() => {
            this.playTone(180, 0.08, 'sine', 0.15);
        }, 30);
    },

    // Correct word completion - positive feedback
    wordComplete() {
        if (!this.enabled) return;
        this.ensureContext();

        this.playTone(880, 0.03, 'sine', 0.15);
        setTimeout(() => {
            this.playTone(1100, 0.04, 'sine', 0.12);
        }, 30);
    },

    // Combo milestone sound
    combo(level) {
        if (!this.enabled) return;
        this.ensureContext();

        const baseFreq = 440 + (level * 50);
        
        this.playTone(baseFreq, 0.05, 'sine', 0.2);
        setTimeout(() => {
            this.playTone(baseFreq * 1.25, 0.05, 'sine', 0.18);
        }, 50);
        setTimeout(() => {
            this.playTone(baseFreq * 1.5, 0.08, 'sine', 0.15);
        }, 100);
    },

    // Test complete - triumphant sound
    testComplete() {
        if (!this.enabled) return;
        this.ensureContext();

        const melody = [523, 659, 784, 1047]; // C5, E5, G5, C6
        melody.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.15, 'sine', 0.2);
                this.playTone(freq * 0.5, 0.15, 'triangle', 0.1);
            }, i * 100);
        });
    },

    // New personal best
    newRecord() {
        if (!this.enabled) return;
        this.ensureContext();

        // Fanfare
        const notes = [392, 523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine', 0.25);
                this.playTone(freq * 0.5, 0.2, 'triangle', 0.15);
            }, i * 80);
        });
    },

    // UI click — a soft woody desk-tap (see uiSelect below)
    click() {
        this.uiSelect();
    },

    // Countdown tick
    tick() {
        if (!this.enabled) return;
        this.ensureContext();

        this.playTone(1200, 0.015, 'sine', 0.1);
    },

    // Timer warning (last 5 seconds)
    timerWarning() {
        if (!this.enabled) return;
        this.ensureContext();

        this.playTone(600, 0.05, 'triangle', 0.15);
    },

    // ─────────────────────────────────────────────────────────────
    // The room drone — a low, near-silent bed that breathes upward
    // with fervor. Atmosphere, never noise: the gain ceiling is kept
    // deliberately low. Started with a trial, stopped when it ends.
    // ─────────────────────────────────────────────────────────────
    drone: null,
    droneLevel: 0,

    startDrone() {
        if (!this.enabled) return;
        if (!this.ensureContext()) return;
        if (this.drone) return;
        const ctx = this.audioContext;

        const osc  = ctx.createOscillator();   // the fundamental
        const osc2 = ctx.createOscillator();   // a quiet fifth above
        osc.type = 'sine';   osc.frequency.value = 56;
        osc2.type = 'sine';  osc2.frequency.value = 84;
        osc2.detune.value = 5;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 180;

        const gain = ctx.createGain();
        gain.gain.value = 0; // silent until fervor raises it

        osc.connect(filter); osc2.connect(filter);
        filter.connect(gain); gain.connect(this.masterGain);
        osc.start(); osc2.start();

        this.drone = { osc, osc2, filter, gain };
        this.droneLevel = 0;
    },

    /* level 0..1 — the room swells with the combo. */
    setDroneIntensity(level) {
        if (!this.drone || !this.audioContext) return;
        const ctx = this.audioContext;
        const lvl = Math.max(0, Math.min(1, level || 0));
        this.droneLevel = lvl;
        // ceiling kept low — felt more than heard
        this.drone.gain.gain.cancelScheduledValues(ctx.currentTime);
        this.drone.gain.gain.setTargetAtTime(lvl * 0.05, ctx.currentTime, 0.4);
        this.drone.filter.frequency.setTargetAtTime(170 + lvl * 320, ctx.currentTime, 0.4);
    },

    stopDrone() {
        if (!this.drone || !this.audioContext) { this.drone = null; return; }
        const ctx = this.audioContext;
        const d = this.drone;
        this.drone = null;
        this.droneLevel = 0;
        try {
            d.gain.gain.cancelScheduledValues(ctx.currentTime);
            d.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
            d.osc.stop(ctx.currentTime + 1.4);
            d.osc2.stop(ctx.currentTime + 1.4);
        } catch (e) {}
    },

    // ─────────────────────────────────────────────────────────────
    // Procedural music — a soft "desk jazz" loop beneath the trial.
    // Original extended chords, ~84 BPM, voiced sparse and warm.
    // Scheduled against audioContext.currentTime so it never drifts.
    // ─────────────────────────────────────────────────────────────
    MUSIC_BPM: 84,
    MUSIC_LEVEL: 0.085,        // conservative — sits well under keystrokes
    music: null,

    /* An original slow 8-bar progression of soft extended chords.
       `bass` + upper-voice notes are MIDI numbers. Not drawn from any
       known game theme — warm, looping, lightly jazzy. */
    MUSIC_PROGRESSION: [
        { bass: 38, notes: [57, 60, 64, 65] },   // i — minor 9 colour
        { bass: 43, notes: [53, 59, 62, 64] },   // dominant 13 colour
        { bass: 36, notes: [55, 59, 62, 64] },   // major 9 colour
        { bass: 45, notes: [55, 59, 62, 67] },   // suspended, open
        { bass: 46, notes: [53, 57, 62, 65] },   // major 7 colour
        { bass: 40, notes: [55, 59, 62, 66] },   // minor 9 colour
        { bass: 45, notes: [55, 59, 60, 64] },   // minor 9 colour
        { bass: 38, notes: [57, 60, 64, 67] }    // turnaround back to i
    ],

    _midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); },

    startMusic() {
        if (!this.enabled) return;
        if (!this.ensureContext()) return;
        if (this.music && this.music.active) return;   // never layer loops
        const ctx = this.audioContext;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.setTargetAtTime(this.MUSIC_LEVEL, ctx.currentTime, 0.7);  // gentle fade-in
        gain.connect(this.masterGain);
        this.music = {
            gain: gain,
            active: true,
            timer: null,
            intensity: 1,
            barIndex: 0,
            nextBarTime: ctx.currentTime + 0.2
        };
        this._musicScheduler();
    },

    setMusicIntensity(level) {
        if (this.music) this.music.intensity = Math.max(0.35, Math.min(1, level || 0));
    },

    stopMusic() {
        const M = this.music;
        if (!M) return;
        this.music = null;                  // blocks the scheduler + duplicate starts
        M.active = false;
        if (M.timer) { clearTimeout(M.timer); M.timer = null; }
        if (M.gain && this.audioContext) {
            const ctx = this.audioContext;
            M.gain.gain.cancelScheduledValues(ctx.currentTime);
            M.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);  // smooth fade-out
            setTimeout(() => { try { M.gain.disconnect(); } catch (e) {} }, 1800);
        }
    },

    /* Look-ahead scheduler — schedules whole bars a little ahead of
       the audio clock, so a slow setTimeout never makes it drift. */
    _musicScheduler() {
        const M = this.music;
        if (!M || !M.active || !this.audioContext) return;
        const ctx = this.audioContext;
        const beat = 60 / this.MUSIC_BPM;
        const barDur = beat * 4;
        while (M.nextBarTime < ctx.currentTime + 1.5) {
            const chord = this.MUSIC_PROGRESSION[M.barIndex % this.MUSIC_PROGRESSION.length];
            this._scheduleBar(M.nextBarTime, chord, beat);
            M.nextBarTime += barDur;
            M.barIndex++;
        }
        M.timer = setTimeout(() => this._musicScheduler(), 360);
    },

    /* One bar: a sparse chord, a muted bass pulse, a little brushed
       texture — all lightly randomized so it never sounds mechanical. */
    _scheduleBar(t0, chord, beat) {
        this._musicChord(t0, chord);
        this._musicBass(t0, chord.bass, false);
        if (Math.random() < 0.7) this._musicBass(t0 + beat * 2, chord.bass, true);
        for (let b = 0; b < 4; b++) {
            if (Math.random() < 0.3) this._musicBrush(t0 + (b + 0.5) * beat);
        }
    },

    _musicChord(t0, chord) {
        const ctx = this.audioContext;
        const M = this.music;
        if (!M) return;
        const notes = chord.notes.slice();
        if (Math.random() < 0.3) notes[0] += 12;                  // light inversion
        if (notes.length > 3 && Math.random() < 0.25) {            // omit a chord tone
            notes.splice(1 + Math.floor(Math.random() * (notes.length - 1)), 1);
        }
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1100 + Math.random() * 800;           // randomized cutoff
        lp.Q.value = 0.4;
        lp.connect(M.gain);
        const vel = (0.82 + Math.random() * 0.36) * M.intensity;   // randomized velocity
        for (const m of notes) {
            this._rhodesNote(m, t0 + Math.random() * 0.028, vel, lp);   // humanized roll
        }
    },

    /* A warm electric-piano-ish voice: two soft detuned waves under a
       gentle attack and a long release, so chords ring into one another. */
    _rhodesNote(midi, t, vel, dest) {
        const ctx = this.audioContext;
        const f = this._midiToFreq(midi);
        const rel = 2.4 + Math.random() * 1.1;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.17 * vel, t + 0.045);
        env.gain.exponentialRampToValueAtTime(0.0001, t + rel);
        env.connect(dest);
        const o1 = ctx.createOscillator();
        o1.type = 'sine';
        o1.frequency.value = f;
        o1.connect(env);
        const o2 = ctx.createOscillator();
        o2.type = 'triangle';
        o2.frequency.value = f;
        o2.detune.value = 5 + Math.random() * 5;
        const o2g = ctx.createGain();
        o2g.gain.value = 0.35;
        o2.connect(o2g);
        o2g.connect(env);
        o1.start(t); o2.start(t);
        o1.stop(t + rel + 0.1); o2.stop(t + rel + 0.1);
    },

    /* Soft muted bass — a low sine with a short rounded envelope. */
    _musicBass(t, midi, soft) {
        const ctx = this.audioContext;
        const M = this.music;
        if (!M) return;
        let m = midi;
        if (Math.random() < 0.18) m += 7;          // occasionally the fifth
        const env = ctx.createGain();
        const peak = (soft ? 0.085 : 0.14) * M.intensity;
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(peak, t + 0.035);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.62);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 320;
        lp.connect(env);
        env.connect(M.gain);
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = this._midiToFreq(m);
        o.connect(lp);
        o.start(t);
        o.stop(t + 0.72);
    },

    /* A very quiet brushed tick — filtered noise, barely there. */
    _musicBrush(t) {
        const ctx = this.audioContext;
        const M = this.music;
        if (!M) return;
        const dur = 0.05 + Math.random() * 0.05;
        const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 5500 + Math.random() * 2200;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.016 * M.intensity, t + 0.012);
        env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(hp); hp.connect(env); env.connect(M.gain);
        src.start(t);
        src.stop(t + dur + 0.02);
    },

    // ─────────────────────────────────────────────────────────────
    // UI audio — soft, varied, rate-limited feedback for the desk.
    // Every method respects `enabled`; all route through masterGain
    // so the volume slider governs them.
    // ─────────────────────────────────────────────────────────────

    /* A quiet hover tick — rate-limited so a fast sweep across dense
       controls never machine-guns. */
    hover() {
        if (!this.enabled) return;
        const now = Date.now();
        if (now - (this._lastHover || 0) < 45) return;
        this._lastHover = now;
        if (!this.ensureContext()) return;
        this.noiseBurst(0.016, 0.045, 2800 + Math.random() * 1600, 1700);
        if (Math.random() < 0.5) {
            this.playTone(2100 + Math.random() * 900, 0.03, 'sine', 0.022);
        }
    },

    /* A soft woody desk-tap for any selection — also the new click(). */
    uiSelect() {
        if (!this.enabled) return;
        if (!this.ensureContext()) return;
        this.noiseBurst(0.028, 0.10, 1500 + Math.random() * 400, 280);
        this.playTone(400 + Math.random() * 130, 0.04, 'triangle', 0.055);
    },

    /* A short two-step mechanical motion for a toggle. */
    toggleSwitch(on) {
        if (!this.enabled) return;
        if (!this.ensureContext()) return;
        this.noiseBurst(0.02, 0.07, 2200, 600);
        const base = on ? 520 : 360;
        this.playTone(base, 0.03, 'triangle', 0.05);
        setTimeout(() => {
            this.playTone(base * (on ? 1.16 : 0.86), 0.04, 'triangle', 0.038);
        }, 55);
    },

    /* A tiny muted tick for slider motion — rate-limited while dragging. */
    sliderTick() {
        if (!this.enabled) return;
        const now = Date.now();
        if (now - (this._lastSlider || 0) < 34) return;
        this._lastSlider = now;
        if (!this.ensureContext()) return;
        this.playTone(880 + Math.random() * 520, 0.014, 'sine', 0.03);
    },

    /* A soft felt thump as a panel opens / closes. */
    menuOpen() {
        if (!this.enabled) return;
        if (!this.ensureContext()) return;
        this.noiseBurst(0.13, 0.06, 720, 70);
        this.playTone(174, 0.18, 'sine', 0.05);
    },
    menuClose() {
        if (!this.enabled) return;
        if (!this.ensureContext()) return;
        this.noiseBurst(0.10, 0.05, 600, 70);
        this.playTone(150, 0.15, 'sine', 0.04);
    },

    /* A gentle tonal shimmer for a theme change — not a fanfare. */
    themeShift() {
        if (!this.enabled) return;
        if (!this.ensureContext()) return;
        const root = 320 + Math.random() * 70;
        [1, 1.25, 1.5, 2].forEach((mult, i) => {
            setTimeout(() => this.playTone(root * mult, 0.5, 'sine', 0.032), i * 75);
        });
    }
};

