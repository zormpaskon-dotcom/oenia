import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    winery: { update: vi.fn() },
    review: { update: vi.fn(), findUnique: vi.fn(), delete: vi.fn(), aggregate: vi.fn() },
    wine: { update: vi.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { approveWineryAction, deleteReviewAction, rejectWineryAction, unflagReviewAction } from "./actions";

// Αυτά τα tests καλύπτουν το πιο ριψοκίνδυνο κομμάτι του admin panel: κάθε ενέργεια
// ελέγχει ξανά τον ρόλο μέσα στο ίδιο το server action, χωρίς να εμπιστεύεται το UI.
// Αν κάποιος αφαιρέσει κατά λάθος το requireAdmin() σε μελλοντικό refactor, αυτά τα
// tests θα σπάσουν αμέσως.

function fd(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

// next-auth's `auth` export has an overloaded type (it doubles as edge middleware),
// which confuses vi.mocked()'s inference. Cast to the simple shape we actually mock.
const mockedAuth = auth as unknown as { mockResolvedValue: (value: unknown) => void };

describe("admin actions — access control", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("approveWineryAction refuses when nobody is signed in", async () => {
    mockedAuth.mockResolvedValue(null);

    await expect(approveWineryAction(fd({ id: "w1" }))).rejects.toThrow("Unauthorized");
    expect(prisma.winery.update).not.toHaveBeenCalled();
  });

  it("approveWineryAction refuses a signed-in non-admin", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "MEMBER" } as never);

    await expect(approveWineryAction(fd({ id: "w1" }))).rejects.toThrow("Unauthorized");
    expect(prisma.winery.update).not.toHaveBeenCalled();
  });

  it("approveWineryAction publishes the winery for an admin", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "admin1" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "ADMIN" } as never);

    await approveWineryAction(fd({ id: "w1" }));

    expect(prisma.winery.update).toHaveBeenCalledWith({
      where: { id: "w1" },
      data: { status: "PUBLISHED" },
    });
  });

  it("rejectWineryAction is a no-op when the id is missing, even for an admin", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "admin1" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "ADMIN" } as never);

    await rejectWineryAction(fd({}));

    expect(prisma.winery.update).not.toHaveBeenCalled();
  });

  it("unflagReviewAction clears the flag for an admin", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "admin1" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "ADMIN" } as never);

    await unflagReviewAction(fd({ id: "r1" }));

    expect(prisma.review.update).toHaveBeenCalledWith({
      where: { id: "r1" },
      data: { isFlagged: false },
    });
  });

  it("deleteReviewAction removes the review and recalculates the wine's rating", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "admin1" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "ADMIN" } as never);
    vi.mocked(prisma.review.findUnique).mockResolvedValue({ wineId: "wine1" } as never);
    vi.mocked(prisma.review.aggregate).mockResolvedValue({
      _avg: { rating: 3.5 },
      _count: { _all: 2 },
    } as never);

    await deleteReviewAction(fd({ id: "r1" }));

    expect(prisma.review.delete).toHaveBeenCalledWith({ where: { id: "r1" } });
    expect(prisma.wine.update).toHaveBeenCalledWith({
      where: { id: "wine1" },
      data: { avgRating: 3.5, reviewCount: 2 },
    });
  });

  it("deleteReviewAction is a no-op if the review no longer exists", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "admin1" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "ADMIN" } as never);
    vi.mocked(prisma.review.findUnique).mockResolvedValue(null);

    await deleteReviewAction(fd({ id: "gone" }));

    expect(prisma.review.delete).not.toHaveBeenCalled();
    expect(prisma.wine.update).not.toHaveBeenCalled();
  });
});
