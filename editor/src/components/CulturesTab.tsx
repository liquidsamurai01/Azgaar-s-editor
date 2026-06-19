import { useCallback } from "react";
import type { MapData, Culture } from "../mapParser";
import { DataTable } from "./DataTable"
import type { Column } from "./DataTable";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

const COLUMNS: Column<Culture>[] = [
  { key: "i", label: "#", width: 50 },
  { key: "name", label: "Name", editable: true, type: "text", width: 160 },
  { key: "color", label: "Color", editable: true, type: "color", width: 160 },
  { key: "type", label: "Type", editable: true, type: "text", width: 100 },
  { key: "base", label: "Name Base", width: 80 },
  { key: "expansionism", label: "Expansionism", editable: true, type: "number", width: 120 },
  { key: "rural", label: "Rural Pop.", width: 100 },
  { key: "urban", label: "Urban Pop.", width: 100 },
  { key: "area", label: "Area", width: 80 },
  { key: "cells", label: "Cells", width: 70 },
];

export function CulturesTab({ data, onChange }: Props) {
  const cultures = data.pack.cultures.filter(c => c.i !== 0);

  const handleUpdate = useCallback((i: number, key: string, value: string | number) => {
    const newCultures = data.pack.cultures.map(c =>
      c.i === i ? { ...c, [key]: value } : c
    );
    onChange({ ...data, pack: { ...data.pack, cultures: newCultures } });
  }, [data, onChange]);

  return (
    <DataTable
      rows={cultures}
      columns={COLUMNS}
      onUpdate={handleUpdate}
      searchKeys={["name", "type"]}
    />
  );
}
