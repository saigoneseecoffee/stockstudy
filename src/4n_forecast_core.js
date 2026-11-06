/* ============================================================
   DỰ BÁO GIÁ NGẮN HẠN — các mô hình thống kê đơn giản, minh bạch, chỉ dùng chuỗi giá đóng cửa đến ngày t.
   Dùng chung cho app (dự báo từng mã) và cho kiểm định quay lui hằng ngày (pipeline/fc_eval.js).
   ============================================================ */
const FC_H=[1,3,7,21];
const FC_MODELS=['naive','trend','ma','rev','ens'];
function fcStats(c){
  const n=c.length; const r=[]; for(let i=Math.max(1,n-41);i<n;i++){ if(c[i]>0&&c[i-1]>0) r.push(Math.log(c[i]/c[i-1])); }
  if(r.length<15) return null;
  const m=r.reduce((a,b)=>a+b,0)/r.length; const sd=Math.sqrt(r.reduce((a,b)=>a+(b-m)*(b-m),0)/(r.length-1));
  const last=c[n-1]; const sma=k=>{ const s=c.slice(-k); return s.reduce((a,b)=>a+b,0)/s.length; };
  const r20=r.slice(-20), mu20=r20.reduce((a,b)=>a+b,0)/r20.length;
  return {last,sd:Math.max(sd,1e-4),mu20,ma5:sma(5),ma20:sma(Math.min(20,n)),r5:n>5&&c[n-6]>0?Math.log(last/c[n-6]):0};
}
/* trả về log-lợi nhuận kỳ vọng sau h phiên cho từng mô hình */
function fcDrift(st,model,h){
  switch(model){
    case 'naive': return 0;
    case 'trend': return st.mu20*h;                                   /* tiếp nối xu hướng 20 phiên */
    case 'ma': return Math.log(st.ma5/st.ma20)/7.5*h;                   /* MA5 so với MA20: độ dốc ngắn hạn */
    case 'rev': return -0.5*st.r5/5*Math.min(h,5);                      /* đảo chiều một nửa nhịp 5 phiên, tối đa 5 phiên */
    case 'ens': return (fcDrift(st,'trend',h)+fcDrift(st,'ma',h)+fcDrift(st,'rev',h))/3;
  }
  return 0;
}
function fcForecast(c,h,model){
  const st=fcStats(c); if(!st) return null;
  const d=fcDrift(st,model||'ens',h); const s=st.sd*Math.sqrt(h);
  const z=d/s; const pUp=0.5*(1+erf(z/Math.SQRT2));
  return {px:st.last*Math.exp(d),lo:st.last*Math.exp(d-1.2816*s),hi:st.last*Math.exp(d+1.2816*s),ret:Math.exp(d)-1,pUp,sd:st.sd};
}
function erf(x){ const t=1/(1+0.3275911*Math.abs(x)); const y=1-((((1.061405429*t-1.453152027)*t+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x); return x>=0?y:-y; }
/* kiểm định quay lui trên một chuỗi: mỗi ngày t dự báo bằng dữ liệu đến t, so với giá thật ở t+h */
function fcBacktest(c,acc,minHist){
  const n=c.length, start=Math.max(minHist||30,25);
  for(let t=start;t<n-1;t++){
    const hist=c.slice(0,t+1); const st=fcStats(hist); if(!st) continue;
    FC_H.forEach(h=>{
      if(t+h>=n||!(c[t+h]>0)) return; const actual=Math.log(c[t+h]/c[t]); const s=st.sd*Math.sqrt(h);
      const A=acc[h]||(acc[h]={n:0,up:0,cov:0,m:{}});
      A.n++; if(actual>0) A.up++;
      FC_MODELS.forEach(mo=>{ const d=fcDrift(st,mo,h); const M=A.m[mo]||(A.m[mo]={hit:0,dn:0,ae:0});
        M.ae+=Math.abs(Math.exp(d-actual)-1);
        if(mo!=='naive'&&Math.abs(actual)>1e-9&&Math.abs(d)>1e-9){ M.dn++; if((d>0)===(actual>0)) M.hit++; } });
      const de=fcDrift(st,'ens',h); if(Math.abs(actual-de)<=1.2816*s) A.cov++;
    });
  }
  return acc;
}
