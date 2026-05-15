/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Main Application
   Flow state typing experience
   ═══════════════════════════════════════════════════════════ */


class TypeFlux {
    constructor() {
        // State
        this.mode = 'words';
        this.timeLimit = 30;
        this.wordCount = 25;
        // How a `words` trial is bounded: 'time' (countdown glass) or
        // 'count' (fixed number of words, glass counts up). Picking a
        // Glass duration sets 'time'; picking a Count sets 'count'.
        this.boundBy = 'time';
        this.isActive = false;
        this.isPaused = false;
        this.isFinished = false;
        
        // Session-only state (resets on page load)
        this.sessionBlazes = 0;
        this._blazeArmed = true;

        // The sitting — this visit's shape, held only in memory.
        this.sitting = { trials: 0, wpmSum: 0 };

        // Medals — per-trial dopamine, like arcade callouts
        this.perfectStreak = 0;
        this.wordErrorsThisWord = 0;
        this.lastWordCompletedAt = 0;
        this.medalCooldowns = {};
        this.medalsSeenInTest = new Set();
        this.crescendoFired = false;
        this.zenithFired = false;

        // Honours of the trial — collected per-trial for the post-summary
        this.medalsEarnedThisTest = [];
        this.sealsEarnedThisTest = [];

        // Stumble tracking — per-word miss tally for the cert defect panel
        this.wordMisses = {};

        // Ghost-run state — pace of thy past best for this format,
        // replayed during the live trial as a translucent rival.
        this.ghost = null;          // { wpm, words[], wordTimes[] } from Storage
        this.ghostWordIndex = 0;    // which ghost-word the ghost is "currently typing"
        this.ghostRaf = null;
        // Per-word completion timestamps for the LIVE run, captured to save
        // as the new ghost if this run beats the bucket's best.
        this.runWordTimes = [];

        // Test data
        this.words = [];
        this.currentWordIndex = 0;
        this.currentLetterIndex = 0;
        this.input = '';
        this.startTime = null;
        this.endTime = null;
        this.timer = null;
        this.timerValue = 0;
        
        // Stats
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.totalKeystrokes = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.wpmHistory = [];
        this.rawWpmHistory = [];

        // Scroll & code mode
        this.scrollOffset = 0;
        this.lineBreaks = new Set();
        
        // Settings
        this.settings = Storage.getSettings();
        
        // DOM Elements
        this.elements = {};
        
        // Initialize
        this.init();
    }

    // ─────────────────────────────────────────────────────────────
    // Initialization
    // ─────────────────────────────────────────────────────────────
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.applySettings();
        this.generateTest();
        this.updateStatsView();

        // Focus input on load
        setTimeout(() => this.elements.hiddenInput.focus(), 100);

