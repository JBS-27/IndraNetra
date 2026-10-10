import type { Board, Lang, Subject } from "./copy";
import { pick } from "./copy";

export interface MarkRow {
  label: string;
  marks: number;
}

export interface MarkScheme {
  heading: string;
  rows: MarkRow[];
  totalLabel: string;
  note: string;
}

export function markScheme(board: Board, classLevel: 11 | 12, subject: Subject, lang: Lang): MarkScheme {
  if (subject === "mathematics") {
    return {
      heading: pick(lang, `${board} Class ${classLevel} Mathematics`, `${board} कक्षा ${classLevel} गणित`),
      rows:
        board === "ISC"
          ? [{ label: pick(lang, "Project work", "Project work"), marks: 20 }]
          : [
              { label: pick(lang, "Periodic tests", "Periodic tests"), marks: 10 },
              { label: pick(lang, "Mathematics activities", "Mathematics activities"), marks: 10 },
            ],
      totalLabel: pick(lang, "Internal assessment 20. Theory is 80. This is not a wet-lab practical.", "आंतरिक मूल्यांकन 20. Theory 80 का है। यह wet-lab practical नहीं है।"),
      note: pick(
        lang,
        "The activity still produces a portfolio page: aim, construction, observation, and the student’s own sentence.",
        "Activity से एक portfolio पृष्ठ बनता है: aim, construction, observation, और विद्यार्थी का अपना वाक्य।",
      ),
    };
  }

  if (board === "ISC") {
    return {
      heading: pick(lang, `ISC Class ${classLevel} ${subject}`, `ISC कक्षा ${classLevel}`),
      rows: [
        { label: pick(lang, "Practical examination", "Practical examination"), marks: 15 },
        { label: pick(lang, "Project work", "Project work"), marks: 10 },
        { label: pick(lang, "Practical file", "Practical file"), marks: 5 },
      ],
      totalLabel: pick(lang, "30 marks beside a 70-mark theory paper", "70 अंक के theory paper के साथ 30 अंक"),
      note: pick(
        lang,
        "ISC splits the 30 into practical, project, and file. The science on the bench is the same.",
        "ISC इन 30 को practical, project और file में बाँटता है। Bench पर विज्ञान वही है।",
      ),
    };
  }

  if (subject === "chemistry") {
    return {
      heading: pick(lang, `CBSE Class ${classLevel} Chemistry`, `CBSE कक्षा ${classLevel} रसायन`),
      rows: [
        { label: pick(lang, "Volumetric analysis", "Volumetric analysis"), marks: 8 },
        { label: pick(lang, "Salt analysis", "Salt analysis"), marks: 8 },
        { label: pick(lang, "Content based experiment", "Content based experiment"), marks: 6 },
        { label: pick(lang, "Project work", "Project work"), marks: 4 },
        { label: pick(lang, "Class record and viva", "Class record and viva"), marks: 4 },
      ],
      totalLabel: pick(lang, "30 marks. Theory is 70.", "30 अंक। Theory 70 का है।"),
      note: pick(
        lang,
        "Scheme from the CBSE Chemistry curriculum (Classes XI–XII, 2025–26). A practice split is not a board award.",
        "यह CBSE Chemistry curriculum (कक्षा XI–XII, 2025–26) का विभाजन है। Practice split बोर्ड का अंक नहीं है।",
      ),
    };
  }

  if (classLevel === 12) {
    return {
      heading: pick(lang, "CBSE Class 12 Physics", "CBSE कक्षा 12 भौतिकी"),
      rows: [
        { label: pick(lang, "Two experiments", "दो experiments"), marks: 14 },
        { label: pick(lang, "Practical record", "Practical record"), marks: 5 },
        { label: pick(lang, "One activity", "एक activity"), marks: 3 },
        { label: pick(lang, "Investigatory project", "Investigatory project"), marks: 3 },
        { label: pick(lang, "Viva", "Viva"), marks: 5 },
      ],
      totalLabel: pick(lang, "30 marks. Theory is 70.", "30 अंक। Theory 70 का है।"),
      note: pick(
        lang,
        "Class 12 Physics practical scheme used for 2025–26: experiments 7+7, record 5, activity 3, project 3, viva 5.",
        "कक्षा 12 Physics practical, 2025–26: experiments 7+7, record 5, activity 3, project 3, viva 5।",
      ),
    };
  }

  return {
    heading: pick(lang, "CBSE Class 11 Physics", "CBSE कक्षा 11 भौतिकी"),
    rows: [
      { label: pick(lang, "Two experiments", "दो experiments"), marks: 16 },
      { label: pick(lang, "Practical record", "Practical record"), marks: 6 },
      { label: pick(lang, "Project", "Project"), marks: 3 },
      { label: pick(lang, "Viva", "Viva"), marks: 5 },
    ],
    totalLabel: pick(lang, "30 marks. Theory is 70.", "30 अंक। Theory 70 का है।"),
    note: pick(
      lang,
      "Class 11 schools sometimes publish a slightly different internal split. The total remains 30. Follow your current circular if it differs.",
      "कक्षा 11 में आंतरिक विभाजन स्कूल के परिपत्र के साथ थोड़ा बदल सकता है। कुल 30 ही रहता है।",
    ),
  };
}
