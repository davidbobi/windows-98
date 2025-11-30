"use client";

export type FileItem = {
  id: string;
  name: string;
  type: "Folder" | "Text" | "Image" | "Doc";
};

type FileManagerProps = {
  files: FileItem[];
  onDelete: (id: string) => void;
};

export default function FileManager({ files, onDelete }: FileManagerProps) {
  return (
    <div>
      <h4>My Files</h4>
      <div className="file-list">
        {files.map((file) => (
          <div key={file.id} className="file-card">
            <strong>{file.name}</strong>
            <div>{file.type}</div>
            <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
              <button
                className="menu-button"
                onClick={() => onDelete(file.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {files.length === 0 ? (
          <div className="file-card">No files here. Try restoring from Recycle.</div>
        ) : null}
      </div>
    </div>
  );
}
