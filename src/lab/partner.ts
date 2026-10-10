import type { PracticalDef } from "@/content/catalog";
import type { Lang } from "@/content/copy";
import { pick } from "@/content/copy";
import type { LabEvent } from "./events";

const BLOCK =
  /synthesis|explosive|detonate|drug|narcotic|weapon|poison|toxin|sarin|methamphetamine|विस्फोट|हथियार|नशीली|ज़हर|जहर|संश्लेषण/i;

export function partnerReply(practical: PracticalDef, events: LabEvent[], question: string, lang: Lang): string {
  const asked = question.trim();
  if (!asked) {
    return pick(lang, "Ask about the step in front of you.", "जो चरण सामने है, उसके बारे में पूछो।");
  }
  if (BLOCK.test(asked)) {
    return pick(
      lang,
      "This bench stays inside the school practical. I will not help with synthesis, drugs, or weapons.",
      "यह bench स्कूल के practical के अंदर रहता है। संश्लेषण, नशीले पदार्थ, या हथियार में मैं मदद नहीं करूँगा।",
    );
  }
  if (/predict|guess the answer|what should i write first|अनुमान क्या|क्या लिखूँ पहले|सही prediction/i.test(asked)) {
    return pick(
      lang,
      "I will not supply the prediction. Lock yours, then let the bench answer it.",
      "मैं prediction नहीं दूँगा। अपनी लिखो, फिर bench को जवाब देने दो।",
    );
  }
  if (/full procedure|all the steps|entire method|पूरी विधि|सारे चरण/i.test(asked)) {
    return pick(
      lang,
      "One step at a time. Read the line that is still open.",
      "एक चरण। जो पंक्ति अभी खुली है, वही पढ़ो।",
    );
  }
  const types = new Set(events.map((event) => event.type));
  if (/reading|value|how much|कितना|रीडिंग/i.test(asked) && !hasMeasurement(types)) {
    return pick(
      lang,
      "There is no reading to quote yet. Take one, then ask.",
      "अभी कोई reading नहीं है जिसे मैं दोहराऊँ। पहले एक लो, फिर पूछो।",
    );
  }

  const pending = practical.steps.find((step) => !stepLooksDone(practical.id, step.id, types));
  if (/stuck|next|hint|मदद|आगे|क्या करूँ/i.test(asked) && pending) {
    return pick(lang, `Smaller question: ${pending.text.en}`, `छोटा प्रश्न: ${pending.text.hi}`);
  }

  return fallback(practical.id, types, lang);
}

function hasMeasurement(types: Set<string>): boolean {
  return ["reading", "balance", "row", "titre", "test", "stop", "slope", "count"].some((type) => types.has(type));
}

function stepLooksDone(practicalId: string, stepId: string, types: Set<string>): boolean {
  const table: Record<string, Record<string, string[]>> = {
    ohm: {
      zero: ["zero"],
      loop: ["wire"],
      volt: ["wire"],
      key: ["saw-current", "saw-open"],
      readings: ["reading"],
      length: ["length"],
      graph: ["graph"],
      disturb: ["heat", "loose", "bulb"],
    },
    "meter-bridge": {
      box: ["known"],
      null: ["balance"],
      reverse: ["reverse"],
      screw: ["zero", "diameter"],
      rho: ["length"],
    },
    "convex-lens": { zero: ["zero"], place: ["object"], parallax: ["row"], repeat: ["row"], closer: ["object"] },
    titration: {
      labels: ["labels"],
      rinse: ["rinse", "titre"],
      flask: ["aliquot", "indicator"],
      titrate: ["titre"],
      repeat: ["titre"],
      strength: ["titre"],
    },
    salt: { look: ["test"], flame: ["test"], anion: ["test"], cation: ["test"], name: ["test"] },
    rate: { mix: ["volume"], time: ["stop"], dilute: ["stop"], warm: ["temp"], graph: ["graph"] },
    derivative: { drag: ["x"], count: ["slope"], chord: ["chord", "run"], other: ["curve"] },
    dice: { twenty: ["count"], long: ["count"], two: ["two-count"], say: ["count"] },
  };
  const needs = table[practicalId]?.[stepId];
  if (!needs) return false;
  return needs.every((type) => types.has(type));
}

function fallback(id: string, types: Set<string>, lang: Lang): string {
  const lines: Record<string, [string, string]> = {
    ohm: [
      "Look at the ammeter with the key open, then with it closed. The difference is the current, after you subtract the zero error yourself.",
      "Key खुली हो तो ammeter देखो, फिर बंद करके। अंतर ही current है, zero error तुम खुद घटाओ।",
    ],
    "meter-bridge": [
      "Move the jockey. The null is where the needle rests and the click dies. Write that centimetre. Do not invent it.",
      "Jockey हिलाओ। Null वहाँ है जहाँ सुई रुके और click मिटे। वही सेन्टीमीटर लिखो। गढ़ो मत।",
    ],
    "convex-lens": [
      "Shift your eye. If the image pin and the image part, parallax is still there. The bench will not hand you f.",
      "आँख हिलाओ। अगर image pin और image अलग हों, parallax बाकी है। Bench f थमाएगा नहीं।",
    ],
    titration: [
      "Near the end, one drop. A flood makes a discordant titre. Read the meniscus at eye level, and read the pH as well as the colour.",
      "अंत के पास एक बूँद। तेज धारा discordant titre बनाती है। Meniscus आँख के स्तर पर पढ़ो, और रंग के साथ pH भी।",
    ],
    salt: [
      "Colour is a clue. The white precipitate that stays in dilute HCl, and the deep blue with excess NH₄OH, are the evidence.",
      "रंग एक संकेत है। तनु HCl में टिका सफेद अवक्षेप, और अधिक NH₄OH से गहरा नीला, यही प्रमाण हैं।",
    ],
    rate: [
      "Stop the clock when the cross goes, not when a number appears. Then change concentration or temperature and watch the wait.",
      "घड़ी तब रोको जब cross जाए, जब कोई संख्या दिखे तब नहीं। फिर concentration या temperature बदलो और इंतजार देखो।",
    ],
    derivative: [
      "Count rise and run on the triangle. The formula can wait until the triangle is clear.",
      "त्रिभुज पर rise और run गिनो। त्रिभुज साफ होने तक सूत्र रुक सकता है।",
    ],
    dice: [
      "Put the average after 20 beside the average after 2000. The short one is allowed to be wrong.",
      "20 के बाद का औसत, 2000 के बाद के औसत के पास रखो। छोटा वाला गलत हो सकता है।",
    ],
  };
  const pair = lines[id] ?? lines.ohm;
  if (types.has("explain")) {
    return pick(lang, "Your sentence is already in the file. If you want a viva question, open the file.", "तुम्हारा वाक्य file में है। Viva प्रश्न चाहिए तो file खोलो।");
  }
  return pick(lang, pair[0], pair[1]);
}
