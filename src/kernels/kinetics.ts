/**
 * School model for sodium thiosulphate + dilute HCl.
 * Time for the cross to disappear is inversely proportional to the volume
 * of 0.1 M thiosulphate (made up to 50 mL), and falls as the flask gets warmer.
 * Ea is a teaching value (45 kJ/mol), chosen so a 36°C classroom is obviously
 * faster than the 25°C textbook table. This is not a research fit.
 */
const EA_OVER_R = 45000 / 8.314;
const T_REF = 298.15;
const T_50_AT_25_S = 40;

export function disappearanceSeconds(thioVolumeMl: number, temperatureC: number): number {
  const volume = Math.min(50, Math.max(5, thioVolumeMl));
  const arrhenius = Math.exp(EA_OVER_R * (1 / (temperatureC + 273.15) - 1 / T_REF));
  return T_50_AT_25_S * (50 / volume) * arrhenius;
}

export function rateProxy(seconds: number): number {
  if (seconds <= 0) return 0;
  return 1 / seconds;
}
