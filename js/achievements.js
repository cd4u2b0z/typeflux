/* ═══════════════════════════════════════════════════════════════
   TYPEFLUX — The Chronicles
   ─────────────────────────────────────────────────────────────
   Twenty-two seals across four orders. Each seal is earned by a
   real signal — skill threshold, deliberate breadth, sustained
   practice, or an unusual moment. Voice: chivalric Latin motto,
   plain-English rule.

   Categories:
     skill      — what you can do at the keyboard
     breadth    — what you've sought out
     endurance  — what you've sustained
     secret     — hidden until earned

   Each entry exposes:
     id        — stable, lowercase + dashes
     name      — display title (Cinzel caps in the UI)
     motto     — Latin one-liner (italic Garamond)
     rule      — plain-English unlock condition (one sentence)
     glyph     — single Unicode character used as the seal device
     category  — one of the four above
     secret    — boolean; secret seals show as "?" when locked
     check(ctx)— evaluates the rule against the current context
   ═══════════════════════════════════════════════════════════════ */

/* Grade calculation duplicated here so achievements.js has no
   dependency on app.js. Keep in sync if grading thresholds change. */
function _gradeScore(wpm, accuracy) {
    return wpm * (accuracy / 100);
}
function _gradeOf(wpm, accuracy) {
    const s = _gradeScore(wpm, accuracy);
    if (s >= 100) return 'S+';
    if (s >=  80) return 'S';
    if (s >=  65) return 'A+';
    if (s >=  55) return 'A';
    if (s >=  45) return 'B+';
    if (s >=  35) return 'B';
    if (s >=  25) return 'C+';
    if (s >=  15) return 'C';
    return 'D';
}

/* Helpers */
function _lastNGrades(tests, n) {
    return tests.slice(-n).map(t => _gradeOf(t.wpm, t.accuracy));
}
function _localHour(ts) {
    return new Date(ts || Date.now()).getHours();
}

