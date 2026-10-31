const test = require("node:test");
const assert = require("node:assert/strict");
const army = require("../src/army-data.js");
const roster = require("./fixtures/newrecruit-hedonites.json");

test("reads a NewRecruit roster into regiments, units and single models", () => {
  const parsed = army.parseRoster(roster, { armyLabel: "Ganze Armee" });
  assert.equal(parsed.name, "TryHard");
  assert.equal(parsed.faction, "Hedonites of Slaanesh");
  assert.equal(parsed.system, "aos");
  assert.equal(parsed.points, 2000);
  assert.deepEqual(parsed.regiments.map(regiment => regiment.name), ["Regiment 1", "Regiment 2", "Regiment 3", "Regiment 4", "Regiment 5", "Ganze Armee"]);
  const units = parsed.regiments.flatMap(regiment => regiment.units);
  const daemonettes = units.filter(unit => unit.name === "Daemonettes");
  assert.equal(daemonettes.length, 2);
  assert.equal(daemonettes[0].models.length, 10, "champion, musician, banner and 7 more");
  assert.equal(daemonettes[0].points, 120, "enhancement points count to the unit");
  assert.deepEqual(units.find(unit => unit.name === "Thricefold Discord").models.map(model => model.name),
    ["Lascivyr, the Bladed Blessing", "Vashtiss the Coiled", "Vexmor, the Excessively Indolent"]);
  assert.equal(units.find(unit => unit.name === "Mesmerising Mirror").kind, "manifestation");
  assert.equal(units.find(unit => unit.name === "Fane of Slaanesh").kind, "terrain");
  assert.ok(!units[0].keywords.some(word => /regimental|warmaster|unique/i.test(word)), "rule keywords are dropped");
  assert.equal(units.filter(unit => unit.kind === "unit").reduce((sum, unit) => sum + unit.points, 0), 2000);
  assert.throws(() => army.parseRoster({}), /no_roster/);
});

test("progress counts painted models and weights points", () => {
  const parsed = { id: "army-test", ...army.parseRoster(roster) };
  const units = parsed.regiments.flatMap(regiment => regiment.units);
  units[0].models[0].stage = 4; // Shalaxi Helbane, 410 pts, based
  units[2].models.forEach((model, index) => { model.stage = index < 5 ? 3 : 1; }); // half the Daemonettes
  const progress = army.armyProgress(parsed);
  assert.equal(progress.models, 34);
  assert.equal(progress.painted, 6);
  assert.equal(progress.pointsPainted, 410 + 60);
  assert.equal(progress.unitsDone, 1);
  assert.deepEqual(progress.stages, [23, 5, 0, 5, 1]);
  assert.equal(army.armyProgress(parsed, { includeExtras: true }).models, 38);
});

test("a new import keeps stages, guides and the palette", () => {
  const first = { id: "army-a", paletteId: "custom-x1", ...army.parseRoster(roster) };
  const unit = first.regiments[0].units[2];
  unit.models.forEach(model => { model.stage = 2; });
  unit.guide = { text: "## A\n1. b", createdAt: "x", done: [0] };
  const changed = JSON.parse(JSON.stringify(roster));
  // Remove the Lord of Pain regiment and add a new unit.
  changed.roster.forces[0].forces.pop();
  changed.roster.forces[0].forces[0].selections.push({ id: "new1", name: "Seekers", type: "unit", number: 1, selections: [{ type: "model", name: "Seeker", number: 5 }], costs: [{ name: "pts", value: 120 }] });
  const merged = army.mergeArmy(first, army.parseRoster(changed));
  assert.equal(merged.id, "army-a");
  assert.equal(merged.paletteId, "custom-x1");
  const kept = merged.regiments[0].units.find(entry => entry.key === unit.key);
  assert.ok(kept.models.every(model => model.stage === 2));
  assert.deepEqual(kept.guide.done, [0]);
  assert.equal(merged.addedUnits, 1);
  assert.deepEqual(merged.removedUnits, ["Lord of Pain"]);
  assert.equal(merged.regiments[0].units.find(entry => entry.name === "Seekers").isNew, true);
});

test("stored projects are bounded and cleaned", () => {
  const store = army.sanitizeStore({
    activeId: "nope",
    armies: [
      { id: "army-ok", name: "A", paletteId: "javascript:alert(1)", regiments: [{ name: "R", units: [{ name: "U", models: [{ name: "M", stage: 9 }, { name: "M", stage: -1 }], guide: { text: "", done: [1] } }] }] },
      { id: "../evil", name: "B", regiments: [] }
    ]
  });
  assert.equal(store.armies.length, 1);
  assert.equal(store.activeId, "army-ok");
  assert.equal(store.armies[0].paletteId, "");
  assert.deepEqual(store.armies[0].regiments[0].units[0].models.map(model => model.stage), [4, 0]);
  assert.equal(store.armies[0].regiments[0].units[0].guide, undefined);
});

