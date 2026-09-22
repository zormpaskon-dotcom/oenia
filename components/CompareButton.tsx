"use client";

import { useRouter } from "next/navigation";

// Μικρό secondary action πάνω στο WineCard — στέλνει τον χρήστη στο ήδη
// υπάρχον /sygkrisi?w=... URL-state του CompareSlots, με το συγκεκριμένο
// κρασί ήδη στο πρώτο slot. Δεν φτιάχνει δεύτερο parallel state σύστημα.
export default function CompareButton({ slug }: { slug: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="card-compare-btn"
      aria-label="Πρόσθεσε στη σύγκριση ετικετών"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/sygkrisi?w=${slug}`);
      }}
    >
      Σύγκριση
    </button>
  );
}
