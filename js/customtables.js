import { insertAtCursor, setStatus } from "./app.js";

const LS_KEY = "opse_custom_tables";

function loadTables() {
  try {
    const saved = JSON.parse(localStorage.getItem(LS_KEY));
    if (Array.isArray(saved)) return saved;
  } catch {/* fall through */}
  return [];
}

function saveTables(tables) {
  localStorage.setItem(LS_KEY, JSON.stringify(tables));
}

function addTable(name, rawEntries) {
  name = name.trim();
  if (!name) return { ok: false, error: "Table name is required." };
  const entries = rawEntries.split(",").map(e => e.trim()).filter(e => e.length > 0);
  if (entries.length === 0) return { ok: false, error: "At least one entry is required." };
  const tables = loadTables();
  if (tables.some(t => t.name.toLowerCase() === name.toLowerCase()))
    return { ok: false, error: "A table with that name already exists." };
  tables.push({ id: "ct-" + Date.now(), name, entries });
  saveTables(tables);
  renderTables();
  return { ok: true };
}

function deleteTable(id) {
  saveTables(loadTables().filter(t => t.id !== id));
  renderTables();
}

function rollTable(id) {
  const tables = loadTables();
  const table = tables.find(t => t.id === id);
  if (!table || table.entries.length === 0) { setStatus("Table is empty."); return; }
  const entry = table.entries[Math.floor(Math.random() * table.entries.length)];
  insertAtCursor(`> **${table.name}:** ${entry}`);
}

function renderTables() {
  const tables = loadTables();
  const listEl  = document.getElementById("ct-list");
  const labelEl = document.getElementById("ct-list-label");
  labelEl.hidden = tables.length === 0;
  listEl.innerHTML = "";
  tables.forEach(table => {
    const row = document.createElement("div");
    row.className = "ct-table-row";

    const nameSpan = document.createElement("span");
    nameSpan.className = "ct-table-name";
    nameSpan.textContent = table.name;
    nameSpan.title = table.entries.join(", ");

    const countSpan = document.createElement("span");
    countSpan.className = "ct-table-count";
    countSpan.textContent = `(${table.entries.length})`;

    const rollBtn = document.createElement("button");
    rollBtn.className = "secondary ct-btn-roll";
    rollBtn.textContent = "Roll";
    rollBtn.addEventListener("click", () => rollTable(table.id));

    const delBtn = document.createElement("button");
    delBtn.className = "secondary outline ct-btn-delete";
    delBtn.textContent = "✕";
    delBtn.title = "Delete table";
    delBtn.addEventListener("click", () => {
      deleteTable(table.id);
      setStatus(`Deleted "${table.name}".`);
    });

    row.append(nameSpan, countSpan, rollBtn, delBtn);
    listEl.appendChild(row);
  });
}

function wireForm() {
  document.getElementById("btn-ct-add").addEventListener("click", () => {
    const name = document.getElementById("ct-name").value;
    const raw  = document.getElementById("ct-entries").value;
    const result = addTable(name, raw);
    if (result.ok) {
      document.getElementById("ct-name").value = "";
      document.getElementById("ct-entries").value = "";
      setStatus(`Table "${name.trim()}" added.`);
    } else {
      setStatus(result.error);
    }
  });
}

renderTables();
wireForm();
