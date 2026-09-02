import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL } from "@/lib/labels";
import JsonLd from "@/components/JsonLd";

async function getArticle(slug: string) {
  return prisma.article.findUnique({
    where: { slug },
    include: {
      region: { select: { name: true, slug: true } },
      author: { select: { name: true } },
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
  return {
    title: `${article.title} | Oenia`,
    description: article.excerpt ?? undefined,
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
            Sponsored{article.sponsorName ? ` — σε συνεργασία με ${article.sponsorName}` : ""}
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
          <p className="desc" key={i} style={{ marginBottom: 20 }}>
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

        {article.region && (
          <p style={{ marginTop: 32, fontSize: 14, color: "var(--muted)" }}>
            Διάβασε περισσότερα για την{" "}
            <Link href={`/perioches/${article.region.slug}`} className="link-underline" style={{ color: "var(--wine)" }}>
              {article.region.name}
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
