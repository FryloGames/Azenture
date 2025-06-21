import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Test connection function
export const testConnection = async () => {
  try {
    // Simple test - just try to connect to Supabase
    const { data, error } = await supabase.from('customers').select('*').limit(1)
    if (error) {
      console.error('Supabase connection error:', error.message)
      // If it's just a table/permission issue, we're still connected
      if (error.message.includes('relation "customers" does not exist') || 
          error.message.includes('permission denied') ||
          error.message.includes('failed to parse')) {
        console.log('✅ Supabase connected (but customers table needs setup)')
        return true
      }
      return false
    }
    console.log('✅ Supabase connected successfully!')
    return true
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message)
    return false
  }
}