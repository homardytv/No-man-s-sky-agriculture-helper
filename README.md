# Crop Atlas

Static English-language farming calculator for *No Man's Sky* agricultural crafts.

## Features

- Search and calculate agricultural crafts, including nested recipes.
- See the complete recipe tree, raw crop requirements, grow times, and dedicated biodomes per plant species.
- Inspect base sale values with in-game item and Units icons.
- Open the biodome construction plan for the required Magnetised Ferrite and Glass.
- Compare full, crop-dedicated biodomes against the selected harvest target and set a deliberate surplus per harvest.
- See unavoidable harvest surplus when plant yields exceed a recipe's exact demand.
- Extend the typed local catalogue with additional plants and crafts.

## Run locally

Install Node.js 20+ and run:

```bash
npm install
npm run dev
```

Use `npm run test` for calculation and UI tests, and `npm run build` for a production build. Vite prints the local URL (normally `http://localhost:5173`) when the development server starts.

## Extending the catalogue

Edit `src/catalogue.ts`. Plant entries require a yield, grow time, and optional item-image ID; craft entries use ingredient IDs, quantities, and an image ID. The calculator validates missing items and recipe cycles at calculation time. Prices are reference base values and can vary by star system.

## Data notes

The current Bio-Dome layout assumes 16 plots per dome and dedicates each dome to one plant species. The farm gap planner therefore accepts complete biodomes by crop, not individual plants. Construction planning uses 25 Magnetised Ferrite and 5 Glass per Bio-Dome. Item images are served by No Man's Sky Recipes; catalogue values and IDs are based on community-maintained No Man's Sky wiki data.
