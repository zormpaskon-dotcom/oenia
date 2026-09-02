"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const links = [
  { href: "/chartis", label: "Χάρτης" },
  { href: "/tairiasma", label: "Τι θα φας;" },
  { href: "/sygkrisi", label: "Σύγκριση ετικετών" },
  { href: "/diavatirio", label: "Το διαβατήριό σου" },
];

export default function ExploreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className="explore-menu" ref={ref}>
      <button
        type="button"
        className="explore-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Εξερεύνηση
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="explore-panel" role="menu">
          {links.map((l) => (
            <Link key={l.href} href={l.href} role="menuitem" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
