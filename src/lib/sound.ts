let audio: AudioContext | null = null;
let lastClick = 0;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audio) audio = new Ctx();
  if (audio.state === "suspended") void audio.resume();
  return audio;
}

export function playClick(loudness: number, enabled: boolean): void {
  if (!enabled || loudness <= 0.04) return;
  const nowMs = performance.now();
  if (nowMs - lastClick < 90) return;
  lastClick = nowMs;
  const ctx = context();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = 740;
  gain.gain.value = Math.min(0.08, loudness * 0.06);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
  osc.stop(ctx.currentTime + 0.05);
}

export function playTick(kind: "drop" | "switch" | "bubble", enabled: boolean): void {
  if (!enabled) return;
  const ctx = context();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = kind === "bubble" ? "sine" : "triangle";
  osc.frequency.value = kind === "drop" ? 520 : kind === "bubble" ? 280 : 180;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.frequency.exponentialRampToValueAtTime(kind === "drop" ? 180 : 90, ctx.currentTime + 0.12);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
  osc.stop(ctx.currentTime + 0.15);
}
