// English texts for PaintHelperV2. Keep the same keys in all five language files
// (tests/i18n.test.js checks it); src/i18n.js turns them into the translator.
(function (root, factory) {
  const locale = factory();
  root.WPH_LOCALES = Object.assign(root.WPH_LOCALES || {}, { en: locale });
  if (typeof module !== "undefined" && module.exports) {
    module.exports = locale;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  return {
    appTitle: "Warhammer Paint Helper",
    ui: {
      workflow: "Workflow",
      stepPalette: "Palette",
      stepPlan: "Painting plan",
      stepPaints: "Paints & supplies",
      livePalette: "Your palette · live preview",
      nextPlan: "Plan your painting →",
      nextPaints: "Find your paints →",
      backPalette: "Back to palette",
      skipWorkspace: "Skip to workspace",
      language: "Language",
      system: "Game system",
      eyebrow: "Miniature Palette Tool",
      title: "Warhammer Paint Helper",
      subtitle: "Describe your army – the assistant builds the palette and a step-by-step guide with your paints. Track every model on the army page.",
      mode: "Palette mode",
      faction: "Faction",
      subfaction: "Subfaction / fixed scheme",
      activeColor: "Wheel edits",
      mainColor: "Main color",
      paintProducers: "Paint producers",
      unknownProducer: "Unknown producer",
      ownedPaints: "Owned colours",
      ownedPaintsDescription: "Tick the catalogue colours you own, then optionally limit closest matches to those paints.",
      collapseOwnedPaints: "Collapse",
      expandOwnedPaints: "Expand",
      onlyOwnedMatches: "Only show owned colours in closest matches",
      importPaintRackCsv: "Import PaintRack CSV",
      paintRackImportReportTitle: "PaintRack import",
      paintRackImportSummary: "{matched} catalogue colours marked owned. {custom} colours not in the catalogue kept as owned. {skipped} rows skipped.",
      paintRackMatched: "Catalogue matches ({count})",
      paintRackNotInCatalogue: "Not in catalogue ({count})",
      paintRackStoredOwned: "kept as owned",
      paintRackSkipped: "Skipped ({count})",
      paintRackMore: "...and {count} more",
      paintRackNone: "None.",
      paintRackLine: "Line {line}",
      paintRackNoColourData: "no catalogue colour data",
      paintRackImportReadFailed: "Could not read the CSV file.",
      close: "Close",
      ownedPaintsStatus: "{owned} owned colours selected. {visible} colours visible with the current filters.",
      ownedPaintsAllSelected: "All visible colours are selected.",
      ownedPaintsEmpty: "No catalogue colours match the current producer and search filters.",
      ownedBadge: "Owned",
      ownedBadgeLegend: "Owned badge = owned colour",
      shoppingList: "Shopping list",
      shoppingListDescription: "Add unowned colours from tooltips or search the catalogue, then remove them when no longer needed.",
      collapseShoppingList: "Collapse",
      expandShoppingList: "Expand",
      collapseSection: "Collapse",
      expandSection: "Expand",
      shoppingSearch: "Search colours to buy",
      shoppingAddColour: "Add colour",
      addShoppingPaint: "Add to list",
      addToShoppingList: "Add to shopping list",
      inShoppingList: "In shopping list",
      markShoppingPaintOwned: "Mark owned",
      removeShoppingPaint: "Remove",
      shoppingListStatus: "{count} colours on your shopping list.",
      shoppingListEmpty: "Your shopping list is empty.",
      shoppingSearchPlaceholder: "Select an unowned colour ({count})",
      shoppingSearchEmpty: "No unowned colours match the current search.",
      paintSearch: "Filter catalogue colours",
      paintSelect: "Choose main colour from catalogue",
      paintSelectPlaceholder: "Select a paint ({count})",
      paintSelectEmpty: "No paints match the current filters",
      hexInput: "Enter HEX color directly",
      scheme: "Color scheme",
      rolePlanner: "Role planner",
      baseEnvironment: "Base environment",
      saturation: "Saturation",
      lightness: "Lightness",
      finishStyle: "Finish style",
      grimdark: "Grimdark / weathered",
      clean: "Clean / vibrant",
      copyPalette: "Copy palette",
      copied: "Copied",
      randomColor: "Reroll unlocked colours",
      profileName: "Profile name",
      savedProfiles: "Saved profiles",
      saveProfile: "Save profile",
      loadProfile: "Load",
      deleteProfile: "Delete",
      copyShareLink: "Copy share link",
      profilePlaceholder: "Choose a profile",
      noProfiles: "No saved profiles yet",
      profileSaved: "Saved {name}.",
      profileLoaded: "Loaded {name}.",
      profileDeleted: "Deleted {name}.",
      shareLinkCopied: "Share link copied.",
      shareLinkCopyFailed: "Could not copy share link.",
      profileMissing: "Choose a saved profile first.",
      paintingNotes: "Painting notes",
      rolePlannerDescription: "Concrete assignments for surfaces, materials, focus accents, and base details.",
      baseAdviceDescription: "Base concepts with contrast logic, mood, material colors, and a short build recipe.",
      modelRoles: "Model roles",
      modelRolesDescription: "Short overview of the generated main colors.",
      paintLadderDescription: "Practical paint steps for shadows, basecoat, layers, edge highlights, and focus light.",
      citadelMatches: "Paint catalogue matches",
      why: "Why",
      build: "Build",
      debug: "Debug: main color {hex} | first palette card {firstHex} | HSL({h}, {s}%, {l}%) | finish {finish}",
      citadelJsonHint: "Source: data/paint-catalogue.json.",
      recipeMode: "Recipe mode",
      recipeTitle: "{system} {mode} recipe",
      controlStart: "Start",
      controlColor: "Color",
      controlPaletteRules: "Palette rules",
      controlPaintingPlan: "Painting plan",
      controlPaintLibrary: "Paint library",
      controlSaveShare: "Save / share",
      editPaletteColor: "Edit colour",
      lockPaletteColor: "Lock colour",
      paletteLocked: "Locked",
      paletteUnlocked: "Unlocked",
      rerollPalette: "Reroll unlocked colours",
      paletteLockHint: "Edit any colour and lock it to keep it. Changing the game system, palette mode, or scheme resets edits and locks."
    },
    systems: {
      aos: "Age of Sigmar",
      k40: "Warhammer 40,000"
    },
    modes: {
      single: "Single colour",
      heraldic: "Heraldic"
    },
    factionSchemes: {
      custom: "Custom colour wheel",
      chooseSubfaction: "Choose a subfaction scheme",
      noSubfactions: "No fixed schemes for this faction",
      customHint: "Choose a faction and subfaction to use a fixed scheme, or keep using the colour wheel.",
      missing: "No fixed faction schemes are loaded.",
      selectedMeta: "{faction} fixed scheme with {count} labelled colours.",
      description: "{faction}: {subfaction}, using the {scheme} fixed colour scheme.",
      defaultNote: "Use the labelled colours as the fixed faction recipe, then adjust finish and basing to taste.",
      paintEquivalents: "Paint equivalents",
      noPaintEquivalents: "No fixed paint equivalents listed"
    },
    heraldic: {
      title: "Heraldic two-colour",
      description: "{layout} layout with {ratio} balance, built from two coat-of-arms colours.",
      note: "Treat the field and charge colours as co-primaries. Keep the accent small, and shade white or pale colours through grey, ivory, or blue-grey rather than pure black.",
      primaryColor: "Field colour",
      secondaryColor: "Charge colour",
      secondaryHexInput: "Enter secondary HEX directly",
      layout: "Heraldry layout",
      ratio: "Colour balance",
      accent: "Heraldic accent",
      active: {
        primary: "Field colour",
        secondary: "Charge colour"
      },
      layouts: {
        split: "Split shield",
        quartered: "Quartered",
        diagonal: "Diagonal",
        stripe: "Central stripe",
        border: "Border and field"
      },
      ratios: {
        dominant: "70 / 30",
        balanced: "50 / 50",
        secondary: "40 / 60"
      },
      accents: {
        auto: "Auto",
        autoTrim: "Auto: trim",
        autoFocal: "Auto: focal detail",
        autoMetal: "Auto: heraldic metal",
        gold: "Gold",
        red: "Red",
        black: "Black",
        silver: "Silver",
        lens: "Lens / magic colour"
      }
    },
    systemCopy: {
      aos: {
        rolePlannerTitle: "AoS role planner",
        baseAdviceTitle: "AoS base environment suggestions",
        paintLadderTitle: "AoS Shade / Layer / Highlight",
        finishPrefix: "AoS finish"
      },
      k40: {
        rolePlannerTitle: "40K role planner",
        baseAdviceTitle: "40K battlefield base suggestions",
        paintLadderTitle: "40K Shade / Layer / Highlight",
        finishPrefix: "40K finish"
      }
    },
    finish: {
      grimdark: "Grimdark",
      weathered: "Weathered",
      balanced: "Balanced",
      clean: "Clean",
      vibrant: "Vibrant",
      summary: {
        grimdark: "Desaturates support colors, deepens shadows, and keeps the brightest points small.",
        weathered: "Mutes support colors slightly and favors dirtier shades with restrained highlights.",
        balanced: "Keeps the selected hue exact and leaves derived colors, recipes, and suggestions balanced.",
        clean: "Adds saturation and brighter layers for clean armor, cloth, and heraldry.",
        vibrant: "Pushes support colors and highlights toward high-contrast display readability."
      }
    },
    profiles: {
      aos: {
        balanced: "General Age of Sigmar model",
        stormcast: "Stormcast Eternals",
        death: "Death: Soulblight / Nighthaunt / Ossiarch",
        destruction: "Destruction: Orruks / Ogors / Gloomspite",
        chaos: "Chaos warband or daemon",
        wizard: "Wizard or magic-focus hero",
        beast: "Monster, mount, Seraphon, or beast"
      },
      k40: {
        balanced: "General 40K model",
        spaceMarines: "Space Marines / power armor",
        guard: "Astra Militarum / infantry",
        chaosMarines: "Chaos Space Marines",
        xenos: "Xenos infantry or elite",
        tyranids: "Tyranids / organic swarm",
        vehicle: "Vehicle, walker, or tank"
      }
    },
    baseOptions: {
      auto: "Auto: contrast + faction/profile"
    },
    schemes: {
      complementary: {
        title: "Complementary",
        desc: "Strong contrast: the main color plus its opposite for accents, lenses, runes, plasma, or weapon energy.",
        note: "Use the main color for most visible surfaces. The complementary color works best on focal points such as eyes, weapons, shields, heraldry, or energy effects."
      },
      split: {
        title: "Split-complementary",
        desc: "Contrast-rich, but easier to control than a pure complementary pair.",
        note: "Keep the main color dominant. The two split accents can separate cloth, banners, squad markings, or magical effects."
      },
      triadic: {
        title: "Triadic",
        desc: "Three evenly spaced colors for heroic models, banners, squads, and faction identity.",
        note: "Let one color lead, use the second for larger secondary surfaces, and reserve the third for details."
      },
      tetradic: {
        title: "Tetradic",
        desc: "Four colors in two complementary pairs. Powerful, but it needs clear color hierarchy.",
        note: "Use the extra colors for accents, base details, weapons, shields, banners, or squad markings."
      },
      limitedPalette: {
        title: "Limited palette",
        desc: "A deliberately small set of 3 to 5 main paints for cohesive armies and faster decisions.",
        note: "Repeat the same few colors across surfaces, materials, and bases so the model reads as one controlled scheme."
      },
      zorn: {
        title: "Zorn limited palette",
        desc: "A painterly restricted scheme inspired by ochre, muted red, ivory, and ivory-black mixes.",
        note: "Best with warm main colors. Use the red sparingly, push the near-black into cool shadows, and let ivory highlights tie flesh, leather, bone, cloth, and bases together."
      },
      highContrast: {
        title: "High-contrast scheme",
        desc: "Strong separation between darks and lights for display painting and tabletop readability.",
        note: "Push shadows deep and highlights bright, then keep the strongest accent near the face, weapon, magic, or lenses."
      },
      lowContrast: {
        title: "Low-contrast scheme",
        desc: "Muted, subtle differences for gritty, realistic, weathered, or stealthy models.",
        note: "Keep transitions close together and let texture, grime, chips, and material contrast do more of the work."
      },
      analogous: {
        title: "Analogous",
        desc: "Neighboring colors for a harmonious, organic, less aggressive scheme.",
        note: "Excellent for monsters, robes, spirits, forest themes, skin, scales, and naturalistic armies."
      },
      analogousWide: {
        title: "Wide analogous",
        desc: "Five related hues for soft transitions, monster skin, cloth layers, and large surfaces.",
        note: "The outer tones work well as glazes, shadows, or subtle edge variation."
      },
      monochrome: {
        title: "Monochromatic",
        desc: "One hue in several values for clean regiments, grimdark armor, or disciplined squads.",
        note: "Use the dark variant as shade, the main color as basecoat, and the lighter variants as layers and edge highlights."
      },
      zenithal: {
        title: "Zenithal / shade / highlight",
        desc: "A practical work palette: main color plus shadow, layer, and edge highlight.",
        note: "Use the cool shadow in recesses, the main color on surfaces, and the edge highlight only on sharp shapes."
      },
      accented: {
        title: "Analogous with accent",
        desc: "A calm base palette with a strong opposite accent for lenses, runes, plasma, or heraldry.",
        note: "The analogous colors carry the body. Keep the opposite accent small and bright."
      },
      compound: {
        title: "Compound / double split",
        desc: "Main color, a neighbor, and two opposing accents. Good for complex heroes.",
        note: "Works on character models with many materials. Keep the main color dominant."
      },
      warmCool: {
        title: "Warm-cool contrast",
        desc: "Warm and cool areas for high readability at tabletop distance.",
        note: "Separate warm and cool zones clearly, for example a warm robe against cold armor."
      },
      boxArt: {
        title: "Box art scheme",
        desc: "A clean studio-style palette inspired by official Games Workshop presentation schemes.",
        note: "Use crisp shadows, readable armour or cloth panels, a clear marking color, and a bright focal accent."
      },
      eavyMetal: {
        title: "'Eavy Metal style",
        desc: "Crisp, clean, high-contrast edge highlights close to the classic GW studio look.",
        note: "Keep blends tidy, panel lines dark, and edge highlights sharp, especially around faces, armour plates, and weapons."
      },
      grimdark: {
        title: "Muted / grimdark",
        desc: "Desaturated, darker variants with a controlled accent for dirty or realistic models.",
        note: "Washes, sponge chipping, pigments, and selective bright edges will matter more than large saturated areas."
      },
      blanchitsu: {
        title: "Blanchitsu",
        desc: "Weird, muted, sepia, gothic, painterly, and dirty, inspired by John Blanche's Warhammer art mood.",
        note: "Use dusty layers, stained shadows, restrained accents, freehand marks, weathering, and odd material contrasts."
      },
      comicBook: {
        title: "Comic-book style",
        desc: "Saturated colors, strong lining, and sharp contrast for a graphic illustrated miniature look.",
        note: "Separate shapes with dark lining, push highlights boldly, and keep the accent clean enough to read from distance."
      },
      military: {
        title: "Realistic military scheme",
        desc: "Khaki, olive, tan, grey, drab greens, weathering, and restrained saturation.",
        note: "Use muted surfaces, practical markings, dust, scratches, soot, and metals that look functional rather than decorative."
      },
      paradeReady: {
        title: "Parade-ready scheme",
        desc: "Clean, readable, polished army-painting standard with tidy highlights and clear colour placement.",
        note: "Keep surfaces neat, highlights consistent, and accents strong enough to identify units without becoming noisy."
      },
      battleReady: {
        title: "Battle-ready scheme",
        desc: "Simple tabletop standard: base colours, shade, and a small number of practical highlights.",
        note: "Prioritize blocked-in colour, controlled shade, clean bases, and one or two readable accents."
      },
      display: {
        title: "Display scheme",
        desc: "Advanced contrast and composition with refined shadows, highlights, and focal colour choices.",
        note: "Plan the brightest lights and strongest accents around the face, weapon, or story point of the miniature."
      },
      muted: {
        title: "Muted scheme",
        desc: "Desaturated colours for realistic, weathered, historical, or grimdark-inspired painting.",
        note: "Let surface texture and weathering carry interest while keeping chroma controlled across the whole model."
      },
      saturated: {
        title: "Saturated scheme",
        desc: "Bright, punchy colours with high visual impact for bold armies and heroic centrepieces.",
        note: "Balance the intensity by limiting where the brightest colors appear and keeping shadows readable."
      },
      pastel: {
        title: "Pastel scheme",
        desc: "Soft, pale colours for unusual, stylised, magical, ghostly, or elegant armies.",
        note: "Use gentle shadows and clean edges so the pale colors stay deliberate rather than unfinished."
      },
      neon: {
        title: "Neon scheme",
        desc: "Very bright accents for plasma, lenses, magic, cyberpunk effects, and supernatural glow.",
        note: "Keep the neon areas small and surround them with darker values so the glow feels intense."
      },
      realm: {
        title: "AoS realm contrast",
        desc: "Main color plus realm glow, supernatural accent, and a grounded shadow.",
        note: "Built for Age of Sigmar armies that need a realm mood without losing the miniature's main read."
      },
      chapter: {
        title: "40K chapter / squad scheme",
        desc: "Armor color, panel shade, company marking, and lens or plasma accent.",
        note: "Designed for 40K armor panels, helmets, shoulder pads, weapon casings, and squad identifiers."
      },
      adrianSmith: {
        title: "Adrian Smith atmosphere",
        desc: "A dark, serious illustrated-war palette with hard shadows, battered midtones, aged highlights, and one restrained accent.",
        note: "Push the model toward blackened armour, smoke-stained cloth, dirty metals, warm bone, and tiny aggressive focal details."
      },
      girlyPop: {
        title: "GirlyPop",
        desc: "Bubblegum pink, lilac, mint, blush and glitter gold, joined by a candy version of your main colour.",
        note: "Keep the colours clean and bright: smooth basecoats, soft pink or lilac shades instead of brown washes, and tiny gold or glitter details as jewellery."
      }
    },
    schemeRoles: {
      primary: "Main color",
      contrast: "Contrast color",
      leftAccent: "Left accent",
      rightAccent: "Right accent",
      secondary: "Secondary color",
      accent: "Accent color",
      shadow: "Shadow color",
      highlight: "Highlight color",
      darkNeighbor: "Dark neighbor",
      lightNeighbor: "Light neighbor",
      layer: "Layer color",
      deepShadow: "Deep shadow",
      edgeHighlight: "Edge highlight",
      basecoat: "Basecoat",
      coolShadow: "Cool shadow",
      warmLayer: "Warm layer",
      strongAccent: "Strong accent",
      neighbor: "Neighbor color",
      secondaryAccent: "Secondary accent",
      coolCounter: "Cool counter-color",
      coolAccent: "Cool accent",
      darkBase: "Dark base tone",
      dustyLayer: "Dusty layer",
      dirtyAccent: "Dirty accent",
      realmGlow: "Realm glow",
      realmAccent: "Realm accent",
      realmShadow: "Realm shadow",
      armor: "Armor color",
      panelShade: "Panel shade",
      companyMarking: "Company marking",
      lensAccent: "Lens accent",
      fieldColor: "Field colour",
      chargeColor: "Charge colour",
      fieldShadow: "Field shadow",
      chargeShade: "Charge shade",
      fieldHighlight: "Field highlight",
      chargeHighlight: "Charge highlight",
      heraldicAccent: "Heraldic accent",
      factionDominant: "Dominant colour",
      factionSecondary: "Secondary colour",
      factionDarkNeutral: "Near-dark neutral",
      factionLightNeutral: "Near-light neutral",
      factionAccentOne: "Accent 1",
      factionAccentTwo: "Accent 2",
      bubblegum: "Bubblegum pink",
      lilac: "Lilac",
      mint: "Mint",
      blush: "Blush",
      glitterGold: "Glitter gold"
    },
    placements: {
      dominant: "Dominant surface: armor, robe, skin, hull, fatigues, or main cloth.",
      secondary: "Secondary surface: shield, cloak, panel, shoulder pad, cloth, or alternate armor.",
      contrast: "Contrast area: heraldry, gems, weapon glow, runes, lenses, plasma, or champion details.",
      small: "Small accent: trim, squad marks, spell effects, purity seals, or base details."
    },
    roleAreas: {
      dominantSurface: "Armor, skin, robe, or main cloth",
      secondarySurface: "Cloth, shield, panel, or secondary armor",
      focusAccent: "Focus accent",
      leatherStraps: "Leather, straps, and pouches",
      woodWeapons: "Wood, spears, bows, and hafts",
      metalDetails: "Metal details",
      baseDetails: "Base and rim",
      plateArmor: "Plate armor",
      clothAndShield: "Cloth, shield, or heraldry",
      insignia: "Insignia and trim",
      weapon: "Weapon",
      magicEyes: "Magic, eyes, or gems",
      boneGhostRobe: "Bone, ghost skin, or robe",
      tornCloth: "Torn cloth or old armor",
      etherealGlow: "Ethereal glow",
      bonesTrophies: "Bones and trophies",
      agedMetal: "Aged metal",
      leatherScraps: "Leather scraps",
      graveBase: "Grave or cursed base",
      skinScalesArmor: "Skin, scales, or rough armor",
      warPaintCloth: "War paint, cloth, or shield",
      glyphFocus: "Glyph or warpaint focus",
      hidesFurs: "Hides and furs",
      clubsShafts: "Clubs and shafts",
      roughMetal: "Rough metal",
      dustyBase: "Dusty base",
      darkArmorMutation: "Dark armor or mutation",
      cloakShieldFur: "Cloak, shield, fur, or skin",
      daemonicFocus: "Daemonic focus",
      brassTrim: "Brass trim",
      leatherTrophies: "Leather and trophies",
      robeMantle: "Robe or mantle",
      innerRobe: "Inner robe or sash",
      spellEffect: "Spell effect",
      parchmentTrim: "Parchment or pale trim",
      staffWood: "Staff wood",
      jewelry: "Jewelry",
      mysticBase: "Mystic base",
      skinFurScales: "Skin, fur, or scales",
      bellyWingsPlates: "Belly, wing membrane, or plates",
      eyesMouthMagic: "Eyes, mouth, poison, or magic",
      clawsHornsTeeth: "Claws, horns, and teeth",
      saddleStraps: "Saddle and straps",
      chainsArmor: "Chains and armor scraps",
      naturalBase: "Natural base",
      powerArmorFatigues: "Power armor, fatigues, or main suit",
      secondaryPanels: "Secondary panels",
      lensesPlasma: "Lenses, plasma, and sensors",
      weaponCasing: "Weapon casing",
      gunmetal: "Gunmetal",
      pouchesStraps: "Pouches and straps",
      battlefieldBase: "Battlefield base",
      chapterArmor: "Chapter armor",
      pauldronsKnees: "Pauldrons, helmets, and knees",
      companyMarkings: "Company markings",
      aquilaTrim: "Aquila, trim, and honors",
      fatiguesCoat: "Fatigues or greatcoat",
      armorPlates: "Armor plates",
      unitMarkings: "Unit markings",
      traitorArmor: "Traitor armor",
      trimMutations: "Trim or mutations",
      warpGlow: "Warp glow",
      boneTrophies: "Bone trophies",
      carapaceArmor: "Carapace or armor",
      clothPanels: "Cloth panels",
      alienEnergy: "Alien energy",
      boneClaws: "Bone claws",
      smoothMetal: "Smooth metal",
      alienBase: "Alien base",
      fleshSkin: "Flesh or skin",
      bioWeapons: "Bio-weapons",
      tongueSacs: "Tongue or sacs",
      hullArmor: "Hull armor",
      panelsMarkings: "Panels and markings",
      exhaustDamage: "Exhaust damage and soot",
      ashWasteBase: "Ash-waste base"
    },
    roleUses: {
      dominant: "Use for the largest readable area so the scheme has a clear identity.",
      secondary: "Use on medium surfaces to separate forms without stealing the focal point.",
      focus: "Use sparingly near faces, weapons, lenses, gems, magic, or plasma.",
      leather: "Use for practical kit such as belts, holsters, straps, boots, and saddles.",
      wood: "Use for hafts, bows, shields, crates, ruins, and battlefield texture.",
      metal: "Use for blades, trim, chains, weapons, vents, buckles, and mechanical detail.",
      base: "Keep the base supportive so the model remains the loudest object.",
      bone: "Use for teeth, skulls, horns, claws, parchment, and trophies.",
      cloth: "Use on folds, robes, coats, banners, wraps, tabards, and soft equipment.",
      weapon: "Use on bolters, lasguns, casings, grips, cables, and hard housings.",
      weathering: "Use in exhausts, chips, oil marks, heat staining, and dirt buildup.",
      extraPalette: "Use as an extra scheme color for accents, markings, effects, heraldry, or special details."
    },
    roleTips: {
      dominant: "Aim for roughly two thirds of the visible miniature.",
      secondary: "Keep it below the main color in surface area.",
      focus: "Small and bright reads better than everywhere and loud.",
      neutral: "Neutrals help the palette breathe.",
      metal: "Shade it dark, then finish with a tiny bright point.",
      base: "Repeat one model color very subtly on the base if it needs unity.",
      heroic: "Sharp edge highlights make elite armor read from distance.",
      grim: "Lower saturation and stronger shadows sell the mood.",
      organic: "Use softer transitions on skin, fur, scales, and membranes.",
      weather: "Add scratches, grime, pigments, or stains after the base colors.",
      bone: "Start warmer at the root and highlight toward the tip.",
      cloth: "Highlight folds wider than hard armor edges.",
      extraPalette: "Keep it intentional and smaller than the assigned main and secondary areas."
    },
    ladder: {
      steps: {
        deepShade: "Deep shade",
        shadeWash: "Shade / wash",
        basecoat: "Basecoat",
        layer: "Layer",
        edgeHighlight: "Edge highlight",
        focusLight: "Focus light",
        darkPrime: "Dark undercoat",
        zenithalDrybrush: "Zenithal drybrush",
        transparentCoat: "Transparent coat",
        quickHighlight: "Quick highlight",
        glazeLayer: "Glaze layer",
        fineHighlight: "Fine highlight"
      },
      hints: {
        deepShade: "Deep recesses and undersides",
        shadeWash: "Controlled wash, not a flood",
        basecoat: "Opaque main layer",
        layer: "Raised volumes and broad light",
        edgeHighlight: "Edges, corners, and hard contours",
        focusLight: "Only face, lenses, runes, gems, plasma, or key weapons",
        darkPrime: "Black, dark brown, or deep colored primer",
        zenithalDrybrush: "White or pale drybrush from above",
        transparentCoat: "Contrast, speedpaint, ink, or thinned colour",
        quickHighlight: "One bright pass on face, weapons, and top edges",
        glazeLayer: "Thin mid-tone glaze to smooth the transition",
        fineHighlight: "Narrowest top-facing edges before final points"
      },
      note: "{system} use: armor, cloth, skin, scales, vehicles, cloaks, or energy effects. {finish} finish: keep focus light selective."
    },
    materials: {
      items: {
        darkWood: {
          name: "Dark wood",
          use: "Hafts, bows, crates, shield backs, and base rims"
        },
        warmWood: {
          name: "Warm wood",
          use: "Wood grain, shields, boxes, and terrain bits"
        },
        darkLeather: {
          name: "Dark leather",
          use: "Belts, holsters, boots, bags, and straps"
        },
        redLeather: {
          name: "Reddish leather",
          use: "Leather armor, grips, saddles, and pouches"
        },
        offWhite: {
          name: "Off-white",
          use: "Cloth, robes, parchment, ropes, and heraldry"
        },
        bone: {
          name: "Bone",
          use: "Skulls, teeth, horns, claws, parchment, and trophies"
        },
        coldWhite: {
          name: "Cold white",
          use: "Light points, gems, snow, and glow highlights"
        },
        blackGrey: {
          name: "Black grey",
          use: "Undersuits, weapon casings, shadows, and vents"
        },
        iron: {
          name: "Iron",
          use: "Blades, chains, bolts, gunmetal, and hard fittings"
        },
        silver: {
          name: "Silver",
          use: "Bright metal edges, jewelry, and clean machinery"
        },
        bronze: {
          name: "Bronze",
          use: "Old armor, trim, idols, machinery, and fittings"
        },
        gold: {
          name: "Gold",
          use: "Insignia, honors, jewelry, trim, and hero details"
        },
        baseEarth: {
          name: "Earth / rubble",
          use: "Base ground, dust, ruins, and battlefield texture"
        }
      }
    },
    bases: {
      city: {
        title: "Free City cobbles",
        use: "Paved streets, frontier roads, flagstones, timber debris, and powder-stained masonry.",
        tip: "Best for disciplined infantry, artillery, cavalry, and urban campaigns.",
        recipe: [
          "Base: dark grey-brown",
          "Texture: stones, sand, broken timber",
          "Drybrush: pale grey",
          "Accent: dust, posters, grass tufts"
        ]
      },
      ruins: {
        title: "Realmgate temple ruins",
        use: "Ancient steps, broken statues, temple slabs, marble chips, and cracked realmstone.",
        tip: "Works for heroes, elite units, and models that need a clean heroic plinth.",
        recipe: [
          "Base: cool grey stone",
          "Texture: slate, cork, cracked slabs",
          "Drybrush: light grey",
          "Accent: tiny moss or glowing cracks"
        ]
      },
      graveyard: {
        title: "Graveyard / cursed soil",
        use: "Cold earth, tombstones, dead grass, bones, mist, and dark ruined masonry.",
        tip: "Strong fit for undead, cursed armies, and cold grim palettes.",
        recipe: [
          "Base: dark soil",
          "Texture: grit, skulls, broken stone",
          "Drybrush: cold grey-brown",
          "Accent: dead grass or bone"
        ]
      },
      forest: {
        title: "Forest floor, roots, and moss",
        use: "Roots, moss, leaves, damp earth, fallen branches, and living-realm vegetation.",
        tip: "Good for beasts, hunters, Sylvaneth, and naturalistic schemes.",
        recipe: [
          "Base: dark earth",
          "Texture: roots, bark, leaves",
          "Drybrush: tan or moss green",
          "Accent: grass tufts"
        ]
      },
      swamp: {
        title: "Swamp / marsh",
        use: "Wet mud, reeds, stagnant water, algae, bones, and half-sunken stones.",
        tip: "Useful for filthy, undead, monster, or Nurgle-adjacent moods.",
        recipe: [
          "Base: dark olive-brown",
          "Texture: mud, reeds, stones",
          "Gloss: water pools",
          "Accent: sickly grass"
        ]
      },
      desert: {
        title: "Desert, steppe, or ochre dust",
        use: "Dry sand, cracked earth, warm dust, sun-bleached rocks, and sparse scrub.",
        tip: "Excellent for blue, green, purple, or cold schemes.",
        recipe: [
          "Base: ochre brown",
          "Texture: sand and rocks",
          "Drybrush: bone or pale sand",
          "Accent: dry grass"
        ]
      },
      snow: {
        title: "Snow, frost, and pale stone",
        use: "Snow patches, icy stones, frost grass, pale ash, and cold marble fragments.",
        tip: "Use with dark models for silhouette contrast.",
        recipe: [
          "Base: dark rock",
          "Drybrush: pale grey",
          "Snow: add in patches",
          "Accent: ice crystals"
        ]
      },
      volcanic: {
        title: "Ash, lava, and burned ground",
        use: "Black ash, cracked lava, charred earth, soot, skulls, and scorched stone.",
        tip: "Good for Chaos, fire moods, monsters, and bright warm accents.",
        recipe: [
          "Base: black-brown ash",
          "Texture: cracked paste",
          "Drybrush: grey ash",
          "Accent: lava cracks"
        ]
      },
      arcane: {
        title: "Arcane runes / crystals",
        use: "Runed stone, spell circles, crystals, books, smoke, and magical terrain fragments.",
        tip: "Best for wizards, champions, and strong magical accent colors.",
        recipe: [
          "Base: neutral stone",
          "Texture: carved lines",
          "Glow: repeat focus accent",
          "Accent: crystals"
        ]
      },
      ghur: {
        title: "Ghurish badlands",
        use: "Dust, dry earth, rocks, cracked mud, bones, trophy debris, and hunting ground.",
        tip: "Strong fit for Destruction, monsters, and beasts.",
        recipe: [
          "Base: reddish earth",
          "Texture: rocks and bones",
          "Drybrush: tan dust",
          "Accent: dry tufts"
        ]
      },
      coastal: {
        title: "Coastal, reef, or wet stone",
        use: "Wet rocks, tide pools, shells, broken docks, coral fragments, and sea-slick ruins.",
        tip: "Use for sea-themed forces, wet ruins, and aquatic monsters.",
        recipe: [
          "Base: blue-grey rock",
          "Texture: sand, shells, slate",
          "Gloss: tide pools",
          "Accent: coral"
        ]
      },
      neutral: {
        title: "Neutral rubble",
        use: "Brown-grey rubble, broken masonry, dirt, roots, and small stones.",
        tip: "Safe default because it supports warm and cool palettes.",
        recipe: [
          "Base: brown-grey earth",
          "Texture: grit and stone",
          "Drybrush: tan-grey",
          "Accent: muted tufts"
        ]
      },
      darkMud: {
        title: "Dark mud / blackened earth",
        use: "Wet soil, burned ground, grave dirt, swamp muck, or churned battlefield.",
        tip: "Keeps bright models grounded.",
        recipe: [
          "Base: dark umber",
          "Texture: mud and grit",
          "Gloss: wet patches",
          "Accent: dead grass"
        ]
      },
      lightAsh: {
        title: "Light ash, snow, or pale stone",
        use: "Ash waste, snow patches, marble chips, bleached stone, or dry sand.",
        tip: "Raises silhouette contrast for dark models.",
        recipe: [
          "Base: pale grey-beige",
          "Texture: fine grit",
          "Drybrush: off-white",
          "Accent: dark stones"
        ]
      },
      darkRim: {
        title: "Dark rim and controlled edge",
        use: "Black-brown rim, quiet texture, and restrained weathering around the model.",
        tip: "Keeps the base visually contained.",
        recipe: [
          "Rim: black-brown",
          "Keep texture inside",
          "Avoid bright rim colors",
          "Dust lower legs"
        ]
      },
      urban: {
        title: "Urban rubble",
        use: "Concrete, rebar, dust, broken road, metal scraps, and shell damage.",
        tip: "Classic 40K battlefield framing for infantry and armor.",
        recipe: [
          "Base: dark concrete",
          "Texture: rubble and grit",
          "Drybrush: cold grey",
          "Accent: hazard stripe or dust"
        ]
      },
      ashWaste: {
        title: "Ash waste",
        use: "Grey dust, pale dirt, shell craters, rusted debris, and burned ground.",
        tip: "Works with most 40K armies and supports bright armor.",
        recipe: [
          "Base: grey-brown ash",
          "Texture: fine grit",
          "Drybrush: pale dust",
          "Accent: rust or spent casings"
        ]
      },
      hive: {
        title: "Hive deck / undercity",
        use: "Dark metal floor, grime, cables, vents, hazard markings, and oil stains.",
        tip: "Great for industrial 40K, Necromunda moods, and vehicle bases.",
        recipe: [
          "Base: dark metal",
          "Texture: mesh or plates",
          "Weather: oil and rust",
          "Accent: hazard color"
        ]
      },
      jungle: {
        title: "Death world jungle",
        use: "Dense mud, vines, roots, wet leaves, alien plants, and broken stone.",
        tip: "Good for xenos, Tyranids, scouts, and overgrown battlefields.",
        recipe: [
          "Base: dark mud",
          "Texture: roots and leaves",
          "Gloss: wet areas",
          "Accent: bright plant"
        ]
      },
      alien: {
        title: "Alien world growth",
        use: "Purple soil, strange crystals, spores, chitin, and unnatural vegetation.",
        tip: "Supports xenos and bio-organic palettes.",
        recipe: [
          "Base: muted alien soil",
          "Texture: crystals or spores",
          "Drybrush: pale violet",
          "Accent: toxic glow"
        ]
      },
      shipDeck: {
        title: "Ship deck",
        use: "Cold metal plating, rivets, cables, hazard lines, and machine grime.",
        tip: "Useful for boarding actions, vehicles, and naval 40K scenes.",
        recipe: [
          "Base: dark steel",
          "Texture: plates and rivets",
          "Weather: grime",
          "Accent: warning stripe"
        ]
      }
    },
    citadel: {
      loaded: "Loaded {count} catalogue paints from JSON.",
      sample: "Using {count} sample catalogue paints until the JSON loads.",
      missing: "No catalogue paint data available yet.",
      closest: "Closest matches",
      distance: "distance {distance}",
      noCloseOwned: "None of your paints is close to this colour. Closest catalogue paint:",
      notOwned: "{name} (not owned)"
    },
    copy: {
      palette: "Palette",
      roles: "Role planner",
      bases: "Base environment suggestions",
      ladder: "Shade / Layer / Highlight",
      citadel: "Paint catalogue matches"
    },
    recipeModes: {
      beginner: {
        title: "Beginner",
        description: "Three reliable desk steps: basecoat, controlled wash, and one readable highlight."
      },
      speedpaint: {
        title: "Speedpaint",
        description: "Fast undercoat, zenithal drybrush, transparent colour, and a quick final pop."
      },
      battle: {
        title: "Battle-ready",
        description: "Balanced tabletop recipe with shade, base, layer, edge highlight, and focal light."
      },
      display: {
        title: "Display",
        description: "Extra glazing and fine highlights for slower hero, centerpiece, or competition-style work."
      }
    },
    ai: {
      customFaction: "★ My palettes",
      createdFrom: "Created by the assistant from: “{prompt}”",
      createdFromPhoto: "Taken from the photo “{name}”.",
      source: {
        ai: "Assistant",
        photo: "Photo"
      },
      groupTitle: "Assistant & photo",
      describeLabel: "Describe your scheme",
      describePlaceholder: "e.g. Nurgle plague marines, rusty brass, sickly green, bone",
      describeButton: "Create palette",
      working: "The assistant is working… this can take up to a minute.",
      paletteDone: "Palette “{name}” created and saved under ★ My palettes.",
      unavailable: "The assistant needs the PaintHelper server with the AI computer connected.",
      photoLabel: "Palette from a photo",
      photoButton: "Choose photo",
      photoHint: "Works best with a neutral background; the centre of the image counts more.",
      photoWorking: "Analysing photo…",
      photoDone: "Palette “{name}” taken from the photo.",
      photoError: "The photo could not be read.",
      photoNote: "Extracted from a photo. Check the colours under neutral light.",
      deletePalette: "Delete this palette",
      recipeTitle: "Painting guide with your paints",
      recipeDescription: "A step-by-step guide for the current palette, using paints from your collection and the catalogue.",
      recipeButton: "Write guide",
      recipeStop: "Stop",
      recipeCopy: "Copy",
      recipeCopied: "Copied.",
      recipeHint: "Uses {owned} owned paints and the catalogue. Check paint names before buying.",
      recipeStale: "The palette has changed since this guide was written.",
      searchTitle: "Search paints in words",
      searchDescription: "Describe a colour, e.g. “warm bone white” or “weathered copper”.",
      searchPlaceholder: "warm bone white",
      searchButton: "Search",
      searchEmpty: "No matching paints found.",
      searchIndexing: "Preparing the catalogue for search (one-off, about a minute)…",
      searchUseMain: "Use as main colour",
      searchAddShopping: "Add to shopping list",
      searchOnList: "On shopping list",
      searchOwned: "Owned",
      error: {
        offline: "The AI computer is not reachable right now.",
        timeout: "The assistant took too long. Please try again.",
        busy: "The assistant is busy. Please try again in a moment.",
        limit: "Hourly limit reached. Please try again later.",
        invalid: "The assistant's answer was unusable. Please try again.",
        generic: "Something went wrong. Please try again."
      },
      feedbackQuestion: "How do you like this palette?",
      feedbackGood: "I like it",
      feedbackBad: "I don't like it",
      feedbackCommentGood: "What do you like in particular? (optional)",
      feedbackCommentBad: "What should be better? (optional)",
      feedbackSend: "Send",
      feedbackThanks: "Thanks! This shapes future suggestions.",
      feedbackRemoved: "Rating removed.",
      refineLabel: "Improve this palette",
      refinePlaceholder: "e.g. darker, more contrast, neon accents",
      refineButton: "Apply",
      refineDone: "Palette adjusted. Locked colours stayed as they were.",
      refineNew: "Saved as new palette “{name}” under ★ My palettes.",
      undo: "Undo",
      undone: "Previous version restored.",
      polished: "Contrast was sharpened automatically.",
      recipeOwnedOnly: "Only use my paints ({count})",
      recipeFeedbackQuestion: "How helpful was this guide?",
      paintUnknown: "Not found in the catalogue – check this paint name",
      unknownPaints: "Paint names not found in the catalogue: {count} (dashed underline).",
      addToList: "Add to shopping list",
      onList: "On shopping list"
    },
    collection: {
      description: "Your paints by brand and range. Tick what you own and add missing paints to the shopping list.",
      search: "Search paints: name, code or range",
      filter: "Filter",
      filterAll: "All",
      filterOwned: "Owned",
      filterMissing: "Not owned",
      filterShopping: "Shopping list",
      brands: "Brands",
      allBrands: "All brands",
      groupOwned: "{owned} of {count} owned",
      addToList: "Add to shopping list",
      onList: "On the shopping list – remove",
      status: "{owned} owned · {shopping} on the shopping list · {visible} shown",
      empty: "No paints match the search and filters.",
      more: "Show {count} more",
      otherGroup: "Other",
      searchSemantic: "Name, code or description – e.g. “warm bone white”",
      searchMeaning: "By description",
      meaningTitle: "Matching the description"
    },
    theme: {
      label: "Theme",
      auto: "Theme: automatic",
      light: "Theme: light",
      dark: "Theme: dark"
    },
    account: {
      menu: "Account"
    },
    assist: {
      undoReset: "Undo – bring back my colours",
      missingTitle: "Missing paints in this guide ({count})",
      missingAdd: "Put {count} on the shopping list",
      missingAllListed: "All on the shopping list",
      missingSubstitute: "Your {name} can stand in (difference {distance})",
      missingNone: "Nothing close in your collection",
      missingHint: "Paints with a stand-in from your collection are not added to the list.",
      jump: "Assistant",
      eyebrow: "Assistant",
      title: "What do you want to paint?",
      lead: "Describe your army or scheme – the assistant builds the palette, then a step-by-step guide with your paints.",
      manualHeading: "Set up manually",
      writeGuide: "Write painting guide",
      openGuide: "Open painting guide",
      rewriteGuide: "Write again",
      examplesLabel: "Examples",
      recentLabel: "Recent",
      examples: {
        aos: [
          "Stormcast Hallowed Knights, silver and blue",
          "Hedonites of Slaanesh, pastel with gold",
          "Nighthaunt, ghostly turquoise glow",
          "Skaven Clan Pestilens, rusty and sick"
        ],
        k40: [
          "Death Guard, rusty brass and sickly green",
          "Ultramarines, clean and bright",
          "Emperor's Children in neon",
          "Necrons, green glow on dark metal"
        ]
      },
      dockPalette: "Palette",
      dockGuide: "Guide",
      dockBench: "Desk",
      nextArmy: "To the army →",
      status: {
        ready: "Assistant ready",
        busy: "Assistant busy",
        offline: "Assistant offline",
        unknown: ""
      },
      statusBusyWaiting: "Assistant busy ({count} waiting)",
      statusHint: {
        ready: "The AI computer is answering.",
        busy: "Another request is running (e.g. Paperless) – yours will wait in line.",
        offline: "The AI computer is not reachable. Palettes from photos and saved guides still work.",
        unknown: ""
      }
    },
    bench: {
      title: "Painting desk",
      open: "Painting desk",
      close: "Close",
      fullscreen: "Full screen",
      stepOf: "Step {number} of {total}",
      stepDone: "Step {number} done",
      doneBadge: "Done",
      doneNext: "Done, next",
      undo: "Mark as not done",
      back: "Back",
      skip: "Skip",
      finish: "Close the desk",
      progress: "{done} of {total} steps done"
    },
    army: {
      step: "Army",
      eyebrow: "Army project",
      title: "Paint your army",
      import: "Import army list",
      importAnother: "Import list",
      select: "Army",
      importing: "Reading the list…",
      imported: "“{name}” imported: {units} units, {models} models.",
      reimported: "“{name}” updated: {added} new units, {removed} removed. Progress was kept.",
      importError: "The file could not be read. Use a NewRecruit JSON export or a BattleScribe .ros/.rosz file.",
      saveError: "Progress could not be saved.",
      armyWide: "Army-wide",
      emptyTitle: "Bring in your army list",
      emptyText: "Import a list from NewRecruit or BattleScribe and tick off every model as you paint.",
      emptyStep1: "In NewRecruit open your list and choose Export → JSON (BattleScribe: the .rosz file).",
      emptyStep2: "Import it here – units, models and points are read in.",
      emptyStep3: "Pick a palette for the army and let the assistant write a guide per unit.",
      points: "{points} pts",
      paintedShare: "{percent}% painted",
      painted: "painted",
      modelsPainted: "models painted",
      pointsPainted: "points painted",
      unitsDone: "units finished",
      nextTitle: "Paint next",
      nextProgress: "{painted} of {total} painted",
      nextStart: "not started · {points} pts",
      monthlyTitle: "Painted per month",
      monthlyBar: "{month}: {count} painted",
      photoAdd: "Add photo",
      photoChange: "Change photo",
      photoRemove: "Remove photo",
      photoAlt: "Photo of {unit}",
      photoError: "Could not read the photo.",
      stages: {
        open: "Not started",
        built: "Built",
        primed: "Primed",
        painted: "Painted",
        based: "Based"
      },
      palette: "Army palette",
      noPalette: "– no palette –",
      createPalette: "Create with the assistant",
      paletteSuffix: "army colours",
      showPalette: "Show palette",
      paletteHint: "Guides use the army palette. Without one, the palette currently shown is used.",
      filter: {
        all: "All",
        open: "Not started",
        progress: "In progress",
        done: "Finished"
      },
      filterLabel: "Show units",
      showExtras: "Show manifestations and terrain",
      delete: "Remove army",
      deleteConfirm: "Really remove?",
      deleted: "“{name}” removed.",
      regimentProgress: "{painted} of {models} painted",
      bulk: "Set all to…",
      bulkLabel: "Set every model of {unit} to a stage",
      new: "new",
      kind: {
        manifestation: "Manifestation",
        terrain: "Terrain"
      },
      unitProgress: "{painted} of {total} models painted",
      modelLabel: "{name} {number}: {stage} – tap for the next stage",
      writeGuide: "Write guide",
      rewriteGuide: "Write again",
      guideDone: "Guide for {unit} written (palette “{palette}”)."
    },
    kit: {
      title: "Pack a painting kit",
      expand: "Open",
      collapse: "Close",
      description: "Pick saved guides – the app lists the pots to pack from your collection, lets one pot stand in for close colours, and shows what is still missing.",
      filter: "Filter guides",
      tolerance: "Stand-ins",
      toleranceExact: "Exact paints only",
      toleranceClose: "Very close (ΔE ≤ 5)",
      toleranceSimilar: "Similar (ΔE ≤ 10)",
      toleranceLoose: "Travel light (ΔE ≤ 15)",
      selectAll: "All",
      selectNone: "None",
      noGuides: "No saved guides yet. Write a painting guide for a palette or an army unit first.",
      noMatch: "No guide matches the filter.",
      paletteGuides: "Palette guides",
      armyGuides: "Army guides",
      paintCount: "{count} paints",
      pickGuides: "Tick the guides you want to paint.",
      summary: "{guides} guides · {needed} paints · pack {pack} pots · buy {buy}.",
      saved: "Stand-ins save {count} pots.",
      packTitle: "Pack ({count})",
      buyTitle: "Not in your collection ({count})",
      standsIn: "also for {names}",
      usedIn: "in {names}",
      addToList: "Put {count} on the shopping list",
      allListed: "All on the shopping list",
      unknown: "Not found in the catalogue: {names}",
      empty: "The chosen guides name no catalogue paints.",
      copy: "Copy list",
      copied: "Copied",
      copyFailed: "Copy failed",
      download: "Download as text",
      packLabel: "Pack",
      buyLabel: "Buy",
      standsInShort: "also for",
      unknownLabel: "Not in the catalogue"
    },
    backup: {
      title: "Back up your data",
      description: "Download palettes, guides, army projects, collection and shopping list as one file, or bring a backup back.",
      export: "Download backup",
      import: "Restore backup…",
      exported: "Backup with {count} entries downloaded.",
      confirm: "Backup from {date} with {count} entries ({areas}). Restoring overwrites these areas.",
      confirmButton: "Restore now",
      restored: "Restored – reloading…",
      areas: {
        armies: "army projects",
        guides: "guides",
        palettes: "palettes and settings",
        kit: "painting kit",
        other: "other"
      },
      errors: {
        not_json: "This file is not valid JSON.",
        not_backup: "This is not a PaintHelper backup.",
        too_new: "This backup comes from a newer app version.",
        empty: "The backup contains no usable data.",
        save: "Could not save the backup on the server – please try again."
      }
    }
  };
}));
