"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "retroos_notepad_text";

export default function Notepad() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Ready");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setText(saved);
      setStatus("Loaded previous note");
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, text);
    setStatus("Saved to RetroOS memory");
  };

  const handleLoad = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setText(saved);
      setStatus("Loaded from RetroOS memory");
    } else {
      setStatus("Nothing saved yet");
    }
  };

  const handleNew = () => {
    setText("");
    setStatus("New document");
  };

  return (
    <div>
      <div className="notepad-toolbar">
        <button className="menu-button" onClick={handleNew} type="button">
          New
        </button>
        <button className="menu-button" onClick={handleSave} type="button">
          Save
        </button>
        <button className="menu-button" onClick={handleLoad} type="button">
          Load
        </button>
      </div>
      <textarea
        className="notepad-area"
        value={text}
        onChange={(event) => setText(event.target.value)}
        spellCheck={false}
      />
      <div className="status-bar">{status}</div>
    </div>
  );
}
