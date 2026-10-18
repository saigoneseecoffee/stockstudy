const fs=require('fs'),vm=require('vm');
const files=['3_data.js','3c_universe.js','4a_core.js','3d_build.js','4b_views.js','4c_more.js','4d_learn.js','4e_chart.js','4f_patterns.js','4h_live.js'];
const code=files.map(f=>fs.readFileSync(f,'utf8')).join('\n');
const ctx={window:{addEventListener(){}},document:{readyState:'loading',addEventListener(){}},console,Math,JSON,location:{hash:''},history:{}};
vm.createContext(ctx);
vm.runInContext(code+';globalThis.T={computeAll,BY:()=>BY,sma,ema,rsi,macd,bollinger,stochastic,atr,heikinAshi,renko,lineBreak,detectPatterns,parseOHLCcsv,simulateOHLC,techSummary,ichimoku,obv,LESSONS,QUIZ,CDL,CPAT,niceTicks};',ctx);
const T=ctx.T; let fails=0; const ok=(c,m)=>{ if(!c){fails++;console.log('FAIL',m);} else console.log('ok  ',m); }; const near=(a,b,m,t=1e-6)=>ok(Math.abs(a-b)<=t,m+` (${a} vs ${b})`);
T.computeAll();
const a=[1,2,3,4,5,6,7,8,9,10];
near(T.sma(a,3)[9],9,'SMA3 last'); ok(T.sma(a,3)[1]===null,'SMA3 warmup null');
const e=T.ema(a,3); near(e[2],2,'EMA seed = SMA'); near(e[3],3,'EMA linear series');
// RSI: monotonic up -> 100
near(T.rsi(a,5)[9],100,'RSI all gains = 100');
// Wilder textbook check: alternating +1/-1 => RSI ~50
const alt=[]; let v=50; for(let i=0;i<60;i++){ v+= i%2?-1:1; alt.push(v);} near(T.rsi(alt,14)[59],50,'RSI alternating ≈ 50',3);
const m=T.macd(Array.from({length:60},(_,i)=>100)); near(m.line[59],0,'MACD flat = 0');
const bb=T.bollinger(Array(30).fill(10)); near(bb.up[29],10,'BB flat');
const rows=[{d:'a',o:10,h:12,l:9,c:11,v:1},{d:'b',o:11,h:13,l:10,c:12,v:1}];
const ha=T.heikinAshi(rows); near(ha[0].c,10.5,'HA close'); near(ha[1].o,(ha[0].o+ha[0].c)/2,'HA open');
const st=T.stochastic(Array.from({length:20},(_,i)=>({o:i,h:i+1,l:i-1,c:i+1,v:1}))); near(st.k[19],100,'Stoch close at high = 100');
// Renko
const rr=[100,101,102,103,104,103,102,101,100,99].map(c=>({c,d:'x'})); const rk=T.renko(rr,1);
ok(rk.length>0&&rk[0].up,'Renko first brick up'); ok(rk.filter(b=>!b.up).length>=1,'Renko reversal bricks');
const lb=T.lineBreak([10,11,12,13,12.5,9,8].map(c=>({c,d:'x'})),3); ok(lb.length>=4&&lb[lb.length-1].c<lb[lb.length-1].o,'Line break reversal down');
// engulfing detection: downtrend then engulfing
const dn=[]; let p=100; for(let i=0;i<15;i++){ dn.push({d:'d'+i,o:p,h:p+.3,l:p-1.3,c:p-1}); p-=1; }
dn.push({d:'e1',o:p,h:p+.2,l:p-1.6,c:p-1.5}); dn.push({d:'e2',o:p-1.7,h:p+.8,l:p-1.8,c:p+.6});
const pats=T.detectPatterns(dn); ok(pats.some(x=>x.id==='bullengulf'&&x.i===16),'Detect bullish engulfing: '+JSON.stringify(pats.slice(-2)));
// hammer
const hm=dn.slice(0,16).concat([{d:'h',o:p-2,h:p-1,l:p-5,c:p-1.2}]); ok(T.detectPatterns(hm).some(x=>x.id==='hammer'),'Detect hammer');
// CSV parse
let r=T.parseOHLCcsv('Date,Open,High,Low,Close,Volume\n'+Array.from({length:40},(_,i)=>`2026-01-${String(i%28+1).padStart(2,'0')}x`).join('\n')); ok(!!r.err,'CSV bad rows rejected');
const lines=['Ngày;Mở cửa;Cao;Thấp;Đóng cửa;Khối lượng']; for(let i=0;i<35;i++){ const d=new Date(Date.UTC(2026,0,1+i)); lines.push(`${String(d.getUTCDate()).padStart(2,'0')}/${String(d.getUTCMonth()+1).padStart(2,'0')}/2026;27.350;27.800;27.100;27.650;1.830.000`); }
r=T.parseOHLCcsv(lines.join('\n')); ok(r.rows&&r.rows.length===35&&Math.abs(r.rows[0].c-27650)<1e-9&&r.rows[0].v===1830000,'CSV VN format ; dd/mm/yyyy thousands dot: '+(r.err||r.rows&&JSON.stringify(r.rows[0])));
r=T.parseOHLCcsv('Date,Open,High,Low,Close,Adj Close,Volume\n'+Array.from({length:31},(_,i)=>`2025-03-${String(i+1).padStart(2,'0')},10,11,9,10.5,10.4,1000`).join('\n')); ok(r.rows&&r.rows.length===31&&r.rows[0].c===10.5,'CSV Yahoo format uses Close not Adj Close');
// simulation consistency
const B=T.BY(); ['FPT','NVDA','VIC','UNH'].forEach(t=>{ const s=B[t]; const sim=T.simulateOHLC(s); const n=sim.length; const ret=(sim[n-1].c/sim[n-253].c-1)*100; near(ret,s.mo,'Sim 12M return '+t,1.5);
  const maxd=Math.max(...sim.slice(1).map((x,i)=>Math.abs(x.c/sim[i].c-1))); if(s.m==='VN') ok(maxd<=0.0701,'VN daily move within ±7% '+t+' max '+(maxd*100).toFixed(2)); ok(sim.every(x=>x.h>=Math.max(x.o,x.c)&&x.l<=Math.min(x.o,x.c)),'OHLC consistent '+t); });
const ts=T.techSummary(T.simulateOHLC(B.FPT)); ok(ts.sig.length>=5,'Tech summary signals '+ts.label);
ok(T.niceTicks(93.2,131.7,5).length>=3,'nice ticks');
console.log('lessons',T.LESSONS.length,'quiz',T.QUIZ.length,'cdl',T.CDL.length,'cpat',T.CPAT.length);
const ids=T.LESSONS.map(l=>l.id); ok(new Set(ids).size===ids.length,'Unique lesson ids'); 
T.LESSONS.forEach(l=>{ try{ const s=l.vis(); if(!s.includes('<svg')) throw 0; }catch(e){ ok(false,'lesson vis '+l.id); } });
console.log(fails?fails+' FAILED':'ALL PASS');
