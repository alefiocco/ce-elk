'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { getSupabase } from '@/lib/supabase'

// ─── COLORS ──────────────────────────────────────────────────────────────────
const C = {
  bg:'#0f1117', surface:'#181c27', surfaceHigh:'#1e2334',
  border:'#2a3050', borderLight:'#3a4570',
  accent:'#4f8ef7', accentDim:'#1a2d5a',
  green:'#3ecf8e', greenDim:'#0d3d26',
  red:'#f76b6b', redDim:'#3d1010',
  amber:'#f5a623', amberDim:'#3d2800',
  purple:'#a78bfa',
  text:'#e8ecf5', textMid:'#8b95b0', textDim:'#4a5270',
}
// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const PIANO_CONTI = {
  "801300":{"cod":415,"cc":10}, "801400":{"cod":200,"cc":10}, "801601":{"cod":415,"cc":10}, "801700":{"cod":415,"cc":10}, "804220":{"cod":455,"cc":10}, "804400":{"cod":476,"cc":10}, "804450":{"cod":475,"cc":5}, "804508":{"cod":455,"cc":10},
  "804516":{"cod":435,"cc":5}, "804525":{"cod":465,"cc":5}, "804526":{"cod":476,"cc":10}, "804527":{"cod":475,"cc":10}, "804528":{"cod":479,"cc":10}, "804530":{"cod":436,"cc":5}, "804534":{"cod":476,"cc":5}, "804536":{"cod":436,"cc":5},
  "804538":{"cod":436,"cc":5}, "804541":{"cod":430,"cc":10}, "804543":{"cod":436,"cc":5}, "804553":{"cod":475,"cc":5}, "804700":{"cod":481,"cc":5}, "805100":{"cod":482,"cc":10}, "810000":{"cod":410,"cc":10}, "810001":{"cod":410,"cc":5},
  "811020":{"cod":410,"cc":10}, "812000":{"cod":410,"cc":10}, "813001":{"cod":410,"cc":5}, "820050":{"cod":400,"cc":5}, "820400":{"cod":400,"cc":10}, "820604":{"cod":400,"cc":5}, "821500":{"cod":400,"cc":10}, "821501":{"cod":400,"cc":10},
  "821606":{"cod":400,"cc":10}, "821610":{"cod":400,"cc":10}, "821700":{"cod":400,"cc":10}, "821701":{"cod":400,"cc":10}, "830100":{"cod":215,"cc":5}, "835100":{"cod":480,"cc":5}, "835105":{"cod":480,"cc":5}, "835106":{"cod":480,"cc":5},
  "835109":{"cod":475,"cc":10}, "835111":{"cod":700,"cc":5}, "835113":{"cod":480,"cc":5}, "835116":{"cod":480,"cc":5}, "835120":{"cod":415,"cc":5}, "835122":{"cod":480,"cc":10}, "835123":{"cod":480,"cc":5}, "835205":{"cod":700,"cc":5},
  "835401":{"cod":475,"cc":5}, "835402":{"cod":475,"cc":5}, "843104":{"cod":500,"cc":5}, "843109":{"cod":500,"cc":5}, "870001":{"cod":800,"cc":5}, "870002":{"cod":800,"cc":5}, "901113":{"cod":100,"cc":10}, "901400":{"cod":100,"cc":10},
  "902100":{"cod":215,"cc":5}, "905102":{"cod":700,"cc":5}, "905300":{"cod":700,"cc":5}, "804265":{"cod":455,"cc":5}, "804504":{"cod":416,"cc":5}, "804549":{"cod":445,"cc":5}, "804550":{"cod":477,"cc":10}, "804569":{"cod":430,"cc":10},
  "805105":{"cod":405,"cc":10}, "821506":{"cod":400,"cc":10}, "835104":{"cod":480,"cc":5}, "801114":{"cod":415,"cc":10}, "801402":{"cod":240,"cc":10}, "804210":{"cod":455,"cc":5}, "804315":{"cod":475,"cc":10}, "804524":{"cod":430,"cc":10},
  "804544":{"cod":479,"cc":5}, "804548":{"cod":475,"cc":5}, "805350":{"cod":405,"cc":5}, "835403":{"cod":436,"cc":5}, "860105":{"cod":700,"cc":5}, "901111":{"cod":475,"cc":5}, "940000":{"cod":500,"cc":5}, "811000":{"cod":410,"cc":5},
  "813000":{"cod":410,"cc":5}, "804221":{"cod":240,"cc":5}, "835112":{"cod":475,"cc":5}, "801705":{"cod":475,"cc":5}, "901500":{"cod":100,"cc":5}, "905104":{"cod":100,"cc":5}, "931002":{"cod":100,"cc":5}, "804531":{"cod":436,"cc":5},
  "906300":{"cod":700,"cc":5}, "820702":{"cod":400,"cc":5}, "801550":{"cod":445,"cc":5}, "804310":{"cod":477,"cc":5}, "801405":{"cod":415,"cc":10}, "804540":{"cod":430,"cc":5}, "801100":{"cod":200,"cc":10}, "804710":{"cod":481,"cc":20},
  "843101":{"cod":500,"cc":20}, "813002":{"cod":410,"cc":5}, "820100":{"cod":400,"cc":20}, "804900":{"cod":445,"cc":20}, "804901":{"cod":430,"cc":20}, "820802":{"cod":400,"cc":5}, "970004":{"cod":700,"cc":10}, "820402":{"cod":400,"cc":20},
  "821609":{"cod":400,"cc":5}, "804401":{"cod":476,"cc":10}, "804906":{"cod":476,"cc":20}, "820114":{"cod":400,"cc":20}, "821615":{"cod":400,"cc":20}, "804551":{"cod":479,"cc":20}, "804517":{"cod":416,"cc":20}, "801730":{"cod":455,"cc":5},
  "821515":{"cod":400,"cc":5}, "821601":{"cod":400,"cc":5}, "801900":{"cod":415,"cc":20}, "801901":{"cod":200,"cc":20}, "801903":{"cod":415,"cc":20}, "801904":{"cod":415,"cc":20}, "801905":{"cod":415,"cc":20}, "804503":{"cod":455,"cc":5},
  "804573":{"cod":490,"cc":5}, "804904":{"cod":455,"cc":20}, "805101":{"cod":482,"cc":20}, "835121":{"cod":415,"cc":20}, "804529":{"cod":455,"cc":20}, "804907":{"cod":476,"cc":20}, "804911":{"cod":476,"cc":20}, "810003":{"cod":410,"cc":20},
  "811021":{"cod":410,"cc":20}, "821708":{"cod":400,"cc":20}, "901600":{"cod":100,"cc":20}, "901601":{"cod":100,"cc":20}, "905301":{"cod":100,"cc":5}, "804908":{"cod":430,"cc":20}, "804910":{"cod":475,"cc":20}, "820601":{"cod":400,"cc":20},
  "860100":{"cod":700,"cc":5}, "947009":{"cod":700,"cc":5}, "804552":{"cod":430,"cc":10}, "804912":{"cod":477,"cc":20}, "801740":{"cod":240,"cc":5}, "804909":{"cod":479,"cc":20}, "901402":{"cod":100,"cc":5}, "906200":{"cod":700,"cc":5},
  "804905":{"cod":477,"cc":20}, "947002":{"cod":500,"cc":5}, "804512":{"cod":240,"cc":5}, "821607":{"cod":400,"cc":20}, "801401":{"cod":490,"cc":5}, "811022":{"cod":410,"cc":5}, "812001":{"cod":410,"cc":20}, "813003":{"cod":410,"cc":20},
  "906100":{"cod":700,"cc":5}, "835300":{"cod":700,"cc":5}, "843102":{"cod":500,"cc":20}, "901100":{"cod":100,"cc":10}, "804507":{"cod":455,"cc":5}, "804545":{"cod":482,"cc":10}, "943001":{"cod":700,"cc":5}, "940001":{"cod":700,"cc":5},
  "821603":{"cod":400,"cc":5}, "821649":{"cod":400,"cc":5}, "901501":{"cod":100,"cc":5}, "801403":{"cod":475,"cc":5}, "811023":{"cod":700,"cc":5}, "835114":{"cod":490,"cc":5}, "905121":{"cod":700,"cc":5}, "804563":{"cod":490,"cc":5},
  "905100":{"cod":700,"cc":5}, "804102":{"cod":240,"cc":5}, "804522":{"cod":445,"cc":5}, "804402":{"cod":476,"cc":5}, "801790":{"cod":475,"cc":5}, "804518":{"cod":416,"cc":5}, "804519":{"cod":445,"cc":5}, "805103":{"cod":482,"cc":10},
  "901401":{"cod":700,"cc":5}, "804222":{"cod":240,"cc":5}, "820113":{"cod":400,"cc":5}, "820600":{"cod":400,"cc":5}, "821509":{"cod":400,"cc":5}, "821518":{"cod":400,"cc":5}, "901115":{"cod":100,"cc":5}, "901118":{"cod":100,"cc":10},
};

const CC_LABELS = { 5:"Indiretti", 10:"Via 4", 20:"Via Capp", 30:"New" };
const LOCALI = [
  { id:"tot",  label:"Totale",   cc: null },
  { id:"via4", label:"Via 4",    cc: 10   },
  { id:"capp", label:"Via Capp", cc: 20   },
  { id:"new",  label:"New",      cc: 30   },
];

const VOCI_CE = [
  { cod:100,  label:"Ricavi netti di Vendita",                 tipo:"input",  segno: 1 },
  { cod:200,  label:"Acquisti materie prime",                  tipo:"input",  segno:-1 },
  { cod:215,  label:"Var.ne Rim. Merci (RI-RF)",               tipo:"input",  segno:-1 },
  { cod:240,  label:"Altri costi variabili",                   tipo:"input",  segno:-1 },
  { cod:"CV", label:"Costi Variabili",                         tipo:"subtot", refs:[200,215,240] },
  { cod:"MC", label:"1^ Margine di Contribuzione",             tipo:"result" },
  { cod:400,  label:"Ammortamenti",                            tipo:"input",  segno:-1 },
  { cod:405,  label:"Leasing",                                 tipo:"input",  segno:-1 },
  { cod:408,  label:"Accantonamenti a fondi spese future",     tipo:"input",  segno:-1 },
  { cod:410,  label:"Costo del personale",                     tipo:"input",  segno:-1 },
  { cod:411,  label:"Compensi amministratori/soci",            tipo:"input",  segno:-1 },
  { cod:415,  label:"Acq. Mat. di Consumo e attrezz. Minuta", tipo:"input",  segno:-1 },
  { cod:416,  label:"Consulenze tecniche",                     tipo:"input",  segno:-1 },
  { cod:430,  label:"Manutenzioni",                            tipo:"input",  segno:-1 },
  { cod:435,  label:"Consulenza commerciale",                  tipo:"input",  segno:-1 },
  { cod:436,  label:"Viaggi e spese di rappresentanza",        tipo:"input",  segno:-1 },
  { cod:445,  label:"Pubblicità e Sito WEB",                   tipo:"input",  segno:-1 },
  { cod:455,  label:"Prestazioni di servizi",                  tipo:"input",  segno:-1 },
  { cod:465,  label:"Consulenze amministrative",               tipo:"input",  segno:-1 },
  { cod:475,  label:"Spese Varie",                             tipo:"input",  segno:-1 },
  { cod:476,  label:"Utenze",                                  tipo:"input",  segno:-1 },
  { cod:477,  label:"Consulenze generali e corsi",             tipo:"input",  segno:-1 },
  { cod:478,  label:"Altri costi del personale",               tipo:"input",  segno:-1 },
  { cod:479,  label:"Assicurazioni",                           tipo:"input",  segno:-1 },
  { cod:480,  label:"Tasse",                                   tipo:"input",  segno:-1 },
  { cod:481,  label:"Spese bancarie",                          tipo:"input",  segno:-1 },
  { cod:482,  label:"Affitto ed accessorie spese locali",      tipo:"input",  segno:-1 },
  { cod:490,  label:"Spese automezzi",                         tipo:"input",  segno:-1 },
  { cod:"CF", label:"Costi Fissi",                             tipo:"subtot", refs:[400,405,408,410,411,415,416,430,435,436,445,455,465,475,476,477,478,479,480,481,482,490] },
  { cod:"EBIT",label:"Risultato operativo [EBIT]",             tipo:"result" },
  { cod:500,  label:"+/- Risultato gest. Finanziaria",         tipo:"input",  segno: 1 },
  { cod:700,  label:"+/- Risultato gestione Straordinaria",    tipo:"input",  segno: 1 },
  { cod:"RAI",label:"Risultato ante imposte",                  tipo:"result" },
  { cod:800,  label:"Imposte sul reddito (stima 30%)",         tipo:"stima" },
  { cod:"RN", label:"Risultato Netto",                         tipo:"result" },
];


