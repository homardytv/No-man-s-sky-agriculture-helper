# Project status

Crop Atlas is now a React/Vite, English-language No Man's Sky agricultural calculator.

## Completed

- Typed local catalogue for plants and agricultural crafts, recursive recipe calculation, sale values, crop yields, per-species biodomes, harvest surplus, and recipe-cycle validation.
- Dark Atlas-inspired responsive interface with a searchable visual craft picker, item/crop/Units icons, nested recipe tree, and accessible validation feedback.
- Collapsible Biodome construction and Farm Gap Planner panels; the planner compares per-crop, full biodomes and desired harvest surplus.
- README, tests, Vite build, local Node/npm setup, package lock, and gitignore were added.
- Last verified state before the latest UI-only changes: 8 Vitest tests passed and the production Vite build succeeded.

## Latest changes awaiting verification

- Fixed the craft picker stacking order and prevented its selected-item label from rotating when opened.
- Simplified the Biodome construction panel to direct build resources only.

## Next priority

- Run `npm run test` and `npm run build` after the latest UI changes.
- Continue the requested infrastructure selector (Bio-Dome / Freighter cultivation / Hydroponic Tray), including capacity and build-cost display. Current researched values: Bio-Dome has 16 slots and costs 25 Magnetised Ferrite + 5 Glass; Hydroponic Tray has 1 slot and costs 30 Pure Ferrite + 2 Metal Plating + 20 Carbon. Harvested plants persist, so replanting cost and lost resources are zero.
