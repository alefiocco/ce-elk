'use client'
import { useState, useEffect, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import { LOCALI, calcolaTuttiCE } from '@/lib/ceLogic'
import CETable from './CETable'

const C = {
  bg:'#0f1117', surface:'#181c27', surfaceHigh:'#1e2334', border:'#2a3050',
  borderLight:'#3a4570', accent:'#4f8ef7', accentDim:'#1a2d5a',
  green:'#3ecf8e', greenDim:'#0d3d26', red:'#f76b6b', redDim:'#3d1010',
  amber:'#f5a623', purple:'#a78bfa',
  text:'#e8ecf5', textMid:'#8b95b0', textDim:'#4a5270',
}

export default function AdminApp({ user }) {
  const sb = getSupabase()
  const jsonRef = useRef()

  const [jsonData,       setJsonData]       = useState(null)
  const [jsonName,       setJsonName]       = useState(null)
  const [jsonErr,        setJsonErr]        = useState(null)
  const [activeLocale,   setLocale]         = useState('tot')
  const [publishing,     setPublishing]     = useState(false)
  const [publishMsg,     setPublishMsg]     = useState(null)
  const [mesiPubblicati, setMesiPubblicati] = useState([])

  useEffect(() => {
    sb.from('mesi').select('id,mese,label,pubblicato_at')
      .order('mese', { ascending: false }).limit(24)
      .then(({ data }) => setMesiPubblicati(data || []))
  }, [publishMsg])

  function handleJson(file) {
    setJsonErr(null)
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result)
        if (!data.mese || !data.dati_ce) {
          setJsonErr('File non valido — assicurati di esportarlo dall\'artifact CE su Claude.')
          return
        }
        setJsonData(data)
        setJsonName(file.name)
      } catch {
        setJsonErr('Errore lettura JSON — file non valido.')
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  async function handlePublish() {
    if (!jsonData) return
    setPublishing(true)
    setPublishMsg(null)
    try {
      const payload = {
        mese:            jsonData.mese,
        label:           jsonData.label,
        dati_ce:         jsonData.dati_ce,
        dati_anno_prec:  jsonData.dati_anno_prec  || {},
        dati_bilancio:   jsonData.dati_bilancio   || {},
        prima_nota:      jsonData.prima_nota      || [],
        extra_scritture: jsonData.extra_scritture || [],
        mappatura_extra: jsonData.mappatura_extra || {},
        alloc_conf:      jsonData.alloc_conf      || {},
        cespiti:         jsonData.cespiti         || {},
        pubblicato_da:   user.id,
        pubblicato_at:   new Date().toISOString(),
      }
      const existing = mesiPubblicati.find(m => m.mese === jsonData.mese)
      if (existing) {
        const { error } = await sb.from('mesi').update(payload).eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await sb.from('mesi').insert(payload)
        if (error) throw error
      }
      setPublishMsg({ ok: true, msg: `✓ ${jsonData.label} pubblicato. Il cliente può ora visualizzarlo.` })
    } catch(err) {
      setPublishMsg({ ok: false, msg: 'Errore: ' + (err.message || JSON.stringify(err)) })
    }
    setPublishing(false)
  }

  async function handleLogout() { await sb.auth.signOut() }

  const ce     = jsonData ? calcolaTuttiCE(jsonData.dati_ce || {}, jsonData.extra_scritture || [], jsonData.alloc_conf || {}, jsonData.cespiti || {}) : null
  const ceAP   = jsonData?.dati_anno_prec  && Object.keys(jsonData.dati_anno_prec).length  ? calcolaTuttiCE(jsonData.dati_anno_prec,  [], {}, {}) : null
  const ceBil  = jsonData?.dati_bilancio   && Object.keys(jsonData.dati_bilancio).length   ? calcolaTuttiCE(jsonData.dati_bilancio,   [], {}, {}) : null
  const ceLocale = ce ? (ce[activeLocale] || ce['tot']) : null

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:"'IBM Plex Mono','Courier New',monospace", color:C.text, paddingBottom:60 }}>

      {/* HEADER */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:'12px 22px',
        display:'flex', justifyContent:'space-between', alignItems:'flex-start',
        position:'sticky', top:0, zIndex:10, gap:12 }}>
        <div>
          <div style={{ fontSize:9, color:C.textDim, letterSpacing:'0.14em', marginBottom:4 }}>
            ADMIN · CONTO ECONOMICO RICLASSIFICATO
          </div>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {LOCALI.map(l => (
              <button key={l.id} onClick={() => setLocale(l.id)} style={{
                padding:'4px 10px', borderRadius:5, fontSize:10, cursor:'pointer',
                fontWeight: activeLocale===l.id ? 700 : 400,
                border:`1px solid ${activeLocale===l.id ? C.accent : C.border}`,
                background: activeLocale===l.id ? C.accentDim : 'none',
                color: activeLocale===l.id ? C.accent : C.textMid }}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:7, alignItems:'center', flexWrap:'wrap', justifyContent:'flex-end' }}>
          <button onClick={() => jsonRef.current.click()} style={{
            background: jsonName ? `${C.green}22` : C.surfaceHigh,
            border:`1px solid ${jsonName ? C.green : C.border}`, borderRadius:6,
            color: jsonName ? C.green : C.textMid, padding:'6px 13px', cursor:'pointer', fontSize:10, fontWeight:700 }}>
            {jsonName ? `✓ ${jsonName.replace('ce_','').replace('.json','')}` : '↑ Carica JSON'}
          </button>
          <input ref={jsonRef} type="file" accept=".json" style={{ display:'none' }}
            onChange={e => e.target.files[0] && handleJson(e.target.files[0])} />
          <button onClick={handlePublish} disabled={!jsonData || publishing} style={{
            background: jsonData ? C.accent : C.surfaceHigh, border:'none', borderRadius:6,
            color:'#fff', padding:'6px 16px', cursor: jsonData ? 'pointer' : 'default',
            fontSize:10, fontWeight:800, opacity: (!jsonData || publishing) ? 0.5 : 1 }}>
            {publishing ? '…' : '⬆ Pubblica'}
          </button>
          <button onClick={handleLogout} style={{ background:'none', border:`1px solid ${C.border}`,
            borderRadius:5, color:C.textMid, padding:'5px 10px', cursor:'pointer', fontSize:9 }}>
            Esci
          </button>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:'0 auto', padding:'20px 16px' }}>

        {publishMsg && (
          <div style={{ background: publishMsg.ok ? C.greenDim : C.redDim,
            border:`1px solid ${publishMsg.ok ? C.green : C.red}`,
            borderRadius:8, padding:'10px 16px', marginBottom:14,
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color: publishMsg.ok ? C.green : C.red, fontSize:11 }}>{publishMsg.msg}</span>
            <button onClick={() => setPublishMsg(null)} style={{ background:'none', border:'none',
              color: publishMsg.ok ? C.green : C.red, cursor:'pointer', fontSize:14 }}>×</button>
          </div>
        )}
        {jsonErr && (
          <div style={{ background:C.redDim, border:`1px solid ${C.red}`, borderRadius:8,
            padding:'8px 14px', marginBottom:12, color:C.red, fontSize:10 }}>
            {jsonErr}
          </div>
        )}

        {mesiPubblicati.length > 0 && (
          <div style={{ marginBottom:16, display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ color:C.textDim, fontSize:9 }}>Già pubblicati:</span>
            {mesiPubblicati.map(m => (
              <span key={m.id} style={{ background:C.surfaceHigh, border:`1px solid ${C.border}`,
                borderRadius:4, padding:'2px 8px', fontSize:9, color:C.textMid }}>
                {m.label || m.mese}
              </span>
            ))}
          </div>
        )}

        {!jsonData && (
          <div onClick={() => jsonRef.current.click()}
            onDrop={e => { e.preventDefault(); e.dataTransfer.files[0] && handleJson(e.dataTransfer.files[0]) }}
            onDragOver={e => e.preventDefault()}
            style={{ border:`2px dashed ${C.borderLight}`, borderRadius:12,
              padding:'52px 24px', textAlign:'center', cursor:'pointer', marginBottom:20 }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📂</div>
            <div style={{ color:C.text, fontSize:14, marginBottom:6 }}>
              Trascina il file JSON esportato dall'artifact
            </div>
            <div style={{ color:C.textDim, fontSize:10 }}>
              Il file si chiama{' '}
              <span style={{ color:C.accent }}>ce_AAAA-MM.json</span> —
              generalo con ⬇ Esporta JSON nell'artifact su Claude
            </div>
          </div>
        )}

        {jsonData && (
          <div style={{ background:C.surfaceHigh, borderRadius:8, padding:'10px 16px',
            marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <span style={{ color:C.text, fontWeight:700, fontSize:13 }}>{jsonData.label}</span>
              <span style={{ color:C.textDim, fontSize:10, marginLeft:12 }}>
                {jsonData.prima_nota?.length || 0} fatture ·{' '}
                {jsonData.extra_scritture?.length || 0} scritture extra ·{' '}
                esportato il {new Date(jsonData.esportato_at).toLocaleDateString('it-IT')}
              </span>
            </div>
            <button onClick={() => { setJsonData(null); setJsonName(null) }}
              style={{ background:'none', border:'none', color:C.textDim, cursor:'pointer', fontSize:11 }}>
              × rimuovi
            </button>
          </div>
        )}

        {ceLocale && (
          <>
            <CETable
              vals={ceLocale.vals}
              gruppi={ceLocale.gruppi}
              valsAP={ceAP ? (ceAP[activeLocale] || ceAP['tot']).vals : null}
              valsBil={ceBil ? (ceBil[activeLocale] || ceBil['tot']).vals : null}
              annoPrecName={jsonData?.dati_anno_prec && Object.keys(jsonData.dati_anno_prec).length ? "Anno precedente" : null}
              bilancioName={jsonData?.dati_bilancio && Object.keys(jsonData.dati_bilancio).length ? "Bilancio approvato" : null}
              onDrillVoce={null}
            />
            <div style={{ marginTop:8, color:C.textDim, fontSize:9, textAlign:'center' }}>
              Anteprima del CE · clicca ⬆ Pubblica per renderlo visibile al cliente
            </div>
          </>
        )}
      </div>
    </div>
  )
}
