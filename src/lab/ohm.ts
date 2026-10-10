import type { WireLink } from "@/kernels/circuit";
import { solveCircuit } from "@/kernels/circuit";
import type { LabEvent, RunConditions } from "./events";
import { lastOf, lineFrom, num, slopeOf } from "./events";

export interface OhmReading {
  id: string;
  rawI: number;
  rawV: number;
  corI: number | null;
  corV: number | null;
  hot: boolean;
  loose: boolean;
}

export interface OhmState {
  wires: WireLink[];
  keyClosed: boolean;
  rheostatOhms: number;
  bulbIn: boolean;
  coilHot: boolean;
  zeroTyped: number | null;
  sawCurrent: boolean;
  sawOpen: boolean;
  readings: OhmReading[];
  lengthCm: number | null;
  disturbed: boolean;
  line: ReturnType<typeof lineFrom>;
  prediction: "yes" | "no" | null;
  lessons: string[];
  meter: ReturnType<typeof solveCircuit>;
}

function pair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function projectOhm(events: LabEvent[], ctx: RunConditions): OhmState {
  let wires: WireLink[] = [];
  let keyClosed = false;
  let rheostatOhms = 18;
  let bulbIn = false;
  let coilHot = false;
  let zeroTyped: number | null = null;
  let sawCurrent = false;
  let sawOpen = false;
  const readings: OhmReading[] = [];
  let lengthCm: number | null = null;
  let disturbed = false;
  const lessons: string[] = [];
  let prediction: "yes" | "no" | null = null;

  const struck = new Set(events.filter((event) => event.type === "strike").map((event) => String(event.data.id)));

  for (const event of events) {
    if (event.type === "predict") prediction = event.data.choice === "no" ? "no" : "yes";
    if (event.type === "wire") {
      const a = String(event.data.a);
      const b = String(event.data.b);
      const [left, right] = pair(a, b);
      const index = wires.findIndex((wire) => pair(wire.a, wire.b)[0] === left && pair(wire.a, wire.b)[1] === right);
      if (index >= 0) wires = wires.filter((_, i) => i !== index);
      else wires = [...wires, { id: event.id, a, b, loose: false }];
    }
    if (event.type === "loose") {
      const a = String(event.data.a);
      const b = String(event.data.b);
      wires = wires.map((wire) => {
        const same = pair(wire.a, wire.b).join() === pair(a, b).join();
        return same ? { ...wire, loose: !wire.loose } : wire;
      });
      disturbed = true;
    }
    if (event.type === "key") keyClosed = !keyClosed;
    if (event.type === "rheostat") rheostatOhms = num(event, "n", rheostatOhms);
    if (event.type === "bulb") {
      bulbIn = !bulbIn;
      disturbed = true;
    }
    if (event.type === "heat") {
      coilHot = !coilHot;
      disturbed = true;
    }
    if (event.type === "zero") zeroTyped = num(event, "n");
    if (event.type === "saw-current") sawCurrent = true;
    if (event.type === "saw-open") sawOpen = true;
    if (event.type === "length") lengthCm = num(event, "n");
    if (event.type === "lesson") lessons.push(String(event.data.text ?? ""));
    if (event.type === "rewind") {
      wires = [];
      keyClosed = false;
      coilHot = false;
      bulbIn = false;
      lessons.push(String(event.data.text ?? "The short was rewound."));
    }
    if (event.type === "reading" && !struck.has(event.id)) {
      readings.push({
        id: event.id,
        rawI: num(event, "i"),
        rawV: num(event, "v"),
        corI: typeof event.data.ci === "number" ? event.data.ci : null,
        corV: typeof event.data.cv === "number" ? event.data.cv : null,
        hot: event.data.hot === true,
        loose: event.data.loose === true,
      });
    }
  }

  const meter = solveCircuit(wires, {
    keyClosed,
    rheostatOhms,
    bulbInCircuit: bulbIn,
    coilHot,
    kit: ctx.kit,
    temperatureC: ctx.temperatureC,
  });

  return {
    wires,
    keyClosed,
    rheostatOhms,
    bulbIn,
    coilHot,
    zeroTyped,
    sawCurrent,
    sawOpen,
    readings,
    lengthCm,
    disturbed,
    line: lineFrom(lastOf(events, "graph")),
    prediction,
    lessons,
    meter,
  };
}

