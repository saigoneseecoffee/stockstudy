/* ============================================================
   CHU KỲ LỢI NHUẬN — doanh nghiệp bán theo giá hàng hóa và ngành chu kỳ
   Một ảnh chụp chỉ số 12 tháng làm cổ phiếu chu kỳ ở đỉnh lợi nhuận trông vừa rẻ vừa tốt.
   Ở đây lợi nhuận hiện tại được so với bình quân 5 năm tài chính gần nhất (EPSH hoặc trường eh
   do tác vụ hằng ngày ghi); khi lợi nhuận đang gấp ≥ 2 lần bình quân (hoặc bình quân ≤ 0),
   P/E, EV/EBITDA và tỷ suất FCF được quy về mức lợi nhuận bình quân trước khi chấm điểm.
   ============================================================ */
const COMMODITY_SUB=/^(Gold|Silver|Copper|Aluminum|Steel|Diversified Metals & Mining|Precious Metals & Minerals|Commodity Chemicals|Fertilizers & Agricultural Chemicals|Oil & Gas Exploration & Production|Integrated Oil & Gas|Oil & Gas Refining & Marketing|Oil & Gas Equipment & Services|Oil & Gas Drilling|Coal & Consumable Fuels)$/;
const CYCLICAL_SUB=/^(Homebuilding|Automobile Manufacturers|Passenger Airlines|Construction Machinery & Heavy Transportation Equipment|Agricultural & Farm Machinery|Construction Materials|Semiconductor Materials & Equipment|Marine Transportation|Paper & Plastic Packaging Products & Materials)$/;
const MEMORY_TK=new Set(['MU','SNDK','WDC','STX']);   /* chip nhớ, ổ lưu trữ: giá bán theo chu kỳ cung cầu */
const CYC_PEAK=2;   /* EPS 12 tháng ≥ 2 lần bình quân 5 năm = đỉnh chu kỳ */
function cycleKind(s){
  if(s.bank) return null;
  if(s.m==='US'){
    if(COMMODITY_SUB.test(s.sub||'')||MEMORY_TK.has(s.tk||s.t)) return 'commodity';
    if(CYCLICAL_SUB.test(s.sub||'')) return 'cyclical';
    return null;
  }
  if(s.s==='mat'||s.s==='energy'||s.s==='agri') return 'commodity';
  if(s.s==='broker'||s.s==='build') return 'cyclical';
  return null;
}
function epsInfo(s){
  let raw=typeof s.eh==='string'&&s.eh? s.eh : null;
  if(!raw&&typeof EPSH!=='undefined'&&EPSH[s.m]) raw=EPSH[s.m][s.tk||s.t]||null;
  if(!raw) return null;
  let ttm=null; const fy=[];
  raw.split(';').forEach(p=>{ const [k,v]=p.split(':'); const x=parseFloat(v); if(!isFinite(x)) return; if(k==='T') ttm=x; else if(/^\d{4}$/.test(k)) fy.push([+k,x]); });
  fy.sort((a,b)=>b[0]-a[0]);
  const last=fy.slice(0,5); if(last.length<3) return null;
  const avg=last.reduce((a,b)=>a+b[1],0)/last.length;
  const now=isNum(ttm)? ttm : last[0][1];
  const neg=last.filter(x=>x[1]<=0).length;
  const ratio= avg>0? now/avg : Infinity;
  /* P/E trên EPS bình quân, giữ đúng giá hiện tại: P/E × (EPS hiện tại ÷ EPS bình quân) */
  const peAvg= avg>0&&isNum(s.pe)&&s.pe>0&&now>0? s.pe*ratio : (avg<=0? -1 : null);
  return {ttm:now,fy:last,avg,n:last.length,neg,ratio,peAvg};
}
function prepCycle(s){
  s._cyc=cycleKind(s); s._eps=epsInfo(s);
  s._peak=!!(s._cyc&&s._eps&&(s._eps.avg<=0||s._eps.ratio>=CYC_PEAK));
  s._k= s._peak? (s._eps.avg>0? Math.min(s._eps.ratio,8) : Infinity) : 1;
}
const CYC_LABEL={commodity:'Chu kỳ · giá hàng hóa',cyclical:'Chu kỳ'};
/* ghi chú riêng của từng trường phái khi gặp cổ phiếu chu kỳ */
function personaNote(k,s){
  const e=s._eps;
  if(k==='graham'&&e&&(s._peak||e.neg)) return `Graham tính P/E trên lợi nhuận bình quân nhiều năm và đòi năm nào cũng có lãi. EPS bình quân ${e.n} năm là ${fmt(e.avg,2)}${e.neg?`, có ${e.neg} năm lỗ`:''}${isNum(e.peAvg)&&e.peAvg>0?` → P/E bình quân ${fmt(e.peAvg,1)}x`:''}.`;
  if(k==='buffett'&&s._cyc==='commodity') return 'Doanh nghiệp bán theo giá thị trường hàng hóa, không tự định được giá. ROE cao lúc này đến từ giá hàng hóa, không phải hào kinh tế; Buffett chỉ chạm vào nhóm này khi là người sản xuất chi phí thấp nhất và giá rẻ so với lợi nhuận bình thường.';
  if(k==='lynch'&&s._cyc) return s._peak? 'Lynch xếp đây là cổ phiếu chu kỳ: P/E thấp đúng lúc lợi nhuận ở đỉnh là tín hiệu bán, không phải mua. Nhóm này nên mua khi lợi nhuận ở đáy (P/E cao hoặc đang lỗ).' : 'Cổ phiếu chu kỳ: Lynch đọc P/E ngược với thường lệ — P/E thấp ở đỉnh lợi nhuận là cảnh báo, P/E cao ở đáy mới là cơ hội.';
  if(k==='greenblatt'&&s._peak) return 'Magic Formula hay chọn nhầm cổ phiếu chu kỳ ở đỉnh vì lợi suất thu nhập và ROIC đều phồng lên; Greenblatt khuyên dùng lợi nhuận bình thường hóa với nhóm này.';
  if(k==='oneil'&&s._peak) return "CAN SLIM vẫn có thể đạt vì đà giá và EPS tăng mạnh, nhưng O'Neil bán khi xu hướng gãy — không phải cách nắm giữ dài hạn.";
  return '';
}
function cyclePanelHTML(s){
  if(!s._cyc&&!(s._eps&&s._eps.neg)) return '';
  const e=s._eps;
  const head=s._cyc?`<span class="chip cyc">${CYC_LABEL[s._cyc]}</span>`:'';
  if(!e) return `<section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Chu kỳ lợi nhuận</h2><p>Chưa có lịch sử EPS 5 năm — tác vụ hằng ngày đang bổ sung</p></div>${head}</div><p class="note">Với cổ phiếu chu kỳ, P/E thấp có thể chỉ phản ánh lợi nhuận đang ở đỉnh. Hãy so lợi nhuận hiện tại với bình quân nhiều năm trước khi kết luận là rẻ.</p></section>`;
  const vals=e.fy.slice().reverse(); const mx=Math.max(...vals.map(x=>Math.abs(x[1])),Math.abs(e.ttm),1e-9);
  const W=200,H=86,bw=W/(vals.length+1)-8, y0=H/2+4;
  let g=`<line x1="0" x2="${W}" y1="${y0}" y2="${y0}" style="stroke:var(--line2)"/>`;
  [...vals,['12T',e.ttm]].forEach(([y,v],i)=>{ const h=Math.abs(v)/mx*(H/2-12), x=i*(bw+8)+4;
    g+=`<rect x="${x}" y="${v>=0?y0-h:y0}" width="${bw}" height="${Math.max(h,1)}" rx="2" style="fill:${v>=0?(i===vals.length?'var(--gold)':'var(--up)'):'var(--dn)'}"/><text x="${x+bw/2}" y="${H+8}" text-anchor="middle" style="font-size:9px;fill:var(--mut)">${y}</text>`; });
  if(e.avg>0){ const ya=y0-e.avg/mx*(H/2-12); g+=`<line x1="0" x2="${W}" y1="${ya}" y2="${ya}" style="stroke:var(--fg);stroke-dasharray:3 3;opacity:.6"/>`; }
  const verdict= s._peak? `<b class="dn">Lợi nhuận đang ở đỉnh chu kỳ.</b> EPS 12 tháng ${e.avg>0?`gấp ${fmt(e.ratio,1)} lần`:'cao trong khi'} bình quân ${e.n} năm (${fmt(e.avg,2)}). Điểm định giá đã dùng P/E bình quân ${isNum(e.peAvg)&&e.peAvg>0?fmt(e.peAvg,1)+'x':'(bình quân ≤ 0)'} thay cho P/E ${fmt(s.pe,1)}x, và mã bị trừ điểm cờ đỏ.`
    : s._cyc? `Lợi nhuận hiện tại ${e.avg>0?`bằng ${fmt(e.ratio,1)} lần`:'so với'} bình quân ${e.n} năm — chưa ở vùng đỉnh (ngưỡng ${CYC_PEAK} lần).` : '';
  return `<section class="panel" style="display:flex;flex-direction:column;gap:10px"><div class="sec-h" style="margin:0"><div><h2 style="font-size:17px">Chu kỳ lợi nhuận</h2><p>EPS theo năm tài chính · vạch đứt = bình quân ${e.n} năm</p></div>${head}</div>
    <svg viewBox="0 0 ${W} ${H+12}" role="img" aria-label="EPS ${vals.map(x=>x[0]+': '+fmt(x[1],2)).join(', ')}, 12 tháng: ${fmt(e.ttm,2)}">${g}</svg>
    <p class="note">${verdict}${e.neg?` Có ${e.neg}/${e.n} năm lỗ.`:''}</p></section>`;
}
function personaWhyHTML(s){
  return `<div class="why">${PERSONAS.map((P,i)=>{ const p=s._persona[i]; const note=personaNote(P.k,s);
    return `<details class="acc why-i"><summary><span class="verdict ${p.pass?'y':'n'}">${p.pass?'✓':'·'} ${esc(P.n)} <b>${p.n}/${p.tot}</b></span></summary>
      <ul class="why-r">${P.rules.map(([t],j)=>`<li class="${p.res[j]===true?'y':p.res[j]===false?'n':'u'}"><span class="ic" aria-hidden="true">${p.res[j]===true?'✓':p.res[j]===false?'✗':'–'}</span><span>${esc(t)}${p.res[j]===null?' <i>(thiếu dữ liệu)</i>':''}${(P.must||[]).includes(j)?' <i>· bắt buộc</i>':''}</span></li>`).join('')}</ul>
      ${note?`<p class="note">${esc(note)}</p>`:''}</details>`; }).join('')}</div>`;
}
