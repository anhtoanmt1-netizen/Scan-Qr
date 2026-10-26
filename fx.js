/* SPX Express – Giao diện động: chủ đề màu · hiệu ứng nền · kiểu thẻ · bo góc · hoạt ảnh · hiệu ứng chạm */
(() => {
'use strict';
const X = window.SPX, S = X.S;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const rnd = n => Math.random() * n;
const hex = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

/* ---------- Từ điển tiếng Anh ---------- */
X.extend({
  'Giao diện động':'Dynamic look','Chủ đề màu':'Color theme','Màu nhấn':'Accent color','Theo chủ đề':'Theme default','Hiệu ứng nền':'Background effect',
  'Kiểu thẻ':'Card style','Bo góc':'Corners','Hoạt ảnh':'Animation','Tắt':'Off','Bong bóng':'Bubbles','Tuyết':'Snow','Đom đóm':'Fireflies','Cực quang':'Aurora','Lưới chuyển động':'Moving grid','Sao đêm':'Starry night',
  'Tự động':'Auto','Mềm':'Soft','Kính mờ':'Glass','Phẳng':'Flat','Nổi':'Raised','Vuông':'Sharp','Vừa':'Medium','Tròn':'Round','Đầy đủ':'Full','Giảm':'Reduced',
  'SPX Classic':'SPX Classic','Cực quang tím':'Aurora','Neon đêm':'Neon night','Đại dương':'Ocean','Hoàng hôn':'Sunset','Rừng xanh':'Forest',
  'Giao diện trò chơi':'Game interface','Thú cưng trên màn hình':'On-screen pet','Mèo':'Cat','Khủng long':'Dinosaur','Nhện':'Spider','Bươm bướm':'Butterfly','Kích thước thú':'Pet size','Nhỏ':'Small','Lớn':'Large',
  'Hiệu ứng chạm (gợn sóng)':'Touch ripple','Bật':'On'
});

/* ---------- CSS ---------- */
const CSS = `
body{background:transparent}
#fxbg{position:fixed;left:0;top:0;width:100%;height:100%;z-index:-1;pointer-events:none}
html.fl #app{background:transparent}
header{background:var(--hg,linear-gradient(135deg,var(--brand),var(--brand3),var(--navy)));background-size:220% 220%}
html:not(.an-low):not(.an-off) header{animation:hgrad 16s ease infinite}
@keyframes hgrad{0%,100%{background-position:0 50%}50%{background-position:100% 50%}}
@supports (-webkit-background-clip:text){
  html:not(.an-off) .brand{background:linear-gradient(100deg,#fff 0,#fff 42%,rgba(255,255,255,.5) 50%,#fff 58%,#fff 100%);background-size:240% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;animation:shine 7s linear infinite}
}
@keyframes shine{0%{background-position:150% 0}100%{background-position:-90% 0}}
@media (hover:hover){.card:hover,.gt:hover{transform:translateY(-2px)}}
.card,.gt,.gcard{transition:transform .25s,box-shadow .25s,background .3s,border-color .3s}
html:not(.an-off) main>*{animation:fup .45s ease both}
@keyframes fup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
html:not(.an-low):not(.an-off) .fab{animation:fabp 2.4s ease-out infinite,fabf 4s ease-in-out infinite}
@keyframes fabf{0%,100%{translate:0 0}50%{translate:0 -4px}}
/* kiểu thẻ */
html.cs-glass .card,html.cs-glass .row,html.cs-glass .gcard,html.cs-glass .gt,html.cs-glass .sbox,html.cs-glass .gback,html.cs-glass .stats .nav button,html.cs-glass .face{background:rgba(var(--card-rgb),.52)!important;-webkit-backdrop-filter:blur(14px) saturate(1.5);backdrop-filter:blur(14px) saturate(1.5);border:1px solid rgba(255,255,255,.4)!important}
html.cs-glass .bar{background:rgba(var(--card-rgb),.7);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
html.cs-flat .card,html.cs-flat .row,html.cs-flat .gcard,html.cs-flat .gt,html.cs-flat .sbox{box-shadow:none!important;border:1.5px solid var(--line)!important}
html.cs-raised .card,html.cs-raised .row,html.cs-raised .gcard,html.cs-raised .gt,html.cs-raised .sbox{box-shadow:0 12px 26px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.45)!important}
/* bo góc */
html[data-rad="0"]{--r:6px;--rb:7px}
html[data-rad="2"]{--r:26px;--rb:20px}
.btn,.gb{border-radius:var(--rb,13px)}
input,select{border-radius:var(--rb,11px)}
/* hoạt ảnh */
html.an-off *,html.an-off *::before,html.an-off *::after{animation:none!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
html.an-low *,html.an-low *::before,html.an-low *::after{animation-iteration-count:1!important}
/* gợn sóng */
.rplh{position:relative;overflow:hidden}
.rpl{position:absolute;border-radius:50%;background:rgba(255,255,255,.55);transform:scale(0);animation:rpl .55s ease-out forwards;pointer-events:none}
@keyframes rpl{to{transform:scale(1);opacity:0}}
/* bảng cài đặt */
.fxd{margin-top:12px;border:1px solid var(--line);border-radius:14px;background:var(--input);overflow:hidden}
.fxd summary{list-style:none;cursor:pointer;min-height:44px;display:flex;align-items:center;gap:8px;padding:0 12px;font-weight:800;font-size:13px;color:var(--text)}
.fxd summary::-webkit-details-marker{display:none}
.fxd summary::after{content:"";margin-left:auto;width:9px;height:9px;border-right:2.5px solid var(--muted);border-bottom:2.5px solid var(--muted);transform:rotate(45deg);transition:transform .25s}
.fxd[open] summary::after{transform:rotate(-135deg)}
.fxb{padding:2px 12px 12px}
.fxl{font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin:10px 0 6px}
.fxs{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
.fxs button{border-radius:13px;border:2px solid var(--line);background:var(--card);padding:6px 4px 5px;font-weight:700;font-size:10.5px;color:var(--text);display:flex;flex-direction:column;align-items:center;gap:5px;transition:.2s}
.fxs button i{display:block;width:100%;height:26px;border-radius:9px}
.fxs button.on{border-color:var(--brand);box-shadow:0 0 0 3px rgba(var(--brand-rgb),.2)}
.fxa{display:flex;gap:9px;flex-wrap:wrap}
.fxa button{width:32px;height:32px;border-radius:50%;border:3px solid var(--card);box-shadow:0 0 0 2px var(--line);font-size:10px;font-weight:800;color:#fff;transition:.2s}
.fxa button.on{box-shadow:0 0 0 3px var(--brand);transform:scale(1.12)}
.fxc{display:flex;gap:6px;flex-wrap:wrap}
.fxc button{min-height:34px;padding:0 12px;border-radius:99px;background:var(--card);border:1px solid var(--line);color:var(--muted);font-weight:700;font-size:11.5px;transition:.2s}
.fxc button.on{background:var(--navy);color:#fff;border-color:var(--navy)}
`;
{ const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); }

/* ---------- Chủ đề màu ---------- */
const SKINS = {
  classic: { n: 'SPX Classic', a: '#EE4E2C', fx: 'off', card: 'soft', g: 'linear-gradient(135deg,#EE4E2C,#073763)' },
  aurora: { n: 'Cực quang tím', a: '#7c5cff', b: '#a08bff', c: '#5a3fd1', navy: '#1b1464', fx: 'aurora', card: 'glass', g: 'linear-gradient(120deg,#7c5cff,#3a86ff,#f72585)',
    hg: 'linear-gradient(120deg,#7c5cff,#3a86ff,#f72585)',
    L: { bg: '#f1eeff', card: '#ffffff', text: '#1b1464', muted: '#6c68a3', line: '#ddd6ff', input: '#f6f3ff' }, D: { bg: '#0d0a24', card: '#1a1540', text: '#ece9ff', muted: '#a39fd6', line: '#35307a', input: '#141033' } },
  neon: { n: 'Neon đêm', a: '#00c8ff', b: '#6ee7ff', c: '#0090b8', navy: '#2b0a6b', fx: 'grid', card: 'glass', g: 'linear-gradient(120deg,#00c8ff,#7a5cff,#ff2bd6)',
    hg: 'linear-gradient(120deg,#00b4e6,#6a4cff,#ff2bd6)',
    L: { bg: '#e8f6ff', card: '#ffffff', text: '#1a1048', muted: '#6a7aa8', line: '#cfe3f5', input: '#f2f9ff' }, D: { bg: '#05060f', card: '#0e1126', text: '#e8f6ff', muted: '#7f93b8', line: '#1d2b55', input: '#0a0d1f' } },
  ocean: { n: 'Đại dương', a: '#0aa5c9', b: '#42c6e6', c: '#06728c', navy: '#04395e', fx: 'bubbles', card: 'glass', g: 'linear-gradient(135deg,#0aa5c9,#04395e)',
    hg: 'linear-gradient(135deg,#0aa5c9,#0a6ea3,#04395e)',
    L: { bg: '#eaf6fb', card: '#ffffff', text: '#04395e', muted: '#5f8aa0', line: '#cfe6f0', input: '#f2fafd' }, D: { bg: '#04202f', card: '#083247', text: '#e6f6fc', muted: '#8bb7cc', line: '#134a63', input: '#052a3b' } },
  sunset: { n: 'Hoàng hôn', a: '#ff6b4a', b: '#ff9a5c', c: '#d6402a', navy: '#5b2a86', fx: 'stars', card: 'soft', g: 'linear-gradient(135deg,#ff6b4a,#ff3d81,#5b2a86)',
    hg: 'linear-gradient(135deg,#ff6b4a,#ff3d81,#5b2a86)',
    L: { bg: '#fff3ec', card: '#ffffff', text: '#3d1d5c', muted: '#8a6a9c', line: '#f6dccd', input: '#fff8f4' }, D: { bg: '#1d0f2b', card: '#2c1742', text: '#fdeee6', muted: '#c4a3d6', line: '#4b2a6b', input: '#24123a' } },
  mint: { n: 'Rừng xanh', a: '#12b886', b: '#38d9a9', c: '#0b8a64', navy: '#0b4f3c', fx: 'fireflies', card: 'soft', g: 'linear-gradient(135deg,#12b886,#0b4f3c)',
    hg: 'linear-gradient(135deg,#12b886,#0b8a64,#0b4f3c)',
    L: { bg: '#edfaf4', card: '#ffffff', text: '#0b4f3c', muted: '#5f8f80', line: '#cdeede', input: '#f4fcf8' }, D: { bg: '#06201a', card: '#0c3328', text: '#e4fbf1', muted: '#86bfae', line: '#14503f', input: '#082a21' } }
};
const ACCENTS = ['#EE4E2C', '#7c5cff', '#00b8d9', '#12b886', '#ff4d8d', '#ffb300'];
const FXN = { off: 'Tắt', bubbles: 'Bong bóng', snow: 'Tuyết', fireflies: 'Đom đóm', aurora: 'Cực quang', grid: 'Lưới chuyển động', stars: 'Sao đêm' };
const VARS = ['--brand', '--brand2', '--brand3', '--brand-rgb', '--navy', '--navy-rgb', '--hg', '--bg', '--card', '--card-rgb', '--text', '--muted', '--line', '--input'];
const dark = () => root.dataset.theme === 'dark';
const effFx = () => S.fx || SKINS[S.skin || 'classic'].fx;
const effCard = () => S.cardStyle || SKINS[S.skin || 'classic'].card;
const anim = () => S.anim || (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'full');

function applySkin(){
  const sk = SKINS[S.skin || 'classic'], st = root.style;
  VARS.forEach(v => st.removeProperty(v));
  const a = S.accent || sk.a;
  if(S.skin && S.skin !== 'classic' || S.accent){
    const b = sk.b && !S.accent ? sk.b : mix(a, '#ffffff', .25), c = sk.c && !S.accent ? sk.c : mix(a, '#000000', .25), navy = sk.navy || '#073763';
    st.setProperty('--brand', a); st.setProperty('--brand2', b); st.setProperty('--brand3', c); st.setProperty('--brand-rgb', hex(a).join(','));
    st.setProperty('--navy', navy); st.setProperty('--navy-rgb', hex(navy).join(','));
    st.setProperty('--hg', S.accent ? `linear-gradient(135deg,${a},${c},${navy})` : (sk.hg || `linear-gradient(135deg,${a},${c},${navy})`));
  }
  if(sk.L){
    const p = dark() ? sk.D : sk.L;
    st.setProperty('--bg', p.bg); st.setProperty('--card', p.card); st.setProperty('--card-rgb', hex(p.card).join(',')); st.setProperty('--text', p.text);
    st.setProperty('--muted', p.muted); st.setProperty('--line', p.line); st.setProperty('--input', p.input);
  }
  const m = document.querySelector('meta[name=theme-color]'); if(m) m.content = a;
  ['soft', 'glass', 'flat', 'raised'].forEach(k => root.classList.toggle('cs-' + k, effCard() === k));
  root.dataset.rad = S.rad === undefined ? '1' : String(S.rad);
  const an = anim(); root.classList.toggle('an-off', an === 'off'); root.classList.toggle('an-low', an === 'low');
}

/* ---------- Hiệu ứng nền (canvas) ---------- */
const cv = document.createElement('canvas'); cv.id = 'fxbg'; document.body.insertBefore(cv, document.body.firstChild);
const cx = cv.getContext('2d'); let W = 0, H = 0, ps = [], cur = '', raf = 0, last = 0, acc = 0;
const E = {
  bubbles: { init: () => Array.from({ length: Math.round(W / 26) }, () => ({ x: rnd(W), y: rnd(H), r: 4 + rnd(20), v: 12 + rnd(30), ph: rnd(6.28) })),
    draw(c, p, dt, col){ p.forEach(b => { b.y -= b.v * dt; b.ph += dt; if(b.y < -40){ b.y = H + 40; b.x = rnd(W); } const x = b.x + Math.sin(b.ph) * 10;
      c.beginPath(); c.arc(x, b.y, b.r, 0, 7); c.fillStyle = `rgba(${col},.08)`; c.fill(); c.strokeStyle = `rgba(${col},.32)`; c.lineWidth = 1.5; c.stroke();
      c.beginPath(); c.arc(x - b.r * .3, b.y - b.r * .3, b.r * .2, 0, 7); c.fillStyle = 'rgba(255,255,255,.4)'; c.fill(); }); } },
  snow: { init: () => Array.from({ length: Math.round(W / 7) }, () => ({ x: rnd(W), y: rnd(H), r: 1.2 + rnd(3), v: 20 + rnd(40), ph: rnd(6.28) })),
    draw(c, p, dt, col){ p.forEach(f => { f.y += f.v * dt; f.ph += dt * 1.2; f.x += Math.sin(f.ph) * 14 * dt; if(f.y > H + 6){ f.y = -6; f.x = rnd(W); } c.beginPath(); c.arc(f.x, f.y, f.r, 0, 7); c.fillStyle = dark() ? 'rgba(255,255,255,.75)' : `rgba(${col},.55)`; c.fill(); }); } },
  fireflies: { init: () => Array.from({ length: Math.round(W / 14) }, () => ({ x: rnd(W), y: rnd(H), a: rnd(6.28), s: 10 + rnd(18), ph: rnd(6.28), r: 1.6 + rnd(2) })),
    draw(c, p, dt, col){ p.forEach(f => { f.a += (Math.random() - .5) * 2.4 * dt; f.x += Math.cos(f.a) * f.s * dt; f.y += Math.sin(f.a) * f.s * dt; f.ph += dt * 2.5; if(f.x < 0) f.x = W; if(f.x > W) f.x = 0; if(f.y < 0) f.y = H; if(f.y > H) f.y = 0;
      const al = .35 + Math.sin(f.ph) * .35, g = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 6); g.addColorStop(0, `rgba(255,214,102,${al})`); g.addColorStop(1, 'rgba(255,214,102,0)'); c.fillStyle = g; c.beginPath(); c.arc(f.x, f.y, f.r * 6, 0, 7); c.fill(); }); } },
  aurora: { init: () => Array.from({ length: 4 }, (_, i) => ({ a: i * 1.6, r: .35 + Math.random() * .2, s: .08 + Math.random() * .08, k: i })),
    draw(c, p, dt, col){ const cols = [col, '58,134,255', '247,37,133', '16,185,129']; c.globalCompositeOperation = dark() ? 'lighter' : 'source-over';
      p.forEach(b => { b.a += b.s * dt; const x = W * (.5 + Math.cos(b.a) * .36), y = H * (.45 + Math.sin(b.a * 1.3) * .3), R = Math.max(W, H) * b.r, g = c.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, `rgba(${cols[b.k % 4]},${dark() ? .3 : .22})`); g.addColorStop(1, `rgba(${cols[b.k % 4]},0)`); c.fillStyle = g; c.fillRect(0, 0, W, H); }); c.globalCompositeOperation = 'source-over'; } },
  grid: { init: () => ({ t: 0 }), draw(c, p, dt, col){ p.t = (p.t + dt * .35) % 1; const hy = H * .6; c.strokeStyle = `rgba(${col},.32)`; c.lineWidth = 1.2;
      for(let i = -12; i <= 12; i++){ c.beginPath(); c.moveTo(W / 2 + i * 8, hy); c.lineTo(W / 2 + i * (W / 8), H); c.stroke(); }
      for(let k = 0; k < 9; k++){ const t = (k + p.t) / 9, y = hy + (H - hy) * t * t; c.globalAlpha = .15 + t * .85; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } c.globalAlpha = 1;
      const g = c.createLinearGradient(0, hy - 60, 0, hy); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(1, `rgba(${col},.18)`); c.fillStyle = g; c.fillRect(0, hy - 60, W, 60); } },
  stars: { init: () => ({ s: Array.from({ length: Math.round(W / 5) }, () => ({ x: rnd(W), y: rnd(H), r: .6 + rnd(1.6), ph: rnd(6.28), v: 1 + rnd(2.5) })), sh: null, t: 3 }),
    draw(c, p, dt, col){ p.s.forEach(s => { s.ph += dt * s.v; c.globalAlpha = .25 + (Math.sin(s.ph) + 1) * .35; c.fillStyle = dark() ? '#fff' : `rgb(${col})`; c.beginPath(); c.arc(s.x, s.y, s.r, 0, 7); c.fill(); }); c.globalAlpha = 1;
      p.t -= dt; if(p.t <= 0 && !p.sh){ p.sh = { x: rnd(W), y: rnd(H * .4), l: 0 }; p.t = 5 + rnd(6); }
      if(p.sh){ const s = p.sh; s.l += dt * 520; const g = c.createLinearGradient(s.x + s.l, s.y + s.l * .5, s.x + s.l - 90, s.y + s.l * .5 - 45); g.addColorStop(0, dark() ? 'rgba(255,255,255,.9)' : `rgba(${col},.9)`); g.addColorStop(1, 'rgba(255,255,255,0)'); c.strokeStyle = g; c.lineWidth = 2;
        c.beginPath(); c.moveTo(s.x + s.l, s.y + s.l * .5); c.lineTo(s.x + s.l - 90, s.y + s.l * .5 - 45); c.stroke(); if(s.l > Math.max(W, H)) p.sh = null; } } }
};
function size(){ const d = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
const busyGame = () => !!(window.SPXGames && SPXGames.cur && ['snake', 'brick', 'gold', 'bird'].includes(SPXGames.cur()));
let lastSz = '';
function fxLoop(ts){
  if(document.hidden || !cur || anim() !== 'full' || busyGame()){ cx.clearRect(0, 0, W, H); raf = 0; return; }
  const dt = Math.min(.05, (ts - last) / 1000); last = ts; acc += dt;
  if(acc < .028){ raf = requestAnimationFrame(fxLoop); return; }
  const d = acc; acc = 0; cx.clearRect(0, 0, W, H);
  const a = (getComputedStyle(root).getPropertyValue('--brand-rgb') || '238,78,44').trim();
  E[cur].draw(cx, ps, d, a); raf = requestAnimationFrame(fxLoop);
}
function applyFx(){
  const f = effFx();
  if(f === 'off' || anim() !== 'full' || busyGame()){ if(f === 'off' || anim() !== 'full') cur = ''; cx.clearRect(0, 0, W, H); return; }
  const sz = innerWidth + 'x' + innerHeight;
  if(cur !== f || sz !== lastSz){ size(); ps = E[f].init(); lastSz = sz; cur = f; }
  if(!raf){ last = performance.now(); raf = requestAnimationFrame(fxLoop); }
}
addEventListener('resize', () => { applyFx(); });
document.addEventListener('visibilitychange', () => { if(!document.hidden && cur && !raf){ last = performance.now(); raf = requestAnimationFrame(fxLoop); } });

/* ---------- Hiệu ứng chạm (gợn sóng) ---------- */
addEventListener('pointerdown', e => {
  if(anim() !== 'full') return; const el = e.target.closest && e.target.closest('.btn,.gb,.chip,.ib,.gt,.face,.scan,.fab,.seg button,.fxc button,.klv button');
  if(!el || el.disabled) return; el.classList.add('rplh'); const r = el.getBoundingClientRect(), sz = Math.max(r.width, r.height) * 2.2, lp = X.local(e, el);
  const i = document.createElement('i'); i.className = 'rpl'; i.style.cssText = `width:${sz}px;height:${sz}px;left:${lp.x - sz / 2}px;top:${lp.y - sz / 2}px`; el.appendChild(i); setTimeout(() => i.remove(), 600);
}, true);

/* ---------- Bảng cài đặt ---------- */
function ui(){
  const host = $('#fxSet'); if(!host) return;
  const sw = Object.entries(SKINS).map(([k, s]) => `<button type="button" data-k="${k}"><i style="background:${s.g}"></i><span>${s.n}</span></button>`).join('');
  const ac = `<button type="button" data-a="" style="background:conic-gradient(#EE4E2C,#7c5cff,#00b8d9,#12b886,#ffb300,#EE4E2C)" title="Theo chủ đề"></button>` + ACCENTS.map(c => `<button type="button" data-a="${c}" style="background:${c}"></button>`).join('');
  const ch = (id, items) => `<div class="fxc" id="${id}">${items.map(([v, t]) => `<button type="button" data-v="${v}">${t}</button>`).join('')}</div>`;
  host.innerHTML = `
    <details class="fxd" open><summary>🎨 Giao diện động</summary><div class="fxb">
      <div class="fxl">Chủ đề màu</div><div class="fxs" id="fxSk">${sw}</div>
      <div class="fxl">Màu nhấn</div><div class="fxa" id="fxAc">${ac}</div>
      <div class="fxl">Hiệu ứng nền</div>${ch('fxFx', Object.entries(FXN))}
      <div class="fxl">Kiểu thẻ</div>${ch('fxCs', [['', 'Tự động'], ['soft', 'Mềm'], ['glass', 'Kính mờ'], ['flat', 'Phẳng'], ['raised', 'Nổi']])}
      <div class="fxl">Bo góc</div>${ch('fxRd', [['0', 'Vuông'], ['1', 'Vừa'], ['2', 'Tròn']])}
      <div class="fxl">Hoạt ảnh</div>${ch('fxAn', [['full', 'Đầy đủ'], ['low', 'Giảm'], ['off', 'Tắt']])}
    </div></details>
    <details class="fxd"><summary>🎮 Giao diện trò chơi</summary><div class="fxb">
      <div class="fxl">Thú cưng trên màn hình</div>${ch('fxPet', [['off', 'Tắt'], ['cat', '🐱 Mèo'], ['dino', '🦖 Khủng long'], ['spider', '🕷️ Nhện'], ['butterfly', '🦋 Bươm bướm']])}
      <div class="fxl">Kích thước thú</div>${ch('fxPs', [['0.8', 'Nhỏ'], ['1', 'Vừa'], ['1.35', 'Lớn']])}
    </div></details>`;
  const save = () => { X.saveS(); sync(); };
  $$('#fxSk button').forEach(b => b.onclick = () => { S.skin = b.dataset.k; S.fx = undefined; S.cardStyle = undefined; S.accent = undefined; save(); });
  $$('#fxAc button').forEach(b => b.onclick = () => { S.accent = b.dataset.a || undefined; save(); });
  $$('#fxFx button').forEach(b => b.onclick = () => { S.fx = b.dataset.v; save(); });
  $$('#fxCs button').forEach(b => b.onclick = () => { S.cardStyle = b.dataset.v || undefined; save(); });
  $$('#fxRd button').forEach(b => b.onclick = () => { S.rad = +b.dataset.v; save(); });
  $$('#fxAn button').forEach(b => b.onclick = () => { S.anim = b.dataset.v; save(); });
  $$('#fxPet button').forEach(b => b.onclick = () => { S.mascot = b.dataset.v; save(); });
  $$('#fxPs button').forEach(b => b.onclick = () => { S.mascotSize = +b.dataset.v; save(); });
}
function sync(){
  const on = (sel, f) => $$(sel + ' button').forEach(b => b.classList.toggle('on', f(b)));
  on('#fxSk', b => b.dataset.k === (S.skin || 'classic')); on('#fxAc', b => (b.dataset.a || '') === (S.accent || ''));
  on('#fxFx', b => b.dataset.v === effFx()); on('#fxCs', b => (b.dataset.v || '') === (S.cardStyle || ''));
  on('#fxRd', b => b.dataset.v === String(S.rad === undefined ? 1 : S.rad)); on('#fxAn', b => b.dataset.v === anim());
  on('#fxPet', b => b.dataset.v === (S.mascot || 'cat')); on('#fxPs', b => +b.dataset.v === (S.mascotSize || 1));
}
function apply(){ applySkin(); applyFx(); sync(); }
ui(); apply();
addEventListener('spx-state', apply);
window.SPXFX = { apply, anim };
})();
