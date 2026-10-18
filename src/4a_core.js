'use strict';
/* ============================================================
   LA BÀN CỔ PHIẾU — lõi: trạng thái, thuật toán, định giá, biểu đồ
   ============================================================ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const isNum=v=>typeof v==='number'&&isFinite(v);
const fmt=(v,d=1)=>!isNum(v)?'—':v.toLocaleString('vi-VN',{maximumFractionDigits:d});
const pct=(v,d=1)=>!isNum(v)?'—':fmt(v,d)+'%';
const xx=(v,d=1)=>!isNum(v)?'—':fmt(v,d)+'x';
const sgn=(v,d=1)=>!isNum(v)?'—':(v>0?'+':'')+fmt(v,d)+'%';

/* ---------- lưu trữ cục bộ ---------- */
const LS_KEY='labanCoPhieu.v1';
let store={};
try{ store=JSON.parse(localStorage.getItem(LS_KEY)||'{}')||{}; }catch(e){ store={}; }
function persist(){ try{ localStorage.setItem(LS_KEY,JSON.stringify(store)); }catch(e){} }

const DEFAULT_SETTINGS={ aaaUS:5.3, aaaVN:6.0, rfUS:4.3, erpUS:5.0, rfVN:3.2, erpVN:8.0, gtUS:2.5, gtVN:4.0, fx:26300 };
const S={
  market: store.market||'VN',
  view:'home',
  preset: store.preset||'balanced',
  custW: store.custW||null,
  stars: Array.isArray(store.stars)?store.stars:[],
  overrides: store.overrides||{},
  custom: Array.isArray(store.custom)?store.custom:[],
  settings: Object.assign({},DEFAULT_SETTINGS,store.settings||{}),
  learned: Array.isArray(store.learned)?store.learned:[],
  quizBest: store.quizBest||0,
  pWeight: store.pWeight||'score',
  theme: store.theme||'system',
  filters:{sector:'all',min:0,noflag:false,sort:'score',q:'',ex:'all'},
  listN:60,
  scrMode: store.scrMode||'stock',
  etfStars: Array.isArray(store.etfStars)?store.etfStars:[],
  ef:{grp:'all',sort:'aum',q:''},
  pf:{grp:'all',sort:'move'},
  heroIdx:0,
  expertTab:'council'
};
function saveState(){
  Object.assign(store,{market:S.market,preset:S.preset,custW:S.custW,stars:S.stars,overrides:S.overrides,custom:S.custom,settings:S.settings,learned:S.learned,quizBest:S.quizBest,pWeight:S.pWeight,theme:S.theme,scrMode:S.scrMode,etfStars:S.etfStars});
  persist();
}

