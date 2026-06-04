-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "fees" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "overview" TEXT,
    "courses" TEXT,
    "placements" TEXT,
    "examRequired" TEXT,
    "cutoffRank" INTEGER,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);
