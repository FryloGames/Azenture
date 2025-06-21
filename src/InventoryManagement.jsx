import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// Helper to determine stock status and color
const getStockStatus = (quantity, min_quantity) => {
  const q = Number(quantity);
  const min = Number(min_quantity);

  if (q <= 0) {
    return { text: 'Out of Stock', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' };
  }
  if (q <= min) {
    return { text: 'Low Stock', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)' };
  }
  return { text: 'In Stock', color: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.1)' };
};

function InventoryManagement({ styles, onInventoryUpdate }) {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: 0,
    min_quantity: 0,
    unit_price: 0.00,
    supplier: '',
    location: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const categories = [
    'Raw Materials', 'Welding Wire', 'Stick Electrodes', 'Gas', 
    'Safety Equipment', 'Consumables', 'Hardware', 'Tools'
  ];

  useEffect(() => {
    // Initial load of the inventory data
    loadInventory();

    // Set up the real-time subscription
    const channel = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        (payload) => {
          console.log('Change received!', payload);
          // When a change is detected, re-fetch the data
          loadInventory();
        }
      )
      .subscribe();

    // Cleanup function to remove the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadInventory = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        throw error
      }
      setInventory(data || [])
      if (onInventoryUpdate) {
        const lowStockCount = data.filter(item => item.quantity <= item.min_quantity).length;
        onInventoryUpdate(lowStockCount);
      }
    } catch (err) {
      console.error('Error loading inventory:', err)
      setError('Failed to load inventory.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '', description: '', category: '', quantity: 0, min_quantity: 0,
      unit_price: 0.00, supplier: '', location: ''
    })
    setEditingItem(null)
    setShowForm(false)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.name || !formData.category) {
        setError("Item Name and Category are required.");
        return;
    }

    try {
      let res;
      if (editingItem) {
        res = await supabase
          .from('inventory')
          .update(formData)
          .eq('id', editingItem.id)
      } else {
        res = await supabase
          .from('inventory')
          .insert([formData])
      }

      if (res.error) throw res.error

      setSuccess(`Item ${editingItem ? 'updated' : 'created'} successfully!`)
      resetForm()
      loadInventory()
    } catch (err) {
      console.error('Error saving item:', err)
      setError(`Failed to save item: ${err.message}`)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category: item.category || '',
      quantity: item.quantity || 0,
      min_quantity: item.min_quantity || 0,
      unit_price: item.unit_price || 0.00,
      supplier: item.supplier || '',
      location: item.location || ''
    })
    setShowForm(true)
    window.scrollTo(0, 0);
  }

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId)
      
      if (error) throw error
      
      setSuccess('Item deleted successfully!')
      loadInventory()
    } catch (err) {
      console.error('Error deleting item:', err)
      setError('Failed to delete item.')
    }
  }

  const filteredInventory = inventory.filter(item => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = (
      item.name?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.supplier?.toLowerCase().includes(term)
    )
    const matchesCategory = (
      categoryFilter === '' || item.category === categoryFilter
    )
    return matchesSearch && matchesCategory
  })

  const totalInventoryValue = filteredInventory.reduce((acc, item) => {
    return acc + (Number(item.quantity) * Number(item.unit_price));
  }, 0);
  
  const componentStyles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
    searchContainer: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
    searchInput: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px', minWidth: '200px' },
    selectInput: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#1f2937', color: 'white', fontSize: '14px', minWidth: '150px' },
    addButton: { padding: '8px 16px', backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    formContainer: { backgroundColor: '#1f2937', borderRadius: '8px', padding: '24px', border: '1px solid #374151', marginBottom: '24px' },
    formTitle: { fontSize: '18px', fontWeight: '600', color: 'white', marginBottom: '16px' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '16px' },
    formGroup: { display: 'flex', flexDirection: 'column' },
    label: { color: '#9ca3af', fontSize: '12px', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase' },
    input: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', fontSize: '14px' },
    textarea: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #374151', backgroundColor: '#111827', color: 'white', fontSize: '14px', minHeight: '80px', resize: 'vertical' },
    formButtons: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' },
    button: { padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    primaryButton: { backgroundColor: '#f97316', color: 'white' },
    secondaryButton: { backgroundColor: '#374151', color: 'white' },
    message: { padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
    errorMessage: { backgroundColor: '#dc2626', color: 'white' },
    successMessage: { backgroundColor: '#059669', color: 'white' },
    loadingMessage: { textAlign: 'center', color: '#9ca3af', fontSize: '16px', padding: '40px' },
    emptyMessage: { textAlign: 'center', color: '#9ca3af', fontSize: '16px', padding: '40px' },
    tableContainer: { overflowX: 'auto', backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #374151', color: '#9ca3af', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' },
    td: { padding: '12px 16px', borderBottom: '1px solid #374151', fontSize: '14px' },
    tr: { '&:last-child td': { borderBottom: 'none' } },
    actionButton: { padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500' },
    statusCell: { display: 'flex', alignItems: 'center', gap: '8px' },
    statusIndicator: { width: '10px', height: '10px', borderRadius: '50%' },
  }

  return (
    <div>
      <h2 style={styles.dashboardTitle}>Inventory Management</h2>

      <div style={{...styles.card, marginBottom: '24px', ...styles.cardContent}}>
        <p style={styles.cardLabel}>Total Inventory Value</p>
        <p style={{...styles.cardValue, color: '#34d399'}}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalInventoryValue)}</p>
      </div>

      {error && <div style={{...componentStyles.message, ...componentStyles.errorMessage}}>{error}</div>}
      {success && <div style={{...componentStyles.message, ...componentStyles.successMessage}}>{success}</div>}

      <div style={componentStyles.header}>
        <div style={componentStyles.searchContainer}>
          <input type="text" placeholder="Search items..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={componentStyles.searchInput} />
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={componentStyles.selectInput}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>{filteredInventory.length} items</span>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={componentStyles.addButton}>+ Add Item</button>
      </div>

      {showForm && (
        <div style={componentStyles.formContainer}>
          <h3 style={componentStyles.formTitle}>{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={componentStyles.formGrid}>
              <div style={componentStyles.formGroup}><label style={componentStyles.label}>Name *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={componentStyles.input} /></div>
              <div style={componentStyles.formGroup}><label style={componentStyles.label}>Category *</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required style={componentStyles.input}>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={componentStyles.formGroup}><label style={componentStyles.label}>Quantity</label><input type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} style={componentStyles.input} /></div>
              <div style={componentStyles.formGroup}><label style={componentStyles.label}>Min Quantity</label><input type="number" name="min_quantity" value={formData.min_quantity} onChange={handleInputChange} style={componentStyles.input} /></div>
              <div style={componentStyles.formGroup}><label style={componentStyles.label}>Unit Price</label><input type="number" step="0.01" name="unit_price" value={formData.unit_price} onChange={handleInputChange} style={componentStyles.input} /></div>
              <div style={componentStyles.formGroup}><label style={componentStyles.label}>Supplier</label><input type="text" name="supplier" value={formData.supplier} onChange={handleInputChange} style={componentStyles.input} /></div>
            </div>
            <div style={componentStyles.formGroup}><label style={componentStyles.label}>Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} style={componentStyles.textarea}></textarea></div>
            <div style={componentStyles.formGroup}><label style={componentStyles.label}>Location</label><input type="text" name="location" value={formData.location} onChange={handleInputChange} style={componentStyles.input} /></div>
            <div style={componentStyles.formButtons}>
              <button type="button" onClick={resetForm} style={{...componentStyles.button, ...componentStyles.secondaryButton}}>Cancel</button>
              <button type="submit" style={{...componentStyles.button, ...componentStyles.primaryButton}}>{editingItem ? 'Update Item' : 'Add Item'}</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={componentStyles.loadingMessage}>Loading inventory...</div>
      ) : (
        <div style={componentStyles.tableContainer}>
          <table style={componentStyles.table}>
            <thead>
              <tr>
                <th style={componentStyles.th}>Name</th>
                <th style={componentStyles.th}>Category</th>
                <th style={componentStyles.th}>Stock Status</th>
                <th style={componentStyles.th}>Quantity</th>
                <th style={componentStyles.th}>Unit Price</th>
                <th style={componentStyles.th}>Total Value</th>
                <th style={componentStyles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? filteredInventory.map(item => {
                const status = getStockStatus(item.quantity, item.min_quantity);
                return (
                  <tr key={item.id} style={{ backgroundColor: status.backgroundColor }}>
                    <td style={componentStyles.td}>
                      <div>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{item.supplier || 'N/A'}</div>
                    </td>
                    <td style={componentStyles.td}>{item.category}</td>
                    <td style={componentStyles.td}>
                        <div style={componentStyles.statusCell}>
                            <div style={{ ...componentStyles.statusIndicator, backgroundColor: status.color }}></div>
                            <span>{status.text}</span>
                        </div>
                    </td>
                    <td style={componentStyles.td}>{item.quantity} (Min: {item.min_quantity})</td>
                    <td style={componentStyles.td}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.unit_price)}</td>
                    <td style={componentStyles.td}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.quantity * item.unit_price)}</td>
                    <td style={componentStyles.td}>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button onClick={() => handleEdit(item)} style={{...componentStyles.actionButton, backgroundColor: '#3b82f6', color: 'white'}}>Edit</button>
                        <button onClick={() => handleDelete(item.id)} style={{...componentStyles.actionButton, backgroundColor: '#dc2626', color: 'white'}}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan="7" style={componentStyles.emptyMessage}>
                    {searchTerm || categoryFilter ? 'No items found matching your criteria.' : 'No items in inventory.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default InventoryManagement 