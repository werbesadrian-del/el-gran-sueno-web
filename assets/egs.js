/* ============================================================================
   EL GRAN SUEÑO — CONEXIÓN CON LA BASE DE DATOS (Supabase)
   ----------------------------------------------------------------------------
   Acá es donde TODOS los formularios del sitio guardan sus respuestas.
   La clave "anon" es PÚBLICA y segura de mostrar: la protección real está en
   las reglas (RLS) de la base, que solo permiten ENVIAR, nunca leer datos de
   otros. Para cambiar de proyecto, cambiá 'url' y 'anon' de acá abajo.
   ============================================================================ */
window.EGS_SUPABASE = {
  url:  'https://eicedyftposrsohlgzrl.supabase.co',
  anon: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpY2VkeWZ0cG9zcnNvaGxnenJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NTAwMzcsImV4cCI6MjA5ODIyNjAzN30.h01a4OF66LS71FEWyjOx0BqaiQwClNdmwlQtsZMD54w'
};

/* Guarda una respuesta de formulario en la base.
   form = nombre del formulario (newsletter, colaborar, oracion, historia, ...)
   data = objeto con todas las respuestas.
   No bloquea la pantalla: si la red falla, el respaldo en localStorage ya guardó. */
window.egsGuardar = function (form, data) {
  try {
    var cfg = window.EGS_SUPABASE || {};
    if (!cfg.url || !cfg.anon) return;
    data = data || {};
    var pick = function (keys) {
      for (var i = 0; i < keys.length; i++) {
        if (data[keys[i]]) return String(data[keys[i]]);
      }
      return null;
    };
    var cuerpo = {
      form:    form,
      name:    pick(['name', 'nombre', 'institucion']),
      email:   pick(['email', 'correo']),
      payload: data
    };
    return fetch(cfg.url + '/rest/v1/submissions', {
      method: 'POST',
      headers: {
        'apikey':        cfg.anon,
        'Authorization': 'Bearer ' + cfg.anon,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal'
      },
      body: JSON.stringify(cuerpo)
    }).catch(function () { /* silencioso: el respaldo local ya quedó guardado */ });
  } catch (e) { /* nunca romper la interfaz por esto */ }
};

/* ----------------------------------------------------------------------------
   AVISO POR EMAIL (Netlify Forms) — SOLO para los formularios donde Adrián
   quiere enterarse (mentoría y colaborar). Manda una copia del envío a Netlify,
   que dispara el email a adrian@elgransueno.org.
   Requiere: (1) un <form hidden data-netlify="true" name="..."> en la página
   (para que Netlify lo detecte en el deploy) y (2) la notificación por email
   activada en el panel de Netlify (Forms → notifications). En local no hace
   nada (no hay Netlify): solo funciona en el sitio publicado.
   ---------------------------------------------------------------------------- */
window.egsAvisarNetlify = function (formName, campos) {
  try {
    var datos = { 'form-name': formName, 'bot-field': '' };
    if (campos) { for (var k in campos) { if (campos.hasOwnProperty(k)) datos[k] = campos[k]; } }
    var body = Object.keys(datos).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(datos[k] == null ? '' : datos[k]);
    }).join('&');
    return fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
    }).catch(function () { /* silencioso: el guardado en Supabase ya ocurrió */ });
  } catch (e) { /* nunca romper la interfaz por esto */ }
};

/* ============================================================================
   MENÚ GLOBAL DEL SITIO — el ÚNICO lugar donde se edita el menú desplegable.
   ----------------------------------------------------------------------------
   Cambiá acá un enlace, una sección o un título y se actualiza en TODAS las
   páginas a la vez. Antes había que tocar 19 archivos; ahora, solo este bloque.

   (La barra superior de cada página, con su botón propio, sigue en su HTML.
    Este bloque es solo el menú grande que se abre con la hamburguesa.)

   Para editar: cambiá el texto o el href dentro de las <li> de abajo.
   No borres la primera línea (<div class="nav-overlay" id="navOverlay" ...>)
   ni el id="navOverlay": el resto del sitio lo necesita para abrir y cerrar.
   ============================================================================ */
