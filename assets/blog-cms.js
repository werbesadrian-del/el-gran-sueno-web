/* ============================================================================
   EL GRAN SUEÑO — Blogs desde el panel (CMS)
   ----------------------------------------------------------------------------
   Lee los posts escritos en el panel (content/blog.json) y los suma al listado
   del blog y a la home, junto con los escritos ya existentes. Cada post nuevo
   se abre en articulo.html?slug=... (no hace falta crear un HTML a mano).
   Si el archivo no existe o falla, no rompe nada: el sitio sigue igual.
   ============================================================================ */
window.EGS_PILAR_LABELS = {
  identidad: 'Identidad', proposito: 'Propósito', reino: 'Reino', caracter: 'Carácter',
  comunidad: 'Comunidad', dones: 'Dones', 'gran-comision': 'Gran Comisión',
  santificacion: 'Santificación', servicio: 'Servicio'
};
window.EGS_BLOG_READY = fetch('content/blog.json', { cache: 'no-store' })
  .then(function (r) { return r.ok ? r.json() : { posts: [] }; })
  .then(function (data) {
    var posts = (data && data.posts ? data.posts : []).map(function (p) {
      return {
        slug: p.slug,
        titulo: p.titulo,
        pilar: p.pilar || 'identidad',
        pilarLabel: p.pilarLabel || window.EGS_PILAR_LABELS[p.pilar] || p.pilar || '',
        fecha: p.fecha,
        lectura: p.lectura || '',
        pregunta: p.pregunta || '',
        excerpt: p.resumen || '',
        destacado: !!p.destacado,
        esBlog: true,
        link: 'articulo.html?slug=' + encodeURIComponent(p.slug)
      };
    });
    // Sumar al índice global que usan blog.html y la home
    window.EGS_ESCRITOS = (window.EGS_ESCRITOS || []).concat(posts);
    // Re-renderizar si la página ya se dibujó
    if (typeof window.blogRender === 'function') { try { window.blogRender(); } catch (e) {} }
    if (typeof window.egsRenderHomeIndex === 'function') { try { window.egsRenderHomeIndex(); } catch (e) {} }
    return posts;
  })
  .catch(function () { return []; });
