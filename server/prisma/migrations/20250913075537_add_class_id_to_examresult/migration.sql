/*
  Warnings:

  - Added the required column `class_id` to the `exam_results_tbl` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."exam_results_tbl" ADD COLUMN     "class_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."exam_results_tbl" ADD CONSTRAINT "exam_results_tbl_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."class_tbl"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;
