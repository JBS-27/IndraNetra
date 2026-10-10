"use client";

import { Topbar } from "@/components/Chrome";
import { PRACTICALS } from "@/content/catalog";
import { tx } from "@/content/copy";
import { useStore } from "@/lib/store";

export default function AdminPage() {
  const { hidden, toggleHidden, profile } = useStore();
  return (
    <>
      <Topbar />
      <main className="wrap" style={{ paddingBottom: 40 }}>
        <h1>Publishing desk</h1>
        <p>Teachers do not need this screen. Unpublishing hides a practical on this phone. A state-board pack would be another list on the same engines.</p>
        <ul>
          {PRACTICALS.map((item) => (
            <li key={item.id} className="spread">
              <span>{tx(item.title, profile.language)} · {item.kernelId}</span>
              <button className="btn-quiet" type="button" onClick={() => toggleHidden(item.id)}>
                {hidden.includes(item.id) ? "Publish" : "Unpublish"}
              </button>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
