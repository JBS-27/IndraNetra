"use client";

import { Topbar } from "@/components/Chrome";
import { practicalById } from "@/content/catalog";
import { tx } from "@/content/copy";
import { textOf } from "@/lab/events";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function PortfolioPage() {
  const { runs, profile } = useStore();
  return (
    <>
      <Topbar />
      <main className="wrap" style={{ paddingBottom: 40 }}>
        <h1>Portfolio</h1>
        <p>Date, prediction, result, and your sentence. No class rank.</p>
        <div className="grid-cards">
          {runs.map((run) => {
            const practical = practicalById(run.practicalId);
            const prediction = run.events.find((event) => event.type === "predict");
            return (
              <Link key={run.id} href={`/file/${run.id}`} className="card">
                <span className="kicker">{new Date(run.startedAt).toLocaleDateString()}</span>
                <strong>{practical ? tx(practical.title, profile.language) : run.practicalId}</strong>
                <span>Prediction: {prediction ? String(prediction.data.choice) : "—"}</span>
                <span>{textOf(run.events, "result") || "Result not written"}</span>
                <span>{textOf(run.events, "explain") || ""}</span>
              </Link>
            );
          })}
        </div>
        {runs.length === 0 && <p>No runs yet.</p>}
      </main>
    </>
  );
}
