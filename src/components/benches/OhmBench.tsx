"use client";

import { Needle } from "@/components/Instruments";
import { GraphPaper } from "@/components/GraphPaper";
import { pick, type Sight } from "@/content/copy";
import type { LabEvent, RunConditions } from "@/lab/events";
import { ohmSetupOk, projectOhm, resistancePerCm, usedCurrent } from "@/lab/ohm";
import { quantize } from "@/kernels/circuit";
import { useStore } from "@/lib/store";
import { playTick } from "@/lib/sound";
import { useState } from "react";

const TERMINALS: Record<string, { x: number; y: number }> = {
  bat_pos: { x: 86, y: 78 },
  bat_neg: { x: 86, y: 168 },
  key_l: { x: 190, y: 78 },
  key_r: { x: 270, y: 78 },
  rhe_l: { x: 360, y: 78 },
  rhe_r: { x: 470, y: 78 },
  amm_l: { x: 590, y: 92 },
  amm_r: { x: 590, y: 176 },
  coil_l: { x: 470, y: 250 },
  coil_r: { x: 280, y: 250 },
  bulb_l: { x: 210, y: 190 },
  bulb_r: { x: 150, y: 190 },
  volt_l: { x: 330, y: 320 },
  volt_r: { x: 450, y: 320 },
};

