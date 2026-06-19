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
  goodsDefs: GoodDef[];
  markets: Market[];
  raw: string[]; // original sections for round-trip
  version: string;
}

export interface GoodDef {
  i: number;
  name: string;
  icon?: string;
  color?: string;
  tags?: string[];
  [key: string]: unknown;
}

export interface MarketGood {
  stock: number;
  price: number;
}

export interface Market {
  i: number;
  centerBurgId: number;
  color?: string;
  goods: Record<string, MarketGood>;
  [key: string]: unknown;
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

  // Split on \r\n first; fall back to \n if only 1 section found
  let sections = text.split("\r\n");
  if (sections.length === 1) sections = text.split("\n");

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

  // Section indices confirmed from real .map file (v1.124.4, split by \r\n or \n):
  // 0: params, 1: settings, 2: coords, 3: biomes, 4: notes, 5: SVG,
  // 6: grid, 7-12: cell arrays, 13: cultures, 14: states, 15: burgs,
  // 16-28: more cell arrays, 29: religions, 30: provinces,
  // 31: nameBases, 32: rivers, 37: routes
  const biomesData = parseSection(sections[3]) || {};
  const notes: Note[] = parseSection(sections[4]) || [];
  const svg = sections[5] || "";
  const grid = parseSection(sections[6]) || {};

  const pack: Pack = {
    cultures: parseSection(sections[13]) || [],
    states: parseSection(sections[14]) || [],
    burgs: parseSection(sections[15]) || [],
    religions: parseSection(sections[29]) || [],
    provinces: parseSection(sections[30]) || [],
    rivers: parseSection(sections[32]) || [],
    routes: parseSection(sections[37]) || [],
  };

  const parsedNotes = notes;
  const nameBases = parseSection(sections[31]) || [];
  // 41: goods definitions, 42: markets
  const goodsDefs: GoodDef[] = parseSection(sections[41]) || [];
  const markets: Market[] = parseSection(sections[42]) || [];

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
    coords: parseSection(sections[2]),
    notes: parsedNotes,
    biomesData,
    svg,
    grid,
    pack,
    nameBases,
    goodsDefs,
    markets,
    raw: sections,
    version,
  };
}

export function serializeMapFile(data: MapData): string {
  // Write back modified data into raw sections and rejoin
  const sections = [...data.raw];

  sections[4] = JSON.stringify(data.notes);
  sections[13] = JSON.stringify(data.pack.cultures);
  sections[14] = JSON.stringify(data.pack.states);
  sections[15] = JSON.stringify(data.pack.burgs);
  sections[29] = JSON.stringify(data.pack.religions);
  sections[30] = JSON.stringify(data.pack.provinces);
  sections[32] = JSON.stringify(data.pack.rivers);
  sections[37] = JSON.stringify(data.pack.routes);
  sections[42] = JSON.stringify(data.markets);

  // Update settings
  try {
    sections[1] = JSON.stringify(data.settings);
  } catch {
    // leave as-is
  }

  // Preserve original line ending style
  const sep = data.raw.join("").includes("\r\n") ? "\r\n" : "\n";
  return sections.join(sep);
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
