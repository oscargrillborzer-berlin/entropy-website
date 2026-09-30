/* ==========================================================================
   LEGAL SHEETS: legal notice, privacy, vulnerability reports
   ========================================================================== */
const sheet = $('#sheet');
let sheetName = null;
const renderSheet = () => {
  if (!sheetName) return;
  $('#sheet-title').textContent = t(`ft.${sheetName}`);
  $('#sheet-body').innerHTML = t(`sh.${sheetName}`);
};
function openSheet(name) {
  sheetName = name;
  renderSheet();
  sheet.scrollTop = 0;
  if (!sheet.open) sheet.showModal();
}
$$('[data-sheet]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openSheet(a.dataset.sheet); }));
$('#sheet-close').addEventListener('click', () => sheet.close());
sheet.addEventListener('click', e => {
  if (e.target === sheet) { sheet.close(); return; }                                // a click on the backdrop
  const go = e.target.closest('[data-goto]');
  if (!go) return;
  sheet.close();
  const topic = form.querySelector(`input[name="topic"][value="${go.dataset.goto}"]`);
  if (topic) { topic.checked = true; syncTopic(); }
  $('#contact').scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth' });
  setTimeout(() => $('#lead-name').focus({ preventScroll: true }), reduce.matches ? 0 : 700);
});
sheet.addEventListener('close', () => { sheetName = null; });
listeners.push(renderSheet);
