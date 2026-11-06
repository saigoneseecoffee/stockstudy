#!/usr/bin/env node
/* Sổ kiểm chứng điểm La Bàn: chấm điểm toàn bộ mã bằng đúng mã nguồn của app rồi ghi lại 20 mã điểm cao nhất
   và 20 mã thấp nhất cùng giá đóng cửa hôm đó, để sau này đo lợi nhuận thực tế so với chỉ số.
   node track.js --src <thư mục src> [--fund <thư mục có fund/*.json>]... --snap <thư mục có snap/*.json>... [--date yyyy-mm-dd]
   In ra JSON {US:{...}, VN:{...}}. Thư mục nêu trước được ưu tiên. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const A=process.argv.slice(2); const opt={fund:[],snap:[]};
for(let i=0;i<A.length;i+=2){ const k=A[i].replace(/^--/,''), v=A[i+1]; if(Array.isArray(opt[k])) opt[k].push(v); else opt[k]=v; }
const rd=(dirs,rel)=>{ for(const d of dirs){ const p=path.join(d,rel); if(fs.existsSync(p)){ let o=JSON.parse(fs.readFileSync(p,'utf8')); if(o&&o.data&&!o.q&&!o.rows&&!o.dates) o=o.data; return o; } } return null; };
const files=['3_data.js','3c_universe.js','3e_epsh.js','4a_core.js','4a1_cycle.js','3d_build.js','4b_views.js','4c_more.js','4d_learn.js','4h_live.js'].filter(f=>fs.existsSync(path.join(opt.src,f)));
const ctx={window:{},document:{readyState:'loading',addEventListener(){}},console,Math,JSON,location:{hash:''},history:{}};
vm.createContext(ctx);
vm.runInContext(files.map(f=>fs.readFileSync(path.join(opt.src,f),'utf8')).join('\n')+';globalThis.T={computeAll,U:()=>U,LIVE,rebuildLive,applyFundDoc,S};',ctx);
const T=ctx.T; T.S.preset='balanced';
if(!opt.date) for(const k of ['US','VN']){ const f=rd(opt.fund,'fund/'+k+'.json'); if(f) T.applyFundDoc(k,f); }   /* bản tái dựng quá khứ chỉ dùng chỉ số cơ bản nhúng sẵn */
const snaps={}, idx=rd(opt.snap,'snap/IDX.json')||{q:{}};
for(const k of ['US','VN']){
  let d=rd(opt.snap,'snap/'+k+'.json'); if(!d) continue;
  if(opt.date){ const i=d.dates.indexOf(opt.date); if(i<0){ continue; } const q={},c={};
    for(const t in d.c){ const a=d.c[t]; if(a[i]==null) continue; q[t]=[a[i], a[i-1]?(a[i]/a[i-1]-1)*100:null, d.q[t]?d.q[t][2]:null]; c[t]=a.slice(0,i+1); }
    d={d:opt.date,dates:d.dates.slice(0,i+1),q,c}; }
  snaps[k]=d; T.LIVE.snap[k]=d;
}
T.rebuildLive(); T.computeAll();
const IX={US:'IDX.SPX',VN:'IDX.VNINDEX'}; const out={};
for(const m of Object.keys(snaps)){
  const d=snaps[m].d; const L=T.U().filter(s=>s.m===m&&T.LIVE.q[s.t]&&!(T.LIVE.q[s.t].d&&T.LIVE.q[s.t].d<d)).sort((a,b)=>b._score-a._score);
  if(L.length<60) continue;
  const px=s=>+T.LIVE.q[s.t].px.toFixed(4);
  const ih=(idx.q[IX[m]]&&idx.q[IX[m]].hist)||[]; const bar=ih.find(b=>b[0]===d);
  const sc=L.map(s=>s._score).sort((a,b)=>a-b);
  /* mốc so sánh: Mỹ dùng quỹ SPY (giá đóng cửa có sẵn mỗi phiên), Việt Nam dùng VN-Index */
  let ix=null;
  if(m==='US'){
    const e=rd(opt.snap,'snap/ETF.json'); if(e&&e.c&&e.c.SPY){ const i=e.dates.indexOf(d); if(i>=0&&e.c.SPY[i]) ix=e.c.SPY[i]; }
    if(ix==null) for(let k=0;k<8&&ix==null;k++){ const h=rd(opt.snap,'hist/E-'+k+'.json'); const b=h&&h.bars&&h.bars.SPY&&h.bars.SPY.find(x=>x[0]===d); if(b) ix=b[4]; }
  }
  else { const iq=idx.q[IX[m]]; ix= bar? bar[4] : (iq&&iq.d===d&&iq.px? iq.px : null); }
  out[m]={d,v:2,bm:m==='US'?'SPY':'VNINDEX',n:L.length,med:sc[sc.length>>1],ix,top:L.slice(0,20).map(s=>[s.t,px(s),s._score]),bot:L.slice(-20).map(s=>[s.t,px(s),s._score])};
}
process.stdout.write(JSON.stringify(out));
