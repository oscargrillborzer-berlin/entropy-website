/* ==========================================================================
   STORY: scroll position -> game clock
   ========================================================================== */
// [scroll progress, game clock]: the clock holds still where there is something to read
const END = 19;
const KEYS = [[0, 4.0], [0.1, 4.3], [0.16, 4.4], [0.31, 7.9], [0.35, 8.3], [0.45, 10.4], [0.52, 12.0], [0.57, 12.6],
              [0.63, 13.8], [0.7, 15.0], [0.78, 16.4], [0.86, 18.0], [0.94, END], [1, END]];
const STEP_AT = [0, 0.14, 0.34, 0.56, 1];
function storyT(p) {
  for (let i = 1; i < KEYS.length; i++) {
    if (p <= KEYS[i][0]) { const [p0, t0] = KEYS[i - 1], [p1, t1] = KEYS[i]; return t0 + (t1 - t0) * (p - p0) / (p1 - p0); }
  }
  return END;
}
const storyEl = $('#how'), heroEl = $('#hero');
const pinH = () => $('.pin', storyEl).getBoundingClientRect().height;
const storyProgress = () => { const r = storyEl.getBoundingClientRect(); return clamp01(-r.top / Math.max(1, r.height - pinH())); };
function scrollToStep(i) {
  const r = storyEl.getBoundingClientRect();
  window.scrollTo({ top: scrollY + r.top + (STEP_AT[i] + 0.04) * (r.height - pinH()), behavior: reduce.matches ? 'auto' : 'smooth' });
}
const stepBtns = $$('#steps button'), stepLis = $$('#steps li'), railBars = $$('.rail b');
stepBtns.forEach(b => b.addEventListener('click', () => scrollToStep(+b.dataset.step)));
let introStart = 0;
const introT = now => (reduce.matches ? 4 : introStart ? Math.min(4, (now - introStart) / 800) : 0);
