# External Integrations

**Analysis Date:** 2026-03-18

## APIs & External Services

**None detected.**

The application is fully self-contained with no integration to external APIs or web services. All functionality runs entirely within the browser.

## Data Storage

**Databases:**
- Not used - Application is client-only

**File Storage:**
- Local browser storage only (localStorage API)
- Sessions stored in-browser, not persisted to server
- No remote file storage integration

**Browser Storage Mechanism:**
All state is stored via `localStorage` (browser's key-value store):
- Session documents: `opse_doc_*` keys
- Tab metadata: `opse_tabs`, `opse_active_tab`
- Settings: `opse_settings`
- Deck state: `opse_deck`
- Custom tables: `opse_custom_tables`

**Caching:**
- None - Application relies on browser cache for CDN resources

## Authentication & Identity

**Auth Provider:**
- Not used - Application has no user accounts or authentication

**Access Control:**
- None - All features available to all users
- Data is isolated per browser profile (localStorage is origin-scoped)

## File Import/Export

**Import:**
- Accepts `.md` files (markdown documents)
- Accepts `.json` files (session bundles with deck state)
- Implementation: `js/app.js` `handleImport()` function
- Processed entirely in-browser, no server upload

**Export:**
- Downloads active tab as `.md` file (markdown format)
- Exports deck state as JSON when exporting bundle
- Implementation: `js/app.js` `exportDocument()` function

## Monitoring & Observability

**Error Tracking:**
- Not used - No error reporting service

**Logs:**
- Browser console only (via `console.log`, `console.error`)
- No external logging service
- No telemetry

**Status Indicators:**
- In-app status bar at bottom shows messages via `setStatus()` function
- Autosave indicator shows save state

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (repository-based)
- Static file serving only
- No build pipeline required

**CI Pipeline:**
- Not used - No automated builds or tests
- Manual deployment via git push to main branch

**Deployment Process:**
1. Push files to GitHub repository
2. GitHub Pages automatically serves from `/` or specified folder
3. Live within 1-2 minutes of push

## Environment Configuration

**Required Environment Variables:**
- None - Application uses no environment variables

**Secrets Location:**
- No secrets stored in code
- User data remains in-browser via localStorage
- No API keys or credentials in codebase

**Local Development:**
- No configuration needed
- Optional: HTTP server for local testing
  - Python: `python3 -m http.server 8080`
  - Node: `npx serve .`

## External Dependencies

**CDN Services (Critical):**
- `esm.sh` - ES module CDN hosting CodeMirror and plugins
- `cdn.jsdelivr.net` - JavaScript/CSS library CDN hosting Pico CSS

**If CDNs are Down:**
- Application cannot load - hard dependency with no fallback
- No offline mode or cached versions
- Consider adding fallback CDN mirrors for production reliability

## Webhooks & Callbacks

**Incoming Webhooks:**
- Not used - Application is client-only with no server

**Outgoing Webhooks:**
- Not used - Application sends no data to external services

**Custom Events:**
- Internal browser events only:
  - `opse:deck-import` - Custom event fired when deck state is imported (listeners in `deck.js`)

## Data Flow

**User Interaction:**
1. User types in CodeMirror editor
2. Tools (buttons) insert results at cursor
3. State saved to localStorage
4. On page reload, state restored from localStorage

**Import/Export:**
1. User selects file via file input
2. File parsed in-browser (markdown or JSON)
3. Content loaded into editor or deck state
4. State replaces current session

**No Remote Communication:**
- All data stays in browser
- No transmission to servers
- No cloud sync

## Privacy & Data Persistence

**Data Scope:**
- Stored in browser's localStorage for current origin
- Separate storage per origin (localhost dev ≠ deployed site)
- Persists across page reloads and sessions
- Lost if browser storage is cleared

**No Remote Storage:**
- User responsible for exporting sessions to files for backup
- No server-side backup or recovery

---

*Integration audit: 2026-03-18*
