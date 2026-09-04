import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import JsonLd from "@/components/JsonLd";
import WinePhoto from "@/components/WinePhoto";

async function getWinery(slug: string) {
  return prisma.winery.findUnique({
    where: { slug },
    include: {
      region: { select: { name: true, slug: true } },
      wines: {
        where: { status: ContentStatus.PUBLISHED },
        orderBy: { name: "asc" },
        include: { varieties: { include: { variety: { select: { name: true } } } } },
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
  const winery = await getWinery(slug);
  if (!winery) return {};
  return {
    title: `${winery.name} — ${winery.region.name} | Oenia`,
    description: winery.description ?? undefined,
  };
}

export default async function WineryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const winery = await getWinery(slug);
  if (!winery) notFound();

  const mainVarieties = Array.from(
    new Set(winery.wines.flatMap((w) => w.varieties.map((v) => v.variety.name)))
  );

  const storyParagraphs = [winery.description, winery.story, winery.philosophy].filter(
    (p): p is string => !!p
  );

  return (
    <div className="wrap">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Winery",
          name: winery.name,
          description: winery.description ?? undefined,
          url: winery.websiteUrl ?? undefined,
          telephone: winery.phone ?? undefined,
          address: winery.address ? { "@type": "PostalAddress", streetAddress: winery.address } : undefined,
          geo:
            winery.latitude != null && winery.longitude != null
              ? { "@type": "GeoCoordinates", latitude: winery.latitude, longitude: winery.longitude }
              : undefined,
        }}
      />
      <p className="breadcrumb">
        <Link href="/">Αρχική</Link> / <Link href="/oinopoieia">Οινοποιεία</Link> / {winery.name}
      </p>
      <div
        className="cover"
        style={
          winery.coverImage
            ? { backgroundImage: `url(${winery.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      />

      <div className="winery-head">
        <div>
          <span className="region-tag">
            {winery.region.name}
            {winery.subRegion ? ` · ${winery.subRegion}` : ""}
          </span>
          <h1>{winery.name}</h1>
          <span className="winery-sub">
            {winery.foundedYear ? `Οικογενειακό κτήμα από το ${winery.foundedYear}` : "Οινοποιείο"}
            {winery.generation ? ` · ${winery.generation}η γενιά` : ""}
          </span>
        </div>
        <div className="winery-badges">
          {winery.isVerified && <span className="visit-badge">Επαληθευμένο προφίλ</span>}
          {winery.isOrganic && <span className="visit-badge">Βιολογική καλλιέργεια</span>}
          {winery.acceptsVisitors && <span className="visit-badge">Δέχεται επισκέπτες</span>}
        </div>
      </div>

      <div className="story-grid">
        <div className="story">
          {storyParagraphs.length > 0 ? (
            storyParagraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p style={{ color: "var(--muted)" }}>Δεν υπάρχει ακόμα περιγραφή για αυτό το οινοποιείο.</p>
          )}
        </div>
        <div className="facts-side">
          {winery.foundedYear && (
            <div className="fact">
              <span className="label">Ίδρυση</span>
              <span className="value">{winery.foundedYear}</span>
            </div>
          )}
          {winery.vineyardHectares && (
            <div className="fact">
              <span className="label">Έκταση αμπελώνα</span>
              <span className="value">{winery.vineyardHectares} εκτάρια</span>
            </div>
          )}
          {mainVarieties.length > 0 && (
            <div className="fact">
              <span className="label">Κύριες ποικιλίες</span>
              <span className="value">{mainVarieties.join(", ")}</span>
            </div>
          )}
          {winery.visitingHours && (
            <div className="fact">
              <span className="label">Επισκέψεις</span>
              <span className="value">{winery.visitingHours}</span>
            </div>
          )}
        </div>
      </div>

      {winery.wines.length > 0 && (
        <>
          <h2 className="section-title">Ετικέτες του οινοποιείου</h2>
          <div className="label-grid">
            {winery.wines.map((wine) => (
              <Link key={wine.id} href={`/krasia/${wine.slug}`} className="label-card">
                <WinePhoto labelImage={wine.labelImage} color={wine.color} wineName={wine.name} className="label-photo" sizes="(max-width: 820px) 100vw, 33vw" />
                <h3>{wine.name}</h3>
                <p className="meta">
                  {wine.color === "WHITE" ? "Λευκό" : wine.color === "RED" ? "Κόκκινο" : "Ροζέ"}
                  {wine.vintage ? ` · ${wine.vintage}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
