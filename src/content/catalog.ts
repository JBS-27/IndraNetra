import type { Board, Copy, Role, Subject } from "./copy";
import { FAMILY_PRACTICALS } from "./families";

export interface StepDef {
  id: string;
  role: Role;
  text: Copy;
  safety?: Copy;
  /** When true, this step is one of the choices in the last third. */
  choice?: boolean;
}

export interface PracticalDef {
  id: string;
  kernelId: "circuit" | "metre-bridge" | "optics" | "titration" | "salt" | "kinetics" | "derivative" | "probability";
  boards: Board[];
  classes: Array<11 | 12>;
  subject: Subject;
  minutes: number;
  onePeriod: boolean;
  ncert: Copy;
  title: Copy;
  moment: Copy;
  aim: Copy;
  outcome: Copy;
  prediction: Copy;
  /** Value that means the student holds the common wrong belief. */
  wrong: "yes" | "no";
  misconception: Copy;
  theory: Copy;
  precautions: Copy[];
  exit: Copy;
  jee: Copy[];
  steps: StepDef[];
}

export const PRACTICALS: PracticalDef[] = [
  {
    id: "ohm",
    kernelId: "circuit",
    boards: ["CBSE", "ISC"],
    classes: [12],
    subject: "physics",
    minutes: 40,
    onePeriod: true,
    ncert: {
      en: "NCERT Physics Laboratory Manual, Class 12, Experiment 1 — resistance from a V–I graph.",
      hi: "NCERT Physics Laboratory Manual, कक्षा 12, Experiment 1 — V–I graph से resistance।",
    },
    title: { en: "Ohm’s law and a real circuit", hi: "Ohm’s law और एक असली circuit" },
    moment: {
      en: "A loose wire or a hot coil bends the straight line. Current is not used up in the bulb.",
      hi: "ढीला तार या गर्म coil सीधी रेखा को मोड़ देता है। Bulb में current खर्च नहीं होता।",
    },
    aim: {
      en: "To determine the resistance per unit length of a given wire by plotting potential difference against current, and to see what a real connection does to that line.",
      hi: "दिए गए तार का resistance per unit length, potential difference और current के graph से निकालना, और यह देखना कि एक असली connection उस रेखा का क्या करता है।",
    },
    outcome: {
      en: "Wire a series circuit, apply a zero correction yourself, and read resistance from a line you drew.",
      hi: "Series circuit जोड़ना, zero correction खुद लगाना, और अपनी खींची रेखा से resistance पढ़ना।",
    },
    prediction: {
      en: "Current is used up in the bulb, so an ammeter after the bulb will read less than an ammeter before it.",
      hi: "Bulb current को खर्च कर देता है, इसलिए bulb के बाद ammeter, bulb से पहले वाले ammeter से कम पढ़ेगा।",
    },
    wrong: "yes",
    misconception: {
      en: "A common belief is that the bulb uses up current. Current is the same all around a series loop. The bulb takes energy from the charges. It does not destroy charge.",
      hi: "एक आम धारणा है कि bulb current खर्च कर देता है। Series loop में current हर जगह समान होता है। Bulb charges से energy लेता है। Charge खत्म नहीं होता।",
    },
    theory: {
      en: "For a metal wire at steady temperature, V = IR. The slope of a V–I graph is the resistance. Resistance per unit length is R/L. A hotter wire has a higher resistance, so a point taken after heating leaves the cold line. A loose connection adds a resistance the diagram did not show.",
      hi: "स्थिर ताप पर धातु के तार के लिए V = IR। V–I graph का slope ही resistance है। Resistance per unit length = R/L। गर्म तार का resistance बढ़ता है, इसलिए गर्म बिंदु ठंडी रेखा से हट जाता है। ढीला connection वह resistance जोड़ता है जो आरेख में नहीं था।",
    },
    precautions: [
      { en: "Note the zero error of the ammeter before closing the key.", hi: "Key बंद करने से पहले ammeter की zero error नोट करो।" },
      { en: "The voltmeter goes in parallel with the wire, the ammeter in series.", hi: "Voltmeter तार के parallel में, ammeter series में।" },
      { en: "Do not leave the key closed while you are not taking a reading.", hi: "Reading न लेते समय key बंद मत छोड़ो।" },
      { en: "Connections should be tight and clean.", hi: "Connection कसे और साफ हों।" },
    ],
    exit: {
      en: "What would change on the graph if the coil were left hot for the last two readings?",
      hi: "अगर coil आखिरी दो readings तक गर्म रहे, तो graph पर क्या बदलेगा?",
    },
    jee: [
      {
        en: "A V–I graph is a straight line that misses the origin. Which controlled quantity in your circuit can shift the intercept without changing the slope much?",
        hi: "एक V–I graph सीधी रेखा है और origin से नहीं गुजरती। तुम्हारे circuit की कौन-सी नियंत्रित राशि slope को कम बदले, intercept को हिला सकती है?",
      },
      {
        en: "The same wire is used at two temperatures. Why is the hotter line steeper on a V against I graph?",
        hi: "वही तार दो तापों पर है। V और I के graph पर गर्म रेखा अधिक steep क्यों है?",
      },
    ],
    steps: [
      {
        id: "zero",
        role: "recorder",
        text: {
          en: "Leave the key open. Read the ammeter needle and write the zero error. The scale will not correct itself.",
          hi: "Key खुली छोड़ो। Ammeter की सुई पढ़ो और zero error लिखो। पैमाना अपने आप सुधरता नहीं।",
        },
      },
      {
        id: "loop",
        role: "operator",
        text: {
          en: "Join the battery, key, rheostat, ammeter and the coil in one loop. An open key must mean no current.",
          hi: "Battery, key, rheostat, ammeter और coil को एक loop में जोड़ो। खुली key का अर्थ है current नहीं।",
        },
      },
      {
        id: "volt",
        role: "operator",
        text: {
          en: "Put the voltmeter across the coil only. If you place it in series, the current collapses.",
          hi: "Voltmeter केवल coil के across लगाओ। Series में लगाने पर current गिर जाता है।",
        },
      },
      {
        id: "key",
        role: "narrator",
        text: {
          en: "Close the key and watch the needle. Open it again. Say what the open key did, in exam language.",
          hi: "Key बंद करो और सुई देखो। फिर खोलो। Exam की भाषा में कहो कि खुली key ने क्या किया।",
        },
      },
      {
        id: "readings",
        role: "recorder",
        text: {
          en: "Take five readings at different rheostat settings. Write the needle values, then the corrected values.",
          hi: "Rheostat की अलग-अलग स्थितियों पर पाँच readings लो। पहले सुई की संख्या, फिर corrected मान लिखो।",
        },
      },
      {
        id: "length",
        role: "recorder",
        choice: true,
        text: {
          en: "Measure the length of the wire with the scale. Least count is 0.1 cm. Keep your eye opposite the mark.",
          hi: "Scale से तार की लंबाई नापो। Least count 0.1 cm है। आँख निशान के सामने रखो।",
        },
      },
      {
        id: "graph",
        role: "recorder",
        choice: true,
        text: {
          en: "Choose the scale yourself. Draw the V–I line and read its slope. That slope is your resistance.",
          hi: "Scale खुद चुनो। V–I रेखा खींचो और slope पढ़ो। वही slope तुम्हारा resistance है।",
        },
      },
      {
        id: "disturb",
        role: "skeptic",
        choice: true,
        text: {
          en: "Choose one disturbance: heat the coil, loosen a wire, or move the ammeter to the other side of the bulb.",
          hi: "एक गड़बड़ी चुनो: coil गर्म करो, तार ढीला करो, या ammeter को bulb के दूसरी ओर ले जाओ।",
        },
      },
    ],
  },
  {
    id: "meter-bridge",
    kernelId: "metre-bridge",
    boards: ["CBSE", "ISC"],
    classes: [12],
    subject: "physics",
    minutes: 40,
    onePeriod: true,
    ncert: {
      en: "NCERT Physics Laboratory Manual, Class 12 — resistance of a wire by metre bridge, and its resistivity.",
      hi: "NCERT Physics Laboratory Manual, कक्षा 12 — metre bridge से तार का resistance और resistivity।",
    },
    title: { en: "Metre bridge", hi: "Metre bridge" },
    moment: {
      en: "The click fades at the null point. Reversing the ends moves the balance point.",
      hi: "Null point पर click धीमी पड़ जाती है। सिरे पलटने पर balance point खिसकता है।",
    },
    aim: {
      en: "To find the resistance of a given wire using a metre bridge and hence estimate its resistivity.",
      hi: "Metre bridge से दिए गए तार का resistance निकालना और उसकी resistivity का अनुमान लगाना।",
    },
    outcome: {
      en: "Find a null by ear and needle, then explain why the balance point moves when the ends are reversed.",
      hi: "कान और सुई से null खोजना, फिर बताना कि सिरे पलटने पर balance point क्यों खिसकता है।",
    },
    prediction: {
      en: "If I increase the known resistance, the null point will shift toward the left end.",
      hi: "अगर मैं known resistance बढ़ाऊँ, तो null point बाएँ सिरे की ओर खिसकेगा।",
    },
    wrong: "no",
    misconception: {
      en: "The balance length is not a number you type. It is the place where the two potential drops match, so the galvanometer current dies. Raising the known resistance makes that place move toward the unknown.",
      hi: "Balance length कोई टाइप की हुई संख्या नहीं है। वह जगह है जहाँ दोनों potential drop मिलते हैं और galvanometer का current मिटता है। Known resistance बढ़ाने पर वह जगह unknown की ओर खिसकती है।",
    },
    theory: {
      en: "At balance, X/R = l / (100 − l), where l is in centimetres from the left end and the unknown sits in the left gap. End resistance in a worn bridge shifts the null a little. Resistivity is ρ = RA/L. The diameter comes from a screw gauge, and the zero error is yours to apply.",
      hi: "Balance पर X/R = l / (100 − l), जहाँ l बाएँ सिरे से सेन्टीमीटर में है और unknown बाएँ gap में है। घिसे bridge की end resistance null को थोड़ा हिलाती है। Resistivity ρ = RA/L। व्यास screw gauge से आता है, और zero error तुम्हें लगानी है।",
    },
    precautions: [
      { en: "Close the key only while you are looking for the null.", hi: "Null खोजते समय ही key बंद करो।" },
      { en: "The jockey should touch the wire lightly. Do not scrape it.", hi: "Jockey तार को हल्के से छुए। रगड़ो मत।" },
      { en: "Apply the screw-gauge zero correction yourself.", hi: "Screw gauge की zero correction खुद लगाओ।" },
      { en: "Include the end correction in your sources of error if the kit is worn.", hi: "अगर kit घिसी है, तो end correction को sources of error में लिखो।" },
    ],
    exit: {
      en: "What would change if the known resistance were doubled and the wire stayed the same?",
      hi: "अगर known resistance दोगुनी हो और तार वही रहे, तो क्या बदलेगा?",
    },
    jee: [
      {
        en: "Your balance length is past 80 cm. Why does the manual tell you to choose a different known resistance?",
        hi: "तुम्हारी balance length 80 cm के पार है। Manual दूसरी known resistance क्यों चुनने को कहता है?",
      },
      {
        en: "The two balance lengths, before and after reversing, do not add to 100 cm. Name one real reason.",
        hi: "पलटने से पहले और बाद की balance lengths का योग 100 cm नहीं है। एक असली कारण बताओ।",
      },
    ],
    steps: [
      {
        id: "box",
        role: "operator",
        text: {
          en: "Set the resistance box. Start near 2 ohm so the null is not stuck at one end.",
          hi: "Resistance box सेट करो। 2 ohm के पास से शुरू करो ताकि null एक सिरे पर अटका न रहे।",
        },
      },
      {
        id: "null",
        role: "operator",
        text: {
          en: "Close the key. Slide the jockey until the needle rests and the click fades. Write that length yourself.",
          hi: "Key बंद करो। Jockey को तब तक खिसकाओ जब तक सुई रुक जाए और click धीमी पड़ जाए। वह लंबाई खुद लिखो।",
        },
      },
      {
        id: "reverse",
        role: "skeptic",
        text: {
          en: "Reverse the ends. Find the new null. It should move.",
          hi: "सिरे पलटो। नया null खोजो। उसे खिसकना चाहिए।",
        },
      },
      {
        id: "screw",
        role: "recorder",
        choice: true,
        text: {
          en: "Read the screw gauge with its jaws shut. Write the zero error, then the diameter of the wire.",
          hi: "जबड़े बंद करके screw gauge पढ़ो। Zero error लिखो, फिर तार का व्यास।",
        },
      },
      {
        id: "rho",
        role: "recorder",
        choice: true,
        text: {
          en: "Measure the length and calculate resistivity from your own X, L and d.",
          hi: "लंबाई नापो और अपने X, L और d से resistivity निकालो।",
        },
      },
    ],
  },
  {
    id: "convex-lens",
    kernelId: "optics",
    boards: ["CBSE", "ISC"],
    classes: [12],
    subject: "physics",
    minutes: 40,
    onePeriod: true,
    ncert: {
      en: "NCERT Physics Laboratory Manual, Class 12 — focal length of a convex lens from u and v.",
      hi: "NCERT Physics Laboratory Manual, कक्षा 12 — u और v से convex lens की focal length।",
    },
    title: { en: "Focal length of a convex lens", hi: "Convex lens की focal length" },
    moment: {
      en: "You cannot record a reading until parallax between the pin and the image is gone, or you accept the error and live with it.",
      hi: "जब तक pin और image के बीच parallax न मिटे, reading दर्ज नहीं होगी — या तुम error स्वीकार करके उसके साथ चलो।",
    },
    aim: {
      en: "To find the focal length of a convex lens by plotting u and v, after removing parallax.",
      hi: "Parallax हटाकर, u और v के graph से convex lens की focal length निकालना।",
    },
    outcome: {
      en: "Align an image pin until the eye sees no parallax, apply a vernier zero correction, and find f.",
      hi: "Image pin को तब तक मिलाओ जब तक आँख को parallax न दिखे, vernier की zero correction लगाओ, और f निकालो।",
    },
    prediction: {
      en: "If I move the object pin closer to the lens, still outside the focus, the image pin must move closer too.",
      hi: "अगर object pin को lens के पास लाऊँ, focus के बाहर ही, तो image pin को भी पास लाना पड़ेगा।",
    },
    wrong: "yes",
    misconception: {
      en: "Closer object does not mean a closer real image. Outside the focus, bringing the object toward the lens sends the real image farther away. That is why the screen runs out of bench when the object nears F.",
      hi: "पास की वस्तु का अर्थ पास का real image नहीं है। Focus के बाहर वस्तु को lens की ओर लाने पर real image दूर चला जाता है। इसलिए वस्तु F के पास आते ही screen bench पर नहीं समाती।",
    },
    theory: {
      en: "With the new Cartesian sign convention, 1/v − 1/u = 1/f. A real object has negative u. A convex lens has positive f. A real image has positive v. The school formula in magnitudes, 1/v + 1/u = 1/f, is the same statement. Parallax is removed when the image pin and the image of the object pin move together as the eye moves.",
      hi: "New Cartesian sign convention में 1/v − 1/u = 1/f। वास्तविक वस्तु का u ऋणात्मक है। Convex lens का f धनात्मक है। Real image का v धनात्मक है। परिमाणों वाला स्कूल सूत्र 1/v + 1/u = 1/f वही बात है। Parallax तब मिटता है जब image pin और वस्तु के pin का image आँख हिलाने पर साथ चलें।",
    },
    precautions: [
      { en: "The object pin must be upright, and the lens centred on the bench.", hi: "Object pin सीधा हो, और lens bench के बीच में।" },
      { en: "Remove parallax before you write u and v.", hi: "u और v लिखने से पहले parallax हटाओ।" },
      { en: "Apply the vernier zero correction. The rider will not do it for you.", hi: "Vernier की zero correction लगाओ। Rider यह काम खुद नहीं करेगा।" },
      { en: "Keep the object outside the focal length if you want a real image on the bench.", hi: "Bench पर real image चाहिए तो वस्तु को focal length के बाहर रखो।" },
    ],
    exit: {
      en: "What would change if the object pin were placed between the lens and its focus?",
      hi: "अगर object pin को lens और उसके focus के बीच रख दें, तो क्या बदलेगा?",
    },
    jee: [
      {
        en: "Your u–v readings give f = 15 cm. The object is shifted from 3f to 1.5f. What happens to v, and is the image still real?",
        hi: "तुम्हारे u–v से f = 15 cm है। वस्तु 3f से 1.5f पर आती है। v का क्या होगा, और image real रहेगी?",
      },
      {
        en: "A parallax error made every image distance 0.4 cm too large. Does f rise or fall? Use one of your own rows.",
        hi: "Parallax error से हर image distance 0.4 cm अधिक हो गई। f बढ़ेगा या घटेगा? अपनी एक पंक्ति लो।",
      },
    ],
    steps: [
      {
        id: "zero",
        role: "recorder",
        text: {
          en: "Read the vernier with the rider at the index, as if the jaws were shut. Write the zero error and the correction.",
          hi: "Rider को index पर रखकर vernier पढ़ो, जैसे जबड़े बंद हों। Zero error और correction लिखो।",
        },
      },
      {
        id: "place",
        role: "operator",
        text: {
          en: "Put the object pin beyond 2F. Move the image pin until you are ready to test parallax.",
          hi: "Object pin को 2F से दूर रखो। Image pin को वहाँ लाओ जहाँ parallax जाँचना हो।",
        },
      },
      {
        id: "parallax",
        role: "operator",
        text: {
          en: "Shift your eye. If the pins part company, you still have parallax. Record only when they move together, or accept the error on purpose.",
          hi: "आँख हिलाओ। अगर pin अलग-अलग चलें, parallax अभी है। तभी दर्ज करो जब वे साथ चलें, या error जानबूझकर स्वीकार करो।",
        },
      },
      {
        id: "repeat",
        role: "recorder",
        choice: true,
        text: {
          en: "Take at least three object distances. Write the corrected u and v, then f for each row.",
          hi: "कम से कम तीन object distances लो। Corrected u और v लिखो, फिर हर पंक्ति का f।",
        },
      },
      {
        id: "closer",
        role: "skeptic",
        choice: true,
        text: {
          en: "Move the object closer, still outside F. Watch which way the image pin has to travel.",
          hi: "वस्तु को पास लाओ, F के बाहर ही। देखो image pin को किस ओर जाना पड़ता है।",
        },
      },
    ],
  },
  {
    id: "titration",
    kernelId: "titration",
    boards: ["CBSE", "ISC"],
    classes: [11, 12],
    subject: "chemistry",
    minutes: 40,
    onePeriod: true,
    ncert: {
      en: "NCERT Chemistry Laboratory Manual — strength of NaOH against standard oxalic acid, phenolphthalein.",
      hi: "NCERT Chemistry Laboratory Manual — standard oxalic acid से NaOH की strength, phenolphthalein।",
    },
    title: { en: "Acid–base titration", hi: "Acid–base titration" },
    moment: {
      en: "The last drop changes the flask. One drop past the end is why concordant titres matter.",
      hi: "आखिरी बूँद flask बदल देती है। अंत के बाद एक बूँद ही बताती है कि concordant titre क्यों मायने रखते हैं।",
    },
    aim: {
      en: "To determine the strength of a given sodium hydroxide solution by titrating it against M/20 oxalic acid.",
      hi: "M/20 oxalic acid के विरुद्ध अनुमापन करके दिए गए sodium hydroxide विलयन की strength निकालना।",
    },
    outcome: {
      en: "Rinse, read a meniscus at eye level, finish dropwise, and reject a discordant titre with a reason.",
      hi: "Rinse करना, meniscus आँख के स्तर पर पढ़ना, बूँद-बूँद समाप्त करना, और एक discordant titre कारण सहित छोड़ना।",
    },
    prediction: {
      en: "The titre will be about the same as the pipette, near 20 mL, because both solutions are “standard enough”.",
      hi: "Titre लगभग pipette जितना, 20 mL के पास होगा, क्योंकि दोनों विलयन “काफी standard” हैं।",
    },
    wrong: "yes",
    misconception: {
      en: "The pipette volume and the titre match only when the two normalities match. Phenolphthalein changes over a breath of a drop. A flood hides that drop, and the titre is no longer concordant.",
      hi: "Pipette का आयतन और titre तभी मिलते हैं जब दोनों normality मिलें। Phenolphthalein एक साँस जितनी बूँद पर बदलता है। तेज धारा उस बूँद को छिपा देती है, और titre concordant नहीं रहता।",
    },
    theory: {
      en: "Oxalic acid is dibasic, so M/20 oxalic acid is 0.1 N. At the endpoint, N₁V₁ = N₂V₂. Strength of NaOH in g/L is normality × 40. Concordant titres agree within 0.1 mL. The indicator shows pink in alkali and colourless in acid; the pH number is there because colour is not the only signal.",
      hi: "Oxalic acid dibasic है, इसलिए M/20 oxalic acid 0.1 N है। Endpoint पर N₁V₁ = N₂V₂। NaOH की strength g/L में normality × 40 है। Concordant titre 0.1 mL के अंदर मिलते हैं। Indicator क्षार में गुलाबी और अम्ल में रंगहीन है। pH संख्या इसलिए है क्योंकि रंग अकेला संकेत नहीं है।",
    },
    precautions: [
      { en: "Rinse the burette with oxalic acid, not only with water.", hi: "Burette को oxalic acid से खंगालो, केवल पानी से नहीं।" },
      { en: "Read the lower meniscus with your eye level.", hi: "निचला meniscus आँख के स्तर पर पढ़ो।" },
      { en: "Add dropwise near the endpoint.", hi: "Endpoint के पास बूँद-बूँद डालो।" },
      { en: "Do not smell the flask. Wafting is a real-lab skill; this bench will not train you to inhale chemicals.", hi: "Flask को सूँघो मत। असली प्रयोगशाला में wafting सिखाया जाता है; यह bench रसायन सूँघना नहीं सिखाएगा।" },
    ],
    exit: {
      en: "What would change in the titre if the pipette had delivered 10 mL of the same NaOH instead of 20 mL?",
      hi: "अगर pipette उसी NaOH के 20 mL की जगह 10 mL दे, तो titre में क्या बदलेगा?",
    },
    jee: [
      {
        en: "Your concordant titre is higher than a classmate’s for the same oxalic acid. Whose NaOH is more concentrated? Say it from N₁V₁ = N₂V₂, using your numbers.",
        hi: "उसी oxalic acid पर तुम्हारा concordant titre सहपाठी से अधिक है। किसका NaOH अधिक सांद्र है? अपने अंकों के साथ N₁V₁ = N₂V₂ से कहो।",
      },
      {
        en: "Phenolphthalein is a fair indicator here, methyl orange is a poor one. What does that say about the pH at equivalence?",
        hi: "यहाँ phenolphthalein उचित indicator है, methyl orange नहीं। Equivalence पर pH के बारे में यह क्या कहता है?",
      },
    ],
    steps: [
      {
        id: "labels",
        role: "operator",
        text: {
          en: "Read both labels before you pour. Oxalic acid goes in the burette. NaOH goes in the flask.",
          hi: "डालने से पहले दोनों label पढ़ो। Burette में oxalic acid। Flask में NaOH।",
        },
        safety: {
          en: "Both solutions are school-lab strength. Wipe a spill. Do not taste or inhale.",
          hi: "दोनों विलयन स्कूल-लैब की strength के हैं। गिरे तो पोंछो। चखो या सूँघो मत।",
        },
      },
      {
        id: "rinse",
        role: "operator",
        text: {
          en: "Rinse the burette with the oxalic acid. Skipping this is allowed. The first titre will then be quietly wrong.",
          hi: "Burette को oxalic acid से खंगालो। इसे छोड़ना भी एक चुनाव है। तब पहला titre चुपचाप गलत होगा।",
        },
      },
      {
        id: "flask",
        role: "operator",
        text: {
          en: "Pipette 20.0 mL of NaOH into the flask and add phenolphthalein. The flask starts pink. Watch the pH as well as the colour.",
          hi: "Flask में NaOH के 20.0 mL pipette से लो और phenolphthalein डालो। Flask गुलाबी शुरू होता है। रंग के साथ pH भी देखो।",
        },
      },
      {
        id: "titrate",
        role: "operator",
        text: {
          en: "Run in acid. Near the end, one drop at a time, until the pink just disappears. Write the burette readings yourself.",
          hi: "अम्ल गिराओ। अंत के पास एक-एक बूँद, जब तक गुलाबी रंग बस गायब हो। Burette की readings खुद लिखो।",
        },
      },
      {
        id: "repeat",
        role: "recorder",
        choice: true,
        text: {
          en: "Repeat until you have two concordant titres. Mark the one you will reject, and say why.",
          hi: "तब तक दोहराओ जब तक दो concordant titre न मिलें। जिसे छोड़ोगे उसे चिह्नित करो, और कारण कहो।",
        },
      },
      {
        id: "strength",
        role: "narrator",
        choice: true,
        text: {
          en: "Calculate the normality and the strength in g/L from the concordant mean. Write the result sentence yourself.",
          hi: "Concordant mean से normality और g/L में strength निकालो। परिणाम का वाक्य खुद लिखो।",
        },
      },
    ],
  },
  {
    id: "salt",
    kernelId: "salt",
    boards: ["CBSE", "ISC"],
    classes: [11, 12],
    subject: "chemistry",
    minutes: 40,
    onePeriod: true,
    ncert: {
      en: "NCERT / CBSE qualitative analysis — one simple salt. ISC calls this a single salt.",
      hi: "NCERT / CBSE qualitative analysis — एक साधारण लवण। ISC इसे single salt कहता है।",
    },
    title: { en: "Qualitative analysis, one salt", hi: "Qualitative analysis, एक लवण" },
    moment: {
      en: "Tests are evidence. The wrong order wastes a limited sample. Flame, precipitate and gas each have a reason.",
      hi: "परीक्षण प्रमाण हैं। गलत क्रम सीमित नमूना बर्बाद करता है। लौ, अवक्षेप और गैस, हर एक का कारण है।",
    },
    aim: {
      en: "To identify the acid radical and the basic radical of Salt A from the tests you actually perform.",
      hi: "जो परीक्षण तुम सच में करो, उनसे Salt A का acid radical और basic radical पहचानना।",
    },
    outcome: {
      en: "Plan a short sequence, treat a negative test as evidence, and name the ions only after the confirmatory tests.",
      hi: "छोटा क्रम बनाना, ऋणात्मक परीक्षण को भी प्रमाण मानना, और confirmatory tests के बाद ही आयनों के नाम लिखना।",
    },
    prediction: {
      en: "The blue colour already proves the salt, so the confirmatory tests are optional.",
      hi: "नीला रंग लवण को पहले ही सिद्ध कर देता है, इसलिए confirmatory tests वैकल्पिक हैं।",
    },
    wrong: "yes",
    misconception: {
      en: "Colour is a clue from a hydrated ion. It is not the confirmatory test. Sulphate is confirmed by a white precipitate that refuses dilute HCl. Copper is confirmed by the deep blue ammine, not by the first glance.",
      hi: "रंग hydrated ion का संकेत है। वह confirmatory test नहीं है। Sulphate की पुष्टि वह सफेद अवक्षेप है जो तनु HCl में नहीं घुलता। Copper की पुष्टि गहरा नीला ammine है, पहली नज़र नहीं।",
    },
    theory: {
      en: "Salt A is an unknown on this bench. You may use dilute HCl, BaCl₂, NaOH, NH₄OH, AgNO₃, and a flame test with concentrated HCl. A portion used is a portion gone. Microscale uses less mass and less money, and the observation stays the same. Do not smell the tubes.",
      hi: "इस bench पर Salt A अज्ञात है। तनु HCl, BaCl₂, NaOH, NH₄OH, AgNO₃, और सांद्र HCl के साथ flame test ले सकते हो। जो portion चला गया, वह गया। Microscale में द्रव्य और पैसा कम लगता है, अवलोकन वही रहता है। नलियाँ सूँघो मत।",
    },
    precautions: [
      { en: "Read the label, including the hazard mark, before you pour.", hi: "डालने से पहले label और hazard चिह्न पढ़ो।" },
      { en: "Concentrated HCl is for the flame test only. It is corrosive.", hi: "सांद्र HCl केवल flame test के लिए है। यह corrosive है।" },
      { en: "Use a fresh portion for each test unless the procedure says to continue.", hi: "हर परीक्षण के लिए नया portion लो, जब तक विधि आगे बढ़ने को न कहे।" },
      { en: "A flame colour is preliminary. Write it that way.", hi: "लौ का रंग preliminary है। उसे वैसे ही लिखो।" },
    ],
    exit: {
      en: "What would change if you had spent the last portion on silver nitrate before the sulphate test?",
      hi: "अगर आखिरी portion sulphate test से पहले silver nitrate पर खर्च हो जाता, तो क्या बदलता?",
    },
    jee: [
      {
        en: "BaCl₂ gave a white precipitate insoluble in dilute HCl. Why does that single sentence rule out chloride and point to sulphate?",
        hi: "BaCl₂ ने तनु HCl में अघुलनशील सफेद अवक्षेप दिया। यह एक वाक्य chloride को क्यों काटता है और sulphate की ओर क्यों इशारा करता है?",
      },
      {
        en: "Excess NH₄OH dissolved the pale blue precipitate into a deep blue solution. Which ion is that test for, and why was the flame test not enough?",
        hi: "अधिक NH₄OH ने हल्के नीले अवक्षेप को गहरे नीले विलयन में घोला। यह परीक्षण किस आयन का है, और flame test काफ़ी क्यों नहीं था?",
      },
    ],
    steps: [
      {
        id: "look",
        role: "skeptic",
        text: {
          en: "Look at Salt A. Write colour and texture. Do not name the salt yet.",
          hi: "Salt A को देखो। रंग और बनावट लिखो। अभी लवण का नाम मत लिखो।",
        },
      },
      {
        id: "flame",
        role: "operator",
        text: {
          en: "Clean the wire with concentrated HCl, touch the salt, and hold it in the flame. Guess the ion. The name appears after you commit.",
          hi: "तार को सांद्र HCl से साफ करो, लवण छुओ, और लौ में रखो। आयन का अनुमान लगाओ। नाम तब आएगा जब तुम चुन लोगे।",
        },
        safety: {
          en: "Concentrated hydrochloric acid is corrosive. Keep it on the wire, not on skin or bench.",
          hi: "सांद्र hydrochloric acid corrosive है। इसे तार पर रखो, त्वचा या bench पर नहीं।",
        },
      },
      {
        id: "anion",
        role: "operator",
        text: {
          en: "Dilute HCl first: is there a gas? Then test the solution with BaCl₂. A negative result is still a result.",
          hi: "पहले तनु HCl: क्या गैस है? फिर विलयन को BaCl₂ से जाँचो। ऋणात्मक परिणाम भी परिणाम है।",
        },
      },
      {
        id: "cation",
        role: "operator",
        choice: true,
        text: {
          en: "Choose the cation test you still have sample for. NaOH and excess NH₄OH tell different parts of the story.",
          hi: "वह cation test चुनो जिसके लिए नमूना बचा है। NaOH और अधिक NH₄OH कहानी के अलग हिस्से कहते हैं।",
        },
      },
      {
        id: "name",
        role: "narrator",
        choice: true,
        text: {
          en: "Name the acid radical and the basic radical in one exam sentence, tied to the tests you did.",
          hi: "Acid radical और basic radical का नाम एक exam वाक्य में लिखो, उन्हीं tests से जिन्हें तुमने किया।",
        },
      },
    ],
  },
  {
    id: "rate",
    kernelId: "kinetics",
    boards: ["CBSE", "ISC"],
    classes: [12],
    subject: "chemistry",
    minutes: 40,
    onePeriod: true,
    ncert: {
      en: "CBSE Class 12 content-based experiment — effect of concentration and temperature on rate. The thiosulphate cross.",
      hi: "CBSE कक्षा 12 content-based experiment — rate पर concentration और temperature का प्रभाव। Thiosulphate का cross।",
    },
    title: { en: "Rate of reaction", hi: "Rate of reaction" },
    moment: {
      en: "Concentration and temperature change the clock. Particles show the collisions. The graph shows the law.",
      hi: "Concentration और temperature घड़ी बदलते हैं। कण टक्कर दिखाते हैं। Graph नियम दिखाता है।",
    },
    aim: {
      en: "To study how the time for the sulphur cross to disappear depends on thiosulphate concentration and on temperature.",
      hi: "यह देखना कि सल्फर का cross गायब होने का समय thiosulphate की concentration और ताप पर कैसे निर्भर करता है।",
    },
    outcome: {
      en: "Stop the clock with your own eyes, compare a cold run with a hot run, and choose the axes of the graph.",
      hi: "अपनी आँखों से घड़ी रोकना, ठंडे और गर्म रन की तुलना करना, और graph के अक्ष खुद चुनना।",
    },
    prediction: {
      en: "A warmer flask will hide the cross later, because heat makes the reaction lazy.",
      hi: "गर्म flask cross को देर से छिपाएगा, क्योंकि गर्मी अभिक्रिया को सुस्त कर देती है।",
    },
    wrong: "yes",
    misconception: {
      en: "Heat does not make this reaction lazy. Faster particles collide more usefully, so the cross disappears sooner. Dilution does the opposite: fewer thiosulphate ions, a longer wait. The school graph is 1/t against the volume of thiosulphate.",
      hi: "गर्मी इस अभिक्रिया को सुस्त नहीं करती। तेज कण अधिक उपयोगी टक्कर करते हैं, इसलिए cross जल्दी गायब होता है। Dilution उलटा करता है: कम thiosulphate आयन, लंबा इंतजार। स्कूल का graph thiosulphate के आयतन के विरुद्ध 1/t है।",
    },
    theory: {
      en: "Na₂S₂O₃ + 2 HCl → 2 NaCl + SO₂ + S + H₂O. Colloidal sulphur hides the cross. In this practical, time is inversely proportional to the thiosulphate volume when the mixture is made up to the same total. A water bath or a hot classroom changes the same clock. The model is a Class 12 teaching model, labelled as such.",
      hi: "Na₂S₂O₃ + 2 HCl → 2 NaCl + SO₂ + S + H₂O। कोलॉइडी सल्फर cross को छिपा देता है। इस practical में, समान कुल आयतन पर समय thiosulphate के आयतन के व्युत्क्रमानुपाती है। Water bath या गर्म कक्षा वही घड़ी बदल देती है। यह मॉडल कक्षा 12 का शिक्षण मॉडल है, और वैसा ही लिखा है।",
    },
    precautions: [
      { en: "Start the clock as the acid goes in, not before.", hi: "घड़ी तब चलाओ जब अम्ल डालो, उससे पहले नहीं।" },
      { en: "Look at the same cross, from the same height, every time.", hi: "हर बार उसी cross को, उसी ऊँचाई से देखो।" },
      { en: "Do not sniff the sulphur dioxide. The bench shows a gas cue and keeps your nose out of it.", hi: "Sulphur dioxide सूँघो मत। Bench गैस का संकेत दिखाता है और नाक को दूर रखता है।" },
      { en: "Write the temperature of the run. A 36°C room is not the 25°C table.", hi: "रन का ताप लिखो। 36°C का कमरा 25°C की तालिका नहीं है।" },
    ],
    exit: {
      en: "What would change if you kept the thiosulphate the same and warmed only the acid?",
      hi: "अगर thiosulphate वही रहे और केवल अम्ल गर्म किया जाए, तो क्या बदलेगा?",
    },
    jee: [
      {
        en: "Your graph of 1/t against volume is straight. What does the intercept say, and what would a curve have meant?",
        hi: "आयतन के विरुद्ध 1/t का graph सीधा है। Intercept क्या कहता है, और वक्र का क्या अर्थ होता?",
      },
      {
        en: "Two runs at the same concentration differ only in temperature. Which variable did you control, and which did you change?",
        hi: "समान concentration के दो रन केवल ताप में भिन्न हैं। किस चर को नियंत्रित किया, किसे बदला?",
      },
    ],
    steps: [
      {
        id: "mix",
        role: "operator",
        text: {
          en: "Choose a volume of 0.1 M thiosulphate, make it up with water, and set the temperature.",
          hi: "0.1 M thiosulphate का आयतन चुनो, पानी से पूरा करो, और ताप तय करो।",
        },
        safety: {
          en: "Sulphur dioxide is produced. Keep your face away from the mouth of the flask.",
          hi: "Sulphur dioxide बनती है। चेहरा flask के मुँह से दूर रखो।",
        },
      },
      {
        id: "time",
        role: "recorder",
        text: {
          en: "Add the acid and watch the cross. Stop when you can no longer see it. The clock does not stop itself.",
          hi: "अम्ल डालो और cross देखो। जब वह दिखना बंद हो जाए, घड़ी रोको। घड़ी अपने आप नहीं रुकती।",
        },
      },
      {
        id: "dilute",
        role: "skeptic",
        choice: true,
        text: {
          en: "Repeat with a different volume. Keep the temperature still.",
          hi: "दूसरे आयतन के साथ दोहराओ। ताप वही रहने दो।",
        },
      },
      {
        id: "warm",
        role: "skeptic",
        choice: true,
        text: {
          en: "Repeat one volume at the other temperature: your city, or the NCERT 25°C table.",
          hi: "एक आयतन दूसरे ताप पर दोहराओ: अपने शहर पर, या NCERT की 25°C तालिका पर।",
        },
      },
      {
        id: "graph",
        role: "recorder",
        choice: true,
        text: {
          en: "Choose the axes. A useful school graph is 1/t against the volume of thiosulphate.",
          hi: "अक्ष चुनो। स्कूल का उपयोगी graph thiosulphate के आयतन के विरुद्ध 1/t है।",
        },
      },
    ],
  },
  {
    id: "derivative",
    kernelId: "derivative",
    boards: ["CBSE", "ISC"],
    classes: [11, 12],
    subject: "mathematics",
    minutes: 35,
    onePeriod: true,
    ncert: {
      en: "NCERT Mathematics — the derivative as the slope of a tangent. A portfolio activity, not a wet practical.",
      hi: "NCERT Mathematics — tangent के slope के रूप में derivative। एक portfolio activity, wet practical नहीं।",
    },
    title: { en: "Derivative as a tangent", hi: "Derivative, एक tangent के रूप में" },
    moment: {
      en: "Dragging a point builds a slope triangle. You see the derivative before the formula arrives.",
      hi: "बिंदु को खींचने से slope का त्रिभुज बनता है। सूत्र आने से पहले derivative दिखता है।",
    },
    aim: {
      en: "To see the derivative of a curve as the slope of its tangent, by drawing the slope triangle yourself.",
      hi: "Slope का त्रिभुज खुद खींचकर यह देखना कि वक्र का derivative उसकी tangent का slope है।",
    },
    outcome: {
      en: "Read rise over run from a triangle on the tangent, then meet the formula in the exam view.",
      hi: "Tangent पर बने त्रिभुज से rise/run पढ़ना, फिर exam view में सूत्र से मिलना।",
    },
    prediction: {
      en: "On y = x², the tangent at x = 3 is no steeper than the tangent at x = 1.",
      hi: "y = x² पर x = 3 की tangent, x = 1 की tangent से अधिक steep नहीं है।",
    },
    wrong: "yes",
    misconception: {
      en: "The steepness is the derivative. On y = x² it grows as x grows. A wide chord is not the tangent: from 2 to 3 the chord of y = x² rises 5, while the tangent at 2 rises 4 for a run of 1.",
      hi: "ढलान ही derivative है। y = x² पर x बढ़ने से वह बढ़ती है। चौड़ी chord tangent नहीं है: 2 से 3 तक y = x² की chord 5 चढ़ती है, जबकि x = 2 की tangent एक के run पर 4 चढ़ती है।",
    },
    theory: {
      en: "The slope of the tangent at x is the limit of the chord slopes as the run shrinks. For y = x² that limit is 2x. For y = x³ it is 3x². For y = 2x + 1 it is 2 everywhere. The formula stays in the exam view until the triangle is visible.",
      hi: "x पर tangent का slope, run सिकुड़ने पर chord के slopes की सीमा है। y = x² के लिए वह सीमा 2x है। y = x³ के लिए 3x²। y = 2x + 1 के लिए हर जगह 2। त्रिभुज दिखने तक सूत्र exam view में रहता है।",
    },
    precautions: [
      { en: "Count the grid. Do not guess the rise.", hi: "ग्रिड गिनो। Rise का अनुमान मत लगाओ।" },
      { en: "A chord across a long run is not the tangent.", hi: "लंबे run की chord tangent नहीं है।" },
      { en: "Write the slope with the point it belongs to.", hi: "Slope के साथ वह बिंदु लिखो जिसका वह है।" },
    ],
    exit: {
      en: "What would change in the triangle if you moved from x = 2 to x = −2 on y = x²?",
      hi: "y = x² पर x = 2 से x = −2 जाने पर त्रिभुज में क्या बदलेगा?",
    },
    jee: [
      {
        en: "The tangent at x = a on y = x² has slope 2a. What does the sign of the slope say about the curve on the left of the y-axis?",
        hi: "y = x² पर x = a की tangent का slope 2a है। Slope का चिह्न y-अक्ष के बाईं ओर वक्र के बारे में क्या कहता है?",
      },
      {
        en: "You drew a chord of run 1 and called it the derivative. For which of the three curves is that chord already exact?",
        hi: "तुमने run 1 की chord को derivative कह दिया। तीन वक्रों में से किस पर वह chord पहले से सटीक है?",
      },
    ],
    steps: [
      {
        id: "drag",
        role: "operator",
        text: {
          en: "Drag the point along y = x². Watch the triangle. Do not open the formula yet.",
          hi: "बिंदु को y = x² पर खींचो। त्रिभुज देखो। सूत्र अभी मत खोलो।",
        },
      },
      {
        id: "count",
        role: "recorder",
        text: {
          en: "Set the run to 1 unit. Count the rise on the grid. Write the slope as rise/run.",
          hi: "Run को 1 इकाई रखो। ग्रिड पर rise गिनो। Slope को rise/run लिखो।",
        },
      },
      {
        id: "chord",
        role: "skeptic",
        choice: true,
        text: {
          en: "Show the chord beside the tangent. Shrink the run until the two slopes agree.",
          hi: "Tangent के पास chord दिखाओ। Run को तब तक सिकोड़ो जब तक दोनों slope मिलें।",
        },
      },
      {
        id: "other",
        role: "narrator",
        choice: true,
        text: {
          en: "Move to another curve. Say, in one sentence, what the triangle and the derivative share.",
          hi: "दूसरे वक्र पर जाओ। एक वाक्य में कहो कि त्रिभुज और derivative में क्या समान है।",
        },
      },
    ],
  },
  {
    id: "dice",
    kernelId: "probability",
    boards: ["CBSE", "ISC"],
    classes: [11, 12],
    subject: "mathematics",
    minutes: 30,
    onePeriod: true,
    ncert: {
      en: "NCERT Mathematics — probability as a long-run frequency. A portfolio activity.",
      hi: "NCERT Mathematics — लंबी दौड़ की आवृत्ति के रूप में probability। एक portfolio activity।",
    },
    title: { en: "A probability experiment", hi: "एक probability प्रयोग" },
    moment: {
      en: "The running average settles. A short run lies. A long run tells the truth.",
      hi: "चलता औसत जम जाता है। छोटी दौड़ झूठ बोलती है। लंबी दौड़ सच कहती है।",
    },
    aim: {
      en: "To watch the mean of a fair die settle, and to estimate the chance of a sum of 7 with two dice.",
      hi: "एक निष्पक्ष पासे का माध्य जमते देखना, और दो पासों पर योग 7 की संभावना का अनुमान लगाना।",
    },
    outcome: {
      en: "Compare 20 rolls with 2000, and say why a single lucky run is not the probability.",
      hi: "20 फेंकों की 2000 से तुलना करना, और कहना कि एक भाग्यशाली दौड़ probability नहीं है।",
    },
    prediction: {
      en: "After only 20 rolls, the average will already lie within 0.1 of 3.5.",
      hi: "केवल 20 फेंकों के बाद औसत 3.5 के 0.1 के अंदर आ ही जाएगा।",
    },
    wrong: "yes",
    misconception: {
      en: "3.5 is the long-run mean of a fair die, not a promise about twenty throws. Early averages wander. Two dice show the same lesson: the share of sums equal to 7 wanders, then sits near 6/36.",
      hi: "3.5 एक निष्पक्ष पासे का लंबी-दौड़ माध्य है, बीस फेंकों का वादा नहीं। शुरू के औसत भटकते हैं। दो पासे वही पाठ पढ़ाते हैं: योग 7 का हिस्सा भटकता है, फिर 6/36 के पास बैठता है।",
    },
    theory: {
      en: "A fair die has mean (1+2+3+4+5+6)/6 = 3.5. With two dice, six of the thirty-six equally likely pairs sum to 7, so the probability is 1/6. A short relative frequency is an estimate. The estimate settles as the run grows. The seed of a run is fixed, so a replay shows the same throws.",
      hi: "एक निष्पक्ष पासे का माध्य (1+2+3+4+5+6)/6 = 3.5 है। दो पासों में छत्तीस समान युग्मों में से छह का योग 7 है, इसलिए probability 1/6 है। छोटी सापेक्ष आवृत्ति एक अनुमान है। दौड़ बढ़ने पर अनुमान जमता है। रन का seed स्थिर है, इसलिए replay वही फेंक दिखाता है।",
    },
    precautions: [
      { en: "Do not stop at the first pretty average.", hi: "पहले सुंदर औसत पर मत रुको।" },
      { en: "Write the number of trials beside the estimate.", hi: "अनुमान के साथ trials की संख्या लिखो।" },
      { en: "A two-dice sum is a different experiment. Say which one you are reporting.", hi: "दो पासों का योग दूसरा प्रयोग है। बताओ कि तुम किसे लिख रहे हो।" },
    ],
    exit: {
      en: "What would change if the die were biased toward 6 and you only rolled it twenty times?",
      hi: "अगर पासा 6 की ओर झुका हो और तुम उसे केवल बीस बार फेंको, तो क्या बदलेगा?",
    },
    jee: [
      {
        en: "Your 20-roll average was far from 3.5, and your 2000-roll average was close. Which one belongs in a probability statement, and why?",
        hi: "तुम्हारा 20 फेंकों का औसत 3.5 से दूर था, और 2000 का पास। Probability के कथन में कौन आता है, और क्यों?",
      },
      {
        en: "In the 6×6 sample space, how many outcomes sum to 7? Why is that not the same as the number of 7s in your first twenty throws?",
        hi: "6×6 sample space में कितने परिणामों का योग 7 है? वह तुम्हारे पहले बीस फेंकों में 7 की संख्या के समान क्यों नहीं है?",
      },
    ],
    steps: [
      {
        id: "twenty",
        role: "operator",
        text: {
          en: "Roll twenty times. Write the average. Do not adjust it.",
          hi: "बीस बार फेंको। औसत लिखो। उसे सुधारो मत।",
        },
      },
      {
        id: "long",
        role: "recorder",
        text: {
          en: "Go on to 200, then to 2000. Put the short average and the long average side by side.",
          hi: "200 तक जाओ, फिर 2000 तक। छोटा औसत और लंबा औसत साथ-साथ रखो।",
        },
      },
      {
        id: "two",
        role: "skeptic",
        choice: true,
        text: {
          en: "Switch to two dice. Estimate how often the sum is 7. Let a long run settle before you trust it.",
          hi: "दो पासों पर जाओ। अनुमान लगाओ कि योग 7 कितनी बार आता है। भरोसा करने से पहले लंबी दौड़ को जमने दो।",
        },
      },
      {
        id: "say",
        role: "narrator",
        choice: true,
        text: {
          en: "In one sentence, say what a short run can claim and what only a long run can claim.",
          hi: "एक वाक्य में कहो कि छोटी दौड़ क्या दावा कर सकती है और केवल लंबी दौड़ क्या दावा कर सकती है।",
        },
      },
    ],
  },
];

export function practicalById(id: string): PracticalDef | undefined {
  return PRACTICALS.find((item) => item.id === id) ?? FAMILY_PRACTICALS.find((item) => item.id === id);
}

export function catalogueFor(board: Board, classLevel: 11 | 12, subject: Subject | "all"): PracticalDef[] {
  return PRACTICALS.filter((item) => {
    if (!item.boards.includes(board) || !item.classes.includes(classLevel)) return false;
    if (subject !== "all" && item.subject !== subject) return false;
    return true;
  });
}
