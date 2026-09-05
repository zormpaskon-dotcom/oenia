/*
  Warnings:

  - You are about to drop the column `priceRange` on the `Wine` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Wine" DROP COLUMN "priceRange";

-- DropEnum
DROP TYPE "PriceRange";
