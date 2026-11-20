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
const T_FL={h:'Dòng tiền & tâm lý (Mỹ)',sub:'Nhà đầu tư đang giữ tiền mặt hay đổ tiền vào cổ phiếu · cập nhật {d}',
tr:' nghìn tỷ',bn:' tỷ',pt:'điểm %',vs:'so với kỳ trước',flat:'Không đổi so với kỳ trước',
zn:{fear:'Sợ hãi',mid:'Trung tính',greed:'Hưng phấn'},
n:{fg:'Chỉ số Sợ hãi & Tham lam (CNN)',vix:'VIX – chỉ số biến động',aaii:'Nhà đầu tư cá nhân bi quan (AAII)',fms:'Tiền mặt của quỹ lớn (BofA)',mmf:'Tài sản quỹ thị trường tiền tệ',margin:'Dư nợ ký quỹ (FINRA)'},
fq:{fg:'hằng ngày',vix:'hằng ngày',aaii:'hằng tuần',fms:'hằng tháng',mmf:'hằng tuần',margin:'hằng tháng'},
m:{fg:'Gộp 7 tín hiệu thị trường trên thang 0–100. Dưới 25 là sợ hãi cực độ, trên 75 là tham lam cực độ.',
vix:'Mức biến động thị trường quyền chọn kỳ vọng cho S&P 500 trong 30 ngày tới. Trên 20 là thị trường lo lắng, trên 30 là hoảng loạn.',
aaii:'Tỷ lệ nhà đầu tư cá nhân Mỹ cho rằng cổ phiếu sẽ giảm trong 6 tháng tới. Trung bình lịch sử khoảng 31,5%.',
fms:'Tỷ lệ tiền mặt bình quân trong danh mục các quỹ toàn cầu. Từ 5% trở lên là quỹ đang co cụm (thường là tín hiệu mua ngược đám đông); từ 4% trở xuống là gần như dồn hết vào tài sản rủi ro.',
mmf:'Tiền nằm chờ trong các quỹ thị trường tiền tệ. Thanh màu đo mức thay đổi trong tuần: tiền chảy vào mạnh nghĩa là nhà đầu tư đang trú ẩn. Lãi suất cao khiến tổng tài sản tăng dần cả khi thị trường bình thường, nên hãy xem chiều thay đổi.',
margin:'Tiền nhà đầu tư vay để mua chứng khoán. Thanh màu đo mức thay đổi so với tháng trước: dư nợ giảm là đang hạ đòn bẩy, tăng là khẩu vị rủi ro cao.'},
vf:'Đa số chỉ báo đang ở vùng sợ hãi: nhà đầu tư thận trọng, ưu tiên giữ tiền. Trong lịch sử, sợ hãi cực độ thường xuất hiện gần các đáy ngắn hạn, nhưng không cho biết chính xác thời điểm.',
vg:'Đa số chỉ báo đang ở vùng hưng phấn: tiền đổ mạnh vào cổ phiếu, ít tiền mặt dự phòng. Đây thường là lúc thị trường dễ tổn thương khi có tin xấu.',
vm:'Các chỉ báo trái chiều nhau: chưa có xu hướng rõ ràng về việc rút tiền hay đổ tiền vào cổ phiếu.',
cav:'Mỗi chỉ báo có tần suất và độ trễ khác nhau (ngày, tuần, tháng), nên đọc cùng nhau thay vì dựa vào một con số. Đây là thước đo tâm lý, không phải tín hiệu mua bán.'};
