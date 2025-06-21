import { useState, useEffect } from 'react'
import { supabase, testConnection } from './supabase'
import CustomerManagement from './CustomerManagement'
import ProjectManagement from './ProjectManagement'
import InventoryManagement from './InventoryManagement'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

function App() {
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [supabaseConnected, setSupabaseConnected] = useState(false)
  const [activeJobCount, setActiveJobCount] = useState(0)
  const [lowStockCount, setLowStockCount] = useState(0)
  console.log('App component loaded, supabaseConnected:', supabaseConnected)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch initial data only when a session exists
  useEffect(() => {
    if (session) {
      const checkConnection = async () => {
        const connected = await testConnection()
        setSupabaseConnected(connected)
      }
      checkConnection()
      fetchActiveJobCount()
      fetchLowStockCount()
    }
  }, [session])

  // Fetch active job count
  const fetchActiveJobCount = async () => {
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'planning', 'in_progress'])
    
    if (error) {
      console.error("Error fetching active job count:", error)
    } else {
      setActiveJobCount(count)
    }
  }

  // Fetch low stock count
  const fetchLowStockCount = async () => {
    const { count, error } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .lte('quantity', supabase.raw('min_quantity')) // quantity <= min_quantity
    
    if (error) {
      console.error("Error fetching low stock count:", error)
    } else {
      setLowStockCount(count)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Reset states on logout
    setActiveTab('dashboard')
    setSupabaseConnected(false)
    setActiveJobCount(0)
    setLowStockCount(0)
  }

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#111827',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
    },
    header: {
      backgroundColor: '#1f2937',
      borderBottom: '1px solid #374151',
      padding: '16px 24px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#f97316',
      margin: 0
    },
    logoutButton: {
      backgroundColor: '#f97316',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      padding: '8px 16px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    nav: {
      backgroundColor: '#1f2937',
      padding: '0 24px',
      display: 'flex',
      gap: '0'
    },
    navButton: {
      padding: '12px 24px',
      borderBottom: '2px solid transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '14px'
    },
    navButtonActive: {
      borderBottomColor: '#f97316',
      color: '#f97316',
      backgroundColor: '#374151'
    },
    main: {
      padding: '24px'
    },
    dashboardTitle: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '32px'
    },
    cardsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      marginBottom: '32px'
    },
    card: {
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      padding: '24px',
      border: '1px solid #374151',
      flex: '1',
      minWidth: '250px'
    },
    cardContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    cardLabel: {
      color: '#9ca3af',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      margin: 0
    },
    cardValue: {
      fontSize: '28px',
      fontWeight: 'bold',
      marginTop: '8px',
      margin: 0
    },
    cardIcon: {
      fontSize: '28px'
    },
    activityCard: {
      backgroundColor: '#1f2937',
      borderRadius: '8px',
      padding: '24px',
      border: '1px solid #374151'
    },
    activityTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: 'white',
      marginBottom: '16px'
    },
    activityItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 0',
      borderBottom: '1px solid #374151'
    },
    activityText: {
      color: '#d1d5db'
    },
    activityTime: {
      color: '#6b7280',
      fontSize: '14px'
    }
  }

  const navButton = (isActive) => ({
    ...styles.navButton,
    ...(isActive ? styles.navButtonActive : {})
  })

  if (!session) {
    return (
      <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{width: '320px', backgroundColor: '#1f2937', padding: '32px', borderRadius: '8px'}}>
            <h1 style={{...styles.title, textAlign: 'center', marginBottom: '24px'}}>Welding Shop Login</h1>
            <Auth
              supabaseClient={supabase}
              appearance={{ theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#f97316',
                      brandAccent: '#ea580c',
                    },
                  },
                },
              }}
              theme="dark"
              providers={[]}
            />
        </div>
      </div>
    )
  }

  // Logged-in App View
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={styles.title}>Welding Shop Management</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ 
              padding: '4px 12px', 
              borderRadius: '4px', 
              backgroundColor: supabaseConnected ? '#059669' : '#dc2626',
              color: 'white',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              {supabaseConnected ? '✅ Database Connected' : '❌ Database Disconnected'}
            </div>
            <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={styles.nav}>
        <button
          style={navButton(activeTab === 'dashboard')}
          onClick={() => setActiveTab('dashboard')}
        >
          🔧 Dashboard
        </button>
        <button
          style={navButton(activeTab === 'customers')}
          onClick={() => setActiveTab('customers')}
        >
          👥 Customers
        </button>
        <button
          style={navButton(activeTab === 'jobs')}
          onClick={() => setActiveTab('jobs')}
        >
          📋 Jobs {activeJobCount > 0 && `(${activeJobCount})`}
        </button>
        <button
          style={navButton(activeTab === 'inventory')}
          onClick={() => setActiveTab('inventory')}
        >
          📦 Inventory {lowStockCount > 0 && <span style={{
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '10px',
            marginLeft: '8px'
          }}>{lowStockCount}</span>}
        </button>
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        {activeTab === 'dashboard' && <Dashboard styles={styles} />}
        {activeTab === 'customers' && <Customers styles={styles} />}
        {activeTab === 'jobs' && <Jobs styles={styles} onProjectUpdate={fetchActiveJobCount} />}
        {activeTab === 'inventory' && <Inventory styles={styles} onInventoryUpdate={fetchLowStockCount} />}
      </main>
    </div>
  )
}

