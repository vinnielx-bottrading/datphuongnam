// ===== Màn hình chính, Chọn chương, Cài đặt, lưu tiến độ =====
(function () {
  const E = window.DPN;
  const $ = id => document.getElementById(id);
  const KEY = 'dpn-progress-v1';

  // ---------- tiến độ (lưu trên máy người chơi) ----------
  let prog = { done: {}, last: null, sound: true, music: true };
  try { prog = Object.assign(prog, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* trình duyệt chặn lưu: chơi bình thường */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(prog)); } catch (e) { } };
  E.progress = prog;
  E.saveResult = function (id, r) {
    const old = prog.done[id];
    prog.done[id] = { rice: Math.max(r.rice, old ? old.rice : 0), total: r.total, time: old ? Math.min(old.time, r.time) : r.time };
    prog.last = id; save();
  };
  E.setLast = id => { prog.last = id; save(); };
  E.setSound = on => { prog.sound = on; save(); };
  E.setMusic = on => { prog.music = on; save(); E.music && E.music.refresh(); };

  const allCuas = () => window.DPN_CHAPTERS.flatMap(c => (c.taps || []).flatMap(t => (t.cuas || []).map(x => Object.assign({ tap: t, chap: c }, x))));
  const playable = cua => !!window.DPN_LEVELS[cua.id];
  function unlocked(cua) {
    const list = allCuas(), i = list.findIndex(x => x.id === cua.id);
    return playable(cua) && (i <= 0 || !!prog.done[list[i - 1].id]);
  }
  const fmt = s => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');

  // ---------- điều hướng ----------
  function go(id) { for (const el of document.querySelectorAll('.screen')) el.hidden = el.id !== id; document.body.dataset.view = id || 'play'; E.music && E.music.screen(id); }
  E.menu = {
    home() {
      go('home');
      const next = allCuas().find(c => unlocked(c) && !prog.done[c.id]) || allCuas().find(unlocked);
      $('btnStart').dataset.cua = next ? next.id : '';
      const last = prog.last && allCuas().find(c => c.id === prog.last);
      $('btnContinue').disabled = !last;
      $('btnContinue').querySelector('small').textContent = last
        ? `Tập ${last.tap.n} · Cửa ${last.tap.cuas.findIndex(x => x.id === last.id) + 1} – ${last.name}` : 'Chưa có hành trình nào';
    },
    chapters() { go('chapters'); renderChapters(); },
    chapter(cid) { go('chapter'); renderChapter(cid); },
    intro(id) {
      const c = allCuas().find(x => x.id === id); if (!c) return;
      go('intro');
      $('introKicker').textContent = `${c.chap.name} · Tập ${c.tap.n} – ${c.tap.name}`;
      const i = c.tap.cuas.findIndex(x => x.id === id);
      $('introName').textContent = c.boss ? `Trùm – ${c.name}` : `Cửa ${i + 1} – ${c.name}`;
      $('introGoal').textContent = c.goal;
      const r = prog.done[id];
      $('introBest').textContent = r ? `Kỷ lục: ${r.rice}/${r.total} cơm nắm · ${fmt(r.time)}` : '';
      $('btnPlay').onclick = () => E.startLevel(id);
    },
    c1list() { this.chapter('c1'); },
    settings() { go('settings'); $('optSound').checked = prog.sound; $('optMusic').checked = prog.music; },
    panel(kind) { go('panel'); renderPanel(kind); },
    donate() { go('donate'); },
    // cửa kế tiếp sau id (kèm cờ chơi được hay chưa)
    next(id) {
      const list = allCuas(), i = list.findIndex(x => x.id === id), n = list[i + 1];
      return n ? Object.assign({ playable: playable(n), index: n.tap.cuas.findIndex(x => x.id === n.id) }, n) : null;
    },
    go
  };

  // ---------- Chọn chương ----------
  function renderChapters() {
    const box = $('chapterCards'); box.innerHTML = '';
    for (const c of window.DPN_CHAPTERS) {
      const cuas = (c.taps || []).flatMap(t => t.cuas || []), done = cuas.filter(x => prog.done[x.id]).length;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chap' + (c.open ? '' : ' locked');
      b.innerHTML = `<span class="chap-art ${c.id}"></span><span class="chap-txt"><small>${c.name}</small><b>${c.title}</b><span>${c.desc}</span>
        <em>${c.open ? `8 tập · ${done} cửa đã qua` : 'Sắp ra mắt'}</em></span>`;
      if (c.open) b.onclick = () => E.menu.chapter(c.id); else b.disabled = true;
      box.appendChild(b);
    }
  }
  function renderChapter(cid) {
    const c = window.DPN_CHAPTERS.find(x => x.id === cid);
    $('chapTitle').textContent = `${c.name} – ${c.title}`;
    const box = $('tapList'); box.innerHTML = '';
    for (const t of c.taps) {
      const row = document.createElement('section'); row.className = 'tap' + (t.cuas ? '' : ' locked');
      row.innerHTML = `<header><span class="tap-n">Tập ${t.n}</span><b>${t.name}</b>${t.boss ? `<small>Trùm: ${t.boss}</small>` : ''}</header>`;
      if (t.map) {
        const map = document.createElement('div'); map.className = 'tapmap';
        map.innerHTML = `<img src="${t.map}" alt="Bản đồ Tập ${t.n} – ${t.name}">`;
        t.cuas.forEach((cua, i) => {
          const [x, y] = t.pins[i], ok = unlocked(cua), done = prog.done[cua.id];
          const pin = document.createElement('button'); pin.type = 'button';
          pin.className = 'pin' + (done ? ' done' : '') + (ok ? '' : ' locked') + (cua.boss ? ' boss' : '');
          pin.style.left = x + '%'; pin.style.top = y + '%';
          pin.textContent = cua.boss ? '★' : i + 1;
          pin.setAttribute('aria-label', (cua.boss ? 'Trùm – ' : `Cửa ${i + 1} – `) + cua.name + (ok ? '' : ' (chưa mở)'));
          if (ok) pin.onclick = () => E.menu.intro(cua.id); else pin.disabled = true;
          map.appendChild(pin);
        });
        row.appendChild(map);
      }
      const grid = document.createElement('div'); grid.className = 'cuas';
      if (!t.cuas) grid.innerHTML = '<p class="soon">Đang xây dựng</p>';
      else t.cuas.forEach((cua, i) => {
        const b = document.createElement('button'); b.type = 'button';
        const ok = unlocked(cua), done = prog.done[cua.id];
        b.className = 'cua' + (done ? ' done' : '') + (ok ? '' : ' locked') + (cua.boss ? ' boss' : '');
        b.innerHTML = `<span class="cua-n">${cua.boss ? 'Trùm' : 'Cửa ' + (i + 1)}</span><b>${cua.name}</b>
          <small>${done ? `✓ ${done.rice}/${done.total} cơm nắm` : ok ? 'Sẵn sàng' : playable(cua) ? 'Qua cửa trước để mở' : 'Đang xây dựng'}</small>`;
        if (ok) b.onclick = () => E.menu.intro(cua.id); else b.disabled = true;
        grid.appendChild(b);
      });
      row.appendChild(grid); box.appendChild(row);
    }
  }

  // ---------- Bảng phụ (Nhật ký, Vật phẩm, Xóm làng, Thành tích, Nhân vật) ----------
  function renderPanel(kind) {
    const body = $('panelBody'), done = Object.values(prog.done);
    const rice = done.reduce((a, r) => a + r.rice, 0);
    const T = {
      journal: ['Nhật ký', `<p>Nam theo cha mẹ xuống ghe rời quê cũ, xuôi về miền đất mới phương Nam. Bãi sông hoang vắng, bùn lầy, đỉa bám và cá sấu rình dưới nước.</p>
        <p>Mỗi cửa vượt qua sẽ mở thêm một trang nhật ký của Nam.</p>`],
      items: ['Vật phẩm', `<ul class="stat"><li><img src="assets/sprites/item_riceball.png" alt=""> Cơm nắm đã nhặt <b>${rice}</b></li>
        <li><img src="assets/sprites/item_gourd.png" alt=""> Bầu nước: hồi 1 sức khi nhặt</li></ul><p class="soon">Túi đồ, giáo, dao rựa, đuốc sẽ mở ở các tập sau.</p>`],
      village: ['Xóm làng', '<p>Xóm làng sẽ được dựng dần khi Nam vượt qua các tập của Chương 1: chòi canh, nhà sàn, bến đò, ruộng lúa.</p><p class="soon">Sắp có</p>'],
      achieve: ['Thành tích', `<ul class="stat"><li>Cửa đã qua <b>${done.length}</b></li><li>Tổng cơm nắm <b>${rice}</b></li>
        ${Object.entries(prog.done).map(([id, r]) => `<li>${id.toUpperCase()} · kỷ lục ${fmt(r.time)}</li>`).join('')}</ul>`],
      chars: ['Nhân vật', `<div class="who"><img src="assets/ui/chapter_1.webp" alt="Nam"><div><b>Nam</b><p>Cậu bé 14 tuổi theo gia đình khai hoang. Gan dạ, nhanh trí, giỏi leo trèo, bơi lội và tận dụng mọi thứ quanh mình.</p>
        <p class="soon">Các bạn đồng hành mở ở Chương 2.</p></div></div>`]
    }[kind];
    $('panelTitle').textContent = T[0]; body.innerHTML = T[1];
  }

  // ---------- nút ----------
  $('btnStart').onclick = e => { const id = e.currentTarget.dataset.cua; if (id) E.menu.intro(id); };
  $('btnChapters').onclick = () => E.menu.chapters();
  $('btnDonate').onclick = () => E.menu.donate();
  $('btnContinue').onclick = () => prog.last && E.menu.intro(prog.last);
  $('btnSettings').onclick = $('btnSettings2').onclick = () => E.menu.settings();
  for (const b of document.querySelectorAll('[data-panel]')) b.onclick = () => E.menu.panel(b.dataset.panel);
  for (const b of document.querySelectorAll('[data-back]')) b.onclick = () => E.menu[b.dataset.back]();
  $('optSound').onchange = e => E.setSound(e.target.checked);
  $('optMusic').onchange = e => E.setMusic(e.target.checked);
  let armed = false;
  $('btnReset').onclick = e => {
    if (!armed) { armed = true; e.currentTarget.textContent = 'Bấm lần nữa để xóa'; setTimeout(() => { armed = false; $('btnReset').textContent = 'Xóa tiến độ'; }, 3000); return; }
    prog.done = {}; prog.last = null; save(); armed = false; e.currentTarget.textContent = 'Đã xóa';
  };
})();
