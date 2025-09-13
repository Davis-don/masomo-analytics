-- CreateTable
CREATE TABLE "public"."class_exam_subjects_tbl" (
    "class_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upload',

    CONSTRAINT "class_exam_subjects_tbl_pkey" PRIMARY KEY ("class_id","exam_id","subject_id")
);

-- AddForeignKey
ALTER TABLE "public"."class_exam_subjects_tbl" ADD CONSTRAINT "class_exam_subjects_tbl_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."class_tbl"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_exam_subjects_tbl" ADD CONSTRAINT "class_exam_subjects_tbl_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exam_tbl"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_exam_subjects_tbl" ADD CONSTRAINT "class_exam_subjects_tbl_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects_model"("subject_id") ON DELETE CASCADE ON UPDATE CASCADE;
