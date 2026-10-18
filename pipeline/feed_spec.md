## Lấy dữ liệu giá — chỉ dùng công cụ WebFetch (shell không ra được Internet). Không bao giờ đoán hay nội suy số.

### Lịch sử giá (nến ngày) — nguồn chính cho giá
- Mỹ: `https://stockanalysis.com/stocks/<ticker viết thường>/history/` (BRK.B → `brk.b`).
  Prompt: "Output every daily row of the price history table as a compact CSV line: date(yyyy-mm-dd),open,high,low,close,volume. No header, no commentary. Then on a final line write ROWS=<count>."
- Việt Nam: CafeF, lấy THEO KHOẢNG NGÀY (URL có ngày cụ thể luôn trả dữ liệu mới; URL không có ngày hay bị bản cũ):
  `https://cafef.vn/du-lieu/Ajax/PageNew/DataHistory/PriceHistory.ashx?Symbol=<TICKER>&StartDate=<mm/dd/yyyy>&EndDate=<mm/dd/yyyy>&PageIndex=1&PageSize=30`
  Mỗi khoảng tối đa 38 ngày lịch để không quá 30 phiên. Prompt: "Output every row as a compact CSV line: date(yyyy-mm-dd),open,high,low,close,adjusted_close,volume — using GiaMoCua, GiaCaoNhat, GiaThapNhat, GiaDongCua, GiaDieuChinh and KhoiLuongKhopLenh exactly as given. No header, no commentary. Final line: ROWS=<count>."
  Giá CafeF theo nghìn đồng → nhân 1000. Điều chỉnh cổ tức/chia tách: với mỗi dòng, k = adjusted_close ÷ close; ghi bar = [ngày, mở×k, cao×k, thấp×k, adjusted_close, khối lượng] (đều ×1000). Nếu thiếu adjusted_close thì k = 1.
- Chỉ số: IDX.VNINDEX dùng CafeF với Symbol=VNINDEX, IDX.VN30 thử Symbol=VN30 rồi VN30INDEX (KHÔNG nhân 1000, không điều chỉnh). Bỏ dòng có giá trị vô lý (0, cao < thấp, lệch > 15% so với phiên kề) — để null trường đó. IDX.SPX `https://stockanalysis.com/indexes/spx/history/`, IDX.IXIC `https://stockanalysis.com/indexes/ixic/history/` (hoặc `/indexes/comp/history/`), IDX.DJI `https://stockanalysis.com/indexes/dji/history/` (hoặc `/indexes/djia/history/`). Nếu trang chỉ số không có, bỏ qua và ghi vào failed.

### Chỉ số cơ bản (chỉ cổ phiếu)
- Mỹ: `https://stockanalysis.com/stocks/<ticker viết thường>/` — prompt: "Extract ONLY values literally shown: market cap, PE ratio, dividend yield, 52-week range low/high, and the date of the quote. NA if not shown. JSON only."
- Việt Nam: `https://24hmoney.vn/stock/<TICKER>?d=<yyyymmdd hôm nay>` (tham số ?d= bắt buộc để tránh bản cũ) — prompt: "Extract ONLY values literally shown: price, P/E, P/B, market cap, date. NA if not shown. JSON only." Chỉ dùng P/E, P/B, vốn hóa nếu price × 1000 trùng giá đóng cửa phiên mới nhất từ CafeF (sai lệch ≤ 0,5%); nếu không, để null.

### Tệp kết quả cho mỗi mã: /home/claude/labans/feed/<t>.json (dùng Write)
{"t":"AAPL","m":"US","bars":[["2026-08-07",311.45,314.81,310.74,313.33,34437191], …],"pe":33.1,"pb":null,"dy":0.42,"cap":5120,"w52l":200.1,"w52h":350.2,"src":"stockanalysis.com","fund_src":"stockanalysis.com"}
- bars sắp xếp ngày tăng dần, mỗi phần tử [ngày, mở, cao, thấp, đóng, khối lượng]; Việt Nam đã nhân 1000 (trừ chỉ số).
- pe, dy là số thường (dy = phần trăm: 0.42 = 0,42%); cap: Mỹ = tỷ USD (3.93T → 3930; 615.87B → 615.87); Việt Nam = nghìn tỷ đồng (475,438 tỷ → 475.4; 108.50T → 108.5). Thiếu thì null. P/E < 0.5 hoặc > 2000 → null.
- Chỉ số: t = "IDX.SPX", "IDX.IXIC", "IDX.DJI", "IDX.VNINDEX", "IDX.VN30", m = "US"/"VN", không có trường cơ bản.