test("guide steps are numbered across sections; tips stay separate", () => {
  const guide = army.guideSteps("## Vorbereitung\n1. Grundieren\n2. Entgraten\n\n## Rüstung\nWo: Rüstung\n1. Basis: **Death Guard Green**\n\n## Tipps\n- Rost tupfen");
  assert.equal(guide.total, 3);
  assert.deepEqual(guide.sections.map(section => section.steps.map(step => step.index)), [[0, 1], [2], []]);
  assert.equal(guide.sections[1].lead, "Wo: Rüstung");
  assert.deepEqual(guide.sections[2].bullets, ["Rost tupfen"]);
});

test("next units prefer nearly finished, then big units", () => {
  const parsed = army.parseRoster(roster);
  const units = parsed.regiments.flatMap(regiment => regiment.units);
  // Set Daemonettes: 8 of 10 models painted (stage 3)
  const daemonettes = units.filter(u => u.name === "Daemonettes")[0];
  daemonettes.models.forEach((m, i) => { m.stage = i < 8 ? 3 : 0; });
  // Set Fiends: 1 of 3 models painted (stage 1)
  const fiends = units.find(u => u.name === "Fiends");
  fiends.models.forEach((m, i) => { m.stage = i === 0 ? 1 : 0; });
  // Set a finished unit (all models stage 3) to ensure it is excluded
  const finished = units.find(u => u.name === "Lord of Pain");
  finished.models.forEach(m => { m.stage = 3; });
  // Set a big not started unit (Shalaxi Helbane, 410 pts)
  const big = units.find(u => u.name === "Shalaxi Helbane");
  big.models.forEach(m => { m.stage = 0; });
  const next = army.nextUnits(parsed, 3);
  assert.equal(next.length, 3);
  assert.equal(next[0].unit.name, "Daemonettes");
  assert.equal(next[1].unit.name, "Fiends");
  assert.equal(next[2].unit.name, "Shalaxi Helbane");
  // Ensure finished unit is not in the list
  assert.ok(!next.some(entry => entry.unit.name === "Lord of Pain"));
  // Ensure manifestations and terrain are not in the list
  assert.ok(next.every(entry => entry.unit.kind === "unit"));
});

// edge cases: empty armies and units without models
test("edge cases: empty armies and units without models", () => {
  // unitProgress with empty models
  const unit = army.unitProgress({ models: [] });
  assert.equal(unit.total, 0);
  assert.equal(unit.painted, 0);
  assert.equal(unit.share, 0);
  assert.equal(unit.done, false);

  // armyProgress with empty regiments
  const armyEmpty = army.armyProgress({ regiments: [] });
  assert.equal(armyEmpty.models, 0);
  assert.equal(armyEmpty.painted, 0);
  assert.equal(armyEmpty.units, 0);
  assert.equal(armyEmpty.unitsDone, 0);

  // nextUnits with empty regiments
  const nextEmpty = army.nextUnits({ regiments: [] });
  assert.equal(nextEmpty.length, 0);

  // nextUnits skipping finished unit
  const armyWithUnits = {
    regiments: [
      {
        units: [
          { name: "Finished", kind: "unit", models: [{ stage: 3 }] },
          { name: "NotStarted", kind: "unit", models: [{ stage: 0 }] }
        ]
      }
    ]
  };
  const nextUnitsResult = army.nextUnits(armyWithUnits, 3);
  assert.equal(nextUnitsResult.length, 1);
  assert.equal(nextUnitsResult[0].unit.name, "NotStarted");

  // nextUnits with 5 units, limit 2
  const armyMit5Einheiten = {
    regiments: [
      {
        units: [
          { name: "U1", kind: "unit", models: [{ stage: 0 }] },
          { name: "U2", kind: "unit", models: [{ stage: 0 }] },
          { name: "U3", kind: "unit", models: [{ stage: 0 }] },
          { name: "U4", kind: "unit", models: [{ stage: 0 }] },
          { name: "U5", kind: "unit", models: [{ stage: 0 }] }
        ]
      }
    ]
  };
  const nextFive = army.nextUnits(armyMit5Einheiten, 2);
  assert.equal(nextFive.length, 2);
});

// guide steps ignore text without numbered steps
test("guide steps ignore text without numbered steps", () => {
  const guide = army.guideSteps("## Nur Titel\nKein Schritt");
  assert.equal(guide.total, 0);
});

test("splitStepText separates the last hint outside parentheses and without backticks", () => {
  assert.deepEqual(army.splitStepText("Grundschicht: **Rainforest** (am nächsten; keine passende Farbe – Richtung `#76FF03`) – Deckende Hauptschicht"), {
    main: "Grundschicht: **Rainforest** (am nächsten; keine passende Farbe – Richtung `#76FF03`)",
    hint: "Deckende Hauptschicht"
  });
  assert.deepEqual(army.splitStepText("Fokus: keine passende Farbe – Richtung `#556229`"), {
    main: "Fokus: keine passende Farbe – Richtung `#556229`",
    hint: ""
  });
  assert.deepEqual(army.splitStepText("Fokus: keine passende Farbe – Richtung `#556229` – Nur Gesicht und Runen"), {
    main: "Fokus: keine passende Farbe – Richtung `#556229`",
    hint: "Nur Gesicht und Runen"
  });
  assert.deepEqual(army.splitStepText("Basis: **Mephiston Red** – Deckende Hauptschicht"), {
    main: "Basis: **Mephiston Red**",
    hint: "Deckende Hauptschicht"
  });
  assert.deepEqual(army.splitStepText("Gussgrate entfernen"), {
    main: "Gussgrate entfernen",
    hint: ""
  });
});

