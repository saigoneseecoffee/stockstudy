/* ============================================================
   THƯ VIỆN MẪU NẾN · MÔ HÌNH GIÁ · BÀI HỌC KỸ THUẬT · ÔN TẬP NHẬN DIỆN
   ============================================================ */
/* Mỗi mẫu: nến [mở, cao, thấp, đóng] trên thang 0–100; ctx = xu hướng trước đó */
const CDL=[
 {id:'doji',n:'Doji',en:'Doji',cat:'Lưỡng lự',ctx:'none',rel:'Thấp',k:1,c:[[50,64,36,50.6]],
  d:'Giá mở và đóng gần như bằng nhau: phe mua và bán cân bằng. Bản thân Doji không phải tín hiệu; ý nghĩa đến từ vị trí — sau một xu hướng dài, Doji báo động lực đang cạn.',cf:'Chờ nến kế tiếp đóng cửa theo hướng ngược xu hướng cũ.',h:'Dấu cộng = “chưa ai thắng”.'},
 {id:'dragonfly',n:'Doji chuồn chuồn',en:'Dragonfly Doji',cat:'Đảo chiều tăng',ctx:'down',rel:'Trung bình',k:1,c:[[60,60.6,28,60.4]],
  d:'Mở, đóng và cao nhất trùng nhau, bóng dưới rất dài: phe bán đẩy giá xuống sâu nhưng phe mua kéo lên hết vào cuối phiên.',cf:'Nến tăng tiếp theo, tốt hơn nếu khối lượng lớn.',h:'Chữ T — rễ cắm sâu, cây đứng vững.'},
 {id:'gravestone',n:'Doji bia mộ',en:'Gravestone Doji',cat:'Đảo chiều giảm',ctx:'up',rel:'Trung bình',k:1,c:[[40,72,39.4,40.4]],
  d:'Mở, đóng và thấp nhất trùng nhau, bóng trên dài: phe mua thử lên cao nhưng bị bán ngược về điểm xuất phát.',cf:'Nến giảm tiếp theo đóng dưới thân Doji.',h:'Chữ T ngược — tấm bia trên đỉnh.'},
 {id:'longleg',n:'Doji chân dài',en:'Long-legged Doji',cat:'Lưỡng lự',ctx:'none',rel:'Thấp',k:1,c:[[50,74,26,50.6]],
  d:'Hai bóng đều dài, thân gần như không có: biến động mạnh trong phiên nhưng kết thúc hòa — thị trường rất do dự.',cf:'Quan sát phá vỡ đỉnh hoặc đáy của nến này.',h:'Người dang tay chân — đứng giữa ngã ba.'},
 {id:'spinning',n:'Con xoay',en:'Spinning Top',cat:'Lưỡng lự',ctx:'none',rel:'Thấp',k:1,c:[[47,64,36,54]],
  d:'Thân nhỏ ở giữa, hai bóng tương đối dài: lực mua bán yếu dần, xu hướng có thể tạm nghỉ.',cf:'Cần nến xác nhận.',h:'Con quay mất đà.'},
 {id:'marubozuup',n:'Marubozu tăng',en:'Bullish Marubozu',cat:'Tiếp diễn',ctx:'none',rel:'Trung bình',k:1,c:[[28,72,28,72]],
  d:'Nến tăng không có bóng: mở cửa ở thấp nhất, đóng cửa ở cao nhất. Phe mua kiểm soát hoàn toàn suốt phiên.',cf:'Nến sau không xóa quá nửa thân.',h:'Khối đặc màu tăng — không ai cản.'},
 {id:'marubozudn',n:'Marubozu giảm',en:'Bearish Marubozu',cat:'Tiếp diễn',ctx:'none',rel:'Trung bình',k:1,c:[[72,72,28,28]],
  d:'Nến giảm không có bóng: phe bán áp đảo từ đầu đến cuối phiên.',cf:'Nến sau không hồi quá nửa thân.',h:'Khối đặc màu giảm — rơi tự do.'},
 {id:'hammer',n:'Búa',en:'Hammer',cat:'Đảo chiều tăng',ctx:'down',rel:'Trung bình',k:1,c:[[50,57,28,56]],
  d:'Xuất hiện sau nhịp giảm: thân nhỏ ở phía trên, bóng dưới dài ít nhất gấp đôi thân. Lực bán bị hấp thụ, phe mua phản công.',cf:'Phiên sau đóng cửa trên đỉnh của Búa.',h:'Cây búa đóng xuống đáy.'},
 {id:'invhammer',n:'Búa ngược',en:'Inverted Hammer',cat:'Đảo chiều tăng',ctx:'down',rel:'Thấp',k:1,c:[[30,58,29,35]],
  d:'Sau nhịp giảm, thân nhỏ ở dưới, bóng trên dài: phe mua đã thử đẩy giá lên — tín hiệu sớm nhưng yếu.',cf:'Bắt buộc có nến tăng xác nhận.',h:'Búa dựng ngược ở đáy.'},
 {id:'hangingman',n:'Người treo cổ',en:'Hanging Man',cat:'Đảo chiều giảm',ctx:'up',rel:'Thấp',k:1,c:[[66,67,44,61]],
  d:'Cùng hình dáng với Búa nhưng xuất hiện sau nhịp tăng: phe bán đã kéo giá xuống mạnh trong phiên — cảnh báo phe mua yếu dần.',cf:'Phiên sau đóng dưới thân nến.',h:'Hình như Búa — ở đỉnh thì thành người treo.'},
 {id:'shootingstar',n:'Sao băng',en:'Shooting Star',cat:'Đảo chiều giảm',ctx:'up',rel:'Trung bình',k:1,c:[[62,84,57,58]],
  d:'Sau nhịp tăng: thân nhỏ ở dưới, bóng trên dài gấp đôi thân. Giá bị từ chối mạnh ở vùng cao.',cf:'Nến giảm tiếp theo, khối lượng lớn.',h:'Ngôi sao vụt lên rồi rơi.'},
 {id:'bullengulf',n:'Nhấn chìm tăng',en:'Bullish Engulfing',cat:'Đảo chiều tăng',ctx:'down',rel:'Cao',k:2,c:[[48,50,40,42],[40,56,39,54]],
  d:'Nến tăng thân lớn bao trùm hoàn toàn thân nến giảm trước đó: cán cân đổi chiều rõ rệt trong một phiên.',cf:'Khối lượng phiên nhấn chìm cao hơn trung bình; phiên sau giữ trên đáy.',h:'Con cá lớn nuốt con cá nhỏ — màu tăng.'},
 {id:'bearengulf',n:'Nhấn chìm giảm',en:'Bearish Engulfing',cat:'Đảo chiều giảm',ctx:'up',rel:'Cao',k:2,c:[[52,60,50,58],[60,61,44,46]],
  d:'Nến giảm thân lớn bao trùm thân nến tăng trước đó ở vùng đỉnh: phe bán giành quyền kiểm soát.',cf:'Phiên sau đóng dưới đáy nến nhấn chìm.',h:'Con cá lớn màu giảm nuốt cá nhỏ.'},
 {id:'bullharami',n:'Harami tăng',en:'Bullish Harami',cat:'Đảo chiều tăng',ctx:'down',rel:'Trung bình',k:2,c:[[62,63,38,40],[45,52,44,50]],
  d:'Nến tăng nhỏ nằm gọn trong thân nến giảm lớn trước đó (“người mẹ mang thai”): lực bán đột ngột chững lại.',cf:'Phiên thứ ba đóng trên thân nến mẹ — tạo thành Three Inside Up.',h:'Harami = “mang thai” trong tiếng Nhật.'},
 {id:'bearharami',n:'Harami giảm',en:'Bearish Harami',cat:'Đảo chiều giảm',ctx:'up',rel:'Trung bình',k:2,c:[[38,62,37,60],[55,56,48,50]],
  d:'Nến giảm nhỏ nằm trong thân nến tăng lớn ở vùng đỉnh: đà tăng đứt quãng.',cf:'Phiên sau đóng dưới thân nến mẹ.',h:'Mẹ màu tăng ôm con màu giảm.'},
 {id:'haramicross',n:'Harami thập tự',en:'Harami Cross',cat:'Đảo chiều tăng',ctx:'down',rel:'Trung bình',k:2,c:[[62,63,38,40],[49,54,45,49.4]],
  d:'Biến thể của Harami với nến con là Doji: sự do dự rõ hơn, tín hiệu mạnh hơn Harami thường.',cf:'Nến tăng xác nhận.',h:'Dấu thập nằm trong bụng mẹ.'},
 {id:'piercing',n:'Đường xuyên',en:'Piercing Line',cat:'Đảo chiều tăng',ctx:'down',rel:'Trung bình',k:2,c:[[62,63,40,42],[37,56,36,55]],
  d:'Phiên hai mở cửa thấp hơn đáy phiên trước rồi tăng mạnh, đóng cửa trên điểm giữa thân nến giảm.',cf:'Đóng trên 50% thân nến trước là tối thiểu; càng cao càng mạnh.',h:'Mũi tên xuyên qua nửa thân.'},
 {id:'darkcloud',n:'Mây đen che phủ',en:'Dark Cloud Cover',cat:'Đảo chiều giảm',ctx:'up',rel:'Trung bình',k:2,c:[[38,60,37,58],[63,64,44,45]],
  d:'Phiên hai mở cửa cao hơn đỉnh trước rồi giảm sâu, đóng dưới điểm giữa thân nến tăng.',cf:'Phiên sau tiếp tục giảm.',h:'Mây đen phủ nửa bầu trời.'},
 {id:'morningstar',n:'Sao mai',en:'Morning Star',cat:'Đảo chiều tăng',ctx:'down',rel:'Cao',k:3,c:[[62,63,44,46],[42,44,38,40],[44,60,43,58]],
  d:'Ba nến: giảm dài, nến thân nhỏ (ngôi sao) và tăng dài đóng sâu vào thân nến đầu. Một trong những mẫu đảo chiều đáy đáng tin cậy nhất.',cf:'Nến thứ ba đóng trên 50% thân nến đầu, khối lượng tăng.',h:'Sao mai mọc — trời sắp sáng.'},
 {id:'eveningstar',n:'Sao hôm',en:'Evening Star',cat:'Đảo chiều giảm',ctx:'up',rel:'Cao',k:3,c:[[38,56,37,54],[58,62,57,60],[56,57,40,42]],
  d:'Ba nến: tăng dài, ngôi sao thân nhỏ ở đỉnh và giảm dài đóng sâu vào thân nến đầu.',cf:'Nến thứ ba đóng dưới 50% thân nến đầu.',h:'Sao hôm lên — trời sắp tối.'},
 {id:'morningdoji',n:'Sao mai Doji',en:'Morning Doji Star',cat:'Đảo chiều tăng',ctx:'down',rel:'Cao',k:3,c:[[62,63,44,46],[41,44,37,41.4],[44,60,43,58]],
  d:'Sao mai với ngôi sao là Doji: sự cân bằng tuyệt đối trước khi đảo chiều — tín hiệu mạnh hơn sao mai thường.',cf:'Như sao mai.',h:'Ngôi sao hình chữ thập.'},
 {id:'abandoned',n:'Em bé bị bỏ rơi',en:'Abandoned Baby',cat:'Đảo chiều tăng',ctx:'down',rel:'Cao',k:3,c:[[62,63,44,46],[37.6,40,35,37.8],[44,60,43,58]],
  d:'Doji nằm biệt lập với khoảng trống giá (gap) ở cả hai phía. Hiếm gặp nhưng rất mạnh; ở thị trường Việt Nam ít xuất hiện vì giá mở cửa thường sát giá đóng phiên trước.',cf:'Gap phía sau không bị lấp trong vài phiên.',h:'Đứa bé bị bỏ lại giữa hai bờ gap.'},
 {id:'soldiers',n:'Ba chàng lính trắng',en:'Three White Soldiers',cat:'Đảo chiều tăng',ctx:'down',rel:'Cao',k:3,c:[[34,45,33,44],[41,53,40,52],[49,61,48,60]],
  d:'Ba nến tăng thân dài liên tiếp, mỗi nến mở trong thân nến trước và đóng gần đỉnh: phe mua tiến công có kỷ luật.',cf:'Bóng trên ngắn; nếu bóng trên dài dần là dấu hiệu đuối sức.',h:'Ba người lính bước lên bậc thang.'},
 {id:'crows',n:'Ba con quạ đen',en:'Three Black Crows',cat:'Đảo chiều giảm',ctx:'up',rel:'Cao',k:3,c:[[66,67,55,56],[58,59,47,48],[50,51,39,40]],
  d:'Ba nến giảm dài liên tiếp ở vùng đỉnh, mỗi nến mở trong thân nến trước và đóng gần đáy.',cf:'Khối lượng tăng dần.',h:'Ba con quạ đậu bậc thang đi xuống.'},
 {id:'tweezerbot',n:'Nhíp đáy',en:'Tweezer Bottom',cat:'Đảo chiều tăng',ctx:'down',rel:'Thấp',k:2,c:[[52,53,36,40],[40,50,36,48]],
  d:'Hai nến liên tiếp có đáy bằng nhau: vùng giá đó được bảo vệ hai lần — hình thành hỗ trợ ngắn hạn.',cf:'Thường đi kèm mẫu khác (búa, nhấn chìm) mới đáng tin.',h:'Hai càng nhíp chạm cùng một điểm.'},
 {id:'tweezertop',n:'Nhíp đỉnh',en:'Tweezer Top',cat:'Đảo chiều giảm',ctx:'up',rel:'Thấp',k:2,c:[[50,64,49,60],[60,64,50,52]],
  d:'Hai nến có đỉnh bằng nhau: kháng cự ngắn hạn được xác lập.',cf:'Nến giảm tiếp theo.',h:'Nhíp kẹp đỉnh.'},
 {id:'rising3',n:'Ba phương pháp tăng',en:'Rising Three Methods',cat:'Tiếp diễn',ctx:'up',rel:'Trung bình',k:5,c:[[34,52,33,50],[49,50,44,46],[47,48,43,44],[45,47,41,43],[44,62,43,60]],
  d:'Nến tăng dài, ba nến điều chỉnh nhỏ nằm trong biên độ nến đầu, rồi nến tăng dài phá đỉnh: xu hướng tăng nghỉ ngơi rồi tiếp diễn.',cf:'Nến cuối đóng trên đỉnh nến đầu.',h:'Lên — nghỉ ba nhịp — lên tiếp.'},
 {id:'falling3',n:'Ba phương pháp giảm',en:'Falling Three Methods',cat:'Tiếp diễn',ctx:'down',rel:'Trung bình',k:5,c:[[66,67,48,50],[51,56,50,54],[53,57,52,56],[55,58,54,57],[56,57,38,40]],
  d:'Phiên bản giảm: nến giảm dài, ba nến hồi nhỏ, rồi nến giảm dài phá đáy.',cf:'Nến cuối đóng dưới đáy nến đầu.',h:'Xuống — nghỉ — xuống tiếp.'},
 {id:'kickerup',n:'Cú đá tăng',en:'Bullish Kicker',cat:'Đảo chiều tăng',ctx:'down',rel:'Cao',k:2,c:[[52,53,42,44],[56,70,55,69]],
  d:'Nến giảm rồi nến tăng mở gap lên trên giá mở cửa nến trước: thay đổi tâm lý đột ngột, thường do tin tức.',cf:'Gap không bị lấp.',h:'Một cú đá đổi hướng.'},
 {id:'kickerdn',n:'Cú đá giảm',en:'Bearish Kicker',cat:'Đảo chiều giảm',ctx:'up',rel:'Cao',k:2,c:[[48,58,47,56],[44,45,30,31]],
  d:'Nến tăng rồi nến giảm mở gap xuống dưới giá mở nến trước.',cf:'Gap không bị lấp.',h:'Cú đá ngược chiều.'},
 {id:'belthold',n:'Nắm thắt lưng tăng',en:'Bullish Belt Hold',cat:'Đảo chiều tăng',ctx:'down',rel:'Thấp',k:1,c:[[38,58,38,57]],
  d:'Sau nhịp giảm, nến mở cửa ở đúng giá thấp nhất rồi tăng một mạch.',cf:'Phiên sau giữ trên điểm giữa thân.',h:'Nắm thắt lưng nhấc bổng lên.'},
 {id:'threeinside',n:'Ba nến bên trong tăng',en:'Three Inside Up',cat:'Đảo chiều tăng',ctx:'down',rel:'Cao',k:3,c:[[62,63,40,42],[45,52,44,50],[50,64,49,63]],
  d:'Harami tăng được xác nhận bởi nến thứ ba đóng trên đỉnh nến mẹ.',cf:'Bản thân mẫu đã chứa xác nhận.',h:'Harami + xác nhận = ba nến bên trong.'},
 {id:'threeoutside',n:'Ba nến bên ngoài giảm',en:'Three Outside Down',cat:'Đảo chiều giảm',ctx:'up',rel:'Cao',k:3,c:[[52,58,51,56],[58,59,46,48],[48,49,38,40]],
  d:'Nhấn chìm giảm được xác nhận bởi nến giảm thứ ba đóng thấp hơn.',cf:'Bản thân mẫu đã chứa xác nhận.',h:'Nhấn chìm + xác nhận.'},
 {id:'tasuki',n:'Khoảng trống Tasuki tăng',en:'Upside Tasuki Gap',cat:'Tiếp diễn',ctx:'up',rel:'Thấp',k:3,c:[[38,50,37,49],[52,60,51,59],[57,58,50,51]],
  d:'Hai nến tăng có gap, nến giảm thứ ba lấp một phần nhưng không lấp hết gap: xu hướng tăng vẫn giữ.',cf:'Gap không bị lấp hoàn toàn.',h:'Dây buộc (tasuki) giữ khoảng trống.'}
];
const PATTERN_NAME={}, PATTERN_ABBR={morningstar:'SM',eveningstar:'SH',soldiers:'3L',crows:'3Q',bullengulf:'NC',bearengulf:'NC',piercing:'ĐX',darkcloud:'MĐ',bullharami:'H',bearharami:'H',hammer:'B',hangingman:'TC',shootingstar:'SB',invhammer:'BN',doji:'D',dragonfly:'DC',gravestone:'DM'};
CDL.forEach(p=>PATTERN_NAME[p.id]=p.n);

