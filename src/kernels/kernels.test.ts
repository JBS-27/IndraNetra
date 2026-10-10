import { describe, expect, it } from "vitest";
import { solveLinear } from "./linear";
import { batteryOf, quantize, solveCircuit, type WireLink } from "./circuit";
import {
  IDEAL_ENDS,
  SCHOOL_ENDS,
  WIRE,
  bridgeNeedle,
  nullPointCm,
  resistivity,
  unknownFromBalance,
} from "./meterBridge";
import { decomposeVernier, observedLength, vernierZero } from "./vernier";
import { decomposeScrew, observedDiameter, screwZero } from "./screwGauge";
import { focalFromUV, imageDistanceCm, imageMovesFartherWhenObjectCloser } from "./optics";
import {
  TITRATION,
  concordantPair,
  equivalenceMl,
  flaskView,
  judgeTitre,
  naohFromTitre,
  parallaxShiftMl,
} from "./titration";
import { disappearanceSeconds } from "./kinetics";
import { CURVES, secantSlope, tangentTriangle } from "./derivative";
import { FAIR_DIE_MEAN, SUM_SEVEN, dieSequence, frequency, meanOf, twoDiceSums } from "./probability";
import { teacherComment } from "./numbers";

const series = (loose = false): WireLink[] => [
  { id: "w1", a: "bat_pos", b: "key_l", loose },
  { id: "w2", a: "key_r", b: "rhe_l", loose: false },
  { id: "w3", a: "rhe_r", b: "amm_l", loose: false },
  { id: "w4", a: "amm_r", b: "coil_l", loose: false },
  { id: "w5", a: "coil_r", b: "bat_neg", loose: false },
  { id: "w6", a: "volt_l", b: "coil_l", loose: false },
  { id: "w7", a: "volt_r", b: "coil_r", loose: false },
];

describe("linear solver", () => {
  it("solves a 2×2 system", () => {
    const x = solveLinear(
      [
        [2, 1],
        [1, 3],
      ],
      [4, 7],
    );
    expect(x).not.toBeNull();
    expect(x![0]).toBeCloseTo(1, 6);
    expect(x![1]).toBeCloseTo(2, 6);
  });
});

describe("Ohm circuit", () => {
  const parts = {
    keyClosed: true,
    rheostatOhms: 10,
    bulbInCircuit: false,
    coilHot: false,
    kit: "textbook" as const,
    temperatureC: 25,
  };

  it("reads about zero with the key open, and the needle sits on the zero error", () => {
    const school = solveCircuit(series(), { ...parts, keyClosed: false, kit: "school" });
    expect(school.trueCurrentA).toBeLessThan(0.005);
    expect(school.ammeterNeedleA).toBeCloseTo(0.04, 2);
    expect(school.ammeterZeroErrorA).toBe(0.04);
  });

  it("obeys Ohm’s law for a textbook series loop", () => {
    const reading = solveCircuit(series(), parts);
    expect(reading.fuseBlown).toBe(false);
    expect(reading.trueCurrentA).toBeGreaterThan(0.15);
    expect(reading.trueCurrentA).toBeLessThan(0.5);
    const implied = reading.trueVoltageV / reading.trueCurrentA;
    expect(implied).toBeGreaterThan(3);
    expect(implied).toBeLessThan(6);
    expect(reading.voltmeterInSeries).toBe(false);
  });

  it("does not use up current in the bulb", () => {
    const withBulb: WireLink[] = [
      { id: "w1", a: "bat_pos", b: "key_l", loose: false },
      { id: "w2", a: "key_r", b: "rhe_l", loose: false },
      { id: "w3", a: "rhe_r", b: "amm_l", loose: false },
      { id: "w4", a: "amm_r", b: "bulb_l", loose: false },
      { id: "w5", a: "bulb_r", b: "coil_l", loose: false },
      { id: "w6", a: "coil_r", b: "bat_neg", loose: false },
      { id: "w7", a: "volt_l", b: "coil_l", loose: false },
      { id: "w8", a: "volt_r", b: "coil_r", loose: false },
    ];
    const reading = solveCircuit(withBulb, { ...parts, bulbInCircuit: true, rheostatOhms: 5 });
    expect(reading.currentUsedUp).toBe(false);
    expect(reading.bulbCurrentA).toBeCloseTo(reading.seriesCurrentA, 2);
  });

  it("blows the fuse on a short across the battery", () => {
    const shorted: WireLink[] = [{ id: "s", a: "bat_pos", b: "bat_neg", loose: false }];
    const reading = solveCircuit(shorted, parts);
    expect(reading.fuseBlown).toBe(true);
    expect(reading.trueCurrentA).toBe(0);
  });

  it("drops the current when a wire is loose", () => {
    const tight = solveCircuit(series(), parts);
    const loose = solveCircuit(series(true), parts);
    expect(loose.trueCurrentA).toBeLessThan(tight.trueCurrentA * 0.75);
  });

  it("quantizes to the least count and does not hide a zero error", () => {
    expect(quantize(0.237, 0.02)).toBe(0.24);
    expect(batteryOf("school").emf).toBeLessThan(4.5);
  });
});

