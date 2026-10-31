# Changelog

## v0.36.0 (PaintHelperV2)

- Painting desk in 3D shows the step: highlight steps (edge, fine, quick highlight, focus
  light, zenithal drybrush) light up the edges of the active zones in the step paint; shade
  steps darken the zone towards it. The step kind is read from the step label in all five
  languages (`stepKindForText` in `src/logic/figure-zones.js`, with a test).
- Zones of other colours turn grey instead of almost black, so the figure stays readable in
  the dark theme.
- Bigger figure on wide screens: the desk grows to 1280 px with a figure, the figure up to
  440 px wide (was 220 px); phones unchanged.

## v0.35.0 (PaintHelperV2)

- Painting desk in 3D: three figures – infantry, cavalry and monster (with wings) – chosen
  from the keywords of the plan; the camera fits each figure.
- Own 3D model: "Own model…" under the 3D figure loads a GLB file. Parts are matched to zones
  by their mesh or material names (armour, skin, metal, weapon, base …) and painted in the
  palette colours; unknown parts keep their own material. The file stays on this device
  (IndexedDB, not on the server) and comes back on the next visit; "Standard figure" removes
  it. A file that cannot be shown falls back to the standard figure with a short hint.
- Accent colours: steps for colours without a role area light up the accent zone (eyes,
  gems) on the figure; step texts with hints are split correctly.
- Guides: every palette colour gets a "Where:" line again, also colours that the role planner
  lists as extra roles; long placement texts are cut at a comma instead of mid-word. Rewrite
  existing guides to get the new lines.
- "Roles on the model": cards in a grid with swatch, role, hex and paint; long words wrap.
- The guide request sends up to 16 role areas (was 12).

## v0.34.0 (PaintHelperV2)

- Painting desk in 3D: the "3D" button next to full screen shows a 3D figure in the palette
  colours (own design built from basic shapes, no third-party models). Drag to turn it, pinch
  or scroll to zoom; it turns slowly until touched. The zones of the current colour stand out,
  the others fade. three.js (MIT, `src/vendor/three-bundle.js`, ~800 KB) and
  `src/ui/figure3d.js` load only when 3D is switched on; the tablet remembers the choice.
- Colour wheel as UI module `src/ui/wheel.js`; shopping-list rules (`shoppingCandidates`,
  `shoppingEntries`) in `src/logic/collection.js` with tests – written by the local agent
  from a specification only.

## v0.33.0 (PaintHelperV2)

- Code: `src/app.js` keeps getting smaller (about 2,870 instead of 3,050 lines); behaviour is
  unchanged.
  - `src/logic/recipe.js`: which paints a guide may use, paint descriptions, role areas and
    colour ladders for the guide request (the request was compared byte for byte).
  - `src/logic/geometry.js`: colour wheel points and tooltip placement, with tests.
  - `src/ui/paint-tooltip.js`: the paint tooltip (hover/focus, delay, placement) as the first
    UI module; `app.js` only supplies its content.

## v0.32.0 (PaintHelperV2)

- Compact layout for the tablet: slimmer header (the subtitle only on the palette page), all
  palette colours in one row on the palette page, and a thin colour strip instead of the big
  cards on the plan, paints and army pages. On the plan and paints pages the settings sit above
  the content, which gets the full width.
- Painting plan: the guide comes first; "Missing paints" moved below it and is folded (click
  the title to open it; the shopping-list button stays visible).
- Collection: one row per brand ("x of y owned"); opening a brand shows its product lines as
  before. Narrowed lists (search or filter, up to 400 paints) open the brands right away.
  The paints page shrinks from about 10,000 px to under 3,000 px on a tablet.

## v0.31.0 (PaintHelperV2)

- Share link parameters are built by `shareParams` in `src/logic/settings.js`, next to
  `settingsFromParams` that reads them back; a test writes a link and reads it back. The link
  itself is unchanged.

## v0.30.0 (PaintHelperV2)

- Fix: painting guides got no "where" lines (and so no figure in the painting desk) when the
  role planner names a colour by its role ("Dominant colour") while the palette names it
  differently ("Armour"). Areas now also match the palette colour by hex. Write the guide
  again to get the figure for older guides.
- Collection rules moved out of `src/app.js` into `src/logic/collection.js` (paint keys,
  catalogue corrections, PaintRack import plan) with their own tests; behaviour unchanged.

## v0.29.0 (PaintHelperV2)

- Painting desk: the figure is shaded with the painting ladder of each colour (edge highlight,
  layer, basecoat, shade; light from the top left), so the plan reads like a painted model.
- Three figures: infantry, cavalry and monster. Opened from the army page, the figure follows the
  unit's keywords (MONSTER/BEAST → monster, CAVALRY/WAR MACHINE → cavalry).
- Unit photos: shown next to the title in the painting desk and as thumbnails in "Paint next";
  photos are cleared when an army is deleted or a unit disappears on re-import. A unit matched
  by name on re-import keeps its old key, so its photo stays attached.
- Texts are split into one file per language (`src/i18n/<language>.js`); `src/i18n.js` only
  holds the translator.

## v0.28.0 (PaintHelperV2)

- Painting desk: a figure next to each step shows the guide's colours on nine zones
  (armour, cloth, skin, leather, metal, weapon, bone, accents, base); the zones named in the
  current colour's "where" line are highlighted. Works for saved guides in all five languages.
- Army page: a photo per unit (camera or gallery). It is shrunk in the browser to at most
  480 px as a small JPEG and kept in its own key (`wph.photo.*`), so ticking a model does not
  resend every photo; "Change photo" and "Remove photo" next to it.
- Backup: unit photos are listed under army projects when restoring.
- New modules: `src/logic/figure-zones.js` (role area → zone, "where" line parser) and
  `src/figure.js` (SVG figure); photo helpers in `src/army-data.js`.

## v0.27.0 (PaintHelperV2)

- Army page: changing a model's stage records the date, and a new "Painted per month"
  box shows how many models reached "painted" in each of the last six months.
- Server: a request body over the size limit is now read to the end before the 413
  answer is sent, so browsers (notably on Windows) get the error message instead of a
  dropped connection (ECONNRESET). Bodies far beyond the limit are still cut off.

## v0.26.0 (PaintHelperV2)

- Painting guide: the primer line names the product line (e.g. "Army Painter Warpaints
  Primer"), so a colour primer spray is not mistaken for a pot of paint.
- Stand-ins for missing paints are of the same kind: a wash for a wash, a metallic for a
  metallic (Iron Hands Steel no longer stands in for Agrax Earthshade Gloss).
- Metallic paints are recognised by their type too, so Citadel metallics no longer end up
  in non-metal guide steps; discontinued paints are only used when you own them.
- Catalogue: Agrax Earthshade, Nuln Oil and Reikland Fleshshade Gloss get the colour of
  the shade instead of a pale swatch.
- Army page: "Paint next" box; /api/health reports version and uptime;
  scripts/check-ai.js checks a running server against the real AI server.

## v0.25.0 (PaintHelperV2)

- Painting kit (paints page): tick saved guides – palette guides and army unit guides –
  and get the pots to pack from your collection. With "stand-ins" one owned pot covers
  several guide paints that are close (ΔE ≤ 5 / 10 / 15, greedy set cover), so a
  travel kit stays small. Paints nothing covers are listed with one button for the
  shopping list; the list can be copied or downloaded as text. Selection and tolerance
  are kept in `wph.kit.v1` (per user on the server).
- Backup: download every `wph.*` entry (palettes, guides, army projects, collection,
  shopping list) as one JSON file and restore it on another device or account. Restore
  asks for confirmation, overwrites only the areas in the file and reloads the page.
- `WPHStorage.keys()` lists the stored keys in server and local mode.
- Fix: the shopping list no longer empties itself on page load. Saved entries were checked
  against the small fallback catalogue before the full catalogue had loaded and dropped.

## v0.24.0 (PaintHelperV2)

- One producer selection: the brand chips above the collection now choose the paint
  brands for the whole app (matches, guides, search and the collection); the duplicate
  checkbox list in the side column is gone. "All brands" selects every producer again.
- GitHub Actions on Node 24: actions/checkout v7, actions/setup-node v7,
  docker/setup-buildx-action v4, docker/login-action v4, docker/metadata-action v6,
  docker/build-push-action v7, peter-evans/create-pull-request v8.

## v0.23.0 (PaintHelperV2)

- Painting guide: "Missing paints" lists every catalogue paint of the guide you do not
  own, with a stand-in from your collection when one is close (ΔE ≤ 10), and puts the
  rest on the shopping list with one button.
- Changing game system, palette mode or scheme no longer silently drops edited and
  locked colours: an "Undo – bring back my colours" button restores the previous
  settings, edits and locks.

## v0.22.0 (PaintHelperV2)

- Colour matching uses CIEDE2000 (CIE Lab, D65) instead of the RGB distance, so
  "closest paint" means what the eye sees as closest – in tooltips, catalogue matches,
  paint equivalents, guides, primers and owned-paint checks. Thresholds retuned to the
  new scale: owned paint counts up to ΔE 10, guide marks paints above ΔE 12 as
  "closest" and leaves out those above 24, brand preference worth ΔE 6.
- "Distance" in the app now shows ΔE (1 decimal); faster closest-paint search.

## v0.21.0 (PaintHelperV2)

- Paints page: one search box for names, codes and descriptions. Names filter the list
  right away; a description ("warm bone white") goes to the embedding search with Enter,
  the ✨ button, or by itself when no paint name matches. Results appear above the
  collection with "use as main colour" and "add to shopping list".
- With owned paints, the collection opens on "Owned" instead of all 5,400 paints.

## v0.20.0 (PaintHelperV2)

- Assistant first: a "What do you want to paint?" box opens the palette page, with example
  prompts for the game system and the recent assistant palettes; the manual tools sit in a
  folded "Set up manually" column. Under the palette: "Write painting guide", painting
  desk, rating and "improve this palette" in one bar.
- Header: ✨ button to the assistant and a status light (ready / busy with queue / offline),
  from `GET /api/ai/status` (now with `reachable`, `busy`, `waiting`; cached 30 s probe).
- Painting plan: the guide comes first; role planner, base ideas and paint ladder start
  folded. Guides are saved per palette (`wph.guides.v1`); every step has a tick box and a
  progress bar.
- Painting desk: full-screen, one step per view with large text and paint swatches, "done,
  next" / back / skip, swipe and arrow keys, keeps the screen on (Wake Lock, HTTPS only).
- Army page (04): import NewRecruit JSON or BattleScribe `.ros`/`.rosz` lists; every model
  goes through not started → built → primed → painted → based; progress per unit, regiment
  and army, also weighted by points; one palette per army ("create with the assistant"
  assigns it); a guide per unit (the unit and its models go into the tips prompt) on the
  painting desk; re-importing the same list keeps progress. Stored in `wph.armies.v1`.
- Tablets and phones: quick-action dock (assistant, guide, desk, army), 44–64 px touch
  targets, layouts for 820/1024/1180 px; paint equivalents in the notes skip airbrush
  lines and military colour codes and prefer owned brands.

## v0.19.0 (PaintHelperV2)

- Painting guide: the steps now come from the app itself – fixed headings per palette
  colour with the areas it covers, one catalogue paint per step, a primer chosen by the
  main colour (coloured spray when one is close, otherwise black/grey/light), shorter
  ladders for accents. Paints far from the step colour are marked "closest" with the
  target HEX, or left out. The model only adds a short tips section (informal "du" in
  German), so it can no longer invent structure or paints; if the model server is
  unreachable the guide still arrives, just without tips.
- Guide paints follow the step: washes for shading, contrast/glaze paints for
  transparent steps, metallics only for metal areas; airbrush, lacquer, spray, vehicle
  colour lines and military colour codes are left out, and brands the painter owns are
  preferred.
- Owned paints count as a match only when they are close (RGB distance 40). With
  "only owned paints" on, a colour without a close owned paint shows the best catalogue
  paint with a note, and paint equivalents read "(not owned)". The toggle now updates
  the notes right away.
- Faction recognition in palette requests and guides understands German and older names
  ("Seuchenmarines" → Death Guard, "Tausend Söhne", "Blutengel" …) and genitives
  ("Nurgles").
- Catalogue: 24 Citadel Contrast paints from the 2022 range (Garaghak's Sewer, Ratling
  Grime, Aeldari Emerald, Frostheart, Imperial Fist …) added; GW product codes (29-xx,
  24-xx, 27-xx) on all Contrast and Shade paints so PaintRack imports match by code;
  "Cassandora Yellow" renamed to Casandora Yellow; 31 Contrast/Shade colours corrected to
  their applied look (e.g. Drakenhof Nightshade was pale grey). Owned paints and shopping
  lists follow corrected entries automatically, and colourless PaintRack entries are
  replaced as soon as the catalogue knows the paint – no re-import needed.

## v0.18.0 (PaintHelperV2)

- Light mode: the theme button in the header cycles automatic (follows the device),
  light and dark; the choice is saved per device.
- Owned paints moved to a full-width collection panel under "Paints and supplies":
  search by name, code or range, filter all/owned/missing/on shopping list, brand chips
  with counts, groups per brand and range (opened on demand), and a shopping-list
  button on every paint.
- Cleaner screen: compact header, account actions in a small menu, lock buttons with
  icons, duplicate meta labels removed, the debug panel and the old start buttons hidden.
- Phones: a compact palette strip stays at the top while the settings scroll by; tapping
  it jumps back to the palette.

## v0.17.0 (PaintHelperV2)

- Palette from a description: the request is embedded once; the closest faction schemes
  (semantic match, e.g. "plague warriors" finds Death Guard) and the painter's own rated
  palettes are added as examples. A quality check then fixes weak dark/light neutrals,
  too similar main colours and accents that disappear.
- Improve a palette by instruction ("darker", "neon accents"); locked colours are kept,
  with one-step undo.
- Thumbs up/down with an optional comment for palettes and guides; stored per user
  (new `ai_feedback` table) and used in later prompts.
- Painting guide: option to use only owned paints; paint names are checked against the
  catalogue, shown with a swatch and a shopping-list button, unknown names are marked.

## v0.16.0 (PaintHelperV2)

- Added the GirlyPop scheme: bubblegum pink, lilac, mint, blush and glitter gold as fixed
  signature colours, plus a candy version of the main colour.
- Extended the paint catalogue from 579 to about 5,400 paints (11 brands) with
  manufacturer codes, using the open Paintdex database (MIT). Existing entries keep
  their identity, so owned paints and shopping lists stay valid.
- Added `npm run update:catalogue` and a monthly GitHub Action that proposes catalogue
  updates as a pull request.
- PaintRack import: rows without SKU are accepted, brand aliases (e.g. "Citadel Classic")
  are recognised, and colourless placeholder entries are replaced once a paint is known.

## v0.15.1 (PaintHelperV2)

- Palette from a description: when the description names a faction or subfaction from
  `data/faction-schemes.json` (also across game systems, e.g. "Emperor's Children" in
  Age of Sigmar mode), its reference scheme is passed to the model, which keeps the
  faction's hue families and applies style wishes such as "neon" on top. Small local
  models otherwise drift to unrelated colours.
- The palette prompt asks for all text, including colour names, in the UI language
  (German: informal "du").

## v0.15.0 (PaintHelperV2)

- Added the assistant, backed by a local OpenAI-compatible model server (e.g. OpenVINO
  Model Server): palette from a description, a streamed painting guide that only names
  paints from the catalogue and the user's collection, and paint search in words
  using an embedding index of the catalogue.
- Added palette from a photo (runs in the browser, also without the server).
- Added "★ My palettes": assistant and photo palettes are saved with the settings and
  profiles, stay selected across game systems, and travel with share links.
- The server queues model requests (one at a time), cancels them when the browser goes
  away, keeps slow responses alive behind reverse proxies, and limits requests per user.

## v0.14.0 (PaintHelperV2)

- Added an optional Node.js server (`server/`) with SQLite storage via `node:sqlite`
  and no npm dependencies.
- Added user accounts: login screen, account bar with sign-out and password change,
  sessions stored as hashes, scrypt password hashing, login rate limiting.
- Settings, profiles, owned paints, and shopping lists are stored per user on the
  server and sync across devices. Local browser data can be imported on first login.
- Added the `wph-user` CLI for managing users and backups, plus daily database backups.
- Added Dockerfile, Portainer stack files, and a GitHub Actions workflow that tests
  and publishes the container image to GHCR.
- The app still runs as a static page (file://, GitHub Pages) using browser storage.

## v0.13.0

- Added per-card colour editing and locks with exact HEX preservation.
- Replaced full randomisation with partial rerolls that retain the selected scheme.
- Saved palette edits and locks in local settings, profiles, and share links.
- Added validation and regression tests for palette edits and translated editor labels.
- Updated the heraldic preview to use the edited palette.

## v0.12.0

- Organised the workspace into Palette, Painting plan, and Paints & supplies steps.
- Kept the live palette visible across steps and added next-step navigation.
- Grouped saved profiles with save/share controls and added direct access from the toolbar.
- Refreshed the interface with quieter surfaces, flat colour swatches, clearer spacing,
  mobile navigation, visible keyboard focus, and a skip link.
- Translated workflow labels into all five supported languages.
- Preserved the existing profile and share-link formats.

## v0.11.0

- Added PaintRack CSV import for owned-colour collection exports, including matched
  catalogue paints and owned entries for colours that are not in the catalogue.
- Added an import report popover showing which PaintRack colours matched the catalogue,
  which were kept as owned custom entries, and which rows were skipped.
- Removed the select-all-visible owned-colours control.
- Added a Shopping list action to mark a colour as owned, automatically removing it from
  the shopping list.
- Bumped the static app version and cache-buster from `v0.10` to `v0.11`.

## v0.10.0

- Removed the 80-colour cap from the Shopping list add-colour selector so all unowned
  catalogue colours can be chosen.
- Added regression coverage for the shopping-list search result count.
- Bumped the static app version and cache-buster from `v0.9` to `v0.10`.

## v0.9.0

- Added collapse/expand controls to the generated main-window output sections: painting
  notes, role planner, base advice, model roles, paint ladder, and catalogue matches.
- Persisted generated-section collapse preferences in saved browser settings and named
  profiles so users can customize their view.
- Bumped the static app version and cache-buster from `v0.8` to `v0.9`.

## v0.8.0

- Added a collapsible Shopping list section at the bottom of the app for tracking
  unowned catalogue colours to buy.
- Added shopping-list actions to hover/focus paint tooltips for unowned closest matches.
- Added catalogue search and remove controls for shopping-list entries while keeping owned
  paints excluded from the list.
- Persisted shopping-list entries, search text, and collapse state in saved browser
  settings and named profiles.
- Bumped the static app version and cache-buster from `v0.7` to `v0.8`.

## v0.7.0

- Fixed owned-only closest-match filtering so unowned colours are excluded from both
  generated palette match cards and hover/focus paint tooltips.
- Added regression tests covering owned-only candidate filtering before closest-match
  calculations.
- Bumped the static app version and cache-buster from `v0.6` to `v0.7`.

## v0.6.0

- Added an Owned badge to hover/focus paint tooltips for closest catalogue
  matches that are already marked as owned.
- Added a bottom-of-page legend explaining the owned-paint tooltip badge.
- Bumped the static app version and cache-buster from `v0.5` to `v0.6`.

## v0.5.0

- Added a separate Owned colours panel for tracking catalogue paints already in a
  collection.
- Added select-all-visible support with status text that indicates when every currently
  visible colour is selected.
- Added an owned-only closest-match toggle and Owned badges for closest matches that are
  in the marked collection.
- Persisted owned paint selections and the owned-only matching preference in saved
  browser settings and named profiles.
- Bumped the static app version and cache-buster from `v0.4` to `v0.5`.

## v0.4.0

- Added beginner, speedpaint, battle-ready, and display-painting recipe modes.
- Updated paint ladders so each mode uses workflow-appropriate steps.
- Preserved recipe mode in random palettes, saved profiles, and share links.
- Bumped the static app version and cache-buster from `v0.3` to `v0.4`.

## v0.3.0

- Added Zorn limited palette support.
- Expanded random palette coverage across game systems, faction schemes, heraldic
  options, role planners, base themes, catalogue colours, finish style, and producer
  filters.
- Added shareable palette links and named browser-local profiles.
- Improved paint catalogue loading, manufacturer grouping, producer filtering, match
  metadata, and hover/focus paint tooltips.
- Added static asset version checks and browser smoke test coverage.
- Expanded the unofficial project disclaimer to cover miniature and paint manufacturers.

## v0.2.0

- Introduced versioned static assets and README versioning guidance.
- Added broader test coverage for static wiring, share links, catalogue normalization,
  producer selection, base suggestions, factions, translations, and core palettes.
