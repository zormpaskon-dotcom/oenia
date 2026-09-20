// SEO FIX PASS 2 — αποφασίζει πότε ένα filtered/sorted/paginated/search URL
// μιας listing σελίδας (krasia/oinopoieia/perioches/poikilies) αξίζει να
// μείνει αυτόνομα indexable (μία, ΜΟΝΗ, χαμηλής πληθικότητας "meaningful"
// κατηγορία — π.χ. /poikilies?type=white) αντί να πάρει noindex+canonical
// πίσω στην καθαρή βάση listing. Βλ. SEO FIX PASS 2 report για ποια keys
// θεωρήθηκαν meaningful ανά σελίδα και γιατί.
export function facetSeo(
  activeKeys: string[],
  meaningfulKeys: readonly string[]
): { indexable: boolean } {
  if (activeKeys.length === 0) return { indexable: true };
  if (activeKeys.length === 1 && meaningfulKeys.includes(activeKeys[0])) {
    return { indexable: true };
  }
  return { indexable: false };
}
