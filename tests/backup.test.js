const test = require("node:test");
const assert = require("node:assert/strict");
const backup = require("../src/backup.js");

test("builds a backup with only valid wph keys, sorted", () => {
  const data = backup.buildBackup({
    "wph.settings.v1": "{\"a\":1}",
    "wph.armies.v1": "{\"armies\":[]}",
    "other.key": "x",
    "wph.bad key": "x",
    "wph.number": 5
  }, { exportedAt: "2026-10-28T10:00:00.000Z", user: "sebastian", appVersion: "v0.25" });
  assert.equal(data.format, backup.FORMAT);
  assert.equal(data.version, 1);
  assert.equal(data.user, "sebastian");
  assert.deepEqual(Object.keys(data.items), ["wph.armies.v1", "wph.settings.v1"]);
});

test("round-trips through JSON and reports skipped entries", () => {
  const text = JSON.stringify(backup.buildBackup({ "wph.guides.v1": "{\"items\":[]}", "wph.language": "de" }));
  const parsed = backup.parseBackup(text);
  assert.deepEqual(parsed.items, { "wph.guides.v1": "{\"items\":[]}", "wph.language": "de" });
  assert.equal(parsed.skipped, 0);

  const tampered = JSON.parse(text);
  tampered.items["wph.kit.v1"] = "{broken";
  tampered.items["evil"] = "{}";
  const second = backup.parseBackup(JSON.stringify(tampered));
  assert.equal(second.skipped, 2);
  assert.ok(!("evil" in second.items));
});

test("rejects files that are not backups", () => {
  assert.throws(() => backup.parseBackup("no json"), /not_json/);
  assert.throws(() => backup.parseBackup("{}"), /not_backup/);
  assert.throws(() => backup.parseBackup(JSON.stringify({ format: backup.FORMAT, version: 99, items: { "wph.a": "{}" } })), /too_new/);
  assert.throws(() => backup.parseBackup(JSON.stringify({ format: backup.FORMAT, version: 1, items: { "x": "{}" } })), /empty/);
  assert.throws(() => backup.parseBackup(JSON.stringify({ format: backup.FORMAT, version: 1, items: [] })), /not_backup/);
});

test("describes the areas a backup touches and names the file", () => {
  assert.deepEqual(backup.describeItems({ "wph.armies.v1": "", "wph.guides.v1": "", "wph.settings.v1": "", "wph.profiles.v1": "", "wph.language": "" }),
    ["armies", "guides", "palettes", "other"]);
  assert.equal(backup.fileName(new Date("2026-10-28T12:00:00Z"), "Sebi/../x"), "painthelper-backup-Sebi..x-2026-10-28.json");
  assert.equal(backup.fileName(new Date("2026-10-28T12:00:00Z"), ""), "painthelper-backup-2026-10-28.json");
});

test("unit photos count as army projects in the restore summary", () => {
  assert.deepEqual(backup.describeItems({ "wph.photo.09563ff1": "data:image/jpeg;base64,AA==" }), ["armies"]);
  assert.deepEqual(backup.describeItems({ "wph.armies.v1": "", "wph.photo.9508f0e7": "" }), ["armies"]);
});
