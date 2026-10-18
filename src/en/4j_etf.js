/* ============================================================
   ETF MỸ & CẶP ĐỐI XỨNG (tăng – ngược chiều)
   ============================================================ */
const ETF_GROUP_ORDER=['US Index','Style','Factor','Dividend','Option Income','Sector','Thematic','International','Bonds','Cash','Commodities','Real Estate','Crypto','Volatility','Currency','Single Stock'];
const fmtF=(v,d)=>!isNum(v)?'—':v.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const sgnF=(v,d)=>!isNum(v)?'—':(v>0?'+':'')+fmtF(v,d);
const isLevd=e=>isNum(e.lev)&&(Math.abs(e.lev)>1.01||e.lev<0);
function levBadge(e){ if(!isNum(e.lev)||e.lev===1) return ''; const v=e.lev; return `<span class="levb ${v<0?'inv':'lng'}">${v>0?'':'−'}${fmt(Math.abs(v),Math.abs(v)%1?1:0)}x</span>`; }
function aumTxt(v){ return !isNum(v)?'—': v>=1? '$'+fmt(v,v>=100?0:1)+' bn' : '$'+fmt(v*1000,0)+' M'; }
function isEStar(t){ return S.etfStars.includes(t); }
function toggleEStar(t){ if(isEStar(t)) S.etfStars=S.etfStars.filter(x=>x!==t); else S.etfStars.push(t); saveState(); toast(isEStar(t)?'Now watching '+t:'Stopped watching '+t); }

/* ---------- số liệu cặp ---------- */
function closeMap(t){ const q=liveE(t); const m=new Map(); (q&&q.hist||[]).forEach(b=>{ if(isNum(b[4])) m.set(b[0],b[4]); }); return m; }
function pairStats(i){
  const [a,b,g,u]=ETF_PAIRS[i]; const A=EBY[a]||{t:a}, B=EBY[b]||{t:b};
  const qa=liveE(a), qb=liveE(b);
  const ma=closeMap(a), mb=closeMap(b);
  const dates=[...ma.keys()].filter(d=>mb.has(d)).sort();
  const la=dates.map(d=>ma.get(d)), lb=dates.map(d=>mb.get(d));
  const ra=[], rb=[];
  for(let k=1;k<dates.length;k++){ ra.push(la[k]/la[k-1]-1); rb.push(lb[k]/lb[k-1]-1); }
  let corr=null, beta=null;
  if(ra.length>=8){
    const n=ra.length, mA=ra.reduce((x,y)=>x+y,0)/n, mB=rb.reduce((x,y)=>x+y,0)/n;
    let sab=0,saa=0,sbb=0; for(let k=0;k<n;k++){ sab+=(ra[k]-mA)*(rb[k]-mB); saa+=(ra[k]-mA)**2; sbb+=(rb[k]-mB)**2; }
    corr= saa&&sbb? sab/Math.sqrt(saa*sbb) : null; beta= saa? sab/saa : null;
  }
  const n=dates.length;
  const retA= n>=2? (la[n-1]/la[0]-1)*100 : null, retB= n>=2? (lb[n-1]/lb[0]-1)*100 : null;
  const both= n>=2? ((la[n-1]/la[0]+lb[n-1]/lb[0])/2-1)*100 : null;
  /* lợi nhuận tài sản cơ sở suy ra từ chuỗi long: tích lũy r/lev */
  let under=null; if(ra.length&&isNum(A.lev)&&A.lev){ under=(ra.reduce((p,r)=>p*(1+r/A.lev),1)-1)*100; }
  const levA=isNum(A.lev)?A.lev:1, levB=isNum(B.lev)?B.lev:-1;
  const dev= qa&&qb&&isNum(qa.pct)&&isNum(qb.pct)&&qa.d===qb.d? qa.pct/Math.abs(levA)+qb.pct/Math.abs(levB) : null;
  return {i,a,b,g,u,A,B,qa,qb,dates,la,lb,ra,rb,corr,beta,retA,retB,both,under,dev,levA,levB,n};
}
function pairMiniSVG(P,w,h){
  if(P.n<3) return `<div class="note" style="text-align:center;padding:14px 0">Not enough shared price history</div>`;
  const na=P.la.map(v=>v/P.la[0]*100), nb=P.lb.map(v=>v/P.lb[0]*100);
  const all=na.concat(nb), lo=Math.min(...all,100), hi=Math.max(...all,100);
  const X=i=>2+i/(P.n-1)*(w-4), Y=v=>h-3-(v-lo)/((hi-lo)||1)*(h-6);
  const path=a=>a.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" aria-hidden="true" style="display:block"><line x1="0" x2="${w}" y1="${Y(100).toFixed(1)}" y2="${Y(100).toFixed(1)}" style="stroke:var(--line2)" stroke-dasharray="3 3"/><path d="${path(na)}" fill="none" style="stroke:var(--up)" stroke-width="1.7"/><path d="${path(nb)}" fill="none" style="stroke:var(--dn)" stroke-width="1.7"/></svg>`;
}
function pctSpan(q){ if(!q||!isNum(q.pct)) return '<span class="mut">—</span>'; return `<span class="${q.pct>0?'up':q.pct<0?'dn':'ref'}">${q.pct>0?'+':''}${fmt(q.pct,2)}%</span>`; }
function pairsStripHTML(){
  if(!ETF_PAIRS.length||!Object.keys(LIVE.e).length) return '';
  const L=ETF_PAIRS.map((p,i)=>({i,a:p[0],b:p[1],u:p[3],qa:liveE(p[0]),qb:liveE(p[1])})).filter(x=>x.qa&&x.qb&&isNum(x.qa.pct)).sort((x,y)=>Math.abs(y.qa.pct)-Math.abs(x.qa.pct)).slice(0,4);
  if(!L.length) return '';
  return `<div class="pair-strip"><div class="sec-h" style="margin:10px 0 6px"><span class="mut" style="font-size:12.5px;font-weight:600">Biggest movers among inverse ETF pairs</span><button class="btn sm ghost" data-gopairs="1">All pairs</button></div>
    <div class="ps-row">${L.map(x=>`<button class="ps" data-pair="${x.i}"><span class="mut">${esc(x.u)}</span><span><b>${esc(x.a)}</b> ${pctSpan(x.qa)}</span><span><b>${esc(x.b)}</b> ${pctSpan(x.qb)}</span></button>`).join('')}</div></div>`;
}

