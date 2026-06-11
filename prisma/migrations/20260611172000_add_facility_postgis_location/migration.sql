CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE "Facility"
ADD COLUMN IF NOT EXISTS "location" geometry(Point, 4326);

UPDATE "Facility"
SET
  "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326),
  "hasCoordinates" = true
WHERE "longitude" IS NOT NULL
  AND "latitude" IS NOT NULL;

UPDATE "Facility"
SET
  "location" = NULL,
  "hasCoordinates" = false
WHERE "longitude" IS NULL
   OR "latitude" IS NULL;

CREATE INDEX IF NOT EXISTS "Facility_location_idx"
ON "Facility"
USING GIST ("location");

CREATE OR REPLACE FUNCTION sync_facility_location()
RETURNS trigger AS $$
BEGIN
  IF NEW."longitude" IS NOT NULL AND NEW."latitude" IS NOT NULL THEN
    NEW."location" = ST_SetSRID(ST_MakePoint(NEW."longitude", NEW."latitude"), 4326);
    NEW."hasCoordinates" = true;
  ELSE
    NEW."location" = NULL;
    NEW."hasCoordinates" = false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS "Facility_sync_location" ON "Facility";

CREATE TRIGGER "Facility_sync_location"
BEFORE INSERT OR UPDATE OF "latitude", "longitude"
ON "Facility"
FOR EACH ROW
EXECUTE FUNCTION sync_facility_location();
