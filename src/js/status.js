/* ==========================================================================
   STATUS LINE
   ========================================================================== */
const SECTIONS = [['~/', heroEl], ['~/how', storyEl], ['~/why-now', $('#why')], ['~/findings', $('#findings')],
                  ['~/work-with-us', $('#offer')], ['~/team', $('#team')], ['~/contact', $('#contact')], ['~/audit', $('#audit')]];
const pathEl = $('#st-path'), midEl = $('#st-mid'), pctEl = $('#st-pct');
const stepNow = $('#step-now');
const ui = { step: -1, path: '', mid: '', pct: '', rail: '' };
listeners.push(() => { ui.mid = null; });
let currentStep = 0;
function updateUI(p, inStory) {
  let step = 0;
  for (let i = 0; i < 4; i++) if (p >= STEP_AT[i]) step = i;
  currentStep = step;
  if (step !== ui.step) {
    ui.step = step;
    stepBtns.forEach((b, i) => { b.classList.toggle('on', i === step); b.setAttribute('aria-current', i === step ? 'step' : 'false'); });
    stepLis.forEach((li, i) => li.classList.toggle('current', i === step));
    stepNow.textContent = pad(step + 1, 2);
  }
  const rail = railBars.map((_, i) => clamp01((p - STEP_AT[i]) / (STEP_AT[i + 1] - STEP_AT[i])).toFixed(3)).join();
  if (rail !== ui.rail) { ui.rail = rail; rail.split(',').forEach((v, i) => { railBars[i].style.transform = `scaleX(${v})`; }); }
  const vh = innerHeight;
  let path = SECTIONS[0][0];
  for (const [name, el] of SECTIONS) if (el.getBoundingClientRect().top <= vh * 0.5) path = name;
  if (path !== ui.path) { ui.path = path; pathEl.textContent = path; }
  const mid = inStory ? `${pad(step + 1, 2)} · ${t(`s${step}.t`)}` : '';
  if (mid !== ui.mid) { ui.mid = mid; midEl.textContent = mid; }
  const max = document.documentElement.scrollHeight - vh;
  const pct = `${pad(max > 0 ? Math.round((scrollY / max) * 100) : 0, 3)}%`;
  if (pct !== ui.pct) { ui.pct = pct; pctEl.textContent = pct; }
}

// Blocks rise into place once, as they reach the reader. They are visible before that, only lower and dimmer.
if ('IntersectionObserver' in window && !reduce.matches) {
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -12% 0px' });
  $$('.rise').forEach(el => io.observe(el));
} else {
  $$('.rise').forEach(el => el.classList.add('in'));
}