// ─── PURE LOGIC ───────────────────────────────────────────────────────────────
function parseImporto(s){if(!s)return 0;const c=String(s).replace(/\s/g,"").replace(/^-\s*,/,"-0,");if(!c||c==="-")return 0;return parseFloat(c.replace(/\./g,"").replace(",","."))||0;}
function parseTxt(text){
  const lines=text.split(/\r?\n/).filter(l=>l.trim());
  const movimenti=[];
  for(const line of lines){
    const parts=line.split(/\t/).map(p=>p.trim());
    if(parts.length<2)continue;
    const conto=parts[0].replace(/[="'\s]/g,"");
    if(!conto||!/^\d+$/.test(conto))continue;
    let desc="",spce="",dare=0,avere=0;
    if(parts.length>=7){desc=parts[2]||"";spce=parts[3]||"";dare=parseImporto(parts[5]);avere=parseImporto(parts[6]);}
    else if(parts.length>=4){desc=parts[1]||"";dare=parseImporto(parts[2]);avere=parseImporto(parts[3]);}
    else continue;
    if(spce.toUpperCase().includes("SP"))continue;
    movimenti.push({conto,descrizione:desc,dare,avere});
  }
  return movimenti;
}

function aggregaPerCodice(movimenti,extraMap={}){
  const mm={...PIANO_CONTI,...extraMap};
  const g={};
  for(const mov of movimenti){
    const en=mm[mov.conto];
    if(!en)continue;
    const{cod,cc}=en;
    if(cod>=1000)continue;
    const v=VOCI_CE.find(v=>v.cod===cod);
    if(!v||v.tipo!=="input")continue;
    if(!g[cod])g[cod]={totale:0,movimenti:[]};
    const imp=mov.avere-mov.dare;
    g[cod].totale+=imp;
    g[cod].movimenti.push({...mov,importoCE:imp,cc});
  }
  return g;
}

function calcolaFracCespiti(c){const t=[10,20,30].reduce((s,cc)=>s+(parseFloat(c[cc])||0),0);const f={};[10,20,30].forEach(cc=>{f[cc]=t>0?(parseFloat(c[cc])||0)/t:1/3;});return f;}
const DEFAULT_FRACS={10:1/3,20:1/3,30:1/3};
function getAllocFraction(cod,ccL,ac,fc){
  if(cod===430&&fc&&Object.values(fc).some(v=>Math.abs(v-1/3)>0.0001))return fc[ccL]??DEFAULT_FRACS[ccL];
  if(ac[cod]?.[ccL]!==undefined)return ac[cod][ccL]/100;
  return DEFAULT_FRACS[ccL]??1/3;
}
function aggregaPerLocale(gr,ccL,ac,fc){
  const g={};
  for(const[cs,gruppo]of Object.entries(gr)){
    const cod=parseInt(cs);
    const md=gruppo.movimenti.filter(m=>m.cc===ccL);
    const fr=getAllocFraction(cod,ccL,ac,fc);
    const mi=fr>0?gruppo.movimenti.filter(m=>m.cc===5).map(m=>({...m,importoCE:m.importoCE*fr,_al:true,_fr:fr})):[];
    const tt=[...md,...mi];
    if(!tt.length)continue;
    g[cs]={totale:tt.reduce((s,m)=>s+m.importoCE,0),movimenti:tt};
  }
  return g;
}
const CODICI_BUDGET=[465,479];
function calcolaCE(gi,extra){
  const g={};
  for(const[k,v]of Object.entries(gi))g[k]={totale:v.totale,movimenti:[...v.movimenti]};
  for(const ex of extra){
    const key=String(ex.codGest);
    if(!g[key])g[key]={totale:0,movimenti:[]};
    g[key].totale+=ex.importo;
    g[key].movimenti.push({conto:"EXTRA",descrizione:ex.descrizione+(ex.note?` (${ex.note})`:""),dare:ex.importo>0?ex.importo:0,avere:ex.importo<0?-ex.importo:0,importoCE:ex.importo,isExtra:true});
  }
  const bo={};
  for(const ex of extra)if(ex.tipo==="budget")bo[ex.codGest]=(bo[ex.codGest]||0)+ex.importo;
  const v={};
  for(const voce of VOCI_CE){
    if(voce.tipo!=="input")continue;
    if(CODICI_BUDGET.includes(voce.cod)&&bo[voce.cod]!==undefined){
      v[voce.cod]=bo[voce.cod];
      const key=String(voce.cod);
      g[key]={totale:bo[voce.cod],movimenti:(g[key]?.movimenti||[]).filter(m=>m.isExtra)};
    }else v[voce.cod]=g[voce.cod]?.totale||0;
  }
  v["CV"]=(v[200]||0)+(v[215]||0)+(v[240]||0);
  v["MC"]=(v[100]||0)+v["CV"];
  v["CF"]=[400,405,408,410,411,415,416,430,435,436,445,455,465,475,476,477,478,479,480,481,482,490].reduce((s,c)=>s+(v[c]||0),0);
  v["EBIT"]=v["MC"]+v["CF"];
  v[500]=g["500"]?.totale||0;v[700]=g["700"]?.totale||0;
  v["RAI"]=v["EBIT"]+v[500]+v[700];
  v[800]=v["RAI"]>0?-(v["RAI"]*0.30):0;
  v["RN"]=v["RAI"]+v[800];
  return{vals:v,gruppi:g};
}
function calcolaPercRicavi(gr){
  const g=gr[String(100)];
  if(!g)return{10:1/3,20:1/3,30:1/3};
  const t={};
  for(const m of g.movimenti)t[m.cc]=(t[m.cc]||0)+m.importoCE;
  const td=[10,20,30].reduce((s,cc)=>s+(t[cc]||0),0);
  if(!td)return{10:1/3,20:1/3,30:1/3};
  return{10:(t[10]||0)/td,20:(t[20]||0)/td,30:(t[30]||0)/td};
}
function calcolaTuttiCE(gr,extra,ac,cespiti){
  const fc=calcolaFracCespiti(cespiti||{});
  const pr=calcolaPercRicavi(gr);
  const res={};
  for(const locale of LOCALI){
    let gl,el;
    if(locale.cc===null){
      gl=gr;
      el=[...extra.filter(ex=>ex.tipo!=="budget"),...extra.filter(ex=>ex.tipo==="budget")];
    }else{
      gl=aggregaPerLocale(gr,locale.cc,ac||{},fc);
      el=extra.filter(ex=>{if(ex.tipo==="budget")return false;if(!ex.ccLocale)return true;return ex.ccLocale===locale.cc;}).map(ex=>({...ex}));
      for(const ex of extra.filter(ex=>ex.tipo==="budget"))el.push({...ex,importo:ex.importo*(pr[locale.cc]??1/3)});
    }
    res[locale.id]=calcolaCE(gl,el);
  }
  return res;
}

const fmt = n => new Intl.NumberFormat("it-IT",{minimumFractionDigits:0,maximumFractionDigits:0}).format(Math.round(n));
const fmtDec = n => new Intl.NumberFormat("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const col = n => n>=0 ? C.green : C.red;


// ─── EXCEL PARSER ────────────────────────────────────────────────────────────
async function parseExcelPrimaNota(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const XLSX = window.XLSX;
        // raw:true → SheetJS restituisce numeri JS nativi, evita formattazione locale errata
        const wb = XLSX.read(e.target.result, {type:"array", cellDates:true});
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, {header:1, defval:"", raw:true});

        // ── PASSATA 1: propaga ragione sociale e numero fattura ──────────────
        // La ragione sociale compare solo nella prima riga (riga SP) di ogni fattura
        // Le righe successive hanno K vuoto → propaghiamo dall'ultima non-vuota
        let lastNumFattura = "";
        let lastRagioneSociale = "";
        let lastData = "";
        const righeArricchite = [];
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          const numFatt = String(r[6]||"").trim();
          const ragSoc  = String(r[10]||"").trim();
          const dataDoc = String(r[5]||"").trim();
          if (numFatt) lastNumFattura = numFatt;
          if (ragSoc)  lastRagioneSociale = ragSoc;
          if (dataDoc) lastData = dataDoc;
          righeArricchite.push({
            row: r,
            numFattura: lastNumFattura,
            ragioneSociale: lastRagioneSociale,
            data: lastData,
          });
        }

        // ── PASSATA 2: filtra solo righe CE e leggi importi ─────────────────
        const righeRaw = [];
        for (const { row:r, numFattura, ragioneSociale, data } of righeArricchite) {
          const contoRaw = String(r[17]||"").replace(/[="'\s]/g,"");
          if (!contoRaw || !/^\d+$/.test(contoRaw)) continue;
          const entry = PIANO_CONTI[contoRaw];
          if (!entry || entry.cod >= 1000) continue;
          const codGest = entry.cod;

          // Importi: SheetJS con raw:false li restituisce come stringhe formattate
          // o come numeri JS. Normalizziamo entrambi i casi.
          const parseImp = v => {
            if (v === "" || v === null || v === undefined) return 0;
            // Con raw:true SheetJS restituisce già numeri JS nativi
            if (typeof v === "number") return v;
            // Fallback per celle testo: gestisce sia formato italiano (1.234,56)
            // che inglese (1,234.56) guardando qual è l'ultimo separatore
            const s = String(v).trim();
            const lastDot   = s.lastIndexOf(".");
            const lastComma = s.lastIndexOf(",");
            if (lastComma > lastDot) {
              // Formato italiano: punto=migliaia, virgola=decimale → "1.234,56"
              return parseFloat(s.replace(/\./g,"").replace(",",".")) || 0;
            } else {
              // Formato inglese o nessun separatore → "1,234.56" o "924.00"
              return parseFloat(s.replace(/,/g,"")) || 0;
            }
          };

          const dare  = parseImp(r[20]);
          const avere = parseImp(r[21]);
          const importoCE = avere - dare;

          righeRaw.push({ conto:contoRaw, data, numFattura, ragioneSociale, dare, avere, importoCE });
        }

        // ── PASSATA 3: raggruppa per (numFattura + ragioneSociale + conto) ───
        // Stessa fattura, stesso fornitore, stesso conto → una riga sola
        const mapKey = r => `${r.numFattura}||${r.ragioneSociale}||${r.conto}`;
        const grouped = {};
        for (const r of righeRaw) {
          const k = mapKey(r);
          if (!grouped[k]) {
            grouped[k] = { ...r, dare:0, avere:0, importoCE:0 };
          }
          grouped[k].dare     += r.dare;
          grouped[k].avere    += r.avere;
          grouped[k].importoCE += r.importoCE;
        }

        resolve(Object.values(grouped));
      } catch(err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ─── SHEETJS LOADER ──────────────────────────────────────────────────────────
function useSheetJSHook() {
  useEffect(() => {
    if (window.XLSX) return;
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    document.head.appendChild(s);
  }, []);
}

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────
function groupByConto(movimenti) {
  const map = {};
  for (const m of movimenti) {
    if (!map[m.conto]) map[m.conto] = { conto:m.conto, descrizione:m.descrizione, totale:0, movimenti:[] };
    map[m.conto].totale += m.importoCE;
    map[m.conto].movimenti.push(m);
  }
  return Object.values(map).sort((a,b) => Math.abs(b.totale)-Math.abs(a.totale));
}

function FattureModal({ conto, descrizione, movimentiConto, primaNotaRaw, onBack, onClose }) {
  const fatture = primaNotaRaw.filter(r => r.conto === conto);
  const totFatture = fatture.reduce((s,f) => s + f.importoCE, 0);
  const totContab  = movimentiConto.reduce((s,m) => s + m.importoCE, 0);
  const hasFatture = fatture.length > 0;

  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      {/* Sub-header */}
      <div style={{padding:"10px 20px",background:C.surfaceHigh,borderBottom:`1px solid ${C.border}`,
        display:"flex",alignItems:"center",gap:10}}>
        <button onClick={onBack} style={{background:"none",border:`1px solid ${C.border}`,
          borderRadius:5,color:C.textMid,padding:"3px 10px",cursor:"pointer",fontSize:10}}>
          ← conti
        </button>
        <div style={{flex:1}}>
          <span style={{fontFamily:"monospace",color:C.accent,fontSize:11}}>{conto}</span>
          <span style={{color:C.text,fontSize:12,marginLeft:8}}>{descrizione}</span>
        </div>
        <span style={{fontFamily:"monospace",fontWeight:700,color:col(totContab),fontSize:14}}>
          {fmt(totContab)}
        </span>
      </div>

      <div style={{overflowY:"auto",flex:1}}>
        {!hasFatture ? (
          <div style={{padding:"32px",textAlign:"center"}}>
            <div style={{fontSize:24,marginBottom:8}}>📂</div>
            <div style={{color:C.textMid,fontSize:12,marginBottom:4}}>
              Nessuna fattura trovata per il conto {conto}
            </div>
            <div style={{color:C.textDim,fontSize:10}}>
              Carica il file Excel della prima nota per vedere le fatture
            </div>
          </div>
        ) : (
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:C.surfaceHigh}}>
                {["Data","N° Fattura","Fornitore/Cliente","Dare","Avere","CE"].map((h,i)=>(
                  <th key={h} style={{padding:"7px 12px",textAlign:i>=3?"right":"left",
                    color:C.textDim,fontSize:9,fontWeight:700,letterSpacing:"0.07em",
                    borderBottom:`1px solid ${C.border}`}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fatture.map((f,i)=>(
                <tr key={i} style={{borderBottom:`1px solid ${C.border}18`}}
                  onMouseEnter={e=>e.currentTarget.style.background=C.surfaceHigh}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{padding:"7px 12px",fontSize:11,color:C.textMid,whiteSpace:"nowrap"}}>{f.data}</td>
                  <td style={{padding:"7px 12px",fontFamily:"monospace",fontSize:10,color:C.accent}}>{f.numFattura}</td>
                  <td style={{padding:"7px 12px",fontSize:12,color:C.text,maxWidth:220}}>{f.ragioneSociale}</td>
                  <td style={{padding:"7px 12px",textAlign:"right",fontFamily:"monospace",
                    fontSize:11,color:C.textMid}}>{f.dare>0?fmt(f.dare):"—"}</td>
                  <td style={{padding:"7px 12px",textAlign:"right",fontFamily:"monospace",
                    fontSize:11,color:C.textMid}}>{f.avere>0?fmt(f.avere):"—"}</td>
                  <td style={{padding:"7px 12px",textAlign:"right",fontFamily:"monospace",
                    fontSize:13,fontWeight:700,color:col(f.importoCE)}}>{fmtDec(f.importoCE)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{background:`${C.accent}0a`,borderTop:`1px solid ${C.accent}33`}}>
                <td colSpan={3} style={{padding:"7px 12px",color:C.textMid,fontSize:10}}>
                  Totale {fatture.length} fatture
                  {Math.abs(totFatture-totContab)>0.05 &&
                    <span style={{color:C.amber,marginLeft:8,fontSize:9}}>
                      ⚠ diff. con bilancio: {fmt(totFatture-totContab)}
                    </span>
                  }
                </td>
                <td colSpan={3} style={{padding:"7px 12px",textAlign:"right",fontFamily:"monospace",
                  fontWeight:800,color:col(totFatture)}}>{fmt(totFatture)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}

function DrillModal({ voce, gruppi, primaNotaRaw, onClose }) {
  const data = gruppi[String(voce.cod)];
  const [selectedConto, setSelectedConto] = useState(null);
  if (!data) return null;

  const conttiGruppati = groupByConto(data.movimenti.filter(m => !m.isExtra));
  const extraMovs = data.movimenti.filter(m => m.isExtra);

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000b",zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,
        borderRadius:12,width:"min(800px,96vw)",maxHeight:"82vh",display:"flex",
        flexDirection:"column",overflow:"hidden",boxShadow:"0 30px 100px #000a"}}>

        {/* Header principale */}
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,
          display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{color:C.textDim,fontSize:9,letterSpacing:"0.12em",marginBottom:2}}>
              CODICE {voce.cod} · {selectedConto ? "FATTURE" : "CONTI CONTABILI"}
            </div>
            <div style={{color:C.text,fontWeight:700,fontSize:15}}>{voce.label}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{color:col(data.totale),fontWeight:800,fontSize:18,fontFamily:"monospace"}}>
              {fmt(data.totale)}
            </span>
            <button onClick={onClose} style={{background:"none",border:`1px solid ${C.border}`,
              color:C.textMid,borderRadius:6,width:27,height:27,cursor:"pointer",fontSize:14}}>×</button>
          </div>
        </div>

        {/* Contenuto: livello 1 o livello 2 */}
        <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {selectedConto ? (
            <FattureModal
              conto={selectedConto.conto}
              descrizione={selectedConto.descrizione}
              movimentiConto={selectedConto.movimenti}
              primaNotaRaw={primaNotaRaw}
              onBack={()=>setSelectedConto(null)}
              onClose={onClose}
            />
          ) : (
            <div style={{overflowY:"auto",flex:1}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:C.surfaceHigh}}>
                    {["Conto","Descrizione","N° mov","Totale CE",""].map((h,i)=>(
                      <th key={i} style={{padding:"7px 14px",textAlign:i>=2?"right":"left",
                        color:C.textDim,fontSize:9,fontWeight:700,letterSpacing:"0.08em",
                        borderBottom:`1px solid ${C.border}`}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {conttiGruppati.map((cg,i)=>(
                    <tr key={i}
                      onClick={()=>setSelectedConto(cg)}
                      style={{borderBottom:`1px solid ${C.border}18`,cursor:"pointer"}}
                      onMouseEnter={e=>e.currentTarget.style.background=C.surfaceHigh}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{padding:"9px 14px",fontFamily:"monospace",fontSize:11,color:C.accent}}>
                        {cg.conto}
                      </td>
                      <td style={{padding:"9px 14px",fontSize:12,color:C.text}}>{cg.descrizione}</td>
                      <td style={{padding:"9px 14px",textAlign:"right",fontSize:11,color:C.textMid}}>
                        {cg.movimenti.length}
                      </td>
                      <td style={{padding:"9px 14px",textAlign:"right",fontFamily:"monospace",
                        fontSize:13,fontWeight:700,color:col(cg.totale)}}>{fmt(cg.totale)}</td>
                      <td style={{padding:"9px 14px",textAlign:"right",fontSize:10,color:C.textDim}}>
                        {primaNotaRaw.filter(r=>r.conto===cg.conto).length>0
                          ? <span style={{color:C.accent}}>fatture →</span>
                          : <span style={{color:C.textDim}}>→</span>
                        }
                      </td>
                    </tr>
                  ))}
                  {extraMovs.map((m,i)=>(
                    <tr key={"x"+i} style={{borderBottom:`1px solid ${C.border}18`,
                      background:`${C.amber}06`}}>
                      <td style={{padding:"9px 14px",fontFamily:"monospace",fontSize:11,color:C.amber}}>EXTRA</td>
                      <td style={{padding:"9px 14px",fontSize:12,color:C.textMid}}>{m.descrizione}</td>
                      <td style={{padding:"9px 14px",textAlign:"right",fontSize:11,color:C.textDim}}>—</td>
                      <td style={{padding:"9px 14px",textAlign:"right",fontFamily:"monospace",
                        fontSize:13,fontWeight:700,color:col(m.importoCE)}}>{fmt(m.importoCE)}</td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{padding:"8px 20px",borderTop:`1px solid ${C.border}`,color:C.textDim,fontSize:9,flexShrink:0}}>
          {selectedConto
            ? "clicca ← per tornare ai conti"
            : `${conttiGruppati.length} conti contabili · clicca un conto per vedere le fatture`}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{marginBottom:11}}>
      <label style={{color:C.textMid,fontSize:10,display:"block",marginBottom:3}}>{label}</label>
      {children}
    </div>
  );
}
const inputStyle = {width:"100%",background:C.surfaceHigh,border:`1px solid ${C.border}`,
  borderRadius:6,padding:"7px 10px",color:C.text,fontSize:12,outline:"none",boxSizing:"border-box"};
const selectStyle = {...inputStyle, fontSize:11};

function ExtraModal({ onSave, onClose }) {
  const vociInput = VOCI_CE.filter(v=>v.tipo==="input"&&typeof v.cod==="number");
  const [form,setForm] = useState({descrizione:"",codGest:410,importo:"",note:""});
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000b",zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,
        borderRadius:12,width:"min(450px,96vw)",padding:24,boxShadow:"0 30px 100px #000a"}}>
        <div style={{fontWeight:700,fontSize:15,color:C.text,marginBottom:16}}>✎ Scrittura generica</div>
        <Field label="Descrizione">
          <input style={inputStyle} placeholder="Es. Storno fattura" value={form.descrizione}
            onChange={e=>setForm(f=>({...f,descrizione:e.target.value}))}/>
        </Field>
        <Field label="Note">
          <input style={inputStyle} placeholder="Fornitore, n° fattura..." value={form.note}
            onChange={e=>setForm(f=>({...f,note:e.target.value}))}/>
        </Field>
        <Field label="Voce CE">
          <select style={selectStyle} value={form.codGest}
            onChange={e=>setForm(f=>({...f,codGest:parseInt(e.target.value)}))}>
            {vociInput.map(v=><option key={v.cod} value={v.cod}>{v.cod} – {v.label}</option>)}
          </select>
        </Field>
        <Field label="Importo CE (negativo = costo, positivo = ricavo)">
          <input style={inputStyle} type="number" placeholder="Es. -1250.00" value={form.importo}
            onChange={e=>setForm(f=>({...f,importo:e.target.value}))}/>
        </Field>
        <div style={{display:"flex",gap:9}}>
          <button onClick={onClose} style={{flex:1,padding:"9px",background:"none",
            border:`1px solid ${C.border}`,borderRadius:7,color:C.textMid,cursor:"pointer",fontSize:12}}>Annulla</button>
          <button onClick={()=>{
            if(!form.descrizione||!form.importo) return;
            onSave({...form,importo:parseFloat(form.importo)});
            onClose();
          }} style={{flex:2,padding:"9px",background:C.accent,border:"none",
            borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>Aggiungi</button>
        </div>
      </div>
    </div>
  );
}

function LocaleSelect({ value, onChange }) {
  return (
    <Field label="Locale">
      <select style={selectStyle} value={value} onChange={e=>onChange(parseInt(e.target.value)||null)}>
        {LOCALI.filter(l=>l.cc!==null).map(l=>(
          <option key={l.id} value={l.cc}>{l.label}</option>
        ))}
      </select>
    </Field>
  );
}

function RicorrentiPanel({ onSave, onClose }) {
  const [tab, setTab] = useState("fatture");
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000b",zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,
        borderRadius:12,width:"min(600px,96vw)",maxHeight:"90vh",display:"flex",flexDirection:"column",
        overflow:"hidden",boxShadow:"0 30px 100px #000a"}}>
        <div style={{padding:"16px 22px",borderBottom:`1px solid ${C.border}`}}>
          <div style={{color:C.textDim,fontSize:9,letterSpacing:"0.12em",marginBottom:6}}>SCRITTURE RICORRENTI</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {[
              {id:"fatture",   label:"📄 Competenza fatture"},
              {id:"personale", label:"👥 Personale & TFR"},
              {id:"budget",    label:"📊 Costi a budget"},
            ].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:"6px 12px",borderRadius:6,fontSize:11,fontWeight:tab===t.id?700:400,
                cursor:"pointer",border:`1px solid ${tab===t.id?C.accent:C.border}`,
                background:tab===t.id?C.accentDim:"none",
                color:tab===t.id?C.accent:C.textMid,
              }}>{t.label}</button>
            ))}
          </div>
        </div>
        <div style={{overflowY:"auto",padding:"20px 22px",flex:1}}>
          {tab==="fatture"   && <TabFatture   onSave={onSave} onClose={onClose}/>}
          {tab==="personale" && <TabPersonale onSave={onSave} onClose={onClose}/>}
          {tab==="budget"    && <TabBudget    onSave={onSave} onClose={onClose}/>}
        </div>
      </div>
    </div>
  );
}

let _fattureCounter = 0;
const newRowId = () => ++_fattureCounter;
const emptyRow = () => ({id:newRowId(),fornitore:"",importo:"",note:""});

function RowTable({rows, onAdd, onRemove, onUpdate, title, colorAccent}) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
        <span style={{color:colorAccent,fontSize:11,fontWeight:700}}>{title}</span>
        <button onClick={onAdd} style={{background:"none",border:`1px solid ${C.border}`,
          borderRadius:5,color:C.textMid,padding:"3px 10px",cursor:"pointer",fontSize:10}}>+ riga</button>
      </div>
      {rows.map(r=>(
        <div key={r.id} style={{display:"grid",gridTemplateColumns:"1fr 100px 1fr 24px",gap:5,marginBottom:5}}>
          <input style={inputStyle} placeholder="Fornitore" value={r.fornitore}
            onChange={e=>onUpdate(r.id,"fornitore",e.target.value)}/>
          <input style={inputStyle} type="number" placeholder="Importo" value={r.importo}
            onChange={e=>onUpdate(r.id,"importo",e.target.value)}/>
          <input style={inputStyle} placeholder="Note (n° fatt…)" value={r.note}
            onChange={e=>onUpdate(r.id,"note",e.target.value)}/>
          <button onClick={()=>onRemove(r.id)} style={{background:"none",
            border:`1px solid ${C.border}`,borderRadius:5,color:C.textDim,cursor:"pointer",fontSize:12}}>×</button>
        </div>
      ))}
    </div>
  );
}

