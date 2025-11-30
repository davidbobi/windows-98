"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import Desktop, { DesktopIcon as DesktopIconType } from "@/components/Desktop";
import Taskbar from "@/components/Taskbar";
import Window from "@/components/Window";
import AboutApp from "@/components/apps/AboutApp";
import FileManager, { FileItem } from "@/components/apps/FileManager";
import MinesweeperApp from "@/components/apps/Minesweeper";
import NotesApp from "@/components/apps/NotesApp";
import PaintApp from "@/components/apps/PaintApp";
import RecycleBin from "@/components/apps/RecycleBin";
import SettingsApp from "@/components/apps/SettingsApp";
import MyComputer from "@/components/apps/MyComputer";
import FolderApp, { FolderItem } from "@/components/apps/FolderApp";
import supabase from "@/lib/supabaseClient";

type RecycleIcon = DesktopIconType & { contents?: FolderItem[] };

type AppType =
  | "files"
  | "notepad"
  | "paint"
  | "minesweeper"
  | "about"
  | "recycle"
  | "settings"
  | "computer"
  | "folder";

type Position = { x: number; y: number };
type Size = { width: number; height: number };

export type WindowState = {
  id: string;
  title: string;
  appType: AppType;
  position: Position;
  size: Size;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  prevPosition?: Position;
  prevSize?: Size;
  folderId?: string;
};

const titles: Record<AppType, string> = {
  files: "My Files",
  notepad: "Notes",
  paint: "Retro Paint",
  minesweeper: "Minesweeper",
  about: "About RetroOS",
  recycle: "Recycle Bin",
  settings: "Settings",
  computer: "My Computer",
  folder: "Folder",
};

const defaults: Record<AppType, { position: Position; size: Size }> = {
  files: { position: { x: 70, y: 80 }, size: { width: 420, height: 320 } },
  notepad: { position: { x: 140, y: 90 }, size: { width: 520, height: 520 } },
  paint: { position: { x: 200, y: 120 }, size: { width: 520, height: 420 } },
  minesweeper: { position: { x: 260, y: 150 }, size: { width: 380, height: 420 } },
  about: { position: { x: 180, y: 110 }, size: { width: 360, height: 220 } },
  recycle: { position: { x: 320, y: 130 }, size: { width: 420, height: 320 } },
  settings: { position: { x: 220, y: 100 }, size: { width: 380, height: 260 } },
  computer: { position: { x: 240, y: 80 }, size: { width: 480, height: 320 } },
  folder: { position: { x: 240, y: 120 }, size: { width: 420, height: 320 } },
};

const wallpapers = [
  {
    id: "teal-cloud",
    label: "Teal classic",
    value:
      "radial-gradient(220px at 15% 20%, #1bbaba55 0, transparent 60%), radial-gradient(200px at 75% 25%, #14a7a755 0, transparent 60%), radial-gradient(240px at 40% 70%, #11a0a055 0, transparent 60%), linear-gradient(135deg, #007878 0%, #009898 100%)",
  },
  {
    id: "blue",
    label: "Blue steel",
    value: "linear-gradient(135deg, #1c4ea1 0%, #0f3b8c 100%)",
  },
  {
    id: "gray",
    label: "Gray",
    value: "linear-gradient(135deg, #7f7f7f 0%, #9b9b9b 100%)",
  },
];

