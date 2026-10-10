"use client";

import { GraphPaper } from "@/components/GraphPaper";
import type { StationMode } from "@/content/manual";
import { gFromPendulum, pendulumPeriod } from "@/kernels/schoolLabs";
import type { LabEvent } from "@/lab/events";
import { useEffect, useState } from "react";

export function PendulumBench({
  events,
  emit,
  mode = "pendulum",
}: {
  events: LabEvent[];
  ctx: unknown;
  emit: (type: string, data?: Record<string, string | number | boolean>) => void;
  sight: string;
  guided: boolean;
  breakOn: boolean;
  mode?: StationMode;
}) {
  const spring = mode === "spring";
  const [lengthCm, setLengthCm] = useState(80);
  const [mass, setMass] = useState(200);
  const [running, setRunning] = useState(false);
  const [t0, setT0] = useState(0);
  const [now, setNow] = useState(0);
  const period = spring ? pendulumPeriod(0.4) * Math.sqrt(mass / 200) : pendulumPeriod(lengthCm / 100);
  const rows = events.filter((event) => event.type === "swing");

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [running]);

  const elapsed = running ? (now - t0) / 1000 : 0;
  const points = rows.map((row) => ({
    x: spring ? Number(row.data.m) : Number(row.data.l),
    y: (Number(row.data.n) / 20) ** 2,
  }));

  return (
    <div>
      <svg className="bench-svg pendulum-stage" viewBox="0 0 680 280" role="img" aria-label={spring ? "Mass on a spring" : "Simple pendulum"}>
        <rect width="680" height="280" fill="#c4a574" />
        <rect x="40" y="24" width="600" height="14" fill="#5c4632" />
        {spring ? (
          <>
            <path d={`M340 38 q 16 10 0 20 q -16 10 0 20 q 16 10 0 20 q -16 10 0 20`} fill="none" stroke="#1c1712" strokeWidth="3" />
            <circle className="bob" style={{ animationDuration: `${period.toFixed(2)}s` }} cx="340" cy={150 + mass / 20} r="22" fill="#1d3c72" />
          </>
        ) : (
          <g className="swing" style={{ animationDuration: `${period.toFixed(2)}s`, transformOrigin: "340px 38px" }}>
            <line x1="340" y1="38" x2="340" y2={38 + lengthCm * 1.6} stroke="#1c1712" strokeWidth="2" />
            <circle cx="340" cy={38 + lengthCm * 1.6} r="16" fill="#b85a12" />
          </g>
        )}
      </svg>
      <p className="live" aria-live="polite">
        {spring ? `Mass ${mass} g.` : `Length ${lengthCm} cm.`} {running ? `Counting ${elapsed.toFixed(1)} s. Stop at twenty swings.` : "Ready to count twenty oscillations."}
      </p>
      <div className="row">
        {spring ? (
          <label className="field">Mass (g)
            <input type="range" min={50} max={400} value={mass} onChange={(event) => setMass(Number(event.target.value))} disabled={running} />
          </label>
        ) : (
          <label className="field">Length (cm)
            <input type="range" min={30} max={120} value={lengthCm} onChange={(event) => setLengthCm(Number(event.target.value))} disabled={running} />
          </label>
        )}
        {!running ? (
          <button className="btn" type="button" onClick={() => { setT0(Date.now()); setNow(Date.now()); setRunning(true); }}>Start at a swing</button>
        ) : (
          <button
            className="btn"
            type="button"
            onClick={() => {
              setRunning(false);
              emit("swing", { n: Math.round(elapsed * 10) / 10, l: lengthCm, m: mass });
            }}
          >
            Twenty done
          </button>
        )}
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>{spring ? "m (g)" : "L (cm)"}</th><th>Time for 20 (s)</th><th>T (s)</th><th>{spring ? "" : "g (m/s²)"}</th></tr></thead>
          <tbody>
            {rows.map((row) => {
              const T = Number(row.data.n) / 20;
              const g = spring ? null : gFromPendulum(Number(row.data.l) / 100, T);
              return (
                <tr key={row.id}>
                  <td>{spring ? row.data.m : row.data.l}</td>
                  <td>{row.data.n}</td>
                  <td>{T.toFixed(2)}</td>
                  <td>{g === null ? "—" : g.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {points.length >= 2 && (
        <GraphPaper
          xLabel={spring ? "m (g)" : "L (cm)"}
          yLabel="T² (s²)"
          points={points}
          line={{ x1: points[0].x, y1: points[0].y, x2: points[points.length - 1].x, y2: points[points.length - 1].y, xMax: spring ? 500 : 140, yMax: 8, throughOrigin: false }}
          readOnly
        />
      )}
      <p className="caption">The bob keeps the true period so you can count. The second you stop on is yours. A heavier bob does not change g.</p>
    </div>
  );
}
