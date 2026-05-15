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
    // Procedural music — an original, evolving electronic score.
    // Hypnotic and deep (Berlin dub-house), dreamy (lush pads), and
    // it lifts (progressive arps) — moving through four phases that
    // never settle, and REACTING to the trial: pace and brightness
    // climb with thy fervor, and tension gathers as the glass empties.
    // Scheduled against audioContext.currentTime so it never drifts.
    // Fully synthesised — no sampled or copyrighted material.
    // ─────────────────────────────────────────────────────────────
    MUSIC_BPM: 88,
    MUSIC_LEVEL: 0.2,          // the music sub-mix; the music slider scales it
    MUSIC_SECTION: 6,          // bars per phase
    music: null,

    /* A 16-bar progression of soft extended chords — `bass` + upper
       voices as MIDI numbers. */
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
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.0001, ctx.currentTime);
        master.gain.setTargetAtTime(this.MUSIC_LEVEL, ctx.currentTime, 1.3);  // slow fade-in
        master.connect(this.musicBus);
        // a sidechain bus — pads / arps / stabs duck on the kick (the
        // breathing "pump" of deep house); drums + bass go direct.
        const pump = ctx.createGain();
        pump.gain.value = 1.0;
        pump.connect(master);
        this.music = {
            gain: master, pump: pump,
            active: true, timer: null,
            intensity: 0.5,      // app-driven — climbs with fervor
            urgency: 0,          // app-driven — climbs as the glass empties
            barIndex: 0, barCount: 0,
            phaseOffset: Math.floor(Math.random() * 4),   // a different opening each trial
            nextBarTime: ctx.currentTime + 0.3
        };
        this._musicScheduler();
    },

    /* Fervor → the music pushes: fuller, brighter, more driving. */
    setMusicIntensity(level) {
        if (this.music) this.music.intensity = Math.max(0.35, Math.min(1, level || 0));
    },

    /* The glass emptying → tension gathers: top-end, chaos, a rising lift. */
    setMusicUrgency(level) {
        if (this.music) this.music.urgency = Math.max(0, Math.min(1, level || 0));
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
       the score "picks up", then breathes in a slow ebb. */
    _musicEnergy(bar) {
        const build = Math.min(1, 0.34 + bar * 0.11);
        const ebb = 0.86 + 0.14 * Math.sin(bar * 0.19 + 1);
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
            this._scheduleBar(M.nextBarTime, chord, beat, M.barCount);
            M.nextBarTime += barDur;
            M.barIndex++;
            M.barCount++;
        }
        M.timer = setTimeout(() => this._musicScheduler(), 340);
    },

    /* The chord tones, ascending — a base for arpeggios. */
    _arpNotes(chord) {
        return chord.notes.slice().sort((a, b) => a - b);
    },

    /* One bar. The phase decides the character; `drive` (energy ×
       fervor) and `urgency` (the glass) shape every layer on top. */
    _scheduleBar(t0, chord, beat, barCount) {
        const M = this.music;
        const energy = this._musicEnergy(barCount);
        const intensity = M.intensity, urgency = M.urgency;
        // overall push — the build, lifted by fervor and by urgency
        const drive = Math.min(1, energy * (0.5 + 0.5 * intensity) + urgency * 0.4);
        // section: 0 drift (dreamy) · 1 pulse (deep house) · 2 lift
        // (progressive) · 3 ebb (breakdown) — each MUSIC_SECTION bars
        const phase = (Math.floor(barCount / this.MUSIC_SECTION) + M.phaseOffset) % 4;

        const eighth = (i) => t0 + i * 0.5 * beat;          // straight 8ths
        const six = (i) => t0 + i * 0.25 * beat;            // straight 16ths

        // ── PAD — the lush bed, almost always present (dreamy) ──
        if (phase !== 2 || Math.random() < 0.7) {
            const padVel = (0.55 + 0.45 * drive) * (phase === 3 ? 1.2 : 1);
            this._musicPad(t0 + Math.random() * 0.04, chord, beat * 4, padVel);
        }

        // ── decide the beat for this bar ──
        let beatMode;
        if (urgency > 0.5)        beatMode = 'drive';        // glass emptying — push
        else if (phase === 1)     beatMode = 'house';
        else if (phase === 2)     beatMode = 'drive';
        else if (phase === 0)     beatMode = (drive > 0.86) ? 'house' : 'none';
        else                      beatMode = 'none';        // phase 3 — breakdown

        // ── KICK + sidechain pump ──
        if (beatMode === 'house' || beatMode === 'drive') {
            const kVel = beatMode === 'drive' ? 0.92 : 0.78;
            for (let b = 0; b < 4; b++) {
                this._drumKick(t0 + b * beat, kVel);
                this._pump(t0 + b * beat, beat);
            }
        } else if (drive > 0.6) {
            this._drumKick(t0, 0.5);                        // a soft heartbeat
            this._pump(t0, beat);
        }

        // ── HATS — offbeat 'tss', plus ticking 16ths when it drives ──
        if (beatMode !== 'none') {
            for (let i = 1; i < 8; i += 2) {                // open hat on the offbeats
                this._drumHat(eighth(i), (0.65 + Math.random() * 0.4) * drive, true);
            }
            if (beatMode === 'drive' || urgency > 0.4) {
                for (let i = 0; i < 16; i++) {
                    if (i % 4 === 0) continue;              // leave the downbeat clear
                    if (Math.random() < 0.28) continue;
                    this._drumHat(six(i), 0.34 * drive, false);
                }
            }
        }

        // ── soft rim on 2 and 4 once it's really moving ──
        if (beatMode === 'drive' && drive > 0.7) {
            this._drumSnare(t0 + beat, 0.5 * drive);
            this._drumSnare(t0 + beat * 3, 0.55 * drive);
        }

        // ── BASS ──
        if (beatMode === 'house' || beatMode === 'drive') {
            for (let b = 0; b < 4; b++) {                   // deep offbeat house bass
                const n = chord.bass + ((b % 2) ? 0 : (Math.random() < 0.4 ? 12 : 0));
                this._musicBassNote(t0 + (b + 0.5) * beat, n, 0.85 * drive);
            }
        } else {
            this._subBass(t0, chord.bass, beat * 4 * (0.9 + Math.random() * 0.4));
            if (Math.random() < 0.4) this._subBass(t0 + beat * 2, chord.bass + 7, beat * 2);
        }

        // ── DUB CHORD STABS — Berlin offbeat stabs in the groove phases ──
        if (beatMode === 'house' || beatMode === 'drive') {
            const stabs = beatMode === 'drive' ? [1, 3, 5, 7] : [3, 7];
            for (const s of stabs) {
                if (Math.random() < 0.85) this._dubStab(eighth(s), chord, 0.7 * drive, urgency);
            }
        }

        // ── ARP ──
        const arp = this._arpNotes(chord);
        if (phase === 2 || urgency > 0.45 || (phase === 1 && drive > 0.82)) {
            // progressive driving 16th arp — rises through the octave
            for (let i = 0; i < 16; i++) {
                if (Math.random() < 0.1) continue;
                const midi = arp[i % arp.length] + (i >= 8 ? 12 : 0);
                this._arpNote(six(i), midi, 0.6 * drive, urgency);
            }
        } else if (phase === 0 || phase === 3) {
            // dreamy sparse bell glints
            const count = 2 + Math.floor(Math.random() * 4);
            for (let k = 0; k < count; k++) {
                this._musicBell(t0 + Math.random() * beat * 4,
                                arp[Math.floor(Math.random() * arp.length)] + 12,
                                0.6 + Math.random() * 0.4);
            }
        }

        // ── URGENCY — a rising tension lift over the last seconds ──
        if (urgency > 0.5 && Math.random() < 0.7) {
            this._tensionSweep(t0, beat * 4, urgency);
        }

        // ── faint crackle texture — always, sparse ──
        const pops = 1 + Math.floor(Math.random() * 4);
        for (let i = 0; i < pops; i++) this._vinylPop(t0 + Math.random() * beat * 4);
    },

    /* A lush detuned-saw pad — slow swell, slowly-opening filter.
       Routes through the sidechain bus so it breathes with the kick. */
    _musicPad(t, chord, dur, vel) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(540 + vel * 800, t);
        lp.frequency.linearRampToValueAtTime(700 + vel * 1300, t + dur * 0.6);
        lp.Q.value = 0.4;
        lp.connect(M.pump);
        for (const midi of chord.notes) {
            const f = this._midiToFreq(midi);
            const peak = 0.05 * vel;
            const env = ctx.createGain();
            env.gain.setValueAtTime(0.0001, t);
            env.gain.linearRampToValueAtTime(peak, t + dur * 0.45);
            env.gain.linearRampToValueAtTime(peak * 0.85, t + dur);
            env.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.6);
            env.connect(lp);
            for (let d = -1; d <= 1; d++) {
                const o = ctx.createOscillator();
                o.type = 'sawtooth';
                o.frequency.value = f;
                o.detune.value = d * (8 + Math.random() * 7);
                o.connect(env);
                o.start(t);
                o.stop(t + dur + 1.7);
            }
        }
    },

    /* A short resonant chord stab — the Berlin dub-techno signature. */
    _dubStab(t, chord, vel, urgency) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const cut = 600 + Math.random() * 700 + urgency * 1500;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(cut * 1.7, t);
        lp.frequency.exponentialRampToValueAtTime(cut, t + 0.16);
        lp.Q.value = 3 + Math.random() * 4;
        lp.connect(M.pump);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.05 * vel, t + 0.012);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.32 + Math.random() * 0.22);
        env.connect(lp);
        for (const midi of chord.notes) {
            const o = ctx.createOscillator();
            o.type = 'sawtooth';
            o.frequency.value = this._midiToFreq(midi);
            o.detune.value = (Math.random() * 2 - 1) * 6;
            o.connect(env);
            o.start(t);
            o.stop(t + 0.8);
        }
    },

    /* A bright pluck for the progressive arp — a fast filter decay. */
    _arpNote(t, midi, vel, urgency) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(2600 + urgency * 3200, t);
        lp.frequency.exponentialRampToValueAtTime(600 + urgency * 700, t + 0.15);
        lp.Q.value = 2;
        lp.connect(M.pump);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.07 * vel, t + 0.005);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        env.connect(lp);
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = this._midiToFreq(midi);
        o.connect(env);
        o.start(t);
        o.stop(t + 0.28);
    },

    /* A soft bell glint — a sine with one inharmonic partial. */
    _musicBell(t, midi, vel) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const f = this._midiToFreq(midi);
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.06 * vel, t + 0.01);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 1.0 + Math.random() * 0.7);
        env.connect(M.pump);
        const o1 = ctx.createOscillator();
        o1.type = 'sine'; o1.frequency.value = f;
        o1.connect(env);
        const o2 = ctx.createOscillator();
        o2.type = 'sine'; o2.frequency.value = f * 2.01;
        const o2g = ctx.createGain(); o2g.gain.value = 0.32;
        o2.connect(o2g); o2g.connect(env);
        o1.start(t); o2.start(t);
        o1.stop(t + 1.9); o2.stop(t + 1.9);
    },

    /* A deep sine sub-bass swell — felt more than heard. */
    _subBass(t, midi, dur) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.3, t + Math.min(0.6, dur * 0.35));
        env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        env.connect(M.gain);
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = this._midiToFreq(midi - 12);   // an octave below the bass
        o.connect(env);
        o.start(t);
        o.stop(t + dur + 0.1);
    },

    /* Sidechain duck — the pad/arp bus dips on the kick, then breathes
       back over the beat. The pulse of deep house. */
    _pump(t, beat) {
        const M = this.music;
        if (!M || !M.pump) return;
        const g = M.pump.gain;
        g.cancelScheduledValues(t);
        g.setValueAtTime(0.36, t + 0.004);
        g.linearRampToValueAtTime(1.0, t + beat * 0.92);
    },

    /* A soft, round, deep kick — never heavy. */
    _drumKick(t, vel) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(105, t);
        o.frequency.exponentialRampToValueAtTime(42, t + 0.10);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.46 * vel, t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
        o.connect(g);
        g.connect(M.gain);
        o.start(t);
        o.stop(t + 0.38);
    },

    /* A soft brushed rim — band-passed noise, gentle. */
    _drumSnare(t, vel) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const dur = 0.15;
        const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1900 + Math.random() * 500;
        bp.Q.value = 0.7;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.22 * vel, t + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp);
        bp.connect(g);
        g.connect(M.gain);
        src.start(t);
        src.stop(t + dur + 0.02);
    },

    /* A hi-hat — short filtered noise; longer when 'open'. */
    _drumHat(t, vel, open) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const dur = open ? 0.13 : 0.032;
        const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const hp = ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 7400 + Math.random() * 2600;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.07 * vel, t + 0.004);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(hp);
        hp.connect(g);
        g.connect(M.gain);
        src.start(t);
        src.stop(t + dur + 0.02);
    },

    /* A soft muted bass note — a low triangle, round and short. */
    _musicBassNote(t, midi, vel) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.26 * vel, t + 0.02);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 380;
        lp.connect(env);
        env.connect(M.gain);
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = this._midiToFreq(midi);
        o.connect(lp);
        o.start(t);
        o.stop(t + 0.46);
    },

    /* A rising filtered tone — tension as the glass empties. */
    _tensionSweep(t, dur, urgency) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        const f0 = 190 + urgency * 150;
        o.frequency.setValueAtTime(f0, t);
        o.frequency.linearRampToValueAtTime(f0 * 1.7, t + dur);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(380, t);
        lp.frequency.linearRampToValueAtTime(1900, t + dur);
        lp.Q.value = 7;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.03 * urgency, t + dur * 0.82);
        env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(lp); lp.connect(env); env.connect(M.gain);
        o.start(t);
        o.stop(t + dur + 0.1);
    },

    /* A tiny crackle pop — a faint analogue texture. */
    _vinylPop(t) {
        const ctx = this.audioContext, M = this.music;
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
        g.gain.setValueAtTime(0.035 * (0.4 + Math.random() * 0.6), t);
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

