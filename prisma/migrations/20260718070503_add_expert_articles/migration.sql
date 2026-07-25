-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DRAFT', 'REJECTED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "expert_articles" (
    "id" SERIAL NOT NULL,
    "expert_id" INTEGER NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "slug" VARCHAR(300) NOT NULL,
    "short_description" VARCHAR(500),
    "content" JSONB NOT NULL,
    "thumbnail" VARCHAR(500),
    "category" VARCHAR(100),
    "tags" TEXT[],
    "status" "ArticleStatus" NOT NULL DEFAULT 'PUBLISHED',
    "rejection_reason" VARCHAR(500),
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expert_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expert_articles_slug_key" ON "expert_articles"("slug");

-- CreateIndex
CREATE INDEX "expert_articles_expert_id_idx" ON "expert_articles"("expert_id");

-- CreateIndex
CREATE INDEX "expert_articles_status_idx" ON "expert_articles"("status");

-- AddForeignKey
ALTER TABLE "expert_articles" ADD CONSTRAINT "expert_articles_expert_id_fkey" FOREIGN KEY ("expert_id") REFERENCES "expert"("id") ON DELETE CASCADE ON UPDATE CASCADE;
