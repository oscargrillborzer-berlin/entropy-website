/* ==========================================================================
   THE MARK: eight arrows, eight directions of attack.
   Flat for small sizes; faceted like a compass rose (lit half, shaded half) when large.
   ========================================================================== */
const ARROW = 'M-6.5 0 L-6.5 -67 L-23 -67 L0 -95 L23 -67 L6.5 -67 L6.5 0Z';
const HALF_L = 'M0 0 L-6.5 0 L-6.5 -67 L-23 -67 L0 -95Z';
const HALF_R = 'M0 0 L0 -95 L23 -67 L6.5 -67 L6.5 0Z';
const flatStar = () => '<svg class="mark" viewBox="-100 -100 200 200" aria-hidden="true">' +
  [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<g><path d="${ARROW}" transform="rotate(${i * 45})"/></g>`).join('') + '</svg>';
$$('[data-mark]').forEach(el => { el.outerHTML = flatStar(); });
// Watermarks are engraved, not printed: hairlines only, like the rose on a banknote.
const engraved = o => {
  const c = a => `rgba(242,243,244,${(o * a).toFixed(3)})`;
  const line = 'fill="none" vector-effect="non-scaling-stroke" stroke-width="1"';
  let ticks = '';
  for (let deg = 0; deg < 360; deg += 5) {
    const r0 = deg % 45 === 0 ? 89 : deg % 15 === 0 ? 92.5 : 94.5, s = Math.sin(deg * Math.PI / 180), q = -Math.cos(deg * Math.PI / 180);
    ticks += `M${(r0 * s).toFixed(2)} ${(r0 * q).toFixed(2)}L${(97 * s).toFixed(2)} ${(97 * q).toFixed(2)}`;
  }
  return `<svg viewBox="-100 -100 200 200" aria-hidden="true">` +
    `<circle r="99.4" ${line} stroke="${c(1)}"/><circle r="97" ${line} stroke="${c(0.7)}"/>` +
    `<path d="${ticks}" ${line} stroke="${c(0.8)}"/>` +
    `<circle r="80" ${line} stroke="${c(0.45)}" stroke-dasharray="1 5"/>` +
    `<circle r="34" ${line} stroke="${c(0.5)}"/>` +
    [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<g transform="rotate(${i * 45}) scale(${i % 2 ? 0.8 : 0.93})">` +
      `<path d="${HALF_L}" fill="${c(0.16)}"/>` +
      `<path d="${ARROW}" ${line} stroke="${c(1)}"/><path d="M0 0V-95" ${line} stroke="${c(0.8)}"/></g>`).join('') +
    `<circle r="7" fill="#08090B" ${line} stroke="${c(1)}"/></svg>`;
};
$$('[data-watermark]').forEach(el => { el.innerHTML = engraved(+el.dataset.watermark); });
