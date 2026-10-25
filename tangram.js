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
  { id: 'bigtri', label: 'おおきな さんかく', sol: { big1: [[0,0],[4,0],[2,2]], big2: [[0,0],[2,2],[0,4]] } },
  { id: 'smallsq', label: 'ちいさな しかく', sol: { med: [[0,0],[2,0],[0,2]], small1: [[2,0],[2,2],[1,1]], small2: [[2,2],[0,2],[1,1]] } },
  { id: 'fish', label: 'おさかな', sol: { big1: [[2,0],[2,4],[4,2]], med: [[2,0],[4,2],[4,0]], small1: [[2,1],[2,3],[1,2]] } },
  { id: 'flower', label: 'おはな', sol: { square: [[0,1],[1,0],[2,1],[1,2]], small1: [[0,1],[1,0],[0,-1]], small2: [[1,0],[2,1],[3,0]], para: [[1,2],[2,1],[4,1],[3,2]] } },
  { id: 'boat', label: 'ふね', sol: { big1: [[0,3],[4,3],[2,5]], big2: [[4,3],[2,5],[6,5]], med: [[3,1],[3,3],[1,3]], small1: [[3,1],[3,3],[4,2]] } },
  { id: 'house', label: 'おうち', sol: { big1: [[0,2],[4,2],[2,0]], big2: [[0,2],[4,2],[2,4]], med: [[0,2],[0,4],[2,4]], small1: [[4,2],[4,4],[3,3]], small2: [[4,4],[2,4],[3,3]] } },
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
window.TANGRAM = { get pieces() { return pieces; }, setPiece(id, cx, cy, angle, flip) { pieces[id] = { cx, cy, angle, flip }; render(); }, worldPts, get solution() { return solution; }, checkComplete, pieceCorrect, setTopicById(id) { setTopic(TOPICS.find(t => t.id === id)); } };
})();
