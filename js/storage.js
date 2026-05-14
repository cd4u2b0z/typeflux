/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Storage System
   Persistent data management for stats and settings
   ═══════════════════════════════════════════════════════════ */

const Storage = {
    KEYS: {
        SETTINGS: 'typeflux_settings',
        TESTS: 'typeflux_tests',
        STATS: 'typeflux_stats',
        ACHIEVEMENTS: 'typeflux_achievements'
    },

    // Default settings
    defaultSettings: {
        theme: 'midnight',
        fontSize: 24,
        smoothCaret: true,
        showLiveWpm: true,
        soundEffects: true,
        soundVolume: 30,
        stopOnError: false,
        confidenceMode: false,
        blindMode: false,
        readyCountdown: true,
        defaultMode: 'words',
        defaultTime: 30,
        defaultWords: 25
    },

    // Initialize storage
    init() {
        // Ensure settings exist
        if (!this.getSettings()) {
            this.saveSettings(this.defaultSettings);
        }
        
        // Ensure tests array exists
        if (!this.getTests()) {
            this.saveTests([]);
        }
        
        // Ensure stats exist
        if (!this.getStats()) {
            this.saveStats(this.getDefaultStats());
        }

        // Ensure achievement state exists; backfill modes from history.
        if (!localStorage.getItem(this.KEYS.ACHIEVEMENTS)) {
            this.saveAchievementState(this.defaultAchievementState());
        }
        this.backfillFromHistory();
    },

    // Default stats structure
    getDefaultStats() {
        return {
            testsCompleted: 0,
            totalTime: 0,
            totalWords: 0,
            totalCharacters: 0,
            bestWpm: 0,
            bestAccuracy: 0,
            averageWpm: 0,
            averageAccuracy: 0,
            longestStreak: 0,
            maxCombo: 0
        };
    },

    // ─────────────────────────────────────────────────────────────
    // Settings
    // ─────────────────────────────────────────────────────────────
    
    getSettings() {
        try {
            const data = localStorage.getItem(this.KEYS.SETTINGS);
            return { ...this.defaultSettings, ...(data ? JSON.parse(data) : {}) };
        } catch (e) {
            console.error('Error reading settings:', e);
            return { ...this.defaultSettings };
        }
    },

    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Error saving settings:', e);
            return false;
        }
    },

    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.saveSettings(settings);
    },

    // ─────────────────────────────────────────────────────────────
    // Tests History
    // ─────────────────────────────────────────────────────────────
    
    getTests() {
        try {
            const data = localStorage.getItem(this.KEYS.TESTS);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading tests:', e);
            return [];
        }
    },

    saveTests(tests) {
        try {
            // Keep only last 100 tests
            const trimmed = tests.slice(-100);
            localStorage.setItem(this.KEYS.TESTS, JSON.stringify(trimmed));
            return true;
        } catch (e) {
            console.error('Error saving tests:', e);
            return false;
        }
    },

    addTest(test) {
        const tests = this.getTests() || [];
        tests.push({
            ...test,
            timestamp: Date.now(),
            id: this.generateId()
        });
        this.saveTests(tests);
        this.updateStats(test);
        return tests[tests.length - 1];
    },

    // ─────────────────────────────────────────────────────────────
    // Statistics
    // ─────────────────────────────────────────────────────────────
    
    getStats() {
        try {
            const data = localStorage.getItem(this.KEYS.STATS);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading stats:', e);
            return this.getDefaultStats();
        }
    },

    saveStats(stats) {
        try {
            localStorage.setItem(this.KEYS.STATS, JSON.stringify(stats));
            return true;
        } catch (e) {
            console.error('Error saving stats:', e);
            return false;
        }
    },

    updateStats(test) {
        const stats = this.getStats() || this.getDefaultStats();
        const tests = this.getTests() || [];
        
        stats.testsCompleted++;
        stats.totalTime += test.time;
        stats.totalWords += test.words;
        stats.totalCharacters += test.characters.correct + test.characters.incorrect;
        
        if (test.wpm > stats.bestWpm) {
            stats.bestWpm = test.wpm;
        }
        
        if (test.accuracy > stats.bestAccuracy) {
            stats.bestAccuracy = test.accuracy;
        }
        
        if (test.maxCombo > stats.maxCombo) {
            stats.maxCombo = test.maxCombo;
        }
        
        // Calculate averages from tests
        if (tests.length > 0) {
            stats.averageWpm = Math.round(tests.reduce((sum, t) => sum + t.wpm, 0) / tests.length);
            stats.averageAccuracy = Math.round(tests.reduce((sum, t) => sum + t.accuracy, 0) / tests.length);
        }
        
        this.saveStats(stats);
        return stats;
    },

    // ─────────────────────────────────────────────────────────────
    // Utility Functions
    // ─────────────────────────────────────────────────────────────
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    },

    // ─────────────────────────────────────────────────────────────
    // Achievements — { unlocked: {id: ts}, themesUsed, languagesUsed, modesUsed }
    // ─────────────────────────────────────────────────────────────

    defaultAchievementState() {
        return {
            unlocked: {},
            themesUsed: [],
            languagesUsed: [],
            modesUsed: []
        };
    },

    getAchievementState() {
        try {
            const data = localStorage.getItem(this.KEYS.ACHIEVEMENTS);
            const parsed = data ? JSON.parse(data) : null;
            return { ...this.defaultAchievementState(), ...(parsed || {}) };
        } catch (e) {
            console.error('Error reading achievements:', e);
            return this.defaultAchievementState();
        }
    },

    saveAchievementState(state) {
        try {
            localStorage.setItem(this.KEYS.ACHIEVEMENTS, JSON.stringify(state));
            return true;
        } catch (e) {
            console.error('Error saving achievements:', e);
            return false;
        }
    },

    _addToSet(state, key, value) {
        if (!value) return state;
        if (!state[key]) state[key] = [];
        if (!state[key].includes(value)) state[key].push(value);
        return state;
    },

    markThemeUsed(theme) {
        const s = this.getAchievementState();
        this._addToSet(s, 'themesUsed', theme);
        this.saveAchievementState(s);
    },

    markLanguageUsed(lang) {
        if (!lang) return;
        const s = this.getAchievementState();
        this._addToSet(s, 'languagesUsed', lang);
        this.saveAchievementState(s);
    },

    markModeUsed(mode) {
        if (!mode) return;
        const s = this.getAchievementState();
        this._addToSet(s, 'modesUsed', mode);
        this.saveAchievementState(s);
    },

    /* Returns true if newly unlocked, false if already had it */
    unlockAchievement(id) {
        const s = this.getAchievementState();
        if (s.unlocked[id]) return false;
        s.unlocked[id] = Date.now();
        this.saveAchievementState(s);
        return true;
    },

    /* On startup, backfill modesUsed from existing test history so users
       upgrading from a pre-achievement build don't have to redo tests
       in modes they've already played. Languages aren't in test records
       so they only accumulate from this point forward. */
    backfillFromHistory() {
        const tests = this.getTests() || [];
        if (tests.length === 0) return;
        const s = this.getAchievementState();
        let changed = false;
        for (const t of tests) {
            if (t.mode && !s.modesUsed.includes(t.mode)) {
                s.modesUsed.push(t.mode);
                changed = true;
            }
        }
        if (changed) this.saveAchievementState(s);
    },

    // Daily streak: count consecutive local days ending at today (or yesterday
    // if today has no test yet) on which the user completed at least one trial.
    getStreak() {
        const tests = this.getTests() || [];
        if (tests.length === 0) return 0;

        // Set of local-day keys (YYYY-MM-DD) on which a test was completed
        const dayKey = (ts) => {
            const d = new Date(ts);
            return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        };
        const days = new Set(tests.map(t => dayKey(t.timestamp)));

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // Anchor: today if there's a test today, else yesterday if there is
        // one yesterday, else the streak is broken.
        let cursor;
        if (days.has(dayKey(today.getTime()))) {
            cursor = today;
        } else if (days.has(dayKey(yesterday.getTime()))) {
            cursor = yesterday;
        } else {
            return 0;
        }

        let streak = 0;
        while (days.has(dayKey(cursor.getTime()))) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        }
        return streak;
    },

    clearAll() {
        try {
            localStorage.removeItem(this.KEYS.SETTINGS);
            localStorage.removeItem(this.KEYS.TESTS);
            localStorage.removeItem(this.KEYS.STATS);
            localStorage.removeItem(this.KEYS.ACHIEVEMENTS);
            this.init();
            return true;
        } catch (e) {
            console.error('Error clearing data:', e);
            return false;
        }
    },

    clearTests() {
        this.saveTests([]);
        this.saveStats(this.getDefaultStats());
    },

    exportData() {
        return {
            settings: this.getSettings(),
            tests: this.getTests(),
            stats: this.getStats(),
            exportedAt: new Date().toISOString()
        };
    },

    importData(data) {
        try {
            if (data.settings) this.saveSettings(data.settings);
            if (data.tests) this.saveTests(data.tests);
            if (data.stats) this.saveStats(data.stats);
            return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    },

    // Format time for display
    formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    },

    // Format date for display
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
};

// Initialize on load
Storage.init();

