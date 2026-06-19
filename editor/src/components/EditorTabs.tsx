import { useState } from "react";
import type { MapData } from "../mapParser";
import { BurgsTab } from "./BurgsTab";
import { StatesTab } from "./StatesTab";
import { CulturesTab } from "./CulturesTab";
import { ReligionsTab } from "./ReligionsTab";
import { ProvincesTab } from "./ProvincesTab";
import { RiversTab } from "./RiversTab";
import { NotesTab } from "./NotesTab";
import { MarketsTab } from "./MarketsTab";
import { SettingsTab } from "./SettingsTab";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

type TabId = "burgs" | "states" | "cultures" | "religions" | "provinces" | "rivers" | "notes" | "markets" | "settings";

interface TabDef {
  id: TabId;
  label: string;
  count?: number;
}

export function EditorTabs({ data, onChange }: Props) {
  const [active, setActive] = useState<TabId>("burgs");

  const tabs: TabDef[] = [
    { id: "burgs", label: "Burgs", count: data.pack.burgs.filter(b => !b.removed && b.i !== 0).length },
    { id: "states", label: "States", count: data.pack.states.filter(s => !s.removed && s.i !== 0).length },
    { id: "cultures", label: "Cultures", count: data.pack.cultures.filter(c => !c.removed && c.i !== 0).length },
    { id: "religions", label: "Religions", count: data.pack.religions.filter(r => !r.removed && r.i !== 0).length },
    { id: "provinces", label: "Provinces", count: data.pack.provinces.filter(p => !p.removed && p.i !== 0).length },
    { id: "rivers", label: "Rivers", count: data.pack.rivers.filter(r => !r.removed).length },
    { id: "notes", label: "Notes", count: data.notes.length },
    { id: "markets", label: "Markets & Goods", count: data.markets.length },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="editor-tabs">
      <div className="tab-bar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn${active === tab.id ? " active" : ""}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="tab-count">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {active === "burgs" && <BurgsTab data={data} onChange={onChange} />}
        {active === "states" && <StatesTab data={data} onChange={onChange} />}
        {active === "cultures" && <CulturesTab data={data} onChange={onChange} />}
        {active === "religions" && <ReligionsTab data={data} onChange={onChange} />}
        {active === "provinces" && <ProvincesTab data={data} onChange={onChange} />}
        {active === "rivers" && <RiversTab data={data} onChange={onChange} />}
        {active === "notes" && <NotesTab data={data} onChange={onChange} />}
        {active === "markets" && <MarketsTab data={data} onChange={onChange} />}
        {active === "settings" && <SettingsTab data={data} onChange={onChange} />}
      </div>
    </div>
  );
}
