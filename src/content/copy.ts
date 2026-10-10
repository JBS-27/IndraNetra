export type Lang = "en" | "hi";
export type Board = "CBSE" | "ISC";
export type Subject = "physics" | "chemistry" | "mathematics";
export type Kit = "school" | "textbook";
export type Sight = "lab" | "hidden" | "exam";
export type Role = "operator" | "recorder" | "skeptic" | "narrator";

export interface Copy {
  en: string;
  hi: string;
}

export function tx(copy: Copy, lang: Lang): string {
  return copy[lang];
}

export function pick(lang: Lang, en: string, hi: string): string {
  return lang === "hi" ? hi : en;
}
