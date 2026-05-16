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
    // Procedural music — an original, evolving electronic score that
    // never plays the same piece twice. Each trial draws ONE of five
    // grooves, and the grooves are worlds apart:
    //   · bounce      — swung house-funk: claps, filtered funk bass
    //   · boom-bap    — dusty jazz hip-hop: lazy backbeat, upright bass
    //   · progressive — driving four-on-floor: 16th plucks, long builds
    //   · trip-hop    — slow, dark, halftime, heavy dub bass, cinematic
    //   · lounge      — woozy dream-jazz: wobbling tape, vibraphone
    // On top of the groove sits a random key, tempo, progression and
    // timbre — and it all REACTS to the trial: pace and brightness
    // climb with thy fervor, tension gathers as the glass empties.
    // Scheduled against audioContext.currentTime so it never drifts.
    // Fully synthesised — no sampled or copyrighted material.
    // ─────────────────────────────────────────────────────────────
    MUSIC_LEVEL: 0.2,          // the music sub-mix; the music slider scales it
    MUSIC_SECTION: 6,          // bars per phase (a seed may override)
    music: null,
    _lastTranspose: 0,
    _lastStyle: '',

    /* Progressions of soft extended chords (`bass` + upper voices,
       MIDI), each tagged with a `feel`. A trial's groove draws only
       from progressions whose feel suits it, then transposes to a
       random key — so no two trials are ever the same piece. */
    MUSIC_PROGRESSIONS: [
        // wistful, jazzy minor 9ths (a long 16-bar journey)
        { feel: 'jazzy', chords: [
            { bass: 38, notes: [57, 60, 64, 65] }, { bass: 43, notes: [53, 59, 62, 64] },
            { bass: 36, notes: [55, 59, 62, 64] }, { bass: 45, notes: [55, 59, 62, 67] },
            { bass: 46, notes: [53, 57, 62, 65] }, { bass: 40, notes: [55, 59, 62, 66] },
            { bass: 45, notes: [55, 59, 60, 64] }, { bass: 38, notes: [57, 60, 64, 67] },
            { bass: 41, notes: [57, 60, 64, 67] }, { bass: 36, notes: [55, 59, 64, 67] },
            { bass: 43, notes: [53, 58, 62, 65] }, { bass: 45, notes: [57, 60, 64, 65] },
            { bass: 41, notes: [55, 60, 63, 65] }, { bass: 46, notes: [53, 58, 62, 65] },
            { bass: 40, notes: [54, 58, 62, 65] }, { bass: 45, notes: [56, 59, 62, 65] }
        ] },
        // brighter, lifting (major 7 / 9 colour)
        { feel: 'bright', chords: [
            { bass: 36, notes: [55, 60, 64, 67] }, { bass: 41, notes: [57, 60, 65, 69] },
            { bass: 43, notes: [55, 59, 62, 67] }, { bass: 40, notes: [55, 59, 64, 67] },
            { bass: 45, notes: [55, 60, 64, 67] }, { bass: 41, notes: [57, 60, 65, 69] },
            { bass: 36, notes: [55, 59, 62, 67] }, { bass: 43, notes: [53, 59, 62, 67] }
        ] },
        // deep, suspended, moody (Berlin)
        { feel: 'deep', chords: [
            { bass: 33, notes: [57, 62, 64, 69] }, { bass: 33, notes: [57, 60, 64, 67] },
            { bass: 36, notes: [55, 60, 62, 67] }, { bass: 31, notes: [55, 58, 62, 65] },
            { bass: 38, notes: [57, 62, 64, 69] }, { bass: 38, notes: [57, 60, 65, 69] },
            { bass: 34, notes: [53, 58, 62, 65] }, { bass: 33, notes: [56, 60, 64, 67] }
        ] },
        // warm, soulful 7th/9th loop (the funk-house bounce)
        { feel: 'soul', chords: [
            { bass: 36, notes: [55, 60, 64, 67] }, { bass: 33, notes: [55, 60, 64, 69] },
            { bass: 41, notes: [57, 60, 65, 69] }, { bass: 43, notes: [55, 59, 62, 65] },
            { bass: 38, notes: [57, 60, 64, 65] }, { bass: 33, notes: [54, 60, 64, 69] },
            { bass: 41, notes: [56, 60, 65, 68] }, { bass: 43, notes: [55, 59, 62, 67] }
        ] },
        // brooding, low, cinematic (the trip-hop dark)
        { feel: 'dark', chords: [
            { bass: 33, notes: [52, 57, 60, 64] }, { bass: 33, notes: [52, 55, 60, 63] },
            { bass: 31, notes: [50, 55, 58, 62] }, { bass: 36, notes: [51, 55, 58, 63] },
            { bass: 33, notes: [52, 57, 60, 64] }, { bass: 28, notes: [52, 55, 59, 64] },
            { bass: 31, notes: [50, 55, 58, 63] }, { bass: 33, notes: [52, 56, 59, 64] }
        ] },
        // hazy, wandering maj9/min9 (the woozy dream-lounge)
        { feel: 'dream', chords: [
            { bass: 38, notes: [57, 61, 64, 68] }, { bass: 43, notes: [54, 59, 62, 66] },
            { bass: 36, notes: [55, 59, 62, 67] }, { bass: 40, notes: [56, 59, 63, 66] },
            { bass: 41, notes: [57, 60, 64, 67] }, { bass: 45, notes: [56, 60, 64, 67] },
            { bass: 38, notes: [57, 60, 64, 69] }, { bass: 43, notes: [55, 58, 62, 65] }
        ] }
    ],

    /* The five grooves. Each binds a tempo band, swing, drum + bass
       character, timbre and arrangement — the single biggest lever
       on how a trial sounds, so song-to-song variation is dramatic. */
    MUSIC_STYLES: {
        bounce: {                                     // swung house-funk
            bpm: [98, 112], swing: 0.16, feels: ['soul', 'jazzy', 'bright'],
            pad: { wave: 'sawtooth', bright: 1.12 },
            kick: 'four', backbeat: 'clap', bass: 'funk',
            hatDensity: 0.7, arp: 'sparse', crackle: 'light'
        },
        boombap: {                                    // dusty jazz hip-hop
            bpm: [84, 94], swing: 0.2, feels: ['jazzy', 'soul'],
            pad: { wave: 'triangle', bright: 0.9 },
            kick: 'boombap', backbeat: 'snare', bass: 'upright',
            hatDensity: 0.42, arp: 'glints', crackle: 'heavy'
        },
        progressive: {                                // driving four-on-floor
            bpm: [120, 128], swing: 0, feels: ['bright', 'deep'],
            pad: { wave: 'sawtooth', bright: 1.3 },
            kick: 'four', backbeat: 'none', bass: 'offbeat',
            hatDensity: 0.95, arp: 'driving', crackle: 'light'
        },
        triphop: {                                    // slow, dark, cinematic
            bpm: [73, 86], swing: 0.12, feels: ['dark', 'deep'],
            pad: { wave: 'sawtooth', bright: 0.66 },
            kick: 'halftime', backbeat: 'snare', bass: 'dub',
            hatDensity: 0.3, arp: 'glints', crackle: 'heavy'
        },
        lounge: {                                     // woozy dream-jazz
            bpm: [78, 92], swing: 0.14, feels: ['dream', 'jazzy'],
            pad: { wave: 'triangle', bright: 1.0 }, wobble: true,
            kick: 'soft', backbeat: 'rim', bass: 'sub',
            hatDensity: 0.22, arp: 'vibes', crackle: 'light'
        }
    },

    /* A short, resolved progression for the results coda — peaceful. */
    MUSIC_CODA: [
        { bass: 36, notes: [55, 60, 64, 67] },
        { bass: 41, notes: [57, 60, 65, 69] },
        { bass: 43, notes: [55, 59, 62, 67] },
        { bass: 36, notes: [55, 60, 64, 72] }
    ],

    _midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); },

    /* A fresh seed — every trial a different groove, key, tempo,
       progression and timbre; the results coda resolves calmly. */
    _makeSeed(mood) {
        if (mood === 'results') {
            return {
                mood: 'results', style: null, S: null,
                transpose: this._lastTranspose,
                prog: this.MUSIC_CODA,
                bpm: 64 + Math.floor(Math.random() * 12),     // slow, reflective
                bright: 1.05, padWave: 'triangle',
                swing: 0, section: 6, phaseOffset: 0
            };
        }
        const tr = Math.floor(Math.random() * 11) - 5;        // -5..+5 semitones
        this._lastTranspose = tr;
        // the groove — the biggest lever; avoid repeating the last one
        const keys = Object.keys(this.MUSIC_STYLES);
        let style = keys[Math.floor(Math.random() * keys.length)];
        if (style === this._lastStyle && keys.length > 1) {
            const others = keys.filter(k => k !== this._lastStyle);
            style = others[Math.floor(Math.random() * others.length)];
        }
        this._lastStyle = style;
        const S = this.MUSIC_STYLES[style];
        // a progression whose feel suits the groove
        const pool = this.MUSIC_PROGRESSIONS.filter(p => S.feels.indexOf(p.feel) >= 0);
        const chosen = (pool.length ? pool : this.MUSIC_PROGRESSIONS)[
            Math.floor(Math.random() * (pool.length || this.MUSIC_PROGRESSIONS.length))];
        return {
            mood: 'trial', style: style, S: S,
            transpose: tr,
            prog: chosen.chords,
            bpm: S.bpm[0] + Math.floor(Math.random() * (S.bpm[1] - S.bpm[0] + 1)),
            bright: S.pad.bright * (0.92 + Math.random() * 0.16),
            padWave: S.pad.wave,
            swing: S.swing * (0.85 + Math.random() * 0.3),
            section: 4 + Math.floor(Math.random() * 5),        // 4..8 bars per phase
            phaseOffset: Math.floor(Math.random() * 4)
        };
    },

    _transposeChord(chord, tr) {
        return { bass: chord.bass + tr, notes: chord.notes.map(n => n + tr) };
    },

    /* Begin (or, if already playing, turn to) a fresh trial piece. The
       engine plays continuously across trials and the results screen —
       only the mood / seed change, so it never loops the same song. */
    startMusic() {
        if (!this.enabled) return;
        if (!this.ensureContext()) return;
        if (this.music && this.music.active) {     // already running — re-seed
            this._setMood('trial');
            return;
        }
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
            mood: 'trial', seed: this._makeSeed('trial'),
            nextBarTime: ctx.currentTime + 0.3
        };
        this._musicScheduler();
    },

    /* Turn the running music to a different mood — 'trial' or
       'results' — re-seeded, so each event opens its own piece. */
    musicMood(mood) {
        if (this.music && this.music.active) this._setMood(mood);
    },

    _setMood(mood) {
        const M = this.music;
        if (!M) return;
        M.mood = mood;
        M.seed = this._makeSeed(mood);
        M.barCount = 0;          // a fresh piece — phases from the top
        M.barIndex = 0;
        M.urgency = 0;
        // a brief dip smooths the turn into the new key / tempo
        if (M.gain && this.audioContext) {
            const now = this.audioContext.currentTime;
            M.gain.gain.cancelScheduledValues(now);
            M.gain.gain.setTargetAtTime(this.MUSIC_LEVEL * 0.22, now, 0.18);
            M.gain.gain.setTargetAtTime(this.MUSIC_LEVEL, now + 0.55, 0.5);
        }
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
        const beat = 60 / M.seed.bpm;
        const barDur = beat * 4;
        while (M.nextBarTime < ctx.currentTime + 1.6) {
            const prog = M.seed.prog;
            const chord = this._transposeChord(prog[M.barIndex % prog.length], M.seed.transpose);
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

    /* One bar. The groove (seed.S) decides the character; `drive`
       (energy × fervor) and `urgency` (the glass) shape it on top. */
    _scheduleBar(t0, chord, beat, barCount) {
        const M = this.music;
        // the results coda is its own calm piece
        if (M.mood === 'results') { this._scheduleCodaBar(t0, chord, beat, barCount); return; }

        const S = M.seed.S;
        const energy = this._musicEnergy(barCount);
        const intensity = M.intensity, urgency = M.urgency;
        // overall push — the build, lifted by fervor and by urgency
        const drive = Math.min(1, energy * (0.5 + 0.5 * intensity) + urgency * 0.4);
        const section = M.seed.section || this.MUSIC_SECTION;
        // phase: 0 intro · 1 groove · 2 peak · 3 breakdown
        const phase = (Math.floor(barCount / section) + M.seed.phaseOffset) % 4;
        const sw = M.seed.swing || 0;
        // swing — the offbeats fall late; the soul of bounce / boom-bap
        const eighth = (i) => t0 + i * 0.5 * beat + ((i % 2) ? sw * beat : 0);
        const six    = (i) => t0 + i * 0.25 * beat + ((i % 2) ? sw * 0.5 * beat : 0);

        // groove level: 0 sparse · 1 light · 2 full · 3 peak
        let groove;
        if (phase === 0)      groove = drive > 0.82 ? 1 : 0;
        else if (phase === 1) groove = 2;
        else if (phase === 2) groove = 3;
        else                  groove = drive > 0.7 ? 1 : 0;     // breakdown
        if (urgency > 0.55) groove = Math.max(groove, 2);       // the glass pushes

        // ── PAD — the bed, nearly always present ──
        if (!(phase === 2 && S.arp === 'driving' && Math.random() < 0.35)) {
            const padVel = (0.55 + 0.45 * drive) * (phase === 3 ? 1.2 : 1);
            this._musicPad(t0 + Math.random() * 0.04, chord, beat * 4, padVel);
        }

        // ── DRUMS — the groove's signature kick + hats ──
        this._styleDrums(t0, beat, S, groove, drive, eighth, six);

        // ── BACKBEAT — clap / snare / rim on 2 & 4 ──
        if (groove >= 2 && S.backbeat !== 'none') {
            const v2 = 0.5 * drive, v4 = 0.58 * drive;
            if (S.backbeat === 'clap') {
                this._drumClap(eighth(2), v2); this._drumClap(eighth(6), v4);
            } else if (S.backbeat === 'snare') {
                this._drumSnare(t0 + beat + sw * 0.15 * beat, v2 + 0.12);
                this._drumSnare(t0 + beat * 3 + sw * 0.15 * beat, v4 + 0.12);
            } else if (S.backbeat === 'rim') {
                this._drumRim(t0 + beat, v2 * 0.85); this._drumRim(t0 + beat * 3, v4 * 0.85);
            }
        }

        // ── BASS — the groove's low end ──
        this._styleBass(t0, beat, chord, S, groove, drive, eighth);

        // ── CHORD STABS — offbeat colour in the groove phases ──
        if (groove >= 2 && S.arp !== 'driving') {
            const stabs = groove >= 3 ? [3, 5, 7] : [3, 7];
            for (const s of stabs) {
                if (Math.random() < 0.62) this._dubStab(eighth(s), chord, 0.55 * drive, urgency);
            }
        } else if (groove >= 2) {
            const stabs = groove >= 3 ? [1, 3, 5, 7] : [3, 7];
            for (const s of stabs) {
                if (Math.random() < 0.8) this._dubStab(eighth(s), chord, 0.7 * drive, urgency);
            }
        }

        // ── ARP / MELODY — the groove's top voice ──
        this._styleArp(t0, beat, chord, S, phase, groove, drive, urgency, six);

        // ── URGENCY — a rising tension lift over the last seconds ──
        if (urgency > 0.5 && Math.random() < 0.7) this._tensionSweep(t0, beat * 4, urgency);

        // ── faint crackle texture — heavier for the dusty grooves ──
        const pops = S.crackle === 'heavy'
            ? 4 + Math.floor(Math.random() * 6)
            : 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < pops; i++) this._vinylPop(t0 + Math.random() * beat * 4);
    },

    /* The groove's drums — kick pattern + hats. Each `kick` mode is a
       different feel: four-on-floor, lazy boom-bap, halftime, or soft. */
    _styleDrums(t0, beat, S, groove, drive, eighth, six) {
        if (groove < 1) return;
        const full = groove >= 2;
        const kp = S.kick;
        if (kp === 'four') {
            if (full) {
                for (let b = 0; b < 4; b++) {
                    this._drumKick(t0 + b * beat, groove >= 3 ? 0.95 : 0.8);
                    this._pump(t0 + b * beat, beat);
                }
            } else { this._drumKick(t0, 0.55); this._pump(t0, beat); }
        } else if (kp === 'boombap') {
            this._drumKick(t0, 0.92); this._pump(t0, beat);
            if (full) {
                this._drumKick(t0 + beat * 2.5, 0.68);
                if (Math.random() < 0.5) this._drumKick(t0 + beat * 1.75, 0.5);
                if (groove >= 3 && Math.random() < 0.4) this._drumKick(t0 + beat * 3.5, 0.55);
            }
        } else if (kp === 'halftime') {
            this._drumKick(t0, 0.95); this._pump(t0, beat * 2);
            if (full && Math.random() < 0.55) this._drumKick(t0 + beat * 2.5, 0.58);
        } else { // soft
            this._drumKick(t0, 0.5); this._pump(t0, beat * 2);
            if (full) this._drumKick(t0 + beat * 2, 0.42);
        }
        // hats — offbeat 'tss' + ticking 16ths, scaled by the groove's density
        const hd = S.hatDensity;
        if (hd > 0) {
            for (let i = 1; i < 8; i += 2) {
                if (Math.random() < 0.45 + 0.5 * hd) {
                    this._drumHat(eighth(i), (0.5 + Math.random() * 0.4) * drive, true);
                }
            }
            if (full) {
                for (let i = 0; i < 16; i++) {
                    if (i % 4 === 0) continue;
                    if (Math.random() > hd * (0.55 + 0.45 * drive)) continue;
                    this._drumHat(six(i), 0.3 * drive, false);
                }
            }
        }
    },

    /* The groove's bass — funk pluck, walking upright, offbeat house,
       dub sub-stab, or a slow sub swell. */
    _styleBass(t0, beat, chord, S, groove, drive, eighth) {
        if (groove < 1) { this._subBass(t0, chord.bass, beat * 4); return; }
        const b = S.bass;
        if (b === 'funk') {
            for (const i of [0, 3, 4, 6, 7]) {
                if (Math.random() < 0.82) {
                    const oct = (i === 4 || i === 7) && Math.random() < 0.5 ? 12 : 0;
                    this._funkBass(eighth(i), chord.bass + oct, (0.7 + Math.random() * 0.3) * drive);
                }
            }
        } else if (b === 'upright') {
            this._musicBassNote(t0, chord.bass, 0.95 * drive);
            if (Math.random() < 0.7) this._musicBassNote(t0 + beat * 2, chord.bass + 7, 0.7 * drive);
            if (groove >= 2 && Math.random() < 0.45) {
                this._musicBassNote(t0 + beat * 3.5, chord.bass + (Math.random() < 0.5 ? 5 : -2), 0.55 * drive);
            }
        } else if (b === 'offbeat') {
            for (let q = 0; q < 4; q++) {
                const n = chord.bass + ((q % 2) ? 0 : (Math.random() < 0.4 ? 12 : 0));
                this._musicBassNote(t0 + (q + 0.5) * beat, n, 0.85 * drive);
            }
        } else if (b === 'dub') {
            this._subBass(t0, chord.bass, beat * 4 * (0.9 + Math.random() * 0.3));
            if (groove >= 2) this._musicBassNote(t0 + beat * 2.5, chord.bass, 0.6 * drive);
        } else { // sub
            this._subBass(t0, chord.bass, beat * 4 * (0.95 + Math.random() * 0.3));
            if (Math.random() < 0.35) this._subBass(t0 + beat * 2, chord.bass + 7, beat * 2);
        }
    },

    /* The groove's top voice — driving 16th arp, sparse syncopated
       plucks, vibraphone, or sparse bell glints. */
    _styleArp(t0, beat, chord, S, phase, groove, drive, urgency, six) {
        const arp = this._arpNotes(chord);
        const a = S.arp;
        if (a === 'driving' && (phase === 2 || groove >= 3 || urgency > 0.45)) {
            for (let i = 0; i < 16; i++) {
                if (Math.random() < 0.1) continue;
                this._arpNote(six(i), arp[i % arp.length] + (i >= 8 ? 12 : 0), 0.6 * drive, urgency);
            }
        } else if (a === 'sparse' || (a === 'driving' && groove >= 2)) {
            for (const s of [2, 5, 6, 9, 11, 14]) {
                if (Math.random() < 0.35 + 0.3 * drive) {
                    const midi = arp[Math.floor(Math.random() * arp.length)] + (Math.random() < 0.4 ? 12 : 0);
                    this._arpNote(six(s), midi, 0.5 * drive, urgency);
                }
            }
        } else if (a === 'vibes') {
            const count = 2 + Math.floor(Math.random() * 3);
            for (let k = 0; k < count; k++) {
                this._vibesNote(t0 + Math.random() * beat * 4,
                    arp[Math.floor(Math.random() * arp.length)] + 12, 0.5 + Math.random() * 0.4);
            }
        } else { // glints
            const count = 1 + Math.floor(Math.random() * 4);
            for (let k = 0; k < count; k++) {
                this._musicBell(t0 + Math.random() * beat * 4,
                    arp[Math.floor(Math.random() * arp.length)] + 12, 0.55 + Math.random() * 0.4);
            }
        }
        // the glass emptying drags a driving arp in over any groove
        if (urgency > 0.6 && a !== 'driving') {
            for (let i = 0; i < 16; i += 2) {
                if (Math.random() < 0.4) this._arpNote(six(i), arp[i % arp.length] + 12, 0.4 * urgency, urgency);
            }
        }
    },

    /* The results coda — a calm, resolved piece for the post-summary.
       No beat to speak of: lush pads, a soft sub, sparse bell glints —
       a breath, distinct from the trial's drive. */
    _scheduleCodaBar(t0, chord, beat, barCount) {
        this._musicPad(t0 + Math.random() * 0.05, chord, beat * 4, 0.95);
        this._subBass(t0, chord.bass, beat * 4 * (0.95 + Math.random() * 0.3));
        const arp = this._arpNotes(chord);
        const glints = 1 + Math.floor(Math.random() * 3);
        for (let k = 0; k < glints; k++) {
            this._musicBell(t0 + Math.random() * beat * 4,
                            arp[Math.floor(Math.random() * arp.length)] + 12,
                            0.5 + Math.random() * 0.3);
        }
        // a faint heartbeat once the coda settles
        if (barCount > 1 && Math.random() < 0.5) this._drumKick(t0, 0.3);
        if (Math.random() < 0.55) this._vinylPop(t0 + Math.random() * beat * 4);
    },

    /* A lush detuned-saw pad — slow swell, slowly-opening filter.
       Routes through the sidechain bus so it breathes with the kick. */
    _musicPad(t, chord, dur, vel) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const bright = (M.seed && M.seed.bright) || 1;        // per-trial timbre
        const wave = (M.seed && M.seed.padWave) || 'sawtooth';
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime((540 + vel * 800) * bright, t);
        lp.frequency.linearRampToValueAtTime((700 + vel * 1300) * bright, t + dur * 0.6);
        lp.Q.value = 0.4;
        lp.connect(M.pump);
        // tape wobble — a slow shared pitch drift; the lounge groove's
        // woozy, just-off-true haze. One LFO feeds every voice's detune.
        let wob = null;
        if (M.seed && M.seed.S && M.seed.S.wobble) {
            const lfo = ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.value = 0.6 + Math.random() * 0.5;
            wob = ctx.createGain();
            wob.gain.value = 9 + Math.random() * 8;           // cents of drift
            lfo.connect(wob);
            lfo.start(t);
            lfo.stop(t + dur + 1.8);
        }
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
                o.type = wave;
                o.frequency.value = f;
                o.detune.value = d * (8 + Math.random() * 7);
                if (wob) wob.connect(o.detune);
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

    /* A house clap — three micro-bursts of band-passed noise smeared
       over ~25ms, then a longer tail; the snap of the bounce groove. */
    _drumClap(t, vel) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const offs = [0, 0.007, 0.015, 0.027];
        for (let k = 0; k < offs.length; k++) {
            const tt = t + offs[k];
            const last = k === offs.length - 1;
            const dur = last ? 0.13 : 0.028;
            const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
            const buf = ctx.createBuffer(1, len, ctx.sampleRate);
            const d = buf.getChannelData(0);
            for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
            const src = ctx.createBufferSource();
            src.buffer = buf;
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.value = 1500 + Math.random() * 420;
            bp.Q.value = 1.1;
            const g = ctx.createGain();
            const peak = (last ? 0.16 : 0.1) * vel;
            g.gain.setValueAtTime(0.0001, tt);
            g.gain.linearRampToValueAtTime(peak, tt + 0.003);
            g.gain.exponentialRampToValueAtTime(0.0001, tt + dur);
            src.connect(bp);
            bp.connect(g);
            g.connect(M.gain);
            src.start(tt);
            src.stop(tt + dur + 0.02);
        }
    },

    /* A soft rim / woodblock click — a quick pitched tick. */
    _drumRim(t, vel) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.setValueAtTime(440, t);
        o.frequency.exponentialRampToValueAtTime(210, t + 0.04);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t);
        g.gain.linearRampToValueAtTime(0.12 * vel, t + 0.003);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);
        o.connect(g);
        g.connect(M.gain);
        o.start(t);
        o.stop(t + 0.09);
    },

    /* A plucky, resonant filtered-saw funk bass — saw + square through
       a fast-decaying resonant lowpass; the snap of the bounce line. */
    _funkBass(t, midi, vel) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(1300 + 900 * vel, t);
        lp.frequency.exponentialRampToValueAtTime(255, t + 0.18);
        lp.Q.value = 6;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.3 * vel, t + 0.012);
        env.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
        lp.connect(env);
        env.connect(M.gain);
        const f = this._midiToFreq(midi);
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = f;
        const o2 = ctx.createOscillator();
        o2.type = 'square';
        o2.frequency.value = f;
        o2.detune.value = -6;
        const o2g = ctx.createGain();
        o2g.gain.value = 0.4;
        o.connect(lp);
        o2.connect(o2g);
        o2g.connect(lp);
        o.start(t);
        o2.start(t);
        o.stop(t + 0.3);
        o2.stop(t + 0.3);
    },

    /* A vibraphone note — a sine with a soft inharmonic partial and a
       gentle tremolo; the woozy lounge groove's melody voice. */
    _vibesNote(t, midi, vel) {
        const ctx = this.audioContext, M = this.music;
        if (!M) return;
        const f = this._midiToFreq(midi);
        const dur = 1.4 + Math.random() * 0.8;
        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, t);
        env.gain.linearRampToValueAtTime(0.07 * vel, t + 0.012);
        env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        // tremolo — the vibraphone's shimmer
        const trem = ctx.createGain();
        trem.gain.value = 1.0;
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 4.8 + Math.random() * 1.2;
        const lfoG = ctx.createGain();
        lfoG.gain.value = 0.26;
        lfo.connect(lfoG);
        lfoG.connect(trem.gain);
        env.connect(trem);
        trem.connect(M.pump);
        const o1 = ctx.createOscillator();
        o1.type = 'sine';
        o1.frequency.value = f;
        o1.connect(env);
        const o2 = ctx.createOscillator();
        o2.type = 'sine';
        o2.frequency.value = f * 3.99;
        const o2g = ctx.createGain();
        o2g.gain.value = 0.16;
        o2.connect(o2g);
        o2g.connect(env);
        lfo.start(t);
        o1.start(t);
        o2.start(t);
        lfo.stop(t + dur + 0.1);
        o1.stop(t + dur + 0.1);
        o2.stop(t + dur + 0.1);
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

