import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    rateLimitHit: { deleteMany: vi.fn(), count: vi.fn(), create: vi.fn() },
  },
}));

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { clientIp, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows the request and records a hit when under the limit", async () => {
    vi.mocked(prisma.rateLimitHit.count).mockResolvedValue(2);

    const allowed = await rateLimit("login:1.2.3.4", 5, 60_000);

    expect(allowed).toBe(true);
    expect(prisma.rateLimitHit.create).toHaveBeenCalledWith({ data: { key: "login:1.2.3.4" } });
  });

  it("blocks the request without recording a new hit once the limit is reached", async () => {
    vi.mocked(prisma.rateLimitHit.count).mockResolvedValue(5);

    const allowed = await rateLimit("login:1.2.3.4", 5, 60_000);

    expect(allowed).toBe(false);
    expect(prisma.rateLimitHit.create).not.toHaveBeenCalled();
  });

  it("prunes hits older than the window before counting", async () => {
    vi.mocked(prisma.rateLimitHit.count).mockResolvedValue(0);

    await rateLimit("signup:5.6.7.8", 3, 1000);

    expect(prisma.rateLimitHit.deleteMany).toHaveBeenCalledWith({
      where: { key: "signup:5.6.7.8", createdAt: { lt: expect.any(Date) } },
    });
  });
});

describe("clientIp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the first address in x-forwarded-for", async () => {
    vi.mocked(headers).mockResolvedValue({
      get: (name: string) => (name === "x-forwarded-for" ? "203.0.113.5, 10.0.0.1" : null),
    } as never);

    expect(await clientIp()).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip when x-forwarded-for is absent", async () => {
    vi.mocked(headers).mockResolvedValue({
      get: (name: string) => (name === "x-real-ip" ? "198.51.100.9" : null),
    } as never);

    expect(await clientIp()).toBe("198.51.100.9");
  });

  it("falls back to 'unknown' when no IP header is present", async () => {
    vi.mocked(headers).mockResolvedValue({ get: () => null } as never);

    expect(await clientIp()).toBe("unknown");
  });
});