describe("metre bridge", () => {
  it("places the ideal null where X/R = l/(100−l)", () => {
    const x = WIRE.trueResistanceOhm;
    const r = 2;
    const expected = (100 * x) / (x + r);
    const found = nullPointCm(x, r, IDEAL_ENDS, false);
    expect(found).toBeCloseTo(expected, 1);
    expect(Math.abs(bridgeNeedle(found, x, r, IDEAL_ENDS, false))).toBeLessThan(0.05);
  });

  it("moves the null when the ends are reversed", () => {
    const forward = nullPointCm(WIRE.trueResistanceOhm, 2, IDEAL_ENDS, false);
    const back = nullPointCm(WIRE.trueResistanceOhm, 2, IDEAL_ENDS, true);
    expect(Math.abs(forward - back)).toBeGreaterThan(5);
    expect(forward + back).toBeCloseTo(100, 0);
  });

  it("shifts a school-kit null off the ideal centimetre", () => {
    const ideal = nullPointCm(2, 2, IDEAL_ENDS, false);
    const school = nullPointCm(2, 2, SCHOOL_ENDS, false);
    expect(ideal).toBeCloseTo(50, 1);
    expect(Math.abs(school - ideal)).toBeGreaterThan(0.5);
  });

  it("recovers X from the balance length", () => {
    const x = unknownFromBalance(2, 54.5);
    expect(x).toBeCloseTo(2.396, 2);
    expect(unknownFromBalance(2, 0)).toBeNull();
  });

  it("gives a nichrome-scale resistivity", () => {
    const rho = resistivity(WIRE.trueResistanceOhm, WIRE.lengthM, WIRE.diameterMm / 1000);
    expect(rho).toBeGreaterThan(5e-7);
    expect(rho).toBeLessThan(2e-6);
  });
});

describe("vernier and screw gauge", () => {
  it("splits a vernier reading into MSR and coinciding division", () => {
    const parts = decomposeVernier(5.36);
    expect(parts.msrCm).toBe(5.3);
    expect(parts.coincidingDivision).toBe(6);
    expect(parts.observedCm).toBe(5.36);
  });

  it("shows a positive zero error when the jaws are shut", () => {
    const { zeroErrorCm, correctionCm } = vernierZero("school");
    const observed = observedLength(0, zeroErrorCm);
    const parts = decomposeVernier(observed);
    expect(parts.coincidingDivision).toBe(5);
    expect(correctionCm).toBe(-zeroErrorCm);
    expect(observedLength(12.4, zeroErrorCm) - zeroErrorCm).toBeCloseTo(12.4, 2);
  });

  it("reads a screw gauge as pitch scale plus circular scale", () => {
    const parts = decomposeScrew(4.27);
    expect(parts.pitchScaleMm).toBe(4);
    expect(parts.circularDivision).toBe(27);
    const zero = screwZero("school");
    expect(decomposeScrew(observedDiameter(0, zero.zeroErrorMm)).circularDivision).toBe(4);
  });
});

describe("convex lens", () => {
  it("matches the NCERT sign-convention example u = −30 cm, f = +15 cm", () => {
    const v = imageDistanceCm(-30, 15);
    expect(v).toBeCloseTo(30, 5);
    expect(focalFromUV(-30, 30)).toBeCloseTo(15, 5);
  });

  it("moves the image farther when the object moves closer", () => {
    expect(imageMovesFartherWhenObjectCloser(-40, -20, 15)).toBe(true);
  });
});

