import Link from "next/link";

type CheckOption = { value: string; label: string; count: number; active: boolean; href: string };
type ToggleOption = { label: string; active: boolean; href: string };

export type FilterSidebarProps = {
  colorOptions: CheckOption[];
  regionOptions: CheckOption[];
  varietyOptions: CheckOption[];
  ratingOptions: ToggleOption[];
  priceOptions: ToggleOption[];
  clearHref: string;
  hasActiveFilters: boolean;
};

function CheckboxGroup({ title, options }: { title: string; options: CheckOption[] }) {
  if (options.length === 0) return null;
  return (
    <div className="filter-group">
      <h3>{title}</h3>
      {options.map((opt) => (
        <Link
          key={opt.value}
          href={opt.href}
          className="filter-option"
          aria-pressed={opt.active}
          style={opt.active ? { color: "var(--wine)", fontWeight: 500 } : undefined}
        >
          <span
            aria-hidden="true"
            style={{
              width: 15,
              height: 15,
              borderRadius: 4,
              border: "1px solid var(--line)",
              background: opt.active ? "var(--wine)" : "transparent",
              borderColor: opt.active ? "var(--wine)" : "var(--line)",
              flexShrink: 0,
              display: "inline-block",
            }}
          />
          {opt.label}
          <span className="count">{opt.count}</span>
        </Link>
      ))}
    </div>
  );
}

export default function FilterSidebar({
  colorOptions,
  regionOptions,
  varietyOptions,
  ratingOptions,
  priceOptions,
  clearHref,
  hasActiveFilters,
}: FilterSidebarProps) {
  return (
    <aside className="filters">
      {hasActiveFilters && (
        <Link href={clearHref} className="clear-filters">
          Καθαρισμός φίλτρων
        </Link>
      )}

      <CheckboxGroup title="Χρώμα" options={colorOptions} />
      <CheckboxGroup title="Περιοχή" options={regionOptions} />
      <CheckboxGroup title="Ποικιλία" options={varietyOptions} />

      {ratingOptions.length > 0 && (
        <div className="filter-group">
          <h3>Βαθμολογία</h3>
          <div className="rating-filter">
            {ratingOptions.map((opt) => (
              <Link key={opt.label} href={opt.href} className={opt.active ? "is-active" : ""}>
                {opt.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="filter-group">
        <h3>Ένδειξη τιμής</h3>
        <div className="price-row">
          {priceOptions.map((opt) => (
            <Link key={opt.label} href={opt.href} className={`price-chip${opt.active ? " is-active" : ""}`}>
              {opt.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
