let lang = 'en';
const t = key => COPY[lang][key] ?? COPY.en[key] ?? key;
const listeners = [];

function applyCopy() {
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  $$('[data-i18n-aria]').forEach(el => el.setAttribute('aria-label', t(el.dataset.i18nAria)));
  $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  $('#hero-caption').innerHTML = t('hero.cap');
  $('#keys-open').innerHTML = t('ft.keys').replace('{k}', '<kbd>?</kbd>');
  $$('.row.bad').forEach(row => row.classList.remove('bad'));
  $$('.row .msg').forEach(m => { m.textContent = ''; });
  listeners.forEach(fn => fn());
}
// Switching language changes line lengths. Keep whatever the reader is looking at exactly where it was.
function setLang(next, remember = true) {
  const probe = document.elementFromPoint(innerWidth / 2, innerHeight * 0.4);
  const anchor = probe && probe.closest('[data-i18n], h1, h2, h3, p, li, figure, section') || probe;
  const before = anchor ? anchor.getBoundingClientRect().top : 0;
  lang = COPY[next] ? next : 'en';
  applyCopy();
  if (anchor && anchor.isConnected) {
    const delta = anchor.getBoundingClientRect().top - before;
    if (Math.abs(delta) > 0.5) {
      const root = document.documentElement, prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto';
      window.scrollBy(0, delta);
      root.style.scrollBehavior = prev;
    }
  }
  if (remember) { try { localStorage.setItem('entropy-lang', lang); } catch (e) {} }
  audit.refresh();
}
$$('[data-lang]').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
