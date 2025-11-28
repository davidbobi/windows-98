"use client";

import { useEffect, useRef, useState } from "react";

const COLORS = [
  "#000000",
  "#202020",
  "#7f7f7f",
  "#c0c0c0",
  "#ffffff",
  "#800000",
  "#ff0000",
  "#ff7f00",
  "#ffbf00",
  "#ffff00",
  "#808000",
  "#00ff00",
  "#008000",
  "#008080",
  "#00ffff",
  "#0000ff",
  "#000080",
  "#800080",
  "#ff00ff",
  "#8b4513",
  "#a0522d",
  "#deb887",
  "#ffe4c4",
  "#ffd700",
  "#87ceeb",
  "#4682b4",
  "#2e8b57",
  "#556b2f",
  "#ff69b4",
  "#cd5c5c",
  "#ff4500",
  "#c71585",
  "#00ced1",
  "#1e90ff",
  "#4169e1",
];

const BRUSHES = [2, 6];

export default function PaintApp() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#000000");
  const [brush, setBrush] = useState(BRUSHES[0]);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 400, height: 300 });

  useEffect(() => {
    const resize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const width = Math.max(400, Math.floor(rect.width) - 20);
      const height = Math.max(300, Math.floor(rect.height) - 80);
      setSize({ width, height });
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = width;
        canvas.height = height;
        ctx.putImageData(imageData, 0, 0);
      } else if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    };
    resize();
    const observer = new ResizeObserver(resize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const getPosition = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>,
  ) => {
    drawing.current = true;
    lastPoint.current = getPosition(event);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const nextPoint = getPosition(event);
    const previous = lastPoint.current || nextPoint;
    ctx.strokeStyle = color;
    ctx.lineWidth = brush;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(nextPoint.x, nextPoint.y);
    ctx.stroke();

    lastPoint.current = nextPoint;
  };

  const stopDrawing = () => {
    drawing.current = false;
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="app-fill" ref={containerRef}>
      <div className="paint-toolbar">
        {COLORS.map((swatch) => (
          <button
            key={swatch}
            className={`color-swatch ${color === swatch ? "selected" : ""}`}
            style={{ background: swatch }}
            onClick={() => setColor(swatch)}
            type="button"
            aria-label={`Select color ${swatch}`}
          />
        ))}
        {BRUSHES.map((sizeValue) => (
          <button
            key={sizeValue}
            className={`menu-button brush-button ${brush === sizeValue ? "active" : ""}`}
            onClick={() => setBrush(sizeValue)}
            type="button"
          >
            Brush {sizeValue}px
          </button>
        ))}
        <button className="menu-button" onClick={clearCanvas} type="button">
          Clear
        </button>
      </div>
      <div style={{ flex: 1, display: "flex" }}>
        <canvas
          ref={canvasRef}
          className="paint-canvas"
          width={size.width}
          height={size.height}
          style={{ width: "100%", height: "100%" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
}
