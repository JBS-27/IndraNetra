"use client";

import type { PracticalDef } from "@/content/catalog";
import type { OpenExperiment } from "@/content/manual";
import { CITIES } from "@/content/cities";
import { pick, tx, type Sight } from "@/content/copy";
import { markScheme } from "@/content/marks";
import type { LabEvent } from "@/lab/events";
import { textOf } from "@/lab/events";
import { partnerReply } from "@/lab/partner";
import { describeBench } from "@/lab/poster";
import { bridgeStepDone, projectBridge } from "@/lab/bridge";
import { diceStepDone, projectDice } from "@/lab/dice";
import { lensStepDone, projectLens } from "@/lab/lens";
import { ohmStepDone, projectOhm } from "@/lab/ohm";
import { rateStepDone, projectRate } from "@/lab/rate";
import { saltStepDone, projectSalt } from "@/lab/saltlab";
import { tangentStepDone, projectTangent } from "@/lab/tangent";
import { titreStepDone, projectTitre } from "@/lab/titre";
import { useStore, type RunRecord } from "@/lib/store";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Topbar } from "./Chrome";
import { LabRoom } from "./LabRoom";

function stepMap(practicalId: string, events: LabEvent[], run: RunRecord): Record<string, boolean> {
  const ctx = {
    kit: run.kit,
    temperatureC: run.temperatureC,
    humidity: run.humidity,
    ncertStandard: run.ncertStandard,
    mock: run.mock,
  };
  if (practicalId === "ohm") return ohmStepDone(projectOhm(events, ctx), ctx);
  if (practicalId === "meter-bridge") return bridgeStepDone(projectBridge(events, ctx));
  if (practicalId === "convex-lens") return lensStepDone(projectLens(events, ctx));
  if (practicalId === "titration") return titreStepDone(projectTitre(events));
  if (practicalId === "salt") return saltStepDone(projectSalt(events));
  if (practicalId === "rate") return rateStepDone(projectRate(events, ctx), ctx);
  if (practicalId === "derivative") return tangentStepDone(projectTangent(events));
  if (practicalId === "dice") return diceStepDone(projectDice(events, run.seed));
  if (practicalId === "measure" || practicalId === "station") {
    const n = events.filter((event) => event.type === "reading").length;
    return { do: n > 0, record: n >= 3 };
  }
  if (practicalId === "pendulum") {
    const n = events.filter((event) => event.type === "swing").length;
    return { do: n > 0, record: n >= 3 };
  }
  if (practicalId === "cooling") {
    const n = events.filter((event) => event.type === "temp").length;
    return { do: n > 0, record: n >= 3 };
  }
  if (practicalId === "ph") {
    const n = events.filter((event) => event.type === "ph").length;
    return { do: n > 0, record: n >= 3 };
  }
  return {};
}

function looked(practicalId: string, events: LabEvent[]): boolean {
  const count = (type: string) => events.filter((event) => event.type === type).length;
  if (practicalId === "ohm") return events.some((event) => event.type === "bulb") || count("reading") >= 5;
  if (practicalId === "meter-bridge") return events.some((event) => event.type === "reverse") && count("balance") > 0;
  if (practicalId === "convex-lens") return count("row") >= 2;
  if (practicalId === "titration") return count("titre") >= 1;
  if (practicalId === "salt") return events.some((event) => event.type === "test" && (event.data.text === "bacl2" || event.data.text === "nh4oh"));
  if (practicalId === "rate") return count("stop") >= 2;
  if (practicalId === "derivative") return events.some((event) => event.type === "slope");
  if (practicalId === "dice") return events.some((event) => event.type === "count" && Number(event.data.n) >= 200);
  return false;
}

