# Structure

## Directory Layout

```
opse/
├── index.html          # App shell, UI layout, tab structure
├── style.css           # All styles (light/dark mode, layout, components)
├── app.js              # Application entry point, editor init, tab management
├── deck.js             # Card deck logic (shuffle, draw, reshuffle)
├── dice.js             # Dice rolling and table lookups
├── tools.js            # Miscellaneous GM tools
├── customtables.js     # User-defined random table engine
├── README.md           # Project documentation
├── LICENSE             # CC-BY-SA 4.0
└── .planning/          # GSD planning artifacts
    └── codebase/       # Codebase map (this directory)
```

## Key File Locations

| File | Purpose |
|------|---------|
| `index.html` | HTML shell, tab UI, toolbar buttons, modal dialogs |
| `style.css` | All CSS including dark mode via `[data-theme="dark"]` selector |
| `app.js` | Bootstrap, CodeMirror setup, `insertAtCursor()`, localStorage read/write |
| `deck.js` | Card deck: full 54-card deck, Fisher-Yates shuffle, draw logic |
| `dice.js` | Dice: d4/d6/d8/d10/d12/d20/d100, result formatting |
| `tools.js` | Additional tools (names, oracles, etc.) |
| `customtables.js` | Parse custom table syntax, weighted random selection |

## Naming Conventions
- Files: lowercase, no hyphens — single-word names (`deck.js`, `tools.js`)
- CSS classes: lowercase hyphenated (`tab-bar`, `tool-panel`, `dark-mode`)
- JS: camelCase functions and variables
- localStorage keys: prefixed with `opse_`

## No Build Step
All files are served directly. No npm, no bundler, no transpilation. Open `index.html` in a browser or serve with any static file server.
