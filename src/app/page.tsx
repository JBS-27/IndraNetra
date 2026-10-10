"use client";

import { Glimpse, Topbar } from "@/components/Chrome";
import { pick } from "@/content/copy";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useEffect } from "react";

export default function HomePage() {
  const { profile } = useStore();
  const lang = profile.language;
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);
  return (
    <>
      <Topbar />
      <main className="wrap hero">
        <p className="kicker">CBSE · ISC · Class 11 and 12</p>
        <h1 className="promise">{pick(lang, "Experiment without fear.", "डर के बिना प्रयोग करो।")}</h1>
        <p className="lede">
          {pick(
            lang,
            "Glass will not cut you, chemicals will not be wasted, and a wrong connection is a lesson you can rewind. Leave able to set up the apparatus, take a reading that deserves marks, and say why the result came out that way.",
            "काँच काटेगा नहीं, रसायन बेकार नहीं जाएँगे, और गलत connection एक पाठ है जिसे तुम वापस ले सकते हो। सेटअप बनाना, ऐसी reading लेना जो अंक दे, और यह कहना कि परिणाम ऐसा क्यों आया।",
          )}
        </p>
        <Glimpse />
        <div className="paths">
          <Link className="path" href="/choose?role=student">
            <strong>{pick(lang, "I am a student", "मैं विद्यार्थी हूँ")}</strong>
            <span>{pick(lang, "A phone, a bus ride, or a missed practical. You still take the readings.", "फोन, बस, या छूटा practical। Readings फिर भी तुम लोगे।")}</span>
          </Link>
          <Link className="path" href="/choose?role=teacher">
            <em>{pick(lang, "I am a teacher", "मैं शिक्षक हूँ")}</em>
            <span>{pick(lang, "One period. A faint projector. Four students on one phone.", "एक period। हल्का projector। एक फोन पर चार विद्यार्थी।")}</span>
          </Link>
        </div>
        <p className="row">
          <Link href="/guide/student">{pick(lang, "Student card", "विद्यार्थी कार्ड")}</Link>
          <Link href="/guide/teacher">{pick(lang, "Teacher card", "शिक्षक कार्ड")}</Link>
        </p>
      </main>
    </>
  );
}
