"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/app/krasia/filters";

export default function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "featured") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    // Αλλαγή ταξινόμησης → πάντα πίσω στη σελίδα 1, ίδιο σκεπτικό με το
    // hrefFor/hrefForPage (app/krasia/filters.ts): filter/sort αλλαγή δεν
    // πρέπει ποτέ να αφήνει τον χρήστη σε μια σελίδα-νούμερο που πλέον δεν
    // έχει νόημα για το νέο σύνολο αποτελεσμάτων.
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/krasia?${qs}` : "/krasia");
  }

  return (
    <select className="sort-select" value={current} onChange={(e) => onChange(e.target.value)}>
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
