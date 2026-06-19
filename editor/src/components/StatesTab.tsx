import { useCallback } from "react";
import type { MapData, State } from "../mapParser";
import { DataTable } from "./DataTable"
import type { Column } from "./DataTable";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

const COLUMNS: Column<State>[] = [
  { key: "i", label: "#", width: 45 },
  { key: "name", label: "Name", editable: true, type: "text", width: 150 },
  { key: "fullName", label: "Full Name", editable: true, type: "text", width: 190 },
  { key: "color", label: "Color", editable: true, type: "color", width: 160 },
  { key: "type", label: "Type", editable: true, type: "text", width: 100 },
  { key: "form", label: "Form", editable: true, type: "text", width: 100 },
  { key: "formName", label: "Form Name", editable: true, type: "text", width: 120 },
  { key: "urban", label: "Urban Pop.", editable: true, type: "number", width: 100 },
  { key: "rural", label: "Rural Pop.", editable: true, type: "number", width: 100 },
  { key: "area", label: "Area", width: 80 },
  { key: "capital", label: "Capital Burg", width: 100 },
  { key: "culture", label: "Culture", width: 70 },
];

export function StatesTab({ data, onChange }: Props) {
  const states = data.pack.states.filter(s => s.i !== 0);

  const handleUpdate = useCallback((i: number, key: string, value: string | number | boolean | unknown[]) => {
    const newStates = data.pack.states.map(s =>
      s.i === i ? { ...s, [key]: value } : s
    );
    onChange({ ...data, pack: { ...data.pack, states: newStates } });
  }, [data, onChange]);

  return (
    <DataTable
      rows={states}
      columns={COLUMNS}
      onUpdate={handleUpdate}
      searchKeys={["name", "fullName", "form", "type"]}
    />
  );
}
