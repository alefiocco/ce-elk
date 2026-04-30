'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import {
  LOCALI, VOCI_CE, PIANO_CONTI,
  parseTxt, aggregaPerCodice, calcolaTuttiCE,
  fmt, fmtDec, pct,
  DEFAULT_FRACS, calcolaFracCespiti, calcolaPercRicavi,
} from '@/lib/ceLogic'
import CETable from './CETable'

const C = {
  bg:'#0f1117', surface:'#181c27', surfaceHigh:'#1e2334', border:'#2a3050',
  borderLight:'#3a4570', accent:'#4f8ef7', accentDim:'#1a2d5a',
  green:'#3ecf8e', greenDim:'#0d3d26', red:'#f76b6b', redDim:'#3d1010',
  amber:'#f5a623', amberDim:'#3d2800', purple:'#a78bfa',
  text:'#e8ecf5', textMid:'#8b95b0', textDim:'#4a5270',
}
const col = n => n>=0 ? C.green : C.red
const inputStyle = {
  width:'100%', background:C.surfaceHigh, border:`1px solid ${C.border}`,
  borderRadius:6, padding:'7px 10px', color:C.text, fontSize:12,
  outline:'none', boxSizing:'border-box',
}
const selectStyle = {...inputStyle, fontSize:11}

