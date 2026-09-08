// Λεξικό μετάφρασης για το στατικό UI (header, footer) — όχι για περιεχόμενο
// βάσης (κρασιά/οινοποιεία/άρθρα, που παραμένουν μόνο στα ελληνικά).

export type Locale = "el" | "en";

export const LOCALE_STORAGE_KEY = "oenia-locale";

const dictionary = {
  nav_wines: { el: "Ετικέτες", en: "Wines" },
  nav_wineries: { el: "Οινοποιεία", en: "Wineries" },
  nav_regions: { el: "Περιοχές", en: "Regions" },
  nav_varieties: { el: "Ποικιλίες", en: "Grapes" },
  nav_articles: { el: "Άρθρα", en: "Journal" },
  nav_explore: { el: "Εξερεύνηση", en: "Explore" },
  nav_signin: { el: "Σύνδεση", en: "Sign in" },
  nav_profile: { el: "Το προφίλ μου", en: "My profile" },
  nav_search: { el: "Αναζήτηση", en: "Search" },
  nav_menu: { el: "Μενού", en: "Menu" },
  nav_close_menu: { el: "Κλείσιμο μενού", en: "Close menu" },

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
  search_regions: { el: "Περιοχές", en: "Regions" },
  search_eyebrow: { el: "Αναζήτηση Oenia", en: "Search Oenia" },
  search_explore_heading: { el: "Εξερεύνησε το Oenia", en: "Explore Oenia" },
  search_no_results_for: { el: "Καμία αντιστοιχία για", en: "No results for" },
  search_no_results_hint: {
    el: "Δοκίμασε να αναζητήσεις ένα κρασί, ποικιλία, οινοποιείο ή περιοχή.",
    en: "Try searching for a wine, grape, winery or region.",
  },
  search_explore_wines: { el: "Εξερεύνησε τις ετικέτες", en: "Explore wines" },
  search_explore_wineries: { el: "Εξερεύνησε τα οινοποιεία", en: "Explore wineries" },
  search_explore_regions: { el: "Εξερεύνησε τις περιοχές", en: "Explore regions" },
  search_explore_grapes: { el: "Εξερεύνησε τις ποικιλίες", en: "Explore grapes" },

  header_tagline: { el: "Ελληνικό κρασί. Αξίζει την ανακάλυψη.", en: "Greek wine. Worth discovering." },

  home_hero_eyebrow: { el: "Μια γεύση μιας βαθύτερης ιστορίας", en: "A taste of a richer story" },
  home_hero_title_l1: { el: "Το ελληνικό κρασί,", en: "Greek wine," },
  home_hero_title_l2: { el: "αξίζει να το ανακαλύψεις.", en: "worth discovering." },
  home_hero_lead: {
    el: "Εξερεύνησε ελληνικά κρασιά, οινοποιεία, περιοχές και τους ανθρώπους πίσω από αυτά.",
    en: "Explore Greek wines, wineries, regions and the people behind them.",
  },
  home_hero_cta: { el: "Εξερεύνηση", en: "Explore" },
  home_hero_tag: { el: "Το κρασί ενώνει τόπους", en: "Wine connects places" },

  home_search_eyebrow: { el: "Βρες την επόμενή σου ανακάλυψη", en: "Find your next discovery" },
  home_search_title: { el: "Τι ψάχνεις;", en: "What are you looking for?" },
  home_search_placeholder: {
    el: "Ψάξε κρασιά, οινοποιεία, ποικιλίες ή περιοχές…",
    en: "Search wines, wineries, grapes or regions…",
  },

  home_explore_wines_label: { el: "Εξερεύνηση", en: "Explore" },
  home_explore_wineries_label: { el: "Γνωριμία", en: "Meet" },
  home_explore_regions_label: { el: "Ανακάλυψη", en: "Discover" },
  home_explore_varieties_label: { el: "Μάθε", en: "Learn" },

  home_featured_eyebrow: { el: "Προτεινόμενο κρασί", en: "Featured wine" },
  home_featured_cta: { el: "Δες το κρασί", en: "Explore wine" },
  home_featured_cite_region_group: { el: "Κυκλάδες", en: "Cyclades" },

  home_greece_eyebrow: { el: "Η Ελλάδα σε ένα κρασί", en: "Greece by wine" },
  home_greece_title_l1: { el: "Πολλά μέρη.", en: "Many places." },
  home_greece_title_l2: { el: "Μία ιστορία.", en: "One story." },
  home_greece_lead: {
    el: "Από τα ηφαιστειογενή νησιά ως τους ορεινούς αμπελώνες, εξερεύνησε τις περιοχές που διαμορφώνουν το ελληνικό κρασί.",
    en: "From volcanic islands to mountain vineyards, explore the regions that shape Greek wine.",
  },
  home_greece_cta: { el: "Εξερεύνηση περιοχών", en: "Explore regions" },

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
  footer_contact: { el: "Επικοινωνία", en: "Contact" },
  footer_instagram: { el: "Instagram", en: "Instagram" },

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
