"use client";

import { useEffect, useMemo, useState } from "react";
import { createNote, deleteNote, fetchNotes, updateNote } from "@/lib/supabaseRest";

export type NotesAppProps = {
  accessToken: string;
  userId: string;
};

type Note = {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
};

export default function NotesApp({ accessToken, userId }: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [contentDraft, setContentDraft] = useState("");
  const [status, setStatus] = useState("Ready");
  const [loading, setLoading] = useState(false);

  const selectedNote = useMemo(() => notes.find((note) => note.id === selectedNoteId) || null, [notes, selectedNoteId]);

  useEffect(() => {
    if (!accessToken) {
      setStatus("Authentication required");
      setNotes([]);
      setSelectedNoteId(null);
      return;
    }
    // Initial load or when session changes
    loadNotes();
  }, [accessToken]);

  useEffect(() => {
    if (!selectedNote) return;
    setTitleDraft(selectedNote.title);
    setContentDraft(selectedNote.content);
  }, [selectedNote?.id]);

  const loadNotes = async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setStatus("Loading notes...");
      const data = (await fetchNotes(accessToken)) as Note[];
      setNotes(data || []);
      const first = data?.[0];
      if (first) {
        setSelectedNoteId(first.id);
        setTitleDraft(first.title);
        setContentDraft(first.content);
      } else {
        setSelectedNoteId(null);
        setTitleDraft("");
        setContentDraft("");
      }
      setStatus("Notes synced");
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!accessToken || !userId) {
      setStatus("Authentication required");
      return;
    }
    try {
      setLoading(true);
      setStatus("Creating note...");
      const payload = { title: "New note", content: "", user_id: userId };
      await createNote(accessToken, payload);
      await loadNotes();
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : "Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!accessToken || !selectedNoteId) {
      setStatus("Select a note first");
      return;
    }
    try {
      setLoading(true);
      setStatus("Saving...");
      await updateNote(accessToken, selectedNoteId, {
        title: titleDraft || "Untitled note",
        content: contentDraft,
      });
      await loadNotes();
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : "Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!accessToken || !selectedNoteId) {
      setStatus("Select a note first");
      return;
    }
    if (!confirm("Delete this note?")) return;
    try {
      setLoading(true);
      setStatus("Deleting...");
      await deleteNote(accessToken, selectedNoteId);
      await loadNotes();
    } catch (error: unknown) {
      setStatus(error instanceof Error ? error.message : "Failed to delete note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="notepad-toolbar" style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button className="menu-button" onClick={handleCreate} type="button">
          New
        </button>
        <button className="menu-button" onClick={handleSave} type="button" disabled={!selectedNoteId || loading}>
          Save
        </button>
        <button className="menu-button" onClick={handleDelete} type="button" disabled={!selectedNoteId || loading}>
          Delete
        </button>
        <button className="menu-button" onClick={loadNotes} type="button" disabled={loading || !accessToken}>
          Refresh
        </button>
        <span style={{ marginLeft: "auto", fontSize: 12 }}>{loading ? "Working..." : status}</span>
      </div>

      {!accessToken ? (
        <div style={{ padding: 12, color: "#550000" }}>Authentication required to load notes.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 8, height: "100%" }}>
          <div
            style={{
              borderRight: "1px solid #b0b0b0",
              background: "#f0f0f0",
              padding: 8,
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <strong>Notes</strong>
              <button className="menu-button" onClick={handleCreate} type="button">
                +
              </button>
            </div>
            {notes.length === 0 ? (
              <div style={{ fontSize: 12, color: "#444" }}>No notes yet.</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {notes.map((note) => (
                  <li key={note.id} style={{ marginBottom: 6 }}>
                    <button
                      type="button"
                      className={`menu-item ${note.id === selectedNoteId ? "active" : ""}`}
                      style={{ width: "100%", textAlign: "left" }}
                      onClick={() => setSelectedNoteId(note.id)}
                      disabled={loading}
                    >
                      {note.title || "Untitled note"}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div style={{ padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="text"
              value={titleDraft}
              onChange={(event) => setTitleDraft(event.target.value)}
              placeholder="Note title"
              className="input"
              style={{ padding: 6 }}
              disabled={!selectedNoteId || loading}
            />
            <textarea
              value={contentDraft}
              onChange={(event) => setContentDraft(event.target.value)}
              spellCheck={false}
              style={{ flex: 1, minHeight: 220 }}
              className="notepad-area"
              disabled={!selectedNoteId || loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
