import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.update({
    where: { slug: "mikra-thira" },
    data: { foundedYear: 2017 },
  });
  console.log(`✓ ${winery.name} -> foundedYear: ${winery.foundedYear}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
