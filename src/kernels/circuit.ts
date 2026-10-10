import { solveLinear } from "./linear";

export type KitSkin = "school" | "textbook";

export interface WireLink {
  id: string;
  a: string;
  b: string;
  loose: boolean;
}

export interface CircuitParts {
  keyClosed: boolean;
  rheostatOhms: number;
  bulbInCircuit: boolean;
  /** Student left the key closed until the coil warmed. */
  coilHot: boolean;
  kit: KitSkin;
  /** Room temperature. Metals resist a little more above 25°C. */
  temperatureC: number;
}

export interface CircuitReading {
  connected: boolean;
  openKey: boolean;
  fuseBlown: boolean;
  shorted: boolean;
  voltmeterInSeries: boolean;
  ammeterAcrossSource: boolean;
  trueCurrentA: number;
  trueVoltageV: number;
  /** What the needle shows, including zero error. */
  ammeterNeedleA: number;
  voltmeterNeedleV: number;
  ammeterZeroErrorA: number;
  voltmeterZeroErrorV: number;
  ammeterLeastCountA: number;
  voltmeterLeastCountV: number;
  coilOhms: number;
  batteryEmfV: number;
  currentUsedUp: boolean;
  bulbCurrentA: number;
  seriesCurrentA: number;
}

interface BranchR {
  kind: "R";
  a: string;
  b: string;
  ohms: number;
  id: string;
}
interface BranchV {
  kind: "V";
  pos: string;
  neg: string;
  emf: number;
  seriesOhms: number;
  id: string;
}

const FUSE_AMPS = 2;
const LOOSE_OHMS = 8;

export function batteryOf(kit: KitSkin): { emf: number; internal: number } {
  if (kit === "school") return { emf: 4.35, internal: 0.8 };
  return { emf: 4.5, internal: 0.15 };
}

export function meterFace(kit: KitSkin): {
  ammeterZero: number;
  voltmeterZero: number;
  ammeterLc: number;
  voltmeterLc: number;
  ammeterOhms: number;
  voltmeterOhms: number;
} {
  if (kit === "school") {
    return {
      ammeterZero: 0.04,
      voltmeterZero: 0,
      ammeterLc: 0.02,
      voltmeterLc: 0.05,
      ammeterOhms: 0.12,
      voltmeterOhms: 10000,
    };
  }
  return {
    ammeterZero: 0,
    voltmeterZero: 0,
    ammeterLc: 0.02,
    voltmeterLc: 0.05,
    ammeterOhms: 0.05,
    voltmeterOhms: 1_000_000,
  };
}

/** Cold resistance of the coil at the room temperature, before self-heating. */
export function coldCoilOhms(temperatureC: number): number {
  const alpha = 0.0004;
  return 4 * (1 + alpha * (temperatureC - 25));
}

export function hotCoilOhms(base: number, currentA: number, coilHot: boolean): number {
  const extra = (coilHot ? 55 : 0) + 140 * currentA * currentA * base;
  return base * (1 + 0.0032 * extra);
}

function unionFind(pairs: Array<[string, string]>) {
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x);
    const p = parent.get(x)!;
    if (p !== x) {
      const root = find(p);
      parent.set(x, root);
      return root;
    }
    return x;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };
  for (const [a, b] of pairs) union(a, b);
  return find;
}

interface Solved {
  currents: Record<string, number>;
  volts: Record<string, number>;
  blown: boolean;
}

