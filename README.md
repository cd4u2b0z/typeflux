# 󰌌 typeflux

> **Flow state typing** — A beautiful, feature-rich typing test that makes practice feel like play.

![typeflux](https://img.shields.io/badge/version-1.0.0-purple?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

##  Features

### 󰊗 Multiple Modes
- **Words** — Classic random word typing with time limits
- **Quotes** — Inspiring quotes from thought leaders and programmers
- **Code** — Real code snippets in JavaScript, Python, Rust, TypeScript, Go, CSS & SQL
- **Zen** — Endless flow-optimized words for pure practice

### 󰄧 Real-time Statistics
- Live WPM (words per minute) tracking
- Accuracy percentage
- Character breakdown (correct/incorrect/total)
- Consistency score based on WPM variance
- Combo system with milestone sounds

### 󰏘 Beautiful Themes
- **Midnight** — Deep purple vibes (default)
- **Aurora** — Northern lights inspired
- **Sunset** — Warm sunset colors
- **Forest** — Deep green nature
- **Ocean** — Deep blue depths
- **Lavender** — Soft purple dreams
- **Paper** — Clean light mode
- **Matrix** — Classic hacker green

### 󰒓 Customization
- Adjustable font size
- Smooth/instant caret animation
- Sound effects with volume control
- Stop on error mode
- Confidence mode (no backspace)
- Blind mode (hide errors)
- Multiple keyboard layouts

### 󰄭 Progress Tracking
- Complete test history
- Best WPM tracking
- Average WPM calculation
- Total time spent typing
- Visual charts for progress over time

### 󰕾 Satisfying Audio
- Mechanical keyboard-style keystroke sounds
- Distinct sounds for space, backspace, errors
- Combo milestone celebrations
- Test completion fanfare
- Personal best celebration

## 󰐊 Quick Start

Simply open `index.html` in your browser — no build process required!

```bash
# Clone the repository
cd /home/craig/projects/typeflux

# Open in browser
xdg-open index.html
```

## 󰌌 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` + `Enter` | Restart test |
| `Esc` | Reset current test |
| Any letter | Auto-focus typing area |

## 󰉋 Project Structure

```
typeflux/
├── index.html          # Main HTML file
├── css/
│   ├── styles.css      # Core styles
│   └── themes.css      # Theme definitions
├── js/
│   ├── app.js          # Main application logic
│   ├── words.js        # Word lists & generator
│   ├── quotes.js       # Quote collections
│   ├── code.js         # Code snippet library
│   ├── sounds.js       # Web Audio API sound system
│   ├── chart.js        # Canvas-based charts
│   └── storage.js      # LocalStorage management
└── README.md
```

## 󰓾 WPM Calculation

typeflux uses the standard WPM formula:
- **Gross WPM** = (Characters Typed / 5) / Minutes
- **Net WPM** = Gross WPM - (Errors / Minutes)
- 5 characters = 1 standard word

## 󰆥 Grading System

| Grade | Score (WPM x Accuracy%) |
|-------|-------------------------|
| S+ | 100+ |
| S | 80-99 |
| A+ | 65-79 |
| A | 55-64 |
| B+ | 45-54 |
| B | 35-44 |
| C+ | 25-34 |
| C | 15-24 |
| D | <15 |

## 󰜬 Technologies

- **Vanilla JavaScript** — No frameworks, pure performance
- **Web Audio API** — Synthesized sound effects
- **Canvas API** — Smooth charts and visualizations
- **CSS Custom Properties** — Dynamic theming
- **LocalStorage** — Persistent settings & stats

## 󰏘 Design Philosophy

1. **Flow-first** — Every interaction should feel smooth and satisfying
2. **Beautiful defaults** — Looks great out of the box
3. **Powerful customization** — Make it yours
4. **No friction** — Start typing immediately
5. **Delightful feedback** — Sounds, animations, and visual polish

##  License

MIT License — feel free to use, modify, and share!

---
