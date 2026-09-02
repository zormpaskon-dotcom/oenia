import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Η σελίδα δεν βρέθηκε | Oenia",
};

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: "120px 32px", textAlign: "center" }}>
      <p className="kicker" style={{ textAlign: "center" }}>
        404
      </p>
      <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>Αυτή η σελίδα δεν βρέθηκε.</h1>
      <p style={{ color: "var(--muted)", marginTop: 16, maxWidth: "50ch", marginLeft: "auto", marginRight: "auto" }}>
        Μπορεί να μετακινήθηκε, να διαγράφηκε, ή απλά να πληκτρολόγησες κάτι λάθος.
      </p>
      <Link href="/" className="btn-primary" style={{ marginTop: 32, display: "inline-block" }}>
        Πίσω στην αρχική
      </Link>
    </div>
  );
}
