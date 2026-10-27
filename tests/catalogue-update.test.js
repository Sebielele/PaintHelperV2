const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { mergeBrand } = require("../scripts/update-catalogue");

test("catalogue update keeps existing entries and adds new paints", () => {
  const catalogue = {
    manufacturers: [{
      name: "Vallejo",
      colors: [
        { name: "Dead White", hex: "#FFFFFF", collection: "Game Color", status: "confirmed" },
        { name: "Leather Brown", hex: "#7A4A2A", collection: "Game Color", status: "confirmed" },
        { name: "Glorious Gold", hex: "#C8A040", finish: "metallic", status: "confirmed" }
      ]
    }]
  };
  const summary = mergeBrand(catalogue, "Vallejo", [
    { name: "Dead White", range: "Game Color", hex: "#F8F8F8", code: "72.001", type: "opaque" },
    { name: "Leather Brown", range: "Game Color", hex: "#7B4B2B", code: "72.040", type: "opaque" },
    { name: "Leather Brown", range: "Game Air", hex: "#7C4C2C", code: "72.740", type: "opaque" },
    { name: "Glorious Gold", range: "Game Color", hex: "#C9A141", code: "72.056", type: "opaque", metallic: true },
    { name: "Sapphire Blue", range: "True Metallic Metal", hex: "#1F3F8F", code: "77.131", type: "opaque", metallic: true },
    { name: "Broken", range: "Game Color", hex: "nope" }
  ]);
  const colors = catalogue.manufacturers[0].colors;
  const deadWhite = colors.find(color => color.name === "Dead White");
  assert.equal(deadWhite.hex, "#FFFFFF", "existing hex is kept so owned-paint keys stay valid");
  assert.equal(deadWhite.manufacturer_code, "72.001");
  assert.equal(colors.filter(color => color.name === "Leather Brown").length, 2);
  assert.equal(colors.find(color => color.manufacturer_code === "72.740").collection, "Game Air");
  assert.equal(colors.find(color => color.name === "Glorious Gold").manufacturer_code, "72.056", "generic entry merged with the main line");
  assert.equal(colors.find(color => color.name === "Sapphire Blue").finish, "metallic");
  assert.deepEqual(
    { added: summary.added, enriched: summary.enriched, skipped: summary.skipped },
    { added: 2, enriched: 3, skipped: 1 }
  );
});

test("bundled catalogue credits Paintdex and has codes for the PaintRack import", () => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "paint-catalogue.json"), "utf8"));
  const colors = data.manufacturers.flatMap(manufacturer => manufacturer.colors);
  assert.ok(colors.length > 4000);
  assert.ok(colors.filter(color => color.manufacturer_code).length > 2000);
  assert.ok(colors.every(color => /^#[0-9A-F]{6}$/.test(color.hex)));
  assert.ok(data.manufacturers.every(manufacturer => manufacturer.source_urls.includes("https://github.com/s10-steve/paintdex")));
  assert.ok(fs.readFileSync(path.join(__dirname, "..", "THIRD_PARTY_NOTICES.md"), "utf8").includes("Paintdex contributors"));
});
