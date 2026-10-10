"use client";

import { CURVES, type CurveId } from "@/kernels/derivative";
import type { Sight } from "@/content/copy";
import type { LabEvent } from "@/lab/events";
import { chordAt, projectTangent, triangleAt } from "@/lab/tangent";
import { useState } from "react";

export function DerivativeBench({
  events,
  emit,
  sight,
}: {
  events: LabEvent[];
  ctx: unknown;
  emit: (type: string, data?: Record<string, string | number | boolean>) => void;
  sight: Sight;
  guided: boolean;
  breakOn: boolean;
}) {
  const state = projectTangent(events);
  const curve = CURVES[state.curve];
  const triangle = triangleAt(state);
  const chord = chordAt(state);
  const [written, setWritten] = useState("");
  const x0 = 36;
  const y0 = 200;
  const sx = 56;
  const sy = 28;
  const X = (x: number) => x0 + x * sx;
  const Y = (y: number) => y0 - y * sy;
  const samples = Array.from({ length: 41 }, (_, i) => -1 + i * 0.15).filter((x) => curve.f(x) < 12 && curve.f(x) > -1);
  const path = samples.map((x, i) => `${i === 0 ? "M" : "L"} ${X(x)} ${Y(curve.f(x))}`).join(" ");
  const px = state.x;
  const py = curve.f(px);
  const slope = triangle.slope;
  const x2 = px + state.run;
  const y2 = py + slope * state.run;

  return (
    <div>
      <svg className="bench-svg" viewBox="0 0 420 280" role="img" aria-label="Curve and tangent triangle">
        <rect width="420" height="280" fill="#f7f4ee" />
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`v${i}`} x1={X(i)} x2={X(i)} y1="20" y2="250" stroke="#d5e2f2" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`h${i}`} y1={Y(i)} y2={Y(i)} x1="20" x2="400" stroke="#d5e2f2" />
        ))}
        <path d={path} fill="none" stroke="#1d3c72" strokeWidth="2.5" />
        <line x1={X(px - 0.8)} y1={Y(py - slope * 0.8)} x2={X(px + 1.2)} y2={Y(py + slope * 1.2)} stroke="#b85a12" strokeWidth="2" />
        <path d={`M ${X(px)} ${Y(py)} L ${X(x2)} ${Y(py)} L ${X(x2)} ${Y(y2)}`} fill="none" stroke="#1c1712" strokeWidth="2" />
        {state.showChord && (
          <line x1={X(px)} y1={Y(py)} x2={X(px + state.run)} y2={Y(curve.f(px + state.run))} stroke="#1d6a45" strokeWidth="2" strokeDasharray="4 3" />
        )}
        <circle
          cx={X(px)}
          cy={Y(py)}
          r="8"
          fill="#b85a12"
          onPointerDown={(event) => {
            const move = (ev: PointerEvent) => {
              const box = (event.target as SVGElement).ownerSVGElement!.getBoundingClientRect();
              const pxX = ((ev.clientX - box.left) / box.width) * 420;
              const next = Math.round(Math.min(4, Math.max(0, (pxX - x0) / sx)) * 10) / 10;
              emit("x", { n: next });
            };
            const up = () => {
              window.removeEventListener("pointermove", move);
              window.removeEventListener("pointerup", up);
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
          }}
        />
        {sight === "exam" && <text x="16" y="24" fontSize="16">{curve.label}, slope {curve.df(px).toFixed(2)} at this x. The formula names what the triangle already showed.</text>}
      </svg>
      <p className="live">Point x = {state.x.toFixed(1)}, y = {py.toFixed(2)}. Run {state.run}. Count the rise on the grid.</p>
      <div className="row">
        {(["square", "cube", "line"] as CurveId[]).map((id) => (
          <button key={id} className="btn-quiet" type="button" aria-pressed={state.curve === id} onClick={() => emit("curve", { text: id })}>{CURVES[id].label}</button>
        ))}
        <label className="field">Run
          <input type="range" min={0.25} max={1} step={0.25} value={state.run} onChange={(event) => emit("run", { n: Number(event.target.value) })} />
        </label>
        <button className="btn-quiet" type="button" onClick={() => emit("chord")}>{state.showChord ? "Hide the chord" : "Show the chord"}</button>
      </div>
      {state.showChord && sight !== "exam" && <p>The chord slope is {chord.toFixed(2)}. The tangent triangle is not the same thing until the run shrinks.</p>}
      {sight === "hidden" && <p>Hidden eye: several chords lean toward the tangent as the run gets smaller. No formula yet.</p>}
      <label className="field">Slope you counted (rise/run)
        <input inputMode="decimal" value={written} onChange={(event) => setWritten(event.target.value)} />
      </label>
      <button className="btn" type="button" disabled={written === ""} onClick={() => emit("slope", { n: Number(written) })}>Write this slope</button>
      {state.writtenSlope !== null && Math.abs(state.writtenSlope - triangle.slope) > 0.2 && (
        <p className="notice">The slope is {triangle.slope.toFixed(2)}, your result says {state.writtenSlope}. Look at the triangle you drew.</p>
      )}
    </div>
  );
}
