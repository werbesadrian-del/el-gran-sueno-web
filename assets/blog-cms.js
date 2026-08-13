/* ============================================================================
   EL GRAN SUEÑO — Contenido desde el panel (CMS)
   ----------------------------------------------------------------------------
   Lee lo que escribís en el panel y lo suma a las dos secciones:
     · content/blog.json    → Escritos  (se abren en articulo.html?slug=...)
     · content/huellas.json → Huellas   (se abren en huella.html?slug=...)
   Se combinan con los escritos y huellas ya existentes. No hay que crear HTML
   a mano. Si un archivo no existe o falla, no rompe nada: el sitio sigue igual.
   ============================================================================ */
window.EGS_PILAR_LABELS = {
  identidad: 'Identidad', proposito: 'Propósito', reino: 'Reino', caracter: 'Carácter',
  comunidad: 'Comunidad', dones: 'Dones', 'gran-comision': 'Gran Comisión',
  santificacion: 'Santificación', servicio: 'Servicio'
};

function egsCargarColeccion(archivo, mapear, destino, renderFns) {
  return fetch(archivo, { cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : { posts: [] }; })
    .then(function (data) {
      var items = (data && data.posts ? data.posts : []).map(mapear);
      window[destino] = (window[destino] || []).concat(items);
      renderFns.forEach(function (fn) {
        if (typeof window[fn] === 'function') { try { window[fn](); } catch (e) {} }
      });
      return items;
    })
    .catch(function () { return []; });
}

/* --- ESCRITOS --- */
window.EGS_BLOG_READY = egsCargarColeccion('content/blog.json', function (p) {
  return {
    slug: p.slug, titulo: p.titulo,
    pilar: p.pilar || 'identidad',
    pilarLabel: p.pilarLabel || window.EGS_PILAR_LABELS[p.pilar] || p.pilar || '',
    fecha: p.fecha, lectura: p.lectura || '', pregunta: p.pregunta || '',
    excerpt: p.resumen || '', destacado: !!p.destacado, esBlog: true,
    link: 'blog/' + p.slug + '.html'
  };
}, 'EGS_ESCRITOS', ['blogRender', 'egsRenderHomeIndex']);

/* --- HUELLAS --- */
window.EGS_HUELLAS_READY = egsCargarColeccion('content/huellas.json', function (p) {
  return {
    slug: p.slug, nombre: p.nombre,
    meta: p.meta || '', frase: p.frase || '',
    fecha: p.fecha, destacado: !!p.destacado, esHuella: true,
    link: 'huella/' + p.slug + '.html'
  };
}, 'EGS_HUELLAS', ['huellasRender', 'egsRenderHomeIndex']);
