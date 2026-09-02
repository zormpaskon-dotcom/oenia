import type { Metadata } from "next";
import Link from "next/link";
import { CellarStatus, ContentStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COLOR_GRADIENT } from "@/lib/labels";
import { formatMonthAccusative } from "@/lib/greek-date";
import SettingsForm from "@/components/SettingsForm";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Το προφίλ μου | Oenia",
};

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const TABS = [
  { value: "cellar", label: "Το κελάρι μου" },
  { value: "reviews", label: "Οι αξιολογήσεις μου" },
  { value: "settings", label: "Ρυθμίσεις" },
] as const;

const CELLAR_FILTERS = [
  { value: "all", label: "Όλα" },
  { value: "tried", label: "Το δοκίμασα" },
  { value: "want", label: "Θέλω να δοκιμάσω" },
] as const;

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user) return null; // η middleware ήδη κάνει redirect πριν φτάσουμε εδώ

  const sp = await searchParams;
  const tab = typeof sp.tab === "string" && TABS.some((t) => t.value === sp.tab) ? sp.tab : "cellar";
  const cfilter =
    typeof sp.cfilter === "string" && CELLAR_FILTERS.some((f) => f.value === sp.cfilter) ? sp.cfilter : "all";

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  const [triedCount, reviewCount, triedRegionIds, totalRegions] = await Promise.all([
    prisma.cellarEntry.count({ where: { userId: user.id, status: CellarStatus.TRIED } }),
    prisma.review.count({ where: { userId: user.id } }),
    prisma.cellarEntry.findMany({
      where: { userId: user.id, status: CellarStatus.TRIED },
      select: { wine: { select: { regionId: true } } },
    }),
    prisma.region.count(),
  ]);
  const passportRegions = new Set(triedRegionIds.map((c) => c.wine.regionId)).size;

  return (
    <div className="wrap">
      <div className="profile-head">
        <div className="avatar-lg">{initialsOf(user.name)}</div>
        <div style={{ flex: 1 }}>
          <h1>{user.name}</h1>
          <span className="meta">
            Μέλος από {formatMonthAccusative(user.createdAt)}
            {user.city ? ` · ${user.city}` : ""}
          </span>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="danger-link" style={{ background: "none", border: "none", cursor: "pointer" }}>
            Αποσύνδεση
          </button>
        </form>
      </div>

      <div className="stat-row">
        <div className="stat-cell">
          <span className="num">{triedCount}</span>
          <span className="label">ετικέτες δοκιμασμένες</span>
        </div>
        <div className="stat-cell">
          <span className="num">{reviewCount}</span>
          <span className="label">αξιολογήσεις</span>
        </div>
        <Link href="/diavatirio" className="stat-cell">
          <span className="num">
            {passportRegions}/{totalRegions}
          </span>
          <span className="label">περιοχές στο διαβατήριο</span>
        </Link>
      </div>

      <div className="tab-nav">
        {TABS.map((t) => (
          <Link key={t.value} href={`/profil?tab=${t.value}`} className={tab === t.value ? "is-active" : ""}>
            {t.label}
          </Link>
        ))}
      </div>

      {tab === "cellar" && (
        <CellarPanel userId={user.id} cfilter={cfilter} />
      )}
      {tab === "reviews" && <ReviewsPanel userId={user.id} />}
      {tab === "settings" && (
        <div className="tab-panel">
          <SettingsForm
            name={user.name}
            email={user.email}
            city={user.city}
            newsletterOptIn={user.newsletterOptIn}
            isPublicProfile={user.isPublicProfile}
          />
        </div>
      )}
    </div>
  );
}

async function CellarPanel({ userId, cfilter }: { userId: string; cfilter: string }) {
  const entries = await prisma.cellarEntry.findMany({
    where: {
      userId,
      ...(cfilter === "tried" ? { status: CellarStatus.TRIED } : {}),
      ...(cfilter === "want" ? { status: CellarStatus.WANT_TO_TRY } : {}),
    },
    include: { wine: { include: { winery: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="tab-panel">
      <div className="cellar-filters">
        {CELLAR_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/profil?tab=cellar&cfilter=${f.value}`}
            className={cfilter === f.value ? "is-active" : ""}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {entries.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 14.5 }}>
          Δεν έχεις προσθέσει ακόμα ετικέτες εδώ. Περιήγηση στις{" "}
          <Link href="/krasia" className="link-underline" style={{ color: "var(--wine)" }}>
            ετικέτες
          </Link>
          .
        </p>
      ) : (
        <div className="cellar-grid">
          {entries.map((entry) => (
            <Link key={entry.id} href={`/krasia/${entry.wine.slug}`} className="cellar-card">
              <div className="cellar-photo" style={{ background: COLOR_GRADIENT[entry.wine.color] }} />
              <div>
                <h3>{entry.wine.name}</h3>
                <p className="winery">{entry.wine.winery.name}</p>
                <span className={`status-tag ${entry.status === CellarStatus.TRIED ? "tried" : "want"}`}>
                  {entry.status === CellarStatus.TRIED ? "Το δοκίμασα" : "Θέλω να δοκιμάσω"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

async function ReviewsPanel({ userId }: { userId: string }) {
  const reviews = await prisma.review.findMany({
    where: { userId, status: ContentStatus.PUBLISHED },
    include: { wine: { include: { winery: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="tab-panel">
      {reviews.length === 0 ? (
        <p style={{ color: "var(--muted)", fontSize: 14.5 }}>Δεν έχεις γράψει ακόμα καμία αξιολόγηση.</p>
      ) : (
        reviews.map((review) => (
          <Link key={review.id} href={`/krasia/${review.wine.slug}`} className="review-row" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="review-photo" style={{ background: COLOR_GRADIENT[review.wine.color] }} />
            <div>
              <h3>{review.wine.name}</h3>
              <div className="stars">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} className={`dot-sm${i < review.rating ? " filled" : ""}`} />
                ))}
              </div>
              {review.note && <p>{review.note}</p>}
              <span className="date">
                {new Intl.DateTimeFormat("el-GR", { month: "long", year: "numeric" }).format(review.createdAt)}
              </span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
