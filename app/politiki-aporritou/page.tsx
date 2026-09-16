import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Πολιτική απορρήτου | Oenia",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="wrap page-head" style={{ paddingBottom: 80 }}>
      <p className="kicker">Νομικά</p>
      <h1>Πολιτική απορρήτου</h1>
      <p className="desc" style={{ marginTop: 16, color: "var(--error)" }}>
        Προσωρινό κείμενο (placeholder) — δεν είναι νομικά έγκυρο. Πριν βγει το site live, αυτό το
        κείμενο πρέπει να γραφτεί ή να ελεγχθεί από κάποιον που ξέρει ελληνικό/ενωσιακό δίκαιο (GDPR).
      </p>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Ποια δεδομένα συλλέγουμε</h2>
        <p className="desc">
          Λογαριασμός (όνομα, email), περιεχόμενο που δημιουργείς (αξιολογήσεις, κελάρι), και
          αποθηκευτικός χώρος απαραίτητος για τη λειτουργία του site (σύνδεση λογαριασμού, προτίμηση
          θέματος/γλώσσας). Δεν χρησιμοποιούμε αυτή τη στιγμή cookies μέτρησης επισκεψιμότητας ή
          διαφήμισης.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Πώς τα χρησιμοποιούμε</h2>
        <p className="desc">
          Για τη λειτουργία του λογαριασμού σου και τη βελτίωση του site. Δεν πουλάμε δεδομένα χρηστών
          σε τρίτους.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Τα δικαιώματά σου</h2>
        <p className="desc">
          Πρόσβαση, διόρθωση και διαγραφή των δεδομένων σου. Μπορείς να διαγράψεις τον λογαριασμό σου
          από τις ρυθμίσεις του προφίλ σου — η διαγραφή είναι άμεση. Οι αξιολογήσεις που έχεις γράψει
          παραμένουν ορατές ως περιεχόμενο του site, αλλά αποσυνδέονται από τον λογαριασμό σου και
          εμφανίζονται ανώνυμα.
        </p>
      </section>

      <section style={{ paddingLeft: 0, paddingRight: 0 }}>
        <h2 className="section-title">Επικοινωνία</h2>
        <p className="desc">
          Για οτιδήποτε αφορά τα προσωπικά σου δεδομένα, γράψε στο{" "}
          <a href="mailto:info@worldofoenia.com">info@worldofoenia.com</a>.
        </p>
        <p className="desc" style={{ marginTop: 10, color: "var(--error)" }}>
          OWNER INPUT REQUIRED: εδώ πρέπει να προστεθούν τα πλήρη στοιχεία του υπευθύνου επεξεργασίας
          (επωνυμία/όνομα, έδρα, ΑΦΜ αν υπάρχει) — δεν υπάρχουν ακόμα, δεν έχουν επινοηθεί.
        </p>
      </section>
    </div>
  );
}
