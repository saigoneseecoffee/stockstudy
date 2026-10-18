/* ============================================================
   LỘ TRÌNH 10 CẤP ĐỘ — từ người chưa biết gì đến chuyên gia
   ============================================================ */
const LEVELS=[
 {n:'Getting started',tier:'Beginner',d:'Know nothing yet? Start here.',goal:['Understand that a stock is a piece of ownership in a business','Know how prices form between buyers and sellers','Weigh return against risk, and see the power of compounding','Know the steps to open an account and place your first order'],
  ids:['l1-stock','l1-market','l1-risk','compound','l1-start']},
 {n:'Reading the market',tier:'Beginner',d:'Price board, indexes, orders, rules and costs.',goal:['Read every column on the price board','Tell VN-Index, VN30 and S&P 500 apart','Pick the right order type: LO, ATO, ATC, MP','Know price bands, trading hours, taxes and fees, and market upgrades'],
  ids:['l2-board','l2-index','l2-orders','rules','hours','costs','upgrade']},
 {n:'Investing safely',tier:'Beginner',d:'Know yourself, understand inflation, diversify, avoid mental traps.',goal:['Define your goals and your risk tolerance','Understand inflation and real returns','Use ETFs, diversification and regular investing','Spot the biases that make beginners lose money'],
  ids:['l3-profile','l3-inflation','etf-basics','divers','l3-dca','drawdown','bias','etf-pick']},
 {n:'Reading financial statements',tier:'Intermediate',d:'Balance sheet, income statement, ratios, notes, audit.',goal:['Read every line item on the balance sheet','Separate core profit from one-off profit','Calculate and read liquidity, leverage, efficiency and profitability ratios','Read the auditor’s opinion and the notes'],
  ids:['l4-3fs','l4-bs','l4-is','l4-eps','margin','l4-ratios','dupont','l4-notes']},
 {n:'Cash flow & financial health',tier:'Intermediate',d:'The three cash flows, capex, earnings quality, red flags, a practice exercise.',goal:['Read the three cash flows and spot the life-cycle stage','Calculate FCF and owner earnings','Judge earnings quality with F-Score, Z-Score, M-Score','Read a set of financial statements on your own in 15 minutes'],
  ids:['l5-cf3','fcf','l5-capex','ccc','l5-quality','piotroski','altman','beneish','l5-redflags','l5-practice']},
 {n:'Valuation',tier:'Intermediate',d:'Multiples, the Graham model, discounted dividends and cash flows.',goal:['Use P/E, P/B, EV/EBITDA and PEG in the right places','Apply Graham’s two tests','Understand the cost of capital (WACC)','Build a DCF and a reverse DCF'],
  ids:['pe','pb','ev','peg','graham','ddm','wacc','dcf','rdcf']},
 {n:'Picking stocks',tier:'Advanced',d:'5-step process, industry, economic moats, management, styles, investment thesis.',goal:['Apply the 5-step stock-picking process','Analyze the industry, economic moat, ROIC and management','Read sector-specific statements: banks, real estate, retail','Write an investment thesis and know when to sell'],
  ids:['l7-process','l7-industry','moat','roic','l7-mgmt','bank','l7-sector','l7-styles','l7-thesis','earnings']},
 {n:'Portfolio & wealth building',tier:'Advanced',d:'Wealth-building plan, allocation, rebalancing, dividends, financial independence.',goal:['Plan long-term wealth building with a compounding calculator','Allocate assets and rebalance','Build wealth with dividends','Work out your financial-independence target and manage portfolio risk'],
  ids:['l8-plan','l8-alloc','l8-rebal','l8-dividend','l8-fire','cycle','capm','frontier','sizing','famafrench','emh']},
 {n:'Technical analysis',tier:'Advanced',d:'Candles, trends, indicators, stop-losses — tools for timing buys and sells.',goal:['Read candles, candlestick patterns and chart patterns','Read trends, support and resistance','Use MA, RSI, MACD, Bollinger, Ichimoku, Fibonacci','Set ATR-based stop-losses and understand margin risk'],
  ids:['candle-anatomy','dow','sr','ma','volume-l','rsi-l','macd-l','bb-l','stoch-l','fibo','ichimoku-l','elliott','atr-l','margin-trade'],extra:'cdl'},
 {n:'Derivatives & leverage',tier:'Expert',d:'Options, Greeks, strategies, leveraged and inverse ETFs.',goal:['Price options with Black–Scholes','Manage the Greeks and IV','Build spreads, condors and collars','Understand the decay of leveraged ETFs'],
  ids:['opt-basics','opt-money','opt-payoff','opt-bs','opt-parity','opt-delta','opt-theta','opt-iv','opt-smile','opt-income','opt-hedge','opt-vertical','opt-straddle','opt-condor','opt-calendar','opt-risk','opt-vn','etf-decay','etf-pairs']}
];
const TIER_COL={'Beginner':'var(--up)','Intermediate':'var(--us)','Advanced':'var(--gold)','Expert':'var(--dn)'};

