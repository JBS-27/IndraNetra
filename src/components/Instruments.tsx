"use client";

import { decomposeScrew } from "@/kernels/screwGauge";
import { decomposeVernier } from "@/kernels/vernier";

export function VernierStrip({ observedCm, label }: { observedCm: number; label: string }) {
  const parts = decomposeVernier(Math.max(0, observedCm));
  const px = 150;
  const start = Math.max(0, Math.round((parts.msrCm - 0.5) * 10) / 10);
  const x = (cm: number) => (cm - start) * px + 24;
  const ticks: number[] = [];
  for (let cm = start; cm <= start + 2.2; cm = Math.round((cm + 0.1) * 10) / 10) ticks.push(cm);
  return (
    <svg viewBox="0 0 420 130" role="img" aria-label={label} className="graph-svg">
      <text x="12" y="16" fontSize="13">{label}. Least count 0.01 cm.</text>
      {ticks.map((cm) => (
        <g key={cm}>
          <line x1={x(cm)} x2={x(cm)} y1="28" y2="50" stroke="currentColor" />
          {Math.round(cm * 10) % 5 === 0 && (
            <text x={x(cm)} y="24" fontSize="11" textAnchor="middle">{cm.toFixed(1)}</text>
          )}
        </g>
      ))}
      <rect x={x(parts.observedCm)} y="58" width="150" height="36" fill="rgba(255,255,255,0.25)" stroke="currentColor" />
      {Array.from({ length: 11 }, (_, division) => (
        <line
          key={division}
          x1={x(parts.observedCm + division * 0.09)}
          x2={x(parts.observedCm + division * 0.09)}
          y1="62"
          y2="86"
          stroke="currentColor"
        />
      ))}
      <text x={x(parts.observedCm)} y="112" fontSize="12">0</text>
      <text x={x(parts.observedCm + 0.45)} y="112" fontSize="12">5</text>
      <text x={x(parts.observedCm + 0.9)} y="112" fontSize="12">10</text>
    </svg>
  );
}

export function ScrewFace({ observedMm, label }: { observedMm: number; label: string }) {
  const parts = decomposeScrew(Math.max(0, observedMm));
  const turn = -parts.circularDivision * 3.6;
  return (
    <svg viewBox="0 0 240 180" role="img" aria-label={label} className="graph-svg">
      <text x="12" y="18" fontSize="13">{label}. Least count 0.01 mm.</text>
      <text x="12" y="40" fontSize="14">Sleeve {parts.pitchScaleMm} mm</text>
      <line x1="120" y1="52" x2="120" y2="78" stroke="#b85a12" strokeWidth="3" />
      <g transform={`rotate(${turn} 120 120)`}>
        <circle cx="120" cy="120" r="52" fill="none" stroke="currentColor" strokeWidth="2" />
        {Array.from({ length: 20 }, (_, index) => {
          const division = index * 5;
          const angle = (division / 100) * Math.PI * 2 - Math.PI / 2;
          return (
            <text key={division} x={120 + Math.cos(angle) * 40} y={124 + Math.sin(angle) * 40} fontSize="11" textAnchor="middle">
              {division}
            </text>
          );
        })}
      </g>
    </svg>
  );
}

export function Needle({
  value,
  max,
  label,
  least,
  unit,
}: {
  value: number;
  max: number;
  label: string;
  least: string;
  unit: string;
}) {
  const t = Math.max(0, Math.min(1, value / max));
  const angle = -70 + t * 140;
  return (
    <svg viewBox="0 0 180 120" role="img" aria-label={`${label} ${value.toFixed(2)} ${unit}. Least count ${least}`}>
      <path d="M20 100 A70 70 0 0 1 160 100" fill="none" stroke="currentColor" strokeWidth="3" />
      <line x1="90" y1="100" x2="90" y2="42" stroke="#8d1f1f" strokeWidth="2.5" transform={`rotate(${angle} 90 100)`} />
      <circle cx="90" cy="100" r="4" fill="currentColor" />
      <text x="90" y="18" textAnchor="middle" fontSize="12">{label}</text>
      <text x="90" y="116" textAnchor="middle" fontSize="11">least count {least} {unit}</text>
    </svg>
  );
}
