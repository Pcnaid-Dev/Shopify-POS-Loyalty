/*
  Warnings:

  - You are about to drop the `RedeemedPoints` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RedeemedPoints";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "redeemedPoints" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" TEXT NOT NULL,
    "pointsRedeemed" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "redeemedPoints_customerId_key" ON "redeemedPoints"("customerId");