// ─── PARSE EXCEL PRIMA NOTA ───────────────────────────────────────────────────
async function parseExcelPrimaNota(file, extraMap={}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const XLSX = window.XLSX
        const wb = XLSX.read(e.target.result, {type:'array', cellDates:true})
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:'', raw:true})
        const mergedMap = {...PIANO_CONTI, ...extraMap}
        let lastNumFattura='', lastRagioneSociale='', lastData=''
        const righeArricchite = []
        for (let i=1; i<rows.length; i++) {
          const r = rows[i]
          const numFatt = String(r[6]||'').trim()
          const ragSoc  = String(r[10]||'').trim()
          const dataDoc = String(r[5]||'').trim()
          if (numFatt) lastNumFattura = numFatt
          if (ragSoc)  lastRagioneSociale = ragSoc
          if (dataDoc) lastData = dataDoc
          righeArricchite.push({ row:r, numFattura:lastNumFattura,
            ragioneSociale:lastRagioneSociale, data:lastData })
        }
        const righeRaw = []
        for (const { row:r, numFattura, ragioneSociale, data } of righeArricchite) {
          const contoRaw = String(r[17]||'').replace(/[="'\s]/g,'')
          if (!contoRaw || !/^\d+$/.test(contoRaw)) continue
          const entry = mergedMap[contoRaw]
          if (!entry || entry.cod >= 1000) continue
          const parseImp = v => {
            if (v===''||v===null||v===undefined) return 0
            if (typeof v==='number') return v
            const s = String(v).trim()
            const lastDot=s.lastIndexOf('.'), lastComma=s.lastIndexOf(',')
            if (lastComma>lastDot) return parseFloat(s.replace(/\./g,'').replace(',','.')) || 0
            return parseFloat(s.replace(/,/g,'')) || 0
          }
          const dare=parseImp(r[20]), avere=parseImp(r[21])
          righeRaw.push({ conto:contoRaw, data, numFattura, ragioneSociale,
            dare, avere, importoCE:avere-dare })
        }
        const grouped = {}
        for (const r of righeRaw) {
          const k = `${r.numFattura}||${r.ragioneSociale}||${r.conto}`
          if (!grouped[k]) grouped[k] = {...r, dare:0, avere:0, importoCE:0}
          grouped[k].dare     += r.dare
          grouped[k].avere    += r.avere
          grouped[k].importoCE += r.importoCE
        }
        resolve(Object.values(grouped))
      } catch(err) { reject(err) }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// ─── ADMIN APP ────────────────────────────────────────────────────────────────
export default function AdminApp({ user }) {
  const sb = getSupabase()

  // Dati correnti
  const [gruppiRaw,    setGruppiRaw]    = useState({})
  const [gruppiAP,     setGruppiAP]     = useState({})
  const [gruppiBil,    setGruppiBil]    = useState({})
  const [primaNotaRaw, setPrimaNotaRaw] = useState([])
  const [extra,        setExtra]        = useState([])
  const [allocConf,    setAllocConf]    = useState({})
  const [cespiti,      setCespiti]      = useState({10:'',20:'',30:''})
  const [extraMapping, setExtraMapping] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ce_extraMapping')||'{}') } catch { return {} }
  })
  const [mese, setMese] = useState(() => {
    const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })
  const [activeLocale, setLocale] = useState('tot')

  // File names
  const [fileName,      setFileName]      = useState(null)
  const [apName,        setApName]        = useState(null)
  const [bilName,       setBilName]       = useState(null)
  const [pnName,        setPnName]        = useState(null)
  const [pnErr,         setPnErr]         = useState(null)

  // UI state
  const [publishing,    setPublishing]    = useState(false)
  const [publishMsg,    setPublishMsg]    = useState(null)
  const [mesiPubblicati,setMesiPubblicati]= useState([])

  // Refs
  const txtRef   = useRef(), apRef   = useRef()
  const bilRef   = useRef(), xlsRef  = useRef()
  const txtContent = useRef(null)

  // Load published months list
  useEffect(() => {
    sb.from('mesi').select('id,mese,label,pubblicato_at')
      .order('mese',{ascending:false}).limit(24)
      .then(({data})=>setMesiPubblicati(data||[]))
  }, [publishMsg])

  // Persist extraMapping
  useEffect(() => {
    try { localStorage.setItem('ce_extraMapping', JSON.stringify(extraMapping)) } catch {}
    if (txtContent.current) {
      setGruppiRaw(aggregaPerCodice(parseTxt(txtContent.current), extraMapping))
    }
  }, [extraMapping])

  const handleTxt = useCallback((file, setter, nameSet, isMain=false) => {
    const reader = new FileReader()
    reader.onload = e => {
      if (isMain) { txtContent.current = e.target.result }
      setter(aggregaPerCodice(parseTxt(e.target.result), extraMapping))
      nameSet(file.name)
    }
    reader.readAsText(file, 'UTF-8')
  }, [extraMapping])

  const handleXlsx = useCallback(async (file) => {
    setPnErr(null)
    try {
      const rows = await parseExcelPrimaNota(file, extraMapping)
      setPrimaNotaRaw(rows)
      setPnName(file.name)
    } catch(err) {
      setPnErr('Errore lettura Excel: '+err.message)
    }
  }, [extraMapping])

  // CE calculation
  const tuttiCE = calcolaTuttiCE(gruppiRaw, extra, allocConf, cespiti)
  const {vals, gruppi} = tuttiCE[activeLocale] || tuttiCE['tot']
  const tuttiAP  = calcolaTuttiCE(gruppiAP,  [], allocConf, cespiti)
  const tuttiBil = calcolaTuttiCE(gruppiBil, [], allocConf, cespiti)
  const valsAP  = (tuttiAP[activeLocale]  || tuttiAP['tot']).vals
  const valsBil = (tuttiBil[activeLocale] || tuttiBil['tot']).vals
  const meseFmt = mese ? new Date(mese+'-01').toLocaleDateString('it-IT',{month:'long',year:'numeric'}) : '—'

  // Publish to Supabase
  async function handlePublish() {
    if (!Object.keys(gruppiRaw).length) {
      setPublishMsg({ok:false, msg:'Carica almeno il bilancio TXT prima di pubblicare.'})
      return
    }
    setPublishing(true)
    setPublishMsg(null)
    try {
      const payload = {
        mese,
        label: meseFmt,
        dati_ce:       gruppiRaw,
        dati_anno_prec: gruppiAP,
        dati_bilancio:  gruppiBil,
        prima_nota:     primaNotaRaw,
        extra_scritture: extra,
        mappatura_extra: extraMapping,
        alloc_conf:     allocConf,
        cespiti,
        pubblicato_da:  user.id,
        pubblicato_at:  new Date().toISOString(),
      }
      // Upsert by mese (one record per month)
      const existing = mesiPubblicati.find(m=>m.mese===mese)
      if (existing) {
        await sb.from('mesi').update(payload).eq('id', existing.id)
      } else {
        await sb.from('mesi').insert(payload)
      }
      setPublishMsg({ok:true, msg:`✓ ${meseFmt} pubblicato con successo. Il cliente può ora visualizzarlo.`})
    } catch(err) {
      setPublishMsg({ok:false, msg:'Errore pubblicazione: '+err.message})
    }
    setPublishing(false)
  }

  async function handleLogout() { await sb.auth.signOut() }

  return (
    <div style={{minHeight:'100vh',background:C.bg,
      fontFamily:"'IBM Plex Mono','Courier New',monospace",color:C.text,paddingBottom:80}}>

      {/* HEADER */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,
        padding:'12px 22px',display:'flex',justifyContent:'space-between',
        alignItems:'flex-start',position:'sticky',top:0,zIndex:10,gap:12}}>
        <div>
          <div style={{fontSize:9,color:C.textDim,letterSpacing:'0.14em',marginBottom:4}}>
            ADMIN · CONTO ECONOMICO RICLASSIFICATO
          </div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {LOCALI.map(l=>(
              <button key={l.id} onClick={()=>setLocale(l.id)} style={{
                padding:'4px 10px',borderRadius:5,fontSize:10,cursor:'pointer',
                fontWeight:activeLocale===l.id?700:400,
                border:`1px solid ${activeLocale===l.id?C.accent:C.border}`,
                background:activeLocale===l.id?C.accentDim:'none',
                color:activeLocale===l.id?C.accent:C.textMid}}>
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end',alignItems:'center'}}>
          <input type="month" value={mese} onChange={e=>setMese(e.target.value)}
            style={{background:C.surfaceHigh,border:`1px solid ${C.border}`,borderRadius:6,
              padding:'5px 8px',color:C.text,fontSize:10}}/>

          {/* File upload buttons */}
          {[
            {ref:txtRef,  label:'↑ Bilancio TXT', name:fileName,  color:C.accent,
              accept:'.txt,.csv', onFile:f=>handleTxt(f,setGruppiRaw,setFileName,true)},
            {ref:apRef,   label:'↑ Anno Prec.',   name:apName,    color:C.purple,
              accept:'.txt,.csv', onFile:f=>handleTxt(f,setGruppiAP,setApName)},
            {ref:bilRef,  label:'↑ Bil.Approv.',  name:bilName,   color:C.amber,
              accept:'.txt,.csv', onFile:f=>handleTxt(f,setGruppiBil,setBilName)},
            {ref:xlsRef,  label:'↑ Prima Nota',   name:pnName,    color:C.green,
              accept:'.xlsx,.xls', onFile:handleXlsx},
          ].map(({ref,label,name,color,accept,onFile},i)=>(
            <div key={i}>
              <button onClick={()=>ref.current.click()} style={{
                background:name?color+'22':C.surfaceHigh,
                border:`1px solid ${name?color:C.border}`,borderRadius:5,
                color:name?color:C.textMid,padding:'5px 10px',cursor:'pointer',fontSize:9,fontWeight:700}}>
                {name?'✓ '+name.split('/').pop().substring(0,12)+'…':label}
              </button>
              <input ref={ref} type="file" accept={accept} style={{display:'none'}}
                onChange={e=>e.target.files[0]&&onFile(e.target.files[0])}/>
            </div>
          ))}

          {/* Publish */}
          <button onClick={handlePublish} disabled={publishing} style={{
            background:C.accent,border:'none',borderRadius:6,color:'#fff',
            padding:'6px 14px',cursor:publishing?'wait':'pointer',
            fontSize:10,fontWeight:700,opacity:publishing?0.7:1}}>
            {publishing?'…':'⬆ Pubblica'}
          </button>

          <button onClick={handleLogout} style={{background:'none',
            border:`1px solid ${C.border}`,borderRadius:5,color:C.textMid,
            padding:'5px 10px',cursor:'pointer',fontSize:9}}>
            Esci
          </button>
        </div>
      </div>

      <div style={{maxWidth:960,margin:'0 auto',padding:'20px 16px'}}>

        {/* Publish message */}
        {publishMsg && (
          <div style={{background:publishMsg.ok?C.greenDim:C.redDim,
            border:`1px solid ${publishMsg.ok?C.green:C.red}`,
            borderRadius:8,padding:'10px 16px',marginBottom:16,
            color:publishMsg.ok?C.green:C.red,fontSize:11}}>
            {publishMsg.msg}
          </div>
        )}
        {pnErr && (
          <div style={{background:C.redDim,border:`1px solid ${C.red}`,
            borderRadius:8,padding:'8px 14px',marginBottom:12,color:C.red,fontSize:10}}>
            {pnErr}
          </div>
        )}

        {/* Mesi pubblicati */}
        {mesiPubblicati.length>0 && (
          <div style={{marginBottom:16,display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
            <span style={{color:C.textDim,fontSize:9}}>Mesi pubblicati:</span>
            {mesiPubblicati.map(m=>(
              <span key={m.id} style={{background:C.surfaceHigh,border:`1px solid ${C.border}`,
                borderRadius:4,padding:'2px 8px',fontSize:9,color:C.textMid}}>
                {m.label||m.mese}
              </span>
            ))}
          </div>
        )}

        {/* Drop zone */}
        {!fileName && (
          <div onClick={()=>txtRef.current.click()}
            onDrop={e=>{e.preventDefault();e.dataTransfer.files[0]&&handleTxt(e.dataTransfer.files[0],setGruppiRaw,setFileName,true)}}
            onDragOver={e=>e.preventDefault()}
            style={{border:`2px dashed ${C.borderLight}`,borderRadius:12,
              padding:'44px 24px',textAlign:'center',cursor:'pointer',marginBottom:20}}>
            <div style={{fontSize:32,marginBottom:8}}>📄</div>
            <div style={{color:C.text,fontSize:13,marginBottom:4}}>
              Trascina il TXT del bilancio o clicca per caricare
            </div>
            <div style={{color:C.textDim,fontSize:9}}>
              Formato: ="CONTO" TAB vuoto TAB DESCRIZIONE TAB SP/CE TAB D/A TAB DARE TAB AVERE
            </div>
          </div>
        )}

        {/* CE Table */}
        {Object.keys(gruppiRaw).length>0 && (
          <CETable
            vals={vals}
            gruppi={gruppi}
            valsAP={Object.keys(gruppiAP).length?valsAP:null}
            valsBil={Object.keys(gruppiBil).length?valsBil:null}
            annoPrecName={apName}
            bilancioName={bilName}
            onDrillVoce={voce=>console.log('drill',voce)}
          />
        )}

        {Object.keys(gruppiRaw).length>0 && (
          <div style={{marginTop:8,color:C.textDim,fontSize:9,textAlign:'center'}}>
            {Object.keys(gruppiRaw).length} codici gestionali caricati
            · pubblica per rendere visibile al cliente
          </div>
        )}
      </div>
    </div>
  )
}
