"use client";

import { Topbar } from "@/components/Chrome";
import { pick } from "@/content/copy";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function StudentGuide() {
  const { profile } = useStore();
  const lang = profile.language;
  return (
    <>
      <Topbar />
      <main className="wrap" style={{ paddingBottom: 40, maxWidth: 760 }}>
        <h1>{pick(lang, "Student card", "विद्यार्थी कार्ड")}</h1>
        <ol>
          <li>{pick(lang, "Predict before the bench unlocks. To change it, write what changed your mind.", "Bench खुलने से पहले अनुमान लिखो। बदलना हो तो लिखो कि मन क्यों बदला।")}</li>
          <li>{pick(lang, "Take the reading yourself. A number you never measured will not appear in the file.", "Reading खुद लो। जो संख्या तुमने नहीं नापी, वह file में नहीं आएगी।")}</li>
          <li>{pick(lang, "Apply zero error and parallax yourself. The software will not quietly fix them.", "Zero error और parallax खुद लगाओ। सॉफ़्टवेयर चुपचाप नहीं सुधारेगा।")}</li>
          <li>{pick(lang, "Say the result in your own sentence. The comment may disagree. It will not overwrite you.", "परिणाम अपने वाक्य में कहो। टिप्पणी असहमत हो सकती है। वह तुम्हें मिटाएगी नहीं।")}</li>
          <li>{pick(lang, "Print the file, or copy it by hand. Export is black ink on white.", "File छापो, या हाथ से उतारो। निर्यात सफ़ेद पर काली स्याही है।")}</li>
        </ol>
        <p><Link href="/practicals">{pick(lang, "Back to the practicals", "Practicals पर लौटो")}</Link></p>
      </main>
    </>
  );
}
