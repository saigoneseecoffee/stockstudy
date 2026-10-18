/* ============================================================
   ETF MỸ & CẶP ĐỐI XỨNG (tăng – ngược chiều)
   ============================================================ */
const ETF_GROUP_ORDER=['Chỉ số Mỹ','Phong cách','Nhân tố','Cổ tức','Thu nhập quyền chọn','Ngành','Chủ đề','Quốc tế','Trái phiếu','Tiền mặt','Hàng hóa','Bất động sản','Tiền mã hóa','Biến động','Tiền tệ','Cổ phiếu đơn'];
const fmtF=(v,d)=>!isNum(v)?'—':v.toLocaleString('vi-VN',{minimumFractionDigits:d,maximumFractionDigits:d});
const sgnF=(v,d)=>!isNum(v)?'—':(v>0?'+':'')+fmtF(v,d);
const isLevd=e=>isNum(e.lev)&&(Math.abs(e.lev)>1.01||e.lev<0);
function levBadge(e){ if(!isNum(e.lev)||e.lev===1) return ''; const v=e.lev; return `<span class="levb ${v<0?'inv':'lng'}">${v>0?'':'−'}${fmt(Math.abs(v),Math.abs(v)%1?1:0)}x</span>`; }
function aumTxt(v){ return !isNum(v)?'—': v>=1? '$'+fmt(v,v>=100?0:1)+' tỷ' : '$'+fmt(v*1000,0)+' tr'; }
function isEStar(t){ return S.etfStars.includes(t); }
function toggleEStar(t){ if(isEStar(t)) S.etfStars=S.etfStars.filter(x=>x!==t); else S.etfStars.push(t); saveState(); toast(isEStar(t)?'Đã theo dõi '+t:'Bỏ theo dõi '+t); }

/* ---------- số liệu cặp ---------- */
function closeMap(t){ const q=liveE(t); const m=new Map(); (q&&q.hist||[]).forEach(b=>{ if(isNum(b[4])) m.set(b[0],b[4]); }); return m; }
function pairStats(i){
  const [a,b,g,u]=ETF_PAIRS[i]; const A=EBY[a]||{t:a}, B=EBY[b]||{t:b};
  const qa=liveE(a), qb=liveE(b);
  const ma=closeMap(a), mb=closeMap(b);
  const dates=[...ma.keys()].filter(d=>mb.has(d)).sort();
  const la=dates.map(d=>ma.get(d)), lb=dates.map(d=>mb.get(d));
  const ra=[], rb=[];
  for(let k=1;k<dates.length;k++){ ra.push(la[k]/la[k-1]-1); rb.push(lb[k]/lb[k-1]-1); }
  let corr=null, beta=null;
  if(ra.length>=8){
    const n=ra.length, mA=ra.reduce((x,y)=>x+y,0)/n, mB=rb.reduce((x,y)=>x+y,0)/n;
    let sab=0,saa=0,sbb=0; for(let k=0;k<n;k++){ sab+=(ra[k]-mA)*(rb[k]-mB); saa+=(ra[k]-mA)**2; sbb+=(rb[k]-mB)**2; }
    corr= saa&&sbb? sab/Math.sqrt(saa*sbb) : null; beta= saa? sab/saa : null;
  }
  const n=dates.length;
  const retA= n>=2? (la[n-1]/la[0]-1)*100 : null, retB= n>=2? (lb[n-1]/lb[0]-1)*100 : null;
  const both= n>=2? ((la[n-1]/la[0]+lb[n-1]/lb[0])/2-1)*100 : null;
  /* lợi nhuận tài sản cơ sở suy ra từ chuỗi long: tích lũy r/lev */
  let under=null; if(ra.length&&isNum(A.lev)&&A.lev){ under=(ra.reduce((p,r)=>p*(1+r/A.lev),1)-1)*100; }
  const levA=isNum(A.lev)?A.lev:1, levB=isNum(B.lev)?B.lev:-1;
  const dev= qa&&qb&&isNum(qa.pct)&&isNum(qb.pct)&&qa.d===qb.d? qa.pct/Math.abs(levA)+qb.pct/Math.abs(levB) : null;
  return {i,a,b,g,u,A,B,qa,qb,dates,la,lb,ra,rb,corr,beta,retA,retB,both,under,dev,levA,levB,n};
}
function pairMiniSVG(P,w,h){
  if(P.n<3) return `<div class="note" style="text-align:center;padding:14px 0">Chưa đủ lịch sử giá chung</div>`;
  const na=P.la.map(v=>v/P.la[0]*100), nb=P.lb.map(v=>v/P.lb[0]*100);
  const all=na.concat(nb), lo=Math.min(...all,100), hi=Math.max(...all,100);
  const X=i=>2+i/(P.n-1)*(w-4), Y=v=>h-3-(v-lo)/((hi-lo)||1)*(h-6);
  const path=a=>a.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join(' ');
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" aria-hidden="true" style="display:block"><line x1="0" x2="${w}" y1="${Y(100).toFixed(1)}" y2="${Y(100).toFixed(1)}" style="stroke:var(--line2)" stroke-dasharray="3 3"/><path d="${path(na)}" fill="none" style="stroke:var(--up)" stroke-width="1.7"/><path d="${path(nb)}" fill="none" style="stroke:var(--dn)" stroke-width="1.7"/></svg>`;
}
function pctSpan(q){ if(!q||!isNum(q.pct)) return '<span class="mut">—</span>'; return `<span class="${q.pct>0?'up':q.pct<0?'dn':'ref'}">${q.pct>0?'+':''}${fmt(q.pct,2)}%</span>`; }
function pairsStripHTML(){
  if(!ETF_PAIRS.length||!Object.keys(LIVE.e).length) return '';
  const L=ETF_PAIRS.map((p,i)=>({i,a:p[0],b:p[1],u:p[3],qa:liveE(p[0]),qb:liveE(p[1])})).filter(x=>x.qa&&x.qb&&isNum(x.qa.pct)).sort((x,y)=>Math.abs(y.qa.pct)-Math.abs(x.qa.pct)).slice(0,4);
  if(!L.length) return '';
  return `<div class="pair-strip"><div class="sec-h" style="margin:10px 0 6px"><span class="mut" style="font-size:12.5px;font-weight:600">Cặp ETF đối xứng biến động mạnh nhất</span><button class="btn sm ghost" data-gopairs="1">Tất cả cặp</button></div>
    <div class="ps-row">${L.map(x=>`<button class="ps" data-pair="${x.i}"><span class="mut">${esc(x.u)}</span><span><b>${esc(x.a)}</b> ${pctSpan(x.qa)}</span><span><b>${esc(x.b)}</b> ${pctSpan(x.qb)}</span></button>`).join('')}</div></div>`;
}

