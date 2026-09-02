import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ContentStatus, UserRole } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MACRO_REGION_LABEL } from "@/lib/labels";
import { approveWineryAction, deleteReviewAction, rejectWineryAction, unflagReviewAction } from "./actions";

export const metadata: Metadata = {
  title: "Διαχείριση | Oenia",
};

const TABS = [
  { value: "wineries", label: "Οινοποιεία" },
  { value: "reviews", label: "Αξιολογήσεις" },
] as const;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (me?.role !== UserRole.ADMIN) redirect("/");

  const sp = await searchParams;
  const tab = typeof sp.tab === "string" && TABS.some((t) => t.value === sp.tab) ? sp.tab : "wineries";

  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <p className="kicker">Διαχείριση</p>
      <h1>Πίνακας ελέγχου</h1>

      <div className="tab-nav" style={{ marginTop: 28 }}>
        {TABS.map((t) => (
          <Link key={t.value} href={`/admin?tab=${t.value}`} className={tab === t.value ? "is-active" : ""}>
            {t.label}
          </Link>
        ))}
        <Link href="/admin/arthra">Άρθρα</Link>
      </div>

      {tab === "wineries" ? <WineriesTab /> : <ReviewsTab />}
    </div>
  );
}

async function WineriesTab() {
  const [pending, recent] = await Promise.all([
    prisma.winery.findMany({
      where: { status: ContentStatus.PENDING },
      include: { region: { select: { name: true, macroRegion: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.winery.findMany({
      where: { status: { in: [ContentStatus.PUBLISHED, ContentStatus.REJECTED] } },
      include: { region: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="tab-panel">
      <p className="result-count" style={{ marginBottom: 24 }}>
        {pending.length} προς έλεγχο
      </p>

      {pending.length === 0 ? (
        <p className="admin-empty">Δεν υπάρχουν εκκρεμείς καταχωρήσεις αυτή τη στιγμή.</p>
      ) : (
        pending.map((w) => (
          <div className="admin-review-card" key={w.id}>
            <div className="admin-review-head">
              <div>
                <h3 style={{ fontSize: 18 }}>{w.name}</h3>
                <p className="admin-review-meta">
                  {w.region.name} · {MACRO_REGION_LABEL[w.region.macroRegion] ?? w.region.macroRegion}
                  {w.foundedYear ? ` · Από το ${w.foundedYear}` : ""}
                  {w.isOrganic ? " · Βιολογικό" : ""}
                  {w.acceptsVisitors ? " · Δέχεται επισκέπτες" : ""}
                </p>
              </div>
              <span className="badge-pill">
                Στάλθηκε {new Intl.DateTimeFormat("el-GR", { day: "numeric", month: "short" }).format(w.createdAt)}
              </span>
            </div>

            {w.description && <p className="admin-review-desc">{w.description}</p>}

            <p className="admin-review-meta">
              {w.email ? `Email: ${w.email}` : ""}
              {w.phone ? `  ·  Τηλ: ${w.phone}` : ""}
              {w.websiteUrl ? `  ·  ${w.websiteUrl}` : ""}
              {!w.email && !w.phone && !w.websiteUrl ? "Χωρίς στοιχεία επικοινωνίας" : ""}
            </p>

            <div className="admin-review-actions">
              <form action={approveWineryAction}>
                <input type="hidden" name="id" value={w.id} />
                <button type="submit" className="approve-btn">
                  Έγκριση
                </button>
              </form>
              <form action={rejectWineryAction}>
                <input type="hidden" name="id" value={w.id} />
                <button type="submit" className="reject-btn">
                  Απόρριψη
                </button>
              </form>
            </div>
          </div>
        ))
      )}

      {recent.length > 0 && (
        <div style={{ marginTop: 56 }}>
          <h2 className="section-title">Πρόσφατα ελεγμένα</h2>
          {recent.map((w) => (
            <div className="admin-history-row" key={w.id}>
              <span>
                {w.name} · {w.region.name}
              </span>
              <span className={`status-pill ${w.status === ContentStatus.PUBLISHED ? "published" : "rejected"}`}>
                {w.status === ContentStatus.PUBLISHED ? "Δημοσιεύτηκε" : "Απορρίφθηκε"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

async function ReviewsTab() {
  const flagged = await prisma.review.findMany({
    where: { isFlagged: true },
    include: {
      user: { select: { name: true } },
      wine: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="tab-panel">
      <p className="result-count" style={{ marginBottom: 24 }}>
        {flagged.length} σημειωμένες
      </p>

      {flagged.length === 0 ? (
        <p className="admin-empty">Καμία σημειωμένη αξιολόγηση αυτή τη στιγμή.</p>
      ) : (
        flagged.map((r) => (
          <div className="admin-review-card" key={r.id}>
            <div className="admin-review-head">
              <div>
                <h3 style={{ fontSize: 16 }}>
                  <Link href={`/krasia/${r.wine.slug}`} className="link-underline" style={{ color: "var(--wine)" }}>
                    {r.wine.name}
                  </Link>
                </h3>
                <p className="admin-review-meta">
                  {r.user.name} · {r.rating}/5 ·{" "}
                  {new Intl.DateTimeFormat("el-GR", { day: "numeric", month: "short", year: "numeric" }).format(
                    r.createdAt
                  )}
                </p>
              </div>
            </div>

            {r.note && <p className="admin-review-desc">{r.note}</p>}

            <div className="admin-review-actions">
              <form action={unflagReviewAction}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="approve-btn">
                  Απεσήμανση
                </button>
              </form>
              <form action={deleteReviewAction}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="reject-btn">
                  Διαγραφή
                </button>
              </form>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
