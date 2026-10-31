// Italian texts for PaintHelperV2. Keep the same keys in all five language files
// (tests/i18n.test.js checks it); src/i18n.js turns them into the translator.
(function (root, factory) {
  const locale = factory();
  root.WPH_LOCALES = Object.assign(root.WPH_LOCALES || {}, { it: locale });
  if (typeof module !== "undefined" && module.exports) {
    module.exports = locale;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  return {
    appTitle: "Warhammer Paint Helper",
    ui: {
      workflow: "Passaggi",
      stepPalette: "Tavolozza",
      stepPlan: "Piano di pittura",
      stepPaints: "Colori e materiali",
      livePalette: "La tua tavolozza · anteprima",
      nextPlan: "Pianifica la pittura →",
      nextPaints: "Trova i colori →",
      backPalette: "Torna alla tavolozza",
      skipWorkspace: "Vai allo spazio di lavoro",
      language: "Lingua",
      system: "Sistema di gioco",
      eyebrow: "Strumento per palette di miniature",
      title: "Warhammer Paint Helper",
      subtitle: "Descrivi il tuo esercito: l'assistente crea la palette e una guida passo passo con i tuoi colori. Segui ogni miniatura nella pagina Esercito.",
      mode: "Modalità palette",
      faction: "Fazione",
      subfaction: "Sottofazione / schema fisso",
      activeColor: "Modifica ruota",
      mainColor: "Colore principale",
      paintProducers: "Produttori di colori",
      unknownProducer: "Produttore sconosciuto",
      ownedPaints: "Colori posseduti",
      ownedPaintsDescription: "Spunta i colori del catalogo che possiedi, poi limita se vuoi le corrispondenze a quei colori.",
      collapseOwnedPaints: "Comprimi",
      expandOwnedPaints: "Espandi",
      onlyOwnedMatches: "Mostra solo colori posseduti nelle corrispondenze",
      importPaintRackCsv: "Importa CSV PaintRack",
      paintRackImportReportTitle: "Import PaintRack",
      paintRackImportSummary: "{matched} colori del catalogo segnati come posseduti. {custom} colori fuori catalogo salvati come posseduti. {skipped} righe saltate.",
      paintRackMatched: "Corrispondenze catalogo ({count})",
      paintRackNotInCatalogue: "Fuori catalogo ({count})",
      paintRackStoredOwned: "salvato come posseduto",
      paintRackSkipped: "Saltate ({count})",
      paintRackMore: "...e altri {count}",
      paintRackNone: "Nessuno.",
      paintRackLine: "Riga {line}",
      paintRackNoColourData: "nessun dato colore del catalogo",
      paintRackImportReadFailed: "Impossibile leggere il file CSV.",
      close: "Chiudi",
      ownedPaintsStatus: "{owned} colori posseduti selezionati. {visible} colori visibili con i filtri correnti.",
      ownedPaintsAllSelected: "Tutti i colori visibili sono selezionati.",
      ownedPaintsEmpty: "Nessun colore del catalogo corrisponde ai produttori e alla ricerca correnti.",
      ownedBadge: "Posseduto",
      ownedBadgeLegend: "Etichetta Posseduto = colore posseduto",
      shoppingList: "Lista della spesa",
      shoppingListDescription: "Aggiungi colori non posseduti dai tooltip o cercando nel catalogo, poi rimuovili quando vuoi.",
      collapseShoppingList: "Comprimi",
      expandShoppingList: "Espandi",
      collapseSection: "Comprimi",
      expandSection: "Espandi",
      shoppingSearch: "Cerca colori da comprare",
      shoppingAddColour: "Aggiungi colore",
      addShoppingPaint: "Aggiungi",
      addToShoppingList: "Aggiungi alla lista",
      inShoppingList: "Nella lista",
      markShoppingPaintOwned: "Segna posseduto",
      removeShoppingPaint: "Rimuovi",
      shoppingListStatus: "{count} colori nella lista della spesa.",
      shoppingListEmpty: "La lista della spesa è vuota.",
      shoppingSearchPlaceholder: "Seleziona un colore non posseduto ({count})",
      shoppingSearchEmpty: "Nessun colore non posseduto corrisponde alla ricerca.",
      paintSearch: "Filtra i colori del catalogo",
      paintSelect: "Scegli il colore principale dal catalogo",
      paintSelectPlaceholder: "Seleziona un colore ({count})",
      paintSelectEmpty: "Nessun colore corrisponde ai filtri attuali",
      hexInput: "Inserisci direttamente il colore HEX",
      scheme: "Schema di colore",
      rolePlanner: "Pianificatore ruoli",
      baseEnvironment: "Ambiente della basetta",
      saturation: "Saturazione",
      lightness: "Luminosità",
      finishStyle: "Stile di finitura",
      grimdark: "Grimdark / invecchiato",
      clean: "Pulito / vibrante",
      copyPalette: "Copia palette",
      copied: "Copiato",
      randomColor: "Varia i colori sbloccati",
      profileName: "Nome profilo",
      savedProfiles: "Profili salvati",
      saveProfile: "Salva profilo",
      loadProfile: "Carica",
      deleteProfile: "Elimina",
      copyShareLink: "Copia link di condivisione",
      profilePlaceholder: "Scegli un profilo",
      noProfiles: "Nessun profilo salvato",
      profileSaved: "{name} salvato.",
      profileLoaded: "{name} caricato.",
      profileDeleted: "{name} eliminato.",
      shareLinkCopied: "Link di condivisione copiato.",
      shareLinkCopyFailed: "Impossibile copiare il link di condivisione.",
      profileMissing: "Scegli prima un profilo salvato.",
      paintingNotes: "Note di pittura",
      rolePlannerDescription: "Assegnazioni concrete per superfici, materiali, accenti focali e dettagli della basetta.",
      baseAdviceDescription: "Concetti di basetta con logica di contrasto, atmosfera, colori dei materiali e una breve ricetta.",
      modelRoles: "Ruoli del modello",
      modelRolesDescription: "Breve panoramica dei colori principali generati.",
      paintLadderDescription: "Passaggi pratici per ombre, base, strati, lumeggiature di bordo e luce focale.",
      citadelMatches: "Corrispondenze del catalogo colori",
      why: "Perché",
      build: "Costruisci",
      debug: "Debug: colore principale {hex} | prima carta palette {firstHex} | HSL({h}, {s}%, {l}%) | finitura {finish}",
      citadelJsonHint: "Fonte: data/paint-catalogue.json.",
      recipeMode: "Modalità ricetta",
      recipeTitle: "Ricetta {mode} {system}",
      controlStart: "Inizio",
      controlColor: "Colore",
      controlPaletteRules: "Regole palette",
      controlPaintingPlan: "Piano di pittura",
      controlPaintLibrary: "Libreria colori",
      controlSaveShare: "Salva / condividi",
      editPaletteColor: "Modifica colore",
      lockPaletteColor: "Blocca colore",
      paletteLocked: "Bloccato",
      paletteUnlocked: "Sbloccato",
      rerollPalette: "Varia i colori sbloccati",
      paletteLockHint: "Modifica un colore e bloccalo per conservarlo. Cambiare gioco, modalità o schema ripristina i colori e i blocchi."
    },
    systems: {
      aos: "Age of Sigmar",
      k40: "Warhammer 40.000"
    },
    modes: {
      single: "Colore singolo",
      heraldic: "Araldico"
    },
    factionSchemes: {
      custom: "Ruota colori personalizzata",
      chooseSubfaction: "Scegli uno schema di sottofazione",
      noSubfactions: "Nessuno schema fisso per questa fazione",
      customHint: "Scegli una fazione e una sottofazione per usare uno schema fisso, oppure continua con la ruota colori.",
      missing: "Nessuno schema fisso di fazione caricato.",
      selectedMeta: "Schema fisso {faction} con {count} colori etichettati.",
      description: "{faction}: {subfaction}, usando lo schema fisso {scheme}.",
      defaultNote: "Usa i colori etichettati come ricetta fissa della fazione, poi regola finitura e basetta a piacere.",
      paintEquivalents: "Equivalenti colori",
      noPaintEquivalents: "Nessun equivalente colore fisso indicato"
    },
    heraldic: {
      title: "Araldico a due colori",
      description: "Schema {layout} con bilanciamento {ratio}, costruito da due colori da stemma.",
      note: "Tratta i colori di campo e carica come co-primari. Mantieni piccolo l'accento e ombreggia bianco o colori pallidi con grigio, avorio o grigio-blu invece del nero puro.",
      primaryColor: "Colore del campo",
      secondaryColor: "Colore della carica",
      secondaryHexInput: "Inserisci direttamente il HEX secondario",
      layout: "Layout araldico",
      ratio: "Bilanciamento colori",
      accent: "Accento araldico",
      active: {
        primary: "Colore del campo",
        secondary: "Colore della carica"
      },
      layouts: {
        split: "Scudo diviso",
        quartered: "Inquartato",
        diagonal: "Diagonale",
        stripe: "Banda centrale",
        border: "Bordo e campo"
      },
      ratios: {
        dominant: "70 / 30",
        balanced: "50 / 50",
        secondary: "40 / 60"
      },
      accents: {
        auto: "Auto",
        autoTrim: "Auto: bordatura",
        autoFocal: "Auto: dettaglio focale",
        autoMetal: "Auto: metallo araldico",
        gold: "Oro",
        red: "Rosso",
        black: "Nero",
        silver: "Argento",
        lens: "Lente / colore magico"
      }
    },
    systemCopy: {
      aos: {
        rolePlannerTitle: "Pianificatore ruoli AoS",
        baseAdviceTitle: "Suggerimenti ambiente basetta AoS",
        paintLadderTitle: "AoS Ombra / Strato / Lumeggiatura",
        finishPrefix: "Finitura AoS"
      },
      k40: {
        rolePlannerTitle: "Pianificatore ruoli 40K",
        baseAdviceTitle: "Suggerimenti basetta campo di battaglia 40K",
        paintLadderTitle: "40K Ombra / Strato / Lumeggiatura",
        finishPrefix: "Finitura 40K"
      }
    },
    finish: {
      grimdark: "Grimdark",
      weathered: "Invecchiato",
      balanced: "Bilanciato",
      clean: "Pulito",
      vibrant: "Vibrante",
      summary: {
        grimdark: "Molto desaturato, ombre sporche, scheggiature, pigmenti e luci selettive.",
        weathered: "Realistico e usurato con ombre più scure, bordi consumati e texture controllata.",
        balanced: "Equilibrio tra lettura da tavolo, colore pulito e profondità pittorica.",
        clean: "Colori più chiari e puliti, bordi nitidi e weathering minimo.",
        vibrant: "Alta saturazione, forti luci focali e accenti brillanti da esposizione."
      }
    },
    profiles: {
      aos: {
        balanced: "AoS bilanciato",
        stormcast: "Armatura eroica / Stormcast",
        death: "Morte / non morti",
        destruction: "Distruzione / orde",
        chaos: "Caos / demoni",
        wizard: "Mago / mistico",
        beast: "Bestia / mostro"
      },
      k40: {
        balanced: "40K bilanciato",
        spaceMarines: "Space Marines / élite corazzata",
        guard: "Guardia / fanteria",
        chaosMarines: "Marines del Caos",
        xenos: "Xenos / alieni puliti",
        tyranids: "Tiranidi / bio-organici",
        vehicle: "Veicolo / armatura grande"
      }
    },
    baseOptions: {
      auto: "Auto"
    },
    schemes: {
      complementary: {
        title: "Complementare",
        desc: "Colore principale con il suo opposto per un contrasto forte e leggibile.",
        note: "Mantieni dominante il colore principale e usa il complementare per punti focali o dettagli."
      },
      split: {
        title: "Complementare diviso",
        desc: "Due accenti ai lati dell'opposto diretto, più morbidi del complementare puro.",
        note: "Ottimo per miniature con molte superfici secondarie e accenti controllati."
      },
      triadic: {
        title: "Triadico",
        desc: "Tre colori equidistanti per una palette energica e bilanciata.",
        note: "Scegli un colore dominante e lascia gli altri due come supporto."
      },
      tetradic: {
        title: "Tetradico",
        desc: "Due coppie complementari per eroi complessi e modelli ricchi di materiali.",
        note: "Distribuisci i colori con attenzione per evitare un risultato rumoroso."
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
        title: "Analogo",
        desc: "Colori vicini per una palette armoniosa e naturale.",
        note: "Aggiungi contrasto di valore per mantenere la leggibilità."
      },
      analogousWide: {
        title: "Wide analogous",
        desc: "Five related hues for soft transitions, monster skin, cloth layers, and large surfaces.",
        note: "The outer tones work well as glazes, shadows, or subtle edge variation."
      },
      monochrome: {
        title: "Monocromatico",
        desc: "Variazioni dello stesso colore per un aspetto coeso.",
        note: "Spingi luci e ombre per evitare superfici piatte."
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
        title: "Schema box art",
        desc: "Palette pulita da studio ispirata alle presentazioni ufficiali Games Workshop.",
        note: "Usa ombre nette, pannelli leggibili e un accento focale chiaro."
      },
      eavyMetal: {
        title: "Stile 'Eavy Metal",
        desc: "Lumeggiature di bordo pulite e ad alto contrasto vicino al classico look studio GW.",
        note: "Mantieni le linee ordinate, i recessi scuri e i bordi molto nitidi."
      },
      grimdark: {
        title: "Sporco / grimdark",
        desc: "Varianti desaturate e scure con un accento controllato per modelli realistici o consumati.",
        note: "Lavature, scheggiature a spugna, pigmenti e luci selettive contano più delle grandi aree sature."
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
        title: "Parade-ready",
        desc: "Standard d'armata pulito, leggibile e rifinito con highlight ordinati.",
        note: "Mantieni superfici pulite, luci coerenti e accenti forti ma non caotici."
      },
      battleReady: {
        title: "Battle-ready",
        desc: "Standard da tavolo semplice: colori di base, shade e pochi highlight pratici.",
        note: "Dai priorità a colori bloccati, shade controllata, basette pulite e uno o due accenti leggibili."
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
        title: "Capitolo / squadra 40K",
        desc: "Colore armatura, ombra dei pannelli, marcatura compagnia e accento lente o plasma.",
        note: "Pensato per pannelli d'armatura 40K, caschi, spallacci, armi e identificativi di squadra."
      },
      adrianSmith: {
        title: "Atmosfera Adrian Smith",
        desc: "Schema illustrativo scuro e severo, con ombre dure, mezzitoni usurati, luci invecchiate e un accento contenuto.",
        note: "Porta il modello verso armature annerite, stoffe fumose, metalli sporchi, ossa calde e piccoli dettagli focali aggressivi."
      },
      girlyPop: {
        title: "GirlyPop",
        desc: "Rosa confetto, lilla, menta, rosa cipria e oro glitter, insieme a una versione caramella del tuo colore principale.",
        note: "Mantieni i colori puliti e luminosi: basi lisce, ombre morbide rosa o lilla invece di lavaggi marroni e piccoli dettagli oro o glitter come gioielli."
      }
    },
    schemeRoles: {
      primary: "Colore principale",
      contrast: "Colore di contrasto",
      leftAccent: "Accento sinistro",
      rightAccent: "Accento destro",
      secondary: "Colore secondario",
      accent: "Colore d'accento",
      shadow: "Colore d'ombra",
      highlight: "Colore di luce",
      darkNeighbor: "Vicino scuro",
      lightNeighbor: "Vicino chiaro",
      layer: "Colore strato",
      deepShadow: "Ombra profonda",
      edgeHighlight: "Lumeggiatura di bordo",
      basecoat: "Basecoat",
      coolShadow: "Ombra fredda",
      warmLayer: "Strato caldo",
      strongAccent: "Accento forte",
      neighbor: "Colore vicino",
      secondaryAccent: "Accento secondario",
      coolCounter: "Controcolore freddo",
      coolAccent: "Accento freddo",
      darkBase: "Base scura",
      dustyLayer: "Strato polveroso",
      dirtyAccent: "Accento sporco",
      realmGlow: "Bagliore di reame",
      realmAccent: "Accento di reame",
      realmShadow: "Ombra di reame",
      armor: "Colore armatura",
      panelShade: "Ombra pannello",
      companyMarking: "Marcatura compagnia",
      lensAccent: "Accento lente",
      fieldColor: "Colore del campo",
      chargeColor: "Colore della carica",
      fieldShadow: "Ombra del campo",
      chargeShade: "Ombra della carica",
      fieldHighlight: "Luce del campo",
      chargeHighlight: "Luce della carica",
      heraldicAccent: "Accento araldico",
      factionDominant: "Colore dominante",
      factionSecondary: "Colore secondario",
      factionDarkNeutral: "Neutro scuro",
      factionLightNeutral: "Neutro chiaro",
      factionAccentOne: "Accento 1",
      factionAccentTwo: "Accento 2",
      bubblegum: "Rosa confetto",
      lilac: "Lilla",
      mint: "Menta",
      blush: "Rosa cipria",
      glitterGold: "Oro glitter"
    },
    placements: {
      dominant: "Dominante",
      secondary: "Secondario",
      contrast: "Contrasto",
      small: "Piccolo accento"
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
        deepShade: "Ombra profonda",
        shadeWash: "Shade / lavatura",
        basecoat: "Basecoat",
        layer: "Strato",
        edgeHighlight: "Lumeggiatura di bordo",
        focusLight: "Luce focale",
        darkPrime: "Primer scuro",
        zenithalDrybrush: "Drybrush zenitale",
        transparentCoat: "Strato trasparente",
        quickHighlight: "Luce rapida",
        glazeLayer: "Velatura di strato",
        fineHighlight: "Luce fine"
      },
      hints: {
        deepShade: "Recessi profondi e lati inferiori",
        shadeWash: "Lavatura controllata, non allagata",
        basecoat: "Strato principale coprente",
        layer: "Volumi rialzati e luce ampia",
        edgeHighlight: "Bordi, angoli e contorni duri",
        focusLight: "Solo volto, lenti, rune, gemme, plasma o armi chiave",
        darkPrime: "Primer nero, marrone scuro o colore profondo",
        zenithalDrybrush: "Drybrush bianco o pallido dall'alto",
        transparentCoat: "Contrast, speedpaint, inchiostro o colore diluito",
        quickHighlight: "Una passata chiara su volto, armi e bordi superiori",
        glazeLayer: "Velatura sottile di mezzotono per ammorbidire il passaggio",
        fineHighlight: "Bordi superiori più sottili prima dei punti finali"
      },
      note: "Uso {system}: armatura, stoffa, pelle, scaglie, veicoli, mantelli o effetti energetici. Finitura {finish}: mantieni selettiva la luce focale."
    },
    materials: {
      items: {
        darkWood: {
          name: "Legno scuro",
          use: "Aste, archi, casse, retro degli scudi e bordi delle basette"
        },
        warmWood: {
          name: "Legno caldo",
          use: "Venature del legno, scudi, scatole e dettagli scenici"
        },
        darkLeather: {
          name: "Cuoio scuro",
          use: "Cinture, fondine, stivali, borse e cinghie"
        },
        redLeather: {
          name: "Cuoio rossiccio",
          use: "Armature di cuoio, impugnature, selle e tasche"
        },
        offWhite: {
          name: "Bianco sporco",
          use: "Stoffa, vesti, pergamena, corde e araldica"
        },
        bone: {
          name: "Osso",
          use: "Teschi, denti, corna, artigli, pergamena e trofei"
        },
        coldWhite: {
          name: "Bianco freddo",
          use: "Punti luce, gemme, neve e lumeggiature di bagliore"
        },
        blackGrey: {
          name: "Grigio nero",
          use: "Tute interne, carter armi, ombre e prese d'aria"
        },
        iron: {
          name: "Ferro",
          use: "Lame, catene, bulloni, metallo brunito e raccordi duri"
        },
        silver: {
          name: "Argento",
          use: "Bordi metallici brillanti, gioielli e macchinari puliti"
        },
        bronze: {
          name: "Bronzo",
          use: "Armature antiche, bordature, idoli, macchinari e raccordi"
        },
        gold: {
          name: "Oro",
          use: "Insegne, onori, gioielli, bordature e dettagli eroici"
        },
        baseEarth: {
          name: "Terra / macerie",
          use: "Terreno della basetta, polvere, rovine e texture da campo di battaglia"
        }
      }
    },
    bases: {
      city: {
        title: "Ciottoli della Città Libera",
        use: "Strade lastricate, vie di frontiera, pietre, detriti di legno e muratura annerita dalla polvere.",
        tip: "Ideale per fanteria disciplinata, artiglieria, cavalleria e campagne urbane.",
        recipe: [
          "Base: grigio-marrone scuro",
          "Texture: pietre, sabbia, legno rotto",
          "Pennello asciutto: grigio chiaro",
          "Accento: polvere, poster, ciuffi d'erba"
        ]
      },
      ruins: {
        title: "Rovine di tempio del Realmgate",
        use: "Gradini antichi, statue rotte, lastre di tempio, schegge di marmo e realmstone crepata.",
        tip: "Funziona per eroi, unità élite e modelli che richiedono un piedistallo eroico pulito.",
        recipe: [
          "Base: pietra grigia fredda",
          "Texture: ardesia, sughero, lastre crepate",
          "Pennello asciutto: grigio chiaro",
          "Accento: poco muschio o crepe luminose"
        ]
      },
      graveyard: {
        title: "Cimitero / terreno maledetto",
        use: "Terra fredda, lapidi, erba morta, ossa, nebbia e muratura scura in rovina.",
        tip: "Molto adatto a non morti, eserciti maledetti e palette grimdark fredde.",
        recipe: [
          "Base: terra scura",
          "Texture: graniglia, teschi, pietra rotta",
          "Pennello asciutto: grigio-marrone freddo",
          "Accento: erba morta o osso"
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
        title: "Deserto, steppa o polvere ocra",
        use: "Sabbia asciutta, terra crepata, polvere calda, rocce sbiancate dal sole e arbusti radi.",
        tip: "Eccellente per schemi blu, verdi, viola o freddi.",
        recipe: [
          "Base: marrone ocra",
          "Texture: sabbia e rocce",
          "Pennello asciutto: osso o sabbia pallida",
          "Accento: erba secca"
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
        title: "Macerie urbane",
        use: "Cemento, tondini, polvere, strada rotta, rottami metallici e danni da proiettili.",
        tip: "Classica cornice da campo di battaglia 40K per fanteria e corazzati.",
        recipe: [
          "Base: cemento scuro",
          "Texture: macerie e graniglia",
          "Pennello asciutto: grigio freddo",
          "Accento: striscia di pericolo o polvere"
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
      loaded: "Caricati {count} colori del catalogo dal JSON.",
      sample: "Uso {count} colori di esempio finché il JSON non viene caricato.",
      missing: "Nessun dato del catalogo colori disponibile.",
      closest: "Corrispondenze più vicine",
      distance: "distanza {distance}",
      noCloseOwned: "Nessuno dei tuoi colori è abbastanza vicino. Colore del catalogo più vicino:",
      notOwned: "{name} (non posseduto)"
    },
    copy: {
      palette: "Palette",
      roles: "Pianificatore ruoli",
      bases: "Suggerimenti ambiente basetta",
      ladder: "Ombra / Strato / Luce",
      citadel: "Corrispondenze catalogo"
    },
    recipeModes: {
      beginner: {
        title: "Principiante",
        description: "Tre passaggi affidabili: base, lavatura controllata e una lumeggiatura leggibile."
      },
      speedpaint: {
        title: "Speedpaint",
        description: "Primer rapido, drybrush zenitale, colore trasparente e un ultimo colpo di luce."
      },
      battle: {
        title: "Battle-ready",
        description: "Ricetta equilibrata da tavolo con ombra, base, strato, lumeggiatura di bordo e luce focale."
      },
      display: {
        title: "Display",
        description: "Velature extra e luci fini per eroi, centerpiece o lavori da concorso."
      }
    },
    ai: {
      customFaction: "★ Le mie palette",
      createdFrom: "Creata dall'assistente da: «{prompt}»",
      createdFromPhoto: "Ricavata dalla foto «{name}».",
      source: {
        ai: "Assistente",
        photo: "Foto"
      },
      groupTitle: "Assistente e foto",
      describeLabel: "Descrivi il tuo schema",
      describePlaceholder: "es. marine della pestilenza di Nurgle, ottone arrugginito, verde malato, osso",
      describeButton: "Crea palette",
      working: "L'assistente sta lavorando… può richiedere fino a un minuto.",
      paletteDone: "Palette «{name}» creata e salvata in ★ Le mie palette.",
      unavailable: "L'assistente richiede il server PaintHelper con il computer IA collegato.",
      photoLabel: "Palette da una foto",
      photoButton: "Scegli foto",
      photoHint: "Funziona meglio con sfondo neutro; il centro dell'immagine conta di più.",
      photoWorking: "Analisi della foto…",
      photoDone: "Palette «{name}» ricavata dalla foto.",
      photoError: "Impossibile leggere la foto.",
      photoNote: "Ricavata da una foto. Controlla i colori con luce neutra.",
      deletePalette: "Elimina questa palette",
      recipeTitle: "Guida di pittura con i tuoi colori",
      recipeDescription: "Guida passo passo per la palette attuale, con i colori della tua collezione e del catalogo.",
      recipeButton: "Scrivi la guida",
      recipeStop: "Ferma",
      recipeCopy: "Copia",
      recipeCopied: "Copiato.",
      recipeHint: "Usa {owned} colori posseduti e il catalogo. Controlla i nomi prima dell'acquisto.",
      recipeStale: "La palette è cambiata da quando è stata scritta questa guida.",
      searchTitle: "Cerca colori a parole",
      searchDescription: "Descrivi un colore, es. «bianco osso caldo» o «rame invecchiato».",
      searchPlaceholder: "bianco osso caldo",
      searchButton: "Cerca",
      searchEmpty: "Nessun colore trovato.",
      searchIndexing: "Preparazione del catalogo per la ricerca (una sola volta, circa un minuto)…",
      searchUseMain: "Usa come colore principale",
      searchAddShopping: "Aggiungi alla lista della spesa",
      searchOnList: "Nella lista della spesa",
      searchOwned: "Posseduto",
      error: {
        offline: "Il computer IA non è raggiungibile al momento.",
        timeout: "L'assistente ha impiegato troppo tempo. Riprova.",
        busy: "L'assistente è occupato. Riprova tra poco.",
        limit: "Limite orario raggiunto. Riprova più tardi.",
        invalid: "La risposta dell'assistente era inutilizzabile. Riprova.",
        generic: "Qualcosa è andato storto. Riprova."
      },
      feedbackQuestion: "Ti piace questa palette?",
      feedbackGood: "Mi piace",
      feedbackBad: "Non mi piace",
      feedbackCommentGood: "Cosa ti piace in particolare? (facoltativo)",
      feedbackCommentBad: "Cosa dovrebbe migliorare? (facoltativo)",
      feedbackSend: "Invia",
      feedbackThanks: "Grazie! Questo guiderà i prossimi suggerimenti.",
      feedbackRemoved: "Valutazione rimossa.",
      refineLabel: "Migliora questa palette",
      refinePlaceholder: "es. più scura, più contrasto, accenti neon",
      refineButton: "Applica",
      refineDone: "Palette modificata. I colori bloccati sono rimasti invariati.",
      refineNew: "Salvata come nuova palette «{name}» in ★ Le mie palette.",
      undo: "Annulla",
      undone: "Versione precedente ripristinata.",
      polished: "Il contrasto è stato rafforzato automaticamente.",
      recipeOwnedOnly: "Usa solo i miei colori ({count})",
      recipeFeedbackQuestion: "Quanto è stata utile la guida?",
      paintUnknown: "Non trovato nel catalogo – controlla il nome del colore",
      unknownPaints: "Nomi di colori non trovati nel catalogo: {count} (sottolineati a tratteggio).",
      addToList: "Aggiungi alla lista della spesa",
      onList: "Nella lista della spesa"
    },
    collection: {
      description: "I tuoi colori per marca e gamma. Spunta quelli che possiedi e aggiungi quelli mancanti alla lista della spesa.",
      search: "Cerca colori: nome, codice o gamma",
      filter: "Filtro",
      filterAll: "Tutti",
      filterOwned: "Posseduti",
      filterMissing: "Non posseduti",
      filterShopping: "Lista della spesa",
      brands: "Marche",
      allBrands: "Tutte le marche",
      groupOwned: "{owned} di {count} posseduti",
      addToList: "Aggiungi alla lista della spesa",
      onList: "Nella lista della spesa – rimuovi",
      status: "{owned} posseduti · {shopping} nella lista della spesa · {visible} mostrati",
      empty: "Nessun colore corrisponde a ricerca e filtri.",
      more: "Mostra altri {count}",
      otherGroup: "Altri",
      searchSemantic: "Nome, codice o descrizione – es. «bianco osso caldo»",
      searchMeaning: "Per descrizione",
      meaningTitle: "In base alla descrizione"
    },
    theme: {
      label: "Tema",
      auto: "Tema: automatico",
      light: "Tema: chiaro",
      dark: "Tema: scuro"
    },
    account: {
      menu: "Account"
    },
    assist: {
      undoReset: "Annulla – riporta i miei colori",
      missingTitle: "Colori mancanti in questa guida ({count})",
      missingAdd: "Metti {count} nella lista della spesa",
      missingAllListed: "Tutti nella lista della spesa",
      missingSubstitute: "Il tuo {name} può sostituirlo (differenza {distance})",
      missingNone: "Niente di simile nella tua collezione",
      missingHint: "I colori sostituibili con la tua collezione non vengono aggiunti.",
      jump: "Assistente",
      eyebrow: "Assistente",
      title: "Cosa vuoi dipingere?",
      lead: "Descrivi il tuo esercito o schema: l'assistente crea la palette e poi una guida passo passo con i tuoi colori.",
      manualHeading: "Impostazione manuale",
      writeGuide: "Scrivi la guida di pittura",
      openGuide: "Apri la guida di pittura",
      rewriteGuide: "Riscrivi",
      examplesLabel: "Esempi",
      recentLabel: "Recenti",
      examples: {
        aos: [
          "Stormcast Hallowed Knights, argento e blu",
          "Hedonites of Slaanesh, pastello con oro",
          "Nighthaunt, bagliore turchese spettrale",
          "Skaven Clan Pestilens, arrugginito e malato"
        ],
        k40: [
          "Death Guard, ottone arrugginito e verde malato",
          "Ultramarines, pulito e luminoso",
          "Emperor's Children al neon",
          "Necrons, bagliore verde su metallo scuro"
        ]
      },
      dockPalette: "Palette",
      dockGuide: "Guida",
      dockBench: "Banco",
      nextArmy: "All'esercito →",
      status: {
        ready: "Assistente pronto",
        busy: "Assistente occupato",
        offline: "Assistente offline",
        unknown: ""
      },
      statusBusyWaiting: "Assistente occupato ({count} in attesa)",
      statusHint: {
        ready: "Il computer IA risponde.",
        busy: "È in corso un'altra richiesta (es. Paperless): la tua attende in coda.",
        offline: "Il computer IA non è raggiungibile. Le palette da foto e le guide salvate funzionano ancora.",
        unknown: ""
      }
    },
    bench: {
      title: "Banco di pittura",
      open: "Banco di pittura",
      close: "Chiudi",
      fullscreen: "Schermo intero",
      ownModel: "Modello proprio…",
      defaultModel: "Figura standard",
      modelError: "Impossibile mostrare questo file (solo GLB).",
      stepOf: "Passo {number} di {total}",
      stepDone: "Passo {number} fatto",
      doneBadge: "Fatto",
      doneNext: "Fatto, avanti",
      undo: "Segna come da fare",
      back: "Indietro",
      skip: "Salta",
      finish: "Chiudi il banco",
      progress: "{done} passi su {total} fatti"
    },
    army: {
      step: "Esercito",
      eyebrow: "Progetto esercito",
      title: "Dipingi il tuo esercito",
      import: "Importa lista dell'esercito",
      importAnother: "Importa lista",
      select: "Esercito",
      importing: "Lettura della lista…",
      imported: "«{name}» importato: {units} unità, {models} miniature.",
      reimported: "«{name}» aggiornato: {added} nuove unità, {removed} rimosse. I progressi restano.",
      importError: "Impossibile leggere il file. Usa un export JSON di NewRecruit o un file BattleScribe (.ros/.rosz).",
      saveError: "Impossibile salvare i progressi.",
      armyWide: "Intero esercito",
      emptyTitle: "Porta qui la tua lista",
      emptyText: "Importa una lista da NewRecruit o BattleScribe e spunta ogni miniatura mentre dipingi.",
      emptyStep1: "In NewRecruit apri la lista e scegli Esporta → JSON (BattleScribe: il file .rosz).",
      emptyStep2: "Importala qui: unità, miniature e punti vengono letti.",
      emptyStep3: "Scegli una palette per l'esercito e lascia che l'assistente scriva una guida per unità.",
      points: "{points} pt",
      paintedShare: "{percent}% dipinto",
      painted: "dipinto",
      modelsPainted: "miniature dipinte",
      pointsPainted: "punti dipinti",
      unitsDone: "unità finite",
      nextTitle: "Da dipingere dopo",
      nextProgress: "{painted} su {total} dipinte",
      nextStart: "non iniziata · {points} pt",
      monthlyTitle: "Dipinto per mese",
      monthlyBar: "{month}: {count} dipinte",
      photoAdd: "Aggiungi foto",
      photoChange: "Cambia foto",
      photoRemove: "Rimuovi foto",
      photoAlt: "Foto di {unit}",
      photoError: "Impossibile leggere la foto.",
      stages: {
        open: "Da fare",
        built: "Montata",
        primed: "Con primer",
        painted: "Dipinta",
        based: "Basetta finita"
      },
      palette: "Palette dell'esercito",
      noPalette: "– nessuna palette –",
      createPalette: "Crea con l'assistente",
      paletteSuffix: "colori dell'esercito",
      showPalette: "Mostra palette",
      paletteHint: "Le guide usano la palette dell'esercito. Senza scelta si usa la palette mostrata.",
      filter: {
        all: "Tutte",
        open: "Da fare",
        progress: "In corso",
        done: "Finite"
      },
      filterLabel: "Mostra unità",
      showExtras: "Mostra manifestazioni e scenari",
      delete: "Rimuovi esercito",
      deleteConfirm: "Rimuovere davvero?",
      deleted: "«{name}» rimosso.",
      regimentProgress: "{painted} su {models} dipinte",
      bulk: "Tutte a…",
      bulkLabel: "Porta tutte le miniature di {unit} a una fase",
      new: "nuova",
      kind: {
        manifestation: "Manifestazione",
        terrain: "Scenario"
      },
      unitProgress: "{painted} miniature su {total} dipinte",
      modelLabel: "{name} {number}: {stage} – tocca per la fase successiva",
      writeGuide: "Scrivi guida",
      rewriteGuide: "Riscrivi",
      guideDone: "Guida per {unit} scritta (palette «{palette}»)."
    },
    kit: {
      title: "Prepara la valigetta dei colori",
      expand: "Apri",
      collapse: "Chiudi",
      description: "Scegli guide salvate: l'app elenca i barattoli da portare dalla tua collezione, lascia che un barattolo sostituisca colori vicini e mostra cosa manca.",
      filter: "Filtra guide",
      tolerance: "Sostituti",
      toleranceExact: "Solo colori esatti",
      toleranceClose: "Molto simile (ΔE ≤ 5)",
      toleranceSimilar: "Simile (ΔE ≤ 10)",
      toleranceLoose: "Viaggiare leggeri (ΔE ≤ 15)",
      selectAll: "Tutte",
      selectNone: "Nessuna",
      noGuides: "Nessuna guida salvata. Scrivi prima una guida per una palette o un'unità.",
      noMatch: "Nessuna guida corrisponde al filtro.",
      paletteGuides: "Guide delle palette",
      armyGuides: "Guide dell'esercito",
      paintCount: "{count} colori",
      pickGuides: "Spunta le guide che vuoi dipingere.",
      summary: "{guides} guide · {needed} colori · {pack} barattoli da portare · {buy} da comprare.",
      saved: "I sostituti fanno risparmiare {count} barattoli.",
      packTitle: "Da portare ({count})",
      buyTitle: "Non nella tua collezione ({count})",
      standsIn: "anche per {names}",
      usedIn: "in {names}",
      addToList: "Metti {count} nella lista della spesa",
      allListed: "Tutti nella lista della spesa",
      unknown: "Non trovati nel catalogo: {names}",
      empty: "Le guide scelte non citano colori del catalogo.",
      copy: "Copia lista",
      copied: "Copiato",
      copyFailed: "Copia non riuscita",
      download: "Scarica come testo",
      packLabel: "Da portare",
      buyLabel: "Da comprare",
      standsInShort: "anche per",
      unknownLabel: "Fuori catalogo"
    },
    backup: {
      title: "Backup dei dati",
      description: "Scarica palette, guide, progetti dell'esercito, collezione e lista della spesa in un file, o ripristina un backup.",
      export: "Scarica backup",
      import: "Ripristina backup…",
      exported: "Backup con {count} voci scaricato.",
      confirm: "Backup del {date} con {count} voci ({areas}). Il ripristino sovrascrive queste aree.",
      confirmButton: "Ripristina ora",
      restored: "Ripristinato – ricarico…",
      areas: {
        armies: "progetti dell'esercito",
        guides: "guide",
        palettes: "palette e impostazioni",
        kit: "valigetta",
        other: "altro"
      },
      errors: {
        not_json: "Il file non è un JSON valido.",
        not_backup: "Non è un backup di PaintHelper.",
        too_new: "Il backup proviene da una versione più recente.",
        empty: "Il backup non contiene dati utilizzabili.",
        save: "Impossibile salvare il backup sul server – riprova."
      }
    }
  };
}));