/* ---------- màn hình ETF / cặp ---------- */
function renderEtfView(){ const box=$('#etfView'); if(!box) return; if(S.scrMode==='pairs') renderPairsView(box); else renderEtfList(box); }
function renderEtfBody(){ if(S.view==='screen'&&$('#etfView')){ if(S.scrMode==='pairs') renderPairGrid(); else renderEtfRows(); } }
function etfSortVal(e,k){
  const q=liveE(e.t);
  switch(k){ case 'aum': return isNum(e.aum)?e.aum:-1; case 'er': return isNum(e.er)?-e.er:-99; case 'dy': return isNum(e.dy)?e.dy:-1;
    case 'r1y': return isNum(e.r1y)?e.r1y:-999; case 'chg': return q&&isNum(q.pct)?q.pct:-999; case 'chgabs': return q&&isNum(q.pct)?Math.abs(q.pct):-1;
    case 'b': return isNum(e.b)?e.b:-9; case 'lev': return isNum(e.lev)?Math.abs(e.lev)*(e.lev<0?1.001:1):0; case 'age': return isNum(e.inc)?-e.inc:-9999; }
  return 0;
}
function renderEtfList(box){
  const groups=ETF_GROUP_ORDER.filter(g=>ETFS.some(e=>e.grp===g));
  const nLev=ETFS.filter(isLevd).length, nInv=ETFS.filter(e=>e.lev<0).length;
  const withData=ETFS.filter(e=>!e._nf).length;
  box.innerHTML=`
  <div class="sec-h" style="margin:0"><div><h2>ETF Mỹ</h2><p>${ETFS.length} quỹ · ${nLev} quỹ đòn bẩy hoặc đảo chiều (${nInv} quỹ đảo chiều) · ${withData} quỹ có đủ thông số</p></div><button class="btn sm" data-lesson="etf-basics">ETF là gì?</button></div>
  <section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Phí × Lợi nhuận 12 tháng</h2><p>Mỗi chấm là một quỹ, kích thước theo tài sản quản lý. Quỹ đòn bẩy và đảo chiều tách hẳn khỏi nhóm thường</p></div></div><div id="etfScatter"></div></section>
  <div class="chips" role="group" aria-label="Nhóm ETF">
    <button class="chip ${S.ef.grp==='all'?'on':''}" data-eg="all" aria-pressed="${S.ef.grp==='all'}">Tất cả</button>
    <button class="chip ${S.ef.grp==='star'?'on':''}" data-eg="star" aria-pressed="${S.ef.grp==='star'}">Đang theo dõi (${S.etfStars.length})</button>
    <button class="chip ${S.ef.grp==='lev'?'on':''}" data-eg="lev" aria-pressed="${S.ef.grp==='lev'}">Đòn bẩy & đảo chiều</button>
    ${groups.map(g=>`<button class="chip ${S.ef.grp===g?'on':''}" data-eg="${esc(g)}" aria-pressed="${S.ef.grp===g}">${esc(g)}</button>`).join('')}
  </div>
  <div class="filters" style="grid-template-columns:2fr 1fr">
    <label class="field search"><span class="sr">Tìm ETF</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input type="text" id="eq" placeholder="Tìm mã, tên quỹ hoặc chỉ số" value="${esc(S.ef.q)}" autocomplete="off"></label>
    <label class="field">Sắp xếp<select id="eSort">${[['aum','Tài sản lớn nhất'],['er','Phí thấp nhất'],['dy','Cổ tức cao nhất'],['r1y','Lợi nhuận 12 tháng'],['chg','Tăng mạnh phiên gần nhất'],['chgabs','Biến động phiên mạnh nhất'],['b','Beta cao nhất'],['lev','Đòn bẩy'],['age','Lâu đời nhất']].map(([k,n])=>`<option value="${k}" ${S.ef.sort===k?'selected':''}>${n}</option>`).join('')}</select></label>
  </div>
  <div><div class="sec-h" style="margin-bottom:8px"><p id="eCount"></p><p class="mut" style="font-size:12px">Chạm để xem chi tiết quỹ</p></div><div class="list" id="eList"></div></div>
  <p class="note">Quỹ đòn bẩy và đảo chiều nhắm mục tiêu theo NGÀY; nắm giữ nhiều ngày có thể lệch xa bội số do hao mòn biến động. ${esc(DISC)}</p>`;
  $$('[data-eg]',box).forEach(b=>b.onclick=()=>{ S.ef.grp=b.dataset.eg; S.eN=60; renderEtfList(box); });
  $('#eq').oninput=e=>{ S.ef.q=e.target.value; S.eN=60; renderEtfRows(); };
  $('#eSort').onchange=e=>{ S.ef.sort=e.target.value; S.eN=60; renderEtfRows(); };
  renderEtfScatter(); renderEtfRows();
}
function etfFiltered(){
  const q=S.ef.q.trim().toLowerCase();
  return ETFS.filter(e=>(S.ef.grp==='all'||(S.ef.grp==='lev'?isLevd(e):S.ef.grp==='star'?isEStar(e.t):e.grp===S.ef.grp))&&(!q||e.t.toLowerCase().includes(q)||String(e.n||'').toLowerCase().includes(q)||String(e.idx||'').toLowerCase().includes(q)||String(e.prov||'').toLowerCase().includes(q)));
}
function etfRowHTML(e,i){
  const q=liveE(e.t); const p=e.pair;
  return `<div class="srow erow" role="button" tabindex="0" data-etf="${esc(e.t)}" aria-label="${esc(e.t)} ${esc(e.n)}">
    <span class="rk">${i+1}</span>
    <span class="nm"><b>${esc(e.t)} ${levBadge(e)}${p?`<span class="mk" title="Cặp đối xứng với ${esc(p.mate)}">⇅ ${esc(p.mate)}</span>`:''}</b><span>${q?pxChip(e.t,{etf:1})+' · ':''}${esc(e.n)}</span></span>
    <span class="emet"><span><i>Tài sản</i><b>${aumTxt(e.aum)}</b></span><span><i>Phí</i><b>${isNum(e.er)?fmt(e.er,2)+'%':'—'}</b></span><span class="hide-xs"><i>12 tháng</i><b class="${e.r1y>=0?'up':'dn'}">${sgn(e.r1y,1)}</b></span></span>
    <button class="star" data-estar="${esc(e.t)}" aria-pressed="${isEStar(e.t)}" aria-label="${isEStar(e.t)?'Bỏ theo dõi':'Theo dõi'} ${esc(e.t)}">${starSVG(isEStar(e.t))}</button>
  </div>`;
}
function renderEtfRows(){
  const box=$('#eList'); if(!box) return;
  const L=etfFiltered().sort((a,b)=>etfSortVal(b,S.ef.sort)-etfSortVal(a,S.ef.sort));
  const N=Math.min(L.length,S.eN||60);
  $('#eCount').innerHTML=`<b style="color:var(--fg)">${L.length}</b> quỹ${S.ef.grp!=='all'?' · '+esc(S.ef.grp==='lev'?'Đòn bẩy & đảo chiều':S.ef.grp==='star'?'Đang theo dõi':S.ef.grp):''}`;
  box.innerHTML= L.length? L.slice(0,N).map(etfRowHTML).join('')+(L.length>N?`<button class="btn more-btn" id="eMore">Xem thêm (còn ${L.length-N})</button>`:'') : `<div class="empty">${S.ef.grp==='star'?'Chưa theo dõi quỹ nào. Chạm ngôi sao ở một quỹ để thêm.':'Không có quỹ nào khớp.'}</div>`;
  const m=$('#eMore'); if(m) m.onclick=()=>{ S.eN=(S.eN||60)+60; const y=scrollY; renderEtfRows(); scrollTo(0,y); };
}
function renderEtfScatter(){
  const box=$('#etfScatter'); if(!box) return;
  const L=ETFS.filter(e=>isNum(e.er)&&isNum(e.r1y));
  if(L.length<5){ box.innerHTML='<p class="note">Biểu đồ hiện khi có đủ thông số quỹ.</p>'; return; }
  const W=360,H=250,p={l:40,r:12,t:12,b:34};
  const xs=L.map(e=>e.er), ys=L.map(e=>clamp(e.r1y,-95,250));
  const xmx=Math.max(1.2,Math.min(2,Math.max(...xs))); const ylo=Math.min(-60,Math.min(...ys)), yhi=Math.max(60,Math.max(...ys));
  const X=v=>p.l+clamp(v,0,xmx)/xmx*(W-p.l-p.r), Y=v=>H-p.b-(v-ylo)/(yhi-ylo)*(H-p.t-p.b);
  let g='';
  [0,.25,.5,.75,1,1.25,1.5,1.75,2].filter(v=>v<=xmx).forEach(v=>{ g+=`<line class="grid-l" x1="${X(v)}" x2="${X(v)}" y1="${p.t}" y2="${H-p.b}"/><text x="${X(v)}" y="${H-p.b+13}" text-anchor="middle">${fmt(v,2)}%</text>`; });
  const step=(yhi-ylo)>200?50:25; for(let v=Math.ceil(ylo/step)*step; v<=yhi; v+=step){ g+=`<line class="grid-l" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"${v===0?' style="stroke:var(--line2)"':''}/><text x="${p.l-5}" y="${Y(v)+3}" text-anchor="end">${v>0?'+':''}${v}%</text>`; }
  g+=`<text x="${(W+p.l)/2}" y="${H-4}" text-anchor="middle" class="lbl-strong">Phí quản lý hằng năm →</text><text transform="translate(10 ${(H-p.b)/2}) rotate(-90)" text-anchor="middle" class="lbl-strong">Lợi nhuận 12 tháng</text>`;
  const place=labelPlacer();
  const lab=new Set(L.slice().sort((a,b)=>(b.aum||0)-(a.aum||0)).slice(0,5).map(e=>e.t).concat(L.slice().sort((a,b)=>b.r1y-a.r1y).slice(0,2).map(e=>e.t)).concat(L.slice().sort((a,b)=>a.r1y-b.r1y).slice(0,2).map(e=>e.t)));
  L.slice().sort((a,b)=>(b.aum||0)-(a.aum||0)).forEach(e=>{
    const x=X(e.er), y=Y(clamp(e.r1y,-95,250)); const r=clamp(2+Math.sqrt(Math.max(0,e.aum||0))*0.55,2.2,11);
    const col= e.lev<0?'var(--dn)': isLevd(e)?'var(--gold)':'var(--us)';
    g+=`<g data-etf="${esc(e.t)}" style="cursor:pointer"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${Math.max(r,7)}" fill="transparent"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" style="fill:${col};fill-opacity:.55;stroke:${col}" stroke-width="1"/><title>${esc(e.t)}: phí ${fmt(e.er,2)}%, 12 tháng ${sgn(e.r1y,1)}, tài sản ${aumTxt(e.aum)}</title></g>`;
    if(lab.has(e.t)){ const w=e.t.length*6+2; if(place(x+r+3+w/2,y+3,w,10)) g+=`<text x="${(x+r+3).toFixed(1)}" y="${(y+3).toFixed(1)}" class="lbl-strong" style="font-size:9.5px;pointer-events:none">${esc(e.t)}</text>`; }
  });
  box.innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Phân tán phí quản lý và lợi nhuận 12 tháng của ETF">${g}</svg><div class="legend"><span><i style="background:var(--us)"></i>Quỹ thường (1x)</span><span><i style="background:var(--gold)"></i>Đòn bẩy tăng</span><span><i style="background:var(--dn)"></i>Đảo chiều</span></div>`;
}

