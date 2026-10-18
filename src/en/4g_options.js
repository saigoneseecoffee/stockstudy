/* ============================================================
   QUYỀN CHỌN: Black–Scholes, Greeks, chiến lược nhiều chân, bài học
   ============================================================ */
/* ---------- toán (hàm thuần) ---------- */
function erf(x){ const s=x<0?-1:1; x=Math.abs(x); const t=1/(1+0.3275911*x);
  const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x); return s*y; }
function ncdf(x){ return 0.5*(1+erf(x/Math.SQRT2)); }
function npdf(x){ return Math.exp(-x*x/2)/Math.sqrt(2*Math.PI); }
/* S: giá, K: giá thực hiện, T: năm, r, q: lãi suất & cổ tức (thập phân), v: biến động (thập phân) */
function bs(type,S,K,T,r,v,q){
  q=q||0;
  if(T<=1e-9||v<=1e-9){ const intr=type==='call'?Math.max(S-K,0):Math.max(K-S,0); const itm=type==='call'?S>K:S<K;
    return {price:intr,delta:itm?(type==='call'?1:-1):0,gamma:0,theta:0,vega:0,rho:0}; }
  const sq=Math.sqrt(T), d1=(Math.log(S/K)+(r-q+v*v/2)*T)/(v*sq), d2=d1-v*sq;
  const dfq=Math.exp(-q*T), dfr=Math.exp(-r*T);
  const gamma=dfq*npdf(d1)/(S*v*sq), vega=S*dfq*npdf(d1)*sq/100;
  if(type==='call'){ const price=S*dfq*ncdf(d1)-K*dfr*ncdf(d2);
    const theta=(-S*dfq*npdf(d1)*v/(2*sq)-r*K*dfr*ncdf(d2)+q*S*dfq*ncdf(d1))/365;
    return {price,delta:dfq*ncdf(d1),gamma,theta,vega,rho:K*T*dfr*ncdf(d2)/100,d1,d2}; }
  const price=K*dfr*ncdf(-d2)-S*dfq*ncdf(-d1);
  const theta=(-S*dfq*npdf(d1)*v/(2*sq)+r*K*dfr*ncdf(-d2)-q*S*dfq*ncdf(-d1))/365;
  return {price,delta:-dfq*ncdf(-d1),gamma,theta,vega,rho:-K*T*dfr*ncdf(-d2)/100,d1,d2};
}
function impliedVol(type,price,S,K,T,r){ let lo=.001,hi=5; for(let i=0;i<80;i++){ const m=(lo+hi)/2; if(bs(type,S,K,T,r,m).price>price) hi=m; else lo=m; } return (lo+hi)/2; }
/* chân: {k:'call'|'put'|'stock', side:1|-1, K, qty, dte} ; mỗi hợp đồng = 100 cổ phiếu */
function legPremium(leg,env){ return leg.k==='stock'? env.S : bs(leg.k,env.S,leg.K,leg.dte/365,env.r,env.v).price; }
function positionValue(legs,env,ST,tau){ /* giá trị lãi/lỗ mỗi cổ phiếu tại giá ST, sau tau ngày */
  let pl=0; legs.forEach(l=>{ const entry=l._prem!=null?l._prem:legPremium(l,env);
    const now= l.k==='stock'? ST : bs(l.k,ST,l.K,Math.max(0,l.dte-tau)/365,env.r,env.v).price;
    pl+=l.side*l.qty*(now-entry); }); return pl; }
function positionGreeks(legs,env,S,tau){ const g={delta:0,gamma:0,theta:0,vega:0};
  legs.forEach(l=>{ if(l.k==='stock'){ g.delta+=l.side*l.qty; return; } const b=bs(l.k,S,l.K,Math.max(0,l.dte-tau)/365,env.r,env.v); ['delta','gamma','theta','vega'].forEach(k=>g[k]+=l.side*l.qty*b[k]); }); return g; }
function analyzeStrategy(legs,env){
  legs.forEach(l=>l._prem=legPremium(l,env));
  const tExp=Math.min(...legs.filter(l=>l.k!=='stock').map(l=>l.dte).concat([9999]));
  const tau= tExp===9999? 30 : tExp;
  const lo=env.S*0.02, hi=env.S*3; const N=900; const xs=[],ys=[];
  for(let i=0;i<=N;i++){ const x=lo+(hi-lo)*i/N; xs.push(x); ys.push(positionValue(legs,env,x,tau)); }
  const be=[]; for(let i=1;i<=N;i++){ if((ys[i-1]<0&&ys[i]>=0)||(ys[i-1]>0&&ys[i]<=0)){ const x=xs[i-1]+(xs[i]-xs[i-1])*(-ys[i-1])/(ys[i]-ys[i-1]); be.push(x); } }
  const slopeHi=(ys[N]-ys[N-1])/(xs[N]-xs[N-1]);
  const maxP= slopeHi>1e-6? Infinity : Math.max(...ys, positionValue(legs,env,0.0001,tau));
  const minAtZero=positionValue(legs,env,0.0001,tau);
  const maxL= slopeHi< -1e-6? -Infinity : Math.min(...ys,minAtZero);
  /* xác suất có lãi tại ngày đáo hạn sớm nhất, phân phối log-chuẩn rủi ro trung tính */
  const T=tau/365, sd=env.v*Math.sqrt(T), mu=Math.log(env.S)+(env.r-env.v*env.v/2)*T;
  let pop=0; for(let i=1;i<=N;i++){ if(ys[i]>0&&ys[i-1]>0){ const a=xs[i-1],b=xs[i]; pop+=ncdf((Math.log(b)-mu)/sd)-ncdf((Math.log(a)-mu)/sd); } }
  if(ys[N]>0) pop+=1-ncdf((Math.log(hi)-mu)/sd);
  if(ys[0]>0) pop+=ncdf((Math.log(lo)-mu)/sd);
  const net=legs.reduce((a,l)=>a+l.side*l.qty*l._prem,0); /* >0: trả tiền (debit) */
  return {tau,be,maxP,maxL,pop:clamp(pop,0,1),net,greeks:positionGreeks(legs,env,env.S,0)};
}
/* ---------- chiến lược mẫu ---------- */
const OPT_PRESETS=[
 {id:'longcall',n:'Long call',view:'Bullish',legs:[['call',1,1]],d:'A bet on a strong rise. Max loss is the premium paid; profit is unlimited.'},
 {id:'longput',n:'Long put',view:'Bearish',legs:[['put',1,1]],d:'A bet on a decline, or insurance. Max loss is the premium.'},
 {id:'shortput',n:'Cash-secured put',view:'Mildly bullish',legs:[['put',-1,.95]],d:'Collect premium; be ready to buy the stock at the strike if the price falls. Keep enough cash set aside.'},
 {id:'covered',n:'Covered call',view:'Neutral to mildly bullish',legs:[['stock',1],['call',-1,1.05]],d:'Hold the stock and sell a call to collect premium; in exchange, upside above the strike is capped.'},
 {id:'protput',n:'Protective put',view:'Bullish, want insurance',legs:[['stock',1],['put',1,.95]],d:'Stock + long put = “insurance” that caps the loss while keeping all the upside.'},
 {id:'collar',n:'Collar',view:'Defensive',legs:[['stock',1],['put',1,.95],['call',-1,1.10]],d:'Sell a call to pay for the put: locks in a P/L range at almost no cost.'},
 {id:'bullcall',n:'Bull call spread',view:'Moderately bullish',legs:[['call',1,1],['call',-1,1.10]],d:'Buy a lower-strike call, sell a higher one: cheaper than a single call; both profit and loss are capped.'},
 {id:'bearput',n:'Bear put spread',view:'Moderately bearish',legs:[['put',1,1],['put',-1,.90]],d:'Buy a higher-strike put, sell a lower one: a cheaper bet on a decline.'},
 {id:'bullput',n:'Bull put (credit)',view:'Not bearish',legs:[['put',-1,.95],['put',1,.90]],d:'Collect a net credit; profit while the price stays above the short put. Loss is capped by the long put.'},
 {id:'bearcall',n:'Bear call (credit)',view:'Not bullish',legs:[['call',-1,1.05],['call',1,1.10]],d:'Collect a net credit; profit while the price stays below the short call.'},
 {id:'straddle',n:'Long straddle',view:'Big move',legs:[['call',1,1],['put',1,1]],d:'Buy a call and a put at the same strike: profit when the price moves far in either direction, lose money if it sits still.'},
 {id:'strangle',n:'Long strangle',view:'Big move',legs:[['call',1,1.05],['put',1,.95]],d:'Like a straddle but with out-of-the-money options: cheaper, needs a bigger move.'},
 {id:'shortstrangle',n:'Short strangle',view:'Range-bound',legs:[['call',-1,1.10],['put',-1,.90]],d:'Sell both an OTM call and an OTM put: collect premium while the price sits still — very large loss risk on both sides.'},
 {id:'condor',n:'Iron condor',view:'Range-bound',legs:[['put',1,.85],['put',-1,.92],['call',-1,1.08],['call',1,1.15]],d:'A short strangle with protective “wings”: collect premium within a price range, with capped loss.'},
 {id:'butterfly',n:'Call butterfly',view:'Pinned at one price',legs:[['call',1,.95],['call',-2,1],['call',1,1.05]],d:'Low cost; maximum profit when the price expires exactly at the middle strike.'},
 {id:'calendar',n:'Calendar spread',view:'Range-bound, IV rising',legs:[['call',-1,1,30],['call',1,1,90]],d:'Sell a near-term option, buy the same strike further out: earn the theta difference.'}
];
const OPT={S:100,iv:30,r:4,dte:30,tau:0,preset:'longcall',legs:null,greek:'delta'};
function presetLegs(id){ const p=OPT_PRESETS.find(x=>x.id===id)||OPT_PRESETS[0];
  return p.legs.map(([k,side,kr,dte])=>({k,side:Math.sign(side),qty:Math.abs(side),K:k==='stock'?null:roundStrike(OPT.S*kr),dte:k==='stock'?null:(dte||OPT.dte)})); }
