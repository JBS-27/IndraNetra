import type { Metadata, Viewport } from "next";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: "IndraNetra",
  description: "A digital laboratory for Class 11 and 12 Physics, Chemistry, and Mathematics practicals.",
  applicationName: "IndraNetra",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3ead7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="daylight">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var p=JSON.parse(localStorage.getItem("indranetra.profile.v1")||"{}");if(p.theme)document.documentElement.dataset.theme=p.theme;if(p.language)document.documentElement.lang=p.language==="hi"?"hi":"en";}catch(e){}`,
          }}
        />
      </head>
      <body style={{ fontFamily: "var(--font-sans), var(--font-hindi), sans-serif" }}>
        <a className="skip" href="#content">Skip to content</a>
        <StoreProvider>
          <div id="content">{children}</div>
        </StoreProvider>
      </body>
    </html>
  );
}
