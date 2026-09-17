"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Debounced, URL-driven search box — δεν υπάρχει αντίστοιχο στο /krasia (δεν
 * έχει search field), οπότε είναι το ένα πραγματικά νέο κομμάτι εδώ. Ίδιο
 * idiom με το SortSelect.tsx: διαβάζει/γράφει τα υπόλοιπα searchParams χωρίς
 * να τα πειράζει, μηδενίζει πάντα το page σε κάθε αλλαγή αναζήτησης. */
export default function ListSearchInput({
  basePath,
  defaultValue,
  placeholder,
}: {
  basePath: string;
  defaultValue: string;
  placeholder: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("search", value.trim());
      else params.delete("search");
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${basePath}?${qs}` : basePath);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ίδιο σκεπτικό με SortSelect: μόνο η τιμή του input πυροδοτεί navigation
  }, [value]);

  return (
    <input
      type="text"
      className="quick-search"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  );
}
