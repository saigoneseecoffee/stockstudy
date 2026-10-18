/* ============================================================
   DỮ LIỆU THAM KHẢO — ảnh chụp ƯỚC TÍNH, không phải thời gian thực.
   Đơn vị: % cho tỷ suất/biên/tăng trưởng; lần (x) cho bội số.
   cap: Mỹ = tỷ USD; Việt Nam = nghìn tỷ đồng.
   f: 9 phép thử Piotroski (1 = đạt).
   ============================================================ */
const DATA_ASOF = "Ước tính theo BCTC gần nhất mà mô hình biết (khoảng 2025 – giữa 2026)";

const SECTORS = {
  tech:"Phần mềm & CNTT", semi:"Bán dẫn", comm:"Internet & Truyền thông", retail:"Bán lẻ",
  staple:"Tiêu dùng thiết yếu", bank:"Ngân hàng", pay:"Thanh toán", ins:"Đầu tư & Bảo hiểm",
  health:"Y tế & Dược", energy:"Dầu khí & Năng lượng", ind:"Công nghiệp & Logistics", mat:"Vật liệu & Hóa chất",
  re:"Bất động sản", util:"Điện & Tiện ích", broker:"Chứng khoán", auto:"Ô tô & Xe điện", cons:"Tiêu dùng không thiết yếu",
  build:"Xây dựng & Vật liệu XD", agri:"Nông nghiệp & Thủy sản", other:"Đa ngành & Khác"
};

