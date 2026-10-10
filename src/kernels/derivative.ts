export type CurveId = "square" | "cube" | "line";

export interface Curve {
  id: CurveId;
  label: string;
  f: (x: number) => number;
  df: (x: number) => number;
}

export const CURVES: Record<CurveId, Curve> = {
  square: { id: "square", label: "y = x²", f: (x) => x * x, df: (x) => 2 * x },
  cube: { id: "cube", label: "y = x³", f: (x) => x * x * x, df: (x) => 3 * x * x },
  line: { id: "line", label: "y = 2x + 1", f: (x) => 2 * x + 1, df: () => 2 },
};

export function secantSlope(curve: Curve, x: number, run: number): number {
  if (Math.abs(run) < 1e-9) return curve.df(x);
  return (curve.f(x + run) - curve.f(x)) / run;
}

export function tangentTriangle(curve: Curve, x: number, run: number): {
  rise: number;
  run: number;
  slope: number;
} {
  const slope = curve.df(x);
  return { rise: slope * run, run, slope };
}
