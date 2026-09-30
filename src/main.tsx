import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { calculate, infrastructureOptions, type Calculation, type InfrastructureId } from "./calculator";
import { craftableItems, itemsById, type CatalogueItem } from "./catalogue";
import "./styles.css";

const unitIconUrl = "https://nomansskyrecipes.com/images/items/CURRENCY.UNITS.png";
const formatUnits = (value: number) => new Intl.NumberFormat("en-US").format(value);
const formatHours = (hours: number) => `${hours % 1 === 0 ? hours : hours.toFixed(2)} h`;

function ItemIcon({ item, className = "item-icon" }: { item: CatalogueItem; className?: string }) {
  return <span className={className} aria-hidden="true">{item.iconUrl && <img src={item.iconUrl} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} />}</span>;
}

function AssetIcon({ iconId }: { iconId: string }) {
  return <span className="item-icon" aria-hidden="true"><img src={`https://nomansskyrecipes.com/images/items/${iconId}.png`} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /></span>;
}

function UnitsValue({ value }: { value: number }) {
  return <span className="units-value">{formatUnits(value)} <img src={unitIconUrl} alt="units" onError={(event) => { event.currentTarget.style.display = "none"; }} /></span>;
}

function RecipeNode({ itemId, quantity }: { itemId: string; quantity: number }) {
  const item = itemsById.get(itemId);
  if (!item) return null;
  return <li><ItemIcon item={item} /><span><b>{quantity} × {item.name}</b>{item.type === "plant" && <small>Harvested resource</small>}</span>{item.type === "craft" && <ul>{item.ingredients.map((ingredient) => <RecipeNode key={ingredient.ingredientId} itemId={ingredient.ingredientId} quantity={ingredient.quantity * quantity} />)}</ul>}</li>;
}

