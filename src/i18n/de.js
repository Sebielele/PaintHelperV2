// German texts for PaintHelperV2. Keep the same keys in all five language files
// (tests/i18n.test.js checks it); src/i18n.js turns them into the translator.
(function (root, factory) {
  const locale = factory();
  root.WPH_LOCALES = Object.assign(root.WPH_LOCALES || {}, { de: locale });
  if (typeof module !== "undefined" && module.exports) {
    module.exports = locale;
  }
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  return {
    appTitle: "Warhammer Paint Helper",
    ui: {
      workflow: "Arbeitsablauf",
      stepPalette: "Farbpalette",
      stepPlan: "Bemalplan",
      stepPaints: "Farben und Zubehör",
      livePalette: "Deine Palette · Live-Vorschau",
      nextPlan: "Bemalung planen →",
      nextPaints: "Farben finden →",
      backPalette: "Zurück zur Palette",
      skipWorkspace: "Zum Arbeitsbereich",
      language: "Sprache",
      system: "Spielsystem",
      eyebrow: "Miniaturen-Paletten-Tool",
      title: "Warhammer Paint Helper",
      subtitle: "Beschreib deine Armee – der Assistent erstellt die Palette und eine Schritt-für-Schritt-Anleitung mit deinen Farben. Den Fortschritt jedes Modells verfolgst du auf der Armee-Seite.",
      mode: "Palettenmodus",
      faction: "Fraktion",
      subfaction: "Unterfraktion / festes Schema",
      activeColor: "Farbrad bearbeitet",
      mainColor: "Hauptfarbe",
      paintProducers: "Farbhersteller",
      unknownProducer: "Unbekannter Hersteller",
      ownedPaints: "Eigene Farben",
      ownedPaintsDescription: "Markiere die Katalogfarben, die du besitzt, und beschränke die nächsten Treffer optional darauf.",
      collapseOwnedPaints: "Einklappen",
      expandOwnedPaints: "Ausklappen",
      onlyOwnedMatches: "Nur eigene Farben bei den nächsten Treffern anzeigen",
      importPaintRackCsv: "PaintRack-CSV importieren",
      paintRackImportReportTitle: "PaintRack-Import",
      paintRackImportSummary: "{matched} Katalogfarben als vorhanden markiert. {custom} Farben ohne Katalogtreffer als vorhanden gespeichert. {skipped} Zeilen uebersprungen.",
      paintRackMatched: "Katalogtreffer ({count})",
      paintRackNotInCatalogue: "Nicht im Katalog ({count})",
      paintRackStoredOwned: "als vorhanden gespeichert",
      paintRackSkipped: "Uebersprungen ({count})",
      paintRackMore: "...und {count} weitere",
      paintRackNone: "Keine.",
      paintRackLine: "Zeile {line}",
      paintRackNoColourData: "keine Katalog-Farbdaten",
      paintRackImportReadFailed: "Die CSV-Datei konnte nicht gelesen werden.",
      close: "Schliessen",
      ownedPaintsStatus: "{owned} eigene Farben ausgewählt. {visible} Farben mit den aktuellen Filtern sichtbar.",
      ownedPaintsAllSelected: "Alle sichtbaren Farben sind ausgewählt.",
      ownedPaintsEmpty: "Keine Katalogfarben passen zu den aktuellen Hersteller- und Suchfiltern.",
      ownedBadge: "Vorhanden",
      ownedBadgeLegend: "Vorhanden-Plakette = eigene Farbe",
      shoppingList: "Einkaufsliste",
      shoppingListDescription: "Füge nicht vorhandene Farben aus Tooltips oder per Katalogsuche hinzu und entferne sie bei Bedarf wieder.",
      collapseShoppingList: "Einklappen",
      expandShoppingList: "Ausklappen",
      collapseSection: "Einklappen",
      expandSection: "Ausklappen",
      shoppingSearch: "Farben zum Kaufen suchen",
      shoppingAddColour: "Farbe hinzufügen",
      addShoppingPaint: "Zur Liste",
      addToShoppingList: "Zur Einkaufsliste",
      inShoppingList: "Auf der Einkaufsliste",
      markShoppingPaintOwned: "Als vorhanden markieren",
      removeShoppingPaint: "Entfernen",
      shoppingListStatus: "{count} Farben auf deiner Einkaufsliste.",
      shoppingListEmpty: "Deine Einkaufsliste ist leer.",
      shoppingSearchPlaceholder: "Nicht vorhandene Farbe auswählen ({count})",
      shoppingSearchEmpty: "Keine nicht vorhandenen Farben passen zur aktuellen Suche.",
      paintSearch: "Katalogfarben filtern",
      paintSelect: "Hauptfarbe aus dem Katalog wählen",
      paintSelectPlaceholder: "Farbe auswählen ({count})",
      paintSelectEmpty: "Keine Farben passen zu den aktuellen Filtern",
      hexInput: "HEX-Farbe direkt eingeben",
      scheme: "Farbschema",
      rolePlanner: "Rollenplaner",
      baseEnvironment: "Base-Umgebung",
      saturation: "Sättigung",
      lightness: "Helligkeit",
      finishStyle: "Finish-Stil",
      grimdark: "Grimdark / verwittert",
      clean: "Sauber / leuchtend",
      copyPalette: "Palette kopieren",
      copied: "Kopiert",
      randomColor: "Ungesperrte Farben würfeln",
      profileName: "Profilname",
      savedProfiles: "Gespeicherte Profile",
      saveProfile: "Profil speichern",
      loadProfile: "Laden",
      deleteProfile: "Loeschen",
      copyShareLink: "Link kopieren",
      profilePlaceholder: "Profil waehlen",
      noProfiles: "Noch keine gespeicherten Profile",
      profileSaved: "{name} gespeichert.",
      profileLoaded: "{name} geladen.",
      profileDeleted: "{name} geloescht.",
      shareLinkCopied: "Teillink kopiert.",
      shareLinkCopyFailed: "Teillink konnte nicht kopiert werden.",
      profileMissing: "Waehle zuerst ein gespeichertes Profil.",
      paintingNotes: "Bemalhinweise",
      rolePlannerDescription: "Konkrete Zuordnung für Flächen, Materialien, Fokusakzente und Base-Details.",
      baseAdviceDescription: "Base-Konzepte mit Kontrastlogik, Stimmung, Materialfarben und kurzem Bau-Rezept.",
      modelRoles: "Rollen am Modell",
      modelRolesDescription: "Kurzüberblick der generierten Hauptfarben.",
      paintLadderDescription: "Praktische Malstufen für Schatten, Basecoat, Layer, Kantenhighlights und Fokuslicht.",
      citadelMatches: "Farbkatalog-Treffer",
      why: "Warum",
      build: "Bau",
      debug: "Debug: Hauptfarbe {hex} | erste Palettenkarte {firstHex} | HSL({h}, {s}%, {l}%) | Finish {finish}",
      citadelJsonHint: "Quelle: data/paint-catalogue.json.",
      recipeMode: "Rezeptmodus",
      recipeTitle: "{system} {mode}-Rezept",
      controlStart: "Start",
      controlColor: "Farbe",
      controlPaletteRules: "Palettenregeln",
      controlPaintingPlan: "Malplan",
      controlPaintLibrary: "Farbbibliothek",
      controlSaveShare: "Speichern / Teilen",
      editPaletteColor: "Farbe bearbeiten",
      lockPaletteColor: "Farbe sperren",
      paletteLocked: "Gesperrt",
      paletteUnlocked: "Ungesperrt",
      rerollPalette: "Ungesperrte Farben würfeln",
      paletteLockHint: "Bearbeite eine Farbe und sperre sie, um sie beizubehalten. Ein Wechsel des Spielsystems, Palettenmodus oder Schemas setzt Anpassungen und Sperren zurück."
    },
    systems: {
      aos: "Age of Sigmar",
      k40: "Warhammer 40.000"
    },
    modes: {
      single: "Einzelfarbe",
      heraldic: "Heraldik"
    },
    factionSchemes: {
      custom: "Eigenes Farbrad",
      chooseSubfaction: "Unterfraktionsschema wählen",
      noSubfactions: "Keine festen Schemas für diese Fraktion",
      customHint: "Wähle Fraktion und Unterfraktion für ein festes Schema oder nutze weiter das Farbrad.",
      missing: "Keine festen Fraktionsschemata geladen.",
      selectedMeta: "{faction}: festes Schema mit {count} beschrifteten Farben.",
      description: "{faction}: {subfaction}, mit dem festen Farbschema {scheme}.",
      defaultNote: "Nutze die beschrifteten Farben als festes Fraktionsrezept und passe Finish und Base nach Geschmack an.",
      paintEquivalents: "Farbentsprechungen",
      noPaintEquivalents: "Keine festen Farbentsprechungen gelistet"
    },
    heraldic: {
      title: "Heraldik mit zwei Farben",
      description: "{layout} mit {ratio} Balance, aus zwei Wappenfarben aufgebaut.",
      note: "Behandle Feld- und Zeichenfarbe als zwei Hauptfarben. Halte den Akzent klein und schattiere Weiss oder helle Farben ueber Grau, Elfenbein oder Blaugrau.",
      primaryColor: "Feldfarbe",
      secondaryColor: "Zeichenfarbe",
      secondaryHexInput: "Sekundaere HEX-Farbe direkt eingeben",
      layout: "Heraldik-Layout",
      ratio: "Farbbalance",
      accent: "Heraldik-Akzent",
      active: {
        primary: "Feldfarbe",
        secondary: "Zeichenfarbe"
      },
      layouts: {
        split: "Geteilter Schild",
        quartered: "Geviert",
        diagonal: "Diagonal",
        stripe: "Mittelstreifen",
        border: "Rand und Feld"
      },
      ratios: {
        dominant: "70 / 30",
        balanced: "50 / 50",
        secondary: "40 / 60"
      },
      accents: {
        auto: "Auto",
        autoTrim: "Auto: Besatz",
        autoFocal: "Auto: Fokusdetail",
        autoMetal: "Auto: Heraldik-Metall",
        gold: "Gold",
        red: "Rot",
        black: "Schwarz",
        silver: "Silber",
        lens: "Linse / Magie"
      }
    },
    systemCopy: {
      aos: {
        rolePlannerTitle: "AoS-Rollenplaner",
        baseAdviceTitle: "AoS-Base-Vorschläge",
        paintLadderTitle: "AoS Shade / Layer / Highlight",
        finishPrefix: "AoS-Finish"
      },
      k40: {
        rolePlannerTitle: "40K-Rollenplaner",
        baseAdviceTitle: "40K-Schlachtfeld-Base-Vorschläge",
        paintLadderTitle: "40K Shade / Layer / Highlight",
        finishPrefix: "40K-Finish"
      }
    },
    finish: {
      grimdark: "Grimdark",
      weathered: "Verwittert",
      balanced: "Ausgewogen",
      clean: "Sauber",
      vibrant: "Leuchtend",
      summary: {
        grimdark: "Entsättigt Nebenfarben, vertieft Schatten und hält die hellsten Punkte klein.",
        weathered: "Dämpft Nebenfarben leicht und bevorzugt schmutzigere Schatten mit kontrollierten Highlights.",
        balanced: "Hält die gewählte Farbe exakt und lässt abgeleitete Farben, Rezepte und Vorschläge ausgewogen.",
        clean: "Erhöht Sättigung und hellere Layer für saubere Rüstung, Stoffe und Heraldik.",
        vibrant: "Schiebt Nebenfarben und Highlights in Richtung hoher Display-Lesbarkeit."
      }
    },
    profiles: {
      aos: {
        balanced: "Allgemeines Age-of-Sigmar-Modell",
        stormcast: "Stormcast Eternals",
        death: "Death: Soulblight / Nighthaunt / Ossiarch",
        destruction: "Destruction: Orruks / Ogors / Gloomspite",
        chaos: "Chaos-Kriegerschar oder Dämon",
        wizard: "Zauberer oder magischer Held",
        beast: "Monster, Reittier, Seraphon oder Bestie"
      },
      k40: {
        balanced: "Allgemeines 40K-Modell",
        spaceMarines: "Space Marines / Servorüstung",
        guard: "Astra Militarum / Infanterie",
        chaosMarines: "Chaos Space Marines",
        xenos: "Xenos-Infanterie oder Elite",
        tyranids: "Tyraniden / organischer Schwarm",
        vehicle: "Fahrzeug, Walker oder Panzer"
      }
    },
    baseOptions: {
      auto: "Auto: Kontrast + Fraktion/Profil"
    },
    schemes: {
      complementary: {
        title: "Komplementär",
        desc: "Starker Kontrast: Hauptfarbe plus Gegenfarbe für Akzente, Linsen, Runen, Plasma oder Waffenenergie.",
        note: "Nutze die Hauptfarbe für den Großteil der sichtbaren Flächen. Die Komplementärfarbe funktioniert am besten auf Fokuspunkten."
      },
      split: {
        title: "Split-Komplementär",
        desc: "Kontrastreich, aber leichter kontrollierbar als ein reines Komplementärpaar.",
        note: "Halte die Hauptfarbe dominant. Die Split-Akzente trennen Stoff, Banner, Markierungen oder Magieeffekte."
      },
      triadic: {
        title: "Triadisch",
        desc: "Drei gleichmäßig verteilte Farben für Helden, Banner, Trupps und Fraktionsidentität.",
        note: "Eine Farbe führt, die zweite trägt Nebenflächen, die dritte bleibt Detail."
      },
      tetradic: {
        title: "Tetradisch",
        desc: "Vier Farben in zwei Komplementärpaaren. Stark, aber es braucht klare Hierarchie.",
        note: "Nutze zusätzliche Farben für Akzente, Bases, Waffen, Schilde, Banner oder Truppmarkierungen."
      },
      limitedPalette: {
        title: "Begrenzte Palette",
        desc: "Eine bewusst kleine Auswahl von 3 bis 5 Hauptfarben für stimmige Armeen und schnelle Entscheidungen.",
        note: "Wiederhole dieselben wenigen Farben auf Flächen, Materialien und Bases, damit das Modell kontrolliert wirkt."
      },
      zorn: {
        title: "Zorn-Palette",
        desc: "Ein malerisches, eingeschraenktes Schema, inspiriert von Ocker, gedaempftem Rot, Elfenbein und Ivory-Black-Mischungen.",
        note: "Am besten mit warmen Hauptfarben. Rot sparsam einsetzen, den Fast-Schwarz-Ton fuer kuehle Schatten nutzen und Elfenbein fuer Haut, Leder, Knochen, Stoff und Bases verbinden."
      },
      highContrast: {
        title: "Kontrastreiches Schema",
        desc: "Starke Trennung zwischen Dunkel und Hell für Display-Malerei und Lesbarkeit auf dem Tisch.",
        note: "Schatten tief und Highlights hell setzen; der stärkste Akzent gehört nahe Gesicht, Waffe, Magie oder Linsen."
      },
      lowContrast: {
        title: "Kontrastarmes Schema",
        desc: "Gedämpfte, subtile Unterschiede für grittige, realistische, verwitterte oder getarnte Modelle.",
        note: "Halte Übergänge eng beieinander und lass Textur, Schmutz, Abplatzer und Materialkontrast arbeiten."
      },
      analogous: {
        title: "Analog",
        desc: "Benachbarte Farben für ein harmonisches, organisches und weniger aggressives Schema.",
        note: "Sehr gut für Monster, Roben, Geister, Waldthemen, Haut, Schuppen und natürliche Armeen."
      },
      analogousWide: {
        title: "Breit analog",
        desc: "Fünf verwandte Farbtöne für weiche Übergänge, Monsterhaut, Stofflagen und große Flächen.",
        note: "Die äußeren Töne funktionieren gut als Lasur, Schatten oder leichte Kantenvariation."
      },
      monochrome: {
        title: "Monochromatisch",
        desc: "Eine Farbe in mehreren Helligkeiten für saubere Regimenter, Grimdark-Rüstung oder disziplinierte Trupps.",
        note: "Dunkel als Shade, Hauptfarbe als Basecoat, helle Varianten als Layer und Kantenhighlight."
      },
      zenithal: {
        title: "Zenithal / Shade / Highlight",
        desc: "Eine praktische Arbeitspalette: Hauptfarbe plus Schatten, Layer und Kantenhighlight.",
        note: "Kalter Schatten in Vertiefungen, Hauptfarbe auf Flächen, Kantenhighlight nur auf scharfen Formen."
      },
      accented: {
        title: "Analog mit Akzent",
        desc: "Ruhige Grundpalette mit starkem Gegenakzent für Linsen, Runen, Plasma oder Heraldik.",
        note: "Analoge Farben tragen den Körper. Der Gegenakzent bleibt klein und hell."
      },
      compound: {
        title: "Compound / Double Split",
        desc: "Hauptfarbe, Nachbarfarbe und zwei Gegenakzente. Gut für komplexe Helden.",
        note: "Funktioniert bei Charaktermodellen mit vielen Materialien. Hauptfarbe dominant halten."
      },
      warmCool: {
        title: "Warm-Kalt-Kontrast",
        desc: "Warme und kalte Bereiche für hohe Lesbarkeit auf Spieltischdistanz.",
        note: "Trenne warme und kalte Zonen klar, etwa warme Robe gegen kalte Rüstung."
      },
      boxArt: {
        title: "Box-Art-Schema",
        desc: "Saubere Studio-Palette, inspiriert von offiziellen Games-Workshop-Präsentationsschemen.",
        note: "Nutze klare Schatten, lesbare Rüstungs- oder Stoffflächen, eine Markierungsfarbe und einen hellen Fokusakzent."
      },
      eavyMetal: {
        title: "'Eavy-Metal-Stil",
        desc: "Saubere, kontrastreiche Kantenhighlights nahe am klassischen GW-Studiolook.",
        note: "Blends sauber halten, Panel-Linien dunkel setzen und Kanten an Gesicht, Rüstung und Waffen scharf highlighten."
      },
      grimdark: {
        title: "Gedämpft / Grimdark",
        desc: "Entsättigte, dunklere Varianten mit kontrolliertem Akzent für schmutzige oder realistischere Modelle.",
        note: "Washes, Schwamm-Chipping, Pigmente und selektive helle Kanten zählen mehr als große gesättigte Flächen."
      },
      blanchitsu: {
        title: "Blanchitsu",
        desc: "Seltsam, gedämpft, sepia, gotisch, malerisch und schmutzig, inspiriert von John Blanches Warhammer-Stimmung.",
        note: "Nutze staubige Layer, fleckige Schatten, sparsame Akzente, Freehands, Weathering und eigenartige Materialkontraste."
      },
      comicBook: {
        title: "Comicbuch-Stil",
        desc: "Gesättigte Farben, starkes Lining und scharfer Kontrast für einen grafischen Illustrationslook.",
        note: "Trenne Formen mit dunklen Linien, setze Highlights mutig und halte den Akzent auf Distanz gut lesbar."
      },
      military: {
        title: "Realistisches Militärschema",
        desc: "Khaki, Oliv, Tan, Grau, matte Grüntöne, Weathering und zurückhaltende Sättigung.",
        note: "Nutze gedämpfte Flächen, praktische Markierungen, Staub, Kratzer, Ruß und funktionale Metalle."
      },
      paradeReady: {
        title: "Parade-ready",
        desc: "Sauberer, lesbarer und polierter Armeestandard mit ordentlichen Highlights und klarer Farbplatzierung.",
        note: "Flächen sauber halten, Highlights konsistent setzen und Akzente stark, aber nicht laut verwenden."
      },
      battleReady: {
        title: "Battle-ready",
        desc: "Einfacher Tabletop-Standard: Grundfarben, Shade und wenige praktische Highlights.",
        note: "Priorisiere blockierte Farben, kontrollierte Shades, saubere Bases und ein bis zwei lesbare Akzente."
      },
      display: {
        title: "Display-Schema",
        desc: "Fortgeschrittener Kontrast und Komposition mit verfeinerten Schatten, Highlights und Fokusfarben.",
        note: "Plane die hellsten Lichter und stärksten Akzente um Gesicht, Waffe oder erzählerischen Mittelpunkt."
      },
      muted: {
        title: "Gedämpftes Schema",
        desc: "Entsättigte Farben für realistische, verwitterte, historische oder grimdark-inspirierte Bemalung.",
        note: "Lass Oberflächentextur und Weathering interessant wirken, während die Farbstärke kontrolliert bleibt."
      },
      saturated: {
        title: "Gesättigtes Schema",
        desc: "Helle, kräftige Farben mit hoher Wirkung für mutige Armeen und heroische Mittelpunktmodelle.",
        note: "Begrenze die intensivsten Farben und halte die Schatten lesbar, damit die Palette nicht kippt."
      },
      pastel: {
        title: "Pastellschema",
        desc: "Weiche, helle Farben für ungewöhnliche, stilisierte, magische, geisterhafte oder elegante Armeen.",
        note: "Nutze sanfte Schatten und saubere Kanten, damit die blassen Farben bewusst statt unfertig wirken."
      },
      neon: {
        title: "Neonschema",
        desc: "Sehr helle Akzente für Plasma, Linsen, Magie, Cyberpunk-Effekte und übernatürliches Leuchten.",
        note: "Halte Neonflächen klein und umgib sie mit dunkleren Werten, damit das Leuchten intensiv wirkt."
      },
      realm: {
        title: "AoS-Realm-Kontrast",
        desc: "Hauptfarbe plus Realm-Glow, übernatürlicher Akzent und geerdeter Schatten.",
        note: "Für Age-of-Sigmar-Armeen, die Realm-Stimmung brauchen, ohne die Hauptlesbarkeit zu verlieren."
      },
      chapter: {
        title: "40K-Chapter / Truppschema",
        desc: "Rüstungsfarbe, Panel-Schatten, Kompaniemarkierung und Linsen- oder Plasmaakzent.",
        note: "Für 40K-Rüstungspanel, Helme, Schulterpanzer, Waffen und Truppkennzeichen."
      },
      adrianSmith: {
        title: "Adrian-Smith-Atmosphaere",
        desc: "Dunkles, ernstes Illustrationsschema mit harten Schatten, abgenutzten Mittentoenen, gealterten Highlights und sparsamem Akzent.",
        note: "Setze auf geschwaerzte Ruestung, rauchigen Stoff, schmutzige Metalle, warmen Knochen und kleine aggressive Fokusdetails."
      },
      girlyPop: {
        title: "GirlyPop",
        desc: "Bubblegum-Pink, Flieder, Mint, Zartrosa und Glitzergold, dazu eine Bonbon-Variante deiner Hauptfarbe.",
        note: "Halte die Farben sauber und hell: glatte Grundierung, sanfte Schatten in Rosa oder Flieder statt brauner Washes und winzige Gold- oder Glitzerdetails als Schmuck."
      }
    },
    schemeRoles: {
      primary: "Hauptfarbe",
      contrast: "Kontrastfarbe",
      leftAccent: "Akzent links",
      rightAccent: "Akzent rechts",
      secondary: "Sekundärfarbe",
      accent: "Akzentfarbe",
      shadow: "Schattenfarbe",
      highlight: "Highlightfarbe",
      darkNeighbor: "Dunkler Nebenton",
      lightNeighbor: "Heller Nebenton",
      layer: "Layerfarbe",
      deepShadow: "Tiefer Schatten",
      edgeHighlight: "Kantenhighlight",
      basecoat: "Basecoat",
      coolShadow: "Kalter Schatten",
      warmLayer: "Warmer Layer",
      strongAccent: "Starker Akzent",
      neighbor: "Nebenton",
      secondaryAccent: "Sekundärakzent",
      coolCounter: "Kalte Gegenfarbe",
      coolAccent: "Kalter Akzent",
      darkBase: "Dunkler Grundton",
      dustyLayer: "Staubiger Layer",
      dirtyAccent: "Schmutziger Akzent",
      realmGlow: "Realm-Glow",
      realmAccent: "Realm-Akzent",
      realmShadow: "Realm-Schatten",
      armor: "Rüstungsfarbe",
      panelShade: "Panel-Schatten",
      companyMarking: "Kompaniemarkierung",
      lensAccent: "Linsenakzent",
      fieldColor: "Feldfarbe",
      chargeColor: "Zeichenfarbe",
      fieldShadow: "Feldschatten",
      chargeShade: "Zeichenschatten",
      fieldHighlight: "Feldhighlight",
      chargeHighlight: "Zeichenhighlight",
      heraldicAccent: "Heraldik-Akzent",
      factionDominant: "Dominante Farbe",
      factionSecondary: "Sekundärfarbe",
      factionDarkNeutral: "Dunkler Neutralton",
      factionLightNeutral: "Heller Neutralton",
      factionAccentOne: "Akzent 1",
      factionAccentTwo: "Akzent 2",
      bubblegum: "Bubblegum-Pink",
      lilac: "Flieder",
      mint: "Mint",
      blush: "Zartrosa",
      glitterGold: "Glitzergold"
    },
    placements: {
      dominant: "Dominante Fläche: Rüstung, Robe, Haut, Rumpf, Uniform oder Hauptstoff.",
      secondary: "Sekundäre Fläche: Schild, Umhang, Panel, Schulterpanzer, Stoff oder zweite Rüstung.",
      contrast: "Kontrastbereich: Heraldik, Edelsteine, Waffenglühen, Runen, Linsen, Plasma oder Championdetails.",
      small: "Kleiner Akzent: Besatz, Truppmarkierungen, Zaubereffekte, Reinheitssiegel oder Base-Details."
    },
    roleAreas: {
      dominantSurface: "Rüstung, Haut, Robe oder Hauptstoff",
      secondarySurface: "Stoff, Schild, Panel oder sekundäre Rüstung",
      focusAccent: "Fokusakzent",
      leatherStraps: "Leder, Riemen und Taschen",
      woodWeapons: "Holz, Speere, Bögen und Schäfte",
      metalDetails: "Metalldetails",
      baseDetails: "Base und Rand",
      plateArmor: "Plattenrüstung",
      clothAndShield: "Stoff, Schild oder Heraldik",
      insignia: "Insignien und Besatz",
      weapon: "Waffe",
      magicEyes: "Magie, Augen oder Edelsteine",
      boneGhostRobe: "Knochen, Geisterhaut oder Robe",
      tornCloth: "Zerrissener Stoff oder alte Rüstung",
      etherealGlow: "Ätherisches Leuchten",
      bonesTrophies: "Knochen und Trophäen",
      agedMetal: "Gealtertes Metall",
      leatherScraps: "Lederreste",
      graveBase: "Grab- oder Fluchbase",
      skinScalesArmor: "Haut, Schuppen oder grobe Rüstung",
      warPaintCloth: "Kriegsbemalung, Stoff oder Schild",
      glyphFocus: "Glyphen- oder Kriegsbemalungsfokus",
      hidesFurs: "Häute und Felle",
      clubsShafts: "Keulen und Schäfte",
      roughMetal: "Raues Metall",
      dustyBase: "Staubige Base",
      darkArmorMutation: "Dunkle Rüstung oder Mutation",
      cloakShieldFur: "Umhang, Schild, Fell oder Haut",
      daemonicFocus: "Dämonischer Fokus",
      brassTrim: "Messingbesatz",
      leatherTrophies: "Leder und Trophäen",
      robeMantle: "Robe oder Mantel",
      innerRobe: "Innere Robe oder Schärpe",
      spellEffect: "Zaubereffekt",
      parchmentTrim: "Pergament oder heller Besatz",
      staffWood: "Stabholz",
      jewelry: "Schmuck",
      mysticBase: "Mystische Base",
      skinFurScales: "Haut, Fell oder Schuppen",
      bellyWingsPlates: "Bauch, Flügelmembran oder Platten",
      eyesMouthMagic: "Augen, Maul, Gift oder Magie",
      clawsHornsTeeth: "Klauen, Hörner und Zähne",
      saddleStraps: "Sattel und Riemen",
      chainsArmor: "Ketten und Rüstungsreste",
      naturalBase: "Natürliche Base",
      powerArmorFatigues: "Servorüstung, Uniform oder Hauptanzug",
      secondaryPanels: "Sekundäre Panels",
      lensesPlasma: "Linsen, Plasma und Sensoren",
      weaponCasing: "Waffengehäuse",
      gunmetal: "Gunmetal",
      pouchesStraps: "Taschen und Riemen",
      battlefieldBase: "Schlachtfeldbase",
      chapterArmor: "Ordensrüstung",
      pauldronsKnees: "Schulterpanzer, Helme und Knie",
      companyMarkings: "Kompaniemarkierungen",
      aquilaTrim: "Aquila, Besatz und Ehrenzeichen",
      fatiguesCoat: "Uniform oder Mantel",
      armorPlates: "Rüstungsplatten",
      unitMarkings: "Einheitenmarkierungen",
      traitorArmor: "Verräterrüstung",
      trimMutations: "Besatz oder Mutationen",
      warpGlow: "Warp-Leuchten",
      boneTrophies: "Knochentrophäen",
      carapaceArmor: "Carapax oder Rüstung",
      clothPanels: "Stoffbahnen",
      alienEnergy: "Alien-Energie",
      boneClaws: "Knochenklauen",
      smoothMetal: "Glattes Metall",
      alienBase: "Alien-Base",
      fleshSkin: "Fleisch oder Haut",
      bioWeapons: "Biowaffen",
      tongueSacs: "Zunge oder Säcke",
      hullArmor: "Rumpfpanzerung",
      panelsMarkings: "Panels und Markierungen",
      exhaustDamage: "Abgasschäden und Ruß",
      ashWasteBase: "Aschewüstenbase"
    },
    roleUses: {
      dominant: "Für die größte lesbare Fläche nutzen, damit das Schema eine klare Identität hat.",
      secondary: "Auf mittleren Flächen einsetzen, um Formen zu trennen, ohne den Fokus zu stehlen.",
      focus: "Sparsam nahe Gesichtern, Waffen, Linsen, Edelsteinen, Magie oder Plasma verwenden.",
      leather: "Für praktische Ausrüstung wie Gürtel, Holster, Riemen, Stiefel und Sättel nutzen.",
      wood: "Für Schäfte, Bögen, Schilde, Kisten, Ruinen und Schlachtfeldstruktur verwenden.",
      metal: "Für Klingen, Besatz, Ketten, Waffen, Lüftungen, Schnallen und mechanische Details nutzen.",
      base: "Die Base unterstützend halten, damit das Modell das lauteste Objekt bleibt.",
      bone: "Für Zähne, Schädel, Hörner, Klauen, Pergament und Trophäen nutzen.",
      cloth: "Auf Falten, Roben, Mänteln, Bannern, Wickeln, Wappenröcken und weicher Ausrüstung verwenden.",
      weapon: "Auf Boltern, Lasguns, Gehäusen, Griffen, Kabeln und harten Abdeckungen nutzen.",
      weathering: "Für Auspuffspuren, Kratzer, Ölmarken, Hitzefärbung und Schmutzaufbau verwenden.",
      extraPalette: "Als zusätzliche Schemafarbe für Akzente, Markierungen, Effekte, Heraldik oder Sonderdetails nutzen."
    },
    roleTips: {
      dominant: "Ziele auf ungefähr zwei Drittel der sichtbaren Miniatur.",
      secondary: "Unter der Hauptfarbe in der Flächenwirkung halten.",
      focus: "Klein und hell liest sich besser als überall und laut.",
      neutral: "Neutrale Töne lassen die Palette atmen.",
      metal: "Dunkel schattieren und mit einem winzigen hellen Punkt abschließen.",
      base: "Eine Modellfarbe sehr subtil auf der Base wiederholen, wenn Einheit fehlt.",
      heroic: "Scharfe Kantenhighlights lassen Eliterüstung aus Entfernung lesen.",
      grim: "Niedrigere Sättigung und stärkere Schatten verkaufen die Stimmung.",
      organic: "Weichere Übergänge auf Haut, Fell, Schuppen und Membranen nutzen.",
      weather: "Kratzer, Schmutz, Pigmente oder Flecken nach den Grundfarben ergänzen.",
      bone: "An der Wurzel wärmer beginnen und zur Spitze hin aufhellen.",
      cloth: "Falten breiter highlighten als harte Rüstungskanten.",
      extraPalette: "Bewusst einsetzen und kleiner halten als die zugewiesenen Haupt- und Sekundärflächen."
    },
    ladder: {
      steps: {
        deepShade: "Tiefe Schatten",
        shadeWash: "Shade / Wash",
        basecoat: "Grundschicht",
        layer: "Layer",
        edgeHighlight: "Kantenhighlight",
        focusLight: "Fokuslicht",
        darkPrime: "Dunkle Grundierung",
        zenithalDrybrush: "Zenithal-Drybrush",
        transparentCoat: "Transparente Schicht",
        quickHighlight: "Schnelles Highlight",
        glazeLayer: "Lasurschicht",
        fineHighlight: "Feines Highlight"
      },
      hints: {
        deepShade: "Tiefe Vertiefungen und Unterseiten",
        shadeWash: "Kontrollierter Wash, keine Flutung",
        basecoat: "Deckende Hauptschicht",
        layer: "Erhöhte Volumen und breites Licht",
        edgeHighlight: "Kanten, Ecken und harte Konturen",
        focusLight: "Nur Gesicht, Linsen, Runen, Edelsteine, Plasma oder Schlüsselwaffen",
        darkPrime: "Schwarze, dunkelbraune oder tief farbige Grundierung",
        zenithalDrybrush: "Weißer oder heller Drybrush von oben",
        transparentCoat: "Contrast, Speedpaint, Ink oder verdünnte Farbe",
        quickHighlight: "Ein heller Durchgang auf Gesicht, Waffen und Oberkanten",
        glazeLayer: "Dünne Mittelton-Lasur zum Glätten des Übergangs",
        fineHighlight: "Schmalste obere Kanten vor den finalen Punkten"
      },
      note: "{system}-Einsatz: Rüstung, Stoff, Haut, Schuppen, Fahrzeuge, Umhänge oder Energieeffekte. {finish}-Finish: Fokuslicht selektiv halten."
    },
    materials: {
      items: {
        darkWood: {
          name: "Dunkles Holz",
          use: "Schäfte, Bögen, Kisten, Schildrücken und Baseränder"
        },
        warmWood: {
          name: "Warmes Holz",
          use: "Holzmaserung, Schilde, Boxen und Geländeteile"
        },
        darkLeather: {
          name: "Dunkles Leder",
          use: "Gürtel, Holster, Stiefel, Taschen und Riemen"
        },
        redLeather: {
          name: "Rötliches Leder",
          use: "Lederrüstung, Griffe, Sättel und Beutel"
        },
        offWhite: {
          name: "Gebrochenes Weiß",
          use: "Stoff, Roben, Pergament, Seile und Heraldik"
        },
        bone: {
          name: "Knochen",
          use: "Schädel, Zähne, Hörner, Klauen, Pergament und Trophäen"
        },
        coldWhite: {
          name: "Kaltes Weiß",
          use: "Lichtpunkte, Edelsteine, Schnee und Glanzlichter"
        },
        blackGrey: {
          name: "Schwarzgrau",
          use: "Unteranzüge, Waffengehäuse, Schatten und Lüftungen"
        },
        iron: {
          name: "Eisen",
          use: "Klingen, Ketten, Bolzen, Gunmetal und harte Beschläge"
        },
        silver: {
          name: "Silber",
          use: "Helle Metallkanten, Schmuck und saubere Maschinen"
        },
        bronze: {
          name: "Bronze",
          use: "Alte Rüstung, Besatz, Idole, Maschinen und Beschläge"
        },
        gold: {
          name: "Gold",
          use: "Insignien, Ehrenzeichen, Schmuck, Besatz und Heldendetails"
        },
        baseEarth: {
          name: "Erde / Geröll",
          use: "Baseboden, Staub, Ruinen und Schlachtfeldstruktur"
        }
      }
    },
    bases: {
      city: {
        title: "Pflaster der Freien Stadt",
        use: "Gepflasterte Straßen, Grenzwege, Steinplatten, Holztrümmer und pulverbeschmutztes Mauerwerk.",
        tip: "Am besten für disziplinierte Infanterie, Artillerie, Kavallerie und urbane Kampagnen.",
        recipe: [
          "Basis: dunkles Graubraun",
          "Textur: Steine, Sand, gebrochenes Holz",
          "Trockenbürsten: helles Grau",
          "Akzent: Staub, Plakate, Grasbüschel"
        ]
      },
      ruins: {
        title: "Realmgate-Tempelruinen",
        use: "Alte Stufen, zerbrochene Statuen, Tempelplatten, Marmorsplitter und rissiger Reichstein.",
        tip: "Funktioniert für Helden, Eliteeinheiten und Modelle, die einen sauberen heroischen Sockel brauchen.",
        recipe: [
          "Basis: kühler grauer Stein",
          "Textur: Schiefer, Kork, rissige Platten",
          "Trockenbürsten: helles Grau",
          "Akzent: etwas Moos oder leuchtende Risse"
        ]
      },
      graveyard: {
        title: "Friedhof / verfluchte Erde",
        use: "Kalte Erde, Grabsteine, totes Gras, Knochen, Nebel und dunkles Ruinenmauerwerk.",
        tip: "Starke Wahl für Untote, verfluchte Armeen und kalte Grimdark-Paletten.",
        recipe: [
          "Basis: dunkle Erde",
          "Textur: Grit, Schädel, gebrochener Stein",
          "Trockenbürsten: kaltes Graubraun",
          "Akzent: totes Gras oder Knochen"
        ]
      },
      forest: {
        title: "Waldboden, Wurzeln und Moos",
        use: "Wurzeln, Moos, Blätter, feuchte Erde, gefallene Äste und Vegetation des Lebensreichs.",
        tip: "Gut für Bestien, Jäger, Sylvaneth und naturalistische Schemata.",
        recipe: [
          "Basis: dunkle Erde",
          "Textur: Wurzeln, Rinde, Blätter",
          "Trockenbürsten: Tan oder Moosgrün",
          "Akzent: Grasbüschel"
        ]
      },
      swamp: {
        title: "Sumpf / Marschland",
        use: "Nasser Schlamm, Schilf, stehendes Wasser, Algen, Knochen und halb versunkene Steine.",
        tip: "Nützlich für schmutzige, untote, monströse oder Nurgle-nahe Stimmungen.",
        recipe: [
          "Basis: dunkles Olivbraun",
          "Textur: Schlamm, Schilf, Steine",
          "Glanz: Wasserpfützen",
          "Akzent: kränkliches Gras"
        ]
      },
      desert: {
        title: "Wüste, Steppe oder Ockerstaub",
        use: "Trockener Sand, rissige Erde, warmer Staub, sonnengebleichte Felsen und karger Bewuchs.",
        tip: "Ausgezeichnet für blaue, grüne, violette oder kalte Schemata.",
        recipe: [
          "Basis: Ockerbraun",
          "Textur: Sand und Felsen",
          "Trockenbürsten: Knochen oder heller Sand",
          "Akzent: trockenes Gras"
        ]
      },
      snow: {
        title: "Schnee, Frost und heller Stein",
        use: "Schneeflecken, eisige Steine, Frostgras, helle Asche und kalte Marmorstücke.",
        tip: "Mit dunklen Modellen für Silhouettenkontrast verwenden.",
        recipe: [
          "Basis: dunkler Fels",
          "Trockenbürsten: helles Grau",
          "Schnee: in Flecken auftragen",
          "Akzent: Eiskristalle"
        ]
      },
      volcanic: {
        title: "Asche, Lava und verbrannter Boden",
        use: "Schwarze Asche, rissige Lava, verkohlte Erde, Ruß, Schädel und verbrannter Stein.",
        tip: "Gut für Chaos, Feuerstimmungen, Monster und helle warme Akzente.",
        recipe: [
          "Basis: schwarzbraune Asche",
          "Textur: Crackle-Paste",
          "Trockenbürsten: graue Asche",
          "Akzent: Lavarisse"
        ]
      },
      arcane: {
        title: "Arkane Runen / Kristalle",
        use: "Runenstein, Zauberkreise, Kristalle, Bücher, Rauch und magische Geländefragmente.",
        tip: "Am besten für Zauberer, Champions und starke magische Akzentfarben.",
        recipe: [
          "Basis: neutraler Stein",
          "Textur: eingeritzte Linien",
          "Leuchten: Fokusakzent wiederholen",
          "Akzent: Kristalle"
        ]
      },
      ghur: {
        title: "Ghurische Badlands",
        use: "Staub, trockene Erde, Felsen, rissiger Schlamm, Knochen, Trophäenreste und Jagdgrund.",
        tip: "Starke Wahl für Destruction, Monster und Bestien.",
        recipe: [
          "Basis: rötliche Erde",
          "Textur: Felsen und Knochen",
          "Trockenbürsten: Tan-Staub",
          "Akzent: trockene Büschel"
        ]
      },
      coastal: {
        title: "Küste, Riff oder nasser Stein",
        use: "Nasse Felsen, Gezeitentümpel, Muscheln, gebrochene Stege, Korallenstücke und meeresglatte Ruinen.",
        tip: "Für Seestreitkräfte, nasse Ruinen und aquatische Monster verwenden.",
        recipe: [
          "Basis: blaugrauer Fels",
          "Textur: Sand, Muscheln, Schiefer",
          "Glanz: Gezeitentümpel",
          "Akzent: Koralle"
        ]
      },
      neutral: {
        title: "Neutrales Geröll",
        use: "Braungraues Geröll, gebrochenes Mauerwerk, Erde, Wurzeln und kleine Steine.",
        tip: "Sichere Vorgabe, weil sie warme und kalte Paletten unterstützt.",
        recipe: [
          "Basis: braungraue Erde",
          "Textur: Grit und Stein",
          "Trockenbürsten: Tan-Grau",
          "Akzent: gedeckte Büschel"
        ]
      },
      darkMud: {
        title: "Dunkler Schlamm / geschwärzte Erde",
        use: "Nasser Boden, verbrannter Grund, Graberde, Sumpfschlamm oder aufgewühltes Schlachtfeld.",
        tip: "Hält helle Modelle geerdet.",
        recipe: [
          "Basis: dunkler Umbra",
          "Textur: Schlamm und Grit",
          "Glanz: nasse Stellen",
          "Akzent: totes Gras"
        ]
      },
      lightAsh: {
        title: "Helle Asche, Schnee oder heller Stein",
        use: "Aschewüste, Schneeflecken, Marmorsplitter, gebleichter Stein oder trockener Sand.",
        tip: "Erhöht den Silhouettenkontrast für dunkle Modelle.",
        recipe: [
          "Basis: helles Graubeige",
          "Textur: feiner Grit",
          "Trockenbürsten: gebrochenes Weiß",
          "Akzent: dunkle Steine"
        ]
      },
      darkRim: {
        title: "Dunkler Rand und kontrollierte Kante",
        use: "Schwarzbrauner Rand, ruhige Textur und zurückhaltende Verwitterung um das Modell.",
        tip: "Hält die Base visuell eingefasst.",
        recipe: [
          "Rand: schwarzbraun",
          "Textur innen halten",
          "Helle Randfarben vermeiden",
          "Untere Beine bestauben"
        ]
      },
      urban: {
        title: "Urbanes Geröll",
        use: "Beton, Armierung, Staub, gebrochene Straße, Metallschrott und Granatschäden.",
        tip: "Klassische 40K-Schlachtfeldrahmung für Infanterie und Panzerung.",
        recipe: [
          "Basis: dunkler Beton",
          "Textur: Geröll und Grit",
          "Trockenbürsten: kaltes Grau",
          "Akzent: Warnstreifen oder Staub"
        ]
      },
      ashWaste: {
        title: "Aschewüste",
        use: "Grauer Staub, helle Erde, Granattrichter, rostige Trümmer und verbrannter Boden.",
        tip: "Funktioniert mit den meisten 40K-Armeen und unterstützt helle Rüstung.",
        recipe: [
          "Basis: graubraune Asche",
          "Textur: feiner Grit",
          "Trockenbürsten: heller Staub",
          "Akzent: Rost oder leere Hülsen"
        ]
      },
      hive: {
        title: "Makropoldeck / Unterstadt",
        use: "Dunkler Metallboden, Schmutz, Kabel, Lüftungen, Warnmarkierungen und Ölflecken.",
        tip: "Großartig für industrielle 40K-, Necromunda-Stimmungen und Fahrzeugbases.",
        recipe: [
          "Basis: dunkles Metall",
          "Textur: Gitter oder Platten",
          "Weathering: Öl und Rost",
          "Akzent: Warnfarbe"
        ]
      },
      jungle: {
        title: "Todeswelt-Dschungel",
        use: "Dichter Schlamm, Ranken, Wurzeln, nasse Blätter, Alien-Pflanzen und gebrochener Stein.",
        tip: "Gut für Xenos, Tyraniden, Scouts und überwucherte Schlachtfelder.",
        recipe: [
          "Basis: dunkler Schlamm",
          "Textur: Wurzeln und Blätter",
          "Glanz: nasse Bereiche",
          "Akzent: helle Pflanze"
        ]
      },
      alien: {
        title: "Alienwelt-Bewuchs",
        use: "Violetter Boden, fremde Kristalle, Sporen, Chitin und unnatürliche Vegetation.",
        tip: "Unterstützt Xenos- und bioorganische Paletten.",
        recipe: [
          "Basis: gedeckter Alienboden",
          "Textur: Kristalle oder Sporen",
          "Trockenbürsten: helles Violett",
          "Akzent: toxisches Leuchten"
        ]
      },
      shipDeck: {
        title: "Schiffsdeck",
        use: "Kalte Metallplatten, Nieten, Kabel, Warnlinien und Maschinenschmutz.",
        tip: "Nützlich für Enteraktionen, Fahrzeuge und maritime 40K-Szenen.",
        recipe: [
          "Basis: dunkler Stahl",
          "Textur: Platten und Nieten",
          "Weathering: Schmutz",
          "Akzent: Warnstreifen"
        ]
      }
    },
    citadel: {
      loaded: "{count} Farben aus dem Katalog-JSON geladen.",
      sample: "{count} Beispielfarben werden genutzt, bis das Katalog-JSON geladen ist.",
      missing: "Noch keine Farbkatalogdaten verfügbar.",
      closest: "Nächste Treffer",
      distance: "Abstand {distance}",
      noCloseOwned: "Keine deiner Farben liegt nah genug. Nächste Katalogfarbe:",
      notOwned: "{name} (nicht vorhanden)"
    },
    copy: {
      palette: "Palette",
      roles: "Rollenplaner",
      bases: "Base-Umgebungsvorschläge",
      ladder: "Shade / Layer / Highlight",
      citadel: "Farbkatalog-Treffer"
    },
    recipeModes: {
      beginner: {
        title: "Einsteiger",
        description: "Drei verlässliche Schritte am Maltisch: Grundschicht, kontrollierter Wash und ein lesbares Highlight."
      },
      speedpaint: {
        title: "Speedpaint",
        description: "Schnelle Grundierung, Zenithal-Drybrush, transparente Farbe und ein kurzer Schlussakzent."
      },
      battle: {
        title: "Battle-ready",
        description: "Ausgewogenes Tabletop-Rezept mit Schatten, Basis, Layer, Kantenhighlight und Fokuslicht."
      },
      display: {
        title: "Display",
        description: "Zusätzliche Lasuren und feine Highlights für Helden, Centerpieces oder Wettbewerbsarbeit."
      }
    },
    ai: {
      customFaction: "★ Eigene Paletten",
      createdFrom: "Vom Assistenten erstellt aus: „{prompt}“",
      createdFromPhoto: "Aus dem Foto „{name}“ übernommen.",
      source: {
        ai: "Assistent",
        photo: "Foto"
      },
      groupTitle: "Assistent & Foto",
      describeLabel: "Beschreibe dein Farbschema",
      describePlaceholder: "z. B. Nurgle-Seuchenmarines, rostiges Messing, krankes Grün, Knochen",
      describeButton: "Palette erstellen",
      working: "Der Assistent arbeitet… das kann bis zu einer Minute dauern.",
      paletteDone: "Palette „{name}“ erstellt und unter ★ Eigene Paletten gespeichert.",
      unavailable: "Der Assistent braucht den PaintHelper-Server mit verbundenem KI-Rechner.",
      photoLabel: "Palette aus einem Foto",
      photoButton: "Foto wählen",
      photoHint: "Am besten vor neutralem Hintergrund; die Bildmitte zählt stärker.",
      photoWorking: "Foto wird analysiert…",
      photoDone: "Palette „{name}“ aus dem Foto übernommen.",
      photoError: "Das Foto konnte nicht gelesen werden.",
      photoNote: "Aus einem Foto übernommen. Prüfe die Farben bei neutralem Licht.",
      deletePalette: "Diese Palette löschen",
      recipeTitle: "Bemalanleitung mit deinen Farben",
      recipeDescription: "Schritt-für-Schritt-Anleitung zur aktuellen Palette, mit Farben aus deiner Sammlung und dem Katalog.",
      recipeButton: "Anleitung schreiben",
      recipeStop: "Stopp",
      recipeCopy: "Kopieren",
      recipeCopied: "Kopiert.",
      recipeHint: "Nutzt {owned} eigene Farben und den Katalog. Farbnamen vor dem Kauf prüfen.",
      recipeStale: "Die Palette hat sich seit dieser Anleitung geändert.",
      searchTitle: "Farben in Worten suchen",
      searchDescription: "Beschreibe eine Farbe, z. B. „warmes Knochenweiss“ oder „verwittertes Kupfer“.",
      searchPlaceholder: "warmes Knochenweiss",
      searchButton: "Suchen",
      searchEmpty: "Keine passenden Farben gefunden.",
      searchIndexing: "Katalog wird für die Suche vorbereitet (einmalig, etwa eine Minute)…",
      searchUseMain: "Als Hauptfarbe",
      searchAddShopping: "Auf die Einkaufsliste",
      searchOnList: "Auf der Einkaufsliste",
      searchOwned: "Vorhanden",
      error: {
        offline: "Der KI-Rechner ist gerade nicht erreichbar.",
        timeout: "Der Assistent hat zu lange gebraucht. Bitte nochmal versuchen.",
        busy: "Der Assistent ist beschäftigt. Bitte gleich nochmal versuchen.",
        limit: "Stundenlimit erreicht. Bitte später nochmal versuchen.",
        invalid: "Die Antwort des Assistenten war unbrauchbar. Bitte nochmal versuchen.",
        generic: "Etwas ist schiefgelaufen. Bitte nochmal versuchen."
      },
      feedbackQuestion: "Wie gefällt dir diese Palette?",
      feedbackGood: "Gefällt mir",
      feedbackBad: "Gefällt mir nicht",
      feedbackCommentGood: "Was gefällt dir besonders? (optional)",
      feedbackCommentBad: "Was soll besser werden? (optional)",
      feedbackSend: "Senden",
      feedbackThanks: "Danke! Das fliesst in künftige Vorschläge ein.",
      feedbackRemoved: "Bewertung entfernt.",
      refineLabel: "Diese Palette nachbessern",
      refinePlaceholder: "z. B. dunkler, mehr Kontrast, Akzente neon",
      refineButton: "Anwenden",
      refineDone: "Palette angepasst. Gesperrte Farben sind geblieben.",
      refineNew: "Als neue Palette „{name}“ unter ★ Eigene Paletten gespeichert.",
      undo: "Rückgängig",
      undone: "Vorherige Version wiederhergestellt.",
      polished: "Der Kontrast wurde automatisch nachgeschärft.",
      recipeOwnedOnly: "Nur meine Farben verwenden ({count})",
      recipeFeedbackQuestion: "Wie hilfreich war die Anleitung?",
      paintUnknown: "Nicht im Katalog gefunden – Farbname prüfen",
      unknownPaints: "Nicht im Katalog gefundene Farbnamen: {count} (gestrichelt markiert).",
      addToList: "Auf die Einkaufsliste",
      onList: "Auf der Einkaufsliste"
    },
    collection: {
      description: "Deine Farben nach Marke und Serie. Hake an, was du hast, und setze fehlende Farben auf die Einkaufsliste.",
      search: "Farben suchen: Name, Code oder Serie",
      filter: "Filter",
      filterAll: "Alle",
      filterOwned: "Vorhanden",
      filterMissing: "Nicht vorhanden",
      filterShopping: "Einkaufsliste",
      brands: "Marken",
      allBrands: "Alle Marken",
      groupOwned: "{owned} von {count} vorhanden",
      addToList: "Auf die Einkaufsliste",
      onList: "Auf der Einkaufsliste – entfernen",
      status: "{owned} vorhanden · {shopping} auf der Einkaufsliste · {visible} angezeigt",
      empty: "Keine Farben passen zu Suche und Filter.",
      more: "{count} weitere anzeigen",
      otherGroup: "Weitere",
      searchSemantic: "Name, Code oder Beschreibung – z. B. „warmes Knochenweiss“",
      searchMeaning: "Nach Beschreibung",
      meaningTitle: "Passend zur Beschreibung"
    },
    theme: {
      label: "Design",
      auto: "Design: automatisch",
      light: "Design: hell",
      dark: "Design: dunkel"
    },
    account: {
      menu: "Konto"
    },
    assist: {
      undoReset: "Rückgängig – meine Farben zurückholen",
      missingTitle: "Fehlende Farben in dieser Anleitung ({count})",
      missingAdd: "{count} auf die Einkaufsliste",
      missingAllListed: "Alle auf der Einkaufsliste",
      missingSubstitute: "Ersatz aus deinem Bestand: {name} (Abstand {distance})",
      missingNone: "Nichts Ähnliches in deinem Bestand",
      missingHint: "Farben mit Ersatz aus deinem Bestand kommen nicht auf die Liste.",
      jump: "Assistent",
      eyebrow: "Assistent",
      title: "Was möchtest du malen?",
      lead: "Beschreib deine Armee oder dein Farbschema – der Assistent erstellt die Palette und danach eine Schritt-für-Schritt-Anleitung mit deinen Farben.",
      manualHeading: "Manuell einstellen",
      writeGuide: "Bemalanleitung schreiben",
      openGuide: "Bemalanleitung öffnen",
      rewriteGuide: "Neu schreiben",
      examplesLabel: "Beispiele",
      recentLabel: "Zuletzt",
      examples: {
        aos: [
          "Stormcast Hallowed Knights, Silber und Blau",
          "Hedonites of Slaanesh, Pastell mit Gold",
          "Nighthaunt, geisterhaftes türkises Leuchten",
          "Skaven Clan Pestilens, rostig und krank"
        ],
        k40: [
          "Death Guard, rostiges Messing und krankes Grün",
          "Ultramarines, sauber und hell",
          "Emperor's Children in Neon",
          "Necrons, grünes Leuchten auf dunklem Metall"
        ]
      },
      dockPalette: "Palette",
      dockGuide: "Anleitung",
      dockBench: "Maltisch",
      nextArmy: "Zur Armee →",
      status: {
        ready: "Assistent bereit",
        busy: "Assistent beschäftigt",
        offline: "Assistent offline",
        unknown: ""
      },
      statusBusyWaiting: "Assistent beschäftigt ({count} warten)",
      statusHint: {
        ready: "Der KI-Rechner antwortet.",
        busy: "Eine andere Anfrage läuft (z. B. Paperless) – deine wartet in der Schlange.",
        offline: "Der KI-Rechner ist nicht erreichbar. Paletten aus Fotos und gespeicherte Anleitungen funktionieren weiter.",
        unknown: ""
      }
    },
    bench: {
      title: "Maltisch",
      open: "Maltisch",
      close: "Schliessen",
      fullscreen: "Vollbild",
      stepOf: "Schritt {number} von {total}",
      stepDone: "Schritt {number} erledigt",
      doneBadge: "Erledigt",
      doneNext: "Erledigt, weiter",
      undo: "Als offen markieren",
      back: "Zurück",
      skip: "Überspringen",
      finish: "Maltisch schliessen",
      progress: "{done} von {total} Schritten erledigt"
    },
    army: {
      step: "Armee",
      eyebrow: "Armee-Projekt",
      title: "Deine Armee bemalen",
      import: "Armeeliste importieren",
      importAnother: "Liste importieren",
      select: "Armee",
      importing: "Liste wird gelesen…",
      imported: "„{name}“ importiert: {units} Einheiten, {models} Modelle.",
      reimported: "„{name}“ aktualisiert: {added} neue Einheiten, {removed} entfernt. Der Fortschritt bleibt erhalten.",
      importError: "Die Datei konnte nicht gelesen werden. Nimm einen NewRecruit-JSON-Export oder eine BattleScribe-Datei (.ros/.rosz).",
      saveError: "Der Fortschritt konnte nicht gespeichert werden.",
      armyWide: "Ganze Armee",
      emptyTitle: "Hol deine Armeeliste herein",
      emptyText: "Importiere eine Liste aus NewRecruit oder BattleScribe und hake beim Malen jedes Modell ab.",
      emptyStep1: "In NewRecruit die Liste öffnen und Export → JSON wählen (BattleScribe: die .rosz-Datei).",
      emptyStep2: "Hier importieren – Einheiten, Modelle und Punkte werden übernommen.",
      emptyStep3: "Eine Palette für die Armee wählen und den Assistenten pro Einheit eine Anleitung schreiben lassen.",
      points: "{points} Pkt.",
      paintedShare: "{percent} % bemalt",
      painted: "bemalt",
      modelsPainted: "Modelle bemalt",
      pointsPainted: "Punkte bemalt",
      unitsDone: "Einheiten fertig",
      nextTitle: "Als Nächstes malen",
      nextProgress: "{painted} von {total} bemalt",
      nextStart: "noch nicht begonnen · {points} Pkt.",
      monthlyTitle: "Bemalt pro Monat",
      monthlyBar: "{month}: {count} bemalt",
      photoAdd: "Foto hinzufügen",
      photoChange: "Foto ändern",
      photoRemove: "Foto entfernen",
      photoAlt: "Foto von {unit}",
      photoError: "Das Foto konnte nicht gelesen werden.",
      stages: {
        open: "Offen",
        built: "Gebaut",
        primed: "Grundiert",
        painted: "Bemalt",
        based: "Base fertig"
      },
      palette: "Armee-Palette",
      noPalette: "– keine Palette –",
      createPalette: "Mit dem Assistenten erstellen",
      paletteSuffix: "Armeefarben",
      showPalette: "Palette anzeigen",
      paletteHint: "Anleitungen nutzen die Armee-Palette. Ohne Auswahl wird die gerade angezeigte Palette verwendet.",
      filter: {
        all: "Alle",
        open: "Offen",
        progress: "In Arbeit",
        done: "Fertig"
      },
      filterLabel: "Einheiten anzeigen",
      showExtras: "Manifestationen und Gelände zeigen",
      delete: "Armee entfernen",
      deleteConfirm: "Wirklich entfernen?",
      deleted: "„{name}“ entfernt.",
      regimentProgress: "{painted} von {models} bemalt",
      bulk: "Alle auf…",
      bulkLabel: "Alle Modelle von {unit} auf eine Stufe setzen",
      new: "neu",
      kind: {
        manifestation: "Manifestation",
        terrain: "Gelände"
      },
      unitProgress: "{painted} von {total} Modellen bemalt",
      modelLabel: "{name} {number}: {stage} – tippen für die nächste Stufe",
      writeGuide: "Anleitung schreiben",
      rewriteGuide: "Neu schreiben",
      guideDone: "Anleitung für {unit} geschrieben (Palette „{palette}“)."
    },
    kit: {
      title: "Malkoffer packen",
      expand: "Öffnen",
      collapse: "Schliessen",
      description: "Wähle gespeicherte Anleitungen – die App listet die Töpfe aus deinem Bestand, lässt einen Topf für ähnliche Farben einspringen und zeigt, was noch fehlt.",
      filter: "Anleitungen filtern",
      tolerance: "Ersatzfarben",
      toleranceExact: "Nur exakte Farben",
      toleranceClose: "Sehr ähnlich (ΔE ≤ 5)",
      toleranceSimilar: "Ähnlich (ΔE ≤ 10)",
      toleranceLoose: "Leicht reisen (ΔE ≤ 15)",
      selectAll: "Alle",
      selectNone: "Keine",
      noGuides: "Noch keine gespeicherten Anleitungen. Schreib zuerst eine Bemalanleitung für eine Palette oder eine Einheit.",
      noMatch: "Keine Anleitung passt zum Filter.",
      paletteGuides: "Anleitungen zu Paletten",
      armyGuides: "Anleitungen zur Armee",
      paintCount: "{count} Farben",
      pickGuides: "Hake die Anleitungen an, die du malen willst.",
      summary: "{guides} Anleitungen · {needed} Farben · {pack} Töpfe einpacken · {buy} kaufen.",
      saved: "Ersatzfarben sparen {count} Töpfe.",
      packTitle: "Einpacken ({count})",
      buyTitle: "Nicht in deinem Bestand ({count})",
      standsIn: "auch für {names}",
      usedIn: "in {names}",
      addToList: "{count} auf die Einkaufsliste",
      allListed: "Alle auf der Einkaufsliste",
      unknown: "Nicht im Katalog gefunden: {names}",
      empty: "Die gewählten Anleitungen nennen keine Katalogfarben.",
      copy: "Liste kopieren",
      copied: "Kopiert",
      copyFailed: "Kopieren fehlgeschlagen",
      download: "Als Text herunterladen",
      packLabel: "Einpacken",
      buyLabel: "Kaufen",
      standsInShort: "auch für",
      unknownLabel: "Nicht im Katalog"
    },
    backup: {
      title: "Daten sichern",
      description: "Paletten, Anleitungen, Armeeprojekte, Bestand und Einkaufsliste als eine Datei herunterladen oder eine Sicherung zurückholen.",
      export: "Sicherung herunterladen",
      import: "Sicherung wiederherstellen…",
      exported: "Sicherung mit {count} Einträgen heruntergeladen.",
      confirm: "Sicherung vom {date} mit {count} Einträgen ({areas}). Beim Wiederherstellen werden diese Bereiche überschrieben.",
      confirmButton: "Jetzt wiederherstellen",
      restored: "Wiederhergestellt – lädt neu…",
      areas: {
        armies: "Armeeprojekte",
        guides: "Anleitungen",
        palettes: "Paletten und Einstellungen",
        kit: "Malkoffer",
        other: "Weiteres"
      },
      errors: {
        not_json: "Die Datei ist kein gültiges JSON.",
        not_backup: "Das ist keine PaintHelper-Sicherung.",
        too_new: "Die Sicherung stammt aus einer neueren App-Version.",
        empty: "Die Sicherung enthält keine verwendbaren Daten.",
        save: "Die Sicherung konnte nicht auf dem Server gespeichert werden – bitte erneut versuchen."
      }
    }
  };
}));
