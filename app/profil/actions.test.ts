import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn(), update: vi.fn(), delete: vi.fn() },
    winery: { updateMany: vi.fn() },
    article: { updateMany: vi.fn() },
    $transaction: vi.fn((ops: unknown[]) => Promise.all(ops)),
  },
}));

import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteAccountAction } from "./actions";

const mockedAuth = auth as unknown as { mockResolvedValue: (value: unknown) => void };

function fd(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("deleteAccountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects when nobody is signed in, without touching the database", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await deleteAccountAction({ error: null }, fd({ confirmEmail: "a@b.com" }));

    expect(result.error).toBeTruthy();
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it("rejects when the confirmation email doesn't match", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ email: "real@oenia.gr" } as never);

    const result = await deleteAccountAction({ error: null }, fd({ confirmEmail: "wrong@oenia.gr" }));

    expect(result.error).toBeTruthy();
    expect(prisma.user.delete).not.toHaveBeenCalled();
    expect(signOut).not.toHaveBeenCalled();
  });

  it("accepts a case-insensitive match and deletes the account (reviews are anonymized via onDelete: SetNull, not deleted here)", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ email: "Real@Oenia.gr" } as never);

    const result = await deleteAccountAction({ error: null }, fd({ confirmEmail: "real@oenia.gr" }));

    expect(result.error).toBeNull();
    expect(prisma.winery.updateMany).toHaveBeenCalledWith({
      where: { claimedById: "u1" },
      data: { claimedById: null },
    });
    expect(prisma.article.updateMany).toHaveBeenCalledWith({
      where: { authorId: "u1" },
      data: { authorId: null },
    });
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
    expect(signOut).toHaveBeenCalledWith({ redirectTo: "/" });
  });
});
