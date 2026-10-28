const test = require("node:test");
const assert = require("node:assert/strict");
const kit = require("../src/kit.js");
const citadel = require("../src/citadel.js");

const paints = {
  mephiston: { manufacturer: "Citadel", name: "Mephiston Red", hex: "#9A1115" },
  evil: { manufacturer: "Citadel", name: "Evil Sunz Scarlet", hex: "#C01411" },
  gameRed: { manufacturer: "Vallejo", name: "Bloody Red", hex: "#B41E1E" },
  white: { manufacturer: "Citadel", name: "White Scar", hex: "#FFFFFF" },
  vallejoWhite: { manufacturer: "Vallejo", name: "Dead White", hex: "#FDFDFD" },
  nuln: { manufacturer: "Citadel", name: "Nuln Oil", hex: "#14100E" },
  blue: { manufacturer: "Citadel", name: "Macragge Blue", hex: "#0D407F" }
};
const keyOf = paint => `${paint.manufacturer}|${paint.name}`;
const byName = new Map(Object.values(paints).map(paint => [paint.name.toLowerCase(), paint]));
const resolve = name => byName.get(name.toLowerCase()) || null;

test("reads unique paint names from a guide in order", () => {
  const text = "## Armour\n1. Basecoat **Mephiston Red**.\n2. Wash with **Nuln Oil**, then **mephiston red** again.\n3. Edge **White Scar**.";
  assert.deepEqual(kit.guidePaintNames(text), ["Mephiston Red", "Nuln Oil", "White Scar"]);
  assert.deepEqual(kit.guidePaintNames(""), []);
  assert.deepEqual(kit.guidePaintNames(null), []);
});

test("collects palette guides and army unit guides as sources", () => {
  const guides = { version: 1, items: [
    { sig: "a", title: "Slaanesh pastel", text: "1. **White Scar**", createdAt: "2026-10-01" },
    { sig: "b", title: "", text: "   " },
    { title: "no sig", text: "x" }
  ] };
  const armies = { version: 1, armies: [{
    id: "army-1", name: "TryHard",
    regiments: [{ name: "R1", units: [
      { key: "u1", name: "Daemonettes", guide: { text: "1. **Nuln Oil**" } },
      { key: "u2", name: "Fiends" },
      { key: "u1", name: "Daemonettes duplicate", guide: { text: "1. **Nuln Oil**" } }
    ] }]
  }] };
  const sources = kit.collectSources(guides, armies);
  assert.deepEqual(sources.map(source => [source.id, source.kind, source.label, source.group]), [
    ["palette:a", "palette", "Slaanesh pastel", ""],
    ["unit:army-1:u1", "unit", "Daemonettes", "TryHard"]
  ]);
  assert.deepEqual(kit.collectSources(null, null), []);
  assert.deepEqual(kit.collectSources({ items: "x" }, { armies: [null] }), []);
});

test("resolves needed paints across guides and reports unknown names", () => {
  const sources = [
    { label: "A", text: "**Mephiston Red** **Nuln Oil** **Unobtainium Gold**" },
    { label: "B", text: "**Nuln Oil** **White Scar**" }
  ];
  const { needed, unknown } = kit.neededPaints(sources, resolve, keyOf);
  assert.deepEqual(needed.map(item => item.paint.name), ["Mephiston Red", "Nuln Oil", "White Scar"]);
  assert.deepEqual(needed.find(item => item.paint.name === "Nuln Oil").sources, ["A", "B"]);
  assert.deepEqual(unknown, ["Unobtainium Gold"]);
});

test("exact mode packs owned guide paints and buys the rest", () => {
  const needed = [paints.mephiston, paints.nuln, paints.white].map(paint => ({ paint, key: keyOf(paint), sources: ["A"] }));
  const plan = kit.planKit({ needed, owned: [paints.nuln, paints.vallejoWhite, paints.blue], keyOf, distance: () => 0, maxDistance: 0 });
  assert.deepEqual(plan.pack.map(item => item.paint.name), ["Nuln Oil"]);
  assert.deepEqual(plan.buy.map(item => item.paint.name), ["Mephiston Red", "White Scar"]);
  assert.deepEqual(plan.stats, { needed: 3, pack: 1, buy: 2, saved: 0 });
});

