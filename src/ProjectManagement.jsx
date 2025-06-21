import { useState, useEffect } from 'react'
import { supabase } from './supabase'

// Helper function for status colors
const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return '#34d399' // Green
    case 'in_progress':
      return '#60a5fa' // Blue
    case 'pending':
      return '#fbbf24' // Yellow
    case 'on_hold':
      return '#9ca3af' // Gray
    case 'planning':
      return '#c084fc' // Purple
    default:
      return '#374151'
  }
}

function ProjectManagement({ styles, onProjectUpdate }) {
  const [projects, setProjects] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    customer_id: '',
    title: '',
    description: '',
    status: 'pending',
    start_date: '',
    due_date: '',
    estimated_hours: '',
    actual_hours: '',
    notes: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const projectStatuses = ['pending', 'planning', 'in_progress', 'on_hold', 'completed']

  // Load projects and customers
  useEffect(() => {
    loadProjects()
    loadCustomers()
  }, [])

  const loadData = async () => {
    await loadProjects()
    await loadCustomers()
    if (onProjectUpdate) {
        onProjectUpdate()
    }
  }

  const loadProjects = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*, customer:customers(name)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading projects:', error)
        setError('Failed to load projects.')
        return
      }

      setProjects(data || [])
    } catch (err) {
      console.error('Error loading projects:', err)
      setError('Failed to load projects.')
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('id, name')
      .order('name', { ascending: true })
    if (error) {
      console.error('Error loading customers:', error)
      setError('Failed to load customers for dropdown.')
    } else {
      setCustomers(data || [])
    }
  }

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }))
  }

  const resetForm = () => {
    setFormData({
      customer_id: '',
      title: '',
      description: '',
      status: 'pending',
      start_date: '',
      due_date: '',
      estimated_hours: '',
      actual_hours: '',
      notes: ''
    })
    setEditingProject(null)
    setShowForm(false)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.title || !formData.customer_id) {
        setError("Project Title and Customer are required.");
        return;
    }

    try {
      const projectData = { ...formData }
      
      let res;
      if (editingProject) {
        // Update
        res = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', editingProject.id)
      } else {
        // Create
        res = await supabase
          .from('projects')
          .insert([projectData])
      }
      
      if (res.error) {
        console.error('Error saving project:', res.error)
        setError(`Failed to save project: ${res.error.message}`)
        return
      }

      setSuccess(`Project ${editingProject ? 'updated' : 'created'} successfully!`)
      resetForm()
      loadData()
    } catch (err) {
      console.error('Error saving project:', err)
      setError('An unexpected error occurred while saving the project.')
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      customer_id: project.customer_id || '',
      title: project.title || '',
      description: project.description || '',
      status: project.status || 'pending',
      start_date: project.start_date || '',
      due_date: project.due_date || '',
      estimated_hours: project.estimated_hours || '',
      actual_hours: project.actual_hours || '',
      notes: project.notes || '',
    })
    setShowForm(true)
    window.scrollTo(0, 0);
  }

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) {
        console.error('Error deleting project:', error)
        setError('Failed to delete project.')
        return
      }

      setSuccess('Project deleted successfully!')
      loadData()
    } catch (err) {
      console.error('Error deleting project:', err)
      setError('Failed to delete project.')
    }
  }

  // Filtering
  const filteredProjects = projects.filter(project => {
    const term = searchTerm.toLowerCase()
    const matchesSearch = (
      project.title?.toLowerCase().includes(term) ||
      project.customer?.name?.toLowerCase().includes(term)
    )
    const matchesStatus = (
      statusFilter === '' || project.status === statusFilter
    )
    return matchesSearch && matchesStatus
  })

  // Component styles (similar to CustomerManagement)
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
    formButtons: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
    button: { padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
    primaryButton: { backgroundColor: '#f97316', color: 'white' },
    secondaryButton: { backgroundColor: '#374151', color: 'white' },
    projectsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    projectCard: { backgroundColor: '#1f2937', borderRadius: '8px', padding: '20px', border: '1px solid #374151', display: 'flex', flexDirection: 'column', gap: '12px' },
    projectHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    projectTitle: { fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 },
    projectActions: { display: 'flex', gap: '8px' },
    actionButton: { padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '500' },
    editButton: { backgroundColor: '#3b82f6', color: 'white' },
    deleteButton: { backgroundColor: '#dc2626', color: 'white' },
    statusBadge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '500', color: 'white', textTransform: 'capitalize' },
    projectInfo: { display: 'flex', flexDirection: 'column', gap: '8px' },
    infoItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#d1d5db' },
    infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
    notes: { marginTop: '8px', padding: '8px', backgroundColor: '#111827', borderRadius: '4px', fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', whiteSpace: 'pre-wrap' },
    message: { padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
    errorMessage: { backgroundColor: '#dc2626', color: 'white' },
    successMessage: { backgroundColor: '#059669', color: 'white' },
    loadingMessage: { textAlign: 'center', color: '#9ca3af', fontSize: '16px', padding: '40px' },
    emptyMessage: { textAlign: 'center', color: '#9ca3af', fontSize: '16px', padding: '40px' }
  }

  return (
    <div>
      <h2 style={styles.dashboardTitle}>Project Management</h2>

      {error && <div style={{...componentStyles.message, ...componentStyles.errorMessage}}>{error}</div>}
      {success && <div style={{...componentStyles.message, ...componentStyles.successMessage}}>{success}</div>}

      {/* Header */}
      <div style={componentStyles.header}>
        <div style={componentStyles.searchContainer}>
          <input type="text" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={componentStyles.searchInput} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={componentStyles.selectInput}>
            <option value="">All Statuses</option>
            {projectStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
          </select>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>{filteredProjects.length} projects</span>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={componentStyles.addButton}>+ Add Project</button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={componentStyles.formContainer}>
          <h3 style={componentStyles.formTitle}>{editingProject ? 'Edit Project' : 'Add New Project'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={componentStyles.formGrid}>
              <div style={{ ...componentStyles.formGroup, gridColumn: '1 / -1' }}>
                <label style={componentStyles.label}>Project Title *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required style={componentStyles.input} />
              </div>

              <div style={componentStyles.formGroup}>
                <label style={componentStyles.label}>Customer *</label>
                <select name="customer_id" value={formData.customer_id} onChange={handleInputChange} required style={componentStyles.input}>
                  <option value="">Select a customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div style={componentStyles.formGroup}>
                <label style={componentStyles.label}>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} style={componentStyles.input}>
                  {projectStatuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
                </select>
              </div>

              <div style={componentStyles.formGroup}>
                <label style={componentStyles.label}>Start Date</label>
                <input type="date" name="start_date" value={formData.start_date || ''} onChange={handleInputChange} style={componentStyles.input} />
              </div>
              <div style={componentStyles.formGroup}>
                <label style={componentStyles.label}>Due Date</label>
                <input type="date" name="due_date" value={formData.due_date || ''} onChange={handleInputChange} style={componentStyles.input} />
              </div>

              <div style={componentStyles.formGroup}>
                <label style={componentStyles.label}>Estimated Hours</label>
                <input type="number" step="0.1" name="estimated_hours" value={formData.estimated_hours || ''} onChange={handleInputChange} style={componentStyles.input} />
              </div>
              <div style={componentStyles.formGroup}>
                <label style={componentStyles.label}>Actual Hours</label>
                <input type="number" step="0.1" name="actual_hours" value={formData.actual_hours || ''} onChange={handleInputChange} style={componentStyles.input} />
              </div>
            </div>

            <div style={{...componentStyles.formGroup, marginBottom: '16px'}}>
              <label style={componentStyles.label}>Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleInputChange} style={componentStyles.textarea} placeholder="Brief overview of the project..."></textarea>
            </div>
            <div style={componentStyles.formGroup}>
              <label style={componentStyles.label}>Notes</label>
              <textarea name="notes" value={formData.notes || ''} onChange={handleInputChange} style={componentStyles.textarea} placeholder="Internal notes, technical details..."></textarea>
            </div>

            <div style={componentStyles.formButtons}>
              <button type="button" onClick={resetForm} style={{...componentStyles.button, ...componentStyles.secondaryButton}}>Cancel</button>
              <button type="submit" style={{...componentStyles.button, ...componentStyles.primaryButton}}>{editingProject ? 'Update Project' : 'Add Project'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div style={componentStyles.loadingMessage}>Loading projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div style={componentStyles.emptyMessage}>
          {searchTerm || statusFilter ? 'No projects found matching your criteria.' : 'No projects yet. Add your first one!'}
        </div>
      ) : (
        <div style={componentStyles.projectsGrid}>
          {filteredProjects.map((project) => (
            <div key={project.id} style={componentStyles.projectCard}>
              <div style={componentStyles.projectHeader}>
                <h3 style={componentStyles.projectTitle}>{project.title}</h3>
                <div style={componentStyles.projectActions}>
                  <button onClick={() => handleEdit(project)} style={{...componentStyles.actionButton, ...componentStyles.editButton}}>Edit</button>
                  <button onClick={() => handleDelete(project.id)} style={{...componentStyles.actionButton, ...componentStyles.deleteButton}}>Delete</button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={componentStyles.infoItem}>👥 {project.customer?.name || 'Unassigned'}</span>
                <span style={{...componentStyles.statusBadge, backgroundColor: getStatusColor(project.status)}}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              
              <div style={componentStyles.infoGrid}>
                <div style={componentStyles.infoItem}>🗓️ Start: {project.start_date || 'N/A'}</div>
                <div style={componentStyles.infoItem}>🏁 Due: {project.due_date || 'N/A'}</div>
                <div style={componentStyles.infoItem}>⏱️ Est: {project.estimated_hours || 0} hrs</div>
                <div style={componentStyles.infoItem}>✔️ Act: {project.actual_hours || 0} hrs</div>
              </div>

              {project.description && <p style={componentStyles.notes}>Description: {project.description}</p>}
              {project.notes && <p style={componentStyles.notes}>Notes: {project.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProjectManagement 