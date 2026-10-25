/* SPX Express – Trò chơi (phần C): Rắn săn mồi · Phá gạch · Birdy Bird */
(() => {
'use strict';
const G = window.SPXGames, X = window.SPX, st = X.store, U = G.u;
const { $, $$, rnd, best } = U;
const FONT = '700 13px Montserrat, system-ui, sans-serif';
const chips = (attr, items) => items.map(([v, t]) => `<button class="chip" data-${attr}="${v}">${t}</button>`).join('');
const rr = (cx, x, y, w, h, r) => { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); };

X.extend({
  'Rắn săn mồi':'Snake','Phá gạch':'Brick Breaker','Birdy Bird':'Birdy Bird','Tốc độ':'Speed','Chậm':'Slow','Nhanh':'Fast','Có tường':'Walls',
  'Xuyên tường':'Wrap','Tạm dừng':'Pause','Tiếp tục':'Continue','Vuốt để bắt đầu':'Swipe to start','Bạn đã thua':'Game over','Điểm':'Score','Kỷ lục':'Best',
  'Vuốt trên màn hình để điều khiển rắn':'Swipe on the screen to steer the snake','Kéo để di chuyển thanh · chạm để phóng bi':'Drag to move the paddle · tap to launch',
  'Chạm để phóng bi':'Tap to launch','Chạm để bay':'Tap to fly','Chạm để bay lên, tránh các cột':'Tap to flap and avoid the pipes','Chơi lại':'Play again',
  'Hết bi':'Out of balls','Màn':'Level','Bi':'Balls','Mạng':'Lives','Huy chương':'Medal','Ván mới':'New game','Thử lại':'Try again',
  'Hoàn thành màn':'Level cleared','Quà: +1 bi · nhân đôi · nhân ba số bi đang có':'Gifts: +1 ball · double · triple your balls'
}, [[/^Kỷ lục: (.+)$/, (m, a) => 'Best: ' + a]]);

/* ======================== RẮN SĂN MỒI ======================== */
const Snake = (() => {
  const GN = 18, CS = 20, LW = GN * CS, DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  let root, cv, cx, snake, dir, queue, food, bonus, score, foods, state = 'ready', speed = 'med', walls = true, acc = 0, ivl = 115, bonusT = 0, loop;
  const SP = { slow: 150, med: 115, fast: 80 };
  const key = () => 'snake_' + speed + (walls ? 'w' : 'o');
  function reset(){
    const m = GN / 2 | 0; snake = [[m, m], [m - 1, m], [m - 2, m]]; dir = 1; queue = []; score = 0; foods = 0; bonus = null; acc = 0; ivl = SP[speed]; state = 'ready';
    spawnFood(); $('#snOv', root).hidden = true; info();
  }
  function free(){ let p; do { p = [rnd(GN), rnd(GN)]; } while(snake.some(s => s[0] === p[0] && s[1] === p[1]) || (food && food[0] === p[0] && food[1] === p[1])); return p; }
  function spawnFood(){ food = null; food = free(); }
  function setDir(d){
    if(state === 'pause') return;
    if(state === 'ready') state = 'run';                 // vuốt bất kỳ hướng nào cũng bắt đầu ván
    const base = queue.length ? queue[queue.length - 1] : dir;
    if(d === base || (d + 2) % 4 === base) return;
    if(queue.length < 2) queue.push(d);
  }
  function step(){
    if(queue.length) dir = queue.shift();
    let [hx, hy] = snake[0]; hx += DIRS[dir][0]; hy += DIRS[dir][1];
    if(walls){ if(hx < 0 || hy < 0 || hx >= GN || hy >= GN) return die(); } else { hx = (hx + GN) % GN; hy = (hy + GN) % GN; }
    const eatF = food && hx === food[0] && hy === food[1], eatB = bonus && hx === bonus[0] && hy === bonus[1];
    const body = (eatF || eatB) ? snake : snake.slice(0, -1);
    if(body.some(s => s[0] === hx && s[1] === hy)) return die();
    snake.unshift([hx, hy]);
    if(eatF){ score++; foods++; ivl = Math.max(52, ivl - 2.5); X.tone(660, 0, .07, 'sine', .2); X.tone(880, .07, .08, 'sine', .2); spawnFood(); if(foods % 5 === 0){ bonus = free(); bonusT = 7; } }
    else if(eatB){ score += 5; bonus = null; X.tone(988, 0, .08, 'square', .12); X.tone(1319, .08, .14, 'square', .12); }
    else snake.pop();
    info();
  }
  function die(){
    state = 'over'; X.beep(false); const rec = best.set(key(), -score) ; // lưu điểm âm để dùng cùng hàm best (nhỏ hơn = tốt hơn)
    const ov = $('#snOv', root); ov.hidden = false;
    ov.innerHTML = `<h4>Bạn đã thua</h4><p>Điểm ${score}${rec ? ' · Kỷ lục mới!' : ''}</p><button class="btn b2" id="snAgain">Chơi lại</button>`;
    $('#snAgain', root).onclick = () => { reset(); draw(); };
  }
  const bestScore = () => -(best.get()[key()] || 0);
  function info(){ $('#snS', root).textContent = score; $('#snB', root).textContent = bestScore(); $('#snPause', root).classList.toggle('on', state === 'pause'); }
  function update(dt){
    if(state === 'run'){
      acc += dt * 1000; while(acc >= ivl && state === 'run'){ acc -= ivl; step(); }
      if(bonus){ bonusT -= dt; if(bonusT <= 0) bonus = null; }
    }
    draw();
  }
  function draw(){
    const c = cx, t = performance.now() / 1000;
    for(let y = 0; y < GN; y++) for(let x = 0; x < GN; x++){ c.fillStyle = (x + y) % 2 ? '#0a2f55' : '#0c3562'; c.fillRect(x * CS, y * CS, CS, CS); }
    if(food){ const fx = food[0] * CS + CS / 2, fy = food[1] * CS + CS / 2, pr = 1 + Math.sin(t * 6) * .06;
      c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(fx, fy, 9 * pr, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(fx, fy, 6.200 * pr, 0, 7); c.fill();
      c.fillStyle = '#EE4E2C'; c.beginPath(); c.ellipse(fx + 3, fy - 6, 4, 2, -.6, 0, 7); c.fill(); }
    if(bonus){ const fx = bonus[0] * CS + CS / 2, fy = bonus[1] * CS + CS / 2; c.save(); c.translate(fx, fy); c.rotate(t * 2); c.fillStyle = bonusT < 2 && Math.floor(t * 6) % 2 ? '#fff' : '#ffd166'; c.beginPath();
      for(let i = 0; i < 10; i++){ const a = i * Math.PI / 5, rad = i % 2 ? 4 : 9.500; c.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } c.closePath(); c.fill(); c.restore(); }
    const n = snake.length;
    for(let i = n - 1; i >= 0; i--){
      const [x, y] = snake[i], k = i / Math.max(1, n - 1); c.fillStyle = i === 0 ? '#EE4E2C' : `rgb(${Math.round(255 - k * 130)},${Math.round(138 + k * 44)},${Math.round(99 + k * 135)})`;
      rr(c, x * CS + 1.500, y * CS + 1.500, CS - 3, CS - 3, i === 0 ? 7 : 6); c.fill();
    }
    const [hx, hy] = snake[0], ex = DIRS[dir], px = -ex[1], py = ex[0], cxh = hx * CS + CS / 2, cyh = hy * CS + CS / 2;
    c.fillStyle = '#fff'; for(const s of [-1, 1]){ c.beginPath(); c.arc(cxh + ex[0] * 3.500 + px * 4.500 * s, cyh + ex[1] * 3.500 + py * 4.500 * s, 2.600, 0, 7); c.fill(); }
    c.fillStyle = '#073763'; for(const s of [-1, 1]){ c.beginPath(); c.arc(cxh + ex[0] * 4.500 + px * 4.500 * s, cyh + ex[1] * 4.500 + py * 4.500 * s, 1.300, 0, 7); c.fill(); }
    if(state === 'ready' || state === 'pause'){ c.fillStyle = 'rgba(6,24,43,.55)'; c.fillRect(0, 0, LW, LW); c.fillStyle = '#fff'; c.font = '800 20px Montserrat, system-ui, sans-serif'; c.textAlign = 'center';
      c.fillText(X.tr(state === 'ready' ? 'Vuốt để bắt đầu' : 'Tạm dừng'), LW / 2, LW / 2 + 7); }
  }
  function fit(){ ({ cx } = U.fit(cv, LW, LW)); draw(); }
  function build(){
    const o = st.get('spx_snake_o', {}); speed = o.speed || 'med'; walls = o.walls !== false;
    root.innerHTML = `
      <div class="gbar"><div class="gstat" style="gap:8px"><div class="sbox"><span>Điểm</span><b id="snS">0</b></div><div class="sbox"><span>Kỷ lục</span><b id="snB">0</b></div></div>
        <div style="display:flex;gap:6px"><button class="face" id="snPause" aria-label="Tạm dừng" style="font-size:0">${U.IC.pause}</button><button class="face" id="snNew" aria-label="Ván mới" style="font-size:0">${U.IC.new}</button></div></div>
      <div class="gcols"><div class="gL"><div class="gcard" style="padding:6px"><div class="bw cvw"><canvas class="cv" id="snC"></canvas><div class="gov" id="snOv" hidden></div></div></div></div>
      <div class="gR"><div class="gcard">
        <div class="opt"><div class="lbl">Tốc độ</div><div class="chips">${chips('sp', [['slow', 'Chậm'], ['med', 'Vừa'], ['fast', 'Nhanh']])}</div></div>
        <div class="opt"><div class="lbl">Chế độ</div><div class="chips">${chips('wl', [[1, 'Có tường'], [0, 'Xuyên tường']])}</div></div></div>
        <div class="gtip">Vuốt trên màn hình để điều khiển rắn</div></div></div>`;
    cv = $('#snC', root); const w = $('.cvw', root);
    let ox = 0, oy = 0, down = false;
    w.addEventListener('pointerdown', e => { down = true; ox = e.clientX; oy = e.clientY; });
    w.addEventListener('pointermove', e => { if(!down) return; const dx = e.clientX - ox, dy = e.clientY - oy; if(Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
      setDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); ox = e.clientX; oy = e.clientY; });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => w.addEventListener(ev, () => down = false));
    addEventListener('keydown', e => { if(!G.isOn('snake')) return; const d = { ArrowUp:0, w:0, ArrowRight:1, d:1, ArrowDown:2, s:2, ArrowLeft:3, a:3 }[e.key]; if(d !== undefined){ e.preventDefault(); setDir(d); } else if(e.key === ' ') pause(); });
    $('#snPause', root).onclick = pause; $('#snNew', root).onclick = () => { reset(); draw(); };
    $$('[data-sp]', root).forEach(b => b.onclick = () => { speed = b.dataset.sp; save(); reset(); draw(); });
    $$('[data-wl]', root).forEach(b => b.onclick = () => { walls = b.dataset.wl === '1'; save(); reset(); draw(); });
    loop = U.loop('snake', update); reset(); sync();
  }
  function pause(){ if(state === 'run') state = 'pause'; else if(state === 'pause') state = 'run'; info(); draw(); }
  function save(){ st.set('spx_snake_o', { speed, walls }); sync(); }
  function sync(){ $$('[data-sp]', root).forEach(b => b.classList.toggle('on', b.dataset.sp === speed)); $$('[data-wl]', root).forEach(b => b.classList.toggle('on', (b.dataset.wl === '1') === walls)); info(); }
  return { id: 'snake', name: 'Rắn săn mồi', icon: '<svg viewBox="0 0 24 24"><path d="M5 18h9a4 4 0 000-8H9a3 3 0 010-6h9"/><circle cx="18.500" cy="4" r=".8" fill="currentColor"/></svg>',
    mount(el){ root = el; build(); }, show(){ fit(); loop.start(); }, hide(){ loop.stop(); if(state === 'run') pause(); } };
})();

/* ======================== PHÁ GẠCH ======================== */
const Brick = (() => {
  const LW = 360, LH = 480, R = 6, MAXB = 36, PW = 78;
  const COL = ['#EE4E2C', '#ff7a4d', '#ffa07a', '#7db6ea', '#3f86c9', '#1c5a9a'];
  let root, cv, cx, bricks, balls, drops, fx, pad, lives, level, score, state = 'ready', loop, hiScore = 0, msgT = 0, msg = '';
  const spd = () => Math.min(540, 300 + level * 16);
  function makeLevel(){
    bricks = []; const cols = 8, rows = Math.min(10, 4 + level), bw = 38.500, bh = 16, gap = 4;
    for(let r = 0; r < rows; r++) for(let c = 0; c < cols; c++){
      const p = (level - 1) % 4; let on = true;
      if(p === 1) on = (r + c) % 2 === 0 || r === 0; else if(p === 2) on = c >= r % 4 && c < cols - r % 4; else if(p === 3) on = r % 3 !== 2;
      if(!on) continue;
      const hp = 1 + (level >= 2 && r < Math.min(3, level - 1) ? 1 : 0) + (level >= 6 && r === 0 ? 1 : 0);
      bricks.push({ x: 12 + c * (bw + gap), y: 54 + r * (bh + gap), w: bw, h: bh, hp, max: hp, col: COL[r % 6] });
    }
  }
  function ballOnPad(){ balls = [{ x: pad.x + pad.w / 2, y: pad.y - R - 1, vx: 0, vy: 0, stuck: true }]; }
  function newGame(){
    pad = { x: LW / 2 - PW / 2, y: LH - 38, w: PW, h: 11 }; lives = 3; level = 1; score = 0; drops = []; fx = []; state = 'ready'; makeLevel(); ballOnPad();
    $('#bkOv', root).hidden = true; info(); msgTxt('Chạm để phóng bi', 99);
  }
  const msgTxt = (t, s) => { msg = t; msgT = s; };
  function launch(){
    if(state === 'over') return; state = 'run'; msgT = 0;
    balls.forEach(b => { if(b.stuck){ const a = (Math.random() - .5) * .6; b.stuck = false; b.vx = Math.sin(a) * spd(); b.vy = -Math.cos(a) * spd(); } });
    X.tone(500, 0, .05, 'sine', .15);
  }
  function gift(type){
    const live = balls.filter(b => !b.stuck), src = live.length ? live : balls; const add = [];
    const clone = b => { const s = Math.hypot(b.vx, b.vy) || spd(), a = Math.atan2(b.vx, -b.vy) + (Math.random() < .5 ? -1 : 1) * (.25 + Math.random() * .35);
      return { x: b.x, y: b.y, vx: Math.sin(a) * s, vy: -Math.cos(a) * s, stuck: b.stuck }; };
    if(type === '+1') add.push(clone(src[rnd(src.length)]));
    else { const times = type === 'x2' ? 1 : 2; src.forEach(b => { for(let i = 0; i < times; i++) add.push(clone(b)); }); }
    for(const b of add){ if(balls.length >= MAXB) break; balls.push(b); }
    msgTxt(type === '+1' ? '+1 bi' : type === 'x2' ? 'Nhân đôi số bi!' : 'Nhân ba số bi!', 1.2);
    X.tone(784, 0, .07, 'sine', .2); X.tone(1047, .07, .07, 'sine', .2); X.tone(1319, .14, .12, 'sine', .2);
  }
  function boom(b){ for(let i = 0; i < 6; i++) fx.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, vx: (Math.random() - .5) * 160, vy: (Math.random() - .8) * 140, t: .45, c: b.col }); }
  function hitBrick(b, ball){
    b.hp--; X.tone(300 + (b.max - b.hp) * 120 + rnd(60), 0, .04, 'square', .1);
    if(b.hp <= 0){
      score += 10 * level; boom(b); bricks.splice(bricks.indexOf(b), 1);
      if(Math.random() < .22){ const r = Math.random(); drops.push({ x: b.x + b.w / 2, y: b.y, t: r < .5 ? '+1' : r < .85 ? 'x2' : 'x3' }); }
    }else score += 3 * level;
    info();
  }
  function stepBall(b, dt){
    const n = Math.max(1, Math.ceil(Math.hypot(b.vx, b.vy) * dt / 4));
    for(let s = 0; s < n; s++){
      b.x += b.vx * dt / n; b.y += b.vy * dt / n;
      if(b.x < R){ b.x = R; b.vx = Math.abs(b.vx); } else if(b.x > LW - R){ b.x = LW - R; b.vx = -Math.abs(b.vx); }
      if(b.y < R){ b.y = R; b.vy = Math.abs(b.vy); }
      if(b.vy > 0 && b.y + R >= pad.y && b.y - R <= pad.y + pad.h && b.x >= pad.x - R && b.x <= pad.x + pad.w + R){
        const off = Math.max(-1, Math.min(1, (b.x - (pad.x + pad.w / 2)) / (pad.w / 2))), a = off * 1.05, sp = Math.max(spd(), Math.hypot(b.vx, b.vy));
        b.vx = Math.sin(a) * sp; b.vy = -Math.cos(a) * sp; b.y = pad.y - R; X.tone(420, 0, .04, 'sine', .12);
      }
      for(const br of bricks){
        const cxp = Math.max(br.x, Math.min(b.x, br.x + br.w)), cyp = Math.max(br.y, Math.min(b.y, br.y + br.h)), dx = b.x - cxp, dy = b.y - cyp;
        if(dx * dx + dy * dy < R * R){
          if(Math.abs(dx) > Math.abs(dy)){ b.vx = dx > 0 ? Math.abs(b.vx) : -Math.abs(b.vx); b.x += dx > 0 ? R - Math.abs(dx) : -(R - Math.abs(dx)); }
          else { b.vy = dy > 0 ? Math.abs(b.vy) : -Math.abs(b.vy); b.y += dy > 0 ? R - Math.abs(dy) : -(R - Math.abs(dy)); if(!dy){ b.vy = -b.vy; } }
          hitBrick(br, b); break;
        }
      }
    }
  }
  function update(dt){
    if(state === 'run'){
      balls.forEach(b => { if(!b.stuck) stepBall(b, dt); });
      balls = balls.filter(b => b.stuck || b.y - R < LH);
      drops.forEach(d => d.y += 110 * dt);
      drops = drops.filter(d => { if(d.y > pad.y - 8 && d.y < pad.y + pad.h + 10 && d.x > pad.x - 8 && d.x < pad.x + pad.w + 8){ gift(d.t); return false; } return d.y < LH + 20; });
      if(!bricks.length){ level++; score += 100; state = 'ready'; makeLevel(); drops = []; ballOnPad(); msgTxt('Hoàn thành màn', 1.6); X.beep(true); info(); }
      else if(!balls.length){
        lives--; X.beep(false); drops = [];
        if(lives <= 0) over(); else { state = 'ready'; ballOnPad(); msgTxt('Chạm để phóng bi', 99); }
        info();
      }
    }
    if(state === 'ready') balls.forEach(b => { if(b.stuck){ b.x = pad.x + pad.w / 2; b.y = pad.y - R - 1; } });
    fx.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt; p.t -= dt; }); fx = fx.filter(p => p.t > 0);
    if(msgT > 0 && msgT < 90) msgT -= dt;
    draw();
  }
  function over(){
    state = 'over'; const rec = best.set('brick', -score);
    const ov = $('#bkOv', root); ov.hidden = false;
    ov.innerHTML = `<h4>Hết bi</h4><p>Điểm ${score} · Màn ${level}${rec ? ' · Kỷ lục mới!' : ''}</p><button class="btn b2" id="bkAgain">Chơi lại</button>`;
    $('#bkAgain', root).onclick = newGame;
  }
  const bestScore = () => -(best.get().brick || 0);
  function info(){ $('#bkS', root).textContent = score; $('#bkB', root).textContent = bestScore(); $('#bkL', root).textContent = '❤'.repeat(Math.max(0, lives)); $('#bkN', root).textContent = balls ? balls.length : 1; $('#bkLv', root).textContent = level; }
  function draw(){
    const c = cx, g = c.createLinearGradient(0, 0, 0, LH); g.addColorStop(0, '#0d2a47'); g.addColorStop(1, '#06182b'); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
    c.strokeStyle = 'rgba(255,255,255,.04)'; c.lineWidth = 1; for(let i = 0; i < LW; i += 30){ c.beginPath(); c.moveTo(i, 0); c.lineTo(i, LH); c.stroke(); }
    for(const b of bricks){
      const gr = c.createLinearGradient(0, b.y, 0, b.y + b.h); gr.addColorStop(0, b.col); gr.addColorStop(1, 'rgba(0,0,0,.35)');
      c.fillStyle = b.col; rr(c, b.x, b.y, b.w, b.h, 4); c.fill(); c.fillStyle = gr; rr(c, b.x, b.y, b.w, b.h, 4); c.fill();
      c.fillStyle = 'rgba(255,255,255,.28)'; rr(c, b.x + 2, b.y + 2, b.w - 4, 4, 2); c.fill();
      if(b.max > 1){ c.strokeStyle = '#fff'; c.lineWidth = b.hp > 1 ? 2 : 1; rr(c, b.x + .5, b.y + .5, b.w - 1, b.h - 1, 4); c.stroke(); }
    }
    for(const p of fx){ c.globalAlpha = Math.max(0, p.t / .45); c.fillStyle = p.c; c.fillRect(p.x - 2, p.y - 2, 4, 4); } c.globalAlpha = 1;
    for(const d of drops){
      const col = d.t === '+1' ? '#EE4E2C' : d.t === 'x2' ? '#3f86c9' : '#ffd166';
      c.fillStyle = col; rr(c, d.x - 17, d.y - 9, 34, 18, 9); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.500; c.stroke();
      c.fillStyle = d.t === 'x3' ? '#073763' : '#fff'; c.font = '800 12px Montserrat, system-ui, sans-serif'; c.textAlign = 'center'; c.fillText(d.t, d.x, d.y + 4.500);
    }
    const pg = c.createLinearGradient(pad.x, 0, pad.x + pad.w, 0); pg.addColorStop(0, '#EE4E2C'); pg.addColorStop(.5, '#ff9a76'); pg.addColorStop(1, '#EE4E2C');
    c.fillStyle = pg; rr(c, pad.x, pad.y, pad.w, pad.h, 5.500); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; rr(c, pad.x + 5, pad.y + 2, pad.w - 10, 3, 1.500); c.fill();
    for(const b of balls){ c.fillStyle = 'rgba(255,255,255,.2)'; c.beginPath(); c.arc(b.x, b.y, R + 3, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(b.x, b.y, R, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.75)'; c.font = FONT; c.textAlign = 'left'; c.fillText(X.tr('Màn') + ' ' + level, 12, 24);
    c.textAlign = 'right'; c.fillText(score, LW - 12, 24);
    c.textAlign = 'center'; c.fillText('● ' + balls.length, LW / 2, 24);
    if(msgT > 0){ c.fillStyle = 'rgba(6,24,43,.6)'; rr(c, LW / 2 - 118, LH / 2 + 30, 236, 38, 12); c.fill(); c.fillStyle = '#fff'; c.font = '800 15px Montserrat, system-ui, sans-serif'; c.textAlign = 'center'; c.fillText(X.tr(msg), LW / 2, LH / 2 + 54); }
  }
  function fit(){ ({ cx } = U.fit(cv, LW, LH)); draw(); }
  function build(){
    root.innerHTML = `
      <div class="gbar"><div class="gstat" style="gap:8px"><div class="sbox"><span>Điểm</span><b id="bkS">0</b></div><div class="sbox"><span>Kỷ lục</span><b id="bkB">0</b></div><div class="sbox"><span>Màn</span><b id="bkLv">1</b></div></div>
        <div class="gstat"><span style="color:var(--brand);font-size:15px" id="bkL"></span><span>● <b id="bkN">1</b></span><button class="face" id="bkNew" aria-label="Ván mới" style="font-size:0;width:36px;height:36px">${U.IC.new}</button></div></div>
      <div class="gcols"><div class="gL"><div class="gcard" style="padding:6px"><div class="bw cvw"><canvas class="cv" id="bkC"></canvas><div class="gov" id="bkOv" hidden></div></div></div></div>
      <div class="gR"><div class="gcard"><div class="gtip" style="margin:0">Kéo để di chuyển thanh · chạm để phóng bi</div><div class="gtip">Quà: +1 bi · nhân đôi · nhân ba số bi đang có</div></div></div></div>`;
    cv = $('#bkC', root); const w = $('.cvw', root); let moved = 0, sx = 0, down = false, startPad = 0;
    const lx = e => (e.clientX - cv.getBoundingClientRect().left) * LW / cv.getBoundingClientRect().width;
    w.addEventListener('pointerdown', e => { down = true; sx = lx(e); startPad = pad.x; moved = 0; pad.x = Math.max(0, Math.min(LW - pad.w, lx(e) - pad.w / 2)); });
    w.addEventListener('pointermove', e => { if(!down) return; moved += Math.abs(e.movementX || 0); pad.x = Math.max(0, Math.min(LW - pad.w, lx(e) - pad.w / 2)); });
    w.addEventListener('pointerup', () => { down = false; if(state === 'ready' || (state === 'run' && balls.some(b => b.stuck))) launch(); });
    w.addEventListener('pointercancel', () => down = false);
    addEventListener('keydown', e => { if(!G.isOn('brick')) return; if(e.key === 'ArrowLeft'){ pad.x = Math.max(0, pad.x - 26); } else if(e.key === 'ArrowRight'){ pad.x = Math.min(LW - pad.w, pad.x + 26); } else if(e.key === ' '){ e.preventDefault(); launch(); } });
    $('#bkNew', root).onclick = newGame;
    loop = U.loop('brick', update); newGame();
  }
  return { id: 'brick', name: 'Phá gạch', icon: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="8" height="4" rx="1"/><rect x="13" y="4" width="8" height="4" rx="1"/><rect x="3" y="10" width="5" height="4" rx="1"/><rect x="10" y="10" width="11" height="4" rx="1"/><circle cx="12" cy="18" r="1.500" fill="currentColor"/></svg>',
    mount(el){ root = el; build(); }, show(){ fit(); loop.start(); }, hide(){ loop.stop(); },
    _t: { gift: t => gift(t), n: () => balls.length, launch } };
})();

