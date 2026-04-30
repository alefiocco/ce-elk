// ─── COSTANTI ─────────────────────────────────────────────────────────────────

export const LOCALI = [
  { id:"tot",  label:"Totale",   cc: null },
  { id:"via4", label:"Via 4",    cc: 10   },
  { id:"capp", label:"Via Capp", cc: 20   },
  { id:"new",  label:"New",      cc: 30   },
];

export const CC_LABELS = { 5:"Indiretti", 10:"Via 4", 20:"Via Capp", 30:"New" };

export const VOCI_CE = [
  { cod:100,  label:"Ricavi netti di Vendita",                 tipo:"input",  segno: 1 },
  { cod:200,  label:"Acquisti materie prime",                  tipo:"input",  segno:-1 },
  { cod:215,  label:"Var.ne Rim. Merci (RI-RF)",               tipo:"input",  segno:-1 },
  { cod:240,  label:"Altri costi variabili",                   tipo:"input",  segno:-1 },
  { cod:"CV", label:"Costi Variabili",                         tipo:"subtot" },
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
  { cod:"CF", label:"Costi Fissi",                             tipo:"subtot" },
  { cod:"EBIT",label:"Risultato operativo [EBIT]",             tipo:"result" },
  { cod:500,  label:"+/- Risultato gest. Finanziaria",         tipo:"input",  segno: 1 },
  { cod:700,  label:"+/- Risultato gestione Straordinaria",    tipo:"input",  segno: 1 },
  { cod:"RAI",label:"Risultato ante imposte",                  tipo:"result" },
  { cod:800,  label:"Imposte sul reddito (stima 30%)",         tipo:"stima" },
  { cod:"RN", label:"Risultato Netto",                         tipo:"result" },
];

