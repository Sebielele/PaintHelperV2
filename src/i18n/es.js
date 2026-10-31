// Spanish texts for PaintHelperV2. Keep the same keys in all five language files
// (tests/i18n.test.js checks it); src/i18n.js turns them into the translator.
(function (root, factory) {
  const locale = factory();
  root.WPH_LOCALES = Object.assign(root.WPH_LOCALES || {}, { es: locale });
  if (typeof module !== "undefined" && module.exports) {
    module.exports = locale;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  return {
    appTitle: "Warhammer Paint Helper",
    ui: {
      workflow: "Pasos",
      stepPalette: "Paleta",
      stepPlan: "Plan de pintura",
      stepPaints: "Pinturas y material",
      livePalette: "Tu paleta · vista previa",
      nextPlan: "Planificar la pintura →",
      nextPaints: "Buscar pinturas →",
      backPalette: "Volver a la paleta",
      skipWorkspace: "Ir al espacio de trabajo",
      language: "Idioma",
      system: "Sistema de juego",
      eyebrow: "Herramienta de paletas para miniaturas",
      title: "Warhammer Paint Helper",
      subtitle: "Describe tu ejército: el asistente crea la paleta y una guía paso a paso con tus pinturas. Sigue cada miniatura en la página Ejército.",
      mode: "Modo de paleta",
      faction: "Facción",
      subfaction: "Subfacción / esquema fijo",
      activeColor: "Rueda edita",
      mainColor: "Color principal",
      paintProducers: "Fabricantes de pintura",
      unknownProducer: "Fabricante desconocido",
      ownedPaints: "Colores propios",
      ownedPaintsDescription: "Marca los colores del catálogo que tienes y, si quieres, limita las coincidencias a esas pinturas.",
      collapseOwnedPaints: "Contraer",
      expandOwnedPaints: "Expandir",
      onlyOwnedMatches: "Mostrar solo colores propios en las coincidencias",
      importPaintRackCsv: "Importar CSV de PaintRack",
      paintRackImportReportTitle: "Importacion PaintRack",
      paintRackImportSummary: "{matched} colores del catalogo marcados como propios. {custom} colores fuera del catalogo guardados como propios. {skipped} filas omitidas.",
      paintRackMatched: "Coincidencias de catalogo ({count})",
      paintRackNotInCatalogue: "Fuera del catalogo ({count})",
      paintRackStoredOwned: "guardado como propio",
      paintRackSkipped: "Omitidos ({count})",
      paintRackMore: "...y {count} mas",
      paintRackNone: "Ninguno.",
      paintRackLine: "Linea {line}",
      paintRackNoColourData: "sin datos de color del catalogo",
      paintRackImportReadFailed: "No se pudo leer el archivo CSV.",
      close: "Cerrar",
      ownedPaintsStatus: "{owned} colores propios seleccionados. {visible} colores visibles con los filtros actuales.",
      ownedPaintsAllSelected: "Todos los colores visibles están seleccionados.",
      ownedPaintsEmpty: "Ningún color del catálogo coincide con los fabricantes y la búsqueda actuales.",
      ownedBadge: "Propio",
      ownedBadgeLegend: "Insignia Propio = color propio",
      shoppingList: "Lista de compra",
      shoppingListDescription: "Añade colores que no tienes desde los tooltips o buscando en el catálogo, y elimínalos cuando quieras.",
      collapseShoppingList: "Contraer",
      expandShoppingList: "Expandir",
      collapseSection: "Contraer",
      expandSection: "Expandir",
      shoppingSearch: "Buscar colores para comprar",
      shoppingAddColour: "Añadir color",
      addShoppingPaint: "Añadir",
      addToShoppingList: "Añadir a la lista",
      inShoppingList: "En la lista",
      markShoppingPaintOwned: "Marcar como propio",
      removeShoppingPaint: "Quitar",
      shoppingListStatus: "{count} colores en tu lista de compra.",
      shoppingListEmpty: "Tu lista de compra está vacía.",
      shoppingSearchPlaceholder: "Selecciona un color que no tienes ({count})",
      shoppingSearchEmpty: "Ningún color no propio coincide con la búsqueda.",
      paintSearch: "Filtrar colores del catálogo",
      paintSelect: "Elegir color principal del catálogo",
      paintSelectPlaceholder: "Seleccionar pintura ({count})",
      paintSelectEmpty: "Ninguna pintura coincide con los filtros actuales",
      hexInput: "Introducir color HEX directamente",
      scheme: "Esquema de color",
      rolePlanner: "Planificador de roles",
      baseEnvironment: "Entorno de peana",
      saturation: "Saturación",
      lightness: "Luminosidad",
      finishStyle: "Estilo de acabado",
      grimdark: "Grimdark / envejecido",
      clean: "Limpio / vibrante",
      copyPalette: "Copiar paleta",
      profileName: "Nombre del perfil",
      savedProfiles: "Perfiles guardados",
      saveProfile: "Guardar perfil",
      loadProfile: "Cargar",
      deleteProfile: "Eliminar",
      copyShareLink: "Copiar enlace",
      profilePlaceholder: "Elegir perfil",
      noProfiles: "Aun no hay perfiles guardados",
      profileSaved: "{name} guardado.",
      profileLoaded: "{name} cargado.",
      profileDeleted: "{name} eliminado.",
      shareLinkCopied: "Enlace compartible copiado.",
      shareLinkCopyFailed: "No se pudo copiar el enlace compartible.",
      profileMissing: "Elige primero un perfil guardado.",
      copied: "Copiado",
      randomColor: "Variar colores desbloqueados",
      paintingNotes: "Notas de pintura",
      rolePlannerDescription: "Asignaciones concretas para superficies, materiales, acentos focales y detalles de peana.",
      baseAdviceDescription: "Conceptos de peana con lógica de contraste, ambiente, colores de materiales y una receta breve.",
      modelRoles: "Roles del modelo",
      modelRolesDescription: "Resumen breve de los colores principales generados.",
      paintLadderDescription: "Pasos prácticos para sombras, capa base, capas, luces de borde y luz focal.",
      citadelMatches: "Catálogo de pinturas",
      why: "Por qué",
      build: "Construcción",
      debug: "Depuración: color principal {hex} | primera tarjeta de paleta {firstHex} | HSL({h}, {s}%, {l}%) | acabado {finish}",
      citadelJsonHint: "Fuente: data/paint-catalogue.json.",
      recipeMode: "Modo de receta",
      recipeTitle: "Receta {mode} de {system}",
      controlStart: "Inicio",
      controlColor: "Color",
      controlPaletteRules: "Reglas de paleta",
      controlPaintingPlan: "Plan de pintura",
      controlPaintLibrary: "Biblioteca de pinturas",
      controlSaveShare: "Guardar / compartir",
      editPaletteColor: "Editar color",
      lockPaletteColor: "Bloquear color",
      paletteLocked: "Bloqueado",
      paletteUnlocked: "Desbloqueado",
      rerollPalette: "Variar colores desbloqueados",
      paletteLockHint: "Edita un color y bloquéalo para conservarlo. Cambiar de juego, modo o esquema restablece los colores y los bloqueos."
    },
    systems: {
      aos: "Age of Sigmar",
      k40: "Warhammer 40,000"
    },
    modes: {
      single: "Color unico",
      heraldic: "Heraldico"
    },
    factionSchemes: {
      custom: "Rueda de color personalizada",
      chooseSubfaction: "Elegir esquema de subfacción",
      noSubfactions: "No hay esquemas fijos para esta facción",
      customHint: "Elige facción y subfacción para usar un esquema fijo, o sigue con la rueda.",
      missing: "No se han cargado esquemas fijos de facción.",
      selectedMeta: "{faction}: esquema fijo con {count} colores etiquetados.",
      description: "{faction}: {subfaction}, usando el esquema fijo {scheme}.",
      defaultNote: "Usa los colores etiquetados como receta fija y ajusta acabado y peana al gusto.",
      paintEquivalents: "Equivalencias de pintura",
      noPaintEquivalents: "No hay equivalencias fijas indicadas"
    },
    heraldic: {
      title: "Heraldico de dos colores",
      description: "{layout} con balance {ratio}, construido desde dos colores de escudo.",
      note: "Trata el color de campo y el color de carga como dos principales. Mantén pequeno el acento y sombrea blancos con gris, marfil o gris azulado.",
      primaryColor: "Color de campo",
      secondaryColor: "Color de carga",
      secondaryHexInput: "Introducir HEX secundario",
      layout: "Disposicion heraldica",
      ratio: "Balance de color",
      accent: "Acento heraldico",
      active: {
        primary: "Color de campo",
        secondary: "Color de carga"
      },
      layouts: {
        split: "Escudo partido",
        quartered: "Cuartelado",
        diagonal: "Diagonal",
        stripe: "Franja central",
        border: "Borde y campo"
      },
      ratios: {
        dominant: "70 / 30",
        balanced: "50 / 50",
        secondary: "40 / 60"
      },
      accents: {
        auto: "Auto",
        autoTrim: "Auto: ribete",
        autoFocal: "Auto: detalle focal",
        autoMetal: "Auto: metal heraldico",
        gold: "Oro",
        red: "Rojo",
        black: "Negro",
        silver: "Plata",
        lens: "Lente / magia"
      }
    },
    systemCopy: {
      aos: {
        rolePlannerTitle: "Planificador de roles AoS",
        baseAdviceTitle: "Sugerencias de peanas AoS",
        paintLadderTitle: "AoS Sombra / Capa / Luz",
        finishPrefix: "Acabado AoS"
      },
      k40: {
        rolePlannerTitle: "Planificador de roles 40K",
        baseAdviceTitle: "Sugerencias de peanas de batalla 40K",
        paintLadderTitle: "40K Sombra / Capa / Luz",
        finishPrefix: "Acabado 40K"
      }
    },
    finish: {
      grimdark: "Grimdark",
      weathered: "Envejecido",
      balanced: "Equilibrado",
      clean: "Limpio",
      vibrant: "Vibrante",
      summary: {
        grimdark: "Desatura los colores de apoyo, profundiza las sombras y mantiene pequeños los puntos más brillantes.",
        weathered: "Apaga ligeramente los colores de apoyo y favorece sombras más sucias con luces contenidas.",
        balanced: "Mantiene exacto el tono elegido y deja equilibrados los colores derivados, recetas y sugerencias.",
        clean: "Añade saturación y capas más claras para armaduras, telas y heráldica limpias.",
        vibrant: "Empuja colores de apoyo y luces hacia una lectura de alto contraste en vitrina."
      }
    },
    profiles: {
      aos: {
        balanced: "Modelo general de Age of Sigmar",
        stormcast: "Stormcast Eternals",
        death: "Muerte: Soulblight / Nighthaunt / Ossiarch",
        destruction: "Destrucción: Orruks / Ogors / Gloomspite",
        chaos: "Banda del Caos o demonio",
        wizard: "Mago o héroe centrado en magia",
        beast: "Monstruo, montura, Seraphon o bestia"
      },
      k40: {
        balanced: "Modelo general de 40K",
        spaceMarines: "Space Marines / servoarmadura",
        guard: "Astra Militarum / infantería",
        chaosMarines: "Chaos Space Marines",
        xenos: "Infantería xenos o élite",
        tyranids: "Tiránidos / enjambre orgánico",
        vehicle: "Vehículo, andador o tanque"
      }
    },
    baseOptions: {
      auto: "Auto: contraste + facción/perfil"
    },
    schemes: {
      complementary: {
        title: "Complementario",
        desc: "Contraste fuerte: el color principal más su opuesto para acentos, lentes, runas, plasma o energía de armas.",
        note: "Usa el color principal en la mayoría de superficies visibles. El complementario funciona mejor en puntos focales como ojos, armas, escudos, heráldica o efectos de energía."
      },
      split: {
        title: "Complementario dividido",
        desc: "Rico en contraste, pero más fácil de controlar que una pareja complementaria pura.",
        note: "Mantén dominante el color principal. Los dos acentos divididos pueden separar telas, estandartes, marcas de escuadra o efectos mágicos."
      },
      triadic: {
        title: "Triádico",
        desc: "Tres colores espaciados uniformemente para héroes, estandartes, escuadras e identidad de facción.",
        note: "Deja que un color lidere, usa el segundo para superficies secundarias más grandes y reserva el tercero para detalles."
      },
      tetradic: {
        title: "Tetrádico",
        desc: "Cuatro colores en dos parejas complementarias. Potente, pero necesita una jerarquía clara.",
        note: "Usa los colores extra para acentos, detalles de peana, armas, escudos, estandartes o marcas de escuadra."
      },
      limitedPalette: {
        title: "Paleta limitada",
        desc: "Un conjunto deliberadamente pequeño de 3 a 5 pinturas principales para ejércitos coherentes.",
        note: "Repite los mismos pocos colores en superficies, materiales y peanas para que el esquema se vea controlado."
      },
      zorn: {
        title: "Paleta limitada Zorn",
        desc: "Esquema pictorico restringido inspirado en ocre, rojo apagado, marfil y mezclas de negro marfil.",
        note: "Funciona mejor con colores principales calidos. Usa el rojo con moderacion, lleva el casi negro a sombras frias y deja que el marfil una piel, cuero, hueso, tela y peanas."
      },
      highContrast: {
        title: "Esquema de alto contraste",
        desc: "Separación fuerte entre luces y sombras para display y legibilidad en mesa.",
        note: "Empuja sombras profundas y luces brillantes, y reserva el acento más fuerte para cara, arma, magia o lentes."
      },
      lowContrast: {
        title: "Esquema de bajo contraste",
        desc: "Diferencias sutiles y apagadas para modelos realistas, desgastados, furtivos o gritty.",
        note: "Mantén transiciones cercanas y deja que textura, mugre, desconchones y materiales hagan más trabajo."
      },
      analogous: {
        title: "Análogo",
        desc: "Colores vecinos para un esquema armonioso, orgánico y menos agresivo.",
        note: "Excelente para monstruos, túnicas, espíritus, temas forestales, piel, escamas y ejércitos naturalistas."
      },
      analogousWide: {
        title: "Análogo amplio",
        desc: "Cinco tonos relacionados para transiciones suaves, piel de monstruo, capas de tela y superficies grandes.",
        note: "Los tonos exteriores funcionan bien como veladuras, sombras o variación sutil de bordes."
      },
      monochrome: {
        title: "Monocromático",
        desc: "Un tono en varios valores para regimientos limpios, armaduras grimdark o escuadras disciplinadas.",
        note: "Usa la variante oscura como sombra, el color principal como capa base y las variantes claras como capas y luces de borde."
      },
      zenithal: {
        title: "Cenital / sombra / luz",
        desc: "Una paleta práctica de trabajo: color principal más sombra, capa y luz de borde.",
        note: "Usa la sombra fría en recovecos, el color principal en superficies y la luz de borde solo en formas afiladas."
      },
      accented: {
        title: "Análogo con acento",
        desc: "Una paleta base tranquila con un acento opuesto fuerte para lentes, runas, plasma o heráldica.",
        note: "Los colores análogos llevan el cuerpo. Mantén el acento opuesto pequeño y brillante."
      },
      compound: {
        title: "Compuesto / doble dividido",
        desc: "Color principal, un vecino y dos acentos opuestos. Bueno para héroes complejos.",
        note: "Funciona en personajes con muchos materiales. Mantén dominante el color principal."
      },
      warmCool: {
        title: "Contraste cálido-frío",
        desc: "Zonas cálidas y frías para alta legibilidad a distancia de mesa.",
        note: "Separa claramente las zonas cálidas y frías, por ejemplo una túnica cálida contra una armadura fría."
      },
      boxArt: {
        title: "Esquema box art",
        desc: "Paleta limpia de estudio inspirada en los esquemas oficiales de presentación de Games Workshop.",
        note: "Usa sombras nítidas, paneles legibles, un color claro de marca y un acento focal brillante."
      },
      eavyMetal: {
        title: "Estilo 'Eavy Metal",
        desc: "Luces de borde limpias, nítidas y de alto contraste, cercanas al estilo clásico de estudio GW.",
        note: "Mantén degradados limpios, líneas de panel oscuras y bordes afilados en caras, armaduras y armas."
      },
      grimdark: {
        title: "Apagado / grimdark",
        desc: "Variantes más oscuras y desaturadas con un acento controlado para modelos sucios o realistas.",
        note: "Los lavados, desconchones con esponja, pigmentos y bordes brillantes selectivos importan más que grandes áreas saturadas."
      },
      blanchitsu: {
        title: "Blanchitsu",
        desc: "Extraño, apagado, sepia, gótico, pictórico y sucio, inspirado por el ambiente Warhammer de John Blanche.",
        note: "Usa capas polvorientas, sombras manchadas, acentos contenidos, freehands, weathering y contrastes raros de material."
      },
      comicBook: {
        title: "Estilo cómic",
        desc: "Colores saturados, blacklining fuerte y contraste nítido para un aspecto gráfico ilustrado.",
        note: "Separa formas con líneas oscuras, empuja las luces y mantén el acento legible a distancia."
      },
      military: {
        title: "Esquema militar realista",
        desc: "Caqui, oliva, tan, gris, verdes apagados, weathering y saturación contenida.",
        note: "Usa superficies apagadas, marcas prácticas, polvo, arañazos, hollín y metales funcionales."
      },
      paradeReady: {
        title: "Parade-ready",
        desc: "Estándar de ejército limpio, legible y pulido con luces ordenadas y color claro.",
        note: "Mantén superficies limpias, luces consistentes y acentos fuertes sin volverlos ruidosos."
      },
      battleReady: {
        title: "Battle-ready",
        desc: "Estándar sencillo de mesa: colores base, sombra y quizá algunas luces prácticas.",
        note: "Prioriza color bloqueado, sombras controladas, peanas limpias y uno o dos acentos legibles."
      },
      display: {
        title: "Esquema display",
        desc: "Contraste y composición avanzados con sombras, luces y colores focales refinados.",
        note: "Planifica las luces más fuertes y los acentos alrededor de la cara, arma o punto narrativo."
      },
      muted: {
        title: "Esquema apagado",
        desc: "Colores desaturados para pintura realista, desgastada, histórica o inspirada en grimdark.",
        note: "Deja que textura y weathering aporten interés mientras mantienes la saturación controlada."
      },
      saturated: {
        title: "Esquema saturado",
        desc: "Colores brillantes e impactantes para ejércitos atrevidos y miniaturas heroicas.",
        note: "Limita los colores más intensos y conserva sombras legibles para equilibrar el impacto."
      },
      pastel: {
        title: "Esquema pastel",
        desc: "Colores suaves y pálidos para ejércitos inusuales, estilizados, mágicos, espectrales o elegantes.",
        note: "Usa sombras suaves y bordes limpios para que los colores pálidos parezcan intencionales."
      },
      neon: {
        title: "Esquema neón",
        desc: "Acentos muy brillantes para plasma, lentes, magia, cyberpunk y brillos sobrenaturales.",
        note: "Mantén pequeñas las zonas neón y rodéalas de valores oscuros para intensificar el brillo."
      },
      realm: {
        title: "Contraste de reino AoS",
        desc: "Color principal más brillo de reino, acento sobrenatural y una sombra asentada.",
        note: "Creado para ejércitos de Age of Sigmar que necesitan ambiente de reino sin perder la lectura principal de la miniatura."
      },
      chapter: {
        title: "Capítulo 40K / esquema de escuadra",
        desc: "Color de armadura, sombra de panel, marca de compañía y acento de lentes o plasma.",
        note: "Diseñado para paneles de armadura 40K, cascos, hombreras, carcasas de armas e identificadores de escuadra."
      },
      adrianSmith: {
        title: "Atmosfera Adrian Smith",
        desc: "Esquema ilustrado oscuro y serio, con sombras duras, medios gastados, luces envejecidas y un acento contenido.",
        note: "Lleva el modelo hacia armadura ennegrecida, tela ahumada, metales sucios, hueso calido y pequenos detalles focales agresivos."
      },
      girlyPop: {
        title: "GirlyPop",
        desc: "Rosa chicle, lila, menta, rosa palo y oro con purpurina, junto a una versión caramelo de tu color principal.",
        note: "Mantén los colores limpios y luminosos: capas base lisas, sombras suaves en rosa o lila en lugar de lavados marrones y pequeños detalles dorados o con purpurina como joyas."
      }
    },
    schemeRoles: {
      primary: "Color principal",
      contrast: "Color de contraste",
      leftAccent: "Acento izquierdo",
      rightAccent: "Acento derecho",
      secondary: "Color secundario",
      accent: "Color de acento",
      shadow: "Color de sombra",
      highlight: "Color de luz",
      darkNeighbor: "Vecino oscuro",
      lightNeighbor: "Vecino claro",
      layer: "Color de capa",
      deepShadow: "Sombra profunda",
      edgeHighlight: "Luz de borde",
      basecoat: "Capa base",
      coolShadow: "Sombra fría",
      warmLayer: "Capa cálida",
      strongAccent: "Acento fuerte",
      neighbor: "Color vecino",
      secondaryAccent: "Acento secundario",
      coolCounter: "Contracolor frío",
      coolAccent: "Acento frío",
      darkBase: "Tono base oscuro",
      dustyLayer: "Capa polvorienta",
      dirtyAccent: "Acento sucio",
      realmGlow: "Brillo de reino",
      realmAccent: "Acento de reino",
      realmShadow: "Sombra de reino",
      armor: "Color de armadura",
      panelShade: "Sombra de panel",
      companyMarking: "Marca de compañía",
      lensAccent: "Acento de lente",
      fieldColor: "Color de campo",
      chargeColor: "Color de carga",
      fieldShadow: "Sombra de campo",
      chargeShade: "Sombra de carga",
      fieldHighlight: "Luz de campo",
      chargeHighlight: "Luz de carga",
      heraldicAccent: "Acento heraldico",
      factionDominant: "Color dominante",
      factionSecondary: "Color secundario",
      factionDarkNeutral: "Neutro oscuro",
      factionLightNeutral: "Neutro claro",
      factionAccentOne: "Acento 1",
      factionAccentTwo: "Acento 2",
      bubblegum: "Rosa chicle",
      lilac: "Lila",
      mint: "Menta",
      blush: "Rosa palo",
      glitterGold: "Oro con purpurina"
    },
    placements: {
      dominant: "Superficie dominante: armadura, túnica, piel, casco, uniforme o tela principal.",
      secondary: "Superficie secundaria: escudo, capa, panel, hombrera, tela o armadura alternativa.",
      contrast: "Zona de contraste: heráldica, gemas, brillo de arma, runas, lentes, plasma o detalles de campeón.",
      small: "Acento pequeño: ribetes, marcas de escuadra, efectos de hechizo, sellos de pureza o detalles de peana."
    },
    roleAreas: {
      dominantSurface: "Armadura, piel, túnica o tela principal",
      secondarySurface: "Tela, escudo, panel o armadura secundaria",
      focusAccent: "Acento focal",
      leatherStraps: "Cuero, correas y bolsas",
      woodWeapons: "Madera, lanzas, arcos y astiles",
      metalDetails: "Detalles metálicos",
      baseDetails: "Peana y borde",
      plateArmor: "Armadura de placas",
      clothAndShield: "Tela, escudo o heráldica",
      insignia: "Insignias y ribetes",
      weapon: "Arma",
      magicEyes: "Magia, ojos o gemas",
      boneGhostRobe: "Hueso, piel espectral o túnica",
      tornCloth: "Tela rasgada o armadura vieja",
      etherealGlow: "Brillo etéreo",
      bonesTrophies: "Huesos y trofeos",
      agedMetal: "Metal envejecido",
      leatherScraps: "Retales de cuero",
      graveBase: "Peana de tumba o maldita",
      skinScalesArmor: "Piel, escamas o armadura rugosa",
      warPaintCloth: "Pintura de guerra, tela o escudo",
      glyphFocus: "Glifo o foco de pintura de guerra",
      hidesFurs: "Pieles y pelajes",
      clubsShafts: "Mazas y astiles",
      roughMetal: "Metal tosco",
      dustyBase: "Peana polvorienta",
      darkArmorMutation: "Armadura oscura o mutación",
      cloakShieldFur: "Capa, escudo, pelaje o piel",
      daemonicFocus: "Foco demoníaco",
      brassTrim: "Ribete de latón",
      leatherTrophies: "Cuero y trofeos",
      robeMantle: "Túnica o manto",
      innerRobe: "Túnica interior o fajín",
      spellEffect: "Efecto de hechizo",
      parchmentTrim: "Pergamino o ribete pálido",
      staffWood: "Madera del báculo",
      jewelry: "Joyería",
      mysticBase: "Peana mística",
      skinFurScales: "Piel, pelaje o escamas",
      bellyWingsPlates: "Vientre, membrana de ala o placas",
      eyesMouthMagic: "Ojos, boca, veneno o magia",
      clawsHornsTeeth: "Garras, cuernos y dientes",
      saddleStraps: "Silla y correas",
      chainsArmor: "Cadenas y restos de armadura",
      naturalBase: "Peana natural",
      powerArmorFatigues: "Servoarmadura, uniforme o traje principal",
      secondaryPanels: "Paneles secundarios",
      lensesPlasma: "Lentes, plasma y sensores",
      weaponCasing: "Carcasa del arma",
      gunmetal: "Metal oscuro",
      pouchesStraps: "Bolsas y correas",
      battlefieldBase: "Peana de campo de batalla",
      chapterArmor: "Armadura de capítulo",
      pauldronsKnees: "Hombreras, cascos y rodillas",
      companyMarkings: "Marcas de compañía",
      aquilaTrim: "Aquila, ribetes y honores",
      fatiguesCoat: "Uniforme o abrigo",
      armorPlates: "Placas de armadura",
      unitMarkings: "Marcas de unidad",
      traitorArmor: "Armadura traidora",
      trimMutations: "Ribetes o mutaciones",
      warpGlow: "Brillo de la disformidad",
      boneTrophies: "Trofeos de hueso",
      carapaceArmor: "Caparazón o armadura",
      clothPanels: "Paneles de tela",
      alienEnergy: "Energía alienígena",
      boneClaws: "Garras de hueso",
      smoothMetal: "Metal liso",
      alienBase: "Peana alienígena",
      fleshSkin: "Carne o piel",
      bioWeapons: "Bioarmas",
      tongueSacs: "Lengua o sacos",
      hullArmor: "Blindaje del casco",
      panelsMarkings: "Paneles y marcas",
      exhaustDamage: "Daño de escape y hollín",
      ashWasteBase: "Peana de yermo de ceniza"
    },
    roleUses: {
      dominant: "Úsalo en la zona legible más grande para que el esquema tenga una identidad clara.",
      secondary: "Úsalo en superficies medianas para separar formas sin robar el punto focal.",
      focus: "Úsalo con moderación cerca de caras, armas, lentes, gemas, magia o plasma.",
      leather: "Úsalo para equipo práctico como cinturones, pistoleras, correas, botas y sillas.",
      wood: "Úsalo para astiles, arcos, escudos, cajas, ruinas y textura de campo de batalla.",
      metal: "Úsalo para hojas, ribetes, cadenas, armas, respiraderos, hebillas y detalle mecánico.",
      base: "Mantén la peana como apoyo para que el modelo siga siendo el objeto más llamativo.",
      bone: "Úsalo para dientes, cráneos, cuernos, garras, pergamino y trofeos.",
      cloth: "Úsalo en pliegues, túnicas, abrigos, estandartes, vendas, tabardos y equipo blando.",
      weapon: "Úsalo en bolters, rifles láser, carcasas, empuñaduras, cables y cubiertas rígidas.",
      weathering: "Úsalo en escapes, desconchones, marcas de aceite, manchas de calor y acumulación de suciedad.",
      extraPalette: "Úsalo como color extra del esquema para acentos, marcas, efectos, heráldica o detalles especiales."
    },
    roleTips: {
      dominant: "Apunta a unos dos tercios de la miniatura visible.",
      secondary: "Mantén su superficie por debajo del color principal.",
      focus: "Pequeño y brillante se lee mejor que grande y estridente.",
      neutral: "Los neutros ayudan a que la paleta respire.",
      metal: "Sombréalo oscuro y termina con un punto claro diminuto.",
      base: "Repite muy sutilmente un color del modelo en la peana si necesita unidad.",
      heroic: "Las luces de borde afiladas hacen que la armadura de élite se lea a distancia.",
      grim: "Menos saturación y sombras más fuertes venden el ambiente.",
      organic: "Usa transiciones más suaves en piel, pelaje, escamas y membranas.",
      weather: "Añade arañazos, mugre, pigmentos o manchas después de los colores base.",
      bone: "Empieza más cálido en la raíz e ilumina hacia la punta.",
      cloth: "Ilumina los pliegues más ancho que los bordes duros de armadura.",
      extraPalette: "Mantenlo intencional y más pequeño que las zonas principales y secundarias asignadas."
    },
    ladder: {
      steps: {
        deepShade: "Sombra profunda",
        shadeWash: "Sombra / lavado",
        basecoat: "Capa base",
        layer: "Capa",
        edgeHighlight: "Luz de borde",
        focusLight: "Luz focal",
        darkPrime: "Imprimación oscura",
        zenithalDrybrush: "Pincel seco cenital",
        transparentCoat: "Capa transparente",
        quickHighlight: "Luz rápida",
        glazeLayer: "Veladura de capa",
        fineHighlight: "Luz fina"
      },
      hints: {
        deepShade: "Recesos profundos y partes inferiores",
        shadeWash: "Lavado controlado, no inundado",
        basecoat: "Capa principal opaca",
        layer: "Volúmenes elevados y luz amplia",
        edgeHighlight: "Bordes, esquinas y contornos duros",
        focusLight: "Solo cara, lentes, runas, gemas, plasma o armas clave",
        darkPrime: "Imprimación negra, marrón oscura o de color profundo",
        zenithalDrybrush: "Pincel seco blanco o pálido desde arriba",
        transparentCoat: "Contrast, speedpaint, tinta o color diluido",
        quickHighlight: "Una pasada clara en cara, armas y bordes superiores",
        glazeLayer: "Veladura fina de tono medio para suavizar la transición",
        fineHighlight: "Bordes superiores más estrechos antes de los puntos finales"
      },
      note: "Uso en {system}: armadura, tela, piel, escamas, vehículos, capas o efectos de energía. Acabado {finish}: mantén selectiva la luz focal."
    },
    materials: {
      items: {
        darkWood: {
          name: "Madera oscura",
          use: "Astiles, arcos, cajas, reversos de escudos y bordes de peana"
        },
        warmWood: {
          name: "Madera cálida",
          use: "Veta de madera, escudos, cajas y piezas de terreno"
        },
        darkLeather: {
          name: "Cuero oscuro",
          use: "Cinturones, pistoleras, botas, bolsas y correas"
        },
        redLeather: {
          name: "Cuero rojizo",
          use: "Armadura de cuero, empuñaduras, sillas y bolsas"
        },
        offWhite: {
          name: "Blanco roto",
          use: "Tela, túnicas, pergamino, cuerdas y heráldica"
        },
        bone: {
          name: "Hueso",
          use: "Cráneos, dientes, cuernos, garras, pergamino y trofeos"
        },
        coldWhite: {
          name: "Blanco frío",
          use: "Puntos de luz, gemas, nieve y luces de brillo"
        },
        blackGrey: {
          name: "Gris negro",
          use: "Trajes interiores, carcasas de armas, sombras y respiraderos"
        },
        iron: {
          name: "Hierro",
          use: "Hojas, cadenas, pernos, metal oscuro y herrajes duros"
        },
        silver: {
          name: "Plata",
          use: "Bordes metálicos brillantes, joyería y maquinaria limpia"
        },
        bronze: {
          name: "Bronce",
          use: "Armadura vieja, ribetes, ídolos, maquinaria y herrajes"
        },
        gold: {
          name: "Oro",
          use: "Insignias, honores, joyería, ribetes y detalles de héroe"
        },
        baseEarth: {
          name: "Tierra / escombros",
          use: "Suelo de peana, polvo, ruinas y textura de campo de batalla"
        }
      }
    },
    bases: {
      city: {
        title: "Adoquines de Ciudad Libre",
        use: "Calles pavimentadas, caminos fronterizos, losas, restos de madera y mampostería manchada de pólvora.",
        tip: "Ideal para infantería disciplinada, artillería, caballería y campañas urbanas.",
        recipe: [
          "Base: gris marrón oscuro",
          "Textura: piedras, arena, madera rota",
          "Pincel seco: gris pálido",
          "Acento: polvo, carteles, matojos de hierba"
        ]
      },
      ruins: {
        title: "Ruinas de templo de portal de reino",
        use: "Escalones antiguos, estatuas rotas, losas de templo, astillas de mármol y piedra de reino agrietada.",
        tip: "Funciona para héroes, unidades de élite y modelos que necesitan un pedestal heroico limpio.",
        recipe: [
          "Base: piedra gris fría",
          "Textura: pizarra, corcho, losas agrietadas",
          "Pincel seco: gris claro",
          "Acento: un poco de musgo o grietas brillantes"
        ]
      },
      graveyard: {
        title: "Cementerio / suelo maldito",
        use: "Tierra fría, lápidas, hierba muerta, huesos, niebla y mampostería oscura en ruinas.",
        tip: "Encaja muy bien con no muertos, ejércitos malditos y paletas grimdark frías.",
        recipe: [
          "Base: tierra oscura",
          "Textura: gravilla, cráneos, piedra rota",
          "Pincel seco: gris marrón frío",
          "Acento: hierba muerta o hueso"
        ]
      },
      forest: {
        title: "Suelo de bosque, raíces y musgo",
        use: "Raíces, musgo, hojas, tierra húmeda, ramas caídas y vegetación de reino vivo.",
        tip: "Bueno para bestias, cazadores, Sylvaneth y esquemas naturalistas.",
        recipe: [
          "Base: tierra oscura",
          "Textura: raíces, corteza, hojas",
          "Pincel seco: tostado o verde musgo",
          "Acento: matojos de hierba"
        ]
      },
      swamp: {
        title: "Pantano / marisma",
        use: "Barro húmedo, juncos, agua estancada, algas, huesos y piedras medio hundidas.",
        tip: "Útil para ambientes sucios, no muertos, monstruosos o cercanos a Nurgle.",
        recipe: [
          "Base: marrón oliva oscuro",
          "Textura: barro, juncos, piedras",
          "Brillo: charcos de agua",
          "Acento: hierba enfermiza"
        ]
      },
      desert: {
        title: "Desierto, estepa o polvo ocre",
        use: "Arena seca, tierra agrietada, polvo cálido, rocas blanqueadas por el sol y matorral escaso.",
        tip: "Excelente para esquemas azules, verdes, morados o fríos.",
        recipe: [
          "Base: marrón ocre",
          "Textura: arena y rocas",
          "Pincel seco: hueso o arena pálida",
          "Acento: hierba seca"
        ]
      },
      snow: {
        title: "Nieve, escarcha y piedra pálida",
        use: "Parches de nieve, piedras heladas, hierba escarchada, ceniza pálida y fragmentos de mármol frío.",
        tip: "Úsalo con modelos oscuros para contraste de silueta.",
        recipe: [
          "Base: roca oscura",
          "Pincel seco: gris pálido",
          "Nieve: añadir en parches",
          "Acento: cristales de hielo"
        ]
      },
      volcanic: {
        title: "Ceniza, lava y suelo quemado",
        use: "Ceniza negra, lava agrietada, tierra carbonizada, hollín, cráneos y piedra chamuscada.",
        tip: "Bueno para Caos, ambientes de fuego, monstruos y acentos cálidos brillantes.",
        recipe: [
          "Base: ceniza marrón negra",
          "Textura: pasta agrietada",
          "Pincel seco: ceniza gris",
          "Acento: grietas de lava"
        ]
      },
      arcane: {
        title: "Runas / cristales arcanos",
        use: "Piedra rúnica, círculos de hechizo, cristales, libros, humo y fragmentos de terreno mágico.",
        tip: "Ideal para magos, campeones y colores de acento mágico fuertes.",
        recipe: [
          "Base: piedra neutra",
          "Textura: líneas talladas",
          "Brillo: repetir el acento focal",
          "Acento: cristales"
        ]
      },
      ghur: {
        title: "Yermos de Ghur",
        use: "Polvo, tierra seca, rocas, barro agrietado, huesos, restos de trofeos y terreno de caza.",
        tip: "Encaja muy bien con Destrucción, monstruos y bestias.",
        recipe: [
          "Base: tierra rojiza",
          "Textura: rocas y huesos",
          "Pincel seco: polvo tostado",
          "Acento: matojos secos"
        ]
      },
      coastal: {
        title: "Costa, arrecife o piedra húmeda",
        use: "Rocas mojadas, charcas de marea, conchas, muelles rotos, fragmentos de coral y ruinas pulidas por el mar.",
        tip: "Úsalo para fuerzas marinas, ruinas húmedas y monstruos acuáticos.",
        recipe: [
          "Base: roca azul gris",
          "Textura: arena, conchas, pizarra",
          "Brillo: charcas de marea",
          "Acento: coral"
        ]
      },
      neutral: {
        title: "Escombros neutros",
        use: "Escombros marrón gris, mampostería rota, tierra, raíces y piedras pequeñas.",
        tip: "Opción segura porque apoya paletas cálidas y frías.",
        recipe: [
          "Base: tierra marrón gris",
          "Textura: gravilla y piedra",
          "Pincel seco: tostado gris",
          "Acento: matojos apagados"
        ]
      },
      darkMud: {
        title: "Barro oscuro / tierra ennegrecida",
        use: "Suelo mojado, terreno quemado, tierra de tumba, fango de pantano o campo de batalla removido.",
        tip: "Mantiene asentados los modelos brillantes.",
        recipe: [
          "Base: sombra tostada oscura",
          "Textura: barro y gravilla",
          "Brillo: zonas húmedas",
          "Acento: hierba muerta"
        ]
      },
      lightAsh: {
        title: "Ceniza clara, nieve o piedra pálida",
        use: "Yermo de ceniza, parches de nieve, astillas de mármol, piedra blanqueada o arena seca.",
        tip: "Aumenta el contraste de silueta para modelos oscuros.",
        recipe: [
          "Base: gris beige pálido",
          "Textura: gravilla fina",
          "Pincel seco: blanco roto",
          "Acento: piedras oscuras"
        ]
      },
      darkRim: {
        title: "Borde oscuro y contorno controlado",
        use: "Borde marrón negro, textura tranquila y desgaste contenido alrededor del modelo.",
        tip: "Mantiene la peana visualmente contenida.",
        recipe: [
          "Borde: marrón negro",
          "Mantener la textura dentro",
          "Evitar colores de borde brillantes",
          "Empolvar las piernas inferiores"
        ]
      },
      urban: {
        title: "Escombros urbanos",
        use: "Hormigón, barras de refuerzo, polvo, carretera rota, restos metálicos y daños de proyectil.",
        tip: "Enmarcado clásico de campo de batalla 40K para infantería y blindados.",
        recipe: [
          "Base: hormigón oscuro",
          "Textura: escombros y gravilla",
          "Pincel seco: gris frío",
          "Acento: franja de peligro o polvo"
        ]
      },
      ashWaste: {
        title: "Yermo de ceniza",
        use: "Polvo gris, tierra pálida, cráteres de proyectil, restos oxidados y suelo quemado.",
        tip: "Funciona con la mayoría de ejércitos 40K y apoya armaduras brillantes.",
        recipe: [
          "Base: ceniza gris marrón",
          "Textura: gravilla fina",
          "Pincel seco: polvo pálido",
          "Acento: óxido o casquillos gastados"
        ]
      },
      hive: {
        title: "Cubierta de colmena / subciudad",
        use: "Suelo de metal oscuro, mugre, cables, respiraderos, marcas de peligro y manchas de aceite.",
        tip: "Excelente para 40K industrial, ambientes Necromunda y peanas de vehículos.",
        recipe: [
          "Base: metal oscuro",
          "Textura: rejilla o placas",
          "Desgaste: aceite y óxido",
          "Acento: color de peligro"
        ]
      },
      jungle: {
        title: "Jungla de mundo letal",
        use: "Barro denso, enredaderas, raíces, hojas húmedas, plantas alienígenas y piedra rota.",
        tip: "Bueno para xenos, Tiránidos, exploradores y campos de batalla invadidos por vegetación.",
        recipe: [
          "Base: barro oscuro",
          "Textura: raíces y hojas",
          "Brillo: zonas húmedas",
          "Acento: planta brillante"
        ]
      },
      alien: {
        title: "Crecimiento de mundo alienígena",
        use: "Suelo púrpura, cristales extraños, esporas, quitina y vegetación antinatural.",
        tip: "Apoya paletas xenos y bioorgánicas.",
        recipe: [
          "Base: suelo alienígena apagado",
          "Textura: cristales o esporas",
          "Pincel seco: violeta pálido",
          "Acento: brillo tóxico"
        ]
      },
      shipDeck: {
        title: "Cubierta de nave",
        use: "Placas de metal frío, remaches, cables, líneas de peligro y mugre de maquinaria.",
        tip: "Útil para abordajes, vehículos y escenas navales 40K.",
        recipe: [
          "Base: acero oscuro",
          "Textura: placas y remaches",
          "Desgaste: mugre",
          "Acento: franja de advertencia"
        ]
      }
    },
    citadel: {
      loaded: "Se han cargado {count} pinturas del catálogo desde el JSON.",
      sample: "Usando {count} pinturas de muestra hasta que se cargue el JSON.",
      missing: "Aún no hay datos del catálogo de pinturas.",
      closest: "Coincidencias más cercanas",
      distance: "distancia {distance}",
      noCloseOwned: "Ninguna de tus pinturas se acerca lo suficiente. Pintura del catálogo más cercana:",
      notOwned: "{name} (no la tienes)"
    },
    copy: {
      palette: "Paleta",
      roles: "Planificador de roles",
      bases: "Sugerencias de entornos de peana",
      ladder: "Sombra / Capa / Luz",
      citadel: "Equivalencias del catálogo"
    },
    recipeModes: {
      beginner: {
        title: "Principiante",
        description: "Tres pasos fiables: capa base, lavado controlado y una luz legible."
      },
      speedpaint: {
        title: "Speedpaint",
        description: "Imprimación rápida, pincel seco cenital, color transparente y un toque final."
      },
      battle: {
        title: "Battle-ready",
        description: "Receta equilibrada de mesa con sombra, base, capa, luz de borde y luz focal."
      },
      display: {
        title: "Display",
        description: "Veladuras extra y luces finas para héroes, piezas centrales o trabajo de concurso."
      }
    },
    ai: {
      customFaction: "★ Mis paletas",
      createdFrom: "Creada por el asistente a partir de: «{prompt}»",
      createdFromPhoto: "Tomada de la foto «{name}».",
      source: {
        ai: "Asistente",
        photo: "Foto"
      },
      groupTitle: "Asistente y foto",
      describeLabel: "Describe tu esquema",
      describePlaceholder: "p. ej. marines de plaga de Nurgle, latón oxidado, verde enfermizo, hueso",
      describeButton: "Crear paleta",
      working: "El asistente está trabajando… puede tardar hasta un minuto.",
      paletteDone: "Paleta «{name}» creada y guardada en ★ Mis paletas.",
      unavailable: "El asistente necesita el servidor PaintHelper con el ordenador de IA conectado.",
      photoLabel: "Paleta desde una foto",
      photoButton: "Elegir foto",
      photoHint: "Funciona mejor con fondo neutro; el centro de la imagen cuenta más.",
      photoWorking: "Analizando la foto…",
      photoDone: "Paleta «{name}» tomada de la foto.",
      photoError: "No se pudo leer la foto.",
      photoNote: "Extraída de una foto. Comprueba los colores con luz neutra.",
      deletePalette: "Eliminar esta paleta",
      recipeTitle: "Guía de pintura con tus pinturas",
      recipeDescription: "Guía paso a paso para la paleta actual, con pinturas de tu colección y del catálogo.",
      recipeButton: "Escribir guía",
      recipeStop: "Detener",
      recipeCopy: "Copiar",
      recipeCopied: "Copiado.",
      recipeHint: "Usa {owned} pinturas propias y el catálogo. Comprueba los nombres antes de comprar.",
      recipeStale: "La paleta ha cambiado desde que se escribió esta guía.",
      searchTitle: "Buscar pinturas con palabras",
      searchDescription: "Describe un color, p. ej. «blanco hueso cálido» o «cobre envejecido».",
      searchPlaceholder: "blanco hueso cálido",
      searchButton: "Buscar",
      searchEmpty: "No se encontraron pinturas.",
      searchIndexing: "Preparando el catálogo para la búsqueda (una sola vez, alrededor de un minuto)…",
      searchUseMain: "Usar como color principal",
      searchAddShopping: "Añadir a la lista de compra",
      searchOnList: "En la lista de compra",
      searchOwned: "En propiedad",
      error: {
        offline: "El ordenador de IA no está disponible ahora mismo.",
        timeout: "El asistente tardó demasiado. Inténtalo de nuevo.",
        busy: "El asistente está ocupado. Inténtalo de nuevo en un momento.",
        limit: "Límite por hora alcanzado. Inténtalo más tarde.",
        invalid: "La respuesta del asistente no se pudo usar. Inténtalo de nuevo.",
        generic: "Algo salió mal. Inténtalo de nuevo."
      },
      feedbackQuestion: "¿Qué te parece esta paleta?",
      feedbackGood: "Me gusta",
      feedbackBad: "No me gusta",
      feedbackCommentGood: "¿Qué te gusta especialmente? (opcional)",
      feedbackCommentBad: "¿Qué debería mejorar? (opcional)",
      feedbackSend: "Enviar",
      feedbackThanks: "¡Gracias! Esto guiará las próximas sugerencias.",
      feedbackRemoved: "Valoración eliminada.",
      refineLabel: "Mejorar esta paleta",
      refinePlaceholder: "p. ej. más oscura, más contraste, acentos neón",
      refineButton: "Aplicar",
      refineDone: "Paleta ajustada. Los colores bloqueados no han cambiado.",
      refineNew: "Guardada como nueva paleta «{name}» en ★ Mis paletas.",
      undo: "Deshacer",
      undone: "Versión anterior restaurada.",
      polished: "El contraste se ha reforzado automáticamente.",
      recipeOwnedOnly: "Usar solo mis pinturas ({count})",
      recipeFeedbackQuestion: "¿Te ha sido útil la guía?",
      paintUnknown: "No encontrada en el catálogo – revisa este nombre",
      unknownPaints: "Nombres de pintura que no están en el catálogo: {count} (subrayado discontinuo).",
      addToList: "Añadir a la lista de compra",
      onList: "En la lista de compra"
    },
    collection: {
      description: "Tus pinturas por marca y gama. Marca las que tienes y añade las que faltan a la lista de compra.",
      search: "Buscar pinturas: nombre, código o gama",
      filter: "Filtro",
      filterAll: "Todas",
      filterOwned: "En propiedad",
      filterMissing: "Sin tener",
      filterShopping: "Lista de compra",
      brands: "Marcas",
      allBrands: "Todas las marcas",
      groupOwned: "{owned} de {count} en propiedad",
      addToList: "Añadir a la lista de compra",
      onList: "En la lista de compra – quitar",
      status: "{owned} en propiedad · {shopping} en la lista de compra · {visible} mostradas",
      empty: "Ninguna pintura coincide con la búsqueda y los filtros.",
      more: "Mostrar {count} más",
      otherGroup: "Otras",
      searchSemantic: "Nombre, código o descripción – p. ej. «blanco hueso cálido»",
      searchMeaning: "Por descripción",
      meaningTitle: "Según la descripción"
    },
    theme: {
      label: "Tema",
      auto: "Tema: automático",
      light: "Tema: claro",
      dark: "Tema: oscuro"
    },
    account: {
      menu: "Cuenta"
    },
    assist: {
      undoReset: "Deshacer – recuperar mis colores",
      missingTitle: "Pinturas que faltan en esta guía ({count})",
      missingAdd: "Añadir {count} a la lista de compra",
      missingAllListed: "Todas en la lista de compra",
      missingSubstitute: "Tu {name} puede sustituirla (diferencia {distance})",
      missingNone: "Nada parecido en tu colección",
      missingHint: "Las pinturas con sustituto de tu colección no se añaden.",
      jump: "Asistente",
      eyebrow: "Asistente",
      title: "¿Qué quieres pintar?",
      lead: "Describe tu ejército o esquema: el asistente crea la paleta y luego una guía paso a paso con tus pinturas.",
      manualHeading: "Ajuste manual",
      writeGuide: "Escribir guía de pintura",
      openGuide: "Abrir guía de pintura",
      rewriteGuide: "Escribir de nuevo",
      examplesLabel: "Ejemplos",
      recentLabel: "Recientes",
      examples: {
        aos: [
          "Stormcast Hallowed Knights, plata y azul",
          "Hedonites of Slaanesh, pastel con oro",
          "Nighthaunt, brillo turquesa fantasmal",
          "Skaven Clan Pestilens, oxidado y enfermo"
        ],
        k40: [
          "Death Guard, latón oxidado y verde enfermizo",
          "Ultramarines, limpio y brillante",
          "Emperor's Children en neón",
          "Necrons, brillo verde sobre metal oscuro"
        ]
      },
      dockPalette: "Paleta",
      dockGuide: "Guía",
      dockBench: "Mesa",
      nextArmy: "Al ejército →",
      status: {
        ready: "Asistente listo",
        busy: "Asistente ocupado",
        offline: "Asistente sin conexión",
        unknown: ""
      },
      statusBusyWaiting: "Asistente ocupado ({count} en espera)",
      statusHint: {
        ready: "El ordenador de IA responde.",
        busy: "Hay otra petición en curso (p. ej. Paperless): la tuya espera en la cola.",
        offline: "El ordenador de IA no está disponible. Las paletas desde fotos y las guías guardadas siguen funcionando.",
        unknown: ""
      }
    },
    bench: {
      title: "Mesa de pintura",
      open: "Mesa de pintura",
      close: "Cerrar",
      fullscreen: "Pantalla completa",
      ownModel: "Modelo propio…",
      defaultModel: "Figura estándar",
      modelError: "No se puede mostrar este archivo (solo GLB).",
      stepOf: "Paso {number} de {total}",
      stepDone: "Paso {number} hecho",
      doneBadge: "Hecho",
      doneNext: "Hecho, siguiente",
      undo: "Marcar como pendiente",
      back: "Atrás",
      skip: "Saltar",
      finish: "Cerrar la mesa",
      progress: "{done} de {total} pasos hechos"
    },
    army: {
      step: "Ejército",
      eyebrow: "Proyecto de ejército",
      title: "Pinta tu ejército",
      import: "Importar lista de ejército",
      importAnother: "Importar lista",
      select: "Ejército",
      importing: "Leyendo la lista…",
      imported: "«{name}» importado: {units} unidades, {models} miniaturas.",
      reimported: "«{name}» actualizado: {added} unidades nuevas, {removed} eliminadas. El progreso se conserva.",
      importError: "No se pudo leer el archivo. Usa una exportación JSON de NewRecruit o un archivo de BattleScribe (.ros/.rosz).",
      saveError: "No se pudo guardar el progreso.",
      armyWide: "Todo el ejército",
      emptyTitle: "Trae tu lista de ejército",
      emptyText: "Importa una lista de NewRecruit o BattleScribe y marca cada miniatura mientras pintas.",
      emptyStep1: "En NewRecruit abre tu lista y elige Exportar → JSON (BattleScribe: el archivo .rosz).",
      emptyStep2: "Impórtala aquí: se leen unidades, miniaturas y puntos.",
      emptyStep3: "Elige una paleta para el ejército y deja que el asistente escriba una guía por unidad.",
      points: "{points} pts",
      paintedShare: "{percent} % pintado",
      painted: "pintado",
      modelsPainted: "miniaturas pintadas",
      pointsPainted: "puntos pintados",
      unitsDone: "unidades terminadas",
      nextTitle: "Pintar a continuación",
      nextProgress: "{painted} de {total} pintadas",
      nextStart: "sin empezar · {points} pts",
      monthlyTitle: "Pintado por mes",
      monthlyBar: "{month}: {count} pintadas",
      photoAdd: "Añadir foto",
      photoChange: "Cambiar foto",
      photoRemove: "Quitar foto",
      photoAlt: "Foto de {unit}",
      photoError: "No se pudo leer la foto.",
      stages: {
        open: "Pendiente",
        built: "Montada",
        primed: "Imprimada",
        painted: "Pintada",
        based: "Peana lista"
      },
      palette: "Paleta del ejército",
      noPalette: "– sin paleta –",
      createPalette: "Crear con el asistente",
      paletteSuffix: "colores del ejército",
      showPalette: "Ver paleta",
      paletteHint: "Las guías usan la paleta del ejército. Sin elegir una, se usa la paleta mostrada.",
      filter: {
        all: "Todas",
        open: "Pendientes",
        progress: "En curso",
        done: "Terminadas"
      },
      filterLabel: "Mostrar unidades",
      showExtras: "Mostrar manifestaciones y escenografía",
      delete: "Quitar ejército",
      deleteConfirm: "¿Seguro?",
      deleted: "«{name}» quitado.",
      regimentProgress: "{painted} de {models} pintadas",
      bulk: "Todas a…",
      bulkLabel: "Poner todas las miniaturas de {unit} en una etapa",
      new: "nueva",
      kind: {
        manifestation: "Manifestación",
        terrain: "Escenografía"
      },
      unitProgress: "{painted} de {total} miniaturas pintadas",
      modelLabel: "{name} {number}: {stage} – toca para la siguiente etapa",
      writeGuide: "Escribir guía",
      rewriteGuide: "Escribir de nuevo",
      guideDone: "Guía para {unit} escrita (paleta «{palette}»)."
    },
    kit: {
      title: "Preparar el maletín de pintura",
      expand: "Abrir",
      collapse: "Cerrar",
      description: "Elige guías guardadas: la app lista los botes que llevar de tu colección, deja que un bote sustituya colores parecidos y muestra lo que falta.",
      filter: "Filtrar guías",
      tolerance: "Sustitutos",
      toleranceExact: "Solo pinturas exactas",
      toleranceClose: "Muy parecido (ΔE ≤ 5)",
      toleranceSimilar: "Parecido (ΔE ≤ 10)",
      toleranceLoose: "Viajar ligero (ΔE ≤ 15)",
      selectAll: "Todas",
      selectNone: "Ninguna",
      noGuides: "Aún no hay guías guardadas. Escribe primero una guía para una paleta o una unidad.",
      noMatch: "Ninguna guía coincide con el filtro.",
      paletteGuides: "Guías de paletas",
      armyGuides: "Guías del ejército",
      paintCount: "{count} pinturas",
      pickGuides: "Marca las guías que quieres pintar.",
      summary: "{guides} guías · {needed} pinturas · llevar {pack} botes · comprar {buy}.",
      saved: "Los sustitutos ahorran {count} botes.",
      packTitle: "Llevar ({count})",
      buyTitle: "No están en tu colección ({count})",
      standsIn: "también para {names}",
      usedIn: "en {names}",
      addToList: "Añadir {count} a la lista de compra",
      allListed: "Todas en la lista de compra",
      unknown: "No encontradas en el catálogo: {names}",
      empty: "Las guías elegidas no nombran pinturas del catálogo.",
      copy: "Copiar lista",
      copied: "Copiado",
      copyFailed: "No se pudo copiar",
      download: "Descargar como texto",
      packLabel: "Llevar",
      buyLabel: "Comprar",
      standsInShort: "también para",
      unknownLabel: "Fuera del catálogo"
    },
    backup: {
      title: "Copia de seguridad",
      description: "Descarga paletas, guías, proyectos de ejército, colección y lista de compra en un archivo, o recupera una copia.",
      export: "Descargar copia",
      import: "Restaurar copia…",
      exported: "Copia con {count} entradas descargada.",
      confirm: "Copia del {date} con {count} entradas ({areas}). Restaurar sobrescribe estas áreas.",
      confirmButton: "Restaurar ahora",
      restored: "Restaurado – recargando…",
      areas: {
        armies: "proyectos de ejército",
        guides: "guías",
        palettes: "paletas y ajustes",
        kit: "maletín",
        other: "otros"
      },
      errors: {
        not_json: "El archivo no es un JSON válido.",
        not_backup: "No es una copia de PaintHelper.",
        too_new: "La copia procede de una versión más nueva.",
        empty: "La copia no contiene datos utilizables.",
        save: "No se pudo guardar la copia en el servidor; inténtalo de nuevo."
      }
    }
  };
}));
