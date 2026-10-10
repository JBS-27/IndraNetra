"use client";

import { Topbar } from "@/components/Chrome";
import { pick, tx, type Subject } from "@/content/copy";
import { chaptersFor } from "@/content/manual";
import { markScheme } from "@/content/marks";
import { useStore } from "@/lib/store";
import Link from "next/link";

const SUBJECTS: Array<{ id: Subject; en: string; hi: string; note: string }> = [
  { id: "physics", en: "Physics", hi: "भौतिकी", note: "Laboratory manual" },
  { id: "chemistry", en: "Chemistry", hi: "रसायन", note: "Laboratory manual" },
  { id: "mathematics", en: "Mathematics", hi: "गणित", note: "Activities and projects" },
];

export default function PracticalsPage() {
  const { profile, setProfile, ready } = useStore();
  const lang = profile.language;
  const subject: Subject = profile.subject === "all" ? "physics" : profile.subject;
  const chapters = chaptersFor(profile.board, profile.classLevel, subject);
  const scheme = markScheme(profile.board, profile.classLevel, subject, lang);
  const boardName = profile.board === "ISC" ? "ICSE / ISC" : "CBSE";
  if (!ready) return <main className="wrap">Opening the manual…</main>;

  return (
    <>
      <Topbar />
      <main className="wrap" style={{ paddingBottom: 48 }}>
        <div className="spread">
          <div>
            <p className="kicker">{boardName} · {pick(lang, `Class ${profile.classLevel}`, `कक्षा ${profile.classLevel}`)}</p>
            <h1 style={{ fontFamily: "var(--font-display), serif", margin: "4px 0 8px" }}>
              {profile.board === "CBSE"
                ? pick(lang, "The NCERT laboratory manual", "NCERT प्रयोगशाला मैनुअल")
                : pick(lang, "The Council’s practical list", "परिषद की practical सूची")}
            </h1>
          </div>
          <Link className="btn-quiet" href="/choose">{pick(lang, "Change board", "बोर्ड बदलो")}</Link>
        </div>
        <p>
          {profile.board === "CBSE"
            ? pick(lang, "Chapters follow the NCERT textbook. Each experiment is the one named in the NCERT laboratory manual for that chapter. Open it and take the readings.", "अध्याय NCERT पाठ्यपुस्तक के हैं। हर प्रयोग उस अध्याय का NCERT laboratory manual वाला प्रयोग है। उसे खोलो और readings लो।")
            : pick(lang, "Class 11 and 12 of the ICSE council are examined as ISC. This list is the Council’s Paper II, not the NCERT experiment numbers. The science is the same where the experiments coincide.", "ICSE परिषद की कक्षा 11 और 12 की परीक्षा ISC है। यह सूची परिषद का Paper II है, NCERT के प्रयोग-क्रमांक नहीं। जहाँ प्रयोग मिलते हैं, विज्ञान वही है।")}
        </p>
        <p className="caption">{scheme.heading}. {scheme.totalLabel}</p>
        <div className="subject-doors">
          {SUBJECTS.map((item) => (
            <button key={item.id} className="door" type="button" aria-pressed={subject === item.id} onClick={() => setProfile({ subject: item.id })}>
              <strong>{pick(lang, item.en, item.hi)}</strong>
              <span>{item.note}</span>
            </button>
          ))}
        </div>
        <div className="manual">
          {chapters.map((chapter) => (
            <article key={chapter.id} className="chapter-spread">
              <header className="chapter-spine">
                <strong>{tx(chapter.chapter, lang)}</strong>
                <p>{tx(chapter.book, lang)}</p>
                <p>{tx(chapter.blurb, lang)}</p>
              </header>
              <ol className="exp-list">
                {chapter.items.map((item) => (
                  <li key={item.id} className="exp-row">
                    <div>
                      <span className="kind-pill">{item.kind}</span>
                      <strong style={{ display: "block" }}>{tx(item.title, lang)}</strong>
                      <span>{tx(item.aim, lang)}</span>
                      <span className="caption" style={{ display: "block" }}>{tx(item.ref, lang)}</span>
                    </div>
                    <Link className="btn" href={`/lab/${item.id}`}>{pick(lang, "Perform", "करो")}</Link>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
        {chapters.length === 0 && <p>Nothing in this class and subject for {boardName} yet.</p>}
        <p className="footer-note"><Link href="/portfolio">Portfolio</Link></p>
      </main>
    </>
  );
}
