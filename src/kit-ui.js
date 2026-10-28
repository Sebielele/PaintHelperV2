// Painting kit panel (paints page): pick saved guides, get the pots to pack.
// Logic in src/kit.js; selection and tolerance are kept in "wph.kit.v1".
(function () {
  "use strict";

  const STORE_KEY = "wph.kit.v1";
  const GUIDES_KEY = "wph.guides.v1";
  const ARMIES_KEY = "wph.armies.v1";
  const TOLERANCES = [0, 5, 10, 15];
  const Kit = window.WPHKit;
  let app = null;
  let open = false;
  let settings = { selected: [], tolerance: 10 };
  let sources = [];
  let lastPlan = null;
  let lastUnknown = [];
  const el = {};

  document.addEventListener("wph:update", () => {
    if (!app) {
      init();
    }
    if (app && open) {
      render();
    }
  });

  document.addEventListener("wph:workflow", event => {
    if (app && open && event.detail && event.detail.view === "paints") {
      render();
    }
  });

  function t(key, params) {
    return app ? app.t(key, params) : key;
  }

  function init() {
    app = window.WPH && window.WPH.app;
    if (!app || !Kit || typeof app.ownedPaints !== "function") {
      app = null;
      return;
    }
    ["kitPanel", "kitBody", "kitCollapseBtn", "kitFilterInput", "kitToleranceSelect", "kitAllBtn", "kitNoneBtn",
      "kitSources", "kitStatus", "kitResult"].forEach(id => {
      el[id] = document.getElementById(id);
    });
    if (!el.kitPanel) {
      app = null;
      return;
    }
    settings = readSettings();
    el.kitToleranceSelect.value = String(settings.tolerance);
    el.kitCollapseBtn.addEventListener("click", () => {
      open = !open;
      syncOpen();
      if (open) {
        render();
      }
    });
    el.kitFilterInput.addEventListener("input", () => renderSources());
    el.kitToleranceSelect.addEventListener("change", () => {
      settings.tolerance = Number(el.kitToleranceSelect.value) || 0;
      saveSettings();
      renderResult();
    });
    el.kitAllBtn.addEventListener("click", () => {
      visibleSources().forEach(source => {
        if (!settings.selected.includes(source.id)) {
          settings.selected.push(source.id);
        }
      });
      saveSettings();
      render();
    });
    el.kitNoneBtn.addEventListener("click", () => {
      const visible = new Set(visibleSources().map(source => source.id));
      settings.selected = settings.selected.filter(id => !visible.has(id));
      saveSettings();
      render();
    });
    syncOpen();
  }

  function syncOpen() {
    el.kitBody.hidden = !open;
    el.kitCollapseBtn.setAttribute("aria-expanded", String(open));
    const label = t(open ? "kit.collapse" : "kit.expand");
    el.kitCollapseBtn.textContent = label;
    el.kitCollapseBtn.title = label;
    el.kitCollapseBtn.setAttribute("aria-label", label);
  }

  // ---- storage -------------------------------------------------------------

  function readJson(key) {
    try {
      const raw = window.WPHStorage ? window.WPHStorage.get(key) : window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function readSettings() {
    const data = readJson(STORE_KEY) || {};
    const tolerance = TOLERANCES.includes(Number(data.tolerance)) ? Number(data.tolerance) : 10;
    const selected = Array.isArray(data.selected) ? data.selected.filter(id => typeof id === "string" && id.length < 200).slice(0, 200) : [];
    return { selected, tolerance };
  }

  function saveSettings() {
    const value = JSON.stringify({ version: 1, selected: settings.selected.slice(0, 200), tolerance: settings.tolerance });
    try {
      if (window.WPHStorage) {
        window.WPHStorage.set(STORE_KEY, value);
      } else {
        window.localStorage.setItem(STORE_KEY, value);
      }
    } catch (error) {
      // Storage blocked: the selection simply is not remembered.
    }
  }

  // ---- rendering -----------------------------------------------------------

  function render() {
    syncOpen();
    sources = Kit.collectSources(readJson(GUIDES_KEY), readJson(ARMIES_KEY));
    // Forget guides that no longer exist.
    const known = new Set(sources.map(source => source.id));
    const kept = settings.selected.filter(id => known.has(id));
    if (kept.length !== settings.selected.length) {
      settings.selected = kept;
      saveSettings();
    }
    renderSources();
    renderResult();
  }

  function visibleSources() {
    const query = el.kitFilterInput.value.trim().toLowerCase();
    return query
      ? sources.filter(source => `${source.label} ${source.group}`.toLowerCase().includes(query))
      : sources;
  }

  function renderSources() {
    const visible = visibleSources();
    if (!sources.length) {
      el.kitSources.replaceChildren(paragraph(t("kit.noGuides"), "meta"));
      return;
    }
    const groups = new Map();
    visible.forEach(source => {
      const group = source.kind === "unit" ? source.group || t("kit.armyGuides") : t("kit.paletteGuides");
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group).push(source);
    });
    const nodes = [];
    groups.forEach((items, group) => {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "kit-group";
      const legend = document.createElement("legend");
      legend.textContent = group;
      fieldset.appendChild(legend);
      items.forEach(source => {
        const label = document.createElement("label");
        label.className = "kit-source";
        const box = document.createElement("input");
        box.type = "checkbox";
        box.checked = settings.selected.includes(source.id);
        box.addEventListener("change", () => {
          settings.selected = settings.selected.filter(id => id !== source.id);
          if (box.checked) {
            settings.selected.push(source.id);
          }
          saveSettings();
          renderResult();
        });
        const name = document.createElement("span");
        name.textContent = source.label;
        const count = document.createElement("span");
        count.className = "meta";
        count.textContent = t("kit.paintCount", { count: Kit.guidePaintNames(source.text).length });
        label.append(box, name, count);
        fieldset.appendChild(label);
      });
      nodes.push(fieldset);
    });
    if (!nodes.length) {
      nodes.push(paragraph(t("kit.noMatch"), "meta"));
    }
    el.kitSources.replaceChildren(...nodes);
  }

  function renderResult() {
    const chosen = sources.filter(source => settings.selected.includes(source.id));
    if (!chosen.length) {
      lastPlan = null;
      el.kitStatus.textContent = sources.length ? t("kit.pickGuides") : "";
      el.kitResult.replaceChildren();
      return;
    }
    const { needed, unknown } = Kit.neededPaints(chosen, name => app.findPaintByName(name), paint => app.paintKey(paint));
    const plan = Kit.planKit({
      needed,
      owned: app.ownedPaints(),
      keyOf: paint => app.paintKey(paint),
      distance: (a, b) => app.colorDistance(a, b),
      maxDistance: settings.tolerance
    });
    lastPlan = plan;
    lastUnknown = unknown;
    el.kitStatus.textContent = t("kit.summary", {
      guides: chosen.length, needed: plan.stats.needed, pack: plan.stats.pack, buy: plan.stats.buy
    }) + (plan.stats.saved ? ` ${t("kit.saved", { count: plan.stats.saved })}` : "");

    const nodes = [];
    if (plan.pack.length) {
      nodes.push(heading(t("kit.packTitle", { count: plan.pack.length })));
      const list = document.createElement("ul");
      list.className = "kit-list";
      plan.pack.forEach(item => {
        const others = item.covers.filter(cover => cover.key !== item.key);
        const note = others.length
          ? t("kit.standsIn", { names: others.map(cover => `${cover.paint.name} (ΔE ${cover.distance})`).join(", ") })
          : "";
        list.appendChild(paintRow(item.paint, note, true));
      });
      nodes.push(list);
    }
    if (plan.buy.length) {
      const head = document.createElement("div");
      head.className = "kit-buy-head";
      head.appendChild(heading(t("kit.buyTitle", { count: plan.buy.length })));
      const toAdd = plan.buy.filter(item => !app.isOnShoppingList(item.paint));
      const add = document.createElement("button");
      add.type = "button";
      add.className = "secondary";
      add.textContent = toAdd.length ? t("kit.addToList", { count: toAdd.length }) : t("kit.allListed");
      add.disabled = !toAdd.length;
      add.addEventListener("click", () => {
        toAdd.forEach(item => app.addToShoppingList(item.paint));
        renderResult();
      });
      head.appendChild(add);
      nodes.push(head);
      const list = document.createElement("ul");
      list.className = "kit-list";
      plan.buy.forEach(item => {
        const note = [
          app.isOnShoppingList(item.paint) ? t("ai.onList") : "",
          item.sources.length ? t("kit.usedIn", { names: item.sources.slice(0, 3).join(", ") }) : ""
        ].filter(Boolean).join(" · ");
        list.appendChild(paintRow(item.paint, note, false));
      });
      nodes.push(list);
    }
    if (unknown.length) {
      nodes.push(paragraph(t("kit.unknown", { names: unknown.join(", ") }), "meta"));
    }
    if (!plan.pack.length && !plan.buy.length) {
      nodes.push(paragraph(t("kit.empty"), "meta"));
    }
    const actions = document.createElement("div");
    actions.className = "kit-actions";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "secondary";
    copy.textContent = t("kit.copy");
    copy.addEventListener("click", () => copyList(copy));
    const download = document.createElement("button");
    download.type = "button";
    download.className = "secondary";
    download.textContent = t("kit.download");
    download.addEventListener("click", downloadList);
    actions.append(copy, download);
    nodes.push(actions);
    el.kitResult.replaceChildren(...nodes);
  }

  function paintRow(paint, note, owned) {
    const item = document.createElement("li");
    const swatch = document.createElement("span");
    swatch.className = "ai-paint-swatch";
    swatch.style.background = paint.hex || "transparent";
    const name = document.createElement("span");
    name.className = "kit-paint-name";
    name.textContent = paint.name;
    const brand = document.createElement("span");
    brand.className = "meta";
    brand.textContent = [paint.manufacturer, paint.range || paint.collection].filter(Boolean).join(" · ");
    item.append(swatch, name, brand);
    if (owned) {
      const badge = document.createElement("span");
      badge.className = "owned-badge";
      badge.textContent = t("ai.searchOwned");
      item.appendChild(badge);
    }
    if (note) {
      const detail = document.createElement("span");
      detail.className = "kit-note meta";
      detail.textContent = note;
      item.appendChild(detail);
    }
    return item;
  }

  function listText() {
    return lastPlan ? Kit.kitText(lastPlan, {
      title: t("kit.title"),
      pack: t("kit.packLabel"),
      buy: t("kit.buyLabel"),
      standsIn: t("kit.standsInShort"),
      unknown: t("kit.unknownLabel")
    }, lastUnknown) : "";
  }

  async function copyList(button) {
    const text = listText();
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = t("kit.copied");
    } catch (error) {
      button.textContent = t("kit.copyFailed");
    }
    setTimeout(() => {
      button.textContent = t("kit.copy");
    }, 2000);
  }

  function downloadList() {
    const blob = new Blob([listText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `painting-kit-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function heading(text) {
    const node = document.createElement("h4");
    node.className = "kit-heading";
    node.textContent = text;
    return node;
  }

  function paragraph(text, className) {
    const node = document.createElement("p");
    if (className) {
      node.className = className;
    }
    node.textContent = text;
    return node;
  }
}());
