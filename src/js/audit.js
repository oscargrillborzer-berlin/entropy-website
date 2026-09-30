/* ==========================================================================
   AUDIT: the page checks itself, in the reader's browser
   ========================================================================== */
const TRACKERS = /google-analytics|googletagmanager|doubleclick|facebook|fbcdn|hotjar|segment|mixpanel|clarity\.ms|linkedin|tiktok|hubspot|intercom/i;
const audit = (() => {
  let external = [], cookies = 0, stored = [], ready = 0;
  function measure() {
    external = performance.getEntriesByType('resource').filter(r => {
      try { const u = new URL(r.name, location.href); return /^https?:$/.test(u.protocol) && u.origin !== location.origin; } catch (e) { return false; }
    }).map(r => new URL(r.name).host);
    try { cookies = document.cookie ? document.cookie.split(';').filter(c => c.trim()).length : 0; } catch (e) { cookies = 0; }
    stored = [];
    try { for (let i = 0; i < localStorage.length; i++) stored.push(localStorage.key(i)); } catch (e) {}
    const nav = performance.getEntriesByType('navigation')[0];
    ready = nav && nav.domContentLoadedEventEnd ? nav.domContentLoadedEventEnd : performance.now();
  }
  function render() {
    const trackers = external.filter(h => TRACKERS.test(h)).length;
    const hosts = [...new Set(external)];
    $('#a-trackers').textContent = trackers;
    $('#a-cookies').textContent = cookies;
    $('#a-external').innerHTML = `${external.length}${hosts.length ? `<small>${hosts.join(', ')}</small>` : ''}`;
    const ours = stored.filter(k => k === 'entropy-lang');
    $('#a-stored').innerHTML = stored.length === 0 ? `0<small>${t('a.nothing')}</small>`
      : stored.length === ours.length ? `1<small>${t('a.lang')}</small>` : `${stored.length}<small>${t('a.keys').replace('{n}', stored.length)}</small>`;
    $('#a-ready').textContent = `${Math.round(ready)} ms`;
    $('#audit-mini').textContent = t('a.mini').replace('{t}', trackers).replace('{c}', cookies).replace('{x}', external.length);
  }
  const refresh = () => { measure(); render(); };
  if ('PerformanceObserver' in window) { try { new PerformanceObserver(() => refresh()).observe({ type: 'resource', buffered: false }); } catch (e) {} }
  return { refresh };
})();
listeners.push(() => audit.refresh());
