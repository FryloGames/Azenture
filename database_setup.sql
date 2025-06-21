-- Welding Shop Database Setup
-- This file contains all the SQL statements to set up the complete database structure

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(255),
    location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    start_date DATE,
    due_date DATE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    materials_cost DECIMAL(10,2) DEFAULT 0,
    labor_rate DECIMAL(8,2) DEFAULT 75.00,
    total_cost DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    materials_cost DECIMAL(10,2) DEFAULT 0,
    labor_cost DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0.05,
    total_amount DECIMAL(10,2) DEFAULT 0,
    valid_until DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    due_date DATE,
    paid_date DATE,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CREATE RLS POLICIES
-- =====================================================

-- Customers policies - Allow all operations for public users
CREATE POLICY "Allow all operations on customers" ON customers
    FOR ALL USING (true) WITH CHECK (true);

-- Inventory policies - Allow all operations for public users
CREATE POLICY "Allow all operations on inventory" ON inventory
    FOR ALL USING (true) WITH CHECK (true);

-- Projects policies - Allow all operations for public users
CREATE POLICY "Allow all operations on projects" ON projects
    FOR ALL USING (true) WITH CHECK (true);

-- Quotes policies - Allow all operations for public users
CREATE POLICY "Allow all operations on quotes" ON quotes
    FOR ALL USING (true) WITH CHECK (true);

-- Invoices policies - Allow all operations for public users
CREATE POLICY "Allow all operations on invoices" ON invoices
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 4. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category);
CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);

-- =====================================================
-- 5. POPULATE SAMPLE DATA
-- =====================================================

-- Insert sample customers (Calgary welding customers)
INSERT INTO customers (name, email, phone, address, notes) VALUES
('Alberta Steel Works', 'info@albertasteelworks.ca', '(403) 555-0101', '1234 16th Ave NW, Calgary, AB T2M 0J6', 'Large industrial client, prefers TIG welding'),
('Calgary Metal Fabrication', 'orders@calgarymetal.ca', '(403) 555-0102', '5678 Barlow Trail SE, Calgary, AB T2C 4K8', 'Regular customer, specializes in custom railings'),
('Rocky Mountain Welding', 'contact@rockymountainwelding.ca', '(403) 555-0103', '9012 Macleod Trail SW, Calgary, AB T2H 0K4', 'Oil and gas industry work'),
('Precision Welding Solutions', 'info@precisionwelding.ca', '(403) 555-0104', '3456 Crowchild Trail NW, Calgary, AB T3B 1Y1', 'High-end custom work, very particular about quality'),
('Calgary Industrial Services', 'service@calgaryindustrial.ca', '(403) 555-0105', '7890 Deerfoot Trail NE, Calgary, AB T2E 6T3', 'Heavy machinery repair and maintenance'),
('Mountain View Welding', 'hello@mountainviewwelding.ca', '(403) 555-0106', '2345 Glenmore Trail SW, Calgary, AB T2V 4T6', 'Residential and commercial projects'),
('Alberta Custom Metals', 'sales@albertacustom.ca', '(403) 555-0107', '4567 Stoney Trail NW, Calgary, AB T3K 4M8', 'Artistic metalwork and sculptures'),
('Calgary Structural Steel', 'info@calgarystructural.ca', '(403) 555-0108', '6789 14th Street NW, Calgary, AB T2K 1H4', 'Large structural steel projects'),
('Western Welding Works', 'contact@westernwelding.ca', '(403) 555-0109', '8901 17th Avenue SE, Calgary, AB T2A 0V7', 'Agricultural equipment repair'),
('Calgary Metal Arts', 'info@calgarymetalarts.ca', '(403) 555-0110', '1234 Kensington Road NW, Calgary, AB T2N 3P7', 'Decorative metalwork and gates');

