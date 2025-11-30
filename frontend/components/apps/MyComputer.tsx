"use client";

export default function MyComputer() {
  const drives = [
    { name: "Local Disk (C:)", type: "Fixed", free: "2.3 GB free of 8 GB" },
    { name: "Retro Data (D:)", type: "Fixed", free: "1.1 GB free of 4 GB" },
  ];

  return (
    <div>
      <h4>My Computer</h4>
      <div className="file-list">
        {drives.map((drive) => (
          <div key={drive.name} className="file-card">
            <strong>{drive.name}</strong>
            <div>{drive.type} drive</div>
            <div>{drive.free}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 13 }}>
        RetroOS 98 — simulated environment for demo purposes.
      </div>
    </div>
  );
}
