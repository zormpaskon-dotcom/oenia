// Category A safe editorial fixes από το tastingNotes audit — μόνο 2 κρασιά,
// αντικατάσταση αγγλικού όρου με το ήδη καθιερωμένο ελληνικό αντίστοιχο
// (onion skin -> φλούδα κρεμμυδιού, aperitif -> απεριτίφ σε ελληνικό
// αλφάβητο). Καμία άλλη πληροφορία δεν αλλάζει. Επαληθεύει το ΑΚΡΙΒΕΣ
// τρέχον string πριν γράψει.

import { prisma } from "../lib/prisma";

const FIXES: { slug: string; from: string; to: string }[] = [
  {
    slug: "douloufakis-dafnios-rose",
    from: "Ελκυστικό ανοιχτό-ροζ χρώμα με onion skin αποχρώσεις. Αρώματα αποξηραμένου γιασεμιού, κόκκινων φρούτων και γλυκάνισου, με φρέσκο πετροκέρασο και εξαιρετική οξύτητα. Ελαφρώς θαλασσινές και πιπεράτες νότες.",
    to: "Ελκυστικό ανοιχτό-ροζ χρώμα με αποχρώσεις φλούδας κρεμμυδιού. Αρώματα αποξηραμένου γιασεμιού, κόκκινων φρούτων και γλυκάνισου, με φρέσκο πετροκέρασο και εξαιρετική οξύτητα. Ελαφρώς θαλασσινές και πιπεράτες νότες.",
  },
  {
    slug: "domaine-florian-casanova-barrique",
    from: "Το μπουκέτο αυτού του aperitif οίνου ανοίγει όμορφα αν σερβιριστεί σε θερμοκρασία δωματίου πάνω σε πάγο. Εκλεπτυσμένο άρωμα με ισορροπία γλυκύτητας και έντασης, αρωματικό και σαγηνευτικό προφίλ.",
    to: "Το μπουκέτο αυτού του απεριτίφ οίνου ανοίγει όμορφα αν σερβιριστεί σε θερμοκρασία δωματίου πάνω σε πάγο. Εκλεπτυσμένο άρωμα με ισορροπία γλυκύτητας και έντασης, αρωματικό και σαγηνευτικό προφίλ.",
  },
];

async function main() {
  for (const fix of FIXES) {
    const wine = await prisma.wine.findUnique({ where: { slug: fix.slug }, select: { id: true, tastingNotes: true } });
    if (!wine) throw new Error(`Wine not found: ${fix.slug}`);
    if (wine.tastingNotes !== fix.from) {
      throw new Error(`tastingNotes του "${fix.slug}" δεν ταιριάζει με το αναμενόμενο — abort χωρίς αλλαγές.\nΤρέχον: ${JSON.stringify(wine.tastingNotes)}`);
    }
    await prisma.wine.update({ where: { id: wine.id }, data: { tastingNotes: fix.to } });
    console.log(`✓ Wine "${fix.slug}" tastingNotes ενημερώθηκε.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