export function LabShell({
  practical,
  run,
  lesson,
  children,
}: {
  practical: PracticalDef;
  run: RunRecord;
  lesson?: OpenExperiment;
  children: (props: {
    events: LabEvent[];
    emit: (type: string, data?: Record<string, string | number | boolean>) => void;
    sight: Sight;
    guided: boolean;
    breakOn: boolean;
  }) => React.ReactNode;
}) {
  const { profile, setProfile, pushEvent, updateRun } = useStore();
  const lang = profile.language;
  const [cursor, setCursor] = useState<number | null>(null);
  const [sight, setSight] = useState<Sight>("lab");
  const [guided, setGuided] = useState(!run.mock);
  const [breakOn, setBreakOn] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [frozen, setFrozen] = useState(false);
  const events = cursor === null ? run.events : run.events.slice(0, cursor);
  const predicted = run.events.some((event) => event.type === "predict");
  const revision = textOf(run.events, "revise");
  const choice = run.events.find((event) => event.type === "predict")?.data.choice;
  const surprise = predicted && choice === practical.wrong && looked(practical.id, run.events) && !run.mock;
  const done = useMemo(() => stepMap(practical.id, events, run), [events, practical.id, run]);
  const ordered = practical.steps.filter((step) => !step.choice);
  const choices = practical.steps.filter((step) => step.choice);
  const scheme = markScheme(run.board, run.classLevel, lesson?.subject ?? practical.subject, lang);

  function emit(type: string, data: Record<string, string | number | boolean> = {}) {
    setCursor(null);
    pushEvent(run.id, type, data);
  }

  useEffect(() => {
    if (!run.classCode) return;
    const poster = describeBench({
      practicalId: run.practicalId,
      events: run.events,
      classCode: run.classCode,
      bench: run.benchLabel,
      studentName: run.studentName,
    });
    const timer = window.setTimeout(() => {
      void fetch("/api/bench", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...poster, runId: run.id }),
      }).catch(() => undefined);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [run]);

  useEffect(() => {
    if (!run.classCode) return;
    const tick = window.setInterval(() => {
      void fetch(`/api/bench?code=${encodeURIComponent(run.classCode)}`)
        .then((response) => response.json())
        .then((body: { frozen?: boolean }) => setFrozen(Boolean(body.frozen)))
        .catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(tick);
  }, [run.classCode]);

  const eveLeft = run.mock ? Math.max(0, 90 * 60 - Math.floor((Date.now() - run.startedAt) / 1000)) : 0;

  return (
    <>
      <Topbar back />
      <main className="wrap" style={{ paddingBottom: 48 }}>
        <p className="kicker">{lesson ? tx(lesson.book, lang) : tx(practical.ncert, lang)}</p>
        {lesson && <p className="caption">{tx(lesson.chapterTitle, lang)}</p>}
        <div className="spread">
          <h1 style={{ fontFamily: "var(--font-display), var(--font-hindi), serif", margin: "4px 0" }}>{tx(lesson ? lesson.title : practical.title, lang)}</h1>
          <Link className="btn" href={`/file/${run.id}`}>{pick(lang, "Honest File", "Honest File")}</Link>
        </div>
        <p>{tx(lesson ? lesson.aim : practical.moment, lang)}</p>
        <div className="lab-top">
          <div className="seg" role="group" aria-label="Second sight">
            {(["lab", "hidden", "exam"] as Sight[]).map((mode) => (
              <button
                key={mode}
                className="btn-quiet"
                type="button"
                aria-pressed={sight === mode}
                disabled={run.mock && mode === "hidden"}
                onClick={() => setSight(mode)}
              >
                {mode === "lab" ? "Lab eye" : mode === "hidden" ? "Hidden eye" : "Exam eye"}
              </button>
            ))}
          </div>
          <div className="seg">
            <button className="btn-quiet" type="button" aria-pressed={guided} onClick={() => setGuided(true)} disabled={run.mock}>
              {pick(lang, "Guided", "Guided")}
            </button>
            <button className="btn-quiet" type="button" aria-pressed={!guided} onClick={() => setGuided(false)}>
              {pick(lang, "Free", "Free")}
            </button>
          </div>
          <button className="btn-quiet" type="button" onClick={() => updateRun(run.id, (item) => ({ ...item, kit: item.kit === "school" ? "textbook" : "school" }))}>
            {run.kit === "school" ? "School Kit" : "Textbook Kit"}
          </button>
          <button
            className="btn-quiet"
            type="button"
            onClick={() =>
              updateRun(run.id, (item) => {
                const next = !item.ncertStandard;
                const city = CITIES.find((entry) => entry.id === item.cityId) ?? CITIES[0];
                return { ...item, ncertStandard: next, temperatureC: next ? 25 : city.summerC, humidity: next ? 50 : city.humidity };
              })
            }
          >
            {run.ncertStandard ? "NCERT 25°C" : `${run.temperatureC}°C`}
          </button>
          <button className="btn-quiet" type="button" aria-pressed={profile.sound} onClick={() => setProfile({ sound: !profile.sound })}>
            {profile.sound ? (pick(lang, "Sound on", "ध्वनि चालू")) : pick(lang, "Sound off", "ध्वनि बंद")}
          </button>
          {!run.mock && (
            <button className="btn-quiet" type="button" aria-pressed={breakOn} onClick={() => setBreakOn((value) => !value)}>
              Tod ke Samjho
            </button>
          )}
        </div>
        {run.mock && (
          <p className="notice">
            Practical eve. {Math.floor(eveLeft / 60)} min {eveLeft % 60}s left of the 90-minute practice. Hints and break-to-learn are off. A full board practical is longer; this is a calm rehearsal, not an award.
          </p>
        )}
        {frozen && <p className="notice">The teacher has frozen the class. Look up.</p>}
        <section className="card" style={{ marginBottom: 12 }}>
          <p className="kicker">Pehle Socho</p>
          <p>{tx(practical.prediction, lang)}</p>
          {!predicted ? (
            <div className="row">
              <button className="btn" type="button" onClick={() => emit("predict", { choice: "yes" })}>{pick(lang, "Yes", "हाँ")}</button>
              <button className="btn-quiet" type="button" onClick={() => emit("predict", { choice: "no" })}>{pick(lang, "No", "नहीं")}</button>
            </div>
          ) : (
            <p className="notice ok">
              {pick(lang, "Locked", "लॉक")}: {choice === "yes" ? pick(lang, "Yes", "हाँ") : pick(lang, "No", "नहीं")}.
              {revision ? ` ${pick(lang, "Revised because", "बदला क्योंकि")}: ${revision}` : ""}
            </p>
          )}
          {predicted && !revision && (
            <label className="field">
              {pick(lang, "Revise only by writing what changed your mind", "केवल यह लिखकर बदलो कि मन क्यों बदला")}
              <input onBlur={(event) => event.target.value.trim() && emit("revise", { text: event.target.value.trim() })} />
            </label>
          )}
        </section>
        {surprise && (
          <section className="notice" aria-live="polite">
            <strong>{pick(lang, "Misconception", "भ्रम")}</strong>
            <p>{tx(practical.misconception, lang)}</p>
          </section>
        )}
        <div className="lab-grid">
          <div style={{ opacity: predicted ? 1 : 0.45, pointerEvents: predicted ? "auto" : "none" }} aria-disabled={!predicted}>
            <LabRoom shelf={lesson ? tx(lesson.chapterTitle, lang) : tx(practical.title, lang)}>
              {children({ events, emit, sight, guided: guided && !run.mock, breakOn: breakOn && !run.mock })}
            </LabRoom>
          </div>
          <aside className="card">
            {guided && !run.mock && (
              <div className="steps">
                {ordered.map((step, index) => (
                  <article key={step.id} className="step" data-done={done[step.id] ? "true" : "false"}>
                    <strong>{index + 1}. {tx(step.text, lang)}</strong>
                    {step.safety && <p className="notice safe">{tx(step.safety, lang)}</p>}
                  </article>
                ))}
                {choices.length > 0 && (
                  <>
                    <p className="kicker">{pick(lang, "Choose the next step", "अगला चरण चुनो")}</p>
                    {choices.map((step) => (
                      <article key={step.id} className="step" data-done={done[step.id] ? "true" : "false"}>
                        {tx(step.text, lang)}
                      </article>
                    ))}
                  </>
                )}
              </div>
            )}
            <p className="caption">{scheme.heading}. {scheme.totalLabel}</p>
            {!run.mock && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  setAnswer(partnerReply(practical, run.events, question, lang));
                }}
              >
                <label className="field">
                  Lab Partner
                  <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={pick(lang, "Why did that happen?", "ऐसा क्यों हुआ?")} />
                </label>
                <button className="btn-quiet" type="submit">{pick(lang, "Ask", "पूछो")}</button>
                {answer && <p>{answer}</p>}
              </form>
            )}
            <label className="field">
              {pick(lang, "Say it, in one or two sentences", "एक-दो वाक्यों में कहो")}
              <textarea
                defaultValue={textOf(run.events, "explain")}
                onBlur={(event) => emit("explain", { text: event.target.value.trim() })}
              />
            </label>
            <label className="field">
              {pick(lang, "Result, in your own words", "परिणाम, अपने शब्दों में")}
              <textarea
                defaultValue={textOf(run.events, "result")}
                onBlur={(event) => emit("result", { text: event.target.value.trim() })}
              />
            </label>
            <label className="field">
              {tx(practical.exit, lang)}
              <input defaultValue={textOf(run.events, "exit")} onBlur={(event) => emit("exit", { text: event.target.value.trim() })} />
            </label>
            <label className="field">
              {pick(lang, "Replay", "Replay")}
              <input
                type="range"
                min={0}
                max={Math.max(run.events.length, 1)}
                value={cursor ?? run.events.length}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setCursor(value >= run.events.length ? null : value);
                }}
              />
            </label>
            <Link className="btn-quiet" href={`/file/${run.id}`}>{pick(lang, "Open the file and the viva", "File और viva खोलो")}</Link>
          </aside>
        </div>
      </main>
    </>
  );
}
