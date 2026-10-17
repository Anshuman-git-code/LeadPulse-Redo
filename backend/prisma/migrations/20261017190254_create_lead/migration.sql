-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "leadgenId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Unknown',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_leadgenId_key" ON "Lead"("leadgenId");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
