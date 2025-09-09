-- CreateTable
CREATE TABLE "public"."exam_tbl" (
    "exam_id" TEXT NOT NULL,
    "exam_name" TEXT NOT NULL,
    "exam_date" TIMESTAMP(3) NOT NULL,
    "term" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "exam_status" TEXT NOT NULL,

    CONSTRAINT "exam_tbl_pkey" PRIMARY KEY ("exam_id")
);

-- CreateTable
CREATE TABLE "public"."class_exams_tbl" (
    "class_id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,

    CONSTRAINT "class_exams_tbl_pkey" PRIMARY KEY ("class_id","exam_id")
);

-- AddForeignKey
ALTER TABLE "public"."class_exams_tbl" ADD CONSTRAINT "class_exams_tbl_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "public"."class_tbl"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."class_exams_tbl" ADD CONSTRAINT "class_exams_tbl_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "public"."exam_tbl"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;
