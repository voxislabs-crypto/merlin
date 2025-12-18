-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "channel" TEXT NOT NULL DEFAULT 'app',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_enabled" BOOLEAN NOT NULL DEFAULT false,
    "morning_time" TEXT NOT NULL DEFAULT '08:00',
    "evening_time" TEXT NOT NULL DEFAULT '20:00',
    "weekly_day" INTEGER NOT NULL DEFAULT 0,
    "weekly_time" TEXT NOT NULL DEFAULT '10:00',
    "daily_enabled" BOOLEAN NOT NULL DEFAULT true,
    "weekly_enabled" BOOLEAN NOT NULL DEFAULT true,
    "theme_enabled" BOOLEAN NOT NULL DEFAULT true,
    "aspects_enabled" BOOLEAN NOT NULL DEFAULT true,
    "mbti_enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_status_scheduled_at_idx" ON "notifications"("user_id", "status", "scheduled_at");

-- CreateIndex
CREATE INDEX "notifications_type_status_scheduled_at_idx" ON "notifications"("type", "status", "scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");
