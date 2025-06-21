import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// SQL statements to execute
const setupQueries = [
  // Create tables
  `CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS inventory (
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
  )`,

  `CREATE TABLE IF NOT EXISTS projects (
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
  )`,

  `CREATE TABLE IF NOT EXISTS quotes (
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
  )`,

  `CREATE TABLE IF NOT EXISTS invoices (
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
  )`,

  // Enable RLS
  'ALTER TABLE customers ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE inventory ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE projects ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE quotes ENABLE ROW LEVEL SECURITY',
  'ALTER TABLE invoices ENABLE ROW LEVEL SECURITY',

  // Create RLS policies
  `CREATE POLICY "Allow all operations on customers" ON customers
    FOR ALL USING (true) WITH CHECK (true)`,

  `CREATE POLICY "Allow all operations on inventory" ON inventory
    FOR ALL USING (true) WITH CHECK (true)`,

  `CREATE POLICY "Allow all operations on projects" ON projects
    FOR ALL USING (true) WITH CHECK (true)`,

  `CREATE POLICY "Allow all operations on quotes" ON quotes
    FOR ALL USING (true) WITH CHECK (true)`,

  `CREATE POLICY "Allow all operations on invoices" ON invoices
    FOR ALL USING (true) WITH CHECK (true)`,

  // Create indexes
  'CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name)',
  'CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)',
  'CREATE INDEX IF NOT EXISTS idx_inventory_category ON inventory(category)',
  'CREATE INDEX IF NOT EXISTS idx_inventory_sku ON inventory(sku)',
  'CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)',
  'CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id)',
  'CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status)',
  'CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON quotes(customer_id)',
  'CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)',
  'CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id)',

  // Create updated_at trigger function
  `CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
  END;
  $$ language 'plpgsql'`,

  // Create triggers
  'CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
  'CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
  'CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
  'CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
  'CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()'
]

// Sample data
const sampleCustomers = [
  { name: 'Alberta Steel Works', email: 'info@albertasteelworks.ca', phone: '(403) 555-0101', address: '1234 16th Ave NW, Calgary, AB T2M 0J6', notes: 'Large industrial client, prefers TIG welding' },
  { name: 'Calgary Metal Fabrication', email: 'orders@calgarymetal.ca', phone: '(403) 555-0102', address: '5678 Barlow Trail SE, Calgary, AB T2C 4K8', notes: 'Regular customer, specializes in custom railings' },
  { name: 'Rocky Mountain Welding', email: 'contact@rockymountainwelding.ca', phone: '(403) 555-0103', address: '9012 Macleod Trail SW, Calgary, AB T2H 0K4', notes: 'Oil and gas industry work' },
  { name: 'Precision Welding Solutions', email: 'info@precisionwelding.ca', phone: '(403) 555-0104', address: '3456 Crowchild Trail NW, Calgary, AB T3B 1Y1', notes: 'High-end custom work, very particular about quality' },
  { name: 'Calgary Industrial Services', email: 'service@calgaryindustrial.ca', phone: '(403) 555-0105', address: '7890 Deerfoot Trail NE, Calgary, AB T2E 6T3', notes: 'Heavy machinery repair and maintenance' },
  { name: 'Mountain View Welding', email: 'hello@mountainviewwelding.ca', phone: '(403) 555-0106', address: '2345 Glenmore Trail SW, Calgary, AB T2V 4T6', notes: 'Residential and commercial projects' },
  { name: 'Alberta Custom Metals', email: 'sales@albertacustom.ca', phone: '(403) 555-0107', address: '4567 Stoney Trail NW, Calgary, AB T3K 4M8', notes: 'Artistic metalwork and sculptures' },
  { name: 'Calgary Structural Steel', email: 'info@calgarystructural.ca', phone: '(403) 555-0108', address: '6789 14th Street NW, Calgary, AB T2K 1H4', notes: 'Large structural steel projects' },
  { name: 'Western Welding Works', email: 'contact@westernwelding.ca', phone: '(403) 555-0109', address: '8901 17th Avenue SE, Calgary, AB T2A 0V7', notes: 'Agricultural equipment repair' },
  { name: 'Calgary Metal Arts', email: 'info@calgarymetalarts.ca', phone: '(403) 555-0110', address: '1234 Kensington Road NW, Calgary, AB T2N 3P7', notes: 'Decorative metalwork and gates' }
]

