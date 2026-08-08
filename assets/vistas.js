/* ==========================================================================
   El Gran Sueño — Sistema de contador de vistas
   --------------------------------------------------------------------------
   Usa un servicio externo gratuito y sin autenticación para contar cuántas
   veces se abrió cada artículo o huella.
   Servicio: https://abacus.jasoncameron.dev — Free, no auth, no rate limit
   público. Fallback silencioso si el servicio no responde.
   --------------------------------------------------------------------------
   USO:
     // En el índice (blog.html, huellas-de-fe.html, index.html)
     const vistas = await egsGetVistas(['slug1', 'slug2', ...]);
     // → { slug1: 123, slug2: 45, ... }
     
     // En el artículo individual (al cargar la página)
     egsTrackVista('slug-del-articulo');
   ========================================================================== */

(function () {
  const NS = 'elgransueno';                          // Namespace del proyecto
  const BASE = 'https://abacus.jasoncameron.dev';    // Contador gratuito, sin auth
  const TIMEOUT_MS = 3500;

  function fetchWithTimeout(url) {
    return new Promise((resolve) => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      fetch(url, { signal: ctrl.signal })
        .then(r => r.ok ? r.json() : null)
        .then(d => { clearTimeout(t); resolve(d); })
        .catch(() => { clearTimeout(t); resolve(null); });
    });
  }

  /**
   * Registra una vista para un slug. Solo una vez por sesión por slug
   * (para no inflar el contador si el visitante recarga la página).
   */
  window.egsTrackVista = async function (slug) {
    if (!slug) return null;
    const key = 'egs_vista_' + slug;
    try {
      if (sessionStorage.getItem(key)) return null;
      sessionStorage.setItem(key, '1');
    } catch (_) { /* modo privado, seguimos */ }

    const url = `${BASE}/hit/${encodeURIComponent(NS)}/${encodeURIComponent(slug)}`;
    const data = await fetchWithTimeout(url);
    return data && typeof data.value === 'number' ? data.value : null;
  };

  /**
   * Lee el contador de un conjunto de slugs sin incrementar.
   * Devuelve un objeto { slug: número, ... }. Si el servicio falla,
   * devuelve 0 para ese slug (no rompe el ordenamiento).
   */
  window.egsGetVistas = async function (slugs) {
    if (!Array.isArray(slugs) || !slugs.length) return {};
    const results = {};
    await Promise.all(slugs.map(async (s) => {
      const url = `${BASE}/get/${encodeURIComponent(NS)}/${encodeURIComponent(s)}`;
      const d = await fetchWithTimeout(url);
      results[s] = d && typeof d.value === 'number' ? d.value : 0;
    }));
    return results;
  };
})();