const CURATED = [
/* ---------------- HOA KỲ ---------------- */
{t:"AAPL",n:"Apple",m:"US",ex:"NASDAQ",s:"tech",cap:3700,pe:33,pb:50,ev:25,fcf:3.2,dy:0.4,po:15,roe:150,roic:55,gm:46,om:31,nm:24,rg:2,eg:6,fg:10,de:1.5,cr:0.9,ic:40,z:7.8,mo:8,b:1.2,f:"111101111"},
{t:"MSFT",n:"Microsoft",m:"US",ex:"NASDAQ",s:"tech",cap:3800,pe:35,pb:11,ev:24,fcf:2.0,dy:0.7,po:25,roe:33,roic:27,gm:69,om:45,nm:36,rg:14,eg:16,fg:14,de:0.2,cr:1.3,ic:50,z:9.5,mo:15,b:0.9,f:"111111011"},
{t:"NVDA",n:"NVIDIA",m:"US",ex:"NASDAQ",s:"semi",cap:4500,pe:50,pb:45,ev:42,fcf:1.8,dy:0.02,po:1,roe:105,roic:80,gm:72,om:60,nm:53,rg:90,eg:140,fg:40,de:0.1,cr:4.2,ic:300,z:30,mo:40,b:1.8,f:"111111101"},
{t:"GOOGL",n:"Alphabet",m:"US",ex:"NASDAQ",s:"comm",cap:3000,pe:25,pb:8,ev:18,fcf:2.6,dy:0.3,po:8,roe:32,roic:28,gm:59,om:32,nm:30,rg:13,eg:25,fg:13,de:0.1,cr:1.9,ic:200,z:12,mo:35,b:1.05,f:"111111111"},
{t:"AMZN",n:"Amazon",m:"US",ex:"NASDAQ",s:"retail",cap:2400,pe:34,pb:7,ev:16,fcf:1.0,dy:0,po:0,roe:24,roic:15,gm:49,om:11,nm:10,rg:11,eg:60,fg:15,de:0.4,cr:1.05,ic:25,z:5.5,mo:10,b:1.3,f:"111011011"},
{t:"META",n:"Meta Platforms",m:"US",ex:"NASDAQ",s:"comm",cap:1800,pe:26,pb:9,ev:17,fcf:2.8,dy:0.3,po:8,roe:36,roic:30,gm:82,om:42,nm:38,rg:18,eg:35,fg:12,de:0.25,cr:2.0,ic:80,z:9,mo:18,b:1.25,f:"111110111"},
{t:"AVGO",n:"Broadcom",m:"US",ex:"NASDAQ",s:"semi",cap:1600,pe:38,pb:15,ev:30,fcf:2.0,dy:0.8,po:50,roe:25,roic:15,gm:77,om:40,nm:35,rg:30,eg:18,fg:25,de:0.9,cr:1.3,ic:8,z:4.2,mo:45,b:1.2,f:"111011101"},
{t:"TSLA",n:"Tesla",m:"US",ex:"NASDAQ",s:"auto",cap:1400,pe:180,pb:15,ev:90,fcf:0.4,dy:0,po:0,roe:8,roic:6,gm:17,om:6,nm:6,rg:8,eg:-25,fg:15,de:0.1,cr:2.0,ic:25,z:11,mo:50,b:2.2,f:"110000100"},
{t:"BRK.B",n:"Berkshire Hathaway",m:"US",ex:"NYSE",s:"ins",cap:1050,pe:22,pb:1.6,ev:12,fcf:4.0,dy:0,po:0,roe:10,roic:8,gm:25,om:15,nm:18,rg:5,eg:10,fg:6,de:0.2,cr:1.5,ic:30,z:3.1,mo:2,b:0.8,f:"111111100"},
{t:"JPM",n:"JPMorgan Chase",m:"US",ex:"NYSE",s:"bank",bank:1,cap:820,pe:15,pb:2.4,dy:2.0,po:28,roe:17,nim:2.6,npl:0.8,casa:30,car:15,rg:10,eg:15,fg:5,mo:25,b:1.1,f:"111111110"},
{t:"V",n:"Visa",m:"US",ex:"NYSE",s:"pay",cap:680,pe:32,pb:17,ev:25,fcf:3.0,dy:0.7,po:22,roe:50,roic:35,gm:80,om:67,nm:54,rg:10,eg:13,fg:12,de:0.55,cr:1.1,ic:40,z:8,mo:10,b:0.9,f:"111111111"},
{t:"MA",n:"Mastercard",m:"US",ex:"NYSE",s:"pay",cap:530,pe:36,pb:60,ev:28,fcf:2.8,dy:0.5,po:19,roe:180,roic:50,gm:77,om:58,nm:45,rg:12,eg:15,fg:14,de:2.4,cr:1.2,ic:25,z:7,mo:6,b:1.0,f:"111101111"},
{t:"LLY",n:"Eli Lilly",m:"US",ex:"NYSE",s:"health",cap:900,pe:45,pb:40,ev:35,fcf:0.8,dy:0.7,po:30,roe:75,roic:30,gm:82,om:42,nm:30,rg:30,eg:45,fg:35,de:1.6,cr:1.3,ic:25,z:6.5,mo:20,b:0.5,f:"111001111"},
{t:"UNH",n:"UnitedHealth",m:"US",ex:"NYSE",s:"health",cap:300,pe:17,pb:3,ev:11,fcf:6.0,dy:2.6,po:45,roe:15,roic:10,gm:20,om:5,nm:3.5,rg:8,eg:-15,fg:5,de:0.75,cr:0.8,ic:7,z:3.2,mo:-35,b:0.6,f:"010100010"},
{t:"JNJ",n:"Johnson & Johnson",m:"US",ex:"NYSE",s:"health",cap:470,pe:18,pb:6,ev:14,fcf:4.5,dy:2.8,po:50,roe:30,roic:18,gm:69,om:26,nm:22,rg:3,eg:4,fg:6,de:0.55,cr:1.1,ic:25,z:4.0,mo:30,b:0.4,f:"111110110"},
{t:"COST",n:"Costco",m:"US",ex:"NASDAQ",s:"retail",cap:410,pe:50,pb:15,ev:32,fcf:1.8,dy:0.5,po:26,roe:30,roic:22,gm:13,om:3.8,nm:2.9,rg:7,eg:12,fg:9,de:0.3,cr:1.0,ic:60,z:8.5,mo:0,b:0.8,f:"111111101"},
{t:"WMT",n:"Walmart",m:"US",ex:"NASDAQ",s:"retail",cap:820,pe:38,pb:9,ev:20,fcf:1.8,dy:0.9,po:35,roe:23,roic:15,gm:25,om:4.3,nm:3.0,rg:5,eg:8,fg:10,de:0.6,cr:0.8,ic:12,z:5.6,mo:15,b:0.65,f:"111110111"},
{t:"PG",n:"Procter & Gamble",m:"US",ex:"NYSE",s:"staple",cap:360,pe:23,pb:7,ev:16,fcf:4.0,dy:2.8,po:62,roe:31,roic:19,gm:51,om:24,nm:19,rg:3,eg:5,fg:4,de:0.65,cr:0.7,ic:20,z:4.6,mo:-10,b:0.4,f:"111110101"},
{t:"KO",n:"Coca-Cola",m:"US",ex:"NYSE",s:"staple",cap:300,pe:23,pb:10,ev:20,fcf:2.8,dy:2.9,po:68,roe:40,roic:18,gm:61,om:30,nm:25,rg:5,eg:7,fg:6,de:1.5,cr:1.1,ic:10,z:3.6,mo:8,b:0.5,f:"111101110"},
{t:"PEP",n:"PepsiCo",m:"US",ex:"NASDAQ",s:"staple",cap:200,pe:18,pb:10,ev:13,fcf:3.8,dy:3.8,po:75,roe:45,roic:15,gm:54,om:13,nm:8,rg:3,eg:-3,fg:4,de:2.4,cr:0.85,ic:9,z:3.0,mo:-10,b:0.5,f:"110100000"},
{t:"XOM",n:"Exxon Mobil",m:"US",ex:"NYSE",s:"energy",cap:480,pe:15,pb:1.8,ev:7,fcf:6.0,dy:3.6,po:55,roe:12,roic:10,gm:32,om:12,nm:9.5,rg:2,eg:-5,fg:2,de:0.15,cr:1.3,ic:50,z:3.8,mo:5,b:0.6,f:"110110100"},
{t:"HD",n:"Home Depot",m:"US",ex:"NYSE",s:"retail",cap:380,pe:26,pb:50,ev:18,fcf:3.5,dy:2.4,po:62,roe:200,roic:25,gm:33,om:13,nm:9,rg:2,eg:-2,fg:4,de:4.5,cr:1.1,ic:8,z:4.4,mo:0,b:1.0,f:"110100100"},
{t:"ADBE",n:"Adobe",m:"US",ex:"NASDAQ",s:"tech",cap:150,pe:18,pb:12,ev:15,fcf:6.0,dy:0,po:0,roe:45,roic:35,gm:89,om:36,nm:30,rg:10,eg:12,fg:11,de:0.5,cr:1.0,ic:40,z:6.0,mo:-25,b:1.2,f:"111101111"},
{t:"AMD",n:"AMD",m:"US",ex:"NASDAQ",s:"semi",cap:380,pe:45,pb:5,ev:40,fcf:1.2,dy:0,po:0,roe:7,roic:5,gm:53,om:10,nm:10,rg:15,eg:20,fg:35,de:0.06,cr:2.5,ic:40,z:9,mo:60,b:1.9,f:"111011110"},
{t:"NFLX",n:"Netflix",m:"US",ex:"NASDAQ",s:"comm",cap:500,pe:45,pb:18,ev:35,fcf:2.0,dy:0,po:0,roe:42,roic:28,gm:47,om:29,nm:24,rg:13,eg:35,fg:25,de:0.65,cr:1.2,ic:18,z:6.8,mo:30,b:1.3,f:"111111111"},
{t:"CAT",n:"Caterpillar",m:"US",ex:"NYSE",s:"ind",cap:230,pe:22,pb:11,ev:16,fcf:3.2,dy:1.3,po:28,roe:50,roic:25,gm:34,om:19,nm:15,rg:4,eg:10,fg:5,de:1.9,cr:1.4,ic:25,z:3.9,mo:25,b:1.1,f:"111010111"},
{t:"ABBV",n:"AbbVie",m:"US",ex:"NYSE",s:"health",cap:380,pe:18,pb:40,ev:15,fcf:5.0,dy:3.2,po:60,roe:60,roic:15,gm:70,om:30,nm:10,rg:3,eg:-10,fg:12,de:5,cr:0.7,ic:5,z:2.1,mo:20,b:0.5,f:"110100010"},

/* ---------------- VIỆT NAM ---------------- */
{t:"VCB",n:"Vietcombank",m:"VN",ex:"HOSE",s:"bank",bank:1,cap:510,pe:15,pb:2.4,dy:0.5,po:8,roe:17,nim:2.9,npl:1.0,casa:33,car:12,rg:7,eg:8,fg:10,mo:10,b:0.8,f:"111111110"},
{t:"BID",n:"BIDV",m:"VN",ex:"HOSE",s:"bank",bank:1,cap:280,pe:12,pb:1.9,dy:0,po:0,roe:17,nim:2.6,npl:1.4,casa:18,car:9,rg:10,eg:15,fg:12,mo:5,b:1.0,f:"111101100"},
{t:"CTG",n:"VietinBank",m:"VN",ex:"HOSE",s:"bank",bank:1,cap:230,pe:9,pb:1.4,dy:0,po:0,roe:18,nim:2.9,npl:1.2,casa:23,car:9.5,rg:12,eg:30,fg:15,mo:25,b:1.1,f:"111111110"},
{t:"TCB",n:"Techcombank",m:"VN",ex:"HOSE",s:"bank",bank:1,cap:240,pe:10,pb:1.5,dy:1.3,po:15,roe:16,nim:4.0,npl:1.2,casa:38,car:15,rg:15,eg:15,fg:18,mo:40,b:1.2,f:"111110111"},
{t:"MBB",n:"MB Bank",m:"VN",ex:"HOSE",s:"bank",bank:1,cap:175,pe:7,pb:1.4,dy:2.0,po:15,roe:21,nim:4.2,npl:1.6,casa:38,car:11,rg:18,eg:15,fg:16,mo:35,b:1.15,f:"111111101"},
{t:"ACB",n:"ACB",m:"VN",ex:"HOSE",s:"bank",bank:1,cap:120,pe:7,pb:1.4,dy:3.5,po:25,roe:20,nim:3.3,npl:1.4,casa:22,car:12,rg:10,eg:5,fg:12,mo:10,b:0.95,f:"110111100"},
{t:"VPB",n:"VPBank",m:"VN",ex:"HOSE",s:"bank",bank:1,cap:200,pe:10,pb:1.2,dy:2.5,po:25,roe:12,nim:5.5,npl:3.6,casa:15,car:15,rg:15,eg:20,fg:25,mo:40,b:1.25,f:"110010101"},
{t:"HPG",n:"Hòa Phát",m:"VN",ex:"HOSE",s:"mat",cap:200,pe:13,pb:1.5,ev:9,fcf:-2,dy:0,po:0,roe:11,roic:8,gm:13,om:9,nm:8,rg:8,eg:15,fg:25,de:0.6,cr:1.1,ic:8,z:2.4,mo:15,b:1.3,f:"111010011"},
{t:"FPT",n:"FPT Corp",m:"VN",ex:"HOSE",s:"tech",cap:170,pe:21,pb:5.5,ev:14,fcf:3.0,dy:1.6,po:35,roe:28,roic:22,gm:38,om:17,nm:15,rg:19,eg:22,fg:18,de:0.4,cr:1.4,ic:20,z:4.5,mo:-15,b:0.9,f:"111111111"},
{t:"MWG",n:"Thế Giới Di Động",m:"VN",ex:"HOSE",s:"retail",cap:110,pe:17,pb:3.2,ev:9,fcf:7.0,dy:1.0,po:15,roe:19,roic:14,gm:20,om:4.5,nm:3.3,rg:8,eg:40,fg:30,de:0.8,cr:1.2,ic:5,z:3.4,mo:30,b:1.1,f:"111111111"},
{t:"VNM",n:"Vinamilk",m:"VN",ex:"HOSE",s:"staple",cap:125,pe:16,pb:4.0,ev:11,fcf:6.0,dy:6.5,po:95,roe:25,roic:22,gm:41,om:19,nm:15,rg:1,eg:-1,fg:3,de:0.4,cr:1.6,ic:40,z:5.2,mo:-5,b:0.6,f:"110110101"},
{t:"MSN",n:"Masan Group",m:"VN",ex:"HOSE",s:"staple",cap:110,pe:40,pb:2.8,ev:14,fcf:3.0,dy:0,po:0,roe:7,roic:6,gm:30,om:11,nm:3,rg:3,eg:50,fg:40,de:1.5,cr:1.0,ic:2,z:1.4,mo:15,b:1.2,f:"111010010"},
{t:"VIC",n:"Vingroup",m:"VN",ex:"HOSE",s:"re",cap:600,pe:60,pb:2.8,ev:30,fcf:-8,dy:0,po:0,roe:5,roic:3,gm:18,om:5,nm:2,rg:20,eg:0,fg:20,de:2.0,cr:0.9,ic:1.5,z:0.9,mo:120,b:1.4,f:"100000001"},
{t:"VHM",n:"Vinhomes",m:"VN",ex:"HOSE",s:"re",cap:350,pe:9,pb:1.6,ev:8,fcf:-3,dy:0,po:0,roe:18,roic:12,gm:35,om:30,nm:22,rg:5,eg:0,fg:15,de:0.6,cr:1.3,ic:10,z:1.9,mo:90,b:1.3,f:"101000100"},
{t:"GAS",n:"PV Gas",m:"VN",ex:"HOSE",s:"energy",cap:165,pe:15,pb:2.6,ev:9,fcf:5.0,dy:4.5,po:60,roe:17,roic:15,gm:18,om:12,nm:11,rg:2,eg:-3,fg:3,de:0.15,cr:2.6,ic:60,z:4.8,mo:-5,b:0.7,f:"110110100"},
{t:"PLX",n:"Petrolimex",m:"VN",ex:"HOSE",s:"energy",cap:45,pe:18,pb:1.7,ev:8,fcf:4.0,dy:4.0,po:70,roe:9,roic:7,gm:6,om:1.5,nm:1,rg:0,eg:-5,fg:10,de:0.6,cr:1.2,ic:4,z:3.0,mo:0,b:0.9,f:"110100100"},
{t:"SAB",n:"Sabeco",m:"VN",ex:"HOSE",s:"staple",cap:64,pe:15,pb:3.0,ev:11,fcf:6.0,dy:7.0,po:95,roe:20,roic:19,gm:32,om:16,nm:14,rg:-3,eg:-5,fg:2,de:0.02,cr:3.5,ic:100,z:5.0,mo:-20,b:0.5,f:"110110110"},
{t:"REE",n:"REE Corp",m:"VN",ex:"HOSE",s:"util",cap:33,pe:14,pb:1.5,ev:10,fcf:4.0,dy:1.5,po:15,roe:11,roic:8,gm:38,om:32,nm:26,rg:6,eg:5,fg:10,de:0.6,cr:1.8,ic:6,z:2.6,mo:10,b:0.75,f:"111110100"},
{t:"POW",n:"PV Power",m:"VN",ex:"HOSE",s:"util",cap:32,pe:25,pb:1.1,ev:10,fcf:-3,dy:0,po:0,roe:4.5,roic:4,gm:12,om:8,nm:5,rg:5,eg:-10,fg:20,de:0.5,cr:1.5,ic:4,z:1.7,mo:15,b:0.9,f:"110000101"},
{t:"DGC",n:"Hóa chất Đức Giang",m:"VN",ex:"HOSE",s:"mat",cap:40,pe:13,pb:2.7,ev:7,fcf:5.0,dy:3.0,po:35,roe:21,roic:20,gm:33,om:32,nm:32,rg:-10,eg:-15,fg:8,de:0.05,cr:8,ic:100,z:9.5,mo:-15,b:1.2,f:"110111000"},
{t:"BMP",n:"Nhựa Bình Minh",m:"VN",ex:"HOSE",s:"mat",cap:12,pe:11,pb:3.5,ev:7,fcf:9.0,dy:8.0,po:95,roe:34,roic:33,gm:43,om:26,nm:21,rg:2,eg:20,fg:3,de:0.01,cr:5,ic:200,z:8.0,mo:20,b:0.6,f:"111111110"},
{t:"PNJ",n:"Vàng bạc Phú Nhuận",m:"VN",ex:"HOSE",s:"cons",cap:32,pe:15,pb:2.8,ev:10,fcf:3.0,dy:2.5,po:30,roe:19,roic:16,gm:18,om:7,nm:5.5,rg:14,eg:12,fg:10,de:0.4,cr:2.0,ic:15,z:5.5,mo:0,b:0.9,f:"111110111"},
{t:"GMD",n:"Gemadept",m:"VN",ex:"HOSE",s:"ind",cap:28,pe:15,pb:2.0,ev:10,fcf:2.0,dy:2.0,po:30,roe:13,roic:11,gm:45,om:35,nm:28,rg:15,eg:10,fg:12,de:0.3,cr:1.5,ic:15,z:3.3,mo:15,b:0.9,f:"111011101"},
{t:"DHG",n:"Dược Hậu Giang",m:"VN",ex:"HOSE",s:"health",cap:14,pe:16,pb:3.0,ev:12,fcf:5.0,dy:3.5,po:50,roe:20,roic:19,gm:47,om:22,nm:19,rg:6,eg:5,fg:6,de:0.05,cr:3.5,ic:100,z:7.0,mo:0,b:0.4,f:"111111100"},
{t:"KDH",n:"Nhà Khang Điền",m:"VN",ex:"HOSE",s:"re",cap:30,pe:30,pb:1.6,ev:25,fcf:-2,dy:0,po:0,roe:5,roic:4,gm:45,om:30,nm:22,rg:-5,eg:-10,fg:20,de:0.3,cr:3.0,ic:5,z:2.2,mo:0,b:1.2,f:"100101000"},
{t:"SSI",n:"Chứng khoán SSI",m:"VN",ex:"HOSE",s:"broker",cap:70,pe:18,pb:2.0,ev:null,fcf:null,dy:2.5,po:45,roe:11,roic:7,gm:55,om:45,nm:38,rg:10,eg:15,fg:25,de:1.5,cr:1.4,ic:6,z:null,mo:40,b:1.5,f:"111010111"}
];

