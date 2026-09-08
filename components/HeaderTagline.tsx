"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function HeaderTagline() {
  const { t } = useLanguage();
  return <span className="header-tagline">{t("header_tagline")}</span>;
}
