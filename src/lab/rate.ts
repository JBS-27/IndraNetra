import { disappearanceSeconds, rateProxy } from "@/kernels/kinetics";
import type { LabEvent, RunConditions } from "./events";
import { lastOf, lineFrom, num } from "./events";

export interface RateRow {
  id: string;
  volumeMl: number;
  temperatureC: number;
  seconds: number;
  judgement: "early" | "fair" | "late";
}

export interface RateState {
  volumeMl: number;
  temperatureC: number;
  running: boolean;
  startedAt: number | null;
  rows: RateRow[];
  line: ReturnType<typeof lineFrom>;
  prediction: "yes" | "no" | null;
  clockT: number;
}

export function projectRate(events: LabEvent[], ctx: RunConditions, now = Date.now()): RateState {
  let volumeMl = 40;
  let temperatureC = ctx.ncertStandard ? 25 : ctx.temperatureC;
  let running = false;
  let startedAt: number | null = null;
  let prediction: "yes" | "no" | null = null;
  const rows: RateRow[] = [];

  for (const event of events) {
    if (event.type === "predict") prediction = event.data.choice === "no" ? "no" : "yes";
    if (event.type === "volume") volumeMl = num(event, "n", volumeMl);
    if (event.type === "temp") temperatureC = num(event, "n", temperatureC);
    if (event.type === "start") {
      running = true;
      startedAt = event.at;
    }
    if (event.type === "stop") {
      running = false;
      const seconds = num(event, "n");
      const expected = disappearanceSeconds(num(event, "v", volumeMl), num(event, "t", temperatureC));
      const ratio = expected === 0 ? 1 : seconds / expected;
      rows.push({
        id: event.id,
        volumeMl: num(event, "v", volumeMl),
        temperatureC: num(event, "t", temperatureC),
        seconds,
        judgement: ratio < 0.85 ? "early" : ratio > 1.25 ? "late" : "fair",
      });
      startedAt = null;
    }
  }

  const clockT = running && startedAt ? Math.max(0, (now - startedAt) / 1000) : 0;
  return {
    volumeMl,
    temperatureC,
    running,
    startedAt,
    rows,
    line: lineFrom(lastOf(events, "graph")),
    prediction,
    clockT,
  };
}

export function expectedSeconds(state: RateState): number {
  return disappearanceSeconds(state.volumeMl, state.temperatureC);
}

export function turbidity(elapsed: number, total: number): number {
  if (total <= 0) return 0;
  const x = elapsed / total;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  return x * x * (3 - 2 * x);
}

export function rateStepDone(state: RateState, ctx: RunConditions): Record<string, boolean> {
  const volumes = new Set(state.rows.map((row) => row.volumeMl));
  const temps = new Set(state.rows.map((row) => row.temperatureC));
  const otherTemp = ctx.ncertStandard ? ctx.temperatureC : 25;
  return {
    mix: true,
    time: state.rows.length >= 1,
    dilute: volumes.size >= 2,
    warm: temps.size >= 2 || state.rows.some((row) => Math.abs(row.temperatureC - otherTemp) < 0.5),
    graph: state.line !== null,
  };
}

export function rateErrors(state: RateState, ctx: RunConditions): { en: string; hi: string }[] {
  const errors: { en: string; hi: string }[] = [];
  if (state.rows.some((row) => row.judgement === "early")) {
    errors.push({
      en: "The clock was stopped while the cross was still visible. Endpoint judgement is part of the error.",
      hi: "घड़ी तब रोकी गई जब cross अभी दिख रहा था। Endpoint का निर्णय error का हिस्सा है।",
    });
  }
  if (state.rows.some((row) => row.judgement === "late")) {
    errors.push({
      en: "The clock ran on after the cross had already gone.",
      hi: "Cross जा चुका था, और घड़ी उसके बाद भी चलती रही।",
    });
  }
  if (!ctx.ncertStandard && state.rows.every((row) => row.temperatureC !== 25)) {
    errors.push({
      en: `Every run was at ${ctx.temperatureC}°C. The NCERT table is at 25°C. The city toggle is there so you can match either.`,
      hi: `हर रन ${ctx.temperatureC}°C पर था। NCERT की तालिका 25°C पर है। शहर का स्विच इसलिए है कि तुम दोनों में से कोई मिला सको।`,
    });
  }
  return errors;
}

export function ratePoints(state: RateState): { x: number; y: number }[] {
  return state.rows
    .filter((row) => row.temperatureC === state.rows[0]?.temperatureC)
    .map((row) => ({ x: row.volumeMl, y: rateProxy(row.seconds) }));
}
