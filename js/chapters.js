// ===== Cấu trúc Chương (Phase) → Tập → Cửa =====
// Cửa nào có dữ liệu trong window.DPN_LEVELS[id] thì chơi được; chưa có thì hiện "Đang xây dựng".
window.DPN_CHAPTERS = [
  {
    id: 'c1', name: 'Chương 1', title: 'Khai hoang', desc: 'Cùng gia đình mở đất, vượt sông rạch, rừng rậm và thú dữ.',
    open: true,
    taps: [
      { n: 1, name: 'Bãi sông', boss: 'Cá sấu chúa',
        // bản đồ chọn cửa: vị trí 5 điểm dừng theo % ảnh
        map: 'assets/ui/map_tap1.webp', pins: [[15.2, 73.8], [32.9, 51.8], [52.6, 46.8], [64.4, 33.0], [87.5, 26.0]],
        cuas: [
        { id: 't1c1', name: 'Bãi sông', goal: 'Tới chòi canh: làm quen chạy, nhảy, bùn lún, đỉa, gỗ trôi và cá sấu. Có 3 mảnh nhật ký giấu trên cao.' },
        { id: 't1c2', name: 'Bãi bồi bùn lún', goal: 'Vượt dải bùn dài, lót ván qua bùn' },
        { id: 't1c3', name: 'Lội sông', goal: 'Bơi qua nhánh sông, tránh đỉa dưới nước' },
        { id: 't1c4', name: 'Ổ cá sấu lúc hoàng hôn', goal: 'Đi qua bãi trứng, đọc bong bóng báo trước' },
        { id: 't1c5', name: 'Cá sấu chúa', goal: 'Dụ cá sấu chúa lao vào hàng cọc tre', boss: true }
      ] },
      { n: 2, name: 'Rừng rậm', boss: 'Trăn khổng lồ' },
      { n: 3, name: 'Bưng biền', boss: 'Thủy quái bưng biền' },
      { n: 4, name: 'Rừng tràm', boss: 'Hổ chúa' },
      { n: 5, name: 'Đất cao dựng làng', boss: 'Bão giông' },
      { n: 6, name: 'Đồi đất & thác', boss: 'Beo hoang' },
      { n: 7, name: 'Ruộng vườn & sông rạch', boss: 'Đại hồng thủy' },
      { n: 8, name: 'Rừng thiêng', boss: 'Thần Rừng' }
    ]
  },
  {
    id: 'c2', name: 'Chương 2', title: 'Kháng chiến', desc: 'Bảo vệ người dân và quê hương trước cuộc xâm lược.',
    open: false,
    taps: ['Biến cố ập đến xóm làng', 'Vượt đồn canh', 'Cứu người bên kia sông', 'Rừng kháng chiến',
      'Bảo vệ kho lương', 'Bến đò lửa khói', 'Phá vòng vây', 'Đứng lên bảo vệ quê hương'].map((name, i) => ({ n: i + 1, name }))
  },
  {
    id: 'c3', name: 'Chương 3', title: 'Sinh tồn', desc: 'Vượt thiên tai, tránh truy kích, bảo vệ những người còn lại.',
    open: false,
    taps: ['Lũ lụt và truy đuổi', 'Đồn giữa rừng ngập', 'Tuyến sông nguy hiểm', 'Vòng vây trong rừng',
      'Đoàn lương thực trong bão', 'Pháo đài bên dòng nước lớn', 'Rút lui qua vùng thiên tai', 'Hành trình cuối cùng'].map((name, i) => ({ n: i + 1, name }))
  }
];
