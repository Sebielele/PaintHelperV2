const test = require("node:test");
const assert = require("node:assert/strict");
const { buildGuide, guideText, sanitizeContext } = require("../server/ai");
const paintMatch = require("../src/logic/paint-match");

test("the primer line names the product line of a colour primer", () => {
  const context = sanitizeContext({
    language: "de",
    colors: [{ name: "Rüstung", hex: "#338E46", steps: [] }],
    primer: { tone: "color", name: "Goblin Green", manufacturer: "Army Painter", collection: "Warpaints Primer", owned: true }
  });
  assert.equal(context.primer.collection, "Warpaints Primer");
  assert.match(buildGuide(context, guideText("de")), /\*\*Goblin Green\*\*, Army Painter Warpaints Primer\)/);
});

test("a primer without product line keeps the short form", () => {
  const context = sanitizeContext({ language: "en", colors: [], primer: { tone: "dark", name: "Chaos Black" } });
  assert.match(buildGuide(context, guideText("en")), /\(e\.g\. \*\*Chaos Black\*\*\)\./);
});

test("metallics are recognised by type and stand-ins keep the paint kind", () => {
  const ironHands = { name: "Iron Hands Steel", hex: "#B2A79F", finish: "base", type: "opaque-metallic" };
  const agraxGloss = { name: "Agrax Earthshade Gloss", hex: "#B4AA9E", finish: "shade", type: "wash" };
  const nuln = { name: "Nuln Oil", hex: "#14100E", finish: "shade", type: "wash" };
  assert.equal(paintMatch.guidePaintKind(ironHands), "metal");
  const findClosestPaints = (hex, list) => list.map(paint => ({ ...paint, distance: paint === nuln ? 8 : 2 }))
    .sort((a, b) => a.distance - b.distance);
  const options = { paintKey: paint => paint.name, maxDistance: 10, findClosestPaints };
  assert.equal(paintMatch.ownedStandIn(agraxGloss, [ironHands, nuln], options).name, "Nuln Oil");
  assert.equal(paintMatch.ownedStandIn(agraxGloss, [ironHands], options), null);
});