/* ---------- cặp đối xứng ---------- */
function renderPairsView(box){
  const groups=[...new Set(ETF_PAIRS.map(p=>p[2]))];
  box.innerHTML=`
  <div class="sec-h" style="margin:0"><div><h2>Cặp ETF đối xứng</h2><p>${ETF_PAIRS.length} cặp: một quỹ tăng theo tài sản cơ sở, quỹ kia đi ngược chiều với cùng bội số</p></div><button class="btn sm" data-lesson="etf-pairs">Cách đọc cặp</button></div>
  <details class="acc pair-intro"><summary>Cách đọc chỉ số của cặp</summary><div class="acc-b">
    <div class="pi-grid">
      <div><b>Đối xứng trong một phiên</b><p>Nếu Nasdaq-100 tăng 1%, TQQQ (3x) nhắm +3% và SQQQ (−3x) nhắm −3%. Chỉ số <b>lệch</b> = %quỹ tăng ÷ bội số + %quỹ giảm ÷ bội số; càng gần 0 thì cặp càng khớp.</p></div>
      <div><b>Không đối xứng qua nhiều phiên</b><p>Mỗi quỹ tái cân bằng hằng ngày nên lợi nhuận cộng dồn bị bào mòn khi giá dao động. Ô <b>Giữ cả hai</b> cho thấy nắm 50/50 cả hai quỹ đã lãi hay lỗ bao nhiêu trong cùng kỳ — thường là số âm.</p></div>
      <div><b>Tương quan</b><p>Tương quan lợi nhuận ngày giữa hai quỹ lý tưởng là −1. Lệch xa −1 là dấu hiệu sai lệch theo dõi, phí, hoặc giá đóng cửa khác thời điểm.</p></div>
    </div></div>
  </details>
  <div class="chips" role="group" aria-label="Nhóm cặp">
    <button class="chip ${S.pf.grp==='all'?'on':''}" data-pg="all" aria-pressed="${S.pf.grp==='all'}">Tất cả</button>
    ${groups.map(g=>`<button class="chip ${S.pf.grp===g?'on':''}" data-pg="${esc(g)}" aria-pressed="${S.pf.grp===g}">${esc(g)}</button>`).join('')}
  </div>
  <div class="filters" style="grid-template-columns:1fr 1fr">
    <label class="field">Sắp xếp<select id="pSort">${[['move','Biến động phiên mạnh nhất'],['decay','Hao mòn khi giữ cả hai'],['dev','Lệch đối xứng lớn nhất'],['lev','Bội số đòn bẩy'],['grp','Theo nhóm']].map(([k,n])=>`<option value="${k}" ${S.pf.sort===k?'selected':''}>${n}</option>`).join('')}</select></label>
    <div class="seg" role="group" aria-label="Kiểu hiển thị" id="pView"><button data-pv="card" aria-pressed="${S.pView!=='table'}">Thẻ</button><button data-pv="table" aria-pressed="${S.pView==='table'}">Bảng</button></div>
  </div>
  <div id="pairGrid"></div>
  <p class="note">Giá đóng cửa cuối ngày; hiệu suất cộng dồn tính trên các phiên mà cả hai quỹ cùng có giá. Quỹ đòn bẩy/đảo chiều phù hợp giao dịch ngắn hạn có kiểm soát, không phải nắm giữ dài hạn. ${esc(DISC)}</p>`;
  $$('[data-pg]',box).forEach(b=>b.onclick=()=>{ S.pf.grp=b.dataset.pg; renderPairsView(box); });
  $('#pSort').onchange=e=>{ S.pf.sort=e.target.value; renderPairGrid(); };
  $$('[data-pv]',box).forEach(b=>b.onclick=()=>{ S.pView=b.dataset.pv; $$('[data-pv]',box).forEach(x=>x.setAttribute('aria-pressed',String(x===b))); renderPairGrid(); });
  ETF_PAIRS.forEach(p=>{ ensureHist(p[0],true); ensureHist(p[1],true); });
  renderPairGrid();
}
function pairSortVal(P,k){
  switch(k){ case 'move': return P.qa&&isNum(P.qa.pct)?Math.abs(P.qa.pct):-1; case 'decay': return isNum(P.both)?-P.both:-999;
    case 'dev': return isNum(P.dev)?Math.abs(P.dev):-1; case 'lev': return Math.abs(P.levA||1); case 'grp': return -ETF_PAIRS.findIndex(x=>x[2]===P.g)*1000-P.i; }
  return 0;
}
function renderPairGrid(){
  const box=$('#pairGrid'); if(!box) return;
  let L=ETF_PAIRS.map((p,i)=>i).filter(i=>S.pf.grp==='all'||ETF_PAIRS[i][2]===S.pf.grp).map(pairStats);
  L.sort((a,b)=>pairSortVal(b,S.pf.sort)-pairSortVal(a,S.pf.sort));
  if(S.pView==='table'){
    box.innerHTML=`<div class="scroll-x"><table class="ptab"><thead><tr><th>Tài sản cơ sở</th><th>Tăng</th><th>%</th><th>Ngược</th><th>%</th><th>Lệch</th><th>Giữ cả hai</th><th>Tương quan</th></tr></thead><tbody>${L.map(P=>`<tr data-pair="${P.i}" tabindex="0"><td><b>${esc(P.u)}</b><span class="mut">${esc(P.g)}</span></td><td><b>${esc(P.a)}</b></td><td>${pctSpan(P.qa)}</td><td><b>${esc(P.b)}</b></td><td>${pctSpan(P.qb)}</td><td>${sgnF(P.dev,2)}</td><td class="${P.both<0?'dn':'up'}">${isNum(P.both)?sgn(P.both,1):'—'}</td><td>${fmtF(P.corr,2)}</td></tr>`).join('')}</tbody></table></div>`;
  } else {
    box.innerHTML=`<div class="pair-grid">${L.map(P=>`<article class="panel pcard" role="button" tabindex="0" data-pair="${P.i}" aria-label="Cặp ${esc(P.a)} và ${esc(P.b)}">
      <div class="pc-h"><span class="mut">${esc(P.g)}</span><b>${esc(P.u)}</b></div>
      <div class="pc-sides">
        <div class="pc-side"><span class="levb lng">${fmt(Math.abs(P.levA),Math.abs(P.levA)%1?1:0)}x</span><b>${esc(P.a)}</b><span>${P.qa?fmtLivePx(P.qa):'—'}</span>${pctSpan(P.qa)}</div>
        <div class="pc-mid"><span class="mut">Lệch</span><b>${sgnF(P.dev,2)}</b></div>
        <div class="pc-side r"><span class="levb inv">−${fmt(Math.abs(P.levB),Math.abs(P.levB)%1?1:0)}x</span><b>${esc(P.b)}</b><span>${P.qb?fmtLivePx(P.qb):'—'}</span>${pctSpan(P.qb)}</div>
      </div>
      ${pairMiniSVG(P,300,54)}
      <div class="pc-foot"><span>${P.n>=2?P.n+' phiên':''}</span><span>${esc(P.a)} <b class="${P.retA>=0?'up':'dn'}">${isNum(P.retA)?sgn(P.retA,1):'—'}</b></span><span>${esc(P.b)} <b class="${P.retB>=0?'up':'dn'}">${isNum(P.retB)?sgn(P.retB,1):'—'}</b></span><span>Giữ cả hai <b class="${P.both>=0?'up':'dn'}">${isNum(P.both)?sgn(P.both,1):'—'}</b></span></div>
    </article>`).join('')}</div>`;
  }
  $$('[data-pair]',box).forEach(el=>{ el.onclick=()=>openPair(+el.dataset.pair); el.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openPair(+el.dataset.pair); } }; });
}
let OPEN_SHEET_ETF=null;
function refreshEtfSheet(info){
  if(!OPEN_SHEET_ETF) return;
  if(OPEN_SHEET_ETF.kind==='pair'){ const b=$('#pairBody'); if(b) b.innerHTML=pairBodyHTML(pairStats(OPEN_SHEET_ETF.i)); }
  else { const b=$('#etfChartSlot'); if(b) b.innerHTML=etfLineHTML(OPEN_SHEET_ETF.t); }
}
function pairScatterSVG(P){
  if(P.ra.length<5) return '';
  const W=300,H=200,p=24; const mx=Math.max(...P.ra.map(Math.abs),...P.rb.map(Math.abs),0.005);
  const X=v=>W/2+v/mx*(W/2-p), Y=v=>H/2-v/mx*(H/2-p);
  let g=`<line class="axis" x1="${p}" x2="${W-p}" y1="${H/2}" y2="${H/2}"/><line class="axis" x1="${W/2}" x2="${W/2}" y1="${p/2}" y2="${H-p/2}"/>`;
  const ideal=P.levB/P.levA; g+=`<line x1="${X(-mx)}" y1="${Y(-mx*ideal)}" x2="${X(mx)}" y2="${Y(mx*ideal)}" style="stroke:var(--gold)" stroke-dasharray="4 3" stroke-width="1.2"/>`;
  P.ra.forEach((r,k)=>{ g+=`<circle cx="${X(r).toFixed(1)}" cy="${Y(P.rb[k]).toFixed(1)}" r="2.6" style="fill:var(--us);fill-opacity:.7"/>`; });
  g+=`<text x="${W-p}" y="${H/2-4}" text-anchor="end">${esc(P.a)} →</text><text x="${W/2+4}" y="${p/2+8}">↑ ${esc(P.b)}</text><text x="${p}" y="${H-6}" style="fill:var(--gold);font-size:9px">Đứt nét: đối xứng hoàn hảo (hệ số ${fmt(ideal,2)})</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Lợi nhuận ngày của ${esc(P.a)} so với ${esc(P.b)}">${g}</svg>`;
}
function pairBigSVG(P){
  if(P.n<3) return '<p class="note">Lịch sử giá chung của hai quỹ đang được tải hoặc chưa có.</p>';
  const W=340,H=170,p={l:34,r:8,t:10,b:22};
  const na=P.la.map(v=>v/P.la[0]*100), nb=P.lb.map(v=>v/P.lb[0]*100), nh=na.map((v,i)=>(v+nb[i])/2);
  const all=na.concat(nb), lo=Math.min(...all), hi=Math.max(...all);
  const X=i=>p.l+i/(P.n-1)*(W-p.l-p.r), Y=v=>H-p.b-(v-lo)/((hi-lo)||1)*(H-p.t-p.b);
  const path=a=>a.map((v,i)=>(i?'L':'M')+X(i).toFixed(1)+' '+Y(v).toFixed(1)).join(' ');
  let g=''; [lo,(lo+hi)/2,hi].forEach(v=>g+=`<line class="grid-l" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${p.l-4}" y="${Y(v)+3}" text-anchor="end">${fmt(v,0)}</text>`);
  g+=`<line x1="${p.l}" x2="${W-p.r}" y1="${Y(100)}" y2="${Y(100)}" style="stroke:var(--line2)" stroke-dasharray="3 3"/>`;
  g+=`<path d="${path(na)}" fill="none" style="stroke:var(--up)" stroke-width="2"/><path d="${path(nb)}" fill="none" style="stroke:var(--dn)" stroke-width="2"/><path d="${path(nh)}" fill="none" style="stroke:var(--gold)" stroke-width="1.6" stroke-dasharray="5 3"/>`;
  g+=`<text x="${p.l}" y="${H-6}">${esc(fmtDate(P.dates[0]))}</text><text x="${W-p.r}" y="${H-6}" text-anchor="end">${esc(fmtDate(P.dates[P.n-1]))}</text>`;
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Diễn biến hai quỹ, chuẩn hóa về 100">${g}</svg><div class="legend"><span><i style="background:var(--up)"></i>${esc(P.a)}</span><span><i style="background:var(--dn)"></i>${esc(P.b)}</span><span><i style="background:var(--gold)"></i>Giữ cả hai 50/50</span></div>`;
}
function pairBodyHTML(P){
  const fee=(isNum(P.A.er)&&isNum(P.B.er))? (P.A.er+P.B.er)/2 : null;
  const verdict= !isNum(P.corr)? 'Chưa đủ dữ liệu để đánh giá độ khớp.' : P.corr<-0.97? 'Hai quỹ phản chiếu nhau rất sát trong từng phiên.' : P.corr<-0.9? 'Khớp tốt nhưng có sai lệch nhỏ (phí, thời điểm định giá, tái cân bằng).' : 'Độ khớp kém — kiểm tra lại cơ chế, tài sản cơ sở và tính thanh khoản.';
  return `
  <div class="pc-sides big">
    <div class="pc-side"><span class="levb lng">${fmt(Math.abs(P.levA),Math.abs(P.levA)%1?1:0)}x</span><b>${esc(P.a)}</b><span>${P.qa?fmtLivePx(P.qa):'—'}</span>${pctSpan(P.qa)}</div>
    <div class="pc-mid"><span class="mut">Lệch phiên</span><b>${sgnF(P.dev,2)}</b><span class="mut" style="font-size:11px">điểm %</span></div>
    <div class="pc-side r"><span class="levb inv">−${fmt(Math.abs(P.levB),Math.abs(P.levB)%1?1:0)}x</span><b>${esc(P.b)}</b><span>${P.qb?fmtLivePx(P.qb):'—'}</span>${pctSpan(P.qb)}</div>
  </div>
  <section class="panel"><div class="sec-h"><div><h2 style="font-size:16px">Diễn biến chuẩn hóa</h2><p>${P.n} phiên chung · cả hai bắt đầu từ 100</p></div></div>${pairBigSVG(P)}</section>
  <div class="kv kv4">
    <div><span>${esc(P.a)} cả kỳ</span><b class="${P.retA>=0?'up':'dn'}">${sgn(P.retA,1)}</b><span>bội số ${fmt(P.levA,1)}x</span></div>
    <div><span>${esc(P.b)} cả kỳ</span><b class="${P.retB>=0?'up':'dn'}">${sgn(P.retB,1)}</b><span>bội số ${fmt(P.levB,1)}x</span></div>
    <div><span>Giữ cả hai 50/50</span><b class="${P.both>=0?'up':'dn'}">${sgn(P.both,1)}</b><span>hao mòn + phí</span></div>
    <div><span>Tài sản cơ sở (suy ra)</span><b class="${P.under>=0?'up':'dn'}">${sgn(P.under,1)}</b><span>${isNum(P.under)&&isNum(P.retA)?'×'+fmt(P.levA,0)+' = '+sgn(P.under*P.levA,0)+' nếu không hao mòn':''}</span></div>
    <div><span>Tương quan ngày</span><b>${fmtF(P.corr,3)}</b><span>lý tưởng −1</span></div>
    <div><span>Hệ số ngày (beta)</span><b>${fmtF(P.beta,2)}</b><span>lý tưởng ${fmt(P.levB/P.levA,2)}</span></div>
    <div><span>Phí bình quân</span><b>${isNum(fee)?fmt(fee,2)+'%':'—'}</b><span>mỗi năm</span></div>
    <div><span>Tài sản quản lý</span><b>${aumTxt(P.A.aum)}</b><span>${esc(P.b)}: ${aumTxt(P.B.aum)}</span></div>
  </div>
  <section class="panel"><div class="sec-h"><div><h2 style="font-size:16px">Lợi nhuận ngày đối chiếu</h2><p>${esc(verdict)}</p></div></div>${pairScatterSVG(P)||'<p class="note">Cần ít nhất 5 phiên chung.</p>'}</section>
  <div class="disc">Vì sao giữ cả hai vẫn lỗ? Giả sử tài sản cơ sở +10% rồi −9,09% (về đúng giá cũ). Quỹ 3x: +30% rồi −27,3% → còn 94,5. Quỹ −3x: −30% rồi +27,3% → còn 89,1. Cả hai đều mất tiền dù chỉ số đứng yên — đó là hao mòn biến động (volatility decay), tăng theo bình phương bội số × phương sai.</div>`;
}
function openPair(i){
  const p=ETF_PAIRS[i]; if(!p) return; ensureHist(p[0],true); ensureHist(p[1],true);
  OPEN_SHEET_ETF={kind:'pair',i};
  openSheet(`Cặp ${p[0]} ⇅ ${p[1]}`,`<p class="sub" style="margin:0 0 8px">${esc(p[3])} · ${esc(p[2])}</p><div id="pairBody">${pairBodyHTML(pairStats(i))}</div>
    <div class="row-btns"><button class="btn" data-etf-open="${esc(p[0])}">Chi tiết ${esc(p[0])}</button><button class="btn" data-etf-open="${esc(p[1])}">Chi tiết ${esc(p[1])}</button><button class="btn" data-etf-chart="${esc(p[0])}">Nến ${esc(p[0])}</button><button class="btn ghost" data-lesson="etf-decay">Học về hao mòn</button></div>`,body=>{
      $$('[data-etf-open]',body).forEach(b=>b.onclick=()=>openEtf(b.dataset.etfOpen));
      $$('[data-etf-chart]',body).forEach(b=>b.onclick=()=>{ closeSheet(); CH.t='E:'+b.dataset.etfChart; CH.offset=0; setView('chart'); });
    });
  sheetOnClose=()=>{ OPEN_SHEET_ETF=null; };
}
function etfLineHTML(t){
  const q=liveE(t); const c=(q&&q.hist||[]).map(b=>b[4]).filter(isNum);
  if(c.length<3) return '<p class="note">Lịch sử giá đang được tải hoặc chưa có.</p>';
  return `<div style="margin-top:4px">${sparkSVG(q,320,70).replace('width="320"','width="100%"')}</div>`;
}
function feeDragHTML(e){
  if(!isNum(e.er)) return '';
  const r=7, yrs=[1,5,10,20]; const base=y=>10000*Math.pow(1+r/100,y), net=y=>10000*Math.pow((1+r/100)*(1-e.er/100),y);
  return `<section class="panel"><div class="sec-h"><div><h2 style="font-size:16px">Phí ăn mòn bao nhiêu?</h2><p>Đầu tư $10.000, giả định thị trường tăng ${r}%/năm, so với cùng danh mục không mất phí</p></div></div>
    <table class="thr"><tr><th>Sau</th><th>Không phí</th><th>Phí ${fmt(e.er,2)}%</th><th>Mất vì phí</th></tr>${yrs.map(y=>`<tr><td>${y} năm</td><td>$${fmt(base(y),0)}</td><td>$${fmt(net(y),0)}</td><td class="dn">−$${fmt(base(y)-net(y),0)}</td></tr>`).join('')}</table></section>`;
}
function openEtf(t){
  const e=EBY[t]; if(!e) return; ensureHist(t,true);
  OPEN_SHEET_ETF={kind:'etf',t};
  const p=e.pair; const lv=isLevd(e);
  const html=`
  <div class="dt-top"><div><h2>${esc(e.t)} ${levBadge(e)}</h2><p class="sub">${esc(e.n)}${e.prov?' · '+esc(e.prov):''}<br>${esc(e.grp)}${e.idx?' · theo '+esc(e.idx):''}</p>
    <div class="row-btns" style="margin-top:10px"><span class="mk US" style="align-self:center">ETF MỸ</span><button class="btn sm" id="eStarBtn" aria-pressed="${isEStar(e.t)}"><span class="star" style="width:auto;height:auto;color:${isEStar(e.t)?'var(--ref)':'inherit'}">${starSVG(isEStar(e.t))}</span>${isEStar(e.t)?'Đang theo dõi':'Theo dõi'}</button></div></div></div>
  <div id="liveSlot" data-t="${esc(e.t)}" data-etf="1">${liveBlockHTML(e,true)}</div>
  ${lv?`<div class="disc" style="border-color:var(--dn)"><b class="dn">Quỹ ${e.lev<0?'đảo chiều':'đòn bẩy'} ${fmt(e.lev,1)}x theo ngày.</b> Mục tiêu chỉ đúng cho từng phiên; nắm giữ nhiều phiên có thể lệch xa ${fmt(e.lev,1)}× lợi nhuận tài sản cơ sở, kể cả khi bạn đoán đúng hướng. Phù hợp giao dịch ngắn hạn có kế hoạch cắt lỗ.</div>`:''}
  <div class="kv kv4">
    <div><span>Tài sản quản lý</span><b>${aumTxt(e.aum)}</b><span>${isNum(e.hold)?e.hold+' khoản nắm giữ':'—'}</span></div>
    <div><span>Phí quản lý</span><b>${isNum(e.er)?fmt(e.er,2)+'%':'—'}</b><span>mỗi năm</span></div>
    <div><span>Tỷ suất cổ tức</span><b>${isNum(e.dy)?fmt(e.dy,2)+'%':'—'}</b><span>12 tháng</span></div>
    <div><span>Beta</span><b>${fmt(e.b,2)}</b><span>so với S&amp;P 500</span></div>
    <div><span>Lợi nhuận 12 tháng</span><b class="${e.r1y>=0?'up':'dn'}">${sgn(e.r1y,1)}</b><span>tổng lợi nhuận</span></div>
    <div><span>Bình quân năm</span><b class="${e.rinc>=0?'up':'dn'}">${sgn(e.rinc,1)}</b><span>${isNum(e.inc)?'từ khi lập '+e.inc:'từ khi thành lập'}</span></div>
    <div><span>Vùng 52 tuần</span><b style="font-size:15px">${isNum(e.w52l)?'$'+fmt(e.w52l,2)+' – $'+fmt(e.w52h,2):'—'}</b><span></span></div>
    <div><span>Loại</span><b style="font-size:14px">${esc(e.cls||'—')}</b><span>${esc(e.cat||'')}</span></div>
  </div>
  ${e.top?`<p class="note"><b>Nắm giữ lớn nhất:</b> ${esc(e.top)}</p>`:''}
  ${p?`<section class="panel pair-link"><div class="sec-h"><div><h2 style="font-size:16px">Cặp đối xứng</h2><p>${esc(e.t)} ${p.side==='L'?'tăng':'đi ngược'} theo ${esc(p.u)}; quỹ đối ứng là <b>${esc(p.mate)}</b></p></div><button class="btn sm" id="ePair">Xem cặp</button></div>
     <div class="pc-sides"><div class="pc-side"><b>${esc(p.side==='L'?e.t:p.mate)}</b>${pctSpan(liveE(p.side==='L'?e.t:p.mate))}</div><div class="pc-mid"><span class="mut">⇅</span></div><div class="pc-side r"><b>${esc(p.side==='L'?p.mate:e.t)}</b>${pctSpan(liveE(p.side==='L'?p.mate:e.t))}</div></div></section>`:''}
  ${feeDragHTML(e)}
  <div class="row-btns"><button class="btn pri" id="eChart">Biểu đồ nến</button>${p?`<button class="btn" id="ePair2">So với ${esc(p.mate)}</button>`:''}<button class="btn ghost" data-lesson="${lv?'etf-decay':'etf-basics'}">Học thêm</button></div>
  <p class="disc">${esc(DISC)} Nguồn thông số quỹ: stockanalysis.com${e._nf?' (chưa tải được thông số cho quỹ này)':''}.</p>`;
  openSheet(e.t+' — '+e.n,html,body=>{
    $('#eStarBtn',body).onclick=()=>{ toggleEStar(e.t); openEtf(e.t); if(S.view==='screen') renderEtfBody(); };
    $('#eChart',body).onclick=()=>{ closeSheet(); CH.t='E:'+e.t; CH.offset=0; setView('chart'); };
    const pp=()=>openPair(p.i); const a=$('#ePair',body); if(a) a.onclick=pp; const b2=$('#ePair2',body); if(b2) b2.onclick=pp;
  });
  sheetOnClose=()=>{ OPEN_SHEET_ETF=null; };
}

