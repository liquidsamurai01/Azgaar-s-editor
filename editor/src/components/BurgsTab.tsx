import { useCallback } from "react";
import type { MapData, Burg } from "../mapParser";
import { DataTable } from "./DataTable"
import type { Column } from "./DataTable";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

const COLUMNS: Column<Burg>[] = [
  { key: "i", label: "#", width: 50 },
  { key: "name", label: "Name", editable: true, type: "text", width: 160 },
  { key: "population", label: "Population", editable: true, type: "number", width: 110 },
  { key: "x", label: "X", editable: true, type: "number", width: 80 },
  { key: "y", label: "Y", editable: true, type: "number", width: 80 },
  { key: "state", label: "State", width: 60 },
  { key: "culture", label: "Culture", width: 70 },
  { key: "capital", label: "Capital", width: 70,
    render: (b) => <span>{b.capital ? "✓" : ""}</span> },
  { key: "port", label: "Port", width: 60,
    render: (b) => <span>{b.port ? "✓" : ""}</span> },
  { key: "type", label: "Type", editable: true, type: "text", width: 90 },
];

export function BurgsTab({ data, onChange }: Props) {
  const burgs = data.pack.burgs.filter(b => b.i !== 0);

  const handleUpdate = useCallback((i: number, key: string, value: string | number) => {
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
