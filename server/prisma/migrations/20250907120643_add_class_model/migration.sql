-- CreateTable
CREATE TABLE "public"."class_tbl" (
    "class_id" TEXT NOT NULL,
    "class_level" INTEGER NOT NULL,
    "class_stream" TEXT NOT NULL,

    CONSTRAINT "class_tbl_pkey" PRIMARY KEY ("class_id")
);
