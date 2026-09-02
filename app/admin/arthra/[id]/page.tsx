import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ArticleForm from "@/components/ArticleForm";

export const metadata: Metadata = {
  title: "Άρθρο — Διαχείριση | Oenia",
};

export default async function AdminArticleEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (me?.role !== UserRole.ADMIN) redirect("/");

  const regions = await prisma.region.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  if (id === "new") {
    return (
      <div className="wrap page-head" style={{ paddingBottom: 80 }}>
        <p className="breadcrumb" style={{ padding: "0 0 20px" }}>
          <Link href="/admin/arthra">Άρθρα</Link> / Νέο
        </p>
        <h1>Νέο άρθρο</h1>
        <div style={{ marginTop: 28 }}>
          <ArticleForm regions={regions} />
        </div>
      </div>
    );
  }

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <p className="breadcrumb" style={{ padding: "0 0 20px" }}>
        <Link href="/admin/arthra">Άρθρα</Link> / {article.title}
      </p>
      <h1>Επεξεργασία άρθρου</h1>
      <div style={{ marginTop: 28 }}>
        <ArticleForm article={article} regions={regions} />
      </div>
    </div>
  );
}
