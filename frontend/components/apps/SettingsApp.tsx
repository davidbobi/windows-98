"use client";

type SettingsAppProps = {
  wallpaperId: string;
  wallpaperOptions: { id: string; label: string; value: string }[];
  onChangeWallpaper: (id: string) => void;
};

export default function SettingsApp({
  wallpaperId,
  wallpaperOptions,
  onChangeWallpaper,
}: SettingsAppProps) {
  return (
    <div>
      <h4>Display Settings</h4>
      <p>Select wallpaper:</p>
      <div className="wallpaper-picker">
        {wallpaperOptions.map((wp) => (
          <button
            key={wp.id}
            className={`wallpaper-option ${
              wallpaperId === wp.id ? "selected" : ""
            }`}
            onClick={() => onChangeWallpaper(wp.id)}
            type="button"
            aria-label={`Select ${wp.label}`}
            style={{ background: wp.value }}
          />
        ))}
      </div>
      <p style={{ marginTop: 12, fontSize: 13 }}>
        Tip: Use Start &gt; Settings to change wallpapers anytime.
      </p>
      <div style={{ marginTop: 10, fontSize: 13 }}>
        Drag desktop icons to the bottom-right recycle zone to remove them; drag anywhere to rearrange.
      </div>
    </div>
  );
}
