"use client";

import { pick } from "@/content/copy";
import { JUICES } from "@/kernels/schoolLabs";
import type { LabEvent } from "@/lab/events";
import { useStore } from "@/lib/store";
import { useState } from "react";

export function PhBench({
  events,
  emit,
}: {
  events: LabEvent[];
  ctx: unknown;
  emit: (type: string, data?: Record<string, string | number | boolean>) => void;
  sight: string;
  guided: boolean;
  breakOn: boolean;
}) {
  const { profile } = useStore();
  const [open, setOpen] = useState<string | null>(null);
  const [written, setWritten] = useState("");
  const juice = JUICES.find((item) => item.id === open) ?? null;
  const rows = events.filter((event) => event.type === "ph");

  return (
    <div>
      <div className="juice-row">
        {JUICES.map((item) => (
          <button key={item.id} className="juice" type="button" onClick={() => { setOpen(item.id); setWritten(""); }}>
            <span className="juice-liquid" style={{ background: rows.some((row) => row.data.id === item.id) || open === item.id ? item.colour : "#d5dde6" }} />
            <span>{pick(profile.language, item.en, item.hi)}</span>
          </button>
        ))}
      </div>
      {juice && (
        <div className="card">
          <p className="live">Universal indicator: {juice.colourName}. pH {juice.pH.toFixed(1)}. Write both. Colour alone is not the observation.</p>
          <label className="field">pH you will write
            <input inputMode="decimal" value={written} onChange={(event) => setWritten(event.target.value)} />
          </label>
          <button
            className="btn"
            type="button"
            disabled={written === "" || Math.abs(Number(written) - juice.pH) > 0.15}
            onClick={() => emit("ph", { id: juice.id, n: Number(written), text: juice.colourName })}
          >
            Record this solution
          </button>
          {written !== "" && Math.abs(Number(written) - juice.pH) > 0.15 && <p className="notice">Look at the beaker again. The number is part of the observation, not a guess from the colour name alone.</p>}
        </div>
      )}
      <table>
        <thead><tr><th>Solution</th><th>Colour name</th><th>pH you wrote</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{String(row.data.id)}</td>
              <td>{String(row.data.text)}</td>
              <td>{row.data.n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
