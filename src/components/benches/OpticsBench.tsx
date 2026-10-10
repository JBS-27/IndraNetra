"use client";

import { VernierStrip } from "@/components/Instruments";
import { pick, type Sight } from "@/content/copy";
import { observedLength, vernierZero } from "@/kernels/vernier";
import type { LabEvent, RunConditions } from "@/lab/events";
import { focalOfRow, meanFocal, projectLens } from "@/lab/lens";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const OpticsCinema = dynamic(() => import("@/components/cinema/OpticsCinema").then((mod) => mod.OpticsCinema), { ssr: false });

export function OpticsBench({
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
  const state = projectLens(events, ctx);
  const [accept, setAccept] = useState(false);
  const [uText, setUText] = useState("");
  const [vText, setVText] = useState("");
  const [cinema, setCinema] = useState(false);
  const [offer, setOffer] = useState(false);
  const zero = vernierZero(ctx.kit);
  const imageObserved = observedLength(state.pinCm, zero.zeroErrorCm);
  const shift = state.eyeShift ? 14 : 0;
  const relative = state.cleared ? 0 : 10;

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const blocked = nav.connection?.saveData || (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4);
    setOffer(!blocked);
  }, []);

  const canRecord = (state.cleared || accept) && uText !== "" && vText !== "";

  return (
    <div>
      {cinema ? (
        <OpticsCinema
          objectCm={state.objectCm}
          lensCm={state.lensCm}
          pinCm={state.pinCm}
          imageCm={state.trueImageCm}
          onFallback={() => setCinema(false)}
        />
      ) : (
        <svg className="bench-svg" viewBox="0 0 680 260" role="img" aria-label="Optical bench">
          <rect width="680" height="260" fill="#d7c7a8" />
          <line x1="40" y1="150" x2="640" y2="150" stroke="#1c1712" strokeWidth="6" />
          {Array.from({ length: 11 }, (_, i) => (
            <text key={i} x={40 + i * 60} y="180" fontSize="12" textAnchor="middle">{i * 10}</text>
          ))}
          <g transform={`translate(${40 + state.objectCm * 6} ${150 + (state.eyeShift ? shift : 0)})`}>
            <line x1="0" y1="0" x2="0" y2="-70" stroke="#1d3c72" strokeWidth="3" />
            <text y="-78" fontSize="12" textAnchor="middle">object</text>
          </g>
          <g transform={`translate(${40 + state.lensCm * 6} 150)`}>
            <path d="M0 -46 C 16 -20, 16 20, 0 46 C -16 20, -16 -20, 0 -46" fill="#d9ecff" stroke="#1c1712" />
          </g>
          <g transform={`translate(${40 + state.pinCm * 6} ${150 - (state.eyeShift ? shift + relative : 0)})`}>
            <line x1="0" y1="0" x2="0" y2="-70" stroke="#b85a12" strokeWidth="3" />
            <text y="-78" fontSize="12" textAnchor="middle">image pin</text>
          </g>
          {state.eyeShift && state.trueImageCm !== null && (
            <g transform={`translate(${40 + state.trueImageCm * 6} ${150 - (state.eyeShift ? shift : 0)})`} opacity="0.55">
              <line x1="0" y1="0" x2="0" y2="-70" stroke="#1d6a45" strokeWidth="3" strokeDasharray="3 3" />
            </g>
          )}
          {sight === "hidden" && state.trueImageCm !== null && (
            <path d={`M ${40 + state.objectCm * 6} 80 L ${40 + state.lensCm * 6} 150 L ${40 + state.trueImageCm * 6} 80`} fill="none" stroke="#1d3c72" />
          )}
          {sight === "exam" && <text x="40" y="30" fontSize="16">1/v − 1/u = 1/f. Real object: u is negative. Real image: v is positive.</text>}
        </svg>
      )}
      <p className="live" aria-live="polite">
        {state.trueImageCm === null ? "No real image on the bench. The object is inside the focus, or the lens formula has sent the image to infinity." : state.cleared ? "No parallax. The pins move together." : "Parallax remains. Shift your eye and watch the pins part."}
      </p>
      <div className="row">
        <label className="field">Object cm<input type="range" min={5} max={90} step={0.1} value={state.objectCm} onChange={(event) => emit("object", { n: Number(event.target.value) })} /></label>
        <label className="field">Lens cm<input type="range" min={20} max={80} step={0.1} value={state.lensCm} onChange={(event) => emit("lens", { n: Number(event.target.value) })} /></label>
        <label className="field">Image pin cm<input type="range" min={20} max={98} step={0.1} value={state.pinCm} onChange={(event) => emit("pin", { n: Number(event.target.value) })} /></label>
        <button className="btn" type="button" onClick={() => emit("eye")}>{state.eyeShift ? "Eye shifted" : "Shift your eye"}</button>
      </div>
      <p>Plain scale, object to lens: {(state.lensCm - state.objectCm).toFixed(1)} cm. The image rider carries the vernier.</p>
      <h3>Vernier on the image rider</h3>
      <p>Closed-rider check. Write the zero error. The correction is the negative of a positive zero error. Nothing is subtracted until you do it.</p>
      <VernierStrip observedCm={observedLength(0, zero.zeroErrorCm)} label="Rider at the index" />
      <label className="field">Zero error (cm)
        <input inputMode="decimal" onBlur={(event) => event.target.value !== "" && emit("zero", { n: Number(event.target.value) })} />
      </label>
      <label className="field">Zero correction you will apply (cm)
        <input inputMode="decimal" onBlur={(event) => event.target.value !== "" && emit("correction", { n: Number(event.target.value) })} />
      </label>
      <VernierStrip observedCm={imageObserved} label="Image rider" />
      {sight === "exam" && <p>Reading = MSR + coinciding division × 0.01 cm. Then add the zero correction, which is negative when the zero error is positive.</p>}
      <div className="row">
        <label className="field">Corrected object distance u, as a positive cm
          <input inputMode="decimal" value={uText} onChange={(event) => setUText(event.target.value)} />
        </label>
        <label className="field">Corrected image distance v, as a positive cm
          <input inputMode="decimal" value={vText} onChange={(event) => setVText(event.target.value)} />
        </label>
      </div>
      <label className="row">
        <input type="checkbox" checked={accept} onChange={(event) => setAccept(event.target.checked)} />
        I accept the parallax error and will live with this reading
      </label>
      <button
        className="btn"
        type="button"
        disabled={!canRecord}
        onClick={() => {
          emit("row", {
            object: state.objectCm,
            lens: state.lensCm,
            pin: state.pinCm,
            u: Number(uText),
            v: Number(vText),
            accepted: accept && !state.cleared,
          });
          setAccept(false);
        }}
      >
        Record u and v
      </button>
      {!state.cleared && !accept && <p className="notice">Recording stays locked until parallax is gone, or you accept it.</p>}
      <div className="table-wrap">
        <table>
          <thead><tr><th>u (cm)</th><th>v (cm)</th><th>f (cm)</th><th>Parallax</th></tr></thead>
          <tbody>
            {state.rows.map((row) => (
              <tr key={row.id}>
                <td>{row.uCm.toFixed(2)}</td>
                <td>{row.vCm.toFixed(2)}</td>
                <td>{focalOfRow(row)?.toFixed(2) ?? "—"}</td>
                <td>{row.cleared ? "cleared" : row.accepted ? "accepted" : "still there"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {meanFocal(state) !== null && <p>Mean f from your rows: {meanFocal(state)!.toFixed(2)} cm.</p>}
      {offer && !cinema && (
        <button className="btn-quiet" type="button" onClick={() => setCinema(true)}>Cinema Lab — orbit the bench to see parallax</button>
      )}
      {cinema && <button className="btn-quiet" type="button" onClick={() => setCinema(false)}>Back to Lite Lab</button>}
      <p className="caption">{pick("en", "Lite Lab is complete. Cinema is only a second way to see the same pins.", "Lite Lab पूरा है। Cinema उन्हीं pins को देखने का दूसरा ढंग है।")}</p>
    </div>
  );
}
