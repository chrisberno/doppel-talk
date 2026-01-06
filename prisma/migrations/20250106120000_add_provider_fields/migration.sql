-- AlterTable
ALTER TABLE "audio_project" ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'chatterbox',
ADD COLUMN "voiceId" TEXT,
ADD COLUMN "voiceConfig" JSONB,
ADD COLUMN "exportCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastExportedAt" TIMESTAMP(3);