/* ---------- bài học mới cho cấp 1–4 (infographic tự vẽ) ---------- */
const arrowDef='<defs><marker id="arL" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8z" style="fill:var(--mut)"/></marker></defs>';
const NEW_BASIC=[
 {id:'l1-stock',t:'What is a stock?',d:'Owning a slice of a business',
  vis:()=>{ let g=arrowDef; for(let i=0;i<10;i++){ const x=14+(i%5)*20, y=26+Math.floor(i/5)*24; g+=`<rect x="${x}" y="${y}" width="18" height="22" rx="3" style="fill:${i===3?'var(--gold)':'var(--s1)'};stroke:var(--line2)"/>`; }
    g+=T(63,20,'ABC Pho Co. = 10 shares','text-anchor="middle" '+TB)+T(63,90,'Your 1 share = 10%','text-anchor="middle" style="font-size:8.5px;font-weight:800;fill:var(--gold)"');
    g+=`<path d="M118 40 h18" style="stroke:var(--mut)" marker-end="url(#arL)"/><path d="M118 66 h18" style="stroke:var(--mut)" marker-end="url(#arL)"/>`;
    g+=`<rect x="138" y="28" width="58" height="24" rx="6" style="fill:var(--s1);stroke:var(--up)"/>`+T(167,38,'Dividend','text-anchor="middle" style="font-size:8.5px;font-weight:800;fill:var(--up)"')+T(167,47,'profit share','text-anchor="middle" '+TS);
    g+=`<rect x="138" y="56" width="58" height="24" rx="6" style="fill:var(--s1);stroke:var(--us)"/>`+T(167,66,'Price gain','text-anchor="middle" style="font-size:8.5px;font-weight:800;fill:var(--us)"')+T(167,75,'growth','text-anchor="middle" '+TS);
    g+=T(100,112,'Gain = dividend + (sell − buy)','text-anchor="middle" '+TB);
    return sv(g,'A stock is a share of company ownership, earning via dividends and price gains'); },
  f:'Your return = Dividends received + (Sell price − Buy price) − Taxes and fees',
  pts:['A company divides its capital into many equal parts called shares. Each share of stock is a small piece of ownership in that company.','Example: the company has 1 million shares and you buy 1,000 of them, so you own 0.1% — you get 0.1% of the profit and 0.1% of the votes at the shareholders’ meeting.','Two ways to make money: dividends (the company shares its profit in cash or in stock) and capital gains (selling above your purchase price).','Risk: if the company does poorly the price falls; if it goes bankrupt, shareholders are paid last, after creditors, so they usually lose almost everything.','Listed stocks trade every day on an exchange: HOSE and HNX in Vietnam; NYSE and Nasdaq in the US.'],
  thr:[['Shareholder','Owner: shares in gains and losses, no fixed interest'],['Bondholder','Creditor: receives fixed interest, paid before shareholders'],['Saver','Lends to the bank at fixed interest, lowest risk']],
  hook:'<b>Memory tip:</b> buying a stock means buying a slice of the whole cake, not a lucky piece of paper.',src:'State Securities Commission of Vietnam, Investor Handbook; SEC, Saving and Investing: A Roadmap to Your Financial Security.'},
 {id:'l1-market',t:'Exchanges and prices',d:'Prices are set where buyers meet sellers',
  vis:()=>{ let g=''; const bid=[[49.9,32],[49.8,46],[49.7,24]], ask=[[50.0,28],[50.1,40],[50.2,18]];
    g+=T(48,14,'Want to BUY','text-anchor="middle" style="font-size:8.5px;font-weight:800;fill:var(--up)"')+T(152,14,'Want to SELL','text-anchor="middle" style="font-size:8.5px;font-weight:800;fill:var(--dn)"');
    bid.forEach(([p,w],i)=>{ g+=`<rect x="${86-w}" y="${22+i*18}" width="${w}" height="13" rx="2" style="fill:var(--up);fill-opacity:.55"/>`+T(14,32+i*18,fmt(p,1),'style="font-size:8.5px;font-weight:700"'); });
    ask.forEach(([p,w],i)=>{ g+=`<rect x="114" y="${22+i*18}" width="${w}" height="13" rx="2" style="fill:var(--dn);fill-opacity:.55"/>`+T(186,32+i*18,fmt(p,1),'text-anchor="end" style="font-size:8.5px;font-weight:700"'); });
    g+=`<circle cx="100" cy="28" r="11" style="fill:var(--gold)"/>`+T(100,31,'Fill','text-anchor="middle" style="font-size:7px;font-weight:800;fill:var(--gold-ink)"');
    g+=T(100,90,'More buyers → price goes up','text-anchor="middle" '+TB)+T(100,104,'More sellers → price goes down','text-anchor="middle" '+TB)+T(100,118,'Bar length = volume waiting','text-anchor="middle" '+TS);
    return sv(g,'Order book: buyers and sellers meet at the matched price'); },
  f:'Matched price = where the price a buyer will pay meets the price a seller will accept',
  pts:['A stock exchange is an organized “marketplace”. You do not buy directly from the company; you buy from other investors, through a securities company acting as your broker.','Every order goes into the order book: better prices get priority, and at the same price, whoever ordered first is matched first.','Good news (rising profit, a big contract) makes many people want to buy → the price rises; bad news does the opposite. Today’s price reflects expectations about the future, not just past results.','Liquidity is how easy it is to buy and sell: a stock that matches millions of shares a day is easier to exit than one that matches only a few thousand.','Market cap = price × shares outstanding — the market’s measure of “how big the company is”.'],
  thr:[['Reference price (VN)','Previous session’s close, the base for ceiling/floor'],['Liquidity','High matched volume = easy to trade'],['Market cap','Price × shares outstanding']],
  hook:'<b>Memory tip:</b> the company does not set its stock price each day — thousands of buyers and sellers do.',src:'HOSE Securities Trading Regulations; Nasdaq, How the Stock Market Works.'},
 {id:'l1-risk',t:'Return comes with risk',d:'There is no free lunch',
  vis:()=>{ const X=i=>30+i*48, Y=v=>58-v*0.44; let g=`<line class="grid-l" x1="14" x2="196" y1="${Y(0)}" y2="${Y(0)}"/>`+T(12,Y(0)+3,'0%','text-anchor="end" style="font-size:7px"');
    const rows=[['Savings','4–6%/yr',5,4,6,'var(--mut)'],['Bonds','5–8%',6.5,-5,15,'var(--us)'],['US stocks','≈10%',10,-37,38,'var(--up)'],['VN-Index','very volatile',12,-66,144,'var(--gold)']];
    rows.forEach(([n,a,avg,lo,hi,c],i)=>{ const x=X(i); const yl=Y(Math.max(lo,-70)), yh=Y(Math.min(hi,80));
      g+=`<line x1="${x}" x2="${x}" y1="${yh}" y2="${yl}" style="stroke:${c}" stroke-width="5" stroke-linecap="round" stroke-opacity=".35"/><circle cx="${x}" cy="${Y(avg)}" r="4" style="fill:${c}"/>`;
      g+=T(x,104,n,'text-anchor="middle" style="font-size:8px;font-weight:800"')+T(x,114,a,'text-anchor="middle" '+TS); });
    g+=T(4,9,'Faded bar: best ↔ worst year · Dot: long-run average','style="font-size:6.6px"')+T(X(3)-6,Y(80)+6,'+144%','text-anchor="end" style="font-size:7px;fill:var(--gold)"')+T(X(3)-6,Y(-66)+2,'−66%','text-anchor="end" style="font-size:7px;fill:var(--dn)"');
    return sv(g,'Average return and best/worst-year range of each investment option'); },
  f:'Higher expected return ⇄ bigger swings and a higher chance of short-term losses',
  pts:['No option offers both high returns and no risk. Stocks have the highest long-run return of the common options precisely because their prices swing so much.','US stocks (S&P 500, including dividends) have averaged about 10% a year since 1928, but fell 37% in one year (2008) and rose 38% in another.','VN-Index is even more volatile: up about 144% in 2006, down about 66% in 2008.','The longer you hold, the lower the chance of a loss: S&P 500 history shows about 3/4 of years were positive, and holding for 20 years or more (dividends included) has never produced a nominal loss. The past does not guarantee the future.','Money you need in the next 1–2 years should not go into stocks.'],
  thr:[['Emergency fund','3–6 months of expenses, kept in savings'],['Goals under 2 years','Savings, short-term bonds'],['Goals over 5 years','Can put most of it into stocks and ETFs']],
  hook:'<b>Memory tip:</b> before asking “how much can I make?”, ask “how much can I lose and still sleep well?”',src:'Damodaran, Historical Returns on Stocks, Bonds and Bills (NYU Stern, updated annually); VN-Index data from HOSE.'},
 {id:'l1-start',t:'Getting started: your account and first order',d:'Four steps from zero',
  vis:()=>{ let g=arrowDef; const st=[['1','Open account','at a brokerage'],['2','Deposit cash','into account'],['3','Place order','ticker·px·qty'],['4','Get shares','after T+2']];
    st.forEach(([n,a,b],i)=>{ const x=4+i*49.5; g+=`<rect x="${x}" y="28" width="44" height="54" rx="8" style="fill:var(--s1);stroke:${i===2?'var(--gold)':'var(--line2)'}"/><circle cx="${x+22}" cy="28" r="9" style="fill:var(--gold)"/>`;
      a.split(' ').reduce((acc,w)=>{ const last=acc[acc.length-1]; if(last&&(last+' '+w).length<=8) acc[acc.length-1]=last+' '+w; else acc.push(w); return acc; },[]).forEach((ln,k)=>g+=T(x+22,50+k*9,ln,'text-anchor="middle" style="font-size:7.5px;font-weight:800"'));
      g+=T(x+22,33,n,'text-anchor="middle" style="font-size:9px;font-weight:800;fill:var(--gold-ink)"')+T(x+22,76,b,'text-anchor="middle" style="font-size:5.8px;fill:var(--mut)"');
      if(i<3) g+=`<path d="M${x+44.5} 56 h4" style="stroke:var(--mut)" marker-end="url(#arL)"/>`; });
    g+=T(100,104,'Cost = Price × Quantity + Fees','text-anchor="middle" '+TB)+T(100,116,'HOSE round lot: 100 · Odd lot: 1–99','text-anchor="middle" '+TS);
    return sv(g,'Four steps to start investing in stocks'); },
  f:'Cash needed = Price × Quantity + Brokerage fee (about 0.1–0.35% in Vietnam)',
  pts:['Open an account with a licensed securities company (brokerage). Most can be done online with your citizen ID card (eKYC) in a few minutes.','Deposit money into your brokerage account (the money stays in your name, held at a custodian bank).','Place an order: choose the ticker, price and quantity. Beginners should use a limit order (LO) so they know for sure the maximum price they will pay.','Vietnam settles on T+2: shares bought today arrive in your account after 2 business days. The US is T+1.','Vietnamese investors who want US stocks need an account with an international broker; in the US you can buy as little as 1 share, or even a fraction of a share.','Keep a journal: why you bought, your target, your stop-loss. This habit separates an investor from a gambler.'],
  thr:[['HOSE','Lots of 100 shares, odd lots of 1–99 shares'],['Tax when selling (VN)','0.1% of the sale value'],['Brokerage fee (VN)','About 0.1–0.35% each way']],
  hook:'<b>Memory tip:</b> start with an amount that, if you lost half of it, would not change your life.',src:'Law on Securities 2019; Circular 120/2020/TT-BTC; HOSE Trading Regulations.'},
 {id:'l2-board',t:'Reading the electronic price board',d:'What each column on the price board means',
  vis:()=>{ const cols=[['Ticker','FPT','var(--fg)'],['Ceil','62,250','var(--ceil)'],['Floor','54,150','var(--floor)'],['Ref','58,200','var(--ref)'],['Bid 1','58,400','var(--up)'],['Last','58,500','var(--up)'],['+/−','+0.5%','var(--up)'],['Ask 1','58,600','var(--up)']];
    let g=''; cols.forEach(([h,v,c],i)=>{ const x=4+i*24.4; g+=`<rect x="${x}" y="30" width="23.4" height="34" rx="3" style="fill:var(--s1);stroke:var(--line)"/>`+T(x+11.7,42,h,'text-anchor="middle" style="font-size:5.6px;fill:var(--mut)"')+T(x+11.7,56,v,`text-anchor="middle" style="font-size:6.2px;font-weight:800;fill:${c}"`); });
    g+=T(100,18,'One row of the HOSE price board','text-anchor="middle" '+TB);
    const leg=[['Purple: ceil.','var(--ceil)'],['Green: up','var(--up)'],['Yellow: ref.','var(--ref)'],['Red: down','var(--dn)'],['Blue: floor','var(--floor)']];
    leg.forEach(([t,c],i)=>{ const x=4+(i%3)*66, y=84+Math.floor(i/3)*14; g+=`<rect x="${x}" y="${y-7}" width="8" height="8" rx="2" style="fill:${c}"/>`+T(x+11,y,t,'style="font-size:7px"'); });
    return sv(g,'Price board columns and color conventions'); },
  f:'Purple = ceiling · Green = up · Yellow = reference · Red = down · Blue = floor',
  pts:['Ref (reference) is the previous session’s close. Ceiling = Ref + 7%, Floor = Ref − 7% on HOSE (HNX ±10%, UPCoM ±15%), rounded to the tick size.','“Bid 1, 2, 3” and their volumes are the three best prices buyers are waiting at; “Ask 1, 2, 3” are the three levels sellers are waiting at.','The Matched column shows the price and volume just traded; Total volume is the amount matched since the session opened.','The Foreign buy/sell column shows whether foreign investors are net buying or net selling — many people watch it as a signal of big money flows.','Color only tells you the price relative to the reference, not whether the stock is good or bad.'],
  thr:[['Bid volume larger than ask volume','Buyers are more active (for reference only; orders can be cancelled)'],['Sudden volume spike','Money is paying attention — check the news'],['No sellers left at the ceiling price','Demand far exceeds supply']],
  hook:'<b>Memory tip:</b> read left to right — reference price → people who want to buy → actual trades → people who want to sell.',src:'HOSE Trading Regulations; price board guides from securities companies.'},
 {id:'l2-index',t:'Market indexes',d:'What VN-Index, VN30 and S&P 500 measure',
  vis:()=>{ const b=[[42,58,26,'VIC'],[86,48,20,'VCB'],[118,70,17,'VHM'],[150,46,15,'BID'],[176,70,12,'CTG'],[70,86,9,''],[100,94,7,''],[136,96,6,''],[160,94,5,''],[24,92,6,''],[188,40,5,'']];
    let g=''; b.forEach(([x,y,r,t],i)=>{ g+=`<circle cx="${x}" cy="${y}" r="${r}" style="fill:${i<5?'var(--gold)':'var(--us)'};fill-opacity:${i<5?.75:.45}"/>`+(t?T(x,y+3,t,'text-anchor="middle" style="font-size:7.5px;font-weight:800;fill:var(--gold-ink)"'):''); });
    g+=T(100,14,'Size = market cap','text-anchor="middle" '+TB)+T(100,118,'A few big stocks can move the whole index','text-anchor="middle" '+TS);
    return sv(g,'Cap-weighted index: big stocks have more influence'); },
  f:'Cap-weighted index = Current total market cap ÷ Base-period total market cap × Base points',
  pts:['VN-Index covers every stock on HOSE, with a base of 100 points on 28 July 2000. The bigger the stock, the more it moves the index.','VN30 holds 30 large, highly liquid stocks with weight caps; it is the underlying asset of VN30F futures contracts.','The S&P 500 holds about 500 large US companies, weighted by free-float market cap, and represents about 80% of US market cap.','The Dow Jones holds 30 companies, weighted by price (a different method). The Nasdaq Composite leans toward technology.','A rising index does not mean most stocks are rising — check market breadth (number of advancers/decliners) right on the app’s home screen.'],
  thr:[['VN-Index','All of HOSE, base 100 points (2000)'],['VN30','30 large stocks, basis of VN30F derivatives'],['S&P 500','500 large US companies']],
  hook:'<b>Memory tip:</b> an index is the thermometer of the whole market, not the price of a single item.',src:'HOSE, Index Construction and Management Rules; S&P Dow Jones Indices, S&P U.S. Indices Methodology.'},
 {id:'l2-orders',t:'Order types and a trading day',d:'LO, ATO, ATC, MP and stop orders',
  vis:()=>{ const seg=[[9,9.25,'ATO','var(--gold)'],[9.25,11.5,'Continuous','var(--up)'],[11.5,13,'Lunch','var(--line2)'],[13,14.5,'Continuous','var(--up)'],[14.5,14.75,'ATC','var(--gold)'],[14.75,15,'Put-through','var(--us)']];
    const X=h=>8+(h-9)/6*184; let g=T(100,16,'A HOSE session (Vietnam time)','text-anchor="middle" '+TB);
    seg.forEach(([a,b,n,c])=>{ g+=`<rect x="${X(a)}" y="30" width="${X(b)-X(a)}" height="20" rx="2" style="fill:${c};fill-opacity:.7"/>`; if(X(b)-X(a)>24) g+=T((X(a)+X(b))/2,43,n,'text-anchor="middle" style="font-size:7px;font-weight:800;fill:var(--bg)"'); });
    [9,11.5,13,14.5].forEach(h=>g+=T(X(h),62,String(h).replace('.5',':30').replace(/^(\d+)$/,'$1:00'),'text-anchor="middle" style="font-size:6.5px"'));
    g+=T(X(9.1),76,'ATO 9:00–9:15','style="font-size:7px;fill:var(--gold)"')+T(X(14.4),76,'ATC 14:30–14:45','text-anchor="end" style="font-size:7px;fill:var(--gold)"');
    g+=T(100,96,'LO: you set the price — best for beginners','text-anchor="middle" '+TB)+T(100,110,'MP: instant fill · ATO/ATC: open/close price','text-anchor="middle" '+TS);
    return sv(g,'Matching periods in a HOSE session'); },
  f:'LO = limit order · MP = market order · ATO/ATC = filled at the opening/closing price',
  pts:['LO (limit): you set the maximum price to buy or the minimum price to sell. If it does not fill, the order waits until the session ends.','ATO/ATC: join the opening (9:00–9:15) or closing (14:30–14:45) call auction; they get priority over LO orders and all fill at one common price.','MP (market order, HOSE): fills immediately at the best available price; easy to get a poor fill when liquidity is thin.','In the US: market, limit, stop (triggers when the price is hit — often used for stop-losses), stop-limit, and time in force DAY or GTC (good till cancelled).','Stop orders cut losses automatically but can fill far from your price when the market moves sharply.'],
  thr:[['Beginners','Use LO with a clear price'],['Must get filled','ATO, ATC or MP — accept the market price'],['Automatic stop-loss (US)','Stop or stop-limit']],
  hook:'<b>Memory tip:</b> LO means “I set the price”, MP means “the market sets the price for me”.',src:'HOSE Trading Regulations; SEC Investor.gov, Types of Orders.'},
 {id:'l3-dca',t:'Dollar-cost averaging (DCA)',d:'Buy the same amount every month, no need to guess tops and bottoms',
  vis:()=>{ const px=[10,8,6.25,8,10,12.5], X=i=>24+i*30, Y=v=>70-v*4.4; let g='';
    px.forEach((p,i)=>{ const sh=1e3/p; g+=`<rect x="${X(i)-9}" y="${100-sh*0.18}" width="18" height="${sh*0.18}" rx="2" style="fill:var(--us);fill-opacity:.6"/>`+T(X(i),98-sh*0.18,Math.round(sh),'text-anchor="middle" style="font-size:6.5px;font-weight:700"'); });
    g+=`<path d="${px.map((p,i)=>(i?'L':'M')+X(i)+' '+Y(p)).join(' ')}" fill="none" style="stroke:var(--gold)" stroke-width="2"/>`+px.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p)}" r="2.6" style="fill:var(--gold)"/>`).join('');
    g+=T(4,12,'Gold: monthly price · Blue: shares bought','style="font-size:6.8px"')+T(100,116,'Lower price → more shares → lower avg cost','text-anchor="middle" '+TB);
    return sv(g,'DCA: a lower price buys more shares'); },
  f:'Average cost = Total amount invested ÷ Total shares bought',
  pts:['DCA (dollar-cost averaging): invest the same amount in the same asset every month, whether the price goes up or down.','Example with 1M VND a month: month 1 at 10,000 buys 100 shares, month 2 at 8,000 buys 125, month 3 at 12,500 buys 80. Average cost = 3M ÷ 305 ≈ 9,836, below the average price of 10,167.','DCA does not guarantee a profit if the asset keeps falling — use it for index funds, ETFs or good businesses.','Research shows that if you already have a lump sum, investing it all at once beats DCA about 2/3 of the time (because markets rise more often than they fall); DCA suits a monthly income and eases the psychological pressure.','Combine it with automation: schedule the transfer and buy on the same day every month.'],
  thr:[['Investing from a monthly salary','DCA is the natural choice'],['Already have a lump sum','All at once usually wins statistically; split it over 3–12 months if you fear buying the top'],['Suitable vehicles','Index ETFs, open-ended funds']],
  hook:'<b>Memory tip:</b> time in the market matters more than timing the market.',src:'Vanguard Research, Dollar-cost averaging just means taking risk later (2012); Malkiel, A Random Walk Down Wall Street.'},
 {id:'l4-3fs',t:'The three financial statements',d:'Income statement, balance sheet, cash flow statement',
  vis:()=>{ let g=arrowDef; const box=(x,y,w,h,c,t1,t2,t3)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" style="fill:var(--s1);stroke:${c}"/>`+T(x+w/2,y+12,t1,`text-anchor="middle" style="font-size:7.4px;font-weight:800;fill:${c}"`)+T(x+w/2,y+24,t2,'text-anchor="middle" style="font-size:6.3px"')+T(x+w/2,y+34,t3,'text-anchor="middle" style="font-size:6.3px;fill:var(--mut)"');
    g+=box(4,10,60,42,'var(--up)','Income stmt','Sales − Costs','= Profit');
    g+=box(70,10,60,42,'var(--us)','Bal. sheet','Assets =','Liab. + Equity');
    g+=box(136,10,60,42,'var(--gold)','Cash flow','Cash in − out','= Ending cash');
    g+=`<path d="M64 31 h5" style="stroke:var(--mut)" marker-end="url(#arL)"/><path d="M135 31 h-4" style="stroke:var(--mut)" marker-end="url(#arL)"/>`;
    g+=T(100,68,'Retained earnings → higher equity','text-anchor="middle" '+TS)+T(100,78,'Ending cash → balance sheet Cash','text-anchor="middle" '+TS);
    g+=T(34,96,'Profitable?','text-anchor="middle" '+TB)+T(100,96,'Owns? Owes?','text-anchor="middle" '+TB)+T(166,96,'Real cash?','text-anchor="middle" '+TB);
    g+=T(100,116,'Profit on paper but no cash = look closer','text-anchor="middle" style="font-size:7px;fill:var(--dn)"');
    return sv(g,'The three financial statements and how they link'); },
  f:'Assets = Liabilities + Equity (always balances)',
  pts:['Income statement: over a period, how much the business sold and how much it earned (revenue → cost of goods sold → gross profit → expenses → net income).','Balance sheet: at a point in time, what the business owns (assets) and where that money came from (liabilities or equity).','Cash flow statement: real cash in and out in three groups — operating, investing, financing. Profit can be “cooked”; cash is much harder to fake.','The three statements connect: retained earnings increase equity; ending cash on the cash flow statement equals the cash line on the balance sheet.','Listed companies in Vietnam publish quarterly statements within 20 days after quarter-end (30 days for parent companies with subsidiaries) and audited annual statements within 90 days.'],
  thr:[['Operating cash flow > Net income','High-quality earnings'],['Receivables and inventory growing faster than revenue','Warning'],['Debt growing faster than equity','Leverage is rising']],
  hook:'<b>Memory tip:</b> the income statement is a “movie”, the balance sheet is a “photo”, the cash flow statement is a “bank statement”.',src:'Vietnamese Accounting Standards VAS 21, VAS 24; Circular 96/2020/TT-BTC; CFA Institute, Financial Reporting and Analysis.'},
 {id:'l4-eps',t:'From profit to EPS and dividends',d:'How much profit each share earns',
  vis:()=>{ let g=arrowDef; g+=`<rect x="8" y="18" width="62" height="40" rx="7" style="fill:var(--s1);stroke:var(--up)"/>`+T(39,32,'Net income','text-anchor="middle" style="font-size:7.5px;font-weight:800;fill:var(--up)"')+T(39,46,'160 bn','text-anchor="middle" style="font-size:10px;font-weight:800"');
    g+=T(82,40,'÷','text-anchor="middle" style="font-size:14px;font-weight:800"');
    g+=`<rect x="94" y="18" width="62" height="40" rx="7" style="fill:var(--s1);stroke:var(--us)"/>`+T(125,32,'Shares out','text-anchor="middle" style="font-size:7.5px;font-weight:800;fill:var(--us)"')+T(125,46,'100M','text-anchor="middle" style="font-size:10px;font-weight:800"');
    g+=T(176,40,'= EPS','text-anchor="middle" style="font-size:8px;font-weight:800;fill:var(--gold)"')+T(176,52,'₫1,600','text-anchor="middle" style="font-size:9px;font-weight:800;fill:var(--gold)"');
    const W=170; g+=`<rect x="15" y="78" width="${W*0.625}" height="16" rx="3" style="fill:var(--up);fill-opacity:.7"/><rect x="${15+W*0.625}" y="78" width="${W*0.375}" height="16" rx="3" style="fill:var(--us);fill-opacity:.6"/>`;
    g+=T(15+W*0.31,89,'Div ₫1,000 (62.5%)','text-anchor="middle" style="font-size:7px;font-weight:800;fill:var(--bg)"')+T(15+W*0.81,89,'Retain ₫600','text-anchor="middle" style="font-size:7px;font-weight:800;fill:var(--bg)"');
    g+=T(100,112,'Retained earnings are reinvested to grow the company','text-anchor="middle" '+TS);
    return sv(g,'EPS and how profit splits into dividends and retained earnings'); },
  f:'EPS = Net income attributable to parent-company shareholders ÷ Weighted average shares outstanding',
  pts:['EPS (earnings per share) tells you how much profit each share you hold “produces” in a year.','Payout ratio = Dividend ÷ EPS. The rest is retained for expansion; sustainable growth ≈ ROE × retention ratio.','Issuing new shares dilutes EPS if profit does not grow in step — that is why the F-Score includes a “no dilution” test.','Cash dividends: you receive cash (with 5% tax withheld in Vietnam). Stock dividends: you get more shares but the price is adjusted down accordingly — total value is unchanged at that moment.','Ex-dividend date (GDKHQ in Vietnam): if you buy on or after this date, you will not receive that dividend.'],
  thr:[['EPS rising steadily for years','A genuinely growing business'],['Payout ratio above 100%','Paying out more than it earns — hard to sustain'],['10% stock dividend','Price adjusts: 100,000 → ≈ 90,909']],
  hook:'<b>Memory tip:</b> a stock dividend is like cutting a cake into more slices — the cake does not get any bigger.',src:'VAS 30 (Earnings per Share); Law on Personal Income Tax; HOSE Listing Regulations.'}
];
NEW_BASIC.forEach(l=>{ l.g='Foundations'; LESSONS.push(l); });

