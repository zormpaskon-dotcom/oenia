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
    <div className={`cookie-banner${visible ? " is-visible" : ""}`} role="dialog" aria-label="Συγκατάθεση cookies">
      <p>
        Χρησιμοποιούμε βασικά cookies για τη λειτουργία του site και, αν συμφωνήσεις, cookies μέτρησης
        επισκεψιμότητας. <Link href="/politiki-aporritou">Πολιτική απορρήτου</Link>
      </p>
      <div className="cookie-actions">
        <button type="button" className="cookie-decline" onClick={() => choose("essential")}>
          Μόνο απαραίτητα
        </button>
        <button type="button" className="cookie-accept" onClick={() => choose("all")}>
          Αποδοχή όλων
        </button>
      </div>
    </div>
  );
}
