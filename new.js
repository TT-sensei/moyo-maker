(() => {
'use strict';
const NS = 'http://www.w3.org/2000/svg';
const E = 48;                       // shared edge length for all tiling pieces
const H = E * Math.sqrt(3) / 2;     // 41.57 triangle height
const R = E / Math.sqrt(3);         // 27.71 triangle circumradius

// All tiling pieces share edge length E, so edges meet exactly.
// Local coordinates are vertex-average centered.
const DEFS = [
  { id: 'hex',   name: '六角形',   kind: 'tile', color: '#f2c230',
    pts: [[E,0],[E/2,H],[-E/2,H],[-E,0],[-E/2,-H],[E/2,-H]] },
  { id: 'trap',  name: '台形',     kind: 'tile', color: '#e4572e',
    pts: [[-E,H/2],[E,H/2],[E/2,-H/2],[-E/2,-H/2]] },
  { id: 'tri',   name: '正三角形', kind: 'tile', color: '#43a95c',
    pts: [[0,-R],[E/2,R/2],[-E/2,R/2]] },
  { id: 'rhom',  name: 'ひし形',   kind: 'tile', color: '#3d7bd6',
    pts: [[E * Math.sqrt(3) / 2, 0], [0, E / 2], [-E * Math.sqrt(3) / 2, 0], [0, -E / 2]] },
  { id: 'square',name: '正方形',   kind: 'tile', color: '#f39c2c',
    pts: [[E/2,E/2],[-E/2,E/2],[-E/2,-E/2],[E/2,-E/2]] },
  { id: 'circle', name: '円',   kind: 'deco', color: '#d979a5', circle: 26 },
  { id: 'star',   name: '星',   kind: 'deco', color: '#f2b134',
    path: 'M0 -40L10 -13L38 -13L16 4L24 32L0 16L-24 32L-16 4L-38 -13L-10 -13Z' },
  { id: 'heart',  name: 'ハート', kind: 'deco', color: '#e76f51',
    path: 'M0 31C-8 22 -36 3 -34 -14C-32 -35 -7 -35 0 -17C8 -35 32 -35 34 -14C36 3 8 22 0 31Z' }
];
const COLORS = ['#e76f51','#f4a261','#e9c46a','#8ab17d','#2a9d8f','#4d91bd','#5969a8','#8c6bb1','#d979a5','#55463f','#202d35','#ffffff'];

let objects = [], selected = null, pendingColor = null, gridOn = true, snapOn = true;
let history = [], future = [], drag = null, toastTimer = null;

const $ = id => document.getElementById(id);
const canvas = $('canvas');
const defOf = o => DEFS.find(d => d.id === o.shape);
const chosen = () => objects.find(o => o.id === selected) || null;

function say(msg) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}
function uid() { return crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()); }

/* ---------- geometry ---------- */
function rotPt(p, deg) {
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
}
function worldVerts(o) {
  const d = defOf(o);
  if (!d.pts) return [[o.x, o.y]];
  return d.pts.map(p => { const q = rotPt(p, o.angle); return [q[0] + o.x, q[1] + o.y]; });
}
// anchor points for snapping: fine triangular lattice (spacing E/2),
// the same lattice shifted half a step (trapezoid corners live there),
// and a square grid (spacing E/2) for square corners / point-up hexagons.
const BOARD_POINTS = (() => {
  const pts = [], seen = new Set();
  const add = (x, y) => {
    if (x < -30 || x > 630 || y < -30 || y > 630) return;
    const k = Math.round(x * 10) + ':' + Math.round(y * 10);
    if (!seen.has(k)) { seen.add(k); pts.push([x, y]); }
  };
  for (let j = -16; j <= 16; j++) {
    const y = 300 + j * (H / 2), off = (Math.abs(j) % 2) * (E / 4);
    for (let i = -14; i <= 14; i++) {
      add(300 + i * (E / 2) + off, y);
      add(300 + i * (E / 2) + off + E / 4, y);
    }
  }
  for (let i = -13; i <= 13; i++) for (let j = -13; j <= 13; j++) add(300 + i * (E / 2), 300 + j * (E / 2));
  return pts;
})();
function doSnap(o) {
  if (!snapOn) return false;
  const mine = worldVerts(o);
  // pieces first (flush with a neighbour beats the background grid)
  const pieceTargets = [];
  for (const other of objects) if (other.id !== o.id) pieceTargets.push(...worldVerts(other));
  let best = null, bestD = 18;
  for (const v of mine) for (const t of pieceTargets) {
    const dx = t[0] - v[0], dy = t[1] - v[1], d = Math.hypot(dx, dy);
    if (d < bestD) { bestD = d; best = [dx, dy]; }
  }
  if (!best) {
    bestD = 13;
    for (const v of mine) for (const t of BOARD_POINTS) {
      const dx = t[0] - v[0], dy = t[1] - v[1], d = Math.hypot(dx, dy);
      if (d < bestD) { bestD = d; best = [dx, dy]; }
    }
  }
  if (best) { o.x += best[0]; o.y += best[1]; return true; }
  return false;
}

