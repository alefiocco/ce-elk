'use client'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import LoginPage from '@/components/LoginPage'
import AdminApp  from '@/components/AdminApp'
import ClientApp from '@/components/ClientApp'

export default function Home() {
  const [session, setSession] = useState(null)
  const [ruolo,   setRuolo]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = getSupabase()
    sb.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) await loadRuolo(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) await loadRuolo(session.user.id)
      else { setRuolo(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadRuolo(userId) {
    const sb = getSupabase()
    const { data } = await sb.from('profiles').select('ruolo').eq('id', userId).single()
    setRuolo(data?.ruolo || 'cliente')
    setLoading(false)
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0f1117',display:'flex',
      alignItems:'center',justifyContent:'center',color:'#8b95b0',
      fontFamily:'monospace',fontSize:13}}>
      Caricamento…
    </div>
  )

  if (!session) return <LoginPage />

  return ruolo === 'admin'
    ? <AdminApp user={session.user} />
    : <ClientApp user={session.user} />
}