function cdlSVG(p,opt){
  opt=opt||{}; const ctxN=p.ctx==='none'?1:3; const all=[]; const first=p.c[0]; const fh=first[1], fl=first[2];
  const f0=Math.max(first[0],first[3]), f1=Math.min(first[0],first[3]);
  if(p.ctx==='down'){ for(let i=0;i<ctxN;i++){ const c=f0+(ctxN-1-i)*7+1, o=c+7; all.push({b:[o,o+1.5,c-1.5,c],ctx:1}); } }
  else if(p.ctx==='up'){ for(let i=0;i<ctxN;i++){ const c=f1-(ctxN-1-i)*7-1, o=c-7; all.push({b:[o,c+1.5,o-1.5,c],ctx:1}); } }
  else all.push({b:[48,56,44,52],ctx:1});
  p.c.forEach(b=>all.push({b,ctx:0}));
  let lo=Infinity,hi=-Infinity; all.forEach(x=>{ lo=Math.min(lo,x.b[2]); hi=Math.max(hi,x.b[1]); }); const pad=(hi-lo)*.08; lo-=pad; hi+=pad;
  const W=200,H=opt.h||125, bw=Math.min(20,150/all.length*.6), step=Math.min(34,180/all.length), x0=(W-step*all.length)/2+step/2;
  const Y=v=>8+(hi-v)/(hi-lo)*(H-16); let g='';
  all.forEach((x,i)=>{ const [o,h,l,c]=x.b; const up=c>=o; const dj=Math.abs(c-o)<=(h-l)*.04; const col=x.ctx?'var(--mut2)':dj?'var(--ref)':up?'var(--up)':'var(--dn)'; const cx=x0+i*step; const yt=Y(Math.max(o,c)), yb=Y(Math.min(o,c));
    g+=`<line x1="${cx}" x2="${cx}" y1="${Y(h).toFixed(1)}" y2="${Y(l).toFixed(1)}" style="stroke:${col}" stroke-width="1.6"/><rect x="${(cx-bw/2).toFixed(1)}" y="${yt.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(1.6,yb-yt).toFixed(1)}" rx="1.5" style="fill:${col};fill-opacity:${x.ctx?.45:1};stroke:${col}"/>`; });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mẫu nến ${esc(p.n)}">${g}</svg>`;
}
/* ---------- mô hình giá ---------- */
const CPAT=[
 {id:'hs',n:'Vai – đầu – vai',cat:'Đảo chiều giảm',rel:'Cao',pts:[[5,108],[30,62],[50,80],[82,28],[112,80],[132,62],[152,82],[180,112]],neck:[[40,79],[195,83]],tgt:[186,83,118],
  d:'Ba đỉnh, đỉnh giữa cao nhất. Khi giá đóng cửa thủng đường viền cổ (neckline), xu hướng tăng thường kết thúc.',m:'Mục tiêu = khoảng cách từ đầu tới đường viền cổ, đo xuống từ điểm phá vỡ.',v:'Khối lượng giảm dần qua vai phải, tăng khi phá cổ.'},
 {id:'ihs',n:'Vai – đầu – vai ngược',cat:'Đảo chiều tăng',rel:'Cao',pts:[[5,12],[30,58],[50,40],[82,92],[112,40],[132,58],[152,38],[180,8]],neck:[[40,41],[195,37]],tgt:[186,37,4],
  d:'Phiên bản đáy: ba đáy, đáy giữa sâu nhất. Phá đường viền cổ lên trên xác nhận đảo chiều tăng.',m:'Mục tiêu = độ sâu của đầu, đo lên từ điểm phá vỡ.',v:'Khối lượng phải tăng rõ khi phá cổ.'},
 {id:'dtop',n:'Hai đỉnh',cat:'Đảo chiều giảm',rel:'Trung bình',pts:[[5,110],[48,34],[80,72],[115,36],[150,72],[182,108]],neck:[[60,72],[195,72]],tgt:[188,72,110],
  d:'Hai đỉnh gần bằng nhau, chữ M. Xác nhận khi giá thủng đáy giữa hai đỉnh.',m:'Mục tiêu = chiều cao từ đỉnh tới đáy giữa.',v:'Đỉnh thứ hai thường có khối lượng thấp hơn.'},
 {id:'dbot',n:'Hai đáy',cat:'Đảo chiều tăng',rel:'Trung bình',pts:[[5,10],[48,86],[80,48],[115,84],[150,48],[182,12]],neck:[[60,48],[195,48]],tgt:[188,48,10],
  d:'Chữ W: hai đáy gần bằng nhau. Xác nhận khi vượt đỉnh giữa.',m:'Mục tiêu = chiều cao đáy tới đỉnh giữa, cộng từ điểm phá vỡ.',v:'Khối lượng tăng khi vượt đỉnh giữa.'},
 {id:'ttop',n:'Ba đỉnh',cat:'Đảo chiều giảm',rel:'Trung bình',pts:[[5,110],[35,40],[60,70],[92,38],[120,70],[148,40],[178,105]],neck:[[50,70],[195,70]],tgt:[188,70,104],
  d:'Ba lần thử vượt cùng một kháng cự đều thất bại.',m:'Như hai đỉnh.',v:'Khối lượng yếu dần qua từng đỉnh.'},
 {id:'asc',n:'Tam giác tăng',cat:'Tiếp diễn tăng',rel:'Trung bình',pts:[[5,100],[38,36],[62,80],[92,36],[115,64],[142,36],[160,52],[188,10]],neck:[[30,36],[160,36]],extra:[[[62,80],[160,52]]],tgt:[180,36,6],
  d:'Kháng cự nằm ngang, đáy cao dần: lực mua kiên nhẫn hấp thụ nguồn cung ở một mức giá.',m:'Mục tiêu = chiều cao phần rộng nhất của tam giác, cộng từ điểm phá vỡ.',v:'Khối lượng co lại trong tam giác, bùng nổ khi phá.'},
 {id:'desc',n:'Tam giác giảm',cat:'Tiếp diễn giảm',rel:'Trung bình',pts:[[5,20],[38,84],[62,40],[92,84],[115,56],[142,84],[160,68],[188,112]],neck:[[30,84],[160,84]],extra:[[[62,40],[160,68]]],tgt:[180,84,114],
  d:'Hỗ trợ nằm ngang, đỉnh thấp dần: phe bán ngày càng chủ động.',m:'Mục tiêu = chiều cao phần rộng nhất, trừ từ điểm phá vỡ.',v:'Khối lượng tăng khi thủng hỗ trợ.'},
 {id:'sym',n:'Tam giác cân',cat:'Tiếp diễn',rel:'Thấp',pts:[[5,104],[35,28],[62,92],[92,40],[118,78],[140,50],[158,66],[188,22]],extra:[[[35,28],[158,58]],[[62,92],[158,68]]],tgt:[180,62,30],
  d:'Đỉnh thấp dần và đáy cao dần hội tụ: thị trường nén lại, thường phá theo xu hướng trước đó.',m:'Mục tiêu = chiều cao đáy tam giác.',v:'Phá vỡ trước khoảng 2/3–3/4 chiều dài tam giác là đáng tin hơn.'},
 {id:'bullflag',n:'Cờ tăng',cat:'Tiếp diễn tăng',rel:'Cao',pts:[[5,112],[50,40],[62,52],[74,44],[88,58],[100,50],[112,62],[140,18],[175,6]],extra:[[[50,40],[100,50]],[[62,52],[112,62]]],tgt:[150,58,8],
  d:'Cán cờ: nhịp tăng dốc. Lá cờ: kênh giảm nhẹ ngắn hạn. Phá lên khỏi lá cờ là tín hiệu tiếp diễn.',m:'Mục tiêu = chiều dài cán cờ, cộng từ điểm phá vỡ.',v:'Khối lượng cạn trong lá cờ.'},
 {id:'bearflag',n:'Cờ giảm',cat:'Tiếp diễn giảm',rel:'Cao',pts:[[5,10],[50,82],[62,70],[74,78],[88,64],[100,72],[112,60],[140,104],[175,116]],extra:[[[50,82],[100,72]],[[62,70],[112,60]]],tgt:[150,64,114],
  d:'Nhịp giảm dốc, theo sau là kênh hồi nhẹ hướng lên; thủng kênh để giảm tiếp.',m:'Mục tiêu = chiều dài cán cờ.',v:'Khối lượng thấp khi hồi.'},
 {id:'risewedge',n:'Nêm tăng',cat:'Đảo chiều giảm',rel:'Trung bình',pts:[[5,108],[40,64],[60,84],[95,46],[112,62],[142,36],[155,46],[185,96]],extra:[[[40,64],[142,36]],[[5,108],[155,46]]],tgt:[178,60,110],
  d:'Hai đường hội tụ cùng dốc lên, đáy tăng nhanh hơn đỉnh: đà tăng đuối dần, dễ gãy xuống.',m:'Mục tiêu thường về điểm khởi đầu của nêm.',v:'Khối lượng giảm dần trong nêm.'},
 {id:'fallwedge',n:'Nêm giảm',cat:'Đảo chiều tăng',rel:'Trung bình',pts:[[5,12],[40,56],[60,36],[95,74],[112,58],[142,84],[155,74],[185,24]],extra:[[[40,56],[142,84]],[[5,12],[155,74]]],tgt:[178,60,10],
  d:'Hai đường hội tụ cùng dốc xuống: lực bán yếu dần, thường bật lên.',m:'Mục tiêu về đỉnh khởi đầu của nêm.',v:'Khối lượng tăng khi phá lên.'},
 {id:'cup',n:'Cốc và tay cầm',cat:'Tiếp diễn tăng',rel:'Cao',pts:[[5,30],[20,50],[40,78],[70,92],[100,78],[120,50],[132,30],[142,42],[152,48],[162,40],[175,26],[192,10]],neck:[[5,30],[175,30]],tgt:[186,30,2],
  d:'Đáy tròn hình chữ U (cốc) rồi một nhịp điều chỉnh nhỏ (tay cầm). Mô hình yêu thích của William O’Neil.',m:'Mục tiêu = độ sâu cốc, cộng từ điểm phá vỡ tay cầm.',v:'Tay cầm có khối lượng thấp; phá vỡ với khối lượng lớn.'},
 {id:'rect',n:'Hình chữ nhật',cat:'Tiếp diễn',rel:'Thấp',pts:[[5,104],[30,40],[55,84],[80,40],[105,84],[130,40],[150,84],[165,40],[190,10]],neck:[[25,40],[170,40]],extra:[[[50,84],[170,84]]],tgt:[182,40,0],
  d:'Giá dao động giữa hỗ trợ và kháng cự nằm ngang (vùng tích lũy/“đi ngang”). Hướng phá vỡ quyết định xu hướng kế tiếp.',m:'Mục tiêu = chiều cao hình chữ nhật.',v:'Phá vỡ giả phổ biến — chờ đóng cửa.'},
 {id:'roundbot',n:'Đáy tròn',cat:'Đảo chiều tăng',rel:'Trung bình',pts:[[5,14],[25,40],[50,70],[80,86],[110,86],[140,70],[165,40],[190,12]],
  d:'Quá trình chuyển dần từ giảm sang tăng trong thời gian dài, hình chữ U rộng — còn gọi là “đáy đĩa”.',m:'Không có mục tiêu đo chuẩn; thường là đỉnh khởi đầu của mô hình.',v:'Khối lượng cũng tạo hình chữ U.'}
];
function cpatSVG(p){
  let g=`<polyline points="${p.pts.map(x=>x.join(',')).join(' ')}" fill="none" style="stroke:var(--fg)" stroke-width="2.2" stroke-linejoin="round"/>`;
  if(p.neck) g+=`<line x1="${p.neck[0][0]}" y1="${p.neck[0][1]}" x2="${p.neck[1][0]}" y2="${p.neck[1][1]}" style="stroke:var(--gold)" stroke-width="1.6" stroke-dasharray="5 3"/>`;
  (p.extra||[]).forEach(([a,b])=>g+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" style="stroke:var(--us)" stroke-width="1.5" stroke-dasharray="4 3"/>`);
  if(p.tgt){ const [x,y1,y2]=p.tgt; const up=y2<y1; g+=`<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" style="stroke:${up?'var(--up)':'var(--dn)'}" stroke-width="2"/><path d="M${x} ${y2} l-4 ${up?7:-7} h8z" style="fill:${up?'var(--up)':'var(--dn)'}"/>`; }
  return `<svg class="chart" viewBox="0 0 200 120" role="img" aria-label="Mô hình giá ${esc(p.n)}">${g}</svg>`;
}

/* ---------- bài học kỹ thuật & cơ bản nâng cao ---------- */
const candlesMini=(arr)=>{ let g=''; arr.forEach((b,i)=>{ const [o,h,l,c]=b; const x=20+i*16, Y=v=>115-v; const up=c>=o, col=up?'var(--up)':'var(--dn)'; g+=`<line x1="${x}" x2="${x}" y1="${Y(h)}" y2="${Y(l)}" style="stroke:${col}"/><rect x="${x-5}" y="${Y(Math.max(o,c))}" width="10" height="${Math.max(1.5,Math.abs(c-o))}" style="fill:${col}"/>`; }); return g; };
const NEW_LESSONS=[
 {id:'candle-anatomy',g:'Phân tích kỹ thuật',t:'Giải phẫu cây nến Nhật',d:'Thân, bóng và câu chuyện của một phiên',
  vis:()=>sv(`<line x1="60" x2="60" y1="12" y2="112" style="stroke:var(--up)" stroke-width="2"/><rect x="45" y="34" width="30" height="50" rx="2" style="fill:var(--up)"/><line x1="140" x2="140" y1="12" y2="112" style="stroke:var(--dn)" stroke-width="2"/><rect x="125" y="34" width="30" height="50" rx="2" style="fill:var(--dn)"/>${T(84,15,'Cao','style="font-size:8px"')}${T(84,37,'Đóng','style="font-size:8px;fill:var(--up)"')}${T(84,86,'Mở','style="font-size:8px;fill:var(--up)"')}${T(84,112,'Thấp','style="font-size:8px"')}${T(164,37,'Mở','style="font-size:8px;fill:var(--dn)"')}${T(164,86,'Đóng','style="font-size:8px;fill:var(--dn)"')}${T(5,24,'Bóng trên',TS)}${T(5,62,'Thân',TB)}${T(5,104,'Bóng dưới',TS)}`,'Cấu tạo nến tăng và nến giảm'),
  f:'Thân = |Đóng − Mở| · Bóng trên = Cao − max(Mở, Đóng) · Bóng dưới = min(Mở, Đóng) − Thấp',
  pts:['Nến tăng: đóng cửa cao hơn mở cửa; nến giảm: ngược lại. Ở Việt Nam và Mỹ thường dùng xanh = tăng, đỏ = giảm (một số thị trường châu Á như Trung Quốc dùng ngược lại).','Thân dài: một phe áp đảo. Thân ngắn: cân bằng, do dự.','Bóng dài: giá đã đi tới đó nhưng bị từ chối — thông tin quan trọng hơn thân.','Kỹ thuật nến được Munehisa Homma dùng cho thị trường gạo Osaka thế kỷ 18 và Steve Nison phổ biến ở phương Tây năm 1991.','Mẫu nến chỉ có ý nghĩa trong bối cảnh: vị trí so với xu hướng, hỗ trợ/kháng cự và khối lượng.'],
  thr:[['Thân > 70% biên độ','Phiên áp đảo (Marubozu nếu không bóng)'],['Thân < 10% biên độ','Doji — do dự'],['Bóng ≥ 2 lần thân','Từ chối giá mạnh (Búa, Sao băng)']],
  hook:'<b>Mẹo nhớ:</b> thân kể ai thắng, bóng kể ai đã bị đánh bật.',src:'Steve Nison, Japanese Candlestick Charting Techniques (1991; 2nd ed. 2001).'},
 {id:'dow',g:'Phân tích kỹ thuật',t:'Lý thuyết Dow',d:'Nền móng của phân tích xu hướng',
  vis:()=>{ const pts=[[10,100],[40,70],[55,85],[90,45],[105,62],[140,25],[155,40],[190,15]]; return sv(`<polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" style="stroke:var(--up)" stroke-width="2"/>${[[40,70,'Đ1'],[90,45,'Đ2'],[140,25,'Đ3']].map(([x,y,l])=>T(x,y-5,l,'text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--up)"')).join('')}${[[55,85,'đ1'],[105,62,'đ2'],[155,40,'đ3']].map(([x,y,l])=>T(x,y+12,l,'text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--gold)"')).join('')}${T(100,118,'Đỉnh sau cao hơn đỉnh trước, đáy sau cao hơn đáy trước','text-anchor="middle" '+TS)}`,'Xu hướng tăng với đỉnh và đáy cao dần'); },
  f:'Xu hướng tăng = đỉnh cao dần + đáy cao dần',
  pts:['Thị trường có ba xu hướng: chính (nhiều tháng–năm), thứ cấp (vài tuần–tháng, điều chỉnh 1/3–2/3 nhịp chính), nhỏ (vài ngày).','Xu hướng chính có ba pha: tích lũy (nhà đầu tư hiểu biết mua), tham gia đại chúng, và phân phối.','Các chỉ số phải xác nhận lẫn nhau (ban đầu là chỉ số công nghiệp và vận tải).','Khối lượng phải xác nhận xu hướng: tăng theo hướng của xu hướng chính.','Xu hướng còn hiệu lực cho đến khi có tín hiệu đảo chiều rõ ràng.'],
  thr:[['Đỉnh thấp hơn + thủng đáy','Xu hướng tăng bị phá vỡ']],
  hook:'<b>Mẹo nhớ:</b> “Xu hướng là bạn — cho đến khi nó gãy.”',src:'Charles H. Dow (Wall Street Journal, 1900–1902); Rhea, The Dow Theory (1932).'},
 {id:'sr',g:'Phân tích kỹ thuật',t:'Hỗ trợ, kháng cự và đường xu hướng',d:'Nơi cung cầu từng gặp nhau',
  vis:()=>sv(`<line x1="5" x2="195" y1="30" y2="30" style="stroke:var(--dn)" stroke-dasharray="5 3" stroke-width="1.5"/><line x1="5" x2="195" y1="90" y2="90" style="stroke:var(--up)" stroke-dasharray="5 3" stroke-width="1.5"/><polyline points="5,80 30,32 55,88 85,31 110,89 140,32 160,60 190,10" fill="none" style="stroke:var(--fg)" stroke-width="2"/>${T(8,24,'Kháng cự','style="font-size:8px;fill:var(--dn);font-weight:700"')}${T(8,102,'Hỗ trợ','style="font-size:8px;fill:var(--up);font-weight:700"')}${T(170,24,'Phá vỡ','style="font-size:8px;font-weight:700;fill:var(--gold)"')}`,'Vùng hỗ trợ và kháng cự'),
  f:'Kháng cự bị phá vỡ thường trở thành hỗ trợ (và ngược lại)',
  pts:['Hỗ trợ: vùng giá mà lực mua từng đủ mạnh để chặn đà giảm; kháng cự: ngược lại.','Vẽ vùng (dải giá) hơn là một đường đơn; càng được chạm nhiều lần, vùng càng quan trọng — cho đến khi bị phá.','Số tròn (50.000đ, $100), đỉnh/đáy cũ, đường MA200 thường đóng vai trò hỗ trợ/kháng cự tâm lý.','Đường xu hướng tăng nối ít nhất hai đáy cao dần; xác nhận bằng lần chạm thứ ba.','Phá vỡ đáng tin khi đóng cửa vượt rõ ràng kèm khối lượng lớn; ở Việt Nam, phiên ATC có thể tạo phá vỡ giả.'],
  thr:[['Đóng cửa vượt > 3% kèm KL > 1,5 lần TB','Phá vỡ có xác nhận']],
  hook:'<b>Mẹo nhớ:</b> trần nhà cũ thành sàn nhà mới.',src:'Edwards & Magee, Technical Analysis of Stock Trends (1948; 11th ed. 2018).'},
 {id:'ma',g:'Phân tích kỹ thuật',t:'Đường trung bình động (MA)',d:'SMA, EMA, giao cắt vàng và tử thần',
  vis:()=>{ const X=v=>10+v*1.8, f=x=>60-25*Math.sin(x/16)-x*.15; let g=`<path d="${pathFn(f,0,100,X,v=>v)}" fill="none" style="stroke:var(--fg)" stroke-width="1.3"/>`;
    g+=`<path d="${pathFn(x=>f(x-6)+3,6,100,X,v=>v)}" fill="none" style="stroke:var(--us)" stroke-width="1.8"/><path d="${pathFn(x=>60-x*.15-10*Math.sin((x-14)/16),14,100,X,v=>v)}" fill="none" style="stroke:var(--gold)" stroke-width="1.8"/>`;
    return sv(g+T(150,112,'MA ngắn','style="font-size:8px;fill:var(--us);font-weight:700"')+T(10,112,'MA dài','style="font-size:8px;fill:var(--gold);font-weight:700"'),'Đường trung bình ngắn và dài'); },
  f:'SMAₙ = (C₁ + … + Cₙ) ÷ n · EMA = C × k + EMA₋₁ × (1 − k), k = 2/(n+1)',
  pts:['SMA cho trọng số đều; EMA ưu tiên giá gần nhất nên phản ứng nhanh hơn.','Phổ biến: MA20 (1 tháng), MA50 (quý), MA200 (năm). Nhiều quỹ dùng MA200 làm ranh giới thị trường tăng/giảm.','Giao cắt vàng: MA50 cắt lên MA200; giao cắt tử thần: cắt xuống. Đây là tín hiệu trễ — xác nhận chứ không dự báo.','MA là hỗ trợ/kháng cự động trong xu hướng mạnh.','Trong thị trường đi ngang, giao cắt MA cho rất nhiều tín hiệu giả.'],
  thr:[['Giá > MA50 > MA200','Cấu trúc tăng'],['Giá < MA50 < MA200','Cấu trúc giảm']],
  hook:'<b>Mẹo nhớ:</b> MA cho biết “đang ở đâu”, không cho biết “sẽ đi đâu”.',src:'Murphy, Technical Analysis of the Financial Markets (1999), ch. 9.'},
 {id:'rsi-l',g:'Phân tích kỹ thuật',t:'RSI – Chỉ số sức mạnh tương đối',d:'Quá mua, quá bán và phân kỳ',
  vis:()=>{ const X=v=>10+v*1.8, Y=v=>110-v; let g=`<rect x="10" y="${Y(70)}" width="180" height="40" style="fill:var(--gold);fill-opacity:.1"/><line x1="10" x2="190" y1="${Y(70)}" y2="${Y(70)}" style="stroke:var(--dn)" stroke-dasharray="4 3"/><line x1="10" x2="190" y1="${Y(30)}" y2="${Y(30)}" style="stroke:var(--up)" stroke-dasharray="4 3"/>`;
    g+=`<path d="${pathFn(x=>50+32*Math.sin(x/9)+5*Math.sin(x/3),0,100,X,Y)}" fill="none" style="stroke:var(--ceil)" stroke-width="2"/>`;
    return sv(g+T(192,Y(70)+3,'70','text-anchor="end" style="font-size:8px;fill:var(--dn)"')+T(192,Y(30)+3,'30','text-anchor="end" style="font-size:8px;fill:var(--up)"'),'Đường RSI dao động giữa 30 và 70'); },
  f:'RSI = 100 − 100 ÷ (1 + RS) · RS = TB tăng 14 phiên ÷ TB giảm 14 phiên (làm mượt Wilder)',
  pts:['RSI > 70: quá mua; < 30: quá bán — nhưng trong xu hướng mạnh RSI có thể ở vùng này rất lâu.','Trong xu hướng tăng, RSI thường dao động 40–80; xu hướng giảm: 20–60 (quy tắc của Andrew Cardwell).','Phân kỳ âm: giá lập đỉnh mới nhưng RSI không — động lượng suy yếu. Phân kỳ dương: ngược lại ở đáy.','Biểu đồ trong tab Biểu đồ tính RSI(14) theo phương pháp làm mượt gốc của Wilder.'],
  thr:[['> 70','Quá mua'],['50','Ranh giới động lượng'],['< 30','Quá bán']],
  hook:'<b>Mẹo nhớ:</b> “70 bán bớt, 30 để ý” — nhưng đừng bắt đỉnh trong xu hướng mạnh.',src:'J. Welles Wilder, New Concepts in Technical Trading Systems (1978).'},
 {id:'macd-l',g:'Phân tích kỹ thuật',t:'MACD',d:'Hội tụ – phân kỳ của hai đường EMA',
  vis:()=>{ const X=v=>10+v*1.8, Ym=v=>62-v*2.2; let g=`<line x1="10" x2="190" y1="62" y2="62" style="stroke:var(--line2)"/>`; for(let i=0;i<100;i+=4){ const h=12*Math.sin(i/12)-2*Math.sin(i/5); g+=`<rect x="${X(i)}" y="${Math.min(62,Ym(h))}" width="5" height="${Math.abs(Ym(h)-62)}" style="fill:${h>=0?'var(--up)':'var(--dn)'};fill-opacity:.55"/>`; }
    g+=`<path d="${pathFn(x=>14*Math.sin(x/12),0,100,X,Ym)}" fill="none" style="stroke:var(--us)" stroke-width="1.8"/><path d="${pathFn(x=>14*Math.sin((x-6)/12),6,100,X,Ym)}" fill="none" style="stroke:var(--gold)" stroke-width="1.8"/>`;
    return sv(g+T(12,14,'MACD','style="font-size:8px;fill:var(--us);font-weight:700"')+T(50,14,'Tín hiệu','style="font-size:8px;fill:var(--gold);font-weight:700"')+T(100,14,'Histogram',TS),'MACD, đường tín hiệu và histogram'); },
  f:'MACD = EMA12 − EMA26 · Tín hiệu = EMA9(MACD) · Histogram = MACD − Tín hiệu',
  pts:['MACD cắt lên đường tín hiệu: động lượng chuyển tăng; cắt xuống: chuyển giảm.','MACD vượt 0: EMA12 trên EMA26 — xu hướng ngắn hạn tăng.','Histogram co lại là cảnh báo sớm trước khi giao cắt xảy ra.','Phân kỳ giữa MACD và giá ở vùng đỉnh/đáy là tín hiệu đảo chiều đáng chú ý.'],
  thr:[['Giao cắt trên 0','Tín hiệu tăng mạnh hơn'],['Giao cắt dưới 0','Tín hiệu giảm mạnh hơn']],
  hook:'<b>Mẹo nhớ:</b> “12 – 26 – 9”.',src:'Gerald Appel (cuối thập niên 1970); histogram: Thomas Aspray (1986).'},
 {id:'bb-l',g:'Phân tích kỹ thuật',t:'Dải Bollinger',d:'Biến động co giãn quanh trung bình',
  vis:()=>{ const X=v=>10+v*1.8, f=x=>60-x*.2-6*Math.sin(x/8), w=x=>8+14*Math.abs(Math.sin(x/30)); let g=`<path d="${pathFn(x=>f(x)-w(x),0,100,X,v=>v)} L${X(100)} ${(f(100)+w(100)).toFixed(1)} ${pathFn(x=>f(100-x)+w(100-x),0,100,x=>X(100-x),v=>v).replace('M','L')}Z" style="fill:var(--mut);fill-opacity:.12"/>`;
    g+=`<path d="${pathFn(x=>f(x)-w(x),0,100,X,v=>v)}" fill="none" style="stroke:var(--mut)"/><path d="${pathFn(x=>f(x)+w(x),0,100,X,v=>v)}" fill="none" style="stroke:var(--mut)"/><path d="${pathFn(f,0,100,X,v=>v)}" fill="none" style="stroke:var(--mut)" stroke-dasharray="3 3"/><path d="${pathFn(x=>f(x)+w(x)*.8*Math.sin(x/5),0,100,X,v=>v)}" fill="none" style="stroke:var(--fg)" stroke-width="1.5"/>`;
    return sv(g+T(X(52),18,'Thắt nút (squeeze)','text-anchor="middle" style="font-size:8px;fill:var(--gold);font-weight:700"'),'Dải Bollinger co giãn'); },
  f:'Giữa = SMA20 · Trên/Dưới = SMA20 ± 2 × độ lệch chuẩn 20 phiên',
  pts:['Khoảng 90% giá đóng cửa nằm trong dải (không phải 95% như phân phối chuẩn, vì giá không phân phối chuẩn).','Dải thắt hẹp (squeeze) = biến động thấp, thường báo trước một nhịp biến động mạnh — nhưng không cho biết hướng.','Chạm dải trên không phải tín hiệu bán: trong xu hướng mạnh giá “cưỡi” dải trên.','%B = (Giá − Dải dưới) ÷ (Dải trên − Dải dưới) đo vị trí giá trong dải.'],
  thr:[['%B > 1','Vượt dải trên'],['%B < 0','Thủng dải dưới']],
  hook:'<b>Mẹo nhớ:</b> dải co lại như lò xo bị nén.',src:'John Bollinger, Bollinger on Bollinger Bands (2001).'},
 {id:'stoch-l',g:'Phân tích kỹ thuật',t:'Dao động Stochastic',d:'Giá đóng cửa ở đâu trong biên độ gần đây',
  vis:()=>{ const X=v=>10+v*1.8, Y=v=>110-v; let g=`<line x1="10" x2="190" y1="${Y(80)}" y2="${Y(80)}" style="stroke:var(--dn)" stroke-dasharray="4 3"/><line x1="10" x2="190" y1="${Y(20)}" y2="${Y(20)}" style="stroke:var(--up)" stroke-dasharray="4 3"/>`;
    g+=`<path d="${pathFn(x=>50+40*Math.sin(x/7),0,100,X,Y)}" fill="none" style="stroke:var(--us)" stroke-width="1.8"/><path d="${pathFn(x=>50+36*Math.sin((x-3)/7),3,100,X,Y)}" fill="none" style="stroke:var(--gold)" stroke-width="1.8"/>`;
    return sv(g+T(12,14,'%K','style="font-size:8px;fill:var(--us);font-weight:700"')+T(32,14,'%D','style="font-size:8px;fill:var(--gold);font-weight:700"'),'Đường %K và %D'); },
  f:'%K = (Đóng − Thấp nhất 14) ÷ (Cao nhất 14 − Thấp nhất 14) × 100 · %D = SMA3(%K)',
  pts:['Ý tưởng của George Lane: trong xu hướng tăng, giá có xu hướng đóng cửa gần đỉnh của biên độ.','> 80 quá mua, < 20 quá bán; giao cắt %K/%D trong các vùng này là tín hiệu.','Nhạy hơn RSI, phù hợp thị trường đi ngang; trong xu hướng mạnh dễ cho tín hiệu ngược sớm.'],
  thr:[['> 80','Quá mua'],['< 20','Quá bán']],
  hook:'<b>Mẹo nhớ:</b> Stochastic hỏi “giá đóng cửa gần trần hay gần sàn của 14 phiên?”.',src:'George Lane (thập niên 1950); Murphy (1999), ch. 10.'},
 {id:'volume-l',g:'Phân tích kỹ thuật',t:'Khối lượng và OBV',d:'Tiền thật đứng sau biến động giá',
  vis:()=>{ let g=''; const v=[20,24,18,30,26,44,60,38,30,52,70,90]; v.forEach((h,i)=>g+=`<rect x="${14+i*15}" y="${112-h}" width="11" height="${h}" rx="1.5" style="fill:${i%3===2?'var(--dn)':'var(--up)'};fill-opacity:.65"/>`);
    g+=`<polyline points="${v.map((h,i)=>`${19.5+i*15},${50-i*3.4-(i%3===2?-6:0)}`).join(' ')}" fill="none" style="stroke:var(--gold)" stroke-width="2"/>`;
    return sv(g+T(14,12,'OBV tăng cùng giá = xu hướng khỏe','style="font-size:8px;fill:var(--gold);font-weight:700"'),'Khối lượng và đường OBV'); },
  f:'OBV = OBV₋₁ + KL (nếu giá tăng) / − KL (nếu giá giảm)',
  pts:['Khối lượng xác nhận xu hướng: tăng giá kèm khối lượng tăng là lành mạnh.','Giá tăng mà khối lượng giảm dần: lực mua cạn — cảnh báo.','Phá vỡ hỗ trợ/kháng cự với khối lượng gấp 1,5–2 lần trung bình 20 phiên đáng tin hơn.','Ở Việt Nam, theo dõi thêm giao dịch khối ngoại và tự doanh như một lớp “khối lượng có thông tin”.','OBV tạo đỉnh mới trước giá có thể báo trước một nhịp tăng (Granville).'],
  thr:[['KL > 1,5 × MA20','Phiên đột biến']],
  hook:'<b>Mẹo nhớ:</b> “Khối lượng đi trước giá.”',src:'Joseph Granville, New Key to Stock Market Profits (1963).'},
 {id:'fibo',g:'Phân tích kỹ thuật',t:'Fibonacci thoái lui',d:'Các mức điều chỉnh 38,2% – 50% – 61,8%',
  vis:()=>{ const lv=[[0,15],[.236,33],[.382,45],[.5,55],[.618,64],[1,95]]; let g=`<polyline points="10,95 80,15 120,60 190,10" fill="none" style="stroke:var(--fg)" stroke-width="2"/>`;
    lv.forEach(([r,y])=>g+=`<line x1="80" x2="195" y1="${y}" y2="${y}" style="stroke:${r===.618||r===.382?'var(--gold)':'var(--line2)'}" stroke-dasharray="3 3"/>`+T(196,y+3,fmt(r*100,1)+'%','text-anchor="end" style="font-size:7.5px;fill:var(--fg)"'));
    return sv(g,'Các mức Fibonacci thoái lui'); },
  f:'Mức = Đỉnh − (Đỉnh − Đáy) × {23,6% · 38,2% · 50% · 61,8% · 78,6%}',
  pts:['61,8% là tỷ lệ vàng (φ − 1); 38,2% = 1 − 61,8%; 50% không phải số Fibonacci nhưng được dùng rộng rãi (Dow).','Điều chỉnh nông (23,6–38,2%) cho thấy xu hướng mạnh; sâu hơn 61,8% làm xu hướng gốc đáng ngờ.','Mức Fibonacci có tác dụng phần lớn vì nhiều người cùng nhìn — hãy kết hợp với hỗ trợ cũ, MA, khối lượng.','Phần mở rộng 161,8% dùng để ước lượng mục tiêu giá.'],
  thr:[['38,2%','Điều chỉnh khỏe'],['50–61,8%','Vùng mua phổ biến trong xu hướng tăng'],['> 78,6%','Xu hướng có thể đã gãy']],
  hook:'<b>Mẹo nhớ:</b> “3 – 5 – 6”: 38, 50, 62.',src:'Leonardo Fibonacci, Liber Abaci (1202); Murphy (1999), ch. 13.'},
 {id:'ichimoku-l',g:'Phân tích kỹ thuật',t:'Ichimoku Kinko Hyo',d:'“Nhìn một cái là thấy cân bằng”',
  vis:()=>{ const X=v=>10+v*1.8; const a=x=>55-x*.3-6*Math.sin(x/10), b=x=>62-x*.18; let g=`<path d="${pathFn(a,20,100,X,v=>v)} ${pathFn(x=>b(120-x),20,100,x=>X(120-x),v=>v).replace('M','L')}Z" style="fill:var(--up);fill-opacity:.15"/>`;
    g+=`<path d="${pathFn(x=>45-x*.35-8*Math.sin(x/6),0,100,X,v=>v)}" fill="none" style="stroke:var(--fg)" stroke-width="1.6"/><path d="${pathFn(x=>47-x*.33-5*Math.sin(x/7),0,90,X,v=>v)}" fill="none" style="stroke:var(--floor)" stroke-width="1.2"/><path d="${pathFn(x=>50-x*.32-3*Math.sin(x/9),0,90,X,v=>v)}" fill="none" style="stroke:var(--dn)" stroke-width="1.2"/>`;
    return sv(g+T(150,82,'Mây Kumo','style="font-size:8px;fill:var(--up);font-weight:700"')+T(12,14,'Tenkan','style="font-size:8px;fill:var(--floor)"')+T(50,14,'Kijun','style="font-size:8px;fill:var(--dn)"'),'Hệ thống Ichimoku với mây'); },
  f:'Tenkan = (Cao9 + Thấp9)/2 · Kijun = (Cao26 + Thấp26)/2 · Span A = (Tenkan + Kijun)/2 dời 26 · Span B = (Cao52 + Thấp52)/2 dời 26',
  pts:['Giá trên mây: xu hướng tăng; dưới mây: giảm; trong mây: trung tính.','Mây dày là vùng hỗ trợ/kháng cự mạnh; mây mỏng dễ bị xuyên qua.','Tenkan cắt lên Kijun trên mây là tín hiệu tăng mạnh nhất.','Do Goichi Hosoda phát triển và công bố năm 1969 sau nhiều thập kỷ nghiên cứu.'],
  thr:[['Giá > mây, Tenkan > Kijun','Xu hướng tăng đầy đủ']],
  hook:'<b>Mẹo nhớ:</b> “9 – 26 – 52”.',src:'Goichi Hosoda (1969); Elliott, Ichimoku Charts (2007).'},
 {id:'elliott',g:'Phân tích kỹ thuật',t:'Sóng Elliott',d:'5 sóng đẩy, 3 sóng điều chỉnh',
  vis:()=>{ const P=[[5,105],[30,72],[45,85],[85,30],[100,52],[130,12],[148,48],[160,35],[185,72]]; let g=`<polyline points="${P.map(p=>p.join(',')).join(' ')}" fill="none" style="stroke:var(--fg)" stroke-width="2"/>`;
    ['1','2','3','4','5','A','B','C'].forEach((l,i)=>{ const [x,y]=P[i+1]; const up=i%2===0&&i<5||i===6; g+=T(x,up?y-5:y+12,l,'text-anchor="middle" style="font-size:9px;font-weight:800;fill:'+(i<5?'var(--up)':'var(--dn)')+'"'); });
    return sv(g,'Chu kỳ 5 sóng đẩy và 3 sóng điều chỉnh'); },
  f:'Chu kỳ hoàn chỉnh = 5 sóng đẩy (1-2-3-4-5) + 3 sóng điều chỉnh (A-B-C)',
  pts:['Ba quy tắc không được vi phạm: sóng 2 không thoái lui quá 100% sóng 1; sóng 3 không phải sóng ngắn nhất; sóng 4 không đè vào vùng giá sóng 1.','Sóng 3 thường dài và mạnh nhất, đi kèm khối lượng lớn.','Lý thuyết mang tính diễn giải cao — hai nhà phân tích có thể đếm sóng khác nhau; nên dùng như khung tư duy, không phải công cụ dự báo chính xác.'],
  thr:[['Sóng 2 thoái lui 50–61,8%','Phổ biến'],['Sóng 3 ≈ 161,8% sóng 1','Mục tiêu thường gặp']],
  hook:'<b>Mẹo nhớ:</b> “Năm bước lên, ba bước lùi.”',src:'Ralph N. Elliott, The Wave Principle (1938); Frost & Prechter (1978).'},
 {id:'atr-l',g:'Phân tích kỹ thuật',t:'ATR và đặt điểm cắt lỗ',d:'Cắt lỗ theo biến động thay vì theo cảm tính',
  vis:()=>{ let g=''; const c=[[50,58,46,55],[55,60,50,52],[52,57,47,56],[56,63,54,61],[61,66,57,58],[58,64,55,63],[63,70,60,68]]; g+=candlesMini(c.map(b=>b.map(v=>v+10)));
    g+=`<line x1="10" x2="190" y1="${115-58}" y2="${115-58}" style="stroke:var(--dn)" stroke-dasharray="4 3" stroke-width="1.5"/>`+T(130,115-50,'Giá − 2 × ATR = điểm cắt lỗ','style="font-size:8px;fill:var(--dn);font-weight:700"');
    return sv(g,'Điểm cắt lỗ theo ATR'); },
  f:'TR = max(Cao − Thấp, |Cao − Đóng₋₁|, |Thấp − Đóng₋₁|) · ATR = trung bình Wilder 14 phiên của TR',
  pts:['ATR đo biên độ dao động thực, tính cả khoảng trống giá.','Đặt cắt lỗ cách giá 1,5–3 ATR giúp tránh bị “quét” bởi dao động bình thường.','Kết hợp với công cụ “Quy mô vị thế”: khoảng cách cắt lỗ lớn hơn → mua ít cổ phiếu hơn để giữ rủi ro không đổi.','Chandelier exit: dời điểm cắt lỗ theo đỉnh cao nhất − 3 ATR khi giá tăng.'],
  thr:[['ATR/giá < 2%','Biến động thấp'],['> 4%','Biến động cao (cổ phiếu nhỏ, chu kỳ)']],
  hook:'<b>Mẹo nhớ:</b> cắt lỗ phải nằm ngoài vùng “nhiễu” — tức là vài ATR.',src:'Wilder (1978); Chuck LeBeau, Chandelier Exit.'},
 {id:'ddm',g:'Định giá',t:'Mô hình chiết khấu cổ tức (DDM)',d:'Gordon Growth và cổ phiếu cổ tức',
  vis:()=>{ let g=''; for(let i=0;i<8;i++){ const d=10*Math.pow(1.05,i), pv=d/Math.pow(1.1,i+1); g+=`<rect x="${14+i*20}" y="${100-d*4}" width="14" height="${d*4}" rx="2" style="fill:var(--line2)"/><rect x="${14+i*20}" y="${100-pv*4}" width="14" height="${pv*4}" rx="2" style="fill:var(--gold)"/>`; }
    return sv(g+T(100,116,'Cổ tức tăng g = 5%/năm, chiết khấu r = 10%','text-anchor="middle" '+TS),'Cổ tức tương lai và giá trị hiện tại'); },
  f:'P₀ = D₁ ÷ (r − g)',
  pts:['Phù hợp doanh nghiệp trưởng thành, chi trả ổn định (tiện ích, tiêu dùng thiết yếu, ngân hàng lớn).','g phải nhỏ hơn r và bền vững: g ≈ ROE × (1 − tỷ lệ chi trả).','Ví dụ: D₁ = 3.000đ, r = 12%, g = 5% → P₀ = 3.000 ÷ 0,07 ≈ 42.857đ.','Ở Việt Nam, nhiều doanh nghiệp chia cổ tức bằng cổ phiếu — không phải dòng tiền, cần loại khỏi DDM.'],
  thr:[['r − g < 3%','Kết quả rất nhạy, cẩn trọng']],
  hook:'<b>Mẹo nhớ:</b> “Cổ tức năm sau chia cho khoảng cách r trừ g.”',src:'Gordon & Shapiro (1956); Gordon (1959), Review of Economics and Statistics.'},
 {id:'wacc',g:'Định giá',t:'Chi phí vốn bình quân (WACC)',d:'Mức sinh lời tối thiểu doanh nghiệp phải đạt',
  vis:()=>sv(`<rect x="15" y="30" width="110" height="34" rx="4" style="fill:var(--gold);fill-opacity:.8"/>${T(70,51,'Vốn chủ 70% × 13%','text-anchor="middle" style="font-size:8.5px;font-weight:700;fill:var(--gold-ink)"')}<rect x="125" y="30" width="60" height="34" rx="4" style="fill:var(--us);fill-opacity:.8"/>${T(155,51,'Nợ 30% × 6%','text-anchor="middle" style="font-size:8px;font-weight:700;fill:#fff"')}${T(100,88,'× (1 − thuế 20%)','text-anchor="middle" '+TS)}${T(100,108,'WACC ≈ 0,7×13% + 0,3×6%×0,8 ≈ 10,5%','text-anchor="middle" '+TB)}`,'Cấu phần WACC'),
  f:'WACC = E/V × r_E + D/V × r_D × (1 − t)',
  pts:['r_E tính bằng CAPM; r_D là lãi suất vay biên; t là thuế suất (Việt Nam 20%, Mỹ liên bang 21%).','Dùng giá trị thị trường cho E và D, không dùng giá trị sổ sách.','Thêm nợ làm giảm WACC (lá chắn thuế) đến một mức, sau đó rủi ro phá sản làm r_E và r_D tăng vọt.','WACC là “rào cản” cho ROIC và tỷ lệ chiết khấu trong DCF dòng tiền doanh nghiệp (FCFF).'],
  thr:[['WACC Mỹ (doanh nghiệp lớn)','Thường 7–10%'],['WACC Việt Nam','Thường 11–15%']],
  hook:'<b>Mẹo nhớ:</b> nợ rẻ hơn vốn chủ nhờ lá chắn thuế — nhưng không miễn phí.',src:'Modigliani & Miller (1958, 1963); Damodaran (2012).'},
 {id:'ccc',g:'Chất lượng',t:'Chu kỳ chuyển đổi tiền mặt',d:'Doanh nghiệp bị “chôn” tiền bao nhiêu ngày',
  vis:()=>sv(`<rect x="10" y="30" width="90" height="18" rx="3" style="fill:var(--us);fill-opacity:.8"/>${T(55,42,'DIO 60 ngày','text-anchor="middle" style="font-size:8px;fill:#fff;font-weight:700"')}<rect x="100" y="30" width="45" height="18" rx="3" style="fill:var(--gold);fill-opacity:.85"/>${T(122,42,'DSO 30','text-anchor="middle" style="font-size:8px;font-weight:700;fill:var(--gold-ink)"')}<rect x="10" y="58" width="70" height="18" rx="3" style="fill:var(--up);fill-opacity:.8"/>${T(45,70,'DPO 45 ngày','text-anchor="middle" style="font-size:8px;fill:#fff;font-weight:700"')}<rect x="80" y="58" width="65" height="18" rx="3" style="fill:var(--dn);fill-opacity:.7"/>${T(112,70,'CCC 45','text-anchor="middle" style="font-size:8px;fill:#fff;font-weight:700"')}${T(100,100,'CCC = DIO + DSO − DPO','text-anchor="middle" '+TB)}`,'Chu kỳ chuyển đổi tiền mặt'),
  f:'CCC = Số ngày tồn kho + Số ngày phải thu − Số ngày phải trả',
  pts:['CCC càng ngắn, doanh nghiệp càng ít cần vốn lưu động để tăng trưởng.','CCC âm (Costco, Amazon, nhiều chuỗi bán lẻ): nhà cung cấp tài trợ cho tăng trưởng.','Phải thu tăng nhanh hơn doanh thu là dấu hiệu nới tín dụng để “đẩy” doanh số — cờ vàng.','Bất động sản Việt Nam thường có tồn kho rất lớn — CCC hàng trăm ngày.'],
  thr:[['CCC < 0','Mô hình được tài trợ bởi nhà cung cấp'],['CCC tăng 3 năm liền','Kiểm tra chất lượng doanh thu']],
  hook:'<b>Mẹo nhớ:</b> “Kho + Thu − Trả”.',src:'Richards & Laughlin (1980), Financial Management 9(1).'},
 {id:'beneish',g:'Chất lượng',t:'Beneish M-Score',d:'Phát hiện dấu hiệu “xào nấu” lợi nhuận',
  vis:()=>{ const X=v=>14+(v+4)/3*172; return sv(`<rect x="${X(-4)}" y="50" width="${X(-1.78)-X(-4)}" height="18" rx="3" style="fill:var(--up);fill-opacity:.7"/><rect x="${X(-1.78)}" y="50" width="${X(-1)-X(-1.78)}" height="18" rx="3" style="fill:var(--dn);fill-opacity:.7"/>${T(X(-1.78),44,'−1,78','text-anchor="middle" '+TB)}${T(X(-3),82,'Ít khả năng thao túng','text-anchor="middle" '+TS)}${T(X(-1.35),82,'Đáng ngờ','text-anchor="middle" style="font-size:8px;fill:var(--dn);font-weight:700"')}${T(100,22,'8 biến: DSRI, GMI, AQI, SGI, DEPI, SGAI, LVGI, TATA','text-anchor="middle" '+TS)}`,'Ngưỡng Beneish M-Score'); },
  f:'M = −4,84 + 0,92·DSRI + 0,528·GMI + 0,404·AQI + 0,892·SGI + 0,115·DEPI − 0,172·SGAI + 4,679·TATA − 0,327·LVGI',
  pts:['DSRI (phải thu/doanh thu tăng), GMI (biên gộp xấu đi), AQI (tài sản “mềm” tăng), SGI (tăng trưởng doanh thu nóng), TATA (dồn tích lớn) là các biến quan trọng nhất.','M > −1,78 (phiên bản 8 biến) gợi ý xác suất thao túng cao hơn — không phải bằng chứng.','Mô hình từng gắn cờ Enron trước khi vụ bê bối vỡ lở (theo nghiên cứu của sinh viên Cornell, 1998).','Kết hợp với Piotroski (chất lượng cải thiện) và Altman (rủi ro phá sản) để có bức tranh đầy đủ.'],
  thr:[['M < −2,22','An toàn hơn (ngưỡng phiên bản 5 biến)'],['M > −1,78','Đáng ngờ']],
  hook:'<b>Mẹo nhớ:</b> doanh thu nóng + phải thu phình + dồn tích lớn = cần soi kỹ.',src:'Beneish, M. D. (1999), “The Detection of Earnings Manipulation”, Financial Analysts Journal 55(5).'},
 {id:'famafrench',g:'Danh mục & rủi ro',t:'Đầu tư nhân tố Fama–French',d:'Vì sao giá trị, quy mô, lợi nhuận và động lượng có phần bù',
  vis:()=>{ const f=[['Thị trường',100],['Quy mô (SMB)',30],['Giá trị (HML)',45],['Lợi nhuận (RMW)',40],['Đầu tư (CMA)',32],['Động lượng',55]]; let g=''; f.forEach(([n,v],i)=>{ g+=`<rect x="78" y="${8+i*18}" width="${v}" height="12" rx="3" style="fill:var(--gold);fill-opacity:${.35+i*.1}"/>`+T(74,17+i*18,n,'text-anchor="end" style="font-size:7.5px;fill:var(--fg)"'); });
    return sv(g+T(100,122,'Minh họa định tính, không phải số liệu','text-anchor="middle" '+TS),'Các nhân tố Fama–French'); },
  f:'Rᵢ − R_f = α + β·MKT + s·SMB + h·HML + r·RMW + c·CMA + ε',
  pts:['Mô hình 3 nhân tố (1993): thị trường, quy mô (cổ phiếu nhỏ), giá trị (P/B thấp). Mô hình 5 nhân tố (2015) thêm lợi nhuận (RMW) và đầu tư thận trọng (CMA).','Động lượng (Carhart 1997; Jegadeesh & Titman 1993) là nhân tố bổ sung phổ biến.','Phần bù nhân tố không ổn định: giá trị kém hiệu quả kéo dài 2010–2020 ở Mỹ.','Điểm La Bàn chính là một mô hình đa nhân tố: định giá ~ HML, chất lượng ~ RMW, động lượng ~ MOM.'],
  thr:[['α > 0 có ý nghĩa thống kê','Lợi nhuận vượt trội thật sự sau khi trừ nhân tố']],
  hook:'<b>Mẹo nhớ:</b> phần lớn “alpha” thực ra là beta với một nhân tố nào đó.',src:'Fama & French (1993, 2015), Journal of Financial Economics; Carhart (1997), Journal of Finance.'},
 {id:'emh',g:'Hành vi & chu kỳ',t:'Giả thuyết thị trường hiệu quả',d:'Ba cấp độ và giới hạn của chúng',
  vis:()=>sv(`<circle cx="100" cy="64" r="52" style="fill:var(--us);fill-opacity:.12;stroke:var(--us)"/><circle cx="100" cy="74" r="36" style="fill:var(--gold);fill-opacity:.15;stroke:var(--gold)"/><circle cx="100" cy="84" r="20" style="fill:var(--up);fill-opacity:.2;stroke:var(--up)"/>${T(100,22,'Mạnh: mọi thông tin, kể cả nội gián','text-anchor="middle" style="font-size:7.5px;fill:var(--fg)"')}${T(100,46,'Bán mạnh: thông tin công khai','text-anchor="middle" style="font-size:7.5px;fill:var(--fg)"')}${T(100,87,'Yếu: giá quá khứ','text-anchor="middle" style="font-size:7.5px;fill:var(--fg)"')}`,'Ba cấp độ thị trường hiệu quả'),
  f:'Giá phản ánh toàn bộ thông tin sẵn có → không thể vượt trội thị trường một cách hệ thống sau khi điều chỉnh rủi ro',
  pts:['Dạng yếu: phân tích kỹ thuật không tạo lợi thế. Dạng bán mạnh: phân tích cơ bản không tạo lợi thế. Dạng mạnh: cả thông tin nội gián.','Bằng chứng ủng hộ: phần lớn quỹ chủ động thua chỉ số sau phí trong dài hạn (báo cáo SPIVA).','Bằng chứng phản bác: bong bóng, các bất thường (động lượng, PEAD), tài chính hành vi.','Thị trường cận biên/mới nổi như Việt Nam được cho là kém hiệu quả hơn Mỹ — cơ hội và rủi ro đều lớn hơn.'],
  thr:[['Hàm ý thực tế','Nếu không có lợi thế rõ, quỹ chỉ số phí thấp là lựa chọn mạnh']],
  hook:'<b>Mẹo nhớ:</b> “Yếu – Bán mạnh – Mạnh” = giá cũ – tin công khai – tin nội bộ.',src:'Fama, E. (1970), “Efficient Capital Markets”, Journal of Finance 25(2); S&P SPIVA Scorecards.'},
 {id:'margin-trade',g:'Thị trường Mỹ & VN',t:'Giao dịch ký quỹ (margin)',d:'Đòn bẩy, tỷ lệ duy trì và call margin',
  vis:()=>{ const X=v=>14+v/50*172, Y=v=>110-v*.9; let g=`<line class="axis" x1="14" y1="110" x2="190" y2="110"/><path d="M${X(0)} ${Y(0)} L${X(50)} ${Y(50)}" style="stroke:var(--mut)" stroke-width="1.5"/><path d="M${X(0)} ${Y(0)} L${X(50)} ${Y(100)}" style="stroke:var(--dn)" stroke-width="2"/>`;
    return sv(g+T(150,30,'Lỗ có margin 1:1','style="font-size:8px;fill:var(--dn);font-weight:700"')+T(150,76,'Lỗ không vay','style="font-size:8px"')+T(100,122,'Giá giảm (%) →','text-anchor="middle" '+TS),'Đòn bẩy nhân đôi thua lỗ'); },
  f:'Tỷ lệ ký quỹ = (Giá trị CK − Nợ vay) ÷ Giá trị CK',
  pts:['Việt Nam: tỷ lệ ký quỹ ban đầu tối thiểu 50% theo quy định UBCKNN; công ty chứng khoán đặt tỷ lệ duy trì (thường 30–40%) và tỷ lệ xử lý (call/force sell).','Mỹ: Regulation T yêu cầu 50% ban đầu; FINRA yêu cầu tỷ lệ duy trì tối thiểu 25% (nhiều công ty đặt 30–40%).','Vay 1:1 nghĩa là giá giảm 25% làm mất 50% vốn; giảm 50% là mất trắng.','Đợt giải chấp hàng loạt có thể khiến cổ phiếu giảm sàn nhiều phiên liên tiếp ở Việt Nam (ví dụ các đợt 2022).'],
  thr:[['Không vay','An toàn nhất'],['Vay ≤ 30% danh mục','Chấp nhận được với người có kinh nghiệm'],['Vay 1:1','Rủi ro rất cao']],
  hook:'<b>Mẹo nhớ:</b> margin khuếch đại cả lãi lẫn lỗ — nhưng lỗ thì không có trần.',src:'Thông tư 120/2020/TT-BTC (VN); Federal Reserve Regulation T; FINRA Rule 4210.'},
 {id:'costs',g:'Thị trường Mỹ & VN',t:'Thuế, phí và chi phí ẩn',d:'Những thứ ăn mòn lợi nhuận mỗi năm',
  vis:()=>{ const X=v=>14+v/30*172, Y=v=>110-v/8*92; let g=`<line class="axis" x1="14" y1="110" x2="190" y2="110"/>`;
    [[0,'var(--gold)'],[1,'var(--us)'],[2,'var(--dn)']].forEach(([f,c])=>g+=`<path d="${pathFn(t=>Math.pow(1+(.10-f/100),t),0,30,X,Y)}" fill="none" style="stroke:${c}" stroke-width="2"/>`);
    return sv(g+T(160,20,'Phí 0%','style="font-size:8px;fill:var(--gold);font-weight:700"')+T(165,52,'1%','style="font-size:8px;fill:var(--us);font-weight:700"')+T(165,72,'2%','style="font-size:8px;fill:var(--dn);font-weight:700"')+T(100,122,'Năm (lợi suất gộp 10%) →','text-anchor="middle" '+TS),'Tác động của phí theo thời gian'); },
  f:'Việt Nam: thuế 0,1% trên giá trị bán + 5% trên cổ tức tiền mặt · Mỹ: thuế lãi vốn theo thời gian nắm giữ',
  pts:['Việt Nam: thuế thu nhập cá nhân 0,1% giá trị mỗi lệnh bán (kể cả khi lỗ), 5% cổ tức tiền mặt; phí môi giới thường 0,1–0,35% mỗi chiều.','Mỹ (với cư dân thuế Mỹ): lãi vốn ngắn hạn (< 1 năm) chịu thuế như thu nhập thường; dài hạn 0/15/20%; cổ tức đủ điều kiện ưu đãi. Nhà đầu tư nước ngoài thường bị khấu trừ 30% cổ tức (giảm theo hiệp định thuế).','Chênh lệch giá mua–bán (spread) và trượt giá là chi phí ẩn, lớn ở cổ phiếu thanh khoản thấp.','Phí 2%/năm trong 30 năm có thể lấy đi khoảng 40% tài sản cuối kỳ so với không phí.'],
  thr:[['Giao dịch 1 lần/tuần, phí 0,25%','≈ 26% vốn/năm chỉ cho phí và thuế bán (VN)']],
  hook:'<b>Mẹo nhớ:</b> chi phí là lợi nhuận âm duy nhất bạn kiểm soát được 100%.',src:'Luật Thuế TNCN và Thông tư 111/2013/TT-BTC (VN); IRS Publication 550 (Mỹ). Kiểm tra quy định hiện hành.'},
 {id:'earnings',g:'Thị trường Mỹ & VN',t:'Mùa báo cáo và lịch sự kiện',d:'Những ngày giá hay biến động mạnh',
  vis:()=>{ const m=['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12']; let g=''; m.forEach((x,i)=>{ const hot=[0,3,6,9].includes(i)||[1,4,7,10].includes(i)&&false; const vn=[0,3,6,9].includes(i); g+=`<rect x="${8+i*15.5}" y="40" width="13" height="40" rx="2" style="fill:${[0,3,6,9].includes(i)?'var(--gold)':'var(--line2)'};fill-opacity:${[0,3,6,9].includes(i)?.85:.5}"/>`+T(14.5+i*15.5,92,x,'text-anchor="middle" style="font-size:7px"'); });
    return sv(g+T(100,28,'Mùa báo cáo quý: tháng 1, 4, 7, 10','text-anchor="middle" '+TB)+T(100,110,'VN: BCTC quý trong 20–30 ngày sau quý · Mỹ: 10-Q trong 40–45 ngày','text-anchor="middle" style="font-size:7px"'),'Lịch mùa báo cáo'); },
  f:'Biến động quanh ngày công bố KQKD thường gấp nhiều lần ngày thường',
  pts:['Mỹ: mùa báo cáo bắt đầu khoảng 2 tuần sau cuối quý, mở màn bởi các ngân hàng lớn; doanh nghiệp nộp 10-Q (quý) và 10-K (năm) lên SEC.','Việt Nam: doanh nghiệp niêm yết công bố BCTC quý trong 20 ngày (30 ngày nếu là công ty mẹ có BCTC hợp nhất); BCTC năm kiểm toán trong 90 ngày.','Các sự kiện vĩ mô lớn: họp FOMC (8 lần/năm), CPI Mỹ, họp NHNN, kỳ cơ cấu ETF (VN30, FTSE, VNM ETF) hằng quý.','Ngày đáo hạn phái sinh: thứ Năm tuần thứ ba của tháng (VN30F) và thứ Sáu tuần thứ ba (quyền chọn Mỹ).','“Mua tin đồn, bán sự thật”: giá thường đã phản ánh kỳ vọng trước ngày công bố.'],
  thr:[['Hậu công bố (PEAD)','Giá có xu hướng tiếp tục trôi theo hướng bất ngờ vài tuần']],
  hook:'<b>Mẹo nhớ:</b> tháng 1–4–7–10 là tháng “khoe sổ”.',src:'SEC Form 10-Q/10-K rules; Thông tư 96/2020/TT-BTC (công bố thông tin, VN); Bernard & Thomas (1989) về PEAD.'}
];
NEW_LESSONS.forEach(l=>LESSONS.push(l));
const ORDER=['Định giá','Chất lượng','Phân tích kỹ thuật','Danh mục & rủi ro','Hành vi & chu kỳ','Thị trường Mỹ & VN'];
LESSONS.sort((a,b)=>ORDER.indexOf(a.g)-ORDER.indexOf(b.g));

/* câu hỏi mới */
[
 {q:'Nến Búa (Hammer) có ý nghĩa đảo chiều tăng khi xuất hiện ở đâu?',a:['Sau một nhịp giảm','Sau một nhịp tăng','Giữa vùng đi ngang','Ở bất kỳ đâu'],c:0,e:'Cùng hình dáng, nếu xuất hiện sau nhịp tăng nó được gọi là “Người treo cổ” — tín hiệu giảm. Bối cảnh quyết định ý nghĩa.'},
 {q:'Mẫu Sao mai gồm bao nhiêu cây nến?',a:['3','1','2','5'],c:0,e:'Nến giảm dài, nến thân nhỏ (ngôi sao), rồi nến tăng dài đóng sâu vào thân nến đầu.'},
 {q:'Giao cắt vàng (Golden Cross) là gì?',a:['MA50 cắt lên MA200','MA200 cắt lên MA50','RSI vượt 70','Giá vượt dải Bollinger trên'],c:0,e:'MA ngắn hạn cắt lên MA dài hạn: tín hiệu xu hướng dài hạn chuyển tăng — mang tính xác nhận, đi sau giá.'},
 {q:'MACD được tính bằng?',a:['EMA12 − EMA26','SMA50 − SMA200','RSI − 50','Giá − MA20'],c:0,e:'Đường tín hiệu là EMA9 của MACD; histogram là MACD trừ tín hiệu.'},
 {q:'Mức Fibonacci thoái lui nào được gọi là “tỷ lệ vàng”?',a:['61,8%','50%','23,6%','100%'],c:0,e:'0,618 = φ − 1. 38,2% = 1 − 0,618. Mức 50% không phải số Fibonacci.'},
 {q:'Trong sóng Elliott, sóng nào KHÔNG được là sóng ngắn nhất?',a:['Sóng 3','Sóng 1','Sóng 5','Sóng B'],c:0,e:'Ba quy tắc cứng: sóng 2 không thoái lui quá 100% sóng 1; sóng 3 không ngắn nhất; sóng 4 không đè vào vùng giá sóng 1.'},
 {q:'Dải Bollinger thắt hẹp (squeeze) báo hiệu điều gì?',a:['Biến động thấp, dễ có nhịp biến động mạnh sắp tới','Chắc chắn sẽ tăng','Chắc chắn sẽ giảm','Thanh khoản cạn kiệt vĩnh viễn'],c:0,e:'Squeeze cho biết biến động sắp mở rộng nhưng không cho biết hướng — cần tín hiệu khác để xác định.'},
 {q:'Mô hình Vai – đầu – vai được xác nhận khi nào?',a:['Giá đóng cửa thủng đường viền cổ','Khi đầu hình thành','Khi vai trái hình thành','Khi RSI dưới 30'],c:0,e:'Mục tiêu giá = khoảng cách từ đầu tới đường viền cổ, đo xuống từ điểm phá vỡ.'},
 {q:'Mô hình giá nào là “yêu thích” của William O’Neil (CAN SLIM)?',a:['Cốc và tay cầm','Vai – đầu – vai','Nêm tăng','Ba đỉnh'],c:0,e:'Đáy chữ U rồi nhịp điều chỉnh nhỏ (tay cầm), phá vỡ với khối lượng lớn.'},
 {q:'Kiểu biểu đồ nào KHÔNG dùng trục thời gian đều?',a:['Renko','Nến Nhật','Thanh OHLC','Đường'],c:0,e:'Renko chỉ vẽ viên gạch mới khi giá đi đủ một hộp, nên trục ngang là số viên gạch. Biểu đồ Phá 3 đường cũng vậy.'},
 {q:'Heikin-Ashi tính giá đóng cửa như thế nào?',a:['(Mở + Cao + Thấp + Đóng) ÷ 4','Bằng giá đóng thực','(Cao + Thấp) ÷ 2','Trung bình 3 phiên'],c:0,e:'Giá mở HA = trung bình mở và đóng HA của nến trước. Nến HA làm mượt xu hướng nhưng không phải giá giao dịch thực.'},
 {q:'Công thức Gordon (DDM) định giá cổ phiếu là?',a:['D₁ ÷ (r − g)','EPS × P/E','D₀ × r','FCF ÷ g'],c:0,e:'Ví dụ D₁ = 3.000đ, r = 12%, g = 5% → 42.857đ. Rất nhạy khi r − g nhỏ.'},
 {q:'Chu kỳ chuyển đổi tiền mặt (CCC) âm nghĩa là gì?',a:['Nhà cung cấp đang tài trợ vốn lưu động cho doanh nghiệp','Doanh nghiệp sắp phá sản','Tồn kho quá lớn','Doanh thu giảm'],c:0,e:'CCC = DIO + DSO − DPO. Costco, Amazon có CCC âm: thu tiền khách trước khi phải trả nhà cung cấp.'},
 {q:'Beneish M-Score dùng để phát hiện điều gì?',a:['Khả năng thao túng lợi nhuận','Rủi ro phá sản','Định giá rẻ','Động lượng giá'],c:0,e:'Ngưỡng phổ biến của phiên bản 8 biến: M > −1,78 là đáng ngờ. Phá sản là việc của Altman Z.'},
 {q:'Ở Việt Nam, thuế khi bán cổ phiếu niêm yết là bao nhiêu?',a:['0,1% giá trị bán, kể cả khi lỗ','20% lợi nhuận','5% giá trị bán','Miễn thuế'],c:0,e:'Ngoài ra cổ tức tiền mặt chịu thuế 5%. Phí môi giới tính riêng theo công ty chứng khoán.'},
 {q:'Regulation T ở Mỹ yêu cầu tỷ lệ ký quỹ ban đầu tối thiểu?',a:['50%','25%','10%','100%'],c:0,e:'FINRA yêu cầu tỷ lệ duy trì tối thiểu 25%; nhiều công ty môi giới đặt cao hơn.'},
 {q:'Nhấn chìm tăng (Bullish Engulfing) cần điều kiện nào?',a:['Thân nến tăng bao trùm thân nến giảm trước đó','Hai nến có đáy bằng nhau','Nến tăng nằm trong thân nến giảm','Có khoảng trống giá xuống'],c:0,e:'“Nằm trong thân nến trước” là Harami. Hai đáy bằng nhau là Nhíp đáy.'},
 {q:'Ichimoku: giá nằm trên mây Kumo cho thấy điều gì?',a:['Xu hướng tăng','Xu hướng giảm','Đi ngang','Quá bán'],c:0,e:'Trên mây: tăng; dưới mây: giảm; trong mây: trung tính. Bộ tham số kinh điển 9 – 26 – 52.'}
].forEach(q=>QUIZ.push(q));

/* ---------- mở chi tiết mẫu nến / mô hình ---------- */
function openCandle(id){
  const p=CDL.find(x=>x.id===id); if(!p) return; const i=CDL.indexOf(p), next=CDL[(i+1)%CDL.length];
  const catCls=p.cat.includes('tăng')?'g-A':p.cat.includes('giảm')?'g-D':'g-C';
  openSheet(p.n,`<div class="lesson">
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="grade ${catCls}" style="font-size:12.5px;padding:3px 9px">${esc(p.cat)}</span><span class="chip">${p.k} nến</span><span class="chip">Độ tin cậy: ${esc(p.rel)}</span><span class="note">${esc(p.en)}</span></div>
    <div class="vis">${cdlSVG(p,{h:140})}</div>
    <p class="note">Nến xám: bối cảnh ${p.ctx==='down'?'giảm':p.ctx==='up'?'tăng':'bất kỳ'} trước đó. Nến màu: mẫu hình.</p>
    <p style="font-size:15px">${esc(p.d)}</p>
    <div class="hook" style="border-color:var(--us)"><b style="color:var(--us)">Xác nhận:</b> ${esc(p.cf)}</div>
    <div class="hook"><b>Mẹo nhớ:</b> ${esc(p.h)}</div>
    <p class="note">Độ tin cậy là đánh giá định tính tổng hợp từ tài liệu (Nison; Bulkowski, Encyclopedia of Candlestick Charts, 2008), không phải xác suất. Luôn kết hợp với xu hướng, hỗ trợ/kháng cự và khối lượng.</p>
    <div class="row-btns"><button class="btn pri" id="cNext">Mẫu tiếp: ${esc(next.n)}</button><button class="btn" id="cChart">Tìm trên biểu đồ</button></div></div>`,body=>{
    $('#cNext').onclick=()=>openCandle(next.id);
    $('#cChart').onclick=()=>{ closeSheet(); CH.ind.pat=true; if(['renko','lb','line','area'].includes(CH.type)) CH.type='candle'; saveChartPrefs(); setView('chart'); };
  });
}
function openChartPattern(id){
  const p=CPAT.find(x=>x.id===id); if(!p) return; const i=CPAT.indexOf(p), next=CPAT[(i+1)%CPAT.length];
  const catCls=p.cat.includes('tăng')?'g-A':p.cat.includes('giảm')?'g-D':'g-C';
  openSheet(p.n,`<div class="lesson">
    <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="grade ${catCls}" style="font-size:12.5px;padding:3px 9px">${esc(p.cat)}</span><span class="chip">Độ tin cậy: ${esc(p.rel)}</span></div>
    <div class="vis">${cpatSVG(p)}</div>
    <div class="legend" style="margin:0"><span><i style="background:var(--gold)"></i>Đường viền cổ / hỗ trợ – kháng cự</span><span><i style="background:var(--us)"></i>Đường biên</span><span><i style="background:var(--up)"></i>Mục tiêu đo lường</span></div>
    <p style="font-size:15px">${esc(p.d)}</p>
    <table class="thr"><tr><td><b>Đo mục tiêu</b></td><td>${esc(p.m)}</td></tr><tr><td><b>Khối lượng</b></td><td>${esc(p.v)}</td></tr></table>
    <p class="note">Nguồn: Edwards & Magee, Technical Analysis of Stock Trends; Bulkowski, Encyclopedia of Chart Patterns (3rd ed., 2021). Mục tiêu đo lường là ước lượng kinh nghiệm, giá thường không đạt đủ.</p>
    <div class="row-btns"><button class="btn pri" id="pNext">Mô hình tiếp: ${esc(next.n)}</button></div></div>`,()=>{ $('#pNext').onclick=()=>openChartPattern(next.id); });
}
/* ôn tập nhận diện nến */
function startCandleQuiz(){
  const pool=shuffle(CDL).slice(0,8); const st={k:0,score:0};
  const render=()=>{
    if(st.k>=pool.length){ store.cdlBest=Math.max(store.cdlBest||0,st.score); persist();
      $('#sheetBody').innerHTML=`<div class="lesson" style="text-align:center;align-items:center"><div class="bigring" style="margin:10px auto">${ringSVG(st.score/pool.length*100,108,9)}<div class="v"><b>${st.score}/${pool.length}</b><span>nhận diện đúng</span></div></div><p>${st.score>=7?'Mắt đọc nến rất tốt.':st.score>=5?'Khá tốt — xem lại các mẫu nhầm lẫn.':'Hãy lướt lại thư viện mẫu nến rồi thử lại.'}</p><div class="row-btns" style="justify-content:center"><button class="btn pri" id="cqAgain">Thử 8 mẫu khác</button><button class="btn" id="cqClose">Về thư viện</button></div></div>`;
      animateRings($('#sheetBody')); $('#cqAgain').onclick=startCandleQuiz; $('#cqClose').onclick=()=>{ closeSheet(); if(S.view==='learn') RENDER.learn(); }; return; }
    const p=pool[st.k]; const others=shuffle(CDL.filter(x=>x.id!==p.id&&x.cat===p.cat).concat(shuffle(CDL.filter(x=>x.id!==p.id&&x.cat!==p.cat)))).filter((x,i,a)=>a.indexOf(x)===i).slice(0,3);
    const opts=shuffle([p].concat(others));
    $('#sheetBody').innerHTML=`<div class="lesson"><div style="display:flex;justify-content:space-between"><span class="note">Mẫu ${st.k+1}/${pool.length}</span><span class="note">Đúng: ${st.score}</span></div><div class="progress"><i style="width:${st.k/pool.length*100}%"></i></div>
      <h3 style="font-size:19px">Đây là mẫu nến nào?</h3><div class="vis">${cdlSVG(p,{h:140})}</div>
      <div style="display:flex;flex-direction:column;gap:8px" id="cqOpts">${opts.map(o=>`<button class="quiz-opt" data-id="${o.id}">${esc(o.n)}</button>`).join('')}</div><div id="cqFb"></div></div>`;
    let done=false;
    $$('#cqOpts .quiz-opt').forEach(b=>b.onclick=()=>{ if(done) return; done=true; const ok=b.dataset.id===p.id; if(ok) st.score++;
      $$('#cqOpts .quiz-opt').forEach(x=>{ if(x.dataset.id===p.id) x.classList.add('ok'); x.disabled=true; }); if(!ok) b.classList.add('bad');
      $('#cqFb').innerHTML=`<div class="hook" style="border-color:${ok?'var(--up)':'var(--dn)'}"><b style="color:${ok?'var(--up)':'var(--dn)'}">${ok?'Chính xác.':'Chưa đúng — đây là '+esc(p.n)+'.'}</b> ${esc(p.d)}</div><div class="row-btns" style="margin-top:10px"><button class="btn pri" id="cqNext">${st.k+1<pool.length?'Mẫu tiếp':'Xem kết quả'}</button></div>`;
      $('#cqNext').onclick=()=>{ st.k++; render(); }; });
  };
  openSheet('Nhận diện mẫu nến','',()=>render());
}
/* mở rộng màn hình Học thuật */
const _learnBase=RENDER.learn;
RENDER.learn=function(){ _learnBase(); appendLibs(); };
function appendLibs(){
  const el=$('#v-learn'); const cats=['Đảo chiều tăng','Đảo chiều giảm','Tiếp diễn','Lưỡng lự'];
  const lib=document.createElement('section'); lib.id='cdlLib';
  lib.innerHTML=`<div class="sec-h"><div><h2 style="font-size:18px">Thư viện mẫu nến Nhật</h2><p>${CDL.length} mẫu · bối cảnh, xác nhận, mẹo nhớ · kỷ lục nhận diện ${store.cdlBest||0}/8</p></div><button class="btn sm pri" id="startCdlQuiz">Ôn nhận diện</button></div>
   <div class="chips" style="margin-bottom:10px" role="group" aria-label="Lọc nhóm mẫu nến">${['Tất cả'].concat(cats).map((c,i)=>`<button class="chip ${i===0?'on':''}" data-cdlcat="${c}" aria-pressed="${i===0}">${c}</button>`).join('')}</div>
   <div class="learn-grid cdl-grid">${CDL.map(p=>`<button class="lcard" data-cdl="${p.id}" data-cat="${esc(p.cat)}"><span class="th">${cdlSVG(p)}</span><span class="tx"><b>${esc(p.n)}</b><span>${esc(p.cat)} · ${p.k} nến · tin cậy ${esc(p.rel.toLowerCase())}</span></span></button>`).join('')}</div>`;
  const cp=document.createElement('section'); cp.id='cpatLib';
  cp.innerHTML=`<div class="sec-h"><div><h2 style="font-size:18px">Mô hình giá kinh điển</h2><p>${CPAT.length} mô hình · cách đo mục tiêu giá</p></div></div>
   <div class="learn-grid">${CPAT.map(p=>`<button class="lcard" data-cpat="${p.id}"><span class="th">${cpatSVG(p)}</span><span class="tx"><b>${esc(p.n)}</b><span>${esc(p.cat)} · tin cậy ${esc(p.rel.toLowerCase())}</span></span></button>`).join('')}</div>`;
  const anchor=$$('#v-learn > section').find(s=>s.querySelector('h2')&&s.querySelector('h2').textContent==='Phân tích kỹ thuật');
  if(anchor){ anchor.after(lib); lib.after(cp); } else { el.appendChild(lib); el.appendChild(cp); }
  $('#startCdlQuiz').onclick=startCandleQuiz;
  $$('[data-cdlcat]',lib).forEach(b=>b.onclick=()=>{ const c=b.dataset.cdlcat; $$('[data-cdlcat]',lib).forEach(x=>{ x.classList.toggle('on',x===b); x.setAttribute('aria-pressed',String(x===b)); }); $$('.cdl-grid .lcard',lib).forEach(card=>card.hidden= c!=='Tất cả'&&card.dataset.cat!==c); });
  if(S._scrollCdl){ S._scrollCdl=false; setTimeout(()=>lib.scrollIntoView({block:'start'}),50); }
}
const _openLessonBase=openLesson;
openLesson=function(id){ if(id==='cdl-library'){ closeSheet(); S._scrollCdl=true; setView('learn',{keepScroll:true}); return; } _openLessonBase(id); };
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-cdl]'); if(c){ openCandle(c.dataset.cdl); return; }
  const p=e.target.closest('[data-cpat]'); if(p){ openChartPattern(p.dataset.cpat); return; }
});
