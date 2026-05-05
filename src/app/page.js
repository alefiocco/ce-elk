'use client'
import { useState, useEffect, dynamic } from 'react'
import { getSupabase } from '@/lib/supabase'
import dynamic_import from 'next/dynamic'

const LoginPage = dynamic_import(() => import('@/components/LoginPage'), { ssr: false })
const AdminApp  = dynamic_import(() => import('@/components/AdminApp'),  { ssr: false })
const ClientApp = dynamic_import(() => import('@/components/ClientApp'), { ssr: false })

export default function Home() {
  const [state,   setState]   = useState('loading')
  const [userObj, setUserObj] = useState(null)

  useEffect(() => {
    const sb = getSupabase()
    let mounted = true

    async function loadRuolo(user) {
      try {
        const { data, error } = await sb
          .from('profiles').select('ruolo').eq('id', user.id).single()
        if (!mounted) return
        if (error || !data) { setState('login'); return }
        setUserObj(user)
        setState(data.ruolo === 'admin' ? 'admin' : 'cliente')
      } catch {
        if (mounted) setState('login')
      }
    }

    async function init() {
      const t = setTimeout(() => { if (mounted) setState('login') }, 8000)
      try {
        const { data: { session } } = await sb.auth.getSession()
        clearTimeout(t)
        if (!mounted) return
        if (!session) { setState('login'); return }
        await loadRuolo(session.user)
      } catch {
        clearTimeout(t)
        if (mounted) setState('login')
      }
    }

    init()

    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT' || !session) { setState('login'); setUserObj(null); return }
    })

    return () => { mounted = false; subscription.unsubscribe() }
  }, [])

  function handleLogin(user, ruolo) {
    setUserObj(user)
    setState(ruolo === 'admin' ? 'admin' : 'cliente')
  }

  if (state === 'loading') return (
    <div style={{ minHeight:'100vh', background:'#0f1117', display:'flex',
      flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:32, height:32, border:'3px solid #2a3050',
        borderTop:'3px solid #4f8ef7', borderRadius:'50%',
        animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <span style={{ color:'#4a5270', fontFamily:'monospace', fontSize:11 }}>Caricamento…</span>
    </div>
  )

  if (state === 'login')   return <LoginPage onLogin={handleLogin} />
  if (state === 'admin')   return <AdminApp  user={userObj} />
  if (state === 'cliente') return <ClientApp user={userObj} />
  return <LoginPage onLogin={handleLogin} />
}
