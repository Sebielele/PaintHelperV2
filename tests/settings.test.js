const test = require("node:test");
const assert = require("node:assert/strict");
const settings = require("../src/logic/settings.js");
const core = require("../src/core.js");

test("cleanText normalizes control characters, trims and truncates", () => {
  assert.equal(settings.cleanText("a\u0001b"), "a b");
  assert.equal(settings.cleanText("  a\u0007b  "), "a b");
  assert.equal(settings.cleanText("abcdef", 3), "abc");
  assert.equal(settings.cleanText(null), "");
});

test("validNumber accepts only finite numbers", () => {
  assert.equal(settings.validNumber(3), true);
  assert.equal(settings.validNumber(NaN), false);
  assert.equal(settings.validNumber(Number.POSITIVE_INFINITY), false);
  assert.equal(settings.validNumber("3"), false);
});

test("sanitizeCustomScheme validates ids, roles and fields", () => {
  const roleCodes = ["D", "S", "ND", "NL", "A1", "A2"];

  assert.equal(settings.sanitizeCustomScheme({ id: "x", roles: [{ code: "D", hex: "#112233" }] }, roleCodes), null);
  assert.equal(settings.sanitizeCustomScheme({ id: "custom-x", roles: [{ code: "X", hex: "#112233" }] }, roleCodes), null);

  const scheme = settings.sanitizeCustomScheme({
    id: "custom-x",
    name: "",
    source: "unknown",
    rating: 5,
    roles: [
      { code: "D", hex: "#aabbcc" },
      { code: "X", hex: "#112233" }
    ]
  }, roleCodes);

  assert.equal(scheme.name, "Palette");
  assert.equal(scheme.source, "ai");
  assert.equal(scheme.rating, 1);
  assert.deepEqual(scheme.roles, [{ code: "D", name: "", hex: "#AABBCC" }]);
});

test("sanitizeCustomScheme clamps ratings and truncates long names", () => {
  const roleCodes = ["D", "S", "ND", "NL", "A1", "A2"];
  const negative = settings.sanitizeCustomScheme({ id: "custom-neg", rating: -2, roles: [{ code: "D", hex: "#112233" }] }, roleCodes);
  const zero = settings.sanitizeCustomScheme({ id: "custom-zero", rating: 0, roles: [{ code: "D", hex: "#112233" }] }, roleCodes);
  const longName = settings.sanitizeCustomScheme({ id: "custom-long", name: "a".repeat(70), roles: [{ code: "D", hex: "#112233" }] }, roleCodes);

  assert.equal(negative.rating, -1);
  assert.equal(zero.rating, 0);
  assert.equal(longName.name.length, 60);
});

test("sharedSchemeId is stable and colour-sensitive", () => {
  const shared = {
    name: "Test",
    roles: [
      { code: "D", hex: "#112233" },
      { code: "S", hex: "#AABBCC" }
    ]
  };

  assert.equal(settings.sharedSchemeId(shared), "custom-sety9t0");
  assert.equal(settings.sharedSchemeId({ ...shared, roles: shared.roles.slice() }), "custom-sety9t0");
  assert.notEqual(
    settings.sharedSchemeId({ ...shared, roles: [{ code: "D", hex: "#112234" }, { code: "S", hex: "#AABBCC" }] }),
    settings.sharedSchemeId(shared)
  );
});

test("sanitizePaintRackCustomPaint keeps PaintRack entries without catalogue colour", () => {
  assert.equal(settings.sanitizePaintRackCustomPaint({ manufacturer: "Citadel" }), null);
  assert.equal(settings.sanitizePaintRackCustomPaint({ name: "Red" }), null);

  const paint = settings.sanitizePaintRackCustomPaint({ name: "Red", manufacturer: "Citadel" });
  assert.equal(paint.count, 1);
  assert.equal(paint.hex, null);
  assert.equal(paint.status, "paintRack");
  assert.equal(paint.paintRackImport, true);
});

test("normalizeFlags copies defaults and ignores foreign keys", () => {
  const defaults = { a: false, b: true };
  const value = { a: "ja", c: true };

  assert.deepEqual(settings.normalizeFlags(value, defaults), { a: true, b: false });
  assert.deepEqual(defaults, { a: false, b: true });
  assert.deepEqual(settings.normalizeFlags("nope", defaults), { a: false, b: true });
});

test("settingsFromParams reads URL parameters and keeps parse failures null", () => {
  const deps = {
    normalizePaletteEdits: core.normalizePaletteEdits,
    hexToRgb: core.hexToRgb,
    rgbToHsl: core.rgbToHsl
  };

  assert.equal(settings.settingsFromParams(new URLSearchParams("style=10"), deps), null);

  const color = settings.settingsFromParams(new URLSearchParams("hex=3366CC"), deps);
  assert.equal(color.h, 220);
  assert.equal(color.s, 60);
  assert.equal(color.l, 50);

  const style = settings.settingsFromParams(new URLSearchParams("wph=1&style=-40"), deps);
  assert.equal(style.style, -40);

  const producerParams = new URLSearchParams("wph=1");
  producerParams.set("producers", "a, b,,c");
  assert.deepEqual(settings.settingsFromParams(producerParams, deps).producerKeys, ["a", "b", "c"]);

  const customParams = new URLSearchParams("wph=1");
  customParams.set("custom", "{kaputt");
  assert.equal(settings.settingsFromParams(customParams, deps).sharedCustomScheme, null);

  const paletteParams = new URLSearchParams("wph=1");
  paletteParams.set("palette", "{kaputt");
  assert.equal(settings.settingsFromParams(paletteParams, deps).paletteEdits, null);

  const langParams = new URLSearchParams("wph=1&lang=");
  assert.equal(settings.settingsFromParams(langParams, deps).language, undefined);
});
