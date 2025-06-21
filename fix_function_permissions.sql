-- =================================================================
-- FIX DATABASE FUNCTION PERMISSIONS (DEFINITIVE FIX V2)
-- This script updates the helper function to run with the
-- permissions of its creator and explicitly sets the schema
-- search path, which is a common requirement in Supabase.
-- This is the definitive fix for the inventory update error.
-- =================================================================

CREATE OR REPLACE FUNCTION public.decrement_inventory_quantity(item_id UUID, amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- The final, critical addition
AS $$
BEGIN
  -- This function now runs with elevated privileges and a clear
  -- schema path, allowing it to safely update the inventory table.
  UPDATE inventory
  SET quantity = quantity - amount
  WHERE id = item_id;
END;
$$;

SELECT 'Database function permissions and search path corrected.' as status; 