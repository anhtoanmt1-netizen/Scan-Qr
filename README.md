# SPX QR Data Entry PWA

Ứng dụng tĩnh chạy trên GitHub Pages, tối ưu điện thoại.

## Tệp
- `index.html`: giao diện và CSS responsive.
- `app.js`: quét QR, gợi ý Ward, giọng nói, kiểm tra trùng, nhập DATA, xuất/chia sẻ Excel.
- `data.json`: dữ liệu khởi tạo được tạo từ tệp DATA người dùng cung cấp.
- `manifest.json`, `sw.js`, `icon.svg`: cài đặt PWA và cache khung ứng dụng.

## Đưa lên GitHub Pages
1. Tạo repository mới trên GitHub.
2. Upload tất cả tệp ở thư mục này lên root repository.
3. Mở **Settings → Pages**.
4. Trong **Build and deployment**, chọn **Deploy from a branch**.
5. Chọn nhánh `main`, thư mục `/(root)`, bấm **Save**.
6. Chờ GitHub cung cấp URL Pages; mở URL đó bằng Chrome Android hoặc Safari iPhone.
7. Cấp quyền camera/microphone khi trình duyệt hỏi.

## Dùng trên điện thoại
- Android/Chrome: menu ⋮ → Install app hoặc Add to Home screen.
- iPhone/Safari: nút Share → Add to Home Screen.
- Quét QR: nhấn **Quét QR**, cho phép camera, hướng camera sau vào QR.
- Cập nhật DATA: nhấn **↑ DATA**, nhập mật khẩu `111291`, chọn file `.xlsx`/`.xls`/`.csv` có cột Tỉnh, Ward, Deli station, Sort code. File mới được lưu trên trình duyệt hiện tại.
- Hoàn tất: nhấn **Xong · Xuất Excel**.

## Lưu ý quan trọng
- GitHub Pages là hosting tĩnh. Mật khẩu `111291` chỉ là lớp chặn thao tác trên giao diện; không phải bảo mật thực sự vì có thể đọc được trong mã JavaScript. Không dùng mật khẩu này để bảo vệ dữ liệu nhạy cảm. Muốn bảo mật thật sự cần backend xác thực.
- DATA cập nhật được lưu trong localStorage của trình duyệt/thiết bị đó, không tự đồng bộ sang thiết bị khác.
- QR và giọng nói cần quyền camera/microphone. Camera chỉ hoạt động trên HTTPS hoặc localhost. Thư viện quét QR và SheetJS tải từ CDN nên lần đầu cần Internet.
- Nhận dạng giọng nói tiếng Việt phụ thuộc trình duyệt; Chrome Android thường hỗ trợ tốt hơn. Có thể gõ Ward nếu không có SpeechRecognition.
- Service Worker cache tệp ứng dụng và `data.json`; các thư viện CDN bên ngoài có thể cần Internet khi tải lần đầu.
- Tên tỉnh được bỏ tiền tố “Tỉnh” ở đầu và so sánh không dấu/không phân biệt hoa thường khi tìm kiếm. Không tự ý đổi tên địa giới hành chính sang danh mục mới nếu dữ liệu nguồn chưa cập nhật.
