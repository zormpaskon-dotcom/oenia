import type { Metadata } from "next";
import Link from "next/link";
import { CellarStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MACRO_REGION_LABEL } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Το διαβατήριό μου | Oenia",
  description: "Οι ελληνικές περιοχές κρασιού που έχεις ήδη εξερευνήσει.",
};

export default async function PassportPage() {
  const session = await auth();
  if (!session?.user) return null; // η middleware ήδη κάνει redirect πριν φτάσουμε εδώ

  const [regions, triedRegionRows] = await Promise.all([
    prisma.region.findMany({
      include: { varieties: { include: { variety: { select: { name: true } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.cellarEntry.findMany({
      where: { userId: session.user.id, status: CellarStatus.TRIED },
      select: { wine: { select: { regionId: true } } },
    }),
  ]);

  const unlockedIds = new Set(triedRegionRows.map((r) => r.wine.regionId));
  const unlockedCount = unlockedIds.size;
  const percent = regions.length ? Math.round((unlockedCount / regions.length) * 100) : 0;

  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <p className="kicker">Το ταξίδι σου</p>
      <h1>Το διαβατήριό σου</h1>
      <p className="result-count">
        {unlockedCount}/{regions.length} περιοχές — δοκίμασε ένα κρασί από μια περιοχή και σημείωσέ το
        «Το δοκίμασα» στο{" "}
        <Link href="/krasia" className="link-underline" style={{ color: "var(--wine)" }}>
          κελάρι σου
        </Link>{" "}
        για να ξεκλειδώσεις τη σφραγίδα της.
      </p>

      <div className="passport-progress" style={{ marginTop: 20 }}>
        <div className="passport-progress-bar">
          <span style={{ width: `${percent}%` }} />
        </div>
        <span className="passport-progress-label">{percent}%</span>
      </div>

      <div className="passport-grid">
        {regions.map((r) => {
          const unlocked = unlockedIds.has(r.id);
          const mainVariety = r.varieties[0]?.variety.name;
          return (
            <div className={`passport-stamp${unlocked ? "" : " is-locked"}`} key={r.id}>
              {unlocked ? (
                <Link href={`/perioches/${r.slug}`} className="passport-stamp-inner">
                  <span className="passport-stamp-region">{r.name}</span>
                  <span className="passport-stamp-meta">
                    {MACRO_REGION_LABEL[r.macroRegion] ?? r.macroRegion}
                  </span>
                  {mainVariety && <span className="passport-stamp-variety">{mainVariety}</span>}
                </Link>
              ) : (
                <div className="passport-stamp-inner">
                  <span className="passport-lock">🔒</span>
                  <span className="passport-stamp-region">{r.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
