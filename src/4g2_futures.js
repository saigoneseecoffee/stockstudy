/* ============================================================
   HỢP ĐỒNG TƯƠNG LAI (FUTURES) — 4 bài + câu hỏi, cấp "Phái sinh & đòn bẩy"
   Đặc tả VN30F: HNX/VSDC (hệ số nhân 100.000đ/điểm, ký quỹ ban đầu tối thiểu 17%, bước giá 0,1, ±7%).
   ============================================================ */
const FUT_G='Hợp đồng tương lai';
const FUT_LESSONS=[
 {id:'fut-basics',g:FUT_G,t:'Hợp đồng tương lai khác quyền chọn thế nào',d:'Nghĩa vụ so với quyền: lãi lỗ tuyến tính và lãi lỗ lệch',
  vis:()=>{ const X=s=>20+(s-80)/40*170, Y=v=>66-v*2.2; const fu=s=>s-100, ca=s=>Math.max(s-100,0)-4;
    let g=`<line x1="20" x2="190" y1="${Y(0)}" y2="${Y(0)}" style="stroke:var(--mut)" stroke-width=".8"/><line x1="${X(100)}" x2="${X(100)}" y1="12" y2="118" style="stroke:var(--line2)" stroke-dasharray="2 2"/>`;
    g+=`<path d="M${X(80)} ${Y(fu(80))} L${X(120)} ${Y(fu(120))}" fill="none" style="stroke:var(--us)" stroke-width="2.2"/>`;
    g+=`<path d="M${X(80)} ${Y(ca(80))} L${X(100)} ${Y(ca(100))} L${X(120)} ${Y(ca(120))}" fill="none" style="stroke:var(--gold)" stroke-width="2.2"/>`;
    g+=T(24,20,'Mua future: lãi/lỗ đều tuyến tính','style="font-size:7.5px;font-weight:700;fill:var(--us)"')+T(24,30,'Mua call: lỗ tối đa = phí','style="font-size:7.5px;font-weight:700;fill:var(--gold)"');
    g+=T(X(100),122,'Giá vào lệnh / giá thực hiện','text-anchor="middle" style="font-size:6.5px;fill:var(--mut)"')+T(186,Y(0)-3,'0','text-anchor="end" style="font-size:7px;fill:var(--mut)"');
    return sv(g,'Đồ thị lãi lỗ: mua hợp đồng tương lai là đường thẳng, mua quyền chọn mua có lỗ giới hạn ở mức phí'); },
  f:'Lãi/lỗ = (Giá đóng − Giá mở) × Hệ số nhân × Số hợp đồng',
  pts:['Hợp đồng tương lai là thỏa thuận chuẩn hóa để mua hoặc bán một tài sản (chỉ số, hàng hóa, trái phiếu) ở giá chốt hôm nay, thanh toán vào ngày đáo hạn. Cả hai bên đều có nghĩa vụ.','Quyền chọn chỉ cho người mua quyền, không bắt buộc; đổi lại người mua trả phí ngay từ đầu.','Lãi/lỗ của future tuyến tính: giá đi bao nhiêu thì lãi hoặc lỗ bấy nhiêu, theo cả hai chiều. Không có phí quyền chọn, không mất giá theo thời gian (theta), không phụ thuộc biến động ngầm định (IV).','Mua (long) lãi khi giá tăng; bán (short) lãi khi giá giảm — bán chỉ số dễ như mua.','Đòn bẩy đến từ ký quỹ: chỉ đặt một phần giá trị hợp đồng, nên chỉ số đi 1% có thể thành 5% trên tiền ký quỹ.'],
  thr:[['Đặt cược theo hướng, chấp nhận lỗ theo biến động','Future'],['Muốn giới hạn lỗ ở mức phí đã trả','Mua quyền chọn'],['Muốn thu phí khi giá đi ngang','Bán quyền chọn (rủi ro lớn)']],
  hook:'<b>Mẹo nhớ:</b> future là <i>nghĩa vụ</i>, option là <i>quyền</i>. Quyền thì phải trả tiền mua; nghĩa vụ thì phải ký quỹ.',src:'CME Group, Futures Fundamentals; Luật Chứng khoán 2019 và Nghị định 158/2020/NĐ-CP về chứng khoán phái sinh.'},
 {id:'fut-margin',g:FUT_G,t:'Ký quỹ và lãi lỗ mỗi ngày',d:'Mark-to-market, đòn bẩy và lệnh gọi ký quỹ',
  vis:()=>{ const v=[26,27,24.5,20,26], lab=['Ngày 1','+10 điểm','−25 điểm','−45 điểm','Nộp thêm']; const Y=x=>112-x*2.9; let g='';
    g+=`<line x1="14" x2="192" y1="${Y(21)}" y2="${Y(21)}" style="stroke:var(--dn)" stroke-dasharray="3 2"/>`+T(192,21,'Ngưỡng gọi ký quỹ','text-anchor="end" style="font-size:6.5px;fill:var(--dn)"');
    v.forEach((x,i)=>{ const bx=18+i*35; g+=`<rect x="${bx}" y="${Y(x)}" width="24" height="${112-Y(x)}" rx="3" style="fill:${x<21?'var(--dn)':i===4?'var(--gold)':'var(--us)'}"/>`+T(bx+12,Y(x)-3,String(x).replace('.',','),'text-anchor="middle" style="font-size:7px;font-weight:700;fill:var(--fg)"')+T(bx+12,121,lab[i],'text-anchor="middle" style="font-size:6px;fill:var(--mut)"'); });
    g+=T(14,11,'Tiền ký quỹ (triệu đồng), 1 HĐ VN30F','style="font-size:7.5px;font-weight:700;fill:var(--fg)"');
    return sv(g,'Tiền ký quỹ thay đổi mỗi ngày theo lãi lỗ; khi xuống dưới ngưỡng thì phải nộp thêm'); },
  f:'Lãi/lỗ mỗi ngày = (Giá thanh toán hôm nay − hôm qua) × 100.000đ × Số HĐ',
  pts:['Ký quỹ ban đầu: VSDC quy định tối thiểu 17% giá trị hợp đồng VN30F; công ty chứng khoán thường yêu cầu khoảng 17–22%.','Ví dụ: 1 hợp đồng ở 1.300 điểm có giá trị 1.300 × 100.000đ = 130 triệu đồng; ký quỹ 20% là 26 triệu.','Cuối mỗi ngày, lãi/lỗ được tính theo giá thanh toán và cộng hoặc trừ ngay vào tài khoản (mark-to-market), không chờ đến ngày đáo hạn.','Chỉ số giảm 5% (65 điểm) → lỗ 6,5 triệu, bằng 25% tiền ký quỹ. Đòn bẩy xấp xỉ 1 ÷ tỷ lệ ký quỹ = 5 lần.','Tài sản ký quỹ xuống dưới ngưỡng thì bị gọi nộp thêm (margin call); không nộp kịp sẽ bị đóng vị thế bắt buộc, thường đúng lúc giá xấu nhất.','Chi phí: phí giao dịch của sở và công ty chứng khoán cho mỗi hợp đồng, phí giữ vị thế qua đêm của VSDC, và thuế.'],
  thr:[['Ký quỹ 20%','Đòn bẩy ≈ 5 lần: chỉ số 1% = vốn 5%'],['Để dư tiền ký quỹ','Chịu được vài phiên xấu mà không bị gọi ký quỹ']],
  hook:'<b>Mẹo nhớ:</b> với future, bạn không thua vào ngày đáo hạn — bạn thua từng tối một.',src:'VSDC, quy chế ký quỹ và thanh toán bù trừ chứng khoán phái sinh; HNX, đặc tả hợp đồng tương lai chỉ số VN30.'},
 {id:'fut-curve',g:FUT_G,t:'Basis, contango và chi phí cuộn',d:'Vì sao giá future khác giá chỉ số và vì sao ETF hàng hóa hao mòn',
  vis:()=>{ const X=i=>30+i*48, Yc=i=>70-i*12, Yb=i=>58+i*12; let g=`<line x1="22" x2="190" y1="64" y2="64" style="stroke:var(--mut)" stroke-dasharray="2 2"/>`+T(186,61,'Giao ngay','text-anchor="end" style="font-size:6.5px;fill:var(--mut)"');
    g+=`<path d="M${[0,1,2,3].map(i=>X(i)+' '+Yc(i)).join(' L')}" fill="none" style="stroke:var(--dn)" stroke-width="2"/><path d="M${[0,1,2,3].map(i=>X(i)+' '+Yb(i)).join(' L')}" fill="none" style="stroke:var(--up)" stroke-width="2"/>`;
    [0,1,2,3].forEach(i=>{ g+=`<circle cx="${X(i)}" cy="${Yc(i)}" r="2.5" style="fill:var(--dn)"/><circle cx="${X(i)}" cy="${Yb(i)}" r="2.5" style="fill:var(--up)"/>`+T(X(i),120,['Tháng này','Tháng sau','Quý gần','Quý xa'][i],'text-anchor="middle" style="font-size:6.5px;fill:var(--mut)"'); });
    g+=T(X(3),Yc(3)-6,'Contango','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--dn)"')+T(X(3),Yb(3)+12,'Backwardation','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--up)"')+T(22,14,'Giá các kỳ hạn của cùng một tài sản','style="font-size:7.5px;font-weight:700;fill:var(--fg)"');
    return sv(g,'Đường cong kỳ hạn: contango dốc lên, backwardation dốc xuống'); },
  f:'Giá lý thuyết F ≈ S × (1 + (r − q) × T) · Basis = F − S',
  pts:['Giá future khác giá chỉ số vì chi phí nắm giữ: lãi suất (r) trừ cổ tức (q) trong thời gian T. Với hàng hóa còn có phí kho và bảo hiểm.','Ví dụ: VN30 1.300, r 5%, q 2%, còn 1 tháng → F ≈ 1.300 × (1 + 0,03 ÷ 12) ≈ 1.303,3.','Basis = F − S. Càng gần đáo hạn, basis càng tiến về 0 vì hai giá phải gặp nhau khi thanh toán.','Contango: hợp đồng kỳ xa đắt hơn kỳ gần (đường cong dốc lên). Backwardation: kỳ xa rẻ hơn, thường khi hàng hóa đang khan hiếm.','Chi phí cuộn: muốn giữ vị thế lâu phải bán hợp đồng sắp đáo hạn và mua hợp đồng kỳ sau. Trong contango, mỗi lần cuộn là mua đắt hơn — vì thế ETF dầu, khí, VIX có thể giảm dù giá giao ngay đi ngang.','VN30F có lúc giao dịch chiết khấu so với VN30 (basis âm), phản ánh tâm lý thị trường. Basis lệch bất thường là tín hiệu cần đọc kỹ, không phải tiền miễn phí.'],
  thr:[['Basis dương','Contango — người giữ lâu chịu chi phí cuộn'],['Basis âm','Backwardation hoặc tâm lý bi quan'],['Ngày đáo hạn','Basis về 0']],
  hook:'<b>Mẹo nhớ:</b> contango = “chờ thì đắt hơn”; ETF hàng hóa nắm future trả tiền cho sự chờ đợi đó.',src:'Hull, Options, Futures, and Other Derivatives, chương 5; CME Group, Contango and Backwardation.'},
 {id:'fut-hedge',g:FUT_G,t:'VN30F, E-mini và phòng hộ danh mục',d:'Đặc tả hợp đồng Việt Nam và Mỹ, cách tính số hợp đồng phòng hộ',
  vis:()=>{ const R=[['Hệ số nhân','100.000đ/điểm','$50/điểm'],['Bước giá','0,1 điểm','0,25 điểm'],['Biên độ/phiên','±7%','Ngắt mạch'],['Đáo hạn','Hằng tháng','Hằng quý'],['Bản nhỏ','—','Micro $5']]; let g='';
    g+=`<rect x="8" y="8" width="184" height="110" rx="8" style="fill:var(--s1);stroke:var(--line2)"/>`+T(84,24,'VN30F','text-anchor="middle" style="font-size:9px;font-weight:800;fill:var(--vn)"')+T(150,24,'E-mini S&P','text-anchor="middle" style="font-size:9px;font-weight:800;fill:var(--us)"');
    R.forEach((r,i)=>{ const y=42+i*17; g+=`<line x1="14" x2="186" y1="${y-11}" y2="${y-11}" style="stroke:var(--line)"/>`+T(16,y,r[0],'style="font-size:7px;fill:var(--mut)"')+T(84,y,r[1],'text-anchor="middle" style="font-size:7.5px;font-weight:700;fill:var(--fg)"')+T(150,y,r[2],'text-anchor="middle" style="font-size:7.5px;font-weight:700;fill:var(--fg)"'); });
    return sv(g,'So sánh đặc tả hợp đồng tương lai VN30F và E-mini S&P 500'); },
  f:'Số HĐ phòng hộ = Giá trị danh mục × Beta ÷ (Giá future × Hệ số nhân)',
  pts:['VN30F (HNX): tài sản cơ sở là chỉ số VN30, hệ số nhân 100.000đ/điểm, bước giá 0,1 điểm, biên độ ±7% mỗi phiên, thanh toán bằng tiền. Có 4 kỳ hạn: tháng hiện tại, tháng kế tiếp và tháng cuối của hai quý tiếp theo; đáo hạn thứ Năm tuần thứ ba của tháng.','Mở và đóng vị thế ngay trong phiên được, khác cổ phiếu cơ sở phải chờ tiền và hàng về.','E-mini S&P 500 (CME, mã ES): $50 × chỉ số, bước giá 0,25 điểm = $12,50; bản Micro (MES) $5 × chỉ số. Đáo hạn theo quý (tháng 3, 6, 9, 12), giao dịch gần như suốt ngày đêm từ Chủ nhật đến thứ Sáu.','Phòng hộ: bán future để bù khoản lỗ của danh mục khi thị trường giảm mà không phải bán cổ phiếu (vẫn giữ cổ tức, không phát sinh thuế bán).','Ví dụ: danh mục 1 tỷ đồng, beta 1,1, VN30F ở 1.300 → 1.000.000.000 × 1,1 ÷ (1.300 × 100.000) ≈ 8,5 → bán 8–9 hợp đồng.','Phòng hộ chỉ bù phần rủi ro thị trường; nếu cổ phiếu của bạn giảm mạnh hơn chỉ số thì vẫn lỗ phần chênh lệch (rủi ro cơ sở). Khi thị trường tăng, lãi danh mục cũng bị khoản lỗ future bù trừ.'],
  thr:[['1 HĐ VN30F ở 1.300 điểm','≈ 130 triệu đồng giá trị'],['1 HĐ ES ở 6.000 điểm','≈ $300.000 giá trị'],['1 HĐ MES ở 6.000 điểm','≈ $30.000 giá trị']],
  hook:'<b>Mẹo nhớ:</b> phòng hộ là mua bảo hiểm bằng cách đặt cược ngược lại chính danh mục của mình.',src:'HNX, đặc tả hợp đồng tương lai chỉ số VN30; CME Group, E-mini và Micro E-mini S&P 500 contract specs; Hull, chương 3.'}
];
FUT_LESSONS.forEach(l=>LESSONS.push(l));
ORDER.splice(ORDER.indexOf('Quyền chọn (Options)')+1,0,FUT_G);
LESSONS.sort((a,b)=>ORDER.indexOf(a.g)-ORDER.indexOf(b.g));
/* câu hỏi được thêm vào cuối QUIZ trong 4k_levels để không xê dịch chỉ số ôn tập đã lưu */
const FUT_QUIZ=[
 {lid:'fut-basics',q:'Điểm khác cơ bản nhất giữa hợp đồng tương lai và quyền chọn?',a:['Future là nghĩa vụ của cả hai bên; quyền chọn là quyền của người mua','Future chỉ có ở Việt Nam','Quyền chọn không có ngày đáo hạn','Future phải trả phí như quyền chọn'],c:0,e:'Người mua quyền chọn trả phí để có quyền; hai bên future đặt ký quỹ và chịu lãi/lỗ theo giá.'},
 {lid:'fut-margin',q:'Mua 1 VN30F ở 1.300, đóng ở 1.320. Lãi trước phí là?',a:['2 triệu đồng','20.000 đồng','200.000 đồng','20 triệu đồng'],c:0,e:'20 điểm × 100.000đ = 2.000.000đ.'},
 {lid:'fut-margin',q:'Tỷ lệ ký quỹ 20% tương đương đòn bẩy khoảng?',a:['5 lần','20 lần','2 lần','1,2 lần'],c:0,e:'1 ÷ 0,2 = 5: chỉ số đi 1% thì tiền ký quỹ đi khoảng 5%.'},
 {lid:'fut-margin',q:'Lãi/lỗ của hợp đồng tương lai được ghi nhận khi nào?',a:['Mỗi ngày (mark-to-market)','Chỉ khi đáo hạn','Mỗi quý','Khi công bố kết quả kinh doanh'],c:0,e:'Lỗ bị trừ ngay vào tài khoản cuối ngày; thiếu ký quỹ thì bị gọi nộp thêm.'},
 {lid:'fut-curve',q:'Contango là khi?',a:['Hợp đồng kỳ xa đắt hơn kỳ gần','Hợp đồng kỳ xa rẻ hơn kỳ gần','Future bằng giá giao ngay','Future bị ngừng giao dịch'],c:0,e:'Người giữ vị thế mua lâu dài phải trả chi phí cuộn mỗi kỳ — lý do ETF dầu và VIX hao mòn.'},
 {lid:'fut-curve',q:'Vào ngày đáo hạn, basis (F − S) tiến về?',a:['0','Lãi suất','Cổ tức','7%'],c:0,e:'Giá future và chỉ số cơ sở phải hội tụ khi thanh toán.'},
 {lid:'fut-hedge',q:'Danh mục 1 tỷ đồng, beta 1, VN30F ở 1.250. Cần bán khoảng bao nhiêu hợp đồng để phòng hộ?',a:['8','80','1','12'],c:0,e:'1.000.000.000 ÷ (1.250 × 100.000) = 8.'}
];
