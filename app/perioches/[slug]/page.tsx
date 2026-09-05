import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { APPELLATION_LABEL, COLOR_GRADIENT, MACRO_REGION_LABEL } from "@/lib/labels";

async function getRegion(slug: string) {
  return prisma.region.findUnique({
    where: { slug },
    include: {
      varieties: { include: { variety: { select: { name: true, slug: true } } } },
      wines: {
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { avgRating: "desc" },
        include: { winery: { select: { name: true } } },
      },
      wineries: {
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { name: "asc" },
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
  const region = await getRegion(slug);
  if (!region) return {};
  return {
    title: `${region.name} — Περιοχή | Oenia`,
    description: region.description ?? undefined,
  };
}

export default async function RegionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const region = await getRegion(slug);
  if (!region) notFound();

  return (
    <div className="wrap">
      <p className="breadcrumb">
        <Link href="/">Αρχική</Link> / <Link href="/perioches">Περιοχές</Link> / {region.name}
      </p>

      <div className="region-hero">
        <div className="region-hero-text">
          <p className="kicker">
            {MACRO_REGION_LABEL[region.macroRegion] ?? region.macroRegion}
            {region.appellation ? ` · ${APPELLATION_LABEL[region.appellation]}` : ""}
          </p>
          <h1>{region.name}</h1>
        </div>
      </div>

      <div className="region-intro">
        <div>
          {region.description ? (
            <p>{region.description}</p>
          ) : (
            <p style={{ color: "var(--muted)" }}>Δεν υπάρχει ακόμα περιγραφή για αυτή την περιοχή.</p>
          )}
        </div>
        <div className="facts-side">
          {region.recognizedYear && (
            <div className="fact">
              <span className="label">Αναγνώριση ΠΟΠ/ΠΓΕ</span>
              <span className="value">{region.recognizedYear}</span>
            </div>
          )}
          {(region.altitudeMin || region.altitudeMax) && (
            <div className="fact">
              <span className="label">Υψόμετρο</span>
              <span className="value">
                {region.altitudeMin ?? "—"}–{region.altitudeMax ?? "—"} μ.
              </span>
            </div>
          )}
          {region.varieties.length > 0 && (
            <div className="fact">
              <span className="label">Ποικιλίες</span>
              <span className="value">{region.varieties.map((v) => v.variety.name).join(", ")}</span>
            </div>
          )}
          {region.areaHectares && (
            <div className="fact">
              <span className="label">Έκταση</span>
              <span className="value">~{region.areaHectares} εκτάρια</span>
            </div>
          )}
          <div className="fact">
            <span className="label">Στο Oenia</span>
            <span className="value">
              {region.wines.length} ετικέτες · {region.wineries.length} οινοποιεία
            </span>
          </div>
        </div>
      </div>

      {region.varieties.length > 0 && (
        <section>
          <h2 className="section-title">Ποικιλίες της περιοχής</h2>
          <div className="chip-row">
            {region.varieties.map((v) => (
              <Link key={v.varietyId} href={`/poikilies/${v.variety.slug}`} className="chip-static">
                {v.variety.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {region.wines.length > 0 && (
        <section>
          <h2 className="section-title">Ετικέτες από {region.name}</h2>
          <div className="card-grid">
            {region.wines.map((wine) => (
              <Link key={wine.id} href={`/krasia/${wine.slug}`} className="mini-card reveal">
                <div className="mini-photo" style={{ background: COLOR_GRADIENT[wine.color] }} />
                <h3>{wine.name}</h3>
                <p className="meta">
                  {wine.winery.name}
                  {wine.vintage ? ` · ${wine.vintage}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {region.wineries.length > 0 && (
        <section>
          <h2 className="section-title">Οινοποιεία στην περιοχή {region.name}</h2>
          <div>
            {region.wineries.map((w) => (
              <Link key={w.id} href={`/oinopoieia/${w.slug}`} className="winery-row">
                <div className="winery-thumb" />
                <div>
                  <h3>{w.name}</h3>
                  <span className="meta">
                    {w.subRegion ?? region.name}
                    {w.foundedYear ? ` · Οικογενειακό από το ${w.foundedYear}` : ""}
                  </span>
                </div>
                {w.acceptsVisitors && <span className="visit">Δέχεται επισκέπτες</span>}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
