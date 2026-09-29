import type { TranslationKey } from "@/lib/i18n";

// Ενιαία πηγή για το primary navigation — χρησιμοποιείται από το SideNav
// (desktop) και το MobileMenu, ώστε να μην αποκλίνουν οι δύο λίστες.
export const PRIMARY_NAV = [
  { href: "/krasia", key: "nav_wines" },
  { href: "/oinopoieia", key: "nav_wineries" },
  { href: "/perioches", key: "nav_regions" },
  { href: "/poikilies", key: "nav_varieties" },
  { href: "/chartis", key: "nav_map" },
  { href: "/arthra", key: "nav_articles" },
  { href: "/diavatirio", key: "nav_passport" },
] as const satisfies ReadonlyArray<{ href: string; key: TranslationKey }>;
