/* ============================================================
   LỘ TRÌNH 10 CẤP ĐỘ — từ người chưa biết gì đến chuyên gia
   ============================================================ */
const LEVELS=[
 {n:'Nhập môn',tier:'Người mới',d:'Chưa biết gì? Bắt đầu ở đây.',goal:['Hiểu cổ phiếu là một phần sở hữu doanh nghiệp','Biết giá hình thành từ người mua và người bán','Cân nhắc lợi nhuận đi kèm rủi ro, sức mạnh của lãi kép','Biết các bước mở tài khoản và đặt lệnh đầu tiên'],
  ids:['l1-stock','l1-market','l1-risk','compound','l1-start']},
 {n:'Đọc thị trường',tier:'Người mới',d:'Bảng điện, chỉ số, lệnh, luật chơi và chi phí.',goal:['Đọc được từng cột trên bảng điện','Phân biệt VN-Index, VN30, S&P 500','Chọn đúng loại lệnh LO, ATO, ATC, MP','Nắm biên độ, giờ giao dịch, thuế phí, nâng hạng thị trường'],
  ids:['l2-board','l2-index','l2-orders','rules','hours','costs','upgrade']},
 {n:'Đầu tư an toàn',tier:'Người mới',d:'Hiểu mình, hiểu lạm phát, đa dạng hóa, tránh bẫy tâm lý.',goal:['Xác định mục tiêu và khẩu vị rủi ro của mình','Hiểu lạm phát và lợi nhuận thực','Dùng ETF, đa dạng hóa, đầu tư định kỳ','Nhận ra các thiên kiến khiến người mới thua lỗ'],
  ids:['l3-profile','l3-inflation','etf-basics','divers','l3-dca','drawdown','bias','etf-pick']},
 {n:'Đọc báo cáo tài chính',tier:'Trung cấp',d:'Cân đối kế toán, kết quả kinh doanh, chỉ số, thuyết minh, kiểm toán.',goal:['Đọc từng khoản mục trên bảng cân đối kế toán','Tách lợi nhuận cốt lõi khỏi lợi nhuận một lần','Tính và đọc bộ chỉ số thanh khoản, đòn bẩy, hiệu quả, sinh lời','Đọc ý kiến kiểm toán và thuyết minh'],
  ids:['l4-3fs','l4-bs','l4-is','l4-eps','margin','l4-ratios','dupont','l4-notes']},
 {n:'Dòng tiền & sức khỏe tài chính',tier:'Trung cấp',d:'Ba dòng tiền, capex, chất lượng lợi nhuận, cờ đỏ, bài thực hành.',goal:['Đọc ba dòng tiền và nhận ra pha vòng đời','Tính FCF và lợi nhuận chủ sở hữu','Đánh giá chất lượng lợi nhuận, F-Score, Z-Score, M-Score','Tự đọc một bộ BCTC trong 15 phút'],
  ids:['l5-cf3','fcf','l5-capex','ccc','l5-quality','piotroski','altman','beneish','l5-redflags','l5-practice']},
 {n:'Định giá',tier:'Trung cấp',d:'Bội số, mô hình Graham, chiết khấu cổ tức và dòng tiền.',goal:['Dùng P/E, P/B, EV/EBITDA, PEG đúng chỗ','Hai phép thử của Graham','Hiểu chi phí vốn WACC','Dựng DCF và định giá ngược'],
  ids:['pe','pb','ev','peg','graham','ddm','wacc','dcf','rdcf']},
 {n:'Chọn cổ phiếu',tier:'Nâng cao',d:'Quy trình 5 bước, ngành, hào kinh tế, lãnh đạo, phong cách, luận điểm.',goal:['Áp dụng quy trình chọn cổ phiếu 5 bước','Phân tích ngành, hào kinh tế, ROIC, lãnh đạo','Đọc BCTC đặc thù ngân hàng, bất động sản, bán lẻ','Viết luận điểm đầu tư và biết khi nào bán'],
  ids:['l7-process','l7-industry','moat','roic','l7-mgmt','bank','l7-sector','l7-styles','l7-thesis','earnings']},
 {n:'Danh mục & tích sản',tier:'Nâng cao',d:'Kế hoạch tích sản, phân bổ, tái cân bằng, cổ tức, tự do tài chính.',goal:['Lập kế hoạch tích sản bằng máy tính lãi kép','Phân bổ tài sản và tái cân bằng','Tích sản bằng cổ tức','Tính tài sản mục tiêu cho tự do tài chính, quản trị rủi ro danh mục'],
  ids:['l8-plan','l8-alloc','l8-rebal','l8-dividend','l8-fire','cycle','capm','frontier','sizing','famafrench','emh']},
 {n:'Phân tích kỹ thuật',tier:'Nâng cao',d:'Nến, xu hướng, chỉ báo, cắt lỗ — công cụ chọn điểm mua bán.',goal:['Đọc cây nến, mẫu nến, mô hình giá','Xu hướng, hỗ trợ, kháng cự','MA, RSI, MACD, Bollinger, Ichimoku, Fibonacci','Cắt lỗ theo ATR, hiểu rủi ro margin'],
  ids:['candle-anatomy','dow','sr','ma','volume-l','rsi-l','macd-l','bb-l','stoch-l','fibo','ichimoku-l','elliott','atr-l','margin-trade'],extra:'cdl'},
 {n:'Phái sinh & đòn bẩy',tier:'Chuyên gia',d:'Quyền chọn, Greeks, chiến lược, ETF đòn bẩy và đảo chiều.',goal:['Định giá quyền chọn Black–Scholes','Quản lý Greeks và IV','Dựng chiến lược spread, condor, collar','Hiểu hao mòn của ETF đòn bẩy'],
  ids:['opt-basics','opt-money','opt-payoff','opt-bs','opt-parity','opt-delta','opt-theta','opt-iv','opt-smile','opt-income','opt-hedge','opt-vertical','opt-straddle','opt-condor','opt-calendar','opt-risk','opt-vn','etf-decay','etf-pairs']}
];
const TIER_COL={'Người mới':'var(--up)','Trung cấp':'var(--us)','Nâng cao':'var(--gold)','Chuyên gia':'var(--dn)'};

