# La Bàn Cổ Phiếu

Ứng dụng học và phân tích cổ phiếu Mỹ + Việt Nam, song ngữ Việt / Anh (chọn trong Cài đặt), tối ưu cho iPhone.

- ~500 mã S&P 500, ~500 mã HOSE/HNX, ~200 ETF Mỹ (theo dõi theo cặp đối xứng)
- Bộ lọc, chấm điểm, biểu đồ nến, mô hình giá, quyền chọn
- Lộ trình học 10 cấp (101 bài có infographic, 121 câu hỏi), máy tính tích sản, bài thực hành đọc BCTC

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `src/` | Mã nguồn chia phần (HTML, CSS, JS), bản tiếng Việt là bản gốc |
| `src/en/` | Bản tiếng Anh: cùng mã, chỉ khác nội dung chuỗi |
| `i18n/` | Quy ước dịch và `tokcmp.js` kiểm tra bản Anh khớp cấu trúc mã với bản Việt (`npm i acorn`) |
| `build.sh` | Ghép `src/` thành `la-ban-co-phieu.html` (bản đăng lên Claude) và `index.html` (bản GitHub Pages) |
| `pipeline/` | Tập lệnh tạo danh sách mã và cập nhật dữ liệu hằng ngày |
| `tests/` | Kiểm thử logic (Node) và kiểm thử giao diện (Playwright) |

## Build

```sh
./build.sh
```

## Ngôn ngữ

Trang chứa cả hai bản; ngôn ngữ chọn trong Cài đặt được lưu vào `localStorage` (`labanCoPhieu.lang`) và trang tải lại. Sửa bản Việt thì sửa cùng chỗ trong `src/en/` rồi chạy `node i18n/tokcmp.js src/X.js src/en/X.js`.

## Kiểm thử

```sh
cd src && for t in test test2 test3; do node ../tests/$t.js; done
cd src/en && for t in test test2 test3; do node ../../tests/$t.js; done
```

Kiểm thử giao diện (cần Playwright + Chromium), dùng dữ liệu mẫu trong `tests/fixtures/`:

```sh
python3 tests/e2e5.py iphone && LB_LANG=en python3 tests/e2e5.py iphone
python3 tests/e2e6.py && LB_LANG=en python3 tests/e2e6.py
```

## Dữ liệu

Chỉ số cơ bản được nhúng sẵn trong `src/3c_universe.js` (nguồn: stockanalysis.com). Giá cập nhật hằng ngày và lịch sử nến được tác vụ hẹn giờ ghi vào cơ sở dữ liệu của bản trên Claude, rồi đẩy một bản sao lên nhánh `data` của repo này (nhánh chỉ giữ một commit, bị ghi đè mỗi ngày). Bản GitHub Pages đọc nhánh đó qua `raw.githubusercontent.com`; nếu không đọc được thì dùng dữ liệu nhúng.

## SEO

`index.html` có mô tả, Open Graph (`og.png`), JSON-LD `WebApplication`; kèm `robots.txt`, `sitemap.xml`, `llms.txt`.

Ứng dụng phục vụ học tập và nghiên cứu, không phải lời khuyên đầu tư.
