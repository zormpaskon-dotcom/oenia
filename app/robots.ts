import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /profil, /diavatirio, /login πλέον φέρουν δικό τους noindex meta robots
      // (βλ. τα αντίστοιχα page.tsx) — πρέπει να μείνουν crawlable ώστε η Google
      // να μπορεί να δει το noindex, αντί να τα αγνοήσει τυφλά από εδώ.
      // Το /admin παραμένει disallow: πραγματικά ευαίσθητο, καμία ανάγκη crawl.
      disallow: ["/admin"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