export function ohmSetupOk(state: OhmState): boolean {
  return (
    state.keyClosed &&
    state.meter.trueCurrentA > 0.05 &&
    state.meter.trueVoltageV > 0.12 &&
    !state.meter.fuseBlown &&
    !state.meter.voltmeterInSeries
  );
}

export function usedCurrent(reading: OhmReading): { i: number; v: number } {
  return {
    i: reading.corI ?? reading.rawI,
    v: reading.corV ?? reading.rawV,
  };
}

export function ohmSlope(state: OhmState): number | null {
  return slopeOf(state.line);
}

export function resistancePerCm(state: OhmState): number | null {
  const slope = ohmSlope(state);
  if (slope === null || !state.lengthCm) return null;
  return slope / state.lengthCm;
}

export function ohmErrors(state: OhmState, ctx: RunConditions): { en: string; hi: string }[] {
  const errors: { en: string; hi: string }[] = [];
  if (state.meter.ammeterZeroErrorA !== 0 && state.readings.some((reading) => reading.corI === null)) {
    errors.push({
      en: "The ammeter had a zero error and at least one current was left uncorrected.",
      hi: "Ammeter में zero error थी और कम से कम एक current बिना correction के रह गया।",
    });
  }
  if (state.readings.some((reading) => reading.loose)) {
    errors.push({
      en: "A reading was taken with a loose wire, so that point does not belong on the cold straight line.",
      hi: "एक reading ढीले तार के साथ ली गई, इसलिए वह बिंदु ठंडी सीधी रेखा पर नहीं बैठता।",
    });
  }
  if (state.readings.some((reading) => reading.hot)) {
    errors.push({
      en: "A reading was taken while the coil was hot. Heating bends the V–I line.",
      hi: "एक reading coil के गर्म रहते ली गई। गर्मी V–I रेखा को मोड़ती है।",
    });
  }
  if (state.meter.fuseBlown) {
    errors.push({
      en: "The leads shorted the battery. The fuse opened. That run was rewound as a lesson, not a reading.",
      hi: "तारों ने battery को short कर दिया। Fuse खुल गया। वह रन एक पाठ था, reading नहीं।",
    });
  }
  if (!ctx.ncertStandard && Math.abs(ctx.temperatureC - 25) >= 5) {
    errors.push({
      en: `The room was ${ctx.temperatureC}°C. The textbook table assumes 25°C. For this metal the shift is small beside a loose wire or a hot coil.`,
      hi: `कमरा ${ctx.temperatureC}°C था। पाठ्यपुस्तक 25°C मानती है। इस धातु में यह बदलाव ढीले तार या गर्म coil से छोटा है।`,
    });
  }
  for (const lesson of state.lessons) {
    errors.push({ en: lesson, hi: lesson });
  }
  return errors;
}

export function ohmStepDone(state: OhmState, ctx: RunConditions): Record<string, boolean> {
  const closed = solveCircuit(state.wires, {
    keyClosed: true,
    rheostatOhms: state.rheostatOhms,
    bulbInCircuit: state.bulbIn,
    coilHot: state.coilHot,
    kit: ctx.kit,
    temperatureC: ctx.temperatureC,
  });
  const loop = closed.trueCurrentA > 0.05 && !closed.fuseBlown && !closed.voltmeterInSeries;
  const volt = loop && closed.trueVoltageV > 0.12;
  return {
    zero: state.zeroTyped !== null,
    loop,
    volt,
    key: state.sawCurrent && state.sawOpen,
    readings: state.readings.length >= 5,
    length: state.lengthCm !== null,
    graph: state.line !== null,
    disturb: state.disturbed,
  };
}
