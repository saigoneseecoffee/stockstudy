#!/usr/bin/env node
/* Kiểm định quay lui các mô hình dự báo trên các gói lịch sử nến: node fc_eval.js <tệp 4n_forecast_core.js> <thư mục hist>... 
   In JSON {chunk: {h: {n, up, cov, m:{model:{hit,dn,ae}}}}} cho mọi gói tìm thấy (thư mục nêu trước được ưu tiên). */
const fs=require('fs'),vm=require('vm'),path=require('path');
const [core,...dirs]=process.argv.slice(2);
const ctx={Math,JSON,console}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(core,'utf8')+';globalThis.F={fcBacktest};',ctx);
const seen={}, out={};
for(const d of dirs){ const hd=fs.existsSync(path.join(d,'hist'))?path.join(d,'hist'):d; if(!fs.existsSync(hd)) continue;
  for(const f of fs.readdirSync(hd)){ if(!/^(US|VN|E)-\d+\.json$/.test(f)||seen[f]) continue; seen[f]=1;
    let o=JSON.parse(fs.readFileSync(path.join(hd,f),'utf8')); if(o.data&&!o.bars) o=o.data; const acc={};
    for(const t in (o.bars||{})){ const c=o.bars[t].map(b=>b[4]).filter(v=>v>0); const adj=o.adj&&o.adj[t]; let cc=c;
      if(adj){ const i=o.bars[t].findIndex(b=>b[0]===adj); if(i>0) cc=o.bars[t].slice(i).map(b=>b[4]).filter(v=>v>0); }
      if(cc.length>=40) ctx.F.fcBacktest(cc,acc,30); }
    out[f.replace('.json','')]={...acc,asof:o.upd||null};
  } }
process.stdout.write(JSON.stringify(out));
