// Army page for PaintHelperV2: import a NewRecruit / BattleScribe list, track every
// model through the painting stages, one palette for the army and a painting guide per
// unit (opened on the painting desk). Data: "wph.armies.v1" (per user on the server).
(function () {
  "use strict";

  const STORE_KEY = "wph.armies.v1";
  const STAGE_ICONS = ["○", "▢", "◐", "●", "✓"];
  const Data = window.WPHArmyData;
  let app = null;
  let store = null;
  let saveTimer = null;
  let filter = "all";
  let showExtras = false;
  let pendingPaletteFor = "";
  let confirmDelete = false;
  const writing = new Map();
  const el = {};

  document.addEventListener("wph:update", () => {
    if (!app) {
      init();
    }
    if (app && isVisible()) {
      render();
    }
  });

  function t(key, params) {
    return app ? app.t(key, params) : key;
  }

  function init() {
    app = window.WPH && window.WPH.app;
    if (!app || !Data) {
      app = null;
      return;
    }
    ["armyBody", "armyStatus", "armySelect", "armyImportBtn", "armyImportInput", "armyPanel"].forEach(id => {
      el[id] = document.getElementById(id);
    });
    store = Data.sanitizeStore(read());
    el.armyImportBtn.addEventListener("click", () => el.armyImportInput.click());
    el.armyImportInput.addEventListener("change", () => {
      const file = el.armyImportInput.files && el.armyImportInput.files[0];
      el.armyImportInput.value = "";
      if (file) {
        importFile(file);
      }
    });
    el.armySelect.addEventListener("change", () => {
      store.activeId = el.armySelect.value;
      confirmDelete = false;
      save();
      render();
    });
    document.addEventListener("wph:workflow", event => {
      if (event.detail && event.detail.view === "army") {
        render();
      }
    });
    // A palette made from the army page ("create with the assistant") is assigned to it.
    document.addEventListener("wph:palette-created", event => {
      const army = store.armies.find(entry => entry.id === pendingPaletteFor);
      pendingPaletteFor = "";
      if (army && event.detail && event.detail.id) {
        army.paletteId = event.detail.id;
        save();
      }
    });
  }

  function isVisible() {
    return el.armyPanel && !el.armyPanel.hidden;
  }

  // ---- storage --------------------------------------------------------------

  function read() {
    try {
      const raw = window.WPHStorage ? window.WPHStorage.get(STORE_KEY) : window.localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const value = JSON.stringify(Data.sanitizeStore(store));
      try {
        if (window.WPHStorage) {
          window.WPHStorage.set(STORE_KEY, value);
        } else {
          window.localStorage.setItem(STORE_KEY, value);
        }
      } catch (error) {
        setStatus(t("army.saveError"));
      }
    }, 300);
  }

  function activeArmy() {
    return store.armies.find(army => army.id === store.activeId) || store.armies[0] || null;
  }

  function setStatus(message) {
    el.armyStatus.textContent = message || "";
  }

  // ---- import -----------------------------------------------------------------

  async function importFile(file) {
    setStatus(t("army.importing"));
    try {
      const roster = await readRoster(file);
      const parsed = Data.parseRoster(roster, { armyLabel: t("army.armyWide") });
      const now = new Date().toISOString();
      const existing = store.armies.find(army => army.name === parsed.name && army.faction === parsed.faction);
      let army;
      if (existing) {
        army = Data.mergeArmy(existing, { ...parsed, id: existing.id, updatedAt: now });
        store.armies = store.armies.map(entry => (entry.id === existing.id ? army : entry));
        setStatus(t("army.reimported", { name: army.name, added: army.addedUnits || 0, removed: (army.removedUnits || []).length }));
      } else {
        army = { ...parsed, id: `army-${Date.now().toString(36)}`, createdAt: now, updatedAt: now, paletteId: suggestPalette(parsed) };
        store.armies.unshift(army);
        const models = army.regiments.reduce((sum, regiment) => sum + regiment.units.reduce((s, unit) => s + unit.models.length, 0), 0);
        setStatus(t("army.imported", { name: army.name, units: army.regiments.reduce((sum, regiment) => sum + regiment.units.length, 0), models }));
      }
      store = Data.sanitizeStore({ ...store, activeId: army.id, armies: store.armies });
      save();
      render();
    } catch (error) {
      setStatus(t("army.importError"));
    }
  }

  async function readRoster(file) {
    const name = String(file.name || "").toLowerCase();
    const bytes = new Uint8Array(await file.arrayBuffer());
    let text;
    if (name.endsWith(".rosz") || (bytes[0] === 0x50 && bytes[1] === 0x4b)) {
      text = await unzipFirst(bytes);
    } else {
      text = new TextDecoder().decode(bytes);
    }
    const trimmed = text.trim();
    if (trimmed.startsWith("<")) {
      return Data.rosterFromXml(new DOMParser().parseFromString(trimmed, "application/xml"));
    }
    return JSON.parse(trimmed);
  }

  // .rosz is a zip with one .ros file; read it through the central directory.
  async function unzipFirst(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let end = -1;
    for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i -= 1) {
      if (view.getUint32(i, true) === 0x06054b50) {
        end = i;
        break;
      }
    }
    if (end < 0) {
      throw new Error("zip");
    }
    let offset = view.getUint32(end + 16, true);
    const entries = view.getUint16(end + 10, true);
    for (let n = 0; n < entries; n += 1) {
      if (view.getUint32(offset, true) !== 0x02014b50) {
        break;
      }
      const method = view.getUint16(offset + 10, true);
      const size = view.getUint32(offset + 20, true);
      const nameLength = view.getUint16(offset + 28, true);
      const extraLength = view.getUint16(offset + 30, true);
      const commentLength = view.getUint16(offset + 32, true);
      const local = view.getUint32(offset + 42, true);
      const fileName = new TextDecoder().decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
      offset += 46 + nameLength + extraLength + commentLength;
      if (!/\.ros$/i.test(fileName)) {
        continue;
      }
      const start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
      const data = bytes.subarray(start, start + size);
      if (method === 0) {
        return new TextDecoder().decode(data);
      }
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      return new Response(stream).text();
    }
    throw new Error("zip");
  }

  // An own palette whose prompt names the faction is a good start.
  function suggestPalette(army) {
    const faction = String(army.faction || "").toLowerCase();
    const match = faction && app.customPalettes().find(palette => String(palette.prompt || palette.name).toLowerCase().includes(faction.split(" ").pop()));
    return match ? match.id : "";
  }

  // ---- rendering --------------------------------------------------------------

  function h(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) {
        return;
      }
      if (key === "className") {
        node.className = value;
      } else if (key === "text") {
        node.textContent = value;
      } else if (key === "onClick") {
        node.addEventListener("click", value);
      } else if (key === "style") {
        Object.assign(node.style, value);
      } else {
        node.setAttribute(key, value === true ? "" : value);
      }
    });
    (Array.isArray(children) ? children : [children]).flat().forEach(child => {
      if (child !== null && child !== undefined && child !== false) {
        node.append(child);
      }
    });
    return node;
  }

  function render() {
    if (!app || !store) {
      return;
    }
    const army = activeArmy();
    el.armySelect.hidden = store.armies.length < 2;
    el.armySelect.setAttribute("aria-label", t("army.select"));
    el.armySelect.replaceChildren(...store.armies.map(entry => h("option", { value: entry.id, text: entry.name })));
    if (army) {
      el.armySelect.value = army.id;
    }
    el.armyImportBtn.textContent = t(army ? "army.importAnother" : "army.import");
    if (!army) {
      el.armyBody.replaceChildren(renderEmpty());
      return;
    }
    el.armyBody.replaceChildren(
      renderOverview(army),
      renderPalette(army),
      renderToolbar(army),
      ...army.regiments
        .map(regiment => renderRegiment(army, regiment))
        .filter(Boolean)
    );
  }

  function renderEmpty() {
    return h("div", { className: "army-empty" }, [
      h("p", { className: "army-empty-icon", "aria-hidden": "true", text: "🛡" }),
      h("h3", { text: t("army.emptyTitle") }),
      h("p", { text: t("army.emptyText") }),
      h("ol", { className: "army-empty-steps" }, [
        h("li", { text: t("army.emptyStep1") }),
        h("li", { text: t("army.emptyStep2") }),
        h("li", { text: t("army.emptyStep3") })
      ]),
      h("button", { type: "button", className: "assist-primary", text: t("army.import"), onClick: () => el.armyImportInput.click() })
    ]);
  }

  function renderOverview(army) {
    const progress = Data.armyProgress(army, { includeExtras: showExtras });
    const percent = Math.round(progress.share * 100);
    const stageBar = h("div", { className: "army-stage-bar", role: "img", "aria-label": stageSummary(progress.stages) },
      progress.stages.map((count, index) => (count ? h("span", {
        className: `stage-${index}`,
        style: { flexGrow: String(count) },
        title: `${t(`army.stages.${Data.STAGES[index]}`)}: ${count}`
      }) : null)));
    return h("div", { className: "army-overview" }, [
      h("div", { className: "army-overview-main" }, [
        h("h3", { text: army.name }),
        h("p", { className: "meta", text: [army.faction, army.systemName, army.points ? t("army.points", { points: army.points }) : ""].filter(Boolean).join(" · ") })
      ]),
      h("div", { className: "army-ring", style: { "--share": `${percent}%` }, role: "img", "aria-label": t("army.paintedShare", { percent }) }, [
        h("span", { className: "army-ring-value", text: `${percent}%` }),
        h("span", { className: "army-ring-label", text: t("army.painted") })
      ]),
      h("div", { className: "army-figures" }, [
        figure(`${progress.painted} / ${progress.models}`, t("army.modelsPainted")),
        figure(`${progress.pointsPainted} / ${progress.points}`, t("army.pointsPainted")),
        figure(`${progress.unitsDone} / ${progress.units}`, t("army.unitsDone"))
      ]),
      h("div", { className: "army-stage-legend" }, [
        stageBar,
        h("div", { className: "army-stage-keys" }, Data.STAGES.map((stage, index) => h("span", { className: `army-stage-key stage-${index}` }, [
          h("span", { className: "army-stage-dot", "aria-hidden": "true", text: STAGE_ICONS[index] }),
          `${t(`army.stages.${stage}`)} ${progress.stages[index]}`
        ])))
      ])
    ]);
  }

  function figure(value, label) {
    return h("div", { className: "army-figure" }, [h("strong", { text: value }), h("span", { text: label })]);
  }

  function stageSummary(stages) {
    return Data.STAGES.map((stage, index) => `${t(`army.stages.${stage}`)} ${stages[index]}`).join(", ");
  }

  function renderPalette(army) {
    const palettes = app.customPalettes();
    const selected = palettes.find(palette => palette.id === army.paletteId);
    const select = h("select", { id: "armyPaletteSelect", "aria-label": t("army.palette") }, [
      h("option", { value: "", text: t("army.noPalette") }),
      ...palettes.map(palette => h("option", { value: palette.id, text: palette.name }))
    ]);
    select.value = selected ? selected.id : "";
    select.addEventListener("change", () => {
      army.paletteId = select.value;
      save();
      render();
    });
    return h("div", { className: "army-palette" }, [
      h("div", { className: "army-palette-pick" }, [
        h("label", { for: "armyPaletteSelect", text: t("army.palette") }),
        select,
        selected ? h("span", { className: "army-palette-swatches", "aria-hidden": "true" },
          selected.colors.map(hex => h("span", { style: { background: hex } }))) : null
      ]),
      h("div", { className: "army-palette-actions" }, [
        h("button", {
          type: "button", className: "secondary", "data-ai-feature": "llm", text: `✨ ${t("army.createPalette")}`,
          onClick: () => {
            pendingPaletteFor = army.id;
            const input = document.getElementById("aiPaletteInput");
            input.value = [army.faction, t("army.paletteSuffix")].filter(Boolean).join(", ");
            if (window.WPHAssist) {
              window.WPHAssist.focusDescribe();
            }
          }
        }),
        selected ? h("button", {
          type: "button", className: "secondary", text: t("army.showPalette"),
          onClick: () => {
            app.selectCustomPalette(selected.id);
            window.WPHWorkflow.show("palette");
          }
        }) : null
      ]),
      selected ? null : h("p", { className: "meta", text: t("army.paletteHint") })
    ]);
  }

  function renderToolbar(army) {
    const filters = ["all", "open", "progress", "done"].map(key => h("button", {
      type: "button",
      className: "secondary army-filter",
      "aria-pressed": String(filter === key),
      text: t(`army.filter.${key}`),
      onClick: () => { filter = key; render(); }
    }));
    const extras = h("label", { className: "toggle-option army-extras" }, [
      (() => {
        const box = h("input", { type: "checkbox" });
        box.checked = showExtras;
        box.addEventListener("change", () => { showExtras = box.checked; render(); });
        return box;
      })(),
      h("span", { text: t("army.showExtras") })
    ]);
    const remove = h("button", {
      type: "button",
      className: "secondary danger army-delete",
      text: confirmDelete ? t("army.deleteConfirm") : t("army.delete"),
      onClick: () => {
        if (!confirmDelete) {
          confirmDelete = true;
          render();
          setTimeout(() => { if (confirmDelete) { confirmDelete = false; render(); } }, 4000);
          return;
        }
        confirmDelete = false;
        store.armies = store.armies.filter(entry => entry.id !== army.id);
        store.activeId = store.armies[0] ? store.armies[0].id : "";
        save();
        setStatus(t("army.deleted", { name: army.name }));
        render();
      }
    });
    return h("div", { className: "army-toolbar" }, [h("div", { className: "army-filters", role: "group", "aria-label": t("army.filterLabel") }, filters), extras, remove]);
  }

  function unitVisible(unit) {
    if (!showExtras && unit.kind !== "unit") {
      return false;
    }
    const progress = Data.unitProgress(unit);
    if (filter === "open") {
      return progress.stages[0] === progress.total;
    }
    if (filter === "progress") {
      return !progress.done && progress.stages[0] < progress.total;
    }
    if (filter === "done") {
      return progress.done;
    }
    return true;
  }

  function renderRegiment(army, regiment) {
    const units = regiment.units.filter(unitVisible);
    if (!units.length) {
      return null;
    }
    const all = regiment.units.filter(unit => showExtras || unit.kind === "unit");
    const models = all.reduce((sum, unit) => sum + unit.models.length, 0);
    const painted = all.reduce((sum, unit) => sum + Data.unitProgress(unit).painted, 0);
    return h("section", { className: "army-regiment" }, [
      h("div", { className: "army-regiment-head" }, [
        h("h3", { text: regiment.name }),
        h("span", { className: "meta", text: t("army.regimentProgress", { painted, models }) })
      ]),
      h("div", { className: "army-units" }, units.map(unit => renderUnit(army, unit)))
    ]);
  }

  function renderUnit(army, unit) {
    const progress = Data.unitProgress(unit);
    const groups = [];
    unit.models.forEach((model, index) => {
      const last = groups[groups.length - 1];
      if (last && last.name === model.name) {
        last.items.push(index);
      } else {
        groups.push({ name: model.name, items: [index] });
      }
    });
    const bulk = h("select", { className: "army-bulk", "aria-label": t("army.bulkLabel", { unit: unit.name }) }, [
      h("option", { value: "", text: t("army.bulk") }),
      ...Data.STAGES.map((stage, index) => h("option", { value: String(index), text: `${STAGE_ICONS[index]} ${t(`army.stages.${stage}`)}` }))
    ]);
    bulk.addEventListener("change", () => {
      if (bulk.value !== "") {
        unit.models.forEach(model => { model.stage = Number(bulk.value); });
        delete unit.isNew;
        save();
        render();
      }
    });
    const job = writing.get(unit);
    const guideButtons = [];
    if (unit.guide) {
      const steps = Data.guideSteps(unit.guide.text).total;
      guideButtons.push(h("button", {
        type: "button", className: "army-bench",
        text: `🖌 ${t("bench.open")} (${unit.guide.done.filter(index => index < steps).length}/${steps})`,
        onClick: () => openUnitBench(army, unit)
      }));
    }
    guideButtons.push(h("button", {
      type: "button", className: unit.guide ? "secondary" : "secondary army-write", "data-ai-feature": "llm",
      disabled: Boolean(job),
      text: unit.guide ? t("army.rewriteGuide") : `✨ ${t("army.writeGuide")}`,
      onClick: () => writeUnitGuide(army, unit)
    }));
    return h("article", { className: `army-unit${progress.done ? " is-done" : ""}`, "data-unit-key": unit.key || "" }, [
      h("div", { className: "army-unit-head" }, [
        h("h4", {}, [unit.name, unit.isNew ? h("span", { className: "army-new", text: t("army.new") }) : null]),
        h("span", { className: "meta", text: [unit.points ? t("army.points", { points: unit.points }) : "", unit.kind !== "unit" ? t(`army.kind.${unit.kind}`) : ""].filter(Boolean).join(" · ") })
      ]),
      h("div", { className: "army-unit-bar", role: "img", "aria-label": stageSummary(progress.stages) },
        progress.stages.map((count, index) => (count ? h("span", { className: `stage-${index}`, style: { flexGrow: String(count) } }) : null))),
      h("p", { className: "meta army-unit-count", text: t("army.unitProgress", { painted: progress.painted, total: progress.total }) }),
      ...groups.map(group => h("div", { className: "army-model-group" }, [
        h("span", { className: "army-model-name", text: group.items.length > 1 ? `${group.name} ×${group.items.length}` : group.name }),
        h("div", { className: "army-models" }, group.items.map((index, position) => {
          const model = unit.models[index];
          const stage = Data.STAGES[model.stage];
          return h("button", {
            type: "button",
            className: `army-model stage-${model.stage}`,
            title: t(`army.stages.${stage}`),
            "aria-label": t("army.modelLabel", { name: group.name, number: position + 1, stage: t(`army.stages.${stage}`) }),
            text: STAGE_ICONS[model.stage],
            onClick: () => {
              model.stage = (model.stage + 1) % Data.STAGES.length;
              delete unit.isNew;
              save();
              render();
            }
          });
        }))
      ])),
      h("div", { className: "army-unit-actions" }, [bulk, ...guideButtons]),
      job ? h("p", { className: "ai-status", text: job }) : null
    ]);
  }

  // ---- painting guide per unit ----------------------------------------------

  async function writeUnitGuide(army, unit) {
    if (writing.has(unit) || !window.WPHAssistant) {
      return;
    }
    if (army.paletteId && !app.selectCustomPalette(army.paletteId)) {
      army.paletteId = "";
    }
    const context = app.recipeContext({});
    context.unit = {
      name: unit.name,
      keywords: unit.keywords,
      models: Array.from(new Set(unit.models.map(model => model.name)))
    };
    const started = Date.now();
    writing.set(unit, t("ai.working"));
    render();
    const timer = setInterval(() => {
      writing.set(unit, `${t("ai.working")} ${Math.round((Date.now() - started) / 1000)} s`);
      if (isVisible()) {
        render();
      }
    }, 1000);
    try {
      const text = await window.WPHAssistant.streamRecipe(context);
      unit.guide = { text, createdAt: new Date().toISOString(), done: [] };
      save();
      setStatus(t("army.guideDone", { unit: unit.name, palette: app.paletteTitle() }));
    } catch (error) {
      if (error && error.partial) {
        unit.guide = { text: error.partial, createdAt: new Date().toISOString(), done: [] };
        save();
      }
      setStatus(window.WPHAssistant.errorText(error));
    } finally {
      clearInterval(timer);
      writing.delete(unit);
      render();
    }
  }

  function openUnitBench(army, unit) {
    if (!unit.guide || !window.WPHBench) {
      return;
    }
    if (army.paletteId) {
      app.selectCustomPalette(army.paletteId);
    }
    window.WPHBench.open({
      title: unit.name,
      subtitle: army.name,
      text: unit.guide.text,
      done: unit.guide.done,
      colors: army.paletteId ? app.palette() : [],
      onToggle: (index, checked) => {
        const done = new Set(unit.guide.done);
        if (checked) {
          done.add(index);
        } else {
          done.delete(index);
        }
        unit.guide.done = Array.from(done).sort((a, b) => a - b);
        save();
        render();
      }
    });
  }

  window.WPHArmy = { render, importFile, store: () => store };
}());
