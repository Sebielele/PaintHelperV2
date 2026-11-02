const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const WPHProjectData = require("../src/project-data.js");

function loadFixture() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "project-dexcessa.json"), "utf8"));
}

test("project fixture round-trips and reports progress", () => {
  const fixture = loadFixture();
  const store = WPHProjectData.sanitizeStore(fixture);

  assert.deepEqual(store, fixture);

  const project = store.projects[0];
  assert.deepEqual(WPHProjectData.groups(project), ["Sockel", "Figuren", "Gefallene"]);

  const progress = WPHProjectData.progress(project);
  assert.equal(progress.elements, 16);
  assert.equal(progress.done, 0);
  assert.deepEqual(progress.byGroup.map(group => group.elements), [5, 1, 10]);
  assert.equal(WPHProjectData.suppliesOpen(project), 3);
});

test("stage lists and isDone use the last stage", () => {
  assert.equal(WPHProjectData.STAGES.fdm.length, 6);
  assert.equal(WPHProjectData.STAGES.kit.length, 5);
  assert.equal(WPHProjectData.STAGES.material.length, 2);

  const fdm = WPHProjectData.newElement("fdm", "FDM");
  fdm.stage = WPHProjectData.STAGES.fdm.length - 1;
  assert.equal(WPHProjectData.isDone(fdm), true);
  fdm.stage -= 1;
  assert.equal(WPHProjectData.isDone(fdm), false);

  const material = WPHProjectData.newElement("material", "Material");
  material.stage = 1;
  assert.equal(WPHProjectData.isDone(material), true);
});

test("progress counts quantities", () => {
  const project = WPHProjectData.newProject("Qty");
  const element = WPHProjectData.newElement("kit", "Hands");
  element.qty = 7;
  element.stage = WPHProjectData.STAGES.kit.length - 1;
  project.elements.push(element);

  const progress = WPHProjectData.progress(project);
  assert.equal(progress.elements, 7);
  assert.equal(progress.done, 7);
  assert.equal(progress.share, 1);
});

test("sanitizeStore drops invalid projects and elements", () => {
  const project = WPHProjectData.newProject("Valid");
  const store = WPHProjectData.sanitizeStore({
    version: 1,
    activeId: "missing",
    projects: [{ ...project, id: "bad" }, project]
  });

  assert.equal(store.projects.length, 1);
  assert.equal(store.activeId, project.id);
});

test("sanitizeElement normalizes kind stage qty and name", () => {
  const element = WPHProjectData.sanitizeElement({
    id: "el-test",
    name: "x".repeat(200),
    group: "g",
    kind: "unknown",
    qty: 500,
    stage: 99,
    file: "f",
    notes: "a\nb"
  });

  assert.equal(element.kind, "kit");
  assert.equal(element.stage, WPHProjectData.STAGES.kit.length - 1);
  assert.equal(element.qty, 99);
  assert.equal(element.name.length, 80);
  assert.equal(element.notes, "a\nb");

  const zero = WPHProjectData.sanitizeElement({ id: "el-zero", qty: 0 });
  assert.equal(zero.qty, 1);
});

test("sanitizeStore limits projects and duplicate element ids", () => {
  const projects = Array.from({ length: 21 }, (_, index) => WPHProjectData.newProject(`P${index}`));
  const store = WPHProjectData.sanitizeStore({ version: 1, activeId: projects[20].id, projects });

  assert.equal(store.projects.length, 20);
  assert.equal(store.activeId, projects[0].id);

  const project = WPHProjectData.newProject("Dup");
  const element = WPHProjectData.newElement("kit", "Dup");
  project.elements.push(element, { ...element });

  const sanitized = WPHProjectData.sanitizeProject(project);
  assert.equal(sanitized.elements.length, 1);
});

test("sanitizeProject filters links and supplies", () => {
  const project = WPHProjectData.newProject("Links");
  project.links = [
    { label: "bad", url: "javascript:alert(1)" },
    { label: "web", url: "https://example.com" },
    { label: "drive", url: "C:\\x\\y.stl" },
    { label: "relative", url: "CAD/a.stl" }
  ];
  project.supplies = [
    { name: "", qty: "1", have: false },
    { name: "Wire", qty: "20 cm", have: true, note: "ok" }
  ];

  const sanitized = WPHProjectData.sanitizeProject(project);
  assert.deepEqual(sanitized.links.map(item => item.url), ["https://example.com", "C:\\x\\y.stl", "CAD/a.stl"]);
  assert.equal(sanitized.supplies.length, 1);
});

test("new project and element survive sanitizing unchanged", () => {
  const project = WPHProjectData.newProject("New");
  assert.deepEqual(WPHProjectData.sanitizeProject(project), project);

  const element = WPHProjectData.newElement("fdm", "Part");
  assert.deepEqual(WPHProjectData.sanitizeElement(element), element);
});

test("moveElement swaps within the same group", () => {
  const store = WPHProjectData.sanitizeStore(loadFixture());
  const project = store.projects[0];

  assert.equal(WPHProjectData.moveElement(project, "el-kappe-l", -1), true);
  assert.deepEqual(project.elements.slice(0, 2).map(element => element.id), ["el-modul", "el-kappe-l"]);
  assert.equal(WPHProjectData.moveElement(project, "el-dexcessa", 1), false);
});
