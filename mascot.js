/* SPX Express – Thú cưng vui đùa trên màn hình giao diện trò chơi: Mèo · Khủng long · Nhện · Bươm bướm */
(() => {
'use strict';
const X = window.SPX, S = X.S;
const NAVY = '#073763';
const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.random() * a.length | 0];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const angDiff = (a, b) => { let d = b - a; while(d > Math.PI) d -= 6.2832; while(d < -Math.PI) d += 6.2832; return d; };
let cvs, c, W = 0, H = 0, dpr = 1, k = 1, kind = '', cr = null, raf = 0, last = 0, parts = [];

/* ---------- vẽ cơ bản ---------- */
const ell = (x, y, rx, ry, fill, rot = 0, stroke = NAVY, lw = 2) => { c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), rot, 0, 7); if(fill){ c.fillStyle = fill; c.fill(); } if(stroke){ c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } };
const poly = (pts, fill, stroke = NAVY, lw = 2) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.closePath(); if(fill){ c.fillStyle = fill; c.fill(); } if(stroke){ c.strokeStyle = stroke; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); } };
const limb = (pts, w, col) => { c.lineCap = 'round'; c.lineJoin = 'round'; for(const [ww, cc] of [[w + 3.2, NAVY], [w, col]]){ c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.strokeStyle = cc; c.lineWidth = ww; c.stroke(); } };
const curve = (x1, y1, a1, b1, a2, b2, x2, y2, w, col) => { c.lineCap = 'round'; for(const [ww, cc] of [[w + 3, NAVY], [w, col]]){ c.beginPath(); c.moveTo(x1, y1); c.bezierCurveTo(a1, b1, a2, b2, x2, y2); c.strokeStyle = cc; c.lineWidth = ww; c.stroke(); } };
function puff(x, y, n = 3, col = 'rgba(190,170,150,'){ for(let i = 0; i < n; i++) parts.push({ x: x + rnd(-6, 6) * k, y: y - rnd(0, 4) * k, vx: rnd(-14, 14), vy: rnd(-18, -6), r: rnd(2, 4.5) * k, t: .7, col }); }
function drawParts(dt){ parts.forEach(p => { p.t -= dt; p.x += p.vx * dt; p.y += p.vy * dt; c.beginPath(); c.arc(p.x, p.y, p.r * (1.4 - p.t), 0, 7); c.fillStyle = p.col + Math.max(0, p.t * .6) + ')'; c.fill(); }); parts = parts.filter(p => p.t > 0); }

