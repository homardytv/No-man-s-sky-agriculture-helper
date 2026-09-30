import { describe, expect, it } from "vitest";
import { calculate } from "./calculator";
import { itemsById, type Craft } from "./catalogue";

describe("farming calculator", () => {
  it("expands Living Glass into its raw crop requirements", () => {
    const result = calculate("living-glass", 1);
    expect(result.targetValue).toBe(566000);
    expect(result.directComponentValue).toBe(111000);
    expect(result.crops.map((crop) => [crop.plant.id, crop.plants])).toEqual([
      ["faecium", 2], ["frost-crystal", 4], ["gamma-root", 8],
    ]);
    expect(result.totalBiodomes).toBe(3);
  });

  it("calculates nested Circuit Board recipes", () => {
    const result = calculate("circuit-board", 1);
    expect(result.directComponentValue).toBe(310000);
    expect(result.crops.map((crop) => [crop.plant.id, crop.plants])).toEqual([
      ["cactus-flesh", 1], ["frost-crystal", 2], ["solanium", 4], ["star-bulb", 8],
    ]);
  });

  it("rounds crops and biodomes per plant species", () => {
    const result = calculate("living-glass", 40);
    const gamma = result.crops.find((crop) => crop.plant.id === "gamma-root");
    expect(gamma?.plants).toBe(320);
    expect(gamma?.biodomes).toBe(20);
  });

  it("counts individual plants for hydroponic planning", () => {
    const result = calculate("living-glass", 1, "hydroponic");
    expect(result.totalPlants).toBe(14);
    expect(result.totalStructures).toBe(14);
  });

  it("calculates Liquid Explosive", () => {
    const result = calculate("liquid-explosive", 1);
    expect(result.targetValue).toBe(800500);
    expect(result.crops.map((crop) => crop.plant.id)).toEqual(["cactus-flesh", "fungal-mould", "mordite"]);
  });

  it("rejects invalid requests", () => {
    expect(() => calculate("living-glass", 0)).toThrow("positive whole number");
    expect(() => calculate("unknown", 1)).toThrow("valid craftable item");
  });

  it("rejects recipe cycles in extended catalogue data", () => {
    const loopA: Craft = { id: "loop-a", name: "Loop A", type: "craft", saleValue: 0, source: "test", sourceRevision: "test", ingredients: [{ ingredientId: "loop-b", quantity: 1 }] };
    const loopB: Craft = { id: "loop-b", name: "Loop B", type: "craft", saleValue: 0, source: "test", sourceRevision: "test", ingredients: [{ ingredientId: "loop-a", quantity: 1 }] };
    itemsById.set(loopA.id, loopA);
    itemsById.set(loopB.id, loopB);
    try {
      expect(() => calculate("loop-a", 1)).toThrow("Recipe cycle detected");
    } finally {
      itemsById.delete(loopA.id);
      itemsById.delete(loopB.id);
    }
  });
});
