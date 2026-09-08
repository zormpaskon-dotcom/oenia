import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import HomeContent from "@/components/HomeContent";

// Το προτεινόμενο κρασί της αρχικής — συγκεκριμένη, επιμελημένη επιλογή (όχι
// τυχαία), με fallback σε περίπτωση που η ετικέτα αλλάξει/αφαιρεθεί.
const FEATURED_WINE_SLUG = "sigalas-santorini-assyrtiko";

async function getFeaturedWine() {
  const bySlug = await prisma.wine.findFirst({
    where: { slug: FEATURED_WINE_SLUG, status: ContentStatus.PUBLISHED, labelImage: { not: null } },
    include: {
      winery: { select: { name: true, slug: true } },
      region: { select: { name: true } },
      varieties: { include: { variety: { select: { name: true } } } },
    },
  });
  if (bySlug) return bySlug;

  return prisma.wine.findFirst({
    where: { status: ContentStatus.PUBLISHED, labelImage: { not: null } },
    orderBy: { avgRating: "desc" },
    include: {
      winery: { select: { name: true, slug: true } },
      region: { select: { name: true } },
      varieties: { include: { variety: { select: { name: true } } } },
    },
  });
}

export default async function Home() {
  const featuredWine = await getFeaturedWine();

  return <HomeContent featuredWine={featuredWine} />;
}
