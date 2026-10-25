(() => {
const NS = 'http://www.w3.org/2000/svg';
const U = 56; // 1 unit in px; whole tangram square is 4x4 units = 224px
const HOME = {
  big1:   { name: 'おおきい三角１', color: '#e76f51', pts: [[0,0],[4,0],[2,2]] },
  big2:   { name: 'おおきい三角２', color: '#f4a261', pts: [[0,0],[2,2],[0,4]] },
  med:    { name: 'ちゅうくらい三角', color: '#e9c46a', pts: [[2,4],[4,4],[4,2]] },
  small1: { name: 'ちいさい三角１', color: '#8ab17d', pts: [[2,2],[3,1],[3,3]] },
  small2: { name: 'ちいさい三角２', color: '#2a9d8f', pts: [[0,4],[2,4],[1,3]] },
  square: { name: 'しかく', color: '#4d91bd', pts: [[2,2],[3,3],[2,4],[1,3]] },
  para:   { name: 'へいこうしへんけい', color: '#8c6bb1', pts: [[3,1],[4,0],[4,2],[3,3]] },
};
const ORDER = ['big1','big2','med','small1','small2','square','para'];
const FULL_SOL = {};
ORDER.forEach(id => { FULL_SOL[id] = HOME[id].pts; });
const TOPICS = [
  { id: 'house', label: 'おうち', sol: { big1: [[0,2],[4,2],[2,0]], big2: [[0,2],[4,2],[2,4]], med: [[0,2],[0,4],[2,4]], small1: [[4,2],[4,4],[3,3]], small2: [[4,4],[2,4],[3,3]] } },
  { id: 'kg-page5-80', label: 'ねこ', src: 'page5-80', sol: { square: [[1.0, 1.0], [2.0, 2.0], [1.0, 3.0], [0.0, 2.0]], para: [[5.828, 1.0], [4.828, 0.0], [4.828, 2.0], [5.828, 3.0]], small1: [[1.0, 1.0], [0.0, 0.0], [0.0, 2.0]], small2: [[1.0, 1.0], [2.0, 0.0], [2.0, 2.0]], med: [[4.828, 4.828], [6.243, 3.414], [4.828, 2.0]], big1: [[4.0, 4.0], [0.0, 4.0], [2.0, 2.0]], big2: [[4.828, 4.828], [2.0, 2.0], [4.828, 2.0]] } },
  { id: 'kg-page8-234', label: 'いぬ', src: 'page8-234', sol: { square: [[1.586, 2.414], [1.586, 1.0], [3.0, 1.0], [3.0, 2.414]], para: [[2.0, 0.0], [3.0, 1.0], [1.0, 1.0], [0.0, 0.0]], small1: [[1.586, 5.243], [1.586, 3.828], [0.172, 5.243]], small2: [[6.243, 4.243], [7.243, 5.243], [5.243, 5.243]], med: [[5.828, 3.828], [4.414, 2.414], [3.0, 3.828]], big1: [[7.243, 5.243], [4.414, 2.414], [7.243, 2.414]], big2: [[4.414, 2.414], [1.586, 5.243], [1.586, 2.414]] } },
  { id: 'kg-page7-126', label: 'とり', src: 'page7-126', sol: { square: [[2.828, 1.414], [2.828, 2.828], [1.414, 2.828], [1.414, 1.414]], para: [[4.243, 1.414], [2.828, 1.414], [4.243, 2.828], [5.657, 2.828]], small1: [[2.828, 2.828], [4.243, 2.828], [2.828, 1.414]], small2: [[3.657, 6.243], [2.243, 6.243], [3.657, 4.828]], med: [[0.0, 1.414], [1.414, 0.0], [2.828, 1.414]], big1: [[1.657, 2.828], [5.657, 2.828], [3.657, 4.828]], big2: [[7.657, 4.828], [3.657, 4.828], [5.657, 2.828]] } },
  { id: 'kg-page6-123', label: 'さかな', src: 'page6-123', sol: { square: [[3.414, 0.0], [4.414, 1.0], [3.414, 2.0], [2.414, 1.0]], para: [[1.414, 1.414], [1.414, 0.0], [0.0, 1.414], [0.0, 2.828]], small1: [[2.414, 1.0], [1.414, 0.0], [3.414, 0.0]], small2: [[1.414, 2.828], [1.414, 1.414], [0.0, 2.828]], med: [[0.0, 2.828], [1.414, 4.243], [2.828, 2.828]], big1: [[1.414, 0.0], [4.243, 2.828], [1.414, 2.828]], big2: [[5.414, 0.0], [5.414, 4.0], [3.414, 2.0]] } },
  { id: 'kg-page7-112', label: 'ペンギン', src: 'page7-112', sol: { square: [[2.0, 0.0], [3.0, 1.0], [2.0, 2.0], [1.0, 1.0]], para: [[4.0, 2.0], [5.0, 1.0], [3.0, 1.0], [2.0, 2.0]], small1: [[2.0, 3.319], [2.0, 4.733], [0.586, 3.319]], small2: [[1.0, 1.0], [2.0, 2.0], [0.0, 2.0]], med: [[2.0, 2.0], [4.0, 2.0], [4.0, 4.0]], big1: [[2.0, 6.0], [2.0, 2.0], [4.0, 4.0]], big2: [[1.172, 6.828], [4.0, 4.0], [4.0, 6.828]] } },
  { id: 'kg-page6-31', label: 'ふくろう', src: 'page6-31', sol: { square: [[4.243, 0.0], [5.243, 1.0], [4.243, 2.0], [3.243, 1.0]], para: [[2.828, 4.828], [1.414, 4.828], [2.828, 6.243], [4.243, 6.243]], small1: [[5.657, 2.0], [4.243, 2.0], [5.657, 0.586]], small2: [[2.828, 2.0], [4.243, 2.0], [2.828, 0.586]], med: [[0.0, 6.243], [1.414, 4.828], [2.828, 6.243]], big1: [[5.657, 2.0], [2.828, 4.828], [2.828, 2.0]], big2: [[0.0, 4.828], [2.828, 2.0], [2.828, 4.828]] } },
  { id: 'kg-page5-85', label: 'きつね', src: 'page5-85', sol: { square: [[6.828, 1.0], [7.828, 2.0], [6.828, 3.0], [5.828, 2.0]], para: [[3.0, 2.0], [2.0, 1.0], [2.0, 3.0], [3.0, 4.0]], small1: [[6.828, 1.0], [7.828, 0.0], [7.828, 2.0]], small2: [[6.828, 1.0], [5.828, 2.0], [5.828, 0.0]], med: [[0.0, 1.0], [2.0, 1.0], [2.0, 3.0]], big1: [[7.828, 4.0], [3.828, 4.0], [5.828, 2.0]], big2: [[5.828, 2.0], [3.0, 4.828], [3.0, 2.0]] } },
  { id: 'kg-page3-201', label: 'うさぎ', src: 'page3-201', sol: { square: [[2.811, 1.478], [3.811, 2.478], [2.811, 3.478], [1.811, 2.478]], para: [[1.987, 6.308], [3.401, 6.308], [1.987, 7.723], [0.573, 7.723]], small1: [[1.285, 1.0], [2.285, 0.0], [2.285, 2.0]], small2: [[4.328, 1.012], [3.328, 2.012], [3.328, 0.012]], med: [[4.803, 7.716], [3.389, 6.302], [1.975, 7.716]], big1: [[2.823, 3.484], [5.652, 6.312], [2.823, 6.312]], big2: [[0.0, 6.312], [2.829, 3.484], [2.829, 6.312]] } },
  { id: 'kg-page5-84', label: 'うま', src: 'page5-84', sol: { square: [[5.243, 0.0], [6.243, 1.0], [5.243, 2.0], [4.243, 1.0]], para: [[1.414, 2.414], [1.414, 1.0], [0.0, 2.414], [0.0, 3.828]], small1: [[5.551, 3.0], [4.136, 3.0], [5.551, 4.414]], small2: [[4.136, 3.0], [4.136, 4.414], [2.722, 3.0]], med: [[5.243, 0.0], [7.243, 0.0], [7.243, 2.0]], big1: [[6.243, 3.0], [2.243, 3.0], [4.243, 1.0]], big2: [[4.243, 1.0], [1.414, 3.828], [1.414, 1.0]] } },
  { id: 'kg-page8-21', label: 'らくだ', src: 'page8-21', sol: { square: [[5.657, 1.0], [5.657, 2.414], [4.243, 2.414], [4.243, 1.0]], para: [[0.0, 3.215], [0.0, 1.8], [1.414, 3.215], [1.414, 4.629]], small1: [[3.643, 4.428], [4.643, 3.428], [4.643, 5.428]], small2: [[5.243, 0.0], [6.243, 1.0], [4.243, 1.0]], med: [[0.0, 1.8], [1.414, 0.386], [2.828, 1.8]], big1: [[2.828, 4.629], [0.0, 1.8], [2.828, 1.8]], big2: [[5.657, 2.414], [2.828, 5.243], [2.828, 2.414]] } },
  { id: 'kg-page4-244', label: 'きりん', src: 'page4-244', sol: { square: [[4.432, 3.853], [4.432, 5.267], [3.018, 5.267], [3.018, 3.853]], para: [[3.014, 1.015], [2.014, 0.015], [2.014, 2.015], [3.014, 3.015]], small1: [[0.006, 1.417], [1.42, 1.417], [0.006, 0.003]], small2: [[5.846, 5.267], [5.846, 3.853], [7.26, 5.267]], med: [[0.0, 0.0], [2.0, 0.0], [2.0, 2.0]], big1: [[7.26, 5.267], [4.432, 2.439], [7.26, 2.439]], big2: [[3.018, 1.024], [5.846, 3.853], [3.018, 3.853]] } },
  { id: 'kg-page8-18', label: 'はくちょう', src: 'page8-18', sol: { square: [[1.414, 2.0], [2.414, 3.0], [1.414, 4.0], [0.414, 3.0]], para: [[2.414, 1.0], [1.414, 0.0], [1.414, 2.0], [2.414, 3.0]], small1: [[1.414, 1.414], [1.414, -0.0], [0.0, 1.414]], small2: [[1.414, 4.0], [0.414, 3.0], [0.414, 5.0]], med: [[1.828, 6.414], [0.414, 5.0], [1.828, 3.586]], big1: [[1.828, 3.586], [4.657, 6.414], [1.828, 6.414]], big2: [[1.828, 3.586], [5.828, 3.586], [3.828, 5.586]] } },
  { id: 'kg-page4-155', label: 'へび', src: 'page4-155', sol: { square: [[10.0, 0.0], [11.0, 1.0], [10.0, 2.0], [9.0, 1.0]], para: [[7.0, 1.0], [8.0, 2.0], [6.0, 2.0], [5.0, 1.0]], small1: [[6.0, 0.0], [5.0, 1.0], [7.0, 1.0]], small2: [[7.0, 1.0], [8.0, 0.0], [8.0, 2.0]], med: [[8.0, 2.0], [8.0, 0.0], [10.0, 0.0]], big1: [[4.0, 2.0], [0.0, 2.0], [2.0, 0.0]], big2: [[2.0, 0.0], [6.0, 0.0], [4.0, 2.0]] } },
  { id: 'kg-page5-26', label: 'おはな', src: 'page5-26', sol: { square: [[2.828, 0.0], [3.828, 1.0], [2.828, 2.0], [1.828, 1.0]], para: [[4.243, 0.586], [5.657, 0.586], [4.243, 2.0], [2.828, 2.0]], small1: [[5.657, 2.0], [5.657, 0.586], [4.243, 2.0]], small2: [[0.0, 0.586], [1.414, 0.586], [0.0, 2.0]], med: [[2.828, 2.0], [1.414, 0.586], [0.0, 2.0]], big1: [[2.828, 4.828], [-0.0, 2.0], [2.828, 2.0]], big2: [[5.657, 2.0], [2.828, 4.828], [2.828, 2.0]] } },
  { id: 'kg-page4-180', label: 'ちょうちょ', src: 'page4-180', sol: { square: [[2.828, 2.828], [4.243, 2.828], [4.243, 4.243], [2.828, 4.243]], para: [[2.828, 4.243], [2.828, 2.828], [1.414, 4.243], [1.414, 5.657]], small1: [[4.243, 2.828], [5.657, 2.828], [4.243, 4.243]], small2: [[4.243, 4.243], [4.243, 5.657], [2.828, 4.243]], med: [[2.828, 2.828], [1.414, 4.243], [0.0, 2.828]], big1: [[-0.0, 0.0], [2.828, 2.828], [0.0, 2.828]], big2: [[2.828, 2.828], [5.657, 0.0], [5.657, 2.828]] } },
  { id: 'kg-page3-101', label: 'ロケット', src: 'page3-101', sol: { square: [[2.828, 2.0], [2.828, 3.414], [1.414, 3.414], [1.414, 2.0]], para: [[2.828, 4.828], [4.243, 4.828], [2.828, 3.414], [1.414, 3.414]], small1: [[1.763, 6.4], [0.763, 7.4], [0.763, 5.4]], small2: [[2.527, 6.544], [3.527, 5.544], [3.527, 7.544]], med: [[2.828, 4.828], [1.414, 3.414], [0.0, 4.828]], big1: [[4.086, 2.0], [0.086, 2.0], [2.086, 0.0]], big2: [[0.243, 4.828], [4.243, 4.828], [2.243, 6.828]] } },
  { id: 'square', label: 'しかく', sol: FULL_SOL },
  { id: 'free', label: 'じゆう', sol: null },
];
const START = { x: 188, y: 352 }; // where the assembled home square starts (px)
const TARGET_CENTER = { x: 300, y: 182 };

const svg = document.getElementById('board');
const statusEl = document.getElementById('status');
const bannerEl = document.getElementById('banner');
let topic = TOPICS[0];
let solution = null; // {pieceId: [[px,py],...]} in board coords
let pieces = {};     // id -> {cx, cy, angle, flip}
let selected = null;
let drag = null;

function centroid(pts) {
  let x = 0, y = 0;
  pts.forEach(p => { x += p[0]; y += p[1]; });
  return [x / pts.length, y / pts.length];
}
function localPts(id) { // piece polygon relative to its centroid, in px
  const c = centroid(HOME[id].pts);
  return HOME[id].pts.map(p => [(p[0] - c[0]) * U, (p[1] - c[1]) * U]);
}
function worldPts(id) {
  const st = pieces[id];
  const rad = st.angle * Math.PI / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  return localPts(id).map(([lx, ly]) => {
    const fx = st.flip ? -lx : lx;
    return [st.cx + fx * cos - ly * sin, st.cy + fx * sin + ly * cos];
  });
}
function solutionPolys(t) {
  if (!t.sol) return null;
  const ids = Object.keys(t.sol);
  const polys = {};
  ids.forEach(id => { polys[id] = t.sol[id].map(p => [p[0] * U, p[1] * U]); });
  // center the whole silhouette on TARGET_CENTER
  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
  ids.forEach(id => polys[id].forEach(([x, y]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }));
  const ox = TARGET_CENTER.x - (minX + maxX) / 2, oy = TARGET_CENTER.y - (minY + maxY) / 2;
  ids.forEach(id => { polys[id] = polys[id].map(([x, y]) => [x + ox, y + oy]); });
  return polys;
}
function resetPieces() {
  pieces = {};
  ORDER.forEach(id => {
    const c = centroid(HOME[id].pts);
    pieces[id] = { cx: START.x + c[0] * U, cy: START.y + c[1] * U, angle: 0, flip: false };
  });
  selected = null;
}
function setTopic(t) {
  topic = t;
  solution = solutionPolys(t);
  resetPieces();
  document.querySelectorAll('.chip').forEach(ch => ch.classList.toggle('active', ch.dataset.id === t.id));
  bannerEl.classList.remove('show');
  statusEl.textContent = t.sol ? `グレーの形とぴったり同じ形をつくろう。つかうピースは ${Object.keys(t.sol).length} こだよ。` : '自由につくってみよう。';
  render();
}
function render() {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const bg = document.createElementNS(NS, 'rect');
  bg.setAttribute('width', '600'); bg.setAttribute('height', '600'); bg.setAttribute('fill', '#ffffff');
  svg.appendChild(bg);
  if (solution) {
    Object.keys(solution).forEach(id => {
      const poly = document.createElementNS(NS, 'polygon');
      poly.setAttribute('points', solution[id].map(p => p.join(',')).join(' '));
      poly.setAttribute('class', 'target');
      svg.appendChild(poly);
    });
  }
  ORDER.forEach(id => {
    const poly = document.createElementNS(NS, 'polygon');
    poly.setAttribute('points', worldPts(id).map(p => p.map(v => Math.round(v * 10) / 10).join(',')).join(' '));
    poly.setAttribute('fill', HOME[id].color);
    poly.setAttribute('class', 'piece' + (id === selected ? ' selected' : ''));
    poly.dataset.id = id;
    svg.appendChild(poly);
  });
  updateButtons();
}
function updateButtons() {
  const has = !!selected;
  document.getElementById('rotBtn').disabled = !has;
  document.getElementById('flipBtn').disabled = !has;
  document.getElementById('hintBtn').disabled = !solution;
}
function pointerPos(e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { x: p.x, y: p.y };
}
function snapTargets(excludeId) {
  const pts = [];
  if (solution) Object.keys(solution).forEach(id => solution[id].forEach(p => pts.push(p)));
  ORDER.forEach(id => { if (id !== excludeId) worldPts(id).forEach(p => pts.push(p)); });
  return pts;
}
function trySnap(id) {
  const targets = snapTargets(id);
  const verts = worldPts(id);
  let best = null;
  verts.forEach(v => {
    targets.forEach(t => {
      const dx = t[0] - v[0], dy = t[1] - v[1];
      const d = Math.hypot(dx, dy);
      if (d < 16 && (!best || d < best.d)) best = { dx, dy, d };
    });
  });
  if (best) { pieces[id].cx += best.dx; pieces[id].cy += best.dy; }
}
function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
function distToSeg(x, y, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((x - x1) * dx + (y - y1) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}
function distToPoly(x, y, poly) {
  if (pointInPoly(x, y, poly)) return 0;
  let d = 1e9;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    d = Math.min(d, distToSeg(x, y, poly[j][0], poly[j][1], poly[i][0], poly[i][1]));
  }
  return d;
}
function checkComplete() {
  if (!solution) return;
  const ids = Object.keys(solution);
  const targets = ids.map(id => solution[id]);
  const currents = ids.map(id => worldPts(id));
  let total = 0, covered = 0;
  for (let x = 4; x < 600; x += 8) {
    for (let y = 4; y < 600; y += 8) {
      if (targets.some(poly => pointInPoly(x, y, poly))) {
        total++;
        if (currents.some(poly => pointInPoly(x, y, poly))) covered++;
      }
    }
  }
  let pTotal = 0, pOut = 0;
  currents.forEach(poly => {
    const xs = poly.map(p => p[0]), ys = poly.map(p => p[1]);
    for (let x = Math.min(...xs); x <= Math.max(...xs); x += 8) {
      for (let y = Math.min(...ys); y <= Math.max(...ys); y += 8) {
        if (pointInPoly(x, y, poly)) {
          pTotal++;
          if (!targets.some(t => distToPoly(x, y, t) <= 4)) pOut++;
        }
      }
    }
  });
  const ok = total > 0 && covered / total >= 0.97 && pTotal > 0 && pOut / pTotal <= 0.03;
  bannerEl.classList.toggle('show', ok);
  if (ok) statusEl.textContent = 'やったね！お題の形ができあがったよ。';
}
function pieceCorrect(id) {
  if (!solution) return false;
  const cur = worldPts(id), sol = solution[id];
  return sol.every(sp => cur.some(cp => Math.hypot(cp[0] - sp[0], cp[1] - sp[1]) < 5));
}
svg.addEventListener('pointerdown', e => {
  const t = e.target.closest('.piece');
  if (!t) { selected = null; render(); return; }
  selected = t.dataset.id;
  const p = pointerPos(e);
  const st = pieces[selected];
  drag = { id: selected, dx: p.x - st.cx, dy: p.y - st.cy };
  svg.setPointerCapture(e.pointerId);
  render();
  e.preventDefault();
});
svg.addEventListener('pointermove', e => {
  if (!drag) return;
  const p = pointerPos(e);
  pieces[drag.id].cx = Math.max(-40, Math.min(640, p.x - drag.dx));
  pieces[drag.id].cy = Math.max(-40, Math.min(640, p.y - drag.dy));
  render();
});
function endDrag() {
  if (!drag) return;
  trySnap(drag.id);
  drag = null;
  render();
  checkComplete();
}
svg.addEventListener('pointerup', endDrag);
svg.addEventListener('pointercancel', endDrag);
svg.addEventListener('dblclick', e => {
  const t = e.target.closest('.piece');
  if (!t) return;
  selected = t.dataset.id;
  rotateSelected();
});
function rotateSelected() {
  if (!selected) return;
  pieces[selected].angle = (pieces[selected].angle + 45) % 360;
  trySnap(selected);
  render();
  checkComplete();
}
document.getElementById('rotBtn').onclick = rotateSelected;
document.getElementById('flipBtn').onclick = () => {
  if (!selected) return;
  pieces[selected].flip = !pieces[selected].flip;
  trySnap(selected);
  render();
  checkComplete();
};
document.getElementById('resetBtn').onclick = () => { setTopic(topic); };
document.getElementById('hintBtn').onclick = () => {
  if (!solution) return;
  const id = Object.keys(solution).find(x => !pieceCorrect(x));
  if (!id) { statusEl.textContent = 'ぜんぶ合っているよ！'; return; }
  const poly = document.createElementNS(NS, 'polygon');
  poly.setAttribute('points', solution[id].map(p => p.join(',')).join(' '));
  poly.setAttribute('class', 'hintflash');
  svg.appendChild(poly);
  statusEl.textContent = 'ヒント：光った場所に合うピースを探してみよう。';
  setTimeout(() => { poly.remove(); }, 1600);
};
const chips = document.getElementById('chips');
TOPICS.forEach(t => {
  const b = document.createElement('button');
  b.className = 'chip' + (t === topic ? ' active' : '');
  b.dataset.id = t.id;
  b.textContent = t.label;
  b.onclick = () => setTopic(t);
  chips.appendChild(b);
});
setTopic(TOPICS[0]);
window.TANGRAM = { get pieces() { return pieces; }, setPiece(id, cx, cy, angle, flip) { pieces[id] = { cx, cy, angle, flip }; render(); }, worldPts, get solution() { return solution; }, checkComplete, pieceCorrect, setTopicById(id) { setTopic(TOPICS.find(t => t.id === id)); }, topics: TOPICS.map(t => t.id) };
})();
