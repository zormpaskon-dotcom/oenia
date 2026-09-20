import { ImageResponse } from "next/og";

// Favicon παραγόμενο από την υπάρχουσα ταυτότητα του header ("oenia" logo,
// .logo στο app/globals.css) — ίδιο χρώμα brand (--wine: #641522) πάνω σε
// --paper (#F7F4EF), απλά περιορισμένο σε ένα γράμμα ώστε να διαβάζεται σε
// μέγεθος tab-icon. Καμία νέα ταυτότητα, μόνο σμίκρυνση της υπάρχουσας.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F7F4EF",
          borderRadius: 7,
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 24,
            fontWeight: 700,
            color: "#641522",
          }}
        >
          O
        </span>
      </div>
    ),
    { ...size }
  );
}
