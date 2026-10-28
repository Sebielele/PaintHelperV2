(function (root, factory) {
  const api = factory();
  root.WPH = Object.assign(root.WPH || {}, api);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function cleanText(value, maxLength) {
    return String(value || "").replace(/[\u0000-\u001f\u007f]+/g, " ").trim().slice(0, maxLength);
  }

  function validNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function sanitizeCustomScheme(scheme, roleCodes) {
    const codes = Array.isArray(roleCodes) ? roleCodes : [];
    if (!scheme || typeof scheme !== "object" || !/^custom-[a-z0-9-]{1,40}$/.test(String(scheme.id || ""))) {
      return null;
    }
    const roles = (Array.isArray(scheme.roles) ? scheme.roles : [])
      .map(role => {
        const hex = String(role && role.hex || "").trim().toUpperCase();
        return codes.includes(role && role.code) && /^#[0-9A-F]{6}$/.test(hex)
          ? { code: role.code, name: cleanText(role.name, 60), hex }
          : null;
      })
      .filter(Boolean)
      .slice(0, codes.length);
    if (!roles.length) {
      return null;
    }
    return {
      id: scheme.id,
      name: cleanText(scheme.name, 60) || "Palette",
      source: ["ai", "photo"].includes(scheme.source) ? scheme.source : "ai",
      prompt: cleanText(scheme.prompt, 400),
      notes: cleanText(scheme.notes, 1200),
      paintEquivalents: cleanText(scheme.paintEquivalents, 1200),
      createdAt: typeof scheme.createdAt === "string" ? scheme.createdAt.slice(0, 40) : "",
      rating: scheme.rating > 0 ? 1 : scheme.rating < 0 ? -1 : 0,
      roles
    };
  }

  function sharedSchemeId(shared) {
    const source = shared && typeof shared === "object" ? shared : {};
    const roles = Array.isArray(source.roles) ? source.roles : [];
    const fingerprint = roles.map(role => `${role && role.code}${role && role.hex}`).join("") + String(source.name || "");
    let hash = 5381;
    for (let i = 0; i < fingerprint.length; i += 1) {
      hash = ((hash * 33) ^ fingerprint.charCodeAt(i)) >>> 0;
    }
    return `custom-s${hash.toString(36)}`;
  }

  function sanitizePaintRackCustomPaint(paint) {
    if (!paint || typeof paint !== "object") {
      return null;
    }
    const name = String(paint.name || "").trim();
    const manufacturer = String(paint.manufacturer || "").trim();
    if (!name || !manufacturer) {
      return null;
    }
    return {
      id: String(paint.id || ""),
      name,
      hex: null,
      range: String(paint.range || ""),
      finish: "",
      manufacturer,
      collection: String(paint.collection || ""),
      status: "paintRack",
      sourceUrl: "",
      notes: String(paint.notes || "Imported from PaintRack CSV; no catalogue colour value."),
      manufacturerCode: String(paint.manufacturerCode || ""),
      paintRackImport: true,
      count: validNumber(paint.count) ? paint.count : 1
    };
  }

  function normalizeFlags(value, defaults) {
    const source = defaults && typeof defaults === "object" ? defaults : {};
    const result = { ...source };
    if (!value || typeof value !== "object") {
      return result;
    }
    Object.keys(source).forEach(key => {
      result[key] = Boolean(value[key]);
    });
    return result;
  }

  function hslFromHexParam(value, deps) {
    if (!value) {
      return null;
    }
    const hex = value.startsWith("#") ? value : `#${value}`;
    const rgb = deps.hexToRgb(hex);
    return rgb ? deps.rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  }

  function setStringSetting(target, key, value) {
    if (typeof value === "string" && value) {
      target[key] = value;
    }
  }

  function settingsFromParams(params, deps) {
    if (!params.has("wph") && !params.has("hex")) {
      return null;
    }

    const snapshot = {};
    try {
      snapshot.paletteEdits = deps.normalizePaletteEdits(JSON.parse(params.get("palette") || "null"));
    } catch (error) {
      snapshot.paletteEdits = null;
    }
    const primary = hslFromHexParam(params.get("hex"), deps);
    const secondary = hslFromHexParam(params.get("shex"), deps);
    if (primary) {
      snapshot.h = primary.h;
      snapshot.s = primary.s;
      snapshot.l = primary.l;
    }
    if (secondary) {
      snapshot.secondary = secondary;
    }
    setStringSetting(snapshot, "language", params.get("lang"));
    setStringSetting(snapshot, "system", params.get("system"));
    setStringSetting(snapshot, "mode", params.get("mode"));
    setStringSetting(snapshot, "factionSchemeId", params.get("faction"));
    try {
      const shared = JSON.parse(params.get("custom") || "null");
      if (shared && typeof shared === "object") {
        snapshot.sharedCustomScheme = shared;
      }
    } catch (error) {
      snapshot.sharedCustomScheme = null;
    }
    setStringSetting(snapshot, "activeColor", params.get("active"));
    setStringSetting(snapshot, "heraldicLayout", params.get("layout"));
    setStringSetting(snapshot, "heraldicRatio", params.get("ratio"));
    setStringSetting(snapshot, "heraldicAccent", params.get("accent"));
    setStringSetting(snapshot, "schemeKey", params.get("scheme"));
    setStringSetting(snapshot, "roleProfileKey", params.get("role"));
    setStringSetting(snapshot, "baseThemeKey", params.get("base"));
    setStringSetting(snapshot, "recipeModeKey", params.get("recipe"));
    setStringSetting(snapshot, "paintSearch", params.get("search"));
    const style = Number(params.get("style"));
    if (Number.isFinite(style)) {
      snapshot.style = style;
    }
    const producers = params.get("producers");
    if (producers !== null) {
      snapshot.producerKeys = producers.split(",")
        .map(value => value.trim())
        .filter(Boolean);
    }
    return snapshot;
  }

  return {
    cleanText,
    validNumber,
    sanitizeCustomScheme,
    sharedSchemeId,
    sanitizePaintRackCustomPaint,
    normalizeFlags,
    hslFromHexParam,
    settingsFromParams
  };
}));
