#!/usr/bin/env node
"use strict";

// Updates data/paint-catalogue.json from Paintdex, an open, community-maintained paint
// database (MIT): https://github.com/s10-steve/paintdex
//
//   node scripts/update-catalogue.js                 # download from GitHub
//   node scripts/update-catalogue.js --source ./dir  # use a local data/paints folder
//   node scripts/update-catalogue.js --brands vallejo,warhammer  # only some brands
//   node scripts/update-catalogue.js --dry-run       # only print the summary
//
// Existing catalogue entries keep their name, hex, collection and range, because the
// app identifies owned paints and shopping lists by those fields. They only gain a
// manufacturer code (used by the PaintRack import) and a type when these are missing.
// Paints the catalogue does not have yet are added.

const fs = require("node:fs");
const path = require("node:path");

const RAW_BASE = "https://raw.githubusercontent.com/s10-steve/paintdex/main/data/paints";
const SOURCE_URL = "https://github.com/s10-steve/paintdex";
const CATALOGUE = path.join(__dirname, "..", "data", "paint-catalogue.json");

// Paintdex file -> manufacturer name used in the catalogue.
const BRANDS = {
  "warhammer.json": "Citadel Colours",
  "vallejo.json": "Vallejo",
  "army-painter.json": "Army Painter",
  "ak-interactive.json": "AK Interactive",
  "liquitex.json": "Liquitex",
  "scale-75.json": "Scale 75",
  "mig.json": "AMMO by Mig",
  "p3.json": "P3",
  "green-stuff-world.json": "Green Stuff World",
  "duncan-rhodes.json": "Duncan Rhodes",
  "tamiya.json": "Tamiya"
};
const DEFAULT_BRANDS = Object.keys(BRANDS);
const GENERIC_LINES = new Set(["", "acrylic", "metallic", "confirmed"]);
const SECONDARY_LINE = /air|spray|primer|foundation|old formula|wash/i;

async function main(argv) {
  const options = parseArgs(argv);
  const catalogue = JSON.parse(fs.readFileSync(options.catalogue, "utf8"));
  const files = options.brands === "all" ? Object.keys(BRANDS) : options.brands;
  const summary = [];

  for (const file of files) {
    if (!BRANDS[file]) {
      throw new Error(`Unbekannte Marke ${file}. Bekannt: ${Object.keys(BRANDS).join(", ")}`);
    }
    const records = await loadRecords(options.source, file);
    summary.push(mergeBrand(catalogue, BRANDS[file], records));
  }

  catalogue.manufacturers.sort((a, b) => a.name.localeCompare(b.name));
  catalogue.manufacturers.forEach(manufacturer => {
    manufacturer.colors.sort((a, b) => a.name.localeCompare(b.name) || String(a.collection || "").localeCompare(String(b.collection || "")));
  });

  summary.forEach(line => console.log(
    `${line.brand.padEnd(18)} ${String(line.total).padStart(5)} Farben  +${line.added} neu  ${line.enriched} ergänzt  ${line.skipped} übersprungen`
  ));
  const changed = summary.some(line => line.added || line.enriched);
  if (options.dryRun) {
    console.log("Probelauf – nichts geschrieben.");
  } else if (changed) {
    fs.writeFileSync(options.catalogue, `${JSON.stringify(catalogue, null, 2)}\n`);
    console.log(`Geschrieben: ${path.relative(process.cwd(), options.catalogue)}`);
  } else {
    console.log("Keine Änderungen.");
  }
  return changed;
}

