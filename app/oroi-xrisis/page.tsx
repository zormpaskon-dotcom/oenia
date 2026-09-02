import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Όροι χρήσης | Oenia",
};

export default function TermsOfUsePage() {
  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <p className="kicker">Νομικά</p>
      <h1>Όροι χρήσης</h1>
      <p className="desc" style={{ marginTop: 16, color: "var(--error)" }}>
        Προσωρινό κείμενο (placeholder) — δεν είναι νομικά έγκυρο. Πριν βγει το site live, αυτό το
        κείμενο πρέπει να γραφτεί ή να ελεγχθεί από δικηγόρο, μαζί με τα στοιχεία της επιχείρησης
        (επωνυμία, ΑΦΜ, έδρα) που λείπουν εντελώς προς το παρόν.
      </p>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Αποδοχή όρων</h2>
        <p className="desc">
          Χρησιμοποιώντας το Oenia αποδέχεσαι αυτούς τους όρους. Αν διαφωνείς με κάποιον, δεν πρέπει
          να χρησιμοποιήσεις το site.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Ο λογαριασμός σου</h2>
        <p className="desc">
          Πρέπει να είσαι άνω των 18 ετών για να δημιουργήσεις λογαριασμό. Είσαι υπεύθυνος/η για την
          ασφάλεια των διαπιστευτηρίων σου. Μπορείς να ζητήσεις διαγραφή του λογαριασμού σου
          οποιαδήποτε στιγμή.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Περιεχόμενο που δημοσιεύεις</h2>
        <p className="desc">
          Οι αξιολογήσεις και τα σχόλιά σου παραμένουν δικά σου, αλλά μας δίνεις άδεια να τα
          εμφανίζουμε στο site. Είσαι υπεύθυνος/η για την ακρίβεια όσων γράφεις. Δες την{" "}
          <Link href="/politiki-moderation" className="link-underline" style={{ color: "var(--wine)" }}>
            πολιτική moderation
          </Link>{" "}
          για το πώς ελέγχουμε αναφορές.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Καταχωρήσεις οινοποιείων</h2>
        <p className="desc">
          Κάθε καταχώρηση ελέγχεται πριν δημοσιευτεί, αλλά αυτό δεν αποτελεί εγγύηση ακρίβειας. Αν
          είσαι παραγωγός, είσαι υπεύθυνος/η για την ορθότητα των στοιχείων που υποβάλλεις.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Τι δεν είναι το Oenia</h2>
        <p className="desc">
          Το Oenia είναι ενημερωτικό site — δεν πουλάει κρασί, δεν μεσολαβεί σε αγοραπωλησίες, και δεν
          εγγυάται την πληρότητα ή ακρίβεια του περιεχομένου του.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Αλλαγές στους όρους</h2>
        <p className="desc">
          Μπορεί να ενημερώσουμε αυτούς τους όρους. Η συνέχιση χρήσης του site μετά από αλλαγή σημαίνει
          αποδοχή της.
        </p>
      </section>
    </div>
  );
}