/* ---------- history ---------- */
function snapshot() { return JSON.stringify(objects); }
function pushHistory() { history.push(snapshot()); if (history.length > 60) history.shift(); future = []; refreshEditButtons(); }
function restore(json) { objects = JSON.parse(json); if (!chosen()) selected = null; render(); refreshEditButtons(); }
function refreshEditButtons() { $('undoBtn').disabled = !history.length; $('redoBtn').disabled = !future.length; }

/* ---------- rendering ---------- */
function shapeEl(o, outline) {
  const d = defOf(o);
  let el;
  if (d.circle) { el = document.createElementNS(NS, 'circle'); el.setAttribute('r', d.circle); }
  else if (d.path) { el = document.createElementNS(NS, 'path'); el.setAttribute('d', d.path); }
  else { el = document.createElementNS(NS, 'polygon'); el.setAttribute('points', d.pts.map(p => p.join(',')).join(' ')); }
  if (outline) { el.setAttribute('class', 'sel-outline'); }
  else { el.setAttribute('fill', o.fill); el.setAttribute('stroke', '#263238'); el.setAttribute('stroke-opacity', '.22'); el.setAttribute('stroke-width', '1.5'); }
  return el;
}
function ensureDefs() {
  if (canvas.querySelector('defs')) return;
  const defs = document.createElementNS(NS, 'defs');
  const pat = document.createElementNS(NS, 'pattern');
  pat.setAttribute('id', 'dots'); pat.setAttribute('width', E / 2); pat.setAttribute('height', H);
  pat.setAttribute('patternUnits', 'userSpaceOnUse');
  // offset the tile so printed dots sit exactly on the snap lattice (anchored at board center 300,300)
  pat.setAttribute('x', 300 % (E / 2)); pat.setAttribute('y', 300 % H);
  [[0,0],[E/2,0],[0,H],[E/2,H],[E/4,H/2]].forEach(([cx, cy]) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', 2); c.setAttribute('fill', '#bcc7bf');
    pat.appendChild(c);
  });
  defs.appendChild(pat); canvas.appendChild(defs);
  const bg = document.createElementNS(NS, 'rect');
  bg.setAttribute('id', 'gridBg'); bg.setAttribute('width', 600); bg.setAttribute('height', 600);
  bg.setAttribute('fill', 'url(#dots)'); canvas.appendChild(bg);
}
function render() {
  ensureDefs();
  canvas.querySelectorAll('.obj').forEach(n => n.remove());
  $('gridBg').style.display = gridOn ? '' : 'none';
  for (const o of objects) {
    const g = document.createElementNS(NS, 'g');
    g.classList.add('obj'); g.dataset.id = o.id;
    g.setAttribute('transform', `translate(${o.x} ${o.y}) rotate(${o.angle})`);
    g.appendChild(shapeEl(o, false));
    if (o.id === selected) g.appendChild(shapeEl(o, true));
    canvas.appendChild(g);
  }
  $('count').textContent = '図形 ' + objects.length + 'こ';
  const o = chosen();
  $('quickbar').classList.toggle('show', !!o);
  if (o) {
    $('qLock').textContent = o.locked ? '🔓 ロックを外す' : '🔒 ロック';
    $('status').textContent = defOf(o).name + 'を えらんでいるよ。ドラッグで動かせるよ。';
  } else {
    $('status').textContent = objects.length ? 'ピースをタップすると、動かしたり回したりできるよ。' : '「図形・色」から、すきな図形をタップしてね。';
  }
}

