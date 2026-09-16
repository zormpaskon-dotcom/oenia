"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("oenia_cookie_choice")) return;
    const timer = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(timer);
  }, []);

  function choose(value: string) {
    localStorage.setItem("oenia_cookie_choice", value);
    setVisible(false);
  }

  return (
    // LEGAL TEXT TO BE FINALIZED — το κείμενο περιγράφει την πραγματική
    // κατάσταση σήμερα (μόνο απαραίτητη/λειτουργική αποθήκευση, καμία
    // analytics/tracking), όχι τελική νομική διατύπωση.
    <div className={`cookie-banner${visible ? " is-visible" : ""}`} role="dialog" aria-label="Ενημέρωση για cookies">
      <p>
        Το Oenia χρησιμοποιεί μόνο cookies/αποθηκευτικό χώρο απαραίτητο για τη λειτουργία του site
        (σύνδεση λογαριασμού, προτίμηση θέματος/γλώσσας) — καμία χρήση για analytics ή διαφήμιση.{" "}
        <Link href="/politiki-aporritou">Πολιτική απορρήτου</Link>
      </p>
      <div className="cookie-actions">
        <button type="button" className="cookie-accept" onClick={() => choose("acknowledged")}>
          Το κατάλαβα
        </button>
      </div>
    </div>
  );
}
