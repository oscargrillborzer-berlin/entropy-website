/* ==========================================================================
   THE BOARD
   An isometric corner of a chessboard with turned pieces, lit from the upper
   left. White is Entropy, black is the client's system; red appears only on
   the weak spot. It plays the end of Philidor's legacy (1. Qg8+ Rxg8
   2. Nf7#), then the fix h7-h6. Everything is a function of T, the game clock;
   the boards redraw only when something changes.
   ========================================================================== */
const MAT = {
  white: {
    side: [[0, '#A9ADB3'], [0.26, '#F7F7F5'], [0.52, '#D9DBDE'], [1, '#6F747B']],
    top: ['#FFFFFF', '#DFE1E4'], flat: { top: '#F2F3F4', left: '#CDD0D4', right: '#8A8F96' }, rim: 'rgba(0,0,0,0.18)',
  },
  black: {
    side: [[0, '#23262B'], [0.26, '#565C64'], [0.52, '#2C3036'], [1, '#0D0F11']],
    top: ['#4B5058', '#2A2E33'], flat: { top: '#484D55', left: '#2B2F35', right: '#15171A' }, rim: 'rgba(242,243,244,0.14)',
  },
  weak: {
    side: [[0, '#3A1714'], [0.26, '#A6453B'], [0.52, '#5E2520'], [1, '#170908']],
    top: ['#B9544A', '#6A2821'], flat: { top: '#A6453B', left: '#6E2A24', right: '#35130F' }, rim: 'rgba(196,73,61,0.55)',
  },
};
// Lathe profiles: [height, radius] from the base up, in board units (a square is 1 × 1).
const sphere = (c, r, n = 7) => Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 2 + (i / n) * Math.PI; return [c + r * Math.sin(a), Math.max(0.004, r * Math.cos(a))]; });
const PROFILES = {
  pawn: [[0, .3], [.06, .3], [.09, .24], [.13, .19], [.32, .11], [.34, .16], [.38, .16], [.4, .1], ...sphere(.52, .13)],
  rook: [[0, .32], [.07, .32], [.1, .27], [.14, .23], [.6, .2], [.62, .25], [.76, .25]],
  queen: [[0, .32], [.07, .32], [.1, .27], [.14, .22], [.64, .12], [.67, .18], [.71, .18], [.74, .13], [.9, .2], [.93, .19], ...sphere(1.01, .06, 5)],
  king: [[0, .33], [.07, .33], [.1, .28], [.14, .23], [.72, .13], [.75, .19], [.79, .19], [.82, .14], [.98, .19], [1.01, .18]],
  knight: [[0, .32], [.07, .32], [.1, .27], [.15, .22], [.19, .22]],
};
const TOP = { pawn: .65, rook: .76, queen: 1.07, king: 1.36, knight: .86 };
// The knight's head: a side profile (forward, up), extruded to a thickness.
const KNIGHT_HEAD = [[-.15, .19], [.14, .19], [.12, .29], [.07, .38], [.23, .5], [.26, .58], [.2, .66], [.08, .74], [.04, .85], [-.02, .77], [-.1, .73], [-.18, .57], [-.19, .38]];
const LEAKS = ['name: J. Weber', 'iban: DE89 3704 0044 …', 'email: j.weber@…', 'api_key: sk-live-…'];
const SQ = n => ({ u: 'efgh'.indexOf(n[0]) + 0.5, v: '5678'.indexOf(n[1]) + 0.5 });
const lerpSq = (a, b, k) => ({ u: mix(a.u, b.u, k), v: mix(a.v, b.v, k) });
const KNIGHT_YAW = Math.atan2(SQ('h8').v - SQ('f7').v, SQ('h8').u - SQ('f7').u);
const YAW_STEP = Math.PI / 36;

/* The story runs on its own clock T.
     4.4 – 5.5   Qe6–g8+   the queen is offered
     6.4 – 7.3   Rxg8      a guard leaves its post to take it
     8.4 – 9.5   Nf7#      smothered mate: the leak, until 12.6
    12.6 – 13.8  the game rewinds to the start
    13.9 – 14.9  gxh6      the fix: the pawn takes the knight
    15.2 – 16.3  Qe6–g8+   the same attack again
    16.8 – 17.8  Kxg8      and it fails: the king takes the queen
    18.0 –       safe, retested
   The first game has its own clock G, which runs backwards during the rewind. */
