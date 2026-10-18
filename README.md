# La Bàn Cổ Phiếu

Ứng dụng học và phân tích cổ phiếu Mỹ + Việt Nam, giao diện tiếng Việt, tối ưu cho iPhone.

- ~500 mã S&P 500, ~500 mã HOSE/HNX, ~200 ETF Mỹ (theo dõi theo cặp đối xứng)
- Bộ lọc, chấm điểm, biểu đồ nến, mô hình giá, quyền chọn
- Lộ trình học 10 cấp (101 bài có infographic, 121 câu hỏi), máy tính tích sản, bài thực hành đọc BCTC

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `src/` | Mã nguồn chia phần (HTML, CSS, JS) |
| `build.sh` | Ghép `src/` thành `la-ban-co-phieu.html` (bản đăng lên Claude) và `index.html` (bản GitHub Pages) |
| `pipeline/` | Tập lệnh tạo danh sách mã và cập nhật dữ liệu hằng ngày |
| `tests/` | Kiểm thử logic (Node) và kiểm thử giao diện (Playwright) |

## Build

```sh
./build.sh
```

## Kiểm thử

```sh
cd src && for t in test test2 test3; do node ../tests/$t.js; done
```

`tests/e2e5.py` và `tests/e2e6.py` dùng đường dẫn tuyệt đối của môi trường phát triển gốc; cần sửa đường dẫn trước khi chạy.

## Dữ liệu

Chỉ số cơ bản được nhúng sẵn trong `src/3c_universe.js` (nguồn: stockanalysis.com). Giá cập nhật hằng ngày và lịch sử nến được lưu trong cơ sở dữ liệu của bản đăng trên Claude, nên **bản GitHub Pages chỉ dùng dữ liệu nhúng**, không có giá mới mỗi ngày.

Ứng dụng phục vụ học tập và nghiên cứu, không phải lời khuyên đầu tư.
