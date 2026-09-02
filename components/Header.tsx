import Link from "next/link";
import { auth } from "@/lib/auth";

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
          <button className="nav-search" aria-label="Αναζήτηση">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}
