import { useState, useEffect } from 'react';
import { supabase, testConnection } from './supabase';
import CustomerManagement from './CustomerManagement';
import ProjectManagement from './ProjectManagement';
import InventoryManagement from './InventoryManagement';

// This component contains the entire management dashboard interface.
function ManagementView({ onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [supabaseConnected, setSupabaseConnected] = useState(false);
    const [activeJobCount, setActiveJobCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);

    // Fetch initial data
    useEffect(() => {
        const checkConnection = async () => {
            const connected = await testConnection();
            setSupabaseConnected(connected);
        };
        checkConnection();
        fetchActiveJobCount();
        fetchLowStockCount();
    }, []);

    // Data fetching functions
    const fetchActiveJobCount = async () => {
        const { count, error } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .in('status', ['pending', 'planning', 'in_progress']);
        if (!error) setActiveJobCount(count);
    };

    const fetchLowStockCount = async () => {
        const { data, error } = await supabase
            .from('inventory')
            .select('quantity, min_quantity');
        if (!error) {
            const lowCount = data.filter(item => item.quantity <= item.min_quantity).length;
            setLowStockCount(lowCount);
        }
    };

    const styles = {
        container: { minHeight: '100vh', backgroundColor: '#111827', color: 'white', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif' },
        header: { backgroundColor: '#1f2937', borderBottom: '1px solid #374151', padding: '16px 24px' },
        title: { fontSize: '24px', fontWeight: 'bold', color: '#f97316', margin: 0 },
        nav: { backgroundColor: '#1f2937', padding: '0 24px', display: 'flex' },
        navButton: { padding: '12px 24px', borderBottom: '2px solid transparent', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '14px' },
        navButtonActive: { borderBottomColor: '#f97316', color: '#f97316', backgroundColor: '#374151' },
        main: { padding: '24px' },
        dashboardTitle: { fontSize: '32px', fontWeight: 'bold', color: 'white', marginBottom: '32px' },
        cardsContainer: { display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' },
        card: { backgroundColor: '#1f2937', borderRadius: '8px', padding: '24px', border: '1px solid #374151', flex: '1', minWidth: '250px' },
        cardContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
        cardLabel: { color: '#9ca3af', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase' },
        cardValue: { fontSize: '28px', fontWeight: 'bold', marginTop: '8px', margin: 0 },
        logoutButton: { backgroundColor: '#f97316', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }
    };

    const navButton = (isActive) => ({ ...styles.navButton, ...(isActive ? styles.navButtonActive : {}) });

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={styles.title}>Welding Shop Management</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ padding: '4px 12px', borderRadius: '4px', backgroundColor: supabaseConnected ? '#059669' : '#dc2626', color: 'white', fontSize: '12px', fontWeight: '500' }}>
                            {supabaseConnected ? '✅ Database Connected' : '❌ Database Disconnected'}
                        </div>
                        <button onClick={onLogout} style={styles.logoutButton}>Logout</button>
                    </div>
                </div>
            </header>
            <nav style={styles.nav}>
                <button style={navButton(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>🔧 Dashboard</button>
                <button style={navButton(activeTab === 'customers')} onClick={() => setActiveTab('customers')}>👥 Customers</button>
                <button style={navButton(activeTab === 'jobs')} onClick={() => setActiveTab('jobs')}>📋 Jobs {activeJobCount > 0 && `(${activeJobCount})`}</button>
                <button style={navButton(activeTab === 'inventory')} onClick={() => setActiveTab('inventory')}>
                    📦 Inventory {lowStockCount > 0 && <span style={{ backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', marginLeft: '8px' }}>{lowStockCount}</span>}
                </button>
            </nav>
            <main style={styles.main}>
                {activeTab === 'dashboard' && <DashboardPlaceholder styles={styles} />}
                {activeTab === 'customers' && <CustomerManagement styles={styles} />}
                {activeTab === 'jobs' && <ProjectManagement styles={styles} onProjectUpdate={fetchActiveJobCount} />}
                {activeTab === 'inventory' && <InventoryManagement styles={styles} onInventoryUpdate={fetchLowStockCount} />}
            </main>
        </div>
    );
}

// Keeping the original dashboard here for simplicity, can be moved to its own file later.
function DashboardPlaceholder({ styles }) {
    return (
        <div>
            <h2 style={styles.dashboardTitle}>Dashboard</h2>
            <div style={styles.card}>
                <p>Management dashboard summary coming soon...</p>
            </div>
        </div>
    )
}

export default ManagementView; 