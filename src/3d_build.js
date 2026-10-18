/* ============================================================
   VŨ TRỤ MÃ: 503 mã S&P 500 + 500 mã Việt Nam (HOSE + HNX) + ~200 ETF Mỹ
   Chỉ số cơ bản: bản nhúng (FUND_*) bị ghi đè bởi bản mới hơn trong cơ sở dữ liệu (fund/*).
   Mã Việt Nam trùng ký hiệu với mã Mỹ được gắn hậu tố ".VN" (ví dụ ABT.VN).
   ============================================================ */
const US_TICKERS=new Set(UNI_US.map(r=>r[0]));
const vnId=t=>US_TICKERS.has(t)? t+'.VN' : t;
const DBFUND={US:{},VN:{},ETF:{},keys:null,ekeys:null,asof:{}};
const CUR_BY={}; CURATED.forEach(s=>CUR_BY[s.m+':'+s.t]=s);
function decodeF(keys,arr){ const o={}; if(Array.isArray(arr)) keys.forEach((k,i)=>{ const v=arr[i]; if(v!=null&&v!=='') o[k]=v; }); return o; }
const CUR_KEEP=['n','s','nim','npl','casa','car','f','bank'];
function mkStock(m,id,tk,base,f,fromDb){
  const cur=CUR_BY[m+':'+tk];
  if(!f&&!cur) return null;
  const o=Object.assign({},cur||{},base);
  if(cur) CUR_KEEP.forEach(k=>{ if(cur[k]!=null) o[k]=cur[k]; });
  if(f) Object.keys(f).forEach(k=>{ if(isNum(f[k])||typeof f[k]==='string') o[k]=f[k]; });
  o.t=id; o.tk=tk; o.m=m; o.bank= o.s==='bank'?1:undefined;
  o._src= f? (fromDb?'db':'gen') : 'est';
  if(isNum(o.ic)&&o.ic>999) o.ic=999;
  if(f&&!isNum(o.dy)&&o._src!=='est'){ o.dy=0; } /* nguồn ghi n/a = không trả cổ tức tiền mặt */
  return o;
}
function buildStocks(){
  const out=[]; const pend={US:[],VN:[]};
  const kU=DBFUND.keys||FKEYS;
  UNI_US.forEach(([t,n,s,sub])=>{
    const dbr=DBFUND.US[t]; const f= dbr? decodeF(kU,dbr) : FUND_US[t]? decodeF(FKEYS,FUND_US[t]) : null;
    const r=mkStock('US',t,t,{n,s,sub,ex:'S&P 500'},f,!!dbr); if(r) out.push(r); else pend.US.push(t);
  });
  UNI_VN.forEach(([t,n,ex,s])=>{
    const dbr=DBFUND.VN[t]; const f= dbr? decodeF(kU,dbr) : FUND_VN[t]? decodeF(FKEYS,FUND_VN[t]) : null;
    const r=mkStock('VN',vnId(t),t,{n,s,ex},f,!!dbr); if(r) out.push(r); else pend.VN.push(t);
  });
  PENDING=pend;
  return out;
}
let PENDING={US:[],VN:[]};
let STOCKS=[];
/* ---------- ETF ---------- */
const ETF_PAIR_OF={}; ETF_PAIRS.forEach(([a,b,g,u],i)=>{ ETF_PAIR_OF[a]={i,side:'L',mate:b,g,u}; ETF_PAIR_OF[b]={i,side:'S',mate:a,g,u}; });
let ETFS=[], EBY={};
function buildETFs(){
  const k=DBFUND.ekeys||EFKEYS;
  ETFS=ETF_UNI.map(([t,grp,levg])=>{
    const dbr=DBFUND.ETF[t]; const f= dbr? decodeF(k,dbr) : ETF_FUND[t]? decodeF(EFKEYS,ETF_FUND[t]) : {};
    const p=ETF_PAIR_OF[t];
    const o=Object.assign({t,grp},f);
    let lev=isNum(o.lev)?o.lev:(isNum(levg)?levg:1);
    if(p&&p.side==='S'&&lev>0) lev=-lev;
    if(p&&p.side==='L'&&lev<0) lev=-lev;
    o.lev=lev; o.pair=p||null; o._nf=!Object.keys(f).length;
    if(!o.n) o.n= p? (p.side==='L'?'Tăng theo ':'Ngược chiều ')+p.u : t;
    return o;
  });
  EBY={}; ETFS.forEach(e=>EBY[e.t]=e);
}
function rebuildUniverse(){ STOCKS=buildStocks(); buildETFs(); }
rebuildUniverse();
