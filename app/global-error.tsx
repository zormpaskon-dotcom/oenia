"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="el">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
          background: "#FDFBF7",
          color: "#362B22",
          padding: 32,
          textAlign: "center",
        }}
      >
        <div>
          <p style={{ fontSize: 14, color: "#C99A4F", marginBottom: 10 }}>Κάτι πήγε στραβά</p>
          <h1 style={{ fontSize: 32, margin: "0 0 16px", fontWeight: 500 }}>Το Oenia έσκασε.</h1>
          <p style={{ color: "#8A7A68", maxWidth: "50ch", margin: "0 auto 28px" }}>
            Καταγράψαμε το σφάλμα. Δοκίμασε να ξαναφορτώσεις τη σελίδα.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#4A2117",
              color: "#FDFBF7",
              border: "none",
              padding: "12px 26px",
              borderRadius: 14,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Δοκίμασε ξανά
          </button>
        </div>
      </body>
    </html>
  );
}