/* ---------- gán cấp độ, sắp xếp lại ---------- */
const LV_OF={}; LEVELS.forEach((L,i)=>L.ids.forEach(id=>LV_OF[id]=i+1));
LESSONS.forEach(l=>{ l.lv=LV_OF[l.id]||8; if(!LV_OF[l.id]) LEVELS[7].ids.push(l.id); });
LESSONS.sort((a,b)=>a.lv-b.lv||LEVELS[a.lv-1].ids.indexOf(a.id)-LEVELS[b.lv-1].ids.indexOf(b.id));
function lessonCrumb(l){ const L=LEVELS[l.lv-1]; const ids=L.ids; return `Level ${l.lv} · ${esc(L.n)} · Lesson ${ids.indexOf(l.id)+1}/${ids.length}`; }

/* ---------- câu hỏi theo cấp ---------- */
const QLV=[6,4,7,5,3,6,2,2,5,1,8,3,7,7,2,8,3,5,2,6,9,9,9,9,9,9,9,9,9,9,9,6,5,5,2,9,9,9];
QUIZ.forEach((q,i)=>{ if(q.lid) q.lv=LV_OF[q.lid]||q.lv; else if(q.lv==null) q.lv= i<QLV.length? QLV[i] : 10; });
QUIZ.forEach(q=>{ if(/ETF/.test(q.q)&&/S&P 500/.test(q.q)) q.lv=3; });
[
 {lv:1,q:'A company has 1 million shares and you buy 1,000 of them. How much of the company do you own?',a:['0.1%','1%','10%','0.01%'],c:0,e:'1,000 ÷ 1,000,000 = 0.1%: you get 0.1% of the profit and 0.1% of the voting rights.'},
 {lv:1,q:'What are the two main sources of return when investing in stocks?',a:['Dividends and price gains','Fixed interest and bonuses','Trading fees and taxes','Dividends only'],c:0,e:'Return = dividends + (sell price − buy price) − taxes and fees.'},
 {lv:1,q:'When a company goes bankrupt, who gets paid last?',a:['Shareholders','Lending banks','Bondholders','Employees'],c:0,e:'Shareholders are the owners and only get what is left after all debts are paid — usually almost nothing.'},
 {lv:1,q:'What sets a stock’s price on the exchange each day?',a:['Supply and demand from buyers and sellers','The listed company','The Securities Commission','The State Bank'],c:0,e:'The matched price is where buyers and sellers meet in the order book.'},
 {lv:1,q:'Where should money you need in the next 6 months go?',a:['Savings or something easy to withdraw and stable','Growth stocks','A 3x leveraged ETF','Covered warrants'],c:0,e:'Stocks can fall 30–50% in the short term; money you will need soon must be kept safe.'},
 {lv:1,q:'10M VND earning 10% a year, reinvested. How much do you have after 2 years?',a:['12.1M','12M','11M','20M'],c:0,e:'10 × 1.1 × 1.1 = 12.1 — in year two you also earn interest on the first year’s interest (compounding).'},
 {lv:2,q:'On HOSE, the reference price is usually?',a:['The previous session’s close','Today’s open','The 52-week high','A price announced by the company'],c:0,e:'Ceiling and floor are calculated from the reference price (±7% on HOSE).'},
 {lv:2,q:'When does an ATC order fill?',a:['In the closing call auction, 14:30–14:45','As soon as it is placed','9:00–9:15','After 15:00'],c:0,e:'ATO fills in the opening auction and ATC in the closing auction, each at a single common price.'},
 {lv:2,q:'On a Vietnamese price board, what does blue mean?',a:['Floor price','Reference price','Ceiling price','Slight rise'],c:0,e:'Purple is ceiling, green is up, yellow is reference, red is down, blue is floor.'},
 {lv:2,q:'How is VN-Index calculated?',a:['Market-cap weighted','Average of stock prices','Advancers minus decliners','Profit weighted'],c:0,e:'Because it is cap-weighted, a few big stocks can move the whole index.'},
 {lv:2,q:'Which order type should beginners prefer?',a:['LO (limit)','MP (market)','Margin order','Short selling'],c:0,e:'An LO lets you control the maximum price you pay.'},
 {lv:3,q:'DCA of 1M a month at prices of 10,000 then 8,000. What is the average cost?',a:['≈ 8,889','9,000','8,000','10,000'],c:0,e:'2M ÷ (100 + 125) = 8,889 — below the 9,000 average price.'},
 {lv:3,q:'The biggest advantage of an index ETF for beginners?',a:['Instant diversification and low fees','Three times the market’s return','Never goes down','Capital is insured'],c:0,e:'One ETF unit holds dozens to hundreds of stocks, and fees can be under 0.1% a year.'},
 {lv:3,q:'A portfolio falls 25%. How much must it rise to break even?',a:['33.3%','25%','20%','50%'],c:0,e:'1 ÷ 0.75 − 1 = 33.3%. The deeper the loss, the longer the way back.'},
 {lv:4,q:'What is the basic accounting equation?',a:['Assets = Liabilities + Equity','Revenue = Profit + Tax','Cash = Profit','Capital = Assets + Debt'],c:0,e:'The balance sheet always balances according to this equation.'},
 {lv:4,q:'Which statement shows the real cash moving in and out of a business?',a:['Cash flow statement','Income statement','Staffing notes','Annual report'],c:0,e:'Profit can be recognized before the cash is collected; cash flow cannot.'},
 {lv:4,q:'A 10% stock dividend is paid when the price is 100,000. The adjusted price is about?',a:['90,909','100,000','110,000','90,000'],c:0,e:'100,000 ÷ 1.1 ≈ 90,909: the share count rises 10% and total value is unchanged.'},
 {lv:6,q:'What does P/B = 0.8 mean?',a:['The market price is below book value per share','The company lost 20%','Profit equals 80% of the price','Debt equals 80% of equity'],c:0,e:'P/B below 1 may mean cheap — or that the market doubts asset quality, or ROE is low.'},
 {lv:6,q:'How does EV/EBITDA differ from P/E?',a:['It includes net debt, so it does not depend on capital structure','It is only used for banks','It does not need profit','It is always smaller than P/E'],c:0,e:'EV = market cap + debt − cash, so you can compare heavily indebted businesses with lightly indebted ones.'},
 {lv:5,q:'An FCF yield of 6% means?',a:['For every ₫100 of price, the business generates ₫6 of free cash flow a year','A 6% dividend','Revenue up 6%','A 6% profit margin'],c:0,e:'FCF yield = FCF ÷ market cap — the inverse of P/FCF.'},
 {lv:6,q:'What is WACC?',a:['The weighted average cost of debt and equity','The savings interest rate','The dividend yield','Return on capital'],c:0,e:'A business creates value only when ROIC exceeds WACC.'},
 {lv:6,q:'In a DCF, raising the cost of capital r (cash flows unchanged) makes intrinsic value?',a:['Fall','Rise','Stay the same','Drop to 0'],c:0,e:'Future cash flows are discounted more heavily; terminal value is especially sensitive to r − g.'},
 {lv:4,q:'Profit of 160 bn VND, 100M shares. EPS is?',a:['₫1,600','₫160','₫16,000','₫1.6'],c:0,e:'160,000,000,000 ÷ 100,000,000 = ₫1,600 per share.'}
].forEach(q=>QUIZ.push(q));

