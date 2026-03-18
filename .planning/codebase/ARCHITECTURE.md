# Architecture

## Pattern
Modular Single-Page Application (SPA) — no build step, no framework. Pure HTML/CSS/JS with dynamic ES module imports.

## Layers

```
UI Layer          index.html, style.css
                  ↓
Application Shell app.js (DOMContentLoaded entry point)
                  ↓ dynamic imports
Game Mechanics    deck.js, dice.js, customtables.js
Tool Features     tools.js
                  ↓
Output            insertAtCursor() → CodeMirror 6 editor
                  ↓
Persistence       localStorage (documents, deck state, settings, custom tables)
```

## Entry Points
- `index.html` — loads `app.js` as ES module
- `app.js` — `DOMContentLoaded` listener bootstraps editor and dynamically imports tool modules

## Key Abstractions

### Editor
- CodeMirror 6 as the text editor
- `insertAtCursor(text)` — primary interface between game mechanics and editor output
- Multi-tab session management: each tab is an independent document stored in localStorage

### Card Deck (`deck.js`)
- Fisher-Yates shuffle algorithm
- Joker reshuffle trigger when deck is exhausted
- Deck state (remaining cards, drawn cards) persisted to localStorage

### Dice (`dice.js`)
- Table-based dice roll lookups
- Results inserted into editor via `insertAtCursor()`

### Custom Tables (`customtables.js`)
- User-defined random tables stored in localStorage
- Parsed and rolled at runtime

### Tools (`tools.js`)
- Miscellaneous GM/player tools
- Composites dice and table functionality

## Data Flow
1. User triggers action (button click / keyboard shortcut)
2. Tool module (deck/dice/tables) computes result
3. Result passed to `insertAtCursor()` in `app.js`
4. CodeMirror editor inserts text at current cursor position
5. Document auto-saved to localStorage on change

## State Management
All state is localStorage-only. No server, no network. Fully offline.

| Key | Description |
|-----|-------------|
| `opse_tab_*` | Per-tab document content |
| `opse_deck_state` | Current deck (remaining/drawn cards) |
| `opse_settings` | User preferences (font size, dark mode, etc.) |
| `opse_custom_tables` | User-defined random tables |
| `opse_tab_names` | Tab labels |
