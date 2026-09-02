"use client";

import { useActionState } from "react";
import { updateSettingsAction, type SettingsActionState } from "@/app/profil/actions";

const initialState: SettingsActionState = { error: null, success: false };

export default function SettingsForm({
  name,
  email,
  city,
  newsletterOptIn,
  isPublicProfile,
}: {
  name: string;
  email: string;
  city: string | null;
  newsletterOptIn: boolean;
  isPublicProfile: boolean;
}) {
  const [state, formAction, pending] = useActionState(updateSettingsAction, initialState);

  return (
    <form action={formAction} className="settings-form">
      <div className="field">
        <label htmlFor="settingsName">Όνομα</label>
        <input type="text" id="settingsName" name="name" defaultValue={name} required />
      </div>
      <div className="field">
        <label htmlFor="settingsEmail">Email</label>
        <input type="email" id="settingsEmail" value={email} disabled />
      </div>
      <div className="field">
        <label htmlFor="settingsCity">Πόλη</label>
        <input type="text" id="settingsCity" name="city" defaultValue={city ?? ""} />
      </div>
      <div className="field">
        <label htmlFor="settingsPassword">Νέος κωδικός</label>
        <input
          type="password"
          id="settingsPassword"
          name="password"
          placeholder="Άσε κενό αν δεν θες αλλαγή"
          minLength={8}
        />
      </div>

      <div className="toggle-row">
        <div>
          <div className="label-text">Ενημερωτικό email</div>
          <div className="hint">Νέα άρθρα και ετικέτες, μία φορά τον μήνα.</div>
        </div>
        <label className="switch">
          <input type="checkbox" name="newsletterOptIn" defaultChecked={newsletterOptIn} />
          <span className="slider" />
        </label>
      </div>
      <div className="toggle-row">
        <div>
          <div className="label-text">Δημόσιο προφίλ</div>
          <div className="hint">Άλλοι χρήστες βλέπουν τις αξιολογήσεις σου.</div>
        </div>
        <label className="switch">
          <input type="checkbox" name="isPublicProfile" defaultChecked={isPublicProfile} />
          <span className="slider" />
        </label>
      </div>

      {state.error && <p className="error-msg" style={{ marginTop: 16 }}>{state.error}</p>}
      {state.success && (
        <p style={{ color: "var(--olive)", fontSize: 13, marginTop: 16 }}>Οι αλλαγές αποθηκεύτηκαν.</p>
      )}

      <button type="submit" className="submit-btn" style={{ width: "auto", padding: "12px 26px", marginTop: 26 }} disabled={pending}>
        {pending ? "Αποθήκευση…" : "Αποθήκευση αλλαγών"}
      </button>
    </form>
  );
}
