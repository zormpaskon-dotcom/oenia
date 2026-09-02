import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ContentStatus, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABEL } from "@/lib/labels";
import { deleteArticleAction } from "./actions";

export const metadata: Metadata = {
  title: "Άρθρα — Διαχείριση | Oenia",
};

export default async function AdminArticlesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (me?.role !== UserRole.ADMIN) redirect("/");

  const articles = await prisma.article.findMany({
    include: { region: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <p className="kicker">Διαχείριση</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <h1>Άρθρα</h1>
        <Link href="/admin/arthra/new" className="btn-primary">
          Νέο άρθρο
        </Link>
      </div>
      <p className="result-count">{articles.length} άρθρα συνολικά</p>

      <div style={{ marginTop: 32 }}>
        {articles.length === 0 ? (
          <p className="admin-empty">Δεν υπάρχουν άρθρα ακόμα.</p>
        ) : (
          articles.map((a) => (
            <div className="admin-history-row" key={a.id} style={{ alignItems: "center" }}>
              <span>
                {a.title}
                <span style={{ color: "var(--muted)" }}>
                  {" "}
                  · {CATEGORY_LABEL[a.category]}
                  {a.region ? ` · ${a.region.name}` : ""}
                </span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className={`status-pill ${a.status === ContentStatus.PUBLISHED ? "published" : "rejected"}`}>
                  {a.status === ContentStatus.PUBLISHED ? "Δημοσιευμένο" : "Πρόχειρο"}
                </span>
                <Link href={`/admin/arthra/${a.id}`} className="link-underline" style={{ fontSize: 13.5, color: "var(--wine)" }}>
                  Επεξεργασία
                </Link>
                <form action={deleteArticleAction}>
                  <input type="hidden" name="id" value={a.id} />
                  <button type="submit" className="reject-btn" style={{ padding: "5px 12px", fontSize: 12.5 }}>
                    Διαγραφή
                  </button>
                </form>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
