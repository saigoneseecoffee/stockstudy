/* ============================================================
   HỌC THUẬT: thẻ kiến thức infographic + ôn tập Leitner
   ============================================================ */
const sv=(inner,aria)=>`<svg class="chart" viewBox="0 0 200 125" role="img" aria-label="${esc(aria)}">${inner}</svg>`;
const T=(x,y,s,o)=>`<text x="${x}" y="${y}" ${o||''}>${s}</text>`;
const TS='style="font-size:8px"', TB='class="lbl-strong" style="font-size:8.5px"';
function pathFn(f,x0,x1,X,Y,n){ let d=''; n=n||60; for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n; d+=(i?'L':'M')+X(x).toFixed(1)+' '+Y(f(x)).toFixed(1); } return d; }
const LESSONS=[
 {id:'pe',g:'Valuation',t:'P/E and earnings yield',d:'How much you pay for each dollar of profit',
  vis:()=>{ let g=''; for(let i=0;i<20;i++){ const x=12+(i%10)*18, y=30+Math.floor(i/10)*26; g+=`<rect x="${x}" y="${y}" width="15" height="20" rx="3" style="fill:var(--gold);fill-opacity:${.35+i/32}"/>`; } return sv(g+T(100,18,'Price = 20 yrs profit (P/E 20)','text-anchor="middle" '+TB)+T(100,100,'Earnings yield = 1/20 = 5%','text-anchor="middle" '+TB)+T(100,114,'vs. bond yields','text-anchor="middle" '+TS),'P/E 20 equals 20 years of earnings'); },
  f:'P/E = Price ÷ EPS<small>Earnings yield (E/P) = 1 ÷ P/E — compare directly with bond yields</small>',
  pts:['A low P/E is not necessarily cheap: earnings may be at a cyclical peak (steel, brokerages) — use a normalized P/E or the Shiller P/E (CAPE).','A high P/E is not necessarily expensive if growth is fast enough — combine it with PEG and reverse valuation.','Compare within the same industry and market; the overall US market P/E is usually higher than Vietnam’s because of interest rates, earnings quality and country risk.','Use adjusted EPS: strip out one-off gains/losses (divestments, asset revaluations).'],
  thr:[['< 10','Cheap or a value trap — check why'],['10–20','Typical range for mature companies'],['20–35','Market expects growth'],['> 35','Very high expectations, sensitive to disappointment']],
  hook:'<b>Memory tip:</b> P/E is the number of years of current earnings needed to “pay back” the price you paid.',src:'Graham & Dodd, Security Analysis (1934); Shiller, Irrational Exuberance (2000).'},
 {id:'pb',g:'Valuation',t:'P/B and fair P/B',d:'Price versus book value, the key to valuing banks',
  vis:()=>{ const X=v=>20+v/30*165, Y=v=>110-v/4*90; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/>`;
    g+=`<path d="${pathFn(r=>Math.max(0,(r-5)/(13-5)),0,30,X,Y)}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/>`;
    [['VCB',17,2.4,1],['MBB',21,1.4,1],['VPB',12,1.2,-1],['TCB',16,1.5,-1]].forEach(([n,r,p,d])=>g+=`<circle cx="${X(r)}" cy="${Y(p)}" r="3.5" style="fill:var(--us)"/>`+T(X(r)+5*d,Y(p)+3,n,(d<0?'text-anchor="end" ':'')+TS));
    return sv(g+T(105,122,'ROE (%) →','text-anchor="middle" '+TS)+T(24,22,'P/B','style="font-size:8px"')+T(150,38,'Fair P/B','style="font-size:8px;fill:var(--gold)"'),'Fair P/B line by ROE'); },
  f:'Fair P/B ≈ (ROE − g) ÷ (r − g)<small>r: cost of equity, g: long-term growth (Gordon model)</small>',
  pts:['A company earning an ROE exactly equal to its cost of capital deserves P/B = 1; every point of ROE above r raises the fair P/B.','Banks: compare P/B with sustainable ROE, asset quality (NPL, group-2 debt), CASA and CAR.','Book value can be inflated (low-quality assets) or understated (brands, land carried at historical cost).','Stocks sitting below the fair P/B line in the chart may be undervalued — if their ROE is sustainable.'],
  thr:[['ROE 20%, r 13%, g 5%','Fair P/B ≈ 1.9x'],['ROE 13% = r','Fair P/B ≈ 1.0x'],['ROE 8% < r','Fair P/B < 1x — destroys value']],
  hook:'<b>Memory tip:</b> how many times book you pay depends on how much each unit of capital earns compared with what it costs.',src:'Gordon (1959); Damodaran, Investment Valuation (3rd ed., 2012).'},
 {id:'ev',g:'Valuation',t:'EV/EBITDA',d:'Values the whole business, neutral to capital structure',
  vis:()=>sv(`<rect x="20" y="25" width="60" height="70" rx="4" style="fill:var(--gold);fill-opacity:.75"/>${T(50,64,'Mkt cap','text-anchor="middle" '+TB)}<rect x="20" y="95" width="60" height="20" rx="3" style="fill:var(--dn);fill-opacity:.7"/>${T(50,108,'+ Debt','text-anchor="middle" style="font-size:8px;fill:#fff"')}<rect x="88" y="25" width="34" height="16" rx="3" style="fill:var(--up);fill-opacity:.7"/>${T(105,36,'− Cash','text-anchor="middle" style="font-size:8px;fill:#fff"')}<path d="M128 70 h12" style="stroke:var(--mut)" stroke-width="1.5"/><rect x="146" y="40" width="40" height="75" rx="4" style="fill:var(--us);fill-opacity:.7"/>${T(166,80,'EV','text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff"')}${T(100,15,'Enterprise value (EV) = Mkt cap + Debt − Cash','text-anchor="middle" '+TS)}`,'Bridge from market cap to EV'),
  f:'EV/EBITDA = (Market cap + Debt − Cash) ÷ EBITDA',
  pts:['Lets you compare heavily and lightly indebted companies; common in M&A valuation.','Not for banks, brokerages or insurers (debt is their raw material).','EBITDA ignores capex: for capital-intensive industries (steel, power, telecom) also look at EV/EBIT or EV/FCF.','The inverse, EBIT/EV, is the “earnings yield” in Greenblatt’s Magic Formula.'],
  thr:[['< 6x','Cheap, often in cyclical industries'],['6–12x','Average'],['> 15x','Growth or high quality']],
  hook:'<b>Memory tip:</b> EV is the price to buy the entire company — pay off all the debt, keep the cash.',src:'Koller, Goedhart & Wessels, Valuation (McKinsey, 7th ed., 2020).'},
 {id:'peg',g:'Valuation',t:'Peter Lynch’s PEG',d:'Putting P/E next to the growth rate',
  vis:()=>{ const X=v=>20+v/40*165, Y=v=>110-v/60*92; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/><path d="M${X(0)} ${Y(0)} L${X(40)} ${Y(40)}" style="stroke:var(--gold)" stroke-width="2" stroke-dasharray="4 3"/>`;
    g+=`<path d="M${X(0)} ${Y(0)} L${X(40)} ${Y(40)} L${X(40)} ${Y(0)}Z" style="fill:var(--up);fill-opacity:.1"/>`;
    [[10,30],[25,20],[15,15],[35,55],[8,18]].forEach(([x,y])=>g+=`<circle cx="${X(x)}" cy="${Y(y)}" r="4" style="fill:${y<x?'var(--up)':'var(--dn)'}"/>`);
    return sv(g+T(150,100,'PEG < 1','style="font-size:9px;fill:var(--up);font-weight:700"')+T(30,30,'PEG > 1','style="font-size:9px;fill:var(--dn);font-weight:700"')+T(105,122,'EPS growth (%) →','text-anchor="middle" '+TS)+T(24,22,'P/E',TS),'PEG: the line where P/E equals growth'); },
  f:'PEG = P/E ÷ EPS growth (%/year)',
  pts:['PEG < 1: the price may not yet reflect all the growth; PEG > 2: very high expectations.','Use sustainable 3–5 year growth, not a single rebound year from a low base (which easily produces a misleadingly low PEG).','Lynch adds the dividend yield for high-dividend companies: (g + dividend yield) ÷ P/E.','Does not apply to loss-making companies or negative growth.'],
  thr:[['< 0.5','Very attractive if the growth is real'],['0.5–1','Reasonable, the GARP zone'],['1–2','Fully priced'],['> 2','Expensive relative to growth']],
  hook:'<b>Memory tip:</b> a fairly priced stock has a P/E roughly equal to its growth rate.',src:'Peter Lynch, One Up on Wall Street (1989).'},
 {id:'fcf',g:'Valuation',t:'Free cash flow (FCF)',d:'Real cash left after maintaining and expanding the business',
  vis:()=>{ const bars=[['CFO',100,0,'var(--up)'],['Capex',-38,100,'var(--dn)'],['FCF',62,0,'var(--gold)']]; const Y=v=>110-v*.85; let g=`<line class="axis" x1="10" y1="110" x2="190" y2="110"/>`;
    bars.forEach(([n,v,base,c],i)=>{ const x=22+i*58, y0=Y(base), y1=Y(base+v); g+=`<rect x="${x}" y="${Math.min(y0,y1)}" width="40" height="${Math.abs(y1-y0)}" rx="3" style="fill:${c};fill-opacity:.8"/>`+T(x+20,Math.min(y0,y1)-4,(v>0?'':'')+v,'text-anchor="middle" '+TB)+T(x+20,121,n,'text-anchor="middle" '+TS); });
    return sv(g,'Cash flow waterfall: CFO minus capex gives FCF'); },
  f:'FCF = Operating cash flow − Capital expenditure<small>FCF yield = FCF ÷ Market cap</small>',
  pts:['Profit is an opinion, cash is a fact: compare CFO with net income over many years.','Persistently negative FCF is only acceptable when the capex earns a high ROIC (an investment phase such as HPG Dung Quat 2).','An FCF yield above the government bond yield is a sign of an attractive price.','FCF funds dividends, buybacks, debt repayment or M&A — look at how the company allocates it.'],
  thr:[['> 6%','Attractive'],['3–6%','Reasonable'],['< 2%','High growth expectations'],['Negative','Investing heavily or inefficient']],
  hook:'<b>Memory tip:</b> “Revenue is vanity, profit is sanity, cash is reality.”',src:'Damodaran, Investment Valuation (2012); CFA Institute, Equity Valuation curriculum.'},
 {id:'dcf',g:'Valuation',t:'Discounted cash flow (DCF)',d:'Value = future cash brought back to today',
  vis:()=>{ let g=''; for(let i=0;i<8;i++){ const cf=20*Math.pow(1.08,i), pv=cf/Math.pow(1.12,i+1); const x=14+i*20; g+=`<rect x="${x}" y="${100-cf*2}" width="14" height="${cf*2}" rx="2" style="fill:var(--line2)"/><rect x="${x}" y="${100-pv*2}" width="14" height="${pv*2}" rx="2" style="fill:var(--us);fill-opacity:.85"/>`; }
    g+=`<rect x="176" y="22" width="16" height="78" rx="2" style="fill:var(--gold);fill-opacity:.85"/>`+T(184,116,'TV','text-anchor="middle" '+TS)+T(80,116,'Year 1 → 8','text-anchor="middle" '+TS)+T(14,14,'Gray: nominal cash flow · Blue: present value',TS);
    return sv(g,'Nominal cash flows and present values'); },
  f:'V = Σ CFₜ ÷ (1 + r)ᵗ + TV ÷ (1 + r)ᴺ<small>TV = CFₙ₊₁ ÷ (r − g) — terminal value (Gordon)</small>',
  pts:['Three assumptions drive everything: growth, the cost of capital r and long-term growth g.','Terminal value is often 60–80% of the result — always check the sensitivity.','Long-term g should not exceed long-run nominal GDP growth (US ~2–3%, Vietnam ~4–6%).','Use the “DCF lab” on the stock detail page to drag each assumption.'],
  thr:[['Small r − g','Inflated value, very sensitive'],['TV > 75% of total','Result hinges on long-term assumptions'],['Margin of safety','Buy when price is 20–30% below value']],
  hook:'<b>Memory tip:</b> a dollar next year is worth less than a dollar today — discounting is the price of time and risk.',src:'Williams, The Theory of Investment Value (1938); Damodaran (2012).'},
 {id:'rdcf',g:'Valuation',t:'Reverse valuation',d:'How much growth is today’s price “demanding”?',
  vis:()=>{ const X=v=>20+v/30*165, Y=v=>110-v/250*95; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/>`;
    g+=`<path d="${pathFn(x=>40*Math.pow(1.065,x),0,30,X,Y)}" fill="none" style="stroke:var(--us)" stroke-width="2.2"/><line x1="20" x2="190" y1="${Y(100)}" y2="${Y(100)}" style="stroke:var(--gold)" stroke-dasharray="4 3" stroke-width="1.5"/>`;
    const gx=Math.log(100/40)/Math.log(1.065); g+=`<circle cx="${X(gx)}" cy="${Y(100)}" r="4.5" style="fill:var(--gold)"/><line x1="${X(gx)}" x2="${X(gx)}" y1="${Y(100)}" y2="110" style="stroke:var(--gold)" stroke-dasharray="2 2"/>`;
    return sv(g+T(26,Y(100)-5,'Current price','style="font-size:8px;fill:var(--gold)"')+T(X(gx),121,'implied g ≈ '+fmt(gx,0)+'%','text-anchor="middle" '+TB)+T(150,30,'DCF value','style="font-size:8px;fill:var(--us)"'),'Where DCF value meets price gives the implied growth'); },
  f:'Find g such that DCF(g) = Current price',
  pts:['Instead of forecasting, ask the reverse: what is the market betting on?','If implied g is well above what the industry can realistically deliver → risk of disappointment.','If implied g is below a conservative forecast → margin of safety.','A method popularized by Mauboussin & Rappaport in “Expectations Investing”.'],
  thr:[['Implied g < expected − 4 pts','Possibly undervalued'],['Within ±4 pts','Fairly priced'],['Implied g > expected + 4 pts','Expectations too high']],
  hook:'<b>Memory tip:</b> don’t ask “what is it worth”, ask “what must happen to justify this price”.',src:'Rappaport & Mauboussin, Expectations Investing (2001; rev. 2021).'},
 {id:'graham',g:'Valuation',t:'Graham formula and Graham number',d:'Two classic defensive tests',
  vis:()=>{ let g=''; for(let i=0;i<15;i++) for(let j=0;j<3;j++) g+=`<rect x="${14+i*11.5}" y="${30+j*14}" width="10" height="12" rx="1.5" style="fill:var(--gold);fill-opacity:${j<2?.8:.35}"/>`;
    return sv(g+T(100,20,'Max P/E 15 × max P/B 1.5 = 22.5','text-anchor="middle" '+TB)+T(100,90,'Graham no. = √(22.5 × EPS × BVPS)','text-anchor="middle" '+TB)+T(100,106,'V = EPS × (8.5 + 2g) × 4.4 ÷ Y','text-anchor="middle" style="font-size:8.5px;fill:var(--gold);font-weight:700"'),'A 15 by 1.5 grid equals 22.5'); },
  f:'V = EPS × (8.5 + 2g) × 4.4 ÷ Y<small>8.5: P/E of a no-growth company · g: 7–10 year growth · Y: current AAA bond yield</small>',
  pts:['The app caps g at 15% to avoid overstatement — Graham always favored caution.','The Graham number only suits companies with tangible assets; intangible-heavy businesses (software) usually “fail” it even when high quality.','Margin of safety: buy when the price is far enough below estimated value to absorb errors.','Defensive criteria also include: large size, current ratio > 2, uninterrupted dividends, no EPS losses in 10 years.'],
  thr:[['P/E × P/B < 22.5','Meets the Graham standard'],['Price < 2/3 of value','Wide margin of safety']],
  hook:'<b>Memory tip:</b> 15 and 1.5 — multiply them to get 22.5.',src:'Benjamin Graham, The Intelligent Investor (rev. 1973), ch. 11 & 14.'},
 {id:'dupont',g:'Quality',t:'DuPont analysis',d:'Does ROE come from margin, efficiency or leverage?',interactive:'dupont',
  vis:()=>sv(`<rect x="70" y="8" width="60" height="24" rx="5" style="fill:var(--gold)"/>${T(100,24,'ROE','text-anchor="middle" style="font-size:10px;font-weight:800;fill:var(--gold-ink)"')}<path d="M100 32 V44 M33 44 H167 M33 44 V56 M100 44 V56 M167 44 V56" fill="none" style="stroke:var(--line2)" stroke-width="1.5"/>${[['Net margin','NI/Rev',33],['Asset turn','Rev/Assets',100],['Leverage','Assets/Eq',167]].map(([a,b,x])=>`<rect x="${x-30}" y="56" width="60" height="34" rx="5" style="fill:var(--s1);stroke:var(--line2)"/>${T(x,71,a,'text-anchor="middle" '+TB)}${T(x,83,b,'text-anchor="middle" '+TS)}`).join('')}${T(66,74,'×','text-anchor="middle" style="font-size:12px;fill:var(--gold)"')}${T(134,74,'×','text-anchor="middle" style="font-size:12px;fill:var(--gold)"')}${T(100,112,'Same ROE: quality, or just debt?','text-anchor="middle" '+TS)}`,'Three-branch DuPont tree'),
  f:'ROE = Net margin × Asset turnover × Leverage',
  pts:['High margin + moderate turnover: the economic-moat model (Visa, software).','Thin margin + very high turnover: efficient retail (Costco, MWG).','High ROE from heavy leverage: vulnerable when rates rise — compare ROE with ROIC.','Leverage of 8–12x is normal for banks; not for manufacturers.'],
  thr:[['ROE ≈ ROIC','Little reliance on debt'],['ROE ≫ ROIC','High leverage or negative equity (buybacks)']],
  hook:'<b>Memory tip:</b> “Earn – Turn – Borrow”: the three levers of ROE.',src:'DuPont method (F. Donaldson Brown, 1920s); CFA Institute, Financial Reporting & Analysis.'},
 {id:'roic',g:'Quality',t:'ROIC versus WACC',d:'The one true measure of value creation',
  vis:()=>{ const data=[['A',28,10],['B',14,11],['C',7,12]]; let g=`<line class="axis" x1="10" y1="105" x2="190" y2="105"/>`;
    data.forEach(([n,ro,wa],i)=>{ const x=22+i*60; g+=`<rect x="${x}" y="${105-ro*3}" width="20" height="${ro*3}" rx="2" style="fill:var(--gold)"/><rect x="${x+22}" y="${105-wa*3}" width="20" height="${wa*3}" rx="2" style="fill:var(--mut);fill-opacity:.6"/>`+T(x+21,117,ro>wa?'Adds value':'Erodes value','text-anchor="middle" style="font-size:8px;fill:'+(ro>wa?'var(--up)':'var(--dn)')+';font-weight:700"'); });
    return sv(g+T(10,12,'Gold: ROIC · Gray: WACC',TS),'ROIC versus WACC for three companies'); },
  f:'Economic value created = (ROIC − WACC) × Invested capital<small>ROIC = NOPAT ÷ (Equity + Debt − Cash)</small>',
  pts:['Growth only creates value when ROIC > WACC; growth with ROIC < WACC destroys value.','A high, stable ROIC over many years is the clearest sign of an economic moat.','The ROIC − WACC spread narrows over time due to competition (mean reversion).','Greenblatt’s Magic Formula uses ROIC as its measure of a “good business”.'],
  thr:[['ROIC > 20%','Excellent'],['12–20%','Good'],['≈ WACC','Neutral'],['< WACC','Destroys value']],
  hook:'<b>Memory tip:</b> a good business is a machine that turns 1 unit of capital into more than 1 unit of value.',src:'Koller et al., Valuation (McKinsey, 2020); Stern Stewart, EVA.'},
 {id:'moat',g:'Quality',t:'Five types of economic moat',d:'Where a durably high ROIC comes from',
  vis:()=>{ const items=[['Network','Visa, Meta'],['Switching cost','Microsoft, FPT'],['Cost advantage','Costco, HPG'],['Intangibles','KO, VNM'],['Efficient scale','GAS, GMD']]; let g='';
    items.forEach(([a,b],i)=>{ const x=6+(i%3)*65, y=8+Math.floor(i/3)*58; g+=`<rect x="${x}" y="${y}" width="60" height="50" rx="7" style="fill:var(--s1);stroke:var(--gold)"/><circle cx="${x+30}" cy="${y+16}" r="8" style="fill:var(--gold);fill-opacity:.3;stroke:var(--gold)"/>`+T(x+30,y+19,i+1,'text-anchor="middle" style="font-size:8px;font-weight:800;fill:var(--fg)"')+T(x+30,y+35,a,'text-anchor="middle" style="font-size:7.5px;font-weight:700;fill:var(--fg)"')+T(x+30,y+45,b,'text-anchor="middle" style="font-size:7px"'); });
    return sv(g,'Five types of competitive advantage'); },
  f:'Economic moat = the ability to keep ROIC > WACC for many years',
  pts:['Network effects: each new user makes the product more valuable to existing ones.','Switching costs: customers hesitate to switch because of time, risk and data.','Cost advantage: processes, location or scale allow lower prices than rivals while still profitable.','Intangible assets: brands, patents, licenses.','Efficient scale: the market only has room for a few players (ports, gas pipelines).'],
  thr:[['Quantitative signs','High ROIC for 5–10 years, stable gross margin, market share held']],
  hook:'<b>Memory tip:</b> “Network – Switch – Cost – Brand – Scale”.',src:'Pat Dorsey, The Little Book That Builds Wealth (2008); Morningstar Economic Moat methodology.'},
 {id:'margin',g:'Quality',t:'Profit margin waterfall',d:'Where each unit of revenue leaks away',
  vis:()=>{ const st=[['Revenue',100,'var(--us)'],['Gross',45,'var(--gold)'],['Operating',25,'var(--gold)'],['Net',18,'var(--up)']]; let g='';
    st.forEach(([n,v,c],i)=>{ const y=10+i*28, w=v*1.6; g+=`<rect x="${100-w/2}" y="${y}" width="${w}" height="22" rx="4" style="fill:${c};fill-opacity:.8"/>`+T(100,y+15,n+' '+v+'%','text-anchor="middle" style="font-size:8.5px;font-weight:700;fill:var(--fg)"'); });
    return sv(g,'Profit margin funnel'); },
  f:'Gross margin → Operating margin → Net margin',
  pts:['Gross margin reflects pricing power and leverage over suppliers.','The gap between gross and operating margin is selling, admin and R&D expense.','Net margin is affected by interest and tax — when comparing companies with different capital structures, use operating margin.','The margin trend matters more than its level: expanding margins are a good sign (Piotroski test 8).'],
  thr:[['Gross margin > 50%','Often has an economic moat'],['Gross margin < 15%','Commodities, retail, distribution']],
  hook:'<b>Memory tip:</b> look at gross margin to see strength, operating margin to see discipline.',src:'CFA Institute, Financial Statement Analysis.'},
 {id:'piotroski',g:'Quality',t:'Piotroski F-Score',d:'9 binary tests of accounting health',
  vis:()=>{ let g=''; const ok=[1,1,1,1,0,1,1,1,0]; const grp=['Profitability','Profitability','Profitability','Profitability','Leverage','Leverage','Leverage','Efficiency','Efficiency'];
    ok.forEach((v,i)=>{ const x=40+(i%3)*42, y=10+Math.floor(i/3)*36; g+=`<rect x="${x}" y="${y}" width="36" height="30" rx="5" style="fill:${v?'var(--up)':'var(--dn)'};fill-opacity:${v?.75:.35}"/>`+T(x+18,y+19,v?'✓':'✗','text-anchor="middle" style="font-size:12px;fill:#fff;font-weight:800"'); });
    return sv(g+T(100,122,'7/9 → good health','text-anchor="middle" '+TB),'Grid of 9 Piotroski tests'); },
  f:'F-Score = sum of 9 tests (each 0 or 1)',
  pts:['Profitability (4): positive ROA, positive CFO, rising ROA, CFO > net income (low accruals).','Leverage, liquidity, funding (3): falling long-term debt, rising current ratio, no new shares issued.','Efficiency (2): rising gross margin, rising asset turnover.','Original study: among low P/B stocks, buying F ≥ 8 and selling F ≤ 1 produced a significant return spread (US data 1976–1996).'],
  thr:[['8–9','Very strong'],['5–7','Fairly good'],['0–3','Weak — warning']],
  hook:'<b>Memory tip:</b> 4 – 3 – 2: four profitability, three funding, two efficiency.',src:'Piotroski, J. (2000), “Value Investing: The Use of Historical Financial Statement Information…”, Journal of Accounting Research 38.'},
 {id:'altman',g:'Quality',t:'Altman Z-Score',d:'Predicting the risk of financial distress',
  vis:()=>{ const X=v=>14+v/5*172; return sv(`<rect x="${X(0)}" y="45" width="${X(1.81)-X(0)}" height="22" rx="4" style="fill:var(--dn);fill-opacity:.75"/><rect x="${X(1.81)}" y="45" width="${X(2.99)-X(1.81)}" height="22" style="fill:var(--ref);fill-opacity:.75"/><rect x="${X(2.99)}" y="45" width="${X(5)-X(2.99)}" height="22" rx="4" style="fill:var(--up);fill-opacity:.75"/>${T(X(.9),83,'Distress','text-anchor="middle" '+TS)}${T(X(2.4),83,'Grey zone','text-anchor="middle" '+TS)}${T(X(4),83,'Safe','text-anchor="middle" '+TS)}${T(X(1.81),40,'1.81','text-anchor="middle" '+TB)}${T(X(2.99),40,'2.99','text-anchor="middle" '+TB)}${T(100,20,'Z = 1.2A + 1.4B + 3.3C + 0.6D + 1.0E','text-anchor="middle" style="font-size:9px;font-weight:700;fill:var(--gold)"')}${T(100,108,'A work. capital · B ret. earnings · C EBIT (÷ assets)','text-anchor="middle" '+TS)}${T(100,119,'D mkt cap ÷ liabilities · E sales ÷ assets','text-anchor="middle" '+TS)}`,'Three Altman Z zones'); },
  f:'Z = 1.2·A + 1.4·B + 3.3·C + 0.6·D + 1.0·E',
  pts:['The original model is for listed manufacturers; the Z\'\' variant covers non-manufacturers and emerging markets.','Does not apply to banks, insurers or brokerages.','EBIT/Total assets (C) has the largest weight: return on assets is the key to survival.','Use it as an early-warning system, together with cash flow and the debt maturity schedule.'],
  thr:[['> 2.99','Safe'],['1.81–2.99','Grey zone'],['< 1.81','Distress risk']],
  hook:'<b>Memory tip:</b> below 1.8 is an alarm — remember “1-8, be wary”.',src:'Altman, E. (1968), “Financial Ratios, Discriminant Analysis and the Prediction of Corporate Bankruptcy”, Journal of Finance 23(4).'},
 {id:'bank',g:'Quality',t:'Bank analysis',d:'Four ratios that replace the usual P/E',
  vis:()=>{ const it=[['NIM','Net int. margin','> 3.5%'],['NPL','Bad debt','< 1.5%'],['CASA','Demand deposits','> 30%'],['CAR','Capital adequacy','> 12%']]; let g='';
    it.forEach(([a,b,c],i)=>{ const x=8+(i%2)*96, y=8+Math.floor(i/2)*58; g+=`<rect x="${x}" y="${y}" width="88" height="50" rx="7" style="fill:var(--s1);stroke:var(--line2)"/>`+T(x+10,y+20,a,'style="font-size:12px;font-weight:800;fill:var(--gold);font-family:var(--f-disp)"')+T(x+10,y+33,b,TS)+T(x+10,y+44,'Good: '+c,'style="font-size:8px;fill:var(--up);font-weight:700"'); });
    return sv(g,'Four bank ratios'); },
  f:'Fair P/B ≈ (ROE − g) ÷ (r − g)',
  pts:['NIM: the spread between lending and deposit rates over interest-earning assets — high CASA helps NIM.','NPL and group-2 debt: asset quality; also check the loan-loss coverage ratio (LLR).','CAR (Basel II in Vietnam) or CET1 (US): the capital buffer to absorb losses.','In Vietnam, credit growth depends on quotas set by the State Bank (SBV); many banks pay stock dividends to raise capital.'],
  thr:[['ROE > 18%, NPL < 1.5%','High-quality bank profile'],['NPL > 3%','Asset-quality warning']],
  hook:'<b>Memory tip:</b> “Spread – Bad – Cheap – Capital”: NIM, NPL, CASA, CAR.',src:'Basel Committee (BIS); Circular 41/2016/TT-NHNN; FDIC CAMELS framework.'},
 {id:'divers',g:'Portfolio & risk',t:'Diversification',d:'Which risk disappears, which risk stays',
  vis:()=>{ const X=v=>20+v/30*165, Y=v=>110-v/60*92; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/>`;
    g+=`<rect x="20" y="${Y(20)}" width="170" height="${110-Y(20)}" style="fill:var(--dn);fill-opacity:.12"/><path d="${pathFn(n=>20+40/n,1,30,X,Y)}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/>`;
    return sv(g+T(120,Y(20)+14,'Systematic risk (non-diversifiable)','text-anchor="middle" style="font-size:8px;fill:var(--dn)"')+T(80,40,'Specific risk falls','style="font-size:8px;fill:var(--gold)"')+T(105,122,'Number of stocks →','text-anchor="middle" '+TS),'Portfolio risk falls as the number of stocks grows'); },
  f:'σ²ₚ = Σ wᵢ²σᵢ² + Σ Σ wᵢwⱼσᵢσⱼρᵢⱼ',
  pts:['About 20–30 weakly correlated stocks remove most stock-specific risk.','Diversifying across industries and markets (US + Vietnam) works better than adding more stocks in the same industry.','In a crisis, correlations spike — diversification works worst exactly when you need it most.','“Effective number of stocks” = 1 ÷ Σw² (HHI) measures true diversification by weight.'],
  thr:[['1/HHI < 5','Highly concentrated'],['5–15','Moderate'],['> 15','Well diversified']],
  hook:'<b>Memory tip:</b> diversification is the only “free lunch” in finance.',src:'Markowitz (1952); Statman, “How Many Stocks Make a Diversified Portfolio?”, JFQA (1987).'},
 {id:'frontier',g:'Portfolio & risk',t:'Markowitz efficient frontier',d:'Maximum return for each level of risk',
  vis:()=>{ const X=v=>20+v/30*165, Y=v=>110-v/20*92; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/>`;
    g+=`<path d="${pathFn(s=>4+Math.sqrt(Math.max(0,(s-8)*9)),8,30,X,Y)}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/>`;
    [[14,6],[18,8],[22,9],[25,11],[16,9],[27,14],[12,5]].forEach(([s,r])=>g+=`<circle cx="${X(s)}" cy="${Y(r)}" r="3" style="fill:var(--mut)"/>`);
    g+=`<line x1="${X(0)}" y1="${Y(4)}" x2="${X(26)}" y2="${Y(19)}" style="stroke:var(--us)" stroke-width="1.5" stroke-dasharray="4 3"/><circle cx="${X(13)}" cy="${Y(10.7)}" r="4.5" style="fill:var(--us)"/>`;
    return sv(g+T(105,122,'Risk (std. deviation) →','text-anchor="middle" '+TS)+T(24,22,'Return',TS)+T(X(13)+6,Y(10.7)+12,'Tangency portfolio','style="font-size:8px;fill:var(--us)"'),'Efficient frontier and capital market line'); },
  f:'Sharpe = (Rₚ − R_f) ÷ σₚ',
  pts:['Every portfolio below the curve is “inefficient”: there is a way to earn more for the same risk.','The straight line from the risk-free rate touches the frontier at the portfolio with the highest Sharpe ratio.','The inputs (expected returns, correlations) are very hard to estimate — optimal results easily become extreme; in practice, weight limits are used.','The foundation of modern portfolio theory, Nobel Prize 1990.'],
  thr:[['Sharpe > 1','Very good'],['0.5–1','Decent'],['< 0.3','Poor']],
  hook:'<b>Memory tip:</b> there is no “best stock”, only the “most efficient portfolio” for your risk appetite.',src:'Markowitz, H. (1952), “Portfolio Selection”, Journal of Finance 7(1); Sharpe (1966).'},
 {id:'capm',g:'Portfolio & risk',t:'CAPM and Beta',d:'Cost of equity based on systematic risk',
  vis:()=>{ const X=v=>20+v/2*165, Y=v=>110-v/24*92; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/><path d="M${X(0)} ${Y(4)} L${X(2)} ${Y(20)}" style="stroke:var(--gold)" stroke-width="2.2"/>`;
    g+=`<circle cx="${X(1.2)}" cy="${Y(14)}" r="4" style="fill:var(--up)"/>`+T(X(1.2)+6,Y(14),'alpha > 0','style="font-size:8px;fill:var(--up)"')+`<circle cx="${X(1.5)}" cy="${Y(12)}" r="4" style="fill:var(--dn)"/>`+T(X(1.5)+6,Y(12)+8,'alpha < 0','style="font-size:8px;fill:var(--dn)"');
    return sv(g+T(105,122,'Beta →','text-anchor="middle" '+TS)+T(X(1),117,'1','text-anchor="middle" '+TS)+T(24,22,'Expected return',TS)+T(140,40,'SML line','style="font-size:8px;fill:var(--gold)"'),'Security market line (SML)'); },
  f:'r = R_f + β × (R_m − R_f)',
  pts:['Beta > 1: amplifies market swings; < 1: defensive.','The equity risk premium for Vietnam is usually assumed higher than for the US (country risk, liquidity).','The app uses CAPM to compute the cost of capital in DCF; you can change the assumptions in Settings.','Beta is estimated from history, changes over time and depends on the reference index.'],
  thr:[['β < 0.7','Defensive'],['0.7–1.3','Neutral'],['> 1.3','Aggressive, cyclical']],
  hook:'<b>Memory tip:</b> only risk you cannot diversify away gets rewarded.',src:'Sharpe, W. (1964), Journal of Finance 19(3); Damodaran, Country Risk Premiums (updated annually).'},
 {id:'sizing',g:'Portfolio & risk',t:'Position sizing and Kelly',d:'How much is enough for one idea',
  vis:()=>{ const X=v=>20+v/.4*165, Y=v=>100-v/0.03*70; let g=`<line class="axis" x1="20" y1="100" x2="190" y2="100"/><line class="axis" x1="20" y1="15" x2="20" y2="115"/>`;
    const p=.55,b=1.5, G=f=>p*Math.log(1+b*f)+(1-p)*Math.log(1-f); const ks=p-(1-p)/b;
    g+=`<path d="${pathFn(G,0,.4,X,Y)}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/><line x1="${X(ks)}" x2="${X(ks)}" y1="15" y2="100" style="stroke:var(--up)" stroke-dasharray="3 3"/><line x1="${X(ks/2)}" x2="${X(ks/2)}" y1="15" y2="100" style="stroke:var(--us)" stroke-dasharray="3 3"/>`;
    return sv(g+T(X(ks)+3,24,'Kelly '+fmt(ks*100,0)+'%','style="font-size:8px;fill:var(--up)"')+T(X(ks/2)+3,36,'½ Kelly','style="font-size:8px;fill:var(--us)"')+T(105,122,'Size per trade →','text-anchor="middle" '+TS)+T(24,12,'Log capital growth',TS),'Capital growth curve by Kelly fraction'); },
  f:'f* = p − (1 − p) ÷ b<small>Risk-based sizing: shares = (Capital × %risk) ÷ (Entry price − Stop price)</small>',
  pts:['Going above Kelly increases volatility while lowering long-term growth; double Kelly gives growth close to 0.','Professional investors often use ½ or ¼ Kelly because estimated probabilities always carry error.','The 1–2% of capital at risk per trade rule helps you survive losing streaks.','The calculator is in Expert → Tools.'],
  thr:[['0.5–1% risk/trade','Conservative'],['2%','Aggressive'],['> 5%','Dangerous']],
  hook:'<b>Memory tip:</b> deciding how much matters as much as deciding what to buy.',src:'Kelly, J. L. (1956), Bell System Technical Journal 35; Thorp, “The Kelly Criterion in Blackjack, Sports Betting and the Stock Market” (2006).'},
 {id:'drawdown',g:'Portfolio & risk',t:'The asymmetry of losses',d:'A 50% drop needs a 100% gain to break even',
  vis:()=>{ const X=v=>20+v/80*165, Y=v=>110-v/400*95; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/><path d="${pathFn(d=>(1/(1-d/100)-1)*100,0,80,X,Y)}" fill="none" style="stroke:var(--dn)" stroke-width="2.2"/>`;
    [[20,25],[50,100],[75,300]].forEach(([d,u])=>g+=`<circle cx="${X(d)}" cy="${Y(u)}" r="3.5" style="fill:var(--gold)"/>`+T(X(d)-4,Y(u)-6,'−'+d+'% → +'+u+'%','text-anchor="end" style="font-size:8px;font-weight:700;fill:var(--fg)"'));
    return sv(g+T(105,122,'Drawdown →','text-anchor="middle" '+TS),'Required recovery curve'); },
  f:'Gain needed = 1 ÷ (1 − loss) − 1',
  pts:['A 10% loss needs 11%, 33% needs 50%, 50% needs 100%, 75% needs 300%.','Preserving capital and cutting losses early has mathematical value, not just psychological.','Always report maximum drawdown alongside returns when evaluating a strategy.'],
  thr:[['Max drawdown < 20%','Defensive portfolio'],['30–50%','Typical stock portfolio in a crisis']],
  hook:'<b>Memory tip:</b> “Lose half, and you need to double to get it back.”',src:'Basic compounding math; Magdon-Ismail & Atiya (2004) on max drawdown.'},
 {id:'cycle',g:'Behavior & cycles',t:'Cycles and sector rotation',d:'Leading sectors change with the economic phase',
  vis:()=>{ const X=v=>10+v/360*180, Y=v=>62-Math.sin(v*Math.PI/180)*38; let g=`<path d="${pathFn(a=>a,0,360,X,a=>Y(a))}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/><line class="axis" x1="10" y1="62" x2="190" y2="62" stroke-dasharray="2 3"/>`;
    [['Recovery','Banks',45],['Expansion','Tech',135],['Peak','Energy',200],['Recession','Staples, health',300]].forEach(([a,b,d])=>{ const x=X(d), y=Y(d); g+=`<circle cx="${x}" cy="${y}" r="3.5" style="fill:var(--us)"/>`+T(x,d<180?y-14:y+16,a,'text-anchor="middle" '+TB)+T(x,d<180?y-5:y+25,b,'text-anchor="middle" style="font-size:7px"'); });
    return sv(g,'Economic cycle and leading sectors'); },
  f:'The market leads the economy by about 6–9 months',
  pts:['Recovery: low rates, rising credit — banks, brokerages and real estate usually lead.','Expansion: strong earnings growth — technology, industrials, consumer discretionary.','Peak/late cycle: inflation, high commodity prices — energy, materials.','Recession: defensives — consumer staples, healthcare, utilities, high dividends.','The model is only a statistical tendency; every cycle has exceptions.'],
  thr:[['Low P/E at the cycle peak','A trap for cyclical stocks'],['High P/E at the bottom','Often the time to buy cyclicals']],
  hook:'<b>Memory tip:</b> buy cyclicals when P/E is high, sell when P/E is low.',src:'Stovall, Standard & Poor\'s Guide to Sector Investing (1996); Fidelity Business Cycle Approach.'},
 {id:'bias',g:'Behavior & cycles',t:'Eight behavioral biases',d:'An investor’s worst enemy is themselves',
  vis:()=>{ const it=['Anchoring','Confirmation','Herding','Overconfid.','Loss aversion','Endowment','Recency','Mental acct.']; let g='';
    it.forEach((a,i)=>{ const x=6+(i%4)*48, y=14+Math.floor(i/4)*52; g+=`<rect x="${x}" y="${y}" width="44" height="44" rx="22" style="fill:var(--s1);stroke:${i%2?'var(--gold)':'var(--dn)'}"/>`+T(x+22,y+25,a,'text-anchor="middle" style="font-size:6.8px;font-weight:700;fill:var(--fg)"'); });
    return sv(g,'Eight behavioral biases'); },
  f:'A loss hurts about 2x as much as an equal gain feels good',
  pts:['Anchoring: clinging to your purchase price or an old high instead of current value.','Confirmation bias: only reading news that supports your existing view.','Herding: buying because everyone else is — common in retail-heavy markets like Vietnam.','Overconfidence: trading too much, diversifying too little.','Loss aversion and the disposition effect: selling winners too early, holding losers too long.','Recency bias: extrapolating short-term trends.','Mental accounting: treating “house money” differently from your principal.','Endowment effect: valuing what you own more highly.'],
  thr:[['The cure','A written process, an investment journal, quantitative criteria like Compass']],
  hook:'<b>Memory tip:</b> write down your thesis and sell conditions BEFORE you buy.',src:'Kahneman & Tversky (1979), “Prospect Theory”, Econometrica 47; Thaler, Misbehaving (2015).'},
 {id:'compound',g:'Behavior & cycles',t:'Compounding and the Rule of 72',d:'Time is the most powerful lever',
  vis:()=>{ const X=v=>20+v/30*165, Y=v=>110-v/18*92; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/>`;
    [[.06,'var(--mut)'],[.10,'var(--us)'],[.15,'var(--gold)']].forEach(([r,c])=>{ g+=`<path d="${pathFn(t=>Math.min(18,Math.pow(1+r,t)),0,30,X,Y)}" fill="none" style="stroke:${c}" stroke-width="2"/>`; });
    return sv(g+T(170,24,'15%','style="font-size:8px;fill:var(--gold);font-weight:700"')+T(176,64,'10%','style="font-size:8px;fill:var(--us);font-weight:700"')+T(176,96,'6%','style="font-size:8px;font-weight:700"')+T(105,122,'Years →','text-anchor="middle" '+TS)+T(24,22,'Multiple',TS),'Three compounding curves'); },
  f:'Doubling time ≈ 72 ÷ return (%)',
  pts:['15%/year for 30 years turns 1 unit into about 66; 10% gives only about 17.','Small differences in returns and fees create huge gaps over decades.','Regular investing (DCA) reduces market-timing risk.'],
  thr:[['6%','Doubles in 12 years'],['12%','Doubles in 6 years'],['18%','Doubles in 4 years']],
  hook:'<b>Memory tip:</b> divide 72 by the interest rate.',src:'Luca Pacioli, Summa de arithmetica (1494) — the earliest record of the Rule of 72.'},
 {id:'rules',g:'US & VN markets',t:'US vs. Vietnam trading rules',d:'Price limits, settlement, lots, foreign room',
  vis:()=>sv(`<rect x="8" y="10" width="88" height="105" rx="8" style="fill:var(--s1);stroke:var(--us)"/><rect x="104" y="10" width="88" height="105" rx="8" style="fill:var(--s1);stroke:var(--vn)"/>${T(52,26,'US','text-anchor="middle" style="font-size:10px;font-weight:800;fill:var(--us)"')}${T(148,26,'VIETNAM','text-anchor="middle" style="font-size:10px;font-weight:800;fill:var(--vn)"')}${[['T+1','T+2'],['No daily limit','±7/10/15%'],['1-share lot','100-share lot'],['Breakers 7-13-20%','Foreign 49%/30%'],['9:30–16:00 ET','9:00–14:45']].map(([a,b],i)=>T(52,44+i*15,a,'text-anchor="middle" style="font-size:8px;fill:var(--fg)"')+T(148,44+i*15,b,'text-anchor="middle" style="font-size:8px;fill:var(--fg)"')).join('')}`,'Comparing the two markets’ rules'),
  f:'Price limits: HOSE ±7% · HNX ±10% · UPCoM ±15%',
  pts:['The US moved to T+1 settlement on May 28, 2024; Vietnam settles T+2.','Vietnam has tick sizes on HOSE: ₫10 (< 10,000), ₫50 (10,000–49,950), ₫100 (≥ 50,000).','The US has no daily price limit but has market-wide circuit breakers (S&P 500 down 7%, 13%, 20%) and LULD bands for individual stocks.','Foreign ownership limits in Vietnam: typically 49%, banks 30% — stocks with no room left often trade at a premium for foreign investors.','Vietnam price board colors: purple ceiling, cyan floor, yellow reference, green up, red down.'],
  thr:[['HOSE','±7%, lot 100'],['HNX','±10%, lot 100'],['UPCoM','±15%, lot 100'],['NYSE/NASDAQ','No limit, circuit breakers']],
  hook:'<b>Memory tip:</b> “7 – 10 – 15” for the three Vietnamese exchanges, “7 – 13 – 20” for US circuit breakers.',src:'SEC Release 34-96930 (T+1, 2023); HOSE/HNX trading regulations; NYSE Rule 7.12 (circuit breakers).'},
 {id:'hours',g:'US & VN markets',t:'Trading hours in Vietnam time',d:'One day, two markets',
  vis:()=>{ const X=h=>10+h/24*180; let g=`<rect x="10" y="50" width="180" height="22" rx="4" style="fill:var(--s1);stroke:var(--line2)"/>`;
    g+=`<rect x="${X(9)}" y="50" width="${X(11.5)-X(9)}" height="22" style="fill:var(--vn);fill-opacity:.8"/><rect x="${X(13)}" y="50" width="${X(14.75)-X(13)}" height="22" style="fill:var(--vn);fill-opacity:.8"/><rect x="${X(20.5)}" y="50" width="${X(24)-X(20.5)}" height="22" style="fill:var(--us);fill-opacity:.8"/><rect x="10" y="50" width="${X(3)-X(0)}" height="22" style="fill:var(--us);fill-opacity:.8"/>`;
    [0,6,9,12,15,18,21,24].forEach(h=>g+=T(X(h),86,h+'h','text-anchor="middle" '+TS));
    return sv(g+T(X(11.9),42,'Vietnam','text-anchor="middle" style="font-size:9px;font-weight:700;fill:var(--vn)"')+T(X(22),42,'US (summer)','text-anchor="middle" style="font-size:9px;font-weight:700;fill:var(--us)"')+T(100,108,'US hours shift 1 hour outside DST (Nov–Mar)','text-anchor="middle" '+TS),'Trading-hour bands across 24 hours'); },
  f:'US (daylight time): 20:30 – 03:00 Vietnam time',
  pts:['Vietnam: ATO 9:00–9:15, continuous matching 9:15–11:30 and 13:00–14:30, ATC 14:30–14:45; then put-through (negotiated) trading.','US: 9:30–16:00 New York time; in winter that is 21:30–04:00 Vietnam time.','The US market closes before Vietnam opens — Wall Street’s overnight moves often shape sentiment in Vietnam’s morning session.'],
  thr:[['ATO/ATC','Periodic auction sessions that set the open/close price'],['US pre/after-market','Low liquidity, wide spreads']],
  hook:'<b>Memory tip:</b> Vietnam in the morning, the US at night — a two-market investor can follow the action almost all day.',src:'HOSE; NYSE trading hours.'},
 {id:'upgrade',g:'US & VN markets',t:'Market classification and upgrades',d:'Why an upgrade attracts foreign capital',
  vis:()=>{ const st=['Frontier','Secondary EM','Adv. EM','Developed']; let g='';
    st.forEach((a,i)=>{ const x=10+i*46, y=95-i*22; g+=`<rect x="${x}" y="${y}" width="44" height="${115-y}" rx="4" style="fill:${i===1?'var(--vn)':i===3?'var(--us)':'var(--line2)'};fill-opacity:${i===1||i===3?.8:.5}"/>`+T(x+22,y-4,a,'text-anchor="middle" style="font-size:7px;font-weight:700;fill:var(--fg)"'); });
    return sv(g+T(56,110,'VN*','text-anchor="middle" style="font-size:8px;font-weight:800;fill:#fff"')+T(148,44,'US','text-anchor="middle" style="font-size:9px;font-weight:800;fill:#fff"'),'Market classification tiers'); },
  f:'Upgrade → index funds are required to allocate capital',
  pts:['FTSE Russell announced (Oct 2025) an upgrade of Vietnam from Frontier to Secondary Emerging, phased in from September 2026 — check actual progress.','MSCI still classifies Vietnam as Frontier (as of 2025); areas to improve include foreign ownership room, currency convertibility and account opening.','An upgrade brings passive flows from index ETFs and active money from emerging-market funds; large caps with foreign room left benefit most.','The US is a developed market and makes up most of the global index (MSCI ACWI).'],
  thr:[['Key criteria','Openness to foreign capital, liquidity, clearing–custody infrastructure, currency convertibility']],
  hook:'<b>Memory tip:</b> an upgrade is the “ticket” into global funds’ portfolios.',src:'FTSE Russell Equity Country Classification (Sep 2025, Oct 2025); MSCI Market Classification Review (2025).'}
];

RENDER.learn=function(){
  const el=$('#v-learn'); const groups=[...new Set(LESSONS.map(l=>l.g))];
  const done=S.learned.filter(id=>LESSONS.some(l=>l.id===id)).length;
  const leit=store.leit||{}; const boxes=[0,0,0,0,0]; QUIZ.forEach((_,i)=>{ boxes[clamp((leit[i]||1)-1,0,4)]++; });
  el.innerHTML=`<div class="sec-h" style="margin:0"><div><h2>Investing academy</h2><p>${LESSONS.length} visual knowledge cards · with academic sources</p></div></div>
  <section class="panel" style="display:grid;gap:14px;grid-template-columns:1fr;align-items:center">
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><b style="font-family:var(--f-disp);font-size:17px">Progress: ${done}/${LESSONS.length} lessons</b><span class="note">Best review score: ${S.quizBest}/8</span></div>
    <div class="progress" aria-label="Learning progress"><i style="width:${done/LESSONS.length*100}%"></i></div>
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
      <button class="btn pri" id="startQuiz">Review 8 questions</button>
      <div style="display:flex;gap:4px;align-items:flex-end;height:34px" aria-label="Leitner box distribution">${boxes.map((n,i)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><i style="display:block;width:18px;height:${4+n*1.4}px;border-radius:3px;background:var(--gold);opacity:${.35+i*.16}"></i><span style="font-size:10px;color:var(--mut)">B${i+1}</span></div>`).join('')}</div>
      <p class="note" style="flex:1;min-width:180px">Leitner box system: answer correctly and a question moves up a box and comes back less often; answer wrong and it returns to box 1.</p>
    </div>
  </section>
  ${groups.map(g=>`<section><div class="sec-h"><h2 style="font-size:18px">${esc(g)}</h2></div><div class="learn-grid">${LESSONS.filter(l=>l.g===g).map(l=>`<button class="lcard" data-lesson="${l.id}"><span class="th">${l.vis()}${S.learned.includes(l.id)?'<span class="done" aria-label="Learned"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg></span>':''}</span><span class="tx"><b>${esc(l.t)}</b><span>${esc(l.d)}</span></span></button>`).join('')}</div></section>`).join('')}`;
  $('#startQuiz').onclick=startQuiz;
};
function openLesson(id){
  const l=LESSONS.find(x=>x.id===id); if(!l) return;
  const idx=LESSONS.indexOf(l); const next=LESSONS[(idx+1)%LESSONS.length];
  const html=`<div class="lesson">
    <p class="note">${typeof lessonCrumb==='function'?lessonCrumb(l):esc(l.g)+' · Lesson '+(idx+1)+'/'+LESSONS.length}</p>
    <div class="vis">${l.vis()}</div>
    <div class="formula">${l.f}</div>
    ${l.interactive==='dupont'?`<section class="panel" style="display:flex;flex-direction:column;gap:10px"><b style="font-family:var(--f-disp)">DuPont playground</b>
      <label class="slider-row"><span>Net margin</span><input type="range" id="duN" min="1" max="40" step="0.5" value="10"><output id="duNo"></output></label>
      <label class="slider-row"><span>Asset turnover</span><input type="range" id="duA" min="0.1" max="3" step="0.05" value="0.8"><output id="duAo"></output></label>
      <label class="slider-row"><span>Leverage</span><input type="range" id="duL" min="1" max="12" step="0.1" value="2"><output id="duLo"></output></label>
      <div class="result" id="duOut"></div></section>`:''}
    <ul class="bul">${l.pts.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
    ${l.thr&&l.thr.length?`<table class="thr"><thead><tr><th>Threshold</th><th>Meaning</th></tr></thead><tbody>${l.thr.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>`:''}
    <div class="hook">${l.hook}</div>
    <p class="note"><b>Source:</b> ${esc(l.src)}</p>
    <div class="row-btns"><button class="btn ${S.learned.includes(l.id)?'':'pri'}" id="lDone">${S.learned.includes(l.id)?'✓ Learned':'Mark as learned'}</button><button class="btn" id="lNext">Next: ${esc(next.t)}</button></div>
  </div>`;
  openSheet(l.t,html,body=>{
    $('#lDone').onclick=()=>{ if(!S.learned.includes(l.id)) S.learned.push(l.id); else S.learned=S.learned.filter(x=>x!==l.id); saveState(); if(S.view==='learn') RENDER.learn(); openLesson(l.id); };
    $('#lNext').onclick=()=>openLesson(next.id);
    if(l.interactive==='dupont'){ const up=()=>{ const n=+$('#duN').value,a=+$('#duA').value,L=+$('#duL').value; $('#duNo').textContent=fmt(n,1)+'%'; $('#duAo').textContent=fmt(a,2)+'x'; $('#duLo').textContent=fmt(L,1)+'x'; const roe=n*a*L, roa=n*a;
      $('#duOut').innerHTML=`<div><b class="gold">${pct(roe,1)}</b><span>ROE</span></div><div><b>${pct(roa,1)}</b><span>ROA = margin × turnover</span></div><div><b>${L>4?'<span class="dn">High</span>':'Moderate'}</b><span>Leverage level (${L>4?'debt-dependent':'healthy for a non-financial company'})</span></div>`; };
      ['duN','duA','duL'].forEach(i=>$('#'+i).oninput=up); up(); }
  });
}
/* ---------- ôn tập Leitner ---------- */
function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function pickQuestions(n){
  const leit=store.leit||{}; const items=QUIZ.map((q,i)=>({i,b:leit[i]||1,r:Math.random()}));
  items.sort((a,b)=>a.b-b.b||a.r-b.r); return items.slice(0,n).map(x=>x.i);
}
function startQuiz(){
  const qs=pickQuestions(8); const st={k:0,score:0,qs};
  const render=()=>{
    if(st.k>=st.qs.length){ if(st.score>S.quizBest){ S.quizBest=st.score; saveState(); }
      $('#sheetBody').innerHTML=`<div class="lesson" style="text-align:center;align-items:center"><div class="bigring" style="margin:10px auto">${ringSVG(st.score/st.qs.length*100,108,9)}<div class="v"><b>${st.score}/${st.qs.length}</b><span>correct</span></div></div>
        <p>${st.score>=7?'Excellent — this knowledge is moving into long-term boxes.':st.score>=5?'Pretty good. The ones you missed will come back sooner.':'Review the related knowledge cards, then try again.'}</p>
        <div class="row-btns" style="justify-content:center"><button class="btn pri" id="qAgain">Review 8 more</button><button class="btn" id="qClose">Back to library</button></div></div>`;
      animateRings($('#sheetBody')); $('#qAgain').onclick=startQuiz; $('#qClose').onclick=()=>{ closeSheet(); if(S.view==='learn') RENDER.learn(); }; return; }
    const qi=st.qs[st.k], Q=QUIZ[qi]; const order=shuffle(Q.a.map((t,i)=>({t,i})));
    $('#sheetBody').innerHTML=`<div class="lesson"><div style="display:flex;justify-content:space-between;align-items:center"><span class="note">Question ${st.k+1}/${st.qs.length} · Box ${(store.leit||{})[qi]||1}</span><span class="note">Correct: ${st.score}</span></div>
      <div class="progress"><i style="width:${st.k/st.qs.length*100}%"></i></div>
      <h3 style="font-size:19px;line-height:1.3">${esc(Q.q)}</h3>
      <div style="display:flex;flex-direction:column;gap:8px" id="qOpts">${order.map(o=>`<button class="quiz-opt" data-i="${o.i}">${esc(o.t)}</button>`).join('')}</div>
      <div class="row-btns"><button class="btn sm ghost" id="qHint">Hint: remove one wrong answer</button></div>
      <div id="qFb"></div></div>`;
    let answered=false;
    $('#qHint').onclick=()=>{ const wrong=$$('#qOpts .quiz-opt').filter(b=>+b.dataset.i!==Q.c&&!b.disabled); if(wrong.length>1){ const w=wrong[Math.floor(Math.random()*wrong.length)]; w.disabled=true; w.style.opacity=.35; } $('#qHint').disabled=true; };
    $$('#qOpts .quiz-opt').forEach(b=>b.onclick=()=>{ if(answered) return; answered=true; const ok=+b.dataset.i===Q.c;
      $$('#qOpts .quiz-opt').forEach(x=>{ if(+x.dataset.i===Q.c) x.classList.add('ok'); x.disabled=true; }); if(!ok) b.classList.add('bad');
      const leit=store.leit||{}; leit[qi]= ok? Math.min(5,(leit[qi]||1)+1) : 1; store.leit=leit; persist(); if(ok) st.score++;
      $('#qHint').disabled=true;
      $('#qFb').innerHTML=`<div class="hook" style="border-color:${ok?'var(--up)':'var(--dn)'}"><b style="color:${ok?'var(--up)':'var(--dn)'}">${ok?'Correct.':'Not quite.'}</b> ${esc(Q.e)}</div><div class="row-btns" style="margin-top:10px"><button class="btn pri" id="qNext">${st.k+1<st.qs.length?'Next question':'See results'}</button></div>`;
      $('#qNext').onclick=()=>{ st.k++; render(); }; $('#qNext').focus({preventScroll:true}); });
  };
  openSheet('Knowledge review','',()=>render());
}

/* ---------------- KHỞI ĐỘNG ---------------- */
function bindGlobal(){
  document.addEventListener('click',e=>{
    const st=e.target.closest('[data-star]'); if(st){ e.stopPropagation(); toggleStar(st.dataset.star); const on=isStar(st.dataset.star); st.setAttribute('aria-pressed',String(on)); st.innerHTML=starSVG(on); if(S.view==='port') RENDER.port(); return; }
    const es=e.target.closest('[data-estar]'); if(es){ e.stopPropagation(); toggleEStar(es.dataset.estar); const on=isEStar(es.dataset.estar); es.setAttribute('aria-pressed',String(on)); es.innerHTML=starSVG(on); return; }
    const op=e.target.closest('[data-open]'); if(op){ openStock(op.dataset.open); return; }
    const et=e.target.closest('[data-etf]'); if(et){ openEtf(et.dataset.etf); return; }
    const pr=e.target.closest('[data-pair]'); if(pr&&!pr.closest('#pairGrid')){ openPair(+pr.dataset.pair); return; }
    const gp=e.target.closest('[data-gopairs]'); if(gp){ S.scrMode='pairs'; saveState(); setView('screen'); return; }
    const go=e.target.closest('[data-go]'); if(go){ setView(go.dataset.go); return; }
    const ls=e.target.closest('[data-lesson]'); if(ls){ openLesson(ls.dataset.lesson); return; }
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape') closeSheet();
    if((e.key==='Enter'||e.key===' ')&&e.target.matches('.srow,.bt-r')){ e.preventDefault(); if(e.target.dataset.etf) openEtf(e.target.dataset.etf); else openStock(e.target.dataset.open); }
    if(e.key==='Tab'&&!$('#sheet').hidden){ const f=$$('#sheetCard button,#sheetCard input,#sheetCard select,#sheetCard textarea,#sheetCard summary').filter(x=>!x.disabled&&x.offsetParent!==null); if(!f.length) return; const first=f[0],last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); } }
  });
  $$('#tabbar button').forEach(b=>b.onclick=()=>setView(b.dataset.v));
  $$('#mktSeg button').forEach(b=>b.onclick=()=>setMarket(b.dataset.m));
  $('#settingsBtn').onclick=openSettings;
  $('#sheetClose').onclick=closeSheet; $('#scrim').onclick=closeSheet;
  /* vuốt xuống để đóng sheet trên điện thoại */
  let y0=null; const head=$('.sheet-head');
  head.addEventListener('touchstart',e=>{ y0=e.touches[0].clientY; },{passive:true});
  head.addEventListener('touchend',e=>{ if(y0!=null&&e.changedTouches[0].clientY-y0>70) closeSheet(); y0=null; },{passive:true});
}
function boot(){
  if(S.theme!=='system') applyTheme();
  computeAll(); bindGlobal(); initLive();
  $$('#mktSeg button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.m===S.market)));
  const h=(location.hash||'').replace('#','');
  setView(VIEWS.includes(h)?h:'home',{keepScroll:true});
}

