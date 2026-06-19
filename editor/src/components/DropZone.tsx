import { useRef, useState, useCallback } from "react";
import type { DragEvent, ChangeEvent } from "react";

interface Props {
  onFile: (file: File) => void;
}

export function DropZone({ onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  return (
    <div className="dropzone">
      <div
        className={`dropzone-area${dragOver ? " drag-over" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <div className="dropzone-icon">🗺️</div>
        <h2>Drop your .map file here</h2>
        <p>or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept=".map,.gz"
          onChange={handleChange}
        />
      </div>
      <p className="dropzone-info">
        Supports Azgaar's Fantasy Map Generator .map files (all versions, including gzip-compressed).
        Your file is processed entirely in the browser — nothing is uploaded.
      </p>
    </div>
  );
}
