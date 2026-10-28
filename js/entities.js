// ===== Thực thể dùng chung: đỉa, cá sấu, vật phẩm, khúc gỗ trôi, điểm lưu =====
(function () {
  const E = window.DPN;

  // ---------- Đỉa: bò tuần tra, ngóc đầu cảnh báo rồi lao tới; nhảy lên đầu để hạ ----------
  E.Leech = class {
    constructor(x0, x1, y) {
      this.x0 = x0; this.x1 = x1; this.x = (x0 + x1) / 2; this.ground = y;
      this.w = 58; this.h = 34; this.dir = -1; this.t = Math.random(); this.state = 'crawl'; this.st = 0; this.dead = false; this.gone = false;
    }
    box() { return { x: this.x - this.w / 2, y: this.ground - this.h, w: this.w, h: this.h }; }
    update(dt, p, L) {
      this.t += dt; this.st += dt;
      if (this.dead) { if (this.st > 0.8) this.gone = true; return; }
      const dx = p.cx - this.x, near = Math.abs(dx) < 230 && Math.abs(p.bottom - this.ground) < 60 && !p.dead;
      if (this.state === 'crawl') {
        this.x += this.dir * 45 * dt;
        if (this.x < this.x0) { this.x = this.x0; this.dir = 1; }
        if (this.x > this.x1) { this.x = this.x1; this.dir = -1; }
        if (near && this.st > 1.2) { this.state = 'warn'; this.st = 0; this.dir = Math.sign(dx) || 1; }
      } else if (this.state === 'warn') {
        if (this.st > 0.45) { this.state = 'lunge'; this.st = 0; }
      } else if (this.state === 'lunge') {
        this.x = E.clamp(this.x + this.dir * 190 * dt, this.x0 - 40, this.x1 + 40);
        if (this.st > 0.55) { this.state = 'crawl'; this.st = 0; }
      }
      // va chạm với Nam
      const b = this.box();
      if (E.overlap(p, b)) {
        if (p.vy > 60 && p.bottom - b.y < 26) {
          this.dead = true; this.st = 0; p.vy = -560; L.score += 1;
          E.spawnFx('fx_mud', this.x, this.ground + 4, { scale: 0.4 });
          L.sound && L.sound('stomp');
        } else if (p.hurt(this.x, L)) { L.toast('Đỉa bám! Nhảy lên đầu đỉa để hạ nó.'); }
      }
    }
    draw(ctx) {
      const flip = this.dir < 0;
      if (this.dead) return E.drawFrame(ctx, 'leech_dead', Math.min(3, Math.floor(this.st * 6)), this.x, this.ground + 6, 0.62, flip, Math.max(0, 1 - this.st));
      let f = Math.floor(this.t * 7) % 4;
      if (this.state === 'warn') f = 2;
      if (this.state === 'lunge') f = 4 + Math.floor(this.t * 12) % 4;
      E.drawFrame(ctx, 'leech_crawl', f, this.x, this.ground + 6, 0.62, flip);
      if (this.state === 'warn') { ctx.fillStyle = '#F26B38'; ctx.font = '700 26px "Be Vietnam Pro",sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', this.x, this.ground - 52); }
    }
  };

  // ---------- Cá sấu trong khúc sông: bong bóng báo trước 1s rồi lao lên ----------
  E.Croc = class {
    constructor(x0, x1, water) {
      this.x0 = x0; this.x1 = x1; this.water = water; this.x = (x0 + x1) / 2;
      this.state = 'lurk'; this.st = 0; this.cool = 1.5; this.target = this.x; this.t = 0; this.dir = 1;
    }
    update(dt, p, L) {
      this.t += dt; this.st += dt; this.cool -= dt;
      const above = p.cx > this.x0 - 40 && p.cx < this.x1 + 40 && !p.dead;
      if (this.state === 'lurk') {
        const goal = above ? p.cx : (this.x0 + this.x1) / 2 + Math.sin(this.t * 0.6) * (this.x1 - this.x0) * 0.35;
        this.dir = Math.sign(goal - this.x) || this.dir;
        this.x += E.clamp(goal - this.x, -120 * dt, 120 * dt);
        if (above && this.cool <= 0) { this.state = 'warn'; this.st = 0; L.sound && L.sound('bubble'); this.target = E.clamp(p.cx + p.vx * 0.6, this.x0 + 60, this.x1 - 60); }
      } else if (this.state === 'warn') {
        if (Math.floor(this.st * 8) !== Math.floor((this.st - dt) * 8)) E.spawnFx('fx_bubbles', this.target + (Math.random() - 0.5) * 70, this.water + 10, { scale: 0.7, fps: 10 });
        if (this.st > 1.0) { this.state = 'lunge'; this.st = 0; this.x = this.target; E.spawnFx('fx_splash', this.x, this.water + 30, { scale: 1.1 }); L.shake = 0.2; L.sound && L.sound('lunge'); }
      } else if (this.state === 'lunge') {
        const hit = { x: this.x - 110, y: this.water - 210, w: 220, h: 230 };
        if (this.st < 0.55 && E.overlap(p, hit) && p.hurt(this.x, L)) L.toast('Cá sấu! Thấy bong bóng là phải nhảy đi ngay.');
        if (this.st > 0.75) { this.state = 'retreat'; this.st = 0; L.sound && L.sound('retreat'); }
      } else if (this.state === 'retreat') {
        if (this.st > 0.6) { this.state = 'lurk'; this.st = 0; this.cool = 1.6 + Math.random(); }
      }
    }
    draw(ctx) {
      if (this.state === 'warn') {
        // mắt và mõm nhô lên ở điểm sắp lao (khung cảnh báo)
        E.drawFrame(ctx, 'croc_warn', Math.min(3, Math.floor(this.st * 4)), this.target, this.water + 34, 0.8, this.dir < 0);
      } else if (this.state === 'lunge') {
        const f = this.st < 0.08 ? 0 : this.st < 0.2 ? 1 : this.st < 0.5 ? 2 : 3;
        E.drawFrame(ctx, 'croc_attack', f, this.x, this.water + 40, 0.95, this.dir < 0);
      } else if (this.state === 'retreat') {
        E.drawFrame(ctx, 'croc_retreat', Math.min(2, Math.floor(this.st * 5)), this.x, this.water + 70, 0.55, this.dir < 0, 1 - this.st / 0.6);
      } else {
        // chỉ lưng và mắt lộ trên mặt nước
        ctx.save(); ctx.beginPath(); ctx.rect(this.x - 300, 0, 600, this.water + 8); ctx.clip();
        E.drawFrame(ctx, 'croc_swim', Math.floor(this.t * 6), this.x, this.water + 52 + Math.sin(this.t * 2) * 3, 0.58, this.dir < 0, 0.95);
        ctx.restore();
        if (Math.floor(this.t * 2) !== Math.floor((this.t - 0.016) * 2)) E.spawnFx('fx_ripple', this.x, this.water + 10, { scale: 0.5, fps: 8 });
      }
    }
  };

  // ---------- Khúc gỗ trôi: bệ đứng nhấp nhô ----------
  E.Log = class {
    constructor(x, water, phase = 0) {
      this.bx = x; this.water = water; this.phase = phase;
      this.solid = { x: x - 100, y: water - 18, w: 200, h: 20, oneWay: true, moving: true, dx: 0, top: water - 18 };
      this.t = phase;
    }
    update(dt) {
      this.t += dt;
      const y = this.water - 18 + Math.sin(this.t * 2.2) * 5;
      this.solid.dy = y - this.solid.y; this.solid.y = y; this.solid.top = y; this.solid.dx = 0;
    }
    draw(ctx) { E.drawImg(ctx, 'prop_driftlog', this.bx - 125, this.solid.y - 36, 0.5); }
  };

  // ---------- Vật phẩm ----------
  E.Item = class {
    constructor(kind, x, y) { this.kind = kind; this.x = x; this.y = y; this.t = Math.random() * 6; this.taken = false; }
    update(dt, p, L) {
      this.t += dt;
      if (this.taken) return;
      const b = { x: this.x - 22, y: this.y - 22, w: 44, h: 44 };
      if (E.overlap(p, b) && !p.dead) {
        this.taken = true; E.spawnFx('fx_sparkle', this.x, this.y, { scale: 0.9 });
        if (this.kind === 'gourd') { p.hp = Math.min(p.maxHp, p.hp + 1); L.toast('Bầu nước: hồi 1 sức.'); }
        else if (this.kind === 'page') { L.pages += 1; L.pageGot.push(this.pi); L.toast(`Mảnh nhật ký ${L.pages}/${L.pagesTotal}!`); E.spawnFx('fx_sparkle', this.x, this.y, { scale: 1.4 }); }
        else L.rice += 1;
        L.sound && L.sound(this.kind === 'rice' ? 'pick' : 'gourd');
      }
    }
    draw(ctx) {
      if (this.taken) return;
      const y = this.y + Math.sin(this.t * 3) * 6;
      if (this.kind === 'page') {
        // mảnh nhật ký: quầng sáng vàng để nhìn thấy từ xa
        const r = 34 + Math.sin(this.t * 4) * 5, g = ctx.createRadialGradient(this.x, y, 4, this.x, y, r);
        g.addColorStop(0, 'rgba(255,226,120,.85)'); g.addColorStop(1, 'rgba(255,226,120,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, y, r, 0, 7); ctx.fill();
        return E.drawFrame(ctx, 'item_page', 0, this.x, y, 0.32);
      }
      E.drawFrame(ctx, this.kind === 'gourd' ? 'item_gourd' : 'item_riceball', 0, this.x, y, this.kind === 'gourd' ? 0.55 : 0.5);
    }
  };

  // ---------- Cọc tre = điểm lưu ----------
  E.Checkpoint = class {
    constructor(x, y) { this.x = x; this.y = y; this.on = false; }
    update(dt, p, L) {
      if (!this.on && Math.abs(p.cx - this.x) < 40 && !p.dead) {
        this.on = true; L.checkpoint = { x: this.x, y: this.y };
        E.spawnFx('fx_sparkle', this.x, this.y - 70, { scale: 1.1 }); L.toast('Đã lưu điểm hồi sinh.'); L.sound && L.sound('checkpoint');
      }
    }
    draw(ctx) {
      E.drawImg(ctx, 'prop_stakes', this.x - 63, this.y - 78, 0.5);
      if (this.on) { ctx.fillStyle = '#FFD25A'; ctx.beginPath(); ctx.arc(this.x, this.y - 92, 7 + Math.sin(performance.now() / 200) * 2, 0, 7); ctx.fill(); }
    }
  };
})();
