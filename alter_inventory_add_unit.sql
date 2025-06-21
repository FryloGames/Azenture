-- =====================================================
-- ADD UNIT TRACKING TO INVENTORY
-- This script adds a 'unit' column to the inventory table
-- to allow for more precise material tracking.
-- =====================================================

-- Add the 'unit' column to the inventory table
ALTER TABLE inventory
ADD COLUMN IF NOT EXISTS unit VARCHAR(50);

COMMENT ON COLUMN inventory.unit IS 'The unit of measurement for the inventory item (e.g., feet, lbs, pcs).';

-- Update existing items with sample units for demonstration
UPDATE inventory SET unit = 'lbs' WHERE category = 'Welding Wire';
UPDATE inventory SET unit = 'lbs' WHERE category = 'Stick Electrodes';
UPDATE inventory SET unit = 'pcs' WHERE category = 'Gas';
UPDATE inventory SET unit = 'pcs' WHERE category = 'Safety Equipment';
UPDATE inventory SET unit = 'pcs' WHERE category = 'Consumables';
UPDATE inventory SET unit = 'pcs' WHERE name ILIKE '%plate%' OR name ILIKE '%sheet%';
UPDATE inventory SET unit = 'feet' WHERE name ILIKE '%tube%' OR name ILIKE '%angle%';

SELECT 'inventory table updated with unit column.' as status; 