/* ============================================================
   CHUYÊN GIA · DANH MỤC · CÔNG CỤ · AI
   ============================================================ */
const CMP={a:null,b:null};
RENDER.expert=function(){
  const el=$('#v-expert');
  const tabs=[['council','Council'],['options','Options'],['ai','AI expert'],['compare','Compare'],['tools','Tools']];
  el.innerHTML=`<div class="sec-h" style="margin:0"><div><h2>Expert corner</h2><p>8 investing schools, an options lab, an AI assistant and quantitative tools</p></div></div>
    <div class="subtabs" role="tablist">${tabs.map(([k,n])=>`<button role="tab" data-et="${k}" aria-selected="${S.expertTab===k}">${n}</button>`).join('')}</div>
    <div id="expertBody"></div>`;
  $$('[data-et]',el).forEach(b=>b.onclick=()=>{ S.expertTab=b.dataset.et; RENDER.expert(); });
  ({council:renderCouncil,options:renderOptions,ai:renderAI,compare:renderCompare,tools:renderTools})[S.expertTab]();
};
function renderCouncil(){
  const box=$('#expertBody'); const L=inMarket(U);
  const cons=L.map(s=>({s,n:s._persona.filter(p=>p.pass).length})).sort((a,b)=>b.n-a.n||b.s._score-a.s._score).slice(0,14);
  box.innerHTML=`
  <section class="panel"><div class="sec-h"><div><h2 style="font-size:18px">Consensus matrix</h2><p>Green cell: the stock meets that school's criteria. Last column: number of experts in agreement</p></div></div>
    <div class="scroll-x"><table class="matrix"><thead><tr><th></th>${PERSONAS.map(P=>`<th class="rot"><span>${esc(P.sh)}</span></th>`).join('')}<th class="rot"><span>Consensus</span></th></tr></thead>
    <tbody>${cons.map(({s,n})=>`<tr><td class="tk"><button class="star" style="width:auto;font-family:var(--f-disp);font-weight:700;color:var(--fg);font-size:13px" data-open="${esc(s.t)}">${esc(s.t)}</button></td>${s._persona.map((p,i)=>`<td class="${p.pass?'y':'n'}" title="${esc(PERSONAS[i].n)}: ${p.n}/${p.tot} criteria">${p.pass?'✓':''}</td>`).join('')}<td class="ct">${n}/8</td></tr>`).join('')}</tbody></table></div>
  </section>
  <div class="persona-grid">${PERSONAS.map((P,pi)=>{
    const picks=L.map(s=>({s,e:s._persona[pi]})).sort((a,b)=>b.e.n-a.e.n||b.s._score-a.s._score).slice(0,4);
    return `<article class="panel persona"><div class="persona-h"><span class="mono">${P.ini}</span><div><b>${esc(P.n)}</b><span>${esc(P.role)}</span></div></div>
      <p>${esc(P.phil)}</p><ul class="rules">${P.rules.map(r=>`<li>${esc(r[0])}</li>`).join('')}</ul>
      <div class="picks">${picks.map(({s,e})=>`<button class="pk" data-open="${esc(s.t)}"><b>${esc(s.t)}</b><span class="dots" aria-label="${e.n}/${e.tot} criteria">${e.res.map(x=>`<i class="${x===true?'y':x===null?'na':''}"></i>`).join('')}</span><span class="grade g-${e.pass?'A':'C'}">${e.n}/${e.tot}</span></button>`).join('')}</div></article>`; }).join('')}</div>
  <p class="note">The criteria are simplified quantitative versions inspired by each investor's published approach; they are not their actual picks. ${esc(DISC)}</p>`;
}
function renderCompare(){
  const box=$('#expertBody'); const L=ranked();
  if(!CMP.a||!BY[CMP.a]) CMP.a=L[0]&&L[0].t; if(!CMP.b||!BY[CMP.b]||CMP.b===CMP.a) CMP.b=(L.find(s=>s.t!==CMP.a)||{}).t;
  const opts=sel=>U.slice().sort((a,b)=>a.t.localeCompare(b.t)).map(s=>`<option value="${esc(s.t)}" ${s.t===sel?'selected':''}>${esc(s.t)} — ${esc(s.n)} (${s.m})</option>`).join('');
  const A=BY[CMP.a],B=BY[CMP.b]; if(!A||!B){ box.innerHTML='<div class="empty">You need at least two stocks to compare.</div>'; return; }
  const keys=['pe','pb','roe','fg','dy','mo','b'].concat(!A.bank&&!B.bank?['roic','gm','de','fcf']:['npl','car']);
  const rows=keys.map(k=>{ const a=A._m[k]||{v:metric(A,k)},b=B._m[k]||{v:metric(B,k)}; const fmtv=v=>MET[k].u==='%'?pct(v):MET[k].u==='x'?xx(v):fmt(v,2);
    const sa=a.sc==null?0:a.sc, sb=b.sc==null?0:b.sc;
    return `<div style="display:grid;grid-template-columns:1fr 92px 1fr;gap:8px;align-items:center;font-size:13px;padding:6px 0;border-bottom:1px solid var(--line)">
      <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end"><span style="font-weight:${sa>sb?700:500}">${fmtv(a.v)}</span><span style="display:block;height:8px;width:${Math.round(sa*60)}%;max-width:120px;border-radius:4px;background:var(--gold)"></span></div>
      <div style="text-align:center;color:var(--mut);font-size:12px">${esc(MET[k].n)}</div>
      <div style="display:flex;align-items:center;gap:6px"><span style="display:block;height:8px;width:${Math.round(sb*60)}%;max-width:120px;border-radius:4px;background:var(--us)"></span><span style="font-weight:${sb>sa?700:500}">${fmtv(b.v)}</span></div></div>`; }).join('');
  box.innerHTML=`<section class="panel" style="display:flex;flex-direction:column;gap:14px">
    <div class="filters" style="grid-template-columns:1fr 1fr"><label class="field">Stock A (gold)<select id="cA">${opts(CMP.a)}</select></label><label class="field">Stock B (blue)<select id="cB">${opts(CMP.b)}</select></label></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:center">
      <div><b style="font-family:var(--f-disp);font-size:28px;color:var(--gold)">${esc(A.t)}</b><div class="mut" style="font-size:13px">${A._score}/100 · grade ${A._grade}</div></div>
      <div><b style="font-family:var(--f-disp);font-size:28px;color:var(--us)">${esc(B.t)}</b><div class="mut" style="font-size:13px">${B._score}/100 · grade ${B._grade}</div></div></div>
    <div id="cRadar" style="max-width:380px;margin:0 auto;width:100%">${radarSVG(FACTORS.map(F=>A._f[F.k]/100),{size:300,compare:FACTORS.map(F=>B._f[F.k]/100),labels:FACTORS.map(F=>F.n),sub:FACTORS.map(F=>String(A._f[F.k])),sub2:FACTORS.map(F=>String(B._f[F.k])),pad:36,fs:11,aria:'Radar comparison '+A.t+' and '+B.t})}</div>
    <div>${rows}</div>
    <p class="note">Bar length = the metric's score within that stock's peer group (0–100%); bold figure is the better side. Cross-market comparisons are for reference only, since valuation levels, interest rates and country risk differ.</p>
  </section>`;
  $('#cA').onchange=e=>{ CMP.a=e.target.value; if(CMP.a===CMP.b) CMP.b=null; renderCompare(); };
  $('#cB').onchange=e=>{ CMP.b=e.target.value; renderCompare(); };
  animateRadar($('#cRadar'));
}

