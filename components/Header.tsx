import Link from "next/link";
import { auth } from "@/lib/auth";
import ExploreMenu from "@/components/ExploreMenu";
import SearchOverlay from "@/components/SearchOverlay";

const navLinks = [
  { href: "/krasia", label: "Ετικέτες" },
  { href: "/oinopoieia", label: "Οινοποιεία" },
  { href: "/poikilies", label: "Ποικιλίες" },
  { href: "/arthra", label: "Άρθρα" },
];

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

  return (
    <header className="site-header glass">
      <div className="wrap">
        <Link href="/" className="logo">
          oenia
        </Link>
        <nav>
          <div className="nav-links" style={{ display: "flex", gap: 34 }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="link-underline">
                {link.label}
              </Link>
            ))}
            <ExploreMenu />
          </div>
          {session?.user ? (
            <Link href="/profil" aria-label="Το προφίλ μου">
              <span className="nav-avatar">{initialsOf(session.user.name ?? session.user.email ?? "?")}</span>
            </Link>
          ) : (
            <Link href="/login" className="link-underline" style={{ fontSize: 15 }}>
              Σύνδεση
            </Link>
          )}
          <SearchOverlay />
        </nav>
      </div>
    </header>
  );
}
