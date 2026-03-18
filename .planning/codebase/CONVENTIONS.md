# Conventions

## Code Style
- **Indentation:** 2 spaces
- **Quotes:** Double quotes
- **Semicolons:** Always present
- **Section comments:** Decorative separators (`// --- Section Name ---`)

## Naming Patterns

| Context | Convention | Example |
|---------|-----------|---------|
| Functions | camelCase with verb prefix | `loadDeck()`, `saveSettings()`, `renderTabs()`, `genResult()`, `wireDice()` |
| Constants | UPPERCASE | `DECK_SIZE`, `DEFAULT_SETTINGS` |
| DOM selectors | kebab-case (matching HTML) | `#tab-bar`, `.tool-panel` |
| localStorage keys | `opse_` prefix | `opse_deck_state`, `opse_tab_names` |
| CSS classes | kebab-case | `dark-mode`, `tab-bar`, `tool-panel` |

## Module Structure
```js
// 1. External imports
import { EditorView } from 'codemirror';

// 2. Relative imports
import { insertAtCursor } from './app.js';

// 3. Module-level private state
let deckState = [];

// 4. Private functions (not exported)
function shuffle(arr) { ... }

// 5. Exported functions
export function drawCard() { ... }

// 6. Initialization (bottom of file)
initDeck();
```

## Function Design
- Compact functions: 5–20 lines typical
- State passed implicitly via module-level variables (not function parameters)
- Pure logic functions kept separate from DOM manipulation where possible

## Error Handling
- Silent `try/catch` with fallbacks for localStorage access
- User-facing errors shown via `setStatus()` in status bar
- Promise chains use `.catch()` — no unhandled rejections
- Only `console.error()` for fatal/unexpected errors; no `console.log` in production code

## Comments
- Section headers with decorative separators for visual scanning
- JSDoc only on exported functions
- Inline comments for non-obvious logic

## Imports
- ES6 `import/export` modules throughout
- No CommonJS (`require`)
- No bundler — imports resolved natively by browser
