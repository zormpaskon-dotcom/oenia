import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import CompareSlots, { type CompareOption } from "@/components/CompareSlots";
import { APPELLATION_LABEL, COLOR_NAME, reviewCountLabel, STYLE_NAME } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Σύγκριση ετικετών | Oenia",
  description: "Σύγκρινε έως 3 ελληνικές ετικέτες κρασιού δίπλα-δίπλα.",
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const raw = typeof sp.w === "string" ? sp.w : "";
  const slugs = raw.split(",").filter(Boolean).slice(0, 3);

  const [allWines, selectedWines] = await Promise.all([
    prisma.wine.findMany({
      where: { status: ContentStatus.PUBLISHED },
      select: { slug: true, name: true, winery: { select: { name: true } } },
      orderBy: { name: "asc" },
    }),
    slugs.length
      ? prisma.wine.findMany({
          where: { slug: { in: slugs }, status: ContentStatus.PUBLISHED },
          include: {
            winery: { select: { name: true } },
            region: { select: { name: true } },
            varieties: { include: { variety: { select: { name: true } } } },
          },
        })
      : Promise.resolve([]),
  ]);

  const options: CompareOption[] = allWines.map((w) => ({
    slug: w.slug,
    name: w.name,
    wineryName: w.winery.name,
  }));

  const wines = slugs
    .map((s) => selectedWines.find((w) => w.slug === s))
    .filter((w): w is NonNullable<typeof w> => !!w);

  const rows: { label: string; render: (w: (typeof wines)[number]) => ReactNode }[] = [
    { label: "Οινοποιείο", render: (w) => w.winery.name },
    { label: "Περιοχή", render: (w) => w.region.name },
    { label: "Ποικιλία", render: (w) => w.varieties.map((v) => v.variety.name).join(", ") || "—" },
    { label: "Χρώμα", render: (w) => COLOR_NAME[w.color] },
    { label: "Στιλ", render: (w) => STYLE_NAME[w.style] ?? "—" },
    { label: "Χρονιά", render: (w) => (w.vintage ? String(w.vintage) : "—") },
    { label: "Αλκοόλ", render: (w) => (w.abv ? `${w.abv}%` : "—") },
    { label: "Ονομασία", render: (w) => (w.appellation ? APPELLATION_LABEL[w.appellation] : "—") },
    {
      label: "Βαθμολογία",
      render: (w) => `${w.avgRating.toFixed(1).replace(".", ",")} · ${reviewCountLabel(w.reviewCount)}`,
    },
    { label: "Ταιριάζει με", render: (w) => w.foodPairings.join(", ") || "—" },
    { label: "Σημειώσεις γεύσης", render: (w) => w.tastingNotes || "—" },
  ];

  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <p className="kicker">Σύγκριση</p>
      <h1>Σύγκριση ετικετών</h1>
      <p className="result-count">Πρόσθεσε έως 3 ετικέτες για να τις δεις δίπλα-δίπλα.</p>

      <div style={{ marginTop: 32 }}>
        <CompareSlots
          options={options}
          selected={wines.map((w) => ({ slug: w.slug, name: w.name, color: w.color }))}
        />
      </div>

      {wines.length >= 2 ? (
        <div className="compare-table" style={{ marginTop: 40 }}>
          {rows.map((row) => (
            <div className="compare-row" key={row.label}>
              <div className="compare-row-label">{row.label}</div>
              {[0, 1, 2].map((i) => (
                <div className="compare-cell" key={i}>
                  {wines[i] ? row.render(wines[i]) : "—"}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--muted)", marginTop: 32 }}>
          Διάλεξε τουλάχιστον 2 ετικέτες παραπάνω για να ξεκινήσει η σύγκριση.
        </p>
      )}
    </div>
  );
}
