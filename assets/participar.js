/* ============================================================================
   CÓMO PARTICIPAR EN UNA HISTORIA (propuesta 24-nov-2026)
   Tres opciones simples debajo de cada historia: voy a orar, tengo algo para ofrecer
   y quiero acompañar a esta persona. Se arma solo en cualquier historia que tenga:
   <section class="participar" data-historia="id" data-nombre="Sofía" data-oran="14"
            data-motivo="Pide oración para..."> ... <div class="participar-arma"></div></section>
   Todo se guarda en la base (egsGuardar). Avisa por email (Netlify) cuando alguien deja su contacto.
   data-oran es la cuenta de quienes oran: hoy la pone el equipo; con un contador público en la
   base (solo el número, nunca los nombres) se actualizaría sola.
   ============================================================================ */
(function () {
  'use strict';
  var sec = document.querySelector('.participar[data-historia]');
  var arma = sec && sec.querySelector('.participar-arma');
  if (!sec || !arma) return;

  var id = sec.dataset.historia;
  var nombre = sec.dataset.nombre || 'esta persona';
  var oran = parseInt(sec.dataset.oran || '0', 10) || 0;
  var motivo = sec.dataset.motivo || '';
  var por = sec.dataset.por || 'este proceso';          // por qué se ora, en la cuenta
  var aQuien = sec.dataset.a || ('a ' + nombre);         // a quién se sostiene en oración
  var soloOrar = sec.hasAttribute('data-solo-orar');     // en Sostener: solo el bloque de oración
  var T = sec.dataset.voz === 'vos'
    ? { parte: 'Ya sos parte', nota: 'Si querés quedar anotado y que te contemos cómo sigue, dejá tu nombre y tu correo.', con: 'con vos', tu: 'Vos' }
    : { parte: 'Ya eres parte', nota: 'Si quieres quedar anotado y que te contemos cómo sigue su camino, deja tu nombre y tu correo.', con: 'contigo', tu: 'Tú' };
  var clave = 'egs-ora-' + id;
  var estado = {};
  try { estado = JSON.parse(localStorage.getItem(clave) || '{}') || {}; } catch (e) { estado = {}; }
  function recordar() { try { localStorage.setItem(clave, JSON.stringify(estado)); } catch (e) {} }

  // una persona arrodillada, con las manos juntas delante de la cara
  var ORANTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="4.6" r="2.3"/><path d="M10.2 8.3L9.2 13.8 11.8 19.6H5.6"/><path d="M10.1 9.6l3 2.4 1.1-4.6"/></svg>';
  var ICONO_OFRECER = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8"/><path d="M2.5 8h19v4h-19z"/><path d="M12 21V8"/><path d="M12 8c-1.5-3-5-4-5.5-1.8S9 8 12 8c3 0 5.9-.4 5.5-1.8S13.5 5 12 8z"/></svg>';
  var ICONO_ACOMPANAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="3"/><circle cx="17" cy="10" r="2.5"/><path d="M3 20c0-3 2-5 5-5s5 2 5 5M13 20c0-2 2-4 4-4s4 2 4 4"/></svg>';
  var TIEMPOS = ['Una o dos conversaciones al mes', 'Una vez por semana', 'Con flexibilidad según el momento', 'Todavía no estoy seguro'];

  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function correoBien(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || '').trim()); }
  function ref() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  function guardar(form, datos, avisar) {
    datos.historia = id; datos.historia_de = nombre;
    datos.pagina = location.pathname; datos.timestamp = new Date().toISOString();
    if (window.egsGuardar) window.egsGuardar(form, datos);
    if (avisar && window.egsAvisarNetlify) {
      var resumen = ['Historia: ' + nombre];
      ['ofrece', 'aporta', 'tiempo'].forEach(function (k) { if (datos[k]) resumen.push(datos[k]); });
      window.egsAvisarNetlify(form, { nombre: datos.nombre || '', email: datos.correo || '', mensaje: resumen.join(' · ').slice(0, 600) });
    }
  }

  function campos(pref, correoObligatorio) {
    return '<div class="part-campos">' +
      '<label class="part-campo"><span>Tu nombre</span><input type="text" id="' + pref + '-nombre" autocomplete="name" placeholder="Tu nombre…"></label>' +
      '<label class="part-campo"><span>Tu correo' + (correoObligatorio ? '' : ' <em>opcional</em>') + '</span><input type="email" id="' + pref + '-correo" autocomplete="email" placeholder="tu@correo.com"></label></div>';
  }

  arma.innerHTML =
    // 1. Voy a orar: lo primero y lo más fácil; cada persona que ora queda como una figura
    '<div class="part-orar">' +
      '<p class="orar-titulo">Voy a orar por ' + esc(nombre) + '</p>' +
      (motivo ? '<div class="orar-motivo">' + esc(motivo) + '</div>' : '') +
      '<div class="orantes" role="img"></div>' +
      '<p class="orantes-cuenta" aria-live="polite"></p>' +
      '<button type="button" class="orar-btn">Voy a orar</button>' +
      '<div class="orar-anotar" hidden>' +
        '<div class="orar-gracias">Gracias. ' + T.parte + ' de quienes oran por ' + esc(nombre) + '.</div>' +
        '<p class="orar-nota">' + T.nota + '</p>' +
        campos('ora', false) +
        '<button type="button" class="part-enviar orar-anotarme" disabled>Anotarme</button></div></div>' +
    // 2 y 3. Ofrecer algo y acompañar: se abren en el lugar, con lo mínimo
    (soloOrar ? '' :
    '<div class="part-item" data-form="ofrecer">' +
      '<button type="button" class="part-cab" aria-expanded="false" aria-controls="part-ofrecer">' +
        '<span class="part-icono">' + ICONO_OFRECER + '</span>' +
        '<span class="part-textos"><span class="part-titulo">Tengo algo para ofrecer</span>' +
        '<span class="part-desc">Un recurso, un espacio, una oportunidad, o alguien que conoces. Escríbenos y lo vemos juntos.</span></span>' +
        '<i class="part-mas" aria-hidden="true"></i></button>' +
      '<div class="part-cuerpo" id="part-ofrecer"><div>' +
        '<label class="part-pregunta" for="of-texto">¿Qué podrías ofrecer, o a quién conoces?</label>' +
        '<textarea id="of-texto" rows="3" placeholder="Cuéntanos en pocas palabras…"></textarea>' +
        campos('of', true) +
        '<button type="button" class="part-enviar" disabled>Enviar</button>' +
        '<div class="part-listo" hidden>Gracias. Lo leemos con cuidado y te escribimos para ver juntos cómo puede ayudar.</div></div></div></div>' +
    '<div class="part-item" data-form="acompanar-historia">' +
      '<button type="button" class="part-cab" aria-expanded="false" aria-controls="part-acompanar">' +
        '<span class="part-icono">' + ICONO_ACOMPANAR + '</span>' +
        '<span class="part-textos"><span class="part-titulo">Quiero acompañar a ' + esc(nombre) + '</span>' +
        '<span class="part-desc">Si tu historia o tu experiencia puede ser parte de este proceso, déjanos tu contacto y nosotros hacemos el enlace.</span></span>' +
        '<i class="part-mas" aria-hidden="true"></i></button>' +
      '<div class="part-cuerpo" id="part-acompanar"><div>' +
        '<label class="part-pregunta" for="ac-texto">¿Qué de tu camino podría acompañar el de ' + esc(nombre) + '? <em>opcional</em></label>' +
        '<textarea id="ac-texto" rows="3" placeholder="Algo que viviste, tu profesión, algo que Dios formó en ti…"></textarea>' +
        '<div class="part-pregunta">¿Cuánto tiempo podrías dedicarle? <em>opcional</em></div>' +
        '<div class="part-chips" role="radiogroup" aria-label="Tiempo al mes">' +
          TIEMPOS.map(function (t) { return '<button type="button" role="radio" aria-checked="false">' + t + '</button>'; }).join('') + '</div>' +
        campos('ac', true) +
        '<button type="button" class="part-enviar" disabled>Enviar</button>' +
        '<div class="part-listo" hidden>Gracias. Alguien del equipo te va a escribir para ver cómo hacer el enlace con ' + esc(nombre) + '. Nada le llega sin cuidado y discernimiento.</div></div></div></div>');

  // ---------- Voy a orar
  var orantes = arma.querySelector('.orantes');
  var cuenta = arma.querySelector('.orantes-cuenta');
  var btnOrar = arma.querySelector('.orar-btn');
  var anotar = arma.querySelector('.orar-anotar');
  var MAX = 24;

  function pintarOrantes(nuevo) {
    var total = oran + (estado.ora ? 1 : 0);
    var otros = Math.min(oran, estado.ora ? MAX - 1 : MAX);
    var html = '';
    for (var i = 0; i < otros; i++) html += '<span class="orante">' + ORANTE + '</span>';
    if (estado.ora) html += '<span class="orante tuyo' + (nuevo ? ' nuevo' : '') + '" title="' + T.tu + '">' + ORANTE + '</span>';
    if (total > MAX) html += '<span class="orantes-mas">+' + (total - MAX) + '</span>';
    orantes.innerHTML = html;
    orantes.setAttribute('aria-label', total + (total === 1 ? ' persona ora' : ' personas oran') + ' por ' + por);
    cuenta.innerHTML = total === 0 ? 'Sé la primera persona en orar por ' + por
      : '<strong>' + total + '</strong> ' + (total === 1 ? 'persona ora' : 'personas oran') + ' por ' + por + (estado.ora ? ', ' + T.con : '');
    btnOrar.textContent = estado.ora ? 'Estás orando por ' + nombre : 'Voy a orar';
    btnOrar.classList.toggle('hecho', !!estado.ora);
    btnOrar.disabled = !!estado.ora;
  }
  pintarOrantes(false);

  btnOrar.addEventListener('click', function () {
    if (estado.ora) return;
    estado.ora = true; estado.ref = ref(); recordar();
    pintarOrantes(true);
    guardar('oracion', { ref: estado.ref, tipo: 'voy a orar' }, false);
    anotar.hidden = false;
  });
  // si ya ora pero no dejó su nombre, puede hacerlo cuando vuelva
  if (estado.ora && !estado.anotado) anotar.hidden = false;

  var oraNombre = arma.querySelector('#ora-nombre'), oraCorreo = arma.querySelector('#ora-correo');
  var btnAnotar = arma.querySelector('.orar-anotarme');
  function revisarOra() {
    var c = oraCorreo.value.trim();
    btnAnotar.disabled = !(oraNombre.value.trim() && (!c || correoBien(c)));
  }
  oraNombre.addEventListener('input', revisarOra); oraCorreo.addEventListener('input', revisarOra);
  btnAnotar.addEventListener('click', function () {
    guardar('oracion', { ref: estado.ref || ref(), tipo: 'anotado', nombre: oraNombre.value.trim(), correo: oraCorreo.value.trim() }, true);
    estado.anotado = true; recordar();
    anotar.innerHTML = '<div class="orar-gracias">Quedaste anotado. Gracias por sostener ' + esc(aQuien) + ' en oración.</div>';
  });

  // ---------- Ofrecer y acompañar: uno abierto por vez
  var items = [].slice.call(arma.querySelectorAll('.part-item'));
  function abrir(it, si) {
    it.classList.toggle('abierto', si);
    it.querySelector('.part-cab').setAttribute('aria-expanded', si ? 'true' : 'false');
  }
  items.forEach(function (it) {
    it.querySelector('.part-cab').addEventListener('click', function () {
      var si = !it.classList.contains('abierto');
      items.forEach(function (o) { abrir(o, o === it ? si : false); });
      if (si) setTimeout(function () { var t = it.querySelector('textarea'); if (t && window.matchMedia('(pointer: fine)').matches) t.focus({ preventScroll: true }); }, 350);
    });
    var form = it.dataset.form;
    var texto = it.querySelector('textarea');
    var pref = form === 'ofrecer' ? 'of' : 'ac';
    var n = it.querySelector('#' + pref + '-nombre'), c = it.querySelector('#' + pref + '-correo');
    var enviar = it.querySelector('.part-enviar');
    var chips = [].slice.call(it.querySelectorAll('.part-chips button'));
    chips.forEach(function (b) {
      b.addEventListener('click', function () {
        var si = b.getAttribute('aria-checked') !== 'true';
        chips.forEach(function (o) { o.setAttribute('aria-checked', 'false'); });
        b.setAttribute('aria-checked', si ? 'true' : 'false');
      });
    });
    function revisar() {
      var okTexto = form === 'ofrecer' ? texto.value.trim().length > 0 : true;
      enviar.disabled = !(okTexto && n.value.trim() && correoBien(c.value));
    }
    [texto, n, c].forEach(function (el) { el.addEventListener('input', revisar); });
    enviar.addEventListener('click', function () {
      var elegido = chips.filter(function (b) { return b.getAttribute('aria-checked') === 'true'; })[0];
      var datos = { nombre: n.value.trim(), correo: c.value.trim() };
      if (form === 'ofrecer') datos.ofrece = texto.value.trim();
      else { datos.aporta = texto.value.trim(); if (elegido) datos.tiempo = elegido.textContent; }
      guardar(form, datos, true);
      var cuerpo = it.querySelector('.part-cuerpo > div');
      [].slice.call(cuerpo.children).forEach(function (el) { if (!el.classList.contains('part-listo')) el.hidden = true; });
      it.querySelector('.part-listo').hidden = false;
    });
  });
})();