-- Insert sample inventory (welding materials and supplies)
INSERT INTO inventory (name, description, category, sku, quantity, min_quantity, unit_price, supplier, location) VALUES
('ER70S-6 MIG Wire', '0.035" diameter, 10lb spool', 'Welding Wire', 'MIG-035-10LB', 25, 5, 45.99, 'Lincoln Electric', 'Warehouse A'),
('ER308L TIG Rods', '1/16" diameter, 10lb box', 'Welding Wire', 'TIG-308L-1/16', 15, 3, 89.99, 'Miller Electric', 'Warehouse A'),
('ER316L TIG Rods', '3/32" diameter, 10lb box', 'Welding Wire', 'TIG-316L-3/32', 12, 2, 95.99, 'Miller Electric', 'Warehouse A'),
('6011 Electrodes', '1/8" diameter, 50lb box', 'Stick Electrodes', 'STICK-6011-1/8', 8, 2, 125.99, 'Lincoln Electric', 'Warehouse B'),
('7018 Electrodes', '3/32" diameter, 50lb box', 'Stick Electrodes', 'STICK-7018-3/32', 10, 3, 145.99, 'Lincoln Electric', 'Warehouse B'),
('Argon Gas Cylinder', '80 cu ft, industrial grade', 'Gas', 'GAS-ARGON-80', 6, 2, 89.99, 'Praxair', 'Gas Storage'),
('CO2 Gas Cylinder', '20 lb, food grade', 'Gas', 'GAS-CO2-20LB', 4, 1, 45.99, 'Praxair', 'Gas Storage'),
('Argon/CO2 Mix', '75/25 mix, 80 cu ft', 'Gas', 'GAS-MIX-75/25', 8, 2, 79.99, 'Praxair', 'Gas Storage'),
('Welding Gloves', 'Heavy duty, size L', 'Safety Equipment', 'SAFETY-GLOVES-L', 20, 5, 24.99, 'Miller Electric', 'Safety Storage'),
('Welding Helmet', 'Auto-darkening, premium', 'Safety Equipment', 'SAFETY-HELMET-AD', 8, 2, 189.99, 'Lincoln Electric', 'Safety Storage'),
('Grinding Discs', '4.5" diameter, pack of 10', 'Consumables', 'CONS-GRIND-4.5', 30, 10, 15.99, 'Norton', 'Consumables'),
('Cutting Discs', '4.5" diameter, pack of 5', 'Consumables', 'CONS-CUT-4.5', 25, 8, 12.99, 'Norton', 'Consumables'),
('Wire Brushes', 'Stainless steel, pack of 5', 'Consumables', 'CONS-BRUSH-SS', 40, 15, 8.99, 'Norton', 'Consumables'),
('Anti-Spatter Spray', '16 oz can', 'Consumables', 'CONS-ANTISPATTER', 15, 5, 12.99, 'Lincoln Electric', 'Consumables'),
('Steel Plate', '1/4" x 4" x 8", A36', 'Raw Materials', 'MAT-STEEL-1/4-4X8', 50, 10, 89.99, 'Alberta Steel', 'Material Storage'),
('Aluminum Sheet', '1/8" x 4" x 8", 6061', 'Raw Materials', 'MAT-AL-1/8-4X8', 30, 5, 125.99, 'Aluminum Supply Co', 'Material Storage'),
('Stainless Steel Tube', '1" x 0.065", 304', 'Raw Materials', 'MAT-SS-TUBE-1X065', 100, 20, 15.99, 'Stainless Supply', 'Material Storage'),
('Mild Steel Angle', '2" x 2" x 1/4", 20ft', 'Raw Materials', 'MAT-ANGLE-2X2X1/4', 25, 5, 45.99, 'Alberta Steel', 'Material Storage');

