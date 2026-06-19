import { useCallback } from "react";
import type { MapData, GoodDef } from "../mapParser";
import { DataTable } from "./DataTable";
import type { Column } from "./DataTable";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

const COLUMNS: Column<GoodDef>[] = [
  { key: "i", label: "#", width: 45 },
  { key: "name", label: "Name", editable: true, type: "text", width: 150 },
  { key: "icon", label: "Icon", editable: true, type: "text", width: 60 },
  { key: "color", label: "Color", editable: true, type: "color", width: 160 },
  { key: "tags", label: "Tags", editable: true, type: "array", width: 220,
    render: (g) => <span style={{ color: "var(--text-dim)", fontSize: 12 }}>{Array.isArray(g.tags) ? g.tags.join(", ") : ""}</span> },
  {
    key: "producers",
    label: "Producers (Burg IDs)",
    editable: true,
    type: "array",
    width: 220,
  },
];

export function GoodsDefsTab({ data, onChange }: Props) {
  const handleUpdate = useCallback((i: number, key: string, value: string | number | boolean | unknown[]) => {
    const newGoodsDefs = data.goodsDefs.map(g =>
      g.i === i ? { ...g, [key]: value } : g
    );
    onChange({ ...data, goodsDefs: newGoodsDefs });
  }, [data, onChange]);

  return (
    <div>
      <div style={{ padding: "0 0 12px", color: "var(--text-dim)", fontSize: 12 }}>
        <strong style={{ color: "var(--text)" }}>Producers</strong> — comma-separated list of Burg IDs that manufacture each good.
        Clear this list (and use Markets &amp; Goods to remove from markets) to stop a good from appearing as produced by those burgs.
      </div>
      <DataTable
        rows={data.goodsDefs}
        columns={COLUMNS}
        onUpdate={handleUpdate}
        searchKeys={["name"]}
      />
    </div>
  );
}
