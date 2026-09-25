/* ============================================================================
   EL GRAN SUEÑO — Tarjetas sociales (Open Graph) generadas EN EL BUILD
   ----------------------------------------------------------------------------
   Sin navegador: satori (HTML->SVG) + resvg (SVG->PNG a 2x, bien nítidas).
   Corre en Netlify, así que las tarjetas 1200x630 (renderizadas a 2400x1260)
   se crean solas al publicar desde el panel, el celular o donde sea.
     node og-card.mjs        -> genera todas (escritos + huellas + páginas fijas)
   Escribe: assets/og/blog/<slug>.png, assets/og/huella/<slug>.png, assets/og/pagina/<key>.png
   ============================================================================ */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import jpeg from 'jpeg-js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const F = (p) => fs.readFileSync(path.join(ROOT, 'assets', 'fonts', p));

const FONTS = [
  { name: 'Playfair Display', data: F('PlayfairDisplay-400.ttf'), weight: 400, style: 'normal' },
  { name: 'DM Sans', data: F('DMSans-400.ttf'), weight: 400, style: 'normal' },
  { name: 'DM Sans', data: F('DMSans-500.ttf'), weight: 500, style: 'normal' },
  { name: 'Cormorant Garamond', data: F('Cormorant-400-italic.ttf'), weight: 400, style: 'italic' },
];

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const fmtFecha = (f) => { if (!f) return ''; const p = String(f).split('-'); return MESES[(+p[1]) - 1] + ' ' + p[0]; };
const esc = (s) => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
// Título largo => letra más chica, para que siempre entre lindo.
const tamTitulo = (t) => { const n = (t||'').length; if (n<=30) return 70; if (n<=45) return 64; if (n<=62) return 57; if (n<=80) return 50; return 44; };

function markup({ pilar, meta, titulo, pregunta }) {
  const pilarDiv = pilar ? `<div style="font-family:'DM Sans';font-weight:500;color:#74ACDF;font-size:26px;letter-spacing:1px;margin-bottom:8px">${esc(pilar)}</div>` : '';
  const metaDiv  = meta  ? `<div style="font-family:'DM Sans';color:rgba(250,248,245,0.55);font-size:22px;margin-bottom:40px">${esc(meta)}</div>` : '';
  const pregDiv  = pregunta ? `<div style="font-family:'Cormorant Garamond';font-style:italic;color:rgba(250,248,245,0.72);font-size:40px;margin-top:34px;text-align:center">${esc(pregunta)}</div>` : '';
  const s = `<div style="width:1200px;height:630px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 104px;background-color:#070505;background-image:linear-gradient(150deg,#070505 52%,#3A0E18 100%)">` +
    pilarDiv + metaDiv +
    `<div style="font-family:'Playfair Display';color:#FAF8F5;font-size:${tamTitulo(titulo)}px;line-height:1.14;text-align:center;max-width:920px;display:flex">${esc(titulo)}</div>` +
    pregDiv +
    `</div>`;
  return html(s);
}

async function tarjeta(datos, outFile) {
  const svg = await satori(markup(datos), { width: 1200, height: 630, fonts: FONTS });
  const img = new Resvg(svg, { background: '#070505', fitTo: { mode: 'width', value: 1200 } }).render();
  // JPEG (sin canal alfa): Facebook a veces no muestra PNG con transparencia.
  const jpg = jpeg.encode({ data: img.pixels, width: img.width, height: img.height }, 90);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, jpg.data);
}

const leer = (f) => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'content', f), 'utf8')).posts || []; } catch (e) { return []; } };

// Páginas fijas del sitio (no salen del panel): se toma su título y bajada del propio HTML.
const PAGINAS = [
  { key: 'huellas',          archivo: 'huellas-de-fe.html' },
  { key: 'escritos',         archivo: 'blog.html' },
  { key: 'mentoria',         archivo: 'mentoria.html' },
  { key: 'colaborar',        archivo: 'colaborar.html' },
  { key: 'nosotros',         archivo: 'nosotros.html' },
  { key: 'escuelas',         archivo: 'escuelas.html' },
  { key: 'quiero-ser-parte', archivo: 'quiero-ser-parte.html' },
];
function ogDe(htmlStr, prop) { const m = htmlStr.match(new RegExp('property="og:' + prop + '" content="([^"]*)"')); return m ? m[1] : ''; }

const soloPrueba = process.argv.includes('--prueba');
let n = 0;

for (const p of leer('blog.json')) {
  const out = soloPrueba ? path.join(ROOT, '..', 'prueba-' + p.slug + '.jpg') : path.join(ROOT, 'assets', 'og', 'blog', p.slug + '.jpg');
  await tarjeta({ pilar: p.pilarLabel || p.pilar || '', meta: [p.lectura, fmtFecha(p.fecha)].filter(Boolean).join('     '), titulo: p.titulo, pregunta: p.pregunta }, out);
  console.log('escrito ->', p.slug); n++;
  if (soloPrueba) break;
}

if (!soloPrueba) {
  for (const p of leer('huellas.json')) {
    await tarjeta({ pilar: 'Huella de Fe', meta: p.meta || fmtFecha(p.fecha), titulo: p.nombre, pregunta: p.frase || '' }, path.join(ROOT, 'assets', 'og', 'huella', p.slug + '.jpg'));
    console.log('huella  ->', p.slug); n++;
  }
  for (const pg of PAGINAS) {
    let htmlStr = ''; try { htmlStr = fs.readFileSync(path.join(ROOT, pg.archivo), 'utf8'); } catch (e) { continue; }
    const titulo = ogDe(htmlStr, 'title').replace(/\s*[·|]\s*El Gran Sueño\s*$/, '').trim() || 'El Gran Sueño';
    await tarjeta({ pilar: 'El Gran Sueño', meta: '', titulo, pregunta: ogDe(htmlStr, 'description') }, path.join(ROOT, 'assets', 'og', 'pagina', pg.key + '.jpg'));
    console.log('página  ->', pg.key); n++;
  }
  // El resto de las páginas fijas que apuntan a su propia tarjeta (escritos, huellas y demás):
  // la tarjeta se llama como el archivo y sale de su título y bajada.
  const hechas = new Set(PAGINAS.map((pg) => pg.archivo));
  for (const archivo of fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && !hechas.has(f))) {
    const htmlStr = fs.readFileSync(path.join(ROOT, archivo), 'utf8');
    const key = archivo.replace(/\.html$/, '');
    if (!htmlStr.includes('/assets/og/pagina/' + key + '.jpg')) continue;
    const pilar = archivo.startsWith('huella-') ? 'Huella de Fe' : archivo.startsWith('escrito-') ? 'Escritos' : 'El Gran Sueño';
    const titulo = ogDe(htmlStr, 'title').replace(/\s*[·|]\s*El Gran Sueño\s*$/, '').trim() || 'El Gran Sueño';
    await tarjeta({ pilar, meta: '', titulo, pregunta: ogDe(htmlStr, 'description') }, path.join(ROOT, 'assets', 'og', 'pagina', key + '.jpg'));
    console.log('página  ->', key); n++;
  }
}

// La imagen de marca (assets/og-marca.jpg), la que sale cuando una página no tiene otra.
// Se genera una vez a mano: node og-card.mjs --marca
if (process.argv.includes('--marca')) {
  await tarjeta({ pilar: '', meta: '', titulo: 'El Gran Sueño', pregunta: 'Viviendo desde la Nueva Vida.' }, path.join(ROOT, 'assets', 'og-marca.jpg'));
  console.log('marca   -> assets/og-marca.jpg'); n++;
}

console.log('Tarjetas generadas:', n);
