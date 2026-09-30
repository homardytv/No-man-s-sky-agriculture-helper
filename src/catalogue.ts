export type Ingredient = { ingredientId: string; quantity: number };

type BaseItem = {
  id: string;
  name: string;
  iconUrl?: string;
  saleValue?: number;
  source: string;
  sourceRevision: string;
};

export type Plant = BaseItem & {
  type: "plant";
  yield: number;
  growTimeHours: number;
};

export type Craft = BaseItem & {
  type: "craft";
  ingredients: Ingredient[];
};

export type CatalogueItem = Plant | Craft;

const source = "No Man's Sky Wiki (Fandom) agricultural product and crop pages";
const sourceRevision = "2026-09-29";
const iconBaseUrl = "https://nomansskyrecipes.com/images/items";
const plant = (id: string, name: string, yieldAmount: number, growTimeHours: number, saleValue?: number, iconId?: string): Plant => ({
  id, name, type: "plant", yield: yieldAmount, growTimeHours, saleValue, iconUrl: iconId ? `${iconBaseUrl}/${iconId}.png` : undefined, source, sourceRevision,
});
const craft = (id: string, name: string, saleValue: number, ingredients: Ingredient[], iconId: string): Craft => ({
  id, name, type: "craft", saleValue, ingredients, iconUrl: `${iconBaseUrl}/${iconId}.png`, source, sourceRevision,
});

/** Edit this catalogue to add crops or agricultural recipes. IDs are recipe references. */
export const catalogue: CatalogueItem[] = [
  plant("frost-crystal", "Frost Crystal", 50, 1, undefined, "SNOWPLANT"),
  plant("solanium", "Solanium", 50, 16, undefined, "SCORCHEDPLANT"),
  plant("gamma-root", "Gamma Root", 50, 4, undefined, "RADIOPLANT"),
  plant("fungal-mould", "Fungal Mould", 50, 4, undefined, "TOXICPLANT"),
  plant("cactus-flesh", "Cactus Flesh", 100, 16, undefined, "BARRENPLANT"),
  plant("star-bulb", "Star Bulb", 25, 4, undefined, "LUSHPLANT"),
  plant("faecium", "Faecium", 25, 4, undefined, "POOPPLANT"),
  plant("mordite", "Mordite", 25, 8, undefined, "CREATUREPLANT"),
  plant("nipnip-bud", "NipNip Bud", 1, 4),
  plant("gravitino-ball", "Gravitino Ball", 1, 2),
  plant("albumen-pearl", "Albumen Pearl", 1, 2),
  plant("venom-sac", "Venom Sac", 1, 3.33),
  craft("glass", "Glass", 200, [{ ingredientId: "frost-crystal", quantity: 40 }], "FARMPROD3"),
  craft("lubricant", "Lubricant", 110000, [
    { ingredientId: "gamma-root", quantity: 400 },
    { ingredientId: "faecium", quantity: 50 },
  ], "FARMPROD2"),
  craft("living-glass", "Living Glass", 566000, [
    { ingredientId: "glass", quantity: 5 },
    { ingredientId: "lubricant", quantity: 1 },
  ], "FARMPROD8"),
  craft("heat-capacitor", "Heat Capacitor", 180000, [
    { ingredientId: "solanium", quantity: 200 },
    { ingredientId: "frost-crystal", quantity: 100 },
  ], "FARMPROD4"),
  craft("poly-fibre", "Poly Fibre", 130000, [
    { ingredientId: "cactus-flesh", quantity: 100 },
    { ingredientId: "star-bulb", quantity: 200 },
  ], "FARMPROD5"),
  craft("circuit-board", "Circuit Board", 916250, [
    { ingredientId: "poly-fibre", quantity: 1 },
    { ingredientId: "heat-capacitor", quantity: 1 },
  ], "FARMPROD9"),
  craft("unstable-gel", "Unstable Gel", 50000, [{ ingredientId: "fungal-mould", quantity: 400 }], "FARMPROD6"),
  craft("acid", "Acid", 188000, [
    { ingredientId: "mordite", quantity: 25 },
    { ingredientId: "cactus-flesh", quantity: 600 },
  ], "FARMPROD1"),
  craft("liquid-explosive", "Liquid Explosive", 800500, [
    { ingredientId: "acid", quantity: 1 },
    { ingredientId: "unstable-gel", quantity: 1 },
  ], "FARMPROD7"),
];

export const itemsById = new Map(catalogue.map((item) => [item.id, item]));
export const craftableItems = catalogue.filter((item): item is Craft => item.type === "craft");
