import {
  TITRATION,
  concordantPair,
  equivalenceMl,
  flaskView,
  meanOf,
  naohFromTitre,
  parallaxShiftMl,
} from "@/kernels/titration";
import type { LabEvent, RunConditions } from "./events";
import { num } from "./events";

export type Eye = "level" | "high" | "low";

export interface TitreRow {
  id: string;
  ml: number;
  overshot: boolean;
  firstFill: boolean;
  rinsed: boolean;
  rejected: boolean;
  eye: Eye;
}

export interface TitreState {
  rinsed: boolean;
  eye: Eye;
  acidMl: number;
  increments: number[];
  aliquot: boolean;
  indicator: boolean;
  labelsRead: boolean;
  fills: number;
  rows: TitreRow[];
  micro: boolean;
  prediction: "yes" | "no" | null;
  splash: boolean;
  dropped: boolean;
  lessons: string[];
}

export function projectTitre(events: LabEvent[]): TitreState {
  let rinsed = false;
  let eye: Eye = "level";
  let acidMl = 0;
  let increments: number[] = [];
  let aliquot = false;
  let indicator = false;
  let labelsRead = false;
  let fills = 0;
  let micro = false;
  let prediction: "yes" | "no" | null = null;
  let splash = false;
  let dropped = false;
  const lessons: string[] = [];
  const rows: TitreRow[] = [];
  const rejected = new Set<string>();

  for (const event of events) {
    if (event.type === "reject") rejected.add(String(event.data.id));
  }

  for (const event of events) {
    if (event.type === "predict") prediction = event.data.choice === "no" ? "no" : "yes";
    if (event.type === "rinse") rinsed = true;
    if (event.type === "labels") labelsRead = true;
    if (event.type === "eye") eye = (event.data.text as Eye) || "level";
    if (event.type === "aliquot") aliquot = true;
    if (event.type === "indicator") indicator = true;
    if (event.type === "micro") micro = !micro;
    if (event.type === "splash") {
      splash = true;
      lessons.push(String(event.data.text ?? ""));
    }
    if (event.type === "drop-beaker") {
      dropped = true;
      aliquot = false;
      indicator = false;
      acidMl = 0;
      increments = [];
      lessons.push(String(event.data.text ?? "The beaker was dropped and the portion rewound."));
    }
    if (event.type === "fill") {
      fills += 1;
      acidMl = 0;
      increments = [];
    }
    if (event.type === "add") {
      const step = num(event, "n");
      acidMl += step;
      increments.push(step);
    }
    if (event.type === "titre") {
      rows.push({
        id: event.id,
        ml: num(event, "n"),
        overshot: event.data.overshot === true,
        firstFill: fills <= 1,
        rinsed,
        rejected: false,
        eye,
      });
    }
  }

  return {
    rinsed,
    eye,
    acidMl,
    increments,
    aliquot,
    indicator,
    labelsRead,
    fills,
    rows: rows.map((row) => ({ ...row, rejected: rejected.has(row.id) })),
    micro,
    prediction,
    splash,
    dropped,
    lessons,
  };
}

export function endpointMl(state: TitreState): number {
  return equivalenceMl(
    {
      normalOxalic: TITRATION.normalOxalic,
      normalNaoh: TITRATION.normalNaoh,
      aliquotMl: state.micro ? 10 : TITRATION.aliquotMl,
      rinsed: state.rinsed,
    },
    !state.rinsed && state.fills <= 1,
  );
}

export function titreView(state: TitreState) {
  const eq = endpointMl(state);
  const view = flaskView(state.acidMl, eq, state.micro ? 10 : 20);
  const shown = Math.max(0, state.acidMl + parallaxShiftMl(state.eye));
  return { ...view, eq, shownMl: Math.round(shown * 10) / 10 };
}

export function keptTitres(state: TitreState): number[] {
  const pool = state.rows.filter((row) => !row.rejected && !row.overshot).map((row) => row.ml);
  const friends = concordantPair(pool);
  return friends.length > 0 ? friends : pool;
}

export function titreStrength(state: TitreState): { normality: number; gramsPerLitre: number } | null {
  const mean = meanOf(keptTitres(state));
  if (mean === null) return null;
  return naohFromTitre(mean, state.micro ? 10 : 20);
}

export function titreStepDone(state: TitreState): Record<string, boolean> {
  return {
    labels: state.labelsRead,
    rinse: state.rinsed || state.rows.length > 0,
    flask: state.aliquot && state.indicator,
    titrate: state.rows.length > 0,
    repeat: keptTitres(state).length >= 2,
    strength: titreStrength(state) !== null && keptTitres(state).length >= 2,
  };
}

export function titreErrors(state: TitreState, ctx: RunConditions): { en: string; hi: string }[] {
  const errors: { en: string; hi: string }[] = [];
  if (!state.rinsed && state.rows.length > 0) {
    errors.push({
      en: "The burette was not rinsed with oxalic acid. The first titre is quietly high.",
      hi: "Burette को oxalic acid से नहीं खंगाला गया। पहला titre चुपचाप अधिक है।",
    });
  }
  if (state.rows.some((row) => row.overshot)) {
    errors.push({
      en: "A titre was overshot. The last drop was a flood, so that reading is discordant.",
      hi: "एक titre ओवरशूट हो गया। आखिरी बूँद की जगह तेज धारा थी, इसलिए वह reading discordant है।",
    });
  }
  if (state.rows.some((row) => row.eye !== "level")) {
    errors.push({
      en: "A burette reading was taken with the eye off the meniscus. That is a parallax error.",
      hi: "Burette की reading आँख meniscus पर न रखते हुए ली गई। यह parallax error है।",
    });
  }
  if (!state.labelsRead && state.rows.length > 0) {
    errors.push({
      en: "A bottle was poured before its label was read.",
      hi: "एक बोतल का label पढ़े बिना उसमें से डाला गया।",
    });
  }
  if (state.splash) {
    errors.push({
      en: "Water was added to concentrated acid. The splash is the lesson. Acid goes into water.",
      hi: "सांद्र अम्ल में पानी डाला गया। छींटा ही पाठ है। अम्ल पानी में डाला जाता है।",
    });
  }
  if (!ctx.ncertStandard) {
    errors.push({
      en: `The bench was at ${ctx.temperatureC}°C. Volumetric glassware is calibrated near 20–27°C, not at a hot afternoon.`,
      hi: `Bench ${ctx.temperatureC}°C पर थी। आयतनी काँच के बरतन लगभग 20–27°C पर अंशांकित होते हैं, गर्म दोपहर पर नहीं।`,
    });
  }
  return errors;
}
