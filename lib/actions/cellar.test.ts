import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    cellarEntry: { upsert: vi.fn(), deleteMany: vi.fn() },
  },
}));

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setCellarStatusAction } from "./cellar";

function fd(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

// next-auth's `auth` export has an overloaded type (it doubles as edge middleware),
// which confuses vi.mocked()'s inference. Cast to the simple shape we actually mock.
const mockedAuth = auth as unknown as { mockResolvedValue: (value: unknown) => void };

describe("setCellarStatusAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when nobody is signed in", async () => {
    mockedAuth.mockResolvedValue(null);

    await setCellarStatusAction(fd({ wineId: "w1", status: "TRIED" }));

    expect(prisma.cellarEntry.upsert).not.toHaveBeenCalled();
    expect(prisma.cellarEntry.deleteMany).not.toHaveBeenCalled();
  });

  it("does nothing when wineId is missing", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } } as never);

    await setCellarStatusAction(fd({ status: "TRIED" }));

    expect(prisma.cellarEntry.upsert).not.toHaveBeenCalled();
    expect(prisma.cellarEntry.deleteMany).not.toHaveBeenCalled();
  });

  it("upserts a TRIED entry for a signed-in user", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } } as never);

    await setCellarStatusAction(fd({ wineId: "w1", status: "TRIED", wineSlug: "some-wine" }));

    expect(prisma.cellarEntry.upsert).toHaveBeenCalledWith({
      where: { userId_wineId: { userId: "u1", wineId: "w1" } },
      update: { status: "TRIED" },
      create: { userId: "u1", wineId: "w1", status: "TRIED" },
    });
  });

  it("deletes the entry when status is NONE", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } } as never);

    await setCellarStatusAction(fd({ wineId: "w1", status: "NONE" }));

    expect(prisma.cellarEntry.deleteMany).toHaveBeenCalledWith({
      where: { userId: "u1", wineId: "w1" },
    });
    expect(prisma.cellarEntry.upsert).not.toHaveBeenCalled();
  });

  it("silently ignores an unrecognized status value instead of guessing", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } } as never);

    await setCellarStatusAction(fd({ wineId: "w1", status: "SOMETHING_ELSE" }));

    expect(prisma.cellarEntry.upsert).not.toHaveBeenCalled();
    expect(prisma.cellarEntry.deleteMany).not.toHaveBeenCalled();
  });
});
