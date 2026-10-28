// ===== Nhạc nền menu =====
// welcome: màn hình chính khi chưa vào cửa nào
// victory: khi Nam qua cửa, và kéo dài qua màn chọn cửa / giới thiệu cửa kế tiếp
// Trong lúc chơi: tạm không có nhạc (chỉ hiệu ứng âm thanh)
(function () {
  const E = window.DPN;
  const SRC = { welcome: 'assets/audio/welcome.mp3', victory: 'assets/audio/victory.mp3' };
  const VOL = 0.8;
  const els = {};
  let want = null, gesture = false, afterWin = false;

  function el(k) {
    if (!els[k]) { const a = new Audio(SRC[k]); a.loop = true; a.preload = 'auto'; a.volume = 0; els[k] = a; }
    return els[k];
  }
  const enabled = () => !(E.progress && E.progress.music === false);

  // iPhone bỏ qua a.volume: khi đó chỉ play/pause, không mượt nhưng vẫn đúng
  function fade(a, to, ms, done) {
    clearInterval(a._f);
    const from = a.volume, t0 = performance.now();
    a._f = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      try { a.volume = from + (to - from) * k; } catch (e) { }
      if (k >= 1) { clearInterval(a._f); done && done(); }
    }, 40);
  }

  function apply() {
    const k = enabled() && gesture && !document.hidden ? want : null;
    for (const [key, a] of Object.entries(els)) {
      if (key !== k && !a.paused) fade(a, 0, 600, () => a.pause());
    }
    if (k) {
      const a = el(k);
      if (a.paused) { const p = a.play(); if (p && p.catch) p.catch(() => { }); }
      fade(a, VOL, 900);
    }
  }

  function set(k, restart) {
    if (k === want && !restart) return;
    if (k && restart) { const a = el(k); try { a.currentTime = 0; } catch (e) { } }
    want = k; apply();
  }

  E.music = {
    // gọi mỗi khi đổi màn hình (menu.go)
    screen(id) {
      if (id && E.sfx) E.sfx.ambience(null);
      if (id === 'win') { const fresh = !afterWin || want !== 'victory'; afterWin = true; set('victory', fresh); return; }
      if (id === 'chapters' || id === 'chapter' || id === 'intro' || id === 'donate') { set(afterWin ? 'victory' : 'welcome'); return; }
      if (id === 'home' || id === 'settings' || id === 'panel' || id === 'loading') { afterWin = false; set('welcome'); return; }
      // đang chơi, tạm dừng, thua
      if (!id) afterWin = false;
      set(null);
      E.sfx && E.sfx.ambience(id ? null : (E.ambKey || 'day'));
    },
    refresh() { apply(); if (E.sfx) E.sfx.ambience(document.body.dataset.view === 'play' ? (E.ambKey || 'day') : null); }
  };

  // trình duyệt chỉ cho phát nhạc sau lần chạm/bấm đầu tiên
  const unlock = () => {
    if (gesture) return;
    gesture = true; apply();
    for (const ev of ['pointerdown', 'keydown', 'touchend']) removeEventListener(ev, unlock, true);
  };
  for (const ev of ['pointerdown', 'keydown', 'touchend']) addEventListener(ev, unlock, true);
  document.addEventListener('visibilitychange', apply);
})();
