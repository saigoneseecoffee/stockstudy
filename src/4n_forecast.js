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
const LOCALE='vi-VN';
const T_FC={h:'Dự báo giá ngắn hạn',sub:'Mô hình tổng hợp (xu hướng + trung bình động + đảo chiều) trên {n} phiên giá gần nhất',
nodata:'Chưa đủ lịch sử giá (cần ít nhất 17 phiên).',hl:{1:'1 phiên',3:'3 phiên',7:'7 phiên',21:'1 tháng'},
c0:'Tầm',c1:'Giá dự kiến',c2:'Khoảng 80%',c3:'Xác suất tăng',c4:'Mô hình đoán chiều tốt nhất',
note:'Giá dự kiến là trung tâm của một khoảng rộng: 80% khả năng giá rơi vào khoảng bên cạnh nếu biến động giữ như 40 phiên qua. Cột cuối là mô hình đoán đúng chiều nhiều nhất khi kiểm định quay lui trên cùng thị trường; dấu xanh chỉ khi nó tốt hơn đoán bừa một cách có ý nghĩa thống kê. Dự báo giá ngắn hạn gần như luôn chỉ nhỉnh hơn tung đồng xu — đừng dùng để giao dịch.',
mn:{trend:'Xu hướng',ma:'Trung bình động',rev:'Đảo chiều',ens:'Tổng hợp',naive:'Giữ nguyên'},
md:{trend:'tiếp nối lợi nhuận bình quân 20 phiên',ma:'độ dốc MA5 so với MA20',rev:'hoàn lại một nửa nhịp 5 phiên',ens:'bình quân ba mô hình'},
loading:'Đang tải kết quả kiểm định…',gUS:'Cổ phiếu Mỹ',gVN:'Cổ phiếu Việt Nam',gE:'ETF Mỹ',noboard:'Chưa có kết quả kiểm định cho nhóm này.',
bsub:'{n} lần dự báo đã kiểm định',mcol:'Mô hình',always:'Luôn đoán theo đa số',upw:'luôn tăng',dnw:'luôn giảm',mae:'sai số',
naive:'Giữ nguyên giá',naived:'mốc so sánh sai số',score:'Điểm La Bàn',scored:'top 20 thắng mã trung vị',picks:'lượt',wait:'chờ thêm dữ liệu',
bh:'So sánh thuật toán dự báo',bp:'Mỗi ngày t trong lịch sử, mô hình chỉ thấy giá đến t rồi đoán chiều và giá sau 1, 3, 7 phiên và 1 tháng; sau đó so với giá thật.',
bhow:'Ô số lớn là tỷ lệ đoán đúng chiều, dòng nhỏ là sai số giá bình quân. Ô in đậm là mô hình đúng chiều nhiều nhất ở tầm đó; dấu ✓ chỉ khi nó vượt cả 50% lẫn cách "luôn đoán theo đa số" hơn 2 sai số chuẩn. Dòng Điểm La Bàn đo việc khác: 20 mã điểm cao nhất có tăng hơn mã trung vị của thị trường hay không.',
bcav:'Lịch sử dùng để kiểm định chỉ khoảng 80 phiên và chồng lấn nhau, nên tỷ lệ chênh 1–3% so với 50% thường chỉ là nhiễu. Nếu không mô hình nào có dấu ✓, nghĩa là ở tầm đó giá ngắn hạn không dự báo được bằng các mô hình này — đó là kết quả trung thực, không phải lỗi.',
imp:{pos:'Tích cực',neg:'Tiêu cực',mix:'Hai chiều'},all:'Toàn cầu',nh:'Tin kinh tế – chính trị',np:'Sự kiện có thể ảnh hưởng cổ phiếu · cập nhật {d}',
nst:'Tin liên quan',nsp:'Sự kiện gần đây ảnh hưởng tới mã, ngành hoặc thị trường của mã này'};
