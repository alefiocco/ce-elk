'use client'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { LOCALI, calcolaTuttiCE, fmt } from '@/lib/ceLogic'
import CETable from './CETable'

const C = {
  bg:'#0f1117', surface:'#181c27', surfaceHigh:'#1e2334', border:'#2a3050',
  accent:'#4f8ef7', text:'#e8ecf5', textMid:'#8b95b0', textDim:'#4a5270',
  green:'#3ecf8e', red:'#f76b6b',
}

export default function ClientApp({ user }) {
  const [mesi,         setMesi]        = useState([])
  const [meseAttivo,   setMeseAttivo]  = useState(null)
  const [activeLocale, setLocale]      = useState('tot')
  const [loading,      setLoading]     = useState(true)

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

  // Load full data when month changes
  const [datiMese, setDatiMese] = useState(null)
  useEffect(() => {
    if (!meseAttivo) return
    setDatiMese(null)
    sb.from('mesi').select('*').eq('id', meseAttivo.id).single()
      .then(({ data }) => setDatiMese(data))
  }, [meseAttivo])

  async function handleLogout() {
    await sb.auth.signOut()
  }

  async function exportPDF() {
    if (!datiMese) return
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const localeLabel = LOCALI.find(l=>l.id===activeLocale)?.label || 'Totale'
    const titolo = `CE Riclassificato — ${datiMese.label} — ${localeLabel}`

    doc.setFont('helvetica','bold')
    doc.setFontSize(13)
    doc.text(titolo, 14, 16)
    doc.setFontSize(8)
    doc.setFont('helvetica','normal')
    doc.setTextColor(120,120,120)
    doc.text(`Generato il ${new Date().toLocaleDateString('it-IT')}`, 14, 22)
    doc.setTextColor(0,0,0)

    const ce = calcolaTuttiCE(
      datiMese.dati_ce || {},
      datiMese.extra_scritture || [],
      datiMese.alloc_conf || {},
      datiMese.cespiti || {}
    )
    const { vals } = ce[activeLocale] || ce['tot']
    const ricavi = Math.abs(vals[100]||0)

    const { VOCI_CE, pct } = await import('@/lib/ceLogic')
    const rows = []
    for (const voce of VOCI_CE) {
      const v = vals[voce.cod] ?? 0
      const isResult = voce.tipo==='result'
      const isSubtot = voce.tipo==='subtot'
      rows.push([
        typeof voce.cod === 'number' ? String(voce.cod) : '',
        voce.label,
        v===0 ? '—' : fmt(v),
        v===0 ? '—' : pct(v, ricavi),
      ])
    }

    autoTable(doc, {
      startY: 28,
      head: [['Cod', 'Voce', 'Importo €', '% Ricavi']],
      body: rows,
      styles: { font:'helvetica', fontSize:8, cellPadding:2 },
      headStyles: { fillColor:[30,35,52], textColor:[255,255,255], fontStyle:'bold' },
      columnStyles: {
        0: { cellWidth:12, fontStyle:'normal', textColor:[100,100,120] },
        1: { cellWidth:100 },
        2: { cellWidth:28, halign:'right' },
        3: { cellWidth:20, halign:'right', textColor:[100,100,120] },
      },
      alternateRowStyles: { fillColor:[245,246,250] },
    })

    doc.save(`CE_${datiMese.mese}_${activeLocale}.pdf`)
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:C.bg,display:'flex',
      alignItems:'center',justifyContent:'center',color:C.textMid,fontFamily:'monospace'}}>
      Caricamento…
    </div>
  )

  const ce = datiMese ? calcolaTuttiCE(
    datiMese.dati_ce||{},
    datiMese.extra_scritture||[],
    datiMese.alloc_conf||{},
    datiMese.cespiti||{}
  ) : null

  const ceLocale = ce ? (ce[activeLocale]||ce['tot']) : null
  const apData   = datiMese?.dati_anno_prec  || {}
  const bilData  = datiMese?.dati_bilancio   || {}
  const ceAP  = apData  && Object.keys(apData).length  ? calcolaTuttiCE(apData, [], {}, {}) : null
  const ceBil = bilData && Object.keys(bilData).length ? calcolaTuttiCE(bilData,[],{},{}) : null

  return (
    <div style={{minHeight:'100vh',background:C.bg,
      fontFamily:"'IBM Plex Mono','Courier New',monospace",color:C.text,paddingBottom:60}}>

      {/* Header */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,
        padding:'14px 24px',display:'flex',justifyContent:'space-between',
        alignItems:'center',position:'sticky',top:0,zIndex:10}}>
        <div>
          <div style={{fontSize:9,color:C.textDim,letterSpacing:'0.14em',marginBottom:4}}>
            CONTO ECONOMICO RICLASSIFICATO
          </div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {LOCALI.map(l=>(
              <button key={l.id} onClick={()=>setLocale(l.id)} style={{
                padding:'4px 11px',borderRadius:5,fontSize:10,cursor:'pointer',
                fontWeight:activeLocale===l.id?700:400,
                border:`1px solid ${activeLocale===l.id?C.accent:C.border}`,
                background:activeLocale===l.id?'#1a2d5a':'none',
                color:activeLocale===l.id?C.accent:C.textMid}}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {datiMese && (
            <button onClick={exportPDF} style={{background:'#0d3d26',
              border:`1px solid ${C.green}`,borderRadius:6,color:C.green,
              padding:'6px 14px',cursor:'pointer',fontSize:10,fontWeight:700}}>
              ⬇ PDF
            </button>
          )}
          <button onClick={handleLogout} style={{background:'none',
            border:`1px solid ${C.border}`,borderRadius:6,color:C.textMid,
            padding:'6px 12px',cursor:'pointer',fontSize:10}}>
            Esci
          </button>
        </div>
      </div>

      <div style={{maxWidth:900,margin:'0 auto',padding:'24px 18px'}}>

        {/* Selettore mese */}
        <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:20}}>
          {mesi.map(m=>(
            <button key={m.id} onClick={()=>setMeseAttivo(m)} style={{
              padding:'6px 14px',borderRadius:6,fontSize:11,cursor:'pointer',
              fontWeight:meseAttivo?.id===m.id?700:400,
              border:`1px solid ${meseAttivo?.id===m.id?C.accent:C.border}`,
              background:meseAttivo?.id===m.id?'#1a2d5a':'none',
              color:meseAttivo?.id===m.id?C.accent:C.textMid}}>
              {m.label||m.mese}
            </button>
          ))}
          {mesi.length===0 && (
            <div style={{color:C.textDim,fontSize:12}}>
              Nessun mese pubblicato ancora.
            </div>
          )}
        </div>

        {/* CE Table */}
        {ceLocale ? (
          <CETable
            vals={ceLocale.vals}
            gruppi={null}
            valsAP={ceAP?(ceAP[activeLocale]||ceAP['tot']).vals:null}
            valsBil={ceBil?(ceBil[activeLocale]||ceBil['tot']).vals:null}
            annoPrecName={Object.keys(apData).length?"Anno precedente":null}
            bilancioName={Object.keys(bilData).length?"Bilancio approvato":null}
            onDrillVoce={null}
          />
        ) : meseAttivo ? (
          <div style={{color:C.textDim,fontSize:12,textAlign:'center',padding:40}}>
            Caricamento dati…
          </div>
        ) : null}

        {ceLocale && (
          <div style={{marginTop:10,color:C.textDim,fontSize:9,textAlign:'center'}}>
            Dati pubblicati il {new Date(datiMese.pubblicato_at).toLocaleDateString('it-IT')}
          </div>
        )}
      </div>
    </div>
  )
}
