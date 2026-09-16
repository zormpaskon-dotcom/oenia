import Link from "next/link";

// Καθαρά presentational — κάθε σελίδα είναι ένα πραγματικό <Link href>, ίδιο
// URL-driven pattern με τα φίλτρα (app/krasia/filters.ts). Δεν χρειάζεται
// client JS για τη λειτουργία της· λειτουργεί ακόμα και χωρίς hydration.
function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "…")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push("…");
    result.push(p);
    prev = p;
  }
  return result;
}

export default function Pagination({
  currentPage,
  pageCount,
  rangeStart,
  rangeEnd,
  total,
  hrefForPage,
}: {
  currentPage: number;
  pageCount: number;
  rangeStart: number;
  rangeEnd: number;
  total: number;
  hrefForPage: (page: number) => string;
}) {
  if (total === 0) return null;

  return (
    <nav className="pagination" aria-label="Σελιδοποίηση αποτελεσμάτων">
      <p className="pagination-range">
        {rangeStart}–{rangeEnd} από {total} ετικέτες
      </p>

      {pageCount > 1 && (
        <div className="pagination-controls">
          <Link
            href={hrefForPage(currentPage - 1)}
            className={`pagination-arrow${currentPage <= 1 ? " is-disabled" : ""}`}
            aria-label="Προηγούμενη σελίδα"
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
          >
            ←
          </Link>

          {pageNumbers(currentPage, pageCount).map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="pagination-ellipsis" aria-hidden="true">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={hrefForPage(p)}
                className={`pagination-page${p === currentPage ? " is-active" : ""}`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </Link>
            )
          )}

          <Link
            href={hrefForPage(currentPage + 1)}
            className={`pagination-arrow${currentPage >= pageCount ? " is-disabled" : ""}`}
            aria-label="Επόμενη σελίδα"
            aria-disabled={currentPage >= pageCount}
            tabIndex={currentPage >= pageCount ? -1 : undefined}
          >
            →
          </Link>
        </div>
      )}
    </nav>
  );
}
