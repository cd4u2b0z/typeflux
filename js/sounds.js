/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Sound System
   Satisfying audio feedback for every keystroke
   ═══════════════════════════════════════════════════════════ */

const SoundSystem = {
    audioContext: null,
    masterGain: null,        // final node → destination, fixed at 1.0
    sfxGain: null,           // keystrokes / UI / drone — the effects bus
    musicBus: null,          // the music layer — its own bus
    volume: 0.3,             // effects volume (0..1)
    musicVolume: 0.6,        // music volume (0..1) — independent
    enabled: true,

    // Initialize and resume audio context (handles both creation and browser autoplay policy)
    ensureContext() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                // master → destination; effects and music ride separate
                // buses so each carries its own volume slider.
                this.masterGain = this.audioContext.createGain();
                this.masterGain.gain.value = 1.0;
                this.masterGain.connect(this.audioContext.destination);
                this.sfxGain = this.audioContext.createGain();
                this.sfxGain.connect(this.masterGain);
                this.musicBus = this.audioContext.createGain();
                this.musicBus.connect(this.masterGain);
                this.setVolume(this.volume);
                this.setMusicVolume(this.musicVolume);
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

    // Set the effects volume (keystrokes / UI / drone)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.sfxGain) {
            this.sfxGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
    },

    // Set the music volume — independent of the effects volume
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.musicBus) {
            this.musicBus.gain.setValueAtTime(this.musicVolume, this.audioContext.currentTime);
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
        gainNode.connect(this.sfxGain);

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
        src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(this.sfxGain);
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
        filter.connect(gain); gain.connect(this.sfxGain);
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
    // Procedural music — an original lofi / jazz / trip-hop groove
    // beneath the trial. It BUILDS: sparse chords first, then a swung
    // beat, bass movement and texture layer in as the energy climbs,
    // and the groove keeps breathing rather than looping flat.
    // Scheduled against audioContext.currentTime so it never drifts.
    // Fully synthesised — no sampled or copyrighted material.
    // ─────────────────────────────────────────────────────────────
    MUSIC_BPM: 86,
    MUSIC_LEVEL: 0.2,          // the music sub-mix; the music slider scales it
    MUSIC_SWING: 0.58,         // swung 8ths — the lofi / hip-hop lilt
    music: null,

    /* An original 16-bar progression of soft extended chords — long
       enough that the harmony never feels like a 4- or 8-bar loop.
       `bass` + upper-voice notes are MIDI numbers. */
    MUSIC_PROGRESSION: [
        { bass: 38, notes: [57, 60, 64, 65] },
        { bass: 43, notes: [53, 59, 62, 64] },
        { bass: 36, notes: [55, 59, 62, 64] },
        { bass: 45, notes: [55, 59, 62, 67] },
        { bass: 46, notes: [53, 57, 62, 65] },
        { bass: 40, notes: [55, 59, 62, 66] },
        { bass: 45, notes: [55, 59, 60, 64] },
        { bass: 38, notes: [57, 60, 64, 67] },
        { bass: 41, notes: [57, 60, 64, 67] },
        { bass: 36, notes: [55, 59, 64, 67] },
        { bass: 43, notes: [53, 58, 62, 65] },
        { bass: 45, notes: [57, 60, 64, 65] },
        { bass: 41, notes: [55, 60, 63, 65] },
        { bass: 46, notes: [53, 58, 62, 65] },
        { bass: 40, notes: [54, 58, 62, 65] },
        { bass: 45, notes: [56, 59, 62, 65] }
    ],

    _midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); },

    startMusic() {
        if (!this.enabled) return;
        if (!this.ensureContext()) return;
        if (this.music && this.music.active) return;   // never layer loops
        const ctx = this.audioContext;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.setTargetAtTime(this.MUSIC_LEVEL, ctx.currentTime, 1.1);  // slow fade-in
        gain.connect(this.musicBus);
        this.music = {
            gain: gain,
            active: true,
            timer: null,
            intensity: 1,
            barIndex: 0,
            barCount: 0,
            kickStyle: 0,
            nextBarTime: ctx.currentTime + 0.25
        };
        this._musicScheduler();
    },

    setMusicIntensity(level) {
        if (this.music) this.music.intensity = Math.max(0.4, Math.min(1, level || 0));
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
            M.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5);  // smooth fade-out
            setTimeout(() => { try { M.gain.disconnect(); } catch (e) {} }, 2000);
        }
    },

    /* Energy 0..1 — sparse at first, climbs over the opening bars so
       the groove "picks up", then breathes in a slow ebb so it keeps
       lifting and settling instead of sitting flat. */
    _musicEnergy(bar) {
        const build = Math.min(1, 0.32 + bar * 0.105);
        const ebb = 0.85 + 0.15 * Math.sin(bar * 0.2 + 1);
        return Math.max(0.3, Math.min(1, build * ebb));
    },

    /* Look-ahead scheduler — schedules whole bars a little ahead of
       the audio clock so a slow setTimeout never makes it drift. */
    _musicScheduler() {
        const M = this.music;
        if (!M || !M.active || !this.audioContext) return;
        const ctx = this.audioContext;
        const beat = 60 / this.MUSIC_BPM;
        const barDur = beat * 4;
        while (M.nextBarTime < ctx.currentTime + 1.6) {
            const chord = this.MUSIC_PROGRESSION[M.barIndex % this.MUSIC_PROGRESSION.length];
            this._scheduleBar(M.nextBarTime, chord, beat,
                              this._musicEnergy(M.barCount), M.barCount);
            M.nextBarTime += barDur;
            M.barIndex++;
            M.barCount++;
            if (M.barCount % 8 === 0) M.kickStyle = Math.floor(Math.random() * 3);
        }
        M.timer = setTimeout(() => this._musicScheduler(), 340);
    },

    /* One bar of the groove. Layers enter as energy climbs; a rare bar
       thins the drums for a breath; the timing is swung throughout. */
    _scheduleBar(t0, chord, beat, energy, barCount) {
        const M = this.music;
        const sw = this.MUSIC_SWING;
        // swung 8th → seconds within the bar (i = 0..7)
        const eighth = (i) => t0 + (Math.floor(i / 2) + ((i % 2) ? sw : 0)) * beat;

        // an occasional "breath" — the drums thin for one bar
        const breath = energy > 0.62 && Math.random() < 0.12;
        const drumE = breath ? energy * 0.4 : energy;

        // ── chords — always; a syncopated stab once the groove is up ──
        this._musicChord(t0 + Math.random() * 0.02, chord, energy, false);
        if (energy > 0.6 && Math.random() < 0.42) {
            this._musicChord(eighth(5), chord, energy, true);   // 'and' of beat 3
        }

        // ── bass — fuller as the energy rises ──
        this._musicBassLine(t0, chord.bass, beat, eighth, energy);

        // ── hats — swung 8ths, offbeats accented (hip-hop feel) ──
        if (drumE > 0.3) {
            for (let i = 0; i < 8; i++) {
                const onbeat = (i % 2 === 0);
                if (drumE < 0.5 && !onbeat) continue;       // sparse when low
                if (Math.random() < 0.12) continue;          // an occasional gap
                const open = drumE > 0.72 && i === 7 && Math.random() < 0.4;
                const vel = (onbeat ? 0.6 : 0.95) * (0.7 + Math.random() * 0.5) * drumE;
                this._drumHat(eighth(i), vel, open);
            }
        }

        // ── kick — laid-back, syncopated; style varies every 8 bars ──
        if (drumE > 0.42) this._kickPattern(t0, beat, eighth, drumE, M.kickStyle);

        // ── snare / rim — the soft backbeat on 2 and 4 ──
        if (drumE > 0.55) {
            this._drumSnare(t0 + beat, 0.82 * drumE);
            this._drumSnare(t0 + beat * 3, 0.9 * drumE);
            if (Math.random() < 0.22) this._drumSnare(eighth(6), 0.3 * drumE);  // ghost
        }

        // ── a small hat fill closing every fourth bar ──
        if (drumE > 0.6 && barCount % 4 === 3) {
            for (let i = 0; i < 3; i++) {
                this._drumHat(t0 + beat * 3.5 + i * beat * 0.16, 0.5 * drumE, false);
            }
        }

        // ── vinyl crackle — sparse pops, always (the lofi texture) ──
        const pops = 2 + Math.floor(Math.random() * 5);
        for (let i = 0; i < pops; i++) this._vinylPop(t0 + Math.random() * beat * 4);
    },

    /* A sparse warm chord — sustained, or a short stab. Lightly
       re-voiced each time so it never sounds mechanical. */
    _musicChord(t0, chord, energy, stab) {
        const ctx = this.audioContext;
        const M = this.music;
        if (!M) return;
        const notes = chord.notes.slice();
        if (Math.random() < 0.3) notes[0] += 12;                   // light inversion
        if (notes.length > 3 && Math.random() < 0.3) {              // omit a chord tone
            notes.splice(1 + Math.floor(Math.random() * (notes.length - 1)), 1);
        }
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 900 + energy * 850 + Math.random() * 450;   // opens as it warms
        lp.Q.value = 0.5;
        lp.connect(M.gain);
        const vel = (0.66 + Math.random() * 0.34) * M.intensity * (stab ? 0.62 : 1);
        const rel = stab ? (0.45 + Math.random() * 0.4) : (2.2 + Math.random() * 1.4);
        for (const m of notes) {
            this._rhodesNote(m, t0 + Math.random() * 0.03, vel, rel, lp);   // humanized roll
        }
    },

    /* A warm electric-piano-ish voice — two soft detuned waves under a
       gentle attack and a chosen release. */
    _rhodesNote(midi, t, vel, rel, dest) {
        const ctx = this.audioContext;
        const f = this._midiToFreq(midi);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.13 * vel, t + 0.04);
        env.gain.exponentialRampToValueAtTime(0.0001, t + rel);
        env.connect(dest);
        const o1 = ctx.createOscillator();
        o1.type = 'sine';
        o1.frequency.value = f;
        o1.connect(env);
        const o2 = ctx.createOscillator();
        o2.type = 'triangle';
        o2.frequency.value = f;
        o2.detune.value = 5 + Math.random() * 6;
        const o2g = ctx.createGain();
        o2g.gain.value = 0.32;
        o2.connect(o2g);
        o2g.connect(env);
        o1.start(t); o2.start(t);
        o1.stop(t + rel + 0.1); o2.stop(t + rel + 0.1);
    },

    /* The bass line — a root pulse when low, a moving / syncopated
       line once the groove is up. */
    _musicBassLine(t0, root, beat, eighth, energy) {
        this._musicBassNote(t0, root, 1.0);
        if (energy < 0.4) return;
        if (energy < 0.68) {
            if (Math.random() < 0.7) {
                this._musicBassNote(eighth(5), root + (Math.random() < 0.5 ? 12 : 7), 0.7);
            }
            return;
        }
        // higher energy — a walking-ish line with a passing tone
        this._musicBassNote(eighth(3), root + (Math.random() < 0.5 ? 12 : 7), 0.66);
        this._musicBassNote(t0 + beat * 2, root + (Math.random() < 0.4 ? 7 : 0), 0.82);
        if (Math.random() < 0.6) {
            const approach = root + [2, 3, 5, -2][Math.floor(Math.random() * 4)];
            this._musicBassNote(eighth(7), approach, 0.55);
        }
    },

    /* Soft muted bass — a low triangle with a short rounded envelope. */
    _musicBassNote(t, midi, vel) {
        const ctx = this.audioContext;
        const M = this.music;
        if (!M) return;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.3 * vel * M.intensity, t + 0.03);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 340;
        lp.connect(env);
        env.connect(M.gain);
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = this._midiToFreq(midi);
        o.connect(lp);
        o.start(t);
        o.stop(t + 0.55);
    },

    /* The kick pattern — three laid-back styles, rotated every 8 bars. */
    _kickPattern(t0, beat, eighth, energy, style) {
        this._drumKick(t0, 1.0);                          // beat 1, always
        if (style === 2 && energy > 0.72) {
            this._drumKick(t0 + beat, 0.55);              // steadier pulse
            this._drumKick(t0 + beat * 2, 0.7);
            this._drumKick(t0 + beat * 3, 0.55);
        } else if (style === 1) {
            this._drumKick(t0 + beat * 2.5, 0.78);        // trip-hop syncopation
        } else {
            this._drumKick(eighth(5), 0.72);              // boom-bap — 'and' of 3
            if (energy > 0.8 && Math.random() < 0.4) this._drumKick(eighth(7), 0.46);
        }
    },

    /* A soft deep kick — a sine with a fast downward pitch sweep. */
    _drumKick(t, vel) {
        const ctx = this.audioContext;
        const M = this.music;
        if (!M) return;
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(118, t);
        o.frequency.exponentialRampToValueAtTime(40, t + 0.08);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.55 * vel * M.intensity, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        o.connect(g);
        g.connect(M.gain);
        o.start(t);
        o.stop(t + 0.34);
    },

    /* A soft brushed snare / rim — band-passed noise, lofi-gentle. */
    _drumSnare(t, vel) {
        const ctx = this.audioContext;
        const M = this.music;
        if (!M) return;
        const dur = 0.16;
        const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1850 + Math.random() * 450;
        bp.Q.value = 0.7;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.3 * vel * M.intensity, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp);
        bp.connect(g);
        g.connect(M.gain);
        src.start(t);
        src.stop(t + dur + 0.02);
    },

    /* A hi-hat — short filtered noise; longer when 'open'. */
    _drumHat(t, vel, open) {
        const ctx = this.audioContext;
        const M = this.music;
        if (!M) return;
        const dur = open ? 0.14 : 0.035;
        const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 7200 + Math.random() * 2600;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.085 * vel * M.intensity, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(hp);
        hp.connect(g);
        g.connect(M.gain);
        src.start(t);
        src.stop(t + dur + 0.02);
    },

    /* A tiny vinyl crackle pop — the lofi texture. */
    _vinylPop(t) {
        const ctx = this.audioContext;
        const M = this.music;
        if (!M) return;
        const dur = 0.006 + Math.random() * 0.01;
        const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1400 + Math.random() * 3200;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.04 * (0.4 + Math.random() * 0.6) * M.intensity, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp);
        bp.connect(g);
        g.connect(M.gain);
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

