import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentStatus, VarietyType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { COLOR_GRADIENT } from "@/lib/labels";

const TRAITS: { key: "acidity" | "body" | "tannins" | "aromaIntensity" | "ageingPotential"; label: string }[] = [
  { key: "acidity", label: "Οξύτητα" },
  { key: "body", label: "Σώμα" },
  { key: "tannins", label: "Τανίνες" },
  { key: "aromaIntensity", label: "Άρωμα" },
  { key: "ageingPotential", label: "Δυναμικό παλαίωσης" },
];

function LeafIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3c5 3 7 8 4 13-2 3-6 4-8 2-2-3 0-8 4-11z" />
      <path d="M12 3v16" />
    </svg>
  );
}

async function getVariety(slug: string) {
  return prisma.variety.findUnique({
    where: { slug },
    include: {
      regions: { include: { region: { select: { name: true, slug: true } } } },
      wines: {
        include: {
          wine: {
            include: { winery: { select: { name: true } } },
          },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const variety = await getVariety(slug);
  if (!variety) return {};
  return {
    title: `${variety.name} — Ελληνική ποικιλία | Oenia`,
    description: variety.description ?? undefined,
  };
}

export default async function VarietyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const variety = await getVariety(slug);
  if (!variety) notFound();

  const publishedWines = variety.wines
    .map((v) => v.wine)
    .filter((w) => w.status === ContentStatus.PUBLISHED);

  return (
    <>
      <div className="wrap">
        <p className="breadcrumb">
          <Link href="/">Αρχική</Link> / <Link href="/poikilies">Ποικιλίες</Link> / {variety.name}
        </p>
      </div>

      <div className="wrap variety-hero">
        <div className="leaf-badge">
          <LeafIcon />
        </div>
        <span className="type-tag">{variety.type === VarietyType.WHITE ? "Λευκή ποικιλία" : "Κόκκινη ποικιλία"}</span>
        <h1>{variety.name}</h1>
        {variety.description && <p className="lead">{variety.description}</p>}

        <div className="trait-row">
          {TRAITS.filter((t) => variety[t.key] !== null && variety[t.key] !== undefined).map((t) => (
            <div className="trait" key={t.key}>
              <span className="label">{t.label}</span>
              <div className="trait-bar">
                <span style={{ width: `${variety[t.key]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {variety.characteristics && (
        <section>
          <div className="wrap">
            <h2 className="section-title">Χαρακτηριστικά</h2>
            <p className="body-text">{variety.characteristics}</p>
          </div>
        </section>
      )}

      {variety.regions.length > 0 && (
        <>
          <div className="wave-divider" aria-hidden="true">
            <svg viewBox="0 0 1440 64" preserveAspectRatio="none">
              <path d="M0,32 C 240,64 480,0 720,28 C 960,56 1200,8 1440,32 L1440,64 L0,64 Z" fill="var(--paper-alt)" />
            </svg>
          </div>
          <section style={{ background: "var(--paper-alt)" }}>
            <div className="wrap">
              <h2 className="section-title">Πού καλλιεργείται</h2>
              <div className="region-list">
                {variety.regions.map((r) => (
                  <Link key={r.regionId} href={`/perioches/${r.region.slug}`} className="region-chip">
                    {r.region.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>
          <div className="wave-divider flip" aria-hidden="true">
            <svg viewBox="0 0 1440 64" preserveAspectRatio="none">
              <path d="M0,32 C 240,64 480,0 720,28 C 960,56 1200,8 1440,32 L1440,64 L0,64 Z" fill="var(--paper-alt)" />
            </svg>
          </div>
        </>
      )}

      {variety.similarTo && (
        <section>
          <div className="wrap">
            <h2 className="section-title">Για σύγκριση</h2>
            <div className="compare-box">
              <h3>
                {variety.name} vs {variety.similarTo}
              </h3>
              {variety.comparisonNote && <p>{variety.comparisonNote}</p>}
            </div>
          </div>
        </section>
      )}

      {publishedWines.length > 0 && (
        <section style={{ background: "var(--paper-alt)" }}>
          <div className="wrap">
            <h2 className="section-title">Ετικέτες με {variety.name}</h2>
            <div className="label-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
              {publishedWines.map((wine) => (
                <Link key={wine.id} href={`/krasia/${wine.slug}`} className="label-card">
                  <div className="label-photo" style={{ background: COLOR_GRADIENT[wine.color] }} />
                  <h3 style={{ fontSize: 16 }}>{wine.name}</h3>
                  <p className="meta">{wine.winery.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
