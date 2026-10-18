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
 {id:'longcall',n:'Mua call',view:'Tăng',legs:[['call',1,1]],d:'Đặt cược giá tăng mạnh. Lỗ tối đa là phí đã trả, lãi không giới hạn.'},
 {id:'longput',n:'Mua put',view:'Giảm',legs:[['put',1,1]],d:'Đặt cược giá giảm hoặc bảo hiểm. Lỗ tối đa là phí.'},
 {id:'shortput',n:'Bán put bảo đảm tiền',view:'Tăng nhẹ',legs:[['put',-1,.95]],d:'Thu phí; sẵn sàng mua cổ phiếu ở giá thực hiện nếu giá giảm. Cần giữ đủ tiền mặt.'},
 {id:'covered',n:'Covered call',view:'Đi ngang – tăng nhẹ',legs:[['stock',1],['call',-1,1.05]],d:'Giữ cổ phiếu và bán call để thu phí; đổi lại giới hạn phần tăng phía trên giá thực hiện.'},
 {id:'protput',n:'Put bảo vệ',view:'Tăng, cần bảo hiểm',legs:[['stock',1],['put',1,.95]],d:'Cổ phiếu + mua put = “bảo hiểm” giới hạn lỗ, giữ trọn phần tăng.'},
 {id:'collar',n:'Collar',view:'Phòng thủ',legs:[['stock',1],['put',1,.95],['call',-1,1.10]],d:'Bán call để trả tiền mua put: khóa vùng lãi/lỗ, gần như không tốn phí.'},
 {id:'bullcall',n:'Bull call spread',view:'Tăng vừa',legs:[['call',1,1],['call',-1,1.10]],d:'Mua call thấp, bán call cao: rẻ hơn mua call đơn, lãi và lỗ đều giới hạn.'},
 {id:'bearput',n:'Bear put spread',view:'Giảm vừa',legs:[['put',1,1],['put',-1,.90]],d:'Mua put cao, bán put thấp: đặt cược giảm với chi phí thấp hơn.'},
 {id:'bullput',n:'Bull put (tín dụng)',view:'Không giảm',legs:[['put',-1,.95],['put',1,.90]],d:'Thu phí ròng, lãi khi giá đứng trên put bán; lỗ giới hạn bởi put mua.'},
 {id:'bearcall',n:'Bear call (tín dụng)',view:'Không tăng',legs:[['call',-1,1.05],['call',1,1.10]],d:'Thu phí ròng, lãi khi giá ở dưới call bán.'},
 {id:'straddle',n:'Long straddle',view:'Biến động mạnh',legs:[['call',1,1],['put',1,1]],d:'Mua call và put cùng giá thực hiện: lãi khi giá chạy xa theo bất kỳ hướng nào, mất tiền nếu đứng yên.'},
 {id:'strangle',n:'Long strangle',view:'Biến động mạnh',legs:[['call',1,1.05],['put',1,.95]],d:'Như straddle nhưng dùng quyền chọn ngoài tiền: rẻ hơn, cần biến động lớn hơn.'},
 {id:'shortstrangle',n:'Short strangle',view:'Đi ngang',legs:[['call',-1,1.10],['put',-1,.90]],d:'Bán cả call và put ngoài tiền: thu phí khi giá đứng yên — rủi ro lỗ rất lớn hai phía.'},
 {id:'condor',n:'Iron condor',view:'Đi ngang',legs:[['put',1,.85],['put',-1,.92],['call',-1,1.08],['call',1,1.15]],d:'Short strangle có “cánh” bảo vệ: thu phí trong một vùng giá, lỗ giới hạn.'},
 {id:'butterfly',n:'Butterfly call',view:'Đứng yên tại một giá',legs:[['call',1,.95],['call',-2,1],['call',1,1.05]],d:'Chi phí thấp, lãi lớn nhất khi giá đáo hạn đúng giá thực hiện giữa.'},
 {id:'calendar',n:'Calendar spread',view:'Đi ngang, IV tăng',legs:[['call',-1,1,30],['call',1,1,90]],d:'Bán quyền chọn gần hạn, mua cùng giá thực hiện xa hạn: hưởng theta chênh lệch.'}
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
    g+=`<line x1="${X(env.S).toFixed(1)}" x2="${X(env.S).toFixed(1)}" y1="${p.t}" y2="${H-p.b}" style="stroke:var(--fg)" stroke-opacity=".5" stroke-dasharray="2 3"/><text x="${(X(env.S)+4).toFixed(1)}" y="${p.t+10}" style="font-size:10px;fill:var(--fg)">Giá ${fmt(env.S,1)}</text>`;
    A.be.filter(b=>b>=x0&&b<=x1).forEach(b=>g+=`<circle cx="${X(b).toFixed(1)}" cy="${Y(0).toFixed(1)}" r="4" style="fill:var(--bg);stroke:var(--fg)" stroke-width="1.6"/><text x="${X(b).toFixed(1)}" y="${(Y(0)+15).toFixed(1)}" text-anchor="middle" class="lbl-strong" style="font-size:10px">${fmt(b,1)}</text>`);
    g+=`<text x="${p.l}" y="${p.t-1}" style="font-size:9.5px">Lãi/lỗ mỗi hợp đồng (100 cp)</text>`; }
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ lãi lỗ chiến lược quyền chọn">${g}</svg>`;
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
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Hồ sơ ${greek} theo giá cổ phiếu">${g}</svg>`;
}

