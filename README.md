# typeflux

> *An account of the typewright — a typing trial in the manner of an engraved manuscript.*

![edition](https://img.shields.io/badge/edition-prima_v1.2-c8a25c?style=flat-square&labelColor=2d353b)
![license](https://img.shields.io/badge/license-MIT-7fbbb3?style=flat-square&labelColor=2d353b)
![no build](https://img.shields.io/badge/build-none-a7c080?style=flat-square&labelColor=2d353b)
![no install](https://img.shields.io/badge/install-double--click-d699b6?style=flat-square&labelColor=2d353b)

A typing test rendered as a field manual — engraved plates, gilt corners, drifting paper motes. Cinzel for the engraved hand, EB Garamond italic for marginalia, JetBrains Mono reserved for the letterpress of the trial itself. No framework, no bundler, no build step.

---

## Install

There is no install. There is no `npm install`. There is no `pip`. There is nothing to compile.

1. **Download** — clone the repo, or click `Download ZIP` on Codeberg and unzip wherever.
2. **Open** — double-click `index.html`.
3. **Type.**

Modern browsers only — Firefox, Chrome, LibreWolf, Brave, Safari. No browser extensions required.

---

## Plate I — The Field

Four manners of trial, set upon a vellum field with gold corner brackets:

- **words** — random words drawn from a curated lexicon
- **quotes** — passages from authors, programmers, and thinkers
- **code** — real snippets across fifteen languages: JavaScript, TypeScript, Python, Rust, Go, C, C++, Zig, Ruby, Lua, Bash, SQL, Haskell, HTML, CSS
- **zen** — an endless stream, for the practice of pure flow

The glass (timer) may be set to 15, 30, 60, or 120 seconds. Count to x, xxv, l, or c.

### Kinesthetics — the feel of the keystroke

- **Cursor trail.** Two ghost cursors lag behind the main one, pooling gold as you pause and lengthening as you accelerate.
- **Word-pop.** Each correctly-completed word scales briefly and breathes a gold halo — the page acknowledges you.
- **Ready countdown.** Before each trial, an engraved ring rises and counts *III · II · I · GO*. Toggleable at the desk.
- **Last-5-second urgency.** When the glass falls under five, the vellum rim flares crimson, corners flicker, the timer numeral thumps.
- **Fervor seal.** A circular medallion that breathes gold at five hits, ignites amber **fire** at ten, and burns crimson **blaze** at twenty-five.

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

Each trial is recorded. Five accountings are kept:

| key | what |
|---|---|
| I | trials concluded |
| II | crest of pace — your best WPM |
| III | mean pace — your average WPM |
| IV | hours at the desk |
| **V** | **days unbroken — consecutive days with at least one trial** |

A chart of pace across all trials follows, and a roll of the ten most recent. Strike from the record at your pleasure.

### The Chronicles — twenty-two seals across four orders

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
| midnight | Everforest Night | warm green-grey, gilt (default) | drifting gold motes |
| aurora   | Astrolabe        | deep indigo, silvered moon      | drifting silver/cyan motes |
| sunset   | Sanguine Codex   | oxblood and cream               | **halo warms with your combo** |
| forest   | Verdant Folio    | deep moss, bone, sage           | drifting forest motes |
| ocean    | Tidal Atlas      | teal-black and gold             | drifting teal motes |
| lavender | Mauve Apocrypha  | aubergine and rose-gold         | drifting plum motes |
| paper    | Vellum Manuscript| light parchment, ink, vermillion| **ink-bleed on errors** |
| matrix   | Phosphor Tube    | terminal green on near-black    | **Canvas2D digital rain · CRT scanlines · chromatic-aberration cursor** |

Further rites at the desk:

- stature of the letter (font size)
- gliding caret · live pace declaration · *at the ready* (countdown)
- voice of the quill (key sounds) + strength of voice
- stay upon thine error · confidence of the hand (no backspace) · blind passage

## The Certificate

Upon conclusion, the trial is sealed: a ringed grade medallion with compass ticks, the grand pace and accuracy in Cinzel caps, a six-row ledger of details, a chart of pace through the glass, and a seal line — *signed this day, by your own hand*.

A **marginalia tip** sits beneath, in italic Garamond — a one-line counsel drawn from the language you typed (eight per language, twenty for prose) so the certificate teaches as well as scores.

**Personal best.** If your net WPM exceeds every previous trial, a wax-stamped gold sash slams in above the certificate reading **NEW PERSONAL BEST**, the grade letter shimmers, and forty-eight confetti drift fullscreen.

**Newly-earned seals** stamp themselves onto the certificate in succession after the trial — gold wax, slammed in from the right, held a beat, then receded into the Chronicles.

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
│   ├── code.js         15-language snippet corpus + tips
│   ├── achievements.js 22 seals across four orders
│   ├── sounds.js       Web Audio synthesised keystrokes
│   ├── chart.js        canvas pace charts
│   └── storage.js      localStorage settings, history, streak,
│                       achievements, themes/languages/modes used
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
<p align="center"><sub>editio prima · v1.2 · by Dr. Baklava</sub></p>
