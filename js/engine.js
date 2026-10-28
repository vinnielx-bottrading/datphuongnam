// ===== Đất Phương Nam – engine dùng chung cho mọi cửa =====
(function () {
  const VIEW_W = 1280, VIEW_H = 720;
  const E = (window.DPN = window.DPN || {});
  E.VIEW_W = VIEW_W; E.VIEW_H = VIEW_H;

  // ---------- Ảnh ----------
  E.img = {};
  E.loadAssets = function (onProgress) {
    const meta = window.ASSET_META, keys = Object.keys(meta);
    let done = 0;
    return Promise.all(keys.map(k => new Promise(res => {
      const im = new Image();
      im.onload = im.onerror = () => { done++; onProgress && onProgress(done / keys.length); res(); };
      im.src = 'assets/' + meta[k].src;
      E.img[k] = im;
    })));
  };

  // Vẽ 1 khung của dải sprite. anchor bottom: (x,y) = chân giữa; center: tâm.
  E.drawFrame = function (ctx, key, frame, x, y, scale = 1, flip = false, alpha = 1) {
    const m = window.ASSET_META[key], im = E.img[key];
    if (!m || !im || !im.complete) return;
    const f = ((frame % m.n) + m.n) % m.n;
    const w = m.w * scale, h = m.h * scale;
    const dy = m.anchor === 'center' ? y - h / 2 : y - h;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.translate(-x, 0); }
    ctx.drawImage(im, f * m.w, 0, m.w, m.h, x - w / 2, dy, w, h);
    ctx.restore();
  };
  E.drawImg = function (ctx, key, x, y, scale = 1, alpha = 1) {
    const m = window.ASSET_META[key], im = E.img[key];
    if (!m || !im) return;
    ctx.globalAlpha = alpha;
    ctx.drawImage(im, x, y, m.w * scale, m.h * scale);
    ctx.globalAlpha = 1;
  };

  // ---------- Bàn phím + cảm ứng ----------
  const keys = {}, pressed = {};
  const map = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    ArrowUp: 'jump', KeyW: 'jump', Space: 'jump', KeyZ: 'jump', ArrowDown: 'down', KeyS: 'down',
    Enter: 'ok', Escape: 'pause', KeyP: 'pause' };
  addEventListener('keydown', e => {
    const k = map[e.code]; if (!k) return;
    if (!keys[k]) pressed[k] = true;
    keys[k] = true; e.preventDefault();
  });
  addEventListener('keyup', e => { const k = map[e.code]; if (k) { keys[k] = false; e.preventDefault(); } });
  E.bindTouch = function (el, k) {
    const on = e => { e.preventDefault(); if (!keys[k]) pressed[k] = true; keys[k] = true; el.classList.add('on'); };
    const off = e => { e.preventDefault(); keys[k] = false; el.classList.remove('on'); };
    el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off);
    el.addEventListener('pointercancel', off); el.addEventListener('pointerleave', off);
  };
  E.input = {
    down: k => !!keys[k],
    hit: k => { const v = !!pressed[k]; pressed[k] = false; return v; },
    endFrame: () => { for (const k in pressed) pressed[k] = false; }
  };

  // ---------- Hiệu ứng ----------
  E.fx = [];
  E.spawnFx = function (key, x, y, opts = {}) {
    E.fx.push({ key, x, y, t: 0, fps: opts.fps || 14, scale: opts.scale || 0.8, flip: !!opts.flip, loop: !!opts.loop, life: opts.life || 0 });
  };
  E.updateFx = function (dt) {
    E.fx = E.fx.filter(f => {
      f.t += dt;
      const n = window.ASSET_META[f.key].n;
      return f.loop ? f.t < f.life : f.t * f.fps < n;
    });
  };
  E.drawFx = function (ctx) {
    for (const f of E.fx) E.drawFrame(ctx, f.key, Math.floor(f.t * f.fps), f.x, f.y, f.scale, f.flip);
  };

  // ---------- Tiện ích ----------
  E.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  E.overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  E.lerp = (a, b, t) => a + (b - a) * t;
})();