/* ======================== MÈO ======================== */
const Cat = {
  init: () => ({ x: W * .3, dir: 1, st: 'walk', t: 0, dur: 5, ph: 0, tw: 0, bl: 0, bt: 2, jy: 0 }),
  next(o){
    const r = Math.random(); const [st, dur] = r < .34 ? ['walk', rnd(3, 7)] : r < .58 ? ['sit', rnd(3, 6)] : r < .74 ? ['groom', rnd(2.5, 4)] : r < .9 ? ['sleep', rnd(7, 12)] : ['stretch', rnd(2, 3)];
    o.st = st; o.t = 0; o.dur = dur; if(st === 'walk' && Math.random() < .5) o.dir *= -1;
  },
  update(o, dt){
    o.t += dt; o.tw += dt; o.bt -= dt; if(o.bt < 0){ o.bl = .14; o.bt = rnd(2, 5); } if(o.bl > 0) o.bl -= dt;
    if(o.st === 'walk'){ o.x += o.dir * 38 * k * dt; o.ph += dt * 8; if(o.x > W - 60 * k) o.dir = -1; if(o.x < 60 * k) o.dir = 1; if(o.t > o.dur) this.next(o); }
    else if(o.st === 'pounce'){ if(o.t >= .4){ const u = Math.min(1, (o.t - .4) / .5); o.x = o.fx + (o.tx - o.fx) * u; o.jy = -Math.sin(u * Math.PI) * 70 * k; if(u >= 1){ o.jy = 0; puff(o.x, H, 4); o.st = 'sit'; o.t = 0; o.dur = rnd(2, 4); } } }
    else if(o.t > o.dur) this.next(o);
  },
  touch(o, p){
    if(Math.abs(p.x - o.x) < 50 * k && p.y > H - 110 * k){ o.st = 'sit'; o.t = 0; o.dur = 2.5; X.tone(720, 0, .12, 'sine', .16); X.tone(520, .1, .22, 'sine', .14); return; }   // vuốt ve: kêu meo
    if(p.y > H - 260 * k && o.st !== 'pounce'){ o.dir = p.x > o.x ? 1 : -1; o.st = 'pounce'; o.t = 0; o.fx = o.x; o.tx = clamp(p.x - o.dir * 40 * k, 50 * k, W - 50 * k); o.jy = 0; }
  },
  leg(x, ph, bob, col){
    const a = Math.sin(ph) * .65, a2 = -Math.max(0, Math.sin(ph + 1.2)) * .9, hx = x, hy = -24 + bob;
    const kx = hx + Math.sin(a) * 11, ky = hy + Math.cos(a) * 11, px = kx + Math.sin(a + a2) * 11, py = Math.min(0, ky + Math.cos(a + a2) * 11);
    limb([[hx, hy], [kx, ky], [px, py]], 5, col); ell(px + 2, py - 1, 4.5, 2.6, '#fff3e6', 0, NAVY, 1.5);
  },
  head(x, y, bl, look = 0){
    poly([[x - 8, y - 6], [x - 6, y - 21], [x + 3, y - 9]], '#f2a066'); poly([[x + 3, y - 9], [x + 11, y - 20], [x + 12, y - 5]], '#f2a066');
    poly([[x - 6, y - 9], [x - 5, y - 16], [x, y - 10]], '#ffb3b3', null); poly([[x + 5, y - 10], [x + 9, y - 16], [x + 10, y - 8]], '#ffb3b3', null);
    ell(x, y, 12, 10.5, '#f2a066'); ell(x + 4, y + 5, 7, 4.5, '#fff3e6', 0, null);
    if(bl > 0) { c.strokeStyle = NAVY; c.lineWidth = 1.8; c.beginPath(); c.moveTo(x + 4 + look, y - 2); c.lineTo(x + 10 + look, y - 2); c.stroke(); } else { ell(x + 7 + look, y - 2, 2, 2.6, NAVY, 0, null); ell(x + 7.8 + look, y - 3, .7, .7, '#fff', 0, null); }
    poly([[x + 11, y + 1.5], [x + 15, y + 1.5], [x + 13, y + 4]], '#ff7aa8', NAVY, 1);
    c.strokeStyle = NAVY; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 13, y + 3); c.lineTo(x + 24, y); c.moveTo(x + 13, y + 4); c.lineTo(x + 24, y + 5); c.moveTo(x + 8, y + 6); c.quadraticCurveTo(x + 11, y + 8, x + 14, y + 6); c.stroke();
  },
  tailW(o, base){ const sw = Math.sin(o.tw * 3); curve(-24, -32 + base, -40, -34 + base, -46, -48 + sw * 8 + base, -38, -62 + sw * 10 + base, 5, '#f2a066'); },
  walk(o, ph, squat = 0){
    const bob = Math.abs(Math.sin(ph)) * -1.6 + squat; this.leg(13, ph + Math.PI, bob, '#d08a55'); this.leg(-14, ph, bob, '#d08a55'); this.tailW(o, bob);
    ell(0, -30 + bob, 26, 13 - squat * .3, '#f2a066'); c.strokeStyle = '#c8642b'; c.lineWidth = 2.2; c.lineCap = 'round';
    for(const sx of [-12, -3, 7]){ c.beginPath(); c.moveTo(sx, -42 + bob); c.lineTo(sx + 2, -34 + bob); c.stroke(); }
    this.leg(16, ph, bob, '#f2a066'); this.leg(-16, ph + Math.PI, bob, '#f2a066'); this.head(28, -40 + bob * .6, o.bl);
  },
  sit(o, groom){
    const sw = Math.abs(Math.sin(o.tw * 2)); curve(-12, -8, -36, -4, -30, 1, -6 + sw * 3, -2 - sw * 7, 5, '#f2a066');
    ell(-4, -14, 16, 13, '#f2a066'); ell(4, -30, 12, 22, '#f2a066', -.1); ell(7, -22, 7, 14, '#fff3e6', -.1, null);
    limb([[15, -22], [15, -3]], 5, '#d08a55'); ell(16, -1.5, 5, 3, '#fff3e6', 0, NAVY, 1.5);
    if(groom){ const b = Math.sin(o.t * 11) * 2; limb([[10, -24], [18, -40], [20 + b, -50]], 5, '#f2a066'); this.head(10, -52 + b * .4, 0, 0); }
    else { limb([[10, -22], [10, -3]], 5, '#f2a066'); ell(11, -1.5, 5, 3, '#fff3e6', 0, NAVY, 1.5); this.head(8, -58, o.bl); }
  },
  sleep(o){
    const br = Math.sin(o.tw * 2) * 1.2; curve(-26, -6, -30, 4, 10, 6, 24, -4, 5, '#f2a066'); ell(0, -13 + br * .4, 28, 13 + br, '#f2a066'); ell(22, -12, 11, 10, '#f2a066');
    poly([[15, -19], [18, -29], [24, -20]], '#f2a066'); c.strokeStyle = NAVY; c.lineWidth = 1.8; c.beginPath(); c.arc(26, -12, 3, .2, 2.9); c.stroke();
    c.save(); c.setTransform(dpr * 1, 0, 0, dpr * 1, 0, 0); c.restore();
  },
  draw(o){
    c.save(); c.translate(o.x, H - 2); c.scale(o.dir * k, k);
    if(o.st === 'walk') this.walk(o, o.ph);
    else if(o.st === 'sit') this.sit(o, false); else if(o.st === 'groom') this.sit(o, true); else if(o.st === 'sleep') this.sleep(o);
    else if(o.st === 'stretch'){ c.translate(-16, -24); c.rotate(.2); c.translate(16, 24); this.walk(o, 0); }
    else if(o.st === 'pounce'){ if(o.t < .4){ c.translate(Math.sin(o.t * 40) * .8, 0); this.walk(o, 0, 5); } else { c.translate(0, o.jy / k); c.rotate(-.35 + (o.t - .4) * .9); this.walk(o, 1.57); } }
    c.restore();
    if(o.st === 'sleep'){ c.fillStyle = 'rgba(80,120,170,.85)'; c.font = '800 ' + 14 * k + 'px Montserrat,sans-serif'; for(let i = 0; i < 3; i++){ const u = (o.tw * .5 + i / 3) % 1; c.globalAlpha = 1 - u; c.fillText('z', o.x + o.dir * (26 + u * 22) * k, H - (34 + u * 46) * k); } c.globalAlpha = 1; }
  }
};

