// ===== Dựng & vẽ một cửa từ dữ liệu trong js/levels/*.js =====
(function () {
  const E = window.DPN;

  E.Level = class {
    constructor(def) {
      this.def = def; this.width = def.width; this.gy = def.groundY; this.water = def.groundY + 46;
      this.solids = []; this.ents = []; this.logs = [];
      this.rice = 0; this.score = 0; this.time = 0; this.shake = 0; this.msg = null; this.camX = 0;
      for (const [a, b] of def.ground) this.solids.push({ x: a, y: this.gy, w: b - a, h: 400, ground: true });
      for (const [x, y] of def.platforms) this.solids.push({ x: x - 105, y, w: 210, h: 40, oneWay: true, plat: true });
      for (let i = 0; i < def.logs.length; i++) { const l = new E.Log(def.logs[i], this.water, i * 1.3); this.logs.push(l); this.solids.push(l.solid); }
      this.crocs = def.crocs.map(([a, b]) => new E.Croc(a, b, this.water));
      this.ents.push(...def.leeches.map(([a, b]) => new E.Leech(a, b, this.gy)));
      this.items = def.items.map(([k, x, y]) => new E.Item(k, x, y));
      this.riceTotal = this.items.filter(i => i.kind === 'rice').length;
      this.cps = def.checkpoints.map(x => new E.Checkpoint(x, this.gy));
      this.checkpoint = { x: def.start.x, y: this.gy };
      this.player = new E.Player(def.start.x, this.gy);
      this.signShown = {};
    }
    mudAt(x) { return this.def.mud.some(([a, b]) => x > a + 10 && x < b - 10); }
    toast(t) { this.msg = { t, life: 2.6 }; }

    update(dt) {
      const p = this.player;
      this.time += dt; this.shake = Math.max(0, this.shake - dt);
      for (const l of this.logs) l.update(dt);
      p.update(dt, this);
      for (const c of this.crocs) c.update(dt, p, this);
      for (const e of this.ents) e.update(dt, p, this);
      this.ents = this.ents.filter(e => !e.gone);
      for (const i of this.items) i.update(dt, p, this);
      for (const c of this.cps) c.update(dt, p, this);
      E.updateFx(dt);
      if (this.msg && (this.msg.life -= dt) <= 0) this.msg = null;

      // rơi xuống sông
      if (!p.dead && p.y > this.water + 10) {
        E.spawnFx('fx_splash', p.cx, this.water + 40, { scale: 1 });
        this.sound && this.sound('splash');
        p.hp -= 1; this.shake = 0.3;
        if (p.hp <= 0) { p.dead = true; p.anim = 0; p.y = this.water - p.h; }
        else { this.toast('Rơi xuống sông! Quay lại điểm lưu.'); this.respawn(); p.inv = 1.5; }
      }
      // tới chòi canh
      if (!p.win && !p.dead && p.cx > this.def.goal) { p.win = true; p.anim = 0; p.vx = 0; }

      // camera
      const target = E.clamp(p.cx - E.VIEW_W * 0.38, 0, this.width - E.VIEW_W);
      this.camX = E.lerp(this.camX, target, Math.min(1, dt * 7));
    }
    respawn() { const p = this.player, hp = p.hp; p.reset(this.checkpoint.x, this.checkpoint.y); p.hp = hp; }

    // ---------- vẽ ----------
    draw(ctx) {
      const W = E.VIEW_W, H = E.VIEW_H, cam = this.camX, th = this.def.theme;
      const sx = this.shake > 0 ? (Math.random() - 0.5) * 10 : 0, sy = this.shake > 0 ? (Math.random() - 0.5) * 8 : 0;
      // nền xa
      const far = window.ASSET_META[th.far];
      for (let x = -((cam * 0.12) % far.w); x < W; x += far.w) ctx.drawImage(E.img[th.far], Math.floor(x), -40, far.w, far.h);
      ctx.save(); ctx.translate(sx, sy);
      // nền giữa (rặng cây, cầu, xuồng)
      const mid = window.ASSET_META[th.mid], ms = 0.8, mw = mid.w * ms, mh = mid.h * ms;
      const my = this.gy + 34 - (th.midBottom || mid.h) * ms;
      for (let x = -((cam * 0.42) % mw); x < W; x += mw) ctx.drawImage(E.img[th.mid], Math.floor(x), my, mw + 1, mh);
      // sông phía sau mặt đất: ảnh mặt nước + lòng sông vẽ tay, lặp ngang
      if (th.waterImg) {
        const wm = window.ASSET_META[th.waterImg], ws = 0.6, ww = wm.w * ws;
        for (let x = -((cam * 0.9 + this.time * 10) % ww); x < W; x += ww) ctx.drawImage(E.img[th.waterImg], Math.floor(x), this.gy + 16, ww + 1, wm.h * ws);
      } else {
        const g = ctx.createLinearGradient(0, this.gy + 26, 0, H);
        g.addColorStop(0, th.water[0]); g.addColorStop(0.45, th.water[1]); g.addColorStop(1, th.water[2]);
        ctx.fillStyle = g; ctx.fillRect(0, this.gy + 26, W, H - this.gy);
      }
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2;
      for (let i = 0; i < 14; i++) {
        const wx = ((i * 211 - cam * 1.0 + this.time * 18) % (W + 200) + W + 200) % (W + 200) - 100;
        ctx.beginPath(); ctx.moveTo(wx, this.water + 8 + (i % 3) * 22); ctx.lineTo(wx + 40, this.water + 8 + (i % 3) * 22); ctx.stroke();
      }

      ctx.save(); ctx.translate(-Math.round(cam), 0);
      for (const c of this.crocs) c.draw(ctx);
      for (const l of this.logs) l.draw(ctx);
      this.drawGround(ctx, cam);
      for (const [k, x, s, dy] of this.def.props) { const m = window.ASSET_META[k]; E.drawImg(ctx, k, x - m.w * s / 2, this.gy - m.h * s + (dy || 18), s); }
      // chòi canh đích
      const lk = window.ASSET_META.prop_lookout;
      E.drawImg(ctx, 'prop_lookout', this.def.goal + 10, this.gy - lk.h * 0.62 + 16, 0.62);
      for (const c of this.cps) c.draw(ctx);
      this.drawSigns(ctx);
      for (const i of this.items) i.draw(ctx);
      for (const e of this.ents) e.draw(ctx);
      this.player.draw(ctx);
      E.drawFx(ctx);
      ctx.restore();

      // tiền cảnh (cây hai bên) – lướt nhanh hơn
      // chỉ lấy dải cỏ dương xỉ ở đáy ảnh tiền cảnh, để không che Nam
      if (th.fg) {
        const fg = window.ASSET_META[th.fg], fs = 0.62, fw = fg.w * fs;
        for (let x = -((cam * 1.15) % fw); x < W; x += fw) ctx.drawImage(E.img[th.fg], Math.floor(x), H - fg.h * fs + 6, fw + 1, fg.h * fs);
      }
      ctx.restore();
    }

    drawGround(ctx, cam) {
      const t = window.ASSET_META.ground_tile, top = this.gy - 74;
      for (const s of this.solids) {
        if (s.ground) {
          const x0 = Math.max(s.x, cam - t.w), x1 = Math.min(s.x + s.w, cam + E.VIEW_W + t.w);
          if (x1 < x0) continue;
          ctx.fillStyle = '#4A3122'; ctx.fillRect(s.x + 6, top + 120, s.w - 12, 400);
          ctx.save(); ctx.beginPath(); ctx.rect(s.x - 8, 0, s.w + 16, 2000); ctx.clip();
          let x = s.x - 8 + Math.floor((x0 - s.x) / t.w) * t.w;
          for (; x < x1; x += t.w) ctx.drawImage(E.img.ground_tile, x, top, t.w + 1, t.h);
          ctx.restore();
        } else if (s.plat) {
          E.drawImg(ctx, 'plat_3', s.x - 12, s.y - 9, 1);
        }
      }
      for (const [a, b] of this.def.mud) {
        if (b < cam - 100 || a > cam + E.VIEW_W + 100) continue;
        this.drawMud(ctx, a, b);
      }
    }

    // Bùn lún vẽ liền mặt đất: hố bùn sẫm, bóng ướt, bong bóng sủi, cỏ lau nghiêng vào
    drawMud(ctx, a, b) {
      if (window.ASSET_META.mud_M) return this.drawMudTiles(ctx, a, b);
      const top = this.gy + 1, d = 46, t = this.time, w = b - a;
      ctx.save();
      // mép đất ẩm sẫm màu quanh hố
      ctx.fillStyle = 'rgba(58,36,20,.55)';
      ctx.beginPath(); ctx.ellipse((a + b) / 2, top + 6, w / 2 + 26, 16, 0, 0, Math.PI * 2); ctx.fill();
      // lòng bùn
      ctx.beginPath();
      ctx.moveTo(a - 6, top - 2);
      ctx.bezierCurveTo(a + 20, top + d, b - 20, top + d, b + 6, top - 2);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, top - 4, 0, top + d);
      g.addColorStop(0, '#6A4528'); g.addColorStop(0.35, '#4A2E18'); g.addColorStop(1, '#2A190C');
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = '#2A1C14'; ctx.lineWidth = 3; ctx.stroke();
      ctx.clip();
      // vệt bóng ướt trôi chậm
      ctx.strokeStyle = 'rgba(255,240,210,.28)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let k = 0; k < Math.max(2, w / 70); k++) {
        const x = a + ((k * 97 + t * 14) % (w + 60)) - 30, y = top + 7 + (k % 3) * 6;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 18, y - 3, x + 38, y); ctx.stroke();
      }
      // vòng xoáy lún
      ctx.strokeStyle = 'rgba(20,10,4,.35)'; ctx.lineWidth = 2;
      for (let r = 8; r < 30; r += 9) { ctx.beginPath(); ctx.ellipse((a + b) / 2, top + 14, r * 1.8 + Math.sin(t * 2 + r) * 2, r * 0.45, 0, 0, Math.PI * 2); ctx.stroke(); }
      // bong bóng sủi
      for (let k = 0; k < Math.max(3, w / 45); k++) {
        const ph = (t * 0.7 + k * 0.37) % 1.6, x = a + 20 + ((k * 61) % Math.max(20, w - 40)), y = top + 8 + (k % 2) * 7;
        if (ph < 1) {
          const r = 2 + ph * 6;
          ctx.fillStyle = 'rgba(120,84,50,.9)'; ctx.beginPath(); ctx.arc(x, y - r * 0.4, r, Math.PI, 0); ctx.fill();
          ctx.fillStyle = 'rgba(255,240,210,.5)'; ctx.beginPath(); ctx.arc(x - r * 0.35, y - r * 0.8, r * 0.28, 0, Math.PI * 2); ctx.fill();
        } else if (ph < 1.15) {
          ctx.strokeStyle = 'rgba(255,240,210,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, 10, 3, 0, 0, Math.PI * 2); ctx.stroke();
        }
      }
      ctx.restore();
      // lau sậy nghiêng ở hai mép
      ctx.save(); ctx.strokeStyle = '#4F6B2A'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (const [x, dir] of [[a - 4, 1], [a + 6, 1], [b - 6, -1], [b + 4, -1]]) {
        const sw = Math.sin(t * 1.5 + x) * 3;
        ctx.beginPath(); ctx.moveTo(x, top + 2); ctx.quadraticCurveTo(x + dir * 6, top - 30, x + dir * (16 + sw), top - 52); ctx.stroke();
      }
      ctx.fillStyle = '#7A5A33';
      for (const [x, dir] of [[a + 6, 1], [b - 6, -1]]) { ctx.beginPath(); ctx.ellipse(x + dir * 16, top - 54, 4, 10, dir * 0.4, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }

    // Bùn bằng ảnh vẽ tay: mép trái + đoạn giữa lặp + mép phải, đáy khớp đáy dải đất
    drawMudTiles(ctx, a, b) {
      const s = 0.62, bub = Math.floor(this.time / 1.4) % 2 ? '_b' : '';
      const L = window.ASSET_META['mud_L' + bub], M = window.ASSET_META['mud_M' + bub], R = window.ASSET_META['mud_R' + bub];
      const bottom = this.gy + 72, lw = L.w * s, rw = R.w * s, mw = M.w * s;
      const x0 = a - lw * 0.45, x1 = b + rw * 0.45;
      ctx.drawImage(E.img['mud_L' + bub], x0, bottom - L.h * s, lw, L.h * s);
      ctx.save(); ctx.beginPath(); ctx.rect(x0 + lw - 1, 0, Math.max(0, x1 - rw - x0 - lw + 2), 2000); ctx.clip();
      for (let x = x0 + lw - 2; x < x1 - rw; x += mw - 2) ctx.drawImage(E.img['mud_M' + bub], x, bottom - M.h * s, mw, M.h * s);
      ctx.restore();
      ctx.drawImage(E.img['mud_R' + bub], x1 - rw, bottom - R.h * s, rw, R.h * s);
    }

    drawSigns(ctx) {
      const p = this.player;
      for (const [x, text] of this.def.signs) {
        // cọc biển
        ctx.fillStyle = '#6B4A2E'; ctx.fillRect(x - 4, this.gy - 70, 8, 70);
        ctx.fillStyle = '#C9A35A'; ctx.strokeStyle = '#2A1C14'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(x - 26, this.gy - 96, 52, 34, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2A1C14'; ctx.font = '800 22px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center'; ctx.fillText('?', x, this.gy - 71);
        const d = Math.abs(p.cx - x);
        if (d < 260) this.drawBubble(ctx, x, this.gy - 112, text, 1 - Math.max(0, d - 160) / 100);
      }
    }
    drawBubble(ctx, x, y, text, a) {
      ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, a));
      ctx.font = '600 20px "Be Vietnam Pro",sans-serif';
      const words = text.split(' '), lines = []; let line = '';
      for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > 380) { lines.push(line); line = w; } else line = t; }
      lines.push(line);
      const bw = Math.min(420, Math.max(...lines.map(l => ctx.measureText(l).width)) + 32), bh = lines.length * 26 + 22;
      const bx = E.clamp(x - bw / 2, this.camX + 12, this.camX + E.VIEW_W - bw - 12), by = y - bh;
      ctx.fillStyle = 'rgba(252,248,241,.96)'; ctx.strokeStyle = '#2A1C14'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 12); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x - 10, y - 1); ctx.lineTo(x + 10, y - 1); ctx.lineTo(x, y + 12); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2A1C14'; ctx.textAlign = 'left';
      lines.forEach((l, i) => ctx.fillText(l, bx + 16, by + 30 + i * 26));
      ctx.restore();
    }
  };
})();
