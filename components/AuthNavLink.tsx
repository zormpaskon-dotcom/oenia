"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function AuthNavLink({ initials }: { initials: string | null }) {
  const { t } = useLanguage();

  if (initials) {
    return (
      <Link href="/profil" aria-label={t("nav_profile")}>
        <span className="nav-avatar">{initials}</span>
      </Link>
    );
  }

  return (
    <Link href="/login" className="link-underline" style={{ fontSize: 15 }}>
      {t("nav_signin")}
    </Link>
  );
}
