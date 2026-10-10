"use client";

import { CoolingBench } from "@/components/benches/CoolingBench";
import { DiceBench } from "@/components/benches/DiceBench";
import { DerivativeBench } from "@/components/benches/DerivativeBench";
import { MeasureBench } from "@/components/benches/MeasureBench";
import { MeterBench } from "@/components/benches/MeterBench";
import { OhmBench } from "@/components/benches/OhmBench";
import { OpticsBench } from "@/components/benches/OpticsBench";
import { PendulumBench } from "@/components/benches/PendulumBench";
import { PhBench } from "@/components/benches/PhBench";
import { RateBench } from "@/components/benches/RateBench";
import { SaltBench } from "@/components/benches/SaltBench";
import { StationBench } from "@/components/benches/StationBench";
import { TitrationBench } from "@/components/benches/TitrationBench";
import { LabShell } from "@/components/LabShell";
import { practicalById } from "@/content/catalog";
import { findExperiment } from "@/content/manual";
import { useStore } from "@/lib/store";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function Lab() {
  const params = useParams<{ practicalId: string }>();
  const search = useSearchParams();
  const store = useStore();
  const lesson = findExperiment(params.practicalId);
  const practical = practicalById(lesson?.bench ?? params.practicalId);
  const mock = search.get("eve") === "1";
  const [runId, setRunId] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!store.ready || !practical || started.current) return;
    started.current = true;
    const runKey = lesson?.id ?? practical.id;
    const found = store.runs.find((item) => item.practicalId === runKey && item.mock === mock);
    setRunId(found ? found.id : store.startRun(runKey, mock).id);
  }, [store, practical, mock]);

  if (!practical) return <main className="wrap">That practical is not in this pack.</main>;
  const run = store.runs.find((item) => item.id === runId);
  if (!run) return <main className="wrap">Opening the bench…</main>;
  const ctx = {
    kit: run.kit,
    temperatureC: run.temperatureC,
    humidity: run.humidity,
    ncertStandard: run.ncertStandard,
    mock: run.mock,
  };

  return (
    <>
      <div className="wrap no-print row" style={{ paddingTop: 8 }}>
        <button
          className="btn-quiet"
          type="button"
          onClick={() => {
            const next = store.startRun(lesson?.id ?? practical.id, mock);
            setRunId(next.id);
          }}
        >
          Start again
        </button>
        {!mock && (practical.subject === "physics" || practical.subject === "chemistry") && practical.classes.includes(12) && (
          <Link className="btn-quiet" href={`/lab/${practical.id}?eve=1`}>Practical eve</Link>
        )}
        <button
          className="btn-quiet"
          type="button"
          onClick={() => {
            if ("caches" in window) {
              void caches.open("indranetra-lite-v1").then((cache) => cache.add(window.location.href)).catch(() => undefined);
            }
          }}
        >
          Save Lite pack on this phone
        </button>
      </div>
      <LabShell practical={practical} run={run} lesson={lesson}>
        {({ events, emit, sight, guided, breakOn }) => (
          <>
            {practical.id === "ohm" && <OhmBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} />}
            {practical.id === "meter-bridge" && <MeterBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} />}
            {practical.id === "convex-lens" && <OpticsBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} />}
            {practical.id === "titration" && <TitrationBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} />}
            {practical.id === "salt" && <SaltBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} />}
            {practical.id === "rate" && <RateBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} />}
            {practical.id === "derivative" && <DerivativeBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} />}
            {practical.id === "dice" && <DiceBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} seed={run.seed} />}
            {practical.id === "measure" && <MeasureBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} mode={lesson?.mode} />}
            {practical.id === "pendulum" && <PendulumBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} mode={lesson?.mode} />}
            {practical.id === "cooling" && <CoolingBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} />}
            {practical.id === "ph" && <PhBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} />}
            {practical.id === "station" && <StationBench events={events} ctx={ctx} emit={emit} sight={sight} guided={guided} breakOn={breakOn} mode={lesson?.mode} />}
          </>
        )}
      </LabShell>
    </>
  );
}

export default function LabPage() {
  return (
    <Suspense fallback={<main className="wrap">Opening the bench…</main>}>
      <Lab />
    </Suspense>
  );
}
