import { EditorView, basicSetup } from "https://esm.sh/codemirror@6.0.1";
import { markdown } from "https://esm.sh/@codemirror/lang-markdown@6.2.5";
import { oneDark } from "https://esm.sh/@codemirror/theme-one-dark@6.1.2";

// ── Storage keys ───────────────────────────────────────────
const LS_TABS    = "opse_tabs";
const LS_ACTIVE  = "opse_active_tab";
const LS_SETTINGS = "opse_settings";
const docKey = (id) => `opse_doc_${id}`;

// ── Settings ───────────────────────────────────────────────
export function loadSettings() {
  try { return JSON.parse(localStorage.getItem(LS_SETTINGS) || "{}"); }
  catch { return {}; }
}
function saveSettings(s) {
  localStorage.setItem(LS_SETTINGS, JSON.stringify(s));
}

// ── Tab state ──────────────────────────────────────────────
let tabs = [];
let activeTabId = null;

function loadTabState() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_TABS));
    if (saved && Array.isArray(saved) && saved.length > 0) {
      tabs = saved;
      activeTabId = localStorage.getItem(LS_ACTIVE) || tabs[0].id;
      return;
    }
  } catch {/* fall through */}
  // First run or migration from old single-doc format
  const oldDoc = localStorage.getItem("opse_document") || "";
  tabs = [{ id: "tab-0", name: "Session 1" }];
  activeTabId = "tab-0";
  if (oldDoc) localStorage.setItem(docKey("tab-0"), oldDoc);
  saveTabMeta();
}

function saveTabMeta() {
  localStorage.setItem(LS_TABS, JSON.stringify(tabs));
  localStorage.setItem(LS_ACTIVE, activeTabId);
}

function getActiveDoc() {
  return localStorage.getItem(docKey(activeTabId)) || "";
}

function saveActiveDoc(content) {
  localStorage.setItem(docKey(activeTabId), content);
  // Keep legacy key in sync for JSON export compatibility
  localStorage.setItem("opse_document", content);
}

// ── Tab rendering ──────────────────────────────────────────
function renderTabs() {
  const list = document.getElementById("tabs-list");
  list.innerHTML = "";

  tabs.forEach((tab) => {
    const el = document.createElement("div");
    el.className = "tab" + (tab.id === activeTabId ? " active" : "");
    el.dataset.id = tab.id;

    const nameSpan = document.createElement("span");
    nameSpan.className = "tab-name";
    nameSpan.textContent = tab.name;
    nameSpan.title = "Double-click to rename";
    nameSpan.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      startRenameTab(tab.id, nameSpan);
    });
    el.appendChild(nameSpan);

    if (tabs.length > 1) {
      const closeBtn = document.createElement("button");
      closeBtn.className = "tab-close";
      closeBtn.textContent = "×";
      closeBtn.title = "Close tab";
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeTab(tab.id);
      });
      el.appendChild(closeBtn);
    }

    el.addEventListener("click", () => switchTab(tab.id));
    list.appendChild(el);
  });
}

// ── Tab operations ─────────────────────────────────────────
function switchTab(id) {
  if (id === activeTabId) return;
  saveActiveDoc(editorView.state.doc.toString());
  activeTabId = id;
  saveTabMeta();
  setEditorContent(getActiveDoc());
  renderTabs();
  editorView.focus();
}

function addTab() {
  const id = "tab-" + Date.now();
  const name = "Session " + (tabs.length + 1);
  saveActiveDoc(editorView.state.doc.toString());
  tabs.push({ id, name });
  activeTabId = id;
  saveTabMeta();
  setEditorContent("");
  renderTabs();
  editorView.focus();
}

function closeTab(id) {
  if (tabs.length <= 1) return;
  const idx = tabs.findIndex((t) => t.id === id);
  localStorage.removeItem(docKey(id));
  tabs = tabs.filter((t) => t.id !== id);
  if (activeTabId === id) {
    activeTabId = tabs[Math.min(idx, tabs.length - 1)].id;
    setEditorContent(getActiveDoc());
  }
  saveTabMeta();
  renderTabs();
}

function startRenameTab(id, nameSpan) {
  const tab = tabs.find((t) => t.id === id);
  if (!tab) return;
  const input = document.createElement("input");
  input.type = "text";
  input.value = tab.name;
  input.className = "tab-rename-input";
  nameSpan.replaceWith(input);
  input.focus();
  input.select();

  const finish = () => {
    tab.name = input.value.trim() || tab.name;
    saveTabMeta();
    renderTabs();
  };
  input.addEventListener("blur", finish);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
    if (e.key === "Escape") { input.value = tab.name; input.blur(); }
  });
}

// ── Editor init ────────────────────────────────────────────
let editorView;

function initEditor(initialDoc) {
  const settings = loadSettings();
  const isDark = settings.darkMode !== false;

  const extensions = [
    basicSetup,
    markdown(),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) scheduleAutosave();
    }),
  ];
  if (isDark) extensions.push(oneDark);

  editorView = new EditorView({
    doc: initialDoc,
    extensions,
    parent: document.getElementById("editor"),
  });
}

function setEditorContent(content) {
  editorView.dispatch({
    changes: { from: 0, to: editorView.state.doc.length, insert: content },
    selection: { anchor: 0 },
  });
}

// ── Autosave ───────────────────────────────────────────────
let autosaveTimer = null;

function scheduleAutosave() {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    saveActiveDoc(editorView.state.doc.toString());
    showAutosave("Saved");
  }, 1500);
}

