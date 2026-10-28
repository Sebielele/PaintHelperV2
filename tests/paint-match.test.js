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
