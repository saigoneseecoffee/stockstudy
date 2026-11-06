/* Kiểm định ngoài mẫu: chấm điểm bằng dữ liệu cơ bản lấy ngày t0 (FUND_ASOF) với giá đóng cửa ngày t0,
   rồi đo lợi nhuận thực tế từ t0 đến phiên cuối trong snap. Dùng: node eval/backtest.js <thư mục snap> [t0] [variant]
   variant được truyền vào app qua globalThis.ALGO_V (1 = thuật toán cũ, 2 = mới). */
const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.resolve(__dirname,'..','src'); const SNAP=process.argv[2]; const T0=process.argv[3]||'2026-10-16'; const V=+(process.argv[4]||2);
const files=['3_data.js','3c_universe.js','3e_epsh.js','4a_core.js','4a1_cycle.js','3d_build.js','4b_views.js','4c_more.js','4d_learn.js','4h_live.js'];
const code=files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n');
const ctx={window:{},document:{readyState:'loading',addEventListener(){}},console,Math,JSON,location:{hash:''},history:{},ALGO_V:V};
vm.createContext(ctx);
vm.runInContext(code+';globalThis.T={computeAll,U:()=>U,LIVE,rebuildLive,S,FACTORS};',ctx);
const T=ctx.T;
function cut(doc){ const i=doc.dates.indexOf(T0); if(i<0) throw new Error('no t0 '+T0+' in '+doc.dates.join(',')); const q={},c={};
  for(const t in doc.c){ const a=doc.c[t]; const px=a[i]; if(px==null) continue; const prev=a[i-1]; q[t]=[px, prev?((px/prev-1)*100):null, doc.q[t]?doc.q[t][2]:null]; c[t]=a.slice(0,i+1); }
  return {d:T0,dates:doc.dates.slice(0,i+1),q,c}; }
const docs={}; for(const k of ['US','VN']) docs[k]=JSON.parse(fs.readFileSync(path.join(SNAP,k+'.json')));
for(const k of ['US','VN']) T.LIVE.snap[k]=cut(docs[k]);
T.rebuildLive(); T.computeAll();
const rank=a=>{ const idx=a.map((v,i)=>[v,i]).sort((x,y)=>x[0]-y[0]); const r=new Array(a.length); let i=0; while(i<idx.length){ let j=i; while(j+1<idx.length&&idx[j+1][0]===idx[i][0]) j++; for(let k=i;k<=j;k++) r[idx[k][1]]=(i+j)/2; i=j+1; } return r; };
const corr=(a,b)=>{ const n=a.length, ma=a.reduce((x,y)=>x+y,0)/n, mb=b.reduce((x,y)=>x+y,0)/n; let s=0,sa=0,sb=0; for(let i=0;i<n;i++){ s+=(a[i]-ma)*(b[i]-mb); sa+=(a[i]-ma)**2; sb+=(b[i]-mb)**2; } return s/Math.sqrt(sa*sb); };
const med=a=>{ const s=a.slice().sort((x,y)=>x-y); const n=s.length; return n%2?s[(n-1)/2]:(s[n/2-1]+s[n/2])/2; };
const out={t0:T0,v:V};
for(const m of ['US','VN']){
  const d=docs[m]; const last=d.dates.length-1; const i0=d.dates.indexOf(T0);
  const rows=T.U().filter(s=>s.m===m).map(s=>{ const a=d.c[s.tk||s.t]||d.c[s.t]; if(!a) return null; const p0=a[i0], p1=a[last]; if(!(p0>0&&p1>0)) return null; return {t:s.t,sc:s._score,f:s._f,r:p1/p0-1}; }).filter(Boolean);
  const sc=rows.map(x=>x.sc), r=rows.map(x=>x.r); const mr=med(r);
  const ic=corr(rank(sc),rank(r));
  const srt=rows.slice().sort((a,b)=>b.sc-a.sc); const q=Math.floor(srt.length/5);
  const mean=a=>a.reduce((x,y)=>x+y,0)/a.length;
  const top=srt.slice(0,q), bot=srt.slice(-q), top20=srt.slice(0,20);
  const fic={}; T.FACTORS.forEach(F=>{ fic[F.k]=+corr(rank(rows.map(x=>x.f[F.k])),rank(r)).toFixed(3); });
  out[m]={n:rows.length,days:last-i0,to:d.dates[last],ic:+ic.toFixed(3),q5q1:+((mean(top.map(x=>x.r))-mean(bot.map(x=>x.r)))*100).toFixed(2),
    top20ex:+((mean(top20.map(x=>x.r))-mr)*100).toFixed(2),hit20:Math.round(top20.filter(x=>x.r>mr).length/20*100),
    hitQ5:Math.round(top.filter(x=>x.r>mr).length/top.length*100),factorIC:fic};
}
console.log(JSON.stringify(out));
