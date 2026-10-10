import type { LabEvent } from "./events";
import { textOf } from "./events";

export interface BenchPoster {
  classCode: string;
  bench: string;
  practicalId: string;
  studentName: string;
  prediction: string;
  setup: string;
  reading: string;
  explanation: string;
  flag: string;
  hash: string;
  updatedAt: number;
}

export function describeBench(input: {
  practicalId: string;
  events: LabEvent[];
  classCode: string;
  bench: string;
  studentName: string;
}): BenchPoster {
  const types = new Set(input.events.map((event) => event.type));
  const prediction = types.has("predict") ? "Prediction locked" : "Prediction not made";
  let setup = "Not started";
  let reading = "No reading yet";
  let flag = "";
  const hashParts: string[] = [];

  if (input.practicalId === "ohm") {
    if (types.has("wire")) setup = "Circuit being wired";
    if (types.has("reading")) {
      setup = "Readings started";
      reading = "Readings recorded";
    }
    const readings = input.events.filter((event) => event.type === "reading");
    hashParts.push(...readings.map((event) => `${event.data.i}:${event.data.v}`));
    if (readings.some((event) => event.data.hot === true || event.data.loose === true)) flag = "Line may be bent";
    else if (readings.length >= 4) flag = "Line can be drawn";
  } else if (input.practicalId === "meter-bridge") {
    if (types.has("jockey")) setup = "Jockey moving";
    const balances = input.events.filter((event) => event.type === "balance");
    if (balances.some((event) => event.data.near === true)) {
      setup = "Null point found";
      reading = "Balance recorded";
    } else if (balances.length > 0) {
      setup = "Balance written off the null";
      flag = "Null not settled";
    }
    hashParts.push(...balances.map((event) => String(event.data.n)));
  } else if (input.practicalId === "convex-lens") {
    if (types.has("pin")) setup = "Pins on the bench";
    const rows = input.events.filter((event) => event.type === "row");
    if (rows.some((event) => event.data.accepted === true)) flag = "Parallax accepted";
    if (rows.length > 0) {
      setup = "Image recorded";
      reading = "u and v recorded";
    }
    hashParts.push(...rows.map((event) => `${event.data.u}:${event.data.v}`));
  } else if (input.practicalId === "titration") {
    if (types.has("add")) setup = "Titration in progress";
    const titres = input.events.filter((event) => event.type === "titre");
    if (titres.some((event) => event.data.overshot === true)) flag = "Endpoint overshot";
    if (titres.length > 0) {
      reading = "Titre recorded";
      setup = "Flask has been titrated";
    }
    hashParts.push(...titres.map((event) => String(event.data.n)));
  } else if (input.practicalId === "salt") {
    const tests = input.events.filter((event) => event.type === "test");
    setup = tests.length ? "Tests in progress" : "Salt not tested";
    if (tests.length) reading = "Observations written";
    hashParts.push(...tests.map((event) => String(event.data.text)));
  } else if (input.practicalId === "rate") {
    const stops = input.events.filter((event) => event.type === "stop");
    if (types.has("start")) setup = "Clock running";
    if (stops.length) {
      setup = "Cross timed";
      reading = "Time recorded";
    }
    hashParts.push(...stops.map((event) => `${event.data.v}:${event.data.n}`));
  } else if (input.practicalId === "derivative") {
    setup = types.has("x") ? "Point on the curve" : "Curve not touched";
    if (types.has("slope")) reading = "Slope written";
    hashParts.push(String(input.events.filter((event) => event.type === "slope").at(-1)?.data.n ?? ""));
  } else if (input.practicalId === "dice") {
    const count = input.events.filter((event) => event.type === "count").at(-1);
    setup = count ? `Rolls shown: ${count.data.n}` : "No rolls yet";
    if (Number(count?.data.n ?? 0) >= 20) reading = "Average started";
    hashParts.push(String(count?.data.n ?? 0));
  }

  const explanation = textOf(input.events, "explain");
  return {
    classCode: input.classCode,
    bench: input.bench || "Bench",
    practicalId: input.practicalId,
    studentName: input.studentName,
    prediction,
    setup,
    reading,
    explanation: explanation ? "Explanation written" : "Explanation missing",
    flag,
    hash: hashParts.join("|"),
    updatedAt: Date.now(),
  };
}
