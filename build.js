/* ============================================================================
   EL GRAN SUEÑO — Generador de páginas (build, sin dependencias)
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
<meta name="theme-color" content="#141110">
<meta name="robots" content="index,follow">
<link rel="icon" type="image/png" href="/assets/favicon.png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
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
  <p class="footer-meta">Personas de distintos lugares, caminando juntos en la Gran Comisión · <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.5" style="vertical-align:-2px;opacity:.85;margin:0 .1em" role="img" aria-label="El mundo"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/></svg> · © El Gran Sueño</p>
</footer>
<script src="/assets/egs.js"></script>`;

function jsonLd(o) { return '<script type="application/ld+json">' + JSON.stringify(o) + '</script>'; }

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
var ESTILO_ESCRITO = `<style>
.art-raices{padding:1.5vh 2rem 2vh}
.art-raices-inner{max-width:500px;margin:0 auto;background:linear-gradient(165deg,#241a17 0%,#17110d 100%);border:1px solid rgba(197,122,61,.28);border-radius:14px;padding:1.9rem 1.8rem;position:relative;overflow:hidden}
.art-raices-inner::before{content:"";position:absolute;top:-45%;right:-20%;width:60%;height:80%;background:radial-gradient(circle,rgba(197,122,61,.18),transparent 65%);pointer-events:none}
.art-raices-q{font-family:'Playfair Display',serif;font-weight:700;font-size:clamp(1.05rem,2.5vw,1.32rem);line-height:1.25;color:var(--cream,#F3EFE9);margin:0 0 .7rem;text-wrap:balance;position:relative}
.art-raices-intro{font-family:'DM Sans',sans-serif;font-weight:300;font-size:.9rem;color:rgba(243,239,233,.72);margin:0 0 1.25rem;line-height:1.55;position:relative}
.art-raices-list{list-style:none;margin:0 0 1.3rem;padding:0;display:flex;flex-direction:column;gap:.6rem;position:relative}
.art-raices-list li{font-family:'DM Sans',sans-serif;font-weight:300;font-size:.95rem;color:rgba(243,239,233,.9);line-height:1.4;padding-left:1.15rem;position:relative}
.art-raices-list li::before{content:"—";position:absolute;left:0;color:#C57A3D}
.art-raices-list strong{font-weight:600;color:#E0A868}
.art-raices-cierre{font-family:'DM Sans',sans-serif;font-size:.88rem;color:rgba(243,239,233,.7);line-height:1.65;margin:0;position:relative}
.art-cta-invita{padding:3vh 2rem 6vh}
.art-cta-invita-inner{max-width:600px;margin:0 auto;text-align:center}
.invita-titulo{font-family:'Playfair Display',serif;font-weight:700;font-style:italic;font-size:clamp(1.3rem,3.2vw,1.75rem);color:var(--bordo,#6B1A2B);display:block;margin:0 0 1.1rem}
.art-cta-invita p{font-family:'Cormorant Garamond',serif;font-size:clamp(1.12rem,2.3vw,1.32rem);color:var(--ink-mid,#5a5148);line-height:1.6;max-width:34rem;margin:0 auto 1.9rem}
.art-cta-boton{display:inline-block;font-family:'DM Sans',sans-serif;font-weight:500;font-size:.95rem;letter-spacing:.02em;color:#F3EFE9;background:#2C6A4A;padding:.95rem 2.1rem;border-radius:40px;text-decoration:none;transition:transform .2s,box-shadow .2s,background .2s;box-shadow:0 8px 22px rgba(44,106,74,.22)}
.art-cta-boton:hover{background:#337954;transform:translateY(-1px);box-shadow:0 12px 28px rgba(44,106,74,.30)}
</style>`;

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
    datePublished:p.fecha, author:{'@type':'Person',name:'Adrián'}, publisher:{'@type':'Organization',name:'El Gran Sueño'},
    mainEntityOfPage:url, articleSection:pilarLabel, inLanguage:'es' });
  var meta = [];
  if (p.lectura) meta.push('<span>' + esc(p.lectura) + '</span>');
  if (p.fecha) meta.push('<span>·</span><span>' + fmtFecha(p.fecha) + '</span>');
  return `<!DOCTYPE html><html lang="es"><head>
<title>${esc(p.titulo)} · El Gran Sueño</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(p.titulo)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="El Gran Sueño"><meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.titulo)}">${ogImageMetas(p, 'blog')}${HEAD_COMUN}
${ESTILO_ESCRITO}
${ld}</head><body class="modo-limpio">
${nav('/blog', 'Escritos')}
<main>
<header class="page-header art-hero">
  <div class="art-meta">${pilarLabel ? '<span class="art-pilar">' + esc(pilarLabel) + '</span>' : ''}<div class="art-meta-datos">${meta.join('')}</div></div>
  <h1>${esc(p.titulo)}</h1>
  ${p.pregunta ? '<p class="art-pregunta">' + esc(p.pregunta) + '</p>' : ''}
</header>
${p.imagen ? '<figure class="art-portada"><img src="' + esc(p.imagen) + '" alt="" loading="lazy"></figure>' : ''}
<article class="long-prose">
  ${p.resumen ? '<p class="lead">' + esc(p.resumen) + '</p>' : ''}
  ${md(p.cuerpo)}
</article>
${bloqueRaices(p.raices)}
${bloqueInvitacion()}
</main>
${FOOTER}</body></html>`;
}

function paginaHuella(p) {
  var url = SITE + '/huella/' + p.slug;
  var desc = textoPlano(p.resumen || p.frase || p.cuerpo).slice(0, 155);
  var ld = jsonLd({ '@context':'https://schema.org', '@type':'Article', headline:p.nombre, description:desc,
    datePublished:p.fecha, author:{'@type':'Person',name:'Adrián'}, publisher:{'@type':'Organization',name:'El Gran Sueño'},
    mainEntityOfPage:url, articleSection:'Huellas de Fe', inLanguage:'es' });
  return `<!DOCTYPE html><html lang="es"><head>
<title>${esc(p.nombre)} · Huella de Fe · El Gran Sueño</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(p.nombre)} · Huella de Fe"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:site_name" content="El Gran Sueño"><meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(p.nombre)} · Huella de Fe">${ogImageMetas(p, 'huella')}${HEAD_COMUN}
<style>.huella-frase-hero{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(1.3rem,2.8vw,1.9rem);color:rgba(243,239,233,.9);line-height:1.5;max-width:40rem;margin:1.8rem auto 0}</style>
${ld}</head><body class="modo-limpio">
${nav('/huellas-de-fe.html', 'Huellas')}
<main>
<header class="page-header art-hero">
  <div class="art-meta"><span class="art-pilar">Huella de Fe</span>${p.meta ? '<div class="art-meta-datos"><span>' + esc(p.meta) + '</span></div>' : ''}</div>
  <h1>${esc(p.nombre)}</h1>
  ${p.frase ? '<p class="huella-frase-hero">«' + esc(p.frase) + '»</p>' : ''}
</header>
${p.imagen ? '<figure class="art-portada"><img src="' + esc(p.imagen) + '" alt="" loading="lazy"></figure>' : ''}
<article class="long-prose">
  ${p.resumen ? '<p class="lead">' + esc(p.resumen) + '</p>' : ''}
  ${md(p.cuerpo)}
</article>
${p.pregunta ? '<section class="art-cta-pregunta"><div class="art-cta-pregunta-inner"><span class="art-cta-eyebrow">Para pensar</span><p>' + esc(p.pregunta) + '</p></div></section>' : ''}
</main>
${FOOTER}</body></html>`;
}

// ---- Generar ----
function asegurarDir(d) { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

var escritos = leerJSON('content/blog.json');
var huellas = leerJSON('content/huellas.json');
asegurarDir('blog'); asegurarDir('huella');

var urlsCms = [];
escritos.forEach(function (p) { if (!p.slug) return; fs.writeFileSync(path.join('blog', p.slug + '.html'), paginaEscrito(p)); urlsCms.push({ loc:'/blog/'+p.slug, fecha:p.fecha }); });
huellas.forEach(function (p) { if (!p.slug) return; fs.writeFileSync(path.join('huella', p.slug + '.html'), paginaHuella(p)); urlsCms.push({ loc:'/huella/'+p.slug, fecha:p.fecha }); });

// ---- Regenerar sitemap.xml (páginas hechas a mano + generadas) ----
var EXCLUIR = new Set(['articulo.html','huella.html','gracias.html']);
var raiz = fs.readdirSync('.').filter(function (f) { return f.endsWith('.html') && !EXCLUIR.has(f); });
var hoy = new Date().toISOString().slice(0, 10);
var urls = raiz.map(function (f) { return { loc: '/' + f, fecha: hoy, prio: f === 'index.html' ? '1.0' : '0.7' }; });
urls.push({ loc: '/', fecha: hoy, prio: '1.0' });
urlsCms.forEach(function (u) { urls.push({ loc: u.loc, fecha: u.fecha || hoy, prio: '0.7' }); });

var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(function (u) { return '  <url><loc>' + SITE + (u.loc === '/' ? '/' : u.loc) + '</loc><lastmod>' + u.fecha + '</lastmod><priority>' + (u.prio || '0.7') + '</priority></url>'; }).join('\n') +
  '\n</urlset>\n';
fs.writeFileSync('sitemap.xml', xml);

console.log('BUILD OK — escritos:', escritos.length, '| huellas:', huellas.length, '| URLs en sitemap:', urls.length);
