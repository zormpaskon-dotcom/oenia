import Link from "next/link";
import { auth } from "@/lib/auth";
import NavLinks from "@/components/NavLinks";
import AuthNavLink from "@/components/AuthNavLink";
import SearchOverlay from "@/components/SearchOverlay";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import MobileMenu from "@/components/MobileMenu";

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default async function Header() {
  const session = await auth();
  const initials = session?.user ? initialsOf(session.user.name ?? session.user.email ?? "?") : null;

  return (
    <header className="site-header glass">
      <div className="wrap">
        <div className="header-brand">
          <Link href="/" className="logo">
            oenia
          </Link>
        </div>
        <nav>
          <NavLinks />
          <span className="header-auth">
            <AuthNavLink initials={initials} />
          </span>
          <span className="header-divider" aria-hidden="true" />
          <div className="header-icons">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          <SearchOverlay />
          <MobileMenu initials={initials} />
        </nav>
      </div>
    </header>
  );
}
