-- =================================================================
-- RECREATE TIMESHEET SCHEMA (DEFINITIVE FIX V2)
-- This script completely rebuilds the tables for the timesheet
-- system to match what the application code expects.
-- WARNING: This will delete any existing timesheet data.
-- =================================================================

-- Step 1: Drop tables using CASCADE
-- This is the correct way to ensure a clean slate. It automatically
-- removes any dependent objects like policies or indexes.
DROP TABLE IF EXISTS public.timesheet_materials_used CASCADE;
DROP TABLE IF EXISTS public.timesheet_entries CASCADE;


-- Step 2: Create the tables with the correct columns and data types
CREATE TABLE public.timesheet_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.timesheet_materials_used (
    id BIGSERIAL PRIMARY KEY,
    timesheet_entry_id UUID REFERENCES public.timesheet_entries(id) ON DELETE CASCADE NOT NULL,
    inventory_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE NOT NULL,
    quantity_used DECIMAL(10, 2) NOT NULL,
    notes TEXT
);


-- Step 3: Enable Row Level Security
ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timesheet_materials_used ENABLE ROW LEVEL SECURITY;


-- Step 4: Create the correct RLS Policies
CREATE POLICY "Employees can manage their own timesheet entries"
ON public.timesheet_entries
FOR ALL
USING ( auth.uid() = employee_id )
WITH CHECK ( auth.uid() = employee_id );

CREATE POLICY "Employees can manage materials on their own timesheets"
ON public.timesheet_materials_used
FOR ALL
USING ( (SELECT employee_id FROM public.timesheet_entries WHERE id = timesheet_entry_id) = auth.uid() );


-- Step 5: Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_employee_id ON public.timesheet_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_materials_used_entry_id ON public.timesheet_materials_used(timesheet_entry_id);


SELECT 'Definitive timesheet schema created successfully.' as status; 