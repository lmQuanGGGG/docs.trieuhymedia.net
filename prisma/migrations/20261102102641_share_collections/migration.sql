-- CreateEnum
CREATE TYPE "CollectionMode" AS ENUM ('ALL_MINE', 'SELECTED');

-- CreateTable
CREATE TABLE "share_collections" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "mode" "CollectionMode" NOT NULL DEFAULT 'SELECTED',
    "includePrivate" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "expiresAt" TIMESTAMP(3),
    "allowDownload" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "share_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_collection_items" (
    "collectionId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "share_collection_items_pkey" PRIMARY KEY ("collectionId","documentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "share_collections_token_key" ON "share_collections"("token");

-- CreateIndex
CREATE INDEX "share_collections_createdById_idx" ON "share_collections"("createdById");

-- CreateIndex
CREATE INDEX "share_collection_items_documentId_idx" ON "share_collection_items"("documentId");

-- AddForeignKey
ALTER TABLE "share_collections" ADD CONSTRAINT "share_collections_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_collection_items" ADD CONSTRAINT "share_collection_items_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "share_collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_collection_items" ADD CONSTRAINT "share_collection_items_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
