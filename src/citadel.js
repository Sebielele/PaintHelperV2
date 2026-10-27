(function (root, factory) {
  const api = factory();
  root.WPH = Object.assign(root.WPH || {}, api);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const DEFAULT_CITADEL_PAINTS = [
    { name: "Abaddon Black", hex: "#111111", range: "Base" },
    { name: "White Scar", hex: "#F5F7F2", range: "Layer" },
    { name: "Mephiston Red", hex: "#A31C22", range: "Base" },
    { name: "Caledor Sky", hex: "#245B9E", range: "Base" },
    { name: "Macragge Blue", hex: "#1F3F85", range: "Base" },
    { name: "Warpstone Glow", hex: "#168A45", range: "Layer" },
    { name: "Averland Sunset", hex: "#F2B233", range: "Base" },
    { name: "Leadbelcher", hex: "#6D7378", range: "Base" },
    { name: "Retributor Armour", hex: "#C99635", range: "Base" },
    { name: "Rakarth Flesh", hex: "#B9AE92", range: "Base" },
    { name: "XV-88", hex: "#8C5A2B", range: "Base" },
    { name: "Naggaroth Night", hex: "#3E275E", range: "Base" }
  ];
  const DEFAULT_PAINT_CATALOGUE = DEFAULT_CITADEL_PAINTS;

  function normalizeHex(hex) {
    const clean = String(hex || "").trim().replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) {
      return null;
    }
    return ("#" + clean).toUpperCase();
  }

  function hexToRgb(hex) {
    const normalized = normalizeHex(hex);
    if (!normalized) {
      return null;
    }
    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16)
    };
  }

  function collectCatalogueEntries(input) {
    if (Array.isArray(input)) {
      return input.map(paint => ({ paint }));
    }

    if (Array.isArray(input && input.manufacturers)) {
      return input.manufacturers.flatMap(manufacturer => {
        const colors = Array.isArray(manufacturer && manufacturer.colors) ? manufacturer.colors : [];
        return colors.map(paint => ({ paint, manufacturer }));
      });
    }

    const paints = Array.isArray(input && input.paints)
      ? input.paints
      : Array.isArray(input && input.colors)
        ? input.colors
        : [];

    return paints.map(paint => ({ paint }));
  }

  function normalizePaintEntry(paint, index, manufacturer) {
    if (!paint || typeof paint !== "object") {
      return null;
    }

    const hex = normalizeHex(paint.hex || paint.color || paint.colour || paint.rgbHex);
    if (!hex) {
      return null;
    }

    const manufacturerName = String(
      (manufacturer && manufacturer.name) || paint.manufacturer || paint.brand || ""
    );
    const name = String(paint.name || paint.paint || paint.label || `Paint ${index + 1}`);
    const manufacturerCode = paint.manufacturer_code || paint.manufacturerCode || paint.code || "";
    const id = paint.id || paint.slug || manufacturerCode || (manufacturerName ? `${manufacturerName}:${name}` : String(index));

    // Earlier name/hex of a corrected entry; the app moves saved keys over.
    const previous = (Array.isArray(paint.previous) ? paint.previous : [])
      .filter(item => item && typeof item === "object")
      .map(item => ({ name: item.name ? String(item.name) : "", hex: normalizeHex(item.hex) || "" }))
      .filter(item => item.name || item.hex);

    return {
      id: String(id),
      name,
      hex,
      range: paint.range || paint.type || paint.category || "",
      finish: paint.finish || paint.medium || "",
      manufacturer: manufacturerName,
      collection: paint.collection || paint.line || paint.series || "",
      status: paint.status || "",
      sourceUrl: paint.source_url || paint.sourceUrl || "",
      notes: paint.notes || "",
      manufacturerCode,
      ...(previous.length ? { previous } : {})
    };
  }

  function normalizeCitadelPaints(input) {
    return collectCatalogueEntries(input)
      .map((entry, index) => normalizePaintEntry(entry.paint, index, entry.manufacturer))
      .filter(Boolean);
  }

  function normalizePaintCatalogue(input) {
    return normalizeCitadelPaints(input);
  }

  function colorDistance(hexA, hexB) {
    return colorDistanceFromRgb(hexToRgb(hexA), hexB);
  }

  // Colour difference as the eye sees it: CIEDE2000 on CIE Lab (D65). Roughly: below 2
  // hardly visible, 2–5 a slightly different shade, above 10 a different colour.
  function colorDistanceFromRgb(targetRgb, hex) {
    const paintLab = hexToLab(hex);
    if (!targetRgb || !paintLab) {
      return Number.POSITIVE_INFINITY;
    }
    return deltaE2000(rgbToLab(targetRgb), paintLab);
  }

  const labCache = new Map();

  function hexToLab(hex) {
    const key = String(hex || "").toUpperCase();
    if (!labCache.has(key)) {
      const rgb = hexToRgb(key);
      labCache.set(key, rgb ? rgbToLab(rgb) : null);
    }
    return labCache.get(key);
  }

  function rgbToLab({ r, g, b }) {
    const lin = value => {
      const c = value / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const R = lin(r);
    const G = lin(g);
    const B = lin(b);
    const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047;
    const y = R * 0.2126 + G * 0.7152 + B * 0.0722;
    const z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
    const f = value => (value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116);
    return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
  }

  function deltaE2000([L1, a1, b1], [L2, a2, b2]) {
    const rad = Math.PI / 180;
    const C1 = Math.hypot(a1, b1);
    const C2 = Math.hypot(a2, b2);
    const Cm = (C1 + C2) / 2;
    const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
    const a1p = a1 * (1 + G);
    const a2p = a2 * (1 + G);
    const C1p = Math.hypot(a1p, b1);
    const C2p = Math.hypot(a2p, b2);
    const hue = (b, a) => {
      if (b === 0 && a === 0) {
        return 0;
      }
      const angle = Math.atan2(b, a) / rad;
      return angle >= 0 ? angle : angle + 360;
    };
    const h1p = hue(b1, a1p);
    const h2p = hue(b2, a2p);
    const dLp = L2 - L1;
    const dCp = C2p - C1p;
    let dhp = 0;
    if (C1p * C2p !== 0) {
      dhp = h2p - h1p;
      if (dhp > 180) {
        dhp -= 360;
      } else if (dhp < -180) {
        dhp += 360;
      }
    }
    const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * rad);
    const Lpm = (L1 + L2) / 2;
    const Cpm = (C1p + C2p) / 2;
    let hpm = h1p + h2p;
    if (C1p * C2p !== 0) {
      if (Math.abs(h1p - h2p) > 180) {
        hpm += h1p + h2p < 360 ? 360 : -360;
      }
      hpm /= 2;
    }
    const T = 1 - 0.17 * Math.cos((hpm - 30) * rad) + 0.24 * Math.cos(2 * hpm * rad)
      + 0.32 * Math.cos((3 * hpm + 6) * rad) - 0.2 * Math.cos((4 * hpm - 63) * rad);
    const dTheta = 30 * Math.exp(-(((hpm - 275) / 25) ** 2));
    const Rc = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7));
    const Sl = 1 + (0.015 * (Lpm - 50) ** 2) / Math.sqrt(20 + (Lpm - 50) ** 2);
    const Sc = 1 + 0.045 * Cpm;
    const Sh = 1 + 0.015 * Cpm * T;
    const Rt = -Math.sin(2 * dTheta * rad) * Rc;
    return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh));
  }

  function closestNormalizedPaints(hex, normalizedPaints, limit) {
    const max = Math.max(1, Number(limit) || 3);
    const targetRgb = hexToRgb(hex);
    const targetLab = targetRgb ? rgbToLab(targetRgb) : null;
    const closest = [];

    normalizedPaints.forEach(paint => {
      const paintLab = targetLab ? hexToLab(paint.hex) : null;
      const distance = paintLab ? Math.round(deltaE2000(targetLab, paintLab) * 10) / 10 : Number.POSITIVE_INFINITY;
      // Only candidates that make the list are copied (5,400 paints per lookup).
      if (closest.length < max || distance < closest[closest.length - 1].distance) {
        insertClosestPaint(closest, { ...paint, distance }, max);
      }
    });

    return closest;
  }

  function insertClosestPaint(closest, candidate, max) {
    const insertIndex = closest.findIndex(paint => candidate.distance < paint.distance);
    if (insertIndex === -1) {
      if (closest.length < max) {
        closest.push(candidate);
      }
      return;
    }

    closest.splice(insertIndex, 0, candidate);
    if (closest.length > max) {
      closest.pop();
    }
  }

  function findClosestPaints(hex, paints, limit) {
    return closestNormalizedPaints(hex, normalizeCitadelPaints(paints), limit);
  }

  function mapPaletteToCatalogue(palette, paints, options) {
    const limit = options && options.limit ? options.limit : 3;
    const normalized = normalizeCitadelPaints(paints);
    return (palette || []).map(color => ({
      ...color,
      matches: normalized.length ? closestNormalizedPaints(color.hex, normalized, limit) : []
    }));
  }

  function mapPaletteToCitadel(palette, paints, options) {
    return mapPaletteToCatalogue(palette, paints, options);
  }

  function filterOwnedPaints(paints, options) {
    const list = Array.isArray(paints) ? paints : [];
    if (!options || !options.onlyOwnedMatches) {
      return list;
    }

    const ownedPaintKeys = options.ownedPaintKeys instanceof Set
      ? options.ownedPaintKeys
      : new Set(Array.isArray(options.ownedPaintKeys) ? options.ownedPaintKeys : []);
    const paintKey = typeof options.paintKey === "function" ? options.paintKey : paint => String(paint && paint.id || "");
    return list.filter(paint => ownedPaintKeys.has(paintKey(paint)));
  }

  function parsePaintRackCsv(csvText) {
    const records = parseCsvRecords(csvText);
    const invalid = [];
    if (!records.length) {
      return { paints: [], invalid: [{ lineNumber: 0, reason: "empty" }] };
    }

    const headers = records[0].fields.map(normalizePaintRackHeader);
    const index = {
      brand: headers.indexOf("brand"),
      sku: headers.indexOf("sku"),
      name: headers.indexOf("paintname"),
      paintClass: headers.indexOf("paintclass"),
      size: headers.indexOf("size"),
      count: headers.indexOf("count")
    };
    const required = ["brand", "sku", "name", "paintClass", "count"];
    const missing = required.filter(key => index[key] === -1);
    if (missing.length) {
      return {
        paints: [],
        invalid: [{
          lineNumber: records[0].lineNumber,
          reason: `missing columns: ${missing.join(", ")}`
        }]
      };
    }

    const paints = [];
    records.slice(1).forEach(record => {
      if (record.fields.every(field => !String(field || "").trim())) {
        return;
      }
      const row = {
        brand: cleanCsvValue(record.fields[index.brand]),
        sku: cleanCsvValue(record.fields[index.sku]),
        name: cleanCsvValue(record.fields[index.name]),
        paintClass: cleanCsvValue(record.fields[index.paintClass]),
        size: index.size === -1 ? "" : cleanCsvValue(record.fields[index.size]),
        count: parsePaintRackCount(record.fields[index.count]),
        lineNumber: record.lineNumber
      };
      // Many PaintRack rows (e.g. Army Painter metallics) have no SKU; brand + name is enough.
      if (!row.brand || !row.name) {
        invalid.push({ lineNumber: row.lineNumber, reason: "missing paint identity", row });
        return;
      }
      if (!Number.isFinite(row.count) || row.count <= 0) {
        invalid.push({ lineNumber: row.lineNumber, reason: "count is zero or invalid", row });
        return;
      }
      paints.push(row);
    });

    return { paints, invalid };
  }

  function parseCsvRecords(csvText) {
    const text = String(csvText || "").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const records = [];
    let fields = [];
    let field = "";
    let quoted = false;
    let lineNumber = 1;
    let recordLineNumber = 1;

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      if (quoted) {
        if (char === "\"" && text[index + 1] === "\"") {
          field += "\"";
          index += 1;
        } else if (char === "\"") {
          quoted = false;
        } else {
          field += char;
          if (char === "\n") {
            lineNumber += 1;
          }
        }
        continue;
      }

      if (char === "\"") {
        quoted = true;
      } else if (char === ",") {
        fields.push(field);
        field = "";
      } else if (char === "\n") {
        fields.push(field);
        records.push({ fields, lineNumber: recordLineNumber });
        fields = [];
        field = "";
        lineNumber += 1;
        recordLineNumber = lineNumber;
      } else {
        field += char;
      }
    }

    if (field || fields.length) {
      fields.push(field);
      records.push({ fields, lineNumber: recordLineNumber });
    }
    return records.filter(record => record.fields.some(fieldValue => String(fieldValue || "").trim()));
  }

  function findPaintRackCatalogueMatch(row, paints) {
    if (!row || !Array.isArray(paints)) {
      return null;
    }
    const brandKey = normalizePaintRackText(row.brand);
    const skuKey = normalizePaintRackSku(row.sku);
    const classKey = normalizePaintRackText(row.paintClass);
    const nameKeys = paintRackNameKeys(row.name);
    const sameBrand = paints.filter(paint => paintRackBrandMatches(brandKey, paint.manufacturer));

    if (skuKey) {
      const codeMatch = sameBrand.find(paint => normalizePaintRackSku(paint.manufacturerCode) === skuKey);
      if (codeMatch) {
        return codeMatch;
      }
    }

    const scored = sameBrand
      .map(paint => ({
        paint,
        score: paintRackMatchScore(paint, nameKeys, classKey)
      }))
      .filter(item => item.score >= 60)
      .sort((a, b) => b.score - a.score);

    return scored.length ? scored[0].paint : null;
  }

  function createPaintRackCustomPaint(row) {
    const brand = cleanCsvValue(row && row.brand);
    const sku = cleanCsvValue(row && row.sku);
    const name = cleanCsvValue(row && row.name) || "PaintRack paint";
    const paintClass = cleanCsvValue(row && row.paintClass);
    const size = cleanCsvValue(row && row.size);
    return {
      id: [
        "paintrack",
        normalizePaintRackSku(sku),
        normalizePaintRackText(brand),
        normalizePaintRackText(paintClass),
        normalizePaintRackText(name)
      ].filter(Boolean).join(":"),
      name,
      hex: null,
      range: size,
      finish: "",
      manufacturer: brand,
      collection: paintClass,
      status: "paintRack",
      sourceUrl: "",
      notes: "Imported from PaintRack CSV; no catalogue colour value.",
      manufacturerCode: sku,
      paintRackImport: true,
      count: Number.isFinite(row && row.count) ? row.count : 1
    };
  }

  function normalizePaintRackHeader(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function cleanCsvValue(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function parsePaintRackCount(value) {
    const count = Number(String(value || "").trim());
    return Number.isFinite(count) ? count : NaN;
  }

  function normalizePaintRackSku(value) {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function normalizePaintRackText(value) {
    return String(value || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]/g, "");
  }

  function paintRackNameKeys(name) {
    const parts = String(name || "").split("/").map(part => normalizePaintRackText(part)).filter(Boolean);
    const full = normalizePaintRackText(name);
    return Array.from(new Set(full ? [full, ...parts] : parts));
  }

  // Brand names differ between PaintRack, the catalogue and product generations.
  const PAINT_BRAND_ALIASES = {
    citadel: ["citadel", "citadelcolour", "citadelcolours", "citadelclassic", "warhammer", "gamesworkshop"],
    armypainter: ["armypainter", "thearmypainter"],
    akinteractive: ["ak", "akinteractive", "akinteractive3rdgen"],
    mig: ["mig", "ammo", "ammobymig", "ammobymigjimenez"],
    p3: ["p3", "formulap3", "privateerpress", "privateerpressp3"],
    scale75: ["scale75", "scalecolor", "scale75scalecolor"]
  };

  function canonicalPaintBrand(key) {
    const entry = Object.entries(PAINT_BRAND_ALIASES).find(([, aliases]) => aliases.includes(key));
    return entry ? entry[0] : key;
  }

  function paintRackBrandMatches(brandKey, manufacturer) {
    const manufacturerKey = canonicalPaintBrand(normalizePaintRackText(manufacturer));
    const rowKey = canonicalPaintBrand(brandKey);
    return Boolean(rowKey && manufacturerKey && (
      rowKey === manufacturerKey ||
      manufacturerKey.includes(rowKey) ||
      rowKey.includes(manufacturerKey)
    ));
  }

  function paintRackMatchScore(paint, nameKeys, classKey) {
    const paintName = normalizePaintRackText(paint && paint.name);
    const paintCollection = normalizePaintRackText(paint && paint.collection);
    let score = nameKeys.includes(paintName) ? 70 : 0;
    if (!score && nameKeys.some(key => key && (key.includes(paintName) || paintName.includes(key)))) {
      score = 55;
    }
    if (score && classKey && paintCollection === classKey) {
      score += 25;
    } else if (score && classKey && paintCollection && (paintCollection.includes(classKey) || classKey.includes(paintCollection))) {
      score += 10;
    }
    return score;
  }

  async function loadPaintCatalogue(url, fallbackPaints) {
    const fallback = normalizeCitadelPaints(fallbackPaints || DEFAULT_PAINT_CATALOGUE);
    if (typeof fetch !== "function") {
      return { paints: fallback, source: "sample" };
    }

    try {
      const response = await fetch(url || "data/paint-catalogue.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const paints = normalizeCitadelPaints(data);
      return paints.length
        ? { paints, source: "json" }
        : { paints: fallback, source: "sample" };
    } catch (error) {
      return { paints: fallback, source: "sample", error: error.message };
    }
  }

  function loadCitadelPaints(url, fallbackPaints) {
    return loadPaintCatalogue(url, fallbackPaints);
  }

  return {
    DEFAULT_CITADEL_PAINTS,
    DEFAULT_PAINT_CATALOGUE,
    normalizeHex,
    normalizeCitadelPaints,
    normalizePaintCatalogue,
    colorDistance,
    deltaE2000,
    filterOwnedPaints,
    parsePaintRackCsv,
    findPaintRackCatalogueMatch,
    createPaintRackCustomPaint,
    findClosestPaints,
    mapPaletteToCatalogue,
    mapPaletteToCitadel,
    loadPaintCatalogue,
    loadCitadelPaints
  };
}));
