import { useCallback } from "react";
import type { MapData, Religion } from "../mapParser";
import { DataTable } from "./DataTable"
import type { Column } from "./DataTable";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

const COLUMNS: Column<Religion>[] = [
  { key: "i", label: "#", width: 45 },
  { key: "name", label: "Name", editable: true, type: "text", width: 180 },
  { key: "color", label: "Color", editable: true, type: "color", width: 160 },
  { key: "type", label: "Type", editable: true, type: "text", width: 100 },
  { key: "form", label: "Form", editable: true, type: "text", width: 120 },
  { key: "deity", label: "Deity", editable: true, type: "text", width: 160 },
  { key: "rural", label: "Rural Pop.", width: 100 },
  { key: "urban", label: "Urban Pop.", width: 100 },
  { key: "area", label: "Area", width: 80 },
  { key: "cells", label: "Cells", width: 70 },
];

export function ReligionsTab({ data, onChange }: Props) {
  const religions = data.pack.religions.filter(r => r.i !== 0);

  const handleUpdate = useCallback((i: number, key: string, value: string | number | boolean | unknown[]) => {
    const newReligions = data.pack.religions.map(r =>
      r.i === i ? { ...r, [key]: value } : r
    );
    onChange({ ...data, pack: { ...data.pack, religions: newReligions } });
  }, [data, onChange]);

  return (
    <DataTable
      rows={religions}
      columns={COLUMNS}
      onUpdate={handleUpdate}
      searchKeys={["name", "type", "form", "deity"]}
    />
  );
}
