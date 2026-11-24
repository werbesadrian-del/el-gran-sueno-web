// Avisa a Bing, Yandex, Seznam y Naver (IndexNow) que el sitio cambió, así lo vuelven a leer ya.
// Bing es la base de ChatGPT, Copilot y DuckDuckGo. Correr DESPUÉS de que el deploy esté en vivo:
//   node indexnow.mjs                       (avisa todo el sitemap)
//   node indexnow.mjs <url> <url> ...       (avisa solo esas, más la lista de escritos y llms.txt)
// Desde el 21-nov-2026 lo corre solo .github/workflows/indexnow.yml en cada push que cambia escritos.
// La llave es el archivo 32799ebb68a971a087fbd78360608f16.txt de la raíz (tiene que seguir publicado).
// Google no usa IndexNow: Google lee el sitemap que tiene en Search Console.
import fs from 'fs';
const KEY = '32799ebb68a971a087fbd78360608f16';
const HOST = 'elgransueno.org';
const pedidas = process.argv.slice(2).filter(u => u.startsWith('https://' + HOST));
const urls = pedidas.length
  ? [...new Set([...pedidas, 'https://' + HOST + '/blog.html'])]
  : [...fs.readFileSync('sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
urls.push('https://' + HOST + '/llms.txt');
const r = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: 'https://' + HOST + '/' + KEY + '.txt', urlList: urls }),
});
console.log('IndexNow:', r.status, r.status === 200 || r.status === 202 ? 'aviso recibido (' + urls.length + ' URLs)' : await r.text());
urls.forEach(u => console.log('  ' + u));
