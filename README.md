# typeflux

> *An account of the typewright — a typing trial in the manner of an engraved manuscript.*

![edition](https://img.shields.io/badge/edition-prima_v1.5-c8a25c?style=flat-square&labelColor=2d353b)
![license](https://img.shields.io/badge/license-MIT-7fbbb3?style=flat-square&labelColor=2d353b)
![no build](https://img.shields.io/badge/build-none-a7c080?style=flat-square&labelColor=2d353b)
![no install](https://img.shields.io/badge/install-double--click-d699b6?style=flat-square&labelColor=2d353b)

A typing test rendered as a field manual — engraved plates, gilt corners, drifting paper motes. Cinzel for the engraved hand, EB Garamond italic for marginalia, JetBrains Mono reserved for the letterpress of the trial itself. No framework, no bundler, no build step.

---

## Install

There is no install. There is no `npm install`. There is no `pip`. There is nothing to compile.

### Download — pick one

**A. Clone the repo** *(recommended; gets you `git pull` updates)*
```sh
git clone https://codeberg.org/cdubz/typeflux.git
```

**B. Download as ZIP**
- On Codeberg: open the repo, click the `…` menu near the branch picker, choose **Download ZIP**.
- Save the archive anywhere, then **right-click → Extract All** (or `unzip typeflux.zip`).

**C. Save individual files** *(only if you must)*
You'll need every file under `index.html`, `css/`, and `js/` — see [Structure](#structure) below. They reference each other by relative path; missing one and the page won't load. The clone or ZIP route is far easier.

### Open

Double-click `index.html`. That's it. The page opens in your default browser and runs entirely from disk over `file://` — no server, no internet connection required after the first load.

> **Folder layout matters.** `index.html`, the `css/` folder, and the `js/` folder must sit side-by-side, exactly as in the repo. Don't move the HTML out of the project folder, and don't flatten the `css/` and `js/` directories — the script and stylesheet links are relative.

### Updates

If you cloned: `git pull` inside the folder.
If you ZIP'd: re-download and overwrite. Your trial history, settings, seals, and streak live in `localStorage` and survive a re-download.

### Browsers

Modern only — Firefox, Chrome, LibreWolf, Brave, Edge, Safari. No browser extensions required. Mobile browsers technically work but the page is built for a real keyboard.

---

## Plate I — The Field

Five manners of trial, set upon a vellum field with gold corner brackets:

- **words** — random words drawn from five curated lexicons (common, medium, advanced, programming, rhythmic flow) — two hundred words apiece
- **quotes** — over 1,600 attributed lines: film and television, world and American history, authors and poets, philosophers, and the classic public-domain library
- **prose** — real, everyday English: working correspondence and plain talk, set as coherent passages. The sentences a hand actually writes on a working day — meeting follow-ups, plans for the weekend, the kind of text you type for real.
- **code** — real snippets across fifteen languages: JavaScript, TypeScript, Python, Rust, Go, C, C++, Zig, Ruby, Lua, Bash, SQL, Haskell, HTML, CSS. **Indentation is real** — every space, tab, and line break is a required keystroke. Lines are completed with `Enter`; indent depth shows as faint middle-dots so the eye reads it without ambiguity. The active line gets a gold rule down its left edge.
- **zen** — a **truly endless** stream, for the practice of pure flow. No glass, no word count, no grade, no conclusion — the buffer is topped up as you go, and the trial ends only when you walk away.

The **glass is optional** across words, quotes, prose, and code. A **words** trial is bounded one of two ways — choose a **Glass** (15, 30, 60, or 120 seconds) for a *timed* trial that counts down, or a **Count** (x, xxv, l, c) for a *count-bound* trial of a fixed number of words. **Quotes, prose, and code** may likewise be run under a glass — pick a duration and the content feeds endlessly until the glass empties — or choose **free** to simply complete one passage or snippet at your own pace. Zen alone is never timed. Whichever knob does not govern the trial is muted; every trial is labelled with its unit — `words · 30 seconds`, `quotes · passage`, `code · 60 seconds` — never a bare, ambiguous number.

### Kinesthetics — the feel of the keystroke

- **Cursor trail.** Two ghost cursors lag behind the main one, pooling gold as you pause and lengthening as you accelerate.
- **Word-pop.** Each correctly-completed word scales briefly and breathes a gold halo — the page acknowledges you.
- **Ready countdown.** Before a *timed* trial, an engraved ring rises and counts *III · II · I · GO* — a glass is about to run. Untimed passages, count-bound words, and zen begin straight away. Toggleable at the desk.
- **Last-5-second urgency.** When the glass falls under five, the vellum rim flares crimson, corners flicker, the timer numeral thumps — and the wider room responds: the lantern halo warms to crimson and breathes; drifting motes shift colour; matrix rain (if active) turns its heads to amber. Gentle, not strobing.
- **Ghost runs — race thy past best.** Beat your prior best for a format and the run is sealed as a **ghost**: a translucent teal cursor that, on every subsequent trial, replays its pace word-by-word. A flag floats above it — *your best · N wpm* — and when you fall behind it goes gold and the field warms. The tracer races you in **every manner of trial** — words, quotes, prose, code (the content may differ run to run, so it paces by word index, a fair rival for the sport of it). Toggle it off at the desk if you'd rather run alone.
- **A counsel above the field.** A quiet one-line italic above the vellum, drawn from your recent trials — *"a ghost waits for this format at 67 wpm — race it"*, *"thy accuracy hath slipped of late — slow thy pace"*, *"thy pace hath plateaued near 54 wpm — try a longer glass."* Hidden when there's nothing useful to say.
- **Fervor seal.** A circular medallion that breathes gold at five hits, ignites amber **fire** at ten, and burns crimson **blaze** at twenty-five.
- **The letterpress.** The caret has mass — it stretches in the direction of travel on a word advance, taller on a line drop, then settles. Each struck letter presses into the vellum; a wrong one blots with a soft crimson ink-stain.
- **The room breathes.** A low drone underlies the trial, swelling with your fervor and receding as it cools — felt more than heard.
- **Music of the desk.** A soft, original "desk jazz" loop plays low beneath the trial — warm electric-piano chords over a muted bass pulse and the faintest brushed texture, an 8-bar progression scheduled against the audio clock and lightly randomized so it never repeats mechanically. Fully synthesised (Web Audio, no files), conservative in level, toggleable at the desk.
- **A living interface.** Hovering controls, selecting, toggling, dragging a slider, changing a theme — each carries a soft, varied, procedurally-synthesised sound. Quiet and rate-limited; never a machine-gun. Silenced entirely with the sound toggle.
- **Ghost-warmth.** When you pace ahead of your ghost, the field takes on a faint gold warmth — the bright counterpart to the crimson of urgency.

### Medals — fleeting honours of the trial

Small bronze cards that flash in from the right of the field as you earn them — gone in a breath, but felt. Four tiers of finish (gold · teal · plum · crimson) and a dozen ways in:

- **First Blood** — the first correct word of the trial.
- **Double · Triple Flourish** — two and three perfect words in succession.
- **The Spree** (✚) — five perfect words running.
- **Consummate** — ten perfect words running.
- **Flawless** — fifteen perfect words running.
- **Transcendent** — twenty perfect words running (legendary, with crimson flare).
- **Heavy Hand** (⊞) — close out a long word with no errors.
- **Snap** (☇) — close a word in under three hundred milliseconds.
- **Crescendo** — sustain a high pace mid-trial.
- **Thunderclap** — exceed your average pace by a wide margin.
- **Overture** — hit a peak pace within the trial.
- **Last Gasp** (⧗) — finish a perfect word inside the final five seconds.

## Plate II — The Ledger

### The typewright — who you become

The ledger opens with a persistent identity carried across every session:

- **Rank** — a title raised by trials weathered and the crest of pace reached, from *Apprentice of the Desk* through *Scrivener*, *Copyist*, *Cartographer*, *Master Typewright*, to *Grand Archivist*. A pressed wax seal sits beside it, its tier engraved in Roman and its detail — tick ring, outer halo — *growing as you rise*. The current rank also rides as a small chip on the frontispiece. Raising it draws a quiet honour, distinct from the seals.
- **Nemesis** — the single word that has felled your hand most across all trials past, named on a writ pinned askew to the desk with crimson ink bled behind it. **Settle the score** opens a trial laced with that very word — and the nemesis is *defeatable*: land five clean strikes against it and it is **vanquished**, struck from the writ for good, the next-worst word rising to take its place.
- **The signature of thy hand** — a radar self-portrait across five axes: pace, accuracy, consistency, endurance, range. A shape that is yours, and shifts over weeks.

### The day's commissions — three charges, renewed each dawn

Below the typewright sits the daily loop: **three commissions**, drawn from a fixed pool by a date-seeded hand — the same set all day, a fresh draw tomorrow. They reward *deeds*, not raw speed: *finish a trial with a flawless hand*, *reach a fervor of forty*, *complete a prose passage*, *better thy mean pace in a single hand*. Each is measured against every trial you conclude; discharging one is announced, and discharging all three draws a fanfare. A reason to take up the pen on a day the personal best feels far off.

### Continuity — the desk remembers you

- **The desk is restored** — mode, glass, count, theme, and every setting are as you left them when you return.
- **A returning greeting** meets you at the door — *the desk has waited two days · Scrivener · 5 days unbroken · thy last hand — 71 wpm*.
- **Milestones** are marked as moments — thy tenth, fiftieth, hundredth trial; a week, a month unbroken — so a long account never reads as a flat number.
- **The sitting** — once a visit holds two trials or more, the certificate notes its shape: *this sitting — 4 trials · 68 mean pace*.

Each trial is recorded. Five accountings are kept:

| key | what |
|---|---|
| I | trials concluded |
| II | crest of pace — your best WPM |
| III | mean pace — your average WPM |
| IV | hours at the desk |
| **V** | **days unbroken — consecutive days with at least one trial** |

A chart of pace across all trials follows, and a roll of the ten most recent. Strike from the record at your pleasure.

### The Chronicles — twenty-five seals across four orders

Wax-stamped seals earned through real signals — never grinding for its own sake. When unlocked, the seal slams down upon the certificate with its motto in italic Garamond. The grid lives on the ledger.

| order | what it honours | seals |
|---|---|---|
| **skill** | what you can do at the keyboard | First Mark · The Steady Hand · Three Blades · Lightning · The Galloper · Master of the Glass · Perfect Glass |
| **breadth** | what you've sought out | The Wanderer · The Polyglot · The Lexicographer · The Cartographer |
| **endurance** | what you've sustained | The Apprentice · The Journeyman · Master of the Hall · The Hour at the Desk · The Day at the Desk · The Unbroken Quill · The Long Watch |
| **secret** | unusual moments | *four hidden — earned, not announced* |

Each seal carries a Latin motto, a single Unicode device, and a one-sentence rule. Locked seals show their device dimmed; secret seals show only `?` until earned.

## Plate III — The Scrivener's Desk

Eight palettes of the page — each a complete atmosphere, not a colour swap. Several have a *quirk* unique to the theme:

| key | name | character | quirk |
|---|---|---|---|
| midnight | Everforest Night | warm green-grey, gilt (default) | **a constellation of twinkling stars** + drifting gold motes |
| aurora   | Astrolabe        | deep indigo, silvered moon      | **shimmering aurora bands drift overhead** + silver/cyan motes |
| sunset   | Sanguine Codex   | oxblood and cream               | **halo warms with your combo** |
| forest   | Verdant Folio    | deep moss, bone, sage           | **stylised leaves tumble down the page** + forest motes |
| ocean    | Tidal Atlas      | teal-black and gold             | **slow horizontal tide bands drift sideways across the field** + teal motes |
| lavender | Mauve Apocrypha  | aubergine and rose-gold         | **broad incense plumes rise from the lower edge** + plum motes |
| paper    | Vellum Manuscript| light parchment, ink, vermillion| **ink-bleed on errors** |
| matrix   | Phosphor Tube    | terminal green on near-black    | **Canvas2D digital rain · CRT scanlines · chromatic-aberration cursor** |

Further rites at the desk:

- stature of the letter (font size)
- gliding caret · live pace declaration · *at the ready* (countdown)
- voice of the quill (key sounds) + strength of voice
- **music of the desk** — a soft procedural lounge layer (see below)
- stay upon thine error · confidence of the hand (no backspace) · blind passage
- **ambient atmosphere** (master toggle) and **depth of atmosphere** (intensity 0–100%) — shut off all per-theme effects with one switch, or scale them softer/louder

### Of the Vault — seal & restore the ledger

All your records — settings, every trial, streak, and seal — live in your browser's `localStorage`. Two buttons at the desk let you carry them across machines or back them up:

- **seal & download** — writes a `typeflux-ledger-YYYY-MM-DD.json` file containing every record. Save it where you like.
- **select a ledger** — pick a previously-sealed JSON file. You're shown the trial count and seal date, then asked to confirm; on confirmation it **replaces** all current records. Seal your present ledger first if you don't want to lose it.

The format is versioned (`format: "typeflux-ledger"`, `version: 1`) so a newer edition can refuse archives shaped wrong.

### Of Affliction — optional burdens

Eight visual debuffs you may take up at your choosing — all **off by default**. None intercept input or alter timing — they only test the eye. Combine as you dare; remove them whenever. All respect `prefers-reduced-motion`.

| affliction | what it does |
|---|---|
| **the mist** | words yet to come fade into vapour at the page's right edge |
| **the fading ink** | words past dim to a faint impression behind you |
| **the dim lantern** | the lantern halo darkens and gutters; the room sinks into shadow |
| **the narrow eye** | the field is veiled at its left, right, top and bottom — only the centre is plain |
| **the cramped hand** | the letters are set tight upon the line, crowding the eye |
| **the guttering candle** | the lantern light flickers and gutters as if caught in a draught |
| **the foxed page** | age-stains bloom across the vellum, mottling the field |
| **the heavy air** | the ink wans, its contrast washed thin as through a haze |

## The Certificate

Upon conclusion, the trial is sealed: a ringed grade medallion with compass ticks, the grand pace and accuracy in Cinzel caps, a six-row ledger of details, a chart of pace through the glass, and a seal line — *signed this day, by your own hand*.

The certificate is **revealed in stages**, not all at once — the title rises, the grade is *stamped* down, the two grand numbers roll up from nought, the ledger draws in one hairline row at a time, then the chart, defects, and honours follow. An orchestrated reveal, collapsed to a plain fade under `prefers-reduced-motion`.

The **restart button carries the reason to press it** — *"3 wpm shy of thy best — again"*, *"a breath from an S — again"*, *"so near a clean hand — again"*. A fresh trial is never just a fresh trial.

A **marginalia tip** sits beneath, in italic Garamond — a one-line counsel drawn from the language you typed (eight per language, twenty for prose) so the certificate teaches as well as scores.

A **defect ledger** records the words you faltered on most this trial, in monospace, with a one-line counsel that names the actual pattern — *"thy hand stumbles often on `qu` — set thy practice there"*, *"capitals are costing thee — the shift hand needs drilling"*, *"double letters trip the hand — slow the second strike."* Hidden when nothing was missed.

**Personal best.** If your net WPM exceeds every previous trial, a wax-stamped gold sash slams in above the certificate reading **NEW PERSONAL BEST**, the grade letter shimmers, and forty-eight confetti drift fullscreen.

**Newly-earned seals** stamp themselves onto the certificate in succession after the trial — gold wax, slammed in from the right, held a beat, then receded into the Chronicles.

### Honours of this Trial — the post-summary register

Beneath the chart, a **roll of honours** lists every medal flashed during the trial (with `×N` if you earned it more than once) alongside any seal newly impressed upon the Chronicles. Each chip is coloured by tier (gold · teal · plum · crimson) or by seal order (skill · breadth · endurance · secret). If the trial earned no honours, a single italic line marks it: *no honours this trial; the next, perhaps.*

---

## Keyboard

| key | act |
|---|---|
| `Tab` + `Enter` | begin afresh |
| `Esc` | reset the glass |
| any letter | auto-focus the field |

## Structure

```
typeflux/
├── index.html          frontispiece + plates I/II/III + certificate
├── css/
│   ├── styles.css      vellum frame, fervor seal, certificate,
│   │                   countdown, urgency, PB ribbon, confetti
│   └── themes.css      eight palettes (midnight default)
├── js/
│   ├── app.js          state machine, key handling, view routing,
│   │                   countdown, urgency, PB, matrix rain,
│   │                   medals, stamp queue, chronicles render
│   ├── words.js        word generator + lexicons
│   ├── quotes.js       quote corpus
│   ├── sentences.js    everyday-English prose passages
│   ├── code.js         15-language snippet corpus + tips
│   ├── achievements.js 25 seals across four orders
│   ├── commissions.js  daily commission pool + date-seeded draw
│   ├── sounds.js       Web Audio — keystrokes, drone, music, UI audio
│   ├── chart.js        canvas pace charts
│   └── storage.js      localStorage settings, history, streak,
│                       achievements, ghosts, misses, commissions
```

## Pace, by the formula

```
gross wpm = (characters typed / 5) / minutes
net wpm   = gross wpm − (errors / minutes)
```

Five characters reckoned as one word, in the standard manner.

## Grading

The grade is the product of net WPM and accuracy:

| grade | score (wpm × acc%) |
|---|---|
| S+ | 100+ |
| S  | 80–99 |
| A+ | 65–79 |
| A  | 55–64 |
| B+ | 45–54 |
| B  | 35–44 |
| C+ | 25–34 |
| C  | 15–24 |
| D  | < 15 |

## Tools

- vanilla JavaScript — no framework, no bundler, no transpiler
- Web Audio API for synthesised keystroke audio
- Canvas 2D for pace charts and the matrix-theme rain
- CSS custom properties for the palette switch and `:has()` for combo-reactive atmosphere
- `localStorage` for settings, trial history, and the daily streak

## Accessibility

- Respects `prefers-reduced-motion` — countdown, urgency, PB ribbon, confetti, drifting motes, word-pop, medal flashes, and seal-stamp slams all stop animating
- All controls are real `<button>` and `<input>` elements; full keyboard navigation
- Focus rings rendered in gold (`outline: 1px solid var(--gold)`)

## License

MIT — use, modify, share.

---

<p align="center"><em>set thy hand to the field. let the glass run.</em></p>
<p align="center"><sub>editio prima · v1.4 · by Dr. Baklava</sub></p>
