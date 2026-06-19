import { useCallback } from "react";
import type { MapData, Province } from "../mapParser";
import { DataTable } from "./DataTable"
import type { Column } from "./DataTable";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

const COLUMNS: Column<Province>[] = [
  { key: "i", label: "#", width: 50 },
  { key: "name", label: "Name", editable: true, type: "text", width: 160 },
  { key: "fullName", label: "Full Name", editable: true, type: "text", width: 200 },
  { key: "color", label: "Color", editable: true, type: "color", width: 160 },
  { key: "formName", label: "Form Name", editable: true, type: "text", width: 120 },
  { key: "state", label: "State", width: 70 },
  { key: "burg", label: "Capital Burg", width: 100 },
];

export function ProvincesTab({ data, onChange }: Props) {
  const provinces = data.pack.provinces.filter(p => p.i !== 0);

  const handleUpdate = useCallback((i: number, key: string, value: string | number) => {
    const newProvinces = data.pack.provinces.map(p =>
      p.i === i ? { ...p, [key]: value } : p
    );
    onChange({ ...data, pack: { ...data.pack, provinces: newProvinces } });
  }, [data, onChange]);

  return (
    <DataTable
      rows={provinces}
      columns={COLUMNS}
      onUpdate={handleUpdate}
      searchKeys={["name", "fullName", "formName"]}
    />
  );
}
