"use client";

import Link from "next/link";
import ExploreMenu from "@/components/ExploreMenu";
import { useLanguage } from "@/components/LanguageProvider";

const navLinks = [
  { href: "/krasia", key: "nav_wines" },
  { href: "/oinopoieia", key: "nav_wineries" },
  { href: "/poikilies", key: "nav_varieties" },
  { href: "/arthra", key: "nav_articles" },
] as const;

export default function NavLinks() {
  const { t } = useLanguage();

  return (
    <div className="nav-links" style={{ display: "flex", gap: 34 }}>
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href} className="link-underline">
          {t(link.key)}
        </Link>
      ))}
      <ExploreMenu />
    </div>
  );
}
