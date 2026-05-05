'use client'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { LOCALI, calcolaTuttiCE, fmt, pct, VOCI_CE } from '@/lib/ceLogic'
import CETable from './CETable'

export default function ClientApp({ user }) {
  const [mesi,          setMesi]         = useState([])
  const [meseAttivo,    setMeseAttivo]   = useState(null)
  const [meseConfronto, setMeseConfronto]= useState(null)
  const [datiMese,      setDatiMese]     = useState(null)
  const [datiConfronto, setDatiConfronto]= useState(null)
  const [activeLocale,  setLocale]       = useState('tot')
  const [loading,       setLoading]      = useState(true)
  const sb = getSupabase()

  useEffect(() => {
    sb.from('mesi').select('id,mese,label,tipo,data_inizio,data_fine,pubblicato_at')
      .order('data_fine', { ascending: false })
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

  useEffect(() => {
    if (!meseConfronto) { setDatiConfronto(null); return }
    sb.from('mesi').select('*').eq('id', meseConfronto.id).single()
      .then(({ data }) => setDatiConfronto(data))
  }, [meseConfronto])

  async function handleLogout() {
    try { await sb.auth.signOut() } catch {}
    window.location.href = window.location.pathname
  }

  async function exportPDF() {
    if (!datiMese) return
    const { default: jsPDF }     = await import('jspdf')
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
      startY:28, head:[['Cod','Voce','Importo €','% Ricavi']], body:rows,
      styles:{font:'helvetica',fontSize:8,cellPadding:2},
      headStyles:{fillColor:[17,22,32],textColor:[255,255,255],fontStyle:'bold'},
      columnStyles:{0:{cellWidth:12},1:{cellWidth:100},2:{cellWidth:28,halign:'right'},3:{cellWidth:20,halign:'right'}},
    })
    doc.save(`CE_${datiMese.mese}_${activeLocale}.pdf`)
  }

  const tipoLabel = (m) => m?.tipo === 'ytd' ? 'YTD' : 'M'

  const ce       = datiMese    ? calcolaTuttiCE(datiMese.dati_ce||{}, datiMese.extra_scritture||[], datiMese.alloc_conf||{}, datiMese.cespiti||{}) : null
  const ceConf   = datiConfronto ? calcolaTuttiCE(datiConfronto.dati_ce||{}, datiConfronto.extra_scritture||[], datiConfronto.alloc_conf||{}, datiConfronto.cespiti||{}) : null
  const ceLocale = ce ? (ce[activeLocale]||ce['tot']) : null
  const vals     = ceLocale?.vals || {}
  const ricavi   = Math.abs(vals[100]||0)
  const ebit     = vals['EBIT']||0
  const rn       = vals['RN']||0

  // Periodi disponibili per il confronto (escluso quello attivo)
  const periodi_confronto = mesi.filter(m => m.id !== meseAttivo?.id)

  if (loading) return (
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',gap:12,fontFamily:'var(--font-ui)'}}>
      <div style={{width:20,height:20,border:'2px solid var(--border-02)',borderTop:'2px solid var(--blue)',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/>
      <span style={{color:'var(--text-03)',fontSize:13}}>Caricamento…</span>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'var(--bg)',fontFamily:'var(--font-ui)',color:'var(--text)'}}>

      {/* HEADER */}
      <header style={{background:'var(--surface)',borderBottom:'1px solid var(--border)',
        padding:'0 24px',height:56,display:'flex',alignItems:'center',
        justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:18}}>📊</span>
            <div>
              <div style={{fontSize:13,fontWeight:600,lineHeight:1.2}}>CE Riclassificato</div>
              <div style={{fontSize:10,color:'var(--text-03)'}}>Studio FNP</div>
            </div>
          </div>
          <div style={{width:1,height:24,background:'var(--border)'}}/>
          <div style={{display:'flex',gap:4}}>
            {LOCALI.map(l=>(
              <button key={l.id} className={`locale-tab${activeLocale===l.id?' active':''}`}
                onClick={()=>setLocale(l.id)}>{l.label}</button>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {datiMese && <button className="btn btn-success" onClick={exportPDF}>⬇ PDF</button>}
          <button className="btn btn-ghost" onClick={handleLogout}>Esci</button>
        </div>
      </header>

      <main style={{maxWidth:1100,margin:'0 auto',padding:'24px 20px'}}>

        {/* SELETTORI PERIODO */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>

          {/* Periodo principale */}
          <div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:'0.08em',color:'var(--text-03)',
              textTransform:'uppercase',marginBottom:8}}>Periodo</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {mesi.map(m=>(
                <button key={m.id} onClick={()=>setMeseAttivo(m)} style={{
                  padding:'6px 12px',borderRadius:6,fontSize:12,fontWeight:500,
                  cursor:'pointer',fontFamily:'var(--font-ui)',
                  border:`1px solid ${meseAttivo?.id===m.id?'rgba(59,130,246,0.4)':'var(--border)'}`,
                  background:meseAttivo?.id===m.id?'var(--blue-dim)':'var(--surface)',
                  color:meseAttivo?.id===m.id?'var(--blue)':'var(--text-02)',
                  transition:'all 0.15s',display:'flex',alignItems:'center',gap:5}}>
                  {m.label||m.mese}
                  {m.tipo==='ytd' && (
                    <span style={{fontSize:8,background:'var(--amber-dim)',color:'var(--amber)',
                      borderRadius:3,padding:'1px 4px'}}>YTD</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Periodo di confronto */}
          <div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:'0.08em',color:'var(--text-03)',
              textTransform:'uppercase',marginBottom:8}}>
              Confronta con
              {meseConfronto && (
                <button onClick={()=>setMeseConfronto(null)} style={{
                  marginLeft:8,background:'none',border:'none',
                  color:'var(--text-03)',cursor:'pointer',fontSize:10}}>
                  × rimuovi
                </button>
              )}
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              <button onClick={()=>setMeseConfronto(null)} style={{
                padding:'6px 12px',borderRadius:6,fontSize:12,fontWeight:500,
                cursor:'pointer',fontFamily:'var(--font-ui)',
                border:`1px solid ${!meseConfronto?'rgba(100,100,100,0.4)':'var(--border)'}`,
                background:!meseConfronto?'var(--surface-03)':'var(--surface)',
                color:!meseConfronto?'var(--text-02)':'var(--text-03)',transition:'all 0.15s'}}>
                Nessuno
              </button>
              {periodi_confronto.map(m=>(
                <button key={m.id} onClick={()=>setMeseConfronto(m)} style={{
                  padding:'6px 12px',borderRadius:6,fontSize:12,fontWeight:500,
                  cursor:'pointer',fontFamily:'var(--font-ui)',
                  border:`1px solid ${meseConfronto?.id===m.id?'rgba(139,92,246,0.4)':'var(--border)'}`,
                  background:meseConfronto?.id===m.id?'var(--purple-dim)':'var(--surface)',
                  color:meseConfronto?.id===m.id?'var(--purple)':'var(--text-02)',
                  transition:'all 0.15s',display:'flex',alignItems:'center',gap:5}}>
                  {m.label||m.mese}
                  {m.tipo==='ytd' && (
                    <span style={{fontSize:8,background:'var(--amber-dim)',color:'var(--amber)',
                      borderRadius:3,padding:'1px 4px'}}>YTD</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {ceLocale && (<>
          {/* METRIC CARDS */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
            {[
              {label:'Ricavi netti', val:ricavi, color:'var(--blue)', sub:'Totale vendite'},
              {label:'EBIT',         val:ebit,   color:ebit>=0?'var(--green)':'var(--red)',   sub:ricavi>0?pct(ebit,ricavi)+' dei ricavi':'Risultato operativo'},
              {label:'Risultato netto', val:rn,  color:rn>=0?'var(--green)':'var(--red)',     sub:ricavi>0?pct(rn,ricavi)+' dei ricavi':'Dopo imposte stimate'},
              {label:'Periodo', val:null, color:'var(--text)', sub:datiMese?.label},
            ].map(({label,val,color,sub})=>(
              <div key={label} className="metric-card">
                <div className="label">{label}</div>
                {val!==null
                  ? <div className="value" style={{color}}>{fmt(val)}</div>
                  : <div style={{fontSize:13,fontWeight:600,color,marginTop:4,lineHeight:1.3}}>{datiMese?.tipo==='ytd'?'📈 YTD':'📅 Mensile'}</div>
                }
                <div className="sub">{sub}</div>
              </div>
            ))}
          </div>

          {/* CE TABLE */}
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',
              display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <h2 style={{fontSize:14,fontWeight:600,marginBottom:2}}>Conto Economico Riclassificato</h2>
                <p style={{fontSize:11,color:'var(--text-03)'}}>
                  {datiMese?.label}
                  {datiMese?.data_inizio && datiMese?.data_fine && (
                    <span style={{marginLeft:8,color:'var(--text-04)'}}>
                      ({new Date(datiMese.data_inizio+'T12:00:00').toLocaleDateString('it-IT',{day:'2-digit',month:'short'})} –{' '}
                       {new Date(datiMese.data_fine+'T12:00:00').toLocaleDateString('it-IT',{day:'2-digit',month:'short',year:'numeric'})})
                    </span>
                  )}
                  {meseConfronto && (
                    <span style={{marginLeft:12,color:'var(--purple)'}}>
                      vs {meseConfronto.label||meseConfronto.mese}
                    </span>
                  )}
                  {' · '}{LOCALI.find(l=>l.id===activeLocale)?.label}
                </p>
              </div>
            </div>
            <CETable
              vals={ceLocale.vals}
              gruppi={null}
              valsAP={ceConf ? (ceConf[activeLocale]||ceConf['tot']).vals : null}
              valsBil={null}
              annoPrecName={meseConfronto ? (meseConfronto.label||meseConfronto.mese) : null}
              bilancioName={null}
              onDrillVoce={null}
            />
          </div>
        </>)}

        {!ceLocale && meseAttivo && (
          <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-03)',fontSize:13}}>
            <div style={{fontSize:32,marginBottom:12}}>⏳</div>Caricamento dati…
          </div>
        )}
        {mesi.length===0 && (
          <div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-03)',fontSize:13}}>
            Nessun periodo pubblicato ancora.
          </div>
        )}
      </main>
    </div>
  )
}
