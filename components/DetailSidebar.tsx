import Link from "next/link";

type Row = { label: string; value: string; href?: string };

// Sticky στοιχεία δίπλα στην πρώτη αφηγηματική ενότητα (Ιστορία/Επισκόπηση)
// σε winery/wine detail σελίδες — αντικαθιστά το παλιό οριζόντιο
// .wine-quick-strip. Σκόπιμα sticky ΜΟΝΟ μέσα στο .detail-top-grid container
// του, όχι σε όλο το μήκος της σελίδας — τα επόμενα full-bleed sections
// (WineryVisualSection κ.λπ.) μένουν ανεπηρέαστα.
export default function DetailSidebar({ rows }: { rows: Row[] }) {
  return (
    <aside className="detail-sidebar">
      <dl className="detail-sidebar-list">
        {rows.map((row) => (
          <div className="detail-sidebar-row" key={row.label}>
            <dt className="l">{row.label}</dt>
            <dd className="v">
              {row.href ? (
                <Link href={row.href} className="detail-sidebar-link">
                  {row.value}
                </Link>
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