/* ---------- tiến độ ---------- */
function lvState(i){
  const L=LEVELS[i]; const done=L.ids.filter(id=>S.learned.includes(id)).length;
  const passed=(store.lvPass||{})[i+1]; const qn=QUIZ.filter(q=>q.lv===i+1).length;
  return {done,tot:L.ids.length,passed:!!passed,best:passed||0,qn,complete:!!passed||done===L.ids.length};
}
function currentLevel(){ for(let i=0;i<LEVELS.length;i++){ if(!lvState(i).complete) return i+1; } return 10; }

/* ---------- infographic bậc thang 10 cấp ---------- */
function ladderSVG(cur,open){
  const W=360,H=168,p=8, sw=(W-2*p)/10; let g='';
  const tiers=[['Beginner',0,3],['Intermediate',3,6],['Advanced',6,9],['Expert',9,10]];
  tiers.forEach(([t,a,b])=>{ g+=`<rect x="${p+a*sw+1}" y="146" width="${(b-a)*sw-2}" height="4" rx="2" style="fill:${TIER_COL[t]}"/><text x="${p+(a+b)/2*sw}" y="162" text-anchor="middle" style="font-size:9.5px;font-weight:700;fill:${TIER_COL[t]}">${t}</text>`; });
  for(let i=0;i<10;i++){
    const st=lvState(i), h=22+i*10.5, x=p+i*sw, y=140-h;
    const isCur=i+1===cur, isOpen=i+1===open;
    const fill= st.complete?'var(--gold)':'var(--s1)';
    g+=`<g data-lv="${i+1}" style="cursor:pointer" role="button" aria-label="Level ${i+1}: ${esc(LEVELS[i].n)}${st.complete?', completed':''}">`;
    g+=`<rect x="${x+2}" y="${y}" width="${sw-4}" height="${h}" rx="5" style="fill:${fill};stroke:${isOpen?'var(--fg)':isCur?'var(--gold)':'var(--line2)'}" stroke-width="${isOpen||isCur?2:1}"/>`;
    const pr=st.tot?st.done/st.tot:0; if(!st.complete&&pr>0) g+=`<rect x="${x+4}" y="${y+h-4-(h-8)*pr}" width="${sw-8}" height="${(h-8)*pr}" rx="3" style="fill:var(--gold);fill-opacity:.35"/>`;
    g+=`<text x="${x+sw/2}" y="${y+16}" text-anchor="middle" style="font-family:var(--f-disp);font-size:13px;font-weight:800;fill:${st.complete?'var(--gold-ink)':'var(--fg)'}">${i+1}</text>`;
    if(st.passed) g+=`<text x="${x+sw/2}" y="${y+28}" text-anchor="middle" style="font-size:9px;fill:var(--gold-ink)">✓</text>`;
    if(isCur) g+=`<g transform="translate(${x+sw/2} ${y-6})"><line x1="0" y1="0" x2="0" y2="-16" style="stroke:var(--fg)" stroke-width="1.4"/><path d="M0 -16 L12 -12 L0 -8z" style="fill:var(--dn)"/></g>`;
    g+='</g>';
  }
  return `<svg class="chart ladder" viewBox="0 0 ${W} ${H}" role="img" aria-label="10-level roadmap, you are at level ${cur}">${g}</svg>`;
}
function lcardHTML(l){ return `<button class="lcard" data-lesson="${l.id}"><span class="th">${l.vis()}${S.learned.includes(l.id)?'<span class="done" aria-label="Learned"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg></span>':''}</span><span class="tx"><b>${esc(l.t)}</b><span>${esc(l.d)}</span></span></button>`; }

