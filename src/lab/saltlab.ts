import { PORTIONS_FULL, type TestId, rupeeCost, SALT_TESTS } from "@/kernels/salt";
import type { LabEvent } from "./events";

export interface SaltTestRow {
  id: string;
  test: TestId;
  guess: string;
}

export interface SaltState {
  read: string[];
  tests: SaltTestRow[];
  micro: boolean;
  replenished: boolean;
  prediction: "yes" | "no" | null;
  portionsLeft: number;
  rupees: number;
  dropped: boolean;
}

const COSTS_PORTION: TestId[] = ["dissolve", "flame", "dil-hcl", "bacl2", "naoh", "nh4oh", "agno3"];

export function projectSalt(events: LabEvent[]): SaltState {
  const read: string[] = [];
  const tests: SaltTestRow[] = [];
  let micro = false;
  let replenished = false;
  let prediction: "yes" | "no" | null = null;
  let dropped = false;
  let extra = 0;

  for (const event of events) {
    if (event.type === "predict") prediction = event.data.choice === "no" ? "no" : "yes";
    if (event.type === "label") read.push(String(event.data.text));
    if (event.type === "micro") micro = !micro;
    if (event.type === "replenish" && !replenished) {
      replenished = true;
      extra = 1;
    }
    if (event.type === "drop-beaker") dropped = true;
    if (event.type === "test") {
      tests.push({
        id: event.id,
        test: String(event.data.text) as TestId,
        guess: typeof event.data.guess === "string" ? event.data.guess : "",
      });
    }
  }

  const used = tests.reduce((sum, row) => {
    if (!COSTS_PORTION.includes(row.test)) return sum;
    return sum + 1;
  }, 0);
  const portionsLeft = Math.max(0, PORTIONS_FULL + extra - used);
  const rupees = tests.reduce((sum, row) => sum + rupeeCost(row.test, micro), 0);

  return { read, tests, micro, replenished, prediction, portionsLeft, rupees: Math.round(rupees * 100) / 100, dropped };
}

export function saltStepDone(state: SaltState): Record<string, boolean> {
  const ids = new Set(state.tests.map((row) => row.test));
  const named = state.tests.some((row) => row.test === "nh4oh" || row.test === "bacl2");
  return {
    look: ids.has("look"),
    flame: ids.has("flame") && state.tests.some((row) => row.test === "flame" && row.guess !== ""),
    anion: ids.has("dil-hcl") && ids.has("bacl2"),
    cation: ids.has("naoh") || ids.has("nh4oh"),
    name: named && ids.has("look"),
  };
}

export function saltErrors(state: SaltState): { en: string; hi: string }[] {
  const errors: { en: string; hi: string }[] = [];
  const order = state.tests.map((row) => row.test);
  const confirmatory = order.findIndex((id) => id === "bacl2" || id === "nh4oh");
  const look = order.indexOf("look");
  if (confirmatory >= 0 && (look < 0 || look > confirmatory)) {
    errors.push({
      en: "A confirmatory reagent was used before the salt was even described. Planning saves portions.",
      hi: "लवण का वर्णन करने से पहले confirmatory reagent चल गया। योजना portions बचाती है।",
    });
  }
  if (state.tests.some((row) => row.test !== "look" && !state.read.includes(row.test))) {
    errors.push({
      en: "A reagent was poured from a bottle whose label had not been read.",
      hi: "एक अभिकर्मक उस बोतल से डाला गया जिसका label नहीं पढ़ा गया था।",
    });
  }
  if (state.portionsLeft <= 0 && !state.tests.some((row) => row.test === "nh4oh")) {
    errors.push({
      en: "The sample ran out before the deep-blue confirmatory test.",
      hi: "गहरे नीले confirmatory test से पहले नमूना समाप्त हो गया।",
    });
  }
  if (state.dropped) {
    errors.push({
      en: "The beaker was knocked over. That portion is in the waste jar.",
      hi: "बीकर गिर गया। वह portion waste jar में है।",
    });
  }
  return errors;
}

export function observationFor(test: TestId) {
  return SALT_TESTS[test];
}
