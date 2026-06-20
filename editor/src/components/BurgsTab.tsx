import { useState, useCallback, useMemo } from "react";
import type { MapData, Burg } from "../mapParser";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

function getStateName(stateId: number, data: MapData) {
  return data.pack.states.find(s => s.i === stateId)?.name ?? `State ${stateId}`;
}
function getCultureName(cultureId: number, data: MapData) {
  return data.pack.cultures.find(c => c.i === cultureId)?.name ?? `Culture ${cultureId}`;
}
function getReligionName(religionId: number | undefined, data: MapData) {
  if (!religionId) return "—";
  return data.pack.religions.find(r => r.i === religionId)?.name ?? `Religion ${religionId}`;
}

function Field({
  label, value, onChange, type = "text",
}: { label: string; value: string | number; onChange: (v: string | number) => void; type?: "text" | "number" }) {
  return (
    <div className="detail-field">
      <label className="detail-label">{label}</label>
      <input
        className="detail-input"
        type={type}
        value={String(value ?? "")}
        onChange={e => onChange(type === "number" ? Number(e.target.value) : e.target.value)}
      />
    </div>
  );
}

function Toggle({
  label, value, onChange,
}: { label: string; value: number | undefined; onChange: (v: number) => void }) {
  return (
    <label className="detail-toggle">
      <input
        type="checkbox"
        checked={!!value}
        onChange={e => onChange(e.target.checked ? 1 : 0)}
      />
      <span>{label}</span>
    </label>
  );
}

