const test = require("node:test");
const assert = require("node:assert/strict");
const zones = require("../src/logic/figure-zones.js");
const { TRANSLATIONS } = require("../src/i18n.js");

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
