-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'vi';

-- CreateTable
CREATE TABLE "document_variants" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "previewUrl" TEXT,
    "sizeBytes" BIGINT NOT NULL,
    "mimeType" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_variants_documentId_locale_key" ON "document_variants"("documentId", "locale");

-- AddForeignKey
ALTER TABLE "document_variants" ADD CONSTRAINT "document_variants_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
