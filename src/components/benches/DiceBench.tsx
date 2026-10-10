"use client";

import type { Sight } from "@/content/copy";
import { FAIR_DIE_MEAN } from "@/kernels/probability";
import type { LabEvent } from "@/lab/events";
import { averages, oneDie, projectDice, sevenRate, twoDice } from "@/lab/dice";
import { meanOf } from "@/kernels/probability";

const PIPS: Record<number, Array<[number, number]>> = {
  1: [[50, 50]],
  2: [[28, 28], [72, 72]],
  3: [[28, 28], [50, 50], [72, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]],
};

export function DiceBench({
  events,
  emit,
  sight,
  seed,
}: {
  events: LabEvent[];
  ctx: unknown;
  emit: (type: string, data?: Record<string, string | number | boolean>) => void;
  sight: Sight;
  guided: boolean;
  breakOn: boolean;
  seed: number;
}) {
  const state = projectDice(events, seed);
  const rolls = oneDie(state);
  const face = rolls.length ? rolls[rolls.length - 1] : 1;
  const sides = averages(rolls, [20, 200, 2000]);
  const sums = twoDice(state);
  const rate = sevenRate(state);

  function grow(next: number) {
    if (!events.some((event) => event.type === "seed")) emit("seed", { n: seed });
    emit("count", { n: next });
  }

  return (
    <div>
      <svg className="bench-svg" viewBox="0 0 680 220" role="img" aria-label={`Die showing ${face}`}>
        <rect width="680" height="220" fill="#d7c7a8" />
        <rect x="40" y="40" width="120" height="120" rx="16" fill="#f7f4ee" stroke="#1c1712" strokeWidth="3" />
        {PIPS[face].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={40 + x} cy={40 + y} r="8" fill="#1c1712" />
        ))}
        <text x="200" y="80" fontSize="28">After {state.shown} rolls</text>
        <text x="200" y="120" fontSize="22">Average {rolls.length ? meanOf(rolls).toFixed(2) : "—"}</text>
        {sight === "exam" && <text x="200" y="160" fontSize="16">A fair die has mean {FAIR_DIE_MEAN}. P(sum 7) = 6/36 = 1/6.</text>}
      </svg>
      <div className="row">
        <button className="btn" type="button" onClick={() => grow(Math.max(state.shown, 20))}>20 rolls</button>
        <button className="btn" type="button" onClick={() => grow(Math.max(state.shown, 200))}>200</button>
        <button className="btn" type="button" onClick={() => grow(2000)}>2000</button>
      </div>
      <label className="field">
        Scrub the run
        <input type="range" min={0} max={2000} value={state.shown} onChange={(event) => grow(Number(event.target.value))} />
      </label>
      <div className="row">
        {sides.map((item) => (
          <article key={item.n} className="card">
            <strong>{item.n} rolls</strong>
            <p className="live">{item.mean.toFixed(2)}</p>
          </article>
        ))}
      </div>
      {sides.length >= 2 && <p>The short run and the long run sit side by side. The long one is the one that settles.</p>}
      <button className="btn-quiet" type="button" onClick={() => emit("two", { flag: !state.two })}>
        {state.two ? "Two dice" : "Switch to two dice"}
      </button>
      {state.two && (
        <>
          <div className="row">
            <button className="btn" type="button" onClick={() => emit("two-count", { n: 20 })}>20 pairs</button>
            <button className="btn" type="button" onClick={() => emit("two-count", { n: 200 })}>200 pairs</button>
            <button className="btn" type="button" onClick={() => emit("two-count", { n: 2000 })}>2000 pairs</button>
          </div>
          <p className="live">Share of sums equal to 7: {rate === null ? "—" : rate.toFixed(3)} after {state.twoShown} pairs.</p>
          {sight === "hidden" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 28px)", gap: 4 }} aria-label="Sample space of two dice">
              {Array.from({ length: 36 }, (_, index) => {
                const a = (index % 6) + 1;
                const b = Math.floor(index / 6) + 1;
                const hit = a + b === 7;
                return <span key={index} style={{ width: 28, height: 28, display: "grid", placeItems: "center", background: hit ? "#1d3c72" : "transparent", color: hit ? "white" : "inherit", border: "1px solid currentColor" }}>{a + b}</span>;
              })}
            </div>
          )}
        </>
      )}
      <p className="caption">This run is seeded, so a replay throws the same dice. {sums.length > 0 ? `${sums.length} two-dice throws are stored in the seed, not as ${sums.length} separate taps.` : ""}</p>
    </div>
  );
}
