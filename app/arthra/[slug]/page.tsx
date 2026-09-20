import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL } from "@/lib/labels";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";

function ArrowIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.73} viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 8h21M15 1l7 7-7 7" />
    </svg>
  );
}

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      region: { select: { name: true, slug: true } },
      author: { select: { name: true } },
      relatedWineries: { include: { winery: { select: { name: true, slug: true } } } },
      relatedWines: { include: { wine: { select: { name: true, slug: true } } } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  const title = `${article.title} | Oenia`;
  const description = article.excerpt ?? undefined;
  const url = `${SITE_URL}/arthra/${article.slug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      ...(article.coverImage ? { images: [{ url: article.coverImage }] } : {}),
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article || article.status !== ContentStatus.PUBLISHED) notFound();

  const paragraphs = article.body.split("\n\n").filter(Boolean);

  return (
    <div className="wrap">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.excerpt ?? undefined,
          datePublished: article.publishedAt?.toISOString(),
          dateModified: article.updatedAt.toISOString(),
          author: article.author
            ? { "@type": "Person", name: article.author.name }
            : { "@type": "Organization", name: "Oenia" },
        }}
      />
      <p className="breadcrumb">
        <Link href="/">Αρχική</Link> / <Link href="/arthra">Άρθρα</Link> / {article.title}
      </p>

      <div className="page-head" style={{ maxWidth: 720 }}>
        <p className="kicker">
          {CATEGORY_LABEL[article.category]}
          {article.region ? ` · ${article.region.name}` : ""}
          {article.readMinutes ? ` · ${article.readMinutes} λεπτά ανάγνωση` : ""}
        </p>
        <h1>{article.title}</h1>
        {article.isSponsored && (
          <p style={{ fontSize: 12.5, color: "var(--gold)", marginTop: 10 }}>
            Χορηγία{article.sponsorName ? ` — σε συνεργασία με ${article.sponsorName}` : ""}
          </p>
        )}
        {article.author && (
          <p style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 10 }}>Από {article.author.name}</p>
        )}
      </div>

      <div style={{ maxWidth: 680, paddingBottom: 60 }}>
        {article.coverImage && (
          <Image
            src={article.coverImage}
            alt=""
            width={1200}
            height={675}
            style={{ width: "100%", height: "auto", borderRadius: "var(--radius)", marginBottom: 32, display: "block" }}
            priority
          />
        )}
        {paragraphs.map((p, i) => (
          <p className="desc" key={i} style={{ marginBottom: 20, maxWidth: 680 }}>
            {p}
          </p>
        ))}

        {article.tags.length > 0 && (
          <div className="chip-row" style={{ marginTop: 32 }}>
            {article.tags.map((tag) => (
              <span className="chip-static" key={tag}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {(article.region || article.relatedWineries.length > 0 || article.relatedWines.length > 0) && (
          <div style={{ marginTop: 40 }}>
            <h2 className="section-title" style={{ fontSize: 15 }}>
              Συνέχισε την εξερεύνηση
            </h2>
            <div className="winery-grape-list">
              {article.region && (
                <Link href={`/perioches/${article.region.slug}`} className="winery-grape-row">
                  Εξερεύνησε την περιοχή {article.region.name}
                  <ArrowIcon size={16} />
                </Link>
              )}
              {article.relatedWineries.map(({ winery }) => (
                <Link key={winery.slug} href={`/oinopoieia/${winery.slug}`} className="winery-grape-row">
                  Γνώρισε το {winery.name}
                  <ArrowIcon size={16} />
                </Link>
              ))}
              {article.relatedWines.map(({ wine }) => (
                <Link key={wine.slug} href={`/krasia/${wine.slug}`} className="winery-grape-row">
                  Εξερεύνησε το {wine.name}
                  <ArrowIcon size={16} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