/* ---------- bài học mới cho cấp 1–4 (infographic tự vẽ) ---------- */
const arrowDef='<defs><marker id="arL" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L8 4L0 8z" style="fill:var(--mut)"/></marker></defs>';
const NEW_BASIC=[
 {id:'l1-stock',t:'Cổ phiếu là gì?',d:'Sở hữu một miếng của doanh nghiệp',
  vis:()=>{ let g=arrowDef; for(let i=0;i<10;i++){ const x=14+(i%5)*20, y=26+Math.floor(i/5)*24; g+=`<rect x="${x}" y="${y}" width="18" height="22" rx="3" style="fill:${i===3?'var(--gold)':'var(--s1)'};stroke:var(--line2)"/>`; }
    g+=T(63,20,'Công ty Phở ABC = 10 phần','text-anchor="middle" '+TB)+T(63,90,'Bạn giữ 1 phần = 10%','text-anchor="middle" style="font-size:8.5px;font-weight:800;fill:var(--gold)"');
    g+=`<path d="M118 40 h18" style="stroke:var(--mut)" marker-end="url(#arL)"/><path d="M118 66 h18" style="stroke:var(--mut)" marker-end="url(#arL)"/>`;
    g+=`<rect x="138" y="28" width="58" height="24" rx="6" style="fill:var(--s1);stroke:var(--up)"/>`+T(167,38,'Cổ tức','text-anchor="middle" style="font-size:8.5px;font-weight:800;fill:var(--up)"')+T(167,47,'chia lợi nhuận','text-anchor="middle" '+TS);
    g+=`<rect x="138" y="56" width="58" height="24" rx="6" style="fill:var(--s1);stroke:var(--us)"/>`+T(167,66,'Giá tăng','text-anchor="middle" style="font-size:8.5px;font-weight:800;fill:var(--us)"')+T(167,75,'công ty lớn lên','text-anchor="middle" '+TS);
    g+=T(100,112,'Lãi = cổ tức + (giá bán − giá mua)','text-anchor="middle" '+TB);
    return sv(g,'Cổ phiếu là một phần sở hữu công ty, sinh lời bằng cổ tức và tăng giá'); },
  f:'Lợi nhuận của bạn = Cổ tức nhận được + (Giá bán − Giá mua) − Thuế, phí',
  pts:['Một công ty chia vốn thành nhiều phần bằng nhau gọi là cổ phần. Mỗi cổ phiếu là một phần nhỏ quyền sở hữu công ty đó.','Ví dụ: công ty có 1 triệu cổ phiếu, bạn mua 1.000 cổ phiếu, bạn sở hữu 0,1% — hưởng 0,1% lợi nhuận và có 0,1% phiếu biểu quyết ở đại hội cổ đông.','Hai cách kiếm tiền: cổ tức (công ty chia lợi nhuận bằng tiền hoặc bằng cổ phiếu) và lãi vốn (bán cao hơn giá mua).','Rủi ro: công ty làm ăn kém thì giá giảm; nếu phá sản, cổ đông được trả sau cùng, sau chủ nợ, nên thường mất gần hết.','Cổ phiếu niêm yết được mua bán hằng ngày trên sàn: HOSE, HNX ở Việt Nam; NYSE, Nasdaq ở Mỹ.'],
  thr:[['Cổ đông','Chủ sở hữu: hưởng lãi, chịu lỗ, không có lãi suất cố định'],['Người mua trái phiếu','Chủ nợ: nhận lãi cố định, được trả trước cổ đông'],['Người gửi tiết kiệm','Cho ngân hàng vay, lãi cố định, rủi ro thấp nhất']],
  hook:'<b>Mẹo nhớ:</b> mua cổ phiếu là mua một miếng của cả cái bánh, không phải mua một tờ giấy may mắn.',src:'Ủy ban Chứng khoán Nhà nước, Cẩm nang nhà đầu tư; SEC, Saving and Investing: A Roadmap to Your Financial Security.'},
 {id:'l1-market',t:'Sàn giao dịch và giá cả',d:'Giá do người mua và người bán gặp nhau',
  vis:()=>{ let g=''; const bid=[[49.9,32],[49.8,46],[49.7,24]], ask=[[50.0,28],[50.1,40],[50.2,18]];
    g+=T(48,14,'Người muốn MUA','text-anchor="middle" style="font-size:8.5px;font-weight:800;fill:var(--up)"')+T(152,14,'Người muốn BÁN','text-anchor="middle" style="font-size:8.5px;font-weight:800;fill:var(--dn)"');
    bid.forEach(([p,w],i)=>{ g+=`<rect x="${86-w}" y="${22+i*18}" width="${w}" height="13" rx="2" style="fill:var(--up);fill-opacity:.55"/>`+T(14,32+i*18,fmt(p,1),'style="font-size:8.5px;font-weight:700"'); });
    ask.forEach(([p,w],i)=>{ g+=`<rect x="114" y="${22+i*18}" width="${w}" height="13" rx="2" style="fill:var(--dn);fill-opacity:.55"/>`+T(186,32+i*18,fmt(p,1),'text-anchor="end" style="font-size:8.5px;font-weight:700"'); });
    g+=`<circle cx="100" cy="28" r="11" style="fill:var(--gold)"/>`+T(100,31,'Khớp','text-anchor="middle" style="font-size:7px;font-weight:800;fill:var(--gold-ink)"');
    g+=T(100,90,'Nhiều người mua hơn → giá đi lên','text-anchor="middle" '+TB)+T(100,104,'Nhiều người bán hơn → giá đi xuống','text-anchor="middle" '+TB)+T(100,118,'Độ dài thanh = khối lượng đặt chờ','text-anchor="middle" '+TS);
    return sv(g,'Sổ lệnh: người mua và người bán gặp nhau tại giá khớp'); },
  f:'Giá khớp = mức giá người mua chấp nhận trả gặp mức giá người bán chấp nhận bán',
  pts:['Sàn chứng khoán là “chợ” có tổ chức. Bạn không mua trực tiếp từ công ty mà mua của nhà đầu tư khác, qua công ty chứng khoán làm môi giới.','Mọi lệnh được xếp vào sổ lệnh: ưu tiên giá tốt hơn trước, cùng giá thì ai đặt trước khớp trước.','Tin tốt (lợi nhuận tăng, hợp đồng lớn) làm nhiều người muốn mua → giá lên; tin xấu ngược lại. Giá hôm nay phản ánh kỳ vọng tương lai, không phải chỉ kết quả quá khứ.','Thanh khoản là mức dễ mua bán: cổ phiếu khớp hàng triệu đơn vị mỗi ngày dễ thoát hơn cổ phiếu chỉ khớp vài nghìn.','Vốn hóa = giá × số cổ phiếu lưu hành — thước đo “công ty to cỡ nào” trong mắt thị trường.'],
  thr:[['Giá tham chiếu (VN)','Giá đóng cửa phiên trước, mốc tính trần/sàn'],['Thanh khoản','Khối lượng khớp lớn = dễ mua bán'],['Vốn hóa','Giá × số cổ phiếu lưu hành']],
  hook:'<b>Mẹo nhớ:</b> công ty không quyết định giá cổ phiếu mỗi ngày — hàng nghìn người mua bán quyết định.',src:'Quy chế giao dịch chứng khoán HOSE; Nasdaq, How the Stock Market Works.'},
 {id:'l1-risk',t:'Lợi nhuận đi kèm rủi ro',d:'Không có bữa trưa miễn phí',
  vis:()=>{ const X=i=>30+i*48, Y=v=>58-v*0.44; let g=`<line class="grid-l" x1="14" x2="196" y1="${Y(0)}" y2="${Y(0)}"/>`+T(12,Y(0)+3,'0%','text-anchor="end" style="font-size:7px"');
    const rows=[['Tiết kiệm','4–6%/năm',5,4,6,'var(--mut)'],['Trái phiếu','5–8%',6.5,-5,15,'var(--us)'],['Cổ phiếu Mỹ','≈10%',10,-37,38,'var(--up)'],['VN-Index','biến động mạnh',12,-66,144,'var(--gold)']];
    rows.forEach(([n,a,avg,lo,hi,c],i)=>{ const x=X(i); const yl=Y(Math.max(lo,-70)), yh=Y(Math.min(hi,80));
      g+=`<line x1="${x}" x2="${x}" y1="${yh}" y2="${yl}" style="stroke:${c}" stroke-width="5" stroke-linecap="round" stroke-opacity=".35"/><circle cx="${x}" cy="${Y(avg)}" r="4" style="fill:${c}"/>`;
      g+=T(x,104,n,'text-anchor="middle" style="font-size:8px;font-weight:800"')+T(x,114,a,'text-anchor="middle" '+TS); });
    g+=T(4,9,'Thanh mờ: năm tốt nhất ↔ tệ nhất · Chấm: bình quân dài hạn','style="font-size:6.6px"')+T(X(3)-6,Y(80)+6,'+144%','text-anchor="end" style="font-size:7px;fill:var(--gold)"')+T(X(3)-6,Y(-66)+2,'−66%','text-anchor="end" style="font-size:7px;fill:var(--dn)"');
    return sv(g,'Lợi nhuận bình quân và biên độ năm tốt nhất, tệ nhất của các kênh đầu tư'); },
  f:'Lợi nhuận kỳ vọng cao hơn ⇄ biến động lớn hơn và khả năng lỗ trong ngắn hạn cao hơn',
  pts:['Không có kênh nào vừa lãi cao vừa không rủi ro. Cổ phiếu có lợi nhuận dài hạn cao nhất trong các kênh phổ biến chính vì giá dao động mạnh.','Cổ phiếu Mỹ (S&P 500, gồm cổ tức) bình quân khoảng 10%/năm từ 1928, nhưng có năm giảm 37% (2008) và có năm tăng 38%.','VN-Index biến động còn mạnh hơn: tăng khoảng 144% năm 2006, giảm khoảng 66% năm 2008.','Thời gian nắm giữ càng dài, xác suất lỗ càng giảm: lịch sử S&P 500 cho thấy khoảng 3/4 số năm có lãi, và nắm giữ từ 20 năm trở lên (tính cả cổ tức) chưa từng lỗ danh nghĩa. Quá khứ không bảo đảm tương lai.','Tiền cần dùng trong 1–2 năm tới không nên bỏ vào cổ phiếu.'],
  thr:[['Quỹ khẩn cấp','3–6 tháng chi tiêu, để tiết kiệm'],['Mục tiêu dưới 2 năm','Tiết kiệm, trái phiếu ngắn hạn'],['Mục tiêu trên 5 năm','Có thể dành phần lớn cho cổ phiếu, ETF']],
  hook:'<b>Mẹo nhớ:</b> trước khi hỏi “lời bao nhiêu?”, hãy hỏi “mình chịu lỗ được bao nhiêu mà vẫn ngủ ngon?”',src:'Damodaran, Historical Returns on Stocks, Bonds and Bills (NYU Stern, cập nhật hằng năm); dữ liệu VN-Index của HOSE.'},
 {id:'l1-start',t:'Bắt đầu: tài khoản và lệnh đầu tiên',d:'Bốn bước từ con số 0',
  vis:()=>{ let g=arrowDef; const st=[['1','Mở tài khoản','tại công ty CK'],['2','Nạp tiền','vào tài khoản'],['3','Đặt lệnh','mã · giá · KL'],['4','Nhận cổ phiếu','sau T+2']];
    st.forEach(([n,a,b],i)=>{ const x=4+i*49.5; g+=`<rect x="${x}" y="28" width="44" height="54" rx="8" style="fill:var(--s1);stroke:${i===2?'var(--gold)':'var(--line2)'}"/><circle cx="${x+22}" cy="28" r="9" style="fill:var(--gold)"/>`;
      a.split(' ').reduce((acc,w)=>{ const last=acc[acc.length-1]; if(last&&(last+' '+w).length<=8) acc[acc.length-1]=last+' '+w; else acc.push(w); return acc; },[]).forEach((ln,k)=>g+=T(x+22,50+k*9,ln,'text-anchor="middle" style="font-size:7.5px;font-weight:800"'));
      g+=T(x+22,33,n,'text-anchor="middle" style="font-size:9px;font-weight:800;fill:var(--gold-ink)"')+T(x+22,76,b,'text-anchor="middle" style="font-size:5.8px;fill:var(--mut)"');
      if(i<3) g+=`<path d="M${x+44.5} 56 h4" style="stroke:var(--mut)" marker-end="url(#arL)"/>`; });
    g+=T(100,104,'Tiền mua = Giá × Số lượng + Phí','text-anchor="middle" '+TB)+T(100,116,'Lô chẵn HOSE: 100 cổ phiếu · Lô lẻ: 1–99','text-anchor="middle" '+TS);
    return sv(g,'Bốn bước bắt đầu đầu tư chứng khoán'); },
  f:'Tiền cần có = Giá × Số lượng + Phí môi giới (khoảng 0,1–0,35% ở Việt Nam)',
  pts:['Mở tài khoản tại một công ty chứng khoán được cấp phép. Phần lớn làm trực tuyến bằng căn cước công dân (eKYC) trong vài phút.','Nạp tiền vào tài khoản chứng khoán (tiền vẫn đứng tên bạn, gửi tại ngân hàng lưu ký).','Đặt lệnh: chọn mã, giá, số lượng. Người mới nên dùng lệnh giới hạn (LO) để biết chắc giá tối đa mình trả.','Việt Nam thanh toán T+2: cổ phiếu mua hôm nay về tài khoản sau 2 ngày làm việc. Mỹ là T+1.','Nhà đầu tư Việt Nam muốn mua cổ phiếu Mỹ cần tài khoản ở công ty môi giới quốc tế; ở Mỹ có thể mua từ 1 cổ phiếu, thậm chí phần lẻ cổ phiếu.','Ghi nhật ký: vì sao mua, mục tiêu, điểm cắt lỗ. Đây là thói quen phân biệt nhà đầu tư với người đánh bạc.'],
  thr:[['HOSE','Lô 100 cổ phiếu, lô lẻ 1–99 cổ phiếu'],['Thuế khi bán (VN)','0,1% giá trị bán'],['Phí môi giới (VN)','Khoảng 0,1–0,35% mỗi chiều']],
  hook:'<b>Mẹo nhớ:</b> bắt đầu bằng số tiền mà nếu mất một nửa, cuộc sống của bạn không thay đổi.',src:'Luật Chứng khoán 2019; Thông tư 120/2020/TT-BTC; Quy chế giao dịch HOSE.'},
 {id:'l2-board',t:'Đọc bảng giá điện tử',d:'Mỗi cột trên bảng điện nghĩa là gì',
  vis:()=>{ const cols=[['Mã','FPT','var(--fg)'],['Trần','62.250','var(--ceil)'],['Sàn','54.150','var(--floor)'],['TC','58.200','var(--ref)'],['Giá mua 1','58.400','var(--up)'],['Khớp','58.500','var(--up)'],['+/−','+0,5%','var(--up)'],['Giá bán 1','58.600','var(--up)']];
    let g=''; cols.forEach(([h,v,c],i)=>{ const x=4+i*24.4; g+=`<rect x="${x}" y="30" width="23.4" height="34" rx="3" style="fill:var(--s1);stroke:var(--line)"/>`+T(x+11.7,42,h,'text-anchor="middle" style="font-size:5.6px;fill:var(--mut)"')+T(x+11.7,56,v,`text-anchor="middle" style="font-size:6.2px;font-weight:800;fill:${c}"`); });
    g+=T(100,18,'Một dòng trên bảng điện HOSE','text-anchor="middle" '+TB);
    const leg=[['Tím: trần','var(--ceil)'],['Xanh lá: tăng','var(--up)'],['Vàng: tham chiếu','var(--ref)'],['Đỏ: giảm','var(--dn)'],['Xanh lam: sàn','var(--floor)']];
    leg.forEach(([t,c],i)=>{ const x=4+(i%3)*66, y=84+Math.floor(i/3)*14; g+=`<rect x="${x}" y="${y-7}" width="8" height="8" rx="2" style="fill:${c}"/>`+T(x+11,y,t,'style="font-size:7px"'); });
    return sv(g,'Các cột trên bảng giá điện tử và quy ước màu'); },
  f:'Tím = trần · Xanh lá = tăng · Vàng = tham chiếu · Đỏ = giảm · Xanh lam = sàn',
  pts:['TC (tham chiếu) là giá đóng cửa phiên trước. Trần = TC + 7%, Sàn = TC − 7% trên HOSE (HNX ±10%, UPCoM ±15%), làm tròn theo bước giá.','“Giá mua 1, 2, 3” và khối lượng đi kèm là ba mức giá tốt nhất người mua đang chờ; “Giá bán 1, 2, 3” là ba mức người bán đang chờ.','Cột Khớp lệnh cho biết giá và khối lượng vừa giao dịch; Tổng khối lượng là lượng đã khớp từ đầu phiên.','Cột NN mua/bán cho biết khối ngoại đang mua hay bán ròng — nhiều người theo dõi như tín hiệu dòng tiền lớn.','Màu chỉ cho biết giá so với tham chiếu, không cho biết cổ phiếu tốt hay xấu.'],
  thr:[['Dư mua lớn hơn dư bán','Bên mua đang chủ động hơn (chỉ để tham khảo, lệnh có thể bị hủy)'],['Khối lượng tăng đột biến','Dòng tiền chú ý — xem tin tức'],['Trắng bên bán ở giá trần','Cầu vượt cung rất mạnh']],
  hook:'<b>Mẹo nhớ:</b> đọc từ trái sang phải — giá chuẩn → người muốn mua → giao dịch thực → người muốn bán.',src:'Quy chế giao dịch HOSE; hướng dẫn bảng giá của các công ty chứng khoán.'},
 {id:'l2-index',t:'Chỉ số thị trường',d:'VN-Index, VN30, S&P 500 đo điều gì',
  vis:()=>{ const b=[[42,58,26,'VIC'],[86,48,20,'VCB'],[118,70,17,'VHM'],[150,46,15,'BID'],[176,70,12,'CTG'],[70,86,9,''],[100,94,7,''],[136,96,6,''],[160,94,5,''],[24,92,6,''],[188,40,5,'']];
    let g=''; b.forEach(([x,y,r,t],i)=>{ g+=`<circle cx="${x}" cy="${y}" r="${r}" style="fill:${i<5?'var(--gold)':'var(--us)'};fill-opacity:${i<5?.75:.45}"/>`+(t?T(x,y+3,t,'text-anchor="middle" style="font-size:7.5px;font-weight:800;fill:var(--gold-ink)"'):''); });
    g+=T(100,14,'Kích thước = vốn hóa','text-anchor="middle" '+TB)+T(100,118,'Vài mã lớn có thể kéo cả chỉ số lên hoặc xuống','text-anchor="middle" '+TS);
    return sv(g,'Chỉ số gia quyền vốn hóa: mã lớn ảnh hưởng nhiều hơn'); },
  f:'Chỉ số gia quyền vốn hóa = Tổng vốn hóa hiện tại ÷ Tổng vốn hóa kỳ gốc × Điểm gốc',
  pts:['VN-Index gồm toàn bộ cổ phiếu trên HOSE, gốc 100 điểm ngày 28/7/2000. Mã càng lớn càng ảnh hưởng mạnh đến chỉ số.','VN30 gồm 30 mã lớn, thanh khoản cao, có giới hạn tỷ trọng; là tài sản cơ sở của hợp đồng tương lai VN30F.','S&P 500 gồm khoảng 500 công ty lớn của Mỹ, gia quyền theo vốn hóa tự do chuyển nhượng, đại diện khoảng 80% vốn hóa thị trường Mỹ.','Dow Jones gồm 30 công ty, gia quyền theo giá (khác cách tính). Nasdaq Composite nghiêng về công nghệ.','Chỉ số tăng không có nghĩa phần lớn cổ phiếu tăng — hãy xem độ rộng thị trường (số mã tăng/giảm) ngay trên trang chủ của ứng dụng.'],
  thr:[['VN-Index','Toàn sàn HOSE, gốc 100 điểm (2000)'],['VN30','30 mã lớn, nền của phái sinh VN30F'],['S&P 500','500 doanh nghiệp lớn Mỹ']],
  hook:'<b>Mẹo nhớ:</b> chỉ số là nhiệt kế của cả chợ, không phải giá của một món hàng.',src:'HOSE, Bộ quy tắc xây dựng và quản lý chỉ số; S&P Dow Jones Indices, S&P U.S. Indices Methodology.'},
 {id:'l2-orders',t:'Các loại lệnh và một ngày giao dịch',d:'LO, ATO, ATC, MP và lệnh dừng',
  vis:()=>{ const seg=[[9,9.25,'ATO','var(--gold)'],[9.25,11.5,'Khớp liên tục','var(--up)'],[11.5,13,'Nghỉ trưa','var(--line2)'],[13,14.5,'Khớp liên tục','var(--up)'],[14.5,14.75,'ATC','var(--gold)'],[14.75,15,'Thỏa thuận','var(--us)']];
    const X=h=>8+(h-9)/6*184; let g=T(100,16,'Một phiên HOSE (giờ Việt Nam)','text-anchor="middle" '+TB);
    seg.forEach(([a,b,n,c])=>{ g+=`<rect x="${X(a)}" y="30" width="${X(b)-X(a)}" height="20" rx="2" style="fill:${c};fill-opacity:.7"/>`; if(X(b)-X(a)>24) g+=T((X(a)+X(b))/2,43,n,'text-anchor="middle" style="font-size:7px;font-weight:800;fill:var(--bg)"'); });
    [9,11.5,13,14.5].forEach(h=>g+=T(X(h),62,String(h).replace('.5',':30').replace(/^(\d+)$/,'$1:00'),'text-anchor="middle" style="font-size:6.5px"'));
    g+=T(X(9.1),76,'ATO 9:00–9:15','style="font-size:7px;fill:var(--gold)"')+T(X(14.4),76,'ATC 14:30–14:45','text-anchor="end" style="font-size:7px;fill:var(--gold)"');
    g+=T(100,96,'LO: tự đặt giá — an toàn nhất cho người mới','text-anchor="middle" '+TB)+T(100,110,'MP: khớp ngay · ATO/ATC: khớp giá mở/đóng cửa','text-anchor="middle" '+TS);
    return sv(g,'Các đợt khớp lệnh trong một phiên HOSE'); },
  f:'LO = lệnh giới hạn giá · MP = lệnh thị trường · ATO/ATC = khớp tại giá mở cửa/đóng cửa',
  pts:['LO (giới hạn): bạn đặt giá tối đa muốn mua hoặc tối thiểu muốn bán. Không khớp thì lệnh chờ đến hết phiên.','ATO/ATC: tham gia phiên khớp định kỳ mở cửa (9:00–9:15) hoặc đóng cửa (14:30–14:45), được ưu tiên trước lệnh LO, khớp tại một giá chung.','MP (lệnh thị trường, HOSE): khớp ngay với giá tốt nhất đang có; dễ bị khớp xấu khi thanh khoản mỏng.','Ở Mỹ: market (thị trường), limit (giới hạn), stop (kích hoạt khi chạm giá — thường dùng cắt lỗ), stop-limit, và hiệu lực DAY hoặc GTC (đến khi hủy).','Lệnh dừng giúp tự động cắt lỗ nhưng có thể khớp xa giá đặt khi thị trường biến động mạnh.'],
  thr:[['Người mới','Dùng LO, đặt giá rõ ràng'],['Muốn chắc chắn khớp','ATO, ATC hoặc MP — chấp nhận giá thị trường'],['Cắt lỗ tự động (Mỹ)','Stop hoặc stop-limit']],
  hook:'<b>Mẹo nhớ:</b> LO là “tôi định giá”, MP là “thị trường định giá cho tôi”.',src:'Quy chế giao dịch HOSE; SEC Investor.gov, Types of Orders.'},
 {id:'l3-dca',t:'Đầu tư định kỳ (DCA)',d:'Mua đều mỗi tháng, không cần đoán đỉnh đáy',
  vis:()=>{ const px=[10,8,6.25,8,10,12.5], X=i=>24+i*30, Y=v=>70-v*4.4; let g='';
    px.forEach((p,i)=>{ const sh=1e3/p; g+=`<rect x="${X(i)-9}" y="${100-sh*0.18}" width="18" height="${sh*0.18}" rx="2" style="fill:var(--us);fill-opacity:.6"/>`+T(X(i),98-sh*0.18,Math.round(sh),'text-anchor="middle" style="font-size:6.5px;font-weight:700"'); });
    g+=`<path d="${px.map((p,i)=>(i?'L':'M')+X(i)+' '+Y(p)).join(' ')}" fill="none" style="stroke:var(--gold)" stroke-width="2"/>`+px.map((p,i)=>`<circle cx="${X(i)}" cy="${Y(p)}" r="2.6" style="fill:var(--gold)"/>`).join('');
    g+=T(4,12,'Vàng: giá mỗi tháng · Xanh: số cổ phiếu mua được','style="font-size:6.8px"')+T(100,116,'Giá thấp → mua nhiều hơn → giá vốn thấp hơn','text-anchor="middle" '+TB);
    return sv(g,'Đầu tư định kỳ: giá thấp mua được nhiều cổ phiếu hơn'); },
  f:'Giá vốn bình quân = Tổng tiền đã đầu tư ÷ Tổng số cổ phiếu mua được',
  pts:['DCA (dollar-cost averaging): mỗi tháng đầu tư cùng một số tiền vào cùng một tài sản, bất kể giá lên hay xuống.','Ví dụ 1 triệu đồng/tháng: tháng 1 giá 10.000 mua 100 cổ phiếu, tháng 2 giá 8.000 mua 125, tháng 3 giá 12.500 mua 80. Giá vốn = 3 triệu ÷ 305 ≈ 9.836, thấp hơn giá trung bình 10.167.','DCA không bảo đảm có lãi nếu tài sản giảm mãi — nên dùng cho quỹ chỉ số, ETF hoặc doanh nghiệp tốt.','Nghiên cứu cho thấy nếu có sẵn một khoản lớn, đầu tư ngay một lần thường thắng DCA khoảng 2/3 số lần (vì thị trường tăng nhiều hơn giảm); DCA hợp với thu nhập hằng tháng và giảm áp lực tâm lý.','Kết hợp với tự động hóa: đặt lịch chuyển tiền, mua cùng ngày mỗi tháng.'],
  thr:[['Đầu tư từ lương hằng tháng','DCA là lựa chọn tự nhiên'],['Có sẵn khoản lớn','Một lần thường lợi hơn về thống kê; chia 3–12 tháng nếu sợ mua đỉnh'],['Kênh phù hợp','ETF chỉ số, quỹ mở']],
  hook:'<b>Mẹo nhớ:</b> thời gian ở trong thị trường quan trọng hơn chọn thời điểm vào thị trường.',src:'Vanguard Research, Dollar-cost averaging just means taking risk later (2012); Malkiel, A Random Walk Down Wall Street.'},
 {id:'l4-3fs',t:'Ba báo cáo tài chính',d:'Kết quả kinh doanh, cân đối kế toán, lưu chuyển tiền tệ',
  vis:()=>{ let g=arrowDef; const box=(x,y,w,h,c,t1,t2,t3)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" style="fill:var(--s1);stroke:${c}"/>`+T(x+w/2,y+12,t1,`text-anchor="middle" style="font-size:7.4px;font-weight:800;fill:${c}"`)+T(x+w/2,y+24,t2,'text-anchor="middle" style="font-size:6.3px"')+T(x+w/2,y+34,t3,'text-anchor="middle" style="font-size:6.3px;fill:var(--mut)"');
    g+=box(4,10,60,42,'var(--up)','Kết quả KD','Thu − Chi','= Lợi nhuận');
    g+=box(70,10,60,42,'var(--us)','Cân đối KT','Tài sản =','Nợ + Vốn CSH');
    g+=box(136,10,60,42,'var(--gold)','Lưu chuyển TT','Tiền vào − ra','= Tiền cuối kỳ');
    g+=`<path d="M64 31 h5" style="stroke:var(--mut)" marker-end="url(#arL)"/><path d="M135 31 h-4" style="stroke:var(--mut)" marker-end="url(#arL)"/>`;
    g+=T(100,68,'Lợi nhuận giữ lại → tăng Vốn CSH','text-anchor="middle" '+TS)+T(100,78,'Tiền cuối kỳ → dòng Tiền trên Cân đối','text-anchor="middle" '+TS);
    g+=T(34,96,'Có lãi không?','text-anchor="middle" '+TB)+T(100,96,'Có gì, nợ ai?','text-anchor="middle" '+TB)+T(166,96,'Tiền thật đâu?','text-anchor="middle" '+TB);
    g+=T(100,116,'Lãi trên giấy mà tiền không về là dấu hiệu cần soi','text-anchor="middle" style="font-size:7px;fill:var(--dn)"');
    return sv(g,'Ba báo cáo tài chính và mối liên hệ'); },
  f:'Tài sản = Nợ phải trả + Vốn chủ sở hữu (luôn cân bằng)',
  pts:['Báo cáo kết quả kinh doanh: trong một kỳ, doanh nghiệp bán được bao nhiêu và lãi bao nhiêu (doanh thu → giá vốn → lợi nhuận gộp → chi phí → lợi nhuận sau thuế).','Bảng cân đối kế toán: tại một thời điểm, doanh nghiệp có gì (tài sản) và tiền đó đến từ đâu (nợ hoặc vốn chủ).','Báo cáo lưu chuyển tiền tệ: tiền thật vào ra theo ba nhóm — kinh doanh, đầu tư, tài chính. Lợi nhuận có thể “xào nấu”, tiền mặt khó hơn nhiều.','Ba báo cáo nối với nhau: lợi nhuận giữ lại làm tăng vốn chủ sở hữu; tiền cuối kỳ trên báo cáo lưu chuyển bằng dòng tiền trên bảng cân đối.','Doanh nghiệp niêm yết ở Việt Nam công bố báo cáo quý trong 20 ngày sau quý (30 ngày với công ty mẹ có công ty con), báo cáo năm kiểm toán trong 90 ngày.'],
  thr:[['Dòng tiền kinh doanh > Lợi nhuận','Lợi nhuận chất lượng'],['Phải thu, tồn kho tăng nhanh hơn doanh thu','Cảnh báo'],['Nợ vay tăng nhanh hơn vốn chủ','Đòn bẩy đang tăng']],
  hook:'<b>Mẹo nhớ:</b> Kết quả kinh doanh là “bộ phim”, Cân đối kế toán là “bức ảnh”, Lưu chuyển tiền tệ là “sao kê ngân hàng”.',src:'Chuẩn mực kế toán Việt Nam VAS 21, VAS 24; Thông tư 96/2020/TT-BTC; CFA Institute, Financial Reporting and Analysis.'},
 {id:'l4-eps',t:'Từ lợi nhuận đến EPS và cổ tức',d:'Mỗi cổ phiếu được bao nhiêu lợi nhuận',
  vis:()=>{ let g=arrowDef; g+=`<rect x="8" y="18" width="62" height="40" rx="7" style="fill:var(--s1);stroke:var(--up)"/>`+T(39,32,'LN sau thuế','text-anchor="middle" style="font-size:7.5px;font-weight:800;fill:var(--up)"')+T(39,46,'160 tỷ','text-anchor="middle" style="font-size:10px;font-weight:800"');
    g+=T(82,40,'÷','text-anchor="middle" style="font-size:14px;font-weight:800"');
    g+=`<rect x="94" y="18" width="62" height="40" rx="7" style="fill:var(--s1);stroke:var(--us)"/>`+T(125,32,'Số cổ phiếu','text-anchor="middle" style="font-size:7.5px;font-weight:800;fill:var(--us)"')+T(125,46,'100 triệu','text-anchor="middle" style="font-size:10px;font-weight:800"');
    g+=T(176,40,'= EPS','text-anchor="middle" style="font-size:8px;font-weight:800;fill:var(--gold)"')+T(176,52,'1.600đ','text-anchor="middle" style="font-size:9px;font-weight:800;fill:var(--gold)"');
    const W=170; g+=`<rect x="15" y="78" width="${W*0.625}" height="16" rx="3" style="fill:var(--up);fill-opacity:.7"/><rect x="${15+W*0.625}" y="78" width="${W*0.375}" height="16" rx="3" style="fill:var(--us);fill-opacity:.6"/>`;
    g+=T(15+W*0.31,89,'Cổ tức 1.000đ (62,5%)','text-anchor="middle" style="font-size:7px;font-weight:800;fill:var(--bg)"')+T(15+W*0.81,89,'Giữ lại 600đ','text-anchor="middle" style="font-size:7px;font-weight:800;fill:var(--bg)"');
    g+=T(100,112,'Lợi nhuận giữ lại được tái đầu tư để công ty lớn lên','text-anchor="middle" '+TS);
    return sv(g,'EPS và cách chia lợi nhuận thành cổ tức và lợi nhuận giữ lại'); },
  f:'EPS = Lợi nhuận sau thuế của cổ đông công ty mẹ ÷ Số cổ phiếu lưu hành bình quân',
  pts:['EPS (lợi nhuận trên mỗi cổ phiếu) cho biết mỗi cổ phiếu bạn giữ “tạo ra” bao nhiêu lợi nhuận một năm.','Tỷ lệ chi trả = Cổ tức ÷ EPS. Phần còn lại được giữ lại để mở rộng; tăng trưởng bền vững ≈ ROE × tỷ lệ giữ lại.','Phát hành thêm cổ phiếu làm EPS bị pha loãng nếu lợi nhuận không tăng tương ứng — đó là lý do F-Score có phép thử “không pha loãng”.','Cổ tức tiền mặt: nhận tiền (ở Việt Nam bị khấu trừ thuế 5%). Cổ tức bằng cổ phiếu: số cổ phiếu tăng nhưng giá được điều chỉnh giảm tương ứng — tổng giá trị không đổi ngay lúc đó.','Ngày giao dịch không hưởng quyền (GDKHQ): mua từ ngày này trở đi sẽ không được nhận cổ tức đợt đó.'],
  thr:[['EPS tăng đều nhiều năm','Doanh nghiệp tăng trưởng thật'],['Tỷ lệ chi trả trên 100%','Chia nhiều hơn kiếm được — khó bền'],['Cổ tức cổ phiếu 10%','Giá điều chỉnh: 100.000 → ≈ 90.909']],
  hook:'<b>Mẹo nhớ:</b> chia cổ tức bằng cổ phiếu giống cắt chiếc bánh thành nhiều miếng hơn — bánh không to lên.',src:'VAS 30 (Lãi trên cổ phiếu); Luật Thuế thu nhập cá nhân; Quy chế niêm yết HOSE.'}
];
NEW_BASIC.forEach(l=>{ l.g='Nền tảng'; LESSONS.push(l); });