(function () {
  'use strict';
  var MENU = `
<div class="nav-overlay" id="navOverlay" aria-hidden="true" role="dialog" aria-label="Menú principal">
  <div class="nav-overlay-header">
    <a href="/index.html" class="nav-overlay-brand">El Gran <span>Sueño</span></a>
    <button id="navOverlayClose" class="nav-overlay-close" aria-label="Cerrar menú">
      <span>Cerrar</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  </div>
  <div class="nav-overlay-body">
    <nav class="nav-overlay-grid" aria-label="Navegación principal">
      <div class="nav-col">
        <span class="nav-col-eyebrow">Empezar</span>
        <ul>
          <li><a href="/index.html">Inicio</a></li>
          <li><a href="/nosotros.html">Cómo nació</a></li>
          <li><a href="/manifiesto.html">Manifiesto</a></li>
        </ul>
      </div>
      <div class="nav-col">
        <span class="nav-col-eyebrow">Encontrar tu lugar</span>
        <ul>
          <li><a href="/quiero-ser-parte.html">Encontrar mi lugar</a></li>
          <li><a href="/compartir-historia.html">Compartir mi historia</a></li>
          <li class="nav-featured"><a href="/mentoria.html"><span class="nav-featured-main">Mentoría con Adrián<i class="nav-featured-dot" aria-hidden="true"></i></span><span class="nav-featured-tag">Reservar una sesión gratis</span></a></li>
          <li><a href="/quiero-acompanar.html">Ser acompañante</a></li>
          <li><a href="/colaborar.html">Sostener el sueño</a></li>
        </ul>
      </div>
      <div class="nav-col">
        <span class="nav-col-eyebrow">Comunidad</span>
        <ul>
          <li><a href="/historias.html">Historias</a></li>
          <li><a href="/escuelas.html">Escuelas</a></li>
          <li><a href="/registrar-institucion.html">Registrar institución</a></li>
        </ul>
      </div>
      <div class="nav-col">
        <span class="nav-col-eyebrow">Formación</span>
        <ul>
          <li><a href="/blog.html">Escritos</a></li>
          <li><a href="/huellas-de-fe.html">Huellas de Fe</a></li>
        </ul>
      </div>
    </nav>
  </div>
  <div class="nav-overlay-footer">
    <p class="nav-overlay-quote">Nadie fue creado para caminar solo.</p>
    <div class="nav-overlay-social" aria-label="Redes sociales">
      <a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/></svg></a>
      <a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.5a2.6 2.6 0 0 0-1.8-1.85C18.5 6.2 12 6.2 12 6.2s-6.5 0-8.2.45A2.6 2.6 0 0 0 2 8.5C1.55 10.2 1.55 12 1.55 12s0 1.8.45 3.5a2.6 2.6 0 0 0 1.8 1.85c1.7.45 8.2.45 8.2.45s6.5 0 8.2-.45A2.6 2.6 0 0 0 22 15.5c.45-1.7.45-3.5.45-3.5s0-1.8-.45-3.5z"/><polygon points="10,9 15.5,12 10,15" fill="currentColor" stroke="none"/></svg></a>
      <a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.05-1.3-.15-2.5-.15-2.45 0-4.15 1.5-4.15 4.25v2.2H7.6V13h2.75v8z"/></svg></a>
      <a href="#" aria-label="Spotify"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M7.5 9.5c3-.9 6.5-.5 9 1M8 12.5c2.5-.7 5.3-.4 7.4.9M8.5 15.3c2-.5 4.2-.3 6 .7"/></svg></a>
      <a href="mailto:adrian@elgransueno.org" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></a>
    </div>
  </div>
</div>
`;
  var mount = document.getElementById('egs-nav-mount');
  if (mount) {
    mount.outerHTML = MENU;               // reemplaza el punto de montaje por el menú
  } else {
    document.body.insertAdjacentHTML('beforeend', MENU);  // respaldo por si faltara
  }
})();

/* El Gran Sueño — Scripts compartidos
   Funciones idempotentes: cada una chequea si su target existe. */
