/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Storage System
   Persistent data management for stats and settings
   ═══════════════════════════════════════════════════════════ */

const Storage = {
    KEYS: {
        SETTINGS: 'typeflux_settings',
        TESTS: 'typeflux_tests',
        STATS: 'typeflux_stats',
        ACHIEVEMENTS: 'typeflux_achievements',
        GHOSTS: 'typeflux_ghosts',
        MISSES: 'typeflux_misses',
        NEMHITS: 'typeflux_nemhits',
        COMMISSIONS: 'typeflux_commissions'
    },

    // The rank ladder — a persistent title the typewright carries,
    // raised by trials weathered and the crest of pace reached. Each
    // rank requires BOTH a trial count and a best-WPM mark.
    RANKS: [
        { name: 'Apprentice of the Desk', motto: 'the first nib is cut',         trials: 0,   wpm: 0   },
        { name: 'Scrivener',              motto: 'a steady hand at the page',    trials: 10,  wpm: 40  },
        { name: 'Copyist',                motto: 'the ledger fills by thy hand', trials: 30,  wpm: 60  },
        { name: 'Cartographer',           motto: 'thou mappest the whole field', trials: 75,  wpm: 80  },
        { name: 'Master Typewright',      motto: 'the press answers thy will',   trials: 150, wpm: 100 },
        { name: 'Grand Archivist',        motto: 'keeper of every glass run',    trials: 300, wpm: 120 }
    ],

    // Default settings
    defaultSettings: {
        theme: 'midnight',
        fontSize: 24,
        smoothCaret: true,
        showLiveWpm: true,
        soundEffects: true,
        soundVolume: 30,
        music: true,
        musicVolume: 60,
        stopOnError: false,
        confidenceMode: false,
        blindMode: false,
        readyCountdown: true,
        affMist: false,
        affFade: false,
        affLantern: false,
        affNarrow: false,
        affCramped: false,
        affGutter: false,
        affFoxed: false,
        affHeavy: false,
        ghostTracer: true,
        ambientEffects: true,
        ambientIntensity: 60,
        lite: false,
        liteChosen: false,
        boundBy: 'time',
        passageBound: 'passage',
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

    // ─────────────────────────────────────────────────────────────
    // Ghosts — your best run for each (mode/count/time) bucket.
    // Stored as { wpm, words[], wordTimes[] } where wordTimes[i] is
    // the elapsed-ms at which word i was completed in that run.
    // The next time you start a trial in the same bucket, the ghost
    // replays at the same pace as a translucent cursor.
    // ─────────────────────────────────────────────────────────────
    /* A ghost bucket key. Words split time/count; the passage modes
       split timed-duration from untimed — so a ghost only ever races
       a comparable run. Uniform across modes. */
    ghostKey(mode, a, b) {
        return `${mode}:${a || 0}@${b || 0}`;
    },

    getGhost(mode, wordCount, timeLimit) {
        try {
            const data = localStorage.getItem(this.KEYS.GHOSTS);
            const all = data ? JSON.parse(data) : {};
            return all[this.ghostKey(mode, wordCount, timeLimit)] || null;
        } catch (e) { return null; }
    },

    /* Save the run if it beats the current best for this bucket. Returns
       true if the ghost was updated. */
    maybeSaveGhost(mode, wordCount, timeLimit, run) {
        try {
            const data = localStorage.getItem(this.KEYS.GHOSTS);
            const all = data ? JSON.parse(data) : {};
            const key = this.ghostKey(mode, wordCount, timeLimit);
            const cur = all[key];
            if (cur && cur.wpm >= run.wpm) return false;
            all[key] = run;
            localStorage.setItem(this.KEYS.GHOSTS, JSON.stringify(all));
            return true;
        } catch (e) { return false; }
    },

    clearGhosts() {
        try { localStorage.removeItem(this.KEYS.GHOSTS); } catch (e) {}
    },

    // ─────────────────────────────────────────────────────────────
    // Rank — derived purely from career stats, never stored.
    // ─────────────────────────────────────────────────────────────
    getRank(stats) {
        const s = stats || this.getStats() || this.getDefaultStats();
        const trials = s.testsCompleted || 0;
        const wpm = s.bestWpm || 0;
        let idx = 0;
        this.RANKS.forEach((r, i) => {
            if (trials >= r.trials && wpm >= r.wpm) idx = i;
        });
        return { ...this.RANKS[idx], index: idx, next: this.RANKS[idx + 1] || null };
    },

    // ─────────────────────────────────────────────────────────────
    // Misses — a cumulative tally of every word the hand has faltered
    // on, across all trials. The nemesis is simply the word with the
    // most falls to its name.
    // ─────────────────────────────────────────────────────────────
    getMisses() {
        try {
            const data = localStorage.getItem(this.KEYS.MISSES);
            return data ? JSON.parse(data) : {};
        } catch (e) { return {}; }
    },

    /* Merge one trial's per-word miss tally into the lifetime record. */
    recordMisses(missMap) {
        if (!missMap || typeof missMap !== 'object') return;
        try {
            const all = this.getMisses();
            for (const [word, n] of Object.entries(missMap)) {
                if (!word || !n) continue;
                all[word] = (all[word] || 0) + n;
            }
            localStorage.setItem(this.KEYS.MISSES, JSON.stringify(all));
        } catch (e) {}
    },

    /* The word that has felled the hand most. null until one is named. */
    getNemesis() {
        const all = this.getMisses();
        let word = null, count = 0;
        for (const [w, n] of Object.entries(all)) {
            if (n > count) { word = w; count = n; }
        }
        return word ? { word, count } : null;
    },

    clearMisses() {
        try {
            localStorage.removeItem(this.KEYS.MISSES);
            localStorage.removeItem(this.KEYS.NEMHITS);
        } catch (e) {}
    },

    // ─────────────────────────────────────────────────────────────
    // The nemesis arc — clean strikes against the reigning foe.
    // Land enough and the word is vanquished: struck from the misses
    // entirely, so the next-worst word rises to take its place.
    // ─────────────────────────────────────────────────────────────
    VANQUISH_AT: 5,

    getNemHits() {
        try {
            const data = localStorage.getItem(this.KEYS.NEMHITS);
            return data ? JSON.parse(data) : {};
        } catch (e) { return {}; }
    },

    /* Credit clean completions of `word`; vanquish it at the threshold.
       Returns { vanquished, word, hits, threshold }. */
    recordNemesisProgress(word, cleanHits) {
        if (!word || !cleanHits || cleanHits <= 0) return { vanquished: false };
        const hits = this.getNemHits();
        hits[word] = (hits[word] || 0) + cleanHits;

        if (hits[word] >= this.VANQUISH_AT) {
            const misses = this.getMisses();
            delete misses[word];
            delete hits[word];
            try {
                localStorage.setItem(this.KEYS.MISSES, JSON.stringify(misses));
                localStorage.setItem(this.KEYS.NEMHITS, JSON.stringify(hits));
            } catch (e) {}
            return { vanquished: true, word };
        }
        try { localStorage.setItem(this.KEYS.NEMHITS, JSON.stringify(hits)); } catch (e) {}
        return { vanquished: false, word, hits: hits[word], threshold: this.VANQUISH_AT };
    },

    /* The reigning nemesis plus the clean strikes landed against it. */
    getNemesisState() {
        const nem = this.getNemesis();
        if (!nem) return null;
        const hits = this.getNemHits();
        return {
            word: nem.word,
            count: nem.count,
            hits: hits[nem.word] || 0,
            threshold: this.VANQUISH_AT
        };
    },

    // ─────────────────────────────────────────────────────────────
    // Commissions — the day's three charges. Stored with the day key
    // they were drawn for; reading on a new day re-draws them.
    // ─────────────────────────────────────────────────────────────
    todayKey() {
        const d = new Date();
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    },

    getCommissions() {
        const today = this.todayKey();
        let state = null;
        try {
            const data = localStorage.getItem(this.KEYS.COMMISSIONS);
            state = data ? JSON.parse(data) : null;
        } catch (e) { state = null; }

        // Fresh draw on a new day (or first ever).
        if (!state || state.day !== today || !Array.isArray(state.items)) {
            const ids = Commissions.pickForDay(today);
            state = { day: today, items: ids.map(id => ({ id, progress: 0, done: false })) };
            this.saveCommissions(state);
        }
        return state;
    },

    saveCommissions(state) {
        try {
            localStorage.setItem(this.KEYS.COMMISSIONS, JSON.stringify(state));
            return true;
        } catch (e) { return false; }
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
            localStorage.removeItem(this.KEYS.GHOSTS);
            localStorage.removeItem(this.KEYS.MISSES);
            localStorage.removeItem(this.KEYS.NEMHITS);
            localStorage.removeItem(this.KEYS.COMMISSIONS);
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
        this.clearMisses();
    },

    /* The vault — full snapshot of everything localStorage holds for
       typeflux. Versioned so the importer can refuse archives shaped
       like a future schema. */
    exportData() {
        let ghosts = {};
        try { ghosts = JSON.parse(localStorage.getItem(this.KEYS.GHOSTS) || '{}'); } catch (e) {}
        return {
            format: 'typeflux-ledger',
            version: 1,
            exportedAt: new Date().toISOString(),
            settings: this.getSettings(),
            tests: this.getTests() || [],
            stats: this.getStats() || this.getDefaultStats(),
            achievements: this.getAchievementState(),
            ghosts,
            misses: this.getMisses(),
            nemhits: this.getNemHits()
        };
    },

    /* Replace mode — wipes current state, writes the archive's state
       in. Returns { ok, error } so the UI can report cleanly. */
    importData(data) {
        try {
            if (!data || typeof data !== 'object') {
                return { ok: false, error: 'not a ledger' };
            }
            if (data.format && data.format !== 'typeflux-ledger') {
                return { ok: false, error: 'wrong format' };
            }
            if (data.version && data.version > 1) {
                return { ok: false, error: 'newer ledger than this edition reads' };
            }
            if (data.settings) this.saveSettings({ ...this.defaultSettings, ...data.settings });
            if (Array.isArray(data.tests)) this.saveTests(data.tests);
            if (data.stats && typeof data.stats === 'object') this.saveStats(data.stats);
            if (data.achievements && typeof data.achievements === 'object') {
                this.saveAchievementState({ ...this.defaultAchievementState(), ...data.achievements });
            }
            if (data.ghosts && typeof data.ghosts === 'object') {
                try { localStorage.setItem(this.KEYS.GHOSTS, JSON.stringify(data.ghosts)); } catch (e) {}
            }
            if (data.misses && typeof data.misses === 'object') {
                try { localStorage.setItem(this.KEYS.MISSES, JSON.stringify(data.misses)); } catch (e) {}
            } else {
                this.clearMisses();
            }
            if (data.nemhits && typeof data.nemhits === 'object') {
                try { localStorage.setItem(this.KEYS.NEMHITS, JSON.stringify(data.nemhits)); } catch (e) {}
            }
            return { ok: true };
        } catch (e) {
            console.error('Error importing data:', e);
            return { ok: false, error: 'the ledger was unreadable' };
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

