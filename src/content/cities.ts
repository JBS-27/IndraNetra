export interface City {
  id: string;
  en: string;
  hi: string;
  summerC: number;
  humidity: number;
}

export const CITIES: City[] = [
  { id: "delhi", en: "Delhi", hi: "दिल्ली", summerC: 36, humidity: 40 },
  { id: "jaipur", en: "Jaipur", hi: "जयपुर", summerC: 38, humidity: 28 },
  { id: "lucknow", en: "Lucknow", hi: "लखनऊ", summerC: 35, humidity: 48 },
  { id: "mumbai", en: "Mumbai", hi: "मुम्बई", summerC: 32, humidity: 74 },
  { id: "chennai", en: "Chennai", hi: "चेन्नई", summerC: 34, humidity: 70 },
  { id: "kolkata", en: "Kolkata", hi: "कोलकाता", summerC: 33, humidity: 76 },
  { id: "guwahati", en: "Guwahati", hi: "गुवाहाटी", summerC: 31, humidity: 82 },
  { id: "bengaluru", en: "Bengaluru", hi: "बेंगलुरु", summerC: 28, humidity: 60 },
  { id: "srinagar", en: "Srinagar", hi: "श्रीनगर", summerC: 22, humidity: 55 },
];

export function cityById(id: string): City {
  return CITIES.find((city) => city.id === id) ?? CITIES[0];
}
