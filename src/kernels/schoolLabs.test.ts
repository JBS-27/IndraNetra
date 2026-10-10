import { describe, expect, it } from "vitest";
import {
  boyleVolume,
  capillaryRiseMm,
  coolingTemperature,
  gFromPendulum,
  inclineForce,
  pendulumPeriod,
  resonanceLengthCm,
} from "./schoolLabs";

describe("school laboratories", () => {
  it("gives a one-metre pendulum a period near two seconds", () => {
    expect(pendulumPeriod(1)).toBeCloseTo(2.007, 2);
    expect(gFromPendulum(1, 2)).toBeCloseTo(9.87, 1);
  });

  it("cools faster toward a hot room’s own temperature", () => {
    const at25 = coolingTemperature(120, 25);
    const at36 = coolingTemperature(120, 36);
    expect(at36).toBeGreaterThan(at25);
    expect(coolingTemperature(0, 36)).toBeCloseTo(80, 1);
  });

  it("keeps PV constant for a trapped sample of air", () => {
    const v1 = boyleVolume(100);
    const v2 = boyleVolume(200);
    expect(v1 * 100).toBeCloseTo(v2 * 200, 5);
  });

  it("raises water higher in a narrower capillary", () => {
    expect(capillaryRiseMm(0.2, 25)).toBeGreaterThan(capillaryRiseMm(0.5, 25));
  });

  it("moves the resonance length when the room is warmer", () => {
    expect(resonanceLengthCm(512, 36)).toBeGreaterThan(resonanceLengthCm(512, 25));
  });

  it("makes the downhill force zero on a level board", () => {
    expect(inclineForce(0.2, 0)).toBeCloseTo(0, 5);
    expect(inclineForce(0.2, 30)).toBeCloseTo(0.2 * 9.8 * 0.5, 2);
  });
});
