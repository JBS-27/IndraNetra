"use client";

import { practicalById } from "@/content/catalog";
import { findExperiment } from "@/content/manual";
import { tx, type Lang } from "@/content/copy";
import { markScheme } from "@/content/marks";
import { teacherComment } from "@/kernels/numbers";
import { balanceValue, bridgeErrors, projectBridge, rhoFrom } from "@/lab/bridge";
import { projectDice, sevenRate } from "@/lab/dice";
import { meanOf } from "@/kernels/probability";
import { oneDie } from "@/lab/dice";
import { focalOfRow, lensErrors, meanFocal, projectLens } from "@/lab/lens";
import { ohmErrors, ohmSlope, projectOhm, resistancePerCm, usedCurrent } from "@/lab/ohm";
import { projectRate, rateErrors } from "@/lab/rate";
import { observationFor, projectSalt, saltErrors } from "@/lab/saltlab";
import { projectTangent, triangleAt } from "@/lab/tangent";
import { keptTitres, projectTitre, titreErrors, titreStrength } from "@/lab/titre";
import { meanOf as meanTitre } from "@/kernels/titration";
import { textOf } from "@/lab/events";
import type { RunRecord } from "@/lib/store";
import { useStore } from "@/lib/store";

function ctxOf(run: RunRecord) {
  return {
    kit: run.kit,
    temperatureC: run.temperatureC,
    humidity: run.humidity,
    ncertStandard: run.ncertStandard,
    mock: run.mock,
  };
}

