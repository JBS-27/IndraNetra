"use client";

import { ScrewFace } from "@/components/Instruments";
import { pick, type Sight } from "@/content/copy";
import { screwZero } from "@/kernels/screwGauge";
import { balanceValue, projectBridge, rhoFrom, wireDiameterObserved } from "@/lab/bridge";
import type { LabEvent, RunConditions } from "@/lab/events";
import { useStore } from "@/lib/store";
import { playClick } from "@/lib/sound";
import { useEffect, useState } from "react";

export function MeterBench({
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
  const { profile } = useStore();
  const state = projectBridge(events, ctx);
  const [lengthText, setLengthText] = useState("");
  const [balanceText, setBalanceText] = useState("");
  const [zeroText, setZeroText] = useState("");
  const [diameterText, setDiameterText] = useState("");
  const x = 70 + (state.jockeyCm / 100) * 540;
  const closed = screwZero(ctx.kit);

  useEffect(() => {
    playClick(state.loudness, profile.sound && state.keyClosed);
  }, [state.jockeyCm, state.loudness, state.keyClosed, profile.sound]);

  function setJockey(clientX: number, bounds: DOMRect) {
    const ratio = Math.min(1, Math.max(0, (clientX - bounds.left) / bounds.width));
    emit("jockey", { n: Math.round(ratio * 1000) / 10 });
  }

  return (
    <div>
      <svg
        className="bench-svg"
        viewBox="0 0 680 280"
        role="img"
        aria-label="Metre bridge"
        onPointerMove={(event) => {
          if (event.buttons !== 1) return;
          setJockey(event.clientX, event.currentTarget.getBoundingClientRect());
        }}
      >
        <rect width="680" height="280" fill="#c4a574" />
        <rect x="60" y="120" width="560" height="16" fill="#d7d1c6" stroke="#1c1712" />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line x1={70 + i * 54} x2={70 + i * 54} y1="136" y2="150" stroke="#1c1712" />
            <text x={70 + i * 54} y="168" fontSize="12" textAnchor="middle">{i * 10}</text>
          </g>
        ))}
        <polygon points={`${x},108 ${x - 10},86 ${x + 10},86`} fill="#1d3c72" />
        <rect x="40" y="40" width="70" height="40" fill="#f4efe4" stroke="#1c1712" />
        <text x="75" y="64" textAnchor="middle" fontSize="12">{state.reversed ? "R" : "X"}</text>
        <rect x="560" y="40" width="70" height="40" fill="#f4efe4" stroke="#1c1712" />
        <text x="595" y="64" textAnchor="middle" fontSize="12">{state.reversed ? "X" : "R"}</text>
        <circle cx="330" cy="50" r="28" fill="#f7f4ee" stroke="#1c1712" />
        <line
          x1="330"
          y1="50"
          x2="330"
          y2="28"
          stroke="#8d1f1f"
          strokeWidth="2"
          transform={`rotate(${state.needle * 40} 330 50)`}
        />
        {sight === "hidden" && (
          <text x="70" y="210" fontSize="14">Potential along the wire falls steadily. The null is where it matches the drop across the unknown.</text>
        )}
        {sight === "exam" && <text x="70" y="210" fontSize="16">X / R = l / (100 − l).  ρ = R A / L.</text>}
      </svg>
      <p className="live" aria-live="polite">
        Jockey {state.jockeyCm.toFixed(1)} cm. Needle {state.keyClosed ? (Math.abs(state.needle) < 0.05 ? "resting" : state.needle > 0 ? "right" : "left") : "key open"}.
        Click {state.loudness === 0 ? "silent" : state.loudness < 0.25 ? "faint" : "clear"}.
      </p>
      <div className="row">
        <label className="field">Known R (ohm)
          <input type="range" min={1} max={10} step={1} value={state.knownOhm} onChange={(event) => emit("known", { n: Number(event.target.value) })} />
        </label>
        <button className="btn" type="button" onClick={() => emit("key")}>{state.keyClosed ? "Open key" : "Close key"}</button>
        <button className="btn-quiet" type="button" onClick={() => emit("reverse")}>{state.reversed ? "Ends reversed" : "Reverse the ends"}</button>
      </div>
      <div className="row">
        <label className="field">Balance length you read (cm)
          <input inputMode="decimal" value={balanceText} onChange={(event) => setBalanceText(event.target.value)} />
        </label>
        <button
          className="btn"
          type="button"
          disabled={!state.keyClosed || balanceText === "" || Math.abs(Number(balanceText) - state.jockeyCm) > 0.6}
          onClick={() =>
            emit("balance", {
              n: Number(balanceText),
              r: state.knownOhm,
              reversed: state.reversed,
              near: Math.abs(state.needle) < 0.08,
            })
          }
        >
          Record this null
        </button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>R (ohm)</th><th>l (cm)</th><th>Ends</th><th>X (ohm)</th><th>Null?</th></tr></thead>
          <tbody>
            {state.balances.map((row) => (
              <tr key={row.id}>
                <td>{row.knownOhm}</td>
                <td>{row.lengthCm}</td>
                <td>{row.reversed ? "reversed" : "forward"}</td>
                <td>{balanceValue(row)?.toFixed(2) ?? "—"}</td>
                <td>{row.nearNull ? "settled" : "not settled"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3>Screw gauge</h3>
      <p>Jaws shut. The datum shows the zero error. Write it. The app will not subtract it.</p>
      <ScrewFace observedMm={closed.zeroErrorMm} label="Jaws closed" />
      <label className="field">Zero error you read (mm)
        <input inputMode="decimal" value={zeroText} onChange={(event) => setZeroText(event.target.value)} onBlur={() => zeroText !== "" && emit("zero", { n: Number(zeroText) })} />
      </label>
      <p>Wire between the jaws. Sleeve and circular scale together are the observed diameter. Apply your correction in the next box.</p>
      <ScrewFace observedMm={wireDiameterObserved(ctx)} label="Wire" />
      {sight === "exam" && <p>Observed = PSR + CSR × 0.01 mm. Corrected = observed + zero correction. The face does not write the correction for you.</p>}
      <p className="caption">Read the circular division sitting on the datum line, then apply the zero correction yourself.</p>
      <label className="field">Corrected diameter (mm)
        <input inputMode="decimal" value={diameterText} onChange={(event) => setDiameterText(event.target.value)} onBlur={() => diameterText !== "" && emit("diameter", { n: Number(diameterText) })} />
      </label>
      <label className="field">Length of the wire (m). The bench wire is 0.40 m.
        <input inputMode="decimal" value={lengthText} onChange={(event) => setLengthText(event.target.value)} onBlur={() => lengthText !== "" && emit("length", { n: Number(lengthText) })} />
      </label>
      {rhoFrom(state) !== null && <p>From your numbers, ρ = {rhoFrom(state)!.toExponential(2)} ohm·m.</p>}
      <p className="caption">{pick(profile.language, "Headphones stay silent unless the teacher has allowed sound.", "जब तक शिक्षक ध्वनि न खोले, headphone चुप रहते हैं।")}</p>
    </div>
  );
}