function stateAt(T, story) {
  const drop = t0 => { const e = ease(seg(T, t0, t0 + 0.7)); return { h: (1 - e) * 0.9, a: e }; };
  const on = story ? 1 : 0;
  const rewind = on * ease(seg(T, 12.6, 13.8));
  const G = story && T > 12.6 ? mix(12.6, 4.0, rewind) : T;
  const leak = on * bump(T, 9.5, 10.0, 12.0, 12.6);
  const fix = on * ease(seg(T, 13.9, 14.9));
  const again = on * ease(seg(T, 15.2, 16.3));
  const kx = on * ease(seg(T, 16.8, 17.8));
  const safe = on * seg(T, 18.0, 18.6);
  const hi = [];
  const mark = (n, a, kind) => { if (a > 0.005) hi.push({ ...SQ(n), a, kind }); };
  if (story) {
    const m1 = bump(T, 4.3, 4.6, 6.2, 7.0), m2 = bump(T, 6.3, 6.6, 8.2, 9.0), m3 = bump(T, 8.3, 8.6, 12.0, 12.6);
    const f1 = bump(T, 13.8, 14.1, 15.1, 15.6), r1 = bump(T, 15.1, 15.4, 16.9, 17.4), k1 = bump(T, 16.7, 17.0, 18.0, 18.5);
    mark('e6', Math.max(m1, r1), 'move'); mark('g8', Math.max(m1, m2, r1, k1), 'move'); mark('f8', m2, 'move');
    mark('h6', m3, 'move'); mark('f7', m3, 'move'); mark('h8', leak, 'weak'); mark('h8', k1, 'move');
    mark('g7', f1, 'fix'); mark('h6', f1, 'fix'); mark('g8', safe, 'ok');
  }
  const k = drop(1.2), r = drop(1.35), p1 = drop(1.5), p2 = drop(1.6), q = drop(2.0), n = drop(2.2);
  const jump = ease(seg(G, 8.4, 9.5));
  const queenAt = story && T > 15 ? lerpSq(SQ('e6'), SQ('g8'), again) : lerpSq(SQ('e6'), SQ('g8'), ease(seg(G, 4.4, 5.5)));
  const pieces = [
    { type: 'king', mat: 'black', weakA: smooth(0.15, 0.7, leak), ...lerpSq(SQ('h8'), SQ('g8'), kx), h: k.h + Math.sin(Math.PI * kx) * 0.3, a: k.a },
    { type: 'rook', mat: 'black', ...lerpSq(SQ('f8'), SQ('g8'), ease(seg(G, 6.4, 7.3))), h: r.h, a: r.a },
    { type: 'pawn', mat: 'black', ...lerpSq(SQ('g7'), SQ('h6'), fix), h: p1.h + Math.sin(Math.PI * fix) * 0.3, a: p1.a },
    { type: 'pawn', mat: 'black', ...SQ('h7'), h: p2.h, a: p2.a },
    { type: 'queen', mat: 'white', ...queenAt, h: q.h, a: q.a * (1 - seg(G, 6.9, 7.6)) * (1 - on * seg(T, 17.4, 17.9)) },
    { type: 'knight', mat: 'white', ...lerpSq(SQ('h6'), SQ('f7'), jump), h: n.h + Math.sin(Math.PI * jump) * 1.1,
      a: n.a * (1 - on * seg(T, 14.5, 15.0)), yaw: mix(KNIGHT_YAW - Math.PI * 0.85, KNIGHT_YAW, jump) },
  ];
  return {
    boardA: ease(seg(T, 0, 0.9)), hi, pieces, leak, safe,
    paths: {
      q1: on * bump(T, 4.2, 4.5, 5.6, 6.2), n1: on * bump(T, 8.2, 8.5, 9.6, 10.2), fx: on * bump(T, 13.7, 14.0, 15.0, 15.5),
      q2: on * bump(T, 15.0, 15.3, 16.4, 17.0), k2: on * bump(T, 16.6, 16.9, 17.9, 18.4),
    },
    tags: { rewind: on * bump(T, 12.55, 12.8, 13.6, 13.9), fix: on * bump(T, 13.9, 14.2, 15.1, 15.5), retest: on * bump(T, 15.1, 15.4, 16.8, 17.3) },
  };
}

