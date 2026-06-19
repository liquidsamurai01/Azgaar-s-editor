import { useState, useCallback } from "react";
import type { MapData, Note } from "../mapParser";

interface Props {
  data: MapData;
  onChange: (data: MapData) => void;
}

export function NotesTab({ data, onChange }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(
    data.notes[0]?.id ?? null
  );

  const selected = data.notes.find(n => n.id === selectedId) ?? null;

  const updateNote = useCallback((field: keyof Note, value: string) => {
    if (!selectedId) return;
    const newNotes = data.notes.map(n =>
      n.id === selectedId ? { ...n, [field]: value } : n
    );
    onChange({ ...data, notes: newNotes });
  }, [selectedId, data, onChange]);

  const addNote = useCallback(() => {
    const id = `note_${Date.now()}`;
    const newNote: Note = { id, name: "New Note", legend: "" };
    onChange({ ...data, notes: [...data.notes, newNote] });
    setSelectedId(id);
  }, [data, onChange]);

  const deleteNote = useCallback(() => {
    if (!selectedId) return;
    const newNotes = data.notes.filter(n => n.id !== selectedId);
    onChange({ ...data, notes: newNotes });
    setSelectedId(newNotes[0]?.id ?? null);
  }, [selectedId, data, onChange]);

  return (
    <div className="notes-layout">
      <div className="notes-list">
        <div className="table-toolbar" style={{ padding: "8px" }}>
          <button className="btn btn-primary btn-sm" onClick={addNote}>+ Add</button>
        </div>
        {data.notes.map(note => (
          <div
            key={note.id}
            className={`note-list-item${note.id === selectedId ? " active" : ""}`}
            onClick={() => setSelectedId(note.id)}
          >
            {note.name || "(unnamed)"}
          </div>
        ))}
        {data.notes.length === 0 && (
          <div className="empty-state">No notes</div>
        )}
      </div>

      <div className="note-editor">
        {selected ? (
          <>
            <input
              className="note-name-input"
              placeholder="Note title"
              value={selected.name}
              onChange={e => updateNote("name", e.target.value)}
            />
            <textarea
              className="note-legend-input"
              placeholder="Note content / legend (supports HTML)"
              value={selected.legend}
              onChange={e => updateNote("legend", e.target.value)}
            />
            <div className="note-actions">
              <button className="btn btn-danger btn-sm" onClick={deleteNote}>
                Delete Note
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <span>Select a note or add a new one</span>
          </div>
        )}
      </div>
    </div>
  );
}