-- Insert sample projects
INSERT INTO projects (customer_id, title, description, status, priority, start_date, due_date, estimated_hours, actual_hours, materials_cost, labor_rate, total_cost, notes) VALUES
((SELECT id FROM customers WHERE name = 'Alberta Steel Works'), 'Industrial Railing System', 'Custom safety railings for factory floor', 'in_progress', 'high', '2024-01-15', '2024-02-15', 40.0, 25.5, 1250.00, 75.00, 3162.50, 'Using 316L stainless for corrosion resistance'),
((SELECT id FROM customers WHERE name = 'Calgary Metal Fabrication'), 'Staircase Railing', 'Ornamental staircase railing for residential home', 'completed', 'medium', '2024-01-10', '2024-01-25', 16.0, 14.5, 450.00, 75.00, 1537.50, 'Customer very satisfied with finish'),
((SELECT id FROM customers WHERE name = 'Rocky Mountain Welding'), 'Pipeline Repair', 'Emergency repair of damaged pipeline section', 'pending', 'high', '2024-02-01', '2024-02-05', 12.0, NULL, 800.00, 85.00, 1820.00, 'Critical repair, needs immediate attention'),
((SELECT id FROM customers WHERE name = 'Precision Welding Solutions'), 'Custom Gate Design', 'Artistic driveway gate with custom scrollwork', 'in_progress', 'medium', '2024-01-20', '2024-02-20', 35.0, 18.0, 1200.00, 90.00, 2820.00, 'Complex design, taking longer than estimated'),
((SELECT id FROM customers WHERE name = 'Calgary Industrial Services'), 'Machine Base Repair', 'Repair and reinforcement of industrial machine base', 'completed', 'high', '2024-01-05', '2024-01-12', 8.0, 7.5, 300.00, 75.00, 862.50, 'Successfully reinforced weak points'),
((SELECT id FROM customers WHERE name = 'Mountain View Welding'), 'Deck Railing', 'Aluminum railing for residential deck', 'pending', 'low', '2024-02-10', '2024-02-25', 20.0, NULL, 600.00, 75.00, 2100.00, 'Waiting for customer approval'),
((SELECT id FROM customers WHERE name = 'Alberta Custom Metals'), 'Sculpture Base', 'Steel base for outdoor art installation', 'in_progress', 'medium', '2024-01-25', '2024-02-10', 12.0, 8.0, 400.00, 85.00, 1080.00, 'Weather-resistant finish required'),
((SELECT id FROM customers WHERE name = 'Calgary Structural Steel'), 'Beam Connection Plates', 'Custom connection plates for steel building', 'completed', 'high', '2024-01-08', '2024-01-15', 24.0, 22.0, 900.00, 75.00, 2550.00, 'All plates passed inspection'),
((SELECT id FROM customers WHERE name = 'Western Welding Works'), 'Tractor Bucket Repair', 'Repair of damaged tractor bucket', 'pending', 'medium', '2024-02-05', '2024-02-12', 6.0, NULL, 200.00, 75.00, 650.00, 'Customer will deliver equipment'),
((SELECT id FROM customers WHERE name = 'Calgary Metal Arts'), 'Garden Gate', 'Decorative garden gate with floral motifs', 'in_progress', 'low', '2024-01-30', '2024-02-28', 25.0, 12.0, 750.00, 90.00, 1830.00, 'Intricate scrollwork taking time');

