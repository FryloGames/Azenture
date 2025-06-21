-- =====================================================
-- EMPLOYEE TIMESHEET DATABASE SETUP
-- This script adds tables and policies for the timesheet system.
-- =====================================================

-- =====================================================
-- 1. CREATE NEW TABLES
-- =====================================================

-- Timesheet Entries Table
-- Stores the core clock-in/out data for an employee on a specific project.
CREATE TABLE IF NOT EXISTS timesheet_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    clock_in TIMESTAMP WITH TIME ZONE NOT NULL,
    clock_out TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials Used Table
-- A join table to track multiple materials used for a single timesheet entry.
CREATE TABLE IF NOT EXISTS timesheet_materials_used (
    id BIGSERIAL PRIMARY KEY,
    timesheet_entry_id UUID REFERENCES timesheet_entries(id) ON DELETE CASCADE NOT NULL,
    inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE NOT NULL,
    quantity_used DECIMAL(10, 2) NOT NULL,
    notes TEXT
);


-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE timesheet_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheet_materials_used ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- 3. CREATE RLS POLICIES
-- =====================================================

-- Policies for timesheet_entries
-- Employees can only view and manage their own timesheet entries.
CREATE POLICY "Employees can manage their own timesheet entries"
ON timesheet_entries
FOR ALL
USING ( auth.uid() = employee_id )
WITH CHECK ( auth.uid() = employee_id );


-- Policies for timesheet_materials_used
-- Employees can only manage materials logged against their own timesheet entries.
CREATE POLICY "Employees can manage materials on their own timesheets"
ON timesheet_materials_used
FOR ALL
USING (
    (SELECT employee_id FROM timesheet_entries WHERE id = timesheet_entry_id) = auth.uid()
)
WITH CHECK (
    (SELECT employee_id FROM timesheet_entries WHERE id = timesheet_entry_id) = auth.uid()
);


-- Grant Read Access for Employees
-- Employees need to be able to see projects and inventory to select them.
-- NOTE: This assumes you have already run the 'secure_rls_policies.sql' script
-- which restricts broad access. We are now granting specific read access back.

DROP POLICY IF EXISTS "Allow read access to authenticated users" ON projects;
CREATE POLICY "Allow read access to authenticated users"
ON projects FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow read access to authenticated users" ON inventory;
CREATE POLICY "Allow read access to authenticated users"
ON inventory FOR SELECT USING (auth.role() = 'authenticated');


-- =====================================================
-- 4. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_employee_id ON timesheet_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_entries_project_id ON timesheet_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_materials_used_entry_id ON timesheet_materials_used(timesheet_entry_id);


-- =====================================================
-- 5. VERIFICATION
-- =====================================================
SELECT 'timesheet_entries and timesheet_materials_used tables created and secured.' as status; 