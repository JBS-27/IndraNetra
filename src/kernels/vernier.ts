/** CBSE vernier caliper: 1 MSD = 0.1 cm, 10 VSD = 9 MSD, least count 0.01 cm. */
export const VERNIER_MSD_CM = 0.1;
export const VERNIER_LC_CM = 0.01;

export interface VernierParts {
  observedCm: number;
  msrCm: number;
  coincidingDivision: number;
  leastCountCm: number;
}

/**
 * Positive zero error: with the jaws closed the instrument already reads this many cm.
 * Observed = true + zero error. The student subtracts it. The software must not.
 */
export function observedLength(trueCm: number, zeroErrorCm: number): number {
  return round2(trueCm + zeroErrorCm);
}

export function decomposeVernier(observedCm: number): VernierParts {
  const safe = Math.max(0, observedCm);
  const msrCm = round2(Math.floor(safe / VERNIER_MSD_CM + 1e-8) * VERNIER_MSD_CM);
  let division = Math.round((safe - msrCm) / VERNIER_LC_CM);
  let msr = msrCm;
  if (division === 10) {
    msr = round2(msr + VERNIER_MSD_CM);
    division = 0;
  }
  return {
    observedCm: round2(msr + division * VERNIER_LC_CM),
    msrCm: msr,
    coincidingDivision: division,
    leastCountCm: VERNIER_LC_CM,
  };
}

export function correctedLength(observedCm: number, zeroCorrectionCm: number): number {
  return round2(observedCm + zeroCorrectionCm);
}

/** School optical-bench riders. Positive zero error, so the correction is negative. */
export function vernierZero(kit: "school" | "textbook"): { zeroErrorCm: number; correctionCm: number } {
  if (kit === "school") return { zeroErrorCm: 0.05, correctionCm: -0.05 };
  return { zeroErrorCm: 0, correctionCm: 0 };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
