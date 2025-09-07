-- CreateTable
CREATE TABLE "public"."subjects_model" (
    "subject_id" TEXT NOT NULL,
    "subject_name" TEXT NOT NULL,

    CONSTRAINT "subjects_model_pkey" PRIMARY KEY ("subject_id")
);

-- CreateTable
CREATE TABLE "public"."student_subjects_tbl" (
    "student_adm_no" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,

    CONSTRAINT "student_subjects_tbl_pkey" PRIMARY KEY ("student_adm_no","subject_id")
);

-- AddForeignKey
ALTER TABLE "public"."student_subjects_tbl" ADD CONSTRAINT "student_subjects_tbl_student_adm_no_fkey" FOREIGN KEY ("student_adm_no") REFERENCES "public"."student_tbl"("student_adm_no") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."student_subjects_tbl" ADD CONSTRAINT "student_subjects_tbl_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects_model"("subject_id") ON DELETE CASCADE ON UPDATE CASCADE;
