# typeflux

> *An account of the typewright — a typing trial in the manner of an engraved manuscript.*

![version](https://img.shields.io/badge/edition-prima_v1.0-c8a25c?style=flat-square&labelColor=2d353b)
![license](https://img.shields.io/badge/license-MIT-7fbbb3?style=flat-square&labelColor=2d353b)
![no build](https://img.shields.io/badge/build-none-a7c080?style=flat-square&labelColor=2d353b)

A typing test rendered as a field manual: Cinzel for the engraved hand, EB Garamond for the marginalia, JetBrains Mono for the letterpress of the trial itself. No framework. No build step. Open and type.

---

## Plate I — The Field

Four manners of trial, set upon a vellum field with engraved gold corners:

- **words** — random words drawn from a curated lexicon
- **quotes** — passages from authors, programmers, and thinkers
- **code** — real snippets in JavaScript, Python, Rust, TypeScript, Go, CSS, and SQL
- **zen** — an endless stream, for the practice of pure flow

The glass (timer) may be set to 15, 30, 60, or 120 seconds. Word count to x, xxv, l, or c.

## Plate II — The Ledger

Each trial is recorded. The ledger keeps:

- trials concluded · crest of pace · mean pace · hours at the desk
- a chart of pace across all trials past
- a roll of the most recent trials

Strike from the record at your pleasure.

## Plate III — The Scrivener's Desk

Eight palettes of the page — each defined as a complete atmosphere, not a colour swap:

| key | name | character |
|---|---|---|
| midnight | Everforest Night | warm green-grey night, gilt accent (default) |
| aurora   | Astrolabe        | deep indigo, silvered moon |
| sunset   | Sanguine Codex   | oxblood and cream |
| forest   | Verdant Folio    | deep moss, bone, sage |
| ocean    | Tidal Atlas      | teal-black and gold |
| lavender | Mauve Apocrypha  | aubergine and rose-gold |
| paper    | Vellum Manuscript| light parchment, ink black, vermillion |
| matrix   | Phosphor Tube    | terminal green on near-black |

Further rites at the desk:

- stature of the letter (font size)
- gliding caret · live pace declaration
- voice of the quill (key sounds) + strength of voice
- stay upon thine error · confidence of the hand (no backspace) · blind passage

## The Certificate

Upon conclusion, the trial is sealed: a ringed grade medallion, the grand pace and accuracy, a six-row ledger of details, a chart of pace through the glass, and a seal line — *signed this day, by your own hand*.

A combo system runs alongside as the **fervor seal**: a circular medallion that breathes gold at five, ignites amber at ten (*fire*), and burns crimson at twenty-five (*blaze*).

---

## Quick start

Open `index.html` directly in a browser — works under `file://` with no server. Or, to serve over HTTP:

```sh
./serve.sh           # http://localhost:8080 via python3 -m http.server
./serve.sh 9000      # custom port
```

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
│   ├── styles.css      engraved layout, vellum frame, fervor seal, certificate
│   └── themes.css      eight palettes (midnight default; matrix, paper, et al.)
└── js/
    ├── app.js          state machine, key handling, view routing
    ├── words.js        word generator + lexicons
    ├── quotes.js       quote corpus
    ├── code.js         code snippet corpus
    ├── sounds.js       Web Audio synthesised keystrokes
    ├── chart.js        canvas pace charts
    └── storage.js      localStorage settings & history
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

- vanilla JavaScript (no framework, no bundler)
- Web Audio API for synthesised keystroke audio
- Canvas 2D for charts
- CSS custom properties for the palette switch
- `localStorage` for settings and trial history

## License

MIT — use, modify, share.

---

<p align="center"><em>set thy hand to the field. let the glass run.</em></p>
<p align="center"><sub>editio prima · v1.0 · by Dr. Baklava</sub></p>
