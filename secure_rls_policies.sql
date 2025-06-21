-- =====================================================
-- SECURE RLS POLICIES SCRIPT
-- This script replaces existing policies with secure ones that
-- require users to be authenticated.
-- =====================================================

-- Drop the old, insecure policies
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;
DROP POLICY IF EXISTS "Allow all operations on inventory" ON inventory;
DROP POLICY IF EXISTS "Allow all operations on projects" ON projects;
DROP POLICY IF EXISTS "Allow all operations on quotes" ON quotes;
DROP POLICY IF EXISTS "Allow all operations on invoices" ON invoices;

-- Create secure policies for the 'customers' table
CREATE POLICY "Allow read access to authenticated users" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access for authenticated users" ON customers FOR ALL USING (auth.role() = 'authenticated');

-- Create secure policies for the 'inventory' table
CREATE POLICY "Allow read access to authenticated users" ON inventory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access for authenticated users" ON inventory FOR ALL USING (auth.role() = 'authenticated');

-- Create secure policies for the 'projects' table
CREATE POLICY "Allow read access to authenticated users" ON projects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access for authenticated users" ON projects FOR ALL USING (auth.role() = 'authenticated');

-- Create secure policies for the 'quotes' table
CREATE POLICY "Allow read access to authenticated users" ON quotes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access for authenticated users" ON quotes FOR ALL USING (auth.role() = 'authenticated');

-- Create secure policies for the 'invoices' table
CREATE POLICY "Allow read access to authenticated users" ON invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow full access for authenticated users" ON invoices FOR ALL USING (auth.role() = 'authenticated');

-- Verification Query: Check that the new policies are in place.
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 