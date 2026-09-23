// app/layout.tsx
import type { Metadata } from "next";
import { Be_Vietnam_Pro, EB_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/app/contexts/AuthContext";

/**
 * Typefaces chosen for Vietnamese.
 *
 * What was here before did not work for this language. `body` was set to Arial,
 * so most of the interface fell back to a system font whose Vietnamese
 * diacritics are an afterthought; Geist was loaded but overridden. The
 * stylesheets then asked for Nunito, Lato, Cormorant Garamond, Playfair Display
 * and Times New Roman through thirteen separate blocking `@import url(...)`
 * calls — and Lato, which set the body text of the About page, has no Vietnamese
 * subset at all, so every ế, ữ and ộ there was substituted from a fallback face
 * one character at a time.
 *
 * Be Vietnam Pro is drawn for Vietnamese: the tone marks are designed to stack
 * over the vowel diacritics rather than collide with them, which is the part
 * Latin-first families get wrong.
 *
 * EB Garamond carries the display headings. It is the same Garamond lineage as
 * the Cormorant Garamond it replaces, so every heading size already tuned in the
 * stylesheets still reads at the size it was tuned for - but its strokes are
 * substantial where Cormorant's are hairlines, which is what made a stacked
 * mark like the one in "tiệm" disappear at small sizes.
 *
 * Both are loaded here through next/font, which self-hosts them, preloads them
 * and emits `font-display: swap` — so they arrive with the page instead of after
 * thirteen round trips to Google's CSS endpoint.
 */
const sans = Be_Vietnam_Pro({
  variable: "--font-sans-loaded",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const display = EB_Garamond({
  variable: "--font-display-loaded",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  // A real italic, because three stylesheets set `font-style: italic` on this
  // face for image captions and the city subtitle. No italic was ever loaded
  // before, so the browser slanted the upright face itself - and a synthetic
  // slant shears a Vietnamese tone mark away from the vowel under it.
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VietNomNom",
  description: "Smart Food Recommendation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The interface is Vietnamese by default, which is what decides hyphenation
    // and which font a browser reaches for; `lang="en"` was simply wrong.
    <html lang="vi">
      <body className={`${sans.variable} ${display.variable} antialiased`}>
        <AuthProvider>
          <Toaster position="top-center" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