        // Greet the returning typewright once the desk has settled.
        setTimeout(() => this.showToast(this.returningGreeting(), 'info'), 700);
    }

    cacheElements() {
        this.elements = {
            // Views
            viewTest: document.getElementById('view-test'),
            viewResults: document.getElementById('view-results'),
            viewStats: document.getElementById('view-stats'),
            viewSettings: document.getElementById('view-settings'),
            
            // Test elements
            wordsDisplay: document.getElementById('words-display'),
            hiddenInput: document.getElementById('hidden-input'),
            cursor: document.getElementById('cursor'),
            cursorTrails: document.querySelectorAll('.cursor-trail'),
            typingArea: document.querySelector('.typing-area'),
            vellumFrame: document.querySelector('.vellum-frame'),
            countdown: document.getElementById('countdown'),
            countdownNumeral: document.getElementById('countdown-numeral'),
            certificate: document.querySelector('.certificate'),
            pbRibbon: document.getElementById('pb-ribbon'),
            confettiLayer: document.getElementById('confetti-layer'),
            certTip: document.getElementById('cert-tip'),
            certTipLang: document.getElementById('cert-tip-lang'),
            certTipBody: document.getElementById('cert-tip-body'),
            statsStreak: document.getElementById('stats-streak'),
            matrixCanvas: document.getElementById('matrix-rain'),
            chronicles: document.getElementById('chronicles'),
            chroniclesCount: document.getElementById('chronicles-count'),
            stampStack: document.getElementById('stamp-stack'),
            medalStack: document.getElementById('medal-stack'),
            
            // Live stats
            liveWpm: document.getElementById('live-wpm'),
            liveAccuracy: document.getElementById('live-accuracy'),
            liveTimer: document.getElementById('live-timer'),
            liveStats: document.querySelector('.live-stats'),
            
            // Combo
            comboDisplay: document.getElementById('combo-display'),
            comboCount: document.querySelector('.combo-count'),
            
            // Results
            resultWpm: document.getElementById('result-wpm'),
            resultAccuracy: document.getElementById('result-accuracy'),
            resultRaw: document.getElementById('result-raw'),
            resultChars: document.getElementById('result-chars'),
            resultConsistency: document.getElementById('result-consistency'),
            resultTime: document.getElementById('result-time'),
            resultCombo: document.getElementById('result-combo'),
            resultType: document.getElementById('result-type'),
            resultGrade: document.getElementById('results-grade'),
            wpmChart: document.getElementById('wpm-chart'),
            
            // Stats view
            statsTests: document.getElementById('stats-tests'),
            statsBest: document.getElementById('stats-best'),
            statsAvg: document.getElementById('stats-avg'),
            statsTime: document.getElementById('stats-time'),
            testsList: document.getElementById('tests-list'),
            historyChart: document.getElementById('history-chart'),
            
            // Buttons
            restartBtn: document.getElementById('restart-btn'),
            shareBtn: document.getElementById('share-btn'),
            clearStats: document.getElementById('clear-stats'),
            themeToggle: document.getElementById('theme-toggle'),
            soundToggle: document.getElementById('sound-toggle'),
            
            // Settings
            themeSelector: document.getElementById('theme-selector'),
            fontSize: document.getElementById('font-size'),
            fontSizeValue: document.getElementById('font-size-value'),
            smoothCaret: document.getElementById('smooth-caret'),
            showLiveWpm: document.getElementById('show-live-wpm'),
            soundEffects: document.getElementById('sound-effects'),
            soundVolume: document.getElementById('sound-volume'),
            soundVolumeValue: document.getElementById('sound-volume-value'),
            stopOnError: document.getElementById('stop-on-error'),
            confidenceMode: document.getElementById('confidence-mode'),
            blindMode: document.getElementById('blind-mode'),
            readyCountdown: document.getElementById('ready-countdown'),
            affMist: document.getElementById('aff-mist'),
            affFade: document.getElementById('aff-fade'),
            affLantern: document.getElementById('aff-lantern'),
            affNarrow: document.getElementById('aff-narrow'),

            ambientEffects: document.getElementById('ambient-effects'),
            ambientIntensity: document.getElementById('ambient-intensity'),
            ambientIntensityValue: document.getElementById('ambient-intensity-value'),

            // The vault — export / import
            exportData: document.getElementById('export-data'),
            importData: document.getElementById('import-data'),
            importFile: document.getElementById('import-file'),

            // Honours of the trial
            certHonours: document.getElementById('cert-honours'),
            honoursGrid: document.getElementById('honours-grid'),

            // Stumble panel
            certStumble:    document.getElementById('cert-stumble'),
            stumbleList:    document.getElementById('stumble-list'),
            stumbleCounsel: document.getElementById('stumble-counsel'),

            // Ghost cursor + type-next hint
            ghostCursor: document.getElementById('ghost-cursor'),
            ghostWpm:    document.getElementById('ghost-wpm'),
            typeNext:    document.getElementById('type-next'),
            typeNextBody: document.getElementById('type-next-body'),

            // Restart tease — the reason the hand returns
            restartLabel: document.getElementById('restart-label'),

            // The typewright — persistent rank + nemesis
            deviceRank:    document.getElementById('device-rank'),
            rankName:      document.getElementById('rank-name'),
            rankMotto:     document.getElementById('rank-motto'),
            rankBarFill:   document.getElementById('rank-bar-fill'),
            rankNext:      document.getElementById('rank-next'),
            rankSeal:        document.getElementById('rank-seal'),
            rankSealNumeral: document.getElementById('rank-seal-numeral'),

            // Commissions — the day's goals
            commissionsList:  document.getElementById('commissions-list'),
            commissionsCount: document.getElementById('commissions-count'),
            certSitting:      document.getElementById('cert-sitting'),

            nemesisPlate:  document.getElementById('nemesis-plate'),
            nemesisWord:   document.getElementById('nemesis-word'),
            nemesisCount:  document.getElementById('nemesis-count'),
            nemesisSettle: document.getElementById('nemesis-settle'),

            // Toast
            toastContainer: document.getElementById('toast-container')
        };
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });
        
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setMode(e.target.dataset.mode));
        });
        
        // Time selection
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setTime(parseInt(e.target.dataset.time)));
        });
        
        // Word count selection
        document.querySelectorAll('.word-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setWordCount(parseInt(e.target.dataset.words)));
        });
        
        // Typing area
        this.elements.typingArea.addEventListener('click', () => {
            this.elements.hiddenInput.focus();
        });
        
        // Input handling
        this.elements.hiddenInput.addEventListener('input', (e) => this.handleInput(e));
        this.elements.hiddenInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        // Focus handling
        this.elements.hiddenInput.addEventListener('focus', () => {
            this.elements.typingArea.classList.remove('blur-effect');
            this.elements.cursor.classList.remove('blink');
        });
        
        this.elements.hiddenInput.addEventListener('blur', () => {
            if (!this.isActive) {
                this.elements.typingArea.classList.add('blur-effect');
                this.elements.cursor.classList.add('blink');
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
        
        // Results buttons
        this.elements.restartBtn.addEventListener('click', () => this.restart());
        this.elements.shareBtn.addEventListener('click', () => this.copyResult());
        
        // Clear stats
        this.elements.clearStats.addEventListener('click', () => this.clearStats());

        // Nemesis — settle the score
        if (this.elements.nemesisSettle) {
            this.elements.nemesisSettle.addEventListener('click', () => this.settleNemesis());
        }
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.cycleTheme());
        
        // Sound toggle
        this.elements.soundToggle.addEventListener('click', () => this.toggleSound());
        
        // Settings
        this.bindSettingsEvents();
        
        // Window resize
        window.addEventListener('resize', () => this.updateCursorPosition());
    }

    bindSettingsEvents() {
        // Theme selector
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.setTheme(theme);
            });
        });
        
        // Font size
        this.elements.fontSize.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            this.updateFontSize(size);
        });
        
        // Toggles
        this.elements.smoothCaret.addEventListener('change', (e) => {
            this.updateSetting('smoothCaret', e.target.checked);
            this.elements.cursor.classList.toggle('smooth', e.target.checked);
        });
        
        this.elements.showLiveWpm.addEventListener('change', (e) => {
            this.updateSetting('showLiveWpm', e.target.checked);
        });
        
        this.elements.soundEffects.addEventListener('change', (e) => {
            this.updateSetting('soundEffects', e.target.checked);
            SoundSystem.enabled = e.target.checked;
            this.elements.soundToggle.classList.toggle('active', e.target.checked);
        });
        
        this.elements.soundVolume.addEventListener('input', (e) => {
            const volume = parseInt(e.target.value);
            this.updateSetting('soundVolume', volume);
            this.elements.soundVolumeValue.textContent = `${volume}%`;
            SoundSystem.setVolume(volume / 100);
        });
        
        this.elements.stopOnError.addEventListener('change', (e) => {
            this.updateSetting('stopOnError', e.target.checked);
        });
        
        this.elements.confidenceMode.addEventListener('change', (e) => {
            this.updateSetting('confidenceMode', e.target.checked);
        });
        
        this.elements.blindMode.addEventListener('change', (e) => {
            this.updateSetting('blindMode', e.target.checked);
        });

        if (this.elements.readyCountdown) {
            this.elements.readyCountdown.addEventListener('change', (e) => {
                this.updateSetting('readyCountdown', e.target.checked);
            });
        }

        // Afflictions — visual-only burdens, body-class driven
        const bindAffliction = (el, settingKey, bodyClass) => {
            if (!el) return;
            el.addEventListener('change', (e) => {
                this.updateSetting(settingKey, e.target.checked);
                document.body.classList.toggle(bodyClass, e.target.checked);
            });
        };
        bindAffliction(this.elements.affMist,    'affMist',    'aff-mist');
        bindAffliction(this.elements.affFade,    'affFade',    'aff-fade');
        bindAffliction(this.elements.affLantern, 'affLantern', 'aff-lantern');
        bindAffliction(this.elements.affNarrow,  'affNarrow',  'aff-narrow');

        // Ambient effects toggle + intensity knob
        if (this.elements.ambientEffects) {
            this.elements.ambientEffects.addEventListener('change', (e) => {
                this.updateSetting('ambientEffects', e.target.checked);
                document.body.classList.toggle('ambient-off', !e.target.checked);
            });
        }
        if (this.elements.ambientIntensity) {
            this.elements.ambientIntensity.addEventListener('input', (e) => {
                const v = parseInt(e.target.value);
                this.updateSetting('ambientIntensity', v);
                this.elements.ambientIntensityValue.textContent = `${v}%`;
                document.documentElement.style.setProperty('--ambient-intensity', (v / 100).toFixed(2));
            });
        }

        // The vault — seal & unseal
        if (this.elements.exportData) {
            this.elements.exportData.addEventListener('click', () => this.exportLedger());
        }
        if (this.elements.importData && this.elements.importFile) {
            this.elements.importData.addEventListener('click', () => this.elements.importFile.click());
            this.elements.importFile.addEventListener('change', (e) => this.importLedger(e));
        }
    }

    // ─────────────────────────────────────────────────────────────
    // The vault — seal the ledger to disk; unseal one from a file
    // ─────────────────────────────────────────────────────────────
    exportLedger() {
        try {
            const data = Storage.exportData();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url  = URL.createObjectURL(blob);
            const d = new Date();
            const stamp = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            const a = document.createElement('a');
            a.href = url;
            a.download = `typeflux-ledger-${stamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            this.showToast('the ledger is sealed and saved', 'success');
            SoundSystem.click && SoundSystem.click();
        } catch (e) {
            console.error('export failed', e);
            this.showToast('the seal failed — the ledger is unmoved', 'error');
        }
    }

    importLedger(event) {
        const file = event.target.files && event.target.files[0];
        // Reset the input so the same file can be selected again
        event.target.value = '';
        if (!file) return;

        const reader = new FileReader();
        reader.onerror = () => this.showToast('the ledger could not be read', 'error');
        reader.onload = () => {
            let parsed;
            try {
                parsed = JSON.parse(reader.result);
            } catch (e) {
                this.showToast('the file is not a sealed ledger', 'error');
                return;
            }

            const tCount = Array.isArray(parsed.tests) ? parsed.tests.length : 0;
            const ok = confirm(
                `Unseal this ledger?\n\n` +
                `· ${tCount} trial${tCount === 1 ? '' : 's'} on record\n` +
                `· sealed ${parsed.exportedAt || 'date unknown'}\n\n` +
                `This REPLACES all current records — settings, trials, streaks, seals. ` +
                `It cannot be undone unless thou hast sealed thy current ledger first.`
            );
            if (!ok) {
                this.showToast('the ledger was set aside, untouched', 'info');
                return;
            }

            const result = Storage.importData(parsed);
            if (!result.ok) {
                this.showToast(`the unsealing failed — ${result.error}`, 'error');
                return;
            }

            // Re-load settings into the live app and refresh views
            this.settings = Storage.getSettings();
            this.applySettings();
            this.updateStatsView();
            this.showToast('the ledger is unsealed — all records restored', 'success');
            SoundSystem.newRecord && SoundSystem.newRecord();
        };
        reader.readAsText(file);
    }

    // ─────────────────────────────────────────────────────────────
    // View Management
    // ─────────────────────────────────────────────────────────────
    
    switchView(view) {
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update views
        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
        });
        
        const viewMap = {
            'test': this.elements.viewTest,
            'stats': this.elements.viewStats,
            'settings': this.elements.viewSettings
        };
        
        if (viewMap[view]) {
            viewMap[view].classList.add('active');
        }
        
        // Update stats if switching to stats view
        if (view === 'stats') {
            this.updateStatsView();
        }
        
        SoundSystem.click();
    }

    showResults() {
        this.elements.viewTest.classList.remove('active');
        this.elements.viewResults.classList.add('active');

        // Staged reveal — clear then re-add the class after a forced
        // reflow so the cascade animations restart every trial.
        const cert = this.elements.certificate;
        if (cert) {
            cert.classList.remove('reveal');
            void cert.offsetWidth;
            cert.classList.add('reveal');
        }

        // Draw the pace chart as its plate cascades into view.
        setTimeout(() => {
            ChartSystem.drawWpmChart(
                this.elements.wpmChart,
                this.wpmHistory,
                this.rawWpmHistory
            );
        }, 900);
    }

    // ─────────────────────────────────────────────────────────────
    // Test Generation
    // ─────────────────────────────────────────────────────────────
    
    generateTest() {
        this.reset();
        this.lastLanguage = null;

        switch (this.mode) {
            case 'words':
                if (this.boundBy === 'count') {
                    // Count-bound: exactly this many words, glass counts up.
                    this.words = WordGenerator.generateSequence(this.wordCount);
                    this.timerValue = 0;
                } else {
                    // Time-bound: a deep well of words so even a very fast
                    // hand cannot drain the field before the glass empties
                    // (sized well past any sustainable pace).
                    this.words = WordGenerator.generateSequence(this.timeLimit * 6);
                    this.timerValue = this.timeLimit;
                }
                break;

            case 'quotes':
                const quote = QuoteGenerator.getAny();
                this.words = quote.text.split(' ');
                this.timerValue = 0; // No timer for quotes
                break;

            case 'prose': {
                // Real, everyday English — coherent passages of working
                // prose, sized by the Count knob. Completed when the
                // passage is, like a quote.
                const passage = SentenceGenerator.getPassage(this.wordCount);
                this.words = passage.text.split(' ');
                this.timerValue = 0;
                break;
            }
                
            case 'code': {
                const snippet = CodeGenerator.getAny();
                this.lastLanguage = snippet.language;
                this.words = [];
                this.lineBreaks = new Set();
                // Each line is a "word" that may contain spaces — every
                // character (including indentation) is a required keystroke.
                // Tabs render as four spaces; trailing whitespace is trimmed
                // off each line so a stray trailing space doesn't trip the
                // user; empty lines remain typeable as a bare Enter.
                const expanded = snippet.code.replace(/\t/g, '    ').replace(/\r\n?/g, '\n');
                const lines = expanded.split('\n').map(l => l.replace(/\s+$/, ''));
                // Drop a single trailing empty line if present (most snippets
                // don't end in a blank line, but be safe)
                while (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
                lines.forEach((line, idx) => {
                    if (idx > 0) this.lineBreaks.add(this.words.length);
                    this.words.push(line);
                });
                this.timerValue = 0;
                break;
            }
                
            case 'zen':
                // Truly endless — no glass, no word count, no conclusion.
                // The buffer is topped up as the hand advances; the trial
                // ends only when the typewright walks away.
                this.words = WordGenerator.getFlow(120);
                this.timerValue = 0;
                break;
                
            default:
                this.words = WordGenerator.generateSequence(this.wordCount);
                this.timerValue = this.timeLimit;
        }

        // Nemesis trial — lace the field with the word that has felled
        // the hand most, so the score may be settled head-on.
        if (this.mode === 'words' && this._nemesisInject) {
            const foe = this._nemesisInject;
            this._nemesisInject = null;
            const step = Math.max(3, Math.floor(this.words.length / 6));
            for (let k = 1; k < this.words.length; k += step) {
                this.words[k] = foe;
            }
        }

        this.renderWords();
        this.updateTimer();
        this.updateCursorPosition();

        // Load the ghost for this format bucket — only meaningful for words
        // mode, which is the only mode where the same seed-bucket has
        // comparable runs. Quote/code/zen would need same-snippet matching
        // which is a richer feature; leave them ghost-less for now.
        this.ghost = null;
        this.ghostWordIndex = 0;
        if (this.elements.ghostCursor) this.elements.ghostCursor.classList.remove('active', 'behind');
        if (this.mode === 'words') {
            const [gw, gt] = this.ghostBucket();
            const g = Storage.getGhost(this.mode, gw, gt);
            if (g && Array.isArray(g.wordTimes) && g.wordTimes.length > 0) {
                this.ghost = g;
                if (this.elements.ghostWpm) this.elements.ghostWpm.textContent = g.wpm;
            }
        }

        this.renderTypeNext();
        this.updateManifest();
        this.updateTimerLabel();
    }

    /* Ghost bucket args for the current words trial. Time-bound and
       count-bound runs live in separate buckets — one arg is zeroed so
       the two never share a ghost. */
    ghostBucket() {
        return [
            this.boundBy === 'count' ? this.wordCount : 0,
            this.boundBy === 'time'  ? this.timeLimit : 0
        ];
    }

    /* Context-aware manifest. Glass bounds only a `words` trial. Count
       governs `words` (count-bound) and `prose` (passage length); it is
       inert everywhere else. Within `words`, whichever knob does not
       govern the current trial is muted so the contract stays plain. */
    updateManifest() {
        const glass = document.querySelector('.manifest-group-glass');
        const count = document.querySelector('.manifest-group-count');
        const isWords = this.mode === 'words';
        const countMatters = isWords || this.mode === 'prose';
        if (glass) glass.classList.toggle('inert', !isWords);
        if (count) count.classList.toggle('inert', !countMatters);
        if (glass) glass.classList.toggle('muted', isWords && this.boundBy !== 'time');
        if (count) count.classList.toggle('muted', isWords && this.boundBy !== 'count');
    }

    /* The live timer's caption tells the hand whether the glass is
       running down or up — countdown for a time-bound words trial,
       elapsed for everything else. */
    updateTimerLabel() {
        const label = document.querySelector('.timer-display .stat-label');
        if (!label) return;
        const countdown = this.mode === 'words' && this.boundBy === 'time';
        label.textContent = countdown ? 'glass ⁄ sec' : 'elapsed ⁄ sec';
    }

    /* A clear, unit-bearing label for a trial — used on the certificate,
       the ledger roll, and the shared account. Never a bare number. */
    trialLabel(t) {
        const m = (t && t.mode) || 'words';
        if (m === 'words') {
            if (t && t.boundBy === 'count') {
                return `words · ${(t && t.wordCount) || this.wordCount} words`;
            }
            return `words · ${(t && t.timeLimit) || this.timeLimit} seconds`;
        }
        if (m === 'code')   return (t && t.language) ? `code · ${t.language}` : 'code';
        if (m === 'quotes') return 'quotes · passage';
        if (m === 'prose')  return 'prose · passage';
        if (m === 'zen')    return 'zen · endless';
        return m;
    }

    /* Zen is endless — quietly extend the word buffer as the hand
       nears its end so the field never runs dry. */
    appendZenWords(n = 80) {
        const container = this.elements.wordsDisplay;
        if (!container) return;
        const more = WordGenerator.getFlow(n);
        more.forEach(word => {
            const idx = this.words.length;
            this.words.push(word);
            const wordEl = document.createElement('span');
            wordEl.className = 'word';
            wordEl.dataset.word = idx;
            word.split('').forEach((letter, li) => {
                const le = document.createElement('span');
                le.className = 'letter';
                le.dataset.word = idx;
                le.dataset.letter = li;
                le.textContent = letter;
                wordEl.appendChild(le);
            });
            container.appendChild(wordEl);
        });
    }

    // ─────────────────────────────────────────────────────────────
    // Near-miss tease — the reason the hand presses "again"
    // ─────────────────────────────────────────────────────────────
    restartTease(results, previousBest, isPB, hadPrior) {
        if (isPB) return 'thy finest hand yet — once more';

        // Shy of thy best by a hair
        if (hadPrior && previousBest > 0) {
            const gap = previousBest - results.wpm;
            if (gap > 0 && gap <= 5) {
                return `${gap} wpm shy of thy best — again`;
            }
        }

        // A breath from the next grade
        const grades = [
            { g: 'S+', s: 100 }, { g: 'S', s: 80 }, { g: 'A+', s: 65 },
            { g: 'A', s: 55 }, { g: 'B+', s: 45 }, { g: 'B', s: 35 },
            { g: 'C+', s: 25 }, { g: 'C', s: 15 }
        ];
        const score = results.wpm * (results.accuracy / 100);
        let next = null;
        for (let i = grades.length - 1; i >= 0; i--) {
            if (grades[i].s > score) { next = grades[i]; break; }
        }
        if (next && next.s - score <= 5) {
            return `a breath from an ${next.g} — again`;
        }

        // So near a clean hand
        if (results.accuracy >= 96 && results.accuracy < 100) {
            return 'so near a clean hand — again';
        }

        return 'a fresh trial';
    }

    // ─────────────────────────────────────────────────────────────
    // Rolling number — eased count to a target. A number that snaps
    // reads as a glitch; a number that rolls reads as a verdict.
    // ─────────────────────────────────────────────────────────────
    rollNumber(el, to, opts = {}) {
        if (!el) return;
        const { duration = 800, delay = 0, suffix = '' } = opts;
        const target = Math.round(to) || 0;

        // Honour reduced-motion — land the value at once.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            el.textContent = `${target}${suffix}`;
            return;
        }

        const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
        const startAt = performance.now() + delay;
        el.textContent = `0${suffix}`;
        const tick = (now) => {
            if (now < startAt) { requestAnimationFrame(tick); return; }
            const t = Math.min(1, (now - startAt) / duration);
            el.textContent = `${Math.round(target * ease(t))}${suffix}`;
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = `${target}${suffix}`;
        };
        requestAnimationFrame(tick);
    }

    // ─────────────────────────────────────────────────────────────
    // The typewright — persistent rank + nemesis word
    // ─────────────────────────────────────────────────────────────
    updateIdentity() {
        const stats = Storage.getStats() || Storage.getDefaultStats();
        const rank  = Storage.getRank(stats);

        // Frontispiece chip
        if (this.elements.deviceRank) this.elements.deviceRank.textContent = rank.name;

        // Ledger rank plate
        if (this.elements.rankName)  this.elements.rankName.textContent  = rank.name;
        if (this.elements.rankMotto) this.elements.rankMotto.textContent = `— ${rank.motto} —`;

        // The wax seal — its detail grows with the tier; the numeral is
        // the tier in Roman.
        const tierRoman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
        if (this.elements.rankSeal) {
            this.elements.rankSeal.style.setProperty('--tier', rank.index);
        }
        if (this.elements.rankSealNumeral) {
            this.elements.rankSealNumeral.textContent = tierRoman[rank.index] || 'I';
        }

        if (this.elements.rankBarFill && this.elements.rankNext) {
            if (rank.next) {
                const tHave = stats.testsCompleted || 0, tNeed = rank.next.trials;
                const wHave = stats.bestWpm || 0,        wNeed = rank.next.wpm;
                const tRatio = tNeed ? Math.min(1, tHave / tNeed) : 1;
                const wRatio = wNeed ? Math.min(1, wHave / wNeed) : 1;
                this.elements.rankBarFill.style.width =
                    `${Math.round(Math.min(tRatio, wRatio) * 100)}%`;
                if (tRatio <= wRatio) {
                    const left = Math.max(0, tNeed - tHave);
                    this.elements.rankNext.textContent =
                        `${left} trial${left === 1 ? '' : 's'} to ${rank.next.name}`;
                } else {
                    const left = Math.max(0, wNeed - wHave);
                    this.elements.rankNext.textContent =
                        `raise thy best ${left} wpm for ${rank.next.name}`;
                }
            } else {
                this.elements.rankBarFill.style.width = '100%';
                this.elements.rankNext.textContent = 'the summit — no rank lies beyond';
            }
        }

        // Nemesis
        const nem = Storage.getNemesis();
        if (this.elements.nemesisPlate) {
            if (nem && nem.count > 0) {
                this.elements.nemesisPlate.classList.add('has-nemesis');
                if (this.elements.nemesisWord)  this.elements.nemesisWord.textContent = nem.word;
                if (this.elements.nemesisCount) {
                    this.elements.nemesisCount.textContent =
                        `it hath felled thy hand ${nem.count} time${nem.count === 1 ? '' : 's'}`;
                }
            } else {
                this.elements.nemesisPlate.classList.remove('has-nemesis');
                if (this.elements.nemesisWord)  this.elements.nemesisWord.textContent = '—';
                if (this.elements.nemesisCount) this.elements.nemesisCount.textContent = 'no foe yet named';
            }
        }
    }

    /* Settle the score — a count-bound words trial laced with the
       nemesis word, opened straight away. */
    settleNemesis() {
        const nem = Storage.getNemesis();
        if (!nem) {
            this.showToast('no nemesis is yet named — type on', 'info');
            return;
        }
        this._nemesisInject = nem.word;
        this.mode = 'words';
        this.boundBy = 'count';
        this.updateSetting('boundBy', 'count');
        document.querySelectorAll('.mode-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.mode === 'words');
        });
        this.switchView('test');
        this.generateTest();
        this.elements.hiddenInput.focus();
        this.showToast(`face thy nemesis — ${nem.word}`, 'info');
    }

    renderWords() {
        const container = this.elements.wordsDisplay;
        container.textContent = '';

        // Toggle a code-mode class on the typing area so CSS can switch
        // to a fixed-width line grid + visible-space conventions.
        const isCode = this.mode === 'code';
        if (this.elements.typingArea) {
            this.elements.typingArea.classList.toggle('mode-code', isCode);
        }

        this.words.forEach((word, wordIndex) => {
            if (this.lineBreaks.has(wordIndex)) {
                const br = document.createElement('span');
                br.className = 'word-linebreak';
                container.appendChild(br);
            }

            const wordEl = document.createElement('span');
            wordEl.className = 'word';
            wordEl.dataset.word = wordIndex;
            // Empty line marker — render a placeholder span so the row has
            // height in the grid even with no letters.
            if (isCode && word.length === 0) {
                wordEl.classList.add('word-empty');
            }

            word.split('').forEach((letter, letterIndex) => {
                const letterEl = document.createElement('span');
                letterEl.className = 'letter';
                letterEl.dataset.word = wordIndex;
                letterEl.dataset.letter = letterIndex;
                if (letter === ' ') {
                    // Visible space marker only in code mode (·); the match
                    // logic still uses the original char from this.words.
                    letterEl.classList.add('letter-space');
                    letterEl.textContent = isCode ? '·' : ' ';
                } else {
                    letterEl.textContent = letter;
                }
                wordEl.appendChild(letterEl);
            });

            container.appendChild(wordEl);
        });

        const firstWord = container.querySelector('.word');
        if (firstWord) firstWord.classList.add('active');
    }

    // ─────────────────────────────────────────────────────────────
    // Input Handling
    // ─────────────────────────────────────────────────────────────
    
    handleInput(e) {
        if (this.isFinished) return;
        if (this.isCountingDown) {
            // Discard input during the ready countdown
            e.target.value = '';
            return;
        }

        const inputValue = e.target.value;
        const inputChar = inputValue.slice(-1);

        // Start test on first input
        if (!this.isActive && inputValue.length > 0) {
            if (this.settings.readyCountdown) {
                e.target.value = '';
                this.runCountdown(() => {});
                return;
            }
            this.startTest();
        }
        
        // In code mode, spaces and tabs are real characters within a line;
        // a line is completed by Enter (handled in handleKeydown). Everywhere
        // else, space ends the current word.
        if (this.mode !== 'code' && inputChar === ' ') {
            this.completeWord();
            e.target.value = '';
            return;
        }

        // Handle character input
        this.processInput(inputValue);
    }

    handleKeydown(e) {
        // Code-mode line completion — Enter ends the current line.
        if (e.key === 'Enter' && this.mode === 'code' && this.isActive && !this.isFinished) {
            e.preventDefault();
            this.completeWord();
            return;
        }

        // Backspace handling
        if (e.key === 'Backspace') {
            if (this.settings.confidenceMode) {
                e.preventDefault();
                return;
            }
            
            SoundSystem.backspace();
            
            // Allow going back to previous word if at start of current word
            if (this.elements.hiddenInput.value === '' && this.currentWordIndex > 0) {
                this.goToPreviousWord();
                e.preventDefault();
            }
        }
        
    }

    handleGlobalKeydown(e) {
        // Tab + Enter to restart
        if (e.key === 'Enter' && this.tabPressed) {
            e.preventDefault();
            this.restart();
            return;
        }

        if (e.key === 'Tab') {
            e.preventDefault();
            this.tabPressed = true;
            setTimeout(() => this.tabPressed = false, 1000);
            return;
        }
        
        // Escape to reset
        if (e.key === 'Escape') {
            this.restart();
        }
        
        // Focus input when typing
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const activeElement = document.activeElement;
            if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
                this.elements.hiddenInput.focus();
            }
        }
    }

    processInput(input) {
        const currentWord = this.words[this.currentWordIndex];
        if (!currentWord) return;

        const wordElement = this.elements.wordsDisplay.querySelector(`.word[data-word="${this.currentWordIndex}"]`);
        if (!wordElement) return;

        const baseLetters = wordElement.querySelectorAll('.letter:not(.extra)');
        const existingExtras = wordElement.querySelectorAll('.letter.extra');

        // Update base letters
        baseLetters.forEach((letter, i) => {
            letter.classList.remove('correct', 'incorrect');
            if (i < input.length) {
                letter.classList.add(input[i] === currentWord[i] ? 'correct' : 'incorrect');
            }
        });

        // Handle extra characters — reuse existing extra spans where possible
        const extraCount = Math.max(0, input.length - currentWord.length);
        for (let i = 0; i < Math.max(extraCount, existingExtras.length); i++) {
            if (i < extraCount) {
                const charIndex = currentWord.length + i;
                if (i < existingExtras.length) {
                    existingExtras[i].textContent = input[charIndex];
                } else {
                    const extraLetter = document.createElement('span');
                    extraLetter.className = 'letter extra incorrect';
                    extraLetter.textContent = input[charIndex];
                    wordElement.appendChild(extraLetter);
                }
            } else if (i < existingExtras.length) {
                existingExtras[i].remove();
            }
        }
        
        // Play keystroke sound
        if (input.length > this.input.length) {
            const lastChar = input.slice(-1);
            const expectedChar = currentWord[input.length - 1];
            
            if (expectedChar && lastChar === expectedChar) {
                SoundSystem.keystroke();
                this.correctChars++;
                this.combo++;
                this.updateCombo();
            } else {
                SoundSystem.error();
                this.incorrectChars++;
                this.wordErrorsThisWord++;
                this.combo = 0;
                this.updateCombo();
                // Stumble: tally misses against the current word
                if (currentWord) {
                    this.wordMisses[currentWord] = (this.wordMisses[currentWord] || 0) + 1;
                }
            }
            
            this.totalKeystrokes++;
        }
        
        this.input = input;
        this.currentLetterIndex = input.length;
        this.updateCursorPosition();
        this.updateLiveStats();
    }

    completeWord() {
        const currentWord = this.words[this.currentWordIndex];
        // In code mode, indentation matters — never strip whitespace from
        // the typed input. Everywhere else, trim is fine (and matches the
        // legacy behaviour where space ends the word).
        const raw = this.elements.hiddenInput.value;
        const input = (this.mode === 'code') ? raw : raw.trim();
        
        // Check if word is correct
        const isCorrect = input === currentWord;
        
        // Mark word as complete
        const wordElement = this.elements.wordsDisplay.querySelector(`.word[data-word="${this.currentWordIndex}"]`);
        if (wordElement) {
            wordElement.classList.remove('active');
            wordElement.classList.add(isCorrect ? 'correct' : 'has-error');
        }
        
        if (isCorrect) {
            SoundSystem.wordComplete();
            // Carriage bell at line ends in code mode — adds typewriter feel.
            if (this.mode === 'code' && this.lineBreaks.has(this.currentWordIndex + 1)) {
                SoundSystem.bell && SoundSystem.bell();
            }
            // Word-pop kinesthetic — quick scale + glow, removed automatically.
            if (wordElement) {
                wordElement.classList.add('word-pop');
                setTimeout(() => wordElement.classList.remove('word-pop'), 420);
            }
        } else {
            this.combo = 0;
            this.updateCombo();
        }

        // ── Medals on word completion ─────────────────────────
        const now = Date.now();
        // Capture per-word elapsed-ms for ghost storage
        if (this.startTime) {
            this.runWordTimes.push(now - this.startTime);
        }
        const duration = this.lastWordCompletedAt ? (now - this.lastWordCompletedAt) : Infinity;
        const perfect = isCorrect && this.wordErrorsThisWord === 0;
        this.checkWordMedals(currentWord || '', perfect, duration);
        if (perfect) this.perfectStreak++;
        else this.perfectStreak = 0;
        this.wordErrorsThisWord = 0;
        this.lastWordCompletedAt = now;

        // Move to next word
        this.currentWordIndex++;
        this.currentLetterIndex = 0;
        this.input = '';

        if (this.mode === 'zen') {
            // Endless — never conclude; keep the buffer ahead of the hand.
            if (this.words.length - this.currentWordIndex < 30) {
                this.appendZenWords(80);
            }
        } else if (this.currentWordIndex >= this.words.length) {
            this.finishTest();
            return;
        }
        
        // Mark next word as active
        const nextWordElement = this.elements.wordsDisplay.querySelector(`.word[data-word="${this.currentWordIndex}"]`);
        if (nextWordElement) {
            nextWordElement.classList.add('active');
            
            // Scroll into view if needed
            this.scrollToWord(nextWordElement);
        }
        
        // Word-boundary keystroke counts as one correct char — for code mode
        // that boundary is Enter, for everything else it's space. Either way
        // it's a single keystroke worth tallying. (Each in-line char in code
        // was already counted during processInput.)
        this.correctChars++;
        if (this.mode === 'code') {
            SoundSystem.bell && SoundSystem.bell();
        } else {
            SoundSystem.space();
        }
        
        this.updateCursorPosition();
        this.updateLiveStats();
    }

    goToPreviousWord() {
        if (this.currentWordIndex === 0) return;
        
        // Remove active from current word
        const currentWordElement = this.elements.wordsDisplay.querySelector(`.word[data-word="${this.currentWordIndex}"]`);
        if (currentWordElement) {
            currentWordElement.classList.remove('active');
        }
        
        // Go back
        this.currentWordIndex--;
        
        // Mark previous word as active
        const prevWordElement = this.elements.wordsDisplay.querySelector(`.word[data-word="${this.currentWordIndex}"]`);
        if (prevWordElement) {
            prevWordElement.classList.remove('correct', 'has-error');
            prevWordElement.classList.add('active');
            
            // Restore the word
            const word = this.words[this.currentWordIndex];
            this.elements.hiddenInput.value = word;
            this.input = word;
            this.currentLetterIndex = word.length;
            
            // Re-process to show state
            this.processInput(word);
        }
        
        this.updateCursorPosition();
    }

    scrollToWord(wordElement) {
        const container = this.elements.wordsDisplay;
        const typingArea = this.elements.typingArea;
        const areaRect = typingArea.getBoundingClientRect();
        const wordRect = wordElement.getBoundingClientRect();

        if (wordRect.bottom > areaRect.bottom - 20) {
            const fontSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--typing-font-size'));
            const lineHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--line-height'));
            this.scrollOffset += fontSize * lineHeight;
            container.style.transform = `translateY(-${this.scrollOffset}px)`;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Test Control
    // ─────────────────────────────────────────────────────────────
    
    startTest() {
        this.isActive = true;
        this.startTime = Date.now();
        this.elements.liveStats.classList.add('active');

        // Zen never concludes, so it never reaches finishTest's bookkeeping.
        // Credit the manner the moment the hand engages, else breadth seals
        // (The Wanderer) could never count a zen trial.
        if (this.mode === 'zen') Storage.markModeUsed('zen');

        // Start countdown timer for timed mode, or elapsed timer for untimed modes
        if (this.timerValue > 0) {
            this.startTimer();
        } else {
            this.elapsedInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                this.elements.liveTimer.textContent = elapsed;
            }, 1000);
        }

        // Start WPM tracking
        this.wpmInterval = setInterval(() => this.trackWpm(), 1000);

        // Start ghost replay if a ghost exists for this bucket
        this.startGhostReplay();
    }

    // ─────────────────────────────────────────────────────────────
    // Ghost replay — translucent rival cursor that moves through the
    // same word positions at the timings of thy past best run.
    // ─────────────────────────────────────────────────────────────
    startGhostReplay() {
        const cur = this.elements.ghostCursor;
        if (!cur) return;
        if (!this.ghost || !this.ghost.wordTimes || this.ghost.wordTimes.length === 0) {
            cur.classList.remove('active', 'behind');
            return;
        }
        cur.classList.add('active');
        this.ghostWordIndex = 0;

        const tick = () => {
            if (!this.isActive) { this.ghostRaf = null; return; }
            const elapsed = Date.now() - this.startTime;
            const times = this.ghost.wordTimes;

            // Advance ghost word index while elapsed time has surpassed the
            // ghost's completion time for that word.
            while (this.ghostWordIndex < times.length && elapsed >= times[this.ghostWordIndex]) {
                this.ghostWordIndex++;
            }

            // Position the ghost at the start of the word it's "currently typing"
            const idx = Math.min(this.ghostWordIndex, this.words.length - 1);
            const wordEl = this.elements.wordsDisplay.querySelector(`.word[data-word="${idx}"]`);
            const containerRect = this.elements.typingArea.getBoundingClientRect();
            if (wordEl) {
                // Interpolate within the word for smoother motion
                const prevTime = idx === 0 ? 0 : (times[idx - 1] || 0);
                const nextTime = times[idx] || (prevTime + 600);
                const span = Math.max(1, nextTime - prevTime);
                const within = Math.max(0, Math.min(1, (elapsed - prevTime) / span));
                const letters = wordEl.querySelectorAll('.letter:not(.extra)');
                const wordRect = wordEl.getBoundingClientRect();
                const letterIdx = Math.floor(within * letters.length);
                const letterEl = letters[Math.min(letterIdx, letters.length - 1)];
                const lr = letterEl ? letterEl.getBoundingClientRect() : wordRect;
                cur.style.left = `${lr.left - containerRect.left}px`;
                cur.style.top  = `${lr.top  - containerRect.top}px`;
            }

            // Lead/behind tinting: compare live word index vs ghost
            const behind = this.currentWordIndex < this.ghostWordIndex;
            cur.classList.toggle('behind', behind);

            // Stop when ghost finishes its run
            if (this.ghostWordIndex >= times.length) {
                this.ghostRaf = null;
                return;
            }
            this.ghostRaf = requestAnimationFrame(tick);
        };
        this.ghostRaf = requestAnimationFrame(tick);
    }

    stopGhostReplay() {
        if (this.ghostRaf) {
            cancelAnimationFrame(this.ghostRaf);
            this.ghostRaf = null;
        }
        if (this.elements.ghostCursor) {
            this.elements.ghostCursor.classList.remove('active', 'behind');
        }
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timerValue--;
            this.updateTimer();

            // Last-5-second urgency: crimson rim on the vellum frame +
            // a gentle warm-to-crimson tint of the ambient atmosphere
            // (halo, motes, matrix rain). Body class drives the wider shift.
            if (this.timerValue <= 5 && this.timerValue > 0) {
                SoundSystem.timerWarning();
                if (this.elements.vellumFrame) {
                    this.elements.vellumFrame.classList.add('urgent');
                }
                document.body.classList.add('is-urgent');
            }

            if (this.timerValue <= 0) {
                this.finishTest();
            }
        }, 1000);
    }

    finishTest() {
        if (this.isFinished) return;

        this.isFinished = true;
        this.isActive = false;
        this.endTime = Date.now();

        // Stop timers
        if (this.timer) clearInterval(this.timer);
        if (this.wpmInterval) clearInterval(this.wpmInterval);
        if (this.elapsedInterval) clearInterval(this.elapsedInterval);
        this.stopGhostReplay();

        // Drop urgency styling
        if (this.elements.vellumFrame) {
            this.elements.vellumFrame.classList.remove('urgent');
        }
        document.body.classList.remove('is-urgent');

        // Capture previous best BEFORE addTest mutates stats.
        const prevStats = Storage.getStats() || { bestWpm: 0, testsCompleted: 0 };
        const previousBest = prevStats.bestWpm || 0;
        const hadPriorTests = (prevStats.testsCompleted || 0) > 0;
        const rankBefore = Storage.getRank(prevStats);
        const prevStreak = Storage.getStreak();

        const results = this.calculateResults();
        Storage.addTest(results);

        // The sitting — this visit's running shape.
        this.sitting.trials++;
        this.sitting.wpmSum += results.wpm;

        // Lifetime miss tally — feeds the nemesis. Code "words" are whole
        // lines, not real words, so they are kept out of the reckoning.
        if (this.mode !== 'code') {
            Storage.recordMisses(this.wordMisses);
        }

        const rankAfter = Storage.getRank(Storage.getStats());
        const isPersonalBest = hadPriorTests && results.wpm > previousBest;

        // Save ghost if this run is the best for its bucket — only words mode
        // gets ghosts (other modes need same-snippet matching to be meaningful).
        let ghostUpdated = false;
        if (this.mode === 'words' && this.runWordTimes.length > 0) {
            const [gw, gt] = this.ghostBucket();
            ghostUpdated = Storage.maybeSaveGhost(this.mode, gw, gt, {
                wpm: results.wpm,
                accuracy: results.accuracy,
                words: this.words.slice(0, this.runWordTimes.length),
                wordTimes: this.runWordTimes
            });
        }

        if (isPersonalBest) {
            SoundSystem.newRecord();
            this.showToast(`new personal best — ${results.wpm} wpm`, 'success');
        } else if (ghostUpdated) {
            SoundSystem.newRecord();
            this.showToast(`a new ghost is set for this format — ${results.wpm} wpm`, 'success');
        } else {
            SoundSystem.testComplete();
        }

        // The certificate is staged: reveal the surface first, then
        // write its content so the cascade animations catch every part.
        this._restartTease = this.restartTease(results, previousBest, isPersonalBest, hadPriorTests);
        this.showResults();
        this.displayResults(results);

        // PB ribbon + confetti — fire after the certificate is on screen
        if (this.elements.certificate) {
            this.elements.certificate.classList.toggle('is-pb', isPersonalBest);
        }
        if (isPersonalBest) {
            setTimeout(() => this.spawnConfetti(48), 320);
        }

        // ── Achievements: mark, evaluate, stamp ────────────────
        Storage.markModeUsed(this.mode);
        if (this.mode === 'code' && this.lastLanguage) {
            Storage.markLanguageUsed(this.lastLanguage);
        }

        const tests = Storage.getTests() || [];
        const stats = Storage.getStats();
        const state = Storage.getAchievementState();
        const streak = Storage.getStreak();

        const ctx = {
            test: { ...results, timestamp: Date.now() },
            tests, stats, state, streak,
            session: { blazes: this.sessionBlazes }
        };

        const newly = Achievements.evaluate(ctx);
        this.sealsEarnedThisTest = [];
        if (newly.length > 0) {
            // Persist + queue stamps. Stagger so multiple unlocks read clearly.
            newly.forEach((id, i) => {
                Storage.unlockAchievement(id);
                const ach = Achievements.byId(id);
                if (ach) {
                    this.sealsEarnedThisTest.push(ach);
                    setTimeout(() => this.spawnStamp(ach), 900 + i * 700);
                }
            });
            // Refresh chronicles silently in case the user opens the ledger
            this.renderChronicles();
        }

        // Render the post-trial honours panel — medals + seals together.
        this.renderHonours();

        // Render the stumble panel — top-3 missed words + a counsel line.
        this.renderStumble();

        // Rank raised — a quiet honour, distinct from the seals, landed
        // after the certificate's reveal has settled.
        if (rankAfter.index > rankBefore.index) {
            setTimeout(() => {
                this.showToast(`the desk raises thee — ${rankAfter.name}`, 'success');
                SoundSystem.newRecord && SoundSystem.newRecord();
            }, 1700);
        }

        // Refresh the persistent identity — frontispiece chip + ledger.
        this.updateIdentity();

        // Milestones — visible progression so the climb never stalls.
        this.checkMilestones(prevStats, prevStreak);

        // Commissions — measure this trial against the day's charges.
        this.evaluateCommissions(results);
        this.renderCommissions();
    }

    // ─────────────────────────────────────────────────────────────
    // Milestones — trial-count and streak crossings, marked as a
    // moment so a long account never feels like a flat number.
    // ─────────────────────────────────────────────────────────────
    checkMilestones(prevStats, prevStreak) {
        const stats  = Storage.getStats() || Storage.getDefaultStats();
        const streak = Storage.getStreak();

        const trialMarks = {
            10:  'thy tenth trial', 25: 'thy twenty-fifth trial',
            50:  'thy fiftieth trial', 100: 'thy hundredth trial',
            250: 'thy two-hundred-and-fiftieth trial', 500: 'thy five-hundredth trial'
        };
        const tc = stats.testsCompleted || 0;
        if (trialMarks[tc] && (prevStats.testsCompleted || 0) < tc) {
            setTimeout(() => {
                this.showToast(`${trialMarks[tc]} — set down at this desk`, 'success');
                SoundSystem.newRecord && SoundSystem.newRecord();
                if (tc >= 100) this.spawnConfetti(40);
            }, 2400);
        }

        const streakMarks = {
            3:  'three days unbroken', 7: 'a week unbroken',
            14: 'a fortnight unbroken', 30: 'a month unbroken',
            100: 'a hundred days unbroken'
        };
        if (streakMarks[streak] && prevStreak < streak) {
            setTimeout(() => {
                this.showToast(`${streakMarks[streak]} — the streak holds`, 'success');
                SoundSystem.newRecord && SoundSystem.newRecord();
                if (streak >= 30) this.spawnConfetti(40);
            }, 2800);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Commissions — measure a finished trial against the day's
    // three charges; mark progress, celebrate those discharged.
    // ─────────────────────────────────────────────────────────────
    evaluateCommissions(results) {
        const state = Storage.getCommissions();
        if (!state || !Array.isArray(state.items)) return;

        const stats = Storage.getStats() || Storage.getDefaultStats();
        const ctx = { test: results, stats, session: { trials: this.sitting.trials } };

        const wereAllDone = state.items.every(it => it.done);
        const newlyDone = [];

        for (const it of state.items) {
            if (it.done) continue;
            const def = Commissions.byId(it.id);
            if (!def) continue;
            let advanced = false;
            try { advanced = !!def.check(ctx); } catch (e) { advanced = false; }
            if (advanced) {
                it.progress = Math.min(def.target, (it.progress || 0) + 1);
                if (it.progress >= def.target) { it.done = true; newlyDone.push(def); }
            }
        }
        Storage.saveCommissions(state);

        // Announce each discharge, staggered so they read in turn.
        newlyDone.forEach((def, i) => {
            setTimeout(() => {
                this.showToast(`commission discharged — ${def.label}`, 'success');
                SoundSystem.combo && SoundSystem.combo(3);
            }, 2000 + i * 850);
        });

        // All three in a day — a small fanfare.
        const allDoneNow = state.items.every(it => it.done);
        if (allDoneNow && !wereAllDone) {
            setTimeout(() => {
                this.showToast('the day’s commissions — all discharged', 'success');
                SoundSystem.newRecord && SoundSystem.newRecord();
                this.spawnConfetti(32);
            }, 2000 + newlyDone.length * 850 + 500);
        }
    }

    // Render the day's commissions onto the ledger.
    renderCommissions() {
        const wrap = this.elements.commissionsList;
        if (!wrap) return;
        const state = Storage.getCommissions();
        wrap.textContent = '';

        let doneCount = 0;
        for (const it of state.items) {
            const def = Commissions.byId(it.id);
            if (!def) continue;
            if (it.done) doneCount++;

            const row = document.createElement('div');
            row.className = 'commission' + (it.done ? ' done' : '');

            const mark = document.createElement('span');
            mark.className = 'commission-mark';
            mark.textContent = it.done ? '✓' : '·';

            const label = document.createElement('span');
            label.className = 'commission-label';
            label.textContent = def.label;

            const prog = document.createElement('span');
            prog.className = 'commission-prog';
            if (def.target > 1 && !it.done) {
                prog.textContent = `${Math.min(it.progress || 0, def.target)} / ${def.target}`;
            } else {
                prog.textContent = it.done ? 'discharged' : 'open';
            }

            row.append(mark, label, prog);
            wrap.appendChild(row);
        }

        if (this.elements.commissionsCount) {
            this.elements.commissionsCount.textContent = `${doneCount} of ${state.items.length}`;
        }
    }

    // ─────────────────────────────────────────────────────────────
    // The returning typewright — a greeting drawn from the record,
    // so a fresh visit is met, not opened cold.
    // ─────────────────────────────────────────────────────────────
    returningGreeting() {
        const tests = Storage.getTests() || [];
        if (tests.length === 0) {
            return 'welcome to the desk — thy first trial awaits the pen';
        }
        const last     = tests[tests.length - 1];
        const rank     = Storage.getRank();
        const streak   = Storage.getStreak();
        const daysAway = Math.floor((Date.now() - (last.timestamp || Date.now())) / 86400000);

        let when;
        if (daysAway <= 0)      when = 'welcome back';
        else if (daysAway === 1) when = 'the desk has waited a day';
        else                     when = `the desk has waited ${daysAway} days`;

        const parts = [when, rank.name];
        if (streak > 1) parts.push(`${streak} days unbroken`);
        parts.push(`thy last hand — ${last.wpm} wpm`);
        return parts.join('  ·  ');
    }

    // Reflect the restored mode/glass/count onto the manifest buttons.
    syncManifestButtons() {
        document.querySelectorAll('.mode-btn').forEach(b =>
            b.classList.toggle('active', b.dataset.mode === this.mode));
        document.querySelectorAll('.time-btn').forEach(b =>
            b.classList.toggle('active', parseInt(b.dataset.time) === this.timeLimit));
        document.querySelectorAll('.word-btn').forEach(b =>
            b.classList.toggle('active', parseInt(b.dataset.words) === this.wordCount));
    }

    // ─────────────────────────────────────────────────────────────
    // Stumble panel — surface the most-missed words this trial,
    // plus a one-line counsel naming any pattern we can identify
    // (digraphs, double letters, capitalised words, etc.)
    // ─────────────────────────────────────────────────────────────
    renderStumble() {
        const panel   = this.elements.certStumble;
        const list    = this.elements.stumbleList;
        const counsel = this.elements.stumbleCounsel;
        if (!panel || !list || !counsel) return;

        list.textContent = '';
        const entries = Object.entries(this.wordMisses)
            .filter(([w, n]) => n > 0 && w && w.length > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        if (entries.length === 0) {
            panel.classList.remove('has-data');
            counsel.textContent = '';
            return;
        }

        panel.classList.add('has-data');
        for (const [word, count] of entries) {
            const li = document.createElement('li');
            li.className = 'stumble-row';
            const w = document.createElement('span');
            w.className = 'stumble-word';
            w.textContent = word;
            const c = document.createElement('span');
            c.className = 'stumble-count';
            c.textContent = String(count);
            li.append(w, c);
            list.appendChild(li);
        }

        counsel.textContent = this._stumbleCounsel(entries);
    }

    // ─────────────────────────────────────────────────────────────
    // Type-next counsel — quiet hint above the field, drawn from
    // your recent trials. Surfaced when there's something specific
    // worth saying; hidden otherwise.
    // ─────────────────────────────────────────────────────────────
    renderTypeNext() {
        const el = this.elements.typeNext;
        const body = this.elements.typeNextBody;
        if (!el || !body) return;

        const counsel = this._typeNextCounsel();
        if (!counsel) {
            el.classList.remove('visible');
            return;
        }
        body.textContent = counsel;
        el.classList.add('visible');
    }

    _typeNextCounsel() {
        const tests = (Storage.getTests() || []).slice(-10);
        if (tests.length === 0) {
            return 'Begin with a short trial — the desk awaits thy first hand.';
        }

        // Suggest a ghost race when one exists for the current format
        if (this.mode === 'words') {
            const [gw, gt] = this.ghostBucket();
            const g = Storage.getGhost(this.mode, gw, gt);
            if (g) {
                return `A ghost waits for this format at ${g.wpm} wpm — race it.`;
            }
        }

        // If the user keeps a single mode, nudge them to vary it
        const recentModes = new Set(tests.slice(-5).map(t => t.mode));
        if (recentModes.size === 1) {
            const tried = [...recentModes][0];
            const others = ['words', 'quotes', 'prose', 'code', 'zen'].filter(m => m !== tried);
            const nudge = others[Math.floor(Math.random() * others.length)];
            return `Thou hast set thyself only to ${tried} of late — try a turn at ${nudge}.`;
        }

        // Recent mean accuracy below 92 → drill accuracy
        const meanAcc = tests.reduce((s, t) => s + t.accuracy, 0) / tests.length;
        if (meanAcc < 92) {
            return 'Thy accuracy hath slipped of late — slow thy pace, mind every letter.';
        }

        // Recent mean WPM stable (small variance) → push for a higher tier
        const wpms = tests.map(t => t.wpm);
        const mean = wpms.reduce((a, b) => a + b, 0) / wpms.length;
        const sd = Math.sqrt(wpms.reduce((a, b) => a + (b - mean) ** 2, 0) / wpms.length);
        if (sd < 4 && tests.length >= 5) {
            return `Thy pace hath plateaued near ${Math.round(mean)} wpm — try a longer glass to test endurance.`;
        }

        return null;
    }

    /* Look at the most-missed words and offer one specific observation:
       repeated digraphs, double-letter words, capitals, punctuation,
       short common-word slips. Returns a single italic counsel line. */
    _stumbleCounsel(entries) {
        const words = entries.map(([w]) => w);

        // Bigram frequency across stumbled words
        const bigrams = {};
        for (const w of words) {
            const lower = w.toLowerCase();
            for (let i = 0; i < lower.length - 1; i++) {
                const bg = lower.slice(i, i + 2);
                if (/^[a-z]{2}$/.test(bg)) {
                    bigrams[bg] = (bigrams[bg] || 0) + 1;
                }
            }
        }
        const topBg = Object.entries(bigrams).sort((a, b) => b[1] - a[1])[0];
        if (topBg && topBg[1] >= 2) {
            return `Thy hand stumbles often on “${topBg[0]}” — set thy practice there.`;
        }

        const doubles = words.filter(w => /(.)\1/.test(w.toLowerCase()));
        if (doubles.length >= 2) {
            return 'Double letters trip the hand — slow the second strike.';
        }

        const caps = words.filter(w => /[A-Z]/.test(w));
        if (caps.length >= 2) {
            return 'Capitals are costing thee — the shift hand needs drilling.';
        }

        const punct = words.filter(w => /[^a-zA-Z0-9]/.test(w));
        if (punct.length >= 2) {
            return 'Punctuation, not letters, is thy chief defect.';
        }

        const short = words.filter(w => w.length <= 3);
        if (short.length >= 3) {
            return 'Short common words are slipping past thee — slow the easy strikes.';
        }

        return `Mind “${words[0]}” in particular — it hath claimed thee oft.`;
    }

    // ─────────────────────────────────────────────────────────────
    // Honours panel — post-trial register of medals + seals earned
    // ─────────────────────────────────────────────────────────────
    renderHonours() {
        const panel = this.elements.certHonours;
        const grid  = this.elements.honoursGrid;
        if (!panel || !grid) return;

        grid.textContent = '';

        // De-duplicate medals by name; show count if earned multiple times
        const medalCounts = new Map();
        for (const m of this.medalsEarnedThisTest) {
            const prev = medalCounts.get(m.name);
            if (prev) { prev.count++; }
            else { medalCounts.set(m.name, { ...m, count: 1 }); }
        }

        const items = [];
        for (const m of medalCounts.values()) {
            items.push({
                cls: `tier-${m.tier || 'common'}`,
                glyph: m.glyph,
                name: m.count > 1 ? `${m.name} ×${m.count}` : m.name,
                kind: 'medal'
            });
        }
        for (const s of this.sealsEarnedThisTest) {
            items.push({
                cls: `cat-${s.category}`,
                glyph: s.glyph,
                name: s.name,
                kind: 'a seal earned'
            });
        }

        const has = items.length > 0;
        panel.classList.toggle('has-honours', has);
        if (!has) return;

        for (const it of items) {
            const card = document.createElement('div');
            card.className = `honour ${it.cls}`;
            card.innerHTML = `
                <span class="honour-glyph" aria-hidden="true">${it.glyph}</span>
                <span class="honour-name">${it.name}</span>
                <span class="honour-kind">${it.kind}</span>
            `;
            grid.appendChild(card);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Chronicles — the engraved register of seals
    // ─────────────────────────────────────────────────────────────
    renderChronicles() {
        const grid = this.elements.chronicles;
        if (!grid) return;
        const state = Storage.getAchievementState();
        const unlocked = state.unlocked || {};
        const all = Achievements.all();
        const summary = Achievements.summary(state);

        if (this.elements.chroniclesCount) {
            this.elements.chroniclesCount.textContent = `${summary.earned} of ${summary.total}`;
        }

        grid.textContent = '';
        const fmtDate = (ts) => {
            const d = new Date(ts);
            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        };

        for (const a of all) {
            const isUnlocked = !!unlocked[a.id];
            const isHidden = a.secret && !isUnlocked;

            const card = document.createElement('article');
            card.className = `seal seal-${a.category}` + (isUnlocked ? ' unlocked' : ' locked') + (isHidden ? ' hidden' : '');

            card.innerHTML = `
                <span class="seal-corner seal-corner-tl" aria-hidden="true"></span>
                <span class="seal-corner seal-corner-tr" aria-hidden="true"></span>
                <span class="seal-corner seal-corner-bl" aria-hidden="true"></span>
                <span class="seal-corner seal-corner-br" aria-hidden="true"></span>
                <div class="seal-glyph">${isHidden ? '?' : a.glyph}</div>
                <div class="seal-name">${isHidden ? 'a seal yet hidden' : a.name}</div>
                <div class="seal-motto">${isHidden ? '— in tempore —' : '— ' + a.motto + ' —'}</div>
                <div class="seal-rule">${isHidden ? 'Earn it to read its mark.' : a.rule}</div>
                <div class="seal-tag">${a.category}</div>
                ${isUnlocked ? `<div class="seal-date">${fmtDate(unlocked[a.id])}</div>` : ''}
            `;
            grid.appendChild(card);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Achievement stamp — gold seal slams onto the certificate
    // ─────────────────────────────────────────────────────────────
    spawnStamp(achievement) {
        const stack = this.elements.stampStack;
        if (!stack || !achievement) return;

        const card = document.createElement('div');
        card.className = 'stamp';
        card.innerHTML = `
            <span class="stamp-ring" aria-hidden="true"></span>
            <span class="stamp-glyph">${achievement.glyph}</span>
            <div class="stamp-meta">
                <span class="stamp-eyebrow">a seal earned</span>
                <span class="stamp-name">${achievement.name}</span>
                <span class="stamp-motto">— ${achievement.motto} —</span>
            </div>
        `;
        stack.appendChild(card);

        SoundSystem.newRecord && SoundSystem.newRecord();

        // Auto-remove after the read window
        setTimeout(() => {
            card.classList.add('leaving');
            setTimeout(() => card.remove(), 480);
        }, 4200);
    }

    // ─────────────────────────────────────────────────────────────
    // Medals — arcade callouts during a trial. Halo multikill,
    // Guitar Hero streak, Tony Hawk combo. They pop and fade.
    // ─────────────────────────────────────────────────────────────

    /* Per-medal cooldown gate. Returns true and stamps if ready. */
    medalReady(id, ms) {
        const now = Date.now();
        if ((this.medalCooldowns[id] || 0) > now) return false;
        this.medalCooldowns[id] = now + ms;
        return true;
    }

    /* Spawn a medal card in the medal stack. Tier drives accent
       colour: common (gold), rare (teal), epic (plum), legendary
       (crimson). All fade and remove themselves. */
    spawnMedal(name, glyph, tier = 'common') {
        const stack = this.elements.medalStack;
        // Always log the honour, even if the visual stack isn't present.
        this.medalsEarnedThisTest.push({ name, glyph, tier });
        if (!stack) return;

        const card = document.createElement('div');
        card.className = `medal medal-${tier}`;
        card.innerHTML = `
            <span class="medal-glyph" aria-hidden="true">${glyph}</span>
            <span class="medal-name">${name}</span>
        `;
        stack.appendChild(card);

        // Limit visible stack — drop the oldest if we're past 4
        const cards = stack.querySelectorAll('.medal');
        if (cards.length > 4) {
            cards[0].classList.add('leaving');
            setTimeout(() => cards[0].remove(), 280);
        }

        SoundSystem.combo && SoundSystem.combo(2);

        setTimeout(() => {
            card.classList.add('leaving');
            setTimeout(() => card.remove(), 320);
        }, 1300);
    }

    /* Called from completeWord. word = the target word; perfect =
       isCorrect && zero errors during typing; duration = ms since
       last word completed. */
    checkWordMedals(word, perfect, duration) {
        if (!perfect) return;

        // First-blood: only fires once per trial
        if (!this.medalsSeenInTest.has('first-blood')) {
            this.medalsSeenInTest.add('first-blood');
            this.spawnMedal('FIRST BLOOD', '✦', 'rare');
        }

        // Streak escalations — fire on exact thresholds so each
        // tier reads as its own moment.
        const streakAfter = this.perfectStreak + 1; // about to be incremented
        switch (streakAfter) {
            case 2:  this.spawnMedal('DOUBLE FLOURISH',    '✦',  'common');    break;
            case 3:  this.spawnMedal('TRIPLE FLOURISH',    '✦',  'rare');      break;
            case 5:  this.spawnMedal('THE SPREE',          '✚',  'rare');      break;
            case 10: this.spawnMedal('CONSUMMATE',         '❉',  'epic');      break;
            case 20: this.spawnMedal('FLAWLESS',           '◈',  'legendary'); break;
            case 30: this.spawnMedal('TRANSCENDENT',       '✺',  'legendary'); break;
        }

        // Per-word feats
        if (word.length >= 8 && this.medalReady('heavy-hand', 1200)) {
            this.spawnMedal('HEAVY HAND', '⊞', 'rare');
        }
        if (duration < 500 && word.length >= 4 && this.medalReady('snap', 1500)) {
            this.spawnMedal('SNAP', '☇', 'rare');
        }

        // Last-gasp — perfect word completed in the dying breath of a timed trial
        if (this.timerValue === 1 && !this.medalsSeenInTest.has('last-gasp')) {
            this.medalsSeenInTest.add('last-gasp');
            this.spawnMedal('LAST GASP', '⧗', 'epic');
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Confetti — pure DOM particles, animated by CSS
    // ─────────────────────────────────────────────────────────────
    spawnConfetti(count = 40) {
        const layer = this.elements.confettiLayer;
        if (!layer) return;
        layer.textContent = '';
        const colors = ['var(--gold)', 'var(--teal)', 'var(--forest)', 'var(--plum)', 'var(--ink)'];
        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = 'confetti-piece';
            p.style.setProperty('--cx',     `${(Math.random() * 100).toFixed(1)}%`);
            p.style.setProperty('--cdx',    `${(Math.random() * 200 - 100).toFixed(0)}px`);
            p.style.setProperty('--cdur',   `${(1.4 + Math.random() * 1.6).toFixed(2)}s`);
            p.style.setProperty('--cdelay', `${(Math.random() * 0.4).toFixed(2)}s`);
            p.style.setProperty('--crot',   `${(Math.random() * 720 - 360).toFixed(0)}deg`);
            p.style.background = colors[i % colors.length];
            layer.appendChild(p);
        }
        // Cleanup after animations complete
        setTimeout(() => { layer.textContent = ''; }, 3600);
    }

    calculateResults() {
        const timeElapsed = (this.endTime - this.startTime) / 1000;
        const minutes = timeElapsed / 60;
        
        // WPM calculation (standard: 5 characters = 1 word)
        const grossWpm = Math.round((this.correctChars / 5) / minutes);
        const netWpm = Math.round(((this.correctChars - this.incorrectChars) / 5) / minutes);
        const wpm = Math.max(0, netWpm);
        
        // Raw WPM (without error penalty)
        const rawWpm = grossWpm;
        
        // Accuracy
        const totalChars = this.correctChars + this.incorrectChars;
        const accuracy = totalChars > 0 ? Math.round((this.correctChars / totalChars) * 100) : 100;
        
        // Consistency (standard deviation of WPM samples)
        const consistency = this.calculateConsistency();
        
        return {
            wpm,
            rawWpm,
            accuracy,
            consistency,
            time: Math.round(timeElapsed),
            words: this.currentWordIndex,
            characters: {
                correct: this.correctChars,
                incorrect: this.incorrectChars,
                total: totalChars
            },
            maxCombo: this.maxCombo,
            mode: this.mode,
            wordCount: this.wordCount,
            timeLimit: this.timeLimit,
            boundBy: this.boundBy,
            language: this.lastLanguage || null,
            grade: this.calculateGrade(wpm, accuracy)
        };
    }

    calculateConsistency() {
        if (this.wpmHistory.length < 2) return 100;
        
        const mean = this.wpmHistory.reduce((a, b) => a + b, 0) / this.wpmHistory.length;
        const squaredDiffs = this.wpmHistory.map(wpm => Math.pow(wpm - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
        const stdDev = Math.sqrt(avgSquaredDiff);
        
        // Convert to percentage (lower stdDev = higher consistency)
        const consistency = Math.max(0, Math.round(100 - (stdDev * 2)));
        return consistency;
    }

    displayResults(results) {
        // The two hero numbers roll up as the grand plate cascades in.
        this.rollNumber(this.elements.resultWpm, results.wpm, { delay: 560, duration: 880 });
        this.rollNumber(this.elements.resultAccuracy, results.accuracy, { delay: 620, duration: 760, suffix: '%' });

        // The restart button carries the reason to press it again.
        if (this.elements.restartLabel) {
            this.elements.restartLabel.textContent = this._restartTease || 'a fresh trial';
        }

        // The sitting — surface this visit's shape once it has one.
        if (this.elements.certSitting) {
            if (this.sitting.trials >= 2) {
                const mean = Math.round(this.sitting.wpmSum / this.sitting.trials);
                this.elements.certSitting.textContent =
                    `this sitting — ${this.sitting.trials} trials · ${mean} mean pace`;
                this.elements.certSitting.classList.add('visible');
            } else {
                this.elements.certSitting.classList.remove('visible');
            }
        }

        this.elements.resultRaw.textContent = results.rawWpm;
        this.elements.resultChars.textContent = `${results.characters.correct}/${results.characters.incorrect}/${results.characters.total}`;
        this.elements.resultConsistency.textContent = `${results.consistency}%`;
        this.elements.resultTime.textContent = `${results.time}s`;
        this.elements.resultCombo.textContent = results.maxCombo;
        this.elements.resultType.textContent = this.trialLabel(results);
        
        // Calculate grade
        const grade = this.calculateGrade(results.wpm, results.accuracy);
        this.elements.resultGrade.textContent = grade;

        // Marginalia tip on the certificate — language-specific for code,
        // a general typing tip otherwise.
        if (this.elements.certTip && this.elements.certTipBody) {
            let tip = null;
            let label = '';
            if (results.mode === 'code' && this.lastLanguage) {
                tip = CodeGenerator.getTip(this.lastLanguage);
                label = `tip ⁄ ${this.lastLanguage}`;
            } else {
                tip = CodeGenerator.getTypingTip();
                label = 'tip ⁄ of the trial';
            }
            if (tip) {
                if (this.elements.certTipLang) this.elements.certTipLang.textContent = label;
                this.elements.certTipBody.textContent = tip;
                this.elements.certTip.classList.add('visible');
            } else {
                this.elements.certTip.classList.remove('visible');
            }
        }
    }

    calculateGrade(wpm, accuracy) {
        const score = wpm * (accuracy / 100);
        
        if (score >= 100) return 'S+';
        if (score >= 80) return 'S';
        if (score >= 65) return 'A+';
        if (score >= 55) return 'A';
        if (score >= 45) return 'B+';
        if (score >= 35) return 'B';
        if (score >= 25) return 'C+';
        if (score >= 15) return 'C';
        return 'D';
    }

    trackWpm() {
        if (!this.isActive) return;

        const elapsed = (Date.now() - this.startTime) / 1000 / 60;
        if (elapsed <= 0) return;

        const wpm = Math.round((this.correctChars / 5) / elapsed);
        const rawWpm = Math.round(((this.correctChars + this.incorrectChars) / 5) / elapsed);

        this.wpmHistory.push(wpm);
        this.rawWpmHistory.push(rawWpm);

        // Sustained-speed medals — average of the trailing window
        const avg = (n) => {
            if (this.wpmHistory.length < n) return 0;
            const tail = this.wpmHistory.slice(-n);
            return tail.reduce((a, b) => a + b, 0) / n;
        };

        if (avg(5) >= 120 && this.medalReady('overture', 8000)) {
            this.spawnMedal('OVERTURE', '☉', 'legendary');
        } else if (avg(5) >= 100 && this.medalReady('thunderclap', 7000)) {
            this.spawnMedal('THUNDERCLAP', '☇', 'epic');
        } else if (avg(3) >= 80 && this.medalReady('burst', 6000)) {
            this.spawnMedal('THE BURST', '✺', 'rare');
        }
    }

    reset() {
        // Stop timers
        if (this.timer) clearInterval(this.timer);
        if (this.wpmInterval) clearInterval(this.wpmInterval);
        if (this.elapsedInterval) clearInterval(this.elapsedInterval);
        this.stopGhostReplay();

        // Reset state
        this.isActive = false;
        this.isPaused = false;
        this.isFinished = false;
        this.currentWordIndex = 0;
        this.currentLetterIndex = 0;
        this.input = '';
        this.startTime = null;
        this.endTime = null;

        // Reset stats
        this.correctChars = 0;
        this.incorrectChars = 0;
        this.totalKeystrokes = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.wpmHistory = [];
        this.rawWpmHistory = [];

        // Reset scroll & code mode
        this.scrollOffset = 0;
        this.lineBreaks = new Set();

        // Reset medal state
        this.perfectStreak = 0;
        this.wordErrorsThisWord = 0;
        this.lastWordCompletedAt = 0;
        this.medalCooldowns = {};
        this.medalsSeenInTest = new Set();
        this.crescendoFired = false;
        this.zenithFired = false;
        this.medalsEarnedThisTest = [];
        this.sealsEarnedThisTest = [];
        this.wordMisses = {};
        this.runWordTimes = [];
        this.stopGhostReplay();
        if (this.elements.medalStack) this.elements.medalStack.textContent = '';
        document.body.classList.remove('is-urgent');

        // Reset UI
        this.elements.hiddenInput.value = '';
        this.elements.liveStats.classList.remove('active');
        this.elements.comboDisplay.classList.remove('active', 'fire', 'blaze');
        this.elements.wordsDisplay.style.transform = '';
        if (this.elements.vellumFrame) this.elements.vellumFrame.classList.remove('urgent');
        if (this.elements.certificate) this.elements.certificate.classList.remove('is-pb');
        if (this.elements.confettiLayer) this.elements.confettiLayer.textContent = '';
        if (this.elements.countdown) this.elements.countdown.classList.remove('active');
        this.isCountingDown = false;

        // Reset live stats display
        this.elements.liveWpm.textContent = '0';
        this.elements.liveAccuracy.textContent = '100';
    }

    restart() {
        // Hide results if showing
        this.elements.viewResults.classList.remove('active');
        this.elements.viewTest.classList.add('active');
        if (this.elements.certificate) this.elements.certificate.classList.remove('is-pb');
        if (this.elements.confettiLayer) this.elements.confettiLayer.textContent = '';
        if (this.elements.vellumFrame) this.elements.vellumFrame.classList.remove('urgent');
        document.body.classList.remove('is-urgent');

        // Make sure we're on test view
        this.switchView('test');
        
        // Generate new test (also re-renders type-next counsel + ghost)
        this.generateTest();
        
        // Focus input
        this.elements.hiddenInput.focus();
        
        SoundSystem.click();
    }

    // ─────────────────────────────────────────────────────────────
    // UI Updates
    // ─────────────────────────────────────────────────────────────
    
    updateCursorPosition() {
        const currentWord = this.elements.wordsDisplay.querySelector(`.word[data-word="${this.currentWordIndex}"]`);
        if (!currentWord) return;

        const apply = (left, top) => {
            this.elements.cursor.style.left = `${left}px`;
            this.elements.cursor.style.top = `${top}px`;
            // Trails inherit position; their longer transitions create the lag.
            this.elements.cursorTrails.forEach(t => {
                t.style.left = `${left}px`;
                t.style.top = `${top}px`;
            });
        };

        let targetElement;

        if (this.currentLetterIndex < this.words[this.currentWordIndex]?.length) {
            targetElement = currentWord.querySelector(`.letter[data-letter="${this.currentLetterIndex}"]`);
        } else {
            const letters = currentWord.querySelectorAll('.letter');
            targetElement = letters[letters.length - 1];

            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const containerRect = this.elements.typingArea.getBoundingClientRect();
                apply(rect.right - containerRect.left, rect.top - containerRect.top);
                return;
            }
        }

        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const containerRect = this.elements.typingArea.getBoundingClientRect();
            apply(rect.left - containerRect.left, rect.top - containerRect.top);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Ready countdown — III · II · I · GO before a test begins
    // ─────────────────────────────────────────────────────────────
    runCountdown(onDone) {
        this.isCountingDown = true;
        const overlay = this.elements.countdown;
        const numeral = this.elements.countdownNumeral;
        if (!overlay || !numeral) {
            this.isCountingDown = false;
            this.startTest();
            if (onDone) onDone();
            return;
        }
        const steps = ['III', 'II', 'I', 'GO'];
        overlay.classList.add('active');
        let i = 0;
        const tick = () => {
            const text = steps[i];
            numeral.textContent = text;
            numeral.classList.remove('pulse', 'go');
            // restart animation
            void numeral.offsetWidth;
            numeral.classList.add(text === 'GO' ? 'go' : 'pulse');
            if (text === 'GO') SoundSystem.newRecord && SoundSystem.click();
            else SoundSystem.timerWarning && SoundSystem.click();
            i++;
            if (i < steps.length) {
                setTimeout(tick, 700);
            } else {
                setTimeout(() => {
                    overlay.classList.remove('active');
                    this.isCountingDown = false;
                    this.startTest();
                    this.elements.hiddenInput.focus();
                    if (onDone) onDone();
                }, 380);
            }
        };
        tick();
    }

    updateTimer() {
        if (this.mode === 'words' && this.boundBy === 'time') {
            // The only countdown glass — words bounded by time.
            this.elements.liveTimer.textContent = this.timerValue;
        } else {
            // Everything else counts up: elapsed seconds.
            const elapsed = this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
            this.elements.liveTimer.textContent = elapsed;
        }
    }

    updateLiveStats() {
        if (!this.settings.showLiveWpm || !this.startTime) return;
        
        const elapsed = (Date.now() - this.startTime) / 1000 / 60;
        if (elapsed <= 0) return;
        
        const wpm = Math.round((this.correctChars / 5) / elapsed);
        const totalChars = this.correctChars + this.incorrectChars;
        const accuracy = totalChars > 0 ? Math.round((this.correctChars / totalChars) * 100) : 100;
        
        this.elements.liveWpm.textContent = wpm;
        this.elements.liveAccuracy.textContent = accuracy;
    }

    updateCombo() {
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        this.elements.comboCount.textContent = this.combo;
        
        if (this.combo >= 5) {
            this.elements.comboDisplay.classList.add('active');
        } else {
            this.elements.comboDisplay.classList.remove('active');
        }
        
        // Fire effects at milestones
        if (this.combo >= 25) {
            this.elements.comboDisplay.classList.add('blaze');
            this.elements.comboDisplay.classList.remove('fire');
            // Count the blaze peak once per arming — re-arms when combo drops
            if (this._blazeArmed) {
                this.sessionBlazes++;
                this._blazeArmed = false;
            }
        } else if (this.combo >= 10) {
            this.elements.comboDisplay.classList.add('fire');
            this.elements.comboDisplay.classList.remove('blaze');
        } else {
            this.elements.comboDisplay.classList.remove('fire', 'blaze');
            this._blazeArmed = true;
        }
        
        // Play combo sound at milestones
        if ([10, 25, 50, 75, 100].includes(this.combo)) {
            SoundSystem.combo(Math.floor(this.combo / 10));
        }

        // Combo-cross medals — once each per trial
        if (this.combo >= 50 && !this.crescendoFired) {
            this.crescendoFired = true;
            this.spawnMedal('CRESCENDO', '✹', 'epic');
        }
        if (this.combo >= 100 && !this.zenithFired) {
            this.zenithFired = true;
            this.spawnMedal('ZENITH', '☉', 'legendary');
        }
    }

    updateStatsView() {
        const stats = Storage.getStats();
        const tests = Storage.getTests();

        this.elements.statsTests.textContent = stats.testsCompleted;
        this.elements.statsBest.textContent = stats.bestWpm;
        this.elements.statsAvg.textContent = stats.averageWpm;
        this.elements.statsTime.textContent = Storage.formatTime(stats.totalTime);
        if (this.elements.statsStreak) {
            this.elements.statsStreak.textContent = Storage.getStreak();
        }

        this.renderChronicles();
        this.updateIdentity();
        this.renderCommissions();

        // Render test history
        this.elements.testsList.textContent = '';

        if (tests.length > 0) {
            tests.slice(-10).reverse().forEach(test => {
                const item = document.createElement('div');
                item.className = 'test-item';

                const info = document.createElement('div');
                info.className = 'test-info';

                const wpm = document.createElement('span');
                wpm.className = 'test-wpm';
                wpm.textContent = `${test.wpm} wpm`;

                const acc = document.createElement('span');
                acc.className = 'test-acc';
                acc.textContent = `${test.accuracy}%`;

                const type = document.createElement('span');
                type.className = 'test-type';
                type.textContent = this.trialLabel(test);

                info.append(wpm, acc, type);

                const date = document.createElement('span');
                date.className = 'test-date';
                date.textContent = Storage.formatDate(test.timestamp);

                item.append(info, date);
                this.elements.testsList.appendChild(item);
            });
        } else {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = '\u2014 no trials yet recorded; the desk awaits thy hand \u2014';
            this.elements.testsList.appendChild(empty);
        }
        
        // Draw history chart
        setTimeout(() => {
            ChartSystem.drawHistoryChart(this.elements.historyChart, tests);
        }, 100);
    }

    // ─────────────────────────────────────────────────────────────
    // Mode & Settings
    // ─────────────────────────────────────────────────────────────
    
    setMode(mode) {
        this.mode = mode;
        this.updateSetting('defaultMode', mode);

        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        this.generateTest();
        SoundSystem.click();
    }

    setTime(time) {
        this.timeLimit = time;
        this.timerValue = time;
        this.updateSetting('defaultTime', time);

        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.time) === time);
        });

        if (this.mode === 'words') {
            // Choosing a glass binds the trial to time.
            this.boundBy = 'time';
            this.updateSetting('boundBy', 'time');
            this.generateTest();
        } else {
            this.updateTimer();
        }
        SoundSystem.click();
    }

    setWordCount(count) {
        this.wordCount = count;
        this.updateSetting('defaultWords', count);

        document.querySelectorAll('.word-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.words) === count);
        });

        if (this.mode === 'words') {
            // Choosing a count binds the trial to a fixed number of words.
            this.boundBy = 'count';
            this.updateSetting('boundBy', 'count');
        }
        this.generateTest();
        SoundSystem.click();
    }

    applySettings() {
        // Theme
        this.setTheme(this.settings.theme, false);
        
        // Font size
        this.updateFontSize(this.settings.fontSize, false);
        
        // Smooth caret
        this.elements.cursor.classList.toggle('smooth', this.settings.smoothCaret);
        this.elements.smoothCaret.checked = this.settings.smoothCaret;
        
        // Other settings
        this.elements.showLiveWpm.checked = this.settings.showLiveWpm;
        this.elements.soundEffects.checked = this.settings.soundEffects;
        this.elements.soundVolume.value = this.settings.soundVolume;
        this.elements.soundVolumeValue.textContent = `${this.settings.soundVolume}%`;
        this.elements.stopOnError.checked = this.settings.stopOnError;
        this.elements.confidenceMode.checked = this.settings.confidenceMode;
        this.elements.blindMode.checked = this.settings.blindMode;
        if (this.elements.readyCountdown) {
            this.elements.readyCountdown.checked = this.settings.readyCountdown !== false;
        }

        // Apply afflictions on load — checkbox + body class
        const setAfflict = (el, key, cls) => {
            const on = !!this.settings[key];
            if (el) el.checked = on;
            document.body.classList.toggle(cls, on);
        };
        setAfflict(this.elements.affMist,    'affMist',    'aff-mist');
        setAfflict(this.elements.affFade,    'affFade',    'aff-fade');
        setAfflict(this.elements.affLantern, 'affLantern', 'aff-lantern');
        setAfflict(this.elements.affNarrow,  'affNarrow',  'aff-narrow');

        // Ambient settings — toggle + intensity
        const ambientOn = this.settings.ambientEffects !== false;
        if (this.elements.ambientEffects) this.elements.ambientEffects.checked = ambientOn;
        document.body.classList.toggle('ambient-off', !ambientOn);

        const intensity = (typeof this.settings.ambientIntensity === 'number') ? this.settings.ambientIntensity : 60;
        if (this.elements.ambientIntensity)      this.elements.ambientIntensity.value = intensity;
        if (this.elements.ambientIntensityValue) this.elements.ambientIntensityValue.textContent = `${intensity}%`;
        document.documentElement.style.setProperty('--ambient-intensity', (intensity / 100).toFixed(2));

        // Words-trial bound — time (countdown glass) or count (fixed words)
        this.boundBy = (this.settings.boundBy === 'count') ? 'count' : 'time';

        // Restore the desk — the mode, glass, and count last set, so a
        // returning typewright opens exactly where they left off.
        const sm = this.settings.defaultMode;
        if (['words', 'quotes', 'prose', 'code', 'zen'].includes(sm)) {
            this.mode = sm;
        }
        if (typeof this.settings.defaultTime === 'number')  this.timeLimit = this.settings.defaultTime;
        if (typeof this.settings.defaultWords === 'number') this.wordCount = this.settings.defaultWords;
        this.syncManifestButtons();

        // Sound system
        SoundSystem.enabled = this.settings.soundEffects;
        SoundSystem.setVolume(this.settings.soundVolume / 100);
        this.elements.soundToggle.classList.toggle('active', this.settings.soundEffects);
    }

    setTheme(theme, save = true) {
        document.documentElement.setAttribute('data-theme', theme);

        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === theme);
        });

        // Track for The Cartographer
        Storage.markThemeUsed(theme);

        if (save) {
            this.settings.theme = theme;
            this.updateSetting('theme', theme);
        }

        // Redraw charts with new colors
        if (this.elements.historyChart) {
            const tests = Storage.getTests();
            setTimeout(() => ChartSystem.drawHistoryChart(this.elements.historyChart, tests), 100);
        }

        // Theme-specific atmosphere: matrix gets falling-character rain
        this.updateThemeEffects(theme);
    }

    updateThemeEffects(theme) {
        const canvas = this.elements.matrixCanvas;
        if (!canvas) return;
        if (theme === 'matrix') {
            this.startMatrixRain(canvas);
        } else {
            this.stopMatrixRain();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // Matrix rain — Canvas2D, only on data-theme="matrix"
    // ─────────────────────────────────────────────────────────────
    startMatrixRain(canvas) {
        if (this._rainRaf) return;
        const ctx = canvas.getContext('2d');
        const glyphs = 'アァカサタナハマヤラワ0123456789{}[]()<>=+-*/&|';
        let cols, drops, w, h, fontPx;

        const resize = () => {
            w = canvas.width  = window.innerWidth * window.devicePixelRatio;
            h = canvas.height = window.innerHeight * window.devicePixelRatio;
            canvas.style.width  = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
            // Smaller glyphs → denser columns → a thicker rain.
            fontPx = 12 * window.devicePixelRatio;
            cols = Math.ceil(w / fontPx);
            drops = new Array(cols).fill(0).map(() => Math.random() * -50);
        };
        resize();
        this._rainResize = resize;
        window.addEventListener('resize', resize);

        const draw = () => {
            // Pause the draw loop entirely when ambient is muted.
            if (document.body.classList.contains('ambient-off')) {
                ctx.clearRect(0, 0, w, h);
                this._rainRaf = requestAnimationFrame(draw);
                return;
            }
            // Urgency tints the trail toward warm crimson — gentle, not loud.
            const urgent = document.body.classList.contains('is-urgent');
            ctx.fillStyle = urgent ? 'rgba(18, 6, 6, 0.10)' : 'rgba(5, 10, 5, 0.08)';
            ctx.fillRect(0, 0, w, h);
            ctx.font = `${fontPx}px "JetBrains Mono", monospace`;
            for (let i = 0; i < cols; i++) {
                const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
                const x = i * fontPx;
                const y = drops[i] * fontPx;
                // head bright, body dim — both warm to amber/crimson on urgency
                if (urgent) {
                    ctx.fillStyle = Math.random() < 0.06 ? '#ffd49a' : '#e47e80';
                } else {
                    ctx.fillStyle = Math.random() < 0.06 ? '#d4ffa8' : '#4ade80';
                }
                ctx.fillText(ch, x, y);
                if (y > h && Math.random() > 0.975) drops[i] = 0;
                drops[i] += 0.55;
            }
            this._rainRaf = requestAnimationFrame(draw);
        };
        draw();
    }

    stopMatrixRain() {
        if (this._rainRaf) {
            cancelAnimationFrame(this._rainRaf);
            this._rainRaf = null;
        }
        if (this._rainResize) {
            window.removeEventListener('resize', this._rainResize);
            this._rainResize = null;
        }
        const canvas = this.elements.matrixCanvas;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    cycleTheme() {
        const themes = ['midnight', 'aurora', 'sunset', 'forest', 'ocean', 'lavender', 'paper', 'matrix'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
        SoundSystem.click();
    }

    toggleSound() {
        const enabled = SoundSystem.toggle();
        this.settings.soundEffects = enabled;
        this.updateSetting('soundEffects', enabled);
        this.elements.soundEffects.checked = enabled;
        this.elements.soundToggle.classList.toggle('active', enabled);
        
        if (enabled) {
            SoundSystem.click();
        }
    }

    updateFontSize(size, save = true) {
        document.documentElement.style.setProperty('--typing-font-size', `${size}px`);
        this.elements.fontSize.value = size;
        this.elements.fontSizeValue.textContent = `${size}px`;
        
        if (save) {
            this.settings.fontSize = size;
            this.updateSetting('fontSize', size);
        }
        
        // Update cursor position after font size change
        setTimeout(() => this.updateCursorPosition(), 50);
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        Storage.updateSetting(key, value);
    }

    // ─────────────────────────────────────────────────────────────
    // Utilities
    // ─────────────────────────────────────────────────────────────
    
    clearStats() {
        if (confirm('Strike every trial from the record? The ledger will be wiped clean — this cannot be undone.')) {
            Storage.clearTests();
            this.updateStatsView();
            this.showToast('the record is struck — the ledger stands empty', 'success');
        }
    }

    copyResult() {
        const stats = Storage.getStats();
        const tests = Storage.getTests();
        const lastTest = tests[tests.length - 1];
        
        if (!lastTest) return;
        
        const cons = lastTest.characters
            ? Math.round(lastTest.characters.correct / (lastTest.characters.correct + lastTest.characters.incorrect) * 100)
            : lastTest.accuracy;
        const text = [
            'typeflux — an account of the typewright',
            '────────────────────────────────────────',
            `   ${lastTest.wpm} wpm  ·  ${lastTest.accuracy}% accuracy`,
            `   raw ${lastTest.rawWpm}  ·  consistency ${cons}%`,
            `   mode  ${this.trialLabel(lastTest)}`,
            '────────────────────────────────────────'
        ].join('\n');

        navigator.clipboard.writeText(text).then(() => {
            this.showToast('the account is copied to thy clipboard', 'success');
        }).catch(() => {
            this.showToast('the clipboard was unwilling', 'error');
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        this.elements.toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TypeFlux();
});