/* ======================== BIRDY BIRD ======================== */
const Bird = (() => {
  const LW = 320, LH = 480, GY = 432, PWD = 56;
  let root, cv, cx, bird, pipes, score, state = 'ready', gx = 0, clouds, t0 = 0, loop, hiScore = 0;
  const gapSize = () => Math.max(112, 142 - score * 1.2);
  function reset(){
    bird = { x: 90, y: 230, vy: 0, r: 12, rot: 0 }; pipes = []; score = 0; state = 'ready'; t0 = 0; gx = 0;
    clouds = Array.from({ length: 5 }, (_, i) => ({ x: rnd(LW), y: 40 + rnd(180), s: .6 + Math.random() * .8, v: 8 + rnd(10) }));
    $('#brOv', root).hidden = true; info();
  }
  function flap(){
    if(state === 'over') return;
    if(state === 'ready') state = 'run';
    bird.vy = -405; X.tone(620, 0, .06, 'sine', .14); X.tone(880, .05, .06, 'sine', .1);
  }
  function die(){
    if(state === 'over') return; state = 'over'; X.beep(false);
    const rec = best.set('bird', -score), ov = $('#brOv', root); ov.hidden = false;
    const medal = score >= 40 ? ['🏆', 'Platinum'] : score >= 30 ? ['🥇', 'Gold'] : score >= 20 ? ['🥈', 'Silver'] : score >= 10 ? ['🥉', 'Bronze'] : null;
    ov.innerHTML = `<h4>Bạn đã thua</h4><p>Điểm ${score}${rec ? ' · Kỷ lục mới!' : ''}</p>${medal ? `<p style="font-size:30px">${medal[0]}</p>` : ''}<button class="btn b2" id="brAgain">Chơi lại</button>`;
    $('#brAgain', root).onclick = () => { reset(); };
    info();
  }
  const bestScore = () => -(best.get().bird || 0);
  function info(){ $('#brS', root).textContent = score; $('#brB', root).textContent = bestScore(); }
  function update(dt){
    clouds.forEach(c => { c.x -= c.v * dt; if(c.x < -60) c.x = LW + 40; });
    if(state !== 'over') gx = (gx + 130 * dt) % 24;
    t0 += dt;
    if(state === 'ready'){ bird.y = 230 + Math.sin(t0 * 5) * 8; bird.rot = 0; }
    else{
      bird.vy += 1350 * dt; bird.y += bird.vy * dt; bird.rot = Math.max(-.5, Math.min(1.2, bird.vy / 650));
      if(state === 'run'){
        const sp = 130 + Math.min(60, score * 2);
        pipes.forEach(p => p.x -= sp * dt);
        if(!pipes.length || pipes[pipes.length - 1].x < LW - 185) pipes.push({ x: LW + 10, gy: 90 + rnd(GY - 90 - 90 - (gapSize() | 0)) + 0, passed: false });
        pipes = pipes.filter(p => p.x > -PWD - 10);
        for(const p of pipes){
          if(!p.passed && p.x + PWD < bird.x - bird.r){ p.passed = true; score++; X.tone(988, 0, .06, 'square', .1); X.tone(1319, .06, .1, 'square', .1); info(); }
          if(bird.x + bird.r - 3 > p.x && bird.x - bird.r + 3 < p.x + PWD && (bird.y - bird.r + 3 < p.gy || bird.y + bird.r - 3 > p.gy + gapSize())) die();
        }
      }
      if(bird.y + bird.r > GY){ bird.y = GY - bird.r; die(); }
      if(bird.y - bird.r < 0){ bird.y = bird.r; bird.vy = 0; }
    }
    draw();
  }
  function draw(){
    const c = cx, g = c.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, '#1c4f87'); g.addColorStop(1, '#8cc0ef'); c.fillStyle = g; c.fillRect(0, 0, LW, LH);
    c.fillStyle = 'rgba(255,255,255,.55)'; clouds.forEach(cl => { c.beginPath(); c.arc(cl.x, cl.y, 16 * cl.s, 0, 7); c.arc(cl.x + 16 * cl.s, cl.y + 4, 13 * cl.s, 0, 7); c.arc(cl.x - 15 * cl.s, cl.y + 5, 11 * cl.s, 0, 7); c.fill(); });
    c.fillStyle = '#2a6cb0'; c.beginPath(); c.moveTo(0, GY); for(let x = 0; x <= LW; x += 20) c.lineTo(x, GY - 28 - Math.sin(x * .03) * 14); c.lineTo(LW, GY); c.fill();
    for(const p of pipes){
      const gs = gapSize(), pg = c.createLinearGradient(p.x, 0, p.x + PWD, 0); pg.addColorStop(0, '#0a3a6e'); pg.addColorStop(.35, '#3f86c9'); pg.addColorStop(1, '#073763');
      c.fillStyle = pg; c.fillRect(p.x + 4, 0, PWD - 8, p.gy); c.fillRect(p.x + 4, p.gy + gs, PWD - 8, GY - p.gy - gs);
      c.fillStyle = '#EE4E2C'; rr(c, p.x, p.gy - 22, PWD, 22, 6); c.fill(); rr(c, p.x, p.gy + gs, PWD, 22, 6); c.fill();
      c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(p.x + 6, p.gy - 19, 6, 16); c.fillRect(p.x + 6, p.gy + gs + 3, 6, 16);
    }
    c.fillStyle = '#0d2a47'; c.fillRect(0, GY, LW, LH - GY);
    c.save(); c.beginPath(); c.rect(0, GY, LW, 12); c.clip(); c.fillStyle = '#EE4E2C'; c.fillRect(0, GY, LW, 12); c.fillStyle = '#fff';
    for(let x = -24 + gx * -1; x < LW + 24; x += 24){ c.beginPath(); c.moveTo(x, GY); c.lineTo(x + 12, GY); c.lineTo(x + 4, GY + 12); c.lineTo(x - 8, GY + 12); c.fill(); } c.restore();
    // chim
    c.save(); c.translate(bird.x, bird.y); c.rotate(bird.rot);
    const flapA = state === 'over' ? 0 : Math.sin(t0 * (state === 'ready' ? 12 : 22)) * .5;
    c.fillStyle = '#c93a1c'; c.beginPath(); c.moveTo(-10, 0); c.lineTo(-19, -4 + flapA * 3); c.lineTo(-19, 5 + flapA * 3); c.closePath(); c.fill();
    const bg = c.createLinearGradient(0, -12, 0, 12); bg.addColorStop(0, '#ff7a4d'); bg.addColorStop(1, '#EE4E2C'); c.fillStyle = bg; c.beginPath(); c.ellipse(0, 0, 14.5, 12, 0, 0, 7); c.fill();
    c.fillStyle = '#ffe3d6'; c.beginPath(); c.ellipse(2, 5, 8, 5, 0, 0, 7); c.fill();
    c.fillStyle = '#073763'; c.beginPath(); c.ellipse(-4, 1 + flapA * 4, 7, 4.500, -.3 + flapA * .6, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(6, -4, 4.600, 0, 7); c.fill(); c.fillStyle = '#073763'; c.beginPath(); c.arc(7.500, -4, 2.200, 0, 7); c.fill();
    c.fillStyle = '#ffcf70'; c.beginPath(); c.moveTo(11, -1); c.lineTo(20, 2); c.lineTo(11, 5.500); c.closePath(); c.fill();
    c.restore();
    c.fillStyle = '#fff'; c.font = '800 38px Montserrat, system-ui, sans-serif'; c.textAlign = 'center'; c.strokeStyle = '#073763'; c.lineWidth = 5; c.lineJoin = 'round';
    if(state !== 'ready'){ c.strokeText(score, LW / 2, 70); c.fillText(score, LW / 2, 70); }
    else { c.font = '800 18px Montserrat, system-ui, sans-serif'; c.strokeText(X.tr('Chạm để bay'), LW / 2, 150); c.fillText(X.tr('Chạm để bay'), LW / 2, 150); }
  }
  function fit(){ ({ cx } = U.fit(cv, LW, LH)); draw(); }
  function build(){
    root.innerHTML = `
      <div class="gbar"><div class="gstat" style="gap:8px"><div class="sbox"><span>Điểm</span><b id="brS">0</b></div><div class="sbox"><span>Kỷ lục</span><b id="brB">0</b></div></div>
        <button class="face" id="brNew" aria-label="Ván mới" style="font-size:0">${U.IC.new}</button></div>
      <div class="gcols"><div class="gL"><div class="gcard" style="padding:6px"><div class="bw cvw"><canvas class="cv" id="brC"></canvas><div class="gov" id="brOv" hidden></div></div></div></div>
      <div class="gR"><div class="gcard"><div class="gtip" style="margin:0">Chạm để bay lên, tránh các cột</div></div></div></div>`;
    cv = $('#brC', root); const w = $('.cvw', root);
    w.addEventListener('pointerdown', e => { if(e.target.closest('button')) return; e.preventDefault(); flap(); });
    addEventListener('keydown', e => { if(G.isOn('bird') && (e.key === ' ' || e.key === 'ArrowUp')){ e.preventDefault(); flap(); } });
    $('#brNew', root).onclick = reset;
    loop = U.loop('bird', update); reset();
  }
  return { id: 'bird', name: 'Birdy Bird', icon: '<svg viewBox="0 0 24 24"><path d="M3 13c2-5 7-8 12-6l4-2-1 4c1 6-4 11-10 10-3-.5-5-3-5-6z"/><circle cx="14" cy="9.500" r="1" fill="currentColor"/></svg>',
    mount(el){ root = el; build(); }, show(){ fit(); loop.start(); }, hide(){ loop.stop(); } };
})();

[Snake, Brick, Bird].forEach(g => G.register(g));
G._brick = Brick._t;
})();