RENDER.learn=function(){
  const el=$('#v-learn'); const cur=currentLevel(); if(!S.lvOpen) S.lvOpen=cur;
  const open=S.lvOpen, L=LEVELS[open-1], st=lvState(open-1);
  const doneAll=S.learned.filter(id=>LESSONS.some(l=>l.id===id)).length;
  const leit=store.leit||{}; const boxes=[0,0,0,0,0]; QUIZ.forEach((_,i)=>{ boxes[clamp((leit[i]||1)-1,0,4)]++; });
  const lessons=L.ids.map(id=>LESSONS.find(l=>l.id===id)).filter(Boolean);
  el.innerHTML=`<div class="sec-h" style="margin:0"><div><h2>Investing academy</h2><p>10 levels · ${LESSONS.length} illustrated lessons · ${QUIZ.length} questions · level 1 is for complete beginners</p></div></div>
  <section class="panel lv-hero">
    <div class="lv-hero-top"><div><span class="mut" style="font-size:12px;letter-spacing:.06em;text-transform:uppercase">You are at</span><b>Level ${cur} · ${esc(LEVELS[cur-1].n)}</b><span class="note">${doneAll}/${LESSONS.length} lessons learned · ${Object.keys(store.lvPass||{}).length}/10 level tests passed</span></div>
      <button class="btn pri" data-lvgo="${cur}">${S.lvOpen===cur?'Continue':'Back to level '+cur}</button></div>
    ${ladderSVG(cur,open)}
    <p class="note">Tap a step to open that level. Gold steps: every lesson learned or the level test passed (4/5). Flag: the level to study next.</p>
  </section>
  <section class="panel lv-detail" id="lvDetail" aria-labelledby="lvTitle">
    <div class="lv-head"><span class="lv-num" style="background:${TIER_COL[L.tier]}">${open}</span><div><span class="mut" style="font-size:12px;font-weight:700;color:${TIER_COL[L.tier]}">${esc(L.tier.toUpperCase())}</span><h2 id="lvTitle">${esc(L.n)}</h2><p class="note" style="margin:0">${esc(L.d)}</p></div></div>
    <div class="lv-goal"><b>After this level you will</b><ul>${L.goal.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="lv-prog"><div class="progress"><i style="width:${st.tot?st.done/st.tot*100:0}%"></i></div><span>${st.done}/${st.tot} lessons${st.passed?` · test passed (${st.best}/5)`:''}</span></div>
    <div class="learn-grid">${lessons.map(lcardHTML).join('')}</div>
    ${L.extra==='cdl'?'<div class="row-btns" style="margin-top:12px"><button class="btn" data-lesson="cdl-library">Library of 34 candlestick patterns</button><button class="btn" id="goCpat">15 classic chart patterns</button></div>':''}
    <div class="row-btns" style="margin-top:14px">
      <button class="btn pri" id="lvQuiz"${st.qn<3?' disabled':''}>Level ${open} test · 5 questions</button>
      ${open>1?`<button class="btn" data-lvgo="${open-1}">← Level ${open-1}</button>`:''}${open<10?`<button class="btn" data-lvgo="${open+1}">Level ${open+1} →</button>`:''}
    </div>
  </section>
  <section><div class="sec-h"><h2 style="font-size:18px">All 10 levels</h2></div>
    <div class="lv-list">${LEVELS.map((x,i)=>{ const s=lvState(i); return `<button class="lv-row${i+1===open?' on':''}" data-lvgo="${i+1}"><span class="lv-num sm" style="background:${s.complete?'var(--gold)':TIER_COL[x.tier]};${s.complete?'color:var(--gold-ink)':''}">${s.complete?'✓':i+1}</span><span class="lv-txt"><b>${esc(x.n)}</b><span>${esc(x.d)}</span></span><span class="lv-meta"><i style="--p:${s.tot?s.done/s.tot*100:0}%"></i>${s.done}/${s.tot}</span></button>`; }).join('')}</div>
  </section>
  <section class="panel" style="display:flex;flex-direction:column;gap:12px">
    <div class="sec-h" style="margin:0"><div><h2 style="font-size:17px">Spaced review</h2><p>Mixed questions from every unlocked level · best ${S.quizBest}/8</p></div><button class="btn sm" id="startQuiz">Review 8 questions</button></div>
    <div style="display:flex;gap:4px;align-items:flex-end;min-height:34px" aria-label="Leitner box distribution">${boxes.map((n,i)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><i style="display:block;width:18px;height:${4+Math.min(26,n*.6)}px;border-radius:3px;background:var(--gold);opacity:${.35+i*.16}"></i><span style="font-size:10px" class="mut">${i+1}</span></div>`).join('')}<p class="note" style="margin-left:10px">Leitner boxes: answer correctly and the question moves up a box and shows up less often; answer wrong and it goes back to box 1.</p></div>
  </section>
  <div class="sec-h" style="margin:4px 0 0"><div><h2 style="font-size:18px">Reference library</h2><p>Candlestick and chart patterns for level 9, available anytime</p></div></div>`;
  $$('[data-lvgo]',el).forEach(b=>b.onclick=()=>{ S.lvOpen=+b.dataset.lvgo; RENDER.learn(); const d=$('#lvDetail'); if(d) d.scrollIntoView({block:'start',behavior:REDUCED()?'auto':'smooth'}); });
  $$('.ladder [data-lv]',el).forEach(g=>g.addEventListener('click',()=>{ S.lvOpen=+g.dataset.lv; RENDER.learn(); }));
  $('#lvQuiz').onclick=()=>startLevelQuiz(open);
  $('#startQuiz').onclick=startQuiz;
  const gc=$('#goCpat'); if(gc) gc.onclick=()=>{ const c=$('#cpatLib'); if(c) c.scrollIntoView({block:'start'}); };
  appendLibs();
  if(HAS_GSAP()&&!REDUCED()){ gsap.from('.ladder [data-lv] rect',{scaleY:0,transformOrigin:'50% 100%',duration:.6,stagger:.04,ease:'power2.out'}); }
};
/* ôn tập chung chỉ lấy câu của các cấp đã mở (≤ cấp hiện tại + 1) */
const _pickBase=pickQuestions;
pickQuestions=function(n){ const cap=Math.min(10,currentLevel()+1); const pool=QUIZ.map((q,i)=>i).filter(i=>(QUIZ[i].lv||10)<=cap); if(pool.length<n) return _pickBase(n);
  const leit=store.leit||{}; const w=pool.map(i=>({i,r:Math.random()/(leit[i]||1)})); w.sort((a,b)=>b.r-a.r); return w.slice(0,n).map(x=>x.i); };
function startLevelQuiz(lv){
  const pool=QUIZ.map((q,i)=>i).filter(i=>QUIZ[i].lv===lv);
  const qs=shuffle(pool).slice(0,5); const st={k:0,score:0,qs};
  const render=()=>{
    if(st.k>=st.qs.length){
      const pass=st.score>=Math.ceil(st.qs.length*.8); const lp=store.lvPass||{};
      if(pass&&(!lp[lv]||st.score>lp[lv])){ lp[lv]=st.score; store.lvPass=lp; persist(); }
      $('#sheetBody').innerHTML=`<div class="lesson" style="text-align:center;align-items:center"><div class="bigring" style="margin:10px auto">${ringSVG(st.score/st.qs.length*100,108,9)}<div class="v"><b>${st.score}/${st.qs.length}</b><span>correct</span></div></div>
        <h3>${pass?`Level ${lv} passed!`:`Level ${lv} not passed yet`}</h3><p>${pass?(lv<10?`Level ${lv+1} — ${esc(LEVELS[lv].n)} — is ready for you.`:'You have completed all 10 levels.'):'You need 4/5 correct. Review this level’s lessons and try again.'}</p>
        <div class="row-btns" style="justify-content:center">${pass&&lv<10?`<button class="btn pri" id="lqNext">Go to level ${lv+1}</button>`:`<button class="btn pri" id="lqAgain">Try again</button>`}<button class="btn" id="lqClose">Close</button></div></div>`;
      animateRings($('#sheetBody'));
      const nx=$('#lqNext'); if(nx) nx.onclick=()=>{ closeSheet(); S.lvOpen=lv+1; if(S.view==='learn') RENDER.learn(); };
      const ag=$('#lqAgain'); if(ag) ag.onclick=()=>startLevelQuiz(lv);
      $('#lqClose').onclick=()=>{ closeSheet(); if(S.view==='learn') RENDER.learn(); };
      if(pass&&HAS_GSAP()&&!REDUCED()) gsap.from('#sheetBody h3',{scale:.6,opacity:0,duration:.5,ease:'back.out(2)'});
      return; }
    const qi=st.qs[st.k], Q=QUIZ[qi]; const order=shuffle(Q.a.map((t,i)=>({t,i})));
    $('#sheetBody').innerHTML=`<div class="lesson"><div style="display:flex;justify-content:space-between;align-items:center"><span class="note">Level ${lv} · Question ${st.k+1}/${st.qs.length}</span><span class="note">Correct: ${st.score}</span></div>
      <div class="progress"><i style="width:${st.k/st.qs.length*100}%"></i></div>
      <h3 style="font-size:19px;line-height:1.3">${esc(Q.q)}</h3>
      <div style="display:flex;flex-direction:column;gap:8px" id="qOpts">${order.map(o=>`<button class="quiz-opt" data-i="${o.i}">${esc(o.t)}</button>`).join('')}</div>
      <div id="qFb"></div></div>`;
    let answered=false;
    $$('#qOpts .quiz-opt').forEach(b=>b.onclick=()=>{ if(answered) return; answered=true; const ok=+b.dataset.i===Q.c;
      $$('#qOpts .quiz-opt').forEach(x=>{ if(+x.dataset.i===Q.c) x.classList.add('ok'); x.disabled=true; }); if(!ok) b.classList.add('bad');
      const leit=store.leit||{}; leit[qi]= ok? Math.min(5,(leit[qi]||1)+1) : 1; store.leit=leit; persist(); if(ok) st.score++;
      $('#qFb').innerHTML=`<div class="hook" style="border-color:${ok?'var(--up)':'var(--dn)'}"><b style="color:${ok?'var(--up)':'var(--dn)'}">${ok?'Correct.':'Not quite.'}</b> ${esc(Q.e)}</div><div class="row-btns" style="margin-top:10px"><button class="btn pri" id="qNext">${st.k+1<st.qs.length?'Next question':'See results'}</button></div>`;
      $('#qNext').onclick=()=>{ st.k++; render(); }; $('#qNext').focus({preventScroll:true}); });
  };
  openSheet(`Level ${lv} test · ${LEVELS[lv-1].n}`,'',()=>render());
}
/* nút “Bài tiếp” trong bài học: sang cấp kế tiếp khi hết cấp */
const _openLessonLv=openLesson;
openLesson=function(id){ _openLessonLv(id); const l=LESSONS.find(x=>x.id===id); if(!l) return;
  const ids=LEVELS[l.lv-1].ids; const last=ids.indexOf(l.id)===ids.length-1; const nb=$('#lNext');
  if(nb&&last){ nb.textContent=l.lv<10?`Level ${l.lv} test`:'Level 10 test'; nb.onclick=()=>startLevelQuiz(l.lv); }
  if(S.view==='learn') S.lvOpen=l.lv; };

/* ---------- phần tương tác của bài mở rộng ---------- */
const _openLessonX=openLesson;
openLesson=function(id){
  _openLessonX(id); const l=LESSONS.find(x=>x.id===id); if(!l) return;
  const fm=$('#sheetBody .formula'); if(!fm) return;
  const box=document.createElement('div'); box.style.cssText='display:flex;flex-direction:column;gap:12px';
  if(l.interactive==='fv'){
    box.innerHTML=`<section class="panel" style="display:flex;flex-direction:column;gap:10px"><b style="font-family:var(--f-disp)">Wealth-building plan calculator</b>
      <label class="slider-row"><span>Monthly contribution</span><input type="range" id="fvM" min="1" max="50" step="1" value="5"><output id="fvMo"></output></label>
      <label class="slider-row"><span>Years</span><input type="range" id="fvN" min="1" max="40" step="1" value="20"><output id="fvNo"></output></label>
      <label class="slider-row"><span>Return per year</span><input type="range" id="fvR" min="0" max="15" step="0.5" value="8"><output id="fvRo"></output></label>
      <label class="slider-row"><span>Inflation per year</span><input type="range" id="fvI" min="0" max="8" step="0.5" value="3.5"><output id="fvIo"></output></label>
      <div class="result" id="fvOut"></div><div id="fvChart"></div>
      <p class="note">Assumes the same return every year and contributions at the end of each month; real markets rise and fall unpredictably. Results are for planning only, not a forecast.</p></section>`;
    fm.after(box);
    const up=()=>{ const m=+$('#fvM').value, n=+$('#fvN').value, R=+$('#fvR').value, I=+$('#fvI').value;
      $('#fvMo').textContent=m+'M'; $('#fvNo').textContent=n+' yrs'; $('#fvRo').textContent=fmt(R,1)+'%'; $('#fvIo').textContent=fmt(I,1)+'%';
      const r=Math.pow(1+R/100,1/12)-1; const fvAt=k=>r? m*((Math.pow(1+r,k)-1)/r) : m*k;
      const fv=fvAt(n*12), ct=m*n*12, real=fv/Math.pow(1+I/100,n), pass=real*0.04/12;
      const ty=v=>v>=1000? fmt(v/1000,2)+' bn' : fmt(v,0)+'M';
      $('#fvOut').innerHTML=`<div><b class="gold">${ty(fv)}</b><span>Value after ${n} years</span></div><div><b>${ty(ct)}</b><span>Your contributions</span></div><div><b class="up">${ty(Math.max(0,fv-ct))}</b><span>Earned by compounding</span></div><div><b>${ty(real)}</b><span>In today’s money</span></div><div><b>${ty(pass)}/month</b><span>Passive income (4% withdrawal, today’s money)</span></div>`;
      const W=340,H=140,p={l:36,r:8,t:8,b:20}; const X=y=>p.l+y/n*(W-p.l-p.r), Y=v=>H-p.b-v/(fv||1)*(H-p.t-p.b);
      let a='',b=''; for(let y=0;y<=n;y++){ a+=(y?'L':'M')+X(y).toFixed(1)+' '+Y(fvAt(y*12)).toFixed(1); b+=(y?'L':'M')+X(y).toFixed(1)+' '+Y(m*12*y).toFixed(1); }
      let g=`<path d="${a} L${X(n)} ${Y(0)} L${X(0)} ${Y(0)}Z" style="fill:var(--up);fill-opacity:.3"/><path d="${b} L${X(n)} ${Y(0)} L${X(0)} ${Y(0)}Z" style="fill:var(--us);fill-opacity:.5"/><line class="axis" x1="${p.l}" x2="${W-p.r}" y1="${Y(0)}" y2="${Y(0)}"/>`;
      [0,.5,1].forEach(k=>g+=`<text x="${p.l-4}" y="${Y(fv*k)+3}" text-anchor="end">${ty(fv*k)}</text>`); [0,Math.round(n/2),n].forEach(y=>g+=`<text x="${X(y)}" y="${H-5}" text-anchor="middle">year ${y}</text>`);
      $('#fvChart').innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Wealth growth by year">${g}</svg><div class="legend"><span><i style="background:var(--us)"></i>Contributions</span><span><i style="background:var(--up)"></i>Total value (incl. compounding)</span></div>`; };
    ['fvM','fvN','fvR','fvI'].forEach(i=>$('#'+i).oninput=up); up();
  }
  if(l.interactive==='practice'){
    const rows=[['Revenue',1000,1200,1500],['Gross profit',300,348,405],['Net income',100,130,180],['Operating cash flow (CFO)',110,60,-20],['Trade receivables',150,260,450],['Inventory',200,230,260],['Debt',200,300,520],['Equity',800,900,1050]];
    const qa=[['How fast is revenue growing each year?','2024: +20% (1,200 ÷ 1,000), 2025: +25% (1,500 ÷ 1,200). Growth is accelerating.'],
      ['What is happening to gross margin?','30% → 29% → 27%. The margin is shrinking even as revenue grows: the company may be cutting prices, or input costs are rising, to push sales.'],
      ['Net income rose 80% in 2 years. Did operating cash flow keep up?','No: CFO fell from 110 to 60 and then to −20. Profit is not turning into cash. CFO ÷ net income: 1.1 → 0.46 → −0.11.'],
      ['Where is the cash stuck?','Receivables tripled (150 → 450) while revenue grew only 50%. Days to collect rose from ≈ 55 days to ≈ 110 days: the company is selling more on credit to boost revenue.'],
      ['How does the company cover the cash shortfall?','Debt rose 200 → 520. Debt ÷ equity went from 0.25 to ≈ 0.50.'],
      ['Conclusion?','“Hot” but low-quality growth: 3 red flags (negative CFO despite profits, soaring receivables, sharply rising debt). By this level’s rules: reject it, or reconsider only once cash flow improves.']];
    box.innerHTML=`<section class="panel" style="display:flex;flex-direction:column;gap:10px"><b style="font-family:var(--f-disp)">Golden Lotus JSC — hypothetical figures (bn VND)</b>
      <div class="scroll-x"><table class="thr"><thead><tr><th>Line item</th><th>2023</th><th>2024</th><th>2025</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r[0])}</td>${r.slice(1).map(v=>`<td style="text-align:right;${v<0?'color:var(--dn);font-weight:700':''}">${fmt(v,0)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="note">Answer each question yourself before opening the answer — you will remember it far longer than if you read the solution right away.</p>
      ${qa.map(([q,a],i)=>`<details class="acc"><summary>${i+1}. ${esc(q)}</summary><div class="acc-b"><p style="font-size:14px">${esc(a)}</p></div></details>`).join('')}</section>`;
    fm.after(box);
  }
  if(l.act==='screen'||l.act==='styles'){
    const ps= l.act==='styles'? [['value','Value'],['garp','GARP'],['growth','Growth'],['income','Dividend'],['quality','Quality']] : [['balanced','Open the Compass screener']];
    box.innerHTML=`<section class="panel" style="display:flex;flex-direction:column;gap:8px"><b style="font-family:var(--f-disp)">Apply it now in the app</b><div class="row-btns">${ps.map(([k,n])=>`<button class="btn sm" data-lpreset="${k}">${esc(n)}</button>`).join('')}</div><p class="note">The screener ranks every stock by the weight set you choose; use it as a first screening step, not a buy list.</p></section>`;
    fm.after(box);
    $$('[data-lpreset]',box).forEach(b=>b.onclick=()=>{ S.preset=b.dataset.lpreset; S.scrMode='stock'; S.filters.sort='score'; S.listN=60; saveState(); computeAll(); closeSheet(); setView('screen'); toast('Applied weight set '+(PRESETS[S.preset]?PRESETS[S.preset].n:'')); });
  }
};
