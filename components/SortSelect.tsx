"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SORT_OPTIONS } from "@/app/krasia/filters";

export default function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "popular") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
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
