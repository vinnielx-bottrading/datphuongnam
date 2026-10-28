// ===== Vòng lặp game, HUD, màn hình bắt đầu / thắng / thua =====
(function () {
  const E = window.DPN;
  const cv = document.getElementById('game'), ctx = cv.getContext('2d');
  const $ = id => document.getElementById(id);
  let level = null, state = 'loading', levelId = 't1c1';
  const muted = () => E.progress && E.progress.sound === false;

  const sound = k => E.sfx && E.sfx.play(k);

  // ---------- co giãn canvas ----------
  function fit() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const s = Math.min(innerWidth / E.VIEW_W, innerHeight / E.VIEW_H);
    cv.style.width = E.VIEW_W * s + 'px'; cv.style.height = E.VIEW_H * s + 'px';
    cv.width = Math.round(E.VIEW_W * s * dpr); cv.height = Math.round(E.VIEW_H * s * dpr);
    ctx.setTransform(cv.width / E.VIEW_W, 0, 0, cv.height / E.VIEW_H, 0, 0);
    ctx.imageSmoothingQuality = 'high';
  }
  addEventListener('resize', fit); fit();

  function show(id) { E.menu.go(id); }

  E.startLevel = function (id) { levelId = id || levelId; E.setLast(levelId); start(); };
  function start() {
    const def = window.DPN_LEVELS[levelId] || window.DPN_LEVELS.t1c1;
    E.ambKey = def.ambience || 'day';
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    level = new E.Level(def); level.sound = sound; E.fx.length = 0;
    const hurt = level.player.hurt.bind(level.player);
    level.player.hurt = (x, L) => { const r = hurt(x, L); if (r) sound('hurt'); return r; };
    show(null); state = 'play'; last = performance.now();
  }

  // ---------- HUD ----------
  function hud() {
    const p = level.player;
    ctx.save();
    ctx.fillStyle = 'rgba(42,28,20,.55)'; ctx.beginPath(); ctx.roundRect(16, 14, 470, 64, 14); ctx.fill();
    for (let i = 0; i < p.maxHp; i++) E.drawFrame(ctx, 'item_gourd', 0, 50 + i * 50, 46, 0.48, false, i < p.hp ? 1 : 0.25);
    E.drawFrame(ctx, 'item_riceball', 0, 222, 46, 0.42);
    ctx.fillStyle = '#FCF8F1'; ctx.font = '800 26px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(level.rice + ' / ' + level.riceTotal, 254, 56);
    if (level.pagesTotal) { E.drawFrame(ctx, 'item_page', 0, 388, 46, 0.24); ctx.fillText(level.pages + ' / ' + level.pagesTotal, 414, 56); }
    ctx.textAlign = 'right'; ctx.font = '700 20px "Be Vietnam Pro",sans-serif';
    ctx.fillText(level.def.title + ' · ' + level.def.name, E.VIEW_W - 128, 42);
    // thanh tiến độ tới chòi canh
    const k = E.clamp(p.cx / level.def.goal, 0, 1);
    ctx.fillStyle = 'rgba(42,28,20,.45)'; ctx.fillRect(E.VIEW_W - 388, 54, 260, 8);
    ctx.fillStyle = '#FFD25A'; ctx.fillRect(E.VIEW_W - 388, 54, 260 * k, 8);
    if (level.msg) {
      ctx.globalAlpha = Math.min(1, level.msg.life * 2);
      ctx.font = '700 22px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center';
      const w = ctx.measureText(level.msg.t).width + 40;
      ctx.fillStyle = 'rgba(169,72,26,.92)'; ctx.beginPath(); ctx.roundRect(E.VIEW_W / 2 - w / 2, 92, w, 44, 22); ctx.fill();
      ctx.fillStyle = '#FCF8F1'; ctx.fillText(level.msg.t, E.VIEW_W / 2, 122);
    }
    ctx.restore();
  }

  // ---------- vòng lặp ----------
  let last = performance.now(), endT = 0, nextId = null;
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000); last = now;
    if (state === 'play' || state === 'end') {
      if (state === 'play' && E.input.hit('pause')) { state = 'pause'; show('pause'); }
      else {
        level.update(dt);
        const p = level.player;
        if (state === 'play' && (p.win || p.dead)) { state = 'end'; endT = 0; sound(p.win ? 'win' : 'faint'); }
        if (state === 'end' && (endT += dt) > 1.4) finish();
      }
    } else if (state === 'pause' && E.input.hit('pause')) { state = 'play'; show(null); }
    else if (state === 'win' && E.input.hit('ok')) $('btnWinNext').click();
    else if (state === 'over' && E.input.hit('ok')) start();
    if (level && state !== 'menu') { level.draw(ctx); hud(); }
    E.input.endFrame();
    requestAnimationFrame(loop);
  }

  function finish() {
    const p = level.player;
    if (p.win) {
      state = 'win';
      const sec = Math.round(level.time);
      const st = E.saveResult(levelId, { rice: level.rice, total: level.riceTotal, time: level.time, pageGot: level.pageGot, pages: level.pages, ptotal: level.pagesTotal });
      const par = level.def.par || 0, fm = s => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');
      $('winStars').innerHTML = [['Cơm nắm ≥ 80%', `${level.rice}/${level.riceTotal}`], ['Mảnh nhật ký', `${level.pages}/${level.pagesTotal}`], ['Dưới ' + fm(par), fm(level.time)]]
        .map(([t, v], i) => `<li class="${st[i] ? 'on' : ''}"><i>${st[i] ? '★' : '☆'}</i><b>${v}</b><span>${t}</span></li>`).join('');
      $('winTitle').textContent = 'Qua ' + level.def.title.replace('Tập 1 · ', '') + ' – ' + level.def.name + '!';
      $('winStats').textContent = `Hạ ${level.score} con đỉa`;
      const nx = E.menu.next(levelId);
      $('winNext').innerHTML = nx
        ? `<small>${nx.playable ? 'Cửa tiếp theo' : 'Cửa tiếp theo · đang xây dựng'}</small><b>${nx.boss ? 'Trùm' : 'Cửa ' + (nx.index + 1)} – ${nx.name}</b><span>${nx.goal || ''}</span>`
        : '<b>Bạn đã qua hết các cửa hiện có!</b><span>Cửa mới đang được làm tiếp.</span>';
      nextId = nx && nx.playable ? nx.id : null;
      $('btnWinNext').textContent = nextId ? 'Vào cửa tiếp theo' : 'Về bản đồ';
      show('win');
    } else { state = 'over'; show('over'); }
  }

  E._level = () => level;
  // ---------- nút ----------
  const toMenu = () => { state = 'menu'; E.menu.chapter('c1'); };
  $('btnResume').addEventListener('click', () => { state = 'play'; show(null); });
  $('btnRestart').addEventListener('click', start); $('btnWinAgain').addEventListener('click', start); $('btnOverAgain').addEventListener('click', start);
  $('btnQuit').addEventListener('click', toMenu); $('btnWinNext').addEventListener('click', () => { if (nextId) { state = 'menu'; E.menu.intro(nextId); } else toMenu(); });
  $('btnWinMap').addEventListener('click', toMenu); $('btnOverQuit').addEventListener('click', toMenu);
  $('btnPause').addEventListener('click', () => { if (state === 'play') { state = 'pause'; show('pause'); } });
  const muteLabel = () => { $('btnMute').classList.toggle('off', muted()); };
  $('btnMute').addEventListener('click', () => { E.setSound(muted()); muteLabel(); }); muteLabel();
  // tiếng gõ tre khi bấm nút menu
  document.addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.closest('.touch-ui')) return; sound(b.classList.contains('back') || b.dataset.back ? 'back' : 'click'); }, true);
  E.bindTouch($('tLeft'), 'left'); E.bindTouch($('tRight'), 'right'); E.bindTouch($('tJump'), 'jump');
  if (matchMedia('(pointer: coarse)').matches) document.body.classList.add('touch');

  // ---------- tải ảnh ----------
  E.loadAssets(k => { $('loadBar').style.width = Math.round(k * 100) + '%'; }).then(() => {
    state = 'menu'; E.menu.home();
    requestAnimationFrame(loop);
  });
})();
