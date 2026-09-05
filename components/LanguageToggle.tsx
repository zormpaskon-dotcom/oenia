"use client";

import { useLanguage } from "./LanguageProvider";

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={() => setLocale(locale === "el" ? "en" : "el")}
      aria-label={locale === "el" ? "Switch to English" : "Αλλαγή σε Ελληνικά"}
    >
      <span className={locale === "el" ? "is-active" : ""}>ΕΛ</span>
      <span className="lang-toggle-sep">/</span>
      <span className={locale === "en" ? "is-active" : ""}>EN</span>
    </button>
  );
}
