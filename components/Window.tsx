"use client";

import { useRef } from "react";

type Position = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type WindowProps = {
  id: string;
  title: string;
  position: Position;
  size: Size;
  zIndex: number;
  minimized: boolean;
  maximized: boolean;
  isActive: boolean;
  children: React.ReactNode;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onDrag: (position: Position) => void;
};

export default function Window({
  id,
  title,
  position,
  size,
  zIndex,
  minimized,
  maximized,
  isActive,
  children,
  onFocus,
  onClose,
  onMinimize,
  onToggleMaximize,
  onDrag,
}: WindowProps) {
  const dragInfo = useRef<{
    offset: Position;
    start: Position;
    dragging: boolean;
  }>({ offset: { x: 0, y: 0 }, start: { x: 0, y: 0 }, dragging: false });
  const DRAG_THRESHOLD = 4;

  if (minimized) {
    return null;
  }

  return (
    <div
      className={`window ${maximized ? "maximized" : ""}`}
      style={{
        top: position.y,
        left: position.x,
        width: maximized ? undefined : size.width,
        height: maximized ? undefined : size.height,
        zIndex,
      }}
      onMouseDown={onFocus}
      role="presentation"
      id={id}
    >
      <div
        className={`title-bar ${isActive ? "active" : "inactive"}`}
        onMouseDown={(event) => {
          if (event.button !== 0) return;
          onFocus();
          if (maximized) return;
          // ignore accidental drag on double-click detail phase
          if (event.detail > 1) return;
          dragInfo.current = {
            offset: {
              x: event.clientX - position.x,
              y: event.clientY - position.y,
            },
            start: { x: event.clientX, y: event.clientY },
            dragging: false,
          };

          const handleMouseMove = (moveEvent: MouseEvent) => {
            if (maximized) return;
            const { dragging, offset, start } = dragInfo.current;
            if (!dragging) {
              const dx = moveEvent.clientX - start.x;
              const dy = moveEvent.clientY - start.y;
              if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
              dragInfo.current.dragging = true;
            }
            moveEvent.preventDefault();
            onDrag({
              x: moveEvent.clientX - dragInfo.current.offset.x,
              y: moveEvent.clientY - dragInfo.current.offset.y,
            });
          };

          const handleMouseUp = () => {
            dragInfo.current.dragging = false;
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
          };

          document.addEventListener("mousemove", handleMouseMove);
          document.addEventListener("mouseup", handleMouseUp);
        }}
        onDoubleClick={(event) => {
          event.preventDefault();
          dragInfo.current.dragging = false;
          onToggleMaximize();
        }}
      >
        <span className="title-text">{title}</span>
        <div className="window-controls">
          <button
            className="control-button"
            aria-label={`Minimize ${title}`}
            onClick={(event) => {
              event.stopPropagation();
              onMinimize();
            }}
            type="button"
          >
            _
          </button>
          <button
            className="control-button"
            aria-label={`Maximize ${title}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggleMaximize();
            }}
            type="button"
          >
            {maximized ? "[ ]" : "[]"}
          </button>
          <button
            className="control-button"
            aria-label={`Close ${title}`}
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            type="button"
          >
            X
          </button>
        </div>
      </div>
      <div className="window-body">{children}</div>
    </div>
  );
}
