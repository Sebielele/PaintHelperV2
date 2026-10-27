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