function createBoard(cv, opts) {
  const screen = cv.getContext('2d');
  let ctx = screen;                       // the drawing helpers paint into whatever ctx points at
  let W = 1, H = 1, d = 1, S = 80, cx = 0, cy = 0, a = 0, b = 0, k = 0, RX = 1, RY = 1;
  let lastT = -1, dirty = true, animating = false, shownT = null, lastTime = 0;
  let boardLayer = null;
  const sprites = new Map();
  const P = (u, v, h = 0) => [cx + (u + v - 4) * a, cy + (u - v) * b - h * k];

  function resize() {
    d = Math.min(window.devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    cv.width = Math.round(W * d);
    cv.height = Math.round(H * d);
    const above = s => Math.max(1.4 * s + 30, opts.stream ? 1.3 * s + 150 : 0);
    const below = s => 2.2 * s + 16;
    S = Math.max(24, Math.min((W - 40) / 7.1, (H - (opts.stream ? 166 : 46)) / 3.55, opts.max || 120));
    a = S * 0.866;
    b = S * 0.5;
    k = S * 0.96;
    RX = Math.SQRT2 * a;
    RY = Math.SQRT2 * b;
    cx = W / 2;
    cy = (H - above(S) - below(S)) / 2 + above(S);
    sprites.clear();
    boardLayer = null;
    dirty = true;
  }

  function poly(pts, fill, stroke) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }
  const square = (u, v, inset = 0) => [P(u + inset, v + inset), P(u + 1 - inset, v + inset), P(u + 1 - inset, v + 1 - inset), P(u + inset, v + 1 - inset)];

  // Paint something once into its own bitmap. Scrolling then only moves bitmaps around.
  function offscreen(w, h, ox, oy, paint) {
    const c = document.createElement('canvas');
    c.width = Math.ceil(w * d);
    c.height = Math.ceil(h * d);
    if (!c.width || !c.height) return null;
    ctx = c.getContext('2d');
    ctx.setTransform(d, 0, 0, d, ox * d, oy * d);
    ctx.lineWidth = 1;
    paint();
    ctx = screen;
    return c;
  }

  function paintBoard() {
    const pr = Math.min(W / 2, H / 2, 4.2 * a);          // a pool of light under the board
    const pool = ctx.createRadialGradient(cx, cy, 0, cx, cy, pr);
    pool.addColorStop(0, 'rgba(242,243,244,0.05)');
    pool.addColorStop(1, 'rgba(242,243,244,0)');
    ctx.fillStyle = pool;
    ctx.fillRect(0, 0, W, H);
    const tk = 0.26;
    const edgeL = ctx.createLinearGradient(...P(0, 0, 0), ...P(4, 0, -tk));
    edgeL.addColorStop(0, '#202328'); edgeL.addColorStop(1, '#131519');
    poly([P(0, 0, 0), P(4, 0, 0), P(4, 0, -tk), P(0, 0, -tk)], edgeL);
    poly([P(4, 0, 0), P(4, 4, 0), P(4, 4, -tk), P(4, 0, -tk)], '#0D0E11');
    for (let u = 0; u < 4; u++) for (let v = 0; v < 4; v++) poly(square(u, v), (u + v) % 2 === 0 ? '#15171B' : '#272B31');
    const sheen = ctx.createLinearGradient(...P(0, 4), ...P(4, 0));
    sheen.addColorStop(0, 'rgba(255,255,255,0.05)');
    sheen.addColorStop(0.55, 'rgba(255,255,255,0)');
    sheen.addColorStop(1, 'rgba(0,0,0,0.18)');
    poly([P(0, 0), P(4, 0), P(4, 4), P(0, 4)], sheen);
    poly([P(0, 0), P(4, 0), P(4, 4), P(0, 4)], null, 'rgba(242,243,244,0.22)');
    ctx.beginPath(); ctx.moveTo(...P(0, 0)); ctx.lineTo(...P(4, 0)); ctx.lineTo(...P(4, 4));
    ctx.strokeStyle = 'rgba(242,243,244,0.4)'; ctx.stroke();
    ctx.globalAlpha = 0.8;
    ctx.font = `500 9.5px ${MONO}`;
    ctx.fillStyle = 'rgba(242,243,244,0.4)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    'efgh'.split('').forEach((f, i) => { const [x, y] = P(i + 0.5, -0.24, -tk); ctx.fillText(f, x, y + 4); });
    '5678'.split('').forEach((r, i) => { const [x, y] = P(4.24, i + 0.5, -tk); ctx.fillText(r, x, y + 4); });
    ctx.globalAlpha = 1;
  }

  function drawSquares(s, time) {
    for (const h of s.hi) {
      const u = h.u - 0.5, v = h.v - 0.5;
      ctx.globalAlpha = s.boardA * h.a;
      if (h.kind === 'weak') {
        poly(square(u, v), 'rgba(196,73,61,0.2)');
        ctx.globalAlpha = s.boardA * h.a * (reduce.matches ? 1 : 0.75 + 0.25 * Math.sin(time * 3.5));
        ctx.lineWidth = 1.5;
        poly(square(u, v, 0.05), null, '#C4493D');
      } else if (h.kind === 'ok' || h.kind === 'fix') {
        poly(square(u, v), 'rgba(242,243,244,0.08)');
        ctx.lineWidth = 1.5;
        poly(square(u, v, 0.05), null, 'rgba(242,243,244,0.85)');
      } else {
        poly(square(u, v), 'rgba(242,243,244,0.06)');
        poly(square(u, v, 0.05), null, 'rgba(242,243,244,0.3)');
      }
      ctx.lineWidth = 1;
    }
    ctx.globalAlpha = 1;
  }

  function dashed(pts, color, alpha) {
    if (alpha < 0.01) return;
    ctx.globalAlpha = alpha;
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.stroke();
    ctx.setLineDash([]);
    const [x1, y1] = pts[pts.length - 1], [x0, y0] = pts[pts.length - 2];
    const ang = Math.atan2(y1 - y0, x1 - x0);
    ctx.beginPath();
    ctx.moveTo(x1 - 7 * Math.cos(ang - 0.45), y1 - 7 * Math.sin(ang - 0.45));
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 - 7 * Math.cos(ang + 0.45), y1 - 7 * Math.sin(ang + 0.45));
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.globalAlpha = 1;
  }
  const straight = (from, to, reach = 0.88) => { const A = SQ(from), B = SQ(to); return [P(A.u, A.v, 0.02), P(mix(A.u, B.u, reach), mix(A.v, B.v, reach), 0.02)]; };
  function drawPaths(s) {
    const light = 'rgba(242,243,244,0.7)', h6 = SQ('h6'), f7 = SQ('f7'), h8 = SQ('h8');
    dashed(straight('e6', 'g8', 0.9), light, Math.max(s.paths.q1, s.paths.q2));
    const arc = [];
    for (let i = 0; i <= 24; i++) { const q = i / 24; arc.push(P(mix(h6.u, f7.u, q), mix(h6.v, f7.v, q), Math.sin(Math.PI * q) * 1.1 + 0.45)); }
    dashed(arc.slice(0, 22), light, s.paths.n1);
    dashed([P(f7.u + 0.22, f7.v, 0.75), P(h8.u - 0.32, h8.v - 0.12, 0.9)], '#C4493D', s.leak);
    dashed(straight('g7', 'h6', 0.8), 'rgba(242,243,244,0.9)', s.paths.fx);
    dashed(straight('h8', 'g8', 0.75), light, s.paths.k2);
  }

  // One turned segment: the front of the lower circle, the back of the upper one, shaded like a cylinder lit from the left.
  function frustum(u, v, h0, r0, h1, r1, m) {
    const [x0, y0] = P(u, v, h0), [x1, y1] = P(u, v, h1);
    const rx0 = r0 * RX, ry0 = r0 * RY, rx1 = r1 * RX, ry1 = r1 * RY, rm = Math.max(rx0, rx1);
    const g = ctx.createLinearGradient(x0 - rm, 0, x0 + rm, 0);
    m.side.forEach(([o, c]) => g.addColorStop(o, c));
    ctx.beginPath();
    ctx.ellipse(x0, y0, rx0, ry0, 0, Math.PI, 0, true);
    ctx.lineTo(x1 + rx1, y1);
    ctx.ellipse(x1, y1, rx1, ry1, 0, 0, Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = g;
    ctx.fill();
  }
  function cap(u, v, h, r, m) {
    const [x, y] = P(u, v, h);
    const g = ctx.createLinearGradient(x - r * RX, y - r * RY, x + r * RX, y + r * RY);
    g.addColorStop(0, m.top[0]);
    g.addColorStop(1, m.top[1]);
    ctx.beginPath();
    ctx.ellipse(x, y, r * RX, r * RY, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = m.rim;
    ctx.stroke();
  }
  function lathe(u, v, h, prof, m) {
    for (let i = 0; i < prof.length - 1; i++) {
      const [ha, ra] = prof[i], [hb, rb] = prof[i + 1];
      if (hb - ha < 1e-6) { if (rb < ra) cap(u, v, h + ha, ra, m); continue; }   // a ledge: its top face shows
      frustum(u, v, h + ha, ra, h + hb, rb, m);
    }
    const [ht, rt] = prof[prof.length - 1];
    if (rt > 0.01) cap(u, v, h + ht, rt, m);
  }
  function box(u0, v0, u1, v1, h0, h1, f) {
    poly([P(u0, v0, h0), P(u1, v0, h0), P(u1, v0, h1), P(u0, v0, h1)], f.left);
    poly([P(u1, v0, h0), P(u1, v1, h0), P(u1, v1, h1), P(u1, v0, h1)], f.right);
    poly([P(u0, v0, h1), P(u1, v0, h1), P(u1, v1, h1), P(u0, v1, h1)], f.top);
  }
  // The knight's head: extruded profile. Far face, then the sides from far to near, then the near face.
  function knightHead(p, m) {
    const f = [Math.cos(p.yaw), Math.sin(p.yaw)], l = [-f[1], f[0]], th = 0.085;
    const W3 = (x, y, z) => P(p.u + x * f[0] + z * l[0], p.v + x * f[1] + z * l[1], p.h + y);
    const depth = z => z * l[0] - z * l[1];
    const nearZ = depth(th) > depth(-th) ? th : -th, farZ = -nearZ;
    const far = KNIGHT_HEAD.map(([x, y]) => W3(x, y, farZ)), near = KNIGHT_HEAD.map(([x, y]) => W3(x, y, nearZ));
    poly(far, m.flat.right);
    KNIGHT_HEAD.map(([x, y], i) => {
      const j = (i + 1) % KNIGHT_HEAD.length, [x2] = KNIGHT_HEAD[j];
      return { pts: [far[i], far[j], near[j], near[i]], up: x2 - x < 0, dep: (x + x2) / 2 * (f[0] - f[1]) };
    }).sort((s1, s2) => s1.dep - s2.dep).forEach(s => poly(s.pts, s.up ? m.flat.top : m.flat.right, m.rim));
    const g = ctx.createLinearGradient(...W3(0, .85, nearZ), ...W3(0, .2, nearZ));
    g.addColorStop(0, m.flat.top);
    g.addColorStop(1, m.flat.left);
    poly(near, g, m.rim);
    const [ex, ey] = W3(0.1, 0.66, nearZ * 1.02);                 // the eye
    ctx.beginPath();
    ctx.arc(ex, ey, Math.max(1, S * 0.018), 0, Math.PI * 2);
    ctx.fillStyle = m === MAT.white ? '#3A3F46' : '#0A0B0D';
    ctx.fill();
  }
  function paintPiece(p) {
    const m = MAT[p.mat];
    lathe(p.u, p.v, p.h, PROFILES[p.type], m);
    if (p.type === 'king') {
      const c = 0.045, hb = p.h + 1.01;
      box(p.u - 0.13, p.v - c, p.u - c, p.v + c, hb + 0.17, hb + 0.25, m.flat);
      box(p.u - c, p.v - c, p.u + c, p.v + c, hb, hb + 0.36, m.flat);
      box(p.u + c, p.v - c, p.u + 0.13, p.v + c, hb + 0.17, hb + 0.25, m.flat);
    } else if (p.type === 'rook') {
      const [x, y] = P(p.u, p.v, p.h + 0.76);
      ctx.beginPath();
      ctx.ellipse(x, y, 0.17 * RX, 0.17 * RY, 0, 0, Math.PI * 2);
      ctx.fillStyle = m.flat.right;
      ctx.fill();
      const rim = (r, tt) => [x + Math.cos(tt) * r * RX, y + Math.sin(tt) * r * RY];
      const dep = 0.09 * k;
      [0.25, 0.75, 1.25, 1.75].forEach(q => {                         // four crenels in the rim
        const t0 = Math.PI * q, a0 = t0 - 0.2, a1 = t0 + 0.2;
        if (Math.sin(t0) > 0) poly([rim(.25, a0), rim(.25, a1), [rim(.25, a1)[0], rim(.25, a1)[1] + dep], [rim(.25, a0)[0], rim(.25, a0)[1] + dep]], m.flat.right);
        poly([rim(.25, a0), rim(.25, a1), rim(.17, a1), rim(.17, a0)].map(([px, py]) => [px, py + dep]), m.flat.right);
        poly([rim(.25, a0), rim(.25, a1), rim(.17, a1), rim(.17, a0)], m.flat.right);
      });
    } else if (p.type === 'knight') {
      knightHead(p, m);
    }
  }
  // Each piece is painted once per size, material and (for the knight) heading, then reused.
  function sprite(type, mat, yaw = 0) {
    const turn = type === 'knight' ? Math.round(yaw / YAW_STEP) : 0;
    const key = `${type}/${mat}/${turn}`;
    if (sprites.has(key)) return sprites.get(key);
    const w = Math.ceil(S * 1.2), up = Math.ceil(S * 1.9), dn = Math.ceil(S * 0.45);
    const [ox, oy] = P(0, 0, 0);
    const c = offscreen(w, up + dn, w / 2 - ox, up - oy, () => paintPiece({ type, mat, u: 0, v: 0, h: 0, yaw: turn * YAW_STEP }));
    const s = c && { c, w, h: up + dn, ox: w / 2, oy: up };
    sprites.set(key, s);
    return s;
  }
  function drawPiece(p) {
    // soft contact shadow; it stays on the board while the piece is in the air
    const [sx, sy] = P(p.u, p.v, 0);
    const sr = 0.42 * RX * (1 - Math.min(0.5, p.h * 0.3));
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(1, RY / RX);
    const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, sr);
    sh.addColorStop(0, `rgba(0,0,0,${0.55 * clamp01(1 - p.h * 0.6)})`);
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sh;
    ctx.beginPath();
    ctx.arc(0, 0, sr, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const [x, y] = P(p.u, p.v, p.h);
    const put = s => { if (s) ctx.drawImage(s.c, x - s.ox, y - s.oy, s.w, s.h); };
    put(sprite(p.type, p.mat, p.yaw));
    if (p.weakA > 0.005) {                                   // the king turns red where the data leaks
      ctx.globalAlpha = p.a * p.weakA;
      put(sprite(p.type, 'weak'));
      ctx.globalAlpha = p.a;
    }
  }

  function drawTag(x, y0, label, fill, text) {
    ctx.font = `500 9.5px ${MONO}`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0.8px';
    const w = Math.ceil(ctx.measureText(label).width) + 18, h = 21, c = 6;
    const bx = Math.round(x - w / 2) + 0.5, by = Math.round(y0 - 44) + 0.5;
    ctx.strokeStyle = fill;
    ctx.beginPath();
    ctx.moveTo(Math.round(x) + 0.5, y0 - 6);
    ctx.lineTo(Math.round(x) + 0.5, by + h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx, by); ctx.lineTo(bx + w - c, by); ctx.lineTo(bx + w, by + c); ctx.lineTo(bx + w, by + h); ctx.lineTo(bx, by + h);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.fillStyle = text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, by + h / 2 + 0.5);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
  const tagOn = (p, key, fill, text, alpha) => {
    if (alpha < 0.02) return;
    ctx.globalAlpha = alpha;
    const [x, y] = P(p.u, p.v, p.h + TOP[p.type]);
    drawTag(x, y, t(key).toUpperCase(), fill, text);
  };

  function draw(T, time, story) {
    const s = stateAt(T, story);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(d, 0, 0, d, 0, 0);
    ctx.lineWidth = 1;
    if (!boardLayer) boardLayer = offscreen(W, H, 0, 0, paintBoard);
    if (boardLayer) { ctx.globalAlpha = s.boardA; ctx.drawImage(boardLayer, 0, 0, W, H); ctx.globalAlpha = 1; }
    drawSquares(s, time);
    drawPaths(s);
    const list = s.pieces.filter(p => p.a > 0.01).sort((p, q) => (p.u - p.v) - (q.u - q.v));
    for (const p of list) { ctx.globalAlpha = p.a; drawPiece(p); }
    ctx.globalAlpha = 1;
    const [king, , pawn, , queen] = s.pieces;
    if (s.leak > 0.02) {
      tagOn(king, 'tag.leak', '#C4493D', '#FFFFFF', s.leak);
      // the leak, shown literally: records rising out of the king's square
      const [kx, ky] = P(king.u, king.v, king.h + TOP.king);
      const x0 = kx, y0 = ky - 58, p1 = [x0 + 14, y0 - 46], p2 = [x0 - 30, y0 - 96];
      ctx.font = `400 10px ${MONO}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#D0685C';
      const tt = reduce.matches ? 1.3 : time;
      for (let i = 0; i < 4; i++) {
        const q = (tt * 0.1 + i / 4) % 1;
        const x = (1 - q) * (1 - q) * x0 + 2 * (1 - q) * q * p1[0] + q * q * p2[0];
        const y = (1 - q) * (1 - q) * y0 + 2 * (1 - q) * q * p1[1] + q * q * p2[1];
        ctx.globalAlpha = s.leak * smooth(0, 0.15, q) * (1 - q) * 0.9;
        ctx.fillText(LEAKS[i], x, y);
      }
    }
    if (s.tags.rewind > 0.02) {
      ctx.globalAlpha = s.tags.rewind;
      const [x, y] = P(0, 4, 0);
      drawTag(x, y + 4, t('tag.rewind').toUpperCase(), '#3A3F46', '#F2F3F4');
    }
    tagOn(pawn, 'tag.fix', '#F2F3F4', '#08090B', s.tags.fix);
    tagOn(queen, 'tag.retest', '#3A3F46', '#F2F3F4', s.tags.retest * queen.a);
    tagOn(king, 'tag.safe', '#F2F3F4', '#08090B', s.safe);
    ctx.globalAlpha = 1;
    return s.leak > 0.01;
  }

  // The story board eases towards the scroll position, so a notched mouse wheel still plays smoothly.
  function frame(T, time, story) {
    const dt = time - lastTime;
    lastTime = time;
    if (shownT === null || !opts.ease || reduce.matches || dt > 0.25) shownT = T;
    else if (shownT !== T) {
      shownT += (T - shownT) * (1 - Math.exp(-Math.max(0, dt) / 0.075));
      if (Math.abs(T - shownT) < 0.002) shownT = T;
    }
    if (!dirty && !animating && Math.abs(shownT - lastT) < 1e-4) return;
    animating = draw(shownT, time, story) && !reduce.matches;
    lastT = shownT;
    dirty = false;
  }
  return { resize, frame, redraw: () => { dirty = true; }, el: cv, centre: () => ({ x: cx, y: cy, w: 8 * a }) };
}

const heroBoard = createBoard($('#board-hero'), { stream: false, max: 104, ease: false });
const storyBoard = createBoard($('#board-story'), { stream: true, max: 112, ease: true });
listeners.push(() => { heroBoard.redraw(); storyBoard.redraw(); });
