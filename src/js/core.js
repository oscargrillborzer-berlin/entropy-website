'use strict';

/* ==========================================================================
   CORE: settings and small helpers shared by everything below
   ========================================================================== */
// Where the request form posts. '/' works with Netlify Forms; null keeps the form in prototype mode (nothing is sent).
const FORM_ENDPOINT = null;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const SANS = '"Host Grotesk", "Helvetica Neue", Arial, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';
const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const bump = (t, a, b, c, d) => seg(t, a, b) * (1 - seg(t, c, d));
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const pad = (n, l) => String(n).padStart(l, '0');
