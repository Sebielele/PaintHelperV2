// Paint collection rules for PaintHelperV2: stable paint keys, moving owned and shopping
// keys after catalogue corrections, and the plan for a PaintRack CSV import. No DOM; the
// catalogue matcher and the custom-paint factory come in as parameters.
(function (root, factory) {
  const api = factory();
  root.WPH = Object.assign(root.WPH || {}, api);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Same key as the app uses for owned and shopping lists.
  function collectionPaintKey(paint) {
    return [
      paint.manufacturer,
      paint.collection,
      paint.range,
      paint.name,
      paint.hex
    ].map(value => String(value || "").trim().toLowerCase()).join("|");
  }

  // Keys of corrected catalogue paints (`previous`) and of PaintRack paints the catalogue
  // now knows move to the new key; owned paints leave the shopping list.
  function reconcilePaintKeys(options) {
    const opts = options || {};
    const paints = (Array.isArray(opts.basePaints) ? opts.basePaints : []).filter(paint => paint.hex);
    const customPaints = Array.isArray(opts.customPaints) ? opts.customPaints : [];
    const owned = new Set(opts.ownedKeys || []);
    const shopping = new Set(opts.shoppingKeys || []);
    const moves = new Map();
    paints.forEach(paint => {
      (paint.previous || []).forEach(previous => {
        const oldKey = collectionPaintKey({ ...paint, name: previous.name || paint.name, hex: previous.hex || paint.hex });
        moves.set(oldKey, collectionPaintKey(paint));
      });
    });
    const remaining = [];
    customPaints.forEach(custom => {
      const match = opts.findMatch({
        brand: custom.manufacturer,
        sku: custom.manufacturerCode,
        name: custom.name,
        paintClass: custom.collection
      }, paints);
      if (match) {
        moves.set(collectionPaintKey(custom), collectionPaintKey(match));
      } else {
        remaining.push(custom);
      }
    });
    let changed = remaining.length !== customPaints.length;
    [owned, shopping].forEach(keys => {
      moves.forEach((newKey, oldKey) => {
        if (oldKey !== newKey && keys.has(oldKey)) {
          keys.delete(oldKey);
          keys.add(newKey);
          changed = true;
        }
      });
    });
    shopping.forEach(key => {
      if (owned.has(key)) {
        shopping.delete(key);
      }
    });
    return { ownedKeys: Array.from(owned), shoppingKeys: Array.from(shopping), customPaints: remaining, changed };
  }

  // What a PaintRack import changes: catalogue matches and custom paints become owned and
  // leave the shopping list; a custom paint the catalogue now knows is replaced.
  function planPaintRackImport(options) {
    const opts = options || {};
    const rows = opts.parsed && Array.isArray(opts.parsed.paints) ? opts.parsed.paints : [];
    const owned = new Set(opts.ownedKeys || []);
    const previouslyOwned = new Set(owned);
    const shopping = new Set(opts.shoppingKeys || []);
    const customByKey = new Map((opts.customPaints || []).map(paint => [collectionPaintKey(paint), paint]));
    const candidates = (opts.catalogue || []).filter(paint => paint.hex && !paint.paintRackImport);
    const producers = new Set();
    const matched = [];
    const custom = [];
    rows.forEach(row => {
      const match = opts.findMatch(row, candidates);
      if (match) {
        const staleKey = collectionPaintKey(opts.createCustom(row));
        if (customByKey.has(staleKey)) {
          customByKey.delete(staleKey);
          owned.delete(staleKey);
        }
        const key = collectionPaintKey(match);
        owned.add(key);
        shopping.delete(key);
        producers.add(match.manufacturer || "__unknown__");
        matched.push({ row, paint: match, alreadyOwned: previouslyOwned.has(key) });
        return;
      }
      const paint = opts.createCustom(row);
      const key = collectionPaintKey(paint);
      customByKey.set(key, paint);
      owned.add(key);
      shopping.delete(key);
      producers.add(paint.manufacturer || "__unknown__");
      custom.push({ row, paint });
    });
    return {
      ownedKeys: Array.from(owned),
      shoppingKeys: Array.from(shopping),
      customPaints: Array.from(customByKey.values()),
      producers: Array.from(producers),
      matched,
      custom
    };
  }

  // Paints that can be added to the shopping list, filtered by search and sorted by label.
  function shoppingCandidates(options) {
    const opts = options || {};
    const paints = Array.isArray(opts.paints) ? opts.paints : [];
    const ownedKeys = opts.ownedKeys || new Set();
    const shoppingKeys = opts.shoppingKeys || new Set();
    const keyOf = opts.keyOf;
    const labelOf = opts.labelOf;
    const query = String(opts.query || "").trim().toLowerCase();
    return paints
      .filter(paint => paint.hex)
      .filter(paint => !ownedKeys.has(keyOf(paint)))
      .filter(paint => !shoppingKeys.has(keyOf(paint)))
      .filter(paint => !query || String(labelOf(paint)).toLowerCase().includes(query))
      .sort((a, b) => String(labelOf(a)).localeCompare(String(labelOf(b))));
  }

  // Shopping list entries for saved keys, skipping unknown and now-owned paints.
  function shoppingEntries(options) {
    const opts = options || {};
    const shoppingKeys = Array.from(opts.shoppingKeys || []);
    const ownedKeys = opts.ownedKeys || new Set();
    const paintByKey = opts.paintByKey || (() => null);
    const labelOf = opts.labelOf;
    return shoppingKeys
      .map(key => ({ key, paint: paintByKey(key) }))
      .filter(item => item.paint && !ownedKeys.has(item.key))
      .sort((a, b) => String(labelOf(a.paint)).localeCompare(String(labelOf(b.paint))));
  }

  return {
    collectionPaintKey,
    reconcilePaintKeys,
    planPaintRackImport,
    shoppingCandidates,
    shoppingEntries
  };
}));