function solveWithInternalNodes(branches: Array<BranchR | BranchV>, ground: string): Solved | null {
  const resistors: BranchR[] = [];
  const sources: BranchV[] = [];
  for (const branch of branches) {
    if (branch.kind === "R") resistors.push(branch);
    else {
      const internal = `${branch.id}__int`;
      sources.push({ ...branch, pos: internal, seriesOhms: 0 });
      resistors.push({
        kind: "R",
        id: `${branch.id}__r`,
        a: internal,
        b: branch.pos,
        ohms: Math.max(branch.seriesOhms, 1e-4),
      });
    }
  }

  const nodes = new Set<string>([ground]);
  for (const branch of resistors) {
    nodes.add(branch.a);
    nodes.add(branch.b);
  }
  for (const source of sources) {
    nodes.add(source.pos);
    nodes.add(source.neg);
  }
  const nodeList = [...nodes].filter((n) => n !== ground);
  const index = new Map<string, number>();
  nodeList.forEach((n, i) => index.set(n, i));
  const nUnknown = nodeList.length + sources.length;
  const matrix = Array.from({ length: nUnknown }, () => new Array(nUnknown).fill(0));
  const vector = new Array(nUnknown).fill(0);

  const add = (r: number, c: number, value: number) => {
    matrix[r][c] += value;
  };
  const nodeRow = (n: string) => (n === ground ? -1 : index.get(n)!);

  for (const node of nodeList) add(index.get(node)!, index.get(node)!, 1e-9);

  for (const branch of resistors) {
    const g = 1 / Math.max(branch.ohms, 1e-6);
    const a = nodeRow(branch.a);
    const b = nodeRow(branch.b);
    if (a >= 0) add(a, a, g);
    if (b >= 0) add(b, b, g);
    if (a >= 0 && b >= 0) {
      add(a, b, -g);
      add(b, a, -g);
    }
  }

  sources.forEach((source, s) => {
    const row = nodeList.length + s;
    const pos = nodeRow(source.pos);
    const neg = nodeRow(source.neg);
    if (pos >= 0) {
      add(pos, row, 1);
      add(row, pos, 1);
    }
    if (neg >= 0) {
      add(neg, row, -1);
      add(row, neg, -1);
    }
    vector[row] += source.emf;
  });

  const solution = solveLinear(matrix, vector);
  if (!solution) return null;
  const volts: Record<string, number> = { [ground]: 0 };
  nodeList.forEach((n, i) => {
    volts[n] = solution[i];
  });
  const currents: Record<string, number> = {};
  sources.forEach((source, s) => {
    currents[source.id] = solution[nodeList.length + s];
  });
  for (const branch of resistors) {
    const va = volts[branch.a] ?? 0;
    const vb = volts[branch.b] ?? 0;
    currents[branch.id] = (va - vb) / Math.max(branch.ohms, 1e-6);
  }
  return { currents, volts, blown: false };
}

function deviceBranches(
  wires: WireLink[],
  parts: CircuitParts,
  coilOhms: number,
): { branches: Array<BranchR | BranchV>; ground: string; nodeOf: (terminal: string) => string } {
  const tight: Array<[string, string]> = [];
  const loose: WireLink[] = [];
  for (const wire of wires) {
    if (wire.loose) loose.push(wire);
    else tight.push([wire.a, wire.b]);
  }
  const find = unionFind(tight);
  const nodeOf = (terminal: string) => find(terminal);
  const battery = batteryOf(parts.kit);
  const face = meterFace(parts.kit);
  const branches: Array<BranchR | BranchV> = [
    {
      kind: "V",
      id: "battery",
      pos: nodeOf("bat_pos"),
      neg: nodeOf("bat_neg"),
      emf: battery.emf,
      seriesOhms: battery.internal,
    },
  ];

  const addR = (id: string, t1: string, t2: string, ohms: number, present = true) => {
    if (!present) return;
    branches.push({ kind: "R", id, a: nodeOf(t1), b: nodeOf(t2), ohms });
  };

  addR("key", "key_l", "key_r", 0.05, parts.keyClosed);
  addR("rheostat", "rhe_l", "rhe_r", Math.max(0.2, parts.rheostatOhms));
  addR("ammeter", "amm_l", "amm_r", face.ammeterOhms);
  addR("coil", "coil_l", "coil_r", Math.max(0.2, coilOhms));
  addR("bulb", "bulb_l", "bulb_r", 6.5, parts.bulbInCircuit);
  addR("voltmeter", "volt_l", "volt_r", face.voltmeterOhms);

  loose.forEach((wire, i) => {
    branches.push({
      kind: "R",
      id: `loose_${i}`,
      a: nodeOf(wire.a),
      b: nodeOf(wire.b),
      ohms: LOOSE_OHMS,
    });
  });

  return { branches, ground: nodeOf("bat_neg"), nodeOf };
}

