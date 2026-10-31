// Army lists for PaintHelperV2: reads NewRecruit / BattleScribe rosters (JSON, .ros,
// .rosz) into a painting project and keeps the painting progress per model.
// Pure functions, shared by the browser (window.WPHArmyData) and the Node tests.
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.WPHArmyData = factory();
  }
}(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Painting stages of one model, in order.
  const STAGES = ["open", "built", "primed", "painted", "based"];
  const PAINTED = STAGES.indexOf("painted");
  const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  const MAX_UNITS = 200;
  const MAX_MODELS_PER_UNIT = 120;
  const MANIFESTATION = /\b(manifestation|endless spell|invocation)\b/i;
  const TERRAIN = /\bterrain\b/i;
  // Rule categories that say nothing about what the model looks like.
  const NOISE_KEYWORDS = /^(ward|champion|standard bearer|musician|warmaster|unique|general|army composition|configuration|reinforced|battleline|faction terrain|manifestation|endless spell|regimental)\b|\(\d/i;

  function text(value, max = 120) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, max);
  }

  function list(value) {
    return Array.isArray(value) ? value : [];
  }

  function pointsOf(selection) {
    return list(selection && selection.costs)
      .filter(cost => /^(pts|points)$/i.test(String(cost && cost.name || "")) || cost.typeId === "points")
      .reduce((sum, cost) => sum + (Number(cost.value) || 0), 0);
  }

  function pointsWithChildren(selection) {
    return pointsOf(selection) + list(selection.selections).reduce((sum, child) => sum + pointsWithChildren(child), 0);
  }

  function categoryNames(selection) {
    return list(selection && selection.categories).map(category => text(category && category.name, 60)).filter(Boolean);
  }

  function systemCode(name) {
    const value = String(name || "").toLowerCase();
    if (/sigmar/.test(value)) {
      return "aos";
    }
    if (/40[, .]?000|40k|warhammer 40/.test(value)) {
      return "k40";
    }
    return "";
  }

  // Models of a unit: every nested "model" selection (not crossing into other units);
  // a unit without model entries counts as one model of its own name.
  function modelsOf(unit) {
    const models = [];
    const walk = selections => list(selections).forEach(selection => {
      if (!selection || selection.type === "unit") {
        return;
      }
      if (selection.type === "model") {
        models.push({ name: text(selection.name, 80), count: Math.max(1, Math.min(MAX_MODELS_PER_UNIT, Number(selection.number) || 1)) });
        return;
      }
      walk(selection.selections);
    });
    walk(unit.selections);
    if (!models.length) {
      models.push({ name: text(unit.name, 80), count: unit.type === "model" ? Math.max(1, Number(unit.number) || 1) : 1 });
    }
    return models;
  }

  // Units anywhere below a list of selections (manifestations sit inside "lore" upgrades).
  function unitsIn(selections, found = []) {
    list(selections).forEach(selection => {
      if (!selection) {
        return;
      }
      if (selection.type === "unit" || selection.type === "model") {
        found.push(selection);
      } else {
        unitsIn(selection.selections, found);
      }
    });
    return found;
  }

  function toUnit(selection) {
    const keywords = categoryNames(selection);
    const kind = keywords.some(name => MANIFESTATION.test(name))
      ? "manifestation"
      : keywords.some(name => TERRAIN.test(name)) ? "terrain" : "unit";
    const models = [];
    modelsOf(selection).forEach(model => {
      for (let i = 0; i < model.count && models.length < MAX_MODELS_PER_UNIT; i += 1) {
        models.push({ name: model.name, stage: 0 });
      }
    });
    return {
      key: text(selection.id, 60),
      name: text(selection.name, 80) || "Unit",
      points: pointsWithChildren(selection),
      kind,
      keywords: keywords.filter(name => !NOISE_KEYWORDS.test(name)).slice(0, 12),
      models
    };
  }

  // roster: parsed NewRecruit JSON ({ roster: {...} } or the roster itself).
  function parseRoster(input, options = {}) {
    const roster = input && input.roster ? input.roster : input;
    if (!roster || !Array.isArray(roster.forces) || !roster.forces.length) {
      throw new Error("no_roster");
    }
    const regiments = [];
    let faction = "";
    let regimentNumber = 0;
    const addForce = (force, depth) => {
      faction = faction || text(force.catalogueName, 80);
      const units = unitsIn(force.selections).map(toUnit);
      const isRegiment = /regiment/i.test(String(force.name || ""));
      if (units.length) {
        const name = isRegiment
          ? `${text(force.name, 60)} ${regimentNumber += 1}`
          : depth === 0 ? (options.armyLabel || text(force.name, 60) || "Army") : text(force.name, 60);
        regiments.push({ name, units });
      } else if (isRegiment) {
        regimentNumber += 1;
      }
      list(force.forces).forEach(child => addForce(child, depth + 1));
    };
    roster.forces.forEach(force => addForce(force, 0));
    // The army-wide group (terrain, manifestations) goes last.
    const general = regiments.filter(regiment => !/regiment/i.test(regiment.name));
    const ordered = regiments.filter(regiment => /regiment/i.test(regiment.name)).concat(general);
    let count = 0;
    ordered.forEach(regiment => {
      regiment.units = regiment.units.filter(() => (count += 1) <= MAX_UNITS);
    });
    const points = pointsOf(roster) || ordered.reduce((sum, regiment) => sum + regiment.units.reduce((s, unit) => s + unit.points, 0), 0);
    const limit = list(roster.costLimits).map(cost => Number(cost && cost.value) || 0).find(Boolean) || 0;
    return {
      name: text(roster.name, 80) || faction || "Army",
      faction,
      system: systemCode(roster.gameSystemName),
      systemName: text(roster.gameSystemName, 60),
      source: text(roster.generatedBy, 80),
      points,
      pointsLimit: limit,
      regiments: ordered.filter(regiment => regiment.units.length)
    };
  }

  // BattleScribe XML (.ros) as a DOM document -> the same shape as the JSON export.
  function rosterFromXml(doc) {
    const root = doc && doc.documentElement;
    if (!root || root.localName !== "roster") {
      throw new Error("no_roster");
    }
    const children = (node, name) => Array.from(node.children).filter(child => child.localName === name);
    const group = (node, name, item) => children(node, name).flatMap(wrapper => children(wrapper, item));
    const costs = node => group(node, "costs", "cost").map(cost => ({
      name: cost.getAttribute("name"), typeId: cost.getAttribute("typeId"), value: Number(cost.getAttribute("value")) || 0
    }));
    const selection = node => ({
      id: node.getAttribute("id"),
      name: node.getAttribute("name"),
      type: node.getAttribute("type"),
      number: Number(node.getAttribute("number")) || 1,
      costs: costs(node),
      categories: group(node, "categories", "category").map(category => ({ name: category.getAttribute("name") })),
      selections: group(node, "selections", "selection").map(selection)
    });
    const force = node => ({
      name: node.getAttribute("name"),
      catalogueName: node.getAttribute("catalogueName"),
      selections: group(node, "selections", "selection").map(selection),
      forces: group(node, "forces", "force").map(force)
    });
    return {
      roster: {
        name: root.getAttribute("name"),
        gameSystemName: root.getAttribute("gameSystemName"),
        generatedBy: "BattleScribe",
        costs: costs(root),
        costLimits: group(root, "costLimits", "costLimit").map(cost => ({ value: Number(cost.getAttribute("value")) || 0 })),
        forces: group(root, "forces", "force").map(force)
      }
    };
  }

  // A new import of the same list keeps stages, guides and palettes: units are matched
  // by their roster id, then by name and position; models by name and position.
  function mergeArmy(previous, next) {
    if (!previous) {
      return next;
    }
    const oldUnits = previous.regiments.flatMap(regiment => regiment.units);
    const byKey = new Map(oldUnits.filter(unit => unit.key).map(unit => [unit.key, unit]));
    const byName = new Map();
    oldUnits.forEach(unit => {
      const entries = byName.get(unit.name) || [];
      entries.push(unit);
      byName.set(unit.name, entries);
    });
    const used = new Set();
    // Keys of the new list; an old key is only taken over when no new unit uses it.
    const nextKeys = new Set(next.regiments.flatMap(regiment => regiment.units).map(unit => unit.key).filter(Boolean));
    let added = 0;
    next.regiments.forEach(regiment => regiment.units.forEach(unit => {
      let match = unit.key && byKey.get(unit.key);
      if (!match || used.has(match)) {
        match = (byName.get(unit.name) || []).find(candidate => !used.has(candidate));
      }
      if (!match) {
        unit.isNew = true;
        added += 1;
        return;
      }
      used.add(match);
      // Matched by name with a changed key: keep the old key so photos and links stay attached.
      if (match.key && unit.key !== match.key && !nextKeys.has(match.key)) {
        unit.key = match.key;
      }
      const stages = new Map();
      match.models.forEach(model => {
        const entries = stages.get(model.name) || [];
        entries.push({ stage: model.stage, paintedAt: model.paintedAt });
        stages.set(model.name, entries);
      });
      unit.models.forEach(model => {
        const entries = stages.get(model.name);
        if (entries && entries.length) {
          const kept = entries.shift();
          model.stage = kept.stage;
          if (kept.paintedAt) {
            model.paintedAt = kept.paintedAt;
          }
        }
      });
      ["guide", "paletteId", "note"].forEach(field => {
        if (match[field]) {
          unit[field] = match[field];
        }
      });
    }));
    return {
      ...next,
      id: previous.id,
      paletteId: previous.paletteId || next.paletteId || "",
      createdAt: previous.createdAt || next.createdAt,
      removedUnits: oldUnits.filter(unit => !used.has(unit)).map(unit => unit.name),
      addedUnits: added
    };
  }

  function unitProgress(unit) {
    const total = unit.models.length;
    const painted = unit.models.filter(model => model.stage >= PAINTED).length;
    const based = unit.models.filter(model => model.stage >= STAGES.length - 1).length;
    const stages = STAGES.map((stage, index) => unit.models.filter(model => model.stage === index).length);
    return { total, painted, based, stages, share: total ? painted / total : 0, done: total > 0 && painted === total };
  }

  function armyProgress(army, options = {}) {
    const units = army.regiments.flatMap(regiment => regiment.units)
      .filter(unit => options.includeExtras || unit.kind === "unit");
    const result = { models: 0, painted: 0, based: 0, points: 0, pointsPainted: 0, stages: STAGES.map(() => 0), units: units.length, unitsDone: 0 };
    units.forEach(unit => {
      const progress = unitProgress(unit);
      result.models += progress.total;
      result.painted += progress.painted;
      result.based += progress.based;
      result.points += unit.points;
      result.pointsPainted += unit.points * progress.share;
      progress.stages.forEach((count, index) => { result.stages[index] += count; });
      if (progress.done) {
        result.unitsDone += 1;
      }
    });
    result.pointsPainted = Math.round(result.pointsPainted);
    result.share = result.models ? result.painted / result.models : 0;
    return result;
  }

  // Stored projects: bounded, with unknown fields dropped.
  function sanitizeStore(value) {
    const store = value && typeof value === "object" ? value : {};
    const armies = list(store.armies).slice(0, 20).map(sanitizeArmy).filter(Boolean);
    const activeId = armies.some(army => army.id === store.activeId) ? store.activeId : (armies[0] ? armies[0].id : "");
    return { version: 1, activeId, armies };
  }

  function sanitizeGuide(guide) {
    if (!guide || typeof guide.text !== "string" || !guide.text.trim()) {
      return null;
    }
    return {
      text: guide.text.slice(0, 20000),
      createdAt: text(guide.createdAt, 40),
      done: list(guide.done).map(Number).filter(index => Number.isInteger(index) && index >= 0 && index < 500).slice(0, 500)
    };
  }

  function sanitizeArmy(army) {
    if (!army || typeof army !== "object" || !/^army-[a-z0-9-]{1,40}$/.test(String(army.id || ""))) {
      return null;
    }
    const regiments = list(army.regiments).slice(0, 30).map(regiment => ({
      name: text(regiment && regiment.name, 60) || "Regiment",
      units: list(regiment && regiment.units).slice(0, MAX_UNITS).map(unit => {
        const guide = sanitizeGuide(unit && unit.guide);
        return {
          key: text(unit && unit.key, 60),
          name: text(unit && unit.name, 80) || "Unit",
          points: Math.max(0, Math.min(100000, Number(unit && unit.points) || 0)),
          kind: ["unit", "manifestation", "terrain"].includes(unit && unit.kind) ? unit.kind : "unit",
          keywords: list(unit && unit.keywords).map(word => text(word, 40)).filter(Boolean).slice(0, 12),
          models: list(unit && unit.models).slice(0, MAX_MODELS_PER_UNIT).map(model => {
            const stage = Math.max(0, Math.min(STAGES.length - 1, Math.round(Number(model && model.stage) || 0)));
            const paintedAt = stage >= PAINTED && DATE_PATTERN.test(String(model && model.paintedAt || "")) ? model.paintedAt : "";
            return { name: text(model && model.name, 80) || "Model", stage, ...(paintedAt ? { paintedAt } : {}) };
          }),
          ...(guide ? { guide } : {}),
          ...(unit && unit.isNew ? { isNew: true } : {})
        };
      }).filter(unit => unit.models.length)
    })).filter(regiment => regiment.units.length);
    return {
      id: army.id,
      name: text(army.name, 80) || "Army",
      faction: text(army.faction, 80),
      system: ["aos", "k40"].includes(army.system) ? army.system : "",
      systemName: text(army.systemName, 60),
      source: text(army.source, 80),
      points: Math.max(0, Number(army.points) || 0),
      pointsLimit: Math.max(0, Number(army.pointsLimit) || 0),
      paletteId: /^custom-[a-z0-9-]{1,40}$/.test(String(army.paletteId || "")) ? army.paletteId : "",
      createdAt: text(army.createdAt, 40),
      updatedAt: text(army.updatedAt, 40),
      regiments
    };
  }

  // Numbered steps of a guide in order ("1. …" lines); used for ticking off steps.
  function guideSteps(markdown) {
    const sections = [];
    let current = null;
    let index = 0;
    String(markdown || "").split(/\r?\n/).forEach(line => {
      const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
      if (heading) {
        current = { title: heading[1].trim(), steps: [], bullets: [] };
        sections.push(current);
        return;
      }
      const step = line.match(/^\s*\d+[.)]\s+(.*)$/);
      if (step) {
        if (!current) {
          current = { title: "", steps: [], bullets: [] };
          sections.push(current);
        }
        current.steps.push({ index, text: step[1].trim() });
        index += 1;
        return;
      }
      const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
      if (bullet && current) {
        current.bullets.push(bullet[1].trim());
      } else if (line.trim() && current && !current.steps.length && !current.bullets.length) {
        current.lead = current.lead ? `${current.lead} ${line.trim()}` : line.trim();
      }
    });
    return { sections, total: index };
  }

  // Up to `limit` units to paint next: units in progress first (most painted share,
  // then points), then untouched units by points. Manifestations and terrain are skipped.
  function nextUnits(army, limit = 3) {
    const unitsWithRegiment = army.regiments.flatMap(regiment => regiment.units.map(unit => ({ unit, regiment: regiment.name })));
    const candidates = unitsWithRegiment.filter(({ unit }) => unit.kind === "unit" && !unitProgress(unit).done);
    const inWork = candidates.filter(({ unit }) => unit.models.some(model => model.stage > 0));
    const notStarted = candidates.filter(({ unit }) => unit.models.every(model => model.stage === 0));
    inWork.sort((a, b) => {
      const shareA = unitProgress(a.unit).share;
      const shareB = unitProgress(b.unit).share;
      if (shareB !== shareA) {
        return shareB - shareA;
      }
      return b.unit.points - a.unit.points;
    });
    notStarted.sort((a, b) => b.unit.points - a.unit.points);
    const result = inWork.concat(notStarted).slice(0, limit).map(({ unit, regiment }) => ({
      unit,
      regiment,
      progress: unitProgress(unit)
    }));
    return result;
  }

  function setStage(model, stage, now = new Date()) {
    const next = Math.max(0, Math.min(STAGES.length - 1, Math.round(Number(stage) || 0)));
    if (next >= PAINTED) {
      if (!(model.stage >= PAINTED && model.paintedAt)) {
        model.paintedAt = now.toISOString().slice(0, 10);
      }
    } else {
      delete model.paintedAt;
    }
    model.stage = next;
    return model;
  }

  function paintedByMonth(army, options = {}) {
    const counts = new Map();
    list(army && army.regiments)
      .flatMap(regiment => list(regiment && regiment.units))
      .filter(unit => options.includeExtras || unit.kind === "unit")
      .forEach(unit => list(unit.models).forEach(model => {
        if (model.stage >= PAINTED && model.paintedAt) {
          const month = String(model.paintedAt).slice(0, 7);
          counts.set(month, (counts.get(month) || 0) + 1);
        }
      }));
    return Array.from(counts, ([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month));
  }

  // Maximum length of a stored photo data URL; keeps every photo key small for the storage API.
  const PHOTO_MAX_CHARS = 80000;

  // Storage key for one unit photo.
  function photoKey(armyId, unit) {
    const source = `${armyId}|${(unit && (unit.key || unit.name)) || ""}`;
    let hash = 0x811c9dc5;
    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return `wph.photo.${hash.toString(16).padStart(8, "0")}`;
  }

  // Accepts only small jpeg/webp data URLs.
  function sanitizePhoto(value) {
    return typeof value === "string" && value.length <= PHOTO_MAX_CHARS && /^data:image\/(jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value) ? value : "";
  }

  // Target size for downscaling a photo without enlarging it.
  function photoSize(width, height, max = 480) {
    const w = Number(width);
    const h = Number(height);
    if (!(w > 0) || !(h > 0)) {
      return { width: 0, height: 0 };
    }
    const scale = Math.min(1, max / Math.max(w, h));
    return { width: Math.max(1, Math.round(w * scale)), height: Math.max(1, Math.round(h * scale)) };
  }

  // Splits a guide step into main text and trailing hint at the last valid " – ".
  function splitStepText(value) {
    const text = String(value == null ? "" : value);
    const separator = " – ";
    let searchFrom = text.length;
    while (searchFrom >= 0) {
      const index = text.lastIndexOf(separator, searchFrom);
      if (index < 0) {
        break;
      }
      const before = text.slice(0, index);
      const after = text.slice(index + separator.length);
      let depth = 0;
      for (let position = 0; position < before.length; position += 1) {
        if (before[position] === "(") {
          depth += 1;
        } else if (before[position] === ")") {
          depth = Math.max(0, depth - 1);
        }
      }
      if (depth === 0 && !after.includes("`")) {
        return { main: before.trim(), hint: after.trim() };
      }
      searchFrom = index - 1;
    }
    return { main: text.trim(), hint: "" };
  }

  return { STAGES, PAINTED, parseRoster, rosterFromXml, mergeArmy, unitProgress, armyProgress, sanitizeStore, sanitizeArmy, guideSteps, nextUnits, setStage, paintedByMonth, PHOTO_MAX_CHARS, photoKey, sanitizePhoto, photoSize, splitStepText };
}));
