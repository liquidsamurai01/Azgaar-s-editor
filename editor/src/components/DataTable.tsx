import { useState, useMemo } from "react"
import type { ChangeEvent } from "react";

export interface Column<T> {
  key: string;
  label: string;
  editable?: boolean;
  type?: "text" | "number" | "color";
  width?: number;
  render?: (row: T) => React.ReactNode;
}

interface Props<T extends { i: number; removed?: boolean }> {
  rows: T[];
  columns: Column<T>[];
  onUpdate: (i: number, key: string, value: string | number) => void;
  searchKeys?: (keyof T)[];
}

export function DataTable<T extends { i: number; removed?: boolean }>({
  rows,
  columns,
  onUpdate,
  searchKeys = [],
}: Props<T>) {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(row =>
      searchKeys.some(k => String(row[k] ?? "").toLowerCase().includes(q))
    );
  }, [rows, search, searchKeys]);

  return (
    <div>
      <div className="table-toolbar">
        <input
          className="search-input"
          placeholder="Search…"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        />
        <span className="table-info">
          {visible.length} / {rows.length} rows
        </span>
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={col.width ? { width: col.width } : {}}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map(row => (
              <tr key={row.i} className={row.removed ? "removed" : ""}>
                {columns.map(col => (
                  <td key={col.key}>
                    {col.render ? (
                      col.render(row)
                    ) : col.editable ? (
                      col.type === "color" ? (
                        <div className="color-cell">
                          <div
                            className="color-swatch"
                            style={{ background: String((row as Record<string, unknown>)[col.key] ?? "") }}
                          />
                          <input
                            className="cell-edit"
                            value={String((row as Record<string, unknown>)[col.key] ?? "")}
                            onChange={e => onUpdate(row.i, col.key, e.target.value)}
                          />
                        </div>
                      ) : (
                        <input
                          className="cell-edit"
                          type={col.type === "number" ? "number" : "text"}
                          value={String((row as Record<string, unknown>)[col.key] ?? "")}
                          onChange={e =>
                            onUpdate(
                              row.i,
                              col.key,
                              col.type === "number" ? Number(e.target.value) : e.target.value
                            )
                          }
                        />
                      )
                    ) : (
                      <span>{String((row as Record<string, unknown>)[col.key] ?? "")}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="empty-state">
            <span>No results</span>
          </div>
        )}
      </div>
    </div>
  );
}