/* ---------- gán cấp độ, sắp xếp lại ---------- */
const LV_OF={}; LEVELS.forEach((L,i)=>L.ids.forEach(id=>LV_OF[id]=i+1));
LESSONS.forEach(l=>{ l.lv=LV_OF[l.id]||8; if(!LV_OF[l.id]) LEVELS[7].ids.push(l.id); });
LESSONS.sort((a,b)=>a.lv-b.lv||LEVELS[a.lv-1].ids.indexOf(a.id)-LEVELS[b.lv-1].ids.indexOf(b.id));
function lessonCrumb(l){ const L=LEVELS[l.lv-1]; const ids=L.ids; return `Cấp ${l.lv} · ${esc(L.n)} · Bài ${ids.indexOf(l.id)+1}/${ids.length}`; }

/* ---------- câu hỏi theo cấp ---------- */
const QLV=[6,4,7,5,3,6,2,2,5,1,8,3,7,7,2,8,3,5,2,6,9,9,9,9,9,9,9,9,9,9,9,6,5,5,2,9,9,9];
QUIZ.forEach((q,i)=>{ if(q.lid) q.lv=LV_OF[q.lid]||q.lv; else if(q.lv==null) q.lv= i<QLV.length? QLV[i] : 10; });
QUIZ.forEach(q=>{ if(/ETF/.test(q.q)&&/S&P 500/.test(q.q)) q.lv=3; });
[
 {lv:1,q:'Công ty có 1 triệu cổ phiếu, bạn mua 1.000 cổ phiếu. Bạn sở hữu bao nhiêu phần công ty?',a:['0,1%','1%','10%','0,01%'],c:0,e:'1.000 ÷ 1.000.000 = 0,1%: hưởng 0,1% lợi nhuận và 0,1% quyền biểu quyết.'},
 {lv:1,q:'Hai nguồn lợi nhuận chính khi đầu tư cổ phiếu là?',a:['Cổ tức và chênh lệch giá','Lãi suất cố định và tiền thưởng','Phí giao dịch và thuế','Chỉ có cổ tức'],c:0,e:'Lợi nhuận = cổ tức + (giá bán − giá mua) − thuế phí.'},
 {lv:1,q:'Khi công ty phá sản, ai được trả tiền sau cùng?',a:['Cổ đông','Ngân hàng cho vay','Người mua trái phiếu','Nhân viên'],c:0,e:'Cổ đông là chủ sở hữu, chỉ nhận phần còn lại sau khi trả hết nợ — thường gần như không còn gì.'},
 {lv:1,q:'Giá cổ phiếu trên sàn mỗi ngày do đâu quyết định?',a:['Cung cầu của người mua và người bán','Công ty niêm yết','Ủy ban Chứng khoán','Ngân hàng Nhà nước'],c:0,e:'Giá khớp là nơi người mua và người bán gặp nhau trong sổ lệnh.'},
 {lv:1,q:'Khoản tiền cần dùng trong 6 tháng tới nên để ở đâu?',a:['Tiết kiệm hoặc kênh dễ rút, ít biến động','Cổ phiếu tăng trưởng','Quỹ ETF đòn bẩy 3x','Chứng quyền'],c:0,e:'Cổ phiếu có thể giảm 30–50% trong ngắn hạn; tiền sắp dùng cần an toàn.'},
 {lv:1,q:'10 triệu đồng, lãi 10%/năm, tái đầu tư. Sau 2 năm bạn có?',a:['12,1 triệu','12 triệu','11 triệu','20 triệu'],c:0,e:'10 × 1,1 × 1,1 = 12,1 — năm thứ hai lãi tính trên cả tiền lãi năm đầu (lãi kép).'},
 {lv:2,q:'Giá tham chiếu trên HOSE thường là?',a:['Giá đóng cửa phiên trước','Giá mở cửa hôm nay','Giá cao nhất 52 tuần','Giá do công ty công bố'],c:0,e:'Trần, sàn được tính từ giá tham chiếu (±7% trên HOSE).'},
 {lv:2,q:'Lệnh ATC khớp vào lúc nào?',a:['Phiên khớp định kỳ đóng cửa 14:30–14:45','Ngay khi đặt','9:00–9:15','Sau 15:00'],c:0,e:'ATO khớp đợt mở cửa, ATC khớp đợt đóng cửa, cùng một mức giá chung.'},
 {lv:2,q:'Trên bảng điện Việt Nam, màu xanh lam biểu thị?',a:['Giá sàn','Giá tham chiếu','Giá trần','Giá tăng nhẹ'],c:0,e:'Tím trần, xanh lá tăng, vàng tham chiếu, đỏ giảm, xanh lam sàn.'},
 {lv:2,q:'VN-Index được tính theo phương pháp nào?',a:['Gia quyền vốn hóa','Bình quân giá cổ phiếu','Số mã tăng trừ số mã giảm','Gia quyền theo lợi nhuận'],c:0,e:'Vì gia quyền vốn hóa, vài mã lớn có thể kéo cả chỉ số.'},
 {lv:2,q:'Người mới nên ưu tiên loại lệnh nào?',a:['LO (giới hạn giá)','MP (thị trường)','Lệnh ký quỹ','Bán khống'],c:0,e:'LO cho bạn kiểm soát giá tối đa phải trả.'},
 {lv:3,q:'DCA 1 triệu/tháng ở giá 10.000 rồi 8.000. Giá vốn bình quân là?',a:['≈ 8.889','9.000','8.000','10.000'],c:0,e:'2 triệu ÷ (100 + 125) = 8.889 — thấp hơn trung bình giá 9.000.'},
 {lv:3,q:'Lợi thế lớn nhất của ETF chỉ số với người mới?',a:['Đa dạng hóa ngay và phí thấp','Lợi nhuận cao gấp ba thị trường','Không bao giờ giảm','Được bảo hiểm vốn'],c:0,e:'Một chứng chỉ ETF chứa hàng chục đến hàng trăm cổ phiếu, phí có thể dưới 0,1%/năm.'},
 {lv:3,q:'Danh mục giảm 25%. Cần tăng bao nhiêu để hòa vốn?',a:['33,3%','25%','20%','50%'],c:0,e:'1 ÷ 0,75 − 1 = 33,3%. Lỗ càng sâu, đường về càng xa.'},
 {lv:4,q:'Phương trình kế toán cơ bản là?',a:['Tài sản = Nợ phải trả + Vốn chủ sở hữu','Doanh thu = Lợi nhuận + Thuế','Tiền = Lợi nhuận','Vốn = Tài sản + Nợ'],c:0,e:'Bảng cân đối luôn cân bằng theo phương trình này.'},
 {lv:4,q:'Báo cáo nào cho biết tiền thật vào ra doanh nghiệp?',a:['Lưu chuyển tiền tệ','Kết quả kinh doanh','Thuyết minh nhân sự','Báo cáo thường niên'],c:0,e:'Lợi nhuận có thể ghi nhận trước khi thu tiền; dòng tiền thì không.'},
 {lv:4,q:'Chia cổ tức bằng cổ phiếu tỷ lệ 10% khi giá 100.000. Giá điều chỉnh xấp xỉ?',a:['90.909','100.000','110.000','90.000'],c:0,e:'100.000 ÷ 1,1 ≈ 90.909: số cổ phiếu tăng 10%, tổng giá trị không đổi.'},
 {lv:6,q:'P/B = 0,8 nghĩa là gì?',a:['Giá thị trường thấp hơn giá trị sổ sách trên mỗi cổ phiếu','Công ty lỗ 20%','Lợi nhuận bằng 80% giá','Nợ bằng 80% vốn'],c:0,e:'P/B dưới 1 có thể là rẻ — hoặc thị trường nghi ngờ chất lượng tài sản, ROE thấp.'},
 {lv:6,q:'EV/EBITDA khác P/E ở điểm nào?',a:['Tính cả nợ ròng, không phụ thuộc cấu trúc vốn','Chỉ dùng cho ngân hàng','Không cần lợi nhuận','Luôn nhỏ hơn P/E'],c:0,e:'EV = vốn hóa + nợ − tiền mặt, nên so sánh được doanh nghiệp vay nhiều với vay ít.'},
 {lv:5,q:'Tỷ suất FCF 6% nghĩa là?',a:['Mỗi 100 đồng giá, doanh nghiệp tạo 6 đồng dòng tiền tự do mỗi năm','Cổ tức 6%','Doanh thu tăng 6%','Biên lợi nhuận 6%'],c:0,e:'FCF yield = FCF ÷ vốn hóa — nghịch đảo của P/FCF.'},
 {lv:6,q:'WACC là gì?',a:['Chi phí vốn bình quân của nợ và vốn chủ theo tỷ trọng','Lãi suất tiết kiệm','Tỷ suất cổ tức','Lợi nhuận trên vốn'],c:0,e:'Doanh nghiệp chỉ tạo giá trị khi ROIC lớn hơn WACC.'},
 {lv:6,q:'Trong DCF, tăng chi phí vốn r (giữ nguyên dòng tiền) làm giá trị nội tại?',a:['Giảm','Tăng','Không đổi','Bằng 0'],c:0,e:'Dòng tiền tương lai bị chiết khấu mạnh hơn; giá trị cuối kỳ đặc biệt nhạy với r − g.'},
 {lv:4,q:'Lợi nhuận 160 tỷ, 100 triệu cổ phiếu. EPS bằng?',a:['1.600 đồng','160 đồng','16.000 đồng','1,6 đồng'],c:0,e:'160.000.000.000 ÷ 100.000.000 = 1.600 đồng/cổ phiếu.'}
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
  const tiers=[['Người mới',0,3],['Trung cấp',3,6],['Nâng cao',6,9],['Chuyên gia',9,10]];
  tiers.forEach(([t,a,b])=>{ g+=`<rect x="${p+a*sw+1}" y="146" width="${(b-a)*sw-2}" height="4" rx="2" style="fill:${TIER_COL[t]}"/><text x="${p+(a+b)/2*sw}" y="162" text-anchor="middle" style="font-size:9.5px;font-weight:700;fill:${TIER_COL[t]}">${t}</text>`; });
  for(let i=0;i<10;i++){
    const st=lvState(i), h=22+i*10.5, x=p+i*sw, y=140-h;
    const isCur=i+1===cur, isOpen=i+1===open;
    const fill= st.complete?'var(--gold)':'var(--s1)';
    g+=`<g data-lv="${i+1}" style="cursor:pointer" role="button" aria-label="Cấp ${i+1}: ${esc(LEVELS[i].n)}${st.complete?', đã hoàn thành':''}">`;
    g+=`<rect x="${x+2}" y="${y}" width="${sw-4}" height="${h}" rx="5" style="fill:${fill};stroke:${isOpen?'var(--fg)':isCur?'var(--gold)':'var(--line2)'}" stroke-width="${isOpen||isCur?2:1}"/>`;
    const pr=st.tot?st.done/st.tot:0; if(!st.complete&&pr>0) g+=`<rect x="${x+4}" y="${y+h-4-(h-8)*pr}" width="${sw-8}" height="${(h-8)*pr}" rx="3" style="fill:var(--gold);fill-opacity:.35"/>`;
    g+=`<text x="${x+sw/2}" y="${y+16}" text-anchor="middle" style="font-family:var(--f-disp);font-size:13px;font-weight:800;fill:${st.complete?'var(--gold-ink)':'var(--fg)'}">${i+1}</text>`;
    if(st.passed) g+=`<text x="${x+sw/2}" y="${y+28}" text-anchor="middle" style="font-size:9px;fill:var(--gold-ink)">✓</text>`;
    if(isCur) g+=`<g transform="translate(${x+sw/2} ${y-6})"><line x1="0" y1="0" x2="0" y2="-16" style="stroke:var(--fg)" stroke-width="1.4"/><path d="M0 -16 L12 -12 L0 -8z" style="fill:var(--dn)"/></g>`;
    g+='</g>';
  }
  return `<svg class="chart ladder" viewBox="0 0 ${W} ${H}" role="img" aria-label="Lộ trình 10 cấp độ, bạn đang ở cấp ${cur}">${g}</svg>`;
}
function lcardHTML(l){ return `<button class="lcard" data-lesson="${l.id}"><span class="th">${l.vis()}${S.learned.includes(l.id)?'<span class="done" aria-label="Đã học"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg></span>':''}</span><span class="tx"><b>${esc(l.t)}</b><span>${esc(l.d)}</span></span></button>`; }

