CREATE TABLE "custom_indexes" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL,
    CONSTRAINT "custom_indexes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "custom_index_constituents" (
    "id" BIGSERIAL NOT NULL,
    "customIndexId" BIGINT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    CONSTRAINT "custom_index_constituents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "custom_indexes_slug_key" ON "custom_indexes"("slug");
CREATE INDEX "custom_indexes_userId_updatedAt_idx" ON "custom_indexes"("userId", "updatedAt" DESC);
CREATE UNIQUE INDEX "custom_index_constituents_customIndexId_symbol_key" ON "custom_index_constituents"("customIndexId", "symbol");
ALTER TABLE "custom_indexes" ADD CONSTRAINT "custom_indexes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "custom_index_constituents" ADD CONSTRAINT "custom_index_constituents_customIndexId_fkey" FOREIGN KEY ("customIndexId") REFERENCES "custom_indexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
