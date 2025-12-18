-- Create birth_charts table manually
CREATE TABLE IF NOT EXISTS "birth_charts" (
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

    CONSTRAINT "birth_charts_pkey" PRIMARY KEY ("id")
);

-- Create index
CREATE INDEX IF NOT EXISTS "birth_charts_user_id_idx" ON "birth_charts"("user_id");