export function HonestFile({ run }: { run: RunRecord }) {
  const { profile } = useStore();
  const lang = profile.language;
  const lesson = findExperiment(run.practicalId);
  const practical = practicalById(run.practicalId) ?? (lesson ? practicalById(lesson.bench) : undefined);
  if (!practical) return <p>This practical is not in the pack.</p>;
  const ctx = ctxOf(run);
  const events = run.events;
  const bench = lesson?.bench ?? run.practicalId;
  const result = textOf(events, "result");
  const explain = textOf(events, "explain");
  const prediction = events.find((event) => event.type === "predict");
  const scheme = markScheme(run.board, run.classLevel, practical.subject, lang);

  let columns = ["Observation"];
  let rows: string[][] = [];
  const calculation: string[] = [];
  let errors: { en: string; hi: string }[] = [];
  let expected: number | null = null;
  let slope: number | null = null;
  let unit = "";
  const viva: string[] = [];
  const badges: string[] = [];

  if (bench === "ohm") {
    const state = projectOhm(events, ctx);
    columns = ["I raw (A)", "V raw (V)", "I corrected", "V corrected", "Note"];
    rows = state.readings.map((reading) => [
      String(reading.rawI),
      String(reading.rawV),
      reading.corI === null ? "—" : String(reading.corI),
      reading.corV === null ? "—" : String(reading.corV),
      [reading.hot ? "hot" : "", reading.loose ? "loose" : ""].filter(Boolean).join(" ") || "—",
    ]);
    slope = ohmSlope(state);
    const per = resistancePerCm(state);
    if (slope !== null) calculation.push(`Slope of your V–I line = ${slope.toFixed(2)} ohm.`);
    if (state.lengthCm) calculation.push(`Length you wrote = ${state.lengthCm} cm.`);
    if (per !== null) {
      calculation.push(`R/L = ${per.toFixed(3)} ohm/cm.`);
      expected = per;
      unit = "ohm/cm";
    }
    errors = ohmErrors(state, ctx);
    if (state.zeroTyped !== null && state.readings.every((reading) => reading.corI !== null)) badges.push("Zero error handled");
    const first = state.readings[0];
    if (first) {
      const used = usedCurrent(first);
      viva.push(
        lang === "hi"
          ? `तुम्हारी एक reading में I = ${used.i} A और V = ${used.v} V है। अगर तार की लंबाई दोगुनी हो, resistivity वही रहे, तो resistance का क्या होगा?`
          : `One of your readings is I = ${used.i} A and V = ${used.v} V. If the wire were twice as long, and the material unchanged, what happens to the resistance?`,
      );
    }
    if (!state.meter.trueCurrentA && state.readings.length === 0) {
      viva.push(lang === "hi" ? "अभी कोई reading दर्ज नहीं है। Viva संख्या नहीं गढ़ेगा।" : "No reading has been recorded. The viva will not invent one.");
    } else {
      viva.push(
        lang === "hi"
          ? "तुम्हारा graph origin से न गुजरे, तो setup में से एक असली कारण बताओ।"
          : "If your graph misses the origin, name one real reason from the setup you built.",
      );
    }
  } else if (bench === "meter-bridge") {
    const state = projectBridge(events, ctx);
    columns = ["R (ohm)", "l (cm)", "Ends", "X (ohm)"];
    rows = state.balances.map((row) => [String(row.knownOhm), String(row.lengthCm), row.reversed ? "reversed" : "forward", balanceValue(row)?.toFixed(2) ?? "—"]);
    const rho = rhoFrom(state);
    if (rho !== null) {
      calculation.push(`ρ = ${rho.toExponential(2)} ohm·m from your X, L and d.`);
      expected = rho;
      unit = "ohm m";
    }
    errors = bridgeErrors(state, ctx);
    const lens = state.balances;
    if (lens[0]) {
      viva.push(
        lang === "hi"
          ? `तुम्हारी balance length ${lens[0].lengthCm} cm है, known resistance ${lens[0].knownOhm} ohm। Known resistance दोगुनी करो तो null किस ओर जाएगा?`
          : `Your balance length is ${lens[0].lengthCm} cm with known resistance ${lens[0].knownOhm} ohm. Which way does the null move if that known resistance is doubled?`,
      );
    }
    viva.push(lang === "hi" ? "सिरे पलटने पर balance point क्यों खिसकता है?" : "Why does reversing the ends move the balance point?");
  } else if (bench === "convex-lens") {
    const state = projectLens(events, ctx);
    columns = ["u (cm)", "v (cm)", "f (cm)", "Parallax"];
    rows = state.rows.map((row) => [row.uCm.toFixed(2), row.vCm.toFixed(2), focalOfRow(row)?.toFixed(2) ?? "—", row.cleared ? "cleared" : row.accepted ? "accepted" : "left"]);
    const mean = meanFocal(state);
    if (mean !== null) {
      calculation.push(`Mean f = ${mean.toFixed(2)} cm from your signed rows. 1/v − 1/u = 1/f.`);
      expected = Number(mean.toFixed(2));
      unit = "cm";
    }
    errors = lensErrors(state, ctx);
    if (state.rows.some((row) => row.cleared) && state.rows.every((row) => row.cleared || !row.accepted)) badges.push("Parallax cleared");
    if (state.rows[0]) {
      viva.push(
        lang === "hi"
          ? `तुम्हारी एक पंक्ति u = ${state.rows[0].uCm.toFixed(1)} cm, v = ${state.rows[0].vCm.toFixed(1)} cm है। वस्तु को focus के और पास, पर बाहर, लाने पर v किस ओर जाएगा?`
          : `One row has u = ${state.rows[0].uCm.toFixed(1)} cm and v = ${state.rows[0].vCm.toFixed(1)} cm. If the object moves closer, still outside the focus, which way does v go?`,
      );
    }
    viva.push(lang === "hi" ? "Parallax हटाने का क्या अर्थ है, और तुमने उसे स्वीकार किया या हटाया?" : "What does removing parallax mean, and did you clear it or accept it?");
  } else if (bench === "titration") {
    const state = projectTitre(events);
    columns = ["Titre (mL)", "Note"];
    rows = state.rows.map((row) => [row.ml.toFixed(1), [row.overshot ? "overshot" : "careful", row.rejected ? "rejected" : "kept", row.eye !== "level" ? "parallax" : ""].filter(Boolean).join(", ")]);
    const mean = meanTitre(keptTitres(state));
    const strength = titreStrength(state);
    if (mean !== null) calculation.push(`Concordant mean = ${mean.toFixed(2)} mL.`);
    if (strength) {
      calculation.push(`N(NaOH) = 0.1 × ${mean?.toFixed(2)} / ${state.micro ? 10 : 20} = ${strength.normality.toFixed(3)} N.`);
      calculation.push(`Strength = ${strength.gramsPerLitre.toFixed(2)} g/L.`);
      expected = strength.gramsPerLitre;
      unit = "g/L";
    }
    errors = titreErrors(state, ctx);
    if (state.rinsed && state.rows.some((row) => row.rejected) && keptTitres(state).length >= 2) badges.push("Perfect titration");
    const shown = state.rows.slice(0, 3).map((row) => row.ml.toFixed(1));
    if (shown.length >= 2) {
      viva.push(
        lang === "hi"
          ? `तुम्हारे titre ${shown.join(", ")} mL हैं। किसे reject करोगे, और क्यों?`
          : `Your titres are ${shown.join(", ")} mL. Which one will you reject, and why?`,
      );
    }
    viva.push(lang === "hi" ? "Phenolphthalein के रंग के साथ pH क्यों लिखा गया?" : "Why is the pH written beside the phenolphthalein colour?");
  } else if (bench === "salt") {
    const state = projectSalt(events);
    columns = ["Test", "Observation"];
    rows = state.tests.map((row) => {
      const found = observationFor(row.test);
      return [row.test + (row.guess ? ` (${row.guess})` : ""), lang === "hi" ? found.hi : found.en];
    });
    calculation.push(`Portions left: ${state.portionsLeft}. Approximate cost ₹${state.rupees.toFixed(2)}.`);
    errors = saltErrors(state);
    viva.push(lang === "hi" ? "नीला रंग confirmatory test क्यों नहीं है?" : "Why is the blue colour not a confirmatory test?");
    if (state.tests.some((row) => row.test === "bacl2")) {
      viva.push(lang === "hi" ? "BaCl₂ वाला सफेद अवक्षेप तनु HCl में क्यों नहीं घुलता?" : "Why does the white precipitate with BaCl₂ refuse to dissolve in dilute HCl?");
    }
  } else if (bench === "rate") {
    const state = projectRate(events, ctx);
    columns = ["Volume (mL)", "Temperature (°C)", "Your time (s)"];
    rows = state.rows.map((row) => [String(row.volumeMl), String(row.temperatureC), row.seconds.toFixed(1)]);
    if (state.rows[0]) calculation.push(`1/t for the first run = ${(1 / state.rows[0].seconds).toFixed(4)} per second.`);
    slope = null;
    errors = rateErrors(state, ctx);
    if (state.rows[0]) {
      viva.push(
        lang === "hi"
          ? `तुम्हारा एक समय ${state.rows[0].seconds.toFixed(1)} s है, ${state.rows[0].volumeMl} mL पर, ${state.rows[0].temperatureC}°C। आयतन आधा करो तो प्रतीक्षा बढ़ेगी या घटेगी?`
          : `One of your times is ${state.rows[0].seconds.toFixed(1)} s at ${state.rows[0].volumeMl} mL and ${state.rows[0].temperatureC}°C. If the volume is halved, does the wait grow or shrink?`,
      );
    }
    viva.push(lang === "hi" ? "गर्म flask सुस्त क्यों नहीं होता?" : "Why does a warmer flask not make this reaction lazy?");
  } else if (bench === "derivative") {
    const state = projectTangent(events);
    const triangle = triangleAt(state);
    columns = ["Curve", "x", "Run", "Slope you wrote"];
    rows = [[state.curve, String(state.x), String(state.run), state.writtenSlope === null ? "—" : String(state.writtenSlope)]];
    calculation.push(`Triangle slope at this point = ${triangle.slope.toFixed(2)}.`);
    slope = triangle.slope;
    expected = triangle.slope;
    unit = "";
    viva.push(lang === "hi" ? "Chord और tangent एक ही slope कब देते हैं?" : "When do the chord and the tangent give the same slope?");
    viva.push(lang === "hi" ? `x = ${state.x} पर त्रिभुज का rise/run क्या था?` : `What rise/run did the triangle have at x = ${state.x}?`);
  } else if (lesson && ["measure", "pendulum", "cooling", "ph", "station"].includes(lesson.bench)) {
    columns = ["What you set", "What you wrote"];
    rows = events
      .filter((event) => event.type === "reading" || event.type === "swing" || event.type === "temp" || event.type === "ph")
      .map((event) => [String(event.data.k ?? event.data.l ?? event.data.t ?? event.data.id ?? ""), String(event.data.n ?? "")]);
    if (rows.length === 0) calculation.push("No reading has been written yet.");
    viva.push(lang === "hi" ? "इस अध्याय की कौन-सी reading तुमने खुद ली, और zero error या कमरे के ताप ने उसे कैसे छुआ?" : "Which reading in this chapter did you take yourself, and how did zero error or the room temperature touch it?");
    viva.push(lang === "hi" ? "अगर तुम चर को दोगुना करो, तो reading किस ओर जाएगी?" : "If you double the variable you were changing, which way does the reading move?");
  } else if (bench === "dice") {
    const state = projectDice(events, run.seed);
    const rolls = oneDie(state);
    columns = ["Trials", "Average"];
    const cuts = [20, 200, 2000].filter((n) => rolls.length >= n);
    rows = cuts.map((n) => [String(n), meanOf(rolls.slice(0, n)).toFixed(2)]);
    const rate = sevenRate(state);
    if (rate !== null) calculation.push(`Your long-run share of sum 7 is ${rate.toFixed(3)}.`);
    viva.push(lang === "hi" ? "बीस फेंक probability क्यों नहीं हैं?" : "Why are twenty rolls not the probability?");
    viva.push(lang === "hi" ? "योग 7 के लिए sample space में कितने युग्म हैं?" : "How many pairs in the sample space sum to 7?");
  }

  const comment = teacherComment({
    sentence: result,
    expected: unit ? expected : slope,
    unit,
    slope,
    lang,
  });
  const taken = practical.precautions.map((item, index) => ({
    text: tx(item, lang),
    taken: index < 2 ? events.length > 4 : !errors.some((error) => error.en.toLowerCase().includes(item.en.split(" ")[0].toLowerCase())),
  }));

  return (
    <article className="file-sheet">
      <p>IndraNetra · {run.board} · Class {run.classLevel} · {new Date(run.startedAt).toLocaleDateString()} · {run.temperatureC}°C · {run.kit === "school" ? "School Kit" : "Textbook Kit"}</p>
      <h2>{tx(lesson ? lesson.title : practical.title, lang)}</h2>
      {lesson && <p>{tx(lesson.chapterTitle, lang)}. {tx(lesson.book, lang)}</p>}
      <h3>Aim</h3>
      <p>{tx(lesson ? lesson.aim : practical.aim, lang)}</p>
      <h3>Apparatus and chemicals</h3>
      <ul>
        {usedApparatus(run, lang, bench).map((item) => <li key={item}>{item}</li>)}
      </ul>
      <h3>Theory</h3>
      <p>{tx(practical.theory, lang)}</p>
      <h3>Prediction</h3>
      <p>{tx(practical.prediction, lang)} — {prediction?.data.choice === "yes" ? "Yes" : prediction ? "No" : "Not made"}.</p>
      {textOf(events, "revise") && <p>Revised because: {textOf(events, "revise")}</p>}
      <h3>Observations</h3>
      {rows.length === 0 ? <p>No reading has been recorded, so none is printed.</p> : (
        <table>
          <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
          <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
        </table>
      )}
      <h3>Calculation</h3>
      {calculation.length === 0 ? <p>The calculation appears when the readings do.</p> : calculation.map((line) => <p key={line}>{line}</p>)}
      <h3>Result</h3>
      <p>{result || "The result line is still yours to write."}</p>
      <p>{comment}</p>
      <h3>What you said</h3>
      <p>{explain || "—"}</p>
      <h3>Precautions</h3>
      <ul>{taken.map((item) => <li key={item.text}>{item.taken ? "Taken: " : "Not seen in this run: "}{item.text}</li>)}</ul>
      <h3>Sources of error</h3>
      <ul>{errors.length === 0 ? <li>None recorded beyond the ordinary least count.</li> : errors.map((error) => <li key={error.en}>{lang === "hi" ? error.hi : error.en}</li>)}</ul>
      {textOf(events, "exit") && <><h3>What would change if…</h3><p>{textOf(events, "exit")}</p></>}
      <h3>Viva of your readings</h3>
      <ol>{viva.slice(0, 2).map((item) => <li key={item}>{item}</li>)}</ol>
      {badges.length > 0 && <p>Portfolio: {badges.join(" · ")}</p>}
      {explain && (
        <details>
          <summary>Competitive exam practice, optional</summary>
          {practical.jee.map((item) => <p key={item.en}>{tx(item, lang)}</p>)}
        </details>
      )}
      {run.mock && <PracticeSplit schemeRows={scheme.rows} events={events.length} rows={rows.length} explained={Boolean(explain)} />}
      <p>{scheme.note}</p>
    </article>
  );
}

