import type { Metadata } from "next";
import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Πώς λειτουργούμε | Oenia",
  description: "Διαφάνεια: πώς επαληθεύουμε στοιχεία, πώς βγάζουμε έσοδα και τι δεν κάνουμε.",
};

export default async function AboutPage() {
  const [wineCount, wineryCount, regionCount, varietyCount] = await Promise.all([
    prisma.wine.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.winery.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.region.count(),
    prisma.variety.count(),
  ]);

  return (
    <div className="wrap page-head" style={{ paddingBottom: 20 }}>
      <p className="kicker">Διαφάνεια</p>
      <h1>Πώς λειτουργούμε</h1>
      <p className="desc" style={{ marginTop: 16 }}>
        Το Oenia είναι ένα ενημερωτικό site για το ελληνικό κρασί — ετικέτες, οινοποιεία, ποικιλίες,
        άρθρα. Δεν πουλάμε κρασί: καμία λειτουργία καλαθιού, πληρωμής ή παραγγελίας. Η αξιοπιστία των
        στοιχείων είναι το βασικό μας πούλημα, γι&apos; αυτό εξηγούμε ανοιχτά πώς δουλεύουμε.
      </p>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Πώς επαληθεύουμε τα στοιχεία</h2>
        <p className="desc">
          Κάθε νέο οινοποιείο ή ετικέτα ξεκινά ως υποβολή προς έλεγχο, όχι ως δημοσιευμένο περιεχόμενο.
          Ελέγχουμε τα βασικά στοιχεία (περιοχή, έτος ίδρυσης, ποικιλίες) πριν δημοσιευτούν. Ένα
          οινοποιείο που έχει διεκδικήσει και επιβεβαιώσει το δικό του προφίλ παίρνει σήμανση
          «Επαληθευμένο» — το βλέπεις στη σελίδα του οινοποιείου και στη λίστα{" "}
          <Link href="/oinopoieia" className="link-underline" style={{ color: "var(--wine)" }}>
            οινοποιείων
          </Link>
          .
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Πώς βγάζουμε έσοδα</h2>
        <p className="desc">
          Τρεις πηγές, καμία από πώληση κρασιού: επαληθευμένα προφίλ οινοποιείων, sponsored άρθρα με
          σαφή σήμανση χορηγίας πάνω στο ίδιο το άρθρο, και affiliate links προς τρίτους. Η σήμανση
          χορηγίας δεν αφαιρείται ποτέ και δεν επηρεάζει τη βαθμολογία ή την κατάταξη ετικετών.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Αξιολογήσεις χρηστών</h2>
        <p className="desc">
          Οι αξιολογήσεις γράφονται από μέλη του Oenia, μία ανά χρήστη ανά ετικέτα. Reviews που
          σημαίνονται ως προβληματικά ελέγχονται πριν αφαιρεθούν — δεν σβήνουμε αρνητικές αξιολογήσεις
          επειδή είναι αρνητικές.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Τι δεν κάνουμε</h2>
        <p className="desc">
          Δεν πουλάμε κρασί, δεν έχουμε καλάθι ή πληρωμή, και δεν δεχόμαστε πληρωμή για καλύτερη
          βαθμολογία ή θέση σε λίστα. Sponsored περιεχόμενο σημαίνεται πάντα ρητά.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Στοιχεία μέχρι στιγμής</h2>
        <div className="fact-grid" style={{ maxWidth: 640 }}>
          <div className="fact">
            <span className="label">Ετικέτες</span>
            <span className="value">{wineCount}</span>
          </div>
          <div className="fact">
            <span className="label">Οινοποιεία</span>
            <span className="value">{wineryCount}</span>
          </div>
          <div className="fact">
            <span className="label">Περιοχές</span>
            <span className="value">{regionCount}</span>
          </div>
          <div className="fact">
            <span className="label">Ποικιλίες</span>
            <span className="value">{varietyCount}</span>
          </div>
        </div>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 60 }}>
        <h2 className="section-title">Έχεις οινοποιείο;</h2>
        <p className="desc">
          Αν είσαι παραγωγός και θες να διεκδικήσεις ή να καταχωρήσεις το προφίλ του οινοποιείου σου,
          ξεκίνα από τη{" "}
          <Link href="/gia-oinopoieia" className="link-underline" style={{ color: "var(--wine)" }}>
            φόρμα καταχώρησης
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
