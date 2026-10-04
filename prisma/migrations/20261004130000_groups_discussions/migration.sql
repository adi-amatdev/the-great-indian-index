ALTER TABLE "custom_indexes" ADD COLUMN "groupName" TEXT;

CREATE TABLE "index_discussion_posts" (
    "id" BIGSERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" BIGINT NOT NULL,
    CONSTRAINT "index_discussion_posts_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "index_discussion_posts"
  ADD CONSTRAINT "index_discussion_posts_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "index_discussion_posts_slug_createdAt_idx"
  ON "index_discussion_posts"("slug", "createdAt" DESC);
