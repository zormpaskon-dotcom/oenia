import Link from "next/link";
import FilterCheckboxGroup from "./FilterCheckboxGroup";

type CheckOption = { value: string; label: string; count: number; active: boolean; href: string };
type ToggleOption = { label: string; active: boolean; href: string };

export type FilterSidebarProps = {
  colorOptions: CheckOption[];
  regionOptions: CheckOption[];
  varietyOptions: CheckOption[];
  ratingOptions: ToggleOption[];
  styleOptions: ToggleOption[];
  clearHref: string;
  hasActiveFilters: boolean;
};

export default function FilterSidebar({
  colorOptions,
  regionOptions,
  varietyOptions,
  ratingOptions,
  styleOptions,
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

      <FilterCheckboxGroup title="Χρώμα" options={colorOptions} />
      <FilterCheckboxGroup
        title="Περιοχή"
        options={regionOptions}
        searchable
        searchPlaceholder="Αναζήτηση περιοχής…"
      />
      <FilterCheckboxGroup
        title="Ποικιλία"
        options={varietyOptions}
        searchable
        searchPlaceholder="Αναζήτηση ποικιλίας…"
      />

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
        <h3>Στυλ</h3>
        <div className="style-row">
          {styleOptions.map((opt) => (
            <Link key={opt.label} href={opt.href} className={`style-chip${opt.active ? " is-active" : ""}`}>
              {opt.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
