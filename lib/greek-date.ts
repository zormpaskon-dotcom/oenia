const MONTHS_ACCUSATIVE = [
  "Ιανουάριο",
  "Φεβρουάριο",
  "Μάρτιο",
  "Απρίλιο",
  "Μάιο",
  "Ιούνιο",
  "Ιούλιο",
  "Αύγουστο",
  "Σεπτέμβριο",
  "Οκτώβριο",
  "Νοέμβριο",
  "Δεκέμβριο",
];

// Το Intl.DateTimeFormat δίνει ονομαστική ("Σεπτέμβριος"), αλλά το "από" θέλει αιτιατική ("Σεπτέμβριο").
export function formatMonthAccusative(date: Date) {
  return `${MONTHS_ACCUSATIVE[date.getMonth()]} ${date.getFullYear()}`;
}