/* ---------- nhân tố & thang điểm tuyệt đối ---------- */
const FACTORS=[
  {k:'val', n:'Định giá',    d:'Rẻ hay đắt so với lợi nhuận, tài sản và dòng tiền',
    gen:[['pe',-1,1],['pb',-1,.6],['ev',-1,1],['fcf',1,1],['peg',-1,.8]],
    bank:[['pe',-1,1],['pb',-1,1],['pbroe',-1,1],['dy',1,.4]]},
  {k:'qual',n:'Chất lượng',  d:'Khả năng sinh lời và hào kinh tế',
    gen:[['roe',1,.8],['roic',1,1.2],['gm',1,.8],['om',1,.8],['fs',1,.8]],
    bank:[['roe',1,1.2],['nim',1,.8],['npl',-1,1],['casa',1,.8],['fs',1,.5]]},
  {k:'grow',n:'Tăng trưởng', d:'Doanh thu, EPS quá khứ và kỳ vọng',
    gen:[['rg',1,1],['eg',1,1],['fg',1,1.2]],
    bank:[['rg',1,1],['eg',1,1],['fg',1,1.2]]},
  {k:'safe',n:'Sức khỏe',    d:'Đòn bẩy, thanh khoản, rủi ro phá sản',
    gen:[['de',-1,1],['cr',1,.7],['ic',1,1],['z',1,1]],
    bank:[['car',1,1.2],['npl',-1,1],['casa',1,.4]]},
  {k:'mom', n:'Động lượng',  d:'Xu hướng giá 12 tháng và độ biến động',
    gen:[['mo',1,1.4],['b',-1,.6]],
    bank:[['mo',1,1.4],['b',-1,.6]]},
  {k:'inc', n:'Thu nhập',    d:'Cổ tức và độ bền vững chi trả',
    gen:[['dy',1,1],['posafe',1,.7],['fcf',1,.6]],
    bank:[['dy',1,1],['posafe',1,.7]]}
];
const MET={
  pe:{n:'P/E',u:'x',lo:true},pb:{n:'P/B',u:'x',lo:true},ev:{n:'EV/EBITDA',u:'x',lo:true},fcf:{n:'Tỷ suất FCF',u:'%'},peg:{n:'PEG',u:'x',lo:true},
  pbroe:{n:'P/B ÷ ROE (×10)',u:'x',lo:true},dy:{n:'Tỷ suất cổ tức',u:'%'},roe:{n:'ROE',u:'%'},roic:{n:'ROIC',u:'%'},gm:{n:'Biên gộp',u:'%'},
  om:{n:'Biên hoạt động',u:'%'},nm:{n:'Biên ròng',u:'%'},fs:{n:'Piotroski F-Score',u:'/9'},nim:{n:'NIM',u:'%'},npl:{n:'Nợ xấu (NPL)',u:'%',lo:true},
  casa:{n:'CASA',u:'%'},car:{n:'CAR / CET1',u:'%'},rg:{n:'Doanh thu CAGR 3N',u:'%'},eg:{n:'EPS CAGR 3N',u:'%'},fg:{n:'EPS kỳ vọng',u:'%'},
  de:{n:'Nợ / Vốn CSH',u:'x',lo:true},cr:{n:'Thanh toán hiện hành',u:'x'},ic:{n:'Khả năng trả lãi',u:'x'},z:{n:'Altman Z',u:''},
  mo:{n:'Lợi nhuận 12 tháng',u:'%'},b:{n:'Beta',u:'',lo:true},posafe:{n:'Độ an toàn chi trả',u:''},po:{n:'Tỷ lệ chi trả',u:'%'}
};
/* điểm tuyệt đối: các mốc (giá trị, điểm 0–1), nội suy tuyến tính */
const ABS={
  pe:[[4,1],[10,.85],[15,.7],[22,.45],[35,.18],[60,0]], pb:[[.8,1],[1.5,.8],[3,.55],[8,.2],[20,0]],
  ev:[[5,1],[8,.8],[12,.6],[20,.3],[35,0]], fcf:[[-3,0],[0,.15],[2,.35],[4,.6],[6,.8],[9,1]],
  peg:[[.5,1],[1,.75],[1.5,.5],[2.5,.2],[4,0]], pbroe:[[.5,1],[.9,.75],[1.3,.5],[2,.2],[3,0]],
  dy:[[0,0],[1,.3],[2.5,.6],[4,.85],[6,1]], roe:[[0,0],[8,.3],[15,.62],[22,.85],[35,1]],
  roic:[[0,0],[6,.3],[12,.62],[20,.88],[30,1]], gm:[[8,.05],[20,.3],[35,.55],[55,.82],[75,1]],
  om:[[0,0],[5,.25],[12,.5],[22,.78],[40,1]], fs:[[0,0],[3,.2],[5,.5],[7,.85],[9,1]],
  nim:[[2,.2],[3,.55],[4,.85],[5,1]], npl:[[.5,1],[1,.85],[1.5,.65],[2.5,.35],[4,0]],
  casa:[[10,.1],[20,.4],[30,.72],[40,1]], car:[[8,.1],[10,.4],[12,.7],[15,1]],
  rg:[[-8,0],[0,.2],[6,.45],[12,.7],[20,.88],[35,1]], eg:[[-15,0],[0,.25],[8,.5],[15,.72],[25,.9],[45,1]],
  fg:[[-5,0],[0,.2],[6,.45],[12,.68],[20,.88],[35,1]], de:[[0,1],[.3,.88],[.6,.7],[1,.5],[2,.18],[4,0]],
  cr:[[.6,0],[1,.35],[1.5,.65],[2.5,.9],[4,1]], ic:[[1,0],[3,.3],[6,.55],[12,.8],[25,1]],
  z:[[1,0],[1.81,.25],[3,.65],[5,.9],[8,1]], mo:[[-35,0],[-10,.25],[0,.42],[15,.65],[35,.88],[60,1]],
  b:[[.4,1],[.8,.75],[1.1,.5],[1.5,.25],[2.2,0]]
};
function interp(pts,v){
  if(v<=pts[0][0]) return pts[0][1];
  for(let i=1;i<pts.length;i++){ if(v<=pts[i][0]){ const [x0,y0]=pts[i-1],[x1,y1]=pts[i]; return y0+(y1-y0)*(v-x0)/(x1-x0);} }
  return pts[pts.length-1][1];
}
const fscore=s=> isNum(s.fsn)? s.fsn : (s.f&&/^[01]{9}$/.test(s.f))? s.f.split('').filter(c=>c==='1').length : null;
const kn=(v,f)=> isNum(v)? f(v) : null; /* tiêu chí không có dữ liệu → null */
function metric(s,k){
  switch(k){
    case 'peg': return (isNum(s.pe)&&s.pe>0&&isNum(s.fg)&&s.fg>0)? s.pe/s.fg : null;
    case 'fs': return fscore(s);
    case 'pbroe': return (isNum(s.pb)&&s.pb>0&&isNum(s.roe)&&s.roe>0)? s.pb/s.roe*10 : null;
    case 'posafe':
      if(!isNum(s.dy)) return null;
      if(s.dy<=0) return .35;
      if(!isNum(s.po)) return .6;
      return s.po<=0?.35: s.po<60?1: s.po<80?.7: s.po<100?.35: 0;
    default: return isNum(s[k])? s[k] : null;
  }
}
/* giá trị dùng để xếp hạng: bội số âm (thua lỗ) xếp cuối */
function rankVal(s,k){
  const v=metric(s,k); if(v==null) return null;
  if((k==='pe'||k==='pb'||k==='ev')&&v<=0) return 9999;
  return v;
}
function absScore(s,k){
  const v=metric(s,k); if(v==null) return null;
  if(k==='posafe') return v;
  if((k==='pe'||k==='ev'||k==='pb')&&v<=0) return 0;
  return ABS[k]? interp(ABS[k],v) : null;
}

