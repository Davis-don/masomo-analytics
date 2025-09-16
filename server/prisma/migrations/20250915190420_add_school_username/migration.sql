/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `school_tbl` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `school_tbl` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."school_tbl" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "school_tbl_username_key" ON "public"."school_tbl"("username");
