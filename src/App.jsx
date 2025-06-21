import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import ManagementView from './ManagementView'
import EmployeeTimesheet from './EmployeeTimesheet'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setLoading(false)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }
  
  // Common styles
  const styles = {
    container: { minHeight: '100vh', backgroundColor: '#111827', color: 'white' },
    title: { fontSize: '24px', fontWeight: 'bold', color: '#f97316', margin: 0 },
  }

  if (loading) {
    return <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>Loading...</div>
  }

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
                  colors: { brand: '#f97316', brandAccent: '#ea580c' },
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

  // Role-based routing
  const userRole = session.user.user_metadata?.role

  if (userRole === 'employee') {
    return <EmployeeTimesheet user={session.user} onLogout={handleLogout} />
  }
  
  // Default to manager view
  return <ManagementView onLogout={handleLogout} />
}

export default App