/* ============================================================
   CHUYÊN GIA · DANH MỤC · CÔNG CỤ · AI
   ============================================================ */
const CMP={a:null,b:null};
RENDER.expert=function(){
  const el=$('#v-expert');
  const tabs=[['council','Hội đồng'],['options','Quyền chọn'],['ai','Chuyên gia AI'],['compare','So sánh'],['tools','Công cụ']];
  el.innerHTML=`<div class="sec-h" style="margin:0"><div><h2>Góc chuyên gia</h2><p>8 trường phái, phòng thí nghiệm quyền chọn, trợ lý AI và công cụ định lượng</p></div></div>
    <div class="subtabs" role="tablist">${tabs.map(([k,n])=>`<button role="tab" data-et="${k}" aria-selected="${S.expertTab===k}">${n}</button>`).join('')}</div>
    <div id="expertBody"></div>`;
  $$('[data-et]',el).forEach(b=>b.onclick=()=>{ S.expertTab=b.dataset.et; RENDER.expert(); });
  ({council:renderCouncil,options:renderOptions,ai:renderAI,compare:renderCompare,tools:renderTools})[S.expertTab]();
};
function renderCouncil(){
  const box=$('#expertBody'); const L=inMarket(U);
  const cons=L.map(s=>({s,n:s._persona.filter(p=>p.pass).length})).sort((a,b)=>b.n-a.n||b.s._score-a.s._score).slice(0,14);
  box.innerHTML=`
  <section class="panel"><div class="sec-h"><div><h2 style="font-size:18px">Ma trận đồng thuận</h2><p>Ô xanh: mã đạt chuẩn của trường phái. Cột cuối: số chuyên gia đồng ý</p></div></div>
    <div class="scroll-x"><table class="matrix"><thead><tr><th></th>${PERSONAS.map(P=>`<th class="rot"><span>${esc(P.sh)}</span></th>`).join('')}<th class="rot"><span>Đồng thuận</span></th></tr></thead>
    <tbody>${cons.map(({s,n})=>`<tr><td class="tk"><button class="star" style="width:auto;font-family:var(--f-disp);font-weight:700;color:var(--fg);font-size:13px" data-open="${esc(s.t)}">${esc(s.t)}</button></td>${s._persona.map((p,i)=>`<td class="${p.pass?'y':'n'}" title="${esc(PERSONAS[i].n)}: ${p.n}/${p.tot} tiêu chí">${p.pass?'✓':''}</td>`).join('')}<td class="ct">${n}/8</td></tr>`).join('')}</tbody></table></div>
  </section>
  <div class="persona-grid">${PERSONAS.map((P,pi)=>{
    const picks=L.map(s=>({s,e:s._persona[pi]})).sort((a,b)=>b.e.n-a.e.n||b.s._score-a.s._score).slice(0,4);
    return `<article class="panel persona"><div class="persona-h"><span class="mono">${P.ini}</span><div><b>${esc(P.n)}</b><span>${esc(P.role)}</span></div></div>
      <p>${esc(P.phil)}</p><ul class="rules">${P.rules.map(r=>`<li>${esc(r[0])}</li>`).join('')}</ul>
      <div class="picks">${picks.map(({s,e})=>`<button class="pk" data-open="${esc(s.t)}"><b>${esc(s.t)}</b><span class="dots" aria-label="${e.n}/${e.tot} tiêu chí">${e.res.map(x=>`<i class="${x===true?'y':x===null?'na':''}"></i>`).join('')}</span><span class="grade g-${e.pass?'A':'C'}">${e.n}/${e.tot}</span></button>`).join('')}</div></article>`; }).join('')}</div>
  <p class="note">Bộ tiêu chí là phiên bản định lượng giản lược, lấy cảm hứng từ phương pháp đã công bố của từng nhà đầu tư; không phải lựa chọn thực tế của họ. ${esc(DISC)}</p>`;
}
function renderCompare(){
  const box=$('#expertBody'); const L=ranked();
  if(!CMP.a||!BY[CMP.a]) CMP.a=L[0]&&L[0].t; if(!CMP.b||!BY[CMP.b]||CMP.b===CMP.a) CMP.b=(L.find(s=>s.t!==CMP.a)||{}).t;
  const opts=sel=>U.slice().sort((a,b)=>a.t.localeCompare(b.t)).map(s=>`<option value="${esc(s.t)}" ${s.t===sel?'selected':''}>${esc(s.t)} — ${esc(s.n)} (${s.m})</option>`).join('');
  const A=BY[CMP.a],B=BY[CMP.b]; if(!A||!B){ box.innerHTML='<div class="empty">Cần ít nhất hai mã để so sánh.</div>'; return; }
  const keys=['pe','pb','roe','fg','dy','mo','b'].concat(!A.bank&&!B.bank?['roic','gm','de','fcf']:['npl','car']);
  const rows=keys.map(k=>{ const a=A._m[k]||{v:metric(A,k)},b=B._m[k]||{v:metric(B,k)}; const fmtv=v=>MET[k].u==='%'?pct(v):MET[k].u==='x'?xx(v):fmt(v,2);
    const sa=a.sc==null?0:a.sc, sb=b.sc==null?0:b.sc;
    return `<div style="display:grid;grid-template-columns:1fr 92px 1fr;gap:8px;align-items:center;font-size:13px;padding:6px 0;border-bottom:1px solid var(--line)">
      <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end"><span style="font-weight:${sa>sb?700:500}">${fmtv(a.v)}</span><span style="display:block;height:8px;width:${Math.round(sa*60)}%;max-width:120px;border-radius:4px;background:var(--gold)"></span></div>
      <div style="text-align:center;color:var(--mut);font-size:12px">${esc(MET[k].n)}</div>
      <div style="display:flex;align-items:center;gap:6px"><span style="display:block;height:8px;width:${Math.round(sb*60)}%;max-width:120px;border-radius:4px;background:var(--us)"></span><span style="font-weight:${sb>sa?700:500}">${fmtv(b.v)}</span></div></div>`; }).join('');
  box.innerHTML=`<section class="panel" style="display:flex;flex-direction:column;gap:14px">
    <div class="filters" style="grid-template-columns:1fr 1fr"><label class="field">Mã A (vàng)<select id="cA">${opts(CMP.a)}</select></label><label class="field">Mã B (xanh)<select id="cB">${opts(CMP.b)}</select></label></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;text-align:center">
      <div><b style="font-family:var(--f-disp);font-size:28px;color:var(--gold)">${esc(A.t)}</b><div class="mut" style="font-size:13px">${A._score}/100 · hạng ${A._grade}</div></div>
      <div><b style="font-family:var(--f-disp);font-size:28px;color:var(--us)">${esc(B.t)}</b><div class="mut" style="font-size:13px">${B._score}/100 · hạng ${B._grade}</div></div></div>
    <div id="cRadar" style="max-width:380px;margin:0 auto;width:100%">${radarSVG(FACTORS.map(F=>A._f[F.k]/100),{size:300,compare:FACTORS.map(F=>B._f[F.k]/100),labels:FACTORS.map(F=>F.n),sub:FACTORS.map(F=>String(A._f[F.k])),sub2:FACTORS.map(F=>String(B._f[F.k])),pad:36,fs:11,aria:'So sánh radar '+A.t+' và '+B.t})}</div>
    <div>${rows}</div>
    <p class="note">Độ dài thanh = điểm chỉ số trong nhóm của mã đó (0–100%); số đậm là bên tốt hơn. So sánh khác thị trường chỉ mang tính tham khảo vì mặt bằng định giá, lãi suất và rủi ro quốc gia khác nhau.</p>
  </section>`;
  $('#cA').onchange=e=>{ CMP.a=e.target.value; if(CMP.a===CMP.b) CMP.b=null; renderCompare(); };
  $('#cB').onchange=e=>{ CMP.b=e.target.value; renderCompare(); };
  animateRadar($('#cRadar'));
}

