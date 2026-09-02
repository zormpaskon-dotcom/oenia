"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { COLOR_GRADIENT } from "@/lib/labels";
import type { WineColor } from "@prisma/client";

export type CompareOption = { slug: string; name: string; wineryName: string };
export type CompareSelected = { slug: string; name: string; color: WineColor } | null;

const SLOT_COUNT = 3;

export default function CompareSlots({
  options,
  selected,
}: {
  options: CompareOption[];
  selected: CompareSelected[];
}) {
  const router = useRouter();
  const slots = Array.from({ length: SLOT_COUNT }, (_, i) => selected[i] ?? null);

  function updateSlot(index: number, slug: string) {
    const slugs = slots.map((s) => s?.slug ?? "");
    slugs[index] = slug;
    const qs = slugs.filter(Boolean).join(",");
    router.push(qs ? `/sygkrisi?w=${qs}` : "/sygkrisi");
  }

  return (
    <div className="compare-slots">
      {slots.map((wine, i) => {
        const takenElsewhere = new Set(slots.filter((_, j) => j !== i).map((s) => s?.slug));
        return (
          <div className="compare-slot" key={i}>
            {wine ? (
              <div className="compare-slot-filled">
                <Link href={`/krasia/${wine.slug}`} className="mini-photo" style={{ background: COLOR_GRADIENT[wine.color] }} />
                <div>
                  <Link href={`/krasia/${wine.slug}`}>
                    <strong>{wine.name}</strong>
                  </Link>
                </div>
                <button type="button" className="compare-remove" onClick={() => updateSlot(i, "")}>
                  Αφαίρεση
                </button>
              </div>
            ) : (
              <select
                className="sort-select"
                value=""
                onChange={(e) => updateSlot(i, e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="">Πρόσθεσε ετικέτα…</option>
                {options
                  .filter((o) => !takenElsewhere.has(o.slug))
                  .map((o) => (
                    <option key={o.slug} value={o.slug}>
                      {o.name} — {o.wineryName}
                    </option>
                  ))}
              </select>
            )}
          </div>
        );
      })}
    </div>
  );
}