function sg1(v){ return Math.abs(v)<.05?'0':(v>0?'+':'−')+fmt(Math.abs(v),1); }
function roundStrike(x){ const st= x<25?.5: x<200?1: 5; return Math.round(x/st)*st; }
function optEnv(){ return {S:OPT.S,v:OPT.iv/100,r:OPT.r/100}; }

/* ---------- vẽ biểu đồ lãi/lỗ ---------- */
function payoffSVG(legs,env,opt){
  opt=opt||{}; const W=opt.w||360,H=opt.h||220,p={l:opt.mini?6:44,r:opt.mini?6:10,t:opt.mini?8:12,b:opt.mini?8:26};
  const A=analyzeStrategy(legs.map(l=>Object.assign({},l)),env); const tau=A.tau;
  const x0=env.S*(opt.mini?.75:.6), x1=env.S*(opt.mini?1.25:1.4); const N=opt.mini?80:160; const pts=[],now=[];
  const PL=legs.map(l=>Object.assign({},l,{_prem:legPremium(l,env)}));
  for(let i=0;i<=N;i++){ const x=x0+(x1-x0)*i/N; pts.push([x,positionValue(PL,env,x,tau)]); if(!opt.mini) now.push([x,positionValue(PL,env,x,opt.tau||0)]); }
  let lo=Math.min(...pts.map(q=>q[1]),...now.map(q=>q[1]),0), hi=Math.max(...pts.map(q=>q[1]),...now.map(q=>q[1]),0); const pad=(hi-lo)*.1||1; lo-=pad; hi+=pad;
  const X=x=>p.l+(x-x0)/(x1-x0)*(W-p.l-p.r), Y=y=>p.t+(hi-y)/(hi-lo)*(H-p.t-p.b);
  let g='';
  if(!opt.mini){ const em=env.S*env.v*Math.sqrt(tau/365); g+=`<rect x="${X(Math.max(x0,env.S-em)).toFixed(1)}" y="${p.t}" width="${(X(Math.min(x1,env.S+em))-X(Math.max(x0,env.S-em))).toFixed(1)}" height="${H-p.t-p.b}" style="fill:var(--us);fill-opacity:.07"/>`;
    niceTicks(lo,hi,5).forEach(v=>g+=`<line class="grid-l" x1="${p.l}" x2="${W-p.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text x="${p.l-5}" y="${(Y(v)+4).toFixed(1)}" text-anchor="end" style="font-size:10px">${fmt(v*100,0)}</text>`);
    niceTicks(x0,x1,5).forEach(v=>g+=`<text x="${X(v).toFixed(1)}" y="${H-8}" text-anchor="middle" style="font-size:10px">${fmt(v,0)}</text>`); }
  /* vùng lãi/lỗ */
  let dPos='',dNeg=''; for(let i=0;i<pts.length;i++){ const [x,y]=pts[i]; dPos+=(i?'L':'M')+X(x).toFixed(1)+' '+Y(Math.max(0,y)).toFixed(1)+' '; dNeg+=(i?'L':'M')+X(x).toFixed(1)+' '+Y(Math.min(0,y)).toFixed(1)+' '; }
  g+=`<path d="${dPos}L${X(x1)} ${Y(0)} L${X(x0)} ${Y(0)}Z" style="fill:var(--up);fill-opacity:.18"/><path d="${dNeg}L${X(x1)} ${Y(0)} L${X(x0)} ${Y(0)}Z" style="fill:var(--dn);fill-opacity:.16"/>`;
  g+=`<line x1="${p.l}" x2="${W-p.r}" y1="${Y(0).toFixed(1)}" y2="${Y(0).toFixed(1)}" style="stroke:var(--mut)" stroke-width="1"/>`;
  g+=`<path d="${pts.map((q,i)=>(i?'L':'M')+X(q[0]).toFixed(1)+' '+Y(q[1]).toFixed(1)).join(' ')}" fill="none" style="stroke:var(--gold)" stroke-width="${opt.mini?2.4:2.2}" stroke-linejoin="round"/>`;
  if(!opt.mini){ g+=`<path d="${now.map((q,i)=>(i?'L':'M')+X(q[0]).toFixed(1)+' '+Y(q[1]).toFixed(1)).join(' ')}" fill="none" style="stroke:var(--us)" stroke-width="1.8" stroke-dasharray="5 3"/>`;
    g+=`<line x1="${X(env.S).toFixed(1)}" x2="${X(env.S).toFixed(1)}" y1="${p.t}" y2="${H-p.b}" style="stroke:var(--fg)" stroke-opacity=".5" stroke-dasharray="2 3"/><text x="${(X(env.S)+4).toFixed(1)}" y="${p.t+10}" style="font-size:10px;fill:var(--fg)">Price ${fmt(env.S,1)}</text>`;
    A.be.filter(b=>b>=x0&&b<=x1).forEach(b=>g+=`<circle cx="${X(b).toFixed(1)}" cy="${Y(0).toFixed(1)}" r="4" style="fill:var(--bg);stroke:var(--fg)" stroke-width="1.6"/><text x="${X(b).toFixed(1)}" y="${(Y(0)+15).toFixed(1)}" text-anchor="middle" class="lbl-strong" style="font-size:10px">${fmt(b,1)}</text>`);
    g+=`<text x="${p.l}" y="${p.t-1}" style="font-size:9.5px">P/L per contract (100 sh)</text>`; }
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Options strategy profit/loss chart">${g}</svg>`;
}
function greekProfileSVG(legs,env,greek,tau){
  const W=360,H=150,p={l:44,r:10,t:10,b:24}; const x0=env.S*.6,x1=env.S*1.4,N=120; const pts=[];
  for(let i=0;i<=N;i++){ const x=x0+(x1-x0)*i/N; pts.push([x,positionGreeks(legs,env,x,tau)[greek]]); }
  let lo=Math.min(0,...pts.map(q=>q[1])),hi=Math.max(0,...pts.map(q=>q[1])); if(hi-lo<1e-9){hi+=1;lo-=1;} const pad=(hi-lo)*.1; lo-=pad; hi+=pad;
  const X=x=>p.l+(x-x0)/(x1-x0)*(W-p.l-p.r), Y=y=>p.t+(hi-y)/(hi-lo)*(H-p.t-p.b); const mult= greek==='delta'||greek==='gamma'?100:100;
  let g=''; niceTicks(lo,hi,4).forEach(v=>g+=`<line class="grid-l" x1="${p.l}" x2="${W-p.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text x="${p.l-5}" y="${(Y(v)+4).toFixed(1)}" text-anchor="end" style="font-size:10px">${fmt(v*mult,greek==='gamma'?2:0)}</text>`);
  niceTicks(x0,x1,5).forEach(v=>g+=`<text x="${X(v).toFixed(1)}" y="${H-7}" text-anchor="middle" style="font-size:10px">${fmt(v,0)}</text>`);
  g+=`<line x1="${p.l}" x2="${W-p.r}" y1="${Y(0)}" y2="${Y(0)}" style="stroke:var(--mut)"/><line x1="${X(env.S)}" x2="${X(env.S)}" y1="${p.t}" y2="${H-p.b}" style="stroke:var(--fg)" stroke-opacity=".5" stroke-dasharray="2 3"/>`;
  g+=`<path d="${pts.map((q,i)=>(i?'L':'M')+X(q[0]).toFixed(1)+' '+Y(q[1]).toFixed(1)).join(' ')}" fill="none" style="stroke:var(--ceil)" stroke-width="2.2"/>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${greek} profile vs. stock price">${g}</svg>`;
}

