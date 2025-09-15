import { useEffect, useRef } from 'react'
export default function useAutosave(key, value, delay=800){
  const t = useRef()
  useEffect(()=>{
    clearTimeout(t.current)
    t.current = setTimeout(() => {
      try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
    }, delay)
    return () => clearTimeout(t.current)
  }, [key, value, delay])
}