const sampleInventory = [
  { name: 'ER70S-6 MIG Wire', description: '0.035" diameter, 10lb spool', category: 'Welding Wire', sku: 'MIG-035-10LB', quantity: 25, min_quantity: 5, unit_price: 45.99, supplier: 'Lincoln Electric', location: 'Warehouse A' },
  { name: 'ER308L TIG Rods', description: '1/16" diameter, 10lb box', category: 'Welding Wire', sku: 'TIG-308L-1/16', quantity: 15, min_quantity: 3, unit_price: 89.99, supplier: 'Miller Electric', location: 'Warehouse A' },
  { name: 'ER316L TIG Rods', description: '3/32" diameter, 10lb box', category: 'Welding Wire', sku: 'TIG-316L-3/32', quantity: 12, min_quantity: 2, unit_price: 95.99, supplier: 'Miller Electric', location: 'Warehouse A' },
  { name: '6011 Electrodes', description: '1/8" diameter, 50lb box', category: 'Stick Electrodes', sku: 'STICK-6011-1/8', quantity: 8, min_quantity: 2, unit_price: 125.99, supplier: 'Lincoln Electric', location: 'Warehouse B' },
  { name: '7018 Electrodes', description: '3/32" diameter, 50lb box', category: 'Stick Electrodes', sku: 'STICK-7018-3/32', quantity: 10, min_quantity: 3, unit_price: 145.99, supplier: 'Lincoln Electric', location: 'Warehouse B' },
  { name: 'Argon Gas Cylinder', description: '80 cu ft, industrial grade', category: 'Gas', sku: 'GAS-ARGON-80', quantity: 6, min_quantity: 2, unit_price: 89.99, supplier: 'Praxair', location: 'Gas Storage' },
  { name: 'CO2 Gas Cylinder', description: '20 lb, food grade', category: 'Gas', sku: 'GAS-CO2-20LB', quantity: 4, min_quantity: 1, unit_price: 45.99, supplier: 'Praxair', location: 'Gas Storage' },
  { name: 'Argon/CO2 Mix', description: '75/25 mix, 80 cu ft', category: 'Gas', sku: 'GAS-MIX-75/25', quantity: 8, min_quantity: 2, unit_price: 79.99, supplier: 'Praxair', location: 'Gas Storage' },
  { name: 'Welding Gloves', description: 'Heavy duty, size L', category: 'Safety Equipment', sku: 'SAFETY-GLOVES-L', quantity: 20, min_quantity: 5, unit_price: 24.99, supplier: 'Miller Electric', location: 'Safety Storage' },
  { name: 'Welding Helmet', description: 'Auto-darkening, premium', category: 'Safety Equipment', sku: 'SAFETY-HELMET-AD', quantity: 8, min_quantity: 2, unit_price: 189.99, supplier: 'Lincoln Electric', location: 'Safety Storage' },
  { name: 'Grinding Discs', description: '4.5" diameter, pack of 10', category: 'Consumables', sku: 'CONS-GRIND-4.5', quantity: 30, min_quantity: 10, unit_price: 15.99, supplier: 'Norton', location: 'Consumables' },
  { name: 'Cutting Discs', description: '4.5" diameter, pack of 5', category: 'Consumables', sku: 'CONS-CUT-4.5', quantity: 25, min_quantity: 8, unit_price: 12.99, supplier: 'Norton', location: 'Consumables' },
  { name: 'Wire Brushes', description: 'Stainless steel, pack of 5', category: 'Consumables', sku: 'CONS-BRUSH-SS', quantity: 40, min_quantity: 15, unit_price: 8.99, supplier: 'Norton', location: 'Consumables' },
  { name: 'Anti-Spatter Spray', description: '16 oz can', category: 'Consumables', sku: 'CONS-ANTISPATTER', quantity: 15, min_quantity: 5, unit_price: 12.99, supplier: 'Lincoln Electric', location: 'Consumables' },
  { name: 'Steel Plate', description: '1/4" x 4" x 8", A36', category: 'Raw Materials', sku: 'MAT-STEEL-1/4-4X8', quantity: 50, min_quantity: 10, unit_price: 89.99, supplier: 'Alberta Steel', location: 'Material Storage' },
  { name: 'Aluminum Sheet', description: '1/8" x 4" x 8", 6061', category: 'Raw Materials', sku: 'MAT-AL-1/8-4X8', quantity: 30, min_quantity: 5, unit_price: 125.99, supplier: 'Aluminum Supply Co', location: 'Material Storage' },
  { name: 'Stainless Steel Tube', description: '1" x 0.065", 304', category: 'Raw Materials', sku: 'MAT-SS-TUBE-1X065', quantity: 100, min_quantity: 20, unit_price: 15.99, supplier: 'Stainless Supply', location: 'Material Storage' },
  { name: 'Mild Steel Angle', description: '2" x 2" x 1/4", 20ft', category: 'Raw Materials', sku: 'MAT-ANGLE-2X2X1/4', quantity: 25, min_quantity: 5, unit_price: 45.99, supplier: 'Alberta Steel', location: 'Material Storage' }
]

