'use client'
import { VOCI_CE, fmt, pct } from '@/lib/ceLogic'

const C = {
  surface:'#181c27', surfaceHigh:'#1e2334', border:'#2a3050',
  accent:'#4f8ef7', accentDim:'#1a2d5a', green:'#3ecf8e',
  red:'#f76b6b', amber:'#f5a623', purple:'#a78bfa',
  text:'#e8ecf5', textMid:'#8b95b0', textDim:'#4a5270',
}
const col = n => n>=0 ? C.green : C.red
const fmtDec = n => new Intl.NumberFormat("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)

const COLS = '48px 1fr 100px 58px 100px 100px'

function NumCell({ v, size=12, bold=false, dimIfZero=false, color=null }) {
  const c = color || (dimIfZero && v===0 ? C.textDim : col(v))
  return (
    <span style={{textAlign:'right',fontFamily:'monospace',
      fontSize:size,fontWeight:bold?700:400,color:c}}>
      {v===0 && dimIfZero ? '—' : fmt(v)}
    </span>
  )
}

export default function CETable({
  vals, gruppi, valsAP, valsBil,
  annoPrecName, bilancioName,
  onDrillVoce,   // null for client (no drill)
}) {
  const ricavi = Math.abs(vals[100]||0)

  return (
    <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:'hidden'}}>
      {/* Header */}
      <div style={{display:'grid',gridTemplateColumns:COLS,
        padding:'8px 16px',background:C.surfaceHigh,borderBottom:`1px solid ${C.border}`}}>
        <span style={{color:C.textDim,fontSize:8,letterSpacing:'0.08em'}}>COD</span>
        <span style={{color:C.textDim,fontSize:8}}>VOCE</span>
        <span style={{color:C.textDim,fontSize:8,textAlign:'right'}}>MESE €</span>
        <span style={{color:C.textDim,fontSize:8,textAlign:'right'}}>% RIC.</span>
        <span style={{color:C.purple,fontSize:8,textAlign:'right',opacity:annoPrecName?1:0.35}}>
          ANNO PREC.
        </span>
        <span style={{color:C.amber,fontSize:8,textAlign:'right',opacity:bilancioName?1:0.35}}>
          BIL. APPROV.
        </span>
      </div>

      {VOCI_CE.map((voce,i) => {
        const val    = vals[voce.cod]    ?? 0
        const valAP  = valsAP?.[voce.cod]  ?? 0
        const valBil = valsBil?.[voce.cod] ?? 0

        const CompCols = () => (<>
          <span style={{textAlign:'right',fontSize:10,color:C.textMid}}>
            {val===0?'—':pct(val,ricavi)}
          </span>
          <span style={{textAlign:'right',fontFamily:'monospace',fontSize:11,
            color:annoPrecName?(valAP===0?C.textDim:col(valAP)):C.textDim,
            opacity:annoPrecName?1:0.3}}>
            {annoPrecName?(valAP===0?'—':fmt(valAP)):'—'}
          </span>
          <span style={{textAlign:'right',fontFamily:'monospace',fontSize:11,
            color:bilancioName?(valBil===0?C.textDim:col(valBil)):C.textDim,
            opacity:bilancioName?1:0.3}}>
            {bilancioName?(valBil===0?'—':fmt(valBil)):'—'}
          </span>
        </>)

        if (voce.tipo==='subtot') return (
          <div key={i} style={{display:'grid',gridTemplateColumns:COLS,
            padding:'8px 16px',background:`${C.amber}0a`,borderTop:`1px solid ${C.amber}33`}}>
            <span/>
            <span style={{color:C.amber,fontSize:10,fontWeight:700}}>{voce.label.toUpperCase()}</span>
            <span style={{textAlign:'right',fontFamily:'monospace',fontSize:12,
              fontWeight:800,color:col(val)}}>{fmt(val)}</span>
            <CompCols/>
          </div>
        )

        if (voce.tipo==='result') return (
          <div key={i} style={{display:'grid',gridTemplateColumns:COLS,
            padding:'11px 16px',
            background:val>=0?`${C.green}15`:`${C.red}15`,
            borderTop:`2px solid ${val>=0?C.green:C.red}`}}>
            <span/>
            <span style={{color:col(val),fontSize:13,fontWeight:800}}>{voce.label.toUpperCase()}</span>
            <span style={{textAlign:'right',fontFamily:'monospace',fontSize:15,
              fontWeight:800,color:col(val)}}>{fmt(val)}</span>
            <span style={{textAlign:'right',fontSize:10,fontWeight:700,color:C.textMid}}>
              {pct(val,ricavi)}
            </span>
            <span style={{textAlign:'right',fontFamily:'monospace',fontSize:13,fontWeight:700,
              color:annoPrecName?col(valAP):C.textDim,opacity:annoPrecName?1:0.3}}>
              {annoPrecName?fmt(valAP):'—'}
            </span>
            <span style={{textAlign:'right',fontFamily:'monospace',fontSize:13,fontWeight:700,
              color:bilancioName?col(valBil):C.textDim,opacity:bilancioName?1:0.3}}>
              {bilancioName?fmt(valBil):'—'}
            </span>
          </div>
        )

        if (voce.tipo==='stima') return (
          <div key={i} style={{display:'grid',gridTemplateColumns:COLS,
            padding:'7px 16px',borderTop:`1px solid ${C.border}22`}}>
            <span style={{fontFamily:'monospace',fontSize:9,color:C.textDim}}>{voce.cod}</span>
            <span style={{color:C.textMid,fontSize:11,fontStyle:'italic'}}>{voce.label}</span>
            <span style={{textAlign:'right',fontFamily:'monospace',fontSize:11,
              color:val===0?C.textDim:col(val)}}>{val===0?'—':fmt(val)}</span>
            <CompCols/>
          </div>
        )

        // input
        const key = String(voce.cod)
        const hasData = gruppi?.[key]?.movimenti?.length > 0
        const canDrill = hasData && !!onDrillVoce
        return (
          <div key={i} onClick={canDrill?()=>onDrillVoce(voce):undefined}
            style={{display:'grid',gridTemplateColumns:COLS,
              padding:'7px 16px',borderTop:`1px solid ${C.border}18`,
              cursor:canDrill?'pointer':'default',transition:'background 0.12s'}}
            onMouseEnter={e=>{if(canDrill)e.currentTarget.style.background=C.surfaceHigh}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}>
            <span style={{fontFamily:'monospace',fontSize:9,color:C.textDim,paddingTop:2}}>
              {voce.cod}
            </span>
            <div style={{display:'flex',alignItems:'center',gap:5}}>
              <span style={{color:C.text,fontSize:12}}>{voce.label}</span>
              {canDrill && (
                <span style={{background:C.accentDim,color:C.accent,borderRadius:3,
                  fontSize:8,padding:'1px 4px'}}>
                  {gruppi[key].movimenti.length} mov
                </span>
              )}
              {canDrill && gruppi[key].movimenti.some(m=>m.isExtra) && (
                <span style={{color:C.amber,fontSize:8}}>🔄</span>
              )}
            </div>
            <span style={{textAlign:'right',fontFamily:'monospace',fontSize:12,
              color:val===0?C.textDim:col(val)}}>
              {val===0?'—':fmt(val)}
            </span>
            <CompCols/>
          </div>
        )
      })}
    </div>
  )
}
