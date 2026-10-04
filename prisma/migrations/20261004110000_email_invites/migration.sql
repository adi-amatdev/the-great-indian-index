-- Add optional signup email for admin access and account management.
ALTER TABLE "users" ADD COLUMN "email" TEXT;
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Invitations remain pending until the recipient explicitly accepts them.
CREATE TABLE "custom_index_invites" (
    "id" BIGSERIAL NOT NULL,
    "customIndexId" BIGINT NOT NULL,
    "inviterId" BIGINT NOT NULL,
    "recipientId" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" BIGINT NOT NULL,
    "respondedAt" BIGINT,
    CONSTRAINT "custom_index_invites_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "custom_index_invites"
  ADD CONSTRAINT "custom_index_invites_customIndexId_fkey"
  FOREIGN KEY ("customIndexId") REFERENCES "custom_indexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "custom_index_invites"
  ADD CONSTRAINT "custom_index_invites_inviterId_fkey"
  FOREIGN KEY ("inviterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "custom_index_invites"
  ADD CONSTRAINT "custom_index_invites_recipientId_fkey"
  FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "custom_index_invites_recipientId_status_createdAt_idx"
  ON "custom_index_invites"("recipientId", "status", "createdAt" DESC);
CREATE INDEX "custom_index_invites_customIndexId_status_idx"
  ON "custom_index_invites"("customIndexId", "status");
