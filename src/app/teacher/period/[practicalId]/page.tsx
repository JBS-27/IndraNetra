"use client";

import { Topbar } from "@/components/Chrome";
import { practicalById } from "@/content/catalog";
import { pick, tx } from "@/content/copy";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const PHASES = [
  { minutes: 4, en: "A misconception the class votes on.", hi: "एक भ्रम, जिस पर कक्षा वोट करे।" },
  { minutes: 22, en: "The experiment. Your projector, their phones.", hi: "प्रयोग। तुम्हारा projector, उनके फोन।" },
  { minutes: 8, en: "One graph, one viva question from a real reading, one line in the file.", hi: "एक graph, एक असली reading से viva, file में एक पंक्ति।" },
  { minutes: 4, en: "Exit ticket: what would change if…?", hi: "Exit ticket: अगर ऐसा हो तो क्या बदलेगा?" },
];

interface BenchRow {
  bench?: string;
  prediction?: string;
  setup?: string;
  reading?: string;
  explanation?: string;
  flag?: string;
  hash?: string;
  studentName?: string;
}

export default function PeriodPage() {
  const params = useParams<{ practicalId: string }>();
  const { profile } = useStore();
  const practical = practicalById(params.practicalId);
  const lang = profile.language;
  const [phase, setPhase] = useState(0);
  const [left, setLeft] = useState(PHASES[0].minutes * 60);
  const [running, setRunning] = useState(false);
  const [votes, setVotes] = useState({ yes: 0, no: 0 });
  const [benches, setBenches] = useState<BenchRow[]>([]);
  const [frozen, setFrozen] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          setRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    if (!profile.classCode) return;
    const tick = window.setInterval(() => {
      void fetch(`/api/bench?code=${profile.classCode}`)
        .then((response) => response.json())
        .then((body: { benches?: BenchRow[]; frozen?: boolean }) => {
          setBenches(body.benches || []);
          setFrozen(Boolean(body.frozen));
        })
        .catch(() => undefined);
    }, 3000);
    return () => window.clearInterval(tick);
  }, [profile.classCode]);

  if (!practical) return <main className="wrap">Unknown practical.</main>;
  const duplicates = benches.filter((row, index) => row.hash && benches.some((other, otherIndex) => other.hash === row.hash && otherIndex !== index));

  return (
    <>
      <Topbar />
      <main className="wrap" style={{ paddingBottom: 40 }}>
        <p className="kicker">{pick(lang, "Period Bell", "Period Bell")} · {profile.classCode || pick(lang, "no class code yet", "अभी code नहीं")}</p>
        <h1 className="period">{tx(practical.title, lang)}</h1>
        <p className="period">{lang === "hi" ? PHASES[phase].hi : PHASES[phase].en}</p>
        <p className="period-time">{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</p>
        <div className="row">
          <button className="btn" type="button" onClick={() => setRunning(true)}>{pick(lang, "Start", "शुरू")}</button>
          <button className="btn-quiet" type="button" onClick={() => setRunning(false)}>{pick(lang, "Pause", "रोको")}</button>
          <button
            className="btn-quiet"
            type="button"
            onClick={() => {
              const next = (phase + 1) % PHASES.length;
              setPhase(next);
              setLeft(PHASES[next].minutes * 60);
              setRunning(false);
            }}
          >
            {pick(lang, "Next beat", "अगली घंटी")}
          </button>
          <Link className="btn" href={`/lab/${practical.id}?present=1`}>{pick(lang, "Open on the projector", "Projector पर खोलो")}</Link>
        </div>
        {phase === 0 && (
          <section className="card">
            <p className="period">{tx(practical.prediction, lang)}</p>
            <div className="row">
              <button className="btn" type="button" onClick={() => setVotes((value) => ({ ...value, yes: value.yes + 1 }))}>Yes {votes.yes}</button>
              <button className="btn-quiet" type="button" onClick={() => setVotes((value) => ({ ...value, no: value.no + 1 }))}>No {votes.no}</button>
            </div>
          </section>
        )}
        <section className="card">
          <div className="spread">
            <h2>{pick(lang, "Benches", "Benches")}</h2>
            <button
              className="btn-quiet"
              type="button"
              onClick={() => {
                void fetch("/api/bench", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ classCode: profile.classCode, freeze: !frozen }),
                }).then(() => setFrozen((value) => !value));
              }}
            >
              {frozen ? pick(lang, "Unfreeze", "Freeze हटाओ") : pick(lang, "Freeze the class", "कक्षा रोको")}
            </button>
          </div>
          <div className="map">
            {benches.length === 0 && <p>{pick(lang, "Phones appear here when they can see this computer. Until then, walk the room.", "फोन तब दिखेंगे जब वे इस कंप्यूटर को देख सकें। तब तक कमरे में चलो।")}</p>}
            {benches.map((row) => (
              <article key={row.bench} className="card">
                <strong>{row.bench} {row.studentName ? `· ${row.studentName}` : ""}</strong>
                <span>{row.prediction}</span>
                <span>{row.setup}</span>
                <span>{row.reading}</span>
                <span>{row.explanation} {row.flag ? `· ${row.flag}` : ""}</span>
              </article>
            ))}
          </div>
          {duplicates.length > 0 && (
            <p className="notice">
              {pick(lang, "These benches share the same readings. Ask them to run it again. Do not read the names aloud.", "इन benches की readings एक जैसी हैं। उन्हें दोबारा करने को कहो। नाम ज़ोर से मत पढ़ो।")} {duplicates.map((row) => row.bench).join(", ")}
            </p>
          )}
        </section>
        <section className="card">
          <h2>{pick(lang, "If the power drops", "अगर बिजली जाए")}</h2>
          <p>{pick(lang, "Phones keep the Lite pack. The projector view can move to the largest phone. Sound stays off.", "फोन Lite pack रखे रहते हैं। Projector वाला दृश्य सबसे बड़े फोन पर जा सकता है। ध्वनि बंद रहती है।")}</p>
          <p>{tx(practical.exit, lang)}</p>
        </section>
      </main>
    </>
  );
}