(function () {
  'use strict';

  // Activar scroll-snap solo en desktop
  if (window.matchMedia('(min-width: 900px)').matches && window.matchMedia('(hover: hover)').matches) {
    document.documentElement.classList.add('snap-enabled');
  }

  // ===== Barra de progreso =====
  const progressBar = document.getElementById('progressBar');
  function updateProgress() {
    if (!progressBar) return;
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  // ===== Mapa: ambient ↔ telling =====
  const worldMap = document.querySelector('.world-map');
  const tellingTrigger = document.querySelector('[data-map-tell-start]') || document.querySelector('.beat-name');
  const tellingEnd = document.querySelector('[data-map-tell-end]') || document.querySelector('.beat-invite');
  if (worldMap) worldMap.classList.add('ambient');
  function updateMapState() {
    if (!worldMap) return;
    if (!tellingTrigger || !tellingEnd) return;
    const t = tellingTrigger.getBoundingClientRect().top;
    const b = tellingEnd.getBoundingClientRect().bottom;
    const shouldTell = t < window.innerHeight * 0.6 && b > 0;
    worldMap.classList.toggle('telling', shouldTell);
    worldMap.classList.toggle('ambient', !shouldTell);
  }

  // ===== Nav estable =====
  const nav = document.getElementById('navbar');
  let scrollTimer = null;
  let lastY = window.scrollY;
  let scrollDownAcc = 0;

  // ===== Scroll hint =====
  const scrollHint = document.getElementById('scrollHint');
  let hintHidden = false;
  function hideScrollHint() {
    if (hintHidden || !scrollHint) return;
    scrollHint.classList.add('hidden');
    hintHidden = true;
  }

  function onScroll() {
    const y = window.scrollY;
    const dy = y - lastY;

    if (nav) {
      if (y < 40) {
        nav.classList.remove('nav-hidden');
        scrollDownAcc = 0;
      } else if (dy > 0) {
        scrollDownAcc += dy;
        if (scrollDownAcc > 60) nav.classList.add('nav-hidden');
      } else if (dy < -2) {
        nav.classList.remove('nav-hidden');
        scrollDownAcc = 0;
      }
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        nav.classList.remove('nav-hidden');
        scrollDownAcc = 0;
      }, 600);
    }

    lastY = y;
    updateMapState();
    updateProgress();
    if (y > 80) hideScrollHint();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateMapState();
  updateProgress();

  // ===== Reveal por entrada en pantalla =====
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('.beat-inner, .name-reveal, .name-flourish, [data-reveal]').forEach(el => revealObserver.observe(el));

  const firstBeatInner = document.querySelector('.beat .beat-inner');
  if (firstBeatInner) firstBeatInner.classList.add('in-view');

  // ===== Form footer con feedback honesto =====
  const form = document.getElementById('footerForm');
  if (form) {
    const btn = form.querySelector('button[type="submit"]');
    const input = form.querySelector('input[type="email"]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = (input.value || '').trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        input.focus();
        input.style.borderColor = '#e0a0a0';
        setTimeout(() => { input.style.borderColor = ''; }, 1600);
        return;
      }
      form.classList.add('sent');
      if (btn) {
        btn.textContent = 'Gracias, te avisamos ✓';
        btn.style.background = '#2E7350';   // verde "recibido" (que se note)
        btn.style.borderColor = '#2E7350';
        btn.style.color = '#fff';
      }
      try {
        const list = JSON.parse(localStorage.getItem('egs_emails') || '[]');
        if (!list.includes(val)) { list.push(val); localStorage.setItem('egs_emails', JSON.stringify(list)); }
      } catch (_) {}
      window.egsGuardar('newsletter', { email: val });
      if (window.egsAvisarNetlify) window.egsAvisarNetlify('newsletter', { email: val });
    });
  }
})();

