import type { Metadata } from "next";
import { Fraunces, Inter, Alex_Brush } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgeGate from "@/components/AgeGate";
import CookieBanner from "@/components/CookieBanner";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Fraunces δεν έχει "greek" subset στο Google Fonts, οπότε οι ελληνικοί τίτλοι
// θα πέφτουν στο fallback serif (Georgia) — ίδια συμπεριφορά είχαν και τα HTML prototypes.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

// Το site είναι εξ ολοκλήρου στα ελληνικά, γι' αυτό ζητάμε και το "greek" subset —
// χωρίς αυτό, οι ελληνικοί χαρακτήρες δεν θα «πιάνουν» τη γραμματοσειρά.
const inter = Inter({
  subsets: ["latin", "greek"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alex-brush",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Oenia — Το κρασί της Ελλάδας",
  description:
    "Ενημερωτικό site για το ελληνικό κρασί: ετικέτες, οινοποιεία, ποικιλίες, άρθρα.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="el"
      className={`${fraunces.variable} ${inter.variable} ${alexBrush.variable}`}
    >
      <body>
        <AgeGate />
        <Header />
        {children}
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
