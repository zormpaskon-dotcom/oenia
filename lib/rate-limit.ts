import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return h.get("x-real-ip") ?? "unknown";
}

/**
 * DB-backed rate limit — σχεδιασμένο για serverless (Vercel), όπου in-memory
 * counters δεν επιβιώνουν μεταξύ invocations. Επιστρέφει false αν ξεπεράστηκε
 * το όριο μέσα στο παράθυρο χρόνου, αλλιώς καταγράφει την προσπάθεια και
 * επιστρέφει true.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const cutoff = new Date(Date.now() - windowMs);

  await prisma.rateLimitHit.deleteMany({ where: { key, createdAt: { lt: cutoff } } });

  const count = await prisma.rateLimitHit.count({ where: { key, createdAt: { gte: cutoff } } });
  if (count >= limit) return false;

  await prisma.rateLimitHit.create({ data: { key } });
  return true;
}
