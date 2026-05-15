/* ═══════════════════════════════════════════════════════════
   TYPEFLUX — Commissions
   The day's work, set upon the desk. Three small charges, drawn
   anew each dawn from a fixed pool by a date-seeded hand, so the
   set is the same all day yet fresh tomorrow. Discharging them is
   the daily loop that gives a returning typewright purpose.
   ═══════════════════════════════════════════════════════════ */

const Commissions = {
    /* The pool. Each commission's `check(ctx)` is run against a
       finished trial; a true return advances its progress by one.
       `target` is how many advances discharge it. ctx carries
       { test, stats, session }. */
    POOL: [
        { id: 'warmup',      label: 'complete three trials',                target: 3,
          check: () => true },
        { id: 'clean',       label: 'finish a trial with a flawless hand',  target: 1,
          check: (c) => c.test.accuracy === 100 },
        { id: 'fervor',      label: 'reach a fervor of forty',              target: 1,
          check: (c) => (c.test.maxCombo || 0) >= 40 },
        { id: 'swift',       label: 'land a trial above seventy-five wpm',  target: 1,
          check: (c) => c.test.wpm >= 75 },
        { id: 'distinction', label: 'earn a grade of S or finer',           target: 1,
          check: (c) => c.test.grade === 'S' || c.test.grade === 'S+' },
        { id: 'prose',       label: 'complete a prose passage',             target: 1,
          check: (c) => c.test.mode === 'prose' },
        { id: 'cipher',      label: 'complete a trial of code',             target: 1,
          check: (c) => c.test.mode === 'code' },
        { id: 'quoted',      label: 'type a quotation in full',             target: 1,
          check: (c) => c.test.mode === 'quotes' },
        { id: 'longglass',   label: 'weather a sixty-second glass',         target: 1,
          check: (c) => c.test.mode === 'words' && c.test.boundBy === 'time'
                        && (c.test.timeLimit || 0) >= 60 },
        { id: 'steady',      label: 'two trials above ninety in accuracy',  target: 2,
          check: (c) => c.test.accuracy >= 90 },
        { id: 'endurance',   label: 'finish a trial of a hundred words',    target: 1,
          check: (c) => (c.test.words || 0) >= 100 },
        { id: 'ascend',      label: 'better thy mean pace in a single hand', target: 1,
          check: (c) => (c.stats.averageWpm || 0) > 0 && c.test.wpm > c.stats.averageWpm }
    ],

    byId(id) {
        return this.POOL.find(c => c.id === id) || null;
    },

    /* FNV-1a hash → an integer seed from the day key. */
    _hash(str) {
        let h = 2166136261;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    },

    /* Deterministic pick of three commission ids for a given day key.
       Same key → same three, all day; a new day → a new draw. */
    pickForDay(dayKey) {
        let s = this._hash(String(dayKey));
        // mulberry32 — a small, stable seeded PRNG
        const rng = () => {
            s = (s + 0x6D2B79F5) | 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const ids = this.POOL.map(c => c.id);
        for (let i = ids.length - 1; i > 0; i--) {
            const j = Math.floor(rng() * (i + 1));
            [ids[i], ids[j]] = [ids[j], ids[i]];
        }
        return ids.slice(0, 3);
    }
};
