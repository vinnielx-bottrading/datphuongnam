// ===== Âm thanh tạo bằng code (WebAudio), dùng tạm đến khi có file âm thanh thật (nhóm 1S) =====
// E.sfx.play(tên)   : hiệu ứng ngắn, theo công tắc "Hiệu ứng âm thanh"
// E.sfx.ambience(k) : âm nền lặp khi đang chơi (nước, gió lau, chim, côn trùng), theo công tắc "Nhạc nền"
(function () {
  const E = window.DPN;
  let ac = null, master, sfxBus, ambBus, noiseBuf = null;
  const sfxOn = () => !(E.progress && E.progress.sound === false);
  const ambOn = () => !(E.progress && E.progress.music === false);

  function init() {
    if (ac) return ac;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    sfxBus = ac.createGain(); sfxBus.gain.value = 0.7; sfxBus.connect(master);
    ambBus = ac.createGain(); ambBus.gain.value = 0; ambBus.connect(master);
    const n = ac.sampleRate * 2; noiseBuf = ac.createBuffer(1, n, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return ac;
  }
  const resume = () => { if (ac && ac.state === 'suspended') ac.resume(); };
  for (const ev of ['pointerdown', 'keydown', 'touchend']) addEventListener(ev, () => { init(); resume(); }, true);

  // ---------- khối dựng âm ----------
  const R = (a, b) => a + Math.random() * (b - a);
  function env(g, t, a, peak, dec) {
    g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }
  function tone(t, { type = 'sine', f0, f1 = f0, dur = 0.15, vol = 0.3, a = 0.005, out = sfxBus, curve = 'exp' }) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1 !== f0) curve === 'exp' ? o.frequency.exponentialRampToValueAtTime(f1, t + dur) : o.frequency.linearRampToValueAtTime(f1, t + dur);
    env(g, t, a, vol, dur); o.connect(g).connect(out); o.start(t); o.stop(t + a + dur + 0.05);
  }
  function noise(t, { dur = 0.2, vol = 0.3, a = 0.005, type = 'lowpass', f0 = 1200, f1 = f0, q = 0.8, out = sfxBus }) {
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; s.loop = true; f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(f0, t); if (f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, a, vol, dur); s.connect(f).connect(g).connect(out);
    s.start(t, Math.random() * 1.5); s.stop(t + a + dur + 0.05);
  }
  // tiếng gảy dây kiểu đàn tranh
  function pluck(t, f, vol = 0.22, dur = 0.9) {
    tone(t, { type: 'triangle', f0: f, dur, vol, a: 0.003 });
    tone(t, { type: 'sine', f0: f * 2, dur: dur * 0.5, vol: vol * 0.35, a: 0.002 });
    tone(t, { type: 'sine', f0: f * 1.003, f1: f * 0.995, dur: dur * 0.3, vol: vol * 0.3, a: 0.002, curve: 'lin' });
  }
  // gõ gỗ / tre
  function knock(t, f = 900, vol = 0.35) {
    tone(t, { type: 'sine', f0: f, f1: f * 0.85, dur: 0.09, vol, a: 0.001 });
    noise(t, { type: 'bandpass', f0: f * 2.2, q: 4, dur: 0.03, vol: vol * 0.6, a: 0.001 });
  }
  function bubble(t, vol = 0.2) { const f = R(300, 700); tone(t, { type: 'sine', f0: f, f1: f * R(1.8, 2.6), dur: R(0.04, 0.09), vol, a: 0.002 }); }
  // ngũ cung: Đô Rê Fa Sol La
  const PENTA = [262, 294, 349, 392, 440, 523, 587, 698, 784, 880];

  const LIB = {
    jump(t) { noise(t, { type: 'bandpass', f0: 500, f1: 1800, q: 1.2, dur: 0.14, vol: 0.18 }); tone(t, { f0: 330, f1: 520, dur: 0.1, vol: 0.06 }); },
    land(t) { tone(t, { f0: 140, f1: 60, dur: 0.08, vol: 0.25 }); noise(t, { f0: 700, dur: 0.05, vol: 0.12 }); },
    land_mud(t) { noise(t, { f0: 400, f1: 180, q: 3, dur: 0.16, vol: 0.3 }); tone(t, { f0: 120, f1: 70, dur: 0.1, vol: 0.18 }); },
    step(t) { noise(t, { type: 'bandpass', f0: R(900, 1400), q: 1.5, dur: 0.035, vol: 0.05 }); },
    step_mud(t) { noise(t, { f0: R(300, 500), f1: 160, q: 4, dur: 0.1, vol: 0.14 }); },
    mud(t) { noise(t, { f0: 500, f1: 150, q: 3, dur: 0.3, vol: 0.3 }); for (let i = 0; i < 3; i++) bubble(t + 0.08 + i * 0.07, 0.08); },
    sink(t) { for (let i = 0; i < 4; i++) tone(t + i * 0.08, { f0: R(90, 160), f1: R(200, 320), dur: 0.07, vol: 0.12 }); },
    hurt(t) { tone(t, { type: 'triangle', f0: 300, f1: 110, dur: 0.22, vol: 0.25 }); noise(t, { f0: 900, f1: 300, dur: 0.15, vol: 0.15 }); },
    splash(t) { noise(t, { type: 'highpass', f0: 600, q: 0.5, dur: 0.5, vol: 0.32, a: 0.01 }); noise(t, { f0: 500, f1: 150, dur: 0.35, vol: 0.3 }); for (let i = 0; i < 5; i++) bubble(t + 0.15 + i * 0.06, 0.06); },
    pick(t) { pluck(t, 784, 0.16, 0.35); pluck(t + 0.07, 1046, 0.14, 0.45); noise(t, { type: 'highpass', f0: 3000, dur: 0.05, vol: 0.05 }); },
    gourd(t) { for (let i = 0; i < 4; i++) noise(t + i * 0.06, { type: 'bandpass', f0: R(400, 800), q: 6, dur: 0.06, vol: 0.12 }); [523, 659, 784, 1046].forEach((f, i) => pluck(t + 0.2 + i * 0.07, f, 0.12, 0.5)); },
    checkpoint(t) { knock(t, 760, 0.4); knock(t + 0.16, 760, 0.35); pluck(t + 0.34, 392, 0.12, 1.0); },
    stomp(t) { noise(t, { f0: 900, f1: 200, q: 5, dur: 0.12, vol: 0.25 }); tone(t, { f0: 260, f1: 90, dur: 0.1, vol: 0.15 }); },
    bubble(t) { for (let i = 0; i < 9; i++) bubble(t + i * R(0.07, 0.12), 0.16); noise(t, { f0: 300, dur: 0.9, vol: 0.06, a: 0.2 }); },
    lunge(t) { noise(t, { type: 'highpass', f0: 500, q: 0.5, dur: 0.6, vol: 0.4, a: 0.01 }); noise(t, { f0: 400, f1: 120, dur: 0.5, vol: 0.4 }); knock(t + 0.18, 420, 0.45); tone(t, { f0: 90, f1: 45, dur: 0.35, vol: 0.3 }); },
    retreat(t) { noise(t, { f0: 350, f1: 90, dur: 0.6, vol: 0.25, a: 0.05 }); for (let i = 0; i < 4; i++) tone(t + 0.1 + i * 0.1, { f0: R(70, 110), f1: R(140, 200), dur: 0.08, vol: 0.08 }); },
    log(t) { tone(t, { type: 'triangle', f0: 180, f1: 150, dur: 0.12, vol: 0.12 }); noise(t, { f0: 600, f1: 250, dur: 0.18, vol: 0.1 }); },
    win(t) { [0, 2, 3, 4, 5, 7].forEach((k, i) => pluck(t + i * 0.11, PENTA[k], 0.18, 0.9)); },
    faint(t) { [7, 5, 4, 2, 1, 0].forEach((k, i) => pluck(t + i * 0.18, PENTA[k] / 2, 0.16, 1.2)); },
    click(t) { knock(t, 980, 0.22); },
    back(t) { knock(t, 640, 0.2); }
  };

  E.sfx = {
    play(name) {
      if (!sfxOn() || !init() || !LIB[name]) return;
      resume(); LIB[name](ac.currentTime + 0.005);
    },
    ambience: setAmbience
  };

  // ---------- âm nền khi chơi ----------
  // lớp nước + gió liên tục, chim và côn trùng xen kẽ ngẫu nhiên
  const AMB = {
    day: { water: 0.22, wind: 0.08, birds: [1.5, 5], insects: 0.015, frogs: 0 },
    dusk: { water: 0.2, wind: 0.06, birds: [6, 14], insects: 0.04, frogs: 0.5 }
  };
  let amb = null, ambKey = null, timers = [];
  function loopNoise(type, f, q, vol) {
    const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noiseBuf; s.loop = true; fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.value = vol;
    // dao động chậm để nước "vỗ" theo nhịp
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = R(0.08, 0.2); lg.gain.value = vol * 0.6;
    lfo.connect(lg).connect(g.gain); lfo.start();
    s.connect(fl).connect(g).connect(ambBus); s.start();
    return [s, lfo];
  }
  function bird(t) {
    const f = R(1800, 3200), n = Math.floor(R(2, 5)), gap = R(0.08, 0.16);
    for (let i = 0; i < n; i++) tone(t + i * gap, { f0: f * R(0.95, 1.05), f1: f * R(1.2, 1.5), dur: R(0.05, 0.1), vol: R(0.03, 0.06), out: ambBus });
  }
  function frog(t) { for (let i = 0; i < Math.floor(R(2, 4)); i++) tone(t + i * 0.14, { type: 'square', f0: R(180, 240), f1: R(120, 160), dur: 0.06, vol: 0.02, out: ambBus }); }
  function schedule(fn, min, max) {
    const tick = () => { if (!amb) return; fn(ac.currentTime + 0.05); timers.push(setTimeout(tick, R(min, max) * 1000)); };
    timers.push(setTimeout(tick, R(min, max) * 500));
  }
  function setAmbience(key) {
    if (!init()) return;
    const want = key && ambOn() ? key : null;
    if (want === ambKey) return;
    const t = ac.currentTime;
    ambBus.gain.cancelScheduledValues(t); ambBus.gain.setValueAtTime(ambBus.gain.value, t);
    const had = !!amb;
    if (amb) {
      const old = amb; amb = null; timers.forEach(clearTimeout); timers = [];
      ambBus.gain.linearRampToValueAtTime(0, t + 0.6);
      setTimeout(() => old.forEach(n => { try { n.stop(); } catch (e) { } }), 700);
    }
    ambKey = want;
    if (!want) return;
    const c = AMB[want] || AMB.day;
    setTimeout(() => {
      if (ambKey !== want) return;
      resume();
      amb = [...loopNoise('lowpass', 420, 0.6, c.water), ...loopNoise('bandpass', 900, 0.4, c.wind)];
      if (c.insects) amb.push(...loopNoise('bandpass', 5200, 12, c.insects));
      const t2 = ac.currentTime; ambBus.gain.setValueAtTime(0, t2); ambBus.gain.linearRampToValueAtTime(0.55, t2 + 1.5);
      schedule(bird, c.birds[0], c.birds[1]);
      if (c.frogs) schedule(frog, 1.5, 4);
    }, had ? 700 : 0);
  }
  document.addEventListener('visibilitychange', () => { if (ac) document.hidden ? ac.suspend() : ac.resume(); });
})();