export function OhmBench({
  events,
  ctx,
  emit,
  sight,
  breakOn,
}: {
  events: LabEvent[];
  ctx: RunConditions;
  emit: (type: string, data?: Record<string, string | number | boolean>) => void;
  sight: Sight;
  guided: boolean;
  breakOn: boolean;
}) {
  const { profile } = useStore();
  const lang = profile.language;
  const state = projectOhm(events, ctx);
  const [pickTerm, setPickTerm] = useState<string | null>(null);
  const [rawI, setRawI] = useState("");
  const [rawV, setRawV] = useState("");
  const [corI, setCorI] = useState("");
  const [corV, setCorV] = useState("");
  const [length, setLength] = useState("");
  const meter = state.meter;
  const line = state.line ?? { x1: 0, y1: 0, x2: 0.4, y2: 1, xMax: 1, yMax: 3, throughOrigin: false };

  function tap(id: string) {
    if (!pickTerm) {
      setPickTerm(id);
      return;
    }
    if (pickTerm !== id) emit("wire", { a: pickTerm, b: id });
    setPickTerm(null);
  }

  function toggleKey() {
    emit("key");
    playTick("switch", profile.sound);
    if (state.keyClosed && meter.trueCurrentA > 0.02) {
      emit("saw-current");
      emit("saw-open");
    }
  }

  const points = state.readings.map((reading) => {
    const used = usedCurrent(reading);
    return { x: used.i, y: used.v };
  });
  const perCm = resistancePerCm(state);

  return (
    <div>
      <svg className="bench-svg" viewBox="0 0 680 380" role="img" aria-label="Circuit bench">
        <rect width="680" height="380" fill="#d7c7a8" rx="16" />
        {state.wires.map((wire) => {
          const a = TERMINALS[wire.a];
          const b = TERMINALS[wire.b];
          if (!a || !b) return null;
          return (
            <line
              key={wire.id}
              className={wire.loose ? "wire hot-wire" : "wire"}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              onClick={() => emit("loose", { a: wire.a, b: wire.b })}
            />
          );
        })}
        <rect x="60" y="70" width="52" height="110" rx="8" fill="#1d3c72" />
        <text x="86" y="130" textAnchor="middle" fill="white" fontSize="12">{meter.batteryEmfV.toFixed(2)} V</text>
        <line x1="190" y1="78" x2={state.keyClosed ? 270 : 230} y2={state.keyClosed ? 78 : 40} stroke="#1c1712" strokeWidth="4" />
        <rect x="350" y="60" width="130" height="36" rx="8" fill="#f4efe4" stroke="#1c1712" />
        <circle cx="590" cy="130" r="46" fill="#f7f4ee" stroke="#1c1712" />
        <rect x="300" y="232" width="150" height="36" rx="18" fill={state.coilHot ? "#a33b16" : "#6b5a45"} />
        <circle cx="180" cy="190" r="22" fill={state.bulbIn ? "#f6e27a" : "#ddd"} stroke="#1c1712" />
        <rect x="330" y="300" width="120" height="36" rx="8" fill="#f7f4ee" stroke="#1c1712" />
        {Object.entries(TERMINALS).map(([id, point]) => (
          <circle
            key={id}
            className="terminal"
            cx={point.x}
            cy={point.y}
            r={pickTerm === id ? 11 : 8}
            fill={pickTerm === id ? "#b85a12" : "#1c1712"}
            onClick={() => tap(id)}
          >
            <title>{id.replace("_", " ")}</title>
          </circle>
        ))}
        {sight === "hidden" && ohmSetupOk(state) && (
          <text x="40" y="30" fontSize="14">Current is the same all around the series loop. The bulb takes energy, not charge.</text>
        )}
        {sight === "exam" && <text x="40" y="30" fontSize="16">V = IR. Slope of V against I is R. R per cm = R / L.</text>}
        {meter.fuseBlown && <text x="200" y="200" fontSize="22" fill="#8d1f1f">Fuse open. The wire was shorted.</text>}
      </svg>
      <div className="row">
        <Needle value={meter.ammeterNeedleA} max={1} label="Ammeter" least="0.02" unit="A" />
        <Needle value={meter.voltmeterNeedleV} max={3} label="Voltmeter" least="0.05" unit="V" />
      </div>
      <p className="sr" aria-live="polite">
        {meter.openKey ? "Key open." : "Key closed."} Ammeter {quantize(meter.ammeterNeedleA, 0.02).toFixed(2)} ampere. Voltmeter {quantize(meter.voltmeterNeedleV, 0.05).toFixed(2)} volt.
      </p>
      <p>
        {meter.openKey ? "Key open." : "Key closed."}
        {meter.voltmeterInSeries ? " The voltmeter is in series, so the current collapses." : ""}
        {state.bulbIn ? " The bulb is in the loop. Current is not used up." : ""}
        {meter.fuseBlown ? " Fuse open." : ""}
      </p>
      <div className="row">
        <button className="btn" type="button" onClick={toggleKey}>{state.keyClosed ? "Open key" : "Close key"}</button>
        <label className="field">
          Rheostat {state.rheostatOhms.toFixed(0)} ohm
          <input type="range" min={1} max={40} value={state.rheostatOhms} onChange={(event) => emit("rheostat", { n: Number(event.target.value) })} />
        </label>
        <button className="btn-quiet" type="button" onClick={() => emit("bulb")}>{state.bulbIn ? "Bulb is in the loop" : "Put the bulb in series"}</button>
        <button className="btn-quiet" type="button" onClick={() => emit("heat")}>{state.coilHot ? "Coil is hot" : "Let the coil heat"}</button>
      </div>
      <p className="caption">Tap a terminal, then another, to lay a wire. Tap a wire to make it loose. Selected: {pickTerm ?? "none"}.</p>
      <div className="row">
        <label className="field">Zero error you read (A)<input inputMode="decimal" defaultValue={state.zeroTyped ?? ""} onBlur={(event) => event.target.value !== "" && emit("zero", { n: Number(event.target.value) })} /></label>
        <label className="field">Needle I (A)<input inputMode="decimal" value={rawI} onChange={(event) => setRawI(event.target.value)} /></label>
        <label className="field">Needle V (V)<input inputMode="decimal" value={rawV} onChange={(event) => setRawV(event.target.value)} /></label>
        <label className="field">Corrected I<input inputMode="decimal" value={corI} onChange={(event) => setCorI(event.target.value)} /></label>
        <label className="field">Corrected V<input inputMode="decimal" value={corV} onChange={(event) => setCorV(event.target.value)} /></label>
        <button
          className="btn"
          type="button"
          disabled={
            rawI === "" ||
            rawV === "" ||
            Math.abs(Number(rawI) - quantize(meter.ammeterNeedleA, 0.02)) > 0.021 ||
            Math.abs(Number(rawV) - quantize(meter.voltmeterNeedleV, 0.05)) > 0.06
          }
          onClick={() => {
            emit("reading", {
              i: Number(rawI),
              v: Number(rawV),
              ...(corI !== "" ? { ci: Number(corI) } : {}),
              ...(corV !== "" ? { cv: Number(corV) } : {}),
              hot: state.coilHot,
              loose: state.wires.some((wire) => wire.loose),
            });
            if (!state.keyClosed) emit("saw-open");
            if (state.keyClosed && meter.trueCurrentA > 0.02) emit("saw-current");
          }}
        >
          Record this reading
        </button>
      </div>
      {rawI !== "" && Math.abs(Number(rawI) - quantize(meter.ammeterNeedleA, 0.02)) > 0.021 && (
        <p className="notice">Look at the ammeter needle again. The file will not invent the mark, and it will not correct it for you.</p>
      )}
      <label className="field">
        Length of the wire (cm), least count 0.1 cm. The wire on the bench is 50.0 cm if your eye is square to the mark.
        <input inputMode="decimal" value={length} onChange={(event) => setLength(event.target.value)} onBlur={() => length !== "" && emit("length", { n: Number(length) })} />
      </label>
      {state.readings.length > 0 && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>I needle</th><th>V needle</th><th>I corrected</th><th>V corrected</th><th></th></tr></thead>
            <tbody>
              {state.readings.map((reading) => (
                <tr key={reading.id}>
                  <td>{reading.rawI}</td><td>{reading.rawV}</td>
                  <td>{reading.corI ?? "—"}</td><td>{reading.corV ?? "—"}</td>
                  <td>{reading.hot ? "hot" : ""} {reading.loose ? "loose" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {points.length >= 2 && (
        <GraphPaper
          xLabel="I (A)"
          yLabel="V (V)"
          points={points}
          line={line}
          onLine={(next) => emit("graph", { x1: next.x1, y1: next.y1, x2: next.x2, y2: next.y2, xMax: next.xMax, yMax: next.yMax, origin: next.throughOrigin })}
        />
      )}
      {perCm !== null && <p>From your line and your length, R/L = {perCm.toFixed(3)} ohm/cm.</p>}
      {sight === "hidden" && <p>Hidden eye: arrows of current would be the same size on every series wire. A loose wire is an extra resistor. A hot coil is a steeper line.</p>}
      {breakOn && (
        <div className="notice safe">
          <p>Break to learn. A direct wire across the battery blows the fuse. Rewind keeps the lesson and clears the leads.</p>
          <button className="btn-danger" type="button" onClick={() => emit("wire", { a: "bat_pos", b: "bat_neg" })}>Short the battery</button>
          <button className="btn-quiet" type="button" onClick={() => emit("rewind", { text: "A short across the battery opened the fuse. The leads were rewound." })}>Rewind the short</button>
        </div>
      )}
      <p className="caption">{pick(lang, "School kit battery is not a perfect 4.5 V. The ammeter zero error is yours to subtract.", "School kit की battery पूर्ण 4.5 V नहीं है। Ammeter की zero error तुम्हें घटानी है।")}</p>
    </div>
  );
}
