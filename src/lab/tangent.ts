import { CURVES, type CurveId, secantSlope, tangentTriangle } from "@/kernels/derivative";
import type { LabEvent } from "./events";
import { lastOf, num } from "./events";

export interface TangentState {
  curve: CurveId;
  x: number;
  run: number;
  showChord: boolean;
  writtenSlope: number | null;
  prediction: "yes" | "no" | null;
}

export function projectTangent(events: LabEvent[]): TangentState {
  let curve: CurveId = "square";
  let x = 2;
  let run = 1;
  let showChord = false;
  let writtenSlope: number | null = null;
  let prediction: "yes" | "no" | null = null;
  for (const event of events) {
    if (event.type === "predict") prediction = event.data.choice === "no" ? "no" : "yes";
    if (event.type === "curve") {
      const next = String(event.data.text);
      if (next === "square" || next === "cube" || next === "line") curve = next;
    }
    if (event.type === "x") x = num(event, "n", x);
    if (event.type === "run") run = num(event, "n", run);
    if (event.type === "chord") showChord = !showChord;
    if (event.type === "slope") writtenSlope = num(event, "n");
  }
  const last = lastOf(events, "slope");
  if (last) writtenSlope = num(last, "n");
  return { curve, x, run: run === 0 ? 1 : run, showChord, writtenSlope, prediction };
}

export function triangleAt(state: TangentState) {
  return tangentTriangle(CURVES[state.curve], state.x, state.run);
}

export function chordAt(state: TangentState) {
  return secantSlope(CURVES[state.curve], state.x, state.run);
}

export function tangentStepDone(state: TangentState): Record<string, boolean> {
  return {
    drag: true,
    count: state.writtenSlope !== null,
    chord: state.showChord || (state.run > 0 && state.run < 0.4),
    other: state.curve !== "square" && state.writtenSlope !== null,
  };
}
