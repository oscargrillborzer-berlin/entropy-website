/* ==========================================================================
   KEYBOARD: the shortcuts panel and the shortcuts themselves
   ========================================================================== */
const keys = $('#keys');
$('#keys-open').addEventListener('click', () => { keys.hidden = !keys.hidden; });
$('#keys-close').addEventListener('click', () => { keys.hidden = true; $('#keys-open').focus(); });

// Shortcuts stay quiet while someone types, and while a legal sheet is open.
window.addEventListener('keydown', e => {
  if (sheet.open || e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input, textarea, select, [contenteditable]')) return;
  const k = e.key;
  if (k === '?') keys.hidden = !keys.hidden;
  else if (k === 'Escape') keys.hidden = true;
  else if (k === 'l' || k === 'L') setLang(lang === 'en' ? 'de' : 'en');
  else if (k === 'r' || k === 'R') { $('#dial').scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'center' }); dial.recalibrate(); }
  else if (k === 'c' || k === 'C') $('#contact').scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
  else if (k === 'j' || k === 'J') scrollToStep(Math.min(3, currentStep + (storyEl.getBoundingClientRect().top > 0 ? 0 : 1)));
  else if (k === 'k' || k === 'K') scrollToStep(Math.max(0, currentStep - 1));
});