const ACHIEVEMENTS = [
    /* ── SKILL ────────────────────────────────────────────────── */
    {
        id: 'first-mark', category: 'skill',
        name: 'First Mark', motto: 'primum vestigium',
        rule: 'Conclude the first trial.',
        glyph: '✦',
        check: (c) => c.tests.length >= 1
    },
    {
        id: 'steady-hand', category: 'skill',
        name: 'The Steady Hand', motto: 'manus firma',
        rule: '100% accuracy on a trial of twenty-five words or more.',
        glyph: '❉',
        check: (c) => c.test.accuracy === 100
                   && (c.test.wordCount >= 25 || c.test.words >= 25)
    },
    {
        id: 'three-blades', category: 'skill',
        name: 'Three Blades', motto: 'tria gladia',
        rule: 'Three S-grade trials in succession.',
        glyph: '✚',
        check: (c) => {
            const last = _lastNGrades(c.tests, 3);
            if (last.length < 3) return false;
            const ok = ['S', 'S+'];
            return last.every(g => ok.includes(g));
        }
    },
    {
        id: 'first-canter', category: 'skill',
        name: 'First Canter', motto: 'cursus primus',
        rule: 'Break forty words per minute.',
        glyph: '✧',
        check: (c) => c.test.wpm >= 40
    },
    {
        id: 'easy-stride', category: 'skill',
        name: 'The Easy Stride', motto: 'gradus facilis',
        rule: 'Break sixty words per minute.',
        glyph: '❂',
        check: (c) => c.test.wpm >= 60
    },
    {
        id: 'long-rein', category: 'skill',
        name: 'A Long Rein', motto: 'habena longa',
        rule: 'Break eighty words per minute.',
        glyph: '☄',
        check: (c) => c.test.wpm >= 80
    },
    {
        id: 'lightning', category: 'skill',
        name: 'Lightning', motto: 'fulmen',
        rule: 'Break one hundred words per minute.',
        glyph: '☇',
        check: (c) => c.test.wpm >= 100
    },
    {
        id: 'galloper', category: 'skill',
        name: 'The Galloper', motto: 'equus volatilis',
        rule: 'Break one hundred and twenty words per minute.',
        glyph: '♞',
        check: (c) => c.test.wpm >= 120
    },
    {
        id: 'master-of-glass', category: 'skill',
        name: 'Master of the Glass', motto: 'magister vitri',
        rule: 'Earn S+ upon a sixty-second words trial.',
        glyph: '☉',
        check: (c) => c.test.mode === 'words'
                   && c.test.timeLimit === 60
                   && _gradeOf(c.test.wpm, c.test.accuracy) === 'S+'
    },
    {
        id: 'perfect-glass', category: 'skill',
        name: 'Perfect Glass', motto: 'vitrum perfectum',
        rule: 'A thirty-second trial, flawless, at eighty WPM or above.',
        glyph: '◈',
        check: (c) => c.test.mode === 'words'
                   && c.test.timeLimit === 30
                   && c.test.accuracy === 100
                   && c.test.wpm >= 80
    },

    /* ── BREADTH ──────────────────────────────────────────────── */
    {
        id: 'wanderer', category: 'breadth',
        name: 'The Wanderer', motto: 'viator omnium',
        rule: 'Complete a trial in every manner — words, quotes, code, zen.',
        glyph: '✤',
        check: (c) => {
            const need = ['words', 'quotes', 'code', 'zen'];
            return need.every(m => c.state.modesUsed.includes(m));
        }
    },
    {
        id: 'polyglot', category: 'breadth',
        name: 'The Polyglot', motto: 'lingua quinque',
        rule: 'Type code in five different languages.',
        glyph: '※',
        check: (c) => c.state.languagesUsed.length >= 5
    },
    {
        id: 'lexicographer', category: 'breadth',
        name: 'The Lexicographer', motto: 'lexica decem',
        rule: 'Type code in ten different languages.',
        glyph: '❦',
        check: (c) => c.state.languagesUsed.length >= 10
    },
    {
        id: 'cartographer', category: 'breadth',
        name: 'The Cartographer', motto: 'omnes regiones',
        rule: 'Set hand to the field beneath all eight palettes.',
        glyph: '❖',
        check: (c) => c.state.themesUsed.length >= 8
    },

    /* ── ENDURANCE ────────────────────────────────────────────── */
    {
        id: 'apprentice', category: 'endurance',
        name: 'The Apprentice', motto: 'tiro',
        rule: 'Conclude ten trials.',
        glyph: '✜',
        check: (c) => c.stats.testsCompleted >= 10
    },
    {
        id: 'journeyman', category: 'endurance',
        name: 'The Journeyman', motto: 'operarius',
        rule: 'Conclude fifty trials.',
        glyph: '⊞',
        check: (c) => c.stats.testsCompleted >= 50
    },
    {
        id: 'master-of-hall', category: 'endurance',
        name: 'Master of the Hall', motto: 'magister aulae',
        rule: 'Conclude two hundred and fifty trials.',
        glyph: '♔',
        check: (c) => c.stats.testsCompleted >= 250
    },
    {
        id: 'hour-at-desk', category: 'endurance',
        name: 'The Hour at the Desk', motto: 'hora ad mensam',
        rule: 'Spend an hour at the desk, all told.',
        glyph: '⧗',
        check: (c) => c.stats.totalTime >= 3600
    },
    {
        id: 'day-at-desk', category: 'endurance',
        name: 'The Day at the Desk', motto: 'dies ad mensam',
        rule: 'Spend a full day at the desk, all told.',
        glyph: '⧖',
        check: (c) => c.stats.totalTime >= 86400
    },
    {
        id: 'unbroken-quill', category: 'endurance',
        name: 'The Unbroken Quill', motto: 'calamus integer',
        rule: 'Type on seven consecutive days.',
        glyph: '✐',
        check: (c) => c.streak >= 7
    },
    {
        id: 'long-watch', category: 'endurance',
        name: 'The Long Watch', motto: 'vigilia longa',
        rule: 'Type on thirty consecutive days.',
        glyph: '☽',
        check: (c) => c.streak >= 30
    },

    /* ── SECRET ───────────────────────────────────────────────── */
    {
        id: 'midnight-oil', category: 'secret', secret: true,
        name: 'Midnight Oil', motto: 'oleum noctis',
        rule: 'Conclude a trial between midnight and four in the morning.',
        glyph: '✷',
        check: (c) => {
            const h = _localHour(c.test.timestamp);
            return h >= 0 && h < 4;
        }
    },
    {
        id: 'dawn-patrol', category: 'secret', secret: true,
        name: 'Dawn Patrol', motto: 'vigilia primae lucis',
        rule: 'Conclude a trial between five and seven of the morning.',
        glyph: '✺',
        check: (c) => {
            const h = _localHour(c.test.timestamp);
            return h >= 5 && h < 7;
        }
    },
    {
        id: 'triple-blaze', category: 'secret', secret: true,
        name: 'Triple Blaze', motto: 'tres flammae',
        rule: 'Reach blaze tier three times in a single sitting.',
        glyph: '✹',
        check: (c) => (c.session && c.session.blazes >= 3)
    },
    {
        id: 'returning-hand', category: 'secret', secret: true,
        name: 'The Returning Hand', motto: 'manus rediens',
        rule: 'Conclude a trial thirty days after the last.',
        glyph: '❀',
        check: (c) => {
            // tests is post-add, so the previous trial is at index -2
            if (c.tests.length < 2) return false;
            const cur  = c.tests[c.tests.length - 1];
            const prev = c.tests[c.tests.length - 2];
            const gap = cur.timestamp - prev.timestamp;
            return gap >= 30 * 24 * 60 * 60 * 1000;
        }
    }
];

const Achievements = {
    all() { return ACHIEVEMENTS; },

    byId(id) { return ACHIEVEMENTS.find(a => a.id === id) || null; },

    /* Evaluate a context and return the IDs of every achievement
       whose check is satisfied AND that isn't already unlocked. */
    evaluate(context) {
        const unlocked = (context.state && context.state.unlocked) || {};
        const newly = [];
        for (const a of ACHIEVEMENTS) {
            if (unlocked[a.id]) continue;
            try {
                if (a.check(context)) newly.push(a.id);
            } catch (e) {
                console.error('achievement check failed:', a.id, e);
            }
        }
        return newly;
    },

    /* Counts for the chronicles header */
    summary(state) {
        const unlocked = (state && state.unlocked) || {};
        const total = ACHIEVEMENTS.length;
        const earned = Object.keys(unlocked).filter(k => Achievements.byId(k)).length;
        return { earned, total };
    }
};
