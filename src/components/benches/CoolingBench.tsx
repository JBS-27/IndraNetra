"use client";

import { coolingTemperature } from "@/kernels/schoolLabs";
import type { LabEvent, RunConditions } from "@/lab/events";
import { useEffect, useState } from "react";

export function CoolingBench({
  events,
  ctx,
  emit,
}: {
  events: LabEvent[];
  ctx: RunConditions;
  emit: (type: string, data?: Record<string, string | number | boolean>) => void;
  sight: string;
  guided: boolean;
  breakOn: boolean;
}) {
  const [on, setOn] = useState(false);
  const [t0, setT0] = useState(0);
  const [now, setNow] = useState(0);
  const [typed, setTyped] = useState("");
  const elapsed = on ? (now - t0) / 1000 : 0;
  const temp = coolingTemperature(elapsed, ctx.temperatureC);
  const rows = events.filter((event) => event.type === "temp");

  useEffect(() => {
    if (!on) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [on]);

  const height = Math.max(8, Math.min(120, ((temp - ctx.temperatureC) / (80 - ctx.temperatureC)) * 120));

  return (
    <div>
      <svg className="bench-svg" viewBox="0 0 680 260" role="img" aria-label="Calorimeter and thermometer">
        <rect width="680" height="260" fill="#c4a574" />
        <path d="M180 70 h160 l24 120 h-208 l24-120 z" fill="#f4efe4" stroke="#1c1712" strokeWidth="2" />
        <path d="M200 110 h120 l14 70 h-148 l14-70 z" fill="#e7f2fb" opacity="0.9" />
        <rect x="400" y="40" width="18" height="150" rx="8" fill="#f7f4ee" stroke="#1c1712" />
        <rect x="403" y={186 - height} width="12" height={height} rx="4" fill="#c0392b" />
        <text x="440" y="80" fontSize="18">{ctx.temperatureC}°C room</text>
      </svg>
      <p className="sr" aria-live="polite">Thermometer {temp.toFixed(1)} degrees. Elapsed {elapsed.toFixed(0)} seconds.</p>
      <p className="live">{on ? "The water is falling toward the room. Read the red thread." : "Start when you are ready to watch."} Room {ctx.temperatureC}°C{ctx.ncertStandard ? " (NCERT standard)" : ""}.</p>
      {!on ? (
        <button className="btn" type="button" onClick={() => { setT0(Date.now()); setNow(Date.now()); setOn(true); }}>Lift the lid</button>
      ) : (
        <div className="row">
          <label className="field">Temperature you read (°C)
            <input inputMode="decimal" value={typed} onChange={(event) => setTyped(event.target.value)} />
          </label>
          <button
            className="btn"
            type="button"
            disabled={typed === "" || Math.abs(Number(typed) - temp) > 0.6}
            onClick={() => {
              emit("temp", { n: Number(typed), t: Math.round(elapsed) });
              setTyped("");
            }}
          >
            Record this moment
          </button>
        </div>
      )}
      <table>
        <thead><tr><th>Time (s)</th><th>Your temperature (°C)</th><th>Excess over the room</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.data.t}</td>
              <td>{row.data.n}</td>
              <td>{(Number(row.data.n) - ctx.temperatureC).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="caption">If the drop were the same every minute, the excess column would fall in equal steps. It does not.</p>
    </div>
  );
}