export const PIANO_CONTI = {
  "801300":{cod:415,cc:10},"801400":{cod:200,cc:10},"801601":{cod:415,cc:10},
  "801700":{cod:415,cc:10},"804220":{cod:455,cc:10},"804400":{cod:476,cc:10},
  "804450":{cod:475,cc:5}, "804508":{cod:455,cc:10},"804516":{cod:435,cc:5},
  "804525":{cod:465,cc:5}, "804526":{cod:476,cc:10},"804527":{cod:475,cc:10},
  "804528":{cod:479,cc:10},"804530":{cod:436,cc:5}, "804534":{cod:476,cc:5},
  "804536":{cod:436,cc:5}, "804538":{cod:436,cc:5}, "804541":{cod:430,cc:10},
  "804543":{cod:436,cc:5}, "804553":{cod:475,cc:5}, "804700":{cod:481,cc:5},
  "805100":{cod:482,cc:10},"810000":{cod:410,cc:10},"810001":{cod:410,cc:5},
  "811020":{cod:410,cc:10},"812000":{cod:410,cc:10},"813001":{cod:410,cc:5},
  "820050":{cod:400,cc:5}, "820400":{cod:400,cc:10},"820604":{cod:400,cc:5},
  "821500":{cod:400,cc:10},"821501":{cod:400,cc:10},"821606":{cod:400,cc:10},
  "821610":{cod:400,cc:10},"821700":{cod:400,cc:10},"821701":{cod:400,cc:10},
  "830100":{cod:215,cc:5}, "835100":{cod:480,cc:5}, "835105":{cod:480,cc:5},
  "835106":{cod:480,cc:5}, "835109":{cod:475,cc:10},"835111":{cod:700,cc:5},
  "835113":{cod:480,cc:5}, "835116":{cod:480,cc:5}, "835120":{cod:415,cc:5},
  "835122":{cod:480,cc:10},"835123":{cod:480,cc:5}, "835205":{cod:700,cc:5},
  "835401":{cod:475,cc:5}, "835402":{cod:475,cc:5}, "843104":{cod:500,cc:5},
  "843109":{cod:500,cc:5}, "870001":{cod:800,cc:5}, "870002":{cod:800,cc:5},
  "901113":{cod:100,cc:10},"901400":{cod:100,cc:10},"902100":{cod:215,cc:5},
  "905102":{cod:700,cc:5}, "905300":{cod:700,cc:5}, "804265":{cod:455,cc:5},
  "804504":{cod:416,cc:5}, "804549":{cod:445,cc:5}, "804550":{cod:477,cc:10},
  "804569":{cod:430,cc:10},"805105":{cod:405,cc:10},"821506":{cod:400,cc:10},
  "835104":{cod:480,cc:5}, "801114":{cod:415,cc:10},"801402":{cod:240,cc:10},
  "804210":{cod:455,cc:5}, "804315":{cod:475,cc:10},"804524":{cod:430,cc:10},
  "804544":{cod:479,cc:5}, "804548":{cod:475,cc:5}, "805350":{cod:405,cc:5},
  "835403":{cod:436,cc:5}, "860105":{cod:700,cc:5}, "901111":{cod:475,cc:5},
  "940000":{cod:500,cc:5}, "811000":{cod:410,cc:5}, "813000":{cod:410,cc:5},
  "804221":{cod:240,cc:5}, "835112":{cod:475,cc:5}, "801705":{cod:475,cc:5},
  "901500":{cod:100,cc:5}, "905104":{cod:100,cc:5}, "931002":{cod:100,cc:5},
  "804531":{cod:436,cc:5}, "906300":{cod:700,cc:5}, "820702":{cod:400,cc:5},
  "801550":{cod:445,cc:5}, "804310":{cod:477,cc:5}, "801405":{cod:415,cc:10},
  "804540":{cod:430,cc:5}, "801100":{cod:200,cc:10},"804710":{cod:481,cc:20},
  "843101":{cod:500,cc:20},"813002":{cod:410,cc:5}, "820100":{cod:400,cc:20},
  "804900":{cod:445,cc:20},"804901":{cod:430,cc:20},"820802":{cod:400,cc:5},
  "970004":{cod:700,cc:10},"820402":{cod:400,cc:20},"821609":{cod:400,cc:5},
  "804401":{cod:476,cc:10},"804906":{cod:476,cc:20},"820114":{cod:400,cc:20},
  "821615":{cod:400,cc:20},"804551":{cod:479,cc:20},"804517":{cod:416,cc:20},
  "801730":{cod:455,cc:5}, "821515":{cod:400,cc:5}, "821601":{cod:400,cc:5},
  "801900":{cod:415,cc:20},"801901":{cod:200,cc:20},"801903":{cod:415,cc:20},
  "801904":{cod:415,cc:20},"801905":{cod:415,cc:20},"804503":{cod:455,cc:5},
  "804573":{cod:490,cc:5}, "804904":{cod:455,cc:20},"805101":{cod:482,cc:20},
  "835121":{cod:415,cc:20},"804529":{cod:455,cc:20},"804907":{cod:476,cc:20},
  "804911":{cod:476,cc:20},"810003":{cod:410,cc:20},"811021":{cod:410,cc:20},
  "821708":{cod:400,cc:20},"901600":{cod:100,cc:20},"901601":{cod:100,cc:20},
  "905301":{cod:100,cc:5}, "804908":{cod:430,cc:20},"804910":{cod:475,cc:20},
  "820601":{cod:400,cc:20},"860100":{cod:700,cc:5}, "947009":{cod:700,cc:5},
  "804552":{cod:430,cc:10},"804912":{cod:477,cc:20},"801740":{cod:240,cc:5},
  "804909":{cod:479,cc:20},"901402":{cod:100,cc:5}, "906200":{cod:700,cc:5},
  "804905":{cod:477,cc:20},"947002":{cod:500,cc:5}, "804512":{cod:240,cc:5},
  "821607":{cod:400,cc:20},"801401":{cod:490,cc:5}, "811022":{cod:410,cc:5},
  "812001":{cod:410,cc:20},"813003":{cod:410,cc:20},"906100":{cod:700,cc:5},
  "835300":{cod:700,cc:5}, "843102":{cod:500,cc:20},"901100":{cod:100,cc:10},
  "804507":{cod:455,cc:5}, "804545":{cod:482,cc:10},"943001":{cod:700,cc:5},
  "940001":{cod:700,cc:5}, "821603":{cod:400,cc:5}, "821649":{cod:400,cc:5},
  "901501":{cod:100,cc:5}, "801403":{cod:475,cc:5}, "811023":{cod:700,cc:5},
  "835114":{cod:490,cc:5}, "905121":{cod:700,cc:5}, "804563":{cod:490,cc:5},
  "905100":{cod:700,cc:5}, "804102":{cod:240,cc:5}, "804522":{cod:445,cc:5},
  "804402":{cod:476,cc:5}, "801790":{cod:475,cc:5}, "804518":{cod:416,cc:5},
  "804519":{cod:445,cc:5}, "805103":{cod:482,cc:10},"901401":{cod:700,cc:5},
  "804222":{cod:240,cc:5}, "820113":{cod:400,cc:5}, "820600":{cod:400,cc:5},
  "821509":{cod:400,cc:5}, "821518":{cod:400,cc:5}, "901115":{cod:100,cc:5},
  "901118":{cod:100,cc:10},"820802":{cod:400,cc:5}, "821515":{cod:400,cc:5},
  "820600":{cod:400,cc:5}, "820601":{cod:400,cc:20},"843101":{cod:500,cc:20},
  "905300":{cod:700,cc:5},
};