RENDER.learn=function(){
  const el=$('#v-learn'); const cur=currentLevel(); if(!S.lvOpen) S.lvOpen=cur;
  const open=S.lvOpen, L=LEVELS[open-1], st=lvState(open-1);
  const doneAll=S.learned.filter(id=>LESSONS.some(l=>l.id===id)).length;
  const leit=store.leit||{}; const boxes=[0,0,0,0,0]; QUIZ.forEach((_,i)=>{ boxes[clamp((leit[i]||1)-1,0,4)]++; });
  const lessons=L.ids.map(id=>LESSONS.find(l=>l.id===id)).filter(Boolean);
  el.innerHTML=`<div class="sec-h" style="margin:0"><div><h2>Học thuật đầu tư</h2><p>10 cấp độ · ${LESSONS.length} bài có infographic · ${QUIZ.length} câu hỏi · cấp 1 cho người chưa biết gì</p></div></div>
  <section class="panel lv-hero">
    <div class="lv-hero-top"><div><span class="mut" style="font-size:12px;letter-spacing:.06em;text-transform:uppercase">Bạn đang ở</span><b>Cấp ${cur} · ${esc(LEVELS[cur-1].n)}</b><span class="note">${doneAll}/${LESSONS.length} bài đã học · ${Object.keys(store.lvPass||{}).length}/10 bài kiểm tra cấp đã vượt</span></div>
      <button class="btn pri" data-lvgo="${cur}">${S.lvOpen===cur?'Học tiếp':'Về cấp '+cur}</button></div>
    ${ladderSVG(cur,open)}
    <p class="note">Chạm một bậc để mở cấp đó. Bậc tô vàng: đã học hết bài hoặc vượt bài kiểm tra cấp (đạt 4/5). Lá cờ: cấp nên học tiếp.</p>
  </section>
  <section class="panel lv-detail" id="lvDetail" aria-labelledby="lvTitle">
    <div class="lv-head"><span class="lv-num" style="background:${TIER_COL[L.tier]}">${open}</span><div><span class="mut" style="font-size:12px;font-weight:700;color:${TIER_COL[L.tier]}">${esc(L.tier.toUpperCase())}</span><h2 id="lvTitle">${esc(L.n)}</h2><p class="note" style="margin:0">${esc(L.d)}</p></div></div>
    <div class="lv-goal"><b>Sau cấp này bạn sẽ</b><ul>${L.goal.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="lv-prog"><div class="progress"><i style="width:${st.tot?st.done/st.tot*100:0}%"></i></div><span>${st.done}/${st.tot} bài${st.passed?` · đã vượt kiểm tra (${st.best}/5)`:''}</span></div>
    <div class="learn-grid">${lessons.map(lcardHTML).join('')}</div>
    ${L.extra==='cdl'?'<div class="row-btns" style="margin-top:12px"><button class="btn" data-lesson="cdl-library">Thư viện 34 mẫu nến Nhật</button><button class="btn" id="goCpat">15 mô hình giá kinh điển</button></div>':''}
    <div class="row-btns" style="margin-top:14px">
      <button class="btn pri" id="lvQuiz"${st.qn<3?' disabled':''}>Kiểm tra cấp ${open} · 5 câu</button>
      ${open>1?`<button class="btn" data-lvgo="${open-1}">← Cấp ${open-1}</button>`:''}${open<10?`<button class="btn" data-lvgo="${open+1}">Cấp ${open+1} →</button>`:''}
    </div>
  </section>
  <section><div class="sec-h"><h2 style="font-size:18px">Tất cả 10 cấp</h2></div>
    <div class="lv-list">${LEVELS.map((x,i)=>{ const s=lvState(i); return `<button class="lv-row${i+1===open?' on':''}" data-lvgo="${i+1}"><span class="lv-num sm" style="background:${s.complete?'var(--gold)':TIER_COL[x.tier]};${s.complete?'color:var(--gold-ink)':''}">${s.complete?'✓':i+1}</span><span class="lv-txt"><b>${esc(x.n)}</b><span>${esc(x.d)}</span></span><span class="lv-meta"><i style="--p:${s.tot?s.done/s.tot*100:0}%"></i>${s.done}/${s.tot}</span></button>`; }).join('')}</div>
  </section>
  <section class="panel" style="display:flex;flex-direction:column;gap:12px">
    <div class="sec-h" style="margin:0"><div><h2 style="font-size:17px">Ôn tập ngắt quãng</h2><p>Trộn câu hỏi mọi cấp đã mở · kỷ lục ${S.quizBest}/8</p></div><button class="btn sm" id="startQuiz">Ôn 8 câu</button></div>
    <div style="display:flex;gap:4px;align-items:flex-end;height:34px" aria-label="Phân bố hộp Leitner">${boxes.map((n,i)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><i style="display:block;width:18px;height:${4+Math.min(26,n*.6)}px;border-radius:3px;background:var(--gold);opacity:${.35+i*.16}"></i><span style="font-size:10px" class="mut">${i+1}</span></div>`).join('')}<p class="note" style="margin-left:10px">Hộp Leitner: trả lời đúng, câu hỏi lên hộp cao và ít xuất hiện lại; sai thì về hộp 1.</p></div>
  </section>
  <div class="sec-h" style="margin:4px 0 0"><div><h2 style="font-size:18px">Thư viện tra cứu</h2><p>Mẫu nến và mô hình giá cho cấp 9, xem bất cứ lúc nào</p></div></div>`;
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
      $('#sheetBody').innerHTML=`<div class="lesson" style="text-align:center;align-items:center"><div class="bigring" style="margin:10px auto">${ringSVG(st.score/st.qs.length*100,108,9)}<div class="v"><b>${st.score}/${st.qs.length}</b><span>câu đúng</span></div></div>
        <h3>${pass?`Đã vượt cấp ${lv}!`:`Chưa vượt cấp ${lv}`}</h3><p>${pass?(lv<10?`Cấp ${lv+1} — ${esc(LEVELS[lv].n)} — đã sẵn sàng.`:'Bạn đã hoàn thành cả 10 cấp.'):'Cần 4/5 câu đúng. Xem lại các bài của cấp này rồi thử lại.'}</p>
        <div class="row-btns" style="justify-content:center">${pass&&lv<10?`<button class="btn pri" id="lqNext">Sang cấp ${lv+1}</button>`:`<button class="btn pri" id="lqAgain">Làm lại</button>`}<button class="btn" id="lqClose">Đóng</button></div></div>`;
      animateRings($('#sheetBody'));
      const nx=$('#lqNext'); if(nx) nx.onclick=()=>{ closeSheet(); S.lvOpen=lv+1; if(S.view==='learn') RENDER.learn(); };
      const ag=$('#lqAgain'); if(ag) ag.onclick=()=>startLevelQuiz(lv);
      $('#lqClose').onclick=()=>{ closeSheet(); if(S.view==='learn') RENDER.learn(); };
      if(pass&&HAS_GSAP()&&!REDUCED()) gsap.from('#sheetBody h3',{scale:.6,opacity:0,duration:.5,ease:'back.out(2)'});
      return; }
    const qi=st.qs[st.k], Q=QUIZ[qi]; const order=shuffle(Q.a.map((t,i)=>({t,i})));
    $('#sheetBody').innerHTML=`<div class="lesson"><div style="display:flex;justify-content:space-between;align-items:center"><span class="note">Cấp ${lv} · Câu ${st.k+1}/${st.qs.length}</span><span class="note">Đúng: ${st.score}</span></div>
      <div class="progress"><i style="width:${st.k/st.qs.length*100}%"></i></div>
      <h3 style="font-size:19px;line-height:1.3">${esc(Q.q)}</h3>
      <div style="display:flex;flex-direction:column;gap:8px" id="qOpts">${order.map(o=>`<button class="quiz-opt" data-i="${o.i}">${esc(o.t)}</button>`).join('')}</div>
      <div id="qFb"></div></div>`;
    let answered=false;
    $$('#qOpts .quiz-opt').forEach(b=>b.onclick=()=>{ if(answered) return; answered=true; const ok=+b.dataset.i===Q.c;
      $$('#qOpts .quiz-opt').forEach(x=>{ if(+x.dataset.i===Q.c) x.classList.add('ok'); x.disabled=true; }); if(!ok) b.classList.add('bad');
      const leit=store.leit||{}; leit[qi]= ok? Math.min(5,(leit[qi]||1)+1) : 1; store.leit=leit; persist(); if(ok) st.score++;
      $('#qFb').innerHTML=`<div class="hook" style="border-color:${ok?'var(--up)':'var(--dn)'}"><b style="color:${ok?'var(--up)':'var(--dn)'}">${ok?'Chính xác.':'Chưa đúng.'}</b> ${esc(Q.e)}</div><div class="row-btns" style="margin-top:10px"><button class="btn pri" id="qNext">${st.k+1<st.qs.length?'Câu tiếp':'Xem kết quả'}</button></div>`;
      $('#qNext').onclick=()=>{ st.k++; render(); }; $('#qNext').focus({preventScroll:true}); });
  };
  openSheet(`Kiểm tra cấp ${lv} · ${LEVELS[lv-1].n}`,'',()=>render());
}
/* nút “Bài tiếp” trong bài học: sang cấp kế tiếp khi hết cấp */
const _openLessonLv=openLesson;
openLesson=function(id){ _openLessonLv(id); const l=LESSONS.find(x=>x.id===id); if(!l) return;
  const ids=LEVELS[l.lv-1].ids; const last=ids.indexOf(l.id)===ids.length-1; const nb=$('#lNext');
  if(nb&&last){ nb.textContent=l.lv<10?`Kiểm tra cấp ${l.lv}`:'Kiểm tra cấp 10'; nb.onclick=()=>startLevelQuiz(l.lv); }
  if(S.view==='learn') S.lvOpen=l.lv; };

/* ---------- phần tương tác của bài mở rộng ---------- */
const _openLessonX=openLesson;
openLesson=function(id){
  _openLessonX(id); const l=LESSONS.find(x=>x.id===id); if(!l) return;
  const fm=$('#sheetBody .formula'); if(!fm) return;
  const box=document.createElement('div'); box.style.cssText='display:flex;flex-direction:column;gap:12px';
  if(l.interactive==='fv'){
    box.innerHTML=`<section class="panel" style="display:flex;flex-direction:column;gap:10px"><b style="font-family:var(--f-disp)">Máy tính kế hoạch tích sản</b>
      <label class="slider-row"><span>Góp mỗi tháng</span><input type="range" id="fvM" min="1" max="50" step="1" value="5"><output id="fvMo"></output></label>
      <label class="slider-row"><span>Số năm</span><input type="range" id="fvN" min="1" max="40" step="1" value="20"><output id="fvNo"></output></label>
      <label class="slider-row"><span>Lợi nhuận/năm</span><input type="range" id="fvR" min="0" max="15" step="0.5" value="8"><output id="fvRo"></output></label>
      <label class="slider-row"><span>Lạm phát/năm</span><input type="range" id="fvI" min="0" max="8" step="0.5" value="3.5"><output id="fvIo"></output></label>
      <div class="result" id="fvOut"></div><div id="fvChart"></div>
      <p class="note">Giả định lợi nhuận đều mỗi năm và góp cuối mỗi tháng; thực tế thị trường lên xuống thất thường. Kết quả chỉ để lập kế hoạch, không phải dự báo.</p></section>`;
    fm.after(box);
    const up=()=>{ const m=+$('#fvM').value, n=+$('#fvN').value, R=+$('#fvR').value, I=+$('#fvI').value;
      $('#fvMo').textContent=m+' tr'; $('#fvNo').textContent=n+' năm'; $('#fvRo').textContent=fmt(R,1)+'%'; $('#fvIo').textContent=fmt(I,1)+'%';
      const r=Math.pow(1+R/100,1/12)-1; const fvAt=k=>r? m*((Math.pow(1+r,k)-1)/r) : m*k;
      const fv=fvAt(n*12), ct=m*n*12, real=fv/Math.pow(1+I/100,n), pass=real*0.04/12;
      const ty=v=>v>=1000? fmt(v/1000,2)+' tỷ' : fmt(v,0)+' tr';
      $('#fvOut').innerHTML=`<div><b class="gold">${ty(fv)}</b><span>Giá trị sau ${n} năm</span></div><div><b>${ty(ct)}</b><span>Tiền bạn góp</span></div><div><b class="up">${ty(Math.max(0,fv-ct))}</b><span>Lãi kép tạo ra</span></div><div><b>${ty(real)}</b><span>Quy về tiền hôm nay</span></div><div><b>${ty(pass)}/tháng</b><span>Thu nhập thụ động (rút 4%, tiền hôm nay)</span></div>`;
      const W=340,H=140,p={l:36,r:8,t:8,b:20}; const X=y=>p.l+y/n*(W-p.l-p.r), Y=v=>H-p.b-v/(fv||1)*(H-p.t-p.b);
      let a='',b=''; for(let y=0;y<=n;y++){ a+=(y?'L':'M')+X(y).toFixed(1)+' '+Y(fvAt(y*12)).toFixed(1); b+=(y?'L':'M')+X(y).toFixed(1)+' '+Y(m*12*y).toFixed(1); }
      let g=`<path d="${a} L${X(n)} ${Y(0)} L${X(0)} ${Y(0)}Z" style="fill:var(--up);fill-opacity:.3"/><path d="${b} L${X(n)} ${Y(0)} L${X(0)} ${Y(0)}Z" style="fill:var(--us);fill-opacity:.5"/><line class="axis" x1="${p.l}" x2="${W-p.r}" y1="${Y(0)}" y2="${Y(0)}"/>`;
      [0,.5,1].forEach(k=>g+=`<text x="${p.l-4}" y="${Y(fv*k)+3}" text-anchor="end">${ty(fv*k)}</text>`); [0,Math.round(n/2),n].forEach(y=>g+=`<text x="${X(y)}" y="${H-5}" text-anchor="middle">năm ${y}</text>`);
      $('#fvChart').innerHTML=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tăng trưởng tài sản theo năm">${g}</svg><div class="legend"><span><i style="background:var(--us)"></i>Tiền góp</span><span><i style="background:var(--up)"></i>Tổng giá trị (gồm lãi kép)</span></div>`; };
    ['fvM','fvN','fvR','fvI'].forEach(i=>$('#'+i).oninput=up); up();
  }
  if(l.interactive==='practice'){
    const rows=[['Doanh thu',1000,1200,1500],['Lợi nhuận gộp',300,348,405],['LNST',100,130,180],['Dòng tiền KD (CFO)',110,60,-20],['Phải thu khách hàng',150,260,450],['Hàng tồn kho',200,230,260],['Vay nợ',200,300,520],['Vốn chủ sở hữu',800,900,1050]];
    const qa=[['Doanh thu tăng bao nhiêu mỗi năm?','2024: +20% (1.200 ÷ 1.000), 2025: +25% (1.500 ÷ 1.200). Tăng trưởng nhanh dần.'],
      ['Biên lợi nhuận gộp đang thế nào?','30% → 29% → 27%. Biên co lại dù doanh thu tăng: có thể giảm giá bán hoặc chi phí đầu vào tăng để đẩy doanh số.'],
      ['Lợi nhuận tăng 80% trong 2 năm. Dòng tiền kinh doanh có theo kịp không?','Không: CFO từ 110 xuống 60 rồi âm 20. Lợi nhuận không biến thành tiền. CFO ÷ LNST: 1,1 → 0,46 → −0,11.'],
      ['Tiền bị kẹt ở đâu?','Phải thu tăng gấp 3 (150 → 450) trong khi doanh thu chỉ +50%. Số ngày thu tiền từ ≈ 55 ngày lên ≈ 110 ngày: doanh nghiệp bán chịu nhiều hơn để tăng doanh thu.'],
      ['Thiếu tiền thì doanh nghiệp bù bằng gì?','Vay nợ tăng 200 → 520. Nợ vay ÷ vốn chủ từ 0,25 lên ≈ 0,50.'],
      ['Kết luận?','Tăng trưởng “nóng”, chất lượng thấp: 3 cờ đỏ (CFO âm khi có lãi, phải thu tăng vọt, nợ vay tăng mạnh). Theo quy tắc của cấp này: loại, hoặc chỉ cân nhắc lại khi dòng tiền cải thiện.']];
    box.innerHTML=`<section class="panel" style="display:flex;flex-direction:column;gap:10px"><b style="font-family:var(--f-disp)">Công ty CP Sen Vàng — số liệu giả định (tỷ đồng)</b>
      <div class="scroll-x"><table class="thr"><thead><tr><th>Khoản mục</th><th>2023</th><th>2024</th><th>2025</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r[0])}</td>${r.slice(1).map(v=>`<td style="text-align:right;${v<0?'color:var(--dn);font-weight:700':''}">${fmt(v,0)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="note">Tự trả lời từng câu trước khi mở đáp án — nhớ lâu hơn nhiều so với đọc ngay lời giải.</p>
      ${qa.map(([q,a],i)=>`<details class="acc"><summary>${i+1}. ${esc(q)}</summary><div class="acc-b"><p style="font-size:14px">${esc(a)}</p></div></details>`).join('')}</section>`;
    fm.after(box);
  }
  if(l.act==='screen'||l.act==='styles'){
    const ps= l.act==='styles'? [['value','Giá trị'],['garp','GARP'],['growth','Tăng trưởng'],['income','Cổ tức'],['quality','Chất lượng']] : [['balanced','Mở bộ lọc La Bàn']];
    box.innerHTML=`<section class="panel" style="display:flex;flex-direction:column;gap:8px"><b style="font-family:var(--f-disp)">Áp dụng ngay trong ứng dụng</b><div class="row-btns">${ps.map(([k,n])=>`<button class="btn sm" data-lpreset="${k}">${esc(n)}</button>`).join('')}</div><p class="note">Bộ lọc xếp hạng toàn bộ cổ phiếu theo bộ trọng số bạn chọn; dùng như bước sàng lọc đầu tiên, không phải danh sách mua.</p></section>`;
    fm.after(box);
    $$('[data-lpreset]',box).forEach(b=>b.onclick=()=>{ S.preset=b.dataset.lpreset; S.scrMode='stock'; S.filters.sort='score'; S.listN=60; saveState(); computeAll(); closeSheet(); setView('screen'); toast('Đã áp dụng bộ trọng số '+(PRESETS[S.preset]?PRESETS[S.preset].n:'')); });
  }
};
