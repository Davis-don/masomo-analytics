-- CreateTable
CREATE TABLE "public"."users_tbl" (
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "school_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_tbl_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_tbl_email_key" ON "public"."users_tbl"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_tbl_username_key" ON "public"."users_tbl"("username");

-- AddForeignKey
ALTER TABLE "public"."users_tbl" ADD CONSTRAINT "users_tbl_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "public"."school_tbl"("school_id") ON DELETE CASCADE ON UPDATE CASCADE;
