"use client";

import type { DrawnLine } from "@/lab/events";
import { slopeOf } from "@/lab/events";
import { useRef, useState } from "react";

export function scaleIsCramped(points: { x: number; y: number }[], xMax: number, yMax: number): boolean {
  if (points.length < 2 || xMax <= 0 || yMax <= 0) return false;
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = Math.max(...points.map((point) => point.y));
  return maxX < xMax * 0.35 || maxY < yMax * 0.35;
}

export function GraphPaper({
  xLabel,
  yLabel,
  points,
  line,
  onLine,
  readOnly = false,
}: {
  xLabel: string;
  yLabel: string;
  points: { x: number; y: number }[];
  line: DrawnLine;
  onLine?: (line: DrawnLine) => void;
  readOnly?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [handle, setHandle] = useState<"a" | "b" | null>(null);
  const pad = 36;
  const width = 320;
  const height = 240;
  const innerW = width - pad - 12;
  const innerH = height - pad - 16;
  const X = (x: number) => pad + (x / line.xMax) * innerW;
  const Y = (y: number) => pad + innerH - (y / line.yMax) * innerH;
  const cramped = scaleIsCramped(points, line.xMax, line.yMax);

  function fromEvent(event: React.PointerEvent): { x: number; y: number } {
    const box = ref.current!.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * width;
    const py = ((event.clientY - box.top) / box.height) * height;
    const x = Math.min(line.xMax, Math.max(0, ((px - pad) / innerW) * line.xMax));
    const y = Math.min(line.yMax, Math.max(0, ((pad + innerH - py) / innerH) * line.yMax));
    return { x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
  }

  function move(event: React.PointerEvent) {
    if (!handle || readOnly || !onLine) return;
    const point = fromEvent(event);
    if (line.throughOrigin) onLine({ ...line, x1: 0, y1: 0, x2: point.x, y2: point.y });
    else if (handle === "a") onLine({ ...line, x1: point.x, y1: point.y });
    else onLine({ ...line, x2: point.x, y2: point.y });
  }

  const slope = slopeOf(line);
  return (
    <div>
      <svg
        ref={ref}
        className="graph-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${yLabel} against ${xLabel}`}
        onPointerMove={move}
        onPointerUp={() => setHandle(null)}
        onPointerLeave={() => setHandle(null)}
      >
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line x1={X((line.xMax * i) / 10)} x2={X((line.xMax * i) / 10)} y1={pad} y2={pad + innerH} stroke="#c5d4e8" strokeWidth="1" />
            <line y1={Y((line.yMax * i) / 10)} y2={Y((line.yMax * i) / 10)} x1={pad} x2={pad + innerW} stroke="#c5d4e8" strokeWidth="1" />
          </g>
        ))}
        <line x1={pad} x2={pad + innerW} y1={Y(0)} y2={Y(0)} stroke="#1c1712" strokeWidth="1.5" />
        <line y1={pad} y2={pad + innerH} x1={X(0)} x2={X(0)} stroke="#1c1712" strokeWidth="1.5" />
        <text x={pad + innerW - 4} y={height - 4} fontSize="12" textAnchor="end">{xLabel}</text>
        <text x={8} y={16} fontSize="12">{yLabel}</text>
        {points.map((point, index) => (
          <path
            key={`${point.x}-${index}`}
            d={`M ${X(point.x) - 5} ${Y(point.y)} L ${X(point.x) + 5} ${Y(point.y)} M ${X(point.x)} ${Y(point.y) - 5} L ${X(point.x)} ${Y(point.y) + 5}`}
            stroke="#1d3c72"
            strokeWidth="2"
          />
        ))}
        <line x1={X(line.x1)} y1={Y(line.y1)} x2={X(line.x2)} y2={Y(line.y2)} stroke="#b85a12" strokeWidth="2" />
        {!readOnly && (
          <>
            <circle cx={X(line.x1)} cy={Y(line.y1)} r="8" fill="#b85a12" onPointerDown={() => setHandle("a")} />
            <circle cx={X(line.x2)} cy={Y(line.y2)} r="8" fill="#b85a12" onPointerDown={() => setHandle("b")} />
          </>
        )}
      </svg>
      <p className="caption">
        Your line’s slope is {slope === null ? "—" : slope.toFixed(2)}.
        {cramped ? " The points sit in a corner. A board graph uses the page." : ""}
      </p>
      {!readOnly && onLine && (
        <div className="row">
          <label className="field">
            X max
            <input
              inputMode="decimal"
              value={line.xMax}
              onChange={(event) => onLine({ ...line, xMax: Math.max(0.1, Number(event.target.value) || line.xMax) })}
            />
          </label>
          <label className="field">
            Y max
            <input
              inputMode="decimal"
              value={line.yMax}
              onChange={(event) => onLine({ ...line, yMax: Math.max(0.1, Number(event.target.value) || line.yMax) })}
            />
          </label>
          <label className="row">
            <input
              type="checkbox"
              checked={line.throughOrigin}
              onChange={(event) => onLine({ ...line, throughOrigin: event.target.checked, x1: 0, y1: 0 })}
            />
            My line passes through the origin
          </label>
        </div>
      )}
    </div>
  );
}