test("stand-ins let one owned pot cover several close guide paints", () => {
  const needed = [paints.mephiston, paints.evil, paints.white, paints.nuln].map(paint => ({ paint, key: keyOf(paint), sources: ["A"] }));
  const owned = [paints.gameRed, paints.vallejoWhite, paints.nuln, paints.blue];
  const realDistance = (a, b) => citadel.deltaE2000(toLab(a), toLab(b));
  const plan = kit.planKit({ needed, owned, keyOf, distance: realDistance, maxDistance: 12 });
  assert.equal(plan.buy.length, 0, "everything is covered");
  const red = plan.pack.find(item => item.paint.name === "Bloody Red");
  assert.ok(red, "the Vallejo red stands in for both Citadel reds");
  assert.deepEqual(red.covers.map(cover => cover.paint.name).sort(), ["Evil Sunz Scarlet", "Mephiston Red"]);
  assert.ok(!plan.pack.some(item => item.paint.name === "Macragge Blue"), "unrelated pots stay at home");
  assert.equal(plan.stats.pack, 3);
  assert.equal(plan.stats.saved, 1);
});

test("an owned exact paint wins a tie against a stand-in", () => {
  const needed = [{ paint: paints.white, key: keyOf(paints.white), sources: [] }];
  const plan = kit.planKit({ needed, owned: [paints.vallejoWhite, paints.white], keyOf, distance: () => 1, maxDistance: 5 });
  assert.equal(plan.pack.length, 1);
  assert.equal(plan.pack[0].paint.name, "White Scar");
  assert.equal(plan.pack[0].covers[0].distance, 0);
});

test("packing list text lists pots, stand-ins, purchases and unknown names", () => {
  const needed = [paints.mephiston, paints.evil, paints.blue].map(paint => ({ paint, key: keyOf(paint), sources: [] }));
  const plan = kit.planKit({ needed, owned: [paints.mephiston], keyOf, distance: (a, b) => (a === b ? 0 : 4), maxDistance: 5 });
  const text = kit.kitText(plan, { title: "Kit", pack: "Pack", buy: "Buy", standsIn: "for", unknown: "Unknown" }, ["Mystery"]);
  assert.match(text, /^Kit\n\nPack \(1\)\n\[ \] Mephiston Red – Citadel \(for Evil Sunz Scarlet, Macragge Blue\)/);
  assert.match(text, /Unknown: Mystery$/);
  const empty = kit.kitText({ pack: [], buy: [] }, { title: "Kit" }, []);
  assert.equal(empty, "Kit");
});

function toLab(hex) {
  // Same conversion as the app (sRGB D65 -> Lab), kept local so the test does not
  // depend on private helpers of citadel.js.
  const value = hex.replace("#", "");
  const channel = index => {
    const c = parseInt(value.slice(index, index + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [channel(0), channel(2), channel(4)];
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

test("stand-ins stay within the same kind of paint", () => {
  assert.equal(kit.kindOf({ range: "opaque" }), "opaque");
  assert.equal(kit.kindOf({ finish: "shade", type: "wash" }), "wash");
  assert.equal(kit.kindOf({ finish: "contrast" }), "transparent");
  assert.equal(kit.kindOf({ type: "opaque-metallic" }), "metallic");
  assert.equal(kit.kindOf({ finish: "technical" }), "technical");
  const black = { manufacturer: "Citadel", name: "Abaddon Black", hex: "#231F20", range: "opaque" };
  const wash = { manufacturer: "Citadel", name: "Nuln Oil", hex: "#151203", range: "wash" };
  const needed = [{ paint: black, key: keyOf(black), sources: [] }];
  const plan = kit.planKit({ needed, owned: [wash], keyOf, distance: () => 3, maxDistance: 15 });
  assert.equal(plan.pack.length, 0, "a wash does not replace a basecoat");
  assert.equal(plan.buy.length, 1);
});