describe("acid–base titration", () => {
  const setup = {
    normalOxalic: TITRATION.normalOxalic,
    normalNaoh: TITRATION.normalNaoh,
    aliquotMl: TITRATION.aliquotMl,
    rinsed: true,
  };

  it("needs 22.4 mL of 0.1 N oxalic acid for this NaOH", () => {
    expect(equivalenceMl(setup, false)).toBeCloseTo(22.4, 5);
    const strength = naohFromTitre(22.4, 20);
    expect(strength.normality).toBeCloseTo(0.112, 3);
    expect(strength.gramsPerLitre).toBeCloseTo(4.48, 2);
  });

  it("quietly raises the first titre when the burette was not rinsed", () => {
    const rinsed = equivalenceMl(setup, false);
    const dirty = equivalenceMl({ ...setup, rinsed: false }, true);
    expect(dirty).toBeGreaterThan(rinsed + 0.3);
  });

  it("changes the flask on the last drop and keeps pH beside the colour", () => {
    const eq = 22.4;
    const start = flaskView(0, eq, 20);
    const near = flaskView(22.35, eq, 20);
    const done = flaskView(22.5, eq, 20);
    expect(start.colour).toBe("pink");
    expect(start.pH).toBeGreaterThan(12);
    expect(near.colour).not.toBe("colourless");
    expect(done.colour).toBe("colourless");
    expect(done.pH).toBeLessThan(8.2);
    expect(parallaxShiftMl("high")).toBe(-0.2);
  });

  it("marks a flood as discordant and a careful pair as concordant", () => {
    const flood = judgeTitre([22.4], 22.4);
    expect(flood.overshot).toBe(true);
    const careful = judgeTitre(Array.from({ length: 448 }, () => 0.05), 22.4);
    expect(careful.titreMl).toBeCloseTo(22.4, 1);
    expect(careful.dropwiseFinish).toBe(true);
    expect(concordantPair([22.4, 22.5, 23.1])).toEqual([22.4, 22.5]);
  });
});

describe("thiosulphate clock", () => {
  it("runs slower when the thiosulphate is diluted", () => {
    const strong = disappearanceSeconds(50, 25);
    const weak = disappearanceSeconds(10, 25);
    expect(strong).toBeCloseTo(40, 5);
    expect(weak).toBeCloseTo(200, 5);
  });

  it("runs faster in a 36°C classroom than at NCERT 25°C", () => {
    const textbook = disappearanceSeconds(40, 25);
    const city = disappearanceSeconds(40, 36);
    expect(city).toBeLessThan(textbook * 0.7);
  });
});

describe("derivative", () => {
  it("makes the tangent slope of y = x² equal 2x", () => {
    const triangle = tangentTriangle(CURVES.square, 2, 1);
    expect(triangle.slope).toBe(4);
    expect(triangle.rise).toBe(4);
    const wide = secantSlope(CURVES.square, 2, 1);
    expect(wide).toBe(5);
    expect(Math.abs(secantSlope(CURVES.square, 2, 0.001) - 4)).toBeLessThan(0.01);
  });
});

describe("probability", () => {
  it("settles a long run near 3.5 and keeps the seed", () => {
    const a = dieSequence(11, 2000);
    const b = dieSequence(11, 2000);
    expect(a).toEqual(b);
    expect(Math.abs(meanOf(a) - FAIR_DIE_MEAN)).toBeLessThan(0.08);
    const short = meanOf(a.slice(0, 20));
    expect(short).not.toBe(FAIR_DIE_MEAN);
  });

  it("brings the frequency of a sum of 7 toward 1/6", () => {
    const sums = twoDiceSums(3, 4000);
    expect(Math.abs(frequency(sums, 7) - SUM_SEVEN)).toBeLessThan(0.02);
  });
});

describe("teacher comment", () => {
  it("points at the triangle when the sentence disagrees with the slope", () => {
    const note = teacherComment({
      sentence: "The slope is 2.4 ohm.",
      expected: 2.4,
      unit: "ohm",
      slope: 2.1,
      lang: "en",
    });
    expect(note).toMatch(/2\.1/);
    expect(note).toMatch(/triangle/i);
  });
});
