"use client";

import { useActionState, useState } from "react";
import { loginAction, signupAction, type AuthActionState } from "@/app/login/actions";

const initialState: AuthActionState = { error: null };

export default function AuthCard() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [loginState, loginFormAction, loginPending] = useActionState(loginAction, initialState);
  const [signupState, signupFormAction, signupPending] = useActionState(signupAction, initialState);

  return (
    <div className="auth-shell">
      <span className="liquid-blob blob-1" aria-hidden="true" />
      <span className="liquid-blob blob-2" aria-hidden="true" />

      <div className="auth-card">
        <p className="kicker">Καλώς ήρθες</p>
        <h1>Στο Oenia</h1>

        <div className="tab-row">
          <button
            type="button"
            className={`tab-btn${tab === "login" ? " is-active" : ""}`}
            onClick={() => setTab("login")}
          >
            Σύνδεση
          </button>
          <button
            type="button"
            className={`tab-btn${tab === "signup" ? " is-active" : ""}`}
            onClick={() => setTab("signup")}
          >
            Εγγραφή
          </button>
        </div>

        {tab === "login" ? (
          <form className="auth-form is-active" action={loginFormAction}>
            <div className={`field${loginState.error ? " has-error" : ""}`}>
              <label htmlFor="loginEmail">Email</label>
              <input type="email" id="loginEmail" name="email" required />
            </div>
            <div className={`field${loginState.error ? " has-error" : ""}`}>
              <label htmlFor="loginPassword">Κωδικός</label>
              <input type="password" id="loginPassword" name="password" required />
              {loginState.error && <span className="error-msg" style={{ display: "block" }}>{loginState.error}</span>}
            </div>
            <button type="submit" className="submit-btn" disabled={loginPending}>
              {loginPending ? "Σύνδεση…" : "Σύνδεση"}
            </button>
          </form>
        ) : (
          <form className="auth-form is-active" action={signupFormAction}>
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            />
            <div className="field">
              <label htmlFor="signupName">Όνομα</label>
              <input type="text" id="signupName" name="name" required />
            </div>
            <div className="field">
              <label htmlFor="signupEmail">Email</label>
              <input type="email" id="signupEmail" name="email" required />
            </div>
            <div className={`field${signupState.error ? " has-error" : ""}`}>
              <label htmlFor="signupPassword">Κωδικός</label>
              <input type="password" id="signupPassword" name="password" required minLength={8} />
              {signupState.error && (
                <span className="error-msg" style={{ display: "block" }}>{signupState.error}</span>
              )}
            </div>
            <button type="submit" className="submit-btn" disabled={signupPending}>
              {signupPending ? "Δημιουργία…" : "Δημιουργία λογαριασμού"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
