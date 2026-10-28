const { test } = require("node:test");
const assert = require("node:assert/strict");
const paintMatch = require("../src/logic/paint-match.js");

function createFindClosestPaints(distancesByHex) {
  return (hex, paints, limit) => {
    const distances = distancesByHex[hex] || {};
    return (Array.isArray(paints) ? paints : [])
      .map(paint => {
        const distance = distances[paint.id];
        return { ...paint, distance: distance === undefined ? Number.POSITIVE_INFINITY : distance };
      })
      .filter(item => Number.isFinite(item.distance))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  };
}

test("closestMatches without onlyOwned returns limit matches", () => {
  const all = [
    { id: "a", manufacturer: "Citadel" },
    { id: "b", manufacturer: "Vallejo" },
    { id: "c", manufacturer: "Army Painter" }
  ];
  const findClosestPaints = createFindClosestPaints({ "#000000": { a: 1, b: 2, c: 3 } });
  const result = paintMatch.closestMatches("#000000", all, {
    onlyOwned: false,
    ownedKeys: new Set(),
    paintKey: paint => paint.id,
    limit: 2,
    maxDistance: 10,
    findClosestPaints
  });
  assert.equal(result.matches.length, 2);
  assert.equal(result.matches[0].id, "a");
  assert.equal(result.ownedMissing, false);
});

test("closestMatches onlyOwned with close owned paint returns owned paint", () => {
  const all = [
    { id: "owned", manufacturer: "Citadel" },
    { id: "other", manufacturer: "Vallejo" }
  ];
  const findClosestPaints = createFindClosestPaints({ "#000000": { owned: 5, other: 1 } });
  const result = paintMatch.closestMatches("#000000", all, {
    onlyOwned: true,
    ownedKeys: new Set(["owned"]),
    paintKey: paint => paint.id,
    limit: 3,
    maxDistance: 10,
    findClosestPaints
  });
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].id, "owned");
  assert.equal(result.ownedMissing, false);
});

test("closestMatches onlyOwned with far owned paint returns one catalogue paint", () => {
  const all = [
    { id: "owned", manufacturer: "Citadel" },
    { id: "other", manufacturer: "Vallejo" }
  ];
  const findClosestPaints = createFindClosestPaints({ "#000000": { owned: 12, other: 3 } });
  const result = paintMatch.closestMatches("#000000", all, {
    onlyOwned: true,
    ownedKeys: new Set(["owned"]),
    paintKey: paint => paint.id,
    limit: 3,
    maxDistance: 10,
    findClosestPaints
  });
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].id, "other");
  assert.equal(result.ownedMissing, true);
});

test("closestMatches onlyOwned without owned paints returns one catalogue paint", () => {
  const all = [
    { id: "a", manufacturer: "Citadel" },
    { id: "b", manufacturer: "Vallejo" }
  ];
  const findClosestPaints = createFindClosestPaints({ "#000000": { a: 4, b: 2 } });
  const result = paintMatch.closestMatches("#000000", all, {
    onlyOwned: true,
    ownedKeys: new Set(),
    paintKey: paint => paint.id,
    limit: 3,
    maxDistance: 10,
    findClosestPaints
  });
  assert.equal(result.matches.length, 1);
  assert.equal(result.matches[0].id, "b");
  assert.equal(result.ownedMissing, true);
});

test("closestMatches with empty catalogue returns empty matches", () => {
  const result = paintMatch.closestMatches("#000000", [], {
    onlyOwned: false,
    ownedKeys: new Set(),
    paintKey: paint => paint.id,
    limit: 3,
    maxDistance: 10,
    findClosestPaints: () => []
  });
  assert.deepEqual(result.matches, []);
  assert.equal(result.ownedMissing, false);
});

