# OPSE Editor

A browser-based companion app for playing solo tabletop RPGs using the **One Page Solo Engine (OPSE) v1.6** by Karl Hendricks.

Write your game fiction in a markdown editor and roll on any OPSE tool — oracles, dice, cards, generators — with results inserted inline at the cursor. Everything runs in the browser with no server, no install, and no build step.

---

## Features

- **Tabbed sessions** — maintain multiple named documents side by side; each tab autosaves independently to browser storage
- **Markdown editor** — full-height CodeMirror 6 editor with syntax highlighting, line wrapping, and monospace font
- **Card deck tracker** — a live 54-card deck (52 + 2 Jokers) that persists across page reloads; Jokers auto-reshuffle and trigger a Random Event
- **Oracle (Yes/No)** — likelihood selector (Likely / Even / Unlikely) with optional Advantage mode (homebrew: roll 2d6, take highest)
- **Oracle (How)** — d6 scale from "Surprisingly lacking" to "Extraordinary"
- **Set the Scene** — Scene Complication with automatic Altered Scene on 5+
- **GM Moves** — Pacing Move and Failure Move tables; Pacing 6 auto-triggers a Random Event
- **Random Event** — draws Action Focus + Topic Focus with suit domains
- **Focus Tables** — Action, Detail, and Topic focus draws for complex questions
- **Generators** — Generic, Plot Hook, NPC, Dungeon Crawler, Hex Crawler (with user-defined terrain types)
- **Rules Reference** — complete in-app reference: How to Play, all tables, tips, optional rules — no need to open the PDF
- **Info context** — every tool has an inline rules blurb explaining when and how to use it
- **Export / Import** — download any tab as a `.md` file; import `.md` or `.json` session bundles
- **Keyboard shortcuts** — `Ctrl+S` force-save, `Ctrl+Enter` re-insert last result
- **Settings** — dark/light mode (live, no reload), editor font size, default Advantage mode
- **Responsive** — stacked layout on narrow screens

---

## How to Use

Open `index.html` in any modern browser. No installation or server required.

For local development, a simple HTTP server avoids any module-loading quirks:

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .
```

Then open `http://localhost:8080`.

---

## Deploying to GitHub Pages

1. **Create a repository** on GitHub (e.g. `opse-editor`).

2. **Push the project files** to the `main` branch:
   ```bash
   git remote add origin https://github.com/<your-username>/opse-editor.git
   git push -u origin main
   ```

3. **Enable Pages** — go to your repository on GitHub, then:
   - **Settings → Pages**
   - Under *Source*, choose **Deploy from a branch**
   - Set branch to `main`, folder to `/ (root)`
   - Click **Save**

4. Your site will be live at:
   ```
   https://<your-username>.github.io/opse-editor/
   ```
   GitHub Pages rebuilds within a minute or two of each push.

### Optional: Custom Domain

1. In **Settings → Pages → Custom domain**, enter your domain.
2. Add a `CNAME` file to the repo root containing only your domain name.
3. Point a CNAME DNS record at `<your-username>.github.io`.

### Notes

- No build step needed — GitHub Pages serves the static files directly.
- All CDN imports (CodeMirror 6, Pico CSS) load from `esm.sh` and `jsdelivr`.
- `localStorage` is scoped per origin, so your local dev data and the deployed site are kept separate.

---

## Project Structure

```
├── index.html      — layout, CDN imports, all tool panels
├── style.css       — custom styles on top of Pico CSS
├── js/
│   ├── app.js      — editor, tabs, autosave, settings, import/export
│   ├── deck.js     — 54-card deck, shuffle, draw, Joker handling
│   ├── dice.js     — dice rolling functions
│   ├── tools.js    — all OPSE tool logic wired to buttons
│   └── tables.js   — pure data: all table arrays
├── opse.md         — OPSE v1.6 rules in markdown
└── plan.md         — implementation plan
```

---

## License

This project is licensed under **Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA 4.0)**.

The One Page Solo Engine rules and content are created by **Karl Hendricks (Inflatable Studios)** and are also licensed under CC-BY-SA 4.0. As a derivative work, this editor inherits that license.

You are free to:
- **Share** — copy and redistribute the material in any medium or format
- **Adapt** — remix, transform, and build upon the material for any purpose, including commercially

Under the following terms:
- **Attribution** — credit Karl Hendricks for OPSE and link to the original: [inflatablestudios.itch.io](https://inflatablestudios.itch.io/)
- **ShareAlike** — if you remix or build upon this, distribute your contribution under CC-BY-SA 4.0

See [LICENSE](LICENSE) for the full license text.

---

## Acknowledgements

- **One Page Solo Engine** by Karl Hendricks — [inflatablestudios.itch.io](https://inflatablestudios.itch.io/)
- **CodeMirror 6** — the editor framework
- **Pico CSS** — the classless CSS baseline
