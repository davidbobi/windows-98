"use client";

type IconProps = {
  label: string;
  color?: string;
  variant?:
    | "files"
    | "notepad"
    | "paint"
    | "minesweeper"
    | "about"
    | "settings"
    | "recycle"
    | "computer"
    | "folder";
  onOpen: () => void;
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export default function Icon({
  label,
  color = "#f0f0f0",
  variant,
  onOpen,
  onMouseDown,
}: IconProps) {
  return (
    <button
      className="icon"
      onDoubleClick={(event) => {
        event.preventDefault();
        onOpen();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      onMouseDown={onMouseDown}
      type="button"
      aria-label={`Open ${label}`}
    >
      <span
        className={`icon-art ${variant ? `icon-${variant}` : ""}`}
        style={{
          background: `linear-gradient(135deg, ${color}, #a8a8a8)`,
        }}
      />
      <span className="icon-label">{label}</span>
    </button>
  );
}
