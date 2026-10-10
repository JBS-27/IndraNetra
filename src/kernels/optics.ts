/**
 * New Cartesian sign convention, as in the NCERT treatment.
 * Light travels left to right. A real object has negative u.
 * A convex lens has positive f. A real image has positive v.
 * 1/v − 1/u = 1/f
 */
export function imageDistanceCm(uCm: number, fCm: number): number | null {
  const inv = 1 / fCm + 1 / uCm;
  if (Math.abs(inv) < 1e-6) return null;
  return 1 / inv;
}

export function focalFromUV(uCm: number, vCm: number): number | null {
  const inv = 1 / vCm - 1 / uCm;
  if (Math.abs(inv) < 1e-8) return null;
  return 1 / inv;
}

export function lensFocal(kit: "school" | "textbook"): number {
  return kit === "school" ? 15 : 15;
}

/** Positions along the bench in centimetres. Lens stays at `lensCm`. */
export function benchImageCm(objectCm: number, lensCm: number, fCm: number): number | null {
  const u = objectCm - lensCm;
  if (u >= -0.5) return null;
  const v = imageDistanceCm(u, fCm);
  if (v === null || v < 0) return null;
  return lensCm + v;
}

export function parallaxGapCm(imagePinCm: number, trueImageCm: number): number {
  return imagePinCm - trueImageCm;
}

export function parallaxCleared(gapCm: number): boolean {
  return Math.abs(gapCm) <= 0.15;
}

/**
 * Moving a real object closer to a convex lens, while it stays outside the focus,
 * moves the real image farther from the lens.
 */
export function imageMovesFartherWhenObjectCloser(
  u1: number,
  u2: number,
  fCm: number,
): boolean {
  const v1 = imageDistanceCm(u1, fCm);
  const v2 = imageDistanceCm(u2, fCm);
  if (v1 === null || v2 === null) return false;
  const closer = Math.abs(u2) < Math.abs(u1) ? v2 : v1;
  const fartherObject = Math.abs(u2) < Math.abs(u1) ? v1 : v2;
  return closer > fartherObject;
}
