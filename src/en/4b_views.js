/* ============================================================
   GIAO DIỆN: điều hướng, Tổng quan, Sàng lọc, Chi tiết mã
   ============================================================ */
const VIEWS=['home','screen','chart','expert','learn','port'];
const RENDER={};
function setView(v,opts){
  if(!VIEWS.includes(v)) v='home';
  S.view=v;
  $$('#tabbar button').forEach(b=>{ if(b.dataset.v===v) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
  VIEWS.forEach(x=>{ $('#v-'+x).hidden= x!==v; });
  RENDER[v]&&RENDER[v]();
  if(!(opts&&opts.keepScroll)) window.scrollTo(0,0);
  try{ if(location.hash!=='#'+v) history.replaceState(null,'','#'+v); }catch(e){}
}
function rerenderCurrent(){ RENDER[S.view]&&RENDER[S.view](); }
function setMarket(m){
  S.market=m; saveState(); S.heroIdx=0;
  $$('#mktSeg button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.m===m)));
  if(S.filters.sector!=='all'&&!inMarket(U).some(s=>s.s===S.filters.sector)) S.filters.sector='all';
  rerenderCurrent();
}
const DISC='For information and educational purposes only, not investment advice. Prices are delayed end-of-day prices; other financial metrics are estimates — verify them against the financial statements and with your broker before making any decision.';

/* ---------------- TỔNG QUAN ---------------- */
RENDER.home=function(){
  const el=$('#v-home'); const L=ranked();
  if(!L.length){ el.innerHTML='<div class="empty">No stocks in this market yet.</div>'; return; }
  const top=L.slice(0,5); S.heroIdx=clamp(S.heroIdx,0,top.length-1); const s=top[S.heroIdx];
  const med=marketMedianFactors(S.market);
  const fsorted=FACTORS.map(F=>({F,v:s._f[F.k]})).sort((a,b)=>b.v-a.v);
  const nA=L.filter(x=>x._grade==='A').length;
  const medScore=median(L.map(x=>x._score));
  el.innerHTML=marketPanelHTML()+`
  <section class="hero" aria-label="Compass">
    <div class="hero-copy">
      <h1><span class="tk">${esc(s.t)}</span> leads the Compass in ${S.market==='ALL'?'both markets':esc(mktName(S.market))}</h1>
      <p class="lead">${esc(s.n)} scores <b style="color:var(--fg)">${s._score}/100</b>, grade ${s._grade}. Strongest in ${esc(fsorted[0].F.n.toLowerCase())} and ${esc(fsorted[1].F.n.toLowerCase())}; weakest in ${esc(fsorted[5].F.n.toLowerCase())} (${fsorted[5].v}).</p>
      <div class="pick-rail" role="group" aria-label="Top five scoring stocks">
        ${top.map((x,i)=>`<button class="pick" data-i="${i}" aria-pressed="${i===S.heroIdx}"><b>${esc(x.t)}</b><span>${x._score}</span></button>`).join('')}
      </div>
      <div class="hero-stats">
        <div><b>${L.length}</b><span>stocks tracked</span></div>
        <div><b>${fmt(medScore,0)}</b><span>median score</span></div>
        <div><b>${nA}</b><span>grade A stocks</span></div>
      </div>
      <div class="row-btns" style="margin-top:16px">
        <button class="btn pri" data-open="${esc(s.t)}">Analyze ${esc(s.t)}</button>
        <button class="btn" data-go="screen">Open screener</button>
      </div>
    </div>
    <div class="compass" id="compass">${radarSVG(FACTORS.map(F=>s._f[F.k]/100),{size:320,bezel:true,labels:FACTORS.map(F=>F.n),sub:FACTORS.map(F=>String(s._f[F.k])),median:FACTORS.map(F=>(med[F.k]||0)/100),pad:30,aria:'6-factor compass for '+s.t})}</div>
  </section>
  <p class="note">Gold line: ${esc(s.t)} profile. Dashed line: ${esc(mktName(S.market))} median. Weight set: <b>${esc(S.preset==='custom'?'Custom':PRESETS[S.preset].n)}</b>. ${esc(DISC)}</p>

  <div class="grid2">
    <section class="panel" aria-labelledby="h-tree">
      <div class="sec-h"><div><h2 id="h-tree">Sector map</h2><p>Area = market cap (in USD) · color = average Compass Score</p></div></div>
      <div class="tree" id="tree"></div>
      <div class="legend"><span><i style="background:${heatColor(35)}"></i>Below 45</span><span><i style="background:${heatColor(55)}"></i>45–64</span><span><i style="background:${heatColor(75)}"></i>65 and up</span><span>Tap a tile to filter by sector</span></div>
    </section>
    <section class="panel" aria-labelledby="h-sc">
      <div class="sec-h"><div><h2 id="h-sc">Valuation × Quality</h2><p>Top right: good businesses at attractive prices</p></div></div>
      <div id="scatter"></div>
    </section>
    <section class="panel span2" aria-labelledby="h-dist">
      <div class="sec-h"><div><h2 id="h-dist">Compass Score distribution</h2><p>Each dot is a stock; tap for details</p></div></div>
      <div class="scroll-x" id="dist"></div>
    </section>
    <section class="panel span2" aria-labelledby="h-rules">
      <div class="sec-h"><div><h2 id="h-rules">Market rules</h2><p>The numbers every investor should know</p></div><button class="btn sm ghost" data-lesson="rules">Learn more</button></div>
      ${marketRulesHTML()}
    </section>
  </div>`;
  renderTree(); renderScatter(); renderDist();
  const li=$('#liveInfo'); if(li) li.onclick=openFeedInfo;
  $$('.pick',el).forEach(b=>b.onclick=()=>{ S.heroIdx=+b.dataset.i; RENDER.home(); });
  if(HAS_GSAP()&&!REDUCED()){
    const c=$('#compass'); gsap.fromTo($('.bezel',c),{rotation:-60,transformOrigin:'50% 50%'},{rotation:0,duration:1.6,ease:'expo.out'});
    animateRadar(c);
  }
};
function marketRulesHTML(){
  const vn=`<div style="display:flex;flex-direction:column;gap:10px">
    <p style="font-size:13.5px"><b>Vietnam price board</b> — colors show price vs. the reference price (e.g. reference price ₫50,000 on HOSE):</p>
    <div class="board">
      <div style="color:var(--floor)">46,500<span>Floor −7%</span></div>
      <div style="color:var(--dn)">49,000<span>Down</span></div>
      <div style="color:var(--ref)">50,000<span>Reference</span></div>
      <div style="color:var(--up)">51,200<span>Up</span></div>
      <div style="color:var(--ceil)">53,500<span>Ceiling +7%</span></div>
    </div>
    <table class="thr"><tr><th>Exchange</th><th>Price band</th><th>Lot</th></tr>
      <tr><td>HOSE</td><td>±7%</td><td>100 shares (odd lot 1–99)</td></tr><tr><td>HNX</td><td>±10%</td><td>100 shares</td></tr><tr><td>UPCoM</td><td>±15%</td><td>100 shares</td></tr></table>
    <p class="note">Trading 9:00–11:30 and 13:00–14:45 (ATO 9:00–9:15, ATC 14:30–14:45). T+2 settlement. Typical foreign ownership limit 49%, banks 30%.</p></div>`;
  const us=`<div style="display:flex;flex-direction:column;gap:10px">
    <p style="font-size:13.5px"><b>US market</b> — no daily price limits; circuit breakers instead:</p>
    <table class="thr"><tr><th>Mechanism</th><th>Threshold</th><th>Effect</th></tr>
      <tr><td>Market-wide circuit breaker Level 1–2</td><td>S&amp;P 500 −7% / −13%</td><td>15-minute halt (before 15:25 ET)</td></tr>
      <tr><td>Level 3</td><td>−20%</td><td>Halted for the rest of the session</td></tr>
      <tr><td>Single-stock LULD</td><td>Dynamic 5–10% price band</td><td>5-minute pause</td></tr></table>
    <p class="note">Trading 9:30–16:00 New York time (20:30–3:00 or 21:30–4:00 Vietnam time, depending on the season). T+1 settlement since May 28, 2024. Minimum lot is 1 share; many brokers allow fractional shares.</p></div>`;
  if(S.market==='VN') return vn; if(S.market==='US') return us;
  return `<div class="grid2">${vn}${us}</div>`;
}
function renderTree(){
  const box=$('#tree'); if(!box) return;
  const L=inMarket(U); const g={};
  L.forEach(s=>{ const k=s.s; g[k]=g[k]||{k,v:0,ws:0,n:0}; const c=capUSD(s); g[k].v+=c; g[k].ws+=c*s._score; g[k].n++; });
  const items=Object.values(g).map(x=>Object.assign(x,{sc:x.ws/x.v}));
  const cells=squarify(items,0,0,100,100);
  box.innerHTML=cells.map(c=>{
    const showName=c.w>13&&c.h>11, showSc=c.w>7&&c.h>7;
    return `<button class="cell" data-sector="${c.k}" style="left:${c.x}%;top:${c.y}%;width:${c.w}%;height:${c.h}%;background:${heatColor(c.sc)}" aria-label="${esc(SECTORS[c.k]||c.k)}: ${c.n} stocks, average score ${Math.round(c.sc)}">${showName?`<b>${esc(SECTORS[c.k]||c.k)}</b>`:'<b></b>'}${showSc?`<span>${Math.round(c.sc)}${c.w>20?' · '+c.n+' stocks':''}</span>`:''}</button>`;
  }).join('');
  $$('.cell',box).forEach(b=>b.onclick=()=>{ S.filters.sector=b.dataset.sector; setView('screen'); });
}
function renderScatter(){
  const box=$('#scatter'); if(!box) return;
  const L=inMarket(U); const W=360,H=290,p={l:34,r:12,t:14,b:34};
  const X=v=>p.l+(v/100)*(W-p.l-p.r), Y=v=>H-p.b-(v/100)*(H-p.t-p.b);
  let g='';
  g+=`<rect x="${X(50)}" y="${Y(100)}" width="${X(100)-X(50)}" height="${Y(50)-Y(100)}" style="fill:var(--up);fill-opacity:.08"/>`;
  [0,25,50,75,100].forEach(v=>{ g+=`<line class="grid-l" x1="${X(v)}" x2="${X(v)}" y1="${Y(0)}" y2="${Y(100)}"/><line class="grid-l" x1="${X(0)}" x2="${X(100)}" y1="${Y(v)}" y2="${Y(v)}"/>`;
    g+=`<text x="${X(v)}" y="${H-p.b+14}" text-anchor="middle">${v}</text><text x="${p.l-6}" y="${Y(v)+4}" text-anchor="end">${v}</text>`; });
  g+=`<line class="axis" x1="${X(50)}" x2="${X(50)}" y1="${Y(0)}" y2="${Y(100)}" stroke-dasharray="3 3"/><line class="axis" x1="${X(0)}" x2="${X(100)}" y1="${Y(50)}" y2="${Y(50)}" stroke-dasharray="3 3"/>`;
  g+=`<text x="${X(98)}" y="${Y(96)}" text-anchor="end" style="fill:var(--up);font-weight:700">Good &amp; cheap</text><text x="${X(2)}" y="${Y(96)}" style="font-weight:600">Good but pricey</text><text x="${X(98)}" y="${Y(3)}" text-anchor="end" style="font-weight:600">Cheap for a reason?</text><text x="${X(2)}" y="${Y(3)}" style="fill:var(--dn);font-weight:600">Avoid</text>`;
  g+=`<text x="${(W+p.l)/2}" y="${H-4}" text-anchor="middle" class="lbl-strong">Valuation score →</text><text transform="translate(10 ${(H-p.b)/2}) rotate(-90)" text-anchor="middle" class="lbl-strong">Quality score →</text>`;
  const many=L.length>150; const labelSet=new Set(L.slice().sort((a,b)=>b._score-a._score).slice(0,7).map(s=>s.t)); const place=labelPlacer(); L.forEach(s=>place(X(s._f.val),Y(s._f.qual)+5,10,10));
  L.forEach(s=>{ const x=X(s._f.val), y=Y(s._f.qual); const col=S.market==='ALL'?(s.m==='US'?'var(--us)':'var(--vn)'):scoreColor(s._score);
    g+=`<g class="dot" data-open="${esc(s.t)}" style="cursor:pointer"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${many?6:12}" fill="transparent"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${many?(s.bank?2.3:2.6):(s.bank?4.6:5.2)}" style="fill:${col};stroke:var(--s1);fill-opacity:${many?.75:1}" stroke-width="${many?.6:1.5}"${s.bank?' transform="rotate(45 '+x.toFixed(1)+' '+y.toFixed(1)+')"':''}/><title>${esc(s.t)} — Valuation ${s._f.val}, Quality ${s._f.qual}, score ${s._score}</title></g>`;
    if(labelSet.has(s.t)){ const w=s.t.length*6.4+2; const cands=[[x+7+w/2,y-5,'start',x+7],[x-7-w/2,y-5,'end',x-7],[x,y-9,'middle',x],[x,y+16,'middle',x]];
      for(const [cx,cy,an,tx] of cands){ if(place(cx,cy,w,11)){ g+=`<text x="${tx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="${an}" class="lbl-strong" style="font-size:10.5px;pointer-events:none">${esc(s.t)}</text>`; break; } } } });
  box.innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Scatter plot of valuation and quality scores">${g}</svg>
  <div class="legend">${S.market==='ALL'?'<span><i style="background:var(--us)"></i>US</span><span><i style="background:var(--vn)"></i>Vietnam</span>':'<span><i style="background:var(--up)"></i>Grade A</span><span><i style="background:var(--gold)"></i>B</span><span><i style="background:var(--mut)"></i>C</span><span><i style="background:var(--dn)"></i>D</span>'}<span>Labels: top 7 scoring stocks</span></div>`;
}
function renderDist(){
  const box=$('#dist'); if(!box) return;
  const L=ranked(); const W=860,H=190,p={l:16,r:16,t:22,b:30}; const place=labelPlacer();
  const X=v=>p.l+v/100*(W-p.l-p.r);
  let g='';
  [[0,45,'D','var(--dn)'],[45,58,'C','var(--mut)'],[58,70,'B','var(--gold)'],[70,100,'A','var(--up)']].forEach(([a,b,l,c])=>{
    g+=`<rect x="${X(a)}" y="${p.t}" width="${X(b)-X(a)}" height="${H-p.t-p.b}" style="fill:${c};fill-opacity:.07"/><text x="${(X(a)+X(b))/2}" y="${p.t-7}" text-anchor="middle" style="fill:${c};font-weight:800;font-family:var(--f-disp);font-size:12px">Grade ${l}</text>`; });
  for(let v=0;v<=100;v+=10) g+=`<line class="axis" x1="${X(v)}" x2="${X(v)}" y1="${H-p.b}" y2="${H-p.b+5}"/><text x="${X(v)}" y="${H-p.b+18}" text-anchor="middle">${v}</text>`;
  g+=`<line class="axis" x1="${X(0)}" x2="${X(100)}" y1="${H-p.b}" y2="${H-p.b}"/>`;
  if(L.length>120){
    const cnt=new Array(50).fill(0), us=new Array(50).fill(0); L.forEach(s=>{ const k=clamp(Math.floor(s._score/2),0,49); cnt[k]++; if(s.m==='US') us[k]++; });
    const mx=Math.max(...cnt,1); const bw=(X(100)-X(0))/50; const hh=H-p.t-p.b-14;
    cnt.forEach((n,k)=>{ if(!n) return; const sc=k*2+1; const h=n/mx*hh; const x=X(k*2);
      const col=S.market==='ALL'?'var(--us)':scoreColor(sc);
      if(S.market==='ALL'){ const hu=us[k]/mx*hh; g+=`<rect x="${(x+1).toFixed(1)}" y="${(H-p.b-h).toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${(h-hu).toFixed(1)}" style="fill:var(--vn);fill-opacity:.85"/><rect x="${(x+1).toFixed(1)}" y="${(H-p.b-hu).toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${hu.toFixed(1)}" style="fill:var(--us);fill-opacity:.85"/>`; }
      else g+=`<rect x="${(x+1).toFixed(1)}" y="${(H-p.b-h).toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" style="fill:${col};fill-opacity:.85"/>`;
      g+=`<rect data-bin="${k*2}" x="${x.toFixed(1)}" y="${p.t}" width="${bw.toFixed(1)}" height="${H-p.t-p.b}" fill="transparent" style="cursor:pointer"><title>${n} stocks scoring ${k*2}–${k*2+1}</title></rect>`;
      if(n===mx||h>hh*.55) g+=`<text x="${(x+bw/2).toFixed(1)}" y="${(H-p.b-h-4).toFixed(1)}" text-anchor="middle" style="font-size:9.5px;fill:var(--fg);pointer-events:none">${n}</text>`; });
    const top=L.slice(0,6);
    top.forEach((s,i)=>{ const x=X(s._score); const y=p.t+4+i*13; g+=`<g data-open="${esc(s.t)}" style="cursor:pointer"><line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${y+3}" y2="${H-p.b}" style="stroke:var(--gold)" stroke-opacity=".5" stroke-dasharray="2 3"/><text x="${(x-4).toFixed(1)}" y="${y+3}" text-anchor="end" style="font-size:10px;font-weight:700;fill:var(--gold)">${esc(s.t)} ${s._score}</text></g>`; });
    box.innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" style="min-width:700px" role="img" aria-label="Histogram of Compass Scores for ${L.length} stocks">${g}</svg><div class="legend">${S.market==='ALL'?'<span><i style="background:var(--us)"></i>US</span><span><i style="background:var(--vn)"></i>Vietnam</span>':''}<span>Bar = number of stocks per 2-point bin · tap a bar to filter from that score</span></div>`;
    $$('[data-bin]',box).forEach(r=>r.addEventListener('click',()=>{ S.filters.min=+r.dataset.bin; S.filters.sort='score'; S.listN=60; S.scrMode='stock'; setView('screen'); }));
    return;
  }
  const bins={};
  L.slice().sort((a,b)=>a._score-b._score).forEach(s=>{ const k=Math.round(s._score/2.4); bins[k]=(bins[k]||0)+1; const lvl=bins[k]-1;
    const x=X(s._score), y=H-p.b-12-lvl*18; const col=S.market==='ALL'?(s.m==='US'?'var(--us)':'var(--vn)'):scoreColor(s._score);
    g+=`<g data-open="${esc(s.t)}" style="cursor:pointer"><circle cx="${x.toFixed(1)}" cy="${y}" r="7.5" style="fill:${col};fill-opacity:.9;stroke:var(--s1)" stroke-width="1.5"/><title>${esc(s.t)}: ${s._score}</title></g>`;
    const tk=s.t.replace('.B',''); if(lvl<7&&place(x,y-10,tk.length*5.6+3,10)) g+=`<text x="${(x).toFixed(1)}" y="${y-10}" text-anchor="middle" style="font-size:9px;fill:var(--fg);pointer-events:none">${esc(tk)}</text>`; });
  box.innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" style="min-width:700px" role="img" aria-label="Compass Score distribution by grade">${g}</svg>`;
}

/* ---------------- SÀNG LỌC ---------------- */
function scrModeHTML(){
  return `<div class="seg scr-mode" role="group" aria-label="Asset type" id="scrMode">${[['stock','Stocks'],['etf','US ETFs'],['pairs','Inverse pairs']].map(([k,n])=>`<button data-sm="${k}" aria-pressed="${S.scrMode===k}">${n}</button>`).join('')}</div>`;
}
function bindScrMode(el){ $$('[data-sm]',el).forEach(b=>b.onclick=()=>{ S.scrMode=b.dataset.sm; saveState(); RENDER.screen(); window.scrollTo(0,0); }); }
RENDER.screen=function(){
  const el=$('#v-screen'); const W=curWeights();
  if(S.scrMode!=='stock'&&typeof renderEtfView==='function'){ el.innerHTML=scrModeHTML()+'<div id="etfView" style="display:flex;flex-direction:column;gap:16px"></div>'; bindScrMode(el); renderEtfView(); return; }
  const secs=[...new Set(inMarket(U).map(s=>s.s))].sort((a,b)=>(SECTORS[a]||a).localeCompare(SECTORS[b]||b,'en'));
  const exs=[...new Set(inMarket(U).map(s=>s.ex))];
  el.innerHTML=scrModeHTML()+`
  <div><div class="sec-h"><div><h2>Multi-factor screener</h2><p>Pick a strategy, fine-tune the weights, re-rank instantly</p></div><button class="btn sm" id="addStock">Add stock</button></div>
    <div class="chips" role="group" aria-label="Strategy">
      ${Object.entries(PRESETS).map(([k,p])=>`<button class="chip ${S.preset===k?'on':''}" data-preset="${k}" aria-pressed="${S.preset===k}" title="${esc(p.d)}">${esc(p.n)}</button>`).join('')}
      <button class="chip ${S.preset==='custom'?'on':''}" data-preset="custom" aria-pressed="${S.preset==='custom'}">Custom</button>
    </div>
    <p class="note" style="margin-top:6px" id="presetDesc">${esc(S.preset==='custom'?'Weights set by you.':PRESETS[S.preset].d)}</p>
  </div>
  <details class="acc" id="wAcc"><summary>Factor weights <span class="mut" style="font-weight:500;font-size:13px;margin-left:auto;margin-right:8px">${FACTORS.map(F=>W[F.k]).join(' / ')}</span></summary>
    <div class="acc-b"><div class="wts">
      ${FACTORS.map(F=>`<label class="wt"><span title="${esc(F.d)}">${esc(F.n)}</span><input type="range" min="0" max="50" step="1" value="${W[F.k]}" data-w="${F.k}" id="w-${F.k}" aria-label="Weight ${esc(F.n)}"><output id="wo-${F.k}">${W[F.k]}</output></label>`).join('')}
    </div><p class="note" style="margin-top:10px">Each factor = 55% percentile rank within its same-market peer group (banks vs. banks) + 45% absolute scale based on academic thresholds. Red flags apply a penalty multiplier of 0.86–0.95.</p></div>
  </details>
  <div class="toolbar">
    <label class="field search"><span class="sr">Search stocks</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input type="text" id="q" placeholder="Search ticker or company name" value="${esc(S.filters.q)}" autocomplete="off"></label>
  </div>
  <div class="filters">
    <label class="field">Sector<select id="fSector"><option value="all">All sectors</option>${secs.map(k=>`<option value="${k}" ${S.filters.sector===k?'selected':''}>${esc(SECTORS[k]||k)}</option>`).join('')}</select></label>
    ${exs.length>1?`<label class="field">Exchange / index<select id="fEx"><option value="all">All</option>${exs.map(x=>`<option value="${esc(x)}" ${S.filters.ex===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`:''}
    <label class="field">Sort by<select id="fSort">${[['score','Compass Score'],['val','Valuation'],['qual','Quality'],['grow','Growth'],['safe','Health'],['mom','Momentum'],['inc','Income'],['mos','Est. margin of safety'],['dy','Dividend yield'],['cap','Market cap'],['chg','Last session change'],['tgt','Upside to target'],['mo','52-week return'],['pe','Lowest P/E']].map(([k,n])=>`<option value="${k}" ${S.filters.sort===k?'selected':''}>${n}</option>`).join('')}</select></label>
    <label class="field">Min score: <b id="minOut" style="color:var(--fg)">${S.filters.min}</b><input type="range" id="fMin" min="0" max="90" step="5" value="${S.filters.min}"></label>
    <label class="switch"><input type="checkbox" id="fNoFlag" ${S.filters.noflag?'checked':''}>Exclude red-flag stocks</label>
  </div>
  <div><div class="sec-h" style="margin-bottom:8px"><p id="resCount"></p><p class="mut" style="font-size:12px">Tap a row for analysis</p></div><div class="list" id="resList"></div></div>
  <p class="note">${esc(DISC)}</p>`;
  $$('[data-preset]',el).forEach(b=>b.onclick=()=>{ const k=b.dataset.preset; if(k==='custom'){ S.custW=S.custW||Object.assign({},curWeights()); $('#wAcc').open=true; } S.preset=k; saveState(); computeAll(); RENDER.screen(); if(k==='custom') $('#wAcc').open=true; });
  let wt;
  $$('[data-w]',el).forEach(r=>r.oninput=()=>{ S.custW=Object.assign({},curWeights()); S.custW[r.dataset.w]=+r.value; S.preset='custom'; $('#wo-'+r.dataset.w).textContent=r.value;
    $$('[data-preset]',el).forEach(b=>{ const on=b.dataset.preset==='custom'; b.classList.toggle('on',on); b.setAttribute('aria-pressed',String(on)); }); $('#presetDesc').textContent='Weights set by you.';
    clearTimeout(wt); wt=setTimeout(()=>{ saveState(); computeAll(); renderList(); },120); });
  bindScrMode(el);
  $('#q').oninput=e=>{ S.filters.q=e.target.value; S.listN=60; renderList(); };
  const fe=$('#fEx'); if(fe) fe.onchange=e=>{ S.filters.ex=e.target.value; S.listN=60; renderList(); };
  $('#fSector').onchange=e=>{ S.filters.sector=e.target.value; S.listN=60; renderList(); };
  $('#fSort').onchange=e=>{ S.filters.sort=e.target.value; S.listN=60; renderList(); };
  $('#fMin').oninput=e=>{ S.filters.min=+e.target.value; $('#minOut').textContent=e.target.value; S.listN=60; renderList(); };
  $('#fNoFlag').onchange=e=>{ S.filters.noflag=e.target.checked; S.listN=60; renderList(); };
  $('#addStock').onclick=()=>openEditor(null);
  renderList();
};
function sortVal(s,k){
  if(k==='score') return s._score; if(FACTORS.some(F=>F.k===k)) return s._f[k];
  if(k==='mos') return isNum(s._val.blend)?s._val.blend:-9; if(k==='chg'){ const q=liveQ(s.t); return q&&isNum(q.pct)?q.pct:-999; } if(k==='dy') return s.dy||0; if(k==='cap') return capUSD(s);
  if(k==='tgt'){ const q=liveQ(s.t); const p=q&&isNum(q.px)?q.px:s.pxf; return isNum(s.tgt)&&isNum(p)&&p>0? s.tgt/p-1 : -9; }
  if(k==='mo') return isNum(s.mo)?s.mo:-999; if(k==='pe') return isNum(s.pe)&&s.pe>0? -s.pe : -9999; return 0;
}
function rowHTML(s,i){
  return `<div class="srow" role="button" tabindex="0" data-open="${esc(s.t)}" aria-label="${esc(s.t)} ${esc(s.n)}, score ${s._score}, grade ${s._grade}">
    <span class="rk">${i+1}</span>
    <span class="nm"><b>${esc(s.t)} <span class="mk ${s.m}">${s.m}</span> <span class="grade g-${s._grade}">${s._grade}</span>${s._flags.length?`<span class="flag" style="padding:0 5px;font-size:10.5px" title="${esc(s._flags.join('; '))}">${s._flags.length} flags</span>`:''}${s.edited||s.custom?'<span class="mk" style="color:var(--gold)">EDITED</span>':''}</b><span>${pxChip(s.t)}${liveQ(s.t)?' · ':''}${esc(s.n)} · ${esc(SECTORS[s.s]||s.s)}</span></span>
    <span style="display:flex;align-items:center;gap:8px">${glyphHTML(s)}<button class="star" data-star="${esc(s.t)}" aria-pressed="${isStar(s.t)}" aria-label="${isStar(s.t)?'Remove from':'Add to'} watchlist">${starSVG(isStar(s.t))}</button></span>
    <span class="ring">${ringSVG(s._score,46,4.5)}<b>${s._score}</b></span>
  </div>`;
}
function renderList(){
  const f=S.filters; const q=f.q.trim().toLowerCase();
  const qn=q.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
  const hit=s=>!q||s.t.toLowerCase().includes(q)||s.n.toLowerCase().includes(q)||s.n.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').includes(qn);
  let L=inMarket(U).filter(s=>(f.sector==='all'||s.s===f.sector)&&(!f.ex||f.ex==='all'||s.ex===f.ex)&&s._score>=f.min&&(!f.noflag||!s._flags.length)&&hit(s));
  L.sort((a,b)=>sortVal(b,f.sort)-sortVal(a,f.sort));
  const pend=(S.market==='VN'?PENDING.VN.length:S.market==='US'?PENDING.US.length:PENDING.US.length+PENDING.VN.length);
  $('#resCount').innerHTML=`<b style="color:var(--fg)">${L.length}</b> stocks · ${esc(mktName(S.market))}${f.sector!=='all'?' · '+esc(SECTORS[f.sector]):''}${pend?` · <span class="mut">${pend} stocks awaiting data</span>`:''}`;
  const box=$('#resList'); const N=Math.min(L.length,S.listN||60);
  box.innerHTML= L.length? L.slice(0,N).map(rowHTML).join('')+(L.length>N?`<button class="btn more-btn" id="moreRows">Show ${Math.min(60,L.length-N)} more (${L.length-N} left)</button>`:'') : `<div class="empty">No stocks match the filters. Lower the minimum score, turn off “Exclude red-flag stocks” or choose “All sectors”.<div style="margin-top:12px"><button class="btn sm" id="resetF">Clear filters</button></div></div>`;
  const rf=$('#resetF'); if(rf) rf.onclick=()=>{ S.filters={sector:'all',min:0,noflag:false,sort:'score',q:'',ex:'all'}; S.listN=60; RENDER.screen(); };
  const mb=$('#moreRows'); if(mb) mb.onclick=()=>{ S.listN=(S.listN||60)+60; const y=window.scrollY; renderList(); window.scrollTo(0,y); };
  animateRings(box);
}

/* ---------------- SHEET ---------------- */
let lastFocus=null, sheetOnClose=null;
function openSheet(title,html,after){
  lastFocus=document.activeElement;
  $('#sheetTitle').textContent=title; const body=$('#sheetBody'); body.innerHTML=html; body.scrollTop=0;
  const sh=$('#sheet'); sh.hidden=false; document.documentElement.style.overflow='hidden';
  if(HAS_GSAP()&&!REDUCED()){
    const wide=window.innerWidth>=960;
    gsap.fromTo('#sheetCard',wide?{xPercent:100}:{yPercent:100},wide?{xPercent:0,duration:.42,ease:'power3.out'}:{yPercent:0,duration:.42,ease:'power3.out'});
    gsap.fromTo('#scrim',{opacity:0},{opacity:1,duration:.3});
  }
  after&&after(body);
  setTimeout(()=>$('#sheetClose').focus({preventScroll:true}),50);
}
function closeSheet(){
  const sh=$('#sheet'); if(sh.hidden) return;
  const done=()=>{ sh.hidden=true; document.documentElement.style.overflow=''; $('#sheetBody').innerHTML=''; if(lastFocus&&lastFocus.focus) try{lastFocus.focus({preventScroll:true});}catch(e){} const cb=sheetOnClose; sheetOnClose=null; cb&&cb(); };
  if(HAS_GSAP()&&!REDUCED()){
    const wide=window.innerWidth>=960;
    gsap.to('#sheetCard',Object.assign({duration:.28,ease:'power2.in',onComplete:()=>{ gsap.set('#sheetCard',{clearProps:'transform'}); done(); }},wide?{xPercent:100}:{yPercent:100}));
    gsap.to('#scrim',{opacity:0,duration:.25});
  } else done();
}

/* ---------------- CHI TIẾT MÃ ---------------- */
function factorDetailHTML(s){
  return FACTORS.map(F=>{
    const list=F[s._type];
    return `<details class="acc" style="background:none"><summary><span class="fbar" style="flex:1"><span>${esc(F.n)}</span><span class="tr"><i style="width:${s._f[F.k]}%;background:${scoreColor(s._f[F.k])}"></i></span><b>${s._f[F.k]}</b></span></summary>
      <div class="acc-b"><p class="note" style="margin-bottom:6px">${esc(F.d)}</p><table class="mtab">${list.map(([k])=>{ const m=s._m[k]||{}; const v=m.v; const sc=m.sc;
        let disp= k==='posafe'? (isNum(s.po)&&s.dy>0? pct(s.po,0)+' payout':'No dividend') : k==='fs'? (v==null?'—':v+'/9') : MET[k].u==='%'? pct(v) : MET[k].u==='x'? xx(v) : fmt(v,2);
        return `<tr><td>${esc(MET[k].n)}${MET[k].lo?' <span class="mut" style="font-size:11px">(lower is better)</span>':''}</td><td>${disp}</td><td><div class="mini"><i style="width:${sc==null?0:Math.round(sc*100)}%"></i></div></td></tr>`; }).join('')}</table></div></details>`;
  }).join('');
}
function bankPanelHTML(s){
  const items=[['CAR / CET1',pct(s.car),'≥ 12% good'],['NPL ratio',pct(s.npl),'< 1.5% good'],['CASA',pct(s.casa),'> 30% good'],['NIM',pct(s.nim),'> 3.5% good'],['ROE',pct(s.roe),'> 15% good'],['Fair P/B',s._val.fairPB?xx(s._val.fairPB,2):'—','(ROE−g)/(r−g)']];
  const miss=!isNum(s.car)&&!isNum(s.npl)&&!isNum(s.nim);
  return `<div class="kv">${items.map(([a,b,c])=>`<div><span>${a}</span><b>${b}</b><span>${c}</span></div>`).join('')}</div>${miss?'<p class="note">No CAR, NPL, CASA or NIM data for this bank yet (the aggregated source does not publish them); the Health score uses only the available metrics. You can enter them manually via “Edit data”.</p>':''}`;
}
const F9=[['ROA > 0','Profitable'],['CFO > 0','Positive operating CF'],['ROA up','Improving profitability'],['CFO > NI','Quality earnings'],['Leverage down','LT debt/assets down'],['Liquidity up','Current ratio up'],['No dilution','No new shares issued'],['Gross margin up','Gross profit margin'],['Asset turnover up','Asset efficiency']];
function zBarHTML(z){
  if(!isNum(z)) return '<p class="note">Altman Z does not apply to financial companies.</p>';
  const W=320,H=64,X=v=>10+clamp(v,0,6)/6*(W-20);
  let g=`<rect x="${X(0)}" y="14" width="${X(1.81)-X(0)}" height="12" rx="3" style="fill:var(--dn);fill-opacity:.75"/><rect x="${X(1.81)}" y="14" width="${X(2.99)-X(1.81)}" height="12" style="fill:var(--ref);fill-opacity:.75"/><rect x="${X(2.99)}" y="14" width="${X(6)-X(2.99)}" height="12" rx="3" style="fill:var(--up);fill-opacity:.75"/>`;
  g+=`<text x="${X(.9)}" y="58" text-anchor="middle">Distress</text><text x="${X(2.4)}" y="58" text-anchor="middle">Caution</text><text x="${X(4.5)}" y="58" text-anchor="middle">Safe</text>`;
  g+=`<path d="M${X(z)} 30 l-6 9 h12z" style="fill:var(--fg)"/><text x="${X(z)}" y="10" text-anchor="middle" class="lbl-strong">${fmt(z,1)}${z>6?'+':''}</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Altman Z ${fmt(z,1)}">${g}</svg>`;
}
function dcfChartSVG(d){
  const vals=d.pv.concat(isNum(d.tv)?[d.tv]:[]); const mx=Math.max(...vals,1);
  const W=340,H=150,bw=(W-20)/vals.length; let g='';
  vals.forEach((v,i)=>{ const h=Math.max(1,v/mx*(H-40)); const isTV=i===d.pv.length;
    g+=`<rect x="${10+i*bw+2}" y="${H-22-h}" width="${bw-4}" height="${h}" rx="2" style="fill:${isTV?'var(--gold)':'var(--us)'};fill-opacity:${isTV?.85:.7}"/>`;
    g+=`<text x="${10+i*bw+bw/2}" y="${H-8}" text-anchor="middle" style="font-size:10px">${isTV?'TV':'N'+(i+1)}</text>`;
    if(isTV||i===0) g+=`<text x="${10+i*bw+bw/2}" y="${H-26-h}" text-anchor="middle" class="lbl-strong" style="font-size:10px">${fmt(v,1)}</text>`; });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Present value of each year's cash flow and terminal value">${g}</svg>`;
}
function autoReport(s){
  const v=s._val; const fs=FACTORS.map(F=>({F,v:s._f[F.k]})).sort((a,b)=>b.v-a.v);
  const best=(F)=>{ const L=F[s._type].map(([k])=>({k,m:s._m[k]})).filter(x=>x.m&&x.m.sc!=null&&x.k!=='posafe').sort((a,b)=>b.m.sc-a.m.sc); return L; };
  const desc=(k)=>{ const m=s._m[k]; const val= k==='fs'? m.v+'/9' : MET[k].u==='%'? pct(m.v) : MET[k].u==='x'? xx(m.v): fmt(m.v,2); return MET[k].n+' '+val; };
  const pros=fs.filter(x=>x.v>=62).slice(0,3).map(x=>`<li><b>${esc(x.F.n)} ${x.v}</b>: ${best(x.F).slice(0,2).map(z=>esc(desc(z.k))).join(', ')}</li>`);
  const cons=fs.filter(x=>x.v<48).slice(-3).reverse().map(x=>`<li><b>${esc(x.F.n)} ${x.v}</b>: ${best(x.F).slice(-2).reverse().map(z=>esc(desc(z.k))).join(', ')}</li>`);
  let valTxt='';
  if(isNum(v.implied)&&isNum(s.fg)){
    const diff=v.implied-s.fg;
    valTxt=`The current price implies cash flow growth of about <b>${fmt(v.implied,1)}%/yr</b> over the next 5 years (cost of capital ${fmt(v.r,1)}%), vs. expected EPS growth of ${fmt(s.fg,0)}%. ${diff>4?'The market expects more than the forecast — growth must beat expectations for the price to rise.':diff<-4?'Implied expectations are below the forecast — if the forecast holds, there is room for a re-rating.':'Implied expectations are close to the forecast — the price reflects it fairly closely.'}`;
  }
  const verify= s.bank? ['Asset quality: group-2 loans, restructured loans, corporate bonds held','Bad-debt coverage ratio (LLR) and credit costs','Credit growth quota granted by the State Bank (SBV)','Capital-raising plans, stock dividends (dilution)']
    : ['Operating cash flow vs. accounting profit over 3–5 years','Capex plans and funding sources','Receivables and inventory growing faster than revenue?','Related-party transactions, accounting policy changes'];
  return `<div style="display:flex;flex-direction:column;gap:10px;font-size:14px">
    <p>${esc(s.t)} scores <b>${s._score}/100</b> (grade ${s._grade}), ranked #${s._rank}/${s._of} in ${esc(mktName(s.m))} under the “${esc(S.preset==='custom'?'Custom':PRESETS[S.preset].n)}” weight set. Factor dispersion is ${s._disp} points — ${s._disp>20?'a lopsided profile, better suited to a specific strategy than to a balanced portfolio':'a fairly even profile'}.</p>
    ${pros.length?`<div><b class="up">Bull case</b><ul class="bul">${pros.join('')}</ul></div>`:''}
    ${cons.length?`<div><b class="dn">Points of caution</b><ul class="bul">${cons.join('')}</ul></div>`:''}
    ${valTxt?`<p>${valTxt}</p>`:''}
    ${s._flags.length?`<p><b class="dn">Red flags:</b> ${esc(s._flags.join('; '))}.</p>`:''}
    <div><b>What to verify in the financial statements</b><ul class="bul">${verify.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
  </div>`;
}
function anaVN(a){ return ({'Strong Buy':'Strong buy','Buy':'Buy','Hold':'Hold','Sell':'Sell','Strong Sell':'Strong sell'})[a]||a||'—'; }
function openStock(t){
  const s=BY[t]; if(!s) return;
  const med=marketMedianFactors(s.m); const v=s._val; const a=mktAssump(s);
  const fsc=fscore(s); ensureHist(s.t,false);
  const q0=liveQ(s.t); const pxNow=q0&&isNum(q0.px)?q0.px:s.pxf; const tUp=isNum(s.tgt)&&isNum(pxNow)&&pxNow>0? (s.tgt/pxNow-1)*100 : null;
  const html=`
  <div class="dt-top">
    <div><h2>${esc(s.t)}</h2><p class="sub">${esc(s.n)} · ${esc(s.ex)} · ${esc(SECTORS[s.s]||s.s)}<br>Market cap ${capText(s)} · Beta ${fmt(s.b,2)}</p>
      <div class="row-btns" style="margin-top:10px"><span class="mk ${s.m}" style="align-self:center">${s.m==='US'?'US':'VIETNAM'}</span><span class="grade g-${s._grade}" style="font-size:13px;align-self:center">Grade ${s._grade}</span><button class="btn sm" data-star-d="${esc(s.t)}" aria-pressed="${isStar(s.t)}"><span class="star" style="width:auto;height:auto;color:${isStar(s.t)?'var(--ref)':'inherit'}">${starSVG(isStar(s.t))}</span>${isStar(s.t)?'On watchlist':'Watch'}</button></div></div>
    <div class="bigring">${ringSVG(s._score,108,9)}<div class="v"><b>${s._score}</b><span>#${s._rank}/${s._of}</span></div></div>
  </div>
  <div id="liveSlot" data-t="${esc(s.t)}">${liveBlockHTML(s)}</div>
  <div class="flags">${s._flags.length? s._flags.map(f=>`<span class="flag">⚑ ${esc(f)}</span>`).join('') : '<span class="flag ok">✓ No red flags</span>'}${s.edited?'<span class="flag" style="background:var(--gold-soft);color:var(--gold)">Data edited by you</span>':''}</div>

  <section class="panel"><div class="sec-h" style="margin-bottom:8px"><div><h2 style="font-size:17px">Key metrics</h2><p>${s._src==='est'?'Estimates':'stockanalysis.com, trailing 12 months'}${s._liveFund?' · valuation adjusted to the latest price':''}</p></div></div>
    <div class="kv kv4">
      <div><span>P/E · forward</span><b>${xx(s.pe,1)}</b><span>${isNum(s.fpe)?'Forward P/E '+xx(s.fpe,1):'—'}</span></div>
      <div><span>P/B · P/S</span><b>${xx(s.pb,2)}</b><span>${isNum(s.ps)?'P/S '+xx(s.ps,2):'—'}</span></div>
      <div><span>ROE · ROA</span><b>${pct(s.roe)}</b><span>${isNum(s.roa)?'ROA '+pct(s.roa):'—'}</span></div>
      <div><span>Net margin</span><b>${pct(s.nm)}</b><span>${isNum(s.om)?'Op. margin '+pct(s.om):'—'}</span></div>
      <div><span>Revenue, 3 yrs</span><b>${sgn(s.rg)}</b><span>${isNum(s.rgf)?'3-yr forecast '+sgn(s.rgf):'/yr'}</span></div>
      <div><span>EPS, 3 yrs</span><b>${sgn(s.eg)}</b><span>${isNum(s.fg)?'3-yr forecast '+sgn(s.fg):'/yr'}</span></div>
      <div><span>Dividend</span><b>${pct(s.dy,2)}</b><span>${isNum(s.ydg)&&s.ydg>0?s.ydg+' yrs of consecutive increases':isNum(s.po)?'Payout '+pct(s.po,0):'—'}</span></div>
      <div><span>52-week return</span><b class="${s.mo>=0?'up':'dn'}">${sgn(s.mo)}</b><span>Beta ${fmt(s.b,2)}</span></div>
    </div>
    ${s.ana||isNum(s.tgt)?`<div class="ana"><span class="mut">Analysts${isNum(s.anc)?' ('+s.anc+' analysts)':''}</span><b>${esc(anaVN(s.ana))}</b>${isNum(s.tgt)?`<span>Target price ${s.m==='US'?'$'+fmt(s.tgt,2):fmt(s.tgt,0)}${isNum(tUp)?` · <b class="${tUp>=0?'up':'dn'}">${sgn(tUp,1)}</b> vs. current price`:''}</span>`:''}</div><p class="note">Consensus ratings and target prices come from brokerages and tend to be more optimistic than actual results; treat them as one reference opinion.</p>`:''}
  </section>
  <section class="panel"><div class="sec-h"><h2 style="font-size:17px">6-factor profile</h2></div>
    <div id="dRadar" style="max-width:360px;margin:0 auto">${radarSVG(FACTORS.map(F=>s._f[F.k]/100),{size:300,labels:FACTORS.map(F=>F.n),sub:FACTORS.map(F=>String(s._f[F.k])),median:FACTORS.map(F=>(med[F.k]||0)/100),pad:34,fs:11,aria:'Factor radar '+s.t})}</div>
    <div class="legend" style="justify-content:center"><span><i style="background:var(--gold)"></i>${esc(s.t)}</span><span><i style="background:none;border:1.5px dashed var(--mut)"></i>${esc(mktName(s.m))} median</span></div>
  </section>
  <section style="display:flex;flex-direction:column;gap:8px"><h2 style="font-size:17px">Factor details</h2>${factorDetailHTML(s)}</section>

  <section class="panel" style="display:flex;flex-direction:column;gap:14px"><div class="sec-h" style="margin:0"><div><h2 style="font-size:17px">Intrinsic valuation</h2><p>Current price normalized to 100 to compare all stocks</p></div></div>
    ${gaugeSVG(v.blend,'Blended margin of safety (3-model median)')}
    <div class="kv">
      <div><span>Fair P/E (Graham)</span><b>${xx(v.grahamPE,1)}</b><span>Current ${xx(s.pe,1)} → ${v.grahamMoS==null?'—':sgn((v.grahamPE/s.pe-1)*100,0)}</span></div>
      <div><span>${s.bank?'Fair P/B (Gordon)':'Graham number'}</span><b>${s.bank?(v.pbUp==null?'—':sgn(v.pbUp*100,0)):(v.gnUp==null?'—':sgn(v.gnUp*100,0))}</b><span>${s.bank?'P/B '+xx(s.pb,2)+' vs '+(v.fairPB?xx(v.fairPB,2):'—'):'√(22.5 × EPS × BVPS)'}</span></div>
      <div><span>DCF ${s.bank?'(FCFE)':'(FCF)'}</span><b>${v.dcfUp==null?'—':sgn(v.dcfUp*100,0)}</b><span>Cost of capital ${fmt(v.r,1)}%</span></div>
    </div>
    <div style="border-top:1px solid var(--line);padding-top:12px;display:flex;flex-direction:column;gap:10px">
      <b style="font-family:var(--f-disp);font-size:15px">DCF lab</b>
      <label class="slider-row"><span>5-year growth</span><input type="range" id="dG" min="-10" max="40" step="0.5" value="${v.g1}"><output id="dGo">${fmt(v.g1,1)}%</output></label>
      <label class="slider-row"><span>Cost of capital (r)</span><input type="range" id="dR" min="5" max="20" step="0.25" value="${v.r}"><output id="dRo">${fmt(v.r,2)}%</output></label>
      <label class="slider-row"><span>Long-term growth</span><input type="range" id="dT" min="0" max="6" step="0.25" value="${a.gt}"><output id="dTo">${fmt(a.gt,2)}%</output></label>
      <div id="dcfOut"></div>
      <p class="note">Base cash flow = ${s.bank?'EPS × (1 − g/ROE)':'FCF yield (or 55% of earnings if FCF is negative)'} on a price of 100. Years 6–10 fade toward long-term growth. Reverse DCF: the growth rate the current price “requires” is <b>${v.implied==null?'—':fmt(v.implied,1)+'%/yr'}</b>.</p>
    </div>
  </section>

  <section class="panel" style="display:flex;flex-direction:column;gap:12px">
    <div class="sec-h" style="margin:0"><div><h2 style="font-size:17px">Financial health</h2><p>Piotroski F-Score ${fsc==null?'—':fsc+'/9'}${s.bank?' · bank metrics':' · Altman Z'}</p></div></div>
    ${s.f&&!isNum(s.fsn)?`<div class="f9">${F9.map((x,i)=>{ const ok=s.f[i]==='1'; return `<div class="${ok?'y':'n'}"><b>${ok?'✓':'✗'} ${esc(x[0])}</b>${esc(x[1])}</div>`; }).join('')}</div>`:fsc!=null?`<div class="fsbar" aria-label="F-Score ${fsc}/9">${[...Array(9)].map((_,i)=>`<i class="${i<fsc?(fsc>=7?'y':fsc>=4?'m':'n'):''}"></i>`).join('')}</div><p class="note">9 tests: profitable, positive cash flow, rising ROA, cash flow above earnings, lower leverage, better liquidity, no dilution, rising gross margin, rising asset turnover. 7+ is strong, below 4 is weak.</p>`:''}
    ${s.bank?bankPanelHTML(s):zBarHTML(s.z)}
  </section>

  <section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Expert panel</h2><p>A stock passes when it meets at least 75% of a school's criteria</p></div></div>
    <div class="verdicts">${s._persona.map((p,i)=>`<span class="verdict ${p.pass?'y':'n'}">${p.pass?'✓':'·'} ${esc(PERSONAS[i].n)} <b>${p.n}/${p.tot}</b></span>`).join('')}</div>
  </section>

  <section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Algorithmic report</h2><p>Auto-generated from the data, updated with your chosen weights</p></div></div>${autoReport(s)}</section>

  <div class="row-btns">
    <button class="btn pri" id="dAsk">Ask the AI expert</button>
    <button class="btn" id="dChart">Candlestick chart</button>
    <button class="btn" id="dCmp">Compare</button>
    <button class="btn" id="dEdit">Edit data</button>
    ${s.custom?'<button class="btn ghost" id="dDel" style="color:var(--dn)">Delete this stock</button>':''}
  </div>
  <p class="disc">${esc(DISC)} Source: ${s._src==='est'?esc(DATA_ASOF):'stockanalysis.com (trailing-12-month metrics, retrieved '+esc((s._src==='db'&&DBFUND.asof[s.m]?String(DBFUND.asof[s.m]).slice(0,10):FUND_ASOF).split('-').reverse().join('/'))+')'+(CUR_BY[s.m+':'+(s.tk||s.t)]&&s.bank?'; bank-specific metrics are estimates':'')}${s.edited||s.custom?'; this stock includes data you entered':''}.</p>`;
  openSheet(s.t+' — '+s.n,html,body=>{
    animateRings(body); animateRadar($('#dRadar',body));
    if(HAS_GSAP()&&!REDUCED()){ const nd=$('.needle',body); if(nd) gsap.from(nd,{rotation:-90,svgOrigin:'120 124',duration:1.2,ease:'elastic.out(1,.6)'}); }
    const upd=()=>{ const g=+$('#dG').value,r=+$('#dR').value,gt=+$('#dT').value;
      $('#dGo').textContent=fmt(g,1)+'%'; $('#dRo').textContent=fmt(r,2)+'%'; $('#dTo').textContent=fmt(gt,2)+'%';
      const d=dcf(s,g,r,gt); const out=$('#dcfOut');
      if(!d.valid||d.base<=0){ out.innerHTML='<p class="note" style="color:var(--dn)">'+(d.base<=0?'Base cash flow ≤ 0 — DCF is meaningless for loss-making stocks or negative cash flow. Use P/B, EV/Revenue or wait for cash flow to stabilize.':'Cost of capital must exceed long-term growth by at least 0.25 percentage points.')+'</p>'; return; }
      const up=d.total/100-1; const tvShare=d.tv/d.total;
      out.innerHTML=`${dcfChartSVG(d)}<div class="result"><div><b class="${up>=0?'up':'dn'}">${up>=0?'▲':'▼'} ${sgn(up*100,0)}</b><span>Intrinsic value vs. price</span></div><div><b>${fmt(d.total,0)}</b><span>Value / price of 100</span></div><div><b>${pct(tvShare*100,0)}</b><span>Terminal value share</span></div></div>${tvShare>.75?'<p class="note" style="margin-top:6px">Over 75% of the value lies in the terminal value — the result is very sensitive to long-term assumptions.</p>':''}`; };
    ['dG','dR','dT'].forEach(id=>$('#'+id).oninput=upd); upd();
    $('[data-star-d]',body).onclick=()=>{ toggleStar(s.t); openStock(s.t); rerenderCurrent(); };
    $('#dAsk').onclick=()=>{ closeSheet(); S.expertTab='ai'; setView('expert'); setTimeout(()=>askAI(`In-depth analysis of ${s.t}: investment thesis, key risks, valuation and scenarios.`,s.t),60); };
    $('#dCmp').onclick=()=>{ closeSheet(); S.expertTab='compare'; CMP.a=s.t; if(CMP.b===s.t) CMP.b=null; setView('expert'); };
    $('#dEdit').onclick=()=>openEditor(s.t);
    $('#dChart').onclick=()=>{ closeSheet(); CH.t=s.t; CH.offset=0; setView('chart'); };
    const del=$('#dDel'); if(del) del.onclick=()=>{ if(del.dataset.confirm){ S.custom=S.custom.filter(c=>c.t!==s.t); delete S.overrides[s.t]; S.stars=S.stars.filter(x=>x!==s.t); saveState(); computeAll(); closeSheet(); rerenderCurrent(); toast('Deleted '+s.t); } else { del.dataset.confirm=1; del.textContent='Tap again to delete'; } };
  });
}

/* ---------------- SỬA / THÊM SỐ LIỆU ---------------- */
const GEN_FIELDS=['pe','pb','ev','fcf','dy','po','roe','roic','gm','om','nm','rg','eg','fg','de','cr','ic','z','mo','b'];
const BANK_FIELDS=['pe','pb','dy','po','roe','nim','npl','casa','car','rg','eg','fg','mo','b'];
function openEditor(t){
  const s=t?BY[t]:{t:'',n:'',m:S.market==='US'?'US':'VN',ex:S.market==='US'?'NASDAQ':'HOSE',s:'tech',cap:'',f:'000000000'};
  const isNew=!t; const bank=!!s.bank;
  const fieldsFor=b=>(b?BANK_FIELDS:GEN_FIELDS);
  const fieldHTML=b=>fieldsFor(b).map(k=>`<label class="field">${esc(MET[k].n)}${MET[k].u?' ('+MET[k].u+')':''}<input type="number" step="any" inputmode="decimal" id="e-${k}" value="${isNum(s[k])?s[k]:''}"></label>`).join('');
  const html=`<form id="edForm" class="form-grid" novalidate>
    ${isNew?`<label class="field">Ticker<input type="text" id="e-t" required maxlength="10" autocapitalize="characters" placeholder="e.g. CTD"></label><label class="field">Company name<input type="text" id="e-n" required placeholder="e.g. Coteccons"></label>
    <label class="field">Market<select id="e-m"><option value="VN" ${s.m==='VN'?'selected':''}>Vietnam</option><option value="US" ${s.m==='US'?'selected':''}>US</option></select></label>
    <label class="field">Exchange<input type="text" id="e-ex" value="${esc(s.ex)}"></label>
    <label class="field">Sector<select id="e-s">${Object.entries(SECTORS).map(([k,n])=>`<option value="${k}">${esc(n)}</option>`).join('')}</select></label>
    <label class="switch" style="align-self:end"><input type="checkbox" id="e-bank" ${bank?'checked':''}>Is a bank</label>`:''}
    <label class="field full">Market cap (${s.m==='US'?'bn USD':'tn VND'})<input type="number" step="any" inputmode="decimal" id="e-cap" value="${isNum(s.cap)?s.cap:''}"></label>
    <div class="full form-grid" id="edFields">${fieldHTML(bank)}</div>
    <fieldset class="full" style="border:1px solid var(--line);border-radius:12px;padding:10px"><legend class="note" style="padding:0 6px">Piotroski's 9 tests</legend>
      <div class="f9">${F9.map((x,i)=>`<label class="switch" style="min-height:36px;font-size:12px"><input type="checkbox" id="e-f${i}" ${s.f&&s.f[i]==='1'?'checked':''}>${esc(x[0])}</label>`).join('')}</div></fieldset>
    <p class="note full" id="edErr" style="color:var(--dn)"></p>
    <div class="row-btns full"><button class="btn pri" type="submit">${isNew?'Add stock':'Save data'}</button>${!isNew&&(S.overrides[t])?'<button class="btn ghost" type="button" id="edReset">Restore original data</button>':''}</div>
    <p class="note full">Data is saved in this browser only. Enter percentages as plain numbers (15 = 15%). Leave blank if unavailable.</p>
  </form>`;
  openSheet(isNew?'Add new stock':'Edit data: '+t,html,body=>{
    const bk=$('#e-bank',body); if(bk) bk.onchange=()=>{ $('#edFields').innerHTML=fieldHTML(bk.checked); };
    const rs=$('#edReset',body); if(rs) rs.onclick=()=>{ delete S.overrides[t]; saveState(); computeAll(); rerenderCurrent(); toast('Restored '+t); openStock(t); };
    $('#edForm').onsubmit=e=>{ e.preventDefault();
      const b=isNew? $('#e-bank').checked : bank; const rec={};
      const num=id=>{ const el=$('#e-'+id); if(!el||el.value.trim()==='') return null; const v=parseFloat(el.value.replace(',','.')); return isFinite(v)?v:null; };
      fieldsFor(b).concat(['cap']).forEach(k=>{ rec[k]=num(k); });
      rec.f=F9.map((_,i)=>$('#e-f'+i).checked?'1':'0').join('');
      if(isNew){
        const tk=$('#e-t').value.trim().toUpperCase(), nm=$('#e-n').value.trim();
        if(!/^[A-Z0-9.]{1,10}$/.test(tk)){ $('#edErr').textContent='Tickers may contain only uppercase letters, digits and periods (max 10 characters).'; return; }
        if(BY[tk]){ $('#edErr').textContent='Ticker '+tk+' already exists. Open it and choose “Edit data”.'; return; }
        if(!nm){ $('#edErr').textContent='Enter the company name.'; return; }
        if(!isNum(rec.pe)||!isNum(rec.roe)){ $('#edErr').textContent='At least P/E and ROE are needed for scoring.'; return; }
        const obj=Object.assign({t:tk,n:nm,m:$('#e-m').value,ex:$('#e-ex').value.trim()||'—',s:b?'bank':$('#e-s').value},b?{bank:1}:{},rec);
        if(!isNum(obj.cap)) obj.cap=1;
        S.custom.push(obj); saveState(); computeAll(); rerenderCurrent(); toast('Added '+tk); openStock(tk);
      } else {
        const ov={}; Object.keys(rec).forEach(k=>{ const orig=(STOCKS.find(x=>x.t===t)||{})[k]; if(rec[k]!==orig&&!(rec[k]==null&&orig==null)) ov[k]=rec[k]; });
        if(s.custom){ const c=S.custom.find(x=>x.t===t); Object.assign(c,rec); } else if(Object.keys(ov).length) S.overrides[t]=ov; else delete S.overrides[t];
        saveState(); computeAll(); rerenderCurrent(); toast('Saved data for '+t); openStock(t);
      }
    };
  });
}

/* ---------------- CÀI ĐẶT ---------------- */
function applyTheme(){
  const r=document.documentElement;
  if(S.theme==='light') r.setAttribute('data-theme','light'); else if(S.theme==='dark') r.setAttribute('data-theme','dark'); else if(r.dataset.ownTheme) r.removeAttribute('data-theme');
  r.dataset.ownTheme='1';
}
function openSettings(){
  const st=S.settings;
  const inp=(id,label,v,step)=>`<label class="field">${label}<input type="number" step="${step||'0.1'}" inputmode="decimal" id="s-${id}" value="${v}"></label>`;
  const html=`
  <section style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:17px">Language · Ngôn ngữ</h2>
    <div class="seg" role="group" aria-label="Language" id="langSeg">${[['vi','Tiếng Việt'],['en','English']].map(([k,n])=>`<button data-lang="${k}" aria-pressed="${LANG===k}">${n}</button>`).join('')}</div></section>
  <section style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:17px">Appearance</h2>
    <div class="seg" role="group" aria-label="Theme" id="themeSeg">${[['system','System'],['light','Light'],['dark','Dark']].map(([k,n])=>`<button data-th="${k}" aria-pressed="${S.theme===k}">${n}</button>`).join('')}</div></section>
  <section style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:17px">Valuation assumptions</h2>
    <div class="form-grid">
      ${inp('aaaUS','US AAA bond yield (%)',st.aaaUS)}${inp('aaaVN','VN AAA bond yield (%)',st.aaaVN)}
      ${inp('rfUS','US risk-free rate (%)',st.rfUS)}${inp('rfVN','VN risk-free rate (%)',st.rfVN)}
      ${inp('erpUS','US equity risk premium (%)',st.erpUS)}${inp('erpVN','VN equity risk premium (%)',st.erpVN)}
      ${inp('gtUS','US long-term growth (%)',st.gtUS)}${inp('gtVN','VN long-term growth (%)',st.gtVN)}
      ${inp('fx','USD/VND exchange rate',st.fx,'100')}
    </div>
    <div class="row-btns"><button class="btn pri" id="sSave">Apply</button><button class="btn ghost" id="sDef">Reset to defaults</button></div>
    <p class="note">Cost of capital = risk-free rate + beta × equity risk premium (CAPM). Graham fair P/E = (8.5 + 2g) × 4.4 ÷ AAA yield.</p></section>
  <section style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:17px">Your data</h2>
    <p class="note">${Object.keys(S.overrides).length} stocks edited · ${S.custom.length} stocks added · ${S.stars.length} on watchlist · ${S.learned.length} lessons completed.</p>
    <div class="row-btns"><button class="btn sm" id="sClrEd">Clear all data edits</button><button class="btn sm" id="sClrSt">Clear watchlist</button><button class="btn sm" id="sClrLn">Reset learning progress</button></div></section>
  <section style="display:flex;flex-direction:column;gap:8px"><h2 style="font-size:17px">About the method</h2>
    <p class="note"><b>Data source:</b> ${esc(DATA_ASOF)}. This is a static snapshot to illustrate the algorithm, not a live data feed. Update it via “Edit data” using financial statements, annual reports or a data platform you trust.</p>
    <p class="note"><b>Compass Score:</b> 6 factors; each metric is scored 0–1 as 55% percentile rank within the same type and market plus 45% absolute scale; a factor is the weighted average of its metrics; the total score is the weighted average of the factors times the red-flag penalty multiplier. Grade A ≥ 70, B ≥ 58, C ≥ 45.</p>
    <p class="disc">${esc(DISC)}</p></section>`;
  openSheet('Settings & method',html,body=>{
    $$('#langSeg button',body).forEach(b=>b.onclick=()=>{ if(b.dataset.lang!==LANG) setLang(b.dataset.lang); });
    $$('#themeSeg button',body).forEach(b=>b.onclick=()=>{ S.theme=b.dataset.th; saveState(); applyTheme(); $$('#themeSeg button',body).forEach(x=>x.setAttribute('aria-pressed',String(x===b))); });
    $('#sSave').onclick=()=>{ Object.keys(DEFAULT_SETTINGS).forEach(k=>{ const v=parseFloat($('#s-'+k).value); if(isFinite(v)) S.settings[k]=v; }); saveState(); computeAll(); rerenderCurrent(); toast('New assumptions applied'); };
    $('#sDef').onclick=()=>{ S.settings=Object.assign({},DEFAULT_SETTINGS); saveState(); computeAll(); rerenderCurrent(); openSettings(); toast('Default assumptions restored'); };
    $('#sClrEd').onclick=()=>{ S.overrides={}; S.custom=[]; saveState(); computeAll(); rerenderCurrent(); toast('All edits cleared'); openSettings(); };
    $('#sClrSt').onclick=()=>{ S.stars=[]; saveState(); rerenderCurrent(); toast('Watchlist cleared'); openSettings(); };
    $('#sClrLn').onclick=()=>{ S.learned=[]; S.quizBest=0; store.leit={}; saveState(); rerenderCurrent(); toast('Learning progress reset'); openSettings(); };
  });
}
