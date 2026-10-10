"use client";

import { Topbar } from "@/components/Chrome";
import { CITIES } from "@/content/cities";
import { pick, type Board, type Subject } from "@/content/copy";
import { useStore } from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChooseForm() {
  const { profile, setProfile } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const lang = profile.language;
  const role = params.get("role") === "teacher" ? "teacher" : "student";

  return (
    <>
      <Topbar />
      <main className="wrap" style={{ paddingBottom: 40 }}>
        <h1>{role === "teacher" ? pick(lang, "Set up the period", "Period तैयार करो") : pick(lang, "Choose your list", "अपनी सूची चुनो")}</h1>
        <p>{pick(lang, "No government ID. A class code is enough when a teacher has one. English apparatus names stay visible inside Hindi.", "कोई सरकारी पहचान नहीं। शिक्षक का class code काफ़ी है। हिन्दी के वाक्य में अंग्रेज़ी apparatus नाम दिखते रहेंगे।")}</p>
        <div className="card">
          <div className="seg">
            {(["CBSE", "ISC"] as Board[]).map((board) => (
              <button key={board} className="btn-quiet" type="button" aria-pressed={profile.board === board} onClick={() => setProfile({ board })}>
                {board === "ISC" ? "ICSE / ISC" : "CBSE"}
              </button>
            ))}
            <p className="caption">CBSE follows the NCERT laboratory manuals, chapter by chapter. ICSE / ISC is the Council’s own Paper II for Classes 11 and 12. Class 10 ICSE is a different book and is not this shelf.</p>
          </div>
          <div className="seg">
            {[11, 12].map((level) => (
              <button key={level} className="btn-quiet" type="button" aria-pressed={profile.classLevel === level} onClick={() => setProfile({ classLevel: level as 11 | 12 })}>
                {pick(lang, `Class ${level}`, `कक्षा ${level}`)}
              </button>
            ))}
          </div>
          <div className="seg">
            {(["all", "physics", "chemistry", "mathematics"] as Array<Subject | "all">).map((subject) => (
              <button key={subject} className="btn-quiet" type="button" aria-pressed={profile.subject === subject} onClick={() => setProfile({ subject })}>{subject}</button>
            ))}
          </div>
          <label className="field">
            {pick(lang, "City conditions", "शहर की परिस्थिति")}
            <select value={profile.cityId} onChange={(event) => setProfile({ cityId: event.target.value })}>
              {CITIES.map((city) => (
                <option key={city.id} value={city.id}>{lang === "hi" ? city.hi : city.en} · {city.summerC}°C</option>
              ))}
            </select>
          </label>
          <label className="field">
            {pick(lang, "Your name, optional", "नाम, वैकल्पिक")}
            <input value={profile.studentName} onChange={(event) => setProfile({ studentName: event.target.value })} />
          </label>
          <label className="field">
            {pick(lang, "Class code, if you have one", "Class code, अगर हो")}
            <input value={profile.classCode} onChange={(event) => setProfile({ classCode: event.target.value.toUpperCase() })} />
          </label>
          {role === "teacher" && (
            <label className="row">
              <input type="checkbox" checked={profile.benchMode} onChange={(event) => setProfile({ benchMode: event.target.checked })} />
              {pick(lang, "Bench of four, roles rotate", "चार का bench, भूमिकाएँ घूमती हैं")}
            </label>
          )}
          <button
            className="btn"
            type="button"
            onClick={() => {
              setProfile({ chosen: true, role, kit: "school" });
              router.push(role === "teacher" ? "/teacher" : "/practicals");
            }}
          >
            {pick(lang, "Continue", "आगे")}
          </button>
        </div>
      </main>
    </>
  );
}

export default function ChoosePage() {
  return (
    <Suspense fallback={<main className="wrap">Opening…</main>}>
      <ChooseForm />
    </Suspense>
  );
}
