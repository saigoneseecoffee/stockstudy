/* ============================================================
   KIỂM CHỨNG — sổ ghi 20 mã điểm cao nhất / thấp nhất mỗi phiên (meta/rot.trk, do tác vụ hằng ngày ghi bằng
   đúng thuật toán của app) và lợi nhuận thực tế của chúng đến hôm nay so với chỉ số.
   ============================================================ */
const TRK_IX={US:'IDX.SPX',VN:'IDX.VNINDEX'};
function loadTrack(cb){
  if(LIVE.trk!==undefined){ cb(); return; }
  const db=LIVE.db; if(!db){ LIVE.trk=null; cb(); return; }
  try{ db.doc('meta/rot').get().then(s=>{ const d=s&&s.exists?s.data():null; LIVE.trk=d&&d.trk?d.trk:null; LIVE.fc=d&&d.fc?d.fc:null; cb(); }).catch(()=>{ LIVE.trk=null; cb(); }); }catch(e){ LIVE.trk=null; cb(); }
}
function trackEval(m){
  const L=(LIVE.trk&&LIVE.trk[m])||[]; const ixq= m==='US'? liveE('SPY') : LIVE.q[TRK_IX[m]]; const ixNow=ixq&&isNum(ixq.px)?ixq.px:null;
  const lastD=ixq&&ixq.d;
  const rows=[];
  L.forEach(e=>{
    if(!e||!e.top||!isNum(e.ix)||!ixNow||(lastD&&e.d>=lastD)) return;
    const ret=list=>{ const r=list.map(([t,p])=>{ const q=LIVE.q[t]; return q&&isNum(q.px)&&p>0? q.px/p-1 : null; }).filter(v=>v!=null); return r.length? {avg:r.reduce((a,b)=>a+b,0)/r.length, all:r} : null; };
    const top=ret(e.top), bot=ret(e.bot||[]); if(!top) return;
    const ix=ixNow/e.ix-1;
    rows.push({d:e.d,top:top.avg,bot:bot?bot.avg:null,ix,ex:top.avg-ix,beat:top.all.filter(r=>r>ix).length,n:top.all.length,spread:bot?top.avg-bot.avg:null});
  });
  return rows;
}
function trackPanel(m){
  const rows=trackEval(m);
  const name=m==='US'?'S&P 500 (SPY)':'VN-Index';
  if(!rows.length) return `<section class="panel"><div class="sec-h"><div><h2 style="font-size:18px">${esc(mktName(m))}</h2><p>${T_TRK.empty}</p></div></div></section>`;
  const pc=v=>(v>0?'+':'')+fmt(v*100,1)+'%'; const cl=v=>v>0?'up':v<0?'dn':'';
  const nWin=rows.filter(r=>r.ex>0).length, picks=rows.reduce((a,r)=>a+r.n,0), beat=rows.reduce((a,r)=>a+r.beat,0);
  const first=rows[0]; const sp=rows.filter(r=>r.spread!=null);
  const W=Math.max(300,Math.min(640,rows.length*34)), H=150, mx=Math.max(...rows.map(r=>Math.abs(r.ex)),.01), y0=H/2, bw=W/rows.length;
  let g=`<line x1="0" x2="${W}" y1="${y0}" y2="${y0}" style="stroke:var(--line2)"/>`;
  rows.forEach((r,i)=>{ const h=Math.abs(r.ex)/mx*(H/2-16); g+=`<rect x="${(i*bw+bw*.18).toFixed(1)}" y="${(r.ex>=0?y0-h:y0).toFixed(1)}" width="${(bw*.64).toFixed(1)}" height="${Math.max(h,1).toFixed(1)}" rx="2" style="fill:var(--${r.ex>=0?'up':'dn'})"><title>${r.d}: ${pc(r.ex)}</title></rect>`;
    if(i===0||i===rows.length-1) g+=`<text x="${(i*bw+bw/2).toFixed(1)}" y="${H-2}" text-anchor="middle" style="font-size:11px;fill:var(--mut)">${r.d.slice(8,10)}/${r.d.slice(5,7)}</text>`; });
  return `<section class="panel" style="display:flex;flex-direction:column;gap:12px"><div class="sec-h" style="margin:0"><div><h2 style="font-size:18px">${esc(mktName(m))}</h2><p>${T_TRK.sub.replace('{ix}',name).replace('{n}',rows.length)}</p></div></div>
    <div class="trk-k">
      <div><span>${T_TRK.k1.replace('{d}',first.d.slice(8,10)+'/'+first.d.slice(5,7))}</span><b class="${cl(first.top)}">${pc(first.top)}</b><small>${name} ${pc(first.ix)}</small></div>
      <div><span>${T_TRK.k2}</span><b>${nWin}/${rows.length}</b><small>${T_TRK.k2s}</small></div>
      <div><span>${T_TRK.k3}</span><b>${Math.round(beat/picks*100)}%</b><small>${beat}/${picks} ${T_TRK.k3s}</small></div>
      <div><span>${T_TRK.k4}</span><b class="${sp.length?cl(sp.reduce((a,r)=>a+r.spread,0)):''}">${sp.length?pc(sp.reduce((a,r)=>a+r.spread,0)/sp.length):'—'}</b><small>${T_TRK.k4s}</small></div>
    </div>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(T_TRK.chart)}">${g}</svg>
    <p class="note">${T_TRK.chart}</p>
    <details class="acc"><summary>${T_TRK.table}</summary><div class="scroll-x" tabindex="0"><table class="ptab"><thead><tr><th>${T_TRK.c1}</th><th>${T_TRK.c2}</th><th>${name}</th><th>${T_TRK.c3}</th><th>${T_TRK.c4}</th></tr></thead><tbody>
      ${rows.slice().reverse().map(r=>`<tr><td>${r.d.slice(8,10)}/${r.d.slice(5,7)}</td><td class="${cl(r.top)}">${pc(r.top)}</td><td class="${cl(r.ix)}">${pc(r.ix)}</td><td class="${cl(r.ex)}"><b>${pc(r.ex)}</b></td><td class="${r.bot!=null?cl(r.bot):''}">${r.bot!=null?pc(r.bot):'—'}</td></tr>`).join('')}
    </tbody></table></div></details>
  </section>`;
}
function renderTrack(){
  const box=$('#expertBody'); box.innerHTML=`<p class="note">${T_TRK.loading}</p>`;
  loadTrack(()=>{
    const ms=S.market==='ALL'?['US','VN']:[S.market];
    box.innerHTML=`<section class="panel"><div class="sec-h"><div><h2 style="font-size:18px">${T_TRK.h}</h2><p>${T_TRK.p}</p></div></div>
      <p class="note">${T_TRK.how}</p></section>${LIVE.trk?ms.map(trackPanel).join(''):`<section class="panel"><p class="note">${T_TRK.none}</p></section>`}
      <p class="note">${T_TRK.caveat}</p>`;
  });
}
const T_TRK={h:'Compass Score track record',p:'Every session the 20 highest-scoring stocks are recorded with their closing prices. This shows how they have actually performed since.',
how:'Scores use only the data available on the recording date (no look-ahead). Returns are compared with that market’s index; entries overlap in time, so they are not independent.',
sub:'Versus {ix} · {n} entries',k1:'Top 20 since {d}',k2:'Entries where the top 20 beat the index',k2s:'each entry measured to today',k3:'Share of picks beating the index',k3s:'picks',
k4:'Top 20 minus bottom 20',k4s:'average spread',chart:'Each bar: top-20 return minus the index, from the recording date to today (oldest left, newest right).',
table:'Every entry',c1:'Recorded',c2:'Top 20',c3:'Versus index',c4:'Bottom 20',empty:'No entry is old enough to measure yet.',loading:'Loading the track record…',
none:'No track record yet (needs the daily data update).',
caveat:'The sample is still tiny: a few weeks and a few dozen overlapping entries. The Compass Score is designed for a 6–12 month holding period, so a few weeks of results are mostly noise, even when they look good. At least 6–12 months of continuous records are needed before drawing conclusions. Past performance does not guarantee future results.'};