/* ======================== KHỦNG LONG ======================== */
const Dino = {
  init: () => ({ x: W * .72, dir: -1, st: 'walk', t: 0, dur: 6, ph: 0, jaw: 0, tw: 0, step: 0, waves: [], bl: 0, bt: 2 }),
  next(o){ const r = Math.random(); if(r < .5){ o.st = 'walk'; o.dur = rnd(4, 8); if(Math.random() < .5) o.dir *= -1; } else if(r < .8){ o.st = 'idle'; o.dur = rnd(2.5, 5); } else { this.roar(o); return; } o.t = 0; },
  roar(o){ o.st = 'roar'; o.t = 0; o.dur = 1.7; X.tone(95, 0, .6, 'sawtooth', .2); X.tone(70, .12, .5, 'square', .12); o.waves = [0, .3, .6]; },
  update(o, dt){
    o.t += dt; o.tw += dt; o.bt -= dt; if(o.bt < 0){ o.bl = .13; o.bt = rnd(2, 5); } if(o.bl > 0) o.bl -= dt;
    if(o.st === 'walk'){
      o.x += o.dir * 32 * k * dt; o.ph += dt * 5.2; const s = Math.floor(o.ph / Math.PI); if(s !== o.step){ o.step = s; puff(o.x + o.dir * ((s % 2 ? -8 : 10)) * k, H - 2, 3); }
      if(o.x > W - 80 * k) o.dir = -1; if(o.x < 80 * k) o.dir = 1; if(o.t > o.dur) this.next(o);
    } else if(o.st === 'roar'){ const u = o.t / o.dur; o.jaw = Math.sin(Math.min(1, u * 1.6) * Math.PI) * 1; o.waves = o.waves.map(w => w + dt * 1.1); if(o.t > o.dur){ o.jaw = 0; o.st = 'idle'; o.t = 0; o.dur = 3; } }
    else if(o.t > o.dur) this.next(o);
    if(o.st !== 'roar') o.jaw = Math.max(0, o.jaw - dt * 3);
  },
  touch(o, p){ if(Math.abs(p.x - o.x) < 110 * k && p.y > H - 170 * k && o.st !== 'roar'){ o.dir = p.x > o.x ? 1 : -1; this.roar(o); } },
  leg(o, ph, col){
    const hx = -6, hy = -34, fx = hx + Math.sin(ph) * 17, fy = -Math.max(0, Math.cos(ph)) * 11, kx = (hx + fx) / 2 + 9, ky = (hy + fy) / 2 - 2;
    limb([[hx, hy], [kx, ky], [fx, fy]], 11, col); ell(fx + 6, fy - 1, 8, 3.4, col, 0, NAVY, 1.8);
  },
  draw(o){
    c.save(); c.translate(o.x, H - 2); c.scale(o.dir * k, k);
    const walking = o.st === 'walk', ph = o.ph, bob = walking ? Math.abs(Math.sin(ph)) * -2.4 : Math.sin(o.tw * 2) * .9, sw = Math.sin(o.tw * (walking ? 3 : 1.4)) * (walking ? 8 : 4);
    const lean = o.st === 'roar' ? -.12 * Math.sin(Math.min(1, o.t / o.dur * 1.6) * Math.PI) : 0;
    c.translate(0, bob); c.rotate(lean);
    // đuôi
    c.beginPath(); c.moveTo(-26, -62); c.bezierCurveTo(-52, -64, -78, -50 + sw, -92, -38 + sw); c.bezierCurveTo(-72, -40 + sw * .6, -50, -34, -28, -34); c.closePath(); c.fillStyle = '#2fb27a'; c.fill(); c.strokeStyle = NAVY; c.lineWidth = 2; c.lineJoin = 'round'; c.stroke();
    this.leg(o, ph + Math.PI, '#23996a');
    ell(0, -50, 35, 26, '#2fb27a', -.1); ell(6, -40, 24, 15, '#cdf3dd', -.1, null);
    for(let i = 0; i < 5; i++){ const sx = -26 + i * 11, sy = -72 - Math.sin(i / 4 * 3) * 4 + i * .8; poly([[sx - 5, sy + 4], [sx, sy - 9], [sx + 5, sy + 4]], '#ff7a4d', NAVY, 1.6); }
    // đầu
    ell(20, -62, 15, 21, '#2fb27a', .5); c.save(); c.translate(27, -76); c.rotate(-.04 + lean * -1.2 + (o.st === 'roar' ? -.25 * o.jaw : 0));
    const j = o.jaw; ell(24 + 0, 2, 17, 6.5, '#27a070', j * .55, NAVY, 2); // hàm dưới
    c.save(); c.translate(8, 6); c.rotate(j * .6); c.translate(-8, -6); ell(22, 6 + j * 6, 17, 5.8, '#27a070'); for(let t = 0; t < 4; t++) poly([[14 + t * 6, 2 + j * 6], [16.5 + t * 6, -2 + j * 6], [19 + t * 6, 2 + j * 6]], '#fff', null); c.restore();
    ell(20, -4, 22, 14, '#2fb27a'); for(let t = 0; t < 4; t++) poly([[14 + t * 6, 7], [16.5 + t * 6, 11], [19 + t * 6, 7]], '#fff', NAVY, .8);
    ell(40, -8, 3, 2.2, NAVY, 0, null); ell(18, -8, 6, 6, '#fff'); if(o.bl > 0){ c.strokeStyle = NAVY; c.lineWidth = 2; c.beginPath(); c.moveTo(13, -8); c.lineTo(23, -8); c.stroke(); } else ell(20, -8, 2.7, 3.6, NAVY, 0, null);
    ell(6, 0, 4.5, 3, '#ff9aa8', 0, null); c.restore();
    // tay + chân
    limb([[24, -54], [32, -48], [36, -44]], 5, '#2fb27a'); c.strokeStyle = NAVY; c.lineWidth = 1.4; c.beginPath(); c.moveTo(36, -44); c.lineTo(40, -42); c.moveTo(36, -44); c.lineTo(40, -46); c.stroke();
    this.leg(o, ph, '#2fb27a');
    c.restore();
    if(o.st === 'roar') o.waves.forEach(w => { if(w > 0 && w < 1.6){ c.strokeStyle = `rgba(238,78,44,${Math.max(0, .7 - w * .45)})`; c.lineWidth = 3; c.beginPath(); c.arc(o.x + o.dir * 70 * k, H - 84 * k, (10 + w * 52) * k, o.dir > 0 ? -1.1 : Math.PI - 1.1, o.dir > 0 ? 1.1 : Math.PI + 1.1); c.stroke(); } });
  }
};