// ─── PARSER TXT ───────────────────────────────────────────────────────────────
function parseImporto(s) {
  if (!s) return 0;
  const clean = String(s).replace(/\s/g,"").replace(/^-\s*,/,"-0,");
  if (!clean || clean==="-") return 0;
  return parseFloat(clean.replace(/\./g,"").replace(",",".")) || 0;
}

export function parseTxt(text) {
  const lines = text.split(/\r?\n/).filter(l=>l.trim());
  const movimenti = [];
  for (const line of lines) {
    const parts = line.split(/\t/).map(p=>p.trim());
    if (parts.length < 2) continue;
    const contoRaw = parts[0].replace(/[="'\s]/g,"");
    if (!contoRaw || !/^\d+$/.test(contoRaw)) continue;
    let descrizione="", spce="";
    let saldoDare=0, saldoAvere=0;
    if (parts.length >= 7) {
      descrizione = parts[2]||"";
      spce = parts[3]||"";
      saldoDare  = parseImporto(parts[5]);
      saldoAvere = parseImporto(parts[6]);
    } else if (parts.length >= 4) {
      descrizione = parts[1]||"";
      saldoDare  = parseImporto(parts[2]);
      saldoAvere = parseImporto(parts[3]);
    } else continue;
    if (spce.toUpperCase().includes("SP")) continue;
    movimenti.push({ conto:contoRaw, descrizione, dare:saldoDare, avere:saldoAvere });
  }
  return movimenti;
}

// ─── AGGREGAZIONE ─────────────────────────────────────────────────────────────
export function aggregaPerCodice(movimenti, extraMap={}) {
  const mergedMap = {...PIANO_CONTI, ...extraMap};
  const gruppi = {};
  for (const mov of movimenti) {
    const entry = mergedMap[mov.conto];
    if (!entry) continue;
    const { cod:codGest, cc } = entry;
    if (codGest >= 1000) continue;
    const voce = VOCI_CE.find(v=>v.cod===codGest);
    if (!voce || voce.tipo!=="input") continue;
    if (!gruppi[codGest]) gruppi[codGest] = { totale:0, movimenti:[] };
    const importoCE = mov.avere - mov.dare;
    gruppi[codGest].totale += importoCE;
    gruppi[codGest].movimenti.push({ ...mov, importoCE, cc });
  }
  return gruppi;
}

// ─── ALLOCAZIONE CC5 ──────────────────────────────────────────────────────────
export const DEFAULT_FRACS = { 10:1/3, 20:1/3, 30:1/3 };

export function calcolaFracCespiti(cespiti) {
  const tot = [10,20,30].reduce((s,cc)=>s+(parseFloat(cespiti[cc])||0),0);
  const frac = {};
  [10,20,30].forEach(cc=>{
    frac[cc] = tot>0 ? (parseFloat(cespiti[cc])||0)/tot : 1/3;
  });
  return frac;
}

export function getAllocFraction(cod, ccLocale, allocConf, fracCespiti) {
  if (cod===430 && fracCespiti && Object.values(fracCespiti).some(v=>Math.abs(v-1/3)>0.0001)) {
    return fracCespiti[ccLocale] ?? DEFAULT_FRACS[ccLocale];
  }
  if (allocConf[cod]?.[ccLocale] !== undefined) return allocConf[cod][ccLocale]/100;
  return DEFAULT_FRACS[ccLocale] ?? 1/3;
}

export function aggregaPerLocale(gruppiRaw, ccLocale, allocConf, fracCespiti) {
  const g = {};
  for (const [codStr, gruppo] of Object.entries(gruppiRaw)) {
    const cod = parseInt(codStr);
    const movDiretti = gruppo.movimenti.filter(m=>m.cc===ccLocale);
    const frac = getAllocFraction(cod, ccLocale, allocConf, fracCespiti);
    const movIndiretti = frac>0
      ? gruppo.movimenti.filter(m=>m.cc===5)
          .map(m=>({...m, importoCE:m.importoCE*frac, _allocato:true, _frac:frac}))
      : [];
    const tutti = [...movDiretti, ...movIndiretti];
    if (!tutti.length) continue;
    g[codStr] = { totale:tutti.reduce((s,m)=>s+m.importoCE,0), movimenti:tutti };
  }
  return g;
}

// ─── CALCOLO CE ───────────────────────────────────────────────────────────────
const CODICI_BUDGET = [465, 479];

export function calcolaCE(gruppiInput, extra) {
  const g = {};
  for (const [k,v] of Object.entries(gruppiInput)) {
    g[k] = { totale:v.totale, movimenti:[...v.movimenti] };
  }
  for (const ex of extra) {
    const key = String(ex.codGest);
    if (!g[key]) g[key] = { totale:0, movimenti:[] };
    g[key].totale += ex.importo;
    g[key].movimenti.push({
      conto:"EXTRA", descrizione:ex.descrizione+(ex.note?` (${ex.note})`:""),
      dare:ex.importo>0?ex.importo:0, avere:ex.importo<0?-ex.importo:0,
      importoCE:ex.importo, isExtra:true,
    });
  }
  const budgetOverride = {};
  for (const ex of extra) {
    if (ex.tipo==="budget") budgetOverride[ex.codGest]=(budgetOverride[ex.codGest]||0)+ex.importo;
  }
  const v = {};
  for (const voce of VOCI_CE) {
    if (voce.tipo!=="input") continue;
    if (CODICI_BUDGET.includes(voce.cod) && budgetOverride[voce.cod]!==undefined) {
      v[voce.cod] = budgetOverride[voce.cod];
      const key = String(voce.cod);
      g[key] = { totale:budgetOverride[voce.cod], movimenti:(g[key]?.movimenti||[]).filter(m=>m.isExtra) };
    } else {
      v[voce.cod] = g[voce.cod]?.totale||0;
    }
  }
  v["CV"] = (v[200]||0)+(v[215]||0)+(v[240]||0);
  v["MC"] = (v[100]||0)+v["CV"];
  v["CF"] = [400,405,408,410,411,415,416,430,435,436,445,455,465,475,476,477,478,479,480,481,482,490]
    .reduce((s,c)=>s+(v[c]||0),0);
  v["EBIT"] = v["MC"]+v["CF"];
  v[500] = g["500"]?.totale||0;
  v[700] = g["700"]?.totale||0;
  v["RAI"] = v["EBIT"]+v[500]+v[700];
  v[800] = v["RAI"]>0 ? -(v["RAI"]*0.30) : 0;
  v["RN"] = v["RAI"]+v[800];
  return { vals:v, gruppi:g };
}

export function calcolaPercRicavi(gruppiRaw) {
  const gruppo = gruppiRaw[String(100)];
  if (!gruppo) return {10:1/3,20:1/3,30:1/3};
  const totPerCC = {};
  for (const m of gruppo.movimenti) totPerCC[m.cc]=(totPerCC[m.cc]||0)+m.importoCE;
  const totD = [10,20,30].reduce((s,cc)=>s+(totPerCC[cc]||0),0);
  if (!totD) return {10:1/3,20:1/3,30:1/3};
  return {10:(totPerCC[10]||0)/totD, 20:(totPerCC[20]||0)/totD, 30:(totPerCC[30]||0)/totD};
}

export function calcolaTuttiCE(gruppiRaw, extra, allocConf, cespiti) {
  const fracCespiti = calcolaFracCespiti(cespiti||{});
  const percRicavi  = calcolaPercRicavi(gruppiRaw);
  const results = {};
  for (const locale of LOCALI) {
    let gruppiLocale, extraLocale;
    if (locale.cc===null) {
      gruppiLocale = gruppiRaw;
      extraLocale  = extra.filter(ex=>ex.tipo!=="budget");
      extraLocale  = [...extraLocale, ...extra.filter(ex=>ex.tipo==="budget")];
    } else {
      gruppiLocale = aggregaPerLocale(gruppiRaw, locale.cc, allocConf||{}, fracCespiti);
      extraLocale  = extra
        .filter(ex=>{
          if (ex.tipo==="budget") return false;
          if (!ex.ccLocale) return true;
          return ex.ccLocale===locale.cc;
        })
        .map(ex=>({...ex}));
      for (const ex of extra.filter(ex=>ex.tipo==="budget")) {
        const frac = percRicavi[locale.cc]??1/3;
        extraLocale.push({...ex, importo:ex.importo*frac});
      }
    }
    results[locale.id] = calcolaCE(gruppiLocale, extraLocale);
  }
  return results;
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
export const fmt    = n => new Intl.NumberFormat("it-IT",{minimumFractionDigits:0,maximumFractionDigits:0}).format(Math.round(n));
export const fmtDec = n => new Intl.NumberFormat("it-IT",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
export const pct    = (v, ricavi) => ricavi>0 ? ((v/ricavi)*100).toFixed(1)+"%" : "—";
