-- CreateEnum
CREATE TYPE "MacroRegion" AS ENUM ('NORTHERN_GREECE', 'CENTRAL_GREECE', 'PELOPONNESE', 'IONIAN_ISLANDS', 'AEGEAN_ISLANDS', 'CRETE', 'EPIRUS');

-- CreateEnum
CREATE TYPE "Appellation" AS ENUM ('PDO', 'PGI', 'TABLE');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "VarietyType" AS ENUM ('WHITE', 'RED');

-- CreateEnum
CREATE TYPE "WineColor" AS ENUM ('WHITE', 'RED', 'ROSE', 'ORANGE');

-- CreateEnum
CREATE TYPE "WineStyle" AS ENUM ('DRY', 'OFF_DRY', 'SEMI_SWEET', 'SWEET');

-- CreateEnum
CREATE TYPE "PriceRange" AS ENUM ('BUDGET', 'MID', 'PREMIUM');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'PRODUCER', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "CellarStatus" AS ENUM ('WANT_TO_TRY', 'TRIED');

-- CreateEnum
CREATE TYPE "ArticleCategory" AS ENUM ('VARIETIES', 'REGIONS', 'GUIDES', 'PEOPLE', 'NEWS');

-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "macroRegion" "MacroRegion" NOT NULL,
    "appellation" "Appellation",
    "recognizedYear" INTEGER,
    "altitudeMin" INTEGER,
    "altitudeMax" INTEGER,
    "areaHectares" INTEGER,
    "climate" TEXT,
    "soil" TEXT,
    "description" TEXT,
    "heroImage" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Winery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "subRegion" TEXT,
    "foundedYear" INTEGER,
    "generation" INTEGER,
    "description" TEXT,
    "story" TEXT,
    "philosophy" TEXT,
    "vineyardHectares" DOUBLE PRECISION,
    "isOrganic" BOOLEAN NOT NULL DEFAULT false,
    "isBiodynamic" BOOLEAN NOT NULL DEFAULT false,
    "acceptsVisitors" BOOLEAN NOT NULL DEFAULT false,
    "visitingHours" TEXT,
    "visitingNotes" TEXT,
    "websiteUrl" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "socialLinks" JSONB,
    "logoImage" TEXT,
    "coverImage" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PENDING',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "claimedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Winery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Variety" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nameLatin" TEXT,
    "pronunciation" TEXT,
    "audioUrl" TEXT,
    "type" "VarietyType" NOT NULL,
    "originRegion" TEXT,
    "description" TEXT,
    "characteristics" TEXT,
    "acidity" INTEGER,
    "body" INTEGER,
    "tannins" INTEGER,
    "aromaIntensity" INTEGER,
    "ageingPotential" INTEGER,
    "similarTo" TEXT,
    "comparisonNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Variety_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarietyOnRegion" (
    "varietyId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,

    CONSTRAINT "VarietyOnRegion_pkey" PRIMARY KEY ("varietyId","regionId")
);

-- CreateTable
CREATE TABLE "Wine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "wineryId" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "vintage" INTEGER,
    "color" "WineColor" NOT NULL,
    "style" "WineStyle" NOT NULL DEFAULT 'DRY',
    "isSparkling" BOOLEAN NOT NULL DEFAULT false,
    "abv" DOUBLE PRECISION,
    "appellation" "Appellation",
    "priceRange" "PriceRange",
    "labelImage" TEXT,
    "description" TEXT,
    "tastingNotes" TEXT,
    "servingTemp" TEXT,
    "foodPairings" TEXT[],
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VarietyOnWine" (
    "wineId" TEXT NOT NULL,
    "varietyId" TEXT NOT NULL,
    "percentage" INTEGER,

    CONSTRAINT "VarietyOnWine_pkey" PRIMARY KEY ("wineId","varietyId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "city" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "isPublicProfile" BOOLEAN NOT NULL DEFAULT true,
    "newsletterOptIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "note" TEXT,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CellarEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "status" "CellarStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CellarEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "body" TEXT NOT NULL,
    "coverImage" TEXT,
    "category" "ArticleCategory" NOT NULL,
    "readMinutes" INTEGER,
    "tags" TEXT[],
    "authorId" TEXT,
    "regionId" TEXT,
    "isSponsored" BOOLEAN NOT NULL DEFAULT false,
    "sponsorName" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleOnWinery" (
    "articleId" TEXT NOT NULL,
    "wineryId" TEXT NOT NULL,

    CONSTRAINT "ArticleOnWinery_pkey" PRIMARY KEY ("articleId","wineryId")
);

