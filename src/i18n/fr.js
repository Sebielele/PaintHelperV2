// French texts for PaintHelperV2. Keep the same keys in all five language files
// (tests/i18n.test.js checks it); src/i18n.js turns them into the translator.
(function (root, factory) {
  const locale = factory();
  root.WPH_LOCALES = Object.assign(root.WPH_LOCALES || {}, { fr: locale });
  if (typeof module !== "undefined" && module.exports) {
    module.exports = locale;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  return {
    appTitle: "Warhammer Paint Helper",
    ui: {
      workflow: "Étapes",
      stepPalette: "Palette",
      stepPlan: "Plan de peinture",
      stepPaints: "Peintures et matériel",
      livePalette: "Votre palette · aperçu en direct",
      nextPlan: "Planifier la peinture →",
      nextPaints: "Trouver les peintures →",
      backPalette: "Retour à la palette",
      skipWorkspace: "Aller à l’espace de travail",
      language: "Langue",
      system: "Système de jeu",
      eyebrow: "Outil de palette miniature",
      title: "Warhammer Paint Helper",
      subtitle: "Décrivez votre armée – l'assistant crée la palette et un guide pas à pas avec vos peintures. Suivez chaque figurine sur la page Armée.",
      mode: "Mode de palette",
      faction: "Faction",
      subfaction: "Sous-faction / schéma fixe",
      activeColor: "Roue modifie",
      mainColor: "Couleur principale",
      paintProducers: "Fabricants de peinture",
      unknownProducer: "Fabricant inconnu",
      ownedPaints: "Couleurs possédées",
      ownedPaintsDescription: "Coche les couleurs du catalogue que tu possèdes, puis limite au besoin les correspondances à ces peintures.",
      collapseOwnedPaints: "Replier",
      expandOwnedPaints: "Déplier",
      onlyOwnedMatches: "Afficher uniquement mes couleurs dans les correspondances",
      importPaintRackCsv: "Importer CSV PaintRack",
      paintRackImportReportTitle: "Import PaintRack",
      paintRackImportSummary: "{matched} couleurs du catalogue marquees comme possedees. {custom} couleurs absentes du catalogue gardees comme possedees. {skipped} lignes ignorees.",
      paintRackMatched: "Correspondances catalogue ({count})",
      paintRackNotInCatalogue: "Absentes du catalogue ({count})",
      paintRackStoredOwned: "gardee comme possedee",
      paintRackSkipped: "Ignorees ({count})",
      paintRackMore: "...et {count} de plus",
      paintRackNone: "Aucune.",
      paintRackLine: "Ligne {line}",
      paintRackNoColourData: "aucune donnee couleur du catalogue",
      paintRackImportReadFailed: "Impossible de lire le fichier CSV.",
      close: "Fermer",
      ownedPaintsStatus: "{owned} couleurs possédées sélectionnées. {visible} couleurs visibles avec les filtres actuels.",
      ownedPaintsAllSelected: "Toutes les couleurs visibles sont sélectionnées.",
      ownedPaintsEmpty: "Aucune couleur du catalogue ne correspond aux fabricants et à la recherche actuels.",
      ownedBadge: "Possédée",
      ownedBadgeLegend: "Badge Possédée = couleur possédée",
      shoppingList: "Liste d'achat",
      shoppingListDescription: "Ajoute des couleurs non possédées depuis les infobulles ou la recherche du catalogue, puis retire-les au besoin.",
      collapseShoppingList: "Replier",
      expandShoppingList: "Déplier",
      collapseSection: "Replier",
      expandSection: "Déplier",
      shoppingSearch: "Chercher des couleurs à acheter",
      shoppingAddColour: "Ajouter une couleur",
      addShoppingPaint: "Ajouter",
      addToShoppingList: "Ajouter à la liste",
      inShoppingList: "Dans la liste",
      markShoppingPaintOwned: "Marquer possédée",
      removeShoppingPaint: "Retirer",
      shoppingListStatus: "{count} couleurs dans ta liste d'achat.",
      shoppingListEmpty: "Ta liste d'achat est vide.",
      shoppingSearchPlaceholder: "Choisir une couleur non possédée ({count})",
      shoppingSearchEmpty: "Aucune couleur non possédée ne correspond à la recherche.",
      paintSearch: "Filtrer les couleurs du catalogue",
      paintSelect: "Choisir la couleur principale dans le catalogue",
      paintSelectPlaceholder: "Sélectionner une peinture ({count})",
      paintSelectEmpty: "Aucune peinture ne correspond aux filtres actuels",
      hexInput: "Entrer une couleur HEX",
      scheme: "Schéma de couleurs",
      rolePlanner: "Planificateur de rôles",
      baseEnvironment: "Environnement de socle",
      saturation: "Saturation",
      lightness: "Luminosité",
      finishStyle: "Style de finition",
      grimdark: "Grimdark / usé",
      clean: "Propre / vibrant",
      copyPalette: "Copier la palette",
      profileName: "Nom du profil",
      savedProfiles: "Profils enregistres",
      saveProfile: "Enregistrer",
      loadProfile: "Charger",
      deleteProfile: "Supprimer",
      copyShareLink: "Copier le lien",
      profilePlaceholder: "Choisir un profil",
      noProfiles: "Aucun profil enregistre",
      profileSaved: "{name} enregistre.",
      profileLoaded: "{name} charge.",
      profileDeleted: "{name} supprime.",
      shareLinkCopied: "Lien de partage copie.",
      shareLinkCopyFailed: "Impossible de copier le lien de partage.",
      profileMissing: "Choisis d'abord un profil enregistre.",
      copied: "Copié",
      randomColor: "Varier les couleurs déverrouillées",
      paintingNotes: "Notes de peinture",
      rolePlannerDescription: "Assignations concrètes pour surfaces, matériaux, accents et détails de socle.",
      baseAdviceDescription: "Concepts de socle avec logique de contraste, ambiance, couleurs de matériaux et recette courte.",
      modelRoles: "Rôles sur le modèle",
      modelRolesDescription: "Aperçu court des couleurs principales générées.",
      paintLadderDescription: "Étapes pratiques pour ombres, basecoat, layers, edge highlights et lumière focale.",
      citadelMatches: "Catalogue de peintures",
      why: "Pourquoi",
      build: "Construction",
      debug: "Debug : couleur principale {hex} | première carte {firstHex} | HSL({h}, {s}%, {l}%) | finition {finish}",
      citadelJsonHint: "Source : data/paint-catalogue.json.",
      recipeMode: "Mode de recette",
      recipeTitle: "Recette {mode} {system}",
      controlStart: "Depart",
      controlColor: "Couleur",
      controlPaletteRules: "Regles de palette",
      controlPaintingPlan: "Plan de peinture",
      controlPaintLibrary: "Bibliotheque de peintures",
      controlSaveShare: "Enregistrer / partager",
      editPaletteColor: "Modifier la couleur",
      lockPaletteColor: "Verrouiller la couleur",
      paletteLocked: "Verrouillée",
      paletteUnlocked: "Déverrouillée",
      rerollPalette: "Varier les couleurs déverrouillées",
      paletteLockHint: "Modifiez une couleur et verrouillez-la pour la conserver. Changer de jeu, de mode ou de schéma réinitialise les couleurs et les verrous."
    },
    systems: {
      aos: "Age of Sigmar",
      k40: "Warhammer 40,000"
    },
    modes: {
      single: "Couleur unique",
      heraldic: "Heraldique"
    },
    factionSchemes: {
      custom: "Roue de couleur personnalisée",
      chooseSubfaction: "Choisir un schéma de sous-faction",
      noSubfactions: "Aucun schéma fixe pour cette faction",
      customHint: "Choisis une faction et une sous-faction pour utiliser un schéma fixe, ou continue avec la roue.",
      missing: "Aucun schéma de faction fixe chargé.",
      selectedMeta: "{faction} : schéma fixe avec {count} couleurs étiquetées.",
      description: "{faction} : {subfaction}, avec le schéma fixe {scheme}.",
      defaultNote: "Utilise les couleurs étiquetées comme recette fixe, puis ajuste finition et socle.",
      paintEquivalents: "Équivalents de peinture",
      noPaintEquivalents: "Aucun équivalent fixe indiqué"
    },
    heraldic: {
      title: "Heraldique deux couleurs",
      description: "{layout} avec balance {ratio}, construit depuis deux couleurs d'armoiries.",
      note: "Traite la couleur de champ et la couleur de charge comme deux couleurs principales. Garde l'accent petit et ombre les blancs par gris, ivoire ou bleu-gris.",
      primaryColor: "Couleur de champ",
      secondaryColor: "Couleur de charge",
      secondaryHexInput: "Entrer la couleur secondaire HEX",
      layout: "Disposition heraldique",
      ratio: "Balance des couleurs",
      accent: "Accent heraldique",
      active: {
        primary: "Couleur de champ",
        secondary: "Couleur de charge"
      },
      layouts: {
        split: "Ecu parti",
        quartered: "Ecartele",
        diagonal: "Diagonal",
        stripe: "Bande centrale",
        border: "Bordure et champ"
      },
      ratios: {
        dominant: "70 / 30",
        balanced: "50 / 50",
        secondary: "40 / 60"
      },
      accents: {
        auto: "Auto",
        autoTrim: "Auto : bordure",
        autoFocal: "Auto : detail focal",
        autoMetal: "Auto : metal heraldique",
        gold: "Or",
        red: "Rouge",
        black: "Noir",
        silver: "Argent",
        lens: "Lentille / magie"
      }
    },
    systemCopy: {
      aos: {
        rolePlannerTitle: "Planificateur de rôles AoS",
        baseAdviceTitle: "Suggestions de socles AoS",
        paintLadderTitle: "AoS Shade / Layer / Highlight",
        finishPrefix: "Finition AoS"
      },
      k40: {
        rolePlannerTitle: "Planificateur de rôles 40K",
        baseAdviceTitle: "Suggestions de socles 40K",
        paintLadderTitle: "40K Shade / Layer / Highlight",
        finishPrefix: "Finition 40K"
      }
    },
    finish: {
      grimdark: "Grimdark",
      weathered: "Usé",
      balanced: "Équilibré",
      clean: "Propre",
      vibrant: "Vibrant",
      summary: {
        grimdark: "Désature les couleurs secondaires, renforce les ombres et garde les points lumineux petits.",
        weathered: "Atténue légèrement les couleurs secondaires et favorise des ombres plus sales.",
        balanced: "Garde la couleur choisie exacte et conserve des suggestions équilibrées.",
        clean: "Ajoute saturation et layers plus clairs pour armures, tissus et héraldique propres.",
        vibrant: "Pousse les couleurs et highlights vers une forte lisibilité de vitrine."
      }
    },
    profiles: {
      aos: {
        balanced: "Modèle Age of Sigmar général",
        stormcast: "Stormcast Eternals",
        death: "Death : Soulblight / Nighthaunt / Ossiarch",
        destruction: "Destruction : Orruks / Ogors / Gloomspite",
        chaos: "Bande du Chaos ou démon",
        wizard: "Sorcier ou héros magique",
        beast: "Monstre, monture, Seraphon ou bête"
      },
      k40: {
        balanced: "Modèle 40K général",
        spaceMarines: "Space Marines / armure énergétique",
        guard: "Astra Militarum / infanterie",
        chaosMarines: "Chaos Space Marines",
        xenos: "Infanterie ou élite xenos",
        tyranids: "Tyranides / essaim organique",
        vehicle: "Véhicule, marcheur ou char"
      }
    },
    baseOptions: {
      auto: "Auto : contraste + faction/profil"
    },
    schemes: {
      complementary: {
        title: "Complémentaire",
        desc: "Contraste fort : couleur principale plus opposée pour accents, lentilles, runes, plasma ou énergie.",
        note: "Utilise la couleur principale sur la majorité des surfaces. La complémentaire fonctionne mieux sur les points focaux."
      },
      split: {
        title: "Complémentaire divisée",
        desc: "Riche en contraste, mais plus facile à contrôler qu'un couple complémentaire pur.",
        note: "Garde la couleur principale dominante. Les deux accents séparent tissus, bannières, marquages ou magie."
      },
      triadic: {
        title: "Triadique",
        desc: "Trois couleurs espacées pour héros, bannières, escouades et identité de faction.",
        note: "Une couleur dirige, la deuxième sert les surfaces secondaires, la troisième reste en détail."
      },
      tetradic: {
        title: "Tétradique",
        desc: "Quatre couleurs en deux paires complémentaires. Puissant, mais demande une hiérarchie claire.",
        note: "Utilise les couleurs en plus pour accents, socles, armes, boucliers, bannières ou marquages."
      },
      limitedPalette: {
        title: "Palette limitée",
        desc: "Un petit ensemble volontaire de 3 à 5 peintures principales pour des armées cohérentes.",
        note: "Répète les mêmes quelques couleurs sur surfaces, matériaux et socles pour garder un schéma contrôlé."
      },
      zorn: {
        title: "Palette Zorn limitee",
        desc: "Schema restreint et pictural inspire par l'ocre, le rouge attenue, l'ivoire et les melanges noir ivoire.",
        note: "Fonctionne mieux avec une couleur principale chaude. Garde le rouge rare, pousse le presque-noir dans les ombres froides et utilise l'ivoire pour lier peau, cuir, os, tissu et socles."
      },
      highContrast: {
        title: "Schéma très contrasté",
        desc: "Forte séparation entre ombres et lumières pour la lisibilité et la peinture d'exposition.",
        note: "Pousse les ombres et les lumières, puis garde l'accent le plus fort près du visage, de l'arme, de la magie ou des lentilles."
      },
      lowContrast: {
        title: "Schéma peu contrasté",
        desc: "Différences subtiles et atténuées pour modèles réalistes, usés, furtifs ou gritty.",
        note: "Garde les transitions proches et laisse texture, saleté, éclats et contraste de matériaux faire le travail."
      },
      analogous: {
        title: "Analogue",
        desc: "Couleurs voisines pour un schéma harmonieux, organique et moins agressif.",
        note: "Excellent pour monstres, robes, esprits, thèmes forestiers, peau, écailles et armées naturelles."
      },
      analogousWide: {
        title: "Analogue large",
        desc: "Cinq teintes liées pour transitions douces, peau de monstre, tissus et grandes surfaces.",
        note: "Les teintes extérieures fonctionnent comme glacis, ombres ou variations de bord."
      },
      monochrome: {
        title: "Monochrome",
        desc: "Une teinte en plusieurs valeurs pour régiments propres, armures grimdark ou escouades disciplinées.",
        note: "Foncé comme shade, couleur principale comme basecoat, variantes claires comme layers et edge highlights."
      },
      zenithal: {
        title: "Zénithal / shade / highlight",
        desc: "Palette de travail : couleur principale plus ombre, layer et edge highlight.",
        note: "Ombre froide dans les creux, couleur principale sur les surfaces, highlight seulement sur les formes nettes."
      },
      accented: {
        title: "Analogue avec accent",
        desc: "Palette calme avec accent opposé fort pour lentilles, runes, plasma ou héraldique.",
        note: "Les couleurs analogues portent le corps. L'accent opposé reste petit et lumineux."
      },
      compound: {
        title: "Compound / double split",
        desc: "Couleur principale, voisine et deux accents opposés. Bon pour héros complexes.",
        note: "Fonctionne sur les personnages avec beaucoup de matériaux. Garde la principale dominante."
      },
      warmCool: {
        title: "Contraste chaud-froid",
        desc: "Zones chaudes et froides pour une bonne lisibilité à distance de jeu.",
        note: "Sépare clairement les zones, par exemple robe chaude contre armure froide."
      },
      boxArt: {
        title: "Schéma box art",
        desc: "Palette de studio propre inspirée des schémas officiels de présentation Games Workshop.",
        note: "Utilise des ombres nettes, des panneaux lisibles, une couleur de marquage claire et un accent focal lumineux."
      },
      eavyMetal: {
        title: "Style 'Eavy Metal",
        desc: "Éclaircissements de bord nets, propres et très contrastés, proches du style studio GW classique.",
        note: "Garde les dégradés propres, les lignes de panneau sombres et les arêtes bien marquées autour du visage, de l'armure et des armes."
      },
      grimdark: {
        title: "Atténué / grimdark",
        desc: "Variantes plus sombres et désaturées avec accent contrôlé pour modèles sales ou réalistes.",
        note: "Washes, chipping à l'éponge, pigments et bords clairs sélectifs comptent plus que de grandes zones saturées."
      },
      blanchitsu: {
        title: "Blanchitsu",
        desc: "Étrange, atténué, sépia, gothique, pictural et sale, inspiré par l'ambiance Warhammer de John Blanche.",
        note: "Utilise couches poussiéreuses, ombres tachées, accents retenus, freehands, weathering et contrastes de matériaux étranges."
      },
      comicBook: {
        title: "Style bande dessinée",
        desc: "Couleurs saturées, lining fort et contraste net pour un rendu graphique illustré.",
        note: "Sépare les formes avec des lignes sombres, pousse les highlights et garde l'accent lisible à distance."
      },
      military: {
        title: "Schéma militaire réaliste",
        desc: "Kaki, olive, tan, gris, verts ternes, weathering et saturation retenue.",
        note: "Utilise surfaces atténuées, marquages pratiques, poussière, rayures, suie et métaux fonctionnels."
      },
      paradeReady: {
        title: "Parade-ready",
        desc: "Standard d'armée propre, lisible et poli avec highlights ordonnés et placement clair.",
        note: "Garde les surfaces propres, les highlights cohérents et les accents assez forts sans devenir bruyants."
      },
      battleReady: {
        title: "Battle-ready",
        desc: "Standard tabletop simple : couleurs de base, shade et quelques highlights pratiques.",
        note: "Priorise couleurs posées, shade contrôlé, socles propres et un ou deux accents lisibles."
      },
      display: {
        title: "Schéma display",
        desc: "Contraste et composition avancés avec ombres, lumières et choix de focalisation raffinés.",
        note: "Planifie les lumières les plus fortes et les accents autour du visage, de l'arme ou du point narratif."
      },
      muted: {
        title: "Schéma atténué",
        desc: "Couleurs désaturées pour peinture réaliste, usée, historique ou inspirée grimdark.",
        note: "Laisse texture et weathering porter l'intérêt tout en gardant la chroma contrôlée."
      },
      saturated: {
        title: "Schéma saturé",
        desc: "Couleurs vives et percutantes pour armées audacieuses et pièces héroïques.",
        note: "Limite les couleurs les plus intenses et garde les ombres lisibles pour équilibrer l'impact."
      },
      pastel: {
        title: "Schéma pastel",
        desc: "Couleurs douces et pâles pour armées inhabituelles, stylisées, magiques, spectrales ou élégantes.",
        note: "Utilise ombres douces et arêtes propres pour que les couleurs pâles semblent volontaires."
      },
      neon: {
        title: "Schéma néon",
        desc: "Accents très brillants pour plasma, lentilles, magie, cyberpunk et lueurs surnaturelles.",
        note: "Garde les zones néon petites et entoure-les de valeurs sombres pour intensifier la lueur."
      },
      realm: {
        title: "Contraste de royaume AoS",
        desc: "Couleur principale plus lueur de royaume, accent surnaturel et ombre ancrée.",
        note: "Pour armées AoS qui veulent une ambiance de royaume sans perdre la lecture principale."
      },
      chapter: {
        title: "Chapitre / escouade 40K",
        desc: "Couleur d'armure, ombre de panneau, marquage de compagnie et accent lentille ou plasma.",
        note: "Pour panneaux d'armure 40K, casques, épaulières, armes et identifiants d'escouade."
      },
      adrianSmith: {
        title: "Atmosphere Adrian Smith",
        desc: "Schema illustre sombre et grave, avec ombres dures, tons moyens uses, lumieres vieillies et accent retenu.",
        note: "Oriente le modele vers armure noircie, tissu enfume, metaux sales, os chaud et petits details focaux agressifs."
      },
      girlyPop: {
        title: "GirlyPop",
        desc: "Rose bonbon, lilas, menthe, rose poudré et or pailleté, avec une version bonbon de ta couleur principale.",
        note: "Garde des couleurs nettes et lumineuses : sous-couches lisses, ombres douces rose ou lilas plutôt que des lavis bruns, et de minuscules détails dorés ou pailletés comme bijoux."
      }
    },
    schemeRoles: {
      primary: "Couleur principale",
      contrast: "Couleur de contraste",
      leftAccent: "Accent gauche",
      rightAccent: "Accent droit",
      secondary: "Couleur secondaire",
      accent: "Couleur d'accent",
      shadow: "Couleur d'ombre",
      highlight: "Couleur de highlight",
      darkNeighbor: "Voisine sombre",
      lightNeighbor: "Voisine claire",
      layer: "Couleur de layer",
      deepShadow: "Ombre profonde",
      edgeHighlight: "Edge highlight",
      basecoat: "Basecoat",
      coolShadow: "Ombre froide",
      warmLayer: "Layer chaud",
      strongAccent: "Accent fort",
      neighbor: "Couleur voisine",
      secondaryAccent: "Accent secondaire",
      coolCounter: "Contre-couleur froide",
      coolAccent: "Accent froid",
      darkBase: "Base sombre",
      dustyLayer: "Layer poussiéreux",
      dirtyAccent: "Accent sale",
      realmGlow: "Lueur de royaume",
      realmAccent: "Accent de royaume",
      realmShadow: "Ombre de royaume",
      armor: "Couleur d'armure",
      panelShade: "Ombre de panneau",
      companyMarking: "Marquage de compagnie",
      lensAccent: "Accent de lentille",
      fieldColor: "Couleur de champ",
      chargeColor: "Couleur de charge",
      fieldShadow: "Ombre du champ",
      chargeShade: "Ombre de charge",
      fieldHighlight: "Highlight du champ",
      chargeHighlight: "Highlight de charge",
      heraldicAccent: "Accent heraldique",
      factionDominant: "Couleur dominante",
      factionSecondary: "Couleur secondaire",
      factionDarkNeutral: "Neutre sombre",
      factionLightNeutral: "Neutre clair",
      factionAccentOne: "Accent 1",
      factionAccentTwo: "Accent 2",
      bubblegum: "Rose bonbon",
      lilac: "Lilas",
      mint: "Menthe",
      blush: "Rose poudré",
      glitterGold: "Or pailleté"
    },
    placements: {
      dominant: "Surface dominante : armure, robe, peau, coque, treillis ou tissu principal.",
      secondary: "Surface secondaire : bouclier, cape, panneau, épaulière, tissu ou armure alternative.",
      contrast: "Zone de contraste : héraldique, gemmes, lueur d'arme, runes, lentilles, plasma ou détails de champion.",
      small: "Petit accent : bordure, marques d'escouade, effets de sort, sceaux de pureté ou détails de socle."
    },
    roleAreas: {
      dominantSurface: "Armure, peau, robe ou tissu principal",
      secondarySurface: "Tissu, bouclier, panneau ou armure secondaire",
      focusAccent: "Accent focal",
      leatherStraps: "Cuir, sangles et sacoches",
      woodWeapons: "Bois, lances, arcs et hampes",
      metalDetails: "Détails métalliques",
      baseDetails: "Socle et bord",
      plateArmor: "Armure de plates",
      clothAndShield: "Tissu, bouclier ou héraldique",
      insignia: "Insignes et bordures",
      weapon: "Arme",
      magicEyes: "Magie, yeux ou gemmes",
      boneGhostRobe: "Os, peau spectrale ou robe",
      tornCloth: "Tissu déchiré ou vieille armure",
      etherealGlow: "Lueur éthérée",
      bonesTrophies: "Os et trophées",
      agedMetal: "Métal vieilli",
      leatherScraps: "Chutes de cuir",
      graveBase: "Socle de tombe ou maudit",
      skinScalesArmor: "Peau, écailles ou armure rugueuse",
      warPaintCloth: "Peinture de guerre, tissu ou bouclier",
      glyphFocus: "Glyphe ou focus de peinture de guerre",
      hidesFurs: "Peaux et fourrures",
      clubsShafts: "Massues et manches",
      roughMetal: "Métal brut",
      dustyBase: "Socle poussiéreux",
      darkArmorMutation: "Armure sombre ou mutation",
      cloakShieldFur: "Cape, bouclier, fourrure ou peau",
      daemonicFocus: "Focus démoniaque",
      brassTrim: "Bordure en laiton",
      leatherTrophies: "Cuir et trophées",
      robeMantle: "Robe ou manteau",
      innerRobe: "Robe intérieure ou écharpe",
      spellEffect: "Effet de sort",
      parchmentTrim: "Parchemin ou bord clair",
      staffWood: "Bois du bâton",
      jewelry: "Bijoux",
      mysticBase: "Socle mystique",
      skinFurScales: "Peau, fourrure ou écailles",
      bellyWingsPlates: "Ventre, membrane d'aile ou plaques",
      eyesMouthMagic: "Yeux, bouche, poison ou magie",
      clawsHornsTeeth: "Griffes, cornes et dents",
      saddleStraps: "Selle et sangles",
      chainsArmor: "Chaînes et fragments d'armure",
      naturalBase: "Socle naturel",
      powerArmorFatigues: "Armure énergétique, treillis ou combinaison principale",
      secondaryPanels: "Panneaux secondaires",
      lensesPlasma: "Lentilles, plasma et capteurs",
      weaponCasing: "Carcasse d'arme",
      gunmetal: "Métal sombre",
      pouchesStraps: "Sacoches et sangles",
      battlefieldBase: "Socle de champ de bataille",
      chapterArmor: "Armure de chapitre",
      pauldronsKnees: "Épaulières, casques et genoux",
      companyMarkings: "Marquages de compagnie",
      aquilaTrim: "Aquila, bordures et honneurs",
      fatiguesCoat: "Treillis ou manteau",
      armorPlates: "Plaques d'armure",
      unitMarkings: "Marquages d'unité",
      traitorArmor: "Armure de traître",
      trimMutations: "Bordures ou mutations",
      warpGlow: "Lueur warp",
      boneTrophies: "Trophées d'os",
      carapaceArmor: "Carapace ou armure",
      clothPanels: "Panneaux de tissu",
      alienEnergy: "Énergie alien",
      boneClaws: "Griffes d'os",
      smoothMetal: "Métal lisse",
      alienBase: "Socle alien",
      fleshSkin: "Chair ou peau",
      bioWeapons: "Bio-armes",
      tongueSacs: "Langue ou sacs",
      hullArmor: "Blindage de coque",
      panelsMarkings: "Panneaux et marquages",
      exhaustDamage: "Dégâts d'échappement et suie",
      ashWasteBase: "Socle de désert de cendres"
    },
    roleUses: {
      dominant: "À utiliser sur la plus grande zone lisible pour donner une identité claire au schéma.",
      secondary: "À utiliser sur les surfaces moyennes pour séparer les formes sans voler le point focal.",
      focus: "À utiliser avec parcimonie près des visages, armes, lentilles, gemmes, magie ou plasma.",
      leather: "À utiliser pour l'équipement pratique comme ceintures, holsters, sangles, bottes et selles.",
      wood: "À utiliser pour hampes, arcs, boucliers, caisses, ruines et texture de champ de bataille.",
      metal: "À utiliser pour lames, bordures, chaînes, armes, évents, boucles et détails mécaniques.",
      base: "Garder le socle en soutien pour que le modèle reste l'objet le plus fort.",
      bone: "À utiliser pour dents, crânes, cornes, griffes, parchemin et trophées.",
      cloth: "À utiliser sur plis, robes, manteaux, bannières, bandages, tabards et équipement souple.",
      weapon: "À utiliser sur bolters, fusils laser, carcasses, poignées, câbles et boîtiers rigides.",
      weathering: "À utiliser dans les échappements, éclats, traces d'huile, coloration thermique et accumulation de saleté.",
      extraPalette: "À utiliser comme couleur de schéma supplémentaire pour accents, marquages, effets, héraldique ou détails spéciaux."
    },
    roleTips: {
      dominant: "Vise environ deux tiers de la figurine visible.",
      secondary: "Garde-la sous la couleur principale en surface.",
      focus: "Petit et lumineux se lit mieux que partout et criard.",
      neutral: "Les neutres aident la palette à respirer.",
      metal: "Ombre-le sombre, puis termine avec un minuscule point clair.",
      base: "Répète très subtilement une couleur du modèle sur le socle si l'ensemble manque d'unité.",
      heroic: "Des éclaircissements de bord nets rendent l'armure d'élite lisible à distance.",
      grim: "Une saturation plus basse et des ombres plus fortes vendent l'ambiance.",
      organic: "Utilise des transitions plus douces sur peau, fourrure, écailles et membranes.",
      weather: "Ajoute rayures, crasse, pigments ou taches après les couleurs de base.",
      bone: "Commence plus chaud à la racine et éclaircis vers la pointe.",
      cloth: "Éclaircis les plis plus largement que les arêtes d'armure dure.",
      extraPalette: "Garde-la intentionnelle et plus petite que les zones principales et secondaires assignées."
    },
    ladder: {
      steps: {
        deepShade: "Ombre profonde",
        shadeWash: "Shade / lavis",
        basecoat: "Couche de base",
        layer: "Couche",
        edgeHighlight: "Éclaircissement de bord",
        focusLight: "Lumière focale",
        darkPrime: "Sous-couche sombre",
        zenithalDrybrush: "Brossage zénithal",
        transparentCoat: "Couche transparente",
        quickHighlight: "Lumière rapide",
        glazeLayer: "Glacis de layer",
        fineHighlight: "Lumière fine"
      },
      hints: {
        deepShade: "Creux profonds et dessous",
        shadeWash: "Lavis contrôlé, pas une inondation",
        basecoat: "Couche principale opaque",
        layer: "Volumes relevés et lumière large",
        edgeHighlight: "Arêtes, coins et contours durs",
        focusLight: "Seulement visage, lentilles, runes, gemmes, plasma ou armes clés",
        darkPrime: "Primer noir, brun sombre ou couleur profonde",
        zenithalDrybrush: "Brossage blanc ou pâle depuis le dessus",
        transparentCoat: "Contrast, speedpaint, encre ou couleur diluée",
        quickHighlight: "Un passage clair sur visage, armes et arêtes supérieures",
        glazeLayer: "Glacis fin de demi-teinte pour lisser la transition",
        fineHighlight: "Arêtes supérieures les plus fines avant les points finaux"
      },
      note: "Usage {system} : armure, tissu, peau, écailles, véhicules, capes ou effets d'énergie. Finition {finish} : garder la lumière focale sélective."
    },
    materials: {
      items: {
        darkWood: {
          name: "Bois sombre",
          use: "Hampes, arcs, caisses, dos de boucliers et bords de socle"
        },
        warmWood: {
          name: "Bois chaud",
          use: "Veines du bois, boucliers, boîtes et éléments de terrain"
        },
        darkLeather: {
          name: "Cuir sombre",
          use: "Ceintures, holsters, bottes, sacs et sangles"
        },
        redLeather: {
          name: "Cuir rougeâtre",
          use: "Armure de cuir, poignées, selles et sacoches"
        },
        offWhite: {
          name: "Blanc cassé",
          use: "Tissu, robes, parchemin, cordes et héraldique"
        },
        bone: {
          name: "Os",
          use: "Crânes, dents, cornes, griffes, parchemin et trophées"
        },
        coldWhite: {
          name: "Blanc froid",
          use: "Points de lumière, gemmes, neige et reflets de lueur"
        },
        blackGrey: {
          name: "Gris noir",
          use: "Sous-combinaisons, carcasses d'armes, ombres et évents"
        },
        iron: {
          name: "Fer",
          use: "Lames, chaînes, boulons, métal sombre et garnitures dures"
        },
        silver: {
          name: "Argent",
          use: "Arêtes métalliques claires, bijoux et machines propres"
        },
        bronze: {
          name: "Bronze",
          use: "Vieilles armures, bordures, idoles, machines et garnitures"
        },
        gold: {
          name: "Or",
          use: "Insignes, honneurs, bijoux, bordures et détails de héros"
        },
        baseEarth: {
          name: "Terre / gravats",
          use: "Sol du socle, poussière, ruines et texture de champ de bataille"
        }
      }
    },
    bases: {
      city: {
        title: "Pavés de Cité Franche",
        use: "Rues pavées, routes de frontière, dalles, débris de bois et maçonnerie tachée de poudre.",
        tip: "Idéal pour infanterie disciplinée, artillerie, cavalerie et campagnes urbaines.",
        recipe: [
          "Base : gris-brun sombre",
          "Texture : pierres, sable, bois brisé",
          "Brossage à sec : gris pâle",
          "Accent : poussière, affiches, touffes d'herbe"
        ]
      },
      ruins: {
        title: "Ruines de temple de portail de royaume",
        use: "Anciennes marches, statues brisées, dalles de temple, éclats de marbre et pierre de royaume fissurée.",
        tip: "Fonctionne pour héros, unités d'élite et modèles qui demandent un socle héroïque propre.",
        recipe: [
          "Base : pierre grise froide",
          "Texture : ardoise, liège, dalles fissurées",
          "Brossage à sec : gris clair",
          "Accent : un peu de mousse ou fissures lumineuses"
        ]
      },
      graveyard: {
        title: "Cimetière / sol maudit",
        use: "Terre froide, pierres tombales, herbe morte, os, brume et maçonnerie sombre en ruine.",
        tip: "Très adapté aux morts-vivants, armées maudites et palettes grimdark froides.",
        recipe: [
          "Base : terre sombre",
          "Texture : gravier, crânes, pierre brisée",
          "Brossage à sec : gris-brun froid",
          "Accent : herbe morte ou os"
        ]
      },
      forest: {
        title: "Sol forestier, racines et mousse",
        use: "Racines, mousse, feuilles, terre humide, branches tombées et végétation de royaume vivant.",
        tip: "Bon pour bêtes, chasseurs, Sylvaneth et schémas naturalistes.",
        recipe: [
          "Base : terre sombre",
          "Texture : racines, écorce, feuilles",
          "Brossage à sec : tan ou vert mousse",
          "Accent : touffes d'herbe"
        ]
      },
      swamp: {
        title: "Marais / zone humide",
        use: "Boue mouillée, roseaux, eau stagnante, algues, os et pierres à moitié englouties.",
        tip: "Utile pour ambiances sales, mortes-vivantes, monstrueuses ou proches de Nurgle.",
        recipe: [
          "Base : brun olive sombre",
          "Texture : boue, roseaux, pierres",
          "Brillant : flaques d'eau",
          "Accent : herbe maladive"
        ]
      },
      desert: {
        title: "Désert, steppe ou poussière ocre",
        use: "Sable sec, terre craquelée, poussière chaude, rochers blanchis au soleil et broussailles rares.",
        tip: "Excellent avec schémas bleus, verts, violets ou froids.",
        recipe: [
          "Base : brun ocre",
          "Texture : sable et rochers",
          "Brossage à sec : os ou sable pâle",
          "Accent : herbe sèche"
        ]
      },
      snow: {
        title: "Neige, givre et pierre pâle",
        use: "Plaques de neige, pierres glacées, herbe givrée, cendre pâle et fragments de marbre froid.",
        tip: "À utiliser avec des modèles sombres pour le contraste de silhouette.",
        recipe: [
          "Base : roche sombre",
          "Brossage à sec : gris pâle",
          "Neige : ajouter par plaques",
          "Accent : cristaux de glace"
        ]
      },
      volcanic: {
        title: "Cendre, lave et sol brûlé",
        use: "Cendre noire, lave craquelée, terre carbonisée, suie, crânes et pierre brûlée.",
        tip: "Bon pour Chaos, ambiances de feu, monstres et accents chauds brillants.",
        recipe: [
          "Base : cendre brun-noir",
          "Texture : pâte craquelée",
          "Brossage à sec : cendre grise",
          "Accent : fissures de lave"
        ]
      },
      arcane: {
        title: "Runes / cristaux arcaniques",
        use: "Pierre runique, cercles de sort, cristaux, livres, fumée et fragments de terrain magique.",
        tip: "Idéal pour sorciers, champions et couleurs d'accent magique fortes.",
        recipe: [
          "Base : pierre neutre",
          "Texture : lignes gravées",
          "Lueur : répéter l'accent focal",
          "Accent : cristaux"
        ]
      },
      ghur: {
        title: "Badlands ghurites",
        use: "Poussière, terre sèche, rochers, boue craquelée, os, débris de trophées et terrain de chasse.",
        tip: "Très bon pour Destruction, monstres et bêtes.",
        recipe: [
          "Base : terre rougeâtre",
          "Texture : rochers et os",
          "Brossage à sec : poussière tan",
          "Accent : touffes sèches"
        ]
      },
      coastal: {
        title: "Côte, récif ou pierre mouillée",
        use: "Rochers humides, flaques de marée, coquillages, docks brisés, fragments de corail et ruines lissées par la mer.",
        tip: "À utiliser pour forces marines, ruines mouillées et monstres aquatiques.",
        recipe: [
          "Base : roche bleu-gris",
          "Texture : sable, coquillages, ardoise",
          "Brillant : flaques de marée",
          "Accent : corail"
        ]
      },
      neutral: {
        title: "Gravats neutres",
        use: "Gravats brun-gris, maçonnerie brisée, terre, racines et petites pierres.",
        tip: "Choix sûr car il soutient les palettes chaudes et froides.",
        recipe: [
          "Base : terre brun-gris",
          "Texture : gravier et pierre",
          "Brossage à sec : tan-gris",
          "Accent : touffes atténuées"
        ]
      },
      darkMud: {
        title: "Boue sombre / terre noircie",
        use: "Sol mouillé, terrain brûlé, terre de tombe, vase de marais ou champ de bataille retourné.",
        tip: "Garde les modèles lumineux bien ancrés.",
        recipe: [
          "Base : ombre brûlée sombre",
          "Texture : boue et gravier",
          "Brillant : zones humides",
          "Accent : herbe morte"
        ]
      },
      lightAsh: {
        title: "Cendre claire, neige ou pierre pâle",
        use: "Désert de cendres, plaques de neige, éclats de marbre, pierre blanchie ou sable sec.",
        tip: "Augmente le contraste de silhouette pour modèles sombres.",
        recipe: [
          "Base : gris-beige pâle",
          "Texture : gravier fin",
          "Brossage à sec : blanc cassé",
          "Accent : pierres sombres"
        ]
      },
      darkRim: {
        title: "Bord sombre et contour contrôlé",
        use: "Bord brun-noir, texture discrète et vieillissement retenu autour du modèle.",
        tip: "Garde le socle visuellement contenu.",
        recipe: [
          "Bord : brun-noir",
          "Garder la texture à l'intérieur",
          "Éviter les couleurs de bord vives",
          "Poussiérer le bas des jambes"
        ]
      },
      urban: {
        title: "Gravats urbains",
        use: "Béton, barres d'armature, poussière, route brisée, ferraille et dégâts d'obus.",
        tip: "Cadre de champ de bataille 40K classique pour infanterie et blindés.",
        recipe: [
          "Base : béton sombre",
          "Texture : gravats et gravier",
          "Brossage à sec : gris froid",
          "Accent : bande de danger ou poussière"
        ]
      },
      ashWaste: {
        title: "Désert de cendres",
        use: "Poussière grise, terre pâle, cratères d'obus, débris rouillés et sol brûlé.",
        tip: "Fonctionne avec la plupart des armées 40K et soutient les armures brillantes.",
        recipe: [
          "Base : cendre gris-brun",
          "Texture : gravier fin",
          "Brossage à sec : poussière pâle",
          "Accent : rouille ou douilles tirées"
        ]
      },
      hive: {
        title: "Pont de ruche / sous-cité",
        use: "Sol métallique sombre, crasse, câbles, évents, marquages de danger et taches d'huile.",
        tip: "Excellent pour 40K industriel, ambiances Necromunda et socles de véhicules.",
        recipe: [
          "Base : métal sombre",
          "Texture : grille ou plaques",
          "Vieillissement : huile et rouille",
          "Accent : couleur de danger"
        ]
      },
      jungle: {
        title: "Jungle de monde mortel",
        use: "Boue dense, lianes, racines, feuilles mouillées, plantes aliens et pierre brisée.",
        tip: "Bon pour xenos, Tyranides, éclaireurs et champs de bataille envahis.",
        recipe: [
          "Base : boue sombre",
          "Texture : racines et feuilles",
          "Brillant : zones humides",
          "Accent : plante vive"
        ]
      },
      alien: {
        title: "Croissance de monde alien",
        use: "Sol violet, cristaux étranges, spores, chitine et végétation surnaturelle.",
        tip: "Soutient les palettes xenos et bio-organiques.",
        recipe: [
          "Base : sol alien atténué",
          "Texture : cristaux ou spores",
          "Brossage à sec : violet pâle",
          "Accent : lueur toxique"
        ]
      },
      shipDeck: {
        title: "Pont de vaisseau",
        use: "Plaques de métal froides, rivets, câbles, lignes de danger et crasse mécanique.",
        tip: "Utile pour abordages, véhicules et scènes navales 40K.",
        recipe: [
          "Base : acier sombre",
          "Texture : plaques et rivets",
          "Vieillissement : crasse",
          "Accent : bande d'avertissement"
        ]
      }
    },
    citadel: {
      loaded: "{count} peintures du catalogue chargées depuis le JSON.",
      sample: "{count} peintures d'exemple utilisées jusqu'au chargement du JSON.",
      missing: "Aucune donnée de catalogue de peintures disponible pour le moment.",
      closest: "Correspondances les plus proches",
      distance: "distance {distance}",
      noCloseOwned: "Aucune de vos peintures n'est assez proche. Peinture du catalogue la plus proche :",
      notOwned: "{name} (non possédée)"
    },
    copy: {
      palette: "Palette",
      roles: "Planificateur de rôles",
      bases: "Suggestions d'environnements de socle",
      ladder: "Shade / Layer / Highlight",
      citadel: "Correspondances du catalogue"
    },
    recipeModes: {
      beginner: {
        title: "Débutant",
        description: "Trois étapes fiables: base, lavis contrôlé et une lumière bien lisible."
      },
      speedpaint: {
        title: "Speedpaint",
        description: "Sous-couche rapide, brossage zénithal, couleur transparente et dernier éclat rapide."
      },
      battle: {
        title: "Battle-ready",
        description: "Recette de table équilibrée avec ombre, base, layer, edge highlight et lumière focale."
      },
      display: {
        title: "Display",
        description: "Glacis supplémentaires et lumières fines pour héros, pièces centrales ou travail de concours."
      }
    },
    ai: {
      customFaction: "★ Mes palettes",
      createdFrom: "Créée par l'assistant à partir de : « {prompt} »",
      createdFromPhoto: "Tirée de la photo « {name} ».",
      source: {
        ai: "Assistant",
        photo: "Photo"
      },
      groupTitle: "Assistant et photo",
      describeLabel: "Décrivez votre schéma",
      describePlaceholder: "p. ex. Space Marines de Nurgle, laiton rouillé, vert maladif, os",
      describeButton: "Créer la palette",
      working: "L'assistant travaille… cela peut prendre jusqu'à une minute.",
      paletteDone: "Palette « {name} » créée et enregistrée dans ★ Mes palettes.",
      unavailable: "L'assistant nécessite le serveur PaintHelper avec l'ordinateur IA connecté.",
      photoLabel: "Palette depuis une photo",
      photoButton: "Choisir une photo",
      photoHint: "Idéal sur fond neutre ; le centre de l'image compte davantage.",
      photoWorking: "Analyse de la photo…",
      photoDone: "Palette « {name} » tirée de la photo.",
      photoError: "Impossible de lire la photo.",
      photoNote: "Extrait d'une photo. Vérifiez les couleurs sous une lumière neutre.",
      deletePalette: "Supprimer cette palette",
      recipeTitle: "Guide de peinture avec vos peintures",
      recipeDescription: "Un guide étape par étape pour la palette actuelle, avec les peintures de votre collection et du catalogue.",
      recipeButton: "Rédiger le guide",
      recipeStop: "Arrêter",
      recipeCopy: "Copier",
      recipeCopied: "Copié.",
      recipeHint: "Utilise {owned} peintures possédées et le catalogue. Vérifiez les noms avant d'acheter.",
      recipeStale: "La palette a changé depuis la rédaction de ce guide.",
      searchTitle: "Rechercher des peintures en mots",
      searchDescription: "Décrivez une couleur, p. ex. « blanc os chaud » ou « cuivre patiné ».",
      searchPlaceholder: "blanc os chaud",
      searchButton: "Rechercher",
      searchEmpty: "Aucune peinture correspondante.",
      searchIndexing: "Préparation du catalogue pour la recherche (une seule fois, environ une minute)…",
      searchUseMain: "Couleur principale",
      searchAddShopping: "Ajouter à la liste d'achats",
      searchOnList: "Sur la liste d'achats",
      searchOwned: "Possédée",
      error: {
        offline: "L'ordinateur IA est injoignable pour le moment.",
        timeout: "L'assistant a mis trop de temps. Veuillez réessayer.",
        busy: "L'assistant est occupé. Réessayez dans un instant.",
        limit: "Limite horaire atteinte. Réessayez plus tard.",
        invalid: "La réponse de l'assistant était inutilisable. Veuillez réessayer.",
        generic: "Une erreur s'est produite. Veuillez réessayer."
      },
      feedbackQuestion: "Que penses-tu de cette palette ?",
      feedbackGood: "J'aime",
      feedbackBad: "Je n'aime pas",
      feedbackCommentGood: "Qu'est-ce qui te plaît particulièrement ? (facultatif)",
      feedbackCommentBad: "Qu'est-ce qui devrait être mieux ? (facultatif)",
      feedbackSend: "Envoyer",
      feedbackThanks: "Merci ! Cela guidera les prochaines suggestions.",
      feedbackRemoved: "Évaluation supprimée.",
      refineLabel: "Améliorer cette palette",
      refinePlaceholder: "p. ex. plus sombre, plus de contraste, accents néon",
      refineButton: "Appliquer",
      refineDone: "Palette ajustée. Les couleurs verrouillées n'ont pas changé.",
      refineNew: "Enregistrée comme nouvelle palette « {name} » dans ★ Mes palettes.",
      undo: "Annuler",
      undone: "Version précédente restaurée.",
      polished: "Le contraste a été renforcé automatiquement.",
      recipeOwnedOnly: "Utiliser seulement mes peintures ({count})",
      recipeFeedbackQuestion: "Ce guide t'a-t-il été utile ?",
      paintUnknown: "Introuvable dans le catalogue – vérifie ce nom de peinture",
      unknownPaints: "Noms de peinture introuvables dans le catalogue : {count} (soulignés en pointillés).",
      addToList: "Ajouter à la liste d'achats",
      onList: "Sur la liste d'achats"
    },
    collection: {
      description: "Tes peintures par marque et gamme. Coche celles que tu possèdes et ajoute les manquantes à la liste d'achats.",
      search: "Chercher : nom, code ou gamme",
      filter: "Filtre",
      filterAll: "Toutes",
      filterOwned: "Possédées",
      filterMissing: "Non possédées",
      filterShopping: "Liste d'achats",
      brands: "Marques",
      allBrands: "Toutes les marques",
      groupOwned: "{owned} sur {count} possédées",
      addToList: "Ajouter à la liste d'achats",
      onList: "Sur la liste d'achats – retirer",
      status: "{owned} possédées · {shopping} sur la liste d'achats · {visible} affichées",
      empty: "Aucune peinture ne correspond à la recherche et aux filtres.",
      more: "Afficher {count} de plus",
      otherGroup: "Autres",
      searchSemantic: "Nom, code ou description – p. ex. « blanc os chaud »",
      searchMeaning: "Par description",
      meaningTitle: "Correspondant à la description"
    },
    theme: {
      label: "Thème",
      auto: "Thème : automatique",
      light: "Thème : clair",
      dark: "Thème : sombre"
    },
    account: {
      menu: "Compte"
    },
    assist: {
      undoReset: "Annuler – récupérer mes couleurs",
      missingTitle: "Peintures manquantes dans ce guide ({count})",
      missingAdd: "Ajouter {count} à la liste d’achats",
      missingAllListed: "Toutes sur la liste d’achats",
      missingSubstitute: "Votre {name} peut la remplacer (écart {distance})",
      missingNone: "Rien de proche dans votre collection",
      missingHint: "Les peintures remplaçables par votre collection ne sont pas ajoutées.",
      jump: "Assistant",
      eyebrow: "Assistant",
      title: "Que voulez-vous peindre ?",
      lead: "Décrivez votre armée ou votre schéma – l'assistant crée la palette, puis un guide pas à pas avec vos peintures.",
      manualHeading: "Réglage manuel",
      writeGuide: "Écrire le guide de peinture",
      openGuide: "Ouvrir le guide de peinture",
      rewriteGuide: "Réécrire",
      examplesLabel: "Exemples",
      recentLabel: "Récents",
      examples: {
        aos: [
          "Stormcast Hallowed Knights, argent et bleu",
          "Hedonites of Slaanesh, pastel et or",
          "Nighthaunt, lueur turquoise spectrale",
          "Skaven Clan Pestilens, rouillé et malade"
        ],
        k40: [
          "Death Guard, laiton rouillé et vert maladif",
          "Ultramarines, propre et lumineux",
          "Emperor's Children en néon",
          "Necrons, lueur verte sur métal sombre"
        ]
      },
      dockPalette: "Palette",
      dockGuide: "Guide",
      dockBench: "Atelier",
      nextArmy: "Vers l'armée →",
      status: {
        ready: "Assistant prêt",
        busy: "Assistant occupé",
        offline: "Assistant hors ligne",
        unknown: ""
      },
      statusBusyWaiting: "Assistant occupé ({count} en attente)",
      statusHint: {
        ready: "L'ordinateur IA répond.",
        busy: "Une autre demande est en cours (p. ex. Paperless) – la vôtre attend son tour.",
        offline: "L'ordinateur IA est injoignable. Les palettes depuis une photo et les guides enregistrés fonctionnent toujours.",
        unknown: ""
      }
    },
    bench: {
      title: "Atelier",
      open: "Atelier",
      close: "Fermer",
      fullscreen: "Plein écran",
      ownModel: "Modèle perso…",
      defaultModel: "Figurine standard",
      modelError: "Impossible d’afficher ce fichier (GLB uniquement).",
      stepOf: "Étape {number} sur {total}",
      stepDone: "Étape {number} faite",
      doneBadge: "Fait",
      doneNext: "Fait, suivant",
      undo: "Marquer comme à faire",
      back: "Retour",
      skip: "Passer",
      finish: "Fermer l'atelier",
      progress: "{done} étapes sur {total} faites"
    },
    army: {
      step: "Armée",
      eyebrow: "Projet d'armée",
      title: "Peignez votre armée",
      import: "Importer une liste d'armée",
      importAnother: "Importer une liste",
      select: "Armée",
      importing: "Lecture de la liste…",
      imported: "« {name} » importée : {units} unités, {models} figurines.",
      reimported: "« {name} » mise à jour : {added} nouvelles unités, {removed} retirées. La progression est conservée.",
      importError: "Le fichier n'a pas pu être lu. Utilisez un export JSON de NewRecruit ou un fichier BattleScribe (.ros/.rosz).",
      saveError: "La progression n'a pas pu être enregistrée.",
      armyWide: "Toute l'armée",
      emptyTitle: "Importez votre liste d'armée",
      emptyText: "Importez une liste depuis NewRecruit ou BattleScribe et cochez chaque figurine au fil de la peinture.",
      emptyStep1: "Dans NewRecruit, ouvrez votre liste et choisissez Export → JSON (BattleScribe : le fichier .rosz).",
      emptyStep2: "Importez-la ici – unités, figurines et points sont repris.",
      emptyStep3: "Choisissez une palette pour l'armée et laissez l'assistant écrire un guide par unité.",
      points: "{points} pts",
      paintedShare: "{percent} % peint",
      painted: "peint",
      modelsPainted: "figurines peintes",
      pointsPainted: "points peints",
      unitsDone: "unités terminées",
      nextTitle: "À peindre ensuite",
      nextProgress: "{painted} sur {total} peintes",
      nextStart: "pas commencée · {points} pts",
      monthlyTitle: "Peint par mois",
      monthlyBar: "{month} : {count} peintes",
      photoAdd: "Ajouter une photo",
      photoChange: "Changer la photo",
      photoRemove: "Retirer la photo",
      photoAlt: "Photo de {unit}",
      photoError: "Impossible de lire la photo.",
      stages: {
        open: "À faire",
        built: "Montée",
        primed: "Sous-couchée",
        painted: "Peinte",
        based: "Socle fini"
      },
      palette: "Palette de l'armée",
      noPalette: "– aucune palette –",
      createPalette: "Créer avec l'assistant",
      paletteSuffix: "couleurs de l'armée",
      showPalette: "Afficher la palette",
      paletteHint: "Les guides utilisent la palette de l'armée. Sans choix, la palette affichée est utilisée.",
      filter: {
        all: "Toutes",
        open: "À faire",
        progress: "En cours",
        done: "Terminées"
      },
      filterLabel: "Afficher les unités",
      showExtras: "Afficher manifestations et décors",
      delete: "Retirer l'armée",
      deleteConfirm: "Vraiment retirer ?",
      deleted: "« {name} » retirée.",
      regimentProgress: "{painted} sur {models} peintes",
      bulk: "Tout mettre à…",
      bulkLabel: "Mettre toutes les figurines de {unit} à une étape",
      new: "nouveau",
      kind: {
        manifestation: "Manifestation",
        terrain: "Décor"
      },
      unitProgress: "{painted} figurines sur {total} peintes",
      modelLabel: "{name} {number} : {stage} – touchez pour l'étape suivante",
      writeGuide: "Écrire le guide",
      rewriteGuide: "Réécrire",
      guideDone: "Guide pour {unit} écrit (palette « {palette} »)."
    },
    kit: {
      title: "Préparer une mallette de peinture",
      expand: "Ouvrir",
      collapse: "Fermer",
      description: "Choisissez des guides enregistrés : l'app liste les pots à emporter depuis votre collection, laisse un pot remplacer des teintes proches et montre ce qui manque.",
      filter: "Filtrer les guides",
      tolerance: "Remplacements",
      toleranceExact: "Peintures exactes seulement",
      toleranceClose: "Très proche (ΔE ≤ 5)",
      toleranceSimilar: "Similaire (ΔE ≤ 10)",
      toleranceLoose: "Voyager léger (ΔE ≤ 15)",
      selectAll: "Tous",
      selectNone: "Aucun",
      noGuides: "Aucun guide enregistré. Rédigez d'abord un guide pour une palette ou une unité.",
      noMatch: "Aucun guide ne correspond au filtre.",
      paletteGuides: "Guides de palettes",
      armyGuides: "Guides d'armée",
      paintCount: "{count} peintures",
      pickGuides: "Cochez les guides que vous voulez peindre.",
      summary: "{guides} guides · {needed} peintures · {pack} pots à emporter · {buy} à acheter.",
      saved: "Les remplacements économisent {count} pots.",
      packTitle: "À emporter ({count})",
      buyTitle: "Absentes de votre collection ({count})",
      standsIn: "aussi pour {names}",
      usedIn: "dans {names}",
      addToList: "Ajouter {count} à la liste d’achats",
      allListed: "Toutes sur la liste d’achats",
      unknown: "Introuvables dans le catalogue : {names}",
      empty: "Les guides choisis ne citent aucune peinture du catalogue.",
      copy: "Copier la liste",
      copied: "Copié",
      copyFailed: "Échec de la copie",
      download: "Télécharger en texte",
      packLabel: "À emporter",
      buyLabel: "À acheter",
      standsInShort: "aussi pour",
      unknownLabel: "Hors catalogue"
    },
    backup: {
      title: "Sauvegarder vos données",
      description: "Téléchargez palettes, guides, projets d'armée, collection et liste d'achats en un fichier, ou restaurez une sauvegarde.",
      export: "Télécharger la sauvegarde",
      import: "Restaurer une sauvegarde…",
      exported: "Sauvegarde de {count} entrées téléchargée.",
      confirm: "Sauvegarde du {date} avec {count} entrées ({areas}). La restauration écrase ces éléments.",
      confirmButton: "Restaurer maintenant",
      restored: "Restauré – rechargement…",
      areas: {
        armies: "projets d'armée",
        guides: "guides",
        palettes: "palettes et réglages",
        kit: "mallette",
        other: "autres"
      },
      errors: {
        not_json: "Ce fichier n'est pas un JSON valide.",
        not_backup: "Ce n'est pas une sauvegarde PaintHelper.",
        too_new: "Cette sauvegarde provient d'une version plus récente.",
        empty: "La sauvegarde ne contient aucune donnée utilisable.",
        save: "Impossible d'enregistrer la sauvegarde sur le serveur – réessayez."
      }
    }
  };
}));
