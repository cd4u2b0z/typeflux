/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Main Application
   Flow state typing experience
   ═══════════════════════════════════════════════════════════ */

import { WordGenerator } from './words.js';
import { QuoteGenerator } from './quotes.js';
import { CodeGenerator } from './code.js';
import { SoundSystem } from './sounds.js';
import { ChartSystem } from './chart.js';
import { Storage } from './storage.js';

class TypeFlux {
    constructor() {
        // State
        this.mode = 'words';
        this.timeLimit = 30;
        this.wordCount = 25;
        this.isActive = false;
        this.isPaused = false;
        this.isFinished = false;
        
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
            typingArea: document.querySelector('.typing-area'),
            
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
        
        const inputValue = e.target.value;
        const inputChar = inputValue.slice(-1);
        
        // Start test on first input
        if (!this.isActive && inputValue.length > 0) {
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
        } else {
            this.combo = 0;
            this.updateCombo();
        }
        
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
            
            // Warning sound at 5 seconds
            if (this.timerValue <= 5 && this.timerValue > 0) {
                SoundSystem.timerWarning();
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

        // Calculate results
        const results = this.calculateResults();
        
        // Save test
        const savedTest = Storage.addTest(results);
        
        // Check for new record
        const stats = Storage.getStats();
        if (results.wpm >= stats.bestWpm) {
            SoundSystem.newRecord();
            this.showToast('🎉 New personal best!', 'success');
        } else {
            SoundSystem.testComplete();
        }
        
        // Display results
        this.displayResults(results);
        this.showResults();
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

        // Reset UI
        this.elements.hiddenInput.value = '';
        this.elements.liveStats.classList.remove('active');
        this.elements.comboDisplay.classList.remove('active', 'fire', 'blaze');
        this.elements.wordsDisplay.style.transform = '';

        // Reset live stats display
        this.elements.liveWpm.textContent = '0';
        this.elements.liveAccuracy.textContent = '100';
    }

    restart() {
        // Hide results if showing
        this.elements.viewResults.classList.remove('active');
        this.elements.viewTest.classList.add('active');
        
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
        
        let targetElement;
        
        if (this.currentLetterIndex < this.words[this.currentWordIndex]?.length) {
            // Position at current letter
            targetElement = currentWord.querySelector(`.letter[data-letter="${this.currentLetterIndex}"]`);
        } else {
            // Position after last letter (or extra letters)
            const letters = currentWord.querySelectorAll('.letter');
            targetElement = letters[letters.length - 1];
            
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const containerRect = this.elements.typingArea.getBoundingClientRect();
                
                this.elements.cursor.style.left = `${rect.right - containerRect.left}px`;
                this.elements.cursor.style.top = `${rect.top - containerRect.top}px`;
                return;
            }
        }
        
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            const containerRect = this.elements.typingArea.getBoundingClientRect();
            
            this.elements.cursor.style.left = `${rect.left - containerRect.left}px`;
            this.elements.cursor.style.top = `${rect.top - containerRect.top}px`;
        }
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
        } else if (this.combo >= 10) {
            this.elements.comboDisplay.classList.add('fire');
            this.elements.comboDisplay.classList.remove('blaze');
        } else {
            this.elements.comboDisplay.classList.remove('fire', 'blaze');
        }
        
        // Play combo sound at milestones
        if ([10, 25, 50, 75, 100].includes(this.combo)) {
            SoundSystem.combo(Math.floor(this.combo / 10));
        }
    }

    updateStatsView() {
        const stats = Storage.getStats();
        const tests = Storage.getTests();
        
        this.elements.statsTests.textContent = stats.testsCompleted;
        this.elements.statsBest.textContent = stats.bestWpm;
        this.elements.statsAvg.textContent = stats.averageWpm;
        this.elements.statsTime.textContent = Storage.formatTime(stats.totalTime);
        
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
        
        if (save) {
            this.settings.theme = theme;
            this.updateSetting('theme', theme);
        }
        
        // Redraw charts with new colors
        if (this.elements.historyChart) {
            const tests = Storage.getTests();
            setTimeout(() => ChartSystem.drawHistoryChart(this.elements.historyChart, tests), 100);
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
        
        const text = `typeflux 🚀
━━━━━━━━━━━━━━━━━━━━
wpm: ${lastTest.wpm} | accuracy: ${lastTest.accuracy}%
raw: ${lastTest.rawWpm} | consistency: ${lastTest.characters ? Math.round(lastTest.characters.correct / (lastTest.characters.correct + lastTest.characters.incorrect) * 100) : lastTest.accuracy}%
mode: ${lastTest.mode} ${lastTest.wordCount || lastTest.timeLimit}
━━━━━━━━━━━━━━━━━━━━`;
        
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Result copied to clipboard!', 'success');
        }).catch(() => {
            this.showToast('Failed to copy', 'error');
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
