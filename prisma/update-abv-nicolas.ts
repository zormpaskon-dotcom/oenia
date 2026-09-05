import { prisma } from "../lib/prisma";

const ABV: Record<string, number> = {
  "noblis": 13.5,
  "deucalion": 13,
  "moi-je-men-fous-erythro": 13,
  "moi-je-men-fous-roze": 13,
  "moi-je-men-fous-leyko": 13,
  "paradise-can-wait": 14,
  "messenicola": 14,
  "messenicola-syllekton": 13.5,
  "snob": 12.5,
  "snob-white": 11.5,
  "hit-the-road-white": 13,
  "hit-the-road-red": 13,
  "i-kyra-tis-limnis": 12,
  "apo-dyo-xoria": 13,
};

async function main() {
  let updated = 0;
  for (const [slug, abv] of Object.entries(ABV)) {
    await prisma.wine.update({ where: { slug }, data: { abv } });
    updated++;
  }
  console.log(`Done: ${updated} ενημερώθηκαν.`);
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
