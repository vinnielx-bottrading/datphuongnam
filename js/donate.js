// ===== Ủng hộ phát triển game: mã VietQR theo số tiền chọn =====
// Mã QR tạo ngay trên máy theo chuẩn VietQR (NAPAS), không gửi dữ liệu đi đâu.
(function () {
  const E = window.DPN;
  const BANK = { bin: '970436', name: 'Vietcombank', acc: '0111000182684', holder: 'NGUYEN HOANG VINH', note: 'UNG HO DAT PHUONG NAM' };
  const AMOUNTS = [50000, 100000, 200000, 1000000];
  const vnd = n => n.toLocaleString('vi-VN') + 'đ';
  const label = n => n >= 1e6 ? n / 1e6 + ' triệu' : n / 1000 + 'k';

  // ---------- chuỗi VietQR (EMVCo) ----------
  const f = (id, v) => id + String(v.length).padStart(2, '0') + v;
  function crc16(s) {
    let c = 0xFFFF;
    for (let i = 0; i < s.length; i++) {
      c ^= s.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) c = c & 0x8000 ? (c << 1) ^ 0x1021 : c << 1;
      c &= 0xFFFF;
    }
    return c.toString(16).toUpperCase().padStart(4, '0');
  }
  function payload(amount) {
    const acct = f('00', 'A000000727') + f('01', f('00', BANK.bin) + f('01', BANK.acc)) + f('02', 'QRIBFTTA');
    let s = f('00', '01') + f('01', amount ? '12' : '11') + f('38', acct) + f('53', '704');
    if (amount) s += f('54', String(amount));
    s += f('58', 'VN');
    if (amount) s += f('62', f('08', BANK.note));
    s += '6304';
    return s + crc16(s);
  }
  function qrSvg(text) {
    const q = window.qrcode(0, 'M'); q.addData(text); q.make();
    return q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
  }

  // ---------- khung ủng hộ (dùng ở màn hình Ủng hộ và màn thắng) ----------
  function mount(box, compact) {
    box.classList.add('donate'); if (compact) box.classList.add('compact');
    box.innerHTML = `
      <p class="kicker">Ủng hộ phát triển game</p>
      ${compact ? '<h3>Tiếp sức cho Nam</h3>' : '<h2>Tiếp sức cho Đất Phương Nam</h2>'}
      <p class="d-lead">Mỗi phần ủng hộ giúp làm thêm cửa mới, hình vẽ và âm thanh cho hành trình của Nam.</p>
      <div class="d-body">
        <div class="d-pick">
          <div class="chips" role="radiogroup" aria-label="Chọn số tiền">
            ${AMOUNTS.map(a => `<button type="button" role="radio" data-amt="${a}">${label(a)}</button>`).join('')}
            <button type="button" role="radio" data-amt="custom">Tùy ý</button>
          </div>
          <label class="d-custom" hidden>Số tiền (đồng)
            <input type="text" inputmode="numeric" autocomplete="off" placeholder="Ví dụ 30.000"></label>
          <ul class="d-info">
            <li><span>Ngân hàng</span><b>${BANK.name}</b></li>
            <li><span>Số TK</span><b>${BANK.acc}</b> <button type="button" class="copy" aria-label="Chép số tài khoản">Chép</button></li>
            <li><span>Chủ TK</span><b>${BANK.holder}</b></li>
            <li><span>Nội dung</span><b>${BANK.note}</b></li>
          </ul>
        </div>
        <figure class="d-qr"><div class="qr"></div><figcaption></figcaption></figure>
      </div>`;
    const chips = [...box.querySelectorAll('.chips button')], custom = box.querySelector('.d-custom'), input = custom.querySelector('input');
    const qr = box.querySelector('.qr'), cap = box.querySelector('figcaption');
    function render(amount) {
      qr.innerHTML = qrSvg(payload(amount));
      cap.textContent = amount ? `Quét bằng app ngân hàng · ${vnd(amount)}` : 'Quét bằng app ngân hàng · tự nhập số tiền';
    }
    function pick(v) {
      for (const c of chips) c.setAttribute('aria-checked', String(c.dataset.amt === String(v)));
      custom.hidden = v !== 'custom';
      if (v === 'custom') { readCustom(); setTimeout(() => input.focus(), 0); } else render(+v);
    }
    function readCustom() {
      const n = parseInt(input.value.replace(/\D/g, ''), 10) || 0;
      if (n) input.value = n.toLocaleString('vi-VN');
      render(n >= 1000 ? n : 0);
    }
    chips.forEach(c => c.onclick = () => pick(c.dataset.amt));
    input.oninput = readCustom;
    box.querySelector('.copy').onclick = e => {
      const b = e.currentTarget;
      const done = () => { b.textContent = 'Đã chép'; setTimeout(() => b.textContent = 'Chép', 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(BANK.acc).then(done, () => { }); 
    };
    pick(AMOUNTS[0]);
  }

  E.donate = { mount, payload };
  document.querySelectorAll('[data-donate]').forEach(el => mount(el, el.dataset.donate === 'compact'));
})();
