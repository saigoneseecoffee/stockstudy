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
const DISC='Chỉ nhằm mục đích thông tin và học tập, không phải khuyến nghị đầu tư. Giá là giá cuối ngày có độ trễ; các chỉ số tài chính khác là ước tính — hãy kiểm tra lại với báo cáo tài chính và công ty chứng khoán trước khi quyết định.';

/* ---------------- TỔNG QUAN ---------------- */
RENDER.home=function(){
  const el=$('#v-home'); const L=ranked();
  if(!L.length){ el.innerHTML='<div class="empty">Chưa có mã nào trong thị trường này.</div>'; return; }
  const top=L.slice(0,5); S.heroIdx=clamp(S.heroIdx,0,top.length-1); const s=top[S.heroIdx];
  const med=marketMedianFactors(S.market);
  const fsorted=FACTORS.map(F=>({F,v:s._f[F.k]})).sort((a,b)=>b.v-a.v);
  const nA=L.filter(x=>x._grade==='A').length;
  const medScore=median(L.map(x=>x._score));
  el.innerHTML=marketPanelHTML()+`
  <section class="hero" aria-label="La bàn">
    <div class="hero-copy">
      <h1><span class="tk">${esc(s.t)}</span> đang dẫn đầu la bàn ${S.market==='ALL'?'hai thị trường':esc(mktName(S.market))}</h1>
      <p class="lead">${esc(s.n)} đạt <b style="color:var(--fg)">${s._score}/100</b>, hạng ${s._grade}. Mạnh nhất ở ${esc(fsorted[0].F.n.toLowerCase())} và ${esc(fsorted[1].F.n.toLowerCase())}; yếu nhất ở ${esc(fsorted[5].F.n.toLowerCase())} (${fsorted[5].v}).</p>
      <div class="pick-rail" role="group" aria-label="Năm mã điểm cao nhất">
        ${top.map((x,i)=>`<button class="pick" data-i="${i}" aria-pressed="${i===S.heroIdx}"><b>${esc(x.t)}</b><span>${x._score}</span></button>`).join('')}
      </div>
      <div class="hero-stats">
        <div><b>${L.length}</b><span>mã đang theo dõi</span></div>
        <div><b>${fmt(medScore,0)}</b><span>điểm trung vị</span></div>
        <div><b>${nA}</b><span>mã hạng A</span></div>
      </div>
      <div class="row-btns" style="margin-top:16px">
        <button class="btn pri" data-open="${esc(s.t)}">Phân tích ${esc(s.t)}</button>
        <button class="btn" data-go="screen">Mở bộ lọc</button>
      </div>
    </div>
    <div class="compass" id="compass">${radarSVG(FACTORS.map(F=>s._f[F.k]/100),{size:320,bezel:true,labels:FACTORS.map(F=>F.n),sub:FACTORS.map(F=>String(s._f[F.k])),median:FACTORS.map(F=>(med[F.k]||0)/100),pad:30,aria:'La bàn 6 nhân tố của '+s.t})}</div>
  </section>
  <p class="note">Đường vàng: hồ sơ ${esc(s.t)}. Đường đứt nét: trung vị ${esc(mktName(S.market))}. Bộ trọng số: <b>${esc(S.preset==='custom'?'Tùy chỉnh':PRESETS[S.preset].n)}</b>. ${esc(DISC)}</p>

  <div class="grid2">
    <section class="panel" aria-labelledby="h-tree">
      <div class="sec-h"><div><h2 id="h-tree">Bản đồ ngành</h2><p>Diện tích = vốn hóa (quy USD) · màu = điểm La Bàn bình quân</p></div></div>
      <div class="tree" id="tree"></div>
      <div class="legend"><span><i style="background:${heatColor(35)}"></i>Dưới 45</span><span><i style="background:${heatColor(55)}"></i>45–64</span><span><i style="background:${heatColor(75)}"></i>65 trở lên</span><span>Chạm ô để lọc theo ngành</span></div>
    </section>
    <section class="panel" aria-labelledby="h-sc">
      <div class="sec-h"><div><h2 id="h-sc">Định giá × Chất lượng</h2><p>Góc phải trên: doanh nghiệp tốt với giá hấp dẫn</p></div></div>
      <div id="scatter"></div>
    </section>
    <section class="panel span2" aria-labelledby="h-dist">
      <div class="sec-h"><div><h2 id="h-dist">Phân bố điểm La Bàn</h2><p>Mỗi chấm là một mã; chạm để xem chi tiết</p></div></div>
      <div class="scroll-x" id="dist"></div>
    </section>
    <section class="panel span2" aria-labelledby="h-rules">
      <div class="sec-h"><div><h2 id="h-rules">Luật chơi thị trường</h2><p>Những con số nhà đầu tư cần thuộc</p></div><button class="btn sm ghost" data-lesson="rules">Học sâu</button></div>
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
    <p style="font-size:13.5px"><b>Bảng điện Việt Nam</b> — màu theo giá so với tham chiếu (ví dụ giá tham chiếu 50.000đ trên HOSE):</p>
    <div class="board">
      <div style="color:var(--floor)">46.500<span>Sàn −7%</span></div>
      <div style="color:var(--dn)">49.000<span>Giảm</span></div>
      <div style="color:var(--ref)">50.000<span>Tham chiếu</span></div>
      <div style="color:var(--up)">51.200<span>Tăng</span></div>
      <div style="color:var(--ceil)">53.500<span>Trần +7%</span></div>
    </div>
    <table class="thr"><tr><th>Sàn</th><th>Biên độ</th><th>Lô</th></tr>
      <tr><td>HOSE</td><td>±7%</td><td>100 cp (lô lẻ 1–99)</td></tr><tr><td>HNX</td><td>±10%</td><td>100 cp</td></tr><tr><td>UPCoM</td><td>±15%</td><td>100 cp</td></tr></table>
    <p class="note">Giao dịch 9:00–11:30 và 13:00–14:45 (ATO 9:00–9:15, ATC 14:30–14:45). Thanh toán T+2. Giới hạn sở hữu nước ngoài phổ biến 49%, ngân hàng 30%.</p></div>`;
  const us=`<div style="display:flex;flex-direction:column;gap:10px">
    <p style="font-size:13.5px"><b>Thị trường Mỹ</b> — không có biên độ ngày, thay bằng cơ chế ngắt mạch:</p>
    <table class="thr"><tr><th>Cơ chế</th><th>Ngưỡng</th><th>Tác dụng</th></tr>
      <tr><td>Ngắt mạch toàn thị trường cấp 1–2</td><td>S&amp;P 500 −7% / −13%</td><td>Tạm dừng 15 phút (trước 15:25 ET)</td></tr>
      <tr><td>Cấp 3</td><td>−20%</td><td>Dừng hết phiên</td></tr>
      <tr><td>LULD từng mã</td><td>Dải giá động 5–10%</td><td>Tạm dừng 5 phút</td></tr></table>
    <p class="note">Giao dịch 9:30–16:00 giờ New York (20:30–3:00 hoặc 21:30–4:00 giờ Việt Nam tùy mùa). Thanh toán T+1 từ 28/5/2024. Lô tối thiểu 1 cổ phiếu, nhiều sàn cho phép cổ phiếu lẻ phần.</p></div>`;
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
    return `<button class="cell" data-sector="${c.k}" style="left:${c.x}%;top:${c.y}%;width:${c.w}%;height:${c.h}%;background:${heatColor(c.sc)}" aria-label="${esc(SECTORS[c.k]||c.k)}: ${c.n} mã, điểm bình quân ${Math.round(c.sc)}">${showName?`<b>${esc(SECTORS[c.k]||c.k)}</b>`:'<b></b>'}${showSc?`<span>${Math.round(c.sc)}${c.w>20?' · '+c.n+' mã':''}</span>`:''}</button>`;
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
  g+=`<text x="${X(98)}" y="${Y(96)}" text-anchor="end" style="fill:var(--up);font-weight:700">Tốt &amp; rẻ</text><text x="${X(2)}" y="${Y(96)}" style="font-weight:600">Tốt nhưng đắt</text><text x="${X(98)}" y="${Y(3)}" text-anchor="end" style="font-weight:600">Rẻ có lý do?</text><text x="${X(2)}" y="${Y(3)}" style="fill:var(--dn);font-weight:600">Tránh</text>`;
  g+=`<text x="${(W+p.l)/2}" y="${H-4}" text-anchor="middle" class="lbl-strong">Điểm Định giá →</text><text transform="translate(10 ${(H-p.b)/2}) rotate(-90)" text-anchor="middle" class="lbl-strong">Điểm Chất lượng →</text>`;
  const many=L.length>150; const labelSet=new Set(L.slice().sort((a,b)=>b._score-a._score).slice(0,7).map(s=>s.t)); const place=labelPlacer(); L.forEach(s=>place(X(s._f.val),Y(s._f.qual)+5,10,10));
  L.forEach(s=>{ const x=X(s._f.val), y=Y(s._f.qual); const col=S.market==='ALL'?(s.m==='US'?'var(--us)':'var(--vn)'):scoreColor(s._score);
    g+=`<g class="dot" data-open="${esc(s.t)}" style="cursor:pointer"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${many?6:12}" fill="transparent"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${many?(s.bank?2.3:2.6):(s.bank?4.6:5.2)}" style="fill:${col};stroke:var(--s1);fill-opacity:${many?.75:1}" stroke-width="${many?.6:1.5}"${s.bank?' transform="rotate(45 '+x.toFixed(1)+' '+y.toFixed(1)+')"':''}/><title>${esc(s.t)} — Định giá ${s._f.val}, Chất lượng ${s._f.qual}, điểm ${s._score}</title></g>`;
    if(labelSet.has(s.t)){ const w=s.t.length*6.4+2; const cands=[[x+7+w/2,y-5,'start',x+7],[x-7-w/2,y-5,'end',x-7],[x,y-9,'middle',x],[x,y+16,'middle',x]];
      for(const [cx,cy,an,tx] of cands){ if(place(cx,cy,w,11)){ g+=`<text x="${tx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="${an}" class="lbl-strong" style="font-size:10.5px;pointer-events:none">${esc(s.t)}</text>`; break; } } } });
  box.innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ phân tán điểm định giá và chất lượng">${g}</svg>
  <div class="legend">${S.market==='ALL'?'<span><i style="background:var(--us)"></i>Mỹ</span><span><i style="background:var(--vn)"></i>Việt Nam</span>':'<span><i style="background:var(--up)"></i>Hạng A</span><span><i style="background:var(--gold)"></i>B</span><span><i style="background:var(--mut)"></i>C</span><span><i style="background:var(--dn)"></i>D</span>'}<span>Nhãn: 7 mã điểm cao nhất</span></div>`;
}
function renderDist(){
  const box=$('#dist'); if(!box) return;
  const L=ranked(); const W=860,H=190,p={l:16,r:16,t:22,b:30}; const place=labelPlacer();
  const X=v=>p.l+v/100*(W-p.l-p.r);
  let g='';
  [[0,45,'D','var(--dn)'],[45,58,'C','var(--mut)'],[58,70,'B','var(--gold)'],[70,100,'A','var(--up)']].forEach(([a,b,l,c])=>{
    g+=`<rect x="${X(a)}" y="${p.t}" width="${X(b)-X(a)}" height="${H-p.t-p.b}" style="fill:${c};fill-opacity:.07"/><text x="${(X(a)+X(b))/2}" y="${p.t-7}" text-anchor="middle" style="fill:${c};font-weight:800;font-family:var(--f-disp);font-size:12px">Hạng ${l}</text>`; });
  for(let v=0;v<=100;v+=10) g+=`<line class="axis" x1="${X(v)}" x2="${X(v)}" y1="${H-p.b}" y2="${H-p.b+5}"/><text x="${X(v)}" y="${H-p.b+18}" text-anchor="middle">${v}</text>`;
  g+=`<line class="axis" x1="${X(0)}" x2="${X(100)}" y1="${H-p.b}" y2="${H-p.b}"/>`;
  if(L.length>120){
    const cnt=new Array(50).fill(0), us=new Array(50).fill(0); L.forEach(s=>{ const k=clamp(Math.floor(s._score/2),0,49); cnt[k]++; if(s.m==='US') us[k]++; });
    const mx=Math.max(...cnt,1); const bw=(X(100)-X(0))/50; const hh=H-p.t-p.b-14;
    cnt.forEach((n,k)=>{ if(!n) return; const sc=k*2+1; const h=n/mx*hh; const x=X(k*2);
      const col=S.market==='ALL'?'var(--us)':scoreColor(sc);
      if(S.market==='ALL'){ const hu=us[k]/mx*hh; g+=`<rect x="${(x+1).toFixed(1)}" y="${(H-p.b-h).toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${(h-hu).toFixed(1)}" style="fill:var(--vn);fill-opacity:.85"/><rect x="${(x+1).toFixed(1)}" y="${(H-p.b-hu).toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${hu.toFixed(1)}" style="fill:var(--us);fill-opacity:.85"/>`; }
      else g+=`<rect x="${(x+1).toFixed(1)}" y="${(H-p.b-h).toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" style="fill:${col};fill-opacity:.85"/>`;
      g+=`<rect data-bin="${k*2}" x="${x.toFixed(1)}" y="${p.t}" width="${bw.toFixed(1)}" height="${H-p.t-p.b}" fill="transparent" style="cursor:pointer"><title>${n} mã có điểm ${k*2}–${k*2+1}</title></rect>`;
      if(n===mx||h>hh*.55) g+=`<text x="${(x+bw/2).toFixed(1)}" y="${(H-p.b-h-4).toFixed(1)}" text-anchor="middle" style="font-size:9.5px;fill:var(--fg);pointer-events:none">${n}</text>`; });
    const top=L.slice(0,6);
    top.forEach((s,i)=>{ const x=X(s._score); const y=p.t+4+i*13; g+=`<g data-open="${esc(s.t)}" style="cursor:pointer"><line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="${y+3}" y2="${H-p.b}" style="stroke:var(--gold)" stroke-opacity=".5" stroke-dasharray="2 3"/><text x="${(x-4).toFixed(1)}" y="${y+3}" text-anchor="end" style="font-size:10px;font-weight:700;fill:var(--gold)">${esc(s.t)} ${s._score}</text></g>`; });
    box.innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" style="min-width:700px" role="img" aria-label="Biểu đồ tần suất điểm La Bàn của ${L.length} mã">${g}</svg><div class="legend">${S.market==='ALL'?'<span><i style="background:var(--us)"></i>Mỹ</span><span><i style="background:var(--vn)"></i>Việt Nam</span>':''}<span>Cột = số mã theo khoảng 2 điểm · chạm cột để lọc từ mức điểm đó</span></div>`;
    $$('[data-bin]',box).forEach(r=>r.addEventListener('click',()=>{ S.filters.min=+r.dataset.bin; S.filters.sort='score'; S.listN=60; S.scrMode='stock'; setView('screen'); }));
    return;
  }
  const bins={};
  L.slice().sort((a,b)=>a._score-b._score).forEach(s=>{ const k=Math.round(s._score/2.4); bins[k]=(bins[k]||0)+1; const lvl=bins[k]-1;
    const x=X(s._score), y=H-p.b-12-lvl*18; const col=S.market==='ALL'?(s.m==='US'?'var(--us)':'var(--vn)'):scoreColor(s._score);
    g+=`<g data-open="${esc(s.t)}" style="cursor:pointer"><circle cx="${x.toFixed(1)}" cy="${y}" r="7.5" style="fill:${col};fill-opacity:.9;stroke:var(--s1)" stroke-width="1.5"/><title>${esc(s.t)}: ${s._score}</title></g>`;
    const tk=s.t.replace('.B',''); if(lvl<7&&place(x,y-10,tk.length*5.6+3,10)) g+=`<text x="${(x).toFixed(1)}" y="${y-10}" text-anchor="middle" style="font-size:9px;fill:var(--fg);pointer-events:none">${esc(tk)}</text>`; });
  box.innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" style="min-width:700px" role="img" aria-label="Phân bố điểm La Bàn theo hạng">${g}</svg>`;
}

