import type { Metadata } from "next";
import Link from "next/link";
import { VarietyType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Ποικιλίες | Oenia",
  description: "Ελληνικές και διεθνείς ποικιλίες κρασιού που καλλιεργούνται στην Ελλάδα, λευκές και κόκκινες.",
};

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3c5 3 7 8 4 13-2 3-6 4-8 2-2-3 0-8 4-11z" />
      <path d="M12 3v16" />
    </svg>
  );
}

export default async function VarietiesPage() {
  const varieties = await prisma.variety.findMany({
    orderBy: { name: "asc" },
  });

  const whites = varieties.filter((v) => v.type === VarietyType.WHITE);
  const reds = varieties.filter((v) => v.type === VarietyType.RED);

  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <p className="kicker">Εξερεύνηση</p>
      <h1>Ποικιλίες</h1>
      <p className="result-count">{varieties.length} ποικιλίες</p>

      <VarietyGroup title="Λευκές" items={whites} />
      <VarietyGroup title="Κόκκινες" items={reds} />
    </div>
  );
}

function VarietyGroup({
  title,
  items,
}: {
  title: string;
  items: Awaited<ReturnType<typeof prisma.variety.findMany>>;
}) {
  if (items.length === 0) return null;
  return (
    <section style={{ padding: "40px 0 0" }}>
      <h2 className="section-title">{title}</h2>
      <div className="variety-list">
        {items.map((v) => (
          <Link key={v.id} href={`/poikilies/${v.slug}`} className="variety-item">
            <span className="leaf-badge" style={{ marginBottom: 0 }}>
              <LeafIcon />
            </span>
            <span>
              <span className="v-name" style={{ display: "block" }}>
                {v.name}
              </span>
              <span className="v-region">{v.originRegion ?? "Ελλάδα"}</span>
            </span>
            <p className="v-detail">{v.description ?? ""}</p>
            <span className="v-color">{v.type === VarietyType.WHITE ? "Λευκή" : "Κόκκινη"}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
