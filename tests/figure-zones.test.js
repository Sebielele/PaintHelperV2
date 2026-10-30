const test = require("node:test");
const assert = require("node:assert/strict");
const zones = require("../src/logic/figure-zones.js");
const { TRANSLATIONS } = require("../src/i18n.js");
const core = require("../src/core.js");

test("every role area has a figure zone", () => {
  for (const language of Object.keys(TRANSLATIONS)) {
    for (const key of Object.keys(TRANSLATIONS[language].roleAreas)) {
      assert.ok(zones.FIGURE_ZONES.includes(zones.zoneForArea(key)), `${language}.${key}`);
    }
  }
  assert.equal(zones.zoneForArea("unknown"), "");
});

test("area labels with commas are found in a where line", () => {
  assert.deepEqual(zones.areaKeysInText("Where: Armor, skin, robe, or main cloth, Weapon", TRANSLATIONS).sort(), ["dominantSurface", "weapon"]);
  assert.deepEqual(zones.figureZonesForText("Where: Armor, skin, robe, or main cloth, Weapon", TRANSLATIONS), ["armor", "weapon"]);
});

test("where lines in other languages are recognised", () => {
  const de = TRANSLATIONS.de.roleAreas;
  assert.deepEqual(zones.figureZonesForText(`Wo: ${de.baseDetails}, ${de.metalDetails}`, TRANSLATIONS), ["metal", "base"]);
  const es = TRANSLATIONS.es.roleAreas;
  assert.deepEqual(zones.areaKeysInText(`Dónde: ${es.plateArmor}, ${es.weapon}`, TRANSLATIONS).sort(), ["plateArmor", "weapon"]);
});

test("short labels do not match inside longer ones", () => {
  assert.deepEqual(zones.areaKeysInText("Where: Weapon casing", TRANSLATIONS), ["weaponCasing"]);
});

test("empty or unknown text gives no zones", () => {
  assert.deepEqual(zones.figureZonesForText("", TRANSLATIONS), []);
  assert.deepEqual(zones.figureZonesForText("Where: something else", TRANSLATIONS), []);
  assert.deepEqual(zones.figureZonesForText("Where: Weapon", undefined), []);
});

test("zone tones follow the painting ladder of the base colour", () => {
  assert.deepEqual(zones.zoneTones("#6d2a86", core), { highlight: "#B27BC6", layer: "#9941B9", base: "#6d2a86", shade: "#34193E" });
  assert.deepEqual(zones.zoneTones("#C9A13B", core), { highlight: "#E2D4B1", layer: "#D5BA76", base: "#C9A13B", shade: "#7C652D" });
  assert.equal(zones.zoneTones("nope", core), null);
  assert.equal(zones.zoneTones("#6d2a86", null), null);
});

test("figure type comes from the unit keywords", () => {
  assert.equal(zones.figureForKeywords(["HERO", "CHAOS", "DAEMON", "MONSTER"]), "monster");
  assert.equal(zones.figureForKeywords(["DAEMON", "BEAST", "CHAOS"]), "monster");
  assert.equal(zones.figureForKeywords(["Cavalry", "HERO"]), "cavalry");
  assert.equal(zones.figureForKeywords(["CHAOS", "WAR MACHINE"]), "cavalry");
  assert.equal(zones.figureForKeywords(["INFANTRY", "CHAOS"]), "infantry");
  assert.equal(zones.figureForKeywords(undefined), "infantry");
  assert.deepEqual(zones.FIGURE_TYPES, ["infantry", "cavalry", "monster"]);
});
