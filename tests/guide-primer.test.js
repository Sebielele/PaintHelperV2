const test = require("node:test");
const assert = require("node:assert/strict");
const { buildGuide, guideText, sanitizeContext } = require("../server/ai");

test("the primer line names the product line of a colour primer", () => {
  const context = sanitizeContext({
    language: "de",
    colors: [{ name: "Rüstung", hex: "#338E46", steps: [] }],
    primer: { tone: "color", name: "Goblin Green", manufacturer: "Army Painter", collection: "Warpaints Primer", owned: true }
  });
  assert.equal(context.primer.collection, "Warpaints Primer");
  const guide = buildGuide(context, guideText("de"));
  assert.match(guide, /\*\*Goblin Green\*\*, Army Painter Warpaints Primer\)/);
});

test("a primer without product line keeps the short form", () => {
  const context = sanitizeContext({ language: "en", colors: [], primer: { tone: "dark", name: "Chaos Black" } });
  assert.match(buildGuide(context, guideText("en")), /\(e\.g\. \*\*Chaos Black\*\*\)\./);
});
