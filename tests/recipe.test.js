const test = require("node:test");
const assert = require("node:assert/strict");
const recipe = require("../src/logic/recipe.js");

const keyOf = paint => paint.name;
const paints = {
  red: { name: "Red", hex: "#AA0000" },
  oldRed: { name: "Old Red", hex: "#AA1111", discontinued: true },
  spray: { name: "Red Spray", hex: "#AA0000", spray: true },
  noColour: { name: "Mystery", hex: null }
};
const catalogue = Object.values(paints);
const brush = paint => !paint.spray;

test("guide pool: brush paints with a colour, discontinued ones only when owned", () => {
  const pool = recipe.guidePaintPool({ catalogue, ownedKeys: new Set(), paintKey: keyOf, isBrushPaint: brush });
  assert.deepEqual(pool.catalogue.map(keyOf), ["Red", "Old Red", "Red Spray"]);
  assert.deepEqual(pool.allPaints.map(keyOf), ["Red"]);
  assert.deepEqual(pool.ownedPaints, []);
  assert.equal(pool.ownedOnly, false);

  const owned = recipe.guidePaintPool({ catalogue, ownedKeys: new Set(["Old Red", "Red Spray"]), paintKey: keyOf, isBrushPaint: brush });
  assert.deepEqual(owned.allPaints.map(keyOf), ["Red", "Old Red"]);
  assert.deepEqual(owned.ownedBrushPaints.map(keyOf), ["Old Red"]);
});

test("guide pool: owned only when asked for and something is owned", () => {
  const none = recipe.guidePaintPool({ catalogue, ownedKeys: new Set(), paintKey: keyOf, ownedOnly: true });
  assert.equal(none.ownedOnly, false, "nothing owned: fall back to the catalogue");
  assert.deepEqual(none.allPaints.map(keyOf), ["Red", "Red Spray"]);
  const some = recipe.guidePaintPool({ catalogue, ownedKeys: new Set(["Red"]), paintKey: keyOf, ownedOnly: true });
  assert.equal(some.ownedOnly, true);
  assert.deepEqual(some.allPaints.map(keyOf), ["Red"]);
});

test("guide paints are described with brand, range, owned flag and a rounded distance", () => {
  assert.deepEqual(recipe.describeGuidePaint({ name: "Nuln Oil", manufacturer: "Citadel", range: "Shade", distance: 3.6 }, 1), { name: "Nuln Oil", manufacturer: "Citadel", range: "Shade", owned: true, distance: 4 });
  assert.deepEqual(recipe.describeGuidePaint({ name: "X", finish: "metallic", distance: 0.2 }, false), { name: "X", manufacturer: "", range: "metallic", owned: false, distance: 0 });
});

test("recipe areas: at most 12, extra roles named after their colour", () => {
  const colors = { D: { name: "Rüstung", hex: "#6B7A3A" }, X: { name: "Eiter", hex: "#C9B640" } };
  const items = [{ areaKey: "plateArmor", colorRef: "D" }, { extra: true, colorRef: "X" }]
    .concat(Array.from({ length: 12 }, () => ({ areaKey: "weapon", colorRef: "D" })));
  const areas = recipe.recipeAreas(items, ref => colors[ref], key => `label:${key}`);
  assert.equal(areas.length, 12);
  assert.deepEqual(areas[0], { area: "label:plateArmor", color: "Rüstung", hex: "#6B7A3A" });
  assert.deepEqual(areas[1], { area: "Eiter", color: "Eiter", hex: "#C9B640" });
  assert.deepEqual(recipe.recipeAreas(null, () => ({}), String), []);
});

test("recipe colours: up to 6, metals recognised by name, a paint list per ladder step", () => {
  const palette = Array.from({ length: 7 }, (_, index) => ({ hex: `#00000${index}`, label: index === 1 ? "Gold" : `Colour ${index}` }));
  const calls = [];
  const colors = recipe.recipeColors(palette, {
    colorName: color => color.label,
    metalPattern: /gold|metal/i,
    ladderForColor: color => [{ key: "basecoat", hex: color.hex }, { key: "layer", hex: "#FFFFFF" }],
    stepLabel: key => `step:${key}`,
    stepHint: key => `hint:${key}`,
    paintsFor: (hex, key, metal) => { calls.push([hex, key, metal]); return [{ name: `${key}-${hex}` }]; }
  });
  assert.equal(colors.length, 6);
  assert.equal(colors[1].metal, true);
  assert.equal(colors[0].metal, false);
  assert.deepEqual(colors[0].steps[0], { key: "basecoat", step: "step:basecoat", hint: "hint:basecoat", hex: "#000000", paints: [{ name: "basecoat-#000000" }] });
  assert.deepEqual(calls[2], ["#000001", "basecoat", true]);
});