/* ============================================================================
   WIZARD helpers (compartidos entre compartir-historia y solicitud-acompanante)
   Se exponen como window.* para poder llamarlos desde onclick inline.
   ============================================================================ */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);

  // Ir a una pantalla concreta, ocultar el resto
  window.ir = function (id) {
    const all = document.querySelectorAll('.pantalla');
    if (!all.length) return;
    all.forEach(p => p.classList.remove('activa'));
    const target = $(id);
    if (target) {
      target.classList.add('activa');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Actualizar barra de progreso interna del wizard
      const progressEl = target.querySelector('.progreso');
      if (progressEl) {
        const total = all.length;
        const idx = Array.from(all).indexOf(target);
        const pct = Math.round(((idx + 1) / total) * 100);
        progressEl.style.setProperty('--wizard-progress', pct + '%');
      }
    }
  };

  // Mostrar mensaje acompañante entre pantallas, luego seguir
  window.mostrarMsg = function (msgId, nextId) {
    const el = $(msgId);
    if (!el) { if (nextId) window.ir(nextId); return; }
    el.classList.add('visible');
    // Guardar el siguiente destino para el botón interno
    el.dataset.next = nextId || '';
    // Scroll al mensaje
    setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  };

  // Habilitar/deshabilitar botón según haya texto
  window.habBtn = function (btnId) {
    const btn = $(btnId);
    if (!btn) return;
    // Buscar el textarea o input hermano en la misma pantalla
    const pantalla = btn.closest('.pantalla');
    if (!pantalla) return;
    const inputs = pantalla.querySelectorAll('textarea, input[type="text"], input[type="email"]');
    // Habilitar solo si al menos un textarea o el primer input tiene contenido
    let hasContent = false;
    inputs.forEach(inp => {
      if ((inp.value || '').trim().length > 0) hasContent = true;
    });
    btn.disabled = !hasContent;
  };

  // Toggle en checkbox-opciones (multi selección)
  window.toggleOp = function (el) {
    if (!el) return;
    el.classList.toggle('selected');
  };

  // Radio (una sola selección)
  window.selRadio = function (el, grupoId, btnId) {
    if (!el) return;
    const grupo = $(grupoId);
    if (grupo) {
      grupo.querySelectorAll('.radio-opcion, .radio-op').forEach(o => o.classList.remove('selected'));
    }
    el.classList.add('selected');
    if (btnId) { const b = $(btnId); if (b) b.disabled = false; }
  };

  // Recopilar respuestas del wizard y enviar (simulado localStorage)
  window.recopilarRespuestas = function () {
    const data = {};
    document.querySelectorAll('textarea, input[type="text"], input[type="email"]').forEach(inp => {
      if (inp.id) data[inp.id] = inp.value || '';
    });
    document.querySelectorAll('.opcion.selected .opcion-txt').forEach((t, i) => {
      data['opcion_' + i] = t.textContent;
    });
    document.querySelectorAll('.radio-opcion.selected .radio-txt, .radio-op.selected .radio-txt').forEach((t, i) => {
      data['radio_' + i] = t.textContent;
    });
    data['timestamp'] = new Date().toISOString();
    try {
      const key = 'egs_wizard_' + (location.pathname.split('/').pop() || 'form');
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.push(data);
      localStorage.setItem(key, JSON.stringify(arr));
    } catch (_) {}
    // Guardar también en la base, con nombre de formulario según la página
    var pagina = (location.pathname.split('/').pop() || '').toLowerCase();
    var formName = pagina.indexOf('solicitud-acompanante') >= 0 ? 'acompanante'
                 : pagina.indexOf('compartir-historia')    >= 0 ? 'historia'
                 : 'wizard';
    window.egsGuardar(formName, data);
    // Aviso por email (Netlify) para compartir-historia y solicitud-acompanante
    if (window.egsAvisarNetlify) {
      var email = '', nombre = '', resumen = [];
      for (var k in data) {
        if (!data[k] || k === 'timestamp') continue;
        var lk = k.toLowerCase();
        if (!email && (lk.indexOf('email') >= 0 || lk.indexOf('correo') >= 0)) email = data[k];
        else if (!nombre && lk.indexOf('nombre') >= 0) nombre = data[k];
        resumen.push(data[k]);
      }
      window.egsAvisarNetlify(formName, { nombre: nombre, email: email, mensaje: resumen.join(' · ').slice(0, 600) });
    }
    // ir a la última pantalla si existe
    const all = document.querySelectorAll('.pantalla');
    const last = all[all.length - 1];
    if (last) window.ir(last.id);
  };

  // Actualizar el año en footers dinámicos
  document.querySelectorAll('#year, .footer-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();

/* ============================================================================
   MENÚ overlay — toggle + cierre con Escape + marcar página actual
   ============================================================================ */
(function () {
  'use strict';
  const btn = document.getElementById('navMenuBtn');
  const overlay = document.getElementById('navOverlay');
  const closeBtn = document.getElementById('navOverlayClose');
  if (!btn || !overlay) return;

  function openMenu() {
    overlay.classList.add('open');
    document.body.classList.add('menu-open');
    overlay.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    overlay.classList.remove('open');
    document.body.classList.remove('menu-open');
    overlay.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
  }
  btn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeMenu(); });
  // Cerrar al hacer click en un link
  overlay.querySelectorAll('a[href]').forEach(a => {
    if (a.getAttribute('href').startsWith('#')) return;
    a.addEventListener('click', () => setTimeout(closeMenu, 100));
  });

  // Marcar la página actual como "current"
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  overlay.querySelectorAll('a[href]').forEach(a => {
    const href = (a.getAttribute('href') || '').split('/').pop().toLowerCase();
    if (href === path) a.classList.add('current');
  });
})();

/* ============================================================================
   COMPARTIR EN REDES — se agrega sola al final de cada artículo (blog, huellas,
   escritos). Detecta .long-prose y usa la URL + título de la página. En celular
   ofrece el menú nativo (Web Share API: Instagram, WhatsApp, etc.).
   ============================================================================ */
