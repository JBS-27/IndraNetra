"use client";

import type { StationMode } from "@/content/manual";
import {
  boyleVolume,
  capillaryRiseMm,
  inclineForce,
  limitingFriction,
  resonanceLengthCm,
  youngModulus,
} from "@/kernels/schoolLabs";
import type { LabEvent, RunConditions } from "@/lab/events";
import { useState } from "react";

export function StationBench({
  events,
  ctx,
  emit,
  mode = "friction",
  sight,
}: {
  events: LabEvent[];
  ctx: RunConditions;
  emit: (type: string, data?: Record<string, string | number | boolean>) => void;
  sight: string;
  guided: boolean;
  breakOn: boolean;
  mode?: StationMode;
}) {
  const [knob, setKnob] = useState(mode === "incline" ? 25 : mode === "boyle" ? 120 : mode === "capillary" ? 0.4 : mode === "resonance" ? 40 : mode === "young" ? 2 : mode === "viscosity" ? 20 : mode === "line" ? 2 : mode === "chromatography" ? 40 : 4);
  const [typed, setTyped] = useState("");
  const rows = events.filter((event) => event.type === "reading");
  const scene = readingFor(mode, knob, ctx.temperatureC);
  const close = typed !== "" && Math.abs(Number(typed) - scene.value) <= scene.tolerance;

  return (
    <div>
      <svg className="bench-svg station-art" viewBox="0 0 680 280" role="img" aria-label={scene.label}>
        <rect width="680" height="280" fill="#c4a574" />
        <Scene mode={mode} knob={knob} />
        <g>
          <rect x="460" y="90" width="180" height="78" rx="10" fill="#f7f4ee" stroke="#1c1712" />
          <text x="550" y="128" textAnchor="middle" fontSize="28">{scene.value.toFixed(2)}</text>
          <text x="550" y="152" textAnchor="middle" fontSize="14">{scene.unit || "reading"}</text>
        </g>
        {sight === "exam" && <text x="24" y="28" fontSize="15">{scene.formula}</text>}
      </svg>
      <p className="live">{scene.label}. {scene.prompt}</p>
      <p className="sr">{scene.readout}</p>
      <label className="field">{scene.knobLabel}
        <input type="range" min={scene.min} max={scene.max} step={scene.step} value={knob} onChange={(event) => setKnob(Number(event.target.value))} />
      </label>
      <div className="row">
        <label className="field">Reading you take ({scene.unit})
          <input inputMode="decimal" value={typed} onChange={(event) => setTyped(event.target.value)} />
        </label>
        <button className="btn" type="button" disabled={!close} onClick={() => { emit("reading", { n: Number(typed), k: knob }); setTyped(""); }}>
          Record
        </button>
      </div>
      {!close && typed !== "" && <p className="notice">That is not the mark on the instrument. Look again.</p>}
      <table>
        <thead><tr><th>{scene.knobLabel}</th><th>Your reading ({scene.unit})</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}><td>{row.data.k}</td><td>{row.data.n}</td></tr>
          ))}
        </tbody>
      </table>
      {rows.length >= 2 && <p>{scene.after}</p>}
    </div>
  );
}

