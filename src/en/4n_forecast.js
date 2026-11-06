/* ============================================================
   DỰ BÁO GIÁ (giao diện) · BẢNG XẾP HẠNG MÔ HÌNH · TIN KINH TẾ – CHÍNH TRỊ
   Mô hình và kiểm định nằm ở 4n_forecast_core.js. Kết quả kiểm định quay lui đọc từ meta/rot.fc
   (tác vụ hằng ngày chạy pipeline/fc_eval.js trên các gói lịch sử nến), tin đọc từ meta/news.
   ============================================================ */
function fcGroupOf(s){ return s&&s.m==='VN'?'VN':'US'; }
/* gộp kết quả kiểm định của mọi gói cùng nhóm (US-*, VN-*, E-*) */
function fcAgg(grp){
  const F=LIVE.fc; if(!F) return null; const out={};
  Object.keys(F).forEach(ck=>{ if(ck.split('-')[0]!==grp) return; const v=F[ck];
    FC_H.forEach(h=>{ const A=v[h]; if(!A) return; const G=out[h]||(out[h]={n:0,up:0,cov:0,m:{}}); G.n+=A.n; G.up+=A.up; G.cov+=A.cov||0;
      Object.keys(A.m||{}).forEach(mo=>{ const M=A.m[mo], g=G.m[mo]||(G.m[mo]={hit:0,dn:0,ae:0}); g.hit+=M.hit; g.dn+=M.dn; g.ae+=M.ae; }); }); });
  return Object.keys(out).length? out : null;
}
function fcBest(G){ let b=null; FC_MODELS.forEach(mo=>{ if(mo==='naive') return; const M=G.m[mo]; if(!M||!M.dn) return; const hit=M.hit/M.dn; if(!b||hit>b.hit) b={mo,hit,n:M.dn}; }); return b; }
/* có tốt hơn đoán bừa không: vượt cả 50% lẫn tỷ lệ "luôn đoán tăng/giảm theo đa số" hơn 2 sai số chuẩn */
function fcEdge(G,b){ if(!b) return false; const base=Math.max(G.up/G.n,1-G.up/G.n,.5); return b.hit-base>2*Math.sqrt(.25/b.n); }
function closesOf(s){ const q=LIVE.q[s.t]; if(!q) return []; return seriesOf(q).filter(v=>isNum(v)&&v>0); }
function forecastPanelHTML(s){
  const c=closesOf(s); const G=fcAgg(fcGroupOf(s));
  if(c.length<17) return `<section class="panel"><div class="sec-h" style="margin:0"><div><h2 style="font-size:17px">${T_FC.h}</h2><p>${T_FC.nodata}</p></div></div></section>`;
  const rows=FC_H.map(h=>{ const f=fcForecast(c,h,'ens'); if(!f) return ''; const A=G&&G[h]; const b=A&&fcBest(A); const edge=A&&fcEdge(A,b);
    const arrow=f.pUp>=.55?'▲':f.pUp<=.45?'▼':'◆'; const cls=f.pUp>=.55?'up':f.pUp<=.45?'dn':'';
    return `<tr><td class="fc-hz">${T_FC.hl[h]}</td><td class="num" data-l="${T_FC.c1}"><b>${fmtPx(f.px,s)}</b><small class="${cls}">${f.ret>0?'+':''}${fmt(f.ret*100,1)}%</small></td><td class="num" data-l="${T_FC.c2}">${fmtPx(f.lo,s)} – ${fmtPx(f.hi,s)}</td><td class="num ${cls}" data-l="${T_FC.c3}">${arrow} ${fmt(f.pUp*100,0)}%</td>
      <td data-l="${T_FC.c4}">${b?`<span class="fc-m ${edge?'ok':''}">${esc(T_FC.mn[b.mo])} ${fmt(b.hit*100,0)}%</span>`:'—'}</td></tr>`; }).join('');
  return `<section class="panel" style="display:flex;flex-direction:column;gap:10px"><div class="sec-h" style="margin:0"><div><h2 style="font-size:17px">${T_FC.h}</h2><p>${T_FC.sub.replace('{n}',c.length)}</p></div></div>
    <div class="scroll-x" tabindex="0"><table class="ptab fc-t"><thead><tr><th>${T_FC.c0}</th><th>${T_FC.c1}</th><th>${T_FC.c2}</th><th>${T_FC.c3}</th><th>${T_FC.c4}</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p class="note">${T_FC.note}</p></section>`;
}
function fmtPx(v,s){ return s&&s.m==='VN'? fmt(v,0) : fmt(v,v>=100?1:2); }
/* Điểm La Bàn như một "mô hình" chọn mã: 20 mã điểm cao nhất ở mỗi lần ghi có thắng mã trung vị của thị trường sau h phiên không */
function scoreHits(m){
  const L=(LIVE.trk&&LIVE.trk[m])||[]; const snap=LIVE.snap&&LIVE.snap[m]; if(!snap||!snap.dates) return null; const out={};
  const key=t=>{ const s=BY[t]; return s? (s.tk||s.t) : t; };
  [1,3,7,21].forEach(h=>{ let hit=0,n=0;
    L.forEach(e=>{ const i=snap.dates.indexOf(e.d); if(i<0||i+h>=snap.dates.length) return;
      const rets=[]; for(const t in snap.c){ const a=snap.c[t]; if(a[i]>0&&a[i+h]>0) rets.push(a[i+h]/a[i]-1); } if(rets.length<50) return;
      rets.sort((x,y)=>x-y); const med=rets[rets.length>>1];
      e.top.forEach(([t])=>{ const a=snap.c[key(t)]; if(a&&a[i]>0&&a[i+h]>0){ n++; if(a[i+h]/a[i]-1>med) hit++; } }); });
    out[h]= n? {hit:hit/n,n} : null; });
  return out;
}
function renderFcBoard(){
  const box=$('#expertBody'); box.innerHTML=`<p class="note">${T_FC.loading}</p>`;
  loadTrack(()=>{
    const groups=[['US',T_FC.gUS],['VN',T_FC.gVN],['E',T_FC.gE]].filter(([g])=>S.market==='ALL'||g===S.market||(g==='E'&&S.market==='US'));
    const pc=v=>v==null?'—':fmt(v*100,1)+'%';
    const tab=([g,name])=>{ const G=fcAgg(g); if(!G) return `<section class="panel"><h2 style="font-size:18px">${name}</h2><p class="note">${T_FC.noboard}</p></section>`;
      const SH= g==='E'? null : scoreHits(g);
      const hs=FC_H.filter(h=>G[h]);
      return `<section class="panel" style="display:flex;flex-direction:column;gap:10px"><div class="sec-h" style="margin:0"><div><h2 style="font-size:18px">${name}</h2><p>${T_FC.bsub.replace('{n}',hs.reduce((a,h)=>a+G[h].n,0).toLocaleString(LOCALE))}</p></div></div>
      <div class="scroll-x" tabindex="0"><table class="ptab fc-b"><thead><tr><th>${T_FC.mcol}</th>${hs.map(h=>`<th class="num">${T_FC.hl[h]}</th>`).join('')}</tr></thead><tbody>
        <tr class="base"><td>${T_FC.always}</td>${hs.map(h=>{ const u=G[h].up/G[h].n; return `<td class="num">${pc(Math.max(u,1-u))}<small>${u>=.5?T_FC.upw:T_FC.dnw}</small></td>`; }).join('')}</tr>
        ${FC_MODELS.filter(mo=>mo!=='naive').map(mo=>`<tr><td>${esc(T_FC.mn[mo])}<small>${esc(T_FC.md[mo])}</small></td>${hs.map(h=>{ const M=G[h].m[mo]; const b=fcBest(G[h]); const hit=M&&M.dn?M.hit/M.dn:null; const edge=b&&b.mo===mo&&fcEdge(G[h],b);
          return `<td class="num ${b&&b.mo===mo?'best':''}">${pc(hit)}${edge?' ✓':''}<small>${T_FC.mae} ${pc(M?M.ae/G[h].n:null)}</small></td>`; }).join('')}</tr>`).join('')}
        <tr><td>${T_FC.naive}<small>${T_FC.naived}</small></td>${hs.map(h=>`<td class="num">—<small>${T_FC.mae} ${pc(G[h].m.naive?G[h].m.naive.ae/G[h].n:null)}</small></td>`).join('')}</tr>
        ${SH?`<tr><td>${T_FC.score}<small>${T_FC.scored}</small></td>${hs.map(h=>`<td class="num">${SH[h]?pc(SH[h].hit):'—'}<small>${SH[h]?SH[h].n+' '+T_FC.picks:T_FC.wait}</small></td>`).join('')}</tr>`:''}
      </tbody></table></div></section>`; };
    box.innerHTML=`<section class="panel"><div class="sec-h"><div><h2 style="font-size:18px">${T_FC.bh}</h2><p>${T_FC.bp}</p></div></div><p class="note">${T_FC.bhow}</p></section>${groups.map(tab).join('')}<p class="note">${T_FC.bcav}</p>`;
  });
}
/* ---------- tin kinh tế – chính trị ---------- */
const IMP_CLS={pos:'up',neg:'dn',mix:''};
function newsItemHTML(n,compact){
  const L=n[LANG]||n.vi||n.en||{}; const tk=(n.tk||[]).filter(t=>BY[t]||BY[t+'.VN']).slice(0,6);
  return `<article class="news-i"><div class="news-m"><span class="chip imp ${IMP_CLS[n.imp]||''}">${T_FC.imp[n.imp]||T_FC.imp.mix}</span><span>${esc((n.d||'').split('-').reverse().join('/'))}</span><span class="mk ${n.m==='VN'?'VN':n.m==='US'?'US':''}">${n.m==='ALL'?T_FC.all:esc(n.m||'')}</span></div>
    <h3>${esc(L.t||'')}</h3>${compact?'':`<p>${esc(L.s||'')}</p>`}
    <div class="news-f">${tk.map(t=>`<button class="chip" data-open="${esc(BY[t]?t:t+'.VN')}">${esc(t)}</button>`).join('')}${(n.src||[]).slice(0,2).map(x=>`<a href="${esc(x.u)}" target="_blank" rel="noopener">${esc(x.n)} ↗</a>`).join('')}</div></article>`;
}
function newsHomeHTML(){
  const N=LIVE.news&&LIVE.news.items; if(!N||!N.length) return '';
  const L=N.filter(n=>S.market==='ALL'||n.m===S.market||n.m==='ALL').slice(0,6);
  if(!L.length) return '';
  return `<section class="panel news" aria-labelledby="h-news"><div class="sec-h"><div><h2 id="h-news">${T_FC.nh}</h2><p>${T_FC.np.replace('{d}',esc(String(LIVE.news.upd||'').slice(0,10).split('-').reverse().join('/')))}</p></div></div>
    <div class="news-l">${L.map(n=>newsItemHTML(n,false)).join('')}</div></section>`;
}
function newsForStockHTML(s){
  const N=LIVE.news&&LIVE.news.items; if(!N) return '';
  const tk=s.tk||s.t; const sc=n=>((n.tk||[]).includes(tk)?3:0)+((n.sec||[]).includes(s.s)?2:0)+(n.m===s.m?1:n.m==='ALL'?.5:0);
  const L=N.map(n=>({n,v:sc(n)})).filter(x=>x.v>=2).sort((a,b)=>b.v-a.v||String(b.n.d).localeCompare(String(a.n.d))).slice(0,4);
  if(!L.length) return '';
  return `<section class="panel news"><div class="sec-h" style="margin:0"><div><h2 style="font-size:17px">${T_FC.nst}</h2><p>${T_FC.nsp}</p></div></div><div class="news-l">${L.map(x=>newsItemHTML(x.n,false)).join('')}</div></section>`;
}
const LOCALE='en-US';
const T_FC={h:'Short-term price forecast',sub:'Combined model (trend + moving average + reversal) on the last {n} sessions',
nodata:'Not enough price history yet (needs at least 17 sessions).',hl:{1:'1 session',3:'3 sessions',7:'7 sessions',21:'1 month'},
c0:'Horizon',c1:'Expected price',c2:'80% range',c3:'Chance of rise',c4:'Best direction model',
note:'The expected price is the middle of a wide range: there is an 80% chance the price lands in the range beside it if volatility stays as in the last 40 sessions. The last column is the model that called the direction right most often in the walk-forward test on the same market; it gets a green mark only when it beats guessing by a statistically meaningful margin. Short-term price forecasts are almost always only slightly better than a coin flip — do not trade on them.',
mn:{trend:'Trend',ma:'Moving average',rev:'Reversal',ens:'Combined',naive:'No change'},
md:{trend:'continues the 20-session average return',ma:'slope of MA5 versus MA20',rev:'gives back half of the 5-session move',ens:'average of the three models'},
loading:'Loading test results…',gUS:'US stocks',gVN:'Vietnam stocks',gE:'US ETFs',noboard:'No test results for this group yet.',
bsub:'{n} forecasts tested',mcol:'Model',always:'Always guess the majority',upw:'always up',dnw:'always down',mae:'error',
naive:'Price unchanged',naived:'error benchmark',score:'Compass Score',scored:'top 20 beat the median stock',picks:'picks',wait:'waiting for data',
bh:'Forecast model comparison',bp:'On each past day t the model only sees prices up to t, then calls the direction and price 1, 3, 7 sessions and 1 month ahead; the call is then checked against the real price.',
bhow:'The large figure is the share of correct direction calls, the small line the average price error. The bold cell is the best direction model at that horizon; the ✓ appears only when it beats both 50% and "always guess the majority" by more than 2 standard errors. The Compass Score row measures something else: whether the 20 top-scoring stocks rose more than the median stock.',
bcav:'The test history is only about 80 sessions and the windows overlap, so a 1–3% edge over 50% is usually noise. If no model has a ✓, short-term prices at that horizon are not predictable with these models — that is an honest result, not a bug.',
imp:{pos:'Positive',neg:'Negative',mix:'Mixed'},all:'Global',nh:'Economic & political news',np:'Events that may move stocks · updated {d}',
nst:'Related news',nsp:'Recent events affecting this stock, its sector or its market'};