/* ---------- màn hình: Chuyên gia → Quyền chọn ---------- */
function renderOptions(){
  const box=$('#expertBody'); if(!OPT.legs) OPT.legs=presetLegs(OPT.preset);
  const env=optEnv(); const legs=OPT.legs; const pr=OPT_PRESETS.find(x=>x.id===OPT.preset);
  const A=analyzeStrategy(legs,env); const tauMax=Math.max(0,A.tau); OPT.tau=Math.min(OPT.tau,tauMax);
  const money=v=> v===Infinity?'Unlimited': v===-Infinity?'Unlimited': (v>=0?'+':'−')+fmt(Math.abs(v*100),0);
  const atm=bs('call',env.S,roundStrike(env.S),OPT.dte/365,env.r,env.v), atmP=bs('put',env.S,roundStrike(env.S),OPT.dte/365,env.r,env.v);
  box.innerHTML=`
  <section class="panel" style="display:flex;flex-direction:column;gap:12px">
    <div class="sec-h" style="margin:0"><div><h2 style="font-size:18px">Options Lab</h2><p>Black–Scholes pricing · 1 contract = 100 shares · European-style</p></div><button class="btn sm" data-lesson="opt-basics">Start learning</button></div>
    <div class="chips" role="group" aria-label="Preset strategies">${OPT_PRESETS.map(x=>`<button class="chip ${OPT.preset===x.id?'on':''}" data-op="${x.id}" aria-pressed="${OPT.preset===x.id}">${esc(x.n)}</button>`).join('')}</div>
    ${pr?`<p class="note"><b>${esc(pr.n)}</b> · outlook: ${esc(pr.view)}. ${esc(pr.d)}</p>`:'<p class="note"><b>Custom strategy.</b></p>'}
    <div class="opt-in">
      <label class="field">Stock price<input type="number" id="oS" value="${OPT.S}" step="0.5" inputmode="decimal"></label>
      <label class="field">Implied volatility (%)<input type="number" id="oV" value="${OPT.iv}" step="1" inputmode="decimal"></label>
      <label class="field">Interest rate (%)<input type="number" id="oR" value="${OPT.r}" step="0.25" inputmode="decimal"></label>
      <label class="field">Days to expiration<input type="number" id="oD" value="${OPT.dte}" step="1" inputmode="numeric"></label>
    </div>
    <div class="legs" id="oLegs">${legs.map((l,i)=>`<div class="leg">
      <button class="side ${l.side>0?'buy':'sell'}" data-lside="${i}" aria-label="Toggle buy/sell">${l.side>0?'Buy':'Sell'}</button>
      <select data-lk="${i}" aria-label="Type"><option value="call" ${l.k==='call'?'selected':''}>Call</option><option value="put" ${l.k==='put'?'selected':''}>Put</option><option value="stock" ${l.k==='stock'?'selected':''}>Stock</option></select>
      ${l.k==='stock'?'<span class="lk k mut">Entry '+fmt(env.S,1)+'</span><span class="lk d"></span>':`<label class="lk k">K<input type="number" data-lstrike="${i}" value="${l.K}" step="1" inputmode="decimal"></label><label class="lk d">Days<input type="number" data-ld="${i}" value="${l.dte}" step="1" inputmode="numeric"></label>`}
      <label class="lk q">Qty<input type="number" data-lq="${i}" value="${l.qty}" min="1" step="1" inputmode="numeric"></label>
      <span class="prem">${l.k==='stock'?'':'Prem. '+fmt(l._prem,2)}</span>
      <button class="star del" data-ldel="${i}" aria-label="Remove leg" ${legs.length<=1?'disabled':''}>✕</button></div>`).join('')}
      <div class="row-btns"><button class="btn sm" id="oAddC">+ Call</button><button class="btn sm" id="oAddP">+ Put</button><button class="btn sm" id="oAddS">+ Stock</button></div>
    </div>
    <div class="opt-chart">${payoffSVG(legs,env,{w:360,h:230,tau:OPT.tau})}</div>
    <div class="legend" style="margin:0"><span><i style="background:var(--gold)"></i>P/L at expiration (day ${A.tau})</span><span><i style="background:none;border-top:2px dashed var(--us);height:0;border-radius:0"></i>Value after ${OPT.tau} days</span><span><i style="background:var(--us);opacity:.3"></i>Expected move ±1σ</span></div>
    <label class="slider-row"><span>Days elapsed</span><input type="range" id="oTau" min="0" max="${tauMax}" step="1" value="${OPT.tau}"><output>${OPT.tau}/${tauMax}</output></label>
    <div class="port-sum">
      <div><b class="${A.net>0?'dn':'up'}">${A.net>0?'−':'+'}${fmt(Math.abs(A.net*100),0)}</b><span>${A.net>0?'Net debit paid':'Net credit received'}</span></div>
      <div><b class="up">${money(A.maxP)}</b><span>Max profit</span></div>
      <div><b class="dn">${money(A.maxL)}</b><span>Max loss</span></div>
      <div><b>${A.be.length?A.be.map(b=>fmt(b,1)).join(' · '):'—'}</b><span>Breakeven</span></div>
      <div><b>${pct(A.pop*100,0)}</b><span>Probability of profit (est.)</span></div>
      <div><b>${fmt(A.greeks.delta*100,0)}</b><span>Delta (share equivalent)</span></div>
      <div><b class="${Math.abs(A.greeks.theta*100)<.05?'':A.greeks.theta>=0?'up':'dn'}">${sg1(A.greeks.theta*100)}</b><span>Theta / day</span></div>
      <div><b>${sg1(A.greeks.vega*100)}</b><span>Vega / 1% IV</span></div>
    </div>
    <div><div class="seg" role="group" aria-label="Greek profile" id="oGreek">${[['delta','Delta'],['gamma','Gamma'],['theta','Theta'],['vega','Vega']].map(([k,n])=>`<button data-g="${k}" aria-pressed="${OPT.greek===k}">${n}</button>`).join('')}</div>
      <div class="opt-chart" style="margin-top:8px">${greekProfileSVG(legs,env,OPT.greek,OPT.tau)}</div><p class="note">${esc(OPT.greek)} profile of the whole position vs. stock price (×100 = per contract), after ${OPT.tau} days.</p></div>
    <p class="note">Probability of profit uses a lognormal distribution with the IV you entered, under risk-neutral assumptions — it is not a real-world probability. The model ignores dividends, early exercise (American-style options), commissions and the bid–ask spread.</p>
  </section>
  <section class="panel" style="display:flex;flex-direction:column;gap:10px">
    <h2 style="font-size:17px">At-the-money (ATM) quotes · K = ${fmt(roundStrike(env.S),1)}</h2>
    <table class="thr"><thead><tr><th></th><th>Call</th><th>Put</th></tr></thead><tbody>
      ${[['Price (premium)',atm.price,atmP.price,2],['Delta',atm.delta,atmP.delta,3],['Gamma',atm.gamma,atmP.gamma,4],['Theta/day',atm.theta,atmP.theta,3],['Vega/1%',atm.vega,atmP.vega,3],['Rho/1%',atm.rho,atmP.rho,3]].map(([n,a,b,d])=>`<tr><td>${n}</td><td><b>${fmt(a,d)}</b></td><td><b>${fmt(b,d)}</b></td></tr>`).join('')}
    </tbody></table>
    <p class="note">Put–call parity check: C − P = ${fmt(atm.price-atmP.price,3)} ≈ S − K·e<sup>−rT</sup> = ${fmt(env.S-roundStrike(env.S)*Math.exp(-env.r*OPT.dte/365),3)}. Expected ±1σ move over ${OPT.dte} days ≈ ±${fmt(env.S*env.v*Math.sqrt(OPT.dte/365),2)} (${pct(env.v*Math.sqrt(OPT.dte/365)*100,1)}).</p>
  </section>
  <p class="note">A learning tool, not a recommendation. Options are highly leveraged; selling uncovered (naked) options can lose more than your initial capital. Vietnam does not yet have listed stock options — the closest product is covered warrants.</p>`;
  const reRender=()=>{ OPT.preset=null; renderOptions(); };
  $$('[data-op]',box).forEach(b=>b.onclick=()=>{ OPT.preset=b.dataset.op; OPT.legs=presetLegs(OPT.preset); OPT.tau=0; renderOptions(); });
  const num=(id,f)=>{ const el=$('#'+id); el.onchange=()=>{ const v=parseFloat(el.value); if(isFinite(v)&&v>0){ f(v); renderOptions(); } }; };
  num('oS',v=>{ const ratio=v/OPT.S; OPT.S=v; OPT.legs.forEach(l=>{ if(l.K!=null) l.K=roundStrike(l.K*ratio); }); });
  num('oV',v=>OPT.iv=clamp(v,1,300)); num('oR',v=>OPT.r=clamp(v,0,30)); num('oD',v=>{ const d=Math.round(clamp(v,1,1000)); OPT.legs.forEach(l=>{ if(l.dte!=null&&l.dte===OPT.dte) l.dte=d; }); OPT.dte=d; });
  $$('[data-lside]',box).forEach(b=>b.onclick=()=>{ const l=OPT.legs[+b.dataset.lside]; l.side*=-1; reRender(); });
  $$('[data-lk]',box).forEach(s=>s.onchange=()=>{ const l=OPT.legs[+s.dataset.lk]; l.k=s.value; if(l.k==='stock'){ l.K=null; l.dte=null; } else { l.K=l.K||roundStrike(OPT.S); l.dte=l.dte||OPT.dte; } reRender(); });
  $$('[data-lstrike]',box).forEach(s=>s.onchange=()=>{ const v=parseFloat(s.value); if(v>0){ OPT.legs[+s.dataset.lstrike].K=v; reRender(); } });
  $$('[data-ld]',box).forEach(s=>s.onchange=()=>{ const v=Math.round(parseFloat(s.value)); if(v>0){ OPT.legs[+s.dataset.ld].dte=v; reRender(); } });
  $$('[data-lq]',box).forEach(s=>s.onchange=()=>{ const v=Math.round(parseFloat(s.value)); if(v>0){ OPT.legs[+s.dataset.lq].qty=Math.min(v,99); reRender(); } });
  $$('[data-ldel]',box).forEach(b=>b.onclick=()=>{ if(OPT.legs.length>1){ OPT.legs.splice(+b.dataset.ldel,1); reRender(); } });
  const add=k=>{ if(OPT.legs.length>=6){ toast('Maximum 6 legs'); return; } OPT.legs.push(k==='stock'?{k,side:1,qty:1,K:null,dte:null}:{k,side:1,qty:1,K:roundStrike(OPT.S),dte:OPT.dte}); reRender(); };
  $('#oAddC').onclick=()=>add('call'); $('#oAddP').onclick=()=>add('put'); $('#oAddS').onclick=()=>add('stock');
  const tr=$('#oTau'); tr.oninput=()=>{ OPT.tau=+tr.value; tr.nextElementSibling.textContent=OPT.tau+'/'+tauMax; }; tr.onchange=()=>renderOptions();
  $$('#oGreek button').forEach(b=>b.onclick=()=>{ OPT.greek=b.dataset.g; renderOptions(); });
}