function TabFatture({ onSave, onClose }) {
  const COD_OPTIONS = VOCI_CE
    .filter(v => v.tipo === "input" && typeof v.cod === "number")
    .map(v => ({cod:v.cod, label:`${v.cod} – ${v.label}`}));
  const [cod, setCod] = useState(200);
  const [ccLocale, setCcLocale] = useState(10);
  const [scarico, setScarico] = useState([emptyRow()]);
  const [carico,  setCarico]  = useState([emptyRow()]);

  const addRow    = (s) => s(r => [...r, emptyRow()]);
  const removeRow = (s, id) => s(r => r.filter(x => x.id !== id));
  const updateRow = (s, id, k, v) => s(r => r.map(x => x.id===id ? {...x,[k]:v} : x));

  const handleSave = () => {
    for (const r of scarico) {
      const imp = parseFloat(r.importo);
      if (!r.fornitore || !imp) continue;
      onSave({descrizione:`SCARICO comp.prec. – ${r.fornitore}`,
        note:r.note, codGest:cod, importo:imp, ccLocale, tipo:"ricorrente"});
    }
    for (const r of carico) {
      const imp = parseFloat(r.importo);
      if (!r.fornitore || !imp) continue;
      onSave({descrizione:`CARICO comp.corr. – ${r.fornitore}`,
        note:r.note, codGest:cod, importo:-imp, ccLocale, tipo:"ricorrente"});
    }
    onClose();
  };

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:4}}>
        <Field label="Codice gestionale">
          <select style={selectStyle} value={cod} onChange={e=>setCod(parseInt(e.target.value))}>
            {COD_OPTIONS.map(o=><option key={o.cod} value={o.cod}>{o.label}</option>)}
          </select>
        </Field>
        <LocaleSelect value={ccLocale} onChange={setCcLocale}/>
      </div>
      <div style={{color:C.textDim,fontSize:9,marginBottom:12,lineHeight:1.5}}>
        Le scritture vengono attribuite al locale selezionato e sommate al CE Totale al 100%.
      </div>
      <div style={{background:`${C.green}0a`,border:`1px solid ${C.green}33`,borderRadius:8,padding:"12px 14px",marginBottom:12}}>
        <div style={{color:C.textDim,fontSize:9,marginBottom:7}}>
          Fatture mese PRECEDENTE arrivate questo mese → storno (riduce il costo)
        </div>
        <RowTable rows={scarico} title="− Scarico mese precedente" colorAccent={C.green}
          onAdd={()=>addRow(setScarico)} onRemove={id=>removeRow(setScarico,id)}
          onUpdate={(id,k,v)=>updateRow(setScarico,id,k,v)}/>
      </div>
      <div style={{background:`${C.red}0a`,border:`1px solid ${C.red}33`,borderRadius:8,padding:"12px 14px",marginBottom:16}}>
        <div style={{color:C.textDim,fontSize:9,marginBottom:7}}>
          Fatture competenza mese CORRENTE arrivate mese prossimo → costo aggiuntivo
        </div>
        <RowTable rows={carico} title="+ Carico mese corrente" colorAccent={C.red}
          onAdd={()=>addRow(setCarico)} onRemove={id=>removeRow(setCarico,id)}
          onUpdate={(id,k,v)=>updateRow(setCarico,id,k,v)}/>
      </div>
      <SaveBar onClose={onClose} onSave={handleSave}/>
    </div>
  );
}

