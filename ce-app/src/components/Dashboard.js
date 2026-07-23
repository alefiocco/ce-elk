'use client'
import { useState, useEffect, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'
import { LOCALI, calcolaTuttiCE, fmt, pct, VOCI_CE } from '@/lib/ceLogic'

function loadChartJs() {
  return new Promise((resolve, reject) => {
    if (window.Chart) { resolve(); return }
    const existing = [...document.scripts].find(s => s.src.includes('chart.umd'))
    if (existing) {
      if (existing.dataset.loaded === '1') { resolve(); return }
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('load error')))
      return
    }
    const el = document.createElement('script')
    el.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js'
    el.onload = () => { el.dataset.loaded = '1'; resolve() }
    el.onerror = () => reject(new Error('load error'))
    document.head.appendChild(el)
  })
}

const fmtK = v => Math.abs(v) >= 1000 ? (v/1000).toFixed(0)+'k' : String(Math.round(v))

export default function Dashboard({ activeLocale }) {
  const [mesiData, setMesiData] = useState(null)
  const [loading, setLoading]   = useState(true)
  const trendRef  = useRef(null)
  const costiRef  = useRef(null)
  const localiRef = useRef(null)
  const charts    = useRef({})
  const sb = getSupabase()

  useEffect(() => {
    async function load() {
      const { data: lista } = await sb.from('mesi')
        .select('*').order('data_fine', { ascending: true })
      if (!lista) { setLoading(false); return }
      const mensili = lista.filter(m => m.tipo !== 'ytd')
      const elaborati = mensili.map(m => {
        const ce = calcolaTuttiCE(m.dati_ce||{}, m.extra_scritture||[], m.alloc_conf||{}, m.cespiti||{})
        const loc = ce[activeLocale] || ce['tot']
        return { mese: m.mese, label: m.label || m.mese, ce, vals: loc.vals }
      })
      setMesiData({ mensili: elaborati, ultimo: elaborati[elaborati.length-1] })
      setLoading(false)
    }
    load()
  }, [activeLocale])

  useEffect(() => {
    if (!mesiData || !mesiData.mensili.length) return
    let cancelled = false
    loadChartJs().then(() => {
      if (cancelled) return
      Object.values(charts.current).forEach(c => c && c.destroy())
      charts.current = {}
      const Chart = window.Chart
      const tick = '#898781'
      const grid = 'rgba(128,128,128,0.15)'
      const labels = mesiData.mensili.map(m => m.label.split(' ')[0])

      if (trendRef.current) {
        charts.current.trend = new Chart(trendRef.current, {
          type: 'line',
          data: { labels, datasets: [
            { label:'Ricavi', data: mesiData.mensili.map(m=>Math.abs(m.vals[100]||0)),
              borderColor:'#2a78d6', backgroundColor:'#2a78d6', borderWidth:2, tension:0.3, pointRadius:3 },
            { label:'EBIT', data: mesiData.mensili.map(m=>m.vals['EBIT']||0),
              borderColor:'#1baf7a', backgroundColor:'#1baf7a', borderWidth:2, tension:0.3, pointRadius:3 },
            { label:'Utile netto', data: mesiData.mensili.map(m=>m.vals['RN']||0),
              borderColor:'#eda100', backgroundColor:'#eda100', borderWidth:2, borderDash:[5,3], tension:0.3, pointRadius:3 },
          ]},
          options: { responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{ display:false } },
            scales:{ y:{ ticks:{ color:tick, callback:fmtK }, grid:{ color:grid } },
                     x:{ ticks:{ color:tick }, grid:{ display:false } } } }
        })
      }

      if (costiRef.current && mesiData.ultimo) {
        const v = mesiData.ultimo.vals
        const costi = VOCI_CE
          .filter(voce => voce.tipo==='input' && typeof voce.cod==='number')
          .map(voce => ({ label: voce.label, val: Math.abs(v[voce.cod]||0) }))
          .filter(x => x.val > 0)
          .sort((a,b) => b.val - a.val)
          .slice(0, 8)
        charts.current.costi = new Chart(costiRef.current, {
          type: 'bar',
          data: { labels: costi.map(c=>c.label.length>22?c.label.slice(0,22)+'…':c.label),
            datasets:[{ label:'Costi', data: costi.map(c=>c.val),
              backgroundColor:'#2a78d6', borderRadius:4, barThickness:16 }]},
          options: { indexAxis:'y', responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{ display:false } },
            scales:{ x:{ ticks:{ color:tick, callback:fmtK }, grid:{ color:grid } },
                     y:{ ticks:{ color:tick, font:{size:10} }, grid:{ display:false } } } }
        })
      }

      if (localiRef.current && mesiData.ultimo) {
        const localiCC = LOCALI.filter(l => l.cc !== null)
        const ce = mesiData.ultimo.ce
        const ricaviLoc = localiCC.map(l => { const lv=ce[l.id]?.vals||{}; return Math.abs(lv[100]||0) })
        const ebitLoc   = localiCC.map(l => { const lv=ce[l.id]?.vals||{}; return lv['EBIT']||0 })
        charts.current.locali = new Chart(localiRef.current, {
          type: 'bar',
          data: { labels: localiCC.map(l=>l.label),
            datasets:[
              { label:'Ricavi', data:ricaviLoc, backgroundColor:'#2a78d6', borderRadius:4, barThickness:20 },
              { label:'EBIT',   data:ebitLoc,   backgroundColor:'#1baf7a', borderRadius:4, barThickness:20 },
            ]},
          options: { responsive:true, maintainAspectRatio:false,
            plugins:{ legend:{ display:false } },
            scales:{ y:{ ticks:{ color:tick, callback:fmtK }, grid:{ color:grid } },
                     x:{ ticks:{ color:tick, font:{size:10} }, grid:{ display:false } } } }
        })
      }
    }).catch(()=>{})
    return () => { cancelled = true }
  }, [mesiData])

  useEffect(() => () => { Object.values(charts.current).forEach(c => c && c.destroy()) }, [])

  const Legend = ({ items }) => (
    <div style={{ display:'flex', flexWrap:'wrap', gap:14, marginBottom:10, fontSize:11, color:'var(--text-02)' }}>
      {items.map(it => (
        <span key={it.label} style={{ display:'flex', alignItems:'center', gap:5 }}>
          <span style={{ width:9, height:9, borderRadius:2, background:it.color, display:'inline-block' }}/>
          {it.label}
        </span>
      ))}
    </div>
  )

  if (loading) return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-03)', fontSize:13 }}>
      <div style={{ width:20, height:20, border:'2px solid var(--border-02)', borderTop:'2px solid var(--blue)',
        borderRadius:'50%', animation:'spin 0.7s linear infinite', margin:'0 auto 12px' }}/>
      Caricamento dashboard…
    </div>
  )

  if (!mesiData || !mesiData.mensili.length) return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-03)', fontSize:13 }}>
      <div style={{ fontSize:32, marginBottom:12 }}>📊</div>
      Nessun periodo mensile pubblicato per generare i grafici.
    </div>
  )

  const cardStyle  = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, padding:'16px 18px' }
  const titleStyle = { fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:2 }
  const subStyle   = { fontSize:11, color:'var(--text-03)', marginBottom:14 }
  const ultimoLabel = mesiData.ultimo?.label || ''

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div style={cardStyle}>
        <div style={titleStyle}>Andamento ricavi, EBIT e utile netto</div>
        <div style={subStyle}>Periodi mensili · {mesiData.mensili.length} mesi</div>
        <Legend items={[{label:'Ricavi',color:'#2a78d6'},{label:'EBIT',color:'#1baf7a'},{label:'Utile netto',color:'#eda100'}]}/>
        <div style={{ position:'relative', width:'100%', height:240 }}>
          <canvas ref={trendRef} role="img" aria-label="Andamento ricavi, EBIT e utile netto nei mesi"/>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={cardStyle}>
          <div style={titleStyle}>Composizione dei costi</div>
          <div style={subStyle}>{ultimoLabel} · voci principali</div>
          <div style={{ position:'relative', width:'100%', height:260 }}>
            <canvas ref={costiRef} role="img" aria-label="Composizione dei costi per voce"/>
          </div>
        </div>
        <div style={cardStyle}>
          <div style={titleStyle}>Confronto tra locali</div>
          <div style={subStyle}>{ultimoLabel} · ricavi ed EBIT</div>
          <Legend items={[{label:'Ricavi',color:'#2a78d6'},{label:'EBIT',color:'#1baf7a'}]}/>
          <div style={{ position:'relative', width:'100%', height:210 }}>
            <canvas ref={localiRef} role="img" aria-label="Confronto ricavi ed EBIT tra i locali"/>
          </div>
        </div>
      </div>
    </div>
  )
}
