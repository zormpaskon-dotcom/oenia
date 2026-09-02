"use client";

import { useEffect, useRef, useState } from "react";

export type VineRegion = {
  slug: string;
  name: string;
  variety: string;
  blurb: string;
  x: number;
  y: number;
  labelDx: number;
  labelDy: number;
};

export default function HeroVineMap({ regions }: { regions: VineRegion[] }) {
  const pathRef = useRef<SVGPathElement>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const path = pathRef.current;
    if (path && !reduceMotion) {
      const length = path.getTotalLength();
      path.style.strokeDasharray = String(length);
      path.style.strokeDashoffset = String(length);
      requestAnimationFrame(() => {
        path.style.transition = "stroke-dashoffset 1.5s ease";
        path.style.strokeDashoffset = "0";
      });
    }
  }, []);

  const activeRegion = regions.find((r) => r.slug === active);

  function handleClick(slug: string) {
    const card = document.querySelector<HTMLElement>(`[data-region="${slug}"]`);
    if (!card) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    card.classList.add("is-highlighted");
    setTimeout(() => card.classList.remove("is-highlighted"), 1600);
  }

  return (
    <div className={`vine-wrap${active ? " has-active" : ""}`}>
      <svg viewBox="0 0 480 620" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          ref={pathRef}
          d="M60 40 C 180 90, 40 170, 160 210 C 280 250, 100 320, 220 370 C 340 420, 160 480, 280 540 C 360 580, 320 590, 300 600"
          stroke="#4A2117"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {regions.map((r) => (
          <g
            key={r.slug}
            className={`region-marker${active === r.slug ? " is-active" : ""}`}
            tabIndex={0}
            role="button"
            aria-label={`${r.name}, ${r.variety}`}
            onMouseEnter={() => setActive(r.slug)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(r.slug)}
            onBlur={() => setActive(null)}
            onClick={() => handleClick(r.slug)}
          >
            <circle className="hit" cx={r.x} cy={r.y} r={18} />
            <circle className="dot-marker" cx={r.x} cy={r.y} r={4.5} fill="#C99A4F" />
            <text x={r.x + r.labelDx} y={r.y + r.labelDy - 4} className="region-label">
              {r.name}
            </text>
            <text x={r.x + r.labelDx} y={r.y + r.labelDy + 12} className="region-sub">
              {r.variety}
            </text>
          </g>
        ))}
      </svg>

      <div className="vine-caption">
        {activeRegion ? (
          <>
            <strong>
              {activeRegion.name} — {activeRegion.variety}
            </strong>
            <p>{activeRegion.blurb}</p>
          </>
        ) : (
          <span className="vine-hint">Πέρασε το ποντίκι πάνω από μια περιοχή</span>
        )}
      </div>
    </div>
  );
}
