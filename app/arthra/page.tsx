import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCategory, ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL } from "@/lib/labels";
import { SITE_URL } from "@/lib/site";
import { catalogSocialMeta } from "@/lib/catalog-seo";

const TITLE = "Άρθρα | Oenia";
const DESCRIPTION = "Άρθρα για ελληνικές ποικιλίες, περιοχές, παραγωγούς και οδηγούς κρασιού.";

const CATEGORY_ORDER = Object.values(ArticleCategory);

type SearchParams = { [key: string]: string | string[] | undefined };

// PHASE 3A / Section 4 — "category" δεν είναι πάντα μια χρήσιμη, μοναδική
// landing page: σήμερα 2 από τις 5 κατηγορίες (REGIONS, NEWS) έχουν 0 άρθρα,
// και ένα άγνωστο/ανύπαρκτο ?category=xyz απλά πέφτει σε "δείξε τα πάντα"
// στο ίδιο URL (βλ. ArticlesPage παρακάτω). Κανένα από τα δύο δεν αξίζει να
// γίνει ξεχωριστή indexable σελίδα με το ίδιο title/description της βάσης
// (thin/duplicate content). Κανόνας: μια κατηγορία γίνεται self-canonical +
// indexable με μοναδικό title/description ΜΟΝΟ όταν είναι πραγματική τιμή
// του enum ΚΑΙ έχει τουλάχιστον 1 δημοσιευμένο άρθρο αυτή τη στιγμή — ίδιο
// πνεύμα με τα "meaningful" filter keys του lib/facet-seo.ts, απλά
// βασισμένο σε πραγματικό, ζωντανό content count αντί για στατική λίστα
// τιμών, μιας και εδώ η "χρησιμότητα" μιας κατηγορίας εξαρτάται από το αν
// έχει καθόλου περιεχόμενο, όχι μόνο από το αν είναι έγκυρη τιμή enum.
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const raw = typeof sp.category === "string" ? sp.category : undefined;
  const isValidCategory = !!raw && CATEGORY_ORDER.includes(raw as ArticleCategory);

  const count = isValidCategory
    ? await prisma.article.count({
        where: { status: ContentStatus.PUBLISHED, publishedAt: { not: null }, category: raw as ArticleCategory },
      })
    : 0;
  const hasContent = isValidCategory && count > 0;
  // Χωρίς category param: πάντα indexable (η καθαρή βάση). Με category param:
  // indexable ΜΟΝΟ αν είναι έγκυρη τιμή ΚΑΙ έχει περιεχόμενο· ένα άγνωστο ή
  // άδειο category ΠΟΤΕ δεν μένει indexable (βλ. σχόλιο πάνω).
  const indexable = !raw || hasContent;

  const title = hasContent ? `${CATEGORY_LABEL[raw as ArticleCategory]} | Άρθρα | Oenia` : TITLE;
  const description = hasContent
    ? `${count} άρθρο${count === 1 ? "" : "α"} στην κατηγορία «${CATEGORY_LABEL[raw as ArticleCategory]}» — από το ημερολόγιο του Oenia για το ελληνικό κρασί.`
    : DESCRIPTION;
  const path = indexable && hasContent ? `/arthra?category=${raw}` : "/arthra";

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}${path}` },
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    ...catalogSocialMeta({ title, description, path, image: "/home/greece-band.jpg" }),
  };
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const activeCategory =
    typeof sp.category === "string" && CATEGORY_ORDER.includes(sp.category as ArticleCategory)
      ? (sp.category as ArticleCategory)
      : undefined;

  const [articles, categoryCounts] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: ContentStatus.PUBLISHED,
        publishedAt: { not: null },
        ...(activeCategory ? { category: activeCategory } : {}),
      },
      orderBy: { publishedAt: "desc" },
      include: { region: { select: { name: true } } },
    }),
    prisma.article.groupBy({
      by: ["category"],
      where: { status: ContentStatus.PUBLISHED, publishedAt: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const countByCategory = new Map(categoryCounts.map((c) => [c.category, c._count._all]));

  return (
    <div className="wrap page-intro" style={{ paddingBottom: 80 }}>
      <p className="kicker">Το ημερολόγιο του Oenia</p>
      <h1>Άρθρα</h1>
      <p className="result-count">{articles.length} άρθρα</p>

      <div className="filter-row" style={{ marginTop: 28 }}>
        <Link href="/arthra" className={`chip${!activeCategory ? " is-active" : ""}`}>
          Όλα
        </Link>
        {CATEGORY_ORDER.filter((c) => countByCategory.has(c)).map((c) => (
          <Link
            key={c}
            href={`/arthra?category=${c}`}
            className={`chip${activeCategory === c ? " is-active" : ""}`}
          >
            {CATEGORY_LABEL[c]} ({countByCategory.get(c)})
          </Link>
        ))}
      </div>

      {articles.length === 0 ? (
        <p style={{ color: "var(--muted)", marginTop: 24 }}>Καμία δημοσίευση σε αυτή την κατηγορία ακόμα.</p>
      ) : (
        <div className="index-grid" style={{ marginTop: 12 }}>
          {articles.map((a) => (
            <Link key={a.slug} href={`/arthra/${a.slug}`} className="index-card reveal">
              <span style={{ fontSize: 12.5, color: "var(--gold)", display: "block", marginBottom: 8 }}>
                {a.region?.name ?? CATEGORY_LABEL[a.category]}
              </span>
              <h3>{a.title}</h3>
              {a.excerpt && <p>{a.excerpt}</p>}
              <div className="badges">
                <span className="badge-pill">{CATEGORY_LABEL[a.category]}</span>
                {a.readMinutes && <span className="badge-pill">{a.readMinutes} λεπτά</span>}
                {a.isSponsored && <span className="badge-pill">Χορηγία</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
