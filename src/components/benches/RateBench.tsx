"use client";

import { GraphPaper } from "@/components/GraphPaper";
import type { Sight } from "@/content/copy";
import { disappearanceSeconds } from "@/kernels/kinetics";
import type { LabEvent, RunConditions } from "@/lab/events";
import { projectRate, ratePoints, turbidity } from "@/lab/rate";
import { useEffect, useState } from "react";

export function RateBench({
  events,
  ctx,
  emit,
  sight,
}: {
  events: LabEvent[];
  ctx: RunConditions;
  emit: (type: string, data?: Record<string, string | number | boolean>) => void;
  sight: Sight;
  guided: boolean;
  breakOn: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  const state = projectRate(events, ctx, now);
  const expected = disappearanceSeconds(state.volumeMl, state.temperatureC);
  const haze = state.running ? turbidity(state.clockT, expected) : 0;
  const line = state.line ?? { x1: 10, y1: 0, x2: 50, y2: 0.02, xMax: 60, yMax: 0.05, throughOrigin: false };

  useEffect(() => {
    if (!state.running) return;
    const timer = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(timer);
  }, [state.running]);

  return (
    <div>
      <svg className="bench-svg" viewBox="0 0 680 280" role="img" aria-label="Flask over a cross">
        <rect width="680" height="280" fill="#d7c7a8" />
        <text x="300" y="210" fontSize="64" fontFamily="serif">✕</text>
        <path d="M250 70 h120 l36 130 h-192 l36-130 z" fill="#f7f4ee" stroke="#1c1712" strokeWidth="2" opacity={0.92} />
        <path d="M262 110 h96 l24 80 h-144 l24-80 z" fill="#f6f1c8" opacity={haze} />
        {sight === "hidden" &&
          Array.from({ length: Math.round(8 + state.volumeMl / 8) }, (_, i) => (
            <circle key={i} cx={280 + (i % 6) * 16} cy={120 + (i % 4) * 14} r="4" fill="#1d3c72" />
          ))}
        {sight === "exam" && <text x="40" y="36" fontSize="16">School graph: 1/t against volume of thiosulphate. Higher T, shorter t.</text>}
      </svg>
      <p className="live" aria-live="polite">
        {state.running ? `Clock ${state.clockT.toFixed(1)} s. Watch the cross, not a target time.` : "Clock ready."} {state.volumeMl} mL of 0.1 M thiosulphate at {state.temperatureC}°C.
        {haze > 0.85 && state.running ? " The cross is hard to see." : ""}
      </p>
      <div className="row">
        {[10, 20, 30, 40, 50].map((volume) => (
          <button key={volume} className="btn-quiet" type="button" aria-pressed={state.volumeMl === volume} onClick={() => emit("volume", { n: volume })} disabled={state.running}>
            {volume} mL
          </button>
        ))}
      </div>
      <div className="row">
        <button className="btn-quiet" type="button" onClick={() => emit("temp", { n: ctx.ncertStandard ? 25 : ctx.temperatureC })}>This bench, {ctx.temperatureC}°C</button>
        <button className="btn-quiet" type="button" onClick={() => emit("temp", { n: 25 })}>NCERT 25°C</button>
        <button className="btn-quiet" type="button" onClick={() => emit("temp", { n: 40 })}>Water bath 40°C</button>
      </div>
      {!state.running ? (
        <button className="btn" type="button" onClick={() => emit("start")}>Add acid and start</button>
      ) : (
        <button
          className="btn"
          type="button"
          onClick={() => emit("stop", { n: Math.round(state.clockT * 10) / 10, v: state.volumeMl, t: state.temperatureC })}
        >
          The cross has gone
        </button>
      )}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Volume (mL)</th><th>Temperature (°C)</th><th>Your time (s)</th><th>1/t</th></tr></thead>
          <tbody>
            {state.rows.map((row) => (
              <tr key={row.id}>
                <td>{row.volumeMl}</td>
                <td>{row.temperatureC}</td>
                <td>{row.seconds.toFixed(1)} {row.judgement === "fair" ? "" : row.judgement === "early" ? "(cross still there)" : "(already gone)"}</td>
                <td>{(1 / row.seconds).toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ratePoints(state).length >= 2 && (
        <GraphPaper
          xLabel="Volume (mL)"
          yLabel="1/t (1/s)"
          points={ratePoints(state)}
          line={line}
          onLine={(next) => emit("graph", { x1: next.x1, y1: next.y1, x2: next.x2, y2: next.y2, xMax: next.xMax, yMax: next.yMax, origin: next.throughOrigin })}
        />
      )}
      {sight === "hidden" && !ctx.mock && (
        <p>Hidden eye, calmed if you prefer still dots: more thiosulphate means more collisions. Heat means faster particles, not a lazier reaction. Sulphur dioxide is produced — keep your face away. There is no smell button.</p>
      )}
    </div>
  );
}
