# Đất Phương Nam – bản chơi thử

Game đi cảnh ngang 2D, HTML5 Canvas, không cần build. Có màn hình chính (Bắt đầu hành trình, Chọn chương, Tiếp tục, Cài đặt, 5 mục phụ) và **Chương 1 · Tập 1 · Cửa 1 – Bãi sông**. Tiến độ lưu trên trình duyệt.

## Chạy thử
- Mở `index.html` bằng Chrome/Edge (bấm đúp là chạy được).
- Hoặc đưa cả thư mục lên GitHub Pages.

## Điều khiển
←/→ hoặc A/D chạy · Space/↑/W nhảy (giữ để nhảy cao) · P/Esc tạm dừng · điện thoại có nút cảm ứng.

## Cấu trúc
```
index.html            khung trang, màn hình bắt đầu/thắng/thua
css/style.css
js/assets-meta.js     kích thước & số khung từng ảnh (tự sinh)
js/engine.js          tải ảnh, vẽ sprite, bàn phím/cảm ứng, hiệu ứng
js/player.js          Nam: chạy, nhảy (coyote + bộ đệm), bùn lún, bị thương
js/entities.js        đỉa, cá sấu, gỗ trôi, vật phẩm, điểm lưu
js/level.js           dựng màn từ dữ liệu, parallax, mặt đất, biển hướng dẫn
js/levels/tap1_cua1.js  dữ liệu Cửa 1 (đất, sông, bùn, đỉa, vật phẩm, biển)
js/chapters.js        cấu trúc Chương → Tập → Cửa (thêm cửa mới ở đây)
js/sfx.js             âm thanh tạo bằng code: hiệu ứng + âm nền (nước, gió, chim, côn trùng)
js/music.js           nhạc nền menu (welcome) và nhạc thắng (victory)
js/menu.js            màn hình chính, chọn chương, cài đặt, lưu tiến độ
js/main.js            vòng lặp, HUD, âm thanh, trạng thái game
assets/ui/            ảnh màn hình chính (tạm dùng A02 + A03 đến khi có DPN_UI_KV_BG)
assets/sprites/*.png  dải khung hoạt ảnh (đã tách nền, chuẩn hóa tỷ lệ)
assets/bg/*.webp      nền, mặt đất, đạo cụ
assets/audio/         welcome.mp3, victory.mp3
```

## Âm thanh
- Nhạc: `welcome` ở màn hình chính và chọn chương; `victory` khi qua cửa, phát tiếp tới lúc vào cửa mới. Lúc chơi không có nhạc.
- Hiệu ứng và âm nền hiện tạo bằng code trong `js/sfx.js` (tạm thời). Khi có file thật theo danh sách nhóm 1S, chỉ cần thay trong `sfx.js`.
- Cài đặt có 2 công tắc: Nhạc nền & âm môi trường, Hiệu ứng âm thanh.
- Mỗi cửa chọn âm nền bằng `ambience: 'day'` hoặc `'dusk'` trong file dữ liệu cửa (mặc định `day`).

## Thêm cửa mới
1. Copy `js/levels/tap1_cua1.js` thành `tap1_cua2.js`, đổi `id` thành `t1c2` và sửa dữ liệu.
2. Thêm `<script src="js/levels/tap1_cua2.js"></script>` vào `index.html` (trước `chapters.js`).
3. Cửa tự hiện trong Chọn chương; mở khóa khi qua cửa trước.

## Nguồn ảnh dùng cho Cửa 1
B14 đứng/ăn mừng · B08 chạy · B07 nhảy · B20 cúi/tiếp đất · B02 trúng đòn · B16 kiệt sức · B21 đi bộ ·
D02–D06 Bãi sông · F04/F05 đỉa · F07/F09 cá sấu · E05 bùn lún · C02 vật phẩm · H02/H05/H09/H10 hiệu ứng.
