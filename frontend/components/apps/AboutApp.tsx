"use client";

type AboutAppProps = {
  onClose?: () => void;
};

export default function AboutApp({ onClose }: AboutAppProps) {
  return (
    <div className="about-content">
      <div className="about-header">
        <div className="about-icon" aria-hidden="true" />
        <div>
          <div>RetroOS 98</div>
          <div>OS web inspirat de experienta anilor &apos;98.</div>
        </div>
      </div>
      <p>
        Creat cu Next.js 14, TypeScript, HTML si CSS pentru un proiect de
        facultate. Interfata retro, fara nume sau elemente originale protejate.
      </p>
      <button className="menu-button" onClick={onClose} type="button">
        OK
      </button>
    </div>
  );
}
