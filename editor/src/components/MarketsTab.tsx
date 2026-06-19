import { useState, useMemo, useCallback } from "react";
import type { MapData, Market } from "../mapParser";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

const DEFAULT_STOCK = 100;
const DEFAULT_PRICE = 1.0;

function getBurgName(burgId: number, data: MapData): string {
  const burg = data.pack.burgs.find(b => b.i === burgId);
  return burg?.name ?? `Burg #${burgId}`;
}

function getStateName(burgId: number, data: MapData): string {
  const burg = data.pack.burgs.find(b => b.i === burgId);
  if (!burg) return "";
  const state = data.pack.states.find(s => s.i === burg.state);
  return state?.name ?? "";
}

export function MarketsTab({ data, onChange }: Props) {
  const [selectedGoodId, setSelectedGoodId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [editingStock, setEditingStock] = useState<Record<string, string>>({});

  const selectedGood = data.goodsDefs.find(g => g.i === selectedGoodId) ?? null;

  const filteredGoods = useMemo(() => {
    if (!search) return data.goodsDefs;
    const q = search.toLowerCase();
    return data.goodsDefs.filter(g => g.name.toLowerCase().includes(q));
  }, [data.goodsDefs, search]);

  const hasGood = useCallback((market: Market, goodId: number) => {
    return String(goodId) in market.goods;
  }, []);

  const toggleGood = useCallback((marketIdx: number, goodId: number) => {
    const market = data.markets[marketIdx];
    const removing = String(goodId) in market.goods;

    const newMarkets = data.markets.map((m, i) => {
      if (i !== marketIdx) return m;
      const goods = { ...m.goods };
      const key = String(goodId);
      if (removing) {
        delete goods[key];
      } else {
        goods[key] = { stock: DEFAULT_STOCK, price: DEFAULT_PRICE };
      }
      return { ...m, goods };
    });

    // Also purge all deals for this good involving this market when removing
    const newDeals = removing
      ? data.deals.filter(d => !(d.good === goodId && (d.seller === market.i || d.buyer === market.i)))
      : data.deals;

    onChange({ ...data, markets: newMarkets, deals: newDeals });
  }, [data, onChange]);

  const updateStock = useCallback((marketIdx: number, goodId: number, stock: number, price: number) => {
    const newMarkets = data.markets.map((m, i) => {
      if (i !== marketIdx) return m;
      return { ...m, goods: { ...m.goods, [String(goodId)]: { stock, price } } };
    });
    onChange({ ...data, markets: newMarkets });
  }, [data, onChange]);

  return (
    <div className="markets-layout">
      {/* Left: goods list */}
      <div className="goods-sidebar">
        <div style={{ padding: "8px" }}>
          <input
            className="search-input"
            style={{ width: "100%" }}
            placeholder="Search goods…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="goods-list">
          {filteredGoods.map(good => {
            const marketCount = data.markets.filter(m => String(good.i) in m.goods).length;
            return (
              <div
                key={good.i}
                className={`good-list-item${selectedGoodId === good.i ? " active" : ""}`}
                onClick={() => setSelectedGoodId(good.i)}
              >
                <span className="good-name">{good.name}</span>
                <span className="good-market-count">{marketCount}/{data.markets.length}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: markets for selected good */}
      <div className="markets-panel">
        {selectedGood ? (
          <>
            <div className="markets-header">
              <h2>{selectedGood.name}</h2>
              <span className="text-dim">
                Present in {data.markets.filter(m => String(selectedGood.i) in m.goods).length} of {data.markets.length} markets
                {" · "}
                {data.deals.filter(d => d.good === selectedGood.i).length} active deals
              </span>
              <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const key = String(selectedGood.i);
                    const newMarkets = data.markets.map(m => {
                      const goods = { ...m.goods };
                      delete goods[key];
                      return { ...m, goods };
                    });
                    // Remove all deals for this good
                    const newDeals = data.deals.filter(d => d.good !== selectedGood.i);
                    onChange({ ...data, markets: newMarkets, deals: newDeals });
                  }}
                >
                  Remove from all
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const newMarkets = data.markets.map(m => {
                      const key = String(selectedGood.i);
                      if (key in m.goods) return m;
                      return { ...m, goods: { ...m.goods, [key]: { stock: DEFAULT_STOCK, price: DEFAULT_PRICE } } };
                    });
                    onChange({ ...data, markets: newMarkets });
                  }}
                >
                  Add to all
                </button>
              </div>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Market Center (Burg)</th>
                    <th>State</th>
                    <th style={{ width: 100 }}>Has Good</th>
                    <th style={{ width: 100 }}>Stock</th>
                    <th style={{ width: 100 }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {data.markets.map((market, idx) => {
                    const burgName = getBurgName(market.centerBurgId, data);
                    const stateName = getStateName(market.centerBurgId, data);
                    const present = hasGood(market, selectedGood.i);
                    const goodData = market.goods[String(selectedGood.i)];
                    const stockKey = `${idx}-stock`;
                    const priceKey = `${idx}-price`;

                    return (
                      <tr key={market.i} className={present ? "" : "dimmed"}>
                        <td>{market.i}</td>
                        <td><strong>{burgName}</strong></td>
                        <td style={{ color: "var(--text-dim)" }}>{stateName}</td>
                        <td>
                          <label className="toggle-label">
                            <input
                              type="checkbox"
                              checked={present}
                              onChange={() => toggleGood(idx, selectedGood.i)}
                            />
                            <span className="toggle-text">{present ? "Yes" : "No"}</span>
                          </label>
                        </td>
                        <td>
                          {present && (
                            <input
                              className="cell-edit"
                              type="number"
                              value={editingStock[stockKey] ?? String(goodData.stock)}
                              onChange={e => setEditingStock(prev => ({ ...prev, [stockKey]: e.target.value }))}
                              onBlur={e => {
                                const stock = parseFloat(e.target.value) || 0;
                                updateStock(idx, selectedGood.i, stock, goodData.price);
                                setEditingStock(prev => { const n = { ...prev }; delete n[stockKey]; return n; });
                              }}
                            />
                          )}
                        </td>
                        <td>
                          {present && (
                            <input
                              className="cell-edit"
                              type="number"
                              step="0.01"
                              value={editingStock[priceKey] ?? String(goodData.price)}
                              onChange={e => setEditingStock(prev => ({ ...prev, [priceKey]: e.target.value }))}
                              onBlur={e => {
                                const price = parseFloat(e.target.value) || 0;
                                updateStock(idx, selectedGood.i, goodData.stock, price);
                                setEditingStock(prev => { const n = { ...prev }; delete n[priceKey]; return n; });
                              }}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ height: "100%" }}>
            <span>← Select a good from the list to see which markets carry it</span>
          </div>
        )}
      </div>
    </div>
  );
}
