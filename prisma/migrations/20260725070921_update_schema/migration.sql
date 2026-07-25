/*
  Warnings:

  - You are about to drop the column `image` on the `expert_articles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "expert_articles_image_key";

-- AlterTable
ALTER TABLE "expert_articles" DROP COLUMN "image";
