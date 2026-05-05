'use client'
import { VOCI_CE, fmt, pct } from '@/lib/ceLogic'

const fmtDec = n => new Intl.NumberFormat("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)
const col = n => n>=0 ? 'var(--green)' : 'var(--red)'

export default function CETable({ vals, gruppi, valsAP, valsBil, annoPrecName, bilancioName, onDrillVoce }) {
  const ricavi = Math.abs(vals[100]||0)

  const ColComp = ({ val, ap, bil }) => (<>
    <td style={{ textAlign:'right', fontSize:11, color:'var(--text-03)', fontFamily:'var(--font-mono)' }}>
      {val===0?'—':pct(val,ricavi)}
    </td>
    <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontSize:12,
      color:annoPrecName?(ap===0?'var(--text-04)':col(ap)):'var(--text-04)',
      opacity:annoPrecName?1:0.3 }}>
      {annoPrecName?(ap===0?'—':fmt(ap)):'—'}
    </td>
    <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontSize:12,
      color:bilancioName?(bil===0?'var(--text-04)':col(bil)):'var(--text-04)',
      opacity:bilancioName?1:0.3 }}>
      {bilancioName?(bil===0?'—':fmt(bil)):'—'}
    </td>
  </>)

  return (
    <div style={{ overflowX:'auto' }}>
      <table className="data-table" style={{ minWidth:600 }}>
        <thead>
          <tr>
            <th style={{ width:52 }}>Cod</th>
            <th>Voce</th>
            <th style={{ textAlign:'right', width:110 }}>Importo €</th>
            <th style={{ textAlign:'right', width:70 }}>% Ric.</th>
            <th style={{ textAlign:'right', width:110, color: annoPrecName?'var(--purple)':'var(--text-04)', opacity:annoPrecName?1:0.4 }}>
              Anno prec.
            </th>
            <th style={{ textAlign:'right', width:110, color:bilancioName?'var(--amber)':'var(--text-04)', opacity:bilancioName?1:0.4 }}>
              Bil. approv.
            </th>
          </tr>
        </thead>
        <tbody>
          {VOCI_CE.map((voce,i) => {
            const val    = vals[voce.cod]    ?? 0
            const valAP  = valsAP?.[voce.cod]  ?? 0
            const valBil = valsBil?.[voce.cod] ?? 0

            if (voce.tipo==='subtot') return (
              <tr key={i} className="ce-row-subtot">
                <td/>
                <td style={{ fontWeight:600, fontSize:11, letterSpacing:'0.04em', color:'var(--amber)', textTransform:'uppercase' }}>
                  {voce.label}
                </td>
                <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontWeight:600, fontSize:13, color:col(val) }}>
                  {fmt(val)}
                </td>
                <ColComp val={val} ap={valAP} bil={valBil}/>
              </tr>
            )

            if (voce.tipo==='result') return (
              <tr key={i} className={`ce-row-result ${val>=0?'positive':'negative'}`}>
                <td/>
                <td className="label-cell" style={{ color:col(val), textTransform:'uppercase', letterSpacing:'0.04em' }}>
                  {voce.label}
                </td>
                <td className="value-cell" style={{ textAlign:'right', color:col(val) }}>
                  {fmt(val)}
                </td>
                <td style={{ textAlign:'right', fontSize:11, fontWeight:600, color:'var(--text-03)', fontFamily:'var(--font-mono)' }}>
                  {pct(val,ricavi)}
                </td>
                <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600,
                  color:annoPrecName?col(valAP):'var(--text-04)', opacity:annoPrecName?1:0.3 }}>
                  {annoPrecName?fmt(valAP):'—'}
                </td>
                <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600,
                  color:bilancioName?col(valBil):'var(--text-04)', opacity:bilancioName?1:0.3 }}>
                  {bilancioName?fmt(valBil):'—'}
                </td>
              </tr>
            )

            if (voce.tipo==='stima') return (
              <tr key={i}>
                <td style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-03)' }}>{voce.cod}</td>
                <td style={{ fontSize:12, color:'var(--text-02)', fontStyle:'italic' }}>{voce.label}</td>
                <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontSize:12, color:val===0?'var(--text-04)':col(val) }}>
                  {val===0?'—':fmt(val)}
                </td>
                <ColComp val={val} ap={valAP} bil={valBil}/>
              </tr>
            )

            // input
            const key = String(voce.cod)
            const hasData = gruppi?.[key]?.movimenti?.length > 0
            const canDrill = hasData && !!onDrillVoce
            return (
              <tr key={i} onClick={canDrill?()=>onDrillVoce(voce):undefined}
                style={{ cursor:canDrill?'pointer':'default' }}>
                <td style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-03)' }}>
                  {voce.cod}
                </td>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <span style={{ fontSize:13, color:'var(--text)' }}>{voce.label}</span>
                    {canDrill && (
                      <span className="badge badge-blue" style={{ fontSize:9 }}>
                        {gruppi[key].movimenti.length}
                      </span>
                    )}
                    {canDrill && gruppi[key].movimenti.some(m=>m.isExtra) && (
                      <span style={{ color:'var(--amber)', fontSize:9 }}>✎</span>
                    )}
                  </div>
                </td>
                <td style={{ textAlign:'right', fontFamily:'var(--font-mono)', fontSize:12,
                  color:val===0?'var(--text-04)':col(val) }}>
                  {val===0?'—':fmt(val)}
                </td>
                <ColComp val={val} ap={valAP} bil={valBil}/>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
