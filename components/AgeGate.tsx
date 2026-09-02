"use client";

import { useEffect, useState } from "react";

export default function AgeGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("oenia_age_ok") !== "1") {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  function confirm() {
    sessionStorage.setItem("oenia_age_ok", "1");
    setVisible(false);
  }

  function decline() {
    window.location.href = "https://www.google.com";
  }

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-label="Επιβεβαίωση ηλικίας">
      <div className="age-gate-box">
        <div className="logo">oenia</div>
        <p>Το Oenia περιέχει περιεχόμενο σχετικό με οινοπνευματώδη. Επιβεβαίωσε ότι είσαι άνω των 18.</p>
        <div className="age-gate-actions">
          <button type="button" className="btn-primary" style={{ border: "none" }} onClick={confirm}>
            Είμαι άνω των 18
          </button>
          <button type="button" className="btn-ghost" onClick={decline}>
            Έξοδος
          </button>
        </div>
        <p className="age-gate-fine">Η επιλογή σου αποθηκεύεται σε αυτή τη συσκευή.</p>
      </div>
    </div>
  );
}
