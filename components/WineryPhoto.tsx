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

// Ίδιο idiom με WinePhoto.tsx: πραγματική φωτογραφία αν υπάρχει, αλλιώς
// gradient placeholder με υφή + line-art icon. Το WINERY_IMAGES hero.src
// δείχνει σε ~50 διαφορετικά external domains (ένα per οινοποιείο) — αδύνατο
// να μπουν όλα στο next.config.ts remotePatterns, οπότε <img>, όχι next/image
// (ίδιο compromise με το προηγούμενο .catalog-row-photo).
export default function WineryPhoto({
  hero,
  macroRegion,
  wineryName,
  className,
}: {
  hero: { src: string; alt: string } | undefined;
  macroRegion: MacroRegion;
  wineryName: string;
  className: string;
}) {
  if (!hero) {
    return (
      <div
        className={className}
        role="img"
        aria-label={wineryName}
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
            width: "34%",
            height: "34%",
            opacity: 0.4,
          }}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d="M50 8c8 10 10 18 10 24 0 9-4.5 14-10 14s-10-5-10-14c0-6 2-14 10-24z" />
          <path d="M50 46v14" />
          <circle cx="38" cy="70" r="9" />
          <circle cx="50" cy="76" r="9" />
          <circle cx="62" cy="70" r="9" />
          <circle cx="44" cy="60" r="9" />
          <circle cx="56" cy="60" r="9" />
        </svg>
      </div>
    );
  }

  return (
    <div className={className} style={{ position: "relative", overflow: "hidden" }}>
      <img className="reveal img-reveal" src={hero.src} alt={hero.alt} loading="lazy" />
    </div>
  );
}
