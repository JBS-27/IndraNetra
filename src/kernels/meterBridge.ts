export interface EndCorrection {
  /** Extra centimetres-worth of resistance at the left end. */
  alphaCm: number;
  betaCm: number;
}

export const IDEAL_ENDS: EndCorrection = { alphaCm: 0, betaCm: 0 };
/** Worn end-contacts. Large enough that a careful student sees the null leave the textbook centimetre. */
export const SCHOOL_ENDS: EndCorrection = { alphaCm: 2.5, betaCm: 0.8 };

/**
 * Galvanometer needle from -1 (left) to +1 (right).
 * Zero is the null point. The student finds it; nothing snaps to it.
 * Left gap is the unknown resistance X, right gap is the known box R.
 */
export function bridgeNeedle(
  jockeyCm: number,
  unknownOhm: number,
  knownOhm: number,
  ends: EndCorrection,
  reversed: boolean,
): number {
  const x = reversed ? knownOhm : unknownOhm;
  const r = reversed ? unknownOhm : knownOhm;
  const left = Math.min(100, Math.max(0, jockeyCm)) + ends.alphaCm;
  const right = 100 - Math.min(100, Math.max(0, jockeyCm)) + ends.betaCm;
  const wireFraction = left / (left + right);
  const resFraction = x / (x + r);
  const imbalance = resFraction - wireFraction;
  return Math.max(-1, Math.min(1, imbalance / 0.08));
}

export function nullPointCm(
  unknownOhm: number,
  knownOhm: number,
  ends: EndCorrection,
  reversed: boolean,
): number {
  let best = 50;
  let bestAbs = Infinity;
  for (let cm = 0; cm <= 1000; cm++) {
    const pos = cm / 10;
    const needle = Math.abs(bridgeNeedle(pos, unknownOhm, knownOhm, ends, reversed));
    if (needle < bestAbs) {
      bestAbs = needle;
      best = pos;
    }
  }
  return best;
}

/** X = R · l / (100 − l), the working formula once end corrections are ignored. */
export function unknownFromBalance(knownOhm: number, balanceCm: number): number | null {
  if (balanceCm <= 0.5 || balanceCm >= 99.5) return null;
  return (knownOhm * balanceCm) / (100 - balanceCm);
}

export function clickLoudness(needle: number): number {
  const level = Math.min(1, Math.abs(needle) * 1.4);
  if (level < 0.04) return 0;
  return level;
}

/** ρ = R A / L with R in ohm, length in metre, diameter in metre. */
export function resistivity(resistanceOhm: number, lengthM: number, diameterM: number): number {
  const area = Math.PI * diameterM * diameterM / 4;
  return (resistanceOhm * area) / lengthM;
}

export const WIRE = {
  material: "nichrome",
  trueResistanceOhm: 2.24,
  lengthM: 0.4,
  diameterMm: 0.5,
  trueResistivity: 1.1e-6,
};
