"use client";

import { useRouter, useSearchParams } from "next/navigation";

/** Γενική εκδοχή του SortSelect.tsx — εκείνο έχει hardcoded το path "/krasia"
 * και το δικό του SORT_OPTIONS import, οπότε δεν είναι επαναχρησιμοποιήσιμο
 * σε άλλη σελίδα χωρίς αλλαγή. Ίδιο idiom, με basePath/options/featuredValue
 * ως props αντί για hardcoded τιμές, ώστε το /krasia να μην αγγιχτεί καθόλου. */
export default function ListSortSelect({
  basePath,
  current,
  options,
  featuredValue = "featured",
}: {
  basePath: string;
  current: string;
  options: readonly { value: string; label: string }[];
  featuredValue?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === featuredValue) {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <select className="sort-select" value={current} onChange={(e) => onChange(e.target.value)}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