function BurgDetail({ burg, data, onChange }: { burg: Burg; data: MapData; onChange: (data: MapData) => void }) {
  const updateBurg = useCallback((key: string, value: unknown) => {
    const newBurgs = data.pack.burgs.map(b => b.i === burg.i ? { ...b, [key]: value } : b);
    onChange({ ...data, pack: { ...data.pack, burgs: newBurgs } });
  }, [burg.i, data, onChange]);

  // Production: goods where this burg.i is in goodsDef.producers
  const toggleProducer = useCallback((goodId: number, producing: boolean) => {
    const newGoodsDefs = data.goodsDefs.map(g => {
      if (g.i !== goodId) return g;
      const producers = Array.isArray(g.producers) ? [...(g.producers as number[])] : [];
      if (producing) {
        if (!producers.includes(burg.i)) producers.push(burg.i);
      } else {
        const idx = producers.indexOf(burg.i);
        if (idx !== -1) producers.splice(idx, 1);
      }
      return { ...g, producers };
    });
    // Also clear/add deals when toggling production off
    const newDeals = producing
      ? data.deals
      : data.deals.filter(d => !(d.good === goodId && d.seller === burg.i && d.sellerType === "burg"));
    onChange({ ...data, goodsDefs: newGoodsDefs, deals: newDeals });
  }, [burg.i, data, onChange]);

  // Deals involving this burg
  const burgDeals = useMemo(() =>
    data.deals.filter(d =>
      (d.seller === burg.i && d.sellerType === "burg") ||
      (d.buyer === burg.i && d.buyerType === "burg")
    ), [data.deals, burg.i]);

  // Market this burg is the center of
  const market = data.markets.find(m => m.centerBurgId === burg.i);

  const goodName = (id: number) => data.goodsDefs.find(g => g.i === id)?.name ?? `Good ${id}`;
  const marketName = (id: number) => {
    const m = data.markets.find(m2 => m2.i === id);
    if (!m) return `Market ${id}`;
    const b = data.pack.burgs.find(b2 => b2.i === m.centerBurgId);
    return b?.name ?? `Market ${id}`;
  };

  return (
    <div className="burg-detail">
      <div className="burg-detail-header">
        <h2>{burg.name}</h2>
        <span className="text-dim">
          {getStateName(burg.state, data)} · {getCultureName(burg.culture, data)} · {getReligionName(burg.religion, data)}
        </span>
      </div>

      {/* Basic Info */}
      <section className="detail-section">
        <h3 className="detail-section-title">Basic Info</h3>
        <div className="detail-fields-grid">
          <Field label="Name" value={burg.name} onChange={v => updateBurg("name", v)} />
          <Field label="Type" value={burg.type ?? ""} onChange={v => updateBurg("type", v)} />
          <Field label="Population" value={burg.population} onChange={v => updateBurg("population", v)} type="number" />
          <Field label="X" value={burg.x} onChange={v => updateBurg("x", v)} type="number" />
          <Field label="Y" value={burg.y} onChange={v => updateBurg("y", v)} type="number" />
          <Field label="State ID" value={burg.state} onChange={v => updateBurg("state", v)} type="number" />
          <Field label="Culture ID" value={burg.culture} onChange={v => updateBurg("culture", v)} type="number" />
          <Field label="Religion ID" value={burg.religion ?? 0} onChange={v => updateBurg("religion", v)} type="number" />
        </div>
        <div className="detail-toggles">
          <Toggle label="Capital" value={burg.capital} onChange={v => updateBurg("capital", v)} />
          <Toggle label="Port" value={burg.port} onChange={v => updateBurg("port", v)} />
          <Toggle label="Citadel" value={burg.citadel} onChange={v => updateBurg("citadel", v)} />
          <Toggle label="Plaza" value={burg.plaza} onChange={v => updateBurg("plaza", v)} />
          <Toggle label="Walls" value={burg.walls} onChange={v => updateBurg("walls", v)} />
          <Toggle label="Shanty Town" value={burg.shanty} onChange={v => updateBurg("shanty", v)} />
          <Toggle label="Temple" value={burg.temple} onChange={v => updateBurg("temple", v)} />
        </div>
      </section>

      {/* Production */}
      <section className="detail-section">
        <h3 className="detail-section-title">Production</h3>
        <p className="detail-hint">Check a good to mark this burg as a producer of it (appears in Azgaar's "Producers" dialog).</p>
        <div className="production-grid">
          {data.goodsDefs.map(g => {
            const producers = Array.isArray(g.producers) ? g.producers as number[] : [];
            const producing = producers.includes(burg.i);
            return (
              <label key={g.i} className={`production-item${producing ? " active" : ""}`}>
                <input
                  type="checkbox"
                  checked={producing}
                  onChange={e => toggleProducer(g.i, e.target.checked)}
                />
                <span className="production-icon">{g.icon ?? "📦"}</span>
                <span className="production-name">{g.name}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Trade Deals */}
      <section className="detail-section">
        <h3 className="detail-section-title">Trade Deals ({burgDeals.length})</h3>
        {burgDeals.length === 0 ? (
          <p className="detail-hint">No active trade deals involving this burg.</p>
        ) : (
          <table className="data-table" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Role</th>
                <th>Good</th>
                <th>Units</th>
                <th>Price</th>
                <th>Counterparty</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {burgDeals.map(deal => {
                const isSeller = deal.seller === burg.i && deal.sellerType === "burg";
                const counterpartyId = isSeller ? deal.buyer : deal.seller;
                const counterpartyType = isSeller ? deal.buyerType : deal.sellerType;
                const counterpartyLabel = counterpartyType === "burg"
                  ? (data.pack.burgs.find(b => b.i === counterpartyId)?.name ?? `Burg ${counterpartyId}`)
                  : marketName(counterpartyId);
                return (
                  <tr key={deal.i}>
                    <td>{deal.i}</td>
                    <td><span className={`deal-role ${isSeller ? "seller" : "buyer"}`}>{isSeller ? "Seller" : "Buyer"}</span></td>
                    <td>{goodName(deal.good)}</td>
                    <td>{deal.units}</td>
                    <td>{deal.price}</td>
                    <td>{counterpartyLabel} <span className="text-dim">({counterpartyType})</span></td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onChange({ ...data, deals: data.deals.filter(d => d.i !== deal.i) })}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Market */}
      {market && (
        <section className="detail-section">
          <h3 className="detail-section-title">Market Center</h3>
          <p className="detail-hint">This burg is the center of Market #{market.i}. Go to the Markets &amp; Goods tab to edit what's available here.</p>
          <div className="market-goods-summary">
            {Object.entries(market.goods).map(([goodId, gd]) => (
              <span key={goodId} className="market-good-chip">
                {goodName(Number(goodId))}: {gd.stock} @ {gd.price}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function BurgsTab({ data, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const burgs = useMemo(() => {
    const active = data.pack.burgs.filter(b => b.i !== 0 && !b.removed);
    if (!search) return active;
    const q = search.toLowerCase();
    return active.filter(b =>
      b.name.toLowerCase().includes(q) ||
      getStateName(b.state, data).toLowerCase().includes(q) ||
      (b.type ?? "").toLowerCase().includes(q)
    );
  }, [data, search]);

  const selectedBurg = data.pack.burgs.find(b => b.i === selectedId) ?? null;

  return (
    <div className="burg-layout">
      {/* Left: burg list */}
      <div className="burg-sidebar">
        <div style={{ padding: "8px" }}>
          <input
            className="search-input"
            style={{ width: "100%" }}
            placeholder="Search burgs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="burg-list">
          {burgs.map(b => (
            <div
              key={b.i}
              className={`burg-list-item${selectedId === b.i ? " active" : ""}`}
              onClick={() => setSelectedId(b.i)}
            >
              <span className="burg-list-name">{b.name}</span>
              <span className="burg-list-state">{getStateName(b.state, data)}</span>
            </div>
          ))}
        </div>
        <div className="burg-list-count">{burgs.length} burgs</div>
      </div>

      {/* Right: detail */}
      <div className="burg-detail-panel">
        {selectedBurg ? (
          <BurgDetail burg={selectedBurg} data={data} onChange={onChange} />
        ) : (
          <div className="empty-state" style={{ height: "100%" }}>
            <span>← Select a burg to view and edit its details</span>
          </div>
        )}
      </div>
    </div>
  );
}
