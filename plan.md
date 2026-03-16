# OPSE Web Editor — Implementation Plan

A browser-based solo RPG editor built around the One Page Solo Engine v1.6. Write your game fiction in a markdown editor; roll on any OPSE tool and have results inserted inline at the cursor.

---

## Tech Stack

- **Editor:** CodeMirror 6 via CDN (`esm.sh` or `jsdelivr`)
- **Styling:** Pico CSS (classless, CDN)
- **Logic:** Vanilla JS (ES modules)
- **Persistence:** localStorage (autosave) + manual `.md` export
- **Deploy:** GitHub Pages (static files, no build step)

CodeMirror 6 minimal setup requires importing `@codemirror/basic-setup` and `@codemirror/lang-markdown`. Using `esm.sh` these resolve as single URL imports — no bundler needed.

---

## Architecture

### Three Logical Pieces

**1. The Editor**
CodeMirror 6 instance with markdown syntax highlighting. All game fiction lives here as a single markdown document. Tool results are inserted at the current cursor position as formatted markdown text.

**2. The Toolkit Panel**
Sidebar (collapsible) with buttons/sections for every OPSE tool and generator. Each button runs its logic and inserts the result at cursor.

**3. The Card Deck**
A tracked 54-card deck (52 + 2 Jokers). Shuffle, draw, discard, reshuffle. On Joker draw: auto-reshuffle the discard back into the draw pile and flag a Random Event. Deck state persisted to localStorage. Remaining card count always visible.

---

## UI Layout

```
┌──────────────────────────────────────────────────┐
│  OPSE Editor                        [Export] [⚙]  │
├────────────────────────────┬─────────────────────┤
│                            │ 🃏 Deck: 48 remain  │
│                            │ [Draw] [Shuffle]    │
│                            ├─────────────────────┤
│                            │ ▸ Dice Roller       │
│   CodeMirror 6 Editor      │ ▸ Oracle (Yes/No)   │
│   (markdown, full height)  │ ▸ Oracle (How)      │
│                            │ ▸ Set the Scene     │
│                            │ ▸ GM Moves          │
│                            │ ▸ Random Event      │
│                            │ ▸ Focus Tables      │
│                            │ ▸ Generators        │
│                            │ ▸ Rules Reference   │
├────────────────────────────┴─────────────────────┤
│  status bar / last roll summary                   │
└──────────────────────────────────────────────────┘
```

Editor takes ~70% width; toolkit ~30%. On narrow screens, toolkit collapses to a bottom drawer or overlay. Each toolkit section is a collapsible accordion.

---

## Tool Specifications

### Dice Roller

General-purpose roller. Buttons for d4, d6, d8, d10, d12, d20. Option for custom NdX. Inserts result at cursor:

```
> 🎲 3d6: [4, 2, 5] = 11
```

### Card Draw

Draw a card from the tracked deck. Displays rank, suit, and suit domain. Option to "just draw" (no table lookup) or draw-and-lookup against a specific focus table.

```
> 🃏 Drew: 7 of ♠ Spades (Mystical)
```

On Joker: reshuffle triggered, Random Event flagged.

### Oracle (Yes/No)

The oracle uses **2d6 — each die has a distinct role:**

- **Die 1 (Answer die):** Compared against the likelihood threshold.
  - Likely: Yes on 3+
  - Even: Yes on 4+
  - Unlikely: Yes on 5+
- **Die 2 (Modifier die):** Determines qualifier.
  - 1 → "but…"
  - 2–5 → *(no modifier)*
  - 6 → "and…"

**Homebrew — Advantage:** When enabled, roll **2d6 for the answer** (take the highest), plus the standard 1d6 modifier. This makes a "Yes" more likely without affecting the modifier. UI: a toggle or checkbox next to the likelihood selector.

Insert format:

```
> **Oracle (Even):** Yes, and… [answer: 5, mod: 6]
```

With advantage:

```
> **Oracle (Even, Advantage):** No, but… [answer: best of 2,3 → 3, mod: 1]
```

### Oracle (How)

Single d6:

| d6 | Result              |
|----|---------------------|
| 1  | Surprisingly lacking |
| 2  | Less than expected   |
| 3–4| About average        |
| 5  | More than expected   |
| 6  | Extraordinary        |

```
> **How:** More than expected [5]
```

### Set the Scene

Roll 1d6 for Scene Complication. On 5+, also roll Altered Scene (1d6).

```
> **Scene:** An obstacle blocks your way [2]
```

```
> **Scene (Altered):** An NPC acts suddenly → Unexpected NPCs are present [4, altered: 3]
```

### GM Moves

Two sub-tools:

- **Pacing Move** (d6) — for lulls / "what now?"
- **Failure Move** (d6) — for failed checks with consequences

If the pacing move result is "Add a Random Event," auto-trigger it.

```
> **Pacing:** Reveal a New Detail [2]
```

### Random Event

Draws two cards: Action Focus + Topic Focus. Applies suit domains.

```
> **Random Event:** Create ♦ (Technical) + Enemies ♥ (Social)
```

### Focus Tables (Card Draw)

Three tables, each triggered by drawing a card:

- **Action Focus** — "What does it do?"
- **Detail Focus** — "What kind of thing is it?"
- **Topic Focus** — "What is this about?"