export function App() {
  const [query, setQuery] = useState("");
  const [targetId, setTargetId] = useState("living-glass");
  const [quantity, setQuantity] = useState("1");
  const [infrastructureId, setInfrastructureId] = useState<InfrastructureId>("biodome");
  const [result, setResult] = useState<Calculation>(() => calculate("living-glass", 1));
  const [error, setError] = useState("");
  const [farmBiodomes, setFarmBiodomes] = useState<Record<string, string>>({});
  const [desiredSurplus, setDesiredSurplus] = useState<Record<string, string>>({});
  const matches = useMemo(() => craftableItems.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())), [query]);
  const selectedCraft = craftableItems.find((item) => item.id === targetId);
  const isHydroponic = result.infrastructure.id === "hydroponic";
  useEffect(() => {
    const nextQuantity = Number(quantity);
    if (Number.isInteger(nextQuantity) && nextQuantity > 0) setResult(calculate(targetId, nextQuantity, infrastructureId));
  }, [infrastructureId]);
  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    const nextMatches = craftableItems.filter((item) => item.name.toLowerCase().includes(nextQuery.toLowerCase()));
    if (nextMatches.length && !nextMatches.some((item) => item.id === targetId)) setTargetId(nextMatches[0].id);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const next = calculate(targetId, Number(quantity), infrastructureId);
      setResult(next); setError("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to calculate this request."); }
  };

  return <main className="app-shell">
    <div className="stars" aria-hidden="true" />
    <header className="hero">
      <p className="eyebrow">AGRICULTURAL FIELD SYSTEM / 16 PLOTS PER BIODOME</p>
      <h1>Crop <span>Atlas</span></h1>
      <p className="intro">Plan a self-sustaining harvest for No Man&apos;s Sky agricultural crafts.</p>
    </header>
    <section className="panel controls" aria-labelledby="planner-title">
      <div><p className="panel-tag">01 / SET TARGET</p><h2 id="planner-title">Production planner</h2></div>
      <form onSubmit={submit} noValidate>
        <label>Search craft<input value={query} onChange={(event) => updateQuery(event.target.value)} placeholder="Living Glass" /></label>
        <div className="picker-field"><span>Craftable item</span><details className="craft-picker"><summary>{selectedCraft && <><ItemIcon item={selectedCraft} /><b>{selectedCraft.name}</b></>}<i>⌄</i></summary><div className="craft-options">{matches.length ? matches.map((item) => <button type="button" key={item.id} onClick={() => setTargetId(item.id)}><ItemIcon item={item} />{item.name}</button>) : <p>No matching crafts</p>}</div></details></div>
        <label>Harvest quantity<input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label>
        <button type="submit">Calculate harvest <span>→</span></button>
      </form>
      {selectedCraft && <div className="selected-craft"><ItemIcon item={selectedCraft} className="item-icon item-icon-large" /><span><small>Selected craft</small><b>{selectedCraft.name}</b></span></div>}
      {error && <p className="error" role="alert">{error}</p>}
    </section>
    <section className="panel infrastructure" aria-labelledby="infrastructure-title"><div><p className="panel-tag">02 / CHOOSE FOUNDATION</p><h2 id="infrastructure-title">Farm infrastructure</h2></div><div className="infrastructure-options">{infrastructureOptions.map((option) => <label className={infrastructureId === option.id ? "infrastructure-option active" : "infrastructure-option"} key={option.id}><input type="radio" name="infrastructure" value={option.id} checked={infrastructureId === option.id} onChange={() => setInfrastructureId(option.id)} /><span><b>{option.name}</b><small>{option.capacity} planting {option.capacity === 1 ? "slot" : "slots"} per structure · {option.note}</small><em>{option.buildResources.map((resource) => <span key={resource.name}><AssetIcon iconId={resource.iconId} />{resource.quantity} × {resource.name}</span>)}</em></span></label>)}</div><p className="replant-note">Harvested plants remain planted: replanting cost is <b>0</b>, with no resources lost after harvest.</p></section>
    {!isHydroponic && <section className="panel construction-summary"><div><p className="panel-tag">BUILD COST / SELECTED INFRASTRUCTURE</p><h2>{result.infrastructure.name} materials</h2></div><p>For {result.totalStructures} required structure(s):</p><div className="build-tree">{result.infrastructure.buildResources.map((resource) => <div key={resource.name}><AssetIcon iconId={resource.iconId} /><span><b>{result.totalStructures * resource.quantity} × {resource.name}</b><small>Direct construction material</small></span></div>)}</div></section>}
    <section className="summary" aria-label="Calculation summary">
      <article className="metric"><p>Target sale value</p><strong><UnitsValue value={result.targetValue} /></strong><small>{result.quantity} × {result.target.name}</small></article>
      <article className="metric"><p>Direct craft value</p><strong><UnitsValue value={result.directComponentValue} /></strong><small>Crafted recipe components</small></article>
      <article className="metric accent"><p>{isHydroponic ? "Plants to plant" : `${result.infrastructure.name}s required`}</p><strong>{isHydroponic ? result.totalPlants : result.totalStructures}</strong><small>{isHydroponic ? "One plant per Hydroponic Tray" : `${result.infrastructure.capacity} planting slots each`}</small></article>
    </section>
    <section className="results-grid">
      <article className="panel crops"><div><p className="panel-tag">02 / CULTIVATE</p><h2>Crop requirements</h2></div>
        <div className="table-wrap"><table><thead><tr><th>Plant</th><th>Required</th><th>Plants</th><th>Grow time</th>{!isHydroponic && <th>{result.infrastructure.name}s</th>}<th>Harvest surplus</th></tr></thead>
          <tbody>{result.crops.map(({ plant, resources, plants, biodomes, excess }) => <tr key={plant.id}><td className="crop-name"><ItemIcon item={plant} /><span>{plant.name}</span></td><td>{resources}</td><td><b>{plants}</b></td><td>{formatHours(plant.growTimeHours)}</td>{!isHydroponic && <td><b>{biodomes}</b></td>}<td className={excess ? "surplus" : ""}>{excess ? `+${excess}` : "—"}</td></tr>)}</tbody>
        </table></div>
      </article>
      <article className="panel chain"><div><p className="panel-tag">03 / ASSEMBLE</p><h2>Direct craft inputs</h2></div>
        <ul className="recipe-tree"><RecipeNode itemId={result.target.id} quantity={result.quantity} /></ul>
        <div className="target"><ItemIcon item={result.target} className="item-icon item-icon-target" /><span>Output</span><b>{result.quantity} × {result.target.name}</b><strong><UnitsValue value={result.targetValue} /></strong></div>
      </article>
    </section>
    <section className="expandable-grid">
      <details className="panel"><summary><span><p className="panel-tag">04 / BUILD</p><h2>Biodome construction plan</h2></span><b>+</b></summary><div className="detail-content"><p>For {result.totalBiodomes} dedicated biodome(s), gather:</p><div className="build-tree"><div><AssetIcon iconId="LAND3" /><span><b>{result.totalBiodomes * 25} × Magnetised Ferrite</b><small>Direct construction material</small></span></div><div><ItemIcon item={itemsById.get("glass")!} /><span><b>{result.totalBiodomes * 5} × Glass</b><small>Direct construction material</small></span></div></div><p className="empty">The crop table above is the planting plan needed to fill those biodomes for this target.</p></div></details>
      <details className="panel surplus-panel"><summary><span><p className="panel-tag">05 / SET RESERVES</p><h2>Harvest surplus goals</h2></span><b>+</b></summary><div className="detail-content"><p>Set the extra harvested resources you want available after crafting.</p><div className="farm-grid">{result.crops.map((crop) => <label key={crop.plant.id}><span className="farm-resource"><ItemIcon item={crop.plant} />{crop.plant.name}</span><span>Reserve after crafting</span><input type="number" min="0" value={desiredSurplus[crop.plant.id] ?? "0"} onChange={(event) => setDesiredSurplus({ ...desiredSurplus, [crop.plant.id]: event.target.value })} /></label>)}</div></div></details>
      <details className="panel farm-panel"><summary><span><p className="panel-tag">06 / COMPARE</p><h2>Farm gap planner</h2></span><b>+</b></summary><div className="detail-content"><p>Each assigned {result.infrastructure.name} adds {result.infrastructure.capacity} plants and their full harvest yield. Any reserve goal is included below.</p><div className="farm-grid">{result.crops.map((crop) => { const currentStructures = Number(farmBiodomes[crop.plant.id] ?? 0); const requestedSurplus = Number(desiredSurplus[crop.plant.id] ?? 0); const plannedPlants = Math.ceil((crop.resources + requestedSurplus) / crop.plant.yield); const plannedStructures = Math.ceil(plannedPlants / result.infrastructure.capacity); const produced = currentStructures * result.infrastructure.capacity * crop.plant.yield; const currentPlantings = isHydroponic ? currentStructures : currentStructures * result.infrastructure.capacity; return <label key={crop.plant.id}><span className="farm-resource"><ItemIcon item={crop.plant} />{crop.plant.name}</span><span>{isHydroponic ? "Current planted" : `Current ${result.infrastructure.name}s`}</span><input type="number" min="0" value={farmBiodomes[crop.plant.id] ?? "0"} onChange={(event) => setFarmBiodomes({ ...farmBiodomes, [crop.plant.id]: event.target.value })} /><small>Current output: {produced}. {isHydroponic ? `Need ${plannedPlants} plant(s); add ${Math.max(0, plannedPlants - currentPlantings)}.` : `Need ${plannedStructures} structure(s); add ${Math.max(0, plannedStructures - currentStructures)}.`}</small></label>; })}</div><p className="gap-total">{isHydroponic ? "Hydroponic planning counts individual plants: one plant per tray." : `Only complete structures are counted: ${result.infrastructure.capacity} plants per assigned ${result.infrastructure.name}.`}</p></div></details>
    </section>
    <footer>Base sale values are reference values and may vary by star system. Catalogue icons and data source: No Man&apos;s Sky Wiki (Fandom), reviewed 2026-09-29.</footer>
  </main>;
}

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
