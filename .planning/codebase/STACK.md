# Technology Stack

**Analysis Date:** 2026-03-18

## Languages

**Primary:**
- JavaScript (ES6+) - All client-side logic, module imports, DOM manipulation
- HTML5 - Layout and semantic structure
- CSS3 - Styling with CSS variables and flexbox layout

**Secondary:**
- Markdown - Documentation and rules reference (`opse.md`)
- JSON - Data serialization for import/export functionality

## Runtime

**Environment:**
- Browser (any modern browser supporting ES6+ modules, localStorage API)
- No Node.js or server runtime required

**Package Manager:**
- None - Project uses CDN imports exclusively

**Execution Model:**
- Client-side only, no build step required
- Direct HTML file execution via file:// or HTTP server
- ES6 module imports from CDN

## Frameworks

**Core:**
- CodeMirror 6 (v6.0.1) - Text editor for markdown writing
  - `https://esm.sh/codemirror@6.0.1`
  - Provides syntax highlighting, line wrapping, monospace font

**UI/CSS:**
- Pico CSS (v2) - Classless CSS framework for semantic HTML styling
  - `https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css`
  - Provides form controls, tables, typography baseline

**Markdown Support:**
- @codemirror/lang-markdown (v6.2.5) - Markdown syntax highlighting
  - `https://esm.sh/@codemirror/lang-markdown@6.2.5`

**Theme:**
- @codemirror/theme-one-dark (v6.1.2) - One Dark color scheme for editor
  - `https://esm.sh/@codemirror/theme-one-dark@6.1.2`

## Key Dependencies

**Critical:**
- CodeMirror 6 suite - All editing functionality depends on this
- Pico CSS - Layout and styling baseline

**Infrastructure:**
- All third-party libraries loaded from external CDNs:
  - esm.sh - ES module CDN for npm packages
  - cdn.jsdelivr.net - JavaScript/CSS library CDN

**Not Used:**
- No build bundler (webpack, Vite, etc.)
- No package manager (npm, yarn, pnpm)
- No server framework
- No database ORM

## Configuration

**Environment:**
- Browser storage via localStorage API (not environment variables)
- No .env files or configuration files required
- Settings stored in browser's localStorage under keys:
  - `opse_settings` - User preferences (dark mode, font size, advantage default)
  - `opse_tabs` - Tab metadata (names, IDs)
  - `opse_active_tab` - Currently active tab ID
  - `opse_doc_*` - Document content per tab
  - `opse_deck` - Card deck state (draw pile, discard)
  - `opse_custom_tables` - User-created custom tables

**Build:**
- No build configuration files (no tsconfig.json, webpack.config.js, etc.)
- Direct file serving required
- Deployment via GitHub Pages (no build step)

## Platform Requirements

**Development:**
- Any modern browser (Chrome, Firefox, Safari, Edge)
- Text editor for modifying .html, .css, .js files
- Optional: HTTP server for local development (avoid file:// quirks)
  - Python: `python3 -m http.server 8080`
  - Node: `npx serve .`

**Production:**
- Static file hosting (GitHub Pages, Netlify, Vercel, etc.)
- No server-side processing required
- HTTPS recommended for localStorage privacy

## Deployment

**Current Hosting:**
- GitHub Pages (via repository)
- Static files only - direct HTML/CSS/JS serving

**CDN Dependencies:**
- Project has hard dependency on external CDNs:
  - esm.sh (CodeMirror and plugins)
  - cdn.jsdelivr.net (Pico CSS)
- If CDNs unavailable, application will not load

## File Structure

**Entry Point:**
- `index.html` - Single HTML file with all layout, dialogs, toolbar definitions

**Stylesheets:**
- `style.css` - Custom styles extending Pico CSS, layout definitions

**Scripts:**
- `js/app.js` - Editor initialization, tab management, settings, import/export
- `js/deck.js` - 54-card deck implementation with Fisher-Yates shuffle
- `js/dice.js` - Dice rolling functions
- `js/tools.js` - OPSE tool logic (oracles, generators, GM moves)
- `js/tables.js` - Pure data arrays for all reference tables
- `js/customtables.js` - User-defined custom tables management

**Assets:**
- `opse.md` - Rules documentation
- `plan.md` - Implementation notes
- `README.md` - Project documentation
- `LICENSE` - CC-BY-SA 4.0 license

---

*Stack analysis: 2026-03-18*
