"use client";

import { useState } from "react";
import Image from "next/image";
import type { MacroRegion } from "@prisma/client";
import { MACRO_REGION_GRADIENT } from "@/lib/labels";

const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>" +
      "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>" +
      "<rect width='100%' height='100%' filter='url(#n)'/>" +
      "</svg>"
  );

// Ίδιο idiom με WinePhoto.tsx/WineryPhoto.tsx. Το heroImage είναι πραγματικό
// DB πεδίο (Region.heroImage), οπότε next/image εδώ (σε αντίθεση με το
// WineryPhoto που χρησιμοποιεί <img> λόγω ~50 external domains).
export default function RegionPhoto({
  heroImage,
  macroRegion,
  regionName,
  className,
  sizes,
}: {
  heroImage: string | null;
  macroRegion: MacroRegion;
  regionName: string;
  className: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!heroImage || failed) {
    return (
      <div
        className={className}
        role="img"
        aria-label={regionName}
        style={{ position: "relative", overflow: "hidden", background: MACRO_REGION_GRADIENT[macroRegion] }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${NOISE_SVG}")`,
            opacity: 0.05,
            mixBlendMode: "overlay",
          }}
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: "40%",
            height: "40%",
            opacity: 0.4,
          }}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d="M6 74l20-26 14 16 12-20 16 22 26-32v66H6z" />
          <path d="M70 20c0 6-3 9-6 9s-6-3-6-9c0-4 2-9 6-14 4 5 6 10 6 14z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={className} style={{ position: "relative", overflow: "hidden" }}>
      <Image
        src={heroImage}
        alt={regionName}
        fill
        sizes={sizes ?? "(max-width: 700px) 100vw, (max-width: 980px) 50vw, 33vw"}
        style={{ objectFit: "cover" }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
