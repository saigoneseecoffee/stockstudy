/* ============================================================
   HỌC THUẬT: thẻ kiến thức infographic + ôn tập Leitner
   ============================================================ */
const sv=(inner,aria)=>`<svg class="chart" viewBox="0 0 200 125" role="img" aria-label="${esc(aria)}">${inner}</svg>`;
const T=(x,y,s,o)=>`<text x="${x}" y="${y}" ${o||''}>${s}</text>`;
const TS='style="font-size:8px"', TB='class="lbl-strong" style="font-size:8.5px"';
function pathFn(f,x0,x1,X,Y,n){ let d=''; n=n||60; for(let i=0;i<=n;i++){ const x=x0+(x1-x0)*i/n; d+=(i?'L':'M')+X(x).toFixed(1)+' '+Y(f(x)).toFixed(1); } return d; }
const LESSONS=[
 {id:'pe',g:'Định giá',t:'P/E và lợi suất thu nhập',d:'Trả bao nhiêu đồng cho 1 đồng lợi nhuận',
  vis:()=>{ let g=''; for(let i=0;i<20;i++){ const x=12+(i%10)*18, y=30+Math.floor(i/10)*26; g+=`<rect x="${x}" y="${y}" width="15" height="20" rx="3" style="fill:var(--gold);fill-opacity:${.35+i/32}"/>`; } return sv(g+T(100,18,'Giá = 20 năm lợi nhuận (P/E 20)','text-anchor="middle" '+TB)+T(100,100,'Lợi suất thu nhập = 1/20 = 5%','text-anchor="middle" '+TB)+T(100,114,'so với lãi suất trái phiếu','text-anchor="middle" '+TS),'P/E 20 tương đương 20 năm lợi nhuận'); },
  f:'P/E = Giá ÷ EPS<small>Lợi suất thu nhập (E/P) = 1 ÷ P/E — so trực tiếp với lợi suất trái phiếu</small>',
  pts:['P/E thấp chưa chắc rẻ: lợi nhuận có thể đang ở đỉnh chu kỳ (thép, chứng khoán) — dùng P/E chuẩn hóa hoặc P/E Shiller (CAPE).','P/E cao chưa chắc đắt nếu tăng trưởng đủ nhanh — kết hợp PEG và định giá ngược.','So sánh trong cùng ngành, cùng thị trường; P/E toàn thị trường Mỹ thường cao hơn Việt Nam do lãi suất, chất lượng lợi nhuận và rủi ro quốc gia.','Dùng EPS điều chỉnh: loại lãi/lỗ bất thường (thoái vốn, đánh giá lại tài sản).'],
  thr:[['< 10','Rẻ hoặc bẫy giá trị — kiểm tra vì sao'],['10–20','Vùng phổ biến của doanh nghiệp trưởng thành'],['20–35','Thị trường kỳ vọng tăng trưởng'],['> 35','Kỳ vọng rất cao, nhạy với thất vọng']],
  hook:'<b>Mẹo nhớ:</b> P/E là số năm lợi nhuận hiện tại cần để “trả lại” giá bạn mua.',src:'Graham & Dodd, Security Analysis (1934); Shiller, Irrational Exuberance (2000).'},
 {id:'pb',g:'Định giá',t:'P/B và P/B hợp lý',d:'Giá so với giá trị sổ sách, chìa khóa định giá ngân hàng',
  vis:()=>{ const X=v=>20+v/30*165, Y=v=>110-v/4*90; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/>`;
    g+=`<path d="${pathFn(r=>Math.max(0,(r-5)/(13-5)),0,30,X,Y)}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/>`;
    [['VCB',17,2.4,1],['MBB',21,1.4,1],['VPB',12,1.2,-1],['TCB',16,1.5,-1]].forEach(([n,r,p,d])=>g+=`<circle cx="${X(r)}" cy="${Y(p)}" r="3.5" style="fill:var(--us)"/>`+T(X(r)+5*d,Y(p)+3,n,(d<0?'text-anchor="end" ':'')+TS));
    return sv(g+T(105,122,'ROE (%) →','text-anchor="middle" '+TS)+T(24,22,'P/B','style="font-size:8px"')+T(150,38,'P/B hợp lý','style="font-size:8px;fill:var(--gold)"'),'Đường P/B hợp lý theo ROE'); },
  f:'P/B hợp lý ≈ (ROE − g) ÷ (r − g)<small>r: chi phí vốn chủ sở hữu, g: tăng trưởng dài hạn (mô hình Gordon)</small>',
  pts:['Doanh nghiệp tạo ra ROE đúng bằng chi phí vốn thì xứng đáng P/B = 1; mỗi điểm ROE vượt r làm P/B hợp lý tăng.','Ngân hàng: so P/B với ROE bền vững, chất lượng tài sản (NPL, nợ nhóm 2), CASA và CAR.','Giá trị sổ sách có thể bị thổi phồng (tài sản kém chất lượng) hoặc bị đánh giá thấp (thương hiệu, đất giá gốc).','Mã nằm dưới đường P/B hợp lý trong biểu đồ có thể đang bị định giá thấp — nếu ROE bền.'],
  thr:[['ROE 20%, r 13%, g 5%','P/B hợp lý ≈ 1,9x'],['ROE 13% = r','P/B hợp lý ≈ 1,0x'],['ROE 8% < r','P/B hợp lý < 1x — phá hủy giá trị']],
  hook:'<b>Mẹo nhớ:</b> trả bao nhiêu lần sổ sách phụ thuộc vào việc mỗi đồng vốn đẻ ra bao nhiêu so với chi phí của nó.',src:'Gordon (1959); Damodaran, Investment Valuation (3rd ed., 2012).'},
 {id:'ev',g:'Định giá',t:'EV/EBITDA',d:'Định giá cả doanh nghiệp, trung lập với cấu trúc vốn',
  vis:()=>sv(`<rect x="20" y="25" width="60" height="70" rx="4" style="fill:var(--gold);fill-opacity:.75"/>${T(50,64,'Vốn hóa','text-anchor="middle" '+TB)}<rect x="20" y="95" width="60" height="20" rx="3" style="fill:var(--dn);fill-opacity:.7"/>${T(50,108,'+ Nợ vay','text-anchor="middle" style="font-size:8px;fill:#fff"')}<rect x="88" y="25" width="34" height="16" rx="3" style="fill:var(--up);fill-opacity:.7"/>${T(105,36,'− Tiền','text-anchor="middle" style="font-size:8px;fill:#fff"')}<path d="M128 70 h12" style="stroke:var(--mut)" stroke-width="1.5"/><rect x="146" y="40" width="40" height="75" rx="4" style="fill:var(--us);fill-opacity:.7"/>${T(166,80,'EV','text-anchor="middle" style="font-size:11px;font-weight:700;fill:#fff"')}${T(100,15,'Giá trị doanh nghiệp (EV) = Vốn hóa + Nợ − Tiền','text-anchor="middle" '+TS)}`,'Cầu nối từ vốn hóa đến EV'),
  f:'EV/EBITDA = (Vốn hóa + Nợ vay − Tiền) ÷ EBITDA',
  pts:['So sánh được doanh nghiệp vay nhiều và vay ít; phổ biến khi định giá M&A.','Không dùng cho ngân hàng, chứng khoán, bảo hiểm (nợ là nguyên liệu kinh doanh).','EBITDA bỏ qua capex: với ngành thâm dụng vốn (thép, điện, viễn thông) nên xem thêm EV/EBIT hoặc EV/FCF.','Nghịch đảo EBIT/EV chính là “lợi suất thu nhập” trong Magic Formula của Greenblatt.'],
  thr:[['< 6x','Rẻ, thường ở ngành chu kỳ'],['6–12x','Trung bình'],['> 15x','Tăng trưởng hoặc chất lượng cao']],
  hook:'<b>Mẹo nhớ:</b> EV là giá để mua toàn bộ công ty — trả hết nợ, giữ lại tiền mặt.',src:'Koller, Goedhart & Wessels, Valuation (McKinsey, 7th ed., 2020).'},
 {id:'peg',g:'Định giá',t:'PEG của Peter Lynch',d:'Đặt P/E cạnh tốc độ tăng trưởng',
  vis:()=>{ const X=v=>20+v/40*165, Y=v=>110-v/60*92; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/><path d="M${X(0)} ${Y(0)} L${X(40)} ${Y(40)}" style="stroke:var(--gold)" stroke-width="2" stroke-dasharray="4 3"/>`;
    g+=`<path d="M${X(0)} ${Y(0)} L${X(40)} ${Y(40)} L${X(40)} ${Y(0)}Z" style="fill:var(--up);fill-opacity:.1"/>`;
    [[10,30],[25,20],[15,15],[35,55],[8,18]].forEach(([x,y])=>g+=`<circle cx="${X(x)}" cy="${Y(y)}" r="4" style="fill:${y<x?'var(--up)':'var(--dn)'}"/>`);
    return sv(g+T(150,100,'PEG < 1','style="font-size:9px;fill:var(--up);font-weight:700"')+T(30,30,'PEG > 1','style="font-size:9px;fill:var(--dn);font-weight:700"')+T(105,122,'Tăng trưởng EPS (%) →','text-anchor="middle" '+TS)+T(24,22,'P/E',TS),'PEG: đường P/E bằng tăng trưởng'); },
  f:'PEG = P/E ÷ Tăng trưởng EPS (%/năm)',
  pts:['PEG < 1: giá có thể chưa phản ánh hết tăng trưởng; PEG > 2: kỳ vọng rất cao.','Dùng tăng trưởng bền vững 3–5 năm, không dùng một năm phục hồi từ nền thấp (dễ ra PEG ảo rất thấp).','Lynch cộng thêm tỷ suất cổ tức cho doanh nghiệp chia cổ tức cao: (g + cổ tức) ÷ P/E.','Không áp dụng cho doanh nghiệp lỗ hoặc tăng trưởng âm.'],
  thr:[['< 0,5','Rất hấp dẫn nếu tăng trưởng thật'],['0,5–1','Hợp lý, vùng GARP'],['1–2','Đầy đủ'],['> 2','Đắt so với tăng trưởng']],
  hook:'<b>Mẹo nhớ:</b> một cổ phiếu định giá hợp lý có P/E xấp xỉ tốc độ tăng trưởng.',src:'Peter Lynch, One Up on Wall Street (1989).'},
 {id:'fcf',g:'Định giá',t:'Dòng tiền tự do (FCF)',d:'Tiền thật còn lại sau khi duy trì và mở rộng',
  vis:()=>{ const bars=[['CFO',100,0,'var(--up)'],['Capex',-38,100,'var(--dn)'],['FCF',62,0,'var(--gold)']]; const Y=v=>110-v*.85; let g=`<line class="axis" x1="10" y1="110" x2="190" y2="110"/>`;
    bars.forEach(([n,v,base,c],i)=>{ const x=22+i*58, y0=Y(base), y1=Y(base+v); g+=`<rect x="${x}" y="${Math.min(y0,y1)}" width="40" height="${Math.abs(y1-y0)}" rx="3" style="fill:${c};fill-opacity:.8"/>`+T(x+20,Math.min(y0,y1)-4,(v>0?'':'')+v,'text-anchor="middle" '+TB)+T(x+20,121,n,'text-anchor="middle" '+TS); });
    return sv(g,'Thác dòng tiền: CFO trừ capex ra FCF'); },
  f:'FCF = Dòng tiền từ HĐKD − Chi mua sắm TSCĐ<small>Tỷ suất FCF = FCF ÷ Vốn hóa</small>',
  pts:['Lợi nhuận là quan điểm, tiền mặt là sự thật: so CFO với lợi nhuận ròng nhiều năm.','FCF âm kéo dài chỉ chấp nhận được khi capex tạo ra ROIC cao (giai đoạn đầu tư như HPG Dung Quất 2).','Tỷ suất FCF cao hơn lợi suất trái phiếu chính phủ là dấu hiệu giá hấp dẫn.','FCF dùng để trả cổ tức, mua lại cổ phiếu, trả nợ hoặc M&A — xem doanh nghiệp phân bổ thế nào.'],
  thr:[['> 6%','Hấp dẫn'],['3–6%','Hợp lý'],['< 2%','Kỳ vọng tăng trưởng cao'],['Âm','Đang đầu tư hoặc kém hiệu quả']],
  hook:'<b>Mẹo nhớ:</b> “Doanh thu là phù phiếm, lợi nhuận là sự tỉnh táo, tiền mặt là thực tại.”',src:'Damodaran, Investment Valuation (2012); CFA Institute, Equity Valuation curriculum.'},
 {id:'dcf',g:'Định giá',t:'Chiết khấu dòng tiền (DCF)',d:'Giá trị = tiền tương lai quy về hôm nay',
  vis:()=>{ let g=''; for(let i=0;i<8;i++){ const cf=20*Math.pow(1.08,i), pv=cf/Math.pow(1.12,i+1); const x=14+i*20; g+=`<rect x="${x}" y="${100-cf*2}" width="14" height="${cf*2}" rx="2" style="fill:var(--line2)"/><rect x="${x}" y="${100-pv*2}" width="14" height="${pv*2}" rx="2" style="fill:var(--us);fill-opacity:.85"/>`; }
    g+=`<rect x="176" y="22" width="16" height="78" rx="2" style="fill:var(--gold);fill-opacity:.85"/>`+T(184,116,'TV','text-anchor="middle" '+TS)+T(80,116,'Năm 1 → 8','text-anchor="middle" '+TS)+T(14,14,'Xám: dòng tiền danh nghĩa · Xanh: giá trị hiện tại',TS);
    return sv(g,'Dòng tiền danh nghĩa và giá trị hiện tại'); },
  f:'V = Σ CFₜ ÷ (1 + r)ᵗ + TV ÷ (1 + r)ᴺ<small>TV = CFₙ₊₁ ÷ (r − g) — giá trị cuối kỳ (Gordon)</small>',
  pts:['Ba giả định quyết định tất cả: tăng trưởng, chi phí vốn r và tăng trưởng dài hạn g.','Giá trị cuối kỳ thường chiếm 60–80% kết quả — luôn kiểm tra độ nhạy.','g dài hạn không nên vượt tăng trưởng GDP danh nghĩa dài hạn (Mỹ ~2–3%, Việt Nam ~4–6%).','Dùng “Phòng thí nghiệm DCF” trong trang chi tiết để kéo thả từng giả định.'],
  thr:[['r − g nhỏ','Giá trị phóng đại, rất nhạy'],['TV > 75% tổng','Kết quả phụ thuộc giả định dài hạn'],['Biên an toàn','Mua khi giá thấp hơn giá trị 20–30%']],
  hook:'<b>Mẹo nhớ:</b> một đồng năm sau không bằng một đồng hôm nay — chiết khấu là cái giá của thời gian và rủi ro.',src:'Williams, The Theory of Investment Value (1938); Damodaran (2012).'},
 {id:'rdcf',g:'Định giá',t:'Định giá ngược',d:'Giá hôm nay đang “đòi hỏi” tăng trưởng bao nhiêu?',
  vis:()=>{ const X=v=>20+v/30*165, Y=v=>110-v/250*95; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/>`;
    g+=`<path d="${pathFn(x=>40*Math.pow(1.065,x),0,30,X,Y)}" fill="none" style="stroke:var(--us)" stroke-width="2.2"/><line x1="20" x2="190" y1="${Y(100)}" y2="${Y(100)}" style="stroke:var(--gold)" stroke-dasharray="4 3" stroke-width="1.5"/>`;
    const gx=Math.log(100/40)/Math.log(1.065); g+=`<circle cx="${X(gx)}" cy="${Y(100)}" r="4.5" style="fill:var(--gold)"/><line x1="${X(gx)}" x2="${X(gx)}" y1="${Y(100)}" y2="110" style="stroke:var(--gold)" stroke-dasharray="2 2"/>`;
    return sv(g+T(26,Y(100)-5,'Giá hiện tại','style="font-size:8px;fill:var(--gold)"')+T(X(gx),121,'g ngầm định ≈ '+fmt(gx,0)+'%','text-anchor="middle" '+TB)+T(150,30,'Giá trị DCF','style="font-size:8px;fill:var(--us)"'),'Giao điểm giá trị DCF với giá cho ra tăng trưởng ngầm định'); },
  f:'Tìm g sao cho DCF(g) = Giá hiện tại',
  pts:['Thay vì dự báo, hỏi ngược: thị trường đang đặt cược điều gì?','Nếu g ngầm định cao hơn hẳn khả năng thực tế của ngành → rủi ro thất vọng.','Nếu g ngầm định thấp hơn dự báo thận trọng → biên an toàn.','Phương pháp được Mauboussin & Rappaport phổ biến trong “Expectations Investing”.'],
  thr:[['g ngầm định < kỳ vọng − 4 điểm','Có thể bị định giá thấp'],['Chênh ±4 điểm','Phản ánh sát'],['g ngầm định > kỳ vọng + 4 điểm','Đang kỳ vọng quá cao']],
  hook:'<b>Mẹo nhớ:</b> đừng hỏi “nó đáng bao nhiêu”, hãy hỏi “giá này đòi hỏi điều gì phải xảy ra”.',src:'Rappaport & Mauboussin, Expectations Investing (2001; rev. 2021).'},
 {id:'graham',g:'Định giá',t:'Công thức và số Graham',d:'Hai phép thử phòng thủ kinh điển',
  vis:()=>{ let g=''; for(let i=0;i<15;i++) for(let j=0;j<3;j++) g+=`<rect x="${14+i*11.5}" y="${30+j*14}" width="10" height="12" rx="1.5" style="fill:var(--gold);fill-opacity:${j<2?.8:.35}"/>`;
    return sv(g+T(100,20,'P/E tối đa 15 × P/B tối đa 1,5 = 22,5','text-anchor="middle" '+TB)+T(100,90,'Số Graham = √(22,5 × EPS × BVPS)','text-anchor="middle" '+TB)+T(100,106,'V = EPS × (8,5 + 2g) × 4,4 ÷ Y','text-anchor="middle" style="font-size:8.5px;fill:var(--gold);font-weight:700"'),'Lưới 15 nhân 1,5 bằng 22,5'); },
  f:'V = EPS × (8,5 + 2g) × 4,4 ÷ Y<small>8,5: P/E doanh nghiệp không tăng trưởng · g: tăng trưởng 7–10 năm · Y: lợi suất trái phiếu AAA hiện tại</small>',
  pts:['Ứng dụng giới hạn g ở 15% để tránh phóng đại — Graham luôn ưu tiên thận trọng.','Số Graham chỉ hợp với doanh nghiệp tài sản hữu hình; doanh nghiệp tài sản vô hình (phần mềm) thường “trượt” dù chất lượng cao.','Biên an toàn: mua khi giá thấp hơn giá trị ước tính đủ xa để chịu được sai số.','Tiêu chí phòng thủ còn gồm: quy mô lớn, thanh khoản hiện hành > 2, cổ tức liên tục, EPS không lỗ 10 năm.'],
  thr:[['P/E × P/B < 22,5','Đạt chuẩn Graham'],['Giá < 2/3 giá trị','Biên an toàn rộng']],
  hook:'<b>Mẹo nhớ:</b> 15 và 1,5 — nhân lại thành 22,5.',src:'Benjamin Graham, The Intelligent Investor (rev. 1973), ch. 11 & 14.'},
 {id:'dupont',g:'Chất lượng',t:'Phân tích DuPont',d:'ROE đến từ biên lợi nhuận, hiệu suất hay đòn bẩy?',interactive:'dupont',
  vis:()=>sv(`<rect x="70" y="8" width="60" height="24" rx="5" style="fill:var(--gold)"/>${T(100,24,'ROE','text-anchor="middle" style="font-size:10px;font-weight:800;fill:var(--gold-ink)"')}<path d="M100 32 V44 M33 44 H167 M33 44 V56 M100 44 V56 M167 44 V56" fill="none" style="stroke:var(--line2)" stroke-width="1.5"/>${[['Biên ròng','LN/DT',33],['Vòng quay TS','DT/TS',100],['Đòn bẩy','TS/VCSH',167]].map(([a,b,x])=>`<rect x="${x-30}" y="56" width="60" height="34" rx="5" style="fill:var(--s1);stroke:var(--line2)"/>${T(x,71,a,'text-anchor="middle" '+TB)}${T(x,83,b,'text-anchor="middle" '+TS)}`).join('')}${T(66,74,'×','text-anchor="middle" style="font-size:12px;fill:var(--gold)"')}${T(134,74,'×','text-anchor="middle" style="font-size:12px;fill:var(--gold)"')}${T(100,112,'Cùng ROE 20% có thể là chất lượng — hoặc chỉ là vay nhiều','text-anchor="middle" '+TS)}`,'Cây DuPont ba nhánh'),
  f:'ROE = Biên LN ròng × Vòng quay tài sản × Đòn bẩy',
  pts:['Biên cao + vòng quay vừa: mô hình hào kinh tế (Visa, phần mềm).','Biên mỏng + vòng quay rất cao: bán lẻ hiệu quả (Costco, MWG).','ROE cao nhờ đòn bẩy lớn: dễ tổn thương khi lãi suất tăng — so ROE với ROIC.','Ngân hàng có đòn bẩy 8–12 lần là bình thường; doanh nghiệp sản xuất thì không.'],
  thr:[['ROE ≈ ROIC','Ít phụ thuộc nợ'],['ROE ≫ ROIC','Đòn bẩy cao hoặc vốn chủ âm (mua lại cổ phiếu)']],
  hook:'<b>Mẹo nhớ:</b> “Lãi – Quay – Vay”: ba cần gạt của ROE.',src:'Phương pháp DuPont (F. Donaldson Brown, 1920s); CFA Institute, Financial Reporting & Analysis.'},
 {id:'roic',g:'Chất lượng',t:'ROIC so với WACC',d:'Thước đo duy nhất của việc tạo giá trị',
  vis:()=>{ const data=[['A',28,10],['B',14,11],['C',7,12]]; let g=`<line class="axis" x1="10" y1="105" x2="190" y2="105"/>`;
    data.forEach(([n,ro,wa],i)=>{ const x=22+i*60; g+=`<rect x="${x}" y="${105-ro*3}" width="20" height="${ro*3}" rx="2" style="fill:var(--gold)"/><rect x="${x+22}" y="${105-wa*3}" width="20" height="${wa*3}" rx="2" style="fill:var(--mut);fill-opacity:.6"/>`+T(x+21,117,ro>wa?'Tạo giá trị':'Phá giá trị','text-anchor="middle" style="font-size:8px;fill:'+(ro>wa?'var(--up)':'var(--dn)')+';font-weight:700"'); });
    return sv(g+T(10,12,'Vàng: ROIC · Xám: WACC',TS),'So sánh ROIC và WACC ba doanh nghiệp'); },
  f:'Giá trị kinh tế tạo ra = (ROIC − WACC) × Vốn đầu tư<small>ROIC = NOPAT ÷ (Vốn chủ + Nợ vay − Tiền)</small>',
  pts:['Tăng trưởng chỉ tạo giá trị khi ROIC > WACC; tăng trưởng với ROIC < WACC làm mất giá trị.','ROIC cao và ổn định nhiều năm là dấu hiệu rõ nhất của hào kinh tế.','Chênh lệch ROIC − WACC thu hẹp dần theo thời gian vì cạnh tranh (mean reversion).','Magic Formula của Greenblatt dùng ROIC làm thước đo “doanh nghiệp tốt”.'],
  thr:[['ROIC > 20%','Xuất sắc'],['12–20%','Tốt'],['≈ WACC','Trung tính'],['< WACC','Phá hủy giá trị']],
  hook:'<b>Mẹo nhớ:</b> doanh nghiệp tốt là cỗ máy biến 1 đồng vốn thành nhiều hơn 1 đồng giá trị.',src:'Koller et al., Valuation (McKinsey, 2020); Stern Stewart, EVA.'},
 {id:'moat',g:'Chất lượng',t:'Năm loại hào kinh tế',d:'Nguồn gốc của ROIC cao bền vững',
  vis:()=>{ const items=[['Mạng lưới','Visa, Meta'],['Chi phí chuyển đổi','Microsoft, FPT'],['Lợi thế chi phí','Costco, HPG'],['Tài sản vô hình','KO, VNM'],['Quy mô hiệu quả','GAS, GMD']]; let g='';
    items.forEach(([a,b],i)=>{ const x=6+(i%3)*65, y=8+Math.floor(i/3)*58; g+=`<rect x="${x}" y="${y}" width="60" height="50" rx="7" style="fill:var(--s1);stroke:var(--gold)"/><circle cx="${x+30}" cy="${y+16}" r="8" style="fill:var(--gold);fill-opacity:.3;stroke:var(--gold)"/>`+T(x+30,y+19,i+1,'text-anchor="middle" style="font-size:8px;font-weight:800;fill:var(--fg)"')+T(x+30,y+35,a,'text-anchor="middle" style="font-size:7.5px;font-weight:700;fill:var(--fg)"')+T(x+30,y+45,b,'text-anchor="middle" style="font-size:7px"'); });
    return sv(g,'Năm loại lợi thế cạnh tranh'); },
  f:'Hào kinh tế = khả năng giữ ROIC > WACC trong nhiều năm',
  pts:['Hiệu ứng mạng lưới: mỗi người dùng mới làm sản phẩm giá trị hơn với người cũ.','Chi phí chuyển đổi: khách hàng ngại đổi vì tốn thời gian, rủi ro, dữ liệu.','Lợi thế chi phí: quy trình, vị trí, quy mô cho phép giá thấp hơn đối thủ mà vẫn lãi.','Tài sản vô hình: thương hiệu, bằng sáng chế, giấy phép.','Quy mô hiệu quả: thị trường chỉ đủ chỗ cho một vài người chơi (cảng, đường ống khí).'],
  thr:[['Dấu hiệu định lượng','ROIC cao 5–10 năm, biên gộp ổn định, thị phần giữ vững']],
  hook:'<b>Mẹo nhớ:</b> “Mạng – Đổi – Rẻ – Danh – Độc”.',src:'Pat Dorsey, The Little Book That Builds Wealth (2008); Morningstar Economic Moat methodology.'},
 {id:'margin',g:'Chất lượng',t:'Thác biên lợi nhuận',d:'Đồng doanh thu rơi rụng ở đâu',
  vis:()=>{ const st=[['Doanh thu',100,'var(--us)'],['LN gộp',45,'var(--gold)'],['LN HĐKD',25,'var(--gold)'],['LN ròng',18,'var(--up)']]; let g='';
    st.forEach(([n,v,c],i)=>{ const y=10+i*28, w=v*1.6; g+=`<rect x="${100-w/2}" y="${y}" width="${w}" height="22" rx="4" style="fill:${c};fill-opacity:.8"/>`+T(100,y+15,n+' '+v+'%','text-anchor="middle" style="font-size:8.5px;font-weight:700;fill:var(--fg)"'); });
    return sv(g,'Phễu biên lợi nhuận'); },
  f:'Biên gộp → Biên hoạt động → Biên ròng',
  pts:['Biên gộp phản ánh sức mạnh định giá và vị thế với nhà cung cấp.','Chênh lệch biên gộp – biên hoạt động là chi phí bán hàng, quản lý, R&D.','Biên ròng chịu tác động của lãi vay và thuế — so sánh doanh nghiệp khác cấu trúc vốn nên dùng biên hoạt động.','Xu hướng biên quan trọng hơn mức biên: biên mở rộng là tín hiệu tốt (Piotroski phép thử 8).'],
  thr:[['Biên gộp > 50%','Thường có hào kinh tế'],['Biên gộp < 15%','Hàng hóa, bán lẻ, phân phối']],
  hook:'<b>Mẹo nhớ:</b> nhìn biên gộp để thấy sức mạnh, nhìn biên hoạt động để thấy kỷ luật.',src:'CFA Institute, Financial Statement Analysis.'},
 {id:'piotroski',g:'Chất lượng',t:'Piotroski F-Score',d:'9 phép thử nhị phân cho sức khỏe kế toán',
  vis:()=>{ let g=''; const ok=[1,1,1,1,0,1,1,1,0]; const grp=['Sinh lời','Sinh lời','Sinh lời','Sinh lời','Đòn bẩy','Đòn bẩy','Đòn bẩy','Hiệu quả','Hiệu quả'];
    ok.forEach((v,i)=>{ const x=40+(i%3)*42, y=10+Math.floor(i/3)*36; g+=`<rect x="${x}" y="${y}" width="36" height="30" rx="5" style="fill:${v?'var(--up)':'var(--dn)'};fill-opacity:${v?.75:.35}"/>`+T(x+18,y+19,v?'✓':'✗','text-anchor="middle" style="font-size:12px;fill:#fff;font-weight:800"'); });
    return sv(g+T(100,122,'7/9 → sức khỏe tốt','text-anchor="middle" '+TB),'Lưới 9 phép thử Piotroski'); },
  f:'F-Score = tổng 9 phép thử (mỗi phép 0 hoặc 1)',
  pts:['Sinh lời (4): ROA dương, CFO dương, ROA tăng, CFO > lợi nhuận (dồn tích thấp).','Đòn bẩy, thanh khoản, nguồn vốn (3): nợ dài hạn giảm, current ratio tăng, không phát hành thêm cổ phiếu.','Hiệu quả (2): biên gộp tăng, vòng quay tài sản tăng.','Nghiên cứu gốc: trong nhóm P/B thấp, mua F ≥ 8 và bán F ≤ 1 tạo chênh lệch lợi nhuận đáng kể (dữ liệu Mỹ 1976–1996).'],
  thr:[['8–9','Rất mạnh'],['5–7','Trung bình khá'],['0–3','Yếu — cảnh báo']],
  hook:'<b>Mẹo nhớ:</b> 4 – 3 – 2: bốn sinh lời, ba nguồn vốn, hai hiệu quả.',src:'Piotroski, J. (2000), “Value Investing: The Use of Historical Financial Statement Information…”, Journal of Accounting Research 38.'},
 {id:'altman',g:'Chất lượng',t:'Altman Z-Score',d:'Dự báo rủi ro kiệt quệ tài chính',
  vis:()=>{ const X=v=>14+v/5*172; return sv(`<rect x="${X(0)}" y="45" width="${X(1.81)-X(0)}" height="22" rx="4" style="fill:var(--dn);fill-opacity:.75"/><rect x="${X(1.81)}" y="45" width="${X(2.99)-X(1.81)}" height="22" style="fill:var(--ref);fill-opacity:.75"/><rect x="${X(2.99)}" y="45" width="${X(5)-X(2.99)}" height="22" rx="4" style="fill:var(--up);fill-opacity:.75"/>${T(X(.9),83,'Nguy hiểm','text-anchor="middle" '+TS)}${T(X(2.4),83,'Vùng xám','text-anchor="middle" '+TS)}${T(X(4),83,'An toàn','text-anchor="middle" '+TS)}${T(X(1.81),40,'1,81','text-anchor="middle" '+TB)}${T(X(2.99),40,'2,99','text-anchor="middle" '+TB)}${T(100,20,'Z = 1,2A + 1,4B + 3,3C + 0,6D + 1,0E','text-anchor="middle" style="font-size:9px;font-weight:700;fill:var(--gold)"')}${T(100,108,'A vốn lưu động · B LN giữ lại · C EBIT (÷ tổng TS)','text-anchor="middle" '+TS)}${T(100,119,'D vốn hóa ÷ tổng nợ · E doanh thu ÷ tổng TS','text-anchor="middle" '+TS)}`,'Ba vùng Altman Z'); },
  f:'Z = 1,2·A + 1,4·B + 3,3·C + 0,6·D + 1,0·E',
  pts:['Mô hình gốc cho doanh nghiệp sản xuất niêm yết; có biến thể Z\'\' cho doanh nghiệp phi sản xuất và thị trường mới nổi.','Không áp dụng cho ngân hàng, bảo hiểm, chứng khoán.','EBIT/Tổng tài sản (C) có trọng số lớn nhất: sinh lời trên tài sản là yếu tố sống còn.','Dùng như hệ thống cảnh báo sớm, kết hợp với dòng tiền và lịch đáo hạn nợ.'],
  thr:[['> 2,99','An toàn'],['1,81–2,99','Vùng xám'],['< 1,81','Nguy cơ kiệt quệ']],
  hook:'<b>Mẹo nhớ:</b> dưới 1,8 là báo động — nhớ “1-8, cẩn thận”.',src:'Altman, E. (1968), “Financial Ratios, Discriminant Analysis and the Prediction of Corporate Bankruptcy”, Journal of Finance 23(4).'},
 {id:'bank',g:'Chất lượng',t:'Phân tích ngân hàng',d:'Bốn chỉ số thay cho P/E thông thường',
  vis:()=>{ const it=[['NIM','Biên lãi ròng','> 3,5%'],['NPL','Nợ xấu','< 1,5%'],['CASA','Tiền gửi KKH','> 30%'],['CAR','An toàn vốn','> 12%']]; let g='';
    it.forEach(([a,b,c],i)=>{ const x=8+(i%2)*96, y=8+Math.floor(i/2)*58; g+=`<rect x="${x}" y="${y}" width="88" height="50" rx="7" style="fill:var(--s1);stroke:var(--line2)"/>`+T(x+10,y+20,a,'style="font-size:12px;font-weight:800;fill:var(--gold);font-family:var(--f-disp)"')+T(x+10,y+33,b,TS)+T(x+10,y+44,'Tốt: '+c,'style="font-size:8px;fill:var(--up);font-weight:700"'); });
    return sv(g,'Bốn chỉ số ngân hàng'); },
  f:'P/B hợp lý ≈ (ROE − g) ÷ (r − g)',
  pts:['NIM: chênh lệch lãi cho vay và huy động trên tài sản sinh lãi — CASA cao giúp NIM cao.','NPL và nợ nhóm 2: chất lượng tài sản; xem thêm tỷ lệ bao phủ nợ xấu (LLR).','CAR (Basel II tại Việt Nam) hoặc CET1 (Mỹ): đệm vốn để hấp thụ thua lỗ.','Ở Việt Nam, tăng trưởng tín dụng phụ thuộc hạn mức NHNN cấp; nhiều ngân hàng chia cổ tức bằng cổ phiếu để tăng vốn.'],
  thr:[['ROE > 18%, NPL < 1,5%','Hồ sơ ngân hàng chất lượng cao'],['NPL > 3%','Cảnh báo chất lượng tài sản']],
  hook:'<b>Mẹo nhớ:</b> “Lãi – Xấu – Rẻ – Vốn”: NIM, NPL, CASA, CAR.',src:'Basel Committee (BIS); Thông tư 41/2016/TT-NHNN; FDIC CAMELS framework.'},
 {id:'divers',g:'Danh mục & rủi ro',t:'Đa dạng hóa',d:'Rủi ro nào biến mất, rủi ro nào ở lại',
  vis:()=>{ const X=v=>20+v/30*165, Y=v=>110-v/60*92; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/>`;
    g+=`<rect x="20" y="${Y(20)}" width="170" height="${110-Y(20)}" style="fill:var(--dn);fill-opacity:.12"/><path d="${pathFn(n=>20+40/n,1,30,X,Y)}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/>`;
    return sv(g+T(120,Y(20)+14,'Rủi ro hệ thống (không loại được)','text-anchor="middle" style="font-size:8px;fill:var(--dn)"')+T(80,40,'Rủi ro riêng lẻ giảm dần','style="font-size:8px;fill:var(--gold)"')+T(105,122,'Số cổ phiếu →','text-anchor="middle" '+TS),'Rủi ro danh mục giảm theo số cổ phiếu'); },
  f:'σ²ₚ = Σ wᵢ²σᵢ² + Σ Σ wᵢwⱼσᵢσⱼρᵢⱼ',
  pts:['Khoảng 20–30 cổ phiếu ít tương quan đã loại bỏ phần lớn rủi ro riêng lẻ.','Đa dạng hóa theo ngành và theo thị trường (Mỹ + Việt Nam) hiệu quả hơn tăng số mã trong cùng ngành.','Trong khủng hoảng, tương quan tăng vọt — đa dạng hóa kém hiệu quả đúng lúc cần nhất.','“Số mã hiệu dụng” = 1 ÷ Σw² (HHI) đo mức đa dạng thực sự theo tỷ trọng.'],
  thr:[['1/HHI < 5','Tập trung cao'],['5–15','Vừa phải'],['> 15','Đa dạng tốt']],
  hook:'<b>Mẹo nhớ:</b> đa dạng hóa là “bữa trưa miễn phí” duy nhất trong tài chính.',src:'Markowitz (1952); Statman, “How Many Stocks Make a Diversified Portfolio?”, JFQA (1987).'},
 {id:'frontier',g:'Danh mục & rủi ro',t:'Biên hiệu quả Markowitz',d:'Lợi nhuận tối đa cho mỗi mức rủi ro',
  vis:()=>{ const X=v=>20+v/30*165, Y=v=>110-v/20*92; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/>`;
    g+=`<path d="${pathFn(s=>4+Math.sqrt(Math.max(0,(s-8)*9)),8,30,X,Y)}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/>`;
    [[14,6],[18,8],[22,9],[25,11],[16,9],[27,14],[12,5]].forEach(([s,r])=>g+=`<circle cx="${X(s)}" cy="${Y(r)}" r="3" style="fill:var(--mut)"/>`);
    g+=`<line x1="${X(0)}" y1="${Y(4)}" x2="${X(26)}" y2="${Y(19)}" style="stroke:var(--us)" stroke-width="1.5" stroke-dasharray="4 3"/><circle cx="${X(13)}" cy="${Y(10.7)}" r="4.5" style="fill:var(--us)"/>`;
    return sv(g+T(105,122,'Rủi ro (độ lệch chuẩn) →','text-anchor="middle" '+TS)+T(24,22,'Lợi nhuận',TS)+T(X(13)+6,Y(10.7)+12,'Danh mục tiếp tuyến','style="font-size:8px;fill:var(--us)"'),'Biên hiệu quả và đường thị trường vốn'); },
  f:'Sharpe = (Rₚ − R_f) ÷ σₚ',
  pts:['Mọi danh mục nằm dưới đường cong đều “kém hiệu quả”: có cách đạt lợi nhuận cao hơn với cùng rủi ro.','Đường thẳng từ lãi suất phi rủi ro tiếp xúc biên hiệu quả tại danh mục có Sharpe cao nhất.','Đầu vào (lợi nhuận kỳ vọng, tương quan) rất khó ước lượng — kết quả tối ưu dễ cực đoan; thực tế dùng giới hạn tỷ trọng.','Nền tảng của lý thuyết danh mục hiện đại, giải Nobel 1990.'],
  thr:[['Sharpe > 1','Rất tốt'],['0,5–1','Khá'],['< 0,3','Kém']],
  hook:'<b>Mẹo nhớ:</b> không có “cổ phiếu tốt nhất”, chỉ có “danh mục hiệu quả nhất” cho khẩu vị rủi ro của bạn.',src:'Markowitz, H. (1952), “Portfolio Selection”, Journal of Finance 7(1); Sharpe (1966).'},
 {id:'capm',g:'Danh mục & rủi ro',t:'CAPM và Beta',d:'Chi phí vốn chủ sở hữu theo rủi ro hệ thống',
  vis:()=>{ const X=v=>20+v/2*165, Y=v=>110-v/24*92; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/><path d="M${X(0)} ${Y(4)} L${X(2)} ${Y(20)}" style="stroke:var(--gold)" stroke-width="2.2"/>`;
    g+=`<circle cx="${X(1.2)}" cy="${Y(14)}" r="4" style="fill:var(--up)"/>`+T(X(1.2)+6,Y(14),'alpha > 0','style="font-size:8px;fill:var(--up)"')+`<circle cx="${X(1.5)}" cy="${Y(12)}" r="4" style="fill:var(--dn)"/>`+T(X(1.5)+6,Y(12)+8,'alpha < 0','style="font-size:8px;fill:var(--dn)"');
    return sv(g+T(105,122,'Beta →','text-anchor="middle" '+TS)+T(X(1),117,'1','text-anchor="middle" '+TS)+T(24,22,'Lợi nhuận kỳ vọng',TS)+T(140,40,'Đường SML','style="font-size:8px;fill:var(--gold)"'),'Đường thị trường chứng khoán SML'); },
  f:'r = R_f + β × (R_m − R_f)',
  pts:['Beta > 1: khuếch đại biến động thị trường; < 1: phòng thủ.','Phần bù rủi ro thị trường Việt Nam thường giả định cao hơn Mỹ (rủi ro quốc gia, thanh khoản).','Ứng dụng dùng CAPM để tính chi phí vốn trong DCF; bạn có thể đổi giả định trong Cài đặt.','Beta ước lượng từ lịch sử, thay đổi theo thời gian và phụ thuộc chỉ số tham chiếu.'],
  thr:[['β < 0,7','Phòng thủ'],['0,7–1,3','Trung tính'],['> 1,3','Tấn công, chu kỳ']],
  hook:'<b>Mẹo nhớ:</b> chỉ rủi ro không thể đa dạng hóa mới được trả công.',src:'Sharpe, W. (1964), Journal of Finance 19(3); Damodaran, Country Risk Premiums (cập nhật hằng năm).'},
 {id:'sizing',g:'Danh mục & rủi ro',t:'Quy mô vị thế và Kelly',d:'Bao nhiêu là đủ cho một ý tưởng',
  vis:()=>{ const X=v=>20+v/.4*165, Y=v=>100-v/0.03*70; let g=`<line class="axis" x1="20" y1="100" x2="190" y2="100"/><line class="axis" x1="20" y1="15" x2="20" y2="115"/>`;
    const p=.55,b=1.5, G=f=>p*Math.log(1+b*f)+(1-p)*Math.log(1-f); const ks=p-(1-p)/b;
    g+=`<path d="${pathFn(G,0,.4,X,Y)}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/><line x1="${X(ks)}" x2="${X(ks)}" y1="15" y2="100" style="stroke:var(--up)" stroke-dasharray="3 3"/><line x1="${X(ks/2)}" x2="${X(ks/2)}" y1="15" y2="100" style="stroke:var(--us)" stroke-dasharray="3 3"/>`;
    return sv(g+T(X(ks)+3,24,'Kelly '+fmt(ks*100,0)+'%','style="font-size:8px;fill:var(--up)"')+T(X(ks/2)+3,36,'½ Kelly','style="font-size:8px;fill:var(--us)"')+T(105,122,'Tỷ trọng mỗi lệnh →','text-anchor="middle" '+TS)+T(24,12,'Tăng trưởng log vốn',TS),'Đường tăng trưởng vốn theo tỷ trọng Kelly'); },
  f:'f* = p − (1 − p) ÷ b<small>Quy mô theo rủi ro: số cp = (Vốn × %rủi ro) ÷ (Giá mua − Giá cắt lỗ)</small>',
  pts:['Vượt mức Kelly làm tăng biến động mà giảm tăng trưởng dài hạn; gấp đôi Kelly cho tăng trưởng gần bằng 0.','Nhà đầu tư chuyên nghiệp thường dùng ½ hoặc ¼ Kelly vì xác suất ước tính luôn sai số.','Quy tắc 1–2% rủi ro vốn mỗi lệnh giúp sống sót qua chuỗi thua liên tiếp.','Công cụ tính có trong Chuyên gia → Công cụ.'],
  thr:[['Rủi ro 0,5–1%/lệnh','Thận trọng'],['2%','Tích cực'],['> 5%','Nguy hiểm']],
  hook:'<b>Mẹo nhớ:</b> quyết định bao nhiêu quan trọng không kém quyết định mua gì.',src:'Kelly, J. L. (1956), Bell System Technical Journal 35; Thorp, “The Kelly Criterion in Blackjack, Sports Betting and the Stock Market” (2006).'},
 {id:'drawdown',g:'Danh mục & rủi ro',t:'Bất đối xứng thua lỗ',d:'Giảm 50% cần tăng 100% để hòa',
  vis:()=>{ const X=v=>20+v/80*165, Y=v=>110-v/400*95; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/><path d="${pathFn(d=>(1/(1-d/100)-1)*100,0,80,X,Y)}" fill="none" style="stroke:var(--dn)" stroke-width="2.2"/>`;
    [[20,25],[50,100],[75,300]].forEach(([d,u])=>g+=`<circle cx="${X(d)}" cy="${Y(u)}" r="3.5" style="fill:var(--gold)"/>`+T(X(d)-4,Y(u)-6,'−'+d+'% → +'+u+'%','text-anchor="end" style="font-size:8px;font-weight:700;fill:var(--fg)"'));
    return sv(g+T(105,122,'Mức giảm →','text-anchor="middle" '+TS),'Đường cong hồi phục cần thiết'); },
  f:'Mức tăng cần = 1 ÷ (1 − mức giảm) − 1',
  pts:['Giảm 10% cần 11%, giảm 33% cần 50%, giảm 50% cần 100%, giảm 75% cần 300%.','Bảo toàn vốn và cắt lỗ sớm có giá trị toán học, không chỉ tâm lý.','Luôn báo cáo mức sụt giảm tối đa (max drawdown) cạnh lợi nhuận khi đánh giá chiến lược.'],
  thr:[['Max drawdown < 20%','Danh mục phòng thủ'],['30–50%','Danh mục cổ phiếu thông thường trong khủng hoảng']],
  hook:'<b>Mẹo nhớ:</b> “Một nửa mất đi cần gấp đôi để lấy lại.”',src:'Toán học lãi kép cơ bản; Magdon-Ismail & Atiya (2004) về max drawdown.'},
 {id:'cycle',g:'Hành vi & chu kỳ',t:'Chu kỳ và xoay vòng ngành',d:'Ngành dẫn dắt thay đổi theo pha kinh tế',
  vis:()=>{ const X=v=>10+v/360*180, Y=v=>62-Math.sin(v*Math.PI/180)*38; let g=`<path d="${pathFn(a=>a,0,360,X,a=>Y(a))}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/><line class="axis" x1="10" y1="62" x2="190" y2="62" stroke-dasharray="2 3"/>`;
    [['Phục hồi','Ngân hàng, CK',45],['Mở rộng','Công nghệ, CN',135],['Đỉnh','Năng lượng, VL',200],['Suy thoái','Tiêu dùng TY, Y tế',300]].forEach(([a,b,d])=>{ const x=X(d), y=Y(d); g+=`<circle cx="${x}" cy="${y}" r="3.5" style="fill:var(--us)"/>`+T(x,d<180?y-14:y+16,a,'text-anchor="middle" '+TB)+T(x,d<180?y-5:y+25,b,'text-anchor="middle" style="font-size:7px"'); });
    return sv(g,'Chu kỳ kinh tế và ngành dẫn dắt'); },
  f:'Thị trường đi trước kinh tế khoảng 6–9 tháng',
  pts:['Phục hồi: lãi suất thấp, tín dụng tăng — ngân hàng, chứng khoán, bất động sản thường dẫn đầu.','Mở rộng: lợi nhuận tăng mạnh — công nghệ, công nghiệp, tiêu dùng không thiết yếu.','Đỉnh/cuối chu kỳ: lạm phát, giá hàng hóa cao — năng lượng, vật liệu.','Suy thoái: phòng thủ — tiêu dùng thiết yếu, y tế, tiện ích, cổ tức cao.','Mô hình chỉ là xu hướng thống kê; mỗi chu kỳ có ngoại lệ.'],
  thr:[['P/E thấp ở đỉnh chu kỳ','Bẫy với cổ phiếu chu kỳ'],['P/E cao ở đáy','Thường là lúc mua cổ phiếu chu kỳ']],
  hook:'<b>Mẹo nhớ:</b> mua cổ phiếu chu kỳ khi P/E cao, bán khi P/E thấp.',src:'Stovall, Standard & Poor\'s Guide to Sector Investing (1996); Fidelity Business Cycle Approach.'},
 {id:'bias',g:'Hành vi & chu kỳ',t:'Tám thiên kiến hành vi',d:'Kẻ thù lớn nhất của nhà đầu tư là chính mình',
  vis:()=>{ const it=['Mỏ neo','Xác nhận','Bầy đàn','Tự tin quá','Sợ mất mát','Hiệu ứng sở hữu','Gần đây','Kế toán tâm lý']; let g='';
    it.forEach((a,i)=>{ const x=6+(i%4)*48, y=14+Math.floor(i/4)*52; g+=`<rect x="${x}" y="${y}" width="44" height="44" rx="22" style="fill:var(--s1);stroke:${i%2?'var(--gold)':'var(--dn)'}"/>`+T(x+22,y+25,a,'text-anchor="middle" style="font-size:6.8px;font-weight:700;fill:var(--fg)"'); });
    return sv(g,'Tám thiên kiến hành vi'); },
  f:'Thua lỗ gây đau gấp ~2 lần niềm vui của khoản lãi tương đương',
  pts:['Mỏ neo: bám vào giá mua hoặc đỉnh cũ thay vì giá trị hiện tại.','Thiên kiến xác nhận: chỉ đọc tin ủng hộ quan điểm sẵn có.','Tâm lý bầy đàn: mua vì mọi người đang mua — phổ biến ở thị trường nhiều nhà đầu tư cá nhân như Việt Nam.','Tự tin quá mức: giao dịch quá nhiều, đa dạng hóa quá ít.','Sợ mất mát và hiệu ứng bán sớm: bán mã lãi quá sớm, giữ mã lỗ quá lâu.','Hiệu ứng gần đây: ngoại suy xu hướng ngắn hạn.','Kế toán tâm lý: coi “tiền lãi” khác “tiền gốc”.','Hiệu ứng sở hữu: định giá cao hơn thứ mình đang nắm giữ.'],
  thr:[['Liều thuốc','Quy trình viết sẵn, nhật ký đầu tư, tiêu chí định lượng như La Bàn']],
  hook:'<b>Mẹo nhớ:</b> viết luận điểm và điều kiện bán TRƯỚC khi mua.',src:'Kahneman & Tversky (1979), “Prospect Theory”, Econometrica 47; Thaler, Misbehaving (2015).'},
 {id:'compound',g:'Hành vi & chu kỳ',t:'Lãi kép và Quy tắc 72',d:'Thời gian là đòn bẩy mạnh nhất',
  vis:()=>{ const X=v=>20+v/30*165, Y=v=>110-v/18*92; let g=`<line class="axis" x1="20" y1="110" x2="190" y2="110"/><line class="axis" x1="20" y1="15" x2="20" y2="110"/>`;
    [[.06,'var(--mut)'],[.10,'var(--us)'],[.15,'var(--gold)']].forEach(([r,c])=>{ g+=`<path d="${pathFn(t=>Math.min(18,Math.pow(1+r,t)),0,30,X,Y)}" fill="none" style="stroke:${c}" stroke-width="2"/>`; });
    return sv(g+T(170,24,'15%','style="font-size:8px;fill:var(--gold);font-weight:700"')+T(176,64,'10%','style="font-size:8px;fill:var(--us);font-weight:700"')+T(176,96,'6%','style="font-size:8px;font-weight:700"')+T(105,122,'Năm →','text-anchor="middle" '+TS)+T(24,22,'Số lần vốn',TS),'Ba đường lãi kép'); },
  f:'Thời gian nhân đôi ≈ 72 ÷ lợi suất (%)',
  pts:['15%/năm trong 30 năm biến 1 đồng thành khoảng 66 đồng; 10% chỉ được khoảng 17 đồng.','Chênh lệch nhỏ về lợi suất và phí tạo khác biệt khổng lồ sau nhiều thập kỷ.','Đầu tư định kỳ (DCA) giảm rủi ro chọn thời điểm.'],
  thr:[['6%','Nhân đôi sau 12 năm'],['12%','Nhân đôi sau 6 năm'],['18%','Nhân đôi sau 4 năm']],
  hook:'<b>Mẹo nhớ:</b> chia 72 cho lãi suất.',src:'Luca Pacioli, Summa de arithmetica (1494) — ghi chép sớm nhất về Quy tắc 72.'},
 {id:'rules',g:'Thị trường Mỹ & VN',t:'Cơ chế giao dịch Mỹ – Việt Nam',d:'Biên độ, thanh toán, lô, room ngoại',
  vis:()=>sv(`<rect x="8" y="10" width="88" height="105" rx="8" style="fill:var(--s1);stroke:var(--us)"/><rect x="104" y="10" width="88" height="105" rx="8" style="fill:var(--s1);stroke:var(--vn)"/>${T(52,26,'MỸ','text-anchor="middle" style="font-size:10px;font-weight:800;fill:var(--us)"')}${T(148,26,'VIỆT NAM','text-anchor="middle" style="font-size:10px;font-weight:800;fill:var(--vn)"')}${[['T+1','T+2'],['Không biên độ','±7/10/15%'],['Lô 1 cp','Lô 100 cp'],['Ngắt mạch 7-13-20%','Room NN 49%/30%'],['9:30–16:00 ET','9:00–14:45']].map(([a,b],i)=>T(52,44+i*15,a,'text-anchor="middle" style="font-size:8px;fill:var(--fg)"')+T(148,44+i*15,b,'text-anchor="middle" style="font-size:8px;fill:var(--fg)"')).join('')}`,'So sánh cơ chế hai thị trường'),
  f:'Biên độ: HOSE ±7% · HNX ±10% · UPCoM ±15%',
  pts:['Mỹ chuyển sang thanh toán T+1 từ 28/5/2024; Việt Nam thanh toán T+2.','Việt Nam có bước giá trên HOSE: 10đ (< 10.000), 50đ (10.000–49.950), 100đ (≥ 50.000).','Mỹ không giới hạn biên độ ngày nhưng có ngắt mạch toàn thị trường (S&P 500 giảm 7%, 13%, 20%) và cơ chế LULD cho từng mã.','Giới hạn sở hữu nước ngoài tại Việt Nam: phổ biến 49%, ngân hàng 30% — mã hết room thường giao dịch với giá chênh cho nhà đầu tư ngoại.','Quy ước màu bảng điện Việt Nam: tím trần, xanh lam sàn, vàng tham chiếu, xanh lá tăng, đỏ giảm.'],
  thr:[['HOSE','±7%, lô 100'],['HNX','±10%, lô 100'],['UPCoM','±15%, lô 100'],['NYSE/NASDAQ','Không biên độ, ngắt mạch']],
  hook:'<b>Mẹo nhớ:</b> “7 – 10 – 15” cho ba sàn Việt Nam, “7 – 13 – 20” cho ngắt mạch Mỹ.',src:'SEC Release 34-96930 (T+1, 2023); Quy chế giao dịch HOSE/HNX; NYSE Rule 7.12 (circuit breakers).'},
 {id:'hours',g:'Thị trường Mỹ & VN',t:'Giờ giao dịch theo giờ Việt Nam',d:'Một ngày, hai thị trường',
  vis:()=>{ const X=h=>10+h/24*180; let g=`<rect x="10" y="50" width="180" height="22" rx="4" style="fill:var(--s1);stroke:var(--line2)"/>`;
    g+=`<rect x="${X(9)}" y="50" width="${X(11.5)-X(9)}" height="22" style="fill:var(--vn);fill-opacity:.8"/><rect x="${X(13)}" y="50" width="${X(14.75)-X(13)}" height="22" style="fill:var(--vn);fill-opacity:.8"/><rect x="${X(20.5)}" y="50" width="${X(24)-X(20.5)}" height="22" style="fill:var(--us);fill-opacity:.8"/><rect x="10" y="50" width="${X(3)-X(0)}" height="22" style="fill:var(--us);fill-opacity:.8"/>`;
    [0,6,9,12,15,18,21,24].forEach(h=>g+=T(X(h),86,h+'h','text-anchor="middle" '+TS));
    return sv(g+T(X(11.9),42,'Việt Nam','text-anchor="middle" style="font-size:9px;font-weight:700;fill:var(--vn)"')+T(X(22),42,'Mỹ (mùa hè)','text-anchor="middle" style="font-size:9px;font-weight:700;fill:var(--us)"')+T(100,108,'Giờ Mỹ lệch 1 tiếng khi hết giờ mùa hè (tháng 11–3)','text-anchor="middle" '+TS),'Dải giờ giao dịch trong 24 giờ'); },
  f:'Mỹ (giờ mùa hè): 20:30 – 03:00 giờ Việt Nam',
  pts:['Việt Nam: ATO 9:00–9:15, khớp lệnh liên tục 9:15–11:30 và 13:00–14:30, ATC 14:30–14:45; sau đó giao dịch thỏa thuận.','Mỹ: 9:30–16:00 giờ New York; giờ mùa đông là 21:30–04:00 giờ Việt Nam.','Thị trường Mỹ đóng cửa trước khi Việt Nam mở — diễn biến Phố Wall đêm qua thường ảnh hưởng tâm lý phiên sáng Việt Nam.'],
  thr:[['ATO/ATC','Phiên khớp lệnh định kỳ xác định giá mở/đóng cửa'],['Pre/After-market Mỹ','Thanh khoản thấp, chênh lệch giá rộng']],
  hook:'<b>Mẹo nhớ:</b> sáng Việt Nam, tối Mỹ — nhà đầu tư hai thị trường gần như theo dõi được suốt ngày.',src:'HOSE; NYSE trading hours.'},
 {id:'upgrade',g:'Thị trường Mỹ & VN',t:'Phân loại và nâng hạng thị trường',d:'Vì sao nâng hạng kéo dòng vốn ngoại',
  vis:()=>{ const st=['Cận biên','Mới nổi thứ cấp','Mới nổi tiên tiến','Phát triển']; let g='';
    st.forEach((a,i)=>{ const x=10+i*46, y=95-i*22; g+=`<rect x="${x}" y="${y}" width="44" height="${115-y}" rx="4" style="fill:${i===1?'var(--vn)':i===3?'var(--us)':'var(--line2)'};fill-opacity:${i===1||i===3?.8:.5}"/>`+T(x+22,y-4,a,'text-anchor="middle" style="font-size:7px;font-weight:700;fill:var(--fg)"'); });
    return sv(g+T(56,110,'VN*','text-anchor="middle" style="font-size:8px;font-weight:800;fill:#fff"')+T(148,44,'Mỹ','text-anchor="middle" style="font-size:9px;font-weight:800;fill:#fff"'),'Bậc phân loại thị trường'); },
  f:'Nâng hạng → quỹ chỉ số buộc phải phân bổ vốn',
  pts:['FTSE Russell công bố (10/2025) nâng Việt Nam từ Cận biên lên Mới nổi thứ cấp, hiệu lực theo lộ trình từ tháng 9/2026 — cần kiểm tra lại tiến độ thực tế.','MSCI vẫn xếp Việt Nam ở nhóm Cận biên (theo thông tin đến 2025); các điểm cần cải thiện gồm room ngoại, chuyển đổi ngoại tệ, mở tài khoản.','Nâng hạng mang lại dòng vốn thụ động từ quỹ ETF theo chỉ số và vốn chủ động từ quỹ mới nổi; hưởng lợi nhiều nhất là mã vốn hóa lớn, còn room.','Mỹ là thị trường phát triển, chiếm phần lớn chỉ số toàn cầu (MSCI ACWI).'],
  thr:[['Tiêu chí chính','Mở cửa với vốn ngoại, thanh khoản, hạ tầng thanh toán – lưu ký, chuyển đổi ngoại tệ']],
  hook:'<b>Mẹo nhớ:</b> nâng hạng là “tấm vé” vào danh mục của các quỹ toàn cầu.',src:'FTSE Russell Equity Country Classification (9/2025, 10/2025); MSCI Market Classification Review (2025).'}
];

