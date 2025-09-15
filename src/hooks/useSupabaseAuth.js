import { useEffect, useState } from 'react'
import { createSupabase } from '../services/supabaseClient.js'

export default function useSupabaseAuth(){
  const [user, setUser] = useState(null)
  useEffect(()=>{
    const sb = createSupabase()
    if (!sb) return
    let mounted = true
    ;(async()=>{
      try {
        const { data } = await sb.auth.getUser()
        if (mounted) setUser(data?.user || null)
      } catch {}
    })()
    return () => { mounted = false }
  }, [])
  return user
}