export function solveCircuit(wires: WireLink[], parts: CircuitParts): CircuitReading {
  const face = meterFace(parts.kit);
  const battery = batteryOf(parts.kit);
  const base = coldCoilOhms(parts.temperatureC);
  const empty: CircuitReading = {
    connected: wires.length > 0,
    openKey: !parts.keyClosed,
    fuseBlown: false,
    shorted: false,
    voltmeterInSeries: false,
    ammeterAcrossSource: false,
    trueCurrentA: 0,
    trueVoltageV: 0,
    ammeterNeedleA: face.ammeterZero,
    voltmeterNeedleV: face.voltmeterZero,
    ammeterZeroErrorA: face.ammeterZero,
    voltmeterZeroErrorV: face.voltmeterZero,
    ammeterLeastCountA: face.ammeterLc,
    voltmeterLeastCountV: face.voltmeterLc,
    coilOhms: base,
    batteryEmfV: battery.emf,
    currentUsedUp: false,
    bulbCurrentA: 0,
    seriesCurrentA: 0,
  };

  let coil = base;
  let solved: Solved | null = null;
  for (let step = 0; step < 14; step++) {
    const built = deviceBranches(wires, parts, coil);
    solved = solveWithInternalNodes(built.branches, built.ground);
    if (!solved) break;
    const current = Math.abs(solved.currents.coil ?? 0);
    const next = hotCoilOhms(base, current, parts.coilHot);
    if (Math.abs(next - coil) < 0.01) {
      coil = next;
      break;
    }
    coil = next;
  }

  const finalBuild = deviceBranches(wires, parts, coil);
  solved = solveWithInternalNodes(finalBuild.branches, finalBuild.ground);
  if (!solved) return empty;

  const batteryCurrent = Math.abs(solved.currents.battery ?? 0);
  const ammeterCurrent = Math.abs(solved.currents.ammeter ?? 0);
  const bulbCurrent = Math.abs(solved.currents.bulb ?? 0);
  const vA = solved.volts[finalBuild.nodeOf("volt_l")] ?? 0;
  const vB = solved.volts[finalBuild.nodeOf("volt_r")] ?? 0;
  const voltage = Math.abs(vA - vB);

  const fuseBlown = batteryCurrent > FUSE_AMPS;
  if (fuseBlown) {
    return {
      ...empty,
      connected: true,
      fuseBlown: true,
      shorted: true,
      coilOhms: coil,
      trueCurrentA: 0,
      ammeterNeedleA: face.ammeterZero,
    };
  }

  const voltmeterInSeries =
    parts.keyClosed &&
    ammeterCurrent < 0.01 &&
    wires.some((w) => w.a.includes("volt") || w.b.includes("volt")) &&
    wires.length >= 4;

  return {
    connected: wires.length > 0,
    openKey: !parts.keyClosed,
    fuseBlown: false,
    shorted: false,
    voltmeterInSeries,
    ammeterAcrossSource: batteryCurrent > 1.2 && voltage < 0.4,
    trueCurrentA: ammeterCurrent,
    trueVoltageV: voltage,
    ammeterNeedleA: ammeterCurrent + face.ammeterZero,
    voltmeterNeedleV: voltage + face.voltmeterZero,
    ammeterZeroErrorA: face.ammeterZero,
    voltmeterZeroErrorV: face.voltmeterZero,
    ammeterLeastCountA: face.ammeterLc,
    voltmeterLeastCountV: face.voltmeterLc,
    coilOhms: coil,
    batteryEmfV: battery.emf,
    currentUsedUp: parts.bulbInCircuit && Math.abs(ammeterCurrent - bulbCurrent) > 0.03,
    bulbCurrentA: bulbCurrent,
    seriesCurrentA: ammeterCurrent,
  };
}

/** Round a meter reading to its least count the way a student should write it. */
export function quantize(value: number, leastCount: number): number {
  const steps = Math.round(value / leastCount);
  const rounded = steps * leastCount;
  const decimals = Math.max(0, Math.round(-Math.log10(leastCount)));
  return Number(rounded.toFixed(decimals));
}
