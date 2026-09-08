import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import VarietiesExplorer from "@/components/VarietiesExplorer";

export const metadata: Metadata = {
  title: "Ποικιλίες | Oenia",
  description: "Ελληνικές και διεθνείς ποικιλίες κρασιού που καλλιεργούνται στην Ελλάδα, λευκές και κόκκινες.",
};

export default async function VarietiesPage() {
  const varieties = await prisma.variety.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <p className="kicker">Εξερεύνηση</p>
      <h1>Ποικιλίες</h1>

      <VarietiesExplorer varieties={varieties} />
    </div>
  );
}