/* ---------- bài học quyền chọn ---------- */
const E30={S:100,v:.3,r:.04};
const OL=(k,side,K,qty,dte)=>({k,side,K,qty:qty||1,dte:dte||30});
const pm=(legs)=>payoffSVG(legs,E30,{mini:true,w:200,h:125});
const OPT_LESSONS=[
 {id:'opt-basics',g:'Options',t:'What is an option?',d:'A right, not an obligation',
  vis:()=>sv(`<rect x="10" y="14" width="85" height="96" rx="8" style="fill:var(--s1);stroke:var(--up)"/><rect x="105" y="14" width="85" height="96" rx="8" style="fill:var(--s1);stroke:var(--dn)"/>${T(52,34,'CALL','text-anchor="middle" style="font-size:12px;font-weight:800;fill:var(--up);font-family:var(--f-disp)"')}${T(147,34,'PUT','text-anchor="middle" style="font-size:12px;font-weight:800;fill:var(--dn);font-family:var(--f-disp)"')}${T(52,54,'Right to BUY','text-anchor="middle" '+TB)}${T(147,54,'Right to SELL','text-anchor="middle" '+TB)}${T(52,70,'at strike K','text-anchor="middle" '+TS)}${T(147,70,'at strike K','text-anchor="middle" '+TS)}${T(52,88,'until expiration','text-anchor="middle" '+TS)}${T(147,88,'until expiration','text-anchor="middle" '+TS)}${T(52,102,'Wins on a rise','text-anchor="middle" style="font-size:8px;fill:var(--up)"')}${T(147,102,'Wins on a fall','text-anchor="middle" style="font-size:8px;fill:var(--dn)"')}`,'Calls and puts'),
  f:'The buyer pays a premium for the RIGHT · The seller receives the premium and takes on the OBLIGATION',
  pts:['Call: the right to buy 100 shares at strike price K on or before expiration. Put: the right to sell.','Option premiums are quoted per share: a $2.50 premium means $250 for one 100-share contract.','American-style: exercisable any time up to expiration (US equity options). European-style: only at expiration (SPX index options, Vietnamese covered warrants).','Standard US monthly expiration: the third Friday of the month; many large tickers also have weekly and daily (0DTE) expirations.','Cleared through the OCC (Options Clearing Corporation); brokers grant options trading levels based on experience.'],
  thr:[['Long call/put','Risk limited to the premium'],['Short call without the stock','Unlimited risk'],['Short put','Max loss ≈ K − premium (if the price goes to 0)']],
  hook:'<b>Memory tip:</b> “Call it up, Put it down.”',src:'OCC, Characteristics and Risks of Standardized Options (ODD); Hull, Options, Futures, and Other Derivatives (11th ed., 2021).'},
 {id:'opt-money',g:'Options',t:'In, at and out of the money',d:'Intrinsic value and time value',
  vis:()=>{ const X=v=>14+(v-70)/60*172; let g=`<line class="axis" x1="14" x2="186" y1="100" y2="100"/>`; const pts=[]; for(let s=70;s<=130;s+=1){ const b=bs('call',s,100,60/365,.04,.3).price; pts.push([X(s),100-b*2.4,100-Math.max(0,s-100)*2.4]); }
    g+=`<path d="${pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' ')}" fill="none" style="stroke:var(--gold)" stroke-width="2"/><path d="${pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[2].toFixed(1)).join(' ')}" fill="none" style="stroke:var(--mut)" stroke-width="1.6" stroke-dasharray="4 3"/>`;
    g+=`<line x1="${X(100)}" x2="${X(100)}" y1="20" y2="100" style="stroke:var(--line2)" stroke-dasharray="2 3"/>`+T(X(85),112,'OTM','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--dn)"')+T(X(100),112,'ATM','text-anchor="middle" style="font-size:8px;font-weight:700"')+T(X(118),112,'ITM','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--up)"')+T(X(75),30,'Gold: call','style="font-size:8px;fill:var(--gold)"')+T(X(75),42,'Dash: intrinsic',TS);
    return sv(g,'A call’s price is intrinsic value plus time value'); },
  f:'Premium = Intrinsic value + Time value · Call intrinsic value = max(S − K, 0)',
  pts:['A call is in the money (ITM) when S > K; a put is ITM when S < K. At the money (ATM) when S ≈ K.','Time value is greatest at the money and shrinks to 0 by expiration.','Out-of-the-money (OTM) options have only time value — cheap, but with a low chance of expiring worth anything.','The gap between the gold line and the dashed line is the time value.'],
  thr:[['Delta ≈ 0.5','ATM'],['Delta > 0.7','Deep ITM'],['Delta < 0.3','OTM']],
  hook:'<b>Memory tip:</b> intrinsic value is “real money today”; time value is “hope”.',src:'Hull (2021), ch. 10–11; Natenberg, Option Volatility and Pricing (2nd ed., 2015).'},
 {id:'opt-payoff',g:'Options',t:'The four basic positions',d:'Long call, short call, long put, short put',
  vis:()=>{ const P=[[OL('call',1,100),'Long call'],[OL('call',-1,100),'Short call'],[OL('put',1,100),'Long put'],[OL('put',-1,100),'Short put']]; let g='';
    P.forEach(([leg,n],i)=>{ const ox=8+(i%2)*96, oy=6+Math.floor(i/2)*60; const prem=bs(leg.k,100,100,30/365,.04,.3).price; const f=s=>leg.side*((leg.k==='call'?Math.max(s-100,0):Math.max(100-s,0))-prem);
      const X=s=>ox+4+(s-80)/40*80, Y=v=>oy+28-v*1.3; g+=`<rect x="${ox}" y="${oy}" width="88" height="54" rx="6" style="fill:var(--s1);stroke:var(--line2)"/><line x1="${ox+4}" x2="${ox+84}" y1="${Y(0)}" y2="${Y(0)}" style="stroke:var(--mut)" stroke-width=".8"/>`;
      g+=`<path d="M${X(80)} ${Y(f(80)).toFixed(1)} L${X(100)} ${Y(f(100)).toFixed(1)} L${X(120)} ${Y(f(120)).toFixed(1)}" fill="none" style="stroke:${leg.side>0?'var(--up)':'var(--dn)'}" stroke-width="2"/>`+T(ox+6,oy+50,n,'style="font-size:8px;font-weight:700;fill:var(--fg)"'); });
    return sv(g,'The four basic payoff diagrams'); },
  f:'Long call P/L at expiration = max(S − K, 0) − premium',
  pts:['Long call: max loss = premium; breakeven = K + premium; unlimited profit.','Short call (without the stock): max profit = premium; unlimited loss if the price soars.','Long put: max loss = premium; breakeven = K − premium; max profit = K − premium (price goes to 0).','Short put: max profit = premium; max loss = K − premium — equivalent to committing to buy the stock at K.','Every complex strategy is a combination of these four “Lego bricks” plus the stock.'],
  thr:[['Option buyers','Need the price to move far enough, fast enough'],['Option sellers','Win often, lose rarely — but can lose big']],
  hook:'<b>Memory tip:</b> buying options = buying an educated lottery ticket; selling options = being the insurance company.',src:'McMillan, Options as a Strategic Investment (5th ed., 2012).'},
 {id:'opt-bs',g:'Options',t:'The Black–Scholes model',d:'Five inputs that price an option',
  vis:()=>{ const it=[['S','Stock price','↑ call'],['K','Strike','↓ call'],['T','Time','↑ both'],['σ','Volatility','↑ both'],['r','Rate','↑ call']]; let g='';
    it.forEach(([a,b,c],i)=>{ const y=10+i*22; g+=`<rect x="10" y="${y}" width="180" height="18" rx="4" style="fill:var(--s1);stroke:var(--line2)"/>`+T(20,y+13,a,'style="font-size:11px;font-weight:800;fill:var(--gold);font-family:var(--f-disp)"')+T(40,y+13,b,'style="font-size:8.5px;fill:var(--fg)"')+T(185,y+13,c,'text-anchor="end" style="font-size:8px;fill:var(--up);font-weight:700"'); });
    return sv(g,'The five Black–Scholes inputs'); },
  f:'C = S·N(d₁) − K·e<sup>−rT</sup>·N(d₂) · d₁ = [ln(S/K) + (r + σ²/2)T] ÷ (σ√T) · d₂ = d₁ − σ√T',
  pts:['Assumptions: the stock follows geometric Brownian motion (lognormal returns), constant volatility and interest rate, no transaction costs, European exercise.','N(d₂) approximates the risk-neutral probability that the call expires in the money; N(d₁) is the call’s delta.','Volatility σ is the only input that cannot be observed directly — in effect, the market trades “volatility”.','In reality returns have fat tails and volatility changes, which is why the market shows a “volatility smile”.','The 1973 work of Black, Scholes and Merton; Scholes and Merton received the Nobel Prize in Economics in 1997.'],
  thr:[['IV up 1 point','ATM price rises by about Vega']],
  hook:'<b>Memory tip:</b> “Price – Strike – Time – Volatility – Rate”.',src:'Black & Scholes (1973), Journal of Political Economy 81(3); Merton (1973), Bell Journal of Economics.'},
 {id:'opt-parity',g:'Options',t:'Put–call parity',d:'The unbreakable link between calls and puts',
  vis:()=>sv(`<rect x="10" y="30" width="44" height="30" rx="5" style="fill:var(--up);fill-opacity:.8"/>${T(32,49,'+Call','text-anchor="middle" style="font-size:9px;fill:#fff;font-weight:700"')}${T(62,49,'−','text-anchor="middle" style="font-size:14px;fill:var(--fg)"')}<rect x="70" y="30" width="44" height="30" rx="5" style="fill:var(--dn);fill-opacity:.8"/>${T(92,49,'Put','text-anchor="middle" style="font-size:9px;fill:#fff;font-weight:700"')}${T(122,49,'=','text-anchor="middle" style="font-size:14px;fill:var(--fg)"')}<rect x="130" y="30" width="60" height="30" rx="5" style="fill:var(--gold);fill-opacity:.85"/>${T(160,44,'Stock','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--gold-ink)"')}${T(160,55,'− PV(K)','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--gold-ink)"')}${T(100,88,'Buy call + sell put, same K = synthetic stock','text-anchor="middle" '+TB)}`,'Put–call parity'),
  f:'C − P = S − K·e<sup>−rT</sup> (European-style, no dividends)',
  pts:['If the equality breaks, there is a risk-free arbitrage — so in practice it always holds closely.','Long call + short put = synthetic long stock; long put + long stock ≈ long call + cash deposit (protective put ≈ call).','A covered call has the same P/L as a short put at the same strike.','With dividends: replace S with S − PV(dividends); for American-style options it becomes only an inequality.','The Options Lab checks parity automatically for the ATM pair.'],
  thr:[['Covered call','≡ short put'],['Protective put','≡ long call (+ bond)']],
  hook:'<b>Memory tip:</b> “Call minus Put equals Stock minus the strike in cash.”',src:'Stoll, H. (1969), “The Relationship Between Put and Call Option Prices”, Journal of Finance 24(5).'},
 {id:'opt-delta',g:'Options',t:'Delta and Gamma',d:'Price sensitivity and how fast it changes',
  vis:()=>{ const X=v=>14+(v-60)/80*172; let d='',gm=''; for(let s=60;s<=140;s+=1){ const b=bs('call',s,100,45/365,.04,.3); d+=(s>60?'L':'M')+X(s).toFixed(1)+' '+(105-b.delta*85).toFixed(1); gm+=(s>60?'L':'M')+X(s).toFixed(1)+' '+(105-b.gamma*85/0.045).toFixed(1); }
    return sv(`<line class="axis" x1="14" x2="186" y1="105" y2="105"/><path d="${d}" fill="none" style="stroke:var(--us)" stroke-width="2.2"/><path d="${gm}" fill="none" style="stroke:var(--ceil)" stroke-width="2" stroke-dasharray="4 3"/>${T(150,26,'Call delta','style="font-size:8px;fill:var(--us);font-weight:700"')}${T(110,40,'Gamma','style="font-size:8px;fill:var(--ceil);font-weight:700"')}${T(X(100),117,'K','text-anchor="middle" '+TS)}`,'Delta and gamma curves'); },
  f:'Delta = ∂Price/∂S · Gamma = ∂Delta/∂S',
  pts:['Call delta runs from 0 to 1, put delta from −1 to 0. A delta of 0.40 means the option price rises about 0.40 when the stock rises 1.','Position delta × 100 = equivalent number of shares. Example: 5 calls with delta 0.6 ≈ 300 shares.','Gamma peaks at the money and near expiration: delta changes very quickly — a big risk for option sellers.','Option buyers are long gamma (benefit from big moves); sellers are short gamma.','Delta hedging: market makers buy/sell stock to keep delta ≈ 0.'],
  thr:[['|Delta| ≈ 0.5','At the money'],['High gamma + near expiration','“Gamma squeeze” risk']],
  hook:'<b>Memory tip:</b> Delta is speed, Gamma is acceleration.',src:'Natenberg (2015), ch. 7; Hull (2021), ch. 19.'},
 {id:'opt-theta',g:'Options',t:'Theta, Vega and Rho',d:'Time, volatility and interest rates',
  vis:()=>{ const X=v=>14+(90-v)/90*172; let d=''; for(let t=90;t>=0;t-=1){ const b=bs('call',100,100,t/365,.04,.3).price; d+=(t<90?'L':'M')+X(t).toFixed(1)+' '+(108-b*13).toFixed(1); }
    return sv(`<line class="axis" x1="14" x2="186" y1="108" y2="108"/><path d="${d}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/>${T(16,16,'ATM call price vs. days left','style="font-size:8px;fill:var(--gold);font-weight:700"')}${T(14,120,'90 days',TS)}${T(186,120,'Expiry','text-anchor="end" '+TS)}${T(140,70,'Decay speeds up','style="font-size:8px;fill:var(--dn);font-weight:700"')}`,'Time value decaying toward expiration'); },
  f:'Theta = ∂Price/∂t (per day) · Vega = ∂Price/∂σ (per 1% IV) · Rho = ∂Price/∂r',
  pts:['The time value of an ATM option decays roughly in proportion to √T — slowly at first, very fast in the last 30 days.','Buyers have negative theta (lose money every day); sellers have positive theta.','Vega is largest for long-dated ATM options. Long option positions have positive vega: they benefit when IV rises.','Rho is usually small for short-dated options and matters more for LEAPS (expirations over 1 year).','Theta and gamma are two sides of the same coin: to own gamma you have to pay theta.'],
  thr:[['DTE < 30','Theta accelerates'],['DTE 30–60','Popular zone for premium-selling strategies']],
  hook:'<b>Memory tip:</b> time is the buyer’s enemy and the seller’s friend.',src:'Natenberg (2015); Sinclair, Volatility Trading (2nd ed., 2013).'},
 {id:'opt-iv',g:'Options',t:'Implied volatility (IV)',d:'How much volatility the market is “pricing in”',
  vis:()=>{ const X=v=>14+v/60*172; let g=`<line class="axis" x1="14" x2="186" y1="100" y2="100"/>`; let p=''; for(let d=0;d<=60;d++){ const iv=28+ (d<40? d*.35: 42-(d-40)*1.2) + (d===40?0:0); const y=100-(d<=40? 28+d*.45 : 46-(d-40)*1.3)*1.6; p+=(d?'L':'M')+X(d).toFixed(1)+' '+y.toFixed(1); }
    g+=`<path d="${p}" fill="none" style="stroke:var(--ceil)" stroke-width="2.2"/><line x1="${X(40)}" x2="${X(40)}" y1="16" y2="100" style="stroke:var(--dn)" stroke-dasharray="3 3"/>`+T(X(40),14,'Earnings','text-anchor="middle" style="font-size:8px;fill:var(--dn);font-weight:700"')+T(X(52),40,'IV crush','style="font-size:8px;fill:var(--dn);font-weight:700"')+T(16,112,'IV builds before the event, crashes after',TS);
    return sv(g,'IV rises before earnings and collapses afterward'); },
  f:'Expected ±1σ move ≈ S × IV × √(Days ÷ 365)',
  pts:['IV is the volatility that makes the Black–Scholes price match the market price — backed out from the option premium.','Compare IV with historical volatility (HV): IV above HV means options are “expensive”, which favors sellers.','IV Rank = (current IV − 1-year low IV) ÷ (1-year high IV − 1-year low IV). High IV Rank usually goes with premium-selling strategies.','IV crush: after news (earnings, FDA), IV collapses — call/put buyers can lose money even when they get the direction right.','Example: S = 100, IV = 30%, 30 days → ±1σ ≈ 100 × 0.30 × √(30/365) ≈ ±8.6.','The VIX measures the 30-day IV of S&P 500 options — the “fear gauge”.'],
  thr:[['IV Rank > 50','Options relatively expensive'],['IV Rank < 20','Relatively cheap']],
  hook:'<b>Memory tip:</b> “Buy the rumor, sell the news” — with options, IV gets bid up before and crushed after.',src:'CBOE VIX White Paper; Sinclair (2013); Natenberg (2015), ch. 8.'},
 {id:'opt-smile',g:'Options',t:'Volatility smile and skew',d:'Why Black–Scholes isn’t perfect',
  vis:()=>{ const X=v=>14+(v-70)/60*172; let g=`<line class="axis" x1="14" x2="186" y1="105" y2="105"/>`; let p='',q=''; for(let k=70;k<=130;k+=1){ const sk=26+.012*(100-k)*(100-k)/2+.25*(100-k); const sm=24+.012*(100-k)*(100-k); p+=(k>70?'L':'M')+X(k).toFixed(1)+' '+(110-sk*1.9).toFixed(1); q+=(k>70?'L':'M')+X(k).toFixed(1)+' '+(110-sm*1.9).toFixed(1); }
    g+=`<path d="${q}" fill="none" style="stroke:var(--mut)" stroke-width="1.6" stroke-dasharray="4 3"/><path d="${p}" fill="none" style="stroke:var(--ceil)" stroke-width="2.2"/>`+T(18,20,'Equity skew','style="font-size:8px;fill:var(--ceil);font-weight:700"')+T(150,66,'Smile','style="font-size:8px"')+T(100,118,'Strike →','text-anchor="middle" '+TS);
    return sv(g,'Volatility smile and skew'); },
  f:'IV varies by strike (skew) and by expiration (term structure)',
  pts:['For stocks and indexes, OTM puts usually carry higher IV than OTM calls — since the 1987 crash, the market pays up for downside insurance (negative skew).','Commodities and crypto can show reverse skew (calls pricier) when traders fear a price spike.','Term structure: normally longer-dated IV is higher than short-dated (contango); in a panic it inverts.','Spread strategies let you buy the cheap part of the IV curve and sell the expensive part.'],
  thr:[['Steep skew','High demand for protection, anxious sentiment']],
  hook:'<b>Memory tip:</b> the smile tilts toward fear.',src:'Derman & Kani (1994); Gatheral, The Volatility Surface (2006).'},
 {id:'opt-income',g:'Options',t:'Covered calls and cash-secured puts',d:'Income strategies and “the wheel”',
  vis:()=>pm([OL('stock',1,null),OL('call',-1,105)]),
  f:'Covered call = Stock + Short OTM call · Cash-secured put = Short put + enough cash to buy',
  pts:['A covered call collects steady premium but caps the upside above the strike; you still bear almost all of the downside risk.','Cash-secured put: you get paid premium to wait to buy a stock you want to own at a lower price.','“The wheel”: sell a put → get assigned → sell covered calls → get called away → repeat.','By put–call parity, a covered call and a short put at the same K have the same P/L.','Works best in sideways markets with high IV; underperforms in strong rallies.'],
  thr:[['Short call delta 0.2–0.3','Common for covered calls'],['30–45 days','Balances theta and risk']],
  hook:'<b>Memory tip:</b> rent out your shares to collect monthly “rent”.',src:'CBOE BXM Index methodology; McMillan (2012), ch. 2.'},
 {id:'opt-hedge',g:'Options',t:'Protective puts and collars',d:'Buying insurance for your portfolio',
  vis:()=>pm([OL('stock',1,null),OL('put',1,95),OL('call',-1,110)]),
  f:'Protective put = Stock + Long put · Collar = Stock + Long put + Short call',
  pts:['A protective put puts a “floor” under the loss: max loss = (S − K) + put premium.','Insurance premiums add up if you buy them all the time — like car insurance, most of the time the premium is “lost”.','A collar uses the call premium to pay for the put: locks in a price range at near-zero cost (zero-cost collar).','Useful for holding a stock through a risky event (earnings, an election) or protecting a large gain.','You can insure a whole portfolio with index puts (SPY, SPX) instead of each ticker.'],
  thr:[['5–10% OTM put','Disaster insurance, low premium'],['ATM put','Maximum protection, high premium']],
  hook:'<b>Memory tip:</b> a collar is a “seat belt” for your stock — trading upside for protection.',src:'Hull (2021), ch. 12; OCC ODD.'},
 {id:'opt-vertical',g:'Options',t:'Vertical spreads',d:'Capping risk with two strikes',
  vis:()=>pm([OL('call',1,100),OL('call',-1,110)]),
  f:'Debit spread: max loss = net debit · Credit spread: max loss = strike width − credit received',
  pts:['Bull call spread (buy lower K, sell higher K): cheaper than a single call; max profit = strike width − net debit.','Bear put spread: the same idea for a bearish scenario.','Bull put / bear call (credit spreads): collect premium up front, profit as long as the price doesn’t move against you.','Spreads reduce the impact of IV and theta compared with single options.','Choose the spread width based on the risk/reward and probability you are comfortable with.'],
  thr:[['Credit = 1/3 of width','Typical credit for a credit spread']],
  hook:'<b>Memory tip:</b> sell one leg to “finance” the other.',src:'McMillan (2012), ch. 7–8.'},
 {id:'opt-straddle',g:'Options',t:'Straddles and strangles',d:'Betting on volatility, not direction',
  vis:()=>pm([OL('call',1,100),OL('put',1,100)]),
  f:'Long straddle breakeven = K ± total premium',
  pts:['Long straddle/strangle: profit when the price moves sharply in either direction, by more than the total premium.','The enemies are time and IV crush — buying before an event usually means already paying high IV.','Short straddle/strangle: collect premium while the price sits still; large loss risk on both sides, needs tight management.','The price of an ATM straddle approximates the market’s expected move (≈ 0.8 × S × IV × √T).'],
  thr:[['Realized volatility > IV','Straddle buyers win'],['Realized volatility < IV','Sellers win']],
  hook:'<b>Memory tip:</b> a straddle is a letter V — the farther the price moves from the bottom of the V, the more you make.',src:'Natenberg (2015), ch. 11; Sinclair (2013).'},
 {id:'opt-condor',g:'Options',t:'Iron condors and butterflies',d:'Profiting from a quiet market with limited risk',
  vis:()=>pm([OL('put',1,85),OL('put',-1,92),OL('call',-1,108),OL('call',1,115)]),
  f:'Iron condor = Bull put spread + Bear call spread',
  pts:['An iron condor collects premium within a price range; max loss = wing width − credit received.','Butterfly (1–2–1): low cost, maximum profit if the price expires exactly at the middle strike.','Both have positive theta and negative vega: they benefit as time passes and IV falls.','Management: take profits at 50% of max profit, adjust when the price touches a short strike.'],
  thr:[['Short strikes at delta ≈ 0.15','Wide profit zone, low premium'],['Short strikes at delta ≈ 0.30','Higher premium, lower probability']],
  hook:'<b>Memory tip:</b> the condor spreads its wings wide; the butterfly folds its wings to a single point.',src:'Cohen, The Bible of Options Strategies (2nd ed., 2015).'},
 {id:'opt-calendar',g:'Options',t:'Calendar and diagonal spreads',d:'Exploiting different decay rates',
  vis:()=>pm([OL('call',-1,100,1,30),OL('call',1,100,1,90)]),
  f:'Calendar = Short near-term option + Long longer-term option (same K)',
  pts:['Near-term options lose time value faster — selling the near leg captures the theta difference.','Best profit when the price is near K at the near leg’s expiration; positive vega, so it benefits when IV rises.','Diagonal: the two legs differ in both expiration and strike, allowing a mild bullish/bearish tilt.','The P/L chart is computed at the near leg’s expiration; the far leg still has time value (Black–Scholes pricing).'],
  thr:[['Near leg 20–30 days, far leg 60–90 days','Common setup']],
  hook:'<b>Memory tip:</b> sell short time, buy long time.',src:'McMillan (2012), ch. 9.'},
 {id:'opt-risk',g:'Options',t:'Risk and position management',d:'What beginners often overlook',
  vis:()=>{ const it=['Assignment','Dividends','Pin risk','Naked risk','Liquidity','Leverage','IV crush','Gap risk']; let g='';
    it.forEach((a,i)=>{ const x=6+(i%4)*48, y=14+Math.floor(i/4)*52; g+=`<rect x="${x}" y="${y}" width="44" height="44" rx="8" style="fill:var(--s1);stroke:var(--dn)"/>`+T(x+22,y+25,a,'text-anchor="middle" style="font-size:6.6px;font-weight:700;fill:var(--fg)"'); });
    return sv(g,'Eight risks of trading options'); },
  f:'Position sizing: max risk per strategy ≤ 1–5% of capital',
  pts:['American-style options can be exercised early, especially ITM calls right before the ex-dividend date.','Pin risk: the price closes right near K on expiration day — you can’t be sure whether you’ll be assigned.','Selling naked calls or short strangles can lose more than your capital; requires margin and a high options approval level.','Illiquid options have wide bid–ask spreads that eat into profits; favor tickers with large open interest.','Leverage: cheap OTM options can easily lose 100% of the premium; most OTM options expire worthless.','Plan ahead: when to take profits, cut losses, adjust (roll) and close before expiration.'],
  thr:[['Open interest > 1,000, spread < 5% of premium','Acceptable liquidity']],
  hook:'<b>Memory tip:</b> know your max loss before you place the order — if it says “unlimited”, think again.',src:'OCC, Characteristics and Risks of Standardized Options; FINRA Rule 2360.'},
 {id:'opt-vn',g:'Options',t:'Vietnamese covered warrants and derivatives',d:'Option-like products on HOSE',
  vis:()=>sv(`<rect x="10" y="14" width="85" height="96" rx="8" style="fill:var(--s1);stroke:var(--vn)"/><rect x="105" y="14" width="85" height="96" rx="8" style="fill:var(--s1);stroke:var(--us)"/>${T(52,32,'VN warrants','text-anchor="middle" style="font-size:9px;font-weight:800;fill:var(--vn)"')}${T(147,32,'US options','text-anchor="middle" style="font-size:9px;font-weight:800;fill:var(--us)"')}${[['Broker-issued','Standardized'],['Calls only','Call & put'],['European','American'],['Cash-settled','Share-settled'],['No shorting','Buy & sell']].map(([a,b],i)=>T(52,50+i*13,a,'text-anchor="middle" style="font-size:7.5px;fill:var(--fg)"')+T(147,50+i*13,b,'text-anchor="middle" style="font-size:7.5px;fill:var(--fg)"')).join('')}`,'Vietnamese covered warrants vs. US options'),
  f:'CW value at expiration = max(5-session average price − Strike, 0) ÷ Conversion ratio',
  pts:['Covered warrants (CW) have traded on HOSE since 2019: issued by securities companies, they are European-style call options, cash-settled.','Investors can only buy CWs (no short selling); the issuer hedges with the underlying stock.','A conversion ratio of, say, 5:1 means 5 warrants correspond to 1 share — remember to divide when calculating value.','The settlement price is usually the average closing price of the 5 sessions before the expiration date (excluding the expiration date).','VN30F index derivatives (HNX) are futures, not options: linear P/L, margined, expiring on the third Thursday of the month.','Listed stock options do not yet exist in Vietnam (as of the app’s information) — check the latest regulations.'],
  thr:[['CW price ≈ intrinsic value ÷ ratio + time value','Compare to see whether a CW is expensive or cheap'],['CW implied volatility','Usually higher than the stock’s historical volatility']],
  hook:'<b>Memory tip:</b> a CW is “a European call that a securities company sells to you”.',src:'Decree 158/2020/NĐ-CP; Circular 107/2016/TT-BTC; HOSE regulations on covered warrants.'}
];
OPT_LESSONS.forEach(l=>LESSONS.push(l));
ORDER.splice(ORDER.indexOf('Technical analysis')+1,0,'Options');
LESSONS.sort((a,b)=>ORDER.indexOf(a.g)-ORDER.indexOf(b.g));
[
 {q:'How many shares does one US stock option contract usually cover?',a:['100','10','1','1,000'],c:0,e:'Premiums are quoted per share: a $2.50 premium → $250 per contract.'},
 {q:'A put buyer’s maximum loss equals?',a:['The premium paid','The strike price','Unlimited','The stock price'],c:0,e:'An option buyer can lose at most the premium. Only a seller of calls without the stock faces unlimited loss.'},
 {q:'Breakeven for buying a call with a 100 strike and a 4 premium is?',a:['104','96','100','4'],c:0,e:'Long call breakeven = K + premium. Long put: K − premium.'},
 {q:'A call with a strike of 90 when the stock is at 100 is called?',a:['In the money (ITM)','Out of the money (OTM)','At the money (ATM)','Worthless'],c:0,e:'A call is ITM when S > K. Intrinsic value = 100 − 90 = 10.'},
 {q:'Put–call parity (European, no dividends) states?',a:['C − P = S − K·e^(−rT)','C + P = S + K','C = P','C − P = K − S'],c:0,e:'Long call + short put, same K and same expiration = a synthetic stock position.'},
 {q:'What is the approximate delta of an ATM call?',a:['0.5','1','0','−0.5'],c:0,e:'Call delta ranges from 0 (deep OTM) to 1 (deep ITM); put delta from −1 to 0.'},
 {q:'Which Greek measures the rate of time decay?',a:['Theta','Vega','Gamma','Rho'],c:0,e:'Option buyers have negative theta; sellers have positive theta.'},
 {q:'Positive vega means the position benefits when?',a:['Implied volatility (IV) rises','Interest rates fall','Time passes','The stock sits still'],c:0,e:'Long options have positive vega; short options have negative vega.'},
 {q:'Stock at 100, IV 30%, 30 days: the expected ±1σ move is about?',a:['±8.6','±30','±2.5','±15'],c:0,e:'100 × 0.30 × √(30/365) ≈ 8.6.'},
 {q:'When does “IV crush” usually happen?',a:['Right after an earnings release','Before the market opens each day','When interest rates rise','When a stock splits'],c:0,e:'Once the uncertainty is resolved, IV collapses — option buyers can lose money even when they get the direction right.'},
 {q:'A covered call has the same P/L as which position (same K)?',a:['Short put','Long put','Long call','Short stock'],c:0,e:'By put–call parity: stock − call = bond − put.'},
 {q:'Which strategy profits when the price moves sharply in either direction?',a:['Long straddle','Iron condor','Covered call','Bull put spread'],c:0,e:'Long call + long put at the same K; breakeven = K ± total premium.'},
 {q:'An iron condor is built from?',a:['Bull put spread + Bear call spread','Two covered calls','Long straddle + stock','Bull call + Bull put'],c:0,e:'Collects premium within a price range; loss is capped by the two protective long wings.'},
 {q:'What kind of option is a Vietnamese covered warrant?',a:['A European-style call, cash-settled','An American-style put','A futures contract','An American-style call, settled in shares'],c:0,e:'Issued by securities companies; investors can only buy, not sell short.'},
 {q:'What does a 5:1 warrant conversion ratio mean?',a:['5 warrants correspond to 1 share','1 warrant corresponds to 5 shares','5x the profit','Expires in 5 months'],c:0,e:'Intrinsic value per CW = (S − K) ÷ 5.'},
 {q:'In the Black–Scholes model, which input cannot be observed directly in the market?',a:['Volatility (σ)','Stock price','Strike price','Time to expiration'],c:0,e:'That’s why the market backs σ out of option prices — that is IV.'}
].forEach(q=>QUIZ.push(q));

/* nút mở phòng thí nghiệm trong bài học quyền chọn */
const _openLessonOpt=openLesson;
openLesson=function(id){ _openLessonOpt(id); if(String(id).startsWith('opt-')){ const rb=$('#sheetBody .row-btns'); if(rb){ const b=document.createElement('button'); b.className='btn'; b.id='lOptLab'; b.textContent='Open the Options Lab'; b.onclick=()=>{ closeSheet(); S.expertTab='options'; setView('expert'); }; rb.appendChild(b); } } };
