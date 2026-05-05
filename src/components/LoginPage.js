'use client'
import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'

const C = {
  bg:'#0f1117', surface:'#181c27', border:'#2a3050',
  accent:'#4f8ef7', text:'#e8ecf5', textMid:'#8b95b0',
  red:'#f76b6b', redDim:'#3d1010',
}

export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const sb = getSupabase()
      const { data, error: authError } = await sb.auth.signInWithPassword({ email, password })

      if (authError) {
        setError('Credenziali non valide. Riprova.')
        setLoading(false)
        return
      }

      if (!data?.user) {
        setError('Errore di autenticazione. Riprova.')
        setLoading(false)
        return
      }

      // Carica ruolo direttamente dopo il login
      const { data: profile, error: profileError } = await sb
        .from('profiles')
        .select('ruolo')
        .eq('id', data.user.id)
        .single()

      if (profileError || !profile) {
        setError('Errore nel caricamento del profilo. Contatta il commercialista.')
        setLoading(false)
        return
      }

      // Passa il risultato al parent tramite callback
      if (onLogin) {
        onLogin(data.user, profile.ruolo)
      } else {
        window.location.reload()
      }

    } catch (err) {
      setError('Errore di connessione: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex',
      alignItems:'center', justifyContent:'center',
      fontFamily:"'IBM Plex Mono','Courier New',monospace" }}>
      <div style={{ background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:12, padding:36, width:'min(400px,92vw)',
        boxShadow:'0 24px 80px #000c' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:10, color:'#4a5270', letterSpacing:'0.15em', marginBottom:6 }}>
            CONTO ECONOMICO RICLASSIFICATO
          </div>
          <div style={{ fontSize:22, fontWeight:700, color:C.text }}>Accedi</div>
        </div>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom:14 }}>
            <label style={{ color:C.textMid, fontSize:11, display:'block', marginBottom:4 }}>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus
              style={{ width:'100%', background:'#1e2334', border:`1px solid ${C.border}`,
                borderRadius:6, padding:'9px 12px', color:C.text, fontSize:13,
                outline:'none', boxSizing:'border-box' }}/>
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ color:C.textMid, fontSize:11, display:'block', marginBottom:4 }}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              style={{ width:'100%', background:'#1e2334', border:`1px solid ${C.border}`,
                borderRadius:6, padding:'9px 12px', color:C.text, fontSize:13,
                outline:'none', boxSizing:'border-box' }}/>
          </div>
          {error && (
            <div style={{ background:C.redDim, border:'1px solid #f76b6b44',
              borderRadius:6, padding:'8px 12px', color:C.red, fontSize:11, marginBottom:16 }}>
              {error}
            </div>
          )}
          <button type="submit" disabled={loading}
            style={{ width:'100%', background:C.accent, border:'none',
              borderRadius:7, padding:'11px', color:'#fff', fontSize:13, fontWeight:700,
              cursor:loading?'wait':'pointer', opacity:loading?0.7:1 }}>
            {loading ? 'Accesso in corso…' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  )
}
