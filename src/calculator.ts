import { itemsById, type Craft, type Plant } from "./catalogue";

export type CropRequirement = {
  plant: Plant;
  resources: number;
  plants: number;
  structures: number;
  /** @deprecated Compatibility alias for older UI consumers. */
  biodomes: number;
  excess: number;
};

export type InfrastructureId = "biodome" | "freighter" | "hydroponic";
export type BuildResource = { name: string; iconId: string; quantity: number };
export type Infrastructure = { id: InfrastructureId; name: string; capacity: number; buildResources: BuildResource[]; note: string };

export const infrastructureOptions: Infrastructure[] = [
  { id: "biodome", name: "Bio-Dome", capacity: 16, buildResources: [{ name: "Magnetised Ferrite", iconId: "LAND3", quantity: 25 }, { name: "Glass", iconId: "FARMPROD3", quantity: 5 }], note: "Planetary greenhouse with one-touch harvest." },
  { id: "freighter", name: "Freighter cultivation chamber", capacity: 4, buildResources: [{ name: "Silver", iconId: "SILVER", quantity: 60 }, { name: "Oxygen", iconId: "OXYGEN", quantity: 35 }, { name: "Faecium", iconId: "POOPPLANT", quantity: 25 }], note: "Double chamber; four planting beds on your freighter." },
  { id: "hydroponic", name: "Hydroponic Tray", capacity: 1, buildResources: [{ name: "Pure Ferrite", iconId: "PURE_FERRITE", quantity: 30 }, { name: "Metal Plating", iconId: "METAL_PLATING", quantity: 2 }, { name: "Carbon", iconId: "CARBON", quantity: 20 }], note: "One indoor growing slot per tray." },
];

export type DirectCraftComponent = { craft: Craft; quantity: number; totalValue: number };

export type Calculation = {
  target: Craft;
  quantity: number;
  directCraftComponents: DirectCraftComponent[];
  crops: CropRequirement[];
  infrastructure: Infrastructure;
  totalStructures: number;
  totalPlants: number;
  /** @deprecated Compatibility alias for older UI consumers. */
  totalBiodomes: number;
  targetValue: number;
  directComponentValue: number;
};

export function calculate(targetId: string, quantity: number, infrastructureId: InfrastructureId = "biodome"): Calculation {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Quantity must be a positive whole number.");
  const target = itemsById.get(targetId);
  if (!target || target.type !== "craft") throw new Error("Select a valid craftable item.");
  const infrastructure = infrastructureOptions.find((option) => option.id === infrastructureId);
  if (!infrastructure) throw new Error("Select a valid farm infrastructure.");

  const rawResources = new Map<string, number>();
  const expand = (itemId: string, amount: number, trail: Set<string>) => {
    const item = itemsById.get(itemId);
    if (!item) throw new Error(`Unknown catalogue item: ${itemId}`);
    if (trail.has(itemId)) throw new Error(`Recipe cycle detected at: ${item.name}`);
    if (item.type === "plant") {
      rawResources.set(item.id, (rawResources.get(item.id) ?? 0) + amount);
      return;
    }
    const nextTrail = new Set(trail).add(itemId);
    item.ingredients.forEach((ingredient) => expand(ingredient.ingredientId, amount * ingredient.quantity, nextTrail));
  };
  expand(target.id, quantity, new Set());

  const directCraftComponents = target.ingredients.flatMap((ingredient) => {
    const item = itemsById.get(ingredient.ingredientId);
    return item?.type === "craft" ? [{ craft: item, quantity: ingredient.quantity * quantity, totalValue: (item.saleValue ?? 0) * ingredient.quantity * quantity }] : [];
  });
  const crops = [...rawResources.entries()].map(([id, resources]) => {
    const plant = itemsById.get(id);
    if (!plant || plant.type !== "plant") throw new Error(`Expected plant: ${id}`);
    const plants = Math.ceil(resources / plant.yield);
    const structures = Math.ceil(plants / infrastructure.capacity);
    return { plant, resources, plants, structures, biodomes: structures, excess: plants * plant.yield - resources };
  }).sort((a, b) => a.plant.name.localeCompare(b.plant.name));

  return {
    target, quantity, directCraftComponents, crops,
    infrastructure,
    totalStructures: crops.reduce((total, crop) => total + crop.structures, 0),
    totalPlants: crops.reduce((total, crop) => total + crop.plants, 0),
    totalBiodomes: crops.reduce((total, crop) => total + crop.structures, 0),
    targetValue: (target.saleValue ?? 0) * quantity,
    directComponentValue: directCraftComponents.reduce((total, component) => total + component.totalValue, 0),
  };
}