-- Insert sample quotes
INSERT INTO quotes (customer_id, project_id, quote_number, title, description, status, materials_cost, labor_cost, tax_rate, total_amount, valid_until, notes) VALUES
((SELECT id FROM customers WHERE name = 'Alberta Steel Works'), (SELECT id FROM projects WHERE title = 'Industrial Railing System'), 'Q-2024-001', 'Industrial Railing System', 'Custom safety railings for factory floor', 'approved', 1250.00, 3000.00, 0.05, 4462.50, '2024-02-15', 'Customer approved with minor modifications'),
((SELECT id FROM customers WHERE name = 'Calgary Metal Fabrication'), (SELECT id FROM projects WHERE title = 'Staircase Railing'), 'Q-2024-002', 'Staircase Railing', 'Ornamental staircase railing for residential home', 'completed', 450.00, 1200.00, 0.05, 1732.50, '2024-01-25', 'Project completed successfully'),
((SELECT id FROM customers WHERE name = 'Rocky Mountain Welding'), (SELECT id FROM projects WHERE title = 'Pipeline Repair'), 'Q-2024-003', 'Pipeline Repair', 'Emergency repair of damaged pipeline section', 'pending', 800.00, 1020.00, 0.05, 1911.00, '2024-02-05', 'Awaiting customer approval'),
((SELECT id FROM customers WHERE name = 'Precision Welding Solutions'), (SELECT id FROM projects WHERE title = 'Custom Gate Design'), 'Q-2024-004', 'Custom Gate Design', 'Artistic driveway gate with custom scrollwork', 'approved', 1200.00, 3150.00, 0.05, 4567.50, '2024-02-20', 'Customer approved full design'),
((SELECT id FROM customers WHERE name = 'Calgary Industrial Services'), (SELECT id FROM projects WHERE title = 'Machine Base Repair'), 'Q-2024-005', 'Machine Base Repair', 'Repair and reinforcement of industrial machine base', 'completed', 300.00, 600.00, 0.05, 945.00, '2024-01-12', 'Project completed under budget'),
((SELECT id FROM customers WHERE name = 'Mountain View Welding'), (SELECT id FROM projects WHERE title = 'Deck Railing'), 'Q-2024-006', 'Deck Railing', 'Aluminum railing for residential deck', 'draft', 600.00, 1500.00, 0.05, 2205.00, '2024-02-25', 'Draft quote, needs review'),
((SELECT id FROM customers WHERE name = 'Alberta Custom Metals'), (SELECT id FROM projects WHERE title = 'Sculpture Base'), 'Q-2024-007', 'Sculpture Base', 'Steel base for outdoor art installation', 'approved', 400.00, 1020.00, 0.05, 1491.00, '2024-02-10', 'Customer approved with weather-resistant finish'),
((SELECT id FROM customers WHERE name = 'Calgary Structural Steel'), (SELECT id FROM projects WHERE title = 'Beam Connection Plates'), 'Q-2024-008', 'Beam Connection Plates', 'Custom connection plates for steel building', 'completed', 900.00, 1800.00, 0.05, 2835.00, '2024-01-15', 'All plates manufactured and delivered'),
((SELECT id FROM customers WHERE name = 'Western Welding Works'), (SELECT id FROM projects WHERE title = 'Tractor Bucket Repair'), 'Q-2024-009', 'Tractor Bucket Repair', 'Repair of damaged tractor bucket', 'draft', 200.00, 450.00, 0.05, 682.50, '2024-02-12', 'Draft quote, waiting for equipment inspection'),
((SELECT id FROM customers WHERE name = 'Calgary Metal Arts'), (SELECT id FROM projects WHERE title = 'Garden Gate'), 'Q-2024-010', 'Garden Gate', 'Decorative garden gate with floral motifs', 'approved', 750.00, 2250.00, 0.05, 3150.00, '2024-02-28', 'Customer approved intricate design');

