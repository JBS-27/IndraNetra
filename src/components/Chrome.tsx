"use client";

import { pick } from "@/content/copy";
import { useStore } from "@/lib/store";
import Link from "next/link";

export function Topbar({ back }: { back?: boolean }) {
  const { profile, setProfile } = useStore();
  const hi = profile.language === "hi";
  return (
    <header className="topbar wrap">
      <Link href="/" className="wordmark">
        <strong>IndraNetra</strong>
        <span>{hi ? "इंद्रनेत्र · कक्षा 11–12" : "A school laboratory, not a video"}</span>
      </Link>
      <div className="row">
        {back && (
          <Link className="btn-quiet" href="/practicals">
            {pick(profile.language, "Practicals", "Practicals")}
          </Link>
        )}
        <button
          className="btn-quiet"
          type="button"
          onClick={() => setProfile({ language: hi ? "en" : "hi" })}
        >
          {hi ? "English" : "हिन्दी"}
        </button>
        <button
          className="btn-quiet"
          type="button"
          onClick={() => setProfile({ theme: profile.theme === "daylight" ? "night" : "daylight" })}
        >
          {profile.theme === "daylight" ? (hi ? "शांत रात" : "Quiet Night") : hi ? "दिन का बोर्ड" : "Daylight Board"}
        </button>
      </div>
    </header>
  );
}

export function Glimpse() {
  return (
    <figure className="glimpse">
      <svg viewBox="0 0 640 280" role="img" aria-label="A drop falls into a pink flask and the colour clears">
        <rect width="640" height="280" fill="#d7c7a8" />
        <rect x="0" y="230" width="640" height="50" fill="#c4b18d" />
        <path d="M250 40 h28 v90 l-8 8 v70 h-12 v-70 l-8-8 z" fill="#f7f4ee" stroke="#2a241c" strokeWidth="2" />
        <rect x="256" y="70" width="16" height="46" fill="#f4f7fb" />
        <circle className="drop" cx="0" cy="0" r="5" fill="#9ec9ef">
          <animate attributeName="cy" values="150;210" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="cx" values="264;264" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" dur="1.6s" repeatCount="indefinite" />
        </circle>
        <path d="M300 150 h70 l30 90 h-130 l30-90 z" fill="#f6c1d8" stroke="#2a241c" strokeWidth="2">
          <animate attributeName="fill" values="#f6c1d8;#f6c1d8;#f7f4ee;#f7f4ee;#f6c1d8" dur="6.4s" repeatCount="indefinite" />
        </path>
        <text x="300" y="40" fill="#1c1712" fontSize="18">phenolphthalein · pH 8.3 → colourless</text>
      </svg>
      <figcaption className="caption">The last drop changes the flask. Colour is never the only signal — the pH is written beside it.</figcaption>
    </figure>
  );
}
