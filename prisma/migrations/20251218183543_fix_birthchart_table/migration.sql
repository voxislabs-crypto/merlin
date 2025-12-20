/*
  Warnings:

  - You are about to drop the `birth_charts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "birth_charts";

-- CreateTable
CREATE TABLE "birthchart" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "planets" JSONB NOT NULL,
    "houses" JSONB NOT NULL,
    "aspects" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "birthchart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "birthchart_user_id_key" ON "birthchart"("user_id");

-- CreateIndex
CREATE INDEX "birthchart_user_id_idx" ON "birthchart"("user_id");
