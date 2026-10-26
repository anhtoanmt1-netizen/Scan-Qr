/* SPX Express – Trò chơi (phần E): Đào vàng · Đẩy thùng gỗ · Nuôi thú ảo */
(() => {
'use strict';
const G = window.SPXGames, X = window.SPX, st = X.store, U = G.u;
const { $, $$, fmt, rnd, shuffle, best } = U;
const chips = (attr, items) => items.map(([v, t]) => `<button class="chip" data-${attr}="${v}">${t}</button>`).join('');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rr = (cx, x, y, w, h, r) => { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); };

X.extend({
  'Đào vàng':'Gold Miner','Đẩy thùng gỗ':'Sokoban','Nuôi thú ảo':'Virtual Pet','Mục tiêu':'Goal','Màn':'Level','Giờ':'Time','Thuốc nổ':'Dynamite',
  'Chạm để thả móc câu':'Tap to drop the claw','Qua màn!':'Level cleared!','Chơi tiếp':'Next level','Hết giờ':'Time is up','Chưa đạt mục tiêu':'Goal not reached',
  'Chơi lại':'Play again','Túi quà':'Mystery bag','Chọn màn':'Select level','Hoàn thành!':'Completed!','Màn tiếp':'Next level','Làm lại':'Restart','Hoàn tác':'Undo',
  'Số bước':'Moves','Đẩy':'Pushes','Kỷ lục':'Best','Vuốt hoặc dùng phím mũi tên để di chuyển · đẩy thùng vào các ô đích':'Swipe or use the arrow keys · push the crates onto the targets',
  'Chạm để xem thú cưng':'Tap to meet your pet','Nhận nuôi':'Adopt','Tên thú cưng':'Pet name','Chọn thú cưng của bạn':'Choose your pet','Mèo':'Cat','Cún':'Dog','Thỏ':'Bunny','Gà con':'Chick',
  'Cho ăn':'Feed','Chơi':'Play','Tắm':'Bath','Ngủ':'Sleep','Dậy':'Wake','Thuốc':'Medicine','Xu':'Coins','Đói':'Hunger','Vui':'Happy','Năng lượng':'Energy','Sạch sẽ':'Clean',
  'Táo':'Apple','Burger':'Burger','Bánh kem':'Cake','Trứng sắp nở, chạm để giúp thú nở nhanh hơn':'The egg is about to hatch, tap to help it',
  'Trứng đã nở!':'The egg hatched!','Thú cưng đang ngủ':'Your pet is sleeping','Thú cưng đang no':'Your pet is full','Không đủ xu':'Not enough coins','Thú cưng không ốm':'Your pet is not sick',
  'Đã khỏi bệnh!':'Your pet is cured!','Thú cưng đang ốm, hãy cho uống thuốc':'Your pet is sick, give it medicine','Thú cưng quá mệt để chơi':'Your pet is too tired to play',
  'Bắt bóng':'Catch the balls','Hết giờ chơi':'Playtime over','Quà hằng ngày: +20 xu':'Daily gift: +20 coins','Nhận nuôi thú mới':'Adopt a new pet',
  'Bạn chắc chắn muốn nhận nuôi thú mới? Thú hiện tại sẽ rời đi.':'Adopt a new pet? Your current pet will leave.','Tuổi':'Age','Trứng':'Egg','Sơ sinh':'Baby','Thiếu niên':'Child','Trưởng thành':'Adult',
  'Đã bắt':'Caught','Thú cưng đã đi ngủ':'Your pet went to sleep','Thú cưng đã thức dậy':'Your pet woke up','Thú cưng vừa tắm xong!':'Fresh and clean!'
}, [[/^\+(\d+) xu$/, (m, a) => '+' + a + ' coins'], [/^Màn (\d+) \/ (\d+)$/, (m, a, b) => 'Level ' + a + ' / ' + b], [/^Kỷ lục: (.+)$/, (m, a) => 'Best: ' + a],
    [/^Tuổi: (.+)$/, (m, a) => 'Age: ' + a], [/^Mục tiêu (\d+)$/, (m, a) => 'Goal ' + a], [/^Điểm (\d+)$/, (m, a) => 'Score ' + a]]);

const CSS = `
.pcv{aspect-ratio:3/4}
/* Đẩy thùng */
.sk{position:relative;display:grid;border-radius:10px;overflow:hidden;background:#0d2a47;touch-action:none;user-select:none;-webkit-user-select:none;margin:0 auto;max-width:var(--bs,420px)}
.skc{min-width:0;min-height:0}
.kw{background:linear-gradient(135deg,#1c4f87,#073763);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
.kf{background:#e8f0f8}[data-theme="dark"] .kf{background:#16365a}
.kg{background:#e8f0f8;position:relative}[data-theme="dark"] .kg{background:#16365a}
.kg::after{content:"";position:absolute;inset:33%;border-radius:50%;border:3px solid var(--brand);background:rgba(238,78,44,.25)}
.ksp{position:absolute;left:0;top:0;transition:transform .13s ease;pointer-events:none}
.ksp svg{width:100%;height:100%;display:block}
.ksp.box.on svg{filter:drop-shadow(0 0 5px #ffd166) brightness(1.1)}
.kpad{display:grid;grid-template-columns:repeat(3,46px);grid-template-rows:repeat(2,46px);gap:6px;justify-content:center;margin-top:9px}
.kpad button{border-radius:12px;background:rgba(7,55,99,.1);color:var(--navy);font-size:18px;font-weight:800}
[data-theme="dark"] .kpad button{background:rgba(255,255,255,.12);color:#fff}
.kpad button:active{transform:scale(.9);background:var(--brand);color:#fff}
.klv{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin-top:10px}
.klv button{height:42px;border-radius:11px;background:var(--input);border:1.5px solid var(--line);color:var(--navy);font-weight:800;font-size:13px}
[data-theme="dark"] .klv button{color:#fff}
.klv button.cur{background:var(--brand);color:#fff;border-color:var(--brand)}
.klv button.dn{border-color:var(--ok);background:rgba(26,158,92,.12)}
.klv button:disabled{opacity:.35}
/* Nuôi thú */
.ps{position:relative;border-radius:14px;overflow:hidden;aspect-ratio:1/.8;background:linear-gradient(180deg,#cfe1f3 0 62%,#f6d9cc 62%);max-width:var(--bs,420px);margin:0 auto;user-select:none;-webkit-user-select:none}
[data-theme="dark"] .ps{background:linear-gradient(180deg,#14375d 0 62%,#3a2a3a 62%)}
.ps::before{content:"";position:absolute;left:0;right:0;top:62%;height:5px;background:rgba(7,55,99,.18)}
.pwin{position:absolute;right:9%;top:9%;width:20%;aspect-ratio:1;border-radius:10px;background:linear-gradient(135deg,#fff,#8cc0ef);border:4px solid var(--navy);box-shadow:inset 0 0 0 3px rgba(255,255,255,.4)}
.pwin::before,.pwin::after{content:"";position:absolute;background:var(--navy)}.pwin::before{left:50%;top:0;bottom:0;width:3px}.pwin::after{top:50%;left:0;right:0;height:3px}
.pet{position:absolute;left:50%;top:36%;width:56%;transform:translateX(-50%);cursor:pointer;animation:pbob 2.4s ease-in-out infinite;transform-origin:50% 100%}
.pet svg{width:100%;height:auto;display:block;overflow:visible}
.pet.slp{animation:pbob 4s ease-in-out infinite}
@keyframes pbob{0%,100%{transform:translateX(-50%) translateY(0) scale(1,1)}50%{transform:translateX(-50%) translateY(-5px) scale(1.02,.98)}}
.peyes{transform-box:fill-box;transform-origin:center;animation:pblink 4s infinite}
@keyframes pblink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
.ppoop{position:absolute;font-size:26px;cursor:pointer;animation:pop2 .3s ease;filter:drop-shadow(0 2px 2px rgba(0,0,0,.3))}
.pfx{position:absolute;pointer-events:none;font-size:22px;animation:pfly 1.1s ease-out forwards}
@keyframes pfly{from{transform:translateY(0);opacity:1}to{transform:translateY(-70px);opacity:0}}
.pdim{position:absolute;inset:0;background:rgba(6,24,43,.55);opacity:0;transition:opacity .5s;pointer-events:none}
.pdim.on{opacity:1}
.pbub{position:absolute;left:12%;top:10%;background:#fff;border-radius:14px;padding:6px 10px;font-size:20px;box-shadow:var(--shadow);animation:pop2 .3s}
.pst{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px;margin-top:10px}
.pbar{font-size:11px;font-weight:700;color:var(--muted);display:flex;flex-direction:column;gap:3px}
.pbar i{display:block;height:8px;border-radius:8px;background:var(--line);overflow:hidden}.pbar i b{display:block;height:100%;border-radius:8px;background:var(--ok);transition:width .4s,background .4s}
.pmenu{position:absolute;inset:0;background:rgba(6,24,43,.82);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;border-radius:14px;z-index:6;padding:12px;animation:fade .2s}
.pmenu[hidden]{display:none}
.pmenu button.fd{width:100%;max-width:260px;height:48px;border-radius:13px;background:var(--card);color:var(--text);font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:space-between;padding:0 14px}
.pmenu h4{margin:0;color:#fff;font-size:15px}
.pball{position:absolute;top:-30px;font-size:30px;cursor:pointer;animation:pfall linear forwards}
@keyframes pfall{to{transform:translateY(340px)}}
.pchoose{display:grid;grid-template-columns:repeat(2,1fr);gap:9px;margin:10px 0}
.pchoose button{padding:10px 4px;border-radius:14px;background:var(--input);border:2px solid var(--line);font-weight:700;font-size:12px;color:var(--text)}
.pchoose button.on{border-color:var(--brand);background:rgba(238,78,44,.1)}
.pchoose svg{width:70px;height:70px;display:block;margin:0 auto 4px}
.pnm{width:100%}
`;
{ const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }

/* ======================== ĐÀO VÀNG ======================== */
const Gold = (() => {
  const LW = 360, LH = 480, OX = 180, OY = 66;
  let root, cv, cx, loop, objs, state, ang, dir, len, caught, score, level, goal, time, dyn, pops, boost, tick;
  const TYPES = { gS: { r: 10, v: 50, w: .8 }, gM: { r: 16, v: 120, w: 1.5 }, gL: { r: 26, v: 300, w: 2.8 }, rock: { r: 15, v: 20, w: 3 }, rockL: { r: 23, v: 40, w: 4.2 }, dia: { r: 8, v: 500, w: .5 }, bag: { r: 14, v: 0, w: 1.3 } };
  const goalOf = n => 600 + 480 * (n - 1) + 60 * (n - 1) * (n - 1);
  function genLevel(){
    objs = []; const names = ['gS', 'gS', 'gM', 'gM', 'gL', 'rock', 'rock', 'rockL', 'dia', 'bag'], cnt = 11 + Math.min(level, 6);
    for(let k = 0; k < 400 && objs.length < cnt; k++){
      const n = k < 3 ? 'gM' : names[rnd(names.length)] + '', T = TYPES[n]; if(level < 2 && n === 'gL' && Math.random() < .5) continue;
      const x = T.r + 10 + Math.random() * (LW - 2 * T.r - 20), y = 140 + T.r + Math.random() * (LH - 150 - 2 * T.r);
      if(objs.some(o => Math.hypot(o.x - x, o.y - y) < o.r + T.r + 8)) continue;
      objs.push({ n, x, y, r: T.r, v: T.v, w: T.w, sd: Array.from({ length: 8 }, () => .75 + Math.random() * .4) });
    }
  }
  function newLevel(first){
    if(first){ score = 0; level = 1; dyn = 2; } goal = goalOf(level); time = 60; state = 'swing'; ang = 0; dir = 1; len = 24; caught = null; boost = 1; pops = [];
    genLevel(); $('#gdOv', root).hidden = true; info();
  }
  function info(){ $('#gdS', root).textContent = score; $('#gdG', root).textContent = goal; $('#gdT', root).textContent = Math.ceil(Math.max(0, time)); $('#gdL', root).textContent = level; $('#gdD', root).textContent = dyn; $('#gdBest', root).textContent = best.get().gold ? 'Kỷ lục: ' + (-best.get().gold) : ''; }
  function shoot(){ if(state === 'swing'){ state = 'shoot'; X.tone(300, 0, .08, 'square', .1); } }
  function boom(){ if(state === 'pull' && caught && dyn > 0){ dyn--; objs.splice(objs.indexOf(caught), 1); pops.push({ x: caught.x, y: caught.y, t: 'BÙM!', a: 1, c: '#ffd166' }); caught = null; X.tone(120, 0, .25, 'square', .25); info(); } }
  function levelEnd(){
    state = 'over'; const ok = score >= goal, ov = $('#gdOv', root); ov.hidden = false;
    if(ok){ X.beep(true); ov.innerHTML = `<h4>Qua màn!</h4><p>Điểm ${score}</p><button class="btn b2" id="gdNext">Chơi tiếp</button>`; $('#gdNext', root).onclick = () => { level++; dyn++; newLevel(false); }; }
    else { X.beep(false); const rec = best.set('gold', -score); ov.innerHTML = `<h4>${time <= 0 ? 'Hết giờ' : 'Chưa đạt mục tiêu'}</h4><p>Điểm ${score} · Mục tiêu ${goal}${rec ? ' · Kỷ lục mới!' : ''}</p><button class="btn b2" id="gdAgain">Chơi lại</button>`; $('#gdAgain', root).onclick = () => newLevel(true); }
  }
  function update(dt){
    if(state !== 'over'){
      time -= dt; if(time <= 0){ time = 0; return levelEnd(); }
      if(state === 'swing'){ ang += dir * dt * 1.5; if(ang > 1.2){ ang = 1.2; dir = -1; } if(ang < -1.2){ ang = -1.2; dir = 1; } }
      const hx = OX + Math.sin(ang) * len, hy = OY + Math.cos(ang) * len;
      if(state === 'shoot'){
        len += 330 * dt; const nx = OX + Math.sin(ang) * len, ny = OY + Math.cos(ang) * len;
        const hit = objs.find(o => Math.hypot(o.x - nx, o.y - ny) < o.r + 4);
        if(hit){ caught = hit; state = 'pull'; X.tone(220, 0, .08, 'square', .12); }
        else if(nx < 4 || nx > LW - 4 || ny > LH - 4) state = 'pull';
      }else if(state === 'pull'){
        const sp = caught ? clamp(300 / caught.w, 55, 330) * boost : 340; len -= sp * dt;
        if(caught){ caught.x = OX + Math.sin(ang) * len; caught.y = OY + Math.cos(ang) * len; }
        if(len <= 24){
          len = 24; state = 'swing';
          if(caught){
            let v = caught.v, txt = '+' + v;
            if(caught.n === 'bag'){ const r = Math.random(); if(r < .25){ dyn++; v = 0; txt = '+💥'; } else if(r < .45){ boost = 1.6; v = 0; txt = '⚡'; } else { v = 50 + rnd(8) * 50; txt = '+' + v; } }
            score += v; pops.push({ x: OX, y: OY + 22, t: txt, a: 1, c: '#fff' }); objs.splice(objs.indexOf(caught), 1); caught = null; X.tone(700, 0, .06, 'sine', .15); X.tone(990, .06, .1, 'sine', .15); info();
            if(!objs.some(o => TYPES[o.n].v > 0 || o.n === 'bag')) return levelEnd();
          }
        }
      }
    }
    pops.forEach(p => { p.y -= 28 * dt; p.a -= dt * .8; }); pops = pops.filter(p => p.a > 0);
    draw();
  }
  function drawObj(c, o){
    const g = c.createRadialGradient(o.x - o.r / 3, o.y - o.r / 3, 2, o.x, o.y, o.r);
    if(o.n[0] === 'g'){ g.addColorStop(0, '#fff3b0'); g.addColorStop(.5, '#ffd166'); g.addColorStop(1, '#e09b00'); c.fillStyle = g; c.beginPath(); o.sd.forEach((s, i) => { const a = i / 8 * 6.283; c.lineTo(o.x + Math.cos(a) * o.r * s, o.y + Math.sin(a) * o.r * s); }); c.closePath(); c.fill(); c.strokeStyle = '#a56a00'; c.lineWidth = 1.5; c.stroke(); }
    else if(o.n.startsWith('rock')){ g.addColorStop(0, '#8fb0d4'); g.addColorStop(1, '#3d5f86'); c.fillStyle = g; c.beginPath(); o.sd.forEach((s, i) => { const a = i / 8 * 6.283; c.lineTo(o.x + Math.cos(a) * o.r * s, o.y + Math.sin(a) * o.r * s); }); c.closePath(); c.fill(); c.strokeStyle = '#1c3d63'; c.lineWidth = 1.5; c.stroke(); }
    else if(o.n === 'dia'){ c.fillStyle = '#7fe0ff'; c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(o.x, o.y - o.r * 1.2); c.lineTo(o.x + o.r * 1.1, o.y); c.lineTo(o.x, o.y + o.r * 1.2); c.lineTo(o.x - o.r * 1.1, o.y); c.closePath(); c.fill(); c.stroke(); }
    else { c.fillStyle = '#EE4E2C'; c.beginPath(); c.arc(o.x, o.y + 2, o.r, 0, 7); c.fill(); c.fillStyle = '#c93a1c'; c.fillRect(o.x - 5, o.y - o.r - 3, 10, 6); c.fillStyle = '#fff'; c.font = '800 14px Montserrat, system-ui, sans-serif'; c.textAlign = 'center'; c.fillText('?', o.x, o.y + 7); }
  }
  function draw(){
    const c = cx, sky = c.createLinearGradient(0, 0, 0, 84); sky.addColorStop(0, '#6aa7e0'); sky.addColorStop(1, '#cfe1f3'); c.fillStyle = sky; c.fillRect(0, 0, LW, 84);
    const soil = c.createLinearGradient(0, 84, 0, LH); soil.addColorStop(0, '#1c4f87'); soil.addColorStop(1, '#06182b'); c.fillStyle = soil; c.fillRect(0, 84, LW, LH - 84);
    c.fillStyle = 'rgba(255,255,255,.05)'; for(let i = 0; i < 40; i++){ c.fillRect((i * 97) % LW, 90 + (i * 53) % (LH - 100), 3, 3); }
    c.fillStyle = '#EE4E2C'; c.fillRect(0, 80, LW, 5);
    objs.forEach(o => drawObj(c, o));
    // thợ mỏ
    c.fillStyle = '#073763'; rr(c, OX - 46, OY - 34, 40, 34, 8); c.fill(); c.fillStyle = '#EE4E2C'; c.beginPath(); c.arc(OX - 26, OY - 44, 12, 0, 7); c.fill(); c.fillStyle = '#ffe3d6'; c.beginPath(); c.arc(OX - 26, OY - 40, 8, 0, 7); c.fill();
    c.fillStyle = '#ffd166'; c.beginPath(); c.arc(OX - 26, OY - 48, 9, Math.PI, 0); c.fill(); c.fillStyle = '#EE4E2C'; rr(c, OX - 12, OY - 14, 24, 16, 5); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(OX, OY - 4, 5, 0, 7); c.fill();
    const hx = OX + Math.sin(ang) * len, hy = OY + Math.cos(ang) * len;
    c.strokeStyle = '#e8f0f8'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(OX, OY); c.lineTo(hx, hy); c.stroke();
    c.save(); c.translate(hx, hy); c.rotate(-ang); c.strokeStyle = '#fff'; c.lineWidth = 3.5; c.lineCap = 'round'; const open = caught ? .35 : .9;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(-9 * Math.sin(open) - 2, 11 * Math.cos(open) + 2); c.moveTo(0, 0); c.lineTo(9 * Math.sin(open) + 2, 11 * Math.cos(open) + 2); c.stroke(); c.restore();
    if(caught) drawObj(c, caught);
    c.textAlign = 'center'; pops.forEach(p => { c.globalAlpha = Math.max(0, p.a); c.fillStyle = p.c; c.font = '800 16px Montserrat, system-ui, sans-serif'; c.fillText(p.t, p.x, p.y); }); c.globalAlpha = 1;
    if(state === 'swing' && score === 0 && time > 56){ c.fillStyle = 'rgba(6,24,43,.55)'; rr(c, LW / 2 - 100, 100, 200, 30, 10); c.fill(); c.fillStyle = '#fff'; c.font = '700 13px Montserrat, system-ui, sans-serif'; c.fillText(X.tr('Chạm để thả móc câu'), LW / 2, 120); }
  }
  function fit(){ ({ cx } = U.fit(cv, LW, LH)); if(objs) draw(); }
  function build(){
    root.innerHTML = `
      <div class="gbar"><div class="gstat" style="gap:6px"><div class="sbox"><span>Điểm</span><b id="gdS">0</b></div><div class="sbox"><span>Mục tiêu</span><b id="gdG">0</b></div><div class="sbox"><span>Giờ</span><b id="gdT">60</b></div><div class="sbox"><span>Màn</span><b id="gdL">1</b></div></div></div>
      <div class="gcols"><div class="gL"><div class="gcard" style="padding:6px"><div class="bw cvw"><canvas class="cv" id="gdC"></canvas><div class="gov" id="gdOv" hidden></div></div></div></div>
      <div class="gR"><div class="gbtns c2"><button class="gb" id="gdDyn" style="flex-direction:row;gap:8px;min-height:48px;font-size:12px">💥 <span>Thuốc nổ</span> <b id="gdD" style="font-size:15px">2</b></button><button class="gb" id="gdNew">${U.IC.new}<span>Ván mới</span></button></div>
        <div class="gcard" style="margin-top:9px"><div class="gtip" style="margin:0">Chạm để thả móc câu</div><div class="gtip" style="margin-top:2px">Vàng lớn nặng, kim cương nhẹ · Túi quà có thể cho thuốc nổ, tốc độ hoặc xu</div><div class="gtip" id="gdBest"></div></div></div></div>`;
    cv = $('#gdC', root); const w = $('.cvw', root);
    w.addEventListener('pointerdown', e => { if(e.target.closest('button')) return; e.preventDefault(); shoot(); });
    addEventListener('keydown', e => { if(!G.isOn('gold')) return; if(e.key === ' ' || e.key === 'ArrowDown'){ e.preventDefault(); shoot(); } else if(e.key === 'ArrowUp' || e.key === 'd') boom(); });
    $('#gdDyn', root).onclick = boom; $('#gdNew', root).onclick = () => newLevel(true);
    loop = U.loop('gold', update); newLevel(true);
  }
  return { id: 'gold', name: 'Đào vàng', icon: '<svg viewBox="0 0 24 24"><path d="M12 2v10M12 12c-3 0-4 2-4 4M12 12c3 0 4 2 4 4"/><path d="M4 22l3-6h10l3 6z"/></svg>', mount(el){ root = el; build(); }, show(){ fit(); loop.start(); }, hide(){ loop.stop(); } };
})();

/* ======================== ĐẨY THÙNG GỖ ======================== */
const Soko = (() => {
  const TOTAL = 40, D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let root, W, H, wall, goals, boxes, p, moves, pushes, hist, level, prog, boxEls, pEl, won;
  const rngf = seed => { let s = (seed >>> 0) || 1; return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296; };
  function gen(n){
    const R = rngf(n * 7919 + 17), w = Math.min(9, 6 + ((n - 1) / 7 | 0)), h = Math.min(9, 6 + ((n - 1) / 9 | 0));
    for(let at = 0; at < 1500; at++){
      const B = Math.min(6, 1 + ((n - 1) / 5 | 0) + (n > 3 && R() < .3 ? 1 : 0)), wl = Array(w * h).fill(false);
      for(let x = 0; x < w; x++) wl[x] = wl[(h - 1) * w + x] = true; for(let y = 0; y < h; y++) wl[y * w] = wl[y * w + w - 1] = true;
      for(let k = 0, nw = Math.min(w * h / 5 | 0, 2 + (n / 2 | 0)); k < nw; k++) wl[(1 + (R() * (h - 2) | 0)) * w + 1 + (R() * (w - 2) | 0)] = true;
      const fl = []; wl.forEach((x, i) => { if(!x) fl.push(i); });
      const seen = new Set([fl[0]]), st2 = [fl[0]];
      while(st2.length){ const c = st2.pop(); for(const [dx, dy] of D4){ const q = c + dx + dy * w; if(!wl[q] && !seen.has(q)){ seen.add(q); st2.push(q); } } }
      if(seen.size !== fl.length || fl.length < B + 6) continue;
      for(let i = fl.length - 1; i > 0; i--){ const j = R() * (i + 1) | 0; [fl[i], fl[j]] = [fl[j], fl[i]]; }
      const gl = fl.slice(0, B), occ = new Set(gl); let pp = fl[B], pulls = 0;
      const need = at < 600 ? B * 3 : B * 2;
      for(let s = 0, ms = 700; s < ms && (s < 90 + n * 8 || pulls < need); s++){
        const [dx, dy] = D4[R() * 4 | 0], q = pp + dx + dy * w; if(wl[q] || occ.has(q)) continue;
        const bh = pp - dx - dy * w; if(occ.has(bh) && R() < .82){ occ.delete(bh); occ.add(pp); pulls++; } pp = q;
      }
      const bx = [...occ], off = bx.filter(b => !gl.includes(b)).length;
      if(pulls >= need && off >= (at < 600 ? Math.max(1, B - 1) : 1)) return { w, h, wl, gl, bx, pp };
    }
    const wl = Array(36).fill(false); for(let i = 0; i < 36; i++){ const x = i % 6, y = i / 6 | 0; if(!x || !y || x === 5 || y === 5) wl[i] = true; }
    return { w: 6, h: 6, wl, gl: [14], bx: [15], pp: 16 };
  }
  function load(n){
    level = clamp(n, 1, TOTAL); const L = gen(level); W = L.w; H = L.h; wall = L.wl; goals = L.gl; boxes = L.bx.slice(); p = L.pp; moves = pushes = 0; hist = []; won = false;
    $('#skOv', root).hidden = true; buildBoard(); info();
  }
  function buildBoard(){
    const b = $('#skB', root); b.style.gridTemplateColumns = `repeat(${W},1fr)`; b.style.aspectRatio = `${W}/${H}`; let h = '';
    for(let i = 0; i < W * H; i++) h += `<div class="skc ${wall[i] ? 'kw' : goals.includes(i) ? 'kg' : 'kf'}"></div>`;
    b.innerHTML = h;
    const sp = (cls, svg) => { const e = document.createElement('div'); e.className = 'ksp ' + cls; e.style.width = 100 / W + '%'; e.style.height = 100 / H + '%'; e.innerHTML = svg; b.appendChild(e); return e; };
    boxEls = boxes.map(() => sp('box', BOX)); pEl = sp('pl', PL); pos();
  }
  const BOX = '<svg viewBox="0 0 40 40"><rect x="4" y="4" width="32" height="32" rx="5" fill="#ff9a76" stroke="#8a2b12" stroke-width="2.200"/><path d="M4 4l32 32M36 4L4 36" stroke="#c93a1c" stroke-width="2.200"/><rect x="9" y="9" width="22" height="22" rx="3" fill="none" stroke="#c93a1c" stroke-width="1.800"/></svg>';
  const PL = '<svg viewBox="0 0 40 40"><circle cx="20" cy="23" r="12" fill="#EE4E2C" stroke="#073763" stroke-width="2.200"/><circle cx="20" cy="17" r="8" fill="#ffe3d6" stroke="#073763" stroke-width="2"/><path d="M11.500 15a8.500 8.500 0 0117 0z" fill="#073763"/><circle cx="17" cy="18" r="1.400" fill="#073763"/><circle cx="23" cy="18" r="1.400" fill="#073763"/><path d="M17.500 21.500q2.500 2 5 0" fill="none" stroke="#073763" stroke-width="1.500" stroke-linecap="round"/></svg>';
  function pos(){
    const t = i => `translate(${(i % W) * 100}%,${(i / W | 0) * 100}%)`;
    boxEls.forEach((e, k) => { e.style.transform = t(boxes[k]); e.classList.toggle('on', goals.includes(boxes[k])); }); pEl.style.transform = t(p);
  }
  function move(dx, dy){
    if(won) return; const q = p + dx + dy * W; if(wall[q]) return;
    const bi = boxes.indexOf(q); let pushed = false;
    if(bi >= 0){ const q2 = q + dx + dy * W; if(wall[q2] || boxes.includes(q2)) return; hist.push({ p, boxes: boxes.slice(), moves, pushes }); boxes[bi] = q2; pushes++; pushed = true; X.tone(200, 0, .06, 'square', .12); }
    else hist.push({ p, boxes: boxes.slice(), moves, pushes });
    p = q; moves++; if(!pushed) X.tone(420, 0, .03, 'sine', .06); pos(); info();
    if(boxes.every(b => goals.includes(b))) win();
  }
  function win(){
    won = true; X.beep(true); const k = 'sk' + level, rec = best.set(k, moves); prog = Math.max(prog, level + 1); st.set('spx_sk', prog);
    const ov = $('#skOv', root); ov.hidden = false;
    ov.innerHTML = `<h4>Hoàn thành!</h4><p>Số bước ${moves} · Đẩy ${pushes}${rec ? ' · Kỷ lục mới!' : ''}</p>${level < TOTAL ? '<button class="btn b2" id="skNext">Màn tiếp</button>' : ''}`;
    if(level < TOTAL) $('#skNext', root).onclick = () => load(level + 1); info();
  }
  function undo(){ if(won || !hist.length) return; const h = hist.pop(); p = h.p; boxes = h.boxes; moves = h.moves; pushes = h.pushes; pos(); info(); }
  function info(){
    $('#skLv', root).textContent = `Màn ${level} / ${TOTAL}`; $('#skM', root).textContent = moves; $('#skP', root).textContent = pushes;
    const b = best.get()['sk' + level]; $('#skBest', root).textContent = b ? 'Kỷ lục: ' + b : '';
    $('#skPrev', root).disabled = level <= 1; $('#skNx', root).disabled = level >= Math.min(TOTAL, prog);
  }
  function levelGrid(){
    const ov = $('#skSel', root); ov.hidden = false;
    ov.innerHTML = `<h4>Chọn màn</h4><div class="klv" style="width:100%;max-width:300px">${Array.from({ length: TOTAL }, (_, i) => { const n = i + 1; return `<button data-n="${n}" class="${n === level ? 'cur' : best.get()['sk' + n] ? 'dn' : ''}" ${n > prog ? 'disabled' : ''}>${n}</button>`; }).join('')}</div><button class="btn b3" id="skCl" style="width:auto;padding:0 24px">Đóng</button>`;
    $$('.klv button', ov).forEach(b => b.onclick = () => { ov.hidden = true; load(+b.dataset.n); }); $('#skCl', root).onclick = () => ov.hidden = true;
  }
  function build(){
    prog = st.get('spx_sk', 1); level = Math.min(prog, TOTAL);
    root.innerHTML = `
      <div class="gbar"><div class="gstat" style="gap:8px"><div class="sbox"><span>Số bước</span><b id="skM">0</b></div><div class="sbox"><span>Đẩy</span><b id="skP">0</b></div></div>
        <div style="display:flex;gap:6px"><button class="face" id="skUndo" aria-label="Hoàn tác" style="font-size:0">${U.IC.undo}</button><button class="face" id="skRe" aria-label="Làm lại" style="font-size:0">${U.IC.new}</button></div></div>
      <div class="gcols"><div class="gL"><div class="gcard" style="padding:8px"><div class="bw"><div class="sk" id="skB"></div><div class="gov" id="skOv" hidden></div><div class="gov" id="skSel" hidden style="overflow:auto;justify-content:flex-start"></div></div></div></div>
      <div class="gR"><div class="gcard"><div style="display:flex;align-items:center;justify-content:space-between;gap:8px"><button class="face" id="skPrev" aria-label="Màn trước" style="font-size:0">${U.IC.back}</button><button class="chip on" id="skLv" style="height:36px;flex:1"></button><button class="face" id="skNx" aria-label="Màn sau" style="font-size:0;transform:scaleX(-1)">${U.IC.back}</button></div>
        <div class="kpad"><span></span><button data-d="0,-1">▲</button><span></span><button data-d="-1,0">◀</button><button data-d="0,1">▼</button><button data-d="1,0">▶</button></div>
        <div class="gtip" id="skBest"></div><div class="gtip" style="margin-top:2px">Vuốt hoặc dùng phím mũi tên để di chuyển · đẩy thùng vào các ô đích</div></div></div></div>`;
    const b = $('#skB', root); let s0 = null;
    b.addEventListener('pointerdown', e => { s0 = { x: e.clientX, y: e.clientY }; });
    b.addEventListener('pointermove', e => { if(!s0) return; const v = X.vec(e.clientX - s0.x, e.clientY - s0.y); if(Math.max(Math.abs(v.dx), Math.abs(v.dy)) < 20) return; Math.abs(v.dx) > Math.abs(v.dy) ? move(Math.sign(v.dx), 0) : move(0, Math.sign(v.dy)); s0 = { x: e.clientX, y: e.clientY }; });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => b.addEventListener(ev, () => s0 = null));
    $$('.kpad button', root).forEach(k => k.onclick = () => { const [dx, dy] = k.dataset.d.split(',').map(Number); move(dx, dy); });
    addEventListener('keydown', e => { if(!G.isOn('sokoban')) return; const m = { ArrowUp:[0, -1], ArrowDown:[0, 1], ArrowLeft:[-1, 0], ArrowRight:[1, 0] }[e.key]; if(m){ e.preventDefault(); move(...m); } else if(e.key === 'z') undo(); });
    $('#skUndo', root).onclick = undo; $('#skRe', root).onclick = () => load(level);
    $('#skPrev', root).onclick = () => load(level - 1); $('#skNx', root).onclick = () => load(level + 1); $('#skLv', root).onclick = levelGrid;
    load(level);
  }
  return { id: 'sokoban', name: 'Đẩy thùng gỗ', icon: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2.500"/><path d="M4 4l16 16M20 4L4 20"/></svg>', mount(el){ root = el; build(); }, _t: { gen } };
})();

/* ======================== NUÔI THÚ ẢO ======================== */
const Pet = (() => {
  const SP = { cat: { n: 'Mèo', c: '#ff9a76', d: '#EE4E2C' }, dog: { n: 'Cún', c: '#8fb8e3', d: '#3f86c9' }, bunny: { n: 'Thỏ', c: '#f4f8fc', d: '#b8c9dc' }, chick: { n: 'Gà con', c: '#ffd166', d: '#e0a200' } };
  const FOOD = { apple: ['🍎', 'Táo', 0, 18, 2], burger: ['🍔', 'Burger', 5, 35, 6], cake: ['🍰', 'Bánh kem', 8, 15, 16] };
  let root, P, tm, lastPet = 0, ballT = null, mgOn = false, pickSp = 'cat';
  const save = () => st.set('spx_pet', P);
  const age = () => (Date.now() - P.born) / 60000;
  const stage = () => age() < .4 ? 'egg' : age() < 60 ? 'baby' : age() < 360 ? 'child' : 'adult';
  const STN = { egg: 'Trứng', baby: 'Sơ sinh', child: 'Thiếu niên', adult: 'Trưởng thành' };
  const fmtAge = m => m < 1 ? '<1m' : m < 60 ? Math.floor(m) + 'm' : m < 1440 ? Math.floor(m / 60) + 'h ' + Math.floor(m % 60) + 'm' : Math.floor(m / 1440) + 'd ' + Math.floor(m % 1440 / 60) + 'h';
  function decay(m){
    if(P.sleep){ P.energy += 1.6 * m; P.hunger -= .25 * m; P.clean -= .15 * m; P.happy -= .1 * m; if(P.energy >= 100) P.sleep = false; }
    else { P.hunger -= .5 * m; P.happy -= .3 * m; P.energy -= .3 * m; P.clean -= (.25 + P.poops * .2) * m; if(stage() !== 'egg' && P.poops < 4 && Math.random() < .03 * m) P.poops++; }
    if(P.hunger < 25 || P.clean < 25) P.happy -= .35 * m;
    if(P.sick){ P.happy -= .4 * m; P.hunger -= .2 * m; }
    else if((P.clean < 12 || P.hunger < 8) && Math.random() < .03 * m) P.sick = true;
    ['hunger', 'happy', 'energy', 'clean'].forEach(k => P[k] = clamp(P[k], 0, 100));
  }
  function catchUp(){
    const now = Date.now(); const m = Math.min(600, (now - P.last) / 60000); P.last = now;
    if(m > .01){ const ch = Math.min(24, Math.ceil(m)); for(let i = 0; i < ch; i++) decay(m / ch); }
  }
  const mood = () => P.sleep ? 'sleep' : P.sick ? 'sick' : Math.min(P.hunger, P.happy, P.energy, P.clean) < 22 ? 'sad' : (P.hunger + P.happy + P.energy + P.clean) / 4 > 72 ? 'happy' : 'ok';
  function petSVG(sp, mo, stg){
    const s = SP[sp], o = '#073763';
    if(stg === 'egg') return `<svg viewBox="0 0 200 200"><ellipse cx="100" cy="112" rx="52" ry="68" fill="#fff6ee" stroke="${o}" stroke-width="4"/><path d="M60 100l16 12 14-14 14 14 14-12 16 12" fill="none" stroke="${s.d}" stroke-width="4" stroke-linecap="round"/><circle cx="80" cy="140" r="6" fill="${s.c}"/><circle cx="122" cy="132" r="9" fill="${s.c}"/></svg>`;
    let ears = '', extra = '';
    if(sp === 'cat') ears = `<path d="M50 78L44 28l42 28z M150 78l6-50-42 28z" fill="${s.c}" stroke="${o}" stroke-width="4" stroke-linejoin="round"/><path d="M52 62l-2-18 18 10z M148 62l2-18-18 10z" fill="#ffd2c6"/>`;
    if(sp === 'dog') ears = `<ellipse cx="44" cy="96" rx="20" ry="36" fill="${s.d}" stroke="${o}" stroke-width="4" transform="rotate(14 44 96)"/><ellipse cx="156" cy="96" rx="20" ry="36" fill="${s.d}" stroke="${o}" stroke-width="4" transform="rotate(-14 156 96)"/>`;
    if(sp === 'bunny') ears = `<ellipse cx="74" cy="36" rx="16" ry="44" fill="${s.c}" stroke="${o}" stroke-width="4"/><ellipse cx="126" cy="36" rx="16" ry="44" fill="${s.c}" stroke="${o}" stroke-width="4"/><ellipse cx="74" cy="40" rx="7" ry="30" fill="#ffd2c6"/><ellipse cx="126" cy="40" rx="7" ry="30" fill="#ffd2c6"/>`;
    if(sp === 'chick'){ ears = `<path d="M92 66q8-24 16 0M100 62q14-18 22 2" fill="none" stroke="${o}" stroke-width="4" stroke-linecap="round"/>`; extra = `<path d="M86 118l14 12 14-12z" fill="#EE4E2C" stroke="${o}" stroke-width="3" stroke-linejoin="round"/><ellipse cx="40" cy="124" rx="14" ry="22" fill="${s.d}" stroke="${o}" stroke-width="4"/><ellipse cx="160" cy="124" rx="14" ry="22" fill="${s.d}" stroke="${o}" stroke-width="4"/>`; }
    const body = `<ellipse cx="100" cy="124" rx="64" ry="58" fill="${s.c}" stroke="${o}" stroke-width="4"/>`;
    const belly = `<ellipse cx="100" cy="140" rx="36" ry="30" fill="#fff" opacity=".55"/>`;
    let eyes, mouth;
    if(mo === 'sleep'){ eyes = `<path d="M68 108q10 8 20 0M112 108q10 8 20 0" fill="none" stroke="${o}" stroke-width="4" stroke-linecap="round"/>`; mouth = `<ellipse cx="100" cy="132" rx="5" ry="4" fill="${o}"/>`; }
    else if(mo === 'sick'){ eyes = `<g stroke="${o}" stroke-width="4" stroke-linecap="round"><path d="M70 100l16 16M86 100L70 116M114 100l16 16M130 100l-16 16"/></g>`; mouth = `<path d="M82 136q9-8 18 0t18 0" fill="none" stroke="${o}" stroke-width="4" stroke-linecap="round"/>`; }
    else if(mo === 'sad'){ eyes = `<g class="peyes"><circle cx="78" cy="108" r="8" fill="${o}"/><circle cx="122" cy="108" r="8" fill="${o}"/><circle cx="75" cy="105" r="2.500" fill="#fff"/><circle cx="119" cy="105" r="2.500" fill="#fff"/></g><path d="M64 92l22 6M136 92l-22 6" stroke="${o}" stroke-width="4" stroke-linecap="round"/><path d="M164 112q4 10 0 16" stroke="#7fc8ff" stroke-width="5" fill="none" stroke-linecap="round" transform="translate(-30 -2)"/>`; mouth = `<path d="M86 140q14-12 28 0" fill="none" stroke="${o}" stroke-width="4" stroke-linecap="round"/>`; }
    else if(mo === 'happy'){ eyes = `<path d="M66 112q12-16 24 0M110 112q12-16 24 0" fill="none" stroke="${o}" stroke-width="5" stroke-linecap="round"/>`; mouth = `<path d="M84 128q16 22 32 0z" fill="#EE4E2C" stroke="${o}" stroke-width="4" stroke-linejoin="round"/>`; }
    else { eyes = `<g class="peyes"><circle cx="78" cy="108" r="8" fill="${o}"/><circle cx="122" cy="108" r="8" fill="${o}"/><circle cx="75" cy="105" r="2.800" fill="#fff"/><circle cx="119" cy="105" r="2.800" fill="#fff"/></g>`; mouth = `<path d="M88 132q12 10 24 0" fill="none" stroke="${o}" stroke-width="4" stroke-linecap="round"/>`; }
    const cheeks = mo === 'sleep' || mo === 'sick' ? '' : `<circle cx="60" cy="128" r="8" fill="#ff9aa8" opacity=".6"/><circle cx="140" cy="128" r="8" fill="#ff9aa8" opacity=".6"/>`;
    const tail = sp === 'cat' ? `<path d="M160 150q40 0 30-40" fill="none" stroke="${s.d}" stroke-width="12" stroke-linecap="round"/>` : sp === 'dog' ? `<path d="M160 150q34-4 26-30" fill="none" stroke="${s.d}" stroke-width="12" stroke-linecap="round"/>` : sp === 'bunny' ? `<circle cx="164" cy="160" r="12" fill="#fff" stroke="${o}" stroke-width="3"/>` : '';
    return `<svg viewBox="0 0 200 200">${tail}${ears}${body}${belly}${extra}${cheeks}${eyes}${sp === 'chick' ? '' : mouth}${sp === 'chick' ? mouth.replace(/y="132"/, 'y="146"') : ''}${sp === 'dog' ? `<ellipse cx="100" cy="124" rx="9" ry="6" fill="${o}"/>` : sp === 'cat' ? `<path d="M96 122l4 4 4-4z" fill="#ff7aa8" stroke="${o}" stroke-width="2"/><path d="M52 124h-18M52 132l-16 6M148 124h18M148 132l16 6" stroke="${o}" stroke-width="3" stroke-linecap="round"/>` : ''}</svg>`;
  }
  function fx(txt){ const sc = $('#ptSc', root); if(!sc) return; const e = document.createElement('span'); e.className = 'pfx'; e.textContent = txt; e.style.left = 35 + Math.random() * 30 + '%'; e.style.top = 30 + Math.random() * 15 + '%'; sc.appendChild(e); setTimeout(() => e.remove(), 1100); }
  function render(){
    if(!P){ chooser(); return; }
    $('#ptAdopt', root).hidden = true; $('#ptMain', root).hidden = false;
    const stg = stage(), mo = mood(), scale = { egg: .62, baby: .6, child: .8, adult: 1 }[stg];
    const pet = $('#ptPet', root); pet.innerHTML = petSVG(P.sp, stg === 'egg' ? 'ok' : mo, stg); pet.style.width = 56 * scale + '%'; pet.style.top = (stg === 'egg' ? 38 : 36 + (1 - scale) * 14) + '%'; pet.classList.toggle('slp', mo === 'sleep');
    $('#ptDim', root).classList.toggle('on', P.sleep);
    $('#ptBub', root).innerHTML = P.sleep ? '<span>💤</span>' : P.sick ? '<span>🤒</span>' : mo === 'sad' ? '<span>😢</span>' : '';
    $('#ptBub', root).hidden = !$('#ptBub', root).innerHTML;
    $('#ptPoops', root).innerHTML = Array.from({ length: P.poops }, (_, i) => `<span class="ppoop" data-i="${i}" style="left:${12 + i * 20}%;top:${68 + (i % 2) * 8}%">💩</span>`).join('');
    $$('.ppoop', root).forEach(e => e.onclick = () => { P.poops--; P.coins++; P.clean = clamp(P.clean + 6, 0, 100); fx('+1 xu'); X.tone(660, 0, .05, 'sine', .14); save(); render(); });
    [['hunger', 'ptH'], ['happy', 'ptP'], ['energy', 'ptE'], ['clean', 'ptC']].forEach(([k, id]) => { const b = $('#' + id + ' b', root); b.style.width = P[k] + '%'; b.style.background = P[k] < 25 ? 'var(--err)' : P[k] < 55 ? '#ff9a3c' : 'var(--ok)'; });
    $('#ptCoin', root).textContent = P.coins; $('#ptName', root).textContent = `${P.name} · ${STN[stg]}`; $('#ptAge', root).textContent = 'Tuổi: ' + fmtAge(age());
    $('#ptSleep span:first-child', root).textContent = P.sleep ? '☀️' : '🌙'; $('#ptSleep span:last-child', root).textContent = P.sleep ? 'Dậy' : 'Ngủ';
    $('#ptSleep', root).classList.toggle('on', P.sleep);
  }
  function chooser(){
    $('#ptMain', root).hidden = true; $('#ptAdopt', root).hidden = false;
    $('#ptChoose', root).innerHTML = Object.entries(SP).map(([k, s]) => `<button data-s="${k}" class="${k === pickSp ? 'on' : ''}">${petSVG(k, 'happy', 'baby')}${s.n}</button>`).join('');
    $$('#ptChoose button', root).forEach(b => b.onclick = () => { pickSp = b.dataset.s; chooser(); });
  }
  function adopt(){
    const nm = ($('#ptNm', root).value || '').trim() || SP[pickSp].n;
    P = { sp: pickSp, name: nm.slice(0, 14), born: Date.now(), last: Date.now(), hunger: 80, happy: 80, energy: 90, clean: 90, coins: 10, sleep: false, sick: false, poops: 0, daily: '' };
    save(); render();
  }
  function act(a){
    if(!P || stage() === 'egg') return;
    if(a === 'sleep'){ P.sleep = !P.sleep; X.toast(P.sleep ? 'Thú cưng đã đi ngủ' : 'Thú cưng đã thức dậy', 'info'); }
    else if(P.sleep) return X.toast('Thú cưng đang ngủ', 'info');
    else if(a === 'bath'){ P.clean = 100; P.happy = clamp(P.happy - 3, 0, 100); fx('🫧'); fx('🫧'); X.toast('Thú cưng vừa tắm xong!', 'ok'); X.tone(800, 0, .05, 'sine', .12); }
    else if(a === 'med'){
      if(!P.sick) return X.toast('Thú cưng không ốm', 'info'); if(P.coins < 10) return X.toast('Không đủ xu', 'err');
      P.coins -= 10; P.sick = false; P.happy = clamp(P.happy + 10, 0, 100); fx('💊'); X.toast('Đã khỏi bệnh!', 'ok'); X.beep(true);
    }
    save(); render();
  }
  function feed(k){
    const [em, , cost, hg, hp] = FOOD[k]; $('#ptMenu', root).hidden = true;
    if(P.sleep) return X.toast('Thú cưng đang ngủ', 'info'); if(P.hunger > 94) return X.toast('Thú cưng đang no', 'info'); if(P.coins < cost) return X.toast('Không đủ xu', 'err');
    P.coins -= cost; P.hunger = clamp(P.hunger + hg, 0, 100); P.happy = clamp(P.happy + hp, 0, 100); fx(em); fx('😋'); X.tone(520, 0, .06, 'square', .12); X.tone(660, .07, .06, 'square', .12); save(); render();
  }
  function play(){
    if(!P || stage() === 'egg') return; if(P.sleep) return X.toast('Thú cưng đang ngủ', 'info'); if(P.sick) return X.toast('Thú cưng đang ốm, hãy cho uống thuốc', 'err'); if(P.energy < 15) return X.toast('Thú cưng quá mệt để chơi', 'err');
    const area = $('#ptGame', root); area.hidden = false; area.innerHTML = '<h4>Bắt bóng</h4><div id="ptGs" style="color:#fff;font-weight:800">0</div>'; let n = 0, t = 15; mgOn = true;
    const spawn = () => { if(!mgOn) return; const b = document.createElement('span'); b.className = 'pball'; b.textContent = ['⚽', '🎾', '🏀', '🏐'][rnd(4)]; b.style.left = 6 + Math.random() * 80 + '%'; b.style.animationDuration = 1.6 + Math.random() * 1.2 + 's';
      b.onpointerdown = e => { e.stopPropagation(); n++; $('#ptGs', root).textContent = n; X.tone(500 + n * 25, 0, .05, 'sine', .14); b.remove(); }; area.appendChild(b); setTimeout(() => b.remove(), 3000); };
    const iv = setInterval(spawn, 480), cd = setInterval(() => { t--; if(t <= 0){ clearInterval(iv); clearInterval(cd); mgOn = false; area.hidden = true; const coins = Math.floor(n * .8); P.coins += coins; P.happy = clamp(P.happy + Math.min(35, n * 3), 0, 100); P.energy = clamp(P.energy - 12, 0, 100); save(); render(); X.toast(`+${coins} xu`, 'ok'); X.beep(true); } }, 1000);
    spawn();
  }
  function tickFn(){
    if(!P || !G.isOn('pet') || mgOn) return;
    const was = stage(); catchUp(); if(was === 'egg' && stage() !== 'egg'){ X.toast('Trứng đã nở!', 'ok'); X.beep(true); }
    save(); render();
  }
  function build(){
    P = st.get('spx_pet', null);
    root.innerHTML = `
      <div id="ptAdopt" hidden><div class="gcard"><div class="lbl" style="margin-top:0">Chọn thú cưng của bạn</div><div class="pchoose" id="ptChoose"></div><input class="pnm" id="ptNm" maxlength="14" placeholder="Tên thú cưng"><button class="btn b2" id="ptGo" style="margin-top:10px">Nhận nuôi</button></div></div>
      <div id="ptMain" hidden>
        <div class="gbar"><div class="gstat" style="gap:8px"><div class="sbox"><span>Xu</span><b id="ptCoin">0</b></div></div><div style="text-align:right"><div style="font-weight:800;font-size:13px" id="ptName"></div><div class="gtip" style="margin:0" id="ptAge"></div></div></div>
        <div class="gcols"><div class="gL"><div class="gcard" style="padding:8px;position:relative"><div class="ps" id="ptSc"><div class="pwin"></div><div class="pet" id="ptPet"></div><div id="ptPoops"></div><div class="pbub" id="ptBub" hidden></div><div class="pdim" id="ptDim"></div></div>
          <div class="pmenu" id="ptMenu" hidden><h4>Cho ăn</h4>${Object.entries(FOOD).map(([k, f]) => `<button class="fd" data-f="${k}"><span>${f[0]} ${f[1]}</span><span>${f[2] ? f[2] + ' xu' : 'Miễn phí'}</span></button>`).join('')}<button class="btn b3" id="ptMc" style="width:auto;padding:0 22px;height:38px">Đóng</button></div>
          <div class="pmenu" id="ptGame" hidden style="overflow:hidden"></div></div></div>
        <div class="gR"><div class="gcard"><div class="pst"><div class="pbar" id="ptH">🍖 Đói<i><b></b></i></div><div class="pbar" id="ptP">😊 Vui<i><b></b></i></div><div class="pbar" id="ptE">⚡ Năng lượng<i><b></b></i></div><div class="pbar" id="ptC">🛁 Sạch sẽ<i><b></b></i></div></div></div>
          <div class="gbtns c4" style="grid-template-columns:repeat(5,1fr)"><button class="gb" id="ptFeed"><span style="font-size:19px">🍎</span><span>Cho ăn</span></button><button class="gb" id="ptPlay"><span style="font-size:19px">⚽</span><span>Chơi</span></button><button class="gb" id="ptBath"><span style="font-size:19px">🛁</span><span>Tắm</span></button><button class="gb" id="ptSleep"><span style="font-size:19px">🌙</span><span>Ngủ</span></button><button class="gb" id="ptMed"><span style="font-size:19px">💊</span><span>Thuốc</span></button></div>
          <button class="btn b1" id="ptNew" style="margin-top:9px;width:100%">${U.IC.new}Nhận nuôi thú mới</button><div class="gtip">Chạm vào thú để vuốt ve · chạm 💩 để dọn dẹp và nhận xu</div></div></div></div>`;
    $('#ptGo', root).onclick = adopt;
    $('#ptPet', root).onclick = () => {
      if(!P) return; const now = Date.now();
      if(stage() === 'egg'){ P.born -= 6000; save(); render(); fx('✨'); X.tone(400, 0, .05, 'square', .1); return; }
      if(P.sleep || now - lastPet < 900) return; lastPet = now; P.happy = clamp(P.happy + 3, 0, 100); fx('❤️'); X.tone(900, 0, .06, 'sine', .12); save(); render();
    };
    $('#ptFeed', root).onclick = () => { if(P && stage() !== 'egg') $('#ptMenu', root).hidden = false; };
    $('#ptMc', root).onclick = () => $('#ptMenu', root).hidden = true;
    $$('.fd', root).forEach(b => b.onclick = () => feed(b.dataset.f));
    $('#ptPlay', root).onclick = play; $('#ptBath', root).onclick = () => act('bath'); $('#ptSleep', root).onclick = () => act('sleep'); $('#ptMed', root).onclick = () => act('med');
    $('#ptNew', root).onclick = () => { if(confirm('Bạn chắc chắn muốn nhận nuôi thú mới? Thú hiện tại sẽ rời đi.')){ P = null; st.set('spx_pet', null); chooser(); } };
    if(P){ catchUp(); const today = new Date().toDateString(); if(P.daily !== today && stage() !== 'egg'){ P.daily = today; P.coins += 20; X.toast('Quà hằng ngày: +20 xu', 'ok'); } save(); }
    render(); setInterval(tickFn, 5000);
  }
  return { id: 'pet', name: 'Nuôi thú ảo', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="14" r="7"/><path d="M6 9L5 3l5 3M18 9l1-6-5 3"/><circle cx="9.500" cy="13" r=".8" fill="currentColor"/><circle cx="14.500" cy="13" r=".8" fill="currentColor"/><path d="M10 16.500q2 1.500 4 0"/></svg>', mount(el){ root = el; build(); }, show(){ if(P){ catchUp(); render(); } } };
})();

[Gold, Soko, Pet].forEach(g => G.register(g));
G._sk = Soko._t;
})();
