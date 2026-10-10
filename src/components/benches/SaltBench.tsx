"use client";

import { pick, tx, type Sight } from "@/content/copy";
import { SALT_TESTS, type TestId } from "@/kernels/salt";
import type { LabEvent } from "@/lab/events";
import { observationFor, projectSalt } from "@/lab/saltlab";
import { useStore } from "@/lib/store";
import { useState } from "react";

const BOTTLES: { id: TestId | "salt" | "hcl-conc"; en: string; hi: string; hazard: string }[] = [
  { id: "salt", en: "Salt A", hi: "Salt A", hazard: "Unknown" },
  { id: "dil-hcl", en: "Dilute HCl", hi: "तनु HCl", hazard: "Irritant" },
  { id: "hcl-conc", en: "Conc. HCl", hi: "सांद्र HCl", hazard: "Corrosive" },
  { id: "bacl2", en: "BaCl₂", hi: "BaCl₂", hazard: "Harmful" },
  { id: "naoh", en: "NaOH", hi: "NaOH", hazard: "Corrosive" },
  { id: "nh4oh", en: "NH₄OH", hi: "NH₄OH", hazard: "Irritant" },
  { id: "agno3", en: "AgNO₃", hi: "AgNO₃", hazard: "Stain" },
];

export function SaltBench({
  events,
  emit,
  sight,
  breakOn,
}: {
  events: LabEvent[];
  ctx: unknown;
  emit: (type: string, data?: Record<string, string | number | boolean>) => void;
  sight: Sight;
  guided: boolean;
  breakOn: boolean;
}) {
  const { profile } = useStore();
  const lang = profile.language;
  const state = projectSalt(events);
  const [guess, setGuess] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  function run(test: TestId) {
    if (test !== "look" && state.portionsLeft < 1) return;
    if (test !== "look" && !state.read.includes(test) && !state.read.includes("hcl-conc") && test === "flame") {
      /* flame uses conc HCl; label check is hcl-conc */
    }
    emit("test", { text: test, ...(test === "flame" && guess ? { guess } : {}) });
  }

  return (
    <div>
      <p className="live" aria-live="polite">Portions left: {state.portionsLeft}. Spent about ₹{state.rupees.toFixed(2)}. {state.micro ? "Microscale." : "Ordinary scale."}</p>
      <div className="bottles">
        {BOTTLES.map((bottle) => (
          <button
            key={bottle.id}
            className="bottle"
            type="button"
            onClick={() => {
              setOpen(bottle.id);
              emit("label", { text: bottle.id === "hcl-conc" ? "flame" : bottle.id });
            }}
          >
            <strong>{pick(lang, bottle.en, bottle.hi)}</strong>
            <span className="hazard">{bottle.hazard}</span>
            {open === bottle.id && <span>{pick(lang, "Label read", "Label पढ़ा")}</span>}
          </button>
        ))}
      </div>
      <div className="row">
        <button className="btn-quiet" type="button" onClick={() => emit("micro")}>{state.micro ? "Microscale on" : "Switch to microscale"}</button>
        <button className="btn" type="button" onClick={() => run("look")}>Look at Salt A</button>
        <button className="btn" type="button" onClick={() => run("dissolve")} disabled={state.portionsLeft < 1}>Dissolve a portion</button>
      </div>
      <h3>Flame</h3>
      <p>Clean the wire in conc. HCl, touch the salt, hold it in the flame. Name the colour, then commit a guess. The ion’s name follows the guess.</p>
      <div className="seg">
        {["Cu²⁺", "Na⁺", "K⁺", "Ca²⁺", "Ba²⁺"].map((ion) => (
          <button key={ion} className="btn-quiet" type="button" aria-pressed={guess === ion} onClick={() => setGuess(ion)}>{ion}</button>
        ))}
      </div>
      <button className="btn" type="button" disabled={state.portionsLeft < 1 || guess === ""} onClick={() => run("flame")}>Hold in the flame</button>
      <h3>Tests</h3>
      <div className="row">
        {(["dil-hcl", "bacl2", "naoh", "nh4oh", "agno3"] as TestId[]).map((test) => (
          <button key={test} className="btn-quiet" type="button" disabled={state.portionsLeft < 1} onClick={() => run(test)}>
            {pick(lang, SALT_TESTS[test] ? test : test, test)}
          </button>
        ))}
      </div>
      {state.portionsLeft < 1 && !state.replenished && (
        <button className="btn-quiet" type="button" onClick={() => emit("replenish")}>Ask for one extra portion</button>
      )}
      <div className="table-wrap">
        <table>
          <thead><tr><th>Test</th><th>What you saw</th></tr></thead>
          <tbody>
            {state.tests.map((row) => {
              const found = observationFor(row.test);
              const showIon = row.test !== "flame" || row.guess !== "";
              return (
                <tr key={row.id}>
                  <td>{row.test}{row.guess ? ` · guess ${row.guess}` : ""}</td>
                  <td>
                    {tx({ en: found.en, hi: found.hi }, lang)}
                    {showIon && sight !== "lab" ? ` ${found.evidence}` : ""}
                    {row.test === "flame" && row.guess && sight === "lab" ? " After your guess: the preliminary ion is Cu²⁺." : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sight === "hidden" && <p>Hidden eye: Ba²⁺ pulls sulphate out as white BaSO₄. Excess ammonia wraps Cu²⁺ as the deep blue ammine. A wrong reagent spends a portion and proves an absence.</p>}
      {sight === "exam" && <p>Exam line: white ppt with BaCl₂, insoluble in dilute HCl → SO₄²⁻. Pale blue ppt, soluble in excess NH₄OH to deep blue → Cu²⁺.</p>}
      {breakOn && (
        <button className="btn-danger" type="button" onClick={() => emit("drop-beaker")}>Knock the tube</button>
      )}
      <p className="caption">{pick(lang, "Smell is not a button. If a gas matters, the bench says so in words.", "गंध का कोई बटन नहीं है। अगर गैस मायने रखती है, bench शब्दों में कहेगा।")}</p>
    </div>
  );
}
