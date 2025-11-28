"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

export type DesktopIcon = {
  id: string;
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
  position: { x: number; y: number };
  appType?: string;
  removable?: boolean;
  onOpen: () => void;
};

type DesktopProps = {
  icons: DesktopIcon[];
  wallpaper: string;
  onOpenRecycle: () => void;
  onMoveIcons: (updates: { id: string; pos: { x: number; y: number } }[]) => void;
  onDeleteIcons: (ids: string[]) => void;
  onContextNewFolder: () => void;
  folderOptions: { id: string; label: string }[];
  onMoveToFolder: (folderId: string, iconIds: string[]) => void;
};

const ICON_W = 80;
const ICON_H = 80;
const DRAG_THRESHOLD = 4;

export default function Desktop({
  icons,
  wallpaper,
  onOpenRecycle,
  onMoveIcons,
  onDeleteIcons,
  onContextNewFolder,
  folderOptions,
  onMoveToFolder,
}: DesktopProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    active: boolean;
  }>({ startX: 0, startY: 0, currentX: 0, currentY: 0, active: false });

  const dragState = useRef<{
    ids: string[];
    offsets: Record<string, { x: number; y: number }>;
    start: { x: number; y: number };
    dragging: boolean;
  }>({ ids: [], offsets: {}, start: { x: 0, y: 0 }, dragging: false });
  const [menuState, setMenuState] = useState<{ open: boolean; x: number; y: number }>({
    open: false,
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (selectionBox.active) {
        setSelectionBox((prev) => ({
          ...prev,
          currentX: event.clientX,
          currentY: event.clientY,
        }));
        return;
      }

      if (dragState.current.ids.length === 0) return;
      const { ids, offsets, start, dragging } = dragState.current;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!dragging && Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;

      dragState.current.dragging = true;
      const updates = ids.map((id) => ({
        id,
        pos: {
          x: event.clientX - offsets[id].x,
          y: event.clientY - offsets[id].y,
        },
      }));
      onMoveIcons(updates);
    };

    const handleUp = (event: MouseEvent) => {
      if (selectionBox.active) {
        const minX = Math.min(selectionBox.startX, selectionBox.currentX);
        const minY = Math.min(selectionBox.startY, selectionBox.currentY);
        const maxX = Math.max(selectionBox.startX, selectionBox.currentX);
        const maxY = Math.max(selectionBox.startY, selectionBox.currentY);
        const newlySelected = icons
          .filter((icon) => {
            const box = {
              x1: icon.position.x,
              y1: icon.position.y,
              x2: icon.position.x + ICON_W,
              y2: icon.position.y + ICON_H,
            };
            return !(box.x2 < minX || box.x1 > maxX || box.y2 < minY || box.y1 > maxY);
          })
          .map((icon) => icon.id);
        setSelectedIds(newlySelected);
        setSelectionBox({ startX: 0, startY: 0, currentX: 0, currentY: 0, active: false });
        return;
      }

      if (dragState.current.ids.length === 0) return;
      const { ids, dragging } = dragState.current;
      const dropX = event.clientX;
      const dropY = event.clientY;
      const zoneX = window.innerWidth - 180;
      const zoneY = window.innerHeight - 200;
      if (dragging && dropX >= zoneX && dropY >= zoneY) {
        onDeleteIcons(ids);
      }
      dragState.current = { ids: [], offsets: {}, start: { x: 0, y: 0 }, dragging: false };
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };

    if (dragState.current.ids.length > 0 || selectionBox.active) {
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };
  }, [selectionBox.active, selectionBox.currentX, selectionBox.currentY, selectionBox.startX, selectionBox.startY, onMoveIcons, onDeleteIcons, icons]);

  const beginDrag = (iconId: string, clientX: number, clientY: number, multiSelect: boolean) => {
    let nextSelected = selectedIds;
    if (!multiSelect && !selectedIds.includes(iconId)) {
      nextSelected = [iconId];
      setSelectedIds(nextSelected);
    } else if (multiSelect && !selectedIds.includes(iconId)) {
      nextSelected = [...selectedIds, iconId];
      setSelectedIds(nextSelected);
    }

    const ids = nextSelected.includes(iconId) ? nextSelected : [iconId];
    const offsets: Record<string, { x: number; y: number }> = {};
    ids.forEach((id) => {
      const found = icons.find((i) => i.id === id);
      if (found) {
        offsets[id] = {
          x: clientX - found.position.x,
          y: clientY - found.position.y,
        };
      }
    });
    dragState.current = {
      ids,
      offsets,
      start: { x: clientX, y: clientY },
      dragging: false,
    };
  };

  return (
    <div className="desktop" style={{ background: wallpaper }}>
      <div
        className="desktop-icons"
        onMouseDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.button !== 0) return;
          if (event.detail > 1) return;
          setSelectedIds([]);
          setSelectionBox({
            startX: event.clientX,
            startY: event.clientY,
            currentX: event.clientX,
            currentY: event.clientY,
            active: true,
          });
          setMenuState({ open: false, x: 0, y: 0 });
        }}
        onContextMenu={(event) => {
          event.preventDefault();
          setMenuState({ open: true, x: event.clientX, y: event.clientY });
        }}
      >
        {icons.map((icon) => (
          <div
            key={icon.id}
            style={{
              position: "absolute",
              left: icon.position.x,
              top: icon.position.y,
            }}
          >
            <Icon
              label={icon.label}
              color={icon.color}
              variant={icon.variant}
              onOpen={icon.onOpen}
              onMouseDown={(event) => {
                if (event.detail > 1) return; // avoid drag on double-click used for open
                if (event.button !== 0) return;
                event.stopPropagation();
                setMenuState({ open: false, x: 0, y: 0 });
                beginDrag(icon.id, event.clientX, event.clientY, event.ctrlKey || event.metaKey);
              }}
            />
            {selectedIds.includes(icon.id) ? (
              <div
                style={{
                  position: "absolute",
                  inset: -4,
                  border: "1px dashed #ffffff",
                  pointerEvents: "none",
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
      <div className="recycle-slot">
        <Icon
          label="Recycle Bin"
          color="#d7e5d7"
          variant="recycle"
          onOpen={onOpenRecycle}
          onMouseDown={(event) => {
            if (event.button !== 0) return;
            event.stopPropagation();
          }}
        />
      </div>
      {menuState.open ? (
        <div
          style={{
            position: "fixed",
            left: menuState.x,
            top: menuState.y,
            background: "#f0f0f0",
            border: "1px solid #808080",
            zIndex: 99999,
            minWidth: 170,
            boxShadow: "2px 2px 0 #00000040",
            padding: 4,
          }}
          onMouseLeave={() => setMenuState({ open: false, x: 0, y: 0 })}
        >
          <button
            className="menu-item"
            style={{ width: "100%" }}
            onClick={() => {
              setSelectedIds([]);
              setMenuState({ open: false, x: 0, y: 0 });
            }}
            type="button"
          >
            Refresh
          </button>
          <button
            className="menu-item"
            style={{ width: "100%" }}
            onClick={() => {
              onContextNewFolder();
              setMenuState({ open: false, x: 0, y: 0 });
            }}
            type="button"
          >
            New Folder
          </button>
          {folderOptions.length > 0 && selectedIds.length > 0 ? (
            <div style={{ padding: "6px 0 0 0" }}>
              <div style={{ fontSize: 12, padding: "2px 6px" }}>Move to Folder:</div>
              {folderOptions.map((folder) => (
                <button
                  key={folder.id}
                  className="menu-item"
                  style={{ width: "100%" }}
                  onClick={() => {
                    onMoveToFolder(folder.id, selectedIds);
                    setMenuState({ open: false, x: 0, y: 0 });
                  }}
                  type="button"
                >
                  {folder.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {selectionBox.active ? (
        <div
          style={{
            position: "fixed",
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY),
            border: "1px dashed #0000ff",
            background: "#99b4ff44",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        />
      ) : null}
    </div>
  );
}
