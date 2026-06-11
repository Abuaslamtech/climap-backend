CREATE INDEX IF NOT EXISTS "Facility_location_geography_idx"
ON "Facility"
USING GIST (("location"::geography));
