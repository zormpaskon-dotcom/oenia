-- CreateTable
CREATE TABLE "WinerySubmission" (
    "id" TEXT NOT NULL,
    "wineryId" TEXT NOT NULL,
    "submitterEmail" TEXT,
    "submitterPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WinerySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WinerySubmission_wineryId_key" ON "WinerySubmission"("wineryId");

-- AddForeignKey
ALTER TABLE "WinerySubmission" ADD CONSTRAINT "WinerySubmission_wineryId_fkey" FOREIGN KEY ("wineryId") REFERENCES "Winery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
