-- CreateTable
CREATE TABLE "RedeemedPoints" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" TEXT NOT NULL,
    "pointsRedeemed" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "RedeemedPoints_customerId_key" ON "RedeemedPoints"("customerId");