/* ---------- màn hình ETF / cặp ---------- */
function renderEtfView(){ const box=$('#etfView'); if(!box) return; if(S.scrMode==='pairs') renderPairsView(box); else renderEtfList(box); }
function renderEtfBody(){ if(S.view==='screen'&&$('#etfView')){ if(S.scrMode==='pairs') renderPairGrid(); else renderEtfRows(); } }
function etfSortVal(e,k){
  const q=liveE(e.t);
  switch(k){ case 'aum': return isNum(e.aum)?e.aum:-1; case 'er': return isNum(e.er)?-e.er:-99; case 'dy': return isNum(e.dy)?e.dy:-1;
    case 'r1y': return isNum(e.r1y)?e.r1y:-999; case 'chg': return q&&isNum(q.pct)?q.pct:-999; case 'chgabs': return q&&isNum(q.pct)?Math.abs(q.pct):-1;
    case 'b': return isNum(e.b)?e.b:-9; case 'lev': return isNum(e.lev)?Math.abs(e.lev)*(e.lev<0?1.001:1):0; case 'age': return isNum(e.inc)?-e.inc:-9999; }
  return 0;
}
function renderEtfList(box){
  const groups=ETF_GROUP_ORDER.filter(g=>ETFS.some(e=>e.grp===g));
  const nLev=ETFS.filter(isLevd).length, nInv=ETFS.filter(e=>e.lev<0).length;
  const withData=ETFS.filter(e=>!e._nf).length;
  box.innerHTML=`
  <div class="sec-h" style="margin:0"><div><h2>US ETFs</h2><p>${ETFS.length} funds · ${nLev} leveraged or inverse (${nInv} inverse) · ${withData} with full stats</p></div><button class="btn sm" data-lesson="etf-basics">What is an ETF?</button></div>
  <section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Fees × 12-month return</h2><p>Each dot is a fund, sized by assets under management. Leveraged and inverse funds stand clearly apart from regular ones</p></div></div><div id="etfScatter"></div></section>
  <div class="chips" role="group" aria-label="ETF groups">
    <button class="chip ${S.ef.grp==='all'?'on':''}" data-eg="all" aria-pressed="${S.ef.grp==='all'}">All</button>
    <button class="chip ${S.ef.grp==='star'?'on':''}" data-eg="star" aria-pressed="${S.ef.grp==='star'}">Watching (${S.etfStars.length})</button>
    <button class="chip ${S.ef.grp==='lev'?'on':''}" data-eg="lev" aria-pressed="${S.ef.grp==='lev'}">Leveraged & inverse</button>
    ${groups.map(g=>`<button class="chip ${S.ef.grp===g?'on':''}" data-eg="${esc(g)}" aria-pressed="${S.ef.grp===g}">${esc(g)}</button>`).join('')}
  </div>
  <div class="filters" style="grid-template-columns:2fr 1fr">
    <label class="field search"><span class="sr">Search ETFs</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input type="text" id="eq" placeholder="Search ticker, fund name or index" value="${esc(S.ef.q)}" autocomplete="off"></label>
    <label class="field">Sort<select id="eSort">${[['aum','Largest assets'],['er','Lowest fee'],['dy','Highest dividend'],['r1y','12-month return'],['chg','Top gainers last session'],['chgabs','Biggest session move'],['b','Highest beta'],['lev','Leverage'],['age','Oldest']].map(([k,n])=>`<option value="${k}" ${S.ef.sort===k?'selected':''}>${n}</option>`).join('')}</select></label>
  </div>
  <div><div class="sec-h" style="margin-bottom:8px"><p id="eCount"></p><p class="mut" style="font-size:12px">Tap for fund details</p></div><div class="list" id="eList"></div></div>
  <p class="note">Leveraged and inverse funds target a DAILY multiple; holding for many days can drift far from that multiple due to volatility decay. ${esc(DISC)}</p>`;
  $$('[data-eg]',box).forEach(b=>b.onclick=()=>{ S.ef.grp=b.dataset.eg; S.eN=60; renderEtfList(box); });
  $('#eq').oninput=e=>{ S.ef.q=e.target.value; S.eN=60; renderEtfRows(); };
  $('#eSort').onchange=e=>{ S.ef.sort=e.target.value; S.eN=60; renderEtfRows(); };
  renderEtfScatter(); renderEtfRows();
}
function etfFiltered(){
  const q=S.ef.q.trim().toLowerCase();
  return ETFS.filter(e=>(S.ef.grp==='all'||(S.ef.grp==='lev'?isLevd(e):S.ef.grp==='star'?isEStar(e.t):e.grp===S.ef.grp))&&(!q||e.t.toLowerCase().includes(q)||String(e.n||'').toLowerCase().includes(q)||String(e.idx||'').toLowerCase().includes(q)||String(e.prov||'').toLowerCase().includes(q)));
}
function etfRowHTML(e,i){
  const q=liveE(e.t); const p=e.pair;
  return `<div class="srow erow" role="button" tabindex="0" data-etf="${esc(e.t)}" aria-label="${esc(e.t)} ${esc(e.n)}">
    <span class="rk">${i+1}</span>
    <span class="nm"><b>${esc(e.t)} ${levBadge(e)}${p?`<span class="mk" title="Inverse pair with ${esc(p.mate)}">⇅ ${esc(p.mate)}</span>`:''}</b><span>${q?pxChip(e.t,{etf:1})+' · ':''}${esc(e.n)}</span></span>
    <span class="emet"><span><i>Assets</i><b>${aumTxt(e.aum)}</b></span><span><i>Fee</i><b>${isNum(e.er)?fmt(e.er,2)+'%':'—'}</b></span><span class="hide-xs"><i>12 months</i><b class="${e.r1y>=0?'up':'dn'}">${sgn(e.r1y,1)}</b></span></span>
    <button class="star" data-estar="${esc(e.t)}" aria-pressed="${isEStar(e.t)}" aria-label="${isEStar(e.t)?'Unwatch':'Watch'} ${esc(e.t)}">${starSVG(isEStar(e.t))}</button>
  </div>`;
}
function renderEtfRows(){
  const box=$('#eList'); if(!box) return;
  const L=etfFiltered().sort((a,b)=>etfSortVal(b,S.ef.sort)-etfSortVal(a,S.ef.sort));
  const N=Math.min(L.length,S.eN||60);
  $('#eCount').innerHTML=`<b style="color:var(--fg)">${L.length}</b> funds${S.ef.grp!=='all'?' · '+esc(S.ef.grp==='lev'?'Leveraged & inverse':S.ef.grp==='star'?'Watching':S.ef.grp):''}`;
  box.innerHTML= L.length? L.slice(0,N).map(etfRowHTML).join('')+(L.length>N?`<button class="btn more-btn" id="eMore">Show more (${L.length-N} left)</button>`:'') : `<div class="empty">${S.ef.grp==='star'?'Not watching any funds yet. Tap the star on a fund to add it.':'No matching funds.'}</div>`;
  const m=$('#eMore'); if(m) m.onclick=()=>{ S.eN=(S.eN||60)+60; const y=scrollY; renderEtfRows(); scrollTo(0,y); };
}
function renderEtfScatter(){
  const box=$('#etfScatter'); if(!box) return;
  const L=ETFS.filter(e=>isNum(e.er)&&isNum(e.r1y));
  if(L.length<5){ box.innerHTML='<p class="note">The chart appears once enough fund stats are available.</p>'; return; }
  const W=360,H=250,p={l:40,r:12,t:12,b:34};
  const xs=L.map(e=>e.er), ys=L.map(e=>clamp(e.r1y,-95,250));
  const xmx=Math.max(1.2,Math.min(2,Math.max(...xs))); const ylo=Math.min(-60,Math.min(...ys)), yhi=Math.max(60,Math.max(...ys));
  const X=v=>p.l+clamp(v,0,xmx)/xmx*(W-p.l-p.r), Y=v=>H-p.b-(v-ylo)/(yhi-ylo)*(H-p.t-p.b);
  let g='';
  [0,.25,.5,.75,1,1.25,1.5,1.75,2].filter(v=>v<=xmx).forEach(v=>{ g+=`<line class="grid-l" x1="${X(v)}" x2="${X(v)}" y1="${p.t}" y2="${H-p.b}"/><text x="${X(v)}" y="${H-p.b+13}" text-anchor="middle">${fmt(v,2)}%</text>`; });
  const step=(yhi-ylo)>200?50:25; for(let v=Math.ceil(ylo/step)*step; v<=yhi; v+=step){ g+=`<line class="grid-l" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"${v===0?' style="stroke:var(--line2)"':''}/><text x="${p.l-5}" y="${Y(v)+3}" text-anchor="end">${v>0?'+':''}${v}%</text>`; }
  g+=`<text x="${(W+p.l)/2}" y="${H-4}" text-anchor="middle" class="lbl-strong">Annual expense ratio →</text><text transform="translate(10 ${(H-p.b)/2}) rotate(-90)" text-anchor="middle" class="lbl-strong">12-month return</text>`;
  const place=labelPlacer();
  const lab=new Set(L.slice().sort((a,b)=>(b.aum||0)-(a.aum||0)).slice(0,5).map(e=>e.t).concat(L.slice().sort((a,b)=>b.r1y-a.r1y).slice(0,2).map(e=>e.t)).concat(L.slice().sort((a,b)=>a.r1y-b.r1y).slice(0,2).map(e=>e.t)));
  L.slice().sort((a,b)=>(b.aum||0)-(a.aum||0)).forEach(e=>{
    const x=X(e.er), y=Y(clamp(e.r1y,-95,250)); const r=clamp(2+Math.sqrt(Math.max(0,e.aum||0))*0.55,2.2,11);
    const col= e.lev<0?'var(--dn)': isLevd(e)?'var(--gold)':'var(--us)';
    g+=`<g data-etf="${esc(e.t)}" style="cursor:pointer"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${Math.max(r,7)}" fill="transparent"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" style="fill:${col};fill-opacity:.55;stroke:${col}" stroke-width="1"/><title>${esc(e.t)}: fee ${fmt(e.er,2)}%, 12 months ${sgn(e.r1y,1)}, assets ${aumTxt(e.aum)}</title></g>`;
    if(lab.has(e.t)){ const w=e.t.length*6+2; if(place(x+r+3+w/2,y+3,w,10)) g+=`<text x="${(x+r+3).toFixed(1)}" y="${(y+3).toFixed(1)}" class="lbl-strong" style="font-size:9.5px;pointer-events:none">${esc(e.t)}</text>`; }
  });
  box.innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter of ETF expense ratio vs 12-month return">${g}</svg><div class="legend"><span><i style="background:var(--us)"></i>Regular fund (1x)</span><span><i style="background:var(--gold)"></i>Leveraged long</span><span><i style="background:var(--dn)"></i>Inverse</span></div>`;
}

