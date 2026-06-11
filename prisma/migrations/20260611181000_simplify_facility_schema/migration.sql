CREATE OR REPLACE FUNCTION sync_facility_location()
RETURNS trigger AS $$
BEGIN
  IF NEW."longitude" IS NOT NULL AND NEW."latitude" IS NOT NULL THEN
    NEW."location" = ST_SetSRID(ST_MakePoint(NEW."longitude", NEW."latitude"), 4326);
  ELSE
    NEW."location" = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Facility'
      AND column_name = 'claimed_by'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Facility'
      AND column_name = 'claimedBy'
  ) THEN
    ALTER TABLE "Facility" RENAME COLUMN "claimed_by" TO "claimedBy";
  END IF;
END $$;

ALTER TABLE "Facility"
ADD COLUMN IF NOT EXISTS "claimedBy" TEXT;

ALTER TABLE "Facility"
DROP COLUMN IF EXISTS "hasCoordinates";

DROP TABLE IF EXISTS "RawFacility";