/* ---------- operations ---------- */
let cascade = 0;
function addShape(shapeId) {
  const d = DEFS.find(x => x.id === shapeId);
  const off = (cascade % 6) * 14; cascade++;
  const o = { id: uid(), shape: shapeId, x: 300 + off - 35, y: 300 + off - 35, angle: 0, fill: pendingColor || d.color, locked: false };
  objects.push(o); selected = o.id;
  doSnap(o); render(); pushHistory();
}
function rotateSelected(deg) {
  const o = chosen(); if (!o) return;
  if (o.locked) { say('ロック中だよ。解除してから動かしてね'); return; }
  o.angle = ((o.angle + deg) % 360 + 360) % 360;
  doSnap(o); render(); pushHistory();
}
function deleteSelected() {
  const o = chosen(); if (!o) return;
  if (o.locked) { say('ロック中だよ。解除してから消してね'); return; }
  objects = objects.filter(x => x.id !== o.id); selected = null; render(); pushHistory();
}

/* ---------- pointer ---------- */
function pointerPos(evt) {
  const pt = new DOMPoint(evt.clientX, evt.clientY);
  const m = canvas.getScreenCTM();
  if (!m) return { x: 0, y: 0 };
  const p = pt.matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}
canvas.addEventListener('pointerdown', e => {
  const g = e.target.closest('.obj');
  if (!g) { selected = null; render(); return; }
  const o = objects.find(x => x.id === g.dataset.id);
  if (!o) return;
  selected = o.id; render();
  if (o.locked) { say('ロック中だよ。動かすときは解除してね'); return; }
  const pos = pointerPos(e);
  drag = { id: o.id, dx: pos.x - o.x, dy: pos.y - o.y, moved: false };
  g.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (!drag) return;
  const o = objects.find(x => x.id === drag.id); if (!o) return;
  const pos = pointerPos(e);
  o.x = Math.max(-70, Math.min(670, pos.x - drag.dx));
  o.y = Math.max(-70, Math.min(670, pos.y - drag.dy));
  drag.moved = true; render();
});
canvas.addEventListener('pointerup', () => {
  if (!drag) return;
  const o = objects.find(x => x.id === drag.id);
  if (o && drag.moved) { doSnap(o); render(); pushHistory(); }
  drag = null;
});
canvas.addEventListener('dblclick', e => {
  const g = e.target.closest('.obj'); if (!g) return;
  if (g.dataset.id !== selected) { selected = g.dataset.id; }
  rotateSelected(30);
});

/* ---------- drawers ---------- */
function closeDrawers() { ['paletteDrawer','toolsDrawer'].forEach(id => $(id).classList.remove('drawer-open')); $('drawerBackdrop').hidden = true; }
function openDrawer(which) {
  const id = which === 'palette' ? 'paletteDrawer' : 'toolsDrawer';
  const other = which === 'palette' ? 'toolsDrawer' : 'paletteDrawer';
  $(other).classList.remove('drawer-open'); $(id).classList.add('drawer-open'); $('drawerBackdrop').hidden = false;
}
$('paletteToggle').onclick = () => $('paletteDrawer').classList.contains('drawer-open') ? closeDrawers() : openDrawer('palette');
$('toolsToggle').onclick = () => $('toolsDrawer').classList.contains('drawer-open') ? closeDrawers() : openDrawer('tools');
$('drawerBackdrop').onclick = closeDrawers;

/* ---------- palette ---------- */
function previewSVG(d) {
  const inner = d.circle ? `<circle r="${d.circle}" fill="${d.color}"/>`
    : d.path ? `<path d="${d.path}" fill="${d.color}"/>`
    : `<polygon points="${d.pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')}" fill="${d.color}"/>`;
  return `<svg viewBox="-50 -50 100 100">${inner}</svg>`;
}
for (const d of DEFS) {
  const b = document.createElement('button');
  b.className = 'shape-btn'; b.innerHTML = previewSVG(d) + '<span>' + d.name + '</span>';
  b.onclick = () => { addShape(d.id); closeDrawers(); };
  $(d.kind === 'tile' ? 'tileGrid' : 'decoGrid').appendChild(b);
}
COLORS.forEach((c, i) => {
  const b = document.createElement('button');
  b.className = 'swatch'; b.style.background = c; b.setAttribute('aria-label', '色 ' + (i + 1));
  b.onclick = () => {
    document.querySelectorAll('.swatch').forEach(x => x.classList.remove('active')); b.classList.add('active');
    const o = chosen();
    if (o) {
      if (o.locked) { say('ロック中だよ。解除してから色を変えてね'); return; }
      o.fill = c; pendingColor = c; render(); pushHistory();
    } else pendingColor = c;
  };
  $('swatches').appendChild(b);
});