function showAutosave(msg) {
  const el = document.getElementById("autosave-indicator");
  if (!el) return;
  el.textContent = msg;
  setTimeout(() => { el.textContent = ""; }, 2000);
}

// ── Insert at cursor ───────────────────────────────────────
let lastInsert = "";

export function insertAtCursor(text) {
  if (!editorView) return;
  lastInsert = text;
  const { state } = editorView;
  const pos = state.selection.main.head;
  const docStr = state.doc.toString();
  const before = docStr.slice(0, pos);
  const needsLeading  = before.length > 0 && !before.endsWith("\n");
  const needsTrailing = pos < docStr.length && docStr[pos] !== "\n";
  const insertText =
    (needsLeading ? "\n" : "") + text + (needsTrailing ? "\n" : "");

  editorView.dispatch({
    changes: { from: pos, insert: insertText },
    selection: { anchor: pos + insertText.length },
  });
  editorView.focus();
  setStatus(text.replace(/^> /, "").split("\n")[0]);
}

// ── Status bar ─────────────────────────────────────────────
export function setStatus(msg) {
  const el = document.getElementById("status-text");
  if (el) el.textContent = msg;
}

// ── Export ─────────────────────────────────────────────────
function exportMarkdown() {
  const content = editorView.state.doc.toString();
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const tabName = tabs.find((t) => t.id === activeTabId)?.name ?? "session";
  a.download = tabName.toLowerCase().replace(/\s+/g, "-") + ".md";
  a.click();
  URL.revokeObjectURL(url);
  setStatus(`Exported as ${a.download}`);
}

// ── Import ─────────────────────────────────────────────────
function handleImport(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target.result;
    if (file.name.endsWith(".json")) {
      try {
        const bundle = JSON.parse(content);
        if (bundle.document) setEditorContent(bundle.document);
        if (bundle.deck) {
          localStorage.setItem("opse_deck", JSON.stringify(bundle.deck));
          window.dispatchEvent(new CustomEvent("opse:deck-import", { detail: bundle.deck }));
        }
        setStatus("Session imported.");
      } catch { setStatus("Failed to parse session file."); }
    } else {
      setEditorContent(content);
      saveActiveDoc(content);
      setStatus("Document imported.");
    }
  };
  reader.readAsText(file);
  // Reset file input so the same file can be re-imported
  document.getElementById("import-file").value = "";
}

// ── Settings modal ─────────────────────────────────────────
function openSettings() {
  const s = loadSettings();
  document.getElementById("setting-advantage").checked = !!s.advantageMode;
  document.getElementById("setting-dark").checked = s.darkMode !== false;
  document.getElementById("settings-modal").showModal();
}

function saveSettingsFromModal() {
  const s = loadSettings();
  s.advantageMode = document.getElementById("setting-advantage").checked;
  s.darkMode = document.getElementById("setting-dark").checked;
  saveSettings(s);

  // Sync inline advantage toggle
  const advInline = document.getElementById("oracle-advantage");
  if (advInline) advInline.checked = s.advantageMode;

  // Apply theme
  document.documentElement.setAttribute("data-theme", s.darkMode !== false ? "dark" : "light");

  document.getElementById("settings-modal").close();
  setStatus("Settings saved. Reload page to apply editor theme change.");
}

// ── Info toggles ───────────────────────────────────────────
function wireInfoToggles() {
  document.querySelectorAll(".btn-info-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent <details> toggling if inside summary
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isHidden = target.hidden;
      target.hidden = !isHidden;
      btn.setAttribute("aria-expanded", String(isHidden));
      btn.textContent = isHidden
        ? btn.textContent.replace("ℹ ", "✕ ")
        : btn.textContent.replace("✕ ", "ℹ ");
    });
  });
}

// ── Keyboard shortcuts ─────────────────────────────────────
function wireKeyboard() {
  document.addEventListener("keydown", (e) => {
    // Ctrl+Enter: re-insert last roll
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && lastInsert) {
      e.preventDefault();
      insertAtCursor(lastInsert);
    }
    // Ctrl+S: force save
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      saveActiveDoc(editorView.state.doc.toString());
      showAutosave("Saved");
    }
  });
}

// ── Wire UI events ─────────────────────────────────────────
function wireEvents() {
  document.getElementById("btn-export").addEventListener("click", exportMarkdown);
  document.getElementById("import-file").addEventListener("change", (e) => handleImport(e.target.files[0]));
  document.getElementById("btn-settings").addEventListener("click", openSettings);
  document.getElementById("btn-settings-close").addEventListener("click", () =>
    document.getElementById("settings-modal").close()
  );
  document.getElementById("btn-settings-save").addEventListener("click", saveSettingsFromModal);
  document.getElementById("btn-add-tab").addEventListener("click", addTab);

  // Sync advantage toggle from settings
  const s = loadSettings();
  const advInline = document.getElementById("oracle-advantage");
  if (advInline && s.advantageMode) advInline.checked = true;

  // Apply stored theme
  document.documentElement.setAttribute("data-theme", s.darkMode !== false ? "dark" : "light");
}

// ── Bootstrap ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadTabState();
  initEditor(getActiveDoc());
  renderTabs();
  wireEvents();
  wireInfoToggles();
  wireKeyboard();

  Promise.all([
    import("./dice.js"),
    import("./deck.js"),
    import("./tools.js"),
  ]).catch((err) => {
    console.error("Tool module load error:", err);
    setStatus("Error loading tool modules — check console.");
  });
});
