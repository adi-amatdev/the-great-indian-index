-- AlterTable
ALTER TABLE "custom_indexes" ADD COLUMN     "sources" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "about" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "links" JSONB;

-- CreateTable
CREATE TABLE "custom_index_collaborators" (
    "customIndexId" BIGINT NOT NULL,
    "userId" BIGINT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "addedBy" BIGINT NOT NULL,
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "custom_index_collaborators_pkey" PRIMARY KEY ("customIndexId","userId")
);

-- CreateIndex
CREATE INDEX "custom_index_collaborators_userId_idx" ON "custom_index_collaborators"("userId");

-- AddForeignKey
ALTER TABLE "custom_index_collaborators" ADD CONSTRAINT "custom_index_collaborators_customIndexId_fkey" FOREIGN KEY ("customIndexId") REFERENCES "custom_indexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_index_collaborators" ADD CONSTRAINT "custom_index_collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
