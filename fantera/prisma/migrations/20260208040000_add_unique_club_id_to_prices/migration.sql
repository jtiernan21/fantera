-- DropIndex (replacing index with unique constraint)
DROP INDEX "prices_club_id_idx";

-- CreateIndex
CREATE UNIQUE INDEX "prices_club_id_key" ON "prices"("club_id");
