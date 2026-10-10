/** School-lab formulae at Class 11–12 level. Visuals read these; they do not invent them. */

export const G = 9.8;

export function pendulumPeriod(lengthM: number): number {
  return 2 * Math.PI * Math.sqrt(Math.max(lengthM, 0.05) / G);
}

export function gFromPendulum(lengthM: number, periodS: number): number | null {
  if (periodS <= 0) return null;
  return (4 * Math.PI ** 2 * lengthM) / (periodS ** 2);
}

/** Newton’s law of cooling: the excess temperature falls exponentially toward the room. */
export function coolingTemperature(elapsedS: number, roomC: number, startC = 80, k = 0.0035): number {
  return roomC + (startC - roomC) * Math.exp(-k * Math.max(0, elapsedS));
}

export function boyleVolume(pressureKPa: number, constant = 2400): number {
  return constant / Math.max(pressureKPa, 1);
}

/** Capillary rise of water in a narrow bore. σ for water near 25°C is about 0.072 N/m. */
export function capillaryRiseMm(radiusMm: number, temperatureC: number): number {
  const sigma = 0.072 * (1 - 0.002 * (temperatureC - 25));
  const radiusM = Math.max(radiusMm, 0.05) / 1000;
  const h = (2 * sigma) / (1000 * G * radiusM);
  return h * 1000;
}

export function youngModulus(forceN: number, areaM2: number, extensionM: number, lengthM: number): number | null {
  if (areaM2 <= 0 || extensionM <= 0 || lengthM <= 0) return null;
  return (forceN / areaM2) / (extensionM / lengthM);
}

/** First resonance in a closed pipe: L + e = v / 4f. */
export function resonanceLengthCm(frequencyHz: number, temperatureC: number, endCorrectionCm = 0.3): number {
  const speed = 331 + 0.6 * temperatureC;
  return (speed / (4 * frequencyHz)) * 100 - endCorrectionCm;
}

export function limitingFriction(normalN: number, mu: number): number {
  return mu * normalN;
}

export function inclineForce(massKg: number, angleDeg: number): number {
  return massKg * G * Math.sin((angleDeg * Math.PI) / 180);
}

export interface Juice {
  id: string;
  en: string;
  hi: string;
  pH: number;
  colour: string;
  colourName: string;
}

/** Universal-indicator colours used in the NCERT pH experiments. The number is shown as well as the colour. */
export const JUICES: Juice[] = [
  { id: "hcl", en: "Dilute HCl", hi: "तनु HCl", pH: 1.2, colour: "#d24a3a", colourName: "red" },
  { id: "lemon", en: "Lemon juice", hi: "नींबू का रस", pH: 2.4, colour: "#e0703a", colourName: "orange-red" },
  { id: "vinegar", en: "Vinegar", hi: "सिरका", pH: 3.1, colour: "#e28a3c", colourName: "orange" },
  { id: "nacl", en: "Sodium chloride solution", hi: "Sodium chloride विलयन", pH: 7.0, colour: "#3f9a4a", colourName: "green" },
  { id: "water", en: "Distilled water", hi: "आसुत जल", pH: 7.0, colour: "#3f9a4a", colourName: "green" },
  { id: "fecl3", en: "Ferric chloride solution", hi: "Ferric chloride विलयन", pH: 2.8, colour: "#e07a32", colourName: "orange" },
  { id: "carbonate", en: "Sodium carbonate solution", hi: "Sodium carbonate विलयन", pH: 11.2, colour: "#5b4db8", colourName: "violet" },
  { id: "naoh", en: "Dilute NaOH", hi: "तनु NaOH", pH: 13.0, colour: "#3d348f", colourName: "purple" },
];