/* ---------- màn hình: Chuyên gia → Quyền chọn ---------- */
function renderOptions(){
  const box=$('#expertBody'); if(!OPT.legs) OPT.legs=presetLegs(OPT.preset);
  const env=optEnv(); const legs=OPT.legs; const pr=OPT_PRESETS.find(x=>x.id===OPT.preset);
  const A=analyzeStrategy(legs,env); const tauMax=Math.max(0,A.tau); OPT.tau=Math.min(OPT.tau,tauMax);
  const money=v=> v===Infinity?'Không giới hạn': v===-Infinity?'Không giới hạn': (v>=0?'+':'−')+fmt(Math.abs(v*100),0);
  const atm=bs('call',env.S,roundStrike(env.S),OPT.dte/365,env.r,env.v), atmP=bs('put',env.S,roundStrike(env.S),OPT.dte/365,env.r,env.v);
  box.innerHTML=`
  <section class="panel" style="display:flex;flex-direction:column;gap:12px">
    <div class="sec-h" style="margin:0"><div><h2 style="font-size:18px">Phòng thí nghiệm quyền chọn</h2><p>Định giá Black–Scholes · 1 hợp đồng = 100 cổ phiếu · kiểu châu Âu</p></div><button class="btn sm" data-lesson="opt-basics">Học từ đầu</button></div>
    <div class="chips" role="group" aria-label="Chiến lược mẫu">${OPT_PRESETS.map(x=>`<button class="chip ${OPT.preset===x.id?'on':''}" data-op="${x.id}" aria-pressed="${OPT.preset===x.id}">${esc(x.n)}</button>`).join('')}</div>
    ${pr?`<p class="note"><b>${esc(pr.n)}</b> · kỳ vọng: ${esc(pr.view)}. ${esc(pr.d)}</p>`:'<p class="note"><b>Chiến lược tùy chỉnh.</b></p>'}
    <div class="opt-in">
      <label class="field">Giá cổ phiếu<input type="number" id="oS" value="${OPT.S}" step="0.5" inputmode="decimal"></label>
      <label class="field">Biến động IV (%)<input type="number" id="oV" value="${OPT.iv}" step="1" inputmode="decimal"></label>
      <label class="field">Lãi suất (%)<input type="number" id="oR" value="${OPT.r}" step="0.25" inputmode="decimal"></label>
      <label class="field">Số ngày đáo hạn<input type="number" id="oD" value="${OPT.dte}" step="1" inputmode="numeric"></label>
    </div>
    <div class="legs" id="oLegs">${legs.map((l,i)=>`<div class="leg">
      <button class="side ${l.side>0?'buy':'sell'}" data-lside="${i}" aria-label="Đổi mua/bán">${l.side>0?'Mua':'Bán'}</button>
      <select data-lk="${i}" aria-label="Loại"><option value="call" ${l.k==='call'?'selected':''}>Call</option><option value="put" ${l.k==='put'?'selected':''}>Put</option><option value="stock" ${l.k==='stock'?'selected':''}>Cổ phiếu</option></select>
      ${l.k==='stock'?'<span class="lk k mut">Giá vào '+fmt(env.S,1)+'</span><span class="lk d"></span>':`<label class="lk k">K<input type="number" data-lstrike="${i}" value="${l.K}" step="1" inputmode="decimal"></label><label class="lk d">Ngày<input type="number" data-ld="${i}" value="${l.dte}" step="1" inputmode="numeric"></label>`}
      <label class="lk q">SL<input type="number" data-lq="${i}" value="${l.qty}" min="1" step="1" inputmode="numeric"></label>
      <span class="prem">${l.k==='stock'?'':'Phí '+fmt(l._prem,2)}</span>
      <button class="star del" data-ldel="${i}" aria-label="Xóa chân" ${legs.length<=1?'disabled':''}>✕</button></div>`).join('')}
      <div class="row-btns"><button class="btn sm" id="oAddC">+ Call</button><button class="btn sm" id="oAddP">+ Put</button><button class="btn sm" id="oAddS">+ Cổ phiếu</button></div>
    </div>
    <div class="opt-chart">${payoffSVG(legs,env,{w:360,h:230,tau:OPT.tau})}</div>
    <div class="legend" style="margin:0"><span><i style="background:var(--gold)"></i>Lãi/lỗ khi đáo hạn (ngày ${A.tau})</span><span><i style="background:none;border-top:2px dashed var(--us);height:0;border-radius:0"></i>Giá trị sau ${OPT.tau} ngày</span><span><i style="background:var(--us);opacity:.3"></i>Biên độ kỳ vọng ±1σ</span></div>
    <label class="slider-row"><span>Ngày trôi qua</span><input type="range" id="oTau" min="0" max="${tauMax}" step="1" value="${OPT.tau}"><output>${OPT.tau}/${tauMax}</output></label>
    <div class="port-sum">
      <div><b class="${A.net>0?'dn':'up'}">${A.net>0?'−':'+'}${fmt(Math.abs(A.net*100),0)}</b><span>${A.net>0?'Trả phí ròng (debit)':'Thu phí ròng (credit)'}</span></div>
      <div><b class="up">${money(A.maxP)}</b><span>Lãi tối đa</span></div>
      <div><b class="dn">${money(A.maxL)}</b><span>Lỗ tối đa</span></div>
      <div><b>${A.be.length?A.be.map(b=>fmt(b,1)).join(' · '):'—'}</b><span>Điểm hòa vốn</span></div>
      <div><b>${pct(A.pop*100,0)}</b><span>Xác suất có lãi (ước tính)</span></div>
      <div><b>${fmt(A.greeks.delta*100,0)}</b><span>Delta (tương đương cổ phiếu)</span></div>
      <div><b class="${Math.abs(A.greeks.theta*100)<.05?'':A.greeks.theta>=0?'up':'dn'}">${sg1(A.greeks.theta*100)}</b><span>Theta / ngày</span></div>
      <div><b>${sg1(A.greeks.vega*100)}</b><span>Vega / 1% IV</span></div>
    </div>
    <div><div class="seg" role="group" aria-label="Hồ sơ Greek" id="oGreek">${[['delta','Delta'],['gamma','Gamma'],['theta','Theta'],['vega','Vega']].map(([k,n])=>`<button data-g="${k}" aria-pressed="${OPT.greek===k}">${n}</button>`).join('')}</div>
      <div class="opt-chart" style="margin-top:8px">${greekProfileSVG(legs,env,OPT.greek,OPT.tau)}</div><p class="note">Hồ sơ ${esc(OPT.greek)} của cả vị thế theo giá cổ phiếu (×100 = theo hợp đồng), sau ${OPT.tau} ngày.</p></div>
    <p class="note">Xác suất có lãi dùng phân phối log-chuẩn với IV đã nhập, giả định rủi ro trung tính — không phải xác suất thực tế. Mô hình bỏ qua cổ tức, thực hiện sớm (quyền chọn kiểu Mỹ), phí và chênh lệch giá mua–bán.</p>
  </section>
  <section class="panel" style="display:flex;flex-direction:column;gap:10px">
    <h2 style="font-size:17px">Bảng giá ngang giá (ATM) · K = ${fmt(roundStrike(env.S),1)}</h2>
    <table class="thr"><thead><tr><th></th><th>Call</th><th>Put</th></tr></thead><tbody>
      ${[['Giá (phí)',atm.price,atmP.price,2],['Delta',atm.delta,atmP.delta,3],['Gamma',atm.gamma,atmP.gamma,4],['Theta/ngày',atm.theta,atmP.theta,3],['Vega/1%',atm.vega,atmP.vega,3],['Rho/1%',atm.rho,atmP.rho,3]].map(([n,a,b,d])=>`<tr><td>${n}</td><td><b>${fmt(a,d)}</b></td><td><b>${fmt(b,d)}</b></td></tr>`).join('')}
    </tbody></table>
    <p class="note">Kiểm tra put–call parity: C − P = ${fmt(atm.price-atmP.price,3)} ≈ S − K·e<sup>−rT</sup> = ${fmt(env.S-roundStrike(env.S)*Math.exp(-env.r*OPT.dte/365),3)}. Biên độ kỳ vọng ±1σ trong ${OPT.dte} ngày ≈ ±${fmt(env.S*env.v*Math.sqrt(OPT.dte/365),2)} (${pct(env.v*Math.sqrt(OPT.dte/365)*100,1)}).</p>
  </section>
  <p class="note">Công cụ học tập, không phải khuyến nghị. Quyền chọn có đòn bẩy cao; bán quyền chọn không có bảo vệ có thể lỗ vượt số vốn ban đầu. Ở Việt Nam hiện chưa có quyền chọn cổ phiếu niêm yết — sản phẩm gần nhất là chứng quyền có bảo đảm.</p>`;
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
  const add=k=>{ if(OPT.legs.length>=6){ toast('Tối đa 6 chân'); return; } OPT.legs.push(k==='stock'?{k,side:1,qty:1,K:null,dte:null}:{k,side:1,qty:1,K:roundStrike(OPT.S),dte:OPT.dte}); reRender(); };
  $('#oAddC').onclick=()=>add('call'); $('#oAddP').onclick=()=>add('put'); $('#oAddS').onclick=()=>add('stock');
  const tr=$('#oTau'); tr.oninput=()=>{ OPT.tau=+tr.value; tr.nextElementSibling.textContent=OPT.tau+'/'+tauMax; }; tr.onchange=()=>renderOptions();
  $$('#oGreek button').forEach(b=>b.onclick=()=>{ OPT.greek=b.dataset.g; renderOptions(); });
}