const PRESETS={
  balanced:{n:'Cân bằng',d:'Trọng số đều, nhấn nhẹ vào chất lượng',w:{val:20,qual:25,grow:18,safe:17,mom:8,inc:12}},
  value:{n:'Giá trị (Graham)',d:'Ưu tiên rẻ và an toàn',w:{val:40,qual:15,grow:5,safe:25,mom:0,inc:15}},
  quality:{n:'Chất lượng (Buffett)',d:'Hào kinh tế, ROIC, bảng cân đối',w:{val:15,qual:40,grow:15,safe:20,mom:0,inc:10}},
  garp:{n:'GARP (Lynch)',d:'Tăng trưởng với giá hợp lý',w:{val:30,qual:15,grow:35,safe:10,mom:5,inc:5}},
  growth:{n:'Tăng trưởng',d:'Doanh thu, EPS và động lượng',w:{val:5,qual:20,grow:45,safe:5,mom:25,inc:0}},
  momentum:{n:'Động lượng',d:'Xu hướng giá và tăng trưởng EPS',w:{val:5,qual:15,grow:25,safe:5,mom:50,inc:0}},
  income:{n:'Cổ tức',d:'Thu nhập đều đặn, bền vững',w:{val:20,qual:15,grow:5,safe:20,mom:0,inc:40}},
  defensive:{n:'Phòng thủ',d:'Ít biến động, bảng cân đối mạnh',w:{val:20,qual:25,grow:5,safe:35,mom:5,inc:10}}
};
function curWeights(){ return S.preset==='custom'&&S.custW? S.custW : PRESETS[S.preset]?PRESETS[S.preset].w : PRESETS.balanced.w; }

/* ---------- vũ trụ cổ phiếu & tính điểm ---------- */
let U=[]; let BY={};
function universe(){
  const base=STOCKS.concat(S.custom.map(c=>Object.assign({custom:1},c)));
  return base.map(s=>{ const o=Object.assign({},s); return Object.assign(o,liveFund(o),S.overrides[s.t]||{},{edited:!!S.overrides[s.t]}); });
}
function computeAll(){
  U=universe(); BY={};
  U.forEach(s=>{ s._type=s.bank?'bank':'gen'; BY[s.t]=s; });
  const groupCache={};
  const peersOf=s=>{
    const key=s._type+'|'+s.m;
    if(groupCache[key]) return groupCache[key];
    let P=U.filter(x=>x._type===s._type&&x.m===s.m);
    if(P.length<6) P=U.filter(x=>x._type===s._type);
    return groupCache[key]=P;
  };
  const sorted={};
  const pctRank=(s,k,dir)=>{
    const P=peersOf(s); const key=s._type+'|'+s.m+'|'+k;
    let arr=sorted[key];
    if(!arr){ arr=P.map(x=>rankVal(x,k)).filter(v=>v!=null).sort((a,b)=>a-b); sorted[key]=arr; }
    const v=rankVal(s,k); if(v==null||arr.length<3) return null;
    let a0=0,b0=arr.length; while(a0<b0){ const m=(a0+b0)>>1; if(arr[m]<v) a0=m+1; else b0=m; } const lo=a0;
    let c0=lo,d0=arr.length; while(c0<d0){ const m=(c0+d0)>>1; if(arr[m]<=v) c0=m+1; else d0=m; } const eq=c0-lo;
    const r=(lo+(eq-1)/2)/(arr.length-1);
    return dir>0? r : 1-r;
  };
  const W=curWeights(); const wsum=Object.values(W).reduce((a,b)=>a+b,0)||1;
  U.forEach(s=>{
    s._f={}; s._m={};
    FACTORS.forEach(F=>{
      const list=F[s._type]; let tot=0, wt=0;
      list.forEach(([k,dir,w])=>{
        const r=pctRank(s,k,dir), a=absScore(s,k);
        let sc=null;
        if(r!=null&&a!=null) sc=.55*r+.45*a; else if(r!=null) sc=r; else if(a!=null) sc=a;
        s._m[k]={v:metric(s,k),sc,r,a};
        if(sc!=null){ tot+=sc*w; wt+=w; }
      });
      s._f[F.k]= wt? Math.round(tot/wt*100) : 50;
    });
    let comp=0; FACTORS.forEach(F=>comp+=s._f[F.k]*(W[F.k]||0)); comp/=wsum;
    /* cờ đỏ — nhân hệ số phạt */
    const flags=[]; let mult=1;
    const fs=fscore(s);
    if(!s.bank&&isNum(s.z)&&s.z<1.81){ flags.push('Altman Z vùng nguy hiểm'); mult*=.86; }
    if(!s.bank&&s.s!=='ins'&&s.s!=='broker'&&fs!=null&&fs<=3){ flags.push('F-Score yếu ('+fs+'/9)'); mult*=.88; }
    if(!s.bank&&isNum(s.de)&&s.de>2){ flags.push('Đòn bẩy cao (D/E '+fmt(s.de)+')'); mult*=.93; }
    if(!s.bank&&isNum(s.ic)&&s.ic<2.5){ flags.push('Trả lãi khó (ICR '+fmt(s.ic)+')'); mult*=.92; }
    if(s.bank&&isNum(s.npl)&&s.npl>3){ flags.push('Nợ xấu cao ('+fmt(s.npl)+'%)'); mult*=.88; }
    if(s.bank&&isNum(s.car)&&s.car<9){ flags.push('Đệm vốn mỏng (CAR '+fmt(s.car)+'%)'); mult*=.94; }
    if(isNum(s.fcf)&&s.fcf<0){ flags.push('Dòng tiền tự do âm'); mult*=.95; }
    if(isNum(s.pe)&&(s.pe>60||s.pe<=0)){ flags.push(s.pe<=0?'Đang thua lỗ':'P/E rất cao ('+fmt(s.pe,0)+'x)'); mult*=.93; }
    if(isNum(s.po)&&s.po>100){ flags.push('Chi trả vượt lợi nhuận'); mult*=.95; }
    s._flags=flags;
    s._score=Math.round(clamp(comp*mult,0,100));
    const vals=FACTORS.map(F=>s._f[F.k]); const mean=vals.reduce((a,b)=>a+b,0)/6;
    s._disp=Math.round(Math.sqrt(vals.reduce((a,b)=>a+(b-mean)*(b-mean),0)/6));
    s._grade= s._score>=70?'A': s._score>=58?'B': s._score>=45?'C':'D';
  });
  /* xếp hạng trong thị trường, Magic Formula, động lượng */
  ['US','VN'].forEach(m=>{
    const L=U.filter(s=>s.m===m).sort((a,b)=>b._score-a._score);
    L.forEach((s,i)=>{ s._rank=i+1; s._of=L.length; });
    const G=L.filter(s=>!s.bank&&s.s!=='broker'&&s.s!=='ins'&&isNum(s.ev)&&s.ev>0&&isNum(s.roic));
    const byEY=[...G].sort((a,b)=>a.ev-b.ev), byRC=[...G].sort((a,b)=>b.roic-a.roic);
    G.forEach(s=>s._mfRank=byEY.indexOf(s)+byRC.indexOf(s));
    const mf=[...G].sort((a,b)=>a._mfRank-b._mfRank); mf.forEach((s,i)=>s._mfPct=1-i/Math.max(1,mf.length-1));
    const mo=[...L].filter(s=>isNum(s.mo)).sort((a,b)=>b.mo-a.mo); mo.forEach((s,i)=>s._moPct=1-i/Math.max(1,mo.length-1));
  });
  U.forEach(s=>{ s._val=valuation(s); s._persona=PERSONAS.map(P=>personaEval(P,s)); });
}
function inMarket(list){ return S.market==='ALL'? list : list.filter(s=>s.m===S.market); }
function ranked(){ return inMarket(U).slice().sort((a,b)=>b._score-a._score); }
function median(arr){ const a=arr.filter(isNum).sort((x,y)=>x-y); if(!a.length) return null; const m=a.length>>1; return a.length%2?a[m]:(a[m-1]+a[m])/2; }
function marketMedianFactors(m){ const L=U.filter(s=>m==='ALL'||s.m===m); const o={}; FACTORS.forEach(F=>o[F.k]=median(L.map(s=>s._f[F.k]))); return o; }

