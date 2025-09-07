-- CreateTable
CREATE TABLE "public"."student_tbl" (
    "student_adm_no" TEXT NOT NULL,
    "students_name" TEXT NOT NULL,
    "kcse_entry" INTEGER NOT NULL,

    CONSTRAINT "student_tbl_pkey" PRIMARY KEY ("student_adm_no")
);
