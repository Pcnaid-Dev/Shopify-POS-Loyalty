/*
  Warnings:

  - You are about to drop the `redeemedPoints` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "redeemedPoints";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "RedeemedPoints" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" TEXT NOT NULL,
    "pointsRedeemed" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "CustomerPoints" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" TEXT NOT NULL,
    "pointsBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RewardRule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "pointsRequired" INTEGER NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" REAL NOT NULL,
    "productId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RedeemedPoints_customerId_key" ON "RedeemedPoints"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerPoints_customerId_key" ON "CustomerPoints"("customerId");