function mergeBrand(catalogue, brand, records) {
  let manufacturer = catalogue.manufacturers.find(entry => entry.name === brand);
  if (!manufacturer) {
    manufacturer = { name: brand, source_urls: [], colors: [] };
    catalogue.manufacturers.push(manufacturer);
  }
  manufacturer.source_urls = Array.isArray(manufacturer.source_urls) ? manufacturer.source_urls : [];
  if (!manufacturer.source_urls.includes(SOURCE_URL)) {
    manufacturer.source_urls.push(SOURCE_URL);
  }

  const byName = new Map();
  manufacturer.colors.forEach(color => {
    const key = normalize(color.name);
    byName.set(key, (byName.get(key) || []).concat(color));
  });
  const claimed = new Set();
  const counts = { brand, total: 0, added: 0, enriched: 0, skipped: 0 };
  // For a name sold in several lines (e.g. Base and Air), an existing entry without
  // line information belongs to the main line, not to the airbrush/spray version.
  const primaryRecord = new Map();
  records.forEach(record => {
    const key = normalize(record.name);
    const current = primaryRecord.get(key);
    if (!current || (SECONDARY_LINE.test(current.range || "") && !SECONDARY_LINE.test(record.range || ""))) {
      primaryRecord.set(key, record);
    }
  });

  const valid = records.filter(record => {
    const ok = record.name && /^#[0-9A-F]{6}$/.test(String(record.hex || "").trim().toUpperCase());
    counts.skipped += ok ? 0 : 1;
    return ok;
  });
  const unclaimed = record => (byName.get(normalize(record.name)) || []).filter(color => !claimed.has(color));
  const pairs = new Map();

  // Pass 1: same name and exactly the same product line.
  valid.forEach(record => {
    const line = normalize(record.range);
    const match = unclaimed(record).find(color => line && (normalize(color.collection) === line || normalize(color.finish) === line));
    if (match) {
      claimed.add(match);
      pairs.set(record, match);
    }
  });
  // Pass 2: similar line ("Game Air" ~ finish "air"), or an entry without line
  // information for the main line of that name.
  valid.forEach(record => {
    if (pairs.has(record)) {
      return;
    }
    const candidates = unclaimed(record);
    const match = candidates.find(color => sameLine(color, record.range))
      || (candidates.length === 1 && primaryRecord.get(normalize(record.name)) === record && isGeneric(candidates[0])
        ? candidates[0]
        : null);
    if (match) {
      claimed.add(match);
      pairs.set(record, match);
    }
  });

  for (const record of valid) {
    const hex = String(record.hex).trim().toUpperCase();
    const existing = pairs.get(record);
    if (existing) {
      let changed = false;
      if (record.code && !existing.manufacturer_code) {
        existing.manufacturer_code = String(record.code);
        changed = true;
      }
      if (!existing.type) {
        existing.type = paintType(record);
        changed = true;
      }
      if (record.discontinued && !existing.discontinued) {
        existing.discontinued = true;
        changed = true;
      }
      counts.enriched += changed ? 1 : 0;
      continue;
    }

    const color = {
      name: String(record.name).trim(),
      hex,
      collection: String(record.range || "").trim(),
      finish: record.metallic ? "metallic" : String(record.type || "").trim(),
      type: paintType(record),
      status: record.discontinued ? "discontinued" : "community",
      source_url: SOURCE_URL
    };
    if (record.code) {
      color.manufacturer_code = String(record.code);
    }
    if (record.discontinued) {
      color.discontinued = true;
    }
    manufacturer.colors.push(color);
    claimed.add(color);
    counts.added += 1;
  }
  counts.total = manufacturer.colors.length;
  return counts;
}

function isGeneric(color) {
  return !normalize(color.collection) && GENERIC_LINES.has(normalize(color.finish));
}

// "Game Air" ~ finish "air", "Base" ~ finish "base", "Model Color" ~ collection "Model Color".
function sameLine(color, range) {
  const line = normalize(range);
  const own = [normalize(color.collection), normalize(color.finish)].filter(Boolean);
  if (!line) {
    return own.length === 0;
  }
  return own.some(value => value === line || (value.length > 2 && line.endsWith(value)));
}

function paintType(record) {
  return record.metallic ? `${record.type || "opaque"}-metallic` : String(record.type || "opaque");
}

function normalize(value) {
  return String(value || "").normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

async function loadRecords(source, file) {
  if (source) {
    return JSON.parse(fs.readFileSync(path.join(source, file), "utf8"));
  }
  const response = await fetch(`${RAW_BASE}/${file}`);
  if (!response.ok) {
    throw new Error(`Download von ${file} fehlgeschlagen: HTTP ${response.status}`);
  }
  return response.json();
}

function parseArgs(argv) {
  const options = { source: "", brands: DEFAULT_BRANDS, dryRun: false, catalogue: CATALOGUE };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--source") {
      options.source = argv[++i];
    } else if (arg === "--brands") {
      const value = argv[++i];
      options.brands = value === "all" ? "all" : value.split(",").map(name => name.trim().replace(/(\.json)?$/, ".json"));
    } else if (arg === "--catalogue") {
      options.catalogue = path.resolve(argv[++i]);
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else {
      throw new Error(`Unbekannte Option ${arg}`);
    }
  }
  return options;
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { main, mergeBrand, sameLine };
