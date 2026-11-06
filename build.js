/* ============================================================================
   EL GRAN SUEÑO - Generador de páginas (build, sin dependencias)
   ----------------------------------------------------------------------------
   Convierte lo que se escribe en el panel (content/blog.json, content/huellas.json)
   en PÁGINAS ESTÁTICAS DE VERDAD, fuertes para Google:
     · blog/<slug>.html    (URL: /blog/<slug>)
     · huella/<slug>.html   (URL: /huella/<slug>)
   Cada página lleva el texto ya "impreso" en el HTML + title/description/canonical +
   Open Graph + JSON-LD (Article). Además regenera sitemap.xml con TODO el sitio.
   Corre en Netlify con `node build.js` (sin npm install → rapidísimo, casi sin crédito).
   ============================================================================ */
const fs = require('fs');
const path = require('path');

const SITE = 'https://elgransueno.org';
const PILAR = { identidad:'Identidad', proposito:'Propósito', reino:'Reino', caracter:'Carácter', comunidad:'Comunidad', dones:'Dones', 'gran-comision':'Gran Comisión', santificacion:'Santificación', servicio:'Servicio' };

function leerJSON(f) { try { return JSON.parse(fs.readFileSync(f, 'utf8')).posts || []; } catch (e) { return []; } }
function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function inline(s) {
  return esc(s)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img class="blog-img" src="$2" alt="$1" loading="lazy">')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}
function md(t) {
  return String(t || '').split(/\n\s*\n/).map(function (b) {
    b = b.trim(); if (!b) return '';
    if (b.indexOf('### ') === 0) return '<h3>' + inline(b.slice(4)) + '</h3>';
    if (b.indexOf('## ') === 0)  return '<h2>' + inline(b.slice(3)) + '</h2>';
    if (b.indexOf('> ') === 0)   return '<blockquote>' + inline(b.replace(/^> ?/gm, '')) + '</blockquote>';
    return '<p>' + inline(b) + '</p>';
  }).join('\n');
}
function textoPlano(t) { return String(t || '').replace(/[#>*!\[\]()]/g, '').replace(/\s+/g, ' ').trim(); }
function fmtFecha(iso) { if (!iso) return ''; var m=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']; var p=iso.split('-'); return m[parseInt(p[1],10)-1]+' '+p[0]; }

var HEAD_COMUN = `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#6B1A2B">
<meta name="robots" content="index,follow">
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Crimson+Pro:ital,wght@0,300..600;1,300..600&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/estilos-egs.css">`;

function nav(volverHref, volverTxt) {
  return `<nav class="egs-nav" id="navbar"><div class="nav-left">
  <button class="nav-menu-btn" id="navMenuBtn" aria-label="Abrir menú" aria-expanded="false" aria-controls="navOverlay"><span></span><span></span><span></span></button>
  <a href="/index.html" class="nav-logo">El Gran <span>Sueño</span></a></div>
  <a href="${volverHref}" class="nav-cta">${volverTxt}</a></nav>
<div id="egs-nav-mount"></div>`;
}
var FOOTER = `<footer class="egs-footer">
  <div class="footer-divider" aria-hidden="true"></div>
  <p class="footer-manifest">Personas de distintos lugares, historias y llamados,<br>descubriendo juntas el Gran Sueño de Dios.</p>
  <p class="footer-line">Nadie fue creado para caminar solo.</p>
  <p class="footer-suscri-nota">Una vez al mes, algo breve que te anime en el camino. Podés salirte cuando quieras.</p>
  <form class="footer-form" id="footerForm" onsubmit="return false;" aria-label="Suscribite"><input type="email" placeholder="Tu correo electrónico" required aria-label="Correo electrónico"><button type="submit">Quiero recibir novedades</button></form>
  <div class="footer-social" aria-label="Redes sociales">
    <a href="https://instagram.com/adrianencamino" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/></svg></a>
    <a href="mailto:adrian@elgransueno.org" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg></a>
  </div>
  <p class="footer-meta">Personas de distintos lugares, caminando juntos en la Gran Comisión <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" style="vertical-align:-2px;opacity:.85;margin:0 .1em" role="img" aria-label="El mundo"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/></svg> © El Gran Sueño</p>
  <p class="footer-legal"><a href="/privacidad.html">Privacidad</a><a href="/cookies.html">Cookies</a><a href="/terminos.html">Términos</a></p>
</footer>
<script src="/assets/egs.js"></script>`;

function jsonLd(o) { return '<script type="application/ld+json">' + JSON.stringify(o) + '</script>'; }

// Contador de lecturas (assets/vistas.js): suma una apertura con el mismo slug que usan
// blog.html y huellas-de-fe.html para mostrar el número y ordenar por "Más leídos".
function contadorLecturas(slug) {
  return '<script src="/assets/vistas.js"></script><script>if (typeof egsTrackVista === "function") egsTrackVista(' + JSON.stringify(slug) + ');</script>';
}

// Imagen de previsualización para redes (Facebook, WhatsApp, X):
//   1) la portada del post si la tiene   2) su tarjeta generada por og-card.mjs   3) la de marca.
//   Las tarjetas se generan en el build (og-card.mjs) en assets/og/<tipo>/<slug>.png
function ogImagen(p, tipo) {
  if (p && p.imagen) return p.imagen.indexOf('http') === 0 ? p.imagen : SITE + (p.imagen[0] === '/' ? '' : '/') + p.imagen;
  if (p && p.slug && tipo) { try { if (fs.existsSync(path.join(__dirname, 'assets', 'og', tipo, p.slug + '.jpg'))) return SITE + '/assets/og/' + tipo + '/' + p.slug + '.jpg'; } catch (e) {} }
  return SITE + '/assets/og-marca.jpg';
}
function ogImageMetas(p, tipo) {
  var img = ogImagen(p, tipo);
  // Todas las imágenes de previsualización son 1200x630 (tamaño recomendado por Facebook).
  var w = '1200', h = '630';
  var mime = img.slice(-4) === '.jpg' ? 'image/jpeg' : 'image/png';
  return '<meta property="og:image" content="' + img + '"><meta property="og:image:type" content="' + mime + '"><meta property="og:image:width" content="' + w + '"><meta property="og:image:height" content="' + h + '"><meta property="og:image:alt" content="El Gran Sueño"><meta name="twitter:image" content="' + img + '">';
}

// Estilos propios de la página de escrito: tarjeta de raíces + bloque de invitación.
function bloqueRaices(r) {
  if (!r) return '';
  var items = (r.items || []).map(function (it) { return '<li>' + inline(it) + '</li>'; }).join('');
  return `<section class="art-raices"><div class="art-raices-inner">
${r.pregunta ? '<h2 class="art-raices-q">' + esc(r.pregunta) + '</h2>' : ''}
${r.intro ? '<p class="art-raices-intro">' + esc(r.intro) + '</p>' : ''}
<ul class="art-raices-list">${items}</ul>
${r.cierre ? '<p class="art-raices-cierre">' + inline(r.cierre) + '</p>' : ''}
</div></section>`;
}

// ---- Video de YouTube del escrito ----
// Se muestra la portada del video; el reproductor (youtube-nocookie) se carga recién al tocar play,
// así la página no le habla a YouTube mientras se lee. Si el video todavía no es público
// (programado), el bloque queda oculto y se muestra solo a partir de su fecha.
function videoFuturo(p) { return !!(p.videoFecha && new Date(p.videoFecha) > new Date()); }
function durTexto(iso) {
  var m = String(iso || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/); if (!m) return '';
  var h = +(m[1] || 0), min = +(m[2] || 0) + (+(m[3] || 0) >= 30 ? 1 : 0);
  if (min === 60) { h++; min = 0; }
  return h ? h + ' h' + (min ? ' ' + min + ' min' : '') : min + ' min';
}
// Va el texto primero y el video al final (lo mira quien ya leyó y quiere más). Arriba, en la
// cabecera, solo un aviso chico que baja al video para quien prefiere escuchar.
function ocultoHasta(p) { return videoFuturo(p) ? ' hidden data-desde="' + esc(p.videoFecha) + '"' : ''; }
function avisoVideo(p) {
  if (!p.video) return '';
  var dur = durTexto(p.videoDuracion);
  var id = esc(p.video), reloj = durReloj(p.videoDuracion);
  return '<a class="art-video-aviso" href="#video"' + ocultoHasta(p) + (dur ? ' aria-label="¿Preferís escucharlo? Mirá la charla en video, ' + dur + '"' : '') + '>' +
    '<span class="art-video-aviso-mini"><img src="https://i.ytimg.com/vi/' + id + '/mqdefault.jpg" alt="" width="320" height="180">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>' +
    (reloj ? '<span class="art-video-aviso-dur" aria-hidden="true">' + reloj + '</span>' : '') + '</span>' +
    '<span class="art-video-aviso-txt"><span>¿Preferís escucharlo?</span><span>Mirá la charla en video</span></span></a>';
}
function durReloj(iso) {
  var m = String(iso || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/); if (!m) return '';
  var h = +(m[1] || 0), min = +(m[2] || 0), s = +(m[3] || 0), dos = function (n) { return (n < 10 ? '0' : '') + n; };
  return h ? h + ':' + dos(min) + ':' + dos(s) : min + ':' + dos(s);
}
function bloqueVideo(p) {
  if (!p.video) return '';
  var id = esc(p.video), dur = durTexto(p.videoDuracion);
  return `<section class="art-video" id="video"${ocultoHasta(p)} aria-label="Video de la charla">
<p class="art-video-titulo">La charla de la que nació este escrito</p>
<button class="art-video-play" type="button" data-video="${id}" aria-label="Ver el video${p.videoTitulo ? ': ' + esc(p.videoTitulo) : ''}">
<img src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" alt="" loading="lazy" width="1280" height="720" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${id}/hqdefault.jpg'">
<span class="art-video-boton" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg></span>
</button>
<p class="art-video-pie"><span>Mirá la charla completa</span>${dur ? '<span>' + dur + '</span>' : ''}</p>
</section>
<script>(function(){var s=document.querySelector('.art-video');if(!s)return;document.querySelectorAll('.art-video[data-desde], .art-video-aviso[data-desde]').forEach(function(el){if(new Date(el.getAttribute('data-desde'))<=new Date())el.hidden=false;});var b=s.querySelector('.art-video-play');b.addEventListener('click',function(){var f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+b.getAttribute('data-video')+'?autoplay=1&rel=0&playsinline=1';f.title=b.getAttribute('aria-label');f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.referrerPolicy='strict-origin-when-cross-origin';f.className='art-video-marco';b.replaceWith(f);});})();</script>`;
}
function videoLd(p, desc) {
  if (!p.video || videoFuturo(p)) return undefined;
  var id = p.video;
  return { '@type':'VideoObject', name:p.videoTitulo || p.titulo, description:desc,
    thumbnailUrl:['https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg', 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'],
    uploadDate:p.videoFecha, duration:p.videoDuracion || undefined,
    embedUrl:'https://www.youtube.com/embed/' + id, contentUrl:'https://www.youtube.com/watch?v=' + id };
}

function bloqueInvitacion() {
  return `<section class="art-cta-invita"><div class="art-cta-invita-inner">
<span class="invita-titulo">¿Algo de esto te resonó?</span>
<p>Quizás es algo que estás viviendo. Quizás te quedaron dudas, preguntas. O quizás ves las cosas un poco diferente y querés compartirlo, ponerlo en palabras, aclararlo. Me encantaría charlar con vos.</p>
<a class="art-cta-boton" href="/mentoria.html">Quiero una sesión con Adrián</a>
</div></section>`;
}

function paginaEscrito(p) {
  var url = SITE + '/blog/' + p.slug;
  var pilarLabel = p.pilarLabel || PILAR[p.pilar] || p.pilar || '';
  var desc = textoPlano(p.resumen || p.cuerpo).slice(0, 155);
  var ld = jsonLd({ '@context':'https://schema.org', '@type':'Article', headline:p.titulo, description:desc,
    datePublished:p.fecha, dateModified:p.actualizado || p.fecha, author:{'@type':'Person',name:'Adrián'}, publisher:{'@type':'Organization',name:'El Gran Sueño'},
    mainEntityOfPage:url, articleSection:pilarLabel, inLanguage:'es', video:videoLd(p, desc) });
  var meta = [];
  if (p.lectura) meta.push('<span>' + esc(p.lectura) + '</span>');
  if (p.fecha) meta.push('<span>' + fmtFecha(p.fecha) + '</span>');
  return `<!DOCTYPE html><html lang="es"><head>
<title>${esc(p.titulo)} | El Gran Sueño</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(p.titulo)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="El Gran Sueño"><meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.titulo)}">${ogImageMetas(p, 'blog')}${HEAD_COMUN}
${ld}</head><body class="modo-limpio">
${nav('/blog', 'Escritos')}
<main>
<header class="page-header art-hero">
  <div class="art-meta">${pilarLabel ? '<span class="art-pilar">' + esc(pilarLabel) + '</span>' : ''}<div class="art-meta-datos">${meta.join('')}</div></div>
  <h1>${esc(p.titulo)}</h1>
  ${p.pregunta ? '<p class="art-pregunta">' + esc(p.pregunta) + '</p>' : ''}
  ${avisoVideo(p)}
</header>
${p.imagen ? '<figure class="art-portada"><img src="' + esc(p.imagen) + '" alt="" loading="lazy"></figure>' : ''}
<article class="long-prose">
  ${p.resumen ? '<p class="lead">' + esc(p.resumen) + '</p>' : ''}
  ${md(p.cuerpo)}
</article>
${bloqueVideo(p)}
${bloqueRaices(p.raices)}
${bloqueInvitacion()}
</main>
${FOOTER}
${contadorLecturas(p.slug)}</body></html>`;
}

function paginaHuella(p) {
  var url = SITE + '/huella/' + p.slug;
  var desc = textoPlano(p.resumen || p.frase || p.cuerpo).slice(0, 155);
  var ld = jsonLd({ '@context':'https://schema.org', '@type':'Article', headline:p.nombre, description:desc,
    datePublished:p.fecha, author:{'@type':'Person',name:'Adrián'}, publisher:{'@type':'Organization',name:'El Gran Sueño'},
    mainEntityOfPage:url, articleSection:'Huellas de Fe', inLanguage:'es' });
  return `<!DOCTYPE html><html lang="es"><head>
<title>${esc(p.nombre)}, Huella de Fe | El Gran Sueño</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(p.nombre)}, Huella de Fe"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="El Gran Sueño"><meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.nombre)}, Huella de Fe">${ogImageMetas(p, 'huella')}${HEAD_COMUN}
<style>.huella-frase-hero{font-family:var(--f-voz); font-size-adjust: var(--f-voz-ajuste, none); font-variation-settings: var(--f-voz-var, normal);font-style:italic;font-size:clamp(1.3rem,2.8vw,1.9rem);color:rgba(250,248,245,0.9);line-height:1.5;max-width:40rem;margin:1.8rem auto 0}</style>
${ld}</head><body class="modo-limpio">
${nav('/huellas-de-fe.html', 'Huellas')}
<main>
<header class="page-header art-hero">
  <div class="art-meta"><span class="art-pilar">Huella de Fe</span>${p.meta ? '<div class="art-meta-datos"><span>' + esc(p.meta) + '</span></div>' : ''}</div>
  <h1>${esc(p.nombre)}</h1>
  ${p.frase ? '<p class="huella-frase-hero">' + esc(p.frase) + '</p>' : ''}
</header>
${p.imagen ? '<figure class="art-portada"><img src="' + esc(p.imagen) + '" alt="" loading="lazy"></figure>' : ''}
<article class="long-prose">
  ${p.resumen ? '<p class="lead">' + esc(p.resumen) + '</p>' : ''}
  ${md(p.cuerpo)}
</article>
${p.pregunta ? '<section class="art-cta-pregunta"><div class="art-cta-pregunta-inner"><span class="art-cta-eyebrow">Para pensar</span><p>' + esc(p.pregunta) + '</p></div></section>' : ''}
</main>
${FOOTER}
${contadorLecturas(p.slug)}</body></html>`;
}

// ---- Generar ----
function asegurarDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

var escritos = leerJSON('content/blog.json');
var huellas = leerJSON('content/huellas.json');
asegurarDir('blog'); asegurarDir('huella');

var urlsCms = [];
escritos.forEach(function (p) { if (!p.slug) return; fs.writeFileSync(path.join('blog', p.slug + '.html'), paginaEscrito(p)); urlsCms.push({ loc:'/blog/'+p.slug, fecha:p.actualizado || p.fecha }); });
huellas.forEach(function (p) { if (!p.slug) return; fs.writeFileSync(path.join('huella', p.slug + '.html'), paginaHuella(p)); urlsCms.push({ loc:'/huella/'+p.slug, fecha:p.fecha }); });

// ---- Regenerar sitemap.xml (páginas hechas a mano + generadas) ----
// index.html no va: es la misma página que "/" y Google la contaría como duplicada.
// Las páginas hechas a mano van sin lastmod: poner "hoy" en cada build le enseña a Google a ignorarlo.
var EXCLUIR = new Set(['index.html','404.html','googled24ec9b747ece530.html','articulo.html','huella.html','gracias.html','en-camino.html','escuelas.html','escuela-individual.html','registrar-institucion.html']);
var raiz = fs.readdirSync('.').filter(function (f) { return f.endsWith('.html') && !EXCLUIR.has(f); });
var urls = [{ loc: '/', prio: '1.0' }];
raiz.forEach(function (f) { urls.push({ loc: '/' + f, prio: '0.7' }); });
urlsCms.forEach(function (u) { urls.push({ loc: u.loc, fecha: u.fecha, prio: '0.7' }); });

var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(function (u) { return '  <url><loc>' + SITE + u.loc + '</loc>' + (u.fecha ? '<lastmod>' + u.fecha + '</lastmod>' : '') + '<priority>' + u.prio + '</priority></url>'; }).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync('sitemap.xml', xml);

// ---- Datos de cada página (título y descripción), leídos del HTML ya armado ----
function archivoDe(loc) { return loc === '/' ? 'index.html' : (loc.slice(1).endsWith('.html') ? loc.slice(1) : loc.slice(1) + '.html'); }
function datosPagina(loc) {
  var h = ''; try { h = fs.readFileSync(archivoDe(loc), 'utf8'); } catch (e) {}
  var t = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  var d = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  return { loc: loc, titulo: t.replace(/ \| El Gran Sueño$/, '').trim(), desc: d.trim() };
}
var videoDe = {}; escritos.forEach(function (p) { if (p.video && !videoFuturo(p)) videoDe['/blog/' + p.slug] = p.video; });
var escritosTodos = urls.filter(function (u) { return /^\/(escrito-|blog\/)/.test(u.loc); }).map(function (u) { var d = datosPagina(u.loc); d.video = videoDe[u.loc]; return d; });
var huellasTodas = urls.filter(function (u) { return /^\/(huella-|huella\/)/.test(u.loc); }).map(function (u) { return datosPagina(u.loc); });

// ---- Índice fijo en blog.html y huellas-de-fe.html ----
// Las tarjetas se arman con JavaScript; los rastreadores de IA (ChatGPT, Claude, Perplexity) y
// algunos buscadores no lo corren y no veían ningún escrito. Este índice en <noscript> les deja
// los enlaces impresos en el HTML. Se reescribe entero entre las dos marcas en cada build.
function ponerIndice(archivo, items, titulo) {
  var h = fs.readFileSync(archivo, 'utf8');
  var bloque = '<!--indice-->\n<noscript><nav class="indice-fijo" aria-label="' + esc(titulo) + '"><h2>' + esc(titulo) + '</h2><ul>\n' +
    items.map(function (i) { return '<li><a href="' + i.loc + '">' + esc(i.titulo) + '</a>' + (i.desc ? ' <span>' + esc(i.desc) + '</span>' : '') + '</li>'; }).join('\n') +
    '\n</ul></nav></noscript>\n<!--/indice-->';
  if (h.indexOf('<!--indice-->') >= 0) h = h.replace(/<!--indice-->[\s\S]*?<!--\/indice-->/, bloque);
  else h = h.replace('</main>', bloque + '</main>');
  fs.writeFileSync(archivo, h);
}
ponerIndice('blog.html', escritosTodos, 'Todos los escritos');
ponerIndice('huellas-de-fe.html', huellasTodas, 'Todas las huellas de fe');

// ---- llms.txt: la puerta para las IA (formato llmstxt.org) ----
function lineas(items) { return items.map(function (i) { return '- [' + i.titulo + '](' + SITE + i.loc + ')' + (i.desc ? ': ' + i.desc : '') + (i.video ? ' Video: https://www.youtube.com/watch?v=' + i.video : ''); }).join('\n'); }
var principales = ['/', '/manifiesto.html', '/nosotros.html', '/mentoria.html', '/quiero-ser-parte.html', '/historias.html', '/colaborar.html'].map(datosPagina);
var llms = '# El Gran Sueño\n\n' +
  '> Comunidad cristiana en español fundada por Adrián (@adrianencamino). Escritos sobre identidad en Cristo, propósito, ' +
  'descanso y la Gran Comisión: la vida nueva no es intentar alcanzar, es vivir desde lo que Cristo ya nos dio (Colosenses 3:4).\n\n' +
  'Sitio: ' + SITE + '. Contacto: adrian@elgransueno.org. Videos: https://www.youtube.com/@adrianencamino. Instagram: https://instagram.com/adrianencamino.\n\n' +
  '## Páginas principales\n\n' + lineas(principales) + '\n\n' +
  '## Escritos\n\n' + lineas(escritosTodos) + '\n\n' +
  '## Huellas de fe\n\n' + lineas(huellasTodas) + '\n';
fs.writeFileSync('llms.txt', llms);

console.log('BUILD OK - escritos:', escritos.length, '| huellas:', huellas.length, '| URLs en sitemap:', urls.length);
