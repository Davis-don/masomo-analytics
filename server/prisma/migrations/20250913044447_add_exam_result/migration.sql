-- CreateTable
CREATE TABLE "public"."exam_results_tbl" (
    "result_id" TEXT NOT NULL,
    "student_adm_no" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "marks_obtained" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION,
    "grade" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_results_tbl_pkey" PRIMARY KEY ("result_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_tbl_student_adm_no_exam_id_subject_id_key" ON "public"."exam_results_tbl"("student_adm_no", "exam_id", "subject_id");

-- AddForeignKey
ALTER TABLE "public"."exam_results_tbl" ADD CONSTRAINT "exam_results_tbl_student_adm_no_fkey" FOREIGN KEY ("student_adm_no") REFERENCES "public"."student_tbl"("student_adm_no") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_results_tbl" ADD CONSTRAINT "exam_results_tbl_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exam_tbl"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exam_results_tbl" ADD CONSTRAINT "exam_results_tbl_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects_model"("subject_id") ON DELETE CASCADE ON UPDATE CASCADE;
