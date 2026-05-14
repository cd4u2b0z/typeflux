/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Storage System
   Persistent data management for stats and settings
   ═══════════════════════════════════════════════════════════ */

const Storage = {
    KEYS: {
        SETTINGS: 'typeflux_settings',
        TESTS: 'typeflux_tests',
        STATS: 'typeflux_stats'
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

    clearAll() {
        try {
            localStorage.removeItem(this.KEYS.SETTINGS);
            localStorage.removeItem(this.KEYS.TESTS);
            localStorage.removeItem(this.KEYS.STATS);
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

