/* ============================================================
   BIỂU ĐỒ KỸ THUẬT: dữ liệu giá, chỉ báo, nhận diện mẫu nến, vẽ SVG
   ============================================================ */
/* ---------- dữ liệu giá mô phỏng (có hạt giống theo mã) ---------- */
function seedRand(str){ let h=2166136261>>>0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619)>>>0; }
  return ()=>{ h=(h+0x6D2B79F5)>>>0; let t=h; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
function gauss(r){ let u=0,v=0; while(!u) u=r(); while(!v) v=r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }
function businessDays(endISO,n){ const out=[]; let d=new Date(endISO+'T12:00:00Z'); while(out.length<n){ const wd=d.getUTCDay(); if(wd!==0&&wd!==6) out.unshift(d.toISOString().slice(0,10)); d=new Date(d.getTime()-864e5); } return out; }
const SIM_END='2026-10-16';
function simulateOHLC(s,n){
  n=n||504; const r=seedRand(s.t+'|ohlc|v2');
  const annVol=((s.m==='VN')?.22:.19)*clamp(isNum(s.b)?s.b:1,.4,2.4)*.85+.07; const dv=annVol/Math.sqrt(252);
  const lim= s.m==='VN'? (s.ex==='HNX'?.099:s.ex==='UPCOM'?.149:.069) : 0.25;
  const lr=[]; let v=dv;
  for(let i=0;i<n;i++){ const g=gauss(r); v=Math.sqrt(.9*v*v+.1*dv*dv*(1+.8*g*g)); lr.push(g*v); }
  const fit=(a,b,tgt)=>{ const cur=lr.slice(a,b).reduce((x,y)=>x+y,0); const adj=(tgt-cur)/(b-a); for(let i=a;i<b;i++) lr[i]+=adj; };
  const t0=Math.log(1+(.04+gauss(r)*.18)), t1=Math.log(1+clamp(isNum(s.mo)?s.mo:0,-80,400)/100);
  for(let it=0;it<8;it++){ fit(0,n-252,t0); fit(n-252,n,t1); for(let i=0;i<n;i++) lr[i]=clamp(lr[i],Math.log(1-lim),Math.log(1+lim)); }
  const dates=businessDays(SIM_END,n); const c=[]; let px=1; for(let i=0;i<n;i++){ px*=Math.exp(lr[i]); c.push(px); }
  const base=c[n-253]||c[0]; const k=100/base;
  const out=[]; let prev=c[0]*k/Math.exp(lr[0]);
  for(let i=0;i<n;i++){
    const close=c[i]*k; let open=prev*Math.exp(gauss(r)*dv*.35);
    const hi=Math.max(open,close)*Math.exp(Math.abs(gauss(r))*dv*.55), lo=Math.min(open,close)*Math.exp(-Math.abs(gauss(r))*dv*.55);
    const vol=Math.round(1e6*(1+Math.abs(lr[i])/dv*.7)*Math.exp(gauss(r)*.35)*(s.m==='VN'?3:1));
    out.push({d:dates[i],o:open,h:Math.max(hi,open,close),l:Math.min(lo,open,close),c:close,v:vol}); prev=close;
  }
  return out;
}
/* ---------- nhập CSV thật ---------- */
function parseDateStr(x){
  x=String(x).trim().replace(/"/g,'');
  let m=x.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/); if(m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  m=x.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/); if(m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  m=x.match(/^(\d{4})(\d{2})(\d{2})$/); if(m) return `${m[1]}-${m[2]}-${m[3]}`;
  return null;
}
function parseOHLCcsv(text){
  const lines=String(text).split(/\r?\n/).map(l=>l.trim()).filter(Boolean); if(lines.length<2) return {err:'At least 30 rows of data are needed.'};
  const delim= lines[0].includes('\t')?'\t': (lines[0].split(';').length>lines[0].split(',').length?';':',');
  const num=v=>{ v=String(v).trim().replace(/"/g,''); if(delim===';'&&/^\d{1,3}(\.\d{3})*(,\d+)?$/.test(v)) v=v.replace(/\./g,'').replace(',','.'); else v=v.replace(/,/g,''); const f=parseFloat(v); return isFinite(f)?f:null; };
  let idx={d:0,o:1,h:2,l:3,c:4,v:5}; let start=0;
  const head=lines[0].toLowerCase().split(delim).map(h=>h.trim().replace(/"/g,''));
  if(!parseDateStr(head[0])){
    start=1; const find=(...ks)=>head.findIndex(h=>ks.some(k=>h===k||h.startsWith(k)));
    const m={d:find('date','ngày','ngay','time','tradingdate'),o:find('open','mở','mo cua','giá mở'),h:find('high','cao'),l:find('low','thấp','thap'),c:find('adj close','close','đóng','dong','giá đóng'),v:find('volume','vol','khối','khoi','kl')};
    if(head.includes('close')) m.c=head.indexOf('close');
    if(m.d>=0&&m.o>=0&&m.h>=0&&m.l>=0&&m.c>=0) idx=m; else return {err:'Column headers not recognized. Required columns: Date, Open, High, Low, Close, Volume.'};
  }
  const rows=[];
  for(let i=start;i<lines.length;i++){ const p=lines[i].split(delim); const d=parseDateStr(p[idx.d]); const o=num(p[idx.o]),h=num(p[idx.h]),l=num(p[idx.l]),c=num(p[idx.c]); const v= idx.v>=0? num(p[idx.v]) : 0;
    if(d&&o>0&&h>0&&l>0&&c>0) rows.push({d,o,h:Math.max(h,o,c),l:Math.min(l,o,c),c,v:v||0}); }
  rows.sort((a,b)=>a.d<b.d?-1:a.d>b.d?1:0);
  const uniq=rows.filter((r,i)=>i===0||r.d!==rows[i-1].d);
  if(uniq.length<30) return {err:`Only ${uniq.length} valid rows read — at least 30 are needed.`};
  return {rows:uniq.slice(-1500)};
}
function getOHLC(t){
  const imp=(store.ohlc||{})[t];
  if(imp&&imp.length) return {rows:imp.map(a=>({d:a[0],o:a[1],h:a[2],l:a[3],c:a[4],v:a[5]})),real:true,src:'csv'};
  const isE=String(t).startsWith('E:'), tk=isE?t.slice(2):t;
  const q=(typeof LIVE!=='undefined')&&(isE?LIVE.e[tk]:LIVE.q[t]);
  if(q&&Array.isArray(q.hist)&&q.hist.length>=20){ const rows=q.hist.filter(b=>isNum(b[4])).map(b=>{ const c=b[4], o=isNum(b[1])?b[1]:c, h=isNum(b[2])?Math.max(b[2],o,c):Math.max(o,c), l=isNum(b[3])?Math.min(b[3],o,c):Math.min(o,c); return {d:b[0],o,h,l,c,v:isNum(b[5])?b[5]:0}; }); return {rows,real:true,src:'live',from:q.src,flat:q.hist.filter(b=>b[6]).length}; }
  return {rows:simulateOHLC(isE?etfPseudo(tk):(BY[t]||{t,m:'US',b:1})),real:false,closeOnly:!!(q&&q.hist&&q.hist.length)};
}
function saveOHLC(t,rows){ store.ohlc=store.ohlc||{}; store.ohlc[t]=rows.map(r=>[r.d,+r.o.toFixed(4),+r.h.toFixed(4),+r.l.toFixed(4),+r.c.toFixed(4),Math.round(r.v)]); persist(); }

/* ---------- chỉ báo (hàm thuần) ---------- */
function sma(a,n){ const o=new Array(a.length).fill(null); let s=0; for(let i=0;i<a.length;i++){ s+=a[i]; if(i>=n) s-=a[i-n]; if(i>=n-1) o[i]=s/n; } return o; }
function ema(a,n){ const o=new Array(a.length).fill(null); const k=2/(n+1); let e=null; for(let i=0;i<a.length;i++){ if(a[i]==null) continue; if(e==null){ if(i>=n-1){ let s=0; for(let j=i-n+1;j<=i;j++) s+=a[j]; e=s/n; o[i]=e; } } else { e=a[i]*k+e*(1-k); o[i]=e; } } return o; }
function stdev(a,n){ const o=new Array(a.length).fill(null); for(let i=n-1;i<a.length;i++){ let m=0; for(let j=i-n+1;j<=i;j++) m+=a[j]; m/=n; let v=0; for(let j=i-n+1;j<=i;j++) v+=(a[j]-m)*(a[j]-m); o[i]=Math.sqrt(v/n); } return o; }
function bollinger(c,n,k){ n=n||20; k=k||2; const m=sma(c,n), s=stdev(c,n); return {mid:m,up:m.map((v,i)=>v==null?null:v+k*s[i]),dn:m.map((v,i)=>v==null?null:v-k*s[i])}; }
function rsi(c,n){ n=n||14; const o=new Array(c.length).fill(null); let g=0,l=0;
  for(let i=1;i<c.length;i++){ const d=c[i]-c[i-1], up=Math.max(d,0), dn=Math.max(-d,0);
    if(i<=n){ g+=up; l+=dn; if(i===n){ g/=n; l/=n; o[i]=l===0?100:100-100/(1+g/l); } }
    else { g=(g*(n-1)+up)/n; l=(l*(n-1)+dn)/n; o[i]=l===0?100:100-100/(1+g/l); } }
  return o; }
function macd(c,f,s,sg){ f=f||12; s=s||26; sg=sg||9; const ef=ema(c,f), es=ema(c,s); const line=c.map((_,i)=>ef[i]!=null&&es[i]!=null?ef[i]-es[i]:null);
  const firstIdx=line.findIndex(v=>v!=null); const sig=new Array(c.length).fill(null);
  if(firstIdx>=0){ const sub=ema(line.slice(firstIdx),sg); sub.forEach((v,j)=>sig[firstIdx+j]=v); }
  return {line,sig,hist:line.map((v,i)=>v!=null&&sig[i]!=null?v-sig[i]:null)}; }
function stochastic(rows,n,d){ n=n||14; d=d||3; const k=rows.map((r,i)=>{ if(i<n-1) return null; let hh=-Infinity,ll=Infinity; for(let j=i-n+1;j<=i;j++){ hh=Math.max(hh,rows[j].h); ll=Math.min(ll,rows[j].l); } return hh===ll?50:(r.c-ll)/(hh-ll)*100; });
  const ds=new Array(rows.length).fill(null); for(let i=0;i<rows.length;i++){ if(i>=n-1+d-1){ let s=0; for(let j=i-d+1;j<=i;j++) s+=k[j]; ds[i]=s/d; } } return {k,d:ds}; }
function atr(rows,n){ n=n||14; const tr=rows.map((r,i)=>i===0?r.h-r.l:Math.max(r.h-r.l,Math.abs(r.h-rows[i-1].c),Math.abs(r.l-rows[i-1].c)));
  const o=new Array(rows.length).fill(null); let a=null; for(let i=0;i<rows.length;i++){ if(i===n-1){ a=tr.slice(0,n).reduce((x,y)=>x+y,0)/n; o[i]=a; } else if(i>=n){ a=(a*(n-1)+tr[i])/n; o[i]=a; } } return o; }
function ichimoku(rows){ const mid=(i,n)=>{ if(i<n-1) return null; let hh=-Infinity,ll=Infinity; for(let j=i-n+1;j<=i;j++){ hh=Math.max(hh,rows[j].h); ll=Math.min(ll,rows[j].l); } return (hh+ll)/2; };
  const N=rows.length, ten=[],kij=[],a=new Array(N+26).fill(null),b=new Array(N+26).fill(null);
  for(let i=0;i<N;i++){ ten.push(mid(i,9)); kij.push(mid(i,26)); const sb=mid(i,52); if(ten[i]!=null&&kij[i]!=null) a[i+26]=(ten[i]+kij[i])/2; if(sb!=null) b[i+26]=sb; }
  return {ten,kij,a,b}; }
function obv(rows){ let o=0; return rows.map((r,i)=>{ if(i>0){ if(r.c>rows[i-1].c) o+=r.v; else if(r.c<rows[i-1].c) o-=r.v; } return o; }); }
function heikinAshi(rows){ const out=[]; rows.forEach((r,i)=>{ const c=(r.o+r.h+r.l+r.c)/4; const o= i===0?(r.o+r.c)/2:(out[i-1].o+out[i-1].c)/2; out.push({d:r.d,o,c,h:Math.max(r.h,o,c),l:Math.min(r.l,o,c),v:r.v}); }); return out; }
/* Renko chuẩn: gạch mới cùng chiều khi giá vượt 1 hộp, đảo chiều khi vượt 2 hộp */
function renko(rows,box){ const out=[]; if(!rows.length||!(box>0)) return out; let lastC=rows[0].c, dir=0;
  rows.forEach(r=>{ for(let guard=0;guard<500;guard++){
      if(dir>=0&&r.c>=lastC+box){ out.push({o:lastC,c:lastC+box,up:true,d:r.d}); lastC+=box; dir=1; continue; }
      if(dir<=0&&r.c<=lastC-box){ out.push({o:lastC,c:lastC-box,up:false,d:r.d}); lastC-=box; dir=-1; continue; }
      if(dir===1&&r.c<=lastC-2*box){ out.push({o:lastC-box,c:lastC-2*box,up:false,d:r.d}); lastC-=2*box; dir=-1; continue; }
      if(dir===-1&&r.c>=lastC+2*box){ out.push({o:lastC+box,c:lastC+2*box,up:true,d:r.d}); lastC+=2*box; dir=1; continue; }
      break; } });
  return out; }
/* Biểu đồ phá 3 đường (Three Line Break) */
function lineBreak(rows,n){ n=n||3; const out=[]; if(!rows.length) return out;
  let start=0; while(start<rows.length-1&&rows[start+1].c===rows[0].c) start++;
  if(rows.length<2) return out; out.push({o:rows[0].c,c:rows[start+1]?rows[start+1].c:rows[0].c,d:(rows[start+1]||rows[0]).d});
  for(let i=start+2;i<rows.length;i++){ const r=rows[i], last=out[out.length-1]; const up=last.c>last.o; const recent=out.slice(-n);
    const hi=Math.max(...recent.map(x=>Math.max(x.o,x.c))), lo=Math.min(...recent.map(x=>Math.min(x.o,x.c)));
    if(up){ if(r.c>last.c) out.push({o:last.c,c:r.c,d:r.d}); else if(r.c<lo) out.push({o:last.o,c:r.c,d:r.d}); }
    else { if(r.c<last.c) out.push({o:last.c,c:r.c,d:r.d}); else if(r.c>hi) out.push({o:last.o,c:r.c,d:r.d}); } }
  return out.filter(x=>x.o!==x.c); }

/* ---------- nhận diện mẫu nến (hàm thuần) ---------- */
function candleShape(r){ const body=Math.abs(r.c-r.o), range=Math.max(1e-9,r.h-r.l); return {body,range,up:r.c>r.o,upper:r.h-Math.max(r.o,r.c),lower:Math.min(r.o,r.c)-r.l,mid:(r.o+r.c)/2}; }
function detectPatterns(rows){
  const out=[]; const c=rows.map(r=>r.c); const m10=sma(c,10);
  const avgBody=sma(rows.map(r=>Math.abs(r.c-r.o)),14);
  const trend=i=>{ if(i<12||m10[i-1]==null||m10[i-6]==null) return 0; return rows[i-1].c<m10[i-1]&&m10[i-1]<m10[i-6]?-1: rows[i-1].c>m10[i-1]&&m10[i-1]>m10[i-6]?1:0; };
  for(let i=2;i<rows.length;i++){
    const a=candleShape(rows[i]), p=candleShape(rows[i-1]), q=candleShape(rows[i-2]); const ab=avgBody[i]||a.body||1e-9; const tr=trend(i);
    const r=rows[i], pr=rows[i-1], qr=rows[i-2];
    const add=(id,bias)=>out.push({i,id,bias});
    if(i>=2&&q.up===false&&q.body>ab*1.1&&p.body<ab*.5&&a.up&&a.body>ab*.8&&r.c>q.mid&&tr<=0){ add('morningstar',1); continue; }
    if(i>=2&&q.up&&q.body>ab*1.1&&p.body<ab*.5&&!a.up&&a.body>ab*.8&&r.c<q.mid&&tr>=0){ add('eveningstar',-1); continue; }
    if(a.up&&p.up&&q.up&&r.c>pr.c&&pr.c>qr.c&&r.o>pr.o&&r.o<pr.c&&pr.o>qr.o&&pr.o<qr.c&&a.body>ab*.7&&p.body>ab*.7&&q.body>ab*.7&&a.upper<a.body*.4){ add('soldiers',1); continue; }
    if(!a.up&&!p.up&&!q.up&&r.c<pr.c&&pr.c<qr.c&&r.o<pr.o&&r.o>pr.c&&pr.o<qr.o&&pr.o>qr.c&&a.body>ab*.7&&p.body>ab*.7&&q.body>ab*.7&&a.lower<a.body*.4){ add('crows',-1); continue; }
    if(a.up&&!p.up&&r.c>=pr.o&&r.o<=pr.c&&a.body>p.body*1.05&&p.body>ab*.3&&tr<=0){ add('bullengulf',1); continue; }
    if(!a.up&&p.up&&r.c<=pr.o&&r.o>=pr.c&&a.body>p.body*1.05&&p.body>ab*.3&&tr>=0){ add('bearengulf',-1); continue; }
    if(a.up&&!p.up&&p.body>ab*1.1&&r.o<pr.c&&r.c>p.mid&&r.c<pr.o&&tr<=0){ add('piercing',1); continue; }
    if(!a.up&&p.up&&p.body>ab*1.1&&r.o>pr.c&&r.c<p.mid&&r.c>pr.o&&tr>=0){ add('darkcloud',-1); continue; }
    if(!p.up&&p.body>ab*1.1&&a.body<p.body*.5&&Math.max(r.o,r.c)<=pr.o&&Math.min(r.o,r.c)>=pr.c&&tr<=0){ add('bullharami',1); continue; }
    if(p.up&&p.body>ab*1.1&&a.body<p.body*.5&&Math.max(r.o,r.c)<=pr.c&&Math.min(r.o,r.c)>=pr.o&&tr>=0){ add('bearharami',-1); continue; }
    if(a.lower>=2*a.body&&a.upper<=Math.max(a.body*.35,a.range*.08)&&a.body>a.range*.05){ if(tr<0) add('hammer',1); else if(tr>0) add('hangingman',-1); continue; }
    if(a.upper>=2*a.body&&a.lower<=Math.max(a.body*.35,a.range*.08)&&a.body>a.range*.05){ if(tr>0) add('shootingstar',-1); else if(tr<0) add('invhammer',1); continue; }
    if(a.body<=a.range*.08&&a.range>ab*.6){ if(a.lower>a.range*.65) add('dragonfly',tr<0?1:0); else if(a.upper>a.range*.65) add('gravestone',tr>0?-1:0); else add('doji',0); continue; }
  }
  return out;
}

/* ---------- tín hiệu kỹ thuật tổng hợp ---------- */
function techSummary(rows){
  const c=rows.map(r=>r.c), n=c.length-1; const s20=sma(c,20),s50=sma(c,50),s200=sma(c,200); const R=rsi(c,14), M=macd(c), B=bollinger(c), K=stochastic(rows), A=atr(rows);
  const sig=[]; const push=(name,val,b,txt)=>sig.push({name,val,b,txt});
  if(s50[n]!=null) push('Price vs MA50',sgn((c[n]/s50[n]-1)*100,1),c[n]>s50[n]?1:-1,c[n]>s50[n]?'Above the medium-term line':'Below the medium-term line');
  if(s200[n]!=null&&s50[n]!=null) push('MA50 vs MA200',s50[n]>s200[n]?'Golden cross':'Death cross',s50[n]>s200[n]?1:-1,s50[n]>s200[n]?'Long-term uptrend':'Long-term downtrend');
  else if(s20[n]!=null&&s50[n]!=null) push('MA20 vs MA50',s20[n]>s50[n]?'MA20 above':'MA20 below',s20[n]>s50[n]?1:-1,'Not enough data for MA200');
  if(R[n]!=null) push('RSI(14)',fmt(R[n],0),R[n]>70?-1:R[n]<30?1:R[n]>50?.5:-.5,R[n]>70?'Overbought — prone to pullback':R[n]<30?'Oversold — prone to rebound':R[n]>50?'Momentum leaning up':'Momentum leaning down');
  if(M.hist[n]!=null) push('MACD(12,26,9)',M.line[n]>M.sig[n]?'Above signal':'Below signal',M.line[n]>M.sig[n]?1:-1,(M.hist[n]>0)===(M.hist[n-1]>0)?(M.hist[n]>0?'Positive histogram':'Negative histogram'):'Just crossed');
  if(B.up[n]!=null){ const pb=(c[n]-B.dn[n])/(B.up[n]-B.dn[n]); push('Bollinger %B',fmt(pb*100,0)+'%',pb>1?-.5:pb<0?.5:0,pb>1?'Above upper band':pb<0?'Below lower band':'Inside bands'); }
  if(K.k[n]!=null&&K.d[n]!=null) push('Stochastic(14,3)',fmt(K.k[n],0),K.k[n]>80?-.5:K.k[n]<20?.5:K.k[n]>K.d[n]?.5:-.5,K.k[n]>80?'Overbought zone':K.k[n]<20?'Oversold zone':K.k[n]>K.d[n]?'%K above %D':'%K below %D');
  if(A[n]!=null) push('ATR(14)',pct(A[n]/c[n]*100,1),0,'Average daily range');
  const score=sig.reduce((a,b)=>a+b.b,0); const label= score>=2.5?'Strong bullish':score>=1?'Leaning bullish':score<=-2.5?'Strong bearish':score<=-1?'Leaning bearish':'Neutral';
  return {sig,score,label};
}

/* ---------- trạng thái & vẽ ---------- */
const CH={t:null,type:'candle',range:126,offset:0,ind:{ma20:true,ma50:true,ma200:false,ema20:false,bb:false,ichi:false,vol:true,rsi:true,macd:false,stoch:false,pat:true}};
try{ const sv0=store.chart; if(sv0){ CH.type=sv0.type||CH.type; CH.range=sv0.range||CH.range; Object.assign(CH.ind,sv0.ind||{}); } }catch(e){}
function saveChartPrefs(){ store.chart={type:CH.type,range:CH.range,ind:CH.ind}; persist(); }
const CHART_TYPES=[['candle','Candlestick'],['hollow','Hollow candles'],['heikin','Heikin-Ashi'],['ohlc','OHLC bars'],['line','Line'],['area','Area'],['renko','Renko'],['lb','3-line break']];
const IND_LIST=[['ma20','MA20','var(--us)'],['ma50','MA50','var(--gold)'],['ma200','MA200','var(--ceil)'],['ema20','EMA20','var(--floor)'],['bb','Bollinger','var(--mut)'],['ichi','Ichimoku','var(--up)'],['vol','Volume',''],['rsi','RSI',''],['macd','MACD',''],['stoch','Stochastic',''],['pat','Candle patterns','']];
let CHART_CACHE=null;

function buildChart(){
  const box=$('#chartBox'); if(!box) return;
  const W=Math.max(300,Math.round(box.clientWidth||340)); const mobile=W<560;
  const data=getOHLC(CH.t); const all=data.rows; const N=all.length;
  const timeBased=!['renko','lb'].includes(CH.type);
  const end=N-CH.offset, start=Math.max(0,end-CH.range);
  const cl=all.map(r=>r.c);
  /* chỉ báo tính trên toàn bộ chuỗi, cắt theo cửa sổ */
  const I={ma20:sma(cl,20),ma50:sma(cl,50),ma200:sma(cl,200),ema20:ema(cl,20)};
  const BB=bollinger(cl), IC=ichimoku(all), RS=rsi(cl,14), MC=macd(cl), ST=stochastic(all);
  let bars, x0=start;
  if(CH.type==='heikin') bars=heikinAshi(all).slice(start,end);
  else if(CH.type==='renko'){ const a=atr(all); const boxSz=(a[end-1]||cl[end-1]*.02); bars=renko(all.slice(start,end),boxSz).map(b=>({d:b.d,o:b.o,c:b.c,h:Math.max(b.o,b.c),l:Math.min(b.o,b.c)})); }
  else if(CH.type==='lb') bars=lineBreak(all.slice(start,end),3).map(b=>({d:b.d,o:b.o,c:b.c,h:Math.max(b.o,b.c),l:Math.min(b.o,b.c)}));
  else bars=all.slice(start,end);
  const n=bars.length;
  const pads={l:6,r:mobile?46:56,t:10};
  const panes=[{k:'main',h:mobile?250:320}];
  if(timeBased&&CH.ind.vol) panes.push({k:'vol',h:56});
  if(timeBased&&CH.ind.rsi) panes.push({k:'rsi',h:78});
  if(timeBased&&CH.ind.macd) panes.push({k:'macd',h:88});
  if(timeBased&&CH.ind.stoch) panes.push({k:'stoch',h:78});
  let y=pads.t; panes.forEach(p=>{ p.y=y; y+=p.h+14; }); const H=y+18;
  const iw=W-pads.l-pads.r; const step=iw/Math.max(1,n); const X=i=>pads.l+step*(i+.5);
  const bw=Math.max(1,Math.min(14,step*.68));
  let lo=Infinity,hi=-Infinity; bars.forEach(b=>{ lo=Math.min(lo,b.l); hi=Math.max(hi,b.h); });
  if(timeBased){ const consider=(arr)=>{ for(let i=start;i<end;i++){ const v=arr[i]; if(v!=null){ lo=Math.min(lo,v); hi=Math.max(hi,v); } } };
    if(CH.ind.ma20) consider(I.ma20); if(CH.ind.ma50) consider(I.ma50); if(CH.ind.ma200) consider(I.ma200); if(CH.ind.ema20) consider(I.ema20); if(CH.ind.bb){ consider(BB.up); consider(BB.dn); } if(CH.ind.ichi){ consider(IC.a); consider(IC.b); } }
  if(!isFinite(lo)){ lo=0; hi=1; } const padv=(hi-lo)*.06||1; lo-=padv; hi+=padv;
  const main=panes[0]; const Y=v=>main.y+main.h-(v-lo)/(hi-lo)*main.h;
  let g='';
  /* lưới & trục giá */
  const ticks=niceTicks(lo,hi,mobile?5:6);
  ticks.forEach(v=>{ g+=`<line class="grid-l" x1="${pads.l}" x2="${W-pads.r}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text x="${W-pads.r+5}" y="${(Y(v)+4).toFixed(1)}" style="font-size:10.5px">${fmtPx(v)}</text>`; });
  /* trục thời gian */
  if(n){ const every=Math.max(1,Math.round(n/(mobile?4:7))); let lastM='';
    for(let i=0;i<n;i+=every){ const d=bars[i].d||''; const lab=d? (timeBased? d.slice(8,10)+'/'+d.slice(5,7)+(d.slice(0,7)!==lastM&&i===0?'':'') : d.slice(5,7)+'/'+d.slice(2,4)) : ''; lastM=d.slice(0,7);
      g+=`<line class="grid-l" x1="${X(i).toFixed(1)}" x2="${X(i).toFixed(1)}" y1="${main.y}" y2="${H-18}" stroke-dasharray="2 4"/><text x="${X(i).toFixed(1)}" y="${H-5}" text-anchor="middle" style="font-size:10px">${lab}</text>`; } }
  /* Ichimoku mây */
  if(timeBased&&CH.ind.ichi){ let up='',dn=''; const pts=[]; for(let i=start;i<end;i++){ const a=IC.a[i],b=IC.b[i]; if(a!=null&&b!=null) pts.push([X(i-start),Y(a),Y(b),a>=b]); }
    for(let j=1;j<pts.length;j++){ const [x1,a1,b1,u1]=pts[j-1],[x2,a2,b2]=pts[j]; g+=`<path d="M${x1.toFixed(1)} ${a1.toFixed(1)} L${x2.toFixed(1)} ${a2.toFixed(1)} L${x2.toFixed(1)} ${b2.toFixed(1)} L${x1.toFixed(1)} ${b1.toFixed(1)}Z" style="fill:${u1?'var(--up)':'var(--dn)'};fill-opacity:.13"/>`; }
    g+=linePath(IC.ten,start,end,X,Y,'var(--floor)',1.1)+linePath(IC.kij,start,end,X,Y,'var(--dn)',1.1); }
  if(timeBased&&CH.ind.bb){ const pu=[],pd=[]; for(let i=start;i<end;i++){ if(BB.up[i]!=null){ pu.push(X(i-start).toFixed(1)+' '+Y(BB.up[i]).toFixed(1)); pd.unshift(X(i-start).toFixed(1)+' '+Y(BB.dn[i]).toFixed(1)); } }
    if(pu.length) g+=`<path d="M${pu.join(' L')} L${pd.join(' L')}Z" style="fill:var(--mut);fill-opacity:.09"/>`;
    g+=linePath(BB.up,start,end,X,Y,'var(--mut)',1)+linePath(BB.dn,start,end,X,Y,'var(--mut)',1)+linePath(BB.mid,start,end,X,Y,'var(--mut)',1,'3 3'); }
  /* nến / thanh / đường */
  const upC='var(--up)', dnC='var(--dn)';
  if(CH.type==='line'||CH.type==='area'){
    const d=bars.map((b,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(b.c).toFixed(1)).join(' ');
    if(CH.type==='area') g+=`<path d="${d} L${X(n-1).toFixed(1)} ${main.y+main.h} L${X(0).toFixed(1)} ${main.y+main.h}Z" style="fill:var(--gold);fill-opacity:.15"/>`;
    g+=`<path d="${d}" fill="none" style="stroke:var(--gold)" stroke-width="1.8" stroke-linejoin="round"/>`;
  } else if(CH.type==='ohlc'){
    bars.forEach((b,i)=>{ const col=b.c>=b.o?upC:dnC, x=X(i), t=Math.max(2,bw/2); g+=`<path d="M${x.toFixed(1)} ${Y(b.h).toFixed(1)} V${Y(b.l).toFixed(1)} M${(x-t).toFixed(1)} ${Y(b.o).toFixed(1)} H${x.toFixed(1)} M${x.toFixed(1)} ${Y(b.c).toFixed(1)} H${(x+t).toFixed(1)}" style="stroke:${col}" stroke-width="${step>5?1.4:1}"/>`; });
  } else {
    const wB= (CH.type==='renko'||CH.type==='lb')? Math.max(2,step*.92) : bw;
    bars.forEach((b,i)=>{ const up=b.c>=b.o, col=up?upC:dnC, x=X(i); const yt=Y(Math.max(b.o,b.c)), yb=Y(Math.min(b.o,b.c)); const bh=Math.max(1,yb-yt);
      if(CH.type!=='renko'&&CH.type!=='lb') g+=`<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${Y(b.h).toFixed(1)}" y2="${Y(b.l).toFixed(1)}" style="stroke:${col}" stroke-width="1"/>`;
      const hollow= CH.type==='hollow'&&up;
      g+=`<rect x="${(x-wB/2).toFixed(1)}" y="${yt.toFixed(1)}" width="${wB.toFixed(1)}" height="${bh.toFixed(1)}" style="fill:${hollow?'var(--s1)':col};stroke:${col}" stroke-width="${hollow?1.2:.6}"/>`; });
  }
  if(timeBased){ if(CH.ind.ma200) g+=linePath(I.ma200,start,end,X,Y,'var(--ceil)',1.5); if(CH.ind.ma50) g+=linePath(I.ma50,start,end,X,Y,'var(--gold)',1.5); if(CH.ind.ma20) g+=linePath(I.ma20,start,end,X,Y,'var(--us)',1.4); if(CH.ind.ema20) g+=linePath(I.ema20,start,end,X,Y,'var(--floor)',1.4,'5 3'); }
  /* mẫu nến */
  let pats=[];
  if(timeBased&&CH.ind.pat){ const base= CH.type==='heikin'? all : all; pats=detectPatterns(base).filter(p=>p.i>=start&&p.i<end&&p.id!=='doji');
    pats.forEach(p=>{ const b=all[p.i], x=X(p.i-start); const above=p.bias<0; const yy= above? Y(b.h)-8 : Y(b.l)+8; const col=p.bias>0?upC:p.bias<0?dnC:'var(--ref)';
      g+=`<path d="M${x.toFixed(1)} ${yy.toFixed(1)} l-4 ${above?-6:6} h8z" style="fill:${col}"/>`;
      if(n<=(mobile?70:140)) g+=`<text x="${x.toFixed(1)}" y="${(above?yy-9:yy+16).toFixed(1)}" text-anchor="middle" style="font-size:9px;font-weight:700;fill:${col}">${PATTERN_ABBR[p.id]||''}</text>`; }); }
  /* giá cuối */
  if(n){ const last=bars[n-1]; const ly=Y(last.c); const col=last.c>=last.o?upC:dnC; g+=`<line x1="${pads.l}" x2="${W-pads.r}" y1="${ly.toFixed(1)}" y2="${ly.toFixed(1)}" style="stroke:${col}" stroke-dasharray="2 3" stroke-width="1"/><rect x="${W-pads.r+1}" y="${(ly-9).toFixed(1)}" width="${pads.r-2}" height="18" rx="4" style="fill:${col}"/><text x="${W-pads.r+5}" y="${(ly+4).toFixed(1)}" style="font-size:10.5px;fill:#fff;font-weight:700">${fmtPx(last.c)}</text>`; }
  /* các khung phụ */
  panes.slice(1).forEach(p=>{
    g+=`<rect x="${pads.l}" y="${p.y}" width="${iw}" height="${p.h}" style="fill:none;stroke:var(--line)"/>`;
    const lbl=t=>`<text x="${pads.l+4}" y="${p.y+11}" class="lbl-strong" style="font-size:10px">${t}</text>`;
    if(p.k==='vol'){ let mx=0; bars.forEach(b=>mx=Math.max(mx,b.v||0)); const vs=sma(all.map(r=>r.v),20);
      bars.forEach((b,i)=>{ const h=(b.v||0)/(mx||1)*(p.h-4); g+=`<rect x="${(X(i)-bw/2).toFixed(1)}" y="${(p.y+p.h-h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" style="fill:${b.c>=b.o?upC:dnC};fill-opacity:.5"/>`; });
      g+=linePath(vs,start,end,X,v=>p.y+p.h-v/(mx||1)*(p.h-4),'var(--gold)',1.2)+lbl('Volume · MA20'); g+=`<text x="${W-pads.r+5}" y="${p.y+10}" style="font-size:10px">${fmtVol(mx)}</text>`; }
    if(p.k==='rsi'){ const Yr=v=>p.y+p.h-v/100*p.h; g+=`<rect x="${pads.l}" y="${Yr(70)}" width="${iw}" height="${Yr(30)-Yr(70)}" style="fill:var(--gold);fill-opacity:.06"/>`;
      [30,50,70].forEach(v=>g+=`<line x1="${pads.l}" x2="${W-pads.r}" y1="${Yr(v)}" y2="${Yr(v)}" style="stroke:var(--line2)" stroke-dasharray="${v===50?'2 4':'4 3'}"/><text x="${W-pads.r+5}" y="${Yr(v)+4}" style="font-size:10px">${v}</text>`);
      g+=linePath(RS,start,end,X,Yr,'var(--ceil)',1.5)+lbl('RSI(14) '+(RS[end-1]!=null?fmt(RS[end-1],0):'')); }
    if(p.k==='macd'){ let mx=1e-9; for(let i=start;i<end;i++){ [MC.line[i],MC.sig[i],MC.hist[i]].forEach(v=>{ if(v!=null) mx=Math.max(mx,Math.abs(v)); }); } const Ym=v=>p.y+p.h/2-v/mx*(p.h/2-4);
      for(let i=start;i<end;i++){ const h=MC.hist[i]; if(h==null) continue; g+=`<rect x="${(X(i-start)-bw/2).toFixed(1)}" y="${Math.min(Ym(0),Ym(h)).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.abs(Ym(h)-Ym(0)).toFixed(1)}" style="fill:${h>=0?upC:dnC};fill-opacity:.55"/>`; }
      g+=`<line x1="${pads.l}" x2="${W-pads.r}" y1="${Ym(0)}" y2="${Ym(0)}" style="stroke:var(--line2)"/>`+linePath(MC.line,start,end,X,Ym,'var(--us)',1.4)+linePath(MC.sig,start,end,X,Ym,'var(--gold)',1.4)+lbl('MACD(12,26,9)'); }
    if(p.k==='stoch'){ const Ys=v=>p.y+p.h-v/100*p.h; [20,80].forEach(v=>g+=`<line x1="${pads.l}" x2="${W-pads.r}" y1="${Ys(v)}" y2="${Ys(v)}" style="stroke:var(--line2)" stroke-dasharray="4 3"/><text x="${W-pads.r+5}" y="${Ys(v)+4}" style="font-size:10px">${v}</text>`);
      g+=linePath(ST.k,start,end,X,Ys,'var(--us)',1.4)+linePath(ST.d,start,end,X,Ys,'var(--gold)',1.4)+lbl('Stochastic %K/%D'); }
  });
  g+=`<g id="xh" pointer-events="none"></g><rect id="chartHit" x="${pads.l}" y="${main.y}" width="${iw}" height="${H-18-main.y}" fill="transparent" style="cursor:crosshair"/>`;
  box.innerHTML=`<svg class="chart" id="chartSvg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(CHART_TYPES.find(x=>x[0]===CH.type)[1])} chart of ${esc(CH.t)}">${g}</svg><div class="ch-tip" id="chTip" hidden></div>`;
  CHART_CACHE={bars,start,timeBased,X,Y,step,W,H,pads,main,all,pats,RS,MC};
  bindCrosshair();
  return {pats,real:data.real,rows:all};
}
function linePath(arr,start,end,X,Y,col,w,dash){ let d='', pen=false; for(let i=start;i<end;i++){ const v=arr[i]; if(v==null){ pen=false; continue; } d+=(pen?'L':'M')+X(i-start).toFixed(1)+' '+Y(v).toFixed(1)+' '; pen=true; } return d?`<path d="${d}" fill="none" style="stroke:${col}" stroke-width="${w}"${dash?` stroke-dasharray="${dash}"`:''} stroke-linejoin="round"/>`:''; }
function niceTicks(lo,hi,n){ const span=hi-lo; const raw=span/n; const mag=Math.pow(10,Math.floor(Math.log10(raw))); const st=[1,2,2.5,5,10].map(x=>x*mag).find(x=>x>=raw)||raw; const out=[]; for(let v=Math.ceil(lo/st)*st;v<=hi;v+=st) out.push(+v.toFixed(10)); return out; }
function fmtPx(v){ return Math.abs(v)>=1000? fmt(v,0) : Math.abs(v)>=100? fmt(v,1): fmt(v,2); }
function fmtVol(v){ return v>=1e9? fmt(v/1e9,1)+' bn': v>=1e6? fmt(v/1e6,1)+' M': v>=1e3? fmt(v/1e3,0)+' k' : fmt(v,0); }
function bindCrosshair(){
  const hit=$('#chartHit'), svg=$('#chartSvg'), tip=$('#chTip'); if(!hit||!CHART_CACHE) return;
  const C=CHART_CACHE;
  const move=e=>{ const rect=svg.getBoundingClientRect(); const sx=C.W/rect.width; const px=(e.clientX-rect.left)*sx, py=(e.clientY-rect.top)*sx;
    let i=Math.floor((px-C.pads.l)/C.step); i=clamp(i,0,C.bars.length-1); const b=C.bars[i]; if(!b) return; const x=C.X(i);
    $('#xh').innerHTML=`<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${C.main.y}" y2="${C.H-18}" style="stroke:var(--fg)" stroke-opacity=".45" stroke-dasharray="3 3"/>${py>=C.main.y&&py<=C.main.y+C.main.h?`<line x1="${C.pads.l}" x2="${C.W-C.pads.r}" y1="${py.toFixed(1)}" y2="${py.toFixed(1)}" style="stroke:var(--fg)" stroke-opacity=".3" stroke-dasharray="3 3"/>`:''}<circle cx="${x.toFixed(1)}" cy="${C.Y(b.c).toFixed(1)}" r="3.5" style="fill:var(--fg)"/>`;
    const prev= i>0? C.bars[i-1].c : b.o; const ch=(b.c/prev-1)*100; const gi=C.start+i;
    const pat= C.timeBased? C.pats.find(p=>p.i===gi) : null;
    tip.innerHTML=`<b>${esc(fmtDate(b.d))}</b><span>Open <b>${fmtPx(b.o)}</b> · High <b>${fmtPx(b.h)}</b></span><span>Low <b>${fmtPx(b.l)}</b> · Close <b>${fmtPx(b.c)}</b> <b class="${ch>=0?'up':'dn'}">${ch>=0?'▲':'▼'}${fmt(Math.abs(ch),2)}%</b></span>${C.timeBased&&b.v?`<span>Vol ${fmtVol(b.v)}${C.RS[gi]!=null?' · RSI '+fmt(C.RS[gi],0):''}</span>`:''}${pat?`<span style="color:${pat.bias>0?'var(--up)':pat.bias<0?'var(--dn)':'var(--ref)'}">◆ ${esc(PATTERN_NAME[pat.id]||pat.id)}</span>`:''}`;
    tip.hidden=false; const tw=tip.offsetWidth; const left=(x/sx>rect.width/2)? x/sx-tw-12 : x/sx+12; tip.style.left=clamp(left,4,rect.width-tw-4)+'px'; tip.style.top='8px'; };
  const leave=()=>{ $('#xh').innerHTML=''; tip.hidden=true; };
  hit.addEventListener('pointermove',move); hit.addEventListener('pointerdown',move); hit.addEventListener('pointerleave',e=>{ if(e.pointerType==='mouse') leave(); });
}
function fmtDate(d){ if(!d) return ''; return d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4); }

/* ---------- màn hình Biểu đồ ---------- */
RENDER.chart=function(){
  const el=$('#v-chart'); const L=ranked();
  const okT=t=>!!t&&(BY[t]||(String(t).startsWith('E:')&&EBY[t.slice(2)]));
  if(!okT(CH.t)) CH.t=(L[0]||U[0]).t;
  const isE=CH.t.startsWith('E:'); if(isE) ensureHist(CH.t.slice(2),true); else ensureHist(CH.t,false);
  const s=isE?etfPseudo(CH.t.slice(2)):BY[CH.t]; const data=getOHLC(CH.t); const rows=data.rows; const N=rows.length;
  const last=rows[N-1], prev=rows[N-2]||last; const ch1=(last.c/prev.c-1)*100; const i252=Math.max(0,N-253); const ch12=(last.c/rows[i252].c-1)*100; const spanTxt= N>=250?'12 months':Math.round(N/21)+' months';
  const ts=techSummary(rows);
  const og=(lab,arr)=>`<optgroup label="${esc(lab)}">${arr.map(x=>`<option value="${esc(x.v)}" ${x.v===CH.t?'selected':''}>${esc(x.l)}</option>`).join('')}</optgroup>`;
  const srt=(m)=>U.filter(x=>x.m===m).sort((a,b)=>a.t.localeCompare(b.t)).map(x=>({v:x.t,l:x.t+' — '+x.n}));
  const opts=og('US stocks',srt('US'))+og('Vietnam stocks',srt('VN'))+og('US ETFs',ETFS.slice().sort((a,b)=>a.t.localeCompare(b.t)).map(e=>({v:'E:'+e.t,l:e.t+' — '+e.n})));
  const ranges=[[22,'1M'],[66,'3M'],[126,'6M'],[252,'1Y'],[504,'2Y'],[99999,'All']];
  el.innerHTML=`
  <div class="sec-h" style="margin:0"><div><h2>Technical chart</h2><p>8 chart types · 10 indicators · automatic candlestick pattern detection</p></div><button class="btn sm" data-lesson="cdl-library">Candlestick pattern library</button></div>
  <section class="panel" style="display:flex;flex-direction:column;gap:12px">
    <div class="ch-head">
      <label class="field" style="flex:1 1 220px"><span class="sr">Choose a ticker</span><select id="chT">${opts}</select></label>
      <div class="ch-quote"><b style="font-family:var(--f-disp);font-size:26px">${fmtPx(last.c)}</b><span class="${ch1>=0?'up':'dn'}" style="font-weight:700">${ch1>=0?'▲':'▼'} ${fmt(Math.abs(ch1),2)}%</span><span class="mut" style="font-size:12px">${spanTxt} ${sgn(ch12,1)}</span></div>
    </div>
    <div class="disc" style="padding:7px 10px;${data.real?'border-color:var(--up)':''}">${data.real?`<b class="up">${data.src==='live'?'Real prices':'Your imported data'}</b> · ${N} sessions, ${esc(fmtDate(rows[0].d))} – ${esc(fmtDate(last.d))}${data.src==='live'?' · source '+esc(data.from||'stockanalysis.com')+', updated after each session'+(data.flat?`; the latest ${data.flat} sessions have closing prices only (flat candles); full candles are filled in as data refreshes in rotation`:'')+'.':'.'}`:`<b style="color:var(--gold)">Illustrative simulated prices</b> — ${data.closeOnly?'this ticker has fewer than 20 sessions of real prices (history is being filled in gradually), so for now this uses a ':'a '}simulated price series: index 100 = 12 months ago, matching the 12-month return of ${sgn(s.mo,0)} and beta-based volatility. Not real prices; import a CSV below to use real data.`}</div>
    <div class="chips" role="group" aria-label="Chart type">${CHART_TYPES.map(([k,n])=>`<button class="chip ${CH.type===k?'on':''}" data-ct="${k}" aria-pressed="${CH.type===k}">${n}</button>`).join('')}</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
      <div class="seg" role="group" aria-label="Time range" id="chRange">${ranges.map(([v,n])=>`<button data-rg="${v}" aria-pressed="${CH.range===v}">${n}</button>`).join('')}</div>
      ${N>CH.range?`<label class="field" style="flex:1 1 160px;flex-direction:row;align-items:center;gap:8px"><span style="white-space:nowrap">Scroll back in time</span><input type="range" id="chOff" min="0" max="${Math.max(0,N-Math.min(CH.range,N))}" step="1" value="${CH.offset}" style="flex:1"></label>`:''}
    </div>
    <div class="chips ind" role="group" aria-label="Indicators">${IND_LIST.map(([k,n,c])=>`<button class="chip ${CH.ind[k]?'on':''}" data-ind="${k}" aria-pressed="${!!CH.ind[k]}">${c?`<i style="display:inline-block;width:10px;height:3px;border-radius:2px;background:${c}"></i>`:''}${n}</button>`).join('')}</div>
    <div class="chart-wrap"><div id="chartBox"></div></div>
    <p class="note" id="chNote"></p>
  </section>
  <div class="grid2">
    <section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Technical signals</h2><p>Rule results at the last session, not a forecast</p></div><span class="grade ${ts.score>=1?'g-A':ts.score<=-1?'g-D':'g-C'}" style="font-size:13px;padding:4px 10px">${ts.label}</span></div>
      <div class="tsig">${ts.sig.map(x=>`<div><span>${esc(x.name)}</span><b>${esc(x.val)}</b><i class="${x.b>0?'up':x.b<0?'dn':'mut'}">${x.b>0?'▲':x.b<0?'▼':'■'} ${esc(x.txt)}</i></div>`).join('')}</div>
      <div class="ts-meter" aria-label="Composite gauge"><span style="left:${clamp((ts.score+5)/10*100,2,98)}%"></span></div><div style="display:flex;justify-content:space-between" class="note"><span>Strong bearish</span><span>Neutral</span><span>Strong bullish</span></div>
    </section>
    <section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Detected candle patterns</h2><p id="patCount"></p></div></div><div id="patList" class="pat-list"></div></section>
    <section class="panel span2"><div class="sec-h"><div><h2 style="font-size:17px">Real price data</h2><p>Paste or choose a CSV file exported from a brokerage app, Yahoo Finance, Investing…</p></div></div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <textarea id="csvIn" class="inp" style="min-height:96px;padding:10px 12px;font-size:13px;font-family:ui-monospace,Menlo,monospace" placeholder="Date,Open,High,Low,Close,Volume&#10;2026-10-14,27350,27800,27100,27650,1830000&#10;…"></textarea>
        <div class="row-btns"><button class="btn pri" id="csvLoad">Use this data for ${esc(CH.t.replace('E:',''))}</button><label class="btn" style="cursor:pointer">Choose CSV file<input type="file" id="csvFile" accept=".csv,.txt,text/csv" hidden></label>${data.src==='csv'?`<button class="btn ghost" id="csvClear" style="color:var(--dn)">Clear imported data, back to simulation</button>`:''}</div>
        <p class="note" id="csvMsg">Accepts dates as yyyy-mm-dd or dd/mm/yyyy, separated by commas, semicolons or tabs. Data is stored in this browser, up to 1,500 sessions per ticker.</p>
      </div></section>
  </div>
  <p class="note">${esc(DISC)} Technical analysis describes past price behavior; signals can be wrong, especially in sideways markets.</p>`;
  const res=buildChart(); $('#chartBox').dataset.real=data.real?'1':'';
  const typeName=CHART_TYPES.find(x=>x[0]===CH.type)[1];
  $('#chNote').innerHTML= CH.type==='renko'?`Renko: each brick = 1 ATR(14) ≈ ${fmtPx(atr(rows)[N-1]||0)}; the horizontal axis counts bricks, not time. Indicators and candle patterns are off in this view.`
    : CH.type==='lb'?'3-line break: a new bar appears only when the close breaks the high/low of the last 3 bars; the horizontal axis is not time-based.'
    : CH.type==='heikin'?'Heikin-Ashi smooths candles to show the trend; prices on the candles are not actual traded prices. Candle patterns are detected on the original candles.'
    : `Tap or hover over the chart to see each session\'s prices. ${typeName}.`;
  const pats=(res&&res.pats)||[]; $('#patCount').textContent= CH.ind.pat? (CH.type==='renko'||CH.type==='lb'? 'Not applicable to this chart type' : `${pats.length} patterns in the current view`) : 'Turn on “Candle patterns” to detect them';
  $('#patList').innerHTML= pats.length? pats.slice().reverse().slice(0,12).map(p=>`<button class="pk" data-cdl="${p.id}"><b style="font-size:12px">${esc(fmtDate(rows[p.i].d).slice(0,5))}</b><span style="text-align:left;font-size:13px">${esc(PATTERN_NAME[p.id]||p.id)}</span><span class="grade ${p.bias>0?'g-A':p.bias<0?'g-D':'g-C'}">${p.bias>0?'Bullish':p.bias<0?'Bearish':'Indecision'}</span></button>`).join('') : '<div class="empty" style="padding:14px">No clear candle patterns in this view.</div>';
  $('#chT').onchange=e=>{ CH.t=e.target.value; CH.offset=0; RENDER.chart(); };
  $$('[data-ct]',el).forEach(b=>b.onclick=()=>{ CH.type=b.dataset.ct; saveChartPrefs(); RENDER.chart(); });
  $$('#chRange button').forEach(b=>b.onclick=()=>{ CH.range=+b.dataset.rg; CH.offset=0; saveChartPrefs(); RENDER.chart(); });
  $$('[data-ind]',el).forEach(b=>b.onclick=()=>{ const k=b.dataset.ind; CH.ind[k]=!CH.ind[k]; saveChartPrefs(); RENDER.chart(); });
  const off=$('#chOff'); if(off){ let tm; off.oninput=()=>{ CH.offset=+off.value; clearTimeout(tm); tm=setTimeout(()=>{ const r=buildChart(); },30); }; off.onchange=()=>RENDER.chart(); }
  const load=txt=>{ const r=parseOHLCcsv(txt); if(r.err){ $('#csvMsg').innerHTML=`<span class="dn">${esc(r.err)}</span>`; return; } saveOHLC(CH.t,r.rows); CH.offset=0; toast(`Loaded ${r.rows.length} sessions for ${CH.t}`); RENDER.chart(); };
  $('#csvLoad').onclick=()=>load($('#csvIn').value);
  $('#csvFile').onchange=e=>{ const f=e.target.files&&e.target.files[0]; if(!f) return; if(f.size>3e6){ $('#csvMsg').innerHTML='<span class="dn">File is larger than 3 MB.</span>'; return; } const rd=new FileReader(); rd.onload=()=>load(rd.result); rd.readAsText(f); };
  const clr=$('#csvClear'); if(clr) clr.onclick=()=>{ if(store.ohlc) delete store.ohlc[CH.t]; persist(); CH.offset=0; toast('Switched back to simulated data'); RENDER.chart(); };
};
let chartResizeT; window.addEventListener('resize',()=>{ clearTimeout(chartResizeT); chartResizeT=setTimeout(()=>{ if(S.view==='chart') buildChart(); },150); });

function etfPseudo(t){ const e=EBY[t]||{t}; return {t:'E:'+t,tk:t,n:e.n||t,m:'US',ex:'ETF',b:isNum(e.b)?e.b:Math.abs(e.lev||1),mo:e.r1y,etf:1}; }
