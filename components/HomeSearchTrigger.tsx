"use client";

export default function HomeSearchTrigger({ placeholder }: { placeholder: string }) {
  return (
    <button
      type="button"
      className="search-trigger"
      onClick={() => window.dispatchEvent(new Event("oenia:open-search"))}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span>{placeholder}</span>
    </button>
  );
}
