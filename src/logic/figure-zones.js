// Figure zone mapping for painting guides.
(function (root, factory) {
  const api = factory();
  root.WPH = Object.assign(root.WPH || {}, api);
  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const FIGURE_ZONES = [
    "armor",
    "cloth",
    "skin",
    "leather",
    "metal",
    "weapon",
    "bone",
    "accent",
    "base"
  ];

  const ZONE_BY_AREA = {
    dominantSurface: "armor", plateArmor: "armor", darkArmorMutation: "armor", powerArmorFatigues: "armor",
    chapterArmor: "armor", pauldronsKnees: "armor", armorPlates: "armor", traitorArmor: "armor",
    carapaceArmor: "armor", hullArmor: "armor",
    secondarySurface: "cloth", clothAndShield: "cloth", tornCloth: "cloth", warPaintCloth: "cloth",
    cloakShieldFur: "cloth", robeMantle: "cloth", innerRobe: "cloth", parchmentTrim: "cloth",
    secondaryPanels: "cloth", fatiguesCoat: "cloth", clothPanels: "cloth", panelsMarkings: "cloth",
    skinScalesArmor: "skin", skinFurScales: "skin", bellyWingsPlates: "skin", fleshSkin: "skin", tongueSacs: "skin",
    leatherStraps: "leather", leatherScraps: "leather", hidesFurs: "leather", leatherTrophies: "leather",
    saddleStraps: "leather", pouchesStraps: "leather",
    metalDetails: "metal", insignia: "metal", agedMetal: "metal", roughMetal: "metal", brassTrim: "metal",
    jewelry: "metal", chainsArmor: "metal", gunmetal: "metal", aquilaTrim: "metal", trimMutations: "metal",
    smoothMetal: "metal", exhaustDamage: "metal",
    woodWeapons: "weapon", weapon: "weapon", clubsShafts: "weapon", staffWood: "weapon", weaponCasing: "weapon",
    bioWeapons: "weapon",
    boneGhostRobe: "bone", bonesTrophies: "bone", clawsHornsTeeth: "bone", boneTrophies: "bone", boneClaws: "bone",
    focusAccent: "accent", magicEyes: "accent", etherealGlow: "accent", glyphFocus: "accent", daemonicFocus: "accent",
    spellEffect: "accent", eyesMouthMagic: "accent", lensesPlasma: "accent", companyMarkings: "accent",
    unitMarkings: "accent", warpGlow: "accent", alienEnergy: "accent",
    baseDetails: "base", graveBase: "base", dustyBase: "base", mysticBase: "base", naturalBase: "base",
    battlefieldBase: "base", alienBase: "base", ashWasteBase: "base"
  };

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .split(",")
      .map(part => part.trim())
      .filter(Boolean)
      .join("|");
  }

  function zoneForArea(key) {
    return ZONE_BY_AREA[key] || "";
  }

  function areaKeysInText(text, translations) {
    if (!text || !translations || typeof translations !== "object") {
      return [];
    }

    const source = String(text);
    const colon = source.indexOf(":");
    const part = colon >= 0 ? source.slice(colon + 1) : source;
    let rest = `|${normalize(part)}|`;

    const entries = [];
    Object.keys(translations).forEach(language => {
      const roleAreas = translations[language] && translations[language].roleAreas;
      if (!roleAreas || typeof roleAreas !== "object") {
        return;
      }

      Object.keys(roleAreas).forEach(key => {
        const normalized = normalize(roleAreas[key]);
        if (normalized) {
          entries.push({ key, needle: `|${normalized}|` });
        }
      });
    });

    entries.sort((a, b) => b.needle.length - a.needle.length);

    const result = [];
    const seen = new Set();
    entries.forEach(entry => {
      if (rest.includes(entry.needle)) {
        if (!seen.has(entry.key)) {
          result.push(entry.key);
          seen.add(entry.key);
        }
        rest = rest.split(entry.needle).join("|");
      }
    });

    return result;
  }

  function figureZonesForText(text, translations) {
    const keys = areaKeysInText(text, translations);
    const zones = [];
    const seen = new Set();

    FIGURE_ZONES.forEach(zone => {
      const matched = keys.some(key => zoneForArea(key) === zone);
      if (matched && !seen.has(zone)) {
        zones.push(zone);
        seen.add(zone);
      }
    });

    return zones;
  }

  // Figure types selected from unit keywords.
  const FIGURE_TYPES = ["infantry", "cavalry", "monster"];

  // Painting step kinds recognised in step labels.
  const STEP_KIND_BY_KEY = {
    edgeHighlight: "highlight",
    fineHighlight: "highlight",
    quickHighlight: "highlight",
    focusLight: "highlight",
    zenithalDrybrush: "highlight",
    deepShade: "shade",
    shadeWash: "shade"
  };

  function stepKindForText(text, translations) {
    if (!text || !translations || typeof translations !== "object") {
      return "";
    }

    const source = String(text);
    const colon = source.indexOf(":");
    if (colon < 0) {
      return "";
    }

    const prefix = source.slice(0, colon).trim().toLowerCase();
    if (!prefix) {
      return "";
    }

    let kind = "";
    Object.keys(translations).some(language => {
      const steps = translations[language] && translations[language].ladder && translations[language].ladder.steps;
      if (!steps || typeof steps !== "object") {
        return false;
      }

      return Object.keys(steps).some(key => {
        const label = String(steps[key] || "").trim().toLowerCase();
        if (label === prefix) {
          kind = STEP_KIND_BY_KEY[key] || "";
          return Boolean(kind);
        }
        return false;
      });
    });

    return kind;
  }

  // Compute shaded tones for a zone from its base colour.
  function zoneTones(hex, core) {
    const rgb = core && core.hexToRgb ? core.hexToRgb(hex) : null;
    if (!rgb) {
      return null;
    }
    const hsl = core.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const ladder = core.ladderForColor({ hex, h: hsl.h, s: hsl.s, l: hsl.l }, 0, "battle");
    const pick = key => (ladder.find(step => step.key === key) || {}).hex || hex;
    return { highlight: pick("edgeHighlight"), layer: pick("layer"), base: hex, shade: pick("shadeWash") };
  }

  // Choose the figure silhouette from unit keywords.
  function figureForKeywords(keywords) {
    const words = (Array.isArray(keywords) ? keywords : []).map(word => String(word).toUpperCase());
    if (words.includes("MONSTER") || words.includes("BEAST")) {
      return "monster";
    }
    if (words.includes("CAVALRY") || words.includes("WAR MACHINE")) {
      return "cavalry";
    }
    return "infantry";
  }

  // Map GLB material or object names to painting zones.
  const PART_ZONE_KEYWORDS = [
    ["base", ["base", "sockel", "ground", "boden"]],
    ["weapon", ["weapon", "waffe", "sword", "schwert", "blade", "klinge", "axe", "axt", "spear", "speer", "lance", "lanze", "gun", "bow"]],
    ["metal", ["metal", "metall", "steel", "stahl", "iron", "eisen", "gold", "brass", "messing", "bronze", "silver", "silber", "trim", "chain", "kette"]],
    ["armor", ["armor", "armour", "rüstung", "ruestung", "plate", "platte", "helmet", "helm", "pauldron", "shield", "schild"]],
    ["cloth", ["cloth", "stoff", "cloak", "umhang", "cape", "robe", "tabard", "banner", "wing", "flügel", "fluegel"]],
    ["leather", ["leather", "leder", "strap", "riemen", "belt", "gürtel", "guertel", "boot", "stiefel", "pouch", "tasche", "saddle", "sattel", "fur", "fell"]],
    ["bone", ["bone", "knochen", "horn", "claw", "kralle", "tooth", "teeth", "zahn", "skull", "schädel", "schaedel"]],
    ["accent", ["gem", "juwel", "eye", "auge", "glow", "magic", "magie", "rune", "lens", "linse", "crystal", "kristall"]],
    ["skin", ["skin", "haut", "flesh", "fleisch", "face", "gesicht", "hand", "body", "körper", "koerper", "scale", "schuppe"]]
  ];

  function zoneForPartName(name) {
    const value = String(name || "").toLowerCase();
    if (!value) {
      return "";
    }
    for (const [zone, keywords] of PART_ZONE_KEYWORDS) {
      if (keywords.some(keyword => value.includes(keyword))) {
        return zone;
      }
    }
    return "";
  }

  return {
    FIGURE_ZONES,
    ZONE_BY_AREA,
    zoneForArea,
    areaKeysInText,
    figureZonesForText,
    FIGURE_TYPES,
    stepKindForText,
    zoneTones,
    figureForKeywords,
    zoneForPartName
  };
}));
