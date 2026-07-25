/*
  Warnings:

  - A unique constraint covering the columns `[image]` on the table `expert_articles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image` to the `expert_articles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "expert_articles" ADD COLUMN     "image" VARCHAR(300) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "expert_articles_image_key" ON "expert_articles"("image");
