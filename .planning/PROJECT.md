# OPSE Name Generator

## What This Is

OPSE is a browser-based GM toolkit — tabbed CodeMirror editor, card deck, dice, and custom random tables, all offline with localStorage persistence. This milestone adds a name generator module: procedurally generated names for people, places, and items, inserted directly into the editor like the existing dice and deck tools.

## Core Value

A GM should be able to generate a believable, flavourful name for any character, place, or item in one click — without uploading data files or leaving the app.

## Requirements

### Validated

- ✓ Tabbed CodeMirror editor with localStorage persistence — existing
- ✓ Card deck with Fisher-Yates shuffle and Joker reshuffle — existing
- ✓ Dice rolling (d4–d100) with cursor insertion — existing
- ✓ Custom user-defined random tables — existing
- ✓ Dark mode, font size settings, tab renaming — existing

### Active

- [ ] Generate people names (Markov chain) for Human, Elf, Dwarf, Orc/Goblin, Beastkin cultures
- [ ] Human names have Male / Female / Surname variants; other cultures follow lore-appropriate gender conventions
- [ ] Beastkin names are broad and highly random, reflecting the variety of the race
- [ ] Generate place names (word combination) for towns/villages, buildings/locations, and geographic features
- [ ] Generate guild names via word combination
- [ ] Generate item names (word combination) for weapons, armour, and potions
- [ ] All generated names insert at editor cursor (same pattern as dice/deck)
- [ ] All generation data is compact and baked into the JS module — no large external files in the repo
- [ ] Architecture supports adding new cultures and name types without restructuring

### Out of Scope

- User-defined cultures / custom phoneme sets — deliberate design boundary; built-in cultures only
- Server-side generation — app stays fully offline
- Name history / favourites panel — insert-only for v1

## Context

The existing codebase follows a strict pattern: each tool is a JS module (`deck.js`, `dice.js`, `customtables.js`) that exports functions and calls `insertAtCursor()` from `app.js` to write results to the editor. The name generator should follow this exact pattern as a new `namegen.js` module.

All generation must work without network access and without large data payloads committed to the repo. Markov chain models for people names can be represented as compact transition tables derived from small curated training sets. Place and item names use word-list combination tables (adjective + noun patterns) which are naturally small.

The UI currently has tool panels in the sidebar. The name generator should fit as another panel/section following the existing visual conventions.

## Constraints

- **Tech stack**: Vanilla JS ES modules, no build step, no npm — matches existing codebase
- **Data size**: Training data and word lists must be small enough to be embedded inline in JS — no separate data files
- **Offline**: No API calls; all generation is client-side
- **Pattern**: Follow existing module pattern exactly — export functions, call `insertAtCursor()`, register UI in `index.html`

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Markov chain for people names | Generates believable new names rather than recombining a fixed list; feels generative not tabular | — Pending |
| Word combination for places/items | Natural fit for fantasy place/item names; compact data; predictably structured output | — Pending |
| All data baked into module | Avoids large files in repo; keeps app self-contained and fast to load | — Pending |
| Built-in cultures only (no user customization) | Keeps scope focused; each culture can be carefully crafted for quality output | — Pending |

---
*Last updated: 2026-03-18 after initialization*