function Dashboard({ styles }) {
  return (
    <div>
      <h2 style={styles.dashboardTitle}>Dashboard</h2>
      
      {/* Stats Cards */}
      <div style={styles.cardsContainer}>
        <div style={styles.card}>
          <div style={styles.cardContent}>
            <div>
              <p style={styles.cardLabel}>Today's Jobs</p>
              <p style={{...styles.cardValue, color: '#60a5fa'}}>5</p>
            </div>
            <div style={{...styles.cardIcon, color: '#60a5fa'}}>🔧</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardContent}>
            <div>
              <p style={styles.cardLabel}>Pending Quotes</p>
              <p style={{...styles.cardValue, color: '#34d399'}}>$12,450</p>
            </div>
            <div style={{...styles.cardIcon, color: '#34d399'}}>📄</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardContent}>
            <div>
              <p style={styles.cardLabel}>Low Stock Items</p>
              <p style={{...styles.cardValue, color: '#f87171'}}>3</p>
            </div>
            <div style={{...styles.cardIcon, color: '#f87171'}}>📦</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardContent}>
            <div>
              <p style={styles.cardLabel}>Week Revenue</p>
              <p style={{...styles.cardValue, color: '#fbbf24'}}>$8,234</p>
            </div>
            <div style={{...styles.cardIcon, color: '#fbbf24'}}>💰</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={styles.activityCard}>
        <h3 style={styles.activityTitle}>Recent Activity</h3>
        <div>
          <div style={styles.activityItem}>
            <span style={styles.activityText}>New job scheduled for John Smith</span>
            <span style={styles.activityTime}>2 hours ago</span>
          </div>
          <div style={styles.activityItem}>
            <span style={styles.activityText}>Quote #1045 approved by customer</span>
            <span style={styles.activityTime}>4 hours ago</span>
          </div>
          <div style={{...styles.activityItem, borderBottom: 'none'}}>
            <span style={styles.activityText}>Low stock alert: Welding rods</span>
            <span style={styles.activityTime}>Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Customers({ styles }) {
  return <CustomerManagement styles={styles} />
}

function Jobs({ styles, onProjectUpdate }) {
  return <ProjectManagement styles={styles} onProjectUpdate={onProjectUpdate} />
}

function Inventory({ styles, onInventoryUpdate }) {
  return <InventoryManagement styles={styles} onInventoryUpdate={onInventoryUpdate} />
}

export default App