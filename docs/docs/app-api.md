# window.WPH.app – app API

`window.WPH.app` is the small interface that `src/app.js` exposes to other modules through `createAppApi()`. It gives modules read access to the current app state and lets them trigger state changes or saved updates. Modules that render UI usually redraw when `wph:update` fires.

| Name | Kind | Returns / effect | Used by |
|---|---|---|---|
| language | read | Returns the current UI language code. | ai.js, assist.js |
| system | read | Returns the current game system key. | ai.js, assist.js |
| t | read | Translates an i18n path with optional parameters. | ai.js, army.js, assist.js, backup.js, bench.js, kit-ui.js, ui.js |
| palette | read | Returns the current palette as objects with name and hex. | ai.js, army.js, ui.js |
| recipeKey | read | Returns the current recipe mode and finish style key. | ai.js |
| recipeContext | read | Returns a grounded recipe context for the assistant. | ai.js, army.js |
| addCustomPalette | action | Adds a custom palette, selects it, and updates the app. | ai.js |
| deleteCustomPalette | action | Removes a custom palette and updates the selection. | ai.js |
| customPalettes | read | Returns all saved custom palettes in a compact form. | army.js, assist.js |
| selectCustomPalette | action | Selects a saved custom palette if it exists. | army.js, assist.js |
| updateCustomPalette | action | Replaces a custom palette and returns the previous version. | ai.js |
| setCustomPaletteRating | action | Sets a custom palette rating and saves settings. | ai.js |
| paletteForAi | read | Returns the current palette with roles and locks for the assistant. | ai.js |
| paletteTitle | read | Returns the current scheme title text. | ai.js, army.js, ui.js |
| ownedCount | read | Returns the number of owned paints. | ai.js |
| findPaintByName | read | Finds a catalogue paint by name, preferring owned and selected producers. | ai.js, kit-ui.js |
| selectedCustomPalette | read | Returns the selected custom palette, or null. | ai.js, assist.js |
| setPrimaryHex | action | Sets the primary colour from a hex value and updates the app. | ai.js |
| selectedManufacturers | read | Returns the currently selected manufacturer keys. | ai.js |
| findPaint | read | Finds a catalogue paint by key fields. | ai.js |
| isOwned | read | Returns whether a paint is marked as owned. | ai.js |
| ownedSubstitute | read | Returns the closest owned brush paint that can substitute a paint. | ai.js |
| isOnShoppingList | read | Returns whether a paint is on the shopping list. | ai.js, kit-ui.js |
| addToShoppingList | action | Adds a paint to the shopping list. | ai.js, kit-ui.js |
| isOwnedKey | read | Returns whether a paint key is marked as owned. | – |
| ownedPaints | read | Returns all owned brush paints from the catalogue. | kit-ui.js |
| paintKey | read | Returns the app's stable key for a paint. | kit-ui.js |
| colorDistance | read | Returns the colour distance between two hex values. | kit-ui.js |
| nearestPaints | read | Returns the closest catalogue paints for a hex value. | – |

## Events

- `wph:update` is dispatched after `update()` has finished redrawing the app.
- `wph:workflow` is dispatched when the workflow step changes, with the new view in `detail.view`.

## Notes

- Two entries are currently unused by other modules.
- The recipe context builder contains substantial matching logic that could move to `src/logic/`.
- Owned-paint substitution and closest-match selection are also candidates for pure logic modules.
- The API mixes state reads and actions; actions normally call `update()` and save settings.
- Custom palette sanitisation is delegated to the shared `W` helpers.