/* ---------- công cụ định lượng (hàm thuần, có kiểm thử) ---------- */
function positionSize(capital,riskPct,entry,stop,lot){
  const risk=capital*riskPct/100, per=entry-stop;
  if(!(per>0)||!(entry>0)) return null;
  let sh=Math.floor(risk/per); if(lot>1) sh=Math.floor(sh/lot)*lot;
  const val=sh*entry; return {shares:sh,value:val,riskAmt:sh*per,pctCap:val/capital*100,stopPct:per/entry*100};
}
function kelly(p,b){ return p-(1-p)/b; }
function recoveryNeeded(dd){ return 1/(1-dd)-1; }
function compoundSeries(P,monthly,rate,years){
  const out=[]; let v=P, inv=P; const r=rate/100/12;
  for(let m=1;m<=years*12;m++){ v=v*(1+r)+monthly; inv+=monthly; if(m%12===0) out.push({y:m/12,v,inv}); }
  return out;
}
function hoseTick(p){ return p<10000?10: p<50000?50:100; }
function priceBand(ref,ex){
  const b= ex==='HNX'?.10: ex==='UPCOM'?.15:.07;
  const tickOf=p=> ex==='HOSE'? hoseTick(p) : 100;
  const upRaw=ref*(1+b), dnRaw=ref*(1-b);
  const ceil=Math.floor(upRaw/tickOf(upRaw)+1e-9)*tickOf(upRaw);
  const floor=Math.ceil(dnRaw/tickOf(dnRaw)-1e-9)*tickOf(dnRaw);
  return {ceil,floor,b};
}
function renderTools(){
  const box=$('#expertBody');
  box.innerHTML=`<div class="tools">
   <section class="panel calc"><h2 style="font-size:17px">Quy mô vị thế theo rủi ro</h2><p class="note">Mỗi lệnh chỉ mất tối đa X% vốn nếu chạm điểm cắt lỗ.</p>
    <div class="cin"><label class="field">Vốn (đ hoặc $)<input type="number" id="pCap" value="500000000" inputmode="decimal"></label><label class="field">Rủi ro mỗi lệnh (%)<input type="number" id="pRisk" value="1" step="0.25" inputmode="decimal"></label>
    <label class="field">Giá mua<input type="number" id="pEntry" value="28500" inputmode="decimal"></label><label class="field">Giá cắt lỗ<input type="number" id="pStop" value="26500" inputmode="decimal"></label>
    <label class="field">Lô giao dịch<select id="pLot"><option value="100">100 cp (Việt Nam)</option><option value="1">1 cp (Mỹ)</option></select></label></div>
    <div class="result" id="pOut"></div></section>
   <section class="panel calc"><h2 style="font-size:17px">Tiêu chí Kelly</h2><p class="note">Tỷ trọng tối ưu về lý thuyết khi biết xác suất thắng p và tỷ lệ lời/lỗ b.</p>
    <div class="cin"><label class="field">Xác suất thắng p (%)<input type="number" id="kP" value="55" inputmode="decimal"></label><label class="field">Lời/lỗ b<input type="number" id="kB" value="1.5" step="0.1" inputmode="decimal"></label></div>
    <div class="result" id="kOut"></div></section>
   <section class="panel calc"><h2 style="font-size:17px">Giá trần / sàn Việt Nam</h2><p class="note">Làm tròn theo bước giá: HOSE 10đ (&lt;10.000), 50đ (10.000–49.950), 100đ (≥50.000); HNX, UPCoM 100đ.</p>
    <div class="cin"><label class="field">Giá tham chiếu (đ)<input type="number" id="bRef" value="27350" inputmode="decimal"></label><label class="field">Sàn<select id="bEx"><option>HOSE</option><option>HNX</option><option value="UPCOM">UPCoM</option></select></label></div>
    <div class="result" id="bOut"></div></section>
   <section class="panel calc"><h2 style="font-size:17px">Giảm sâu, hồi bao nhiêu?</h2><p class="note">Bất đối xứng của thua lỗ: càng giảm sâu, mức hồi cần thiết càng tăng theo cấp số.</p>
    <label class="slider-row"><span>Mức giảm</span><input type="range" id="ddR" min="5" max="90" step="5" value="40"><output id="ddO">40%</output></label>
    <div id="ddOut"></div></section>
   <section class="panel calc" style="grid-column:1/-1"><h2 style="font-size:17px">Lãi kép và đầu tư định kỳ</h2>
    <div class="cin" style="grid-template-columns:repeat(2,minmax(0,1fr))"><label class="field">Vốn ban đầu<input type="number" id="cP" value="100000000" inputmode="decimal"></label><label class="field">Góp mỗi tháng<input type="number" id="cM" value="5000000" inputmode="decimal"></label>
    <label class="field">Lợi suất năm (%)<input type="number" id="cR" value="12" step="0.5" inputmode="decimal"></label><label class="field">Số năm<input type="number" id="cY" value="20" inputmode="decimal"></label></div>
    <div id="cOut"></div></section>
  </div><p class="note">Công cụ tính toán minh họa, không phải khuyến nghị. Kết quả thực tế chịu phí, thuế, trượt giá và thanh khoản.</p>`;
  const n=id=>parseFloat($('#'+id).value);
  const P=()=>{ const r=positionSize(n('pCap'),n('pRisk'),n('pEntry'),n('pStop'),n('pLot')); $('#pOut').innerHTML= r? `<div><b>${fmt(r.shares,0)}</b><span>cổ phiếu</span></div><div><b>${fmt(r.value,0)}</b><span>giá trị vị thế (${pct(r.pctCap,1)} vốn)</span></div><div><b class="dn">−${fmt(r.riskAmt,0)}</b><span>lỗ tối đa (cắt lỗ ${pct(r.stopPct,1)})</span></div>${r.pctCap>100?'<p class="note" style="color:var(--dn);flex-basis:100%">Vị thế vượt quá vốn: nới điểm cắt lỗ hoặc giảm rủi ro mỗi lệnh.</p>':''}` : '<p class="note" style="color:var(--dn)">Giá cắt lỗ phải thấp hơn giá mua.</p>'; };
  const K=()=>{ const p=n('kP')/100,b=n('kB'); if(!(b>0)||!(p>=0&&p<=1)){ $('#kOut').innerHTML='<p class="note">Nhập p từ 0–100 và b lớn hơn 0.</p>'; return; } const f=kelly(p,b);
    $('#kOut').innerHTML= f<=1e-9? `<div><b class="dn">${pct(f*100,1)}</b><span>Kỳ vọng âm — không nên vào lệnh</span></div>` : `<div><b>${pct(f*100,1)}</b><span>Kelly đầy đủ</span></div><div><b class="gold">${pct(f*50,1)}</b><span>½ Kelly (khuyên dùng)</span></div><div><b>${sgn((p*b-(1-p))*100,1)}</b><span>Kỳ vọng mỗi đồng rủi ro</span></div>`; };
  const Bd=()=>{ const ref=n('bRef'),ex=$('#bEx').value; if(!(ref>0)){ $('#bOut').innerHTML=''; return; } const r=priceBand(ref,ex);
    $('#bOut').innerHTML=`<div><b style="color:var(--ceil)">${fmt(r.ceil,0)}</b><span>Giá trần (+${r.b*100}%)</span></div><div><b style="color:var(--ref)">${fmt(ref,0)}</b><span>Tham chiếu</span></div><div><b style="color:var(--floor)">${fmt(r.floor,0)}</b><span>Giá sàn (−${r.b*100}%)</span></div>`; };
  const D=()=>{ const d=n('ddR')/100; $('#ddO').textContent=fmt(d*100,0)+'%';
    const W=340,H=150,p={l:34,r:10,t:10,b:26}; const X=v=>p.l+v/90*(W-p.l-p.r), Y=v=>H-p.b-Math.min(v,900)/900*(H-p.t-p.b);
    let path=''; for(let x=0;x<=90;x+=1){ path+=(x?'L':'M')+X(x).toFixed(1)+' '+Y(recoveryNeeded(x/100)*100).toFixed(1); }
    let g=''; [0,300,600,900].forEach(v=>g+=`<line class="grid-l" x1="${p.l}" x2="${W-p.r}" y1="${Y(v)}" y2="${Y(v)}"/><text x="${p.l-4}" y="${Y(v)+4}" text-anchor="end">${v}%</text>`);
    [0,30,60,90].forEach(v=>g+=`<text x="${X(v)}" y="${H-8}" text-anchor="middle">−${v}%</text>`);
    const need=recoveryNeeded(d)*100;
    g+=`<path d="${path}" fill="none" style="stroke:var(--dn)" stroke-width="2.2"/><circle cx="${X(d*100)}" cy="${Y(need)}" r="5" style="fill:var(--gold);stroke:var(--bg)" stroke-width="2"/>`;
    $('#ddOut').innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Đường cong mức hồi phục cần thiết">${g}</svg><div class="result"><div><b class="up">+${fmt(need,0)}%</b><span>cần tăng để hòa vốn sau khi giảm ${fmt(d*100,0)}%</span></div><div><b>${isNum(need)?fmt(Math.log(1+need/100)/Math.log(1.10),1):'—'} năm</b><span>nếu lãi kép 10%/năm</span></div></div>`; };
  const C=()=>{ const ser=compoundSeries(n('cP')||0,n('cM')||0,n('cR')||0,clamp(Math.round(n('cY')||1),1,50)); if(!ser.length){ $('#cOut').innerHTML=''; return; }
    const last=ser[ser.length-1]; const W=640,H=200,p={l:56,r:12,t:12,b:26}; const mx=last.v||1; const bw=(W-p.l-p.r)/ser.length;
    let g=''; [0,.5,1].forEach(k=>g+=`<line class="grid-l" x1="${p.l}" x2="${W-p.r}" y1="${H-p.b-k*(H-p.t-p.b)}" y2="${H-p.b-k*(H-p.t-p.b)}"/><text x="${p.l-6}" y="${H-p.b-k*(H-p.t-p.b)+4}" text-anchor="end">${fmt(mx*k/1e6,0)}tr</text>`);
    ser.forEach((s,i)=>{ const h=s.v/mx*(H-p.t-p.b), hi=s.inv/mx*(H-p.t-p.b); const x=p.l+i*bw+1;
      g+=`<rect x="${x}" y="${H-p.b-h}" width="${Math.max(1,bw-2)}" height="${h}" rx="1.5" style="fill:var(--gold);fill-opacity:.85"/><rect x="${x}" y="${H-p.b-hi}" width="${Math.max(1,bw-2)}" height="${hi}" rx="1.5" style="fill:var(--mut);fill-opacity:.55"/>`;
      if(ser.length<=25||i%5===4) g+=`<text x="${x+bw/2}" y="${H-8}" text-anchor="middle">${s.y}</text>`; });
    $('#cOut').innerHTML=`<div class="scroll-x"><svg class="chart" viewBox="0 0 ${W} ${H}" style="min-width:480px" role="img" aria-label="Tăng trưởng tài sản theo năm">${g}</svg></div>
      <div class="legend"><span><i style="background:var(--gold)"></i>Tổng tài sản</span><span><i style="background:var(--mut)"></i>Tiền gốc đã góp</span></div>
      <div class="result"><div><b>${fmt(last.v/1e6,0)} triệu</b><span>sau ${last.y} năm</span></div><div><b>${fmt(last.inv/1e6,0)} triệu</b><span>tiền gốc</span></div><div><b class="up">${fmt((last.v-last.inv)/1e6,0)} triệu</b><span>tiền lãi kép</span></div><div><b>${fmt(72/(n('cR')||1),1)} năm</b><span>nhân đôi (Quy tắc 72)</span></div></div>`; };
  ['pCap','pRisk','pEntry','pStop','pLot'].forEach(id=>$('#'+id).addEventListener('input',P)); $('#pLot').onchange=P;
  ['kP','kB'].forEach(id=>$('#'+id).addEventListener('input',K));
  $('#bRef').addEventListener('input',Bd); $('#bEx').onchange=Bd;
  $('#ddR').addEventListener('input',D);
  ['cP','cM','cR','cY'].forEach(id=>$('#'+id).addEventListener('input',C));
  P();K();Bd();D();C();
}

/* ---------- Chuyên gia AI (sample) ---------- */
let SAMPLE=null, SAMPLE_READY=false;
const CHAT={turns:[],busy:false,ctl:null,focus:null};
(async function initSample(){
  try{ if(window.claude&&typeof window.claude.use==='function'){ SAMPLE=await window.claude.use('sample'); } }catch(e){ SAMPLE=null; }
  SAMPLE_READY=true; if(S.view==='expert'&&S.expertTab==='ai') renderAI();
})();
function compactStock(s){
  const o={ma:s.t,ten:s.n,thi_truong:s.m==='US'?'Mỹ':'Việt Nam',nganh:SECTORS[s.s],diem:s._score,hang:s._grade,xep_hang:`${s._rank}/${s._of}`,nhan_to:Object.fromEntries(FACTORS.map(F=>[F.n,s._f[F.k]])),co_do:s._flags,
    bien_an_toan_tong_hop_pct: isNum(s._val.blend)?Math.round(s._val.blend*100):null, tang_truong_ngam_dinh_pct: isNum(s._val.implied)?+s._val.implied.toFixed(1):null, chi_phi_von_pct:s._val.r,
    chuyen_gia_dong_y:s._persona.filter(p=>p.pass).map(p=>PERSONAS.find(P=>P.k===p.k).n)};
  const lq=liveQ(s.t); if(lq){ o.gia_dong_cua=lq.px; o.thay_doi_pct=lq.pct; o.phien=lq.d; }
  (s.bank?BANK_FIELDS:GEN_FIELDS).forEach(k=>{ if(isNum(s[k])) o[MET[k].n]=s[k]; });
  if(fscore(s)!=null) o['F-Score']=fscore(s);
  return o;
}
function buildRules(text){
  const mentioned=new Set(); (text.toUpperCase().match(/\b[A-Z]{1,5}(?:\.B)?\b/g)||[]).forEach(w=>{ if(BY[w]) mentioned.add(w); });
  CHAT.turns.forEach(t=>(t.content.toUpperCase().match(/\b[A-Z]{1,5}(?:\.B)?\b/g)||[]).forEach(w=>{ if(BY[w]) mentioned.add(w); }));
  if(CHAT.focus) mentioned.add(CHAT.focus);
  ranked().slice(0,8).forEach(s=>mentioned.add(s.t));
  const data=[...mentioned].slice(0,18).map(t=>compactStock(BY[t]));
  return `Bạn là chuyên gia phân tích đầu tư (chuẩn CFA) trong ứng dụng "La Bàn Cổ Phiếu" dành cho nhà đầu tư chuyên nghiệp tại Mỹ và Việt Nam.
Quy tắc trả lời:
- Viết tiếng Việt có dấu, giọng chuyên nghiệp, súc tích. Dùng tiêu đề ngắn bắt đầu bằng "## " và gạch đầu dòng "- ". Không dùng bảng.
- Lập luận bằng khung học thuật: định giá (P/E, P/B, EV/EBITDA, DCF, định giá ngược), chất lượng (ROE, ROIC so với chi phí vốn, DuPont), sức khỏe (Altman Z, Piotroski), đặc thù ngành (ngân hàng: NIM, NPL, CASA, CAR), vĩ mô và đặc thù thị trường (Việt Nam: biên độ giá, room ngoại, nâng hạng thị trường; Mỹ: lãi suất Fed, định giá chỉ số).
- Luôn nêu cả luận điểm tích cực, rủi ro chính, kịch bản (tốt/cơ sở/xấu) và những điều nhà đầu tư cần tự kiểm chứng.
- Dữ liệu bên dưới là ảnh chụp ƯỚC TÍNH trong ứng dụng, có thể đã cũ; khi kết luận phụ thuộc số liệu, hãy nói rõ cần kiểm tra lại. Không bịa số liệu mới; nếu dùng hiểu biết chung ngoài dữ liệu, ghi rõ là nhận định chung.
- Không đưa lệnh mua/bán chắc chắn, không dự đoán giá cụ thể. Kết thúc bằng một dòng: "Thông tin tham khảo, không phải khuyến nghị đầu tư."
Thị trường đang xem: ${mktName(S.market)}. Bộ trọng số: ${S.preset==='custom'?'Tùy chỉnh':PRESETS[S.preset].n}.
DỮ LIỆU (JSON):
${JSON.stringify(data)}`;
}
function mdLite(src){
  const lines=esc(src).split('\n'); let html='', inList=false;
  const inline=t=>t.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g,'$1<i>$2</i>');
  lines.forEach(l=>{
    const t=l.trim();
    if(/^#{1,4}\s/.test(t)){ if(inList){html+='</ul>';inList=false;} html+='<h4>'+inline(t.replace(/^#{1,4}\s/,''))+'</h4>'; }
    else if(/^[-*•]\s/.test(t)){ if(!inList){html+='<ul>';inList=true;} html+='<li>'+inline(t.replace(/^[-*•]\s/,''))+'</li>'; }
    else if(/^\d+[.)]\s/.test(t)){ if(!inList){html+='<ul>';inList=true;} html+='<li>'+inline(t.replace(/^\d+[.)]\s/,''))+'</li>'; }
    else if(!t){ if(inList){html+='</ul>';inList=false;} }
    else { if(inList){html+='</ul>';inList=false;} html+='<p>'+inline(t)+'</p>'; }
  });
  if(inList) html+='</ul>'; return html;
}
const AI_ERR={not_granted:'Bạn chưa cho phép trang dùng Claude. Có thể bật lại trong menu Quyền của artifact.',sampling_disabled:'Claude không khả dụng cho tài khoản này.',rate_limited:'Đang gửi quá nhiều câu hỏi hoặc đã chạm giới hạn sử dụng. Thử lại sau ít phút.',session_expired:'Phiên đăng nhập đã hết hạn — đăng nhập lại Claude.',refused:'Claude từ chối câu hỏi này. Hãy diễn đạt lại.',empty_completion:'Không nhận được câu trả lời. Hãy hỏi ngắn gọn hơn.',prompt_too_large:'Câu hỏi quá dài. Hãy rút gọn.',upstream_error:'Kết nối bị gián đoạn. Bấm gửi lại.'};
function renderAI(){
  const box=$('#expertBody'); if(!box) return;
  const L=ranked(); const t1=L[0]?L[0].t:'FPT', t2=L[1]?L[1].t:'VCB';
  const sugg=[`Luận điểm đầu tư và rủi ro của ${t1}`,`So sánh ${t1} với ${t2}: nên ưu tiên mã nào cho danh mục 3 năm?`,`Xây danh mục 6 mã ${S.market==='US'?'Mỹ':'Việt Nam'} cân bằng giữa giá trị và tăng trưởng từ dữ liệu`,`Ngân hàng nào có chất lượng tài sản tốt nhất và vì sao?`,`Giải thích vì sao định giá ngược quan trọng với cổ phiếu tăng trưởng`];
  const avail= SAMPLE!==null;
  box.innerHTML=`<section class="panel chat">
    <div class="persona-h"><span class="mono" style="background:var(--gold);color:var(--gold-ink)">AI</span><div><b>Chuyên gia phân tích AI</b><span>Đọc dữ liệu và điểm La Bàn của ứng dụng, lập luận theo khung CFA</span></div></div>
    <div class="msgs" id="msgs" aria-live="polite"></div>
    <div class="chips" id="sugg">${sugg.map(q=>`<button class="chip" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
    <form class="composer" id="aiForm"><label class="sr" for="aiIn">Câu hỏi</label><textarea id="aiIn" rows="1" placeholder="Hỏi về mã, ngành, chiến lược"></textarea><button class="btn pri" type="submit" id="aiSend" aria-label="Gửi">Gửi</button></form>
    <p class="note" id="aiNote">${!SAMPLE_READY?'Đang kết nối trợ lý…': avail?'Mỗi câu hỏi dùng hạn mức Claude của bạn; lần đầu sẽ hỏi quyền. Lịch sử chat chỉ nằm trong trang đang mở.':'Trợ lý AI chỉ chạy khi mở trang này trong Claude với tài khoản đã đăng nhập. Ở chế độ xem này, hãy dùng “Báo cáo thuật toán” trong trang chi tiết từng mã — báo cáo đó luôn hoạt động.'}</p>
  </section>`;
  drawMsgs();
  $$('#sugg [data-q]').forEach(b=>b.onclick=()=>askAI(b.dataset.q));
  const ta=$('#aiIn'); ta.oninput=()=>{ ta.style.height='auto'; ta.style.height=Math.min(160,ta.scrollHeight)+'px'; };
  ta.onkeydown=e=>{ if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){ e.preventDefault(); $('#aiForm').requestSubmit(); } };
  $('#aiForm').onsubmit=e=>{ e.preventDefault(); if(CHAT.busy){ CHAT.ctl&&CHAT.ctl.abort(); return; } const q=ta.value.trim(); if(!q) return; ta.value=''; ta.style.height='auto'; askAI(q); };
  updateSendBtn();
}
function updateSendBtn(){ const b=$('#aiSend'); if(!b) return; b.textContent=CHAT.busy?'Dừng':'Gửi'; b.setAttribute('aria-label',CHAT.busy?'Dừng trả lời':'Gửi'); }
function drawMsgs(){
  const m=$('#msgs'); if(!m) return;
  if(!CHAT.turns.length&&!CHAT.busy){ m.innerHTML='<div class="msg sys">Chọn một câu hỏi gợi ý hoặc tự đặt câu hỏi. Trợ lý nhìn thấy điểm, nhân tố, định giá và cờ đỏ của các mã liên quan.</div>'; return; }
  m.innerHTML=CHAT.turns.map(t=> t.role==='user'?`<div class="msg u">${esc(t.content)}</div>`:`<div class="msg a">${t.err?`<p class="dn">${esc(t.content)}</p>`:mdLite(t.content)}</div>`).join('')+(CHAT.busy?`<div class="msg a" id="streamMsg">${CHAT.partial?mdLite(CHAT.partial):'<span class="typing" aria-label="Đang suy nghĩ"><i></i><i></i><i></i></span> <span class="mut" style="font-size:13px">Đang phân tích…</span>'}</div>`:'');
}
async function askAI(q,focus){
  if(focus) CHAT.focus=focus;
  if(S.view!=='expert'||S.expertTab!=='ai'){ S.expertTab='ai'; setView('expert'); }
  if(CHAT.busy) return;
  if(!SAMPLE_READY){ toast('Trợ lý đang kết nối, thử lại sau giây lát'); return; }
  if(!SAMPLE){ CHAT.turns.push({role:'user',content:q}); CHAT.turns.push({role:'assistant',content:'Trợ lý AI không khả dụng ở chế độ xem này (cần mở trong Claude và đăng nhập). Dưới đây là báo cáo thuật toán thay thế — mở mã trong phần Sàng lọc để xem đầy đủ.',err:true}); drawMsgs(); if(focus) setTimeout(()=>openStock(focus),400); return; }
  const rules=buildRules(q);
  CHAT.turns.push({role:'user',content:q}); CHAT.busy=true; CHAT.partial=''; CHAT.ctl=new AbortController(); drawMsgs(); updateSendBtn();
  const hist=CHAT.turns.filter(t=>!t.err).slice(-8);
  while(hist.length&&hist[0].role!=='user') hist.shift();
  try{
    const res=await SAMPLE([{role:'user',content:rules}].concat(hist.map(t=>({role:t.role,content:t.content}))),{cache:false,signal:CHAT.ctl.signal,onText:({text})=>{ CHAT.partial=text; const sm=$('#streamMsg'); if(sm) sm.innerHTML=mdLite(text); }});
    CHAT.turns.push({role:'assistant',content:res.text+(res.truncated?'\n\n*(Câu trả lời bị cắt ngắn — hãy hỏi hẹp hơn.)*':'')});
  }catch(e){
    const code=e&&e.code; const keep=e&&e.text;
    if(code==='cancelled'){ if(keep) CHAT.turns.push({role:'assistant',content:keep+'\n\n*(Đã dừng.)*'}); else CHAT.turns.pop(); }
    else { if(keep&&code!=='refused') CHAT.turns.push({role:'assistant',content:keep}); CHAT.turns.push({role:'assistant',content:AI_ERR[code]||AI_ERR.upstream_error,err:true}); if(['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed'].includes(code)) SAMPLE=null; }
  }
  CHAT.busy=false; CHAT.partial=''; CHAT.ctl=null; drawMsgs(); updateSendBtn();
  const m=$('#msgs'); if(m&&m.lastElementChild) m.lastElementChild.scrollIntoView({block:'nearest',behavior:REDUCED()?'auto':'smooth'});
}

/* ---------------- DANH MỤC ---------------- */
RENDER.port=function(){
  const el=$('#v-port');
  let H=S.stars.map(t=>BY[t]).filter(Boolean); let sample=false;
  if(!H.length){ H=ranked().slice(0,8); sample=true; }
  const raw=H.map(s=> S.pWeight==='equal'?1 : S.pWeight==='invbeta'? 1/Math.max(.3,isNum(s.b)?s.b:1) : Math.pow(Math.max(1,s._score),2));
  const tot=raw.reduce((a,b)=>a+b,0)||1; const w=raw.map(x=>x/tot);
  const wavg=f=>H.reduce((a,s,i)=>a+(isNum(f(s))?f(s)*w[i]:0),0)/(H.reduce((a,s,i)=>a+(isNum(f(s))?w[i]:0),0)||1);
  const hhi=w.reduce((a,b)=>a+b*b,0);
  const pe=1/H.reduce((a,s,i)=>a+(isNum(s.pe)&&s.pe>0?w[i]/s.pe:0),0);
  const sec={}; H.forEach((s,i)=>{ sec[s.s]=(sec[s.s]||0)+w[i]; });
  const secArr=Object.entries(sec).sort((a,b)=>b[1]-a[1]).map(([k,v],i)=>({k,v,c:CAT[i%CAT.length]}));
  const mUS=H.reduce((a,s,i)=>a+(s.m==='US'?w[i]:0),0);
  const fac=FACTORS.map(F=>wavg(s=>s._f[F.k])/100);
  const med=marketMedianFactors(S.market);
  const warns=[]; if(secArr[0]&&secArr[0].v>.4) warns.push(`Ngành ${SECTORS[secArr[0].k]} chiếm ${pct(secArr[0].v*100,0)} — tập trung cao.`);
  const mxw=Math.max(...w); if(mxw>.25) warns.push(`Một mã chiếm ${pct(mxw*100,0)} danh mục.`);
  if(1/hhi<5) warns.push('Số mã hiệu dụng dưới 5 — rủi ro riêng lẻ còn lớn.');
  const flagged=H.filter(s=>s._flags.length).map(s=>s.t); if(flagged.length) warns.push('Có cờ đỏ: '+flagged.join(', ')+'.');
  el.innerHTML=`<div class="sec-h" style="margin:0"><div><h2>Danh mục của bạn</h2><p>${sample?'<b style="color:var(--gold)">Danh mục mẫu</b>: 8 mã điểm cao nhất. Chạm ngôi sao ở bất kỳ mã nào để tạo danh mục riêng.':H.length+' mã đang theo dõi'}</p></div></div>
  <div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center"><span class="note">Phân bổ tỷ trọng:</span><div class="seg" role="group" aria-label="Cách phân bổ" id="pwSeg">${[['score','Theo điểm²'],['equal','Đều nhau'],['invbeta','Nghịch beta']].map(([k,n])=>`<button data-pw="${k}" aria-pressed="${S.pWeight===k}">${n}</button>`).join('')}</div></div>
  ${(()=>{ const pts=H.map((s,i)=>({q:liveQ(s.t),w:w[i]})).filter(x=>x.q&&isNum(x.q.pct)); if(!pts.length) return ''; const tw=pts.reduce((a,b)=>a+b.w,0); const day=pts.reduce((a,b)=>a+b.q.pct*b.w,0)/tw; return `<div class="disc" style="border-style:solid;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><b class="${day>=0?'up':'dn'}" style="font-family:var(--f-disp);font-size:24px">${day>=0?'▲':'▼'} ${fmt(Math.abs(day),2)}%</b><span>Biến động bình quân danh mục phiên gần nhất (theo tỷ trọng, ${pts.length}/${H.length} mã có giá)</span></div>`; })()}
  <div class="port-sum">
    <div><b style="color:${scoreColor(wavg(s=>s._score))}">${fmt(wavg(s=>s._score),0)}</b><span>Điểm La Bàn bình quân</span></div>
    <div><b>${fmt(1/hhi,1)}</b><span>Số mã hiệu dụng (1/HHI)</span></div>
    <div><b>${fmt(wavg(s=>s.b),2)}</b><span>Beta danh mục</span></div>
    <div><b>${pct(wavg(s=>s.dy),1)}</b><span>Tỷ suất cổ tức bình quân</span></div>
    <div><b>${xx(pe,1)}</b><span>P/E bình quân điều hòa</span></div>
    <div><b>${pct(wavg(s=>s.roe),0)}</b><span>ROE bình quân</span></div>
    <div><b>${pct(wavg(s=>s.fg),0)}</b><span>Tăng trưởng EPS kỳ vọng</span></div>
    <div><b>${sgn(wavg(s=>isNum(s._val.blend)?s._val.blend*100:null),0)}</b><span>Biên an toàn ước tính</span></div>
  </div>
  ${warns.length?`<div class="disc" style="border-color:var(--dn);color:var(--fg)"><b class="dn">Cảnh báo rủi ro</b><ul class="bul" style="margin-top:6px">${warns.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:'<div class="disc" style="border-color:var(--up)"><b class="up">Phân bổ cân đối</b> — không có cảnh báo tập trung hay cờ đỏ.</div>'}
  <div class="grid2">
    <section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Hồ sơ nhân tố danh mục</h2><p>So với trung vị ${esc(mktName(S.market))}</p></div></div><div id="pRadar" style="max-width:340px;margin:0 auto">${radarSVG(fac,{size:300,labels:FACTORS.map(F=>F.n),sub:fac.map(v=>String(Math.round(v*100))),median:FACTORS.map(F=>(med[F.k]||0)/100),pad:34,fs:11,aria:'Radar danh mục'})}</div></section>
    <section class="panel"><div class="sec-h"><div><h2 style="font-size:17px">Phân bổ ngành</h2><p>Mỹ ${pct(mUS*100,0)} · Việt Nam ${pct((1-mUS)*100,0)}</p></div></div>
      <div style="display:grid;grid-template-columns:minmax(0,150px) 1fr;gap:14px;align-items:center"><div>${donutSVG(secArr,160)}</div><div style="display:flex;flex-direction:column;gap:6px;font-size:13px">${secArr.map(x=>`<div style="display:flex;gap:8px;align-items:center"><i style="width:10px;height:10px;border-radius:3px;background:${x.c};flex:none"></i><span style="flex:1;min-width:0">${esc(SECTORS[x.k]||x.k)}</span><b>${pct(x.v*100,0)}</b></div>`).join('')}</div></div>
      <div style="display:flex;height:10px;border-radius:6px;overflow:hidden;margin-top:14px" aria-label="Tỷ trọng theo thị trường"><i style="width:${mUS*100}%;background:var(--us)"></i><i style="width:${(1-mUS)*100}%;background:var(--vn)"></i></div></section>
  </div>
  <section><div class="sec-h"><h2 style="font-size:17px">Tỷ trọng từng mã</h2></div><div class="list">${H.map((s,i)=>`<div class="prow"><button class="star" style="width:auto;justify-content:start;text-align:left;display:block" data-open="${esc(s.t)}"><b style="font-family:var(--f-disp);font-size:15px;color:var(--fg)">${esc(s.t)}</b> <span class="mk ${s.m}">${s.m}</span> <span class="grade g-${s._grade}">${s._score}</span><span style="display:block;font-size:12px;color:var(--mut)">${esc(s.n)}</span></button><span class="bar"><i style="width:${Math.round(w[i]/mxw*100)}%"></i></span><b style="text-align:right">${pct(w[i]*100,1)}${liveQ(s.t)?`<small style="display:block;font-size:11px" class="${boardClass(liveQ(s.t))}">${pctTxt(liveQ(s.t))}</small>`:''}</b>${sample?'<span></span>':`<button class="star" data-star="${esc(s.t)}" aria-pressed="true" aria-label="Bỏ ${esc(s.t)} khỏi danh mục">${starSVG(true)}</button>`}</div>`).join('')}</div></section>
  <p class="note">Tỷ trọng mô phỏng để đánh giá cấu trúc, không phải khuyến nghị phân bổ. Bình quân trộn hai thị trường chỉ mang tính tham khảo. ${esc(DISC)}</p>`;
  $$('#pwSeg button').forEach(b=>b.onclick=()=>{ S.pWeight=b.dataset.pw; saveState(); RENDER.port(); });
  animateRadar($('#pRadar'));
};
