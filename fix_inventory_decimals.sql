-- =================================================================
-- FIX INVENTORY DECIMAL PRECISION
-- This script corrects a design flaw in the database.
-- 1. It alters the 'quantity' column in the 'inventory' table
--    to support decimal values (e.g., 10.5 sq. ft.).
-- 2. It updates the helper function to accept decimals,
--    ensuring inventory is subtracted correctly.
-- =================================================================

-- Step 1: Alter the table column to support decimal values
-- NUMERIC(10, 2) allows for up to 10 digits, with 2 after the decimal point.
ALTER TABLE public.inventory
ALTER COLUMN quantity TYPE NUMERIC(10, 2);

-- Step 2: Recreate the function to accept NUMERIC instead of INT
CREATE OR REPLACE FUNCTION decrement_inventory_quantity(item_id UUID, amount NUMERIC)
RETURNS VOID AS $$
BEGIN
  UPDATE public.inventory
  SET quantity = quantity - amount
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;

SELECT 'Database corrected to support decimal inventory.' as status; 