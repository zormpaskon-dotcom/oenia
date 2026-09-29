import Link from "next/link";
import { auth } from "@/lib/auth";
import NavMenu from "@/components/NavMenu";

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Navigation refinement — ενιαίο, πολύ λιτό sticky top bar (λογότυπο + MENU
// trigger) σε ΟΛΑ τα πλάτη, όχι πια μόνιμη αριστερή rail στο desktop. Το
// navigation ανοίγει ως off-canvas panel (NavMenu) — μία συμπεριφορά
// παντού, καμία μόνιμη στήλη δεν καταναλώνει πλάτος περιεχομένου.
export default async function Header() {
  const session = await auth();
  const initials = session?.user ? initialsOf(session.user.name ?? session.user.email ?? "?") : null;

  return (
    <header className="site-topbar glass">
      <div className="wrap">
        <Link href="/" className="logo">
          oenia
        </Link>
        <NavMenu initials={initials} />
      </div>
    </header>
  );
}
