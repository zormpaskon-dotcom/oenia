// Δεύτερο enrichment pass για το T-Oinos — social media links που βρέθηκαν
// στο επίσημο site (toinos.com) και δεν υπήρχαν στο press kit.
//
// Σκόπιμα ΔΕΝ αποθηκεύονται τιμές/ωράρια επίσκεψης σε κανένα winery record
// (ρητή οδηγία χρήστη) — μόνο το boolean acceptsVisitors.

import { prisma } from "../lib/prisma";

async function main() {
  const winery = await prisma.winery.update({
    where: { slug: "t-oinos" },
    data: {
      socialLinks: {
        facebook: "https://www.facebook.com/toinoswinery/",
        instagram: "https://www.instagram.com/toinoswinery/",
        twitter: "https://twitter.com/t_oinos",
        youtube: "https://www.youtube.com/channel/UCEhwqMKQnKh8-17RbGO101Q",
        linkedin: "https://www.linkedin.com/company/t-oinos/",
      },
      acceptsVisitors: true,
    },
  });

  console.log("T-Oinos ενημερώθηκε με social links:");
  console.log(JSON.stringify({ socialLinks: winery.socialLinks, acceptsVisitors: winery.acceptsVisitors }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
