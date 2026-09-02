"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
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
    <div className="wrap" style={{ padding: "120px 32px", textAlign: "center" }}>
      <p className="kicker" style={{ textAlign: "center" }}>
        Κάτι πήγε στραβά
      </p>
      <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>Αυτή η σελίδα έσκασε.</h1>
      <p style={{ color: "var(--muted)", marginTop: 16, maxWidth: "50ch", marginLeft: "auto", marginRight: "auto" }}>
        Δεν είναι κάτι που έκανες εσύ — καταγράψαμε το σφάλμα. Δοκίμασε ξανά ή γύρνα στην αρχική.
      </p>
      <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
        <button type="button" className="btn-primary" style={{ border: "none", cursor: "pointer" }} onClick={reset}>
          Δοκίμασε ξανά
        </button>
        <Link href="/" className="btn-ghost">
          Πίσω στην αρχική
        </Link>
      </div>
    </div>
  );
}
