import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCategory, ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Άρθρα | Oenia",
  description: "Άρθρα για ελληνικές ποικιλίες, περιοχές, παραγωγούς και οδηγούς κρασιού.",
};

const CATEGORY_ORDER = Object.values(ArticleCategory);

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
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
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
                {a.isSponsored && <span className="badge-pill">Sponsored</span>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