/* ---------- bài học ETF ---------- */
const ETF_LESSONS=[
 {id:'etf-basics',g:'ETF',t:'ETF là gì?',d:'Một giỏ tài sản giao dịch như cổ phiếu',
  vis:()=>sv(`<rect x="12" y="20" width="80" height="86" rx="10" style="fill:var(--s1);stroke:var(--gold)"/>${T(52,38,'1 chứng chỉ ETF','text-anchor="middle" '+TB)}${[0,1,2,3,4,5].map(i=>`<rect x="${22+(i%3)*22}" y="${50+Math.floor(i/3)*24}" width="18" height="18" rx="4" style="fill:${['var(--us)','var(--up)','var(--gold)','var(--vn)','var(--mut)','var(--dn)'][i]};fill-opacity:.7"/>`).join('')}<path d="M100 63 h22" style="stroke:var(--fg)" stroke-width="1.5" marker-end="url(#ar)"/><defs><marker id="ar" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L8 4L0 8z" style="fill:var(--fg)"/></marker></defs>${T(160,40,'Mua bán cả ngày','text-anchor="middle" '+TB)}${T(160,56,'như một cổ phiếu','text-anchor="middle" '+TS)}${T(160,78,'Phí 0,03–1%/năm','text-anchor="middle" '+TB)}${T(160,94,'Minh bạch danh mục','text-anchor="middle" '+TS)}`,'ETF là một giỏ tài sản'),
  f:'Giá ETF ≈ NAV mỗi chứng chỉ · Lợi nhuận ròng = Lợi nhuận chỉ số − Phí − Sai lệch theo dõi',
  pts:['ETF (quỹ hoán đổi danh mục) nắm một rổ cổ phiếu, trái phiếu hoặc hàng hóa và niêm yết trên sàn; bạn mua một chứng chỉ là sở hữu một phần cả rổ.','Cơ chế tạo lập/mua lại của các thành viên lập quỹ (authorized participants) giữ giá thị trường sát giá trị tài sản ròng (NAV); chênh lệch lớn thường chỉ ở quỹ ít thanh khoản hoặc tài sản ở thị trường đóng cửa.','Ba thông số đầu tiên cần xem: phí quản lý (expense ratio), quy mô tài sản (AUM) và thanh khoản/chênh lệch mua–bán. Quỹ nhỏ dưới vài chục triệu USD có rủi ro bị đóng.','ETF chỉ số thụ động (SPY, VOO, VTI) có phí rất thấp; ETF chủ đề, chủ động và đòn bẩy phí cao hơn nhiều.','Tại Mỹ, ETF thường hiệu quả thuế hơn quỹ mở nhờ cơ chế hoán đổi hiện vật. Nhà đầu tư Việt Nam mua ETF Mỹ qua tài khoản môi giới quốc tế cần lưu ý thuế khấu trừ cổ tức 30% (hoặc thấp hơn theo hiệp định).','Việt Nam có ETF nội (E1VFVN30, FUEVFVND, FUESSVFL…) theo dõi VN30 và các chỉ số Diamond, Finlead; còn VNM (VanEck Vietnam) là ETF niêm yết ở Mỹ đầu tư vào cổ phiếu Việt Nam.'],
  thr:[['Phí quản lý','Dưới 0,2% với quỹ chỉ số lớn là tốt'],['Tài sản quản lý','Trên 1 tỷ USD: thanh khoản và độ bền tốt'],['Sai lệch theo dõi','Dưới 0,1–0,2 điểm %/năm với quỹ chỉ số']],
  hook:'<b>Mẹo nhớ:</b> với hai quỹ theo cùng một chỉ số, quỹ rẻ hơn gần như luôn thắng về dài hạn.',src:'SEC Investor Bulletin: Exchange-Traded Funds; ICI Factbook 2025; Bogle, The Little Book of Common Sense Investing (2017).'},
 {id:'etf-decay',g:'ETF',t:'ETF đòn bẩy, đảo chiều và hao mòn biến động',d:'Vì sao 3x không phải là 3 lần lợi nhuận năm',
  vis:()=>{ const path=(arr,col)=>`<path d="${arr.map((v,i)=>(i?'L':'M')+(14+i*17.2).toFixed(1)+' '+(110-(v-40)*0.9).toFixed(1)).join(' ')}" fill="none" style="stroke:${col}" stroke-width="2"/>`;
    const u=[100],l=[100],s=[100]; for(let i=1;i<11;i++){ const r=i%2?0.1:-0.0909; u.push(u[i-1]*(1+r)); l.push(l[i-1]*(1+3*r)); s.push(s[i-1]*(1-3*r)); }
    return sv(`<line class="grid-l" x1="14" x2="186" y1="${110-(100-40)*0.9}" y2="${110-(100-40)*0.9}"/>${path(u,'var(--mut)')}${path(l,'var(--up)')}${path(s,'var(--dn)')}${T(186,18,'Chỉ số dao động ±10%','text-anchor="end" '+TS)}${T(186,30,'xám: chỉ số · xanh: 3x · đỏ: −3x','text-anchor="end" '+TS)}`,'Hao mòn biến động khi giá dao động'); },
  f:'Lợi nhuận dài hạn ≈ L × R − (L² − L) × σ² × T ÷ 2 − phí  (L: bội số ngày, σ: biến động năm)',
  pts:['Quỹ 2x, 3x, −1x, −3x tái cân bằng mỗi cuối phiên để giữ đúng bội số cho NGÀY HÔM SAU. Mục tiêu chỉ đúng cho từng ngày riêng lẻ.','Khi giá đi theo xu hướng một chiều, cộng dồn có thể cho kết quả tốt hơn L lần. Khi giá đi ngang dao động, cả quỹ tăng lẫn quỹ đảo chiều đều mất giá — hao mòn tỷ lệ với bình phương bội số và phương sai.','Ví dụ: chỉ số +10% rồi −9,09% (về đúng giá cũ). Quỹ 3x còn 94,5; quỹ −3x còn 89,1. Chỉ số đứng yên mà cả hai quỹ đều lỗ.','Phí của quỹ đòn bẩy thường 0,9–1,1%/năm, cộng chi phí hoán đổi (swap) và vay; quỹ đảo chiều về dài hạn hầu như luôn đi xuống vì thị trường có xu hướng tăng.','Quỹ biến động (UVXY, VIXY) nắm hợp đồng tương lai VIX và chịu thêm chi phí cuộn hợp đồng (contango) — giá giảm dần theo thời gian trong điều kiện bình thường.','Quỹ đòn bẩy cổ phiếu đơn (TSLL, NVDL…) cộng thêm rủi ro tập trung: một phiên giảm 34% với quỹ 3x có thể xóa gần hết vốn.'],
  thr:[['Nắm giữ quỹ 3x','Vài ngày đến vài tuần, có điểm cắt lỗ'],['Biến động chỉ số 20%/năm','Hao mòn năm của 3x ≈ 3 × 0,04 = 12% trước phí'],['Quỹ đảo chiều','Dùng để phòng hộ ngắn hạn, không phải để giữ']],
  hook:'<b>Mẹo nhớ:</b> “Đòn bẩy theo ngày, hao mòn theo năm.”',src:'SEC & FINRA Investor Alert: Leveraged and Inverse ETFs (2009, cập nhật 2024); Cheng & Madhavan, The Dynamics of Leveraged and Inverse ETFs, Journal of Investment Management (2009); Avellaneda & Zhang, Path-dependence of Leveraged ETF Returns (2010).'},
 {id:'etf-pairs',g:'ETF',t:'Đọc cặp ETF đối xứng',d:'Lệch phiên, tương quan, giữ cả hai',
  vis:()=>sv(`<rect x="10" y="22" width="76" height="80" rx="9" style="fill:var(--s1);stroke:var(--up)"/><rect x="114" y="22" width="76" height="80" rx="9" style="fill:var(--s1);stroke:var(--dn)"/>${T(48,44,'TQQQ','text-anchor="middle" style="font-size:12px;font-weight:800;fill:var(--up);font-family:var(--f-disp)"')}${T(152,44,'SQQQ','text-anchor="middle" style="font-size:12px;font-weight:800;fill:var(--dn);font-family:var(--f-disp)"')}${T(48,64,'+3,0%','text-anchor="middle" '+TB)}${T(152,64,'−2,9%','text-anchor="middle" '+TB)}${T(48,84,'÷ 3 = +1,00','text-anchor="middle" '+TS)}${T(152,84,'÷ 3 = −0,97','text-anchor="middle" '+TS)}${T(100,64,'⇅','text-anchor="middle" style="font-size:16px"')}${T(100,118,'Lệch = +1,00 − 0,97 = +0,03','text-anchor="middle" '+TB)}`,'Cách tính độ lệch đối xứng'),
  f:'Lệch phiên = %quỹ tăng ÷ |bội số| + %quỹ ngược ÷ |bội số| · Lý tưởng: lệch ≈ 0, tương quan ≈ −1',
  pts:['Mỗi cặp gồm một quỹ tăng theo tài sản cơ sở và một quỹ đi ngược chiều cùng bội số (ví dụ TQQQ 3x và SQQQ −3x theo Nasdaq-100).','Lệch phiên quy cả hai quỹ về “điểm % của tài sản cơ sở”. Lệch vài phần trăm điểm là bình thường (phí, cổ tức, thời điểm định giá); lệch lớn nhiều phiên là dấu hiệu bất thường.','Giữ cả hai 50/50 là phép thử hao mòn: nếu hai quỹ phản chiếu hoàn hảo trong một phiên thì danh mục đứng yên phiên đó, nhưng cộng dồn nhiều phiên vẫn âm do mỗi quỹ tự tái cân bằng.','Tương quan lợi nhuận ngày gần −1 cho biết cặp khớp tốt; hệ số beta ngày nên gần tỷ lệ bội số (−1 với cặp cùng mức đòn bẩy).','Dùng cặp để: phòng hộ ngắn hạn (mua quỹ ngược thay vì bán khống), kiểm tra chất lượng sản phẩm trước khi giao dịch, và thấy tận mắt chi phí của đòn bẩy.'],
  thr:[['Tương quan dưới −0,97','Khớp rất tốt'],['Giữ cả hai âm vài %/tháng','Hao mòn + phí điển hình của cặp 3x'],['Lệch phiên trên 0,3 điểm','Kiểm tra lại sản phẩm']],
  hook:'<b>Mẹo nhớ:</b> hai quỹ ngược chiều không triệt tiêu nhau về lâu dài — chúng cùng chịu hao mòn.',src:'ProShares & Direxion prospectus (mục “Daily objective”); FINRA Regulatory Notice 09-31.'},
 {id:'etf-pick',g:'ETF',t:'Chọn ETF như chuyên gia',d:'Bảng kiểm 7 bước',
  vis:()=>sv(`${['Mục tiêu & chỉ số','Phí quản lý','Quy mô (AUM)','Thanh khoản','Sai lệch theo dõi','Cấu trúc & thuế','Trùng lặp danh mục'].map((x,i)=>`<rect x="12" y="${8+i*16}" width="176" height="13" rx="4" style="fill:var(--s1);stroke:var(--line2)"/><text x="20" y="${18+i*16}" style="font-size:8.5px">${i+1}. ${x}</text>`).join('')}`,'Bảng kiểm chọn ETF'),
  f:'Chi phí sở hữu tổng = Phí quản lý + Chênh lệch mua–bán + Sai lệch theo dõi (+ chi phí cuộn với quỹ hàng hóa)',
  pts:['Bắt đầu từ mục tiêu: thị trường rộng (VOO, VTI), phong cách (VUG, VTV), cổ tức (SCHD, VIG), trái phiếu (BND, IEF), hay phòng hộ (GLD, SH).','So phí giữa các quỹ cùng chỉ số: VOO, IVV, SPLG đều theo S&P 500 với phí 0,02–0,03%; SPY phí 0,09% nhưng thanh khoản quyền chọn tốt nhất.','Quỹ hàng hóa (USO, UNG) nắm hợp đồng tương lai, không nắm hàng hóa thật — chịu chi phí cuộn khi đường cong kỳ hạn dốc lên.','Quỹ thu nhập quyền chọn (JEPI, QYLD) trả cổ tức cao nhờ bán call, đổi lại bị giới hạn phần tăng giá.','Kiểm tra trùng lặp: QQQ và XLK chung phần lớn cổ phiếu lớn; giữ cả hai không đa dạng hóa thêm bao nhiêu.'],
  thr:[['Phí quỹ chỉ số lớn','0,02–0,10%'],['Phí quỹ chủ đề/chủ động','0,35–0,95%'],['Chênh lệch mua–bán','Dưới 0,05% với quỹ lớn']],
  hook:'<b>Mẹo nhớ:</b> đọc tên chỉ số trước, đọc tên quỹ sau.',src:'Morningstar, ETF Due Diligence Framework; Vanguard Research, The case for low-cost index-fund investing (2024).'}
];
ETF_LESSONS.forEach(l=>LESSONS.push(l));
ORDER.splice(ORDER.indexOf('Quyền chọn (Options)')+1,0,'ETF');
LESSONS.sort((a,b)=>ORDER.indexOf(a.g)-ORDER.indexOf(b.g));
[
 {q:'Chỉ số tăng 10% rồi giảm 9,09% (về giá cũ). Quỹ 3x theo ngày còn bao nhiêu từ 100?',a:['94,5','100','90','103'],c:0,e:'1,30 × (1 − 0,2727) ≈ 0,945. Hao mòn biến động.'},
 {q:'Vì sao giữ đồng thời TQQQ và SQQQ nhiều tuần thường lỗ?',a:['Cả hai tái cân bằng hằng ngày nên cùng chịu hao mòn và phí','Vì một quỹ luôn tăng','Vì thuế','Vì hai quỹ khác chỉ số'],c:0,e:'Không có lợi nhuận phi rủi ro từ hai quỹ ngược chiều.'},
 {q:'Với hai ETF theo cùng chỉ số S&P 500, yếu tố nào quyết định nhiều nhất lợi nhuận dài hạn?',a:['Phí quản lý','Tên nhà phát hành','Giá mỗi chứng chỉ','Số khoản nắm giữ'],c:0,e:'Cùng danh mục thì chênh lệch chủ yếu đến từ phí và sai lệch theo dõi.'},
 {q:'Độ lệch đối xứng của cặp 3x/−3x khi TQQQ +3,0% và SQQQ −2,9%?',a:['+0,03 điểm %','+0,1','−5,9','0'],c:0,e:'3,0/3 − 2,9/3 = 1,00 − 0,967 ≈ 0,03.'},
 {q:'Tương quan lợi nhuận ngày lý tưởng của một cặp tăng – ngược chiều là?',a:['−1','0','+1','−3'],c:0,e:'Hai quỹ phản chiếu nhau hoàn toàn trong từng phiên.'},
 {q:'UVXY về dài hạn thường giảm giá chủ yếu do?',a:['Chi phí cuộn hợp đồng tương lai VIX (contango) và đòn bẩy','Cổ tức cao','Thuế','Phí quản lý thấp'],c:0,e:'Quỹ biến động không nắm chỉ số VIX trực tiếp.'}
].forEach(q=>QUIZ.push(q));
