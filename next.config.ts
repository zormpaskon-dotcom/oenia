import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // winery.coverImage για τουλάχιστον ένα οινοποιείο δείχνει εδώ (όχι Blob) —
      // απαραίτητο ώστε το next/image migration του winery hero να μη σπάει
      // εκείνη τη σελίδα (βλ. Performance/Mobile fix pass).
      { protocol: "https", hostname: "reseller-content.4ty.gr" },
    ],
  },
};

export default nextConfig;
