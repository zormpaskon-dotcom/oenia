// "Curated Discovery" — τα διαθέσιμα buckets της homepage picker (ένα μόνο,
// πραγματικό κριτήριο ανά bucket: color, ή isSparkling). Ξεχωριστό αρχείο (όχι
// μέσα στο app/page.tsx) επειδή τα Next.js page files δεν επιτρέπουν
// αυθαίρετα named exports πέρα από τα δικά τους conventions.
export const DISCOVERY_BUCKETS = ["white", "red", "rose", "sparkling"] as const;
export type DiscoveryBucket = (typeof DISCOVERY_BUCKETS)[number];

export function isDiscoveryBucket(value: string | undefined): value is DiscoveryBucket {
  return !!value && (DISCOVERY_BUCKETS as readonly string[]).includes(value);
}
