# Translating La Bàn Cổ Phiếu into English

The app is a single-page stock-investing + learning app (US and Vietnam markets) for iPhone. Source is split into
JS fragments in /home/claude/labans/*.js that are concatenated into ONE function scope at build time. The Vietnamese
fragments are the master. You produce an English copy of each assigned file at /home/claude/labans/en/<same name>.

## Hard rules (checked mechanically)

1. ONLY the contents of string literals and template literals may change. Every other token — identifiers, numbers,
   operators, punctuation, `${...}` expressions, regex literals, property names written as identifiers — must stay
   byte-for-byte the same and in the same order. Do not add, remove, or reorder code. Do not add or remove `${}`
   placeholders, and keep them in the same order inside each template literal.
   Comments are ignored by the checker; you may leave them in Vietnamese.
2. Do not change technical strings: ids, CSS classes, data-* values, lesson ids ('l4-bs'), keys, CSS/SVG attribute
   strings, colors, URLs, ticker symbols, event names, selector strings.
3. Translate all user-visible Vietnamese: labels, buttons, headings, notes, aria-labels, titles, toasts, lesson
   text (t, d, f, pts, thr, hook, ex …), quiz questions/options/explanations, SVG infographic text, chart labels,
   persona descriptions, error/empty-state messages.
4. Inline HTML inside strings stays valid HTML; only change the human text between/inside tags and in
   aria-label/title/alt attributes.
5. Run the checker after each pass, and before you finish it must print `OK structure identical`:
       node /home/claude/labans/i18n/tokcmp.js /home/claude/labans/<file> /home/claude/labans/en/<file>
   `STILL-VIETNAMESE` warnings must be zero except for proper names (Vietnamese company names, person names,
   "VN-Index", place names) — those stay as they are. `CHANGED-TECH-STRING` warnings must each be intentional
   (e.g. 'vi-VN' -> 'en-US', 'vi' -> 'en' locale args).

## Strings used as keys across files — translate EXACTLY like this

Lesson groups (field `g`, and the ORDER arrays):
- 'Định giá' -> 'Valuation'
- 'Chất lượng' -> 'Quality'
- 'Phân tích kỹ thuật' -> 'Technical analysis'
- 'Danh mục & rủi ro' -> 'Portfolio & risk'
- 'Hành vi & chu kỳ' -> 'Behavior & cycles'
- 'Thị trường Mỹ & VN' -> 'US & VN markets'
- 'Quyền chọn (Options)' -> 'Options'
- 'ETF' -> 'ETF'
- 'Mở rộng' -> 'Extended'
- 'Nền tảng' -> 'Foundations'

ETF groups (ETF_GROUP_ORDER and data):
Chỉ số Mỹ -> US Index · Phong cách -> Style · Nhân tố -> Factor · Cổ tức -> Dividend · Thu nhập quyền chọn -> Option Income ·
Ngành -> Sector · Chủ đề -> Thematic · Quốc tế -> International · Trái phiếu -> Bonds · Tiền mặt -> Cash ·
Hàng hóa -> Commodities · Bất động sản -> Real Estate · Tiền mã hóa -> Crypto · Biến động -> Volatility ·
Tiền tệ -> Currency · Cổ phiếu đơn -> Single Stock

If you find any other Vietnamese string that is compared (===, !==, case, includes, indexOf, used as an object key or
Set/Map lookup) against a value defined in ANOTHER file, list it in your final report with the translation you used.

## Terminology (be consistent)

- App name "La Bàn Cổ Phiếu" -> "Stock Compass"; "Điểm La Bàn" -> "Compass Score"; "La Bàn" alone -> "Compass".
- Mỹ -> US; Việt Nam / VN -> Vietnam / VN; sàn -> exchange; bảng điện -> price board; phiên -> session.
- BCTC (báo cáo tài chính) -> financial statements; Bảng cân đối kế toán -> balance sheet;
  Báo cáo kết quả kinh doanh -> income statement; Lưu chuyển tiền tệ -> cash flow statement; thuyết minh -> notes.
- LNST -> net income; doanh thu -> revenue; lợi nhuận gộp -> gross profit; biên -> margin; vốn chủ sở hữu -> equity;
  nợ vay -> debt; dòng tiền kinh doanh (CFO) -> operating cash flow (CFO); dòng tiền tự do -> free cash flow;
  phải thu -> receivables; hàng tồn kho -> inventory; cổ tức -> dividend; vốn hóa -> market cap.
- cờ đỏ -> red flag; hạng -> grade; nhân tố -> factor; sàng lọc / bộ lọc -> screener; danh mục theo dõi -> watchlist;
  tích sản -> long-term wealth building (short UI label: "Wealth building"); DCA -> DCA; tái cân bằng -> rebalancing.
- nhà đầu tư -> investor; cổ phiếu -> stock; mã -> ticker / stock (pick naturally); cặp đối xứng -> inverse pair.
- Money units: tỷ (đồng) -> bn (VND); nghìn tỷ -> tn VND; triệu / tr -> M; đ / đồng -> ₫ or VND;
  keep $ and USD as is. Example: '5 tr' -> '5M', '1,2 tỷ' -> '1.2 bn'.
- Number formatting: English uses '.' for decimals and ',' for thousands. Fix hard-coded Vietnamese-formatted
  numbers inside text ('8,5' -> '8.5', '1.000' -> '1,000'). Locale arguments 'vi-VN' -> 'en-US', 'vi' -> 'en'.
- Level names, quiz feedback etc.: plain, friendly, accurate English for a learner; keep the expert tone where present.
- Vietnamese market facts (HOSE ±7% band, T+2, lot sizes, VN-Index, HNX, UPCoM) stay factual — translate, do not
  "Americanize" the facts.

## Length inside SVG infographics

SVG text (helpers like T(x,y,'text',...), sv(...), labels in viewBox 200x125) has fixed positions. Keep English
labels no longer than the Vietnamese (English is usually shorter — good). If a label would be longer, abbreviate.

## Workflow tip

Copy the file first (`cp /home/claude/labans/X.js /home/claude/labans/en/X.js`) and translate in chunks (Edit tool,
or a Python script doing exact replacements), running the checker as you go. Do not touch the Vietnamese master
files or any file other than your assigned en/ files.

## Final report (keep it short)

- File(s) done and the checker's last line for each.
- Any cross-file key strings you found (Vietnamese -> English).
- Anything you were unsure about.
