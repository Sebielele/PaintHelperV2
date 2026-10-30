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

  return {
    FIGURE_ZONES,
    ZONE_BY_AREA,
    zoneForArea,
    areaKeysInText,
    figureZonesForText
  };
}));
