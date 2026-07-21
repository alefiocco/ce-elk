'use client'
import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { LOCALI, calcolaTuttiCE, fmt, pct, VOCI_CE } from '@/lib/ceLogic'
import CETable from './CETable'

const fmtIT = n => new Intl.NumberFormat('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)
const colVal = n => n>=0 ? 'var(--green)' : 'var(--red)'

function groupByConto(movimenti) {
  const map = {}
  for (const m of movimenti) {
    if (!map[m.conto]) map[m.conto] = { conto:m.conto, descrizione:m.descrizione||''  , totale:0, movimenti:[] }
    map[m.conto].totale += m.importoCE
    map[m.conto].movimenti.push(m)
  }
  return Object.values(map).sort((a,b) => Math.abs(b.totale)-Math.abs(a.totale))
}

function DrillModal({ voce, gruppi, primaNotaRaw, onClose }) {
  const data = gruppi[String(voce.cod)]
  const [selectedConto, setSelectedConto] = useState(null)
  if (!data) return null
  const movContabili  = data.movimenti.filter(m => !m.isExtra)
  const movExtra      = data.movimenti.filter(m =>  m.isExtra)
  const contiGruppati = groupByConto(movContabili)

  const FattureView = ({ cg }) => {
    const fatture = (primaNotaRaw||[]).filter(r => r.conto === cg.conto)
    const totFatt = fatture.reduce((s,f) => s+f.importoCE, 0)
    return (
      <div style={{display:'flex',flexDirection:'column',height:'100%'}}>
        <div style={{padding:'10px 20px',background:'var(--surface-02)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
          <button onClick={()=>setSelectedConto(null)} className="btn btn-ghost" style={{padding:'3px 10px',fontSize:10}}>← conti</button>
          <span style={{fontFamily:'var(--font-mono)',color:'var(--blue)',fontSize:11}}>{cg.conto}</span>
          <span style={{color:'var(--text)',fontSize:12,flex:1}}>{cg.descrizione}</span>
          <span style={{fontFamily:'var(--font-mono)',fontWeight:600,color:colVal(cg.totale),fontSize:14}}>{fmt(cg.totale)}</span>
        </div>
        <div style={{overflowY:'auto',flex:1}}>
          {fatture.length===0 ? (
            <div style={{padding:'32px',textAlign:'center',color:'var(--text-03)',fontSize:12}}>
              <div style={{fontSize:24,marginBottom:8}}>📂</div>
              Nessuna fattura in prima nota per il conto {cg.conto}
            </div>
          ) : (<>
            <table className="data-table">
              <thead><tr>
                {['Data','N° Fattura','Fornitore/Cliente','Dare','Avere','CE'].map((h,i)=>(
                  <th key={i} style={{textAlign:i>=3?'right':'left'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {fatture.map((f,i)=>(
                  <tr key={i}>
                    <td style={{fontSize:11,color:'var(--text-02)',whiteSpace:'nowrap'}}>{f.data}</td>
                    <td style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--blue)'}}>{f.numFattura}</td>
                    <td style={{fontSize:12,maxWidth:200}}>{f.ragioneSociale}</td>
                    <td style={{textAlign:'right',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-03)'}}>{f.dare>0?fmt(f.dare):'—'}</td>
                    <td style={{textAlign:'right',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-03)'}}>{f.avere>0?fmt(f.avere):'—'}</td>
                    <td style={{textAlign:'right',fontFamily:'var(--font-mono)',fontSize:13,fontWeight:600,color:colVal(f.importoCE)}}>{fmtIT(f.importoCE)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{background:'var(--blue-dim)',borderTop:'1px solid var(--border-02)'}}>
                  <td colSpan={3} style={{padding:'7px 16px',color:'var(--text-02)',fontSize:10}}>
                    Totale {fatture.length} fatture
                    {Math.abs(totFatt-cg.totale)>0.05 && <span style={{color:'var(--amber)',marginLeft:8,fontSize:9}}>⚠ diff: {fmt(totFatt-cg.totale)}</span>}
                  </td>
                  <td colSpan={3} style={{textAlign:'right',fontFamily:'var(--font-mono)',fontWeight:700,color:colVal(totFatt),fontSize:13,padding:'7px 16px'}}>{fmt(totFatt)}</td>
                </tr>
              </tfoot>
            </table>
          </>)}
        </div>
      </div>
    )
  }

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'var(--surface)',border:'1px solid var(--border-02)',borderRadius:'var(--radius-xl)',width:'min(820px,96vw)',maxHeight:'82vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 24px 80px rgba(0,0,0,0.6)'}}>
        <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div>
            <div style={{color:'var(--text-03)',fontSize:9,letterSpacing:'0.12em',marginBottom:2}}>CODICE {voce.cod} · {selectedConto?'FATTURE':'CONTI CONTABILI'}</div>
            <div style={{color:'var(--text)',fontWeight:600,fontSize:15}}>{voce.label}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <span style={{color:colVal(data.totale),fontWeight:700,fontSize:18,fontFamily:'var(--font-mono)'}}>{fmt(data.totale)}</span>
            <button onClick={onClose} className="btn btn-ghost" style={{width:28,height:28,padding:0,justifyContent:'center'}}>×</button>
          </div>
        </div>
        <div style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column'}}>
          {selectedConto ? <FattureView cg={selectedConto}/> : (
            <div style={{overflowY:'auto',flex:1}}>
              <table className="data-table">
                <thead><tr>{['Conto','Descrizione','N° mov','Totale CE',''].map((h,i)=><th key={i} style={{textAlign:i>=2?'right':'left'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {contiGruppati.map((cg,i)=>(
                    <tr key={i} onClick={()=>setSelectedConto(cg)} style={{cursor:'pointer'}}>
                      <td style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--blue)'}}>{cg.conto}</td>
                      <td style={{fontSize:12}}>{cg.descrizione}</td>
                      <td style={{textAlign:'right',fontSize:11,color:'var(--text-02)'}}>{cg.movimenti.length}</td>
                      <td style={{textAlign:'right',fontFamily:'var(--font-mono)',fontSize:13,fontWeight:600,color:colVal(cg.totale)}}>{fmt(cg.totale)}</td>
                      <td style={{textAlign:'right',fontSize:10,color:'var(--blue)'}}>fatture →</td>
                    </tr>
                  ))}
                  {movExtra.map((m,i)=>(
                    <tr key={'x'+i} style={{background:'var(--amber-dim)'}}>
                      <td style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--amber)'}}>EXTRA</td>
                      <td style={{fontSize:12,color:'var(--text-02)'}}>{m.descrizione}</td>
                      <td style={{textAlign:'right',fontSize:11,color:'var(--text-03)'}}>—</td>
                      <td style={{textAlign:'right',fontFamily:'var(--font-mono)',fontSize:13,fontWeight:600,color:colVal(m.importoCE)}}>{fmt(m.importoCE)}</td>
                      <td style={{textAlign:'right',fontSize:9,color:'var(--amber)'}}>scrittura extra</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div style={{padding:'8px 20px',borderTop:'1px solid var(--border)',color:'var(--text-03)',fontSize:9,flexShrink:0}}>
          {selectedConto ? 'clicca ← per tornare ai conti' : `${contiGruppati.length} conti contabili${movExtra.length>0?' · '+movExtra.length+' scritture extra':''} · clicca un conto per vedere le fatture`}
        </div>
      </div>
    </div>
  )
}

export default function ClientApp({ user }) {
  const [mesi,setMesi]=useState([])
  const [meseAttivo,setMeseAttivo]=useState(null)
  const [meseConfronto,setMeseConfronto]=useState(null)
  const [datiMese,setDatiMese]=useState(null)
  const [datiConfronto,setDatiConfronto]=useState(null)
  const [activeLocale,setLocale]=useState('tot')
  const [loading,setLoading]=useState(true)
  const [drillVoce,setDrillVoce]=useState(null)
  const sb=getSupabase()

  useEffect(()=>{
    sb.from('mesi').select('id,mese,label,tipo,data_inizio,data_fine,pubblicato_at')
      .order('data_fine',{ascending:false})
      .then(({data})=>{setMesi(data||[]);if(data?.length)setMeseAttivo(data[0]);setLoading(false)})
  },[])
  useEffect(()=>{if(!meseAttivo)return;setDatiMese(null);sb.from('mesi').select('*').eq('id',meseAttivo.id).single().then(({data})=>setDatiMese(data))},[meseAttivo])
  useEffect(()=>{if(!meseConfronto){setDatiConfronto(null);return};sb.from('mesi').select('*').eq('id',meseConfronto.id).single().then(({data})=>setDatiConfronto(data))},[meseConfronto])

  async function handleLogout(){try{await sb.auth.signOut()}catch{}window.location.href=window.location.pathname}

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      if([...document.scripts].some(s=>s.src===src)){resolve();return}
      const el=document.createElement('script')
      el.src=src; el.onload=resolve; el.onerror=reject
      document.head.appendChild(el)
    })
  }

  async function exportPDF(){
    if(!datiMese||!ceLocale)return
    // Carica jsPDF + autotable da CDN se non presenti
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js')
    } catch(e) { alert('Errore caricamento libreria PDF'); return }
    const jsPDF = window.jspdf.jsPDF
    const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'})
    const localeLabel=LOCALI.find(l=>l.id===activeLocale)?.label||'Totale'
    const ricaviPdf=Math.abs(vals[100]||0)

    // Header scuro
    doc.setFillColor(26,39,68);doc.rect(0,0,210,28,'F')
    doc.setFont('helvetica','bold');doc.setFontSize(13);doc.setTextColor(255,255,255)
    doc.text('Studio FNP',14,11)
    doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(180,195,220)
    doc.text('ELK SRL',14,17)
    doc.text(datiMese.label+' · '+localeLabel,196,11,{align:'right'})
    doc.text('Generato il '+new Date().toLocaleDateString('it-IT'),196,17,{align:'right'})

    // Title bar
    doc.setFillColor(45,91,227);doc.rect(0,28,210,8,'F')
    doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(255,255,255)
    doc.text('CONTO ECONOMICO RICLASSIFICATO A VALORE AGGIUNTO',14,33.5)

    // Cards
    [{label:'RICAVI NETTI',val:fmt(ricaviPdf),color:[59,130,246]},
     {label:'EBIT',val:fmt(vals['EBIT']||0),color:(vals['EBIT']||0)>=0?[26,122,74]:[192,57,43]},
     {label:'RISULTATO NETTO',val:fmt(vals['RN']||0),color:(vals['RN']||0)>=0?[26,122,74]:[192,57,43]}
    ].forEach(({label,val,color},i)=>{
      const x=[14,77,140][i]
      doc.setDrawColor(224,228,239);doc.setFillColor(255,255,255)
      doc.roundedRect(x,40,56,16,2,2,'FD')
      doc.setFont('helvetica','normal');doc.setFontSize(6.5);doc.setTextColor(100,110,130)
      doc.text(label,x+28,46,{align:'center'})
      doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(...color)
      doc.text(val,x+28,53,{align:'center'})
    })

    // Table
    const rows=VOCI_CE.map(v=>{const val=vals[v.cod]??0;return{cod:typeof v.cod==='number'?String(v.cod):'',label:v.label,imp:val===0?'—':fmt(val),pct:val===0?'—':pct(val,ricaviPdf),tipo:v.tipo,val}})
    doc.autoTable({
      startY:60,head:[['Cod','Voce','Importo €','% Ricavi']],body:rows.map(r=>[r.cod,r.label,r.imp,r.pct]),
      styles:{font:'helvetica',fontSize:8,cellPadding:[2,3,2,3]},
      headStyles:{fillColor:[240,243,250],textColor:[50,60,80],fontStyle:'bold',fontSize:7.5,lineWidth:0.1,lineColor:[26,39,68]},
      columnStyles:{0:{cellWidth:12,textColor:[100,110,130]},1:{cellWidth:110},2:{cellWidth:30,halign:'right',font:'courier'},3:{cellWidth:24,halign:'right',textColor:[100,110,130]}},
      didParseCell:(data)=>{
        if(data.section!=='body')return
        const row=rows[data.row.index];if(!row)return
        if(row.tipo==='subtot'){data.cell.styles.fillColor=[255,248,230];data.cell.styles.fontStyle='bold'}
        if(row.tipo==='result'){data.cell.styles.fillColor=[232,240,254];data.cell.styles.fontStyle='bold';data.cell.styles.fontSize=9;if(data.column.index===2)data.cell.styles.textColor=row.val>=0?[26,122,74]:[192,57,43]}
        if(row.tipo==='stima'){data.cell.styles.textColor=[120,130,150];data.cell.styles.fontStyle='italic'}
      },
      foot:[[''  ,'Documento riservato · Studio FNP','','p.1']],
      footStyles:{fillColor:[255,255,255],textColor:[180,180,180],fontSize:7,lineWidth:0.1,lineColor:[220,224,232]},
    })
    doc.save(`CE_${datiMese.mese}_${activeLocale}.pdf`)
  }

  const ce=datiMese?calcolaTuttiCE(datiMese.dati_ce||{},datiMese.extra_scritture||[],datiMese.alloc_conf||{},datiMese.cespiti||{}):null
  const ceConf=datiConfronto?calcolaTuttiCE(datiConfronto.dati_ce||{},datiConfronto.extra_scritture||[],datiConfronto.alloc_conf||{},datiConfronto.cespiti||{}):null
  const ceLocale=ce?(ce[activeLocale]||ce['tot']):null
  const vals=ceLocale?.vals||{}
  const ricavi=Math.abs(vals[100]||0)
  const ebit=vals['EBIT']||0
  const rn=vals['RN']||0
  const periodi_confronto=mesi.filter(m=>m.id!==meseAttivo?.id)

  if(loading)return(
    <div style={{minHeight:'100vh',background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',gap:12,fontFamily:'var(--font-ui)'}}>
      <div style={{width:20,height:20,border:'2px solid var(--border-02)',borderTop:'2px solid var(--blue)',borderRadius:'50%',animation:'spin 0.7s linear infinite'}}/>
      <span style={{color:'var(--text-03)',fontSize:13}}>Caricamento…</span>
    </div>
  )

  return(
    <div style={{minHeight:'100vh',background:'var(--bg)',fontFamily:'var(--font-ui)',color:'var(--text)'}}>
      <header style={{background:'var(--surface)',borderBottom:'1px solid var(--border)',padding:'0 24px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
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
            {LOCALI.map(l=><button key={l.id} className={`locale-tab${activeLocale===l.id?' active':''}`} onClick={()=>setLocale(l.id)}>{l.label}</button>)}
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {datiMese&&<button className="btn btn-success" onClick={exportPDF}>⬇ PDF</button>}
          <button className="btn btn-ghost" onClick={handleLogout}>Esci</button>
        </div>
      </header>

      <main style={{maxWidth:1100,margin:'0 auto',padding:'24px 20px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
          <div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:'0.08em',color:'var(--text-03)',textTransform:'uppercase',marginBottom:8}}>Periodo</div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {mesi.map(m=>(
                <button key={m.id} onClick={()=>setMeseAttivo(m)} style={{padding:'6px 12px',borderRadius:6,fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'var(--font-ui)',border:`1px solid ${meseAttivo?.id===m.id?'rgba(59,130,246,0.4)':'var(--border)'}`,background:meseAttivo?.id===m.id?'var(--blue-dim)':'var(--surface)',color:meseAttivo?.id===m.id?'var(--blue)':'var(--text-02)',transition:'all 0.15s',display:'flex',alignItems:'center',gap:5}}>
                  {m.label||m.mese}
                  {m.tipo==='ytd'&&<span style={{fontSize:8,background:'var(--amber-dim)',color:'var(--amber)',borderRadius:3,padding:'1px 4px'}}>YTD</span>}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{fontSize:10,fontWeight:600,letterSpacing:'0.08em',color:'var(--text-03)',textTransform:'uppercase',marginBottom:8}}>
              Confronta con{meseConfronto&&<button onClick={()=>setMeseConfronto(null)} style={{marginLeft:8,background:'none',border:'none',color:'var(--text-03)',cursor:'pointer',fontSize:10}}>× rimuovi</button>}
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              <button onClick={()=>setMeseConfronto(null)} style={{padding:'6px 12px',borderRadius:6,fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'var(--font-ui)',border:`1px solid ${!meseConfronto?'rgba(100,100,100,0.4)':'var(--border)'}`,background:!meseConfronto?'var(--surface-03)':'var(--surface)',color:!meseConfronto?'var(--text-02)':'var(--text-03)',transition:'all 0.15s'}}>Nessuno</button>
              {periodi_confronto.map(m=>(
                <button key={m.id} onClick={()=>setMeseConfronto(m)} style={{padding:'6px 12px',borderRadius:6,fontSize:12,fontWeight:500,cursor:'pointer',fontFamily:'var(--font-ui)',border:`1px solid ${meseConfronto?.id===m.id?'rgba(139,92,246,0.4)':'var(--border)'}`,background:meseConfronto?.id===m.id?'var(--purple-dim)':'var(--surface)',color:meseConfronto?.id===m.id?'var(--purple)':'var(--text-02)',transition:'all 0.15s',display:'flex',alignItems:'center',gap:5}}>
                  {m.label||m.mese}
                  {m.tipo==='ytd'&&<span style={{fontSize:8,background:'var(--amber-dim)',color:'var(--amber)',borderRadius:3,padding:'1px 4px'}}>YTD</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {ceLocale&&(<>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
            {[{label:'Ricavi netti',val:ricavi,color:'var(--blue)',sub:'Totale vendite'},{label:'EBIT',val:ebit,color:ebit>=0?'var(--green)':'var(--red)',sub:ricavi>0?pct(ebit,ricavi)+' dei ricavi':'Risultato operativo'},{label:'Ris. netto',val:rn,color:rn>=0?'var(--green)':'var(--red)',sub:ricavi>0?pct(rn,ricavi)+' dei ricavi':'Dopo imposte stimate'},{label:'Periodo',val:null,color:'var(--text)',sub:datiMese?.label}].map(({label,val,color,sub})=>(
              <div key={label} className="metric-card">
                <div className="label">{label}</div>
                {val!==null?<div className="value" style={{color}}>{fmt(val)}</div>:<div style={{fontSize:13,fontWeight:600,color,marginTop:4,lineHeight:1.3}}>{datiMese?.tipo==='ytd'?'📈 YTD':'📅 Mensile'}</div>}
                <div className="sub">{sub}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{padding:0,overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <h2 style={{fontSize:14,fontWeight:600,marginBottom:2}}>Conto Economico Riclassificato</h2>
                <p style={{fontSize:11,color:'var(--text-03)'}}>
                  {datiMese?.label}
                  {datiMese?.data_inizio&&datiMese?.data_fine&&<span style={{marginLeft:8,color:'var(--text-04)'}}> ({new Date(datiMese.data_inizio+'T12:00:00').toLocaleDateString('it-IT',{day:'2-digit',month:'short'})} – {new Date(datiMese.data_fine+'T12:00:00').toLocaleDateString('it-IT',{day:'2-digit',month:'short',year:'numeric'})})</span>}
                  {meseConfronto&&<span style={{marginLeft:12,color:'var(--purple)'}}>vs {meseConfronto.label||meseConfronto.mese}</span>}
                  {' · '}{LOCALI.find(l=>l.id===activeLocale)?.label}
                </p>
              </div>
            </div>
            <CETable vals={ceLocale.vals} gruppi={ceLocale.gruppi} valsAP={ceConf?(ceConf[activeLocale]||ceConf['tot']).vals:null} valsBil={null} annoPrecName={meseConfronto?(meseConfronto.label||meseConfronto.mese):null} bilancioName={null} onDrillVoce={voce=>setDrillVoce(voce)}/>
          </div>
        </>)}
        {!ceLocale&&meseAttivo&&<div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-03)',fontSize:13}}><div style={{fontSize:32,marginBottom:12}}>⏳</div>Caricamento dati…</div>}
        {mesi.length===0&&<div style={{textAlign:'center',padding:'60px 20px',color:'var(--text-03)',fontSize:13}}>Nessun periodo pubblicato ancora.</div>}
      </main>

      {drillVoce&&ceLocale&&<DrillModal voce={drillVoce} gruppi={ceLocale.gruppi} primaNotaRaw={datiMese?.prima_nota||[]} onClose={()=>setDrillVoce(null)}/>}
    </div>
  )
}
