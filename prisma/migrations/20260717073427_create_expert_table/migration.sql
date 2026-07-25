-- CreateTable
CREATE TABLE "expert" (
    "id" SERIAL NOT NULL,
    "fullname" VARCHAR(100) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "password" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "image" VARCHAR(500),
    "designation" VARCHAR(150),
    "qualification" VARCHAR(250),
    "specialization" VARCHAR(250),
    "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experience_years" INTEGER,
    "organization" VARCHAR(200),
    "department" VARCHAR(150),
    "registration_no" VARCHAR(100),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "about" VARCHAR(500),
    "last_login_at" TIMESTAMP(3),
    "gender" VARCHAR(20),
    "date_of_birth" TIMESTAMP(3),
    "address" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "linkedin_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "expert_email_key" ON "expert"("email");

-- CreateIndex
CREATE UNIQUE INDEX "expert_phone_key" ON "expert"("phone");