test("painting dates: set when painted, kept, cleared and counted per month", () => {
  const model = { name: "M", stage: 0 };
  army.setStage(model, 3, new Date("2026-10-05T10:00:00Z"));
  assert.equal(model.paintedAt, "2026-10-05");
  army.setStage(model, 4, new Date("2026-11-01T10:00:00Z"));
  assert.equal(model.paintedAt, "2026-10-05", "basing keeps the painting date");
  army.setStage(model, 1);
  assert.equal(model.paintedAt, undefined);
  const data = { id: "army-dates", regiments: [{ name: "R", units: [
    { name: "A", kind: "unit", models: [{ name: "a", stage: 3, paintedAt: "2026-09-30" }, { name: "b", stage: 4, paintedAt: "2026-10-02" }, { name: "c", stage: 1, paintedAt: "2026-10-03" }] },
    { name: "T", kind: "terrain", models: [{ name: "t", stage: 3, paintedAt: "2026-10-04" }] }
  ] }] };
  assert.deepEqual(army.paintedByMonth(data), [{ month: "2026-09", count: 1 }, { month: "2026-10", count: 1 }]);
  assert.deepEqual(army.paintedByMonth(data, { includeExtras: true }).map(entry => entry.count), [1, 2]);
  const clean = army.sanitizeArmy({ ...data, regiments: [{ name: "R", units: [{ name: "A", models: [
    { name: "a", stage: 3, paintedAt: "2026-09-30" }, { name: "b", stage: 1, paintedAt: "2026-10-02" }, { name: "x", stage: 3, paintedAt: "javascript:1" }
  ] }] }] });
  assert.deepEqual(clean.regiments[0].units[0].models.map(m => m.paintedAt), ["2026-09-30", undefined, undefined]);
});

test("unit photos: stable keys, strict data URLs and downscaled sizes", () => {
  assert.equal(army.photoKey("army-abc", { key: "u1" }), "wph.photo.09563ff1");
  assert.equal(army.photoKey("army-abc", { name: "Blissbarb Archers" }), "wph.photo.9508f0e7");
  assert.equal(army.photoKey("army-abc", { key: "", name: "Blissbarb Archers" }), "wph.photo.9508f0e7");
  assert.match(army.photoKey("army-x", null), /^wph\.photo\.[0-9a-f]{8}$/);

  const jpeg = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
  assert.equal(army.sanitizePhoto(jpeg), jpeg);
  assert.equal(army.sanitizePhoto("data:image/webp;base64,UklGRg=="), "data:image/webp;base64,UklGRg==");
  assert.equal(army.sanitizePhoto("data:image/svg+xml;base64,PHN2Zz4="), "");
  assert.equal(army.sanitizePhoto("data:image/jpeg;base64,<script>"), "");
  assert.equal(army.sanitizePhoto(`data:image/jpeg;base64,${"A".repeat(army.PHOTO_MAX_CHARS)}`), "");
  assert.equal(army.sanitizePhoto(null), "");

  assert.deepEqual(army.photoSize(4000, 3000), { width: 480, height: 360 });
  assert.deepEqual(army.photoSize(3000, 4000, 360), { width: 270, height: 360 });
  assert.deepEqual(army.photoSize(300, 200), { width: 300, height: 200 });
  assert.deepEqual(army.photoSize(5000, 2), { width: 480, height: 1 });
  assert.deepEqual(army.photoSize(0, 5), { width: 0, height: 0 });
});

test("re-import keeps the old unit key when a unit is matched by name", () => {
  const unit = (key, name) => ({ key, name, points: 100, kind: "unit", keywords: [], models: [{ name, stage: 0 }] });
  const previous = { id: "army-k", regiments: [{ name: "R", units: [unit("old-1", "Daemonettes"), unit("old-2", "Fiends"), unit("same", "Slickblade")] }] };
  const next = { id: "army-k", regiments: [{ name: "R", units: [unit("new-1", "Daemonettes"), unit("old-2", "Blissbarb"), unit("same", "Slickblade"), unit("new-4", "Fiends")] }] };
  const merged = army.mergeArmy(previous, next);
  const keys = merged.regiments[0].units.map(entry => `${entry.name}=${entry.key}`);
  assert.deepEqual(keys, ["Daemonettes=old-1", "Blissbarb=old-2", "Slickblade=same", "Fiends=new-4"]);
});
