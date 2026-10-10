"use client";

import { cityById } from "@/content/cities";
import type { Board, Kit, Lang, Subject } from "@/content/copy";
import type { LabEvent } from "@/lab/events";
import { makeEvent } from "@/lab/events";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface Profile {
  chosen: boolean;
  role: "student" | "teacher";
  board: Board;
  classLevel: 11 | 12;
  subject: Subject | "all";
  language: Lang;
  theme: "daylight" | "night";
  scale: number;
  cityId: string;
  ncertStandard: boolean;
  kit: Kit;
  sound: boolean;
  reducedMotion: boolean;
  studentName: string;
  classCode: string;
  benchLabel: string;
  benchMode: boolean;
  roleLock: boolean;
  names: { operator: string; recorder: string; skeptic: string; narrator: string };
}

export interface RunRecord {
  id: string;
  practicalId: string;
  board: Board;
  classLevel: 11 | 12;
  language: Lang;
  kit: Kit;
  temperatureC: number;
  humidity: number;
  ncertStandard: boolean;
  cityId: string;
  mock: boolean;
  seed: number;
  startedAt: number;
  events: LabEvent[];
  classCode: string;
  benchLabel: string;
  studentName: string;
}

const PROFILE_KEY = "indranetra.profile.v1";
const RUNS_KEY = "indranetra.runs.v1";
const HIDDEN_KEY = "indranetra.hidden.v1";

export const defaultProfile: Profile = {
  chosen: false,
  role: "student",
  board: "CBSE",
  classLevel: 12,
  subject: "all",
  language: "en",
  theme: "daylight",
  scale: 1,
  cityId: "delhi",
  ncertStandard: false,
  kit: "school",
  sound: false,
  reducedMotion: false,
  studentName: "",
  classCode: "",
  benchLabel: "Bench 1",
  benchMode: false,
  roleLock: false,
  names: { operator: "", recorder: "", skeptic: "", narrator: "" },
};

interface StoreValue {
  ready: boolean;
  profile: Profile;
  setProfile: (patch: Partial<Profile>) => void;
  runs: RunRecord[];
  hidden: string[];
  toggleHidden: (id: string) => void;
  startRun: (practicalId: string, mock: boolean) => RunRecord;
  updateRun: (id: string, updater: (run: RunRecord) => RunRecord) => void;
  pushEvent: (runId: string, type: string, data?: Record<string, string | number | boolean>) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function uid(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}`;
}

export function conditionsFrom(profile: Profile): {
  temperatureC: number;
  humidity: number;
} {
  if (profile.ncertStandard) return { temperatureC: 25, humidity: 50 };
  const city = cityById(profile.cityId);
  return { temperatureC: city.summerC, humidity: city.humidity };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfileState] = useState<Profile>(defaultProfile);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [hidden, setHidden] = useState<string[]>([]);

  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem(PROFILE_KEY);
      const storedRuns = localStorage.getItem(RUNS_KEY);
      const storedHidden = localStorage.getItem(HIDDEN_KEY);
      if (storedProfile) setProfileState({ ...defaultProfile, ...JSON.parse(storedProfile) });
      if (storedRuns) setRuns(JSON.parse(storedRuns));
      if (storedHidden) setHidden(JSON.parse(storedHidden));
    } catch {
      /* a damaged local file should not block the bench */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    localStorage.setItem(RUNS_KEY, JSON.stringify(runs));
    localStorage.setItem(HIDDEN_KEY, JSON.stringify(hidden));
    document.documentElement.dataset.theme = profile.theme;
    document.documentElement.lang = profile.language === "hi" ? "hi" : "en";
    document.documentElement.style.setProperty("--scale", String(profile.scale));
    document.documentElement.dataset.motion = profile.reducedMotion ? "reduce" : "full";
  }, [profile, runs, hidden, ready]);

  const value = useMemo<StoreValue>(() => {
    const setProfile = (patch: Partial<Profile>) => setProfileState((prev) => ({ ...prev, ...patch }));
    const updateRun = (id: string, updater: (run: RunRecord) => RunRecord) => {
      setRuns((prev) => prev.map((run) => (run.id === id ? updater(run) : run)));
    };
    const startRun = (practicalId: string, mock: boolean) => {
      const weather = conditionsFrom(profile);
      const run: RunRecord = {
        id: uid(),
        practicalId,
        board: profile.board,
        classLevel: profile.classLevel,
        language: profile.language,
        kit: profile.kit,
        temperatureC: weather.temperatureC,
        humidity: weather.humidity,
        ncertStandard: profile.ncertStandard,
        cityId: profile.cityId,
        mock,
        seed: Math.floor(Math.random() * 1_000_000) + 1,
        startedAt: Date.now(),
        events: [],
        classCode: profile.classCode,
        benchLabel: profile.benchLabel,
        studentName: profile.studentName,
      };
      setRuns((prev) => [run, ...prev].slice(0, 80));
      return run;
    };
    const pushEvent = (runId: string, type: string, data: Record<string, string | number | boolean> = {}) => {
      const event = makeEvent(type, data);
      updateRun(runId, (run) => ({ ...run, events: [...run.events, event] }));
    };
    const toggleHidden = (id: string) => {
      setHidden((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };
    return { ready, profile, setProfile, runs, hidden, toggleHidden, startRun, updateRun, pushEvent };
  }, [hidden, profile, ready, runs]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("Store missing");
  return value;
}