function TabPersonale({ onSave, onClose }) {
  const [importo, setImporto] = useState("");
  const [note, setNote] = useState("");
  const [ccLocale, setCcLocale] = useState(10);

  const handleSave = () => {
    const imp = parseFloat(importo);
    if (!imp) return;
    onSave({descrizione:"Ratei personale / TFR", note, codGest:410,
      importo:-Math.abs(imp), ccLocale, tipo:"ricorrente"});
    onClose();
  };

  return (
    <div>
      <div style={{color:C.textDim,fontSize:10,marginBottom:14,lineHeight:1.5}}>
        Scrittura mensile su codice 410 – Costo del personale. Inserisci il totale di ratei e TFR
        maturati nel mese e attribuiscili al locale di competenza.
      </div>
      <div style={{background:`${C.red}0a`,border:`1px solid ${C.red}33`,borderRadius:8,padding:"14px",marginBottom:16}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          <LocaleSelect value={ccLocale} onChange={setCcLocale}/>
          <Field label="Importo ratei + TFR (€)">
            <input style={inputStyle} type="number" placeholder="Es. 1800.00" value={importo}
              onChange={e=>setImporto(e.target.value)}/>
          </Field>
          <Field label="Note">
            <input style={inputStyle} placeholder="Es. TFR marzo" value={note}
              onChange={e=>setNote(e.target.value)}/>
          </Field>
        </div>
      </div>
      <SaveBar onClose={onClose} onSave={handleSave}/>
    </div>
  );
}

function TabBudget({ onSave, onClose }) {
  const VOCI_BUDGET = [
    {cod:465, label:"465 – Consulenze amministrative"},
    {cod:479, label:"479 – Assicurazioni"},
  ];
  const [righe, setRighe] = useState(
    VOCI_BUDGET.map(v=>({cod:v.cod,label:v.label,budgetAnnuo:"",override:"",note:""}))
  );
  const update = (cod,k,v) => setRighe(r=>r.map(x=>x.cod===cod?{...x,[k]:v}:x));

  const handleSave = () => {
    for (const r of righe) {
      const annuo = parseFloat(r.budgetAnnuo)||0;
      const mensile = r.override!=="" ? parseFloat(r.override)||0 : annuo/12;
      if (!mensile) continue;
      onSave({descrizione:`Budget ${r.label.split("–")[1]?.trim()||r.label}`,
        note:r.note, codGest:r.cod, importo:-Math.abs(mensile), tipo:"budget"});
    }
    onClose();
  };

  return (
    <div>
      <div style={{color:C.textDim,fontSize:10,marginBottom:14,lineHeight:1.5}}>
        Questi costi sostituiscono il valore contabile (codici 465 e 479). Il totale mensile
        viene allocato automaticamente sui locali in proporzione ai ricavi del mese.
      </div>
      {righe.map(r=>(
        <div key={r.cod} style={{background:`${C.amber}08`,border:`1px solid ${C.amber}33`,
          borderRadius:8,padding:"14px",marginBottom:12}}>
          <div style={{color:C.amber,fontSize:11,fontWeight:700,marginBottom:10}}>{r.label}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
            <Field label="Budget annuo (€)">
              <input style={inputStyle} type="number" placeholder="Es. 12000" value={r.budgetAnnuo}
                onChange={e=>update(r.cod,"budgetAnnuo",e.target.value)}/>
            </Field>
            <Field label={`÷12 = ${r.budgetAnnuo?fmt(Math.abs(parseFloat(r.budgetAnnuo)||0)/12):"—"} · override:`}>
              <input style={{...inputStyle,borderColor:r.override?C.amber:C.border}}
                type="number" placeholder="Quota mensile manuale" value={r.override}
                onChange={e=>update(r.cod,"override",e.target.value)}/>
            </Field>
            <Field label="Note">
              <input style={inputStyle} placeholder="Fornitore, contratto..." value={r.note}
                onChange={e=>update(r.cod,"note",e.target.value)}/>
            </Field>
          </div>
        </div>
      ))}
      <SaveBar onClose={onClose} onSave={handleSave}/>
    </div>
  );
}

function SaveBar({ onClose, onSave }) {
  return (
    <div style={{display:"flex",gap:9,paddingTop:4}}>
      <button onClick={onClose} style={{flex:1,padding:"9px",background:"none",
        border:`1px solid ${C.border}`,borderRadius:7,color:C.textMid,cursor:"pointer",fontSize:12}}>
        Annulla
      </button>
      <button onClick={onSave} style={{flex:2,padding:"9px",background:C.accent,border:"none",
        borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>
        ✓ Applica scritture
      </button>
    </div>
  );
}
const VOCI_CE_INPUT = VOCI_CE.filter(v => v.tipo === "input" && typeof v.cod === "number");
const CC_OPTIONS = [{cc:5,label:"5 – Indiretti"},{cc:10,label:"10 – Via 4"},{cc:20,label:"20 – Via Capp"},{cc:30,label:"30 – New"}];

function MappingPanel({ onClose, extraMapping, setExtraMapping, gruppiRaw }) {
  const [tab, setTab] = useState("modifica"); // modifica | aggiungi | nonmappati
  const [entries, setEntries] = useState(() => {
    // Merge PIANO_CONTI base + extraMapping
    const all = {};
    Object.entries(PIANO_CONTI).forEach(([c,v])=>{ all[c]={...v, isBase:true}; });
    Object.entries(extraMapping).forEach(([c,v])=>{ all[c]={...v, isBase:false}; });
    return all;
  });
  const [search, setSearch] = useState("");
  const [editConto, setEditConto] = useState(null);
  const [newConto, setNewConto] = useState({conto:"", cod:200, cc:10});
  const [saved, setSaved] = useState(false);

  const vociInput = VOCI_CE.filter(v=>v.tipo==="input"&&typeof v.cod==="number");
  const ccOpts = [{cc:5,label:"5 – Indiretti"},{cc:10,label:"10 – Via 4"},{cc:20,label:"20 – Via Capp"},{cc:30,label:"30 – New"}];
  const voceLabel = cod => vociInput.find(v=>v.cod===cod)?.label || String(cod);

  // Conti non mappati: presenti nel TXT ma non in PIANO_CONTI + extraMapping
  const merged = {...PIANO_CONTI, ...extraMapping};
  const nonMappati = gruppiRaw
    ? [] // calcolati sotto
    : [];

  // Ricava i conti non mappati dal testo raw del bilancio (via window per semplicità)
  const [rawContiNonMappati, setRawContiNonMappati] = useState([]);
  useEffect(() => {
    // Leggi i conti dal txtContentRef se disponibile
    const ref = window._txtContentRef;
    if (!ref) return;
    const lines = ref.split(/
?
/).filter(l=>l.trim());
    const nonMapp = [];
    for (const line of lines) {
      const parts = line.split(/	/).map(p=>p.trim());
      if (parts.length < 4) continue;
      const conto = parts[0].replace(/[="'\s]/g,"");
      if (!conto || !/^\d+$/.test(conto)) continue;
      const spce = parts[3]||"";
      if (spce.toUpperCase().includes("SP")) continue;
      if (!merged[conto]) {
        const desc = parts[2]||"";
        if (!nonMapp.find(x=>x.conto===conto))
          nonMapp.push({conto, descrizione:desc});
      }
    }
    setRawContiNonMappati(nonMapp.sort((a,b)=>a.conto.localeCompare(b.conto)));
  }, [tab]);

  function saveMapping(c, cod, cc) {
    setExtraMapping(m => ({...m, [c]:{cod,cc}}));
    setEntries(e => ({...e, [c]:{cod,cc,isBase:false}}));
  }

  function deleteMapping(c) {
    setExtraMapping(m => {const n={...m}; delete n[c]; return n;});
    setEntries(e => {
      const n={...e};
      if (PIANO_CONTI[c]) n[c]={...PIANO_CONTI[c],isBase:true};
      else delete n[c];
      return n;
    });
  }

  function addNew() {
    if (!newConto.conto.trim()) return;
    saveMapping(newConto.conto.trim(), newConto.cod, newConto.cc);
    setSaved(true);
    setTimeout(()=>setSaved(false),1500);
    setNewConto({conto:"",cod:200,cc:10});
  }

  const allEntries = Object.entries(entries)
    .filter(([,v])=>v.cod<1000)
    .sort((a,b)=>a[0].localeCompare(b[0]));

  const filtered = search.trim()
    ? allEntries.filter(([c,v])=>
        c.includes(search)||String(v.cod).includes(search)||
        voceLabel(v.cod).toLowerCase().includes(search.toLowerCase()))
    : allEntries;

  const tabStyle = (id) => ({
    padding:"6px 14px", borderRadius:6, fontSize:11, cursor:"pointer",
    fontWeight:tab===id?700:400,
    border:`1px solid ${tab===id?C.accent:C.border}`,
    background:tab===id?C.accentDim:"none",
    color:tab===id?C.accent:C.textMid,
  });

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000b",zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,
        borderRadius:12,width:"min(820px,97vw)",maxHeight:"88vh",display:"flex",
        flexDirection:"column",overflow:"hidden",boxShadow:"0 30px 100px #000a"}}>

        {/* Header */}
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,flexShrink:0,
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:C.textDim,fontSize:9,letterSpacing:"0.1em",marginBottom:4}}>GESTIONE PIANO DEI CONTI</div>
            <div style={{display:"flex",gap:6}}>
              <button style={tabStyle("modifica")} onClick={()=>setTab("modifica")}>📋 Mappatura</button>
              <button style={tabStyle("aggiungi")} onClick={()=>setTab("aggiungi")}>+ Nuovo conto</button>
              <button style={{...tabStyle("nonmappati"),
                borderColor:rawContiNonMappati.length>0&&tab!=="nonmappati"?C.amber:undefined,
                color:rawContiNonMappati.length>0&&tab!=="nonmappati"?C.amber:undefined}}
                onClick={()=>setTab("nonmappati")}>
                ⚠ Non mappati {rawContiNonMappati.length>0?`(${rawContiNonMappati.length})`:""}
              </button>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:`1px solid ${C.border}`,
            color:C.textMid,borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:14}}>×</button>
        </div>

        {/* TAB: MAPPATURA */}
        {tab==="modifica" && (<>
          <div style={{padding:"10px 20px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
            <input style={{...inputStyle,width:"100%"}}
              placeholder="Cerca per conto, codice gestionale o voce CE…"
              value={search} onChange={e=>setSearch(e.target.value)}/>
            <div style={{color:C.textDim,fontSize:9,marginTop:5}}>
              {filtered.length} conti · {allEntries.filter(([,v])=>!v.isBase).length} personalizzati
            </div>
          </div>
          <div style={{overflowY:"auto",flex:1}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:C.surfaceHigh,position:"sticky",top:0}}>
                  {["Conto","Voce CE","Centro di costo",""].map((h,i)=>(
                    <th key={i} style={{padding:"7px 14px",textAlign:"left",color:C.textDim,
                      fontSize:9,fontWeight:700,borderBottom:`1px solid ${C.border}`}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(([conto,v])=>{
                  const isEditing = editConto===conto;
                  const isExtra = !v.isBase;
                  return (
                    <tr key={conto}
                      style={{borderBottom:`1px solid ${C.border}18`,
                        background:isExtra?`${C.amber}07`:"transparent"}}
                      onMouseEnter={e=>e.currentTarget.style.background=isExtra?`${C.amber}0d`:C.surfaceHigh}
                      onMouseLeave={e=>e.currentTarget.style.background=isExtra?`${C.amber}07`:"transparent"}>
                      <td style={{padding:"7px 14px",fontFamily:"monospace",fontSize:11,
                        color:isExtra?C.amber:C.accent}}>
                        {conto}{isExtra&&<span style={{fontSize:8,marginLeft:4}}>✎</span>}
                      </td>
                      <td style={{padding:"7px 14px"}}>
                        {isEditing ? (
                          <select style={{...selectStyle,width:"auto",padding:"3px 6px",fontSize:11}}
                            defaultValue={v.cod}
                            onChange={el=>saveMapping(conto,parseInt(el.target.value),
                              extraMapping[conto]?.cc||v.cc)}>
                            {vociInput.map(vi=>(
                              <option key={vi.cod} value={vi.cod}>{vi.cod} – {vi.label.substring(0,30)}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{fontSize:11,color:C.text}}>{v.cod} – {voceLabel(v.cod)}</span>
                        )}
                      </td>
                      <td style={{padding:"7px 14px"}}>
                        {isEditing ? (
                          <select style={{...selectStyle,width:"auto",padding:"3px 6px",fontSize:11}}
                            defaultValue={v.cc}
                            onChange={el=>saveMapping(conto,
                              extraMapping[conto]?.cod||v.cod, parseInt(el.target.value))}>
                            {ccOpts.map(o=><option key={o.cc} value={o.cc}>{o.label}</option>)}
                          </select>
                        ) : (
                          <span style={{fontSize:11,color:C.textMid}}>
                            {ccOpts.find(o=>o.cc===v.cc)?.label||v.cc}
                          </span>
                        )}
                      </td>
                      <td style={{padding:"7px 10px",textAlign:"right",whiteSpace:"nowrap"}}>
                        <button onClick={()=>setEditConto(editConto===conto?null:conto)}
                          style={{background:"none",border:`1px solid ${C.border}`,borderRadius:5,
                            color:isEditing?C.green:C.textMid,padding:"3px 9px",cursor:"pointer",fontSize:10}}>
                          {isEditing?"✓ ok":"✎"}
                        </button>
                        {isExtra && (
                          <button onClick={()=>deleteMapping(conto)}
                            style={{background:"none",border:`1px solid ${C.red}44`,borderRadius:5,
                              color:C.red,padding:"3px 9px",cursor:"pointer",fontSize:10,marginLeft:5}}>
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>)}

        {/* TAB: AGGIUNGI */}
        {tab==="aggiungi" && (
          <div style={{padding:"20px",flex:1,overflowY:"auto"}}>
            <div style={{color:C.textDim,fontSize:10,marginBottom:16,lineHeight:1.5}}>
              Aggiungi un nuovo conto contabile alla mappatura. Sarà attivo immediatamente
              al prossimo caricamento del TXT.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"140px 1fr 1fr",gap:12,marginBottom:16}}>
              <Field label="Conto contabile">
                <input style={inputStyle} placeholder="Es. 804999"
                  value={newConto.conto}
                  onChange={e=>setNewConto(n=>({...n,conto:e.target.value}))}/>
              </Field>
              <Field label="Codice gestionale">
                <select style={selectStyle} value={newConto.cod}
                  onChange={e=>setNewConto(n=>({...n,cod:parseInt(e.target.value)}))}>
                  {vociInput.map(v=>(
                    <option key={v.cod} value={v.cod}>{v.cod} – {v.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Centro di costo">
                <select style={selectStyle} value={newConto.cc}
                  onChange={e=>setNewConto(n=>({...n,cc:parseInt(e.target.value)}))}>
                  {ccOpts.map(o=><option key={o.cc} value={o.cc}>{o.label}</option>)}
                </select>
              </Field>
            </div>
            <button onClick={addNew} disabled={!newConto.conto.trim()} style={{
              padding:"10px 24px",background:saved?C.green:C.accent,border:"none",
              borderRadius:7,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,
              opacity:!newConto.conto.trim()?0.4:1}}>
              {saved?"✓ Aggiunto!":"+ Aggiungi conto"}
            </button>
          </div>
        )}

        {/* TAB: NON MAPPATI */}
        {tab==="nonmappati" && (
          <div style={{flex:1,overflowY:"auto"}}>
            {rawContiNonMappati.length===0 ? (
              <div style={{padding:"40px",textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:12}}>✅</div>
                <div style={{color:C.text,fontSize:13,marginBottom:6}}>
                  Tutti i conti CE del TXT sono mappati
                </div>
                <div style={{color:C.textDim,fontSize:10}}>
                  {window._txtContentRef
                    ? "Nessun conto senza mappatura trovato nell'ultimo TXT caricato."
                    : "Carica un file TXT bilancio per vedere i conti non mappati."}
                </div>
              </div>
            ) : (
              <>
                <div style={{padding:"10px 20px",borderBottom:`1px solid ${C.border}`,
                  background:`${C.amber}08`,flexShrink:0}}>
                  <div style={{color:C.amber,fontSize:11,fontWeight:700}}>
                    ⚠ {rawContiNonMappati.length} conti trovati nel TXT senza mappatura
                  </div>
                  <div style={{color:C.textDim,fontSize:9,marginTop:3}}>
                    Questi conti vengono ignorati nel calcolo del CE. Mappali per includerli.
                  </div>
                </div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:C.surfaceHigh,position:"sticky",top:0}}>
                      {["Conto","Descrizione TXT","Voce CE","Centro di costo",""].map((h,i)=>(
                        <th key={i} style={{padding:"7px 14px",textAlign:"left",color:C.textDim,
                          fontSize:9,fontWeight:700,borderBottom:`1px solid ${C.border}`}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawContiNonMappati.map(({conto,descrizione})=>{
                      const isMapped = !!extraMapping[conto];
                      return (
                        <NonMappatoRow key={conto} conto={conto} descrizione={descrizione}
                          isMapped={isMapped} vociInput={vociInput} ccOpts={ccOpts}
                          onMap={(cod,cc)=>{saveMapping(conto,cod,cc);}}/>
                      );
                    })}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        <div style={{padding:"9px 20px",borderTop:`1px solid ${C.border}`,
          color:C.textDim,fontSize:9,flexShrink:0}}>
          Le modifiche sono attive subito · i conti base (grigio) non possono essere eliminati ma solo modificati
        </div>
      </div>
    </div>
  );
}

function NonMappatoRow({ conto, descrizione, isMapped, vociInput, ccOpts, onMap }) {
  const [cod, setCod] = useState(200);
  const [cc,  setCc]  = useState(10);
  const [done, setDone] = useState(isMapped);

  return (
    <tr style={{borderBottom:`1px solid ${C.border}18`,
      background:done?`${C.green}07`:"transparent"}}
      onMouseEnter={e=>e.currentTarget.style.background=done?`${C.green}0d`:C.surfaceHigh}
      onMouseLeave={e=>e.currentTarget.style.background=done?`${C.green}07`:"transparent"}>
      <td style={{padding:"7px 14px",fontFamily:"monospace",fontSize:11,
        color:done?C.green:C.amber}}>{conto}</td>
      <td style={{padding:"7px 14px",fontSize:11,color:C.textMid,maxWidth:200}}>{descrizione}</td>
      <td style={{padding:"6px 10px"}}>
        <select style={{...selectStyle,padding:"4px 6px",fontSize:10}}
          value={cod} onChange={e=>setCod(parseInt(e.target.value))}>
          {vociInput.map(v=><option key={v.cod} value={v.cod}>{v.cod} – {v.label.substring(0,28)}</option>)}
        </select>
      </td>
      <td style={{padding:"6px 10px"}}>
        <select style={{...selectStyle,padding:"4px 6px",fontSize:10}}
          value={cc} onChange={e=>setCc(parseInt(e.target.value))}>
          {ccOpts.map(o=><option key={o.cc} value={o.cc}>{o.label}</option>)}
        </select>
      </td>
      <td style={{padding:"6px 10px"}}>
        {done ? (
          <span style={{color:C.green,fontSize:11}}>✓ mappato</span>
        ) : (
          <button onClick={()=>{onMap(cod,cc);setDone(true);}}
            style={{background:C.accent,border:"none",borderRadius:5,color:"#fff",
              padding:"4px 10px",cursor:"pointer",fontSize:10,fontWeight:700}}>
            Mappa
          </button>
        )}
      </td>
    </tr>
  );
}


function CespitiPanel({ cespiti, setCespiti, allocConf, setAllocConf, onClose, gruppiRaw }) {
  const percRicavi = calcolaPercRicavi(gruppiRaw);
  const fracCespiti = calcolaFracCespiti(cespiti);
  const LOCALI_CC = LOCALI.filter(l=>l.cc!==null);
  const BUDGET_CODICI = [465,479];
  const codiciCC5 = [...new Set(Object.values(PIANO_CONTI).filter(e=>e.cc===5&&e.cod<1000).map(e=>e.cod))].filter(c=>!BUDGET_CODICI.includes(c)).sort((a,b)=>a-b);
  const voceLabel = cod => VOCI_CE.find(v=>v.cod===cod)?.label||String(cod);
  const getPct = (cod,cc) => {
    if(cod===430&&Object.values(fracCespiti).some(v=>Math.abs(v-1/3)>0.0001))return(fracCespiti[cc]*100).toFixed(1);
    if(allocConf[cod]?.[cc]!==undefined)return allocConf[cod][cc].toFixed(1);
    return(DEFAULT_FRACS[cc]*100).toFixed(4).replace(/\.?0+$/,"");
  };
  const isModified = cod => (cod===430&&Object.values(fracCespiti).some(v=>Math.abs(v-1/3)>0.0001))||allocConf[cod]!==undefined;
  const totalPct = cod => {
    const vals=[10,20,30].map(cc=>{
      if(cod===430&&Object.values(fracCespiti).some(v=>Math.abs(v-1/3)>0.0001))return fracCespiti[cc];
      if(allocConf[cod]?.[cc]!==undefined)return allocConf[cod][cc]/100;
      return DEFAULT_FRACS[cc];
    });
    return vals.reduce((s,v)=>s+v,0)*100;
  };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000b",zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.surface,border:`1px solid ${C.border}`,
        borderRadius:12,width:"min(760px,97vw)",maxHeight:"88vh",display:"flex",
        flexDirection:"column",overflow:"hidden",boxShadow:"0 30px 100px #000a"}}>
        <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,flexShrink:0,
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{color:C.textDim,fontSize:9,letterSpacing:"0.12em",marginBottom:2}}>ALLOCAZIONE COSTI INDIRETTI CC5</div>
            <div style={{color:C.text,fontWeight:700,fontSize:15}}>⚙ Coefficienti di ripartizione</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:`1px solid ${C.border}`,
            color:C.textMid,borderRadius:6,width:28,height:28,cursor:"pointer",fontSize:14}}>×</button>
        </div>
        <div style={{padding:"10px 20px",borderBottom:`1px solid ${C.border}`,flexShrink:0,
          display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div style={{background:`${C.green}08`,border:`1px solid ${C.green}22`,borderRadius:7,padding:"10px 12px"}}>
            <div style={{color:C.green,fontSize:9,fontWeight:700,marginBottom:6}}>💰 Budget 465/479 — proporzionale ai ricavi TXT</div>
            <div style={{display:"flex",gap:12}}>
              {LOCALI_CC.map(l=>(
                <div key={l.id} style={{textAlign:"center"}}>
                  <div style={{color:C.textDim,fontSize:8}}>{l.label}</div>
                  <div style={{color:C.green,fontWeight:700,fontSize:13,fontFamily:"monospace"}}>
                    {((percRicavi[l.cc]||0)*100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:`${C.accent}08`,border:`1px solid ${C.accent}22`,borderRadius:7,padding:"10px 12px"}}>
            <div style={{color:C.accent,fontSize:9,fontWeight:700,marginBottom:6}}>📋 Default altri codici (se non modificato)</div>
            <div style={{display:"flex",gap:12}}>
              {LOCALI_CC.map(l=>(
                <div key={l.id} style={{textAlign:"center"}}>
                  <div style={{color:C.textDim,fontSize:8}}>{l.label}</div>
                  <div style={{color:C.accent,fontWeight:700,fontSize:13,fontFamily:"monospace"}}>
                    {(DEFAULT_FRACS[l.cc]*100).toFixed(4).replace(/\.?0+$/,"")}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:C.surfaceHigh,position:"sticky",top:0}}>
                {["Cod","Voce CE",...LOCALI_CC.map(l=>l.label+" %"),"Totale",""].map((h,i)=>(
                  <th key={i} style={{padding:"7px 12px",textAlign:i>=2?"center":"left",
                    color:C.textDim,fontSize:9,fontWeight:700,borderBottom:`1px solid ${C.border}`}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codiciCC5.map(cod=>{
                const mod=isModified(cod);
                const tot=totalPct(cod);
                const totOk=Math.abs(tot-100)<0.2;
                return (
                  <tr key={cod} style={{borderBottom:`1px solid ${C.border}18`,
                    background:mod?`${C.amber}07`:"transparent"}}
                    onMouseEnter={e=>e.currentTarget.style.background=mod?`${C.amber}0d`:C.surfaceHigh}
                    onMouseLeave={e=>e.currentTarget.style.background=mod?`${C.amber}07`:"transparent"}>
                    <td style={{padding:"6px 12px",fontFamily:"monospace",fontSize:10,
                      color:mod?C.amber:C.textMid}}>{cod}{mod&&<span style={{fontSize:8,marginLeft:3}}>✎</span>}</td>
                    <td style={{padding:"6px 12px",fontSize:11,color:C.text}}>{voceLabel(cod)}</td>
                    {LOCALI_CC.map(l=>(
                      <td key={l.cc} style={{padding:"4px 6px",textAlign:"center"}}>
                        {cod===430?(
                          <span style={{color:C.amber,fontFamily:"monospace",fontSize:11,fontWeight:700}}>
                            {getPct(cod,l.cc)}%
                          </span>
                        ):(
                          <input type="number" min="0" max="100" step="0.1"
                            value={allocConf[cod]?.[l.cc]??""}
                            placeholder={getPct(cod,l.cc)}
                            onChange={e=>setAllocConf(a=>({...a,[cod]:{...(a[cod]||{}),
                              [l.cc]:parseFloat(e.target.value)||0}}))}
                            style={{width:"60px",background:C.surfaceHigh,border:`1px solid ${mod?C.amber:C.border}`,
                              borderRadius:4,padding:"3px 5px",color:C.text,fontSize:10,
                              textAlign:"center",outline:"none"}}/>
                        )}
                      </td>
                    ))}
                    <td style={{padding:"6px 10px",textAlign:"center",fontFamily:"monospace",
                      fontSize:10,fontWeight:700,color:totOk?C.green:C.red}}>
                      {tot.toFixed(1)}%
                    </td>
                    <td style={{padding:"6px 6px",textAlign:"center"}}>
                      {mod&&<button onClick={()=>{
                        setAllocConf(a=>{const n={...a};delete n[cod];return n;});
                        if(cod===430)setCespiti({10:"",20:"",30:""});
                      }} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:4,
                        color:C.textDim,padding:"2px 7px",cursor:"pointer",fontSize:9}}>reset</button>}
                    </td>
                  </tr>
                );
              })}
              <tr style={{borderTop:`2px solid ${C.amber}44`,background:`${C.amber}06`}}>
                <td colSpan={2} style={{padding:"8px 12px"}}>
                  <div style={{color:C.amber,fontSize:10,fontWeight:700,marginBottom:5}}>
                    🔧 Manutenzioni (430) — cespiti netti per locale
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    {LOCALI_CC.map(l=>(
                      <div key={l.cc}>
                        <div style={{color:C.textDim,fontSize:8,marginBottom:2}}>{l.label}</div>
                        <input style={{width:"90px",background:C.surfaceHigh,border:`1px solid ${C.border}`,
                          borderRadius:5,padding:"4px 7px",color:C.text,fontSize:10,outline:"none"}}
                          type="number" placeholder="0 €" value={cespiti[l.cc]||""}
                          onChange={e=>setCespiti(c=>({...c,[l.cc]:e.target.value}))}/>
                      </div>
                    ))}
                    {Object.values(fracCespiti).some(v=>Math.abs(v-1/3)>0.0001)&&(
                      <button onClick={()=>setCespiti({10:"",20:"",30:""})}
                        style={{background:"none",border:`1px solid ${C.border}`,borderRadius:4,
                          color:C.textDim,padding:"4px 7px",cursor:"pointer",fontSize:9,marginTop:14}}>
                        reset
                      </button>
                    )}
                  </div>
                </td>
                {LOCALI_CC.map(l=>(
                  <td key={l.cc} style={{padding:"8px 6px",textAlign:"center"}}>
                    <span style={{color:C.amber,fontFamily:"monospace",fontSize:12,fontWeight:700}}>
                      {(fracCespiti[l.cc]*100).toFixed(1)}%
                    </span>
                  </td>
                ))}
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{padding:"10px 20px",borderTop:`1px solid ${C.border}`,flexShrink:0,
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{color:C.textDim,fontSize:9}}>
            Lascia vuoto per usare il default 33.3% · le % devono sommare a 100
          </div>
          <button onClick={onClose} style={{padding:"8px 20px",background:C.accent,
            border:"none",borderRadius:7,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>
            ✓ Conferma
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN APP ────────────────────────────────────────────────────────────────
export default function AdminApp({ user }) {
  useSheetJSHook();
  const [gruppiRaw, setGruppiRaw] = useState({});
  const [extra, setExtra] = useState([]);
  const [drillVoce, setDrillVoce] = useState(null);
  const [showExtra, setShowExtra] = useState(false);
  const [showRicorrenti, setShowRicorrenti] = useState(false);
  const [showCoeff, setShowCoeff] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [primaNotaRaw, setPrimaNotaRaw] = useState([]);
  const [primaNotaName, setPrimaNotaName] = useState(null);
  const [primaNotaErr, setPrimaNotaErr] = useState(null);
  const [activeLocale, setActiveLocale] = useState("tot");
  const [cespiti, setCespiti] = useState({10:"", 20:"", 30:""});
  const [allocConf, setAllocConf] = useState({});
  const [extraMapping, setExtraMapping] = useState({});
  const [showMapping,  setShowMapping]  = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Carica config persistente da Supabase al mount
  useEffect(() => {
    async function loadConfig() {
      try {
        const { data } = await sb.from('config').select('*').eq('id','singleton').single();
        if (data) {
          if (data.mappatura_extra && Object.keys(data.mappatura_extra).length)
            setExtraMapping(data.mappatura_extra);
          if (data.alloc_conf && Object.keys(data.alloc_conf).length)
            setAllocConf(data.alloc_conf);
          if (data.cespiti && Object.keys(data.cespiti).length)
            setCespiti(data.cespiti);
        }
      } catch(e) { console.warn('Config load error:', e); }
      setConfigLoaded(true);
    }
    loadConfig();
  }, []);
  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState(null);
  const [mesiPubblicati, setMesiPubblicati] = useState([]);
  const sb = getSupabase();
  const txtContentRef = useRef(null);

  useEffect(() => {
    sb.from('mesi').select('id,mese,label,pubblicato_at')
      .order('mese',{ascending:false}).limit(24)
      .then(({data}) => setMesiPubblicati(data||[]));
  }, [publishMsg]);
  const [mese, setMese] = useState(()=>{
    const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  });
  const fileRef = useRef();
  const xlsxRef = useRef();
  const annoPrecRef = useRef(null);
  const bilancioRef = useRef(null);
  const [gruppiAnnoPrec, setGruppiAnnoPrec] = useState({});
  const [annoPrecName, setAnnoPrecName] = useState(null);
  const [gruppiBilancio, setGruppiBilancio] = useState({});
  const [bilancioName, setBilancioName] = useState(null);

  const handleFile = useCallback((file)=>{
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      txtContentRef.current = e.target.result;
      window._txtContentRef = e.target.result; // exposed for MappingPanel non-mapped detection
      const movimenti = parseTxt(e.target.result);
      setGruppiRaw(aggregaPerCodice(movimenti, extraMapping));
    };
    reader.readAsText(file,"UTF-8");
  },[]);  // extraMapping volutamente escluso: usiamo il ref sotto

  // Salva extraMapping su Supabase quando cambia (solo dopo il caricamento iniziale)
  useEffect(() => {
    if (!configLoaded) return;
    sb.from('config').upsert({id:'singleton', mappatura_extra:extraMapping, updated_at:new Date().toISOString()})
      .catch(e => console.warn('Errore salvataggio mappatura:', e));
    if (txtContentRef.current) {
      setGruppiRaw(aggregaPerCodice(parseTxt(txtContentRef.current), extraMapping));
    }
  }, [extraMapping, configLoaded]);

  // Salva allocConf su Supabase
  useEffect(() => {
    if (!configLoaded) return;
    sb.from('config').upsert({id:'singleton', alloc_conf:allocConf, updated_at:new Date().toISOString()})
      .catch(e => console.warn('Errore salvataggio coefficienti:', e));
  }, [allocConf, configLoaded]);

  // Salva cespiti su Supabase
  useEffect(() => {
    if (!configLoaded) return;
    sb.from('config').upsert({id:'singleton', cespiti:cespiti, updated_at:new Date().toISOString()})
      .catch(e => console.warn('Errore salvataggio cespiti:', e));
  }, [cespiti, configLoaded]);

  const handleXlsx = useCallback(async (file) => {
    setPrimaNotaErr(null);
    try {
      const fatture = await parseExcelPrimaNota(file);
      setPrimaNotaRaw(fatture);
      setPrimaNotaName(file.name);
    } catch(err) {
      setPrimaNotaErr("Errore lettura Excel: " + err.message);
    }
  },[]);

  const handleAnnoPrec = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = e => {
      const movimenti = parseTxt(e.target.result);
      setGruppiAnnoPrec(aggregaPerCodice(movimenti, extraMapping));
      setAnnoPrecName(file.name);
    };
    reader.readAsText(file, "UTF-8");
  }, [extraMapping]);

  const handleBilancio = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = e => {
      const movimenti = parseTxt(e.target.result);
      setGruppiBilancio(aggregaPerCodice(movimenti, extraMapping));
      setBilancioName(file.name);
    };
    reader.readAsText(file, "UTF-8");
  }, [extraMapping]);

  function handleExportJSON() {
    const meseFmt2 = mese
      ? new Date(mese+"-01").toLocaleDateString("it-IT",{month:"long",year:"numeric"})
      : mese;
    const payload = {
      mese,
      label: meseFmt2,
      dati_ce: gruppiRaw,
      dati_anno_prec: gruppiAnnoPrec,
      dati_bilancio: gruppiBilancio,
      prima_nota: primaNotaRaw,
      extra_scritture: extra,
      mappatura_extra: extraMapping,
      alloc_conf: allocConf,
      cespiti,
      esportato_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ce_${mese}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handlePublish() {
    if (!Object.keys(gruppiRaw).length) {
      setPublishMsg({ok:false, msg:'Carica almeno il bilancio TXT prima di pubblicare.'});
      return;
    }
    setPublishing(true); setPublishMsg(null);
    try {
      const meseFmt2 = mese ? new Date(mese+'-01').toLocaleDateString('it-IT',{month:'long',year:'numeric'}) : mese;
      const payload = {
        mese, label:meseFmt2,
        dati_ce:gruppiRaw, dati_anno_prec:gruppiAnnoPrec, dati_bilancio:gruppiBilancio,
        prima_nota:primaNotaRaw, extra_scritture:extra, mappatura_extra:extraMapping,
        alloc_conf:allocConf, cespiti, pubblicato_da:user?.id, pubblicato_at:new Date().toISOString(),
      };
      const existing = mesiPubblicati.find(m=>m.mese===mese);
      const {error} = existing
        ? await sb.from('mesi').update(payload).eq('id',existing.id)
        : await sb.from('mesi').insert(payload);
      if (error) throw error;
      setPublishMsg({ok:true, msg:`✓ ${meseFmt2} pubblicato. Il cliente può ora visualizzarlo.`});
    } catch(err) {
      setPublishMsg({ok:false, msg:'Errore: '+(err.message||JSON.stringify(err))});
    }
    setPublishing(false);
  }

  async function handleLogout() {
    try { await sb.auth.signOut(); } catch {}
    window.location.href = window.location.pathname;
  }

  const tuttiCE = calcolaTuttiCE(gruppiRaw, extra, allocConf, cespiti);
  const { vals, gruppi } = tuttiCE[activeLocale] || tuttiCE["tot"];
  const localeAttivo = LOCALI.find(l => l.id === activeLocale);

  const tuttiAnnoPrec   = calcolaTuttiCE(gruppiAnnoPrec, [], allocConf, cespiti);
  const tuttiBilancio   = calcolaTuttiCE(gruppiBilancio, [], allocConf, cespiti);
  const valsAP  = (tuttiAnnoPrec[activeLocale]  || tuttiAnnoPrec["tot"]).vals;
  const valsBil = (tuttiBilancio[activeLocale]  || tuttiBilancio["tot"]).vals;
  const ricaviMese = Math.abs(vals[100] || 0);
  const pct = (v) => ricaviMese > 0 ? ((v / ricaviMese) * 100).toFixed(1) + "%" : "—";
  const meseFmt = mese ? new Date(mese+"-01").toLocaleDateString("it-IT",{month:"long",year:"numeric"}) : "—";
  const nRicorrenti = extra.filter(e=>e.tipo==="ricorrente"||e.tipo==="budget").length;
  const nGeneriche  = extra.filter(e=>!e.tipo).length;

  return (
    <div style={{minHeight:"100vh",background:C.bg,
      fontFamily:"'IBM Plex Mono','Courier New',monospace",color:C.text,paddingBottom:60}}>

      {/* HEADER */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,
        padding:"14px 26px",display:"flex",justifyContent:"space-between",alignItems:"center",
        position:"sticky",top:0,zIndex:10}}>
        <div>
          <div style={{fontSize:9,color:C.textDim,letterSpacing:"0.14em",marginBottom:2}}>
            CONTO ECONOMICO RICLASSIFICATO
          </div>
          <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
            {LOCALI.map(l=>(
              <button key={l.id} onClick={()=>setActiveLocale(l.id)} style={{
                padding:"4px 12px",borderRadius:5,fontSize:11,fontWeight:activeLocale===l.id?700:400,
                cursor:"pointer",border:`1px solid ${activeLocale===l.id?C.accent:C.border}`,
                background:activeLocale===l.id?C.accentDim:"none",
                color:activeLocale===l.id?C.accent:C.textMid,
              }}>{l.label}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
          <input type="month" value={mese} onChange={e=>setMese(e.target.value)}
            style={{background:C.surfaceHigh,border:`1px solid ${C.border}`,borderRadius:6,
              padding:"6px 9px",color:C.text,fontSize:11}}/>
          <button onClick={()=>setShowMapping(true)} style={{
            background:"none",border:`1px solid ${C.borderLight}`,borderRadius:6,
            color:C.textMid,padding:"6px 13px",cursor:"pointer",fontSize:10,fontWeight:700}}>
            🗂 Mappatura
          </button>
          <button onClick={()=>setShowCoeff(true)} style={{
            background:"none",border:`1px solid ${C.borderLight}`,borderRadius:6,
            color:C.textMid,padding:"6px 13px",cursor:"pointer",fontSize:10,fontWeight:700}}>
            ⚙ Coefficienti
          </button>
          <button onClick={()=>setShowRicorrenti(true)} style={{
            background:C.amberDim,border:`1px solid ${C.amber}`,borderRadius:6,
            color:C.amber,padding:"6px 13px",cursor:"pointer",fontSize:10,fontWeight:700,
            position:"relative"}}>
            🔄 Ricorrenti
            {nRicorrenti>0 && <span style={{position:"absolute",top:-6,right:-6,background:C.amber,
              color:"#000",borderRadius:10,fontSize:8,padding:"1px 5px",fontWeight:800}}>{nRicorrenti}</span>}
          </button>
          <button onClick={()=>setShowExtra(true)} style={{
            background:C.surfaceHigh,border:`1px solid ${C.border}`,borderRadius:6,
            color:C.textMid,padding:"6px 13px",cursor:"pointer",fontSize:10,fontWeight:700,
            position:"relative"}}>
            ✎ Generica
            {nGeneriche>0 && <span style={{position:"absolute",top:-6,right:-6,background:C.textMid,
              color:"#000",borderRadius:10,fontSize:8,padding:"1px 5px",fontWeight:800}}>{nGeneriche}</span>}
          </button>
          <button onClick={()=>fileRef.current.click()} style={{background:C.accent,
            border:"none",borderRadius:6,color:"#fff",
            padding:"6px 13px",cursor:"pointer",fontSize:10,fontWeight:700}}>↑ Bilancio TXT</button>
          <input ref={fileRef} type="file" accept=".txt,.csv" style={{display:"none"}}
            onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
          <button onClick={()=>xlsxRef.current.click()} style={{
            background: primaNotaName ? C.greenDim : C.surfaceHigh,
            border:`1px solid ${primaNotaName ? C.green : C.border}`,borderRadius:6,
            color:primaNotaName?C.green:C.textMid,
            padding:"6px 13px",cursor:"pointer",fontSize:10,fontWeight:700}}>
            {primaNotaName ? "✓ Prima Nota" : "↑ Prima Nota XLS"}
          </button>
          <input ref={xlsxRef} type="file" accept=".xlsx,.xls" style={{display:"none"}}
            onChange={e=>e.target.files[0]&&handleXlsx(e.target.files[0])}/>
          <button onClick={()=>annoPrecRef.current.click()} style={{
            background: annoPrecName ? `${C.purple}22` : C.surfaceHigh,
            border:`1px solid ${annoPrecName ? C.purple : C.border}`,borderRadius:6,
            color:annoPrecName?C.purple:C.textMid,
            padding:"6px 13px",cursor:"pointer",fontSize:10,fontWeight:700}}>
            {annoPrecName ? "✓ Anno Prec." : "↑ Anno Prec. TXT"}
          </button>
          <input ref={annoPrecRef} type="file" accept=".txt,.csv" style={{display:"none"}}
            onChange={e=>e.target.files[0]&&handleAnnoPrec(e.target.files[0])}/>
          <button onClick={()=>bilancioRef.current.click()} style={{
            background: bilancioName ? `${C.amber}22` : C.surfaceHigh,
            border:`1px solid ${bilancioName ? C.amber : C.border}`,borderRadius:6,
            color:bilancioName?C.amber:C.textMid,
            padding:"6px 13px",cursor:"pointer",fontSize:10,fontWeight:700}}>
            {bilancioName ? "✓ Bil. Approvato" : "↑ Bil. Approvato TXT"}
          </button>
          <input ref={bilancioRef} type="file" accept=".txt,.csv" style={{display:"none"}}
            onChange={e=>e.target.files[0]&&handleBilancio(e.target.files[0])}/>
          <button onClick={handlePublish} disabled={publishing} style={{
            background:C.accent,border:"none",borderRadius:6,color:"#fff",
            padding:"6px 16px",cursor:publishing?"wait":"pointer",
            fontSize:10,fontWeight:800,opacity:publishing?0.7:1}}>
            {publishing?"…":"⬆ Pubblica"}
          </button>
          <button onClick={handleLogout} style={{background:"none",
            border:`1px solid ${C.border}`,borderRadius:5,color:C.textMid,
            padding:"5px 10px",cursor:"pointer",fontSize:9}}>
            Esci
          </button>
          <button onClick={handleLogout} style={{background:"none",
            border:`1px solid ${C.border}`,borderRadius:5,color:C.textMid,
            padding:"5px 10px",cursor:"pointer",fontSize:9}}>
            Esci
          </button>

        </div>
      </div>

      <div style={{maxWidth:820,margin:"0 auto",padding:"24px 18px"}}>


        {publishMsg && (
          <div style={{background:publishMsg.ok?C.greenDim:C.redDim,
            border:`1px solid ${publishMsg.ok?C.green:C.red}`,
            borderRadius:8,padding:"10px 16px",marginBottom:14,
            display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:publishMsg.ok?C.green:C.red,fontSize:11}}>{publishMsg.msg}</span>
            <button onClick={()=>setPublishMsg(null)} style={{background:"none",
              border:"none",color:publishMsg.ok?C.green:C.red,cursor:"pointer",fontSize:14}}>×</button>
          </div>
        )}
        {mesiPubblicati.length>0 && (
          <div style={{marginBottom:14,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <span style={{color:C.textDim,fontSize:9}}>Già pubblicati:</span>
            {mesiPubblicati.map(m=>(
              <span key={m.id} style={{background:C.surfaceHigh,border:`1px solid ${C.border}`,
                borderRadius:4,padding:"2px 8px",fontSize:9,color:C.textMid}}>
                {m.label||m.mese}
              </span>
            ))}
          </div>
        )}

        {!fileName && (
          <div onDrop={e=>{e.preventDefault();e.dataTransfer.files[0]&&handleFile(e.dataTransfer.files[0]);}}
            onDragOver={e=>e.preventDefault()} onClick={()=>fileRef.current.click()}
            style={{border:`2px dashed ${C.borderLight}`,borderRadius:12,
              padding:"48px 26px",textAlign:"center",cursor:"pointer",marginBottom:24}}>
            <div style={{fontSize:34,marginBottom:10}}>📄</div>
            <div style={{color:C.text,fontSize:14,marginBottom:5}}>
              Trascina il TXT del bilancio o clicca per caricare
            </div>
            <div style={{color:C.textDim,fontSize:10,marginBottom:16}}>
              Formato gestionale: ="CONTO" TAB (vuoto) TAB DESCRIZIONE TAB SP/CE TAB D/A TAB DARE TAB AVERE
            </div>
            <button onClick={e=>{e.stopPropagation();loadDemo(setGruppiRaw,setFileName);}}
              style={{background:"none",border:`1px solid ${C.borderLight}`,borderRadius:6,
                color:C.textMid,padding:"6px 14px",cursor:"pointer",fontSize:10}}>
              oppure carica dati demo
            </button>
          </div>
        )}

        {fileName && (
          <div style={{background:C.surfaceHigh,borderRadius:8,padding:"8px 14px",
            marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:C.textMid,fontSize:10}}>
              📄 {fileName} · {Object.keys(gruppiRaw).length} codici gestionali mappati
            </span>
            <button onClick={()=>{setGruppiRaw({});setExtra([]);setFileName(null);}}
              style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:10}}>
              × rimuovi
            </button>
          </div>
        )}
        {primaNotaName && (
          <div style={{background:`${C.green}0a`,border:`1px solid ${C.green}33`,borderRadius:8,
            padding:"8px 14px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:C.green,fontSize:10}}>
              📊 Prima nota: {primaNotaName} · {primaNotaRaw.length} righe CE caricate
            </span>
            <button onClick={()=>{setPrimaNotaRaw([]);setPrimaNotaName(null);}}
              style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:10}}>
              × rimuovi
            </button>
          </div>
        )}
        {primaNotaErr && (
          <div style={{background:`${C.red}0a`,border:`1px solid ${C.red}33`,borderRadius:8,
            padding:"8px 14px",marginBottom:6}}>
            <span style={{color:C.red,fontSize:10}}>{primaNotaErr}</span>
          </div>
        )}
        {annoPrecName && (
          <div style={{background:`${C.purple}0a`,border:`1px solid ${C.purple}33`,borderRadius:8,
            padding:"8px 14px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:C.purple,fontSize:10}}>📅 Anno prec.: {annoPrecName}</span>
            <button onClick={()=>{setGruppiAnnoPrec({});setAnnoPrecName(null);}}
              style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:10}}>× rimuovi</button>
          </div>
        )}
        {bilancioName && (
          <div style={{background:`${C.amber}0a`,border:`1px solid ${C.amber}33`,borderRadius:8,
            padding:"8px 14px",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:C.amber,fontSize:10}}>📋 Bil. approvato: {bilancioName}</span>
            <button onClick={()=>{setGruppiBilancio({});setBilancioName(null);}}
              style={{background:"none",border:"none",color:C.textDim,cursor:"pointer",fontSize:10}}>× rimuovi</button>
          </div>
        )}
        {(fileName||primaNotaName||annoPrecName||bilancioName) && <div style={{marginBottom:12}}/>}

        {/* Badge scritture attive */}
        {extra.length > 0 && (
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
            {extra.map((ex,i)=>(
              <div key={i} style={{
                background:C.surfaceHigh,
                border:`1px solid ${ex.tipo==="ricorrente"||ex.tipo==="budget"?C.amber+"66":C.border}`,
                borderRadius:20,padding:"3px 9px",fontSize:9,color:C.textMid,
                display:"flex",gap:6,alignItems:"center"}}>
                <span style={{color:ex.tipo==="ricorrente"||ex.tipo==="budget"?C.amber:C.textDim}}>
                  {ex.tipo==="ricorrente"?"🔄":ex.tipo==="budget"?"📊":"✎"}
                </span>
                {ex.descrizione}
                <span style={{color:col(ex.importo),fontWeight:700}}>{fmt(ex.importo)}</span>
                <span onClick={()=>setExtra(e=>e.filter((_,j)=>j!==i))}
                  style={{cursor:"pointer",color:C.textDim}}>×</span>
              </div>
            ))}
          </div>
        )}

        {/* TABELLA CE */}
        <div style={{background:C.surface,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          {/* Intestazione */}
          <div style={{display:"grid",gridTemplateColumns:"48px 1fr 100px 58px 100px 100px",
            padding:"8px 16px",background:C.surfaceHigh,borderBottom:`1px solid ${C.border}`}}>
            <span style={{color:C.textDim,fontSize:8,letterSpacing:"0.08em"}}>COD</span>
            <span style={{color:C.textDim,fontSize:8,letterSpacing:"0.08em"}}>VOCE</span>
            <span style={{color:C.textDim,fontSize:8,textAlign:"right"}}>MESE €</span>
            <span style={{color:C.textDim,fontSize:8,textAlign:"right"}}>% RIC.</span>
            <span style={{color:C.purple,fontSize:8,textAlign:"right",opacity:annoPrecName?1:0.35}}>
              ANNO PREC.
            </span>
            <span style={{color:C.amber,fontSize:8,textAlign:"right",opacity:bilancioName?1:0.35}}>
              BIL. APPROV.
            </span>
          </div>

          {VOCI_CE.map((voce,i)=>{
            const val    = vals[voce.cod]    ?? 0;
            const valAP  = valsAP[voce.cod]  ?? 0;
            const valBil = valsBil[voce.cod] ?? 0;

            const ColsSubtot = ({}) => (<>
              <span style={{textAlign:"right",fontFamily:"monospace",fontSize:12,fontWeight:800,color:col(val)}}>{fmt(val)}</span>
              <span style={{textAlign:"right",fontSize:10,fontWeight:600,color:C.textMid}}>{pct(val)}</span>
              <span style={{textAlign:"right",fontFamily:"monospace",fontSize:11,fontWeight:700,
                color:annoPrecName?col(valAP):C.textDim,opacity:annoPrecName?1:0.3}}>
                {annoPrecName?fmt(valAP):"—"}
              </span>
              <span style={{textAlign:"right",fontFamily:"monospace",fontSize:11,fontWeight:700,
                color:bilancioName?col(valBil):C.textDim,opacity:bilancioName?1:0.3}}>
                {bilancioName?fmt(valBil):"—"}
              </span>
            </>);

            if (voce.tipo==="subtot") return (
              <div key={i} style={{display:"grid",gridTemplateColumns:"48px 1fr 100px 58px 100px 100px",
                padding:"8px 16px",background:`${C.amber}0a`,borderTop:`1px solid ${C.amber}33`}}>
                <span></span>
                <span style={{color:C.amber,fontSize:10,fontWeight:700,letterSpacing:"0.05em"}}>
                  {voce.label.toUpperCase()}
                </span>
                <ColsSubtot/>
              </div>
            );

            if (voce.tipo==="result") return (
              <div key={i} style={{display:"grid",gridTemplateColumns:"48px 1fr 100px 58px 100px 100px",
                padding:"11px 16px",
                background: val>=0 ? `${C.green}15` : `${C.red}15`,
                borderTop:`2px solid ${val>=0?C.green:C.red}`}}>
                <span></span>
                <span style={{color:col(val),fontSize:13,fontWeight:800,letterSpacing:"0.04em"}}>
                  {voce.label.toUpperCase()}
                </span>
                <span style={{textAlign:"right",fontFamily:"monospace",fontSize:15,fontWeight:800,color:col(val)}}>{fmt(val)}</span>
                <span style={{textAlign:"right",fontSize:10,fontWeight:700,color:C.textMid}}>{pct(val)}</span>
                <span style={{textAlign:"right",fontFamily:"monospace",fontSize:13,fontWeight:700,
                  color:annoPrecName?col(valAP):C.textDim,opacity:annoPrecName?1:0.3}}>
                  {annoPrecName?fmt(valAP):"—"}
                </span>
                <span style={{textAlign:"right",fontFamily:"monospace",fontSize:13,fontWeight:700,
                  color:bilancioName?col(valBil):C.textDim,opacity:bilancioName?1:0.3}}>
                  {bilancioName?fmt(valBil):"—"}
                </span>
              </div>
            );

            if (voce.tipo==="stima") return (
              <div key={i} style={{display:"grid",gridTemplateColumns:"48px 1fr 100px 58px 100px 100px",
                padding:"7px 16px",borderTop:`1px solid ${C.border}22`}}>
                <span style={{fontFamily:"monospace",fontSize:9,color:C.textDim}}>{voce.cod}</span>
                <span style={{color:C.textMid,fontSize:11,fontStyle:"italic"}}>{voce.label}</span>
                <span style={{textAlign:"right",fontFamily:"monospace",fontSize:11,color:val===0?C.textDim:col(val)}}>{val===0?"—":fmt(val)}</span>
                <span style={{textAlign:"right",fontSize:9,color:C.textDim}}>{pct(val)}</span>
                <span style={{textAlign:"right",fontFamily:"monospace",fontSize:10,
                  color:annoPrecName?col(valAP):C.textDim,opacity:annoPrecName?1:0.3}}>
                  {annoPrecName?fmt(valAP):"—"}
                </span>
                <span style={{textAlign:"right",fontFamily:"monospace",fontSize:10,
                  color:bilancioName?col(valBil):C.textDim,opacity:bilancioName?1:0.3}}>
                  {bilancioName?fmt(valBil):"—"}
                </span>
              </div>
            );

            const key = String(voce.cod);
            const hasData = gruppi[key]?.movimenti?.length > 0;
            return (
              <div key={i} onClick={hasData?()=>setDrillVoce(voce):undefined}
                style={{display:"grid",gridTemplateColumns:"48px 1fr 100px 58px 100px 100px",
                  padding:"7px 16px",borderTop:`1px solid ${C.border}18`,
                  cursor:hasData?"pointer":"default",transition:"background 0.12s"}}
                onMouseEnter={e=>{if(hasData)e.currentTarget.style.background=C.surfaceHigh}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent"}}>
                <span style={{fontFamily:"monospace",fontSize:9,color:C.textDim,paddingTop:2}}>
                  {voce.cod}
                </span>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{color:C.text,fontSize:12}}>{voce.label}</span>
                  {hasData && (
                    <span style={{background:C.accentDim,color:C.accent,borderRadius:3,fontSize:8,padding:"1px 4px"}}>
                      {gruppi[key].movimenti.length} mov
                    </span>
                  )}
                  {hasData && gruppi[key].movimenti.some(m=>m.isExtra) && (
                    <span style={{color:C.amber,fontSize:8}}>🔄</span>
                  )}
                </div>
                <span style={{textAlign:"right",fontFamily:"monospace",fontSize:12,
                  color:val===0?C.textDim:col(val)}}>
                  {val===0?"—":fmt(val)}
                </span>
                <span style={{textAlign:"right",fontSize:10,color:C.textDim}}>{val===0?"—":pct(val)}</span>
                <span style={{textAlign:"right",fontFamily:"monospace",fontSize:11,
                  color:annoPrecName?(valAP===0?C.textDim:col(valAP)):C.textDim,
                  opacity:annoPrecName?1:0.3}}>
                  {annoPrecName?(valAP===0?"—":fmt(valAP)):"—"}
                </span>
                <span style={{textAlign:"right",fontFamily:"monospace",fontSize:11,
                  color:bilancioName?(valBil===0?C.textDim:col(valBil)):C.textDim,
                  opacity:bilancioName?1:0.3}}>
                  {bilancioName?(valBil===0?"—":fmt(valBil)):"—"}
                </span>
              </div>
            );
          })}
        </div>

        {Object.keys(gruppiRaw).length>0 && (
          <div style={{marginTop:10,color:C.textDim,fontSize:9,textAlign:"center"}}>
            clicca su qualsiasi voce con badge "mov" per il drill-down · 🔄 = include scritture ricorrenti
          </div>
        )}
      </div>

      {drillVoce && <DrillModal voce={drillVoce} gruppi={gruppi} primaNotaRaw={primaNotaRaw} onClose={()=>setDrillVoce(null)}/>}
      {showMapping && <MappingPanel extraMapping={extraMapping} setExtraMapping={setExtraMapping} gruppiRaw={gruppiRaw} onClose={()=>setShowMapping(false)}/>}
      {showCoeff && <CespitiPanel cespiti={cespiti} setCespiti={setCespiti} allocConf={allocConf} setAllocConf={setAllocConf} gruppiRaw={gruppiRaw} onClose={()=>setShowCoeff(false)}/>}
      {showExtra && <ExtraModal onSave={ex=>setExtra(e=>[...e,ex])} onClose={()=>setShowExtra(false)}/>}
      {showRicorrenti && <RicorrentiPanel onSave={ex=>setExtra(e=>[...e,ex])} onClose={()=>setShowRicorrenti(false)}/>}
    </div>
  );
}
