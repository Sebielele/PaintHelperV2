(function (root, factory) {
  const api = factory();
  root.WPH = Object.assign(root.WPH || {}, api);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function preferredBrands(ownedPaints, defaultBrands) {
    if (Array.isArray(ownedPaints) && ownedPaints.length) {
      return new Set(ownedPaints.map(paint => paint && paint.manufacturer));
    }
    return new Set(Array.isArray(defaultBrands) ? defaultBrands : []);
  }

  function rankByPreferredBrand(matches, preferred, penalty) {
    const preferredSet = preferred instanceof Set ? preferred : new Set(Array.isArray(preferred) ? preferred : []);
    const brandPenalty = penalty === undefined ? 0 : penalty;
    return (Array.isArray(matches) ? matches : [])
      .map(match => {
        const distance = match && Number.isFinite(match.distance) ? match.distance : Number.POSITIVE_INFINITY;
        return { match, score: distance + (preferredSet.has(match && match.manufacturer) ? 0 : brandPenalty) };
      })
      .sort((a, b) => a.score - b.score)
      .map(item => item.match);
  }

  function equivalentPaint(hex, pool, options) {
    if (!Array.isArray(pool) || !pool.length) {
      return [];
    }
    const opts = options || {};
    const ownedKeys = opts.ownedKeys instanceof Set
      ? opts.ownedKeys
      : new Set(Array.isArray(opts.ownedKeys) ? opts.ownedKeys : []);
    const paintKey = typeof opts.paintKey === "function" ? opts.paintKey : paint => String(paint && paint.id || "");
    const owned = pool.filter(paint => ownedKeys.has(paintKey(paint)));
    const preferred = preferredBrands(owned, opts.defaultBrands);
    const matches = typeof opts.findClosestPaints === "function" ? opts.findClosestPaints(hex, pool, 12) : [];
    return rankByPreferredBrand(matches, preferred, opts.brandPenalty).slice(0, 1);
  }

  function closestMatches(hex, all, options) {
    const opts = options || {};
    const limit = opts.limit === undefined ? 3 : opts.limit;
    const list = Array.isArray(all) ? all : [];
    const findClosestPaints = typeof opts.findClosestPaints === "function" ? opts.findClosestPaints : () => [];

    if (!opts.onlyOwned) {
      const matches = list.length ? findClosestPaints(hex, list, limit) : [];
      return { matches: Array.isArray(matches) ? matches : [], ownedMissing: false };
    }

    const ownedKeys = opts.ownedKeys instanceof Set
      ? opts.ownedKeys
      : new Set(Array.isArray(opts.ownedKeys) ? opts.ownedKeys : []);
    const paintKey = typeof opts.paintKey === "function" ? opts.paintKey : paint => String(paint && paint.id || "");
    const owned = list.filter(paint => ownedKeys.has(paintKey(paint)));
    const maxDistance = opts.maxDistance === undefined ? 0 : opts.maxDistance;
    const ownedMatches = owned.length ? findClosestPaints(hex, owned, limit) : [];
    const close = (Array.isArray(ownedMatches) ? ownedMatches : [])
      .filter(match => match && Number.isFinite(match.distance) && match.distance <= maxDistance);

    if (close.length) {
      return { matches: close, ownedMissing: false };
    }

    const matches = list.length ? findClosestPaints(hex, list, 1) : [];
    return { matches: Array.isArray(matches) ? matches : [], ownedMissing: true };
  }

  function guidePaintKind(paint) {
    const text = `${paint.range || ""} ${paint.finish || ""}`.toLowerCase();
    if (/metallic/.test(text)) return "metal";
    if (/wash|shade|ink|tone/.test(text)) return "wash";
    if (/contrast|speedpaint|xpress|glaze/.test(text)) return "transparent";
    return "opaque";
  }

  function guideKindsForStep(stepKey, metal) {
    if (stepKey === "shadeWash") return ["wash"];
    if (stepKey === "transparentCoat" || stepKey === "glazeLayer") return ["transparent", "wash"];
    return metal ? ["metal"] : ["opaque"];
  }

  function poolOfKinds(list, kinds) {
    const source = Array.isArray(list) ? list : [];
    const pool = source.filter(paint => kinds.includes(guidePaintKind(paint)));
    return pool.length ? pool : source;
  }

  function closestPreferred(hex, pool, limit, preferred, penalty, findClosestPaints) {
    const list = Array.isArray(pool) ? pool : [];
    return rankByPreferredBrand(list.length ? findClosestPaints(hex, list, 12) : [], preferred, penalty).slice(0, limit);
  }

  function guideStepPaints(hex, stepKey, metal, ctx) {
    const kinds = guideKindsForStep(stepKey, metal);
    const best = closestPreferred(hex, poolOfKinds(ctx.allPaints, kinds), 2, ctx.preferred, ctx.brandPenalty, ctx.findClosestPaints);
    const owned = (ctx.ownedBrushPaints || []).length && !ctx.ownedOnly
      ? closestPreferred(hex, poolOfKinds(ctx.ownedBrushPaints, kinds), 1, ctx.preferred, ctx.brandPenalty, ctx.findClosestPaints)
        .filter(match => match.distance <= ctx.maxDistance && kinds.includes(guidePaintKind(match)))
      : [];
    const seen = new Set();
    return owned.concat(best).filter(match => {
      const key = `${match.manufacturer || ""}|${match.name}`;
      return seen.has(key) ? false : seen.add(key);
    }).slice(0, 3);
  }

  function pickPrimer(main, catalogue, opts) {
    const all = (Array.isArray(catalogue) ? catalogue : []).filter(paint => /primer/i.test(`${paint.range || ""} ${paint.finish || ""}`));
    const preferredPrimers = all.filter(paint => opts.preferred.has(paint.manufacturer));
    const primers = preferredPrimers.length ? preferredPrimers : all;
    const owned = primers.filter(paint => opts.ownedKeys.has(opts.paintKey(paint)));
    const pick = (list, hex, max) => {
      const match = list.length ? opts.findClosestPaints(hex, list, 1)[0] : null;
      return match && match.distance <= max ? match : null;
    };
    const lightness = Number(main.l) || 50;
    const fallbackHex = opts.transparentMode || lightness > 62 ? "#DBD1B2" : lightness < 32 ? "#000000" : "#A2A5A7";
    const coloured = !opts.transparentMode && (pick(owned, main.hex, 12) || (!opts.ownedOnly && pick(primers, main.hex, 9)));
    const match = coloured || pick(owned, fallbackHex, 15) || (!opts.ownedOnly && pick(primers, fallbackHex, 15));
    const tone = coloured ? "color" : opts.transparentMode || lightness > 62 ? "light" : lightness < 32 ? "dark" : "grey";
    return { tone, match: match || null };
  }

  return {
    preferredBrands,
    rankByPreferredBrand,
    equivalentPaint,
    closestMatches,
    guidePaintKind,
    guideKindsForStep,
    poolOfKinds,
    closestPreferred,
    guideStepPaints,
    pickPrimer
  };
}));
