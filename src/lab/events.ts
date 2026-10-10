export interface LabEvent {
  id: string;
  at: number;
  type: string;
  data: Record<string, string | number | boolean>;
}

export function makeEvent(type: string, data: Record<string, string | number | boolean> = {}): LabEvent {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `e-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return { id, at: Date.now(), type, data };
}

export function ofType(events: LabEvent[], type: string): LabEvent[] {
  const struck = new Set(
    events.filter((event) => event.type === "strike").map((event) => String(event.data.id)),
  );
  return events.filter((event) => event.type === type && !struck.has(event.id));
}

export function lastOf(events: LabEvent[], type: string): LabEvent | undefined {
  const found = ofType(events, type);
  return found[found.length - 1];
}

export function num(event: LabEvent | undefined, key: string, fallback = 0): number {
  const value = event?.data[key];
  return typeof value === "number" ? value : fallback;
}

export function flag(event: LabEvent | undefined, key: string): boolean {
  return event?.data[key] === true || event?.data[key] === 1;
}

export function textOf(events: LabEvent[], type: string): string {
  const event = lastOf(events, type);
  const value = event?.data.text;
  return typeof value === "string" ? value : "";
}

export interface DrawnLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  xMax: number;
  yMax: number;
  throughOrigin: boolean;
}

export function lineFrom(event: LabEvent | undefined): DrawnLine | null {
  if (!event) return null;
  return {
    x1: num(event, "x1"),
    y1: num(event, "y1"),
    x2: num(event, "x2"),
    y2: num(event, "y2"),
    xMax: num(event, "xMax", 1),
    yMax: num(event, "yMax", 1),
    throughOrigin: flag(event, "origin"),
  };
}

export function slopeOf(line: DrawnLine | null): number | null {
  if (!line) return null;
  const dx = line.x2 - line.x1;
  if (Math.abs(dx) < 1e-9) return null;
  return (line.y2 - line.y1) / dx;
}

export interface RunConditions {
  kit: "school" | "textbook";
  temperatureC: number;
  humidity: number;
  ncertStandard: boolean;
  mock: boolean;
}