(function () {
  var prose = document.querySelector('.long-prose');
  if (!prose || document.querySelector('.egs-compartir')) return;
  var url = location.href.split('#')[0];
  var h1 = document.querySelector('h1');
  var titulo = ((h1 ? h1.textContent : document.title) || '').trim();
  var texto = titulo ? (titulo + ' · El Gran Sueño') : 'El Gran Sueño';
  var e = encodeURIComponent;
  var ic = {
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 1.76.46 3.45 1.32 4.96L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm4.52 11.99c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.23-1.48-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.4-.42-.55-.42h-.48c-.16 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.75.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.19.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H17V3.6c-.3-.05-1.3-.15-2.5-.15-2.45 0-4.15 1.5-4.15 4.25v2.2H7.6V13h2.75v8z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.01 4.13H5.05z"/></svg>',
    tg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.94 4.9 18.9 19.2c-.22 1-.82 1.25-1.67.78l-4.64-3.42-2.24 2.16c-.25.24-.46.45-.94.45l.33-4.72L18.7 6.1c.37-.33-.08-.51-.58-.18L7.4 12.68l-4.6-1.44c-1-.31-1.02-1 .21-1.48l17.98-6.93c.83-.31 1.56.19 1.29 1.44z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.07 0l2-2a5 5 0 1 0-7.07-7.07l-1 1"/><path d="M14 11a5 5 0 0 0-7.07 0l-2 2a5 5 0 1 0 7.07 7.07l1-1"/></svg>',
    nat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>'
  };
  var redes = [
    { k: 'WhatsApp', c: 'red-wa', href: 'https://wa.me/?text=' + e(texto + ' ' + url), i: ic.wa },
    { k: 'Facebook', c: 'red-fb', href: 'https://www.facebook.com/sharer/sharer.php?u=' + e(url), i: ic.fb },
    { k: 'X', c: 'red-x', href: 'https://twitter.com/intent/tweet?text=' + e(texto) + '&url=' + e(url), i: ic.x },
    { k: 'Telegram', c: 'red-tg', href: 'https://t.me/share/url?url=' + e(url) + '&text=' + e(texto), i: ic.tg }
  ];
  var bar = document.createElement('div');
  bar.className = 'egs-compartir';
  var html = '<span class="egs-compartir-label">Compartir</span><div class="egs-compartir-btns">';
  redes.forEach(function (r) {
    html += '<a class="egs-compartir-btn ' + r.c + '" href="' + r.href + '" target="_blank" rel="noopener" aria-label="Compartir en ' + r.k + '" title="' + r.k + '">' + r.i + '</a>';
  });
  html += '<button type="button" class="egs-compartir-btn egs-compartir-copiar" aria-label="Copiar enlace" title="Copiar enlace">' + ic.link + '</button></div>';
  bar.innerHTML = html;
  prose.parentNode.insertBefore(bar, prose.nextSibling);

  var copiar = bar.querySelector('.egs-compartir-copiar');
  copiar.addEventListener('click', function () {
    var ok = function () {
      copiar.classList.add('copiado'); copiar.setAttribute('title', '¡Enlace copiado!');
      setTimeout(function () { copiar.classList.remove('copiado'); copiar.setAttribute('title', 'Copiar enlace'); }, 1800);
    };
    try {
      if (navigator.clipboard) { navigator.clipboard.writeText(url).then(ok, ok); }
      else {
        var t = document.createElement('textarea'); t.value = url; document.body.appendChild(t);
        t.select(); document.execCommand('copy'); document.body.removeChild(t); ok();
      }
    } catch (_) { ok(); }
  });

  // El ícono de Facebook va SIEMPRE directo al compartir de Facebook (en compu y en celular).
  // Además, si el navegador lo permite, se agrega un botón "Compartir" con la hoja nativa
  // (útil en el celular para llegar a cualquier app: Facebook, WhatsApp, Instagram, etc.).
  if (navigator.share) {
    var nat = document.createElement('button');
    nat.type = 'button';
    nat.className = 'egs-compartir-btn egs-compartir-nativo';
    nat.setAttribute('aria-label', 'Compartir');
    nat.innerHTML = ic.nat + '<span>Compartir</span>';
    nat.addEventListener('click', function () {
      navigator.share({ title: titulo, text: texto, url: url }).catch(function () {});
    });
    var btns = bar.querySelector('.egs-compartir-btns');
    btns.insertBefore(nat, btns.firstChild);
  }
})();
