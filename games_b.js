/* SPX Express – Trò chơi (phần B): 2048 · Cờ ca rô · Cờ tướng */
(() => {
'use strict';
const G = window.SPXGames, X = window.SPX, st = X.store, U = G.u;
const { $, $$, fmt, rnd, best } = U;

X.extend({
  '2048':'2048','Cờ ca rô':'Gomoku','Cờ tướng':'Xiangqi','Điểm':'Score','Kỷ lục':'Best','Vuốt để di chuyển các ô':'Swipe to move the tiles',
  'Tiếp tục':'Continue','Bạn đã đạt 2048':'You reached 2048','Hết nước đi':'No moves left','Chạm vào ô để đặt quân':'Tap a cell to place a mark',
  'Bạn (X)':'You (X)','Bạn (O)':'You (O)','Luật chặn 2 đầu':'Block-both-ends rule','Hòa':'Draw','Thắng':'Wins','X đi trước':'X goes first',
  'Lượt X':'X to move','Lượt O':'O to move','X thắng!':'X wins!','O thắng!':'O wins!','Hòa cờ':'Draw game','Chọn quân':'Choose side',
  'Đỏ':'Red','Lượt Đỏ':'Red to move','Chiếu tướng!':'Check!','Chiếu bí! Đỏ thắng':'Checkmate! Red wins','Chiếu bí! Đen thắng':'Checkmate! Black wins',
  'Hết nước đi! Đỏ thắng':'Stalemate! Red wins','Hết nước đi! Đen thắng':'Stalemate! Black wins','Ván cờ hòa':'Drawn game','Quân của bạn':'Your side',
  'Tắt':'Off','Bật':'On'
}, [[/^Gợi ý: (.+)$/, (m, a) => 'Hint: ' + a]]);

const chips = (attr, items) => items.map(([v, t]) => `<button class="chip" data-${attr}="${v}">${t}</button>`).join('');

/* ======================== 2048 ======================== */
const G2048 = (() => {
  const S = 4;
  let root, tiles = [], dying = [], uid = 0, score = 0, hist = [], won = false, over = false, keepGoing = false;
  const els = new Map(); let bestS = st.get('spx_2048b', 0);
  const grid = () => { const g = Array.from({ length: S }, () => Array(S).fill(null)); tiles.forEach(t => g[t.r][t.c] = t); return g; };
  const pos = (d, k, j) => d === 0 ? [j, k] : d === 1 ? [k, 3 - j] : d === 2 ? [3 - j, k] : [k, j];
  function spawn(){
    const g = grid(), e = []; for(let r = 0; r < S; r++) for(let c = 0; c < S; c++) if(!g[r][c]) e.push([r, c]);
    if(!e.length) return; const [r, c] = e[rnd(e.length)];
    tiles.push({ id: ++uid, v: Math.random() < .9 ? 2 : 4, r, c, nw: 1 });
  }
  const canMove = () => { const g = grid(); for(let r = 0; r < S; r++) for(let c = 0; c < S; c++){ if(!g[r][c]) return true; const v = g[r][c].v; if(c < 3 && g[r][c + 1] && g[r][c + 1].v === v) return true; if(r < 3 && g[r + 1][c] && g[r + 1][c].v === v) return true; } return false; };
  const save = () => st.set('spx_2048', { tiles: tiles.map(t => ({ ...t, nw: 0, mg: 0 })), score, uid, won, keepGoing });
  function move(d){
    if(over || ($('#tvOv', root) && !$('#tvOv', root).hidden)) return;
    const snap = { tiles: tiles.map(t => ({ ...t, nw: 0, mg: 0 })), score, uid, won };
    const g = grid(); let moved = false, gain = 0; const dead = [];
    for(let k = 0; k < S; k++){
      const line = []; for(let j = 0; j < S; j++){ const [r, c] = pos(d, k, j); if(g[r][c]) line.push(g[r][c]); }
      const out = [], dl = [];
      for(const t of line){ const l = out[out.length - 1]; if(l && l.v === t.v && !l.mg){ l.v *= 2; l.mg = 1; gain += l.v; dl.push([t, l]); } else out.push(t); }
      out.forEach((t, j) => { const [r, c] = pos(d, k, j); if(t.r !== r || t.c !== c) moved = true; t.r = r; t.c = c; });
      dl.forEach(([t, to]) => { t.r = to.r; t.c = to.c; moved = true; dead.push(t); });
    }
    if(!moved){ tiles.forEach(t => t.mg = 0); return; }
    hist.push(snap); if(hist.length > 15) hist.shift();
    tiles = tiles.filter(t => !dead.includes(t)); dying = dead; score += gain;
    if(score > bestS){ bestS = score; st.set('spx_2048b', bestS); }
    spawn(); X.tone(300 + Math.min(gain, 512) , 0, .06, 'sine', .15);
    render(); setTimeout(() => { dying.forEach(t => { const e = els.get(t.id); if(e){ e.remove(); els.delete(t.id); } }); dying = []; }, 140);
    tiles.forEach(t => t.mg = 0);
    if(!over && !canMove()){ over = true; X.beep(false); overlay('Hết nước đi', `Điểm ${score}`, [['Ván mới', newGame]]); }
    else if(!won && !keepGoing && tiles.some(t => t.v >= 2048)){ won = true; X.beep(true); overlay('Chúc mừng!', 'Bạn đã đạt 2048', [['Tiếp tục', () => { keepGoing = true; $('#tvOv', root).hidden = true; }], ['Ván mới', newGame]]); }
    save();
  }
  function overlay(h, p, btns){
    const o = $('#tvOv', root); o.hidden = false;
    o.innerHTML = `<h4>${h}</h4><p>${p}</p><div style="display:flex;gap:8px;margin-top:6px">${btns.map((b, i) => `<button class="btn ${i ? 'b3' : 'b2'}" data-i="${i}" style="margin:0">${b[0]}</button>`).join('')}</div>`;
    $$('button', o).forEach(b => b.onclick = () => btns[+b.dataset.i][1]());
  }
  function render(){
    const b = $('#tvB', root);
    [...tiles, ...dying].forEach(t => {
      let e = els.get(t.id);
      if(!e){ e = document.createElement('div'); e.innerHTML = '<span></span>'; b.appendChild(e); els.set(t.id, e); }
      e.className = 'tile t' + (t.v > 2048 ? 'big' : t.v) + (t.nw ? ' nw' : '') + (t.mg ? ' mg' : '');
      e.firstChild.textContent = t.v; e.style.transform = `translate(${t.c * 100}%,${t.r * 100}%)`;
      e.firstChild.style.fontSize = t.v >= 1024 ? '0.62em' : t.v >= 128 ? '0.78em' : '';
    });
    $('#tvS', root).textContent = score; $('#tvBest', root).textContent = bestS;
  }
  function newGame(){
    tiles = []; dying = []; hist = []; score = 0; won = over = keepGoing = false; els.forEach(e => e.remove()); els.clear();
    $('#tvOv', root).hidden = true; spawn(); spawn(); render(); save();
  }
  function undo(){
    if(!hist.length) return; const h = hist.pop(); tiles = h.tiles.map(t => ({ ...t })); score = h.score; won = h.won; over = false; dying = [];
    els.forEach(e => e.remove()); els.clear(); $('#tvOv', root).hidden = true; render(); save();
  }
  function build(){
    root.innerHTML = `
      <div class="gbar"><div class="gstat" style="gap:8px"><div class="sbox"><span>Điểm</span><b id="tvS">0</b></div><div class="sbox"><span>Kỷ lục</span><b id="tvBest">0</b></div></div>
        <div style="display:flex;gap:6px"><button class="face" id="tvUndo" aria-label="Hoàn tác" style="font-size:0">${U.IC.undo}</button><button class="face" id="tvNew" aria-label="Ván mới" style="font-size:0">${U.IC.new}</button></div></div>
      <div class="gcols"><div class="gL"><div class="gcard"><div class="bw"><div class="tb" id="tvB"><div class="tg4">${'<i></i>'.repeat(16)}</div></div><div class="gov" id="tvOv" hidden></div></div></div></div>
      <div class="gR"><div class="gcard"><div class="gtip" style="margin:0">Vuốt để di chuyển các ô</div></div></div></div>`;
    const b = $('#tvB', root); let sx, sy;
    b.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
    b.addEventListener('pointerup', e => { if(sx == null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if(Math.max(Math.abs(dx), Math.abs(dy)) < 22) return; move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 3) : (dy > 0 ? 2 : 0)); });
    b.addEventListener('pointercancel', () => sx = null);
    addEventListener('keydown', e => { if(!G.isOn('g2048')) return; const k = { ArrowUp:0, ArrowRight:1, ArrowDown:2, ArrowLeft:3 }[e.key]; if(k !== undefined){ e.preventDefault(); move(k); } });
    $('#tvNew', root).onclick = newGame; $('#tvUndo', root).onclick = undo;
    const sv = st.get('spx_2048', null);
    if(sv && sv.tiles && sv.tiles.length){ tiles = sv.tiles; score = sv.score; uid = sv.uid; won = sv.won; keepGoing = sv.keepGoing; render(); if(!canMove()){ over = true; overlay('Hết nước đi', `Điểm ${score}`, [['Ván mới', newGame]]); } }
    else newGame();
  }
  return { id: 'g2048', name: '2048', icon: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor"/></svg>', mount(el){ root = el; build(); } };
})();

/* ======================== CỜ CA RÔ ======================== */
const Caro = (() => {
  const N = 15, DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
  let root, B, turn, over, last, winC, hist, mode, me, lv, block, tally, think = false;
  const at = (r, c) => r >= 0 && r < N && c >= 0 && c < N ? B[r * N + c] : -1;
  const MK = { 1: '<svg viewBox="0 0 24 24" class="mk mx"><path d="M6 6l12 12M18 6L6 18"/></svg>', 2: '<svg viewBox="0 0 24 24" class="mk mo"><circle cx="12" cy="12" r="6.5"/></svg>' };
  function check(r, c, p){
    for(const [dr, dc] of DIRS){
      const cells = [r * N + c]; let a = 1; while(at(r + dr * a, c + dc * a) === p){ cells.push((r + dr * a) * N + c + dc * a); a++; }
      const e1 = at(r + dr * a, c + dc * a); let b = 1; while(at(r - dr * b, c - dc * b) === p){ cells.push((r - dr * b) * N + c - dc * b); b++; }
      const e2 = at(r - dr * b, c - dc * b);
      if(cells.length >= 5){ if(block && e1 !== 0 && e2 !== 0) continue; return cells; }
    }
    return null;
  }
  const pat = (n, o) => n >= 5 ? 1e6 : n === 4 ? (o === 2 ? 5e4 : o === 1 ? 5e3 : 0) : n === 3 ? (o === 2 ? 3e3 : o === 1 ? 300 : 0) : n === 2 ? (o === 2 ? 200 : o === 1 ? 20 : 0) : (o === 2 ? 10 : 1);
  function evalCell(r, c, p){
    let s = 0;
    for(const [dr, dc] of DIRS){
      let n = 1, o = 0, a = 1; while(at(r + dr * a, c + dc * a) === p){ n++; a++; } if(at(r + dr * a, c + dc * a) === 0) o++;
      let b = 1; while(at(r - dr * b, c - dc * b) === p){ n++; b++; } if(at(r - dr * b, c - dc * b) === 0) o++;
      s += pat(n, o);
    }
    return s;
  }
  function aiPick(){
    const p = turn, q = 3 - p, W = { easy: .45, med: .95, hard: 1.2 }[lv], cand = [];
    for(let r = 0; r < N; r++) for(let c = 0; c < N; c++){
      if(B[r * N + c]) continue; let near = false;
      for(let dr = -2; dr <= 2 && !near; dr++) for(let dc = -2; dc <= 2; dc++) if(at(r + dr, c + dc) > 0){ near = true; break; }
      if(near) cand.push([r, c, evalCell(r, c, p) + evalCell(r, c, q) * W + Math.random() * (lv === 'easy' ? 400 : 8)]);
    }
    if(!cand.length) return [7, 7];
    cand.sort((a, b) => b[2] - a[2]);
    const top = lv === 'easy' ? cand[rnd(Math.min(4, cand.length))] : cand[0];
    return [top[0], top[1]];
  }
  function place(r, c){
    B[r * N + c] = turn; hist.push([r, c]); last = r * N + c;
    const w = check(r, c, turn);
    if(w){ over = turn; winC = w; if(turn === 1) tally.x++; else tally.o++; st.set('spx_caro_sc', tally); X.beep(mode === 'pvp' || turn === me); }
    else if(hist.length >= N * N){ over = 3; tally.d++; st.set('spx_caro_sc', tally); }
    else turn = 3 - turn;
    X.tone(turn === 1 ? 520 : 420, 0, .05, 'sine', .12);
    render(); aiTurn();
  }
  function aiTurn(){
    if(over || mode !== 'ai' || turn === me || think) return;
    think = true; render();
    setTimeout(() => { think = false; if(over) return; const [r, c] = aiPick(); place(r, c); }, 280);
  }
  function tap(i){
    if(over || think || B[i] || (mode === 'ai' && turn !== me)) return;
    place(i / N | 0, i % N);
  }
  function undo(){
    if(think || !hist.length) return;
    let n = mode === 'ai' ? 2 : 1; if(mode === 'ai' && turn !== me) n = 1;
    if(over) { const w = over; if(w === 1) tally.x--; else if(w === 2) tally.o--; else if(w === 3) tally.d--; st.set('spx_caro_sc', tally); }
    while(n-- > 0 && hist.length){ const [r, c] = hist.pop(); B[r * N + c] = 0; }
    over = 0; winC = null; turn = hist.length % 2 === 0 ? 1 : 2; if(mode === 'ai' && turn !== me && hist.length === 0 && me === 2) { /* máy đi trước */ }
    last = hist.length ? hist[hist.length - 1][0] * N + hist[hist.length - 1][1] : -1; render();
  }
  function newGame(){
    B = Array(N * N).fill(0); turn = 1; over = 0; last = -1; winC = null; hist = []; think = false; render();
    if(mode === 'ai' && me === 2) setTimeout(() => place(7, 7), 250);
  }
  function render(){
    const bd = $('#crB', root), w = new Set(winC || []); let h = '';
    for(let i = 0; i < N * N; i++) h += `<div class="cc${B[i] ? '' : ' em'}${i === last ? ' lst' : ''}${w.has(i) ? ' win' : ''}" data-i="${i}">${B[i] ? MK[B[i]] : ''}</div>`;
    bd.innerHTML = h;
    let t;
    if(over === 3) t = 'Hòa cờ'; else if(over) t = over === 1 ? 'X thắng!' : 'O thắng!'; else t = turn === 1 ? 'Lượt X' : 'Lượt O';
    const el = $('#crSt', root); el.textContent = think ? 'Máy đang nghĩ…' : t; el.classList.toggle('warn', !!over && over !== 3);
    $('#crSc', root).innerHTML = `<span class="mk-x">X</span> <b>${tally.x}</b> · ${'Hòa'} <b>${tally.d}</b> · <span class="mk-o">O</span> <b>${tally.o}</b>`;
    $$('[data-m]', root).forEach(b => b.classList.toggle('on', b.dataset.m === mode));
    $$('[data-me]', root).forEach(b => b.classList.toggle('on', +b.dataset.me === me));
    $$('[data-lv]', root).forEach(b => b.classList.toggle('on', b.dataset.lv === lv));
    $$('[data-bk]', root).forEach(b => b.classList.toggle('on', (b.dataset.bk === '1') === block));
    $('#crSide', root).style.display = $('#crLvl', root).style.display = mode === 'ai' ? 'flex' : 'none';
    st.set('spx_caro_o', { mode, me, lv, block });
  }
  function build(){
    const o = st.get('spx_caro_o', {}); mode = o.mode || 'ai'; me = o.me || 1; lv = o.lv || 'med'; block = !!o.block; tally = st.get('spx_caro_sc', { x: 0, o: 0, d: 0 });
    root.innerHTML = `
      <div class="gcols"><div class="gL"><div class="cstat" id="crSt"></div><div class="gcard" style="padding:6px"><div class="bw"><div class="crb" id="crB"></div></div></div></div>
      <div class="gR"><div class="gcard">
        <div class="opt"><div class="lbl">Chế độ</div><div class="chips">${chips('m', [['ai', 'Chơi với máy'], ['pvp', '2 người']])}</div></div>
        <div class="opt" id="crSide"><div class="lbl">Quân của bạn</div><div class="chips">${chips('me', [[1, 'X (đi trước)'], [2, 'O']])}</div></div>
        <div class="opt" id="crLvl"><div class="lbl">Cấp độ</div><div class="chips">${chips('lv', [['easy', 'Dễ'], ['med', 'Vừa'], ['hard', 'Khó']])}</div></div>
        <div class="opt"><div class="lbl">Chặn 2 đầu</div><div class="chips">${chips('bk', [[0, 'Tắt'], [1, 'Bật']])}</div></div>
      </div>
      <div class="gcard gscore" id="crSc" style="margin-top:9px;text-align:center;font-size:12.5px;font-weight:600"></div>
      <div class="gbtns c2"><button class="gb" id="crNew">${U.IC.new}<span>Ván mới</span></button><button class="gb" id="crUndo">${U.IC.undo}<span>Hoàn tác</span></button></div>
      <div class="gtip">Chạm vào ô để đặt quân · 5 quân liên tiếp để thắng</div></div></div>`;
    $('#crB', root).addEventListener('click', e => { const c = e.target.closest('.cc'); if(c) tap(+c.dataset.i); });
    $$('[data-m]', root).forEach(b => b.onclick = () => { mode = b.dataset.m; newGame(); });
    $$('[data-me]', root).forEach(b => b.onclick = () => { me = +b.dataset.me; newGame(); });
    $$('[data-lv]', root).forEach(b => b.onclick = () => { lv = b.dataset.lv; render(); });
    $$('[data-bk]', root).forEach(b => b.onclick = () => { block = b.dataset.bk === '1'; newGame(); });
    $('#crNew', root).onclick = newGame; $('#crUndo', root).onclick = undo;
    newGame();
  }
  return { id: 'caro', name: 'Cờ ca rô', icon: '<svg viewBox="0 0 24 24"><path d="M4 4l7 7M11 4l-7 7"/><circle cx="16.500" cy="16.500" r="4.500"/><path d="M13 4h7M4 14h7M4 20h7"/></svg>', mount(el){ root = el; build(); } };
})();

/* ======================== CỜ TƯỚNG ======================== */
const Xq = (() => {
  const GLY = { r: { K:'帥', A:'仕', E:'相', H:'傌', R:'俥', C:'炮', P:'兵' }, b: { K:'將', A:'士', E:'象', H:'馬', R:'車', C:'砲', P:'卒' } };
  const VAL = { K:0, A:200, E:200, H:420, R:900, C:450, P:100 };
  const ORTH = [[-1, 0], [1, 0], [0, -1], [0, 1]], DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const opp = c => c === 'r' ? 'b' : 'r';
  const inPal = (r, c, me) => c >= 3 && c <= 5 && (me === 'r' ? r >= 7 && r <= 9 : r >= 0 && r <= 2);
  function initial(){
    const b = Array(90).fill(null), back = 'RHEAKAEHR';
    for(let c = 0; c < 9; c++){ b[c] = 'b' + back[c]; b[81 + c] = 'r' + back[c]; }
    b[19] = b[25] = 'bC'; b[64] = b[70] = 'rC';
    for(let c = 0; c < 9; c += 2){ b[27 + c] = 'bP'; b[54 + c] = 'rP'; }
    return { b, turn: 'r' };
  }
  function gen(s){
    const out = [], b = s.b, me = s.turn;
    const add = (f, t) => { const q = b[t]; if(!q || q[0] !== me) out.push({ f, t, cap: q }); };
    for(let i = 0; i < 90; i++){
      const p = b[i]; if(!p || p[0] !== me) continue; const r = i / 9 | 0, c = i % 9;
      switch(p[1]){
        case 'K': {
          for(const [dr, dc] of ORTH) if(inPal(r + dr, c + dc, me)) add(i, (r + dr) * 9 + c + dc);
          const dir = me === 'r' ? -1 : 1; let rr = r + dir;
          while(rr >= 0 && rr < 10){ const q = b[rr * 9 + c]; if(q){ if(q[1] === 'K' && q[0] !== me) out.push({ f: i, t: rr * 9 + c, cap: q }); break; } rr += dir; }
          break; }
        case 'A': for(const [dr, dc] of DIAG) if(inPal(r + dr, c + dc, me)) add(i, (r + dr) * 9 + c + dc); break;
        case 'E': for(const [dr, dc] of DIAG){
            const nr = r + 2 * dr, nc = c + 2 * dc; if(nr < 0 || nr > 9 || nc < 0 || nc > 8) continue;
            if(me === 'r' ? nr < 5 : nr > 4) continue; if(b[(r + dr) * 9 + c + dc]) continue; add(i, nr * 9 + nc);
          } break;
        case 'H': for(const [dr, dc] of ORTH){
            const lr = r + dr, lc = c + dc; if(lr < 0 || lr > 9 || lc < 0 || lc > 8 || b[lr * 9 + lc]) continue;
            const ts = dr ? [[r + 2 * dr, c - 1], [r + 2 * dr, c + 1]] : [[r - 1, c + 2 * dc], [r + 1, c + 2 * dc]];
            for(const [nr, nc] of ts) if(nr >= 0 && nr < 10 && nc >= 0 && nc < 9) add(i, nr * 9 + nc);
          } break;
        case 'R': for(const [dr, dc] of ORTH){ let nr = r + dr, nc = c + dc; while(nr >= 0 && nr < 10 && nc >= 0 && nc < 9){ const q = b[nr * 9 + nc]; if(!q) out.push({ f: i, t: nr * 9 + nc, cap: null }); else { if(q[0] !== me) out.push({ f: i, t: nr * 9 + nc, cap: q }); break; } nr += dr; nc += dc; } } break;
        case 'C': for(const [dr, dc] of ORTH){
            let nr = r + dr, nc = c + dc, screen = false;
            while(nr >= 0 && nr < 10 && nc >= 0 && nc < 9){
              const q = b[nr * 9 + nc];
              if(!screen){ if(!q) out.push({ f: i, t: nr * 9 + nc, cap: null }); else screen = true; }
              else if(q){ if(q[0] !== me) out.push({ f: i, t: nr * 9 + nc, cap: q }); break; }
              nr += dr; nc += dc;
            }
          } break;
        case 'P': {
          const fw = me === 'r' ? -1 : 1; if(r + fw >= 0 && r + fw < 10) add(i, (r + fw) * 9 + c);
          if(me === 'r' ? r <= 4 : r >= 5){ if(c > 0) add(i, r * 9 + c - 1); if(c < 8) add(i, r * 9 + c + 1); }
          break; }
      }
    }
    return out;
  }
  const apply = (s, m) => { const b = s.b.slice(); b[m.t] = b[m.f]; b[m.f] = null; return { b, turn: opp(s.turn) }; };
  const kingHit = s => gen(s).some(m => m.cap && m.cap[1] === 'K');            // bên đi tiếp có ăn được tướng?
  const legal = s => gen(s).filter(m => !kingHit(apply(s, m)));
  const inCheck = (s, side) => kingHit({ b: s.b, turn: opp(side) });
  function evalX(s){
    let sc = 0;
    for(let i = 0; i < 90; i++){
      const p = s.b[i]; if(!p) continue; const r = i / 9 | 0, c = i % 9; let v = VAL[p[1]];
      if(p[1] === 'P'){ const adv = p[0] === 'r' ? 6 - r : r - 3; if(adv > 0) v += 30 + adv * 12; }
      if(p[1] === 'H' || p[1] === 'C') v += 8 - Math.abs(c - 4) * 2;
      sc += p[0] === s.turn ? v : -v;
    }
    return sc;
  }
  function nega(s, d, a, b, ply){
    const ms = gen(s);
    for(const m of ms) if(m.cap && m.cap[1] === 'K') return 99000 - ply;
    if(!d) return evalX(s);
    ms.forEach(m => m.o = m.cap ? 10 * VAL[m.cap[1]] - VAL[s.b[m.f][1]] / 10 : 0); ms.sort((x, y) => y.o - x.o);
    let bst = -1e9;
    for(const m of ms){ const v = -nega(apply(s, m), d - 1, -b, -a, ply + 1); if(v > bst){ bst = v; if(v > a) a = v; } if(a >= b) break; }
    return bst === -1e9 ? -99000 + ply : bst;
  }
  function bestMove(s, depth, noise){
    const ms = legal(s); if(!ms.length) return null; let bm = null, bv = -1e9;
    ms.forEach(m => m.o = m.cap ? 10 * VAL[m.cap[1]] : 0); ms.sort((x, y) => y.o - x.o);
    for(const m of ms){ const v = -nega(apply(s, m), depth - 1, -1e9, 1e9, 1) + Math.random() * noise; if(v > bv){ bv = v; bm = m; } }
    return bm;
  }
  const LEVEL = { easy: [1, 90], med: [2, 18], hard: [3, 4] };
  const perft = (s, d) => { if(!d) return 1; let n = 0; for(const m of legal(s)) n += perft(apply(s, m), d - 1); return n; };

  /* --- giao diện --- */
  let root, C, KEY = 'spx_xq';
  const sx = c => 20 + c * 40, sy = r => 20 + r * 40;
  function newGame(o){
    o = o || {};
    C = { s: initial(), hist: [], mode: o.mode || 'ai', human: o.human || 'r', level: o.level || 'med', flip: false, sel: -1, moves: [], last: null, hint: null, over: null, think: false };
    C.flip = C.mode === 'ai' && C.human === 'b'; render(); aiTurn();
  }
  const persist = () => st.set(KEY, { mode: C.mode, human: C.human, level: C.level, flip: C.flip, moves: C.hist.map(h => [h.m.f, h.m.t]) });
  function restore(){
    const sv = st.get(KEY, null); newGame0(sv || {});
    if(sv && sv.moves) for(const [f, t] of sv.moves){ const m = legal(C.s).find(x => x.f === f && x.t === t); if(!m) break; push(m, true); }
    if(sv) C.flip = !!sv.flip; render(); aiTurn();
  }
  function newGame0(o){ C = { s: initial(), hist: [], mode: o.mode || 'ai', human: o.human || 'r', level: o.level || 'med', flip: false, sel: -1, moves: [], last: null, hint: null, over: null, think: false }; C.flip = C.mode === 'ai' && C.human === 'b'; }
  function push(m, quiet){
    C.hist.push({ before: C.s, m }); C.s = apply(C.s, m); C.last = m; C.sel = -1; C.moves = []; C.hint = null;
    if(!legal(C.s).length){ C.over = opp(C.s.turn); if(!quiet) X.beep(true); }
    else if(!quiet) X.tone(m.cap ? 260 : 400, 0, .07, 'sine', .15);
  }
  const human = () => C.mode === 'pvp' || C.s.turn === C.human;
  function aiTurn(){
    if(C.over || C.mode !== 'ai' || C.s.turn === C.human || C.think) return;
    C.think = true; status();
    setTimeout(() => { const [d, n] = LEVEL[C.level]; const m = bestMove(C.s, d, n); C.think = false; if(m){ push(m); persist(); } render(); }, 90);
  }
  function click(sq){
    if(C.over || C.think || !human()) return;
    const mv = C.moves.find(m => m.t === sq);
    if(C.sel >= 0 && mv){ push(mv); persist(); render(); aiTurn(); return; }
    const p = C.s.b[sq];
    if(p && p[0] === C.s.turn){ C.sel = sq; C.moves = legal(C.s).filter(m => m.f === sq); C.hint = null; } else { C.sel = -1; C.moves = []; }
    render();
  }
  function status(){
    const el = $('#xqSt', root); let t, warn = false;
    if(C.over){ t = C.over === 'r' ? 'Chiếu bí! Đỏ thắng' : 'Chiếu bí! Đen thắng'; warn = true; }
    else if(C.think) t = 'Máy đang nghĩ…';
    else { t = C.s.turn === 'r' ? 'Lượt Đỏ' : 'Lượt Đen'; if(inCheck(C.s, C.s.turn)){ t += ' · Chiếu tướng!'; warn = true; } }
    el.textContent = t; el.classList.toggle('warn', warn);
  }
  function boardSVG(){
    const pt = i => { let r = i / 9 | 0, c = i % 9; if(C.flip){ r = 9 - r; c = 8 - c; } return [sx(c), sy(r)]; };
    let h = `<rect x="2" y="2" width="356" height="396" rx="14" class="xb"/>`, ln = '';
    for(let r = 0; r < 10; r++) ln += `M${sx(0)} ${sy(r)}H${sx(8)}`;
    ln += `M${sx(0)} ${sy(0)}V${sy(9)}M${sx(8)} ${sy(0)}V${sy(9)}`;
    for(let c = 1; c < 8; c++) ln += `M${sx(c)} ${sy(0)}V${sy(4)}M${sx(c)} ${sy(5)}V${sy(9)}`;
    ln += `M${sx(3)} ${sy(0)}L${sx(5)} ${sy(2)}M${sx(5)} ${sy(0)}L${sx(3)} ${sy(2)}M${sx(3)} ${sy(7)}L${sx(5)} ${sy(9)}M${sx(5)} ${sy(7)}L${sx(3)} ${sy(9)}`;
    h += `<path d="${ln}" class="xl"/>`;
    h += `<text x="${sx(1.8)}" y="${sy(4.5) + 7}" class="xr">楚 河</text><text x="${sx(5.5)}" y="${sy(4.5) + 7}" class="xr">漢 界</text>`;
    if(C.last){ for(const q of [C.last.f, C.last.t]){ const [x, y] = pt(q); h += `<rect x="${x - 19}" y="${y - 19}" width="38" height="38" rx="10" class="xlm"/>`; } }
    const ck = inCheck(C.s, C.s.turn) ? C.s.b.indexOf(C.s.turn + 'K') : -1;
    if(ck >= 0){ const [x, y] = pt(ck); h += `<circle cx="${x}" cy="${y}" r="21" class="xck"/>`; }
    if(C.hint){ for(const q of [C.hint.f, C.hint.t]){ const [x, y] = pt(q); h += `<circle cx="${x}" cy="${y}" r="21" class="xht"/>`; } }
    for(let i = 0; i < 90; i++){
      const p = C.s.b[i]; if(!p) continue; const [x, y] = pt(i), red = p[0] === 'r';
      h += `<g transform="translate(${x} ${y})" class="xp ${red ? 'rd' : 'bk'}${C.sel === i ? ' sel' : ''}"><circle r="17.500" class="d1"/><circle r="13.800" class="d2"/><text y="6.500" class="gl">${GLY[p[0]][p[1]]}</text></g>`;
    }
    for(const m of C.moves){ const [x, y] = pt(m.t); h += m.cap ? `<circle cx="${x}" cy="${y}" r="20" class="xcp"/>` : `<circle cx="${x}" cy="${y}" r="6" class="xmv"/>`; }
    for(let i = 0; i < 90; i++){ const [x, y] = pt(i); h += `<rect x="${x - 20}" y="${y - 20}" width="40" height="40" fill="transparent" data-s="${i}"/>`; }
    return h;
  }
  function render(){
    $('#xqB', root).innerHTML = boardSVG(); status();
    $$('[data-m]', root).forEach(b => b.classList.toggle('on', b.dataset.m === C.mode));
    $$('[data-h]', root).forEach(b => b.classList.toggle('on', b.dataset.h === C.human));
    $$('[data-l]', root).forEach(b => b.classList.toggle('on', b.dataset.l === C.level));
    $('#xqSide', root).style.display = $('#xqLvl', root).style.display = C.mode === 'ai' ? 'flex' : 'none';
  }
  function undo(){
    if(C.think || !C.hist.length) return;
    let n = C.mode === 'ai' ? 2 : 1; if(C.mode === 'ai' && C.s.turn !== C.human) n = 1;
    while(n-- > 0 && C.hist.length) C.s = C.hist.pop().before;
    C.over = null; C.sel = -1; C.moves = []; C.hint = null; C.last = C.hist.length ? C.hist[C.hist.length - 1].m : null; persist(); render();
  }
  function hint(){ if(C.over || C.think) return; const m = bestMove(C.s, 2, 0); if(!m) return; C.hint = m; render(); setTimeout(() => { C.hint = null; render(); }, 3500); }
  function build(){
    root.innerHTML = `
      <div class="gcols"><div class="gL"><div class="cstat" id="xqSt"></div><div class="bw"><svg class="xqb" id="xqB" viewBox="0 0 360 400"></svg></div></div>
      <div class="gR"><div class="gcard">
        <div class="opt"><div class="lbl">Chế độ</div><div class="chips">${chips('m', [['ai', 'Chơi với máy'], ['pvp', '2 người']])}</div></div>
        <div class="opt" id="xqSide"><div class="lbl">Quân của bạn</div><div class="chips">${chips('h', [['r', 'Đỏ'], ['b', 'Đen']])}</div></div>
        <div class="opt" id="xqLvl"><div class="lbl">Cấp độ</div><div class="chips">${chips('l', [['easy', 'Dễ'], ['med', 'Vừa'], ['hard', 'Khó']])}</div></div></div>
      <div class="gbtns c4"><button class="gb" id="xqNew">${U.IC.new}<span>Ván mới</span></button><button class="gb" id="xqUndo">${U.IC.undo}<span>Hoàn tác</span></button><button class="gb" id="xqHint">${U.IC.hint}<span>Gợi ý</span></button><button class="gb" id="xqFlip">${U.IC.flip}<span>Lật bàn</span></button></div>
      <div class="gtip">Chạm quân cờ rồi chạm ô đích để đi</div></div></div>`;
    $('#xqB', root).addEventListener('click', e => { const s = e.target.dataset.s; if(s !== undefined) click(+s); });
    $$('[data-m]', root).forEach(b => b.onclick = () => { newGame({ mode: b.dataset.m, human: C.human, level: C.level }); persist(); });
    $$('[data-h]', root).forEach(b => b.onclick = () => { newGame({ mode: C.mode, human: b.dataset.h, level: C.level }); persist(); });
    $$('[data-l]', root).forEach(b => b.onclick = () => { C.level = b.dataset.l; persist(); render(); });
    $('#xqNew', root).onclick = () => { newGame({ mode: C.mode, human: C.human, level: C.level }); persist(); };
    $('#xqUndo', root).onclick = undo; $('#xqHint', root).onclick = hint;
    $('#xqFlip', root).onclick = () => { C.flip = !C.flip; persist(); render(); };
    restore();
  }
  return { id: 'xiangqi', name: 'Cờ tướng', icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="6.500"/><path d="M9 12h6M12 9v6"/></svg>', mount(el){ root = el; build(); }, _t: { initial, legal, apply, perft, bestMove } };
})();

[G2048, Caro, Xq].forEach(g => G.register(g));
G._xq = Xq._t;
})();
