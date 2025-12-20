/*
  Warnings:

  - You are about to drop the `birthchart` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "birthchart";

-- CreateTable
CREATE TABLE "birth_charts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "birth_time" TEXT,
    "birth_location" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "planets" JSONB NOT NULL,
    "houses" JSONB NOT NULL,
    "aspects" JSONB,
    "chartData" JSONB,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "julian_day" DOUBLE PRECISION,
    "time_unknown" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "birth_charts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "default_chart_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "birth_charts_user_id_idx" ON "birth_charts"("user_id");

-- CreateIndex
CREATE INDEX "birth_charts_is_default_idx" ON "birth_charts"("is_default");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "birth_charts" ADD CONSTRAINT "birth_charts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
