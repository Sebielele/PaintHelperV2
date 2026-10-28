// Painting kit for PaintHelperV2: which pots to pack for a set of painting guides.
//
// Pure functions (no DOM), loaded in the browser as window.WPHKit and in Node via
// require(). The UI lives in src/kit-ui.js.
//
// The planner reads the paints named in the chosen guides (**Paint name**), keeps the
// ones you own, and lets one owned pot stand in for several guide paints when they are
// close enough (CIEDE2000 ≤ the chosen limit). The selection is a greedy set cover: the
// pot that covers the most still-uncovered guide paints goes first, ties go to the
// smaller total colour difference. Guide paints that nothing in the collection covers
// end up on the "buy" list.
(function (root, factory) {
  const api = factory();
  root.WPHKit = api;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PAINT_NAME_PATTERN = /\*\*([^*\n]{1,80})\*\*/g;
  const MAX_SOURCES = 200;

  // Kind of paint, from the catalogue's range/finish/type fields.
  function kindOf(paint) {
    const text = `${paint && paint.range || ""} ${paint && paint.finish || ""} ${paint && paint.type || ""} ${paint && paint.collection || ""}`.toLowerCase();
    if (/metal/.test(text)) return "metallic";
    if (/wash|shade/.test(text)) return "wash";
    if (/contrast|speedpaint|xpress|ink|glaze|transparent/.test(text)) return "transparent";
    if (/technical|texture|medium|varnish/.test(text)) return "technical";
    return "opaque";
  }

  // Paint names in a guide, in order of first appearance, without duplicates.
  function guidePaintNames(text) {
    const seen = new Set();
    const names = [];
    for (const match of String(text || "").matchAll(PAINT_NAME_PATTERN)) {
      const name = match[1].trim();
      const key = name.toLowerCase();
      if (name && !seen.has(key)) {
        seen.add(key);
        names.push(name);
      }
    }
    return names;
  }

  // All saved guides as kit sources: guides per palette ("wph.guides.v1") and guides per
  // army unit ("wph.armies.v1"). Each source: { id, kind, label, group, text, createdAt }.
  function collectSources(guidesStore, armiesStore) {
    const sources = [];
    const guideItems = guidesStore && Array.isArray(guidesStore.items) ? guidesStore.items : [];
    guideItems.forEach(item => {
      if (item && typeof item.sig === "string" && typeof item.text === "string" && item.text.trim()) {
        sources.push({
          id: `palette:${item.sig}`,
          kind: "palette",
          label: typeof item.title === "string" && item.title.trim() ? item.title.trim() : "–",
          group: "",
          text: item.text,
          createdAt: typeof item.createdAt === "string" ? item.createdAt : ""
        });
      }
    });
    const armies = armiesStore && Array.isArray(armiesStore.armies) ? armiesStore.armies : [];
    armies.forEach(army => {
      if (!army || typeof army.id !== "string") {
        return;
      }
      (Array.isArray(army.regiments) ? army.regiments : []).forEach(regiment => {
        (regiment && Array.isArray(regiment.units) ? regiment.units : []).forEach(unit => {
          const guide = unit && unit.guide;
          if (guide && typeof guide.text === "string" && guide.text.trim()) {
            const id = `unit:${army.id}:${unit.key || unit.id || unit.name}`;
            if (!sources.some(source => source.id === id)) {
              sources.push({
                id,
                kind: "unit",
                label: String(unit.name || "–"),
                group: String(army.name || ""),
                text: guide.text,
                createdAt: typeof guide.createdAt === "string" ? guide.createdAt : ""
              });
            }
          }
        });
      });
    });
    return sources.slice(0, MAX_SOURCES);
  }

  // Guide paints of the chosen sources, resolved to catalogue paints.
  // resolve(name) -> paint | null; keyOf(paint) -> unique key.
  // Returns { needed: [{ paint, key, sources: [label] }], unknown: [name] }.
  function neededPaints(sources, resolve, keyOf) {
    const byKey = new Map();
    const unknown = [];
    const unknownSeen = new Set();
    sources.forEach(source => {
      guidePaintNames(source.text).forEach(name => {
        const paint = resolve(name);
        if (!paint || !paint.hex) {
          const lower = name.toLowerCase();
          if (!unknownSeen.has(lower)) {
            unknownSeen.add(lower);
            unknown.push(name);
          }
          return;
        }
        const key = keyOf(paint);
        const entry = byKey.get(key) || { paint, key, sources: [] };
        if (!entry.sources.includes(source.label)) {
          entry.sources.push(source.label);
        }
        byKey.set(key, entry);
      });
    });
    return { needed: Array.from(byKey.values()), unknown };
  }

  // Greedy set cover of the needed paints with owned paints.
  // options: { needed, owned, keyOf, distance(hexA, hexB), maxDistance }
  // Returns {
  //   pack: [{ paint, key, covers: [{ paint, key, distance }] }],
  //   buy:  [{ paint, key, sources }],
  //   stats: { needed, pack, buy, saved }
  // }
  function planKit({ needed, owned, keyOf, distance, maxDistance = 0 }) {
    const limit = Math.max(0, Number(maxDistance) || 0);
    const ownedByKey = new Map();
    (owned || []).forEach(paint => {
      if (paint && paint.hex) {
        ownedByKey.set(keyOf(paint), paint);
      }
    });
    const ownedList = Array.from(ownedByKey.entries()).map(([key, paint]) => ({ key, paint }));

    // Which owned pots can stand in for which needed paints (and how far off they are).
    const coverage = new Map();
    const addCover = (ownedKey, ownedPaint, item, dist) => {
      const entry = coverage.get(ownedKey) || { key: ownedKey, paint: ownedPaint, covers: new Map() };
      entry.covers.set(item.key, { paint: item.paint, key: item.key, distance: dist });
      coverage.set(ownedKey, entry);
    };
    needed.forEach(item => {
      if (ownedByKey.has(item.key)) {
        addCover(item.key, ownedByKey.get(item.key), item, 0);
      }
      if (limit > 0) {
        const kind = kindOf(item.paint);
        ownedList.forEach(({ key, paint }) => {
          if (key === item.key || kindOf(paint) !== kind) {
            return;
          }
          const dist = distance(item.paint.hex, paint.hex);
          if (Number.isFinite(dist) && dist <= limit) {
            addCover(key, paint, item, Math.round(dist * 10) / 10);
          }
        });
      }
    });

    const uncovered = new Set(needed.map(item => item.key));
    const pack = [];
    while (uncovered.size) {
      let best = null;
      coverage.forEach(entry => {
        const covers = Array.from(entry.covers.values()).filter(cover => uncovered.has(cover.key));
        if (!covers.length) {
          return;
        }
        const total = covers.reduce((sum, cover) => sum + cover.distance, 0);
        // An exact owned pot of a guide paint wins ties: it is the paint the guide names.
        const exact = covers.some(cover => cover.key === entry.key) ? 1 : 0;
        const score = [covers.length, exact, -total];
        if (!best || compareScore(score, best.score) > 0
          || (compareScore(score, best.score) === 0 && entry.paint.name < best.entry.paint.name)) {
          best = { entry, covers, score };
        }
      });
      if (!best) {
        break;
      }
      best.covers.forEach(cover => uncovered.delete(cover.key));
      pack.push({
        paint: best.entry.paint,
        key: best.entry.key,
        covers: best.covers.slice().sort((a, b) => a.distance - b.distance)
      });
    }
    const buy = needed.filter(item => uncovered.has(item.key));
    pack.sort((a, b) => b.covers.length - a.covers.length || byName(a.paint, b.paint));
    buy.sort((a, b) => byName(a.paint, b.paint));
    const coveredCount = needed.length - buy.length;
    return {
      pack,
      buy,
      stats: { needed: needed.length, pack: pack.length, buy: buy.length, saved: Math.max(0, coveredCount - pack.length) }
    };
  }

  function compareScore(a, b) {
    for (let index = 0; index < a.length; index += 1) {
      if (a[index] !== b[index]) {
        return a[index] > b[index] ? 1 : -1;
      }
    }
    return 0;
  }

  function byName(a, b) {
    return String(a.name).localeCompare(String(b.name)) || String(a.manufacturer || "").localeCompare(String(b.manufacturer || ""));
  }

  // Plain-text packing list (for copying into notes or a message).
  // labels: { title, pack, buy, standsIn, unknown } – already translated.
  function kitText(plan, labels, unknown) {
    const lines = [labels.title, ""];
    if (plan.pack.length) {
      lines.push(`${labels.pack} (${plan.pack.length})`);
      plan.pack.forEach(item => {
        const others = item.covers.filter(cover => cover.key !== item.key).map(cover => cover.paint.name);
        const brand = item.paint.manufacturer ? ` – ${item.paint.manufacturer}` : "";
        lines.push(`[ ] ${item.paint.name}${brand}${others.length ? ` (${labels.standsIn} ${others.join(", ")})` : ""}`);
      });
      lines.push("");
    }
    if (plan.buy.length) {
      lines.push(`${labels.buy} (${plan.buy.length})`);
      plan.buy.forEach(item => {
        const brand = item.paint.manufacturer ? ` – ${item.paint.manufacturer}` : "";
        lines.push(`[ ] ${item.paint.name}${brand}`);
      });
      lines.push("");
    }
    if (unknown && unknown.length) {
      lines.push(`${labels.unknown}: ${unknown.join(", ")}`);
    }
    return lines.join("\n").trim();
  }

  return { kindOf, guidePaintNames, collectSources, neededPaints, planKit, kitText };
}));
