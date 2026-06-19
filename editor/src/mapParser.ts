// Parser for Azgaar's Fantasy Map Generator .map files
// Format: \r\n-delimited sections, each section pipe-delimited or JSON
// Files may be gzip-compressed

export interface MapData {
  params: Record<string, unknown>;
  settings: Record<string, unknown>;
  coords: unknown;
  notes: Note[];
  biomesData: Record<string, unknown>;
  svg: string;
  grid: Record<string, unknown>;
  pack: Pack;
  nameBases: unknown[];
  raw: string[]; // original sections for round-trip
  version: string;
}

export interface Note {
  id: string;
  name: string;
  legend: string;
}

export interface Burg {
  i: number;
  cell: number;
  x: number;
  y: number;
  state: number;
  i_cell?: number;
  name: string;
  culture: number;
  religion?: number;
  type?: string;
  population: number;
  capital?: number;
  port?: number;
  citadel?: number;
  plaza?: number;
  walls?: number;
  shanty?: number;
  temple?: number;
  removed?: boolean;
  [key: string]: unknown;
}

export interface State {
  i: number;
  name: string;
  color: string;
  urban: number;
  rural: number;
  area?: number;
  type?: string;
  form?: string;
  formName?: string;
  fullName?: string;
  capital?: number;
  culture?: number;
  removed?: boolean;
  [key: string]: unknown;
}

export interface Culture {
  i: number;
  name: string;
  color: string;
  base: number;
  type?: string;
  expansionism?: number;
  area?: number;
  cells?: number;
  rural?: number;
  urban?: number;
  removed?: boolean;
  [key: string]: unknown;
}

export interface Religion {
  i: number;
  name: string;
  color: string;
  type?: string;
  form?: string;
  deity?: string;
  area?: number;
  cells?: number;
  rural?: number;
  urban?: number;
  removed?: boolean;
  [key: string]: unknown;
}

export interface Province {
  i: number;
  name: string;
  color: string;
  state: number;
  formName?: string;
  fullName?: string;
  burg?: number;
  removed?: boolean;
  [key: string]: unknown;
}

export interface River {
  i: number;
  name: string;
  type?: string;
  removed?: boolean;
  [key: string]: unknown;
}

export interface Route {
  i: number;
  name?: string;
  removed?: boolean;
  [key: string]: unknown;
}

export interface Pack {
  burgs: Burg[];
  states: State[];
  cultures: Culture[];
  religions: Religion[];
  provinces: Province[];
  rivers: River[];
  routes: Route[];
  [key: string]: unknown;
}

async function decompress(buffer: ArrayBuffer): Promise<string> {
  const ds = new DecompressionStream("gzip");
  const blob = new Blob([buffer]);
  const stream = blob.stream().pipeThrough(ds);
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return new TextDecoder().decode(out);
}

export async function parseMapFile(file: File): Promise<MapData> {
  const buffer = await file.arrayBuffer();
  let text: string;

  // Try plain text first; if it looks compressed, decompress
  const firstBytes = new Uint8Array(buffer.slice(0, 3));
  const isGzip = firstBytes[0] === 0x1f && firstBytes[1] === 0x8b;

  if (isGzip) {
    text = await decompress(buffer);
  } else {
    text = new TextDecoder().decode(buffer);
    // Handle base64 encoded variant
    if (!text.includes("|") && text.length > 0) {
      try {
        text = decodeURIComponent(atob(text));
      } catch {
        // not base64, use as-is
      }
    }
  }

  const sections = text.split("\r\n");

  // Version is stored in params section (first element after splitting)
  let version = "unknown";
  try {
    const paramStr = sections[0];
    // params looks like: version|seed|width|height|...
    const parts = paramStr.split("|");
    version = parts[0] || version;
  } catch {
    // ignore
  }

  // Parse JSON sections (newer format stores them as JSON, fallback for older)
  const parseSection = (s: string) => {
    if (!s || s === "null" || s === "undefined") return null;
    try {
      return JSON.parse(s);
    } catch {
      return s; // return raw string if not JSON
    }
  };

  const notes: Note[] = parseSection(sections[2]) || [];
  const biomesData = parseSection(sections[3]) || {};
  const svg = sections[4] || "";
  const grid = parseSection(sections[5]) || {};

  // Pack data is split across sections 6+
  // In newer versions pack sub-arrays are stored individually
  const pack: Pack = {
    burgs: parseSection(sections[6]) || [],
    states: parseSection(sections[7]) || [],
    cultures: parseSection(sections[8]) || [],
    religions: parseSection(sections[9]) || [],
    provinces: parseSection(sections[10]) || [],
    rivers: parseSection(sections[11]) || [],
    routes: parseSection(sections[13]) || [],
  };

  // Notes may also be at index 19 in some versions
  let parsedNotes = notes;
  if (!Array.isArray(parsedNotes) || parsedNotes.length === 0) {
    parsedNotes = parseSection(sections[19]) || [];
  }

  const nameBases = parseSection(sections[24]) || [];

  // Parse params and settings
  const paramsRaw = sections[0];
  const settingsRaw = sections[1];
  const params: Record<string, unknown> = {};
  const settings: Record<string, unknown> = {};

  // Params: "version|seed|width|height|id|zoom|x|y"
  try {
    const p = paramsRaw.split("|");
    params.version = p[0];
    params.seed = p[1];
    params.width = p[2];
    params.height = p[3];
    params.id = p[4];
    params.zoom = p[5];
    params.x = p[6];
    params.y = p[7];
  } catch {
    // ignore
  }

  // Settings: JSON in newer versions, pipe-delimited in older
  try {
    const parsed = JSON.parse(settingsRaw);
    Object.assign(settings, parsed);
  } catch {
    // try pipe split for older format
    const s = settingsRaw.split("|");
    settings.distanceUnit = s[0];
    settings.distanceScale = s[1];
    settings.areaUnit = s[2];
    settings.heightUnit = s[3];
    settings.heightExponent = s[4];
    settings.temperatureScale = s[5];
    settings.latitude0 = s[6];
    settings.prec = s[7];
    settings.options = s[8];
    settings.mapName = s[9];
    settings.hideLabels = s[10];
    settings.stylePreset = s[11];
    settings.rescaleLabels = s[12];
    settings.urbanDensity = s[13];
  }

  return {
    params,
    settings,
    coords: parseSection(sections[5]),
    notes: parsedNotes,
    biomesData,
    svg,
    grid,
    pack,
    nameBases,
    raw: sections,
    version,
  };
}

export function serializeMapFile(data: MapData): string {
  // Write back modified data into raw sections and rejoin
  const sections = [...data.raw];

  sections[2] = JSON.stringify(data.notes);
  sections[6] = JSON.stringify(data.pack.burgs);
  sections[7] = JSON.stringify(data.pack.states);
  sections[8] = JSON.stringify(data.pack.cultures);
  sections[9] = JSON.stringify(data.pack.religions);
  sections[10] = JSON.stringify(data.pack.provinces);
  sections[11] = JSON.stringify(data.pack.rivers);
  sections[13] = JSON.stringify(data.pack.routes);

  // Update settings
  try {
    sections[1] = JSON.stringify(data.settings);
  } catch {
    // leave as-is
  }

  return sections.join("\r\n");
}

export function downloadMapFile(data: MapData, filename: string) {
  const text = serializeMapFile(data);
  const blob = new Blob([text], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
