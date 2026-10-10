"use client";

export function LabRoom({
  shelf,
  children,
}: {
  shelf?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="lab-room" aria-label="School laboratory">
      <div className="lab-wall" aria-hidden="true">
        <div className="lab-window">
          <span className="lab-sky" />
          <span className="lab-pane" />
          <span className="lab-pane lab-pane-b" />
        </div>
        <div className="lab-board">{shelf ?? "Daylight Board"}</div>
      </div>
      <div className="lab-shelf" aria-hidden="true">
        <span className="reagent r1" />
        <span className="reagent r2" />
        <span className="reagent r3" />
        <span className="reagent r4" />
        <span className="reagent r5" />
      </div>
      <div className="lab-stone">{children}</div>
    </section>
  );
}