Each result combines the rank lookup with the suit domain.

```
> **Action Focus:** Reveal ♣ (Physical)
> **Detail Focus:** Exotic ♠ (Mystical)
```

### Generators

#### Generic Generator
- Detail Focus (card) + Action Focus (card) + Oracle How (d6)

#### Plot Hook
- Objective (d6) + Adversary (d6) + Reward (d6)

#### NPC Generator
- Identity (card) + Goal (card) + Notable Feature (d6) + Detail Focus (card) for feature description + Attitude: Oracle How (d6) + Conversation: Topic Focus (card)

#### Dungeon Crawler
- **Setup (once):** Theme via Detail Focus + Action Focus
- **New Area:** Location (d6) + Encounter (d6) + Object (d6) + Exits (d6)
- First area always has 3 exits.

#### Hex Crawler
- **Setup (once):** Define 3 terrain types for starting region (common/uncommon/rare — user input)
- **Generate hex:** Terrain (d6) + Contents (d6), with Feature (d6) on a 6
- **Current hex event:** Event (d6), Random Event on 5–6

---

## Data Model (localStorage)

| Key              | Value                                            |
|------------------|--------------------------------------------------|
| `opse_document`  | The raw markdown text                            |
| `opse_deck`      | JSON: `{ drawPile: [...], discard: [...] }`      |
| `opse_settings`  | JSON: preferences (advantage default, etc.)      |

- **Autosave:** debounced on every editor change (~1–2 seconds)
- **Export:** download button saves document as `.md` file
- **Full Export:** optional JSON bundle with document + deck state for session resume
- **Import:** load a `.md` file into the editor, or a JSON session bundle

---

## Insert Format Convention

All tool results inserted as markdown blockquotes to visually separate mechanics from fiction. Raw roll values shown in square brackets for transparency.

```markdown
The guard eyes me suspiciously. Do they recognise me?

> **Oracle (Unlikely):** Yes, but… [answer: 5, mod: 1]

They squint — recognition flickers, but they can't quite place me.
```

---

## Card Deck Implementation

- 54 cards: ranks 2–A, suits ♣♦♠♥, plus 2 Jokers
- On init or shuffle: Fisher-Yates shuffle of all 54
- Draw: pop from draw pile, push to discard
- **Joker handling:** When drawn, immediately reshuffle entire discard (including the Joker) back into draw pile. Flag the Joker draw and trigger/prompt a Random Event. Then draw again for the original request.
- Deck count displayed in toolkit header
- "Shuffle" button: manual full reshuffle at any time (combines draw + discard)
- "Draw" button: draw and display a card without any table lookup

---

## File Structure

```
/
├── index.html          ← shell, layout, CDN imports
├── style.css           ← custom styles on top of Pico CSS
├── js/
│   ├── app.js          ← editor init, localStorage, import/export, insert-at-cursor
│   ├── deck.js         ← card deck (shuffle, draw, joker handling, state)
│   ├── dice.js         ← dice rolling functions
│   ├── tools.js        ← all OPSE tool logic (oracles, scene, GM moves, generators)
│   └── tables.js       ← pure data: all table contents as JS objects/arrays
└── README.md
```

All JS files as ES modules (`type="module"` in script tag). CodeMirror and Pico CSS loaded from CDN — no node_modules, no build step.

---

## Build Priority

| Phase | What                                              | Notes                            |
|-------|---------------------------------------------------|----------------------------------|
| 1     | Editor + localStorage + export/import             | Core loop: write and save        |
| 2     | Dice roller + insert-at-cursor mechanism           | Proves the tool→editor pipeline  |
| 3     | Card deck (shuffle, draw, track, Joker handling)   | Foundation for all card tools    |
| 4     | Oracle (Yes/No) with advantage + Oracle (How)      | Most-used tools                  |
| 5     | Focus tables (Action, Detail, Topic)               | Card-based, needs deck           |
| 6     | Set the Scene + GM Moves                           | Simple d6 tools                  |
| 7     | Random Event + Complex Question                    | Combines focus tables            |
| 8     | Generators (Generic, Plot Hook, NPC, Dungeon, Hex) | Compound tools                   |
| 9     | Rules reference panel                              | Searchable/browsable in-app      |
| 10    | Polish: mobile layout, keyboard shortcuts, themes  | Nice-to-haves                    |

---

## GitHub Pages Deployment

### Initial Setup

1. Create a repository (e.g., `opse-editor`)
2. Push the project files to the `main` branch
3. Go to **Settings → Pages**
4. Under **Source**, select **Deploy from a branch**
5. Set branch to `main`, folder to `/ (root)`
6. Save — site will be live at `https://<username>.github.io/opse-editor/`

### Updating

Just push to `main`. GitHub Pages rebuilds automatically within a minute or two.

### Custom Domain (Optional)

1. In **Settings → Pages → Custom domain**, enter your domain
2. Add a `CNAME` file to the repo root containing your domain
3. Configure DNS: CNAME record pointing to `<username>.github.io`

### Notes

- No build step needed — GitHub Pages serves static files directly
- All CDN imports (CodeMirror, Pico CSS) will work as-is
- localStorage is per-domain, so the deployed site and localhost will have separate storage (good for dev/prod separation)
