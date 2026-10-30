const test = require("node:test");
const assert = require("node:assert/strict");
const citadel = require("../src/citadel.js");

test("normalizes supported paint catalogue JSON shapes", () => {
  const fromArray = citadel.normalizeCitadelPaints([
    { name: "Test Red", hex: "#AA0000", range: "Base" },
    { name: "Invalid", hex: "nope" }
  ]);
  const fromObject = citadel.normalizeCitadelPaints({
    paints: [{ paint: "Test Blue", colour: "0033AA", type: "Layer" }]
  });

  assert.deepEqual(fromArray, [
    {
      id: "0",
      name: "Test Red",
      hex: "#AA0000",
      range: "Base",
      finish: "",
      manufacturer: "",
      collection: "",
      status: "",
      sourceUrl: "",
      notes: "",
      manufacturerCode: ""
    }
  ]);
  assert.deepEqual(fromObject, [
    {
      id: "0",
      name: "Test Blue",
      hex: "#0033AA",
      range: "Layer",
      finish: "",
      manufacturer: "",
      collection: "",
      status: "",
      sourceUrl: "",
      notes: "",
      manufacturerCode: ""
    }
  ]);
});

test("flattens manufacturer colour catalogue entries", () => {
  const paints = citadel.normalizePaintCatalogue({
    manufacturers: [
      {
        name: "Example Paints",
        colors: [
          {
            name: "Catalogue Red",
            hex: "#AA0000",
            collection: "Game Color",
            status: "confirmed",
            source_url: "https://example.test/colors"
          },
          { name: "Missing Hex", hex: null, status: "missing" }
        ]
      }
    ]
  });

  assert.deepEqual(paints, [
    {
      id: "Example Paints:Catalogue Red",
      name: "Catalogue Red",
      hex: "#AA0000",
      range: "",
      finish: "",
      manufacturer: "Example Paints",
      collection: "Game Color",
      status: "confirmed",
      sourceUrl: "https://example.test/colors",
      notes: "",
      manufacturerCode: ""
    }
  ]);
});

test("finds exact and near paint matches", () => {
  const paints = [
    { name: "Black", hex: "#000000" },
    { name: "Red", hex: "#FF0000" },
    { name: "Blue", hex: "#0000FF" }
  ];
  const matches = citadel.findClosestPaints("#F80000", paints, 2);

  assert.equal(matches[0].name, "Red");
  assert.equal(matches.length, 2);
  assert.ok(matches[0].distance < matches[1].distance);
});

test("maps generated palette entries to closest paints", () => {
  const palette = [
    { roleKey: "primary", hex: "#FF0000" },
    { roleKey: "contrast", hex: "#0000FF" }
  ];
  const mapped = citadel.mapPaletteToCatalogue(palette, [
    { name: "Red", hex: "#FF0000" },
    { name: "Blue", hex: "#0000FF" }
  ], { limit: 1 });

  assert.equal(mapped[0].matches[0].name, "Red");
  assert.equal(mapped[1].matches[0].name, "Blue");
});

test("filters closest match candidates to owned paints when requested", () => {
  const paints = [
    { id: "owned-red", name: "Owned Red", hex: "#FF0000" },
    { id: "unowned-blue", name: "Unowned Blue", hex: "#0000FF" },
    { id: "owned-green", name: "Owned Green", hex: "#00FF00" }
  ];
  const ownedPaintKeys = new Set(["owned-red", "owned-green"]);

  const filtered = citadel.filterOwnedPaints(paints, {
    onlyOwnedMatches: true,
    ownedPaintKeys,
    paintKey: paint => paint.id
  });

  assert.deepEqual(filtered.map(paint => paint.name), ["Owned Red", "Owned Green"]);
  assert.deepEqual(citadel.filterOwnedPaints(paints, { onlyOwnedMatches: false, ownedPaintKeys }), paints);
  assert.deepEqual(citadel.filterOwnedPaints(paints), paints);
});

test("filters owned paints with array keys and default id lookup", () => {
  const paints = [
    { id: "first", name: "First Paint", hex: "#111111" },
    { id: "second", name: "Second Paint", hex: "#222222" },
    { id: "third", name: "Third Paint", hex: "#333333" }
  ];

  const filtered = citadel.filterOwnedPaints(paints, {
    onlyOwnedMatches: true,
    ownedPaintKeys: ["second", "third"]
  });

  assert.deepEqual(filtered.map(paint => paint.id), ["second", "third"]);
});

test("parses PaintRack CSV exports", () => {
  const parsed = citadel.parsePaintRackCsv([
    "Brand,SKU,Paint Name,Paint Class,Size,Count",
    "Vallejo,72.001,Dead White,Game Color,17|18 ml,1",
    "Vallejo,72.036,\"Bronze Brown / Bronze Fleshtone\",Game Color,17|18 ml,2",
    "Vallejo,72.999,Zero Count,Game Color,17 ml,0"
  ].join("\n"));

  assert.equal(parsed.paints.length, 2);
  assert.deepEqual(parsed.paints[0], {
    brand: "Vallejo",
    sku: "72.001",
    name: "Dead White",
    paintClass: "Game Color",
    size: "17|18 ml",
    count: 1,
    lineNumber: 2
  });
  assert.equal(parsed.paints[1].name, "Bronze Brown / Bronze Fleshtone");
  assert.equal(parsed.paints[1].count, 2);
  assert.equal(parsed.invalid.length, 1);
  assert.equal(parsed.invalid[0].reason, "count is zero or invalid");
});

