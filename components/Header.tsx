import Link from "next/link";
import { auth } from "@/lib/auth";
import SearchOverlay from "@/components/SearchOverlay";
import MobileMenu from "@/components/MobileMenu";
import SideNav from "@/components/SideNav";

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

// Desktop: αριστερή, σταθερή navigation rail (SideNav) — αντικαθιστά το
// παλιό οριζόντιο header πάνω από ~820px (βλ. globals.css, ίδιο breakpoint
// με το προηγούμενο mobile-menu switch).
// Mobile: πολύ λιτό sticky top bar (λογότυπο + search + hamburger) — ίδιο
// idiom με πριν, το SideNav είναι display:none κάτω από το breakpoint.
export default async function Header() {
  const session = await auth();
  const initials = session?.user ? initialsOf(session.user.name ?? session.user.email ?? "?") : null;

  return (
    <>
      <SideNav initials={initials} />
      <header className="mobile-topbar glass">
        <div className="wrap">
          <Link href="/" className="logo">
            oenia
          </Link>
          <div className="mobile-topbar-actions">
            <SearchOverlay />
            <MobileMenu initials={initials} />
          </div>
        </div>
      </header>
    </>
  );
}