test("equivalentPaint prefers owned brand with distance 5 over foreign brand with distance 3", () => {
  const pool = [
    { id: "owned", manufacturer: "Citadel" },
    { id: "foreign", manufacturer: "Vallejo" }
  ];
  const findClosestPaints = createFindClosestPaints({ "#000000": { owned: 5, foreign: 3 } });
  const result = paintMatch.equivalentPaint("#000000", pool, {
    ownedKeys: new Set(["owned"]),
    paintKey: paint => paint.id,
    defaultBrands: ["Citadel"],
    brandPenalty: 6,
    findClosestPaints
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "owned");
});

test("equivalentPaint prefers foreign brand with distance 1 over owned brand with distance 10", () => {
  const pool = [
    { id: "owned", manufacturer: "Citadel" },
    { id: "foreign", manufacturer: "Vallejo" }
  ];
  const findClosestPaints = createFindClosestPaints({ "#000000": { owned: 10, foreign: 1 } });
  const result = paintMatch.equivalentPaint("#000000", pool, {
    ownedKeys: new Set(["owned"]),
    paintKey: paint => paint.id,
    defaultBrands: ["Citadel"],
    brandPenalty: 6,
    findClosestPaints
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "foreign");
});

test("equivalentPaint without owned paints prefers default brands", () => {
  const pool = [
    { id: "default", manufacturer: "Citadel" },
    { id: "other", manufacturer: "Vallejo" }
  ];
  const findClosestPaints = createFindClosestPaints({ "#000000": { default: 5, other: 3 } });
  const result = paintMatch.equivalentPaint("#000000", pool, {
    ownedKeys: new Set(),
    paintKey: paint => paint.id,
    defaultBrands: ["Citadel"],
    brandPenalty: 6,
    findClosestPaints
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "default");
});

test("equivalentPaint with empty pool returns empty array", () => {
  const result = paintMatch.equivalentPaint("#000000", [], {
    ownedKeys: new Set(),
    paintKey: paint => paint.id,
    defaultBrands: ["Citadel"],
    brandPenalty: 6,
    findClosestPaints: () => []
  });
  assert.deepEqual(result, []);
});

test("guidePaintKind classifies range and finish", () => {
  assert.equal(paintMatch.guidePaintKind({ range: "Metallic" }), "metal");
  assert.equal(paintMatch.guidePaintKind({ range: "Shade" }), "wash");
  assert.equal(paintMatch.guidePaintKind({ range: "Ink" }), "wash");
  assert.equal(paintMatch.guidePaintKind({ range: "Contrast" }), "transparent");
  assert.equal(paintMatch.guidePaintKind({ range: "Base" }), "opaque");
});

test("guideKindsForStep returns step kinds", () => {
  assert.deepEqual(paintMatch.guideKindsForStep("shadeWash", false), ["wash"]);
  assert.deepEqual(paintMatch.guideKindsForStep("glazeLayer", false), ["transparent", "wash"]);
  assert.deepEqual(paintMatch.guideKindsForStep("basecoat", true), ["metal"]);
  assert.deepEqual(paintMatch.guideKindsForStep("basecoat", false), ["opaque"]);
});

test("poolOfKinds filters kinds and falls back to the full list", () => {
  const paints = [
    { id: "opaque", range: "Base" },
    { id: "wash", range: "Shade" }
  ];
  assert.deepEqual(paintMatch.poolOfKinds(paints, ["wash"]).map(paint => paint.id), ["wash"]);
  assert.deepEqual(paintMatch.poolOfKinds(paints, ["metal"]).map(paint => paint.id), ["opaque", "wash"]);
});

test("guideStepPaints puts a close owned paint first", () => {
  const all = [
    { id: "owned", name: "Owned Base", manufacturer: "Citadel", range: "Base" },
    { id: "best", name: "Best Base", manufacturer: "Vallejo", range: "Base" }
  ];
  const ctx = {
    allPaints: all,
    ownedBrushPaints: [all[0]],
    ownedOnly: false,
    preferred: new Set(["Citadel"]),
    brandPenalty: 6,
    maxDistance: 10,
    findClosestPaints: createFindClosestPaints({ "#000000": { owned: 5, best: 1 } })
  };
  const result = paintMatch.guideStepPaints("#000000", "basecoat", false, ctx);
  assert.equal(result[0].id, "owned");
});

test("guideStepPaints ignores a far owned paint", () => {
  const all = [
    { id: "owned", name: "Owned Base", manufacturer: "Citadel", range: "Base" },
    { id: "best", name: "Best Base", manufacturer: "Vallejo", range: "Base" },
    { id: "second", name: "Second Base", manufacturer: "Army Painter", range: "Base" }
  ];
  const ctx = {
    allPaints: all,
    ownedBrushPaints: [all[0]],
    ownedOnly: false,
    preferred: new Set(["Citadel"]),
    brandPenalty: 6,
    maxDistance: 10,
    findClosestPaints: createFindClosestPaints({ "#000000": { owned: 12, best: 1, second: 2 } })
  };
  const result = paintMatch.guideStepPaints("#000000", "basecoat", false, ctx);
  assert.equal(result[0].id, "best");
  assert.equal(result.some(paint => paint.id === "owned"), false);
});

test("guideStepPaints with ownedOnly does not add an owned paint separately", () => {
  const all = [
    { id: "owned", name: "Owned Base", manufacturer: "Citadel", range: "Base" },
    { id: "best", name: "Best Base", manufacturer: "Vallejo", range: "Base" }
  ];
  const ctx = {
    allPaints: all,
    ownedBrushPaints: [all[0]],
    ownedOnly: true,
    preferred: new Set(),
    brandPenalty: 6,
    maxDistance: 10,
    findClosestPaints: createFindClosestPaints({ "#000000": { owned: 5, best: 1 } })
  };
  const result = paintMatch.guideStepPaints("#000000", "basecoat", false, ctx);
  assert.equal(result[0].id, "best");
  assert.equal(result.filter(paint => paint.id === "owned").length, 1);
});

test("guideStepPaints removes duplicate matches", () => {
  const all = [
    { id: "owned", name: "Owned Base", manufacturer: "Citadel", range: "Base" },
    { id: "best", name: "Best Base", manufacturer: "Vallejo", range: "Base" }
  ];
  const ctx = {
    allPaints: all,
    ownedBrushPaints: [all[0]],
    ownedOnly: false,
    preferred: new Set(["Citadel"]),
    brandPenalty: 6,
    maxDistance: 10,
    findClosestPaints: createFindClosestPaints({ "#000000": { owned: 1, best: 2 } })
  };
  const result = paintMatch.guideStepPaints("#000000", "basecoat", false, ctx);
  assert.equal(result.length, 2);
  assert.equal(result.filter(paint => paint.id === "owned").length, 1);
});

test("guideStepPaints returns at most three matches", () => {
  const all = [
    { id: "owned", name: "Owned Base", manufacturer: "Citadel", range: "Base" },
    { id: "a", name: "A Base", manufacturer: "Vallejo", range: "Base" },
    { id: "b", name: "B Base", manufacturer: "Army Painter", range: "Base" },
    { id: "c", name: "C Base", manufacturer: "Scale 75", range: "Base" }
  ];
  const ctx = {
    allPaints: all,
    ownedBrushPaints: [all[0]],
    ownedOnly: false,
    preferred: new Set(),
    brandPenalty: 6,
    maxDistance: 10,
    findClosestPaints: createFindClosestPaints({ "#000000": { owned: 5, a: 1, b: 2, c: 3 } })
  };
  const result = paintMatch.guideStepPaints("#000000", "basecoat", false, ctx);
  assert.equal(result.length, 3);
});

test("guideStepPaints chooses a wash for shadeWash", () => {
  const all = [
    { id: "opaque", name: "Opaque Base", manufacturer: "Citadel", range: "Base" },
    { id: "wash", name: "Shade Wash", manufacturer: "Citadel", range: "Shade" }
  ];
  const ctx = {
    allPaints: all,
    ownedBrushPaints: [all[0]],
    ownedOnly: false,
    preferred: new Set(["Citadel"]),
    brandPenalty: 6,
    maxDistance: 10,
    findClosestPaints: createFindClosestPaints({ "#000000": { opaque: 1, wash: 2 } })
  };
  const result = paintMatch.guideStepPaints("#000000", "shadeWash", false, ctx);
  assert.deepEqual(result.map(paint => paint.id), ["wash"]);
});

test("pickPrimer returns a close owned coloured primer", () => {
  const main = { hex: "#123456", l: 50 };
  const primer = { id: "p1", name: "Blue Primer", manufacturer: "Citadel", range: "Primer" };
  const result = paintMatch.pickPrimer(main, [primer], {
    ownedOnly: false,
    transparentMode: false,
    preferred: new Set(["Citadel"]),
    ownedKeys: new Set(["p1"]),
    paintKey: paint => paint.id,
    findClosestPaints: createFindClosestPaints({ "#123456": { p1: 10 } })
  });
  assert.equal(result.tone, "color");
  assert.equal(result.match.id, "p1");
});

test("pickPrimer never returns a coloured tone in transparent mode", () => {
  const main = { hex: "#123456", l: 50 };
  const primer = { id: "p1", name: "Grey Primer", manufacturer: "Citadel", range: "Primer" };
  const result = paintMatch.pickPrimer(main, [primer], {
    ownedOnly: false,
    transparentMode: true,
    preferred: new Set(["Citadel"]),
    ownedKeys: new Set(["p1"]),
    paintKey: paint => paint.id,
    findClosestPaints: createFindClosestPaints({ "#123456": { p1: 1 }, "#DBD1B2": { p1: 1 } })
  });
  assert.equal(result.tone, "light");
  assert.equal(result.match.id, "p1");
});

test("pickPrimer falls back to dark tone without a match", () => {
  const main = { hex: "#123456", l: 20 };
  const result = paintMatch.pickPrimer(main, [], {
    ownedOnly: false,
    transparentMode: false,
    preferred: new Set(),
    ownedKeys: new Set(),
    paintKey: paint => paint.id,
    findClosestPaints: () => []
  });
  assert.equal(result.tone, "dark");
  assert.equal(result.match, null);
});

test("pickPrimer with ownedOnly does not choose a foreign primer", () => {
  const main = { hex: "#123456", l: 50 };
  const ownedPrimer = { id: "owned", name: "Owned Primer", manufacturer: "Citadel", range: "Primer" };
  const foreignPrimer = { id: "foreign", name: "Foreign Primer", manufacturer: "Vallejo", range: "Primer" };
  const result = paintMatch.pickPrimer(main, [ownedPrimer, foreignPrimer], {
    ownedOnly: true,
    transparentMode: false,
    preferred: new Set(["Citadel"]),
    ownedKeys: new Set(["owned"]),
    paintKey: paint => paint.id,
    findClosestPaints: createFindClosestPaints({
      "#123456": { owned: 20, foreign: 1 },
      "#A2A5A7": { owned: 20, foreign: 1 }
    })
  });
  assert.equal(result.match, null);
  assert.equal(result.tone, "grey");
});

test("pickPrimer prefers primers from preferred brands when available", () => {
  const main = { hex: "#123456", l: 50 };
  const preferredPrimer = { id: "preferred", name: "Preferred Primer", manufacturer: "Citadel", range: "Primer" };
  const foreignPrimer = { id: "foreign", name: "Foreign Primer", manufacturer: "Vallejo", range: "Primer" };
  const result = paintMatch.pickPrimer(main, [preferredPrimer, foreignPrimer], {
    ownedOnly: false,
    transparentMode: false,
    preferred: new Set(["Citadel"]),
    ownedKeys: new Set(),
    paintKey: paint => paint.id,
    findClosestPaints: createFindClosestPaints({ "#123456": { preferred: 8, foreign: 1 } })
  });
  assert.equal(result.match.id, "preferred");
  assert.equal(result.tone, "color");
});