function usedApparatus(run: RunRecord, lang: Lang, id: string): string[] {
  const types = new Set(run.events.map((event) => event.type));
  const both = (en: string, hi: string) => (lang === "hi" ? hi : en);
  const list = [both("The pieces you actually touched", "जिन्हें तुमने सच में छुआ")];
  if (id === "ohm") {
    if (types.has("wire")) list.push("Battery, key, rheostat, ammeter, voltmeter, coil, leads");
    if (types.has("bulb")) list.push("Bulb");
  }
  if (id === "meter-bridge" && types.has("jockey")) list.push("Metre bridge, resistance box, galvanometer, jockey, screw gauge");
  if (id === "convex-lens" && types.has("object")) list.push("Optical bench, convex lens, object pin, image pin, vernier rider");
  if (id === "titration" && (types.has("add") || types.has("labels"))) list.push("Burette, pipette, flask, M/20 oxalic acid, NaOH, phenolphthalein");
  if (id === "salt" && types.has("test")) list.push("Salt A and the reagents whose tests appear in the table");
  if (id === "rate" && types.has("stop")) list.push("Flask, cross, 0.1 M sodium thiosulphate, dilute HCl");
  if (id === "derivative") list.push("Grid, curve, tangent, slope triangle");
  if (id === "dice" && types.has("count")) list.push("A fair die, and two dice if you switched");
  if (id === "measure") list.push("Vernier callipers, screw gauge, or spherometer");
  if (id === "pendulum") list.push("Pendulum or helical spring, stop-clock, metre scale");
  if (id === "cooling") list.push("Calorimeter and thermometer");
  if (id === "ph") list.push("Universal indicator and the solutions you tested");
  if (list.length === 1) list.push(both("Nothing used yet", "अभी कुछ उपयोग नहीं हुआ"));
  return list;
}

function PracticeSplit({
  schemeRows,
  events,
  rows,
  explained,
}: {
  schemeRows: { label: string; marks: number }[];
  events: number;
  rows: number;
  explained: boolean;
}) {
  return (
    <>
      <h3>Practice split</h3>
      <p>This is a rehearsal against the board’s headings. It is not a board award.</p>
      <ul>
        {schemeRows.map((row) => (
          <li key={row.label}>{row.label}: {row.marks} marks in the board scheme. {rows > 0 && explained ? "Your file has readings and a sentence to review." : "Still open."}</li>
        ))}
      </ul>
      <p>{events} actions in the log. You can redo the eve from the practical.</p>
    </>
  );
}
