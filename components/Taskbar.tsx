"use client";

import { useEffect, useState } from "react";

type TaskWindow = {
  id: string;
  title: string;
  minimized: boolean;
};

type StartItem = {
  id: string;
  label: string;
  action: () => void;
};

type StartSection = {
  id: string;
  label: string;
  items: StartItem[];
};

type TaskbarProps = {
  windows: TaskWindow[];
  activeId: string | null;
  startOpen: boolean;
  onToggleStart: () => void;
  onSelectWindow: (id: string) => void;
  startSections: StartSection[];
};

export default function Taskbar({
  windows,
  activeId,
  startOpen,
  onToggleStart,
  onSelectWindow,
  startSections,
}: TaskbarProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="taskbar">
        <button
          className="start-button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleStart();
          }}
          onMouseDown={(event) => event.stopPropagation()}
          type="button"
        >
          Start 98
        </button>
        <div className="task-buttons">
          {windows.map((win) => (
            <button
              key={win.id}
              className={`task-item ${
                activeId === win.id && !win.minimized ? "active" : ""
              }`}
              onClick={() => onSelectWindow(win.id)}
              type="button"
            >
              {win.title}
            </button>
          ))}
        </div>
        <div className="task-clock" aria-label="clock">
          {time}
        </div>
      </div>
      {startOpen ? (
        <div
          className="start-menu"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="start-menu-left">
            <div className="start-menu-brand">RetroOS</div>
          </div>
          <div className="start-menu-right">
            <div className="start-menu-sections">
              {startSections.map((section) => (
                <div key={section.id} className="start-section">
                  <div className="start-section-title">{section.label}</div>
                  <div className="start-section-items">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        className="menu-item"
                        onClick={item.action}
                        type="button"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
