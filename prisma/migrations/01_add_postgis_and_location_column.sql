-- PostGIS Extension Setup and Location Column Migration
-- 1. Enable PostGIS Spatial Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Add fullAddress and pincode columns to Property table if not already added by Prisma
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "pincode" VARCHAR(20);
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "fullAddress" TEXT;

-- 3. Add PostGIS geography column 'location' (Point in WGS84 SRID 4326)
ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "location" geography(Point, 4326);

-- 4. Populate 'location' column from existing latitude and longitude coordinates
UPDATE "Property"
SET "location" = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE "location" IS NULL AND latitude IS NOT NULL AND longitude IS NOT NULL;

-- 5. Create GiST Spatial Index on 'location' for sub-millisecond radius search
CREATE INDEX IF NOT EXISTS "idx_property_location_gist" ON "Property" USING GIST ("location");

-- 6. Trigger function to automatically maintain 'location' point on INSERT or UPDATE
CREATE OR REPLACE FUNCTION update_property_location_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_property_location ON "Property";
CREATE TRIGGER trigger_update_property_location
BEFORE INSERT OR UPDATE OF latitude, longitude ON "Property"
FOR EACH ROW
EXECUTE FUNCTION update_property_location_point();
