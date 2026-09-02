import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WinerySubmitForm from "@/components/WinerySubmitForm";

export const metadata: Metadata = {
  title: "Για οινοποιεία | Oenia",
  description: "Καταχώρησε το οινοποιείό σου στο Oenia — ελέγχεται πριν δημοσιευτεί.",
};

export default async function WinerySubmitPage() {
  const regions = await prisma.region.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <p className="kicker">Για παραγωγούς</p>
      <h1>Καταχώρησε το οινοποιείό σου</h1>
      <p className="result-count" style={{ maxWidth: "60ch" }}>
        Συμπλήρωσε τα βασικά στοιχεία. Κάθε νέα καταχώρηση ελέγχεται πριν δημοσιευτεί — δες πώς στη σελίδα{" "}
        «Πώς λειτουργούμε». Δεν χρειάζεται λογαριασμός για να στείλεις αίτηση.
      </p>

      <div style={{ marginTop: 32 }}>
        <WinerySubmitForm regions={regions} />
      </div>
    </div>
  );
}
