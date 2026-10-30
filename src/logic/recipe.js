// Rules for the painting guide context (recipeContext in src/app.js): which catalogue paints
// a guide may use, how a matched paint is described, the role areas and the colour ladders.
// No DOM and no texts; labels, ladders and paint lookups come in as functions.
(function (root, factory) {
  const api = factory();
  root.WPH = Object.assign(root.WPH || {}, api);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  // Paints a guide may use: catalogue paints with a colour, only owned ones when asked for
  // and possible, brush paints only, and discontinued paints only when the painter owns them.
  function guidePaintPool(options) {
    const opts = options || {};
    const ownedKeys = opts.ownedKeys || new Set();
    const keyOf = opts.paintKey;
    const brushable = typeof opts.isBrushPaint === "function" ? opts.isBrushPaint : () => true;
    const catalogue = (opts.catalogue || []).filter(paint => paint.hex);
    const ownedPaints = catalogue.filter(paint => ownedKeys.has(keyOf(paint)));
    const ownedOnly = Boolean(opts.ownedOnly && ownedPaints.length);
    const available = paint => !paint.discontinued || ownedKeys.has(keyOf(paint));
    return {
      catalogue,
      ownedPaints,
      ownedOnly,
      allPaints: (ownedOnly ? ownedPaints : catalogue).filter(paint => brushable(paint) && available(paint)),
      ownedBrushPaints: ownedPaints.filter(brushable)
    };
  }

  // A matched paint as the guide request carries it.
  function describeGuidePaint(match, owned) {
    return {
      name: match.name,
      manufacturer: match.manufacturer || "",
      range: match.range || match.finish || "",
      owned: Boolean(owned),
      distance: Math.round(match.distance)
    };
  }

  // Up to 12 role areas with the colour they are painted in; extra roles use the colour name.
  function recipeAreas(items, resolveColor, areaLabel) {
    return (Array.isArray(items) ? items : []).slice(0, 12).map(item => {
      const color = resolveColor(item.colorRef);
      return { area: item.extra ? color.name : areaLabel(item.areaKey), color: color.name, hex: color.hex };
    });
  }

  // Up to 6 palette colours, each with its ladder steps and the paints for every step.
  function recipeColors(palette, options) {
    const opts = options || {};
    return (Array.isArray(palette) ? palette : []).slice(0, 6).map(color => {
      const name = opts.colorName(color);
      const metal = opts.metalPattern.test(name);
      return {
        name,
        hex: color.hex,
        metal,
        steps: opts.ladderForColor(color).map(step => ({
          key: step.key,
          step: opts.stepLabel(step.key),
          hint: opts.stepHint(step.key),
          hex: step.hex,
          paints: opts.paintsFor(step.hex, step.key, metal)
        }))
      };
    });
  }

  return {
    guidePaintPool,
    describeGuidePaint,
    recipeAreas,
    recipeColors
  };
}));
