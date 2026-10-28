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

  return {
    preferredBrands,
    rankByPreferredBrand,
    equivalentPaint,
    closestMatches
  };
}));
