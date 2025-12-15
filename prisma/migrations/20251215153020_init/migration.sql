-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT,
    "birth_date" TIMESTAMP(3),
    "birth_time" TEXT,
    "birth_location" TEXT,
    "time_unknown" BOOLEAN NOT NULL DEFAULT false,
    "mbti" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resonance_feedback" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "context" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "resonance_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resonance_weights" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "scope_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "weight" DOUBLE PRECISION NOT NULL,
    "decay_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.95,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resonance_weights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_profiles_user_id_idx" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "resonance_feedback_user_id_entity_id_entity_type_idx" ON "resonance_feedback"("user_id", "entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "resonance_feedback_expires_at_idx" ON "resonance_feedback"("expires_at");

-- CreateIndex
CREATE INDEX "resonance_weights_scope_scope_id_entity_type_idx" ON "resonance_weights"("scope", "scope_id", "entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "resonance_weights_scope_scope_id_entity_type_entity_id_key" ON "resonance_weights"("scope", "scope_id", "entity_type", "entity_id");
