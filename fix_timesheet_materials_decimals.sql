-- =================================================================
-- FIX TIMESHEET MATERIALS DECIMAL PRECISION
-- This script corrects the final design flaw in the database.
-- It alters the 'quantity_used' column in the 'timesheet_materials_used'
-- table to support decimal values, matching the 'inventory' table.
-- =================================================================

-- Alter the table column to support decimal values
-- NUMERIC(10, 2) allows for up to 10 digits, with 2 after the decimal point.
ALTER TABLE public.timesheet_materials_used
ALTER COLUMN quantity_used TYPE NUMERIC(10, 2);

SELECT 'Database corrected. Timesheet materials can now handle decimals.' as status; 