/* SPX Express – Trò chơi (phần D): Jewels Classic · Domino · Lật bài trí nhớ */
(() => {
'use strict';
const G = window.SPXGames, X = window.SPX, st = X.store, U = G.u;
const { $, $$, fmt, rnd, shuffle, best } = U;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const chips = (attr, items) => items.map(([v, t]) => `<button class="chip" data-${attr}="${v}">${t}</button>`).join('');

X.extend({
  'Jewels Classic':'Jewels Classic','Domino':'Domino','Lật bài':'Memory Match','Cổ điển':'Classic','Tính giờ':'Timed','Cấp':'Level','Thời gian':'Time',
  'Hết nước đi':'No moves left','Hết giờ':'Time is up','Qua màn':'Level up','Hoán đổi hai viên liền kề để tạo hàng 3 viên trở lên':'Swap two adjacent gems to make a line of 3 or more',
  'Hàng 4 tạo viên Bom · hàng 5 tạo viên Cầu vồng':'Match 4 for a Bomb · match 5 for a Rainbow gem','Xáo lại bàn':'Board reshuffled','Trò chơi kết thúc':'Game over',
  'Chơi lại':'Play again','Mục tiêu':'Goal','Bạn':'You','Máy':'Computer','Đích':'Target','Bốc bài':'Draw','Bỏ lượt':'Pass','Đầu trái':'Left end','Đầu phải':'Right end',
  'Không đi được quân này':'That tile cannot be played','Chọn đầu để đặt quân':'Choose an end','Trái':'Left','Phải':'Right','Kho':'Stock','Ván tiếp theo':'Next round',
  'Trận mới':'New match','Bạn thắng ván!':'You win the round!','Máy thắng ván!':'Computer wins the round!','Ván hòa':'Round tied','Bạn thắng trận!':'You win the match!',
  'Máy thắng trận!':'Computer wins the match!','Chạm quân để đánh · hết quân là thắng':'Tap a tile to play · empty your hand to win','Lượt của bạn':'Your turn',
  'Lượt của máy':'Computer is playing','Hết quân - Domino!':'Domino!','Bàn bị khóa':'Blocked board','Số lần lật':'Flips','Đã tìm':'Found','Thú':'Animals',
  'Trái cây':'Fruits','Xe cộ':'Vehicles','Xem trước':'Preview','Chủ đề':'Theme','Cỡ bàn':'Grid size','Hoàn thành!':'Completed!','Bạn đã ghép hết các cặp':'You matched every pair',
  'Chạm hai lá bài giống nhau để ghép cặp':'Tap two identical cards to match them','Gợi ý':'Hint','Ván mới':'New game','Bật':'On','Tắt':'Off','Kỷ lục mới!':'New record!'
}, [[/^Điểm (\d+)$/, (m, a) => 'Score ' + a], [/^Máy bốc (\d+) quân$/, (m, a) => 'Computer drew ' + a + ' tile(s)'], [/^\+(\d+) điểm$/, (m, a) => '+' + a + ' points'],
    [/^Kỷ lục: (.+)$/, (m, a) => 'Best: ' + a], [/^Đầu trái: (.+) · Đầu phải: (.+)$/, (m, a, b) => 'Left end: ' + a + ' · Right end: ' + b]]);

const CSS = `
/* Jewels */
.jb{position:relative;aspect-ratio:1;background:linear-gradient(160deg,#0d2a47,#06182b);border-radius:12px;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
.jb::before{content:"";position:absolute;inset:0;background:linear-gradient(45deg,rgba(255,255,255,.04) 25%,transparent 25% 50%,rgba(255,255,255,.04) 50% 75%,transparent 75%);background-size:25% 25%}
.jg{position:absolute;left:0;top:0;width:12.5%;height:12.5%;transition:transform .2s ease,opacity .22s,filter .2s}
.jg svg{width:76%;height:76%;margin:12%;display:block;filter:drop-shadow(0 2px 2px rgba(0,0,0,.4))}
.jg.sel{filter:brightness(1.35);animation:jsel .5s ease-in-out infinite alternate}
.jg.hint{animation:jsel .35s ease-in-out infinite alternate}
.jg.pop{transform-origin:center;opacity:0!important;filter:brightness(2)}
.jg.b::after{content:"";position:absolute;inset:3%;border-radius:50%;border:3px solid #ffd166;box-shadow:0 0 10px #ffd166,inset 0 0 8px #ffd166;animation:jspin 1.2s linear infinite}
.jg.r i{display:block;width:76%;height:76%;margin:12%;border-radius:50%;background:conic-gradient(#EE4E2C,#ffd166,#1a9e5c,#3f86c9,#8e5bd6,#ff7aa8,#EE4E2C);border:2px solid #fff;box-shadow:0 0 12px rgba(255,255,255,.7);animation:jspin 2s linear infinite}
@keyframes jsel{from{transform-origin:center;filter:brightness(1.1)}to{filter:brightness(1.6)}}
@keyframes jspin{to{transform:rotate(360deg)}}
.jbar{height:9px;border-radius:9px;background:var(--line);overflow:hidden;margin-top:8px}
.jbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--brand),#ffd166);transition:width .3s}
/* Domino */
.dt{display:inline-flex;background:#fffdf7;border:1.5px solid var(--navy);border-radius:7px;box-shadow:0 2px 0 rgba(var(--navy-rgb),.35);position:relative;flex:none}
.dt.h{flex-direction:row;width:44px;height:23px}.dt.v{flex-direction:column;width:23px;height:44px}
.dt.hand{width:30px;height:58px;flex-direction:column;cursor:pointer;transition:transform .15s}
.dt.hand.ok{box-shadow:0 0 0 2px var(--brand),0 3px 8px rgba(var(--brand-rgb),.5);transform:translateY(-4px)}
.dt.hand.dim{opacity:.55}
.dt.hand.hint{animation:jsel .4s ease-in-out infinite alternate}
.dt.hand.chosen{transform:translateY(-8px);box-shadow:0 0 0 3px #ffd166}
.dt.new{animation:dnew .35s ease}
@keyframes dnew{from{transform:scale(1.6);opacity:0}to{transform:none;opacity:1}}
.dhf{flex:1;display:grid;place-items:center;min-width:0;min-height:0}
.dsep{background:var(--navy);flex:none}
.dt.h .dsep{width:1.5px;margin:3px 0}.dt.v .dsep,.dt.hand .dsep{height:1.5px;margin:0 3px}
.dp{width:78%;height:78%;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr)}
.dp i{margin:14%;border-radius:50%;background:var(--navy)}
.dt .dhf:last-child .dp i{background:var(--brand)}
.dp b{display:block}
.dback{display:inline-block;width:20px;height:38px;border-radius:6px;background:linear-gradient(135deg,var(--navy),#2a6cb0);border:1.5px solid #fff;margin-right:-8px;box-shadow:0 1px 2px rgba(0,0,0,.3)}
.dch{min-height:120px;max-height:230px;overflow:auto;display:flex;flex-wrap:wrap;gap:3px;justify-content:center;align-content:flex-start;padding:10px 6px;background:radial-gradient(circle at 50% 40%,#1c5a9a,#0d2a47);border-radius:12px;color:#fff}
.dch .dt{box-shadow:0 2px 3px rgba(0,0,0,.45)}
.dchoice{display:flex;gap:8px;justify-content:center;margin-top:8px}
.dchoice[hidden]{display:none}
.dhandw{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:10px;min-height:66px}
.dai{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:12px;font-weight:700;color:var(--muted)}
.dends{text-align:center;font-size:11.5px;font-weight:700;color:var(--muted);margin:7px 0 2px}
/* Lật bài */
.mg{display:grid;gap:7px;max-width:var(--bs,420px);margin:0 auto}
.mcd{aspect-ratio:3/4;perspective:600px;cursor:pointer;padding:0;background:none;border:0}
.mcd>div{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .4s}
.mcd.up>div{transform:rotateY(180deg)}
.mcd .fa,.mcd .ba{position:absolute;inset:0;border-radius:11px;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:grid;place-items:center}
.mcd .fa{background:linear-gradient(135deg,var(--navy),#2a6cb0);box-shadow:var(--shadow);border:2px solid rgba(255,255,255,.7)}
.mcd .fa::after{content:"?";color:#fff;font-weight:800;font-size:clamp(16px,6vw,28px);opacity:.8}
.mcd .ba{background:var(--card);border:2px solid var(--line);transform:rotateY(180deg);font-size:clamp(24px,9vw,44px)}
.mcd.ok .ba{border-color:var(--ok);background:rgba(26,158,92,.12);animation:mpop .4s}
@keyframes mpop{50%{transform:rotateY(180deg) scale(1.12)}}
.mcd.hint .fa{animation:jsel .35s ease-in-out infinite alternate}
`;
{ const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }

/* ======================== JEWELS CLASSIC ======================== */
const Jewels = (() => {
  const N = 8, COL = ['#EE4E2C', '#3f86c9', '#ffd166', '#1a9e5c', '#8e5bd6', '#ff7aa8', '#e8f0f8'];
  const SH = ['<circle cx="20" cy="20" r="14.500"/>', '<path d="M20 4l15 16-15 16L5 20z"/>', '<path d="M20 4l4.800 10 11 1.400-8 7.600 2 10.900L20 28.200 10.200 33.900l2-10.900-8-7.600 11-1.400z"/>',
    '<path d="M20 4l14 8v16l-14 8-14-8V12z"/>', '<path d="M20 5l15 27H5z"/>', '<path d="M20 34S5 24 5 14a8 8 0 0115-3 8 8 0 0115 3c0 10-15 20-15 20z"/>', '<rect x="7" y="7" width="26" height="26" rx="6"/>'];
  let root, g, uid, els, score, level, goal, prog, time, mode = 'classic', busy, over, sel, tmr;
  const gem = (t, sp) => ({ id: ++uid, t: t === undefined ? rnd(7) : t, sp: sp || '' });
  const svg = t => `<svg viewBox="0 0 40 40"><g fill="${COL[t]}" stroke="#073763" stroke-width="2" stroke-linejoin="round">${SH[t]}</g><ellipse cx="14" cy="13" rx="5" ry="3" fill="#fff" opacity=".55" transform="rotate(-30 14 13)"/></svg>`;
  const rc = i => [i / N | 0, i % N];
  function fresh(){
    do{
      g = Array(N * N).fill(null);
      for(let i = 0; i < N * N; i++){ let t; do t = rnd(7); while(i % N > 1 && g[i - 1].t === t && g[i - 2].t === t || i > 2 * N - 1 && g[i - N].t === t && g[i - 2 * N].t === t); g[i] = gem(t); }
    }while(!findMove());
  }
  function runs(pref){
    const cells = new Set(), sps = [];
    const scan = (idxs, key) => {
      let a = 0;
      while(a < idxs.length){
        let b = a; const c = g[idxs[a]];
        while(b + 1 < idxs.length && c && g[idxs[b + 1]] && g[idxs[b + 1]].t === c.t && g[idxs[b + 1]].sp !== 'r' && c.sp !== 'r') b++;
        const len = b - a + 1;
        if(c && c.sp !== 'r' && len >= 3){
          const run = idxs.slice(a, b + 1); run.forEach(i => cells.add(i));
          if(len >= 4){ const at = run.find(i => pref && pref.includes(i)) ?? run[len >> 1]; sps.push([at, len >= 5 ? 'r' : 'b', c.t]); }
        }
        a = b + 1;
      }
    };
    for(let r = 0; r < N; r++) scan([...Array(N).keys()].map(c => r * N + c));
    for(let c = 0; c < N; c++) scan([...Array(N).keys()].map(r => r * N + c));
    return { cells, sps };
  }
  function findMove(){
    for(let i = 0; i < N * N; i++){
      const [r, c] = rc(i);
      for(const j of [c < N - 1 ? i + 1 : -1, r < N - 1 ? i + N : -1]){
        if(j < 0) continue;
        if(g[i].sp === 'r' || g[j].sp === 'r') return [i, j];
        [g[i], g[j]] = [g[j], g[i]]; const ok = runs().cells.size > 0; [g[i], g[j]] = [g[j], g[i]];
        if(ok) return [i, j];
      }
    }
    return null;
  }
  function place(el, i, from){
    const [r, c] = rc(i);
    if(from !== undefined){ el.style.transition = 'none'; el.style.transform = `translate(${c * 100}%,${from * 100}%)`; void el.offsetWidth; el.style.transition = ''; }
    el.style.transform = `translate(${c * 100}%,${r * 100}%)`;
  }
  function draw(newFrom){
    const b = $('#jbB', root);
    g.forEach((gm, i) => {
      if(!gm) return; let el = els.get(gm.id);
      if(!el){ el = document.createElement('div'); el.dataset.id = gm.id; b.appendChild(el); els.set(gm.id, el); }
      el.className = 'jg' + (gm.sp ? ' ' + gm.sp : '') + (sel === i ? ' sel' : '');
      el.innerHTML = gm.sp === 'r' ? '<i></i>' : svg(gm.t);
      const nf = newFrom && newFrom.get(gm.id); place(el, i, nf);
    });
    $('#jwS', root).textContent = score; $('#jwL', root).textContent = level;
    $('#jwBar', root).style.width = (mode === 'classic' ? Math.min(100, prog / goal * 100) : Math.max(0, time / 90 * 100)) + '%';
    $('#jwT', root).textContent = mode === 'classic' ? goal : fmt(Math.max(0, time));
    $('#jwTl', root).textContent = mode === 'classic' ? 'Mục tiêu' : 'Thời gian';
    $$('[data-md]', root).forEach(c => c.classList.toggle('on', c.dataset.md === mode));
    const bs = best.get()['jw_' + mode]; $('#jwBest', root).textContent = bs ? 'Kỷ lục: ' + (-bs) : '';
  }
  const idxOf = id => g.findIndex(x => x && x.id === id);
  async function trySwap(a, b){
    if(busy || over) return; busy = true; sel = -1;
    const A = g[a], B = g[b]; [g[a], g[b]] = [g[b], g[a]]; draw(); await sleep(190);
    let forced = null;
    if(A.sp === 'r' || B.sp === 'r'){
      forced = new Set(); const tgt = A.sp === 'r' ? B : A;
      g.forEach((x, i) => { if(x && (x.sp === 'r' && (x === A || x === B) || (tgt.sp !== 'r' && x.t === tgt.t) || (A.sp === 'r' && B.sp === 'r'))) forced.add(i); });
    }else if(!runs().cells.size){
      [g[a], g[b]] = [g[b], g[a]]; draw(); await sleep(190); busy = false; X.tone(180, 0, .12, 'square', .1); return;
    }
    await resolve([a, b], forced);
    busy = false; afterMove();
  }
  async function resolve(pref, forced){
    let combo = 0;
    for(;;){
      let cells, sps = [];
      if(forced){ cells = forced; forced = null; } else { const r = runs(pref); cells = r.cells; sps = r.sps; }
      if(!cells.size) break; combo++; pref = null;
      const q = [...cells];
      while(q.length){ const i = q.pop(), gm = g[i]; if(gm && gm.sp === 'b'){ const [r, c] = rc(i); for(let dr = -1; dr <= 1; dr++) for(let dc = -1; dc <= 1; dc++){ const rr = r + dr, cc = c + dc; if(rr < 0 || rr >= N || cc < 0 || cc >= N) continue; const j = rr * N + cc; if(g[j] && !cells.has(j)){ cells.add(j); q.push(j); } } } }
      const pts = cells.size * 10 * combo + sps.length * 50; score += pts; prog += pts;
      cells.forEach(i => { const e = els.get(g[i].id); if(e) e.classList.add('pop'); });
      X.tone(520 + combo * 90, 0, .09, 'sine', .18); X.tone(780 + combo * 90, .07, .1, 'sine', .14);
      await sleep(240);
      cells.forEach(i => { const e = els.get(g[i].id); if(e){ e.remove(); els.delete(g[i].id); } g[i] = null; });
      sps.forEach(([i, sp, t]) => { g[i] = gem(t, sp); });
      const from = new Map();
      for(let c = 0; c < N; c++){
        let w = N - 1;
        for(let r = N - 1; r >= 0; r--){ const gm = g[r * N + c]; if(gm){ if(w !== r){ g[w * N + c] = gm; g[r * N + c] = null; } w--; } }
        for(let r = w, k = w + 1; r >= 0; r--){ const gm = gem(); g[r * N + c] = gm; from.set(gm.id, r - k); }
      }
      draw(from); await sleep(300);
      if(mode === 'classic' && prog >= goal){ level++; prog -= goal; goal = Math.round(goal * 1.4 / 100) * 100; X.toast('Qua màn ' + level, 'ok'); X.beep(true); }
      draw();
    }
  }
  function afterMove(){
    draw();
    if(!findMove()){
      if(mode === 'classic') return end('Hết nước đi');
      fresh(); els.forEach(e => e.remove()); els.clear(); draw(); X.toast('Xáo lại bàn', 'info');
    }
  }
  function end(msg){
    over = true; X.beep(false); const key = 'jw_' + mode, rec = best.set(key, -score);
    const ov = $('#jwOv', root); ov.hidden = false;
    ov.innerHTML = `<h4>${msg}</h4><p>Điểm ${score}${rec ? ' · Kỷ lục mới!' : ''}</p><button class="btn b2" id="jwAgain">Chơi lại</button>`;
    $('#jwAgain', root).onclick = newGame;
  }
  function newGame(){
    uid = 0; els.forEach(e => e.remove()); els.clear(); score = 0; level = 1; goal = 800; prog = 0; time = 90; busy = false; over = false; sel = -1;
    $('#jwOv', root).hidden = true; fresh(); draw(new Map(g.map((x, i) => [x.id, -1 - (i / N | 0)])));
  }
  function hint(){
    if(busy || over) return; const m = findMove(); if(!m) return;
    m.forEach(i => { const e = els.get(g[i].id); if(e){ e.classList.add('hint'); setTimeout(() => e.classList.remove('hint'), 1800); } });
  }
  function build(){
    mode = st.get('spx_jw_mode', 'classic'); els = new Map(); uid = 0;
    root.innerHTML = `
      <div class="gbar"><div class="gstat" style="gap:8px"><div class="sbox"><span>Điểm</span><b id="jwS">0</b></div><div class="sbox"><span>Cấp</span><b id="jwL">1</b></div><div class="sbox"><span id="jwTl">Mục tiêu</span><b id="jwT">800</b></div></div>
        <button class="face" id="jwNew" aria-label="Ván mới" style="font-size:0">${U.IC.new}</button></div>
      <div class="gcols"><div class="gL"><div class="gcard" style="padding:6px"><div class="bw"><div class="jb" id="jbB"></div><div class="gov" id="jwOv" hidden></div></div><div class="jbar"><i id="jwBar"></i></div></div></div>
      <div class="gR"><div class="gcard"><div class="opt"><div class="lbl">Chế độ</div><div class="chips">${chips('md', [['classic', 'Cổ điển'], ['time', 'Tính giờ']])}</div></div>
        <div class="gbtns c2"><button class="gb" id="jwHint">${U.IC.hint}<span>Gợi ý</span></button><button class="gb" id="jwNew2">${U.IC.new}<span>Ván mới</span></button></div>
        <div class="gtip" id="jwBest"></div><div class="gtip" style="margin-top:2px">Hoán đổi hai viên liền kề để tạo hàng 3 viên trở lên</div><div class="gtip" style="margin-top:2px">Hàng 4 tạo viên Bom · hàng 5 tạo viên Cầu vồng</div></div></div></div>`;
    const b = $('#jbB', root); let p = null;
    b.addEventListener('pointerdown', e => { const el = e.target.closest('.jg'); if(!el || busy || over) return; p = { i: idxOf(+el.dataset.id), x: e.clientX, y: e.clientY, done: false }; });
    b.addEventListener('pointermove', e => {
      if(!p || p.done) return; const v = X.vec(e.clientX - p.x, e.clientY - p.y);
      if(Math.max(Math.abs(v.dx), Math.abs(v.dy)) < 16) return; p.done = true;
      const [r, c] = rc(p.i), [nr, nc] = Math.abs(v.dx) > Math.abs(v.dy) ? [r, c + Math.sign(v.dx)] : [r + Math.sign(v.dy), c];
      if(nr >= 0 && nr < N && nc >= 0 && nc < N) trySwap(p.i, nr * N + nc);
    });
    b.addEventListener('pointerup', () => {
      if(!p) return; const q = p; p = null; if(q.done || busy || over) return;
      if(sel < 0) sel = q.i; else if(sel === q.i) sel = -1;
      else { const [r1, c1] = rc(sel), [r2, c2] = rc(q.i); if(Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1){ trySwap(sel, q.i); return; } sel = q.i; }
      draw();
    });
    b.addEventListener('pointercancel', () => p = null);
    $$('[data-md]', root).forEach(c => c.onclick = () => { mode = c.dataset.md; st.set('spx_jw_mode', mode); newGame(); });
    $('#jwNew', root).onclick = newGame; $('#jwNew2', root).onclick = newGame; $('#jwHint', root).onclick = hint;
    tmr = setInterval(() => { if(!G.isOn('jewels') || mode !== 'time' || over || busy) return; time--; draw(); if(time <= 0) end('Hết giờ'); }, 1000);
    newGame();
  }
  return { id: 'jewels', name: 'Jewels Classic', icon: '<svg viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M9 3l-2 6 5 12 5-12-2-6"/></svg>', mount(el){ root = el; build(); } };
})();

/* ======================== DOMINO ======================== */
const Domino = (() => {
  const PIPS = [[], [4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]];
  const half = v => `<span class="dp">${Array.from({ length: 9 }, (_, i) => PIPS[v].includes(i) ? '<i></i>' : '<b></b>').join('')}</span>`;
  const tile = (t, cls) => `<div class="dt ${cls}"><span class="dhf">${half(t[0])}</span><span class="dsep"></span><span class="dhf">${half(t[1])}</span></div>`;
  const pips = h => h.reduce((s, t) => s + t[0] + t[1], 0);
  let root, S, level = 'med', target = 100, scr = { me: 0, ai: 0 }, thinking = false;
  const L = () => S.chain[0][0], R = () => S.chain[S.chain.length - 1][1];
  function ends(t){ if(!S.chain.length) return ['R']; const o = []; if(t[0] === L() || t[1] === L()) o.push('L'); if(t[0] === R() || t[1] === R()) o.push('R'); return o; }
  function playable(h){ const o = []; h.forEach((t, i) => ends(t).forEach(e => o.push([i, e]))); return o; }
  function deal(){
    const all = []; for(let a = 0; a <= 6; a++) for(let b = a; b <= 6; b++) all.push([a, b]); shuffle(all);
    S = { me: all.splice(0, 7), ai: all.splice(0, 7), stock: all, chain: [], turn: 'me', passes: 0, over: null, sel: -1, hint: -1, miss: new Set(), msg: '', lastNew: -1 };
    let best = null, who = 'me';
    for(const w of ['me', 'ai']) for(const t of S[w]) { const k = t[0] === t[1] ? 100 + t[0] : t[0] + t[1]; if(!best || k > best.k){ best = { k, t, w }; } }
    who = best.w; const h = S[who]; h.splice(h.indexOf(best.t), 1); S.chain.push([best.t[0], best.t[1]]); S.lastNew = 0;
    S.turn = who === 'me' ? 'ai' : 'me'; render(); next();
  }
  function put(who, i, end){
    const h = S[who], t = h.splice(i, 1)[0];
    if(!S.chain.length){ S.chain.push([t[0], t[1]]); S.lastNew = 0; }
    else if(end === 'R'){ S.chain.push(t[0] === R() ? [t[0], t[1]] : [t[1], t[0]]); S.lastNew = S.chain.length - 1; }
    else { S.chain.unshift(t[1] === L() ? [t[0], t[1]] : [t[1], t[0]]); S.lastNew = 0; }
    S.passes = 0; S.sel = -1; S.hint = -1; X.tone(300, 0, .06, 'square', .12);
    if(!h.length) return endRound(who, 'domino');
    S.turn = who === 'me' ? 'ai' : 'me'; render(); next();
  }
  function draw(who){ if(!S.stock.length) return false; S[who].push(S.stock.pop()); return true; }
  function pass(who){
    S.passes++; S.sel = -1; if(who === 'me') S.miss.add(L()), S.miss.add(R());
    if(S.passes >= 2) return endRound(null, 'blocked');
    S.turn = who === 'me' ? 'ai' : 'me'; S.msg = who === 'ai' ? 'Bỏ lượt' : ''; render(); next();
  }
  function next(){ if(S.over) return; if(S.turn === 'ai' && !thinking) setTimeout(aiPlay, 700); }
  function aiPlay(){
    if(S.over || S.turn !== 'ai') return; thinking = true; let drew = 0;
    while(!playable(S.ai).length && S.stock.length){ draw('ai'); drew++; }
    thinking = false; S.msg = drew ? `Máy bốc ${drew} quân` : '';
    const opts = playable(S.ai);
    if(!opts.length) return pass('ai');
    let pick;
    if(level === 'easy') pick = opts[rnd(opts.length)];
    else {
      pick = opts.map(([i, e]) => {
        const t = S.ai[i], base = t[0] + t[1] + (t[0] === t[1] ? 4 : 0);
        if(level === 'med') return [i, e, base];
        const ev = !S.chain.length ? t[1] : e === 'R' ? (t[0] === R() ? t[1] : t[0]) : (t[1] === L() ? t[0] : t[1]);
        const mine = S.ai.filter((x, k) => k !== i && (x[0] === ev || x[1] === ev)).length;
        return [i, e, base + mine * 3 + (S.miss.has(ev) ? 6 : 0)];
      }).sort((a, b) => b[2] - a[2])[0];
    }
    put('ai', pick[0], pick[1]);
  }
  function endRound(w, how){
    S.over = 'round'; let pts = 0, msg;
    if(how === 'domino'){ pts = pips(S[w === 'me' ? 'ai' : 'me']); }
    else { const a = pips(S.me), b = pips(S.ai); if(a < b){ w = 'me'; pts = b - a; } else if(b < a){ w = 'ai'; pts = a - b; } else w = null; }
    if(w) scr[w] += pts;
    msg = !w ? 'Ván hòa' : w === 'me' ? 'Bạn thắng ván!' : 'Máy thắng ván!';
    const match = scr.me >= target || scr.ai >= target;
    render(); X.beep(w !== 'ai');
    const ov = $('#dmOv', root); ov.hidden = false;
    const mt = scr.me >= target && scr.me >= scr.ai ? 'Bạn thắng trận!' : 'Máy thắng trận!';
    ov.innerHTML = `<h4>${match ? mt : msg}</h4><p>${how === 'domino' ? 'Hết quân - Domino!' : 'Bàn bị khóa'}${pts ? ' · +' + pts + ' điểm' : ''}</p><p>${scr.me} - ${scr.ai}</p><button class="btn b2" id="dmNext">${match ? 'Trận mới' : 'Ván tiếp theo'}</button>`;
    $('#dmNext', root).onclick = () => { if(match) scr = { me: 0, ai: 0 }; ov.hidden = true; deal(); };
  }
  function clickTile(i){
    if(S.over || S.turn !== 'me') return;
    const o = ends(S.me[i]); if(!o.length) return X.toast('Không đi được quân này', 'err');
    if(o.length === 1) return put('me', i, o[0]);
    S.sel = i; render(); X.toast('Chọn đầu để đặt quân', 'info');
  }
  function render(){
    $('#dmAi', root).innerHTML = S.ai.map(() => '<i class="dback"></i>').join('') + `<span style="margin-left:14px">${S.ai.length}</span>`;
    $('#dmStock', root).textContent = S.stock.length;
    $('#dmCh', root).innerHTML = S.chain.map((t, i) => tile(t, (t[0] === t[1] ? 'v' : 'h') + (i === S.lastNew ? ' new' : ''))).join('');
    const myTurn = S.turn === 'me' && !S.over, opts = playable(S.me), canPlay = {}; opts.forEach(([i]) => canPlay[i] = 1);
    $('#dmHand', root).innerHTML = S.me.map((t, i) => tile(t, 'hand' + (myTurn && canPlay[i] ? ' ok' : myTurn ? ' dim' : '') + (S.sel === i ? ' chosen' : '') + (S.hint === i ? ' hint' : ''))).join('');
    $$('#dmHand .dt', root).forEach((el, i) => el.onclick = () => clickTile(i));
    $('#dmEnds', root).textContent = S.chain.length ? `Đầu trái: ${L()} · Đầu phải: ${R()}` : '';
    $('#dmSt', root).textContent = S.over ? '' : S.turn === 'me' ? (S.msg || 'Lượt của bạn') : (S.msg ? S.msg : 'Lượt của máy');
    $('#dmChoice', root).hidden = S.sel < 0;
    $('#dmDraw', root).disabled = !(myTurn && !opts.length && S.stock.length);
    $('#dmPass', root).disabled = !(myTurn && !opts.length && !S.stock.length);
    $('#dmScMe', root).textContent = scr.me; $('#dmScAi', root).textContent = scr.ai; $('#dmTg', root).textContent = target;
    $$('[data-lv]', root).forEach(b => b.classList.toggle('on', b.dataset.lv === level));
    $$('[data-tg]', root).forEach(b => b.classList.toggle('on', +b.dataset.tg === target));
    if(S.chain.length){ const c = $('#dmCh', root); c.scrollTop = 0; }
  }
  function hint(){ if(S.over || S.turn !== 'me') return; const o = playable(S.me); if(!o.length) return; S.hint = o.sort((a, b) => (S.me[b[0]][0] + S.me[b[0]][1]) - (S.me[a[0]][0] + S.me[a[0]][1]))[0][0]; render(); setTimeout(() => { S.hint = -1; render(); }, 2000); }
  function build(){
    const o = st.get('spx_dm_o', {}); level = o.level || 'med'; target = o.target || 100;
    root.innerHTML = `
      <div class="gbar"><div class="gstat" style="gap:8px"><div class="sbox"><span>Bạn</span><b id="dmScMe">0</b></div><div class="sbox"><span>Máy</span><b id="dmScAi">0</b></div><div class="sbox"><span>Đích</span><b id="dmTg">100</b></div></div>
        <button class="face" id="dmNew" aria-label="Trận mới" style="font-size:0">${U.IC.new}</button></div>
      <div class="gcols"><div class="gL"><div class="gcard" style="position:relative">
        <div class="dai"><div id="dmAi" style="display:flex;align-items:center"></div><span>Kho: <b id="dmStock">0</b></span></div>
        <div class="dch" id="dmCh"></div><div class="dends" id="dmEnds"></div>
        <div class="cstat" id="dmSt" style="margin:4px 0 0"></div>
        <div class="dchoice" id="dmChoice" hidden><button class="btn b1" id="dmL" style="margin:0;width:auto;padding:0 18px">◀ Trái</button><button class="btn b1" id="dmR" style="margin:0;width:auto;padding:0 18px">Phải ▶</button></div>
        <div class="dhandw" id="dmHand"></div><div class="gov" id="dmOv" hidden></div></div></div>
      <div class="gR"><div class="gbtns c3"><button class="gb" id="dmDraw">${U.IC.new}<span>Bốc bài</span></button><button class="gb" id="dmPass">${U.IC.back}<span>Bỏ lượt</span></button><button class="gb" id="dmHint">${U.IC.hint}<span>Gợi ý</span></button></div>
        <div class="gcard" style="margin-top:9px"><div class="opt"><div class="lbl">Cấp độ</div><div class="chips">${chips('lv', [['easy', 'Dễ'], ['med', 'Vừa'], ['hard', 'Khó']])}</div></div>
        <div class="opt"><div class="lbl">Đích</div><div class="chips">${chips('tg', [[50, '50'], [100, '100'], [150, '150']])}</div></div></div>
        <div class="gtip">Chạm quân để đánh · hết quân là thắng</div></div></div>`;
    const save = () => st.set('spx_dm_o', { level, target });
    $('#dmDraw', root).onclick = () => { if(draw('me')){ X.tone(240, 0, .05, 'square', .1); render(); } };
    $('#dmPass', root).onclick = () => pass('me'); $('#dmHint', root).onclick = hint;
    $('#dmL', root).onclick = () => put('me', S.sel, 'L'); $('#dmR', root).onclick = () => put('me', S.sel, 'R');
    $('#dmNew', root).onclick = () => { scr = { me: 0, ai: 0 }; $('#dmOv', root).hidden = true; deal(); };
    $$('[data-lv]', root).forEach(b => b.onclick = () => { level = b.dataset.lv; save(); render(); });
    $$('[data-tg]', root).forEach(b => b.onclick = () => { target = +b.dataset.tg; save(); render(); });
    deal();
  }
  return { id: 'domino', name: 'Domino', icon: '<svg viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="3"/><path d="M5 12h14"/><circle cx="9.500" cy="6.500" r=".9" fill="currentColor"/><circle cx="14.500" cy="6.500" r=".9" fill="currentColor"/><circle cx="12" cy="17" r=".9" fill="currentColor"/></svg>', mount(el){ root = el; build(); } };
})();

/* ======================== LẬT BÀI TRÍ NHỚ ======================== */
const Memory = (() => {
  const THEMES = {
    animal: ['🐶', '🐱', '🦊', '🐼', '🐸', '🦁', '🐯', '🐰', '🐨', '🐵', '🐷', '🐮', '🦄', '🐙', '🦋'],
    fruit: ['🍎', '🍌', '🍇', '🍓', '🍉', '🍒', '🍑', '🍍', '🥝', '🍋', '🥥', '🍐', '🥭', '🍈', '🫐'],
    car: ['🚗', '🚕', '🚌', '🚓', '🚑', '🚒', '🚜', '🏍️', '✈️', '🚀', '🚲', '🛵', '⛵', '🚁', '🚂']
  };
  const SIZES = { s: [4, 3], m: [4, 4], l: [5, 4], x: [6, 5] };
  let root, cards, first, lock, flips, found, time, started, sz = 'm', theme = 'animal', preview = true, tmr;
  function newGame(){
    const [c, r] = SIZES[sz], pairs = c * r / 2, em = shuffle(THEMES[theme].slice()).slice(0, pairs);
    cards = shuffle([...em, ...em]).map((e, i) => ({ e, i, up: false, ok: false })); first = -1; lock = false; flips = 0; found = 0; time = 0; started = false;
    $('#mmOv', root).hidden = true; render();
    if(preview){ lock = true; cards.forEach(x => x.up = true); render(); setTimeout(() => { cards.forEach(x => x.up = false); lock = false; render(); }, 1400 + pairs * 60); }
  }
  function flip(i){
    const k = cards[i]; if(lock || k.up || k.ok) return; started = true; k.up = true; X.tone(520, 0, .05, 'sine', .12);
    if(first < 0){ first = i; render(); return; }
    flips++; const a = cards[first]; lock = true; render();
    if(a.e === k.e){ a.ok = k.ok = true; found++; first = -1; lock = false; X.tone(880, 0, .08, 'sine', .15); X.tone(1175, .08, .12, 'sine', .15); render(); if(found === cards.length / 2) win(); }
    else setTimeout(() => { a.up = k.up = false; first = -1; lock = false; render(); }, 800);
  }
  function win(){
    started = false; X.beep(true); const key = 'mm_' + sz + '_' + theme.length, rec = best.set(key, flips);
    const pairs = cards.length / 2, stars = flips <= pairs * 1.4 ? 3 : flips <= pairs * 2 ? 2 : 1;
    const ov = $('#mmOv', root); ov.hidden = false;
    ov.innerHTML = `<h4>Hoàn thành!</h4><p style="font-size:26px">${'⭐'.repeat(stars)}</p><p>${flips} · ${fmt(time)}${rec ? ' · Kỷ lục mới!' : ''}</p><button class="btn b2" id="mmAgain">Chơi lại</button>`;
    $('#mmAgain', root).onclick = newGame;
  }
  function hint(){
    if(lock) return; const un = cards.filter(x => !x.ok && !x.up); if(!un.length) return;
    const pick = un[rnd(un.length)], mate = un.find(x => x !== pick && x.e === pick.e);
    [pick, mate].forEach(x => { if(x){ const el = $(`.mcd[data-i="${x.i}"]`, root); if(el){ el.classList.add('hint'); setTimeout(() => el.classList.remove('hint'), 1500); } } }); flips += 2; render();
  }
  function render(){
    const [c] = SIZES[sz], g = $('#mmG', root); g.style.gridTemplateColumns = `repeat(${c},1fr)`;
    g.innerHTML = cards.map(k => `<button class="mcd${k.up || k.ok ? ' up' : ''}${k.ok ? ' ok' : ''}" data-i="${k.i}"><div><span class="fa"></span><span class="ba">${k.e}</span></div></button>`).join('');
    $('#mmF', root).textContent = flips; $('#mmP', root).textContent = found + '/' + cards.length / 2; $('#mmT', root).textContent = fmt(time);
    $$('[data-sz]', root).forEach(b => b.classList.toggle('on', b.dataset.sz === sz));
    $$('[data-th]', root).forEach(b => b.classList.toggle('on', b.dataset.th === theme));
    $('#mmPv', root).classList.toggle('on', preview);
    const bs = best.get()['mm_' + sz + '_' + theme.length]; $('#mmBest', root).textContent = bs ? 'Kỷ lục: ' + bs : '';
  }
  function build(){
    const o = st.get('spx_mm_o', {}); sz = o.sz || 'm'; theme = o.theme || 'animal'; preview = o.preview !== false;
    root.innerHTML = `
      <div class="gbar"><div class="gstat" style="gap:8px"><div class="sbox"><span>Số lần lật</span><b id="mmF">0</b></div><div class="sbox"><span>Đã tìm</span><b id="mmP">0</b></div><div class="sbox"><span>Thời gian</span><b id="mmT">00:00</b></div></div>
        <button class="face" id="mmNew" aria-label="Ván mới" style="font-size:0">${U.IC.new}</button></div>
      <div class="gcols"><div class="gL"><div class="gcard"><div class="bw"><div class="mg" id="mmG"></div><div class="gov" id="mmOv" hidden></div></div></div></div>
      <div class="gR"><div class="gcard"><div class="opt"><div class="lbl">Cỡ bàn</div><div class="chips">${chips('sz', [['s', '4×3'], ['m', '4×4'], ['l', '5×4'], ['x', '6×5']])}</div></div>
        <div class="opt"><div class="lbl">Chủ đề</div><div class="chips">${chips('th', [['animal', 'Thú'], ['fruit', 'Trái cây'], ['car', 'Xe cộ']])}</div></div>
        <div class="gbtns c2"><button class="gb" id="mmPv">${U.IC.flag}<span>Xem trước</span></button><button class="gb" id="mmHint">${U.IC.hint}<span>Gợi ý</span></button></div>
        <div class="gtip" id="mmBest"></div><div class="gtip" style="margin-top:2px">Chạm hai lá bài giống nhau để ghép cặp</div></div></div></div>`;
    const save = () => st.set('spx_mm_o', { sz, theme, preview });
    $('#mmG', root).addEventListener('click', e => { const b = e.target.closest('.mcd'); if(b) flip(+b.dataset.i); });
    $$('[data-sz]', root).forEach(b => b.onclick = () => { sz = b.dataset.sz; save(); newGame(); });
    $$('[data-th]', root).forEach(b => b.onclick = () => { theme = b.dataset.th; save(); newGame(); });
    $('#mmPv', root).onclick = () => { preview = !preview; save(); render(); };
    $('#mmHint', root).onclick = hint; $('#mmNew', root).onclick = newGame;
    tmr = setInterval(() => { if(G.isOn('memory') && started){ time++; $('#mmT', root).textContent = fmt(time); } }, 1000);
    newGame();
  }
  return { id: 'memory', name: 'Lật bài', icon: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="8" height="12" rx="2"/><rect x="13" y="8" width="8" height="12" rx="2"/><path d="M7 8l.01 0M17 12l.01 0"/></svg>', mount(el){ root = el; build(); } };
})();

[Jewels, Domino, Memory].forEach(g => G.register(g));
G._dm = true;
})();
