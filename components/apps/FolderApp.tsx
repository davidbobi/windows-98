"use client";

export type FolderItem = {
  id: string;
  label: string;
  variant?: string;
  onOpen: () => void;
};

type FolderAppProps = {
  name: string;
  items: FolderItem[];
};

export default function FolderApp({ name, items }: FolderAppProps) {
  return (
    <div>
      <h4>{name}</h4>
      <div className="file-list">
        {items.map((item) => (
          <div key={item.id} className="file-card">
            <strong>{item.label}</strong>
            <div>{item.variant || "Shortcut"}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
              <button className="menu-button" onClick={item.onOpen} type="button">
                Open
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 ? (
          <div className="file-card">Folder is empty. Move shortcuts here from desktop.</div>
        ) : null}
      </div>
    </div>
  );
}