function readingFor(mode: StationMode | undefined, knob: number, room: number): {
  value: number;
  tolerance: number;
  unit: string;
  label: string;
  prompt: string;
  readout: string;
  knobLabel: string;
  min: number;
  max: number;
  step: number;
  formula: string;
  after: string;
} {
  if (mode === "incline") {
    const force = inclineForce(0.25, knob);
    return pack(force, 0.08, "N", "Roller on the plank", "The spring balance shows the downhill force.", `${force.toFixed(2)} newton`, "Angle θ (degrees)", 0, 50, 1, "F = mg sin θ", "Force against sin θ should straighten.");
  }
  if (mode === "boyle") {
    const volume = boyleVolume(knob);
    return pack(volume, 0.4, "mL", "Trapped air", "The pressure gauge and the volume scale move together.", `${volume.toFixed(1)} millilitres at ${knob} kilopascal`, "Pressure (kPa)", 80, 220, 5, "pV = constant, at one temperature", "p times your V should stay nearly the same.");
  }
  if (mode === "capillary") {
    const rise = capillaryRiseMm(knob, room);
    return pack(rise, 0.4, "mm", "Capillary in water", "A narrower bore climbs higher. Read the meniscus.", `${rise.toFixed(1)} millimetres`, "Bore radius (mm)", 0.15, 0.8, 0.05, "h = 2σ / (ρ g r)", "Halving the bore roughly doubles the rise.");
  }
  if (mode === "viscosity") {
    const seconds = 4 + knob / 8;
    return pack(seconds, 0.3, "s", "Sphere in glycerine", "Time the fall between the two marks.", `${seconds.toFixed(1)} seconds`, "Path between marks (cm)", 8, 30, 1, "Terminal velocity v = s / t", "A longer path at the same speed takes longer.");
  }
  if (mode === "resonance") {
    const length = resonanceLengthCm(knob, room);
    return pack(length, 0.4, "cm", "Resonance column", "Move the water until the fork’s note swells. That length is the reading.", `${length.toFixed(1)} centimetres for ${knob} hertz`, "Tuning fork (Hz)", 256, 512, 16, "v = 4f (L + e), first resonance", "A warmer room lengthens the column slightly.");
  }
  if (mode === "young") {
    const extensionMm = knob * 0.12;
    const Y = youngModulus(knob * 9.8, Math.PI * (0.0005 ** 2), extensionMm / 1000, 2);
    return pack(extensionMm, 0.05, "mm", "Wire and hanger", "Read the extension on the scale. Young’s modulus uses your extension, not a hidden one.", `${extensionMm.toFixed(2)} millimetres. Y is about ${Y ? (Y / 1e11).toFixed(2) : "—"} × 10¹¹ if you substitute.`, "Load (kg)", 0.5, 4, 0.5, "Y = (F/A) / (ΔL/L)", "Extension should grow in step with the load.");
  }
  if (mode === "line") {
    const slope = knob;
    return pack(slope, 0.05, "", "Two points on the grid", "The line climbs by this many units for a run of 1. Count it.", `slope ${slope.toFixed(2)}`, "Rise for a run of 1", -3, 4, 0.5, "slope = (y₂ − y₁) / (x₂ − x₁)", "The slope is the number you counted.");
  }
  if (mode === "chromatography") {
    const solvent = 8;
    const spot = (knob / 100) * solvent;
    const rf = spot / solvent;
    return pack(rf, 0.02, "", "Paper strip", "The solvent front is at 8.0 cm. Measure how far this pigment travelled, then divide.", `Rf ${rf.toFixed(2)}`, "Pigment distance as a percent of the front", 20, 90, 5, "Rf = distance of spot / distance of solvent", "A spot that travels with the front has Rf near 1.");
  }
  const friction = limitingFriction(knob, 0.36);
  return pack(friction, 0.08, "N", "Block on the bench", "Increase the pull until the block is about to move. That pull is limiting friction.", `${friction.toFixed(2)} newton`, "Normal reaction (N)", 1, 8, 0.5, "f = μ N", "Doubling the normal reaction doubles the limiting pull.");
}

function pack(
  value: number,
  tolerance: number,
  unit: string,
  label: string,
  prompt: string,
  readout: string,
  knobLabel: string,
  min: number,
  max: number,
  step: number,
  formula: string,
  after: string,
) {
  return { value: Math.round(value * 100) / 100, tolerance, unit, label, prompt, readout, knobLabel, min, max, step, formula, after };
}

function Scene({ mode, knob }: { mode?: StationMode; knob: number }) {
  if (mode === "incline") {
    const rise = Math.sin((knob * Math.PI) / 180) * 160;
    return (
      <g>
        <line x1="80" y1="210" x2="420" y2={210 - rise} stroke="#5c4632" strokeWidth="10" />
        <circle cx={200} cy={210 - rise * 0.45} r="18" fill="#1d3c72" />
      </g>
    );
  }
  if (mode === "boyle") {
    const h = 40 + 8000 / knob;
    return (
      <g>
        <rect x="250" y={40} width="70" height="180" fill="#f7f4ee" stroke="#1c1712" />
        <rect x="256" y={200 - h} width="58" height={h} fill="#d7ecf8" />
      </g>
    );
  }
  if (mode === "capillary") {
    const rise = Math.min(150, 40 / knob);
    return (
      <g>
        <path d="M160 160 h280 v50 h-280 z" fill="#d7ecf8" stroke="#1c1712" />
        <rect x="300" y={160 - rise} width="10" height={rise + 40} fill="#eaf4fb" stroke="#1c1712" />
      </g>
    );
  }
  if (mode === "line") {
    return (
      <g>
        <line x1="80" y1="200" x2="520" y2={200 - knob * 30} stroke="#1d3c72" strokeWidth="3" />
        <circle cx="80" cy="200" r="6" fill="#b85a12" />
        <circle cx="520" cy={200 - knob * 30} r="6" fill="#b85a12" />
      </g>
    );
  }
  if (mode === "chromatography") {
    return (
      <g>
        <rect x="300" y="30" width="36" height="200" fill="#f7f4ee" stroke="#1c1712" />
        <circle cx="318" cy={210 - knob * 1.6} r="8" fill="#1d6a45" />
        <line x1="280" y1="50" x2="360" y2="50" stroke="#b85a12" />
      </g>
    );
  }
  if (mode === "resonance") {
    return (
      <g>
        <rect x="300" y="40" width="40" height="190" fill="none" stroke="#1c1712" strokeWidth="3" />
        <rect x="304" y={120} width="32" height="106" fill="#d7ecf8" />
        <path d="M250 50 h40 v16 h-40 z" fill="#8d6a2f" />
      </g>
    );
  }
  return (
    <g>
      <rect x="160" y="150" width="120" height="40" rx="6" fill="#6b5133" />
      <line x1="280" y1="170" x2={280 + knob * 18} y2="170" stroke="#1c1712" strokeWidth="3" />
    </g>
  );
}