test("matches PaintRack rows to catalogue colours by code or aliased name", () => {
  const paints = [
    {
      name: "Dead White",
      hex: "#FFFFFF",
      manufacturer: "Vallejo",
      collection: "Game Color",
      manufacturerCode: "72.001"
    },
    {
      name: "Bronze Flesh Tone",
      hex: "#BC8C5A",
      manufacturer: "Vallejo",
      collection: "Game Color",
      manufacturerCode: ""
    }
  ];

  assert.equal(citadel.findPaintRackCatalogueMatch({
    brand: "Vallejo",
    sku: "72.001",
    name: "Wrong Name",
    paintClass: "Game Color"
  }, paints).name, "Dead White");
  assert.equal(citadel.findPaintRackCatalogueMatch({
    brand: "Vallejo",
    sku: "72.036",
    name: "Bronze Brown / Bronze Fleshtone",
    paintClass: "Game Color"
  }, paints).name, "Bronze Flesh Tone");
});

test("creates custom PaintRack paints for colours outside the catalogue", () => {
  const paint = citadel.createPaintRackCustomPaint({
    brand: "Vallejo",
    sku: "72.999",
    name: "Mystery Colour",
    paintClass: "Game Color",
    size: "18 ml",
    count: 1
  });

  assert.equal(paint.name, "Mystery Colour");
  assert.equal(paint.hex, null);
  assert.equal(paint.manufacturerCode, "72.999");
  assert.equal(paint.paintRackImport, true);
  assert.match(paint.id, /^paintrack:/);
});

test("owned paint filtering handles empty and malformed inputs", () => {
  const paints = [
    { id: "owned", name: "Owned", hex: "#FFFFFF" },
    { id: "unowned", name: "Unowned", hex: "#000000" }
  ];

  assert.deepEqual(citadel.filterOwnedPaints(null, { onlyOwnedMatches: true, ownedPaintKeys: ["owned"] }), []);
  assert.deepEqual(citadel.filterOwnedPaints(paints, { onlyOwnedMatches: true }), []);
  assert.deepEqual(citadel.filterOwnedPaints(paints, { onlyOwnedMatches: true, ownedPaintKeys: ["missing"] }), []);
});

test("owned-only candidates are applied before closest paint matching", () => {
  const palette = [{ roleKey: "primary", hex: "#0000FE" }];
  const paints = [
    { id: "owned-red", name: "Owned Red", hex: "#FF0000" },
    { id: "unowned-blue", name: "Unowned Blue", hex: "#0000FF" }
  ];
  const ownedPaints = citadel.filterOwnedPaints(paints, {
    onlyOwnedMatches: true,
    ownedPaintKeys: ["owned-red"]
  });

  const mapped = citadel.mapPaletteToCatalogue(palette, ownedPaints, { limit: 3 });

  assert.deepEqual(mapped[0].matches.map(match => match.name), ["Owned Red"]);
});

test("normalizes hex values and rejects malformed colours", () => {
  assert.equal(citadel.normalizeHex("abc123"), "#ABC123");
  assert.equal(citadel.normalizeHex(" #00ffaa "), "#00FFAA");
  assert.equal(citadel.normalizeHex("#12345"), null);
  assert.equal(citadel.normalizeHex("not-a-colour"), null);
  assert.equal(citadel.colorDistance("bad", "#000000"), Infinity);
});

test("catalogue normalization preserves ids and manufacturer codes", () => {
  const paints = citadel.normalizePaintCatalogue({
    manufacturers: [
      {
        name: "Vallejo",
        colors: [
          {
            id: "vgc-72010",
            name: "Bloody Red",
            hex: "A8171A",
            manufacturer_code: "72.010",
            line: "Game Color",
            medium: "Acrylic"
          }
        ]
      }
    ]
  });

  assert.deepEqual(paints, [
    {
      id: "vgc-72010",
      name: "Bloody Red",
      hex: "#A8171A",
      range: "",
      finish: "Acrylic",
      manufacturer: "Vallejo",
      collection: "Game Color",
      status: "",
      sourceUrl: "",
      notes: "",
      manufacturerCode: "72.010"
    }
  ]);
});

test("closest paint matching handles invalid targets and empty catalogues", () => {
  const emptyMatches = citadel.findClosestPaints("#FF0000", [], 3);
  const invalidTargetMatches = citadel.findClosestPaints("bad", [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" }
  ], 2);
  const mapped = citadel.mapPaletteToCatalogue([
    { roleKey: "primary", hex: "#FF0000" }
  ], [], { limit: 2 });

  assert.deepEqual(emptyMatches, []);
  assert.equal(invalidTargetMatches.length, 2);
  invalidTargetMatches.forEach(match => assert.equal(match.distance, Infinity));
  assert.deepEqual(mapped[0].matches, []);
});

