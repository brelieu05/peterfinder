import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Example: Fetch data from database
  // const { data: items } = await supabase.from('your_table').select('*')

  return (
    <div>
      <h2 className="text-xl font-bold">Server Component Example</h2>
      <p>User: {user ? user.email : 'Not logged in'}</p>
    </div>
  )
}
