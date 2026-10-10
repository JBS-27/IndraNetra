import { benchImageCm, focalFromUV, lensFocal, parallaxCleared, parallaxGapCm } from "@/kernels/optics";
import { observedLength, vernierZero } from "@/kernels/vernier";
import type { LabEvent, RunConditions } from "./events";
import { num } from "./events";

export interface LensRow {
  id: string;
  objectCm: number;
  lensCm: number;
  pinCm: number;
  uCm: number;
  vCm: number;
  accepted: boolean;
  gapCm: number;
  cleared: boolean;
}

export interface LensState {
  objectCm: number;
  lensCm: number;
  pinCm: number;
  zeroTyped: number | null;
  correctionTyped: number | null;
  rows: LensRow[];
  eyeShift: boolean;
  prediction: "yes" | "no" | null;
  trueImageCm: number | null;
  gapCm: number;
  cleared: boolean;
  fCm: number;
}

export function projectLens(events: LabEvent[], ctx: RunConditions): LensState {
  let objectCm = 18;
  let lensCm = 50;
  let pinCm = 78;
  let zeroTyped: number | null = null;
  let correctionTyped: number | null = null;
  let eyeShift = false;
  let prediction: "yes" | "no" | null = null;
  const rows: LensRow[] = [];
  const struck = new Set(events.filter((event) => event.type === "strike").map((event) => String(event.data.id)));
  const fCm = lensFocal(ctx.kit);

  for (const event of events) {
    if (event.type === "predict") prediction = event.data.choice === "no" ? "no" : "yes";
    if (event.type === "object") objectCm = num(event, "n", objectCm);
    if (event.type === "lens") lensCm = num(event, "n", lensCm);
    if (event.type === "pin") pinCm = num(event, "n", pinCm);
    if (event.type === "zero") zeroTyped = num(event, "n");
    if (event.type === "correction") correctionTyped = num(event, "n");
    if (event.type === "eye") eyeShift = !eyeShift;
    if (event.type === "row" && !struck.has(event.id)) {
      const u = -num(event, "u");
      const v = num(event, "v");
      const trueImage = benchImageCm(num(event, "object"), num(event, "lens"), fCm);
      const gap = trueImage === null ? 99 : parallaxGapCm(num(event, "pin"), trueImage);
      rows.push({
        id: event.id,
        objectCm: num(event, "object"),
        lensCm: num(event, "lens"),
        pinCm: num(event, "pin"),
        uCm: u,
        vCm: v,
        accepted: event.data.accepted === true,
        gapCm: gap,
        cleared: parallaxCleared(gap),
      });
    }
  }

  const trueImageCm = benchImageCm(objectCm, lensCm, fCm);
  const gapCm = trueImageCm === null ? 99 : parallaxGapCm(pinCm, trueImageCm);
  return {
    objectCm,
    lensCm,
    pinCm,
    zeroTyped,
    correctionTyped,
    rows,
    eyeShift,
    prediction,
    trueImageCm,
    gapCm,
    cleared: parallaxCleared(gapCm),
    fCm,
  };
}

export function focalOfRow(row: LensRow): number | null {
  if (row.vCm === 0) return null;
  return focalFromUV(row.uCm, row.vCm);
}

export function meanFocal(state: LensState): number | null {
  const values = state.rows.map(focalOfRow).filter((value): value is number => value !== null && value > 0 && value < 80);
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function vernierClosed(ctx: RunConditions): number {
  return observedLength(0, vernierZero(ctx.kit).zeroErrorCm);
}

export function lensStepDone(state: LensState): Record<string, boolean> {
  const movedCloser = state.rows.length >= 2 && state.rows.some((row, index) => {
    if (index === 0) return false;
    return Math.abs(row.uCm) < Math.abs(state.rows[0].uCm) - 2;
  });
  return {
    zero: state.zeroTyped !== null,
    place: state.objectCm < state.lensCm - 20,
    parallax: state.rows.some((row) => row.cleared || row.accepted),
    repeat: state.rows.filter((row) => row.cleared || row.accepted).length >= 3,
    closer: movedCloser,
  };
}

export function lensErrors(state: LensState, ctx: RunConditions): { en: string; hi: string }[] {
  const errors: { en: string; hi: string }[] = [];
  if (state.rows.some((row) => row.accepted && !row.cleared)) {
    errors.push({
      en: "Parallax was accepted on purpose. That image distance is off, and the focal length carries it.",
      hi: "Parallax जानबूझकर स्वीकार किया गया। वह image distance हटी हुई है, और focal length उसे ढोती है।",
    });
  }
  if (ctx.kit === "school" && state.correctionTyped === null && state.rows.length > 0) {
    errors.push({
      en: "The vernier zero correction was not applied. The rider does not subtract it for you.",
      hi: "Vernier की zero correction नहीं लगाई गई। Rider इसे खुद नहीं घटाता।",
    });
  }
  return errors;
}
