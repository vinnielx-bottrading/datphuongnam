// ===== Tập 1 – Cửa 1: Bãi sông (làm quen: chạy, nhảy, bùn lún, đỉa, cá sấu) =====
// Mọi toạ độ tính bằng pixel thế giới; mặt đất y = 590. Màn rộng 7100 px.
window.DPN_LEVELS = window.DPN_LEVELS || {};
window.DPN_LEVELS['t1c1'] = {
  id: 't1c1',
  title: 'Tập 1 · Cửa 1',
  name: 'Bãi sông',
  width: 7100,
  groundY: 590,
  start: { x: 140 },
  theme: { far: 'baisong_far', mid: 'baisong_mid', fg: 'baisong_fg2', waterImg: 'baisong_water', water: ['#6E9F95', '#4A7A72', '#2C4F4C'], midBottom: 484 },

  // Đoạn đất liền [x đầu, x cuối] – chỗ trống giữa các đoạn là sông
  ground: [[0, 1400], [1560, 2900], [3900, 5400], [5600, 7100]],

  // Bệ nổi bằng đất: x giữa, y mặt trên
  platforms: [[930, 470], [1160, 400], [4560, 450], [4800, 380], [6620, 460]],

  // Khúc gỗ trôi trên sông (x giữa)
  logs: [3080, 3380, 3680],

  // Cá sấu canh khúc sông rộng [x đầu, x cuối]
  crocs: [[2920, 3880]],

  // Vùng bùn lún [x đầu, x cuối]
  mud: [[1880, 2200], [4990, 5290], [6100, 6400]],

  // Đỉa bò tuần tra [x đầu, x cuối]
  leeches: [[2380, 2760], [4250, 4520], [4700, 4950], [5750, 6000], [6420, 6560]],

  items: [
    ['rice', 420, 520], ['rice', 520, 490], ['rice', 620, 520],
    ['rice', 930, 420], ['rice', 1160, 350], ['rice', 1480, 470],
    ['rice', 2020, 520], ['rice', 2600, 500],
    ['gourd', 3380, 420], ['rice', 3080, 470], ['rice', 3680, 470],
    ['rice', 4560, 400], ['rice', 4800, 330], ['rice', 5100, 520], ['rice', 5500, 470],
    ['gourd', 6240, 470], ['rice', 6620, 410], ['rice', 6700, 520]
  ],

  checkpoints: [2250, 4020, 5700],

  // Biển hướng dẫn: hiện khi Nam đi ngang qua
  signs: [
    [180, 'Dùng ← → (hoặc A D) để chạy'],
    [640, 'Nhấn Space / ↑ để nhảy – giữ lâu thì nhảy cao hơn'],
    [1260, 'Nhảy qua lạch nước – rơi xuống sông là mất sức'],
    [1760, 'Bùn sẫm và bóng là bùn lún: chạy chậm lại, đứng lâu sẽ bị kéo xuống'],
    [2290, 'Đỉa ngóc đầu (dấu !) là sắp lao tới – nhảy lên đầu nó để hạ'],
    [2780, 'Sông có cá sấu: bong bóng nổi lên là nó sắp lao lên. Nhảy qua gỗ trôi, đừng đứng yên!'],
    [5780, 'Ổ trứng cá sấu – khu vực nguy hiểm, đi nhanh'],
    [6760, 'Chòi canh – điểm đến của cửa này']
  ],

  props: [['trace_leech', 2440, 0.42, 58], ['trace_croc', 2840, 0.42, 58], ['prop_crocnest2', 5880, 0.5, 44], ['trace_mosquito', 6560, 0.4, 56]],
  goal: 6900
};
