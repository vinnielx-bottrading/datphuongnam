// ===== Tập 1 – Cửa 1: Bãi sông =====
// Cửa làm quen, dài ~2–3 phút, chia 4 đoạn:
//   1. Làm quen (0–4200)        chạy, nhảy, bùn, đỉa – từng thứ một, chỗ an toàn
//   2. Kết hợp (4380–9000)      bùn cạnh đỉa, đường trên né bùn, khúc gỗ trôi đầu tiên (chưa có cá sấu)
//   3. Thử thách (9000–14200)   2 khúc sông có cá sấu, đọc bong bóng, nhiều gỗ trôi
//   4. Về đích (14380–17000)    đoạn nghỉ, cơm nắm thưởng, chòi canh
// Mặt đất y = 590. Nam nhảy cao tối đa ~160px, xa ~250px. Bệ rộng 210px.
// 3 mảnh nhật ký giấu ở đường trên / chỗ mạo hiểm.
window.DPN_LEVELS = window.DPN_LEVELS || {};
window.DPN_LEVELS['t1c1'] = {
  id: 't1c1',
  title: 'Tập 1 · Cửa 1',
  name: 'Bãi sông',
  width: 17000,
  groundY: 590,
  start: { x: 140 },
  par: 150,               // giây – qua cửa trong thời gian này được 1 sao
  ambience: 'day',
  theme: { far: 'baisong_far', mid: 'baisong_mid', fg: 'baisong_fg2', waterImg: 'baisong_water', water: ['#6E9F95', '#4A7A72', '#2C4F4C'], midBottom: 484 },

  // Đoạn đất liền [x đầu, x cuối] – chỗ trống giữa các đoạn là sông/lạch
  ground: [[0, 1400], [1560, 4200], [4380, 6300], [7100, 9000], [10200, 11000], [12800, 14200], [14380, 17000]],

  // Bệ nổi: [x giữa, y mặt trên]
  platforms: [
    // đoạn 1: bậc thang làm quen + lối lên mảnh nhật ký 1
    [930, 470], [1160, 400], [1390, 290],
    [3330, 470], [3570, 400],
    // đoạn 2: đường trên né bùn dài
    [4870, 460], [5220, 460], [5470, 360], [5720, 300], [5980, 400],
    [8450, 460], [8700, 470], [8930, 370], [9160, 280],
    // đoạn 3: bệ mạo hiểm trên sông B (mảnh nhật ký 3)
    [12040, 480], [12290, 360],
    // đoạn 4: cầu vồng cơm nắm
    [15000, 470], [15260, 400], [15520, 470]
  ],

  // Khúc gỗ trôi (x giữa) – mặt gỗ thấp hơn mặt đất ~28px
  logs: [6550, 6850, 9250, 9580, 9910, 11240, 11560, 11880, 12200, 12520],

  // Cá sấu canh khúc sông [x đầu, x cuối]
  crocs: [[9000, 10200], [11000, 11900], [11900, 12800]],

  // Bùn lún [x đầu, x cuối]
  mud: [[1880, 2200], [3000, 3220], [4700, 5050], [5420, 5820], [7800, 8150], [13500, 13800]],

  // Đỉa [x đầu, x cuối]
  leeches: [[2450, 2800], [3700, 4000], [5100, 5350], [6000, 6250], [7400, 7650], [8300, 8600], [10600, 10900], [13900, 14150], [15700, 15950]],

  items: [
    // đoạn 1
    ['rice', 420, 520], ['rice', 520, 490], ['rice', 620, 520],
    ['rice', 930, 420], ['rice', 1160, 350], ['page', 1390, 235],
    ['rice', 1480, 470], ['rice', 2040, 500], ['rice', 2620, 520],
    ['rice', 3110, 500], ['rice', 3330, 420], ['rice', 3570, 350], ['gourd', 4100, 520],
    // đoạn 2
    ['rice', 4290, 470], ['rice', 4870, 410], ['rice', 5220, 410], ['rice', 5470, 310], ['rice', 5720, 250], ['rice', 5980, 350],
    ['rice', 6550, 520], ['rice', 6850, 520], ['gourd', 7300, 520],
    ['rice', 7520, 500], ['rice', 7975, 500], ['rice', 8450, 410], ['rice', 8700, 420], ['rice', 8930, 320], ['page', 9160, 225],
    // đoạn 3
    ['rice', 9250, 520], ['rice', 9580, 520], ['rice', 9910, 520], ['gourd', 10450, 520], ['rice', 10750, 500],
    ['rice', 11240, 520], ['rice', 11560, 520], ['rice', 11880, 520], ['rice', 12040, 430], ['page', 12290, 305], ['rice', 12520, 520],
    ['rice', 13100, 520], ['rice', 13650, 500], ['rice', 14030, 500], ['gourd', 14290, 470],
    // đoạn 4
    ['rice', 15000, 420], ['rice', 15130, 380], ['rice', 15260, 350], ['rice', 15390, 380], ['rice', 15520, 420],
    ['rice', 16100, 520], ['rice', 16250, 520], ['rice', 16400, 520]
  ],

  checkpoints: [2300, 4500, 7250, 10350, 12950, 14550],

  // Biển hướng dẫn
  signs: [
    [180, 'Dùng ← → (hoặc A D) để chạy'],
    [640, 'Nhấn Space / ↑ để nhảy – giữ lâu thì nhảy cao hơn'],
    [1150, 'Thấy quyển sổ phát sáng trên cao? Đó là mảnh nhật ký – cả cửa có 3 mảnh. Cẩn thận lạch nước phía trước!'],
    [1760, 'Bùn sẫm và bóng là bùn lún: chạy chậm lại, đứng lâu sẽ bị kéo xuống'],
    [2380, 'Đỉa ngóc đầu (dấu !) là sắp lao tới – nhảy lên đầu nó để hạ'],
    [4640, 'Bùn dài phía trước: đi đường trên bệ đất cho nhanh, hoặc lội nhanh qua'],
    [6200, 'Khúc gỗ trôi nhấp nhô – canh nhịp rồi nhảy'],
    [8250, 'Ai dám leo lên cao? Phía trên mặt sông có thứ gì đó…'],
    [8790, 'Sông có cá sấu: bong bóng nổi lên là nó sắp lao lên. Nhảy đi ngay, đừng đứng yên!'],
    [10900, 'Khúc sông dài, hai con cá sấu. Hít một hơi rồi đi!'],
    [13250, 'Ổ trứng cá sấu – khu vực nguy hiểm, đi nhanh'],
    [14620, 'Gần tới chòi canh rồi. Nhặt cơm nắm lấy sức!'],
    [16450, 'Chòi canh – điểm đến của cửa này']
  ],

  props: [
    ['trace_leech', 2520, 0.42, 58], ['trace_mosquito', 3800, 0.4, 56], ['trace_croc', 8880, 0.42, 58],
    ['prop_crocnest2', 13300, 0.5, 44], ['trace_croc', 14100, 0.42, 58], ['trace_leech', 15800, 0.42, 58]
  ],

  // Nội dung 3 mảnh nhật ký (mở trong mục Nhật ký)
  journal: [
    'Ghe cập bãi sông lúc trời vừa sáng. Cha bảo: đất này chưa ai cày, mình là người đầu tiên. Con nghe tiếng chim lạ, thấy cả dấu chân thú trên bùn.',
    'Mẹ dặn đừng lội chỗ bùn sẫm màu, bùn ở đây ăn chân người. Con học cách nhảy lên bệ đất cao, nhìn xuống thấy cả con lạch uốn quanh như sợi chỉ bạc.',
    'Hôm nay con thấy bong bóng nổi lên giữa sông rồi một cái mõm to đùng trồi lên. Tim đập thình thịch, nhưng con đã kịp nhảy. Cha cười bảo: sông nào cũng có chúa của nó.'
  ],
  goal: 16700
};
