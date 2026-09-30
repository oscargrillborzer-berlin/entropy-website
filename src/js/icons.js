/* ==========================================================================
   ICONS: drawn for this site. 24px grid, square ends.
   ========================================================================== */
const ICONS = {
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  down: '<path d="M12 4v15M6 13l6 6 6-6"/>',
  hidden: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="m9 11.5 2 2-2 2"/><path d="M13 15.5h2.5"/>',
  data: '<ellipse cx="10" cy="6" rx="6" ry="2.5"/><path d="M4 6v11c0 1.4 2.7 2.5 6 2.5"/><path d="M16 6v5"/><path d="M14 17h7m-3-3 3 3-3 3"/>',
  setup: '<path d="M3 5h18v14H3z"/><path d="m7 10 2.5 2.5L7 15"/><path d="M12 15h5"/>',
  agent: '<path d="M16 3v18" stroke-dasharray="2 2.5"/><path d="m5 5 4.5 13 2-5.2 5.3-2Z"/>',
  crossed: '<path d="M3 8h13m-3-3 3 3-3 3"/><path d="M21 16H8m3-3-3 3 3 3"/>',
  output: '<path d="m8 7-5 5 5 5"/><path d="m16 7 5 5-5 5"/><path d="m13.5 4.5-3 15"/>',
  poison: '<path d="M9 3h6"/><path d="M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7 15h10"/>',
  usage: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="m12 17 4.5-6"/><path d="M3 21h18"/>',
  expert: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.5"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>',
  loop: '<path d="M20 12a8 8 0 0 1-14.2 5"/><path d="M4 12a8 8 0 0 1 14.2-5"/><path d="M18.5 3.5V7H15"/><path d="M5.5 20.5V17H9"/>',
  reply: '<path d="M4 5h16v11H10l-4.5 3.5V16H4z"/>',
  call: '<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>',
  proposal: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="m9 14 2 2 4-4"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
};
const icon = (name, sw = 1.3) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${ICONS[name]}</svg>`;
$$('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon, el.closest('.btn, .link, .cta') ? 1.6 : 1.3); });