/* ---------- cặp đối xứng ---------- */
function renderPairsView(box){
  const groups=[...new Set(ETF_PAIRS.map(p=>p[2]))];
  box.innerHTML=`
  <div class="sec-h" style="margin:0"><div><h2>Inverse ETF pairs</h2><p>${ETF_PAIRS.length} pairs: one fund rises with the underlying, the other moves opposite at the same multiple</p></div><button class="btn sm" data-lesson="etf-pairs">How to read pairs</button></div>
  <details class="acc pair-intro"><summary>How to read pair metrics</summary><div class="acc-b">
    <div class="pi-grid">
      <div><b>Symmetric within one session</b><p>If the Nasdaq-100 rises 1%, TQQQ (3x) targets +3% and SQQQ (−3x) targets −3%. The <b>deviation</b> = long fund % ÷ multiple + short fund % ÷ multiple; the closer to 0, the better the pair matches.</p></div>
      <div><b>Not symmetric over many sessions</b><p>Each fund rebalances daily, so compounded returns erode when prices swing. The <b>Hold both</b> box shows how much a 50/50 position in both funds gained or lost over the same period — usually a negative number.</p></div>
      <div><b>Correlation</b><p>The ideal daily-return correlation between the two funds is −1. Straying far from −1 signals tracking error, fees, or closing prices taken at different times.</p></div>
    </div></div>
  </details>
  <div class="chips" role="group" aria-label="Pair groups">
    <button class="chip ${S.pf.grp==='all'?'on':''}" data-pg="all" aria-pressed="${S.pf.grp==='all'}">All</button>
    ${groups.map(g=>`<button class="chip ${S.pf.grp===g?'on':''}" data-pg="${esc(g)}" aria-pressed="${S.pf.grp===g}">${esc(g)}</button>`).join('')}
  </div>
  <div class="filters" style="grid-template-columns:1fr 1fr">
    <label class="field">Sort<select id="pSort">${[['move','Biggest session move'],['decay','Decay when holding both'],['dev','Largest deviation'],['lev','Leverage multiple'],['grp','By group']].map(([k,n])=>`<option value="${k}" ${S.pf.sort===k?'selected':''}>${n}</option>`).join('')}</select></label>
    <div class="seg" role="group" aria-label="Display style" id="pView"><button data-pv="card" aria-pressed="${S.pView!=='table'}">Cards</button><button data-pv="table" aria-pressed="${S.pView==='table'}">Table</button></div>
  </div>
  <div id="pairGrid"></div>
  <p class="note">End-of-day closing prices; cumulative performance uses sessions where both funds have a price. Leveraged/inverse funds suit controlled short-term trading, not long-term holding. ${esc(DISC)}</p>`;
  $$('[data-pg]',box).forEach(b=>b.onclick=()=>{ S.pf.grp=b.dataset.pg; renderPairsView(box); });
  $('#pSort').onchange=e=>{ S.pf.sort=e.target.value; renderPairGrid(); };
  $$('[data-pv]',box).forEach(b=>b.onclick=()=>{ S.pView=b.dataset.pv; $$('[data-pv]',box).forEach(x=>x.setAttribute('aria-pressed',String(x===b))); renderPairGrid(); });
  ETF_PAIRS.forEach(p=>{ ensureHist(p[0],true); ensureHist(p[1],true); });
  renderPairGrid();
}
function pairSortVal(P,k){
  switch(k){ case 'move': return P.qa&&isNum(P.qa.pct)?Math.abs(P.qa.pct):-1; case 'decay': return isNum(P.both)?-P.both:-999;
    case 'dev': return isNum(P.dev)?Math.abs(P.dev):-1; case 'lev': return Math.abs(P.levA||1); case 'grp': return -ETF_PAIRS.findIndex(x=>x[2]===P.g)*1000-P.i; }
  return 0;
}
function renderPairGrid(){
  const box=$('#pairGrid'); if(!box) return;
  let L=ETF_PAIRS.map((p,i)=>i).filter(i=>S.pf.grp==='all'||ETF_PAIRS[i][2]===S.pf.grp).map(pairStats);
  L.sort((a,b)=>pairSortVal(b,S.pf.sort)-pairSortVal(a,S.pf.sort));
  if(S.pView==='table'){
    box.innerHTML=`<div class="scroll-x"><table class="ptab"><thead><tr><th>Underlying</th><th>Long</th><th>%</th><th>Inverse</th><th>%</th><th>Dev.</th><th>Hold both</th><th>Correlation</th></tr></thead><tbody>${L.map(P=>`<tr data-pair="${P.i}" tabindex="0"><td><b>${esc(P.u)}</b><span class="mut">${esc(P.g)}</span></td><td><b>${esc(P.a)}</b></td><td>${pctSpan(P.qa)}</td><td><b>${esc(P.b)}</b></td><td>${pctSpan(P.qb)}</td><td>${sgnF(P.dev,2)}</td><td class="${P.both<0?'dn':'up'}">${isNum(P.both)?sgn(P.both,1):'—'}</td><td>${fmtF(P.corr,2)}</td></tr>`).join('')}</tbody></table></div>`;
  } else {
    box.innerHTML=`<div class="pair-grid">${L.map(P=>`<article class="panel pcard" role="button" tabindex="0" data-pair="${P.i}" aria-label="Pair ${esc(P.a)} and ${esc(P.b)}">
      <div class="pc-h"><span class="mut">${esc(P.g)}</span><b>${esc(P.u)}</b></div>
      <div class="pc-sides">
        <div class="pc-side"><span class="levb lng">${fmt(Math.abs(P.levA),Math.abs(P.levA)%1?1:0)}x</span><b>${esc(P.a)}</b><span>${P.qa?fmtLivePx(P.qa):'—'}</span>${pctSpan(P.qa)}</div>
        <div class="pc-mid"><span class="mut">Dev.</span><b>${sgnF(P.dev,2)}</b></div>
        <div class="pc-side r"><span class="levb inv">−${fmt(Math.abs(P.levB),Math.abs(P.levB)%1?1:0)}x</span><b>${esc(P.b)}</b><span>${P.qb?fmtLivePx(P.qb):'—'}</span>${pctSpan(P.qb)}</div>
      </div>
      ${pairMiniSVG(P,300,54)}
      <div class="pc-foot"><span>${P.n>=2?P.n+' sessions':''}</span><span>${esc(P.a)} <b class="${P.retA>=0?'up':'dn'}">${isNum(P.retA)?sgn(P.retA,1):'—'}</b></span><span>${esc(P.b)} <b class="${P.retB>=0?'up':'dn'}">${isNum(P.retB)?sgn(P.retB,1):'—'}</b></span><span>Hold both <b class="${P.both>=0?'up':'dn'}">${isNum(P.both)?sgn(P.both,1):'—'}</b></span></div>
    </article>`).join('')}</div>`;
  }
  $$('[data-pair]',box).forEach(el=>{ el.onclick=()=>openPair(+el.dataset.pair); el.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openPair(+el.dataset.pair); } }; });
}
let OPEN_SHEET_ETF=null;
function refreshEtfSheet(info){
  if(!OPEN_SHEET_ETF) return;
  if(OPEN_SHEET_ETF.kind==='pair'){ const b=$('#pairBody'); if(b) b.innerHTML=pairBodyHTML(pairStats(OPEN_SHEET_ETF.i)); }
  else { const b=$('#etfChartSlot'); if(b) b.innerHTML=etfLineHTML(OPEN_SHEET_ETF.t); }
}
function pairScatterSVG(P){
  if(P.ra.length<5) return '';
  const W=300,H=200,p=24; const mx=Math.max(...P.ra.map(Math.abs),...P.rb.map(Math.abs),0.005);
  const X=v=>W/2+v/mx*(W/2-p), Y=v=>H/2-v/mx*(H/2-p);
  let g=`<line class="axis" x1="${p}" x2="${W-p}" y1="${H/2}" y2="${H/2}"/><line class="axis" x1="${W/2}" x2="${W/2}" y1="${p/2}" y2="${H-p/2}"/>`;
  const ideal=P.levB/P.levA; g+=`<line x1="${X(-mx)}" y1="${Y(-mx*ideal)}" x2="${X(mx)}" y2="${Y(mx*ideal)}" style="stroke:var(--gold)" stroke-dasharray="4 3" stroke-width="1.2"/>`;
  P.ra.forEach((r,k)=>{ g+=`<circle cx="${X(r).toFixed(1)}" cy="${Y(P.rb[k]).toFixed(1)}" r="2.6" style="fill:var(--us);fill-opacity:.7"/>`; });
  g+=`<text x="${W-p}" y="${H/2-4}" text-anchor="end">${esc(P.a)} →</text><text x="${W/2+4}" y="${p/2+8}">↑ ${esc(P.b)}</text><text x="${p}" y="${H-6}" style="fill:var(--gold);font-size:9px">Dashed: perfect symmetry (ratio ${fmt(ideal,2)})</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Daily returns of ${esc(P.a)} vs ${esc(P.b)}">${g}</svg>`;
}
function pairBigSVG(P){
  if(P.n<3) return '<p class="note">Shared price history for the two funds is loading or not yet available.</p>';
  const W=340,H=170,p={l:34,r:8,t:10,b:22};
  const na=P.la.map(v=>v/P.la[0]*100), nb=P.lb.map(v=>v/P.lb[0]*100), nh=na.map((v,i)=>(v+nb[i])/2);
  const all=na.concat(nb), lo=Math.min(...all), hi=Math.max(...all);
  const X=i=>p.l+i/(P.n-1)*(W-p.l-p.r), Y=v=>H-p.b-(v-lo)/((hi-lo)||1)*(H-p.t-p.b);
  const path=a=>a.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join(' ');
  let g=''; [lo,(lo+hi)/2,hi].forEach(v=>g+=`<line class="grid-l" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${p.l-4}" y="${Y(v)+3}" text-anchor="end">${fmt(v,0)}</text>`);
  g+=`<line x1="${p.l}" x2="${W-p.r}" y1="${Y(100)}" y2="${Y(100)}" style="stroke:var(--line2)" stroke-dasharray="3 3"/>`;
  g+=`<path d="${path(na)}" fill="none" style="stroke:var(--up)" stroke-width="2"/><path d="${path(nb)}" fill="none" style="stroke:var(--dn)" stroke-width="2"/><path d="${path(nh)}" fill="none" style="stroke:var(--gold)" stroke-width="1.6" stroke-dasharray="5 3"/>`;
  g+=`<text x="${p.l}" y="${H-6}">${esc(fmtDate(P.dates[0]))}</text><text x="${W-p.r}" y="${H-6}" text-anchor="end">${esc(fmtDate(P.dates[P.n-1]))}</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Performance of both funds, normalized to 100">${g}</svg><div class="legend"><span><i style="background:var(--up)"></i>${esc(P.a)}</span><span><i style="background:var(--dn)"></i>${esc(P.b)}</span><span><i style="background:var(--gold)"></i>Hold both 50/50</span></div>`;
}
function pairBodyHTML(P){
  const fee=(isNum(P.A.er)&&isNum(P.B.er))? (P.A.er+P.B.er)/2 : null;
  const verdict= !isNum(P.corr)? 'Not enough data to judge how well they match.' : P.corr<-0.97? 'The two funds mirror each other very closely in each session.' : P.corr<-0.9? 'Good match with small deviations (fees, pricing time, rebalancing).' : 'Poor match — recheck the mechanism, underlying asset and liquidity.';
  return `
  <div class="pc-sides big">
    <div class="pc-side"><span class="levb lng">${fmt(Math.abs(P.levA),Math.abs(P.levA)%1?1:0)}x</span><b>${esc(P.a)}</b><span>${P.qa?fmtLivePx(P.qa):'—'}</span>${pctSpan(P.qa)}</div>
    <div class="pc-mid"><span class="mut">Session dev.</span><b>${sgnF(P.dev,2)}</b><span class="mut" style="font-size:11px">% pts</span></div>
    <div class="pc-side r"><span class="levb inv">−${fmt(Math.abs(P.levB),Math.abs(P.levB)%1?1:0)}x</span><b>${esc(P.b)}</b><span>${P.qb?fmtLivePx(P.qb):'—'}</span>${pctSpan(P.qb)}</div>
  </div>
  <section class="panel"><div class="sec-h"><div><h2 style="font-size:16px">Normalized performance</h2><p>${P.n} shared sessions · both start at 100</p></div></div>${pairBigSVG(P)}</section>
  <div class="kv kv4">
    <div><span>${esc(P.a)} full period</span><b class="${P.retA>=0?'up':'dn'}">${sgn(P.retA,1)}</b><span>multiple ${fmt(P.levA,1)}x</span></div>
    <div><span>${esc(P.b)} full period</span><b class="${P.retB>=0?'up':'dn'}">${sgn(P.retB,1)}</b><span>multiple ${fmt(P.levB,1)}x</span></div>
    <div><span>Hold both 50/50</span><b class="${P.both>=0?'up':'dn'}">${sgn(P.both,1)}</b><span>decay + fees</span></div>
    <div><span>Underlying (implied)</span><b class="${P.under>=0?'up':'dn'}">${sgn(P.under,1)}</b><span>${isNum(P.under)&&isNum(P.retA)?'×'+fmt(P.levA,0)+' = '+sgn(P.under*P.levA,0)+' without decay':''}</span></div>
    <div><span>Daily correlation</span><b>${fmtF(P.corr,3)}</b><span>ideal −1</span></div>
    <div><span>Daily ratio (beta)</span><b>${fmtF(P.beta,2)}</b><span>ideal ${fmt(P.levB/P.levA,2)}</span></div>
    <div><span>Average fee</span><b>${isNum(fee)?fmt(fee,2)+'%':'—'}</b><span>per year</span></div>
    <div><span>Assets under mgmt</span><b>${aumTxt(P.A.aum)}</b><span>${esc(P.b)}: ${aumTxt(P.B.aum)}</span></div>
  </div>
  <section class="panel"><div class="sec-h"><div><h2 style="font-size:16px">Daily returns compared</h2><p>${esc(verdict)}</p></div></div>${pairScatterSVG(P)||'<p class="note">Needs at least 5 shared sessions.</p>'}</section>
  <div class="disc">Why does holding both still lose? Suppose the underlying goes +10% then −9.09% (back to the starting price). The 3x fund: +30% then −27.3% → 94.5 left. The −3x fund: −30% then +27.3% → 89.1 left. Both lose money even though the index is flat — that is volatility decay, which grows with the square of the multiple × variance.</div>`;
}
function openPair(i){
  const p=ETF_PAIRS[i]; if(!p) return; ensureHist(p[0],true); ensureHist(p[1],true);
  OPEN_SHEET_ETF={kind:'pair',i};
  openSheet(`Pair ${p[0]} ⇅ ${p[1]}`,`<p class="sub" style="margin:0 0 8px">${esc(p[3])} · ${esc(p[2])}</p><div id="pairBody">${pairBodyHTML(pairStats(i))}</div>
    <div class="row-btns"><button class="btn" data-etf-open="${esc(p[0])}">${esc(p[0])} details</button><button class="btn" data-etf-open="${esc(p[1])}">${esc(p[1])} details</button><button class="btn" data-etf-chart="${esc(p[0])}">${esc(p[0])} candles</button><button class="btn ghost" data-lesson="etf-decay">Learn about decay</button></div>`,body=>{
      $$('[data-etf-open]',body).forEach(b=>b.onclick=()=>openEtf(b.dataset.etfOpen));
      $$('[data-etf-chart]',body).forEach(b=>b.onclick=()=>{ closeSheet(); CH.t='E:'+b.dataset.etfChart; CH.offset=0; setView('chart'); });
    });
  sheetOnClose=()=>{ OPEN_SHEET_ETF=null; };
}
function etfLineHTML(t){
  const q=liveE(t); const c=(q&&q.hist||[]).map(b=>b[4]).filter(isNum);
  if(c.length<3) return '<p class="note">Price history is loading or not yet available.</p>';
  return `<div style="margin-top:4px">${sparkSVG(q,320,70).replace('width="320"','width="100%"')}</div>`;
}
function feeDragHTML(e){
  if(!isNum(e.er)) return '';
  const r=7, yrs=[1,5,10,20]; const base=y=>10000*Math.pow(1+r/100,y), net=y=>10000*Math.pow((1+r/100)*(1-e.er/100),y);
  return `<section class="panel"><div class="sec-h"><div><h2 style="font-size:16px">How much do fees eat?</h2><p>Investing $10,000, assuming the market rises ${r}%/year, compared with the same portfolio at zero fees</p></div></div>
    <table class="thr"><tr><th>After</th><th>No fee</th><th>Fee ${fmt(e.er,2)}%</th><th>Lost to fees</th></tr>${yrs.map(y=>`<tr><td>${y} yr</td><td>$${fmt(base(y),0)}</td><td>$${fmt(net(y),0)}</td><td class="dn">−$${fmt(base(y)-net(y),0)}</td></tr>`).join('')}</table></section>`;
}
function openEtf(t){
  const e=EBY[t]; if(!e) return; ensureHist(t,true);
  OPEN_SHEET_ETF={kind:'etf',t};
  const p=e.pair; const lv=isLevd(e);
  const html=`
  <div class="dt-top"><div><h2>${esc(e.t)} ${levBadge(e)}</h2><p class="sub">${esc(e.n)}${e.prov?' · '+esc(e.prov):''}<br>${esc(e.grp)}${e.idx?' · tracks '+esc(e.idx):''}</p>
    <div class="row-btns" style="margin-top:10px"><span class="mk US" style="align-self:center">US ETF</span><button class="btn sm" id="eStarBtn" aria-pressed="${isEStar(e.t)}"><span class="star" style="width:auto;height:auto;color:${isEStar(e.t)?'var(--ref)':'inherit'}">${starSVG(isEStar(e.t))}</span>${isEStar(e.t)?'Watching':'Watch'}</button></div></div></div>
  <div id="liveSlot" data-t="${esc(e.t)}" data-etf="1">${liveBlockHTML(e,true)}</div>
  ${lv?`<div class="disc" style="border-color:var(--dn)"><b class="dn">Daily ${e.lev<0?'inverse':'leveraged'} fund ${fmt(e.lev,1)}x.</b> The target holds only for each single session; holding over many sessions can drift far from ${fmt(e.lev,1)}× the underlying's return, even if you call the direction right. Suited to short-term trading with a stop-loss plan.</div>`:''}
  <div class="kv kv4">
    <div><span>Assets under mgmt</span><b>${aumTxt(e.aum)}</b><span>${isNum(e.hold)?e.hold+' holdings':'—'}</span></div>
    <div><span>Expense ratio</span><b>${isNum(e.er)?fmt(e.er,2)+'%':'—'}</b><span>per year</span></div>
    <div><span>Dividend yield</span><b>${isNum(e.dy)?fmt(e.dy,2)+'%':'—'}</b><span>12 months</span></div>
    <div><span>Beta</span><b>${fmt(e.b,2)}</b><span>vs S&amp;P 500</span></div>
    <div><span>12-month return</span><b class="${e.r1y>=0?'up':'dn'}">${sgn(e.r1y,1)}</b><span>total return</span></div>
    <div><span>Annualized</span><b class="${e.rinc>=0?'up':'dn'}">${sgn(e.rinc,1)}</b><span>${isNum(e.inc)?'since inception '+e.inc:'since inception'}</span></div>
    <div><span>52-week range</span><b style="font-size:15px">${isNum(e.w52l)?'$'+fmt(e.w52l,2)+' – $'+fmt(e.w52h,2):'—'}</b><span></span></div>
    <div><span>Type</span><b style="font-size:14px">${esc(e.cls||'—')}</b><span>${esc(e.cat||'')}</span></div>
  </div>
  ${e.top?`<p class="note"><b>Top holdings:</b> ${esc(e.top)}</p>`:''}
  ${p?`<section class="panel pair-link"><div class="sec-h"><div><h2 style="font-size:16px">Inverse pair</h2><p>${esc(e.t)} ${p.side==='L'?'rises':'moves opposite'} with ${esc(p.u)}; its counterpart is <b>${esc(p.mate)}</b></p></div><button class="btn sm" id="ePair">View pair</button></div>
     <div class="pc-sides"><div class="pc-side"><b>${esc(p.side==='L'?e.t:p.mate)}</b>${pctSpan(liveE(p.side==='L'?e.t:p.mate))}</div><div class="pc-mid"><span class="mut">⇅</span></div><div class="pc-side r"><b>${esc(p.side==='L'?p.mate:e.t)}</b>${pctSpan(liveE(p.side==='L'?p.mate:e.t))}</div></div></section>`:''}
  ${feeDragHTML(e)}
  <div class="row-btns"><button class="btn pri" id="eChart">Candlestick chart</button>${p?`<button class="btn" id="ePair2">Compare with ${esc(p.mate)}</button>`:''}<button class="btn ghost" data-lesson="${lv?'etf-decay':'etf-basics'}">Learn more</button></div>
  <p class="disc">${esc(DISC)} Fund data source: stockanalysis.com${e._nf?' (could not load stats for this fund)':''}.</p>`;
  openSheet(e.t+' — '+e.n,html,body=>{
    $('#eStarBtn',body).onclick=()=>{ toggleEStar(e.t); openEtf(e.t); if(S.view==='screen') renderEtfBody(); };
    $('#eChart',body).onclick=()=>{ closeSheet(); CH.t='E:'+e.t; CH.offset=0; setView('chart'); };
    const pp=()=>openPair(p.i); const a=$('#ePair',body); if(a) a.onclick=pp; const b2=$('#ePair2',body); if(b2) b2.onclick=pp;
  });
  sheetOnClose=()=>{ OPEN_SHEET_ETF=null; };
}

/* ---------- bài học ETF ---------- */
const ETF_LESSONS=[
 {id:'etf-basics',g:'ETF',t:'What is an ETF?',d:'A basket of assets that trades like a stock',
  vis:()=>sv(`<rect x="12" y="20" width="80" height="86" rx="10" style="fill:var(--s1);stroke:var(--gold)"/>${T(52,38,'1 ETF share','text-anchor="middle" '+TB)}${[0,1,2,3,4,5].map(i=>`<rect x="${22+(i%3)*22}" y="${50+Math.floor(i/3)*24}" width="18" height="18" rx="4" style="fill:${['var(--us)','var(--up)','var(--gold)','var(--vn)','var(--mut)','var(--dn)'][i]};fill-opacity:.7"/>`).join('')}<path d="M100 63 h22" style="stroke:var(--fg)" stroke-width="1.5" marker-end="url(#ar)"/><defs><marker id="ar" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8z" style="fill:var(--fg)"/></marker></defs>${T(160,40,'Trade all day','text-anchor="middle" '+TB)}${T(160,56,'like a stock','text-anchor="middle" '+TS)}${T(160,78,'Fees 0.03–1%/yr','text-anchor="middle" '+TB)}${T(160,94,'Open holdings','text-anchor="middle" '+TS)}`,'An ETF is a basket of assets'),
  f:'ETF price ≈ NAV per share · Net return = Index return − Fees − Tracking error',
  pts:['An ETF (exchange-traded fund) holds a basket of stocks, bonds or commodities and is listed on an exchange; buying one share means owning a slice of the whole basket.','The creation/redemption mechanism run by authorized participants keeps the market price close to net asset value (NAV); large gaps usually appear only in illiquid funds or when the assets trade in a closed market.','The first three stats to check: expense ratio, assets under management (AUM) and liquidity/bid–ask spread. Small funds under a few tens of millions of USD risk being closed.','Passive index ETFs (SPY, VOO, VTI) have very low fees; thematic, active and leveraged ETFs charge much more.','In the US, ETFs are usually more tax-efficient than mutual funds thanks to in-kind redemptions. Vietnamese investors buying US ETFs through an international brokerage account should note the 30% dividend withholding tax (or lower under a tax treaty).','Vietnam has domestic ETFs (E1VFVN30, FUEVFVND, FUESSVFL…) tracking the VN30 and the Diamond and Finlead indices; VNM (VanEck Vietnam) is a US-listed ETF that invests in Vietnamese stocks.'],
  thr:[['Expense ratio','Under 0.2% is good for a large index fund'],['Assets under management','Over 1 bn USD: good liquidity and staying power'],['Tracking error','Under 0.1–0.2 % pts/yr for an index fund']],
  hook:'<b>Memory tip:</b> between two funds tracking the same index, the cheaper one almost always wins over the long run.',src:'SEC Investor Bulletin: Exchange-Traded Funds; ICI Factbook 2025; Bogle, The Little Book of Common Sense Investing (2017).'},
 {id:'etf-decay',g:'ETF',t:'Leveraged & inverse ETFs and volatility decay',d:'Why 3x is not 3 times the annual return',
  vis:()=>{ const path=(arr,col)=>`<path d="${arr.map((v,i)=>(i?'L':'M')+(14+i*17.2).toFixed(1)+' '+(110-(v-40)*0.9).toFixed(1)).join(' ')}" fill="none" style="stroke:${col}" stroke-width="2"/>`;
    const u=[100],l=[100],s=[100]; for(let i=1;i<11;i++){ const r=i%2?0.1:-0.0909; u.push(u[i-1]*(1+r)); l.push(l[i-1]*(1+3*r)); s.push(s[i-1]*(1-3*r)); }
    return sv(`<line class="grid-l" x1="14" x2="186" y1="${110-(100-40)*0.9}" y2="${110-(100-40)*0.9}"/>${path(u,'var(--mut)')}${path(l,'var(--up)')}${path(s,'var(--dn)')}${T(186,18,'Index swings ±10%','text-anchor="end" '+TS)}${T(186,30,'gray index · green 3x · red −3x','text-anchor="end" '+TS)}`,'Volatility decay when prices swing'); },
  f:'Long-run return ≈ L × R − (L² − L) × σ² × T ÷ 2 − fees  (L: daily multiple, σ: annual volatility)',
  pts:['2x, 3x, −1x and −3x funds rebalance at the end of every session to hold the exact multiple for the NEXT DAY. The target holds only for each individual day.','When prices trend in one direction, compounding can deliver more than L times the return. When prices chop sideways, both the long and the inverse fund lose value — decay is proportional to the square of the multiple and the variance.','Example: the index goes +10% then −9.09% (back to the starting price). The 3x fund is left at 94.5; the −3x fund at 89.1. The index is flat, yet both funds lose.','Leveraged fund fees are typically 0.9–1.1%/yr, plus swap and borrowing costs; over the long run inverse funds almost always fall because markets tend to rise.','Volatility funds (UVXY, VIXY) hold VIX futures and bear an extra roll cost (contango) — in normal conditions their price drifts down over time.','Single-stock leveraged funds (TSLL, NVDL…) add concentration risk: one 34% drop in a session can wipe out nearly all of a 3x fund.'],
  thr:[['Holding a 3x fund','A few days to a few weeks, with a stop-loss'],['Index volatility 20%/yr','Annual decay of 3x ≈ 3 × 0.04 = 12% before fees'],['Inverse funds','For short-term hedging, not for holding']],
  hook:'<b>Memory tip:</b> “Leverage is daily, decay is yearly.”',src:'SEC & FINRA Investor Alert: Leveraged and Inverse ETFs (2009, updated 2024); Cheng & Madhavan, The Dynamics of Leveraged and Inverse ETFs, Journal of Investment Management (2009); Avellaneda & Zhang, Path-dependence of Leveraged ETF Returns (2010).'},
 {id:'etf-pairs',g:'ETF',t:'Reading inverse ETF pairs',d:'Session deviation, correlation, holding both',
  vis:()=>sv(`<rect x="10" y="22" width="76" height="80" rx="9" style="fill:var(--s1);stroke:var(--up)"/><rect x="114" y="22" width="76" height="80" rx="9" style="fill:var(--s1);stroke:var(--dn)"/>${T(48,44,'TQQQ','text-anchor="middle" style="font-size:12px;font-weight:800;fill:var(--up);font-family:var(--f-disp)"')}${T(152,44,'SQQQ','text-anchor="middle" style="font-size:12px;font-weight:800;fill:var(--dn);font-family:var(--f-disp)"')}${T(48,64,'+3.0%','text-anchor="middle" '+TB)}${T(152,64,'−2.9%','text-anchor="middle" '+TB)}${T(48,84,'÷ 3 = +1.00','text-anchor="middle" '+TS)}${T(152,84,'÷ 3 = −0.97','text-anchor="middle" '+TS)}${T(100,64,'⇅','text-anchor="middle" style="font-size:16px"')}${T(100,118,'Dev = +1.00 − 0.97 = +0.03','text-anchor="middle" '+TB)}`,'How to compute pair deviation'),
  f:'Session deviation = long fund % ÷ |multiple| + inverse fund % ÷ |multiple| · Ideal: deviation ≈ 0, correlation ≈ −1',
  pts:['Each pair has one fund that rises with the underlying and one that moves opposite at the same multiple (e.g. TQQQ 3x and SQQQ −3x on the Nasdaq-100).','Session deviation converts both funds into “% points of the underlying”. A deviation of a few hundredths of a point is normal (fees, dividends, pricing time); large deviations over many sessions are a warning sign.','Holding both 50/50 is a decay test: if the two funds mirror each other perfectly in a session, the portfolio is flat that session, but compounded over many sessions it is still negative because each fund rebalances on its own.','A daily-return correlation near −1 means the pair matches well; the daily beta should be close to the ratio of multiples (−1 for a pair with equal leverage).','Use pairs to: hedge short-term (buy the inverse fund instead of short selling), check product quality before trading, and see the cost of leverage with your own eyes.'],
  thr:[['Correlation below −0.97','Very good match'],['Hold both down a few %/month','Typical decay + fees of a 3x pair'],['Session deviation above 0.3 pts','Recheck the product']],
  hook:'<b>Memory tip:</b> two opposite funds do not cancel out over time — they both suffer decay.',src:'ProShares & Direxion prospectus (section “Daily objective”); FINRA Regulatory Notice 09-31.'},
 {id:'etf-pick',g:'ETF',t:'Pick ETFs like a pro',d:'A 7-step checklist',
  vis:()=>sv(`${['Goal & index','Expense ratio','Size (AUM)','Liquidity','Tracking error','Structure & tax','Holdings overlap'].map((x,i)=>`<rect x="12" y="${8+i*16}" width="176" height="13" rx="4" style="fill:var(--s1);stroke:var(--line2)"/><text x="20" y="${18+i*16}" style="font-size:8.5px">${i+1}. ${x}</text>`).join('')}`,'ETF selection checklist'),
  f:'Total cost of ownership = Expense ratio + Bid–ask spread + Tracking error (+ roll cost for commodity funds)',
  pts:['Start from the goal: broad market (VOO, VTI), style (VUG, VTV), dividends (SCHD, VIG), bonds (BND, IEF), or hedging (GLD, SH).','Compare fees among funds on the same index: VOO, IVV and SPLG all track the S&P 500 at 0.02–0.03%; SPY charges 0.09% but has the best options liquidity.','Commodity funds (USO, UNG) hold futures, not the physical commodity — they pay a roll cost when the futures curve slopes upward.','Option income funds (JEPI, QYLD) pay high dividends by selling calls, in exchange for capped upside.','Check overlap: QQQ and XLK share most of their large holdings; owning both adds little diversification.'],
  thr:[['Large index fund fees','0.02–0.10%'],['Thematic/active fund fees','0.35–0.95%'],['Bid–ask spread','Under 0.05% for large funds']],
  hook:'<b>Memory tip:</b> read the index name first, the fund name second.',src:'Morningstar, ETF Due Diligence Framework; Vanguard Research, The case for low-cost index-fund investing (2024).'}
];
ETF_LESSONS.forEach(l=>LESSONS.push(l));
ORDER.splice(ORDER.indexOf('Options')+1,0,'ETF');
LESSONS.sort((a,b)=>ORDER.indexOf(a.g)-ORDER.indexOf(b.g));
[
 {q:'An index rises 10% then falls 9.09% (back to the start). Starting from 100, what is a daily 3x fund worth?',a:['94.5','100','90','103'],c:0,e:'1.30 × (1 − 0.2727) ≈ 0.945. Volatility decay.'},
 {q:'Why does holding both TQQQ and SQQQ for several weeks usually lose money?',a:['Both rebalance daily, so both suffer decay and fees','Because one fund always rises','Because of taxes','Because the two funds track different indices'],c:0,e:'There is no risk-free profit from two opposite funds.'},
 {q:'For two ETFs tracking the same S&P 500 index, which factor matters most for long-term returns?',a:['Expense ratio','Issuer name','Price per share','Number of holdings'],c:0,e:'With the same holdings, the difference comes mainly from fees and tracking error.'},
 {q:'What is the pair deviation of a 3x/−3x pair when TQQQ is +3.0% and SQQQ is −2.9%?',a:['+0.03 % pts','+0.1','−5.9','0'],c:0,e:'3.0/3 − 2.9/3 = 1.00 − 0.967 ≈ 0.03.'},
 {q:'What is the ideal daily-return correlation of a long–inverse pair?',a:['−1','0','+1','−3'],c:0,e:'The two funds mirror each other perfectly in every session.'},
 {q:'Over the long run, UVXY usually falls mainly because of?',a:['VIX futures roll cost (contango) and leverage','High dividends','Taxes','Low expense ratio'],c:0,e:'Volatility funds do not hold the VIX index directly.'}
].forEach(q=>QUIZ.push(q));
