import { useCallback } from "react";
import type { MapData } from "../mapParser";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

const SETTING_GROUPS = [
  {
    title: "Map Identity",
    keys: ["mapName", "seed"],
  },
  {
    title: "Units & Scale",
    keys: ["distanceUnit", "distanceScale", "areaUnit", "heightUnit", "heightExponent"],
  },
  {
    title: "Climate",
    keys: ["temperatureScale", "latitude0", "prec"],
  },
  {
    title: "Population",
    keys: ["urbanDensity"],
  },
  {
    title: "Display",
    keys: ["hideLabels", "stylePreset", "rescaleLabels"],
  },
];

const LABELS: Record<string, string> = {
  mapName: "Map Name",
  seed: "Seed",
  distanceUnit: "Distance Unit",
  distanceScale: "Distance Scale",
  areaUnit: "Area Unit",
  heightUnit: "Height Unit",
  heightExponent: "Height Exponent",
  temperatureScale: "Temperature Scale",
  latitude0: "Starting Latitude",
  prec: "Precipitation",
  urbanDensity: "Urban Density",
  hideLabels: "Hide Labels",
  stylePreset: "Style Preset",
  rescaleLabels: "Rescale Labels",
};

export function SettingsTab({ data, onChange }: Props) {
  const updateSetting = useCallback((key: string, value: string) => {
    onChange({ ...data, settings: { ...data.settings, [key]: value } });
  }, [data, onChange]);

  const updateParam = useCallback((key: string, value: string) => {
    onChange({ ...data, params: { ...data.params, [key]: value } });
  }, [data, onChange]);

  return (
    <div>
      <div className="settings-grid">
        {/* Map params card */}
        <div className="settings-card">
          <h3>Map Parameters</h3>
          {["seed", "width", "height"].map(key => (
            <div className="setting-row" key={key}>
              <label>{key}</label>
              <input
                className="setting-input"
                value={String(data.params[key] ?? "")}
                onChange={e => updateParam(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        {/* Settings cards */}
        {SETTING_GROUPS.map(group => (
          <div className="settings-card" key={group.title}>
            <h3>{group.title}</h3>
            {group.keys.map(key => (
              <div className="setting-row" key={key}>
                <label>{LABELS[key] ?? key}</label>
                <input
                  className="setting-input"
                  value={String(data.settings[key] ?? "")}
                  onChange={e => updateSetting(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        ))}

        {/* Raw JSON dump for advanced use */}
        <div className="settings-card" style={{ gridColumn: "1 / -1" }}>
          <h3>All Settings (raw)</h3>
          <pre style={{ fontSize: 11, color: "var(--text-dim)", overflow: "auto", maxHeight: 200 }}>
            {JSON.stringify(data.settings, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
