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
        this.isActive = false;
        this.isPaused = false;
        this.isFinished = false;
        
        // Session-only state (resets on page load)
        this.sessionBlazes = 0;
        this._blazeArmed = true;

        // Medals — per-trial dopamine, like arcade callouts
        this.perfectStreak = 0;
        this.wordErrorsThisWord = 0;
        this.lastWordCompletedAt = 0;
        this.medalCooldowns = {};
        this.medalsSeenInTest = new Set();
        this.crescendoFired = false;
        this.zenithFired = false;

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
        
        // Animate results
        setTimeout(() => {
            ChartSystem.drawWpmChart(
                this.elements.wpmChart,
                this.wpmHistory,
                this.rawWpmHistory
            );
        }, 300);
    }

    // ─────────────────────────────────────────────────────────────
    // Test Generation
    // ─────────────────────────────────────────────────────────────
    
    generateTest() {
        this.reset();
        this.lastLanguage = null;

        switch (this.mode) {
            case 'words':
                this.words = WordGenerator.generateSequence(this.wordCount);
                this.timerValue = this.timeLimit;
                break;
                
            case 'quotes':
                const quote = QuoteGenerator.getAny();
                this.words = quote.text.split(' ');
                this.timerValue = 0; // No timer for quotes
                break;
                
            case 'code':
                const snippet = CodeGenerator.getAny();
                this.lastLanguage = snippet.language;
                this.words = [];
                this.lineBreaks = new Set();
                snippet.code.split('\n').forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed.length === 0) return;
                    if (this.words.length > 0) {
                        this.lineBreaks.add(this.words.length);
                    }
                    const lineWords = trimmed.split(/\s+/).filter(w => w.length > 0);
                    this.words.push(...lineWords);
                });
                this.timerValue = 0;
                break;
                
            case 'zen':
                this.words = WordGenerator.getFlow(100);
                this.timerValue = 0; // Endless mode
                break;
                
            default:
                this.words = WordGenerator.generateSequence(this.wordCount);
                this.timerValue = this.timeLimit;
        }
        
        this.renderWords();
        this.updateTimer();
        this.updateCursorPosition();
    }

    renderWords() {
        const container = this.elements.wordsDisplay;
        container.textContent = '';

        this.words.forEach((word, wordIndex) => {
            if (this.lineBreaks.has(wordIndex)) {
                const br = document.createElement('span');
                br.className = 'word-linebreak';
                container.appendChild(br);
            }

            const wordEl = document.createElement('span');
            wordEl.className = 'word';
            wordEl.dataset.word = wordIndex;

            word.split('').forEach((letter, letterIndex) => {
                const letterEl = document.createElement('span');
                letterEl.className = 'letter';
                letterEl.dataset.word = wordIndex;
                letterEl.dataset.letter = letterIndex;
                letterEl.textContent = letter;
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
        
        // Handle space (word completion)
        if (inputChar === ' ') {
            this.completeWord();
            e.target.value = '';
            return;
        }
        
        // Handle character input
        this.processInput(inputValue);
    }

    handleKeydown(e) {
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
        const input = this.elements.hiddenInput.value.trim();
        
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
        
        // Check if test is complete (for word mode)
        if (this.currentWordIndex >= this.words.length) {
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
        
        // Space counts as correct character
        this.correctChars++;
        SoundSystem.space();
        
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
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.timerValue--;
            this.updateTimer();

            // Last-5-second urgency: crimson rim on the vellum frame.
            if (this.timerValue <= 5 && this.timerValue > 0) {
                SoundSystem.timerWarning();
                if (this.elements.vellumFrame) {
                    this.elements.vellumFrame.classList.add('urgent');
                }
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

        // Drop urgency styling
        if (this.elements.vellumFrame) {
            this.elements.vellumFrame.classList.remove('urgent');
        }

        // Capture previous best BEFORE addTest mutates stats.
        const prevStats = Storage.getStats() || { bestWpm: 0, testsCompleted: 0 };
        const previousBest = prevStats.bestWpm || 0;
        const hadPriorTests = (prevStats.testsCompleted || 0) > 0;

        const results = this.calculateResults();
        Storage.addTest(results);

        const isPersonalBest = hadPriorTests && results.wpm > previousBest;

        if (isPersonalBest) {
            SoundSystem.newRecord();
            this.showToast(`new personal best — ${results.wpm} wpm`, 'success');
        } else {
            SoundSystem.testComplete();
        }

        this.displayResults(results);
        this.showResults();

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
        if (newly.length > 0) {
            // Persist + queue stamps. Stagger so multiple unlocks read clearly.
            newly.forEach((id, i) => {
                Storage.unlockAchievement(id);
                const ach = Achievements.byId(id);
                if (ach) setTimeout(() => this.spawnStamp(ach), 900 + i * 700);
            });
            // Refresh chronicles silently in case the user opens the ledger
            this.renderChronicles();
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
            timeLimit: this.timeLimit
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
        this.elements.resultWpm.textContent = results.wpm;
        this.elements.resultAccuracy.textContent = `${results.accuracy}%`;
        this.elements.resultRaw.textContent = results.rawWpm;
        this.elements.resultChars.textContent = `${results.characters.correct}/${results.characters.incorrect}/${results.characters.total}`;
        this.elements.resultConsistency.textContent = `${results.consistency}%`;
        this.elements.resultTime.textContent = `${results.time}s`;
        this.elements.resultCombo.textContent = results.maxCombo;
        this.elements.resultType.textContent = `${results.mode} ${results.wordCount || results.timeLimit}`;
        
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
        if (this.elements.medalStack) this.elements.medalStack.textContent = '';

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
        
        // Make sure we're on test view
        this.switchView('test');
        
        // Generate new test
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
        if (this.mode === 'words' || this.mode === 'zen') {
            this.elements.liveTimer.textContent = this.timerValue;
        } else {
            // Show elapsed time for quote/code modes
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
                type.textContent = `${test.mode} ${test.wordCount || test.timeLimit}`;

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
            empty.textContent = 'no tests yet \u2014 start typing!';
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
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        this.generateTest();
        SoundSystem.click();
    }

    setTime(time) {
        this.timeLimit = time;
        this.timerValue = time;
        
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.time) === time);
        });
        
        this.updateTimer();
        SoundSystem.click();
    }

    setWordCount(count) {
        this.wordCount = count;
        
        document.querySelectorAll('.word-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.words) === count);
        });
        
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
            fontPx = 16 * window.devicePixelRatio;
            cols = Math.ceil(w / fontPx);
            drops = new Array(cols).fill(0).map(() => Math.random() * -50);
        };
        resize();
        this._rainResize = resize;
        window.addEventListener('resize', resize);

        const draw = () => {
            // Trail fade — translucent fill creates the falling-trail look
            ctx.fillStyle = 'rgba(5, 10, 5, 0.08)';
            ctx.fillRect(0, 0, w, h);
            ctx.font = `${fontPx}px "JetBrains Mono", monospace`;
            for (let i = 0; i < cols; i++) {
                const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
                const x = i * fontPx;
                const y = drops[i] * fontPx;
                // head bright, body dim
                ctx.fillStyle = Math.random() < 0.06 ? '#d4ffa8' : '#4ade80';
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
        if (confirm('Are you sure you want to clear all your typing data? This cannot be undone.')) {
            Storage.clearTests();
            this.updateStatsView();
            this.showToast('All data cleared', 'success');
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
            `   mode  ${lastTest.mode} ${lastTest.wordCount || lastTest.timeLimit}`,
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