/* ======================== NHỆN (nhìn từ trên xuống) ======================== */
const HOME = [[26, 20, 10, 5], [12, 28, 5, 6], [-4, 29, 0, 6], [-20, 23, -6, 5]];
const Spider = {
  init(){
    const o = { x: rnd(80, W - 80), y: rnd(80, H - 80), a: rnd(0, 6.28), st: 'wander', t: 0, dur: 1.2, sp: 0, tx: rnd(60, W - 60), ty: rnd(60, H - 60), feet: [], tw: 0, flee: 0 };
    for(let i = 0; i < 8; i++){ const p = this.target(o, i, 0); o.feet.push({ x: p[0], y: p[1], s: 0, fx: 0, fy: 0, tx: 0, ty: 0 }); }
    return o;
  },
  target(o, i, lead){ const j = i % 4, side = i < 4 ? -1 : 1, h = HOME[j], fx = Math.cos(o.a), fy = Math.sin(o.a), rx = -fy, ry = fx, u = h[0] * k + lead, v = h[1] * k * side; return [o.x + fx * u + rx * v, o.y + fy * u + ry * v]; },
  hip(o, i){ const j = i % 4, side = i < 4 ? -1 : 1, h = HOME[j], fx = Math.cos(o.a), fy = Math.sin(o.a), rx = -fy, ry = fx, u = h[2] * k, v = h[3] * k * side; return [o.x + fx * u + rx * v, o.y + fy * u + ry * v]; },
  update(o, dt){
    o.t += dt; o.tw += dt; let want = 0;
    if(o.flee > 0){ o.flee -= dt; want = 230; o.st = 'flee'; } else if(o.st === 'flee'){ o.st = 'pause'; o.t = 0; o.dur = rnd(.6, 1.2); }
    if(o.st === 'wander'){ want = 62; if(o.t > o.dur){ o.st = 'pause'; o.t = 0; o.dur = rnd(.6, 1.6); } if(Math.hypot(o.tx - o.x, o.ty - o.y) < 30){ o.tx = rnd(60, W - 60); o.ty = rnd(60, H - 60); } }
    else if(o.st === 'pause'){ want = 0; if(o.t > o.dur){ o.st = 'wander'; o.t = 0; o.dur = rnd(.9, 2); if(Math.random() < .5){ o.tx = rnd(60, W - 60); o.ty = rnd(60, H - 60); } } }
    const ta = Math.atan2(o.ty - o.y, o.tx - o.x); o.a += clamp(angDiff(o.a, ta), -1, 1) * Math.min(1, (o.st === 'flee' ? 9 : 4) * dt) * 1.0;
    o.sp += (want * k - o.sp) * Math.min(1, 8 * dt);
    o.x += Math.cos(o.a) * o.sp * dt; o.y += Math.sin(o.a) * o.sp * dt;
    if(o.x < 30 || o.x > W - 30 || o.y < 30 || o.y > H - 30){ o.tx = W / 2 + rnd(-80, 80); o.ty = H / 2 + rnd(-80, 80); o.x = clamp(o.x, 20, W - 20); o.y = clamp(o.y, 20, H - 20); }
    // bước chân (dáng đi tetrapod)
    const dur = clamp(.2 - o.sp * .0004, .07, .2), moving = o.sp > 6;
    const stepping = g => o.feet.some((f, i) => f.s > 0 && ((i % 4) + (i < 4 ? 0 : 1)) % 2 === g);
    o.feet.forEach((f, i) => {
      const g = ((i % 4) + (i < 4 ? 0 : 1)) % 2;
      if(f.s > 0){ f.s += dt / dur; if(f.s >= 1){ f.s = 0; f.x = f.tx; f.y = f.ty; } return; }
      const T = this.target(o, i, o.sp * .13); if(Math.hypot(T[0] - f.x, T[1] - f.y) > 20 * k * (moving ? 1 : 1.5) && !stepping(1 - g)){ f.s = .001; f.fx = f.x; f.fy = f.y; f.tx = T[0]; f.ty = T[1]; }
    });
    if(o.st === 'pause' && !moving){ const f = o.feet[0], f2 = o.feet[4]; if(f.s === 0 && Math.sin(o.tw * 6) > .96){ const T = this.target(o, 0, 8 * k); f.s = .001; f.fx = f.x; f.fy = f.y; f.tx = T[0]; f.ty = T[1]; } if(f2.s === 0 && Math.sin(o.tw * 6 + 2) > .96){ const T = this.target(o, 4, 8 * k); f2.s = .001; f2.fx = f2.x; f2.fy = f2.y; f2.tx = T[0]; f2.ty = T[1]; } }
  },
  touch(o, p){ if(Math.hypot(p.x - o.x, p.y - o.y) < 200 * k){ const a = Math.atan2(o.y - p.y, o.x - p.x); o.tx = o.x + Math.cos(a) * 400; o.ty = o.y + Math.sin(a) * 400; o.flee = 1.1; o.t = 0; } },
  draw(o){
    const L1 = 17 * k, L2 = 23 * k;
    o.feet.forEach((f, i) => {
      let fx = f.x, fy = f.y, lift = 0; if(f.s > 0){ const u = Math.min(1, f.s); fx = f.fx + (f.tx - f.fx) * u; fy = f.fy + (f.ty - f.fy) * u; lift = Math.sin(u * Math.PI); }
      const [hx, hy] = this.hip(o, i), side = i < 4 ? -1 : 1, dx = fx - hx, dy = fy - hy, dist = Math.hypot(dx, dy) || 1, d = Math.min(dist, L1 + L2 - .5), ux = dx / dist, uy = dy / dist;
      const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a)) * (1 + lift * .5), rx = -Math.sin(o.a) * side, ry = Math.cos(o.a) * side;
      const kx = hx + ux * a + rx * h, ky = hy + uy * a + ry * h, ex = hx + ux * d, ey = hy + uy * d;
      c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(hx, hy); c.lineTo(kx, ky); c.lineTo(ex, ey); c.strokeStyle = '#0d2543'; c.lineWidth = 2.6 * k + lift; c.stroke();
      c.beginPath(); c.arc(kx, ky, 1.6 * k, 0, 7); c.fillStyle = '#EE4E2C'; c.fill();
    });
    c.save(); c.translate(o.x, o.y); c.rotate(o.a); c.scale(k, k);
    const bob = Math.sin(o.tw * (o.sp > 6 ? 14 : 2)) * .6;
    ell(-15, bob, 16, 12.5, '#12294d'); c.fillStyle = '#EE4E2C'; poly([[-22, bob - 4], [-12, bob], [-22, bob + 4]], '#EE4E2C', null); poly([[-10, bob - 4], [-2, bob], [-10, bob + 4]], '#EE4E2C', null); ell(-15, bob, 3, 3, '#ff7a4d', 0, null);
    ell(6, 0, 9.500, 8.500, '#1c3b63'); ell(13, -3, 1.8, 1.8, '#fff', 0, null); ell(13, 3, 1.8, 1.8, '#fff', 0, null); ell(15.500, -1.5, 1, 1, '#fff', 0, null); ell(15.500, 1.5, 1, 1, '#fff', 0, null);
    c.strokeStyle = NAVY; c.lineWidth = 1.6; c.beginPath(); c.moveTo(14, -4.5); c.lineTo(20, -3); c.moveTo(14, 4.5); c.lineTo(20, 3); c.stroke();
    c.restore();
  }
};

