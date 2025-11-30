"use client";

import { FileItem } from "./FileManager";
import type { DesktopIcon } from "../Desktop";

type RecycleBinProps = {
  deleted: FileItem[];
  deletedIcons: DesktopIcon[];
  onRestore: (id: string) => void;
  onRestoreIcons: (ids: string[]) => void;
  onEmpty: () => void;
};

export default function RecycleBin({
  deleted,
  deletedIcons,
  onRestore,
  onRestoreIcons,
  onEmpty,
}: RecycleBinProps) {
  return (
    <div>
      <h4>Recycle Bin</h4>
      <h5>Desktop Items</h5>
      <div className="file-list">
        {deletedIcons.map((icon) => (
          <div key={icon.id} className="file-card">
            <strong>{icon.label}</strong>
            <div>{icon.variant || "icon"}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
              <button
                className="menu-button"
                onClick={() => onRestoreIcons([icon.id])}
                type="button"
              >
                Restore
              </button>
            </div>
          </div>
        ))}
        {deletedIcons.length === 0 ? (
          <div className="file-card">No desktop items here.</div>
        ) : null}
      </div>
      <h5>Files</h5>
      <div className="file-list">
        {deleted.map((file) => (
          <div key={file.id} className="file-card">
            <strong>{file.name}</strong>
            <div>{file.type}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
              <button
                className="menu-button"
                onClick={() => onRestore(file.id)}
                type="button"
              >
                Restore
              </button>
            </div>
          </div>
        ))}
        {deleted.length === 0 ? (
          <div className="file-card">Recycle Bin is empty.</div>
        ) : null}
      </div>
      <div style={{ marginTop: 10 }}>
        <button className="menu-button" onClick={onEmpty} type="button">
          Empty Recycle Bin
        </button>
        {deletedIcons.length > 0 ? (
          <button
            className="menu-button"
            onClick={() => onRestoreIcons(deletedIcons.map((i) => i.id))}
            type="button"
            style={{ marginLeft: 8 }}
          >
            Restore All Desktop Items
          </button>
        ) : null}
      </div>
    </div>
  );
}
