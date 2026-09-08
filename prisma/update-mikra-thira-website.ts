import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.update({
    where: { slug: "mikra-thira" },
    data: { websiteUrl: "https://mikrathira.com" },
  });
  console.log(`✓ ${winery.name} -> websiteUrl: ${winery.websiteUrl}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
