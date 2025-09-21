const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "..", "index.html");
const version = "2025-08-29";
const modules = [
  "helpers.js",
  "join-open.js",
  "storage.js",
  "event-controls.js",
  "event-location-public.js",
  "title-rename.js",
  "auth-redirect.js",
  "auth-core.js",
  "join-event.js",
  "toast.js",
  "delta-updates.js",
  "autosave.js",
  "state.js",
  "player-meta.js",
  "access-control.js",
  "theme.js",
  "sessions.js",
  "players-ui.js",
  "editor-panel.js",
  "max-players.js",
  "event-location-editor.js",
  "americano.js",
  "rename-helpers.js",
  "courts.js",
  "rendering.js",
  "auto-fill.js",
  "score-modal.js",
  "filter-toggle.js",
  "auth-ui.js"
];

let html = fs.readFileSync(indexPath, "utf8");

// Remove any existing script tags pointing to the scripts/ directory to avoid duplicates.
html = html.replace(/\s*<script src="scripts\/.+?<\/script>\s*/gs, "\n");

const target = /\s+<script src="app\.js\?v=2025-08-29"><\/script>/;
if (!target.test(html)) {
  console.error("Could not find the existing app.js script tag to replace.");
  process.exit(1);
}

const insertion = modules
  .map((name) => `  <script src="scripts/${name}?v=${version}"></script>`)
  .join("\n");

html = html.replace(target, `\n${insertion}\n  <script src="app.js?v=${version}"></script>`);

fs.writeFileSync(indexPath, html, "utf8");

console.log("index.html updated with module scripts.");
