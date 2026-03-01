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

    // Keystroke sound - satisfying click
    keystroke() {
        if (!this.enabled) return;
        this.ensureContext();

        // Mechanical keyboard-like sound
        const baseFreq = 800 + Math.random() * 200;
        this.playTone(baseFreq, 0.03, 'square', 0.15);
        
        // Add subtle high-frequency click
        setTimeout(() => {
            this.playTone(2000 + Math.random() * 500, 0.015, 'sine', 0.08);
        }, 5);
    },

    // Space bar - deeper thud
    space() {
        if (!this.enabled) return;
        this.ensureContext();

        this.playTone(300, 0.04, 'sine', 0.2);
        this.playTone(150, 0.05, 'triangle', 0.15);
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

    // UI click sound
    click() {
        if (!this.enabled) return;
        this.ensureContext();

        this.playTone(1000, 0.02, 'sine', 0.1);
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
    }
};

export { SoundSystem };