/* ---------- công cụ định lượng (hàm thuần, có kiểm thử) ---------- */
function positionSize(capital,riskPct,entry,stop,lot){
  const risk=capital*riskPct/100, per=entry-stop;
  if(!(per>0)||!(entry>0)) return null;
  let sh=Math.floor(risk/per); if(lot>1) sh=Math.floor(sh/lot)*lot;
  const val=sh*entry; return {shares:sh,value:val,riskAmt:sh*per,pctCap:val/capital*100,stopPct:per/entry*100};
}
function kelly(p,b){ return p-(1-p)/b; }
function recoveryNeeded(dd){ return 1/(1-dd)-1; }
function compoundSeries(P,monthly,rate,years){
  const out=[]; let v=P, inv=P; const r=rate/100/12;
  for(let m=1;m<=years*12;m++){ v=v*(1+r)+monthly; inv+=monthly; if(m%12===0) out.push({y:m/12,v,inv}); }
  return out;
}
function hoseTick(p){ return p<10000?10: p<50000?50:100; }
function priceBand(ref,ex){
  const b= ex==='HNX'?.10: ex==='UPCOM'?.15:.07;
  const tickOf=p=> ex==='HOSE'? hoseTick(p) : 100;
  const upRaw=ref*(1+b), dnRaw=ref*(1-b);
  const ceil=Math.floor(upRaw/tickOf(upRaw)+1e-9)*tickOf(upRaw);
  const floor=Math.ceil(dnRaw/tickOf(dnRaw)-1e-9)*tickOf(dnRaw);
  return {ceil,floor,b};
}
function renderTools(){
  const box=$('#expertBody');
  box.innerHTML=`<div class="tools">
   <section class="panel calc"><h2 style="font-size:17px">Risk-based position sizing</h2><p class="note">Each trade loses at most X% of capital if the stop-loss is hit.</p>
    <div class="cin"><label class="field">Capital (₫ or $)<input type="number" id="pCap" value="500000000" inputmode="decimal"></label><label class="field">Risk per trade (%)<input type="number" id="pRisk" value="1" step="0.25" inputmode="decimal"></label>
    <label class="field">Entry price<input type="number" id="pEntry" value="28500" inputmode="decimal"></label><label class="field">Stop-loss price<input type="number" id="pStop" value="26500" inputmode="decimal"></label>
    <label class="field">Lot size<select id="pLot"><option value="100">100 shares (Vietnam)</option><option value="1">1 share (US)</option></select></label></div>
    <div class="result" id="pOut"></div></section>
   <section class="panel calc"><h2 style="font-size:17px">Kelly criterion</h2><p class="note">Theoretically optimal position weight given win probability p and win/loss ratio b.</p>
    <div class="cin"><label class="field">Win probability p (%)<input type="number" id="kP" value="55" inputmode="decimal"></label><label class="field">Win/loss b<input type="number" id="kB" value="1.5" step="0.1" inputmode="decimal"></label></div>
    <div class="result" id="kOut"></div></section>
   <section class="panel calc"><h2 style="font-size:17px">Vietnam ceiling / floor price</h2><p class="note">Rounded to the tick size: HOSE ₫10 (&lt;10,000), ₫50 (10,000–49,950), ₫100 (≥50,000); HNX, UPCoM ₫100.</p>
    <div class="cin"><label class="field">Reference price (₫)<input type="number" id="bRef" value="27350" inputmode="decimal"></label><label class="field">Exchange<select id="bEx"><option>HOSE</option><option>HNX</option><option value="UPCOM">UPCoM</option></select></label></div>
    <div class="result" id="bOut"></div></section>
   <section class="panel calc"><h2 style="font-size:17px">How much to recover a drawdown?</h2><p class="note">The asymmetry of losses: the deeper the drop, the faster the required recovery grows.</p>
    <label class="slider-row"><span>Drawdown</span><input type="range" id="ddR" min="5" max="90" step="5" value="40"><output id="ddO">40%</output></label>
    <div id="ddOut"></div></section>
   <section class="panel calc" style="grid-column:1/-1"><h2 style="font-size:17px">Compounding and regular investing</h2>
    <div class="cin" style="grid-template-columns:repeat(2,minmax(0,1fr))"><label class="field">Initial capital<input type="number" id="cP" value="100000000" inputmode="decimal"></label><label class="field">Monthly contribution<input type="number" id="cM" value="5000000" inputmode="decimal"></label>
    <label class="field">Annual return (%)<input type="number" id="cR" value="12" step="0.5" inputmode="decimal"></label><label class="field">Years<input type="number" id="cY" value="20" inputmode="decimal"></label></div>
    <div id="cOut"></div></section>
  </div><p class="note">Illustrative calculators, not recommendations. Real results are affected by fees, taxes, slippage and liquidity.</p>`;
  const n=id=>parseFloat($('#'+id).value);
  const P=()=>{ const r=positionSize(n('pCap'),n('pRisk'),n('pEntry'),n('pStop'),n('pLot')); $('#pOut').innerHTML= r? `<div><b>${fmt(r.shares,0)}</b><span>shares</span></div><div><b>${fmt(r.value,0)}</b><span>position value (${pct(r.pctCap,1)} of capital)</span></div><div><b class="dn">−${fmt(r.riskAmt,0)}</b><span>max loss (stop ${pct(r.stopPct,1)})</span></div>${r.pctCap>100?'<p class="note" style="color:var(--dn);flex-basis:100%">Position exceeds capital: widen the stop-loss or lower the risk per trade.</p>':''}` : '<p class="note" style="color:var(--dn)">The stop-loss price must be below the entry price.</p>'; };
  const K=()=>{ const p=n('kP')/100,b=n('kB'); if(!(b>0)||!(p>=0&&p<=1)){ $('#kOut').innerHTML='<p class="note">Enter p from 0–100 and b greater than 0.</p>'; return; } const f=kelly(p,b);
    $('#kOut').innerHTML= f<=1e-9? `<div><b class="dn">${pct(f*100,1)}</b><span>Negative expectancy — don't take the trade</span></div>` : `<div><b>${pct(f*100,1)}</b><span>Full Kelly</span></div><div><b class="gold">${pct(f*50,1)}</b><span>½ Kelly (recommended)</span></div><div><b>${sgn((p*b-(1-p))*100,1)}</b><span>Expectancy per unit risked</span></div>`; };
  const Bd=()=>{ const ref=n('bRef'),ex=$('#bEx').value; if(!(ref>0)){ $('#bOut').innerHTML=''; return; } const r=priceBand(ref,ex);
    $('#bOut').innerHTML=`<div><b style="color:var(--ceil)">${fmt(r.ceil,0)}</b><span>Ceiling (+${r.b*100}%)</span></div><div><b style="color:var(--ref)">${fmt(ref,0)}</b><span>Reference</span></div><div><b style="color:var(--floor)">${fmt(r.floor,0)}</b><span>Floor (−${r.b*100}%)</span></div>`; };
  const D=()=>{ const d=n('ddR')/100; $('#ddO').textContent=fmt(d*100,0)+'%';
    const W=340,H=150,p={l:34,r:10,t:10,b:26}; const X=v=>p.l+v/90*(W-p.l-p.r), Y=v=>H-p.b-Math.min(v,900)/900*(H-p.t-p.b);
    let path=''; for(let x=0;x<=90;x+=1){ path+=(x?'L':'M')+X(x).toFixed(1)+' '+Y(recoveryNeeded(x/100)*100).toFixed(1); }
    let g=''; [0,300,600,900].forEach(v=>g+=`<line class="grid-l" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${p.l-4}" y="${Y(v)+4}" text-anchor="end">${v}%</text>`);
    [0,30,60,90].forEach(v=>g+=`<text x="${X(v)}" y="${H-8}" text-anchor="middle">−${v}%</text>`);
    const need=recoveryNeeded(d)*100;
    g+=`<path d="${path}" fill="none" style="stroke:var(--dn)" stroke-width="2.2"/><circle cx="${X(d*100)}" cy="${Y(need)}" r="5" style="fill:var(--gold);stroke:var(--bg)" stroke-width="2"/>`;
    $('#ddOut').innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Required recovery curve">${g}</svg><div class="result"><div><b class="up">+${fmt(need,0)}%</b><span>gain needed to break even after a ${fmt(d*100,0)}% drop</span></div><div><b>${isNum(need)?fmt(Math.log(1+need/100)/Math.log(1.10),1):'—'} years</b><span>at 10%/year compounding</span></div></div>`; };
  const C=()=>{ const ser=compoundSeries(n('cP')||0,n('cM')||0,n('cR')||0,clamp(Math.round(n('cY')||1),1,50)); if(!ser.length){ $('#cOut').innerHTML=''; return; }
    const last=ser[ser.length-1]; const W=640,H=200,p={l:56,r:12,t:12,b:26}; const mx=last.v||1; const bw=(W-p.l-p.r)/ser.length;
    let g=''; [0,.5,1].forEach(k=>g+=`<line class="grid-l" x1="${p.l}" x2="${W-p.r}" y1="${H-p.b-k*(H-p.t-p.b)}" y2="${H-p.b-k*(H-p.t-p.b)}"/><text x="${p.l-6}" y="${H-p.b-k*(H-p.t-p.b)+4}" text-anchor="end">${fmt(mx*k/1e6,0)}M</text>`);
    ser.forEach((s,i)=>{ const h=s.v/mx*(H-p.t-p.b), hi=s.inv/mx*(H-p.t-p.b); const x=p.l+i*bw+1;
      g+=`<rect x="${x}" y="${H-p.b-h}" width="${Math.max(1,bw-2)}" height="${h}" rx="1.5" style="fill:var(--gold);fill-opacity:.85"/><rect x="${x}" y="${H-p.b-hi}" width="${Math.max(1,bw-2)}" height="${hi}" rx="1.5" style="fill:var(--mut);fill-opacity:.55"/>`;
      if(ser.length<=25||i%5===4) g+=`<text x="${x+bw/2}" y="${H-8}" text-anchor="middle">${s.y}</text>`; });
    $('#cOut').innerHTML=`<div class="scroll-x"><svg class="chart" viewBox="0 0 ${W} ${H}" style="min-width:480px" role="img" aria-label="Wealth growth by year">${g}</svg></div>
      <div class="legend"><span><i style="background:var(--gold)"></i>Total wealth</span><span><i style="background:var(--mut)"></i>Principal contributed</span></div>
      <div class="result"><div><b>${fmt(last.v/1e6,0)}M</b><span>after ${last.y} years</span></div><div><b>${fmt(last.inv/1e6,0)}M</b><span>principal</span></div><div><b class="up">${fmt((last.v-last.inv)/1e6,0)}M</b><span>compound gains</span></div><div><b>${fmt(72/(n('cR')||1),1)} years</b><span>to double (Rule of 72)</span></div></div>`; };
  ['pCap','pRisk','pEntry','pStop','pLot'].forEach(id=>$('#'+id).addEventListener('input',P)); $('#pLot').onchange=P;
  ['kP','kB'].forEach(id=>$('#'+id).addEventListener('input',K));
  $('#bRef').addEventListener('input',Bd); $('#bEx').onchange=Bd;
  $('#ddR').addEventListener('input',D);
  ['cP','cM','cR','cY'].forEach(id=>$('#'+id).addEventListener('input',C));
  P();K();Bd();D();C();
}

/* ---------- Chuyên gia AI (sample) ---------- */
let SAMPLE=null, SAMPLE_READY=false;
const CHAT={turns:[],busy:false,ctl:null,focus:null};
(async function initSample(){
  try{ if(window.claude&&typeof window.claude.use==='function'){ SAMPLE=await window.claude.use('sample'); } }catch(e){ SAMPLE=null; }
  SAMPLE_READY=true; if(S.view==='expert'&&S.expertTab==='ai') renderAI();
})();
function compactStock(s){
  const o={ma:s.t,ten:s.n,thi_truong:s.m==='US'?'US':'Vietnam',nganh:SECTORS[s.s],diem:s._score,hang:s._grade,xep_hang:`${s._rank}/${s._of}`,nhan_to:Object.fromEntries(FACTORS.map(F=>[F.n,s._f[F.k]])),co_do:s._flags,
    bien_an_toan_tong_hop_pct: isNum(s._val.blend)?Math.round(s._val.blend*100):null, tang_truong_ngam_dinh_pct: isNum(s._val.implied)?+s._val.implied.toFixed(1):null, chi_phi_von_pct:s._val.r,
    chuyen_gia_dong_y:s._persona.filter(p=>p.pass).map(p=>PERSONAS.find(P=>P.k===p.k).n)};
  const lq=liveQ(s.t); if(lq){ o.gia_dong_cua=lq.px; o.thay_doi_pct=lq.pct; o.phien=lq.d; }
  (s.bank?BANK_FIELDS:GEN_FIELDS).forEach(k=>{ if(isNum(s[k])) o[MET[k].n]=s[k]; });
  if(fscore(s)!=null) o['F-Score']=fscore(s);
  return o;
}
function buildRules(text){
  const mentioned=new Set(); (text.toUpperCase().match(/\b[A-Z]{1,5}(?:\.B)?\b/g)||[]).forEach(w=>{ if(BY[w]) mentioned.add(w); });
  CHAT.turns.forEach(t=>(t.content.toUpperCase().match(/\b[A-Z]{1,5}(?:\.B)?\b/g)||[]).forEach(w=>{ if(BY[w]) mentioned.add(w); }));
  if(CHAT.focus) mentioned.add(CHAT.focus);
  ranked().slice(0,8).forEach(s=>mentioned.add(s.t));
  const data=[...mentioned].slice(0,18).map(t=>compactStock(BY[t]));
  return `You are an investment analyst (CFA standard) inside the "Stock Compass" app for professional investors in the US and Vietnam.
Answering rules:
- Write in English, in a professional, concise tone. Use short headings starting with "## " and bullet points "- ". Do not use tables.
- Reason with academic frameworks: valuation (P/E, P/B, EV/EBITDA, DCF, reverse DCF), quality (ROE, ROIC vs. cost of capital, DuPont), financial health (Altman Z, Piotroski), sector specifics (banks: NIM, NPL, CASA, CAR), macro and market specifics (Vietnam: price bands, foreign ownership room, market upgrade; US: Fed rates, index valuation).
- Always cover the bull case, key risks, scenarios (bull/base/bear) and what the investor should verify independently.
- The data below is an ESTIMATED snapshot inside the app and may be outdated; when a conclusion depends on the numbers, say clearly that they should be re-checked. Do not invent new figures; if you use general knowledge beyond the data, label it as a general view.
- Do not give definitive buy/sell calls or predict specific prices. End with one line: "For reference only, not investment advice."
Market in view: ${mktName(S.market)}. Weighting preset: ${S.preset==='custom'?'Custom':PRESETS[S.preset].n}.
DATA (JSON):
${JSON.stringify(data)}`;
}
function mdLite(src){
  const lines=esc(src).split('\n'); let html='', inList=false;
  const inline=t=>t.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g,'$1<i>$2</i>');
  lines.forEach(l=>{
    const t=l.trim();
    if(/^#{1,4}\s/.test(t)){ if(inList){html+='</ul>';inList=false;} html+='<h4>'+inline(t.replace(/^#{1,4}\s/,''))+'</h4>'; }
    else if(/^[-*•]\s/.test(t)){ if(!inList){html+='<ul>';inList=true;} html+='<li>'+inline(t.replace(/^[-*•]\s/,''))+'</li>'; }
    else if(/^\d+[.)]\s/.test(t)){ if(!inList){html+='<ul>';inList=true;} html+='<li>'+inline(t.replace(/^\d+[.)]\s/,''))+'</li>'; }
    else if(!t){ if(inList){html+='</ul>';inList=false;} }
    else { if(inList){html+='</ul>';inList=false;} html+='<p>'+inline(t)+'</p>'; }
  });
  if(inList) html+='</ul>'; return html;
}
const AI_ERR={not_granted:'You haven\'t allowed this page to use Claude. You can turn it back on in the artifact\'s Permissions menu.',sampling_disabled:'Claude isn\'t available for this account.',rate_limited:'Too many questions sent, or the usage limit was reached. Try again in a few minutes.',session_expired:'Your sign-in session has expired — sign in to Claude again.',refused:'Claude declined this question. Try rephrasing it.',empty_completion:'No answer received. Try a shorter question.',prompt_too_large:'The question is too long. Please shorten it.',upstream_error:'The connection was interrupted. Tap send again.'};
function renderAI(){
  const box=$('#expertBody'); if(!box) return;
  const L=ranked(); const t1=L[0]?L[0].t:'FPT', t2=L[1]?L[1].t:'VCB';
  const sugg=[`Investment thesis and risks for ${t1}`,`Compare ${t1} with ${t2}: which should a 3-year portfolio favor?`,`Build a 6-stock ${S.market==='US'?'US':'Vietnam'} portfolio balancing value and growth from the data`,`Which bank has the best asset quality, and why?`,`Explain why reverse DCF matters for growth stocks`];
  const avail= SAMPLE!==null;
  box.innerHTML=`<section class="panel chat">
    <div class="persona-h"><span class="mono" style="background:var(--gold);color:var(--gold-ink)">AI</span><div><b>AI analyst</b><span>Reads the app's data and Compass Scores, reasons with a CFA framework</span></div></div>
    <div class="msgs" id="msgs" aria-live="polite"></div>
    <div class="chips" id="sugg">${sugg.map(q=>`<button class="chip" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <form class="composer" id="aiForm"><label class="sr" for="aiIn">Question</label><textarea id="aiIn" rows="1" placeholder="Ask about a stock, sector or strategy"></textarea><button class="btn pri" type="submit" id="aiSend" aria-label="Send">Send</button></form>
    <p class="note" id="aiNote">${!SAMPLE_READY?'Connecting to the assistant…': avail?'Each question uses your Claude allowance; you\'ll be asked for permission the first time. Chat history stays only in the open page.':'The AI assistant only works when this page is opened in Claude with a signed-in account. In this view, use the “Algorithmic report” on each stock\'s detail page — that report always works.'}</p>
  </section>`;
  drawMsgs();
  $$('#sugg [data-q]').forEach(b=>b.onclick=()=>askAI(b.dataset.q));
  const ta=$('#aiIn'); ta.oninput=()=>{ ta.style.height='auto'; ta.style.height=Math.min(160,ta.scrollHeight)+'px'; };
  ta.onkeydown=e=>{ if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){ e.preventDefault(); $('#aiForm').requestSubmit(); } };
  $('#aiForm').onsubmit=e=>{ e.preventDefault(); if(CHAT.busy){ CHAT.ctl&&CHAT.ctl.abort(); return; } const q=ta.value.trim(); if(!q) return; ta.value=''; ta.style.height='auto'; askAI(q); };
  updateSendBtn();
}
function updateSendBtn(){ const b=$('#aiSend'); if(!b) return; b.textContent=CHAT.busy?'Stop':'Send'; b.setAttribute('aria-label',CHAT.busy?'Stop answering':'Send'); }
function drawMsgs(){
  const m=$('#msgs'); if(!m) return;
  if(!CHAT.turns.length&&!CHAT.busy){ m.innerHTML='<div class="msg sys">Pick a suggested question or ask your own. The assistant sees the scores, factors, valuation and red flags of the relevant stocks.</div>'; return; }
  m.innerHTML=CHAT.turns.map(t=> t.role==='user'?`<div class="msg u">${esc(t.content)}</div>`:`<div class="msg a">${t.err?`<p class="dn">${esc(t.content)}</p>`:mdLite(t.content)}</div>`).join('')+(CHAT.busy?`<div class="msg a" id="streamMsg">${CHAT.partial?mdLite(CHAT.partial):'<span class="typing" aria-label="Thinking"><i></i><i></i><i></i></span> <span class="mut" style="font-size:13px">Analyzing…</span>'}</div>`:'');
}
async function askAI(q,focus){
  if(focus) CHAT.focus=focus;
  if(S.view!=='expert'||S.expertTab!=='ai'){ S.expertTab='ai'; setView('expert'); }
  if(CHAT.busy) return;
  if(!SAMPLE_READY){ toast('The assistant is connecting, try again in a moment'); return; }
  if(!SAMPLE){ CHAT.turns.push({role:'user',content:q}); CHAT.turns.push({role:'assistant',content:'The AI assistant isn\'t available in this view (open it in Claude and sign in). An algorithmic report is shown instead — open the stock in the Screener to see it in full.',err:true}); drawMsgs(); if(focus) setTimeout(()=>openStock(focus),400); return; }
  const rules=buildRules(q);
  CHAT.turns.push({role:'user',content:q}); CHAT.busy=true; CHAT.partial=''; CHAT.ctl=new AbortController(); drawMsgs(); updateSendBtn();
  const hist=CHAT.turns.filter(t=>!t.err).slice(-8);
  while(hist.length&&hist[0].role!=='user') hist.shift();
  try{
    const res=await SAMPLE([{role:'user',content:rules}].concat(hist.map(t=>({role:t.role,content:t.content}))),{cache:false,signal:CHAT.ctl.signal,onText:({text})=>{ CHAT.partial=text; const sm=$('#streamMsg'); if(sm) sm.innerHTML=mdLite(text); }});
    CHAT.turns.push({role:'assistant',content:res.text+(res.truncated?'\n\n*(The answer was cut short — try a narrower question.)*':'')});
  }catch(e){
    const code=e&&e.code; const keep=e&&e.text;
    if(code==='cancelled'){ if(keep) CHAT.turns.push({role:'assistant',content:keep+'\n\n*(Stopped.)*'}); else CHAT.turns.pop(); }
    else { if(keep&&code!=='refused') CHAT.turns.push({role:'assistant',content:keep}); CHAT.turns.push({role:'assistant',content:AI_ERR[code]||AI_ERR.upstream_error,err:true}); if(['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed'].includes(code)) SAMPLE=null; }
  }
  CHAT.busy=false; CHAT.partial=''; CHAT.ctl=null; drawMsgs(); updateSendBtn();
  const m=$('#msgs'); if(m&&m.lastElementChild) m.lastElementChild.scrollIntoView({block:'nearest',behavior:REDUCED()?'auto':'smooth'});
}

/* ---------------- DANH MỤC ---------------- */
RENDER.port=function(){
  const el=$('#v-port');
  let H=S.stars.map(t=>BY[t]).filter(Boolean); let sample=false;
  if(!H.length){ H=ranked().slice(0,8); sample=true; }
  const raw=H.map(s=> S.pWeight==='equal'?1 : S.pWeight==='invbeta'? 1/Math.max(.3,isNum(s.b)?s.b:1) : Math.pow(Math.max(1,s._score),2));
  const tot=raw.reduce((a,b)=>a+b,0)||1; const w=raw.map(x=>x/tot);
  const wavg=f=>H.reduce((a,s,i)=>a+(isNum(f(s))?f(s)*w[i]:0),0)/(H.reduce((a,s,i)=>a+(isNum(f(s))?w[i]:0),0)||1);
  const hhi=w.reduce((a,b)=>a+b*b,0);
  const pe=1/H.reduce((a,s,i)=>a+(isNum(s.pe)&&s.pe>0?w[i]/s.pe:0),0);
  const sec={}; H.forEach((s,i)=>{ sec[s.s]=(sec[s.s]||0)+w[i]; });
  const secArr=Object.entries(sec).sort((a,b)=>b[1]-a[1]).map(([k,v],i)=>({k,v,c:CAT[i%CAT.length]}));
  const mUS=H.reduce((a,s,i)=>a+(s.m==='US'?w[i]:0),0);
  const fac=FACTORS.map(F=>wavg(s=>s._f[F.k])/100);
  const med=marketMedianFactors(S.market);
  const warns=[]; if(secArr[0]&&secArr[0].v>.4) warns.push(`The ${SECTORS[secArr[0].k]} sector makes up ${pct(secArr[0].v*100,0)} — highly concentrated.`);
  const mxw=Math.max(...w); if(mxw>.25) warns.push(`A single stock makes up ${pct(mxw*100,0)} of the portfolio.`);
  if(1/hhi<5) warns.push('Effective number of stocks below 5 — single-stock risk is still high.');
  const flagged=H.filter(s=>s._flags.length).map(s=>s.t); if(flagged.length) warns.push('Red flags: '+flagged.join(', ')+'.');
  el.innerHTML=`<div class="sec-h" style="margin:0"><div><h2>Your portfolio</h2><p>${sample?'<b style="color:var(--gold)">Sample portfolio</b>: the 8 highest-scoring stocks. Tap the star on any stock to build your own.':H.length+' stocks on watchlist'}</p></div></div>
  <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center"><span class="note">Weighting:</span><div class="seg" role="group" aria-label="Weighting method" id="pwSeg">${[['score','By score²'],['equal','Equal'],['invbeta','Inverse beta']].map(([k,n])=>`<button data-pw="${k}" aria-pressed="${S.pWeight===k}">${n}</button>`).join('')}</div></div>
  ${(()=>{ const pts=H.map((s,i)=>({q:liveQ(s.t),w:w[i]})).filter(x=>x.q&&isNum(x.q.pct)); if(!pts.length) return ''; const tw=pts.reduce((a,b)=>a+b.w,0); const day=pts.reduce((a,b)=>a+b.q.pct*b.w,0)/tw; return `<div class="disc" style="border-style:solid;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><b class="${day>=0?'up':'dn'}" style="font-family:var(--f-disp);font-size:24px">${day>=0?'▲':'▼'} ${fmt(Math.abs(day),2)}%</b><span>Weighted average portfolio move in the latest session (${pts.length}/${H.length} stocks priced)</span></div>`; })()}
  <div class="port-sum">
    <div><b style="color:${scoreColor(wavg(s=>s._score))}">${fmt(wavg(s=>s._score),0)}</b><span>Average Compass Score</span></div>
    <div><b>${fmt(1/hhi,1)}</b><span>Effective number of stocks (1/HHI)</span></div>
    <div><b>${fmt(wavg(s=>s.b),2)}</b><span>Portfolio beta</span></div>
    <div><b>${pct(wavg(s=>s.dy),1)}</b><span>Average dividend yield</span></div>
    <div><b>${xx(pe,1)}</b><span>Harmonic average P/E</span></div>
    <div><b>${pct(wavg(s=>s.roe),0)}</b><span>Average ROE</span></div>
    <div><b>${pct(wavg(s=>s.fg),0)}</b><span>Expected EPS growth</span></div>
    <div><b>${sgn(wavg(s=>isNum(s._val.blend)?s._val.blend*100:null),0)}</b><span>Estimated margin of safety</span></div>
  </div>
  ${warns.length?`<div class="disc" style="border-color:var(--dn);color:var(--fg)"><b class="dn">Risk warnings</b><ul class="bul" style="margin-top:6px">${warns.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:'<div class="disc" style="border-color:var(--up)"><b class="up">Balanced allocation</b> — no concentration warnings or red flags.</div>'}
  <div class="grid2">
    <section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Portfolio factor profile</h2><p>Compared with the ${esc(mktName(S.market))} median</p></div></div><div id="pRadar" style="max-width:340px;margin:0 auto">${radarSVG(fac,{size:300,labels:FACTORS.map(F=>F.n),sub:fac.map(v=>String(Math.round(v*100))),median:FACTORS.map(F=>(med[F.k]||0)/100),pad:34,fs:11,aria:'Portfolio radar'})}</div></section>
    <section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Sector allocation</h2><p>US ${pct(mUS*100,0)} · Vietnam ${pct((1-mUS)*100,0)}</p></div></div>
      <div style="display:grid;grid-template-columns:minmax(0,150px) 1fr;gap:14px;align-items:center"><div>${donutSVG(secArr,160)}</div><div style="display:flex;flex-direction:column;gap:6px;font-size:13px">${secArr.map(x=>`<div style="display:flex;gap:8px;align-items:center"><i style="width:10px;height:10px;border-radius:3px;background:${x.c};flex:none"></i><span style="flex:1;min-width:0">${esc(SECTORS[x.k]||x.k)}</span><b>${pct(x.v*100,0)}</b></div>`).join('')}</div></div>
      <div style="display:flex;height:10px;border-radius:6px;overflow:hidden;margin-top:14px" aria-label="Weight by market"><i style="width:${mUS*100}%;background:var(--us)"></i><i style="width:${(1-mUS)*100}%;background:var(--vn)"></i></div></section>
  </div>
  <section><div class="sec-h"><h2 style="font-size:17px">Weight per stock</h2></div><div class="list">${H.map((s,i)=>`<div class="prow"><button class="star" style="width:auto;justify-content:start;text-align:left;display:block" data-open="${esc(s.t)}"><b style="font-family:var(--f-disp);font-size:15px;color:var(--fg)">${esc(s.t)}</b> <span class="mk ${s.m}">${s.m}</span> <span class="grade g-${s._grade}">${s._score}</span><span style="display:block;font-size:12px;color:var(--mut)">${esc(s.n)}</span></button><span class="bar"><i style="width:${Math.round(w[i]/mxw*100)}%"></i></span><b style="text-align:right">${pct(w[i]*100,1)}${liveQ(s.t)?`<small style="display:block;font-size:11px" class="${boardClass(liveQ(s.t))}">${pctTxt(liveQ(s.t))}</small>`:''}</b>${sample?'<span></span>':`<button class="star" data-star="${esc(s.t)}" aria-pressed="true" aria-label="Remove ${esc(s.t)} from portfolio">${starSVG(true)}</button>`}</div>`).join('')}</div></section>
  <p class="note">Weights are simulated to assess structure, not an allocation recommendation. Averages that mix two markets are for reference only. ${esc(DISC)}</p>`;
  $$('#pwSeg button').forEach(b=>b.onclick=()=>{ S.pWeight=b.dataset.pw; saveState(); RENDER.port(); });
  animateRadar($('#pRadar'));
};
