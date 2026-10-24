// EL SENDERO: la barra de progreso de todas las páginas es un camino con una pequeña historia.
// Archivo compartido (lo carga egs.js). En la home se sincroniza con la luz del relato 3D.
// Una pequeña historia que avanza con el scroll.
// El mochilero cruza una montaña y un bosque, nada un lago, encuentra a alguien acostado que se levanta y
// lo acompaña, en el pueblo se suma otro, los tres suben a un auto, después a un barco y llegan a una isla.
// Cada escena aparece justo delante de él y queda atrás. Si se sube la página, el viaje vuelve.
(function () {
 // Si la página no lo trae, se arma acá (todas las páginas comparten el mismo sendero)
 if (!document.querySelector('.sendero-top')) {
  var envoltura = document.createElement('div');
  envoltura.innerHTML = "\u003cdiv class=\"sendero-top\" aria-hidden=\"true\"\u003e\r\n \u003csvg class=\"sendero-perfil\" viewBox=\"0 0 1000 40\" preserveAspectRatio=\"none\"\u003e\r\n  \u003cdefs\u003e\u003cclipPath id=\"senderoHecho\"\u003e\u003crect x=\"0\" y=\"0\" height=\"40\" width=\"0\"/\u003e\u003c/clipPath\u003e\u003c/defs\u003e\r\n  \u003cpath class=\"sendero-falta\" d=\"M0 33 L110 33 C140 33 160 12 190 9 C215 7 235 30 262 33 L332 33 M418 33 L768 33 M898 33 C915 33 925 25 945 25 C965 25 975 33 990 33 L1000 33\"/\u003e\r\n  \u003cpath class=\"sendero-hecho\" clip-path=\"url(#senderoHecho)\" d=\"M0 33 L110 33 C140 33 160 12 190 9 C215 7 235 30 262 33 L332 33 M418 33 L768 33 M898 33 C915 33 925 25 945 25 C965 25 975 33 990 33 L1000 33\"/\u003e\r\n  \u003cpath class=\"sendero-agua\" d=\"M334 34 q4.5 -2.4 9 0 t9 0 t9 0 t9 0 t9 0 t9 0 t9 0 t9 0 t9 0 M770 34 q4.5 -2.4 9 0 t9 0 t9 0 t9 0 t9 0 t9 0 t9 0 t9 0 t9 0 t9 0 t9 0 t9 0 t9 0 t9 0\"/\u003e\r\n \u003c/svg\u003e\r\n \u003cdiv class=\"escenas\"\u003e\u003c/div\u003e\r\n \u003cdiv class=\"viajeros\"\u003e\u003c/div\u003e\r\n\u003c/div\u003e";
  document.body.insertBefore(envoltura.firstElementChild, document.body.firstChild);
 }
 var tira = document.querySelector('.sendero-top');
 if (!tira) return;
 var nav = document.getElementById('navbar');
 var peli = document.getElementById('pelicula');
 var portada = document.querySelector('.st-hero-top');
 var capaEscenas = tira.querySelector('.escenas'), capaViajeros = tira.querySelector('.viajeros');
 var perfil = tira.querySelector('.sendero-falta'), corte = tira.querySelector('#senderoHecho rect');

 // Dibujos (todos miran a la derecha, en el color del sendero)
 var D = {
  caminante: '<svg viewBox="0 0 17 23" width="17" height="23" fill="currentColor"><g class="cuerpo"><circle cx="9.6" cy="2.6" r="2.2"/><rect x="2.4" y="5.6" width="4.6" height="7.6" rx="1.6"/><path d="M7.4 5.8h3.2a1.3 1.3 0 0 1 1.3 1.3v5.9H7.4z"/><path d="M11.6 7.4l2.6 3.4-0.9 0.7-2.4-2.9z"/></g><rect class="pierna pierna-a" x="8.1" y="12.6" width="1.9" height="9.6" rx="0.95"/><rect class="pierna pierna-b" x="9.5" y="12.6" width="1.9" height="9.6" rx="0.95"/><rect x="14.2" y="8.6" width="0.9" height="14" rx="0.45" transform="rotate(10 14.6 15.6)"/></svg>',
  companero: '<svg viewBox="0 0 17 23" width="16" height="22" fill="currentColor"><g class="cuerpo"><circle cx="9" cy="2.6" r="2.2"/><path d="M6.6 5.8h3.6a1.3 1.3 0 0 1 1.3 1.3v5.9H6.6z"/><path d="M11 7.4l2.4 3.2-0.9 0.7-2.2-2.7z"/></g><rect class="pierna pierna-a" x="7.4" y="12.6" width="1.9" height="9.6" rx="0.95"/><rect class="pierna pierna-b" x="8.8" y="12.6" width="1.9" height="9.6" rx="0.95"/></svg>',
  nadador: '<svg viewBox="0 0 20 10" width="20" height="10" fill="currentColor"><circle cx="13" cy="4" r="2.2"/><path class="brazo" d="M4 6 q4 -6 8 -1" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  acostado: '<svg viewBox="0 0 22 8" width="22" height="8" fill="currentColor"><circle cx="3" cy="5" r="2.2"/><rect x="5.6" y="3.6" width="15" height="3.2" rx="1.6"/></svg>',
  sentado: '<svg viewBox="0 0 14 16" width="14" height="16" fill="currentColor"><circle cx="6" cy="2.6" r="2.2"/><path d="M4 5.6h4a1.2 1.2 0 0 1 1.2 1.2v5H4z"/><rect x="6" y="10.4" width="7" height="1.9" rx="0.9"/><rect x="11.4" y="10.4" width="1.9" height="5.4" rx="0.9"/></svg>',
  motorhome: '<svg viewBox="0 0 44 18" width="44" height="18" fill="currentColor"><rect x="5" y="0" width="14" height="2.6" rx="1"/><path d="M1 14V5C1 3.6 2.1 2.6 3.5 2.6H30c1 0 1.9 0.5 2.4 1.3L36 10l5 1.2c1.2 0.3 2 1.3 2 2.5V14z"/><rect x="5" y="5.2" width="6" height="3.6" rx="0.8" fill="rgba(0,0,0,0.4)"/><rect x="13" y="5.2" width="6" height="3.6" rx="0.8" fill="rgba(0,0,0,0.4)"/><path d="M31.5 5.2l3 4.8h-6V5.2z" fill="rgba(0,0,0,0.4)"/><circle class="rueda" cx="10" cy="15" r="2.8"/><circle class="rueda" cx="33" cy="15" r="2.8"/></svg>',
  carpa: '<svg viewBox="0 0 26 14" width="26" height="14" fill="currentColor"><path fill-rule="evenodd" d="M0 14L13 0l13 14zM11 14l2-6 2 6z"/></svg>',
  dormido: '<svg viewBox="0 0 24 9" width="24" height="9" fill="currentColor"><circle cx="3" cy="6" r="2.2"/><rect x="5.4" y="4.4" width="17" height="3.6" rx="1.8"/></svg>',
  luz: '<svg viewBox="0 0 10 10" width="10" height="10"><circle cx="5" cy="5" r="2.4" fill="currentColor"/></svg>',
  agachado: '<svg viewBox="0 0 17 23" width="17" height="23" fill="currentColor"><circle cx="12" cy="9.4" r="2.2"/><rect x="3" y="9" width="4.6" height="7" rx="1.6"/><path d="M7.4 10.6h3.4l2 4.4-1.4 0.7-1.6-3H7.4z"/><path d="M7.4 15.4h4.6l0.8 6.8h-1.9l-0.6-4.8H7.4z"/><rect x="5" y="16" width="1.9" height="6.2" rx="0.9"/></svg>',
  caido: '<svg viewBox="0 0 24 10" width="24" height="10" fill="currentColor"><circle cx="21" cy="7" r="2.2"/><rect x="4" y="5.2" width="15" height="3.4" rx="1.7"/><rect x="7" y="1.4" width="7" height="4.2" rx="1.5"/><rect x="0" y="7" width="5" height="1.8" rx="0.9"/></svg>',
  fuego: '<svg viewBox="0 0 16 17" width="16" height="17"><path class="llama" d="M8 1C10 5 12 6 11 10c-0.5 2.5-2 3-3 3-1.5 0-3-1-3-3 0-2 2-3 1.5-5.5C7.5 5.5 8 4 8 1z" fill="#E9874A"/><path class="llama llama-2" d="M8 6c1 2 2 3 1.5 5-0.5 1.3-2.5 1.3-2.9 0C6.3 9.6 7.6 9 8 6z" fill="#FFE2C2"/><path d="M2 16L14 14M2 14L14 16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',  auto: '<svg viewBox="0 0 34 14" width="34" height="14" fill="currentColor"><path d="M2 10V7.5C2 6.4 2.8 5.6 3.9 5.4L8 4.6 11.5 1.2C12 0.7 12.7 0.4 13.4 0.4H22c0.8 0 1.5 0.4 2 1L27 4.6 31 5.4C32 5.6 32.8 6.5 32.8 7.5V10z"/><circle class="rueda" cx="9" cy="11" r="2.6"/><circle class="rueda" cx="26" cy="11" r="2.6"/></svg>',
  barco: '<svg viewBox="0 0 30 22" width="30" height="22" fill="currentColor"><path d="M2 15h26l-3.4 5.2H5.4z"/><path d="M15 1v13H6z"/><path d="M16.4 3v11h7.6z" opacity="0.75"/></svg>',
  pino: '<svg viewBox="0 0 12 18" width="12" height="18" fill="currentColor"><path d="M6 0l5 7H8.4l3.6 6H7v5H5v-5H0l3.6-6H1z"/></svg>',
  casa: '<svg viewBox="0 0 12 11" width="12" height="11" fill="currentColor"><path d="M0 11V5L6 0l6 5v6z"/></svg>',
  palmera: '<svg viewBox="0 0 16 20" width="16" height="20" fill="currentColor"><path d="M8 20c0-6 0.6-10 1.6-13l-1-0.4C7.4 9.8 6.8 14 6.6 20z"/><path d="M9 6C7 3 3 3 0.5 5 3 4.6 5.4 5 8 6.8 5.6 6.6 3 8.4 2 11 4.6 8.8 7 7.6 9 7.4 9.6 9 10.6 11.8 11 14 11.6 11 11 8.4 9.8 7 12 7 14 7.8 16 9.6 14.8 6.6 12 5.4 9.8 5.8 11.6 4 13.8 3.4 15.6 3.8 13 1.8 10.4 2.6 9 6z"/></svg>'
 };
 // La historia sobre el sendero (x de 0 a 1000)
 var ESCENAS = [
  ['carpa', 22], ['fuego', 318],
  ['pino', 262], ['pino', 274], ['pino', 286], ['pino', 297], ['pino', 307],
  ['acostado', 462, 'p1'],
  ['casa', 512], ['casa', 527], ['casa', 545], ['casa', 560], ['sentado', 584, 'p2'], ['casa', 600],
  ['palmera', 946]
 ];
 var TRAMOS = { lago: [334, 416], auto: [640, 766], barco: [770, 896] };
 var SE_SUMA = [462, 584];   // dónde se suman los compañeros

 function crear(tipo, capa) { var d = document.createElement('div'); d.className = 'sprite s-' + tipo; d.innerHTML = D[tipo]; capa.appendChild(d); return d; }
 var escenas = ESCENAS.map(function (e) { var el = crear(e[0], capaEscenas); return { el: el, x: e[1], id: e[2] || '' }; });
 var auto = crear('motorhome', capaEscenas), barco = crear('barco', capaEscenas), nadador = crear('nadador', capaViajeros);
 var yo = crear('caminante', capaViajeros);
 var dormido = crear('dormido', capaViajeros), agachado = crear('agachado', capaViajeros), caido = crear('caido', capaViajeros);
 var luzSuelo = crear('luz', capaEscenas), farol = crear('luz', capaViajeros);
 var POSES = { duerme: [0, 14], encuentra: [37, 49], cae: [224, 238] }, LUZ_X = 47;
 var amigos = [crear('companero', capaViajeros), crear('companero', capaViajeros)];

 // El relieve del sendero: alto del camino para cada x
 var relieve = [];
 if (perfil && perfil.getTotalLength) { var L = perfil.getTotalLength(); for (var i = 0; i <= 600; i++) { var p = perfil.getPointAtLength(L * i / 600); relieve.push([p.x, p.y]); } relieve.sort(function (a, b) { return a[0] - b[0]; }); }
 function altoEn(xv) {
  for (var k = 1; k < relieve.length; k++) { if (relieve[k][0] >= xv) { var a = relieve[k - 1], b = relieve[k]; if (b[0] - a[0] > 40) return 33; var t = (xv - a[0]) / Math.max(0.001, b[0] - a[0]); return a[1] + (b[1] - a[1]) * t; } }
  return 33;
 }
 // ¿Está de noche debajo del menú? En la home lo decide el relato; en el resto, el fondo de lo que pasa por
 // debajo del sendero (se mide su luz, así sirve para cualquier sección oscura sin anotarla)
 function luz(txt) {
  var p = txt.split(',').map(parseFloat);
  if (p.length > 3 && p[3] < 0.5) return -1;
  return (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255;
 }
 function fondoOscuro(el) {
  for (; el && el !== document.documentElement; el = el.parentElement) {
   var cs = getComputedStyle(el), m, l;
   if (cs.backgroundImage && cs.backgroundImage !== 'none' && (m = cs.backgroundImage.match(/rgba?\(([^)]+)\)/))) { l = luz(m[1]); if (l >= 0) return l < 0.4; }
   if ((m = cs.backgroundColor.match(/rgba?\(([^)]+)\)/))) { l = luz(m[1]); if (l >= 0) return l < 0.4; }
  }
  return false;
 }
 function esNoche(y) {
  if (document.body.classList.contains('cine-on') && peli) return y < peli.offsetTop + peli.offsetHeight - window.innerHeight * 2.2;
  var nb = nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0;
  return fondoOscuro(document.elementFromPoint(window.innerWidth / 2, Math.min(window.innerHeight - 1, nb + 48)));
 }
 function en(tramo, x) { return x >= tramo[0] && x <= tramo[1]; }

 var ultimoY = window.scrollY, quieto = null, pedido = false, mira = 1, desplaza = 0;
 var perfilSvg = tira.querySelector('.sendero-perfil');
 function poner(el, xv, W, H, mostrar, ang) {
  el.style.opacity = mostrar ? '1' : '0';
  if (!mostrar) return;
  var w = el.firstChild.getAttribute('width') * 1, h = el.firstChild.getAttribute('height') * 1;
  var xp = xv / 1000 * W - desplaza, yp = altoEn(xv) / 40 * H;
  el.style.transform = 'translate(' + (xp - w / 2).toFixed(1) + 'px,' + (yp - h).toFixed(1) + 'px) rotate(' + (ang || 0).toFixed(1) + 'deg) scaleX(' + mira + ')';
 }
 function pintar() {
  pedido = false;
  var y = window.scrollY, doc = document.documentElement;
  var max = Math.max(1, doc.scrollHeight - doc.clientHeight);
  var Wp = tira.clientWidth || window.innerWidth, H = tira.clientHeight || 40;
  // En el celular el camino mide más que la pantalla (cada escena con su espacio) y se desliza con él
  var W = Math.max(Wp, 1000);
  var avance = Math.min(1, Math.max(0, y / max));
  // Al empezar camina rápido hasta la piedrita (la toca al 15 % de la portada); el resto de la historia ocupa
  // hasta las tres cuartas partes de la página
  var y0 = (peli && document.body.classList.contains('cine-on')) ? peli.offsetTop * 0.15 : max * 0.04;
  var x = y < y0 ? 6 + 40 * (y / y0) : 46 + Math.min(1, (y - y0) / Math.max(1, max * 0.74 - y0)) * 948;
  tira.style.setProperty('--nav-b', (nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0) + 'px');
  document.body.classList.toggle('en-noche', esNoche(y));
  if (y !== ultimoY) {
   mira = y < ultimoY ? -1 : 1;
   tira.classList.add('camina');
   clearTimeout(quieto);
   quieto = setTimeout(function () { tira.classList.remove('camina'); }, 220);
  }
  ultimoY = y;
  if (corte) corte.setAttribute('width', x.toFixed(1));
  desplaza = W > Wp ? Math.max(0, Math.min(W - Wp, x / 1000 * W - Wp * 0.38)) : 0;
  perfilSvg.style.width = W + 'px'; perfilSvg.style.transform = 'translateX(' + (-desplaza).toFixed(1) + 'px)';

  // Las escenas aparecen un poco antes de que él llegue y quedan atrás
  escenas.forEach(function (e) {
   var cerca = Math.max(0, Math.min(1, (x + 170 - e.x) / 50));
   var unido = (e.id === 'p1' && x >= SE_SUMA[0]) || (e.id === 'p2' && x >= SE_SUMA[1]);
   var w = e.el.firstChild.getAttribute('width') * 1, h = e.el.firstChild.getAttribute('height') * 1;
   e.el.style.opacity = unido ? '0' : (cerca * (x >= e.x ? 1 : 0.42)).toFixed(2);
   e.el.style.transform = 'translate(' + (e.x / 1000 * W - desplaza - w / 2).toFixed(1) + 'px,' + (altoEn(e.x) / 40 * H - h + (e.id === 'p1' ? 1 : 0)).toFixed(1) + 'px)';
  });
  // El auto espera estacionado y después lleva a todos; el barco espera en la costa
  var enAuto = en(TRAMOS.auto, x), enBarco = en(TRAMOS.barco, x), nadando = en(TRAMOS.lago, x);
  var xAuto = x < TRAMOS.auto[0] ? TRAMOS.auto[0] : Math.min(x, TRAMOS.auto[1]);
  var xBarco = x < TRAMOS.barco[0] ? TRAMOS.barco[0] + 8 : Math.min(x, TRAMOS.barco[1]);
  var mm = mira; mira = 1;
  poner(auto, xAuto, W, H, x + 170 > TRAMOS.auto[0], 0);
  auto.style.opacity = (x + 170 > TRAMOS.auto[0]) ? Math.max(0, Math.min(1, (x + 170 - TRAMOS.auto[0]) / 50)) * (x > TRAMOS.auto[1] + 30 ? 0.5 : 1) : 0;
  poner(barco, xBarco, W, H + 4, x + 170 > TRAMOS.barco[0], 0);
  barco.style.opacity = (x + 170 > TRAMOS.barco[0]) ? Math.max(0, Math.min(1, (x + 170 - TRAMOS.barco[0]) / 50)) * (x > TRAMOS.barco[1] + 30 ? 0.5 : 1) : 0;
  tira.classList.toggle('andando', enAuto || enBarco);
  mira = mm;

  // El viajero: camina, nada o va en el vehículo; inclinado según la cuesta
  var cuesta = (altoEn(x + 8) - altoEn(x - 8)) / 40 * H / (16 / 1000 * W);
  var ang = Math.max(-28, Math.min(28, Math.atan(cuesta) * 180 / Math.PI * 0.75));
  var pose = en(POSES.duerme, x) ? 'duerme' : en(POSES.encuentra, x) ? 'encuentra' : en(POSES.cae, x) ? 'cae' : '';
  var libre = !nadando && !enAuto && !enBarco;
  poner(yo, x, W, H, libre && !pose, ang);
  poner(dormido, x + 8, W, H, pose === 'duerme', 0);
  poner(agachado, x, W, H, pose === 'encuentra', 0);
  poner(caido, x, W, H, pose === 'cae', 0);
  // La luz: está en el suelo hasta que la levanta; entonces entra en él
  var mmL = mira; mira = 1; poner(luzSuelo, LUZ_X, W, H - 1, x < LUZ_X - 2 && x + 170 > LUZ_X && !document.body.classList.contains('cine-on'), 0); mira = mmL;
  var tieneLuz = x >= LUZ_X - 2, recien = x >= LUZ_X - 2 && x < LUZ_X + 28;
  [yo, dormido, agachado, caido].forEach(function (s) { s.classList.toggle('con-luz', tieneLuz); s.classList.toggle('recien', recien); if (s.style.opacity === '1' && !tieneLuz) s.style.opacity = '0.5'; });
  amigos.forEach(function (a) { a.classList.add('con-luz'); });
  farol.style.opacity = '0';
  // La piedrita de luz: desde acá sale la luz grande que baja a la Tierra (la escena 3D lee este punto)
  var nbH = nav ? Math.max(0, nav.getBoundingClientRect().bottom) : 0;
  window.__luzSendero = { x: LUZ_X / 1000 * W - desplaza, y: nbH + altoEn(LUZ_X) / 40 * H - 5 };
  poner(nadador, x, W, H + 3, nadando, 0);
  // Los compañeros caminan detrás; en el auto y el barco van adentro
  amigos.forEach(function (a, i) {
   var xa = x - (i + 1) * 16 * mira * (1000 / W);
   var unido = x >= SE_SUMA[i];
   var oculto = en(TRAMOS.auto, xa) || en(TRAMOS.barco, xa) || enAuto || enBarco;
   poner(a, xa, W, H, unido && !oculto && !en(TRAMOS.lago, xa), 0);
  });
 }
 function pedir() { if (!pedido) { pedido = true; requestAnimationFrame(pintar); } }
 window.addEventListener('scroll', pedir, { passive: true });
 window.addEventListener('resize', pedir);
 setInterval(pedir, 400);
 pintar();
})();