-- CreateTable
CREATE TABLE "ArticleOnWine" (
    "articleId" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,

    CONSTRAINT "ArticleOnWine_pkey" PRIMARY KEY ("articleId","wineId")
);

-- CreateTable
CREATE TABLE "FoodCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "emoji" TEXT,
    "blurb" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FoodCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodPairing" (
    "id" TEXT NOT NULL,
    "foodCategoryId" TEXT NOT NULL,
    "wineId" TEXT NOT NULL,
    "reason" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FoodPairing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_name_key" ON "Region"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Region_slug_key" ON "Region"("slug");

-- CreateIndex
CREATE INDEX "Region_macroRegion_idx" ON "Region"("macroRegion");

-- CreateIndex
CREATE UNIQUE INDEX "Winery_slug_key" ON "Winery"("slug");

-- CreateIndex
CREATE INDEX "Winery_regionId_idx" ON "Winery"("regionId");

-- CreateIndex
CREATE INDEX "Winery_status_idx" ON "Winery"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Variety_name_key" ON "Variety"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Variety_slug_key" ON "Variety"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Wine_slug_key" ON "Wine"("slug");

-- CreateIndex
CREATE INDEX "Wine_wineryId_idx" ON "Wine"("wineryId");

-- CreateIndex
CREATE INDEX "Wine_regionId_idx" ON "Wine"("regionId");

-- CreateIndex
CREATE INDEX "Wine_color_idx" ON "Wine"("color");

-- CreateIndex
CREATE INDEX "Wine_avgRating_idx" ON "Wine"("avgRating");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_slug_key" ON "User"("slug");

-- CreateIndex
CREATE INDEX "Review_wineId_idx" ON "Review"("wineId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_wineId_key" ON "Review"("userId", "wineId");

-- CreateIndex
CREATE INDEX "CellarEntry_userId_status_idx" ON "CellarEntry"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CellarEntry_userId_wineId_key" ON "CellarEntry"("userId", "wineId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_category_idx" ON "Article"("category");

-- CreateIndex
CREATE INDEX "Article_publishedAt_idx" ON "Article"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FoodCategory_name_key" ON "FoodCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FoodCategory_slug_key" ON "FoodCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FoodPairing_foodCategoryId_wineId_key" ON "FoodPairing"("foodCategoryId", "wineId");

-- AddForeignKey
ALTER TABLE "Winery" ADD CONSTRAINT "Winery_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winery" ADD CONSTRAINT "Winery_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarietyOnRegion" ADD CONSTRAINT "VarietyOnRegion_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "Variety"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarietyOnRegion" ADD CONSTRAINT "VarietyOnRegion_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wine" ADD CONSTRAINT "Wine_wineryId_fkey" FOREIGN KEY ("wineryId") REFERENCES "Winery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wine" ADD CONSTRAINT "Wine_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarietyOnWine" ADD CONSTRAINT "VarietyOnWine_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VarietyOnWine" ADD CONSTRAINT "VarietyOnWine_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "Variety"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellarEntry" ADD CONSTRAINT "CellarEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CellarEntry" ADD CONSTRAINT "CellarEntry_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleOnWinery" ADD CONSTRAINT "ArticleOnWinery_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleOnWinery" ADD CONSTRAINT "ArticleOnWinery_wineryId_fkey" FOREIGN KEY ("wineryId") REFERENCES "Winery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleOnWine" ADD CONSTRAINT "ArticleOnWine_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleOnWine" ADD CONSTRAINT "ArticleOnWine_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodPairing" ADD CONSTRAINT "FoodPairing_foodCategoryId_fkey" FOREIGN KEY ("foodCategoryId") REFERENCES "FoodCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodPairing" ADD CONSTRAINT "FoodPairing_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "Wine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
