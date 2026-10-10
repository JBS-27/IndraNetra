export function roundTo(value: number, decimals: number): number {
  const p = 10 ** decimals;
  return Math.round(value * p) / p;
}

export function percentageError(experimental: number, reference: number): number | null {
  if (reference === 0) return null;
  return roundTo((Math.abs(experimental - reference) / Math.abs(reference)) * 100, 1);
}

/** Pull the first number out of a student's own sentence. */
export function firstNumber(text: string): number | null {
  const match = text.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  return Number(match[0]);
}

export function mentionsUnit(text: string, unit: string): boolean {
  return text.toLowerCase().includes(unit.toLowerCase());
}

export function teacherComment(options: {
  sentence: string;
  expected: number | null;
  unit: string;
  slope: number | null;
  lang: "en" | "hi";
}): string {
  const { sentence, expected, unit, slope, lang } = options;
  const found = firstNumber(sentence);
  const hi = lang === "hi";
  if (!sentence.trim()) {
    return hi
      ? "परिणाम की पंक्ति अभी खाली है। अपनी संख्या और unit लिखो।"
      : "The result line is still empty. Write your number and the unit.";
  }
  if (found === null) {
    return hi
      ? "इस पंक्ति में कोई संख्या नहीं है। परीक्षा वाली पंक्ति में संख्या और unit दोनों होते हैं।"
      : "There is no number in this line. An exam line carries both the number and the unit.";
  }
  if (unit && !mentionsUnit(sentence, unit) && !mentionsUnit(sentence, unit.replace("ohm", "Ω"))) {
    return hi
      ? `संख्या ${found} है, पर unit «${unit}» नहीं दिख रहा।`
      : `The number is ${found}, and the unit “${unit}” is missing.`;
  }
  if (slope !== null && Math.abs(found - slope) > Math.max(0.15, Math.abs(slope) * 0.08)) {
    return hi
      ? `Slope ${roundTo(slope, 2)} है, तुम्हारे परिणाम में ${found} है। जो त्रिभुज तुमने खींचा है, उसे फिर देखो।`
      : `The slope is ${roundTo(slope, 2)}, your result says ${found}. Look at the triangle you drew.`;
  }
  if (expected !== null && Math.abs(found - expected) > Math.max(0.15, Math.abs(expected) * 0.12)) {
    return hi
      ? `गणना ${roundTo(expected, 3)} दे रही है, पंक्ति में ${found} है। अपने substitution को फिर देखो। यह पंक्ति तुम्हारी ही रहेगी।`
      : `The calculation gives ${roundTo(expected, 3)}, and the line says ${found}. Look again at your substitution. The line stays yours.`;
  }
  return hi
    ? "संख्या, unit और गणना एक-दूसरे के पास हैं। पंक्ति तुम्हारी है।"
    : "The number, the unit, and the calculation sit together. The line stays yours.";
}
