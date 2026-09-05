import Image from "next/image";
import type { WineColor } from "@prisma/client";
import { COLOR_GRADIENT } from "@/lib/labels";

// Λεπτή υφή "grain" πάνω στο gradient placeholder, ώστε να μη δείχνει σαν
// επίπεδο, γενόσημο χρωματιστό ορθογώνιο.
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>" +
      "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>" +
      "<rect width='100%' height='100%' filter='url(#n)'/>" +
      "</svg>"
  );

/** Πραγματική φωτογραφία ετικέτας αν υπάρχει, αλλιώς gradient placeholder με λεπτή υφή και περίγραμμα μπουκαλιού. */
export default function WinePhoto({
  labelImage,
  color,
  wineName,
  className,
  sizes,
}: {
  labelImage: string | null;
  color: WineColor;
  wineName: string;
  className: string;
  sizes?: string;
}) {
  if (!labelImage) {
    return (
      <div
        className={className}
        role="img"
        aria-label={wineName}
        style={{ position: "relative", overflow: "hidden", background: COLOR_GRADIENT[color] }}
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
          viewBox="0 0 60 140"
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: "38%",
            height: "72%",
            opacity: 0.4,
          }}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d="M24 4h12v18c6 6 9 13 9 22v78a8 8 0 0 1-8 8H23a8 8 0 0 1-8-8V44c0-9 3-16 9-22V4z" />
          <line x1="24" y1="4" x2="36" y2="4" />
          <line x1="16" y1="58" x2="44" y2="58" />
        </svg>
      </div>
    );
  }
  return (
    // Σταθερό ανοιχτόχρωμο φόντο (όχι var(--paper-alt), που σκουραίνει σε dark
    // mode) — το mix-blend-mode "multiply" χρειάζεται πάντα ανοιχτό φόντο για
    // να σβήσει το λευκό φόντο των φωτογραφιών χωρίς να σκουραίνει το μπουκάλι.
    <div className={className} style={{ position: "relative", overflow: "hidden", background: "var(--photo-backdrop)" }}>
      <Image
        src={labelImage}
        alt={wineName}
        fill
        sizes={sizes ?? "200px"}
        style={{ objectFit: "contain", mixBlendMode: "multiply" }}
      />
    </div>
  );
}
