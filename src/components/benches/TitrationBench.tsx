"use client";

import { pick, type Sight } from "@/content/copy";
import type { LabEvent, RunConditions } from "@/lab/events";
import { endpointMl, keptTitres, projectTitre, titreStrength, titreView } from "@/lab/titre";
import { judgeTitre, meanOf } from "@/kernels/titration";
import { useStore } from "@/lib/store";
import { playTick } from "@/lib/sound";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const TitrationCinema = dynamic(() => import("@/components/cinema/TitrationCinema").then((mod) => mod.TitrationCinema), { ssr: false });

export function TitrationBench({
  events,
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
  const state = projectTitre(events);
  const view = titreView(state);
  const [offer, setOffer] = useState(false);
  const [cinema, setCinema] = useState(false);
  const [initial, setInitial] = useState("0.0");
  const [finalReading, setFinalReading] = useState("");
  const lang = profile.language;
  const shownColour = state.indicator ? view.colourName : "colourless, no indicator";
  const fill = state.indicator ? (view.colour === "pink" ? "#f6c1d8" : view.colour === "pale-pink" ? "#f8d5e4" : "#f7f4ee") : "#f4f7fb";

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const blocked = nav.connection?.saveData || (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4);
    setOffer(!blocked);
  }, []);

  function add(amount: number) {
    if (!state.aliquot) return;
    emit("add", { n: amount });
    playTick(amount <= 0.05 ? "drop" : "bubble", profile.sound);
  }

  function record() {
    const increments = state.increments.length ? state.increments : [state.acidMl];
    const judged = judgeTitre(increments, endpointMl(state));
    const theirs = finalReading === "" ? view.shownMl - Number(initial || 0) : Number(finalReading) - Number(initial || 0);
    emit("titre", { n: Math.round(theirs * 10) / 10, overshot: judged.overshot });
    setFinalReading("");
  }

  const mean = meanOf(keptTitres(state));
  const strength = titreStrength(state);

  return (
    <div>
      {cinema ? (
        <TitrationCinema colour={fill} level={Math.min(1, state.acidMl / 50)} onFallback={() => setCinema(false)} />
      ) : (
        <svg className="bench-svg" viewBox="0 0 680 320" role="img" aria-label="Titration bench">
          <rect width="680" height="320" fill="#d7c7a8" />
          <path d="M120 30 h36 v120 l-10 8 v90 h-16 v-90 l-10-8 z" fill="#f7f4ee" stroke="#1c1712" strokeWidth="2" />
          <rect x="128" y={150 - Math.min(110, state.acidMl * 2)} width="20" height={Math.min(110, state.acidMl * 2)} fill="#d7ecf8" />
          {Array.from({ length: 11 }, (_, i) => (
            <text key={i} x="168" y={48 + i * 16} fontSize="11">{i * 5}</text>
          ))}
          <line x1="90" y1={state.eye === "level" ? 70 : state.eye === "high" ? 40 : 110} x2="120" y2="70" stroke="#b85a12" strokeWidth="2" />
          <path d="M360 120 h90 l40 120 h-170 l40-120 z" fill={fill} stroke="#1c1712" strokeWidth="2" />
          <text x="360" y="270" fontSize="16">{shownColour}</text>
          <text x="360" y="292" fontSize="16">pH {state.indicator ? view.pH.toFixed(1) : "—"}</text>
          {sight === "hidden" && <text x="300" y="40" fontSize="14">H⁺ from the burette meets OH⁻ in the flask. The last of the OH⁻ is the last of the pink.</text>}
          {sight === "exam" && <text x="300" y="40" fontSize="16">N₁V₁ = N₂V₂. M/20 oxalic acid is 0.1 N. Strength = N × 40 g/L.</text>}
        </svg>
      )}
      <p className="sr" aria-live="polite">
        Burette {view.shownMl.toFixed(1)} millilitres. Eye {state.eye}. Flask {shownColour}. {state.indicator ? `pH ${view.pH.toFixed(1)}.` : "No indicator."}
      </p>
      <p className="live">
        Flask is {shownColour}. {state.indicator ? `pH ${view.pH.toFixed(1)}.` : "Add phenolphthalein. The endpoint is a colour and a pH, not a colour alone."} Eye is {state.eye}.
      </p>
      <div className="row">
        <button className="btn-quiet" type="button" onClick={() => emit("labels")}>{state.labelsRead ? "Labels read" : "Read the labels"}</button>
        <button className="btn" type="button" onClick={() => emit("rinse")}>{state.rinsed ? "Burette rinsed" : "Rinse the burette"}</button>
        <button className="btn-quiet" type="button" onClick={() => emit("fill")}>Fill / refill</button>
        <button className="btn-quiet" type="button" onClick={() => emit("aliquot")}>Pipette {state.micro ? "10.0" : "20.0"} mL NaOH</button>
        <button className="btn-quiet" type="button" onClick={() => emit("indicator")}>Add phenolphthalein</button>
        <button className="btn-quiet" type="button" onClick={() => emit("micro")}>{state.micro ? "Microscale" : "Use microscale"}</button>
      </div>
      <div className="seg" role="group" aria-label="Eye line">
        {(["high", "level", "low"] as const).map((eye) => (
          <button key={eye} className="btn-quiet" type="button" aria-pressed={state.eye === eye} onClick={() => emit("eye", { text: eye })}>
            Eye {eye}
          </button>
        ))}
      </div>
      <div className="row">
        <button className="btn" type="button" onClick={() => add(0.05)} disabled={!state.aliquot}>One drop (0.05 mL)</button>
        <button className="btn-quiet" type="button" onClick={() => add(0.5)} disabled={!state.aliquot}>Slow 0.5 mL</button>
        <button className="btn-danger" type="button" onClick={() => add(1)} disabled={!state.aliquot}>Flood 1 mL</button>
      </div>
      <div className="row">
        <label className="field">Initial reading you see (mL)<input inputMode="decimal" value={initial} onChange={(event) => setInitial(event.target.value)} /></label>
        <label className="field">Final reading you see (mL)<input inputMode="decimal" value={finalReading} onChange={(event) => setFinalReading(event.target.value)} /></label>
        <button className="btn" type="button" onClick={record} disabled={state.acidMl <= 0 || finalReading === "" || Math.abs(Number(finalReading) - view.shownMl) > 0.2}>Record titre</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Titre (mL)</th><th>Note</th><th></th></tr></thead>
          <tbody>
            {state.rows.map((row) => (
              <tr key={row.id}>
                <td>{row.ml.toFixed(1)}</td>
                <td>{row.overshot ? "overshot" : "careful"} {row.eye !== "level" ? "parallax" : ""} {row.rejected ? "rejected" : ""}</td>
                <td><button className="btn-quiet" type="button" onClick={() => emit("reject", { id: row.id })}>Reject</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mean !== null && <p>Concordant mean {mean.toFixed(2)} mL. {strength ? `Normality ${strength.normality.toFixed(3)} N, strength ${strength.gramsPerLitre.toFixed(2)} g/L.` : ""}</p>}
      <p className="caption">Chemicals this run, about ₹{(state.micro ? 1.2 : 2.4).toFixed(2)} plus rinsings. Microscale spends less and shows the same endpoint.</p>
      {offer && (
        <button className="btn-quiet" type="button" onClick={() => setCinema((value) => !value)}>{cinema ? "Lite Lab" : "Cinema Lab"}</button>
      )}
      {breakOn && (
        <div className="notice safe">
          <p>Water into concentrated acid spatters. Acid into water is the school order. Smell is not an action here.</p>
          <button
            className="btn-danger"
            type="button"
            onClick={() => emit("splash", { text: "Water was poured into concentrated acid. The splash is why acid goes into water." })}
          >
            Pour water into acid
          </button>
          <button className="btn-quiet" type="button" onClick={() => emit("drop-beaker", { text: "The beaker was knocked over. The portion was set up again." })}>Knock the beaker</button>
        </div>
      )}
      <p>{pick(lang, "Do not inhale the flask. A real lab teaches wafting. This one will not train that habit.", "Flask को साँस में मत लो। असली प्रयोगशाला wafting सिखाती है। यह ऐप वह आदत नहीं सिखाएगा।")}</p>
    </div>
  );
}
