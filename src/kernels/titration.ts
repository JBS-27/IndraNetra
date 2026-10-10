export interface TitrationSetup {
  /** Standard oxalic acid, normally 0.1 N (M/20, n-factor 2). */
  normalOxalic: number;
  normalNaoh: number;
  aliquotMl: number;
  rinsed: boolean;
}

export const TITRATION = {
  normalOxalic: 0.1,
  /** School-kit unknown. Textbook kit uses the same bottle so the craft, not a secret, is the lesson. */
  normalNaoh: 0.112,
  aliquotMl: 20,
  dropMl: 0.05,
  leastCountMl: 0.1,
};

export function equivalenceMl(setup: TitrationSetup, firstFill: boolean): number {
  const diluted = !setup.rinsed && firstFill;
  const normalAcid = diluted ? setup.normalOxalic * 0.98 : setup.normalOxalic;
  return (setup.normalNaoh * setup.aliquotMl) / normalAcid;
}

export interface FlaskView {
  pH: number;
  colour: "pink" | "pale-pink" | "colourless";
  colourName: "pink" | "pale pink" | "colourless";
  pastEndpoint: boolean;
}

/**
 * Oxalic acid from the burette into NaOH + phenolphthalein.
 * Pink while the flask is still basic. The last drop carries it through the
 * phenolphthalein change. pH is shown because colour is never the only signal.
 */
export function flaskView(acidMl: number, eqMl: number, aliquotMl: number): FlaskView {
  const excessAcid = acidMl - eqMl;
  let pH: number;
  if (excessAcid < -0.02) {
    const excessMeq = (eqMl - acidMl) * 0.1;
    const volumeMl = Math.max(aliquotMl + acidMl, 1);
    const hydroxide = Math.max(excessMeq / volumeMl, 1e-8);
    pH = 14 + Math.log10(hydroxide);
  } else if (excessAcid < 0.08) {
    pH = 8.5 - excessAcid * 18;
  } else {
    pH = Math.max(3.2, 6.4 - (excessAcid - 0.08) * 4);
  }
  pH = Math.round(pH * 10) / 10;
  const colour = pH >= 9 ? "pink" : pH >= 8.2 ? "pale-pink" : "colourless";
  const colourName = colour === "pale-pink" ? "pale pink" : colour;
  return { pH, colour, colourName, pastEndpoint: excessAcid > 0.25 };
}

export interface TitreJudgement {
  titreMl: number;
  overshot: boolean;
  dropwiseFinish: boolean;
  discordantHint: boolean;
}

export function judgeTitre(increments: number[], eqMl: number): TitreJudgement {
  const titreMl = round1(increments.reduce((sum, n) => sum + n, 0));
  let dropwiseFinish = true;
  let cursor = 0;
  for (const step of increments) {
    const next = cursor + step;
    if (next > eqMl - 1 && step > 0.12) dropwiseFinish = false;
    cursor = next;
  }
  const overshot = titreMl > eqMl + 0.3 || !dropwiseFinish;
  return {
    titreMl,
    overshot,
    dropwiseFinish,
    discordantHint: overshot,
  };
}

/** Two titres are concordant when they agree within 0.1 mL, the usual school rule. */
export function concordantPair(values: number[], tolerance = 0.1): number[] {
  const good: number[] = [];
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      if (Math.abs(values[i] - values[j]) <= tolerance + 1e-9) {
        if (!good.includes(values[i])) good.push(values[i]);
        if (!good.includes(values[j])) good.push(values[j]);
      }
    }
  }
  return good;
}

export function meanOf(values: number[]): number | null {
  if (values.length === 0) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(mean * 100) / 100;
}

/** N1 V1 = N2 V2. Strength of NaOH in g/L is normality × 40. */
export function naohFromTitre(meanTitreMl: number, aliquotMl: number, normalOxalic = 0.1): {
  normality: number;
  gramsPerLitre: number;
} {
  const normality = (normalOxalic * meanTitreMl) / aliquotMl;
  return {
    normality: Math.round(normality * 1000) / 1000,
    gramsPerLitre: Math.round(normality * 40 * 100) / 100,
  };
}

/** Looking down on a burette makes the reading look smaller. */
export function parallaxShiftMl(eye: "level" | "high" | "low"): number {
  if (eye === "high") return -0.2;
  if (eye === "low") return 0.2;
  return 0;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
