import type { Board, Copy, Subject } from "./copy";

export type BenchId =
  | "ohm"
  | "meter-bridge"
  | "convex-lens"
  | "titration"
  | "salt"
  | "rate"
  | "derivative"
  | "dice"
  | "measure"
  | "pendulum"
  | "cooling"
  | "ph"
  | "station";

export type StationMode =
  | "vernier"
  | "screw"
  | "spherometer"
  | "pendulum"
  | "spring"
  | "cooling"
  | "friction"
  | "incline"
  | "boyle"
  | "capillary"
  | "viscosity"
  | "resonance"
  | "young"
  | "ph"
  | "line"
  | "chromatography";

export interface ExperimentLink {
  id: string;
  kind: "experiment" | "activity" | "demonstration";
  title: Copy;
  aim: Copy;
  ref: Copy;
  bench: BenchId;
  mode?: StationMode;
}

export interface Chapter {
  id: string;
  board: Board;
  classLevel: 11 | 12;
  subject: Subject;
  book: Copy;
  chapter: Copy;
  blurb: Copy;
  items: ExperimentLink[];
}

const c = (en: string, hi: string): Copy => ({ en, hi });

function ex(
  id: string,
  kind: ExperimentLink["kind"],
  title: Copy,
  aim: Copy,
  ref: Copy,
  bench: BenchId,
  mode?: StationMode,
): ExperimentLink {
  return { id, kind, title, aim, ref, bench, mode };
}

const ncert11p = c("NCERT Physics Laboratory Manual, Class XI", "NCERT Physics Laboratory Manual, कक्षा 11");
const ncert12p = c("NCERT Physics Laboratory Manual, Class XII", "NCERT Physics Laboratory Manual, कक्षा 12");
const ncert11c = c("NCERT Chemistry Laboratory Manual, Class XI", "NCERT Chemistry Laboratory Manual, कक्षा 11");
const ncert12c = c("NCERT Chemistry Laboratory Manual, Class XII", "NCERT Chemistry Laboratory Manual, कक्षा 12");
const ncert11m = c("NCERT Mathematics textbook and Laboratory Manual, Class XI", "NCERT गणित पाठ्यपुस्तक और Laboratory Manual, कक्षा 11");
const ncert12m = c("NCERT Mathematics textbook and Laboratory Manual, Class XII", "NCERT गणित पाठ्यपुस्तक और Laboratory Manual, कक्षा 12");
const iscPhy = c("ISC Physics, CISCE — Paper II Practical (the Class 11–12 examination of the ICSE council)", "ISC Physics, CISCE — Paper II Practical (ICSE परिषद की कक्षा 11–12 परीक्षा)");
const iscChem = c("ISC Chemistry, CISCE — Paper II Practical", "ISC Chemistry, CISCE — Paper II Practical");
const iscMath = c("ISC Mathematics, CISCE — project and internal work, not a wet practical", "ISC Mathematics, CISCE — project कार्य, wet practical नहीं");

