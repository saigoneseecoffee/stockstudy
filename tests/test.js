const fs=require('fs'),vm=require('vm');
const code=['3_data.js','3c_universe.js','4a_core.js','3d_build.js','4b_views.js','4c_more.js','4d_learn.js','4h_live.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n');
const ctx={window:{},document:{readyState:'loading',addEventListener(){}},console,Math,JSON,location:{hash:''},history:{}};
vm.createContext(ctx);
vm.runInContext(code+`
;globalThis.T={computeAll,ranked,U:()=>U,BY:()=>BY,S,dcf,reverseDCF,valuation,positionSize,kelly,recoveryNeeded,compoundSeries,priceBand,interp,fscore,PRESETS};`,ctx);
const T=ctx.T; let fails=0; const eq=(a,b,msg,tol=1e-6)=>{ const ok=Math.abs(a-b)<=tol; if(!ok){fails++;console.log('FAIL',msg,a,b);} else console.log('ok  ',msg); };
T.computeAll();
// math
eq(T.kelly(.55,1),.10,'Kelly p=.55 b=1');
eq(T.recoveryNeeded(.5),1,'Recover 50%');
eq(T.recoveryNeeded(.2),.25,'Recover 20%');
let p=T.positionSize(500e6,1,28500,26500,100); eq(p.shares,2500,'Position shares lot 100');
p=T.positionSize(10000,2,100,95,1); eq(p.shares,40,'Position shares US');
let b=T.priceBand(27350,'HOSE'); eq(b.ceil,29250,'HOSE ceil'); eq(b.floor,25450,'HOSE floor');
b=T.priceBand(50000,'HOSE'); eq(b.ceil,53500,'HOSE ceil 50k'); eq(b.floor,46500,'HOSE floor 50k');
b=T.priceBand(9500,'HOSE'); eq(b.ceil,10150,'HOSE ceil 9500 (tick 50 above 10k)'); eq(b.floor,8840,'HOSE floor 9500');
b=T.priceBand(12300,'HNX'); eq(b.ceil,13500,'HNX ceil'); eq(b.floor,11100,'HNX floor');
let c=T.compoundSeries(100,0,12,1); eq(c[0].v,100*Math.pow(1.01,12),'Compound 12%/12 monthly 1y');
eq(T.interp([[0,0],[10,1]],5),.5,'interp');
// DCF sanity: zero growth, r, gt=0 perpetuity ≈ base/r
const s={t:'X',m:'US',pe:20,pb:2,fcf:5,b:1,fg:0};
let d=T.dcf(s,0,10,0,10); eq(d.total,50,'DCF no-growth perpetuity = FCF/r',1e-6);
let g=T.reverseDCF(s,10,0); eq(T.dcf(s,g,10,0).total,100,'Reverse DCF solves to price',1e-3);
// scoring sanity
const L=T.U(); console.log('stocks',L.length);
const bad=L.filter(x=>!(x._score>=0&&x._score<=100)||Object.values(x._f).some(v=>!(v>=0&&v<=100)));
eq(bad.length,0,'All scores in 0..100');
['VN','US'].forEach(m=>{ T.S.market=m; const R=T.ranked(); console.log(m,R.map(x=>x.t+':'+x._score+x._grade).join(' ')); });
const grades={}; L.forEach(x=>grades[x._grade]=(grades[x._grade]||0)+1); console.log('grades',grades);
const BY=T.BY(); ['VIC','FPT','NVDA','JPM','VCB'].forEach(t=>{const x=BY[t]; console.log(t,JSON.stringify(x._f),x._flags,JSON.stringify(x._val,(k,v)=>typeof v==='number'?+v.toFixed(3):v), x._persona.filter(p=>p.pass).map(p=>p.k));});
for(const k of Object.keys(T.PRESETS)){ T.S.preset=k; T.computeAll(); T.S.market='ALL'; console.log(k, T.ranked().slice(0,5).map(x=>x.t).join(',')); }
console.log(fails?fails+' FAILED':'ALL PASS');