/* ---------- buttons ---------- */
$('qRotL').onclick = () => rotateSelected(-30);
$('qRotR').onclick = () => rotateSelected(30);
$('qDup').onclick = () => {
  const o = chosen(); if (!o) return;
  const n = { ...o, id: uid(), x: o.x + 24, y: o.y + 24, locked: false };
  objects.push(n); selected = n.id; doSnap(n); render(); pushHistory();
};
$('qLock').onclick = () => { const o = chosen(); if (!o) return; o.locked = !o.locked; render(); say(o.locked ? 'ロックしたよ' : 'ロックを外したよ'); };
$('qDel').onclick = deleteSelected;
$('undoBtn').onclick = () => { if (!history.length) return; future.push(snapshot()); restore(history.pop()); };
$('redoBtn').onclick = () => { if (!future.length) return; history.push(snapshot()); restore(future.pop()); };
$('mirrorBtn').onclick = () => {
  const o = chosen(); if (!o) { say('先に図形をえらんでね'); return; }
  const n = { ...o, id: uid(), x: 600 - o.x, angle: ((360 - o.angle) % 360), locked: false };
  objects.push(n); selected = n.id; doSnap(n); render(); pushHistory(); say('左右にコピーしたよ');
};
$('radialBtn').onclick = () => {
  const o = chosen(); if (!o) { say('先に図形をえらんでね'); return; }
  for (let k = 1; k < 6; k++) {
    const c = rotPt([o.x - 300, o.y - 300], 60 * k);
    objects.push({ ...o, id: uid(), x: 300 + c[0], y: 300 + c[1], angle: (o.angle + 60 * k) % 360, locked: false });
  }
  render(); pushHistory(); say('回転コピーしたよ');
};
$('frontBtn').onclick = () => { const o = chosen(); if (!o) return; objects = objects.filter(x => x.id !== o.id); objects.push(o); render(); pushHistory(); };
$('backBtn').onclick = () => { const o = chosen(); if (!o) return; objects = objects.filter(x => x.id !== o.id); objects.unshift(o); render(); pushHistory(); };
$('gridBtn').onclick = () => { gridOn = !gridOn; $('gridBtn').textContent = gridOn ? '格子：ドット' : '格子：なし'; $('gridBtn').classList.toggle('active', gridOn); render(); };
$('snapBtn').onclick = () => { snapOn = !snapOn; $('snapBtn').textContent = snapOn ? 'ぴたっと：ON' : 'ぴたっと：OFF'; say(snapOn ? 'ぴたっと吸着をオンにしたよ' : 'ぴたっと吸着をオフにしたよ。自由に置けるよ'); };
$('clearBtn').onclick = () => { if (!objects.length) return; objects = []; selected = null; render(); pushHistory(); say('ぜんぶ消したよ'); closeDrawers(); };
$('newBtn').onclick = () => { objects = []; selected = null; history = []; future = []; render(); refreshEditButtons(); say('新しく始めるよ'); };
$('saveBtn').onclick = () => {
  const clone = canvas.cloneNode(true);
  clone.setAttribute('xmlns', NS);
  clone.querySelectorAll('.sel-outline').forEach(n => n.remove());
  const bgWhite = document.createElementNS(NS, 'rect');
  bgWhite.setAttribute('width', 600); bgWhite.setAttribute('height', 600); bgWhite.setAttribute('fill', '#ffffff');
  clone.insertBefore(bgWhite, clone.children[1] || null);
  const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'もよう工房-作品.svg'; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  say('作品を画像として保存したよ');
};

render(); refreshEditButtons();
window.MOYO = { get objects() { return objects; }, addShape, worldVerts, doSnap, DEFS, BOARD_POINTS,
  get snapOn() { return snapOn; }, setSnap(v) { snapOn = v; },
  setObj(id, x, y, angle) { const o = objects.find(v => v.id === id); if (o) { o.x = x; o.y = y; o.angle = angle; render(); } },
  clear() { objects = []; selected = null; render(); } };
})();
