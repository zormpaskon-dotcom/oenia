import Link from "next/link";

const footerColumns = [
  {
    title: "Ανακάλυψη",
    links: [
      { href: "/tairiasma", label: "Τι θα φας;" },
      { href: "/diavatirio", label: "Το διαβατήριό σου" },
      { href: "/chartis", label: "Χάρτης" },
    ],
  },
  {
    title: "Εξερεύνηση",
    links: [
      { href: "/krasia", label: "Ετικέτες" },
      { href: "/oinopoieia", label: "Οινοποιεία" },
      { href: "/poikilies", label: "Ποικιλίες" },
      { href: "/perioches", label: "Περιοχές" },
    ],
  },
  {
    title: "Περιεχόμενο",
    links: [
      { href: "/arthra", label: "Άρθρα" },
      { href: "/perioches", label: "Περιοχές" },
      { href: "/arthra", label: "Οδηγοί" },
    ],
  },
  {
    title: "Σχετικά",
    links: [
      { href: "/pos-leitourgoume", label: "Πώς λειτουργούμε" },
      { href: "/gia-oinopoieia", label: "Για οινοποιεία" },
      { href: "/sygkrisi", label: "Σύγκριση ετικετών" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <div className="logo" style={{ fontSize: 30 }}>
            oenia
          </div>
          <p className="footer-note">
            Το Oenia καταγράφει και ενημερώνει για το ελληνικό κρασί. Δεν πουλάμε προϊόντα.
          </p>
        </div>
        <div className="footer-links">
          {footerColumns.map((col) => (
            <div className="footer-col" key={col.title}>
              <h4>{col.title}</h4>
              {col.links.map((link, i) => (
                <Link key={`${link.href}-${i}`} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="wrap footer-bottom">© 2026 Oenia. Με αγάπη για το ελληνικό κρασί.</div>
    </footer>
  );
}
