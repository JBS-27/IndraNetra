"use client";

import { Topbar } from "@/components/Chrome";
import { pick } from "@/content/copy";
import { useStore } from "@/lib/store";

export default function TeacherGuide() {
  const { profile } = useStore();
  const lang = profile.language;
  return (
    <>
      <Topbar />
      <main className="wrap" style={{ paddingBottom: 48, maxWidth: 760 }}>
        <h1>{pick(lang, "Teacher card", "शिक्षक कार्ड")}</h1>
        <h2>{pick(lang, "Page 1. The period", "पृष्ठ 1. Period")}</h2>
        <ol>
          <li>{pick(lang, "4 minutes. Read the prediction aloud. Let the room vote. Do not correct it yet.", "4 मिनट। Prediction ज़ोर से पढ़ो। कमरे को वोट करने दो। अभी सुधारो मत।")}</li>
          <li>{pick(lang, "22 minutes. Projector on Daylight Board. Phones on the same practical. Sound off, unless you are at the null point with one speaker.", "22 मिनट। Projector पर Daylight Board। फोन उसी practical पर। ध्वनि बंद, जब तक null point पर एक speaker न हो।")}</li>
          <li>{pick(lang, "One phone, four students. Operator, recorder, skeptic, narrator. Rotate next practical so the same child is not always the operator.", "एक फोन, चार विद्यार्थी। Operator, recorder, skeptic, narrator। अगले practical में घुमाओ।")}</li>
          <li>{pick(lang, "8 minutes. One graph, one viva question taken from a bench’s own numbers, one line in the file.", "8 मिनट। एक graph, एक viva जो उसी bench की संख्या से हो, file में एक पंक्ति।")}</li>
          <li>{pick(lang, "4 minutes. Exit ticket: what would change if…?", "4 मिनट। Exit ticket: अगर ऐसा हो तो क्या बदलेगा?")}</li>
        </ol>
        <h2>{pick(lang, "Page 2. When the room fails", "पृष्ठ 2. जब कमरा साथ न दे")}</h2>
        <ul>
          <li>{pick(lang, "Power cut: leave the projector. The Lite pack on the phones still runs the practical, the file, and the viva.", "बिजली गई: projector छोड़ो। फोन का Lite pack practical, file और viva चलाता रहता है।")}</li>
          <li>{pick(lang, "A substitute can press Start and read the four beats. Subject expertise can wait until the null point.", "Substitute शिक्षक Start दबाकर चार beats पढ़ सकता है। विषय की गहराई null point तक रुक सकती है।")}</li>
          <li>{pick(lang, "Identical readings are flagged to you. Ask for a fresh run. Do not announce the names.", "एक जैसी readings तुम्हें दिखेंगी। नया रन माँगो। नाम घोषित मत करो।")}</li>
          <li>{pick(lang, "Homework the night before can be the prediction only. The period then begins from the surprise.", "पिछली रात का काम केवल prediction हो सकता है। Period फिर आश्चर्य से शुरू होता है।")}</li>
        </ul>
      </main>
    </>
  );
}