/* Bản đồ học thuật: thẻ kiến thức + flashcard */
const QUIZ = [
 {q:"P/E = 20 tương ứng tỷ suất lợi nhuận (earnings yield) bao nhiêu?", a:["5%","20%","2%","0,5%"], c:0, e:"Earnings yield = 1 / P/E = 1/20 = 5%. So sánh trực tiếp được với lãi suất trái phiếu."},
 {q:"ROE = Biên lợi nhuận ròng × Vòng quay tài sản × ? (DuPont)", a:["Đòn bẩy tài chính (Tài sản/Vốn CSH)","Tỷ lệ chi trả cổ tức","Hệ số beta","Tỷ suất FCF"], c:0, e:"DuPont 3 bước: ROE = NM × AT × EM, với EM = Tổng tài sản / Vốn chủ sở hữu."},
 {q:"Doanh nghiệp tạo ra giá trị cho cổ đông khi nào?", a:["ROIC > WACC","ROE > lạm phát","P/E < 15","Doanh thu tăng"], c:0, e:"Chỉ khi lợi nhuận trên vốn đầu tư vượt chi phí vốn bình quân, mỗi đồng tái đầu tư mới làm tăng giá trị."},
 {q:"Altman Z-Score dưới bao nhiêu được xem là vùng nguy hiểm?", a:["1,81","3,0","5,0","0,5"], c:0, e:"Mô hình gốc: Z > 2,99 an toàn; 1,81–2,99 vùng xám; < 1,81 vùng nguy hiểm (doanh nghiệp sản xuất niêm yết)."},
 {q:"Một cổ phiếu giảm 50%, cần tăng bao nhiêu để về lại giá cũ?", a:["100%","50%","75%","150%"], c:0, e:"Phục hồi cần = 1/(1−mức giảm) − 1 = 1/0,5 − 1 = 100%. Đây là lý do cắt lỗ sớm quan trọng."},
 {q:"PEG = 0,8 thường được hiểu là gì theo Peter Lynch?", a:["Có thể đang rẻ so với tốc độ tăng trưởng","Chắc chắn đắt","Doanh nghiệp lỗ","Cổ tức cao"], c:0, e:"PEG = P/E ÷ tăng trưởng EPS (%). PEG < 1 gợi ý giá chưa phản ánh hết tăng trưởng."},
 {q:"Biên độ dao động giá trong ngày trên sàn HOSE là bao nhiêu?", a:["±7%","±10%","±15%","Không giới hạn"], c:0, e:"HOSE ±7%, HNX ±10%, UPCoM ±15% so với giá tham chiếu. Thị trường Mỹ không có biên độ ngày nhưng có cơ chế ngắt mạch."},
 {q:"Trên bảng điện Việt Nam, màu tím biểu thị điều gì?", a:["Giá trần","Giá sàn","Giá tham chiếu","Khớp lệnh lớn"], c:0, e:"Tím = trần, xanh lam (cyan) = sàn, vàng = tham chiếu, xanh lá = tăng, đỏ = giảm."},
 {q:"Piotroski F-Score gồm bao nhiêu phép thử nhị phân?", a:["9","5","7","12"], c:0, e:"9 phép thử chia 3 nhóm: khả năng sinh lời (4), đòn bẩy/thanh khoản/nguồn vốn (3), hiệu quả hoạt động (2)."},
 {q:"Theo Quy tắc 72, lợi nhuận 12%/năm nhân đôi vốn sau khoảng bao lâu?", a:["6 năm","12 năm","8 năm","4 năm"], c:0, e:"72 / 12 = 6 năm. Một phép nhẩm nhanh cho sức mạnh lãi kép."},
 {q:"Beta = 1,5 nghĩa là gì?", a:["Cổ phiếu biến động mạnh hơn thị trường khoảng 50%","Lợi nhuận kỳ vọng 1,5%","P/E gấp 1,5 lần ngành","Rủi ro phá sản thấp"], c:0, e:"Beta đo độ nhạy với thị trường chung (rủi ro hệ thống). Thị trường ±10% → cổ phiếu trung bình ±15%."},
 {q:"Đa dạng hóa loại bỏ được loại rủi ro nào?", a:["Rủi ro riêng lẻ (phi hệ thống)","Rủi ro thị trường","Rủi ro lãi suất","Rủi ro lạm phát"], c:0, e:"Khoảng 20–30 cổ phiếu ít tương quan loại bỏ phần lớn rủi ro riêng; rủi ro hệ thống vẫn còn."},
 {q:"Công thức Magic Formula của Greenblatt xếp hạng theo cặp chỉ số nào?", a:["Earnings yield và ROIC","P/B và cổ tức","Doanh thu và EPS","Beta và động lượng"], c:0, e:"Mua doanh nghiệp tốt (ROIC cao) với giá rẻ (EBIT/EV cao), xếp hạng tổng hợp hai thứ hạng."},
 {q:"P/B hợp lý của ngân hàng tăng lên khi nào (mô hình Gordon)?", a:["ROE tăng hoặc chi phí vốn giảm","NPL tăng","CASA giảm","Tăng phát hành cổ phiếu"], c:0, e:"P/B hợp lý ≈ (ROE − g) / (r − g). ROE càng vượt chi phí vốn r, P/B xứng đáng càng cao."},
 {q:"Thị trường Mỹ thanh toán giao dịch cổ phiếu theo chu kỳ nào (từ 5/2024)?", a:["T+1","T+2","T+3","T+0"], c:0, e:"SEC chuyển sang T+1 từ 28/5/2024. Việt Nam hiện áp dụng T+2 (tiền và chứng khoán về ngày T+2, chiều)."},
 {q:"Kelly Criterion với xác suất thắng 55%, tỷ lệ lời/lỗ 1:1 cho tỷ trọng tối đa?", a:["10%","55%","5%","25%"], c:0, e:"f* = p − (1−p)/b = 0,55 − 0,45/1 = 10%. Thực tế nên dùng 1/2 Kelly để giảm dao động."},
 {q:"Hiệu ứng mỏ neo (anchoring) là gì?", a:["Bám vào một con số ban đầu như giá mua","Bán cổ phiếu lời quá sớm","Làm theo đám đông","Tự tin quá mức"], c:0, e:"Nhà đầu tư neo vào giá mua hoặc đỉnh cũ thay vì đánh giá lại giá trị hiện tại."},
 {q:"FCF (dòng tiền tự do) được tính gần đúng là?", a:["Dòng tiền HĐKD − Chi đầu tư TSCĐ (capex)","Lợi nhuận ròng + cổ tức","Doanh thu − giá vốn","EBITDA − thuế"], c:0, e:"FCF là tiền thực sự còn lại để trả nợ, chia cổ tức, mua lại cổ phiếu hoặc tái đầu tư."},
 {q:"Giới hạn sở hữu nước ngoài (FOL) phổ biến với ngân hàng Việt Nam?", a:["30%","49%","100%","10%"], c:0, e:"Ngân hàng thương mại: tối đa 30%; nhiều ngành khác 49%; một số ngành có thể mở 100%."},
 {q:"Số Graham (Graham Number) được tính bằng?", a:["√(22,5 × EPS × BVPS)","EPS × (8,5 + 2g)","P/E × P/B","FCF / WACC"], c:0, e:"22,5 = 15 (P/E tối đa) × 1,5 (P/B tối đa). Giá dưới số Graham là tín hiệu rẻ theo tiêu chuẩn phòng thủ."}
];
