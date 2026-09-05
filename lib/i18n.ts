// Λεξικό μετάφρασης για το στατικό UI (header, footer) — όχι για περιεχόμενο
// βάσης (κρασιά/οινοποιεία/άρθρα, που παραμένουν μόνο στα ελληνικά).

export type Locale = "el" | "en";

export const LOCALE_STORAGE_KEY = "oenia-locale";

const dictionary = {
  nav_wines: { el: "Ετικέτες", en: "Wines" },
  nav_wineries: { el: "Οινοποιεία", en: "Wineries" },
  nav_varieties: { el: "Ποικιλίες", en: "Varieties" },
  nav_articles: { el: "Άρθρα", en: "Articles" },
  nav_explore: { el: "Εξερεύνηση", en: "Explore" },
  nav_signin: { el: "Σύνδεση", en: "Sign in" },
  nav_profile: { el: "Το προφίλ μου", en: "My profile" },
  nav_search: { el: "Αναζήτηση", en: "Search" },

  explore_map: { el: "Χάρτης", en: "Map" },
  explore_pairing: { el: "Τι θα φας;", en: "What are you eating?" },
  explore_compare: { el: "Σύγκριση ετικετών", en: "Compare wines" },
  explore_passport: { el: "Το διαβατήριό σου", en: "Your passport" },

  search_placeholder: { el: "Ψάξε ετικέτα, οινοποιείο ή ποικιλία…", en: "Search a wine, winery, or variety…" },
  search_close: { el: "Κλείσιμο", en: "Close" },
  search_searching: { el: "Αναζήτηση…", en: "Searching…" },
  search_no_match: { el: "Καμία αντιστοιχία", en: "No matches" },
  search_wineries: { el: "Οινοποιεία", en: "Wineries" },
  search_wines: { el: "Ετικέτες", en: "Wines" },
  search_varieties: { el: "Ποικιλίες", en: "Varieties" },

  footer_col_discover: { el: "Ανακάλυψη", en: "Discover" },
  footer_col_explore: { el: "Εξερεύνηση", en: "Explore" },
  footer_col_content: { el: "Περιεχόμενο", en: "Content" },
  footer_col_about: { el: "Σχετικά", en: "About" },
  footer_col_legal: { el: "Νομικά", en: "Legal" },

  footer_regions: { el: "Περιοχές", en: "Regions" },
  footer_guides: { el: "Οδηγοί", en: "Guides" },
  footer_how_it_works: { el: "Πώς λειτουργούμε", en: "How it works" },
  footer_for_wineries: { el: "Για οινοποιεία", en: "For wineries" },
  footer_privacy: { el: "Πολιτική απορρήτου", en: "Privacy policy" },
  footer_terms: { el: "Όροι χρήσης", en: "Terms of use" },
  footer_moderation: { el: "Πολιτική moderation", en: "Moderation policy" },

  footer_note: {
    el: "Το Oenia καταγράφει και ενημερώνει για το ελληνικό κρασί. Δεν πουλάμε προϊόντα.",
    en: "Oenia documents and informs about Greek wine. We don't sell products.",
  },
  footer_bottom: {
    el: "© 2026 Oenia. Με αγάπη για το ελληνικό κρασί.",
    en: "© 2026 Oenia. Made with love for Greek wine.",
  },
  footer_content_note: {
    el: "Το περιεχόμενο (κρασιά, οινοποιεία, άρθρα) είναι διαθέσιμο μόνο στα ελληνικά.",
    en: "Content (wines, wineries, articles) is currently only available in Greek.",
  },
} as const;

export type TranslationKey = keyof typeof dictionary;

export function translate(key: TranslationKey, locale: Locale): string {
  return dictionary[key][locale];
}
