import type { Metadata } from "next";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import HomeContent from "@/components/HomeContent";
import JsonLd from "@/components/JsonLd";
import { COLOR_ENUM } from "@/app/krasia/filters";
import { isDiscoveryBucket, type DiscoveryBucket } from "@/lib/discovery";
import { SITE_URL } from "@/lib/site";

// Ίδιο title/description με το root layout (app/layout.tsx) — εδώ τα
// επαναλαμβάνουμε ρητά μόνο επειδή τα openGraph/twitter πεδία δεν κληρονομούν
// αυτόματα τα top-level title/description, όχι γιατί αλλάζει κάτι.
const HOME_TITLE = "Oenia — Το κρασί της Ελλάδας";
const HOME_DESCRIPTION =
  "Ενημερωτικό site για το ελληνικό κρασί: ετικέτες, οινοποιεία, ποικιλίες, άρθρα.";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
    siteName: "World of Oenia",
    locale: "el_GR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

// Το προτεινόμενο κρασί της αρχικής — συγκεκριμένη, επιμελημένη επιλογή (όχι
// τυχαία), με fallback σε περίπτωση που η ετικέτα αλλάξει/αφαιρεθεί.
const FEATURED_WINE_SLUG = "sigalas-santorini-assyrtiko";

async function getFeaturedWine() {
  const include = {
    winery: { select: { name: true, slug: true } },
    region: { select: { name: true } },
    varieties: { include: { variety: { select: { name: true } } } },
  } as const;

  const bySlug = await prisma.wine.findFirst({
    where: { slug: FEATURED_WINE_SLUG, status: ContentStatus.PUBLISHED, labelImage: { not: null } },
    include,
  });
  if (bySlug) return bySlug;

  return prisma.wine.findFirst({
    where: { status: ContentStatus.PUBLISHED, labelImage: { not: null } },
    orderBy: { avgRating: "desc" },
    include,
  });
}

// "Curated Discovery" — Ένα μόνο, πραγματικό κριτήριο (χρώμα, ή isSparkling),
// ποτέ scoring/AI/random. Ίδιο include shape με το /krasia (app/krasia/page.tsx)
// ώστε το αποτέλεσμα να τροφοδοτεί το ίδιο <WineCard> χωρίς προσαρμογή.
async function getDiscoveryWines(bucket: DiscoveryBucket) {
  const where =
    bucket === "sparkling"
      ? { status: ContentStatus.PUBLISHED, isSparkling: true }
      : { status: ContentStatus.PUBLISHED, color: COLOR_ENUM[bucket] };

  // Το /krasia δεν υποστηρίζει filter σε isSparkling (μόνο color/region/variety/
  // winery/style) — δεν το προσθέτουμε εδώ (out of scope). Άρα για το "sparkling"
  // bucket δείχνουμε ό,τι υπάρχει χωρίς όριο (7 σήμερα) αντί για "δες όλα" link
  // προς ένα φίλτρο που δεν υπάρχει· τα color buckets κρατούν το μικρό preview
  // των 6 + πραγματικό "δες όλα" link στο ήδη φιλτραρισμένο /krasia.
  const take = bucket === "sparkling" ? undefined : 6;

  const [wines, total] = await Promise.all([
    prisma.wine.findMany({
      where,
      // reviewCount/avgRating προηγούνται όταν υπάρχουν πραγματικές αξιολογήσεις·
      // σήμερα είναι 0 παντού, οπότε η ταξινόμηση καταλήγει σε name asc — ποτέ
      // Math.random(), ποτέ fake ranking.
      orderBy: [{ reviewCount: "desc" }, { avgRating: "desc" }, { name: "asc" }],
      take,
      include: {
        winery: { select: { name: true, slug: true } },
        region: { select: { name: true, slug: true } },
        varieties: { include: { variety: { select: { name: true } } } },
      },
    }),
    prisma.wine.count({ where }),
  ]);

  return { wines, total };
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const discoverParam = typeof sp.discover === "string" ? sp.discover : undefined;
  const discoveryBucket = isDiscoveryBucket(discoverParam) ? discoverParam : null;

  const [featuredWine, discovery] = await Promise.all([
    getFeaturedWine(),
    discoveryBucket ? getDiscoveryWines(discoveryBucket) : Promise.resolve(null),
  ]);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "World of Oenia",
          url: SITE_URL,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "World of Oenia",
          url: SITE_URL,
        }}
      />
      <HomeContent featuredWine={featuredWine} discoveryBucket={discoveryBucket} discovery={discovery} />
    </>
  );
}
