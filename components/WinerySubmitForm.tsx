"use client";

import { useActionState } from "react";
import { submitWineryAction, type WinerySubmitState } from "@/app/gia-oinopoieia/actions";

const initialState: WinerySubmitState = { error: null, success: false };

export default function WinerySubmitForm({ regions }: { regions: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(submitWineryAction, initialState);

  if (state.success) {
    return (
      <div className="tasting-notes" style={{ maxWidth: 520 }}>
        <h3>Λάβαμε την αίτησή σου</h3>
        <p>
          Θα ελέγξουμε τα στοιχεία και θα δημοσιεύσουμε το προφίλ σύντομα. Αν θες να προσθέσεις κι άλλο
          οινοποιείο, μπορείς να στείλεις νέα αίτηση οποιαδήποτε στιγμή.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ maxWidth: 520 }}>
      <div className={`field${state.error ? " has-error" : ""}`}>
        <label htmlFor="name">Όνομα οινοποιείου *</label>
        <input type="text" id="name" name="name" required />
      </div>

      <div className="field">
        <label htmlFor="regionId">Περιοχή *</label>
        <select id="regionId" name="regionId" required defaultValue="">
          <option value="" disabled>
            Διάλεξε περιοχή…
          </option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="foundedYear">Έτος ίδρυσης</label>
        <input type="number" id="foundedYear" name="foundedYear" min={1800} max={new Date().getFullYear()} />
      </div>

      <div className="field">
        <label htmlFor="description">Σύντομη περιγραφή</label>
        <textarea id="description" name="description" rows={4} />
      </div>

      <div className="field">
        <label htmlFor="websiteUrl">Ιστοσελίδα</label>
        <input type="url" id="websiteUrl" name="websiteUrl" placeholder="https://" />
      </div>

      <div className="field">
        <label htmlFor="email">Email επικοινωνίας</label>
        <input type="email" id="email" name="email" />
      </div>

      <div className="field">
        <label htmlFor="phone">Τηλέφωνο</label>
        <input type="tel" id="phone" name="phone" />
      </div>

      <div className="toggle-row" style={{ padding: "10px 0" }}>
        <span className="label-text">Δέχεστε επισκέπτες;</span>
        <label className="switch">
          <input type="checkbox" name="acceptsVisitors" />
          <span className="slider" />
        </label>
      </div>

      <div className="toggle-row" style={{ padding: "10px 0", borderBottom: "none" }}>
        <span className="label-text">Βιολογική καλλιέργεια;</span>
        <label className="switch">
          <input type="checkbox" name="isOrganic" />
          <span className="slider" />
        </label>
      </div>

      {state.error && (
        <span className="error-msg" style={{ display: "block", marginBottom: 16 }}>
          {state.error}
        </span>
      )}

      <button type="submit" className="submit-btn" disabled={pending} style={{ marginTop: 10 }}>
        {pending ? "Αποστολή…" : "Στείλε την αίτηση"}
      </button>
    </form>
  );
}
