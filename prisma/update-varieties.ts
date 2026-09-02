// Εμπλουτίζει τις ποικιλίες με πραγματικά στοιχεία από αρχείο του χρήστη
// (prisma/data/varieties-source.json). Ταιριάζει με βάση το όνομα (όχι το
// slug του αρχείου, που χρησιμοποιεί διαφορετικό transliteration scheme από
// το lib/slugify.ts) — δημιουργεί νέα ποικιλία μόνο αν δεν υπάρχει ήδη.
//
// Πεδία που ΔΕΝ γεμίζει επειδή το αρχείο δεν τα περιέχει, και δεν θέλουμε να
// τα επινοήσουμε: pronunciation, audioUrl, similarTo, comparisonNote,
// aromaIntensity, ageingPotential. Αυτά μένουν ως είχαν (ή null σε νέες
// ποικιλίες) μέχρι να υπάρξει τεκμηριωμένη πηγή.

import { PrismaClient, VarietyType } from "@prisma/client";
import { slugify } from "../lib/slugify";
import rows from "./data/varieties-source.json";

const prisma = new PrismaClient();

type SheetRow = {
  name: string;
  color: "Λευκή" | "Ερυθρή";
  slug: string;
  aliases: string;
  region: string;
  origin: string;
  note: string;
  profile: string;
  pairing: string;
  aroma: string;
  description: string;
  acidity: number;
  body: number;
  tannins: number;
  alcohol: number;
};

const TYPE_MAP: Record<string, VarietyType> = {
  Λευκή: VarietyType.WHITE,
  Ερυθρή: VarietyType.RED,
};

// 1–5 στο αρχείο → 0–100, ίδια κλίμακα με τις ήδη υπάρχουσες ποικιλίες.
const toScale100 = (n: number) => n * 20;

async function main() {
  const existing = await prisma.variety.findMany({ select: { id: true, name: true } });
  const idByName = new Map(existing.map((v) => [v.name, v.id]));

  let updated = 0;
  let created = 0;

  for (const row of rows as SheetRow[]) {
    const nameLatin = row.aliases.split(";")[0]?.trim() || null;
    const description = [row.note, row.description].filter(Boolean).join(" ").trim() || null;
    const characteristics =
      [
        row.profile,
        `Καλλιεργείται ${row.region}.`,
        row.aroma ? `Αρώματα: ${row.aroma}` : null,
        row.pairing ? `Ταιριάζει με: ${row.pairing}` : null,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() || null;

    const fields = {
      nameLatin,
      type: TYPE_MAP[row.color],
      originRegion: row.origin || null,
      description,
      characteristics,
      acidity: toScale100(row.acidity),
      body: toScale100(row.body),
      tannins: toScale100(row.tannins),
    };

    const existingId = idByName.get(row.name);
    if (existingId) {
      await prisma.variety.update({ where: { id: existingId }, data: fields });
      updated += 1;
    } else {
      await prisma.variety.create({
        data: { name: row.name, slug: slugify(row.name), ...fields },
      });
      created += 1;
    }
  }

  console.log(`Ενημερώθηκαν ${updated} ποικιλίες, δημιουργήθηκαν ${created} νέες.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
