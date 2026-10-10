import {
  IDEAL_ENDS,
  SCHOOL_ENDS,
  WIRE,
  bridgeNeedle,
  clickLoudness,
  resistivity,
  unknownFromBalance,
} from "@/kernels/meterBridge";
import { decomposeScrew, observedDiameter, screwZero } from "@/kernels/screwGauge";
import type { LabEvent, RunConditions } from "./events";
import { num } from "./events";

export interface BalanceRow {
  id: string;
  knownOhm: number;
  lengthCm: number;
  reversed: boolean;
  nearNull: boolean;
}

export interface BridgeState {
  knownOhm: number;
  jockeyCm: number;
  keyClosed: boolean;
  reversed: boolean;
  balances: BalanceRow[];
  lengthM: number | null;
  diameterMm: number | null;
  zeroTyped: number | null;
  prediction: "yes" | "no" | null;
  needle: number;
  loudness: number;
  unknownOhm: number;
  screwObservedMm: number;
}

export function projectBridge(events: LabEvent[], ctx: RunConditions): BridgeState {
  let knownOhm = 2;
  let jockeyCm = 20;
  let keyClosed = false;
  let reversed = false;
  const balances: BalanceRow[] = [];
  let lengthM: number | null = null;
  let diameterMm: number | null = null;
  let zeroTyped: number | null = null;
  let prediction: "yes" | "no" | null = null;
  const struck = new Set(events.filter((event) => event.type === "strike").map((event) => String(event.data.id)));

  for (const event of events) {
    if (event.type === "predict") prediction = event.data.choice === "no" ? "no" : "yes";
    if (event.type === "known") knownOhm = num(event, "n", knownOhm);
    if (event.type === "jockey") jockeyCm = num(event, "n", jockeyCm);
    if (event.type === "key") keyClosed = !keyClosed;
    if (event.type === "reverse") reversed = !reversed;
    if (event.type === "zero") zeroTyped = num(event, "n");
    if (event.type === "length") lengthM = num(event, "n");
    if (event.type === "diameter") diameterMm = num(event, "n");
    if (event.type === "balance" && !struck.has(event.id)) {
      balances.push({
        id: event.id,
        knownOhm: num(event, "r", knownOhm),
        lengthCm: num(event, "n"),
        reversed: event.data.reversed === true,
        nearNull: event.data.near === true,
      });
    }
  }

  const ends = ctx.kit === "school" ? SCHOOL_ENDS : IDEAL_ENDS;
  const needle = keyClosed ? bridgeNeedle(jockeyCm, WIRE.trueResistanceOhm, knownOhm, ends, reversed) : 0;
  const zero = screwZero(ctx.kit);
  return {
    knownOhm,
    jockeyCm,
    keyClosed,
    reversed,
    balances,
    lengthM,
    diameterMm,
    zeroTyped,
    prediction,
    needle,
    loudness: keyClosed ? clickLoudness(needle) : 0,
    unknownOhm: WIRE.trueResistanceOhm,
    screwObservedMm: observedDiameter(0, zero.zeroErrorMm),
  };
}

export function wireDiameterObserved(ctx: RunConditions): number {
  return observedDiameter(WIRE.diameterMm, screwZero(ctx.kit).zeroErrorMm);
}

export function screwAt(ctx: RunConditions, trueMm: number) {
  return decomposeScrew(observedDiameter(trueMm, screwZero(ctx.kit).zeroErrorMm));
}

export function balanceValue(row: BalanceRow): number | null {
  return unknownFromBalance(row.knownOhm, row.lengthCm);
}

export function rhoFrom(state: BridgeState): number | null {
  const forward = state.balances.find((row) => !row.reversed);
  const x = forward ? balanceValue(forward) : null;
  if (x === null || state.lengthM === null || state.diameterMm === null || state.lengthM <= 0) return null;
  return resistivity(x, state.lengthM, state.diameterMm / 1000);
}

export function bridgeStepDone(state: BridgeState): Record<string, boolean> {
  return {
    box: state.knownOhm > 0,
    null: state.balances.some((row) => !row.reversed),
    reverse: state.balances.some((row) => row.reversed),
    screw: state.zeroTyped !== null && state.diameterMm !== null,
    rho: state.lengthM !== null && rhoFrom(state) !== null,
  };
}

export function bridgeErrors(state: BridgeState, ctx: RunConditions): { en: string; hi: string }[] {
  const errors: { en: string; hi: string }[] = [];
  if (state.balances.some((row) => !row.nearNull)) {
    errors.push({
      en: "A balance length was written while the galvanometer had not settled. That length is not a null point.",
      hi: "एक balance length तब लिखी गई जब galvanometer शांत नहीं था। वह लंबाई null point नहीं है।",
    });
  }
  if (ctx.kit === "school" && state.balances.length > 0) {
    errors.push({
      en: "This is the school kit. The end contacts add a little resistance, so X = R·l/(100−l) sits slightly off the wire’s true resistance.",
      hi: "यह school kit है। सिरों के contact थोड़ा resistance जोड़ते हैं, इसलिए X = R·l/(100−l) तार के असली resistance से थोड़ा हटता है।",
    });
  }
  if (state.zeroTyped === null && state.diameterMm !== null && ctx.kit === "school") {
    errors.push({
      en: "The screw gauge zero error was not written, so the diameter still carries it.",
      hi: "Screw gauge की zero error नहीं लिखी गई, इसलिए व्यास में वह अभी भी है।",
    });
  }
  return errors;
}
