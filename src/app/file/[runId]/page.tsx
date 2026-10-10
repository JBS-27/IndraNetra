"use client";

import { Topbar } from "@/components/Chrome";
import { HonestFile } from "@/components/HonestFile";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function FilePage() {
  const params = useParams<{ runId: string }>();
  const { runs, ready } = useStore();
  const run = runs.find((item) => item.id === params.runId);
  if (!ready) return <main className="wrap">Opening the file…</main>;
  if (!run) return <main className="wrap">This run is not on this phone.</main>;
  return (
    <>
      <Topbar />
      <main className="wrap" style={{ paddingBottom: 40 }}>
        <div className="row no-print">
          <button className="btn" type="button" onClick={() => window.print()}>Print / Save as PDF</button>
          <Link className="btn-quiet" href={`/lab/${run.practicalId}`}>Back to the bench</Link>
          <button
            className="btn-quiet"
            type="button"
            onClick={() => {
              const blob = new Blob([JSON.stringify(run)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `indranetra-${run.practicalId}.json`;
              link.click();
              URL.revokeObjectURL(url);
            }}
          >
            Download replay
          </button>
        </div>
        <HonestFile run={run} />
      </main>
    </>
  );
}
