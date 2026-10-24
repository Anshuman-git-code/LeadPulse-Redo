-- CreateTable
CREATE TABLE "lead" (
    "id" TEXT NOT NULL,
    "leadgen_id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Unknown',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lead_leadgen_id_key" ON "lead"("leadgen_id");

-- CreateIndex
CREATE INDEX "lead_createdAt_idx" ON "lead"("createdAt");
