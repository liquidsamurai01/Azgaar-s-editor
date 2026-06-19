import { useState, useMemo } from "react"
import type { ChangeEvent } from "react";

export interface Column<T> {
  key: string;
  label: string;
  editable?: boolean;
  type?: "text" | "number" | "color" | "boolean" | "array";
  width?: number;
  render?: (row: T) => React.ReactNode;
}

interface Props<T extends { i: number; removed?: boolean }> {
  rows: T[];
  columns: Column<T>[];
  onUpdate: (i: number, key: string, value: string | number | boolean | unknown[]) => void;
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
            {visible.map(row => {
              const rec = row as Record<string, unknown>;
              return (
                <tr key={row.i} className={row.removed ? "removed" : ""}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? (
                        col.render(row)
                      ) : col.editable ? (
                        col.type === "color" ? (
                          <div className="color-cell">
                            <input
                              type="color"
                              className="color-picker"
                              value={String(rec[col.key] ?? "#000000")}
                              onChange={e => onUpdate(row.i, col.key, e.target.value)}
                            />
                            <input
                              className="cell-edit"
                              value={String(rec[col.key] ?? "")}
                              onChange={e => onUpdate(row.i, col.key, e.target.value)}
                            />
                          </div>
                        ) : col.type === "boolean" ? (
                          <input
                            type="checkbox"
                            checked={!!rec[col.key]}
                            onChange={e => onUpdate(row.i, col.key, e.target.checked ? 1 : 0)}
                          />
                        ) : col.type === "array" ? (
                          <input
                            className="cell-edit"
                            value={Array.isArray(rec[col.key]) ? (rec[col.key] as unknown[]).join(", ") : String(rec[col.key] ?? "")}
                            onChange={e => {
                              const raw = e.target.value;
                              const arr = raw.split(",").map(s => s.trim()).filter(Boolean).map(Number).filter(n => !isNaN(n));
                              onUpdate(row.i, col.key, arr);
                            }}
                          />
                        ) : (
                          <input
                            className="cell-edit"
                            type={col.type === "number" ? "number" : "text"}
                            value={String(rec[col.key] ?? "")}
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
                        <span>{Array.isArray(rec[col.key]) ? (rec[col.key] as unknown[]).join(", ") : String(rec[col.key] ?? "")}</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
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
