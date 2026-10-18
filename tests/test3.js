const fs=require('fs'),vm=require('vm');
const files=['3_data.js','3c_universe.js','4a_core.js','3d_build.js','4b_views.js','4c_more.js','4d_learn.js','4e_chart.js','4f_patterns.js','4g_options.js','4h_live.js','4j_etf.js','4k0_lessons2.js','4k_levels.js'];
const ctx={window:{addEventListener(){}},document:{readyState:'loading',addEventListener(){}},console,Math,JSON,location:{hash:''},history:{}};
vm.createContext(ctx); vm.runInContext(files.map(f=>fs.readFileSync(f,'utf8')).join('\n')+';globalThis.T={bs,ncdf,impliedVol,analyzeStrategy,positionValue,presetLegs,OPT,OPT_PRESETS,LESSONS,QUIZ,payoffSVG};',ctx);
const T=ctx.T; let f=0; const near=(a,b,m,t=1e-3)=>{ const ok=Math.abs(a-b)<=t; if(!ok)f++; console.log(ok?'ok  ':'FAIL',m,ok?'':`${a} vs ${b}`); };
const c=T.bs('call',100,100,1,.05,.2), p=T.bs('put',100,100,1,.05,.2);
near(c.price,10.4506,'BS call textbook'); near(p.price,5.5735,'BS put textbook'); near(c.delta,.6368,'call delta'); near(p.delta,-.3632,'put delta');
near(c.gamma,.018762,'gamma',1e-5); near(c.vega,.37524,'vega per 1%',1e-4); near(c.theta*365,-6.414,'call theta annual',2e-3);
near(c.price-p.price,100-100*Math.exp(-.05),'put-call parity',1e-6);
near(T.impliedVol('call',10.4506,100,100,1,.05),.2,'implied vol inversion',1e-4);
near(T.ncdf(1.96),.975,'ncdf',1e-4);
const env={S:100,v:.3,r:.04};
let A=T.analyzeStrategy([{k:'call',side:1,K:100,qty:1,dte:30}],env); const prem=T.bs('call',100,100,30/365,.04,.3).price;
near(A.be[0],100+prem,'long call breakeven',0.02); near(A.maxL,-prem,'long call max loss',1e-6); console.log(A.maxP===Infinity?'ok   long call unlimited profit':'FAIL unlimited');
A=T.analyzeStrategy([{k:'call',side:1,K:100,qty:1,dte:30},{k:'call',side:-1,K:110,qty:1,dte:30}],env); near(A.maxP,10-A.net,'bull call max profit = width - debit',1e-6); near(A.maxL,-A.net,'bull call max loss = debit',1e-6);
A=T.analyzeStrategy([{k:'put',side:1,K:85,qty:1,dte:30},{k:'put',side:-1,K:92,qty:1,dte:30},{k:'call',side:-1,K:108,qty:1,dte:30},{k:'call',side:1,K:115,qty:1,dte:30}],env);
near(A.maxL,-(7+A.net),'condor max loss = width - credit',1e-6); console.log(A.net<0?'ok   condor is credit':'FAIL credit'); console.log(A.be.length===2?'ok   condor 2 breakevens':'FAIL be');
A=T.analyzeStrategy([{k:'stock',side:1,K:null,qty:1,dte:null},{k:'call',side:-1,K:105,qty:1,dte:30}],env); console.log(A.maxL!==-Infinity&&A.maxP<10?'ok   covered call capped':'FAIL covered',A.maxP,A.maxL);
// POP long call vs N(d2) at breakeven
A=T.analyzeStrategy([{k:'call',side:1,K:100,qty:1,dte:30}],env); const be=100+prem, Tt=30/365; const pop=1-T.ncdf((Math.log(be/100)-(.04-.045)*Tt)/(.3*Math.sqrt(Tt))); near(A.pop,pop,'POP long call',0.01);
T.OPT_PRESETS.forEach(pr=>{ const legs=T.presetLegs(pr.id); const a=T.analyzeStrategy(legs,env); if(!isFinite(a.pop)) {f++; console.log('FAIL preset',pr.id);} const svg=T.payoffSVG(legs,env,{}); if(!svg.includes('<path')){f++;console.log('FAIL svg',pr.id);} });
console.log('presets ok', T.OPT_PRESETS.length, 'lessons', T.LESSONS.length, 'quiz', T.QUIZ.length);
const ids=T.LESSONS.map(l=>l.id); if(new Set(ids).size!==ids.length){f++;console.log('FAIL dup ids');}
T.LESSONS.forEach(l=>{ if(!l.vis().includes('<svg')){f++;console.log('FAIL vis',l.id);} });
console.log(f?f+' FAILED':'ALL PASS');
