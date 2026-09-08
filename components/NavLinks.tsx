"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";

const navLinks = [
  { href: "/krasia", key: "nav_wines" },
  { href: "/oinopoieia", key: "nav_wineries" },
  { href: "/perioches", key: "nav_regions" },
  { href: "/poikilies", key: "nav_varieties" },
  { href: "/arthra", key: "nav_articles" },
] as const satisfies ReadonlyArray<{ href: string; key: TranslationKey }>;

export default function NavLinks() {
  const { t } = useLanguage();

  return (
    <div className="nav-links">
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href} className="link-underline">
          {t(link.key)}
        </Link>
      ))}
    </div>
  );
}