/* ---------- định giá nội tại (giá chuẩn hóa = 100) ---------- */
function mktAssump(s){ const st=S.settings; return s.m==='US'? {aaa:st.aaaUS,rf:st.rfUS,erp:st.erpUS,gt:st.gtUS} : {aaa:st.aaaVN,rf:st.rfVN,erp:st.erpVN,gt:st.gtVN}; }
function costOfEquity(s){ const a=mktAssump(s); return +(a.rf+(isNum(s.b)?s.b:1)*a.erp).toFixed(2); }
function dcfBase(s){
  const eps= isNum(s.pe)&&s.pe>0? 100/s.pe : 0;
  if(s.bank){ const g=clamp(s.fg||0,0,25); const reinv= isNum(s.roe)&&s.roe>0? clamp(g/s.roe,0,.9):.5; return eps*(1-reinv); }
  if(isNum(s.fcf)&&s.fcf>0) return s.fcf;
  return eps*.55;
}
function dcf(s,g1,r,gt,years){
  years=years||10; const base=dcfBase(s); let cf=base, sum=0; const pv=[];
  for(let t=1;t<=years;t++){
    const g= t<=5? g1 : g1+(gt-g1)*(t-5)/5;
    cf*=1+g/100; const d=cf/Math.pow(1+r/100,t); sum+=d; pv.push(d);
  }
  const tv= r>gt+.25? cf*(1+gt/100)/((r-gt)/100)/Math.pow(1+r/100,years) : NaN;
  return {base,pv,tv,total:sum+(isNum(tv)?tv:0),valid:isNum(tv)};
}
function reverseDCF(s,r,gt){
  if(dcfBase(s)<=0) return null;
  let lo=-30,hi=80;
  if(dcf(s,hi,r,gt).total<100) return hi; if(dcf(s,lo,r,gt).total>100) return lo;
  for(let i=0;i<60;i++){ const mid=(lo+hi)/2; if(dcf(s,mid,r,gt).total>100) hi=mid; else lo=mid; }
  return (lo+hi)/2;
}
function valuation(s){
  const a=mktAssump(s);
  const g=clamp(isNum(s.fg)?s.fg:(isNum(s.eg)?s.eg:0),0,15);
  const grahamPE=(8.5+2*g)*4.4/a.aaa;
  const grahamMoS= isNum(s.pe)&&s.pe>0? 1-s.pe/grahamPE : null;
  const gnUp= isNum(s.pe)&&s.pe>0&&isNum(s.pb)&&s.pb>0? Math.sqrt(22.5/(s.pe*s.pb))-1 : null;
  const r=costOfEquity(s); const g1=clamp(isNum(s.fg)?s.fg:5,-10,30);
  const d=dcf(s,g1,r,a.gt);
  const dcfUp= d.valid&&d.base>0? d.total/100-1 : null;
  const implied=reverseDCF(s,r,a.gt);
  let fairPB=null; if(s.bank&&isNum(s.roe)){ const gg=Math.min(a.gt+2,r-1); fairPB=(s.roe-gg)/(r-gg); }
  const pbUp= fairPB&&isNum(s.pb)? fairPB/s.pb-1 : null;
  const ests=[grahamMoS!=null?grahamPE/s.pe-1:null, dcfUp, s.bank?pbUp:gnUp].filter(isNum).map(v=>clamp(v,-.9,2));
  const blend= ests.length? median(ests) : null;
  return {grahamPE,grahamMoS,gnUp,r,g1,dcfUp,implied,fairPB,pbUp,blend};
}