RENDER.learn=function(){
  const el=$('#v-learn'); const groups=[...new Set(LESSONS.map(l=>l.g))];
  const done=S.learned.filter(id=>LESSONS.some(l=>l.id===id)).length;
  const leit=store.leit||{}; const boxes=[0,0,0,0,0]; QUIZ.forEach((_,i)=>{ boxes[clamp((leit[i]||1)-1,0,4)]++; });
  el.innerHTML=`<div class="sec-h" style="margin:0"><div><h2>Học thuật đầu tư</h2><p>${LESSONS.length} thẻ kiến thức hình ảnh · nguồn học thuật dẫn kèm</p></div></div>
  <section class="panel" style="display:grid;gap:14px;grid-template-columns:1fr;align-items:center">
    <div style="display:flex;justify-content:space-between;gap:10px;align-items:baseline"><b style="font-family:var(--f-disp);font-size:17px">Tiến độ: ${done}/${LESSONS.length} bài</b><span class="note">Kỷ lục ôn tập: ${S.quizBest}/8</span></div>
    <div class="progress" aria-label="Tiến độ học"><i style="width:${done/LESSONS.length*100}%"></i></div>
    <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
      <button class="btn pri" id="startQuiz">Ôn tập 8 câu</button>
      <div style="display:flex;gap:4px;align-items:flex-end;height:34px" aria-label="Phân bố hộp Leitner">${boxes.map((n,i)=>`<div style="display:flex;flex-direction:column;align-items:center;gap:2px"><i style="display:block;width:18px;height:${4+n*1.4}px;border-radius:3px;background:var(--gold);opacity:${.35+i*.16}"></i><span style="font-size:10px;color:var(--mut)">H${i+1}</span></div>`).join('')}</div>
      <p class="note" style="flex:1;min-width:180px">Hệ thống hộp Leitner: trả lời đúng, câu hỏi lên hộp cao và ít xuất hiện lại; trả lời sai, câu quay về hộp 1.</p>
    </div>
  </section>
  ${groups.map(g=>`<section><div class="sec-h"><h2 style="font-size:18px">${esc(g)}</h2></div><div class="learn-grid">${LESSONS.filter(l=>l.g===g).map(l=>`<button class="lcard" data-lesson="${l.id}"><span class="th">${l.vis()}${S.learned.includes(l.id)?'<span class="done" aria-label="Đã học"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 12l5 5 9-10"/></svg></span>':''}</span><span class="tx"><b>${esc(l.t)}</b><span>${esc(l.d)}</span></span></button>`).join('')}</div></section>`).join('')}`;
  $('#startQuiz').onclick=startQuiz;
};
function openLesson(id){
  const l=LESSONS.find(x=>x.id===id); if(!l) return;
  const idx=LESSONS.indexOf(l); const next=LESSONS[(idx+1)%LESSONS.length];
  const html=`<div class="lesson">
    <p class="note">${typeof lessonCrumb==='function'?lessonCrumb(l):esc(l.g)+' · Bài '+(idx+1)+'/'+LESSONS.length}</p>
    <div class="vis">${l.vis()}</div>
    <div class="formula">${l.f}</div>
    ${l.interactive==='dupont'?`<section class="panel" style="display:flex;flex-direction:column;gap:10px"><b style="font-family:var(--f-disp)">Thử nghiệm DuPont</b>
      <label class="slider-row"><span>Biên ròng</span><input type="range" id="duN" min="1" max="40" step="0.5" value="10"><output id="duNo"></output></label>
      <label class="slider-row"><span>Vòng quay TS</span><input type="range" id="duA" min="0.1" max="3" step="0.05" value="0.8"><output id="duAo"></output></label>
      <label class="slider-row"><span>Đòn bẩy</span><input type="range" id="duL" min="1" max="12" step="0.1" value="2"><output id="duLo"></output></label>
      <div class="result" id="duOut"></div></section>`:''}
    <ul class="bul">${l.pts.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
    ${l.thr&&l.thr.length?`<table class="thr"><thead><tr><th>Mốc</th><th>Diễn giải</th></tr></thead><tbody>${l.thr.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td></tr>`).join('')}</tbody></table>`:''}
    <div class="hook">${l.hook}</div>
    <p class="note"><b>Nguồn:</b> ${esc(l.src)}</p>
    <div class="row-btns"><button class="btn ${S.learned.includes(l.id)?'':'pri'}" id="lDone">${S.learned.includes(l.id)?'✓ Đã học':'Đánh dấu đã học'}</button><button class="btn" id="lNext">Bài tiếp: ${esc(next.t)}</button></div>
  </div>`;
  openSheet(l.t,html,body=>{
    $('#lDone').onclick=()=>{ if(!S.learned.includes(l.id)) S.learned.push(l.id); else S.learned=S.learned.filter(x=>x!==l.id); saveState(); if(S.view==='learn') RENDER.learn(); openLesson(l.id); };
    $('#lNext').onclick=()=>openLesson(next.id);
    if(l.interactive==='dupont'){ const up=()=>{ const n=+$('#duN').value,a=+$('#duA').value,L=+$('#duL').value; $('#duNo').textContent=fmt(n,1)+'%'; $('#duAo').textContent=fmt(a,2)+'x'; $('#duLo').textContent=fmt(L,1)+'x'; const roe=n*a*L, roa=n*a;
      $('#duOut').innerHTML=`<div><b class="gold">${pct(roe,1)}</b><span>ROE</span></div><div><b>${pct(roa,1)}</b><span>ROA = biên × vòng quay</span></div><div><b>${L>4?'<span class="dn">Cao</span>':'Vừa phải'}</b><span>Mức đòn bẩy (${L>4?'phụ thuộc nợ':'lành mạnh với DN phi tài chính'})</span></div>`; };
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
      $('#sheetBody').innerHTML=`<div class="lesson" style="text-align:center;align-items:center"><div class="bigring" style="margin:10px auto">${ringSVG(st.score/st.qs.length*100,108,9)}<div class="v"><b>${st.score}/${st.qs.length}</b><span>câu đúng</span></div></div>
        <p>${st.score>=7?'Xuất sắc — kiến thức đang vào hộp dài hạn.':st.score>=5?'Khá tốt. Các câu sai sẽ quay lại sớm hơn.':'Hãy xem lại các thẻ kiến thức liên quan rồi ôn lần nữa.'}</p>
        <div class="row-btns" style="justify-content:center"><button class="btn pri" id="qAgain">Ôn thêm 8 câu</button><button class="btn" id="qClose">Về thư viện</button></div></div>`;
      animateRings($('#sheetBody')); $('#qAgain').onclick=startQuiz; $('#qClose').onclick=()=>{ closeSheet(); if(S.view==='learn') RENDER.learn(); }; return; }
    const qi=st.qs[st.k], Q=QUIZ[qi]; const order=shuffle(Q.a.map((t,i)=>({t,i})));
    $('#sheetBody').innerHTML=`<div class="lesson"><div style="display:flex;justify-content:space-between;align-items:center"><span class="note">Câu ${st.k+1}/${st.qs.length} · Hộp ${(store.leit||{})[qi]||1}</span><span class="note">Đúng: ${st.score}</span></div>
      <div class="progress"><i style="width:${st.k/st.qs.length*100}%"></i></div>
      <h3 style="font-size:19px;line-height:1.3">${esc(Q.q)}</h3>
      <div style="display:flex;flex-direction:column;gap:8px" id="qOpts">${order.map(o=>`<button class="quiz-opt" data-i="${o.i}">${esc(o.t)}</button>`).join('')}</div>
      <div class="row-btns"><button class="btn sm ghost" id="qHint">Gợi ý: loại một đáp án sai</button></div>
      <div id="qFb"></div></div>`;
    let answered=false;
    $('#qHint').onclick=()=>{ const wrong=$$('#qOpts .quiz-opt').filter(b=>+b.dataset.i!==Q.c&&!b.disabled); if(wrong.length>1){ const w=wrong[Math.floor(Math.random()*wrong.length)]; w.disabled=true; w.style.opacity=.35; } $('#qHint').disabled=true; };
    $$('#qOpts .quiz-opt').forEach(b=>b.onclick=()=>{ if(answered) return; answered=true; const ok=+b.dataset.i===Q.c;
      $$('#qOpts .quiz-opt').forEach(x=>{ if(+x.dataset.i===Q.c) x.classList.add('ok'); x.disabled=true; }); if(!ok) b.classList.add('bad');
      const leit=store.leit||{}; leit[qi]= ok? Math.min(5,(leit[qi]||1)+1) : 1; store.leit=leit; persist(); if(ok) st.score++;
      $('#qHint').disabled=true;
      $('#qFb').innerHTML=`<div class="hook" style="border-color:${ok?'var(--up)':'var(--dn)'}"><b style="color:${ok?'var(--up)':'var(--dn)'}">${ok?'Chính xác.':'Chưa đúng.'}</b> ${esc(Q.e)}</div><div class="row-btns" style="margin-top:10px"><button class="btn pri" id="qNext">${st.k+1<st.qs.length?'Câu tiếp':'Xem kết quả'}</button></div>`;
      $('#qNext').onclick=()=>{ st.k++; render(); }; $('#qNext').focus({preventScroll:true}); });
  };
  openSheet('Ôn tập kiến thức','',()=>render());
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

