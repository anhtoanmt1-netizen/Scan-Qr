/* ============================================================
   SPX Express – Cấu hình đồng bộ DATA toàn hệ thống
   ------------------------------------------------------------
   Để DATA cập nhật (bằng link Google Sheet hoặc file) áp dụng cho
   TẤT CẢ người dùng, cần 1 nơi lưu dùng chung. App dùng Firebase
   Realtime Database (miễn phí). Cách bật:

   1) Vào https://console.firebase.google.com → Add project (tạo dự án).
   2) Menu Build → Realtime Database → Create database
      (chọn vị trí gần nhất, ví dụ Singapore) → Start in LOCKED mode.
   3) Tab "Rules" → dán đoạn dưới đây rồi bấm Publish
      (mật khẩu cập nhật được kiểm tra ngay trên máy chủ):

      {
        "rules": {
          "spx": {
            "meta": { ".read": true },
            "data": { ".read": true },
            ".write": "newData.child('pw').val() === '111291'"
          }
        }
      }

   4) Tab "Data": sao chép địa chỉ ở đầu trang, dạng
      https://TEN-DU-AN-default-rtdb.asia-southeast1.firebasedatabase.app
      rồi dán vào SYNC_URL bên dưới (không có dấu / ở cuối).

   Để trống SYNC_URL = DATA chỉ áp dụng trên máy đã cập nhật.
   ============================================================ */
window.SPX_CONFIG = {
  SYNC_URL: ''
};
