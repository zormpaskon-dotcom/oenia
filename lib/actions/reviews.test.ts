import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    review: { upsert: vi.fn(), update: vi.fn(), aggregate: vi.fn() },
    wine: { update: vi.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reportReviewAction, submitReviewAction } from "./reviews";

function fd(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

// next-auth's `auth` export has an overloaded type (it doubles as edge middleware),
// which confuses vi.mocked()'s inference. Cast to the simple shape we actually mock.
const mockedAuth = auth as unknown as { mockResolvedValue: (value: unknown) => void };

describe("submitReviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when nobody is signed in, without touching the database", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await submitReviewAction(
      { error: null },
      fd({ wineId: "w1", rating: "5" })
    );

    expect(result.error).toBeTruthy();
    expect(prisma.review.upsert).not.toHaveBeenCalled();
  });

  it("rejects a rating outside 1–5", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } } as never);

    const result = await submitReviewAction(
      { error: null },
      fd({ wineId: "w1", rating: "6" })
    );

    expect(result.error).toBeTruthy();
    expect(prisma.review.upsert).not.toHaveBeenCalled();
  });

  it("rejects a non-numeric rating", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } } as never);

    const result = await submitReviewAction(
      { error: null },
      fd({ wineId: "w1", rating: "not-a-number" })
    );

    expect(result.error).toBeTruthy();
    expect(prisma.review.upsert).not.toHaveBeenCalled();
  });

  it("recomputes the wine's aggregate rating after a valid submission", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(prisma.review.aggregate).mockResolvedValue({
      _avg: { rating: 4.2 },
      _count: { _all: 3 },
    } as never);

    const result = await submitReviewAction(
      { error: null },
      fd({ wineId: "w1", rating: "5", note: "Πολύ καλό" })
    );

    expect(result.error).toBeNull();
    expect(prisma.review.upsert).toHaveBeenCalledWith({
      where: { userId_wineId: { userId: "u1", wineId: "w1" } },
      update: { rating: 5, note: "Πολύ καλό" },
      create: { userId: "u1", wineId: "w1", rating: 5, note: "Πολύ καλό" },
    });
    expect(prisma.wine.update).toHaveBeenCalledWith({
      where: { id: "w1" },
      data: { avgRating: 4.2, reviewCount: 3 },
    });
  });
});

describe("reportReviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when nobody is signed in — anonymous flagging is not allowed", async () => {
    mockedAuth.mockResolvedValue(null);

    await reportReviewAction(fd({ reviewId: "r1" }));

    expect(prisma.review.update).not.toHaveBeenCalled();
  });

  it("flags the review for a signed-in user", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } } as never);

    await reportReviewAction(fd({ reviewId: "r1", wineSlug: "some-wine" }));

    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: "r1" },
      data: { isFlagged: true },
    });
  });
});
