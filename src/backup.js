// Backup and restore of all PaintHelperV2 data ("wph.*" keys) as one JSON file.
//
// Works in both modes: with the server it backs up the signed-in user's data, without
// it the data of this browser. Restoring overwrites the keys contained in the file and
// leaves other keys alone, then reloads the page so every module reads the new data.
// Pure helpers are exported for Node tests (require("./src/backup.js")).
(function (root, factory) {
  const api = factory();
  root.WPHBackup = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  if (typeof document !== "undefined") {
    api.mountUi(root);
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const FORMAT = "painthelper-v2-backup";
  const VERSION = 1;
  const KEY_PATTERN = /^wph\.[A-Za-z0-9._-]{1,64}$/;
  const MAX_VALUE_LENGTH = 2 * 1024 * 1024;
  const MAX_KEYS = 200;
  // Not worth carrying to another device or account.
  const SKIPPED_KEYS = new Set(["wph.theme"]);

  // items: { key: string value } -> backup object.
  function buildBackup(items, meta = {}) {
    const data = {};
    Object.keys(items || {}).sort().forEach(key => {
      const value = items[key];
      if (KEY_PATTERN.test(key) && !SKIPPED_KEYS.has(key) && typeof value === "string") {
        data[key] = value;
      }
    });
    return {
      format: FORMAT,
      version: VERSION,
      exportedAt: meta.exportedAt || new Date().toISOString(),
      appVersion: meta.appVersion || "",
      user: meta.user || "",
      items: data
    };
  }

  // Text of a backup file -> { items, exportedAt, user, skipped } or throws Error(code).
  function parseBackup(text) {
    let data;
    try {
      data = JSON.parse(String(text || ""));
    } catch (error) {
      throw new Error("not_json");
    }
    if (!data || data.format !== FORMAT || typeof data.items !== "object" || data.items === null || Array.isArray(data.items)) {
      throw new Error("not_backup");
    }
    if (Number(data.version) > VERSION) {
      throw new Error("too_new");
    }
    const items = {};
    let skipped = 0;
    Object.keys(data.items).slice(0, MAX_KEYS).forEach(key => {
      const value = data.items[key];
      if (KEY_PATTERN.test(key) && !SKIPPED_KEYS.has(key) && typeof value === "string" && value.length <= MAX_VALUE_LENGTH && isJsonOrPlain(value)) {
        items[key] = value;
      } else {
        skipped += 1;
      }
    });
    skipped += Math.max(0, Object.keys(data.items).length - MAX_KEYS);
    if (!Object.keys(items).length) {
      throw new Error("empty");
    }
    return {
      items,
      exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : "",
      user: typeof data.user === "string" ? data.user.slice(0, 40) : "",
      skipped
    };
  }

  // Values of "wph.*.vN" keys are JSON; the language key holds a plain code.
  function isJsonOrPlain(value) {
    if (/^[a-z]{2}$/.test(value)) {
      return true;
    }
    try {
      JSON.parse(value);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Short overview for the confirmation text: which areas a backup touches.
  function describeItems(items) {
    const areas = new Set();
    Object.keys(items).forEach(key => {
      if (key.startsWith("wph.armies") || key.startsWith("wph.photo.")) areas.add("armies");
      else if (key.startsWith("wph.guides")) areas.add("guides");
      else if (key.startsWith("wph.settings") || key.startsWith("wph.profiles")) areas.add("palettes");
      else if (key.startsWith("wph.kit")) areas.add("kit");
      else areas.add("other");
    });
    return Array.from(areas);
  }

  function fileName(date, user) {
    const day = (date || new Date()).toISOString().slice(0, 10);
    const who = String(user || "").replace(/[^a-z0-9._-]/gi, "").slice(0, 32);
    return `painthelper-backup-${who ? `${who}-` : ""}${day}.json`;
  }

  // ---- browser UI ----------------------------------------------------------

  function mountUi(root) {
    const start = () => {
      const exportBtn = document.getElementById("backupExportBtn");
      const importBtn = document.getElementById("backupImportBtn");
      const input = document.getElementById("backupImportInput");
      const status = document.getElementById("backupStatus");
      if (!exportBtn || !importBtn || !input || !status) {
        return;
      }
      const t = (key, params) => {
        const app = root.WPH && root.WPH.app;
        return app ? app.t(key, params) : key;
      };
      const storage = () => root.WPHStorage || null;
      let pending = null;

      exportBtn.addEventListener("click", async () => {
        const store = storage();
        if (store && store.mode && store.mode() === "server") {
          try {
            await store.flush();
          } catch (error) {
            // Export what is in memory anyway.
          }
        }
        const items = {};
        const keys = store && store.keys ? store.keys() : [];
        keys.forEach(key => {
          const value = store.get(key);
          if (typeof value === "string") {
            items[key] = value;
          }
        });
        const user = store && store.user ? store.user() : "";
        const versionNode = document.querySelector(".app-version");
        const backup = buildBackup(items, { user: user && user.username ? user.username : String(user || ""), appVersion: versionNode ? versionNode.textContent.trim() : "" });
        const blob = new Blob([JSON.stringify(backup, null, 1)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName(new Date(), backup.user);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        status.textContent = t("backup.exported", { count: Object.keys(backup.items).length });
      });

      importBtn.addEventListener("click", () => {
        if (pending) {
          applyPending();
          return;
        }
        input.click();
      });

      input.addEventListener("change", async () => {
        const file = input.files && input.files[0];
        input.value = "";
        if (!file) {
          return;
        }
        try {
          const parsed = parseBackup(await file.text());
          pending = parsed;
          const areas = describeItems(parsed.items).map(area => t(`backup.areas.${area}`)).join(", ");
          status.textContent = t("backup.confirm", { count: Object.keys(parsed.items).length, areas, date: parsed.exportedAt.slice(0, 10) || "?" });
          importBtn.textContent = t("backup.confirmButton");
          importBtn.classList.add("danger");
        } catch (error) {
          pending = null;
          status.textContent = t(`backup.errors.${error.message}`) || t("backup.errors.not_backup");
        }
      });

      async function applyPending() {
        const store = storage();
        const items = pending.items;
        pending = null;
        importBtn.disabled = true;
        Object.keys(items).forEach(key => {
          if (store) {
            store.set(key, items[key]);
          } else {
            try {
              root.localStorage.setItem(key, items[key]);
            } catch (error) {
              // Ignored: reported below as a partial restore.
            }
          }
        });
        try {
          const saved = store && store.mode && store.mode() === "server" ? await store.flush() : true;
          if (saved === false) {
            throw new Error("save");
          }
          status.textContent = t("backup.restored");
          setTimeout(() => root.location.reload(), 600);
        } catch (error) {
          status.textContent = t("backup.errors.save");
          importBtn.disabled = false;
          importBtn.textContent = t("backup.import");
          importBtn.classList.remove("danger");
        }
      }
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  }

  return { FORMAT, VERSION, buildBackup, parseBackup, describeItems, fileName, mountUi };
}));
