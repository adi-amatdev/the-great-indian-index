-- CreateTable
CREATE TABLE "index_cache" (
    "key" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "range" TEXT NOT NULL,
    "weighting" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "requestedAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL,
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "index_cache_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "index_cache_hitCount_updatedAt_idx" ON "index_cache"("hitCount", "updatedAt");
