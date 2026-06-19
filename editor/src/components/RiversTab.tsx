import { useCallback } from "react";
import type { MapData, River } from "../mapParser";
import { DataTable } from "./DataTable"
import type { Column } from "./DataTable";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

const COLUMNS: Column<River>[] = [
  { key: "i", label: "#", width: 45 },
  { key: "name", label: "Name", editable: true, type: "text", width: 200 },
  { key: "type", label: "Type", editable: true, type: "text", width: 120 },
];

export function RiversTab({ data, onChange }: Props) {
  const rivers = data.pack.rivers.filter(r => !r.removed);

  const handleUpdate = useCallback((i: number, key: string, value: string | number | boolean | unknown[]) => {
    const newRivers = data.pack.rivers.map(r =>
      r.i === i ? { ...r, [key]: value } : r
    );
    onChange({ ...data, pack: { ...data.pack, rivers: newRivers } });
  }, [data, onChange]);

  return (
    <DataTable
      rows={rivers}
      columns={COLUMNS}
      onUpdate={handleUpdate}
      searchKeys={["name", "type"]}
    />
  );
}
