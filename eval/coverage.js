const fs=require('fs'),vm=require('vm'),path=require('path');
const ROOT=path.resolve(__dirname,'..','src');
const files=['3_data.js','3c_universe.js','3e_epsh.js','4a_core.js','4a1_cycle.js','3d_build.js','4b_views.js','4c_more.js','4d_learn.js','4h_live.js'];
const ctx={window:{},document:{readyState:'loading',addEventListener(){}},console,Math,JSON,location:{hash:''},history:{}};
vm.createContext(ctx); vm.runInContext(files.map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n')+';globalThis.T={computeAll,U:()=>U,FACTORS,metric,PENDING:()=>PENDING};',ctx);
const T=ctx.T; T.computeAll();
for(const m of ['US','VN']){ const L=T.U().filter(s=>s.m===m); const cov=L.map(s=>s._cov).sort((a,b)=>a-b);
  const miss={}; L.forEach(s=>T.FACTORS.forEach(F=>F[s._type].forEach(([k])=>{ if(T.metric(s,k)==null) miss[k]=(miss[k]||0)+1; })));
  console.log(m,'n',L.length,'pending',T.PENDING()[m].length,'cov median',cov[cov.length>>1].toFixed(2),'p10',cov[Math.floor(cov.length*.1)].toFixed(2),'<60%:',cov.filter(x=>x<.6).length,'missing',JSON.stringify(Object.entries(miss).sort((a,b)=>b[1]-a[1]).slice(0,12)));
}