/* ---------- bài học quyền chọn ---------- */
const E30={S:100,v:.3,r:.04};
const OL=(k,side,K,qty,dte)=>({k,side,K,qty:qty||1,dte:dte||30});
const pm=(legs)=>payoffSVG(legs,E30,{mini:true,w:200,h:125});
const OPT_LESSONS=[
 {id:'opt-basics',g:'Quyền chọn (Options)',t:'Quyền chọn là gì?',d:'Quyền, không phải nghĩa vụ',
  vis:()=>sv(`<rect x="10" y="14" width="85" height="96" rx="8" style="fill:var(--s1);stroke:var(--up)"/><rect x="105" y="14" width="85" height="96" rx="8" style="fill:var(--s1);stroke:var(--dn)"/>${T(52,34,'CALL','text-anchor="middle" style="font-size:12px;font-weight:800;fill:var(--up);font-family:var(--f-disp)"')}${T(147,34,'PUT','text-anchor="middle" style="font-size:12px;font-weight:800;fill:var(--dn);font-family:var(--f-disp)"')}${T(52,54,'Quyền MUA','text-anchor="middle" '+TB)}${T(147,54,'Quyền BÁN','text-anchor="middle" '+TB)}${T(52,70,'ở giá K','text-anchor="middle" '+TS)}${T(147,70,'ở giá K','text-anchor="middle" '+TS)}${T(52,88,'đến ngày đáo hạn','text-anchor="middle" '+TS)}${T(147,88,'đến ngày đáo hạn','text-anchor="middle" '+TS)}${T(52,102,'Lãi khi giá tăng','text-anchor="middle" style="font-size:8px;fill:var(--up)"')}${T(147,102,'Lãi khi giá giảm','text-anchor="middle" style="font-size:8px;fill:var(--dn)"')}`,'Call và put'),
  f:'Người mua trả phí (premium) để có QUYỀN · Người bán nhận phí và có NGHĨA VỤ',
  pts:['Call: quyền mua 100 cổ phiếu ở giá thực hiện K trước/tại ngày đáo hạn. Put: quyền bán.','Phí quyền chọn (premium) niêm yết theo mỗi cổ phiếu: phí $2,50 nghĩa là $250 cho một hợp đồng 100 cổ phiếu.','Kiểu Mỹ: thực hiện bất cứ lúc nào đến đáo hạn (quyền chọn cổ phiếu Mỹ). Kiểu châu Âu: chỉ tại đáo hạn (quyền chọn chỉ số SPX, chứng quyền Việt Nam).','Đáo hạn tháng chuẩn ở Mỹ: thứ Sáu tuần thứ ba; ngoài ra có đáo hạn tuần và hằng ngày (0DTE) với nhiều mã lớn.','Bù trừ qua OCC (Options Clearing Corporation); nhà môi giới cấp quyền giao dịch theo cấp độ kinh nghiệm.'],
  thr:[['Mua call/put','Rủi ro giới hạn ở phí'],['Bán call không có cổ phiếu','Rủi ro không giới hạn'],['Bán put','Lỗ tối đa ≈ K − phí (nếu giá về 0)']],
  hook:'<b>Mẹo nhớ:</b> “Call gọi giá lên, Put đẩy giá xuống.”',src:'OCC, Characteristics and Risks of Standardized Options (ODD); Hull, Options, Futures, and Other Derivatives (11th ed., 2021).'},
 {id:'opt-money',g:'Quyền chọn (Options)',t:'Trong, ngang và ngoài tiền',d:'Giá trị nội tại và giá trị thời gian',
  vis:()=>{ const X=v=>14+(v-70)/60*172; let g=`<line class="axis" x1="14" x2="186" y1="100" y2="100"/>`; const pts=[]; for(let s=70;s<=130;s+=1){ const b=bs('call',s,100,60/365,.04,.3).price; pts.push([X(s),100-b*2.4,100-Math.max(0,s-100)*2.4]); }
    g+=`<path d="${pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' ')}" fill="none" style="stroke:var(--gold)" stroke-width="2"/><path d="${pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[2].toFixed(1)).join(' ')}" fill="none" style="stroke:var(--mut)" stroke-width="1.6" stroke-dasharray="4 3"/>`;
    g+=`<line x1="${X(100)}" x2="${X(100)}" y1="20" y2="100" style="stroke:var(--line2)" stroke-dasharray="2 3"/>`+T(X(85),112,'OTM','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--dn)"')+T(X(100),112,'ATM','text-anchor="middle" style="font-size:8px;font-weight:700"')+T(X(118),112,'ITM','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--up)"')+T(X(75),30,'Vàng: giá call','style="font-size:8px;fill:var(--gold)"')+T(X(75),42,'Đứt nét: nội tại',TS);
    return sv(g,'Giá call gồm giá trị nội tại và giá trị thời gian'); },
  f:'Phí = Giá trị nội tại + Giá trị thời gian · Nội tại call = max(S − K, 0)',
  pts:['Call trong tiền (ITM) khi S > K; put ITM khi S < K. Ngang giá (ATM) khi S ≈ K.','Giá trị thời gian lớn nhất ở ATM và giảm dần về 0 khi đáo hạn.','Quyền chọn ngoài tiền (OTM) chỉ có giá trị thời gian — rẻ nhưng xác suất đáo hạn có giá trị thấp.','Khoảng cách giữa đường vàng và đường đứt nét chính là giá trị thời gian.'],
  thr:[['Delta ≈ 0,5','ATM'],['Delta > 0,7','ITM sâu'],['Delta < 0,3','OTM']],
  hook:'<b>Mẹo nhớ:</b> nội tại là “tiền thật hôm nay”, thời gian là “hy vọng”.',src:'Hull (2021), ch. 10–11; Natenberg, Option Volatility and Pricing (2nd ed., 2015).'},
 {id:'opt-payoff',g:'Quyền chọn (Options)',t:'Bốn vị thế cơ bản',d:'Mua call, bán call, mua put, bán put',
  vis:()=>{ const P=[[OL('call',1,100),'Mua call'],[OL('call',-1,100),'Bán call'],[OL('put',1,100),'Mua put'],[OL('put',-1,100),'Bán put']]; let g='';
    P.forEach(([leg,n],i)=>{ const ox=8+(i%2)*96, oy=6+Math.floor(i/2)*60; const prem=bs(leg.k,100,100,30/365,.04,.3).price; const f=s=>leg.side*((leg.k==='call'?Math.max(s-100,0):Math.max(100-s,0))-prem);
      const X=s=>ox+4+(s-80)/40*80, Y=v=>oy+28-v*1.3; g+=`<rect x="${ox}" y="${oy}" width="88" height="54" rx="6" style="fill:var(--s1);stroke:var(--line2)"/><line x1="${ox+4}" x2="${ox+84}" y1="${Y(0)}" y2="${Y(0)}" style="stroke:var(--mut)" stroke-width=".8"/>`;
      g+=`<path d="M${X(80)} ${Y(f(80)).toFixed(1)} L${X(100)} ${Y(f(100)).toFixed(1)} L${X(120)} ${Y(f(120)).toFixed(1)}" fill="none" style="stroke:${leg.side>0?'var(--up)':'var(--dn)'}" stroke-width="2"/>`+T(ox+6,oy+50,n,'style="font-size:8px;font-weight:700;fill:var(--fg)"'); });
    return sv(g,'Bốn biểu đồ lãi lỗ cơ bản'); },
  f:'Lãi/lỗ mua call tại đáo hạn = max(S − K, 0) − phí',
  pts:['Mua call: lỗ tối đa = phí; hòa vốn = K + phí; lãi không giới hạn.','Bán call (không có cổ phiếu): lãi tối đa = phí; lỗ không giới hạn khi giá tăng mạnh.','Mua put: lỗ tối đa = phí; hòa vốn = K − phí; lãi tối đa = K − phí (giá về 0).','Bán put: lãi tối đa = phí; lỗ tối đa = K − phí — tương đương cam kết mua cổ phiếu ở giá K.','Mọi chiến lược phức tạp đều là tổ hợp của bốn “khối Lego” này cùng với cổ phiếu.'],
  thr:[['Người mua quyền chọn','Cần giá chạy đủ xa và đủ nhanh'],['Người bán quyền chọn','Thắng thường xuyên, thua ít nhưng có thể thua lớn']],
  hook:'<b>Mẹo nhớ:</b> mua quyền chọn = mua vé số có cơ sở; bán quyền chọn = làm nhà bảo hiểm.',src:'McMillan, Options as a Strategic Investment (5th ed., 2012).'},
 {id:'opt-bs',g:'Quyền chọn (Options)',t:'Mô hình Black–Scholes',d:'Năm đầu vào định giá một quyền chọn',
  vis:()=>{ const it=[['S','Giá cổ phiếu','↑ call'],['K','Giá thực hiện','↓ call'],['T','Thời gian','↑ cả hai'],['σ','Biến động','↑ cả hai'],['r','Lãi suất','↑ call']]; let g='';
    it.forEach(([a,b,c],i)=>{ const y=10+i*22; g+=`<rect x="10" y="${y}" width="180" height="18" rx="4" style="fill:var(--s1);stroke:var(--line2)"/>`+T(20,y+13,a,'style="font-size:11px;font-weight:800;fill:var(--gold);font-family:var(--f-disp)"')+T(40,y+13,b,'style="font-size:8.5px;fill:var(--fg)"')+T(185,y+13,c,'text-anchor="end" style="font-size:8px;fill:var(--up);font-weight:700"'); });
    return sv(g,'Năm đầu vào của Black–Scholes'); },
  f:'C = S·N(d₁) − K·e<sup>−rT</sup>·N(d₂) · d₁ = [ln(S/K) + (r + σ²/2)T] ÷ (σ√T) · d₂ = d₁ − σ√T',
  pts:['Giả định: giá cổ phiếu đi theo chuyển động Brown hình học (lợi nhuận log-chuẩn), biến động và lãi suất không đổi, không phí giao dịch, kiểu châu Âu.','N(d₂) xấp xỉ xác suất rủi ro trung tính để call đáo hạn trong tiền; N(d₁) là delta của call.','Biến động σ là đầu vào duy nhất không quan sát trực tiếp được — thị trường thực chất giao dịch “biến động”.','Thực tế lợi nhuận có đuôi dày và biến động thay đổi, nên thị trường tạo ra “nụ cười biến động”.','Công trình năm 1973 của Black, Scholes và Merton; Scholes và Merton nhận giải Nobel Kinh tế năm 1997.'],
  thr:[['IV tăng 1 điểm','Giá ATM tăng khoảng bằng Vega']],
  hook:'<b>Mẹo nhớ:</b> “Giá – Giá thực hiện – Thời gian – Biến động – Lãi suất”.',src:'Black & Scholes (1973), Journal of Political Economy 81(3); Merton (1973), Bell Journal of Economics.'},
 {id:'opt-parity',g:'Quyền chọn (Options)',t:'Put–call parity',d:'Mối liên hệ không thể phá vỡ giữa call và put',
  vis:()=>sv(`<rect x="10" y="30" width="44" height="30" rx="5" style="fill:var(--up);fill-opacity:.8"/>${T(32,49,'+Call','text-anchor="middle" style="font-size:9px;fill:#fff;font-weight:700"')}${T(62,49,'−','text-anchor="middle" style="font-size:14px;fill:var(--fg)"')}<rect x="70" y="30" width="44" height="30" rx="5" style="fill:var(--dn);fill-opacity:.8"/>${T(92,49,'Put','text-anchor="middle" style="font-size:9px;fill:#fff;font-weight:700"')}${T(122,49,'=','text-anchor="middle" style="font-size:14px;fill:var(--fg)"')}<rect x="130" y="30" width="60" height="30" rx="5" style="fill:var(--gold);fill-opacity:.85"/>${T(160,44,'Cổ phiếu','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--gold-ink)"')}${T(160,55,'− PV(K)','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--gold-ink)"')}${T(100,88,'Mua call + bán put cùng K = “cổ phiếu tổng hợp”','text-anchor="middle" '+TB)}`,'Put–call parity'),
  f:'C − P = S − K·e<sup>−rT</sup> (kiểu châu Âu, không cổ tức)',
  pts:['Nếu đẳng thức bị vi phạm, có cơ hội kinh doanh chênh lệch giá không rủi ro — nên trên thực tế nó luôn gần đúng.','Mua call + bán put = vị thế mua cổ phiếu tổng hợp; mua put + mua cổ phiếu ≈ mua call + gửi tiền (put bảo vệ ≈ call).','Covered call có lãi/lỗ tương đương bán put cùng giá thực hiện.','Có cổ tức: S thay bằng S − PV(cổ tức); kiểu Mỹ chỉ còn bất đẳng thức.','Phòng thí nghiệm quyền chọn tự kiểm tra parity cho cặp ATM.'],
  thr:[['Covered call','≡ bán put'],['Put bảo vệ','≡ mua call (+ trái phiếu)']],
  hook:'<b>Mẹo nhớ:</b> “Call trừ Put bằng Cổ phiếu trừ tiền giá thực hiện.”',src:'Stoll, H. (1969), “The Relationship Between Put and Call Option Prices”, Journal of Finance 24(5).'},
 {id:'opt-delta',g:'Quyền chọn (Options)',t:'Delta và Gamma',d:'Độ nhạy theo giá và tốc độ thay đổi của nó',
  vis:()=>{ const X=v=>14+(v-60)/80*172; let d='',gm=''; for(let s=60;s<=140;s+=1){ const b=bs('call',s,100,45/365,.04,.3); d+=(s>60?'L':'M')+X(s).toFixed(1)+' '+(105-b.delta*85).toFixed(1); gm+=(s>60?'L':'M')+X(s).toFixed(1)+' '+(105-b.gamma*85/0.045).toFixed(1); }
    return sv(`<line class="axis" x1="14" x2="186" y1="105" y2="105"/><path d="${d}" fill="none" style="stroke:var(--us)" stroke-width="2.2"/><path d="${gm}" fill="none" style="stroke:var(--ceil)" stroke-width="2" stroke-dasharray="4 3"/>${T(150,26,'Delta call','style="font-size:8px;fill:var(--us);font-weight:700"')}${T(110,40,'Gamma','style="font-size:8px;fill:var(--ceil);font-weight:700"')}${T(X(100),117,'K','text-anchor="middle" '+TS)}`,'Đường delta và gamma'); },
  f:'Delta = ∂Giá/∂S · Gamma = ∂Delta/∂S',
  pts:['Delta call từ 0 đến 1, put từ −1 đến 0. Delta 0,40 nghĩa là giá quyền chọn tăng khoảng 0,40 khi cổ phiếu tăng 1.','Delta của vị thế × 100 = số cổ phiếu tương đương. Ví dụ 5 call delta 0,6 ≈ 300 cổ phiếu.','Gamma cao nhất ở ATM và gần đáo hạn: delta thay đổi rất nhanh — rủi ro lớn với người bán quyền chọn.','Người mua quyền chọn có gamma dương (lợi khi giá chạy mạnh); người bán có gamma âm.','Phòng hộ delta (delta hedging): nhà tạo lập thị trường mua/bán cổ phiếu để giữ delta ≈ 0.'],
  thr:[['|Delta| ≈ 0,5','Ngang giá'],['Gamma cao + sát đáo hạn','Rủi ro “gamma squeeze”']],
  hook:'<b>Mẹo nhớ:</b> Delta là vận tốc, Gamma là gia tốc.',src:'Natenberg (2015), ch. 7; Hull (2021), ch. 19.'},
 {id:'opt-theta',g:'Quyền chọn (Options)',t:'Theta, Vega và Rho',d:'Thời gian, biến động và lãi suất',
  vis:()=>{ const X=v=>14+(90-v)/90*172; let d=''; for(let t=90;t>=0;t-=1){ const b=bs('call',100,100,t/365,.04,.3).price; d+=(t<90?'L':'M')+X(t).toFixed(1)+' '+(108-b*13).toFixed(1); }
    return sv(`<line class="axis" x1="14" x2="186" y1="108" y2="108"/><path d="${d}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/>${T(16,16,'Giá call ATM theo ngày còn lại','style="font-size:8px;fill:var(--gold);font-weight:700"')}${T(14,120,'90 ngày',TS)}${T(186,120,'Đáo hạn','text-anchor="end" '+TS)}${T(140,70,'Tăng tốc mất giá','style="font-size:8px;fill:var(--dn);font-weight:700"')}`,'Đường giá trị thời gian giảm dần'); },
  f:'Theta = ∂Giá/∂t (mỗi ngày) · Vega = ∂Giá/∂σ (mỗi 1% IV) · Rho = ∂Giá/∂r',
  pts:['Giá trị thời gian của quyền chọn ATM giảm gần tỷ lệ với √T — mất giá chậm lúc đầu, rất nhanh trong 30 ngày cuối.','Người mua có theta âm (mất tiền mỗi ngày); người bán có theta dương.','Vega lớn nhất với quyền chọn ATM, thời hạn dài. Vị thế mua quyền chọn có vega dương: lợi khi IV tăng.','Rho thường nhỏ với quyền chọn ngắn hạn, quan trọng hơn với LEAPS (thời hạn trên 1 năm).','Theta và gamma là hai mặt của một đồng xu: muốn hưởng gamma phải trả theta.'],
  thr:[['DTE < 30','Theta tăng tốc'],['DTE 30–60','Vùng phổ biến cho chiến lược bán phí']],
  hook:'<b>Mẹo nhớ:</b> thời gian là kẻ thù của người mua, bạn của người bán.',src:'Natenberg (2015); Sinclair, Volatility Trading (2nd ed., 2013).'},
 {id:'opt-iv',g:'Quyền chọn (Options)',t:'Biến động ngầm định (IV)',d:'Thị trường đang “định giá” bao nhiêu biến động',
  vis:()=>{ const X=v=>14+v/60*172; let g=`<line class="axis" x1="14" x2="186" y1="100" y2="100"/>`; let p=''; for(let d=0;d<=60;d++){ const iv=28+ (d<40? d*.35: 42-(d-40)*1.2) + (d===40?0:0); const y=100-(d<=40? 28+d*.45 : 46-(d-40)*1.3)*1.6; p+=(d?'L':'M')+X(d).toFixed(1)+' '+y.toFixed(1); }
    g+=`<path d="${p}" fill="none" style="stroke:var(--ceil)" stroke-width="2.2"/><line x1="${X(40)}" x2="${X(40)}" y1="16" y2="100" style="stroke:var(--dn)" stroke-dasharray="3 3"/>`+T(X(40),14,'Công bố KQKD','text-anchor="middle" style="font-size:8px;fill:var(--dn);font-weight:700"')+T(X(52),40,'IV crush','style="font-size:8px;fill:var(--dn);font-weight:700"')+T(16,112,'IV tăng dần trước sự kiện, sụp ngay sau đó',TS);
    return sv(g,'IV tăng trước kết quả kinh doanh và sụp sau đó'); },
  f:'Biên độ kỳ vọng ±1σ ≈ S × IV × √(Số ngày ÷ 365)',
  pts:['IV là mức biến động làm cho giá Black–Scholes khớp với giá thị trường — giải ngược từ phí quyền chọn.','So IV với biến động lịch sử (HV): IV cao hơn HV nghĩa là quyền chọn “đắt”, có lợi cho người bán.','IV Rank = (IV hiện tại − IV thấp nhất 1 năm) ÷ (IV cao nhất − IV thấp nhất). IV Rank cao thường đi kèm chiến lược bán phí.','IV crush: sau tin tức (KQKD, FDA), IV sụp mạnh — người mua call/put có thể lỗ dù đoán đúng hướng.','Ví dụ: S = 100, IV = 30%, 30 ngày → ±1σ ≈ 100 × 0,30 × √(30/365) ≈ ±8,6.','Chỉ số VIX đo IV 30 ngày của quyền chọn S&P 500 — “thước đo sợ hãi”.'],
  thr:[['IV Rank > 50','Quyền chọn tương đối đắt'],['IV Rank < 20','Tương đối rẻ']],
  hook:'<b>Mẹo nhớ:</b> “Mua tin đồn, bán sự thật” — với quyền chọn là mua IV trước, IV sụp sau.',src:'CBOE VIX White Paper; Sinclair (2013); Natenberg (2015), ch. 8.'},
 {id:'opt-smile',g:'Quyền chọn (Options)',t:'Nụ cười biến động và độ lệch',d:'Vì sao Black–Scholes không hoàn hảo',
  vis:()=>{ const X=v=>14+(v-70)/60*172; let g=`<line class="axis" x1="14" x2="186" y1="105" y2="105"/>`; let p='',q=''; for(let k=70;k<=130;k+=1){ const sk=26+.012*(100-k)*(100-k)/2+.25*(100-k); const sm=24+.012*(100-k)*(100-k); p+=(k>70?'L':'M')+X(k).toFixed(1)+' '+(110-sk*1.9).toFixed(1); q+=(k>70?'L':'M')+X(k).toFixed(1)+' '+(110-sm*1.9).toFixed(1); }
    g+=`<path d="${q}" fill="none" style="stroke:var(--mut)" stroke-width="1.6" stroke-dasharray="4 3"/><path d="${p}" fill="none" style="stroke:var(--ceil)" stroke-width="2.2"/>`+T(18,20,'Lệch (skew) cổ phiếu','style="font-size:8px;fill:var(--ceil);font-weight:700"')+T(150,66,'Nụ cười','style="font-size:8px"')+T(100,118,'Giá thực hiện →','text-anchor="middle" '+TS);
    return sv(g,'Nụ cười và độ lệch biến động'); },
  f:'IV khác nhau theo giá thực hiện (skew) và theo thời hạn (cấu trúc kỳ hạn)',
  pts:['Với cổ phiếu và chỉ số, put OTM thường có IV cao hơn call OTM — thị trường trả giá cao cho bảo hiểm giảm giá (skew âm) từ sau sự cố năm 1987.','Hàng hóa, tiền điện tử có thể có skew ngược (call đắt hơn) khi lo sợ giá tăng vọt.','Cấu trúc kỳ hạn: bình thường IV dài hạn cao hơn ngắn hạn (contango); khi hoảng loạn thì ngược lại.','Chiến lược spread cho phép mua phần IV rẻ và bán phần IV đắt.'],
  thr:[['Skew dốc','Nhu cầu bảo hiểm cao, tâm lý lo ngại']],
  hook:'<b>Mẹo nhớ:</b> nụ cười lệch về phía nỗi sợ.',src:'Derman & Kani (1994); Gatheral, The Volatility Surface (2006).'},
 {id:'opt-income',g:'Quyền chọn (Options)',t:'Covered call và bán put bảo đảm',d:'Chiến lược thu nhập và “bánh xe”',
  vis:()=>pm([OL('stock',1,null),OL('call',-1,105)]),
  f:'Covered call = Cổ phiếu + Bán call OTM · Cash-secured put = Bán put + giữ đủ tiền mua',
  pts:['Covered call thu phí đều đặn nhưng giới hạn phần tăng trên giá thực hiện; vẫn chịu gần như toàn bộ rủi ro giảm.','Bán put bảo đảm tiền: được trả phí để chờ mua cổ phiếu muốn sở hữu ở giá thấp hơn.','“Bánh xe” (wheel): bán put → bị chỉ định mua → bán covered call → bị gọi bán → lặp lại.','Theo put–call parity, covered call và bán put cùng K có lãi/lỗ như nhau.','Hiệu quả nhất trong thị trường đi ngang và IV cao; kém hiệu quả khi thị trường tăng mạnh.'],
  thr:[['Delta call bán 0,2–0,3','Phổ biến cho covered call'],['30–45 ngày','Cân bằng theta và rủi ro']],
  hook:'<b>Mẹo nhớ:</b> cho thuê cổ phiếu để lấy “tiền nhà” hằng tháng.',src:'CBOE BXM Index methodology; McMillan (2012), ch. 2.'},
 {id:'opt-hedge',g:'Quyền chọn (Options)',t:'Put bảo vệ và Collar',d:'Mua bảo hiểm cho danh mục',
  vis:()=>pm([OL('stock',1,null),OL('put',1,95),OL('call',-1,110)]),
  f:'Put bảo vệ = Cổ phiếu + Mua put · Collar = Cổ phiếu + Mua put + Bán call',
  pts:['Put bảo vệ đặt “sàn” cho lỗ: lỗ tối đa = (S − K) + phí put.','Phí bảo hiểm tốn kém nếu mua thường xuyên — giống bảo hiểm xe, phần lớn thời gian “mất phí”.','Collar dùng tiền bán call để mua put: khóa vùng giá, chi phí gần 0 (zero-cost collar).','Phù hợp khi muốn giữ cổ phiếu qua sự kiện rủi ro (KQKD, bầu cử) hoặc bảo vệ khoản lãi lớn.','Có thể bảo hiểm cả danh mục bằng put trên chỉ số (SPY, SPX) thay vì từng mã.'],
  thr:[['Put OTM 5–10%','Bảo hiểm thảm họa, phí thấp'],['Put ATM','Bảo vệ tối đa, phí cao']],
  hook:'<b>Mẹo nhớ:</b> collar là “thắt dây an toàn” cho cổ phiếu — đổi phần tăng lấy phần bảo vệ.',src:'Hull (2021), ch. 12; OCC ODD.'},
 {id:'opt-vertical',g:'Quyền chọn (Options)',t:'Spread dọc (vertical spread)',d:'Giới hạn rủi ro bằng hai giá thực hiện',
  vis:()=>pm([OL('call',1,100),OL('call',-1,110)]),
  f:'Debit spread: lỗ tối đa = phí ròng · Credit spread: lỗ tối đa = chênh lệch K − phí thu',
  pts:['Bull call spread (mua K thấp, bán K cao): rẻ hơn mua call đơn, lãi tối đa = chênh lệch K − phí ròng.','Bear put spread: tương tự cho kịch bản giảm.','Bull put / bear call (credit spread): thu phí ngay, lãi khi giá không đi ngược hướng.','Spread giảm ảnh hưởng của IV và theta so với quyền chọn đơn.','Chọn độ rộng spread theo tỷ lệ lời/lỗ và xác suất bạn chấp nhận.'],
  thr:[['Credit = 1/3 độ rộng','Mức thu phổ biến cho credit spread']],
  hook:'<b>Mẹo nhớ:</b> bán một chân để “tài trợ” chân còn lại.',src:'McMillan (2012), ch. 7–8.'},
 {id:'opt-straddle',g:'Quyền chọn (Options)',t:'Straddle và Strangle',d:'Đặt cược vào biến động, không vào hướng',
  vis:()=>pm([OL('call',1,100),OL('put',1,100)]),
  f:'Long straddle hòa vốn = K ± tổng phí',
  pts:['Long straddle/strangle: lãi khi giá chạy mạnh theo bất kỳ hướng nào vượt tổng phí.','Kẻ thù là thời gian và IV crush — thường mua trước sự kiện thì đã phải trả IV cao.','Short straddle/strangle: thu phí khi giá đứng yên; rủi ro lỗ lớn hai phía, cần quản lý chặt.','Giá straddle ATM xấp xỉ biên độ biến động thị trường kỳ vọng (≈ 0,8 × S × IV × √T).'],
  thr:[['Biến động thực > IV','Người mua straddle có lợi'],['Biến động thực < IV','Người bán có lợi']],
  hook:'<b>Mẹo nhớ:</b> straddle là chữ V — giá càng xa đáy V càng lãi.',src:'Natenberg (2015), ch. 11; Sinclair (2013).'},
 {id:'opt-condor',g:'Quyền chọn (Options)',t:'Iron condor và Butterfly',d:'Kiếm lời từ thị trường đứng yên, rủi ro giới hạn',
  vis:()=>pm([OL('put',1,85),OL('put',-1,92),OL('call',-1,108),OL('call',1,115)]),
  f:'Iron condor = Bull put spread + Bear call spread',
  pts:['Iron condor thu phí trong một vùng giá; lỗ tối đa = độ rộng cánh − phí thu.','Butterfly (1–2–1): chi phí thấp, lãi lớn nhất nếu giá đáo hạn đúng giá thực hiện giữa.','Cả hai đều có theta dương và vega âm: lợi khi thời gian trôi và IV giảm.','Quản lý: chốt lời ở 50% lãi tối đa, điều chỉnh khi giá chạm chân bán.'],
  thr:[['Chân bán delta ≈ 0,15','Vùng lãi rộng, phí thấp'],['Chân bán delta ≈ 0,30','Phí cao, xác suất thấp hơn']],
  hook:'<b>Mẹo nhớ:</b> condor dang rộng hai cánh, butterfly gập cánh lại một điểm.',src:'Cohen, The Bible of Options Strategies (2nd ed., 2015).'},
 {id:'opt-calendar',g:'Quyền chọn (Options)',t:'Calendar và Diagonal',d:'Khai thác chênh lệch tốc độ mất giá',
  vis:()=>pm([OL('call',-1,100,1,30),OL('call',1,100,1,90)]),
  f:'Calendar = Bán quyền chọn gần hạn + Mua quyền chọn xa hạn (cùng K)',
  pts:['Quyền chọn gần hạn mất giá trị thời gian nhanh hơn — người bán chân gần hưởng chênh lệch theta.','Lãi tốt nhất khi giá đứng gần K tại ngày đáo hạn chân gần; vega dương nên lợi khi IV tăng.','Diagonal: hai chân khác cả thời hạn lẫn giá thực hiện, cho phép có thiên hướng tăng/giảm nhẹ.','Biểu đồ lãi/lỗ tính tại ngày đáo hạn chân gần, chân xa vẫn còn giá trị thời gian (định giá Black–Scholes).'],
  thr:[['Chân gần 20–30 ngày, chân xa 60–90 ngày','Cấu hình phổ biến']],
  hook:'<b>Mẹo nhớ:</b> bán thời gian ngắn, mua thời gian dài.',src:'McMillan (2012), ch. 9.'},
 {id:'opt-risk',g:'Quyền chọn (Options)',t:'Rủi ro và quản lý vị thế',d:'Những điều người mới thường bỏ qua',
  vis:()=>{ const it=['Chỉ định sớm','Cổ tức','Pin risk','Lỗ vô hạn','Thanh khoản','Đòn bẩy','IV crush','Gap đêm']; let g='';
    it.forEach((a,i)=>{ const x=6+(i%4)*48, y=14+Math.floor(i/4)*52; g+=`<rect x="${x}" y="${y}" width="44" height="44" rx="8" style="fill:var(--s1);stroke:var(--dn)"/>`+T(x+22,y+25,a,'text-anchor="middle" style="font-size:6.6px;font-weight:700;fill:var(--fg)"'); });
    return sv(g,'Tám rủi ro khi giao dịch quyền chọn'); },
  f:'Quy mô vị thế: rủi ro tối đa mỗi chiến lược ≤ 1–5% vốn',
  pts:['Quyền chọn kiểu Mỹ có thể bị thực hiện sớm, đặc biệt call ITM ngay trước ngày không hưởng quyền cổ tức.','Pin risk: giá đóng cửa sát K ngày đáo hạn — không chắc bị chỉ định hay không.','Bán call không có cổ phiếu hoặc bán strangle có thể lỗ vượt vốn; cần ký quỹ và cấp quyền cao.','Quyền chọn thanh khoản kém có chênh lệch giá mua–bán rộng, ăn mòn lợi nhuận; ưu tiên mã có open interest lớn.','Đòn bẩy: mua quyền chọn OTM giá rẻ dễ mất 100% phí; phần lớn quyền chọn OTM đáo hạn vô giá trị.','Lập kế hoạch trước: điều kiện chốt lời, cắt lỗ, điều chỉnh (roll) và khi nào đóng trước đáo hạn.'],
  thr:[['Open interest > 1.000, spread < 5% phí','Thanh khoản chấp nhận được']],
  hook:'<b>Mẹo nhớ:</b> biết lỗ tối đa trước khi bấm lệnh — nếu là “không giới hạn”, nghĩ lại.',src:'OCC, Characteristics and Risks of Standardized Options; FINRA Rule 2360.'},
 {id:'opt-vn',g:'Quyền chọn (Options)',t:'Chứng quyền Việt Nam và phái sinh',d:'Sản phẩm giống quyền chọn trên HOSE',
  vis:()=>sv(`<rect x="10" y="14" width="85" height="96" rx="8" style="fill:var(--s1);stroke:var(--vn)"/><rect x="105" y="14" width="85" height="96" rx="8" style="fill:var(--s1);stroke:var(--us)"/>${T(52,32,'Chứng quyền VN','text-anchor="middle" style="font-size:9px;font-weight:800;fill:var(--vn)"')}${T(147,32,'Options Mỹ','text-anchor="middle" style="font-size:9px;font-weight:800;fill:var(--us)"')}${[['CTCK phát hành','Sàn chuẩn hóa'],['Chỉ quyền mua','Call & put'],['Kiểu châu Âu','Kiểu Mỹ'],['Thanh toán tiền','Giao cổ phiếu'],['Không bán khống','Mua & bán']].map(([a,b],i)=>T(52,50+i*13,a,'text-anchor="middle" style="font-size:7.5px;fill:var(--fg)"')+T(147,50+i*13,b,'text-anchor="middle" style="font-size:7.5px;fill:var(--fg)"')).join('')}`,'So sánh chứng quyền Việt Nam và options Mỹ'),
  f:'Giá trị CW khi đáo hạn = max(Giá TB 5 phiên − Giá thực hiện, 0) ÷ Tỷ lệ chuyển đổi',
  pts:['Chứng quyền có bảo đảm (CW) giao dịch trên HOSE từ 2019: do công ty chứng khoán phát hành, là quyền chọn mua kiểu châu Âu, thanh toán bằng tiền.','Nhà đầu tư chỉ được mua CW (không bán khống); tổ chức phát hành phòng hộ bằng cổ phiếu cơ sở.','Tỷ lệ chuyển đổi, ví dụ 5:1, nghĩa là 5 chứng quyền tương ứng 1 cổ phiếu — nhớ chia khi tính giá trị.','Giá thanh toán thường là giá đóng cửa bình quân 5 phiên trước ngày đáo hạn (không tính ngày đáo hạn).','Phái sinh chỉ số VN30F (HNX) là hợp đồng tương lai, không phải quyền chọn: lãi/lỗ tuyến tính, có ký quỹ và đáo hạn thứ Năm tuần thứ ba.','Quyền chọn cổ phiếu niêm yết chưa có ở Việt Nam (tính đến thông tin của ứng dụng) — kiểm tra quy định mới nhất.'],
  thr:[['Giá CW ≈ giá trị nội tại ÷ tỷ lệ + giá trị thời gian','So sánh để biết CW đắt hay rẻ'],['IV của CW','Thường cao hơn biến động lịch sử của cổ phiếu']],
  hook:'<b>Mẹo nhớ:</b> CW là “call châu Âu do công ty chứng khoán bán cho bạn”.',src:'Nghị định 158/2020/NĐ-CP; Thông tư 107/2016/TT-BTC; Quy chế HOSE về chứng quyền có bảo đảm.'}
];
OPT_LESSONS.forEach(l=>LESSONS.push(l));
ORDER.splice(ORDER.indexOf('Phân tích kỹ thuật')+1,0,'Quyền chọn (Options)');
LESSONS.sort((a,b)=>ORDER.indexOf(a.g)-ORDER.indexOf(b.g));
[
 {q:'Một hợp đồng quyền chọn cổ phiếu Mỹ thường tương ứng bao nhiêu cổ phiếu?',a:['100','10','1','1.000'],c:0,e:'Phí niêm yết theo cổ phiếu: phí $2,50 → $250 mỗi hợp đồng.'},
 {q:'Người mua put có lỗ tối đa bằng?',a:['Phí đã trả','Giá thực hiện','Không giới hạn','Giá cổ phiếu'],c:0,e:'Người mua quyền chọn chỉ mất tối đa phí. Người bán call không có cổ phiếu mới chịu lỗ không giới hạn.'},
 {q:'Điểm hòa vốn khi mua call giá thực hiện 100, phí 4 là?',a:['104','96','100','4'],c:0,e:'Hòa vốn mua call = K + phí. Mua put: K − phí.'},
 {q:'Call có giá thực hiện 90 khi cổ phiếu ở 100 được gọi là?',a:['Trong tiền (ITM)','Ngoài tiền (OTM)','Ngang giá (ATM)','Vô giá trị'],c:0,e:'Call ITM khi S > K. Giá trị nội tại = 100 − 90 = 10.'},
 {q:'Put–call parity (châu Âu, không cổ tức) phát biểu?',a:['C − P = S − K·e^(−rT)','C + P = S + K','C = P','C − P = K − S'],c:0,e:'Mua call + bán put cùng K, cùng hạn = vị thế cổ phiếu tổng hợp.'},
 {q:'Delta của call ATM xấp xỉ bao nhiêu?',a:['0,5','1','0','−0,5'],c:0,e:'Delta call từ 0 (OTM sâu) đến 1 (ITM sâu); put từ −1 đến 0.'},
 {q:'Greek nào đo tốc độ mất giá theo thời gian?',a:['Theta','Vega','Gamma','Rho'],c:0,e:'Người mua quyền chọn có theta âm; người bán có theta dương.'},
 {q:'Vega dương có nghĩa là vị thế lợi khi nào?',a:['Biến động ngầm định (IV) tăng','Lãi suất giảm','Thời gian trôi qua','Cổ phiếu đứng yên'],c:0,e:'Mua quyền chọn có vega dương; bán quyền chọn có vega âm.'},
 {q:'Cổ phiếu 100, IV 30%, 30 ngày: biên độ kỳ vọng ±1σ xấp xỉ?',a:['±8,6','±30','±2,5','±15'],c:0,e:'100 × 0,30 × √(30/365) ≈ 8,6.'},
 {q:'“IV crush” thường xảy ra khi nào?',a:['Ngay sau khi công bố kết quả kinh doanh','Trước khi thị trường mở cửa mỗi ngày','Khi lãi suất tăng','Khi cổ phiếu chia tách'],c:0,e:'Bất định được giải quyết, IV sụp — người mua quyền chọn có thể lỗ dù đoán đúng hướng.'},
 {q:'Covered call có lãi/lỗ tương đương vị thế nào (cùng K)?',a:['Bán put','Mua put','Mua call','Bán cổ phiếu'],c:0,e:'Theo put–call parity: cổ phiếu − call = trái phiếu − put.'},
 {q:'Chiến lược nào lãi khi giá biến động mạnh theo bất kỳ hướng nào?',a:['Long straddle','Iron condor','Covered call','Bull put spread'],c:0,e:'Mua call + put cùng K; hòa vốn = K ± tổng phí.'},
 {q:'Iron condor được ghép từ?',a:['Bull put spread + Bear call spread','Hai covered call','Long straddle + cổ phiếu','Bull call + Bull put'],c:0,e:'Thu phí trong một vùng giá, lỗ giới hạn bởi hai cánh mua bảo vệ.'},
 {q:'Chứng quyền có bảo đảm ở Việt Nam là loại quyền chọn nào?',a:['Quyền chọn mua kiểu châu Âu, thanh toán tiền','Quyền chọn bán kiểu Mỹ','Hợp đồng tương lai','Quyền chọn mua kiểu Mỹ, giao cổ phiếu'],c:0,e:'Do công ty chứng khoán phát hành; nhà đầu tư chỉ mua, không bán khống.'},
 {q:'Tỷ lệ chuyển đổi chứng quyền 5:1 nghĩa là gì?',a:['5 chứng quyền tương ứng 1 cổ phiếu','1 chứng quyền tương ứng 5 cổ phiếu','Lãi gấp 5 lần','Đáo hạn sau 5 tháng'],c:0,e:'Giá trị nội tại mỗi CW = (S − K) ÷ 5.'},
 {q:'Trong mô hình Black–Scholes, đầu vào nào không quan sát trực tiếp trên thị trường?',a:['Biến động (σ)','Giá cổ phiếu','Giá thực hiện','Thời gian đáo hạn'],c:0,e:'Vì vậy thị trường giải ngược σ từ giá quyền chọn — đó là IV.'}
].forEach(q=>QUIZ.push(q));

/* nút mở phòng thí nghiệm trong bài học quyền chọn */
const _openLessonOpt=openLesson;
openLesson=function(id){ _openLessonOpt(id); if(String(id).startsWith('opt-')){ const rb=$('#sheetBody .row-btns'); if(rb){ const b=document.createElement('button'); b.className='btn'; b.id='lOptLab'; b.textContent='Mở phòng thí nghiệm quyền chọn'; b.onclick=()=>{ closeSheet(); S.expertTab='options'; setView('expert'); }; rb.appendChild(b); } } };
