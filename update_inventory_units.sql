-- =====================================================
-- CORRECT INVENTORY UNITS
-- This script updates the 'unit' for specific inventory
-- items to be more accurate (e.g., sq. ft. for plates).
-- =====================================================

-- Update plates and sheets to use 'sq. ft.'
UPDATE public.inventory
SET unit = 'sq. ft.'
WHERE name ILIKE '%plate%' OR name ILIKE '%sheet%';

-- Ensure tubes, pipes, and angles use 'feet'
UPDATE public.inventory
SET unit = 'feet'
WHERE name ILIKE '%tube%' OR name ILIKE '%pipe%' OR name ILIKE '%angle%';

SELECT 'Inventory units updated successfully for plates and sheets.' as status; 