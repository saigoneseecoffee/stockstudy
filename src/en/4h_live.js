/* ============================================================
   GIÁ THỊ TRƯỜNG — đọc từ cơ sở dữ liệu của trang, do tác vụ hẹn giờ ghi sau mỗi phiên
   snap/US, snap/VN, snap/ETF: {d, dates:[25 phiên], q:{MÃ:[giá, %thay đổi, vốn hóa]}, c:{MÃ:[25 giá đóng cửa]}}
   snap/IDX: {q:{"IDX.SPX":{px,pct,chg,o,h,l,d,hist}}}
   hist/<US.AAPL | VN.FPT | E.SPY>: {d, bars:[[ngày,mở,cao,thấp,đóng,KL]], src, adjWarn}  — tải khi cần
   fund/US, fund/VN, fund/ETF: {upd, keys:[...], rows:{MÃ:[...]}} — chỉ số cơ bản mới hơn bản nhúng
   meta/feed: {upd, usDate, vnDate, ok, failed, note}
   ============================================================ */
const LIVE={q:{},e:{},snap:{},hist:{},histReq:{},meta:null,status:'init',db:null};
const IDX_NAME={'IDX.VNINDEX':'VN-Index','IDX.VN30':'VN30','IDX.SPX':'S&P 500','IDX.IXIC':'Nasdaq','IDX.DJI':'Dow Jones'};
function liveQ(t){ return LIVE.q[t]||null; }
function liveE(t){ return LIVE.e[t]||null; }
/* chỉ số định giá điều chỉnh theo giá mới: P/E, P/B, P/S tỷ lệ thuận với giá; tỷ suất cổ tức, FCF tỷ lệ nghịch */
function liveFund(s){
  const q=LIVE.q[s.t]; if(!q||!isNum(q.px)) return {};
  const o={};
  if(isNum(q.cap)&&q.cap>0) o.cap=q.cap;
  if(isNum(s.pxf)&&s.pxf>0){
    const r=q.px/s.pxf;
    if(r>0.2&&r<5){
      ['pe','fpe','pb','ps'].forEach(k=>{ if(isNum(s[k])) o[k]=+(s[k]*r).toFixed(2); });
      ['dy','fcf'].forEach(k=>{ if(isNum(s[k])) o[k]=+(s[k]/r).toFixed(2); });
      if(isNum(s.ev)) o.ev=+(s.ev*(0.35+0.65*r)).toFixed(1); /* EV gồm cả nợ ròng — điều chỉnh xấp xỉ */
    }
  }
  if(Object.keys(o).length) o._liveFund=1; return o;
}
function latestDate(m){ const sn=LIVE.snap[m]; return sn&&sn.d||''; }
function isStale(q){ return !!q&&!!q.d&&!!latestDate(q.mk)&&q.d<latestDate(q.mk); }
function fmtLivePx(q){ if(!q||!isNum(q.px)) return '—'; const idx=String(q.t).startsWith('IDX'); return q.m==='US'? (idx?fmt(q.px,2):'$'+fmt(q.px,2)) : (idx?fmt(q.px,2):fmt(q.px,0)); }
function boardClass(q){
  if(!q||!isNum(q.pct)) return 'mut';
  const s=BY[q.t];
  if(q.m==='VN'&&s&&isNum(q.ref)&&!String(q.t).startsWith('IDX')){ const b=priceBand(q.ref,s.ex==='HNX'?'HNX':s.ex==='UPCOM'?'UPCOM':'HOSE'); if(q.px>=b.ceil) return 'ceil'; if(q.px<=b.floor) return 'floor'; }
  if(Math.abs(q.pct)<0.005) return 'ref'; return q.pct>0?'up':'dn';
}
function pctTxt(q){ if(!q||!isNum(q.pct)) return '—'; return (q.pct>0?'▲':q.pct<0?'▼':'■')+' '+fmt(Math.abs(q.pct),2)+'%'; }
function pxChip(t,opt){
  const etf=!!(opt&&opt.etf); const q=etf?liveE(t):liveQ(t); if(!q) return ''; const c=boardClass(q);
  return `<span class="lpx ${c}" data-px="${esc(t)}"${etf?' data-pxe="1"':''}>${fmtLivePx(q)} <small>${pctTxt(q)}</small>${isStale(q)?` <small class="mut">(${esc(q.d.slice(8,10)+'/'+q.d.slice(5,7))})</small>`:''}</span>`;
}
function seriesOf(q){ if(!q) return []; if(q.hist&&q.hist.length) return q.hist.map(b=>b[4]); return (q.cl||[]).filter(isNum); }
function sparkSVG(src,w,h){
  const raw=Array.isArray(src)?src:seriesOf(src);
  const c=raw.map(b=>Array.isArray(b)?b[4]:b).filter(isNum).slice(-60); if(c.length<2) return '';
  const lo=Math.min(...c),hi=Math.max(...c); const X=i=>i/(c.length-1)*w, Y=v=>h-2-(v-lo)/((hi-lo)||1)*(h-4);
  const up=c[c.length-1]>=c[0];
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" style="display:block"><path d="${c.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join(' ')}" fill="none" style="stroke:${up?'var(--up)':'var(--dn)'}" stroke-width="1.5"/></svg>`;
}
function feedTimeText(){
  const m=LIVE.meta; const vn=latestDate('VN'), us=latestDate('US');
  const f=d=>d?d.slice(8,10)+'/'+d.slice(5,7):'—';
  return `VN session ${f(vn)} · US ${f(us)}${m&&m.upd?' · updated '+esc(new Date(m.upd).toLocaleString('en-US',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})):''}`;
}
/* ---------- dựng bản ghi giá từ ảnh chụp + lịch sử ---------- */
function stockHid(s){ return s? s.m+'.'+(s.tk||s.t) : null; }
function mergeBars(bars,dates,cl){
  const out=(bars||[]).filter(b=>Array.isArray(b)&&b[0]&&isNum(b[4])).slice().sort((a,b)=>a[0]<b[0]?-1:1);
  const last=out.length?out[out.length-1][0]:'';
  (dates||[]).forEach((d,i)=>{ const c=cl&&cl[i]; if(d>last&&isNum(c)) out.push([d,c,c,c,c,null,1]); });
  return out;
}
function buildQ(id,raw,mk,row,sn,etf){
  const px=row[0], pct=row[1];
  const q={t:id,m:mk,mk:etf?'ETF':mk,px,pct,d:(row[3]||sn.d),cap:isNum(row[2])?row[2]:null};
  if(isNum(px)&&isNum(pct)){ q.ref=px/(1+pct/100); q.chg=px-q.ref; }
  q.cl=(sn.c&&sn.c[raw])||[]; q.dates=sn.dates||[];
  const hid= etf? 'E.'+raw : mk+'.'+raw; q.hid=hid;
  const hd=LIVE.hist[hid];
  if(hd){ q.hist=mergeBars(hd.bars,q.dates,q.cl); q.src=hd.src; q.adjWarn=hd.adjWarn||null; q.histKind='ohlc'; }
  else { q.hist=mergeBars([],q.dates,q.cl); q.histKind='close'; }
  const lb=q.hist[q.hist.length-1];
  if(lb&&lb[0]===q.d&&!lb[6]){ q.o=lb[1]; q.h=lb[2]; q.l=lb[3]; q.v=lb[5]; }
  return q;
}
function rebuildLive(){
  const q={}, e={};
  ['US','VN'].forEach(mk=>{
    const sn=LIVE.snap[mk]; if(!sn||!sn.q) return;
    Object.keys(sn.q).forEach(raw=>{ const row=sn.q[raw]; if(!Array.isArray(row)||!isNum(row[0])||row[0]<=0) return; const id= mk==='VN'? vnId(raw) : raw; q[id]=buildQ(id,raw,mk,row,sn,false); });
  });
  const se=LIVE.snap.ETF;
  if(se&&se.q) Object.keys(se.q).forEach(t=>{ const row=se.q[t]; if(!Array.isArray(row)||!isNum(row[0])||row[0]<=0) return; e[t]=buildQ(t,t,'US',row,se,true); });
  const si=LIVE.snap.IDX;
  if(si&&si.q) Object.keys(si.q).forEach(t=>{ const v=si.q[t]; if(v&&isNum(v.px)){ const mk=(t==='IDX.VNINDEX'||t==='IDX.VN30')?'VN':'US'; q[t]=Object.assign({},v,{t,m:mk,mk}); } });
  LIVE.q=q; LIVE.e=e;
  LIVE.status=(Object.keys(q).length||Object.keys(e).length)?'ok':'empty';
}
/* lịch sử nến lưu theo gói 40 mã: hist/US-0..12, hist/VN-0..12, hist/E-0..4 (thứ tự theo danh sách nhúng) */
const HCHUNK=40;
const CHUNK_OF={};
UNI_US.forEach((r,i)=>CHUNK_OF['US.'+r[0]]='US-'+Math.floor(i/HCHUNK));
UNI_VN.forEach((r,i)=>CHUNK_OF['VN.'+r[0]]='VN-'+Math.floor(i/HCHUNK));
ETF_UNI.forEach((r,i)=>CHUNK_OF['E.'+r[0]]='E-'+Math.floor(i/HCHUNK));
function ensureHist(id,etf){
  const db=LIVE.db; if(!db) return;
  const hid= etf? 'E.'+id : stockHid(BY[id]||STOCKS.find(x=>x.t===id)); if(!hid) return;
  const ck=CHUNK_OF[hid]; if(!ck||LIVE.histReq[ck]) return;
  LIVE.histReq[ck]=1;
  try{
    db.doc('hist/'+ck).get().then(s=>{
      if(!s||!s.exists) return; const v=s.data(); if(!v||!v.bars) return;
      const pre=ck.split('-')[0]==='E'?'E.':ck.split('-')[0]+'.';
      Object.keys(v.bars).forEach(t=>{ const b=v.bars[t]; if(Array.isArray(b)&&b.length) LIVE.hist[pre+t]={bars:b,src:(v.src&&v.src[t])||v.srcAll||'stockanalysis.com',adjWarn:v.adj&&v.adj[t]||null}; });
      rebuildLive(); liveChanged(false,{hist:etf?'E:'+id:id});
    }).catch(()=>{ LIVE.histReq[ck]=0; });
  }catch(e){}
}
/* ---------- bảng thị trường trên trang chủ ---------- */
function marketPanelHTML(){
  if(LIVE.status==='off') return `<section class="panel live-panel"><div class="sec-h" style="margin:0"><div><h2 style="font-size:18px">Market</h2><p>Daily prices only appear when the app is opened in Claude (signed in).</p></div></div></section>`;
  if(LIVE.status==='init') return `<section class="panel live-panel"><div class="sec-h" style="margin:0"><div><h2 style="font-size:18px">Market</h2><p>Loading prices…</p></div></div></section>`;
  if(LIVE.status==='empty') return `<section class="panel live-panel"><div class="sec-h" style="margin:0"><div><h2 style="font-size:18px">Market</h2><p>No price data yet. The automatic update runs after each session.</p></div></div></section>`;
  const idx=(S.market==='VN'?['IDX.VNINDEX','IDX.VN30']:S.market==='US'?['IDX.SPX','IDX.IXIC','IDX.DJI']:['IDX.VNINDEX','IDX.VN30','IDX.SPX','IDX.IXIC','IDX.DJI']).filter(t=>LIVE.q[t]);
  const inM=inMarket(U).filter(s=>LIVE.q[s.t]);
  const stars=S.stars.filter(t=>BY[t]&&LIVE.q[t]&&(S.market==='ALL'||BY[t].m===S.market));
  const rows=(stars.length?stars.map(t=>BY[t]).slice(0,20):inM.slice().sort((a,b)=>capUSD(b)-capUSD(a)).slice(0,10));
  const fresh=inM.filter(s=>!isStale(LIVE.q[s.t])&&isNum(LIVE.q[s.t].pct));
  const movers=fresh.slice().sort((a,b)=>LIVE.q[b.t].pct-LIVE.q[a.t].pct);
  const br={up:0,dn:0,eq:0,ceil:0,floor:0}; fresh.forEach(s=>{ const q=LIVE.q[s.t]; const p=q.pct; if(p>0.005) br.up++; else if(p<-0.005) br.dn++; else br.eq++; const c=boardClass(q); if(c==='ceil') br.ceil++; if(c==='floor') br.floor++; });
  const tot=br.up+br.dn+br.eq||1;
  let capUp=0,capAll=0; fresh.forEach(s=>{ const c=capUSD(s)||0; capAll+=c; if(LIVE.q[s.t].pct>0) capUp+=c; });
  return `<section class="panel live-panel" aria-labelledby="h-live">
    <div class="sec-h" style="margin:0 0 10px"><div><h2 id="h-live" style="font-size:18px">Market</h2><p>${feedTimeText()}</p></div><button class="btn sm" id="liveInfo">Price sources</button></div>
    ${idx.length?`<div class="idx-row">${idx.map(t=>{ const q=LIVE.q[t]; return `<div class="idx"><span class="mut">${esc(IDX_NAME[t]||t)}</span><b>${fmtLivePx(q)}</b><span class="lpx ${boardClass(q)}">${isNum(q.chg)?(q.chg>0?'+':'')+fmt(q.chg,2)+' · ':''}${pctTxt(q)}</span>${sparkSVG(q.hist||[],96,26)}</div>`; }).join('')}</div>`:''}
    <div class="breadth" aria-label="Market breadth"><i style="width:${br.up/tot*100}%;background:var(--up)"></i><i style="width:${br.eq/tot*100}%;background:var(--ref)"></i><i style="width:${br.dn/tot*100}%;background:var(--dn)"></i></div>
    <p class="note" style="margin-top:4px">${br.up} up${br.ceil?` (${br.ceil} at ceiling)`:''} · ${br.eq} unchanged · ${br.dn} down${br.floor?` (${br.floor} at floor)`:''} of ${fresh.length} tickers with latest-session prices${capAll?` · ${fmt(capUp/capAll*100,0)}% of market cap rising`:''}</p>
    ${movers.length>5?`<div class="movers"><div><span class="mut">Top gainers</span>${movers.slice(0,4).map(s=>`<button class="mv" data-open="${esc(s.t)}"><b>${esc(s.t)}</b>${pxChip(s.t)}</button>`).join('')}</div><div><span class="mut">Top losers</span>${movers.slice(-4).reverse().map(s=>`<button class="mv" data-open="${esc(s.t)}"><b>${esc(s.t)}</b>${pxChip(s.t)}</button>`).join('')}</div></div>`:''}
    <div class="board-tbl"><div class="bt-h"><span>${stars.length?'Watchlist':'Largest market cap'}</span><span>Price</span><span>%</span><span class="hide-sm">Vol</span><span class="hide-sm">Trend</span></div>
      ${rows.map(s=>{ const q=LIVE.q[s.t]; const c=boardClass(q); return `<div class="bt-r" role="button" tabindex="0" data-open="${esc(s.t)}"><span><b>${esc(s.t)}</b> <span class="mk ${s.m}">${s.m}</span>${isStale(q)?' <small class="mut">'+esc(q.d.slice(8,10)+'/'+q.d.slice(5,7))+'</small>':''}</span><span class="${c}" style="font-weight:700">${fmtLivePx(q)}</span><span class="${c}">${pctTxt(q)}</span><span class="hide-sm mut">${isNum(q.v)?fmtVol(q.v):'—'}</span><span class="hide-sm">${sparkSVG(q,80,22)}</span></div>`; }).join('')}
    </div>
    ${typeof pairsStripHTML==='function'?pairsStripHTML():''}
    <p class="note" style="margin-top:6px">End-of-day prices, delayed; colors follow price-board conventions (purple ceiling, cyan floor, yellow reference). Star a ticker to add it to this table.</p>
  </section>`;
}
function openFeedInfo(){
  const m=LIVE.meta||{}; const failed=(m.failed||[]).join(', ');
  const nU=Object.values(LIVE.q).filter(q=>q.mk==='US'&&!String(q.t).startsWith('IDX')).length, nV=Object.values(LIVE.q).filter(q=>q.mk==='VN'&&!String(q.t).startsWith('IDX')).length, nE=Object.keys(LIVE.e).length;
  openSheet('Price sources',`<div class="lesson">
    <p style="font-size:15px">Prices are loaded into the app by a scheduled task after each trading session (Monday – Friday). These are delayed closing prices, not live matched prices.</p>
    <table class="thr"><tr><td><b>Price & market cap</b></td><td>S&amp;P 500, HOSE, HNX listings and ETF pages on stockanalysis.com, once per session</td></tr>
      <tr><td><b>Daily candles</b></td><td>stockanalysis.com, refreshed in rotation; days with only a closing price are drawn as flat candles</td></tr>
      <tr><td><b>Fundamentals</b></td><td>stockanalysis.com (trailing 12 months), fetched ${esc(FUND_ASOF.split('-').reverse().join('/'))}${DBFUND.asof.US?', updated '+esc(String(DBFUND.asof.US).slice(0,10)):''}. P/E, P/B, P/S, dividend yield and FCF yield adjust automatically to the latest price</td></tr>
      <tr><td><b>Market indices</b></td><td>VN-Index, VN30: CafeF · S&amp;P 500, Nasdaq, Dow Jones: Google Finance</td></tr>
      <tr><td><b>Last update</b></td><td>${m.upd?esc(new Date(m.upd).toLocaleString('en-US')):'—'}</td></tr>
      <tr><td><b>Tickers with prices</b></td><td>US ${nU} · Vietnam ${nV} · ETF ${nE}</td></tr>
      <tr><td><b>No fundamentals yet</b></td><td>US ${PENDING.US.length} · Vietnam ${PENDING.VN.length} tickers — being added gradually, not ranked for now</td></tr>
      ${failed?`<tr><td><b>Last run errors</b></td><td>${esc(failed)}</td></tr>`:''}</table>
    <p class="note">Third-party data may contain errors — check with your broker before trading.</p>
    ${m.note?`<p class="note">${esc(m.note)}</p>`:''}</div>`);
}
/* ---------- giá trong trang chi tiết ---------- */
function liveBlockHTML(s,etf){
  const q=etf?liveE(s.t):liveQ(s.t); if(!q) return LIVE.status==='ok'?'<p class="note">No market price for this ticker yet.</p>':'';
  const c=boardClass(q); const exb=s.ex==='HNX'?'HNX':s.ex==='UPCOM'?'UPCOM':'HOSE';
  const band= !etf&&s.m==='VN'&&isNum(q.px)? priceBand(q.px,exb) : null;
  const nReal=(q.hist||[]).filter(b=>!b[6]).length, nCl=(q.hist||[]).filter(b=>b[6]).length;
  return `<section class="panel live-block">
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><b class="${c}" style="font-family:var(--f-disp);font-size:30px">${fmtLivePx(q)}</b><span class="${c}" style="font-weight:700">${isNum(q.chg)?(q.chg>0?'+':'')+fmt(q.chg,q.m==='VN'?0:2)+' ':''}(${pctTxt(q)})</span><span class="note">Session ${esc(q.d.slice(8,10)+'/'+q.d.slice(5,7)+'/'+q.d.slice(0,4))}${isStale(q)?' — latest session not yet available':''}</span></div>
    <div class="kv" style="margin-top:10px">
      <div><span>Open / High / Low</span><b style="font-size:15px">${isNum(q.o)?fmtPx(q.o)+' / '+fmtPx(q.h)+' / '+fmtPx(q.l):'—'}</b></div>
      <div><span>Volume</span><b style="font-size:15px">${isNum(q.v)?fmtVol(q.v):'—'}</b></div>
      <div><span>${band?'Next session ceiling / floor':'52-week range'}</span><b style="font-size:15px">${band?`<span style="color:var(--ceil)">${fmt(band.ceil,0)}</span> / <span style="color:var(--floor)">${fmt(band.floor,0)}</span>`:(isNum(s.w52l)&&isNum(s.w52h)?fmtPx(s.w52l)+' – '+fmtPx(s.w52h):'—')}</b></div>
    </div>
    <div style="margin-top:10px">${sparkSVG(q,320,48).replace('width="320"','width="100%"')}</div>
    <p class="note">${q.histKind==='ohlc'?esc(q.src||'stockanalysis.com')+' · '+nReal+' daily candles'+(nCl?' + '+nCl+' close-only sessions':''):(nCl?nCl+' closing-price sessions; full candles loading or unavailable':'Loading price history')}${!etf&&s._liveFund?' · P/E, P/B, dividend adjusted to latest price':''}${q.adjWarn?' · may not yet be adjusted for the corporate action on '+esc(q.adjWarn):''}</p>
  </section>`;
}
/* ---------- đăng ký nhận dữ liệu ---------- */
let liveT=null, liveFull=false;
function liveChanged(full,info){
  if(full) liveFull=true;
  clearTimeout(liveT);
  liveT=setTimeout(()=>{
    const doFull=liveFull; liveFull=false;
    if(doFull) computeAll();
    const bs=$('#brandSub'); if(bs) bs.textContent= LIVE.status==='ok'? feedTimeText().replace(/ · (cập nhật|updated).*/,'') : 'US & Vietnam · 6 factors';
    if(!$('#sheet').hidden){
      $$('[data-px]').forEach(el=>{ const t=el.dataset.px; const tmp=document.createElement('span'); tmp.innerHTML=pxChip(t,{etf:!!el.dataset.pxe}); if(tmp.firstElementChild) el.replaceWith(tmp.firstElementChild); });
      const lb=$('#liveSlot'); if(lb&&lb.dataset.t){ const etf=!!lb.dataset.etf; const s=etf?EBY[lb.dataset.t]:BY[lb.dataset.t]; if(s) lb.innerHTML=liveBlockHTML(s,etf); }
      if(typeof refreshEtfSheet==='function') refreshEtfSheet(info);
      return;
    }
    if(S.view==='home') RENDER.home();
    else if(S.view==='screen'){ if(S.scrMode&&S.scrMode!=='stock'){ if(typeof renderEtfBody==='function') renderEtfBody(); } else if($('#resList')) renderList(); }
    else if(S.view==='port') RENDER.port();
    else if(S.view==='chart'&&(doFull||(info&&info.hist===CH.t))) RENDER.chart();
  },220);
}
function applyFundDoc(k,v){
  if(!v||!v.rows) return;
  if(k==='ETF'){ DBFUND.ETF=v.rows; if(Array.isArray(v.keys)) DBFUND.ekeys=v.keys; }
  else { DBFUND[k]=v.rows; if(Array.isArray(v.keys)) DBFUND.keys=v.keys; }
  DBFUND.asof[k]=v.upd||null;
  rebuildUniverse();
}
async function initLive(){
  let db=null;
  try{ if(window.claude&&typeof window.claude.use==='function') db=await window.claude.use('db'); }catch(e){ db=null; }
  if(!db){ LIVE.status='off'; liveChanged(false); return; }
  LIVE.db=db;
  try{
    let pending=4;
    ['US','VN','ETF','IDX'].forEach(k=>{
      db.doc('snap/'+k).onSnapshot(s=>{
        LIVE.snap[k]= s.exists? s.data() : null; rebuildLive();
        if(pending>0) pending--; if(pending===0||LIVE.status==='ok') liveChanged(true);
      },()=>{ if(pending>0) pending--; if(pending===0){ if(LIVE.status!=='ok') LIVE.status='off'; liveChanged(false); } });
    });
    ['US','VN','ETF'].forEach(k=>{
      db.doc('fund/'+k).onSnapshot(s=>{ if(s.exists){ applyFundDoc(k,s.data()); liveChanged(true); } },()=>{});
    });
    db.doc('meta/feed').onSnapshot(s=>{ LIVE.meta=s.exists?s.data():null; liveChanged(false); },()=>{});
  }catch(e){ LIVE.status='off'; liveChanged(false); }
}
