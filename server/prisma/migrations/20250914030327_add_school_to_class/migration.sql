/*
  Warnings:

  - Added the required column `school_id` to the `class_tbl` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."class_tbl" ADD COLUMN     "school_id" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."school_tbl" (
    "school_id" TEXT NOT NULL,
    "school_name" TEXT NOT NULL,
    "location" TEXT,

    CONSTRAINT "school_tbl_pkey" PRIMARY KEY ("school_id")
);

-- AddForeignKey
ALTER TABLE "public"."class_tbl" ADD CONSTRAINT "class_tbl_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."school_tbl"("school_id") ON DELETE CASCADE ON UPDATE CASCADE;
