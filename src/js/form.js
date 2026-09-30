/* ==========================================================================
   REQUEST FORM: topic-aware, inline checks, a receipt instead of a fake "sent"
   ========================================================================== */
const form = $('#lead'), reqBody = $('#req-body'), reqDone = $('#req-done'), sendBtn = $('#send');
const CHECKS = [
  ['lead-name', el => (el.value.trim() ? '' : t('e.name'))],
  ['lead-email', el => (!el.value.trim() ? t('e.email0') : el.validity.typeMismatch ? t('e.email1') : '')],
  ['lead-company', el => (el.value.trim() || form.elements.topic.value === 'other' ? '' : t('e.company'))],
];
const setMsg = (el, m) => { const row = el.closest('.row'); row.classList.toggle('bad', !!m); $('.msg', row).textContent = m; };
CHECKS.forEach(([id]) => $('#' + id).addEventListener('input', e => { if (e.target.closest('.row').classList.contains('bad')) setMsg(e.target, ''); }));
$('#lead-what').addEventListener('input', e => { $('#lead-count').textContent = `${e.target.value.length} / 800`; });
const syncTopic = () => { $('#row-stage').hidden = form.elements.topic.value !== 'assessment'; };
$$('input[name="topic"]').forEach(r => r.addEventListener('change', syncTopic));
const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
form.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); form.requestSubmit(); } });
function fillReceipt() {
  $('#d-title').textContent = t('d.title').replace('{name}', $('#lead-name').value.trim().split(/\s+/)[0]);
  $('#d-company').textContent = $('#lead-company').value.trim();
  $('#d-topic').textContent = t({ assessment: 'r.t1', investment: 'r.t2', other: 'r.t3' }[form.elements.topic.value]);
  $('#d-email').textContent = $('#lead-email').value.trim();
}
const resetSend = () => { sendBtn.innerHTML = `<span data-i18n="r.send">${t('r.send')}</span><kbd>${isMac ? '⌘ ↵' : 'Ctrl ↵'}</kbd>`; };
listeners.push(() => { if (!sendBtn.disabled) resetSend(); if (!reqDone.hidden) fillReceipt(); });
const sendError = $('#send-error');
if (!FORM_ENDPOINT) { $('[data-i18n="d.k"]').dataset.i18n = 'd.k0'; $('[data-i18n="d.p"]').dataset.i18n = 'd.p0'; }
function finish(ok) {
  sendBtn.disabled = false;
  resetSend();
  if (!ok) { sendError.textContent = t('e.send'); sendError.hidden = false; return; }
  fillReceipt();
  reqBody.hidden = true;
  reqDone.hidden = false;
  reqDone.focus({ preventScroll: true });
}
form.addEventListener('submit', e => {
  e.preventDefault();
  let first = null;
  for (const [id, test] of CHECKS) { const el = $('#' + id), m = test(el); setMsg(el, m); if (m && !first) first = el; }
  if (first) { first.focus(); return; }
  sendError.hidden = true;
  sendBtn.disabled = true;
  sendBtn.innerHTML = `<span>${t('r.send')}</span><span class="spin" aria-hidden="true"></span>`;
  if (!FORM_ENDPOINT) { setTimeout(() => finish(true), reduce.matches ? 0 : 700); return; }
  fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)) })
    .then(r => finish(r.ok), () => finish(false));
});
listeners.push(() => { if (!sendError.hidden) sendError.textContent = t('e.send'); });
$('#d-edit').addEventListener('click', () => { reqDone.hidden = true; reqBody.hidden = false; $('#lead-name').focus(); });
