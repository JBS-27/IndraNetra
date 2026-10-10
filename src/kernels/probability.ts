export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dieSequence(seed: number, n: number): number[] {
  const rand = mulberry32(seed);
  const rolls: number[] = [];
  for (let i = 0; i < n; i++) rolls.push(1 + Math.floor(rand() * 6));
  return rolls;
}

export function twoDiceSums(seed: number, n: number): number[] {
  const rand = mulberry32(seed ^ 0x9e3779b9);
  const sums: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = 1 + Math.floor(rand() * 6);
    const b = 1 + Math.floor(rand() * 6);
    sums.push(a + b);
  }
  return sums;
}

export function meanOf(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function frequency(values: number[], target: number): number {
  if (values.length === 0) return 0;
  return values.filter((v) => v === target).length / values.length;
}

export const FAIR_DIE_MEAN = 3.5;
export const SUM_SEVEN = 1 / 6;
