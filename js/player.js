// ===== Nam – nhân vật người chơi =====
(function () {
  const E = window.DPN;
  const S = 2 / 3;                       // sprite lưu ở 1.5x → vẽ ở 2/3
  const GRAV = 2300, RUN = 340, ACC = 2600, FRIC = 2400, JUMP_V = 860, JUMP_CUT = 0.45;

  E.Player = class {
    constructor(x, y) {
      this.w = 44; this.h = 108;
      this.reset(x, y);
      this.maxHp = 3; this.hp = 3;
    }
    reset(x, y) {
      this.x = x; this.y = y - this.h; this.vx = 0; this.vy = 0;
      this.face = 1; this.onGround = false; this.coyote = 0; this.buffer = 0;
      this.state = 'idle'; this.anim = 0; this.landT = 0; this.hurtT = 0; this.inv = 0;
      this.sink = 0; this.inMud = false; this.ride = null; this.dead = false; this.win = false;
    }
    get cx() { return this.x + this.w / 2; }
    get bottom() { return this.y + this.h; }

    hurt(fromX, level) {
      if (this.inv > 0 || this.dead || this.win) return false;
      this.hp -= 1; this.inv = 1.4; this.hurtT = 0.35;
      this.vx = (this.cx < fromX ? -1 : 1) * 380; this.vy = -520; this.onGround = false;
      level.shake = 0.25;
      if (this.hp <= 0) { this.dead = true; this.anim = 0; }
      return true;
    }

    update(dt, level) {
      const inp = E.input;
      this.inv = Math.max(0, this.inv - dt); this.hurtT = Math.max(0, this.hurtT - dt);
      this.landT = Math.max(0, this.landT - dt);
      this.anim += dt;
      if (this.dead || this.win) { this.vx *= 0.9; this.applyPhysics(dt, level); return; }

      // ---- di chuyển ngang ----
      const mudK = this.inMud ? 0.45 : 1;
      let dir = (inp.down('right') ? 1 : 0) - (inp.down('left') ? 1 : 0);
      if (this.hurtT > 0) dir = 0;
      if (dir) {
        this.face = dir;
        this.vx += dir * ACC * dt;
        this.vx = E.clamp(this.vx, -RUN * mudK, RUN * mudK);
      } else if (this.hurtT <= 0) {
        const f = FRIC * dt;
        this.vx = Math.abs(this.vx) <= f ? 0 : this.vx - Math.sign(this.vx) * f;
      }

      // ---- nhảy: có coyote time + bộ đệm ----
      this.coyote = this.onGround ? 0.1 : Math.max(0, this.coyote - dt);
      this.buffer = inp.hit('jump') ? 0.12 : Math.max(0, this.buffer - dt);
      if (this.buffer > 0 && this.coyote > 0) {
        this.vy = -JUMP_V * (this.inMud ? 0.78 : 1);
        this.onGround = false; this.coyote = 0; this.buffer = 0; this.ride = null;
        E.spawnFx('fx_dust', this.cx, this.bottom, { scale: 0.55, fps: 16 });
        level.sound && level.sound('jump');
      }
      if (!inp.down('jump') && this.vy < -200) this.vy *= Math.pow(JUMP_CUT, dt * 20);

      this.applyPhysics(dt, level);

      // ---- bùn lún ----
      const mud = this.onGround && level.mudAt(this.cx);
      if (mud && !this.inMud) { E.spawnFx('fx_mud', this.cx, this.bottom + 6, { scale: 0.45 }); level.sound && level.sound('mud'); }
      this.inMud = !!mud;
      // tiếng bước chân
      this.stepT = (this.stepT || 0) - dt;
      if (this.onGround && Math.abs(this.vx) > 60 && this.stepT <= 0) { this.stepT = this.inMud ? 0.3 : 0.27; level.sound && level.sound(this.inMud ? 'step_mud' : 'step'); }
      if (this.inMud) {
        this.sink += dt * (Math.abs(this.vx) > 40 ? 0.35 : 1);
        this.gloopT = (this.gloopT || 0) - dt;
        if (this.sink > 0.6 && this.gloopT <= 0) { this.gloopT = 0.55; level.sound && level.sound('sink'); }
        if (this.sink > 2.2) { this.sink = 0; this.hurt(this.cx + this.face * 10, level); level.toast('Bùn kéo xuống! Đi nhanh qua vùng bùn.'); }
      } else this.sink = Math.max(0, this.sink - dt * 2);
    }

    applyPhysics(dt, level) {
      const wasGround = this.onGround;
      if (this.ride) { this.x += this.ride.dx || 0; this.y = this.ride.top - this.h; }
      this.vy = Math.min(this.vy + GRAV * dt, 1400);
      // ngang
      this.x += this.vx * dt;
      for (const s of level.solids) {
        if (s.oneWay) continue;
        if (E.overlap(this, s)) {
          if (this.vx > 0) this.x = s.x - this.w; else if (this.vx < 0) this.x = s.x + s.w;
          this.vx = 0;
        }
      }
      this.x = E.clamp(this.x, 0, level.width - this.w);
      // dọc
      const prevBottom = this.bottom;
      this.y += this.vy * dt;
      this.onGround = false; this.ride = null;
      for (const s of level.solids) {
        if (this.x + this.w <= s.x + 4 || this.x >= s.x + s.w - 4) continue;
        const top = s.y;
        if (this.vy >= 0 && prevBottom <= top + 2 + (s.dy || 0) && this.bottom >= top) {
          this.y = top - this.h; this.vy = 0; this.onGround = true;
          if (s.moving) this.ride = s;
        } else if (!s.oneWay && this.vy < 0 && this.y < s.y + s.h && prevBottom > s.y + s.h) {
          this.y = s.y + s.h; this.vy = 0;
        }
      }
      if (this.onGround && !wasGround && !this.dead) {
        this.landT = 0.09;
        if (level.sound) level.sound(this.ride ? 'log' : level.mudAt(this.cx) ? 'land_mud' : 'land');
        E.spawnFx('fx_dust', this.cx, this.bottom, { scale: 0.5, fps: 18 });
      }
    }

    draw(ctx) {
      let key = 'nam_idle', frame = Math.floor(this.anim * 5), flip = this.face < 0;
      if (this.dead) { key = 'nam_faint'; frame = Math.min(2, Math.floor(this.anim * 6)); }
      else if (this.win) { key = 'nam_victory'; frame = Math.min(3, Math.floor(this.anim * 6)); flip = false; }
      else if (this.hurtT > 0) { key = 'nam_hurt'; frame = Math.min(3, Math.floor((0.35 - this.hurtT) * 12)); }
      else if (!this.onGround) {
        key = 'nam_jump';
        frame = this.vy < -450 ? 1 : this.vy < -120 ? 2 : this.vy < 150 ? 3 : this.vy < 600 ? 4 : 5;
      } else if (this.landT > 0) { key = 'nam_crouch'; frame = 1; }
      else if (Math.abs(this.vx) > 20) {
        if (this.inMud) { key = 'nam_walk'; frame = Math.floor(this.anim * 8); }
        else { key = 'nam_run'; frame = Math.floor(this.anim * 13); }
      }
      const blink = this.inv > 0 && !this.dead && Math.floor(this.inv * 14) % 2 === 0;
      const sinkPx = this.sink * 16;
      ctx.save();
      if (sinkPx > 0) { ctx.beginPath(); ctx.rect(this.cx - 200, this.y - 200, 400, this.h + 200 - 2); ctx.clip(); }
      E.drawFrame(ctx, key, frame, this.cx, this.bottom + 4 + sinkPx, S, flip, blink ? 0.35 : 1);
      ctx.restore();
    }
  };
})();