/* ---------- hội đồng chuyên gia ---------- */
const PERSONAS=[
  {k:'graham',sh:"Graham",n:'Benjamin Graham',ini:'BG',role:'Giá trị phòng thủ',
    phil:'Mua khi giá thấp hơn rõ rệt so với lợi nhuận và tài sản, có biên an toàn, bảng cân đối vững và lịch sử cổ tức.',
    rules:[['P/E dưới 15',s=>s.pe>0&&s.pe<15],['P/E × P/B dưới 22,5',s=>s.pe>0&&s.pb>0&&s.pe*s.pb<22.5],
      ['Thanh toán hiện hành trên 2 (NH: CAR từ 10%)',s=>s.bank?kn(s.car,v=>v>=10):kn(s.cr,v=>v>2)],['Nợ/Vốn CSH dưới 0,5 (NH: NPL dưới 2%)',s=>s.bank?kn(s.npl,v=>v<2):kn(s.de,v=>v<0.5)],
      ['Có trả cổ tức tiền mặt',s=>s.dy>0],['EPS 3 năm tăng trưởng dương',s=>kn(s.eg,v=>v>0)]]},
  {k:'buffett',sh:"Buffett",n:'Warren Buffett',ini:'WB',role:'Doanh nghiệp xuất sắc, giá hợp lý',
    phil:'Tìm hào kinh tế bền vững: ROE và ROIC cao ổn định, biên lợi nhuận dày, ít nợ, dòng tiền chủ sở hữu dồi dào.',
    rules:[['ROE trên 15%',s=>s.roe>15],['ROIC trên 12% (NH: NIM trên 3%)',s=>s.bank?(isNum(s.nim)?s.nim>3:kn(s.roa,v=>v>1.2)):kn(s.roic,v=>v>12)],
      ['Biên gộp trên 40% (NH: CASA trên 25%)',s=>s.bank?kn(s.casa,v=>v>25):kn(s.gm,v=>v>40)],['Nợ/Vốn CSH dưới 0,6 (NH: CAR từ 11%)',s=>s.bank?kn(s.car,v=>v>=11):kn(s.de,v=>v<0.6)],
      ['Tỷ suất FCF trên 3% (NH: P/B dưới 2)',s=>s.bank?kn(s.pb,v=>v<2):kn(s.fcf,v=>v>3)],['P/E dưới 25',s=>s.pe>0&&s.pe<25]]},
  {k:'lynch',sh:"Lynch",n:'Peter Lynch',ini:'PL',must:[0],role:'Tăng trưởng giá hợp lý (GARP)',
    phil:'Doanh nghiệp tăng trưởng 10–35%/năm mà thị trường chưa định giá hết: PEG dưới 1, nợ thấp, câu chuyện dễ hiểu.',
    rules:[['PEG dưới 1',s=>{const p=metric(s,'peg');return p!=null&&p<1;}],['EPS kỳ vọng 10–35%/năm',s=>s.fg>=10&&s.fg<=35],
      ['EPS 3 năm trên 8%/năm',s=>kn(s.eg,v=>v>8)],['Nợ/Vốn CSH dưới 0,8 (NH: NPL dưới 2%)',s=>s.bank?kn(s.npl,v=>v<2):kn(s.de,v=>v<0.8)],['P/E dưới 30',s=>s.pe>0&&s.pe<30]]},
  {k:'greenblatt',sh:"Greenblatt",n:'Joel Greenblatt',ini:'JG',must:[3],role:'Magic Formula',
    phil:'Xếp hạng toàn bộ thị trường theo hai thứ: lợi suất thu nhập (rẻ) và ROIC (tốt), mua nhóm có tổng thứ hạng thấp nhất.',
    rules:[['Lợi suất thu nhập (1 ÷ EV/EBITDA) trên 7%',s=>s.ev>0&&100/s.ev>7],['ROIC trên 18%',s=>s.roic>18],
      ['Nằm trong 35% đầu bảng Magic Formula',s=>isNum(s._mfPct)&&s._mfPct>=.65],['Không phải tài chính (NH, CK, bảo hiểm)',s=>!s.bank&&s.s!=='broker'&&s.s!=='ins']]},
  {k:'piotroski',sh:"Piotroski",n:'Joseph Piotroski',ini:'JP',must:[0],role:'Giá trị + sức khỏe kế toán',
    phil:'Trong nhóm cổ phiếu rẻ, chọn doanh nghiệp có báo cáo tài chính đang cải thiện qua 9 phép thử đơn giản.',
    rules:[['F-Score từ 7/9',s=>fscore(s)>=7],['P/B dưới 3',s=>s.pb>0&&s.pb<3],['Dòng tiền tự do ít nhất bằng 80% lợi nhuận',s=>s.f&&!isNum(s.fsn)? s.f[3]==='1' : (isNum(s.fcf)&&isNum(s.pe)&&s.pe>0? s.fcf>=80/s.pe : null)],['Không đang thua lỗ, ROA dương',s=>isNum(s.roa)? s.roa>0 : (s.f? s.f[0]==='1' : null)]]},
  {k:'fisher',sh:"Fisher",n:'Philip Fisher',ini:'PF',role:'Tăng trưởng chất lượng dài hạn',
    phil:'Giữ lâu dài những doanh nghiệp có tăng trưởng doanh thu bền, biên lợi nhuận vượt trội và năng lực tái đầu tư.',
    rules:[['Doanh thu 3 năm trên 12%/năm',s=>kn(s.rg,v=>v>12)],['Biên hoạt động trên 15% (NH: ROE trên 15%)',s=>s.bank?s.roe>15:s.om>15],
      ['EPS kỳ vọng trên 12%/năm',s=>s.fg>12],['Biên gộp trên 35% (NH: NIM trên 3,5%)',s=>s.bank?(isNum(s.nim)?s.nim>3.5:kn(s.roa,v=>v>1.5)):kn(s.gm,v=>v>35)]]},
  {k:'oneil',sh:"O'Neil",n:"William O'Neil",ini:'WO',must:[0],role:'CAN SLIM – động lượng tăng trưởng',
    phil:'Mua cổ phiếu dẫn dắt: EPS tăng mạnh, sức mạnh giá tương đối cao, ROE tốt, đi cùng xu hướng thị trường.',
    rules:[['EPS 3 năm trên 20%/năm',s=>kn(s.eg,v=>v>20)],['Lợi nhuận 12 tháng thuộc 30% mạnh nhất',s=>isNum(s._moPct)&&s._moPct>=.7],['ROE trên 17%',s=>s.roe>17],['EPS kỳ vọng trên 15%',s=>s.fg>15]]},
  {k:'income',sh:"Cổ tức",n:'Nhà đầu tư cổ tức',ini:'CT',must:[0],role:'Thu nhập bền vững',
    phil:'Ưu tiên dòng cổ tức tiền mặt đều đặn, được dòng tiền tự do bảo chứng, biến động giá thấp.',
    rules:[['Tỷ suất cổ tức trên 3%',s=>s.dy>3],['Tỷ lệ chi trả dưới 80%',s=>s.po>0&&s.po<80],['FCF lớn hơn cổ tức (NH: CAR từ 11%)',s=>s.bank?kn(s.car,v=>v>=11):(isNum(s.fcf)&&isNum(s.dy)?s.fcf>s.dy:null)],['Beta dưới 1',s=>s.b<1]]}
];
function personaEval(P,s){
  const res=P.rules.map(([t,f])=>{ let ok=false; try{ const v=f(s); ok= v===null? null : !!v; }catch(e){ ok=false; } return ok; });
  const n=res.filter(x=>x===true).length, known=res.filter(x=>x!==null).length;
  const mustOk=(P.must||[]).every(i=>res[i]===true);
  /* tiêu chí thiếu dữ liệu bị loại khỏi mẫu số, nhưng phải có ít nhất 3/4 tiêu chí có dữ liệu */
  return {k:P.k,res,n,tot:known,all:res.length,pass:mustOk&&known>=Math.ceil(res.length*.75)&&n/known>=.75};
}

