-- =================================================================
-- DECREMENT INVENTORY FUNCTION
-- This script creates a function that can be called from the app
-- to safely decrement the quantity of an inventory item.
-- Using a function like this prevents race conditions where two
-- users might try to update the same item at the same time.
-- =================================================================

CREATE OR REPLACE FUNCTION decrement_inventory_quantity(item_id UUID, amount INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.inventory
  SET quantity = quantity - amount
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;

SELECT 'Function decrement_inventory_quantity created successfully.' as status; 