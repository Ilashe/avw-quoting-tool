import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SplashScreen from '@/components/SplashScreen'

export default async function SplashPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <SplashScreen />
}
