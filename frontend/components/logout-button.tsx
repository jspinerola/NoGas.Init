'use client'

import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    try {
      await supabase.auth.signOut()
    } finally {
      localStorage.removeItem("garage_vehicles")
      localStorage.removeItem("garage_services")
      router.push('/auth/login')
    }
  }

  return <Button onClick={logout}>Logout</Button>
}
