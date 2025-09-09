-- CreateTable
CREATE TABLE "resonance_feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "context" JSONB,
    "metadata" JSONB,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "expires_at" DATETIME
);

-- CreateTable
CREATE TABLE "resonance_weights" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scope" TEXT NOT NULL,
    "scope_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "weight" REAL NOT NULL,
    "decay_rate" REAL NOT NULL DEFAULT 0.95,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "resonance_feedback_user_id_entity_id_entity_type_idx" ON "resonance_feedback"("user_id", "entity_id", "entity_type");

-- CreateIndex
CREATE INDEX "resonance_feedback_expires_at_idx" ON "resonance_feedback"("expires_at");

-- CreateIndex
CREATE INDEX "resonance_weights_scope_scope_id_entity_type_idx" ON "resonance_weights"("scope", "scope_id", "entity_type");

-- CreateIndex
CREATE UNIQUE INDEX "resonance_weights_scope_scope_id_entity_type_entity_id_key" ON "resonance_weights"("scope", "scope_id", "entity_type", "entity_id");
