/* SPX Express – Giao diện trò chơi: Sudoku · Dò mìn · Cờ vua */
(() => {
'use strict';
const X = window.SPX, st = X.store;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = n => String(n).padStart(2, '0');
const fmt = s => pad((s / 60) | 0) + ':' + pad(s % 60);
const rnd = n => (Math.random() * n) | 0;
const shuffle = a => { for(let i = a.length - 1; i > 0; i--){ const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const best = { get: () => st.get('spx_best', {}), set(k, v){ const b = this.get(); if(!b[k] || v < b[k]){ b[k] = v; st.set('spx_best', b); return true; } return false; } };
const IC = {
  undo:'<svg viewBox="0 0 24 24"><path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3"/></svg>',
  erase:'<svg viewBox="0 0 24 24"><path d="M20 20H9L3.5 14.5a2 2 0 010-2.8L12 3.2a2 2 0 012.8 0l5.7 5.7a2 2 0 010 2.8L13 19M7 11l6 6"/></svg>',
  note:'<svg viewBox="0 0 24 24"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
  hint:'<svg viewBox="0 0 24 24"><path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7c.6.5 1 1.2 1 2V17h6v-.3c0-.8.4-1.5 1-2A7 7 0 0012 2z"/></svg>',
  flip:'<svg viewBox="0 0 24 24"><path d="M7 4v14M3 14l4 4 4-4M17 20V6M13 10l4-4 4 4"/></svg>',
  new:'<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 109-9 9 9 0 00-6.7 3M3 4v5h5"/></svg>',
  flag:'<svg viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
  dig:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3"/></svg>',
  pause:'<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>',
  back:'<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>'
};
const TAB_IC = {
  sudoku:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>',
  mine:'<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="5"/><path d="M12 4v3M5 7l2 2M19 7l-2 2M3 13h3M18 13h3"/></svg>',
  chess:'<svg viewBox="0 0 24 24"><path d="M12 3a3 3 0 100 6 3 3 0 000-6zM10 9l-1 6h6l-1-6M8 15l-1 6h10l-1-6"/></svg>'
};

/* ---------- Từ điển tiếng Anh cho trò chơi ---------- */
X.extend({
  'Sudoku':'Sudoku','Dò mìn':'Minesweeper','Cờ vua':'Chess','Dễ':'Easy','Vừa':'Medium','Khó':'Hard','Lỗi':'Mistakes',
  'Hoàn tác':'Undo','Xóa':'Erase','Ghi chú':'Notes','Gợi ý':'Hint','Ván mới':'New game','Chúc mừng!':'Congratulations!',
  'Bạn đã giải xong Sudoku':'You solved the Sudoku','Kỷ lục mới!':'New record!','Thua rồi':'Game over','Bạn đã sai 3 lần':'You made 3 mistakes',
  'Chơi lại':'Play again','Chọn một ô trước':'Select a cell first','Hết lượt gợi ý':'No hints left','Ô này đã đúng':'This cell is already correct',
  'Mở ô':'Reveal','Cắm cờ':'Flag','Mìn':'Mines','Chạm giữ một ô để cắm cờ · chạm vào số để mở nhanh':'Long-press a cell to flag · tap a number to chord',
  'Thắng!':'You win!','Đã dò hết mìn':'All mines cleared','Nổ mìn!':'Boom!','Bạn đã chạm phải mìn':'You hit a mine','Thử lại':'Try again',
  'Chơi với máy':'Vs computer','2 người':'2 players','Trắng':'White','Đen':'Black','Lật bàn':'Flip','Quân của bạn':'Your side','Cấp độ':'Level',
  'Chế độ':'Mode','Phong cấp':'Promote to','Máy đang nghĩ…':'Computer is thinking…','Lượt Trắng':'White to move','Lượt Đen':'Black to move',
  'Chiếu!':'Check!','Chiếu hết! Trắng thắng':'Checkmate! White wins','Chiếu hết! Đen thắng':'Checkmate! Black wins',
  'Hòa cờ (hết nước đi)':'Draw (stalemate)','Hòa (lặp lại thế cờ)':'Draw (repetition)','Hòa (luật 50 nước)':'Draw (50-move rule)',
  'Hòa (không đủ lực lượng chiếu hết)':'Draw (insufficient material)','Chưa có nước đi':'No moves yet','Quân bị bắt':'Captured',
  'Chạm quân cờ rồi chạm ô đích để đi':'Tap a piece, then tap a target square'
}, [
  [/^Đã hoàn thành trong (.+)$/, (m, a) => 'Completed in ' + a],
  [/^Gợi ý: (.+)$/, (m, a) => 'Hint: ' + a],
  [/^Kỷ lục: (.+)$/, (m, a) => 'Best: ' + a]
]);

X.extend({ 'Trò chơi':'Games','Chọn trò chơi':'Choose a game' });

/* ---------- CSS ---------- */
const CSS = `
.gm{padding:0 12px;max-width:520px;margin:0 auto}
.gtabs{display:grid;grid-template-columns:repeat(3,1fr);gap:5px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:4px;box-shadow:var(--shadow);margin-bottom:9px}
.gtabs button{height:40px;border-radius:11px;background:transparent;color:var(--muted);font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;gap:6px;transition:.2s}
.gtabs button svg{width:16px;height:16px}
.gtabs button.on{background:linear-gradient(135deg,var(--brand),#ff7a4d);color:#fff;box-shadow:0 4px 12px rgba(238,78,44,.35)}
.gpane{display:none}.gpane.on{display:block;animation:fade .25s}
.gbar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;flex-wrap:wrap}
.chips{display:flex;gap:5px;flex-wrap:wrap}
.chip{height:32px;padding:0 12px;border-radius:99px;background:var(--card);border:1px solid var(--line);color:var(--muted);font-weight:700;font-size:11.5px;transition:.2s}
.chip.on{background:var(--navy);color:#fff;border-color:var(--navy)}
.gstat{display:flex;gap:10px;font-size:11.5px;font-weight:600;color:var(--muted);align-items:center}
.gstat b{color:var(--text);font-size:13px;font-variant-numeric:tabular-nums}
.gcard{background:var(--card);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--shadow);padding:10px;position:relative}
.gbtns{display:grid;gap:7px;margin-top:9px}
.gbtns.c4{grid-template-columns:repeat(4,1fr)}.gbtns.c2{grid-template-columns:repeat(2,1fr)}.gbtns.c3{grid-template-columns:repeat(3,1fr)}
.gb{min-height:46px;border-radius:12px;background:rgba(7,55,99,.1);color:var(--navy);font-weight:700;font-size:10.5px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;transition:.15s;padding:4px}
[data-theme="dark"] .gb{background:rgba(255,255,255,.1);color:#fff}
.gb svg{width:17px;height:17px}.gb:active{transform:scale(.94)}
.gb.on{background:var(--brand);color:#fff}
.gb:disabled{opacity:.4}
.gtip{font-size:10.5px;color:var(--muted);text-align:center;margin-top:8px;font-weight:500}
.gov{position:absolute;inset:0;border-radius:10px;background:rgba(6,24,43,.82);backdrop-filter:blur(3px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:#fff;text-align:center;padding:16px;animation:fade .3s;z-index:5}
.gov[hidden]{display:none}
.gov h4{margin:0;font-size:20px;font-weight:800}.gov p{margin:0;font-size:12.5px;font-weight:500;opacity:.9}
.gov .btn{width:auto;padding:0 22px;margin-top:8px;height:42px}
/* Sudoku */
.sdw{position:relative;max-width:400px;margin:0 auto}
.sdk{display:grid;grid-template-columns:repeat(9,1fr);aspect-ratio:1;border:2.5px solid var(--navy);border-radius:10px;overflow:hidden;background:var(--card)}
[data-theme="dark"] .sdk{border-color:#5d86b3}
.sc{position:relative;display:grid;place-items:center;font-size:clamp(15px,5.2vw,23px);font-weight:600;border:0;background:var(--card);color:var(--brand);border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:0;min-width:0;transition:background .15s}
.sc.g{color:var(--text);font-weight:800}
.sc.cr{border-right:2px solid var(--navy)}.sc.rb{border-bottom:2px solid var(--navy)}
[data-theme="dark"] .sc.cr{border-right-color:#5d86b3}[data-theme="dark"] .sc.rb{border-bottom-color:#5d86b3}
.sc.pr{background:rgba(7,55,99,.07)}[data-theme="dark"] .sc.pr{background:rgba(255,255,255,.07)}
.sc.sm{background:rgba(238,78,44,.22)}
.sc.sl{background:rgba(238,78,44,.42)}
.sc.er{color:var(--err);background:rgba(217,48,37,.16)}
.nt{position:absolute;inset:1px;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);font-size:clamp(7px,2.3vw,10px);color:var(--muted);line-height:1;font-weight:600;place-items:center;pointer-events:none}
.np{display:grid;grid-template-columns:repeat(9,1fr);gap:4px;margin-top:9px}
.np button{position:relative;height:46px;border-radius:10px;background:var(--input);border:1.5px solid var(--line);color:var(--navy);font-weight:800;font-size:19px;padding:0}
[data-theme="dark"] .np button{color:#fff}
.np button:active{transform:scale(.92);background:var(--sel)}
.np button i{position:absolute;right:3px;bottom:1px;font-style:normal;font-size:8px;font-weight:600;color:var(--muted)}
.np button.done{opacity:.28}
/* Dò mìn */
.mb{display:grid;gap:2px;max-width:420px;margin:0 auto;touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.mc{aspect-ratio:1;display:grid;place-items:center;border-radius:5px;font-weight:800;font-size:clamp(11px,4vw,17px);line-height:1;cursor:pointer;transition:background .12s}
.mc.u{background:linear-gradient(145deg,#dbe8f6,#b9d0e8);box-shadow:inset 0 -2px 0 rgba(7,55,99,.18)}
[data-theme="dark"] .mc.u{background:linear-gradient(145deg,#24527f,#1a4068)}
.mc.r{background:var(--input);border:1px solid var(--line);cursor:default}
.mc.bm{background:var(--err)!important}.mc.wr{background:rgba(217,48,37,.25)}
.mc.n1{color:#1565c0}.mc.n2{color:#1a9e5c}.mc.n3{color:#d93025}.mc.n4{color:#073763}.mc.n5{color:#8e24aa}.mc.n6{color:#00838f}.mc.n7{color:#455a64}.mc.n8{color:#90a4ae}
[data-theme="dark"] .mc.n4{color:#8ab4e0}
.face{width:40px;height:40px;border-radius:12px;background:var(--card);border:1px solid var(--line);font-size:22px;display:grid;place-items:center;box-shadow:var(--shadow)}
.face:active{transform:scale(.92)}
/* Cờ vua */
.cbw{position:relative;max-width:420px;margin:0 auto}
.cb{display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(8,1fr);aspect-ratio:1;border-radius:10px;overflow:hidden;border:2px solid var(--navy);touch-action:manipulation;user-select:none;-webkit-user-select:none}
.cs{position:relative;display:grid;place-items:center;cursor:pointer;min-width:0;min-height:0;overflow:hidden}
.cs.l{background:#efecd6}.cs.d{background:#0b3a6b}
[data-theme="dark"] .cs.l{background:#d8d5bf}
.cs.lm{background:#f6ee7b!important}.cs.sl{background:#f6ee7b!important;box-shadow:inset 0 0 0 3px #e6d84a}
.cs.ck{background:#e8352e!important}.cs.ht{box-shadow:inset 0 0 0 3px #4fc3f7}
.cs img{width:92%;height:92%;object-fit:contain;pointer-events:none;-webkit-user-drag:none;filter:drop-shadow(0 2px 2px rgba(0,0,0,.28))}
.cs .rk,.cs .fl{position:absolute;font-size:clamp(8px,2.6vw,11px);font-weight:700;pointer-events:none}
.cs .rk{left:3px;top:2px}.cs .fl{right:3px;bottom:1px}
.cs.l .rk,.cs.l .fl{color:#6f8a3c}.cs.d .rk,.cs.d .fl{color:#9cc0e6}
.cs .mv{position:absolute;width:30%;height:30%;border-radius:50%;background:rgba(238,78,44,.55);pointer-events:none}
.cs .cp{position:absolute;inset:3px;border-radius:50%;border:4px solid rgba(238,78,44,.7);pointer-events:none}
.cstat{text-align:center;font-weight:700;font-size:13px;margin:9px 0 3px;min-height:20px}
.cstat.warn{color:var(--err)}
.cap{display:flex;flex-wrap:wrap;align-items:center;gap:0;min-height:22px;margin:3px 2px;font-size:10px;color:var(--muted);font-weight:600}
.cap img{width:20px;height:20px;margin-right:-6px}
.mvs{font-size:11.5px;font-weight:600;color:var(--muted);margin-top:8px;max-height:56px;overflow:auto;line-height:1.6}
.mvs b{color:var(--text);font-weight:700}
.pro{position:absolute;inset:0;z-index:6;background:rgba(6,24,43,.78);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;border-radius:10px;animation:fade .2s}
.pro[hidden]{display:none}
.pro span{color:#fff;font-weight:700;font-size:13px}
.pro div{display:flex;gap:8px}
.pro button{width:62px;height:62px;border-radius:14px;background:#efecd6;padding:4px}
.pro img{width:100%;height:100%;object-fit:contain}
.opt{display:flex;align-items:center;gap:8px;margin-top:6px}.opt:first-child{margin-top:0}.opt .lbl{margin:0;min-width:74px}
.lbl{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin:8px 2px 4px}
`;

/* ======================== SUDOKU ======================== */
const Sdk = (() => {
  const LV = { easy:[40, 'Dễ'], med:[32, 'Vừa'], hard:[26, 'Khó'] };
  let root, S, cells = [], nps = [];
  const box = i => (((i / 9) | 0) / 3 | 0) * 3 + ((i % 9) / 3 | 0);
  const peer = (a, b) => a !== b && ((a / 9 | 0) === (b / 9 | 0) || a % 9 === b % 9 || box(a) === box(b));
  const pop = m => { let n = 0; while(m){ m &= m - 1; n++; } return n; };
  function search(g, limit, rand){            // bitmask backtracking, MRV
    const R = Array(9).fill(0), C = Array(9).fill(0), B = Array(9).fill(0);
    for(let i = 0; i < 81; i++){ const v = g[i]; if(v){ const b = 1 << v; if(R[i / 9 | 0] & b || C[i % 9] & b || B[box(i)] & b) return 0; R[i / 9 | 0] |= b; C[i % 9] |= b; B[box(i)] |= b; } }
    let count = 0;
    const rec = () => {
      let bi = -1, bm = 0, bc = 10;
      for(let i = 0; i < 81; i++){
        if(g[i]) continue;
        const m = ~(R[i / 9 | 0] | C[i % 9] | B[box(i)]) & 0x3FE, n = pop(m);
        if(n < bc){ bc = n; bi = i; bm = m; if(n <= 1) break; }
      }
      if(bi < 0){ if(!count) search.sol = g.slice(); count++; return; }
      if(!bc) return;
      const r = bi / 9 | 0, c = bi % 9, b = box(bi), vals = rand ? shuffle([1,2,3,4,5,6,7,8,9]) : [1,2,3,4,5,6,7,8,9];
      for(const v of vals){
        const bt = 1 << v; if(!(bm & bt)) continue;
        g[bi] = v; R[r] |= bt; C[c] |= bt; B[b] |= bt;
        rec();
        R[r] &= ~bt; C[c] &= ~bt; B[b] &= ~bt; g[bi] = 0;
        if(count >= limit) return;
      }
    };
    rec(); return count;
  }
  function make(diff){
    search(Array(81).fill(0), 1, true);
    const sol = search.sol.slice(), pz = sol.slice(), t0 = Date.now();
    let clues = 81;
    for(const i of shuffle([...Array(81).keys()])){
      if(clues <= LV[diff][0] || Date.now() - t0 > 1400) break;
      const v = pz[i]; pz[i] = 0;
      if(search(pz.slice(), 2, false) !== 1) pz[i] = v; else clues--;
    }
    return { diff, given: pz.map(v => v > 0), sol, cur: pz.slice(), notes: Array(81).fill(0), sel: -1, note: false, mist: 0, time: 0, hints: 0, hist: [], over: 0 };
  }
  const save = () => st.set('spx_sdk', S);
  function snap(){ S.hist.push({ cur: S.cur.slice(), notes: S.notes.slice() }); if(S.hist.length > 80) S.hist.shift(); }
  function win(){
    S.over = 1;
    const rec = best.set('sdk_' + S.diff, S.time);
    const ov = $('#sdOv', root); ov.hidden = false;
    ov.innerHTML = `<h4>Chúc mừng!</h4><p>Bạn đã giải xong Sudoku</p><p>Đã hoàn thành trong ${fmt(S.time)}${rec ? ' · Kỷ lục mới!' : ''}</p><button class="btn b2" id="sdAgain">Ván mới</button>`;
    $('#sdAgain', root).onclick = () => start(S.diff); X.beep(true);
  }
  function lose(){
    S.over = 2; const ov = $('#sdOv', root); ov.hidden = false;
    ov.innerHTML = `<h4>Thua rồi</h4><p>Bạn đã sai 3 lần</p><button class="btn b2" id="sdAgain">Chơi lại</button>`;
    $('#sdAgain', root).onclick = () => start(S.diff); X.beep(false);
  }
  function checkWin(){ if(S.cur.every((v, i) => v === S.sol[i])) win(); }
  function put(n){
    const i = S.sel; if(i < 0) return X.toast('Chọn một ô trước', 'info');
    if(S.over || S.given[i]) return;
    if(S.note){ if(S.cur[i]) return; snap(); S.notes[i] ^= 1 << n; }
    else{
      if(S.cur[i] === n) return;
      snap(); S.cur[i] = n; S.notes[i] = 0;
      if(n !== S.sol[i]){ S.mist++; X.beep(false); if(S.mist >= 3) lose(); }
      else{ for(let j = 0; j < 81; j++) if(peer(i, j)) S.notes[j] &= ~(1 << n); checkWin(); }
    }
    save(); upd();
  }
  function erase(){ const i = S.sel; if(i < 0 || S.over || S.given[i] || (!S.cur[i] && !S.notes[i])) return; snap(); S.cur[i] = 0; S.notes[i] = 0; save(); upd(); }
  function undo(){ if(S.over || !S.hist.length) return; const h = S.hist.pop(); S.cur = h.cur; S.notes = h.notes; save(); upd(); }
  function hint(){
    if(S.over) return; if(S.hints >= 3) return X.toast('Hết lượt gợi ý', 'info');
    let i = S.sel; if(i < 0 || S.given[i] || S.cur[i] === S.sol[i]) i = S.cur.findIndex((v, k) => v !== S.sol[k]);
    if(i < 0) return; snap(); S.sel = i; S.cur[i] = S.sol[i]; S.notes[i] = 0; S.hints++;
    for(let j = 0; j < 81; j++) if(peer(i, j)) S.notes[j] &= ~(1 << S.sol[i]);
    checkWin(); save(); upd();
  }
  function upd(){
    const sv = S.sel >= 0 ? S.cur[S.sel] : 0;
    cells.forEach((c, i) => {
      const v = S.cur[i];
      let cls = 'sc' + (S.given[i] ? ' g' : '') + (i % 9 === 2 || i % 9 === 5 ? ' cr' : '') + ((i / 9 | 0) === 2 || (i / 9 | 0) === 5 ? ' rb' : '');
      if(S.sel >= 0){ if(i === S.sel) cls += ' sl'; else if(sv && v === sv) cls += ' sm'; else if(peer(S.sel, i)) cls += ' pr'; }
      if(v && v !== S.sol[i]) cls += ' er';
      c.className = cls;
      if(v) c.textContent = v;
      else if(S.notes[i]){ let h = '<div class="nt">'; for(let n = 1; n <= 9; n++) h += `<span>${S.notes[i] & (1 << n) ? n : ''}</span>`; c.innerHTML = h + '</div>'; }
      else c.textContent = '';
    });
    nps.forEach((b, k) => { const n = k + 1, left = 9 - S.cur.filter((v, i) => v === n && v === S.sol[i]).length; b.querySelector('i').textContent = left; b.classList.toggle('done', left <= 0); });
    $('#sdM', root).textContent = S.mist + '/3'; $('#sdT', root).textContent = fmt(S.time);
    $('#sdNote', root).classList.toggle('on', S.note); $('#sdNoteT', root).textContent = S.note ? 'Bật' : 'Ghi chú';
    $$('#sdLv .chip', root).forEach(b => b.classList.toggle('on', b.dataset.d === S.diff));
    $('#sdBest', root).textContent = best.get()['sdk_' + S.diff] ? 'Kỷ lục: ' + fmt(best.get()['sdk_' + S.diff]) : '';
  }
  function start(diff){
    $('#sdOv', root).hidden = true;
    const ov = $('#sdg', root); ov.style.opacity = .4;
    setTimeout(() => { S = make(diff); ov.style.opacity = 1; save(); upd(); }, 20);
  }
  function build(){
    root.innerHTML = `
      <div class="gbar"><div class="chips" id="sdLv">${Object.entries(LV).map(([k, v]) => `<button class="chip" data-d="${k}">${v[1]}</button>`).join('')}</div>
        <div class="gstat"><span>Lỗi <b id="sdM">0/3</b></span><b id="sdT">00:00</b></div></div>
      <div class="gcols"><div class="gL"><div class="gcard"><div class="sdw"><div class="sdk" id="sdg" style="transition:opacity .2s"></div><div class="gov" id="sdOv" hidden></div></div></div></div>
      <div class="gR"><div class="gcard">
        <div class="np" id="sdN"></div>
        <div class="gbtns c4">
          <button class="gb" id="sdUndo">${IC.undo}<span>Hoàn tác</span></button>
          <button class="gb" id="sdErase">${IC.erase}<span>Xóa</span></button>
          <button class="gb" id="sdNote">${IC.note}<span id="sdNoteT">Ghi chú</span></button>
          <button class="gb" id="sdHint">${IC.hint}<span>Gợi ý</span></button>
        </div>
        <div class="gtip" id="sdBest"></div></div>
      <button class="btn b2" id="sdNew" style="margin-top:9px;width:100%">${IC.new}Ván mới</button></div></div>`;
    const g = $('#sdg', root);
    for(let i = 0; i < 81; i++){ const b = document.createElement('button'); b.type = 'button'; b.onclick = () => { S.sel = S.sel === i ? -1 : i; upd(); }; g.appendChild(b); cells.push(b); }
    const np = $('#sdN', root);
    for(let n = 1; n <= 9; n++){ const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `${n}<i></i>`; b.onclick = () => put(n); np.appendChild(b); nps.push(b); }
    $('#sdUndo', root).onclick = undo; $('#sdErase', root).onclick = erase; $('#sdHint', root).onclick = hint;
    $('#sdNote', root).onclick = () => { S.note = !S.note; upd(); };
    $('#sdNew', root).onclick = () => start(S.diff);
    $$('#sdLv .chip', root).forEach(b => b.onclick = () => start(b.dataset.d));
  }
  return {
    mount(el){ root = el; build(); const sv = st.get('spx_sdk', null); if(sv && sv.cur && sv.cur.length === 81){ S = sv; if(S.over === 1) start(S.diff); else { upd(); if(S.over === 2) lose(); } } else start('easy'); },
    tick(){ if(S && !S.over){ S.time++; $('#sdT', root).textContent = fmt(S.time); if(S.time % 5 === 0) save(); } }
  };
})();

/* ======================== DÒ MÌN ======================== */
const Mine = (() => {
  const LV = { easy:[9, 9, 10, 'Dễ'], med:[12, 12, 24, 'Vừa'], hard:[16, 16, 40, 'Khó'] };
  let root, G, lp = 0, fired = false;
  const nb = i => { const a = [], r = i / G.C | 0, c = i % G.C; for(let dr = -1; dr <= 1; dr++) for(let dc = -1; dc <= 1; dc++){ if(!dr && !dc) continue; const nr = r + dr, nc = c + dc; if(nr >= 0 && nr < G.R && nc >= 0 && nc < G.C) a.push(nr * G.C + nc); } return a; };
  function start(lv){
    const [R, C, N] = LV[lv], T = R * C;
    G = { lv, R, C, N, mine: Array(T).fill(false), cnt: Array(T).fill(0), rev: Array(T).fill(false), flg: Array(T).fill(false), started: false, over: 0, time: 0, fm: false, boom: -1 };
    st.set('spx_mine_lv', lv); $('#mnOv', root).hidden = true; render();
  }
  function place(first){
    const safe = new Set([first, ...nb(first)]); let n = 0;
    while(n < G.N){ const i = rnd(G.R * G.C); if(G.mine[i] || safe.has(i)) continue; G.mine[i] = true; n++; }
    for(let i = 0; i < G.mine.length; i++) G.cnt[i] = nb(i).filter(j => G.mine[j]).length;
  }
  function flood(i){ const s = [i]; while(s.length){ const k = s.pop(); if(G.rev[k] || G.flg[k]) continue; G.rev[k] = true; if(!G.cnt[k]) nb(k).forEach(j => { if(!G.rev[j] && !G.mine[j]) s.push(j); }); } }
  function over(res){
    G.over = res; const ov = $('#mnOv', root); ov.hidden = false;
    if(res === 1){
      G.flg = G.mine.slice(); const rec = best.set('mine_' + G.lv, G.time);
      ov.innerHTML = `<h4>Thắng!</h4><p>Đã hoàn thành trong ${fmt(G.time)}${rec ? ' · Kỷ lục mới!' : ''}</p><button class="btn b2" id="mnAgain">Ván mới</button>`; X.beep(true);
    }else{
      ov.innerHTML = `<h4>Nổ mìn!</h4><p>Bạn đã chạm phải mìn</p><button class="btn b2" id="mnAgain">Thử lại</button>`; X.beep(false);
    }
    $('#mnAgain', root).onclick = () => start(G.lv);
  }
  function win(){ if(G.rev.filter(Boolean).length === G.R * G.C - G.N) over(1); }
  function openCell(i){
    if(G.over || G.rev[i] || G.flg[i]) return;
    if(!G.started){ place(i); G.started = true; }
    if(G.mine[i]){ G.boom = i; return over(2); }
    flood(i); win();
  }
  function chord(i){
    if(!G.rev[i] || !G.cnt[i]) return; const n = nb(i);
    if(n.filter(j => G.flg[j]).length !== G.cnt[i]) return;
    for(const j of n) if(!G.flg[j] && !G.rev[j]){ if(G.mine[j]){ G.boom = j; return over(2); } flood(j); }
    win();
  }
  function flag(i){ if(G.over || G.rev[i]) return; G.flg[i] = !G.flg[i]; if(navigator.vibrate) navigator.vibrate(25); }
  function tap(i){
    if(G.over) return;
    if(G.rev[i]) chord(i); else if(G.fm) flag(i); else openCell(i);
    render();
  }
  function render(){
    const g = $('#mnG', root); g.style.gridTemplateColumns = `repeat(${G.C},1fr)`;
    let h = '';
    for(let i = 0; i < G.R * G.C; i++){
      let cls = 'mc', t = '';
      if(G.rev[i]){ cls += ' r' + (G.cnt[i] ? ' n' + G.cnt[i] : ''); t = G.cnt[i] || ''; }
      else if(G.over === 2 && G.mine[i] && !G.flg[i]){ cls += ' r' + (i === G.boom ? ' bm' : ''); t = '💣'; }
      else if(G.over === 2 && G.flg[i] && !G.mine[i]){ cls += ' u wr'; t = '❌'; }
      else if(G.flg[i]){ cls += ' u'; t = '🚩'; }
      else cls += ' u';
      h += `<div class="${cls}" data-i="${i}">${t}</div>`;
    }
    g.innerHTML = h;
    $('#mnLeft', root).textContent = G.N - G.flg.filter(Boolean).length;
    $('#mnFace', root).textContent = G.over === 1 ? '😎' : G.over === 2 ? '😵' : '🙂';
    $('#mnMode', root).classList.toggle('on', G.fm);
    $$('#mnLv .chip', root).forEach(b => b.classList.toggle('on', b.dataset.d === G.lv));
    $('#mnT', root).textContent = fmt(G.time);
    const bt = best.get()['mine_' + G.lv]; $('#mnBest', root).textContent = bt ? 'Kỷ lục: ' + fmt(bt) : '';
  }
  function build(){
    root.innerHTML = `
      <div class="gbar"><div class="chips" id="mnLv">${Object.entries(LV).map(([k, v]) => `<button class="chip" data-d="${k}">${v[3]}</button>`).join('')}</div>
        <div class="gstat"><span>💣 <b id="mnLeft">0</b></span><b id="mnT">00:00</b></div></div>
      <div class="gcols"><div class="gL"><div class="gcard"><div class="bw" style="position:relative"><div class="mb" id="mnG"></div><div class="gov" id="mnOv" hidden></div></div></div></div>
      <div class="gR"><div class="gcard">
        <div class="gbar" style="margin-bottom:9px"><button class="face" id="mnFace" aria-label="Ván mới">🙂</button>
          <button class="gb" id="mnMode" style="flex:1;flex-direction:row;gap:7px;min-height:40px;font-size:12px">${IC.flag}<span id="mnModeT">Cắm cờ</span></button></div>
        <div class="gtip">Chạm giữ một ô để cắm cờ · chạm vào số để mở nhanh</div><div class="gtip" id="mnBest"></div></div>
      <button class="btn b2" id="mnNew" style="margin-top:9px;width:100%">${IC.new}Ván mới</button></div></div>`;
    const g = $('#mnG', root);
    g.addEventListener('pointerdown', e => { const c = e.target.closest('.mc'); if(!c) return; fired = false; clearTimeout(lp); const i = +c.dataset.i; lp = setTimeout(() => { fired = true; if(!G.over){ if(G.rev[i]) return; flag(i); render(); } }, 420); });
    g.addEventListener('pointerup', e => { clearTimeout(lp); const c = e.target.closest('.mc'); if(c && !fired) tap(+c.dataset.i); });
    ['pointercancel', 'pointerleave'].forEach(ev => g.addEventListener(ev, () => clearTimeout(lp)));
    g.addEventListener('contextmenu', e => { e.preventDefault(); const c = e.target.closest('.mc'); if(c){ flag(+c.dataset.i); render(); } });
    $('#mnMode', root).onclick = () => { G.fm = !G.fm; $('#mnModeT', root).textContent = G.fm ? 'Mở ô' : 'Cắm cờ'; render(); };
    $('#mnFace', root).onclick = () => start(G.lv); $('#mnNew', root).onclick = () => start(G.lv);
    $$('#mnLv .chip', root).forEach(b => b.onclick = () => start(b.dataset.d));
  }
  return {
    mount(el){ root = el; build(); start(st.get('spx_mine_lv', 'easy')); },
    tick(){ if(G && G.started && !G.over){ G.time++; $('#mnT', root).textContent = fmt(G.time); } }
  };
})();

/* ======================== CỜ VUA ======================== */
const Chess = (() => {
  const V = { P:100, N:320, B:330, R:500, Q:900, K:0 };
  const KN = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]], KG = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  const RD = [[-1,0],[1,0],[0,-1],[0,1]], BD = [[-1,-1],[-1,1],[1,-1],[1,1]], FILES = 'abcdefgh';
  const opp = c => c === 'w' ? 'b' : 'w', inb = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8, sqn = i => FILES[i & 7] + (8 - (i >> 3));
  function initial(){ const b = Array(64).fill(null), back = 'RNBQKBNR'; for(let c = 0; c < 8; c++){ b[c] = 'b' + back[c]; b[8 + c] = 'bP'; b[48 + c] = 'wP'; b[56 + c] = 'w' + back[c]; } return { b, turn:'w', cast:{ wK:1, wQ:1, bK:1, bQ:1 }, ep:-1, half:0, full:1 }; }
  function fromFEN(f){
    const [pos, turn, cs, ep, half, full] = f.split(' '), b = Array(64).fill(null); let i = 0;
    for(const ch of pos){ if(ch === '/') continue; if(/\d/.test(ch)) i += +ch; else b[i++] = (ch === ch.toUpperCase() ? 'w' : 'b') + ch.toUpperCase(); }
    return { b, turn, cast:{ wK:+cs.includes('K'), wQ:+cs.includes('Q'), bK:+cs.includes('k'), bQ:+cs.includes('q') }, ep: ep === '-' ? -1 : (8 - ep[1]) * 8 + FILES.indexOf(ep[0]), half:+half || 0, full:+full || 1 };
  }
  function attacked(b, sq, by){
    const r = sq >> 3, c = sq & 7, pr = by === 'w' ? r + 1 : r - 1;
    for(const dc of [-1, 1]) if(inb(pr, c + dc) && b[pr * 8 + c + dc] === by + 'P') return true;
    for(const [dr, dc] of KN) if(inb(r + dr, c + dc) && b[(r + dr) * 8 + c + dc] === by + 'N') return true;
    for(const [dr, dc] of KG) if(inb(r + dr, c + dc) && b[(r + dr) * 8 + c + dc] === by + 'K') return true;
    for(const [dirs, t] of [[RD, 'R'], [BD, 'B']]) for(const [dr, dc] of dirs){
      let nr = r + dr, nc = c + dc;
      while(inb(nr, nc)){ const p = b[nr * 8 + nc]; if(p){ if(p[0] === by && (p[1] === t || p[1] === 'Q')) return true; break; } nr += dr; nc += dc; }
    }
    return false;
  }
  const kingSq = (b, c) => b.indexOf(c + 'K');
  function pseudo(s){
    const out = [], b = s.b, me = s.turn, en = opp(me);
    for(let i = 0; i < 64; i++){
      const p = b[i]; if(!p || p[0] !== me) continue;
      const t = p[1], r = i >> 3, c = i & 7;
      if(t === 'P'){
        const d = me === 'w' ? -1 : 1, sr = me === 'w' ? 6 : 1, pr = me === 'w' ? 0 : 7, nr = r + d;
        const add = (to, cap, ep) => { if((to >> 3) === pr) for(const pm of 'QRBN') out.push({ f:i, t:to, cap, promo:pm }); else out.push({ f:i, t:to, cap, ep:ep ? 1 : 0 }); };
        if(inb(nr, c) && !b[nr * 8 + c]){ add(nr * 8 + c, null); if(r === sr && !b[(r + 2 * d) * 8 + c]) out.push({ f:i, t:(r + 2 * d) * 8 + c, cap:null, dbl:1 }); }
        for(const dc of [-1, 1]){ const nc = c + dc; if(!inb(nr, nc)) continue; const to = nr * 8 + nc; if(b[to] && b[to][0] === en) add(to, b[to]); else if(to === s.ep) add(to, en + 'P', 1); }
      }else if(t === 'N' || t === 'K'){
        for(const [dr, dc] of (t === 'N' ? KN : KG)){ const nr = r + dr, nc = c + dc; if(!inb(nr, nc)) continue; const to = nr * 8 + nc; if(!b[to] || b[to][0] === en) out.push({ f:i, t:to, cap:b[to] }); }
        if(t === 'K'){
          const base = me === 'w' ? 60 : 4;
          if(i === base && !attacked(b, i, en)){
            if(s.cast[me + 'K'] && !b[base + 1] && !b[base + 2] && b[base + 3] === me + 'R' && !attacked(b, base + 1, en) && !attacked(b, base + 2, en)) out.push({ f:i, t:base + 2, cap:null, castle:'K' });
            if(s.cast[me + 'Q'] && !b[base - 1] && !b[base - 2] && !b[base - 3] && b[base - 4] === me + 'R' && !attacked(b, base - 1, en) && !attacked(b, base - 2, en)) out.push({ f:i, t:base - 2, cap:null, castle:'Q' });
          }
        }
      }else{
        for(const [dr, dc] of (t === 'R' ? RD : t === 'B' ? BD : RD.concat(BD))){
          let nr = r + dr, nc = c + dc;
          while(inb(nr, nc)){ const to = nr * 8 + nc; if(!b[to]) out.push({ f:i, t:to, cap:null }); else { if(b[to][0] === en) out.push({ f:i, t:to, cap:b[to] }); break; } nr += dr; nc += dc; }
        }
      }
    }
    return out;
  }
  function apply(s, m){
    const me = s.turn, ns = { b:s.b.slice(), turn:opp(me), cast:{ ...s.cast }, ep:-1, half:s.half + 1, full:s.full + (me === 'b' ? 1 : 0) };
    const p = ns.b[m.f];
    ns.b[m.t] = m.promo ? me + m.promo : p; ns.b[m.f] = null;
    if(m.ep) ns.b[m.t + (me === 'w' ? 8 : -8)] = null;
    if(m.castle === 'K'){ ns.b[m.f + 1] = ns.b[m.f + 3]; ns.b[m.f + 3] = null; }
    if(m.castle === 'Q'){ ns.b[m.f - 1] = ns.b[m.f - 4]; ns.b[m.f - 4] = null; }
    if(p[1] === 'K'){ ns.cast[me + 'K'] = 0; ns.cast[me + 'Q'] = 0; }
    if(m.f === 63 || m.t === 63) ns.cast.wK = 0; if(m.f === 56 || m.t === 56) ns.cast.wQ = 0;
    if(m.f === 7 || m.t === 7) ns.cast.bK = 0; if(m.f === 0 || m.t === 0) ns.cast.bQ = 0;
    if(p[1] === 'P' || m.cap) ns.half = 0;
    if(m.dbl) ns.ep = (m.f + m.t) / 2;
    return ns;
  }
  function legal(s){ const me = s.turn, en = opp(me); return pseudo(s).filter(m => { const ns = apply(s, m), k = kingSq(ns.b, me); return k < 0 || !attacked(ns.b, k, en); }); }
  const inCheck = (s, c) => attacked(s.b, kingSq(s.b, c), opp(c));
  function san(s, m, list){
    let str;
    if(m.castle) str = m.castle === 'K' ? 'O-O' : 'O-O-O';
    else{
      const pc = s.b[m.f][1]; str = '';
      if(pc !== 'P'){
        str += pc;
        const oth = list.filter(x => x.f !== m.f && s.b[x.f] === s.b[m.f] && x.t === m.t);
        if(oth.length){ const sf = oth.some(x => (x.f & 7) === (m.f & 7)), sr = oth.some(x => (x.f >> 3) === (m.f >> 3)); if(!sf) str += FILES[m.f & 7]; else if(!sr) str += 8 - (m.f >> 3); else str += FILES[m.f & 7] + (8 - (m.f >> 3)); }
      }
      if(m.cap){ if(pc === 'P') str += FILES[m.f & 7]; str += 'x'; }
      str += sqn(m.t); if(m.promo) str += '=' + m.promo;
    }
    const ns = apply(s, m); if(inCheck(ns, ns.turn)) str += legal(ns).length ? '+' : '#';
    return str;
  }
  function insufficient(b){
    const ps = b.filter(Boolean).filter(p => p[1] !== 'K'); if(!ps.length) return true;
    if(ps.some(p => 'PRQ'.includes(p[1]))) return false;
    if(ps.length === 1) return true;
    if(ps.every(p => p[1] === 'B')){ const sq = b.map((p, i) => p && p[1] === 'B' ? ((i >> 3) + (i & 7)) % 2 : -1).filter(x => x >= 0); return sq.every(x => x === sq[0]); }
    return false;
  }
  const key = s => s.b.map(p => p || '-').join('') + s.turn + s.cast.wK + s.cast.wQ + s.cast.bK + s.cast.bQ + s.ep;
  /* --- AI --- */
  function evalS(s){
    let sc = 0;
    for(let i = 0; i < 64; i++){
      const p = s.b[i]; if(!p) continue;
      const r = i >> 3, c = i & 7, cen = 3.5 - Math.max(Math.abs(r - 3.5), Math.abs(c - 3.5)); let v = V[p[1]];
      if(p[1] === 'N' || p[1] === 'B') v += cen * 8;
      else if(p[1] === 'P') v += (p[0] === 'w' ? 6 - r : r - 1) * 6 + cen * 3;
      else if(p[1] === 'Q') v += cen * 2;
      sc += p[0] === 'w' ? v : -v;
    }
    return s.turn === 'w' ? sc : -sc;
  }
  function order(s, ms){ ms.forEach(m => { m.o = (m.cap ? 10 * V[m.cap[1]] - V[s.b[m.f][1]] / 10 : 0) + (m.promo ? 800 : 0); }); ms.sort((a, b) => b.o - a.o); }
  function nega(s, d, a, b, ply){
    const ms = legal(s);
    if(!ms.length) return inCheck(s, s.turn) ? -99000 + ply : 0;
    if(!d) return evalS(s);
    order(s, ms); let bst = -1e9;
    for(const m of ms){ const v = -nega(apply(s, m), d - 1, -b, -a, ply + 1); if(v > bst){ bst = v; if(v > a) a = v; } if(a >= b) break; }
    return bst;
  }
  function bestMove(s, depth, noise){
    const ms = legal(s); if(!ms.length) return null; order(s, ms);
    let bm = null, bv = -1e9;
    for(const m of ms){ const v = -nega(apply(s, m), depth - 1, -1e9, 1e9, 1) + Math.random() * noise; if(v > bv){ bv = v; bm = m; } }
    return bm;
  }
  const LEVEL = { easy:[1, 70], med:[2, 14], hard:[3, 4] };

  /* --- Giao diện --- */
  let root, G, SAVE = 'spx_chess';
  const PSH = {
  base: '<rect x="10" y="33.500" width="25" height="5" rx="2.500"/>',
  P: '<circle cx="22.500" cy="13.500" r="5.500"/><path d="M15 33.500c.5-7.500 3-12 7.500-13 4.500 1 7 5.500 7.500 13z"/>',
  R: '<path d="M12 9.500h5.500v3.500h3.500V9.500h3v3.500h3.500V9.500H33V18l-3.500 3.500v12h-14v-12L12 18z"/><path d="M15.500 21.500h14" fill="none"/>',
  N: '<path d="M13.500 33.500c-.5-7 1-11.500 6-15-2.500.3-4.800 1.800-7 4L9.500 19l9-10c2.500-2.600 5.500-3.600 8.500-2.800C33 7.800 36.500 14 36 21.500v12z"/><path d="M27 9c3 3 5 7 5 12" fill="none"/><circle cx="24" cy="14.500" r="1.500" fill="#073763" stroke="none"/>',
  B: '<path d="M22.500 6c-2.200 0-3.800 1.600-3.800 3.400 0 1 .5 1.900 1.300 2.500C16 14.800 13.500 19 13.500 24c0 4 1.800 7 4 9.500h10c2.200-2.500 4-5.500 4-9.500 0-5-2.500-9.200-6.500-12.100.8-.6 1.300-1.500 1.300-2.500C26.300 7.600 24.700 6 22.500 6z"/><path d="M22.500 13.500V20M19.500 16.800h6" fill="none"/>',
  Q: '<path d="M9 15l4.500 18.500h18L36 15l-5 6-1.750-11-3.750 9.500-3-11-3 11-3.750-9.500L14 21z"/><circle cx="9" cy="13" r="2.200"/><circle cx="15.750" cy="8.500" r="2.200"/><circle cx="22.500" cy="6.500" r="2.200"/><circle cx="29.250" cy="8.500" r="2.200"/><circle cx="36" cy="13" r="2.200"/>',
  K: '<path d="M20.500 4.500h4v3h3v4h-3V15h-4v-3.500h-3v-4h3z"/><path d="M12.500 33.500c-2-8.500.5-13.500 6-16h8c5.500 2.500 8 7.500 6 16z"/><path d="M17 26h11" fill="none"/>'
};
const pieceSVG = p => `<svg viewBox="0 0 45 45" class="pc"><g fill="${p[0] === 'w' ? '#ffffff' : '#EE4E2C'}" stroke="#073763" stroke-width="1.800" stroke-linejoin="round" stroke-linecap="round">${PSH[p[1]]}${PSH.base}</g></svg>`;
  const img = pieceSVG;
  function newGame(keep){
    const o = keep || {};
    G = { s: initial(), hist: [], mode: o.mode || 'ai', human: o.human || 'w', level: o.level || 'med', flip: false, sel: -1, moves: [], last: null, hint: null, over: null, think: false, keys: [] };
    G.flip = G.mode === 'ai' && G.human === 'b'; G.keys.push(key(G.s));
    refresh(); aiTurn();
  }
  function persist(){ st.set(SAVE, { mode: G.mode, human: G.human, level: G.level, flip: G.flip, moves: G.hist.map(h => [h.m.f, h.m.t, h.m.promo || '']) }); }
  function restore(){
    const sv = st.get(SAVE, null); newGameSilent(sv || {});
    if(sv && sv.moves){ for(const [f, t, pr] of sv.moves){ const m = legal(G.s).find(x => x.f === f && x.t === t && (x.promo || '') === pr); if(!m) break; pushMove(m, true); } G.flip = !!sv.flip; }
    refresh(); aiTurn();
  }
  function newGameSilent(o){ G = { s: initial(), hist: [], mode: o.mode || 'ai', human: o.human || 'w', level: o.level || 'med', flip: false, sel: -1, moves: [], last: null, hint: null, over: null, think: false, keys: [] }; G.flip = G.mode === 'ai' && G.human === 'b'; G.keys.push(key(G.s)); }
  function pushMove(m, quiet){
    const list = legal(G.s), sn = san(G.s, m, list);
    G.hist.push({ before: G.s, m, san: sn });
    G.s = apply(G.s, m); G.last = m; G.sel = -1; G.moves = []; G.hint = null; G.keys.push(key(G.s));
    const ls = legal(G.s);
    if(!ls.length) G.over = inCheck(G.s, G.s.turn) ? (G.s.turn === 'w' ? 'bw' : 'ww') : 'stale';
    else if(G.keys.filter(k => k === G.keys[G.keys.length - 1]).length >= 3) G.over = 'rep';
    else if(G.s.half >= 100) G.over = 'fifty';
    else if(insufficient(G.s.b)) G.over = 'insuf';
    if(G.over && !quiet) X.beep(G.over === 'stale' ? false : true);
  }
  const human = () => G.mode === 'pvp' || G.s.turn === G.human;
  function aiTurn(){
    if(G.over || G.mode !== 'ai' || G.s.turn === G.human || G.think) return;
    G.think = true; status();
    setTimeout(() => {
      const [d, n] = LEVEL[G.level]; const m = bestMove(G.s, d, n);
      G.think = false; if(m){ pushMove(m); persist(); } refresh();
    }, 80);
  }
  function click(sq){
    if(G.over || G.think || !human()) return;
    const p = G.s.b[sq], mv = G.moves.filter(m => m.t === sq);
    if(G.sel >= 0 && mv.length){
      if(mv.length > 1 && mv[0].promo){ promo(mv); return; }
      pushMove(mv[0]); persist(); refresh(); aiTurn(); return;
    }
    if(p && p[0] === G.s.turn){ G.sel = sq; G.moves = legal(G.s).filter(m => m.f === sq); G.hint = null; }
    else { G.sel = -1; G.moves = []; }
    refresh();
  }
  function promo(mv){
    const pr = $('#chPro', root), me = G.s.turn; pr.hidden = false;
    $('div', pr).innerHTML = 'QRBN'.split('').map(k => `<button data-k="${k}">${img(me + k)}</button>`).join('');
    $$('button', pr).forEach(b => b.onclick = () => { pr.hidden = true; pushMove(mv.find(m => m.promo === b.dataset.k)); persist(); refresh(); aiTurn(); });
  }
  function status(){
    const el = $('#chSt', root); let t = '', warn = false;
    if(G.over){ t = { bw:'Chiếu hết! Đen thắng', ww:'Chiếu hết! Trắng thắng', stale:'Hòa cờ (hết nước đi)', rep:'Hòa (lặp lại thế cờ)', fifty:'Hòa (luật 50 nước)', insuf:'Hòa (không đủ lực lượng chiếu hết)' }[G.over]; warn = G.over === 'bw' || G.over === 'ww'; }
    else if(G.think) t = 'Máy đang nghĩ…';
    else if(G.hintTxt) t = 'Gợi ý: ' + G.hintTxt;
    else { t = G.s.turn === 'w' ? 'Lượt Trắng' : 'Lượt Đen'; if(inCheck(G.s, G.s.turn)){ t += ' · Chiếu!'; warn = true; } }
    el.textContent = t; el.classList.toggle('warn', warn);
  }
  function refresh(){
    const bd = $('#chB', root), ck = (!G.over || G.over === 'bw' || G.over === 'ww') && inCheck(G.s, G.s.turn) ? kingSq(G.s.b, G.s.turn) : -1;
    let h = '';
    for(let vr = 0; vr < 8; vr++) for(let vc = 0; vc < 8; vc++){
      const r = G.flip ? 7 - vr : vr, c = G.flip ? 7 - vc : vc, sq = r * 8 + c, p = G.s.b[sq];
      let cls = 'cs ' + ((r + c) % 2 ? 'd' : 'l');
      if(G.last && (sq === G.last.f || sq === G.last.t)) cls += ' lm';
      if(G.sel === sq) cls += ' sl';
      if(sq === ck) cls += ' ck';
      if(G.hint && (sq === G.hint.f || sq === G.hint.t)) cls += ' ht';
      const tg = G.moves.find(m => m.t === sq);
      h += `<div class="${cls}" data-s="${sq}">${vc === 0 ? `<span class="rk">${8 - r}</span>` : ''}${vr === 7 ? `<span class="fl">${FILES[c]}</span>` : ''}${p ? img(p) : ''}${tg ? (p || tg.ep ? '<i class="cp"></i>' : '<i class="mv"></i>') : ''}</div>`;
    }
    bd.innerHTML = h;
    status();
    // quân bị bắt + danh sách nước đi
    const cnt = { P:8, N:2, B:2, R:2, Q:1 }, have = { w:{}, b:{} };
    G.s.b.forEach(p => { if(p) have[p[0]][p[1]] = (have[p[0]][p[1]] || 0) + 1; });
    const lost = c => Object.keys(cnt).flatMap(k => Array(Math.max(0, cnt[k] - (have[c][k] || 0))).fill(c + k)).sort((a, b) => V[b[1]] - V[a[1]]);
    $('#chCapT', root).innerHTML = lost('b').map(img).join(''); $('#chCapB', root).innerHTML = lost('w').map(img).join('');
    const mvs = $('#chMv', root);
    mvs.innerHTML = G.hist.length ? G.hist.map((x, i) => (i % 2 === 0 ? `<b>${(i / 2 | 0) + 1}.</b> ` : '') + x.san + ' ').join('') : 'Chưa có nước đi';
    mvs.scrollTop = mvs.scrollHeight;
    $$('[data-m]', root).forEach(b => b.classList.toggle('on', b.dataset.m === G.mode));
    $$('[data-h]', root).forEach(b => b.classList.toggle('on', b.dataset.h === G.human));
    $$('[data-l]', root).forEach(b => b.classList.toggle('on', b.dataset.l === G.level));
    $('#chSide', root).style.display = $('#chLvl', root).style.display = G.mode === 'ai' ? 'flex' : 'none';
  }
  function undo(){
    if(G.think || !G.hist.length) return;
    let n = G.mode === 'ai' ? 2 : 1; if(G.mode === 'ai' && G.hist.length && G.s.turn !== G.human) n = 1;
    while(n-- > 0 && G.hist.length){ const h = G.hist.pop(); G.s = h.before; G.keys.pop(); }
    G.over = null; G.sel = -1; G.moves = []; G.hint = null; G.hintTxt = ''; G.last = G.hist.length ? G.hist[G.hist.length - 1].m : null;
    persist(); refresh();
  }
  function hint(){
    if(G.over || G.think) return;
    const m = bestMove(G.s, 2, 0); if(!m) return;
    G.hint = m; G.hintTxt = san(G.s, m, legal(G.s)); refresh();
    setTimeout(() => { G.hint = null; G.hintTxt = ''; refresh(); }, 3500);
  }
  function build(){
    root.innerHTML = `
      <div class="gcols"><div class="gL">
        <div class="cstat" id="chSt"></div>
        <div class="cap" id="chCapT"></div>
        <div class="cbw"><div class="cb" id="chB"></div><div class="pro" id="chPro" hidden><span>Phong cấp</span><div></div></div></div>
        <div class="cap" id="chCapB"></div></div>
      <div class="gR"><div class="gcard">
        <div class="opt"><div class="lbl">Chế độ</div><div class="chips"><button class="chip" data-m="ai">Chơi với máy</button><button class="chip" data-m="pvp">2 người</button></div></div>
        <div class="opt" id="chSide"><div class="lbl">Quân của bạn</div><div class="chips"><button class="chip" data-h="w">Trắng</button><button class="chip" data-h="b">Đen</button></div></div>
        <div class="opt" id="chLvl"><div class="lbl">Cấp độ</div><div class="chips"><button class="chip" data-l="easy">Dễ</button><button class="chip" data-l="med">Vừa</button><button class="chip" data-l="hard">Khó</button></div></div>
      </div>
      <div class="gbtns c4">
        <button class="gb" id="chNew">${IC.new}<span>Ván mới</span></button>
        <button class="gb" id="chUndo">${IC.undo}<span>Hoàn tác</span></button>
        <button class="gb" id="chHint">${IC.hint}<span>Gợi ý</span></button>
        <button class="gb" id="chFlip">${IC.flip}<span>Lật bàn</span></button>
      </div>
      <div class="mvs gcard" id="chMv" style="margin-top:9px"></div>
      <div class="gtip">Chạm quân cờ rồi chạm ô đích để đi</div></div></div>`;
    $('#chB', root).addEventListener('click', e => { const c = e.target.closest('.cs'); if(c) click(+c.dataset.s); });
    $$('[data-m]', root).forEach(b => b.onclick = () => { newGame({ mode: b.dataset.m, human: G.human, level: G.level }); persist(); });
    $$('[data-h]', root).forEach(b => b.onclick = () => { newGame({ mode: G.mode, human: b.dataset.h, level: G.level }); persist(); });
    $$('[data-l]', root).forEach(b => b.onclick = () => { G.level = b.dataset.l; persist(); refresh(); });
    $('#chNew', root).onclick = () => { newGame({ mode: G.mode, human: G.human, level: G.level }); persist(); };
    $('#chUndo', root).onclick = undo; $('#chHint', root).onclick = hint;
    $('#chFlip', root).onclick = () => { G.flip = !G.flip; persist(); refresh(); };
  }
  return { mount(el){ root = el; build(); restore(); }, _t:{ initial, fromFEN, legal, apply, perft: function p(s, d){ if(!d) return 1; let n = 0; for(const m of legal(s)) n += p(apply(s, m), d - 1); return n; }, sudoku: () => Sdk } };
})();

/* ======================== KHUNG CHUNG: màn hình chọn game ======================== */
const CSS2 = `
.ghead{font-size:11.5px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin:2px 3px 9px}
.glaunch{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}
.gt{background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:var(--shadow);padding:12px 4px 10px;display:flex;flex-direction:column;align-items:center;gap:8px;font-weight:700;font-size:11.5px;color:var(--text);transition:.2s;animation:up2 .3s ease both}
.gt:active{transform:scale(.93)}
.gt .ic{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;color:#fff;box-shadow:0 5px 12px rgba(7,55,99,.25)}
.gt .ic svg{width:28px;height:28px}
.gt:nth-child(3n+1) .ic{background:linear-gradient(135deg,var(--brand),#ff7a4d)}
.gt:nth-child(3n+2) .ic{background:linear-gradient(135deg,var(--navy),#2a6cb0)}
.gt:nth-child(3n) .ic{background:linear-gradient(135deg,#ff7a4d,#1c5a9a)}
.gtop{display:flex;align-items:center;gap:8px;margin-bottom:9px}
.gback{height:38px;padding:0 13px 0 7px;border-radius:12px;background:var(--card);border:1px solid var(--line);color:var(--navy);font-weight:700;font-size:12px;display:flex;align-items:center;gap:3px;box-shadow:var(--shadow)}
[data-theme="dark"] .gback{color:#fff}
.gback:active{transform:scale(.95)}
.gtitle{flex:1;font-weight:800;font-size:16px}
.gcols{display:block}.gL,.gR{min-width:0}.gR{margin-top:9px}
.sbox{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:4px 12px;min-width:62px;box-shadow:var(--shadow);display:flex;flex-direction:column;align-items:center}
.sbox span{font-size:9.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.4px}
.sbox b{font-size:15px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums}
.bw{position:relative;margin:0 auto;max-width:var(--bs,420px)}
.cv{width:100%;height:auto;display:block;border-radius:12px;touch-action:none;background:#0d2a47;user-select:none;-webkit-user-select:none}
.cvw .gov{border-radius:12px}
.sdw,.mb,.cbw{max-width:var(--bs,420px)}
.cstat.warn{color:var(--err)}
/* 2048 */
.tb{position:relative;aspect-ratio:1;background:#bcd0e6;border-radius:12px;touch-action:none;overflow:hidden;user-select:none;-webkit-user-select:none}
[data-theme="dark"] .tb{background:#14375d}
.tg4{position:absolute;inset:0;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(4,1fr)}
.tg4 i{margin:4px;border-radius:10px;background:rgba(255,255,255,.45)}
[data-theme="dark"] .tg4 i{background:rgba(255,255,255,.08)}
.tile{position:absolute;left:0;top:0;width:25%;height:25%;padding:4px;transition:transform .12s ease;font-size:clamp(20px,7.500vw,34px)}
.tile span{display:grid;place-items:center;width:100%;height:100%;border-radius:10px;font-weight:800;font-size:1em}
.tile.nw span{animation:tpop .2s ease}.tile.mg span{animation:tmg .18s ease}
@keyframes tpop{from{transform:scale(.2);opacity:0}to{transform:none;opacity:1}}
@keyframes tmg{50%{transform:scale(1.18)}}
.t2 span{background:#f1f6fb;color:#073763}.t4 span{background:#dbe8f6;color:#073763}.t8 span{background:#bcd6ef;color:#073763}
.t16 span{background:#8fb8e3;color:#fff}.t32 span{background:#5f98d2;color:#fff}.t64 span{background:#2f72b4;color:#fff}
.t128 span{background:#1c5a9a;color:#fff}.t256 span{background:#073763;color:#fff}.t512 span{background:#ff9a76;color:#fff}
.t1024 span{background:#ff7a4d;color:#fff}.t2048 span{background:#EE4E2C;color:#fff;box-shadow:0 0 14px rgba(238,78,44,.6)}.tbig span{background:#c93a1c;color:#fff}
/* Cờ ca rô */
.crb{display:grid;grid-template-columns:repeat(15,1fr);grid-template-rows:repeat(15,1fr);aspect-ratio:1;background:#eaf1f8;border-radius:10px;overflow:hidden;--ln:#b5c9de;touch-action:manipulation;user-select:none;-webkit-user-select:none}
[data-theme="dark"] .crb{background:#0c2744;--ln:#27507d}
.cc{position:relative;display:grid;place-items:center;min-width:0;min-height:0;background:linear-gradient(var(--ln),var(--ln)) center/100% 1px no-repeat,linear-gradient(var(--ln),var(--ln)) center/1px 100% no-repeat}
.cc.lst{background-color:rgba(238,78,44,.2)}
.cc.win{background-color:rgba(255,209,102,.6);animation:cwin .7s ease-in-out infinite alternate}
.mk{width:80%;height:80%;fill:none;stroke-width:3.200;stroke-linecap:round;animation:mkin .18s ease}
.mk.mx{stroke:var(--navy)}.mk.mo{stroke:var(--brand)}
[data-theme="dark"] .mk.mx{stroke:#8ab4e0}
.mk-x{color:var(--navy);font-weight:800}.mk-o{color:var(--brand);font-weight:800}
[data-theme="dark"] .mk-x{color:#8ab4e0}
@keyframes mkin{from{transform:scale(.3);opacity:0}to{transform:none;opacity:1}}
@keyframes cwin{from{filter:brightness(1)}to{filter:brightness(1.2)}}
/* Cờ vua (thiết kế lại) */
.cs.l{background:#e8f0f8}.cs.d{background:#86a9cc}
[data-theme="dark"] .cs.l{background:#c9d9ea}[data-theme="dark"] .cs.d{background:#5d86b3}
.cs svg.pc{width:90%;height:90%;pointer-events:none;filter:drop-shadow(0 2px 1.500px rgba(7,55,99,.38))}
.cs.l .rk,.cs.l .fl{color:#4a79a8}.cs.d .rk,.cs.d .fl{color:#eaf3fb}
.cs.lm{background:#f9e784!important}.cs.sl{background:#ffd9c9!important;box-shadow:inset 0 0 0 3px #EE4E2C}
.cb{box-shadow:var(--shadow)}
.cap svg{width:20px;height:20px;margin-right:-6px}
.pro button{background:#e8f0f8}.pro svg{width:100%;height:100%}
/* Cờ tướng */
.xqb{width:100%;height:auto;display:block;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.xb{fill:#e8f0f8;stroke:#073763;stroke-width:3}
.xl{fill:none;stroke:#073763;stroke-width:1.600;stroke-linecap:round}
[data-theme="dark"] .xb{fill:#16365a;stroke:#5d86b3}[data-theme="dark"] .xl{stroke:#8fb0d4}
.xr{font-size:19px;font-weight:700;fill:#073763;opacity:.5;text-anchor:middle;font-family:"Montserrat","Noto Serif CJK SC","Noto Serif SC","Songti SC","SimSun","PingFang SC","Microsoft YaHei",serif}
[data-theme="dark"] .xr{fill:#cfe1f3}
.xp{filter:drop-shadow(0 2px 2px rgba(7,55,99,.32))}
.xp .d1{fill:#fff;stroke:#073763;stroke-width:1.600}
.xp.rd .d2{fill:none;stroke:#EE4E2C;stroke-width:1.600}.xp.rd .gl{fill:#EE4E2C}
.xp.bk .d2{fill:none;stroke:#073763;stroke-width:1.600}.xp.bk .gl{fill:#073763}
.xp .gl{font-size:20px;font-weight:800;text-anchor:middle;font-family:"Montserrat","Noto Serif CJK SC","Noto Serif SC","Songti SC","SimSun","PingFang SC","Microsoft YaHei",serif}
.xp.sel .d1{fill:#fff3b0;stroke:#EE4E2C;stroke-width:2.800}
.xmv{fill:rgba(238,78,44,.7)}.xcp{fill:none;stroke:rgba(238,78,44,.85);stroke-width:3.500}
.xlm{fill:rgba(246,238,123,.55);stroke:#e6d84a;stroke-width:1.500}
.xck{fill:rgba(232,53,46,.35);stroke:#e8352e;stroke-width:2}
.xht{fill:none;stroke:#2ea8e6;stroke-width:3;stroke-dasharray:5 3}
/* Xoay ngang (html.ls = đang ở bố cục ngang, kể cả khi app tự xoay) */
html.ls{--bs:max(190px,calc(var(--vh,1vh)*100 - 150px))}
html.ls .gm{max-width:900px}
html.ls .gtop{margin-bottom:5px}html.ls .gback{height:32px}html.ls .gtitle{font-size:14px}html.ls .gbar{margin-bottom:5px}html.ls .gcard{padding:8px}
html.ls .gcols{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start}
html.ls .gR{margin-top:0}
html.ls .glaunch{grid-template-columns:repeat(5,1fr)}
html.ls .gt .ic{width:44px;height:44px}
html.ls .sdw,html.ls .mb,html.ls .cbw,html.ls .bw{margin-left:0}`;
const ORDER = ['sudoku', 'mine', 'chess', 'xiangqi', 'caro', 'g2048', 'jewels', 'domino', 'memory', 'sokoban', 'snake', 'brick', 'gold', 'bird', 'pet'];
const REG = {}, pane = {};
let mounted = false, active = false, cur = null, rootEl;
const isOn = id => active && !document.hidden && cur === id;
function register(def){ REG[def.id] = def; if(mounted) buildLaunch(); }
function buildLaunch(){
  const l = $('#glaunch', rootEl);
  l.innerHTML = ORDER.filter(id => REG[id]).map((id, i) => `<button class="gt" data-g="${id}" style="animation-delay:${i * 35}ms"><span class="ic">${REG[id].icon}</span><span>${REG[id].name}</span></button>`).join('');
  $$('.gt', l).forEach(b => b.onclick = () => open(b.dataset.g));
}
function open(id){
  const d = REG[id]; if(!d) return;
  cur = id; $('#glw', rootEl).hidden = true; $('#gview', rootEl).hidden = false; $('.gtitle', rootEl).textContent = d.name;
  $$('.gpane', rootEl).forEach(p => p.classList.remove('on'));
  let p = pane[id];
  if(!p){ p = pane[id] = document.createElement('div'); p.className = 'gpane'; $('#gbody', rootEl).appendChild(p); d.mount(p); }
  p.classList.add('on'); if(d.show) d.show(); { const sc = document.getElementById('scr'); if(sc) sc.scrollTop = 0; window.scrollTo(0, 0); }
}
function back(){
  const d = REG[cur]; if(d && d.hide) d.hide();
  cur = null; $('#gview', rootEl).hidden = true; $('#glw', rootEl).hidden = false;
}
function mount(root){
  if(mounted) return; mounted = true; rootEl = root;
  const style = document.createElement('style'); style.textContent = CSS + CSS2; document.head.appendChild(style);
  root.innerHTML = `<div class="gm"><div id="glw"><div class="ghead">Chọn trò chơi</div><div class="glaunch" id="glaunch"></div></div>
    <div id="gview" hidden><div class="gtop"><button class="gback" id="gback" type="button">${IC.back}<span>Trò chơi</span></button><div class="gtitle"></div></div><div id="gbody"></div></div></div>`;
  $('#gback', root).onclick = back; buildLaunch();
  setInterval(() => { if(!active || document.hidden) return; if(cur === 'sudoku') Sdk.tick(); else if(cur === 'mine') Mine.tick(); }, 1000);
}
const fit = (cv, LW, LH) => {
  const w = cv.parentElement; w.style.maxWidth = Math.max(170, Math.min(420, (X.vh() - (document.documentElement.classList.contains('ls') ? 150 : 130)) * LW / LH)) + 'px';
  const cssW = w.clientWidth || 300, dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssW * dpr * LH / LW);
  const cx = cv.getContext('2d'); cx.setTransform(cv.width / LW, 0, 0, cv.width / LW, 0, 0); return { cx };
};
const loop = (id, step) => {
  let raf = 0, prev = 0;
  const f = ts => { if(!isOn(id)){ raf = 0; return; } const dt = Math.min(.04, (ts - prev) / 1000); prev = ts; step(dt); raf = requestAnimationFrame(f); };
  const start = () => { if(!raf){ prev = performance.now(); raf = requestAnimationFrame(f); } };
  document.addEventListener('visibilitychange', () => { if(!document.hidden && isOn(id)) start(); });
  return { start, stop(){ cancelAnimationFrame(raf); raf = 0; } };
};
register({ id: 'sudoku', name: 'Sudoku', icon: TAB_IC.sudoku, mount: el => Sdk.mount(el) });
register({ id: 'mine', name: 'Dò mìn', icon: TAB_IC.mine, mount: el => Mine.mount(el) });
register({ id: 'chess', name: 'Cờ vua', icon: TAB_IC.chess, mount: el => Chess.mount(el) });
window.addEventListener('resize', () => { const d = REG[cur]; if(d && d.show && pane[cur]) d.show(); });
window.SPXGames = { mount, register, isOn, setActive(v){ active = v; const d = REG[cur]; if(d){ if(v && d.show) d.show(); else if(!v && d.hide) d.hide(); } },
  u: { $, $$, pad, fmt, rnd, shuffle, best, IC, fit, loop }, _chess: Chess._t };
})();
