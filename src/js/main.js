/* ==========================================================================
   LOOP: one requestAnimationFrame for the page. Boards draw only on change.
   ========================================================================== */
const inView = el => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
function frame(now) {
  requestAnimationFrame(frame);
  const p = storyProgress();
  const sr = storyEl.getBoundingClientRect();
  updateUI(p, sr.top <= 1 && sr.bottom >= innerHeight * 0.5);
  if (inView(heroEl)) heroBoard.frame(introT(now), now / 1000, false);
  if (inView(storyEl)) storyBoard.frame(storyT(p), now / 1000, true);
}

console.log('%cEntropy', 'font:600 14px "Host Grotesk",sans-serif;color:#F2F3F4');
console.log('%cThis page made 0 requests to other servers. Check the Network tab.\nEight arrows, eight directions of attack. We test all of them.\nYou read the console. We should talk.',
  'font:12px/1.6 "JetBrains Mono",monospace;color:#8F959C');

/* ==========================================================================
   BOOT
   ========================================================================== */
let saved = null;
try { saved = localStorage.getItem('entropy-lang'); } catch (e) {}
lang = saved || ((navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'en');
applyCopy();
resetSend();
syncTopic();
heroBoard.resize();
storyBoard.resize();
// the hero watermark sits exactly under the board, so the board reads as the centre of the rose
const heroMark = $('#hero-mark');
const placeMark = () => {
  const c = heroBoard.centre(), r = heroBoard.el.getBoundingClientRect(), h = heroEl.getBoundingClientRect();
  heroMark.style.setProperty('--mark-x', `${r.left - h.left + c.x}px`);
  heroMark.style.setProperty('--mark-y', `${r.top - h.top + c.y}px`);
  heroMark.style.setProperty('--mark-d', `${Math.round(c.w * 1.34)}px`);
};
new ResizeObserver(() => { heroBoard.resize(); placeMark(); }).observe(heroBoard.el);
new ResizeObserver(() => storyBoard.resize()).observe(storyBoard.el);
const beginIntro = () => { if (!introStart) introStart = performance.now(); };
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { heroBoard.resize(); storyBoard.resize(); placeMark(); beginIntro(); });
setTimeout(beginIntro, 1200);
if (document.readyState !== 'complete') addEventListener('load', () => audit.refresh());
requestAnimationFrame(frame);
