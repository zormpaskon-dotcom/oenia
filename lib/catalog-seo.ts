import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// PHASE 3A / Section 5 — OG + Twitter block για τις public list/discovery
// σελίδες (κρασιά, οινοποιεία, περιοχές, ποικιλίες, άρθρα, tairiasma,
// sygkrisi, chartis). Καμία καινούρια εικόνα: reuse των ήδη υπαρχόντων
// public/home/*.jpg που ήδη χρησιμοποιεί η αρχική σελίδα.
export function catalogSocialMeta({
  title,
  description,
  path,
  image,
}: {
  title: string;
  description: string;
  path: string;
  image: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const url = `${SITE_URL}${path}`;
  const absoluteImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;
  return {
    openGraph: {
      title,
      description,
      url,
      siteName: "World of Oenia",
      locale: "el_GR",
      type: "website",
      images: [{ url: absoluteImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteImage],
    },
  };
}