test("PaintRack rows without SKU are imported by brand and name", () => {
  const parsed = citadel.parsePaintRackCsv([
    "Brand,SKU,Paint Name,Paint Class,Size,Count",
    "Army Painter,,Zephyr Pink,Metallics,18 ml,1",
    ",,No Brand,Metallics,18 ml,1"
  ].join("\n"));
  assert.equal(parsed.paints.length, 1);
  assert.equal(parsed.paints[0].name, "Zephyr Pink");
  assert.equal(parsed.invalid.length, 1);
});

test("PaintRack brand names match catalogue aliases", () => {
  const paints = [
    { name: "Castellan Green", manufacturer: "Citadel Colours", collection: "Air", hex: "#264715" },
    { name: "Ivory White", manufacturer: "Army Painter", collection: "John Blanche Masterclass", hex: "#EEE6CC" },
    { name: "Offwhite", manufacturer: "AK Interactive", collection: "Standard (3rd Gen)", hex: "#F0EDE0", manufacturerCode: "AK11002" }
  ];
  assert.equal(citadel.findPaintRackCatalogueMatch({ brand: "Citadel Classic", name: "Castellan Green", paintClass: "Air" }, paints).name, "Castellan Green");
  assert.equal(citadel.findPaintRackCatalogueMatch({ brand: "The Army Painter", name: "Ivory White" }, paints).name, "Ivory White");
  assert.equal(citadel.findPaintRackCatalogueMatch({ brand: "AK Interactive", sku: "AK11002", name: "Off White" }, paints).hex, "#F0EDE0");
  assert.equal(citadel.findPaintRackCatalogueMatch({ brand: "Vallejo", name: "Castellan Green" }, paints), null);
});

test("Citadel Contrast and Shade paints match PaintRack rows by product code", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const raw = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "paint-catalogue.json"), "utf8"));
  const paints = citadel.normalizeCitadelPaints(raw);
  const match = (sku, name, paintClass = "Contrast") => {
    const paint = citadel.findPaintRackCatalogueMatch({ brand: "Citadel", sku, name, paintClass }, paints);
    return paint && paint.name;
  };
  assert.equal(match("29-44", "Garaghak's Sewer"), "Garaghak's Sewer");
  assert.equal(match("29-57", "Frostheart"), "Frostheart");
  assert.equal(match("29-54", "Imperial Fist"), "Imperial Fist");
  assert.equal(match("24-18", "Casandora Yellow", "Shade"), "Casandora Yellow");
  assert.equal(match("29-59", "Asurmen Blue"), "Asurmen Blue");

  const casandora = paints.find(paint => paint.name === "Casandora Yellow" && paint.previous);
  assert.deepEqual(casandora.previous, [{ name: "Cassandora Yellow", hex: "#F5CC92" }]);
  const codes = paints.filter(paint => paint.manufacturer === "Citadel Colours" && /^2[49]-\d\d$/.test(paint.manufacturerCode));
  assert.ok(codes.length >= 75, `only ${codes.length} coded Contrast/Shade paints`);
});

test("colour distance is CIEDE2000 (reference pairs from Sharma et al.)", () => {
  const pairs = [
    [[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425],
    [[50, 0, 0], [50, -1, 2], 2.3669],
    [[50, 2.5, 0], [73, 25, -18], 27.1492],
    [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644]
  ];
  pairs.forEach(([a, b, expected]) => assert.ok(Math.abs(citadel.deltaE2000(a, b) - expected) < 1e-4));
  assert.equal(citadel.colorDistance("#556229", "#556229"), 0);
  assert.ok(citadel.colorDistance("#69A05A", "#6EAC56") < 5, "two greens are close");
  assert.ok(citadel.colorDistance("#69A05A", "#B94278") > 50, "green and pink are far apart");
});

test("PaintRack rows without code prefer the brush pot over primer sprays", () => {
  const paints = [
    { name: "Goblin Green", manufacturer: "Army Painter", collection: "Warpaints Primer", finish: "primer", type: "primer", hex: "#1E8430" },
    { name: "Goblin Green", manufacturer: "Army Painter", collection: "Warpaints Air", finish: "opaque", hex: "#528536" },
    { name: "Goblin Green", manufacturer: "Army Painter", collection: "Warpaints", finish: "opaque", hex: "#338E46" }
  ];

  assert.equal(citadel.findPaintRackCatalogueMatch({ brand: "The Army Painter", name: "Goblin Green" }, paints).collection, "Warpaints");
  assert.equal(citadel.findPaintRackCatalogueMatch({ brand: "The Army Painter", name: "Goblin Green", paintClass: "Colour Primer" }, paints).collection, "Warpaints Primer");
  assert.equal(citadel.findPaintRackCatalogueMatch({ brand: "The Army Painter", name: "Goblin Green", paintClass: "Air" }, paints).collection, "Warpaints Air");
});
