/* ============================================================
   HỢP ĐỒNG TƯƠNG LAI (FUTURES) — 4 bài + câu hỏi, cấp "Phái sinh & đòn bẩy"
   Đặc tả VN30F: HNX/VSDC (hệ số nhân 100.000đ/điểm, ký quỹ ban đầu tối thiểu 17%, bước giá 0,1, ±7%).
   ============================================================ */
const FUT_G='Futures';
const FUT_LESSONS=[
 {id:'fut-basics',g:FUT_G,t:'How futures differ from options',d:'Obligation versus right: linear versus asymmetric payoff',
  vis:()=>{ const X=s=>20+(s-80)/40*170, Y=v=>66-v*2.2; const fu=s=>s-100, ca=s=>Math.max(s-100,0)-4;
    let g=`<line x1="20" x2="190" y1="${Y(0)}" y2="${Y(0)}" style="stroke:var(--mut)" stroke-width=".8"/><line x1="${X(100)}" x2="${X(100)}" y1="12" y2="118" style="stroke:var(--line2)" stroke-dasharray="2 2"/>`;
    g+=`<path d="M${X(80)} ${Y(fu(80))} L${X(120)} ${Y(fu(120))}" fill="none" style="stroke:var(--us)" stroke-width="2.2"/>`;
    g+=`<path d="M${X(80)} ${Y(ca(80))} L${X(100)} ${Y(ca(100))} L${X(120)} ${Y(ca(120))}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/>`;
    g+=T(24,20,'Long future: linear gain and loss','style="font-size:7.5px;font-weight:700;fill:var(--us)"')+T(24,30,'Long call: max loss = premium','style="font-size:7.5px;font-weight:700;fill:var(--gold)"');
    g+=T(X(100),122,'Entry price / strike','text-anchor="middle" style="font-size:6.5px;fill:var(--mut)"')+T(186,Y(0)-3,'0','text-anchor="end" style="font-size:7px;fill:var(--mut)"');
    return sv(g,'Payoff chart: a long future is a straight line, a long call caps the loss at the premium'); },
  f:'P/L = (Exit price − Entry price) × Multiplier × Contracts',
  pts:['A futures contract is a standardized agreement to buy or sell an asset (an index, a commodity, a bond) at a price fixed today, settled on the expiry date. Both sides are obligated.','An option gives only the buyer a right, not an obligation; in exchange the buyer pays a premium up front.','Futures P/L is linear: whatever the price moves, you gain or lose the same, in both directions. No premium, no time decay (theta), no dependence on implied volatility (IV).','Long gains when the price rises; short gains when it falls — selling an index is as easy as buying it.','Leverage comes from margin: you post only part of the contract value, so a 1% index move can be 5% on your margin.'],
  thr:[['Directional bet, loss moves with price','Future'],['Want loss capped at the premium paid','Buy an option'],['Want to collect premium in a flat market','Sell options (high risk)']],
  hook:'<b>Memory hook:</b> a future is an <i>obligation</i>, an option is a <i>right</i>. A right costs a premium; an obligation needs margin.',src:'CME Group, Futures Fundamentals; Vietnam Securities Law 2019 and Decree 158/2020/ND-CP on derivatives.'},
 {id:'fut-margin',g:FUT_G,t:'Margin and daily P/L',d:'Mark-to-market, leverage and margin calls',
  vis:()=>{ const v=[26,27,24.5,20,26], lab=['Day 1','+10 pts','−25 pts','−45 pts','Top-up']; const Y=x=>112-x*2.9; let g='';
    g+=`<line x1="14" x2="192" y1="${Y(21)}" y2="${Y(21)}" style="stroke:var(--dn)" stroke-dasharray="3 2"/>`+T(192,21,'Margin call level','text-anchor="end" style="font-size:6.5px;fill:var(--dn)"');
    v.forEach((x,i)=>{ const bx=18+i*35; g+=`<rect x="${bx}" y="${Y(x)}" width="24" height="${112-Y(x)}" rx="3" style="fill:${x<21?'var(--dn)':i===4?'var(--gold)':'var(--us)'}"/>`+T(bx+12,Y(x)-3,String(x).replace('.','.'),'text-anchor="middle" style="font-size:7px;font-weight:700;fill:var(--fg)"')+T(bx+12,121,lab[i],'text-anchor="middle" style="font-size:6px;fill:var(--mut)"'); });
    g+=T(14,11,'Margin balance (M VND), 1 VN30F','style="font-size:7.5px;font-weight:700;fill:var(--fg)"');
    return sv(g,'The margin balance changes daily with P/L; below the threshold you must add funds'); },
  f:'Daily P/L = (Today’s settlement − Yesterday’s) × 100,000 VND × Contracts',
  pts:['Initial margin: VSDC sets a minimum of 17% of VN30F contract value; brokers usually require about 17–22%.','Example: 1 contract at 1,300 points is worth 1,300 × 100,000 VND = 130M VND; 20% margin is 26M.','At the end of each day, P/L is computed from the settlement price and credited or debited to the account at once (mark-to-market) — it does not wait for expiry.','The index falls 5% (65 points) → a loss of 6.5M, i.e. 25% of the margin. Leverage ≈ 1 ÷ margin rate = 5×.','If margin assets fall below the threshold you get a margin call; fail to top up in time and the position is force-closed, often at the worst price.','Costs: exchange and broker fees per contract, VSDC overnight position fee, and tax.'],
  thr:[['20% margin','Leverage ≈ 5×: index 1% = capital 5%'],['Keep spare margin','Survive a few bad sessions without a call']],
  hook:'<b>Memory hook:</b> with futures you don’t lose on expiry day — you lose one evening at a time.',src:'VSDC, derivatives margin and clearing rules; HNX, VN30 index futures specifications.'},
 {id:'fut-curve',g:FUT_G,t:'Basis, contango and roll cost',d:'Why futures differ from the index and why commodity ETFs decay',
  vis:()=>{ const X=i=>30+i*48, Yc=i=>70-i*12, Yb=i=>58+i*12; let g=`<line x1="22" x2="190" y1="64" y2="64" style="stroke:var(--mut)" stroke-dasharray="2 2"/>`+T(186,61,'Spot','text-anchor="end" style="font-size:6.5px;fill:var(--mut)"');
    g+=`<path d="M${[0,1,2,3].map(i=>X(i)+' '+Yc(i)).join(' L')}" fill="none" style="stroke:var(--dn)" stroke-width="2"/><path d="M${[0,1,2,3].map(i=>X(i)+' '+Yb(i)).join(' L')}" fill="none" style="stroke:var(--up)" stroke-width="2"/>`;
    [0,1,2,3].forEach(i=>{ g+=`<circle cx="${X(i)}" cy="${Yc(i)}" r="2.5" style="fill:var(--dn)"/><circle cx="${X(i)}" cy="${Yb(i)}" r="2.5" style="fill:var(--up)"/>`+T(X(i),120,['This month','Next month','Near qtr','Far qtr'][i],'text-anchor="middle" style="font-size:6.5px;fill:var(--mut)"'); });
    g+=T(X(3),Yc(3)-6,'Contango','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--dn)"')+T(X(3),Yb(3)+12,'Backwardation','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--up)"')+T(22,14,'Prices of each expiry, same asset','style="font-size:7.5px;font-weight:700;fill:var(--fg)"');
    return sv(g,'Futures curve: contango slopes up, backwardation slopes down'); },
  f:'Fair value F ≈ S × (1 + (r − q) × T) · Basis = F − S',
  pts:['A future differs from the index because of the cost of carry: interest (r) minus dividends (q) over time T. Commodities also carry storage and insurance.','Example: VN30 at 1,300, r 5%, q 2%, 1 month left → F ≈ 1,300 × (1 + 0.03 ÷ 12) ≈ 1,303.3.','Basis = F − S. As expiry nears, basis moves toward 0 because the two prices must meet at settlement.','Contango: far contracts cost more than near ones (curve slopes up). Backwardation: far contracts are cheaper, often when a commodity is scarce.','Roll cost: holding a position long-term means selling the expiring contract and buying the next. In contango each roll buys higher — which is why oil, gas and VIX ETFs can fall even when spot is flat.','VN30F sometimes trades at a discount to VN30 (negative basis), reflecting sentiment. An unusual basis is a signal to read carefully, not free money.'],
  thr:[['Positive basis','Contango — long holders pay roll cost'],['Negative basis','Backwardation or bearish sentiment'],['Expiry day','Basis goes to 0']],
  hook:'<b>Memory hook:</b> contango = “waiting costs more”; commodity ETFs holding futures pay for that wait.',src:'Hull, Options, Futures, and Other Derivatives, ch. 5; CME Group, Contango and Backwardation.'},
 {id:'fut-hedge',g:FUT_G,t:'VN30F, E-mini and portfolio hedging',d:'Vietnam and US contract specs, and how many contracts to hedge',
  vis:()=>{ const R=[['Multiplier','100,000₫/pt','$50/pt'],['Tick','0.1 pt','0.25 pt'],['Daily limit','±7%','Circuit breaker'],['Expiry','Monthly','Quarterly'],['Small size','—','Micro $5']]; let g='';
    g+=`<rect x="8" y="8" width="184" height="110" rx="8" style="fill:var(--s1);stroke:var(--line2)"/>`+T(84,24,'VN30F','text-anchor="middle" style="font-size:9px;font-weight:800;fill:var(--vn)"')+T(150,24,'E-mini S&P','text-anchor="middle" style="font-size:9px;font-weight:800;fill:var(--us)"');
    R.forEach((r,i)=>{ const y=42+i*17; g+=`<line x1="14" x2="186" y1="${y-11}" y2="${y-11}" style="stroke:var(--line)"/>`+T(16,y,r[0],'style="font-size:7px;fill:var(--mut)"')+T(84,y,r[1],'text-anchor="middle" style="font-size:7.5px;font-weight:700;fill:var(--fg)"')+T(150,y,r[2],'text-anchor="middle" style="font-size:7.5px;font-weight:700;fill:var(--fg)"'); });
    return sv(g,'Comparison of VN30F and E-mini S&P 500 futures specifications'); },
  f:'Hedge contracts = Portfolio value × Beta ÷ (Futures price × Multiplier)',
  pts:['VN30F (HNX): underlying is the VN30 index, multiplier 100,000 VND per point, tick 0.1 point, ±7% daily limit, cash-settled. Four expiries: current month, next month and the last month of the next two quarters; expiry is the third Thursday of the month.','You can open and close within the same session, unlike the underlying shares, which must wait for settlement.','E-mini S&P 500 (CME, ticker ES): $50 × index, tick 0.25 point = $12.50; Micro (MES) is $5 × index. Quarterly expiry (Mar, Jun, Sep, Dec), trading nearly around the clock Sunday to Friday.','Hedging: sell futures to offset portfolio losses in a falling market without selling your shares (you keep dividends and avoid sale tax).','Example: 1 bn VND portfolio, beta 1.1, VN30F at 1,300 → 1,000,000,000 × 1.1 ÷ (1,300 × 100,000) ≈ 8.5 → sell 8–9 contracts.','A hedge only offsets market risk; if your stocks fall more than the index you still lose the difference (basis risk). When the market rises, futures losses offset portfolio gains too.'],
  thr:[['1 VN30F at 1,300 points','≈ 130M VND notional'],['1 ES at 6,000 points','≈ $300,000 notional'],['1 MES at 6,000 points','≈ $30,000 notional']],
  hook:'<b>Memory hook:</b> hedging is buying insurance by betting against your own portfolio.',src:'HNX, VN30 index futures specifications; CME Group, E-mini and Micro E-mini S&P 500 contract specs; Hull, ch. 3.'}
];
FUT_LESSONS.forEach(l=>LESSONS.push(l));
ORDER.splice(ORDER.indexOf('Options')+1,0,FUT_G);
LESSONS.sort((a,b)=>ORDER.indexOf(a.g)-ORDER.indexOf(b.g));
/* câu hỏi được thêm vào cuối QUIZ trong 4k_levels để không xê dịch chỉ số ôn tập đã lưu */
const FUT_QUIZ=[
 {lid:'fut-basics',q:'What is the most basic difference between futures and options?',a:['A future obligates both sides; an option is a right for the buyer','Futures exist only in Vietnam','Options have no expiry date','Futures require a premium like options'],c:0,e:'An option buyer pays a premium for a right; both futures parties post margin and take P/L as price moves.'},
 {lid:'fut-margin',q:'Buy 1 VN30F at 1,300, close at 1,320. Profit before fees?',a:['2M VND','20,000 VND','200,000 VND','20M VND'],c:0,e:'20 points × 100,000 VND = 2,000,000 VND.'},
 {lid:'fut-margin',q:'A 20% margin rate means leverage of about?',a:['5×','20×','2×','1.2×'],c:0,e:'1 ÷ 0.2 = 5: a 1% index move is about 5% on your margin.'},
 {lid:'fut-margin',q:'When is futures P/L recognized?',a:['Every day (mark-to-market)','Only at expiry','Every quarter','When earnings are reported'],c:0,e:'Losses are debited at the end of each day; if margin runs short you get a margin call.'},
 {lid:'fut-curve',q:'Contango is when?',a:['Far contracts cost more than near ones','Far contracts are cheaper than near ones','The future equals spot','Futures trading is halted'],c:0,e:'Long-term long holders pay roll cost each period — why oil and VIX ETFs decay.'},
 {lid:'fut-curve',q:'On expiry day, basis (F − S) moves toward?',a:['0','The interest rate','The dividend','7%'],c:0,e:'The future and the underlying index must converge at settlement.'},
 {lid:'fut-hedge',q:'Portfolio 1 bn VND, beta 1, VN30F at 1,250. About how many contracts to sell to hedge?',a:['8','80','1','12'],c:0,e:'1,000,000,000 ÷ (1,250 × 100,000) = 8.'}
];