/* ---------- SVG: biểu đồ ---------- */
function ringSVG(score,size,stroke,col){
  const r=(size-stroke)/2, c=2*Math.PI*r, off=c*(1-clamp(score,0,100)/100);
  col=col||scoreColor(score);
  return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" style="stroke:var(--line)" stroke-width="${stroke}"/><circle class="ring-arc" cx="${size/2}" cy="${size/2}" r="${r}" fill="none" style="stroke:${col}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" data-c="${c.toFixed(2)}" data-off="${off.toFixed(2)}"/></svg>`;
}
function scoreColor(v){ return v>=70?'var(--up)': v>=58?'var(--gold)': v>=45?'var(--mut)':'var(--dn)'; }
function heatColor(v){ /* đỏ → vàng → xanh, đồng nhất hai chủ đề */
  const t=clamp((v-30)/50,0,1);
  const stops=[[184,52,44],[150,106,26],[26,122,84]];
  const seg=t<.5?0:1, lt=t<.5?t*2:(t-.5)*2;
  const a=stops[seg],b=stops[seg+1];
  return `rgb(${Math.round(a[0]+(b[0]-a[0])*lt)},${Math.round(a[1]+(b[1]-a[1])*lt)},${Math.round(a[2]+(b[2]-a[2])*lt)})`;
}
function glyphHTML(s){
  return '<span class="glyph" aria-hidden="true">'+FACTORS.map(F=>`<i style="height:${Math.max(3,Math.round(s._f[F.k]/100*26))}px;opacity:${(.35+s._f[F.k]/160).toFixed(2)}"></i>`).join('')+'</span>';
}
function radarSVG(vals,opt){
  opt=opt||{}; const size=opt.size||300, cx=size/2, cy=size/2, R=size*(opt.bezel?.33:.36);
  const n=vals.length, ang=i=>-Math.PI/2+i*2*Math.PI/n;
  const pt=(i,v)=>[cx+Math.cos(ang(i))*R*v, cy+Math.sin(ang(i))*R*v];
  let g='';
  if(opt.bezel){
    g+=`<g class="bezel"><circle cx="${cx}" cy="${cy}" r="${R*1.38}" fill="none" style="stroke:var(--line2)" stroke-width="1"/>`;
    for(let i=0;i<72;i++){ const a=i*Math.PI/36, l=i%6===0?10:i%2===0?6:3, r1=R*1.38, r2=r1-l;
      g+=`<line x1="${(cx+Math.cos(a)*r1).toFixed(1)}" y1="${(cy+Math.sin(a)*r1).toFixed(1)}" x2="${(cx+Math.cos(a)*r2).toFixed(1)}" y2="${(cy+Math.sin(a)*r2).toFixed(1)}" style="stroke:${i%18===0?'var(--gold)':'var(--line2)'}" stroke-width="${i%6===0?1.6:1}"/>`; }
    g+=`<circle cx="${cx}" cy="${cy}" r="${R*1.5}" fill="none" style="stroke:var(--line)" stroke-width="1" stroke-dasharray="1 5"/></g>`;
  }
  [.25,.5,.75,1].forEach(k=>{ g+=`<polygon points="${vals.map((_,i)=>pt(i,k).map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="none" style="stroke:var(--line)" stroke-width="1"/>`; });
  vals.forEach((_,i)=>{ const [x,y]=pt(i,1); g+=`<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" style="stroke:var(--line)" stroke-width="1"/>`; });
  if(opt.median){ g+=`<polygon points="${opt.median.map((v,i)=>pt(i,clamp(v,0,1)).map(z=>z.toFixed(1)).join(',')).join(' ')}" fill="none" style="stroke:var(--mut)" stroke-width="1.3" stroke-dasharray="4 4"/>`; }
  if(opt.compare){ g+=`<polygon class="radar-cmp" points="${opt.compare.map((v,i)=>pt(i,clamp(v,0,1)).map(z=>z.toFixed(1)).join(',')).join(' ')}" style="fill:var(--us);fill-opacity:.16;stroke:var(--us)" stroke-width="2" stroke-linejoin="round"/>`; }
  g+=`<polygon class="radar-poly" points="${vals.map((v,i)=>pt(i,clamp(v,0,1)).map(z=>z.toFixed(1)).join(',')).join(' ')}" style="fill:var(--gold);fill-opacity:.2;stroke:var(--gold);transform-origin:${cx}px ${cy}px" stroke-width="2.2" stroke-linejoin="round"/>`;
  vals.forEach((v,i)=>{ const [x,y]=pt(i,clamp(v,0,1)); g+=`<circle class="radar-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" style="fill:var(--gold);stroke:var(--bg)" stroke-width="1.5"/>`; });
  if(opt.labels){ opt.labels.forEach((l,i)=>{ const a=ang(i), lr=R*(opt.bezel?1.18:1.2), x=cx+Math.cos(a)*lr, y=cy+Math.sin(a)*lr;
    const anchor=Math.abs(Math.cos(a))<.2?'middle':Math.cos(a)>0?'start':'end';
    g+=`<text x="${x.toFixed(1)}" y="${(y-2).toFixed(1)}" text-anchor="${anchor}" class="lbl-strong" style="font-size:${opt.fs||11.5}px">${esc(l)}</text>`;
    if(opt.sub&&opt.sub2) g+=`<text x="${x.toFixed(1)}" y="${(y+12).toFixed(1)}" text-anchor="${anchor}" style="font-size:${(opt.fs||11.5)-1}px;font-weight:700"><tspan style="fill:var(--gold)">${esc(opt.sub[i])}</tspan><tspan style="fill:var(--mut)"> · </tspan><tspan style="fill:var(--us)">${esc(opt.sub2[i])}</tspan></text>`;
    else if(opt.sub) g+=`<text x="${x.toFixed(1)}" y="${(y+12).toFixed(1)}" text-anchor="${anchor}" style="font-size:${(opt.fs||11.5)-1}px;fill:var(--gold);font-weight:700">${esc(opt.sub[i])}</text>`; }); }
  if(opt.center){ g+=`<text x="${cx}" y="${cy+6}" text-anchor="middle" style="font-family:var(--f-disp);font-weight:800;font-size:${size*.075}px;fill:var(--fg)">${esc(opt.center)}</text>`; }
  const pad=opt.pad||0;
  return `<svg class="chart" viewBox="${-pad} ${-pad} ${size+pad*2} ${size+pad*2}" role="img" aria-label="${esc(opt.aria||'Biểu đồ radar')}">${g}</svg>`;
}
/* treemap dạng squarify */
function squarify(items,x,y,w,h){
  const out=[]; items=items.slice().sort((a,b)=>b.v-a.v);
  const total=items.reduce((a,b)=>a+b.v,0); if(!total) return out;
  const scale=w*h/total; let rest=items.map(i=>Object.assign({},i,{a:i.v*scale}));
  const worst=(row,len)=>{ const s=row.reduce((a,b)=>a+b.a,0); const mx=Math.max(...row.map(r=>r.a)), mn=Math.min(...row.map(r=>r.a)); return Math.max(len*len*mx/(s*s),(s*s)/(len*len*mn)); };
  while(rest.length){
    const len=Math.min(w,h); let row=[rest[0]], i=1;
    while(i<rest.length&&worst(row.concat(rest[i]),len)<=worst(row,len)){ row.push(rest[i]); i++; }
    const s=row.reduce((a,b)=>a+b.a,0);
    if(w>=h){ const cw=s/h; let cy=y; row.forEach(r=>{ const ch=r.a/cw; out.push(Object.assign(r,{x,y:cy,w:cw,h:ch})); cy+=ch; }); x+=cw; w-=cw; }
    else { const ch=s/w; let cx=x; row.forEach(r=>{ const cw=r.a/ch; out.push(Object.assign(r,{x:cx,y,w:cw,h:ch})); cx+=cw; }); y+=ch; h-=ch; }
    rest=rest.slice(i);
  }
  return out;
}
function donutSVG(parts,size){
  size=size||160; const cx=size/2,cy=size/2,R=size*.42,r=size*.27; const tot=parts.reduce((a,b)=>a+b.v,0)||1;
  let a0=-Math.PI/2, g='';
  parts.forEach(p=>{ const a1=a0+p.v/tot*Math.PI*2; const large=a1-a0>Math.PI?1:0;
    const P=(a,rr)=>[cx+Math.cos(a)*rr,cy+Math.sin(a)*rr].map(v=>v.toFixed(2)).join(' ');
    if(p.v/tot>.999){ g+=`<circle cx="${cx}" cy="${cy}" r="${(R+r)/2}" fill="none" style="stroke:${p.c}" stroke-width="${R-r}"/>`; }
    else g+=`<path d="M${P(a0,R)} A${R} ${R} 0 ${large} 1 ${P(a1,R)} L${P(a1,r)} A${r} ${r} 0 ${large} 0 ${P(a0,r)}Z" style="fill:${p.c};stroke:var(--s1)" stroke-width="1.5"/>`;
    a0=a1; });
  return `<svg class="chart" viewBox="0 0 ${size} ${size}" role="img" aria-label="Biểu đồ vòng phân bổ">${g}</svg>`;
}
const CAT=['#D8AE57','#4FA3D9','#3DB98E','#E0715A','#A07EE0','#7FB8A8','#D98AB5','#9AA65A','#C9874A','#6C86C9','#B5A48F','#5FC1C8','#E2B25E','#8C7AAE','#7CA36A','#C7695E','#58A0B8'];
function gaugeSVG(v,label){
  /* v: biên an toàn −1 … +1 */
  const w=240,h=140,cx=120,cy=124,R=96; const t=clamp((v+.5)/1,0,1); const a=Math.PI*(1-t);
  const arc=(a0,a1,col)=>{ const P=a=>[cx+Math.cos(a)*R,cy-Math.sin(a)*R].map(z=>z.toFixed(1)).join(' '); return `<path d="M${P(a0)} A${R} ${R} 0 0 1 ${P(a1)}" fill="none" style="stroke:${col}" stroke-width="14"/>`; };
  let g=arc(Math.PI,Math.PI*.7,'var(--dn)')+arc(Math.PI*.7,Math.PI*.5,'var(--ref)')+arc(Math.PI*.5,Math.PI*.3,'color-mix(in srgb,var(--up) 60%,var(--ref))')+arc(Math.PI*.3,0,'var(--up)');
  const nx=cx+Math.cos(a)*(R-22), ny=cy-Math.sin(a)*(R-22);
  g+=`<line class="needle" x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" style="stroke:var(--fg)" stroke-width="3" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="6" style="fill:var(--fg)"/>`;
  g+=`<text x="16" y="138" style="font-size:10.5px">Đắt −50%</text><text x="224" y="138" text-anchor="end" style="font-size:10.5px">Rẻ +50%</text>`;
  g+=`<text x="${cx}" y="${cy-34}" text-anchor="middle" style="font-family:var(--f-disp);font-size:24px;font-weight:800;fill:var(--fg)">${v==null?'—':sgn(v*100,0)}</text><text x="${cx}" y="${cy-18}" text-anchor="middle" style="font-size:10.5px">${esc(label||'')}</text>`;
  return `<svg class="chart" viewBox="0 0 ${w} ${h+4}" role="img" aria-label="Đồng hồ biên an toàn ${v==null?'':sgn(v*100,0)}" style="max-width:300px;margin:0 auto">${g}</svg>`;
}