async function setupDatabase() {
  console.log('🚀 Starting database setup...')

  try {
    // Execute setup queries
    console.log('📋 Creating tables and policies...')
    for (let i = 0; i < setupQueries.length; i++) {
      const query = setupQueries[i]
      console.log(`Executing query ${i + 1}/${setupQueries.length}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.log(`Query ${i + 1} result:`, error.message)
        // Continue with next query even if this one fails (might already exist)
      }
    }

    // Insert sample customers
    console.log('👥 Inserting sample customers...')
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .insert(sampleCustomers)
      .select()

    if (customersError) {
      console.log('Customers insert result:', customersError.message)
    } else {
      console.log(`✅ Inserted ${customers.length} customers`)
    }

    // Insert sample inventory
    console.log('📦 Inserting sample inventory...')
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .insert(sampleInventory)
      .select()

    if (inventoryError) {
      console.log('Inventory insert result:', inventoryError.message)
    } else {
      console.log(`✅ Inserted ${inventory.length} inventory items`)
    }

    // Get customer IDs for projects
    const { data: customerIds } = await supabase
      .from('customers')
      .select('id, name')
      .limit(10)

    if (customerIds && customerIds.length > 0) {
      // Insert sample projects
      console.log('🔧 Inserting sample projects...')
      const sampleProjects = [
        { customer_id: customerIds[0].id, title: 'Industrial Railing System', description: 'Custom safety railings for factory floor', status: 'in_progress', priority: 'high', start_date: '2024-01-15', due_date: '2024-02-15', estimated_hours: 40.0, actual_hours: 25.5, materials_cost: 1250.00, labor_rate: 75.00, total_cost: 3162.50, notes: 'Using 316L stainless for corrosion resistance' },
        { customer_id: customerIds[1].id, title: 'Staircase Railing', description: 'Ornamental staircase railing for residential home', status: 'completed', priority: 'medium', start_date: '2024-01-10', due_date: '2024-01-25', estimated_hours: 16.0, actual_hours: 14.5, materials_cost: 450.00, labor_rate: 75.00, total_cost: 1537.50, notes: 'Customer very satisfied with finish' },
        { customer_id: customerIds[2].id, title: 'Pipeline Repair', description: 'Emergency repair of damaged pipeline section', status: 'pending', priority: 'high', start_date: '2024-02-01', due_date: '2024-02-05', estimated_hours: 12.0, materials_cost: 800.00, labor_rate: 85.00, total_cost: 1820.00, notes: 'Critical repair, needs immediate attention' },
        { customer_id: customerIds[3].id, title: 'Custom Gate Design', description: 'Artistic driveway gate with custom scrollwork', status: 'in_progress', priority: 'medium', start_date: '2024-01-20', due_date: '2024-02-20', estimated_hours: 35.0, actual_hours: 18.0, materials_cost: 1200.00, labor_rate: 90.00, total_cost: 2820.00, notes: 'Complex design, taking longer than estimated' },
        { customer_id: customerIds[4].id, title: 'Machine Base Repair', description: 'Repair and reinforcement of industrial machine base', status: 'completed', priority: 'high', start_date: '2024-01-05', due_date: '2024-01-12', estimated_hours: 8.0, actual_hours: 7.5, materials_cost: 300.00, labor_rate: 75.00, total_cost: 862.50, notes: 'Successfully reinforced weak points' }
      ]

      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .insert(sampleProjects)
        .select()

      if (projectsError) {
        console.log('Projects insert result:', projectsError.message)
      } else {
        console.log(`✅ Inserted ${projects.length} projects`)
      }

      // Insert sample quotes
      console.log('📄 Inserting sample quotes...')
      const sampleQuotes = [
        { customer_id: customerIds[0].id, project_id: projects[0].id, quote_number: 'Q-2024-001', title: 'Industrial Railing System', description: 'Custom safety railings for factory floor', status: 'approved', materials_cost: 1250.00, labor_cost: 3000.00, tax_rate: 0.05, total_amount: 4462.50, valid_until: '2024-02-15', notes: 'Customer approved with minor modifications' },
        { customer_id: customerIds[1].id, project_id: projects[1].id, quote_number: 'Q-2024-002', title: 'Staircase Railing', description: 'Ornamental staircase railing for residential home', status: 'completed', materials_cost: 450.00, labor_cost: 1200.00, tax_rate: 0.05, total_amount: 1732.50, valid_until: '2024-01-25', notes: 'Project completed successfully' },
        { customer_id: customerIds[2].id, project_id: projects[2].id, quote_number: 'Q-2024-003', title: 'Pipeline Repair', description: 'Emergency repair of damaged pipeline section', status: 'pending', materials_cost: 800.00, labor_cost: 1020.00, tax_rate: 0.05, total_amount: 1911.00, valid_until: '2024-02-05', notes: 'Awaiting customer approval' }
      ]

      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .insert(sampleQuotes)
        .select()

      if (quotesError) {
        console.log('Quotes insert result:', quotesError.message)
      } else {
        console.log(`✅ Inserted ${quotes.length} quotes`)
      }

      // Insert sample invoices
      console.log('💰 Inserting sample invoices...')
      const sampleInvoices = [
        { customer_id: customerIds[0].id, project_id: projects[0].id, quote_id: quotes[0].id, invoice_number: 'INV-2024-001', status: 'paid', subtotal: 4462.50, tax_amount: 223.13, total_amount: 4685.63, amount_paid: 4685.63, due_date: '2024-02-15', paid_date: '2024-02-10', payment_method: 'bank_transfer', notes: 'Paid early, customer satisfied' },
        { customer_id: customerIds[1].id, project_id: projects[1].id, quote_id: quotes[1].id, invoice_number: 'INV-2024-002', status: 'paid', subtotal: 1732.50, tax_amount: 86.63, total_amount: 1819.13, amount_paid: 1819.13, due_date: '2024-01-25', paid_date: '2024-01-28', payment_method: 'credit_card', notes: 'Paid on time' },
        { customer_id: customerIds[3].id, project_id: projects[3].id, quote_id: quotes[2].id, invoice_number: 'INV-2024-003', status: 'partial', subtotal: 4567.50, tax_amount: 228.38, total_amount: 4795.88, amount_paid: 2400.00, due_date: '2024-02-20', payment_method: 'bank_transfer', notes: '50% deposit received' }
      ]

      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .insert(sampleInvoices)
        .select()

      if (invoicesError) {
        console.log('Invoices insert result:', invoicesError.message)
      } else {
        console.log(`✅ Inserted ${invoices.length} invoices`)
      }
    }

    console.log('🎉 Database setup completed successfully!')
    
    // Verify the setup
    console.log('\n📊 Database Summary:')
    const tables = ['customers', 'inventory', 'projects', 'quotes', 'invoices']
    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      console.log(`${table}: ${count} records`)
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error)
  }
}

// Run the setup
setupDatabase() 