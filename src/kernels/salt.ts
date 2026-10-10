export type TestId =
  | "look"
  | "dissolve"
  | "flame"
  | "dil-hcl"
  | "bacl2"
  | "naoh"
  | "nh4oh"
  | "agno3";

export interface SaltObservation {
  id: TestId;
  en: string;
  hi: string;
  evidence: string;
  confirmatory: boolean;
  costRupee: number;
}

/** Copper sulphate pentahydrate. Colours are the school tests, not inventions. */
export const SALT_TESTS: Record<TestId, SaltObservation> = {
  look: {
    id: "look",
    en: "Blue crystalline solid.",
    hi: "नीला क्रिस्टलीय ठोस।",
    evidence: "Colour is a clue. It is not a confirmatory test.",
    confirmatory: false,
    costRupee: 0,
  },
  dissolve: {
    id: "dissolve",
    en: "Dissolves in water to give a blue solution.",
    hi: "पानी में घुलकर नीला विलयन देता है।",
    evidence: "Aqueous Cu²⁺ is blue. Still a clue.",
    confirmatory: false,
    costRupee: 0.05,
  },
  flame: {
    id: "flame",
    en: "Bluish green flame.",
    hi: "नीली-हरी लौ।",
    evidence: "Preliminary test for Cu²⁺. Flame colour is not the final word.",
    confirmatory: false,
    costRupee: 0.5,
  },
  "dil-hcl": {
    id: "dil-hcl",
    en: "No gas. Carbonate, sulphide, sulphite, and nitrite stay absent.",
    hi: "कोई गैस नहीं। Carbonate, sulphide, sulphite और nitrite अनुपस्थित।",
    evidence: "Negative tests are evidence too.",
    confirmatory: false,
    costRupee: 0.15,
  },
  bacl2: {
    id: "bacl2",
    en: "White precipitate. It does not dissolve in dilute HCl. Sulphate is present.",
    hi: "सफेद अवक्षेप। तनु HCl में नहीं घुलता। Sulphate उपस्थित है।",
    evidence: "BaSO₄ is insoluble in dilute mineral acid.",
    confirmatory: true,
    costRupee: 0.4,
  },
  naoh: {
    id: "naoh",
    en: "Pale blue precipitate, insoluble in excess NaOH.",
    hi: "हल्का नीला अवक्षेप, अधिक NaOH में अघुलनशील।",
    evidence: "Cu(OH)₂. Group clue for Cu²⁺.",
    confirmatory: false,
    costRupee: 0.2,
  },
  nh4oh: {
    id: "nh4oh",
    en: "Pale blue precipitate. Excess NH₄OH dissolves it to a deep blue solution.",
    hi: "हल्का नीला अवक्षेप। अधिक NH₄OH में घुलकर गहरा नीला विलयन।",
    evidence: "[Cu(NH₃)₄]²⁺ confirms Cu²⁺.",
    confirmatory: true,
    costRupee: 0.35,
  },
  agno3: {
    id: "agno3",
    en: "No precipitate. Chloride is absent.",
    hi: "कोई अवक्षेप नहीं। Chloride अनुपस्थित।",
    evidence: "A wrong guess still uses a portion.",
    confirmatory: false,
    costRupee: 0.45,
  },
};

export const PORTIONS_FULL = 5;

export function portionCost(microscale: boolean): number {
  return microscale ? 0.5 : 1;
}

export function rupeeCost(test: TestId, microscale: boolean): number {
  const scale = microscale ? 0.5 : 1;
  return Math.round(SALT_TESTS[test].costRupee * scale * 100) / 100;
}
