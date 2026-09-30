/* ==========================================================================
   THE DIAL: what we find
   The mark is the instrument: a faceted compass card with eight points, each
   one a direction of attack, named on the card itself. Tap it: the card
   turns, settles with one point under the index, and that point turns red.
   ========================================================================== */
const FINDINGS = [
  { key: 'l1', icon: 'hidden' }, { key: 'l2', icon: 'data' }, { key: 'l3', icon: 'setup' }, { key: 'l4', icon: 'agent' },
  { key: 'l5', icon: 'crossed' }, { key: 'l6', icon: 'output' }, { key: 'l7', icon: 'poison' }, { key: 'l8', icon: 'usage' },
].map((f, i) => ({ ...f, deg: i * 45 }));
const dial = (() => {
  const btn = $('#dial'), card = $('#d-card'), hit = $('#d-hit');
  const readout = $('#readout'), degEl = $('#c-deg'), titleEl = $('#c-title'), lineEl = $('#c-line'), exEl = $('#c-ex');
  const list = $('#c-list');
  const pt = (r, deg) => [r * Math.sin(deg * Math.PI / 180), -r * Math.cos(deg * Math.PI / 180)];
  const f2 = n => n.toFixed(2);

  // fixed bezel: fine ticks every 3°, numbers every 45°, and a guilloché of rings behind the card
  let bezel = '';
  for (let deg = 0; deg < 360; deg += 3) {
    const major = deg % 45 === 0, mid = deg % 15 === 0;
    const [x1, y1] = pt(232, deg), [x2, y2] = pt(major ? 218 : mid ? 224 : 228, deg);
    bezel += `<line class="d-tick${major ? ' major' : mid ? ' mid' : ''}" x1="${f2(x1)}" y1="${f2(y1)}" x2="${f2(x2)}" y2="${f2(y2)}"/>`;
    if (major) { const [tx, ty] = pt(206, deg); bezel += `<text class="d-num" x="${f2(tx)}" y="${f2(ty)}">${pad(deg, 3)}</text>`; }
  }
  $('#d-bezel').innerHTML = bezel;
  $('#d-guilloche').innerHTML = Array.from({ length: 34 }, (_, i) => `<circle class="d-guilloche" r="${(18 + i * 4.2).toFixed(1)}"/>`).join('');
  const [ax, ay] = pt(232, -6), [bx, by] = pt(232, 6);
  hit.setAttribute('d', `M${f2(ax)} ${f2(ay)} A232 232 0 0 1 ${f2(bx)} ${f2(by)}`);

  function renderCard() {
    const labels = FINDINGS.map((f, i) => {
      const [sx, sy] = pt(174, f.deg - 21.5), [ex, ey] = pt(174, f.deg + 21.5);
      return `<path id="d-arc-${i}" d="M${f2(sx)} ${f2(sy)} A174 174 0 0 1 ${f2(ex)} ${f2(ey)}" fill="none"/>` +
        `<text class="d-label" data-i="${i}"><textPath href="#d-arc-${i}" startOffset="50%" text-anchor="middle">${t(f.key + '.t')}</textPath></text>`;
    }).join('');
    const points = FINDINGS.map((f, i) =>
      `<g class="d-arrow" data-i="${i}" transform="rotate(${f.deg}) scale(1.5)"><path class="r" d="${HALF_R}"/><path class="l" d="${HALF_L}"/></g>`).join('');
    card.innerHTML = labels + points;
    // every label must fit its own 43° of arc, in any language: tighten the tracking first, then the size
    $$('.d-label', card).forEach(el => {
      const room = $('#d-arc-' + el.dataset.i).getTotalLength() - 4;
      for (const [ls, fs] of [['.14em', 9], ['.08em', 9], ['.04em', 8.5], ['.02em', 8]]) {
        el.style.letterSpacing = ls;
        el.style.fontSize = fs + 'px';
        if (el.getComputedTextLength() <= room) break;
      }
    });
  }
  function renderList() {
    list.innerHTML = FINDINGS.map((f, i) =>
      `<li><button type="button" data-i="${i}" aria-pressed="false">${icon(f.icon)}<span>${t(f.key + '.t')}</span><span class="deg">${pad(f.deg, 3)}°</span></button></li>`).join('');
    $$('button', list).forEach(b => b.addEventListener('click', () => aim(+b.dataset.i, 0)));
  }
  function render() { renderCard(); renderList(); sync(); }

  // rot = rotation of the card. Point i is under the index when rot ≡ -i × 45 (mod 360).
  let current = -1, rot = 22, from = 22, to = 0, start = 0, dur = 1, settledAt = -1e9, spinning = false, settled = false, raf = 0;
  const order = [0, 1, 2, 3, 4, 5, 6, 7].sort(() => Math.random() - 0.5);
  let pos = 0;

  function sync() {
    $$('.d-arrow', card).forEach((el, i) => el.classList.toggle('on', i === current && settled));
    $$('.d-label', card).forEach((el, i) => el.classList.toggle('on', i === current && settled));
    $$('button', list).forEach((b, i) => b.setAttribute('aria-pressed', String(i === current)));
    if (current < 0) return;
    const f = FINDINGS[current];
    titleEl.textContent = settled ? t(f.key + '.t') : t('f.cal');
    lineEl.textContent = t(f.key + '.p');
    exEl.textContent = t(f.key + '.x');
    readout.classList.toggle('calibrating', !settled);
    btn.classList.toggle('found', settled);
  }
  function aim(i, spins) {
    current = i;
    from = rot;
    let target = -FINDINGS[i].deg;
    target -= 360 * Math.ceil((target - rot) / 360);       // turn counter-clockwise, like a card being set
    if (rot - target < 30) target -= 360;
    to = target - 360 * spins;
    dur = reduce.matches ? 0.001 : 1.1 + 0.35 * spins + (from - to) / 1600;
    start = performance.now();
    settled = false;
    spinning = true;
    sync();
    kick();
  }
  const recalibrate = () => aim(order[pos++ % order.length], 1);
  btn.addEventListener('click', recalibrate);
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
  function tick(now) {
    raf = 0;
    let shown = rot;
    if (spinning) {
      const p = clamp01((now - start) / (dur * 1000));
      rot = shown = from + (to - from) * (1 - Math.pow(1 - p, 4));
      if (p >= 1) { spinning = false; settled = true; settledAt = now; sync(); }
    } else {
      const s = (now - settledAt) / 1000;
      shown = rot + (reduce.matches ? 0 : 2.2 * Math.exp(-4.5 * s) * Math.sin(11 * s));
    }
    card.setAttribute('transform', `rotate(${shown.toFixed(2)})`);
    const reading = spinning || current < 0 ? Math.round(((-shown % 360) + 360) % 360) : FINDINGS[current].deg;
    degEl.textContent = `${pad(reading, 3)}°`;
    if (spinning || now - settledAt < 1800) raf = requestAnimationFrame(tick);
  }
  render();
  card.setAttribute('transform', `rotate(${rot})`);
  new IntersectionObserver(([e]) => { if (e.isIntersecting && current < 0) aim(order[pos++], 1); }, { threshold: 0.3 }).observe(btn);
  return { render, recalibrate };
})();
listeners.push(() => dial.render());
