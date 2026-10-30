const test = require("node:test");
const assert = require("node:assert/strict");
const collection = require("../src/logic/collection.js");
const citadel = require("../src/citadel.js");

const key = collection.collectionPaintKey;
const agrax = { manufacturer: "Citadel", collection: "Shade", range: "", name: "Agrax Earthshade Gloss", hex: "#5A4632", previous: [{ hex: "#EEEEEE" }] };
const retributor = { manufacturer: "Citadel", collection: "Base", range: "", name: "Retributor Armour", hex: "#C39E4A", manufacturerCode: "21-05" };
const oldAgraxKey = key({ ...agrax, hex: "#EEEEEE" });

test("paint keys join brand, line, range, name and colour in lower case", () => {
  assert.equal(key(retributor), "citadel|base||retributor armour|#c39e4a");
  assert.equal(key({ name: " Nuln Oil " }), "|||nuln oil|");
});

test("corrected catalogue paints and known PaintRack paints move to their new keys", () => {
  const custom = citadel.createPaintRackCustomPaint({ brand: "Citadel", sku: "21-05", name: "Retributor Armour", paintClass: "Base" });
  const result = collection.reconcilePaintKeys({
    basePaints: [agrax, retributor, { name: "No colour", hex: null }],
    customPaints: [custom],
    ownedKeys: [oldAgraxKey, key(custom), "other"],
    shoppingKeys: [oldAgraxKey, "wish"],
    findMatch: citadel.findPaintRackCatalogueMatch
  });
  assert.deepEqual(result.ownedKeys, ["other", key(agrax), key(retributor)]);
  assert.deepEqual(result.shoppingKeys, ["wish"]);
  assert.deepEqual(result.customPaints, []);
  assert.equal(result.changed, true);
});

test("nothing to move leaves the keys unchanged", () => {
  const result = collection.reconcilePaintKeys({
    basePaints: [retributor], customPaints: [], ownedKeys: ["a"], shoppingKeys: ["b", "a"], findMatch: () => null
  });
  assert.deepEqual(result, { ownedKeys: ["a"], shoppingKeys: ["b"], customPaints: [], changed: false });
});

test("a PaintRack import owns catalogue matches and keeps unknown paints as custom paints", () => {
  const unknownRow = { brand: "Kimera", sku: "", name: "Phthalo Blue", paintClass: "" };
  const plan = collection.planPaintRackImport({
    parsed: { paints: [{ brand: "Citadel", sku: "21-05", name: "Retributor Armour", paintClass: "Base" }, unknownRow] },
    catalogue: [retributor, agrax],
    customPaints: [],
    ownedKeys: [],
    shoppingKeys: [key(retributor), "wish"],
    findMatch: citadel.findPaintRackCatalogueMatch,
    createCustom: citadel.createPaintRackCustomPaint
  });
  const unknown = citadel.createPaintRackCustomPaint(unknownRow);
  assert.deepEqual(plan.ownedKeys, [key(retributor), key(unknown)]);
  assert.deepEqual(plan.shoppingKeys, ["wish"]);
  assert.deepEqual(plan.customPaints, [unknown]);
  assert.deepEqual(plan.producers, ["Citadel", "Kimera"]);
  assert.equal(plan.matched.length, 1);
  assert.equal(plan.matched[0].paint, retributor);
  assert.equal(plan.matched[0].alreadyOwned, false);
  assert.deepEqual(plan.custom.map(entry => entry.paint), [unknown]);
});

test("an earlier custom paint is replaced once the catalogue knows it", () => {
  const row = { brand: "Citadel", sku: "21-05", name: "Retributor Armour", paintClass: "Base" };
  const stale = citadel.createPaintRackCustomPaint(row);
  const plan = collection.planPaintRackImport({
    parsed: { paints: [row] },
    catalogue: [retributor, { ...stale }],
    customPaints: [stale],
    ownedKeys: [key(stale), key(retributor)],
    shoppingKeys: [],
    findMatch: citadel.findPaintRackCatalogueMatch,
    createCustom: citadel.createPaintRackCustomPaint
  });
  assert.deepEqual(plan.customPaints, []);
  assert.deepEqual(plan.ownedKeys, [key(retributor)]);
  assert.equal(plan.matched[0].alreadyOwned, true);
});
