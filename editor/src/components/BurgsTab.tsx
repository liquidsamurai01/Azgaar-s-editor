import { useCallback } from "react";
import type { MapData, Burg } from "../mapParser";
import { DataTable } from "./DataTable"
import type { Column } from "./DataTable";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

const COLUMNS: Column<Burg>[] = [
  { key: "i", label: "#", width: 45 },
  { key: "name", label: "Name", editable: true, type: "text", width: 150 },
  { key: "state", label: "State", width: 55 },
  { key: "culture", label: "Culture", width: 65 },
  { key: "religion", label: "Religion", width: 70 },
  { key: "type", label: "Type", editable: true, type: "text", width: 90 },
  { key: "population", label: "Population", editable: true, type: "number", width: 100 },
  { key: "x", label: "X", editable: true, type: "number", width: 70 },
  { key: "y", label: "Y", editable: true, type: "number", width: 70 },
  { key: "capital", label: "Capital", editable: true, type: "boolean", width: 65 },
  { key: "port", label: "Port", editable: true, type: "boolean", width: 50 },
  { key: "citadel", label: "Citadel", editable: true, type: "boolean", width: 65 },
  { key: "plaza", label: "Plaza", editable: true, type: "boolean", width: 55 },
  { key: "walls", label: "Walls", editable: true, type: "boolean", width: 55 },
  { key: "shanty", label: "Shanty", editable: true, type: "boolean", width: 60 },
  { key: "temple", label: "Temple", editable: true, type: "boolean", width: 60 },
];

export function BurgsTab({ data, onChange }: Props) {
  const burgs = data.pack.burgs.filter(b => b.i !== 0);

  const handleUpdate = useCallback((i: number, key: string, value: string | number | boolean | unknown[]) => {
    const newBurgs = data.pack.burgs.map(b =>
      b.i === i ? { ...b, [key]: value } : b
    );
    onChange({ ...data, pack: { ...data.pack, burgs: newBurgs } });
  }, [data, onChange]);

  return (
    <DataTable
      rows={burgs}
      columns={COLUMNS}
      onUpdate={handleUpdate}
      searchKeys={["name", "type"]}
    />
  );
}
