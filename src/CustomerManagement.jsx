import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function CustomerManagement({ styles }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Load customers on component mount
  useEffect(() => {
    loadCustomers()
  }, [])

  // Load customers from Supabase
  const loadCustomers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('Error loading customers:', error)
        setError('Failed to load customers')
        return
      }

      setCustomers(data || [])
    } catch (err) {
      console.error('Error loading customers:', err)
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    })
    setEditingCustomer(null)
    setShowForm(false)
    setError('')
    setSuccess('')
  }

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setError('')
      setSuccess('')

      if (editingCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', editingCustomer.id)

        if (error) {
          console.error('Error updating customer:', error)
          setError('Failed to update customer')
          return
        }

        setSuccess('Customer updated successfully!')
      } else {
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert([formData])

        if (error) {
          console.error('Error creating customer:', error)
          setError('Failed to create customer')
          return
        }

        setSuccess('Customer created successfully!')
      }

      resetForm()
      loadCustomers()
    } catch (err) {
      console.error('Error saving customer:', err)
      setError('Failed to save customer')
    }
  }

  // Edit customer
  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || ''
    })
    setShowForm(true)
  }

  // Delete customer
  const handleDelete = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (error) {
        console.error('Error deleting customer:', error)
        setError('Failed to delete customer')
        return
      }

      setSuccess('Customer deleted successfully!')
      loadCustomers()
    } catch (err) {
      console.error('Error deleting customer:', err)
      setError('Failed to delete customer')
    }
  }

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  )

  // Component styles
  const componentStyles = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      flexWrap: 'wrap',
      gap: '16px'
    },
    searchContainer: {
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    searchInput: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #374151',
      backgroundColor: '#1f2937',
      color: 'white',
      fontSize: '14px',
      minWidth: '200px'
    },
    addButton: {
      padding: '8px 16px',
      backgroundColor: '#f97316',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    formContainer: {
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      padding: '24px',
      border: '1px solid #374151',
      marginBottom: '24px'
    },
    formTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'white',
      marginBottom: '16px'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '16px',
      marginBottom: '16px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      color: '#9ca3af',
      fontSize: '12px',
      fontWeight: '500',
      marginBottom: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    input: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #374151',
      backgroundColor: '#111827',
      color: 'white',
      fontSize: '14px'
    },
    textarea: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #374151',
      backgroundColor: '#111827',
      color: 'white',
      fontSize: '14px',
      minHeight: '80px',
      resize: 'vertical'
    },
    formButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    primaryButton: {
      backgroundColor: '#f97316',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#374151',
      color: 'white'
    },
    dangerButton: {
      backgroundColor: '#dc2626',
      color: 'white'
    },
    customersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px'
    },
    customerCard: {
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      padding: '20px',
      border: '1px solid #374151',
      transition: 'border-color 0.2s'
    },
    customerHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px'
    },
    customerName: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'white',
      margin: 0
    },
    customerActions: {
      display: 'flex',
      gap: '8px'
    },
    actionButton: {
      padding: '4px 8px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    editButton: {
      backgroundColor: '#3b82f6',
      color: 'white'
    },
    deleteButton: {
      backgroundColor: '#dc2626',
      color: 'white'
    },
    customerInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    infoItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      color: '#d1d5db'
    },
    infoLabel: {
      color: '#9ca3af',
      fontWeight: '500',
      minWidth: '60px'
    },
    notes: {
      marginTop: '12px',
      padding: '8px',
      backgroundColor: '#111827',
      borderRadius: '4px',
      fontSize: '13px',
      color: '#9ca3af',
      fontStyle: 'italic'
    },
    message: {
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      fontSize: '14px'
    },
    errorMessage: {
      backgroundColor: '#dc2626',
      color: 'white'
    },
    successMessage: {
      backgroundColor: '#059669',
      color: 'white'
    },
    loadingMessage: {
      textAlign: 'center',
      color: '#9ca3af',
      fontSize: '16px',
      padding: '40px'
    },
    emptyMessage: {
      textAlign: 'center',
      color: '#9ca3af',
      fontSize: '16px',
      padding: '40px'
    }
  }

  return (
    <div>
      <h2 style={styles.dashboardTitle}>Customer Management</h2>

      {/* Error/Success Messages */}
      {error && (
        <div style={{...componentStyles.message, ...componentStyles.errorMessage}}>
          {error}
        </div>
      )}
      {success && (
        <div style={{...componentStyles.message, ...componentStyles.successMessage}}>
          {success}
        </div>
      )}

      {/* Header with Search and Add Button */}
      <div style={componentStyles.header}>
        <div style={componentStyles.searchContainer}>
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={componentStyles.searchInput}
          />
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>
            {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={componentStyles.addButton}
          onMouseOver={(e) => e.target.style.backgroundColor = '#ea580c'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#f97316'}
        >
          + Add Customer
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={componentStyles.formContainer}>
          <h3 style={componentStyles.formTitle}>
            {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={componentStyles.formGrid}>
              <div style={componentStyles.formGroup}>
                <label style={componentStyles.label}>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={componentStyles.input}
                />
              </div>
              <div style={componentStyles.formGroup}>
                <label style={componentStyles.label}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={componentStyles.input}
                />
              </div>
              <div style={componentStyles.formGroup}>
                <label style={componentStyles.label}>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={componentStyles.input}
                />
              </div>
              <div style={componentStyles.formGroup}>
                <label style={componentStyles.label}>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  style={componentStyles.input}
                />
              </div>
            </div>
            <div style={componentStyles.formGroup}>
              <label style={componentStyles.label}>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                style={componentStyles.textarea}
                placeholder="Additional notes about the customer..."
              />
            </div>
            <div style={componentStyles.formButtons}>
              <button
                type="button"
                onClick={resetForm}
                style={{...componentStyles.button, ...componentStyles.secondaryButton}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#374151'}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{...componentStyles.button, ...componentStyles.primaryButton}}
                onMouseOver={(e) => e.target.style.backgroundColor = '#ea580c'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f97316'}
              >
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers Grid */}
      {loading ? (
        <div style={componentStyles.loadingMessage}>
          Loading customers...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div style={componentStyles.emptyMessage}>
          {searchTerm ? 'No customers found matching your search.' : 'No customers yet. Add your first customer!'}
        </div>
      ) : (
        <div style={componentStyles.customersGrid}>
          {filteredCustomers.map((customer) => (
            <div key={customer.id} style={componentStyles.customerCard}>
              <div style={componentStyles.customerHeader}>
                <h3 style={componentStyles.customerName}>{customer.name}</h3>
                <div style={componentStyles.customerActions}>
                  <button
                    onClick={() => handleEdit(customer)}
                    style={{...componentStyles.actionButton, ...componentStyles.editButton}}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    style={{...componentStyles.actionButton, ...componentStyles.deleteButton}}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div style={componentStyles.customerInfo}>
                {customer.email && (
                  <div style={componentStyles.infoItem}>
                    <span style={componentStyles.infoLabel}>Email:</span>
                    <span>{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div style={componentStyles.infoItem}>
                    <span style={componentStyles.infoLabel}>Phone:</span>
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.address && (
                  <div style={componentStyles.infoItem}>
                    <span style={componentStyles.infoLabel}>Address:</span>
                    <span>{customer.address}</span>
                  </div>
                )}
              </div>
              
              {customer.notes && (
                <div style={componentStyles.notes}>
                  "{customer.notes}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomerManagement 