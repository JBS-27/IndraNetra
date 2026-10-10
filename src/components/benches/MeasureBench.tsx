"use client";

import { ScrewFace, VernierStrip } from "@/components/Instruments";
import type { StationMode } from "@/content/manual";
import { observedDiameter, screwZero } from "@/kernels/screwGauge";
import { observedLength, vernierZero } from "@/kernels/vernier";
import type { LabEvent, RunConditions } from "@/lab/events";
import { useState } from "react";

export function MeasureBench({
  events,
  ctx,
  emit,
  mode = "vernier",
}: {
  events: LabEvent[];
  ctx: RunConditions;
  emit: (type: string, data?: Record<string, string | number | boolean>) => void;
  sight: string;
  guided: boolean;
  breakOn: boolean;
  mode?: StationMode;
}) {
  const which: StationMode = mode === "screw" || mode === "spherometer" ? mode : "vernier";
  const zeroV = vernierZero(ctx.kit);
  const zeroS = screwZero(ctx.kit);
  const sphereCm = 2.36;
  const wireMm = 0.5;
  const sagMm = 1.5;
  const [text, setText] = useState("");
  const [zeroText, setZeroText] = useState("");
  const readings = events.filter((event) => event.type === "reading");
  const observed =
    which === "vernier"
      ? observedLength(sphereCm, zeroV.zeroErrorCm)
      : which === "screw"
        ? observedDiameter(wireMm, zeroS.zeroErrorMm)
        : observedDiameter(sagMm, zeroS.zeroErrorMm);

  return (
    <div className="instrument-stage">
      <svg className="bench-svg" viewBox="0 0 680 220" role="img" aria-label="Measuring instrument on the stone bench">
        <rect width="680" height="220" fill="#c4a574" />
        {which === "vernier" && (
          <>
            <rect x="70" y="70" width="280" height="28" rx="4" fill="#c9a15a" stroke="#1c1712" />
            <rect x="250" y="48" width="18" height="90" rx="3" fill="#8d6a2f" />
            <circle cx="430" cy="110" r="46" fill="#d7dde6" stroke="#1c1712" strokeWidth="3" />
            <text x="430" y="190" textAnchor="middle" fontSize="14">sphere in the jaws</text>
          </>
        )}
        {which !== "vernier" && (
          <>
            <rect x="80" y="40" width="70" height="140" rx="8" fill="#b08a45" stroke="#1c1712" />
            <circle cx="200" cy="120" r="52" fill="#efe6d2" stroke="#1c1712" strokeWidth="3" />
            <text x="360" y="110" fontSize="16">{which === "screw" ? "wire between the jaws" : "watch glass under the screw"}</text>
          </>
        )}
      </svg>
      {which === "vernier" ? (
        <>
          <p>Jaws shut. Read the zero error on this vernier. Least count 0.01 cm.</p>
          <VernierStrip observedCm={observedLength(0, zeroV.zeroErrorCm)} label="Jaws closed" />
          <p>Now the sphere. The vernier has moved. Write the scale reading, then your corrected diameter.</p>
          <VernierStrip observedCm={observed} label="Sphere" />
        </>
      ) : (
        <>
          <p>{which === "screw" ? "Screw gauge on the wire." : "Spherometer on the watch glass. The circular scale is the sag h."} Least count 0.01 mm. Pitch 1 mm.</p>
          <ScrewFace observedMm={observedDiameter(0, zeroS.zeroErrorMm)} label="Closed" />
          <ScrewFace observedMm={observed} label={which === "screw" ? "Wire" : "Sag h"} />
        </>
      )}
      <div className="row">
        <label className="field">Zero error you read
          <input inputMode="decimal" value={zeroText} onChange={(event) => setZeroText(event.target.value)} />
        </label>
        <label className="field">Corrected reading
          <input inputMode="decimal" value={text} onChange={(event) => setText(event.target.value)} />
        </label>
        <button
          className="btn"
          type="button"
          disabled={text === "" || zeroText === ""}
          onClick={() => emit("reading", { n: Number(text), z: Number(zeroText), kind: which === "vernier" ? 1 : which === "screw" ? 2 : 3 })}
        >
          Record
        </button>
      </div>
      {readings.length > 0 && (
        <p>
          {readings.length} reading{readings.length > 1 ? "s" : ""} in the file.
          {which === "vernier" && text !== "" ? ` Volume from your diameter, if it is in cm: ${((4 / 3) * Math.PI * Math.pow(Number(text) / 2, 3)).toFixed(2)} cm³.` : ""}
          {which === "spherometer" && text !== "" ? ` R = l²/6h + h/2. With l = 4.0 cm and your h in cm, R = ${(16 / (6 * (Number(text) / 10)) + Number(text) / 20).toFixed(2)} cm if h was in mm.` : ""}
        </p>
      )}
      <p className="caption">The zero correction is the number you typed. The bench will not subtract it on its own.</p>
    </div>
  );
}
