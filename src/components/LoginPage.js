'use client'
import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export default function LoginPage({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const sb = getSupabase()
      const { data, error: authError } = await sb.auth.signInWithPassword({ email, password })
      if (authError) { setError('Credenziali non valide.'); setLoading(false); return }
      if (!data?.user) { setError('Errore autenticazione.'); setLoading(false); return }
      const { data: profile, error: pe } = await sb.from('profiles').select('ruolo').eq('id', data.user.id).single()
      if (pe || !profile) { setError('Profilo non trovato.'); setLoading(false); return }
      if (onLogin) onLogin(data.user, profile.ruolo)
      else window.location.reload()
    } catch(err) {
      setError('Errore di connessione: ' + err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-ui)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
      }}/>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 600, height: 300,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', width: 'min(420px, 92vw)' }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--blue-dim)',
            border: '1px solid rgba(59,130,246,0.2)',
            marginBottom: 16,
            fontSize: 22,
          }}>📊</div>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', color: 'var(--text-03)', textTransform: 'uppercase', marginBottom: 6 }}>
            Studio FNP
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            CE Riclassificato
          </h1>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-02)', marginBottom: 24 }}>
            Accedi per visualizzare il conto economico
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-03)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Email
              </label>
              <input className="input" type="email" value={email}
                onChange={e=>setEmail(e.target.value)} required autoFocus
                placeholder="nome@esempio.it"/>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-03)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Password
              </label>
              <input className="input" type="password" value={password}
                onChange={e=>setPassword(e.target.value)} required
                placeholder="••••••••"/>
            </div>

            {error && (
              <div className="status-bar error">
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: 13, marginTop: 4 }}>
              {loading ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }}/>
                  Accesso in corso…
                </>
              ) : 'Accedi'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-04)', marginTop: 20 }}>
          Accesso riservato · Studio FNP
        </p>
      </div>
    </div>
  )
}