export default function HomePage() {
  // Supabase auth: gate the desktop until a valid session exists
  const [session, setSession] = useState<Session | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [zIndexCounter, setZIndexCounter] = useState(1);
  const [startOpen, setStartOpen] = useState(false);
  const [wallpaperId, setWallpaperId] = useState<string>(wallpapers[0].id);
  const [files, setFiles] = useState<FileItem[]>([
    { id: "f1", name: "Projects", type: "Folder" },
    { id: "f2", name: "Retro Notes.txt", type: "Text" },
    { id: "f3", name: "Screenshots", type: "Image" },
    { id: "f4", name: "Minesweeper Scores.dat", type: "Doc" },
  ]);
  const [deleted, setDeleted] = useState<FileItem[]>([]);
  const [deletedIcons, setDeletedIcons] = useState<RecycleIcon[]>([]);
  const [folderContents, setFolderContents] = useState<Record<string, FolderItem[]>>({});
  const [folderCounter, setFolderCounter] = useState(1);
  const [desktopIcons, setDesktopIcons] = useState<DesktopIconType[]>([
    {
      id: "files",
      label: "My Files",
      color: "#8cc6ff",
      variant: "files",
      position: { x: 12, y: 12 },
      onOpen: () => openWindow("files"),
    },
    {
      id: "computer",
      label: "My Computer",
      color: "#cde6ff",
      variant: "computer",
      position: { x: 12, y: 110 },
      onOpen: () => openWindow("computer"),
    },
    {
      id: "notepad",
      label: "Notes",
      color: "#f2d28c",
      variant: "notepad",
      position: { x: 12, y: 208 },
      onOpen: () => openWindow("notepad"),
    },
    {
      id: "paint",
      label: "Paint",
      color: "#c9e5ff",
      variant: "paint",
      position: { x: 12, y: 306 },
      onOpen: () => openWindow("paint"),
    },
    {
      id: "minesweeper",
      label: "Minesweeper",
      color: "#c6f6c6",
      variant: "minesweeper",
      position: { x: 12, y: 404 },
      onOpen: () => openWindow("minesweeper"),
    },
    {
      id: "settings",
      label: "Settings",
      color: "#e0e0e0",
      variant: "settings",
      position: { x: 12, y: 502 },
      onOpen: () => openWindow("settings"),
    },
    {
      id: "about",
      label: "About RetroOS",
      color: "#d0c0ff",
      variant: "about",
      position: { x: 12, y: 600 },
      onOpen: () => openWindow("about"),
    },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("retroos_wallpaper");
    if (saved && wallpapers.some((item) => item.id === saved)) {
      setWallpaperId(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("retroos_wallpaper", wallpaperId);
  }, [wallpaperId]);

  useEffect(() => {
    // Supabase session bootstrap + listener
    const run = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setAuthError(error.message);
      }
      setSession(data?.session ?? null);
      setSessionChecked(true);
    };
    run();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, data) => {
      setSession(data.session ?? null);
      setSessionChecked(true);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Clear desktop state on sign out so we do not keep stale windows
    if (!session) {
      setWindows([]);
      setActiveId(null);
      setStartOpen(false);
    }
  }, [session]);

  const wallpaperValue = useMemo(
    () => wallpapers.find((item) => item.id === wallpaperId)?.value || wallpapers[0].value,
    [wallpaperId],
  );

  const bumpZ = () => {
    let updated = 0;
    setZIndexCounter((prev) => {
      updated = prev + 1;
      return updated;
    });
    return updated || zIndexCounter + 1;
  };

  const openWindow = (appType: AppType, extra?: Partial<WindowState>) => {
    if (!session) {
      setAuthError("Te rog autentifica-te pentru a deschide aplicatiile.");
      return;
    }
    const newId = `${appType}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const nextZ = bumpZ();
    setWindows((prev) => [
      ...prev,
      {
        id: newId,
        appType,
        title: titles[appType],
        position: {
          x: defaults[appType].position.x + (prev.length * 14) % 60,
          y: defaults[appType].position.y + (prev.length * 10) % 50,
        },
        size: defaults[appType].size,
        minimized: false,
        maximized: false,
        zIndex: nextZ,
        ...extra,
      },
    ]);
    setActiveId(newId);
    setStartOpen(false);
  };

  const openFolder = (folderId: string) => {
    openWindow("folder", { folderId, title: desktopIcons.find((i) => i.id === folderId)?.label || "Folder" });
  };

  const focusWindow = (id: string) => {
    const nextZ = bumpZ();
    setWindows((prev) =>
      prev.map((win) =>
        win.id === id ? { ...win, minimized: false, zIndex: nextZ } : win,
      ),
    );
    setActiveId(id);
    setStartOpen(false);
  };

  const moveWindow = (id: string, position: Position) => {
    const safePosition: Position = {
      x: Math.max(0, position.x),
      y: Math.max(0, position.y),
    };
    setWindows((prev) =>
      prev.map((win) => (win.id === id ? { ...win, position: safePosition } : win)),
    );
  };

  const minimizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((win) => (win.id === id ? { ...win, minimized: true } : win)),
    );
    setActiveId((current) => (current === id ? null : current));
  };

  const toggleMaximizeWindow = (id: string) => {
    const nextZ = bumpZ();
    setWindows((prev) =>
      prev.map((win) => {
        if (win.id !== id) return win;
        if (win.maximized) {
          return {
            ...win,
            maximized: false,
            position: win.prevPosition || win.position,
            size: win.prevSize || win.size,
            prevPosition: undefined,
            prevSize: undefined,
            zIndex: nextZ,
          };
        }
        return {
          ...win,
          maximized: true,
          prevPosition: win.position,
          prevSize: win.size,
          zIndex: nextZ,
        };
      }),
    );
    setActiveId(id);
  };

  const closeWindow = (id: string) => {
    setWindows((prev) => {
      const remaining = prev.filter((win) => win.id !== id);
      if (activeId === id) {
        const top = remaining.reduce<WindowState | null>((acc, win) => {
          if (!acc || win.zIndex > acc.zIndex) return win;
          return acc;
        }, null);
        setActiveId(top ? top.id : null);
      }
      return remaining;
    });
  };

  const deleteFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (!target) return prev;
      setDeleted((del) => [target, ...del]);
      return prev.filter((f) => f.id !== id);
    });
  };

  const restoreFile = (id: string) => {
    setDeleted((prev) => {
      const target = prev.find((f) => f.id === id);
      if (!target) return prev;
      setFiles((filesPrev) => [target, ...filesPrev]);
      return prev.filter((f) => f.id !== id);
    });
  };

  const emptyRecycle = () => setDeleted([]);

  const handleTaskClick = (id: string) => {
    const target = windows.find((win) => win.id === id);
    if (!target) return;
    if (target.minimized) {
      focusWindow(id);
      return;
    }
    if (activeId === id) {
      minimizeWindow(id);
    } else {
      focusWindow(id);
    }
  };

  const startSections = [
    {
      id: "programs",
      label: "Programs",
      items: [
        { id: "computer", label: "My Computer", action: () => openWindow("computer") },
        { id: "notepad", label: "Notes", action: () => openWindow("notepad") },
        { id: "paint", label: "Paint", action: () => openWindow("paint") },
        { id: "minesweeper", label: "Minesweeper", action: () => openWindow("minesweeper") },
      ],
    },
    {
      id: "system",
      label: "System",
      items: [
        { id: "files", label: "My Files", action: () => openWindow("files") },
        { id: "recycle", label: "Recycle Bin", action: () => openWindow("recycle") },
        { id: "settings", label: "Settings", action: () => openWindow("settings") },
        {
          id: "new-folder",
          label: "New Folder",
          action: () => {
            const newId = `folder-${Date.now()}`;
            setDesktopIcons((prev) => [
              ...prev,
              {
                id: newId,
                label: `New Folder ${folderCounter}`,
                color: "#f2d28c",
                variant: "folder",
                position: { x: 140, y: 140 },
                onOpen: () => openFolder(newId),
              },
            ]);
            setFolderContents((prev) => ({ ...prev, [newId]: [] }));
            setFolderCounter((c) => c + 1);
            openFolder(newId);
            setStartOpen(false);
          },
        },
      ],
    },
    {
      id: "about",
      label: "Help",
      items: [
        { id: "about", label: "About RetroOS", action: () => openWindow("about") },
        {
          id: "wallpaper",
          label: "Change wallpaper",
          action: () => {
            setWallpaperId((current) => {
              const index = wallpapers.findIndex((item) => item.id === current);
              const next = wallpapers[(index + 1) % wallpapers.length];
              return next.id;
            });
            setStartOpen(false);
          },
        },
      ],
    },
  ];

  const renderApp = (win: WindowState) => {
    switch (win.appType) {
      case "files":
        return <FileManager files={files} onDelete={deleteFile} />;
      case "notepad":
        return <NotesApp accessToken={session?.access_token ?? ""} userId={session?.user?.id ?? ""} />;
      case "paint":
        return <PaintApp />;
      case "minesweeper":
        return <MinesweeperApp />;
      case "recycle":
        return (
          <RecycleBin
            deleted={deleted}
            deletedIcons={deletedIcons}
            onRestore={restoreFile}
            onRestoreIcons={(ids) => {
              setDeletedIcons((prev) => {
                const toRestore = prev.filter((icon) => ids.includes(icon.id));
                if (toRestore.length) {
                  setDesktopIcons((desk) => {
                    const restored = toRestore.map((icon, idx) => ({
                      ...icon,
                      position: {
                        x: 20 + idx * 14,
                        y: 20 + idx * 14,
                      },
                    }));
                    return [...desk, ...restored];
                  });
                  toRestore.forEach((icon) => {
                    if (icon.variant === "folder" && icon.contents) {
                      setFolderContents((prevContents) => ({
                        ...prevContents,
                        [icon.id]: icon.contents || [],
                      }));
                    }
                  });
                }
                return prev.filter((icon) => !ids.includes(icon.id));
              });
            }}
            onEmpty={() => {
              emptyRecycle();
              setDeletedIcons([]);
            }}
          />
        );
      case "settings":
        return (
          <SettingsApp
            wallpaperId={wallpaperId}
            wallpaperOptions={wallpapers.map(({ id, label, value }) => ({
              id,
              label,
              value,
            }))}
            onChangeWallpaper={(id) => setWallpaperId(id)}
          />
        );
      case "computer":
        return <MyComputer />;
      case "folder": {
        const folderId = win.folderId;
        const name = desktopIcons.find((i) => i.id === folderId)?.label || "Folder";
        const items = folderId ? folderContents[folderId] || [] : [];
        return <FolderApp name={name} items={items} />;
      }
      case "about":
        return <AboutApp onClose={() => closeWindow(win.id)} />;
      default:
        return null;
    }
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) {
      setAuthError(error.message);
    } else {
      setSession(data.session ?? null);
    }
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setAuthLoading(false);
  };

  if (!sessionChecked) {
    return (
      <main style={{ width: "100vw", height: "100vh", display: "grid", placeItems: "center", background: wallpapers[0].value }}>
        <div className="window" style={{ width: 320 }}>
          <div className="title-bar active">
            <span className="title-text">RetroOS 98</span>
          </div>
          <div className="window-body" style={{ padding: 12 }}>Checking session...</div>
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          background: wallpapers.find((w) => w.id === wallpaperId)?.value || wallpapers[0].value,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div className="window" style={{ width: 420, maxWidth: "100%" }}>
          <div className="title-bar active">
            <span className="title-text">Log in to RetroOS 98</span>
          </div>
          <div className="window-body" style={{ padding: 12 }}>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span>Email</span>
                <input
                  type="email"
                  required
                  className="input"
                  value={credentials.email}
                  onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
                />
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span>Password</span>
                <input
                  type="password"
                  required
                  className="input"
                  value={credentials.password}
                  onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                />
              </label>
              <button className="menu-button" type="submit" disabled={authLoading}>
                {authLoading ? "Logging in..." : "Login"}
              </button>
              {authError ? <div style={{ color: "#8b0000", fontSize: 12 }}>{authError}</div> : null}
              <div style={{ fontSize: 12, color: "#333" }}>
                Introdu email si parola setate in Supabase Authentication. Vei intra direct pe desktop dupa autentificare.
              </div>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{ width: "100vw", height: "100vh", position: "relative" }}
      onMouseDown={() => setStartOpen(false)}
    >
      <Desktop
        icons={desktopIcons}
        wallpaper={wallpaperValue}
        onOpenRecycle={() => openWindow("recycle")}
        onMoveIcons={(updates) => {
          setDesktopIcons((prev) =>
            prev.map((icon) => {
              const found = updates.find((u) => u.id === icon.id);
              if (!found) return icon;
              return {
                ...icon,
                position: {
                  x: Math.max(4, Math.min(found.pos.x, window.innerWidth - 90)),
                  y: Math.max(4, Math.min(found.pos.y, window.innerHeight - 140)),
                },
              };
            }),
          );
        }}
        onDeleteIcons={(ids) => {
          const filtered = ids.filter((id) => id !== "recycle");
          if (filtered.length === 0) return;
          setDeletedIcons((prevDel) => [
            ...prevDel,
            ...desktopIcons
              .filter((icon) => filtered.includes(icon.id))
              .map((icon) => ({
                ...icon,
                contents: icon.variant === "folder" ? folderContents[icon.id] || [] : undefined,
              })),
          ]);
          setDesktopIcons((prev) => prev.filter((icon) => !filtered.includes(icon.id)));
          setFolderContents((prev) => {
            const next = { ...prev };
            filtered.forEach((id) => {
              if (next[id]) {
                delete next[id];
              }
            });
            return next;
          });
        }}
        onContextNewFolder={() => {
          const newId = `folder-${Date.now()}`;
          const newLabel = `New Folder ${folderCounter}`;
          setFolderCounter((c) => c + 1);
          setDesktopIcons((prev) => [
            ...prev,
            {
              id: newId,
              label: newLabel,
              color: "#f2d28c",
              variant: "folder",
              position: { x: 140, y: 140 },
              onOpen: () => openFolder(newId),
            },
          ]);
          setFolderContents((prev) => ({ ...prev, [newId]: [] }));
        }}
        folderOptions={desktopIcons.filter((i) => i.variant === "folder").map((f) => ({
          id: f.id,
          label: f.label,
        }))}
        onMoveToFolder={(folderId, iconIds) => {
          const targets = desktopIcons.filter(
            (icon) => iconIds.includes(icon.id) && icon.id !== folderId && icon.variant !== "recycle",
          );
          if (!targets.length) return;
          setDesktopIcons((prev) => prev.filter((icon) => !iconIds.includes(icon.id)));
          setFolderContents((prev) => {
            const existing = prev[folderId] || [];
            return {
              ...prev,
              [folderId]: [
                ...existing,
                ...targets.map((icon) => ({
                  id: icon.id,
                  label: icon.label,
                  variant: icon.variant,
                  onOpen: icon.onOpen,
                })),
              ],
            };
          });
        }}
      />
      {windows.map((win) => (
        <Window
          key={win.id}
          id={win.id}
          title={win.title}
          position={win.position}
          size={win.size}
          minimized={win.minimized}
          maximized={win.maximized}
          zIndex={win.zIndex}
          isActive={activeId === win.id}
          onFocus={() => focusWindow(win.id)}
          onClose={() => closeWindow(win.id)}
          onMinimize={() => minimizeWindow(win.id)}
          onToggleMaximize={() => toggleMaximizeWindow(win.id)}
          onDrag={(position) => moveWindow(win.id, position)}
        >
          {renderApp(win)}
        </Window>
      ))}
      <Taskbar
        windows={windows}
        activeId={activeId}
        startOpen={startOpen}
        onToggleStart={() => setStartOpen((open) => !open)}
        onSelectWindow={handleTaskClick}
        startSections={startSections}
        userLabel={session.user.email || session.user.user_metadata?.username || "User"}
        onSignOut={handleSignOut}
      />
    </main>
  );
}
