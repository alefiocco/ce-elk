'use client'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { LOCALI, calcolaTuttiCE, fmt, pct, VOCI_CE } from '@/lib/ceLogic'
import CETable from './CETable'

export default function ClientApp({ user }) {
  const [mesi,        setMesi]       = useState([])
  const [meseAttivo,  setMeseAttivo] = useState(null)
  const [datiMese,    setDatiMese]   = useState(null)
  const [activeLocale,setLocale]     = useState('tot')
  const [loading,     setLoading]    = useState(true)
  const sb = getSupabase()

  useEffect(() => {
    sb.from('mesi').select('id,mese,label,pubblicato_at')
      .order('mese', { ascending: false })
      .then(({ data }) => {
        setMesi(data||[])
        if (data?.length) setMeseAttivo(data[0])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!meseAttivo) return
    setDatiMese(null)
    sb.from('mesi').select('*').eq('id', meseAttivo.id).single()
      .then(({ data }) => setDatiMese(data))
  }, [meseAttivo])

  async function handleLogout() {
    try { await sb.auth.signOut() } catch {}
    window.location.href = window.location.pathname
  }

  async function exportPDF() {
    if (!datiMese) return
    const { default: jsPDF }    = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const localeLabel = LOCALI.find(l=>l.id===activeLocale)?.label || 'Totale'
    doc.setFont('helvetica','bold'); doc.setFontSize(13)
    doc.text(`CE Riclassificato — ${datiMese.label} — ${localeLabel}`, 14, 16)
    doc.setFontSize(8); doc.setFont('helvetica','normal')
    doc.setTextColor(120,120,120)
    doc.text(`Generato il ${new Date().toLocaleDateString('it-IT')}`, 14, 22)
    doc.setTextColor(0,0,0)
    const ce = calcolaTuttiCE(datiMese.dati_ce||{}, datiMese.extra_scritture||[], datiMese.alloc_conf||{}, datiMese.cespiti||{})
    const { vals } = ce[activeLocale] || ce['tot']
    const ricavi = Math.abs(vals[100]||0)
    const rows = VOCI_CE.map(v => {
      const val = vals[v.cod]??0
      return [typeof v.cod==='number'?String(v.cod):'', v.label, val===0?'—':fmt(val), val===0?'—':pct(val,ricavi)]
    })
    autoTable(doc, {
      startY: 28,
      head: [['Cod','Voce','Importo €','% Ricavi']],
      body: rows,
      styles: { font:'helvetica', fontSize:8, cellPadding:2 },
      headStyles: { fillColor:[17,22,32], textColor:[255,255,255], fontStyle:'bold' },
      columnStyles: { 0:{cellWidth:12}, 1:{cellWidth:100}, 2:{cellWidth:28,halign:'right'}, 3:{cellWidth:20,halign:'right'} },
    })
    doc.save(`CE_${datiMese.mese}_${activeLocale}.pdf`)
  }

  const ce        = datiMese ? calcolaTuttiCE(datiMese.dati_ce||{}, datiMese.extra_scritture||[], datiMese.alloc_conf||{}, datiMese.cespiti||{}) : null
  const ceLocale  = ce ? (ce[activeLocale]||ce['tot']) : null
  const ceAP      = datiMese?.dati_anno_prec  && Object.keys(datiMese.dati_anno_prec).length  ? calcolaTuttiCE(datiMese.dati_anno_prec, [], {}, {}) : null
  const ceBil     = datiMese?.dati_bilancio   && Object.keys(datiMese.dati_bilancio).length   ? calcolaTuttiCE(datiMese.dati_bilancio,  [], {}, {}) : null
  const vals      = ceLocale?.vals || {}
  const ricavi    = Math.abs(vals[100]||0)
  const ebit      = vals['EBIT']||0
  const rn        = vals['RN']||0

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center', gap:12, fontFamily:'var(--font-ui)' }}>
      <div style={{ width:20, height:20, border:'2px solid var(--border-02)', borderTop:'2px solid var(--blue)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
      <span style={{ color:'var(--text-03)', fontSize:13 }}>Caricamento…</span>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', fontFamily:'var(--font-ui)', color:'var(--text)' }}>

      {/* ── HEADER ── */}
      <header style={{
        background:'var(--surface)', borderBottom:'1px solid var(--border)',
        padding:'0 24px', height:56, display:'flex', alignItems:'center',
        justifyContent:'space-between', position:'sticky', top:0, zIndex:10,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:18 }}>📊</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600, lineHeight:1.2 }}>CE Riclassificato</div>
              <div style={{ fontSize:10, color:'var(--text-03)' }}>Studio FNP</div>
            </div>
          </div>
          <div style={{ width:1, height:24, background:'var(--border)' }}/>
          {/* Locale tabs */}
          <div style={{ display:'flex', gap:4 }}>
            {LOCALI.map(l=>(
              <button key={l.id} className={`locale-tab${activeLocale===l.id?' active':''}`}
                onClick={()=>setLocale(l.id)}>{l.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {datiMese && (
            <button className="btn btn-success" onClick={exportPDF}>
              ⬇ PDF
            </button>
          )}
          <button className="btn btn-ghost" onClick={handleLogout}>Esci</button>
        </div>
      </header>

      <main style={{ maxWidth:1100, margin:'0 auto', padding:'24px 20px' }}>

        {/* ── MONTH SELECTOR ── */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:24 }}>
          {mesi.map(m=>(
            <button key={m.id}
              onClick={()=>setMeseAttivo(m)}
              style={{
                padding:'6px 14px', borderRadius:6, fontSize:12, fontWeight:500,
                cursor:'pointer', fontFamily:'var(--font-ui)',
                border:`1px solid ${meseAttivo?.id===m.id?'rgba(59,130,246,0.4)':'var(--border)'}`,
                background:meseAttivo?.id===m.id?'var(--blue-dim)':'var(--surface)',
                color:meseAttivo?.id===m.id?'var(--blue)':'var(--text-02)',
                transition:'all 0.15s',
              }}>
              {m.label||m.mese}
            </button>
          ))}
          {mesi.length===0 && (
            <p style={{ color:'var(--text-03)', fontSize:13 }}>Nessun mese pubblicato ancora.</p>
          )}
        </div>

        {ceLocale && (<>
          {/* ── METRIC CARDS ── */}
          <div className="metric-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
            <div className={`metric-card ${ricavi>0?'neutral':'neutral'}`}>
              <div className="label">Ricavi netti</div>
              <div className="value" style={{ color:'var(--blue)' }}>{fmt(ricavi)}</div>
              <div className="sub">Totale vendite mese</div>
            </div>
            <div className={`metric-card ${ebit>=0?'positive':'negative'}`}>
              <div className="label">EBIT</div>
              <div className="value">{fmt(ebit)}</div>
              <div className="sub">{ricavi>0?pct(ebit,ricavi)+' dei ricavi':'Risultato operativo'}</div>
            </div>
            <div className={`metric-card ${rn>=0?'positive':'negative'}`}>
              <div className="label">Risultato netto</div>
              <div className="value">{fmt(rn)}</div>
              <div className="sub">{ricavi>0?pct(rn,ricavi)+' dei ricavi':'Dopo imposte stimate'}</div>
            </div>
            <div className="metric-card neutral">
              <div className="label">Pubblicato</div>
              <div className="value" style={{ color:'var(--text)', fontSize:16 }}>
                {datiMese?.pubblicato_at ? new Date(datiMese.pubblicato_at).toLocaleDateString('it-IT',{day:'2-digit',month:'short'}) : '—'}
              </div>
              <div className="sub">{datiMese?.label}</div>
            </div>
          </div>

          {/* ── CE TABLE ── */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <h2 style={{ fontSize:14, fontWeight:600, marginBottom:2 }}>Conto Economico Riclassificato</h2>
                <p style={{ fontSize:11, color:'var(--text-03)' }}>{datiMese?.label} · {LOCALI.find(l=>l.id===activeLocale)?.label}</p>
              </div>
            </div>
            <CETable
              vals={ceLocale.vals}
              gruppi={null}
              valsAP={ceAP?(ceAP[activeLocale]||ceAP['tot']).vals:null}
              valsBil={ceBil?(ceBil[activeLocale]||ceBil['tot']).vals:null}
              annoPrecName={datiMese?.dati_anno_prec&&Object.keys(datiMese.dati_anno_prec).length?"Anno precedente":null}
              bilancioName={datiMese?.dati_bilancio&&Object.keys(datiMese.dati_bilancio).length?"Bilancio approvato":null}
              onDrillVoce={null}
            />
          </div>
        </>)}

        {!ceLocale && meseAttivo && (
          <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-03)', fontSize:13 }}>
            <div style={{ fontSize:32, marginBottom:12 }}>⏳</div>
            Caricamento dati…
          </div>
        )}
      </main>
    </div>
  )
}