export const CHAPTERS: Chapter[] = [
  {
    id: "cbse-11-phy-measure",
    board: "CBSE",
    classLevel: 11,
    subject: "physics",
    book: ncert11p,
    chapter: c("Chapter 2 · Units and Measurements", "अध्याय 2 · Units and Measurements"),
    blurb: c("The first skill in the manual: least count, zero error, and a number you read yourself.", "Manual का पहला कौशल: least count, zero error, और वह संख्या जो तुम खुद पढ़ो।"),
    items: [
      ex("cbse-11-phy-vernier", "experiment", c("Diameter with vernier callipers", "Vernier callipers से व्यास"), c("Measure the diameter of a small sphere and find its volume.", "एक छोटे गोले का व्यास नापो और आयतन निकालो।"), c("NCERT Class XI Physics Lab Manual — vernier callipers.", "NCERT कक्षा 11 Physics Lab Manual — vernier callipers।"), "measure", "vernier"),
      ex("cbse-11-phy-screw", "experiment", c("Diameter of a wire with a screw gauge", "Screw gauge से तार का व्यास"), c("Measure the diameter of a wire and the percentage error in its area.", "तार का व्यास नापो और क्षेत्रफल में percentage error निकालो।"), c("NCERT Class XI Physics Lab Manual — screw gauge.", "NCERT कक्षा 11 Physics Lab Manual — screw gauge।"), "measure", "screw"),
      ex("cbse-11-phy-sphero", "experiment", c("Radius of curvature with a spherometer", "Spherometer से वक्रता त्रिज्या"), c("Find the radius of curvature of a spherical surface such as a watch glass.", "Watch glass जैसी गोलीय सतह की वक्रता त्रिज्या निकालो।"), c("NCERT Class XI Physics Lab Manual — spherometer.", "NCERT कक्षा 11 Physics Lab Manual — spherometer।"), "measure", "spherometer"),
    ],
  },
  {
    id: "cbse-11-phy-motion",
    board: "CBSE",
    classLevel: 11,
    subject: "physics",
    book: ncert11p,
    chapter: c("Chapters 4–5 · Motion in a plane, Laws of motion", "अध्याय 4–5 · Motion in a plane, Laws of motion"),
    blurb: c("Forces you can feel on the bench: friction, and the pull down an incline.", "Bench पर जो बल महसूस होते हैं: friction, और ढलान पर नीचे की ओर खिंचाव।"),
    items: [
      ex("cbse-11-phy-friction", "experiment", c("Limiting friction", "Limiting friction"), c("Find the coefficient of friction between a block and a horizontal surface.", "एक गुटके और क्षैतिज सतह के बीच घर्षण गुणांक निकालो।"), c("NCERT Class XI Physics Lab Manual — friction.", "NCERT कक्षा 11 Physics Lab Manual — friction।"), "station", "friction"),
      ex("cbse-11-phy-incline", "experiment", c("Inclined plane", "Inclined plane"), c("Study the downhill force on a roller as the angle changes. Plot force against sin θ.", "कोण बदलने पर रोलर पर नीचे की ओर बल का अध्ययन करो। बल को sin θ के विरुद्ध आलेखित करो।"), c("NCERT Class XI Physics Lab Manual — inclined plane.", "NCERT कक्षा 11 Physics Lab Manual — inclined plane।"), "station", "incline"),
    ],
  },
  {
    id: "cbse-11-phy-grav",
    board: "CBSE",
    classLevel: 11,
    subject: "physics",
    book: ncert11p,
    chapter: c("Chapters 8 and 14 · Gravitation, Oscillations", "अध्याय 8 और 14 · Gravitation, Oscillations"),
    blurb: c("A pendulum is how the manual asks you to meet g.", "Manual g से मिलने के लिए लोलक कहता है।"),
    items: [
      ex("cbse-11-phy-pendulum", "experiment", c("Simple pendulum and g", "सरल लोलक और g"), c("Plot T² against L and find the acceleration due to gravity.", "L के विरुद्ध T² आलेखित करो और गुरुत्वीय त्वरण निकालो।"), c("NCERT Class XI Physics Lab Manual — simple pendulum.", "NCERT कक्षा 11 Physics Lab Manual — simple pendulum।"), "pendulum", "pendulum"),
      ex("cbse-11-phy-spring", "experiment", c("Helical spring", "Helical spring"), c("See how the period changes when the hanging mass changes.", "लटके द्रव्यमान के बदलने पर आवर्तकाल कैसे बदलता है, देखो।"), c("NCERT Class XI Physics Lab Manual — helical spring.", "NCERT कक्षा 11 Physics Lab Manual — helical spring।"), "pendulum", "spring"),
    ],
  },
  {
    id: "cbse-11-phy-matter",
    board: "CBSE",
    classLevel: 11,
    subject: "physics",
    book: ncert11p,
    chapter: c("Chapters 9–10 · Mechanical properties of solids and fluids", "अध्याय 9–10 · Mechanical properties of solids and fluids"),
    blurb: c("A wire stretches, a bore lifts water, a sphere falls through glycerine.", "तार खिंचता है, नली पानी उठाती है, गोला ग्लिसरीन में गिरता है।"),
    items: [
      ex("cbse-11-phy-young", "experiment", c("Young’s modulus of a wire", "तार का Young’s modulus"), c("Hang loads on a wire and read the extension.", "तार पर भार लटकाओ और विस्तार पढ़ो।"), c("NCERT Class XI Physics Lab Manual — elasticity. ISC lists Searle’s method as a demonstration.", "NCERT कक्षा 11 Physics Lab Manual — elasticity। ISC में Searle’s method निदर्शन है।"), "station", "young"),
      ex("cbse-11-phy-capillary", "experiment", c("Surface tension by capillary rise", "Capillary rise से पृष्ठ तनाव"), c("Read the rise of water in a capillary and see why a narrower bore climbs higher.", "केशनली में पानी की चढ़ाई पढ़ो और देखो कि पतली नली अधिक क्यों चढ़ती है।"), c("NCERT Class XI Physics Lab Manual — surface tension.", "NCERT कक्षा 11 Physics Lab Manual — surface tension।"), "station", "capillary"),
      ex("cbse-11-phy-stokes", "experiment", c("Viscosity by terminal velocity", "Terminal velocity से श्यानता"), c("Time a sphere falling through a viscous liquid.", "श्यान द्रव में गिरते गोले का समय लो।"), c("NCERT Class XI Physics Lab Manual — viscosity.", "NCERT कक्षा 11 Physics Lab Manual — viscosity।"), "station", "viscosity"),
    ],
  },
  {
    id: "cbse-11-phy-heat",
    board: "CBSE",
    classLevel: 11,
    subject: "physics",
    book: ncert11p,
    chapter: c("Chapter 11 · Thermal properties of matter", "अध्याय 11 · Thermal properties of matter"),
    blurb: c("The textbook curve assumes 25°C. Your city may not.", "पाठ्यपुस्तक का वक्र 25°C मानता है। तुम्हारा शहर ऐसा न हो।"),
    items: [
      ex("cbse-11-phy-cooling", "experiment", c("Cooling curve", "Cooling curve"), c("Watch hot water fall toward the temperature of the room and test Newton’s law of cooling.", "गर्म पानी को कमरे के ताप की ओर गिरते देखो और Newton’s law of cooling जाँचो।"), c("NCERT Class XI Physics Lab Manual — cooling curve.", "NCERT कक्षा 11 Physics Lab Manual — cooling curve।"), "cooling", "cooling"),
      ex("cbse-11-phy-boyle", "experiment", c("Boyle’s law", "Boyle’s law"), c("At one temperature, change the pressure on a trapped sample of air and read the volume.", "एक ताप पर फँसी हवा का दाब बदलो और आयतन पढ़ो।"), c("NCERT Class XI Physics Lab Manual — Boyle’s law. Also ISC Paper II.", "NCERT कक्षा 11 Physics Lab Manual — Boyle’s law। ISC Paper II में भी।"), "station", "boyle"),
    ],
  },
  {
    id: "cbse-11-phy-waves",
    board: "CBSE",
    classLevel: 11,
    subject: "physics",
    book: ncert11p,
    chapter: c("Chapter 15 · Waves", "अध्याय 15 · Waves"),
    blurb: c("The air column answers a tuning fork only at the right length.", "वायु स्तंभ स्वरित्र द्विभुज का उत्तर केवल सही लंबाई पर देता है।"),
    items: [
      ex("cbse-11-phy-resonance", "experiment", c("Resonance column", "Resonance column"), c("Find the length of the air column that resounds, and hence the speed of sound in your room.", "जो वायु स्तंभ गूँजे उसकी लंबाई निकालो, और अपने कमरे में ध्वनि की चाल।"), c("NCERT Class XI Physics Lab Manual — resonance tube. ISC Paper II uses the same idea.", "NCERT कक्षा 11 Physics Lab Manual — resonance tube। ISC Paper II में भी यही विचार है।"), "station", "resonance"),
    ],
  },
  {
    id: "cbse-12-phy-current",
    board: "CBSE",
    classLevel: 12,
    subject: "physics",
    book: ncert12p,
    chapter: c("Chapter 3 · Current electricity", "अध्याय 3 · Current electricity"),
    blurb: c("The board’s electricity practicals. The graph is yours.", "बोर्ड के विद्युत प्रयोग। Graph तुम्हारा है।"),
    items: [
      ex("ohm", "experiment", c("Resistance from a V–I graph", "V–I graph से resistance"), c("Plot potential difference against current for a wire and find the resistance per unit length.", "एक तार के लिए विभवांतर को धारा के विरुद्ध आलेखित करो और resistance per unit length निकालो।"), c("NCERT Class XII Physics Lab Manual, Experiment 1.", "NCERT कक्षा 12 Physics Lab Manual, Experiment 1।"), "ohm"),
      ex("meter-bridge", "experiment", c("Metre bridge and resistivity", "Metre bridge और resistivity"), c("Find the resistance of a wire from the null point, then its resistivity.", "Null point से तार का resistance निकालो, फिर resistivity।"), c("NCERT Class XII Physics Lab Manual — metre bridge.", "NCERT कक्षा 12 Physics Lab Manual — metre bridge।"), "meter-bridge"),
    ],
  },
  {
    id: "cbse-12-phy-optics",
    board: "CBSE",
    classLevel: 12,
    subject: "physics",
    book: ncert12p,
    chapter: c("Chapter 9 · Ray optics", "अध्याय 9 · Ray optics"),
    blurb: c("You do not get a focal length until the pins stop parting when you move your eye.", "आँख हिलाने पर pins अलग होना बंद हों, तभी focal length मिलती है।"),
    items: [
      ex("convex-lens", "experiment", c("Focal length of a convex lens", "Convex lens की focal length"), c("Find f from u and v after removing parallax.", "Parallax हटाकर u और v से f निकालो।"), c("NCERT Class XII Physics Lab Manual — convex lens.", "NCERT कक्षा 12 Physics Lab Manual — convex lens।"), "convex-lens"),
    ],
  },
  {
    id: "cbse-11-chem-tech",
    board: "CBSE",
    classLevel: 11,
    subject: "chemistry",
    book: ncert11c,
    chapter: c("Unit 2 · Basic laboratory techniques", "Unit 2 · Basic laboratory techniques"),
    blurb: c("Before any titration: how to read a volume, and why the eye must be level.", "किसी भी titration से पहले: आयतन कैसे पढ़ें, और आँख समतल क्यों हो।"),
    items: [
      ex("cbse-11-chem-volume", "activity", c("Measuring a volume", "आयतन नापना"), c("Read a burette at eye level. A high eye and a low eye do not agree.", "Burette आँख के स्तर पर पढ़ो। ऊँची आँख और नीची आँख सहमत नहीं होतीं।"), c("NCERT Class XI Chemistry Lab Manual, Unit 2 — measuring volume of liquids.", "NCERT कक्षा 11 Chemistry Lab Manual, Unit 2 — द्रवों का आयतन।"), "titration"),
    ],
  },
  {
    id: "cbse-11-chem-ph",
    board: "CBSE",
    classLevel: 11,
    subject: "chemistry",
    book: ncert11c,
    chapter: c("Unit 5 · pH and pH changes", "Unit 5 · pH and pH changes"),
    blurb: c("Fruit juice, a salt, an acid, an alkali. The indicator is a scale, not a decoration.", "फल का रस, एक लवण, एक अम्ल, एक क्षार। Indicator सजावट नहीं, एक पैमाना है।"),
    items: [
      ex("cbse-11-chem-ph-juices", "experiment", c("pH of juices and salt solutions", "रसों और लवण विलयनों की pH"), c("Find the pH of lemon juice, ferric chloride, sodium chloride and sodium carbonate.", "नींबू का रस, ferric chloride, sodium chloride और sodium carbonate की pH निकालो।"), c("NCERT Class XI Chemistry Lab Manual, Experiments 5.1 and 5.5.", "NCERT कक्षा 11 Chemistry Lab Manual, Experiments 5.1 और 5.5।"), "ph", "ph"),
    ],
  },
  {
    id: "cbse-11-chem-titre",
    board: "CBSE",
    classLevel: 11,
    subject: "chemistry",
    book: ncert11c,
    chapter: c("Unit 6 · Titrimetric analysis", "Unit 6 · Titrimetric analysis"),
    blurb: c("Oxalic acid against sodium hydroxide. Concordant means within 0.1 mL.", "Oxalic acid के विरुद्ध sodium hydroxide। Concordant का अर्थ है 0.1 mL के अंदर।"),
    items: [
      ex("titration", "experiment", c("Strength of NaOH against oxalic acid", "Oxalic acid से NaOH की strength"), c("Titrate sodium hydroxide with M/20 oxalic acid using phenolphthalein.", "Phenolphthalein लगाकर M/20 oxalic acid से sodium hydroxide का अनुमापन करो।"), c("NCERT Class XI Chemistry Lab Manual, Experiment 6.1.", "NCERT कक्षा 11 Chemistry Lab Manual, Experiment 6.1।"), "titration"),
    ],
  },
  {
    id: "cbse-11-chem-salt",
    board: "CBSE",
    classLevel: 11,
    subject: "chemistry",
    book: ncert11c,
    chapter: c("Unit 7 · Systematic qualitative analysis", "Unit 7 · Systematic qualitative analysis"),
    blurb: c("One salt. Tests are evidence. The bottle is finite.", "एक लवण। परीक्षण प्रमाण हैं। बोतल सीमित है।"),
    items: [
      ex("salt", "experiment", c("One cation and one anion", "एक cation और एक anion"), c("Identify the acid radical and the basic radical of a simple salt from the tests you run.", "जो परीक्षण तुम करो, उनसे एक साधारण लवण का acid radical और basic radical पहचानो।"), c("NCERT Class XI Chemistry Lab Manual, Unit 7. ISC calls this a single salt.", "NCERT कक्षा 11 Chemistry Lab Manual, Unit 7। ISC इसे single salt कहता है।"), "salt"),
    ],
  },
  {
    id: "cbse-12-chem-kinetics",
    board: "CBSE",
    classLevel: 12,
    subject: "chemistry",
    book: ncert12c,
    chapter: c("Unit 2 · Chemical kinetics", "Unit 2 · Chemical kinetics"),
    blurb: c("The thiosulphate cross. Concentration and temperature share the clock.", "Thiosulphate का cross। Concentration और temperature एक ही घड़ी बाँटते हैं।"),
    items: [
      ex("rate", "experiment", c("Rate and the disappearing cross", "Rate और गायब होता cross"), c("Study how concentration and temperature change the time for sulphur to hide the cross.", "देखो कि concentration और temperature उस समय को कैसे बदलते हैं जिसमें सल्फर cross को छिपा दे।"), c("NCERT Class XII Chemistry Lab Manual, Unit 2.", "NCERT कक्षा 12 Chemistry Lab Manual, Unit 2।"), "rate"),
    ],
  },
  {
    id: "cbse-12-chem-chroma",
    board: "CBSE",
    classLevel: 12,
    subject: "chemistry",
    book: ncert12c,
    chapter: c("Unit 5 · Chromatography", "Unit 5 · Chromatography"),
    blurb: c("A leaf’s pigments do not travel equally. Rf is a distance ratio you measure.", "पत्ती के वर्णक समान नहीं चलते। Rf वह दूरी-अनुपात है जिसे तुम नापते हो।"),
    items: [
      ex("cbse-12-chem-paper", "experiment", c("Paper chromatography of leaf pigments", "पत्ती के वर्णकों की paper chromatography"), c("Separate pigments and find Rf for each spot you can see.", "वर्णक अलग करो और हर दिखे धब्बे का Rf निकालो।"), c("NCERT Class XII Chemistry Lab Manual, Unit 5. Also an ISC practical.", "NCERT कक्षा 12 Chemistry Lab Manual, Unit 5। ISC practical में भी।"), "station", "chromatography"),
    ],
  },
  {
    id: "cbse-11-math-lines",
    board: "CBSE",
    classLevel: 11,
    subject: "mathematics",
    book: ncert11m,
    chapter: c("Chapter 10 · Straight lines", "अध्याय 10 · Straight lines"),
    blurb: c("Two points you drag. The slope is rise over run, before any formula.", "दो बिंदु जिन्हें तुम खींचो। Slope rise/run है, किसी सूत्र से पहले।"),
    items: [
      ex("cbse-11-math-slope", "activity", c("Slope of a line you place", "अपनी रखी रेखा का slope"), c("Place two points and read the slope from the grid.", "दो बिंदु रखो और ग्रिड से slope पढ़ो।"), c("NCERT Class XI Mathematics — straight lines, an internal activity.", "NCERT कक्षा 11 गणित — straight lines, एक आंतरिक activity।"), "station", "line"),
    ],
  },
  {
    id: "cbse-11-math-limits",
    board: "CBSE",
    classLevel: 11,
    subject: "mathematics",
    book: ncert11m,
    chapter: c("Chapter 13 · Limits and derivatives", "अध्याय 13 · Limits and derivatives"),
    blurb: c("The tangent is a triangle. The derivative is its slope.", "Tangent एक त्रिभुज है। Derivative उसका slope है।"),
    items: [
      ex("derivative", "activity", c("Derivative as a tangent", "Tangent के रूप में derivative"), c("Drag a point on y = x² and count the slope before you open the formula.", "y = x² पर बिंदु खींचो और सूत्र खोलने से पहले slope गिनो।"), c("NCERT Class XI–XII Mathematics — the derivative as the slope of the tangent.", "NCERT कक्षा 11–12 गणित — tangent के slope के रूप में derivative।"), "derivative"),
    ],
  },
  {
    id: "cbse-11-math-prob",
    board: "CBSE",
    classLevel: 11,
    subject: "mathematics",
    book: ncert11m,
    chapter: c("Chapter 16 · Probability", "अध्याय 16 · Probability"),
    blurb: c("A short run is allowed to be wrong.", "छोटी दौड़ गलत हो सकती है।"),
    items: [
      ex("dice", "activity", c("Long-run frequency", "लंबी दौड़ की आवृत्ति"), c("Compare 20 throws of a die with 2000, and estimate a sum of 7 with two dice.", "पासे के 20 फेंकों की 2000 से तुलना करो, और दो पासों पर योग 7 का अनुमान लगाओ।"), c("NCERT Class XI Mathematics — probability as a long-run frequency.", "NCERT कक्षा 11 गणित — लंबी दौड़ की आवृत्ति के रूप में probability।"), "dice"),
    ],
  },
  {
    id: "cbse-12-math-prob",
    board: "CBSE",
    classLevel: 12,
    subject: "mathematics",
    book: ncert12m,
    chapter: c("Chapter 13 · Probability", "अध्याय 13 · Probability"),
    blurb: c("The same dice, now as a Class 12 internal activity. There is no 30-mark wet practical in mathematics.", "वही पासे, अब कक्षा 12 की आंतरिक activity। गणित में 30 अंक का wet practical नहीं है।"),
    items: [
      ex("cbse-12-math-dice", "activity", c("Probability activity for the portfolio", "Portfolio के लिए probability activity"), c("Run the experiment long enough that the frequency can sit beside 1/6.", "प्रयोग को इतना लंबा चलाओ कि आवृत्ति 1/6 के पास बैठ सके।"), c("NCERT Class XII Mathematics Laboratory Manual — probability activity. Internal assessment, 20 marks beside an 80-mark paper.", "NCERT कक्षा 12 Mathematics Laboratory Manual — probability activity। आंतरिक मूल्यांकन 20, प्रश्नपत्र 80।"), "dice"),
    ],
  },
  {
    id: "cbse-12-math-app",
    board: "CBSE",
    classLevel: 12,
    subject: "mathematics",
    book: ncert12m,
    chapter: c("Chapter 6 · Application of derivatives", "अध्याय 6 · Application of derivatives"),
    blurb: c("Increasing and decreasing is the sign of the slope you can see.", "बढ़ना और घटना उस slope का चिह्न है जिसे तुम देख सकते हो।"),
    items: [
      ex("cbse-12-math-tangent", "activity", c("Where the tangent climbs", "जहाँ tangent चढ़ती है"), c("Move along y = x³ and say where the slope is positive.", "y = x³ पर चलो और कहो कि slope कहाँ धनात्मक है।"), c("NCERT Class XII Mathematics — application of derivatives, an activity for the portfolio.", "NCERT कक्षा 12 गणित — application of derivatives, portfolio की activity।"), "derivative"),
    ],
  },
  {
    id: "isc-11-phy",
    board: "ISC",
    classLevel: 11,
    subject: "physics",
    book: iscPhy,
    chapter: c("Paper II · The required experiments", "Paper II · निर्धारित प्रयोग"),
    blurb: c("This is the Council’s list, not the NCERT experiment numbers. Class 11–12 of the ICSE council is examined as ISC.", "यह परिषद की सूची है, NCERT के प्रयोग-क्रमांक नहीं। ICSE परिषद की कक्षा 11–12 की परीक्षा ISC है।"),
    items: [
      ex("isc-11-phy-vernier", "experiment", c("1. Vernier callipers", "1. Vernier callipers"), c("Measure the diameter of a sphere, find its volume, and compare with a measuring cylinder.", "गोले का व्यास नापो, आयतन निकालो, और measuring cylinder से तुलना करो।"), c("ISC Physics Paper II, experiment 1.", "ISC Physics Paper II, प्रयोग 1।"), "measure", "vernier"),
      ex("isc-11-phy-screw", "experiment", c("2. Screw gauge", "2. Screw gauge"), c("Find the diameter of a wire and the percentage error in the cross-sectional area.", "तार का व्यास और अनुप्रस्थ क्षेत्रफल में percentage error निकालो।"), c("ISC Physics Paper II, experiment 2.", "ISC Physics Paper II, प्रयोग 2।"), "measure", "screw"),
      ex("isc-11-phy-sphero", "experiment", c("3. Spherometer", "3. Spherometer"), c("Determine the radius of curvature of a watch glass.", "Watch glass की वक्रता त्रिज्या निकालो।"), c("ISC Physics Paper II, experiment 3.", "ISC Physics Paper II, प्रयोग 3।"), "measure", "spherometer"),
      ex("isc-11-phy-incline", "experiment", c("5. Inclined plane and friction", "5. Inclined plane और friction"), c("Study the downhill force against sin θ, then limiting friction on the flat.", "नीचे की ओर बल को sin θ के विरुद्ध देखो, फिर समतल पर limiting friction।"), c("ISC Physics Paper II, experiment 5.", "ISC Physics Paper II, प्रयोग 5।"), "station", "incline"),
      ex("isc-11-phy-pendulum", "experiment", c("6. Simple pendulum", "6. Simple pendulum"), c("Plot T against √L and T² against L. Find the length of the seconds pendulum.", "√L के विरुद्ध T और L के विरुद्ध T² आलेखित करो। Seconds pendulum की लंबाई निकालो।"), c("ISC Physics Paper II, experiment 6.", "ISC Physics Paper II, प्रयोग 6।"), "pendulum", "pendulum"),
      ex("isc-11-phy-spring", "experiment", c("7. Spring and g", "7. Spring और g"), c("See how the period changes with the hanging mass.", "लटके द्रव्यमान के साथ आवर्तकाल कैसे बदलता है, देखो।"), c("ISC Physics Paper II, experiment 7.", "ISC Physics Paper II, प्रयोग 7।"), "pendulum", "spring"),
      ex("isc-11-phy-boyle", "experiment", c("8. Boyle’s law", "8. Boyle’s law"), c("Plot p against 1/V and p against V for trapped air.", "फँसी हवा के लिए p को 1/V और p को V के विरुद्ध आलेखित करो।"), c("ISC Physics Paper II, experiment 8.", "ISC Physics Paper II, प्रयोग 8।"), "station", "boyle"),
      ex("isc-11-phy-cooling", "experiment", c("9. Cooling curve", "9. Cooling curve"), c("Read the fall of temperature and the slope at four temperatures.", "ताप का गिरना पढ़ो और चार तापों पर slope।"), c("ISC Physics Paper II, experiment 9.", "ISC Physics Paper II, प्रयोग 9।"), "cooling", "cooling"),
      ex("isc-11-phy-resonance", "experiment", c("10. Resonance column", "10. Resonance column"), c("Find the speed of sound in the air of your room.", "अपने कमरे की हवा में ध्वनि की चाल निकालो।"), c("ISC Physics Paper II, experiment 10.", "ISC Physics Paper II, प्रयोग 10।"), "station", "resonance"),
      ex("isc-11-phy-young", "demonstration", c("Demonstration · Young’s modulus", "निदर्शन · Young’s modulus"), c("Searle’s method, watched as a demonstration: load and extension of a wire.", "Searle’s method, एक निदर्शन के रूप में: तार पर भार और विस्तार।"), c("ISC Physics Paper II, demonstration 1. The candidate watches; the teacher demonstrates.", "ISC Physics Paper II, निदर्शन 1। परीक्षार्थी देखता है; शिक्षक दिखाते हैं।"), "station", "young"),
      ex("isc-11-phy-capillary", "demonstration", c("Demonstration · Surface tension", "निदर्शन · पृष्ठ तनाव"), c("Capillary rise, as the Council’s demonstration.", "Capillary rise, परिषद के निदर्शन के रूप में।"), c("ISC Physics Paper II, demonstration 2.", "ISC Physics Paper II, निदर्शन 2।"), "station", "capillary"),
      ex("isc-11-phy-viscosity", "demonstration", c("Demonstration · Viscosity", "निदर्शन · श्यानता"), c("A sphere falling at terminal velocity.", "Terminal velocity से गिरता गोला।"), c("ISC Physics Paper II, demonstration 3.", "ISC Physics Paper II, निदर्शन 3।"), "station", "viscosity"),
    ],
  },
  {
    id: "isc-12-phy",
    board: "ISC",
    classLevel: 12,
    subject: "physics",
    book: iscPhy,
    chapter: c("Class 12 · Electricity and optics on the same engines", "कक्षा 12 · वही engines, विद्युत और प्रकाश"),
    blurb: c("ISC Class 12 still asks for circuits, a bridge, and a lens. The Council’s mark split is practical 15, project 10, file 5.", "ISC कक्षा 12 अभी भी circuit, bridge और lens पूछती है। परिषद का विभाजन: practical 15, project 10, file 5।"),
    items: [
      ex("isc-12-phy-ohm", "experiment", c("V–I graph of a wire", "तार का V–I graph"), c("The same craft as the NCERT experiment, filed under ISC.", "वही कौशल जो NCERT प्रयोग में है, ISC के नाम पर।"), c("ISC Physics practical — current electricity.", "ISC Physics practical — current electricity।"), "ohm"),
      ex("isc-12-phy-bridge", "experiment", c("Metre bridge", "Metre bridge"), c("Find a null, then reverse the ends.", "Null खोजो, फिर सिरे पलटो।"), c("ISC Physics practical — metre bridge.", "ISC Physics practical — metre bridge।"), "meter-bridge"),
      ex("isc-12-phy-lens", "experiment", c("Focal length of a convex lens", "Convex lens की focal length"), c("Remove parallax before you write u and v.", "u और v लिखने से पहले parallax हटाओ।"), c("ISC Physics practical — ray optics.", "ISC Physics practical — ray optics।"), "convex-lens"),
    ],
  },
  {
    id: "isc-11-chem",
    board: "ISC",
    classLevel: 11,
    subject: "chemistry",
    book: iscChem,
    chapter: c("Paper II · Class 11 practicals", "Paper II · कक्षा 11 के practical"),
    blurb: c("The Council asks for technique, a molarity titration, one salt, a preparation, and a chromatogram.", "परिषद तकनीक, एक molarity titration, एक लवण, एक preparation, और एक chromatogram माँगती है।"),
    items: [
      ex("isc-11-chem-titre", "experiment", c("2. Acid–base titration", "2. Acid–base titration"), c("A molarity titration. Concordant titres, eye-level meniscus.", "एक molarity titration। Concordant titre, आँख के स्तर पर meniscus।"), c("ISC Chemistry Class XI, practical 2.", "ISC Chemistry कक्षा 11, practical 2।"), "titration"),
      ex("isc-11-chem-salt", "experiment", c("3. Single salt", "3. Single salt"), c("One anion and one cation. Plan the portions.", "एक anion और एक cation। Portions की योजना बनाओ।"), c("ISC Chemistry Class XI, practical 3.", "ISC Chemistry कक्षा 11, practical 3।"), "salt"),
      ex("isc-11-chem-paper", "experiment", c("5. Paper chromatography", "5. Paper chromatography"), c("Separate pigments and measure Rf.", "वर्णक अलग करो और Rf नापो।"), c("ISC Chemistry Class XI, practical 5.", "ISC Chemistry कक्षा 11, practical 5।"), "station", "chromatography"),
    ],
  },
  {
    id: "isc-12-chem",
    board: "ISC",
    classLevel: 12,
    subject: "chemistry",
    book: iscChem,
    chapter: c("Paper II · Class 12 practical paper", "Paper II · कक्षा 12 का practical पत्र"),
    blurb: c("The paper is volumetric analysis, one other experiment, and a single salt.", "पत्र है: volumetric analysis, एक और प्रयोग, और एक single salt।"),
    items: [
      ex("isc-12-chem-titre", "experiment", c("Question 1 · Volumetric analysis", "प्रश्न 1 · Volumetric analysis"), c("An acid–base titration taken to concordant titres.", "Concordant titre तक एक acid–base titration।"), c("ISC Chemistry Class XII, practical question 1.", "ISC Chemistry कक्षा 12, practical प्रश्न 1।"), "titration"),
      ex("isc-12-chem-rate", "experiment", c("Question 2 · Rate of reaction", "प्रश्न 2 · Rate of reaction"), c("Sodium thiosulphate and hydrochloric acid. The cross, the clock, the graph.", "Sodium thiosulphate और hydrochloric acid। Cross, घड़ी, graph।"), c("ISC Chemistry Class XII — study of the rate of reaction.", "ISC Chemistry कक्षा 12 — rate of reaction।"), "rate"),
      ex("isc-12-chem-salt", "experiment", c("Question 3 · Qualitative analysis", "प्रश्न 3 · Qualitative analysis"), c("A single salt. Your tests, your portions.", "एक single salt। तुम्हारे परीक्षण, तुम्हारे portions।"), c("ISC Chemistry Class XII, practical question 3.", "ISC Chemistry कक्षा 12, practical प्रश्न 3।"), "salt"),
      ex("isc-12-chem-ph", "experiment", c("pH changes", "pH में परिवर्तन"), c("See how indicator colour and pH move when the solution changes.", "देखो कि विलयन बदलने पर indicator का रंग और pH कैसे हिलते हैं।"), c("ISC Chemistry Class XII — experiments related to pH.", "ISC Chemistry कक्षा 12 — pH से जुड़े प्रयोग।"), "ph", "ph"),
    ],
  },
  {
    id: "isc-12-math",
    board: "ISC",
    classLevel: 12,
    subject: "mathematics",
    book: iscMath,
    chapter: c("Project work · 20 marks", "Project कार्य · 20 अंक"),
    blurb: c("ISC mathematics is not a wet lab. Two projects. These activities are pages you can put in that file.", "ISC गणित wet lab नहीं है। दो project। ये activities उस file के पृष्ठ बन सकती हैं।"),
    items: [
      ex("isc-12-math-tangent", "activity", c("A calculus project: the tangent", "एक calculus project: tangent"), c("Show, with a triangle, that the derivative is a slope.", "एक त्रिभुज से दिखाओ कि derivative एक slope है।"), c("ISC Mathematics — project work. Not one of the science practical papers.", "ISC Mathematics — project कार्य। विज्ञान के practical पत्रों में से नहीं।"), "derivative"),
      ex("isc-12-math-dice", "activity", c("A probability project", "एक probability project"), c("A long run and a short run, side by side.", "एक लंबी दौड़ और एक छोटी, साथ-साथ।"), c("ISC Mathematics — project work.", "ISC Mathematics — project कार्य।"), "dice"),
      ex("isc-12-math-line", "activity", c("A coordinate-geometry project", "एक coordinate-geometry project"), c("A line you place, and the slope you count.", "एक रेखा जो तुम रखो, और slope जो तुम गिनो।"), c("ISC Mathematics — project work.", "ISC Mathematics — project कार्य।"), "station", "line"),
    ],
  },
];

export interface OpenExperiment extends ExperimentLink {
  chapterTitle: Copy;
  book: Copy;
  subject: Subject;
  classLevel: 11 | 12;
  board: Board;
}

export function findExperiment(id: string): OpenExperiment | undefined {
  for (const chapter of CHAPTERS) {
    const item = chapter.items.find((entry) => entry.id === id);
    if (item) {
      return {
        ...item,
        chapterTitle: chapter.chapter,
        book: chapter.book,
        subject: chapter.subject,
        classLevel: chapter.classLevel,
        board: chapter.board,
      };
    }
  }
  return undefined;
}

export function chaptersFor(board: Board, classLevel: 11 | 12, subject: Subject | "all"): Chapter[] {
  return CHAPTERS.filter((chapter) => {
    if (chapter.board !== board || chapter.classLevel !== classLevel) return false;
    if (subject !== "all" && chapter.subject !== subject) return false;
    return true;
  });
}
