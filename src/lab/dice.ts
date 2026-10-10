import { dieSequence, frequency, meanOf, twoDiceSums } from "@/kernels/probability";
import type { LabEvent } from "./events";
import { num } from "./events";

export interface DiceState {
  seed: number;
  shown: number;
  two: boolean;
  twoShown: number;
  prediction: "yes" | "no" | null;
}

export function projectDice(events: LabEvent[], seedFallback = 1): DiceState {
  let seed = seedFallback;
  let shown = 0;
  let two = false;
  let twoShown = 0;
  let prediction: "yes" | "no" | null = null;
  for (const event of events) {
    if (event.type === "predict") prediction = event.data.choice === "no" ? "no" : "yes";
    if (event.type === "seed") seed = num(event, "n", seed);
    if (event.type === "count") shown = num(event, "n", shown);
    if (event.type === "two") two = event.data.flag === true;
    if (event.type === "two-count") twoShown = num(event, "n", twoShown);
  }
  return { seed, shown, two, twoShown, prediction };
}

export function oneDie(state: DiceState): number[] {
  return dieSequence(state.seed, Math.max(state.shown, 0));
}

export function twoDice(state: DiceState): number[] {
  return twoDiceSums(state.seed, Math.max(state.twoShown, 0));
}

export function averages(rolls: number[], cuts: number[]): { n: number; mean: number }[] {
  return cuts
    .filter((n) => rolls.length >= n)
    .map((n) => ({ n, mean: meanOf(rolls.slice(0, n)) }));
}

export function diceStepDone(state: DiceState): Record<string, boolean> {
  return {
    twenty: state.shown >= 20,
    long: state.shown >= 2000,
    two: state.twoShown >= 200,
    say: state.shown >= 200 && state.twoShown >= 20,
  };
}

export function sevenRate(state: DiceState): number | null {
  if (state.twoShown < 1) return null;
  return frequency(twoDice(state), 7);
}