/* ======================== BƯƠM BƯỚM ======================== */
const Fly = {
  init: () => ({ x: rnd(60, W - 60), y: rnd(60, H - 60), a: rnd(0, 6.28), sp: 60, ph: 0, st: 'fly', t: 0, dur: 5, tx: rnd(60, W - 60), ty: rnd(60, H - 60), tp: rnd(0, 6), fol: 0 }),
  update(o, dt){
    o.t += dt;
    if(o.st === 'rest'){ o.ph += dt * 2; o.sp = 0; if(o.t > o.dur){ o.st = 'fly'; o.t = 0; o.tx = rnd(60, W - 60); o.ty = rnd(60, H - 60); o.sp = 40; } return; }
    o.ph += dt * (o.st === 'follow' ? 15 : 12 + Math.sin(o.t * 2) * 3);
    const want = Math.atan2(o.ty - o.y, o.tx - o.x) + Math.sin(o.t * 3 + o.tp) * .75 * (Math.hypot(o.tx - o.x, o.ty - o.y) > 90 ? 1 : .2);
    o.a += clamp(angDiff(o.a, want), -2.6 * dt * 2, 2.6 * dt * 2); const target = (o.st === 'follow' ? 55 : 65) + Math.sin(o.t * 5 + o.tp) * 24; o.sp += (target - o.sp) * Math.min(1, 3 * dt);
    o.x += Math.cos(o.a) * o.sp * dt; o.y += Math.sin(o.a) * o.sp * dt + Math.sin(o.t * 6) * 14 * dt;
    if(o.x < 10 || o.x > W - 10 || o.y < 10 || o.y > H - 10){ o.tx = W / 2 + rnd(-120, 120); o.ty = H / 2 + rnd(-90, 90); o.x = clamp(o.x, 6, W - 6); o.y = clamp(o.y, 6, H - 6); }
    if(Math.hypot(o.tx - o.x, o.ty - o.y) < 26){
      if(o.st === 'follow'){ o.fol -= dt * 20; if(o.fol <= 0){ o.st = 'rest'; o.t = 0; o.dur = rnd(3, 6); } else { o.tx += rnd(-60, 60); o.ty += rnd(-60, 60); } }
      else if(Math.random() < .45){ o.st = 'rest'; o.t = 0; o.dur = rnd(3, 7); } else { o.tx = rnd(60, W - 60); o.ty = rnd(60, H - 60); }
    }
  },
  touch(o, p){ if(Math.hypot(p.x - o.x, p.y - o.y) > 280 * k) return; o.st = 'follow'; o.tx = p.x; o.ty = p.y; o.fol = 6; o.t = 0; X.tone(1320, 0, .08, 'sine', .1); X.tone(1760, .07, .1, 'sine', .08); },
  draw(o){
    c.save(); c.translate(o.x, o.y); c.rotate(o.a + Math.PI / 2); c.scale(k, k);
    if(o.st !== 'rest'){ c.save(); c.translate(7, 12); ell(0, 0, 14, 5, 'rgba(0,0,0,.1)', 0, null); c.restore(); }
    const w = o.st === 'rest' ? .3 + .7 * Math.abs(Math.cos(o.ph)) : .12 + .88 * Math.abs(Math.cos(o.ph));
    for(const side of [1, -1]){
      c.save(); c.scale(side * w, 1);
      const g = c.createLinearGradient(0, -30, 34, 20); g.addColorStop(0, '#ff9a5c'); g.addColorStop(.6, '#EE4E2C'); g.addColorStop(1, '#c93a1c');
      c.beginPath(); c.moveTo(0, -4); c.bezierCurveTo(10, -32, 38, -36, 36, -12); c.bezierCurveTo(34, -2, 14, -1, 0, -2); c.closePath(); c.fillStyle = g; c.fill(); c.strokeStyle = NAVY; c.lineWidth = 2.2; c.stroke();
      c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(16, 2, 32, 8, 25, 25); c.bezierCurveTo(18, 33, 6, 23, 0, 9); c.closePath(); c.fillStyle = '#ff7a4d'; c.fill(); c.stroke();
      c.strokeStyle = 'rgba(7,55,99,.55)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(2, -4); c.lineTo(26, -22); c.moveTo(2, -3); c.lineTo(32, -10); c.moveTo(2, 2); c.lineTo(20, 18); c.stroke();
      c.fillStyle = '#fff'; for(const [px, py, pr] of [[27, -24, 2.6], [32, -14, 2], [21, 22, 2.2]]){ c.beginPath(); c.arc(px, py, pr, 0, 7); c.fill(); }
      c.restore();
    }
    ell(0, 2, 2.8, 11, NAVY, 0, null); ell(0, -10, 3.2, 3.4, NAVY, 0, null);
    c.strokeStyle = NAVY; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-1, -12); c.quadraticCurveTo(-7, -22, -11, -20); c.moveTo(1, -12); c.quadraticCurveTo(7, -22, 11, -20); c.stroke();
    c.fillStyle = NAVY; c.beginPath(); c.arc(-11, -20, 1.6, 0, 7); c.arc(11, -20, 1.6, 0, 7); c.fill();
    c.restore();
  }
};

