"use client";

import { Topbar } from "@/components/Chrome";
import { PRACTICALS } from "@/content/catalog";
import { pick, tx } from "@/content/copy";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

export default function TeacherPage() {
  const { profile, setProfile } = useStore();
  const lang = profile.language;
  const [name, setName] = useState("12-A");
  const [code, setCode] = useState(profile.classCode);
  const [note, setNote] = useState("");

  return (
    <>
      <Topbar />
      <main className="wrap" style={{ paddingBottom: 48 }}>
        <h1>{pick(lang, "Today’s period", "आज का period")}</h1>
        <p>{pick(lang, "A faint projector and a handful of phones. The script is the same if a substitute is taking the class.", "हल्का projector और कुछ फोन। अगर substitute शिक्षक हो, स्क्रिप्ट वही है।")}</p>
        <section className="card">
          <label className="field">Section name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
          <button
            className="btn"
            type="button"
            onClick={() => {
              void fetch("/api/classes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, board: profile.board, classLevel: profile.classLevel, subject: profile.subject }),
              })
                .then((response) => response.json())
                .then((body: { code?: string }) => {
                  if (body.code) {
                    setCode(body.code);
                    setProfile({ classCode: body.code, role: "teacher" });
                    setNote(pick(lang, `Class code ${body.code}. Write it on the board.`, `Class code ${body.code}. इसे बोर्ड पर लिखो।`));
                  }
                })
                .catch(() => setNote(pick(lang, "The class book needs the school computer online. The period script still works on this phone.", "कक्षा की किताब के लिए स्कूल का कंप्यूटर ऑनलाइन चाहिए। Period की स्क्रिप्ट इस फोन पर चलती है।")));
            }}
          >
            {pick(lang, "Create a class code", "Class code बनाओ")}
          </button>
          {code && <p className="live">{code}</p>}
          {note && <p>{note}</p>}
        </section>
        <h2>{pick(lang, "Assign a practical", "Practical दो")}</h2>
        <div className="grid-cards">
          {PRACTICALS.filter((item) => item.boards.includes(profile.board) && item.classes.includes(profile.classLevel)).map((item) => (
            <article key={item.id} className="card">
              <strong>{tx(item.title, lang)}</strong>
              <p>{tx(item.prediction, lang)}</p>
              <div className="row">
                <Link className="btn" href={`/teacher/period/${item.id}`}>{pick(lang, "Period Bell", "Period Bell")}</Link>
                <Link className="btn-quiet" href={`/lab/${item.id}`}>{pick(lang, "Open the bench", "Bench खोलो")}</Link>
              </div>
            </article>
          ))}
        </div>
        <p className="footer-note"><Link href="/guide/teacher">{pick(lang, "Two-page teacher card", "दो पृष्ठ का शिक्षक कार्ड")}</Link></p>
      </main>
    </>
  );
}
