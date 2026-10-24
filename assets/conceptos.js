/* ============================================================================
   EL GRAN SUEÑO - LÉXICO DE CONCEPTOS
   ----------------------------------------------------------------------------
   Las palabras viven en content/conceptos.json, el repositorio de todas las
   palabras. Se editan desde el panel (elgransueno.org/admin, Palabras) o a mano:
   { "p": "Palabra", "d": "Definición", "lugar": "jerusalen" }   (lugar es opcional)
   Lugares con sentido: ver LUGARES en assets/home-scroll.js. Sin lugar, la
   palabra se ubica sola en tierra firme, siempre en el mismo sitio.
   En la home se descubren girando el mundo; sin 3D desfilan en la marquesina.
   Este archivo las carga una sola vez y las comparte:
   window.egsConceptos() devuelve una promesa con la lista.
   ============================================================================ */
(function () {
  var pedido = null;
  window.egsConceptos = function () {
    if (!pedido) {
      pedido = fetch('/content/conceptos.json')
        .then(function (r) { return r.json(); })
        .then(function (d) { return ((d && d.conceptos) || []).filter(function (c) { return c && c.p && c.d; }); })
        .catch(function () { return []; });
    }
    return pedido;
  };
})();
