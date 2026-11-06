/* ============================================================
   TÌM MÃ NHANH — một ô tìm cho cả cổ phiếu Mỹ, Việt Nam và ETF; mở từ nút kính lúp hoặc phím "/"
   ============================================================ */
const RECENT_KEY='labanCoPhieu.recent';
function recentGet(){ try{ const a=JSON.parse(localStorage.getItem(RECENT_KEY)||'[]'); return Array.isArray(a)? a.filter(x=>typeof x==='string').slice(0,8) : []; }catch(e){ return []; } }
function recentAdd(t){ try{ const a=[t,...recentGet().filter(x=>x!==t)].slice(0,8); localStorage.setItem(RECENT_KEY,JSON.stringify(a)); }catch(e){} }
const fold=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d');
function searchPool(){
  const st=U.map(s=>({k:'s',t:s.t,tk:s.tk||s.t,n:s.n||'',m:s.m,o:s}));
  const et=(typeof ETFS!=='undefined'?ETFS:[]).map(e=>({k:'e',t:e.t,tk:e.t,n:e.n||'',m:'ETF',o:e}));
  return st.concat(et);
}
function searchHits(q){
  const f=fold(q).trim(); if(!f) return [];
  const pool=searchPool(); const out=[];
  pool.forEach(x=>{ const tk=x.tk.toLowerCase(); const n=fold(x.n);
    let r=-1; if(tk===f) r=0; else if(tk.startsWith(f)) r=1; else if(n.startsWith(f)) r=2; else if(n.split(/[\s,.()&-]+/).some(w=>w.startsWith(f))) r=3; else if(f.length>=3&&n.includes(f)) r=4;
    if(r>=0) out.push([r,x]); });
  out.sort((a,b)=>a[0]-b[0]||(b[1].o._score||0)-(a[1].o._score||0)||a[1].tk.localeCompare(b[1].tk));
  return out.slice(0,30).map(x=>x[1]);
}
function searchRowHTML(x){
  const s=x.o;
  const right= x.k==='s'? `<span class="grade g-${s._grade}">${s._grade}</span><b class="qs-score">${s._score}</b>` : `<span class="mk ETF">ETF</span>`;
  const px= typeof pxChip==='function'? pxChip(x.t,x.k==='e'?{etf:true}:undefined) : '';
  return `<button class="qs-row" ${x.k==='s'?`data-open="${esc(x.t)}"`:`data-etf="${esc(x.t)}"`} data-qs="${esc(x.t)}">
    <span class="qs-id"><b>${esc(x.tk)}</b>${x.k==='s'?` <span class="mk ${x.m}">${x.m}</span>`:''}<small>${esc(x.n)}</small></span>
    <span class="qs-px">${px}</span><span class="qs-r">${right}</span></button>`;
}
function openSearch(){
  openSheet(T_SEARCH.title,`<div class="qs">
    <label class="qs-box"><span class="qs-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></span>
      <input id="qsQ" type="search" inputmode="search" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${esc(T_SEARCH.ph)}" aria-label="${esc(T_SEARCH.ph)}" aria-controls="qsList"></label>
    <div id="qsList" class="qs-list" role="region" aria-live="polite"></div></div>`);
  const inp=$('#qsQ'), list=$('#qsList');
  const draw=()=>{
    const q=inp.value;
    if(!q.trim()){
      const rec=recentGet().map(t=>{ const s=BY[t]; if(s) return {k:'s',t:s.t,tk:s.tk||s.t,n:s.n||'',m:s.m,o:s}; const e=typeof EBY!=='undefined'&&EBY[t]; return e?{k:'e',t:e.t,tk:e.t,n:e.n||'',m:'ETF',o:e}:null; }).filter(Boolean);
      const top=ranked().slice(0,6).map(s=>({k:'s',t:s.t,tk:s.tk||s.t,n:s.n||'',m:s.m,o:s}));
      list.innerHTML=(rec.length?`<h3 class="qs-h">${T_SEARCH.recent}</h3>${rec.map(searchRowHTML).join('')}`:'')+`<h3 class="qs-h">${T_SEARCH.top}</h3>${top.map(searchRowHTML).join('')}`;
      return;
    }
    const hits=searchHits(q);
    list.innerHTML= hits.length? `<h3 class="qs-h">${hits.length>=30?T_SEARCH.first30:hits.length+' '+T_SEARCH.results}</h3>${hits.map(searchRowHTML).join('')}` : `<p class="empty">${T_SEARCH.none.replace('{q}',esc(q))}</p>`;
  };
  inp.addEventListener('input',draw);
  inp.addEventListener('keydown',e=>{ if(e.key==='Enter'){ const b=list.querySelector('.qs-row'); if(b){ e.preventDefault(); b.click(); } } });
  list.addEventListener('click',e=>{ const b=e.target.closest('[data-qs]'); if(b) recentAdd(b.dataset.qs); },true);
  draw(); setTimeout(()=>{ try{ inp.focus(); }catch(e){} },60);
}
function initSearch(){
  const b=$('#searchBtn'); if(b) b.onclick=openSearch;
  document.addEventListener('keydown',e=>{ if(e.key==='/'&&!e.metaKey&&!e.ctrlKey&&!/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||'')&&$('#sheet').hidden){ e.preventDefault(); openSearch(); } });
  /* biểu đồ phân bố vẽ theo đúng bề rộng màn hình: vẽ lại khi xoay máy hoặc đổi cỡ cửa sổ */
  let rz=null; window.addEventListener('resize',()=>{ clearTimeout(rz); rz=setTimeout(()=>{ const d=$('#dist'); if(d&&d.offsetParent&&typeof renderDist==='function') renderDist(); },180); });
  /* bảng giá: trên điện thoại chỉ hiện 6 dòng đầu, nút "Xem thêm" mở hết */
  document.addEventListener('click',e=>{ const m=e.target.closest('[data-bt-more]'); if(!m) return; const tb=m.previousElementSibling; if(tb){ tb.classList.toggle('all'); m.textContent=tb.classList.contains('all')?T_SEARCH.less:T_SEARCH.more; } });
}
const T_SEARCH={title:'Tìm mã',ph:'Mã hoặc tên công ty, ví dụ FPT, Apple, vàng',recent:'Xem gần đây',top:'Điểm cao nhất',results:'kết quả',first30:'30 kết quả đầu',none:'Không thấy mã nào khớp “{q}”. Thử mã niêm yết (FPT, AAPL) hoặc một từ trong tên công ty.',more:'Xem thêm',less:'Thu gọn'};
