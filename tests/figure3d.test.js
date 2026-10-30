const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

test("the 3D figure loads on demand from the painting desk", () => {
  const bench = read("src/bench.js");
  assert.match(bench, /src\/vendor\/three-bundle\.js/);
  assert.match(bench, /src\/ui\/figure3d\.js/);
  const html = read("WarhammerPaintHelper.html");
  assert.doesNotMatch(html, /three-bundle\.js/, "three.js is not loaded with the page");
});

test("3D files are valid scripts and the bundled three.js keeps its licence", () => {
  ["src/vendor/three-bundle.js", "src/ui/figure3d.js"].forEach(file => {
    assert.doesNotThrow(() => new vm.Script(read(file), { filename: file }), file);
  });
  assert.match(read("src/vendor/three-bundle.js").slice(0, 400), /three\.js r\d+ \(MIT License/);
  assert.match(read("THIRD_PARTY_NOTICES.md"), /three\.js/);
});