/* ---------- Điều phối ---------- */
let X_ptX = -999, X_ptY = -999;
const KINDS = { cat: Cat, dino: Dino, spider: Spider, butterfly: Fly };
const want = () => S.mode === 'game' && (S.mascot || 'cat') !== 'off' && !document.hidden && (window.SPXFX ? SPXFX.anim() : 'full') !== 'off';
const busy = () => !!(window.SPXGames && SPXGames.cur && ['snake', 'brick', 'gold', 'bird'].includes(SPXGames.cur()));
function ensure(){
  if(cvs) return; cvs = document.createElement('canvas'); cvs.id = 'mascot'; cvs.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:35';
  (document.getElementById('app') || document.body).appendChild(cvs); c = cvs.getContext('2d');
}
function resize(){ const w = X.vw(), h = X.vh(), d = Math.min(2, devicePixelRatio || 1); if(w === W && h === H && d === dpr) return; W = w; H = h; dpr = d; cvs.width = W * dpr; cvs.height = H * dpr; }
function frame(ts){
  if(!want()){ raf = 0; if(c) c.clearRect(0, 0, cvs.width, cvs.height); if(cvs) cvs.style.display = 'none'; return; }
  const dt = Math.min(.05, (ts - last) / 1000); last = ts; resize(); k = S.mascotSize || 1;
  c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
  const K = KINDS[kind]; if(!cr) cr = K.init();
  c.globalAlpha = busy() ? .5 : 1; K.update(cr, dt); drawParts(dt); K.draw(cr); c.globalAlpha = 1;
  raf = requestAnimationFrame(frame);
}
function refresh(){
  const w = want(), kd = S.mascot || 'cat';
  if(!w){ if(cvs) cvs.style.display = 'none'; return; }
  ensure(); cvs.style.display = 'block'; resize();
  if(kd !== kind){ kind = kd; cr = null; parts = []; }
  if(!raf){ last = performance.now(); raf = requestAnimationFrame(frame); }
}
addEventListener('pointerdown', e => {
  if(!want() || !cr || !cvs) return; const p = X.pt(e); X_ptX = p.x; X_ptY = p.y;
  if(e.target.closest && e.target.closest('button,input,select,a')) { if(kind === 'butterfly' || kind === 'spider'){ /* vẫn phản ứng nhẹ */ } else return; }
  KINDS[kind].touch(cr, p);
}, true);
addEventListener('spx-state', refresh);
document.addEventListener('visibilitychange', refresh);
addEventListener('resize', () => { if(cvs) resize(); });
window.SPXMascot = { refresh };
refresh();
})();
