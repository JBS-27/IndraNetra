/** Pitch 1 mm, 100 circular divisions, least count 0.01 mm. */
export const SCREW_LC_MM = 0.01;

export interface ScrewParts {
  observedMm: number;
  pitchScaleMm: number;
  circularDivision: number;
  leastCountMm: number;
}

export function screwZero(kit: "school" | "textbook"): { zeroErrorMm: number; correctionMm: number } {
  if (kit === "school") return { zeroErrorMm: 0.04, correctionMm: -0.04 };
  return { zeroErrorMm: 0, correctionMm: 0 };
}

export function observedDiameter(trueMm: number, zeroErrorMm: number): number {
  return round3(trueMm + zeroErrorMm);
}

export function decomposeScrew(observedMm: number): ScrewParts {
  const safe = Math.max(0, observedMm);
  let psr = Math.floor(safe + 1e-8);
  let csr = Math.round((safe - psr) / SCREW_LC_MM);
  if (csr >= 100) {
    psr += Math.floor(csr / 100);
    csr = csr % 100;
  }
  return {
    observedMm: round3(psr + csr * SCREW_LC_MM),
    pitchScaleMm: psr,
    circularDivision: csr,
    leastCountMm: SCREW_LC_MM,
  };
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