/* ---------------- SÀNG LỌC ---------------- */
function scrModeHTML(){
  return `<div class="seg scr-mode" role="group" aria-label="Loại tài sản" id="scrMode">${[['stock','Cổ phiếu'],['etf','ETF Mỹ'],['pairs','Cặp đối xứng']].map(([k,n])=>`<button data-sm="${k}" aria-pressed="${S.scrMode===k}">${n}</button>`).join('')}</div>`;
}
function bindScrMode(el){ $$('[data-sm]',el).forEach(b=>b.onclick=()=>{ S.scrMode=b.dataset.sm; saveState(); RENDER.screen(); window.scrollTo(0,0); }); }
RENDER.screen=function(){
  const el=$('#v-screen'); const W=curWeights();
  if(S.scrMode!=='stock'&&typeof renderEtfView==='function'){ el.innerHTML=scrModeHTML()+'<div id="etfView" style="display:flex;flex-direction:column;gap:16px"></div>'; bindScrMode(el); renderEtfView(); return; }
  const secs=[...new Set(inMarket(U).map(s=>s.s))].sort((a,b)=>(SECTORS[a]||a).localeCompare(SECTORS[b]||b,'vi'));
  const exs=[...new Set(inMarket(U).map(s=>s.ex))];
  el.innerHTML=scrModeHTML()+`
  <div><div class="sec-h"><div><h2>Bộ lọc đa nhân tố</h2><p>Chọn trường phái, tinh chỉnh trọng số, xếp hạng lại tức thì</p></div><button class="btn sm" id="addStock">Thêm mã</button></div>
    <div class="chips" role="group" aria-label="Chiến lược">
      ${Object.entries(PRESETS).map(([k,p])=>`<button class="chip ${S.preset===k?'on':''}" data-preset="${k}" aria-pressed="${S.preset===k}" title="${esc(p.d)}">${esc(p.n)}</button>`).join('')}
      <button class="chip ${S.preset==='custom'?'on':''}" data-preset="custom" aria-pressed="${S.preset==='custom'}">Tùy chỉnh</button>
    </div>
    <p class="note" style="margin-top:6px" id="presetDesc">${esc(S.preset==='custom'?'Trọng số do bạn đặt.':PRESETS[S.preset].d)}</p>
  </div>
  <details class="acc" id="wAcc"><summary>Trọng số nhân tố <span class="mut" style="font-weight:500;font-size:13px;margin-left:auto;margin-right:8px">${FACTORS.map(F=>W[F.k]).join(' / ')}</span></summary>
    <div class="acc-b"><div class="wts">
      ${FACTORS.map(F=>`<label class="wt"><span title="${esc(F.d)}">${esc(F.n)}</span><input type="range" min="0" max="50" step="1" value="${W[F.k]}" data-w="${F.k}" id="w-${F.k}" aria-label="Trọng số ${esc(F.n)}"><output id="wo-${F.k}">${W[F.k]}</output></label>`).join('')}
    </div><p class="note" style="margin-top:10px">Mỗi nhân tố = 55% thứ hạng phần trăm trong nhóm cùng thị trường (ngân hàng so với ngân hàng) + 45% thang điểm tuyệt đối theo ngưỡng học thuật. Cờ đỏ nhân hệ số phạt 0,86–0,95.</p></div>
  </details>
  <div class="toolbar">
    <label class="field search"><span class="sr">Tìm mã</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input type="text" id="q" placeholder="Tìm mã hoặc tên công ty" value="${esc(S.filters.q)}" autocomplete="off"></label>
  </div>
  <div class="filters">
    <label class="field">Ngành<select id="fSector"><option value="all">Tất cả ngành</option>${secs.map(k=>`<option value="${k}" ${S.filters.sector===k?'selected':''}>${esc(SECTORS[k]||k)}</option>`).join('')}</select></label>
    ${exs.length>1?`<label class="field">Sàn / rổ<select id="fEx"><option value="all">Tất cả</option>${exs.map(x=>`<option value="${esc(x)}" ${S.filters.ex===x?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`:''}
    <label class="field">Sắp xếp<select id="fSort">${[['score','Điểm La Bàn'],['val','Định giá'],['qual','Chất lượng'],['grow','Tăng trưởng'],['safe','Sức khỏe'],['mom','Động lượng'],['inc','Thu nhập'],['mos','Biên an toàn ước tính'],['dy','Tỷ suất cổ tức'],['cap','Vốn hóa'],['chg','Tăng/giảm phiên gần nhất'],['tgt','Dư địa giá mục tiêu'],['mo','Lợi nhuận 52 tuần'],['pe','P/E thấp nhất']].map(([k,n])=>`<option value="${k}" ${S.filters.sort===k?'selected':''}>${n}</option>`).join('')}</select></label>
    <label class="field">Điểm tối thiểu: <b id="minOut" style="color:var(--fg)">${S.filters.min}</b><input type="range" id="fMin" min="0" max="90" step="5" value="${S.filters.min}"></label>
    <label class="switch"><input type="checkbox" id="fNoFlag" ${S.filters.noflag?'checked':''}>Loại mã có cờ đỏ</label>
  </div>
  <div><div class="sec-h" style="margin-bottom:8px"><p id="resCount"></p><p class="mut" style="font-size:12px">Chạm hàng để xem phân tích</p></div><div class="list" id="resList"></div></div>
  <p class="note">${esc(DISC)}</p>`;
  $$('[data-preset]',el).forEach(b=>b.onclick=()=>{ const k=b.dataset.preset; if(k==='custom'){ S.custW=S.custW||Object.assign({},curWeights()); $('#wAcc').open=true; } S.preset=k; saveState(); computeAll(); RENDER.screen(); if(k==='custom') $('#wAcc').open=true; });
  let wt;
  $$('[data-w]',el).forEach(r=>r.oninput=()=>{ S.custW=Object.assign({},curWeights()); S.custW[r.dataset.w]=+r.value; S.preset='custom'; $('#wo-'+r.dataset.w).textContent=r.value;
    $$('[data-preset]',el).forEach(b=>{ const on=b.dataset.preset==='custom'; b.classList.toggle('on',on); b.setAttribute('aria-pressed',String(on)); }); $('#presetDesc').textContent='Trọng số do bạn đặt.';
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
  return `<div class="srow" role="button" tabindex="0" data-open="${esc(s.t)}" aria-label="${esc(s.t)} ${esc(s.n)}, điểm ${s._score}, hạng ${s._grade}">
    <span class="rk">${i+1}</span>
    <span class="nm"><b>${esc(s.t)} <span class="mk ${s.m}">${s.m}</span> <span class="grade g-${s._grade}">${s._grade}</span>${s._flags.length?`<span class="flag" style="padding:0 5px;font-size:10.5px" title="${esc(s._flags.join('; '))}">${s._flags.length} cờ</span>`:''}${s.edited||s.custom?'<span class="mk" style="color:var(--gold)">SỬA</span>':''}</b><span>${pxChip(s.t)}${liveQ(s.t)?' · ':''}${esc(s.n)} · ${esc(SECTORS[s.s]||s.s)}</span></span>
    <span style="display:flex;align-items:center;gap:8px">${glyphHTML(s)}<button class="star" data-star="${esc(s.t)}" aria-pressed="${isStar(s.t)}" aria-label="${isStar(s.t)?'Bỏ khỏi':'Thêm vào'} danh mục">${starSVG(isStar(s.t))}</button></span>
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
  $('#resCount').innerHTML=`<b style="color:var(--fg)">${L.length}</b> mã · ${esc(mktName(S.market))}${f.sector!=='all'?' · '+esc(SECTORS[f.sector]):''}${pend?` · <span class="mut">${pend} mã đang chờ số liệu</span>`:''}`;
  const box=$('#resList'); const N=Math.min(L.length,S.listN||60);
  box.innerHTML= L.length? L.slice(0,N).map(rowHTML).join('')+(L.length>N?`<button class="btn more-btn" id="moreRows">Xem thêm ${Math.min(60,L.length-N)} mã (còn ${L.length-N})</button>`:'') : `<div class="empty">Không có mã nào khớp bộ lọc. Hạ điểm tối thiểu, tắt “Loại mã có cờ đỏ” hoặc chọn “Tất cả ngành”.<div style="margin-top:12px"><button class="btn sm" id="resetF">Xóa bộ lọc</button></div></div>`;
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
        let disp= k==='posafe'? (isNum(s.po)&&s.dy>0? pct(s.po,0)+' chi trả':'Không chia cổ tức') : k==='fs'? (v==null?'—':v+'/9') : MET[k].u==='%'? pct(v) : MET[k].u==='x'? xx(v) : fmt(v,2);
        return `<tr><td>${esc(MET[k].n)}${MET[k].lo?' <span class="mut" style="font-size:11px">(thấp tốt)</span>':''}</td><td>${disp}</td><td><div class="mini"><i style="width:${sc==null?0:Math.round(sc*100)}%"></i></div></td></tr>`; }).join('')}</table></div></details>`;
  }).join('');
}
function bankPanelHTML(s){
  const items=[['CAR / CET1',pct(s.car),'≥ 12% tốt'],['Nợ xấu (NPL)',pct(s.npl),'< 1,5% tốt'],['CASA',pct(s.casa),'> 30% tốt'],['NIM',pct(s.nim),'> 3,5% tốt'],['ROE',pct(s.roe),'> 15% tốt'],['P/B hợp lý',s._val.fairPB?xx(s._val.fairPB,2):'—','(ROE−g)/(r−g)']];
  const miss=!isNum(s.car)&&!isNum(s.npl)&&!isNum(s.nim);
  return `<div class="kv">${items.map(([a,b,c])=>`<div><span>${a}</span><b>${b}</b><span>${c}</span></div>`).join('')}</div>${miss?'<p class="note">Chưa có CAR, nợ xấu, CASA, NIM cho ngân hàng này (nguồn tổng hợp không công bố); điểm Sức khỏe chỉ dựa trên chỉ tiêu sẵn có. Có thể nhập tay qua “Sửa số liệu”.</p>':''}`;
}
const F9=[['ROA > 0','Có lãi'],['CFO > 0','Dòng tiền KD dương'],['ROA tăng','Sinh lời cải thiện'],['CFO > LN','Lợi nhuận chất lượng'],['Đòn bẩy giảm','Nợ dài hạn/TS giảm'],['Thanh khoản tăng','Current ratio tăng'],['Không pha loãng','Không phát hành thêm'],['Biên gộp tăng','Biên lợi nhuận gộp'],['Vòng quay TS tăng','Hiệu quả tài sản']];
function zBarHTML(z){
  if(!isNum(z)) return '<p class="note">Altman Z không áp dụng cho doanh nghiệp tài chính.</p>';
  const W=320,H=64,X=v=>10+clamp(v,0,6)/6*(W-20);
  let g=`<rect x="${X(0)}" y="14" width="${X(1.81)-X(0)}" height="12" rx="3" style="fill:var(--dn);fill-opacity:.75"/><rect x="${X(1.81)}" y="14" width="${X(2.99)-X(1.81)}" height="12" style="fill:var(--ref);fill-opacity:.75"/><rect x="${X(2.99)}" y="14" width="${X(6)-X(2.99)}" height="12" rx="3" style="fill:var(--up);fill-opacity:.75"/>`;
  g+=`<text x="${X(.9)}" y="58" text-anchor="middle">Nguy hiểm</text><text x="${X(2.4)}" y="58" text-anchor="middle">Vùng xám</text><text x="${X(4.5)}" y="58" text-anchor="middle">An toàn</text>`;
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
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Giá trị hiện tại của dòng tiền từng năm và giá trị cuối kỳ">${g}</svg>`;
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
    valTxt=`Giá hiện tại hàm ý dòng tiền tăng khoảng <b>${fmt(v.implied,1)}%/năm</b> trong 5 năm tới (chi phí vốn ${fmt(v.r,1)}%), so với kỳ vọng EPS ${fmt(s.fg,0)}%. ${diff>4?'Thị trường đang kỳ vọng cao hơn dự báo — cần tăng trưởng vượt kỳ vọng để giá đi lên.':diff<-4?'Kỳ vọng ngầm định thấp hơn dự báo — nếu dự báo đúng, có dư địa định giá lại.':'Kỳ vọng ngầm định gần với dự báo — giá đang phản ánh khá sát.'}`;
  }
  const verify= s.bank? ['Chất lượng tài sản: nợ nhóm 2, nợ tái cơ cấu, trái phiếu doanh nghiệp nắm giữ','Tỷ lệ bao phủ nợ xấu (LLR) và chi phí tín dụng','Tăng trưởng tín dụng được NHNN cấp hạn mức','Kế hoạch tăng vốn, chia cổ tức cổ phiếu (pha loãng)']
    : ['Dòng tiền kinh doanh so với lợi nhuận kế toán 3–5 năm','Kế hoạch capex và nguồn vốn tài trợ','Các khoản phải thu, tồn kho tăng nhanh hơn doanh thu?','Giao dịch với bên liên quan, thay đổi chính sách kế toán'];
  return `<div style="display:flex;flex-direction:column;gap:10px;font-size:14px">
    <p>${esc(s.t)} đạt <b>${s._score}/100</b> (hạng ${s._grade}), đứng #${s._rank}/${s._of} tại ${esc(mktName(s.m))} theo bộ trọng số “${esc(S.preset==='custom'?'Tùy chỉnh':PRESETS[S.preset].n)}”. Độ phân tán giữa các nhân tố là ${s._disp} điểm — ${s._disp>20?'hồ sơ lệch, phù hợp một trường phái cụ thể hơn là danh mục cân bằng':'hồ sơ khá đồng đều'}.</p>
    ${pros.length?`<div><b class="up">Luận điểm tích cực</b><ul class="bul">${pros.join('')}</ul></div>`:''}
    ${cons.length?`<div><b class="dn">Điểm cần thận trọng</b><ul class="bul">${cons.join('')}</ul></div>`:''}
    ${valTxt?`<p>${valTxt}</p>`:''}
    ${s._flags.length?`<p><b class="dn">Cờ đỏ:</b> ${esc(s._flags.join('; '))}.</p>`:''}
    <div><b>Điều cần kiểm chứng trong BCTC</b><ul class="bul">${verify.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
  </div>`;
}
function anaVN(a){ return ({'Strong Buy':'Mua mạnh','Buy':'Mua','Hold':'Nắm giữ','Sell':'Bán','Strong Sell':'Bán mạnh'})[a]||a||'—'; }
function openStock(t){
  const s=BY[t]; if(!s) return;
  const med=marketMedianFactors(s.m); const v=s._val; const a=mktAssump(s);
  const fsc=fscore(s); ensureHist(s.t,false);
  const q0=liveQ(s.t); const pxNow=q0&&isNum(q0.px)?q0.px:s.pxf; const tUp=isNum(s.tgt)&&isNum(pxNow)&&pxNow>0? (s.tgt/pxNow-1)*100 : null;
  const html=`
  <div class="dt-top">
    <div><h2>${esc(s.t)}</h2><p class="sub">${esc(s.n)} · ${esc(s.ex)} · ${esc(SECTORS[s.s]||s.s)}<br>Vốn hóa ${capText(s)} · Beta ${fmt(s.b,2)}</p>
      <div class="row-btns" style="margin-top:10px"><span class="mk ${s.m}" style="align-self:center">${s.m==='US'?'MỸ':'VIỆT NAM'}</span><span class="grade g-${s._grade}" style="font-size:13px;align-self:center">Hạng ${s._grade}</span><button class="btn sm" data-star-d="${esc(s.t)}" aria-pressed="${isStar(s.t)}"><span class="star" style="width:auto;height:auto;color:${isStar(s.t)?'var(--ref)':'inherit'}">${starSVG(isStar(s.t))}</span>${isStar(s.t)?'Trong danh mục':'Theo dõi'}</button></div></div>
    <div class="bigring">${ringSVG(s._score,108,9)}<div class="v"><b>${s._score}</b><span>#${s._rank}/${s._of}</span></div></div>
  </div>
  <div id="liveSlot" data-t="${esc(s.t)}">${liveBlockHTML(s)}</div>
  <div class="flags">${s._flags.length? s._flags.map(f=>`<span class="flag">⚑ ${esc(f)}</span>`).join('') : '<span class="flag ok">✓ Không có cờ đỏ</span>'}${s.edited?'<span class="flag" style="background:var(--gold-soft);color:var(--gold)">Số liệu đã được bạn chỉnh</span>':''}</div>

  <section class="panel"><div class="sec-h" style="margin-bottom:8px"><div><h2 style="font-size:17px">Chỉ số nhanh</h2><p>${s._src==='est'?'Ước tính':'stockanalysis.com, 12 tháng gần nhất'}${s._liveFund?' · định giá đã điều chỉnh theo giá mới':''}</p></div></div>
    <div class="kv kv4">
      <div><span>P/E · dự phóng</span><b>${xx(s.pe,1)}</b><span>${isNum(s.fpe)?'P/E dự phóng '+xx(s.fpe,1):'—'}</span></div>
      <div><span>P/B · P/S</span><b>${xx(s.pb,2)}</b><span>${isNum(s.ps)?'P/S '+xx(s.ps,2):'—'}</span></div>
      <div><span>ROE · ROA</span><b>${pct(s.roe)}</b><span>${isNum(s.roa)?'ROA '+pct(s.roa):'—'}</span></div>
      <div><span>Biên ròng</span><b>${pct(s.nm)}</b><span>${isNum(s.om)?'Biên HĐ '+pct(s.om):'—'}</span></div>
      <div><span>Doanh thu 3 năm</span><b>${sgn(s.rg)}</b><span>${isNum(s.rgf)?'Dự báo 3N '+sgn(s.rgf):'/năm'}</span></div>
      <div><span>EPS 3 năm</span><b>${sgn(s.eg)}</b><span>${isNum(s.fg)?'Dự báo 3N '+sgn(s.fg):'/năm'}</span></div>
      <div><span>Cổ tức</span><b>${pct(s.dy,2)}</b><span>${isNum(s.ydg)&&s.ydg>0?s.ydg+' năm tăng liên tiếp':isNum(s.po)?'Chi trả '+pct(s.po,0):'—'}</span></div>
      <div><span>Lợi nhuận 52 tuần</span><b class="${s.mo>=0?'up':'dn'}">${sgn(s.mo)}</b><span>Beta ${fmt(s.b,2)}</span></div>
    </div>
    ${s.ana||isNum(s.tgt)?`<div class="ana"><span class="mut">Giới phân tích${isNum(s.anc)?' ('+s.anc+' người)':''}</span><b>${esc(anaVN(s.ana))}</b>${isNum(s.tgt)?`<span>Giá mục tiêu ${s.m==='US'?'$'+fmt(s.tgt,2):fmt(s.tgt,0)}${isNum(tUp)?` · <b class="${tUp>=0?'up':'dn'}">${sgn(tUp,1)}</b> so với giá hiện tại`:''}</span>`:''}</div><p class="note">Đồng thuận và giá mục tiêu do các công ty chứng khoán đưa ra, thường lạc quan hơn kết quả thực tế; xem như một ý kiến tham khảo.</p>`:''}
  </section>
  <section class="panel"><div class="sec-h"><h2 style="font-size:17px">Hồ sơ 6 nhân tố</h2></div>
    <div id="dRadar" style="max-width:360px;margin:0 auto">${radarSVG(FACTORS.map(F=>s._f[F.k]/100),{size:300,labels:FACTORS.map(F=>F.n),sub:FACTORS.map(F=>String(s._f[F.k])),median:FACTORS.map(F=>(med[F.k]||0)/100),pad:34,fs:11,aria:'Radar nhân tố '+s.t})}</div>
    <div class="legend" style="justify-content:center"><span><i style="background:var(--gold)"></i>${esc(s.t)}</span><span><i style="background:none;border:1.5px dashed var(--mut)"></i>Trung vị ${esc(mktName(s.m))}</span></div>
  </section>
  <section style="display:flex;flex-direction:column;gap:8px"><h2 style="font-size:17px">Chi tiết từng nhân tố</h2>${factorDetailHTML(s)}</section>

  <section class="panel" style="display:flex;flex-direction:column;gap:14px"><div class="sec-h" style="margin:0"><div><h2 style="font-size:17px">Định giá nội tại</h2><p>Giá hiện tại quy chuẩn = 100 để so sánh mọi mã</p></div></div>
    ${gaugeSVG(v.blend,'Biên an toàn tổng hợp (trung vị 3 mô hình)')}
    <div class="kv">
      <div><span>P/E hợp lý (Graham)</span><b>${xx(v.grahamPE,1)}</b><span>Hiện tại ${xx(s.pe,1)} → ${v.grahamMoS==null?'—':sgn((v.grahamPE/s.pe-1)*100,0)}</span></div>
      <div><span>${s.bank?'P/B hợp lý (Gordon)':'Số Graham'}</span><b>${s.bank?(v.pbUp==null?'—':sgn(v.pbUp*100,0)):(v.gnUp==null?'—':sgn(v.gnUp*100,0))}</b><span>${s.bank?'P/B '+xx(s.pb,2)+' vs '+(v.fairPB?xx(v.fairPB,2):'—'):'√(22,5 × EPS × BVPS)'}</span></div>
      <div><span>DCF ${s.bank?'(FCFE)':'(FCF)'}</span><b>${v.dcfUp==null?'—':sgn(v.dcfUp*100,0)}</b><span>Chi phí vốn ${fmt(v.r,1)}%</span></div>
    </div>
    <div style="border-top:1px solid var(--line);padding-top:12px;display:flex;flex-direction:column;gap:10px">
      <b style="font-family:var(--f-disp);font-size:15px">Phòng thí nghiệm DCF</b>
      <label class="slider-row"><span>Tăng trưởng 5 năm</span><input type="range" id="dG" min="-10" max="40" step="0.5" value="${v.g1}"><output id="dGo">${fmt(v.g1,1)}%</output></label>
      <label class="slider-row"><span>Chi phí vốn (r)</span><input type="range" id="dR" min="5" max="20" step="0.25" value="${v.r}"><output id="dRo">${fmt(v.r,2)}%</output></label>
      <label class="slider-row"><span>Tăng trưởng dài hạn</span><input type="range" id="dT" min="0" max="6" step="0.25" value="${a.gt}"><output id="dTo">${fmt(a.gt,2)}%</output></label>
      <div id="dcfOut"></div>
      <p class="note">Dòng tiền gốc = ${s.bank?'EPS × (1 − g/ROE)':'tỷ suất FCF (hoặc 55% lợi nhuận nếu FCF âm)'} trên mức giá 100. Năm 6–10 giảm dần về tăng trưởng dài hạn. Định giá ngược: tốc độ tăng trưởng mà giá hiện tại đang “đòi hỏi” là <b>${v.implied==null?'—':fmt(v.implied,1)+'%/năm'}</b>.</p>
    </div>
  </section>

  <section class="panel" style="display:flex;flex-direction:column;gap:12px">
    <div class="sec-h" style="margin:0"><div><h2 style="font-size:17px">Sức khỏe tài chính</h2><p>Piotroski F-Score ${fsc==null?'—':fsc+'/9'}${s.bank?' · chỉ tiêu ngân hàng':' · Altman Z'}</p></div></div>
    ${s.f&&!isNum(s.fsn)?`<div class="f9">${F9.map((x,i)=>{ const ok=s.f[i]==='1'; return `<div class="${ok?'y':'n'}"><b>${ok?'✓':'✗'} ${esc(x[0])}</b>${esc(x[1])}</div>`; }).join('')}</div>`:fsc!=null?`<div class="fsbar" aria-label="F-Score ${fsc}/9">${[...Array(9)].map((_,i)=>`<i class="${i<fsc?(fsc>=7?'y':fsc>=4?'m':'n'):''}"></i>`).join('')}</div><p class="note">9 phép thử: có lãi, dòng tiền dương, ROA tăng, dòng tiền lớn hơn lợi nhuận, đòn bẩy giảm, thanh khoản tăng, không pha loãng, biên gộp tăng, vòng quay tài sản tăng. Từ 7 điểm là mạnh, dưới 4 là yếu.</p>`:''}
    ${s.bank?bankPanelHTML(s):zBarHTML(s.z)}
  </section>

  <section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Hội đồng chuyên gia</h2><p>Mã đạt ít nhất 75% tiêu chí của trường phái</p></div></div>
    <div class="verdicts">${s._persona.map((p,i)=>`<span class="verdict ${p.pass?'y':'n'}">${p.pass?'✓':'·'} ${esc(PERSONAS[i].n)} <b>${p.n}/${p.tot}</b></span>`).join('')}</div>
  </section>

  <section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Báo cáo thuật toán</h2><p>Tự sinh từ số liệu, cập nhật theo trọng số bạn chọn</p></div></div>${autoReport(s)}</section>

  <div class="row-btns">
    <button class="btn pri" id="dAsk">Hỏi chuyên gia AI</button>
    <button class="btn" id="dChart">Biểu đồ nến</button>
    <button class="btn" id="dCmp">So sánh</button>
    <button class="btn" id="dEdit">Sửa số liệu</button>
    ${s.custom?'<button class="btn ghost" id="dDel" style="color:var(--dn)">Xóa mã này</button>':''}
  </div>
  <p class="disc">${esc(DISC)} Nguồn: ${s._src==='est'?esc(DATA_ASOF):'stockanalysis.com (chỉ số 12 tháng gần nhất, lấy '+esc((s._src==='db'&&DBFUND.asof[s.m]?String(DBFUND.asof[s.m]).slice(0,10):FUND_ASOF).split('-').reverse().join('/'))+')'+(CUR_BY[s.m+':'+(s.tk||s.t)]&&s.bank?'; chỉ tiêu riêng ngân hàng là ước tính':'')}${s.edited||s.custom?'; mã này có số liệu do bạn nhập':''}.</p>`;
  openSheet(s.t+' — '+s.n,html,body=>{
    animateRings(body); animateRadar($('#dRadar',body));
    if(HAS_GSAP()&&!REDUCED()){ const nd=$('.needle',body); if(nd) gsap.from(nd,{rotation:-90,svgOrigin:'120 124',duration:1.2,ease:'elastic.out(1,.6)'}); }
    const upd=()=>{ const g=+$('#dG').value,r=+$('#dR').value,gt=+$('#dT').value;
      $('#dGo').textContent=fmt(g,1)+'%'; $('#dRo').textContent=fmt(r,2)+'%'; $('#dTo').textContent=fmt(gt,2)+'%';
      const d=dcf(s,g,r,gt); const out=$('#dcfOut');
      if(!d.valid||d.base<=0){ out.innerHTML='<p class="note" style="color:var(--dn)">'+(d.base<=0?'Dòng tiền gốc ≤ 0 — DCF không có ý nghĩa với mã đang lỗ hoặc dòng tiền âm. Dùng P/B, EV/Doanh thu hoặc chờ dòng tiền ổn định.':'Chi phí vốn phải lớn hơn tăng trưởng dài hạn ít nhất 0,25 điểm %.')+'</p>'; return; }
      const up=d.total/100-1; const tvShare=d.tv/d.total;
      out.innerHTML=`${dcfChartSVG(d)}<div class="result"><div><b class="${up>=0?'up':'dn'}">${up>=0?'▲':'▼'} ${sgn(up*100,0)}</b><span>Giá trị nội tại so với giá</span></div><div><b>${fmt(d.total,0)}</b><span>Giá trị / giá 100</span></div><div><b>${pct(tvShare*100,0)}</b><span>Tỷ trọng giá trị cuối kỳ</span></div></div>${tvShare>.75?'<p class="note" style="margin-top:6px">Hơn 75% giá trị nằm ở giá trị cuối kỳ — kết quả rất nhạy với giả định dài hạn.</p>':''}`; };
    ['dG','dR','dT'].forEach(id=>$('#'+id).oninput=upd); upd();
    $('[data-star-d]',body).onclick=()=>{ toggleStar(s.t); openStock(s.t); rerenderCurrent(); };
    $('#dAsk').onclick=()=>{ closeSheet(); S.expertTab='ai'; setView('expert'); setTimeout(()=>askAI(`Phân tích chuyên sâu mã ${s.t}: luận điểm đầu tư, rủi ro chính, định giá và các kịch bản.`,s.t),60); };
    $('#dCmp').onclick=()=>{ closeSheet(); S.expertTab='compare'; CMP.a=s.t; if(CMP.b===s.t) CMP.b=null; setView('expert'); };
    $('#dEdit').onclick=()=>openEditor(s.t);
    $('#dChart').onclick=()=>{ closeSheet(); CH.t=s.t; CH.offset=0; setView('chart'); };
    const del=$('#dDel'); if(del) del.onclick=()=>{ if(del.dataset.confirm){ S.custom=S.custom.filter(c=>c.t!==s.t); delete S.overrides[s.t]; S.stars=S.stars.filter(x=>x!==s.t); saveState(); computeAll(); closeSheet(); rerenderCurrent(); toast('Đã xóa '+s.t); } else { del.dataset.confirm=1; del.textContent='Chạm lần nữa để xóa'; } };
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
    ${isNew?`<label class="field">Mã<input type="text" id="e-t" required maxlength="10" autocapitalize="characters" placeholder="VD: CTD"></label><label class="field">Tên công ty<input type="text" id="e-n" required placeholder="VD: Coteccons"></label>
    <label class="field">Thị trường<select id="e-m"><option value="VN" ${s.m==='VN'?'selected':''}>Việt Nam</option><option value="US" ${s.m==='US'?'selected':''}>Mỹ</option></select></label>
    <label class="field">Sàn<input type="text" id="e-ex" value="${esc(s.ex)}"></label>
    <label class="field">Ngành<select id="e-s">${Object.entries(SECTORS).map(([k,n])=>`<option value="${k}">${esc(n)}</option>`).join('')}</select></label>
    <label class="switch" style="align-self:end"><input type="checkbox" id="e-bank" ${bank?'checked':''}>Là ngân hàng</label>`:''}
    <label class="field full">Vốn hóa (${s.m==='US'?'tỷ USD':'nghìn tỷ đồng'})<input type="number" step="any" inputmode="decimal" id="e-cap" value="${isNum(s.cap)?s.cap:''}"></label>
    <div class="full form-grid" id="edFields">${fieldHTML(bank)}</div>
    <fieldset class="full" style="border:1px solid var(--line);border-radius:12px;padding:10px"><legend class="note" style="padding:0 6px">9 phép thử Piotroski</legend>
      <div class="f9">${F9.map((x,i)=>`<label class="switch" style="min-height:36px;font-size:12px"><input type="checkbox" id="e-f${i}" ${s.f&&s.f[i]==='1'?'checked':''}>${esc(x[0])}</label>`).join('')}</div></fieldset>
    <p class="note full" id="edErr" style="color:var(--dn)"></p>
    <div class="row-btns full"><button class="btn pri" type="submit">${isNew?'Thêm mã':'Lưu số liệu'}</button>${!isNew&&(S.overrides[t])?'<button class="btn ghost" type="button" id="edReset">Khôi phục số liệu gốc</button>':''}</div>
    <p class="note full">Số liệu lưu trên trình duyệt này của bạn. Đơn vị phần trăm nhập số thường (15 = 15%). Để trống nếu không có.</p>
  </form>`;
  openSheet(isNew?'Thêm mã mới':'Sửa số liệu '+t,html,body=>{
    const bk=$('#e-bank',body); if(bk) bk.onchange=()=>{ $('#edFields').innerHTML=fieldHTML(bk.checked); };
    const rs=$('#edReset',body); if(rs) rs.onclick=()=>{ delete S.overrides[t]; saveState(); computeAll(); rerenderCurrent(); toast('Đã khôi phục '+t); openStock(t); };
    $('#edForm').onsubmit=e=>{ e.preventDefault();
      const b=isNew? $('#e-bank').checked : bank; const rec={};
      const num=id=>{ const el=$('#e-'+id); if(!el||el.value.trim()==='') return null; const v=parseFloat(el.value.replace(',','.')); return isFinite(v)?v:null; };
      fieldsFor(b).concat(['cap']).forEach(k=>{ rec[k]=num(k); });
      rec.f=F9.map((_,i)=>$('#e-f'+i).checked?'1':'0').join('');
      if(isNew){
        const tk=$('#e-t').value.trim().toUpperCase(), nm=$('#e-n').value.trim();
        if(!/^[A-Z0-9.]{1,10}$/.test(tk)){ $('#edErr').textContent='Mã chỉ gồm chữ in hoa, số và dấu chấm (tối đa 10 ký tự).'; return; }
        if(BY[tk]){ $('#edErr').textContent='Mã '+tk+' đã có. Mở mã đó và chọn “Sửa số liệu”.'; return; }
        if(!nm){ $('#edErr').textContent='Nhập tên công ty.'; return; }
        if(!isNum(rec.pe)||!isNum(rec.roe)){ $('#edErr').textContent='Cần ít nhất P/E và ROE để chấm điểm.'; return; }
        const obj=Object.assign({t:tk,n:nm,m:$('#e-m').value,ex:$('#e-ex').value.trim()||'—',s:b?'bank':$('#e-s').value},b?{bank:1}:{},rec);
        if(!isNum(obj.cap)) obj.cap=1;
        S.custom.push(obj); saveState(); computeAll(); rerenderCurrent(); toast('Đã thêm '+tk); openStock(tk);
      } else {
        const ov={}; Object.keys(rec).forEach(k=>{ const orig=(STOCKS.find(x=>x.t===t)||{})[k]; if(rec[k]!==orig&&!(rec[k]==null&&orig==null)) ov[k]=rec[k]; });
        if(s.custom){ const c=S.custom.find(x=>x.t===t); Object.assign(c,rec); } else if(Object.keys(ov).length) S.overrides[t]=ov; else delete S.overrides[t];
        saveState(); computeAll(); rerenderCurrent(); toast('Đã lưu số liệu '+t); openStock(t);
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
  <section style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:17px">Giao diện</h2>
    <div class="seg" role="group" aria-label="Chủ đề" id="themeSeg">${[['system','Theo máy'],['light','Sáng'],['dark','Tối']].map(([k,n])=>`<button data-th="${k}" aria-pressed="${S.theme===k}">${n}</button>`).join('')}</div></section>
  <section style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:17px">Giả định định giá</h2>
    <div class="form-grid">
      ${inp('aaaUS','Lợi suất TP AAA Mỹ (%)',st.aaaUS)}${inp('aaaVN','Lợi suất TP AAA VN (%)',st.aaaVN)}
      ${inp('rfUS','Lãi suất phi rủi ro Mỹ (%)',st.rfUS)}${inp('rfVN','Lãi suất phi rủi ro VN (%)',st.rfVN)}
      ${inp('erpUS','Phần bù rủi ro TT Mỹ (%)',st.erpUS)}${inp('erpVN','Phần bù rủi ro TT VN (%)',st.erpVN)}
      ${inp('gtUS','Tăng trưởng dài hạn Mỹ (%)',st.gtUS)}${inp('gtVN','Tăng trưởng dài hạn VN (%)',st.gtVN)}
      ${inp('fx','Tỷ giá USD/VND',st.fx,'100')}
    </div>
    <div class="row-btns"><button class="btn pri" id="sSave">Áp dụng</button><button class="btn ghost" id="sDef">Về mặc định</button></div>
    <p class="note">Chi phí vốn = lãi suất phi rủi ro + beta × phần bù rủi ro (CAPM). P/E hợp lý Graham = (8,5 + 2g) × 4,4 ÷ lợi suất AAA.</p></section>
  <section style="display:flex;flex-direction:column;gap:10px"><h2 style="font-size:17px">Dữ liệu của bạn</h2>
    <p class="note">${Object.keys(S.overrides).length} mã đã chỉnh · ${S.custom.length} mã tự thêm · ${S.stars.length} mã theo dõi · ${S.learned.length} bài đã học.</p>
    <div class="row-btns"><button class="btn sm" id="sClrEd">Xóa mọi chỉnh sửa số liệu</button><button class="btn sm" id="sClrSt">Xóa danh mục theo dõi</button><button class="btn sm" id="sClrLn">Đặt lại tiến độ học</button></div></section>
  <section style="display:flex;flex-direction:column;gap:8px"><h2 style="font-size:17px">Về phương pháp</h2>
    <p class="note"><b>Nguồn số liệu:</b> ${esc(DATA_ASOF)}. Đây là ảnh chụp tĩnh để minh họa thuật toán, không kết nối dữ liệu trực tiếp. Hãy cập nhật bằng “Sửa số liệu” từ BCTC, báo cáo thường niên hoặc nền tảng dữ liệu bạn tin cậy.</p>
    <p class="note"><b>Điểm La Bàn:</b> 6 nhân tố, mỗi chỉ số chấm 0–1 bằng 55% thứ hạng phần trăm trong nhóm cùng loại và cùng thị trường cộng 45% thang tuyệt đối; nhân tố là bình quân có trọng số các chỉ số; điểm tổng là bình quân có trọng số các nhân tố nhân với hệ số phạt cờ đỏ. Hạng A ≥ 70, B ≥ 58, C ≥ 45.</p>
    <p class="disc">${esc(DISC)}</p></section>`;
  openSheet('Cài đặt & phương pháp',html,body=>{
    $$('#themeSeg button',body).forEach(b=>b.onclick=()=>{ S.theme=b.dataset.th; saveState(); applyTheme(); $$('#themeSeg button',body).forEach(x=>x.setAttribute('aria-pressed',String(x===b))); });
    $('#sSave').onclick=()=>{ Object.keys(DEFAULT_SETTINGS).forEach(k=>{ const v=parseFloat($('#s-'+k).value); if(isFinite(v)) S.settings[k]=v; }); saveState(); computeAll(); rerenderCurrent(); toast('Đã áp dụng giả định mới'); };
    $('#sDef').onclick=()=>{ S.settings=Object.assign({},DEFAULT_SETTINGS); saveState(); computeAll(); rerenderCurrent(); openSettings(); toast('Đã về giả định mặc định'); };
    $('#sClrEd').onclick=()=>{ S.overrides={}; S.custom=[]; saveState(); computeAll(); rerenderCurrent(); toast('Đã xóa mọi chỉnh sửa'); openSettings(); };
    $('#sClrSt').onclick=()=>{ S.stars=[]; saveState(); rerenderCurrent(); toast('Đã xóa danh mục theo dõi'); openSettings(); };
    $('#sClrLn').onclick=()=>{ S.learned=[]; S.quizBest=0; store.leit={}; saveState(); rerenderCurrent(); toast('Đã đặt lại tiến độ học'); openSettings(); };
  });
}