/* nhãn không chồng nhau: trả về true nếu đặt được */
function labelPlacer(){ const boxes=[]; return (x,y,w,h)=>{ const b=[x-w/2,y-h,x+w/2,y]; if(boxes.some(o=>!(b[2]<o[0]||b[0]>o[2]||b[3]<o[1]||b[1]>o[3]))) return false; boxes.push(b); return true; }; }
/* ---------- tiện ích UI ---------- */
let toastT;
function toast(msg){ const t=$('#toast'); t.textContent=msg; t.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>t.hidden=true,2200); }
const HAS_GSAP=()=>typeof window.gsap!=='undefined';
const REDUCED=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function animateRings(root){
  if(!HAS_GSAP()||REDUCED()) return;
  $$('.ring-arc',root).forEach(el=>{ gsap.fromTo(el,{strokeDashoffset:+el.dataset.c},{strokeDashoffset:+el.dataset.off,duration:1,ease:'power3.out'}); });
}
function animateRadar(root){
  if(!HAS_GSAP()||REDUCED()) return;
  const p=$$('.radar-poly',root); if(p.length) gsap.fromTo(p,{scale:.05,opacity:0},{scale:1,opacity:1,duration:.9,ease:'back.out(1.4)'});
  const d=$$('.radar-dot',root); if(d.length) gsap.fromTo(d,{opacity:0},{opacity:1,duration:.3,delay:.6,stagger:.04});
}
function starSVG(on){ return `<svg viewBox="0 0 24 24" ${on?'fill="currentColor"':'fill="none"'} stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8z"/></svg>`; }
function isStar(t){ return S.stars.includes(t); }
function toggleStar(t){ if(isStar(t)) S.stars=S.stars.filter(x=>x!==t); else S.stars.push(t); saveState(); toast(isStar(t)?'Đã thêm '+t+' vào danh mục':'Đã bỏ '+t+' khỏi danh mục'); }
function capText(s){ return s.m==='US'? '$'+fmt(s.cap,0)+' tỷ' : fmt(s.cap,0)+' nghìn tỷ ₫'; }
function capUSD(s){ return s.m==='US'? s.cap : s.cap*1000/S.settings.fx; }
function mktName(m){ return m==='US'?'Mỹ':m==='VN'?'Việt Nam':'Mỹ + Việt Nam'; }
