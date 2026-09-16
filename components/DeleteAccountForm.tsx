"use client";

import { useActionState } from "react";
import { deleteAccountAction, type DeleteAccountState } from "@/app/profil/actions";

const initialState: DeleteAccountState = { error: null };

export default function DeleteAccountForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(deleteAccountAction, initialState);

  return (
    <div style={{ marginTop: 48, paddingTop: 28, borderTop: "1px solid var(--line)" }}>
      <h3 style={{ fontSize: 16, marginBottom: 8 }}>Διαγραφή λογαριασμού</h3>
      <p style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.7, marginBottom: 18, maxWidth: "52ch" }}>
        Θα διαγραφούν μόνιμα ο λογαριασμός σου, οι αξιολογήσεις σου και το κελάρι σου. Δεν μπορεί να
        αναιρεθεί. Για να επιβεβαιώσεις, πληκτρολόγησε το email του λογαριασμού σου ({email}).
      </p>
      <form action={formAction} style={{ maxWidth: 360 }}>
        <div className="field">
          <label htmlFor="confirmEmail">Email επιβεβαίωσης</label>
          <input type="email" id="confirmEmail" name="confirmEmail" required placeholder={email} />
        </div>
        {state.error && <p className="error-msg" style={{ marginBottom: 12 }}>{state.error}</p>}
        <button type="submit" className="reject-btn" disabled={pending}>
          {pending ? "Διαγραφή…" : "Διαγραφή λογαριασμού"}
        </button>
      </form>
    </div>
  );
}
