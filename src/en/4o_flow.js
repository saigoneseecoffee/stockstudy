/* ---------- dòng tiền & tâm lý thị trường Mỹ (đọc meta/flow) ----------
   Tài liệu: {upd, items:[{k, v, p, d, src:{n,u}, x?}]}; v = giá trị mới nhất, p = kỳ trước.
   Mỗi chỉ báo được quy về thang z; vượt ngưỡng a là vùng sợ hãi, vượt ngưỡng b là vùng hưng phấn. */
const FLOW_DEF={
  fg:    {z:o=>o.v,               lo:0,   hi:100, a:45,  b:55,  up:false, d:0, u:''},
  vix:   {z:o=>o.v,               lo:10,  hi:45,  a:20,  b:15,  up:true,  d:2, u:''},
  aaii:  {z:o=>o.v,               lo:15,  hi:65,  a:40,  b:25,  up:true,  d:1, u:'%'},
  fms:   {z:o=>o.v,               lo:3,   hi:6.5, a:5,   b:4,   up:true,  d:1, u:'%'},
  mmf:   {z:o=>isNum(o.p)?o.v-o.p:null,        lo:-120, hi:120, a:40, b:-40, up:true,  d:0, u:'B'},
  margin:{z:o=>isNum(o.p)&&o.p?(o.v-o.p)/o.p*100:null, lo:-8, hi:8, a:-2, b:2, up:false, d:1, u:'%'}
};
const FLOW_ORDER=['fg','vix','aaii','fms','mmf','margin'];
function flowZone(k,o){
  const D=FLOW_DEF[k], z=D.z(o); if(!isNum(z)) return {z:null,c:'mid'};
  if(D.up) return {z,c:z>=D.a?'fear':z<=D.b?'greed':'mid'};
  return {z,c:z<=D.a?'fear':z>=D.b?'greed':'mid'};
}
function flowVal(k,v){
  const D=FLOW_DEF[k]; if(!isNum(v)) return '—';
  if(k==='mmf') return '$'+fmt(v/1000,2)+T_FL.tr;
  if(k==='margin') return '$'+fmt(v/1000,2)+T_FL.tr;
  return fmt(v,D.d)+D.u;
}
function flowChg(k,o){
  if(!isNum(o.p)) return '';
  const d=o.v-o.p; if(!d) return T_FL.flat;
  const ar=d>0?'▲':'▼';
  if(k==='mmf') return `${ar} ${d>0?'+':'−'}$${fmt(Math.abs(d),1)}${T_FL.bn} ${T_FL.vs}`;
  if(k==='margin') return `${ar} ${d>0?'+':'−'}${fmt(Math.abs(d/o.p*100),1)}% ${T_FL.vs}`;
  return `${ar} ${d>0?'+':'−'}${fmt(Math.abs(d),FLOW_DEF[k].d)}${k==='fg'||k==='vix'?'':' '+T_FL.pt} ${T_FL.vs} (${flowVal(k,o.p)})`;
}
function flowBar(k,z){
  const D=FLOW_DEF[k]; const pos=v=>Math.max(0,Math.min(100,(v-D.lo)/(D.hi-D.lo)*100));
  const pa=pos(D.a), pb=pos(D.b); const lo=Math.min(pa,pb), hi=Math.max(pa,pb);
  const fearLeft=!D.up;
  const L=fearLeft?'fear':'greed', R=fearLeft?'greed':'fear';
  return `<div class="fl-bar" aria-hidden="true"><i class="${L}" style="left:0;width:${lo}%"></i><i class="mid" style="left:${lo}%;width:${hi-lo}%"></i><i class="${R}" style="left:${hi}%;width:${100-hi}%"></i>${isNum(z)?`<b style="left:${pos(z)}%"></b>`:''}</div>
    <div class="fl-ax"><span>${T_FL.zn[L]}</span><span>${T_FL.zn[R]}</span></div>`;
}
function flowHomeHTML(){
  if(S.market==='VN') return '';
  const F=LIVE.flow&&LIVE.flow.items; if(!F||!F.length) return '';
  const by={}; F.forEach(o=>{ if(o&&FLOW_DEF[o.k]&&isNum(o.v)) by[o.k]=o; });
  const ks=FLOW_ORDER.filter(k=>by[k]); if(!ks.length) return '';
  const Z=ks.map(k=>flowZone(k,by[k]));
  const nf=Z.filter(x=>x.c==='fear').length, ng=Z.filter(x=>x.c==='greed').length;
  const verdict=nf>=Math.ceil(ks.length/2)?T_FL.vf:ng>=Math.ceil(ks.length/2)?T_FL.vg:T_FL.vm;
  const day=s=>esc(String(s||'').slice(0,10).split('-').reverse().join('/'));
  return `<section class="panel flow" aria-labelledby="h-flow"><div class="sec-h"><div><h2 id="h-flow">${T_FL.h}</h2><p>${T_FL.sub.replace('{d}',day(LIVE.flow.upd))}</p></div></div>
    <div class="fl-sum"><span class="chip fl-c fear">${T_FL.zn.fear} ${nf}</span><span class="chip fl-c mid">${T_FL.zn.mid} ${ks.length-nf-ng}</span><span class="chip fl-c greed">${T_FL.zn.greed} ${ng}</span><p>${verdict}</p></div>
    <div class="fl-g">${ks.map((k,i)=>{ const o=by[k], zz=Z[i];
      return `<article class="fl-i"><div class="fl-h"><h3>${T_FL.n[k]}</h3><span class="chip fl-c ${zz.c}">${T_FL.zn[zz.c]}</span></div>
        <div class="fl-v"><b>${flowVal(k,o.v)}</b><span>${esc(flowChg(k,o))}</span></div>
        ${flowBar(k,zz.z)}
        <p>${T_FL.m[k]}</p>
        <div class="news-f"><span>${day(o.d)} · ${T_FL.fq[k]}</span>${o.src&&o.src.u?`<a href="${esc(o.src.u)}" target="_blank" rel="noopener">${esc(o.src.n||'')} ↗</a>`:''}</div></article>`; }).join('')}</div>
    <p class="note">${T_FL.cav}</p></section>`;
}
const T_FL={h:'Cash flows & sentiment (US)',sub:'Are investors hoarding cash or putting it into stocks · updated {d}',
tr:'T',bn:'B',pt:'pts',vs:'vs prior',flat:'Unchanged vs prior',
zn:{fear:'Fear',mid:'Neutral',greed:'Greed'},
n:{fg:'Fear & Greed Index (CNN)',vix:'VIX volatility index',aaii:'Bearish individual investors (AAII)',fms:'Fund manager cash (BofA)',mmf:'Money market fund assets',margin:'Margin debt (FINRA)'},
fq:{fg:'daily',vix:'daily',aaii:'weekly',fms:'monthly',mmf:'weekly',margin:'monthly'},
m:{fg:'Combines 7 market signals on a 0–100 scale. Below 25 is extreme fear, above 75 extreme greed.',
vix:'Volatility the options market expects for the S&P 500 over the next 30 days. Above 20 signals worry, above 30 panic.',
aaii:'Share of US individual investors who expect stocks to fall over the next 6 months. The historical average is about 31.5%.',
fms:'Average cash share in global fund portfolios. 5% or more means funds are defensive (often a contrarian buy signal); 4% or less means they are almost fully in risk assets.',
mmf:'Cash parked in money market funds. The bar measures the weekly change: strong inflows mean investors are seeking shelter. High interest rates make total assets drift up even in calm markets, so watch the direction of change.',
margin:'Money investors borrow to buy securities. The bar measures the change vs the prior month: falling debt means deleveraging, rising debt means strong risk appetite.'},
vf:'Most indicators are in fear: investors are cautious and favor cash. Historically, extreme fear often appears near short-term bottoms, but it does not pinpoint timing.',
vg:'Most indicators are in greed: money is pouring into stocks with little cash cushion. Markets are often more vulnerable to bad news at such times.',
vm:'The indicators disagree: no clear trend of investors pulling money out of or pouring it into stocks.',
cav:'Each indicator has a different frequency and lag (daily, weekly, monthly), so read them together rather than relying on one number. These measure sentiment; they are not buy or sell signals.'};
