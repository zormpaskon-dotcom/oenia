import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Πολιτική moderation | Oenia",
};

export default function ModerationPolicyPage() {
  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <p className="kicker">Νομικά</p>
      <h1>Πολιτική moderation</h1>
      <p className="desc" style={{ marginTop: 16, color: "var(--error)" }}>
        Προσωρινό κείμενο (placeholder) — περιγράφει πώς λειτουργεί το σύστημα σήμερα, όχι νομικά
        δεσμευτική πολιτική. Χρειάζεται έλεγχο πριν το site βγει live.
      </p>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Αξιολογήσεις χρηστών</h2>
        <p className="desc">
          Κάθε μέλος μπορεί να αναφέρει μια αξιολόγηση που θεωρεί προβληματική — spam, εκτός θέματος,
          προσβλητική, ή προφανώς ψεύτικη. Οι σημειωμένες αξιολογήσεις εμφανίζονται σε admin ουρά
          ελέγχου πριν αφαιρεθούν.
        </p>
        <p className="desc" style={{ marginTop: 12 }}>
          <strong>Δεν αφαιρούμε</strong> αξιολογήσεις μόνο επειδή είναι αρνητικές. Μια ειλικρινής,
          κακή εμπειρία είναι έγκυρο περιεχόμενο.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Τι εξετάζουμε</h2>
        <p className="desc">
          Κατά την εξέταση μιας αναφοράς ελέγχουμε: αν το περιεχόμενο είναι spam ή διαφημιστικό, αν
          είναι προσβλητικό ή στοχεύει προσωπικά κάποιον, αν φαίνεται ψεύτικο (π.χ. χρήστης χωρίς
          σχέση με το κρασί), και αν παραβιάζει τους{" "}
          <Link href="/oroi-xrisis" className="link-underline" style={{ color: "var(--wine)" }}>
            όρους χρήσης
          </Link>
          .
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Καταχωρήσεις οινοποιείων</h2>
        <p className="desc">
          Κάθε νέα καταχώρηση ξεκινά ως αίτηση προς έλεγχο και δεν εμφανίζεται δημόσια μέχρι να
          εγκριθεί. Ελέγχουμε τα βασικά στοιχεία (περιοχή, στοιχεία επικοινωνίας) πριν τη δημοσίευση.
          Μια απόρριψη δεν είναι οριστική — ο παραγωγός μπορεί να στείλει νέα αίτηση με διορθωμένα
          στοιχεία.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Sponsored περιεχόμενο</h2>
        <p className="desc">
          Άρθρα με χορηγία σημαίνονται πάντα ρητά, πάνω στο ίδιο το άρθρο. Η σήμανση δεν αφαιρείται
          ποτέ και η χορηγία δεν επηρεάζει βαθμολογίες ή κατάταξη ετικετών.
        </p>
      </section>
    </div>
  );
}
