import { useState, useCallback } from "react";
import { parseMapFile, downloadMapFile } from "./mapParser";
import type { MapData } from "./mapParser";
import { DropZone } from "./components/DropZone";
import { EditorTabs } from "./components/EditorTabs";
import "./App.css";

function App() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [filename, setFilename] = useState("map.map");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const data = await parseMapFile(file);
      setMapData(data);
      setFilename(file.name);
    } catch (e) {
      setError(`Failed to parse file: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (mapData) downloadMapFile(mapData, filename);
  }, [mapData, filename]);

  const handleReset = useCallback(() => {
    setMapData(null);
    setError(null);
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Azgaar's Map Editor</h1>
        {mapData && (
          <div className="header-actions">
            <span className="file-badge">{filename}</span>
            <span className="version-badge">v{String(mapData.params.version ?? mapData.version)}</span>
            <button className="btn btn-secondary" onClick={handleReset}>Load Different File</button>
            <button className="btn btn-primary" onClick={handleDownload}>Download .map</button>
          </div>
        )}
      </header>

      <main className="app-main">
        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p>Parsing map file…</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {!mapData && !loading && <DropZone onFile={handleFile} />}

        {mapData && !loading && (
          <EditorTabs data={mapData} onChange={setMapData} />
        )}
      </main>
    </div>
  );
}

export default App;
