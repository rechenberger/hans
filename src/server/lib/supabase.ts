import { createClient } from '@supabase/supabase-js'
import { env } from '~/env.mjs'

// Create a single supabase client for interacting with your database
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_API_KEY)

// export const testSupabase = async () => {
//   let response = await supabase.from('Node').select('id')
//   console.log(response)
// }