-- Insert sample invoices
INSERT INTO invoices (customer_id, project_id, quote_id, invoice_number, status, subtotal, tax_amount, total_amount, amount_paid, due_date, paid_date, payment_method, notes) VALUES
((SELECT id FROM customers WHERE name = 'Alberta Steel Works'), (SELECT id FROM projects WHERE title = 'Industrial Railing System'), (SELECT id FROM quotes WHERE quote_number = 'Q-2024-001'), 'INV-2024-001', 'paid', 4462.50, 223.13, 4685.63, 4685.63, '2024-02-15', '2024-02-10', 'bank_transfer', 'Paid early, customer satisfied'),
((SELECT id FROM customers WHERE name = 'Calgary Metal Fabrication'), (SELECT id FROM projects WHERE title = 'Staircase Railing'), (SELECT id FROM quotes WHERE quote_number = 'Q-2024-002'), 'INV-2024-002', 'paid', 1732.50, 86.63, 1819.13, 1819.13, '2024-01-25', '2024-01-28', 'credit_card', 'Paid on time'),
((SELECT id FROM customers WHERE name = 'Precision Welding Solutions'), (SELECT id FROM projects WHERE title = 'Custom Gate Design'), (SELECT id FROM quotes WHERE quote_number = 'Q-2024-004'), 'INV-2024-003', 'partial', 4567.50, 228.38, 4795.88, 2400.00, '2024-02-20', NULL, 'bank_transfer', '50% deposit received'),
((SELECT id FROM customers WHERE name = 'Calgary Industrial Services'), (SELECT id FROM projects WHERE title = 'Machine Base Repair'), (SELECT id FROM quotes WHERE quote_number = 'Q-2024-005'), 'INV-2024-004', 'paid', 945.00, 47.25, 992.25, 992.25, '2024-01-12', '2024-01-15', 'cash', 'Paid in cash upon completion'),
((SELECT id FROM customers WHERE name = 'Alberta Custom Metals'), (SELECT id FROM projects WHERE title = 'Sculpture Base'), (SELECT id FROM quotes WHERE quote_number = 'Q-2024-007'), 'INV-2024-005', 'pending', 1491.00, 74.55, 1565.55, 0.00, '2024-02-10', NULL, NULL, 'Invoice sent, awaiting payment'),
((SELECT id FROM customers WHERE name = 'Calgary Structural Steel'), (SELECT id FROM projects WHERE title = 'Beam Connection Plates'), (SELECT id FROM quotes WHERE quote_number = 'Q-2024-008'), 'INV-2024-006', 'paid', 2835.00, 141.75, 2976.75, 2976.75, '2024-01-15', '2024-01-20', 'bank_transfer', 'Paid within terms'),
((SELECT id FROM customers WHERE name = 'Mountain View Welding'), NULL, (SELECT id FROM quotes WHERE quote_number = 'Q-2024-006'), 'INV-2024-007', 'overdue', 2205.00, 110.25, 2315.25, 0.00, '2024-02-25', NULL, NULL, 'Payment overdue, follow up needed'),
((SELECT id FROM customers WHERE name = 'Western Welding Works'), NULL, (SELECT id FROM quotes WHERE quote_number = 'Q-2024-009'), 'INV-2024-008', 'draft', 682.50, 34.13, 716.63, 0.00, '2024-02-12', NULL, NULL, 'Draft invoice, not yet sent'),
((SELECT id FROM customers WHERE name = 'Calgary Metal Arts'), (SELECT id FROM projects WHERE title = 'Garden Gate'), (SELECT id FROM quotes WHERE quote_number = 'Q-2024-010'), 'INV-2024-009', 'partial', 3150.00, 157.50, 3307.50, 1653.75, '2024-02-28', NULL, 'bank_transfer', '50% deposit received'),
((SELECT id FROM customers WHERE name = 'Rocky Mountain Welding'), NULL, (SELECT id FROM quotes WHERE quote_number = 'Q-2024-003'), 'INV-2024-010', 'pending', 1911.00, 95.55, 2006.55, 0.00, '2024-02-05', NULL, NULL, 'Quote pending approval');

-- =====================================================
-- 6. CREATE UPDATED_AT TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 7. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Check table counts
SELECT 'customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'inventory' as table_name, COUNT(*) as record_count FROM inventory
UNION ALL
SELECT 'projects' as table_name, COUNT(*) as record_count FROM projects
UNION ALL
SELECT 'quotes' as table_name, COUNT(*) as record_count FROM quotes
UNION ALL
SELECT 'invoices' as table_name, COUNT(*) as record_count FROM invoices;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 